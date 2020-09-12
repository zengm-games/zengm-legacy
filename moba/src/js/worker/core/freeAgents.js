// @flow

import orderBy from 'lodash.orderby';
import _ from 'underscore';
import {PHASE, PLAYER, g, helpers} from '../../common';
import {league, phase, player, team} from '../core';
import {idb} from '../db';
import {local, lock, logEvent, random, updatePlayMenu, updateStatus, toUI} from '../util';
import type {Conditions} from '../../common/types';

/**
 * AI teams sign free agents.
 *
 * Each team (in random order) will sign free agents up to their salary cap or roster size limit. This should eventually be made smarter
 *
 * @memberOf core.freeAgents
 * @return {Promise}
 */
async function autoSign() {
    const [teams, players] = await Promise.all([
        idb.getCopies.teamsPlus({
            attrs: ["strategy"],
			seasonAttrs: ["hype"],
            season: g.season,
        }),
        idb.cache.players.indexGetAll('playersByTid', PLAYER.FREE_AGENT),
    ]);

    if (players.length === 0) {
        return;
    }

    const strategies = teams.map(t => t.strategy);
	//console.log(teams);
//console.log(teams[0]);
	//console.log(teams[0].seasonAttrs);
//	console.log(teams[0].seasonAttrs.hype);
	const hype = teams.map(t => t.seasonAttrs.hype);
	//console.log(hype);

    // List of free agents, sorted by value
    const playersSorted = orderBy(players, 'value', 'desc');

    // Randomly order teams
    const tids = _.range(g.numTeams);
    random.shuffle(tids);

    for (const tid of tids) {
        // Skip the user's team
        if (g.userTids.includes(tid) && local.autoPlaySeasons === 0) {
            continue;
        }

        // Small chance of actually trying to sign someone in free agency, gets greater as time goes on
        if (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.99 * g.daysLeft / 30) {
            continue;
        }

        // Skip rebuilding teams sometimes
      //  if (strategies[tid] === "rebuilding" && Math.random() < 0.7) {
        //    continue;
       // }

		//const playersTeam =  await idb.cache.players.indexGetAll('playersByTid', tid);
        const playersOnRoster = await idb.cache.players.indexGetAll('playersByTid', tid);
        const payroll = (await team.getPayroll(tid))[0];
        const regions = (await team.getRegions(tid))[0];
        const countries = (await team.getCountries(tid))[0];
        const positions = (await team.getPositions(tid))[0];
        const numPlayersOnRoster = playersOnRoster.length;

		var playerSigned,hypeSalaryCap;
		var numFromRegion, teamRegion,numFromCountry;
		var missingPositions;
		var contractAmount;
		var payUp;
		var maxCountry, onlyCountry, onlyThisCountry;
		var i;

		//console.log(countries);

		missingPositions = ["JGL","SUP","ADC","TOP","MID"];
		numFromRegion = 0;
		if (typeof(g.regionalRestrictions) == 'undefined') {
			numFromRegion = 10;
		} else if (!g.regionalRestrictions) {
			numFromRegion = 10;
		} else if (typeof(g.teamCountryCache) == 'undefined') {
			numFromRegion = 10;
			teamRegion = "notNeeded";
		} else {
			for (i = 0; i < (regions.length); i++) {
				if (regions[i] == g.teamCountryCache[tid]) {
					numFromRegion += 1;
					if (missingPositions.indexOf(playersOnRoster[i].pos) >= 0) {
						missingPositions[missingPositions.indexOf(playersOnRoster[i].pos)] = "";
					}
				}
			}
			teamRegion = g.teamCountryCache[tid];
		}

		//numFromCountry = 0;

		//for (i = 0; i < (countries.length); i++) {
			//if (countries[i] == playersSorted[i].born.country) {
				//numFromCountry += 1;
			//}
		//}


		onlyCountry = false;
		onlyThisCountry = "";

		if (g.teamCountryCache[tid] == "EU") {

			maxCountry = _.countBy(countries);

			for (i = 0; i < (maxCountry.length); i++) {
				if ( (maxCountry[playersSorted[i].born.country] >= 1 && playersSorted[i].born.country != "Korea") ) {
					onlyCountry = true;
					onlyThisCountry = playersSorted[i].born.country;
					i = maxCountry.length;
				}
			}
		}


//					playerSigned = 	Math.round(players.length*(.1));
		playerSigned = 	Math.round(playersSorted.length*(.05));
		if (g.daysLeft == 0) {
			playerSigned = 	playersSorted.length;
		}

//		console.log(payroll);
//		console.log(hype);
		if (g.userTids.includes(tid) && local.autoPlaySeasons === 0) {
			hypeSalaryCap = 100000000;
		} else {
//						hypeSalaryCap = hype[tid]*hype[tid]*hype[tid]*1500+200;
			hypeSalaryCap = hype[tid]*hype[tid]*hype[tid]*1500+200;
			// 1.0 1.2m
			// 0.9 .9m
			// 0.8 .7m
			// 0.5
		}

			  //"country": "NA",
//"countrySpecific": "United States",

    let maxPlayers1 = 8;
    let maxPlayers2 = 11;
		if (g.maxRosterSize == undefined) {

    } else {
      maxPlayers1 = g.maxRosterSize-2;
      maxPlayers2 = g.maxRosterSize+1;
    }

        //if (numPlayersOnRoster < 10) {
		if (numPlayersOnRoster < maxPlayers1 || ((numFromRegion < 3) && (numPlayersOnRoster < maxPlayers2) )) {
//            for (let i = 0; i < playersSorted.length; i++) {
            for (let i = 0; i < playerSigned; i++) {


                const p = playersSorted[i];
			//	console.log(p.contract.amount);
				if (p.born.loc == teamRegion) {
					contractAmount = p.contract.amount;
				} else {
					contractAmount = p.contract.amount*2+25;
				}
				if (missingPositions.indexOf(p.pos) == -1) {
					payUp = 50;
				} else {
					payUp = 0;
				}
                // Don't sign minimum contract players to fill out the roster
                //if (p.contract.amount + payroll <= g.salaryCap || (p.contract.amount === g.minContract && numPlayersOnRoster < 13)) {
				if ( ( (contractAmount + payroll <= hypeSalaryCap + payUp) && (numPlayersOnRoster < g.minRosterSize+2)) || ((numPlayersOnRoster < g.minRosterSize) && (contractAmount< 40) && (g.daysLeft< 5)) || (numFromRegion < 3)  ) {

					// ensure teams always have enough from region first in free agency before they get other players
//					if (onlyCountry	== false || onlyThisCountry == playersSorted[i].born.country ||  (g.daysLeft< 5))	{
					if (onlyCountry	== false || onlyThisCountry == p.born.country ||  (g.daysLeft< 5))	{
//						if ((numFromRegion >= 3) || (playersSorted[i].born.loc == teamRegion)) {
						if ((numFromRegion >= 3) || (p.born.loc == teamRegion) || ((g.daysLeft< 5)  && (numPlayersOnRoster < g.minRosterSize)) )	{
//							if ((numFromRegion > 2) || (missingPositions.indexOf(playersSorted[i].pos) > -1)) {
							if ((numFromRegion > 2) || (missingPositions.indexOf(p.pos) > -1) || ((g.daysLeft< 5)  && (numPlayersOnRoster < g.minRosterSize)) )	{

								p.tid = tid;
								if (g.phase <= g.PHASE.PLAYOFFS) { // Otherwise, not needed until next season
									await player.addStatsRow(p, (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI));
								}
								player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 5;
								idb.cache.markDirtyIndexes('players');
								// No conditions needed here because showNotification is false
								logEvent({
									type: "freeAgent",
									text: `<a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> signed <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> (${p.pos}) for ${helpers.formatCurrency(contractAmount/1000 , "K")}/year through ${p.contract.exp}.`,
									showNotification: false,
									//showNotification: p.watch && typeof p.watch !== "function",
									pids: [p.pid],
									tids: [p.tid],
								});

								if (missingPositions.indexOf(players[i].pos) >= 0) {
									missingPositions[missingPositions.indexOf(players[i].pos)] = "";
								}
								playersSorted.splice(i, 1); // Remove from list of free agents

								await idb.cache.players.put(p);
								await team.rosterAutoSort(tid);

								// We found one, so stop looking for this team
								break;
							}
						}
					}
                }
            }
        }
    }
}

