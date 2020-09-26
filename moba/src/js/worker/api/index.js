// @flow

import _ from 'underscore';
import {PHASE, PLAYER, g, helpers} from '../../common';
import actions from './actions';
import {contractNegotiation, draft, finances, league, phase, player, team, trade} from '../core';
import {connectMeta, idb} from '../db';
import {account, beforeView, changes, checkNaNs, env, local, lock, random, toUI, updatePlayMenu, updateStatus} from '../util';
import * as views from '../views';
import type {Conditions, Env, GameAttributes, GetOutput, Local, LockName, Player, PlayerWithoutPid, UpdateEvents} from '../../common/types';

const acceptContractNegotiation = async (pid: number, amount: number, exp: number): Promise<?string> => {
    return contractNegotiation.accept(pid, amount, exp);
};

const autoSortRoster = async () => {
    await team.rosterAutoSort(g.userTid);
};

const beforeViewLeague = async (newLid: number, loadedLid: number | void, conditions: Conditions) => {
    return beforeView.league(newLid, loadedLid, conditions);
};

const beforeViewNonLeague = async (loadedLid: number | void, conditions: Conditions) => {
    return beforeView.nonLeague(loadedLid, conditions);
};

const cancelContractNegotiation = async (pid: number) => {
    return contractNegotiation.cancel(pid);
};

const checkParticipationAchievement = async (force: boolean = false, conditions: Conditions) => {
    if (force) {
        await account.addAchievements(['participation'], conditions);
    } else {
        const achievements = await account.getAchievements();
        if (achievements[0].count === 0) {
            await account.addAchievements(['participation'], conditions);
        }
    }
};

const clearWatchList = async () => {
    const pids = new Set();

    const players = await idb.cache.players.getAll();
    for (const p of players) {
        if (p.watch && typeof p.watch !== "function") {
            p.watch = false;
            await idb.cache.players.put(p);
        }
        pids.add(p.pid);
    }

    // For watched players not in cache, mark as unwatched an add to cache
    const promises = [];
    await idb.league.players.iterate((p) => {
        if (p.watch && typeof p.watch !== "function" && !pids.has(p.pid)) {
            p.watch = false;
            promises.push(idb.cache.players.add(p)); // Can't await here because of Firefox IndexedDB issues
        }
    });
    await Promise.all(promises);
};

const countNegotiations = async () => {
    const negotiations = await idb.cache.negotiations.getAll();
    return negotiations.length;
};

const createLeague = async (
    name: string,
    tid: number,
    typeid2: number,
    typeid: number,
    champid: number,
    patchid: number,
    GMCoachid: number,
    leagueFile: Object | void,
    startingSeason: number,
    randomizeRosters: boolean,
    conditions: Conditions,
): Promise<number> => {
    return league.create(name, tid, typeid2, typeid, champid, patchid, GMCoachid, leagueFile, startingSeason, randomizeRosters, conditions);
};

const deleteOldData = async (options: {
    boxScores: boolean,
    teamStats: boolean,
    teamHistory: boolean,
    retiredPlayersUnnotable: boolean,
    retiredPlayers: boolean,
    playerStatsUnnotable: boolean,
    playerStats: boolean,
}) => {
    await idb.league.tx(["games", "teams", "teamSeasons", "teamStats", "players", "playerStats"], "readwrite", (tx) => {
        if (options.boxScores) {
            tx.games.clear();
        }

        if (options.teamHistory) {
            tx.teamSeasons.iterate((teamSeason) => {
                if (teamSeason.season < g.season) {
                    tx.teamSeasons.delete(teamSeason.rid);
                }
            });
        }

        if (options.teamStats) {
            tx.teamStats.iterate((teamStats) => {
                if (teamStats.season < g.season) {
                    tx.teamStats.delete(teamStats.rid);
                }
            });
        }

        if (options.retiredPlayers) {
            const toDelete = [];

            tx.players.index('tid').iterate(PLAYER.RETIRED, (p) => {
                toDelete.push(p.pid);
                tx.players.delete(p.pid);
            });
            tx.playerStats.iterate((ps) => {
                if (toDelete.includes(ps.pid)) {
                    tx.playerStats.delete(ps.psid);
                }
            });
        } else if (options.retiredPlayersUnnotable) {
            const toDelete = [];

            tx.players.index('tid').iterate(PLAYER.RETIRED, (p) => {
                if (p.awards.length === 0 && !p.statsTids.includes(g.userTid)) {
                    toDelete.push(p.pid);
                    tx.players.delete(p.pid);
                }
            });
            tx.playerStats.iterate((ps) => {
                if (toDelete.includes(ps.pid)) {
                    tx.playerStats.delete(ps.psid);
                }
            });
        }

        if (options.playerStats) {
            tx.players.iterate((p) => {
                p.ratings = [p.ratings[p.ratings.length - 1]];
                return p;
            });
            tx.playerStats.iterate((ps) => {
                if (ps.season < g.season) {
                    tx.playerStats.delete(ps.psid);
                }
            });
        } else if (options.playerStatsUnnotable) {
            const toDelete = [];

            tx.players.iterate((p) => {
                if (p.awards.length === 0 && !p.statsTids.includes(g.userTid)) {
                    p.ratings = [p.ratings[p.ratings.length - 1]];
                    toDelete.push(p.pid);
                }
                return p;
            });
            tx.playerStats.iterate((ps) => {
                if (ps.season < g.season && toDelete.includes(ps.pid)) {
                    tx.playerStats.delete(ps.psid);
                }
            });
        }
    });
};


const draftUntilUserOrEndFantasy = async (conditions: Conditions) => {
    await updateStatus('Draft in progress...');

    const pids = await draft.untilUserOrEndFantasy(conditions);
    const draftOrder = await draft.getOrder();

    if (draftOrder.length === 0) {
        await updateStatus('Idle');
    }

    return pids;
};

