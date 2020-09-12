// @flow

import {PHASE, g, helpers} from '../../common';
import {season} from '../core';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updatePlayoffs(
    inputs: {season: number, playoffsTypeSpring: string},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || inputs.season !== state.season || (inputs.season === g.season && updateEvents.includes('gameSim')) ||
		inputs.playoffsTypeSpring !== state.playoffsTypeSpring
	) {


	//	console.log(state);
	//	console.log(inputs);		
        let finalMatchups;
        let series;

		var NAConference,EUConference, LCSConference,LCSExtended,LCKConference,LPLConference,LMSConference,WorldsPlayoff,WorldsSummer,WorldsSpring;
		var NAWorlds, EUWorlds;
		var CSPromo3, CSPromo2;
		var LadderExtended,LadderExtendedMax;
		var bothSplits;
		var WorldsRegionals, WorldsGroups;
		var naLadder,euLadder,lckLadder,lplLadder,lmsLadder,wcLadder;

		var WorldsPlayIn,WorldsGroupPlay,WorldsGroupKnockout,WorldsGroupFinals;

		NAConference = false;
		EUConference = false;
		LCSConference = false;
		LCSExtended = false;
		LCKConference = false;
		LPLConference = false;
		LMSConference = false;
		WorldsPlayoff = false;
		WorldsRegionals = false;
		WorldsGroups = false;
		WorldsSpring = false;
		WorldsSummer = false;
		NAWorlds = false;
		EUWorlds = false;
		CSPromo3 = true;
		CSPromo2 = false;
		LadderExtended = false;
		LadderExtendedMax =  false;
		bothSplits = g.bothSplits;
		naLadder = false;
		euLadder = false;
		lckLadder = false;
		lplLadder = false;
		lmsLadder = false;
		wcLadder = false;
	//	console.log(	g.bothSplits);
	//	console.log(	bothSplits);

		if (g.gameType == 0) {
			LCSConference = true;
		} else if ((g.gameType == 1)) {
			LCSConference = true;
			LCSExtended = true;
			naLadder = true
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
			NAWorlds = true;
			EUWorlds = true;
			LCKConference = true;
			LPLConference = true;
			LMSConference = true;
			WorldsSpring = true;
				WorldsPlayIn = true;
		WorldsGroupPlay = true;
		WorldsGroupKnockout = true;
		WorldsGroupFinals = true;
			CSPromo3 = false;
		} else if (g.gameType == 7) {
			// spring
			NAWorlds = true;
			EUWorlds = true;
			LCKConference = true;
			LPLConference = true;
			LMSConference = true;
			WorldsSpring = true;
					WorldsPlayIn = true;
		WorldsGroupPlay = true;
		WorldsGroupKnockout = true;
		WorldsGroupFinals = true;
			LCSExtended = true;
			CSPromo2 = true;
			CSPromo3 = false;

			LadderExtended = true;
			LadderExtendedMax =  true;
	naLadder = true;
		euLadder = true;
		lckLadder = true;
		lplLadder = true;
lmsLadder = true;
		wcLadder = true;
		} else {
			// summer
			LCKConference = true;
			LPLConference = true;
			LMSConference = true;
			WorldsPlayoff = true;
//			WorldsSummer = true;
		}

		if (inputs.playoffsTypeSpring != "all") {
				LCSConference = false;
				LCKConference = false;
				LPLConference = false;
				LMSConference = false;
				LCSExtended = false;
				LadderExtended = false;
			//	LadderExtendedMax =  false;
				NAWorlds = false;
				EUWorlds = false;
			WorldsSpring = false;
					WorldsPlayIn = false;
		WorldsGroupPlay = false;
		WorldsGroupKnockout = false;
		WorldsGroupFinals = false;
		naLadder = false;
		euLadder = false;
		lckLadder = false;
		lplLadder = false;
lmsLadder = false;
		wcLadder = false;
			CSPromo2 = false;
			CSPromo3 = false;
			if (inputs.playoffsTypeSpring == "msi") {
			WorldsSpring = true;
					WorldsPlayIn = true;
		WorldsGroupPlay = true;
		WorldsGroupKnockout = true;
		WorldsGroupFinals = true;
			} else if (inputs.playoffsTypeSpring == "na") {
				NAWorlds = true;
			} else if (inputs.playoffsTypeSpring == "eu") {
				EUWorlds = true;
			} else if (inputs.playoffsTypeSpring == "lck") {
				LCKConference = true;
			} else if (inputs.playoffsTypeSpring == "lpl") {
				LPLConference = true;
			} else if (inputs.playoffsTypeSpring == "lms") {
				LMSConference = true;
			} else if (inputs.playoffsTypeSpring == "playin") {
				WorldsPlayIn = true;
			} else if (inputs.playoffsTypeSpring == "play") {
				WorldsGroupPlay = true;
			} else if (inputs.playoffsTypeSpring == "knockout") {
				WorldsGroupKnockout = true;
			} else if (inputs.playoffsTypeSpring == "finals") {
				WorldsGroupFinals = true;
			} else if (inputs.playoffsTypeSpring == "promotion") {
				naLadder = true;
				euLadder = true;
				lckLadder = true;
				lplLadder = true;
				lmsLadder = true;
				wcLadder = true;
				LCSExtended = true;
				LadderExtended = true;
				LadderExtendedMax =  true;
		CSPromo2 = true;
			} else if (inputs.playoffsTypeSpring == "naPromotion") {
				naLadder = true;
			//	LCSExtended = true;
			} else if (inputs.playoffsTypeSpring == "euPromotion") {
				euLadder = true;
			} else if (inputs.playoffsTypeSpring == "lckPromotion") {
				lckLadder = true;
			} else if (inputs.playoffsTypeSpring == "lplPromotion") {
				lplLadder = true;
			} else if (inputs.playoffsTypeSpring == "lmsPromotion") {
				lmsLadder = true;
			} else if (inputs.playoffsTypeSpring == "wcPromotion") {
				wcLadder = true;
			}
		}

        // If in the current season and before playoffs started, display projected matchups
//        if (inputs.season === g.season && ((g.phase < g.PHASE.PLAYOFFS && (g.gameType < 6 || g.seasonSplit == "Summer")) ||  (g.phase < g.PHASE.MSI && (g.seasonSplit == "Spring")))) {
//        if (inputs.season === g.season && (g.phase < g.PHASE.MSI && g.seasonSplit == "Spring" && g.gameType >= 6)) {
//        if (inputs.season === g.season && ((g.phase < g.PHASE.MSI && g.seasonSplit == "Spring" && g.gameType >= 6 ) || (g.gameType < 6 && g.phase < g.PHASE.PLAYOFFS))) {
        if (inputs.season === g.season && ((g.phase < g.PHASE.MSI && g.seasonSplit == "Spring" && g.gameType >= 6 ) || (g.gameType < 6))) {

            const teams = helpers.orderByWinpSpringTowerKDA(await idb.getCopies.teamsPlus({
				attrs: ["tid", "cid", "abbrev", "name"],
				seasonAttrs: ["winpSpring"],  // add wins raw to do after percentages for standings/dashborad) as well
				stats: ["kda","fg","fga","fgp","pf","oppTw"],
				season: inputs.season,
            }));

			//const result = season.genPlayoffSeriesMSI(teams);
			const result = season.genPlayoffSeries(teams);

			//console.log(result);
            series = result.series;
			//console.log(series);

			finalMatchups = false;

//        } else if (g.gameType < 6)  {		// fails to mount in those game types

        } else {

            const playoffSeries = await idb.getCopy.msiSeries({season: inputs.season});
			//console.log(playoffSeries);
            series = playoffSeries.seriesMSI;
			//console.log(series);
					/*console.log(series[9][4].home.placement);
					console.log(series[9][4].away.placement);
					console.log(series[9][5].home.placement);
					console.log(series[9][5].away.placement);
					console.log(series[10][2].home.placement);
					console.log(series[10][2].away.placement);					*/
            finalMatchups = true;
        }



        const confNames = g.confs.map(conf => conf.name);

        // Display the current or archived playoffs
		//console.log(series);
		//console.log(g.gameType);
		//console.log(confNames);
		//console.log(inputs);
		//console.log(LCSExtended);
		//console.log(series[0][2]);
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
				NAWorlds,
				EUWorlds,
				CSPromo3,
				CSPromo2,
				LadderExtended,
				LadderExtendedMax,
				bothSplits,

					WorldsPlayIn,
		WorldsGroupPlay,
		WorldsGroupKnockout,
		WorldsGroupFinals,
		naLadder,
		euLadder,
		lckLadder,
		lplLadder,
		lmsLadder,
		wcLadder,

            confNames,
            season: inputs.season,
            series,
           gameType: g.gameType,
			playoffsTypeSpring: inputs.playoffsTypeSpring,
        };
    }
}

export default {
    runBefore: [updatePlayoffs],
};
