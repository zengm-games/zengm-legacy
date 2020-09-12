// @flow

import {PLAYER, g, helpers} from '../../common';
import {freeAgents, trade} from '../core';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updatePlayer(
    inputs: {pid: number},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || !state.retired || state.pid !== inputs.pid) {
        let p = await idb.getCopy.players({pid: inputs.pid});

		console.log(p);

        if (p === undefined) { throw new Error('Invalid player ID'); }
        p = await idb.getCopy.playersPlus(p, {
            attrs: ["pid", "name", "tid", "abbrev", "teamRegion", "teamName", "age", "hgtFt", "hgtIn", "weight", "born", "diedYear", "contract", "draft", "face", "mood", "injury", "salaries", "salariesTotal", "awardsGrouped", "freeAgentMood", "imgURL", "watch", "gamesUntilTradable", "college"],
            ratings: ["season", "seasonSplit","abbrev", "age","MMR","rank","ovr", "pot", "hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb", "skills", "pos", "region", "languages","languagesGrouped"],
            stats: ["championStats","psid", "season", "seasonSplit", "tid", "abbrev", "age", "gp", "gs", "min", "fg", "fga", "fgp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp", "ft", "fta", "ftp", "pm", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "per", "ewa","oppJM","kda","scTwr","scKills","riftKills","riftAssists","firstBlood"],
//			attrs: ["pid", "name", "tid", "abbrev", "teamRegion", "teamName", "pos", "age", "hgtFt", "hgtIn", "weight", "born", "diedYear", "contract", "draft", "face", "mood", "injury", "salaries", "salariesTotal", "awardsGrouped", "freeAgentMood", "imgURL", "watch","champions","languages", "gamesUntilTradable"],
	//		ratings: ["season", "abbrev", "age","MMR","rank", "ovr", "pot", "hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb", "skills","pos"],
		//	stats: ["psid","season", "tid","abbrev", "age", "pos","gp", "gs", "min", "fg", "fga", "fgp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "per", "ewa","oppJM","kda","scTwr","scKills"],

            playoffs: true,
            showRookies: true,
            fuzz: true,
        });

		console.log(p);
        if (p === undefined) { throw new Error('Invalid player ID'); }

	//	console.log(p);
//		console.log(p.stats[0].championStats);
	///	console.log(p.stats[0].championStats[0]);
		//console.log(p.stats[0].championStats[0].champPicked);
		//console.log(p.stats[0].championStats[0].champPicked);
		//console.log(p.stats);
	/*	console.log(p.ratings);
		console.log(p.ratings[0].languages);
		let languages = p.ratings[0].languages;
		console.log(languages);
		p.ratings[0].languages = [];
		console.log(p.ratings[0].languages);
		p.ratings[0].languages.push(languages[0]);
		console.log(p.ratings[0].languages);
		if (languages[1] != undefined) {
			console.log(p.ratings[0].languages[1]);
		}*/
	//	p.ratings.languages = [];
		//p.ratings.languages.push(languages[0]);
		//if (languages.length > 1 && languages[1] != undefined) {
//			p.ratings.languages.push(", "+languages[1]);
	//	}

		if (p.stats.length > 0 ) {
		//	console.log(p.stats[0]);
			p.championStats = p.stats[p.stats.length-1].championStats;
			//if (p.stats.firstBlood[0] == undefined) {
//				p.stats.firstBlood[0] = 0;
	//			p.stats.riftKills = 0;
		//		p.stats.riftAssists = 0;
				//
			//}
		//	console.log(p.stats);
		//	console.log(p.stats.length);
		//	console.log(p.stats[0].championStats);
		//	console.log(p.stats[p.stats.length-1].championStats);
		//	console.log(p.ratings);

			if (p.championStats.length > 0) {
				for (let i = 0; i < p.championStats.length; i++) {
					p.championStats[i].kda = (p.championStats[i].fg+p.championStats[i].fgp)/p.championStats[i].fga;
					p.championStats[i].winP = p.championStats[i].won/p.championStats[i].gp*100;
					p.championStats[i].fg = p.championStats[i].fg/p.championStats[i].gp;
					p.championStats[i].fga = p.championStats[i].fga/p.championStats[i].gp;
					p.championStats[i].fgp = p.championStats[i].fgp/p.championStats[i].gp;
					p.championStats[i].tp = p.championStats[i].tp/p.championStats[i].gp;
					p.championStats[i].min = p.championStats[i].min/p.championStats[i].gp;
				}
			}
		} else {
			p.championStats = [];
		}
		//console.log(p.salaries);
		//console.log(p.championStats);
		//console.log(p.championStats[0].champPicked);
        // Account for extra free agent demands
        if (p.tid === PLAYER.FREE_AGENT) {
			if (p.born.loc == g.teamCountryCache[g.userTid]) {
			} else {
				p.contract.amount *= 2;
				p.contract.amount += 25;
			}
			console.log(p.contract.amount);
            p.contract.amount = freeAgents.amountWithMood(p.contract.amount, p.freeAgentMood[g.userTid]);
			console.log(p.contract.amount);

        }

        let events = await idb.getCopies.events({pid: inputs.pid});

        const feats = events.filter(event => event.type === "playerFeat").map(event => {
            return {
                eid: event.eid,
                season: event.season,
                text: event.text,
            };
        });

        events = events.filter(event => {
            return !(event.type === "award" || event.type === "injured" || event.type === "healed" || event.type === "hallOfFame" || event.type === "playerFeat" || event.type === "tragedy");
        }).map(event => {
            return {
                eid: event.eid,
                season: event.season,
                text: event.text,
            };
        });

        // Add untradable property
        p = trade.filterUntradable([p])[0];
        events.forEach(helpers.correctLinkLid);
        feats.forEach(helpers.correctLinkLid);

        return {
            player: p,
            showTradeFor: p.tid !== g.userTid && p.tid >= 0,
            freeAgent: p.tid === PLAYER.FREE_AGENT,
            retired: p.tid === PLAYER.RETIRED,
            showContract: p.tid !== PLAYER.UNDRAFTED && p.tid !== PLAYER.UNDRAFTED_2 && p.tid !== PLAYER.UNDRAFTED_3 && p.tid !== PLAYER.UNDRAFTED_FANTASY_TEMP && p.tid !== PLAYER.RETIRED,
            injured: p.injury.type !== "Healthy",
            godMode: g.godMode,
            events,
            feats,
        };
    }
}

export default {
    runBefore: [updatePlayer],
};