const draftUntilUserOrEnd = async (conditions: Conditions) => {
    await updateStatus('Draft in progress...');

	const schedule = await idb.cache.schedule.getAll();
	var usersGame;
	var userGame,userGameLocation;
	for ( i = 0; i < schedule.length; i++) {
		if (schedule[i].homeTid == g.userTid || schedule[i].awayTid == g.userTid) {
			usersGame = helpers.deepCopy(schedule[i]);
			userGame = true;	
			userGameLocation = i;
			break;		
		}
	}	
	var round,i;
	var pid, ii;

	// get user draft value data
	// first sort by roster order	

	if (usersGame.champions.drafted[0].draft.name == undefined || usersGame.champions.drafted[1].draft.name == undefined)  {
		var teamHome = await idb.cache.players.indexGetAll(
				"playersByTid",
				usersGame.homeTid,
			);				
		var teamAway = await idb.cache.players.indexGetAll(
				"playersByTid",
				usersGame.awayTid,
			);		
		usersGame.teamAway = helpers.deepCopy(teamAway);
		usersGame.teamHome = helpers.deepCopy(teamHome);

	}
	
	/////////////////////////////////////////////////  This ensures correct position win rate of champion is used 
	// really need to roster sort before getting to draft phase
	usersGame.teamAway.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });		
	for (let  i = 0; i < usersGame.teamAway.length; i++) {		
		// currently only player skill and patch strength
		// in the future can include countering,synergy, and early/mid/late info
		// can also do balance (magic/ad, squishy/assasin/tank, 
		if (i<5) {		
			usersGame.teamAway =  await draft.champDraftValues(usersGame.champions.patch,usersGame.champions.undrafted,usersGame.teamAway,i);
		}
	}
	// first sort by roster order
	usersGame.teamHome.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });
	for (let  i = 0; i < usersGame.teamHome.length; i++) {		
		// currently only player skill and patch strength
		// in the future can include countering,synergy, and early/mid/late info
		// can also do balance (magic/ad, squishy/assasin/tank, 
		if (i<5) {
			usersGame.teamHome =  await draft.champDraftValues(usersGame.champions.patch,usersGame.champions.undrafted,usersGame.teamHome,i);
		}
	}	

	let playersAI;
	let allPossiblePicks = [];
	let playersUsed = [];
	for ( i = 0; i < 20; i++) {
		allPossiblePicks = [];
		// have ai draft here, this is where AI logic goes?
		// 
		// order gets mixed up, why?
		round = i;	
		
		if (usersGame.champions.drafted[i].draft.name == undefined &&  !g.userTids.includes(usersGame.champions.drafted[i].draft.tid) ) {
			
			
			let idSame = false;
			let isPick = false;
			if (usersGame.awayTid == usersGame.champions.drafted[i].draft.tid) {
				idSame = true;
			}
			if (usersGame.champions.drafted[i].draft.pick == "PICK") {
				isPick = true;				
			}
			// picks (reverse for bans)
//			if (usersGame.awayTid == usersGame.champions.drafted[i].draft.tid && usersGame.champions.drafted[i].draft.pick == "PICK") {
			if ( (idSame && isPick) || (!idSame && !isPick)) {
				playersAI = helpers.deepCopy(usersGame.teamAway);
			} else {
				playersAI = helpers.deepCopy(usersGame.teamHome);
			}
			playersAI.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });
			
			// eventually better AI selection of champs (bring from game sim)
				// then filter through players, add all possibilities										
			for (let iv = 0; iv < 5; iv++) {
				// check if player has picked before
				
				if (playersUsed.includes(iv)) {
				} else {
					for (let v = 0; v < playersAI[iv].champions.length; v++) {
						for (let vi = 0; vi < usersGame.champions.undrafted.length; vi++) {
							if (usersGame.champions.undrafted[vi].name == playersAI[iv].champions[v].name) {							
								for (let vii = 0; vii < usersGame.champions.patch.length; vii++) {
									
									
									let role = usersGame.champions.patch[vii].role;
									if (role == "SAFE") {
										if (Math.random() < .5) {
											role = "SUP";
										} else {
										role = "ADC";
										}
									} else if (role == "OFF") {
										role = "TOP";
									} else if (role == "ROAM") {
										role = "JGL";
									}
									
									
										if (usersGame.champions.undrafted[vi].name  == usersGame.champions.patch[vii].champion &&  playersAI[iv].pos == role) {
																				
									
								//	if (usersGame.champions.undrafted[vi].name == usersGame.champions.patch[vii].champion) {
										// safe player/role
										let possiblePick = playersAI[iv].champions[v];
										possiblePick.player = iv;
										possiblePick.rosterOrder = playersAI[iv].rosterOrder;
										possiblePick.posPlayer = playersAI[iv].pos;
										possiblePick.hid = usersGame.champions.undrafted[vi].hid;
										possiblePick.cpid = usersGame.champions.patch[vii].cpid;
										possiblePick.name = usersGame.champions.undrafted[vi].name;
										possiblePick.nameReal = usersGame.champions.undrafted[vi].nameReal;
										possiblePick.synergy = usersGame.champions.undrafted[vi].ratings.synergy;
										possiblePick.counter = usersGame.champions.undrafted[vi].ratings.counter;
										possiblePick.name = usersGame.champions.undrafted[vi].name;
										possiblePick.undraftedLocation = vi;
										
										allPossiblePicks.push(possiblePick);																			
									}									
								}					
							}					
							// then do patch?, then include all matches						
						}					
					}
				}
			}

			// now do champion synergy and counter adjustments?
			// doesn't apply for first pick
			for (let p = 0; p < allPossiblePicks.length; p++) {
				for (let d = 0; d < i; d++) {
					if (usersGame.champions.drafted[d].draft.pick == "BAN") {
					} else {
						if (usersGame.champions.drafted[d].draft.tid == usersGame.champions.drafted[i].draft.tid) {
							// do synergy
							allPossiblePicks[p].draftValue +=  allPossiblePicks[p].synergy[usersGame.champions.drafted[d].draft.hid];
						} else {
							// do counter							
							allPossiblePicks[p].draftValue +=  allPossiblePicks[p].counter[usersGame.champions.drafted[d].draft.hid];

						}
					}
					// skip bans
					// only check picks
					// if on team do synvergy adjustment
					// if on other team do counter adjustment					
				}					
			}			
			// now do early/mid/late game checking (in case imbalanced)
			
			// now do melee ranged checks?
			
			// other balance checks before sorting values
						
			allPossiblePicks.sort((a, b) => b.draftValue - a.draftValue);
			
	//		console.log(allPossiblePicks.length);
			let difficulty = 3;
			if (g.GMCoachType == 0) {
				difficulty = 3;
			} else if (g.GMCoachType == 1) {
//					difficulty = allPossiblePicks.length-1;
				if (allPossiblePicks.length > 50) {
					difficulty = 50;
				} else {
					difficulty = allPossiblePicks.length-1;
				}
			} else if (g.GMCoachType == 2) {
				difficulty = 20;
			} else if (g.GMCoachType == 3) {
				difficulty = 5;
			} else {
				difficulty = 0;
			}			
			
			if (g.applyToCoachMode) {
				difficulty = g.aiPickBanStrength;				
			}
			
			let pickLocation = random.randInt(0, difficulty);			
			
			// sort to get highest available champ with remaining players
			if (allPossiblePicks.length <= pickLocation) {
				pickLocation = allPossiblePicks.length-1;
			}			
			
			
			if (usersGame.champions.drafted[i].draft.pick == "PICK" &&  !g.userTids.includes(usersGame.champions.drafted[i].draft.tid)) {
				playersUsed.push(allPossiblePicks[pickLocation].player);
			}
			

						
			pid = allPossiblePicks[pickLocation].player;
			// inputting new champ
			ii = pid;
			usersGame.champions.drafted[i].pid = pid;

			usersGame.champions.drafted[i].draft.hid = allPossiblePicks[pickLocation].hid;
			usersGame.champions.drafted[i].draft.name = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].name;			
			usersGame.champions.drafted[i].draft.nameReal = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].nameReal;			
			usersGame.champions.drafted[i].draft.posPlayer = allPossiblePicks[pickLocation].posPlayer;			
			usersGame.champions.drafted[i].draft.rosterOrder = allPossiblePicks[pickLocation].rosterOrder;			
			usersGame.champions.drafted[i].draft.role = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].role;			
			usersGame.champions.drafted[i].draft.lane = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].lane;			
			usersGame.champions.drafted[i].draft.ratings  = {};			
			usersGame.champions.drafted[i].draft.ratings.MR = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.MR;			
			usersGame.champions.drafted[i].draft.ratings.ability2 = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.ability2;			
			usersGame.champions.drafted[i].draft.ratings.defense2 = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.defense2;			
			usersGame.champions.drafted[i].draft.ratings.attack2 = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.attack2;					
			usersGame.champions.drafted[i].draft.ratings.control = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.control;					
			usersGame.champions.drafted[i].draft.ratings.damage = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.damage;					
			usersGame.champions.drafted[i].draft.ratings.mobility = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.mobility;					
			usersGame.champions.drafted[i].draft.ratings.toughness = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.toughness;					
			usersGame.champions.drafted[i].draft.ratings.utility = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.utility;					
			usersGame.champions.drafted[i].draft.ratings.damageType = usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.damageType;					
			let early =  usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.early;
			let mid =  usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.mid;			
			let late  =  usersGame.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.late;			
			if (early>mid && early>late) {
				usersGame.champions.drafted[i].draft.ratings.earlyMidLate = "Early";
			} else if (mid>early && mid>late) {
				usersGame.champions.drafted[i].draft.ratings.earlyMidLate = "Mid";			
			} else {
				usersGame.champions.drafted[i].draft.ratings.earlyMidLate = "Late";						
			}			
			
			usersGame.champions.drafted[i].draft.cpid = allPossiblePicks[pickLocation].cpid;
			usersGame.champions.drafted[i].draft.draftValue = allPossiblePicks[pickLocation].draftValue;
			usersGame.champions.undrafted.splice(allPossiblePicks[pickLocation].undraftedLocation, 1);

		} else if (usersGame.champions.drafted[i].draft.name != undefined &&  !g.userTids.includes(usersGame.champions.drafted[i].draft.tid) &&  usersGame.champions.drafted[i].draft.pick == "PICK")  {
				playersUsed.push(usersGame.champions.drafted[i].pid);						
		} else if (usersGame.champions.drafted[i].draft.name == undefined) {
			break;			
		} else {
		}
	}	
		// save the ai pick
	schedule[userGameLocation] = usersGame;	
	for ( i = 0; i < schedule.length; i++) {
		await idb.cache.schedule.put(schedule[i]);
	}	
		
    if (round >= 19 && usersGame.champions.drafted[19].draft.name != undefined) {
        await updateStatus('Idle');
	}
    return;
};



const draftUserFantasy = async (pid: number) => {
    const draftOrder = await draft.getOrder();
    const pick = draftOrder[0];
    if (pick && g.userTids.includes(pick.tid)) {
        draftOrder.shift();
        await draft.selectPlayerFantasy(pick, pid);
        await draft.setOrder(draftOrder);
    } else {
        throw new Error('User trying to draft out of turn.');
    }
};


