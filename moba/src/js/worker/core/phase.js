// @flow

import _ from 'underscore';
import {PHASE, PLAYER, g, helpers} from '../../common';
import {contractNegotiation, draft, finances, freeAgents, league, player, season, team} from '../core';
import {idb} from '../db';
import {account, env, genMessage, local, lock, logEvent, random, toUI, updatePhase, updatePlayMenu, updateStatus} from '../util';
import type {Conditions, Phase, UpdateEvents} from '../../common/types';

/**
 * Common tasks run after a new phrase is set.
 *
 * This updates the phase, executes a callback, and (if necessary) updates the UI. It should only be called from one of the NewPhase* functions defined below.
 *
 * @memberOf core.phase
 * @param {number} phase Integer representing the new phase of the game (see other functions in this module).
 * @param {string=} url Optional URL to pass to api.realtimeUpdate for redirecting on new phase. If undefined, then the current page will just be refreshed.
 * @param {Array.<string>=} updateEvents Array of strings.
 * @return {Promise}
 */
async function finalize(phase: Phase, url: string, updateEvents: UpdateEvents = [], conditions: Conditions) {
    await updateStatus('Saving...');
console.log(JSON.parse(JSON.stringify(g.confs)));
console.log(g.phase);
    // Set phase before saving to database
    await league.setGameAttributes({
        phase,
    });

    // Fill only in preseason, because not much changes before then
    await idb.cache.flush();
    if (phase === g.PHASE.PRESEASON) {
        await idb.cache.fill();
    }

    lock.set('newPhase', false);
    await updatePhase();
    await updatePlayMenu();
    await updateStatus('Idle');

    updateEvents.push('newPhase');
    toUI(['realtimeUpdate', updateEvents, url], conditions);

    // If auto-simulating, initiate next action

	let timeOut = 1000;
	if (g.gameType == 1) {
		timeOut = 2000;
	} else if (g.gameType == 5) {
		timeOut = 4000;
	} else if (g.gameType == 6) {
		timeOut = 4000;
	} else if (g.gameType == 7) {
		timeOut = 10000;
	}

    if (local.autoPlaySeasons > 0) {
        // Not totally sure why setTimeout is needed, but why not?
        setTimeout(() => {
            league.autoPlay(conditions);
//        }, 100);
        }, timeOut);
    }
}

