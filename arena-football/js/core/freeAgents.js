/**
 * @name core.freeAgents
 * @namespace Functions related to free agents that didn't make sense to put anywhere else.
 */
define(["db", "globals", "ui", "core/player", "core/team", "lib/underscore", "util/helpers", "util/lock", "util/random"], function (db, g, ui, player, team, _, helpers, lock, random) {
    "use strict";

    /**
     * AI teams sign free agents.
     * 
     * Each team (in random order) will sign free agents up to their salary cap or roster size limit. This should eventually be made smarter
     *
     * @memberOf core.freeAgents
     * @param {function()} cb Callback.
     */
    function autoSign(cb) {
        team.filter({
            attrs: ["strategy"],
            season: g.season
        }, function (teams) {
            var strategies, transaction;

            strategies = _.pluck(teams, "strategy");

            transaction = g.dbl.transaction(["players", "releasedPlayers"], "readwrite");

            transaction.objectStore("players").index("tid").getAll(g.PLAYER.FREE_AGENT).onsuccess = function (event) {
                var i, players, signTeam, tids;

                // List of free agents, sorted by value
                players = event.target.result;
                players.sort(function (a, b) { return player.value(b) - player.value(a); });

                if (players.length === 0) {
                    cb();
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

                    // Run callback when all teams have had a turn to sign players. This extra iteration of signTeam is required in case the user's team is the last one.
                    if (ti === tids.length) {
                        cb();
                        return;
                    }

                    // Skip the user's team
                    if (tid === g.userTid) {
                        signTeam(ti + 1);
                        return;
                    }

                    // Small chance of actually trying to sign someone in free agency, gets greater as time goes on
				//	console.log("1 g.daysLeft: "+g.daysLeft)
					
				//	if (payroll<g.minPayroll) {
				//	} else {
						if (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.99 * g.daysLeft / 30) {
					//		if (g.daysLeft > 0) {
								signTeam(ti + 1);
							
								return;
					//		}
						}

				//	}
				//	console.log("2 g.daysLeft: "+g.daysLeft)
                    // Skip rebuilding teams sometimes
                    if (strategies[tid] === "rebuilding" && Math.random() < 0.7 && g.daysLeft > 0) {
                        signTeam(ti + 1);
                        return;
                    }

                    // Randomly don't try to sign some players this day
                    while (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.7) {
                        players.shift();
                    }
				//	console.log("3 g.daysLeft: "+g.daysLeft)

                    transaction.objectStore("players").index("tid").count(tid).onsuccess = function (event) {
                        var numPlayersOnRoster;

				//	console.log("4 g.daysLeft: "+g.daysLeft)

                        numPlayersOnRoster = event.target.result;

                        db.getPayroll(transaction, tid, function (payroll) {
                            var i, foundPlayer, p;
							var payrollTooLow;
							var maxLength;
				/*	console.log("5 numPlayersOnRoster: "+numPlayersOnRoster);
					console.log("5 payroll: "+payroll);
					console.log("5 g.minPayroll: "+g.minPayroll);
					console.log("5 players.length: "+players.length);
					console.log("tid: "+tid);*/
					// running out of players?
//                            if (numPlayersOnRoster < 15) {
//                            if ((numPlayersOnRoster < 53) || (payroll <= g.minPayroll )  ) {
            //                if ((numPlayersOnRoster < 53) || (payroll <= 100000 )  ) {
//                            if ((numPlayersOnRoster < 53)  ) {

							//// limit so only happens when g.daysleft = 0
							
                            if ((numPlayersOnRoster < 20)  ) {
//                            if ((numPlayersOnRoster < 53) || ((numPlayersOnRoster < 53) && (payroll <= g.salaryCap) && (g.daysLeft==0) ) ) {
							
				/*			    if ((players.length>20) && (g.daysLeft==0) ) {
								   maxLength = 20;
								} else {
								   maxLength = players.length;
								}*/
                                for (i = 0; i < players.length; i++) {
//                                for (i = 0; i < maxLength; i++) {
                                    // Don't sign minimum contract players to fill out the roster
						//			console.log(i);
                                    if (players[i].contract.amount + payroll <= g.salaryCap || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 45) ) {
//                                    if ( (players[i].contract.amount + payroll <= g.salaryCap || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 45)) && (numPlayersOnRoster < 53)  ) {
//                                    if (players[i].contract.amount + payroll <= g.minPayroll || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 45)) {
//                                    if (players[i].contract.amount + payroll <= 104000 || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 45)) {
                                        p = players[i];
                                        p.tid = tid;
                                        if (g.phase <= g.PHASE.PLAYOFFS) { // Otherwise, not needed until next season
                                            p = player.addStatsRow(p);
                                        }
                                        p = player.setContract(p, p.contract, true);
                                        p.gamesUntilTradable = 4;
                                        transaction.objectStore("players").put(p);
                                        team.rosterAutoSort(transaction, tid, function () {
                                            if (ti <= tids.length) {
                                                signTeam(ti + 1);
                                            }
                                        });
                                        numPlayersOnRoster += 1;
                                        payroll += p.contract.amount;
                                        foundPlayer = true;
                                        players.splice(i, 1); // Remove from list of free agents


										/*team.checkRosterSizes(function () {
                                            if (ti <= tids.length) {
                                                signTeam(ti + 1);
                                            }
                                        });*/
										
							//			console.log("g.minPayroll: "+ g.minPayroll+ " payroll: "+ payroll);
//										if ( (g.daysLeft>0) || (payroll >= g.minPayroll) ) {
									//	if ( (payroll >= g.minPayroll) ) {
										if ( (payroll >= 0) ) {
											break;  // Only add one free agent
										} 
										

										
		/*								if (numPlayersOnRoster > 53) {
												// Automatically drop lowest value players until we reach 15
												players.sort(function (a, b) { return player.value(a) - player.value(b); }); // Lowest first
												for (i = 0; i < (numPlayersOnRoster - 53); i++) {
						//                        for (i = 0; i < (numPlayersOnRoster - 15); i++) {
													player.release(tx, players[i], false);
												}
										}*/
										
                                    }
                                }
                            }

                            if (!foundPlayer) {
                                if (ti <= tids.length) {
                                    signTeam(ti + 1);
                                }
                            }
							
							
                        });
                    };
                };

                signTeam(0);
            };
        });
    }

    /**
     * Decrease contract demands for all free agents.
     *
     * This is called after each day in the regular season, as free agents become more willing to take smaller contracts.
     * 
     * @memberOf core.freeAgents
     * @param {function()} cb Callback.
     */
    function decreaseDemands(cb) {
        var tx;

        tx = g.dbl.transaction("players", "readwrite");
        tx.objectStore("players").index("tid").openCursor(g.PLAYER.FREE_AGENT).onsuccess = function (event) {
            var cursor, i, p;

            cursor = event.target.result;
            if (cursor) {
                p = cursor.value;

                // Decrease free agent demands
                p.contract.amount -= 500;
                if (p.contract.amount < 31000) {
                    p.contract.amount = 31000;
                }

                if (g.phase !== g.PHASE.FREE_AGENCY) {
                    // Since this is after the season has already started, ask for a short contract
                    if (p.contract.amount < 10000) {
                        p.contract.exp = g.season;
                    } else {
                        p.contract.exp = g.season + 1;
                    }
                }

                // Free agents' resistance to signing decays after every regular season game
                for (i = 0; i < p.freeAgentMood.length; i++) {
                    p.freeAgentMood[i] -= 0.075;
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

                cursor.update(p);
                cursor.continue();
            }
        };
        tx.oncomplete = cb;
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

        if (amount >= g.minContract) {
            if (amount > g.maxContract) {
                amount = g.maxContract;
            }
            return helpers.round(amount / 10) * 10;  // Round to nearest 10k, assuming units are thousands
        }

        if (amount > g.maxContract / 1000) {
            amount = g.maxContract / 1000;
        }
        return helpers.round(amount * 100) / 100;  // Round to nearest 10k, assuming units are millions
    }

    /**
     * Will a player negotiate with a team, or not?
     * 
     * @param {number} amount Player's desired contract amount, already adjusted for mood as in amountWithMood, in thousands of dollars
     * @param {number} mood Player's mood towards the team in question.
     * @return {boolean} Answer to the question.
     */
    function refuseToNegotiate(amount, mood) {
        if (amount * mood > 100000) {
            return true;
        }

        return false;
    }

    /**
     * Simulates one or more days of free agency.
     * 
     * @memberOf core.freeAgents
     * @param {number} numDays An integer representing the number of days to be simulated. If numDays is larger than the number of days remaining, then all of free agency will be simulated up until the preseason starts.
     * @param {boolean} start Is this a new request from the user to simulate days (true) or a recursive callback to simulate another day (false)? If true, then there is a check to make sure simulating games is allowed.
     */
    function play(numDays, start) {
        var cbNoDays, cbRunDay, season;

        start = start !== undefined ? start : false;
        season = require("core/season");

        // This is called when there are no more days to play, either due to the user's request (e.g. 1 week) elapsing or at the end of free agency.
        cbNoDays = function () {
            db.setGameAttributes({gamesInProgress: false}, function () {
                ui.updatePlayMenu(null, function () {
                    // Check to see if free agency is over
                    if (g.daysLeft === 0) {
                        season.newPhase(g.PHASE.PRESEASON, function () {
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
                decreaseDemands(function () {
                    autoSign(function () {
                        db.setGameAttributes({daysLeft: g.daysLeft - 1, lastDbChange: Date.now()}, function () {
                            if (g.daysLeft > 0 && numDays > 0) {
                                ui.realtimeUpdate(["playerMovement"], undefined, function () {
                                    ui.updateStatus(g.daysLeft + " days left");
                                    play(numDays - 1);
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
                        db.setGameAttributes({stopGames: false}, cbYetAnother);
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
            lock.canStartGames(null, function (canStartGames) {
                if (canStartGames) {
                    db.setGameAttributes({gamesInProgress: true}, function () {
                        ui.updatePlayMenu(null, function () {
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