const draftUser = async (pid: number) => {
	
	//console.log("draftUser");	
   // const draftOrder = await draft.getOrder();
   var draftOrder;
   //const pick = draftOrder[0];
   var pick = []; // put next pick in draft
	const schedule = await idb.cache.schedule.getAll();
	var i,ii;
	let usersGame, userGame;
	var userGameLocation;
	for ( i = 0; i < schedule.length; i++) {
		if (schedule[i].homeTid == g.userTid || schedule[i].awayTid == g.userTid) {
			usersGame = helpers.deepCopy(schedule[i]);
			userGame = true;	
			break;		
		}
	}	
	
	userGameLocation = i;
	
	//console.log(schedule);
	//console.log(usersGame);
	//console.log(draftOrder);
	draftOrder =  helpers.deepCopy(usersGame.champions.drafted);
	//console.log(draftOrder);	
//	console.log(pick.tid);	
	//console.log(g.userTids);	
	//console.log(pid);
	var round = 0;
	for ( i = 0; i < 20; i++) {
		round = i;
		//console.log(i);
		if (usersGame.champions.drafted[i].pid < 0) {
		//	console.log(usersGame.champions.undrafted[i]);
		//	console.log(usersGame.champions);
		//	console.log(usersGame.champions.drafted[i]);
			for (let ii = 0; ii < usersGame.champions.undrafted.length; ii++) {
		//		console.log(ii);
				if (usersGame.champions.undrafted[ii].hid == pid) {
					usersGame.champions.drafted[i].pid = pid;
					usersGame.champions.drafted[i].draft.hid = usersGame.champions.undrafted[ii].hid;
					usersGame.champions.drafted[i].draft.name = usersGame.champions.undrafted[ii].name;			
					usersGame.champions.drafted[i].draft.nameReal = usersGame.champions.undrafted[ii].nameReal;	
					
					usersGame.champions.drafted[i].draft.role = usersGame.champions.undrafted[ii].role;			
					usersGame.champions.drafted[i].draft.lane = usersGame.champions.undrafted[ii].lane;			
					usersGame.champions.drafted[i].draft.ratings  = {};			
					usersGame.champions.drafted[i].draft.ratings.MR = usersGame.champions.undrafted[ii].ratings.MR;			
					usersGame.champions.drafted[i].draft.ratings.ability2 = usersGame.champions.undrafted[ii].ratings.ability2;			
					usersGame.champions.drafted[i].draft.ratings.defense2 = usersGame.champions.undrafted[ii].ratings.defense2;			
					usersGame.champions.drafted[i].draft.ratings.attack2 = usersGame.champions.undrafted[ii].ratings.attack2;					
					usersGame.champions.drafted[i].draft.ratings.control = usersGame.champions.undrafted[ii].ratings.control;					
					usersGame.champions.drafted[i].draft.ratings.damage = usersGame.champions.undrafted[ii].ratings.damage;					
					usersGame.champions.drafted[i].draft.ratings.mobility = usersGame.champions.undrafted[ii].ratings.mobility;					
					usersGame.champions.drafted[i].draft.ratings.toughness = usersGame.champions.undrafted[ii].ratings.toughness;					
					usersGame.champions.drafted[i].draft.ratings.utility = usersGame.champions.undrafted[ii].ratings.utility;	
					usersGame.champions.drafted[i].draft.ratings.damageType = usersGame.champions.undrafted[ii].ratings.damageType;	
					let early =  usersGame.champions.undrafted[ii].ratings.early;
					let mid =  usersGame.champions.undrafted[ii].ratings.mid;			
					let late  =  usersGame.champions.undrafted[ii].ratings.late;			
					if (early>mid && early>late) {
						usersGame.champions.drafted[i].draft.ratings.earlyMidLate = "Early";
					} else if (mid>early && mid>late) {
						usersGame.champions.drafted[i].draft.ratings.earlyMidLate = "Mid";			
					} else {
						usersGame.champions.drafted[i].draft.ratings.earlyMidLate = "Late";						
					}	
					usersGame.champions.undrafted.splice(ii, 1);
				//	console.log(usersGame.champions.drafted[i].draft);
				//	console.log(usersGame.champions.undrafted);					
					break;
				}
			}
	//	console.log(i);
			//usersGame.champions.drafted[i].draft.draftpicks[0] = helpers.deepCopy(draft.genOrder(usersGame.champions.undrafted[0]));
			//console.log(usersGame.champions.drafted[i].draft.draftpicks[0]);
			break;
		}
	}
	//console.log(usersGame);	
	//console.log(userGameLocation);	
	schedule[userGameLocation] = usersGame;
	//console.log(schedule);	
	// removing this prevents updating?
    //await idb.cache.schedule.clear();	
	// the above did erase
	// the below did put back (how to update?)
	for ( i = 0; i < schedule.length; i++) {
		await idb.cache.schedule.put(schedule[i]);
		//await idb.cache.schedule.add(schedule[i]);

	}	
	
	const schedule2 = await idb.cache.schedule.getAll();
//console.log(schedule2);	

    if (round >= 19 && usersGame.champions.drafted[19].draft.name != undefined) {
        await updateStatus('Idle');
	}
	/*??
	await Promise.all(tids.map(([homeTid, awayTid]) => idb.cache.schedule.add({
        homeTid,
        awayTid,
    })));*/
	// find pick
	// make sure pid works
	// remove pid from undraftred and add to drafted
	// repeat until done?
	//console.log(pick);	
//	console.log(g.userTids.includes(pick.tid));	
	//console.log(pick.tid);	
	
   /* if (pick && g.userTids.includes(pick.tid)) {
        draftOrder.shift();
        await draft.selectPlayer(pick, pid);
        await draft.setOrder(draftOrder);
    } else {
        throw new Error('User trying to draft out of turn.');
    }*/
};

const endDraft = async (conditions: Conditions) => {
	// do live game
	// maybe give option?
	//console.log("got here");
	//game.play(numDays, conditions);
   // return ;
}

// exportPlayerAveragesCsv(2015) - just 2015 stats
// exportPlayerAveragesCsv("all") - all stats
const exportPlayerAveragesCsv = async (season: number | 'all') => {
    let players;
    if (g.season === season && g.phase <= g.PHASE.PLAYOFFS) {
        players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
    } else if (season === 'all') {
        players = await idb.getCopies.players({activeAndRetired: true});
    } else {
        players = await idb.getCopies.players({activeSeason: season});
    }

    // Array of seasons in stats, either just one or all of them
    let seasons;
    if (season === 'all') {
        seasons = _.uniq(_.flatten(players.map(p => p.ratings)).map(pr => pr.season));
    } else {
        seasons = [season];
    }

    //let output = "pid,Name,Pos,Age,Team,Season,GP,GS,Min,FGM,FGA,FG%,3PM,3PA,3P%,FTM,FTA,FT%,OReb,DReb,Reb,Ast,TO,Stl,Blk,BA,PF,Pts,+/-,PER,EWA\n";

    let output = "pid,Name,Pos,Team,Opp,Score,WL,Season,Playoffs,Min,ChK,ChD,ChA,ChKDA,ChSC,TwrD,TwrA,TwrSC,InhibD,InhibA,CS,CSOpp,CS20,CSOpp20,Jgl,Rvr,DrK,DrA,BrnK,BrnA,G(k)\n";

    for (const s of seasons) {
        const players2 = await idb.getCopies.playersPlus(players, {
//            attrs: ["pid", "name", "age"],
  //          ratings: ["pos"],
    //        stats: ["abbrev", "gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "pm", "per", "ewa"],
			
			attrs: ["pid", "name",  "age","born"],
			ratings: ["pos","languages","region"],
			stats: ["abbrev", "gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "per", "ewa","fgLowPost","fgaLowPost","fgMidRange","oppJM","kda","scTwr","scKills"],
		
            season: s,
        });

        for (const p of players2) {
          //  output += `${[p.pid, p.name, p.ratings.pos, p.age, p.stats.abbrev, s, p.stats.gp, p.stats.gs, p.stats.min, p.stats.fg, p.stats.fga, p.stats.fgp, p.stats.tp, p.stats.tpa, p.stats.tpp, p.stats.ft, p.stats.fta, p.stats.ftp, p.stats.orb, p.stats.drb, p.stats.trb, p.stats.ast, p.stats.tov, p.stats.stl, p.stats.blk, p.stats.ba, p.stats.pf, p.stats.pts, p.stats.pm, p.stats.per, p.stats.ewa].join(",")}\n`;
//            output += `${[p.pid, p.name, p.pos, g.teamAbbrevsCache[t.tid], g.teamAbbrevsCache[t2.tid], t.pts + "-" + t2.pts, t.pts > t2.pts ? "W" : "L", seasons[i],  games[i].playoffs, p.min, p.fg, p.fga, p.fgp, p.kda, p.sckills, p.pf, p.orb, p.scTwr, p.fgaLowPost, p.fgLowPost, p.tp, p.tpa, p.ft, p.fta, p.fgMidRange, p.oppJM, p.drb, p.blk, p.tov, p.ast, p.trb].join(",")}\n`;
            output += `${[p.pid, p.name, p.ratings.pos, p.age, p.ratings.region, p.ratings.languages, p.stats.abbrev, s, p.stats.gp, p.stats.gs, p.stats.min, p.born.loc, p.stats.fg, p.stats.fga, p.stats.fgp, p.stats.kda, p.stats.sckills, p.stats.pf, p.stats.orb, p.stats.scTwr, p.stats.fgaLowPost, p.stats.fgLowPost, p.stats.tp, p.stats.tpa, p.stats.ft, p.stats.fta, p.stats.fgMidRange, p.stats.oppJM, p.stats.drb, p.stats.blk, p.stats.tov, p.stats.ast, p.stats.trb].join(",")}\n`;

        }
    }

    return output;
};

// exportPlayerGamesCsv(2015) - just 2015 games
// exportPlayerGamesCsv("all") - all games
const exportPlayerGamesCsv = async (season: number | 'all') => {
    let games;
    if (season === "all") {
        games = await idb.getCopies.games();
    } else {
        games = await idb.getCopies.games({season});
    }

//    let output = "pid,Name,Pos,Team,Opp,Score,WL,Season,Playoffs,Min,FGM,FGA,FG%,3PM,3PA,3P%,FTM,FTA,FT%,OReb,DReb,Reb,Ast,TO,Stl,Blk,BA,PF,Pts,+/-\n";
    let output = "pid,Name,Pos,Team,Opp,Score,WL,Season,Playoffs,Min,ChK,ChD,ChA,ChKDA,ChSC,TwrD,TwrA,TwrSC,InhibD,InhibA,CS,CSOpp,CS20,CSOpp20,Jgl,Rvr,DrK,DrA,BrnK,BrnA,G(k)\n";

    const teams = games.map(gm => gm.teams);
    const seasons = games.map(gm => gm.season);
    for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < 2; j++) {
            const t = teams[i][j];
            const t2 = teams[i][j === 0 ? 1 : 0];
            for (const p of t.players) {
            //    output += `${[p.pid, p.name, p.pos, g.teamAbbrevsCache[t.tid], g.teamAbbrevsCache[t2.tid], `${t.pts}-${t2.pts}`, t.pts > t2.pts ? "W" : "L", seasons[i], games[i].playoffs, p.min, p.fg, p.fga, p.fgp, p.tp, p.tpa, p.tpp, p.ft, p.fta, p.ftp, p.orb, p.drb, p.trb, p.ast, p.tov, p.stl, p.blk, p.ba, p.pf, p.pts, p.pm].join(",")}\n`;
            output += `${[p.pid, p.name, p.pos, g.teamAbbrevsCache[t.tid], g.teamAbbrevsCache[t2.tid], t.pts + "-" + t2.pts, t.pts > t2.pts ? "W" : "L", seasons[i],  games[i].playoffs, p.min, p.fg, p.fga, p.fgp, p.kda, p.sckills, p.pf, p.orb, p.scTwr, p.fgaLowPost, p.fgLowPost, p.tp, p.tpa, p.ft, p.fta, p.fgMidRange, p.oppJM, p.drb, p.blk, p.tov, p.ast, p.trb].join(",")}\n`;
				
            }
        }
    }

    return output;
};

