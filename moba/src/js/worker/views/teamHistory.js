// @flow

import {g} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateTeamHistory(
    inputs: {abbrev: string, tid: number},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('gameSim') || inputs.abbrev !== state.abbrev) {
        let bestRecord = null;
        let worstRecord = null;


        const teamSeasons = await idb.getCopies.teamSeasons({tid: inputs.tid});
	//	console.log(teamSeasons);
        const history = [];
        let totalWon = 0;
        let totalLost = 0;
        let totalWonCS = 0;
        let totalLostCS = 0;
        let totalWonLadder = 0;
        let totalLostLadder = 0;
        let playoffAppearances = 0;
        let worldsAppearances = 0;
        let regionalAppearances = 0;
        let groupsAppearances = 0;
        let championships = 0;

        let groups1Appearances = 0;

		let playInAppearances = 0;
//		let placeHolderWon;
//		let placeHolderLost;
//		let placeHolderLevel;
//		let placeHolderLevel;
        for (const teamSeason of teamSeasons) {
		//	console.log(teamSeason);
			let roundsWon;
			let levelStart = "LCS";
			let levelMid = "LCS";
			//console.log(levelStart);
			//console.log(levelMid);
			if (g.gameType == 7) {
				//console.log(teamSeason);

				teamSeason.won = teamSeason.wonSummer;
				teamSeason.lost = teamSeason.lostSummer;
				teamSeason.levelStart = teamSeason.cidStart % 3;
				teamSeason.levelMid = teamSeason.cidMid % 3;
				//console.log(teamSeason.levelStart);
//				console.log(teamSeason.levelMid);
				if (teamSeason.levelStart == 0) {
					if (teamSeason.cidStart == 0) {
						levelStart = "NALCS";
					} else if (teamSeason.cidStart == 3) {
						levelStart = "EULCS";
					} else if (teamSeason.cidStart == 6) {
						levelStart = "LCK";
					} else if (teamSeason.cidStart == 9) {
						levelStart = "LPL";
					} else if (teamSeason.cidStart == 12) {
						levelStart = "LMS";
					} else if (teamSeason.cidStart == 15) {
						levelStart = "WC";
					}
				//console.log(levelStart);

				} else if (teamSeason.levelStart == 1) {
					levelStart = "CS";
				///console.log(levelStart);

				} else if (teamSeason.levelStart == 2) {
					levelStart = "Ladder";
				//console.log(levelStart);

				}
				if (teamSeason.levelMid == 0) {
					if (teamSeason.cidMid == 0) {
						levelMid = "NALCS";
					} else if (teamSeason.cidMid == 3) {
						levelMid = "EULCS";
					} else if (teamSeason.cidMid == 6) {
						levelMid = "LCK";
					} else if (teamSeason.cidMid == 9) {
						levelMid = "LPL";
					} else if (teamSeason.cidMid == 12) {
						levelMid = "LMS";
					} else if (teamSeason.cidMid == 15) {
						levelMid = "WC";
					}

				//console.log(levelMid);

				} else if (teamSeason.levelMid == 1) {
					levelMid = "CS";
				//console.log(levelMid);

				} else if (teamSeason.levelMid == 2) {
					levelMid = "Ladder";
				//console.log(levelMid);

				}
				//console.log(levelStart);
				//console.log(levelMid);

				//console.log(teamSeason);
				// add this to history

				roundsWon = teamSeason.playoffRoundsWonWorlds;
				history.push({
					season: teamSeason.season,
					won: teamSeason.wonSummer,
					lost: teamSeason.lostSummer,
					levelStart: levelStart,
					levelStartN: teamSeason.levelStart,
					wonSpring: teamSeason.wonSpring,
					lostSpring: teamSeason.lostSpring,
					levelMid: levelMid,
					levelMidN: teamSeason.levelMid,
					playoffRoundsWon: roundsWon,
					playoffRoundsWonWorldsGr: teamSeason.playoffRoundsWonWorldsGr,
				});
			} else if (g.gameType == 6) {
				roundsWon = teamSeason.playoffRoundsWonWorlds;
				history.push({
					season: teamSeason.season,
					won: teamSeason.wonSummer,
					lost: teamSeason.lostSummer,
					wonSpring: teamSeason.wonSpring,
					lostSpring: teamSeason.lostSpring,
					playoffRoundsWon: roundsWon,
					playoffRoundsWonWorldsGr: teamSeason.playoffRoundsWonWorldsGr,
				});
			} else {
				roundsWon = teamSeason.playoffRoundsWon;
				history.push({
					season: teamSeason.season,
					won: teamSeason.won,
					lost: teamSeason.lost,
					playoffRoundsWon: roundsWon,
				});
			}


			if (g.gameType == 7) {
				if (teamSeason.levelStart == 0) {
					totalWon += teamSeason.wonSpring;
					totalLost += teamSeason.lostSpring;
				} else if (teamSeason.levelStart == 1) {
					totalWonCS += teamSeason.wonSpring;
					totalLostCS += teamSeason.lostSpring;
				} else if (teamSeason.levelStart == 2) {
					totalWonLadder += teamSeason.wonSpring;
					totalLostLadder += teamSeason.lostSpring;
				}

				if (teamSeason.levelMid == 0) {
					totalWon += teamSeason.wonSummer;
					totalLost += teamSeason.lostSummer;
				} else  if (teamSeason.levelMid == 1) {
					totalWonCS += teamSeason.wonSummer;
					totalLostCS += teamSeason.lostSummer;
				} else {
					totalWonLadder += teamSeason.wonSummer;
					totalLostLadder += teamSeason.lostSummer;
				}

			} else if (g.gameType == 6) {
					totalWon += teamSeason.wonSpring;
					totalLost += teamSeason.lostSpring;
					totalWon += teamSeason.wonSummer;
					totalLost += teamSeason.lostSummer;
			} else if (g.gameType == 1) {
				if (teamSeason.cidStart == 0) {
					totalWon += teamSeason.wonSummer;
					totalLost += teamSeason.lostSummer;
				} else if (teamSeason.cidStart == 1) {
					totalWonCS += teamSeason.wonSummer;
					totalLostCS += teamSeason.lostSummer;
				} else if (teamSeason.cidStart == 2) {
					totalWonLadder += teamSeason.wonSummer;
					totalLostLadder += teamSeason.lostSummer;
				}
			} else {
				totalWon += teamSeason.won;
				totalLost += teamSeason.lost;
			}


			if (g.gameType == 0 ) {
				if (teamSeason.playoffRoundsWon >= 0) { playoffAppearances += 1; }
				if (teamSeason.playoffRoundsWon === 3) { championships += 1; }

			} else if (g.gameType == 1 ) {
				if (teamSeason.playoffRoundsWon >= 24) { playoffAppearances += 1; }
				if (teamSeason.playoffRoundsWon === 27) { championships += 1; }
			} else if (g.gameType == 2 ) {
				if (teamSeason.playoffRoundsWon >= 0) { playoffAppearances += 1; }
				if (teamSeason.playoffRoundsWon === 4) { championships += 1; }
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				if (teamSeason.playoffRoundsWon >= 0) { playoffAppearances += 1; }
				if (teamSeason.playoffRoundsWon === 6) { championships += 1; }
			} else if (g.gameType == 3 && g.yearType == 2019) {
				if (teamSeason.playoffRoundsWon >= 0) { playoffAppearances += 1; }
				if (teamSeason.playoffRoundsWon === 4) { championships += 1; }
			} else if (g.gameType == 4 ) {
				if (teamSeason.playoffRoundsWon >= 0) { playoffAppearances += 1; }
				if (teamSeason.playoffRoundsWon === 3) { championships += 1; }
			} else if (g.gameType == 5  ) {
				if (g.yearType == 2019) {
					console.log(teamSeason);
					console.log(teamSeason.playoffRoundsWon);
					if (teamSeason.playoffRoundsWon >= 0) { playoffAppearances += 1; }
							//let regionalAppearances = 0;
			//let groupsAppearances = 0;
					//if (teamSeason.playoffRoundsWon >= 1) { regionalAppearances += 1; }
					if (teamSeason.playoffRoundsWon >= 2) { groups1Appearances += 1; }
					if (teamSeason.playoffRoundsWon >= 3) { playInAppearances += 1; }
					if (teamSeason.playoffRoundsWon >= 6) { groupsAppearances += 1; }
					if (teamSeason.playoffRoundsWon >= 7) { worldsAppearances += 1; }
					if (teamSeason.playoffRoundsWon === 10) { championships += 1; }
				} else {
					if (teamSeason.playoffRoundsWon >= 0) { playoffAppearances += 1; }
							//let regionalAppearances = 0;
			//let groupsAppearances = 0;
					//if (teamSeason.playoffRoundsWon >= 1) { regionalAppearances += 1; }
					if (teamSeason.playoffRoundsWon >= 2) { groupsAppearances += 1; }
					if (teamSeason.playoffRoundsWon >= 3) { worldsAppearances += 1; }
					if (teamSeason.playoffRoundsWon === 6) { championships += 1; }
				}
			} else if (g.gameType == 7 || g.gameType == 6  ) {
				//console.log(teamSeason.playoffRoundsWonWorlds);
				if (teamSeason.playoffRoundsWonLCK >= 0 ||
				teamSeason.playoffRoundsWonEULCS >= 0 ||
				teamSeason.playoffRoundsWonLMS >= 0 ||
				teamSeason.playoffRoundsWonLPL >= 0 ||
				teamSeason.playoffRoundsWonNALCS >= 0
				) { playoffAppearances += 1; }
				if (teamSeason.playoffRoundsWonWorldsGr >= 0) { groupsAppearances += 1; }
				if (teamSeason.playoffRoundsWonWorlds >= 0) { worldsAppearances += 1; }
				if (teamSeason.playoffRoundsWonWorlds === 3) { championships += 1; }
			}
          /*  if (teamSeason.playoffRoundsWon >= 0) {
                playoffAppearances += 1;
            }
            if (teamSeason.playoffRoundsWon === g.numPlayoffRounds) {
                championships += 1;
            }*/

			// just pick the best split?
			// need to ensure nulls and empty split is handled correctly

			if (g.gameType == 7  ) {
				let bestSplitWon;
				let worstSplitLost;
				let bestSplitLevel;
				let worstSplitLevel;

				if (teamSeason.levelStart > teamSeason.levelMid) {
					bestSplitWon = history[history.length - 1].won;
					worstSplitLost = history[history.length - 1].lostSpring;
					bestSplitLevel = history[history.length - 1].levelMidN;
					worstSplitLevel = history[history.length - 1].levelStartN;
				} else if (teamSeason.levelStartN < teamSeason.levelMidN) {
					bestSplitWon = history[history.length - 1].wonSpring;
					worstSplitLost = history[history.length - 1].lost;
					bestSplitLevel = history[history.length - 1].levelStartN;
					worstSplitLevel = history[history.length - 1].levelMidN;
				} else if (history[history.length - 1].wonSummer > history[history.length - 1].wonSpring) {
					bestSplitWon = history[history.length - 1].won;
					worstSplitLost = history[history.length - 1].lostSpring;
					bestSplitLevel = history[history.length - 1].levelMidN;
					worstSplitLevel = history[history.length - 1].levelStartN;
				} else {
					bestSplitWon = history[history.length - 1].wonSpring;
					worstSplitLost = history[history.length - 1].lost;
					bestSplitLevel = history[history.length - 1].levelStartN;
					worstSplitLevel = history[history.length - 1].levelMidN;
				}

				let recordBestSplitWon;
				let recordWorstSplitLost;
				let recordBestSplitLevel;
				let recordWorstSplitLevel;

				if (bestRecord === null) {
					bestRecord = history[history.length - 1];
				} else {
					if (bestRecord.levelStartN > bestRecord.levelMidN) {
						recordBestSplitWon = bestRecord.won;
						recordBestSplitLevel = bestRecord.levelMidN;
					} else if (bestRecord.levelStartN < bestRecord.levelMidN) {
						recordBestSplitWon = bestRecord.wonSpring;
						recordBestSplitLevel = bestRecord.levelStartN;
					} else if (bestRecord.won > bestRecord.wonSpring) {
						recordBestSplitWon = bestRecord.won;
						recordBestSplitLevel = bestRecord.levelMidN;
					} else {
						recordBestSplitWon = bestRecord.wonSpring;
						recordBestSplitLevel = bestRecord.levelStartN;
					}

				//	console.log("Best: "+bestSplitLevel+" "+recordBestSplitLevel+" "+recordBestSplitWon+" "+bestSplitWon);
//					console.log(bestRecord);
	//				console.log(history[history.length - 1]);

					if (bestSplitLevel < recordBestSplitLevel) {
						bestRecord = history[history.length - 1];
					} else if (bestSplitLevel == recordBestSplitLevel) {
						if (recordBestSplitWon < bestSplitWon) {
							bestRecord = history[history.length - 1];
						}
					}

				}

				if (worstRecord === null) {
					worstRecord = history[history.length - 1];
				} else {
					if (worstRecord.levelStartN > worstRecord.levelMidN) {
						recordWorstSplitLost = worstRecord.lostSpring;
						recordWorstSplitLevel = worstRecord.levelStartN;
					} else if (worstRecord.levelStartN < worstRecord.levelMidN) {
						recordWorstSplitLost = worstRecord.lost;
						recordWorstSplitLevel = worstRecord.levelMidN;
					} else if (worstRecord.lostSpring > worstRecord.lost) {
						recordWorstSplitLost = worstRecord.lostSpring;
						recordWorstSplitLevel = worstRecord.levelStartN;
					} else {
						recordWorstSplitLost = worstRecord.lost;
						recordWorstSplitLevel = worstRecord.levelMidN;
					}


				//	console.log("Worst: "+worstSplitLevel+" "+recordWorstSplitLevel+" "+recordWorstSplitLost+" "+worstSplitLost);
//					console.log(worstRecord);
	//				console.log(history[history.length - 1]);


					if (worstSplitLevel > recordWorstSplitLevel) {
						worstRecord = history[history.length - 1];
					} else if (worstSplitLevel == recordWorstSplitLevel) {
						if (recordWorstSplitLost < worstSplitLost) {
							worstRecord = history[history.length - 1];
						}
					}
				}

			} else if (g.gameType == 6  ) {
				console.log(bestRecord);
				if (bestRecord === null) {
					bestRecord = history[history.length - 1];
				} else 	if (history[history.length - 1].won < history[history.length - 1].wonSpring) {
					if (bestRecord.won < history[history.length - 1].wonSpring && bestRecord.wonSpring < history[history.length - 1].wonSpring ) {
						bestRecord = history[history.length - 1];
					}
				} else {
					if (bestRecord.won < history[history.length - 1].won && bestRecord.wonSpring < history[history.length - 1].won ) {
						bestRecord = history[history.length - 1];
					}
				}
					console.log(bestRecord);
					console.log(worstRecord);

				if (worstRecord === null) {
					worstRecord = history[history.length - 1];
				} else if (history[history.length - 1].lost < history[history.length - 1].lostSpring) {
					if (worstRecord.lost < history[history.length - 1].lostSpring && worstRecord.lostSpring < history[history.length - 1].lostSpring ) {
						worstRecord = history[history.length - 1];
					}
				} else {
					if (worstRecord.lost < history[history.length - 1].lost && worstRecord.lostSpring < history[history.length - 1].lost ) {
						worstRecord = history[history.length - 1];
					}
				}
					console.log(worstRecord);
			} else {
				if (bestRecord === null || bestRecord.won < history[history.length - 1].won) {
					bestRecord = history[history.length - 1];
				}
				if (worstRecord === null || worstRecord.lost < history[history.length - 1].lost) {
					worstRecord = history[history.length - 1];
				}
			}
        }

        history.reverse(); // Show most recent season first


        let players = await idb.getCopies.players({statsTid: inputs.tid});
        players = await idb.getCopies.playersPlus(players, {
			//attrs: ["pid", "name", "pos", "injury", "tid", "hof", "watch"],
            attrs: ["pid", "name", "injury", "tid", "hof", "watch"],
            ratings: ["pos"],
//            stats: ["season", "abbrev", "gp", "min", "pts", "trb", "ast", "per", "ewa"],
			stats: ["season", "abbrev", "gp", "min", "pts", "trb", "ast", "per", "ewa","min", "pts", "trb", "ast", "per","tp","fg","fga","fgp","kda"],

            tid: inputs.tid,
        });

        for (const p of players) {
            p.stats.reverse();

            for (let j = 0; j < p.stats.length; j++) {
                if (p.stats[j].abbrev === g.teamAbbrevsCache[inputs.tid]) {
                    p.lastYr = p.stats[j].season.toString();
                    break;
                }
            }

            p.pos = p.ratings[p.ratings.length - 1].pos;

            delete p.ratings;
            delete p.stats;
        }

        return {
            abbrev: inputs.abbrev,
            history,
            players,
            team: {
                name: g.teamNamesCache[inputs.tid],
                region: g.teamRegionsCache[inputs.tid],
                tid: inputs.tid,
            },
            totalWon,
            totalLost,
            totalWonCS,
            totalLostCS,
            totalWonLadder,
            totalLostLadder,
            playoffAppearances,
            groupsAppearances,
            worldsAppearances,
            championships,
			groups1Appearances,
			playInAppearances,
            bestRecord,
            worstRecord,
			gameType: g.gameType,
			yearType: g.yearType != undefined ? g.yearType : 0,
			};
    }
}

export default {
    runBefore: [updateTeamHistory],
};
