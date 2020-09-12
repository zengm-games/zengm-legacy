// @flow

import {g} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateLeagueFinances(
    inputs: {season: number},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || inputs.season !== state.season || inputs.season === g.season) {

    //console.log(state);
  //  console.log(inputs);


		const championPatch = await idb.cache.championPatch.getAll();
//console.log(championPatch);
		for (let i = 0; i < championPatch.length; i++) {

      if (inputs.season == g.season || championPatch[i].stats == undefined) {
        if (championPatch[i].gp > 0) {
  				championPatch[i].gp2 =  championPatch[i].gp;
  				championPatch[i].winp =  championPatch[i].won/championPatch[i].gp*100;
  				championPatch[i].kda =  (championPatch[i].fg+championPatch[i].fgp)/championPatch[i].fga;
  				championPatch[i].fg2 =  championPatch[i].fg/championPatch[i].gp;
  				championPatch[i].fga2 =  championPatch[i].fga/championPatch[i].gp;
  				championPatch[i].fgp2 =  championPatch[i].fgp/championPatch[i].gp;
  				championPatch[i].tp2 =  championPatch[i].tp/championPatch[i].gp;
          if (championPatch[i].fga2  == 0) {
            championPatch[i].score = championPatch[i].gp2*10;                        
          } else {
            championPatch[i].score = championPatch[i].gp2*championPatch[i].kda;
          }
  			} else {
  				championPatch[i].gp2 =  0;
  				championPatch[i].winp =  0;
  				championPatch[i].kda =  0;
  				championPatch[i].fg2 =  0;
  				championPatch[i].fga2 =  0;
  				championPatch[i].fgp2 =  0;
  				championPatch[i].tp2 =  0;
  				championPatch[i].score =  0;
  			}
      } else {
        let hasData = false;
        let j;
        for (j = 0; j < championPatch[i].stats.length ; j++) {
           if (championPatch[i].stats[j].year == inputs.season) {
             hasData = true;
             break;
           }
        }
  			if (championPatch[i].stats[j].gp > 0 && hasData) {
          championPatch[i].gp2 = championPatch[i].stats[j].gp;
  				championPatch[i].winp =  championPatch[i].stats[j].won/championPatch[i].stats[j].gp*100;
  				championPatch[i].kda =  (championPatch[i].stats[j].fg+championPatch[i].stats[j].fgp)/championPatch[i].stats[j].fga;
  				championPatch[i].fg2 =  championPatch[i].stats[j].fg/championPatch[i].stats[j].gp;
  				championPatch[i].fga2 =  championPatch[i].stats[j].fga/championPatch[i].stats[j].gp;
  				championPatch[i].fgp2 =  championPatch[i].stats[j].fgp/championPatch[i].stats[j].gp;
  				championPatch[i].tp2 =  championPatch[i].stats[j].tp/championPatch[i].stats[j].gp;
          if (championPatch[i].fga2  == 0) {
            championPatch[i].score = championPatch[i].gp2*10;
          } else {
            championPatch[i].score = championPatch[i].gp2*championPatch[i].kda;
          }

  			} else {
          championPatch[i].gp2 = 0;
  				championPatch[i].winp =  0;
  				championPatch[i].kda =  0;
  				championPatch[i].fg2 =  0;
  				championPatch[i].fga2 =  0;
  				championPatch[i].fgp2 =  0;
  				championPatch[i].tp2 =  0;
          championPatch[i].score = 0;
  			}
      }
		}
        //const teams = await idb.getCopies.teamsPlus({
            //attrs: ["tid", "abbrev", "region", "name"],
            //seasonAttrs: ["att", "revenue", "profit", "cash", "payroll", "salaryPaid"],
            //season: inputs.season,
        //});
//console.log(inputs);
//console.log(state);
        return {
            season: inputs.season,
            salaryCap: g.salaryCap / 1000,
            minPayroll: g.minPayroll / 1000,
            luxuryPayroll: g.luxuryPayroll / 1000,
            luxuryTax: g.luxuryTax,
            championPatch,
        };
    }
}

export default {
    runBefore: [updateLeagueFinances],
};