const exportLeague = async (stores: string[]) => {
    return league.exportLeague(stores);
};

const getLeagueName = async (lid: number) => {
    const l = await idb.meta.leagues.get(lid);
    return l.name;
};

const getLocal = async (name: $Keys<Local>): any => {
    return local[name];
};

const getTradingBlockOffers = async (pids: number[], dpids: number[]) => {
    const getOffers = async (userPids, userDpids) => {
        // Pick 10 random teams to try (or all teams, if g.numTeams < 10)
        const tids = _.range(g.numTeams);
        random.shuffle(tids);
        tids.splice(10);

        const estValues = await trade.getPickValues();

        const offers = [];
        for (const tid of tids) {
            let teams = [{
                tid: g.userTid,
                pids: userPids,
                dpids: userDpids,
            }, {
                tid,
                pids: [],
                dpids: [],
            }];

            if (tid !== g.userTid) {
                teams = await trade.makeItWork(teams, true, estValues);


                if (teams !== undefined) {
                    const summary = await trade.summary(teams);
                    teams[1].warning = summary.warning;
                    offers.push(teams[1]);
                }
            }
        }

        return offers;
    };

    const augmentOffers = async (offers) => {
        if (offers.length === 0) {
            return [];
        }

        const teams = await idb.getCopies.teamsPlus({
            attrs: ["abbrev", "region", "name", "strategy"],
            seasonAttrs: ["won", "lost"],
            season: g.season,
        });

        // Take the pids and dpids in each offer and get the info needed to display the offer
        return Promise.all(offers.map(async (offer, i) => {
            const tid = offers[i].tid;

            let players = await idb.cache.players.indexGetAll('playersByTid', tid);
            players = players.filter(p => offers[i].pids.includes(p.pid));
            players = await idb.getCopies.playersPlus(players, {
                attrs: ["pid", "name", "age", "contract", "injury", "watch","born"],
                ratings: ["ovr", "pot", "skills", "pos","MMR","languages"],
                stats: ["min", "pts", "trb", "ast", "per","kda"],
                season: g.season,
                tid,
                showNoStats: true,
                showRookies: true,
                fuzz: true,
            });

            let picks: any = await idb.cache.draftPicks.indexGetAll('draftPicksByTid', tid);
            picks = helpers.deepCopy(picks.filter(dp => offers[i].dpids.includes(dp.dpid)));
            for (const pick of picks) {
                pick.desc = helpers.pickDesc(pick);
            }

            const payroll = (await team.getPayroll(tid))[0];

            return {
                tid,
                abbrev: teams[tid].abbrev,
                region: teams[tid].region,
                name: teams[tid].name,
                strategy: teams[tid].strategy,
                won: teams[tid].seasonAttrs.won,
                lost: teams[tid].seasonAttrs.lost,
                pids: offers[i].pids,
                dpids: offers[i].dpids,
                warning: offers[i].warning,
                payroll,
                picks,
                players,
            };
        }));
    };

    const offers = await getOffers(pids, dpids);

    return augmentOffers(offers);
};

const handleUploadedDraftClass = async (uploadedFile: any, seasonOffset: 0 | 1 | 2) => {
    // What tid to replace?
    let draftClassTid;
	
	//console.log(uploadedFile);
	
    if (seasonOffset === 0) {
        draftClassTid = PLAYER.UNDRAFTED;
    } else if (seasonOffset === 1) {
        draftClassTid = PLAYER.UNDRAFTED_2;
    } else if (seasonOffset === 2) {
        draftClassTid = PLAYER.UNDRAFTED_3;
    } else {
        throw new Error("Invalid draft class index");
    }

    // Get all players from uploaded files
    let players = uploadedFile.players;

	//console.log(players);
    // Filter out any that are not draft prospects
    players = players.filter(p => p.tid === PLAYER.UNDRAFTED);
	//console.log(players);
    // Get scouting rank, which is used in a couple places below
    const teamSeasons = await idb.cache.teamSeasons.indexGetAll('teamSeasonsByTidSeason', [`${g.userTid},${g.season - 2}`, `${g.userTid},${g.season}`]);
    const scoutingRank = finances.getRankLastThree(teamSeasons, "expenses", "scouting");

    // Delete old players from draft class
    const oldPlayers = await idb.cache.players.indexGetAll('playersByTid', draftClassTid);
	
	//console.log(oldPlayers);
    for (const p of oldPlayers) {
        await idb.cache.players.delete(p.pid);
    }

    // Find season from uploaded file, for age adjusting
    let uploadedSeason;
    if (uploadedFile.hasOwnProperty("gameAttributes")) {
        for (let i = 0; i < uploadedFile.gameAttributes.length; i++) {
            if (uploadedFile.gameAttributes[i].key === "season") {
                uploadedSeason = uploadedFile.gameAttributes[i].value;
                break;
            }
        }
    } else if (uploadedFile.hasOwnProperty("startingSeason")) {
        uploadedSeason = uploadedFile.startingSeason;
    }

    let seasonOffset2 = seasonOffset;
//	console.log(seasonOffset2);	
    if (g.phase >= g.PHASE.FREE_AGENCY) {
        // Already generated next year's draft, so bump up one
        seasonOffset2 += 1;
    }

    const draftYear = g.season + seasonOffset2;
	//console.log(draftYear);	
    // Add new players to database
		//var i,j;
	var cpSorted;
	var topADC,topMID,topJGL,topTOP,topSUP;
	
	const c = await idb.cache.champions.getAll();
	
	const cp = await idb.cache.championPatch.getAll();		
	
	cpSorted = [];
	
	//g.numChampions
	for (let i = 0; i < g.numChampionsPatch; i++) {
		cpSorted.push({"champion": cp[i].champion,"cpid": cp[i].cpid,"rank": cp[i].rank,"role": cp[i].role});
	}					
	
	cpSorted.sort(function (a, b) { return a.rank - b.rank; });		
	

	topADC = [];
	topMID = [];
	topJGL = [];
	topTOP = [];
	topSUP = [];

	for (let i = 0; i < g.numChampionsPatch; i++) {
		if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
	//	   console.log(_.size(c));
			for (let j = 0; j < g.numChampions; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topADC.push(c[j].hid);
					j = g.numChampions;
				}
			}
		}
		if ((cpSorted[i].role == "MID") && (topMID.length < 5) ) {
//				  topMID.push(cpSorted[i].cpid);
			for (let j = 0; j < g.numChampions; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topMID.push(c[j].hid);
					j = g.numChampions;
				}
			}
		}
		if ((cpSorted[i].role == "JGL") && (topJGL.length < 5) ) {
//				  topJGL.push(cpSorted[i].cpid);
			for (let j = 0; j < g.numChampions; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topJGL.push(c[j].hid);
					j = g.numChampions;
				}
			}
		}
		if ((cpSorted[i].role == "TOP") && (topTOP.length < 5) ) {
//				  topTOP.push(cpSorted[i].cpid);
			for (let j = 0; j < g.numChampions; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topTOP.push(c[j].hid);
					j = g.numChampions;
				}
			}
		}
		if ((cpSorted[i].role == "SUP") && (topSUP.length < 5) ) {
//				  topSUP.push(cpSorted[i].cpid);
			for (let j = 0; j < g.numChampions; j++) {
				if (c[j].name == cpSorted[i].champion) {
					topSUP.push(c[j].hid);
					j = g.numChampions;
				}
			}
		}
	
	}				
	
	
    await Promise.all(players.map(async (p) => {
        // Make sure player object is fully defined
		//console.log(c);
		//console.log(topADC);
		////console.log(topMID);
		//console.log(topJGL);
		
        p = player.augmentPartialPlayer(p, scoutingRank,c,topADC,topMID,topJGL,topTOP,topSUP);

        // Manually set TID, since at this point it is always PLAYER.UNDRAFTED
        p.tid = draftClassTid;

        // Manually remove PID, since all it can do is cause trouble
        if (p.hasOwnProperty("pid")) {
            delete p.pid;
        }

        // Adjust age
        if (uploadedSeason !== undefined) {
            p.born.year += g.season - uploadedSeason + seasonOffset2;
        }

        // Adjust seasons
        p.ratings[0].season = draftYear;
        p.draft.year = draftYear;

        // Don't want lingering stats vector in player objects, and draft prospects don't have any stats
        delete p.stats;

        await player.updateValues(p);
        await idb.cache.players.add(p);
    }));

    // "Top off" the draft class if <70 players imported
	var maxPlayers = Math.round(70 * g.numTeams / 30 * 3);