/**
 * Decrease contract demands for all free agents.
 *
 * This is called after each day in the regular season, as free agents become more willing to take smaller contracts.
 *
 * @memberOf core.freeAgents
 * @return {Promise}
 */
async function decreaseDemands() {
    const players = await idb.cache.players.indexGetAll('playersByTid', PLAYER.FREE_AGENT);
    for (const p of players) {
        // Decrease free agent demands
		if (Math.random() <.33) {
			p.contract.amount -= 1;
		}
		if (p.contract.amount < 15) {
			p.contract.amount = 15;
		}

	p.contract.amount *= .995;

       /* p.contract.amount -= 50 * Math.sqrt(g.maxContract / 20000);
        if (p.contract.amount < g.minContract) {
            p.contract.amount = g.minContract;
        }*/

        if (g.phase !== g.PHASE.FREE_AGENCY) {
            // Since this is after the season has already started, ask for a short contract
			//console.log(p.contract.amount);
            if (p.contract.amount < 25000) {
                p.contract.exp = g.season;
            } else {
                p.contract.exp = g.season + 1;
            }
        }

        // Free agents' resistance to signing decays after every regular season game
        for (let i = 0; i < p.freeAgentMood.length; i++) {
            p.freeAgentMood[i] -= 0.015;
            if (p.freeAgentMood[i] < 0) {
                p.freeAgentMood[i] = 0;
            }
        }

        // Also, heal.
        if (p.injury.gamesRemaining > 0) {
            p.injury.gamesRemaining -= 1;
        } else {
            p.injury = {type: "Healthy", gamesRemaining: 0};
        }

        await idb.cache.players.put(p);
    }
}

