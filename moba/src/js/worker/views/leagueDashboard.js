// @flow

import {PHASE, PLAYER, g, helpers} from '../../common';
import {season, team} from '../core';
import {idb} from '../db';
import {getProcessedGames} from '../util';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateInbox(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun')) {
        const messages = await idb.getCopies.messages({limit: 2});
        messages.reverse();

        for (let i = 0; i < messages.length; i++) {
            delete messages[i].text;
        }

        return {
            messages,
        };
    }
}

async function updateTeam(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {

    if (updateEvents.includes('firstRun') || updateEvents.includes('gameSim') || updateEvents.includes('playerMovement') || updateEvents.includes('newPhase')) {
        const [t, latestSeason] = await Promise.all([
            idb.cache.teams.get(g.userTid),
            idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${g.userTid}`),
        ]);

		var LCS,LCSLadder,LCK,LPL,LMS,Worlds


		LCS = false;
		LCSLadder = false;
		LCK = false;
		LPL = false;
		LMS = false;
		Worlds = false;

		if (g.gameType == 0 ) {
			LCS = true;
		} else if (g.gameType == 1) {
			LCSLadder = true;
		} else if (g.gameType == 2) {
			LCK = true;
		} else if (g.gameType == 3) {
			LPL = true;
		} else if (g.gameType == 4) {
			LMS = true;
		} else {
			Worlds = true;
		}

  return {
      region: t.region,
      name: t.name,
      abbrev: t.abbrev,
      won:  latestSeason.won,
      lost:  latestSeason.lost,
      wonSpring:  latestSeason.wonSpring,
      lostSpring:  latestSeason.lostSpring,
      wonSummer:  latestSeason.wonSummer,
      lostSummer:  latestSeason.lostSummer,
      cash:  latestSeason.cash / 1000, // [millions of dollars]
      season: g.season,
			LCS: LCS,
			LCSLadder: LCSLadder,
			LCK: LCK,
			LPL: LPL,
			LMS: LMS,
			Worlds: Worlds,
            playoffRoundsWon: latestSeason.playoffRoundsWon,
        };
    }
}

async function updatePayroll(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('playerMovement')) {
        const payroll = (await team.getPayroll(g.userTid))[0];
        return {
            payroll: payroll/1000, // [millions of dollars]
        };
    }
}


async function updateTeams(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('gameSim') || updateEvents.includes('playerMovement') || updateEvents.includes('newPhase')) {
        const vars = {};
        //const stats = ["pts", "oppPts", "trb", "ast"];  // This is also used later to find ranks for these team stats
        const stats = ["pts", "oppPts", "trb", "ast","fg","fga","fgp","tp","kda"];  // This is also used later to find ranks for these team stats

        const teams = helpers.orderByWinp(await idb.getCopies.teamsPlus({
            attrs: ["tid", "cid"],
            seasonAttrs: ["won", "winp", "att", "revenue", "profit"],
            stats,
            season: g.season,
        }));

        const t = teams.find(t2 => t2.tid === g.userTid);
        const cid = t !== undefined ? t.cid : undefined;

		//console.log(g.userTid);
	//	console.log(cid);
	//	console.log(teams);

        vars.rank = 1;
        for (let i = 0; i < teams.length; i++) {
		//	console.log(teams[i].cid);
            if (teams[i].cid === cid) {
                if (teams[i].tid === g.userTid) {
                    //vars.pts = teams[i].stats.pts;
                    //vars.oppPts = teams[i].stats.oppPts;
                    //vars.trb = teams[i].stats.trb;
                    //vars.ast = teams[i].stats.ast;

					vars.pts = teams[i].stats.pts;
					vars.oppPts = teams[i].stats.oppPts;
					vars.trb = teams[i].stats.trb;
					vars.ast = teams[i].stats.ast;
					vars.fg = teams[i].stats.fg;
					vars.fga = teams[i].stats.fga;
					vars.fgp = teams[i].stats.fgp;
					vars.tp = teams[i].stats.tp;

                    vars.att = teams[i].seasonAttrs.att;
                    vars.revenue = teams[i].seasonAttrs.revenue;
                    vars.profit = teams[i].seasonAttrs.profit;
                    break;
                } else {
                    vars.rank += 1;
                }
            }
        }

        for (let i = 0; i < stats.length; i++) {
            teams.sort((a, b) => b.stats[stats[i]] - a.stats[stats[i]]);
            for (let j = 0; j < teams.length; j++) {
                if (teams[j].tid === g.userTid) {
                    vars[`${stats[i]}Rank`] = j + 1;
                    break;
                }
            }
        }

		/*var numTeams;
		numTeams = 10;
		if (g.gameType == 0 && g.gameType == 2) {
		   numTeams = 10;
		} else if (g.gameType == 1) {
		   numTeams = 30;
		} else if (g.gameType == 3) {
		   numTeams = 12;
		} else if (g.gameType == 4) {
		   numTeams = 8;
		} else if (g.gameType == 5) {
		   numTeams = 57;
		}*/

	//	if (g.numTeams > 0) {
		//	numTeams = g.numTeams;
		//}

//		vars.oppPtsRank = numTeams+1 - vars.oppPtsRank;
	//	vars.fgaRank =  numTeams+1 - vars.fgaRank;

		vars.oppPtsRank = g.numTeams+1 - vars.oppPtsRank;
		vars.fgaRank =  g.numTeams+1 - vars.fgaRank;
		//console.log(vars);
      //  vars.oppPtsRank = g.numTeams + 1 - vars.oppPtsRank;

        return vars;
    }
}

async function updateGames(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    const NUM_SHOW_COMPLETED = 4;
    if (updateEvents.includes('firstRun')) {
        // Load all games in list - would be more efficient to just load NUM_SHOW_COMPLETED
        const games = await getProcessedGames(g.teamAbbrevsCache[g.userTid], g.season);

        const completed = games
            .slice(0, NUM_SHOW_COMPLETED)
            .map((game) => helpers.formatCompletedGame(game));

        return {completed};
    }
    if (updateEvents.includes('gameSim')) {
        const completed = state.completed;
        // Partial update of only new games
        const games = await getProcessedGames(g.teamAbbrevsCache[g.userTid], g.season, state.completed);
        for (let i = games.length - 1; i >= 0; i--) {
            completed.unshift(helpers.formatCompletedGame(games[i]));
            if (completed.length > NUM_SHOW_COMPLETED) {
                completed.pop();
            }
        }

        return {completed};
    }
}

async function updateSchedule(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('gameSim') || updateEvents.includes('newPhase')) {
        const schedule = await season.getSchedule();
        const games = [];
        const numShowUpcoming = 3;
        for (let i = 0; i < schedule.length; i++) {
            const game = schedule[i];
            if (g.userTid === game.homeTid || g.userTid === game.awayTid) {
                const team0 = {tid: game.homeTid, abbrev: g.teamAbbrevsCache[game.homeTid], region: g.teamRegionsCache[game.homeTid], name: g.teamNamesCache[game.homeTid]};
                const team1 = {tid: game.awayTid, abbrev: g.teamAbbrevsCache[game.awayTid], region: g.teamRegionsCache[game.awayTid], name: g.teamNamesCache[game.awayTid]};

                games.push({gid: game.gid, teams: [team1, team0]});
            }

            if (games.length >= numShowUpcoming) {
                break;
            }
        }
        return {upcoming: games};
    }
}

async function updatePlayers(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('gameSim') || updateEvents.includes('playerMovement') || updateEvents.includes('newPhase')) {
        const vars = {};

        let players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.UNDRAFTED, Infinity]);
        players = await idb.getCopies.playersPlus(players, {
		   attrs: ["pid", "name","userID", "abbrev", "tid", "age", "contract", "rosterOrder", "injury", "watch", "pos","born"],
			ratings: ["MMR","ovr", "pot", "dovr", "dpot", "dMMR", "skills", 'pos'],
			stats: ["gp", "min", "pts", "trb", "ast","tp","fg","fga","fgp", "per", "yearsWithTeam","kda"],

//            attrs: ['pid', 'name', 'abbrev', 'tid', 'age', 'contract', 'rosterOrder', 'injury', 'watch'],
            //ratings: ['ovr', 'pot', 'dovr', 'dpot', 'skills', 'pos'],
            //stats: ['gp', 'min', 'pts', 'trb', 'ast', 'per', 'yearsWithTeam'],
            season: g.season,
            showNoStats: true,
            showRookies: true,
            fuzz: true,
        });

        // League leaders
        vars.leagueLeaders = {};
        //const stats = ['pts', 'trb', 'ast']; // Categories for leaders
		const stats = ["pts", "trb", "ast","fg","fga","fgp","tp"]; // Categories for leaders
        for (const stat of stats) {
            players.sort((a, b) => b.stats[stat] - a.stats[stat]);
            vars.leagueLeaders[stat] = {
                pid: players[0].pid,
                name: players[0].name,
                userID: players[0].userID,
                abbrev: players[0].abbrev,
                stat: players[0].stats[stat],
            };
        }

        // Team leaders
        const userPlayers = players.filter(p => p.tid === g.userTid);
        vars.teamLeaders = {};
        for (const stat of stats) {
            if (userPlayers.length > 0) {
                userPlayers.sort((a, b) => b.stats[stat] - a.stats[stat]);
                vars.teamLeaders[stat] = {
                    pid: userPlayers[0].pid,
                    name: userPlayers[0].name,
                    userID: userPlayers[0].userID,
                    stat: userPlayers[0].stats[stat],
                };
            } else {
                vars.teamLeaders[stat] = {
                    pid: 0,
                    name: '',
                    stat: 0,
                };
            }
        }

        // Roster
        // Find starting 5
        vars.starters = userPlayers.sort((a, b) => a.rosterOrder - b.rosterOrder).slice(0, 5);

        return vars;
    }
}

async function updatePlayoffs(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || (g.phase >= g.PHASE.PLAYOFFS && updateEvents.includes('gameSim')) || (updateEvents.includes('newPhase') && g.phase === g.PHASE.PLAYOFFS)) {
        const playoffSeries = await idb.getCopy.playoffSeries({season: g.season});

		var found, i, rnd;
		var seriesStart,seriesEnd;

        let foundSeries;
        let seriesTitle = '';
        let showPlayoffSeries = false;

        if (playoffSeries !== undefined) {
            const series = playoffSeries.series;
            let found = false;


		  // Find the latest playoff series with the user's team in it
			for (rnd = playoffSeries.currentRound; rnd >= 0; rnd--) {

	var startEnd = season.seriesStartEnd(rnd);

	seriesStart = startEnd.seriesStart;
	seriesEnd = startEnd.seriesEnd;


				for (i = seriesStart; i < seriesEnd; i++) {
					i = season.seriesStartEndSkip(seriesStart,seriesEnd,rnd, i);

					if (series[rnd][i].home.tid === g.userTid || series[rnd][i].away.tid === g.userTid) {
						//series = [[series[rnd][i]]];
						foundSeries = [[series[rnd][i]]];
						found = true;
						showPlayoffSeries = true;

						if (g.gameType == 0) {
							if (rnd === 0) {
								seriesTitle = "First Round";
							} else if (rnd === 1) {
								seriesTitle = "Second Round";
							} else if (rnd === 2) {
								seriesTitle = "Conference Finals";
							} else if (rnd === 3) {
								seriesTitle = "League Finals";
							}
						} else if ((g.gameType == 1) || (g.gameType == 5)) {

							if ( ((rnd==9) && (i<4)) || ((rnd==0) && (i>10) && (i<14)) || ((rnd==0)  && (i<2))  || ((rnd==1)  && (i==7)) || ((rnd==3) && (i>1) && (i<4)) ){
								seriesTitle = "Quarterfinals";
							} else if ( ((rnd==1) && (i>8) && (i<12)) || ( (rnd==1) && (i<2) )  || ( (rnd==2) && (i==6) )  || ( (rnd==4) && (i<2) ) ||  ((rnd==0) && (i>13) && (i<16)) ||  ((rnd==6) && (i<10)) ||  ((rnd==10) && (i<2))  ) {
								seriesTitle = "Semifinals";
							} else if ( ((rnd==2) && (i<1)) ||   ((rnd==2) && (i==8)) ||   ((rnd==2) && (i==9)) || ((rnd==3) && (i==1)) || ((rnd==5) && (i==0))  || ((rnd==1) && (i==2))  || ((rnd==2) && (i>3) && (i<6)) || ((rnd==1) && (i==12))  || ((rnd==7) && (i==0))  || ((rnd==7) && (i==4))  || ((rnd==11) && (i==0))  )  {
								seriesTitle = "Finals";
							} else if ( ( (rnd==2) && (i==10)) || ((rnd==2) && (i==1)) || ((rnd==5) && (i==1))  || ((rnd==1) && (i==3))  )  {
								seriesTitle = "3rd Place Game";
							} else if ( (rnd==8) && (i<8) )  {
								seriesTitle = "Groups";
							} else if ( ((rnd==0) && (i==10) || ((rnd==0) && (i<9) && (i>3))  )  )  {
								seriesTitle = "Round 1";
							} else if ( ((rnd==1) && (i==8))  || ((rnd==1) && (i<7) && (i>3)) )  {
								seriesTitle = "Round 2";
							} else if (((rnd==0) && (i==2)) || ((rnd==0) && (i==3))   )  {
								seriesTitle = "First Round";
							} else if ( ((rnd==2) && (i==7)) )  {
								seriesTitle = "Seeding Match";
							} else if (  (rnd==0) && (i==9) )  {
								seriesTitle = "Wild Card";
							} else if (  (rnd==2) && (i>1) && (i<4))  {
								seriesTitle = "Promotion";
							}


						} else if (g.gameType == 2) {
							if (rnd === 0) {
								seriesTitle = "Wild Card";
							} else if (rnd === 1) {
								seriesTitle = "Quarterfinals";
							} else if (rnd === 2) {
								seriesTitle = "Semifinals";
							} else if (rnd === 3) {
								seriesTitle = "League Finals";
							}
						} else if (g.gameType == 3) {
							if (rnd === 0) {
								seriesTitle = "First Round";
							} else if (rnd === 1) {
								seriesTitle = "Second Round";
							} else if (rnd === 2) {
								seriesTitle = "Seeding Match";
							} else if (rnd === 3) {
								seriesTitle = "Quarterfinals";
							} else if (rnd === 4) {
								seriesTitle = "Semifinals";
							} else if (rnd === 5) {
								seriesTitle = "League Finals";
							}
						} else if (g.gameType == 4) {
							if (rnd === 0) {
								seriesTitle = "Quarterfinals";
							} else if (rnd === 1) {
								seriesTitle = "Semifinals";
							} else if (rnd === 2) {
								seriesTitle = "League Finals";
							}
						} else if (g.gameType == 5) {
						    if (g.yearType == 2019) {
								if (rnd < 6) {
									seriesTitle = "Conference Playoffs";
								} else if (rnd < 8) {
									seriesTitle = "Regionals";
								} else if (rnd === 8) {
									seriesTitle = "Groups - Stage 1";
								} else if (rnd === 9) {
									seriesTitle = "Play-In";
								} else if (rnd === 10) {
									seriesTitle = "Play-In";
								} else if (rnd === 11) {
									seriesTitle = "Play-In";
								} else if (rnd === 12) {
									seriesTitle = "Groups - Stage 2";
								} else if (rnd === 13) {
									seriesTitle = "Worlds Quarterfinals";
								} else if (rnd === 14) {
									seriesTitle = "Worlds Semifinals";
								} else if (rnd === 15) {
									seriesTitle = "Worlds Finals";
								}
							} else {
								if (rnd < 6) {
									seriesTitle = "Conference Playoffs";
								} else if (rnd < 8) {
									seriesTitle = "Regionals";
								} else if (rnd === 8) {
									seriesTitle = "Groups";
								} else if (rnd === 9) {
									seriesTitle = "Worlds Quarterfinals";
								} else if (rnd === 10) {
									seriesTitle = "Worlds Semifinals";
								} else if (rnd === 11) {
									seriesTitle = "Worlds Finals";
								}
							}
						}
						// Update here rather than by returning vars because returning vars doesn't guarantee order of updates, so it can cause an error when showPlayoffSeries is true before the other stuff is set (try it with the same league in two tabs). But otherwise (for normal page loads), this isn't sufficient and we need to return vars. I don't understand, but it works.
						//if (updateEvents.indexOf("dbChange") >= 0) {
							//komapping.fromJS({series: vars.series, seriesTitle: vars.seriesTitle}, vm);
						//}
						break;
					}
				}
				if (found) {
					break;
				}
			}
	//	}

	//	return vars;



            // Find the latest playoff series with the user's team in it
       /*     for (let rnd = playoffSeries.currentRound; rnd >= 0; rnd--) {
                for (let i = 0; i < series[rnd].length; i++) {
                    if (series[rnd][i].home.tid === g.userTid || series[rnd][i].away.tid === g.userTid) {
                        foundSeries = series[rnd][i];
                        found = true;
                        showPlayoffSeries = true;
                        if (rnd === 0) {
                            seriesTitle = "First Round";
                        } else if (rnd === 1) {
                            seriesTitle = "Second Round";
                        } else if (rnd === 2) {
                            seriesTitle = "Conference Finals";
                        } else if (rnd === 3) {
                            seriesTitle = "League Finals";
                        }
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }*/
        }

        return {
            series: foundSeries,
            seriesTitle,
            showPlayoffSeries,
        };
    }
}

async function updateStandings(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('gameSim')) {
        const teams = helpers.orderBySplitWinp(await idb.getCopies.teamsPlus({
			attrs: ["tid", "cid", "abbrev", "region","name"],
			seasonAttrs: ["won", "lost", "winp","cidMid","cidStart","wonSummer", "lostSpring","lostSummer", "wonSpring" ,"winpSpring", "winpSummer",],
			stats: ["kda","fg","fga","fgp"],


//            attrs: ["tid", "cid", "abbrev", "region"],
  //          seasonAttrs: ["won", "lost", "winp"],
            season: g.season,
        }));
		var typeCutoff, numConferences;
//		console.log(cid);
//    console.log(teams);
     // Find user's conference
        let cidUsed;
        for (const t of teams) {
            if (t.tid === g.userTid) {
//                cid = t.cid;
				if (g.seasonSplit == "Summer") {
			//				if (g.gameType == 7) {
					cidUsed = t.seasonAttrs.cidMid;
				} else {
					cidUsed = t.seasonAttrs.cidStart;
				}
                //cid = t.seasonAttrs.cidStart;
                break;
            }
        }
	//	console.log(cidUsed);
		let cid = cidUsed;
//console.log(cid)
		typeCutoff = 7;
		if (g.gameType == 0) {
			typeCutoff = 6;
			numConferences = 1;
		} else if (g.gameType == 1) {
			if (cid == 0) {
				typeCutoff = 5;
			} else if (cid == 1) {
				typeCutoff = 3;
			} else {
				typeCutoff = 9;
			}
			numConferences = 3;
		} else if (g.gameType == 2) {
			typeCutoff = 4;
			numConferences = 1;
		} else if (g.gameType == 3) {
			typeCutoff = 7;
			numConferences = 1;
		} else if (g.gameType == 4) {
			typeCutoff = 3;
			numConferences = 1;
		} else {
			if (cid == 0) {
				typeCutoff = 5;
			} else if (cid == 1) {
				typeCutoff = 5;
			} else if (cid == 2) {
				typeCutoff = 4;
			} else if (cid == 3) {
				typeCutoff = 7;
			} else if (cid == 4) {
				typeCutoff = 3;
			} else {
				typeCutoff = 3;
			}
			numConferences = 6;
		}





		// cidStart the issue?
        const confTeams = [];
      /* let l = 0;
		//console.log(teams.length);
        for (let k = 0; k < teams.length; k++) {
		//console.log(teams[k].seasonAttrs.cidStart);
            if (cid === teams[k].seasonAttrs.cidStart) {
	//	console.log(teams[k]);

                confTeams.push(helpers.deepCopy(teams[k]));
                confTeams[l].rank = l + 1;
                if (l === 0) {
                    confTeams[l].gb = 0;
                } else {
                    confTeams[l].gb = helpers.gb(confTeams[0].seasonAttrs, confTeams[l].seasonAttrs);
                }
                l += 1;
            }
        }*/
		let j = 0;
       // for (let i = 0; i < g.confs.length; i++) {
			for (const t of teams) {

				//console.log(g.confs[i].cid+" "+cidUsed)
				if (t.cid === cidUsed) {
				//	playoffsRank[t.tid] = j + 1; // Store ranks by tid, for use in division standings
				//console.log(t);
					confTeams.push(helpers.deepCopy(t));
					confTeams[j].rank = j + 1;
					if (j === 0) {
						confTeams[j].gb = 0;
						confTeams[j].gbSpring = 0;
						confTeams[j].gbSummer = 0;
					} else {
						//confTeams[j].gb = helpers.gb(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);
						if (g.seasonSplit == "Summer") {
							confTeams[j].gb = helpers.gbSummer(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);

							confTeams[j].gbSpring = 0;
							confTeams[j].gbSummer = helpers.gbSummer(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);
						} else {
							confTeams[j].gb = helpers.gbSpring(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);

							confTeams[j].gbSummer = 0;
							confTeams[j].gbSpring = helpers.gbSpring(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);
						}
					}

					j += 1;
				}

			}
//		}

        const playoffsByConference = g.confs.length === numConferences;// && !localStorage.getItem('top16playoffs');
		//console.log(playoffsByConference+" "+numConferences+" "+g.confs.length);
		//console.log("got here");
		//console.log(confTeams);
        return {
            confTeams,
			typeCutoff,
            playoffsByConference,
        };
    }
}

export default {
    runBefore: [
        updateInbox,
        updateTeam,
        updatePayroll,
        updateTeams,
        updateGames,
        updateSchedule,
        updatePlayers,
        updatePlayoffs,
        updateStandings,
      //  userTid: g.userTid,
      //  gameType: g.gameType,
    ],
};
