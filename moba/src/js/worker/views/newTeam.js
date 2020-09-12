// @flow

import {g} from '../../common';
import {idb} from '../db';

async function updateTeamSelect(): void | {[key: string]: any} {
    let teams = await idb.getCopies.teamsPlus({
        attrs: ["tid", "region", "name"],
        seasonAttrs: ["winp","winpSpring", "winpSummer"],
        season: g.season,
    });

    // Remove user's team (no re-hiring immediately after firing)
    let userTeam = teams.splice(g.userTid, 1);

    // If not in god mode, user must have been fired
    if (!g.godMode && g.gameOver) {
        // Order by worst record
        teams.sort((a, b) => a.seasonAttrs.winp - b.seasonAttrs.winp);

        // Only get option of 5 worst
        teams = teams.slice(0, 5);
    } else if (!g.godMode) {
		// could better do this to take account LCS, CS, and Ladder.
		// right now good teams can go to bad teams without care for division. 
		let sliceAt = 0;
		// user must have been given offers
        teams.sort((a, b) => a.seasonAttrs.winp - b.seasonAttrs.winp);
//		console.log(teams);				
		for (let t = 0; t < teams.length; t++) {
			if ( (teams[t].seasonAttrs.winp+.4) >= userTeam[0].seasonAttrs.winp) {
				sliceAt = t;
				 break;
			}
		}
        teams = teams.slice(0, sliceAt);		
	}
	let phaseRight = false;
	
	if (g.phase == g.PHASE.BEFORE_DRAFT) {
		phaseRight = true;
	}

	//console.log(phaseRight);
	
    return {
        gameOver: g.gameOver,
        godMode: g.godMode,
		phaseRight: phaseRight,
        teams,
    };
}

export default {
    runBefore: [updateTeamSelect],
};