/**
 * Get contract amount adjusted for mood.
 *
 * @memberOf core.freeAgents
 * @param {number} amount Contract amount, in thousands of dollars or millions of dollars (fun auto-detect!).
 * @param {number} mood Player mood towards a team, from 0 (happy) to 1 (angry).
 * @return {number} Contract amoung adjusted for mood.
 */
function amountWithMood(amount: number, mood: number = 0.5): number {

    amount *= 1 + 0.2 * mood;

  //  if (amount >= g.minContract) {
        if (amount > g.maxContract) {
            amount = g.maxContract;
        }
    //    return Math.round(amount / 10) * 10;  // Round to nearest 10k, assuming units are thousands
    //}

    //if (amount > g.maxContract / 1000) {
      //  amount = g.maxContract / 1000;
    //}
	//console.log(amount);
    return Math.round(amount * 50) / 50;  // Round to nearest 10k, assuming units are millions
}

/**
 * Simulates one or more days of free agency.
 *
 * @memberOf core.freeAgents
 * @param {number} numDays An integer representing the number of days to be simulated. If numDays is larger than the number of days remaining, then all of free agency will be simulated up until the preseason starts.
 * @param {boolean} start Is this a new request from the user to simulate days (true) or a recursive callback to simulate another day (false)? If true, then there is a check to make sure simulating games is allowed. Default true.
 */
async function play(numDays: number, conditions: Conditions, start?: boolean = true) {
    // This is called when there are no more days to play, either due to the user's request (e.g. 1 week) elapsing or at the end of free agency.
    const cbNoDays = async () => {
        lock.set('gameSim', false);
        await updatePlayMenu();

        // Check to see if free agency is over
        if (g.daysLeft === 0) {
            await updateStatus('Idle');
            await phase.newPhase(g.PHASE.PRESEASON, conditions);
        }
    };

    // This simulates a day, including game simulation and any other bookkeeping that needs to be done
    const cbRunDay = async () => {
        // This is called if there are remaining days to simulate
        const cbYetAnother = async () => {
            await decreaseDemands();
            await autoSign();
            await league.setGameAttributes({daysLeft: g.daysLeft - 1});
            if (g.daysLeft > 0 && numDays > 0) {
                await toUI(['realtimeUpdate', ['playerMovement']]);
                await updateStatus(`${g.daysLeft} days left`);
                play(numDays - 1, conditions, false);
            } else {
                await cbNoDays();
            }
        };

        // If we didn't just stop games, let's play
        // Or, if we are starting games (and already passed the lock), continue even if stopGameSim was just seen
        const stopGameSim = lock.get('stopGameSim');
        if (numDays > 0 && (start || !stopGameSim)) {
            if (stopGameSim) {
                lock.set('stopGameSim', false);
            }
            await cbYetAnother();
        } else {
            // If this is the last day, update play menu
            await cbNoDays();
        }
    };

    // If this is a request to start a new simulation... are we allowed to do
    // that? If so, set the lock and update the play menu
    if (start) {
        const canStartGames = await lock.canStartGames();
        if (canStartGames) {
            await updatePlayMenu();
            await cbRunDay();
        }
    } else {
        await cbRunDay();
    }
}

export default {
    autoSign,
    decreaseDemands,
    amountWithMood,
    play,
};
