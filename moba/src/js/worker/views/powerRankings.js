import {g} from '../../common';
import {idb} from '../db';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updatePowerRankings(
    inputs: teamsConferences,
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('gameSim') || inputs.teamsConferences !== state.teamsConferences) {

        const [teams, players] = await Promise.all([
            idb.getCopies.teamsPlus({
				attrs: ["tid", "abbrev", "region", "name","did","cid","country"],
				seasonAttrs: ["won", "lost", "lastTen"],
				stats: ["gp", "pts", "oppPts", "fg","fga","fgp","pf","oppTw","kda"],
                season: g.season,
            }),
            idb.cache.players.indexGetAll('playersByTid', [0, Infinity]),
        ]);

		var  playerValuesByTid,playerRolesByTid, playerValuesMMRByTid,playerRolesMMRByTid;
		var ADC,TOP,JGL,MID,SUP;
		var weightsPosition;
		// Array of arrays, containing the values for each player on each team
		playerValuesByTid = [];
		playerRolesByTid = [];
		playerValuesMMRByTid = [];
		playerRolesMMRByTid = [];

	//	console.log(teams);
		for (let i = 0; i < g.numTeams; i++) {
			playerValuesByTid[i] = [];
			playerRolesByTid[i] = [];
			playerValuesMMRByTid[i]  = [];
			playerRolesMMRByTid[i]  = [];
			teams[i].talent = 0;
			teams[i].talentMMR = 0;
			teams[i].numPlayers = 0;

		}


		//playerValuesByTid[i].sort((a, b) => b - a);
		 players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });

		for (let i = 0; i < players.length; i++) {
			playerValuesByTid[players[i].tid].push(players[i].valueNoPot);
			playerRolesByTid[players[i].tid].push(players[i].pos);

		}

		const weights = [2.4, 2.2, 2.0, 1.8, 1.6];
		for (let i = 0; i < playerValuesByTid.length; i++) {

			teams[i].numPlayers = playerValuesByTid[i].length;
			//playerValuesByTid[i].sort((a, b) => b - a);

			ADC = false;
			TOP = false;
			JGL = false;
			MID = false;
			SUP = false;
			weightsPosition = 0;

			for (let j = 0; j < playerValuesByTid[i].length; j++) {
				if (weightsPosition < weights.length) {
					if  ( ((playerRolesByTid[i][j]== "ADC") && (!ADC)) || ((playerRolesByTid[i][j]== "TOP") && (!TOP)) || ((playerRolesByTid[i][j]== "JGL") && (!JGL)) || ((playerRolesByTid[i][j]== "MID") && (!MID)) || ((playerRolesByTid[i][j]== "SUP") && (!SUP))) {
					//	console.log(weights[weightsPosition]+" "+i+" "+playerValuesByTid[i][j]+" "+playerRolesByTid[i][j]);
						teams[i].talent += weights[weightsPosition] * playerValuesByTid[i][j];
						weightsPosition += 1;

						if (playerRolesByTid[i][j] == "ADC") {
							ADC = true;
						}
						if (playerRolesByTid[i][j] == "TOP") {
							TOP = true;
						}
						if (playerRolesByTid[i][j] == "JGL") {
							JGL = true;
						}
						if (playerRolesByTid[i][j] == "MID") {
							MID = true;
						}
						if (playerRolesByTid[i][j] == "SUP") {
							SUP = true;
						}
					}
				}
			}
		}

		if (players[0].valueMMR == undefined) {
			 players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });
			// TALENT
			// Get player values and sort by tid
			for (let i = 0; i < players.length; i++) {
				playerValuesMMRByTid[players[i].tid].push(players[i].valueNoPot);
				playerRolesMMRByTid[players[i].tid].push(players[i].pos);
			}

		} else {
			 players.sort(function (a, b) { return b.valueMMR - a.valueMMR; });
			// TALENT
			// Get player values and sort by tid
			for (let i = 0; i < players.length; i++) {
				playerValuesMMRByTid[players[i].tid].push(players[i].valueMMR);
				playerRolesMMRByTid[players[i].tid].push(players[i].pos);
			}
		}

		for (let i = 0; i < playerValuesMMRByTid.length; i++) {
			ADC = false;
			TOP = false;
			JGL = false;
			MID = false;
			SUP = false;
			weightsPosition = 0;

			for (let j = 0; j < playerValuesMMRByTid[i].length; j++) {
				if (weightsPosition < weights.length) {
					//console.log(i+" "+j+" "+playerValuesMMRByTid[i][j]+" "+playerRolesMMRByTid[i][j]+" "+weights.length+" "+weightsPosition);

					if  ( ((playerRolesMMRByTid[i][j]== "ADC") && (!ADC)) || ((playerRolesMMRByTid[i][j]== "TOP") && (!TOP)) || ((playerRolesMMRByTid[i][j]== "JGL") && (!JGL)) || ((playerRolesMMRByTid[i][j]== "MID") && (!MID)) || ((playerRolesMMRByTid[i][j]== "SUP") && (!SUP))) {
						teams[i].talentMMR += weights[weightsPosition] * playerValuesMMRByTid[i][j];
						weightsPosition += 1;

						if (playerRolesMMRByTid[i][j] == "ADC") {
							ADC = true;
						}
						if (playerRolesMMRByTid[i][j] == "TOP") {
							TOP = true;
						}
						if (playerRolesMMRByTid[i][j] == "JGL") {
							JGL = true;
						}
						if (playerRolesMMRByTid[i][j] == "MID") {
							MID = true;
						}
						if (playerRolesMMRByTid[i][j] == "SUP") {
							SUP = true;
						}
					}
				}
			}
		}

        // PERFORMANCE
        for (let i = 0; i < g.numTeams; i++) {
            playerValuesByTid[i] = [];
            // Modulate point differential by recent record: +5 for 10-0 in last 10 and -5 for 0-10
            //teams[i].performance = teams[i].stats.diff - 5 + 5 * (parseInt(teams[i].seasonAttrs.lastTen.split("-")[0], 10)) / 10;

			teams[i].diff = (teams[i].stats.pf - teams[i].stats.oppTw);
			teams[i].performance = (teams[i].stats.pf - teams[i].stats.oppTw);

        }

        // RANKS
        teams.sort((a, b) => b.talent - a.talent);
        for (let i = 0; i < teams.length; i++) {
            teams[i].talentRank = i + 1;
        }

        teams.sort((a, b) => b.talentMMR - a.talentMMR);
