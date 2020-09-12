// @flow

import _ from 'underscore';
import {PLAYER, g, helpers} from '../../common';
import { draft,league,team} from '../core';
import {idb} from '../db';
import {logEvent, random} from '../util';
import type {Conditions, OwnerMoodDeltas, ScheduleGame, Team, TeamFiltered} from '../../common/types';

/**
 * Update g.ownerMood based on performance this season.
 *
 * This is based on three factors: regular season performance, playoff performance, and finances. Designed to be called after the playoffs end.
 *
 * @memberOf core.season
 * @return {Promise.Object} Resolves to an object containing the changes in g.ownerMood this season.
 */
async function updateOwnerMood(): Promise<OwnerMoodDeltas> {
    const t = await idb.getCopy.teamsPlus({
        seasonAttrs: ["won", "playoffRoundsWon", "profit","cidStart"],
        season: g.season,
        tid: g.userTid,
    });
    if (!t) { throw new Error('Invalid g.userTid'); }


	var ownerMood,roundsBeforeChamp,halfSeason;


	 halfSeason = 9;
	 roundsBeforeChamp = 3;
	if (g.gameType == 0) {
	   halfSeason = 9;
	   roundsBeforeChamp = 2;
	} else if (g.gameType == 1) {
	   halfSeason = 9;
	   roundsBeforeChamp = 26;
	} else if (g.gameType == 2) {
	   halfSeason = 9;
	   roundsBeforeChamp = 3;
	} else if (g.gameType == 3) {
	   halfSeason = 9;
	   roundsBeforeChamp = 5;
	} else if (g.gameType == 4) {
	   halfSeason = 9;
	   roundsBeforeChamp = 3;
	} else if (g.gameType == 5) {
	   halfSeason = 9;
	   roundsBeforeChamp = 5;
	} else if (g.gameType == 6) {
	   halfSeason = 9;
	   roundsBeforeChamp = 5;
	} else if (g.gameType == 7) {
	   halfSeason = 9;
	   roundsBeforeChamp = 5;
	}

	halfSeason = team.getNumGames(t.cid)/2;

    const deltas = {};
    deltas.wins = 0.25 * (t.seasonAttrs.won - halfSeason) / (halfSeason);

	//if (g.gameType == 1) {
//	if ((g.gameType == 1) || (g.gameType == 7))  {
	if ((g.gameType == 1) )  {
	//	console.log(t.seasonAttrs.cidStart);
		if (t.seasonAttrs.playoffRoundsWon < 4) {
			deltas.playoffs = -0.2;
		} else if (t.seasonAttrs.playoffRoundsWon < 7) {
			if (t.seasonAttrs.cidStart == 1) {
				deltas.playoffs = -0.19 ;
			} else  {
				deltas.playoffs = 0.02 ;
			}

		} else if (t.seasonAttrs.playoffRoundsWon == 7) {
			if (t.seasonAttrs.cidStart == 1) {
				deltas.playoffs = -0.04 ;
			} else  {
				deltas.playoffs = 0.2 ;
			}
		} else if (t.seasonAttrs.playoffRoundsWon == 13) {
				deltas.playoffs = -0.03 ; // for  making CS

		} else if (t.seasonAttrs.playoffRoundsWon < 16) {
			if (t.seasonAttrs.cidStart == 0) {
				deltas.playoffs = -0.19 ;
			} else  {
				deltas.playoffs = -0.03 ;
			}

		} else if (t.seasonAttrs.playoffRoundsWon == 16) {
			if (t.seasonAttrs.cidStart == 0) {
				deltas.playoffs = -.18 ;
			} else  {
				deltas.playoffs = 0.03 ;
			}

		} else if (t.seasonAttrs.playoffRoundsWon == 17) {
			if (t.seasonAttrs.cidStart == 0) {
				deltas.playoffs = -.18 ;
			} else  {
				deltas.playoffs = 0.04 ;
			}
		} else if (t.seasonAttrs.playoffRoundsWon == 18) {
			if (t.seasonAttrs.cidStart == 0) {
				deltas.playoffs = -.02 ;
			} else  {
				deltas.playoffs = 0.21 ;
			}
		} else if (t.seasonAttrs.playoffRoundsWon < 24) {
			deltas.playoffs = -0.02 ;
		} else if (t.seasonAttrs.playoffRoundsWon == 24) {
			deltas.playoffs = -0.01 ;
		} else if (t.seasonAttrs.playoffRoundsWon == 25) {
			deltas.playoffs = 0.05 ;
		} else if (t.seasonAttrs.playoffRoundsWon == 26) {
			deltas.playoffs = 0.07 ;
		} else {
			deltas.playoffs = 0.22;
		}

	} else {

	//console.log(t.seasonAttrs.playoffRoundsWon);
	//console.log(t);
	//console.log(t.seasonAttrs.playoffRoundsWon+" "+roundsBeforeChamp);

		if (t.seasonAttrs.playoffRoundsWon < 0) {
			deltas.playoffs = -0.2;
		} else if (t.seasonAttrs.playoffRoundsWon < roundsBeforeChamp) {
			deltas.playoffs = 0.2 * (t.seasonAttrs.playoffRoundsWon+1)/(roundsBeforeChamp+3);
		} else {
			deltas.playoffs = 0.2;
		}
	}


  /*  if (t.seasonAttrs.playoffRoundsWon < 0) {
        deltas.playoffs = -0.2;
    } else if (t.seasonAttrs.playoffRoundsWon < 4) {
        deltas.playoffs = 0.04 * t.seasonAttrs.playoffRoundsWon;
    } else {
        deltas.playoffs = 0.2;
    }*/
    deltas.money = (t.seasonAttrs.profit - 15) / 100;

    // Only update owner mood if grace period is over
    if (g.season >= g.gracePeriodEnd) {
        const ownerMood = {};
        ownerMood.wins = g.ownerMood.wins + deltas.wins;
        ownerMood.playoffs = g.ownerMood.playoffs + deltas.playoffs;
        ownerMood.money = g.ownerMood.money + deltas.money;

        // Bound only the top - can't win the game by doing only one thing, but you can lose it by neglecting one thing
        if (ownerMood.wins > 1) { ownerMood.wins = 1; }
        if (ownerMood.playoffs > 1) { ownerMood.playoffs = 1; }
        if (ownerMood.money > 1) { ownerMood.money = 1; }

        await league.setGameAttributes({ownerMood});
    }

    return deltas;
}


async function saveAwardsByPlayer(awardsByPlayer: any) {
    const pids = _.uniq(awardsByPlayer.map(award => award.pid));

    await Promise.all(pids.map(async (pid) => {
        const p = await idb.cache.players.get(pid);

        for (let i = 0; i < awardsByPlayer.length; i++) {
            if (p.pid === awardsByPlayer[i].pid) {
                p.awards.push({season: g.season, type: awardsByPlayer[i].type});
            }
        }

        await idb.cache.players.put(p);
    }));
}


/**
 * Compute the awards (MVP, etc) after a season finishes.
 *
 * The awards are saved to the "awards" object store.
 *
 * @memberOf core.season
 * @return {Promise}
 */
async function doAwardsMSI(conditions: Conditions) {
    const awards: any = {season: g.season};

    // [{pid, type}]
    const awardsByPlayer = [];

    // Get teams for won/loss record for awards, as well as finding the teams with the best records
    const teams = helpers.orderByWinp(await idb.getCopies.teamsPlus({
        attrs: ["tid", "abbrev", "region", "name", "cid"],
        seasonAttrs: ["won", "lost", "winp", "playoffRoundsWon"],
        stats: ["kda","fg","fga","fgp","pf","oppTw"],
        season: g.season,
    }));

//	console.log(teams); // filter based on LCS
	//console.log(g.confs); // only do LCS teams

    awards.bestRecordSpring = {tid: teams[0].tid, abbrev: teams[0].abbrev, region: teams[0].region, name: teams[0].name, won: teams[0].seasonAttrs.won, lost: teams[0].seasonAttrs.lost};
    awards.bestRecordConfsSpring = g.confs.map(c => {
        const t = teams.find(t2 => t2.cid === c.cid);

        if (!t) {
            return {};
        }

        return {
            tid: t.tid,
            abbrev: t.abbrev,
            region: t.region,
            name: t.name,

            // Flow can't handle complexity of idb.getCopies.teams
            won: t.seasonAttrs ? t.seasonAttrs.won : 0,
            lost: t.seasonAttrs ? t.seasonAttrs.lost : 0,
        };
    });

//	console.log(awards);

    // Sort teams by tid so it can be easily used in awards formulas
    /*teams.sort((a, b) => a.tid - b.tid);

	    let players: any = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
    players = await idb.getCopies.playersPlus(players, {
        attrs: ["pid", "name", "tid", "abbrev", "draft"],
        //stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa"],
		stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa","fga","fg","fgp","kda"],
        season: g.season,
    });

	var numGames,inLCS;


	if (g.numGames > 0) {
		numGames = g.numGames;
	} else {
		numGames = 10;
	}

    // League leaders - points, rebounds, assists, steals, blocks
    const factor = (numGames*.8); // To handle changes in number of games and playing time
    const categories = [
        {name: "League Kills Leader", stat: "fg"},
        {name: "League Assists Leader", stat: "fga"},
        {name: "League CS Leader", stat: "stl"},
        //{name: "League CS Leader", stat: "stl", minValue: 125},
        {name: "League KDA Leader", stat: "kda"},
    ];
    for (const cat of categories) {
        players.sort((a, b) => b.stats[cat.stat]/b.stats.gp - a.stats[cat.stat]/a.stats.gp);  // double check division
        for (const p of players) {

			if (g.gameType == 1) {
			//	console.log(teams);
			//	console.log(p.tid);
				//console.log(teams[p.tid].cid);
				if (p.tid >= 0) {
					if (teams[p.tid].cid == 0) {
	//				if (teams[players[i].tid].cid == 0) {
						inLCS = true;
					} else {
						inLCS = false;
					}
				} else {
					inLCS = false;
				}
			} else if (g.gameType == 5) {
				inLCS = true;
			} else if (g.gameType == 6) {
				if (p.tid >= 0) {

					if (teams[p.tid].cid == 0 || teams[p.tid].cid == 3 || teams[p.tid].cid == 6 || teams[p.tid].cid == 9 || teams[p.tid].cid == 12 || teams[p.tid].cid == 15) {
	//				if (teams[players[i].tid].cid == 0) {
						inLCS = true;
					} else {
						inLCS = false;
					}
				} else {
					inLCS = false;
				}
		//		inLCS = true;		// need to update once ladder is in place
			} else {
				inLCS = true;
			}

            if (p.stats.gp >= factor && inLCS) {
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: cat.name});
                break;
            }
        }
    }

    // Add team games won to players
    for (let i = 0; i < players.length; i++) {
        // Special handling for players who were cut mid-season
        if (players[i].tid > 0) {
            players[i].won = teams[players[i].tid].seasonAttrs.won;
        } else {
            players[i].won = 5;
        }
    }

    // Rookie of the Year

	// not even in the game yet
    const rookies = players.filter(p => {
		if (g.gameType == 1) {
			if (p.tid >= 0) {
				if (teams[p.tid].cid == 0) {
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else if (g.gameType == 5) {
		} else if (g.gameType == 6) {
			if (p.tid >= 0) {
				if (teams[p.tid].cid == 0 || teams[p.tid].cid == 3 || teams[p.tid].cid == 6 || teams[p.tid].cid == 9 || teams[p.tid].cid == 12 || teams[p.tid].cid == 15) {
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
		}


        // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
        return p.draft.year === g.season - 1;
    }).sort((a, b) => b.stats.kda*b.stats.gp - a.stats.kda*a.stats.gp); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
    {
        const p = rookies[0];
        if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
            awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Rookie of the Year"});
        }
    }

    // All Rookie Team - same sort as ROY
    awards.allRookie = [];
    for (let i = 0; i < 5; i++) {
        const p = rookies[i];
        if (p) {
            awards.allRookie.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fga: p.stats.fga, fgp: p.stats.fgp});
         //   awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "All Rookie Team"});
        }
    }

    // Most Valuable Player
//    players.sort((a, b) => ( ((b.stats.fg+b.stats.fgp) - (b.stats.fga)*2)*b.stats.gp - ((a.stats.fg+a.stats.fgp) - (a.stats.fga)*2)*a.stats.gp)  );
//    players.sort((a, b) => (b.stats.kda*b.stats.gp+b.won) - (a.stats.kda*a.stats.gp+a.won)  );
     const mvp = players.filter(p => {
		if (g.gameType == 1) {
			if (p.tid >= 0) {
				if (teams[p.tid].cid == 0) {
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else if (g.gameType == 5) {
		} else if (g.gameType == 6) {
			if (p.tid >= 0) {
				if (teams[p.tid].cid == 0 || teams[p.tid].cid == 3 || teams[p.tid].cid == 6 || teams[p.tid].cid == 9 || teams[p.tid].cid == 12 || teams[p.tid].cid == 15) {
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
		}


        // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
        return true;
    }).sort((a, b) => (b.stats.kda*b.stats.gp) - (a.stats.kda*a.stats.gp)  );
    {
        const p = mvp[0];
        if (p) {
            awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Most Valuable Player"});
        }
    }

    // Sixth Man of the Year - same sort as MVP, must have come off the bench in most games
    {
        const p = players.find(p2 => p2.stats.gs === 0 || p2.stats.gp / p2.stats.gs > 2);
        if (p) {
            awards.smoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
          //  awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Sixth Man of the Year"});
        }
    }

    // All League Team - same sort as MVP
    awards.allLeague = [{title: "First Team", players: []}];
    let type = "First Team All-League";
    for (let i = 0; i < 15; i++) {
        const p = mvp[i];
        if (i === 5) {
            awards.allLeague.push({title: "Second Team", players: []});
            type = "Second Team All-League";
        } else if (i === 10) {
            awards.allLeague.push({title: "Third Team", players: []});
            type = "Third Team All-League";
        }
        _.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga});
        awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type});
    }

    // Defensive Player of the Year
    players.sort((a, b) => b.stats.gp * (b.stats.trb + 5 * b.stats.blk + 5 * b.stats.stl) - a.stats.gp * (a.stats.trb + 5 * a.stats.blk + 5 * a.stats.stl));
    {
        const p = players[0];
        awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl};
       // awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Defensive Player of the Year"});
    }

    // All Defensive Team - same sort as DPOY
    awards.allDefensive = [{title: "First Team", players: []}];
    type = "First Team All-Defensive";
    for (let i = 0; i < 15; i++) {
        const p = players[i];
        if (i === 5) {
            awards.allDefensive.push({title: "Second Team", players: []});
            type = "Second Team All-Defensive";
        } else if (i === 10) {
            awards.allDefensive.push({title: "Third Team", players: []});
            type = "Third Team All-Defensive";
        }
        _.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
       // awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type});
    }*/

    // Finals MVP - most WS in playoffs
            // Finals MVP - most WS in playoffs
	/*var champTid, champRound;

	//console.log(g.gameType);
	for (let i = 0; i < teams.length; i++) {
		//console.log(i+" "+teams[i].seasonAttrs.playoffRoundsWon+" "+teams[i].tid);
//                if ((teams[i].playoffRoundsWon === 2) && (teams[i].cid === 0)) {
		if ((teams[i].seasonAttrs.playoffRoundsWon == 3) && (g.gameType == 0)) {
			champTid = teams[i].tid;
			champRound = 3;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 27) && (g.gameType == 1)) {
			//console.log("got here?");
			champTid = teams[i].tid;
			champRound = 27;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 4) && (g.gameType == 2)) {
			champTid = teams[i].tid;
			champRound = 4;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 6) && (g.gameType == 3)) {
			champTid = teams[i].tid;
			champRound = 6;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 3) && (g.gameType == 4)) {
			champTid = teams[i].tid;
			champRound = 3;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 6) && (g.gameType == 5)) {
			champTid = teams[i].tid;
			champRound = 6;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 2) && (g.gameType == 6)) {
			champTid = teams[i].tid;
			champRound = 2;
			break;
		}
	}

			//console.log(champRound);
			//console.log(champTid);

    const champTeam = teams.find(t => t.seasonAttrs.playoffRoundsWon === champRound);
			//console.log(champTeam);
    if (champTeam) {
//const champTid = champTeam.tid;

        let champPlayers = await idb.cache.players.indexGetAll('playersByTid', champTid); // Alternatively, could filter players array by tid
        champPlayers = await idb.getCopies.playersPlus(champPlayers, { // Only the champions, only playoff stats
            attrs: ["pid", "name", "tid", "abbrev"],
            stats: ["fg", "fga", "fgp", "kda"],
            season: g.season,
            playoffs: true,
            regularSeason: false,
            tid: champTid,
        });
        champPlayers.sort((a, b) => (b.stats.kda*b.stats.gp) - (a.stats.kda*a.stats.gp) );
        {
            const p = champPlayers[0];
            awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Finals MVP"});
		//	console.log(p);
        }
    }
*/
//console.log(awards);
    await idb.cache.awards.put(awards);
    await saveAwardsByPlayer(awardsByPlayer);
/*
    // None of this stuff needs to block, it's just notifications of crap
    // Notifications for awards for user's players
    for (let i = 0; i < awardsByPlayer.length; i++) {
        const p = awardsByPlayer[i];
        let text = `<a href="${helpers.leagueUrl(["player", p.pid])}">${p.name}</a> (<a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamAbbrevsCache[p.tid]}</a>) `;
        if (p.type.includes('Team')) {
            text += `made the ${p.type}.`;
        } else if (p.type.includes('Leader')) {
            text += `led the league in ${p.type.replace("League ", "").replace(" Leader", "").toLowerCase()}.`;
        } else {
            text += `won the ${p.type} award.`;
        }
        logEvent({
            type: "award",
            text,
            showNotification: p.tid === g.userTid || p.type === "Most Valuable Player",
            pids: [p.pid],
            tids: [p.tid],
        }, conditions);
    }*/
}

/**
 * Compute the awards (MVP, etc) after a season finishes.
 *
 * The awards are saved to the "awards" object store.
 *
 * @memberOf core.season
 * @return {Promise}
 */
async function doAwards(conditions: Conditions) {
    const awards: any = {season: g.season};

    // [{pid, type}]
    const awardsByPlayer = [];

    // Get teams for won/loss record for awards, as well as finding the teams with the best records
    const teams = helpers.orderByWinp(await idb.getCopies.teamsPlus({
        attrs: ["tid", "abbrev", "region", "name", "cid"],
        seasonAttrs: ["won", "lost", "winp", "playoffRoundsWon", "playoffRoundsWonWorlds"],
        stats: ["kda","fg","fga","fgp","pf","oppTw"],
        season: g.season,
    }));

	//console.log(teams);

    awards.bestRecord = {tid: teams[0].tid, abbrev: teams[0].abbrev, region: teams[0].region, name: teams[0].name, won: teams[0].seasonAttrs.won, lost: teams[0].seasonAttrs.lost};
    awards.bestRecordConfs = g.confs.map(c => {
        const t = teams.find(t2 => t2.cid === c.cid);

        if (!t) {
            return {};
        }

        return {
            tid: t.tid,
            abbrev: t.abbrev,
            region: t.region,
            name: t.name,

            // Flow can't handle complexity of idb.getCopies.teams
            won: t.seasonAttrs ? t.seasonAttrs.won : 0,
            lost: t.seasonAttrs ? t.seasonAttrs.lost : 0,
        };
    });

	//console.log(teams);
    // Sort teams by tid so it can be easily used in awards formulas
    teams.sort((a, b) => a.tid - b.tid);

    let players: any = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
	//console.log(players);
	//console.log(JSON.parse(JSON.stringify(players)));
    players = await idb.getCopies.playersPlus(players, {
        attrs: ["pid", "name", "tid", "abbrev", "draft"],
        //stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa"],
		ratings: ["ovr"],
		stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa","fga","fg","fgp","kda"],
        season: g.season,
    });
	//console.log(JSON.parse(JSON.stringify(players)));
	var numGames,inLCS;


	if (g.numGames > 0) {
		numGames = g.numGames;
	} else {
		numGames = 10;
	}

    // League leaders - points, rebounds, assists, steals, blocks
    const factor = (numGames*.8); // To handle changes in number of games and playing time
    const categories = [
        {name: "League Kills Leader", stat: "fg"},
        {name: "League Assists Leader", stat: "fga"},
        {name: "League CS Leader", stat: "stl"},
        //{name: "League CS Leader", stat: "stl", minValue: 125},
        {name: "League KDA Leader", stat: "kda"},
    ];
    for (const cat of categories) {
        players.sort((a, b) => b.stats[cat.stat]/b.stats.gp - a.stats[cat.stat]/a.stats.gp);  // double check division
        for (const p of players) {

			if (g.gameType == 1) {
//			if ((g.gameType == 1) || (g.gameType == 7))  {
			//	console.log(teams);
			//	console.log(p.tid);
				//console.log(teams[p.tid].cid);
				if (p.tid >= 0) {
					if (teams[p.tid].cid == 0) {
	//				if (teams[players[i].tid].cid == 0) {
						inLCS = true;
					} else {
						inLCS = false;
					}
				} else {
					inLCS = false;
				}
			} else if (g.gameType == 5) {
				inLCS = true;
			} else if (g.gameType == 6) {
				inLCS = true;
			} else if (g.gameType == 7) {
				if (p.tid >= 0) {

					if (teams[p.tid].cid == 0 || teams[p.tid].cid == 3 || teams[p.tid].cid == 6 || teams[p.tid].cid == 9 || teams[p.tid].cid == 12 || teams[p.tid].cid == 15) {
	//				if (teams[players[i].tid].cid == 0) {
						inLCS = true;
					} else {
						inLCS = false;
					}
				} else {
					inLCS = false;
				}
		//		inLCS = true;		// need to update once ladder is in place
			} else {
				inLCS = true;
			}

            if (p.stats.gp >= factor && inLCS) {
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: cat.name});
                break;
            }
        }
    }

    // Add team games won to players
    for (let i = 0; i < players.length; i++) {
        // Special handling for players who were cut mid-season
        if (players[i].tid > 0) {
            players[i].won = teams[players[i].tid].seasonAttrs.won;
        } else {
            players[i].won = 5;
        }
    }

    // Rookie of the Year

	// not even in the game yet
    const rookies = players.filter(p => {
		if (g.gameType == 1) {
			if (p.tid >= 0) {
				if (teams[p.tid].cid == 0) {
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else if (g.gameType == 5) {
		} else if (g.gameType == 6) {
		} else if (g.gameType == 7) {
			if (p.tid >= 0) {
				if (teams[p.tid].cid == 0 || teams[p.tid].cid == 3 || teams[p.tid].cid == 6 || teams[p.tid].cid == 9 || teams[p.tid].cid == 12 || teams[p.tid].cid == 15) {
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
		}


        // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
        return p.draft.year === g.season - 1;
    }).sort((a, b) => b.stats.kda*b.stats.gp - a.stats.kda*a.stats.gp); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
    {
        const p = rookies[0];
        if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
            awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Rookie of the Year"});
        }
    }

    // All Rookie Team - same sort as ROY
    awards.allRookie = [];
    for (let i = 0; i < 5; i++) {
        const p = rookies[i];
        if (p) {
            awards.allRookie.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fga: p.stats.fga, fgp: p.stats.fgp});
         //   awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "All Rookie Team"});
        }
    }

    // Most Valuable Player
//    players.sort((a, b) => ( ((b.stats.fg+b.stats.fgp) - (b.stats.fga)*2)*b.stats.gp - ((a.stats.fg+a.stats.fgp) - (a.stats.fga)*2)*a.stats.gp)  );
//    players.sort((a, b) => (b.stats.kda*b.stats.gp+b.won) - (a.stats.kda*a.stats.gp+a.won)  );
//	console.log(players);
//	console.log(teams);
  // just make Korea MVP the league MVP? or not even have league MVP?
     const mvp = players.filter(p => {
		if (g.gameType == 1) {
			if (p.tid >= 0) {
				if (teams[p.tid].cid == 0) {
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else if (g.gameType == 5) {
			if (p.tid < 0) {
				return false;
			}
		} else if (g.gameType == 6) {
			if (p.tid < 0) {
				return false;
			}
		} else if (g.gameType == 7) {
			if (p.tid >= 0) {
				if (teams[p.tid].cid == 0 || teams[p.tid].cid == 3 || teams[p.tid].cid == 6 || teams[p.tid].cid == 9 || teams[p.tid].cid == 12 || teams[p.tid].cid == 15) {
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			if (p.tid < 0) {
				return false;
			}
		}


        // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
        return true;
    }).filter(p => {
      if (p.stats.gp > 10) {
        return true;
      } else {
        return false;
      }
    }).sort((a, b) => (b.stats.kda) - (a.stats.kda)  );
    {
        let  p = mvp[0];
        console.log(mvp);
        if (p) {
            awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Most Valuable Player"});
        }

		awards.regionMVP = [];
		for (let i = 0; i < g.confs.length; i++) {
		//	console.log(i);
			for (let j = 0; j < mvp.length; j++) {
			//	console.log(j+" "+mvp[j].tid);
				if (teams[mvp[j].tid].cid == i) {
					p = mvp[j];
					awards.regionMVP.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga});
					awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Regional - Most Valuable Player"});

					break;
				}
			}
		}


    }

    // Sixth Man of the Year - same sort as MVP, must have come off the bench in most games
    {
        const p = players.find(p2 => p2.stats.gs === 0 || p2.stats.gp / p2.stats.gs > 2);
        if (p) {
            awards.smoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
          //  awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Sixth Man of the Year"});
        }
    }

    // All League Team - same sort as MVP
    awards.allLeague = [{title: "First Team", players: []}];
    let type = "First Team All-League";
	let p;
    for (let i = 0; i < 15; i++) {

        p = mvp[i];
        if (i === 5) {
            awards.allLeague.push({title: "Second Team", players: []});
            type = "Second Team All-League";
        } else if (i === 10) {
            awards.allLeague.push({title: "Third Team", players: []});
            type = "Third Team All-League";
        }
			_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga});

			awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type});
    }

	//if (g.gameType >= 5) {
		awards.regionAllLeague = [{title: g.confs[0].name, players: []}];
		type = "Regional - All-League";
		for (let i = 0; i < g.confs.length; i++) {
		//	console.log(i);

			if (i>0) {
				awards.regionAllLeague.push({title: g.confs[i].name, players: []});
			}
			let count = 0;
			for (let j = 0; j < mvp.length; j++) {
				//console.log(mvp[j].tid);
				if (teams[mvp[j].tid].cid == i) {
					p = mvp[j];
					_.last(awards.regionAllLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga});
					awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
					count += 1;
					if (count>= 5) {
						break;
					}
				}
			}
		}
	//}
	//console.log(awards);
	//console.log(awardsByPlayer);

    // Defensive Player of the Year
    players.sort((a, b) => b.stats.gp * (b.stats.trb + 5 * b.stats.blk + 5 * b.stats.stl) - a.stats.gp * (a.stats.trb + 5 * a.stats.blk + 5 * a.stats.stl));
    {
        const p = players[0];
	//	if (!ignoreAwards) {
			awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl};
		//}
       // awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Defensive Player of the Year"});
    }

    // All Defensive Team - same sort as DPOY
    awards.allDefensive = [{title: "First Team", players: []}];
    type = "First Team All-Defensive";
    for (let i = 0; i < 15; i++) {
        const p = players[i];
        if (i === 5) {
            awards.allDefensive.push({title: "Second Team", players: []});
            type = "Second Team All-Defensive";
        } else if (i === 10) {
            awards.allDefensive.push({title: "Third Team", players: []});
            type = "Third Team All-Defensive";
        }
//        _.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
       // awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type});
    }

    // Finals MVP - most WS in playoffs
            // Finals MVP - most WS in playoffs
	var champTid, champRound;

	//console.log(g.gameType);
	for (let i = 0; i < teams.length; i++) {
	//	console.log(i+" "+teams[i].seasonAttrs.playoffRoundsWon+" "+teams[i].tid);
//                if ((teams[i].playoffRoundsWon === 2) && (teams[i].cid === 0)) {
		if ((teams[i].seasonAttrs.playoffRoundsWon == 3) && (g.gameType == 0)) {
			champTid = teams[i].tid;
			champRound = 3;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 27) && (g.gameType == 1)) {
			//console.log("got here?");
			champTid = teams[i].tid;
			champRound = 27;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 4) && (g.gameType == 2)) {
			champTid = teams[i].tid;
			champRound = 4;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 6) && (g.gameType == 3) && (g.yearType == undefined || g.yearType == 0)) {
			champTid = teams[i].tid;
			champRound = 6;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 4) && (g.gameType == 3) && g.yearType == 2019) {
			champTid = teams[i].tid;
			champRound = 4;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 3) && (g.gameType == 4)) {
			champTid = teams[i].tid;
			champRound = 3;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 10 &&  g.yearType == 2019) && (g.gameType == 5  )) {
			champTid = teams[i].tid;
			champRound = 10;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWon == 6 && g.yearType != 2019) && (g.gameType == 5  )) {
			champTid = teams[i].tid;
			champRound = 6;
			break;
		} else if ((teams[i].seasonAttrs.playoffRoundsWonWorlds == 3) && (g.gameType == 7 || g.gameType == 6)) {
			champTid = teams[i].tid;
			champRound = 3;
			break;
		}
	}

			//console.log(champRound);
			//console.log(champTid);
	var champTeam;
		if (g.gameType == 7 || g.gameType == 6) {
			champTeam = teams.find(t => t.seasonAttrs.playoffRoundsWonWorlds === champRound);
		} else {
			champTeam = teams.find(t => t.seasonAttrs.playoffRoundsWon === champRound);
		}
	//		console.log(champTeam);
			//console.log(champTid);
			//console.log(champRound);
    if (champTeam) {
//const champTid = champTeam.tid;

        let champPlayers = await idb.cache.players.indexGetAll('playersByTid', champTid); // Alternatively, could filter players array by tid
        champPlayers = await idb.getCopies.playersPlus(champPlayers, { // Only the champions, only playoff stats
            attrs: ["pid", "name", "tid", "abbrev"],
            stats: ["fg", "fga", "fgp", "kda","gp"],
            season: g.season,
            playoffs: true,
            regularSeason: false,
            tid: champTid,
        });
	//	console.log(champPlayers);
        champPlayers.sort((a, b) => (b.stats.kda*b.stats.gp) - (a.stats.kda*a.stats.gp) );
	//	console.log(champPlayers);
        {
            const p = champPlayers[0];
            awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Finals MVP"});
		//	console.log(p);
        }
    }

	//console.log(awards);
    await idb.cache.awards.put(awards);
    await saveAwardsByPlayer(awardsByPlayer);

    // None of this stuff needs to block, it's just notifications of crap
    // Notifications for awards for user's players
    for (let i = 0; i < awardsByPlayer.length; i++) {
        const p = awardsByPlayer[i];
        let text = `<a href="${helpers.leagueUrl(["player", p.pid])}">${p.name}</a> (<a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamAbbrevsCache[p.tid]}</a>) `;
        if (p.type.includes('Team')) {
            text += `made the ${p.type}.`;
        } else if (p.type.includes('Leader')) {
            text += `led the league in ${p.type.replace("League ", "").replace(" Leader", "").toLowerCase()}.`;
        } else {
            text += `won the ${p.type} award.`;
        }
        logEvent({
            type: "award",
            text,
            showNotification: p.tid === g.userTid || p.type === "Most Valuable Player",
            pids: [p.pid],
            tids: [p.tid],
        }, conditions);
    }
}

/**
 * Get an array of games from the schedule.
 *
 * @param {(IDBObjectStore|IDBTransaction|null)} options.ot An IndexedDB object store or transaction on schedule; if null is passed, then a new transaction will be used.
 * @param {boolean} options.oneDay Return just one day (true) or all days (false). Default false.
 * @return {Promise} Resolves to the requested schedule array.
 */
async function getSchedule(oneDay?: boolean = false): Promise<ScheduleGame[]> {
    let schedule = await idb.cache.schedule.getAll();

//	let undrafted = await idb.cache.champions.getAll();
	//	console.log(schedule);
	//console.log("GETSCHEDULE");
//		console.log(undrafted);
		//console.log(undrafted);
//console.log(oneDay);
    if (oneDay) {
        schedule = schedule.slice(0, g.numTeams / 2);  // This is the maximum number of games possible in a day

        // Only take the games up until right before a team plays for the second time that day
        const tids = [];
        let i;
		let ii;
        for (i = 0; i < schedule.length; i++) {
		//	console.log(i+" "+schedule[i].homeTid+" "+schedule[i].awayTid+" "+g.userTid);
		//	if (schedule[i].homeTid == g.userTid || schedule[i].awayTid == g.userTid) {
		//		console.log("FOUND USER");
			//	schedule[i].champions = {undrafted: undrafted};
			//	console.log(schedule[i]);
			//	console.log(schedule[i].champions);
			//	schedule[i].champions.drafted = [];
			//	ii = i;
			//	await draft.genOrder(schedule[i]);
				//schedule[i] = draft.genOrder(schedule[i]);
			//	console.log(schedule[ii]);
			//	schedule[ii] = 	helpers.deepCopy(draft.genOrder(schedule[ii]));
			//	console.log(schedule[ii]);
				//schedule[ii] = draft.genOrder(schedule[i]);

		//	}

            if (!tids.includes(schedule[i].homeTid) && !tids.includes(schedule[i].awayTid)) {
                tids.push(schedule[i].homeTid);
                tids.push(schedule[i].awayTid);
            } else {
                break;
            }
        }
        schedule = schedule.slice(0, i);
    }

	//console.log(schedule);
	//await draft.genOrder(schedule);

//console.log(schedule);
				//console.log(schedule[ii]);
    return schedule;
}

/**
 * Save the schedule to the database, overwriting what's currently there.
 *
 * @param {Array} tids A list of lists, each containing the team IDs of the home and
        away teams, respectively, for every game in the season, respectively.
 * @return {Promise}
 */
async function setSchedule(tids: [number, number][]) {
    await idb.cache.schedule.clear();
    await Promise.all(tids.map(([homeTid, awayTid]) => idb.cache.schedule.add({
        homeTid,
        awayTid,
    })));
	/*Promise.all( const [awayTeam,homeTeam, undrafted] = await Promise.all([
            idb.cache.players.indexGetAll('playersByTid', awayTid),
            idb.cache.players.indexGetAll('playersByTid', homeTid),
            idb.cache.champions.getAll(),
        ]));	*/
	/*await Promise.all([
            const awayTeam = idb.cache.players.indexGetAll('playersByTid', awayTid),
            const homeTeam = idb.cache.players.indexGetAll('playersByTid', homeTid),
            const undrafted = idb.cache.champions.getAll(),
        ]);*/

	/*let schedule = await idb.cache.schedule.getAll();
	let undrafted = await idb.cache.champions.getAll();
	let patch = await idb.cache.championPatch.getAll();

	var teamHome;
	var teamAway;

	let i;
	let ii;
	let usersGame;
	let drafted;

	for (ii = 0; ii < undrafted.length; ii++) {
		let early =  undrafted[ii].ratings.early;
		let mid =  undrafted[ii].ratings.mid;
		let late  =  undrafted[ii].ratings.late;
		if (early>mid && early>late) {
			undrafted[ii].ratings.earlyMidLate = "Early";
		} else if (mid>early && mid>late) {
			undrafted[ii].ratings.earlyMidLate = "Mid";
		} else {
			undrafted[ii].ratings.earlyMidLate = "Late";
		}
		undrafted[ii].lane = "";
		for (i = 0; i < patch.length; i++) {
	//		console.log(i+" "+patch.length+" "+ii+" "+undrafted.length+" "+patch[i].champion+" "+undrafted[ii].name);
		  if (patch[i].champion == undrafted[ii].name) {
			  if (undrafted[ii].lane.length == 0) {
				undrafted[ii].lane += patch[i].role;
			  } else {
				undrafted[ii].lane += " ";
				undrafted[ii].lane += patch[i].role;
			  }

		  }
		}
	}



	for (i = 0; i < schedule.length; i++) {
			schedule[i].champions = {undrafted: undrafted};

			usersGame = helpers.deepCopy(schedule[i]);


			teamHome = await idb.cache.players.indexGetAll(
					"playersByTid",
					usersGame.homeTid,
				);

			teamAway = await idb.cache.players.indexGetAll(
					"playersByTid",
					usersGame.awayTid,
				);

			drafted = [];

			drafted = await draft.setDraftOrder(drafted,usersGame);

			schedule[i].champions.drafted = drafted;
			schedule[i].champions.patch = patch;
			schedule[i].teamHome = teamHome;
			schedule[i].teamAway = teamAway;
			ii = i;
			schedule[ii] = 	helpers.deepCopy(schedule[ii]);
	}	*/

}

/**
 * Creates a new regular season schedule for 30 teams.
 *
 * This makes an NBA-like schedule in terms of conference matchups, division matchups, and home/away games.
 *
 * @memberOf core.season
 * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
 */
    function newScheduleDefault(teams): [number, number][] {
        var cid, dids, game, games, good, i, ii, iters, j, jj, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tryNum;
		var ifCS;

		//console.log("New schedule every year?");

		ifCS = 1;

        tids = [];  // tid_home, tid_away

        // Collect info needed for scheduling
		//console.log(teams.length);
		//console.log(teams.length);
        for (i = 0; i < teams.length; i++) {
		//	console.log(teams[i]);
            teams[i].homeGames = 0;
            teams[i].awayGames = 0;
        }

		var cid,t,teamsDone,allTeams,cTeams;

	//	console.log(teams);
		for (allTeams = 0; allTeams < g.numTeams; allTeams++) {
		//	console.log(teams[allTeams].cid+" "+teams[allTeams].tid);
			for (cTeams = allTeams; cTeams < g.numTeams; cTeams++) {
				if ((teams[allTeams].cid == teams[cTeams].cid) && (teams[allTeams].tid != teams[cTeams].tid)) {

					ifCS = 1;
			//		if  ((teams[allTeams].cid == 1) && (g.gameType == 1)) {
			//			ifCS = 2;
			//		}

					// For the larger ladder versions, 12, 20 teams may want to put in an alternative schedule that isn't longer than rest of divisions.
					// essentially, use the crappy schedule for ladder and play twice for CS and top league.
					// May need to use team MMR for ladder and not raw schedule wins and losses.

					for (i = 0; i < ifCS; i++) {

						game = [teams[allTeams].tid, teams[cTeams].tid];
						tids.push(game);
						teams[allTeams].homeGames += 1;
						teams[cTeams].awayGames += 1;

						game = [teams[cTeams].tid, teams[allTeams].tid];
						tids.push(game);
						teams[cTeams].homeGames += 1;
						teams[allTeams].awayGames += 1;

					}
				}
			}
		}

        return tids;
    }


