// @flow

import backboard from 'backboard';
import _ from 'underscore';
import {Cache, connectLeague, idb} from '../db';
import {PHASE, PLAYER, g, helpers} from '../../common';
import {champion, draft, finances, freeAgents, game, phase, player, season, team} from '../core';
import * as championPatch from '../../data/championPatch';
import * as champions from '../../data/champions2';
import * as championPatchLOL from '../../data/championPatchLOL';
import * as championPatchDOTA2 from '../../data/championPatchDOTA2';
import * as championsLOL from '../../data/championsLOL';
import * as championsDOTA2 from '../../data/championsDOTA2';
import {emitter, defaultGameAttributes, local, lock, random, toUI, updatePhase, updateStatus} from '../util';
import type {Conditions, GameAttributes} from '../../common/types';

// x and y are both arrays of objects with the same length. For each object, any properties in y but not x will be copied over to x.
function merge(x: Object[], y: Object[]): Object[] {
	//	console.log(x.length);
//		console.log(y.length);
		//console.log(x);
		//console.log(y);
    for (let i = 0; i < x.length; i++) {
        // Fill in default values as needed
		//console.log(i);
		//console.log(y[i]);
        for (const prop of Object.keys(y[i])) {
				//	console.log(prop);
            if (!x[i].hasOwnProperty(prop)) {
                x[i][prop] = y[i][prop];
				//	console.log(prop);
            }
        }
    }

    return x;
}

/**
 * Set values in the gameAttributes objectStore and update the global variable g.
 *
 * Items stored in gameAttributes are globally available through the global variable g. If a value is a constant across all leagues/games/whatever, it should just be set in globals.js instead.
 *
 * @param {Object} gameAttributes Each property in the object will be inserted/updated in the database with the key of the object representing the key in the database.
 * @returns {Promise} Promise for when it finishes.
 */
async function setGameAttributes(gameAttributes: GameAttributes) {
    const toUpdate = [];
    for (const key of helpers.keys(gameAttributes)) {
        if (g[key] !== gameAttributes[key]) {
            toUpdate.push(key);
        }
    }

    for (const key of toUpdate) {
        await idb.cache.gameAttributes.put({
            key,
            value: gameAttributes[key],
        });

        g[key] = gameAttributes[key];
    }
//console.log(gameAttributes);
    await toUI(['setGameAttributes', gameAttributes]);
    if (toUpdate.includes('userTid') || toUpdate.includes('userTids')) {
        await toUI(['emit', 'updateMultiTeam']);
    }
}

/**
 * Create a new league.
 *
 * @memberOf core.league
 * @param {string} name The name of the league.
 * @param {number} tid The team ID for the team the user wants to manage (or -1 for random).
 */
