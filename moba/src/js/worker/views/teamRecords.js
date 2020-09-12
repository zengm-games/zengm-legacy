import _ from 'underscore';
import {g} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

function getTeamRecord(t, awards) {
	
	//console.log(t);
	//console.log(awards);
	
	var finalsRounds, finalsWin,playoffAppearancesMin;
	playoffAppearancesMin = 0;
	if (g.gameType == 0) {
		finalsRounds = 2;
		finalsWin = 3;
	} else if (g.gameType == 1) {			
		playoffAppearancesMin = 20;
		finalsRounds = 26;
		finalsWin = 27;		
	} else if (g.gameType == 2) {
		finalsRounds = 3;
		finalsWin = 4;			
	} else if (g.gameType == 3) {
		if (g.yearType == 2019) {
			finalsRounds = 3;
			finalsWin = 4;				
		} else {
			finalsRounds = 5;
			finalsWin = 6;	
		}		
	} else if (g.gameType == 4) {
		finalsRounds = 2;
		finalsWin = 3;			
	} else if (g.gameType == 5) {
		if (g.yearType == 2019) {
			playoffAppearancesMin = 7;
			finalsRounds = 9;
			finalsWin = 10;				
		} else {
			playoffAppearancesMin = 3;
			finalsRounds = 5;
			finalsWin = 6;	
		}				
	} else if (g.gameType == 6) {
		finalsRounds = 2;
		finalsWin = 3;			
	//} else if (g.gameType == 7) {
	} else {
		finalsRounds = 2;
		finalsWin = 3;			
//	} else {
//		playoffAppearancesMin = 3;			
//		finalsRounds = 5;
//		finalsWin = 6;			
	}	
	
    let totalWon = 0;
    let totalLost = 0;
	
    let playoffAppearances = 0;
    let championships = 0;
    let regionChampionships = 0;	
    let finals = 0;
    let lastPlayoffAppearance = null;
    let lastChampionship = null;
    for (let i = 0; i < t.seasonAttrs.length; i++) {
		
		let teamSeason = t.seasonAttrs[i];
		teamSeason.levelStart = teamSeason.cidStart % 3;
		teamSeason.levelMid = teamSeason.cidMid % 3;		
	//	console.log(teamSeason);
		if (g.gameType == 7) {
			if (teamSeason.levelStart == 0) {
				totalWon += teamSeason.wonSpring;
				totalLost += teamSeason.lostSpring;
			} else if (teamSeason.levelStart == 1) {				
		//		totalWonCS += teamSeason.wonSpring;
		//		totalLostCS += teamSeason.lostSpring;
			} else if (teamSeason.levelStart == 2) {				
		//		totalWonLadder += teamSeason.wonSpring;
		//		totalLostLadder += teamSeason.lostSpring;
			} 

			if (teamSeason.levelMid == 0) {				
				totalWon += teamSeason.wonSummer;
				totalLost += teamSeason.lostSummer;
			} else  if (teamSeason.levelMid == 1) {				
			//	totalWonCS += teamSeason.wonSummer;
			//	totalLostCS += teamSeason.lostSummer;
			} else {
			//	totalWonLadder += teamSeason.wonSummer;
			//	totalLostLadder += teamSeason.lostSummer;
			}
			
		} else if (g.gameType == 6) {
				totalWon += teamSeason.wonSpring;
				totalLost += teamSeason.lostSpring;
				totalWon += teamSeason.wonSummer;
				totalLost += teamSeason.lostSummer;
		} else if (g.gameType == 1) {
			if (teamSeason.levelStart == 0) {
				totalWon += teamSeason.wonSummer;
				totalLost += teamSeason.lostSummer;
			} else if (teamSeason.levelStart == 1) {				
		//		totalWonCS += teamSeason.wonSummer;
		//		totalLostCS += teamSeason.lostSummer;
			} else if (teamSeason.levelStart == 2) {				
		//		totalWonLadder += teamSeason.wonSummer;
		//		totalLostLadder += teamSeason.lostSummer;
			}				
		} else {
			totalWon += teamSeason.won;
			totalLost += teamSeason.lost;
		}		
		
     //   totalWon += t.seasonAttrs[i].won;
     //   totalLost += t.seasonAttrs[i].lost;
	//	console.log(t);	 	 
//		console.log(t.seasonAttrs);	 	 
	//	console.log(t.seasonAttrs[i]);	 
		//console.log(t.seasonAttrs[i].pointsSummer);
		if (g.gameType >= 6) {
			if (t.seasonAttrs[i].playoffRoundsWonWorlds >= playoffAppearancesMin) {
				playoffAppearances++;
				lastPlayoffAppearance = t.seasonAttrs[i].season;
			}						
			if (t.seasonAttrs[i].playoffRoundsWonWorlds >= finalsRounds) {
				finals++;
			}
			if (t.seasonAttrs[i].playoffRoundsWonWorlds === finalsWin) {
				championships++;
				lastChampionship = t.seasonAttrs[i].season;
			}		
			if (t.seasonAttrs[i].pointsSummer == 1000) {
				regionChampionships	++;
			}		
		
		} else {
			if (t.seasonAttrs[i].playoffRoundsWon >= playoffAppearancesMin) {
				playoffAppearances++;
				lastPlayoffAppearance = t.seasonAttrs[i].season;
			}			
			if (t.seasonAttrs[i].playoffRoundsWon >= finalsRounds) {
				finals++;
			}
			if (t.seasonAttrs[i].playoffRoundsWon === finalsWin) {
				championships++;
				lastChampionship = t.seasonAttrs[i].season;
			}			
			if (t.seasonAttrs[i].pointsSummer == 1000) {
				regionChampionships	++;
			}					
		}


    }

    const totalWP = totalWon > 0 ? (totalWon / (totalWon + totalLost)).toFixed(3) : '0.000';
//	console.log(t);	
	//console.log(t.tid);
	//console.log(awards);
	//console.log(regionChampionships);	
	//console.log(g.confs);
  //  for (let i = 0; i < teams.length; i++) {	
//		teams[i].teamConf = g.confs[teams[i].cid].name;
		t.teamConf = g.confs[t.cid].name;
	//}
		
	
    return {
        id: t.tid,
        team: {
            abbrev: t.abbrev,
            name: t.name,
            region: t.region,
        },
        cid: t.cid,
        did: t.did,
        won: totalWon,
        lost: totalLost,
        winp: totalWP.slice(1),
        playoffAppearances,
        lastPlayoffAppearance,
        championships,
        lastChampionship,
        finals,
		regionChampionships,		
        mvp: awards[t.tid].mvp,
        bestRecord: awards[t.tid].bestRecord,
        bestRecordConf: awards[t.tid].bestRecordConf,
        allLeague: awards[t.tid].allLeagueTotal,
        regionMVP: awards[t.tid].regionMVP,
        regionAllLeague: awards[t.tid].regionAllLeague,
		teamConf: t.teamConf,
		country: t.country,
    };
}