/**
 * Creates a new regular season schedule for an arbitrary number of teams.
 *
 * newScheduleDefault is much nicer and more balanced, but only works for 30 teams and 82 games.
 *
 * @memberOf core.season
 * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
 */
	function newScheduleCrappy(teams): [number, number][] {
		var i, j, numRemaining, numWithRemaining, tids, tries, numGames;


		if (g.numGames == 0) {
			numGames = 20;
		} else {
			numGames = g.numGames;
		}

		// Number of games left to reschedule for each team
		numRemaining = [];
		for (i = 0; i < g.numTeams; i++) {
			numRemaining[i] = numGames;
		}
		numWithRemaining = g.numTeams; // Number of teams with numRemaining > 0

		tids = [];
		let breakLoop = false;
		while (tids.length < numGames * g.numTeams / 2 && !breakLoop) {
			i = -1; // Home tid
			j = -1; // Away tid

			tries = 0;
			while (i === j || numRemaining[i] === 0 || numRemaining[j] === 0 || teams[i].cid != teams[j].cid) {
				i = random.randInt(0, g.numTeams - 1);
				j = random.randInt(0, g.numTeams - 1);
				tries += 1;
				if (tries > 10000) {
				//	console.log(tids, tids.length);
				//	console.log(numRemaining.length);
					breakLoop = true;
					break;
					//throw new Error('Failed to generate schedule with ' + g.numTeams + ' teams and ' + numGames + ' games.');
				}
			}

			tids.push([i, j]);

			numRemaining[i] -= 1;
			numRemaining[j] -= 1;

			// Make sure we're not left with just one team to play itself
			if (numRemaining[i] === 0) {
				numWithRemaining -= 1;
			}
			if (numRemaining[j] === 0) {
				numWithRemaining -= 1;
			}
			if (numWithRemaining === 1) {
				// If this happens, we didn't find g.numGames for each team and one team will play a few less games
				break;
			}
		}

		return tids;
	}


    /**
     * Wrapper function to generate a new schedule with the appropriate algorithm based on the number of teams in the league.
     *
     * For 30 teams, use newScheduleDefault (NBA-like).
     *
     * @memberOf core.season
     * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
     */
    function newSchedule(teams: Team[]): [number, number][] {
        var days, i, j, jMax, tids, tidsInDays, used;
		let standardNumTeams = 10;
		let standardNumConferences = 1;

		let threeDivsPerConf = true;
		for (const conf of g.confs) {
			if (g.divs.filter(div => div.cid === conf.cid).length !== 1) {
				threeDivsPerConf = false;
				break;
			}
		}

        if (g.gameType == 0) {
		  standardNumTeams = 10;
		  standardNumConferences = 1;
		//  console.log("got here");
		} else if (g.gameType == 1) {
		  standardNumTeams = 30;
		  standardNumConferences = 3;
		//  console.log("got here");
		} else if (g.gameType == 2) {
		  standardNumTeams = 10;
		  standardNumConferences = 1;
		//  console.log("got here");
		} else if (g.gameType == 3) {
		  standardNumTeams = 12;
		  standardNumConferences = 1;
		  //console.log("got here");
		} else if (g.gameType == 4) {
		  standardNumTeams = 8;
		  standardNumConferences = 1;
		 // 		  console.log("got here");
		} else if (g.gameType == 5) {
			if (g.yearType == 2019) {
			  standardNumTeams = 116;
			  standardNumConferences = 13;
			} else {
			  standardNumTeams = 57;
			  standardNumConferences = 6;
			}
		 // 		  console.log("got here");
		} else if (g.gameType == 6) {
		  standardNumTeams = 57;
		  standardNumConferences = 6;
		 // 		  console.log("got here");
		} else if (g.gameType == 7) {
		  standardNumTeams = 129;
		  standardNumConferences = 18;
		  //		  console.log("got here");
		}
		//console.log(teams);
	//	console.log(g.confs);
	//	console.log(g.numTeams);

	//	console.log(g.gameType +" "+g.numTeams +" "+ standardNumTeams +" "+ g.numGames +" "+ g.confs.length + " "+ standardNumConferences+ " "+threeDivsPerConf);
//        if (g.numTeams === standardNumTeams && g.numGames == 0 && g.confs.length === standardNumConferences && threeDivsPerConf) {
        if (g.numTeams === standardNumTeams && g.numGames == 0 && g.confs.length === standardNumConferences) {
			//		console.log("standard");
            tids = newScheduleDefault(teams);
        } else if (g.numGames != 0) {
			// this may break game
            tids = newScheduleCrappy(teams);
        } else {
				//	console.log("crappy");
           // tids = newScheduleDefault(teams);
//            tids = newScheduleCrappy(teams);
// default schedule really robust now?
            tids = newScheduleDefault(teams);

        }

        // Order the schedule so that it takes fewer days to play
        random.shuffle(tids);
        days = [[]];
        tidsInDays = [[]];
        jMax = 0;

        for (i = 0; i < tids.length; i++) {
            used = false;
            for (j = 0; j <= jMax; j++) {
                if (tidsInDays[j].indexOf(tids[i][0]) < 0 && tidsInDays[j].indexOf(tids[i][1]) < 0) {
                    tidsInDays[j].push(tids[i][0]);
                    tidsInDays[j].push(tids[i][1]);
                    days[j].push(tids[i]);
                    used = true;
                    break;
                }
            }
            if (!used) {
                days.push([tids[i]]);
                tidsInDays.push([tids[i][0], tids[i][1]]);
                jMax += 1;
            }
        }

        random.shuffle(days); // Otherwise the most dense days will be at the beginning and the least dense days will be at the end
        tids = _.flatten(days, true);

        return tids;
    }

	function seriesStartEndSkip(seriesStart,seriesEnd,rnd, i) {
	//	console.log(g.gameType+" "+g.yearType+" "+rnd+" "+i);
		if (g.gameType == 5 && g.yearType == 2019) {
			if (rnd == 0 &&  i>1 && i<9) {
				i = 9;
			}
			if (rnd == 0 &&  i==10) {
				i = 11;
			}
//			if (rnd == 0 &&  i>13 && i<53) {
      if (rnd == 0 &&  i>13 && i<51) {
//				i = 53;
        i = 51;
			}

			if (rnd == 1 &&  i>1 && i<7) {
				i = 7;
			}
			if (rnd == 1 &&  i==8) {
				i = 9;
			}
			if (rnd == 1 &&  i>11 && i<38) {
				i = 38;
			}

			if (rnd == 2 &&  i>1 && i<6) {
				i = 6;
			}
			if (rnd == 2 &&  i==7) {
				i = 8;
			}
			if (rnd == 2 &&  i>10 && i<31) {
				i = 31;
			}

			if (rnd == 3 &&  i>1 && i<4) {
				i = 4;
			}
			if (rnd == 3 &&  i>4 && i<11) {
				i = 11;
			}
			//if (rnd == 3 &&  i>10 && i<31) {
			//	i = 31;
			//}

		}
			//console.log(g.gameType+" "+g.yearType+" "+rnd+" "+i);

		if ( (g.gameType == 5 && g.yearType == 0) || g.gameType == 6) {
			if (rnd == 0 && i==2) {
				i = 9;
			}
			if (rnd == 1 && i==2) {
				i = 7;
			}
			if (rnd == 2 && i==2) {
				i = 6;
			}
		}

		if (g.fullLadder == false) {
			if (rnd == 0 && i>6 && i<9) {
				i = 9;
			} else if (rnd == 1 && i==6) {
				i = 7;
			} else if (rnd == 2 && i==5) {
				i = 6;
			} else if (rnd == 3  && i==0) {
				i = 1;
			} else {
				//i = 6;
			}
		}

		if (g.gameType == 7 && g.seasonSplit == "Spring" && rnd == 0 && i>13 && i<16) {
			i = 16;
		}

		if (g.gameType == 7 && g.seasonSplit == "Spring" && rnd == 1 && i==12) {
			i = 13;
		}

		if (g.fullLadder == false) {
			if (rnd == 0) {
				if (i == 21 || i == 22) {
					i = 23;
				} else if (i == 28 || i == 29) {
					i = 30;
				} else if (i == 35 || i == 36) {
					i = 37;
				} else if (i == 42 || i == 43) {
					i = 44;
				} else if (i == 49 || i == 50) {
					i = 51;
				}
			}

			if (rnd == 1) {
				if (i == 17) {
					i = 18;
				} else if (i == 22) {
					i = 23;
				} else if (i == 27) {
					i = 28;
				} else if (i == 32) {
					i = 33;
				} else if (i == 37) {
					i = 51;
				}
			}
			if (rnd == 2) {
				if (i == 14) {
					i = 15;
				} else if (i == 18) {
					i = 19; // fix 19 lpl LCS promotion first game
				} else if (i == 22) {
					i = 23;
				} else if (i == 26) {
					i = 27;
				}
			//	if (i == 30) {
				//	i = 31;
				//}
			}
		}

		return i;
	}

	function seriesStartEnd(rnd) {
		//console.log(g.confs);
		// console.log(g.gameType);
		 var seriesStart, seriesEnd;
	//	 seriesEnd = series[rnd].length;
	// each LCS/CS promotion
	// rnd 0, 7
	// rnd 1, 5
	// rnd 2, 4
	// rnd 3, 1

	// max (next one should be)
	// rnd 0, 16
	// rnd 1, 13
	// rnd 2, 11
	// rnd 3, 4

	// tiers for new promos (5 of them)
	// rnd 0, 16+ 7*5 = 16+ 35 = 51 , 16 to 23, to 30, to 37, to 44, to 51
	// rnd 1, 13+ 5*5 = 13+ 25 = 38 , 13 to 18, to 23, to 28, to 33, to 38
	// rnd 2, 11+ 4*5 = 11 + 20 = 31, 11 to 15, to 19, to 23, to 27, to 31
	// didn't put in 3rd place game:
	// rnd 3, 4+  1*5 = 4 +   5 = 9,   4 to 5,  to 6,  to 7,  to 8,  to 9
	//
	// rnd 0, 52 53
	// rnd 1, 38,39
	// rnd 2, 31,32
	// rnd 3, 4 (this won't work with the ladder as is set up, but not an issue for now)
	// rnd 3 should be 10

		if (rnd == 0) {

			league.setGameAttributes({playoffType: 'rnd0'});

			if (g.gameType == 0) {
				seriesStart = 0;
				seriesEnd = 2;
			} else if (g.gameType == 1) {
				seriesStart = 0;
				seriesEnd = 9;
			} else if (g.gameType == 2) {
				seriesStart = 9;
				seriesEnd = 10;
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				seriesStart = 10;
				seriesEnd = 11;
			} else if (g.gameType == 3 &&  g.yearType == 2019) {
				seriesStart = 51;
				seriesEnd = 53;
			} else if (g.gameType == 4) {
				seriesStart = 11;
				seriesEnd = 12;
			} else if (g.gameType == 5 &&  g.yearType == 2019) {
				seriesStart = 0;
//				seriesEnd = 14;	// remove wild card games, what about new games?
				seriesEnd = 66;	// remove wild card games, what about new games?
				// need to skip 14,15 and up to 52
			} else if (g.gameType == 5 || (g.gameType == 6 && g.seasonSplit == "Summer")) {
//			} else if (g.gameType == 5) {
	//					seriesStart = 12;
	//					seriesEnd = 24;
//				seriesStart = 9;
				seriesStart = 0;
				seriesEnd = 16;
			} else if (g.gameType == 6) {
	//					seriesStart = 12;
	//					seriesEnd = 24;
//				seriesStart = 9;
				seriesStart = 0;
				seriesEnd = 14;

	// push this back
//				seriesStart = 16;
	//			seriesEnd = 18;
			} else if (g.gameType == 7 && g.seasonSplit == "Summer") {
	//					seriesStart = 12;
	//					seriesEnd = 24;
				seriesStart = 0;
//				seriesEnd = 16;
				if (g.fullLadder == false) {
					seriesEnd = 49;	// need to skip 14 and 15
				} else {
					seriesEnd = 51;	// need to skip 14 and 15
				}

			} else if (g.gameType == 7) {
	//					seriesStart = 12;
	//					seriesEnd = 24;
				seriesStart = 0;
//				seriesEnd = 14;
				if (g.fullLadder == false) {
					seriesEnd = 49;	// need to skip 14 and 15
				} else {
					seriesEnd = 51;	// need to skip 14 and 15
				}
			}
		} else if (rnd == 1) {

			league.setGameAttributes({playoffType: 'rnd1'});
			if (g.gameType == 0) {
				seriesStart = 0;
				seriesEnd = 2;
			} else if (g.gameType == 1) {
				seriesStart = 0;
				seriesEnd = 7;
			} else if (g.gameType == 2) {
				seriesStart = 7;
				seriesEnd = 8;
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				seriesStart = 8;
				seriesEnd = 9;
			} else if (g.gameType == 3 &&  g.yearType == 2019) {
				seriesStart = 38;
				seriesEnd = 40;
			} else if (g.gameType == 4) {
				seriesStart = 9;
				seriesEnd = 10;
			} else if (g.gameType == 5 &&  g.yearType == 2019) {
				seriesStart = 0;
				seriesEnd = 51;

			} else if (g.gameType == 5 || (g.gameType == 6 && g.seasonSplit == "Summer")) {
//			} else if (g.gameType == 5) {
//				seriesStart = 7;
				seriesStart = 0;
				seriesEnd = 13;
			} else if (g.gameType == 6) {
				//seriesStart = 7;
				seriesStart = 0;
				seriesEnd = 12;
		/*	} else if (g.gameType == 7 && g.seasonSplit == "Summer") {
//			} else if (g.gameType == 5) {
				seriesStart = 0;
				seriesEnd = 13;				*/
			} else if (g.gameType == 7) {
				seriesStart = 0;
//				seriesEnd = 12;
				if (g.fullLadder == false) {
					seriesEnd = 37;	// need to skip 14 and 15
				} else {
					seriesEnd = 38;	// need to skip 14 and 15
				}
			}
		} else if (rnd == 2) {
			league.setGameAttributes({playoffType: 'rnd2'});
			//console.log("rnd: "+rnd);
			if (g.gameType == 0) {
				seriesStart = 0;
				seriesEnd = 2;
			} else if (g.gameType == 1) {
				seriesStart = 0;
				seriesEnd = 6;
			} else if (g.gameType == 2) {
				seriesStart = 6;
				seriesEnd = 7;
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				seriesStart = 7;
				seriesEnd = 8;
			} else if (g.gameType == 3 &&  g.yearType == 2019) {
				seriesStart = 31;
				seriesEnd = 33;
			} else if (g.gameType == 4) {
				seriesStart = 8;
				seriesEnd = 9;
			} else if (g.gameType == 5 &&  g.yearType == 2019) {
				seriesStart = 0;
				seriesEnd = 38;
//			} else if (g.gameType == 5 || (g.gameType == 6 && g.seasonSplit == "Summer")) {
			} else if (g.gameType == 5 || g.gameType == 6) {
				//seriesStart = 6;

				seriesStart = 0;
				seriesEnd = 11;
			} else if (g.gameType == 7) {
				seriesStart = 0;
				if (g.fullLadder == false) {
					seriesEnd = 30;	// need to skip 14 and 15 (bad), /works skips 18 and 19 // breaks
				} else {
					seriesEnd = 31;	// need to skip 14 and 15
				}

			}
		} else if (rnd == 3) {
			league.setGameAttributes({playoffType: 'rnd3'});
			if (g.gameType == 0) {
				seriesStart = 0;
				seriesEnd = 0;
			} else if (g.gameType == 1) {
				seriesStart = 0;
				seriesEnd = 1;
			} else if (g.gameType == 2) {
				seriesStart = 1;
				seriesEnd = 2;
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				seriesStart = 2;
				seriesEnd = 4;
			} else if (g.gameType == 3 &&  g.yearType == 2019) {
				seriesStart = 4;
				seriesEnd = 5;
			} else if (g.gameType == 4) {
				seriesStart = 4;
				seriesEnd = 4;
			} else if (g.gameType == 5 &&  g.yearType == 2019) {
				seriesStart = 1;
				seriesEnd = 12;
			//} else if (g.gameType == 5 || (g.gameType == 6 && g.seasonSplit == "Summer")) {
			} else if (g.gameType == 5 || g.gameType == 6) {
				seriesStart = 1;
				seriesEnd = 4;
			} else if (g.gameType == 7) {

			// push this back
				seriesStart = 0;
				seriesEnd = 4;
			}
		} else if (rnd == 4) {
			league.setGameAttributes({playoffType: 'rnd4'});
			if (g.gameType == 0) {
				seriesStart = 0;
				seriesEnd = 0;
			} else if (g.gameType == 1) {
				seriesStart = 0;
				seriesEnd = 0;
			} else if (g.gameType == 2) {
				seriesStart = 0;
				seriesEnd = 0;
			} else if (g.gameType == 3 &&  g.yearType == 0) { // 2019 not reached
				seriesStart = 0;
				seriesEnd = 2;
			} else if (g.gameType == 4) {
				seriesStart = 2;
				seriesEnd = 2;
			//} else if (g.gameType == 5 || (g.gameType == 6 && g.seasonSplit == "Summer")) {
			} else if (g.gameType == 5 &&  g.yearType == 2019) {
				seriesStart = 0;
				seriesEnd = 0;
			} else if (g.gameType >= 5) {
				seriesStart = 0;
				seriesEnd = 2;
			} else if (g.gameType == 6) {

			// push this back
				seriesStart = 2;
				seriesEnd = 3;
			}
		} else if (rnd == 5) {
			league.setGameAttributes({playoffType: 'rnd5'});
			if (g.gameType == 0) {
				seriesStart = 0;
				seriesEnd = 0;
			} else if (g.gameType == 1) {
				seriesStart = 0;
				seriesEnd = 0;
			} else if (g.gameType == 2) {
				seriesStart = 0;
				seriesEnd = 0;
			} else if (g.gameType == 3) {
				seriesStart = 0;
				seriesEnd = 2;
			} else if (g.gameType == 4) {
				seriesStart = 2;
				seriesEnd = 2;
			} else if (g.gameType == 5 &&  g.yearType == 2019) {
				seriesStart = 0;
				seriesEnd = 0;
			//} else if (g.gameType == 5 || (g.gameType == 6 && g.seasonSplit == "Summer")) {
			} else if (g.gameType >= 5) {
				seriesStart = 0;
				seriesEnd = 2;
			}
		} else if (rnd == 6) {
			if (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) {
				league.setGameAttributes({playoffType: 'rgnls'});

				seriesStart = 0;
				seriesEnd = 8;
	//					seriesEnd = 6;
			} else if (g.gameType >= 6) {
				league.setGameAttributes({playoffType: 'plyn'});

				seriesStart = 8;
				seriesEnd = 10;  //2,1,3,2,1
			}
		} else if (rnd == 7) {
			if (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) {
				league.setGameAttributes({playoffType: 'rgnls'});
				seriesStart = 0;
				seriesEnd = 4;
			} else if (g.gameType >= 6) {
				league.setGameAttributes({playoffType: 'plyn'});

				seriesStart = 4;
				seriesEnd = 5;  //1,3,2,1
			}
		} else if (rnd == 8) {
			league.setGameAttributes({playoffType: 'grps'});
			if (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) {
				seriesStart = 0;
				seriesEnd = 8;
			} else if (g.gameType >= 6) {
				seriesStart = 8;
				seriesEnd = 11;  //3,2,1
			}
		} else if (rnd == 9) {

			if (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) {
				if (g.yearType == 2019) {
					league.setGameAttributes({playoffType: 'playIn'});
				} else {
					league.setGameAttributes({playoffType: 'wrlds1'});
				}
				seriesStart = 0;
				seriesEnd = 4;
			} else if (g.gameType >= 6) {
				league.setGameAttributes({playoffType: 'knck'});

				seriesStart = 4;
				seriesEnd = 6;  //2,1
			}
		} else if (rnd == 10) {
			if (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) {
				league.setGameAttributes({playoffType: 'wrlds2'});
				seriesStart = 0;
				if (g.yearType == 2019) {
					seriesEnd = 0;
				} else {
					seriesEnd = 2;
				}
			} else if (g.gameType >= 6) {
				league.setGameAttributes({playoffType: 'fnls'});

				seriesStart = 2;
				seriesEnd = 3 ;  //1
			}
		} else if (rnd == 11) {
			league.setGameAttributes({playoffType: 'wrldsf'});
			if (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) {
				seriesStart = 0;
				if (g.yearType == 2019) {
					seriesEnd = 0;
				} else {
					seriesEnd = 1;
				}
			}
		} else if (rnd == 12) {
			league.setGameAttributes({playoffType: 'grps2'});
				seriesStart = 0;
				seriesEnd = 8;
		} else if (rnd == 13) {
								league.setGameAttributes({playoffType: 'wrlds1'});
				seriesStart = 0;
				seriesEnd = 4;
		} else if (rnd == 14) {
								league.setGameAttributes({playoffType: 'wrlds2'});
				seriesStart = 0;
				seriesEnd = 2;
		} else if (rnd == 15) {
								league.setGameAttributes({playoffType: 'wrldsf'});
				seriesStart = 0;
				seriesEnd = 1;
		}
		//console.log(g.confs);

		return {
			seriesStart: seriesStart,
			seriesEnd: seriesEnd,
		};
	}

	function remainingGamesInSeries(tids, rnd, series, seriesStart, seriesEnd) {

		//	 var seriesStart, seriesEnd;
		var wonNeeded, numGames;
		var totalWins;
		var threeWins,threeWinsLocation,j;
		var i;
	//	console.log(series);

//		if ( (g.gameType == 5 || (g.gameType == 6 && g.seasonSplit == "Summer")) && rnd<3) {

// ?? Do we need this?
	/*	if ( (g.gameType == 5 || g.gameType == 6) && rnd<3) {
			// standard is 3
			wonNeeded = g.playoffWins;
			for (i = 0; i < 2; i++) {
				if ( (series[rnd][i].home.won < wonNeeded) && (series[rnd][i].away.won < wonNeeded) ) {
					// Make sure to set home/away teams correctly! Home for the lower seed is 1st, 2nd, 5th, and 7th games.
					numGames = series[rnd][i].home.won + series[rnd][i].away.won;
					if (numGames === 0  || numGames === 2 || numGames === 4) {
						tids.push([series[rnd][i].home.tid, series[rnd][i].away.tid]);
					} else {
						tids.push([series[rnd][i].away.tid, series[rnd][i].home.tid]);
					}
				}
			}

		}*/



		if ( (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) && (rnd == 8 || rnd == 12)) {
		    let totalWinsArray = [];
			if (g.yearType == 2019 && rnd == 8) {
				totalWinsArray.push(series[8][0].home.won+series[8][0].away.won+series[8][1].home.won)
				totalWinsArray.push(series[8][2].home.won+series[8][2].away.won+series[8][3].home.won)
				totalWinsArray.push(series[8][4].home.won+series[8][4].away.won+series[8][5].home.won)
				totalWinsArray.push(series[8][6].home.won+series[8][6].away.won+series[8][7].home.won)

			//	console.log(series[8][0].home.won+" "+series[8][0].away.won+" "+series[8][1].home.won)
			////	console.log(series[8][2].home.won+" "+series[8][2].away.won+" "+series[8][3].home.won)
			//	console.log(series[8][4].home.won+" "+series[8][4].away.won+" "+series[8][5].home.won)
			//	console.log(series[8][6].home.won+" "+series[8][6].away.won+" "+series[8][7].home.won)

			//	console.log(totalWinsArray);
				totalWinsArray.sort();
	//			console.log(totalWinsArray);
				totalWins = totalWinsArray[totalWinsArray.length-1];
//console.log(totalWins);
			} else {
				totalWinsArray.push(series[rnd][0].home.won+series[rnd][0].away.won+series[rnd][1].home.won+series[rnd][1].away.won);
				totalWinsArray.push(series[rnd][2].home.won+series[rnd][2].away.won+series[rnd][3].home.won+series[rnd][3].away.won);
				totalWinsArray.push(series[rnd][4].home.won+series[rnd][4].away.won+series[rnd][5].home.won+series[rnd][5].away.won);
				totalWinsArray.push(series[rnd][6].home.won+series[rnd][6].away.won+series[rnd][7].home.won+series[rnd][7].away.won);


				//console.log(totalWinsArray);
				totalWinsArray.sort();
				//console.log(totalWinsArray);
				totalWins = totalWinsArray[totalWinsArray.length-1];
//console.log(totalWins);
			}
		}
		// change to 7?
//		if (g.gameType == 6 && g.seasonSplit == "Spring" && rnd == 2) {
		if (g.gameType >= 6 && g.seasonSplit == "Spring" && rnd == 8) {
			totalWins = series[8][8].home.won+series[8][9].away.won+series[8][10].home.won+series[8][10].away.won+series[8][9].home.won+series[8][8].away.won;
		}
			//	console.log(tids);
			let neededWins = 12;
			if (g.yearType == 2019 && rnd == 8) {
				neededWins = 6;
			}
		if ( (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) && (rnd == 8 || rnd == 12) && totalWins < neededWins) {

	//		console.log("Groups");
			// Group A
			// Group B
			// Group C
			// Group D

			//console.log(series);
			for (i = 0; i < 4; i++) {
				if (g.yearType == 2019 && rnd == 8) {
					if (totalWins < 1) {
						tids.push([series[8][0+i*2].home.tid, series[8][0+i*2].away.tid]);
					} else if (totalWins == 1 ) {
						tids.push([series[8][0+i*2].home.tid, series[8][1+i*2].home.tid]);
					} else if (totalWins == 2 ) {
						tids.push([series[8][1+i*2].home.tid, series[8][0+i*2].away.tid]);
					} else if (totalWins == 3) {
						tids.push( [series[8][0+i*2].away.tid,series[8][0+i*2].home.tid]);
					} else if (totalWins == 4) {
						tids.push( [series[8][1+i*2].home.tid,series[8][0+i*2].home.tid]);
					} else if (totalWins == 5) {
						tids.push( [series[8][0+i*2].away.tid,series[8][1+i*2].home.tid]);
					}


				} else {

					// just use rnd
					// 8 for normal
					// 12 for 2019
				//	console.log(i+" "+totalWins);
				if (totalWins < 2) {
					tids.push([series[rnd][0+i*2].home.tid, series[rnd][0+i*2].away.tid]);
					tids.push([series[rnd][1+i*2].home.tid, series[rnd][1+i*2].away.tid]);
				} else if (totalWins == 2 ) {
					tids.push([series[rnd][0+i*2].home.tid, series[rnd][1+i*2].away.tid]);
					tids.push([series[rnd][1+i*2].home.tid, series[rnd][0+i*2].away.tid]);
				} else if (totalWins == 4) {
					tids.push([series[rnd][0+i*2].home.tid, series[rnd][1+i*2].home.tid]);
					tids.push([series[rnd][1+i*2].away.tid, series[rnd][0+i*2].away.tid]);
				} else if (totalWins == 6) {
					tids.push([series[rnd][0+i*2].away.tid, series[rnd][0+i*2].home.tid]);
					tids.push([series[rnd][1+i*2].away.tid, series[rnd][1+i*2].home.tid]);
				} else if (totalWins == 8) {
					tids.push([series[rnd][1+i*2].away.tid, series[rnd][0+i*2].home.tid]);
					tids.push([series[rnd][0+i*2].away.tid, series[rnd][1+i*2].home.tid]);
				} else if (totalWins == 10) {
					  series[rnd][0+i*2].home.loss = 0;
					  series[rnd][0+i*2].away.loss = 0;
					  series[rnd][1+i*2].home.loss = 0;
					  series[rnd][1+i*2].away.loss = 0;

					tids.push([series[rnd][1+i*2].home.tid, series[rnd][0+i*2].home.tid]);
					tids.push([series[rnd][0+i*2].away.tid, series[rnd][1+i*2].away.tid]);
				}
				}
		//	console.log(i);
		//	console.log(tids);
			}
//console.log(rnd);
//console.log(i);
//console.log(tids);
		//	console.log(tids);
		} else if ( (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) && (rnd == 8 || rnd == 12) && totalWins >= neededWins) {
	//			} else if (g.gameType == 5 && rnd == 8 ) {
	//	console.log("Groups-Wild");


	        if (g.yearType == 2019 && rnd == 8) {
				// tie at 3 (now j)
					for (j = 2; j < 4; j++) {
						for (i = 0; i < 4; i++) {

							threeWinsLocation = [[],[],[]];
							threeWins = 0;
							// Groups TieBreakers
							if (series[8][0+i*2].home.won == j) {
							  threeWins += 1;
							  threeWinsLocation[threeWins-1] = series[8][0+i*2].home.tid;
							}
							if (series[8][0+i*2].away.won == j) {
							  threeWins += 1;
							  threeWinsLocation[threeWins-1] = series[8][0+i*2].away.tid;
							}
							if (series[8][1+i*2].home.won == j) {
							  threeWins += 1;
							  threeWinsLocation[threeWins-1] = series[8][1+i*2].home.tid;
							}

							if (j == 2 && threeWins == 3) {
								// handle straight 3,3,0 or tie breaker 3,3,2
									tids.push([threeWinsLocation[0], threeWinsLocation[1]]);

							} else if (j == 3 && threeWins == 2 && totalWins ==  neededWins) {
									tids.push([threeWinsLocation[0], threeWinsLocation[1]]);
							} else if (j == 2 && threeWins == 2 && totalWins ==  neededWins+1) {
								// handle 2nd game if three way tie of 2 wins
									tids.push([threeWinsLocation[0], threeWinsLocation[1]]);
							}
						}
					}
			} else {
			// tie at 3 (now j)
		//	console.log(rnd);
		//	console.log(series);

				for (j = 3; j < 6; j++) {
					for (i = 0; i < 4; i++) {

						threeWinsLocation = [[],[],[],[]];
						threeWins = 0;
						// Groups TieBreakers
						//console.log(rnd+" "+i);
						//console.log(series[rnd][0+i*2]);
						//console.log(series[rnd][1+i*2]);

						if (series[rnd][0+i*2].home.won == j) {
						  threeWins += 1;
						  threeWinsLocation[threeWins-1] = series[rnd][0+i*2].home.tid;
						}

						if (series[rnd][0+i*2].away.won == j) {
						  threeWins += 1;
						  threeWinsLocation[threeWins-1] = series[rnd][0+i*2].away.tid;
						}
						if (series[rnd][1+i*2].home.won == j) {
						  threeWins += 1;
						  threeWinsLocation[threeWins-1] = series[rnd][1+i*2].home.tid;
						}
						if (series[rnd][1+i*2].away.won == j) {
						  threeWins += 1;
						  threeWinsLocation[threeWins-1] = series[rnd][1+i*2].away.tid;
						}

						if (threeWins == 2 || threeWins == 3 ) {
								tids.push([threeWinsLocation[0], threeWinsLocation[1]]);

								threeWins = 0;
								if ((series[rnd][0+i*2].home.won == j) && (threeWins <2)) {
								  threeWins += 1;
								  series[rnd][0+i*2].home.loss += 1;
								}
								if ((series[rnd][0+i*2].away.won == j) && (threeWins <2)) {
								  threeWins += 1;
								  series[rnd][0+i*2].away.loss += 1;
								}
								if ((series[rnd][1+i*2].home.won == j) && (threeWins <2)) {
								  threeWins += 1;
								  series[rnd][1+i*2].home.loss += 1;
								}
								if ((series[rnd][1+i*2].away.won == j) && (threeWins <2)) {
								  threeWins += 1;
								  series[rnd][1+i*2].away.loss += 1;
								}

						} else if (threeWins == 4) {
								tids.push([threeWinsLocation[0], threeWinsLocation[1]]);
								tids.push([threeWinsLocation[2], threeWinsLocation[3]]);

								if ((series[rnd][0+i*2].home.won == j) ) {
								  series[rnd][0+i*2].home.loss += 1;
								}
								if ((series[rnd][0+i*2].away.won == j) ) {
								  series[rnd][0+i*2].away.loss += 1;
								}
								if ((series[rnd][1+i*2].home.won == j) ) {
								  series[rnd][1+i*2].home.loss += 1;
								}
								if ((series[rnd][1+i*2].away.won == j) ) {
								  series[rnd][1+i*2].away.loss += 1;
								}
						}
					}
				}
			}
			// change to 7?
//		} else if ( (g.gameType == 6 && g.seasonSplit == "Spring" )&& rnd == 2 && totalWins < 30) {
		} else if ( (g.gameType >= 6 && g.seasonSplit == "Spring" ) && rnd == 8 && totalWins < 30) {
		//} else if (g.gameType == 10 && rnd == 2 && totalWins < 30) {

	//		console.log("Groups");
			// Group A
			// Group B
			// Group C
			// Group D

			if (totalWins < 3) {

				tids.push([series[8][8].home.tid, series[8][8].away.tid]);
				tids.push([series[8][10].home.tid, series[8][9].away.tid]);
				tids.push([series[8][9].home.tid, series[8][10].away.tid]);

			} else if (totalWins == 3 ) {
				tids.push([series[8][10].home.tid, series[8][8].away.tid]);
				tids.push([series[8][9].home.tid, series[8][9].away.tid]);
				tids.push([series[8][8].home.tid, series[8][10].away.tid]);

			} else if (totalWins == 6) {
				tids.push([series[8][9].home.tid, series[8][8].away.tid]);
				tids.push([series[8][8].home.tid, series[8][9].away.tid]);
				tids.push([series[8][10].home.tid, series[8][10].away.tid]);
			} else if (totalWins == 9) {
				tids.push([series[8][8].home.tid, series[8][9].home.tid]);
				tids.push([series[8][8].away.tid, series[8][9].away.tid]);
			} else if (totalWins == 11) {
				tids.push([series[8][9].home.tid, series[8][10].home.tid]);
				tids.push([series[8][9].away.tid, series[8][10].away.tid]);
			} else if (totalWins == 13) {
				tids.push([series[8][8].home.tid, series[8][10].home.tid]);
				tids.push([series[8][8].away.tid, series[8][10].away.tid]);
			} else if (totalWins == 15) {
				tids.push([series[8][8].away.tid, series[8][8].home.tid]);
				tids.push([series[8][10].away.tid, series[8][9].home.tid]);
				tids.push([series[8][9].away.tid, series[8][10].home.tid]);
			} else if (totalWins == 18) {
				tids.push([series[8][10].away.tid, series[8][8].home.tid]);
				tids.push([series[8][9].away.tid, series[8][9].home.tid]);
				tids.push([series[8][8].away.tid, series[8][10].home.tid]);
			} else if (totalWins == 21) {
				tids.push([series[8][9].away.tid, series[8][8].home.tid]);
				tids.push([series[8][8].away.tid, series[8][9].home.tid]);
				tids.push([series[8][10].away.tid, series[8][10].home.tid]);
			} else if (totalWins == 24) {
				tids.push([series[8][9].home.tid, series[8][8].home.tid]);
				tids.push([series[8][9].away.tid, series[8][8].away.tid]);
			} else if (totalWins == 26) {
				tids.push([series[8][10].home.tid, series[8][9].home.tid]);
				tids.push([series[8][10].away.tid, series[8][9].away.tid]);
			} else if (totalWins == 28) {
				  series[8][8].home.loss = 0;
				  series[8][8].away.loss = 0;
				  series[8][9].home.loss = 0;
				  series[8][9].away.loss = 0;
				  series[8][10].home.loss = 0;
				  series[8][10].away.loss = 0;

				tids.push([series[8][10].home.tid, series[8][8].home.tid]);
				tids.push([series[8][10].away.tid, series[8][8].away.tid]);
			}
			//console.log(tids);
		} else if (rnd != 8 && rnd != 12) {
		//	console.log(series);
//			console.log(series);
	//		console.log(rnd);
		//	console.log(seriesStart+" "+seriesEnd);

			for (i = seriesStart; i < seriesEnd; i++) {
				//if (rnd == 6 && g.seasonSplit == "Spring") {
//					console.log(i+" "+seriesStart+" "+seriesEnd);
	//			}

				//console.log(i);
				// standard is 3
				wonNeeded = g.playoffWins;
//console.log(i);
				i = seriesStartEndSkip(seriesStart,seriesEnd,rnd, i);
//console.log(i);
			/*	if (rnd == 6 && g.seasonSplit == "Spring") {
					console.log(i+" "+seriesStart+" "+seriesEnd+" "+wonNeeded);
					console.log(wonNeeded);
					console.log(series[rnd][i].home.won);
					console.log(series[rnd][i].away.won);

				}				*/
			//	console.log(rnd+" "+i);
			////	console.log(series);
		//	//	console.log(series[rnd]);
			////	console.log(series[rnd][i]);
			//	console.log(series[rnd][i].home.tid);
	///	//		console.log(series[rnd][i].home.won);
		///		console.log(series[rnd][i].away.tid);
			//	console.log(series[rnd][i].away.won);
				if ( (series[rnd][i].home.won < wonNeeded) && (series[rnd][i].away.won < wonNeeded) ) {
					// Make sure to set home/away teams correctly! Home for the lower seed is 1st, 2nd, 5th, and 7th games.
					numGames = series[rnd][i].home.won + series[rnd][i].away.won;
				/*if (rnd == 6 && g.seasonSplit == "Spring") {
					console.log(numGames);
					console.log(rnd);
					console.log(i);
					console.log(series[rnd][i].home.tid);
					console.log(series[rnd][i].away.tid);
					console.log(series[rnd][i]);
console.log(JSON.parse(JSON.stringify(series)));
				}*/

					if (numGames === 0  || numGames === 2 || numGames === 4  || numGames === 6  || numGames === 8) {
						tids.push([series[rnd][i].home.tid, series[rnd][i].away.tid]);
					//	console.log(series[rnd][i].home.tid+" "+ series[rnd][i].away.tid);
					} else {
						tids.push([series[rnd][i].away.tid, series[rnd][i].home.tid]);
					//	console.log(series[rnd][i].away.tid+" "+ series[rnd][i].home.tid);
					}
				}
			/*	if (rnd == 6 && g.seasonSplit == "Spring") {
					console.log(tids);
				}					*/

				//console.log(tids);
			}
		}

	//	console.log(rnd);
//		console.log(tids);
	//	console.log(series);

		return {
			tids: tids,
			series: series,
		};
	}


