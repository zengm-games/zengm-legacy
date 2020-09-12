// @flow

import {PHASE, g, helpers} from '../../common';
import {season} from '../core';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateMSI(
    inputs: {season: number},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || inputs.season !== state.season || (inputs.season === g.season && updateEvents.includes('gameSim'))) {
        let finalMatchups;
        let series;

		var NAConference,EUConference, LCSConference,LCSExtended,LCKConference,LPLConference,LMSConference,WorldsPlayoff,WorldsSummer,WorldsSpring;

		NAConference = false;
		EUConference = false;
		LCSConference = false;
		LCSExtended = false;
		LCKConference = false;
		LPLConference = false;
		LMSConference = false;
		WorldsPlayoff = false;
		WorldsSpring = false;
		WorldsSummer = false;
		
	//	console.log(	g.gameType);
		if (g.gameType == 0) {
			LCSConference = true;
		} else if ((g.gameType == 1)) {
			LCSConference = true;
			LCSExtended = true;
		} else if (g.gameType == 2) {
			LCKConference = true;
		} else if (g.gameType == 3) {
			LPLConference = true;						
		} else if (g.gameType == 4) {
			LMSConference = true;
		} else if (g.gameType == 5) {
			LCKConference = true;
			LPLConference = true;
			LMSConference = true;
			WorldsPlayoff = true;
		} else if (g.gameType == 6) {
			// spring
			WorldsSpring = true;
		} else {
			// summer
			WorldsSummer = true;
		}			
		
		
        // If in the current season and before playoffs started, display projected matchups
//        if (inputs.season === g.season && ((g.phase < g.PHASE.PLAYOFFS && (g.gameType < 6 || g.seasonSplit == "Summer")) ||  (g.phase < g.PHASE.MSI && (g.seasonSplit == "Spring")))) {
        if (inputs.season === g.season && (g.phase < g.PHASE.MSI && g.seasonSplit == "Spring" && g.gameType >= 6)) {
            const teams = helpers.orderByWinpTowerKDA(await idb.getCopies.teamsPlus({
				attrs: ["tid", "cid", "abbrev", "name"],
				seasonAttrs: ["winp"],
				stats: ["kda","fg","fga","fgp","pf","oppTw"],					
				season: inputs.season,				
            }));
			
			const result = season.genPlayoffSeries(teams);
			console.log(result);
            series = result.series;			
			console.log(series);
			
			
								

			
			finalMatchups = false;
			
        } else {			
			
            const msiSeries = await idb.getCopy.msiSeries({season: inputs.season});
		//	console.log(playoffSeries);			
            series = msiSeries.series;
			//console.log(series);
            finalMatchups = true;
        }



        const confNames = g.confs.map(conf => conf.name);

        // Display the current or archived playoffs
        return {
            finalMatchups,
				NAConference,
				EUConference, 
				LCSConference,
				LCSExtended,
				LCKConference,
				LPLConference,
				LMSConference,
				WorldsPlayoff,										
				WorldsSpring,
				WorldsSummer,
            confNames,
            season: inputs.season,
            series,
        };
    }
}

export default {
    runBefore: [updateMSI],
};
