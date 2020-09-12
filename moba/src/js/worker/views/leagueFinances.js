// @flow

import {g} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateTeams(
    inputs: {season: number},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if ((inputs.season === g.season && (updateEvents.includes('gameSim') || updateEvents.includes('playerMovement'))) || inputs.season !== state.season) {
        const teams = await idb.getCopies.teamsPlus({
            attrs: ["tid", "abbrev", "region", "name"],
           seasonAttrs: ["won", "lost","att", "revenue", "profit", "cash", "payroll", "salaryPaid"],
        //    attrs: ["tid", "abbrev", "region", "name"],
          //  seasonAttrs: ["won", "lost","att", "revenue", "profit", "cash", "payroll", "salaryPaid"],			
           stats: ["gp", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "oppPts", "diff","fgLowPost","fgaLowPost","fgMidRange","oppJM","oppTw","oppInh","kda","scTwr","scKills",'grExpTwr','grExpKills','grGldTwr','grGldKills','tmBuffTwr','tmBuffKills','tmBAdjTwr','tmBAdjKills',
				'TPTwr',
				'TPKills',
				'TwTwr',
				'CKKills',
				'CSTwr',
				'CSKills',
				'AgTwr',
				'AgKills',
				'ChmpnTwr',				
				'ChmpnKills',	
				'oppPts',"oppJM","oppTw","oppInh"
			],
            season: inputs.season,
        });
console.log(teams);
        // Sort stats so we can determine what percentile our team is in.
  const stats = {};
    

        return {
            season: inputs.season,
            stats,
            teams,
        };
    }
}

export default {
    runBefore: [updateTeams],
};