// , 0, 1, 0
	function createSeriesOneExisting(series, tidsWon, tidsLost, rnd, rndLocation, rnd2, rnd2Location, extraWon, anyWon, anyLost,winnerLoser) {

		var team1, team2, matchup;

		/*	console.log(rnd2+" "+rnd2Location);
			console.log(series);
			console.log(series[rnd2]);
			console.log(series[rnd2][rnd2Location]);
			console.log(series[rnd2][rnd2Location].home);			*/

			team1 = helpers.deepCopy(series[rnd2][rnd2Location].home);
			//console.log(team1);
			if (winnerLoser == "loser") {
				if (series[rnd][rndLocation].away.won >= g.playoffWins) {
					team2 = helpers.deepCopy(series[rnd][rndLocation].home);
					if (anyWon) {
						tidsWon.push(series[rnd][rndLocation].home.tid);
					}
					if (extraWon) {
						//should this be there for all or just first one or none?
						tidsWon.push(series[rnd2][rnd2Location].home.tid);
					}

					if (anyLost) {
						tidsLost.push(series[rnd][rndLocation].away.tid);
					}
				} else {
					team2 = helpers.deepCopy(series[rnd][rndLocation].away);
					if (anyWon) {
						tidsWon.push(series[rnd][rndLocation].away.tid);
					}
					if (extraWon) {
						//should this be there for all or just first one or none?
						tidsWon.push(series[rnd2][rnd2Location].home.tid);
					}

					if (anyLost) {
						tidsLost.push(series[rnd][rndLocation].home.tid);
					}
				}

			} else {
				if (series[rnd][rndLocation].home.won >= g.playoffWins) {
					team2 = helpers.deepCopy(series[rnd][rndLocation].home);
					if (anyWon) {
						tidsWon.push(series[rnd][rndLocation].home.tid);
					}
					if (extraWon) {
						//should this be there for all or just first one or none?
						tidsWon.push(series[rnd2][rnd2Location].home.tid);
					}

					if (anyLost) {
						tidsLost.push(series[rnd][rndLocation].away.tid);
					}
				} else {
					team2 = helpers.deepCopy(series[rnd][rndLocation].away);
					if (anyWon) {
						tidsWon.push(series[rnd][rndLocation].away.tid);
					}
					if (extraWon) {
						//should this be there for all or just first one or none?
						tidsWon.push(series[rnd2][rnd2Location].home.tid);
					}

					if (anyLost) {
						tidsLost.push(series[rnd][rndLocation].home.tid);
					}
				}
			}
			//console.log(team2);
			matchup = {home: team1, away: team2};
			matchup.home.won = 0;
			matchup.away.won = 0;
			series[rnd2][rnd2Location] = matchup;


		return {
			tidsWon: tidsWon,
			tidsLost: tidsLost,
			series: series,
		};
	}

	// rnd, 2, & 1 2
	function createSeriesBothNew(series, tidsWon, tidsLost, rnd, rndLocation, rnd2, rnd2Location, winnersLosers, tidsLostUsed, tidsWonUsed) {

		var team1, team2, matchup;
//console.log(g.confs);
	  // i = 2;
	//  console.log(series);
	//  console.log(series[rnd][rndLocation]);
	//  console.log(series[rnd][rndLocation+1]);

		if (winnersLosers == "winners") {
			if (series[rnd][rndLocation].home.won >= g.playoffWins) {
				team1 = helpers.deepCopy(series[rnd][rndLocation].home);
				if (tidsWonUsed) {
					tidsWon.push(series[rnd][rndLocation].home.tid);
				}
				if (tidsLostUsed) {
					tidsLost.push(series[rnd][rndLocation].away.tid);
				}
			} else {
				team1 = helpers.deepCopy(series[rnd][rndLocation].away);
				if (tidsWonUsed) {
					tidsWon.push(series[rnd][rndLocation].away.tid);
				}
				if (tidsLostUsed) {
					tidsLost.push(series[rnd][rndLocation].home.tid);
				}
			}
			if (series[rnd][rndLocation + 1].home.won >= g.playoffWins) {
				team2 = helpers.deepCopy(series[rnd][rndLocation + 1].home);
				if (tidsWonUsed) {
					tidsWon.push(series[rnd][rndLocation + 1].home.tid);
				}
				if (tidsLostUsed) {
					tidsLost.push(series[rnd][rndLocation + 1].away.tid);
				}
			} else {
				team2 = helpers.deepCopy(series[rnd][rndLocation + 1].away);
				if (tidsWonUsed) {
					tidsWon.push(series[rnd][rndLocation + 1].away.tid);
				}

				if (tidsLostUsed) {
					tidsLost.push(series[rnd][rndLocation + 1].home.tid);
				}
			}
		} else if (winnersLosers == "losers") {
			if (series[rnd][rndLocation].away.won >= g.playoffWins) {
				team1 = helpers.deepCopy(series[rnd][rndLocation].home);
				if (tidsWonUsed) {
					tidsWon.push(series[rnd][rndLocation].home.tid);
				}
				if (tidsLostUsed) {
					tidsLost.push(series[rnd][rndLocation].away.tid);
				}
			} else {
				team1 = helpers.deepCopy(series[rnd][rndLocation].away);
				if (tidsWonUsed) {
					tidsWon.push(series[rnd][rndLocation].away.tid);
				}
				if (tidsLostUsed) {
					tidsLost.push(series[rnd][rndLocation].home.tid);
				}
			}
			if (series[rnd][rndLocation + 1].away.won >= g.playoffWins) {
				team2 = helpers.deepCopy(series[rnd][rndLocation + 1].home);
				if (tidsWonUsed) {
					tidsWon.push(series[rnd][rndLocation + 1].home.tid);
				}
				if (tidsLostUsed) {
					tidsLost.push(series[rnd][rndLocation + 1].away.tid);
				}
			} else {
				team2 = helpers.deepCopy(series[rnd][rndLocation + 1].away);
				if (tidsWonUsed) {
					tidsWon.push(series[rnd][rndLocation + 1].away.tid);
				}
				if (tidsLostUsed) {
					tidsLost.push(series[rnd][rndLocation + 1].home.tid);
				}
			}

		} else {
			console.log("something wrong");
		}

		//	console.log(team1);
		//	console.log(team2);

		matchup = {home: team1, away: team2};
		matchup.home.won = 0;
		matchup.away.won = 0;
		series[rnd2][rnd2Location] = matchup;
//console.log(g.confs);
		return {
			tidsWon: tidsWon,
			tidsLost: tidsLost,
			series: series,
		};
	}

	function createMSIPlayIn(series, tidsWon, tidsLost, rnd, rndLocation, rnd2, rnd2Location, rnd3, rnd3Location) {
//	function createMSIPlayIn(series, tidsWon, tidsLost, rnd, 16, 2, 11, 1, 13) {

		var team1, team2, matchup;
		var Team1PlayIn, Team2PlayIn;
		var key, key2;
		var Team1EU, Team1LCK, Team1LPL;

		//i = 16;
		//console.log(rnd);
		//console.log(rndLocation);
		//console.log(rndLocation+1);
		//console.log(tidsWon);
		//console.log(tidsLost);
		//console.log(series);
		if (series[rnd][rndLocation].home.won >= g.playoffWins) {
			team1 = helpers.deepCopy(series[rnd][rndLocation].away);
			Team1PlayIn = helpers.deepCopy(series[rnd][rndLocation].home);
			tidsWon.push(series[rnd][rndLocation].home.tid);
			tidsLost.push(series[rnd][rndLocation].away.tid);
			key = series[rnd][rndLocation].home.tid;

		} else {
			team1 = helpers.deepCopy(series[rnd][rndLocation].home);
			Team1PlayIn = helpers.deepCopy(series[rnd][rndLocation].away);
			tidsWon.push(series[rnd][rndLocation].away.tid);
			tidsLost.push(series[rnd][rndLocation].home.tid);
			key = series[rnd][rndLocation].away.tid;
		}
		if (series[rnd][rndLocation + 1].home.won >= g.playoffWins) {
			team2 = helpers.deepCopy(series[rnd][rndLocation + 1].away);
			Team2PlayIn = helpers.deepCopy(series[rnd][rndLocation + 1].home);
			tidsWon.push(series[rnd][rndLocation + 1].home.tid);
			tidsLost.push(series[rnd][rndLocation + 1].away.tid);
			key2 = series[rnd][rndLocation + 1].home.tid;
		} else {
			team2 = helpers.deepCopy(series[rnd][rndLocation + 1].home);
			Team2PlayIn = helpers.deepCopy(series[rnd][rndLocation + 1].away);
			tidsWon.push(series[rnd][rndLocation + 1].away.tid);
			tidsLost.push(series[rnd][rndLocation + 1].home.tid);
			key2 = series[rnd][rndLocation + 1].away.tid;
		}
		//console.log(tidsWon);
		//console.log(tidsLost);


		// Update Group Stage
		Team1EU = helpers.deepCopy(series[rnd2][rnd2Location].away);
		Team1LCK = helpers.deepCopy(series[rnd2][rnd2Location].home);

		matchup = {home: Team1EU, away: Team1LCK};

		matchup.home.won = 0;
		matchup.away.won = 0;
		matchup.home.loss = 0;
		matchup.away.loss = 0;
		series[rnd2][rnd2Location] = matchup;


//					Team1EU = helpers.deepCopy(series[2][11].home);
//				Team1LCK = helpers.deepCopy(series[2][12].home);
		Team1LPL = helpers.deepCopy(series[rnd2][rnd2Location+1].home);
		//Team1LCK = helpers.deepCopy(series[2][12].home);

		matchup = {home: Team1LPL, away: Team1PlayIn};
		matchup.home.won = 0;
		matchup.away.won = 0;
		matchup.home.loss = 0;
		matchup.away.loss = 0;
		series[rnd2][rnd2Location+1] = matchup;

		matchup = {home: Team2PlayIn, away: Team2PlayIn};
		matchup.home.won = 0;
		matchup.away.won = 0;
		matchup.home.loss = 0;
		matchup.away.loss = 0;
		series[rnd2][rnd2Location+2] = matchup;


		/*console.log(Team1EU);
		console.log(Team1LCK);
		console.log(Team1LPL);
		console.log(Team1PlayIn);
		console.log(Team2PlayIn);*/

		// Update Play In Loser's Bracket

		matchup = {home: team1, away: team2};
		matchup.home.won = 0;
		matchup.away.won = 0;
		matchup.home.loss = 0;
		matchup.away.loss = 0;
		series[rnd3][rnd3Location] = matchup;




		return {
			tidsWon: tidsWon,
			tidsLost: tidsLost,
			series: series,
			key: key,
			key2: key2,
		};
	}

async function updateTeamSeasons(teamSeason, rnd, rndLocation,playoffRoundsWon,playoffRoundsWonType,winnerOrLoser) {

		if (g.gameType < 6 || (g.gameType == 6  && g.seasonSplit == "Summer"))  {
			teamSeason.playoffRoundsWon = playoffRoundsWon;
		//	console.log(teamSeason.playoffRoundsWon);

		} else if (g.gameType == 6 && g.seasonSplit == "Spring") {
		//	console.log(key);
			teamSeason.playoffRoundsWonMSI = playoffRoundsWon;
		} else {
			// type 7
		//console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);

			if (winnerOrLoser == "loser") {
				if ( (rnd == 2) && (rndLocation == 4)   &&  (g.gameType ==7) ) {
					teamSeason.ladderCSLCS == 2;
	//	console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
				}
				if ( (rnd == 1) && (rndLocation == 5)   &&  (g.gameType ==7) ) {
					teamSeason.ladderCSLCS == 2;
	//	console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
				}

				if ( (rnd == 2) && (rndLocation == 2 || rndLocation == 3)   &&  (g.gameType ==7) ) {
					teamSeason.ladderCSLCS == 1;
		//console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
				}
	//	console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);

			} else {
				teamSeason[playoffRoundsWonType] += 1;
				if ( (rnd == 2) && (rndLocation == 4)   &&  (g.gameType ==7) ) {
					teamSeason.ladderCSLCS == 1;
	//	console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
				}
				if ( (rnd == 1) && (rndLocation == 2)   &&  (g.gameType ==7) ) {
					teamSeason.ladderCSLCS == 0;
	//	console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
				}
				if ( (rnd == 1) && (rndLocation == 5)   &&  (g.gameType ==7) ) {
					teamSeason.ladderCSLCS == 1;
	///	console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
				}

				if ( (rnd == 2) && (rndLocation == 2 || rndLocation == 3)  &&  (g.gameType ==7) ) {
					teamSeason.ladderCSLCS == 0;
		//console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
				}
		//console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);

			}
		}

		return teamSeason;
	}
	//await recordWinnerLoser(series, rnd, 2, 17, 0.05, "winner",false, 0, false, 0);
	//  recordWinner(series, rnd, 2, 17, 0.05);
