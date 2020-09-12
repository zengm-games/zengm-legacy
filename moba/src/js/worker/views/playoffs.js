// @flow

import {PHASE, g, helpers} from '../../common';
import {season} from '../core';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updatePlayoffs(
    inputs: {season: number,  playoffsTypeSummer:  string},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {

		//console.log(state);
		//console.log(inputs);

    if (updateEvents.includes('firstRun') || inputs.season !== state.season || (inputs.season === g.season && updateEvents.includes('gameSim') ||
		inputs.playoffsTypeSummer !== state.playoffsTypeSummer
	)) {
        let finalMatchups;
        let series;


		//console.log(state);
		//console.log(inputs);

		var NAConference,EUConference, LCSConference,LCSExtended,LCKConference,LPLConference,LMSConference,WorldsPlayoff,WorldsSummer,WorldsSpring;
		var NAWorlds, EUWorlds;
		var LadderExtended,LadderExtendedMax, NALCSWorlds, EULCSWorlds;
		var WorldsRegionals, WorldsGroups;
		var naLadder,euLadder,lckLadder,lplLadder,lmsLadder,wcLadder;

		NAConference = false;
		EUConference = false;
		LCSConference = false;
		LCSExtended = false;
		LCKConference = false;
		LPLConference = false;
		LMSConference = false;
		NALCSWorlds = false;
		EULCSWorlds = false;
		WorldsPlayoff = false;
		WorldsRegionals = false;
		WorldsGroups = false;
		WorldsSpring = false;
		WorldsSummer = false;
		LadderExtended = false;
		LadderExtendedMax =  false;
		naLadder = false;
		euLadder = false;
		lckLadder = false;
		lplLadder = false;
		let worlds2019 = false;
		let vietnam = false;
		let sea = false;
		let brazil = false;
		let cis = false;
		let japan = false;
		let latin = false;
		let oce = false;
		let turkey = false;
		let groups1 = false;
		let playoff1 = false;
		let groups2 = false;
		let playoff2 = false;



lmsLadder = false;
		wcLadder = false;
	//	console.log(	g.gameType);
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
		WorldsRegionals = true;
		WorldsGroups = true;
			NALCSWorlds = true;
			EULCSWorlds = true;
			if (g.yearType == "2019") {
				worlds2019 = true;
				vietnam = true;
				sea = true;
				brazil = true;
				cis = true;
				japan = true;
				latin = true;
				oce = true;
				turkey = true;
				groups1 = true;
				playoff1 = true;
				groups2 = true;
				playoff2 = true;
			}
		} else if (g.gameType == 6) {
			// summer
			LCKConference = true;
			LPLConference = true;
			LMSConference = true;
			WorldsPlayoff = true;
		WorldsRegionals = true;
		WorldsGroups = true;
			NALCSWorlds = true;
			EULCSWorlds = true;
//			WorldsSummer = true;
		} else if (g.gameType == 7) {
			// summer
			LCKConference = true;
			LPLConference = true;
			LMSConference = true;
			WorldsPlayoff = true;
		WorldsRegionals = true;
		WorldsGroups = true;
			NALCSWorlds = true;
			EULCSWorlds = true;
//			WorldsSummer = true;
			LCSExtended = true;
			LadderExtended = true;
			LadderExtendedMax =  true;
		naLadder = true;
		euLadder = true;
		lckLadder = true;
		lplLadder = true;
lmsLadder = true;
		wcLadder = true;
		} else {
			// spring
			NAWorlds = true;
			EUWorlds = true;
			LCKConference = true;
			LPLConference = true;
			LMSConference = true;
			WorldsSpring = true;
		}

		if (inputs.playoffsTypeSummer != "all") {
				LCSConference = false;
				LCKConference = false;
				LPLConference = false;
				LMSConference = false;
				LCSExtended = false;
				LadderExtended = false;
			//	LadderExtendedMax =  false;
				NALCSWorlds = false;
				EULCSWorlds = false;
				WorldsPlayoff = false;
		WorldsRegionals = false;
		WorldsGroups = false;
		naLadder = false;
		euLadder = false;
		lckLadder = false;
		lplLadder = false;
				lmsLadder = false;
		wcLadder = false;
				worlds2019 = false;
				vietnam = false;
				sea = false;
				brazil = false;
				cis = false;
				japan = false;
				latin = false;
				oce = false;
				turkey = false;
				groups1 = false;
				playoff1 = false;
				groups2 = false;
				playoff2 = false;
			if (inputs.playoffsTypeSummer == "worlds") {
				WorldsPlayoff = true;
				WorldsGroups = true;
				WorldsRegionals = true;
				if (g.yearType == 2019) {
					groups1 = true;
					playoff1 = true;
					groups2 = true;
					playoff2 = true;
				}
			} else if (inputs.playoffsTypeSummer == "na") {
				NALCSWorlds = true;
			} else if (inputs.playoffsTypeSummer == "eu") {
				EULCSWorlds = true;
			} else if (inputs.playoffsTypeSummer == "lck") {
				LCKConference = true;
			} else if (inputs.playoffsTypeSummer == "lpl") {
				LPLConference = true;
			} else if (inputs.playoffsTypeSummer == "lms") {
				LMSConference = true;
			} else if (inputs.playoffsTypeSummer == "vnm") {
				vietnam = true;
			} else if (inputs.playoffsTypeSummer == "sea") {
				sea = true;
			} else if (inputs.playoffsTypeSummer == "brazil") {
				brazil = true;
			} else if (inputs.playoffsTypeSummer == "cis") {
				cis = true;
			} else if (inputs.playoffsTypeSummer == "japan") {
				japan = true;
			} else if (inputs.playoffsTypeSummer == "latin") {
				latin = true;
			} else if (inputs.playoffsTypeSummer == "oce") {
				oce = true;
			} else if (inputs.playoffsTypeSummer == "turkey") {
				turkey = true;
			} else if (inputs.playoffsTypeSummer == "regionals") {
				WorldsRegionals = true;
			} else if (inputs.playoffsTypeSummer == "groups") {
				WorldsGroups = true;
			} else if (inputs.playoffsTypeSummer == "playoffs") {
				WorldsPlayoff = true;
			} else if (inputs.playoffsTypeSummer == "groups1") {
				groups1 = true;
				WorldsGroups = true;
			} else if (inputs.playoffsTypeSummer == "playin") {
				playoff1 = true;
				WorldsPlayoff = true;
			} else if (inputs.playoffsTypeSummer == "groups2") {
				groups2 = true;
			} else if (inputs.playoffsTypeSummer == "playoffs2") {
				playoff2 = true;

			} else if (inputs.playoffsTypeSummer == "promotion") {
				naLadder = true;
				euLadder = true;
				lckLadder = true;
				lplLadder = true;
				lmsLadder = true;
				wcLadder = true;
				LCSExtended = true;
				LadderExtended = true;
				LadderExtendedMax =  true;
			} else if (inputs.playoffsTypeSummer == "naPromotion") {
				naLadder = true;
			//	LCSExtended = true;
			} else if (inputs.playoffsTypeSummer == "euPromotion") {
				euLadder = true;
			} else if (inputs.playoffsTypeSummer == "lckPromotion") {
				lckLadder = true;
			} else if (inputs.playoffsTypeSummer == "lplPromotion") {
				lplLadder = true;
			} else if (inputs.playoffsTypeSummer == "lmsPromotion") {
				lmsLadder = true;
			} else if (inputs.playoffsTypeSummer == "wcPromotion") {
				wcLadder = true;
			}
		}

	/*	  key: "naPromotion",
        }, {
            val: "EU LCS Promotion",
            key: "euPromotion",
        }, {
            val: "LCK Promotion",
            key: "lckPromotion",
        }, {
            val: "LPL Promotion",
            key: "lplPromotion",
        }, {
            val: "Wild Card Promotion",
            key: "wcPromotion",	*/


        // If in the current season and before playoffs started, display projected matchups
//        if (inputs.season === g.season && ((g.phase < g.PHASE.PLAYOFFS && (g.gameType < 6 || g.seasonSplit == "Summer")) ||  (g.phase < g.PHASE.MSI && (g.seasonSplit == "Spring")))) {
//        if (inputs.season === g.season && ((g.phase < g.PHASE.PLAYOFFS && (g.gameType < 6 || g.seasonSplit == "Summer")) )) {
        if (inputs.season === g.season && (g.phase < g.PHASE.PLAYOFFS )) {
            const teams = helpers.orderByWinpSummerTowerKDA(await idb.getCopies.teamsPlus({
				attrs: ["tid", "cid", "abbrev", "name"],
				seasonAttrs: ["winpSummer"],
				stats: ["kda","fg","fga","fgp","pf","oppTw"],
				season: inputs.season,
            }));

			console.log(teams);

			const result = season.genPlayoffSeries(teams);
			console.log(result);
		//	console.log(result);
            series = result.series;
		   console.log(series);
		//	console.log(teams);




			finalMatchups = false;

        } else {

            const playoffSeries = await idb.getCopy.playoffSeries({season: inputs.season});
		//	console.log(playoffSeries);
            series = playoffSeries.series;
			//console.log(series);
            finalMatchups = true;
        }



        const confNames = g.confs.map(conf => conf.name);

	//	console.log(g.gameType);
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
				WorldsRegionals,
				WorldsGroups,
				WorldsSpring,
				WorldsSummer,
				LadderExtended,
				LadderExtendedMax,
				NALCSWorlds,
				EULCSWorlds,
				naLadder,
				euLadder,
				lckLadder,
				lplLadder,
				lmsLadder,
				wcLadder,
				worlds2019,
				vietnam,
				sea,
				brazil,
				cis,
				japan,
				latin,
				oce,
				turkey,
			groups1,
				playoff1,
				groups2,
				playoff2,
            confNames,
            season: inputs.season,
            series,
            gameType: g.gameType,
			playoffsTypeSummer: inputs.playoffsTypeSummer,
			yearType: g.yearType == undefined ? 0 : g.yearType,
        };
    }
}

export default {
    runBefore: [updatePlayoffs],
};