//    if (players.length < 70) {
	//console.log(maxPlayers);
    if (players.length < maxPlayers) {
//        await draft.genPlayers(draftClassTid, scoutingRank, 70 - players.length);
        await draft.genPlayers(draftClassTid, scoutingRank, maxPlayers - players.length, false,c,topADC,topMID,topJGL,topTOP,topSUP);
    }
};

const init = async (inputEnv: Env, conditions: Conditions) => {
	console.log('init!')
    Object.assign(env, inputEnv);

    // Kind of hacky, only run this for the first host tab
    if (idb.meta === undefined) {
        checkNaNs();

        idb.meta = await connectMeta(inputEnv.fromLocalStorage);

        // Account and changes checks can be async
        changes.check(conditions);
        account.check(conditions);
	}
	
	await toUI(['initAds']);
};

const lockSet = async (name: LockName, value: boolean) => {
    lock.set(name, value);
};

const ratingsStatsPopoverInfo = async (pid: number) => {
    const p = await idb.getCopy.players({pid});
    if (p === undefined) {
        throw new Error(`Invalid player ID ${pid}`);
    }
    return idb.getCopy.playersPlus(p, {
        ratings: ['ovr', 'pot', 'hgt', 'stre', 'spd', 'jmp', 'endu', 'ins', 'dnk', 'ft', 'fg', 'tp', 'blk', 'stl', 'drb', 'pss', 'reb'],
        stats: ['pts', 'trb', 'ast', 'blk', 'stl', 'tov', 'min', 'per', 'ewa'],
        season: g.season,
        showNoStats: true,
        oldStats: true,
        fuzz: true,
    });
};

const ratingsStatsPopoverInfoChampions = async (pid: number) => {
	const championPatch = await idb.cache.championPatch.getAll();
	const champions = await idb.cache.champions.getAll();	
	console.log(championPatch);
	console.log(champions);
	
 	var championAdjusted = helpers.deepCopy(champions);	

	var low, medium;
		if (g.champType == 0) {			
			low = 0.025;
			medium = 0.05;			
		} else {
			low = 0.0025;
			medium = 0.01;			
		}	
	//	console.log(championPatch);
	//	console.log(champions);		
	//	console.log(championAdjusted);				
	//	console.log(low);
	//	console.log(medium);
	//	console.log(pid);		
		
		async function calcChampSynergy(champions, championAdjusted,hid) {
			
			for (let i = 0; i < champions.length; i++) {
				if (i == hid) {
				championAdjusted[i].ratings.namesSyn =  []	;				
				championAdjusted[i].ratings.namesCtrs =  []	;				
				championAdjusted[i].ratings.namesCtr =  []	;				
					for (let j = 0; j < champions[i].ratings.synergy.length; j++) {	
						if (g.realChampNames) {	
						championAdjusted[i].ratings.namesSyn.push([champions[i].ratings.synergy[j],champions[j].nameReal]);
						championAdjusted[i].ratings.namesCtrs.push([champions[i].ratings.counter[j],champions[j].nameReal]);
						championAdjusted[i].ratings.namesCtr.push([champions[i].ratings.counter[j],champions[j].nameReal]);
						} else {
						championAdjusted[i].ratings.namesSyn.push([champions[i].ratings.synergy[j],champions[j].name]);
						championAdjusted[i].ratings.namesCtrs.push([champions[i].ratings.counter[j],champions[j].name]);
						championAdjusted[i].ratings.namesCtr.push([champions[i].ratings.counter[j],champions[j].name]);
							
						}
					}			
				}
			}
		
		}
		
		await calcChampSynergy(champions, championAdjusted,pid);	
		//console.log(pid);				
		//console.log(championAdjusted[pid]);				
//		console.log(championAdjusted[pid]);		
		//console.log(championAdjusted[pid].ratings);		
		//championAdjusted[pid].sort((a, b) => b.ratings.synergy - a.ratings.synergy);
//	championAdjusted[pid].ratings.synergy.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });
//	championAdjusted[pid].ratings.names.sort();
championAdjusted[pid].ratings.namesSyn.sort(function(a, b) {
    return b[0] - a[0];
});		
championAdjusted[pid].ratings.namesCtrs.sort(function(a, b) {
    return b[0] - a[0];
});		
championAdjusted[pid].ratings.namesCtr.sort(function(a, b) {
    return a[0] - b[0];
});		
		console.log(championAdjusted[pid].ratings);		
		
		return championAdjusted[pid].ratings;
};

const releasePlayer = async (pid: number, justDrafted: boolean) => {
    const players = await idb.cache.players.indexGetAll('playersByTid', g.userTid);
    if (players.length <= 5) {
        return 'You must keep at least 5 players on your roster.';
    }

    const p = await idb.cache.players.get(pid);

    // Don't let the user update CPU-controlled rosters
    if (p.tid !== g.userTid) {
        return "You aren't allowed to do this.";
    }

    await player.release(p, justDrafted);
};

const removeLeague = async (lid: number) => {
    await league.remove(lid);
};

const reorderRosterDrag = async (sortedPids: number[]) => {
    await Promise.all(sortedPids.map(async (pid, rosterOrder) => {
        const p = await idb.cache.players.get(pid);
        if (p.rosterOrder !== rosterOrder) {
            p.rosterOrder = rosterOrder;
            await idb.cache.players.put(p);
        }
    }));
};

const runBefore = async (
    viewId: string,
    inputs: GetOutput,
    updateEvents: UpdateEvents,
    prevData: any,
    conditions: Conditions,
): Promise<(void | {[key: string]: any})[]> => {
    if (views.hasOwnProperty(viewId) && views[viewId].hasOwnProperty('runBefore')) {
        return Promise.all(views[viewId].runBefore.map((fn) => {
            return fn(inputs, updateEvents, prevData, conditions);
        }));
    }

    return [];
};



/*const sortChampions = async () => {
  let sortedChamps = helpers.deepCopy(g.cCache);
	sortedChamps.sort((a, b) => a.name - b.name);	
	console.log(sortedChamps);
    return sortedChamps;
};*/

const startFantasyDraft = async (position: number | 'random', conditions: Conditions) => {
    await phase.newPhase(g.PHASE.FANTASY_DRAFT, conditions, position);
};

const switchTeam = async (tid: number) => {
    await updateStatus('Idle');
    updatePlayMenu();

    await league.setGameAttributes({
        gameOver: false,
        userTid: tid,
        userTids: [tid],
        ownerMood: {
            wins: 0,
            playoffs: 0,
            money: 0,
        },
        gracePeriodEnd: g.season + 3, // +3 is the same as +2 when staring a new league, since this happens at the end of a season
    });
    league.updateMetaNameRegion(g.teamNamesCache[g.userTid], g.teamRegionsCache[g.userTid]);
};

const updateBudget = async (budgetAmounts: {
    coaching: number,
    facilities: number,
    health: number,
    scouting: number,
    ticketPrice: number,
}) => {
    const t = await idb.cache.teams.get(g.userTid);

    for (const key of Object.keys(budgetAmounts)) {
        // Check for NaN before updating
        if (budgetAmounts[key] === budgetAmounts[key]) {
            t.budget[key].amount = budgetAmounts[key];
        }
    }

    await idb.cache.teams.put(t);

    await finances.updateRanks(["budget"]);
};

const updateTeamCoachSelections = async (changes) => {
    //await league.setGameAttributes(gameAttributes);
	console.log(changes);
	const t = await idb.cache.teams.get(g.userTid);	
	console.log(t);
	console.log(t.coach);	
	t.coach.top = changes.coachTOP;
//	t.coach.top = changes.top;
	t.coach.jgl = changes.coachJGL;
	t.coach.mid = changes.coachMID;
	t.coach.adc = changes.coachADC;
	t.coach.sup = changes.coachADC;
	
	t.coach.topJGL = changes.coachTOPjgl;
	t.coach.jglJGL = changes.coachJGLjgl;
	t.coach.midJGL = changes.coachMIDjgl;
	t.coach.adcJGL = changes.coachADCjgl;
	t.coach.supJGL = changes.coachADCjgl;	
	
	console.log(t);	
    await idb.cache.teams.put(t);	
};