async function recordWinnerLoser(series, rnd, rndLocation, playoffRoundsWon, hypeChange, winnerOrLoser, cash, cashAmount, hypeMult, hypeAmount,playoffRoundsWonType) {

		var teamSeason, key;

/*	console.log(rnd+" "+rndLocation);
	console.log(series);
	console.log(series[rnd][rndLocation]);
	console.log(series[rnd][rndLocation].home);
	console.log(series[rnd][rndLocation].home.won);
	console.log(series[rnd][rndLocation].away.won);
	console.log(winnerOrLoser);
	console.log(g.playoffWins);	*/

		if (winnerOrLoser == "winner") {
			if (series[rnd][rndLocation].home.won >= g.playoffWins) {
				key = series[rnd][rndLocation].home.tid;
			} else if (series[rnd][rndLocation].away.won >= g.playoffWins) {
				key = series[rnd][rndLocation].away.tid;
			}
		} else if (winnerOrLoser == "loser") {
			if (series[rnd][rndLocation].home.won >= g.playoffWins) {
				key = series[rnd][rndLocation].away.tid;
			} else if (series[rnd][rndLocation].away.won >= g.playoffWins) {
				key = series[rnd][rndLocation].home.tid;
			}
		} else {
			console.log("something is wrong");
		}

		//console.log(playoffRoundsWon);
		//console.log(g.gameType);
		//console.log(g.seasonSplit);
		//console.log(key);
		//console.log(g.season);

		teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${key}`);

		//console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
		//console.log(teamSeason);

//		var tS = await updateTeamSeasons(teamSeason, rnd, rndLocation,playoffRoundsWon,playoffRoundsWonType,winnerOrLoser);
		///teamSeason = await updateTeamSeasons(teamSeason, rnd, rndLocation,playoffRoundsWon,playoffRoundsWonType,winnerOrLoser);
//		if (g.gameType < 6 || (g.gameType == 6  && g.seasonSplit == "Summer"))  {
		if (g.gameType < 6)  {
			teamSeason.playoffRoundsWon = playoffRoundsWon;
		//	console.log(teamSeason.playoffRoundsWon);

//		} else if (g.gameType == 6 && g.seasonSplit == "Spring") {
		//	console.log(key);
	//		teamSeason.playoffRoundsWonMSI = playoffRoundsWon;
		} else {
		 // gametype 7
			if (winnerOrLoser == "loser") {

			   // if (g.gameType == 7) {
					if (rnd == 2) {
						if  (rndLocation == 4 || rndLocation == 13 || rndLocation == 17 || rndLocation == 21 || rndLocation == 25 || rndLocation == 29)  {
						//if  (rndLocation%4 == 0)  {
						//	console.log(rnd+" "+rndLocation+" "+winnerOrLoser+" "+2);
							teamSeason.ladderCSLCS = 2;
						} else if (rndLocation == 2 ||  rndLocation == 3  ||  rndLocation == 11 ||  rndLocation == 12 ||  rndLocation == 15 ||
						rndLocation == 16 ||  rndLocation == 19 ||  rndLocation == 20 ||  rndLocation == 23 ||  rndLocation == 24 ||  rndLocation == 27 ||  rndLocation == 28) {
//						} else if (rndLocation%4 == 2 ||  rndLocation%4 == 3) {
							// 2 and 3
							//console.log(rnd+" "+rndLocation+" "+winnerOrLoser+" "+1);
							teamSeason.ladderCSLCS = 1;
						}
					} else if (rnd == 1) {
						//rnd 0, location 5
						if (rndLocation == 5 || rndLocation == 16 || rndLocation == 21 || rndLocation == 26 || rndLocation == 31 || rndLocation == 36) {
//						if (rndLocation == 5) {
							//console.log(rnd+" "+rndLocation+" "+winnerOrLoser+" "+2);
							teamSeason.ladderCSLCS = 2;
						}
					}
				//}
			} else {
				teamSeason[playoffRoundsWonType] += 1;
				//console.log("rnd: "+rnd+" type: "+playoffRoundsWonType+" #: "+teamSeason[playoffRoundsWonType]);
				if (g.seasonSplit == "Spring" && teamSeason.pointsSpring > 0) {
					if (teamSeason.playoffRoundsWonNALCS == 2) {
						teamSeason.pointsSpring = 50;	// winner of losers bracket, so 3rd place
					} else if (teamSeason.playoffRoundsWonNALCS == 3) {
						teamSeason.pointsSpring = 90;
					} else if (teamSeason.playoffRoundsWonEULCS == 2) {
						teamSeason.pointsSpring = 50;	// winner of losers bracket, so 3rd place
					} else if (teamSeason.playoffRoundsWonEULCS == 3) {
						teamSeason.pointsSpring = 90;
					} else if (teamSeason.playoffRoundsWonLMS == 3) {
						teamSeason.pointsSpring = 70;
					} else if (teamSeason.playoffRoundsWonLCK == 4) {
						teamSeason.pointsSpring = 90;
					} else if (teamSeason.playoffRoundsWonLPL == 4) {
						teamSeason.pointsSpring = 90;	// winner of losers bracket, so 3rd place
					} else if (teamSeason.playoffRoundsWonLPL == 5) {
						teamSeason.pointsSpring = 130;
					}
				} else if (teamSeason.pointsSummer > 0) {
					if (teamSeason.playoffRoundsWonNALCS == 2) {
						teamSeason.pointsSummer = 70;	// winner of losers bracket, so 3rd place
					} else if (teamSeason.playoffRoundsWonNALCS == 3) {
						teamSeason.pointsSummer = 1000;
					} else if (teamSeason.playoffRoundsWonEULCS == 2) {
						teamSeason.pointsSummer = 70;	// winner of losers bracket, so 3rd place
					} else if (teamSeason.playoffRoundsWonEULCS == 3) {
						teamSeason.pointsSummer = 1000;
					} else if (teamSeason.playoffRoundsWonLMS == 3) {
						teamSeason.pointsSummer = 1000;
					} else if (teamSeason.playoffRoundsWonLCK == 4) {
						teamSeason.pointsSummer = 1000;
					} else if (teamSeason.playoffRoundsWonLPL == 4) {
						teamSeason.pointsSummer = 100;	// winner of losers bracket, so 3rd place
					} else if (teamSeason.playoffRoundsWonLPL == 5) {
						teamSeason.pointsSummer = 1000;
					}
				}

				// this can be too slow and run after teamSeason is saved
				if (rnd == 2) {
						if  (rndLocation == 4 || rndLocation == 13 || rndLocation == 17 || rndLocation == 21 || rndLocation == 25 || rndLocation == 29)  {
//					if (rndLocation == 4) {
//					if (rndLocation%4 == 0) {
						teamSeason.ladderCSLCS = 1;
					//		console.log(rnd+" "+rndLocation+" "+winnerOrLoser+" "+1);
					} else if (rndLocation == 2 ||  rndLocation == 3  ||  rndLocation == 11 ||  rndLocation == 12 ||  rndLocation == 15 ||
					rndLocation == 16 ||  rndLocation == 19 ||  rndLocation == 20 ||  rndLocation == 23 ||  rndLocation == 24 ||  rndLocation == 27 ||  rndLocation == 28) {

//					} else if (rndLocation == 2 ||  rndLocation == 3) {
	//				} else if (rndLocation%4 == 2 ||  rndLocation%4 == 3) {
						// rnd location 2 or 3
						teamSeason.ladderCSLCS = 0;
				//									console.log(rnd+" "+rndLocation+" "+0);
					}
				} else if (rnd == 1) {
					// rnd == 1
					if (rndLocation == 2 || rndLocation == 13  || rndLocation == 18 || rndLocation == 23 || rndLocation == 28 || rndLocation == 33) {
						teamSeason.ladderCSLCS = 0;
							//console.log(rnd+" "+rndLocation+" "+winnerOrLoser+" "+0);
					} else if (rndLocation == 5 || rndLocation == 16 || rndLocation == 21 || rndLocation == 26 || rndLocation == 31 || rndLocation == 36) {
//					} else if (rndLocation == 5) {
						teamSeason.ladderCSLCS = 1;
						//	console.log(rnd+" "+rndLocation+" "+winnerOrLoser+" "+1);
						// rndLocation 5
					}

				}
			}
		}
		// one line of code works, but full function doesn't works
		// when does it break and how to fix
		// gather data and then input elsewhere?

		///teamSeason = tS.teamSeason;

		//console.log(rnd+" "+rndLocation+" "+teamSeason.ladderCSLCS);
		//console.log(teamSeason);
	//	console.log(rnd+" "+rndLocation);
		//console.log(teamSeason.hype);
		//console.log(hypeMult+" "+hypeAmount+" "+hypeChange);

		if (hypeMult) {
			teamSeason.hype *= hypeAmount;
			teamSeason.hype += (1-hypeAmount);
		//console.log(teamSeason.hype);
		} else {
			teamSeason.hype *= (1-hypeChange);
			teamSeason.hype += hypeChange;
		//console.log(teamSeason.hype);
		}

		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}
	//	console.log(teamSeason.hype);
		if (cash) {
			teamSeason.cash += cashAmount;
			teamSeason.revenues.nationalTv.amount += cashAmount;
		}
//console.log("playoffRoundsWon: "+playoffRoundsWon);
//		console.log(teamSeason);
		await idb.cache.teamSeasons.put(teamSeason);

		return;

	}

	// series, rnd (2), 11, 3, 4, 3, true
async function groupResults(series, rnd, rndStart, rnd2, rnd2Start, roundsWon, msi, teamsStart, teamsMake) {

		let tidsWon = [];
		//console.log("end of Groups");
		if (msi) {
		// top seed
			var groupResults = [];
			var matchup;
			var teamSeason;

			series[rnd][rndStart].home.won2 = series[rnd][rndStart].home.won;
			series[rnd][rndStart].away.won2 = series[rnd][rndStart].home.won;
			series[rnd][rndStart+1].home.won2 = series[rnd][rndStart+1].home.won;
			series[rnd][rndStart+1].away.won2 = series[rnd][rndStart+1].home.won;
			series[rnd][rndStart+2].home.won2 = series[rnd][rndStart+2].home.won;
			series[rnd][rndStart+2].away.won2 = series[rnd][rndStart+2].home.won;

			groupResults.push(helpers.deepCopy(series[rnd][rndStart].home));
			groupResults.push(helpers.deepCopy(series[rnd][rndStart].away));
			groupResults.push(helpers.deepCopy(series[rnd][rndStart+1].home));
			groupResults.push(helpers.deepCopy(series[rnd][rndStart+1].away));
			groupResults.push(helpers.deepCopy(series[rnd][rndStart+2].home));
			groupResults.push(helpers.deepCopy(series[rnd][rndStart+2].away));

			groupResults.sort((a, b) => b.won - a.won);
			//now do matchups with top four teams in sort

			matchup = {home: groupResults[0], away: groupResults[3]};
			matchup.home.won = 0;
			matchup.away.won = 0;
			series[rnd2][rnd2Start] = matchup;
			matchup = {home: groupResults[1], away: groupResults[2]};
			matchup.home.won = 0;
			matchup.away.won = 0;
			series[rnd2][rnd2Start+1] = matchup;


			if (msi) {
				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${groupResults[0].tid}`);
				if (g.gameType == 7 || g.gameType == 6) {
			//		console.log(groupResults[0].tid);
					teamSeason.playoffRoundsWonMSIGr = groupResults[0].won2;
					teamSeason.playoffRoundsWonMSI = 0;
				} else {
					teamSeason.playoffRoundsWonMSI = roundsWon;
				}

				await idb.cache.teamSeasons.put(teamSeason);

				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${groupResults[1].tid}`);
				if (g.gameType == 7 || g.gameType == 6) {
				//	console.log(groupResults[1].tid);
					teamSeason.playoffRoundsWonMSIGr = groupResults[1].won2;
					teamSeason.playoffRoundsWonMSI = 0;
				} else {
					teamSeason.playoffRoundsWonMSI = roundsWon;
				}
				await idb.cache.teamSeasons.put(teamSeason);

				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${groupResults[2].tid}`);
				if (g.gameType == 7 || g.gameType == 6) {
				//	console.log(groupResults[2].tid);
					teamSeason.playoffRoundsWonMSIGr = groupResults[2].won2;
					teamSeason.playoffRoundsWonMSI = 0;
				} else {
					teamSeason.playoffRoundsWonMSI = roundsWon;
				}
				await idb.cache.teamSeasons.put(teamSeason);

				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${groupResults[3].tid}`);
				if (g.gameType == 7 || g.gameType == 6) {
				//	console.log(groupResults[3].tid);
					teamSeason.playoffRoundsWonMSIGr = groupResults[3].won2;
					teamSeason.playoffRoundsWonMSI = 0;
				} else {
					teamSeason.playoffRoundsWonMSI = roundsWon;
				}
				await idb.cache.teamSeasons.put(teamSeason);

				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${groupResults[3].tid}`);
				if (g.gameType == 7 || g.gameType == 6) {
					teamSeason.playoffRoundsWonMSIGr = groupResults[4].won2;
				} else {

				}
				await idb.cache.teamSeasons.put(teamSeason);

				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${groupResults[3].tid}`);
				if (g.gameType == 7 || g.gameType == 6) {
					teamSeason.playoffRoundsWonMSIGr = groupResults[5].won2;
				} else {

				}
				await idb.cache.teamSeasons.put(teamSeason);
			}


		} else {
			//async function groupResults(series, rnd, rndStart, rnd2, rnd2Start, roundsWon, msi, teamsStart, teamsMake) {
						//	series = await groupResults(series, rnd, 0, 9, 0, null, false, 16, 8);

				// find teams with most wins from groups
				var i, j,k;
				var orderGroup, orderGroupWin, orderGroupLoss, orderGroupCopy,teamGroup;
				var orderGroupTemp, orderGroupWinTemp, orderGroupLossTemp,orderGroupCopyTemp ;
				var matchup1, matchup2, matchup3, matchup4;
				orderGroup = [[],[],[],[]];
				orderGroupWin = [[],[],[],[]];
				orderGroupLoss = [[],[],[],[]];
				orderGroupCopy = [[],[],[],[]];
				teamGroup = [[],[],[],[],[],[],[],[]];
				// From Group 1
				//i = 0;
                for (i = 0; i < 4; i++) {
					orderGroup = [[],[],[],[]];
					orderGroupWin = [[],[],[],[]];
					orderGroupLoss = [[],[],[],[]];
					orderGroupCopy = [[],[],[],[]];
			//		console.log(orderGroupCopy);
					orderGroup[0] = series[rnd][rndStart+i*2].home.tid;
					orderGroupWin[0] = series[rnd][rndStart+i*2].home.won;
					orderGroupLoss[0] = series[rnd][rndStart+i*2].home.loss;
					orderGroupCopy[0] = helpers.deepCopy(series[rnd][rndStart+i*2].home);
					orderGroup[1] = series[rnd][rndStart+i*2].away.tid;
					orderGroupWin[1] = series[rnd][rndStart+i*2].away.won;
					orderGroupLoss[1] = series[rnd][rndStart+i*2].away.loss;
					orderGroupCopy[1] = helpers.deepCopy(series[rnd][rndStart+i*2].away);
					orderGroup[2] = series[rnd][rndStart+i*2+1].home.tid;
					orderGroupWin[2] = series[rnd][rndStart+i*2+1].home.won;
					orderGroupLoss[2] = series[rnd][rndStart+i*2+1].home.loss;
					orderGroupCopy[2] =helpers.deepCopy( series[rnd][rndStart+i*2+1].home);
					if (g.yearType != 2019) {
						orderGroup[3] = series[rnd][rndStart+i*2+1].away.tid;
						orderGroupWin[3] = series[rnd][rndStart+i*2+1].away.won;
						orderGroupLoss[3] = series[rnd][rndStart+i*2+1].away.loss;
						orderGroupCopy[3] = helpers.deepCopy(series[rnd][rndStart+i*2+1].away);
					}

					let numberTeams = 4;
					if (g.yearType == 2019) {
						numberTeams = 3;
					}
					for (j = 0; j < numberTeams; j++) {
						for (k = (j+1); k < numberTeams; k++) {
						   if ( (orderGroupWin[j]-orderGroupLoss[j]) < (orderGroupWin[k]-orderGroupLoss[k]) ) {
								orderGroupTemp = orderGroup[j];
								orderGroupWinTemp = orderGroupWin[j];
								orderGroupLossTemp = orderGroupLoss[j];
								orderGroupCopyTemp = helpers.deepCopy( orderGroupCopy[j]);
								orderGroup[j] = orderGroup[k];
								orderGroupWin[j] = orderGroupWin[k];
								orderGroupLoss[j] = orderGroupLoss[k];
								orderGroupCopy[j] = helpers.deepCopy( orderGroupCopy[k]);
								orderGroup[k] = orderGroupTemp;
								orderGroupWin[k] = orderGroupWinTemp;
								orderGroupLoss[k] = orderGroupLossTemp;
								orderGroupCopy[k] = helpers.deepCopy( orderGroupCopyTemp);

						   }
					   }
					}

					teamGroup[i*2]= helpers.deepCopy(orderGroupCopy[0]);
					teamGroup[1+i*2]= helpers.deepCopy(orderGroupCopy[1]);
				}


// use msi system?
			var groupResultsA = [];
			var groupResultsB = [];
			var groupResultsC = [];
			var groupResultsD = [];
		//	var matchup;
			//var teamSeason;

			//series[rnd][rndStart].home.won2 = series[rnd][rndStart].home.won;
			//series[rnd][rndStart].away.won2 = series[rnd][rndStart].home.won;
			//series[rnd][rndStart+1].home.won2 = series[rnd][rndStart+1].home.won;
			//series[rnd][rndStart+1].away.won2 = series[rnd][rndStart+1].home.won;
			//series[rnd][rndStart+2].home.won2 = series[rnd][rndStart+2].home.won;
			//series[rnd][rndStart+2].away.won2 = series[rnd][rndStart+2].home.won;
            //for (i = 0; i < 4; i++) {
			groupResultsA.push(helpers.deepCopy(series[rnd][rndStart].home));
			groupResultsA.push(helpers.deepCopy(series[rnd][rndStart].away));
			groupResultsA.push(helpers.deepCopy(series[rnd][rndStart+1].home));
			if (g.yearType != 2019 || rnd == 12) {
			groupResultsA.push(helpers.deepCopy(series[rnd][rndStart+1].away));
			}

			groupResultsB.push(helpers.deepCopy(series[rnd][rndStart+2].home));
			groupResultsB.push(helpers.deepCopy(series[rnd][rndStart+2].away));
			groupResultsB.push(helpers.deepCopy(series[rnd][rndStart+2+1].home));
			if (g.yearType != 2019 || rnd == 12) {
			groupResultsB.push(helpers.deepCopy(series[rnd][rndStart+2+1].away));
			}
			groupResultsC.push(helpers.deepCopy(series[rnd][rndStart+4].home));
			groupResultsC.push(helpers.deepCopy(series[rnd][rndStart+4].away));
			groupResultsC.push(helpers.deepCopy(series[rnd][rndStart+4+1].home));
			if (g.yearType != 2019 || rnd == 12) {
			groupResultsC.push(helpers.deepCopy(series[rnd][rndStart+4+1].away));
			}
			groupResultsD.push(helpers.deepCopy(series[rnd][rndStart+6].home));
			groupResultsD.push(helpers.deepCopy(series[rnd][rndStart+6].away));
			groupResultsD.push(helpers.deepCopy(series[rnd][rndStart+6+1].home));
			if (g.yearType != 2019 || rnd == 12) {
			groupResultsD.push(helpers.deepCopy(series[rnd][rndStart+6+1].away));
			}
			//}
			//groupResults.push(helpers.deepCopy(series[rnd][rndStart+2].home));
			///groupResults.push(helpers.deepCopy(series[rnd][rndStart+2].away));

			groupResultsA.sort((a, b) => b.won - a.won);
			groupResultsB.sort((a, b) => b.won - a.won);
			groupResultsC.sort((a, b) => b.won - a.won);
			groupResultsD.sort((a, b) => b.won - a.won);

			//console.log(teamGroup);
			//console.log(groupResultsA);
			//console.log(groupResultsB);
			//console.log(groupResultsC);
			//console.log(groupResultsD);

		     if (g.yearType == 2019 && rnd == 8) {
				 // 1st seed plays a 2nd seed
				 // pool 1
				 // pool 2
				 // then randomly select one form 1 and one from 2
						let poolOne = [];
						poolOne.push(groupResultsA[0]);
						poolOne.push(groupResultsB[0]);
						poolOne.push(groupResultsC[0]);
						poolOne.push(groupResultsD[0]);

						let poolTwo = [];
						poolTwo.push(groupResultsA[1]);
						poolTwo.push(groupResultsB[1]);
						poolTwo.push(groupResultsC[1]);
						poolTwo.push(groupResultsD[1]);

						let groupA = [];
						let groupB = [];
						let groupC = [];
						let groupD = [];
						let randomInt,removed;
						//Group A
						randomInt = random.randInt(0, poolOne.length-1);
						groupA.push(poolOne[randomInt]);
						removed = poolOne.splice(randomInt,1);

						randomInt = random.randInt(0, poolTwo.length-1);
						groupA.push(poolTwo[randomInt]);
						removed = poolTwo.splice(randomInt,1);


						//Group B
						randomInt = random.randInt(0, poolOne.length-1);
						groupB.push(poolOne[randomInt]);
						removed = poolOne.splice(randomInt,1);

						randomInt = random.randInt(0, poolTwo.length-1);
						groupB.push(poolTwo[randomInt]);
						removed = poolTwo.splice(randomInt,1);

						//Group C
						randomInt = random.randInt(0, poolOne.length-1);
						groupC.push(poolOne[randomInt]);
						removed = poolOne.splice(randomInt,1);

						randomInt = random.randInt(0, poolTwo.length-1);
						groupC.push(poolTwo[randomInt]);
						removed = poolTwo.splice(randomInt,1);



						//Group D
						randomInt = random.randInt(0, poolOne.length-1);
						groupD.push(poolOne[randomInt]);
						removed = poolOne.splice(randomInt,1);

						randomInt = random.randInt(0, poolTwo.length-1);
						groupD.push(poolTwo[randomInt]);
						removed = poolTwo.splice(randomInt,1);

				matchup1 = {home: groupA[0],away: groupA[1]};
				matchup1.home.won = 0;
				matchup1.away.won = 0;
				matchup1.home.seed = 1;
				matchup1.away.seed = 6;
				series[rnd2][rnd2Start] = matchup1;

//				matchup2 = {home: teamGroup[2],away: teamGroup[7]};
				matchup2 = {home: groupB[0],away: groupB[1]};
				matchup2.home.won = 0;
				matchup2.away.won = 0;
				matchup2.home.seed = 3;
				matchup2.away.seed = 8;
				series[rnd2][rnd2Start+1] = matchup2;

//				matchup3 = {home: teamGroup[4],away: teamGroup[1]};
				matchup3 = {home: groupC[0],away: groupC[1]};
				matchup3.home.won = 0;
				matchup3.away.won = 0;
				matchup3.home.seed = 5;
				matchup3.away.seed = 2;
				series[rnd2][rnd2Start+2] = matchup3;

//				matchup4 = {home: teamGroup[6],away: teamGroup[3]};
				matchup4 = {home: groupD[0],away: groupD[1]};
				matchup4.home.won = 0;
				matchup4.away.won = 0;
				matchup4.home.seed = 7;
				matchup4.away.seed = 4;
				series[rnd2][rnd2Start+3] = matchup4;

			 } else {
				// don't need seeds?
//				matchup1 = {home: teamGroup[0],away: teamGroup[5]};
				matchup1 = {home: groupResultsA[0],away: groupResultsC[1]};
				matchup1.home.won = 0;
				matchup1.away.won = 0;
				matchup1.home.seed = 1;
				matchup1.away.seed = 6;
				series[rnd2][rnd2Start] = matchup1;

//				matchup2 = {home: teamGroup[2],away: teamGroup[7]};
				matchup2 = {home: groupResultsB[0],away: groupResultsD[1]};
				matchup2.home.won = 0;
				matchup2.away.won = 0;
				matchup2.home.seed = 3;
				matchup2.away.seed = 8;
				series[rnd2][rnd2Start+1] = matchup2;

//				matchup3 = {home: teamGroup[4],away: teamGroup[1]};
				matchup3 = {home: groupResultsC[0],away: groupResultsA[1]};
				matchup3.home.won = 0;
				matchup3.away.won = 0;
				matchup3.home.seed = 5;
				matchup3.away.seed = 2;
				series[rnd2][rnd2Start+2] = matchup3;

//				matchup4 = {home: teamGroup[6],away: teamGroup[3]};
				matchup4 = {home: groupResultsD[0],away: groupResultsB[1]};
				matchup4.home.won = 0;
				matchup4.away.won = 0;
				matchup4.home.seed = 7;
				matchup4.away.seed = 4;
				series[rnd2][rnd2Start+3] = matchup4;


				tidsWon.push(groupResultsA[0].tid);
				tidsWon.push(groupResultsA[1].tid);
				tidsWon.push(groupResultsB[0].tid);
				tidsWon.push(groupResultsB[1].tid);
				tidsWon.push(groupResultsC[0].tid);
				tidsWon.push(groupResultsC[1].tid);
				tidsWon.push(groupResultsD[0].tid);
				tidsWon.push(groupResultsD[1].tid);

			 }
		}


		return {
			series: series,
			tidsWon,
		};
	}

	function regionalSetUpChampionPoints(teams, series,rnd7,rnd7Start, LCK, rnd7backup,rnd7Startbackup) {
		var matchup1, matchup2;

		//console.log(teams);
		//console.log(series);
		//console.log(LCK);
		//console.log(rnd7);
		//console.log(rnd7Start);
		//console.log(rnd7backup);
		//console.log(rnd7Startbackup);
		if (teams.length == 4) {
			matchup1 = {home: teams[0], away: teams[3]};
			matchup1.home.won = 0;
			matchup1.away.won = 0;
			matchup1.home.seed = 1;
			matchup1.away.seed = 4;

		//	console.log(matchup1);
		} else if (teams.length == 3) {
//			matchup1 = {home: teams[0], away:  teams[0]};
			matchup1 = {home: teams[0], away:  series[6][4].away};
			matchup1.home.won = 0;
			matchup1.away.won = 0;
			matchup1.home.seed = 1;
			matchup1.away.seed = 4;

			//console.log(matchup1);
		}
		//console.log(teams[0]);
	//	console.log(teams[3]);
		//console.log(rnd7);
		//console.log(rnd7Start);
		//console.log(series[rnd7][rnd7Start]);
	//	console.log(matchup1);
		series[rnd7][rnd7Start] = matchup1;
		matchup2 = {home: teams[1], away: teams[2]};
		matchup2.home.won = 0;
		matchup2.away.won = 0;
		matchup2.home.seed = 2;
		matchup2.away.seed = 3;
		series[rnd7][rnd7Start+1] = matchup2;


		return {
			series: series,
		};
	}
	// NA LCS 2,0  0,1  0,0  0,0, 0,1 1,1 6,0
	function regionalSetUp(series, rnd, rndStart, rnd2, rnd2Start, homeAway2, rnd3, rnd3Start, homeAway3,
							rnd4, rnd4Start, homeAway4, rnd5, rnd5Start, homeAway5, rnd6, rnd6Start, homeAway6, rnd7, rnd7Start, twoSeedTid) {

			var confWinSeed,confLoseSeed;
			var team1, team2, team3, team4;
			var matchup1, matchup2;

				// rnd 1 is championship, rnd 2 is 3rd, 3 is 4, 4 is 5, 5 is 6, 6 is 2
					// NA LCS Regionals
					if (series[rnd][rndStart].home.won >= g.playoffWins) {
					   confWinSeed = series[rnd][ rndStart ].home.seed;
					   confLoseSeed = series[rnd][ rndStart ].away.seed;
					} else {
					   confLoseSeed = series[rnd][ rndStart ].home.seed;
					   confWinSeed = series[rnd][ rndStart ].away.seed;
					}

					//team1 = helpers.deepCopy(series[1][0].home);			// seed 1
					//team1 = helpers.deepCopy(series[1][1].home);			// seed 2
				//	console.log(series);
				//	console.log(rnd2);
				//	console.log(rnd2Start);
				//	console.log(series[rnd2][rnd2Start]);

					if (homeAway2 == "home") {
						team1 = helpers.deepCopy(series[rnd2][rnd2Start].home); //seed 3
					} else {
						team1 = helpers.deepCopy(series[rnd2][rnd2Start].away); //seed 3
					}
					if (homeAway3 == "home") {
						team2 = helpers.deepCopy(series[rnd3][rnd3Start].home); //seed 4
					} else {
						team2 = helpers.deepCopy(series[rnd3][rnd3Start].away); //seed 4
					}
					if (homeAway4 == "home") {
						team3 = helpers.deepCopy(series[rnd4][rnd4Start].home); //seed 5
					} else {
						team3 = helpers.deepCopy(series[rnd4][rnd4Start].away); //seed 5
					}
					if (homeAway5 == "home") {
						team4 = helpers.deepCopy(series[rnd5][rnd5Start].home); //seed 6
					} else {
						team4 = helpers.deepCopy(series[rnd5][rnd5Start].away); //seed 6
					}


					// Winner, Best Next Regular Season Standings, Winner Regionals
					if (confWinSeed == 1) {
					} else if (confWinSeed == 2) {
					} else if (confWinSeed == 3) {
						if (homeAway6 == "home") {
							team1 = helpers.deepCopy(series[rnd6][rnd6Start].home);	// 2,4,5,6
						} else {
							team1 = helpers.deepCopy(series[rnd6][rnd6Start].away);	// 2,4,5,6
						}
					} else if (confWinSeed == 4) {
						if (homeAway6 == "home") {
							team1 = helpers.deepCopy(series[rnd6][rnd6Start].home);	// 2,3,5,6
						} else {
							team1 = helpers.deepCopy(series[rnd6][rnd6Start].away);	// 2,3,5,6
						}

						if (homeAway2 == "home") {
							team2 = helpers.deepCopy(series[rnd2][rnd2Start].home);
						} else {
							team2 = helpers.deepCopy(series[rnd2][rnd2Start].away);
						}

					} else if (confWinSeed == 5) {
						if (homeAway6 == "home") {
							team1 = helpers.deepCopy(series[rnd6][rnd6Start].home);	// 2,3,4,6
						} else {
							team1 = helpers.deepCopy(series[rnd6][rnd6Start].away);	// 2,3,4,6
						}

						if (homeAway2 == "home") {
							team2 = helpers.deepCopy(series[rnd2][rnd2Start].home);
						} else {
							team2 = helpers.deepCopy(series[rnd2][rnd2Start].away);
						}

						if (homeAway3 == "home") {       ///////////// This is the same as team 4 above, I got seeding wrong
							team3 = helpers.deepCopy(series[rnd3][rnd3Start].home);
						} else {
							team3 = helpers.deepCopy(series[rnd3][rnd3Start].away);
						}

					} else if (confWinSeed == 6) {
						if (homeAway6 == "home") {
							team1 = helpers.deepCopy(series[rnd6][rnd6Start].home);	// 2,3,4,5
						} else {
							team1 = helpers.deepCopy(series[rnd6][rnd6Start].away);	// 2,3,4,5
						}

						if (homeAway2 == "home") {
							team2 = helpers.deepCopy(series[rnd2][rnd2Start].home);
						} else {
							team2 = helpers.deepCopy(series[rnd2][rnd2Start].away);
						}

						if (homeAway3 == "home") {
							team3 = helpers.deepCopy(series[rnd3][rnd3Start].home);
						} else {
							team3 = helpers.deepCopy(series[rnd3][rnd3Start].away);
						}

						if (homeAway4 == "home") {
							team4 = helpers.deepCopy(series[rnd4][rnd4Start].home);
						} else {
							team4 = helpers.deepCopy(series[rnd4][rnd4Start].away);
						}




					}
					// Winner, Loser, Winner Regionals	(need to finish)
				/*	if ((confWinSeed == 1) &&  (confLoseSeed == 2)) {
					} else if ((confWinSeed == 2) &&  (confLoseSeed == 1)) {
					} else if (confWinSeed == 3) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,4,5,6
					} else if (confWinSeed == 4) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,5,6
						team2 = helpers.deepCopy(series[0][1].home);
					} else if (confWinSeed == 5) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,4,6
						team2 = helpers.deepCopy(series[0][1].home);
						team3 = helpers.deepCopy(series[0][0].home);
					} else if (confWinSeed == 6) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,4,5
						team2 = helpers.deepCopy(series[0][1].home);
						team3 = helpers.deepCopy(series[0][0].home);
						team4 = helpers.deepCopy(series[0][0].away);
					}*/



					matchup1 = {home: team1, away: team4};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					series[rnd7][rnd7Start] = matchup1;
					matchup2 = {home: team2, away: team3};
					matchup2.home.won = 0;
					matchup2.away.won = 0;
					series[rnd7][rnd7Start+1] = matchup2;


		return {
			series: series,
		};
	}



	//
//	function worldsGroups(series, tidsWon, 2,0,  2,9,  3,1,  5,1,  2,8,  1,12,
	//									   rnd,0,  rnd,1,  rnd,2,  rnd,3,
//								  			1,1, 1,11, 2,6, 4,0,  1,9, 0,14,
//											1,0, 1,10, 3,1, 4,1,  2,8, 0,15) {

// worlds qualifiers
//https://na.leagueoflegends.com/en/news/esports/esports-editorial/how-do-teams-qualify-worlds-2017
	function worldsGroups(series, tidsWon, rndNA1, seriesNA1, rndEU1, seriesEU1, rndLCK1, seriesLCK1, rndLPL1, seriesLPL1, rndLMS1, seriesLMS1, rndWC1, seriesWC1,
										   rndNA3, seriesNA3, rndEU3, seriesEU3, rndLCK3, seriesLCK3, rndLPL3, seriesLPL3,
										   rndNA2, seriesNA2, rndEU2, seriesEU2, rndLCK2, seriesLCK2, rndLPL2, seriesLPL2, rndLMS2, seriesLMS2, rndWC2, seriesWC2,
										   rndNA2alt, seriesNA2alt, rndEU2alt, seriesEU2alt, rndLCK2alt,
										   seriesLCK2alt, rndLPL2alt, seriesLPL2alt, rndLMS2alt, seriesLMS2alt, rndWC2alt, seriesWC2alt,
										   twoSeeds,finalStage) {

			var Team1NA, Team1EU, Team1LCK, Team1LPL, Team1LMS, Team1WC;
			var Team3NA, Team3EU, Team3LCK, Team3LPL;
			var Team2NA, Team2EU, Team2LCK, Team2LPL, Team2LMS, Team2WC;
			var i;
			var confWinSeed;

			var matchup1, matchup2, matchup3, matchup4;
//console.log(finalStage);
//console.log(g.yearType);
			//// winner of splits
				i = seriesNA1;
				if (series[rndNA1][i].home.won >= g.playoffWins) {
					Team1NA = helpers.deepCopy(series[rndNA1][i].home);
					tidsWon.push(series[rndNA1][i].home.tid);
				} else {
					Team1NA = helpers.deepCopy(series[rndNA1][i].away);
					tidsWon.push(series[rndNA1][i].away.tid);
				}
				i = seriesEU1;
				if (series[rndEU1][i].home.won >= g.playoffWins) {
					Team1EU = helpers.deepCopy(series[rndEU1][i].home);
					tidsWon.push(series[rndEU1][i].home.tid);
				} else {
					Team1EU = helpers.deepCopy(series[rndEU1][i].away);
					tidsWon.push(series[rndEU1][i].away.tid);
				}
				i = seriesLCK1;
				if (series[rndLCK1][i].home.won >= g.playoffWins) {
					Team1LCK = helpers.deepCopy(series[rndLCK1][i].home);
					tidsWon.push(series[rndLCK1][i].home.tid);
				} else {
					Team1LCK = helpers.deepCopy(series[rndLCK1][i].away);
					tidsWon.push(series[rndLCK1][i].away.tid);
				}
				i = seriesLPL1;
				if (series[rndLPL1][i].home.won >= g.playoffWins) {
					Team1LPL = helpers.deepCopy(series[rndLPL1][i].home);
					tidsWon.push(series[rndLPL1][i].home.tid);
				} else {
					Team1LPL = helpers.deepCopy(series[rndLPL1][i].away);
					tidsWon.push(series[rndLPL1][i].away.tid);

				}
				i = seriesLMS1;
				if (series[rndLMS1][i].home.won >= g.playoffWins) {
					Team1LMS = helpers.deepCopy(series[rndLMS1][i].home);
					tidsWon.push(series[rndLMS1][i].home.tid);
				} else {
					Team1LMS = helpers.deepCopy(series[rndLMS1][i].away);
					tidsWon.push(series[rndLMS1][i].away.tid);
				}

				if (g.seasonSplit == "Summer") {
				if (!finalStage || g.yearType != 2019) {
					i = seriesWC1;
					if (series[rndWC1][i].home.won >= g.playoffWins) {
						Team1WC = helpers.deepCopy(series[rndWC1][i].home);
						tidsWon.push(series[rndWC1][i].home.tid);
						if (g.seasonSplit == "Spring") {
							Team2WC = helpers.deepCopy(series[rndWC1][i].away);
						}
					} else {
						Team1WC = helpers.deepCopy(series[rndWC1][i].away);
						tidsWon.push(series[rndWC1][i].away.tid);
						if (g.seasonSplit == "Spring") {
							Team2WC = helpers.deepCopy(series[rndWC1][i].home);
						}
					}



				// winner of regionals

					i = seriesNA3;
					if (series[rndNA3][i].home.won >= g.playoffWins) {
						Team3NA = helpers.deepCopy(series[rndNA3][i].home);
						tidsWon.push(series[rndNA3][i].home.tid);
					} else {
						Team3NA = helpers.deepCopy(series[rndNA3][i].away);
						tidsWon.push(series[rndNA3][i].away.tid);
					}
					i = seriesEU3;
					if (series[rndEU3][i].home.won >= g.playoffWins) {
						Team3EU = helpers.deepCopy(series[rndEU3][i].home);
						tidsWon.push(series[rndEU3][i].home.tid);
					} else {
						Team3EU = helpers.deepCopy(series[rndEU3][i].away);
						tidsWon.push(series[rndEU3][i].away.tid);
					}
					i = seriesLCK3;
					if (series[rndLCK3][i].home.won >= g.playoffWins) {
						Team3LCK = helpers.deepCopy(series[rndLCK3][i].home);
						tidsWon.push(series[rndLCK3][i].home.tid);
					} else {
						Team3LCK = helpers.deepCopy(series[rndLCK3][i].away);
						tidsWon.push(series[rndLCK3][i].away.tid);
					}
					i = seriesLPL3;
					if (series[rndLPL3][i].home.won >= g.playoffWins) {
						Team3LPL = helpers.deepCopy(series[rndLPL3][i].home);
						tidsWon.push(series[rndLPL3][i].home.tid);
					} else {
						Team3LPL = helpers.deepCopy(series[rndLPL3][i].away);
						tidsWon.push(series[rndLPL3][i].away.tid);
					}
				}


					// one split this works, for two you need to factor in championship points
				    if (g.gameType < 6) {
						// NA best record, but not winner of split

						if (series[rndNA1][seriesNA1].home.won >= g.playoffWins) {
						   confWinSeed = series[rndNA1][ seriesNA1 ].home.seed;
						} else {
						   confWinSeed = series[rndNA1][ seriesNA1 ].away.seed;
						}

						Team2NA = helpers.deepCopy(series[rndNA2][seriesNA2].home);
						//team1 = helpers.deepCopy(series[1][0].home);			// seed 1
						//team1 = helpers.deepCopy(series[1][1].home);			// seed 2
						if (confWinSeed == 1) {
						} else  {
						  Team2NA = helpers.deepCopy(series[rndNA2alt][seriesNA2alt].home);
						}


						// EU best record, but not winner of split
						if (series[rndEU1][seriesEU1].home.won >= g.playoffWins) {
						   confWinSeed = series[rndEU1][ seriesEU1 ].home.seed;
						} else {
						   confWinSeed = series[rndEU1][ seriesEU1 ].away.seed;
						}

						Team2EU = helpers.deepCopy(series[rndEU2][seriesEU2].home);
						//team1 = helpers.deepCopy(series[1][0].home);			// seed 1
						//team1 = helpers.deepCopy(series[1][1].home);			// seed 2
						if (confWinSeed == 1) {
						} else  {
						  Team2EU = helpers.deepCopy(series[rndEU2alt][seriesEU2alt].home);
						}


					// LCK best record, but not winner of split
						if (series[rndLCK1][seriesLCK1].home.won >= g.playoffWins) {
						   confWinSeed = series[rndLCK1][ seriesLCK1 ].home.seed;
						} else {
						   confWinSeed = series[rndLCK1][ seriesLCK1 ].away.seed;
						}

						Team2LCK = helpers.deepCopy(series[rndLCK2][seriesLCK2].home);
						//team1 = helpers.deepCopy(series[1][0].home);			// seed 1
						//team1 = helpers.deepCopy(series[1][1].home);			// seed 2
						if (confWinSeed == 1) {
						} else  {
						  Team2LCK = helpers.deepCopy(series[rndLCK2alt][seriesLCK2alt].home);
						}


					// LPL best record, but not winner of split
						if (series[rndLPL1][seriesLPL1].home.won >= g.playoffWins) {
							confWinSeed = series[rndLPL1][ seriesLPL1 ].home.seed;
						} else {
							confWinSeed = series[rndLPL1][ seriesLPL1 ].away.seed;
						}

						//team1 = helpers.deepCopy(series[1][0].home);			// seed 1
						//team1 = helpers.deepCopy(series[1][1].home);			// seed 2
						if (confWinSeed == 1) {
              Team2LPL = helpers.deepCopy(series[rndLPL2alt][seriesLPL2alt].home);
						} else  {
              Team2LPL = helpers.deepCopy(series[rndLPL2][seriesLPL2].home);
						}
            // why is seriesLPL2alt giving the 1 seed?

					// LMS best record, but not winner of split
						if (series[rndLMS1][seriesLMS1].home.won >= g.playoffWins) {
						   confWinSeed = series[rndLMS1][ seriesLMS1 ].home.seed;
						} else {
						   confWinSeed = series[rndLMS1][ seriesLMS1 ].away.seed;
						}
						Team2LMS = helpers.deepCopy(series[rndLMS2][seriesLMS2].home);
						if (confWinSeed == 1) {
						} else  {
						  Team2LMS = helpers.deepCopy(series[rndLMS1][seriesLMS1].home);
						}


					// WC best record, but not winner of split
						if (!finalStage || g.yearType != 2019) {
							if (series[rndWC1][seriesWC1].home.won >= g.playoffWins) {
							   confWinSeed = series[rndWC1][ seriesWC1 ].home.seed;
							} else {
							   confWinSeed = series[rndWC1][ seriesWC1 ].away.seed;
							}

							Team2WC = helpers.deepCopy(series[rndWC2][seriesWC2].home);
							//team1 = helpers.deepCopy(series[1][0].home);			// seed 1
							//team1 = helpers.deepCopy(series[1][1].home);			// seed 2
							if (confWinSeed == 1) {
							} else  {
							  Team2WC = helpers.deepCopy(series[rndWC2alt][seriesWC2alt].home);
							}
						}
					} else {
					// For Split version this gets much more complicated
					// need to check each teams championship points, sort, then take top team
						// NA best record, but not winner of split

						for (const twoSeed of twoSeeds) {
							if (g.gameType == 6) {
								if (twoSeed.cid == 0) {
									Team2NA = helpers.deepCopy(twoSeed);
								}
								if (twoSeed.cid == 1) {
									Team2EU = helpers.deepCopy(twoSeed);
								}
								if (twoSeed.cid == 2) {
									Team2LCK = helpers.deepCopy(twoSeed);
								}
								if (twoSeed.cid == 3) {
									Team2LPL = helpers.deepCopy(twoSeed);
								}
								if (twoSeed.cid == 4) {
									Team2LMS = helpers.deepCopy(twoSeed);
								}

							} else {
								if (twoSeed.cid == 0) {
									Team2NA = helpers.deepCopy(twoSeed);
								}
								if (twoSeed.cid == 3) {
									Team2EU = helpers.deepCopy(twoSeed);
								}
								if (twoSeed.cid == 6) {
									Team2LCK = helpers.deepCopy(twoSeed);
								}
								if (twoSeed.cid == 9) {
									Team2LPL = helpers.deepCopy(twoSeed);
								}
								if (twoSeed.cid == 12) {
									Team2LMS = helpers.deepCopy(twoSeed);
								}
							}
						}


						// change this later to CP?
						// WC best record, but not winner of split
						if (series[rndWC1][seriesWC1].home.won >= g.playoffWins) {
						   confWinSeed = series[rndWC1][ seriesWC1 ].home.seed;
						} else {
						   confWinSeed = series[rndWC1][ seriesWC1 ].away.seed;
						}

						Team2WC = helpers.deepCopy(series[rndWC2][seriesWC2].home);
						//team1 = helpers.deepCopy(series[1][0].home);			// seed 1
						//team1 = helpers.deepCopy(series[1][1].home);			// seed 2
						if (confWinSeed == 1) {
						} else  {
						  Team2WC = helpers.deepCopy(series[rndWC2alt][seriesWC2alt].home);
						}
					}

					if (g.yearType == 2019 && g.yearType != undefined && finalStage == false) {


							let	Team1CIS,Team1LA,Team1Brazil,Team1Turkey,Team1SEA;
							let	Team1Japan,Team1OCE,Team1Vietnam,Team2Vietnam;
							let Team3LMS;

						// winner gets #1, #2 is best record or #2 seed, #3 is #2 or loser of final game
						if (series[rndLMS1][seriesLMS1].home.won >= g.playoffWins) {
							//#1 wins and gets #1 seed, #2 is 2, 3rd teams is 3
						   confWinSeed = series[rndLMS1][ seriesLMS1 ].home.seed;

							Team2LMS = helpers.deepCopy(series[rndLMS2][seriesLMS2].home);
							Team3LMS = helpers.deepCopy(series[rndLMS2][seriesLMS2].away);
						//	Team3LMS = helpers.deepCopy(series[0][11].home);

						} else {

						   confWinSeed = series[rndLMS1][ seriesLMS1 ].away.seed;
						   if (confWinSeed == 2) {
							   //#2 wins and gets #1 seed, #1 is 2, 3rd teams is 3
							Team2LMS = helpers.deepCopy(series[rndLMS1][seriesLMS1].home);
//							Team3LMS = helpers.deepCopy(series[rndLMS2alt][seriesLMS2alt].away);
							Team3LMS = helpers.deepCopy(series[rndLMS2][seriesLMS2].away);
						   } else {
							   //3rd team wins and gets #1 seed, #1 is 2, 2nd teams is 3
							Team2LMS = helpers.deepCopy(series[rndLMS1][seriesLMS1].home);
							Team3LMS = helpers.deepCopy(series[rndLMS2][seriesLMS2].home);
						   }

						}

						// do this for all the new regions
							if (series[2][33].home.won >= g.playoffWins) {
								Team1Vietnam = helpers.deepCopy(series[2][33].home);

							} else {
							   Team1Vietnam = helpers.deepCopy(series[2][33].away);
							}
						if (series[2][33].home.won >= g.playoffWins) {
								Team2Vietnam = helpers.deepCopy(series[2][33].away);

							} else {
							   Team2Vietnam = helpers.deepCopy(series[2][33].home);
							}


							if (series[2][35].home.won >= g.playoffWins) {
								Team1SEA = helpers.deepCopy(series[2][35].home);
							} else {
							   Team1SEA = helpers.deepCopy(series[2][35].away);
							}

							if (series[1][50].home.won >= g.playoffWins) {
								Team1Brazil = helpers.deepCopy(series[1][50].home);
							} else {
							   Team1Brazil = helpers.deepCopy(series[1][50].away);
							}

							if (series[1][49].home.won >= g.playoffWins) {
								Team1CIS = helpers.deepCopy(series[1][49].home);
							} else {
							   Team1CIS = helpers.deepCopy(series[1][49].away);
							}

							if (series[1][43].home.won >= g.playoffWins) {
								Team1Japan = helpers.deepCopy(series[1][43].home);
							} else {
							   Team1Japan = helpers.deepCopy(series[1][43].away);
							}

							if (series[2][36].home.won >= g.playoffWins) {
								Team1LA = helpers.deepCopy(series[2][36].home);
							} else {
							   Team1LA = helpers.deepCopy(series[2][36].away);
							}

							if (series[3][11].home.won >= g.playoffWins) {
								Team1OCE = helpers.deepCopy(series[3][11].home);
							} else {
							   Team1OCE = helpers.deepCopy(series[3][11].away);
							}

							if (series[2][37].home.won >= g.playoffWins) {
								Team1Turkey = helpers.deepCopy(series[2][37].home);
							} else {
							   Team1Turkey = helpers.deepCopy(series[2][37].away);
							}

							///Team3NA.placement = "NA3";

// does this change every year , 2018 LPL3, but
//							Team3LPL.placement = "LPL3";
							Team3LCK.placement = "LCK3";
							Team3NA.placement = "NA3";
							Team3EU.placement = "EU3";
							Team3LMS.placement = "LMS3";

							Team1CIS.placement = "CIS1";
							Team2Vietnam.placement = "VNM2";
							Team1Brazil.placement = "BRZ1";
							Team1Japan.placement = "JPN1";

							Team1SEA.placement = "SEA1";
							Team1LA.placement = "LA1";
							Team1OCE.placement = "OCE1";
							Team1Turkey.placement = "TRK1";

							tidsWon.push(Team3NA.tid);
							tidsWon.push(Team3LCK.tid);
							tidsWon.push(Team3EU.tid);
							tidsWon.push(Team3LMS.tid);
							tidsWon.push(Team1CIS.tid);
							tidsWon.push(Team2Vietnam.tid);
							tidsWon.push(Team1Brazil.tid);
							tidsWon.push(Team1Japan.tid);
							tidsWon.push(Team1SEA.tid);
							tidsWon.push(Team1LA.tid);
							tidsWon.push(Team1OCE.tid);
							tidsWon.push(Team1Turkey.tid);
								// pool 1
								// NA China Europe LMs
								// pool 2
								// CIS Vietnam2 Brazil Japan
								// pool 3
								// SEA Turkey Oceania LA



								let poolOne = [];
								poolOne.push(Team3NA);
								poolOne.push(Team3LCK);
								//poolOne.push(Team3LPL);
								poolOne.push(Team3EU);
								poolOne.push(Team3LMS);

								let poolTwo = [];
								poolTwo.push(Team1CIS);
								poolTwo.push(Team2Vietnam);
								poolTwo.push(Team1Brazil);
								poolTwo.push(Team1Japan);

								let poolThree = [];
								poolThree.push(Team1SEA);
								poolThree.push(Team1Turkey);
								poolThree.push(Team1OCE);
								poolThree.push(Team1LA);


								let groupA = [];
								let groupB = [];
								let groupC = [];
								let groupD = [];
								let randomInt,removed;
								//Group A
								randomInt = random.randInt(0, poolOne.length-1);
								groupA.push(poolOne[randomInt]);
								removed = poolOne.splice(randomInt,1);

								randomInt = random.randInt(0, poolTwo.length-1);
								groupA.push(poolTwo[randomInt]);
								removed = poolTwo.splice(randomInt,1);

								randomInt = random.randInt(0, poolThree.length-1);
								groupA.push(poolThree[randomInt]);
								removed = poolThree.splice(randomInt,1);


								//Group B
								randomInt = random.randInt(0, poolOne.length-1);
								groupB.push(poolOne[randomInt]);
								removed = poolOne.splice(randomInt,1);

								randomInt = random.randInt(0, poolTwo.length-1);
								groupB.push(poolTwo[randomInt]);
								removed = poolTwo.splice(randomInt,1);

								randomInt = random.randInt(0, poolThree.length-1);
								groupB.push(poolThree[randomInt]);
								removed = poolThree.splice(randomInt,1);

								//Group C
								randomInt = random.randInt(0, poolOne.length-1);
								groupC.push(poolOne[randomInt]);
								removed = poolOne.splice(randomInt,1);

								randomInt = random.randInt(0, poolTwo.length-1);
								groupC.push(poolTwo[randomInt]);
								removed = poolTwo.splice(randomInt,1);

								randomInt = random.randInt(0, poolThree.length-1);
								groupC.push(poolThree[randomInt]);
								removed = poolThree.splice(randomInt,1);


								//Group D
								randomInt = random.randInt(0, poolOne.length-1);
								groupD.push(poolOne[randomInt]);
								removed = poolOne.splice(randomInt,1);

								randomInt = random.randInt(0, poolTwo.length-1);
								groupD.push(poolTwo[randomInt]);
								removed = poolTwo.splice(randomInt,1);

								randomInt = random.randInt(0, poolThree.length-1);
								groupD.push(poolThree[randomInt]);
								removed = poolThree.splice(randomInt,1);


					matchup1 = {home: groupA[0], away: groupA[1]}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
				//	matchup1.home.placement = "LPL1";
				//	matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][0] = matchup1;
					matchup1 = {home: groupA[2], away: groupA[2]};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
				//	matchup1.home.placement = "EU2";
				//	matchup1.away.placement = "";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][1] = matchup1;

					matchup1 = {home: groupB[0], away: groupB[1]}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "LPL1";
				//	matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][2] = matchup1;
					matchup1 = {home: groupB[2], away: groupB[2]};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "EU2";
				//	matchup1.away.placement = "";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][3] = matchup1;

					matchup1 = {home: groupC[0], away: groupC[1]}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "LPL1";
					//matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][4] = matchup1;
					matchup1 = {home: groupC[2], away: groupC[2]};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "EU2";
				//	matchup1.away.placement = "";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][5] = matchup1;

					matchup1 = {home: groupD[0], away: groupD[1]}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "LPL1";
					//matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][6] = matchup1;
					matchup1 = {home: groupD[2], away: groupD[2]};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "EU2";
				//	matchup1.away.placement = "";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][7] = matchup1;
					//	console.log(series);
					} else if (g.yearType == 2019 && g.yearType != undefined && finalStage == true) {
											// do this for all the new regions
											let Team1Vietnam;
							if (series[2][33].home.won >= g.playoffWins) {
								Team1Vietnam = helpers.deepCopy(series[2][33].home);

							} else {
							   Team1Vietnam = helpers.deepCopy(series[2][33].away);
							}
							Team1Vietnam.placement = "VNM1";
							//console.log(Team1Vietnam);
										let playIn1,playIn2,playIn3,playIn4;

							if (series[9][0].home.won >= g.playoffWins) {
								playIn1 = helpers.deepCopy(series[9][0].home);

							} else {
							   playIn1 = helpers.deepCopy(series[9][0].away);
							}

							if (series[9][1].home.won >= g.playoffWins) {
								playIn2 = helpers.deepCopy(series[9][1].home);

							} else {
							   playIn2 = helpers.deepCopy(series[9][1].away);
							}

							if (series[9][2].home.won >= g.playoffWins) {
								playIn3 = helpers.deepCopy(series[9][2].home);

							} else {
							   playIn3 = helpers.deepCopy(series[9][2].away);
							}

							if (series[9][3].home.won >= g.playoffWins) {
								playIn4 = helpers.deepCopy(series[9][3].home);

							} else {
							   playIn4 = helpers.deepCopy(series[9][3].away);
							}

							// remove full playoffs from play i , just want first round
							//do play in teams

					//console.log(Team3LPL);
					if (series[7][3].home.won >= g.playoffWins) {
						Team3LPL = helpers.deepCopy(series[7][3].home);
					//	tidsWon.push(series[7][3].home.tid);
					} else {
						Team3LPL = helpers.deepCopy(series[7][3].away);
						//tidsWon.push(series[7][3].away.tid);
					}

					tidsWon.push(Team1LPL.tid);
					tidsWon.push(Team2LPL.tid);
					tidsWon.push(Team3LPL.tid);
					tidsWon.push(Team1LCK.tid);
					tidsWon.push(Team2LCK.tid);
					tidsWon.push(Team1EU.tid);
					tidsWon.push(Team2EU.tid);
					tidsWon.push(Team1NA.tid);
					tidsWon.push(Team2NA.tid);
					tidsWon.push(Team1LMS.tid);
					tidsWon.push(Team2LMS.tid);
					tidsWon.push(playIn1.tid);
					tidsWon.push(playIn2.tid);
					tidsWon.push(playIn3.tid);
					tidsWon.push(playIn4.tid);

						Team1LPL.placement = "LPL1";
							Team2LPL.placement = "LPL2";
							Team3LPL.placement = "LPL3";

							Team1LCK.placement = "LCK1";
							Team2LCK.placement = "LCK2";

							Team1EU.placement = "EU1";
							Team2EU.placement = "EU2";

							Team1NA.placement = "NA1";
							Team2NA.placement = "NA2";

							Team1LMS.placement = "LMS1";
							Team2LMS.placement = "LMS2";


								// pool 1
								// China 1, Korea 1, NA 1, EU 1
								// pool 2
								// LMS 2, NA 2, Korea 2, LMS 1
								// pool 3
								// China 2, Eu 2, China 3, Vietnam 1
								// pool 4
								// play in 1, play in 2, play in 3, play in 4,

								let poolOne = [];
								poolOne.push(Team1LPL);
								poolOne.push(Team1LCK);
								poolOne.push(Team1NA);
								poolOne.push(Team1EU);

								let poolTwo = [];
								poolTwo.push(Team2LMS);
								poolTwo.push(Team2NA);
								poolTwo.push(Team2LCK);
								poolTwo.push(Team1LMS);

								let poolThree = [];
								poolThree.push(Team2LPL);
								poolThree.push(Team2EU);
								poolThree.push(Team3LPL);
								poolThree.push(Team1Vietnam);

								let poolFour = [];
								poolFour.push(playIn1);
								poolFour.push(playIn2);
								poolFour.push(playIn3);
								poolFour.push(playIn4);


								let groupA = [];
								let groupB = [];
								let groupC = [];
								let groupD = [];
								let randomInt,removed;

								// this could be a function, exactly same as above
                // poolOne doesn't matter because first team to enter
								//Group A
								randomInt = random.randInt(0, poolOne.length-1);
								groupA.push(poolOne[randomInt]);
								removed = poolOne.splice(randomInt,1);

                //Group B
                randomInt = random.randInt(0, poolOne.length-1);
                groupB.push(poolOne[randomInt]);
                removed = poolOne.splice(randomInt,1);

                //Group C
                randomInt = random.randInt(0, poolOne.length-1);
                groupC.push(poolOne[randomInt]);
                removed = poolOne.splice(randomInt,1);

                //Group D
                randomInt = random.randInt(0, poolOne.length-1);
								groupD.push(poolOne[randomInt]);
								removed = poolOne.splice(randomInt,1);

                // Check to see which teams will go where
                // poolTwo
                //Group A
              //  let poolTwoBackup = helpers.deepCopy(poolTwo);
                let randomIntA = randomWithFilter(groupA,poolTwo);
                let removedA = poolTwo.splice(randomIntA,1);

                //Group B
								//randomInt = random.randInt(0, poolTwo.length-1);
                let randomIntB = randomWithFilter(groupB,poolTwo);
                let removedB = poolTwo.splice(randomIntB,1);

                //Group C
                //randomInt = random.randInt(0, poolTwo.length-1);
                let randomIntC = randomWithFilter(groupC,poolTwo);
                let removedC = poolTwo.splice(randomIntC,1);

                //Group D
                // only one option, need to swap above if not used?
                // maybe save the pushing until later, then can swap randomInt
								let randomIntD = random.randInt(0, poolTwo.length-1);
                let removedD = helpers.deepCopy(poolTwo.splice(randomIntD,1));


                // do a special check for the last one since it has
                let conference2 = removedD[0].placement;
                let conference1 = groupD[0].placement;
                let conference1clean =   conference1.substr(0, conference1.length-1);
                let conference2clean =   conference2.substr(0, conference2.length-1);

                if (conference1clean == conference2clean) {
                  // just switch with another pool if the same
                  let tempRandom = helpers.deepCopy(removedD);
                  removedD == helpers.deepCopy(removedC);
                  removedC == helpers.deepCopy(tempRandom);
                }

                // Actually add to groups
                groupA.push(removedA[0]);
                groupB.push(removedB[0]);
                groupC.push(removedC[0]);
								groupD.push(removedD[0]);


                // poolThree
                //Group A
                randomIntA = randomWithFilter2(groupA,poolThree);
                //randomInt = random.randInt(0, poolThree.length-1);
								//groupA.push(poolThree[randomInt]);
								removedA = poolThree.splice(randomIntA,1);

                //Group B
                //randomInt = random.randInt(0, poolThree.length-1);
                randomIntB = randomWithFilter2(groupB,poolThree);
								//groupB.push(poolThree[randomInt]);
								removedB = poolThree.splice(randomIntB,1);

                //Group C
//                randomInt = random.randInt(0, poolThree.length-1);
                randomIntC = randomWithFilter2(groupC,poolThree,2);
								//groupC.push(poolThree[randomInt]);
                if (randomIntC == 100) {
                  removedC = poolThree.splice(0,1);

                  let tempRandom = helpers.deepCopy(removedC);
                  removedC == helpers.deepCopy(removedA);
                  removedA == helpers.deepCopy(tempRandom);
                } else {
                  removedC = poolThree.splice(randomIntC,1);
                }

                //Group D
                //randomInt = random.randInt(0, poolThree.length-1);
                randomIntD = randomWithFilter2(groupD,poolThree,1);
								//groupD.push(poolThree[randomInt]);
                if (randomIntD == 100) {
                  removedD = poolThree.splice(0,1);

                  let tempRandom = helpers.deepCopy(removedD);
                  removedD == helpers.deepCopy(removedB);
                  removedB == helpers.deepCopy(tempRandom);
                } else {
                  removedD = poolThree.splice(randomIntD,1);
                }



                // Actually add to groups
                groupA.push(removedA[0]);
                groupB.push(removedB[0]);
                groupC.push(removedC[0]);
								groupD.push(removedD[0]);




//// something simpler, maybe the normal rotation but with a cutoff for the while loop?
                  // rest, not filtered
                //Group A
                randomIntA = randomWithFilter3(groupA,poolFour);
                console.log(randomIntA);
    	          removedA = poolFour.splice(randomIntA,1);
								//randomInt = random.randInt(0, poolFour.length-1);
			//					groupA.push(poolFour[randomInt]);
								//removed = poolFour.splice(randomInt,1);

								//Group B
                randomIntB = randomWithFilter3(groupB,poolFour,3);
                console.log(randomIntB);
    	         // removedB = poolThree.splice(randomIntB,1);
                if (randomIntB == 100) {
                  removedB = poolFour.splice(0,1);

                  let tempRandom = helpers.deepCopy(removedB);
                  removedB == helpers.deepCopy(removedA);
                  removedA == helpers.deepCopy(tempRandom);
                } else {
                  removedB = poolFour.splice(randomIntB,1);
                }
								//randomInt = random.randInt(0, poolFour.length-1);
		//						groupB.push(poolFour[randomInt]);
								//removed = poolFour.splice(randomInt,1);

								//Group C
                randomIntC = randomWithFilter3(groupC,poolFour,2);
                console.log(randomIntC);
    	          //removedC = poolThree.splice(randomIntC,1);
                if (randomIntC == 100) {
                  removedC = poolFour.splice(0,1);

                  let tempRandom = helpers.deepCopy(removedC);
                  removedC == helpers.deepCopy(removedA);
                  removedA == helpers.deepCopy(tempRandom);
                } else {
                  removedC = poolFour.splice(randomIntC,1);
                }

								//randomInt = random.randInt(0, poolFour.length-1);
		//						groupC.push(poolFour[randomInt]);
								//removed = poolFour.splice(randomInt,1);

								//Group D
                randomIntD = randomWithFilter3(groupD,poolFour,1);
                console.log(randomIntD);
    	         // removedD = poolThree.splice(randomIntD,1);
                if (randomIntD == 100) {
                  removedD = poolFour.splice(0,1);

                  let tempRandom = helpers.deepCopy(removedD);
                  removedD == helpers.deepCopy(removedA);
                  removedA == helpers.deepCopy(tempRandom);
                } else {
                  removedD = poolFour.splice(randomIntD,1);
                }
								//randomInt = random.randInt(0, poolFour.length-1);
//								groupD.push(poolFour[randomInt]);
								//removed = poolFour.splice(randomInt,1);



                // Actually add to groups
                groupA.push(removedA[0]);
                groupB.push(removedB[0]);
                groupC.push(removedC[0]);
                groupD.push(removedD[0]);


/// Check to make sure pool doesn't have two from same region?
/// recreate actual seeding like live version (maybe for later show live)


		matchup1 = {home: groupA[0], away: groupA[1]}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
				//	matchup1.home.placement = "LPL1";
				//	matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;
					//console.log(matchup1);
					series[12][0] = matchup1;
					matchup1 = {home: groupA[2], away: groupA[3]};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
				//	matchup1.home.placement = "EU2";
				//	matchup1.away.placement = "";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[12][1] = matchup1;

					matchup1 = {home: groupB[0], away: groupB[1]}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "LPL1";
				//	matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[12][2] = matchup1;
					matchup1 = {home: groupB[2], away: groupB[3]};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "EU2";
				//	matchup1.away.placement = "";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[12][3] = matchup1;

					matchup1 = {home: groupC[0], away: groupC[1]}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "LPL1";
					//matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[12][4] = matchup1;
					matchup1 = {home: groupC[2], away: groupC[3]};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "EU2";
				//	matchup1.away.placement = "";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[12][5] = matchup1;

					matchup1 = {home: groupD[0], away: groupD[1]}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "LPL1";
					//matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[12][6] = matchup1;
					matchup1 = {home: groupD[2], away: groupD[3]};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					//matchup1.home.placement = "EU2";
				//	matchup1.away.placement = "";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[12][7] = matchup1;
					//	console.log(series);
					} else {

					//http://2015.na.lolesports.com/articles/2015-world-championship-format
					// WC, LMS, LPL, LCK, EU, NA

					// Pool 1 LPL1, LCK1, EU1, NA1
					// Pool 2 LMS1, LMS2, LPL2, LPL3, LCK2, LCK3, EU2, NA2
					// Pool 3 EU3, NA3, WC1, WC2


					// Each group is 1, 2, 1
					// don't watch same region in same group

					// A   LPL1 LMS2 EU2 NA3
					// B   LCK1 LPL2 NA2 EU3
					// C   EU1  LPL3 LCK2 WC1
					// D   NA1	LMS1 LCK3 WC2

						// this comes at end with groups.
						// A

					// A   LPL1 LMS2 EU2 NA3
					matchup1 = {home: Team1LPL, away: Team2LMS}; //LMS2 is wrong
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					matchup1.home.placement = "LPL1";
					matchup1.away.placement = "LMS2";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][0] = matchup1;
					matchup1 = {home: Team2EU, away: Team3NA};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					matchup1.home.placement = "EU2";
					matchup1.away.placement = "NA3";
					matchup1.home.loss = 0;
					matchup1.away.loss = 0;

					series[8][1] = matchup1;


						// this comes at end with groups.
						// B
										// B   LCK1 LPL2 NA2 EU3

					matchup2 = {home: Team1LCK, away: Team2LPL};
					matchup2.home.won = 0;
					matchup2.away.won = 0;
					matchup2.home.placement = "LCK1";
					matchup2.away.placement = "LPL2";
					matchup2.home.loss = 0;
					matchup2.away.loss = 0;

					series[8][2] = matchup2;

					matchup2 = {home: Team2NA, away: Team3EU};
					matchup2.home.won = 0;
					matchup2.away.won = 0;
					matchup2.home.loss = 0;
					matchup2.away.loss = 0;
					matchup2.home.placement = "NA2";
					matchup2.away.placement = "EU3";


					series[8][3] = matchup2;

						// this comes at end with groups.
						// C
					// C   EU1  LPL3 LCK2 WC1

					matchup3 = {home: Team1EU, away: Team3LPL};
					matchup3.home.won = 0;
					matchup3.away.won = 0;
					matchup3.home.loss = 0;
					matchup3.away.loss = 0;
					matchup3.home.placement = "EU1";
					matchup3.away.placement = "LPL3";

					series[8][4] = matchup3;

					matchup3 = {home: Team2LCK, away: Team1WC};
					matchup3.home.won = 0;
					matchup3.away.won = 0;
					matchup3.home.loss = 0;
					matchup3.away.loss = 0;
					matchup3.home.placement = "LCK2";
					matchup3.away.placement = "WC1";

						// this comes at end with groups.
						// D
					// D   NA1	LMS1 LCK3 WC2

						series[8][5] = matchup3;
					matchup4 = {home: Team1NA, away: Team1LMS};
					matchup4.home.won = 0;
					matchup4.away.won = 0;
					matchup4.home.loss = 0;
					matchup4.away.loss = 0;
					matchup4.home.placement = "NA1";
					matchup4.away.placement = "LMS1";

					series[8][6] = matchup4;

					matchup4 = {home: Team3LCK, away: Team2WC};
					matchup4.home.won = 0;
					matchup4.away.won = 0;
					matchup4.home.loss = 0;
					matchup4.away.loss = 0;
					matchup4.home.placement = "LCK3";
					matchup4.away.placement = "WC2";

					series[8][7] = matchup4;


					}
				} else {
					// MSI set up
						if (Math.random() < .5) {
							series[6][ 8 ] = {home: Team1LMS, away: series[6][8 ].home};
							series[6][9 ] = {home: Team1NA, away: series[6][9 ].home};
							series[6][8 ].home.placement = "LMS1";
							series[6][8 ].away.placement = "WC1";
							series[6][9 ].home.placement = "NA1";
							series[6][9 ].away.placement = "WC2";

						} else {
							series[6][ 8 ] = {home: Team1NA, away: series[6][8 ].home};//Team1WC
							series[6][9 ] = {home: Team1LMS, away: series[6][9 ].home};//Team2WC
							series[6][8 ].home.placement = "NA1";
							series[6][8 ].away.placement = "WC1";
							series[6][9 ].home.placement = "LMS1";
							series[6][9 ].away.placement = "WC2";
						}

						series[6][ 8 ].home.seed = 2;
						series[6][ 8 ].away.seed = 3;

						series[6][9 ].home.seed = 1;
						series[6][9 ].away.seed = 4;

						series[6][8 ].home.won = 0;
						series[6][8 ].away.won = 0;
						series[6][9 ].home.won = 0;
						series[6][9 ].away.won = 0;

						series[8][8] = {home: Team1EU, away: Team1LCK};
						series[8][9] = {home: Team1LPL, away: Team1LPL};


						series[8][8 ].home.seed = 1;

						series[8][9 ].away.seed = 1;
						series[8][9 ].home.seed = 1;

						series[8][8 ].home.placement = "EU1";
						series[8][8 ].away.placement = "LCK1";
						series[8][9 ].home.placement = "LPL1";

						series[8][8 ].home.won = 0;
						series[8][8 ].away.won = 0;
						series[8][9 ].home.won = 0;
						series[8][9 ].away.won = 0;
				}

		return {
			series: series,
			tidsWon: tidsWon,
//			series,
		};
	}


/**
 * Create a single day's schedule for an in-progress playoffs.
 *
 * @memberOf core.season
 * @return {Promise.boolean} Resolves to true if the playoffs are over. Otherwise, false.
 */
async function newSchedulePlayoffsDay(): Promise<boolean> {
//console.log(g.confs);
	var playoffSeries;
	var series;

	let yearType = 0;
	if (g.yearType == undefined) {
		yearType = 0;
	} else {
		yearType = g.yearType;
	}

	if (g.gameType >=6 && g.seasonSplit == "Spring") {
		playoffSeries = await idb.cache.msiSeries.get(g.season);

		series = playoffSeries.seriesMSI;

	} else {
		playoffSeries = await idb.cache.playoffSeries.get(g.season);
		series = playoffSeries.series;
	}
//console.log(g.confs);
    const rnd = playoffSeries.currentRound;

    var tids = [];

	var wonNeeded;
	var numGames;
   // Try to schedule games if there are active series
	  //   console.log(rnd);
	 var seriesStart = 0;
	 var seriesEnd = 0;

	var startEnd = seriesStartEnd(rnd);

	seriesStart = startEnd.seriesStart;
	seriesEnd = startEnd.seriesEnd;

    // Try to schedule games if there are active series
	var remainingGames = remainingGamesInSeries(tids, rnd, series, seriesStart, seriesEnd);
//console.log(g.confs);

	series = remainingGames.series;
	tids = remainingGames.tids;


    if (tids.length > 0) {
        await setSchedule(tids);
        return false;
    }

//console.log(g.confs);
	/// No games left in series, move on to next series or end playoffs

	var i, key,key2, key3,key4, matchup, team1, team2,team3,team4;
	var confWinSeed,confLoseSeed, matchup1, matchup2, matchup3, matchup4, matchup5, matchup6, matchup7, matchup8;

	var	Team1NA, Team2NA, Team3NA, Team1EU, Team2EU, Team3EU, Team1LCK;
	var Team2LCK, Team3LCK, Team1LPL, Team2LPL, Team3LPL, Team1LMS, Team2LMS, Team3LMS, Team1WC, Team2WC;
	var Team1PlayIn, Team2PlayIn, Team3PlayIn;



    var tidsWon = [];
    var tidsLost = [];


    var tidsWonLCSNA = [];
    var tidsWonLCSEU = [];
    var tidsWonLCSLCK = [];
    var tidsWonLCSLMS = [];
    var tidsWonLCSLPL = [];
    var tidsWonLCSPro = [];
    var tidsWonCSPro = [];
    var tidsWonReg = [];
    var tidsWonWorldsGroups = [];
    var tidsWonWorlds = [];
    var tidsWonMSIPlayIn = [];
    var tidsWonMSIGroups = [];
    var tidsWonMSI = [];



	//const teamSeason;
	var teamSeason;

	var createdSeries;
//	const teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${key}`);
	//await idb.cache.teamSeasons.put(teamSeason);



            // Playoffs are not over! Make another round

            // Set matchups for next round
			// Do for LCS, LCS promotion, and CS promotion
            //

			//// Split up for each game type?
			//// some overlap, so would be reduntant
			//// needs to be simplified though.
			//console.log(rnd);
		//	console.log(rnd);
			/*console.log(series[8][8].home.won);
			console.log(series[8][9].home.won);
			console.log(series[8][10].home.won);
			console.log(series[8][8].away.won);
			console.log(series[8][9].away.won);
			console.log(series[8][10].away.won);		*/