async function create(
    startingSeason: number,
    name: string,
    tid: number,
	typeid2: string,
	typeid: number,
	champid: number,
	patchid: number,
	yearid: number,
	GMCoachid: number,
	difficulty: number,
    leagueFile: Object = {},

    randomizeRosters?: boolean = false,
    conditions: Conditions,
): Promise<number> {
    await idb.meta.attributes.put(tid, 'lastSelectedTid');

  //  const teamsDefault = helpers.getTeamsDefault();
	var fullLadder = true;
//console.log(tid+" "+name+" "+startingSeason+" "+randomizeRosters);

/*console.log(champid);
console.log(patchid);
console.log(yearid);
console.log(GMCoachid);
console.log(difficulty);
console.log(startingSeason);
console.log(name);
console.log(randomizeRosters);*/
//console.log(leagueFile);
//console.log(typeid+" "+typeid2+" "+patchid);

	//console.log(typeid);
//console.log(gameType);
	//console.log(g.gameType);

	// gameType diffirent create new league and then sub in players for some teams/conferences
  //console.log("typeid: "+typeid);

	var differentGameType = false;
	var oldGameType = 0;

	var mobaGMFile = true;
	var mobaGMFileFound = false;
    if (leagueFile.hasOwnProperty("gameAttributes")) {
	//	console.log(leagueFile.gameAttributes);
	//	if (typeof leagueFile.gameAttributes.gameType != "undefined") {
		//	alert("GOT THERE");
		//}

		for (let i = 0; i < leagueFile.gameAttributes.length; i++) {

				//if leagueFile.gameAttributes[i].gameType ==
			if (leagueFile.gameAttributes[i].key == "gameType" ) {
		//		console.log("gameType: "+leagueFile.gameAttributes[i].value);
		//		console.log("typeid: "+typeid);

				if (leagueFile.gameAttributes[i].value == typeid) {
				} else {
					differentGameType = true;

					oldGameType = leagueFile.gameAttributes[i].value;
				}
			// Set default for anything except team ID and name, since they can be overwritten by form input.
				//gameAttributes[leagueFile.gameAttributes[i].key] = leagueFile.gameAttributes[i].value;
			}
		//	console.log(leagueFile.gameAttributes[i].key);
			if (leagueFile.gameAttributes[i].key == "GMCoachType" ) {
			//	console.log("GMCoachType found");
				mobaGMFileFound = true;
			} else {
		//		mobaGMFile = false;
			}

		}
		if (mobaGMFileFound) {


		} else {
				//console.log("turned false");

			mobaGMFile = false;
		}
	} else {
    //another way to detect file
    // can judge based on conference ids?
//    console.log(leagueFile);
    if (leagueFile.hasOwnProperty("teams")) {

      if (typeid == 7) {
        // check below for cids greater than 5 to confirm game type
        differentGameType = true;
      }

      for (let i = 0; i < leagueFile.teams.length; i++) {
      //  console.log(typeid+" "+leagueFile.teams[i].cid);
        if ( (typeid == -1 && leagueFile.teams[i].cid != 0) ||
          (typeid == 0 && leagueFile.teams[i].cid != 0) ||
          (typeid == 1 && leagueFile.teams[i].cid > 2) ||
           (typeid == 2 && leagueFile.teams[i].cid != 0) ||
            (typeid == 3 && leagueFile.teams[i].cid != 0) ||
             (typeid == 4 && leagueFile.teams[i].cid != 0)
           )  {
          differentGameType = true;
          break;
        } else if (typeid == 7 && leagueFile.teams[i].cid > 5) {
          // must be this type, no other type has this many conferences
          differentGameType = false;
          break;
        }
      }
      if (differentGameType) {
          if (leagueFile.teams.length >= 57 && leagueFile.teams.length < 129) {
            oldGameType = 5;
          } else if (leagueFile.teams.length > 129) {
            oldGameType = 7;
          } else if (leagueFile.teams.length >= 30) {
            oldGameType = 1;
          }
      }

      //if (differentGameType && typeid == 2) {
//        for (let i = 0; i < leagueFile.teams.length; i++) {
  //      }
    //  }
    }
  }
//  console.log(leagueFile.teams.length );
  console.log(oldGameType);
  console.log(typeid);
  console.log(leagueFile);
  console.log(differentGameType);
	let mobaGMChampFile = false;
	//	console.log(leagueFile);
	//console.log(leagueFile.hasOwnProperty("champions"));
	if (leagueFile.hasOwnProperty("champions")) {
	//	console.log(leagueFile);
	//	console.log(leagueFile.champions[0]);
	//	console.log(leagueFile.champions[0].ratings.synergy[0]);
	//	console.log(leagueFile.champions);
	//	console.log(leagueFile.champions[0].ratings.synergy);
//    console.log(leagueFile);
//    console.log(g.PHASE);
//    console.log(g);

//    console.log(leagueFile.champions[0].ratings.synergy[0]);
		if (leagueFile.champions[0].ratings.synergy == undefined) {
			mobaGMChampFile = false;
		} else {
			mobaGMChampFile = true;
		}
	}
//	console.log(mobaGMChampFile);

	//console.log("MOBA GM File: "+mobaGMFile);
	/*if (leagueFile.gameAttributes[i].key == "gameType") {
		if (leagueFile.gameAttributes[i].gameType == typeid) {
			differentGameType = false;
			gameAttributes[leagueFile.gameAttributes[i].key] = leagueFile.gameAttributes[i].value;
		} else {
			differentGameType = true;
			oldGameType = leagueFile.gameAttributes[i].gameType;
		}
	} */
	//console.log(differentGameType);
	//console.log(oldGameType);




	var teamsDefault;



    // Any custom teams?
    let teams: any;

	if (typeid === 0) {
		teamsDefault = helpers.getTeamsNADefault();
	} else if (typeid == -1) {
		teamsDefault = helpers.getTeamsEUDefault();
	} else if (typeid == 1) {
		teamsDefault = helpers.getTeamsDefault();
	} else if (typeid == -2) {
		teamsDefault = helpers.getTeamsDefaultEU();
	} else if (typeid == 2) {
		teamsDefault = helpers.getTeamsLCKDefault();
	} else if (typeid == 3) {
		teamsDefault = helpers.getTeamsLPLDefault();
	} else if (typeid == 4) {
		teamsDefault = helpers.getTeamsLMSDefault();
	} else if (typeid == 5) {
		if (yearid == 2019) {
			teamsDefault = helpers.getTeamsWorlds2019();
//console.log(teamsDefault);
		} else {
			teamsDefault = helpers.getTeamsWorldsDefault();
		}
	} else if (typeid == 6) {
		teamsDefault = helpers.getTeamsWorldsDefault();
	} else {
		teamsDefault = helpers.getTeamsWorldsLadderDefault();
	}

	//console.log(teamsDefault);
	var oldTid = 0;
	var newTid = 0;
	var newCid = 0;
	var worldsToLadder = false;
	var ladderToWorlds = false;
	var NALadderToWorldsLadder = false;
	var EULadderToWorldsLadder = false;

	if (differentGameType) {
		if (typeid == 0) {
			if (oldGameType == 5 || oldGameType == 6 ) {
				newTid = 0;
			} else if (oldGameType == 7) {
				newTid = 0;
			}
		} else if (typeid == -1) {
			if (oldGameType == 5 || oldGameType == 6 ) {
				newTid = -10;
        newCid = -1;
			} else if (oldGameType == 7) {
				newTid = -22;
        newCid = -5;
			}
		} else if (typeid == 2) {
			if (oldGameType == 5 || oldGameType == 6 ) {
				newTid = -20;
        newCid = -2;
			} else if (oldGameType == 7) {
				newTid = -44;
        newCid = -8;
			}
		} else if (typeid == 3) {
			if (oldGameType == 5 || oldGameType == 6 ) {
				newTid = -30;
        newCid = -3;
			} else if (oldGameType == 7) {
				newTid = -66;
        newCid = -11;
			}
		} else if (typeid == 4) {
			if (oldGameType == 5 || oldGameType == 6 ) {
				newTid = -42;
        newCid = -4;
			} else if (oldGameType == 7) {
				newTid = -90;
        newCid = -14;
			}
		} else if (typeid == 5 || typeid == 6) {

			//regionType == "EU"
			if (oldGameType == 0 && regionType == "") {
				oldTid = 0;
				newTid = 0;
			} else if (oldGameType == 0 && regionType == "EU") {
				oldTid = 0;
				newTid = 10;
			/*} else if (oldGameType == 1 && regionType == "") {
				oldTid = 0;
				newTid = 0;
			} else if (oldGameType == 1 && regionType == "EU") {
				oldTid = 0;
				newTid = 10;*/
			} else if (oldGameType == 2) {
				oldTid = 0;
				newTid = 20;
			} else if (oldGameType == 3) {
				oldTid = 0;
				newTid = 30;
			} else if (oldGameType == 4) {
				oldTid = 0;
				newTid = 42;
			} else if (oldGameType == 7) {
				ladderToWorlds = true;
			}
		} else if (typeid == 7) {

			//regionType == "EU"
			if (oldGameType == 0 && regionType == "") {
				oldTid = 0;
				newTid = 0;
			} else if (oldGameType == 0 && regionType == "EU") {
				oldTid = 0;
				newTid = 22;
			} else if (oldGameType == 1 && regionType == "") {
				NALadderToWorldsLadder = true;
			} else if (oldGameType == 1 && regionType == "EU") {
				EULadderToWorldsLadder = true;
			} else if (oldGameType == 2) {
				oldTid = 0;
				newTid = 44;
			} else if (oldGameType == 3) {
				oldTid = 0;
				newTid = 66;
			} else if (oldGameType == 4) {
				oldTid = 0;
				newTid = 90;
			} else if (oldGameType == 5 || oldGameType == 6 ) {
				//oldTid = 0;
				//newTid = 90;
				worldsToLadder = true;
			}
		}
	}

    if (leagueFile.hasOwnProperty("teams") && !differentGameType) {
      teams = leagueFile.teams;
      teams = helpers.addPopRank(teams);
  		if (teams[0].seasons == undefined) {
  			console.log("FIX");
  			for (i = 0; i < teams.length; i++) {
  				teams[i].seasons = [];
  				teams[i].seasons[0] = {};
  			}
  		}

  		if (teams[0].seasons[0].lostSpring == undefined) {
  			console.log("FIX");
  			for (i = 0; i < teams.length; i++) {
  				// fix missing data
  				if (teams[i].seasons[0].lostSpring == undefined) {
  					teams[i].seasons[0].lostSpring = 0;
  				}
  				if (teams[i].seasons[0].lostSummer == undefined) {
  					teams[i].seasons[0].lostSummer = 0;
  				}
  				if (teams[i].seasons[0].lostSpring == undefined) {
  					teams[i].seasons[0].lostSpring = 0;
  				}
  				if (teams[i].seasons[0].pointsSpring == undefined) {
  					teams[i].seasons[0].pointsSpring = 0;
  				}
  				if (teams[i].seasons[0].pointsSummer == undefined) {
  					teams[i].seasons[0].pointsSummer = 0;
  				}
  				if (teams[i].seasons[0].wonSummer == undefined) {
  					teams[i].seasons[0].wonSummer = 0;
  				}
  				if (teams[i].seasons[0].wonSpring == undefined) {
  					teams[i].seasons[0].wonSpring = 0;
  				}
  			}
  		}

  		if (teamsDefault.length == teams.length) {
  			teams = merge(teams, teamsDefault);
  		}

    } else if (leagueFile.hasOwnProperty("teams") && differentGameType) {
      teams = teamsDefault;

    //  if (typeID == 1) {
    //    leagueFile.teams.sort
    //  }

  		for (i = 0; i < leagueFile.teams.length; i++) {

  			if (worldsToLadder) {
  				if (leagueFile.teams[i].tid >=0 &&	leagueFile.teams[i].tid  < 10	) {
  					leagueFile.teams[i].tid  += 0;

  				} else if (leagueFile.teams[i].tid >=10 &&	leagueFile.teams[i].tid  < 20	) {
  					leagueFile.teams[i].tid  += 12;
  					leagueFile.teams[i].cid  = 3;
  					leagueFile.teams[i].did  = 3;
  				} else if (leagueFile.teams[i].tid >=20 &&	leagueFile.teams[i].tid  < 30	) {
  					leagueFile.teams[i].tid  += 24;
  					leagueFile.teams[i].cid  = 6;
  					leagueFile.teams[i].did  = 6;

  				} else if (leagueFile.teams[i].tid >=30 &&	leagueFile.teams[i].tid  < 42	) {
  					leagueFile.teams[i].tid  += 36;
  					leagueFile.teams[i].cid  = 9;
  					leagueFile.teams[i].did  = 9;

  				} else if (leagueFile.teams[i].tid >=42 &&	leagueFile.teams[i].tid  < 50	) {
  					leagueFile.teams[i].tid  += 48;
  					leagueFile.teams[i].cid  = 12;
  					leagueFile.teams[i].did  = 12;
  				} else if (leagueFile.teams[i].tid  >=50 && leagueFile.teams[i].tid  < 57) {
  					leagueFile.teams[i].tid  += 60;
  					leagueFile.teams[i].cid  = 15;
  					leagueFile.teams[i].did  = 15;
            //  console.log(leagueFile.teams[i]);
          } else if (leagueFile.teams[i].tid  >=57  && leagueFile.teams[i].tid  < 63 ) {
    					leagueFile.teams[i].tid  += 60;
    					leagueFile.teams[i].cid  = 16;
    					leagueFile.teams[i].did  = 16;
            //  console.log(leagueFile.teams[i]);
          } else if (leagueFile.teams[i].tid  >=63 ) {
    					leagueFile.teams[i].tid  += 60;
    					leagueFile.teams[i].cid  = 17;
    					leagueFile.teams[i].did  = 17;
            //  console.log(leagueFile.teams[i]);
  				}
          leagueFile.teams[i].seasons[0].cidMid  = leagueFile.teams[i].tid;
          leagueFile.teams[i].seasons[0].cidNext  = leagueFile.teams[i].tid;
          leagueFile.teams[i].seasons[0].cidStart  = leagueFile.teams[i].tid;
          leagueFile.teams[i].seasons[0].ladderCSLCS = leagueFile.teams[i].cid%3;
//          console.log(leagueFile.teams[i].cid);
  //        console.log(leagueFile.teams[i].seasons[0].ladderCSLCS);
  			} else if (ladderToWorlds) {
  			//	console.log(leagueFile.teams[i]);
  				if (leagueFile.teams[i].tid  >=0 &&	leagueFile.teams[i].tid < 10	) {
  					leagueFile.teams[i].tid  += 0;
  				} else if (leagueFile.teams[i].tid  >=22 &&	leagueFile.teams[i].tid  < 32	) {
  					leagueFile.teams[i].tid -= 12;
  					leagueFile.teams[i].cid  = 1;
  					leagueFile.teams[i].did  = 1;
  					leagueFile.teams[i].seasons[0].cidMid  = 1;
  					leagueFile.teams[i].seasons[0].cidNext  = 1;
  					leagueFile.teams[i].seasons[0].cidStart  = 1;

  				} else if (leagueFile.teams[i].tid  >=44 &&	leagueFile.teams[i].tid  < 54	) {
  					leagueFile.teams[i].cid  = 2;
  					leagueFile.teams[i].did  = 2;
  					leagueFile.teams[i].tid -= 24;
  					leagueFile.teams[i].seasons[0].cidMid  = 2;
  					leagueFile.teams[i].seasons[0].cidNext  = 2;
  					leagueFile.teams[i].seasons[0].cidStart  = 2;

  				} else if (leagueFile.teams[i].tid >=66 &&	leagueFile.teams[i].tid  < 78	) {
  					leagueFile.teams[i].tid -= 36;
  					leagueFile.teams[i].cid  = 3;
  					leagueFile.teams[i].did  = 3;
  					leagueFile.teams[i].seasons[0].cidMid  = 3;
  					leagueFile.teams[i].seasons[0].cidNext  = 3;
  					leagueFile.teams[i].seasons[0].cidStart  = 3;

  				} else if (leagueFile.teams[i].tid >= 90 &&	leagueFile.teams[i].tid  < 98	) {
  					leagueFile.teams[i].tid -= 48;
  					leagueFile.teams[i].cid  = 4;
  					leagueFile.teams[i].did  = 4;
  					leagueFile.teams[i].seasons[0].cidMid  = 4;
  					leagueFile.teams[i].seasons[0].cidNext  = 4;
  					leagueFile.teams[i].seasons[0].cidStart  = 4;

  				} else if (leagueFile.teams[i].tid >=110 ) {
  					leagueFile.teams[i].tid -= 60;
  					leagueFile.teams[i].cid  = 5;
  					leagueFile.teams[i].did  = 5;
  					leagueFile.teams[i].seasons[0].cidMid  = 5;
  					leagueFile.teams[i].seasons[0].cidNext  = 5;
  					leagueFile.teams[i].seasons[0].cidStart  = 5;

  				} else  {
  					leagueFile.teams[i].tid = -60;
  				}
  		//	} else if (typeID == 1) {

  			} else if (leagueFile.teams[i].tid  >= 0) {
  				leagueFile.teams[i].tid += newTid;
          leagueFile.teams[i].cid += newCid;
          leagueFile.teams[i].did += newCid;
          leagueFile.teams[i].seasons[0].cidMid  = leagueFile.teams[i].cid;
          leagueFile.teams[i].seasons[0].cidNext  = leagueFile.teams[i].cid;
          leagueFile.teams[i].seasons[0].cidStart  = leagueFile.teams[i].cid;
  			}
  			if ( (leagueFile.teams[i].tid>=0) && (leagueFile.teams[i].tid<= teams.length-1) ) {
  				teams[leagueFile.teams[i].tid] = leagueFile.teams[i];
  			} else if ( (leagueFile.teams[i].tid>=0) && (leagueFile.teams[i].tid > teams.length-1) ) {
          if ((typeid == -1 || typeid == 0 || (typeid >= 2 && typeid <= 4 ) ) && leagueFile.teams[i].cid != 0) {
          } else if ((typeid == 1) && leagueFile.teams[i].cid > 2) {
          } else {
            teams.push(leagueFile.teams[i]);
          }

        }

  		}

  		teams = merge(teams, teamsDefault);

    } else {
        teams = teamsDefault;
    }

    // Handle random team
    if (tid === -1 || tid > teams.length) {
        tid = random.randInt(0, teams.length - 1);
    }

	let ownerType;
	ownerType = random.randInt(0,6);

	if ((typeid == 1) || (typeid == -2)) {
		if (ownerType == 2) {

		} else if (ownerType < 5) {
			ownerType = 0;
		} else {
			ownerType = 2;

		}
	}

	let conferences,divisions;
    conferences = [{cid: 0, name: "League Championship Series"}, {cid: 1, name: "Challenger Series"}, {cid: 2, name: "Ladder"}];
	divisions = [{did: 0, cid: 0, name: "LCS"}, {did: 1, cid: 1, name: "CS"}, {did: 2, cid: 2, name: "L"}];



	//https://en.wikipedia.org/wiki/List_of_League_of_Legends_leagues_and_tournaments
	//http://www.lolesports.com/en_US/na-cs/nacs_2017_spring/schedule/playoffs
	// Default conference and divisions
	if (typeid == 0) {
		conferences = [{cid: 0, name: "League Championship Series"}];
		divisions = [{did: 0, cid: 0, name: "LCS"}];
	} else if (typeid == -1) {
		conferences = [{cid: 0, name: "League Championship Series"}];
		divisions = [{did: 0, cid: 0, name: "LCS"}];
	} else if ((typeid == 1) ) {
		conferences = [{cid: 0, name: "League Championship Series"}, {cid: 1, name: "Challenger Series"}, {cid: 2, name: "Ladder"}];
		divisions = [{did: 0, cid: 0, name: "LCS"}, {did: 1, cid: 1, name: "CS"}, {did: 2, cid: 2, name: "L"}];
	} else if ((typeid == -2) ) {
		conferences = [{cid: 0, name: "League Championship Series"}, {cid: 1, name: "Challenger Series"}, {cid: 2, name: "Ladder"}];
		divisions = [{did: 0, cid: 0, name: "LCS"}, {did: 1, cid: 1, name: "CS"}, {did: 2, cid: 2, name: "L"}];
	} else if (typeid == 2) {
		conferences = [{cid: 0, name: "League Champions Korea"}];
		divisions = [{did: 0, cid: 0, name: "LCK"}];
	} else if (typeid == 3) {
		conferences = [{cid: 0, name: "Legends Pro League"}];
		divisions = [{did: 0, cid: 0, name: "LPL"}];

	} else if (typeid == 4) {
		conferences = [{cid: 0, name: "League Masters Series"}];
		divisions = [{did: 0, cid: 0, name: "LMS"}];
	} else if (typeid == 5 || typeid == 6) {
		if (yearid == 2019 && typeid == 5) {
					// korea 3
//china 3
// EU 	3
//NA 3
// LMS 3
// VCS 2
// SOUTHEAST ASIA – LST 1
// BRAZIL – CBLOL - 1
//COMMONWEALTH OF INDEPENDENT STATES – LCL - 1
// JAPAN – LJL -1
//LATIN AMERICA – LLA  1
//OCEANIA – OPL - 1
//TURKEY – TCL 1

			conferences = [{cid: 0, name: "NA League Championship Series"}, {cid: 1, name: "EU League Championship Series"}, {cid: 2, name: "League Champions Korea"}, {cid: 3, name: "Legends Pro League"}, {cid: 4, name: "League Masters Series"},
			{cid: 5, name: "Vietnam Championship Series"},{cid: 6, name: "SEA League"}
			,{cid: 7, name: "Brazil League"},{cid: 8, name: "Continental League"}
			,{cid: 9, name: "Japan League"},{cid: 10, name: "Latin America League"}
			,{cid: 11, name: "Oceanic Pro League"},{cid: 12, name: "Turkish Championship League "}];
			divisions = [{did: 0, cid: 0, name: "NA-LCS"}, {did: 1, cid: 1, name: "EU-LCS"}, {did: 2, cid: 2, name: "LCK"}, {did: 3, cid: 3, name: "LPL"}, {did: 4, cid: 4, name: "LMS"},
			{did: 5, cid: 5, name: "VCS"},{did: 6, cid: 6, name: "SL"},{did: 7, cid: 7, name: "BL"},{did: 8, cid: 8, name: "CL"}
			,{did: 9, cid: 9, name: "JL"},{did: 10, cid: 10, name: "LAL"},{did: 11, cid: 11, name: "OPL"},{did: 12, cid: 12, name: "TCL"}
			];
		} else {

			conferences = [{cid: 0, name: "NA League Championship Series"}, {cid: 1, name: "EU League Championship Series"}, {cid: 2, name: "League Champions Korea"}, {cid: 3, name: "Legends Pro League"}, {cid: 4, name: "League Masters Series"}, {cid: 5, name: "League Wild Card Series"}];
			divisions = [{did: 0, cid: 0, name: "NA-LCS"}, {did: 1, cid: 1, name: "EU-LCS"}, {did: 2, cid: 2, name: "LCK"}, {did: 3, cid: 3, name: "LPL"}, {did: 4, cid: 4, name: "LMS"}, {did: 5, cid: 5, name: "WC"}];
		}
	} else {
		conferences = [{cid: 0, name: "NA League Championship Series"}, {cid: 1, name: "NA Challenger Series"}, {cid: 2, name: "NA Ladder"}, {cid: 3, name: "EU League Championship Series"}, {cid: 4, name: "EU Challenger Series"}, {cid: 5, name: "EU Ladder"}, {cid: 6, name: "League Champions Korea"}, {cid: 7, name: "Korea Challenger Series"}, {cid: 8, name: "Korea Ladder"}, {cid: 9, name: "Legends Pro League"}, {cid: 10, name: "China Challenger Series"}, {cid: 11, name: "China Ladder"}, {cid: 12, name: "League Masters Series"}, {cid: 13, name: "Taiwan Challenger Series"}, {cid: 14, name: "Taiwan Ladder"}, {cid: 15, name: "League Wild Card Series"}, {cid: 16, name: "WC Challenger Series"}, {cid: 17, name: "WC Ladder"}];
		divisions = [{did: 0, cid: 0, name: "NA-LCS"}, {did: 1, cid: 1, name: "NA-CS"}, {did: 2, cid: 2, name: "NA-L"}, {did: 3, cid: 3, name: "EU-LCS"}, {did: 4, cid: 4, name: "EU-CS"}, {did: 5, cid: 5, name: "EU-L"}, {did: 6, cid: 6, name: "LCK"}, {did: 7, cid: 7, name: "Korea-CS"}, {did: 8, cid: 8, name: "Korea-L"}, {did: 9, cid: 9, name: "LPL"}, {did: 10, cid: 10, name: "China-CS"}, {did: 11, cid: 11, name: "China-L"}, {did: 12, cid: 12, name: "LMS"}, {did: 13, cid: 13, name: "Taiwan-CS"}, {did: 14, cid: 14, name: "Taiwan-L"}, {did: 15, cid: 15, name: "WC"}, {did: 16, cid: 16, name: "WC-CS"}, {did: 17, cid: 17, name: "WC-L"}];
	}

	let regionType = "";
	if (typeid == -1) {
		typeid = 0;
		regionType = "EU";
	} else if (typeid == -2) {
		typeid = 1;
		regionType = "EU";
	}

	var startingSplit;
	var bothSplits = false;
	if (typeid >= 6) {
		startingSplit = "Spring";
		bothSplits = true;
	} else {
		startingSplit = "Summer";
	}

	if (typeid == 7) {
		let teamsConf3 = [];
		let teamsConf6 = [];
		let teamsConf9 = [];
		let teamsConf12 = [];
		let teamsConf15 = [];
		for (i = 0; i < teams.length; i++) {
		// need to user other cid variable:
			if (teams[i].cid === 2) {
				teamsConf3.push(teams[i]);
			}
			if (teams[i].cid === 5) {
				teamsConf6.push(teams[i]);
			}
			if (teams[i].cid === 8) {
				teamsConf9.push(teams[i]);
			}
			if (teams[i].cid === 11) {
				teamsConf12.push(teams[i]);
			}
			if (teams[i].cid === 14) {
				teamsConf15.push(teams[i]);
			}
		}
		if (teamsConf3.length >= 10 && teamsConf6.length >= 10 && teamsConf9.length >= 10 && teamsConf12.length >= 10 && teamsConf15.length >= 10) {
			fullLadder = true;
		} else {
			fullLadder = false;
		}
	}
	if (typeid < 6) {

		var PHASE = {
			FANTASY_DRAFT: -1,
			PRESEASON: 0,
			REGULAR_SEASON: 1,
			AFTER_TRADE_DEADLINE: 2,
			PLAYOFFS: 3,
			BEFORE_DRAFT: 4,
			RESIGN_PLAYERS: 5,
			FREE_AGENCY: 6,
		};

		var PHASE_TEXT = {
			'-1': 'fantasy draft',
			'0': 'preseason',
			'1': 'regular season',
			'2': 'regular season',
			'3': 'summer playoffs',
			'4': 'before free agency',
			'5': 're-sign players',
			'6': 'free agency',
		};

	} else {

		var PHASE = {
			FANTASY_DRAFT: -1,
			PRESEASON: 0,
			REGULAR_SEASON: 1,
			MSI: 2,
			MIDSEASON: 3,
			SECOND_HALF: 4,
			AFTER_TRADE_DEADLINE: 5,
			PLAYOFFS: 6,
			BEFORE_DRAFT: 7,
			RESIGN_PLAYERS: 8,
			FREE_AGENCY: 9,
		};

		var PHASE_TEXT = {
			'-1': 'fantasy draft',
			'0': 'preseason',
			'1': 'spring split',
			'2': 'spring playoffs',
			'3': 'midseason',
			'4': 'summer split',
			'5': 'summer split',
			'6': 'summer playoffs',
			'7': 'before free agency',
			'8': 're-sign players',
			'9': 'free agency',
		};
	}
   // Any custom teams?
    let championLength;

	if (leagueFile.hasOwnProperty("champions")  && mobaGMChampFile) {
		championLength = leagueFile.champions.length;
	} else {
		if (champid == 0) {
			championLength = championsLOL.champion.length;
		} else {
			championLength = championsDOTA2.champion.length;
		}
	}

	let championPatchLength;
	if (leagueFile.hasOwnProperty("championPatch")  && mobaGMChampFile) {

		championPatchLength = leagueFile.championPatch.length;
	} else {
		if (champid == 0) {
			championPatchLength	= championPatchLOL.championPatch.length;
		} else {
			championPatchLength	= championPatchDOTA2.championPatch.length;
		}

	}

	var cDefault,cpDefault,i;

	cDefault = [];
	if (leagueFile.hasOwnProperty("champions") && mobaGMChampFile) {
		console.log("got here");
		if (champid == 0) {
			for (i = 0; i < championsLOL.champion.length; i++) {
				cDefault.push(champion.generate(champid,i));
			}
		} else {
			for (i = 0; i < championsDOTA2.champion.length; i++) {
				cDefault.push(champion.generate(champid,i));
			}
		}
		// actually always use latest champ data
		if (leagueFile.champions.length == cDefault.length) {
			// This probably shouldn't be here, but oh well, backwards compatibility...
			cDefault = merge(leagueFile.champions, cDefault);
		} else if (leagueFile.champions.length < cDefault.length) {
			console.log("got here");
			cDefault = leagueFile.champions;
		} else {
			console.log("got here");
			cDefault = leagueFile.champions;
		}
	} else {
		if (champid == 0) {
			for (i = 0; i < championsLOL.champion.length; i++) {
				cDefault.push( champion.generate(champid,i));
			}
		} else {
			for (i = 0; i < championsDOTA2.champion.length; i++) {
				cDefault.push(champion.generate(champid,i));
			}
		}
	}
	cpDefault = [];
	if (leagueFile.hasOwnProperty("championPatch") && mobaGMChampFile) {
		if (champid == 0) {
			for (i = 0; i < championPatchLOL.championPatch.length; i++) {
				cpDefault.push(champion.rank(champid,i));
			}
		} else {
			for (i = 0; i < championPatchDOTA2.championPatch.length; i++) {
				cpDefault.push(champion.rank(champid,i));
			}
		}
				cpDefault = leagueFile.championPatch;
	} else {
		if (champid == 0) {
			for (i = 0; i < championPatchLOL.championPatch.length; i++) {
				cpDefault.push(champion.rank(champid,i));

			}
		} else {
			for (i = 0; i < championPatchDOTA2.championPatch.length; i++) {
				cpDefault.push(champion.rank(champid,i));

			}
		}

	}

    let phaseText;
    if (leagueFile.hasOwnProperty("meta") && leagueFile.meta.hasOwnProperty("phaseText")) {
        phaseText = leagueFile.meta.phaseText;
    } else {
        phaseText = "";
    }


    g.lid = await idb.meta.leagues.add({
        name,
        tid,
        phaseText,
        teamName: teams[tid].name,
        teamRegion: teams[tid].region,
        heartbeatID: undefined,
        heartbeatTimestamp: undefined,
    });
    idb.league = await connectLeague(g.lid);

    const gameAttributes = Object.assign({}, defaultGameAttributes, {
        userTid: tid,
        userTids: [tid],
        season: startingSeason,
        startingSeason,
        seasonSplit: startingSplit,
        startingSplit,
		bothSplits: bothSplits,
        leagueName: name,
        teamAbbrevsCache: teams.map(t => t.abbrev),
        teamRegionsCache: teams.map(t => t.region),
        teamNamesCache: teams.map(t => t.name),
				teamCountryCache: teams.map(t => t.country),
        gracePeriodEnd: startingSeason + 2, // Can't get fired for the first two seasons
        numTeams: teams.length, // Will be 30 if the user doesn't supply custom rosters
		confs: conferences,
		playoffWins: 3,
//		playoffWins: 1,	// normally 3
		divs: divisions,
				fullLadder: fullLadder,
                numChampions: championLength, // Will be 30 if the user doesn't supply custom rosters
                numChampionsPatch: championPatchLength, // Will be 30 if the user doesn't supply custom rosters
				ownerType: ownerType,
				userTid: tid,
				userTids: [tid],
				gameType: typeid,
				regionType: regionType,
				champType: champid,
				patchType: patchid,
				GMCoachType: GMCoachid,
				difficulty: difficulty,
                cCache: cDefault,
                cpCache: cpDefault,
		playerChampRatingImpact: .1,
		realChampNames: false,
                PHASE: PHASE,
                PHASE_TEXT: PHASE_TEXT,
				yearType: yearid,
				maxRosterSize: 10,

    });
//	console.log(gameAttributes);
//	console.log(teams);
    // gameAttributes from input
    let skipNewPhase = false;



  if (leagueFile.hasOwnProperty("gameAttributes")  && !differentGameType)  {


			//console.log(leagueFile.gameAttributes[i].gameType);
    for (let i = 0; i < leagueFile.gameAttributes.length; i++) {
			//if leagueFile.gameAttributes[i].gameType ==
			if (leagueFile.gameAttributes[i].key !== "userTid" && leagueFile.gameAttributes[i].key !== "leagueName") {
            // Set default for anything except team ID and name, since they can be overwritten by form input.
				if  (  leagueFile.gameAttributes[i].key == "numChampions" && !mobaGMFile) {
//				if  (leagueFile.gameAttributes[i].key == "fullLadder" &&  leagueFile.gameAttributes[i].key == "numChampions" && !mobaGMFile) {
        } else if  (  leagueFile.gameAttributes[i].key == "numChampionsPatch" && !mobaGMFile) {
        } else if  (  leagueFile.gameAttributes[i].key == "minContract" && !mobaGMFile) {
        } else if  (  leagueFile.gameAttributes[i].key == "maxContract" && !mobaGMFile) {

				} else {
				//	if (leagueFile.gameAttributes[i].key == "fullLadder") {
				//	} else {
						gameAttributes[leagueFile.gameAttributes[i].key] = leagueFile.gameAttributes[i].value;
				//	}
				}
      }

      if (leagueFile.gameAttributes[i].key === "phase") {
          skipNewPhase = true;
      }
    }

      // Special case for userTids - don't use saved value if userTid is not in it
      if (!gameAttributes.userTids.includes(gameAttributes.userTid)) {
          gameAttributes.userTids = [gameAttributes.userTid];
      }
  }

	// don't want to overwrite all gameAttributes if gameType is different
	//console.log(leagueFile.hasOwnProperty("gameAttributes"));
	//console.log(differentGameType);

    if (leagueFile.hasOwnProperty("gameAttributes")  && differentGameType)  {

		// season, startingSeason
    for (let i = 0; i < leagueFile.gameAttributes.length; i++) {
			if (leagueFile.gameAttributes[i].key == "season" || leagueFile.gameAttributes[i].key == "startingSeason") {
					gameAttributes[leagueFile.gameAttributes[i].key] = leagueFile.gameAttributes[i].value;

            // Set default for anything except team ID and name, since they can be overwritten by form input.
                //gameAttributes[leagueFile.gameAttributes[i].key] = leagueFile.gameAttributes[i].value;
            }

            if (leagueFile.gameAttributes[i].key === "phase") {
                skipNewPhase = true;
            }
        }
	  }

  if (!leagueFile.hasOwnProperty("gameAttributes")) {
    if (leagueFile.hasOwnProperty("teams")) {
      if (leagueFile.teams[0].seasons != undefined) {
        if (leagueFile.teams[0].seasons.length == 1) {
          gameAttributes.season = leagueFile.teams[0].seasons[0].season;
          gameAttributes.startingSeason = leagueFile.teams[0].seasons[0].season;
        }
      }
    }
  }
  // if missing, want to check for actual current seasons
  // or at lesat update team/player data

    // Clear old game attributes from g, to make sure the new ones are saved to the db in setGameAttributes
    helpers.resetG();
    await toUI(['resetG']);

    idb.cache = new Cache();
    idb.cache.newLeague = true;
    await idb.cache.fill(gameAttributes.season);
    await setGameAttributes(gameAttributes);
	var c,cp, i, j, patchLength,champLength;
		if (leagueFile.hasOwnProperty("champions")  && mobaGMChampFile ) {


			for (i = 0; i < cDefault.length; i++) {
				c = cDefault[i];
				await idb.cache.champions.add(c);
				//dao.champions.add({ot: tx, value: c});
			}
			// Add in popRanks
		//	teams = helpers.addPopRank(teams);
		} else {
			if (champid == 0) {
				champLength = championsLOL.champion.length;
			} else {
				champLength = championsDOTA2.champion.length;
			}
			for (i = 0; i < champLength; i++) {
				c = champion.generate(champid,i);
				await idb.cache.champions.add(c);
			}
		}

//console.log(leagueFile);

		if (leagueFile.hasOwnProperty("championPatch") && mobaGMChampFile ) {
				//console.log(cpDefault);
			for (i = 0; i < cpDefault.length; i++) {
				cp = cpDefault[i];
				cp.fg = 0;
				cp.fga = 0;
				cp.fgp = 0;
				cp.tp = 0;
				cp.gp = 0;
				cp.won = 0;
			//	console.log(cp);
				await idb.cache.championPatch.add(cp);
				//dao.championPatch.add({ot: tx, value: cp});
			}
			// Add in popRanks
			//teams = helpers.addPopRank(teams);
		} else {
			if (champid == 0) {
				patchLength = championPatchLOL.championPatch.length;
			} else {
				patchLength = championPatchDOTA2.championPatch.length;
			}
	//		console.log(patchLength);
		//	console.log(championPatchLOL.championPatch.length);
			//console.log(championPatchLOL.championPatch);
			for (i = 0; i < patchLength; i++) {
				cp = champion.rank(champid,i);
				cp.fg = 0;
				cp.fga = 0;
				cp.fgp = 0;
				cp.tp = 0;
				cp.gp = 0;
				cp.won = 0;
			//	console.log(cp);
				await idb.cache.championPatch.add(cp);
			//	dao.championPatch.add({ot: tx, value: cp});
			}
//				teams = teamsDefault;
		}

		var topChamps;



		// sortChampRoles?
		// get top champs for each role
		var cpSorted;
		cpSorted = [];

		for (i = 0; i < _.size(cpDefault); i++) {
			cpSorted.push({"champion": cpDefault[i].champion,"cpid": cpDefault[i].cpid,"rank": cpDefault[i].rank,"role": cpDefault[i].role});
		}

		cpSorted.sort(function (a, b) { return a.rank - b.rank; });

		var topADC,topMID,topJGL,topTOP,topSUP;

		topADC = [];
		topMID = [];
		topJGL = [];
		topTOP = [];
		topSUP = [];

		//console.log(cpSorted);
		for (i = 0; i < _.size(cpSorted); i++) {
			if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
		//	   console.log(_.size(cDefault));
				for (j = 0; j < _.size(cDefault); j++) {
					if (cDefault[j].name == cpSorted[i].champion) {
						topADC.push(cDefault[j].hid);
						j = _.size(cDefault);
					}
				}
			}
			if ((cpSorted[i].role == "MID") && (topMID.length < 5) ) {
//				  topMID.push(cpSorted[i].cpid);
				for (j = 0; j < _.size(cDefault); j++) {
					if (cDefault[j].name == cpSorted[i].champion) {
						topMID.push(cDefault[j].hid);
						j = _.size(cDefault);
					}
				}
			}
			if ((cpSorted[i].role == "JGL") && (topJGL.length < 5) ) {
//				  topJGL.push(cpSorted[i].cpid);
				for (j = 0; j < _.size(cDefault); j++) {
					if (cDefault[j].name == cpSorted[i].champion) {
						topJGL.push(cDefault[j].hid);
						j = _.size(cDefault);
					}
				}
			}
			if ((cpSorted[i].role == "TOP") && (topTOP.length < 5) ) {
//				  topTOP.push(cpSorted[i].cpid);
				for (j = 0; j < _.size(cDefault); j++) {
					if (cDefault[j].name == cpSorted[i].champion) {
						topTOP.push(cDefault[j].hid);
						j = _.size(cDefault);
					}
				}
			}
			if ((cpSorted[i].role == "SUP") && (topSUP.length < 5) ) {
//				  topSUP.push(cpSorted[i].cpid);
				for (j = 0; j < _.size(cDefault); j++) {
					if (cDefault[j].name == cpSorted[i].champion) {
						topSUP.push(cDefault[j].hid);
						j = _.size(cDefault);
					}
				}

			}

		}

    let players;
    let scoutingRankTemp;

    // Draft picks for the first 4 years, as those are the ones can be traded initially
    if (leagueFile.hasOwnProperty("draftPicks")) {
        for (let i = 0; i < leagueFile.draftPicks.length; i++) {
            await idb.cache.draftPicks.add(leagueFile.draftPicks[i]);
        }
    } else {
        for (let i = 0; i < 4; i++) {
            for (let t = 0; t < g.numTeams; t++) {
                for (let round = 1; round <= 2; round++) {
                    await idb.cache.draftPicks.add({
                        tid: t,
                        originalTid: t,
                        round,
                        season: g.startingSeason + i,
                    });
                }
            }
        }
    }

    // Initialize draft order object store for later use
    if (leagueFile.hasOwnProperty("draftOrder")) {
        for (let i = 0; i < leagueFile.draftOrder.length; i++) {
            await idb.cache.draftOrder.add(leagueFile.draftOrder[i]);
        }
    } else {
        await idb.cache.draftOrder.add({
            rid: 0,
            draftOrder: [],
        });
    }