const updateGameAttributes = async (gameAttributes: GameAttributes) => {
    await league.setGameAttributes(gameAttributes);
};

const updateMultiTeamMode = async (gameAttributes: {userTids: number[], userTid?: number}) => {
    await league.setGameAttributes(gameAttributes);

    if (gameAttributes.userTids.length === 1) {
        league.updateMetaNameRegion(g.teamNamesCache[gameAttributes.userTids[0]], g.teamRegionsCache[gameAttributes.userTids[0]]);
    } else {
        league.updateMetaNameRegion('Multi Team Mode', '');
    }
};

const updatePlayerWatch = async (pid: number, watch: boolean) => {
    const cachedPlayer = await idb.cache.players.get(pid);
    if (cachedPlayer) {
        cachedPlayer.watch = watch;
        await idb.cache.players.put(cachedPlayer);
    } else {
        const p = await idb.league.players.get(pid);
        p.watch = watch;
        await idb.cache.players.add(p);
    }
};

const updatePlayingTime = async (pid: number, ptModifier: number) => {
    const p = await idb.cache.players.get(pid);
    p.ptModifier = ptModifier;
    await idb.cache.players.put(p);
};

const updateTeamInfo = async (newTeams: {
    cid?: number,
    did?: number,
    region: string,
    name: string,
    abbrev: string,
    imgURL?: string,
    pop: number,
}[]) => {
    let userName;
    let userRegion;

    const teams = await idb.cache.teams.getAll();
    for (const t of teams) {
        if (newTeams[t.tid].hasOwnProperty('cid') && typeof newTeams[t.tid].cid === 'number') {
            t.cid = newTeams[t.tid].cid;
        }
        if (newTeams[t.tid].hasOwnProperty('did') && typeof newTeams[t.tid].did === 'number') {
            t.did = newTeams[t.tid].did;
        }
        t.region = newTeams[t.tid].region;		
        t.name = newTeams[t.tid].name;
        t.abbrev = newTeams[t.tid].abbrev;
        t.country = newTeams[t.tid].country;		
        if (newTeams[t.tid].hasOwnProperty('imgURL')) {
            t.imgURL = newTeams[t.tid].imgURL;
        }

        await idb.cache.teams.put(t);

        if (t.tid === g.userTid) {
            userName = t.name;
            userRegion = t.region;
        }

        const teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsByTidSeason', `${t.tid},${g.season}`);
        teamSeason.pop = parseFloat(newTeams[t.tid].pop);
        await idb.cache.teamSeasons.put(teamSeason);
    }

    await league.updateMetaNameRegion(userName, userRegion);

    await league.setGameAttributes({
		teamCountryCache: newTeams.map(t => t.country),
        teamAbbrevsCache: newTeams.map(t => t.abbrev),
        teamRegionsCache: newTeams.map(t => t.region),
        teamNamesCache: newTeams.map(t => t.name),
    });
};


const updateChampionInfo = async (newChampions: {
    hid?: number,    
    name: string,
    early: number,
    mid: number,
    late: number,
}[]) => {
    let userName;
    let userRegion;

    const champions = await idb.cache.champions.getAll();
    const championPatch = await idb.cache.championPatch.getAll();
 //   const players = await idb.cache.players.getAll();
	

    for (const c of champions) {
		if (newChampions[c.hid] == undefined) {	
			console.log("can't reduce number of champions")
		} else {
			if (c.name != newChampions[c.hid].name) {
				for (const cp of championPatch) {
					if (cp.champion == c.name) {
						cp.champion = newChampions[c.hid].name;
						await idb.cache.championPatch.put(cp);
					}					
				}
			}
			c.name = newChampions[c.hid].name;
			c.ratings.early = newChampions[c.hid].ratings.early;
			c.ratings.mid = newChampions[c.hid].ratings.mid;
		    c.ratings.late = newChampions[c.hid].ratings.late;			
			
			await idb.cache.champions.put(newChampions[c.hid]);

		}
    }


	const players = await idb.cache.players.getAll();		

	for (const p of players) {

		for (let i = 0; i < newChampions.length; i++) {	
			p.champions[i] = {};
		
			p.champions[i].skill =  Math.round( p.ratings[p.ratings.length-1].ovr+(Math.random()*40-20),0);

			if (p.champions[i].skill< 0) {
				p.champions[i].skill = 0;
			} else if (p.champions[i].skill > 100 ) {
				p.champions[i].skill = 100;
			}
			//
			p.champions[i].name =   newChampions[i].name;

		}
		await idb.cache.players.put(p);

	}			
//	}	
		
	if (newChampions.length < champions.length) {
		console.log("got here");				
		for (let i = 0; i < newChampions.length; i++) {	
			await idb.cache.champions.put(newChampions[i]);				
		}		
		let maxi;
		for (let i = newChampions.length ; i < champions.length; i++) {			
	console.log("can't lower number of champions");												
		}


		
	} else if (newChampions.length > champions.length) {
				console.log("got here");		
		 //add new champions
		for (let i =  0; i < champions.length; i++) {	
			await idb.cache.champions.put(newChampions[i]);				
		}	
		
		for (let i = champions.length ; i < newChampions.length; i++) {	
				console.log(i);
			await idb.cache.champions.add(newChampions[i]);
		}
	}
	

	console.log("got here");
			
};

const updateChampionPatch = async (newChampionPatch: {
    cpid?: number,
    champion: string,
    role: string,
    rank: number,
	
}[]) => {
	
    let userName;
    let userRegion;

    const championPatch = await idb.cache.championPatch.getAll();
    const cDefault = await idb.cache.champions.getAll();	
	//console.log(championPatch);
//	console.log(cDefault);	
	console.log(championPatch.length);
	console.log(newChampionPatch.length);	
    for (const cp of championPatch) {

		if (newChampionPatch[cp.cpid] == undefined) {
			//console.log(championPatch);
			//console.log(championPatch.pop());
			//console.log(championPatch);			
			//await idb.cache.championPatch.put(cp);	
			console.log("can't lower number of patch items");			
		} else {
			cp.champion = newChampionPatch[cp.cpid].champion;
			cp.role = newChampionPatch[cp.cpid].role;
			cp.rank = newChampionPatch[cp.cpid].rank;

			await idb.cache.championPatch.put(cp);
			
		}
		
    }
	//console.log(championPatch);	
	// Add new champions
	if ( g.numChampionsPatch < newChampionPatch.length) {				
		for (let i = championPatch.length  ; i < newChampionPatch.length; i++) {	
				console.log(i);
			await idb.cache.championPatch.add(newChampionPatch[i]);
		}
	} else if (g.numChampionsPatch > newChampionPatch.length) {
	//	for (let i = newChampionPatch.length ; i < g.numChampionsPatch; i++) {	
		//		console.log(i);					
			//	await idb.cache.championPatch.delete(i);	
		//}			
		console.log("can't lower number of patch items");
	}
	
	// update MMR/Rank of players based on new meta
	const players = await idb.cache.players.getAll();
	
	var cpSorted;
	cpSorted = [];
	
	for (let i = 0; i < _.size(newChampionPatch); i++) {
//    for (const cp of championPatch) {
//		cpSorted.push({"champion": cp[i].champion,"cpid": cp[i].cpid,"rank": cp[i].rank,"role": cp[i].role});
		
		cpSorted.push({"champion": newChampionPatch[i].champion,"cpid": newChampionPatch[i].cpid,"rank": newChampionPatch[i].rank,"role": newChampionPatch[i].role});
	}					
	
	cpSorted.sort(function (a, b) { return a.rank - b.rank; });		
	
	var topADC,topMID,topJGL,topTOP,topSUP;

	topADC = [];
	topMID = [];
	topJGL = [];
	topTOP = [];
	topSUP = [];
	//console.log(cpSorted);
	//console.log(cDefault);
	
	for (let i = 0; i < _.size(cpSorted); i++) {
		if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
	//	   console.log(_.size(cDefault));
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topADC.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}
		}
		if ((cpSorted[i].role == "MID") && (topMID.length < 5) ) {
//				  topMID.push(cpSorted[i].cpid);
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topMID.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}
		}
		if ((cpSorted[i].role == "JGL") && (topJGL.length < 5) ) {
//				  topJGL.push(cpSorted[i].cpid);
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topJGL.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}
		}
		if ((cpSorted[i].role == "TOP") && (topTOP.length < 5) ) {
//				  topTOP.push(cpSorted[i].cpid);
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topTOP.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}
		}
		if ((cpSorted[i].role == "SUP") && (topSUP.length < 5) ) {
//				  topSUP.push(cpSorted[i].cpid);
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topSUP.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}

		}
	
	}			
