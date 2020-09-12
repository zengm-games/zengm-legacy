// @flow

import {g} from '../../common';
import {idb} from '../db';

async function updateChampionPatch(): void | {[key: string]: any} {
	
	const championPatch = await idb.cache.championPatch.getAll();
	//const championPatch = await idb.cache.championPatch.getAll();
	
    for (let i = 0; i < championPatch.length; i++) {
        championPatch[i].attack = parseFloat(championPatch[i].champion);
        championPatch[i].defense = parseFloat(championPatch[i].role);
        championPatch[i].ability = parseFloat(championPatch[i].rank);
    }	
	//console.log(championPatch);	
	
	
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
        teams,
		championPatch,
    };
}

export default {
    runBefore: [updateChampionPatch],
};