//		teams.sort(function (a, b) { return b.talentMMR - a.talentMMR; });
		for (let i = 0; i < teams.length; i++) {
			teams[i].talentRankMMR = i + 1;
		}

        teams.sort((a, b) => b.performance - a.performance);
        for (let i = 0; i < teams.length; i++) {
            teams[i].performanceRank = i + 1;
        }

		// OVERALL RANK
		// Weighted average depending on GP
		const overallRankMetric = t => {

			if (t.stats.gp == 4) {
				return t.performanceRank * 4  + 2 * t.talentRank;
			}
			if (t.stats.gp == 3) {
				return t.performanceRank * 3  + 3 * t.talentRank;
			}
			if (t.stats.gp == 2) {
				return t.performanceRank * 2  + 4 * t.talentRank;
			}
			if (t.stats.gp == 1) {
				return t.performanceRank * 1  + 5 * t.talentRank;
			}
			if (t.stats.gp == 0) {
				return  6 * t.talentRank;
			}

			return t.performanceRank * 4 + t.talentRank * 2;
		};


        teams.sort((a, b) => overallRankMetric(a) - overallRankMetric(b));
        for (let i = 0; i < teams.length; i++) {
            teams[i].overallRank = i + 1;
			teams[i].teamConf = g.confs[teams[i].cid].name;
        }

       // convert to conference data using a dropdown?
    //   console.log(teams);
       let conferences = [];
       for (let i = 0; i < g.confs.length; i++) {
         conferences.push({teams:0,talent:0,talentMMR:0,cid:i});
       }

// really just about talent, since performance is within conference
       for (let i = 0; i < teams.length; i++) {
          conferences[teams[i].cid].teams+=1;
          conferences[teams[i].cid].talent+= teams[i].talent;
          conferences[teams[i].cid].talentMMR+= teams[i].talentMMR;
          conferences[teams[i].cid].country = teams[i].country;
       }
       for (let i = 0; i < conferences.length; i++) {
          conferences[i].talent /= conferences[i].teams;
          conferences[i].talentMMR /= conferences[i].teams;
       }
       // RANKS
       conferences.sort((a, b) => b.talent - a.talent);
       for (let i = 0; i < conferences.length; i++) {
           conferences[i].talentRank = i + 1;
       }

       conferences.sort((a, b) => b.talentMMR - a.talentMMR);
   //		teams.sort(function (a, b) { return b.talentMMR - a.talentMMR; });
   for (let i = 0; i < conferences.length; i++) {
     conferences[i].talentRankMMR = i + 1;
   }

       for (let i = 0; i < conferences.length; i++) {
           conferences[i].teamConf = g.confs[conferences[i].cid].name;
       }

        return {
            teams,
            conferences,
            teamsConferences: inputs.teamsConferences,
        };
    }
}

export default {
    runBefore: [updatePowerRankings],
};