//	console.log(topADC);
//	console.log(topTOP);
//	console.log(topMID);
//	console.log(topJGL);
//	console.log(topSUP);
	
    for (const p of players) {	
	
		//console.log(p);
		let skillMMR = 0;
		let r = p.ratings.length - 1;
		
		if (p.ratings[0].pos== "ADC") { 
			for (let j = 0; j <  topADC.length; j++) {		
				skillMMR += p.champions[topADC[j]].skill
			}
		}
		if (p.ratings[0].pos== "TOP") {
			for (let j = 0; j <  topTOP.length; j++) {		
				skillMMR += p.champions[topTOP[j]].skill
			}
		}
		if (p.ratings[0].pos== "MID") {
			for (let j = 0; j <  topMID.length; j++) {		
				skillMMR += p.champions[topMID[j]].skill
			}
		}
		if (p.ratings[0].pos== "JGL") {
			for (let j = 0; j <  topJGL.length; j++) {		
				skillMMR += p.champions[topJGL[j]].skill
			}
		}
		if (p.ratings[0].pos== "SUP") {
			for (let j = 0; j <  topSUP.length; j++) {		
				skillMMR += p.champions[topSUP[j]].skill
			}
		}		
	//	console.log(skillMMR);
		p.ratings[r].MMR = player.MMRcalc(p.ratings[r].ovr,skillMMR);
		//p.ratings[r].MMR = Math.round(p.ratings[r].ovr*9 +2200+skillMMR*1,0); // up to 500 + 2200 + up to 500
		//console.log(p.ratings[0].ovr+" "+skillMMR+" "+p.ratings[0].MMR);
		//console.log(p.ratings[0].MMR);


		let fuzzedMMR = p.ratings[0].MMR+random.randInt(-50, 50);
		if ( fuzzedMMR < 2200) {
			p.ratings[r].rank = "Platinum 1";
		} else if ( fuzzedMMR< 2270) {
			p.ratings[r].rank = "Diamond V";
		} else if (fuzzedMMR < 2340) {
			p.ratings[r].rank = "Diamond IV";
		} else if (fuzzedMMR < 2410) {
			p.ratings[r].rank = "Diamond III";
		} else if (fuzzedMMR < 2480) {
			p.ratings[r].rank = "Diamond II";
		} else if (fuzzedMMR < 2550) {
			p.ratings[r].rank = "Diamond I";
		} else if (fuzzedMMR < 2750) {
			p.ratings[r].rank = "Master";
		} else  {
			p.ratings[r].rank = "Challenger";
		}	
	//	console.log(p);
        await idb.cache.players.put(p);
	}
			
};

