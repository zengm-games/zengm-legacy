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
                season: g.season
            }),
            dao.players.getAll({
                ot: tx,				
                index: "tid",
                key: g.PLAYER.FREE_AGENT
            })
        ]).spread(function (teams, players) {
                var i, strategies, signTeam, tids;

                strategies = _.pluck(teams, "strategy");


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
				//	console.log("1 g.daysLeft: "+g.daysLeft)
					
				//	if (payroll<g.minPayroll) {
				//	} else {
						if (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.99 * g.daysLeft / 30) {
					//		if (g.daysLeft > 0) {
								return signTeam(ti + 1);
							
					//		}
						}

				//	}
				//	console.log("2 g.daysLeft: "+g.daysLeft)
                    // Skip rebuilding teams sometimes
                    if (strategies[tid] === "rebuilding" && Math.random() < 0.7 && g.daysLeft > 0) {
                        return signTeam(ti + 1);
                    }

                    // Randomly don't try to sign some players this day
              /*      while (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.7) {
                        players.shift();
                    }*/
					
                return Promise.all([
                    dao.players.count({
                        ot: tx,
                        index: "tid",
                        key: tid
                    }),
                    team.getPayroll(tx, tid).get(0)
                ]).spread(function (numPlayersOnRoster, payroll) {
                    var i, p;
					
				//	console.log("3 g.daysLeft: "+g.daysLeft)

                //    tx.objectStore("players").index("tid").count(tid).onsuccess = function (event) {
                     //   var numPlayersOnRoster;

				//	console.log("4 g.daysLeft: "+g.daysLeft)

                     //   numPlayersOnRoster = event.target.result;
//
                      //  dao.payrolls.get({ot: tx, key: tid}).then(function (payroll) {
                         //   var  afterPickPlayer,i,  foundPlayer, p;
							//var payrollTooLow;
							//var maxLength;
				
                           /* afterPickPlayer = function (p) {
                                p = player.setContract(p, p.contract, true);
                                p.gamesUntilTradable = 4;
                                dao.players.put({ot: tx, value: p});
                                team.rosterAutoSort(tx, tid).then(function () {
                                    if (ti <= tids.length) {
                                        signTeam(ti + 1);
                                    }
                                });

                            };*/
							
                            if ((numPlayersOnRoster < 53)  ) {
                                for (i = 0; i < players.length; i++) {
//                                for (i = 0; i < maxLength; i++) {
                                    // Don't sign minimum contract players to fill out the roster
                                    if (players[i].contract.amount + payroll <= g.salaryCap || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 45) ) {
                                        p = players[i];
                                        p.tid = tid;
                                        if (g.phase <= g.PHASE.PLAYOFFS) { // Otherwise, not needed until next season
												p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
                                        }
                                  //          afterPickPlayer(p);
                                            numPlayersOnRoster += 1;
                                            payroll += p.contract.amount;
										 p = player.setContract(p, p.contract, true);
										p.gamesUntilTradable = 4;
										eventLog.add(null, {
											type: "freeAgent",
											text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamNamesCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount / 1000, "M") + '/year through ' + p.contract.exp + '.',
											showNotification: false,
											pids: [p.pid],
											tids: [p.tid]
										});
										// If we found one, stop looking for this team
										return dao.players.put({ot: tx, value: p}).then(function () {
											return team.rosterAutoSort(tx, tid);
										}).then(function () {
											players.splice(i, 1); // Remove from list of free agents
											return signTeam(ti + 1);
										});
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
                p.contract.amount -= 50;
                if (p.contract.amount < 400) {
                    p.contract.amount = 400;
                }

                if (g.phase !== g.PHASE.FREE_AGENCY) {
                    // Since this is after the season has already started, ask for a short contract
                    if (p.contract.amount < 1000) {
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
//        if (amount * mood > 10000) {
		//console.log(amount +" "+mood)
        if (amount * mood > 3000) {
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