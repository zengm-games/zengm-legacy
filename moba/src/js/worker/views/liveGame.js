// @flow

import {g, helpers} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updatePlayByPlay(
    inputs: {fromAction: boolean, gidPlayByPlay: number, playByPlay: any[]},
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') && !inputs.fromAction) {
        return {
            redirectUrl: helpers.leagueUrl(["live"]),
        };
    }

    if (inputs.playByPlay !== undefined && inputs.playByPlay.length > 0) {
		//console.log(inputs.playByPlay.length);
	//	console.log(inputs.playByPlay);
		
        const boxScore: any = helpers.deepCopy(await idb.cache.games.get(inputs.gidPlayByPlay));

        // Stats to set to 0
//        const resetStats = ["min", "fg", "fga", "tp", "tpa", "ft", "fta", "orb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "pm"];
        const resetStats = [ "min","fg", "fga","fgp","fgpAtRim","fgAtRim","fgaAtRim","fgpAtRim","fgLowPost","fgaLowPost", "fgMidRange", "fgaMidRange", "tp", "tpa", "ft", "fta", "orb","drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts","champPicked","oppJM","ban","riftKills","riftAssist"];

		//console.log(boxScore);
	//	console.log(JSON.stringify(boxScore.teams[0].draft));
//		console.log(JSON.stringify(boxScore.teams[0]));
	//	console.log(boxScore.teams[0]);
	//	console.log(boxScore.teams[0].ban);		
		//console.log(boxScore.teams[0].ban[0].ban);		
		//console.log(boxScore.teams[0].ban[1].ban);				
		//console.log(boxScore.teams[0].ban[2].ban);				
		//console.log(boxScore.teams[0].ban[3].ban);				
		//console.log(boxScore.teams[0].ban[4].ban);				
	//	console.log(JSON.stringify(boxScore.teams[0].ban));
		//console.log(JSON.stringify(boxScore.teams[0].ban[0]));		
		//console.log(JSON.stringify(boxScore.teams[0].ban[1]));		
		//console.log(JSON.stringify(boxScore.teams[0].ban[2]));		
		//console.log(JSON.stringify(boxScore.teams[0].ban[3]));		
		//console.log(JSON.stringify(boxScore.teams[0].ban[4]));		
		//console.log(JSON.stringify(boxScore.teams[0].players[0].champPicked));
		//console.log(JSON.stringify(boxScore.teams[0].players[1].champPicked));
		//console.log(JSON.stringify(boxScore.teams[0].players[2].champPicked));
		//console.log(JSON.stringify(boxScore.teams[0].players[3].champPicked));
		//console.log(JSON.stringify(boxScore.teams[0].players[4].champPicked));
        boxScore.overtime = "";
        boxScore.quarter = "1st quarter";
        boxScore.time = "0:00";
        boxScore.gameOver = false;
		//console.log(boxScore);
        for (let i = 0; i < boxScore.teams.length; i++) {
            // Team metadata
            boxScore.teams[i].abbrev = g.teamAbbrevsCache[boxScore.teams[i].tid];
            boxScore.teams[i].region = g.teamRegionsCache[boxScore.teams[i].tid];
            boxScore.teams[i].name = g.teamNamesCache[boxScore.teams[i].tid];

            boxScore.teams[i].ptsQtrs = [0,0,0,0,0,0,0,0];
            for (let s = 0; s < resetStats.length; s++) {
				if (resetStats[s] == "ban") {
				} else {
					boxScore.teams[i][resetStats[s]] = 0;
				}
            }
            for (let j = 0; j < boxScore.teams[i].players.length; j++) {
                // Fix for players who were hurt this game - don't show right away!
                if (boxScore.teams[i].players[j].injury.type !== "Healthy" && boxScore.teams[i].players[j].min > 0) {
                    boxScore.teams[i].players[j].injury = {type: "Healthy", gamesRemaining: 0};
                }

				for (let s = 0; s < resetStats.length; s++) {	
				//	console.log(resetStats[s])
					if (resetStats[s] == "champPicked") {
		//console.log(JSON.stringify(resetStats[s]));						
		//console.log(JSON.stringify(boxScore.teams[i].players[j].champPicked));						
						boxScore.teams[i].players[j][resetStats[s]] = "";
//		console.log(JSON.stringify(boxScore.teams[i].players[j].champPicked));							
					} else if (resetStats[s] == "ban") {
				//console.log(boxScore.teams[i].ban[j].ban);	
						if (j<5) {
						//	console.log(i+" "+j);							
							//console.log(JSON.stringify(boxScore.teams[i]));	
							//console.log(JSON.stringify(boxScore.teams[i].ban));	
							
							//console.log(JSON.stringify(boxScore.teams[i].ban[j][resetStats[s]] ));	
							boxScore.teams[i].ban[j][resetStats[s]]  = "";		
							//console.log(JSON.stringify(boxScore.teams[i].ban[j][resetStats[s]]));							
						}
					} else {
	//	console.log(JSON.stringify(boxScore.teams[0].players[0].champPicked));						
						boxScore.teams[i].players[j][resetStats[s]] = 0;
		//console.log(JSON.stringify(boxScore.teams[0].players[0].champPicked));						
					}						
				}				
				
               // for (let s = 0; s < resetStats.length; s++) {
                 //   boxScore.teams[i].players[j][resetStats[s]] = 0;
                //}

                boxScore.teams[i].players[j].inGame = j < 5;
				if (j>=5) {
					delete boxScore.teams[i].players[j]
				}
            }
       /*     for (let j = 0; j < 5; j++) {			
			//if (resetStats[s] == "ban") {
				// just happens to match number of players at 5
		//		console.log(i+" "+j);
			//	console.log(boxScore.teams[0].ban[0].ban);					
				//console.log(boxScore.teams[i].ban[j].ban);	
				console.log(JSON.stringify(boxScore.teams[i].ban[j].ban));	
				boxScore.teams[i].ban[j].ban == "";		
				console.log(JSON.stringify(boxScore.teams[i].ban[j].ban));					
				//console.log(boxScore.teams[i].ban[j].ban);
		//	}
			}*/
			
        }

        return {
            initialBoxScore: boxScore,
            events: inputs.playByPlay,
        };
    }
}

export default {
    runBefore: [updatePlayByPlay],
};
