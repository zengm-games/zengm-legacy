// @flow

import {g} from '../../common';
import {idb} from '../db';

async function updateChampion(): void | {[key: string]: any} {
	
	
	
	const champions = await idb.cache.champions.getAll();

	//console.log(champions);
    for (let i = 0; i < champions.length; i++) {
        champions[i].ratings.early = parseFloat(champions[i].ratings.early);
        champions[i].ratings.mid = parseFloat(champions[i].ratings.mid);
        champions[i].ratings.late = parseFloat(champions[i].ratings.late);
    }		
	//console.log(champions);	
	
    const teams = await idb.getCopies.teamsPlus({
        attrs: ["tid", "abbrev", "region", "name", "imgURL"],
        seasonAttrs: ["pop"],
        season: g.season,
    });

    for (let i = 0; i < teams.length; i++) {
        teams[i].pop = parseFloat(teams[i].seasonAttrs.pop.toFixed(6));
    }

    return {
        godMode: g.godMode,
        champType: g.champType,		
        teams,
        champions,
		
    };
}

export default {
    runBefore: [updateChampion],
};
