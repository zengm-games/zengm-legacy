// @flow

import _ from 'underscore';
import {PHASE, PLAYER, g, helpers} from '../../common';
import {draft, player, trade} from '../core';
import {idb} from '../db';
import {local, logEvent, random} from '../util';
import type {Conditions, ContractInfo, TeamSeason, TeamStats, TradePickValues} from '../../common/types';

function genSeasonRow(tid: number, cid: number, imgURLCountry: string, countrySpecific: string, prevSeason?: TeamSeason): TeamSeason {

	var numTeams;
	if (g.gameType == 0 && g.gameType == 2) {
	   numTeams = 10;
	} else if (g.gameType == 1) {
	   numTeams = 30;
	} else if (g.gameType == 3) {
	   numTeams = 12;
	} else if (g.gameType == 4) {
	   numTeams = 8;
	} else if (g.gameType == 5) {
	   numTeams = 57;
	} else if (g.gameType == 6) {
	   numTeams = 57;
	} else if (g.gameType == 7) {
	   numTeams = 129;
	}

	var ladderCSLCSStart
	if (g.gameType == 7) {
	//	console.log(cid % 3);
		ladderCSLCSStart = cid % 3;
	} else {
		ladderCSLCSStart = -1; // not used in other game types
	}
	//console.log(cid);
//	console.log(ladderCSLCSStart);
    const newSeason = {
        tid,
        season: g.season,
        seasonSplit: g.seasonSplit,
        gp: 0,
        gpHome: 0,
        att: 0,
        cash: 10000,
        won: 0,
        lost: 0,
        wonSummer: 0,
        lostSummer: 0,
        wonSpring: 0,
        lostSpring: 0,
        wonHome: 0,
        lostHome: 0,
        wonAway: 0,
        lostAway: 0,
        wonDiv: 0,
        lostDiv: 0,
        wonConf: 0,
        lostConf: 0,
        lastTen: [],
        streak: 0,
		cidStart: cid,
		cidMid: cid,
		cidNext: cid,
		imgURLCountry,
		countrySpecific,
        playoffRoundsWon: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship // final tournament
        playoffRoundsWonMSI: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonNALCS: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonEULCS: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonLCK: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonLPL: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonLMS: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonNALCSPr: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonNACSPrA: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonNACSPrB: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonWorldsGr: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonWorldsReg: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonWorlds: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonMSIGr: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonMSIPlayIn: -1,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonNALCSStay: false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonNALCSStayEU: false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonRegionals:  false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonMaybePlayoffs: false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
    //    playoffRoundsWonNALCKStay: false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        //playoffRoundsWonNALPLStay: false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        //playoffRoundsWonNALMSStay: false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonNACSStay: false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        playoffRoundsWonNALadderStay: false,  // -1: didn't make playoffs. 0: lost in first round. ... N: won championship
        ladderCSLCSStart: ladderCSLCSStart,  // 2 ladder, 1 CS, 0 LCS
        ladderCSLCS: ladderCSLCSStart,  // 2 ladder, 1 CS, 0 LCS
        pointsSpring: 0,  // 2 ladder, 1 CS, 0 LCS
        pointsSummer: 0,  // 2 ladder, 1 CS, 0 LCS
        hype: Math.random(),
        pop: 0,  // Needs to be set somewhere!
      /*  revenues: {
            luxuryTaxShare: {
                amount: 0,
                rank: 15.5,
            },
            merch: {
                amount: 0,
                rank: 15.5,
            },
            sponsor: {
                amount: 0,
                rank: 15.5,
            },
            ticket: {
                amount: 0,
                rank: 15.5,
            },
            nationalTv: {
                amount: 0,
                rank: 15.5,
            },
            localTv: {
                amount: 0,
                rank: 15.5,
            },
        },
        expenses: {
            salary: {
                amount: 0,
                rank: 15.5,
            },
            luxuryTax: {
                amount: 0,
                rank: 15.5,
            },
            minTax: {
                amount: 0,
                rank: 15.5,
            },
            scouting: {
                amount: 0,
                rank: 15.5,
            },
            coaching: {
                amount: 0,
                rank: 15.5,
            },
            health: {
                amount: 0,
                rank: 15.5,
            },
            facilities: {
                amount: 0,
                rank: 15.5,
            },*/
		revenues: {
			merch: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			sponsor: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			ticket: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			nationalTv: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			localTv: {
				amount: 0,
				rank: (numTeams+1)/2
			},
		},
		expenses: {
			salary: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			luxuryTax: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			minTax: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			scouting: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			coaching: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			health: {
				amount: 0,
				rank: (numTeams+1)/2
			},
			facilities: {
				amount: 0,
				rank: (numTeams+1)/2
			},
        },
        payrollEndOfSeason: -1,
    };

	//console.log(prevSeason);
	//console.log(newSeason);

    if (prevSeason) {
        // New season, carrying over some values from the previous season
        newSeason.pop = prevSeason.pop * random.uniform(0.98, 1.02);  // Mean population should stay constant, otherwise the economics change too much
        newSeason.hype = prevSeason.hype;
        newSeason.cash = prevSeason.cash;
        newSeason.cidStart = prevSeason.cidNext;
        newSeason.cidMid = prevSeason.cidNext;
        newSeason.cidNext = prevSeason.cidNext;
        newSeason.ladderCSLCS = prevSeason.ladderCSLCS;
        newSeason.ladderCSLCSStart = prevSeason.ladderCSLCS;
		//if  (g.seasonSplit == "Spring" ) {
		//	newSeason.pointsSpring = prevSeason.pointsSpring;
		//}
		//cidStart: prevSeason.cid,
		//cidNext: prevSeason.cid,
		newSeason.imgURLCountry = prevSeason.imgURLCountry;
		newSeason.countrySpecific = prevSeason.countrySpecific;
		//console.log(prevSeason);
		if (g.gameType == 1) {
			let correctCid = prevSeason.cidNext%3 ;

			newSeason.cidStart = correctCid;
			newSeason.cidMid = correctCid;
			newSeason.cidNext = correctCid;
		}
		if (g.gameType == 7) {
			let correctCid = prevSeason.cidNext - prevSeason.cidNext%3 + newSeason.ladderCSLCS;
			newSeason.cidStart = correctCid;
			newSeason.cidMid = correctCid;
			newSeason.cidNext = correctCid;
		}

		let ladderCSLCS = newSeason.cidStart%3;


	//	console.log(newSeason.tid+" "+newSeason.cidStart+" "+newSeason.cidMid+" "+newSeason.cidNext+" "+prevSeason.ladderCSLCSStart+" "+prevSeason.cidNext+" "+prevSeason.ladderCSLCS +" "+ladderCSLCS);

		// is prevSeason.ladderCSLCS the correct data point?
		if (ladderCSLCS != prevSeason.ladderCSLCS) {
			//console.log("why is this different?");
			//console.log(ladderCSLCS);
			//console.log(prevSeason.ladderCSLCS);
			//console.log(prevSeason);
			//console.log(newSeason);

		}
		//newSeason.ladderCSLCS = ladderCSLCS;
		//newSeason.ladderCSLCSStart = ladderCSLCS;
	//	console.log(newSeason);

    }


    return newSeason;
}

/**
 * Generate a new row of team stats.
 *
 * A row contains stats for unique values of (season, playoffs). So new rows need to be added when a new season starts or when a team makes the playoffs.
 *
 * @memberOf core.team
 * @param {=boolean} playoffs Is this stats row for the playoffs or not? Default false.
 * @return {Object} Team stats object.
 */
function genStatsRow(tid: number, playoffs?: boolean = false): TeamStats {
//	console.log(tid+" "+playoffs);
    return {
        tid,
        season: g.season,
		seasonSplit: g.seasonSplit,
        playoffs,
        gp: 0,
        min: 0,
        fg: 0,
        fga: 0,
        fgp: 0,
        fgAtRim: 0,
        fgaAtRim: 0,
        fgpAtRim: 0,
        fgLowPost: 0,
        fgaLowPost: 0,
        fgpLowPost: 0,
        fgMidRange: 0,
        fgaMidRange: 0,
        fgpMidRange: 0,
        tp: 0,
        tpa: 0,
        ft: 0,
        fta: 0,
        orb: 0,
        drb: 0,
        trb: 0,
        ast: 0,
        tov: 0,
        stl: 0,
        blk: 0,
        ba: 0,
        pf: 0,
			oppTw: 0,
			oppInh: 0,
            oppJM: 0,
            pts: 0,
            oppPts: 0,
			wardP:0,
			wardD:0,
			kda:0,
			oppWardP: 0,
			oppWardD: 0,
			oppKDA: 0,
			oppKls: 0,
			oppDth: 0,
			oppAst: 0,
			opprh: 0,
			rh: 0,
			scTwr:0,
			scKills:0,
			grExpTwr:0,
			grExpKills:0,
			grGldTwr:0,
			grGldKills:0,
			tmBuffTwr:0,
			tmBuffKills:0,
			tmBAdjTwr:0,
			tmBAdjKills:0,
			TPTwr:0,
			TPKills:0,
			TwTwr:0,
			TwKills:0,
			CKTwr:0,
			CKKills:0,
		/*	CKTwr:0,
			CKKills:0,	*/
			CSTwr:0,
			CSKills:0,
			AgTwr:0,
			AgKills:0,
			ChmpnTwr:0,
			ChmpnKills:0,
			riftKills:0,
			riftAssists:0,
			firstBlood:0,
    };
}

/**
 * Create a new team object.
 *
 * @memberOf core.team
 * @param {Object} tm Team metadata object, likely from core.league.create.
 * @return {Object} Team object to insert in the database.
 */
