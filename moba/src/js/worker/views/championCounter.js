// @flow

import {g,helpers} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateLeagueFinances(
    inputs: champion,
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || inputs.champion !== state.champion) {

		const championPatch = await idb.cache.championPatch.getAll();
		let champions = await idb.cache.champions.getAll();
	//console.log(inputs);
//	console.log(state);

		var weak, strong;
		if (g.champType == 0) {
			weak = -0.005;
			strong = 0.005;
		} else {
			weak = -0.01;
			strong = 0.01;
		}

	//	var championAdjusted = helpers.deepCopy(champions);
  var championAdjusted = [];
	//	console.log(championPatch);
	//	console.log(champions);
	//	console.log(championAdjusted);
	//	console.log(weak);
	//console.log(strong);

		async function calcChampCounter(champions, championAdjusted) {

			for (let i = 0; i < champions.length; i++) {
      //  console.log(champions[i]);
      //  console.log(inputs.champion);
        //championAdjusted[i].name
        if (champions[i].name == inputs.champion) {
  				for (let j = 0; j < champions[i].ratings.counter.length; j++) {
  					if (champions[i].ratings.counter[j] < weak) {
  						champions[i].ratings.counter[j] = "Weak";
  					} else if (champions[i].ratings.counter[j] < strong) {
  						champions[i].ratings.counter[j] = "Neutral";
  					//} else if (champions[i].ratings.counter[j] < .03) {
  	//					champions[i].ratings.counter[j] = "Medium";
  					} else {
  						champions[i].ratings.counter[j] = "Strong";
  					}
            let championObject = {};
              championObject.hid = champions[j].hid;
              championObject.name = champions[j].name;
              championObject.counter = champions[i].ratings.counter[j];
              championAdjusted.push(championObject);
  				}
          break;
        }
			}
		}

		await calcChampCounter(champions, championAdjusted);
		//console.log(championPatch[0]);

// why does lmiiting it now break it?
// need to test with fake data
// to get structure right

	//	console.log(championAdjusted);
        //const teams = await idb.getCopies.teamsPlus({
      //      attrs: ["tid", "abbrev", "region", "name"],
      //      seasonAttrs: ["att", "revenue", "profit", "cash", "payroll", "salaryPaid"],
      //      season: inputs.season,
    //    });
//console.log(inputs);
        return {
            season: g.season,
            salaryCap: g.salaryCap / 1000,
            minPayroll: g.minPayroll / 1000,
            luxuryPayroll: g.luxuryPayroll / 1000,
            luxuryTax: g.luxuryTax,
            championPatch,
			championAdjusted: championAdjusted,
			champion: inputs.champion,
        };
    }
}

export default {
    runBefore: [updateLeagueFinances],
};