function tallyAwards(awards) {
    const teams = _.range(g.numTeams).map(() => {
        return {
            mvp: 0,
            allLeague: [0, 0, 0],
            allLeagueTotal: 0,
            allDefense: [0, 0, 0],
            allDefenseTotal: 0,
            allRookie: 0,
            bestRecord: 0,
            bestRecordConf: 0,
            regionMVP: 0,
            regionAllLeague: 0,
			
        };
    });
	//console.log(awards);
	//console.log(g.gameType+" "+g.season+" "+g.startingSeason+" "+g.phase+" "+g.PHASE.BEFORE_DRAFT);
	if (g.gameType >= 6 && g.season == g.startingSeason && g.phase <= g.PHASE.BEFORE_DRAFT) {
		
		//console.log(awards);
		//console.log(teams);	
		awards.forEach(a => {
			
		//	console.log(a);
			//console.log(teams);		
			//console.log(a);				
	//        if (a.bre && a.brw) {
			
			if (a.conf1 ) {
				// For old league files, this format is obsolete now
			 /*   teams[a.bre.tid].bestRecordConf++;
				teams[a.brw.tid].bestRecordConf++;
				if (a.bre.won >= a.brw.won) {
					teams[a.bre.tid].bestRecord++;
				} else {
					teams[a.brw.tid].bestRecord++;
				}*/
				//console.log(a.conf1);
				
				if (g.gameType == 6) {
					/*teams[a.conf1.tid].bestRecordConf++;				
					teams[a.conf2.tid].bestRecordConf++;
					teams[a.conf3.tid].bestRecordConf++;
					teams[a.conf4.tid].bestRecordConf++;
					teams[a.conf5.tid].bestRecordConf++;
					teams[a.conf6.tid].bestRecordConf++;
					
					console.log(a.conf6.won/a.conf6.lost);
					
					bestRecord = Math.max(a.conf1.won/a.conf1.lost, a.conf2.won/a.conf2.lost,a.conf3.won/a.conf3.lost,a.conf4.won/a.conf4.lost,a.conf5.won/a.conf5.lost,a.conf6.won/a.conf6.lost);
					if (a.conf1.won/a.conf1.lost == bestRecord) {
						teams[a.conf1.tid].bestRecord++;
					} 
					if (a.conf2.won/a.conf2.lost == bestRecord) {
						teams[a.conf2.tid].bestRecord++;
					} 
					if (a.conf3.won/a.conf3.lost == bestRecord) {
						teams[a.conf3.tid].bestRecord++;
					} 								
					if (a.conf4.won/a.conf4.lost == bestRecord) {
						teams[a.conf4.tid].bestRecord++;
					} 				
					if (a.conf5.won/a.conf5.lost == bestRecord) {
						teams[a.conf5.tid].bestRecord++;
					} 				
					if (a.conf6.won/a.conf6.lost == bestRecord) {
						teams[a.conf6.tid].bestRecord++;
					} 		*/						
				} else {
/*					teams[a.conf1.tid].bestRecordConf++;			
					teams[a.conf1.tid].bestRecord++;			
					
					teams[a.conf4.tid].bestRecordConf++;			
					teams[a.conf4.tid].bestRecord++;				
					teams[a.conf7.tid].bestRecordConf++;			
					teams[a.conf7.tid].bestRecord++;				
					teams[a.conf10.tid].bestRecordConf++;			
					teams[a.conf10.tid].bestRecord++;				
					teams[a.conf13.tid].bestRecordConf++;			
					teams[a.conf13.tid].bestRecord++;				
					teams[a.conf16.tid].bestRecordConf++;			
					teams[a.conf16.tid].bestRecord++;	*/			
					
				}				
							
				
			} else {
				//console.log(teams);
				//for (const t of a.bestRecordConfsSpring) {
				//	teams[t.tid].bestRecordConf++;
				//}
			//	console.log(a);
				//teams[a.bestRecordSpring.tid].bestRecord++;

			//	for (let i = 0; i < a.allRookie.length; i++) {
			//		teams[a.allRookie[i].tid].allRookie++;
			//	}
			}
		
		});		
		
	} else {
		//console.log(awards);
		//console.log(teams);	
		awards.forEach(a => {
			
			//console.log(a);
			//console.log(teams);		
			//console.log(a);				
			if (a.mvp != undefined ) {
				//console.log(a);					
				teams[a.mvp.tid].mvp++;				
			} else {
			//	console.log(a);					
			}
			if (a.regionMVP != undefined ) {
				for (let i = 0; i < a.regionMVP.length; i++) {
					//console.log(a);					
					///console.log("Not Undefined");																	
					////console.log(a.regionMVP[i].tid);					
					//console.log(teams[a.regionMVP[i].tid]);					
					//console.log(teams[a.regionMVP[i].tid].regionMVP);					
				
					teams[a.regionMVP[i].tid].regionMVP++;				
					//console.log(teams[a.regionMVP[i].tid].regionMVP);					
				}
			} else {
				//console.log(a);					
				//console.log("Undefined");									
			}			
			
			if (a.regionAllLeague != undefined ) {
				//	console.log(a);									
				for (let i = 0; i < a.regionAllLeague.length; i++) {					
				//	console.log(i);					
					for (const p of a.regionAllLeague[i].players) {
					//	console.log("Not Undefined");																	
					//	console.log(p.tid);					
					//	console.log(teams[p.tid].regionAllLeague);															
						teams[p.tid].regionAllLeague++;
					}
				}				
				
				/*for (let i = 0; i < a.regionAllLeague.length; i++) {				
				
					console.log(a);					
					console.log("Not Undefined");																	
					console.log(a.regionAllLeague[i].tid);					
					console.log(teams[a.regionAllLeague[i].tid]);					
					console.log(teams[a.regionAllLeague[i].tid].regionAllLeague);					

					teams[a.regionAllLeague[i].tid].regionAllLeague++;				
				}*/
			} else {
			//	console.log(a);					
			}			

	//        if (a.bre && a.brw) {
			//	console.log(a);					
			//	console.log(a);						
			if (a.conf1 ) {
				// For old league files, this format is obsolete now
			 /*   teams[a.bre.tid].bestRecordConf++;
				teams[a.brw.tid].bestRecordConf++;
				if (a.bre.won >= a.brw.won) {
					teams[a.bre.tid].bestRecord++;
				} else {
					teams[a.brw.tid].bestRecord++;
				}*/
			//	console.log(a.conf1);
				
				if (g.gameType == 0) {
					teams[a.conf1.tid].bestRecordConf++;
					teams[a.conf1.tid].bestRecord++;
				} else if (g.gameType == 1) {		
						// don't include ladder and cs teams
					teams[a.conf1.tid].bestRecordConf++;			
				//	teams[a.conf2.tid].bestRecordConf++;
				//	teams[a.conf3.tid].bestRecordConf++;
					teams[a.conf1.tid].bestRecord++;
				} else if (g.gameType == 2) {
					teams[a.conf1.tid].bestRecordConf++;				
					teams[a.conf1.tid].bestRecord++;
				} else if (g.gameType == 3) {
					teams[a.conf1.tid].bestRecordConf++;				
					teams[a.conf1.tid].bestRecord++;
				} else if (g.gameType == 4) {
					teams[a.conf1.tid].bestRecordConf++;				
					teams[a.conf1.tid].bestRecord++;
				} else if (g.gameType == 5 || g.gameType == 6) {
					teams[a.conf1.tid].bestRecordConf++;				
					teams[a.conf2.tid].bestRecordConf++;
					teams[a.conf3.tid].bestRecordConf++;
					teams[a.conf4.tid].bestRecordConf++;
					teams[a.conf5.tid].bestRecordConf++;
					teams[a.conf6.tid].bestRecordConf++;
					
			//		console.log(a.conf6.won/a.conf6.lost);
					
					bestRecord = Math.max(a.conf1.won/a.conf1.lost, a.conf2.won/a.conf2.lost,a.conf3.won/a.conf3.lost,a.conf4.won/a.conf4.lost,a.conf5.won/a.conf5.lost,a.conf6.won/a.conf6.lost);
					if (a.conf1.won/a.conf1.lost == bestRecord) {
						teams[a.conf1.tid].bestRecord++;
					} 
					if (a.conf2.won/a.conf2.lost == bestRecord) {
						teams[a.conf2.tid].bestRecord++;
					} 
					if (a.conf3.won/a.conf3.lost == bestRecord) {
						teams[a.conf3.tid].bestRecord++;
					} 								
					if (a.conf4.won/a.conf4.lost == bestRecord) {
						teams[a.conf4.tid].bestRecord++;
					} 				
					if (a.conf5.won/a.conf5.lost == bestRecord) {
						teams[a.conf5.tid].bestRecord++;
					} 				
					if (a.conf6.won/a.conf6.lost == bestRecord) {
						teams[a.conf6.tid].bestRecord++;
					} 								
				} else {
					teams[a.conf1.tid].bestRecordConf++;			
				//	teams[a.conf2.tid].bestRecordConf++;
				//	teams[a.conf3.tid].bestRecordConf++;
					teams[a.conf1.tid].bestRecord++;			
					
					teams[a.conf4.tid].bestRecordConf++;			
					teams[a.conf4.tid].bestRecord++;				
					teams[a.conf7.tid].bestRecordConf++;			
					teams[a.conf7.tid].bestRecord++;				
					teams[a.conf10.tid].bestRecordConf++;			
					teams[a.conf10.tid].bestRecord++;				
					teams[a.conf13.tid].bestRecordConf++;			
					teams[a.conf13.tid].bestRecord++;				
					teams[a.conf16.tid].bestRecordConf++;			
					teams[a.conf16.tid].bestRecord++;				
					
				}				
							
				
			} else {
				//console.log(teams);
				if (a.bestRecordConfs) {
					for (const t of a.bestRecordConfs) {
						teams[t.tid].bestRecordConf++;
					}
				}
			//	console.log(a);
				if (a.bestRecord) {
					teams[a.bestRecord.tid].bestRecord++;
				}
			//	console.log(a);
				if (g.gameType >= 6) {
							//		console.log(a);
					if (a.bestRecordConfsSpring) {									
						for (const t of a.bestRecordConfsSpring) {
							teams[t.tid].bestRecordConf++;
						}
					}
					//console.log(a);
					if (a.bestRecordSpring) {
						teams[a.bestRecordSpring.tid].bestRecord++;				
					}
				}
						//		console.log(a);
//				for (let i = 0; i < a.allRookie.length; i++) {
	//				teams[a.allRookie[i].tid].allRookie++;
		//		}
			}
			//console.log("276");
			if (a.allLeague) {
				for (let i = 0; i < a.allLeague.length; i++) {
					for (const p of a.allLeague[i].players) {
						teams[p.tid].allLeague[i]++;
						teams[p.tid].allLeagueTotal++;
					}
				}
			}
					
		//	console.log("284");
		//	for (let i = 0; i < a.allDefensive.length; i++) {
			///	for (const p of a.allDefensive[i].players) {
				//	teams[p.tid].allDefense[i]++;
//					teams[p.tid].allDefenseTotal++;
	//			}
		//	}

		});
	}
//	console.log(teams);

	return teams;
}