function generate(tm: any) {
    let strategy;
    if (tm.hasOwnProperty("strategy")) {
        strategy = tm.strategy;
    } else {
        strategy = Math.random() > 0.5 ? "contending" : "rebuilding";
    }


    return {
        tid: tm.tid,
        cid: tm.cid,
        did: tm.did,
        region: tm.region,
        name: tm.name,
        abbrev: tm.abbrev,
            country: tm.country,
			countrySpecific: tm.countrySpecific !== undefined ? tm.imgURLCountry : tm.country,
            imgURLCountry: tm.imgURLCountry !== undefined ? tm.imgURLCountry : "",
            imgURLStadium: tm.imgURLStadium !== undefined ? tm.imgURLStadium : "",
        imgURL: tm.imgURL !== undefined ? tm.imgURL : "",
        budget: {
            ticketPrice: {
                amount: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.amount : parseFloat((25 + 25 * (g.numTeams - tm.popRank) / (g.numTeams - 1)).toFixed(2)),
                rank: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.rank : tm.popRank,
            },
            scouting: {
                amount: tm.hasOwnProperty("budget") ? tm.budget.scouting.amount : Math.round(500 + 20000 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 1,
                rank: tm.hasOwnProperty("budget") ? tm.budget.scouting.rank : tm.popRank,
            },
            coaching: {
                amount: tm.hasOwnProperty("budget") ? tm.budget.coaching.amount : Math.round(5000 + 40000 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 1,
                rank: tm.hasOwnProperty("budget") ? tm.budget.coaching.rank : tm.popRank,
            },
            health: {
                amount: tm.hasOwnProperty("budget") ? tm.budget.health.amount : Math.round(100 + 10000 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 1,
                rank: tm.hasOwnProperty("budget") ? tm.budget.health.rank : tm.popRank,
            },
            facilities: {
                amount: tm.hasOwnProperty("budget") ? tm.budget.facilities.amount : Math.round(1000 + 20000 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 1,
                rank: tm.hasOwnProperty("budget") ? tm.budget.facilities.rank : tm.popRank,
            },
        },
        strategy,
		coach: {
			top: 5,
			jgl: 5,
			mid: 5,
			adc: 5,
			sup: 5,
			topJGL: 5,
			jglJGL: 5,
			midJGL: 5,
			adcJGL: 5,
			supJGL: 5,
		},
    };
}

/**
 * Given a list of players sorted by ability, find the starters.
 *
 *
 * @param  {[type]} players [description]
 * @param {Array.<string>} p Array positions of players on roster, sorted by value already.
 * @return {Array.<number>} Indexes of the starters from the input array. If this is of length < 5, then satisfactory starters couldn't be found and any players should be used to fill in the starting lineup.
 */
function findStarters(positions: string[]): number[] {
    const starters = []; // Will be less than 5 in length if that's all it takes to meet requirements

	var i, position = [];
	for (i = 0; i < positions.length; i++) {
		if (positions[i] == "TOP") {
			starters.push(i);
	//console.log(starters);
			break;
		}
	}

	for (i = 0; i < positions.length; i++) {
		if (positions[i] == "JGL") {
			starters.push(i);
	//console.log(starters);
			break;
		}             }

	for (i = 0; i < positions.length; i++) {
		if (positions[i] == "MID") {
			starters.push(i);
	//console.log(starters);
			break;
		}
	}

	for (i = 0; i < positions.length; i++) {
		if (positions[i] == "ADC") {
			starters.push(i);
	//console.log(starters);
			break;
		}
	}

	for (i = 0; i < positions.length; i++) {
		if (positions[i] == "SUP") {
			starters.push(i);
	//console.log(starters);
			break;
		}
	}
	//console.log(starters);
    return starters;
}

/**
 * Sort a team's roster based on player ratings and stats.
 *
 * @memberOf core.team
 * @param {number} tid Team ID.
 * @return {Promise}
 */
async function rosterAutoSort(tid: number) {
    // Get roster and sort by value (no potential included)
    const playersFromCache = await idb.cache.players.indexGetAll('playersByTid', tid);
    let players = helpers.deepCopy(playersFromCache);
    players = await idb.getCopies.playersPlus(players, {
        attrs: ["pid", "valueNoPot", "valueNoPotFuzz","valueMMR"],
        ratings: ["pos"],
        season: g.season,
        showNoStats: true,
        showRookies: true,
    });
    // Fuzz only for user's team
    if (tid === g.userTid) {
        players.sort((a, b) => b.valueNoPotFuzz - a.valueNoPotFuzz);
    } else {
        players.sort((a, b) => b.valueMMR - a.valueMMR);
    }


    // Shuffle array so that position conditions are met - 2 G and 2 F/C in starting lineup, at most one pure C
    const positions = players.map(p => p.ratings.pos);
	//console.log(positions);
    const starters = findStarters(positions);
	//console.log(starters);
    const newPlayers = starters.map(i => players[i]);
	//console.log(newPlayers);

    for (let i = 0; i < players.length; i++) {
        if (!starters.includes(i)) {
            newPlayers.push(players[i]);
        }
    }
    players = newPlayers;

	//console.log(players.length);
    for (let i = 0; i < players.length; i++) {
        players[i].rosterOrder = i;
	//	console.log(player[i]);
	//	console.log(player[i].rosterOrder);
    }

    // Update rosterOrder
    for (const p of playersFromCache) {
        for (const p2 of players) {
            if (p2.pid === p.pid) {
                if (p.rosterOrder !== p2.rosterOrder) {
				//	console.log(p.rosterOrder+" "+p2.rosterOrder);
                    // Only write to DB if this actually changes
                    p.rosterOrder = p2.rosterOrder;
                    await idb.cache.players.put(p);
                }
                break;
            }
        }
    }
}

/**
* Gets all the contracts a team owes.
*
* This includes contracts for players who have been released but are still owed money.
*
* @memberOf core.team
* @param {number} tid Team ID.
* @returns {Promise.Array} Array of objects containing contract information.
*/
async function getContracts(tid: number): Promise<ContractInfo[]> {
    // First, get players currently on the roster
    const players = await idb.cache.players.indexGetAll('playersByTid', tid);

    const contracts = players.map(p => {
        return {
            pid: p.pid,
            firstName: p.firstName,
            lastName: p.lastName,
            skills: p.ratings[p.ratings.length - 1].skills,
            injury: p.injury,
            watch: p.watch !== undefined ? p.watch : false, // undefined check is for old leagues, can delete eventually
            amount: p.contract.amount,
            exp: p.contract.exp,
            released: false,
        };
    });

    // Then, get any released players still owed money
    const releasedPlayers = await idb.cache.releasedPlayers.indexGetAll('releasedPlayersByTid', tid);

    for (const releasedPlayer of releasedPlayers) {
        const p = await idb.getCopy.players({pid: releasedPlayer.pid});
        if (p !== undefined) { // If a player is deleted, such as if the user deletes retired players, this will be undefined
            contracts.push({
                pid: releasedPlayer.pid,
                firstName: p.firstName,
                lastName: p.lastName,
                skills: p.ratings[p.ratings.length - 1].skills,
                injury: p.injury,
                amount: releasedPlayer.contract.amount,
                exp: releasedPlayer.contract.exp,
                released: true,
            });
        } else {
            contracts.push({
                pid: releasedPlayer.pid,
                firstName: "Deleted",
                lastName: "Player",
                skills: [],
                injury: {type: 'Healthy', gamesRemaining: 0},
                amount: releasedPlayer.contract.amount,
                exp: releasedPlayer.contract.exp,
                released: true,
            });
        }
    }

    return contracts;
}


// turn this into updateCountry
async function updateCountry() {
    const teams = await idb.cache.teams.getAll();
    for (const t of teams) {
        // Skip user's team
     //   if (t.tid === g.userTid) {
      //      continue;
      //  }

        // Change in wins
        const teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${t.tid}`);
   //     const teamSeasonOld = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season - 1},${t.tid}`);

        let countrySpecific = teamSeason.countrySpecific;
       //let country = teamSeason.country;
        //const dWon = teamSeasonOld ? won - teamSeasonOld.won : 0;

        // Young stars
        let players = await idb.cache.players.indexGetAll('playersByTid', t.tid);
        players = await idb.getCopies.playersPlus(players, {
            season: g.season,
            tid: t.tid,
            attrs: ["born","rosterOrder"],
            //stats: ["min"],
        });


	   var i;

		//players.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });
		players.sort((a, b) => a.rosterOrder - b.rosterOrder);

		let countries = [];
//					for (i = 0; i < 5; i++) {
		for (i = 0; i < players.length; i++) {
			countries.push(players[i].born.country);
		}

		countries.sort();

		let maxLength = 1;
		let currentLength = 1;
		let country = countries[0];
		for (i = 1; i < countries.length; i++) {
			if (countries[i] ==  countries[i-1]) {
				currentLength += 1;
			} else {
				currentLength = 1;
			}
			if (currentLength > maxLength) {
				maxLength = currentLength;
				country = countries[i];
			}

		}

		let updated = false;
		if  ((maxLength>2) && (t.countrySpecific === country)) {
			t.imgURLCountry = getCountryImage2(t.countrySpecific);
			updated = true;
		} else if  ((maxLength<=2) && (t.country === t.countrySpecific)) {
			if (t.countrySpecific == "EU") {
				t.imgURLCountry = getCountryImage2(t.countrySpecific);
				updated = true;
			}

		} else if  (maxLength<=2) {
			t.countrySpecific = t.country;
			if (t.country == "NA") {
				t.imgURLCountry = getCountryImage2("UnitedStates");
			} else {
				t.imgURLCountry = getCountryImage2(t.countrySpecific);
			}
			updated = true;
		} else  {
			t.countrySpecific = country;
			t.imgURLCountry = getCountryImage2(t.countrySpecific);
			updated = true;
		}


		http://www.flagandbanner.com/images/K20LAT35.jpg

	//	console.log(updated+" "+t.countrySpecific+" "+t.imgURLCountry);
        if (updated) {
			teamSeason.imgURLCountry = t.imgURLCountry
		//	console.log(updated+" "+t.countrySpecific+" "+t.imgURLCountry+" "+teamSeason.imgURLCountry );
            await idb.cache.teams.put(t);
            await idb.cache.teamSeasons.put(teamSeason);
        }
    }
}




async function getPositions(tid) {

        let players = await idb.cache.players.indexGetAll('playersByTid', tid);
        players = await idb.getCopies.playersPlus(players, {
            season: g.season,
            tid: tid,
            attrs: ["born","rosterOrder"],
            //stats: ["min"],
        });

		var i,positions;

		positions = [];
		for (i = 0; i < players.length; i++) {
		//	console.log(players[i].rosterOrder);
		//for (i = 0; i < 5; i++) {
		//	console.log(i+" "+players[i].rosterOrder);
			if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
				positions.push(players[i].pos);
			}
		}

		// Then, get any released players still owed money
		return [positions];
		//});
    }


async function getRegions(tid) {

        let players = await idb.cache.players.indexGetAll('playersByTid', tid);
        players = await idb.getCopies.playersPlus(players, {
            season: g.season,
            tid: tid,
            attrs: ["born","rosterOrder"],
            //stats: ["min"],
        });

		var i,regions;

		regions = [];
		for (i = 0; i < players.length; i++) {
		//	console.log(players[i].rosterOrder);
		//for (i = 0; i < 5; i++) {
		//	console.log(i+" "+players[i].rosterOrder);
			if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
				regions.push(players[i].born.loc);
			}
		}

		// Then, get any released players still owed money
		return [regions];
		//});
    }

	// same as above?
async function getCountries(tid) {


        let players = await idb.cache.players.indexGetAll('playersByTid', tid);
        players = await idb.getCopies.playersPlus(players, {
            season: g.season,
            tid: tid,
            attrs: ["born","rosterOrder"],
            //stats: ["min"],
        });
            var i,regions;

            regions = [];
            for (i = 0; i < players.length; i++) {
			//	console.log(players[i].rosterOrder);
            //for (i = 0; i < 5; i++) {
			//	console.log(i+" "+players[i].rosterOrder);
				if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
			//		console.log(players[i].born.country);
					regions.push(players[i].born.country);
				}
            }

            // Then, get any released players still owed money
            return [regions];
		//});
    }



