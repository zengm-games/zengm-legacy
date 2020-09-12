// @flow

import {g} from '../../common';
import {idb} from '../db';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateHistory(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    const {season} = inputs;
    if (typeof season !== 'number') {
        return;
    }

    if (updateEvents.includes('firstRun') || state.season !== season) {
        if (season < g.startingSeason) {
            return {
                invalidSeason: true,
                season,
            };
        }

        const [awards, teams] = await Promise.all([
            idb.getCopy.awards({season}),
            idb.getCopies.teamsPlus({
                attrs: ["tid", "cid", "abbrev", "region", "name"],
//                seasonAttrs: ["playoffRoundsWon"],
                seasonAttrs: ["playoffRoundsWon","playoffRoundsWonWorlds","playoffRoundsWonMSI"],
                season,
            }),
        ]);
		//console.log(awards);

        // Hack placeholder for old seasons before Finals MVP existed
        if (awards && !awards.hasOwnProperty("finalsMvp")) {
            awards.finalsMvp = {
                pid: 0,
                name: "N/A",
                tid: -1,
                abbrev: '',
                pts: 0,
                trb: 0,
                ast: 0,
            };
        }
		
       // Hack placeholder for old seasons before region MVP existed
        if (awards && !awards.hasOwnProperty("regionMVP")) {
			awards.regionMVP = [];			
			for (let i = 0; i < 6; i++) {			
			   awards.regionMVP.push({
					pid: 0,
					name: "N/A",
					tid: -1,
					abbrev: '',
					pts: 0,
					trb: 0,
					ast: 0,
				});
			}
        }		

        // Hack placeholder for old seasons before Finals MVP existed
        if (awards && !awards.hasOwnProperty("allRookie")) {
            // $FlowFixMe
            awards.allRookie = [];
        }

       if (awards && !awards.hasOwnProperty("regionAllLeague")) {
            // $FlowFixMe
            awards.regionAllLeague = [
				{
					title: '',
					players: [
						{
							pid: 0,
							name: "N/A",
							tid: -1,
							abbrev: '',
							pts: 0,
							trb: 0,
							ast: 0,
						},
						{
							pid: 0,
							name: "N/A",
							tid: -1,
							abbrev: '',
							pts: 0,
							trb: 0,
							ast: 0,
						},
						{
							pid: 0,
							name: "N/A",
							tid: -1,
							abbrev: '',
							pts: 0,
							trb: 0,
							ast: 0,
						},
						{
							pid: 0,
							name: "N/A",
							tid: -1,
							abbrev: '',
							pts: 0,
							trb: 0,
							ast: 0,
						},
						{
							pid: 0,
							name: "N/A",
							tid: -1,
							abbrev: '',
							pts: 0,
							trb: 0,
							ast: 0,
						},
					]
				},			
			];
        }		
		
        // For old league files, this format is obsolete now
        if (awards && awards.bre && awards.brw) {
            // $FlowFixMe
            awards.bestRecordConfs = [awards.bre, awards.brw];
        }
//console.log(awards);
        let retiredPlayers = await idb.getCopies.players({retired: true});
        retiredPlayers = retiredPlayers.filter((p) => p.retiredYear === season);
        retiredPlayers = await idb.getCopies.playersPlus(retiredPlayers, {
            attrs: ["pid", "name", "age", "hof"],
            season,
            stats: ["tid", "abbrev"],
            showNoStats: true,
        });
        for (let i = 0; i < retiredPlayers.length; i++) {
            // Show age at retirement, not current age
            retiredPlayers[i].age -= g.season - season;
        }
        retiredPlayers.sort((a, b) => b.age - a.age);

        // Get champs
		var champTid;
		var champRound;
		for (let i = 0; i < teams.length; i++) {
		//console.log(i+" "+teams[i].seasonAttrs.playoffRoundsWon+" "+g.gameType);
		//console.log(teams[i].seasonAttrs.playoffRoundsWonMSI+" "+g.gameType);
			
	//                if ((teams[i].playoffRoundsWon === 2) && (teams[i].cid === 0)) {
			if ((teams[i].seasonAttrs.playoffRoundsWon == 3) && (g.gameType == 0)) {
				champTid = teams[i].tid;
				champRound = 3;
				break;
			} else if ((teams[i].seasonAttrs.playoffRoundsWon == 27) && (g.gameType == 1)) {
				champTid = teams[i].tid;
				champRound = 27;			
				break;
			} else if ((teams[i].seasonAttrs.playoffRoundsWon == 4) && (g.gameType == 2)) {
				champTid = teams[i].tid;
				champRound = 4;			
				break;
			} else if ((teams[i].seasonAttrs.playoffRoundsWon == 4) && g.gameType == 3 && (g.yearType == 2019)) {
				champTid = teams[i].tid;
				champRound = 4;			
				break;
			} else if ((teams[i].seasonAttrs.playoffRoundsWon == 6) && (g.gameType == 3) && (g.yearType == undefined || g.yearType == 0)) {
				champTid = teams[i].tid;
				champRound = 6;			
				break;
			} else if ((teams[i].seasonAttrs.playoffRoundsWon == 3) && (g.gameType == 4)) {
				champTid = teams[i].tid;
				champRound = 3;			
				break;
			} else if ((teams[i].seasonAttrs.playoffRoundsWon == 10) && (g.gameType == 5 ) && (g.yearType == 2019)) {
				champTid = teams[i].tid;
				champRound = 10;
				break;
			} else if ((teams[i].seasonAttrs.playoffRoundsWon == 6) && (g.gameType == 5 )  && (g.yearType == undefined || g.yearType == 0)) {
				champTid = teams[i].tid;
				champRound = 6;
				break;
			} else if ((teams[i].seasonAttrs.playoffRoundsWonWorlds == 3) && g.gameType == 7 || g.gameType == 6) { 
				champTid = teams[i].tid;
				champRound = 3;
				break;				
			//} else if ((teams[i].seasonAttrs.playoffRoundsWon == 4) && (g.gameType == 6)) {
//			} else if ((teams[i].seasonAttrs.playoffRoundsWonMSI == 5) && (g.gameType == 6)) {
				//champTid = teams[i].tid;
			//	champRound = 5;
		//console.log(teams[i].seasonAttrs.playoffRoundsWonMSI+" "+champTid+" "+champRound);
				
		//		break;
			}
		}			
		var champ;
		
		if (g.gameType == 7 || g.gameType == 6) {
			champ = teams.find((t) => t.seasonAttrs.playoffRoundsWonWorlds === champRound);
		} else {
			champ = teams.find((t) => t.seasonAttrs.playoffRoundsWon === champRound);
		}
//        const champ = teams.find((t) => t.seasonAttrs.playoffRoundsWonMSI === champRound);
		//console.log(champTid);
	//	console.log(champ);
		
		let confs2 = g.confs;
		if (g.gameType == 7) {
			confs2[0] = g.confs[0];
			confs2[1] = g.confs[3];
			confs2[2] = g.confs[6];
			confs2[3] = g.confs[9];
			confs2[4] = g.confs[12];
			confs2[5] = g.confs[15];
			
		} else if (g.gameType < 5) {
			
		}
		let worlds = false;
		if (g.gameType >= 5) {
			worlds = true;
		}
        return {
            awards,
            champ,
            confs: g.confs,
            confs2,			
            invalidSeason: false,
            retiredPlayers,
            season,
            userTid: g.userTid,
			worlds,
        };
    }
}

export default {
    runBefore: [updateHistory],
};