async function newPhasePreseason(conditions: Conditions) {
    await freeAgents.autoSign();

	let split = 'Spring'
	if (g.gameType >= 6) {
			split = 'Spring';
	} else {
			split  = 'Summer';
	}

    await league.setGameAttributes({season: g.season + 1, seasonSplit: split});
	var c = idb.cache.champions.getAll();
	var cp = idb.cache.championPatch.getAll();
	var i,j;
	var cpSorted;
	var topADC,topMID,topJGL,topTOP,topSUP;

	cpSorted = [];

	for (i = 0; i < _.size(cp); i++) {
		cpSorted.push({"champion": cp[i].champion,"cpid": cp[i].cpid,"rank": cp[i].rank,"role": cp[i].role});
	}

	cpSorted.sort((a, b) => a.rank - b.rank);

	topADC = [];
	topMID = [];
	topJGL = [];
	topTOP = [];
	topSUP = [];

	for (i = 0; i < _.size(cpSorted); i++) {
		if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
			for (j = 0; j < c.length; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topADC.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
		if ((cpSorted[i].role == "Middle") && (topMID.length < 5) ) {
			for (j = 0; j < c.length; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topMID.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
		if ((cpSorted[i].role == "Jungle") && (topJGL.length < 5) ) {
			for (j = 0; j < c.length; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topJGL.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
		if ((cpSorted[i].role == "Top") && (topTOP.length < 5) ) {
			for (j = 0; j < c.length; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topTOP.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
		if ((cpSorted[i].role == "Support") && (topSUP.length < 5) ) {
			for (j = 0; j < c.length; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topSUP.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
	}

    const tids: number[] = _.range(g.numTeams);

    let scoutingRankTemp;
    await Promise.all(tids.map(async (tid) => {
        // Only actually need 3 seasons for userTid, but get it for all just in case there is a
        // skipped season (alternatively could use cursor to just find most recent season, but this
        // is not performance critical code)
        const teamSeasons = await idb.getCopies.teamSeasons({tid, seasons: [g.season - 3, g.season - 1]});
        const prevSeason = teamSeasons[teamSeasons.length - 1];

        // Only need scoutingRank for the user's team to calculate fuzz when ratings are updated below.
        // This is done BEFORE a new season row is added.
        if (tid === g.userTid) {
            scoutingRankTemp = finances.getRankLastThree(teamSeasons, "expenses", "scouting");
        }

        await idb.cache.teamSeasons.add(team.genSeasonRow(tid, "" , "", "", prevSeason));
        await idb.cache.teamStats.add(team.genStatsRow(tid));
    }));
    const scoutingRank = scoutingRankTemp;
    if (scoutingRank === undefined) {
        throw new Error('scoutingRank should be defined');
    }

    const teamSeasons = await idb.cache.teamSeasons.indexGetAll('teamSeasonsBySeasonTid', [`${g.season - 1}`, `${g.season}`]);
    const coachingRanks = teamSeasons.map(teamSeason => teamSeason.expenses.coaching.rank);

    // Loop through all non-retired players
    const players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
    for (const p of players) {
        // Update ratings
        player.addRatingsRow(p, scoutingRank);
        player.develop(p, 1, false, coachingRanks[p.tid], topADC,topMID,topJGL,topTOP,topSUP);

        // Update player values after ratings changes
        await player.updateValues(p);

        // Add row to player stats if they are on a team
        if (p.tid >= 0) {
            await player.addStatsRow(p, false);
        }

        await idb.cache.players.put(p);
    }


 // prep for saving stats by year or deleting stats
  const championPatch = await idb.cache.championPatch.getAll();
  //console.log(championPatch);
  for (const cp of championPatch) {
  //  console.log(cp);
    let statRow = {};
    statRow.year = g.season-1;
    statRow.fg = cp.fg;
    statRow.fga = cp.fga;
    statRow.gp = cp.gp;
    statRow.fgp = cp.fgp;
    statRow.won = cp.won;
    statRow.min = cp.min;
    statRow.tp = cp.tp;
//console.log(statRow);
    if (cp.stats == undefined) {
      cp.stats = [];
  //    console.log(cp);
      cp.stats.push(statRow);
    } else {
      cp.stats.push(statRow);
    }

    cp.fg = 0;
    cp.fga = 0;
    cp.fgp = 0;
    cp.gp = 0;
    cp.min = 0;
    cp.won = 0;
    cp.tp = 0;
//console.log(cp);
    await idb.cache.championPatch.put(cp);
  }

    if (local.autoPlaySeasons > 0) {
        local.autoPlaySeasons -= 1;
    }

    if (env.enableLogging && !env.inCordova) {
        toUI(['emit', 'showAd', 'modal', local.autoPlaySeasons], conditions);
    }

    return [undefined, ["playerMovement"]];
}

async function newPhaseRegularSeason() {

	await league.setGameAttributes({playoffType: ''});

	let split = 'Spring'
	if (g.gameType >= 6) {

			split = 'Spring';
	} else {
			split  = 'Summer';
	}


  let players = await idb.getCopies.players({statsTid: g.userTid});

  console.log(players);

  if (g.season > g.startingSeason ) {
    if (g.autoDeleteUnnotableRetiredPlayers != undefined) {
      console.log(g.autoDeleteUnnotableRetiredPlayers);
      if (g.autoDeleteUnnotableRetiredPlayers) {
        console.log(g.autoDeleteUnnotableRetiredPlayers);
        await idb.league.tx(["players"], "readwrite", tx => {
          tx.players.index("tid").iterate(PLAYER.RETIRED, p => {

            if (
              p.awards.length === 0 &&
              !p.statsTids.includes(g.userTid)
            ) {
              console.log("DELETED: " + p.pid);
              tx.players.delete(p.pid);
            }
          });
        });
        let players3 = await idb.getCopies.players({statsTid: g.userTid});

        console.log(players3);
        await idb.cache.flush();

        let players4 = await idb.getCopies.players({statsTid: g.userTid});

        console.log(players4);

        // Without this, cached values will still exist
        await idb.cache.fill();
      }
    }
  }
  let players2 = await idb.getCopies.players({statsTid: g.userTid});

  console.log(players2);

if (g.autoDeleteOldBoxScores != undefined) {
  if (g.autoDeleteOldBoxScores)  {
    await idb.league.tx("games","readwrite", tx => {
      return tx.games.clear();
      })
  }
}

	await league.setGameAttributes({seasonSplit: split});

    const teams = await idb.cache.teams.getAll();
    await season.setSchedule(season.newSchedule(teams));

    // First message from owner
    if (g.showFirstOwnerMessage) {
        await genMessage({wins: 0, playoffs: 0, money: 0});
    } else {
        const nagged = await idb.meta.attributes.get('nagged');
    }

    return [undefined, ["playerMovement"]];
}

async function newPhaseMSI(conditions: Conditions, liveGameSim?: boolean = false) {
  console.log(g.confs);

    // Set playoff matchups
    const teams = helpers.orderBySplitWinp(await idb.getCopies.teamsPlus({
        attrs: ["tid", "cid"],
		seasonAttrs: ["winp","won","cidNext","cidStart", "cidMid","pointsYear","pointsSpring","pointsSummer","wonSummer", "lostSpring","lostSummer", "wonSpring", "winp", "winpSpring", "winpSummer"],
		stats: ["kda","fg","fga","fgp","oppTw","pf"],
        season: g.season,
    }));
//console.log(g.confs);
    // Add entry for wins for each team, delete seasonAttrs just used for sorting
    for (let i = 0; i < teams.length; i++) {
        teams[i].won = 0;
        teams[i].winp = teams[i].seasonAttrs.winp;
        teams[i].pointsSpring = teams[i].seasonAttrs.pointsSpring;
        teams[i].pointsSummer = teams[i].seasonAttrs.pointsSummer;
        teams[i].pointsYear = teams[i].seasonAttrs.pointsYear;
        delete teams[i].seasonAttrs;
    }

      const {series,
		tidPlayoffs,
		tidPromotion,
		tidDemotion,
		tidRegionals,
		tidLCSChamp,
		tidLCS,
		tidLCSPromotion,
		tidCSstay,
		tidCS,
		tidCSPromotion,
		tidLadder,
		tidCSPromotionTop,
		tidLCS2R,
		tidLCS2REU,
		tidLCSEU,
		tidLCSStay,
		tidLCSStayEU,
		tidLCK,
		tidLPL,
		tidLMS,
		tidWC,
	  } = season.genPlayoffSeries(teams);
console.log(g.confs);
    for (const tid of tidPlayoffs) {

			logEvent({
				type: "playoffs",
				text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[tid], g.season]) + '">' + g.teamRegionsCache[tid] + '</a> made the <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">playoffs</a>.',
//				text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[tid], g.season])}">${g.teamNamesCache[tid]}</a> made the <a href="${helpers.leagueUrl(["playoffs", g.season])}">playoffs</a>.`,
				showNotification: tid === g.userTid,
				tids: [tid],
			}, conditions);

    }
//console.log(g.confs);
	if (g.seasonSplit == "Spring") {
		await idb.cache.msiSeries.put({
			season: g.season,
			currentRound: 0,
			seriesMSI: series,
		});
	} else {
		await idb.cache.playoffSeries.put({
			season: g.season,
			currentRound: 0,
			series,
		});
	}

    // Add row to team stats and team season attributes

    const teamSeasons = await idb.cache.teamSeasons.indexGetAll('teamSeasonsBySeasonTid', [`${g.season}`, `${g.season},Z`]);
//console.log(g.confs);
    for (const teamSeason of teamSeasons) {
						if (tidLCS2R.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = 24;
								teamSeason.playoffRoundsWonNALCS = 0;
								if (g.seasonSplit == "Spring") {
									teamSeason.pointsSpring = 10;
								} else {
									teamSeason.pointsSummer = 20;
								}
								teamSeason.playoffRoundsWonNALCSStay = true;
							// More hype for making the playoffs
							teamSeason.hype *= 0.80;
							teamSeason.hype += 0.20;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLCSStay.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = 18;
							teamSeason.playoffRoundsWonNALCSStay = true;
							teamSeason.playoffRoundsWonMaybePlayoffs = true;

						} else if (tidLCSStayEU.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWonNALCSStayEU = true;
							teamSeason.playoffRoundsWonMaybePlayoffs = true;
						} else if (tidLCS2REU.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = 24;
								teamSeason.playoffRoundsWonEULCS = 0;
								if (g.seasonSplit == "Spring") {
									teamSeason.pointsSpring = 10;
								} else {
									teamSeason.pointsSummer = 20;
								}
							// More hype for making the playoffs
							teamSeason.hype *= 0.80;
							teamSeason.hype += 0.20;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLCSChamp.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));

							teamSeason.playoffRoundsWon = 24;
							teamSeason.playoffRoundsWonNALCS = 0;
							if (g.seasonSplit == "Spring") {
								teamSeason.pointsSpring = 10;
							} else {
								teamSeason.pointsSummer = 20;
							}
							// More hype for making the playoffs
							teamSeason.hype *= 0.80;
							teamSeason.hype += 0.20;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLCSPromotion.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							if (teamSeason.cid == 0) {
								teamSeason.playoffRoundsWon = 17;
								teamSeason.playoffRoundsWonNALCSPr = 0;
							} else {
								teamSeason.playoffRoundsWon = 16;
								teamSeason.playoffRoundsWonNALCSPr = 0;
							}
							// More hype for making the playoffs
							teamSeason.hype *= .80;
							teamSeason.hype += .13;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLCS.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = 20;
								teamSeason.playoffRoundsWonNALCS = 0;
								if (g.seasonSplit == "Spring") {
									teamSeason.pointsSpring = 10;
								} else {
									teamSeason.pointsSummer = 20;
								}
								teamSeason.playoffRoundsWonNALCSStay = true;
							// More hype for making the playoffs
							teamSeason.hype *= .80;
							teamSeason.hype += .15;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLCSEU.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = 20;
								teamSeason.playoffRoundsWonEULCS = 0;
								if (g.seasonSplit == "Spring") {
									teamSeason.pointsSpring = 10;
								} else {
									teamSeason.pointsSummer = 20;
								}
							// More hype for making the playoffs
							teamSeason.hype *= .80;
							teamSeason.hype += .15;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidCS.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = 14;
							teamSeason.ladderCSLCS = 1;
							// More hype for making the playoffs
							teamSeason.hype *= .80;
							teamSeason.hype += .10;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidCSstay.indexOf(teamSeason.tid) >= 0) {
								await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							// reall want to change to 13 (stay at CS, not demoted)
							teamSeason.playoffRoundsWon = 13;
							teamSeason.playoffRoundsWonNACSStay = true;
							// More hype for making the playoffs
							teamSeason.hype *= .80;
							teamSeason.hype += .10;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidCSPromotionTop.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = 6;
							// More hype for making the playoffs
							teamSeason.hype *= .80;
							teamSeason.hype += .03;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidCSPromotion.indexOf(teamSeason.tid) >= 0) {
								await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							if (teamSeason.cid == 1) {
								teamSeason.playoffRoundsWon = 5;
								teamSeason.playoffRoundsWonNACSPrA = 0;
							} else {
								teamSeason.playoffRoundsWon = 4;
								teamSeason.playoffRoundsWonNACSPrA = 0;
							}
							// More hype for making the playoffs
							teamSeason.hype *= .80;
							teamSeason.hype += .03;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLadder.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = -1;
							teamSeason.playoffRoundsWonNALadderStay = true;
							// More hype for making the playoffs
							teamSeason.hype *= .80;
							teamSeason.hype += .0;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLCK.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));

							teamSeason.playoffRoundsWon = 24;

								teamSeason.playoffRoundsWonLCK = 0;
								if (g.seasonSplit == "Spring") {
									teamSeason.pointsSpring = 10;
								} else {
									teamSeason.pointsSummer = 20;
								}
							// More hype for making the playoffs
							teamSeason.hype *= 0.80;
							teamSeason.hype += 0.20;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLPL.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));

							teamSeason.playoffRoundsWon = 24;
								teamSeason.playoffRoundsWonLPL = 0;
								// current LPL uses different playoff structure
								if (g.seasonSplit == "Spring") {
									teamSeason.pointsSpring = 10;
								} else {
									teamSeason.pointsSummer = 20;
								}
							// More hype for making the playoffs
							teamSeason.hype *= 0.80;
							teamSeason.hype += 0.20;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidLMS.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
							teamSeason.playoffRoundsWon = 24;
								teamSeason.playoffRoundsWonLMS = 0;
								if (g.seasonSplit == "Spring") {
									teamSeason.pointsSpring = 10;
								} else {
									teamSeason.pointsSummer = 20;
								}
							// More hype for making the playoffs
							teamSeason.hype *= 0.80;
							teamSeason.hype += 0.20;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidWC.indexOf(teamSeason.tid) >= 0) {
							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));
								teamSeason.playoffRoundsWonWorldsReg = 0;
							// More hype for making the playoffs
							teamSeason.hype *= 0.80;
							teamSeason.hype += 0.20;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else if (tidRegionals.indexOf(teamSeason.tid) >= 0) {

							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));

							teamSeason.playoffRoundsWon = 0;
							teamSeason.playoffRoundsWonRegionals = true;

							// More hype for making the playoffs
							teamSeason.hype += 0.05;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}

						} else if (tidPlayoffs.includes(teamSeason.tid)) {

							await idb.cache.teamStats.add(team.genStatsRow(teamSeason.tid, true));

							if (g.gameType == 6 && g.seasonSplit == "Spring") {
								teamSeason.playoffRoundsWonMSI = 0;
							} else {
								teamSeason.playoffRoundsWon = 0;
							}

							// More hype for making the playoffs
							teamSeason.hype += 0.05;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else {
							// Less hype for missing the playoffs
							teamSeason.playoffRoundsWon = -1;

							teamSeason.hype -= 0.05;
							if (teamSeason.hype < 0) {
								teamSeason.hype = 0;
							}
						}
        await idb.cache.teamSeasons.put(teamSeason);
    }