/**
 * Get the total current payroll for a team.
 *
 * This includes players who have been released but are still owed money from their old contracts.
 *
 * @memberOf core.team
 * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
 * @return {Promise.<number, Array=>} Resolves to an array; first argument is the payroll in thousands of dollars, second argument is the array of contract objects from getContracts.
 */
async function getPayroll(tid: number): Promise<[number, ContractInfo[]]> {
    const contracts = await getContracts(tid);

    let payroll = 0;
    for (let i = 0; i < contracts.length; i++) {
        payroll += contracts[i].amount;  // No need to check exp, since anyone without a contract for the current season will not have an entry
    }

    return [payroll, contracts];
}

/**
 * Get the total current payroll for every team team.
 *
 * @memberOf core.team
 * @return {Promise} Resolves to an array of payrolls, ordered by team id.
 */
function getPayrolls(): Promise<number[]> {
    return Promise.all(_.range(g.numTeams).map(async (tid) => {
        return (await getPayroll(tid))[0];
    }));
}

// estValuesCached is either a copy of estValues (defined below) or null. When it's cached, it's much faster for repeated calls (like trading block).
async function valueChange(
    tid: number,
    pidsAdd: number[],
    pidsRemove: number[],
    dpidsAdd: number[],
    dpidsRemove: number[],
    estValuesCached?: TradePickValues,
): Promise<number> {
    // UGLY HACK: Don't include more than 2 draft picks in a trade for AI team
    if (dpidsRemove.length > 100) {
        return -1;
    }

    // Get value and skills for each player on team or involved in the proposed transaction
    const roster = [];
    let add = [];
    let remove = [];

    // Get team strategy and population, for future use
    const t = await idb.getCopy.teamsPlus({
        attrs: ["strategy"],
        seasonAttrs: ["pop"],
        stats: ["gp"],
        season: g.season,
        tid,
    });
    if (!t) { throw new Error('Invalid team ID'); }

    const strategy = t.strategy;
    let pop = t.seasonAttrs.pop;
    if (pop > 20) {
        pop = 20;
    }
    const gpAvg = helpers.bound(t.stats.gp, 0, g.numGames); // Ideally would be done separately for each team, but close enough

    const payroll = (await getPayroll(tid))[0];

    // Get players
    const getPlayers = async () => {
        // Fudge factor for AI overvaluing its own players
        const fudgeFactor = tid !== g.userTid ? 1.05 : 1;

        // Get roster and players to remove
        const players = await idb.cache.players.indexGetAll('playersByTid', tid);
		//console.log(players);
        for (const p of players) {
		//	console.log(p);
            if (!pidsRemove.includes(p.pid)) {
                roster.push({
                    value: p.value,
                    skills: _.last(p.ratings).skills,
                    contract: p.contract,
                    worth: player.genContract(p, false, false, true),
                    injury: p.injury,
                    age: g.season - p.born.year,
                    region: p.born.loc,
                    country: p.born.country,
                });
            } else {
                remove.push({
                    value: p.value * fudgeFactor,
                    skills: _.last(p.ratings).skills,
                    contract: p.contract,
                    worth: player.genContract(p, false, false, true),
                    injury: p.injury,
                    age: g.season - p.born.year,
                    region: p.born.loc,
                    country: p.born.country,
                });
            }
        }

        // Get players to add
        for (const pid of pidsAdd) {
            const p = await idb.cache.players.get(pid);
            add.push({
                value: p.valueWithContract,
                skills: _.last(p.ratings).skills,
                contract: p.contract,
                worth: player.genContract(p, false, false, true),
                injury: p.injury,
                age: g.season - p.born.year,
				region: p.born.loc,
				country: p.born.country,
            });
        }
    };

    const getPicks = async () => {
        // For each draft pick, estimate its value based on the recent performance of the team
        if (dpidsAdd.length > 0 || dpidsRemove.length > 0) {
            // Estimate the order of the picks by team
            const allTeamSeasons = await idb.cache.teamSeasons.indexGetAll('teamSeasonsBySeasonTid', [`${g.season - 1}`, `${g.season},Z`]);

            // This part needs to be run every time so that gpAvg is available
            const wps = []; // Contains estimated winning percentages for all teams by the end of the season

            let gp = 0;
            for (let tid2 = 0; tid2 < g.numTeams; tid2++) {
                const teamSeasons = allTeamSeasons.filter(teamSeason => teamSeason.tid === tid2);
                const s = teamSeasons.length;

                let rCurrent;
                let rLast;
                if (teamSeasons.length === 1) {
                    // First season
                    if (teamSeasons[0].won + teamSeasons[0].lost > 15) {
                        rCurrent = [teamSeasons[0].won, teamSeasons[0].lost];
                    } else {
                        // Fix for new leagues - don't base this on record until we have some games played, and don't let the user's picks be overvalued
                        rCurrent = tid2 === g.userTid ? [g.numGames, 0] : [0, g.numGames];
                    }

                    if (tid2 === g.userTid) {
                        rLast = [Math.round(0.6 * g.numGames), Math.round(0.4 * g.numGames)];
                    } else {
                        // Assume a losing season to minimize bad trades
                        rLast = [Math.round(0.4 * g.numGames), Math.round(0.6 * g.numGames)];
                    }
                } else {
                    // Second (or higher) season
                    rCurrent = [teamSeasons[s - 1].won, teamSeasons[s - 1].lost];
                    rLast = [teamSeasons[s - 2].won, teamSeasons[s - 2].lost];
                }

                gp = rCurrent[0] + rCurrent[1]; // Might not be "real" games played

                // If we've played half a season, just use that as an estimate. Otherwise, take a weighted sum of this and last year
                const halfSeason = Math.round(0.5 * g.numGames);
                if (gp >= halfSeason) {
                    wps.push(rCurrent[0] / gp);
                } else if (gp > 0) {
                    wps.push((gp / halfSeason * rCurrent[0] / gp + (halfSeason - gp) / halfSeason * rLast[0] / g.numGames));
                } else {
                    wps.push(rLast[0] / g.numGames);
                }
            }

            // Get rank order of wps http://stackoverflow.com/a/14834599/786644
            const sorted = wps.slice().sort((a, b) => a - b);
            const estPicks = wps.slice().map(v => sorted.indexOf(v) + 1); // For each team, what is their estimated draft position?

            const rookieSalaries = draft.getRookieSalaries();

            // Actually add picks after some stuff below is done
            let estValues;
            if (estValuesCached) {
                estValues = estValuesCached;
            } else {
                estValues = await trade.getPickValues();
            }

            for (const dpid of dpidsAdd) {
                const dp = await idb.cache.draftPicks.get(dpid);

                let estPick = estPicks[dp.originalTid];

                // For future draft picks, add some uncertainty
                const seasons = dp.season - g.season;
                estPick = Math.round(estPick * (5 - seasons) / 5 + 15 * seasons / 5);

                // No fudge factor, since this is coming from the user's team (or eventually, another AI)
                let value;
                if (estValues[String(dp.season)]) {
                    value = estValues[String(dp.season)][estPick - 1 + g.numTeams * (dp.round - 1)];
                }
                if (!value) {
                    value = estValues.default[estPick - 1 + g.numTeams * (dp.round - 1)];
                }

                add.push({
                    value,
                    skills: [],
                    contract: {
                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)],
                        exp: dp.season + 2 + (2 - dp.round), // 3 for first round, 2 for second
                    },
                    worth: {
                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)],
                        exp: dp.season + 2 + (2 - dp.round), // 3 for first round, 2 for second
                    },
                    injury: {type: 'Healthy', gamesRemaining: 0},
                    age: 19,
                    draftPick: true,
                });
            }

            for (const dpid of dpidsRemove) {
                const dp = await idb.cache.draftPicks.get(dpid);
                let estPick = estPicks[dp.originalTid];

                // For future draft picks, add some uncertainty
                const seasons = dp.season - g.season;
                estPick = Math.round(estPick * (5 - seasons) / 5 + 15 * seasons / 5);

                // Set fudge factor with more confidence if it's the current season
                let fudgeFactor;
                if (seasons === 0 && gp >= g.numGames / 2) {
                    fudgeFactor = (1 - gp / g.numGames) * 5;
                } else {
                    fudgeFactor = 5;
                }

                // Use fudge factor: AI teams like their own picks
                let value;
                if (estValues[String(dp.season)]) {
                    value = estValues[String(dp.season)][estPick - 1 + g.numTeams * (dp.round - 1)] + (tid !== g.userTid ? 1 : 0) * fudgeFactor;
                }
                if (!value) {
                    value = estValues.default[estPick - 1 + g.numTeams * (dp.round - 1)] + (tid !== g.userTid ? 1 : 0) * fudgeFactor;
                }

                remove.push({
                    value,
                    skills: [],
                    contract: {
                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)] / 1000,
                        exp: dp.season + 2 + (2 - dp.round), // 3 for first round, 2 for second
                    },
                    worth: {
                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)] / 1000,
                        exp: dp.season + 2 + (2 - dp.round), // 3 for first round, 2 for second
                    },
                    injury: {type: 'Healthy', gamesRemaining: 0},
                    age: 19,
                    draftPick: true,
                });
            }
        }
    };

    await getPlayers();
    await getPicks();

