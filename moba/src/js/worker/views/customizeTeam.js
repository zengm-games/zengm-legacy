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
        let t;		
		let pAll = [];
		
		
		console.log(inputs);
		
        if (inputs.tid === null) {
			
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

			t = {
				tid: g.numTeams,
				cid: 0,
				did: 0,
				region: "New",			 
				name: "Team",			 
				abbrev: "TN",				
				country: "NA",							
				countrySpecific: "United States",							
				imgURL: "",
			};
			console.log(t);
			let userPlayerPos, timeThrough;

			for (let n = 0; n < 6; n++) {
				
				
				
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
				p.imgURL = "http://";
//					if ( (g.userTid == tid2) && (n<5) ) {
				if (  (n<5) ) {
					userPlayerPos = "";
					timeThrough = 0;
					while ( (((userPlayerPos != "TOP") && (n == 0))  || ((userPlayerPos != "JGL") && (n == 1)) || ((userPlayerPos != "MID") && (n == 2)) || ((userPlayerPos != "ADC") && (n == 3)) || ((userPlayerPos != "SUP") && (n == 4)) ) && (timeThrough<20) ) {

//						p = player.generate(tid2, 17, profile, baseRatings[n], pots[n], draftYear, true, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
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
						userPlayerPos = p.pos;
						//console.log(n+" "+userPlayerPos+" "+timeThrough);
						timeThrough += 1;
						if (n==0) {
							p.pos = "TOP"
							p.ratings[0].pos = "TOP"
						} else if (n==1) {
							p.pos = "JGL"
							p.ratings[0].pos = "JGL"
						} else if (n==2) {
							p.pos = "MID"
							p.ratings[0].pos = "MID"
						} else if (n==3) {
							p.pos = "ADC"
							p.ratings[0].pos = "ADC"
						} else {
							p.pos = "SUP"
							p.ratings[0].pos = "SUP"
						}
					//	console.log(n+" "+userPlayerPos+" "+timeThrough+" "+p.pos);
						
					//	console.log(n+" "+userPlayerPos);
					}
		//			console.log(p);					
//							console.log(n+" "+p.pos);								
				}				
				
				
				
		//		console.log(p);
				pAll.push(p);
			}
			console.log(pAll);
         //   p.face.fatness = p.face.fatness.toFixed(2);
         //   p.face.eyes[0].angle = p.face.eyes[0].angle.toFixed(1);
         //   p.face.eyes[1].angle = p.face.eyes[1].angle.toFixed(1);

//            appearanceOption = 'Cartoon Face';
            appearanceOption = 'Image URL';
            t.imgURL = "http://";			
			
		//	console.log(p.languages);
//			console.log(p.languages[0]);			
	//		console.log(p.ratings);							
		//	console.log(p.ratings[0]);				
			//console.log(t);				

//        } else if (typeof inputs.pid === 'number') {
        } else if (typeof inputs.tid === 'number') {
            // Load a player to edit
            t = await idb.getCopy.teamsPlus({
				attrs: ["tid", "abbrev","cid","did","region","name","country","countrySpecific","imgURL","budget"],
				seasonAttrs: ["season", "cidMid", "cidNext", "cidStart","tid"],
                //stats: ["gp", "fg", "fgp"],
				tid: inputs.tid,
                season: g.season,										
				});
		//	console.log(t);
            if (!t) { throw new Error('Invalid team ID'); }
			p = t;
			pAll.push(p);
		//	console.log(p);			
		//	console.log(pAll);						
      //      if (p.imgURL.length > 0) {
                appearanceOption = 'Image URL';
          //  } else {
            //    appearanceOption = 'Cartoon Face';
              //  p.imgURL = "http://";
            //}
		//	console.log(t);
            originalTid = t.tid;
        }

        return {
            appearanceOption,
            godMode: g.godMode,
            originalTid,
            p,
            t,			
            season: g.season,
            teams,
			pAll,
        };
    }
}

export default {
    runBefore: [updateCustomizePlayer],
};