//console.log(g.confs);
//console.log(rnd);

			if (rnd == 0) {

//				if ((g.gameType == 0) || (g.gameType == 1) || ((g.gameType == 5) ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) ) {
				if ((g.gameType == 0) || (g.gameType == 1) || ((g.gameType >= 5) ) ) {
					//// First LCS game second round
					// rnd, 0 && 1, 0
						if (g.gameType == 7 || g.gameType == 6) {
							createdSeries = createSeriesOneExisting(series, tidsWonLCSNA, tidsLost, rnd, 0, 1, 0, true, true, true)
							tidsWonLCSNA = createdSeries.tidsWon;

						} else {
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 0, 1, 0, true, true, true)
							tidsWon = createdSeries.tidsWon;
						}
						series = createdSeries.series;

						tidsLost = createdSeries.tidsLost;

					//// Second LCS game second round
					// rnd, 1 && 1, 1
						if (g.gameType == 7|| g.gameType == 6) {
							createdSeries = createSeriesOneExisting(series, tidsWonLCSNA, tidsLost, rnd, 1, 1, 1, true, true, true)
							tidsWonLCSNA = createdSeries.tidsWon;

						} else {
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 1, 1, 1, true, true, true)
							tidsWon = createdSeries.tidsWon;
						}

						series = createdSeries.series;
						tidsWon = createdSeries.tidsWon;
						tidsLost = createdSeries.tidsLost;
				}

				//if ( (g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if  (g.gameType >= 5)   {

					//// First LCS game second round
					// 0, 12 and 1, 10
						if (g.gameType == 7 || g.gameType == 6) {
							createdSeries = createSeriesOneExisting(series, tidsWonLCSEU, tidsLost, rnd, 12, 1, 10, true, true, true)
							tidsWonLCSEU = createdSeries.tidsWon;
						} else {
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 12, 1, 10, true, true, true)
							tidsWon = createdSeries.tidsWon;
						}


						series = createdSeries.series;
						tidsLost = createdSeries.tidsLost;

					//// Second LCS game second round
						if (g.gameType == 7 || g.gameType == 6) {
							createdSeries = createSeriesOneExisting(series, tidsWonLCSEU, tidsLost, rnd, 13, 1, 11, true, true, true)
							tidsWonLCSEU = createdSeries.tidsWon;

						} else {
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 13, 1, 11, true, true, true)
							tidsWon = createdSeries.tidsWon;
						}

						series = createdSeries.series;
						tidsWon = createdSeries.tidsWon;
						tidsLost = createdSeries.tidsLost;
				}

				if ( (g.gameType == 1) || (g.gameType == 7)) {

					let numberLadders;
					if (g.gameType == 7) {
						numberLadders = 6;
					} else {
						numberLadders = 1;
					}
				// winner of finals, makes it to LCS, CS 2nd 3rd play LCS 8 and 9 for final two spots
					for (i = 0; i < numberLadders; i++) {
						let adjustment0;
						let adjustment1;
						let adjustment2;

						if (i > 0 ) {
							adjustment0 = 16 + i*7 - 7 - 2;
							adjustment1 = 13 + i*5 - 5 -2;
							adjustment2 = 11 + i*4 - 4 - 2;
						} else {
							adjustment0 = 0;
							adjustment1 = 0;
							adjustment2 = 0;
						}
					//// First LCS promotional game second round
							// rnd, 2, & 1 2
						if (g.gameType == 7) {
							tidsWonLCSPro.push(series[2][2 + adjustment2].home.tid);
							createdSeries = createSeriesBothNew(series, tidsWonLCSPro, tidsLost, rnd, 2  + adjustment0, 1, 2 + adjustment1, "winners", true, true);
							tidsWonLCSPro = createdSeries.tidsWon;

						} else {
							createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 2 + adjustment0, 1, 2 + adjustment1, "winners", true, true);
							tidsWon = createdSeries.tidsWon;
						}

						series = createdSeries.series;
						tidsLost = createdSeries.tidsLost;


					//// Second LCS promotional game second round
						if (g.gameType == 7) {
							tidsWonLCSPro.push(series[2][3 + adjustment2].home.tid);
							createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 2 + adjustment0, 1, 3 + adjustment1, "losers", true, true);

						//	tidsWonLCSPro = createdSeries.tidsWon;
						} else {
							createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 2 + adjustment0, 1, 3 + adjustment1, "losers", true, true);
							tidsWon = createdSeries.tidsWon;
						}

						series = createdSeries.series;
						tidsLost = createdSeries.tidsLost;
					// tidsWond and tidsLost make sense? they didn't really win and lose



						// First CS promotional game second round
					   // Find the two winning teams
						if (g.gameType == 7) {
							tidsWonCSPro.push(series[2][4 + adjustment2].home.tid);
							createdSeries = createSeriesBothNew(series, tidsWonCSPro, tidsLost, rnd, 4 + adjustment0, 1, 4 + adjustment1, "winners", true, true);
							tidsWonCSPro = createdSeries.tidsWon;

						} else {
							createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 4 + adjustment0, 1, 4 + adjustment1, "winners", true, true);
							tidsWon = createdSeries.tidsWon;
						}

						series = createdSeries.series;
						tidsLost = createdSeries.tidsLost;


					//// Second CS promotional game second round
						if (g.gameType == 7) {

							tidsWonCSPro.push(series[1][5 + adjustment1].home.tid);
							createdSeries = createSeriesOneExisting(series, tidsWonCSPro, tidsLost, rnd, 6 + adjustment0, 1, 5 + adjustment1, false, true, true)
							tidsWonCSPro.push(series[1][5 + adjustment1].home.tid);
							tidsWonCSPro.push(series[1][5 + adjustment1].away.tid);
							tidsWonCSPro = createdSeries.tidsWon;

						} else {
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 6 + adjustment0, 1, 5 + adjustment1, false, true, true)
							tidsWon = createdSeries.tidsWon;
						}

						series = createdSeries.series;
						//console.log(createdSeries);
					//	console.log(series);

						tidsLost = createdSeries.tidsLost;
						// before tidsWon was just once, bug or right?
						//console.log(series);
						// Third CS promotinal game second round
					   // Find the two winning teams
					   if (g.gameType != 7) {
	//				   if (g.fullLadder) {

							createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 7 + adjustment0, 1, 6 + adjustment1, "winners", true, true);

							series = createdSeries.series;
							tidsWon = createdSeries.tidsWon;
							tidsLost = createdSeries.tidsLost;
					   }

				   }
				}

				// LCK
	//			if ( (g.gameType == 2) || (g.gameType == 5) ||  (g.gameType == 6 && g.seasonSplit == "Summer")) {
				if ( (g.gameType == 2) || (g.gameType >= 5)) {

			////  LCK
					if (g.gameType == 7 || g.gameType == 6) {
						tidsWonLCSLCK.push(series[1][7].home.tid);
						tidsWonLCSLCK.push(series[2][6].home.tid);
						tidsWonLCSLCK.push(series[3][1].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLCK, tidsLost, rnd, 9, 1, 7, false, true, true)
						tidsWonLCSLCK = createdSeries.tidsWon;



					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 9, 1, 7, false, true, true)
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}

				// LPL
//				if ( (g.gameType == 3) || (g.gameType == 5) ||  (g.gameType == 6 && g.seasonSplit == "Summer")) {
				if (( (g.gameType == 3) || (g.gameType >= 5)) && yearType == 0) {
			////  LPL
					if (g.gameType == 7 || g.gameType == 6) {
						tidsWonLCSLPL.push(series[1][8].home.tid);
						tidsWonLCSLPL.push(series[2][7].home.tid);
						tidsWonLCSLPL.push(series[3][2].home.tid);
						tidsWonLCSLPL.push(series[3][3].home.tid);
						tidsWonLCSLPL.push(series[4][0].home.tid);
						tidsWonLCSLPL.push(series[4][1].home.tid);

						createdSeries = createSeriesOneExisting(series, tidsWonLCSLPL, tidsLost, rnd, 10, 1, 8, false, true, true);
						tidsWonLCSLPL = createdSeries.tidsWon;

					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 10, 1, 8, false, true, true);
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}
						 //createSeriesOneExisting(series, tidsWon, tidsLost, rnd, rndLocation, rnd2, rnd2Location, extraWon, anyWon, anyLost,winnerLoser) {

//				if (( (g.gameType == 3) || (g.gameType >= 5)) && yearType == 2019) {
				if (( (g.gameType == 3) || (g.gameType >= 5)) && yearType == 2019) {
			////  LPL
					if (g.gameType == 7 || g.gameType == 6) {
						tidsWonLCSLPL.push(series[1][38].home.tid);
						tidsWonLCSLPL.push(series[1][39].home.tid);
						tidsWonLCSLPL.push(series[2][31].home.tid);
						tidsWonLCSLPL.push(series[2][32].home.tid);
						console.log(rnd);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLPL, tidsLost, rnd, 51, 1, 38, false, true, true);
						tidsWonLCSLPL = createdSeries.tidsWon;
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLPL, tidsLost, rnd, 52, 1, 39, false, true, true);
						tidsWonLCSLPL = createdSeries.tidsWon;

					} else {
//						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 10, 1, 8, false, true, true)
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 51, 1, 38, false, true, true);
						tidsWon = createdSeries.tidsWon;
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 52, 1, 39, false, true, true);
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}

				if ((g.gameType >= 5) && yearType == 2019) {

					// can use the above formats

					//regional
					//-CIs
					//-brazil

					// 0,14  1,12

					//brazil
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 56, 1, 50, "winners", true, true);
						tidsWon = createdSeries.tidsWon;

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

						//					 CIS
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 58, 1, 49, "winners", true, true);
						tidsWon = createdSeries.tidsWon;

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;


					// LMS
					//-Japan (2)
					//-Vietnam (3)

					// 0,11  1,9
					//Vietnam 53 40
					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 53, 1, 40, false, true, true)
					tidsWon = createdSeries.tidsWon;

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

					// 0,11  1,9
					// 					// 0,11  1,9
					//Japan 60 43
					// should be ok, next right will be different than vietnam
					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 60, 1, 43, false, true, true)
					tidsWon = createdSeries.tidsWon;

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;



					// LCK
					//-OCE
					// from 0,9 to 1,7
					//createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 9, 1, 7, false, true, true)
					// from 0,63 to 1,46
					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 63, 1, 46, false, true, true)
					tidsWon = createdSeries.tidsWon;

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

					// NA
					//-Turkey
					//-Latin America
					//-SEA
					//////////////////////////////////// convrt to

					//SEA
							// 0,1 then 1,0
								// 0,54		1,41
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 54, 1, 41, true, true, true)
							tidsWon = createdSeries.tidsWon;

						series = createdSeries.series;

						tidsLost = createdSeries.tidsLost;

					//// Second LCS game second round
					// rnd, 1 && 1, 1
						// 0,55 1,42
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 55, 1, 42, true, true, true)
							tidsWon = createdSeries.tidsWon;


						series = createdSeries.series;
						tidsWon = createdSeries.tidsWon;
						tidsLost = createdSeries.tidsLost;
						/////////////////////

					//Latin America
							// 0,1 then 1,0
						// 0,61		1,44
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 61, 1, 44, true, true, true)
							tidsWon = createdSeries.tidsWon;

						series = createdSeries.series;

						tidsLost = createdSeries.tidsLost;

					//// Second LCS game second round
					// rnd, 1 && 1, 1
						// 0,62 1,45
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 62, 1, 45, true, true, true)
							tidsWon = createdSeries.tidsWon;


						series = createdSeries.series;
						tidsWon = createdSeries.tidsWon;
						tidsLost = createdSeries.tidsLost;
						/////////////////////

					//Turkey
							// 0,1 then 1,0
							// 0,64		1,47
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 64, 1, 47, true, true, true)
							tidsWon = createdSeries.tidsWon;

						series = createdSeries.series;

						tidsLost = createdSeries.tidsLost;

					//// Second LCS game second round
					// rnd, 1 && 1, 1
						// 0,65 1,48
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 65, 1, 48, true, true, true)
							tidsWon = createdSeries.tidsWon;


						series = createdSeries.series;
						tidsWon = createdSeries.tidsWon;
						tidsLost = createdSeries.tidsLost;
				}

				//
//				if ( (g.gameType == 4) || (g.gameType == 5) ||  (g.gameType == 6 && g.seasonSplit == "Summer")) {
				if ( (g.gameType == 4) || (g.gameType >= 5)) {
			////
					if (g.gameType == 7 || g.gameType == 6) {
						tidsWonLCSLMS.push(series[1][9].home.tid);
						tidsWonLCSLMS.push(series[2][8].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLMS, tidsLost, rnd, 11, 1, 9, false, true, true)
						tidsWonLCSLMS = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 11, 1, 9, false, true, true)
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}

				if ( (g.gameType == 5 && g.yearType == 0)  ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) {
					//WC? skip
//				if ( (g.gameType >= 5) ) {
					if (g.gameType == 7 || g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonReg, tidsLost, rnd, 14, 1, 12, "winners", true, true);
						tidsWonReg = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 14, 1, 12, "winners", true, true);
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}
			}

			if (rnd == 1) {


//				if ((g.gameType == 0) || (g.gameType == 1) || (g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if ((g.gameType == 0) || (g.gameType == 1) || (g.gameType >= 5)) {

					// LCS Final
				   // Find the two winning teams
					if (g.gameType == 7 || g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonLCSNA, tidsLost, rnd, 0, 2, 0, "winners", true, true);
						tidsWonLCSNA = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, 2, 0, "winners", true, true);
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

					// LCS 3rd Place Game
				   // Find the two losing teams

				   // still need tids won and tids lost?
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, 2, 1, "losers", true, true);

					series = createdSeries.series;
					tidsWon = createdSeries.tidsWon;
					tidsLost = createdSeries.tidsLost;


				}

//				if ((g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if ((g.gameType >= 5)  ) {

					// LCS Final
				   // Find the two winning teams
					if (g.gameType == 7 || g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonLCSEU, tidsLost, rnd, 10, 2, 9, "winners", true, true);
						tidsWonLCSEU = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 10, 2, 9, "winners", true, true);
						tidsWon = createdSeries.tidsWon;
					}


					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;


					// LCS 3rd Place Game
				   // Find the two losing teams
					// still need tids won and tids lost?
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 10, 2, 10, "losers", true, true);

					series = createdSeries.series;
					tidsWon = createdSeries.tidsWon;
					tidsLost = createdSeries.tidsLost;

				}

				/// stopped here
				if ( (g.gameType == 1) || (g.gameType == 7)) {
					let numberLadders;
					if (g.gameType == 7) {
						numberLadders = 6;
					} else {
						numberLadders = 1;
					}
					// winner of finals, makes it to LCS, CS 2nd 3rd play LCS 8 and 9 for final two spots
					for (i = 0; i < numberLadders; i++) {
							//let adjustment0;
							let adjustment1;
							let adjustment2;

							if (i > 0 ) {
								//adjustment0 = 16 + i*7 - 7 - 2; // not needed
								adjustment1 = 13 + i*5 - 5 -2;
								adjustment2 = 11 + i*4 - 4 - 2;
							} else {
								///adjustment0 = 0;
								adjustment1 = 0;
								adjustment2 = 0;
							}

					// for LCS promotion, and CS, use something different than tidsWon?, tidsWonCS and tidsWonLadder?

					// winner of finals, makes it to LCS, CS 2nd 3rd play LCS 8 and 9 for final two spots
						//for (i = 0; i < positions.length; i++) {


						if (g.gameType == 1) {
						  await recordWinnerLoser(series, rnd, 2 + adjustment1, 17, 0.05, "winner",false, 0, false, 0);
						} else {
							//should be
							// 2,13,18,23,28,33
							await recordWinnerLoser(series, rnd, 2 + adjustment1, 17, 0.05, "winner",false, 0, false, 0,'playoffRoundsWonNALCSPr');

						}

					//// First LCS promotional game second round
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 2 + adjustment1, 2, 2 + adjustment2, false, false, false, "loser")	;
						series = createdSeries.series;


					//// Second LCS promotional game second round
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 3 + adjustment1, 2, 3 + adjustment2, false, false, false);
						series = createdSeries.series;
						if (g.gameType == 1) {
						  await recordWinnerLoser(series, rnd, 3 + adjustment1, 17, 0.05, "winner",false, 0, false, 0);
						} else {
							await recordWinnerLoser(series, rnd, 3 + adjustment1, 17, 0.05, "winner",false, 0, false, 0,'playoffRoundsWonNALCSPr')

						}

						await recordWinnerLoser(series, rnd, 3, 15, 0.00, "loser");

					//// First CS promotional final
						if (g.gameType == 7) {
							tidsWonCSPro.push(series[2][4 + adjustment2].home.tid);
							createdSeries = createSeriesOneExisting(series, tidsWonCSPro, tidsLost, rnd, 4 + adjustment1, 2, 4 + adjustment2, false, true, true);
							tidsWonCSPro = createdSeries.tidsWon;
						} else {
							createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 4 + adjustment1, 2, 4 + adjustment2, false, true, true);
							tidsWon = createdSeries.tidsWon;
						}


						series = createdSeries.series;
						tidsLost = createdSeries.tidsLost;




						// CS Promotional 2nd Final
						// Bracket B, end here only for game type 7 due to smaller Ladder
					   // Find the two winning teams
						if (g.gameType == 7) {
							// 5,16,21,26,31,36
							await recordWinnerLoser(series, rnd, 5 + adjustment1, 17, 0.05, "winner",false, 0, false, 0,'playoffRoundsWonNACSPrA');
							await recordWinnerLoser(series, rnd, 5 + adjustment1, 17, 0.00, "loser");
						} else {

							createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 5 + adjustment1, 2, 5 + adjustment2, "winners", true, true);
							tidsWon = createdSeries.tidsWon;

							series = createdSeries.series;
							tidsLost = createdSeries.tidsLost;
						}



					}

				}

//				if ( (g.gameType == 2) || (g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if ( (g.gameType == 2) || (g.gameType >= 5)) {
			////  LCK
					if (g.gameType == 7 || g.gameType == 6) {
						tidsWonLCSLCK.push(series[2][6].home.tid);
						tidsWonLCSLCK.push(series[3][1].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLCK, tidsLost, rnd, 7, 2, 6, false, true, true)
						tidsWonLCSLCK = createdSeries.tidsWon;

					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 7, 2, 6, false, true, true)
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}
//console.log(yearType);
//				if ( (g.gameType == 3) || (g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if ( ((g.gameType == 3) || (g.gameType >= 5)) && yearType == 0) {
			////  LPL
					if (g.gameType == 7 || g.gameType == 6 ) {
						//tidsWonLCSLPL.push(series[2][7].home.tid);
						tidsWonLCSLPL.push(series[2][7].home.tid);
						tidsWonLCSLPL.push(series[3][2].home.tid);
						tidsWonLCSLPL.push(series[3][3].home.tid);
						tidsWonLCSLPL.push(series[4][0].home.tid);
						tidsWonLCSLPL.push(series[4][1].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLPL, tidsLost, rnd, 8, 2, 7, false, true, true)
						tidsWonLCSLPL = createdSeries.tidsWon;

					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 8, 2, 7, false, true, true)
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}

				if (( (g.gameType == 3) || (g.gameType >= 5)) && yearType == 2019) {
			////  LPL
					if (g.gameType == 7 || g.gameType == 6 ) {
						//tidsWonLCSLPL.push(series[2][7].home.tid);
						tidsWonLCSLPL.push(series[2][31].home.tid);
						tidsWonLCSLPL.push(series[2][32].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLPL, tidsLost, rnd, 38, 2, 31, false, true, true)
						tidsWonLCSLPL = createdSeries.tidsWon;
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLPL, tidsLost, rnd, 39, 2, 32, false, true, true)
						tidsWonLCSLPL = createdSeries.tidsWon;

					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 38, 2, 31, false, true, true)
						tidsWon = createdSeries.tidsWon;
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 39, 2, 32, false, true, true)
						tidsWon = createdSeries.tidsWon;

					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}

//				if ( (g.gameType == 4) || (g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if ( (g.gameType == 4) || (g.gameType >= 5) ) {
			////  LMS
					if (g.gameType == 7 || g.gameType == 6) {
						tidsWonLCSLMS.push(series[2][8].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLMS, tidsLost, rnd, 9, 2, 8, false, true, true)
						tidsWonLCSLMS = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 9, 2, 8, false, true, true)
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
				}



				// Worlds WC winner
//				if ((g.gameType == 7) || (g.seasonSplit == "Summer" )) {
				if ( (g.gameType == 5 && g.yearType == 0)  ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) {


					// LCS champions

					// finish
					await recordWinnerLoser(series, rnd, 12, 3, 0.05, "winner", false, 0, false, 0, 'playoffRoundsWonWorldsReg');

				}


				if ((g.gameType >= 5) && yearType == 2019) {

					//Vietnam
					// 1,40 to 2,33 Finals  , LMS?
					//was 1,9 to 2,8
					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 40, 2, 33, false, true, true)
					tidsWon = createdSeries.tidsWon;


					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

					//SEA
					//1,41 && 1,42 to 2,35 Finals  NA

					// was 1,0 to 2,0
					//
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 41, 2, 35, "winners", true, true);
					tidsWon = createdSeries.tidsWon;


					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
					//Brazil
					// already done

					//CIS
					// already done

					//Japan
					// already done

					//Latin America
					// 1,44 && 1,45 to 2,36 Finals  NA
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 44, 2, 36, "winners", true, true);
					tidsWon = createdSeries.tidsWon;


					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
					//OCE
					// 1,46 to 2,34 (not finals) LCK
					//was 0,7 to 2,6
					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 46, 2, 34, false, true, true)
					tidsWon = createdSeries.tidsWon;


					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
					//Turkey
					//1,47 && 1,48 to 2,37  NA
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 47, 2, 37, "winners", true, true);
					tidsWon = createdSeries.tidsWon;


					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;


				}
			}

            // If playoffs are over, update winner and go to next phase

			// Do for LCS, LCS promotion, and CS promotion

            if (rnd === 2) {

				if ((g.gameType == 0) || (g.gameType == 1) || g.gameType == 6 || (g.gameType == 7) ) {


					// LCS champions

					// finish
					if ((g.gameType == 0)  ) {
						await recordWinnerLoser(series, rnd, 0, 3, 0.05, "winner", true, 200000);
						await recordWinnerLoser(series, rnd, 0, 2, 0.05, "loser");

//						await recordWinnerLoser(series, rnd, 2, 2, 0.05, "winner", true, 0);
						await recordWinnerLoser(series, rnd, 1, 2, 0.05, "winner", true, 0);
					} else if ((g.gameType == 1)  ) {
						await recordWinnerLoser(series, rnd, 0, 27, 0.30, "winner", true, 200000, true,.7);
						await recordWinnerLoser(series, rnd, 0, 26, 0.25, "loser", false, 0, true, .7);

						await recordWinnerLoser(series, rnd, 1, 26, 0.25, "winner", false, 0, true, .7);
					} else {
						await recordWinnerLoser(series, rnd, 0, 27, 0.30, "winner", true, 200000, true, .7, 'playoffRoundsWonNALCS');
						await recordWinnerLoser(series, rnd, 0, 26, 0.25, "loser", false, 0, true, .7);
						// losers bracket game
						await recordWinnerLoser(series, rnd, 1, 27, 0.25, "winner", true, 0, true, .7, 'playoffRoundsWonNALCS');
					}


					if ((g.gameType == 0) ) {
							return true;

					}
				}
//				if ((g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer")  ) {
				if ((g.gameType >= 5) ) {

					// NA LCS Regionals Start Here
					if (series[rnd][0].home.won >= g.playoffWins) {
						key = series[rnd][0].home.tid;
					} else if (series[rnd][0].away.won >= g.playoffWins) {
						key = series[rnd][0].away.tid;
					}

					// EU LCS Regionals Start Here
					if (series[rnd][9].home.won >= g.playoffWins) {
						key = series[rnd][9].home.tid;
					} else if (series[rnd][9].away.won >= g.playoffWins) {
						key = series[rnd][9].away.tid;
					}


				}

				//LCS Promotion missing?

				// CS Promotion
				// just game type 1, need more teams for type 7?
				if ( g.gameType == 7) {
					let numberLadders;
					if (g.gameType == 7) {
						numberLadders = 6;
					} else {
						numberLadders = 1;
					}
					// winner of finals, makes it to LCS, CS 2nd 3rd play LCS 8 and 9 for final two spots
					for (i = 0; i < numberLadders; i++) {
					//	console.log(i);
						//let adjustment0;
						//let adjustment1;
						let adjustment2;

						if (i > 0 ) {
							//adjustment0 = 16 + i*7 - 7 - 2; // not needed
							//adjustment1 = 13 + i*5 - 5 -2;
							adjustment2 = 11 + i*4 - 4 - 2;
						} else {
							///adjustment0 = 0;
							//adjustment1 = 0;
							adjustment2 = 0;
						}

					// Bracket A winner
						// 4,13,17,21,25,29
						await recordWinnerLoser(series, rnd, 4+adjustment2, 27, 0.30, "winner", true, 0, true, .95, 'playoffRoundsWonNACSPrA');
						await recordWinnerLoser(series, rnd, 4+adjustment2, 26, 0.30, "loser");
					}
				}
				if ( g.gameType == 1 ) {
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 4, 3, 0, "losers", false, false);

					series = createdSeries.series;
					tidsWon = createdSeries.tidsWon;
					tidsLost = createdSeries.tidsLost;

				}


                //});
//				if ( (g.gameType == 2) || (g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if ( (g.gameType == 2) || (g.gameType >= 5)) {
			////  LCK
					if (g.gameType == 7 || g.gameType == 6) {
						//tidsWonLCSLCK.push(series[3][1].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLCK, tidsLost, rnd, 6, 3, 1, true, true, true)
						tidsWonLCSLCK = createdSeries.tidsWon;

					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 6, 3, 1, true, true, true)
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
					// this had the double won
				}

				if (( (g.gameType == 3) || (g.gameType >= 5)) && yearType == 0) {

			////  LPL

					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 7, 3, 2, false, false, false)

					series = createdSeries.series;

					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 7, 3, 3, false, false, false, "loser")

					series = createdSeries.series;
				}
				if (( (g.gameType == 3) || (g.gameType >= 5)) && yearType == 2019) {
				//if ( (g.gameType == 3) || (g.gameType >= 5)  ) {
			////  LPL
					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 31, 3, 4, "winners", false, false);
				//	createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 7, 3, 2, false, false, false)

					series = createdSeries.series;

					//createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 8, 3, 3, "losers", false, false);