//console.log(g.confs);
    // Add row to player stats
    await Promise.all(tidPlayoffs.map(async (tid) => {
        const players = await idb.cache.players.indexGetAll('playersByTid', tid);
        for (const p of players) {
            await player.addStatsRow(p, true);
            await idb.cache.players.put(p);
        }
    }));

	//console.log("finished?");
    await Promise.all([
        finances.assessPayrollMinLuxury(),
        season.newSchedulePlayoffsDay(),
    ]);
    // Don't redirect if we're viewing a live game now
    let url;
    if (!liveGameSim) {

		if (g.seasonSplit == "Spring") {
			url = helpers.leagueUrl(["playoffs2"]);
		} else {
			url = helpers.leagueUrl(["playoffs"]);
		}
    }
console.log(g.confs);
    return [url, ["teamFinances"]];
}

// add newSeason (create schedule, but no new stats)

async function newPhaseMidseason(conditions: Conditions) {

    await season.doAwardsMSI(conditions);

    const teams = await idb.getCopies.teamsPlus({
        attrs: ["tid","cid"],
        seasonAttrs: ["playoffRoundsWon","ladderCSLCS"],
        season: g.season,
    });

	var champRound, tid;

	// update conferences in Ladder
	// only used for type 7
		if (g.gameType == 1 || g.gameType == 7) {
			    var newLCS, newCS, newLadder;
			    var newLCSCidLCS, newCSCidLCS, newLadderCidLCS;
				var teamSeason;
				var teamCurrent;
				newLCS = [];
				newCS = [];
				newLadder = [];
				newLCSCidLCS = [];
				newCSCidLCS = [];
				newLadderCidLCS = [];

//console.log(teams);
				for (let i = 0; i < teams.length; i++) {
				//push for each
					if (g.gameType < 7) {
						if (teams[i].seasonAttrs.playoffRoundsWon > 16) {
							newLCS.push(teams[i].tid);
						} else if (teams[i].seasonAttrs.playoffRoundsWon > 6) {
							newCS.push(teams[i].tid);
						} else  {
							newLadder.push(teams[i].tid);
						}
					} else if (g.gameType == 7) {
						if (teams[i].seasonAttrs.ladderCSLCS == 0) {
								newLCS.push(teams[i].tid);
								newLCSCidLCS.push(Math.floor(teams[i].cid/3));
						} else if (teams[i].seasonAttrs.ladderCSLCS == 1) {
								newCS.push(teams[i].tid);
								newCSCidLCS.push(Math.floor(teams[i].cid/3));
						} else  {
								newLadder.push(teams[i].tid);
								newLadderCidLCS.push(Math.floor(teams[i].cid/3));
						}
        //    console.log(newLCS);
        //    console.log(newLCSCidLCS);
        //    console.log(newCS);
        //    console.log(newCSCidLCS);
        ////// /   console.log(newLadder);
        ///    console.log(newLadderCidLCS);

					}
				}

				for (let i = 0; i < newLCS.length; i++) {

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${newLCS[i]}`);

					if (newLCSCidLCS.length>0) {
						teamSeason.cidMid = 0+newLCSCidLCS[i]*3;
					} else {
						teamSeason.cidMid = 0;
					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamCurrent = await idb.cache.teams.get(newLCS[i]);

					if (newLCSCidLCS.length>0) {
						teamCurrent.cid = 0+newLCSCidLCS[i]*3;
					} else {
						teamCurrent.cid = 0;
					}
					await idb.cache.teams.put(teamCurrent);

				}

				for (let i = 0; i < newCS.length; i++) {
					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${newCS[i]}`);

					if (newCSCidLCS.length>0) {
						teamSeason.cidMid = 1+newCSCidLCS[i]*3;
					} else {
						teamSeason.cidMid = 1;
					}

					await idb.cache.teamSeasons.put(teamSeason);

					teamCurrent = await idb.cache.teams.get(newCS[i]);

					if (newCSCidLCS.length>0) {
						teamCurrent.cid = 1+newCSCidLCS[i]*3;
					} else {
						teamCurrent.cid = 1+ newLCS[i] - newLCS[i]%3;
					}

					await idb.cache.teams.put(teamCurrent);

				}

				for (let i = 0; i < newLadder.length; i++) {

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${newLadder[i]}`);
					if (newLadderCidLCS.length>0) {
						teamSeason.cidMid = 2+newLadderCidLCS[i]*3;
					} else {
						teamSeason.cidMid = 2;
					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamCurrent = await idb.cache.teams.get(newLadder[i]);

					if (newLadderCidLCS.length>0) {
						teamCurrent.cid = 2+newLadderCidLCS[i]*3;
					} else {
						teamCurrent.cid = 2;
					}

					await idb.cache.teams.put(teamCurrent);
				}
			}

    await freeAgents.autoSign();
	await league.setGameAttributes({seasonSplit: 'Summer'});

    // Loop through all non-retired players
    const players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
    for (const p of players) {

        // Add row to player stats if they are on a team
        if (p.tid >= 0) {
            await player.addStatsRow(p, false);
        }
        await idb.cache.players.put(p);
    }

    var url = helpers.leagueUrl(["history_all_MSI"]);

    return [url, ["playerMovement"]];
}

async function newPhaseSecondHalf() {

		await league.setGameAttributes({seasonSplit: 'Summer'});
		await league.setGameAttributes({playoffType: ''});

    const teams = await idb.cache.teams.getAll();
    await season.setSchedule(season.newSchedule(teams));


    return [undefined, ["playerMovement"]];
}

// update standings to show spring and summer splits seperate

async function newPhasePlayoffs(conditions: Conditions, liveGameSim?: boolean = false) {

console.log(g.confs);
	await league.setGameAttributes({seasonSplit: 'Summer'});
    account.checkAchievement.eating(conditions);
console.log(g.confs);

	return newPhaseMSI(conditions,liveGameSim );

}

async function newPhaseBeforeDraft(conditions: Conditions, liveGameSim?: boolean = false) {


	await league.setGameAttributes({seasonSplit: 'Summer'});


        account.checkAchievement.fed(conditions);
        account.checkAchievement.first_blood(conditions);
        account.checkAchievement.killing_spree(conditions);
        account.checkAchievement.rampage(conditions);
        account.checkAchievement.unstoppable(conditions);
        account.checkAchievement.dominating(conditions);
        account.checkAchievement.godlike(conditions);
        account.checkAchievement.legendary(conditions);
        account.checkAchievement.ace(conditions);
        account.checkAchievement.penta_kill(conditions);

        account.checkAchievement.wood(conditions);
        account.checkAchievement.bronze(conditions);
        account.checkAchievement.silver(conditions);
        account.checkAchievement.gold(conditions);
        account.checkAchievement.platinum(conditions);
        account.checkAchievement.diamond(conditions);
        account.checkAchievement.master(conditions);
        account.checkAchievement.challenger(conditions);
        account.checkAchievement.pro(conditions);
        account.checkAchievement.ladder_climber(conditions);
        account.checkAchievement.ladder_climber2(conditions);
        account.checkAchievement.world_beater(conditions);

    await season.doAwards(conditions);


    const teams = await idb.getCopies.teamsPlus({
        attrs: ["tid","cid"],
        seasonAttrs: ["playoffRoundsWon","playoffRoundsWonWorlds","ladderCSLCS","pointsSummer"],
        season: g.season,
    });

	var champRound, tid;
    // Give award to all players on the championship team
	for (let i = 0; i < teams.length; i++) {
		if ((teams[i].seasonAttrs.playoffRoundsWon == 3) && (g.gameType == 0)) {
			tid = teams[i].tid;
			champRound = 3;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 27) && (g.gameType == 1)) {
			tid = teams[i].tid;
			champRound = 27;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 4) && (g.gameType == 2)) {
			tid = teams[i].tid;
			champRound = 4;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 6) && (g.gameType == 3)) {
			tid = teams[i].tid;
			champRound = 6;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 3) && (g.gameType == 4)) {
			tid = teams[i].tid;
			champRound = 3;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 10) && (g.gameType == 5) && g.yearType == 2019) {
			champRound = 10;
			tid = teams[i].tid;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 6) && (g.gameType == 5) && g.yearType != 2019) {
			champRound = 6;
			tid = teams[i].tid;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWonWorlds == 3) &&  (g.gameType == 6)) {
			champRound = 3;
			tid = teams[i].tid;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWonWorlds == 3) && (g.gameType == 7)) {
			champRound = 3;
			tid = teams[i].tid;
			break;
		}
	}

  let  t;
	if  (g.gameType >= 6) {
		t 	= teams.find(t2 => t2.seasonAttrs.playoffRoundsWonWorlds === champRound);
	} else {
		t 	= teams.find(t2 => t2.seasonAttrs.playoffRoundsWon === champRound);
	}
    if (t !== undefined) {
        const players = await idb.cache.players.indexGetAll('playersByTid', t.tid);
        for (const p of players) {
            p.awards.push({season: g.season, type: "Won Championship"});
            await idb.cache.players.put(p);
        }
    }

	if  (g.gameType >= 5) {
		for (let i = 0; i < teams.length; i++) {
			if (teams[i].seasonAttrs.pointsSummer == 1000) {
					t = teams[i];
					let playersWon = await idb.cache.players.indexGetAll('playersByTid', t.tid);
					for (let pWon of playersWon) {
						pWon.awards.push({season: g.season, type: "Regional - Won Championship"});
						await idb.cache.players.put(pWon);
					}
			}
		}
	}

		if (g.gameType == 1 || g.gameType == 7) {
			var newLCS, newCS, newLadder;
			var newLCSCidLCS, newCSCidLCS, newLadderCidLCS;
			var teamSeason;
			var teamCurrent;
			newLCS = [];
			newCS = [];
			newLadder = [];
			newLCSCidLCS = [];
			newCSCidLCS = [];
			newLadderCidLCS = [];


			for (let i = 0; i < teams.length; i++) {
			//push for each
				if (g.gameType < 7) {
					if (teams[i].seasonAttrs.playoffRoundsWon > 16) {
						newLCS.push(teams[i].tid);
					} else if (teams[i].seasonAttrs.playoffRoundsWon > 6) {
						newCS.push(teams[i].tid);
					} else  {
						newLadder.push(teams[i].tid);
					}
				} else if (g.gameType == 7) {
					if (teams[i].seasonAttrs.ladderCSLCS == 0) {
							newLCS.push(teams[i].tid);
							newLCSCidLCS.push(Math.floor(teams[i].cid/3));
					} else if (teams[i].seasonAttrs.ladderCSLCS == 1) {
							newCS.push(teams[i].tid);
							newCSCidLCS.push(Math.floor(teams[i].cid/3));
					} else  {
							newLadder.push(teams[i].tid);
							newLadderCidLCS.push(Math.floor(teams[i].cid/3));
					}
				}
			}


			for (let i = 0; i < newLCS.length; i++) {

				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${newLCS[i]}`);

				if (newLCSCidLCS.length>0) {
					teamSeason.cidNext = 0+newLCSCidLCS[i]*3;
				} else {
					teamSeason.cidNext = 0;
				}

				await idb.cache.teamSeasons.put(teamSeason);

				teamCurrent = await idb.cache.teams.get(newLCS[i]);

				if (newLCSCidLCS.length>0) {
					teamCurrent.cid = 0+newLCSCidLCS[i]*3;
				} else {
					teamCurrent.cid = 0;
				}
				//console.log(teamCurrent);
				await idb.cache.teams.put(teamCurrent);

			}

			for (let i = 0; i < newCS.length; i++) {
				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${newCS[i]}`);
				if (newCSCidLCS.length>0) {
					teamSeason.cidNext = 1+newCSCidLCS[i]*3;
				} else {
					teamSeason.cidNext = 1;
				}

				await idb.cache.teamSeasons.put(teamSeason);

				teamCurrent = await idb.cache.teams.get(newCS[i]);

				if (newCSCidLCS.length>0) {
					teamCurrent.cid = 1+newCSCidLCS[i]*3;
				} else {
						teamCurrent.cid = 1;
				}
				await idb.cache.teams.put(teamCurrent);
			}

			for (let i = 0; i < newLadder.length; i++) {

				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${newLadder[i]}`);
				if (newLadderCidLCS.length>0) {
					teamSeason.cidNext = 2+newLadderCidLCS[i]*3;
				} else {
					teamSeason.cidNext = 2;
				}
				await idb.cache.teamSeasons.put(teamSeason);

				teamCurrent = await idb.cache.teams.get(newLadder[i]);

				if (newLadderCidLCS.length>0) {
					teamCurrent.cid = 2+newLadderCidLCS[i]*3;
				} else {
					teamCurrent.cid = 2;
				}

				await idb.cache.teams.put(teamCurrent);
			}
		}



	////////////////////// Champion Patch Update

	if (g.patchType != 1) {
	    const championPatch = await idb.cache.championPatch.getAll();
		for (const cp of championPatch) {
			 cp.rank = parseInt(cp.rank)
			cp.rank += Math.random()*.01;

			if (g.patchType == 0) {
				if (cp.rank > .56) {
					cp.rank = Math.random()*.05+.45;
				} else if (cp.rank < .44) {
					cp.rank =  Math.random()*.05+.50;
				}
			} else {
				if (cp.rank > .56) {
					cp.rank =  Math.random()*.05+.5;
				} else if (cp.rank < .44 ) {
					cp.rank =  Math.random()*.05+.45;
				}
			}

			await idb.cache.championPatch.put(cp);
		}
	}


    // Do annual tasks for each player, like checking for retirement

    // Players meeting one of these cutoffs might retire
    const maxAge = 21;
    const minPot = 40;
    var country;
	var languages;
    const players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
    for (const p of players) {
        let update = false;

        // Get player stats, used for HOF calculation
        const playerStats = await idb.getCopies.playerStats({pid: p.pid});

        const age = g.season - p.born.year;
        const pot = p.ratings[p.ratings.length - 1].pot;
        const injRes = p.ratings[p.ratings.length - 1].reb;
		//const YWT = _.pluck(playerStats, "yearsWithTeam");
		const YWT = playerStats.map(ps => ps.yearsWithTeam);

		if (p.tid >= 0) {
			//console.log(p.tid);
		//	console.log(YWT);
			if ((YWT[YWT.length-2] == g.residencyRequirement) || (YWT[YWT.length-3] == g.residencyRequirement) || (YWT[YWT.length-1] == g.residencyRequirement) ) {
			//console.log(g.teamCountryCache[p.tid]+" "+p.born.loc);
				if (g.teamCountryCache[p.tid] != p.born.loc) {
					p.born.loc = g.teamCountryCache[p.tid];
					update = true;
					//console.log("A: "+g.teamCountryCache[p.tid]);
					//console.log(p.born.loc);
					let teamCountry = await idb.cache.teams.get(p.tid);
					//console.log(p.born.loc+" "+teamCountry);
				//	console.log(teamCountry.countrySpecific);
				//	country = player.country(p.born.loc);
					//let countryTeam = player.country(teamCountry.countrySpecific);
				//	console.log(country+" "+p.born.country);
//					languages = player.languages(country);
					languages = player.languages(teamCountry.countrySpecific,true);
			//		console.log(languages);
			//		console.log(p.languages);
					if (typeof(p.languages) != 'undefined') {
					//	console.log("notUndefined");
					///	console.log(p.languages.length);
						for (let i = 0; i < p.languages.length; i++) {
						//	console.log(languages[0]+" "+p.languages[i]);
							if (p.languages[i] == languages[0]) {
							//	console.log("already have");
								break;
							}
							if (i == (p.languages.length-1)) {
								p.languages.push(languages[0]);
								//console.log("GOT NEW LANGUAGE"+languages[0]+" "+p.languages+" "+g.teamCountryCache[p.tid]+" "+p.born.loc+" "+teamCountry.countrySpecific);
							}
						}
					}
					//console.log(p);

				}
			}
		}


		if (age > maxAge || pot < minPot) {
			let excessAge = 0;
//			if (age > 21 || p.tid === PLAYER.FREE_AGENT) {  // Only players older than 21 or without a contract will retire
			if (age > 21 ) {  // Only players older than 21 or without a contract will retire
				if (age > 21) {
					excessAge = (age - 21) / 20;  // 0.05 for each year beyond 24
				}
				let excessPot = (40 - pot) / 50;  // 0.02 for each potential rating below 40 (this can be negative)
				let injuryRisk = (50-injRes) / 200;  // 0.02 for each potential rating below 40 (this can be negative)
				if (excessAge + excessPot+injuryRisk + random.gauss(0, 1) > 0) {
					if (g.retirementPlayers) {
						player.retire(p, playerStats, conditions);
						update = true;
					}
				}
			}
		}
     /*   if (age > maxAge || pot < minPot) {
            if (age > 34 || p.tid === PLAYER.FREE_AGENT) {  // Only players older than 34 or without a contract will retire
                let excessAge = 0;
                if (age > 34) {
                    excessAge = (age - 34) / 20;  // 0.05 for each year beyond 34
                }
                const excessPot = (40 - pot) / 50;  // 0.02 for each potential rating below 40 (this can be negative)
                if (excessAge + excessPot + random.gauss(0, 1) > 0) {
                    player.retire(p, playerStats, conditions);
                    update = true;
                }
            }
        }*/

        // Update "free agent years" counter and retire players who have been free agents for more than one years
        if (p.tid === PLAYER.FREE_AGENT) {
            if (p.yearsFreeAgent >= 1) {
				//if (g.retirementPlayers) {
					player.retire(p, playerStats, conditions);
					update = true;
				//}
            } else {
                p.yearsFreeAgent += 1;
            }
            p.contract.exp += 1;
            update = true;
        } else if (p.tid >= 0 && p.yearsFreeAgent > 0) {
            p.yearsFreeAgent = 0;
            update = true;
        }

        // Heal injures
        if (p.injury.type !== "Healthy") {
            // This doesn't use g.numGames because that would unfairly make injuries last longer if it was lower - if anything injury duration should be modulated based on that, but oh well
            if (p.injury.gamesRemaining <= 15) {
                p.injury = {type: "Healthy", gamesRemaining: 0};
            } else {
                p.injury.gamesRemaining -= 15;
            }
            update = true;
        }

        if (update) {
            await idb.cache.players.put(p);
        }
    }

    const releasedPlayers = await idb.cache.releasedPlayers.getAll();
    for (const rp of releasedPlayers) {
        if (rp.contract.exp <= g.season && typeof rp.rid === 'number') {
            await idb.cache.releasedPlayers.delete(rp.rid);
        }
    }

    await team.updateStrategies();

    // Achievements after awards
    account.checkAchievement.hardware_store(conditions);
 //   account.checkAchievement.sleeper_pick(conditions);

    const deltas = await season.updateOwnerMood();
    await genMessage(deltas);

    // Don't redirect if we're viewing a live game now
    let url;
    if (!liveGameSim) {
        url = helpers.leagueUrl(["history"]);

////////        url = helpers.leagueUrl(["history_All_MSI"]);
//        url = helpers.leagueUrl(["history_MSI"]);
    }

    toUI(['bbgmPing', 'season'], conditions);

    return [url, ["playerMovement"]];
}

