// @flow

import {g} from '../../common';
import {idb} from '../db';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateHistory(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun')) {
        const [awards, teams] = await Promise.all([
            idb.getCopies.awards(),
            idb.getCopies.teamsPlus({
                attrs: ["tid", "abbrev", "region", "name"],
                seasonAttrs: ["season",
			//	"playoffRoundsWonMSI",
			//	"playoffRoundsWonNALCS",
			//	"playoffRoundsWonEULCS",
			//	"playoffRoundsWonLCK",
			//	"playoffRoundsWonLPL",
			//	"playoffRoundsWonLMS",
			//	"playoffRoundsWonNALCSPr",
			//	"playoffRoundsWonNACSPrA",
			//	"playoffRoundsWonNACSPrB",
			//	"playoffRoundsWonMSIGr",
			//	"playoffRoundsWonMSIPlayIn",
			//	"playoffRoundsWonNALCSStay",
			//	"playoffRoundsWonNACSStay",
			//	"playoffRoundsWonNALadderStay",
			//	"playoffRoundsWonWorldsGr",
			//	"playoffRoundsWonWorldsReg",
				"playoffRoundsWonWorlds",
				"playoffRoundsWon", "won", "lost"],
            }),
        ]);

        const seasons = awards.map(a => {
            return {
                season: a.season,
                finalsMvp: a.finalsMvp,
                mvp: a.mvp,
                dpoy: a.dpoy,
                roy: a.roy,
                runnerUp: undefined,
                champ: undefined,
            };
        });

        teams.forEach(t => {
            // t.seasonAttrs has same season entries as the "seasons" array built from awards
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


				var champRounds,runnerupRounds;
				var actualWon;

				champRounds = 2;
				runnerupRounds = 1;
				if (g.gameType == 0) {
					champRounds = 3;
					runnerupRounds = 2;
				} else if (g.gameType == 1) {
					champRounds = 27;
					runnerupRounds = 26;
				} else if (g.gameType == 2) {
					champRounds = 4;
					runnerupRounds = 3;
				} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
					champRounds = 6;
					runnerupRounds = 5;
				} else if (g.gameType == 3 && (g.yearType == 2019)) {
					champRounds = 4;
					runnerupRounds = 3;
				} else if (g.gameType == 4) {
					champRounds = 3;
					runnerupRounds = 2;
				} else if (g.gameType == 5 ) {
					if (g.yearType == 2019) {
						champRounds = 10;
						runnerupRounds = 9;
					} else {
						champRounds = 6;
						runnerupRounds = 5;
					}
				} else if (g.gameType == 7 || g.gameType == 6) {
					champRounds = 3;
					runnerupRounds = 2;

				}

				if (g.gameType == 7 || g.gameType == 6) {
					actualWon = t.seasonAttrs[j].playoffRoundsWonWorlds;
				} else {
					actualWon = t.seasonAttrs[j].playoffRoundsWon;
				}
				//console.log(t.tid+" "+t.name+" NALCS: "+
								//t.seasonAttrs[j].playoffRoundsWonNALCS+" EULCS: "+
								//t.seasonAttrs[j].playoffRoundsWonEULCS+" LCK: "+
								//t.seasonAttrs[j].playoffRoundsWonLCK+" LPL: "+
								//t.seasonAttrs[j].playoffRoundsWonLPL+" LMS: "+
								//t.seasonAttrs[j].playoffRoundsWonLMS+" NALCSPr"+
								//t.seasonAttrs[j].playoffRoundsWonNALCSPr+" NACSPrA: "+
								//t.seasonAttrs[j].playoffRoundsWonNACSPrA+" NACSPrB: "+
							//	t.seasonAttrs[j].playoffRoundsWonNACSPrB+" WorldsGr: "+
//								t.seasonAttrs[j].playoffRoundsWonWorldsGr +" WorldsReg: "+
			//					t.seasonAttrs[j].playoffRoundsWonWorldsReg+" WonWorlds: "+
						//		t.seasonAttrs[j].playoffRoundsWonWorlds+" "
								//t.seasonAttrs[j].playoffRoundsWonNALCSStay+" "+
								//t.seasonAttrs[j].playoffRoundsWonNACSStay+" "+
								//t.seasonAttrs[j].playoffRoundsWonNALadderStay
							//	);

				//console.log(t.seasonAttrs[j].playoffRoundsWon+" "+champRounds);
//                if (t.seasonAttrs[j].playoffRoundsWon === g.numPlayoffRounds) {
                if (actualWon === champRounds) {
                    seasons[i].champ = {
                        tid: t.tid,
                        abbrev: t.abbrev,
                        region: t.region,
                        name: t.name,
                        won: t.seasonAttrs[j].won,
                        lost: t.seasonAttrs[j].lost,
                        count: 0,
                    };
//                } else if (t.seasonAttrs[j].playoffRoundsWon === g.numPlayoffRounds - 1) {
                } else if (actualWon === runnerupRounds) {
                    seasons[i].runnerUp = {
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
        return {
            seasons,
        };
    }
}

export default {
    runBefore: [updateHistory],
};