/*    // Handle situations where the team goes over the roster size limit
    if (roster.length + remove.length > 15) {
        // Already over roster limit, so don't worry unless this trade actually makes it worse
        needToDrop = (roster.length + add.length) - (roster.length + remove.length);
    } else {
        needToDrop = (roster.length + add.length) - 15;
    }
    roster.sort((a, b) => a.value - b.value); // Sort by value, ascending
    add.sort((a, b) => a.value - b.value); // Sort by value, ascending
    while (needToDrop > 0) {
        // Find lowest value player, from roster or add. Delete him and move his salary to the second lowest value player.
        if (roster[0].value < add[0].value) {
            if (roster[1].value < add[0].value) {
                roster[1].contract.amount += roster[0].contract.amount;
            } else {
                add[0].contract.amount += roster[0].contract.amount;
            }
            roster.shift(); // Remove from value calculation
        } else {
            if (add.length > 1 && add[1].value < roster[0].value) {
                add[1].contract.amount += add[0].contract.amount;
            } else {
                roster[0].contract.amount += add[0].contract.amount;
            }
            add.shift(); // Remove from value calculation
        }

        needToDrop -= 1;
    }*/

    // This roughly corresponds with core.gameSim.updateSynergy
    const skillsNeeded = {
		SC: 1,
		TP: 2,
		JC: 1,
		Tw: 3,
		CK: 3,
		CS: 3,
		Ag: 0
    };

    const doSkillBonuses = (test, rosterLocal) => {
        // What are current skills?
        let rosterSkills = [];
	//	console.log(rosterLocal);
        for (let i = 0; i < rosterLocal.length; i++) {
            if (rosterLocal[i].value >= 45) {
                rosterSkills.push(rosterLocal[i].skills);
            }
        }
        rosterSkills = _.flatten(rosterSkills);
        const rosterSkillsCount = _.countBy(rosterSkills);

        // Sort test by value, so that the highest value players get bonuses applied first
        test.sort((a, b) => b.value - a.value);

        for (let i = 0; i < test.length; i++) {
            if (test[i].value >= 45) {
                for (let j = 0; j < test[i].skills.length; j++) {
                    const s = test[i].skills[j];

                    if (rosterSkillsCount[s] <= skillsNeeded[s] - 2) {
                        // Big bonus
                        test[i].value *= 1.1;
                    } else if (rosterSkillsCount[s] <= skillsNeeded[s] - 1) {
                        // Medium bonus
                        test[i].value *= 1.05;
                    } else if (rosterSkillsCount[s] <= skillsNeeded[s]) {
                        // Little bonus
                        test[i].value *= 1.025;
                    }

                    // Account for redundancy in test
                    rosterSkillsCount[s] += 1;
                }
            }
        }

        return test;
    };

    const doRegionBonuses = (test, rosterLocal) => {
		let countryList = [];
		let regionList = [];



		for (let i = 0; i < rosterLocal.length; i++) {
			if 	(typeof(rosterLocal[i].country) != 'undefined') {
				countryList.push(rosterLocal[i].country);
			}

		}
		for (let i = 0; i < rosterLocal.length; i++) {
			if 	(typeof(rosterLocal[i].region) != 'undefined') {
				regionList.push(rosterLocal[i].region);
			}
		}

		countryList.sort();
		regionList.sort();

		let maxLength = 1;
		let currentLength = 1;
		let teamCountry = "";
		let teamRegion = "";

		for (let i = 1; i < countryList.length; i++) {
			if (countryList[i] ==  countryList[i-1]) {
				currentLength += 1;
			} else {
				currentLength = 1;
			}
			if (currentLength > maxLength) {
				maxLength = currentLength;
				teamCountry = countryList[i];
			}

		}

		let countryAdj = maxLength;

		maxLength = 1;
		currentLength = 1;
		for (let i = 1; i < regionList.length; i++) {
			if (regionList[i] ==  regionList[i-1]) {
				currentLength += 1;
			} else {
				currentLength = 1;
			}
			if (currentLength > maxLength) {
				maxLength = currentLength;
				teamRegion = regionList[i];
			}

		}
		let regionAdj = maxLength;


        for (let i = 0; i < test.length; i++) {
			//console.log(test[i]);
            if (test[i].region == teamRegion) {
			//	console.log(test[i].region+" "+teamRegion+" "+ test[i].value);
                test[i].value *= 1.20;
				//console.log(test[i].region+" "+teamRegion+" "+ test[i].value);
			}
            if (test[i].country == teamCountry) {
                test[i].value *= 1.20;
				//console.log(test[i].country+" "+teamCountry+" "+ test[i].value);
			}

		}

//		countryAdj = (maxLength-5)/5; // scale of -.8 to 0;
	//	countryAdj /= 20;  // scale of -.04 to 0
        return test;
    };
	//console.log(roster);

    // Apply bonuses based on skills coming in and leaving
    const rosterAndRemove = roster.concat(remove);
	//console.log(remove);
	//console.log(rosterAndRemove);
    const rosterAndAdd = roster.concat(add);
	//console.log(add);
	//console.log(rosterAndAdd);
    add = doSkillBonuses(add, rosterAndRemove);
    remove = doSkillBonuses(remove, rosterAndAdd);
    add = doRegionBonuses(add, rosterAndRemove);
    remove = doRegionBonuses(remove, rosterAndAdd);

//	console.log(add);
	//console.log(rosterAndRemove);
	//console.log(rosterAndAdd);

    // This actually doesn't do anything because I'm an idiot
    const base = 1.25;

    const sumValues = (players, includeInjuries) => {
        includeInjuries = includeInjuries !== undefined ? includeInjuries : false;

        if (players.length === 0) {
            return 0;
        }

			//console.log(players);
        const exponential = players.reduce((memo, p) => {
            let playerValue = p.value;

            if (strategy === "rebuilding") {
                // Value young/cheap players and draft picks more. Penalize expensive/old players
                if (p.draftPick) {
                    playerValue *= 0;
                } else if (p.age <= 18) {
					playerValue *= 1.20;
				} else if (p.age === 19) {
					playerValue *= 1.15;
				} else if (p.age === 20) {
					playerValue *= 1.10;
				} else if (p.age === 21) {
					playerValue *= 1.10;
				} else if (p.age === 22) {
					playerValue *= 1.10;
				} else if (p.age === 23) {
					playerValue *= 1.07;
				} else if (p.age === 24) {
					playerValue *= 1.04;
				} else if (p.age === 25) {
					playerValue *= 0.99;
				} else if (p.age === 26) {
					playerValue *= 0.94;
				} else if (p.age >= 27) {
					playerValue *= 0.91;
				}
            }

			// put other team needs?
			// region, language, ywt
			//console.log(p);




            // Anything below 45 is pretty worthless
            playerValue -= 45;

			playerValue -= 0;
			playerValue *= playerValue;
			playerValue /= 100;
			playerValue *= playerValue;
			playerValue /= 100;
			playerValue *= playerValue;
			playerValue /= 100;

            // Normalize for injuries
            if (includeInjuries && tid !== g.userTid) {
                if (p.injury.gamesRemaining > 75) {
                    playerValue -= playerValue * 0.75;
                } else {
                    playerValue -= playerValue * p.injury.gamesRemaining / 100;
                }
            }

            let contractValue = (p.worth.amount - p.contract.amount) / 1000;

            // Account for duration
            const contractSeasonsRemaining = player.contractSeasonsRemaining(p.contract.exp, g.numGames - gpAvg);
            if (contractSeasonsRemaining > 1) {
                // Don't make it too extreme
                contractValue *= contractSeasonsRemaining ** 0.25;
            } else {
                // Raising < 1 to < 1 power would make this too large
                contractValue *= contractSeasonsRemaining;
            }

            // Really bad players will just get no PT
            if (playerValue < 0) {
                playerValue = 0;
            }
//console.log([playerValue, contractValue]);

//            const value = playerValue + 0.5 * contractValue;
            const value = playerValue;

            if (value === 0) {
                return memo;
            }
            return memo + (Math.abs(value) ** base) * Math.abs(value) / value;
        }, 0);

        if (exponential === 0) {
            return exponential;
        }
        return (Math.abs(exponential) ** (1 / base)) * Math.abs(exponential) / exponential;
    };

    // Sum of contracts
    // If onlyThisSeason is set, then amounts after this season are ignored and the return value is the sum of this season's contract amounts in millions of dollars
    const sumContracts = (players, onlyThisSeason) => {
        onlyThisSeason = onlyThisSeason !== undefined ? onlyThisSeason : false;

        if (players.length === 0) {
            return 0;
        }

        return players.reduce((memo, p) => {
            if (p.draftPick) {
                return memo;
            }

//            return memo + p.contract.amount / 1000 * (player.contractSeasonsRemaining(p.contract.exp, g.numGames - gpAvg) ** (0.25 - (onlyThisSeason ? 0.25 : 0)));
            return memo + p.contract.amount  * Math.pow(player.contractSeasonsRemaining(p.contract.exp, 24 - gpAvg), 0.25 - (onlyThisSeason ? 0.25 : 0));

        }, 0);
    };

  //  const contractsFactor = strategy === "rebuilding" ? 0.3 : 0.1;

    const salaryRemoved = sumContracts(remove) - sumContracts(add);

//    let dv = sumValues(add, true) - sumValues(remove) + contractsFactor * salaryRemoved;
    let dv = sumValues(add, true) - sumValues(remove);
/*console.log("Added players/picks: " + sumValues(add, true));
console.log("Removed players/picks: " + (-sumValues(remove)));
console.log("Added contract quality: -" + contractExcessFactor + " * " + sumContractExcess(add));
console.log("Removed contract quality: -" + contractExcessFactor + " * " + sumContractExcess(remove));
console.log("Total contract amount: " + contractsFactor + " * " + salaryRemoved);*/

    // Aversion towards losing cap space in a trade during free agency
    if (g.phase >= g.PHASE.RESIGN_PLAYERS || g.phase <= g.PHASE.FREE_AGENCY) {
        // Only care if cap space is over 2 million
        if (payroll + 2000 < g.salaryCap) {
            const salaryAddedThisSeason = sumContracts(add, true) - sumContracts(remove, true);
            // Only care if cap space is being used
            if (salaryAddedThisSeason > 0) {
//console.log("Free agency penalty: -" + (0.2 + 0.8 * g.daysLeft / 30) * salaryAddedThisSeason);
                //dv -= (0.2 + 0.8 * g.daysLeft / 30) * salaryAddedThisSeason; // 0.2 to 1 times the amount, depending on stage of free agency
            }
        }
    }

    // Normalize for number of players, since 1 really good player is much better than multiple mediocre ones
    // This is a fudge factor, since it's one-sided to punish the player
    if (add.length > remove.length) {
        dv -= add.length - remove.length;
    }

    return dv;
