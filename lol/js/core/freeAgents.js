/**
 * @name core.freeAgents
 * @namespace Functions related to free agents that didn't make sense to put anywhere else.
 */
define(["dao", "globals", "ui", "core/player", "core/team", "lib/bluebird", "lib/underscore", "util/eventLog", "util/helpers", "util/lock", "util/random"], function (dao, g, ui, player, team, Promise, _, eventLog, helpers, lock, random) {
	
    "use strict";

    /**
     * AI teams sign free agents.
     *
     * Each team (in random order) will sign free agents up to their salary cap or roster size limit. This should eventually be made smarter
     *
     * @memberOf core.freeAgents
     * @return {Promise}
     */
    function autoSign(tx) {
        tx = dao.tx(["players", "playerStats", "releasedPlayers", "teams"], "readwrite", tx);
		
        return Promise.all([
            team.filter({
                ot: tx,				
                attrs: ["strategy"],
				seasonAttrs: ["hype"],
                season: g.season
            }),
            dao.players.getAll({
                ot: tx,				
                index: "tid",
                key: g.PLAYER.FREE_AGENT
            })
        ]).spread(function (teams, players) {
            var i, signTeam, strategies, tids,hype;

            strategies = _.pluck(teams, "strategy");
            hype = _.pluck(teams, "hype");


            // List of free agents, sorted by value
            players.sort(function (a, b) { return b.value - a.value; });

            if (players.length === 0) {
                return;
            }

            // Randomly order teams
            tids = [];
            for (i = 0; i < g.numTeams; i++) {
                tids.push(i);
            }
            random.shuffle(tids);

            signTeam = function (ti) {
                var tid;

                tid = tids[ti];

                // Finish when all teams have had a turn to sign players. This extra iteration of signTeam is required in case the user's team is the last one.
                if (ti >= tids.length) {
                    return;
                }

                // Skip the user's team
                if (g.userTids.indexOf(tid) >= 0 && g.autoPlaySeasons === 0) {
                    return signTeam(ti + 1);
                }

                // Small chance of actually trying to sign someone in free agency, gets greater as time goes on
                if (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.99 * g.daysLeft / 30) {
                    return signTeam(ti + 1);
                }

                // Skip rebuilding teams sometimes
             /*   if (strategies[tid] === "rebuilding" && Math.random() < 0.7) {
                    return signTeam(ti + 1);
                }*/

                    // Randomly don't try to sign some players this day
/*                while (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.7) {
                    players.shift();
                }*/

                return Promise.all([
					dao.players.getAll({
						ot: tx,				
						index: "tid",
						key: tid
					}),
                    dao.players.count({
                        ot: tx,
                        index: "tid",
                        key: tid
                    }),					
                    team.getPayroll(tx, tid).get(0),
                    team.getRegions(tx, tid).get(0),
                    team.getCountries(tx, tid).get(0),										
//                    team.getCountries(tx, tid).get(0),										
                    team.getPositions(tx, tid).get(0)
                ]).spread(function (playersTeam,numPlayersOnRoster, payroll,regions,countries,positions) {
                    var i, p;
					var playerSigned,hypeSalaryCap;
					var numFromRegion, teamRegion,numFromCountry;
					var missingPositions;
					var contractAmount;
					var payUp;
					var maxCountry, onlyCountry, onlyThisCountry;

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
								if (missingPositions.indexOf(playersTeam[i].pos) >= 0) {
									missingPositions[missingPositions.indexOf(playersTeam[i].pos)] = "";
								}
							} 	
						}			
					//	console.log(numFromRegion);
					//	console.log(missingPositions);
						teamRegion = g.teamCountryCache[tid];						
						
					}					
					
					numFromCountry = 0;
					
					for (i = 0; i < (countries.length); i++) {
						if (countries[i] == players[i].born.country) {
							numFromCountry += 1;
						} 	
					}					
					
					
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
	//						console.log(maxCountry);					
		//					console.log(maxCountry["United States"]);
			//				console.log(maxCountry[players[0].born.country]);							
						}		
						//console.log(onlyCountry);
						//console.log(onlyThisCountry);						
					}					
					
					
//					playerSigned = 	Math.round(players.length*(.1));
					playerSigned = 	Math.round(players.length*(.05));
					if (g.daysLeft == 0) {
						playerSigned = 	players.length;						
					}					
					
			//		console.log(payroll);
			//		console.log(hype);					
					if (tid == g.userTid) {
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
					if (players[i].born.loc == teamRegion) {
						contractAmount = players[i].contract.amount;						
						//console.log(contractAmount);						
					} else {
						contractAmount = players[i].contract.amount*2+25;	
						//console.log(contractAmount);
					}
					if (missingPositions.indexOf(players[i].pos) == -1) {
						payUp = 50;
					} else {
						payUp = 0;
					}
					
                    if (numPlayersOnRoster < 8 || ((numFromRegion < 3) && (numPlayersOnRoster < 11) )) {
//                        for (i = 0; i < players.length; i++) {
                        for (i = 0; i < playerSigned; i++) {
                            // Don't sign minimum contract players to fill out the roster
//                            if (players[i].contract.amount + payroll <= g.salaryCap || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 13)) {
//                            if (players[i].contract.amount + payroll <= g.salaryCap || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 13)) {
						//	console.log(players[i].contract.amount);
//                            if (numPlayersOnRoster < 8) {
                            if ( ( (contractAmount + payroll <= hypeSalaryCap + payUp) && (numPlayersOnRoster < g.minRosterSize+2)) || ((numPlayersOnRoster < g.minRosterSize) && (contractAmount< 40) && (g.daysLeft< 5)) || (numFromRegion < 3)  ) {

								// ensure teams always have enough from region first in free agency before they get other players
								if (onlyCountry	== false || onlyThisCountry == players[i].born.country ||  (g.daysLeft< 5))	{
									if ((numFromRegion >= 3) || (players[i].born.loc == teamRegion)) {		
										if ((numFromRegion > 2) || (missingPositions.indexOf(players[i].pos) > -1)) {	
											//console.log(numFromRegion+" "+players[i].pos+" "+players[i].ovr);
											players[i].contract.amount = contractAmount;	
											p = players[i];
											p.tid = tid;
											if (g.phase <= g.PHASE.PLAYOFFS) { // Otherwise, not needed until next season
												p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
											}
											p = player.setContract(p, p.contract, true);
											p.gamesUntilTradable = 5;																		
											eventLog.add(null, {
												type: "freeAgent",
												text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamNamesCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount, "K") + '/year through ' + p.contract.exp + '.',
												//showNotification: false,
												showNotification: p.watch && typeof p.watch !== "function",																						
												pids: [p.pid],
												tids: [p.tid]
											});										
											if (players[i].born.loc == teamRegion) {
											//	numFromRegion += 1;											
											}
											if (missingPositions.indexOf(players[i].pos) >= 0) {
												missingPositions[missingPositions.indexOf(players[i].pos)] = "";
											}			
										//	console.log("after: "+missingPositions);										
											// If we found one, stop looking for this team
											return dao.players.put({ot: tx, value: p}).then(function () {
												return team.rosterAutoSort(tx, tid);
											}).then(function () {
												players.splice(i, 1); // Remove from list of free agents
			//                                    return signTeam(ti + 1);
												return signTeam(ti );
											});
										}								
									}				
								}								
                            }
                        }
                    }

                    // If this is reached, no player was found
                    return signTeam(ti + 1);
                });
            };

            return signTeam(0);
        });
    }

    /**
     * Decrease contract demands for all free agents.
     *
     * This is called after each day in the regular season, as free agents become more willing to take smaller contracts.
     *
     * @memberOf core.freeAgents
     * @return {Promise}
     */
    function decreaseDemands() {
        var tx;

        tx = dao.tx("players", "readwrite");

        dao.players.iterate({
            ot: tx,
            index: "tid",
            key: g.PLAYER.FREE_AGENT,
            callback: function (p) {
                var i;

                // Decrease free agent demands
			//	console.log(p.contract.amount);	
				if (Math.random() <.33) {
					p.contract.amount -= 1;
				}
                if (p.contract.amount < 15) {
                    p.contract.amount = 15;
                }
				
				p.contract.amount *= .995;
			//	console.log(typeof p.contract.amount);
			//	console.log(p.contract.amount);
                if (g.phase !== g.PHASE.FREE_AGENCY) {
                    // Since this is after the season has already started, ask for a short contract
                    if (p.contract.amount < 10) {
                        p.contract.exp = g.season;
                    } else {
                        p.contract.exp = g.season + 1;
                    }
                }

                // Free agents' resistance to signing decays after every regular season game
                for (i = 0; i < p.freeAgentMood.length; i++) {
//                    p.freeAgentMood[i] -= 0.075;
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

                return p;
            }
        });

        return tx.complete();
    }

    /**
     * Get contract amount adjusted for mood.
     *
     * @memberOf core.freeAgents
     * @param {number} amount Contract amount, in thousands of dollars or millions of dollars (fun auto-detect!).
     * @param {number} mood Player mood towards a team, from 0 (happy) to 1 (angry).
     * @return {number} Contract amoung adjusted for mood.
     */
    function amountWithMood(amount, mood) {
		
		
        amount *= 1 + 0.2 * mood;
//console.log(typeof amount);
    //    if (amount >= g.minContract) {
            if (amount > g.maxContract) {
                amount = g.maxContract;
            }
			
//            return helpers.round(amount / 1) * 1;  // Round to nearest 10k, assuming units are thousands
     //       return amount;  // Round to nearest 10k, assuming units are thousands
    //    }

    //    if (amount > g.maxContract / 1) {
      //      amount = g.maxContract / 1;
       // }
//        return helpers.round(amount * 1) / 1;  // Round to nearest 10k, assuming units are millions
		//console.log(amount+" "+g.maxContract);
        return Number(amount) ;  // Round to nearest 10k, assuming units are millions
    }

    /**
     * Will a player negotiate with a team, or not?
     *
     * @param {number} amount Player's desired contract amount, already adjusted for mood as in amountWithMood, in thousands of dollars
     * @param {number} mood Player's mood towards the team in question.
     * @return {boolean} Answer to the question.
     */
    function refuseToNegotiate(amount, mood) {
        if (amount * mood > 100) {
            return true;
        }

        return false;
    }

    /**
     * Simulates one or more days of free agency.
     *
     * @memberOf core.freeAgents
     * @param {number} numDays An integer representing the number of days to be simulated. If numDays is larger than the number of days remaining, then all of free agency will be simulated up until the preseason starts.
     * @param {boolean} start Is this a new request from the user to simulate days (true) or a recursive callback to simulate another day (false)? If true, then there is a check to make sure simulating games is allowed. Default true.
     */
    function play(numDays, start) {
        var cbNoDays, cbRunDay, phase;

        start = start !== undefined ? start : true;
        phase = require("core/phase");

        // This is called when there are no more days to play, either due to the user's request (e.g. 1 week) elapsing or at the end of free agency.
        cbNoDays = function () {
            require("core/league").setGameAttributesComplete({gamesInProgress: false}).then(function () {
                ui.updatePlayMenu(null).then(function () {
                    // Check to see if free agency is over
                    if (g.daysLeft === 0) {
                        phase.newPhase(g.PHASE.PRESEASON).then(function () {
                            ui.updateStatus("Idle");
                        });
                    }
                });
            });
        };

        // This simulates a day, including game simulation and any other bookkeeping that needs to be done
        cbRunDay = function () {
            var cbYetAnother;

            // This is called if there are remaining days to simulate
            cbYetAnother = function () {
                decreaseDemands().then(function () {
                    autoSign().then(function () {
                        require("core/league").setGameAttributesComplete({daysLeft: g.daysLeft - 1, lastDbChange: Date.now()}).then(function () {
                            if (g.daysLeft > 0 && numDays > 0) {
                                ui.realtimeUpdate(["playerMovement"], undefined, function () {
                                    ui.updateStatus(g.daysLeft + " days left");
                                    play(numDays - 1, false);
                                });
                            } else if (g.daysLeft === 0) {
                                cbNoDays();
                            }
                        });
                    });
                });
            };

            if (numDays > 0) {
                // If we didn't just stop games, let's play
                // Or, if we are starting games (and already passed the lock), continue even if stopGames was just seen
                if (start || !g.stopGames) {
                    if (g.stopGames) {
                        require("core/league").setGameAttributesComplete({stopGames: false}).then(cbYetAnother);
                    } else {
                        cbYetAnother();
                    }
                }
            } else if (numDays === 0) {
                // If this is the last day, update play menu
                cbNoDays();
            }
        };

        // If this is a request to start a new simulation... are we allowed to do
        // that? If so, set the lock and update the play menu
        if (start) {
            lock.canStartGames(null).then(function (canStartGames) {
                if (canStartGames) {
                    require("core/league").setGameAttributesComplete({gamesInProgress: true}).then(function () {
                        ui.updatePlayMenu(null).then(function () {
                            cbRunDay();
                        });
                    });
                }
            });
        } else {
            cbRunDay();
        }
    }

    return {
        autoSign: autoSign,
        decreaseDemands: decreaseDemands,
        amountWithMood: amountWithMood,
        refuseToNegotiate: refuseToNegotiate,
        play: play
    };
});