//					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 7, 3, 3, false, false, false, "loser")
					//series = createdSeries.series;

				}
				if ((g.gameType == 4) || (g.gameType >=5) ) {

					// LMS champions

					if (g.gameType == 7 || g.gameType == 6) {
						await recordWinnerLoser(series, rnd, 8, 3, 0.05, "winner", true, 200000, true, .7, 'playoffRoundsWonLMS');
					} else {
						await recordWinnerLoser(series, rnd, 8, 3, 0.05, "winner", true, 200000, true, .7);
					}
					await recordWinnerLoser(series, rnd, 8, 2, 0.00, "loser");

				//	await idb.cache.teamSeasons.put(teamSeason);
					if (g.gameType == 4) {
						return true;
					}
				}

//				if ( (g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if ( (g.gameType >= 5)   ) {

					// LCS champions
					/*if (series[rnd][8].home.won >= 3) {
						key = series[rnd][8].home.tid;
					} else if (series[rnd][8].away.won >= 3) {
						key = series[rnd][8].away.tid;
					}*/
					if ((g.gameType == 7 || g.gameType == 6)  ) {
						await recordWinnerLoser(series, rnd, 9, 3, 0.30, "winner", true, 200000, true, .7, 'playoffRoundsWonEULCS');
						await recordWinnerLoser(series, rnd, 9, 2, 0.25, "loser", false, 0, true, .7);
						// losers bracket game
						await recordWinnerLoser(series, rnd, 10, 2, 0.25, "winner", true, 0, true, .7, 'playoffRoundsWonEULCS');
					} else {

						await recordWinnerLoser(series, rnd, 9, 3, 0.05, "winner", true, 200000);
						await recordWinnerLoser(series, rnd, 9, 2, 0.05, "loser");
						// losers bracket game

						await recordWinnerLoser(series, rnd, 10, 2, 0.05, "winner", true, 0);
					}

				}

				if ((g.gameType >= 5) && yearType == 2019) {

					//OCE
					//2,34  to 3,11
					createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 34, 3, 11, true, true, true)
					tidsWon = createdSeries.tidsWon;


					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
				}


				if (g.gameType == 1 || g.gameType == 7) {
					let numberLadders;
					let ii;
					if (g.gameType == 7) {
						numberLadders = 6;
					} else {
						numberLadders = 1;
					}
					// winner of finals, makes it to LCS, CS 2nd 3rd play LCS 8 and 9 for final two spots
					for (i = 0; i < numberLadders; i++) {
				//		console.log(i);
					//	console.log(numberLadders);
						//let adjustment0;
						//let adjustment1;
						let adjustment2;

						if (i > 0 ) {
							//adjustment0 = 16 + i*7 - 7 - 2; // not needed
							//adjustment1 = 13 + i*5 - 5 -2;
							adjustment2 = 11 + i*4 - 4 - 2;
						} else {
							///adjustment0 = 0;
						//	adjustment1 = 0;
							adjustment2 = 0;
						}
						for (ii = 2; ii < 4; ii++) {
							// LCS/CS Promotion
							// 2&3,11&12,15&16,19&20,23&24,27&28
							await recordWinnerLoser(series, rnd, ii+adjustment2, 17, 0.00, "winner", false, 0, true, .7, 'playoffRoundsWonNALCSPr');
							await recordWinnerLoser(series, rnd, ii+adjustment2, 16, 0.00, "loser", false);
						}

					}

					if (g.gameType == 1) {
						for (i = 4; i < 6; i++) {
						// LCS/CS Promotion
						// not enough teams for type 7
							await recordWinnerLoser(series, rnd, i, 8, 0.05, "winner", false, 0, true, .7, 'playoffRoundsWonNALCSPr');
							await recordWinnerLoser(series, rnd, i, 6, 0.00, "loser", false);
						}
					}
				}



				// MSI Groups stage


            }

            if (rnd === 3) {

				// CS Promotion, 3rd place game
//				if (g.gameType == 1 || g.gameType == 7) {
				if (g.gameType == 1) {

					await recordWinnerLoser(series, rnd, 0, 6, 0.05, "winner", false);

					await recordWinnerLoser(series, rnd, 0, 6, 0.05, "loser", false);
			// Strange? both seem like winners, 3rd place game


					return true;


				}
				// LCK champ
				if ( (g.gameType == 2)) {

					await recordWinnerLoser(series, rnd, 1, 4, 0.05, "winner", true, 200000 );

					await recordWinnerLoser(series, rnd, 1, 3, 0.00, "loser", false);


					return true;

				}
				// LCK regionals start here
				if ( (g.gameType == 5) ) {

				} else if (g.gameType == 7  ||  g.gameType == 6) {
					await recordWinnerLoser(series, rnd, 1, 4, 0.05, "winner", true, 200000, true, .7,'playoffRoundsWonLCK' );

					await recordWinnerLoser(series, rnd, 1, 3, 0.00, "loser", false);
				}


				if (( (g.gameType == 3) || (g.gameType >= 5)) && yearType == 0) {
			////  LPL
					if (g.gameType == 7  ||  g.gameType == 6) {
					//	tidsWonLCSLPL.push(series[4][0].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLPL, tidsLost, rnd, 3, 4, 0, true, true, true)
						tidsWonLCSLPL = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 3, 4, 0, true, true, true)
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

					if (g.gameType == 7  ||  g.gameType == 6) {
						//tidsWonLCSLPL.push(series[4][1].home.tid);
						createdSeries = createSeriesOneExisting(series, tidsWonLCSLPL, tidsLost, rnd, 2, 4, 1, true, true, true)
						tidsWonLCSLPL = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesOneExisting(series, tidsWon, tidsLost, rnd, 2, 4, 1, true, true, true)
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

				}
			if (( (g.gameType == 3) || (g.gameType >= 5)) && yearType == 2019) {
			////  LPL
	//		 function recordWinnerLoser(series, rnd, rndLocation, playoffRoundsWon, hypeChange, winnerOrLoser, cash, cashAmount, hypeMult, hypeAmount,playoffRoundsWonType) {
					if ( (g.gameType == 7  ||  g.gameType == 6)) {
						await recordWinnerLoser(series, rnd, 4, 4, 0.05, "winner", true, 200000, true, .7, 'playoffRoundsWonLPL' );
					} else {
						await recordWinnerLoser(series, rnd, 4, 4, 0.05, "winner", true, 200000, true, .7);
					}
					await recordWinnerLoser(series, rnd, 4, 3, 0.00, "loser", false);

					if (g.gameType < 5) {
						return true;
					}

				}

				if ((g.gameType >= 5) && yearType == 2019) {

				}
      }


            if (rnd === 4) {

//				if ( (g.gameType == 3) || (g.gameType == 5)  ||  (g.gameType == 6 && g.seasonSplit == "Summer") ) {
				if ( (g.gameType == 3) || (g.gameType >= 5) ) {
			////  LPL

					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonLCSLPL, tidsLost, rnd, 0, 5, 0, "winners", true, true);
						tidsWonLCSLPL = createdSeries.tidsWon;
					} else {
						if 	(g.yearType == 0) {
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, 5, 0, "winners", true, true);
						tidsWon = createdSeries.tidsWon;

						}
					}

					if (g.yearType != 2019) {
					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
					}

					if (g.gameType == 7 ||  g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonLCSLPL, tidsLost, rnd, 0, 5, 1, "losers", false, false);
						tidsWonLCSLPL = createdSeries.tidsWon;
					} else {
						if 	(g.yearType == 0) {
							createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, 5, 1, "losers", false, false);
							tidsWon = createdSeries.tidsWon;
						}

					}

					if (g.yearType != 2019) {
					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
					}
				}
			}

       if (rnd === 5) {


				if ( (g.gameType == 3) || g.gameType >= 5 && g.yearType != 2019) {
			////  LPL champions
					if ( (g.gameType == 7  ||  g.gameType == 6)) {
						await recordWinnerLoser(series, rnd, 0, 6, 0.05, "winner", true, 200000, true, .7, 'playoffRoundsWonLPL' );
						await recordWinnerLoser(series, rnd, 1, 6, 0.05, "winner", true, 0, true, 1, 'playoffRoundsWonLPL' );
					} else {
						await recordWinnerLoser(series, rnd, 0, 6, 0.05, "winner", true, 200000, true, .7);
					}
					await recordWinnerLoser(series, rnd, 0, 5, 0.00, "loser", false);

					if (g.gameType < 5) {
						return true;
					}

				}

					// setup for MSI
				if (g.gameType >= 6 && (g.seasonSplit == "Spring")) {
				// top from each of NA 0 and LMS 12
				// top two from Wild Card Conference: 15
					//var genResults;
					//	console.log("MSI Play In");
					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = genPlayoffSeriesMSI(
						//	teams,
							series,
							tidsWonMSIPlayIn,
						);
						tidsWonMSIPlayIn = createdSeries.tidsWon;
				//		console.log(createdSeries);
				//		console.log(tidsWonMSIPlayIn);
					} else {
						createdSeries = genPlayoffSeriesMSI(
						//	teams,
							series,
							tidsWon,
						);
						tidsWon = createdSeries.tidsWon;
					//	console.log("ever get here?");
					}




				//	console.log(createdSeries.series);
					series = createdSeries.series;
				//	console.log(series);
//console.log(JSON.parse(JSON.stringify(series)));

					/*tidPlayoffs = genResults.tidPlayoffs;
					tidPromotion = genResults.tidPromotion;
					tidDemotion = genResults.tidDemotion;
					tidRegionals = genResults.tidRegionals;
					tidLCSChamp = genResults.tidLCSChamp;
					tidLCS = genResults.tidLCS;
					tidLCSPromotion = genResults.tidLCSPromotion;
					tidCSstay = genResults.tidCSstay;
					tidCS = genResults.tidCS;
					tidCSPromotion = genResults.tidCSPromotion;
					tidLadder = genResults.tidLadder;
					tidCSPromotionTop = genResults.tidCSPromotionTop;	*/
			//	console.log(series);
			//		console.log(tidsWon);
			//		console.log(tidsLost);
				}




				if ( (g.gameType == 5) ) {
						// NA LCS 2,0  0,1  0,0  0,0, 0,1 1,1 6,0
						createdSeries =  regionalSetUp(series, 2,0,  0,1, "home",  0,0, "home",  0,0, "away",  0,1,  "away", 1,1, "home",  6,0);
						series = createdSeries.series;

						// EU LCS Regionals
						// EU LCS  2,9 0,13, 0,12 0,12, 0,13 1,11 6,2
						createdSeries =  regionalSetUp(series, 2,9,  0,13, "home", 0,12, "home", 0,12, "away", 0,13, "away", 1,11, "home", 6,2);
						series = createdSeries.series;
						//Team2EU = helpers.deepCopy(twoSeed);

						// LCK Regionals
						createdSeries =  regionalSetUp(series, 3,1, 1,7, "home", 0,9, "home", 0,9, "away", 6,4, "away", 2,6, "home", 6,4);
						series = createdSeries.series;
//							Team2LCK = helpers.deepCopy(twoSeed);


						// LPL Regionals
						if (g.yearType == 2019) {
							// 5,0 is now 3,4
							//console.log(series);
//						createdSeries =  regionalSetUp(series, 3,4, 2,32, "home",  2,31, "home", 1,39, "home",  1,38, "home",  2,32, "home",  6,6);
//						createdSeries =  regionalSetUp(series, 2,32, 2,31, "home",  1,39, "home", 1,38, "home",  2,32, "home",  2,31, "home",  6,6);
//						createdSeries =  regionalSetUp(series, 3,4, 2,32, "home",  2,31, "home", 1,39, "home",  1,38, "home",  1,39, "home",  6,6);
//						createdSeries =  regionalSetUp(series, 3,4, 1,39, "home",  1,38, "home", 0,51, "home",  0,52, "home",  2,32, "home",  6,6);
						createdSeries =  regionalSetUp(series, 3,4, 1,39, "home",  1,38, "home", 0,51, "home",  0,52, "home",  2,31, "home",  6,6);
						//	console.log(createdSeries);
						} else {
						createdSeries =  regionalSetUp(series, 5,0, 3,3, "home",  3,2, "home", 2,7, "home",  1,8, "home",  4,0, "home",  6,6);
						}
						series = createdSeries.series;
					//	Team2LPL = helpers.deepCopy(twoSeed);

				} else if  (g.gameType >= 6 && g.seasonSplit == "Summer")  {
				//	console.log(series);
					let twoSeeds = [];
					let conf0Teams = [];
					let conf3Teams = [];
					let conf6Teams = [];
					let conf9Teams = [];
					let conf12Teams = [];
					const teams = helpers.orderByChampPoints(await idb.getCopies.teamsPlus({
						attrs: ["tid", "cid"],
						seasonAttrs: ["winp","won","cidNext","pointsYear","pointsSpring","pointsSummer","wonSummer", "lostSpring","lostSummer", "wonSpring", "winp", "winpSpring", "winpSummer","playoffRoundsWonNALCSStay","playoffRoundsWonNALCSStayEU","playoffRoundsWonNALCS","playoffRoundsWonEULCS","playoffRoundsWon","playoffRoundsWonRegionals"],
						stats: ["kda","fg","fga","fgp","oppTw","pf"],
				//        seasonAttrs: ["winp", "won"],
						season: g.season,
					}));
				//	console.log(teams);

					let conf0 = 0;
					let conf3 = 0;
					let conf6 = 0;
					let conf9 = 0;
					let conf12 = 0;

					let cid0 =0;
					let cid3 =3;
					let cid6 =6;
					let cid9 =9;
					let cid12 =12;

					if (g.gameType == 6) {
						cid3 = 1;
						cid6 = 2;
						cid9 = 3;
						cid12 = 4;
					}
					// Add entry for wins for each team, delete seasonAttrs just used for sorting
					for (let i = 0; i < teams.length; i++) {


						//teams[i].won = 0;

						if (teams[i].cid == cid0) {
	//console.log(i+" "+teams[i].cid+" "+teams[i].seasonAttrs.cidMid+" "+teams[i].tid+" "+teams[i].seasonAttrs.playoffRoundsWonMaybePlayoffs+" "+teams[i].seasonAttrs.playoffRoundsWonNALCSStay+" "+teams[i].seasonAttrs.pointsSummer+" "+teams[i].seasonAttrs.playoffRoundsWonNALCS);

							if (conf0 == 1 && teams[i].seasonAttrs.pointsYear > 0) {
								twoSeeds.push(teams[i]);
								conf0 += 1;
							} else if (conf0 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf0 += 1;
							} else if (conf0 <6 && (teams[i].seasonAttrs.pointsYear > 0 || teams[i].seasonAttrs.playoffRoundsWonMaybePlayoffs)) {
//							} else if (conf0 <6 && (teams[i].seasonAttrs.pointsSummer > 0)) {
								conf0 += 1;
								conf0Teams.push(teams[i]);
							}
						} else if (teams[i].cid == cid3) {
							if (conf3 == 1 && teams[i].seasonAttrs.pointsYear > 0) {
								twoSeeds.push(teams[i]);
								conf3 += 1;
							} else if (conf3 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf3 += 1;
							} else if (conf3 <6 && (teams[i].seasonAttrs.pointsYear > 0 || teams[i].seasonAttrs.playoffRoundsWonMaybePlayoffs)) {
//							} else if (conf3 <6 && (teams[i].seasonAttrs.pointsSummer > 0)) {
								conf3 += 1;
								conf3Teams.push(teams[i]);
							}
						} else if (teams[i].cid == cid6) {
							if (conf6 == 1 && teams[i].seasonAttrs.pointsYear > 0) {
								twoSeeds.push(teams[i]);
								conf6 += 1;
							} else if (conf6 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf6 += 1;
							} else if (conf6 <6 && (teams[i].seasonAttrs.pointsYear > 0 || teams[i].seasonAttrs.playoffRoundsWonRegionals)) {
								conf6 += 1;
								conf6Teams.push(teams[i]);
							}
						} else if (teams[i].cid == cid9) {
							if (conf9 == 1 && teams[i].seasonAttrs.pointsYear > 0) {
								twoSeeds.push(teams[i]);
								conf9 += 1;
							} else if (conf9 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf9 += 1;
//							} else if (conf9 <6 && (teams[i].seasonAttrs.pointsSummer > 0 || teams[i].seasonAttrs.playoffRoundsWonRegionals )) {
							} else if (conf9 <6 && (teams[i].seasonAttrs.pointsYear > 0 )) {
								conf9 += 1;
								conf9Teams.push(teams[i]);
							}
						} else if (teams[i].cid == cid12) {
							if (conf12 == 1 && teams[i].seasonAttrs.pointsYear > 0) {
								twoSeeds.push(teams[i]);
								conf12 += 1;
							} else if (conf12 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf12 += 1;
							} else if (conf12 <6 && (teams[i].seasonAttrs.pointsYear > 0 || teams[i].seasonAttrs.playoffRoundsWonRegionals)) {
								conf12 += 1;
								conf12Teams.push(teams[i]);
							}
						}

						if (conf0+conf3+conf6+conf9+conf12 >= 30) {
						   break;
						}
					}
					//console.log(conf0Teams);
//					console.log(conf3Teams);
				//	console.log(conf6Teams);
		//			console.log(conf9Teams);
			//		console.log(conf12Teams);
					createdSeries =  regionalSetUpChampionPoints(conf0Teams,series,6,0,false);
					createdSeries =  regionalSetUpChampionPoints(conf3Teams,series,6,2,false);
					createdSeries =  regionalSetUpChampionPoints(conf6Teams,series,6,4,true,6,5);	// second 6,5 is for a team not in tournament

															// based on length of conf6teams, should be able to guess this
					createdSeries =  regionalSetUpChampionPoints(conf9Teams,series,6,6,false);
													// based on length of conf6teams, should be able to guess this
					// LMS only has two?
					//createdSeries =  regionalSetUpChampionPoints(conf12Teams,series,6,8,false);


				}

			}

           if (rnd === 6) {
				// MSI Play-In Losers Game (Winner goes to groups)
				//// MOVE THIS BACK TO A LATER ROUND, RND 5/6?
				if ( (g.gameType >= 6 && g.seasonSplit == "Spring")) {
					//console.log(tidsLost);
					//	function createMSIPlayIn(series, tidsWon, tidsLost, rnd, 16, 2, 11, 1, 13) {
					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = createMSIPlayIn(series, tidsWonMSIPlayIn, tidsLost, rnd, 8, 8, 8, 7, 4);
						tidsWonMSIPlayIn = createdSeries.tidsWon;
					} else {
						createdSeries = createMSIPlayIn(series, tidsWon, tidsLost, rnd, 8, 8, 8, 7, 4);
						tidsWon = createdSeries.tidsWon;
					}

console.log(g.confs);

					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;
					key = createdSeries.key;
					key2 = createdSeries.key2;

					// Update playoffRoundsWon

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${key}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIPlayIn = 1;
					} else {
						teamSeason.playoffRoundsWonMSI = 2;
					}
					await idb.cache.teamSeasons.put(teamSeason);
					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${key2}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIPlayIn = 1;
					} else {
						teamSeason.playoffRoundsWonMSI = 2;
					}
					await idb.cache.teamSeasons.put(teamSeason);
					//console.log(series);
					//console.log(tidsWon);
					//console.log(tidsLost);


				}	else {


				//   i = 0;
					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonReg, tidsLost, rnd, 0, 7, 0, "winners", true, true);
						tidsWonReg = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, 7, 0, "winners", true, true);
						tidsWon = createdSeries.tidsWon;
					}
console.log(g.confs);
					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;

					if (g.gameType ==  7  ||  g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonReg, tidsLost, rnd, 2, 7, 1, "winners", true, true);
						tidsWonReg = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 2, 7, 1, "winners", true, true);
						tidsWon = createdSeries.tidsWon;
					}
console.log(g.confs);
					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;


					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonReg, tidsLost, rnd, 4, 7, 2, "winners", true, true);
						tidsWonReg = createdSeries.tidsWon;
					} else {
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 4, 7, 2, "winners", true, true);
						tidsWon = createdSeries.tidsWon;
					}
console.log(g.confs);
					series = createdSeries.series;
					tidsLost = createdSeries.tidsLost;


					createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 6, 7, 3, "winners", true, true);

					series = createdSeries.series;
					tidsWon = createdSeries.tidsWon;
					tidsLost = createdSeries.tidsLost;

				}
			}
			if (rnd === 7) {

				//// MOVE THIS LATER
				if (g.gameType >= 6 && g.seasonSplit == "Spring") {
				//	console.log(series[rnd][4]);
					if (series[rnd][4].home.won >= g.playoffWins) {
						key = series[rnd][4].home.tid;
						key2 = series[rnd][4].away.tid;
						Team3PlayIn = helpers.deepCopy(series[rnd][4].home);

					} else if (series[rnd][4].away.won >= g.playoffWins) {
						key = series[rnd][4].away.tid;
						key2 = series[rnd][4].home.tid;
						Team3PlayIn = helpers.deepCopy(series[rnd][4].away);
					}
			//		console.log(Team3PlayIn);
			//		console.log(series[8][10]);
					// Add winner to Group Stage
					Team2PlayIn = helpers.deepCopy(series[8][10].home);

					matchup = {home: Team2PlayIn, away: Team3PlayIn};
					matchup.home.won = 0;
					matchup.away.won = 0;
					matchup.home.loss = 0;
					matchup.away.loss = 0;
					series[8][10] = matchup;
					//console.log(series[8][10]);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${key}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIPlayIn = 1;
					} else {
						teamSeason.playoffRoundsWonMSI = 2;
					}

					await idb.cache.teamSeasons.put(teamSeason);
					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${key2}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIPlayIn = 0;
					} else {
						teamSeason.playoffRoundsWonMSI = 1;
					}
					await idb.cache.teamSeasons.put(teamSeason);

				} else {

					let twoSeeds = [];
					//let conf0Teams = [];
					//let conf3Teams = [];
					//let conf6Teams = [];
					//let conf9Teams = [];
					//let conf12Teams = [];
					const teams = helpers.orderByChampPoints(await idb.getCopies.teamsPlus({
						attrs: ["tid", "cid"],
						seasonAttrs: ["winp","won","cidNext","pointsYear","pointsSpring","pointsSummer","wonSummer", "lostSpring","lostSummer", "wonSpring", "winp", "winpSpring", "winpSummer","playoffRoundsWonNALCSStay","playoffRoundsWonNALCSStayEU","playoffRoundsWonNALCS","playoffRoundsWonEULCS","playoffRoundsWon"],
						stats: ["kda","fg","fga","fgp","oppTw","pf"],
				//        seasonAttrs: ["winp", "won"],
						season: g.season,
					}));
				//	console.log(teams);
					let conf0 = 0;
					let conf3 = 0;
					let conf6 = 0;
					let conf9 = 0;
					let conf12 = 0;

					let cid0 =0;
					let cid3 =3;
					let cid6 =6;
					let cid9 =9;
					let cid12 =12;

					if (g.gameType == 6) {
						cid3 = 1;
						cid6 = 2;
						cid9 = 3;
						cid12 = 4;
					}
					// Add entry for wins for each team, delete seasonAttrs just used for sorting
					for (let i = 0; i < teams.length; i++) {

				//		console.log(i+" "+teams[i].cid+" "+teams[i].seasonAttrs.cidMid+" "+teams[i].tid+" "+teams[i].seasonAttrs.pointsSpring+" "+teams[i].seasonAttrs.pointsSummer);



						if (teams[i].cid == cid0) {
							if (conf0 == 1) {
								twoSeeds.push(teams[i]);
								conf0 += 1;
							} else if (conf0 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf0 += 1;
					//		} else if (conf0 <6 && (teams[i].seasonAttrs.pointsSummer > 0 || teams[i].seasonAttrs.playoffRoundsWonNALCSStay)) {
						//		conf0 += 1;
							//	conf0Teams.push(teams[i]);
							}
						} else if (teams[i].cid == cid3) {
							if (conf3 == 1) {
								twoSeeds.push(teams[i]);
								conf3 += 1;
							} else if (conf3 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf3 += 1;
							//} else if (conf3 <6 && (teams[i].seasonAttrs.pointsSummer > 0 || teams[i].seasonAttrs.playoffRoundsWonEULCSStay)) {
								//conf3 += 1;
								//conf3Teams.push(teams[i]);
							}
						} else if (teams[i].cid == cid6) {
							if (conf6 == 1) {
								twoSeeds.push(teams[i]);
								conf6 += 1;
							} else if (conf6 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf6 += 1;
						//	} else if (conf6 <6 && (teams[i].seasonAttrs.pointsSummer > 0 || teams[i].seasonAttrs.playoffRoundsWon >= 0)) {
						//		conf6 += 1;
						//		conf6Teams.push(teams[i]);
							}
						} else if (teams[i].cid == cid9) {
							if (conf9 == 1) {
								twoSeeds.push(teams[i]);
								conf9 += 1;
							} else if (conf9 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf9 += 1;
							//} else if (conf9 <6 && (teams[i].seasonAttrs.pointsSummer > 0 || teams[i].seasonAttrs.playoffRoundsWon >= 0)) {
//								conf9 += 1;
	//							conf9Teams.push(teams[i]);
							}
						} else if (teams[i].cid == cid12) {
							if (conf12 == 1) {
								twoSeeds.push(teams[i]);
								conf12 += 1;
							} else if (conf12 == 0 && teams[i].seasonAttrs.pointsSummer == 1000) {
								conf12 += 1;
							//} else if (conf12 <6 && (teams[i].seasonAttrs.pointsSummer > 0 || teams[i].seasonAttrs.playoffRoundsWon >= 0)) {
//								conf12 += 1;
	//							conf12Teams.push(teams[i]);
							}
						}

						if (conf0+conf3+conf6+conf9+conf12 >= 10) {
						   break;
						}


						//teams[i].won = 0;
						//teams[i].winp = teams[i].seasonAttrs.winp;
						//teams[i].pointsSpring = teams[i].seasonAttrs.pointsSpring;
					//	teams[i].pointsSummer = teams[i].seasonAttrs.pointsSummer;
				//		delete teams[i].seasonAttrs;
					}

					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = worldsGroups(series, tidsWonWorldsGroups, 2,0,  2,9,  3,1,  5,0,  2,8,  1,12,
											   rnd,0,  rnd,1,  rnd,2,  rnd,3,
												1,1, 1,11, 2,6, 4,0,  1,9, 0,14,
												1,0, 1,10, 3,1, 4,1,  2,8, 0,15, twoSeeds, true);
						tidsWonWorldsGroups = createdSeries.tidsWon;
					} else {
						if (g.yearType != 2019) {


							// this works, but isn't correct
						createdSeries = worldsGroups(series, tidsWon, 2,0,  2,9,  3,1,  5,0,  2,8,  1,12,
											   rnd,0,  rnd,1,  rnd,2,  rnd,3,
												1,1, 1,11, 2,6, 4,0,  1,9, 0,14,
												1,0, 1,10, 3,1, 4,1,  2,8, 0,15, twoSeeds, true);
								// pool 1
								// NA China Europe LMs
								// pool 2
								// CIS LAN Brazil Turkey
								// pool 3
								// SEA Japan Oceania LAS

								//Group A

								//Group B

								//Group C

								//Group D




						} else {
							createdSeries = worldsGroups(series, tidsWon, 2,0,  2,9,  3,1,  3,4,  2,8,  2,33,
											   rnd,0,  rnd,1,  rnd,2,  rnd,3,
												1,1, 1,11, 2,6, 2,31,  1,9, 2,35,
												1,0, 1,10, 3,1, 2,32,  2,8, 1,50, twoSeeds, false);
						}
						tidsWon = createdSeries.tidsWon;
					}

					series = createdSeries.series;

				}


			}

			if (rnd === 8 || rnd === 12) {


			// MOVE THIS BACK
				// MSI Groups stage
				if (g.gameType >= 6 && g.seasonSplit == "Spring") {
					var teamSeason;
					// 3 existing
					// 3 from Play In

					// series, rnd (2), 11, 3, 4, 3, true
					//series = await groupResults(series, rnd, 11, 3, 4, 3, true, 6, 4);

					// may want to have all group results done below, since cache may not store playoffRoundsWon
					createdSeries = await groupResults(series, rnd, 8, 9, 4, 3, true, 6, 4);

					series = createdSeries.series;
		//			console.log(series);
					series[9][4].home.seed = 1;
					series[9][4].away.seed = 4;
					series[9][5].home.seed = 2;
					series[9][5].away.seed = 3;

					/*console.log(series[9][4].home.placement);
					console.log(series[9][4].away.placement);
					console.log(series[9][5].home.placement);
					console.log(series[9][5].away.placement);*/
					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][4].home.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSI = 0;
					} else {
						teamSeason.playoffRoundsWonMSI = 3;
					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][4].away.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSI = 0;
					} else {
						teamSeason.playoffRoundsWonMSI = 3;
					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][5].home.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSI = 0;
					} else {
						teamSeason.playoffRoundsWonMSI = 3;
					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][5].away.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6)  {
						teamSeason.playoffRoundsWonMSI = 0;
					} else {
						teamSeason.playoffRoundsWonMSI = 3;
					}
					await idb.cache.teamSeasons.put(teamSeason);



					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][8].home.tid}`);
					if (g.gameType == 7) {
						teamSeason.playoffRoundsWonMSIGr = series[8][8].home.won;
					} else {

					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][9].home.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIGr = series[8][9].home.won;
					} else {
					}

					await idb.cache.teamSeasons.put(teamSeason);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][10].home.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIGr = series[8][10].home.won;
					} else {
					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][8].away.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIGr = series[8][8].away.won;
					} else {
					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][9].away.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIGr = series[8][9].away.won;
					} else {

					}
					await idb.cache.teamSeasons.put(teamSeason);

					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][10].away.tid}`);
					if (g.gameType == 7  ||  g.gameType == 6) {
						teamSeason.playoffRoundsWonMSIGr = series[8][10].away.won;
					} else {

					}
					await idb.cache.teamSeasons.put(teamSeason);
				} else {

					// find teams with most wins from groups
					// series, rnd (2), 11, 3, 4, 3, true

//					createdSeries = await groupResults(series, rnd, 0, 9, 0, null, false, 16, 8);
// is this right?
					createdSeries = await groupResults(series, rnd, 0, rnd+1, 0, null, false, 16, 8);

					series = createdSeries.series;
					if (g.yearType == 2019 && rnd == 12) {
						tidsWon = createdSeries.tidsWon;
					}
					if ( (g.gameType == 7  ||  g.gameType == 6 )&& g.seasonSplit == "Summer") {
						// worlds playoffs, set to 0
						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][0].home.tid}`);
						teamSeason.playoffRoundsWonWorlds = 0;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][0].away.tid}`);
						teamSeason.playoffRoundsWonWorlds = 0;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][1].home.tid}`);
						teamSeason.playoffRoundsWonWorlds = 0;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][1].away.tid}`);
						teamSeason.playoffRoundsWonWorlds = 0;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][2].home.tid}`);
						teamSeason.playoffRoundsWonWorlds = 0;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][2].away.tid}`);
						teamSeason.playoffRoundsWonWorlds = 0;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][3].home.tid}`);
						teamSeason.playoffRoundsWonWorlds = 0;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[9][3].away.tid}`);
						teamSeason.playoffRoundsWonWorlds = 0;
						await idb.cache.teamSeasons.put(teamSeason);

						// worlds groups, store number of wins
						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][0].home.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][0].home.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][0].away.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][0].away.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][1].home.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][1].home.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][1].away.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][1].away.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][2].home.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][2].home.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][2].away.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][2].away.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][3].home.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][3].home.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][3].away.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][3].away.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][4].home.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][4].home.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][4].away.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][4].away.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][5].home.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][5].home.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][5].away.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][5].away.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][6].home.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][6].home.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][6].away.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][6].away.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][7].home.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][7].home.won;
						await idb.cache.teamSeasons.put(teamSeason);

						teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[8][7].away.tid}`);
						teamSeason.playoffRoundsWonWorldsGr = series[8][7].away.won;
						await idb.cache.teamSeasons.put(teamSeason);

					}

				}
			}

			if (rnd === 9 || rnd === 13) {

				// MOVE BACK
				if (g.gameType >= 6 && g.seasonSplit == "Spring") {


					if (series[9][4].home.won >= g.playoffWins) {
						team1 = helpers.deepCopy(series[9][4].home);

					} else {
						team1 = helpers.deepCopy(series[9][4].away);
					}

					if (series[9][5].home.won >= g.playoffWins) {
						team2 = helpers.deepCopy(series[9][5].home);

					} else {
						team2 = helpers.deepCopy(series[9][5].away);
					}

					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					matchup.home.loss = 0;
					matchup.away.loss = 0;
					series[10][2] = matchup;
					//console.log(matchup.home.placement);
					//console.log(matchup.away.placement);
					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${team1.tid}`);
					//teamSeason.playoffRoundsWonMSI = 4;
					teamSeason.playoffRoundsWonMSI = 1;
					await idb.cache.teamSeasons.put(teamSeason);
					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${team2.tid}`);
//					teamSeason.playoffRoundsWonMSI = 4;
					teamSeason.playoffRoundsWonMSI = 1;
					await idb.cache.teamSeasons.put(teamSeason);


				} else {

					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonWorlds, tidsLost, rnd, 0, 10, 0, "winners", false, true);
						tidsWonWorlds = createdSeries.tidsWon;
					} else if (g.yearType == 2019 && rnd===9) {
					} else {
//						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, 10, 0, "winners", false, true);
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, rnd+1, 0, "winners", false, true);
						tidsWon = createdSeries.tidsWon;
					}

				if (g.yearType == 2019 && rnd===9) {
					} else {
						series = createdSeries.series;
					}



					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonWorlds, tidsLost, rnd, 2, 10, 1, "winners", false, true);
						tidsWonWorlds = createdSeries.tidsWon;
					} else if (g.yearType == 2019 && rnd===9) {
					} else {
//						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 2, 10, 1, "winners", false, true);
						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 2, rnd+1, 1, "winners", false, true);
						tidsWon = createdSeries.tidsWon;
					}

				if (g.yearType == 2019 && rnd===9) {
					} else {
						series = createdSeries.series;
					}


				}
			}

			if (rnd === 10 || rnd === 14) {
				// MOVE BACK
				if (g.gameType >= 6 && g.seasonSplit == "Spring") {


					if (series[10][2].home.won >= g.playoffWins) {
						key = series[10][2].home.tid;

					} else {
						key = series[10][2].away.tid;
					}


					teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${key}`);
					//teamSeason.playoffRoundsWonMSI = 5;
					teamSeason.playoffRoundsWonMSI = 2;
					await idb.cache.teamSeasons.put(teamSeason);

					return true;
				} else {
					if (g.gameType == 7  ||  g.gameType == 6) {
						createdSeries = createSeriesBothNew(series, tidsWonWorlds, tidsLost, rnd, 0, 11, 0, "winners", false, true);
						tidsWonWorlds = createdSeries.tidsWon;
					} else if (g.yearType == 2019 && rnd===10) {

					} else {
//						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, 11, 0, "winners", false, true);

						createdSeries = createSeriesBothNew(series, tidsWon, tidsLost, rnd, 0, rnd+1, 0, "winners", false, true);
						tidsWon = createdSeries.tidsWon;
					}
					if (g.yearType == 2019 && rnd===10) {
					} else {
						series = createdSeries.series;
					}
				}


			}

			if (rnd === 11 || rnd === 15) {

//async function recordWinnerLoser(series, rnd, rndLocation, playoffRoundsWon, hypeChange, winnerOrLoser, cash, cashAmount, hypeMult, hypeAmount) {
					if (g.yearType == 2019 && rnd === 11) {
						//return true;
					} else {
						if  (g.yearType == 2019 ) {
							// extra stages push back from 6 to 10 rounds won
							await recordWinnerLoser(series, rnd, 0, 10, 0.05, "winner", true, 200000, true, .7, 'playoffRoundsWonWorlds' );
						} else {
							await recordWinnerLoser(series, rnd, 0, 6, 0.05, "winner", true, 200000, true, .7, 'playoffRoundsWonWorlds' );
						}
					}
				if ( (g.gameType == 5)  ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) {
					//				console.log("here");
					if (g.yearType != 2019 || rnd === 15) {
						return true;
					} else {
				let twoSeeds = [];
        /*nction worldsGroups(series, tidsWon, rndNA1, seriesNA1, rndEU1, seriesEU1, rndLCK1, seriesLCK1, rndLPL1, seriesLPL1, rndLMS1, seriesLMS1, rndWC1, seriesWC1,
      										   rndNA3, seriesNA3, rndEU3, seriesEU3, rndLCK3, seriesLCK3, rndLPL3, seriesLPL3,
      										   rndNA2, seriesNA2, rndEU2, seriesEU2, rndLCK2, seriesLCK2, rndLPL2, seriesLPL2, rndLMS2, seriesLMS2, rndWC2, seriesWC2,
      										   rndNA2alt, seriesNA2alt, rndEU2alt, seriesEU2alt, rndLCK2alt,
      										   seriesLCK2alt, rndLPL2alt, seriesLPL2alt, rndLMS2alt, seriesLMS2alt, rndWC2alt, seriesWC2alt,
      										   twoSeeds,finalStage) {*/
						createdSeries = worldsGroups(series, tidsWon, 2,0,  2,9,  3,1,  3,4,  2,8,  2,33,
											   rnd,0,  rnd,1,  rnd,2,  rnd,3,
												1,1, 1,11, 2,6, 2,31,  1,9, 2,35,
												1,0, 1,10, 3,1, 2,32,  2,8, 1,50, twoSeeds, true);
						tidsWon = createdSeries.tidsWon;
					series = createdSeries.series;
//console.log(series);
					}
				}
			}

			if (rnd == 12) {


									//	return true;
			}
			if (rnd == 13) {
							//			return true;
			}
			if (rnd == 14) {
							//			return true;
			}
			if (rnd == 15) {
				return true;
			}

	///// Below Finished
	if (rnd == 8 && g.gameType == 5) {
	/*	console.log(series)
		console.log(series[8][0]);
		console.log(series[8][1]);
		console.log(series[8][2]);
		console.log(series[8][3]);
		console.log(series[8][4]);
		console.log(series[8][5]);
		console.log(series[8][6]);
		console.log(series[8][7]);
		let  t;
		if  (g.gameType >= 5) {
			t 	= series[8][0].home.tid;
		}
		console.log(t);
		if (t !== undefined) {
			let playersWon = await idb.cache.players.indexGetAll('playersByTid', t.tid);
			console.log(playersWon);
			for (let pWon of playersWon) {
				console.log(pWon);
				pWon.awards.push({season: g.season, type: "Won Championship"});
				await idb.cache.players.put(pWon);
			}
		}*/

		let tidsLCSWon = [];
		tidsLCSWon.push(series[8][0].home.tid);
		tidsLCSWon.push(series[8][2].home.tid);
		tidsLCSWon.push(series[8][4].home.tid);
		tidsLCSWon.push(series[8][6].home.tid);
		tidsLCSWon.push(series[8][6].away.tid);
		tidsLCSWon.push(series[8][5].away.tid);
		await Promise.all(tidsLCSWon.map(async (tid) => {
			teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);
			teamSeason.pointsSummer = 1000;

			await idb.cache.teamSeasons.put(teamSeason);
		}));

	}



	//if (g.yearType == 2019 && rnd == 9) {
	//	playoffSeries.currentRound += 2;

	//} else {
    playoffSeries.currentRound += 1;