/*console.log('---');
console.log([sumValues(add), sumContracts(add)]);
console.log([sumValues(remove), sumContracts(remove)]);
console.log(dv);*/
}

/**
 * Update team strategies (contending or rebuilding) for every team in the league.
 *
 * Basically.. switch to rebuilding if you're old and your success is fading, and switch to contending if you have a good amount of young talent on rookie deals and your success is growing.
 *
 * @memberOf core.team
 * @return {Promise}
 */
async function updateStrategies() {
    const teams = await idb.cache.teams.getAll();
    for (const t of teams) {
        // Skip user's team
        if (t.tid === g.userTid) {
            continue;
        }

        // Change in wins
        const teamSeason = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season},${t.tid}`);
        const teamSeasonOld = await idb.cache.teamSeasons.indexGet('teamSeasonsBySeasonTid', `${g.season - 1},${t.tid}`);

        const won = teamSeason.won;
        const dWon = teamSeasonOld ? won - teamSeasonOld.won : 0;

        // Young stars
        let players = await idb.cache.players.indexGetAll('playersByTid', t.tid);
        players = await idb.getCopies.playersPlus(players, {
            season: g.season,
            tid: t.tid,
            attrs: ["age", "value", "contract"],
            stats: ["min"],
        });

        let youngStar = 0; // Default value

        let numerator = 0; // Sum of age * mp
        let denominator = 0; // Sum of mp
        for (let i = 0; i < players.length; i++) {
            numerator += players[i].age * players[i].stats.min;
            denominator += players[i].stats.min;

            // Is a young star about to get a pay raise and eat up all the cap after this season?
            if (players[i].value > 65 && players[i].contract.exp === g.season + 1 && players[i].contract.amount <= 5 && players[i].age <= 25) {
                youngStar += 1;
            }
        }

        const age = numerator / denominator; // Average age, weighted by minutes played
        const score = 0.8 * dWon + (won - g.numGames / 2) + 5 * (26 - age) + youngStar * 20;

        let updated = false;
        if (score > 20 && t.strategy === "rebuilding") {
            t.strategy = "contending";
            updated = true;
        } else if (score < -20 && t.strategy === "contending") {
            t.strategy = "rebuilding";
            updated = true;
        }

        if (updated) {
            await idb.cache.teams.put(t);
        }
    }
}


async function checkRosterSizes(conditions: Conditions): Promise<string | void> {
        var minFreeAgents, minFreeAgentsTop, minFreeAgentsMid, minFreeAgentsJgl, minFreeAgentsADC, minFreeAgentsSup, tx;
		var minFreeAgentsTop2, minFreeAgentsMid2, minFreeAgentsJgl2, minFreeAgentsADC2, minFreeAgentsSup2;
		let userTeamSizeError;

		const checkRosterSize = async tid => {
			const players = await idb.cache.players.indexGetAll('playersByTid', tid);
// 56 tid is the issue
			const countries = await getCountries(tid)[0];

				var i, numPlayersOnRoster, numPlayersOnRosterStart, p, promises;
				var numFromRegion;
				var addedPos;
				var top, mid, jgl, sup,adc,playersDropped;
				var s;

				playersDropped = 0;

				promises = [];
				addedPos = [];
        numPlayersOnRoster = players.length;
        numPlayersOnRosterStart = players.length;

				if (g.userTids.includes(tid) && local.autoPlaySeasons == 0) {
				} else if (numPlayersOnRoster > 5) {
					rosterAutoSort(tid);
				}

				numFromRegion = 0;
				let numNotRegion = 0;
				if (typeof(g.regionalRestrictions) == 'undefined') {
					numFromRegion = 10;
					numNotRegion = 0;
				} else if (!g.regionalRestrictions) {
					numFromRegion = 10;
					numNotRegion = 0;
				} else if (typeof(g.teamCountryCache) == 'undefined') {
					numFromRegion = 10;
					numNotRegion = 0;
				} else {
					for (i = 0; i < (numPlayersOnRoster); i++) {
						s = players[i].ratings.length - 1;
					//	console.log(players[i].ratings[s].region);
				//		console.log(g.teamCountryCache[tid]);
				//		console.log(numNotRegion);
						if (players[i].ratings[s].region == g.teamCountryCache[tid]) {
							if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
								numFromRegion += 1;
							}
						} else {
							if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
								numNotRegion += 1;
							}

						}
					}
				}

				var maxCountry, onlyCountry, onlyThisCountry;
				var countryOnly;

				onlyCountry = false;
				onlyThisCountry = "";

				if (g.teamCountryCache[tid] == "EU") {

					maxCountry = _.countBy(countries);

					for (i = 0; i < (maxCountry.length); i++) {
						if ( (maxCountry[players[i].born.country] >= 1 && players[i].born.country != "Korea") ) {
							onlyCountry = true;
							onlyThisCountry = players[i].born.country;
							i = maxCountry.length;
						}
					}
				}

				// used for?
				countryOnly = true;
				if ( (g.countryConcentration/30) > Math.random()) {
					countryOnly = false;
				}

			//	players.sort(function (a, b) { return a.value - b.value; }); // Lowest first
				var top, mid, jgl, sup,adc,playersAdded;
				top = 0;
				mid = 0;
				jgl = 0;
				sup = 0;
				adc = 0;

				for (i = 0; i < (numPlayersOnRosterStart); i++) {
					s = players[i].ratings.length - 1;

				   if (players[i].ratings[s].pos == "TOP") {
					  top += 1;
				   } else  if (players[i].ratings[s].pos == "MID") {
					  mid += 1;
				   } else  if (players[i].ratings[s].pos == "JGL") {
					  jgl += 1;
				   } else  if (players[i].ratings[s].pos == "SUP") {
					  sup += 1;
				   } else  if (players[i].ratings[s].pos == "ADC") {
					  adc += 1;
				   }
				}
				playersAdded = 0;
				if (numNotRegion > 5-g.importRestriction) {
					//	console.log(tid+" numNotRegion: "+numNotRegion+" g.importRestrict"+g.importRestriction+" numPlayersOnRoster: "+numPlayersOnRoster);
					if (g.userTids.includes(tid) && local.autoPlaySeasons === 0) {
						if (g.userTids.length <= 1) {
							userTeamSizeError = 'Your team has ';
						} else {
							userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
							//userTeamSizeError = `The ${g.teamRegionsCache[tid]} ${g.teamNamesCache[tid]} have `;

						}
						userTeamSizeError += 'too many players from outside your region '+ numNotRegion +'. You must remove players (by <a href="' + helpers.leagueUrl(["roster"]) + '">releasing them from your roster</a> or through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						//userTeamSizeError += `more than the maximum number of players (15). You must remove players (by <a href="${helpers.leagueUrl(["roster"])}">releasing them from your roster</a> or through <a href="${helpers.leagueUrl(["trade"])}">trades</a>) before continuing.`;

          } else {
                        // Automatically drop lowest value players until we reach 15
						players.sort((a, b) => a.value - b.value);

						for (i = 0; i < (numPlayersOnRoster); i++) {
							s = players[i].ratings.length - 1;
							if (players[i].ratings[s].region != g.teamCountryCache[tid] && numNotRegion > 5-g.importRestriction) {
								if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
									promises.push(player.release(players[i], true));
									playersDropped += 1;
									numNotRegion -= 1;
								}
							}
						}
						numPlayersOnRoster -= playersDropped;
          }

				} else if (numPlayersOnRoster < g.minRosterSize || (top<1) || (mid<1) || (jgl<1)  || (adc<1)  || (sup<1) ) {
					if (g.userTids.includes(tid) && local.autoPlaySeasons === 0 ) {

						if (numPlayersOnRoster < g.minRosterSize) {
							if (g.userTids.length <= 1) {
								userTeamSizeError = 'Your team has ';
							} else {
								userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' have ';
							}
							userTeamSizeError += 'less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						}

          } else {
                        // Auto-add players
           //console.log("top: "+top+" mid: "+mid+" jgl: "+jgl+" adc: "+adc+" sup: "+sup);
					// console.log("top: "+minFreeAgentsTop.length+" "+minFreeAgentsTop2.length);
				//	 console.log("mid: "+minFreeAgentsMid.length+" "+minFreeAgentsMid2.length);
				//	 console.log("jgl: "+minFreeAgentsJgl.length+" "+minFreeAgentsJgl2.length);
				//	 console.log("adc: "+minFreeAgentsADC.length+" "+minFreeAgentsADC2.length);
				//	 console.log("sup: "+minFreeAgentsSup.length+" "+minFreeAgentsSup2.length);
// put player back in if not used for other teams, look into shift
						if ((top<1) && ((minFreeAgentsTop.length > 0) || (minFreeAgentsTop2.length > 0))) {
								if (minFreeAgentsTop.length > 0) {
									p = minFreeAgentsTop.shift();
								} else {
									p = minFreeAgentsTop2.shift();
								}

								let minFreeAgentsTopLength = minFreeAgentsTop.length;
								let minFreeAgentsTop2Length = minFreeAgentsTop2.length;

//								while ((p.born.loc != g.teamCountryCache[tid]) && (numNotRegion < 2) && (numFromRegion < g.importRestriction) && ((minFreeAgentsTop.length > 0) || (minFreeAgentsTop2.length > 0)) && (!countryOnly || onlyThisCountry == p.born.country)) {

								while ((p.born.loc != g.teamCountryCache[tid] || ( (numNotRegion < 5-g.importRestriction) || (numFromRegion > g.importRestriction))) && ((minFreeAgentsTopLength > 0) || (minFreeAgentsTop2Length > 0)) && (!countryOnly || onlyThisCountry == p.born.country)) {
								//	console.log(numNotRegion+" "+g.teamCountryCache[tid]+" "+numFromRegion+" "+g.importRestriction+" "+minFreeAgentsTop.length+" "+minFreeAgentsTop2.length+" "+countryOnly+" "+onlyThisCountry+" "+p.born.country);
									if (minFreeAgentsTopLength > 0) {
										minFreeAgentsTop.push(p);
										p = minFreeAgentsTop.shift();
										minFreeAgentsTopLength	-= 1;
									} else if (minFreeAgentsTop2Length > 0) {

										minFreeAgentsTop2.push(p);
										p = minFreeAgentsTop2.shift();
										minFreeAgentsTop2Length	-= 1;
									} else {
									  break;
									}

//									p = minFreeAgentsTop.shift();
								}
						//console.log("got here");
								if (p.born.loc == g.teamCountryCache[tid]) {
									numFromRegion += 1;
								}
								p.tid = tid;
								await player.addStatsRow(p, g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI);
								player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;
								idb.cache.markDirtyIndexes('players');
							//	console.log(p);
								logEvent({
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.firstName+" "+p.lastName + '</a> ('+p.pos+') for ' + helpers.formatCurrency(p.contract.amount/1000, "K") + '/year through ' + p.contract.exp + '.',
//									text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ${helpers.formatCurrency(p.contract.amount / 1000, "M")}/year through ${p.contract.exp}.`,
									//showNotification: p.watch && typeof p.watch !== "function",
									showNotification: false,
									pids: [p.pid],
									tids: [p.tid],
								}, conditions);
								promises.push(idb.cache.players.put(p));

								numPlayersOnRoster += 1;
								playersAdded += 1;
								top +=1;
						}
						if ((mid<1) && ((minFreeAgentsMid.length > 0) || (minFreeAgentsMid2.length > 0))) {

						   if (tid === g.userTid && local.autoPlaySeasons === 0) {
		//                        userTeamSizeError = 'Your team currently does not have a TOP position playerhas less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
							} else {
								if (minFreeAgentsMid.length > 0) {
									p = minFreeAgentsMid.shift();
								} else {
									p = minFreeAgentsMid2.shift();
								}

								let minFreeAgentsMidLength = minFreeAgentsMid.length;
								let minFreeAgentsMid2Length = minFreeAgentsMid2.length;
						//		console.log("born loc: "+p.born.loc+" != teamCountry "+g.teamCountryCache[tid]);
						//		console.log("numNotRegion: "+numNotRegion+" < 5-g.importRestriction "+5-g.importRestriction);
						//		console.log("minFreeAgentsMidLength: "+minFreeAgentsMidLength+" minFreeAgentsMid2Length "+minFreeAgentsMid2Length);
						//		console.log("!countryOnly: "+countryOnly);
						//		console.log("onlyThisCountry: "+onlyThisCountry+" === p.born.country "+p.born.country);
								while ((p.born.loc != g.teamCountryCache[tid] ||  (numNotRegion < 5-g.importRestriction) && (numFromRegion >  g.importRestriction)) && ((minFreeAgentsMidLength > 0) || (minFreeAgentsMid2Length > 0))&& (!countryOnly || onlyThisCountry == p.born.country)) {
									if (minFreeAgentsMidLength > 0) {
										minFreeAgentsMid.push(p);
										p = minFreeAgentsMid.shift();
										minFreeAgentsMidLength -= 1;
									} else if (minFreeAgentsMid2Length > 0) {
										//console.log(p);
										minFreeAgentsMid2.push(p);
										p = minFreeAgentsMid2.shift();
										minFreeAgentsMid2Length -= 1;
									} else {
										break;
									}
								}
								if (p.born.loc == g.teamCountryCache[tid]) {
							//	if (p.country == g.teamCountryCache[tid]) {
									numFromRegion += 1;
								}
								p.tid = tid;
								await player.addStatsRow(p, g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI);
								player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;
								idb.cache.markDirtyIndexes('players');
							//	console.log(p);
								logEvent({
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' +  p.firstName+" "+p.lastName + '</a> ('+p.pos+')  for ' + helpers.formatCurrency(p.contract.amount/1000, "K") + '/year through ' + p.contract.exp + '.',
//									text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ${helpers.formatCurrency(p.contract.amount / 1000, "M")}/year through ${p.contract.exp}.`,
									showNotification: p.watch && typeof p.watch !== "function",
									pids: [p.pid],
									tids: [p.tid],
								}, conditions);
								promises.push(idb.cache.players.put(p));

								numPlayersOnRoster += 1;
								playersAdded += 1;
								mid +=1;
							}
						}