//console.log(gameAttributes);
	//console.log(teams);
    // teams already contains tid, cid, did, region, name, and abbrev. Let's add in the other keys we need for the league.
	//console.log(teams);
    for (let i = 0; i < g.numTeams; i++) {
	//	console.log(i);
        const t = team.generate(teams[i]);
	//	console.log(t);
    //    console.log(t.country);
        if (t.country == '000') {
      //    console.log("got here");
          t.country = 'CIS';
        }
    //    console.log(t.country);
        await idb.cache.teams.add(t);

        let teamSeasons;
		let LOLGMFile = false;
		//console.log(i);
	//	console.log(teams[i]);
        if (teams[i].hasOwnProperty("seasons")) {
		//	console.log(t.cid+" "+t.tid);
			if (teams[i].seasons[0].hasOwnProperty("playoffRoundsWonEULCS")) {
				//console.log(t.tid);
				teamSeasons = teams[i].seasons;
				//teams[i].pop = teamSeasons[0].pop;
		//console.log(teamSeasons);
			} else {
			//	console.log(t.tid);
				LOLGMFile = true;
			//	console.log(teams[i]);
				teamSeasons = [team.genSeasonRow(teams[i].tid,teams[i].cid,teams[i].seasons[0].imgURLCountry,teams[i].seasons[0].countrySpecific)];
				teamSeasons[0].pop = teams[i].pop;
				teamSeasons[0].hype = teams[i].pop/g.numTeams;
			//	console.log(teamSeasons);
			}
			//console.log(i);
			//console.log(teamSeasons);
        } else {
		//	console.log(t);
			//console.log(t.cid+" "+t.tid);
            teamSeasons = [team.genSeasonRow(t.tid,t.cid,t.imgURLCountry,t.countrySpecific)];
            teamSeasons[0].pop = teams[i].pop;
            teamSeasons[0].hype = teams[i].pop/g.numTeams;
			//	console.log(teamSeasons);
        }
		//console.log(teamSeasons);

    //    console.log(t.tid);
    //    console.log(t.country);
    //    console.log(teamSeasons);
    //    console.log(t.countrySpecific);
    //    console.log(t.imgURLCountry);

    //    console.log(t);
        let row = 0;
        for (const teamSeason of teamSeasons) {
		//	console.log(teamSeason);
		//	console.log(t);
            teamSeason.tid = t.tid;
          //  console.log(row);
            teamSeason.rid = t.tid+row*(g.numTeams);
            teamSeason.cid = t.cid;
            teamSeason.cidMid = t.cid;
            teamSeason.cidNext = t.cid;
            teamSeason.cidStart = t.cid;
		//	console.log(teamSeason);
            await idb.cache.teamSeasons.add(teamSeason);
            row +=1;
        //    console.log(row);
        }
//console.log(teamSeasons);
        let teamStats;
        if (teams[i].hasOwnProperty("stats")) {
			if (!LOLGMFile) {
				teamStats = teams[i].stats;
	//	console.log(teamStats);
			} else {
				teamStats = [team.genStatsRow(t.tid)];
	//	console.log(teamStats);
			}

        } else {
            teamStats = [team.genStatsRow(t.tid)];
		//console.log(teamStats);
        }
		//console.log(teamStats);
     row = 0;
        for (const teamStat of teamStats) {
		//	console.log(teamStat);
            teamStat.tid = t.tid;
            teamStat.rid = t.tid+row*(g.numTeams);
          //  teamStat.rid = t.tid;
          //  console.log(t);
                  //teamSeason.tid = t.tid;
                ///  teamSeason.rid = t.tid;
            //      teamStat.cid = t.cid;
            //      teamStat.did = t.did;
                //  teamSeason.cidMid = t.cid;
                //  teamSeason.cidNext = t.cid;
                //  teamSeason.cidStart = t.cid;
        //    console.log(teamStat);


            if (!teamStat.hasOwnProperty("ba")) {
                teamStat.ba = 0;
            }
            await idb.cache.teamStats.add(teamStat);
            row+=1;
        }
	//console.log(teams[i]);
////	console.log(teamSeasons);
//console.log(teamStats);
        // Save scoutingRank for later
        if (i === g.userTid) {
            scoutingRankTemp = finances.getRankLastThree(teamSeasons, "expenses", "scouting");
		//	console.log(scoutingRankTemp);
        }
    }
    const scoutingRank = scoutingRankTemp;
    if (scoutingRank === undefined) {
        throw new Error('scoutingRank should be defined');
    }

    if (leagueFile.hasOwnProperty("trade")) {
        for (let i = 0; i < leagueFile.trade.length; i++) {
            await idb.cache.trade.add(leagueFile.trade[i]);
        }
    } else {
        await idb.cache.trade.add({
            rid: 0,
            teams: [{
                tid,
                pids: [],
                dpids: [],
            },
            {
                tid: tid === 0 ? 1 : 0,  // Load initial trade view with the lowest-numbered non-user team (so, either 0 or 1).
                pids: [],
                dpids: [],
            }],
        });
    }

    // These object stores are blank by default
    const toMaybeAdd = ["releasedPlayers", "awards", "schedule", "msiSeries", "playoffSeries", "negotiations", "messages", "games", "events", "playerFeats"];
    for (let j = 0; j < toMaybeAdd.length; j++) {
        if (leagueFile.hasOwnProperty(toMaybeAdd[j])  && !differentGameType) {
            for (let i = 0; i < leagueFile[toMaybeAdd[j]].length; i++) {
                await idb.cache._add(toMaybeAdd[j], leagueFile[toMaybeAdd[j]][i]);
            }
        }
    }

    const baseMoods = await player.genBaseMoods();


	//var differentGameType = false;
	//var oldGameType;