async function newPhaseDraft(conditions: Conditions) {


	console.log("newPhaseBeforeDraft: "+g.season+" "+g.seasonSplit);

    // Kill off old retired players (done here since not much else happens in this phase change, so making it a little
    // slower is fine). This assumes all killable players have no changes in the cache, which is almost certainly true,
    // but under certain rare cases could cause a minor problem.
    const promises = [];
    await idb.league.players.index('tid').iterate(PLAYER.RETIRED, (p) => {
        if (p.hasOwnProperty('diedYear') && p.diedYear) {
            return;
        }

        // Formula badly fit to http://www.ssa.gov/oact/STATS/table4c6.html
        const probDeath = 0.0001165111 * Math.exp(0.0761889274 * (g.season - p.born.year));

        if (Math.random() < probDeath) {
            p.diedYear = g.season;
            promises.push(idb.cache.players.put(p)); // Can't await here because of Firefox IndexedDB issues
        }
    });
    await Promise.all(promises);

    await draft.genOrder(conditions);

    // This is a hack to handle weird cases where already-drafted players have draft.year set to the current season, which fucks up the draft UI
    const players = await idb.cache.players.getAll();
    for (const p of players) {
        if (p.draft.year === g.season && p.tid >= 0) {
            p.draft.year -= 1;
            await idb.cache.players.put(p);
        }
    }

    return [helpers.leagueUrl(["draft"]), []];
}

