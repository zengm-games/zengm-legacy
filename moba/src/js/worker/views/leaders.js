// @flow

import {PHASE, PLAYER, g, helpers} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateLeaders(
    inputs: {season: number},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    // Respond to watchList in case players are listed twice in different categories
    if (updateEvents.includes('watchList') || (inputs.season === g.season && updateEvents.includes('gameSim')) || inputs.season !== state.season) {
        // Calculate the number of games played for each team, which is used later to test if a player qualifies as a league leader
        const teamSeasons = await idb.getCopies.teamSeasons({season: inputs.season});
        const gps = teamSeasons.map(teamSeason => {
            // Don't count playoff games
            if (teamSeason.gp > g.numGames) {
                return g.numGames;
            }
            return teamSeason.gp;
        });

    /*const teams = helpers.orderByWinp(await idb.getCopies.teamsPlus({
        attrs: ["tid", "cid"],
        seasonAttrs: ["won", "lost", "winp"],
        season: g.season,
    }));		*/
    const teams = await idb.getCopies.teamsPlus({
        attrs: ["tid", "cid"],
        seasonAttrs: ["won", "lost", "winp"],
        season: g.season,
    });

	// could just not sort above
    teams.sort((a, b) => a.tid - b.tid);

        let players;
        if (g.season === inputs.season && g.phase <= g.PHASE.PLAYOFFS) {
            players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
        } else {
            //players = await idb.getCopies.players({activeSeason: inputs.season});
            players = await idb.getCopies.players();
        }
        players = await idb.getCopies.playersPlus(players, {
            attrs: ["pid", "tid", "name","firstName", "lastName", "userID", "injury", "watch"],
            ratings: ["skills"],
            stats: ["pts", "trb", "ast", "fgp", "tpp", "ftp", "blk", "stl", "min", "per", "ewa", "gp", "fg", "tp", "ft", "abbrev", "tid","kda"],
            season: inputs.season,
        });

        const userAbbrev = helpers.getAbbrev(g.userTid);

        // minStats and minValues are the NBA requirements to be a league leader for each stat http://www.nba.com/leader_requirements.html. If any requirement is met, the player can appear in the league leaders
//        const factor = (g.numGames / 82) * Math.sqrt(g.quarterLength / 12); // To handle changes in number of games and playing time
        const factor = (g.numGames / 20) ; // To handle changes in number of games and playing time
        const categories = [];
                categories.push({name: "Kills", stat: "K", title: "Kills Per Game", data: [], minStats: ["gp", "fg"], minValue: [16, 0]});
                //categories.push({name: "Deaths", stat: "Reb", title: "Rebounds Per Game", data: [], minStats: ["gp", "fga"], minValue: [16, 0]});
                categories.push({name: "Assists", stat: "A", title: "Assists Per Game", data: [], minStats: ["gp", "fgp"], minValue: [16, 0]});
                categories.push({name: "Creep Score", stat: "CS", title: "Creep Score Per Game", data: [], minStats: ["gp","tp"], minValue: [16, 0]});
                categories.push({name: "KDA", stat: "KDA", title: "KDA", data: [], minStats: ["gp","tp"], minValue: [16, 0]});

		const stats = ["fg", "fgp", "tp","kda"];

        for (let i = 0; i < categories.length; i++) {
            players.sort((a, b) => b.stats[stats[i]] - a.stats[stats[i]]);
            for (let j = 0; j < players.length; j++) {
                // Test if the player meets the minimum statistical requirements for this category
                let pass = false;
                for (let k = 0; k < categories[i].minStats.length; k++) {
                    // Everything except gp is a per-game average, so we need to scale them by games played
                    let playerValue;
                    if (categories[i].minStats[k] === "gp") {
                        playerValue = players[j].stats[categories[i].minStats[k]];
                    } else {
                        playerValue = players[j].stats[categories[i].minStats[k]] * players[j].stats.gp;
                    }

                    // Compare against value normalized for team games played
//                    if (playerValue >= Math.ceil(categories[i].minValue[k] * factor * gps[players[j].stats.tid] / g.numGames)) {
                    if (playerValue >= Math.ceil(categories[i].minValue[k] * factor * gps[players[j].stats.tid] / 20)) {

						if (g.gameType == 1) {
							if (players[j].tid >= 0) {
								if (teams[players[j].tid].cid == 0) {
				//				if (teams[players[i].tid].cid == 0) {
									pass = true;
									break;  // If one is true, don't need to check the others
								} else {

								}
							}
						} else if (g.gameType == 7) {
							if (players[j].tid >= 0) {

								if (teams[players[j].tid].cid == 0 || teams[players[j].tid].cid == 3 || teams[players[j].tid].cid == 6 || teams[players[j].tid].cid == 9 || teams[players[j].tid].cid == 12 || teams[players[j].tid].cid == 15) {
				//				if (teams[players[i].tid].cid == 0) {
				//	console.log(players[j].stats.tid+" "+players[j].tid+" "+teams[players[j].tid].cid );
									pass = true;
									break;  // If one is true, don't need to check the others
								} else {
								}
							}
					//		inLCS = true;		// need to update once ladder is in place
						} else {
							pass = true;
							break;  // If one is true, don't need to check the others
						}
						//	pass = true;
						//	break;  // If one is true, don't need to check the others


                    }
                }

                if (pass) {
					console.log(players[j]);
					players[j].name = `${players[j].userID}`;
                    const leader = helpers.deepCopy(players[j]);
                    leader.stat = leader.stats[stats[i]];
                    leader.abbrev = leader.stats.abbrev;
                    delete leader.stats;
                    if (userAbbrev === leader.abbrev) {
                        leader.userTeam = true;
                    } else {
                        leader.userTeam = false;
                    }
                    categories[i].data.push(leader);
                }

                // Stop when we found 10
                if (categories[i].data.length === 10) {
                    break;
                }
            }

            delete categories[i].minStats;
            delete categories[i].minValue;
        }

        return {
            categories,
            season: inputs.season,
        };
    }
}

export default {
    runBefore: [updateLeaders],
};