//	console.log(differentGameType);
//	console.log(oldGameType);
//	console.log(typeid);
//	console.log(oldTid);
//	console.log(newTid);


	//console.log(leagueFile.hasOwnProperty("players"));
    if (leagueFile.hasOwnProperty("players")) {

		//console.log("HAS OWN PLAYERS");
		// custom roster file missing
		// languages
		// position
		// and invalid player ids
		// missing champ ratings

        // Use pre-generated players, filling in attributes as needed
        players = leagueFile.players;

        // Does the player want the rosters randomized?

		if (randomizeRosters) {
			// Assign the team ID of all players to the 'playerTids' array.
			// Check tid to prevent draft prospects from being swapped with established players
			//console.log(typeid+" "+g.gameType);


			if (g.gameType == 1) {

				//			  players.filter(p => p.tid > PLAYER.FREE_AGENT).map(p => p.tid);

				const playerTids = players.filter(p => ((p.tid < 10) && p.tid > PLAYER.FREE_AGENT)).map(p => p.tid);
				const playerTids1 = players.filter(p => ((p.tid < 16) && p.tid > 9)).map(p => p.tid);
				const playerTids2 = players.filter(p => (p.tid > 15)).map(p => p.tid);


				//playerTids = _.pluck(players.filter(function (p) { return  ((p.tid < 10) && p.tid > g.PLAYER.FREE_AGENT); }), "tid");
				//playerTids1 = _.pluck(players.filter(function (p) { return  ((p.tid < 16) && p.tid > 9); }), "tid");
				//playerTids2 = _.pluck(players.filter(function (p) { return  (p.tid > 15); }), "tid");

				// Shuffle the teams that players are assigned to.
				random.shuffle(playerTids);
				random.shuffle(playerTids1);
				random.shuffle(playerTids2);

				for (i = 0; i < players.length; i++) {
					if (players[i].tid > PLAYER.FREE_AGENT && players[i].tid < 10) {
						players[i].tid = playerTids.pop();
					} else if (players[i].tid > 9 && players[i].tid < 16) {
						players[i].tid = playerTids1.pop();
					} else if (players[i].tid > 15 ) {
						players[i].tid = playerTids2.pop();
					}

					if (players[i].stats && players[i].stats.length > 0) {
						players[i].stats[players[i].stats.length - 1].tid = players[i].tid;
						players[i].statsTids.push(players[i].tid);
					}

				}

			} else if (g.gameType == 5) {
				console.log(g.yearType);
				const playerTids = players.filter(p => ((p.tid < 10) && p.tid > PLAYER.FREE_AGENT)).map(p => p.tid);
				const playerTids1 = players.filter(p => ((p.tid < 20) && p.tid > 9)).map(p => p.tid);
				const playerTids2 = players.filter(p => ((p.tid < 30) && p.tid > 19)).map(p => p.tid);
				const playerTids3 = players.filter(p => ((p.tid < 42) && p.tid > 29)).map(p => p.tid);
				const playerTids4 = players.filter(p => ((p.tid < 50) && p.tid > 41)).map(p => p.tid);
//							playerTids4 = players.filter(p => (p.tid > 50)).map(p => p.tid);


			//	playerTids = _.pluck(players.filter(function (p) { return  ((p.tid < 10) && p.tid > g.PLAYER.FREE_AGENT); }), "tid");
			//	playerTids1 = _.pluck(players.filter(function (p) { return  ((p.tid < 20) && p.tid > 9); }), "tid");
			//	playerTids2 = _.pluck(players.filter(function (p) { return  ((p.tid < 30) && p.tid > 19); }), "tid");
			//	playerTids3 = _.pluck(players.filter(function (p) { return  ((p.tid < 42) && p.tid > 29); }), "tid");
			//	playerTids4 = _.pluck(players.filter(function (p) { return  ((p.tid < 50) && p.tid > 41); }), "tid");

				// Shuffle the teams that players are assigned to.
				random.shuffle(playerTids);
				random.shuffle(playerTids1);
				random.shuffle(playerTids2);
				random.shuffle(playerTids3);
				random.shuffle(playerTids4);

				for (i = 0; i < players.length; i++) {
//                            if (players[i].tid >= g.PLAYER.FREE_AGENT) {
					if (players[i].tid > PLAYER.FREE_AGENT && players[i].tid < 10) {
						players[i].tid = playerTids.pop();
					} else if (players[i].tid > 9 && players[i].tid < 20) {
						players[i].tid = playerTids1.pop();
					} else if (players[i].tid > 19 && players[i].tid < 30) {
						players[i].tid = playerTids2.pop();
					} else if (players[i].tid > 29 && players[i].tid < 42) {
						players[i].tid = playerTids3.pop();
					} else if (players[i].tid > 41 && players[i].tid < 50) {
						players[i].tid = playerTids4.pop();
					}

					if (players[i].stats && players[i].stats.length > 0) {
						players[i].stats[players[i].stats.length - 1].tid = players[i].tid;
						players[i].statsTids.push(players[i].tid);
					}
				}
			} else if (g.gameType == 6) {

				const playerTids = players.filter(p => ((p.tid < 10) && p.tid > PLAYER.FREE_AGENT)).map(p => p.tid);
				const playerTids1 = players.filter(p => ((p.tid < 16) && p.tid > 9)).map(p => p.tid);
				const playerTids2 = players.filter(p => ((p.tid < 22) && p.tid > 15)).map(p => p.tid);
				const playerTids3 = players.filter(p => ((p.tid < 32) && p.tid > 21)).map(p => p.tid);
				const playerTids4 = players.filter(p => ((p.tid < 38) && p.tid > 31)).map(p => p.tid);
				const playerTids5 = players.filter(p => ((p.tid < 44) && p.tid > 37)).map(p => p.tid);
				const playerTids6 = players.filter(p => ((p.tid < 54) && p.tid > 43)).map(p => p.tid);
				const playerTids7 = players.filter(p => ((p.tid < 60) && p.tid > 53)).map(p => p.tid);
				const playerTids8 = players.filter(p => ((p.tid < 66) && p.tid > 59)).map(p => p.tid);
				const playerTids9 = players.filter(p => ((p.tid < 78) && p.tid > 65)).map(p => p.tid);
				const playerTids10 = players.filter(p => ((p.tid < 84) && p.tid > 77)).map(p => p.tid);
				const playerTids11 = players.filter(p => ((p.tid < 90) && p.tid > 83)).map(p => p.tid);
				const playerTids12 = players.filter(p => ((p.tid < 98) && p.tid > 89)).map(p => p.tid);
				const playerTids13 = players.filter(p => ((p.tid < 104) && p.tid > 97)).map(p => p.tid);
				const playerTids14 = players.filter(p => ((p.tid < 110) && p.tid > 103)).map(p => p.tid);
//							playerTids4 = players.filter(p => (p.tid > 50)).map(p => p.tid);


			//	playerTids = _.pluck(players.filter(function (p) { return  ((p.tid < 10) && p.tid > g.PLAYER.FREE_AGENT); }), "tid");
			//	playerTids1 = _.pluck(players.filter(function (p) { return  ((p.tid < 20) && p.tid > 9); }), "tid");
			//	playerTids2 = _.pluck(players.filter(function (p) { return  ((p.tid < 30) && p.tid > 19); }), "tid");
			//	playerTids3 = _.pluck(players.filter(function (p) { return  ((p.tid < 42) && p.tid > 29); }), "tid");
			//	playerTids4 = _.pluck(players.filter(function (p) { return  ((p.tid < 50) && p.tid > 41); }), "tid");

				// Shuffle the teams that players are assigned to.
				random.shuffle(playerTids);
				random.shuffle(playerTids1);
				random.shuffle(playerTids2);
				random.shuffle(playerTids3);
				random.shuffle(playerTids4);
				random.shuffle(playerTids5);
				random.shuffle(playerTids6);
				random.shuffle(playerTids7);
				random.shuffle(playerTids8);
				random.shuffle(playerTids9);
				random.shuffle(playerTids10);
				random.shuffle(playerTids11);
				random.shuffle(playerTids12);
				random.shuffle(playerTids13);
				random.shuffle(playerTids14);

				for (i = 0; i < players.length; i++) {
//                            if (players[i].tid >= g.PLAYER.FREE_AGENT) {
					if (players[i].tid > PLAYER.FREE_AGENT && players[i].tid < 10) {
						players[i].tid = playerTids.pop();
					} else if (players[i].tid > 9 && players[i].tid < 16) {
						players[i].tid = playerTids1.pop();
					} else if (players[i].tid > 15 && players[i].tid < 22) {
						players[i].tid = playerTids2.pop();
					} else if (players[i].tid > 21 && players[i].tid < 32) {
						players[i].tid = playerTids3.pop();
					} else if (players[i].tid > 31 && players[i].tid < 38) {
						players[i].tid = playerTids4.pop();
					} else if (players[i].tid > 37 && players[i].tid < 44) {
						players[i].tid = playerTids5.pop();
					} else if (players[i].tid > 43 && players[i].tid < 54) {
						players[i].tid = playerTids6.pop();
					} else if (players[i].tid > 53 && players[i].tid < 60) {
						players[i].tid = playerTids7.pop();
					} else if (players[i].tid > 59 && players[i].tid < 66) {
						players[i].tid = playerTids8.pop();
					} else if (players[i].tid > 65 && players[i].tid < 78) {
						players[i].tid = playerTids9.pop();
					} else if (players[i].tid > 77 && players[i].tid < 84) {
						players[i].tid = playerTids10.pop();
					} else if (players[i].tid > 83 && players[i].tid < 90) {
						players[i].tid = playerTids11.pop();
					} else if (players[i].tid > 89 && players[i].tid < 98) {
						players[i].tid = playerTids12.pop();
					} else if (players[i].tid > 97 && players[i].tid < 104) {
						players[i].tid = playerTids13.pop();
					} else if (players[i].tid > 103 && players[i].tid < 110) {
						players[i].tid = playerTids14.pop();
					}

					if (players[i].stats && players[i].stats.length > 0) {
						players[i].stats[players[i].stats.length - 1].tid = players[i].tid;
						players[i].statsTids.push(players[i].tid);
					}
				}

			} else if (g.gameType == 7) {

				var playerTidsAll = []
				var playerNoFreeAgents = players.filter(p => (p.tid >  PLAYER.FREE_AGENT));

				//get only free agents (remove mapping)
				// then do normal filter
				var playerTids = playerNoFreeAgents.filter(p => ( teams[p.tid].cid== 0)).map(p => p.tid);
				playerTidsAll.push(playerTids);
				for (i = 1; i < teams.length; i++) {
					playerTids = playerNoFreeAgents.filter(p => ( teams[p.tid].cid == i)).map(p => p.tid);
					playerTidsAll.push(playerTids);
				}


				// Shuffle the teams that players are assigned to.
				for (i = 1; i < teams.length; i++) {
					random.shuffle(playerTidsAll[i]);
				}
		//
				for (i = 0; i < playerNoFreeAgents.length; i++) {
//                            if (players[i].tid >= g.PLAYER.FREE_AGENT) {
					for (let j = 0; j < teams.length; j++) {
						//	console.log(i);
						if (j == 0) {
							if (playerNoFreeAgents[i].tid > PLAYER.FREE_AGENT && teams[playerNoFreeAgents[i].tid].cid == teams[j].cid) {
								playerNoFreeAgents[i].tid = playerTidsAll[0].pop();
							}
							break;
						} else {
							if (teams[playerNoFreeAgents[i].tid].cid == teams[j].cid) {
								playerNoFreeAgents[i].tid = playerTidsAll[j].pop();
							}
							break;
						}

					}

					if (playerNoFreeAgents[i].stats && playerNoFreeAgents[i].stats.length > 0) {
						playerNoFreeAgents[i].stats[playerNoFreeAgents[i].stats.length - 1].tid = playerNoFreeAgents[i].tid;
						playerNoFreeAgents[i].statsTids.push(playerNoFreeAgents[i].tid);
					}
				}
		//	console.log(playerTidsAll);

			} else {

				// Assign the team ID of all players to the 'playerTids' array.
				// Check tid to prevent draft prospects from being swapped with established players
				const playerTids = players.filter(p => p.tid > PLAYER.FREE_AGENT).map(p => p.tid);

				// Shuffle the teams that players are assigned to.
				random.shuffle(playerTids);
				for (const p of players) {
					if (p.tid > PLAYER.FREE_AGENT) {
						p.tid = playerTids.pop();
						if (p.stats && p.stats.length > 0) {
							p.stats[p.stats.length - 1].tid = p.tid;
							p.statsTids.push(p.tid);
						}
					}
				}
			}

		}

	//	console.log(worldsToLadder);
	//	console.log(ladderToWorlds);
	//	console.log(newTid);


        for (var p0 of players) {
			//console.log(p0);
            // Has to be any because I can't figure out how to change PlayerWithoutPidWithStats to Player
			var p = p0;
			if (worldsToLadder) {
				if (p.tid>=0 &&	p.tid < 10	) {
					p.tid += 0;
				} else if (p.tid>=10 &&	p.tid < 20	) {
					p.tid += 12;
				} else if (p.tid>=20 &&	p.tid < 30	) {
					p.tid += 24;
				} else if (p.tid>=30 &&	p.tid < 42	) {
					p.tid += 36;
				} else if (p.tid>=42 &&	p.tid < 50	) {
					p.tid += 48;
				} else if (p.tid>=50 ) {
					p.tid += 60;
				}
			} else if (ladderToWorlds) {
				if (p.tid>=0 &&	p.tid < 10	) {
					p.tid += 0;
				} else if (p.tid>=22 &&	p.tid < 32	) {
					p.tid -= 12;
				} else if (p.tid>=44 &&	p.tid < 54	) {
					p.tid -= 24;
				} else if (p.tid>=66 &&	p.tid < 78	) {
					p.tid -= 36;
				} else if (p.tid>=90 &&	p.tid < 98	) {
					p.tid -= 48;
				} else if (p.tid>=110 ) {
					p.tid -= 60;
				}
			} else if (p.tid >= 0) {
				p.tid += newTid;
				if (p.tid < 0) {
					p.tid = teams.length;
				}
			}
			p0 = p;
            var p: any = player.augmentPartialPlayer(p0, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP, mobaGMChampFile);


			//console.log(p);
			//console.log(p.tid);
			//console.log(worldsToLadder);
			//console.log(ladderToWorlds);
			//console.log(newTid);


			//console.log(p.tid);
			//console.log(p);
			// need to handle all game combos
			// Worlds to region means delete rest
			// region to worlds means input correctly and create rest
			// Worlds to Worlds w/ Ladder means use Worlds but create a ladder
			// NA/LCS with Ladder means use
			// main is converting Worlds to Worlds w/ Ladder *****
			// and Worlds w/ Ladder to Worlds? ******

//			if ( (p0.tid>=0) && (leagueFile.teams[i].tid<= teams.length-1) ) {
		//	console.log(p.tid+" "+teams.length);
			if ( (p.tid<= teams.length-1) ) {
		//	console.log(p.tid+" "+teams.length);
			//		console.log("make change");
		//			teams[leagueFile.teams[i].tid] = leagueFile.teams[i];

				if (p.tid>=0) {
				//	console.log(p);
				}
			//	console.log(p);



				// Don't let imported contracts be created for below the league minimum, and round to nearest $10,000.
				p.contract.amount = Math.max(10 * Math.round(p.contract.amount / 10), g.minContract);

				// Separate out stats
				const playerStats = p.stats;
				delete p.stats;
				//console.log(playerStats);
				await player.updateValues(p, playerStats.reverse());
				await idb.cache.players.put(p);
			//	console.log(p);
				// If no stats in League File, create blank stats rows for active players if necessary
	//            if (playerStats.length === 0 || !mobaGMFile ) {
	//            if (playerStats.length === 0 || !mobaGMFile ) {
			//		console.log(playerStats.length);
				if (playerStats.length === 0 ) {
					//console.log(g.phase+" "+p.tid);
					if (p.tid >= 0 && g.phase <= g.PHASE.PLAYOFFS) {
					//console.log(p);
						// Needs pid, so must be called after put. It's okay, statsTid was already set in player.augmentPartialPlayer
						await player.addStatsRow(p, (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI));
					//console.log(p);
					}
				} else {
					//console.log(playerStats.length);
					// If there are stats in the League File, add them to the database
					const addStatsRows = async () => {
						const ps = playerStats.pop();

						// Augment with pid, if it's not already there - can't be done in player.augmentPartialPlayer because pid is not known at that point
					//	console.log(ps);  // file is 2012
					//	console.log(p);		// check year // file ratings are 2018 should be 2012
						ps.pid = p.pid;

						// Could be calculated correctly if I wasn't lazy
						if (!ps.hasOwnProperty("yearsWithTeam")) {
							ps.yearsWithTeam = 1;
						}
						if (!ps.hasOwnProperty("championStats")) {
							ps.championStats = [];
						}
						if (!ps.hasOwnProperty("playoffs")) {
							ps.playoffs = false;
						}

					//	console.log(playerStats.length);
					//	console.log(differentGameType);
						if (differentGameType && playerStats.length == 0) {
							ps.seasonSplit = g.seasonSplit;
							ps.tid = p.tid;
						//    ps.yearsWithTeam = 1;
						}
						// update ps here?

						// Delete psid because it can cause problems due to interaction addStatsRow above
						delete ps.psid;
					//	console.log(ps);
						await idb.cache.playerStats.add(ps);

						// On to the next one
						if (playerStats.length > 0) {
							await addStatsRows();
						}
					};
					await addStatsRows();
				}
			} else {
				//console.log(p0);
			}
        }
    }