async function newPhaseAfterDraft() {

	//console.log("newPhaseAfterDraft: "+g.season+" "+g.seasonSplit);

    await draft.genPicks(g.season + 4);

    return [undefined, ["playerMovement"]];
}

async function newPhaseResignPlayers(conditions: Conditions) {

	//console.log("newPhaseResignPlayers: "+g.season+" "+g.seasonSplit);

    const baseMoods = await player.genBaseMoods();

    // Re-sign players on user's team, and some AI players
    const players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
    for (const p of players) {
        if (p.contract.exp <= g.season && g.userTids.includes(p.tid) && local.autoPlaySeasons === 0) {
            const tid = p.tid;

            // Add to free agents first, to generate a contract demand, then open negotiations with player
            await player.addToFreeAgents(p, g.PHASE.RESIGN_PLAYERS, baseMoods);
            const error = await contractNegotiation.create(p.pid, true, tid);
            if (error !== undefined && error) {
                logEvent({
                    type: "refuseToSign",
                    text: error,
                    pids: [p.pid],
                    tids: [tid],
                }, conditions);
            }
        }
    }

    // Set daysLeft here because this is "basically" free agency, so some functions based on daysLeft need to treat it that way (such as the trade AI being more reluctant)
    await league.setGameAttributes({daysLeft: 30});

    return [helpers.leagueUrl(["negotiation"]), ["playerMovement"]];
}

