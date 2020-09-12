// @flow

import {g} from '../../common';
import {champion} from '../core';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateLeagueFinances(
    inputs: {season: number},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || inputs.season !== state.season || inputs.season === g.season) {

		const championPatch = await idb.cache.championPatch.getAll();
		var  champions = await idb.cache.champions.getAll();

		console.log(champions);
		console.log(championPatch);
		//console.log(JSON.parse(JSON.stringify(champions)));

		async function calcChampBasic(champions) {

			for (let i = 0; i < champions.length; i++) {
				if (champions[i].ratings.early>champions[i].ratings.mid && champions[i].ratings.early>champions[i].ratings.late) {
					champions[i].ratings.earlyMidLate = "Early";
				} else if (champions[i].ratings.mid>champions[i].ratings.early && champions[i].ratings.mid>champions[i].ratings.late) {
					champions[i].ratings.earlyMidLate = "Mid";
				} else {
					champions[i].ratings.earlyMidLate = "Late";
				}

				for (let j = 0; j < championPatch.length; j++) {
					if (g.champType == 0) {
						champions[i].SUP = champion.tier(championPatch,champions,"SUP",j,i,champions[i].SUP);
						champions[i].ADC = champion.tier(championPatch,champions,"ADC",j,i,champions[i].ADC);
						champions[i].JGL = champion.tier(championPatch,champions,"JGL",j,i,champions[i].JGL);
						champions[i].TOP = champion.tier(championPatch,champions,"TOP",j,i,champions[i].TOP);
						champions[i].MID  = champion.tier(championPatch,champions,"MID",j,i,champions[i].MID);
					} else {
					// MID/OFF/SAFE/JGL/ROAM
						champions[i].OFF = champion.tier(championPatch,champions,"OFF",j,i,champions[i].OFF);
						champions[i].SAFE = champion.tier(championPatch,champions,"SAFE",j,i,champions[i].SAFE);
						champions[i].JGL = champion.tier(championPatch,champions,"JGL",j,i,champions[i].JGL);
						champions[i].ROAM = champion.tier(championPatch,champions,"ROAM",j,i,champions[i].ROAM);
						champions[i].MID  = champion.tier(championPatch,champions,"MID",j,i,champions[i].MID);
					}
				}
			}
		}

		await calcChampBasic(champions);

		console.log(JSON.parse(JSON.stringify(champions)));
			console.log(champions);
		console.log(championPatch[0]);



        return {
            minPayroll: g.minPayroll / 1000,
            luxuryPayroll: g.luxuryPayroll / 1000,
            luxuryTax: g.luxuryTax,
            salaryCap: g.salaryCap / 1000,
            season: inputs.season,          
            championPatch,
			champions,
        };
    }
}

export default {
    runBefore: [updateLeagueFinances],
};
