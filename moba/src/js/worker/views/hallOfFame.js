// @flow

import {PHASE, g} from '../../common';
import {idb} from '../db';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updatePlayers(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || (updateEvents.includes('newPhase') && g.phase === PHASE.BEFORE_DRAFT)) {
        let players = await idb.getCopies.players({retired: true});
        players = players.filter(p => p.hof);
        players = await idb.getCopies.playersPlus(players, {
		//   attrs: ["pid", "name", "pos", "draft", "retiredYear", "statsTids"],
		//	ratings: ["MMR","ovr"],
		//	stats: ["season", "abbrev", "gp", "min", "trb", "ast", "pts", "per", "ewa","tp","fg","fga","fgp","kda"]
					
            attrs: ["pid", "name", "draft", "retiredYear", "statsTids", "awardsGrouped"],
            ratings: ["ovr","MMR","pos"],
            stats: ["season", "abbrev", "tid", "gp", "min", "trb", "ast", "pts", "per", "ewa","tp","fg","fga","fgp","kda"],
            fuzz: true,
        });

		console.log(players);
        // This stuff isn't in idb.getCopies.playersPlus because it's only used here.
        for (const p of players) {
            p.peakOvr = 0;
			p.peakMMR = 0;
            for (const pr of p.ratings) {
                if (pr.ovr > p.peakOvr) {
                    p.peakOvr = pr.ovr;
                }
				if (pr.MMR == undefined) {
					pr.MMR = 0;
				}						
				if (pr.MMR > p.peakMMR) {
					p.peakMMR = pr.MMR;
				}				
				
            }
			if (p.peakMMR  == 0) {
				p.peakMMR  = "";
			}				

            p.bestStats = {};
            let bestEWA = 0;
            p.teamSums = {};
            for (let j = 0; j < p.stats.length; j++) {
                const tid = p.stats[j].tid;
                const EWA = p.stats[j].gp;
                if (EWA > bestEWA) {
                 //   p.bestStats = p.stats[j];
                    bestEWA = EWA;
                }
                if (p.teamSums.hasOwnProperty(tid)) {
                    p.teamSums[tid] += EWA;
                } else {
                    p.teamSums[tid] = EWA;
                }
            }
			
			p.awardsNumber = 0;
            for (let j = 0; j < p.awardsGrouped.length; j++) {
				p.awardsNumber += p.awardsGrouped[j].count;
			}				
			p.bestStats = {
				gp: 0,
				fg: 0,
				fga: 1,
				fgp: 0,
				kda: 0
			};
			for (let j = 0; j < p.stats.length; j++) {
				if (p.stats[j].fga>0 ) {
					if (p.stats[j].gp * ((p.stats[j].fg+p.stats[j].fgp)/p.stats[j].fga ) > p.bestStats.gp * (p.bestStats.fg + p.bestStats.fgp)/p.bestStats.fga) {
						p.bestStats = p.stats[j];
					}
				}
			}			
			
            p.legacyTid = parseInt(Object.keys(p.teamSums).reduce((teamA, teamB) => (p.teamSums[teamA] > p.teamSums[teamB] ? teamA : teamB)), 10);			
        }

		console.log(players);
        return {
            players,
        };
    }
}

export default {
    runBefore: [updatePlayers],
};