async function newPhaseFreeAgency(conditions: Conditions) {

	//console.log("newPhaseFreeAgency: "+g.season+" "+g.seasonSplit);

    const teams = await idb.getCopies.teamsPlus({
        attrs: ["strategy"],
		seasonAttrs: ["hype"],
        season: g.season,
    });
    const strategies = teams.map(t => t.strategy);
	const hype = teams.map(t => t.seasonAttrs.hype);
	//console.log(strategies);
	//console.log(hype);
    // Delete all current negotiations to resign players
    await contractNegotiation.cancelAll();

    const baseMoods = await player.genBaseMoods();

    // Reset contract demands of current free agents and undrafted players
    // KeyRange only works because PLAYER.UNDRAFTED is -2 and PLAYER.FREE_AGENT is -1

    const players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.UNDRAFTED, PLAYER.FREE_AGENT]);

   // const players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.UNDRAFTED, PLAYER.FREE_AGENT]);

    for (const p of players) {
        await player.addToFreeAgents(p, g.PHASE.FREE_AGENCY, baseMoods);
    }

    // AI teams re-sign players or they become free agents
    // Run this after upding contracts for current free agents, or addToFreeAgents will be called twice for these guys
    const players2 = await idb.cache.players.indexGetAll('playersByTid', [0, Infinity]);
    for (const p of players2) {
        if (p.contract.exp <= g.season && (!g.userTids.includes(p.tid) || local.autoPlaySeasons > 0)) {
            // Automatically negotiate with teams
//            const factor = strategies[p.tid] === "rebuilding" ? 0.4 : 0;
            let factor = 0;
			if ((p.value / 100) > (hype[p.tid]*.3+.7)) {
			   factor = 1.00;
			 //  factor = 1.00-hype[p.tid];
			}
			if ((p.value / 100) < (hype[p.tid]*.3+.5)) {
	//								   factor = 1.00-hype[p.tid];
			}
            if (Math.random() < p.value / 100 - factor || g.alwaysKeep) { // Should eventually be smarter than a coin flip
                // See also core.team
                const contract = player.genContract(p);
                contract.exp += 1; // Otherwise contracts could expire this season
                player.setContract(p, contract, true);
                p.gamesUntilTradable = 4;

                logEvent({
                    type: "reSigned",
//                    text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> re-signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ' + helpers.formatCurrency(p.contract.amount/1000, "K") + '/year through ' + p.contract.exp + '.',
                    text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> re-signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ${helpers.formatCurrency(p.contract.amount / 1000, "K")}/year through ${p.contract.exp}.`,
//                    text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> re-signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ${helpers.formatCurrency(p.contract.amount / 1000, "M")}/year through ${p.contract.exp}.`,
                    showNotification: false,
                    pids: [p.pid],
                    tids: [p.tid],
                }, conditions);

                // Else branch include call to addToFreeAgents, which handles updating the database
                await idb.cache.players.put(p);
            } else {
                await player.addToFreeAgents(p, g.PHASE.RESIGN_PLAYERS, baseMoods);
            }
        }
    }

    // Bump up future draft classes (not simultaneous so tid updates don't cause race conditions)
    const players3 = await idb.cache.players.indexGetAll('playersByTid', PLAYER.UNDRAFTED_2);
    for (const p of players3) {
        p.tid = PLAYER.UNDRAFTED;
        p.ratings[0].fuzz /= 2;
        await idb.cache.players.put(p);
    }
    const players4 = await idb.cache.players.indexGetAll('playersByTid', PLAYER.UNDRAFTED_3);
    for (const p of players4) {
        p.tid = PLAYER.UNDRAFTED_2;
        p.ratings[0].fuzz /= 2;
        await idb.cache.players.put(p);
    }
    idb.cache.markDirtyIndexes('players');


         //  }).then(function () {
 //           return tx.complete().then(function () {
                // Create new draft class for 3 years in the future
                //return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3);
