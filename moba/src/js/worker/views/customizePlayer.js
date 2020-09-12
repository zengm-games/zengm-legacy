// @flow

import {PHASE, PLAYER, g} from '../../common';
import {finances, player} from '../core';
import {idb} from '../db';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateCustomizePlayer(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (!g.godMode) {
        return {
            godMode: g.godMode,
        };
    }

    if (updateEvents.includes('firstRun')) {
        const teams = await idb.getCopies.teamsPlus({
            attrs: ["tid", "region", "name"],
        });

        // Once a new draft class is generated, if the next season hasn't started, need to bump up year numbers
        const seasonOffset = g.phase < g.PHASE.FREE_AGENCY ? 0 : 1;

        for (let i = 0; i < teams.length; i++) {
            teams[i].text = `${teams[i].region} ${teams[i].name}`;
        }
        teams.unshift({
            tid: PLAYER.RETIRED,
            text: "Retired",
        });
        teams.unshift({
            tid: PLAYER.UNDRAFTED_3,
            text: `${g.season + seasonOffset + 2} Draft Prospect`,
        });
        teams.unshift({
            tid: PLAYER.UNDRAFTED_2,
            text: `${g.season + seasonOffset + 1} Draft Prospect`,
        });
        teams.unshift({
            tid: PLAYER.UNDRAFTED,
            text: `${g.season + seasonOffset} Draft Prospect`,
        });
        teams.unshift({
            tid: PLAYER.FREE_AGENT,
            text: "Free Agent",
        });

        let appearanceOption;
        let originalTid;
        let p;

        if (inputs.pid === null) {
			
			const c = await idb.cache.champions.getAll();
			
			const cp = await idb.cache.championPatch.getAll();
			
			var i,j;
				var cpSorted;
				var topADC,topMID,topJGL,topTOP,topSUP;
				
				cpSorted = [];
				
				//g.numChampions
				for (i = 0; i < g.numChampionsPatch; i++) {
					cpSorted.push({"champion": cp[i].champion,"cpid": cp[i].cpid,"rank": cp[i].rank,"role": cp[i].role});
				}					
				
				cpSorted.sort(function (a, b) { return a.rank - b.rank; });		
				

				topADC = [];
				topMID = [];
				topJGL = [];
				topTOP = [];
				topSUP = [];

				for (i = 0; i < g.numChampionsPatch; i++) {
					if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
				//	   console.log(_.size(c));
						for (j = 0; j < g.numChampions; j++) {
							if (c[j].name == cpSorted[i].champion) {
								topADC.push(c[j].hid);
								j = g.numChampions;
							}
						}
					}
					if ((cpSorted[i].role == "MID") && (topMID.length < 5) ) {
	//				  topMID.push(cpSorted[i].cpid);
						for (j = 0; j < g.numChampions; j++) {
							if (c[j].name == cpSorted[i].champion) {
								topMID.push(c[j].hid);
								j = g.numChampions;
							}
						}
					}
					if ((cpSorted[i].role == "JGL") && (topJGL.length < 5) ) {
	//				  topJGL.push(cpSorted[i].cpid);
						for (j = 0; j < g.numChampions; j++) {
							if (c[j].name == cpSorted[i].champion) {
								topJGL.push(c[j].hid);
								j = g.numChampions;
							}
						}
					}
					if ((cpSorted[i].role == "TOP") && (topTOP.length < 5) ) {
	//				  topTOP.push(cpSorted[i].cpid);
						for (j = 0; j < g.numChampions; j++) {
							if (c[j].name == cpSorted[i].champion) {
								topTOP.push(c[j].hid);
								j = g.numChampions;
							}
						}
					}
					if ((cpSorted[i].role == "SUP") && (topSUP.length < 5) ) {
	//				  topSUP.push(cpSorted[i].cpid);
						for (j = 0; j < g.numChampions; j++) {
							if (c[j].name == cpSorted[i].champion) {
								topSUP.push(c[j].hid);
								j = g.numChampions;
							}
						}
					}
				
				}				
			
            // Generate new player as basis
            const teamSeasons = await idb.cache.teamSeasons.indexGetAll('teamSeasonsByTidSeason', [`${g.userTid},${g.season - 2}`, `${g.userTid},${g.season}`]);
            const scoutingRank = finances.getRankLastThree(teamSeasons, "expenses", "scouting");

            p = player.generate(
                PLAYER.FREE_AGENT,
                20,
                '',
                50,
                50,
                g.season,
                false,
                scoutingRank,
				c,topADC,topMID,topJGL,topTOP,topSUP,
            );

         //   p.face.fatness = p.face.fatness.toFixed(2);
         //   p.face.eyes[0].angle = p.face.eyes[0].angle.toFixed(1);
         //   p.face.eyes[1].angle = p.face.eyes[1].angle.toFixed(1);

            appearanceOption = 'Cartoon Face';
            p.imgURL = "http://";
			
			console.log(p.languages);
			console.log(p.languages[0]);			
			console.log(p.ratings);							
			console.log(p.ratings[0]);				

        } else if (typeof inputs.pid === 'number') {
            // Load a player to edit
            p = await idb.getCopy.players({pid: inputs.pid});
            if (!p) { throw new Error('Invalid player ID'); }
            if (p.imgURL.length > 0) {
                appearanceOption = 'Image URL';
            } else {
                appearanceOption = 'Cartoon Face';
                p.imgURL = "http://";
            }
		 /*p = await idb.getCopy.playersPlus(p, {
            attrs: ["pid", "name", "tid", "abbrev", "teamRegion", "teamName", "age", "hgtFt", "hgtIn", "weight", "born", "diedYear", "contract", "draft", "face", "mood", "injury", "salaries", "salariesTotal", "awardsGrouped", "freeAgentMood", "imgURL", "watch", "gamesUntilTradable", "college"],
            ratings: ["season", "seasonSplit","abbrev", "age","MMR","rank","ovr", "pot", "hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb", "skills", "pos", "region", "languages","languagesGrouped"],
            stats: ["championStats","psid", "season", "seasonSplit", "tid", "abbrev", "age", "gp", "gs", "min", "fg", "fga", "fgp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp", "ft", "fta", "ftp", "pm", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "per", "ewa","oppJM","kda","scTwr","scKills","riftKills","riftAssists","firstBlood"],
//			attrs: ["pid", "name", "tid", "abbrev", "teamRegion", "teamName", "pos", "age", "hgtFt", "hgtIn", "weight", "born", "diedYear", "contract", "draft", "face", "mood", "injury", "salaries", "salariesTotal", "awardsGrouped", "freeAgentMood", "imgURL", "watch","champions","languages", "gamesUntilTradable"],
	//		ratings: ["season", "abbrev", "age","MMR","rank", "ovr", "pot", "hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb", "skills","pos"],
		//	stats: ["psid","season", "tid","abbrev", "age", "pos","gp", "gs", "min", "fg", "fga", "fgp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "per", "ewa","oppJM","kda","scTwr","scKills"],

            playoffs: true,
            showRookies: true,
            fuzz: true,
        });*/
			console.log(Object.keys(p))		
			console.log(p);
            originalTid = p.tid;
        }
console.log(p);
        return {
			//ovrOption: 'ratings',
			ovrOption: 'OVR',
            appearanceOption,
            godMode: g.godMode,
            originalTid,
            p,
            season: g.season,
            teams,
        };
    }
}

export default {
    runBefore: [updateCustomizePlayer],
};