function sumRecordsFor(group, id, name, records) {
    const except = ['id', 'lastChampionship', 'lastPlayoffAppearance', 'team', 'cid', 'did', 'winp','country','teamConf'];
    const keys = Object.keys(records[0]);
    const out = {};

    const xRecords = records.filter(r => r[group] === id);

	console.log(group);
	console.log(id);
	console.log(name);
	console.log(records);	
	
	
    for (const k of keys) {
        if (except.includes(k)) {
            out[k] = null;
        } else {
            out[k] = xRecords.reduce((a, b) => a + Number(b[k]), 0);
        }
    }
    out.id = id;
    out.team = name;
    out.winp = String(out.won / (out.won + out.lost));
    out.winp = out.won > 0 ? (Number(out.won) / (Number(out.won) + Number(out.lost))).toFixed(3) : '0.000';
	console.log(out);
    return out;
}

async function updateTeamRecords(
    inputs: {byType: string},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || inputs.byType !== state.byType) {
        const [teams, awards] = await Promise.all([
            idb.getCopies.teamsPlus({
                attrs: ["tid", "cid", "did", "abbrev", "region", "name","country"],
                seasonAttrs: ["season", "playoffRoundsWon", "playoffRoundsWonWorlds","won", "lost","cidStart","cidMid","levelStart","levelMid","wonSpring","lostSpring","wonSummer","lostSummer","pointsSummer"],
            }),
            idb.getCopies.awards(),
        ]);
		//console.log(awards);
        const awardsPerTeam = tallyAwards(awards);
        const teamRecords = [];
        for (let i = 0; i < teams.length; i++) {
            teamRecords.push(getTeamRecord(teams[i], awardsPerTeam));						
        }
        const seasonCount = teamRecords.map(tr => tr.championships).reduce((a, b) => Number(a) + Number(b));

        let display;
        let displayName;
        if (inputs.byType === "team") {
            display = teamRecords;
            displayName = "Team";
        } else if (inputs.byType === "conf") {
            display = g.confs.map(conf => sumRecordsFor('cid', conf.cid, conf.name, teamRecords));
            displayName = "Conference";
			console.log(display);
			console.log(g.confs);			
      /*  } else {
            display = g.divs.map(div => sumRecordsFor('did', div.did, div.name, teamRecords));
            displayName = "Division";*/
        }
			console.log(display);
			console.log(displayName);
			console.log(seasonCount);
			console.log(inputs.byType);

        return {
            teamRecords: display,
            displayName,
            seasonCount,
            byType: inputs.byType,
			gameType: g.gameType,
        };
    }
}

export default {
    runBefore: [updateTeamRecords],
};
