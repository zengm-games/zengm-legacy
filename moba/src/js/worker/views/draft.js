// @flow

import {PHASE, PLAYER, g} from '../../common';
import {draft} from '../core';
import {idb} from '../db';

async function updateDraft(): void | {[key: string]: any} {
    // DIRTY QUICK FIX FOR v10 db upgrade bug - eventually remove
    // This isn't just for v10 db upgrade! Needed the same fix for http://www.reddit.com/r/BasketballGM/comments/2tf5ya/draft_bug/cnz58m2?context=3 - draft class not always generated with the correct seasons
	//	console.log("got here");
    {
        const players = await idb.cache.players.indexGetAll('playersByTid', PLAYER.UNDRAFTED);
        for (const p of players) {
            const season = p.ratings[0].season;
            if (season !== g.season && g.phase === g.PHASE.DRAFT) {
                console.log("FIXING FUCKED UP DRAFT CLASS");
                console.log(season);
                p.ratings[0].season = g.season;
                p.draft.year = g.season;
                await idb.cache.players.put(p);
            }
        }
    }
	//	console.log("got here");
    let undrafted = await idb.cache.players.indexGetAll('playersByTid', PLAYER.UNDRAFTED);
    undrafted.sort((a, b) => b.valueFuzz - a.valueFuzz);
    undrafted = await idb.getCopies.playersPlus(undrafted, {
        attrs: ["pid", "userID","name","born", "age", "injury", "contract", "watch"],
        ratings: ["ovr", "pot", "skills", "pos","region","languages","languagesGrouped"],
        stats: ["per", "ewa"],
        season: g.season,
        showNoStats: true,
        showRookies: true,
        fuzz: true,
    });
    for (let i = 0; i < undrafted.length; i++) {
        undrafted[i].name = `${undrafted[i].userID}`;		
	}		
	//console.log(undrafted);
	//	console.log("got here");
    let drafted = await idb.cache.players.indexGetAll('playersByTid', [0, Infinity]);
    drafted = drafted.filter((p) => p.draft.year === g.season);
    drafted.sort((a, b) => (100 * a.draft.round + a.draft.pick) - (100 * b.draft.round + b.draft.pick));
    drafted = await idb.getCopies.playersPlus(drafted, {
        attrs: ["pid", "tid","userID", "name","born","age", "draft","country", "injury", "contract", "watch"],
        ratings: ["ovr", "pot", "skills", "pos","region","languages","languagesGrouped"],
        stats: ["per", "ewa"],
        season: g.season,
        showRookies: true,
        fuzz: true,
    });
   for (let i = 0; i < drafted.length; i++) {
        drafted[i].name = `${drafted[i].userID}`;		
	}		
	//console.log(drafted);	
		//console.log("got here");
    // Start draft if a pick has already been made (then it's already started)
    let started = drafted.length > 0;
		//console.log("got here");
    const draftOrder = await draft.getOrder();
	//console.log(drafted);	
	//console.log(drafted.length );	
//	console.log(undrafted);		
//	console.log(draftOrder);
    for (const pick of draftOrder) {
        drafted.push({
            draft: {
                tid: pick.tid,
                originalTid: pick.originalTid,
                round: pick.round,
                pick: pick.pick,
            },
            pid: -1,
        });
    }
	//console.log(drafted);	
	//console.log(drafted.length);
	//console.log(undrafted);	
	
    if (drafted.length === 0) {
        console.log('drafted:', drafted);
        console.log('draftOrder:', draftOrder);
     //   throw new Error("drafted.length should always be 60, combo of drafted players and picks. But now it's 0. Why?");
    }

    // ...or start draft if the user has the first pick (in which case starting it has no effect, might as well do it automatically)
    started = started || g.userTids.includes(drafted[0].draft.tid);

//	console.log(g.phase);
	//console.log(g.phase);
	//console.log(started);
	//console.log(drafted[0].draft.tid);	
	//console.log(g.userTids);	
	
	
    return {
        undrafted,
        drafted,
        started,
        fantasyDraft: g.phase === g.PHASE.FANTASY_DRAFT,
        userTids: g.userTids,
    };
}

export default {
    runBefore: [updateDraft],
};
