// @flow

import {PHASE, PLAYER, g, helpers} from '../../common';
import {draft,season,team} from '../core';
import {idb} from '../db';

async function updateDraft(): void | {[key: string]: any} {
    // DIRTY QUICK FIX FOR v10 db upgrade bug - eventually remove
    // This isn't just for v10 db upgrade! Needed the same fix for http://www.reddit.com/r/BasketballGM/comments/2tf5ya/draft_bug/cnz58m2?context=3 - draft class not always generated with the correct seasons
   /* {
        const players = await idb.cache.players.indexGetAll('playersByTid', PLAYER.UNDRAFTED);
        for (const p of players) {
            const season = p.ratings[0].season;
            if (season !== g.season && g.phase === g.PHASE.DRAFT) {
           //    console.log("FIXING FUCKED UP DRAFT CLASS");
            //   console.log(season);
                p.ratings[0].season = g.season;
                p.draft.year = g.season;
                await idb.cache.players.put(p);
            }
        }
    }*/

	
	
	
	let userGame = false;
	let usersGame = [];
	let schedule = await idb.cache.schedule.getAll();
//console.log(schedule);
	var i;
	var gameLocation;
	for (i = 0; i < schedule.length; i++) {		
		if (schedule[i].homeTid == g.userTid || schedule[i].awayTid == g.userTid) {
			//console.log(i);
			//console.log(schedule[i]);
			if (schedule[i].champions == undefined) {
			//	console.log("need to create");

				//	let schedule = await idb.cache.schedule.getAll();
					let undrafted = await idb.cache.champions.getAll();	
					let patch = await idb.cache.championPatch.getAll();		

					var teamHome;
					var teamAway;
					
					let iii;
					let ii;
				//	let usersGame;
					let drafted;

					for (ii = 0; ii < undrafted.length; ii++) {	
						let early =  undrafted[ii].ratings.early;
						let mid =  undrafted[ii].ratings.mid;			
						let late  =  undrafted[ii].ratings.late;			
						if (early>mid && early>late) {
							undrafted[ii].ratings.earlyMidLate = "Early";
						} else if (mid>early && mid>late) {
							undrafted[ii].ratings.earlyMidLate = "Mid";			
						} else {
							undrafted[ii].ratings.earlyMidLate = "Late";						
						}	
						undrafted[ii].lane = "";
						for (iii = 0; iii < patch.length; iii++) {	
					//		console.log(i+" "+patch.length+" "+ii+" "+undrafted.length+" "+patch[i].champion+" "+undrafted[ii].name);		
						  if (patch[iii].champion == undrafted[ii].name) {
							  if (undrafted[ii].lane.length == 0) {
								undrafted[ii].lane += patch[iii].role;
							  } else {
								undrafted[ii].lane += " ";
								undrafted[ii].lane += patch[iii].role;
							  }
										 
						  }
						}
					}


			
			//for (i = 0; i < schedule.length; i++) {
					schedule[i].champions = {undrafted: undrafted};
					//usersGame.champions = {undrafted: undrafted};
//usersGame
					usersGame = helpers.deepCopy(schedule[i]); 

					
					teamHome = await idb.cache.players.indexGetAll(
							"playersByTid",
							usersGame.homeTid,
						);		
					
					teamAway = await idb.cache.players.indexGetAll(
							"playersByTid",
							usersGame.awayTid,
						);			
					
					drafted = [];
					
					drafted = await draft.setDraftOrder(drafted,usersGame);

					schedule[i].champions.drafted = drafted;
					schedule[i].champions.patch = patch;
					schedule[i].teamHome = teamHome;
					schedule[i].teamAway = teamAway;
					ii = i;
					schedule[ii] = 	helpers.deepCopy(schedule[ii]);
		//	}				
			
				await idb.cache.schedule.put(schedule[i]);
			} else {
//console.log("already created");				
			}			
		//	console.log(schedule[i]);
			usersGame = helpers.deepCopy(schedule[i]);
		//	console.log(usersGame);			
			userGame = true;
			gameLocation = i;
			break;		
		}
	}	

	var undrafted = [];
	var drafted = [];	
	var patch = [];		
	//console.log(usersGame);

	var noUserGame = false;
	
	if (userGame) {
	//	console.log(schedule[i]);
//		undrafted = helpers.deepCopy(draft.genOrder(schedule[i].champions.undrafted));
	//	drafted = helpers.deepCopy(draft.genOrder(schedule[i].champions.drafted)); 
		undrafted = helpers.deepCopy(schedule[i].champions.undrafted);
		drafted = helpers.deepCopy(schedule[i].champions.drafted); 
	//	console.log(undrafted);
//		console.log(drafted);
	
		
	} else {
		noUserGame = true;
		/*console.log(schedule[i]);		
		undrafted = await idb.cache.champions.getAll();
		
		patch = await idb.cache.championPatch.getAll();	
		
		var teamHome;
		var teamAway;
		//console.log(teamone);
		
		//let awayTeam = idb.cache.players.indexGetAll('playersByTid', awayTid),
		//let homeTeam = idb.cache.players.indexGetAll('playersByTid', homeTid),
		//console.log(schedule);
		//console.log(awayTeam);
		//console.log(homeTeam);	
		let i;
		let ii;
		let usersGame;
		let drafted;
		//console.log(undrafted);
		//console.log(patch);
		for (ii = 0; ii < undrafted.length; ii++) {	
			let early =  undrafted[ii].ratings.early;
			let mid =  undrafted[ii].ratings.mid;			
			let late  =  undrafted[ii].ratings.late;			
			if (early>mid && early>late) {
				undrafted[ii].ratings.earlyMidLate = "Early";
			} else if (mid>early && mid>late) {
				undrafted[ii].ratings.earlyMidLate = "Mid";			
			} else {
				undrafted[ii].ratings.earlyMidLate = "Late";						
			}	
			undrafted[ii].lane = "";
			for (i = 0; i < patch.length; i++) {	
		//		console.log(i+" "+patch.length+" "+ii+" "+undrafted.length+" "+patch[i].champion+" "+undrafted[ii].name);		
			  if (patch[i].champion == undrafted[ii].name) {
				  if (undrafted[ii].lane.length == 0) {
					undrafted[ii].lane += patch[i].role;
				  } else {
					undrafted[ii].lane += " ";
					undrafted[ii].lane += patch[i].role;
				  }
							 
			  }
			}
		}
	//	console.log(undrafted);

		
		//for (i = 0; i < schedule.length; i++) {
		schedule[gameLocation].champions = {undrafted: undrafted};

		usersGame = helpers.deepCopy(schedule[gameLocation]); 

		
		teamHome = await idb.cache.players.indexGetAll(
				"playersByTid",
				usersGame.homeTid,
			);		
		
		teamAway = await idb.cache.players.indexGetAll(
				"playersByTid",
				usersGame.awayTid,
			);			
		
		drafted = [];
		
		drafted = await draft.setDraftOrder(drafted,usersGame);

		schedule[gameLocation].champions.drafted = drafted;
		schedule[gameLocation].champions.patch = patch;
		schedule[gameLocation].teamHome = teamHome;
		schedule[gameLocation].teamAway = teamAway;
		ii = gameLocation;
		schedule[ii] = 	helpers.deepCopy(schedule[ii]);
	//	}			
		
		*/
	}
	//	console.log(undrafted);
	//	console.log(drafted);
	let ended;
	let started;
	if (noUserGame) {
		started = false;
	} else {
		// Start draft if a pick has already been made (then it's already started)

		if (usersGame.champions.drafted[0].draft.name == undefined) {
			started = false;
		} else {
			started = true;		
		}
		if (usersGame.champions.drafted[19].draft.name != undefined) {
			ended = false;		
		} else {
			ended = true;
		}
	//	console.log(ended);
		//let started = usersGame.champions.drafted[i].draft.name  > 0;

	//    const draftOrder = await draft.getOrder();
	   /* let draftOrder;

		if (drafted.length === 0) {
			console.log('drafted:', drafted);
			console.log('draftOrder:', draftOrder);
			// put this back later?
		  //  throw new Error("drafted.length should always be 60, combo of drafted players and picks. But now it's 0. Why?");
		}*/

		// ...or start draft if the user has the first pick (in which case starting it has no effect, might as well do it automatically)
		//console.log(usersGame);
		//console.log(g.userTids);
		if (started == false) {
			await team.checkRosterSizes();
		}
		
		started = started || g.userTids.includes(usersGame.homeTid);
	}
	//console.log(started);
//    started =  g.userTids.includes(usersGame.homeTid);
   // started =  true;

    return {
        undrafted,
        drafted,
        started,
        noUserGame,		
        ended,		
        fantasyDraft: g.phase === g.PHASE.FANTASY_DRAFT,
        userTids: g.userTids,
    };
}

export default {
    runBefore: [updateDraft],
};
