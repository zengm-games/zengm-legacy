// @flow

import {g,helpers} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

import {getCols, setTitle} from '../util';

async function updateLeagueFinances(
    inputs: champion,
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || inputs.champion !== state.champion) {

		//		console.log(inputs);
		//		console.log(state);

	//	console.log(g.cCache);
		const championPatch = await idb.cache.championPatch.getAll();
		let champions = await idb.cache.champions.getAll();

		var low, medium;
		if (g.champType == 0) {
			low = 0.025;
			medium = 0.05;
		} else {
			low = 0.0025;
			medium = 0.01;
		}

		//var championAdjusted = helpers.deepCopy(champions);
    var championAdjusted = [];
	//	console.log(championPatch);
	//	console.log(champions);
	//	console.log(championAdjusted);
	//	console.log(low);
	//	console.log(medium);

		async function calcChampSynergy(champions, championAdjusted) {

			for (let i = 0; i < champions.length; i++) {
        if (champions[i].name == inputs.champion) {
  				for (let j = 0; j < champions[i].ratings.synergy.length; j++) {
  					if (champions[i].ratings.synergy[j] == 0.0) {
  						champions[i].ratings.synergy[j] = "None";
  					} else if (champions[i].ratings.synergy[j] < low) {
  						champions[i].ratings.synergy[j] = "Low";
  					} else if (champions[i].ratings.synergy[j] < medium) {
  						champions[i].ratings.synergy[j] = "Medium";
  					} else {
  						champions[i].ratings.synergy[j] = "High";
  					}
            let championObject = {};
              championObject.hid = champions[j].hid;
              championObject.name = champions[j].name;
              championObject.synergy = champions[i].ratings.synergy[j];
              championAdjusted.push(championObject);
  				}
          break;
        }
			}

		}

		await calcChampSynergy(champions, championAdjusted);
	//		console.log(championAdjusted);
	//		console.log(championPatch);
//console.log(inputs);
        return {
            season: g.season,
            salaryCap: g.salaryCap / 1000,
            minPayroll: g.minPayroll / 1000,
            luxuryPayroll: g.luxuryPayroll / 1000,
            luxuryTax: g.luxuryTax,
            championPatch,
			championAdjusted,
			champion: inputs.champion,
        };
    }
}

export default {
    runBefore: [updateLeagueFinances],
};
