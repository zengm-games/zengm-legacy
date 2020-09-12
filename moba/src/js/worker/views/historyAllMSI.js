// @flow

import {g} from '../../common';
import {idb} from '../db';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateHistoryMSI(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun')) {
        const [awards, teams] = await Promise.all([
            idb.getCopies.awards(),
            idb.getCopies.teamsPlus({
                attrs: ["tid", "abbrev", "region", "name"],
                seasonAttrs: ["season",
				"playoffRoundsWonMSI",
				"playoffRoundsWonNALCS",
				"playoffRoundsWonEULCS",
				"playoffRoundsWonLCK",
				"playoffRoundsWonLPL",
				"playoffRoundsWonLMS",
				"playoffRoundsWonNALCSPr",
				"playoffRoundsWonNACSPrA",
				"playoffRoundsWonNACSPrB",
				"playoffRoundsWonMSIGr",
				"playoffRoundsWonMSIPlayIn",
				"playoffRoundsWonNALCSStay",
				"playoffRoundsWonNACSStay",
				"playoffRoundsWonNALadderStay",
				"ladderCSLCS",
				"ladderCSLCSStart",
				"pointsSpring",
				"pointsSummer",
				"won", "lost"],
            }),
        ]);


		// how to handle?
		// only want one award line for year.
		// create for MSI, not for worlds then
        const seasons = awards.map(a => {
            return {
                season: a.season,
           //     finalsMvp: a.finalsMvp,
//                mvp: a.mvp,
  //              dpoy: a.dpoy,
    //            roy: a.roy,
	            knockout1Found: false,
	            knockout2Found: false,
	            knockout1: undefined,
                knockout2: undefined,
                runnerUp: undefined,
                champ: undefined,
            };
        });

	//	console.log(seasons);

		//var knockout1 = false;
        teams.forEach(t => {
            // t.seasonAttrs has same season entries as the "seasons" array built from awards
			var champRounds,runnerupRounds,knockoutRounds;

            for (let i = 0; i < seasons.length; i++) {
                // Find corresponding entries in seasons and t.seasonAttrs. Can't assume they are the same because they aren't if some data has been deleted (Delete Old Data)
                let found = false;
                let j;
                for (j = 0; j < t.seasonAttrs.length; j++) {
                    if (t.seasonAttrs[j].season === seasons[i].season) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    continue;
                }



				champRounds = 2;
				runnerupRounds = 1;
				/*if (g.gameType == 0) {
					champRounds = 3;
					runnerupRounds = 2;
				} else if (g.gameType == 1) {
					champRounds = 27;
					runnerupRounds = 26;
				} else if (g.gameType == 2) {
					champRounds = 4;
					runnerupRounds = 3;
				} else if (g.gameType == 3) {
					champRounds = 6;
					runnerupRounds = 5;
				} else if (g.gameType == 4) {
					champRounds = 3;
					runnerupRounds = 2;
				} else if (g.gameType == 5) {
					champRounds = 6;
					runnerupRounds = 5;
				} else*/
				if (g.gameType >= 6) {
				///	champRounds = 5;
				//	runnerupRounds = 4;
				//	knockoutRounds = 3;
			//	} else {
					// type 7
					// what are the new ones?
					champRounds = 2;
					runnerupRounds = 1;
					knockoutRounds = 0;
				}

			//	console.log(t.tid+" "+t.name+" spring: "+
				//				t.seasonAttrs[j].pointsSpring +" summer:"+
				//				t.seasonAttrs[j].pointsSummer +" "+
						//		t.seasonAttrs[j].playoffRoundsWon +" "+
					//			t.seasonAttrs[j].playoffRoundsWonMSI
						/////////		t.seasonAttrs[j].ladderCSLCSStart+" "+
							//	t.seasonAttrs[j].playoffRoundsWonEULCS+" "
								//t.seasonAttrs[j].playoffRoundsWonLCK+" "
								//t.seasonAttrs[j].playoffRoundsWonLPL+" " +
								//t.seasonAttrs[j].playoffRoundsWonLMS+" "
					//			t.seasonAttrs[j].playoffRoundsWonNALCSPr+" "+
//								t.seasonAttrs[j].playoffRoundsWonNACSPrA+" "+
	//							t.seasonAttrs[j].playoffRoundsWonNACSPrB+" "
					//			t.seasonAttrs[j].playoffRoundsWonMSIGr+" "+
							//	t.seasonAttrs[j].playoffRoundsWonMSIPlayIn+" "
							////////	t.seasonAttrs[j].ladderCSLCS
								//t.seasonAttrs[j].playoffRoundsWonNACSStay+" "+
								//t.seasonAttrs[j].playoffRoundsWonNALadderStay
						//	);
//                if (t.seasonAttrs[j].playoffRoundsWonMSI === g.numPlayoffRounds) {
                if (t.seasonAttrs[j].playoffRoundsWonMSI === champRounds) {
                    seasons[i].champ = {
                        tid: t.tid,
                        abbrev: t.abbrev,
                        region: t.region,
                        name: t.name,
                        won: t.seasonAttrs[j].won,
                        lost: t.seasonAttrs[j].lost,
                        count: 0,
                    };
//                } else if (t.seasonAttrs[j].playoffRoundsWonMSI === g.numPlayoffRounds - 1) {
                } else if (t.seasonAttrs[j].playoffRoundsWonMSI === runnerupRounds) {
                    seasons[i].runnerUp = {
                        tid: t.tid,
                        abbrev: t.abbrev,
                        region: t.region,
                        name: t.name,
                        won: t.seasonAttrs[j].won,
                        lost: t.seasonAttrs[j].lost,
                    };
                } else if (t.seasonAttrs[j].playoffRoundsWonMSI === knockoutRounds && seasons[i].knockout1Found == false) {
					seasons[i].knockout1Found = true;
                    seasons[i].knockout1 = {
                        tid: t.tid,
                        abbrev: t.abbrev,
                        region: t.region,
                        name: t.name,
                        won: t.seasonAttrs[j].won,
                        lost: t.seasonAttrs[j].lost,
                    };
                } else if (t.seasonAttrs[j].playoffRoundsWonMSI === knockoutRounds && seasons[i].knockout1Found == true  && seasons[i].knockout2Found == false) {
					seasons[i].knockout2Found = true;
                    seasons[i].knockout2 = {
                        tid: t.tid,
                        abbrev: t.abbrev,
                        region: t.region,
                        name: t.name,
                        won: t.seasonAttrs[j].won,
                        lost: t.seasonAttrs[j].lost,
                    };
                }
            }
        });

        // Count up number of championships per team
        const championshipsByTid = [];
        for (let i = 0; i < g.numTeams; i++) {
            championshipsByTid.push(0);
        }
        for (let i = 0; i < seasons.length; i++) {
            if (seasons[i].champ) {
                championshipsByTid[seasons[i].champ.tid] += 1;
                seasons[i].champ.count = championshipsByTid[seasons[i].champ.tid];
            }
        }

		console.log(seasons);
		console.log(g.userTid);
        return {
            seasons,
        };
    }
}

export default {
    runBefore: [updateHistoryMSI],
};