const upsertCustomizedTeam = async (
    teamCreate: Team | TeamWithoutTid,
    originalTid: number, season: number,
): Promise<number> => {


    // Save to database, adding pid if it doesn't already exist
	//console.log(teamCreate);	
	//console.log(teamCreate.tid);	
	//console.log(originalTid);	
	if (originalTid == undefined) {
	
		const t = team.generate(teamCreate);	
		//	console.log(t.tid);
		await idb.cache.teams.put(t);
		//	console.log(t);

		let teamSeasons = [team.genSeasonRow(t.tid,t.cid,t.imgURLCountry,t.countrySpecific,false)];
//	teamSeasons[0].pop = t[i].pop;
		
		teamSeasons[0].pop = 10;
		teamSeasons[0].cidMid = t.cid;
		teamSeasons[0].cidNext = t.cid;
		teamSeasons[0].cidStart = t.cid;
		teamSeasons[0].countrySpecific = t.countrySpecific;
	//	console.log(t);	
	//	console.log(teamSeasons);
		
	   for (const teamSeason of teamSeasons) { 
		//	console.log(teamSeason);
			teamSeason.tid = t.tid;
			await idb.cache.teamSeasons.add(teamSeason);
		}	
		
		 
		 let teamStats = [team.genStatsRow(t.tid)];	
		 for (const teamStat of teamStats) {
		//	console.log(teamStat);			
			teamStat.tid = t.tid;
			if (!teamStat.hasOwnProperty("ba")) {
				teamStat.ba = 0;
			}
			await idb.cache.teamStats.add(teamStat);
		}	
		
		
	   const teams = await idb.cache.teams.getAll();
	  
		await league.setGameAttributes({
			numTeams: g.numTeams + 1,		
			teamCountryCache: teams.map(tt => tt.country),
			teamAbbrevsCache: teams.map(tt => tt.abbrev),
			teamRegionsCache: teams.map(tt => tt.region),
			teamNamesCache: teams.map(tt => tt.name),
		});	
				
		if (typeof t.tid !== 'number') {
			throw new Error('Unknown tid');
		}

		return t.tid;				
				
			
	} else {
		
		//teamCreate.seasonAttr[0].
		await idb.cache.teams.put(teamCreate);	
		let teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${teamCreate.tid}`);		
	//	console.log(teamSeason);
	//	teamCreate.seasonAttrs.tid = teamCreate.tid;
		teamSeason.cidMid = teamCreate.cid;
		teamSeason.cidNext = teamCreate.cid;
		teamSeason.cidStart = teamCreate.cid;
		teamSeason.countrySpecific = teamCreate.countrySpecific;		
	//	console.log(teamSeason);		
	//	console.log(teamCreate);	
	//	console.log(teamCreate.seasonAttrs);			
		await idb.cache.teamSeasons.put(teamSeason);		
		return originalTid;		
	}

	
   // await league.setGameAttributes({
	//	numTeams: g.numTeams + 1,
//		teamAbbrevsCache: t.abbrev,
		//teamRegionsCache: t.region,
		//teamNamesCache: t.name,
		//});
     //teamAbbrevsCache: teams.map(t => t.abbrev),
       // teamRegionsCache: teams.map(t => t.region),
        //teamNamesCache: teams.map(t => t.name),
	
//	console.log(t);
	//console.log(teamStats);	
	//console.log(teamSeasons);	
  
};


const upsertCustomizedPlayer = async (
    p: Player | PlayerWithoutPid,
    originalTid: number, season: number, ovrOption: string,
): Promise<number> => {
    const r = p.ratings.length - 1;

	//console.log(p);
	//console.log(p.tid);
	//console.log(originalTid);	
    // Fix draft season
    if (p.tid === PLAYER.UNDRAFTED || p.tid === PLAYER.UNDRAFTED_2 || p.tid === PLAYER.UNDRAFTED_3) {
        if (p.tid === PLAYER.UNDRAFTED) {
            p.draft.year = season;
        } else if (p.tid === PLAYER.UNDRAFTED_2) {
            p.draft.year = season + 1;
        } else if (p.tid === PLAYER.UNDRAFTED_3) {
            p.draft.year = season + 2;
        }

        // Once a new draft class is generated, if the next season hasn't started, need to bump up year numbers
        if (g.phase >= g.PHASE.FREE_AGENCY) {
            p.draft.year += 1;
        }

        p.ratings[r].season = p.draft.year;
    }

    // Set ovr, skills, and bound pot by ovr
	console.log(ovrOption);
	console.log(p.ratings[r]);
	console.log(p.ratings[r].oldOVR);
	
//	if (ovrOption == "OVR") {
	if (p.ratings[r].oldOVR) {
		let oldOVR = player.ovr(p.ratings[r]);
		let ovrDifference =  p.ratings[r].ovr - oldOVR;

		for (let rating in p.ratings[r]) {
			if (rating == "ovr" || rating == "pot" || rating == "pos" || rating == "pot"  || rating == "languages" || rating == "seasonSplit"  || rating == "region"  || rating == "season"  || rating == "skills"  || rating == "MMR"   || rating == "fuzz"   || rating == "rank" ) {
			} else {
				p.ratings[r][rating] +=  ovrDifference ;
				p.ratings[r][rating] = helpers.bound(parseInt(p.ratings[r][rating], 10), 0, 100);
			}
		}		 
		p.ratings[r].ovr = player.ovr(p.ratings[r]);
	} else {
		p.ratings[r].ovr = player.ovr(p.ratings[r]);
	}
    p.ratings[r].skills = player.skills(p.ratings[r]);
    if (p.ratings[r].ovr > p.ratings[r].pot) {
        p.ratings[r].pot = p.ratings[r].ovr;
    }
	p.ratings[r].region = p.born.loc;
				// put new champion stats here w/ MMR calc
				// player not loading in order to do ovr calc
		//if (g.gameType < 7) {
				//target.ratings[r].ovr = player.ovr(target.ratings[r]);
		//	console.log(
//	console.log(p.ratings[r].ovr);
	for (let i = 0; i <  g.numChampions; i++) {
		//p.champions[i] = {};
//			p.champions[i].skill =  p.ratings[0].ovr+(Math.round(Math.random()*100,0)-10);
//			p.champions[i].skill =  p.ratings[0].ovr+(Math.random()*100*20-10);
		p.champions[i].skill =  Math.round(p.ratings[r].ovr+(Math.random()*40-20),0);

		if (p.champions[i].skill< 0) {
		   p.champions[i].skill = 0;
		} else if (p.champions[i].skill > 100 ) {
		   p.champions[i].skill = 100;
		}
		//
	//	p.ratings.champions[i].name =   cDefault[i].name;
	}	
//	console.log(p);

    const championPatch = await idb.cache.championPatch.getAll();
    const cDefault = await idb.cache.champions.getAll();		
	
	var cpSorted;
	cpSorted = [];
	
	for (let i = 0; i < _.size(championPatch); i++) {
//    for (const cp of championPatch) {
//		cpSorted.push({"champion": cp[i].champion,"cpid": cp[i].cpid,"rank": cp[i].rank,"role": cp[i].role});
		
		cpSorted.push({"champion": championPatch[i].champion,"cpid": championPatch[i].cpid,"rank": championPatch[i].rank,"role": championPatch[i].role});
	}					
	
	cpSorted.sort(function (a, b) { return a.rank - b.rank; });		
	
	var topADC,topMID,topJGL,topTOP,topSUP;

	topADC = [];
	topMID = [];
	topJGL = [];
	topTOP = [];
	topSUP = [];
	//console.log(cpSorted);
	//console.log(cDefault);
	
	for (let i = 0; i < _.size(cpSorted); i++) {
		if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
	//	   console.log(_.size(cDefault));
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topADC.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}
		}
		if ((cpSorted[i].role == "MID") && (topMID.length < 5) ) {
//				  topMID.push(cpSorted[i].cpid);
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topMID.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}
		}
		if ((cpSorted[i].role == "JGL") && (topJGL.length < 5) ) {
//				  topJGL.push(cpSorted[i].cpid);
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topJGL.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}
		}
		if ((cpSorted[i].role == "TOP") && (topTOP.length < 5) ) {
//				  topTOP.push(cpSorted[i].cpid);
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topTOP.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}
		}
		if ((cpSorted[i].role == "SUP") && (topSUP.length < 5) ) {
//				  topSUP.push(cpSorted[i].cpid);
			for (let j = 0; j < _.size(cDefault); j++) {
				if (cDefault[j].name == cpSorted[i].champion) {
					topSUP.push(cDefault[j].hid);
					j = _.size(cDefault);
				}
			}

		}
	
	}			
	
	var skillMMR;
	skillMMR = 0;
	//	console.log(p);
	if (p.pos != p.ratings[r].pos) {
		console.log("got here");
		p.champions = [];
	
	// this needs to call from champions list, really should be global
//        for (i = 0; i <  champions.champion.length; i++) {
//	console.log(g.numChampions);
	//if (g.gameType < 7) {
	//console.log( p.ratings[0].ovr);
//console.log(pg.champions.length);
//console.log(g.numChampions);
		p.pos = p.ratings[r].pos
		for (let i = 0; i <  g.numChampions; i++) {
		//	console.log(i);
			p.champions[i] = {};
			//p.champions.push({});
//			p.champions[i].skill =  p.ratings[0].ovr+(Math.round(Math.random()*100,0)-10);
//			p.champions[i].skill =  p.ratings[0].ovr+(Math.random()*100*20-10);
			p.champions[i].skill =  Math.round( p.ratings[r].ovr+(Math.random()*40-20),0);

			if (p.champions[i].skill< 0) {
			   p.champions[i].skill = 0;
			} else if (p.champions[i].skill > 100 ) {
			   p.champions[i].skill = 100;
			}
			//
			p.champions[i].name =   cDefault[i].name;
			//p.champions.length = i;
		}		
		
	}
		
	if (p.champions == undefined)	{
		console.log(p);
	}
		
	if (p.ratings[r].pos== "ADC") {
		for (let i = 0; i <  topADC.length; i++) {		
			skillMMR += p.champions[topADC[i]].skill
		}
	}
	if (p.ratings[r].pos== "TOP") {
		for (let i = 0; i <  topTOP.length; i++) {		
			skillMMR += p.champions[topTOP[i]].skill
		}
	}
	if (p.ratings[r].pos== "MID") {
		for (let i = 0; i <  topMID.length; i++) {		
			skillMMR += p.champions[topMID[i]].skill
		}
	}
	if (p.ratings[r].pos== "JGL") { 
		
		for (let i = 0; i <  topJGL.length; i++) {		
		//console.log(i);
		//console.log(topJGL[i]);						
			skillMMR += p.champions[topJGL[i]].skill
		//console.log(skillMMR);										
		}
	}
	if (p.ratings[r].pos== "SUP") {
		for (let i = 0; i <  topSUP.length; i++) {		
			skillMMR += p.champions[topSUP[i]].skill
		}
	}		
//	console.log(skillMMR);
	p.ratings[r].MMR = player.MMRcalc(p.ratings[r].ovr,skillMMR);
	
	var fuzzedMMR;
	fuzzedMMR = p.ratings[r].MMR+random.randInt(-50, 50);
	if ( fuzzedMMR < 2200) {
		p.ratings[r].rank = "Platinum 1";
	} else if ( fuzzedMMR< 2270) {
		p.ratings[r].rank = "Diamond V";
	} else if (fuzzedMMR < 2340) {
		p.ratings[r].rank = "Diamond IV";
	} else if (fuzzedMMR < 2410) {
		p.ratings[r].rank = "Diamond III";
	} else if (fuzzedMMR < 2480) {
		p.ratings[r].rank = "Diamond II";
	} else if (fuzzedMMR < 2550) {
		p.ratings[r].rank = "Diamond I";
	} else if (fuzzedMMR < 2750) {
		p.ratings[r].rank = "Master";
	} else  {
		p.ratings[r].rank = "Challenger";
	}	
    // If player was retired, add ratings (but don't develop, because that would change ratings)
    if (originalTid === PLAYER.RETIRED) {
        if (g.season - p.ratings[r].season > 0) {
            player.addRatingsRow(p, 15);
        }
    }

    // If we are *creating* a player who is not a draft prospect, make sure he won't show up in the draft this year
    if (p.tid !== PLAYER.UNDRAFTED && p.tid !== PLAYER.UNDRAFTED_2 && p.tid !== PLAYER.UNDRAFTED_3 && g.phase < g.PHASE.FREE_AGENCY) {
        // This makes sure it's only for created players, not edited players
        if (!p.hasOwnProperty("pid")) {
            p.draft.year = g.season - 1;
        }
    }
    // Similarly, if we are editing a draft prospect and moving him to a team, make his draft year in the past
    if ((p.tid !== PLAYER.UNDRAFTED && p.tid !== PLAYER.UNDRAFTED_2 && p.tid !== PLAYER.UNDRAFTED_3) && (originalTid === PLAYER.UNDRAFTED || originalTid === PLAYER.UNDRAFTED_2 || originalTid === PLAYER.UNDRAFTED_3) && g.phase < g.PHASE.FREE_AGENCY) {
        p.draft.year = g.season - 1;
    }

    // Recalculate player values, since ratings may have changed
    await player.updateValues(p);

    // Save to database, adding pid if it doesn't already exist
    await idb.cache.players.put(p);
	//console.log(p);

    // Add regular season or playoffs stat row, if necessary
    if (p.tid >= 0 && p.tid !== originalTid && g.phase <= g.PHASE.PLAYOFFS) {
        // If it is the playoffs, this is only necessary if p.tid actually made the playoffs, but causes only cosmetic harm otherwise.
        await player.addStatsRow(p, (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI));
    }

    if (typeof p.pid !== 'number') {
        throw new Error('Unknown pid');
    }

    return p.pid;
};

const clearTrade = async () => {
    await trade.clear();
};

const createTrade = async (teams: [{
    tid: number,
    pids: number[],
    dpids: number[],
}, {
    tid: number,
    pids: number[],
    dpids: number[],
}]) => {
    await trade.create(teams);
};

const proposeTrade = async (forceTrade: boolean): Promise<[boolean, ?string]> => {
    const output = await trade.propose(forceTrade);
    return output;
};

const tradeCounterOffer = async (): Promise<string> => {
    const message = await trade.makeItWorkTrade();
    return message;
};

const updateTrade = async (teams: [{
    tid: number,
    pids: number[],
    dpids: number[],
}, {
    tid: number,
    pids: number[],
    dpids: number[],
}]) => {
    await trade.updatePlayers(teams);
};

export default {
    actions,
    acceptContractNegotiation,
    autoSortRoster,
    beforeViewLeague,
    beforeViewNonLeague,
    cancelContractNegotiation,
    checkParticipationAchievement,
    clearTrade,
    clearWatchList,
    countNegotiations,
    createLeague,
    createTrade,
    deleteOldData,
    draftUntilUserOrEnd,
    draftUser,
    draftUntilUserOrEndFantasy,
    draftUserFantasy,
	endDraft,
    exportLeague,
    exportPlayerAveragesCsv,
    exportPlayerGamesCsv,
    getLeagueName,
    getLocal,
    getTradingBlockOffers,
    handleUploadedDraftClass,
    init,
    lockSet,
    proposeTrade,
    ratingsStatsPopoverInfo,
	ratingsStatsPopoverInfoChampions,
    releasePlayer,
    removeLeague,
    reorderRosterDrag,
    runBefore,
//	sortChampions,
    startFantasyDraft,
    switchTeam,
    tradeCounterOffer,
    updateBudget,
	updateTeamCoachSelections,
    updateGameAttributes,
    updateMultiTeamMode,
    updatePlayerWatch,
    updatePlayingTime,
    updateTeamInfo,
	updateChampionInfo,
	updateChampionPatch,
    updateTrade,
    upsertCustomizedPlayer,
	upsertCustomizedTeam,
};