//	console.log(leagueFile.hasOwnProperty("players"));
//	console.log(!leagueFile.hasOwnProperty("players"));
			//	console.log(g.yearType);
	if (!leagueFile.hasOwnProperty("players") || differentGameType) {
	//console.log(leagueFile);
	console.log("Create New Players");
        // No players in league file, so generate new players
        const profiles = ["Point", "Wing", "Big", ""];



//        for (let tidTemp = -2*teams.length; tidTemp < teams.length; tidTemp++) {
//		let freeAgentTeams = Math.round(teams.length/3);
		let freeAgentTeams = Math.round(teams.length/2*g.prospectSupply);
	//	console.log(freeAgentTeams);
        for (let tidTemp = -freeAgentTeams; tidTemp < teams.length; tidTemp++) {
//        for (let tidTemp = -teams.length; tidTemp < teams.length; tidTemp++) {
        //for (let tidTemp = 0; tidTemp < teams.length; tidTemp++) {
			//console.log(tidTemp);
//        for (let tidTemp = -3; tidTemp < teams.length; tidTemp++) {
//        for (let tidTemp = -teams.length*2; tidTemp < teams.length; tidTemp++) {
			// skip teams already created
		//	console.log(tidTemp);
			let skip = false;
		//	console.log(differentGameType+" "+oldGameType+" "+regionType);
		//console.log(differentGameType);
			if (differentGameType) {

				if (typeid == 0 && regionType == "") {
					if (oldGameType == 5 || oldGameType == 6 ) {
						skip = true;
					} else if (oldGameType == 7) {
						skip = true;
					}
				} else if (typeid == 0 && regionType == "EU") {
					if (oldGameType == 5 || oldGameType == 6 ) {
						skip = true;
					} else if (oldGameType == 7) {
						skip = true;
					}
				} else if (typeid == 2) {
					if (oldGameType == 5 || oldGameType == 6 ) {
						skip = true;
					} else if (oldGameType == 7) {
						skip = true;
					}
				} else if (typeid == 3) {
					if (oldGameType == 5 || oldGameType == 6 ) {
						skip = true;
					} else if (oldGameType == 7) {
						skip = true;
					}
				} else if (typeid == 4) {
					if (oldGameType == 5 || oldGameType == 6 ) {
						skip = true;
					} else if (oldGameType == 7) {
						skip = true;
					}
				} else if (typeid == 5 || typeid == 6) {

					//regionType == "EU"
					if (oldGameType == 0 && regionType == "") {
						if (tidTemp < 10) {
							skip = true;
						}
					} else if (oldGameType == 0 && regionType == "EU") {
						if (tidTemp >= 10 && tidTemp < 20) {
							skip = true;
						}
					} else if (oldGameType == 2) {
						if (tidTemp >= 20 && tidTemp < 30) {
							skip = true;
						}
					} else if (oldGameType == 3) {
						if (tidTemp >= 30 && tidTemp < 42) {
							skip = true;
						}
					} else if (oldGameType == 4) {
						if (tidTemp >= 42 && tidTemp < 50) {
							skip = true;
						}
					} else if (oldGameType == 7) {
						ladderToWorlds = true;
					}
				} else if (typeid == 7) {

					//regionType == "EU"
					if (oldGameType == 0 && regionType == "") {
						if (tidTemp >= 0 && tidTemp < 10) {
							skip = true;
						}
					} else if (oldGameType == 0 && regionType == "EU") {
						if (tidTemp >= 22 && tidTemp < 32) {
							skip = true;
						}
					} else if (oldGameType == 1 && regionType == "") {
						NALadderToWorldsLadder = true;
					} else if (oldGameType == 1 && regionType == "EU") {
						EULadderToWorldsLadder = true;
					} else if (oldGameType == 2) {
						if (tidTemp >= 44 && tidTemp < 54) {
							skip = true;
						}
					} else if (oldGameType == 3) {
						if (tidTemp >= 66 && tidTemp < 78) {
							skip = true;
						}
					} else if (oldGameType == 4) {
						if (tidTemp >= 90 && tidTemp < 98) {
							skip = true;
						}
					} else if (oldGameType == 5 || oldGameType == 6 ) {
						//oldTid = 0;
						//newTid = 90;
						worldsToLadder = true;
					}
				}
			}

			// this is flipped from above since the tids of actual teams are already adjusted
			if (ladderToWorlds) {
				if (tidTemp>=0 &&	tidTemp < 10	) {
					skip = true;
				} else if (tidTemp>=10 &&	tidTemp < 20	) {
					skip = true;
				} else if (tidTemp>=20 &&	tidTemp < 30	) {
					skip = true;
				} else if (tidTemp>=30 &&	tidTemp < 42	) {
					skip = true;
				} else if (tidTemp>=42 &&	tidTemp < 50	) {
					skip = true;
				} else if (tidTemp>=50 ) {
					skip = true;
				}
			} else if (worldsToLadder) {
				if (tidTemp>=0 &&	tidTemp< 10	) {
					skip = true;
				} else if (tidTemp>=22 &&	tidTemp < 32	) {
					skip = true;
				} else if (tidTemp>=44 &&	tidTemp < 54	) {
					skip = true;
				} else if (tidTemp>=66 &&	tidTemp < 78	) {
					skip = true;
				} else if (tidTemp>=90 &&	tidTemp < 98	) {
					skip = true;
//				} else if (tidTemp>=110 && tidTemp < 117) {
				} else if (tidTemp>=110 && tidTemp < leagueFile.teams.length-57+117) {
//        } else if (tidTemp>=110) {
          // leaves empty teams
					skip = true;
				}
      //  console.log(tidTemp+" "+skip);
			} /*else if (p.tid >= 0) {
				p.tid += newTid;
			}*/
		//	console.log(skip);
			if (skip) {
			} else {
				// Create multiple "teams" worth of players for the free agent pool
				const tid2 = tidTemp < 0 ? PLAYER.FREE_AGENT : tidTemp;
				let adjustment;


				if (tid2 < 0) {
				//	t2 = g.PLAYER.FREE_AGENT;
						adjustment = -20;
				} else {
					//t2 = t;
			//	console.log(teams);
					if (teams[tid2].pop == undefined) {
        //    console.log(tid2);
        //    console.log(leagueFile);
        //    console.log(leagueFile.teams);
            if (leagueFile.teams[tid2] == undefined) {
              teams[tid2].pop = 0;
            } else {
						  teams[tid2].pop = leagueFile.teams[tid2].seasons[0].pop;
            }

					}
					if (g.gameType == 6) {
						adjustment = (1-(teams[tid2].pop/100))*(-40)+20;
					} else {
			//	console.log(tid2);
			//	console.log(teams);
		//		console.log(teams[tid2]);
		//		console.log(teams[tid2].pop);
		//		console.log(teams.length);
						adjustment = (1-(teams[tid2].pop/teams.length))*(-40)+20;
					}

					if (tid2 == g.userTid) {
						adjustment -= 10;
					}
				}
				//	console.log(teams);
//					console.log(teams[tid2]);
	//				console.log(teams[tid2].pop);
					//console.log(adjustment);
				const baseRatings = [37+adjustment, 37+adjustment, 37+adjustment, 37+adjustment, 37+adjustment, 33+adjustment, 32+adjustment, 31+adjustment, 30+adjustment, 29+adjustment, 28+adjustment, 26+adjustment, 31+adjustment];
				const pots = [65+adjustment, 65+adjustment, 65+adjustment, 65+adjustment, 65+adjustment, 50+adjustment, 70+adjustment, 40+adjustment, 55+adjustment, 50+adjustment, 60+adjustment, 45+adjustment, 55+adjustment];

				//console.log(tidTemp+" "+tid2+" "+adjustment);
				//console.log(baseRatings);
				//console.log(pots);

				const goodNeutralBad = random.randInt(-1, 1);  // determines if this will be a good team or not
				random.shuffle(pots);

				let agingYears;
			//	console.log(baseRatings);
			//	console.log(pots);
				for (let n = 0; n < 8; n++) {
				//	console.log(n);
					let profile;
					if (n < 5) {
						if (n == 0) {
							profile = 3;
						} else if (n == 1) {
							profile = 2;
						} else if (n == 2) {
							profile = 3;
						} else if (n == 3) {
							profile = 3;
						} else {
							profile = 1;
						}
					} else {
						profile = profiles[random.randInt(0, profiles.length - 1)];
					}
//					const profile = profiles[random.randInt(0, profiles.length - 1)];
				//	console.log(profile);
					// agingYears = random.randInt(0, 13);
					if (Math.random() < .80) {
						agingYears = random.randInt(0, 4);
					} else if (Math.random() < .80) {
						agingYears = random.randInt(0, 7);
					} else {
						agingYears = random.randInt(0, 10);
					}
					//console.log(agingYears);


					let draftYear;
					if (g.season > g.startingSeason) {
						 draftYear = g.season - 1 - agingYears;

					} else {
						 draftYear = g.startingSeason - 1 - agingYears;

					}
				//	console.log(draftYear);
					let p, userPlayerPos, timeThrough;
//					if ( (g.userTid == tid2) && (n<5) ) {
					if (  (n<5) ) {
						userPlayerPos = "";
						timeThrough = 0;
//						while ( (((userPlayerPos != "Top") && (n == 0))  || ((userPlayerPos != "Jgl") && (n == 1)) || ((userPlayerPos != "Mid") && (n == 2)) || ((userPlayerPos != "ADC") && (n == 3)) || ((userPlayerPos != "Sup") && (n == 4)) ) && (timeThrough<20) ) {
						while ( (((userPlayerPos != "TOP") && (n == 0))  || ((userPlayerPos != "JGL") && (n == 1)) || ((userPlayerPos != "MID") && (n == 2)) || ((userPlayerPos != "ADC") && (n == 3)) || ((userPlayerPos != "SUP") && (n == 4)) ) && (timeThrough<20) ) {

							p = player.generate(tid2, 17, profile, baseRatings[n], pots[n], draftYear, true, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
							userPlayerPos = p.pos;
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
						//	console.log(n+" "+userPlayerPos);
						}
			//			console.log(p);
	//							console.log(n+" "+p.pos);
					} else {
	//						p = player.generate(t2, 18, profile, baseRatings[n], pots[n], draftYear, true, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);

							p = player.generate(tid2, 17, profile, baseRatings[n], pots[n], draftYear, true, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
				//		console.log(p);
					}

					//console.log(p);
					//console.log(JSON.stringify(p.ratings));
					player.develop(p, agingYears, true, null, topADC,topMID,topJGL,topTOP,topSUP);
					//console.log(p);
					//console.log(JSON.stringify(p.ratings));
					if (n < 5) {
						player.bonus(p, goodNeutralBad * random.randInt(0, 20));
					} else {
						player.bonus(p, 0);
					}
					if (tid2 === PLAYER.FREE_AGENT) {  // Free agents
						player.bonus(p, -15);
					}

					// Update player values after ratings changes
					await player.updateValues(p);

					// Randomize contract expiration for players who aren't free agents, because otherwise contract expiration dates will all be synchronized
					const randomizeExp = (p.tid !== PLAYER.FREE_AGENT);

					// Update contract based on development. Only write contract to player log if not a free agent.
					player.setContract(p, player.genContract(p, randomizeExp), p.tid >= 0);

						//			console.log(JSON.stringify(p.ratings));
					// Save to database, adding pid
					//console.log(p);
					await idb.cache.players.add(p);
			//		console.log(p); // season 2018 in ratings
					// Needs pid, so must be called after add
					if (p.tid === PLAYER.FREE_AGENT) {
						await player.addToFreeAgents(p, g.phase, baseMoods);
					} else {
						await player.addStatsRow(p, (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI));
					}
					//console.log(JSON.stringify(p.ratings));
				}

				// Initialize rebuilding/contending, when possible
				if (tid2 >= 0) {
					const t = await idb.cache.teams.get(tid2);
					t.strategy = goodNeutralBad === 1 ? "contending" : "rebuilding";
					await idb.cache.teams.put(t);
				}
			}
        }
    }
			//	console.log(g.yearType);
    // See if imported roster has draft picks included. If so, create less than 70 (scaled for number of teams)
    //let createUndrafted1 = Math.round(g.numTeams * 8 * 3 / 5);
    //let createUndrafted2 = Math.round(g.numTeams * 8 * 3 / 5);
    //let createUndrafted3 = Math.round(g.numTeams * 8 * 3 / 5);
    //let createUndrafted1 = Math.round(70 * g.numTeams / 30 * 3);
    //let createUndrafted2 = Math.round(70 * g.numTeams / 30 * 3);
//    let createUndrafted3 = Math.round(70 * g.numTeams / 30 * 3);
    let createUndrafted1 = Math.round(70 * g.numTeams / 30) *1.5 * g.prospectSupply;
    let createUndrafted2 = Math.round(70 * g.numTeams / 30) *1.5 * g.prospectSupply;
    let createUndrafted3 = Math.round(70 * g.numTeams / 30) *1.5 * g.prospectSupply;

    if (players !== undefined) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].tid === PLAYER.UNDRAFTED) {
                createUndrafted1 -= 1;
            } else if (players[i].tid === PLAYER.UNDRAFTED_2) {
                createUndrafted2 -= 1;
            } else if (players[i].tid === PLAYER.UNDRAFTED_3) {
                createUndrafted3 -= 1;
            }
        }
    }

    // If the draft has already happened this season but next year's class hasn't been bumped up, don't create any PLAYER.UNDRAFTED
    if (createUndrafted1 > 0 && (g.phase <= g.PHASE.BEFORE_DRAFT || g.phase >= g.PHASE.FREE_AGENCY)) {
       await draft.genPlayers(PLAYER.UNDRAFTED, scoutingRank, createUndrafted1, true,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
    }
    if (createUndrafted2 > 0) {
        await draft.genPlayers(PLAYER.UNDRAFTED_2, scoutingRank, createUndrafted2, true,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
    }
    if (createUndrafted3 > 0) {
        await draft.genPlayers(PLAYER.UNDRAFTED_3, scoutingRank, createUndrafted3, true,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
    }

    const lid = g.lid; // Otherwise, g.lid can be overwritten before the URL redirects, and then we no longer know the league ID

    if (!skipNewPhase) {
        await updatePhase();
        await updateStatus('Idle');

        // Auto sort rosters
        await Promise.all(teams.map(t => team.rosterAutoSort(t.tid)));
    }

    await idb.cache.flush();

    toUI(['bbgmPing', 'league'], conditions);

    return lid;
}

/**
 * Export existing active league.
 *
 * @memberOf core.league
 * @param {string[]} stores Array of names of objectStores to include in export
 * @return {Promise} Resolve to all the exported league data.
 */
async function exportLeague(storesFull: string[]) {
    // Always flush before export, so export is current!
	console.log("got here");
    await idb.cache.flush();

    const exportedLeague = {};




    // Row from leagueStore in meta db.
    // phaseText is needed if a phase is set in gameAttributes.
    // name is only used for the file name of the exported roster file.
	//console.log("got here");
    exportedLeague.meta = {phaseText: local.phaseText, name: g.leagueName};
//	console.log(stores);
	let stores = [];
	stores = storesFull.filter(e => e !== 'playerChampData'); // will remove 'playerChampData'

	//	console.log("got here");
    await Promise.all(stores.map(async (store) => {
        exportedLeague[store] = await idb.league[store].getAll();
    }));

	//console.log(storesFull);

	  if (storesFull.includes("gameAttributes")) {
			//console.log("got here");
		//	console.log(exportedLeague);

			for (let i = 0; i < exportedLeague.gameAttributes.length; i++) {
			//	console.log(exportedLeague.gameAttributes[i]);
			}
	  }

	//console.log("got here");
    if (stores.includes('schedule')) {
		for (let i = 0; i < exportedLeague.schedule.length; i++) {
		//	console.log(exportedLeague.schedule[i]);
		}
	}
		//console.log("got here");
    // Move playerStats to players object, similar to old DB structure. Makes editing JSON output nicer.
    if (stores.includes('playerStats')) {
        for (let i = 0; i < exportedLeague.playerStats.length; i++) {
            const pid = exportedLeague.playerStats[i].pid;
            for (let j = 0; j < exportedLeague.players.length; j++) {
                if (exportedLeague.players[j].pid === pid) {
                    if (!exportedLeague.players[j].hasOwnProperty("stats")) {
                        exportedLeague.players[j].stats = [];
                    }
                    exportedLeague.players[j].stats.push(exportedLeague.playerStats[i]);
                    break;
                }
            }
        }

        delete exportedLeague.playerStats;
    }

	//playerChampData
	//if (g.gameType == 7) {
	if (storesFull.includes('playerChampData')) {
		if (stores.includes('players')) {
			console.log(exportedLeague.players.length);

			for (let j = 0; j < exportedLeague.players.length; j++) {
				delete exportedLeague.players[j].championsRnk;
				delete exportedLeague.players[j].champions;
				/*if (j<10) {
					console.log(exportedLeague.players[j]);
				}*/
			}
		}
	} else {
		if (stores.includes('players')) {
		//	console.log(exportedLeague.players[0].championsRnk);
		//	console.log(exportedLeague.players[0].champions);
		}
	}

	console.log(exportedLeague);
    if (stores.includes('teams')) {
        for (let i = 0; i < exportedLeague.teamSeasons.length; i++) {
            const tid = exportedLeague.teamSeasons[i].tid;
            for (let j = 0; j < exportedLeague.teams.length; j++) {
                if (exportedLeague.teams[j].tid === tid) {
                    if (!exportedLeague.teams[j].hasOwnProperty("seasons")) {
                        exportedLeague.teams[j].seasons = [];
                    }
                    exportedLeague.teams[j].seasons.push(exportedLeague.teamSeasons[i]);
                    break;
                }
            }
        }

        for (let i = 0; i < exportedLeague.teamStats.length; i++) {
            const tid = exportedLeague.teamStats[i].tid;
            for (let j = 0; j < exportedLeague.teams.length; j++) {
                if (exportedLeague.teams[j].tid === tid) {
                    if (!exportedLeague.teams[j].hasOwnProperty("stats")) {
                        exportedLeague.teams[j].stats = [];
                    }
                    exportedLeague.teams[j].stats.push(exportedLeague.teamStats[i]);
                    break;
                }
            }
        }

        delete exportedLeague.teamSeasons;
        delete exportedLeague.teamStats;
    }
console.log(exportedLeague);
    return exportedLeague;
}

async function updateMetaNameRegion(name: string, region: string) {
    const l = await idb.meta.leagues.get(g.lid);
    l.teamName = name;
    l.teamRegion = region;
    await idb.meta.leagues.put(l);
}

/**
 * Load game attributes from the database and update the global variable g.
 *
 * @return {Promise}
 */
async function loadGameAttributes() {
    const gameAttributes = await idb.cache.gameAttributes.getAll();

    for (let i = 0; i < gameAttributes.length; i++) {
        g[gameAttributes[i].key] = gameAttributes[i].value;
    }

    // Shouldn't be necessary, but some upgrades fail http://www.reddit.com/r/BasketballGM/comments/2zwg24/cant_see_any_rosters_on_any_teams_in_any_of_my/cpn0j6w
    if (g.userTids === undefined) { g.userTids = [g.userTid]; }

    // Set defaults to avoid IndexedDB upgrade
    helpers.keys(defaultGameAttributes).forEach(key => {
        if (g[key] === undefined) {
            g[key] = defaultGameAttributes[key];
        }
    });

    await toUI(['setGameAttributes', g]);

    // UI stuff
    toUI(['emit', 'updateTopMenu', {godMode: g.godMode}]);
    toUI(['emit', 'updateTopMenu', {bothSplits: g.bothSplits}]);
    toUI(['emit', 'updateMultiTeam']);
}

// Depending on phase, initiate action that will lead to the next phase
async function autoPlay(conditions: Conditions) {

	/*		FANTASY_DRAFT: -1,
			PRESEASON: 0,
			REGULAR_SEASON: 1,
			AFTER_TRADE_DEADLINE: 2,
			MSI: 3,
			MIDSEASON: 4,
			SECOND_HALF: 5,
			PLAYOFFS: 6,
			BEFORE_DRAFT: 7,
			RESIGN_PLAYERS: 8,
			FREE_AGENCY: 9,	*/
		//	console.log(g.gameType+" "+g.phase);
	if (g.gameType < 6) {
	//	console.log(g.phase);
		if (g.phase === g.PHASE.PRESEASON) {
	//	console.log(g.phase);
			await phase.newPhase(g.PHASE.REGULAR_SEASON, conditions);
		} else if (g.phase === g.PHASE.REGULAR_SEASON) {
	//	console.log(g.phase);
			const numDays = await season.getDaysLeftSchedule();
			await game.play(numDays, conditions);
		} else if (g.phase === g.PHASE.PLAYOFFS) {
	//	console.log(g.phase);
			await game.play(100, conditions);
		} else if (g.phase === g.PHASE.BEFORE_DRAFT) {
	//	console.log(g.phase);
			await phase.newPhase(g.PHASE.RESIGN_PLAYERS, conditions);
	//        await phase.newPhase(PHASE.DRAFT, conditions);
	//	} else if (g.phase === g.PHASE.DRAFT) {
			//await draft.untilUserOrEnd(conditions);
		//} else if (g.phase === g.PHASE.AFTER_DRAFT) {
			//await phase.newPhase(g.PHASE.RESIGN_PLAYERS, conditions);
		} else if (g.phase === g.PHASE.RESIGN_PLAYERS) {
			await phase.newPhase(g.PHASE.FREE_AGENCY, conditions);
		} else if (g.phase === g.PHASE.FREE_AGENCY) {
			await freeAgents.play(g.daysLeft, conditions);
		} else {
			throw new Error(`Unknown phase: ${g.phase}`);
		}
	} else {
		//console.log(g.phase);
		if (g.phase === g.PHASE.PRESEASON) {
			await phase.newPhase(g.PHASE.REGULAR_SEASON, conditions);
		} else if (g.phase === g.PHASE.REGULAR_SEASON) {
			const numDays = await season.getDaysLeftSchedule();
			await game.play(numDays, conditions);
		} else if (g.phase === g.PHASE.MSI) {
			await game.play(100, conditions);
		} else if (g.phase === g.PHASE.MIDSEASON) {
			await phase.newPhase(g.PHASE.SECOND_HALF, conditions);
		} else if (g.phase === g.PHASE.SECOND_HALF) {
			const numDays = await season.getDaysLeftSchedule();
			await game.play(numDays, conditions);
		} else if (g.phase === g.PHASE.PLAYOFFS) {
			await game.play(100, conditions);
		} else if (g.phase === g.PHASE.BEFORE_DRAFT) {
			await phase.newPhase(g.PHASE.RESIGN_PLAYERS, conditions);
	//        await phase.newPhase(PHASE.DRAFT, conditions);
		} else if (g.phase === g.PHASE.DRAFT) {
			await draft.untilUserOrEnd(conditions);
		} else if (g.phase === g.PHASE.AFTER_DRAFT) {
			await phase.newPhase(g.PHASE.RESIGN_PLAYERS, conditions);
		} else if (g.phase === g.PHASE.RESIGN_PLAYERS) {
			await phase.newPhase(g.PHASE.FREE_AGENCY, conditions);
		} else if (g.phase === g.PHASE.FREE_AGENCY) {
			await freeAgents.play(g.daysLeft, conditions);
		} else {
			throw new Error(`Unknown phase: ${g.phase}`);
		}
	}


}

async function initAutoPlay(conditions: Conditions) {
	let numberSeasons = 5;
	if (g.gameType > 4 || g.gameType == 1 || g.gameType == -2) {
		numberSeasons = 1;
	}
    const result = await toUI(['prompt', 'This will play through multiple seasons, using the AI to manage your team. How many seasons do you want to simulate?', numberSeasons], conditions);
    const numSeasons = parseInt(result, 10);
	//console.log(numSeasons);
    if (Number.isInteger(numSeasons)) {
        local.autoPlaySeasons = numSeasons;
        autoPlay(conditions);
    }
}

// Flush cache, disconnect from league database, and unset g.lid
const close = async (disconnect?: boolean) => {
    const gameSim = lock.get('gameSim');

    local.autoPlaySeasons = 0;
    lock.set('stopGameSim', true);
    lock.set('gameSim', false);

	let moreWait;

	if (g.gameType == 7) {
//		moreWait = 10000;
		moreWait = 0;
	} else if (g.gameType == 6) {
		moreWait = 0;
	} else {
		moreWait = 0;
	}
    // Wait in case stuff is still happening (ugh)
	// need to wait longer for different game types
    if (gameSim) {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000 + moreWait);
        });
    }

    if (g.lid !== undefined && idb.league !== undefined) {
        await updateStatus('Saving...');
        await idb.cache.flush();
        await updateStatus('Idle');

        if (disconnect) {
            idb.cache.stopAutoFlush();

            // Should probably "close" cache here too, but no way to do that now

            idb.league.close();
        }
    }

    if (disconnect) {
        lock.reset();
        local.reset();

        g.lid = undefined;
    }
};

/**
 * Delete an existing league.
 *
 * @memberOf core.league
 * @param {number} lid League ID.
 * @param {function()=} cb Optional callback.
 */
async function remove(lid: number) {
	console.log(g.lid);
	console.log(lid);

    if (g.lid === lid) {
        close(true);
    }
	console.log("got here");

    idb.meta.leagues.delete(lid);
	console.log("got here");

    await backboard.delete(`league${lid}`);
	console.log("got here");

}

export default {
    create,
    exportLeague,
    remove,
    setGameAttributes,
    updateMetaNameRegion,
    loadGameAttributes,
    autoPlay,
    initAutoPlay,
    close,
};