//	}
	//console.log(playoffSeries.currentRound);

	if (g.gameType >=6 && g.seasonSplit == "Spring") {
		//console.log(playoffSeries);
		//console.log(playoffSeries.seriesMSI);
	//	playoffSeries.seriesMSI = playoffSeries.series;
		//console.log(playoffSeries);
		//console.log(playoffSeries.seriesMSI);
		await idb.cache.msiSeries.put(playoffSeries);
	} else {
		await idb.cache.playoffSeries.put(playoffSeries);
	}

//	console.log(rnd);
//	console.log(playoffSeries.currentRound);
//	console.log(tidsWon);
//	console.log(tidsLost);
    // Update hype for winning a series
//	console.log(tidsWon);
    await Promise.all(tidsWon.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);


		if (g.gameType == 1 || g.gameType == 7  ||  g.gameType == 6) {
			teamSeason.playoffRoundsWon += 1;
		} else if  ((g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) && (rnd>8)  ) {
			teamSeason.playoffRoundsWon = playoffSeries.currentRound-6;
		} else if (g.gameType == 5 || (g.gameType >= 6 && g.seasonSplit == "Summer")) {

		} else if (g.gameType >= 6 && g.seasonSplit == "Spring") {
		//	console.log(teamSeason.playoffRoundsWon);
		} else {
			teamSeason.playoffRoundsWon = playoffSeries.currentRound;
		}
	//	console.log(teamSeason.hype);
		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}
	//	console.log(teamSeason.hype);

    ///   // teamSeason.playoffRoundsWon = playoffSeries.currentRound;
       // teamSeason.hype += 0.05;
        //if (teamSeason.hype > 1) {
          //  teamSeason.hype = 1;
        //}

        await idb.cache.teamSeasons.put(teamSeason);
    }));


	//console.log(tidsLost);

    await Promise.all(tidsLost.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

	//	console.log(tid);
	//	console.log(teamSeason);
		if ((g.gameType == 1) || (g.gameType == 5) || (g.gameType >= 6)) {
			//t.seasons[s].playoffRoundsWon += 1;
		} else {
			teamSeason.playoffRoundsWon = playoffSeries.currentRound-1;
		}
		//console.log(teamSeason.hype);
		teamSeason.hype *= 0.95;
        teamSeason.hype += 0.05;
        if (teamSeason.hype > 1) {
            teamSeason.hype = 1;
        }
	//	console.log(teamSeason.hype);

        await idb.cache.teamSeasons.put(teamSeason);
    }));


	//console.log(tidsWonLCSNA);

    await Promise.all(tidsWonLCSNA.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);


		teamSeason.playoffRoundsWonNALCS += 1;
		//console.log("NA LCS: "+teamSeason.playoffRoundsWonNALCS);
		if (g.seasonSplit == "Spring" && (teamSeason.pointsSpring > 0) ) {
			if (teamSeason.playoffRoundsWonNALCS == 1) {
				teamSeason.pointsSpring = 30;
			} else if (teamSeason.playoffRoundsWonNALCS == 2) {
				teamSeason.pointsSpring = 70;
			} else if (teamSeason.playoffRoundsWonNALCS == 3) {
				teamSeason.pointsSpring = 70;
			} else if (teamSeason.playoffRoundsWonNALCS == 4) {
				teamSeason.pointsSpring = 90;
			}
		} else if (teamSeason.pointsSummer > 0)  {
			if (teamSeason.playoffRoundsWonNALCS == 1) {
				teamSeason.pointsSummer = 40;
			//	console.log(teamSeason.pointsSummer);
			} else if (teamSeason.playoffRoundsWonNALCS == 2) {
				teamSeason.pointsSummer = 90;
			} else if (teamSeason.playoffRoundsWonNALCS == 3) {
				teamSeason.pointsSummer = 90;
			} else if (teamSeason.playoffRoundsWonNALCS == 4) {
			//	console.log("NA 1000");
			//	console.log(tidsWonLCSNA);

				teamSeason.pointsSummer = 1000;	// automatic qualifier
			}
		}
		//console.log(teamSeason.hype);
		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}
		//console.log(teamSeason.hype);
        await idb.cache.teamSeasons.put(teamSeason);
    }));

    await Promise.all(tidsWonLCSEU.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonEULCS += 1;
		//console.log("EU LCS: "+teamSeason.playoffRoundsWonEULCS);
		if (g.seasonSplit == "Spring" && (teamSeason.pointsSpring > 0) ) {
			if (teamSeason.playoffRoundsWonEULCS == 1) {
				teamSeason.pointsSpring = 30;
			} else if (teamSeason.playoffRoundsWonEULCS == 2) {
				teamSeason.pointsSpring = 70;
			} else if (teamSeason.playoffRoundsWonEULCS == 3) {
				teamSeason.pointsSpring = 70;
			} else if (teamSeason.playoffRoundsWonEULCS == 4) {
				teamSeason.pointsSpring = 90;
			}
		} else if (teamSeason.pointsSummer > 0) {
			if (teamSeason.playoffRoundsWonEULCS == 1) {
			//	console.log("EU 40");
			//	console.log(tidsWonLCSEU);
				teamSeason.pointsSummer = 40;
			} else if (teamSeason.playoffRoundsWonEULCS == 2) {
				teamSeason.pointsSummer = 90;
			} else if (teamSeason.playoffRoundsWonEULCS == 3) {
				teamSeason.pointsSummer = 90;
			} else if (teamSeason.playoffRoundsWonEULCS == 4) {
				//console.log("EU 1000");
				//console.log(tidsWonLCSEU);

				teamSeason.pointsSummer = 1000;	// automatic qualifier
			}
		}
		//console.log(teamSeason.hype);
		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}
	//	console.log(teamSeason.hype);
        await idb.cache.teamSeasons.put(teamSeason);
    }));



    await Promise.all(tidsWonLCSLCK.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonLCK += 1;
		//console.log("LCK: "+teamSeason.playoffRoundsWonLCK);
		if (g.seasonSplit == "Spring" && (teamSeason.pointsSpring > 0) ) {
			if (teamSeason.playoffRoundsWonLCK == 1) {
				teamSeason.pointsSpring = 30;
			} else if (teamSeason.playoffRoundsWonLCK == 2) {
				teamSeason.pointsSpring = 50;
			} else if (teamSeason.playoffRoundsWonLCK == 3) {
				teamSeason.pointsSpring = 70;
			} else if (teamSeason.playoffRoundsWonLCK == 4) {
				teamSeason.pointsSpring = 90;
			}
		} else if (teamSeason.pointsSummer > 0) {
			if (teamSeason.playoffRoundsWonLCK == 1) {
				teamSeason.pointsSummer = 40;
//console.log("LCK 40");
			//	console.log(tidsWonLCSLCK);
			} else if (teamSeason.playoffRoundsWonLCK == 2) {
				teamSeason.pointsSummer = 70;
			} else if (teamSeason.playoffRoundsWonLCK == 3) {
				teamSeason.pointsSummer = 90;
			} else if (teamSeason.playoffRoundsWonLCK == 4) {
			//	console.log("LCK 1000");
			//	console.log(tidsWonLCSLCK);

				teamSeason.pointsSummer = 1000;	// automatic qualifier
			}
		}
		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));

    await Promise.all(tidsWonLCSLPL.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonLPL += 1;
		//console.log("LPL: "+teamSeason.playoffRoundsWonLPL);
		if (g.seasonSplit == "Spring" && (teamSeason.pointsSpring > 0) ) {
			if (teamSeason.playoffRoundsWonLPL == 1) {
				teamSeason.pointsSpring = 30;
			} else if (teamSeason.playoffRoundsWonLPL == 2) {
				teamSeason.pointsSpring = 50;
			} else if (teamSeason.playoffRoundsWonLPL == 3) {
				teamSeason.pointsSpring = 70;
			} else if (teamSeason.playoffRoundsWonLPL == 4) {
				teamSeason.pointsSpring = 110;
			} else if (teamSeason.playoffRoundsWonLPL == 5) {
				teamSeason.pointsSpring = 130;
			}
		} else if (teamSeason.pointsSummer > 0) {
			if (teamSeason.playoffRoundsWonLPL == 1) {
			//	console.log("LPL 40");
			//	console.log(tidsWonLCSLPL);
				teamSeason.pointsSummer = 40;
			} else if (teamSeason.playoffRoundsWonLPL == 2) {
				teamSeason.pointsSummer = 60;
			} else if (teamSeason.playoffRoundsWonLPL == 3) {
				teamSeason.pointsSummer = 80;
			} else if (teamSeason.playoffRoundsWonLPL == 4) {
				teamSeason.pointsSummer = 120;
			} else if (teamSeason.playoffRoundsWonLPL == 5) {
			//	console.log("LPL 1000");
			//	console.log(tidsWonLCSLPL);
				teamSeason.pointsSummer = 1000;
			}
		}
		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));

    await Promise.all(tidsWonLCSLMS.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonLMS += 1;
		//console.log("LMS: "+teamSeason.playoffRoundsWonLMS);
		if (g.seasonSplit == "Spring" && (teamSeason.pointsSpring > 0) ) {
			if (teamSeason.playoffRoundsWonLMS == 1) {
				teamSeason.pointsSpring = 30;
			} else if (teamSeason.playoffRoundsWonLMS == 2) {
				teamSeason.pointsSpring = 50;
			} else if (teamSeason.playoffRoundsWonLMS == 3) {
				teamSeason.pointsSpring = 70;
			} else if (teamSeason.playoffRoundsWonLMS == 4) {
				teamSeason.pointsSpring = 90;
			}
		} else if (teamSeason.pointsSummer > 0) {
			if (teamSeason.playoffRoundsWonLMS == 1) {
				//console.log("LMS 40");
				//console.log(tidsWonLCSLMS);

				teamSeason.pointsSummer = 40;
			} else if (teamSeason.playoffRoundsWonLMS == 2) {
				teamSeason.pointsSummer = 70;
			} else if (teamSeason.playoffRoundsWonLMS == 3) {
				teamSeason.pointsSummer = 90;
			} else if (teamSeason.playoffRoundsWonLMS == 4) {
		//		console.log("LMS 1000");
			//	console.log(tidsWonLCSLMS);
				teamSeason.pointsSummer = 1000;	// automatic qualifier
			}
		}
		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));


    await Promise.all(tidsWonLCSPro.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonNALCSPr += 1;

		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
	}));

    await Promise.all(tidsWonCSPro.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonNACSPrA += 1;

		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));

    await Promise.all(tidsWonReg.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonWorldsReg += 1;

		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));

    await Promise.all(tidsWonWorldsGroups.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonWorldsGr += 1;

		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));

    await Promise.all(tidsWonWorlds.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonWorlds += 1;

		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));


	if (rnd == 5) {

		await Promise.all(tidsWonMSIPlayIn.map(async (tid) => {
			teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

			teamSeason.playoffRoundsWonMSIPlayIn == 0;

			teamSeason.hype *= 0.95;
			teamSeason.hype += 0.05;
			if (teamSeason.hype > 1) {
				teamSeason.hype = 1;
			}

			await idb.cache.teamSeasons.put(teamSeason);
		}));
	}

    await Promise.all(tidsWonMSIGroups.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonMSIGr += 1;

		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));