//						if ((jgl<1) && (minFreeAgentsJgl.length > 0)) {
						if ((jgl<1) && ((minFreeAgentsJgl.length > 0) || (minFreeAgentsJgl2.length > 0))) {

						   if (tid === g.userTid && local.autoPlaySeasons === 0) {
		//                        userTeamSizeError = 'Your team currently does not have a TOP position playerhas less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
							} else {
								if (minFreeAgentsJgl.length > 0) {
									p = minFreeAgentsJgl.shift();
								} else {
									p = minFreeAgentsJgl2.shift();
								}

								let minFreeAgentsJGLLength = minFreeAgentsJgl.length;
								let minFreeAgentsJGL2Length = minFreeAgentsJgl2.length;
								while ((p.born.loc != g.teamCountryCache[tid] ||  (numNotRegion < 5-g.importRestriction) && (numFromRegion >  g.importRestriction)) && ((minFreeAgentsJGLLength > 0) || (minFreeAgentsJGL2Length > 0)) && (!countryOnly || onlyThisCountry == p.born.country)) {
									if (minFreeAgentsJGLLength > 0) {
										minFreeAgentsJgl.push(p);
										p = minFreeAgentsJgl.shift();
										minFreeAgentsJGLLength -= 1;
									} else if (minFreeAgentsJGL2Length > 0) {
										minFreeAgentsJgl2.push(p);
										p = minFreeAgentsJgl2.shift();
										minFreeAgentsJGL2Length -= 1;
									} else {
										break;
									}
//									p = minFreeAgentsJgl.shift();
								}
								if (p.born.loc == g.teamCountryCache[tid]) {
							//	if (p.country == g.teamCountryCache[tid]) {
									numFromRegion += 1;
								}
								p.tid = tid;
								await player.addStatsRow(p, g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI);
								player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;
								idb.cache.markDirtyIndexes('players');
								//console.log(p);
								logEvent({
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.firstName+" "+p.lastName  + '</a> ('+p.pos+') for ' + helpers.formatCurrency(p.contract.amount/1000, "K") + '/year through ' + p.contract.exp + '.',
//									text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ${helpers.formatCurrency(p.contract.amount / 1000, "M")}/year through ${p.contract.exp}.`,
									showNotification: p.watch && typeof p.watch !== "function",
									pids: [p.pid],
									tids: [p.tid],
								}, conditions);
								promises.push(idb.cache.players.put(p));
								numPlayersOnRoster += 1;
								playersAdded += 1;
								jgl +=1;
							}
						}
						if ((adc<1) && ((minFreeAgentsADC.length > 0) || (minFreeAgentsADC2.length > 0))) {
						   if (tid === g.userTid && local.autoPlaySeasons === 0) {
							} else {
								if (minFreeAgentsADC.length > 0) {
									p = minFreeAgentsADC.shift();
								} else {
									p = minFreeAgentsADC2.shift();
								}

								let minFreeAgentsADCLength = minFreeAgentsADC.length;
								let minFreeAgentsADC2Length = minFreeAgentsADC2.length;
								while ((p.born.loc != g.teamCountryCache[tid] ||  (numNotRegion < 5-g.importRestriction) && (numFromRegion >  g.importRestriction)) && ((minFreeAgentsADCLength > 0) || (minFreeAgentsADC2Length > 0)) && (!countryOnly || onlyThisCountry == p.born.country)) {
									if (minFreeAgentsADCLength > 0) {
										minFreeAgentsADC.push(p);
										p = minFreeAgentsADC.shift();
										minFreeAgentsADCLength	-= 1;
									} else if (minFreeAgentsADC2Length > 0) {
										minFreeAgentsADC2.push(p);
										p = minFreeAgentsADC2.shift();
										minFreeAgentsADC2Length	-= 1;
									} else {
									}
									//p = minFreeAgentsADC.shift();
								}
								if (p.born.loc == g.teamCountryCache[tid]) {
									numFromRegion += 1;
								}
								p.tid = tid;
								await player.addStatsRow(p, g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI);
								player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;
								idb.cache.markDirtyIndexes('players');
								//console.log(p);
								logEvent({
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' +  p.firstName+" "+p.lastName + '</a> ('+p.pos+') for ' + helpers.formatCurrency(p.contract.amount/1000, "K") + '/year through ' + p.contract.exp + '.',
//									text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ${helpers.formatCurrency(p.contract.amount / 1000, "M")}/year through ${p.contract.exp}.`,
									showNotification: p.watch && typeof p.watch !== "function",
									pids: [p.pid],
									tids: [p.tid],
								}, conditions);
								promises.push(idb.cache.players.put(p));

								numPlayersOnRoster += 1;
								playersAdded += 1;
								adc +=1;
							}
						}

						if ((sup<1) && ((minFreeAgentsSup.length > 0) || (minFreeAgentsSup2.length > 0))) {
						   if (tid === g.userTid && local.autoPlaySeasons === 0) {
							} else {

								if (minFreeAgentsSup.length > 0) {
									p = minFreeAgentsSup.shift();
								} else {
																console.log(minFreeAgentsSup.length);
									p = minFreeAgentsSup2.shift();
								}
								let minFreeAgentsSUPLength = minFreeAgentsSup.length;
								let minFreeAgentsSUP2Length = minFreeAgentsSup2.length;
								while ((p.born.loc != g.teamCountryCache[tid] ||  (numNotRegion < 5-g.importRestriction) && (numFromRegion >  g.importRestriction))  &&  ((minFreeAgentsSUPLength > 0) || (minFreeAgentsSUP2Length > 0)) && (!countryOnly || onlyThisCountry == p.born.country)) {
									if (minFreeAgentsSUPLength > 0) {
										minFreeAgentsSup.push(p);
										p = minFreeAgentsSup.shift();
										minFreeAgentsSUPLength	-= 1;
									} else if (minFreeAgentsSUP2Length > 0) {

										minFreeAgentsSup2.push(p);
										p = minFreeAgentsSup2.shift();
										minFreeAgentsSUP2Length	-= 1;
								//	console.log(p);
									} else {
										break;
									}
								}
								if (p.born.loc == g.teamCountryCache[tid]) {

									numFromRegion += 1;
								}
								p.tid = tid;
								await player.addStatsRow(p, g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI);
								player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;
								idb.cache.markDirtyIndexes('players');
							//	console.log(p);
								logEvent({
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' +  p.firstName+" "+p.lastName  + '</a> ('+p.pos+') for ' + helpers.formatCurrency(p.contract.amount/1000, "K") + '/year through ' + p.contract.exp + '.',
//									text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ${helpers.formatCurrency(p.contract.amount / 1000, "M")}/year through ${p.contract.exp}.`,
									showNotification: p.watch && typeof p.watch !== "function",
									pids: [p.pid],
									tids: [p.tid],
								}, conditions);
								promises.push(idb.cache.players.put(p));

								numPlayersOnRoster += 1;
								playersAdded += 1;
								sup +=1;
							}
						}




          }

      } else if (numFromRegion < g.importRestriction) {

					if (g.userTids.includes(tid) && local.autoPlaySeasons === 0) {
						if (g.userTids.length <= 1) {
							userTeamSizeError = 'Your team has ';
						} else {
							userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
						}
						userTeamSizeError += 'less than the minimum number of starters ('+g.importRestriction+') from your region. You must adjust your roster or add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';

                    } else {
					   var ii, found;
					   ii = 0;
           while  (numFromRegion < g.importRestriction && minFreeAgentsTop.length >= ii) {
						   	found = false;
							if ((top<3) && (minFreeAgentsTop.length > ii) ) {

								if ( (minFreeAgentsTop[ii].born.loc == g.teamCountryCache[tid] && g.teamCountryCache[tid] != "EU") || (!countryOnly || (onlyThisCountry == minFreeAgentsTop[ii].born.country && g.teamCountryCache[tid] == "EU")  ))  {

									found = true;
									p = minFreeAgentsTop[ii];
									minFreeAgentsTop.splice(ii,1);
									top += 1;
									playersAdded += 1;
								}
							}

							if ((mid<3) && (minFreeAgentsMid.length > ii) && !found ) {
								if ( (minFreeAgentsMid[ii].born.loc == g.teamCountryCache[tid] && g.teamCountryCache[tid] != "EU") || (!countryOnly || (onlyThisCountry == minFreeAgentsMid[ii].born.country && g.teamCountryCache[tid] == "EU")  ))  {

									found = true;
									p = minFreeAgentsMid[ii];
									minFreeAgentsMid.splice(ii,1);
									mid += 1;
									playersAdded += 1;
								}
							}
							if ((jgl<3) && (minFreeAgentsJgl.length > ii) && !found ) {
								if ( (minFreeAgentsJgl[ii].born.loc == g.teamCountryCache[tid] && g.teamCountryCache[tid] != "EU") || (!countryOnly || (onlyThisCountry == minFreeAgentsJgl[ii].born.country && g.teamCountryCache[tid] == "EU")  ))  {

									found = true;
									p = minFreeAgentsJgl[ii];
									minFreeAgentsJgl.splice(ii,1);
									jgl += 1;
									playersAdded += 1;
								}
							}
							if ((adc<3) && (minFreeAgentsADC.length > ii) && !found ) {
						//console.log(numFromRegion+" "+g.importRestriction+" "+minFreeAgentsADC.length+" "+ii+" "+minFreeAgentsADC[ii].born.loc+" "+minFreeAgentsADC[ii].born.country+" "+minFreeAgentsADC[ii].pos+" "+found);

//								if (minFreeAgentsADC[ii].born.loc == g.teamCountryCache[tid] && (!countryOnly || onlyThisCountry == minFreeAgentsADC[ii].born.country))  {
								if ( (minFreeAgentsADC[ii].born.loc == g.teamCountryCache[tid] && g.teamCountryCache[tid] != "EU") || (!countryOnly || (onlyThisCountry == minFreeAgentsADC[ii].born.country && g.teamCountryCache[tid] == "EU")  ))  {

									found = true;
									p = minFreeAgentsADC[ii];
								//	console.log(ii);
								//	console.log(minFreeAgentsADC[ii]);
									minFreeAgentsADC.splice(ii,1);
									//console.log(p);
									adc += 1;
									playersAdded += 1;
								//	numFromRegion += 1;
								}
							}
							if ((sup<3) && (minFreeAgentsSup.length > ii) && !found ) {
						//console.log(numFromRegion+" "+g.importRestriction+" "+minFreeAgentsSup.length+" "+ii+" "+minFreeAgentsSup[ii].born.loc+" "+minFreeAgentsSup[ii].born.country+" "+minFreeAgentsSup[ii].pos+" "+found);

//								if (minFreeAgentsSup[ii].born.loc == g.teamCountryCache[tid] && (!countryOnly || onlyThisCountry == minFreeAgentsSup[ii].born.country))  {
								if ( (minFreeAgentsSup[ii].born.loc == g.teamCountryCache[tid] && g.teamCountryCache[tid] != "EU") || (!countryOnly || (onlyThisCountry == minFreeAgentsSup[ii].born.country && g.teamCountryCache[tid] == "EU")  ))  {
									found = true;
									//console.log(ii);
									//console.log(minFreeAgentsSup[ii]);
									p = minFreeAgentsSup[ii];
									minFreeAgentsSup.splice(ii,1);
									//console.log(p);
									sup += 1;
									playersAdded += 1;
								//	numFromRegion += 1;
								}
							}
						    if (found) {
							//	console.log(found);
							//	console.log(p.born.loc);
							//	console.log(g.teamCountryCache[tid] );
								if (p.born.loc == g.teamCountryCache[tid] && (!countryOnly || onlyThisCountry == p.born.country))  {
									p.tid = tid;
									await player.addStatsRow(p, g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI);
									player.setContract(p, p.contract, true);
									p.gamesUntilTradable = 4;
									addedPos.push(p.ratings[p.ratings.length-1].pos);
									idb.cache.markDirtyIndexes('players');

									logEvent({
										type: "freeAgent",
										text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> ('+p.pos+') for ' + helpers.formatCurrency(p.contract.amount, "K") + '/year through ' + p.contract.exp + '.',
	//									text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> for ${helpers.formatCurrency(p.contract.amount / 1000, "M")}/year through ${p.contract.exp}.`,
										showNotification: p.watch && typeof p.watch !== "function",
										pids: [p.pid],
										tids: [p.tid],
									}, conditions);
									promises.push(idb.cache.players.put(p));

									numPlayersOnRoster += 1;
									numFromRegion += 1;
									console.log(numFromRegion);
								}
							}
							ii += 1;
                        }
					}
				} else if ( (g.maxRosterSize == undefined && numPlayersOnRoster > 10) || (numPlayersOnRoster > g.maxRosterSize) ) {
										console.log(g.maxRosterSize);
				//	if (g.userTids.indexOf(tid) >= 0  && g.autoPlaySeasons === 0) {
					if (g.userTids.includes(tid) && local.autoPlaySeasons === 0) {
						if (g.userTids.length <= 1) {
							userTeamSizeError = 'Your team has ';
						} else {
							userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
							//userTeamSizeError = `The ${g.teamRegionsCache[tid]} ${g.teamNamesCache[tid]} have `;

						}
						userTeamSizeError += 'more than the maximum number of players. You must remove players (by <a href="' + helpers.leagueUrl(["roster"]) + '">releasing them from your roster</a> or through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						//userTeamSizeError += `more than the maximum number of players (15). You must remove players (by <a href="${helpers.leagueUrl(["roster"])}">releasing them from your roster</a> or through <a href="${helpers.leagueUrl(["trade"])}">trades</a>) before continuing.`;

                    } else {
                        // Automatically drop lowest value players until we reach 15
                        //players.sort(function (a, b) { return a.value - b.value; }); // Lowest first
						players.sort((a, b) => a.value - b.value);
						if (countryOnly)  {
							for (i = 0; i < (numPlayersOnRoster); i++) {
								if ( ( (onlyThisCountry != players[i].born.country)) && ((players[i].pos == "TOP") && (top>1) ) ||  ((players[i].pos == "MID") && (mid>1) ) || ((players[i].pos == "JGL") && (jgl>1)) || ((players[i].pos == "SUP") && (sup>1) ) || ((players[i].pos == "ADC") && (adc>1) )  ) {
									//promises.push(player.release(tx, players[i], true));
									promises.push(player.release(players[i], true));
									playersDropped += 1;
							//		console.log(numPlayersOnRoster+" "+playersDropped);
								}
							   if  ( (numPlayersOnRoster - playersDropped) < 11)  {
								   i = numPlayersOnRoster;
							   }

							}
						} else if (numFromRegion < 4)  {
							for (i = 0; i < (numPlayersOnRoster); i++) {
//								if ( (players[i].born.loc != g.teamCountryCache[tid]) && (numFromRegion < g.importRestriction+1) && ((players[i].pos == "TOP") && (top>1) ) ||  ((players[i].pos == "MID") && (mid>1) ) || ((players[i].pos == "JGL") && (jgl>1)) || ((players[i].pos == "SUP") && (sup>1) ) || ((players[i].pos == "ADC") && (adc>1) )  ) {
								if ( (players[i].born.loc != g.teamCountryCache[tid]) && (numFromRegion < g.importRestriction+1)  ) {
									//promises.push(player.release(tx, players[i], true));
									promises.push(player.release(players[i], true));
									playersDropped += 1;
									console.log(numPlayersOnRoster+" "+playersDropped);
								}
							   if  ( (numPlayersOnRoster - playersDropped) < 11)  {
								   i = numPlayersOnRoster;
							   }

							}
						} else {

							for (i = 0; i < (numPlayersOnRoster); i++) {
							//	console.log(numFromRegion+" "+players[i].born.loc+" "+g.teamCountryCache[tid]);
							   if ( ((players[i].pos == "TOP") && (top>1) ) ||  ((players[i].pos == "MID") && (mid>1) ) || ((players[i].pos == "JGL") && (jgl>1)) || ((players[i].pos == "SUP") && (sup>1) ) || ((players[i].pos == "ADC") && (adc>1) ) ){
									if (players[i].pos == "TOP") {
									  top -= 1;
								   } else  if (players[i].pos == "MID") {
									  mid -= 1;
									} else  if (players[i].pos == "JGL") {
									  jgl -= 1;
								   } else  if (players[i].pos == "SUP") {
									  sup -= 1;
								   } else  if (players[i].pos == "ADC") {
									  adc -= 1;
								   }

									//promises.push(player.release(tx, players[i], true));
									promises.push(player.release(players[i], true));
									console.log(numPlayersOnRoster+" "+playersDropped);
									playersDropped += 1;

							   }
							//   }
							   if  ( (numPlayersOnRoster - playersDropped) < 11)  {
								   i = numPlayersOnRoster;
							   }
							}
						}
                    }


				}


				await Promise.all(promises);

				if (!g.userTids.includes(tid) || local.autoPlaySeasons > 0) {


				//	console.log("top: "+minFreeAgentsTop.length+" "+minFreeAgentsTop2.length);
			//		console.log("mid: "+minFreeAgentsMid.length+" "+minFreeAgentsMid2.length);
		//			console.log("jgl: "+minFreeAgentsJgl.length+" "+minFreeAgentsJgl2.length);
	//				console.log("adc: "+minFreeAgentsADC.length+" "+minFreeAgentsADC2.length);
//					console.log("sup: "+minFreeAgentsSup.length+" "+minFreeAgentsSup2.length);
          if (minFreeAgentsTop.length>0 && minFreeAgentsMid.length>0 && minFreeAgentsJgl.length > 0 && minFreeAgentsADC.length > 0 && minFreeAgentsSup.length > 0 ) {
						if (playersAdded > 0 || numPlayersOnRoster < 5  || numNotRegion > 5-g.importRestriction)   {
						//	console.log(tid+" numNotRegion: "+numNotRegion+" playerDropeed: "+playersDropped+" playersAdded: "+playersAdded+" numPlayersOnRoster: "+numPlayersOnRoster+" g.minRosterSize: "+g.minRosterSize );

							rosterAutoSort(tid);
							await checkRosterSize(tid);

						}
					}


					return rosterAutoSort(tid);
				}
     };

		const players = await idb.cache.players.indexGetAll('playersByTid', PLAYER.FREE_AGENT);
      var i;

            // List of free agents looking for minimum contracts, sorted by value. This is used to bump teams up to the minimum roster size.
            minFreeAgents = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= g.minContract*6+10000) {
                    minFreeAgents.push(players[i]);
                }
            }
			minFreeAgents.sort((a, b) => b.value - a.value);

            minFreeAgentsTop = [];
            minFreeAgentsTop2 = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= g.minContract*6+10000) {
					if (players[i].pos == "TOP") {
						minFreeAgentsTop.push(players[i]);
					}
                } else if (players[i].contract.amount <= g.minContract*9+10000) {
					if (players[i].pos == "TOP") {
						minFreeAgentsTop2.push(players[i]);
					}
				}
            }
            //minFreeAgentsTop.sort(function (a, b) { return b.value - a.value; });
			minFreeAgentsTop.sort((a, b) => b.value - a.value);
			minFreeAgentsTop2.sort((a, b) => b.value - a.value);

            minFreeAgentsMid = [];
            minFreeAgentsMid2 = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= g.minContract*6+10000) {
					 if (players[i].pos == "MID") {
						minFreeAgentsMid.push(players[i]);
					}
                } else if (players[i].contract.amount <= g.minContract*9+10000) {
					if (players[i].pos == "MID") {
						minFreeAgentsMid2.push(players[i]);
					}
				}
            }
            //minFreeAgentsMid.sort(function (a, b) { return b.value - a.value; });
			minFreeAgentsMid.sort((a, b) => b.value - a.value);
			minFreeAgentsMid2.sort((a, b) => b.value - a.value);

            minFreeAgentsJgl = [];
            minFreeAgentsJgl2 = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= g.minContract*6+10000) {
					 if (players[i].pos == "JGL") {
						minFreeAgentsJgl.push(players[i]);
					}
                } else if (players[i].contract.amount <= g.minContract*9+10000) {
					if (players[i].pos == "JGL") {
						minFreeAgentsJgl2.push(players[i]);
					}
				}
            }
            //minFreeAgentsJgl.sort(function (a, b) { return b.value - a.value; });
			minFreeAgentsJgl.sort((a, b) => b.value - a.value);
			minFreeAgentsJgl2.sort((a, b) => b.value - a.value);

            minFreeAgentsADC = [];
            minFreeAgentsADC2 = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= g.minContract*6+10000) {
					 if (players[i].pos == "ADC") {
						minFreeAgentsADC.push(players[i]);
					}
                } else if (players[i].contract.amount <= g.minContract*9+10000) {
					if (players[i].pos == "ADC") {
						minFreeAgentsADC2.push(players[i]);
					}
				}
            }
            //minFreeAgentsADC.sort(function (a, b) { return b.value - a.value; });
			minFreeAgentsADC.sort((a, b) => b.value - a.value);
			minFreeAgentsADC2.sort((a, b) => b.value - a.value);

            minFreeAgentsSup = [];
            minFreeAgentsSup2 = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= g.minContract*6+10000) {
					 if (players[i].pos == "SUP") {
						minFreeAgentsSup.push(players[i]);
					}
                } else if (players[i].contract.amount <= g.minContract*9+10000) {
					if (players[i].pos == "SUP") {
						minFreeAgentsSup2.push(players[i]);
					}
				}
            }
            //minFreeAgentsSup.sort(function (a, b) { return b.value - a.value; });
			minFreeAgentsSup.sort((a, b) => b.value - a.value);
			minFreeAgentsSup2.sort((a, b) => b.value - a.value);

				//console.log("got here");
			// Make sure teams are all within the roster limits
			for (let i = 0; i < g.numTeams; i++) {
				await checkRosterSize(i);

				if (userTeamSizeError) {
								console.log("got here");
					break;
				}
			}

			await updateCountry();

      return userTeamSizeError;

    }

    function getCountryImage2(country) {
		var imgURLCountry;
		//console.log(country);
		imgURLCountry = "";

	//	console.log(country);

		if (country=="") {

		} else if (country=="EU") {
			imgURLCountry = "/img/flags/flags/48/European Union.png";
		} else if (country == 'NA') {
			imgURLCountry = "/img/flags/flags/48/UnitedStates.png";
		} else if (country == 'EU') {
			imgURLCountry = "/img/flags/flags/48/European_Union.png";
		} else if (country == 'KR') {
			imgURLCountry = "/img/flags/flags/48/Korea.png";
		} else if (country == 'CN') {
			imgURLCountry = "/img/flags/flags/48/China.png";
		} else if (country == 'TW') {
			imgURLCountry = "/img/flags/flags/48/Taiwan.png";
		} else if (country == 'CIS') {
//			imgURLCountry = "/img/flags/flags/48/Russia.png";
			imgURLCountry = "/img/flags/flags/48/CIS.png";
		} else if (country == 'BR') {
			imgURLCountry = "/img/flags/flags/48/Brazil.png";
		} else if (country == 'JP') {
			imgURLCountry = "/img/flags/flags/48/Japan.png";
		} else if (country == 'OCE') {
			imgURLCountry = "/img/flags/flags/48/Australia.png";
		} else if (country == 'LatAm') {
			imgURLCountry = "http://www.flagandbanner.com/images/K20LAT35.jpg";
		} else if (country == 'SEA') {
			imgURLCountry = "/img/flags/flags/48/Vietnam.png";
		} else if (country == 'TR') {
			imgURLCountry = "/img/flags/flags/48/Turkey.png";
		} else {
			// hwo to check whether a real country?
			imgURLCountry = "/img/flags/flags/48/"+country+".png";
		}

        return imgURLCountry;
    }
    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function getRegionImage(region) {
		var imgURLCountry;
		//console.log(country);
		imgURLCountry = "";
				console.log(region);
		if (region == 'NA') {
			imgURLCountry = "/img/flags/flags/48/United_States.png";
		} else if (regoin == 'EU') {
			imgURLCountry = "/img/flags/flags/48/European_Union.png";
		} else if (regoin == 'KR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png";
		} else if (regoin == 'CN') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-China.png";
		} else if (regoin == 'TW') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png";
		} else if (regoin == 'CIS') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Russia.png";
		} else if (regoin == 'BR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Brazil.png";
		} else if (regoin == 'JP') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Japan.png";
		} else if (regoin == 'OCE') {
			imgURLCountry = "http://www.anbg.gov.au/images/flags/nation/australia.gif";
		} else if (regoin == 'LatAm') {
			imgURLCountry = "http://www.flagandbanner.com/images/K20LAT35.jpg";
		} else if (regoin == 'SEA') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Vietnam.png";
		} else if (regoin == 'TR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Turkey.png";
		} else {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		}

        return imgURLCountry;
    }

    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function getRegionImage2(region) {
		var imgURLCountry;
		//console.log(country);
		imgURLCountry = "";
		console.log(getRegionImage2);
		if (region == 'NA') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		} else if (regoin == 'EU') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Canada.png";
		} else if (regoin == 'KR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png";
		} else if (regoin == 'CN') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-China.png";
		} else if (regoin == 'TW') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png";
		} else if (regoin == 'CIS') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Russia.png";
		} else if (regoin == 'BR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Brazil.png";
		} else if (regoin == 'JP') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Japan.png";
		} else if (regoin == 'OCE') {
			imgURLCountry = "http://www.anbg.gov.au/images/flags/nation/australia.gif";
		} else if (regoin == 'LatAm') {
			imgURLCountry = "http://www.flagandbanner.com/images/K20LAT35.jpg";
		} else if (regoin == 'SEA') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Vietnam.png";
		} else if (regoin == 'TR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Turkey.png";
		} else {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		}

        return imgURLCountry;
    }

    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function getNumGames(cid) {

		var numGames;
		if (cid == undefined) {
			numGames = 22;
		} else if (g.numGames == 0) {

			numGames = 18;
		//	console.log(t.cid)
			//console.log(t.cidStart)

			if ((g.gameType == 0) || (g.gameType == 2)){
			   numGames = 18;
			} else if (g.gameType == 1){
				if (cid == 0) {
					numGames = 18;
				} else if (cid == 1) {
					numGames = 20;
				} else {
					numGames = 26;
				}
			} else if (g.gameType == 3) {
			   numGames = 22;
			} else if (g.gameType == 4) {
			   numGames = 14;
			} else if (g.gameType == 5) {
				if (cid == 0) {
					numGames = 18;
				} else if (cid == 1) {
					numGames = 18;
				} else if (cid == 2) {
					numGames = 18;
				} else if (cid == 3) {
					numGames = 22;
				} else if (cid == 4) {
					numGames = 14;
				} else if (cid == 5) {
					numGames = 12;
				} else {
					numGames = 22;
				}
			} else {
				/*if (cid == 0) {
					numGames = 18;
				} else if (cid == 1) {
					numGames = 18;
				} else if (cid == 2) {
					numGames = 18;
				} else if (cid == 3) {
					numGames = 22;
				} else if (cid == 4) {
					numGames = 14;
				} else if (cid == 5) {
					numGames = 12;
				} else {
					numGames = 22;
				}*/
			}

		} else {
			numGames = g.numGames;
		}

        return numGames;
    }


export default {
    genSeasonRow,
    genStatsRow,
    generate,
    findStarters,
    rosterAutoSort,
    valueChange,
    updateStrategies,
    checkRosterSizes,
    getPayroll,
    getPayrolls,
	getRegions,
	getCountries,
	getPositions,
	getNumGames,
};