//				return dao.champions.getAll({ot: ot}),
	//	console.log("GOT HERE");
			//	return dao.champions.getAll({
				//			ot: tx
					//	}).then(function (c) {
							//	console.log("GOT HERE");
						//	return dao.championPatch.getAll({
								//		ot: tx
								//	}).then(function (cp) {
									//		console.log("GOT HERE");

									//console.log(c.length);
									//console.log(cp.length);
								//	console.log(_.size(c));
								//	console.log(_.size(cpSorted));
								//const leagues = await idb.meta.leagues.getAll();
									//await idb.cache.awards.getAll()
	const  c = await idb.cache.champions.getAll();
	const cp = await idb.cache.championPatch.getAll();
//console.log("Champion free agency");
//console.log(c);

	var i,j;
	var cpSorted;
	var topADC,topMID,topJGL,topTOP,topSUP;

	cpSorted = [];

	for (i = 0; i < _.size(cp); i++) {
		cpSorted.push({"champion": cp[i].champion,"cpid": cp[i].cpid,"rank": cp[i].rank,"role": cp[i].role});
	}

	cpSorted.sort(function (a, b) { return a.rank - b.rank; });


	topADC = [];
	topMID = [];
	topJGL = [];
	topTOP = [];
	topSUP = [];
//	console.log(cpSorted);
	for (i = 0; i < _.size(cpSorted); i++) {
		if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
	//	   console.log(_.size(c));
			for (j = 0; j < _.size(c); j++) {
				if (c[j].name == cpSorted[i].champion) {
					topADC.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
		if ((cpSorted[i].role == "MID") && (topMID.length < 5) ) {
//				  topMID.push(cpSorted[i].cpid);
			for (j = 0; j < _.size(c); j++) {
				if (c[j].name == cpSorted[i].champion) {
					topMID.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
		if ((cpSorted[i].role == "JGL") && (topJGL.length < 5) ) {
//				  topJGL.push(cpSorted[i].cpid);
			for (j = 0; j < _.size(c); j++) {
				if (c[j].name == cpSorted[i].champion) {
					topJGL.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
		if ((cpSorted[i].role == "TOP") && (topTOP.length < 5) ) {
//				  topTOP.push(cpSorted[i].cpid);
			for (j = 0; j < _.size(c); j++) {
				if (c[j].name == cpSorted[i].champion) {
					topTOP.push(c[j].hid);
					j = _.size(c);
				}
			}
		}
		if ((cpSorted[i].role == "SUP") && (topSUP.length < 5) ) {
//				  topSUP.push(cpSorted[i].cpid);
			for (j = 0; j < _.size(c); j++) {
				if (c[j].name == cpSorted[i].champion) {
					topSUP.push(c[j].hid);
					j = _.size(c);
				}
			}

		}

	}

    await draft.genPlayers(PLAYER.UNDRAFTED_3,null,null,false,c,topADC,topMID,topJGL,topTOP,topSUP);

    return [helpers.leagueUrl(["free_agents"]), ["playerMovement"]];
}

async function newPhaseFantasyDraft(conditions: Conditions, position: number) {

	console.log("newPhaseFantasyDraft: "+g.season+" "+g.seasonSplit);

    await contractNegotiation.cancelAll();
    await draft.genOrderFantasy(position);
    await league.setGameAttributes({nextPhase: g.phase});
    await idb.cache.releasedPlayers.clear();

    // Protect draft prospects from being included in this
    const playersUndrafted = await idb.cache.players.indexGetAll('playersByTid', PLAYER.UNDRAFTED);
    for (const p of playersUndrafted) {
        p.tid = PLAYER.UNDRAFTED_FANTASY_TEMP;
        await idb.cache.players.put(p);
    }

    // Make all players draftable
    const players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
    for (const p of players) {
        p.tid = PLAYER.UNDRAFTED;
        await idb.cache.players.put(p);
    }

    idb.cache.markDirtyIndexes('players');

    return [helpers.leagueUrl(["draft"]), ["playerMovement"]];
}

/**
 * Set a new phase of the game.
 *
 * @memberOf core.phase
 * @param {number} phase Numeric phase ID. This should always be one of the PHASE.* variables defined in globals.js.
 * @param {} extra Parameter containing extra info to be passed to phase changing function. Currently only used for newPhaseFantasyDraft.
 * @return {Promise}
 */
async function newPhase(phase: Phase, conditions: Conditions, extra?: any) {
    // Prevent at least some cases of code running twice

	//console.log("newPhase: "+phase+" "+g.phase);

    if (phase === g.phase) {
        return;
    }

	//console.log("newPhase: "+phase+" "+g.phase);
console.log(g.confs);
    const phaseChangeInfo = {
        [g.PHASE.PRESEASON]: {
            func: newPhasePreseason,
        },
        [g.PHASE.REGULAR_SEASON]: {
            func: newPhaseRegularSeason,
        },
        [g.PHASE.MSI]: {
            func: newPhaseMSI,
        },
        [g.PHASE.MIDSEASON]: {
            func: newPhaseMidseason,
        },
        [g.PHASE.SECOND_HALF]: {
            func: newPhaseSecondHalf,
        },
        [g.PHASE.PLAYOFFS]: {
            func: newPhasePlayoffs,
        },
        [g.PHASE.BEFORE_DRAFT]: {
            func: newPhaseBeforeDraft,
    /*    },
        [g.PHASE.DRAFT]: {
            func: newPhaseDraft,
        },
        [g.PHASE.AFTER_DRAFT]: {
            func: newPhaseAfterDraft,*/
        },
        [g.PHASE.RESIGN_PLAYERS]: {
            func: newPhaseResignPlayers,
        },
        [g.PHASE.FREE_AGENCY]: {
            func: newPhaseFreeAgency,
        },
        [g.PHASE.FANTASY_DRAFT]: {
            func: newPhaseFantasyDraft,
        },
    };

	//console.log(phaseChangeInfo);

    if (lock.get('newPhase')) {
        logEvent({
            type: 'error',
            text: 'Phase change already in progress.',
            saveToDb: false,
        }, conditions);
    } else {
			//	console.log("phase change");
        try {
            await updateStatus('Processing...');

            lock.set('newPhase', true);
            await updatePlayMenu();

            if (phaseChangeInfo.hasOwnProperty(phase)) {

			//console.log(phase);
			//	console.log(phaseChangeInfo[phase]);
			//	console.log(phaseChangeInfo[phase].name);

                const result = await phaseChangeInfo[phase].func(conditions, extra);

			//	console.log("phase change");
			//	console.log(result);
                if (result && result.length === 2) {
                    const [url, updateEvents] = result;
                    await finalize(phase, url, updateEvents, conditions);
                } else {
                    throw new Error(`Invalid result from phase change: ${JSON.stringify(result)}`);
                }
            } else {
                throw new Error(`Unknown phase number ${phase}`);
            }
        } catch (err) {
            lock.set('newPhase', false);
            await updatePlayMenu();

            logEvent({
                type: 'error',
                text: 'Critical error during phase change. <a href="/debugging"><b>Read this to learn about debugging.</b></a>',
                saveToDb: false,
                persistent: true,
            }, conditions);

            console.error(err);
        }
    }
}

export default {
    // eslint-disable-next-line import/prefer-default-export
    newPhase,
};