//console.log(tidsWonMSI);

    await Promise.all(tidsWonMSI.map(async (tid) => {
        teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${tid}`);

		teamSeason.playoffRoundsWonMSI += 1;
		console.log("Just won MSI?");

		teamSeason.hype *= 0.95;
		teamSeason.hype += 0.05;
		if (teamSeason.hype > 1) {
			teamSeason.hype = 1;
		}

        await idb.cache.teamSeasons.put(teamSeason);
    }));


	if (( (g.gameType == 5 && g.yearType != 2019) ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) && (rnd == 5)) {
		for (i = 0; i < 8; i++) {
				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[rnd+1][i].home.tid}`);

				teamSeason.playoffRoundsWon = 1;
				teamSeason.hype *= 0.95;
				teamSeason.hype += 0.05;
				if (teamSeason.hype > 1) {
					teamSeason.hype = 1;
				}

				await idb.cache.teamSeasons.put(teamSeason);
		}
	}


	if (((g.gameType == 5 && g.yearType != 2019)  ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) && (rnd == 5)) {
		for (i = 0; i < 8; i++) {
				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[rnd+1][i].away.tid}`);

				teamSeason.playoffRoundsWon = 1;
				teamSeason.hype *= 0.95;
				teamSeason.hype += 0.05;
				if (teamSeason.hype > 1) {
					teamSeason.hype = 1;
				}

				await idb.cache.teamSeasons.put(teamSeason);
		}
	}

	if ((g.gameType == 5  ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) && (rnd == 7)) {
		for (i = 0; i < 8; i++) {
				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[rnd+1][i].home.tid}`);

				teamSeason.playoffRoundsWon = 2;
				teamSeason.hype *= 0.95;
				teamSeason.hype += 0.05;
				if (teamSeason.hype > 1) {
					teamSeason.hype = 1;
				}

				await idb.cache.teamSeasons.put(teamSeason);
		}
	}

	if ((g.gameType == 5  ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) && (rnd == 7)) {
		for (i = 0; i < 8; i++) {
				teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[rnd+1][i].away.tid}`);

				teamSeason.playoffRoundsWon = 2;
				teamSeason.hype *= 0.95;
				teamSeason.hype += 0.05;
				if (teamSeason.hype > 1) {
					teamSeason.hype = 1;
				}

				await idb.cache.teamSeasons.put(teamSeason);
		}
	}
	if ((g.gameType == 5  ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) && (rnd == 8)) {
		/*console.log(series);
		console.log(rnd+1);
		console.log(series[0]);
		console.log(series[1]);
		console.log(series[2]);
		console.log(series[3]);
		console.log(series[4]);
		console.log(series[5]);
		console.log(series[6]);
		console.log(series[7]);
		console.log(series[8]);
		console.log(series[9]);
		console.log(series[rnd]);
		console.log(series[rnd+1]);*/
		for (i = 0; i < 4; i++) {
	/*	console.log(i);
		console.log(series[rnd+1][i]);
		console.log(series[rnd+1][i].home.tid);	*/
			teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[rnd+1][i].home.tid}`);

			teamSeason.playoffRoundsWon = 3;
			teamSeason.hype *= 0.95;
			teamSeason.hype += 0.05;
			if (teamSeason.hype > 1) {
				teamSeason.hype = 1;
			}

			await idb.cache.teamSeasons.put(teamSeason);
		}
	}
	if ((g.gameType == 5  ||  (g.gameType >= 6 && g.seasonSplit == "Summer") ) && (rnd == 8)) {
		for (i = 0; i < 4; i++) {
			teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${series[rnd+1][i].away.tid}`);

			teamSeason.playoffRoundsWon = 3;
			teamSeason.hype *= 0.95;
			teamSeason.hype += 0.05;
			if (teamSeason.hype > 1) {
				teamSeason.hype = 1;
			}

			await idb.cache.teamSeasons.put(teamSeason);
		}
	}

	//console.log("here");
    // Next time, the schedule for the first day of the next round will be set
    return newSchedulePlayoffsDay();
}

/**
 * Get the number of days left in the regular season schedule.
 *
 * @memberOf core.season
 * @return {Promise} The number of days left in the schedule.
 */
async function getDaysLeftSchedule() {
    let schedule = await getSchedule();

    let numDays = 0;

	//console.log(schedule.length);
    while (schedule.length > 0) {
        // Only take the games up until right before a team plays for the second time that day
        const tids = [];
        let i;
        for (i = 0; i < schedule.length; i++) {
            if (!tids.includes(schedule[i].homeTid) && !tids.includes(schedule[i].awayTid)) {
                tids.push(schedule[i].homeTid);
                tids.push(schedule[i].awayTid);
            } else {
                break;
            }
        }
        numDays += 1;
        schedule = schedule.slice(i);
    }

    return numDays;
}

//function genPlayoffSeriesMSI(teams: TeamFiltered[], series) {
function genPlayoffSeriesMSI( series, tidsWon) {



		    var cid, i,  teamsConf,teamsConf2,teamsConf3,teamsConf4,teamsConf5,teamsConf6;
			var tidPlayoffs;
			//var series;
			var topSeedDone;

			//const series = _.range(g.numPlayoffRounds).map(() => []);
			//series = [[], [], [], [], [], [], [], [], [], [], [], []];  // First round, second round, third round, fourth round

			tidPlayoffs = [];

			teamsConf = [];
			teamsConf2 = [];
			teamsConf3 = [];
			teamsConf4 = [];
			teamsConf5 = [];
			teamsConf6 = [];





		//	console.log(g.gameType+" "+g.seasonSplit);
			// Worlds Spring MSI

			// skip initial groups stage, since already have top teams form region
			// take top two from WC regular season, pair with top NA and top LMS
			// winners make it
			// then losers play, winner of that match makes it

			if (g.gameType >= 6 && g.seasonSplit == "Spring") {
			// top from each of NA 0 and LMS 12
			// top two from Wild Card Conference: 15

				var createdSeries;
				//teamsConf = [];

//											1,0, 1,10, 3,1, 4,1,  2,8, 0,15) {

				createdSeries = worldsGroups(series, tidsWon,
				2, 0, // NA
				2, 9,  //EU
				3, 1, // LCK
				5, 0, // LPL
				2, 8, // LMS
				1, 12, // WC
			   /*rndNA3, seriesNA3, rndEU3, seriesEU3, rndLCK3, seriesLCK3, rndLPL3, seriesLPL3,
			   rndNA2, seriesNA2, rndEU2, seriesEU2, rndLCK2, seriesLCK2, rndLPL2, seriesLPL2, rndLMS2, seriesLMS2,
			   rndWC2, seriesWC2, // WC2 juse lose loser of above
			   rndNA2alt, seriesNA2alt, rndEU2alt, seriesEU2alt, rndLCK2alt,
			   seriesLCK2alt, rndLPL2alt, seriesLPL2alt, rndLMS2alt, seriesLMS2alt, rndWC2alt, seriesWC2alt*/
			   );

				series = createdSeries.series;
				tidsWon = createdSeries.tidsWon;
				//	console.log(series);
				//	console.log(tidsWon);
		/*		for (cid = 0; cid < 1; cid++) {
					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
						//	if (teams[i].cid === cid) {
								//teamsConf.push(teams[i]);
								//tidPlayoffs.push(teams[i].tid);
								if (teamsConf.length<1) {
									tidPlayoffs.push(teams[i].tid);
									teamsConf.push(teams[i]);
								}
						//	}
						}
					}
				}
				for (cid = 12; cid < 13; cid++) {
				//	teamsConf = [];

					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
						//	if (teams[i].cid === cid) {
							//	teamsConf.push(teams[i]);
								//tidPlayoffs.push(teams[i].tid);
								if (teamsConf.length<2) {
									tidPlayoffs.push(teams[i].tid);
									teamsConf.push(teams[i]);
								}
							//}
						}
					}
				}
				for (cid = 15; cid < 16; cid++) {
				//	teamsConf = [];

					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
						//	if (teams[i].cid === cid) {
								//teamsConf.push(teams[i]);
								if (teamsConf.length<4) {
									tidPlayoffs.push(teams[i].tid);
									teamsConf.push(teams[i]);
								}
						//	}
						}
					}
				}
*/
				// randomly let NA and LMS teams switch 1 and 2 seeds
				//console.log(teamsConf);
		/*		if (Math.random() < .5) {
					series[6][ 8 ] = {home: teamsConf[1], away: teamsConf[2]};
					series[6][9 ] = {home: teamsConf[0], away: teamsConf[3]};
					series[6][8 ].home.placement = "LMS1";
					series[6][8 ].away.placement = "WC1";
					series[6][9 ].home.placement = "NA1";
					series[6][9 ].away.placement = "WC2";

				} else {
					series[6][ 8 ] = {home: teamsConf[0], away: teamsConf[2]};
					series[6][9 ] = {home: teamsConf[1], away: teamsConf[3]};
					series[6][8 ].home.placement = "NA1";
					series[6][8 ].away.placement = "WC1";
					series[6][9 ].home.placement = "LMS1";
					series[6][9 ].away.placement = "WC2";
				}

				series[6][ 8 ].home.seed = 2;
				series[6][ 8 ].away.seed = 3;


				series[6][9 ].home.seed = 1;
				series[6][9 ].away.seed = 4;	*/

				//console.log(series);
				// team that get automatic MSI Group bids

				//EU
			/*	for (cid = 3; cid < 4; cid++) {
				//	teamsConf = [];

					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
						//	if (teams[i].cid === cid) {
								//teamsConf.push(teams[i]);
								//tidPlayoffs.push(teams[i].tid);
								if (teamsConf.length<5) {
									tidPlayoffs.push(teams[i].tid);
									teamsConf.push(teams[i]);
								}
						//	}
						}
					}
				}

				//LCK
				for (cid = 6; cid < 7; cid++) {
				//	teamsConf = [];

					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
						//	if (teams[i].cid === cid) {
								//teamsConf.push(teams[i]);
								//tidPlayoffs.push(teams[i].tid);
								if (teamsConf.length<6) {
									tidPlayoffs.push(teams[i].tid);
									teamsConf.push(teams[i]);
								}
							//}
						}
					}
				}

				//LPL
				for (cid = 9; cid < 10; cid++) {
				//	teamsConf = [];

					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
							//if (teams[i].cid === cid) {
								//teamsConf.push(teams[i]);
								//tidPlayoffs.push(teams[i].tid);
								if (teamsConf.length<7) {
									tidPlayoffs.push(teams[i].tid);
									teamsConf.push(teams[i]);
								}
							//}
						}
					}
				} 	*/

			/*	series[8][8] = {home: teamsConf[4], away: teamsConf[5]};
				series[8][9] = {home: teamsConf[6], away: teamsConf[6]};
			//	series[2][13] = {home: teamsConf[6], away: teamsConf[6]};
				//console.log(series[2][11]);
				//console.log(series[2][12]);
				//console.log(series[2][13]);

				series[8][8 ].home.seed = 1;
				series[8][9 ].away.seed = 1;

				series[8][9 ].home.seed = 1;
			//	series[2][12 ].away.seed = 1;

			//	series[2][13 ].home.seed = 1;
			//	series[2][13 ].away.seed = 1;

				series[8][8 ].home.placement = "EU1";
				series[8][8 ].away.placement = "LCK1";

				series[8][9 ].home.placement = "LPL1";

				series[8][8 ].home.won = 0;
				series[8][8 ].away.won = 0;
				series[8][9 ].home.won = 0;
				series[8][8 ].home.loss = 0;
				series[8][8 ].away.loss = 0;
				series[8][9 ].home.loss = 0;*/

//				series[2][12 ].away.placement = "LCK1";

	//			series[2][13 ].home.placement = "LPL1";
		//		series[2][13 ].away.placement = "LPL1";

			}

	//	console.log(series);
    return {
		series,
		tidsWon,

	};

}


function genPlayoffSeries(teams: TeamFiltered[]) {


console.log(g.confs);
	//console.log("got here");
	//if (g.gameType < 6) {
		return genPlayoffSeriesOld(teams);
		// have MSI done in Spring game > 5
		// have Worlds done in Summer (make gametype >4
		// have conference tournies done in gametype 6 as well, using those for initial seeding


///	} else {
	//	return genPlayoffSeriesWorlds(teams);
	//}

}



function genPlayoffSeriesNALCS(
	teams: TeamFiltered[],
	cidLCS,
	series,
	tidPlayoffs,
	tidLCSChamp,
	tidLCS,
	tidLCSPromotion,
	tidCS,
	teamsConf,
	tidLCS2R,
	tidLCSStay,

	) {
		var cid, i;
		var location1, location2, location3, location4;
	//	console.log(series);
//	console.log("CREATING LCS SERIES");
//  console.log(cidLCS);
		for (cid = cidLCS; cid < cidLCS+1; cid++) {

			teamsConf = [];

//console.log(teams);
			for (i = 0; i < teams.length; i++) {
        //console.log(teams[i].cid);
				if (teams[i].cid === cid) {
					//console.log(teams[i]);
					teamsConf.push(teams[i]);
				}
			}

///console.log(teamsConf);
			for (i = 0; i < teamsConf.length; i++) {
			//	console.log(teamsConf[i]);
				if (i<6 || teamsConf[i].pointsYear > 0 ) {
					tidPlayoffs.push(teamsConf[i].tid);
					if (g.gameType==1) {
						tidLCSChamp.push(teamsConf[i].tid);
					}
				}

				if ( (i<(teamsConf.length-4) ) && (g.gameType == 6 || g.gameType == 7 || g.gameType==1) ) {
					if (i<2 && (g.gameType == 7 || g.gameType == 6 ) ) {
						tidLCS2R.push(teamsConf[i].tid);
					} else {
						tidLCS.push(teamsConf[i].tid);
					}
				} else if ( (i<(teamsConf.length-3) ) && (g.gameType == 7  || g.gameType == 6  || g.gameType==1) ) {
						tidLCSStay.push(teamsConf[i].tid);
				}

				if ( ((i==(teamsConf.length-3)) || (i==(teamsConf.length-2) )) && (g.gameType == 7 || g.gameType==1) ) {
					tidPlayoffs.push(teamsConf[i].tid);
					tidLCSPromotion.push(teamsConf[i].tid);
					//console.log(cid+" "+teamsConf[i].tid);
					//console.log(tidLCSPromotion);

				}
				if ( (i==(teamsConf.length-1))  && (g.gameType == 7 || g.gameType==1) ) {
					tidCS.push(teamsConf[i].tid);
				}

			}

			if (((g.gameType == 5 || g.gameType == 6) && cidLCS ==1 ) ||   (g.gameType == 7 && cidLCS == 3 ))  {
				location1 = 12;
				location2 = 10;
				location3 = 12;
				location4 = 10;
			} else {
				location1 = 0;
				location2 = 0;
				location3 = 0;
				location4 = 0;
			}

			// First Conference
			//console.log("NA LCS");
	//		console.log(teamsConf);

		//	console.log(g.gameType);
		//	console.log(cidLCS);
		//	console.log(location1);
		//	console.log(series);
		//	console.log(teamsConf);
			series[0][0 + location1] = {home: teamsConf[3], away: teamsConf[4]};
			series[0][0 + location1].home.seed = 4;
			series[0][0 + location1].away.seed = 5;


			series[1][0 + location2] = {home: teamsConf[0],away: teamsConf[0] };
			series[1][0 + location2].home.seed = 1;

			series[0][1 + location3] = {home: teamsConf[2], away: teamsConf[5]};
			series[0][1 + location3].home.seed = 3;
			series[0][1 + location3].away.seed = 6;

			series[1][1 + location4] = {home: teamsConf[1],away: teamsConf[1] };
			series[1][1 + location4].home.seed = 2;
//console.log(series);
		}


		if (g.gameType == 7 && cidLCS == 3) {
			var teamsConfRest;

			for (cid = cidLCS+3; cid < cidLCS+15; cid += 3) {
		//	 console.log(cid);
				teamsConfRest = [];

				for (i = 0; i < teams.length; i++) {
					if (teams[i].cid === cid) {
						teamsConfRest.push(teams[i]);
					}
				}
				for (i = 0; i < teamsConfRest.length; i++) {
					if ( ((i==(teamsConfRest.length-3)) || (i==(teamsConfRest.length-2) )) && (g.gameType == 7 || g.gameType==1) ) {
						tidPlayoffs.push(teamsConfRest[i].tid);
						tidLCSPromotion.push(teamsConfRest[i].tid);
					//	console.log(cid+" "+teamsConfRest[i].tid);
					//	console.log(tidLCSPromotion);
					}
					if ( (i==(teamsConfRest.length-1))  && (g.gameType == 7 || g.gameType==1) ) {
						tidCS.push(teamsConfRest[i].tid);
					}
				}
			}
		}


		//console.log(g.gameType+" "+cidLCS);
		//console.log(series);

		//if (g.gameType >= 5 && cidLCS ==1 ) {
//		if ((g.gameType == 5 && cidLCS ==1 ) ||   (g.gameType == 6 && cidLCS == 3 ))  {
		if (((g.gameType == 5 || g.gameType == 6) && cidLCS ==1 ) ||   (g.gameType == 7 && cidLCS == 3 ))  {

			return {
				series: series,
				cidLCS2: cidLCS,
				tidPlayoffs: tidPlayoffs,
				tidLCSChamp: tidLCSChamp,
				tidLCS: tidLCS,
				tidLCSPromotion: tidLCSPromotion,
				tidCS: tidCS,
				teamsConf5: teamsConf,
				tidLCS2R: tidLCS2R,
				tidLCSStay: tidLCSStay,
			}

		} else {
			return {
				series: series,
				cidLCS: cidLCS,
				tidPlayoffs: tidPlayoffs,
				tidLCSChamp: tidLCSChamp,
				tidLCS: tidLCS,
				tidLCSPromotion: tidLCSPromotion,
				tidCS: tidCS,
				teamsConf: teamsConf,
				tidLCS2R: tidLCS2R,
				tidLCSStay: tidLCSStay,
			}
		}


}


function genPlayoffSeriesNACS(
	teams: TeamFiltered[],
	cidCS,
	cidLadder,
	series,
	teamsConf,
	teamsConf2,
	teamsConf3,
	tidPlayoffs,
	tidLCSPromotion,
	tidPromotion,
	tidCSstay,
	tidDemotion,
	tidCSPromotion,
	tidLadder,
	conferenceNumber,
	) {
		var cid, topSeedDone, i;
		var tidCSPromotionTop;

		let adjustment;
		let adjustment1;
		let adjustment2;

		teamsConf2 = [];
		teamsConf3 = [];
			//	console.log(teamsConf);
		if (cidCS == 1) {
			adjustment = 0;
			adjustment1 = 0;
			adjustment2 = 0;
		} else {
			adjustment = 16 + conferenceNumber*7 - 7 - 2;
			adjustment1 = 13 + conferenceNumber*5 - 5 -2;
			adjustment2 = 11 + conferenceNumber*4 - 4 - 2;
		}
	   for (cid = cidCS; cid < cidCS+1; cid++) {
			for (i = 0; i < teams.length; i++) {
				if (teams[i].cid === cid) {
					teamsConf2.push(teams[i]);
					//tidPlayoffs.push(teams[i].tid);
				}
			}
			for (i = 0; i < teamsConf2.length; i++) {
//						if (i<(teamsConf2.length-2)) {
				if (i<4) {
					tidPlayoffs.push(teamsConf2[i].tid);
					tidPromotion.push(teamsConf2[i].tid);
					tidLCSPromotion.push(teamsConf2[i].tid);
				}
				if ( (i>=4) && (i<=(teamsConf2.length-3))) {
					tidCSstay.push(teamsConf2[i].tid);
				}
				if (i>(teamsConf2.length-3)) {
			//		tidPlayoffs.push(teams[i].tid);
					tidDemotion.push(teamsConf2[i].tid);
					if (topSeedDone	== false) {
						tidCSPromotionTop.push(teamsConf2[i].tid);
					} else {
						tidPlayoffs.push(teamsConf2[i].tid);
						tidCSPromotion.push(teamsConf2[i].tid);
					}
				}
			}

			if (cid > 2) {
				teamsConf = [];
				for (i = 0; i < teams.length; i++) {
					if (teams[i].cid === cid-1) {
						teamsConf.push(teams[i]);
					}
				}
			}
		///	console.log(teams);
		//	console.log(teamsConf2);
		//	console.log(adjustment);
		//	console.log(series);
		//	console.log(series[0][2]);
		//	console.log(series[0][2+ adjustment]);
			series[0][  2 + adjustment] = {home: teamsConf2[0], away: teamsConf2[3]};
			series[0][ 2 + adjustment].home.seed = 1+"CS";
			series[0][ 2 + adjustment].away.seed = 4+"CS";

			series[0][3  + adjustment] = {home: teamsConf2[1], away: teamsConf2[2]};
			series[0][ 3 + adjustment].home.seed = 2+"CS";
			series[0][ 3 + adjustment].away.seed = 3+"CS";


			series[2][2 + adjustment2] = {home: teamsConf[(teamsConf.length-2)],away: teamsConf[(teamsConf.length-2)] };
			series[2][2 + adjustment2].home.seed = (teamsConf.length-1)+"LCS";

			series[2][3 + adjustment2] = {home: teamsConf[(teamsConf.length-3)],away: teamsConf[(teamsConf.length-3)] };
			series[2][3 + adjustment2].home.seed = (teamsConf.length-2)+"LCS";
					//console.log(series);


		}

		for (cid = cidLadder; cid < cidLadder+1; cid++) {

			for (i = 0; i < teams.length; i++) {

				//	console.log("cid: "+teams[i].cid+" "+teams[i].cidNext);

			// need to user other cid variable:
				if (teams[i].cid === cid) {
				//	console.log(i+" "+teams[i].tid+" "+teams[i].cid+" "+cid);
					teamsConf3.push(teams[i]);

					if (teamsConf3.length<11) {
						tidPlayoffs.push(teams[i].tid);
						tidPromotion.push(teams[i].tid);
						tidCSPromotion.push(teams[i].tid);
					} else {
						tidLadder.push(teams[i].tid);
					}
				}
			}


		//	console.log(teamsConf2.length);
///			console.log(teamsConf3.length);
	///		console.log(series);
		//	console.log(teamsConf2);
	//		console.log(teamsConf3);
			series[2][4 + adjustment2] = {home: teamsConf2[(teamsConf2.length-2)],away: teamsConf2[(teamsConf2.length-2)] };
			series[2][4 + adjustment2].home.seed = (teamsConf2.length-1)+"CS";

			series[1][5 + adjustment1] = {home: teamsConf2[(teamsConf2.length-1)],away: teamsConf2[(teamsConf2.length-1)] };
			series[1][5 + adjustment1].home.seed = (teamsConf2.length)+"CS";

		//	console.log("figure out why team doesn't have a stats row");
		//	console.log(tidPlayoffs);
			//console.log(tidCSPromotion);
			//console.log(tidCSPromotion);
			//console.log(teamsConf2);
			//console.log(series[2][4 + adjustment2]);


		//	console.log(g.fullLadder);
			if (g.fullLadder ) {


				series[0][4 + adjustment] = {home: teamsConf3[1], away: teamsConf3[6]};
				series[0][4 + adjustment].home.seed = 2+"Ladder";
				series[0][4 + adjustment].away.seed = 7+"Ladder";


				series[0][5 + adjustment] = {home: teamsConf3[2], away: teamsConf3[5]};
				series[0][5 + adjustment].home.seed = 3+"Ladder";
				series[0][5 + adjustment].away.seed = 6+"Ladder";

				series[0][6 + adjustment] = {home: teamsConf3[8], away: teamsConf3[9]};
			//	console.log(series);
			//	console.log(adjustment);
			//	console.log(series[0][6 + adjustment]);

				series[0][6 + adjustment].home.seed = 9+"Ladder"; // breaks 170 team league
				series[0][6 + adjustment].away.seed = 10+"Ladder";

				series[0][7 + adjustment] = {home: teamsConf3[0], away: teamsConf3[7]};
				series[0][7 + adjustment].home.seed = 1+"Ladder";
				series[0][7 + adjustment].away.seed = 8+"Ladder";

				series[0][8 + adjustment] = {home: teamsConf3[3], away: teamsConf3[4]};
				series[0][8 + adjustment].home.seed = 4+"Ladder";
				series[0][8 + adjustment].away.seed = 5+"Ladder";

			} else {

				series[0][4 + adjustment] = {home: teamsConf3[1], away: teamsConf3[4]};
				series[0][4 + adjustment].home.seed = 2+"Ladder";
				series[0][4 + adjustment].away.seed = 5+"Ladder";


				series[0][5 + adjustment] = {home: teamsConf3[2], away: teamsConf3[3]};
				series[0][5 + adjustment].home.seed = 3+"Ladder";
				series[0][5 + adjustment].away.seed = 4+"Ladder";

				series[0][6 + adjustment] = {home: teamsConf3[0], away: teamsConf3[5]};
				series[0][6 + adjustment].home.seed = 1+"Ladder";
				series[0][6 + adjustment].away.seed = 6+"Ladder";

				//console.log(6+adjustment);
			/*	series[0][7] = {home: teamsConf3[0], away: teamsConf3[7]};
				series[0][7].home.seed = 1;
				series[0][7].away.seed = 8;

				series[0][8] = {home: teamsConf3[3], away: teamsConf3[4]};
				series[0][8].home.seed = 4;
				series[0][8].away.seed = 5;							*/

			}


		}

		return {
			series: series,
		//	cidCS: cidCS,
			cidLadder: cidLadder,
			series: series,
			teamsConf: teamsConf,
			teamsConf2: teamsConf2,
			teamsConf3: teamsConf3,
			tidPlayoffs: tidPlayoffs,
			tidLCSPromotion: tidLCSPromotion,
			tidPromotion: tidPromotion,
			tidCSstay: tidCSstay,
			tidDemotion: tidDemotion,
			tidCSPromotion: tidCSPromotion,
			tidLadder: tidLadder,
			tidCSPromotionTop: tidCSPromotionTop,
		}

}

function genPlayoffSeriesLCK(
	teams: TeamFiltered[],
	cidLCK,
	series,
	tidPlayoffs,
	teamsConf,
	tidRegionals,
	tidLCK,

	) {
		var cid,  i;

		if ((g.gameType == 2) ) {
			for (i = 0; i < teams.length; i++) {
					teamsConf.push(teams[i]);
					if (teamsConf.length<6) {
						tidPlayoffs.push(teams[i].tid);
					}
			}
		}
		if ((g.gameType >= 5) ) {
				//		console.log(teams);
			for (cid = cidLCK; cid < cidLCK+1; cid++) {
				teamsConf = [];
				for (i = 0; i < teams.length; i++) {
			//	console.log(teams[i]);
						if (teams[i].cid === cid) {
							teamsConf.push(teams[i]);
							if (teamsConf.length<6 || teams[i].pointsYear > 0 ) {
								tidPlayoffs.push(teams[i].tid);
								if (teamsConf.length<6 && g.yearType != 2019)  {
									tidLCK.push(teams[i].tid);
								}
							}
							if (teamsConf.length == 6) {
								tidRegionals.push(teams[i].tid);
								tidPlayoffs.push(teams[i].tid);
								//tidLCKStay.push(teamsConf[i].tid);
							}

							// this should only really be 7, but 8 in case an error occurs?
							if (g.gameType >= 6 && teamsConf.length == 7 || teamsConf.length == 8) {
								tidRegionals.push(teams[i].tid);
								tidPlayoffs.push(teams[i].tid);
							//	tidLCKStay.push(teamsConf[i].tid);
							}
						}
				}
			}
		}


		series[0][ 9 ] = {home: teamsConf[3], away: teamsConf[4]};
		series[0][ 9 ].home.seed = 4;
		series[0][ 9 ].away.seed = 5;

		series[1][7] = {home: teamsConf[2],away: teamsConf[2] };
		series[1][7].home.seed = 3;
												//	console.log("here");
		series[2][6] = {home: teamsConf[1],away: teamsConf[1] };
		series[2][6].home.seed = 2;

		series[3][1] = {home: teamsConf[0],away: teamsConf[0] };
		series[3][1].home.seed = 1;

		if  (g.gameType >= 5 && g.seasonSplit == "Summer") {
			series[6][4] = {home: teamsConf[5],away: teamsConf[5] };
			series[6][4].home.seed = 6;
			series[6][4].away.seed = 6;
			//console.log(series[6][4]);
		}

		return {
			series: series,
			cidLCK: cidLCK,
			tidPlayoffs: tidPlayoffs,
			teamsConf:  teamsConf,
			tidRegionals: tidRegionals,
			tidLCK: tidLCK,
		}

}

function genPlayoffSeriesLPL(
	teams: TeamFiltered[],
	cidLPL,
	series,
	tidPlayoffs,
	teamsConf3,
	tidLPL,

	) {
		var cid,  i;
	//console.log(g.yearType);

		var teamsConf3
		// same for default and 2019
		if ((g.gameType == 3) ) {
			teamsConf3 = [];
			for (i = 0; i < teams.length; i++) {
					teamsConf3.push(teams[i]);
					if (teamsConf3.length<9) {
						tidPlayoffs.push(teams[i].tid);

					}
			}
		}
		if ((g.gameType >= 5) ) {
			for (cid = cidLPL; cid < cidLPL+1; cid++) {
				teamsConf3 = [];

				for (i = 0; i < teams.length; i++) {
			//	console.log(teams[i]);
						if (teams[i].cid === cid) {
							teamsConf3.push(teams[i]);
							if (teamsConf3.length<9 || teams[i].pointsYear > 0 ) {
								tidPlayoffs.push(teams[i].tid);
								if (teamsConf3.length<9 && g.yearType != 2019) {
									tidLPL.push(teams[i].tid);
								}
							}

						}
				}
			}
		}

		if (g.yearType == 2019) {
			//console.log(teamsConf3);
			series[0][ 51 ] = {home: teamsConf3[4], away: teamsConf3[7]};
		//	console.log(series);
			series[0][ 51 ].home.seed = 5;
			series[0][ 51 ].away.seed = 8;

			series[0][ 52 ] = {home: teamsConf3[5], away: teamsConf3[6]};
		//	console.log(series);
			series[0][ 52 ].home.seed = 6;
			series[0][ 52 ].away.seed = 7;


			series[1][38] = {home: teamsConf3[3],away: teamsConf3[3] };
			series[1][38].home.seed = 4;

			series[1][39] = {home: teamsConf3[2],away: teamsConf3[2] };
			series[1][39].home.seed = 3;

			series[2][31] = {home: teamsConf3[0],away: teamsConf3[0] };
			series[2][31].home.seed = 1;

			series[2][32] = {home: teamsConf3[1],away: teamsConf3[1] };
			series[2][32].home.seed = 2;

		} else {
		//console.log(teamsConf3);
		series[0][ 10 ] = {home: teamsConf3[6], away: teamsConf3[7]};
	//	console.log(series);
		series[0][ 10 ].home.seed = 7;
		series[0][ 10 ].away.seed = 8;

		series[1][8] = {home: teamsConf3[5],away: teamsConf3[5] };
		series[1][8].home.seed = 6;

		series[2][7] = {home: teamsConf3[4],away: teamsConf3[4] };
		series[2][7].home.seed = 5;

		series[3][2] = {home: teamsConf3[3],away: teamsConf3[3] };
		series[3][2].home.seed = 4;

		series[3][3] = {home: teamsConf3[2],away: teamsConf3[2] };
		series[3][3].home.seed = 3;

		series[4][0] = {home: teamsConf3[1],away: teamsConf3[1] };
		series[4][0].home.seed = 2;

		series[4][1] = {home: teamsConf3[0],away: teamsConf3[0] };
		series[4][1].home.seed = 1;
		}

		return {
			series: series,
			cidLPL: cidLPL,
			tidPlayoffs: tidPlayoffs,
			teamsConf3:  teamsConf3,
			tidLPL:  tidLPL,
		}

}

function genPlayoffSeriesLMS(
	teams: TeamFiltered[],
	cidLMS,
	series,
	tidPlayoffs,
	tidRegionals,
	teamsConf4,
	tidLMS,
	) {
		var cid,  i;


		if ((g.gameType == 4) ) {
			teamsConf4 = [];
			for (i = 0; i < teams.length; i++) {
					teamsConf4.push(teams[i]);
					if (teamsConf4.length<5) {
						tidPlayoffs.push(teams[i].tid);
					}
			}
		}
		if ((g.gameType >= 5) ) {
			for (cid = cidLMS; cid < cidLMS+1; cid++) {
				teamsConf4 = [];

				for (i = 0; i < teams.length; i++) {
					//			console.log(teams[i]);
					if (teams[i].cid === cid) {
						teamsConf4.push(teams[i]);
						if (teamsConf4.length<5  || teams[i].pointsYear > 0 ) {
							tidPlayoffs.push(teams[i].tid);
							if (teamsConf4.length<5) {
								if (g.yearType != 2019) {
									tidLMS.push(teams[i].tid);
								}
							}
						}
						if ((teamsConf4.length == 5) || (teamsConf4.length == 6)) {
							tidRegionals.push(teams[i].tid);
							//tidLMSStay.push(teamsConf[i].tid);

						}
					}
				}
			}
		}

		series[0][ 11 ] = {home: teamsConf4[2], away: teamsConf4[3]};
		series[0][ 11 ].home.seed = 3;
		series[0][ 11 ].away.seed = 4;

		series[1][9] = {home: teamsConf4[1],away: teamsConf4[1] };
		series[1][9].home.seed = 2;

		series[2][8] = {home: teamsConf4[0],away: teamsConf4[0] };
		series[2][8].home.seed = 1;

		return {
			series: series,
			cidLMS: cidLMS,
			tidPlayoffs: tidPlayoffs,
			tidRegionals: tidRegionals,
			teamsConf4:  teamsConf4,
			tidLMS: tidLMS,
		}

}

function genPlayoffSeriesWC(
	teams: TeamFiltered[],
	cidWC,
	series,
	tidPlayoffs,
	teamsConf,
	) {
		var cid,  i;


		for (cid = cidWC; cid < cidWC+1; cid++) {
			teamsConf = [];

			for (i = 0; i < teams.length; i++) {
				//console.log(teamsConf[i]);
				if (teams[i].cid === cid) {
					if (teams[i].cid === cid) {
						teamsConf.push(teams[i]);
						//tidPlayoffs.push(teams[i].tid);
						if (teamsConf.length<5) {
							tidPlayoffs.push(teams[i].tid);
						}
					}
				}
			}

			series[0][ 14 ] = {home: teamsConf[1], away: teamsConf[2]};
			series[0][ 14 ].home.seed = 2;
			series[0][ 14 ].away.seed = 3;

			series[0][15 ] = {home: teamsConf[0], away: teamsConf[3]};
			series[0][15 ].home.seed = 1;
			series[0][15 ].away.seed = 4;

		}


		return {
			cidWC: cidWC,
			series: series,
			tidPlayoffs: tidPlayoffs,
			teamsConf:  teamsConf,
		}

}

function genPlayoffSeriesOld(teams: TeamFiltered[]) {

	//console.log("got here");
		    var cid, i,  teamsConf,teamsConf2,teamsConf3,teamsConf4,teamsConf5,teamsConf6;
			var tidPlayoffs;
			var series;
			var topSeedDone;

		//	console.log(g.yearType);
		//	console.log(g.gameType);
			//const series = _.range(g.numPlayoffRounds).map(() => []);
			//series = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];  // First round, second round, third round, fourth round
			series = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
			tidPlayoffs = [];

			teamsConf = [];
			teamsConf2 = [];
			teamsConf3 = [];
			teamsConf4 = [];
			teamsConf5 = [];
			teamsConf6 = [];


			var tidPromotion,tidDemotion,tidRegionals;

			var tidLCSChamp,tidLCS,tidLCSPromotion,tidCS,tidCSPromotion,tidCSPromotionTop,tidLadder,tidCSstay;
			var tidLCS2R, tidLCSEU, tidLCS2REU, tidLCSStay, tidLCSStayEU;
			var tidLCK,tidLPL,tidLMS;
			var tidWC;

            tidPromotion = [];
            tidDemotion = [];

            tidRegionals = [];

            tidLCSChamp = [];
            tidLCS = [];
            tidLCSEU = [];

            tidLCSPromotion = [];
            tidCSstay = [];
            tidCS = [];
            tidCSPromotion = [];
            tidLadder = [];
			tidCSPromotionTop = [];
			tidLCS2R = [];
			tidLCS2REU = [];

            tidLCSStay = [];
            tidLCSStayEU = [];

			tidLCK = [];
			tidLMS = [];
			tidLPL = [];

			tidWC = [];

			var genResults;
			var cidLCS, cidCS, cidLadder, cidLCK, cidLPL, cidLMS, cidLCS2, cidWC;
			//console.log(series);

			if ((g.gameType == 0) || (g.gameType == 1) || (g.gameType >= 5)) {

				if ((g.gameType == 0) || (g.gameType == 1) || (g.gameType >= 5)) {
					cidLCS = 0;
				} else if (g.gameType == 6)  {
					cidLCS = 0;
				} else {
					cidLCS = 0;
				}
			var test;
			test = series;
		////	console.log(series);
		//	console.log(test);
				genResults = genPlayoffSeriesNALCS(
					teams,
					cidLCS,
					series,
					tidPlayoffs,
					tidLCSChamp,
					tidLCS,
					tidLCSPromotion,
					tidCS,
					teamsConf,
					tidLCS2R,
					tidLCSStay
					);

				cidLCS = genResults.cidLCS;
				series = genResults.series;
				tidPlayoffs = genResults.tidPlayoffs;
				tidLCSChamp = genResults.tidLCSChamp;
				tidLCS = genResults.tidLCS;
				tidLCSPromotion = genResults.tidLCSPromotion;
				tidCS  = genResults.tidCS;
				teamsConf = genResults.teamsConf;
				tidLCS2R = genResults.tidLCS2R;
				tidLCSStay	= genResults.tidLCSStay;
		//	console.log(genResults);
		//	console.log(series);
			}
			if ((g.gameType == 1) || (g.gameType == 7))  {
				let numberLadders;
				if (g.gameType == 7) {
					numberLadders = 6;
				} else {
					numberLadders = 1;
				}

				for (i = 0; i < numberLadders; i++) {

					if ((g.gameType == 0) || (g.gameType == 1)) {
						cidCS = 1;
						cidLadder = 2;
					} else if (g.gameType == 7)  {
						cidCS = 1+i*3;
						cidLadder = 2+i*3;
					} else {
						cidCS = 1;
						cidLadder = 2;
					}
					// update genPlayoffSeriesNACS so it can handle the new promotions
					genResults = genPlayoffSeriesNACS(
						teams,
						cidCS,
						cidLadder,
						series,
						teamsConf,
						teamsConf2,
						teamsConf3,
						tidPlayoffs,
						tidLCSPromotion,
						tidPromotion,
						tidCSstay,
						tidDemotion,
						tidCSPromotion,
						tidLadder,
						i,
						);

						series = genResults.series;
						//cidCS = genResults.cidCS;
						cidLadder = genResults.cidLadder;
						teamsConf = genResults.teamsConf;
						teamsConf2 = genResults.teamsConf2;
						teamsConf3 = genResults.teamsConf3;
						tidPlayoffs = genResults.tidPlayoffs;
						tidLCSPromotion = genResults.tidLCSPromotion;
						tidPromotion = genResults.tidPromotion;
						tidCSstay = genResults.tidCSstay;
						tidDemotion = genResults.tidDemotion;
						tidCSPromotion = genResults.tidCSPromotion;
						tidLadder = genResults.tidLadder;
				}
			}

			if ((g.gameType == 2)  || (g.gameType >= 5)) {

				if (g.gameType == 2)  {
					cidLCK = 0;
				} else if (g.gameType == 5 || g.gameType == 6) {
					cidLCK = 2;
				} else if (g.gameType == 7)  {
					cidLCK = 6;
				} else {
					cidLCK = 2;
				}


				genResults = genPlayoffSeriesLCK(
					teams,
					cidLCK,
					series,
					tidPlayoffs,
					teamsConf,
					tidRegionals,
					tidLCK,
					);

				series = genResults.series;
				cidLCK = genResults.cidLCK;
				tidPlayoffs = genResults.tidPlayoffs;
				teamsConf = genResults.teamsConf;
				tidRegionals = genResults.tidRegionals;
				tidLCK = genResults.tidLCK;
			//console.log(series);
			}

			if ((g.gameType == 3)  || (g.gameType >= 5)) {

				if (g.gameType == 3)  {
					cidLPL = 0;
				} else if (g.gameType == 5 || g.gameType == 6 ) {
					cidLPL = 3;
				} else if (g.gameType == 7)  {
					cidLPL = 9;
				} else {
					cidLPL = 3;
				}

				genResults = genPlayoffSeriesLPL(
					teams,
					cidLPL,
					series,
					tidPlayoffs,
					teamsConf3,
					tidLPL,
					);

				series = genResults.series;
				cidLPL = genResults.cidLPL;
				tidPlayoffs = genResults.tidPlayoffs;
				teamsConf3 = genResults.teamsConf3;
				tidLPL = genResults.tidLPL;
		//	console.log(series);
			}
			//console.log(JSON.parse(JSON.stringify(series)));
			if ((g.gameType == 4)  || (g.gameType >= 5)) {


				if (g.gameType == 4)  {
					cidLMS = 0;
				} else if (g.gameType == 5 || g.gameType == 6) {
					cidLMS = 4;
				} else if (g.gameType == 7)  {
					cidLMS = 12;
				} else {
					cidLMS = 4;
				}

				genResults = genPlayoffSeriesLMS(
					teams,
					cidLMS,
					series,
					tidPlayoffs,
					tidRegionals,
					teamsConf4,
					tidLMS,
					);

				series = genResults.series;
				cidLMS = genResults.cidLMS;
				tidPlayoffs = genResults.tidPlayoffs;
				tidRegionals = genResults.tidRegionals;
				teamsConf4 = genResults.teamsConf4;
				tidLMS = genResults.tidLMS;
			//console.log(series);
			}
			//console.log(JSON.parse(JSON.stringify(series)));
			if (g.gameType >= 5) {

				// EU LCS for Worlds
				if (g.gameType == 5 || g.gameType == 6) {
					cidLCS2 = 1;
				} else if (g.gameType == 7)  {
					cidLCS2 = 3;
				}

				genResults = genPlayoffSeriesNALCS(
					teams,
					cidLCS2,
					series,
					tidPlayoffs,
					tidLCSChamp,
					tidLCSEU,
					tidLCSPromotion,
					tidCS,
					teamsConf5,
					tidLCS2REU,
					tidLCSStayEU,
					);

				cidLCS2 = genResults.cidLCS;  // Since used by other conferences
				series = genResults.series;
				tidPlayoffs = genResults.tidPlayoffs;
				tidLCSChamp = genResults.tidLCSChamp;
				tidLCSEU = genResults.tidLCS;
				tidLCSPromotion = genResults.tidLCSPromotion;
				tidCS  = genResults.tidCS;
				teamsConf5 = genResults.teamsConf; // Since used by other conferences
				tidLCS2REU = genResults.tidLCS2R; // Since used by other conferences
				tidLCSStayEU = genResults.tidLCSStay

			//console.log(series);
					// Wild Card for Worlds
					// Not for MSI, using regular season results
			}

				//	console.log(JSON.parse(JSON.stringify(series)));
			if  ((g.gameType == 5 && g.yearType != "2019") ||  ((g.gameType >= 6) && (g.seasonSplit == "Summer")) )  {

				if  (g.gameType == 5 || g.gameType == 6)  {
					cidWC = 5;
				} else if  ((g.gameType == 7) && (g.seasonSplit == "Summer"))   {
					cidWC = 15;
				}

				let tidsUsed;
				if (g.gameType <=6 ) {
					tidsUsed = tidPlayoffs;
				} else {
					tidsUsed = tidWC;
				}

				genResults = genPlayoffSeriesWC(
					teams,
					cidWC,
					series,
					tidPlayoffs,
					teamsConf,
					);

				cidWC = genResults.cidWC;
				series = genResults.series;
				if (g.gameType <=6 ) {
					tidPlayoffs = genResults.tidPlayoffs;
				} else {
					tidWC = genResults.tidPlayoffs;
				}

				teamsConf = genResults.teamsConf;
			//console.log(series);
			}
				//	console.log(JSON.parse(JSON.stringify(series)));

/*	var teamsConf3
		// same for default and 2019
		if ((g.gameType == 3) ) {
			teamsConf3 = [];
			for (i = 0; i < teams.length; i++) {
					teamsConf3.push(teams[i]);
					if (teamsConf3.length<9) {
						tidPlayoffs.push(teams[i].tid);

					}
			}
		}	*/

		//series[0][ 11 ] = {home: teamsConf4[2], away: teamsConf4[3]};
		//series[0][ 11 ].home.seed = 3;
		//series[0][ 11 ].away.seed = 4;

		//series[1][9] = {home: teamsConf4[1],away: teamsConf4[1] };
		//series[1][9].home.seed = 2;

		//series[2][8] = {home: teamsConf4[0],away: teamsConf4[0] };
		//series[2][8].home.seed = 1;
		////	console.log(g.gameType);
		//	console.log(g.yearType);
				//	console.log(JSON.parse(JSON.stringify(series)));
			if (g.gameType == 5 && g.yearType == 2019) {
				// vietnam
				// 2, 1b, 1bb

				// 0 16
				// 1 13
				// 2 11

			let teamsVietnam = [];
//console.log(teams);
			for (i = 0; i < teams.length; i++) {
					if (teams[i].cid == 5) {
						teamsVietnam.push(teams[i]);
//	console.log(teamsVietnam);
//	console.log(teamsVietnam.length);

						if (teamsVietnam.length <= 4) {
							//console.log(teams[i].tid);
							tidPlayoffs.push(teams[i].tid);
	//console.log(tidPlayoffs);
						}
					}
			}
///	console.log(teamsVietnam);
//	console.log(tidPlayoffs);
		series[0][ 53 ] = {home: teamsVietnam[2], away: teamsVietnam[3]};
		series[0][ 53 ].home.seed = 3;
		series[0][ 53 ].away.seed = 4;

		series[1][40] = {home: teamsVietnam[1],away: teamsVietnam[1] };
		series[1][40].home.seed = 2;

		series[2][33] = {home: teamsVietnam[0],away: teamsVietnam[0] };
		series[2][33].home.seed = 1;
						// same as LMS

				//Sea
				// 2 no reseed 1b finals
				// 2 no reseed 1b

				// 0 17,18
				// 1 14,15
				// 2 12

			let teamsSEA = [];
//console.log(teams);
			for (i = 0; i < teams.length; i++) {
					if (teams[i].cid == 6) {
						teamsSEA.push(teams[i]);
						if (teamsSEA.length<=6) {
							tidPlayoffs.push(teams[i].tid);

						}
					}
			}
	//console.log(teamsSEA);
	//console.log(tidPlayoffs);
		series[0][ 54 ] = {home: teamsSEA[2], away: teamsSEA[5]};
		series[0][ 54 ].home.seed = 3;
		series[0][ 54 ].away.seed = 6;

		series[0][ 55 ] = {home: teamsSEA[3], away: teamsSEA[4]};
		series[0][ 55].home.seed = 4;
		series[0][ 55 ].away.seed = 5;

		series[1][41] = {home: teamsSEA[1],away: teamsSEA[1] };
		series[1][41].home.seed = 2;

		series[1][42] = {home: teamsSEA[0],away: teamsSEA[0] };
		series[1][42].home.seed = 1;


				//Brazil
				//2 finals
				//2

				// 0 19,20
				// 1 16
				// FINish BRAZIL
			let teamsBrazil = [];
//console.log(teams);
			for (i = 0; i < teams.length; i++) {
					if (teams[i].cid == 7) {
						teamsBrazil.push(teams[i]);
	//console.log(teamsBrazil);
	///console.log(teamsBrazil.length);
						if (teamsBrazil.length <= 4) {
							tidPlayoffs.push(teams[i].tid);
	//console.log(tidPlayoffs);
						}
					}
			}
	//console.log(teamsBrazil);
	//console.log(tidPlayoffs);
		series[0][ 56 ] = {home: teamsBrazil[0], away: teamsBrazil[3]};
		series[0][ 56 ].home.seed = 1;
		series[0][ 56 ].away.seed = 4;

		series[0][ 57 ] = {home: teamsBrazil[1], away: teamsBrazil[2]};
		series[0][ 57 ].home.seed = 2;
		series[0][ 57 ].away.seed = 3;



				//CIs
				//2 finals
				//2

				//0, 21, 22
				//1, 17

	let teamsCIS = [];
//console.log(teams);
			for (i = 0; i < teams.length; i++) {
					if (teams[i].cid == 8) {
						teamsCIS.push(teams[i]);
	//console.log(teamsCIS);
	//console.log(teamsCIS.length);
						if (teamsCIS.length <= 4) {
							tidPlayoffs.push(teams[i].tid);
	//console.log(tidPlayoffs);
						}
					}
			}
	//console.log(teamsCIS);
	//console.log(tidPlayoffs);
		series[0][ 58 ] = {home: teamsCIS[0], away: teamsCIS[3]};
		series[0][ 58 ].home.seed = 1;
		series[0][ 58 ].away.seed = 4;

		series[0][ 59 ] = {home: teamsCIS[1], away: teamsCIS[2]};
		series[0][ 59 ].home.seed = 2;
		series[0][ 59 ].away.seed = 3;


				//Japan
				//2 1b

				//0, 23
				//1, 18
				//2, 13

	let teamsJapan = [];
//console.log(teams);
			for (i = 0; i < teams.length; i++) {
					if (teams[i].cid == 9) {
						teamsJapan.push(teams[i]);
						if (teamsJapan.length<4) {
							tidPlayoffs.push(teams[i].tid);

						}
					}
			}
	//console.log(teamsJapan);
	//console.log(tidPlayoffs);
		series[0][ 60 ] = {home: teamsJapan[1], away: teamsJapan[2]};
		series[0][ 60 ].home.seed = 2;
		series[0][ 60 ].away.seed = 3;

		series[1][43] = {home: teamsJapan[0],away: teamsJapan[0] };
		series[1][43].home.seed = 1;

				//LA
				// 2 reseed 1b finals
				// 2 reseed 1b

				//0, 24,25
				//1, 19,20
				//2, 14

			let teamsLA = [];
//console.log(teams);
			for (i = 0; i < teams.length; i++) {
					if (teams[i].cid == 10 ) {
						teamsLA.push(teams[i]);
						if (teamsLA.length<=6) {
							tidPlayoffs.push(teams[i].tid);

						}
					}
			}
	//console.log(teamsLA);
	//console.log(tidPlayoffs);
		series[0][ 61 ] = {home: teamsLA[2], away: teamsLA[5]};
		series[0][ 61 ].home.seed = 3;
		series[0][ 61 ].away.seed = 6;

		series[0][ 62 ] = {home: teamsLA[3], away: teamsLA[4]};
		series[0][ 62 ].home.seed = 4;
		series[0][ 62 ].away.seed = 5;

		series[1][45] = {home: teamsLA[1],away: teamsLA[1] };
		series[1][45].home.seed = 2;

		series[1][44] = {home: teamsLA[0],away: teamsLA[0] };
		series[1][44].home.seed = 1;

				//Oceanic
				//2 1b 1bb 1bbb

				//0 26
				//1 21
				//2 15
				//3 4
			let teamsOCE = [];
//console.log(teams);
			for (i = 0; i < teams.length; i++) {
					if (teams[i].cid == 11) {
						teamsOCE.push(teams[i]);
						if (teamsOCE.length<6) {
							tidPlayoffs.push(teams[i].tid);

						}
					}
			}
	//console.log(teamsOCE);
	//console.log(tidPlayoffs);
		series[0][ 63 ] = {home: teamsOCE[3], away: teamsOCE[4]};
		series[0][ 63 ].home.seed = 4;
		series[0][ 63 ].away.seed = 5;

		series[1][46] = {home: teamsOCE[2],away: teamsOCE[2] };
		series[1][46].home.seed = 3;

		series[2][34] = {home: teamsOCE[1],away: teamsOCE[1] };
		series[2][34].home.seed = 2;

		series[3][11] = {home: teamsOCE[0],away: teamsOCE[0] };
		series[3][11].home.seed = 1;

				//Turkey
				// 2 reseed 1b finals
				// 2 reseed 1b

				//0 27,28
				//1 22, 23
				//2 16

		let teamsTurkey = [];
//console.log(teams);
			for (i = 0; i < teams.length; i++) {
					if (teams[i].cid == 12 ) {
						teamsTurkey.push(teams[i]);
						if (teamsTurkey.length<=6) {

							tidPlayoffs.push(teams[i].tid);

						}
					}
			}
	//console.log(teamsTurkey);
	//console.log(tidPlayoffs);
		series[0][ 64 ] = {home: teamsTurkey[2], away: teamsTurkey[5]};
		series[0][ 64 ].home.seed = 3;
		series[0][ 64 ].away.seed = 6;

		series[0][ 65 ] = {home: teamsTurkey[3], away: teamsTurkey[4]};
		series[0][ 65 ].home.seed = 4;
		series[0][ 65 ].away.seed = 5;

		series[1][48] = {home: teamsTurkey[1],away: teamsTurkey[1] };
		series[1][48].home.seed = 2;

		series[1][47] = {home: teamsTurkey[0],away: teamsTurkey[0] };
		series[1][47].home.seed = 1;

			}
					//console.log(series);

			// Worlds Spring MSI

			// skip initial groups stage, since already have top teams form region
			// take top two from WC regular season, pair with top NA and top LMS
			// winners make it
			// then losers play, winner of that match makes it


			// Need to push this back into later rounds
			////////////////////////////////!!!!!!!!!!!!!!!!!111111111
			if (g.gameType >= 6 && (g.seasonSplit == "Spring")) {
				var cidType;
				if (g.gameType == 6) {
					cidType = 5;
				} else {
					cidType = 15;
				}

//				for (cid = 15; cid < 16; cid++) {
				for (cid = cidType; cid < cidType+1; cid++) {
					teamsConf = [];

					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
						//	if (teams[i].cid === cid) {
								//teamsConf.push(teams[i]);
								if (teamsConf.length<2) {
									tidPlayoffs.push(teams[i].tid);
									teamsConf.push(teams[i]);
								}
						//	}
						}
					}
				}
				// randomly let NA and LMS teams switch 1 and 2 seeds
			//	console.log(teamsConf);
				//if (Math.random() < .5) {
					series[6][ 8 ] = {home:  teamsConf[0], away: teamsConf[0]};
					series[6][9 ] = {home: teamsConf[1], away: teamsConf[1]};
					series[6][8 ].home.placement = "WC1";
					series[6][8 ].away.placement = "WC1";
					series[6][9 ].home.placement = "WC2";
					series[6][9 ].away.placement = "WC2";
			//		console.log(series);
				/*} else {
					series[6][ 8 ] = {home: teamsConf[0], away: teamsConf[2]};
					series[6][9 ] = {home: teamsConf[1], away: teamsConf[3]};
					series[6][8 ].home.placement = "NA1";
					series[6][8 ].away.placement = "WC1";
					series[6][9 ].home.placement = "LMS1";
					series[6][9 ].away.placement = "WC2";
				}*/

			//	series[6][ 8 ].home.seed = 2;
				//series[6][ 8 ].away.seed = 3;


				//series[6][9 ].home.seed = 1;
				//series[6][9 ].away.seed = 4;

			}
		/*	if (g.gameType == 6 && (g.seasonSplit == "Spring")) {
			// top from each of NA 0 and LMS 12
			// top two from Wild Card Conference: 15

				genResults = genPlayoffSeriesMSI(
					teams,
					series,
					);


				series = genResults.series;
				tidPlayoffs = genResults.tidPlayoffs;
				tidPromotion = genResults.tidPromotion;
				tidDemotion = genResults.tidDemotion;
				tidRegionals = genResults.tidRegionals;
				tidLCSChamp = genResults.tidLCSChamp;
				tidLCS = genResults.tidLCS;
				tidLCSPromotion = genResults.tidLCSPromotion;
				tidCSstay = genResults.tidCSstay;
				tidCS = genResults.tidCS;
				tidCSPromotion = genResults.tidCSPromotion;
				tidLadder = genResults.tidLadder;
				tidCSPromotionTop = genResults.tidCSPromotionTop;
		//	console.log(series);
			}*/
//console.log(series);
			//		console.log(tidPlayoffs);
    return {
		series: series,
		tidPlayoffs: tidPlayoffs,
		tidPromotion: tidPromotion,
		tidDemotion: tidDemotion,
		tidRegionals: tidRegionals,
		tidLCSChamp: tidLCSChamp,
		tidLCS: tidLCS,
		tidLCSPromotion: tidLCSPromotion,
		tidCSstay: tidCSstay,
		tidCS: tidCS,
		tidCSPromotion: tidCSPromotion,
		tidLadder: tidLadder,
		tidCSPromotionTop: tidCSPromotionTop,
		tidLCS2R: tidLCS2R,
		tidLCS2REU: tidLCS2REU,
		tidLCSEU: tidLCSEU,
		tidLCSStay: tidLCSStay,
		tidLCSStayEU: tidLCSStayEU,
		tidLCK: tidLCK,
		tidLPL: tidLPL,
		tidLMS: tidLMS,
		tidWC: tidWC,
		/*series: genResults.series,
		tidPlayoffs: genResults.tidPlayoffs,
		tidPromotion: genResults.tidPromotion,
		tidDemotion: genResults.tidDemotion,
		tidRegionals: genResults.tidRegionals,
		tidLCSChamp: genResults.tidLCSChamp,
		tidLCS: genResults.tidLCS,
		tidLCSPromotion: genResults.tidLCSPromotion,
		tidCSstay: genResults.tidCSstay,
		tidCS: genResults.tidCS,
		tidCSPromotion: genResults.tidCSPromotion,
		tidLadder: genResults.tidLadder,
		tidCSPromotionTop: genResults.tidCSPromotionTop,*/
	};

   /* return {
		series,
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
	};*/
}

function randomWithFilter(group,pool) {

  let randomInt = random.randInt(0, pool.length-1);
  let conference2 = pool[randomInt].placement;
  let conference1 = group[0].placement;
  let conference1clean =   conference1.substr(0, conference1.length-1);
  let conference2clean =   conference2.substr(0, conference2.length-1);

  while (conference1clean == conference2clean) {
    randomInt = random.randInt(0, pool.length-1);
    conference2 = pool[randomInt].placement;
    conference2clean =   conference2.substr(0, conference2.length-1);
  }
  return randomInt;
}

  function randomWithFilter2(group,pool,loops) {

    let randomInt = random.randInt(0, pool.length-1);
    if (loops == 2 || loops == 1) {
      randomInt = 0;
    }
    let conference2 = pool[randomInt].placement;
    let conference1 = group[1].placement;
    let conference0 = group[0].placement;
    let conference0clean =   conference0.substr(0, conference0.length-1);
    let conference1clean =   conference1.substr(0, conference1.length-1);
    let conference2clean =   conference2.substr(0, conference2.length-1);

    if (loops == 2) {
      if (conference1clean == conference2clean || conference0clean == conference2clean) {
        randomInt = 1;
        conference2 = pool[randomInt].placement;
        conference2clean =   conference2.substr(0, conference2.length-1);
        if (conference1clean == conference2clean || conference0clean == conference2clean) {
            randomInt = 100;
        }
      }
    } else if (loops == 1) {
        if (conference1clean == conference2clean || conference0clean == conference2clean) {
              randomInt = 100;
        }
    } else {
      while (conference1clean == conference2clean || conference0clean == conference2clean) {
        randomInt = random.randInt(0, pool.length-1);
        conference2 = pool[randomInt].placement;
        conference2clean =   conference2.substr(0, conference2.length-1);
      }
    }
		return randomInt;
  }

  function randomWithFilter3(group,pool,loops) {

    // do major conferences first, since wild cards are solo

//    let randomInt = random.randInt(0, pool.length-1);
    let randomInt;
    if (loops == 3 || loops == 2 || loops == 1) {
      randomInt = 0;
    } else {
      let conferenceTest1 = pool[0].placement;
      let conferenceTest2 = pool[1].placement;
      let conferenceTest3 = pool[2].placement;
      let conferenceTest4 = pool[3].placement;
      let conference0clean =   conferenceTest1.substr(0, conferenceTest1.length-1);
      let conference1clean =   conferenceTest2.substr(0, conferenceTest2.length-1);
      let conference2clean =   conferenceTest3.substr(0, conferenceTest3.length-1);
      let conference3clean =   conferenceTest4.substr(0, conferenceTest4.length-1);
      if (conference0clean == "LCK" || conference0clean == "LMS" ) {
        randomInt = 0;
      } else if (conference1clean == "LCK" || conference1clean == "LMS" ) {
        randomInt = 1;
      } else if (conference2clean == "LCK" || conference2clean == "LMS" ) {
        randomInt = 2;
      } else  {
        randomInt = 3;
      }
    }
    let conference3 = pool[randomInt].placement;
    let conference2 = group[2].placement;
    let conference1 = group[1].placement;
    let conference0 = group[0].placement;
    let conference0clean =   conference0.substr(0, conference0.length-1);
    let conference1clean =   conference1.substr(0, conference1.length-1);
    let conference2clean =   conference2.substr(0, conference2.length-1);
    let conference3clean =   conference3.substr(0, conference3.length-1);

    if (loops == 3) {
      if (conference1clean == conference2clean || conference0clean == conference2clean) {
        randomInt = 1;
        conference3 = pool[randomInt].placement;
        conference3clean =   conference3.substr(0, conference3.length-1);
        if (conference1clean == conference3clean || conference0clean == conference3clean || conference2clean == conference3clean) {
          randomInt = 2;
          conference3 = pool[randomInt].placement;
          conference3clean =   conference3.substr(0, conference3.length-1);

          if (conference1clean == conference3clean || conference0clean == conference3clean || conference2clean == conference3clean) {
              randomInt = 100;
          }
        }
      }
    } else if (loops == 2) {
      if (conference1clean == conference2clean || conference0clean == conference2clean) {
        randomInt = 1;
        conference3 = pool[randomInt].placement;
        conference3clean =   conference3.substr(0, conference3.length-1);
        if (conference1clean == conference3clean || conference0clean == conference3clean || conference2clean == conference3clean) {
            randomInt = 100;
        }
      }
    } else if (loops == 1) {
        if (conference1clean == conference3clean || conference0clean == conference3clean || conference2clean == conference3clean) {
              randomInt = 100;
        }
    } else {
      while (conference1clean == conference3clean || conference0clean == conference3clean || conference2clean == conference3clean) {
        randomInt = random.randInt(0, pool.length-1);
        conference3 = pool[randomInt].placement;
        conference3clean =   conference3.substr(0, conference3.length-1);
      }
    }
		return randomInt;
  }


export default {
    doAwards,
	doAwardsMSI,
    updateOwnerMood,
    getSchedule,
    setSchedule,
    newSchedule,
    newSchedulePlayoffsDay,
	seriesStartEnd,
    getDaysLeftSchedule,
    genPlayoffSeries,
    genPlayoffSeriesMSI,
//	genPlayoffSeriesWorlds,
	genPlayoffSeriesOld,
	genPlayoffSeriesNALCS,
	genPlayoffSeriesNACS,
	genPlayoffSeriesLPL,
	genPlayoffSeriesLCK,
	genPlayoffSeriesLMS,
	genPlayoffSeriesWC,
	seriesStartEndSkip,
  randomWithFilter,
  randomWithFilter2,
  randomWithFilter3,
};
