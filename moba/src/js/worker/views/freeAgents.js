// @flow

import {PLAYER, g} from '../../common';
import {freeAgents, player, team} from '../core';
import {idb} from '../db';
import {lock} from '../util';

async function updateFreeAgents(): void | {[key: string]: any} {
    const payroll = (await team.getPayroll(g.userTid))[0];
    let [userPlayers, players] = await Promise.all([
        idb.cache.players.indexGetAll('playersByTid', g.userTid),
        idb.cache.players.indexGetAll('playersByTid', PLAYER.FREE_AGENT),
    ]);

    const capSpace = g.salaryCap > payroll ? (g.salaryCap - payroll) / 1000 : 0;

    players = await idb.getCopies.playersPlus(players, {
		attrs: ["pid", "name", "age","born", "contract", "freeAgentMood", "injury", "watch","languages"],
//        attrs: ["pid", "name", "age", "contract", "freeAgentMood", "injury", "watch"],
		//ratings: ["MMR","ovr", "pot", "skills"],
        ratings: ["MMR","ovr", "pot", "skills", "pos","languages","languagesGrouped"],
		stats: ["min", "pts", "trb", "ast", "per","tp","fg","fga","fgp","kda"],
//        stats: ["min", "pts", "trb", "ast", "per"],
        season: g.season,
        showNoStats: true,
        showRookies: true,
        fuzz: true,
        oldStats: true,
    });

    for (const p of players) {
		//if (p.contract.amount> 200) {
			//console.log(p.contract.amount);
			//console.log(p);
			//console.log( p.freeAgentMood[g.userTid]);
		//}
        p.contract.amount = freeAgents.amountWithMood(p.contract.amount, p.freeAgentMood[g.userTid]);
		//if (p.contract.amount> 200) {
			//console.log(p.contract.amount);
			//console.log(p);
			//console.log( p.freeAgentMood[g.userTid]);
		//}
        p.mood = player.moodColorText(p);
		if (p.born.loc == g.teamCountryCache[g.userTid]) {
		} else {
			p.contract.amount *= 2;
			p.contract.amount += 25;
		}
		//console.log(p.contract.amount+" "+p.freeAgentMood[g.userTid]);

	//	if (p.contract.amount> 200) {
		//	console.log(p.contract.amount);
			//console.log(p);
			//console.log( p.freeAgentMood[g.userTid]);
		//}

	/*	if (players[i].freeAgentMood[g.userTid] == undefined) {
			players[i].freeAgentMood[g.userTid] = 0;
		}
		players[i].contract.amount = freeAgents.amountWithMood(players[i].contract.amount, players[i].freeAgentMood[g.userTid]);
			//console.log(players[i].contract.amount);
		if (players[i].born.loc == g.teamCountryCache[g.userTid]) {
		//	contractAmount = players[i].contract.amount;
			//console.log(contractAmount);
		} else {
			players[i].contract.amount *= 2;
			players[i].contract.amount += 25;

		}
		players[i].mood = player.moodColorText(players[i]);
		if (players[i].ratings.MMR == undefined) {
			players[i].ratings.MMR = "";
		}*/
    }
    let maxRosterSize = 10;
    if (g.maxRosterSize != undefined) {
      maxRosterSize = g.maxRosterSize;
    }
    return {
        capSpace,
        gamesInProgress: lock.get('gameSim'),
        minContract: g.minContract,
        numRosterSpots: maxRosterSize - userPlayers.length,
        phase: g.phase,
        players,
    };
}

export default {
    runBefore: [updateFreeAgents],
};
