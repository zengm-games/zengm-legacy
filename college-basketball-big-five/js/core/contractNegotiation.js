/**
 * @name core.contractNegotiation
 * @namespace All aspects of contract negotiation.
 */
define(["dao", "globals", "ui", "core/freeAgents", "core/player", "core/team", "lib/bluebird", "util/eventLog", "util/helpers", "util/lock", "util/random"], function (dao, g, ui, freeAgents, player, team, Promise, eventLog, helpers, lock, random) {
    "use strict";

    /**
     * Start a new contract negotiation with a player.
     *
     * If ot is null, then the callback will run only after the transaction finishes (i.e. only after the new negotiation is actually saved to the database). If ot is not null, then the callback might run earlier, so don't rely on the negotiation actually being in the database yet.
     *
     * So, ot should NOT be null if you're starting multiple negotiations as a component of some larger operation, but the presence of a particular negotiation in the database doesn't matter. ot should be null if you need to ensure that the roster order is updated before you do something that will read the roster order (like updating the UI). (WARNING: This means that there is actually a race condition for when this is called from season.newPhaseResignPlayers is the UI is updated before the user's teams negotiations are all saved to the database! In practice, this doesn't seem to be a problem now, but it could be eventually.)
     *
     * @memberOf core.contractNegotiation
     * @param {IDBTransaction|null} ot An IndexedDB transaction on gameAttributes, messages, negotiations, and players, readwrite; if null is passed, then a new transaction will be used.
     * @param {number} pid An integer that must correspond with the player ID of a free agent.
     * @param {boolean} resigning Set to true if this is a negotiation for a contract extension, which will allow multiple simultaneous negotiations. Set to false otherwise.
     * @return {Promise.<string=>)} If an error occurs, resolve to a string error message.
     */
    function create(ot, pid, resigning) {
        if ((g.phase >= g.PHASE.AFTER_TRADE_DEADLINE && g.phase <= g.PHASE.RESIGN_PLAYERS) && !resigning) {
            return Promise.resolve("You're not allowed to sign free agents now.");
        }

        // Can't flatten because of error callbacks
        return lock.canStartNegotiation(ot).then(function (canStartNegotiation) {
            if (!canStartNegotiation) {
                return "You cannot initiate a new signing while game simulation is in progress or a previous signing is in process.";
            }

			/*return team.filter({
				seasonAttrs: ["hype"],			
                season: g.season
            }),*/
			
		/*	return team.filter({
//						ot: tx,					
		//				ot: ot,					
						attrs: ["tid"],
						seasonAttrs: ["hype"],
						season: g.season
			}).then(function (teams) {	*/
				/*var hype;
				
				hype = _.pluck(t, "hype");
				console.log(hype[g.userTid);*/
		//		return dao.teams.get({ot: ot, key: g.userTid}).then(function (t) {
				/*var hype;
				
				hype = _.pluck(t, "hype");
				console.log(hype[g.userTid);*/
				
				
				return dao.players.count({
					ot: ot,
					index: "tid",
					key: g.userTid
				}).then(function (numPlayersOnRoster) {
					if (numPlayersOnRoster >= 13 && !resigning) {
						return "Your roster is full. Before you can sign a recruit, you'll have to release one of your current players.";
					}
			//	console.log(hype[g.userTid);


					return dao.teams.get({ot: ot, key: g.userTid}).then(function (t) {
					
					return dao.players.get({ot: ot, key: pid}).then(function (p) {
						var negotiation, playerAmount, playerYears;
						var s, hype;
						
					//	console.log("t.tid: "+t.tid);
				//		console.log("t.tid: "+t.tid);
						s = t.seasons.length - 1;
					//	console.log("t.seasons[s].hype: "+t.seasons[s].hype);
						hype = t.seasons[s].hype;
						if (p.tid !== g.PLAYER.FREE_AGENT) {
							return p.name + " is not available to recruit.";
						}
			//	console.log(hype[g.userTid);

						// Initial player proposal;
				//		hype[g.userTid
					//	console.log("p.miles[g.userTid]: "+p.miles[g.userTid]);
//						console.log("t[g.userTid].seasons[t.seasons.length - 1].hype: "+t[g.userTid].seasons[t.seasons.length - 1].hype);
		//				console.log("hype[g.userTid: "+hype[g.userTid);
//						playerAmount = freeAgents.amountWithMoodMiles(p.contract.amount, p.freeAgentMood[g.userTid],p.miles[g.userTid]) ;
						playerAmount = freeAgents.amountWithMoodMilesHype(p.contract.amount, p.freeAgentMood[g.userTid],p.miles[g.userTid],hype) ;
	//					playerAmount /= (hype+1)/3;
						if (g.daysLeft == 0 ) {
			//				playerAmount *= .2;
							playerAmount *= .6 ;
							playerAmount -= 20000 ;								
							if (playerAmount<0) {
								playerAmount = 0 ;
							}							
//							playerAmount = 0;
						}						
						playerYears = p.contract.exp - g.season;
						// Adjust to account for in-season signings;
						if (g.phase <= g.PHASE.AFTER_TRADE_DEADLINE) {
							playerYears += 1;
						}

						if (freeAgents.refuseToNegotiateMiles(playerAmount, p.freeAgentMood[g.userTid],p.miles[g.userTid])) {
	//                    if (freeAgents.refuseToNegotiate(playerAmount, p.freeAgentMood[g.userTid])) {
							return '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> refuses to sign with you, no matter how hard you recruit.';
						}

						negotiation = {
							pid: pid,
							team: {amount: playerAmount, years: playerYears},
							player: {amount: playerAmount, years: playerYears},
							orig: {amount: playerAmount, years: playerYears},
							resigning: resigning
						};

						return dao.negotiations.add({ot: ot, value: negotiation}).then(function () {
							require("core/league").setGameAttributes({lastDbChange: Date.now()});
							ui.updateStatus("Player recruiting");
							return ui.updatePlayMenu(ot);
						});
					});
					});
				});
		//	});
        });		
    }

    /**
     * Restrict the input to between g.minContract and g.maxContract, the valid amount of annual thousands of dollars for a contract.
     *
     * @memberOf core.contractNegotiation
     * @param {number} years Annual salary, in thousands of dollars, to be validated.
     * @return {number} An integer between g.minContract and g.maxContract, rounded to the nearest $10k.
     */
    function validAmount(amount) {
        if (amount < g.minContract) {
            amount = g.minContract;
        } else if (amount > g.maxContract) {
            amount = g.maxContract;
        }
        return helpers.round(amount ) * 1;
    }

    /**
     * Restrict the input to between 1 and 5, the valid number of years for a contract.
     *
     * @memberOf core.contractNegotiation
     * @param {number} years Number of years, to be validated.
     * @return {number} An integer between 1 and 5.
     */
    function validYears(years) {
        if (years < 5) {
            years = 5;
        } else if (years > 5) {
            years = 5;
        }
        return Math.round(years);
    }

    /**
     * Make an offer to a player.
     *
     * @memberOf core.contractNegotiation
     * @param {number} pid An integer that must correspond with the player ID of a player in an ongoing negotiation.
     * @param {number} teamAmount Teams's offer amount in thousands of dollars per year (between 500 and 20000).
     * @param {number} teamYears Team's offer length in years (between 1 and 5).
     * @return {Promise}
     */
    function offer(pid, teamAmount, teamYears) {
        var tx;

        teamAmount = validAmount(teamAmount);
        teamYears = validYears(teamYears);

        tx = dao.tx(["negotiations", "players"], "readwrite");

        dao.players.get({ot: tx, key: pid}).then(function (p) {
            var mood;

            mood = p.freeAgentMood[g.userTid];
            p.freeAgentMood[g.userTid] += random.uniform(0, 0.15);
            if (p.freeAgentMood[g.userTid] > 1) {
                p.freeAgentMood[g.userTid] = 1;
            }

            dao.players.put({ot: tx, value: p});

            dao.negotiations.get({ot: tx, key: pid}).then(function (negotiation) {
                var diffPlayerOrig, diffTeamOrig;

                // Player responds based on their mood
                if (negotiation.orig.amount >= 18000) {
                    // Expensive guys don't negotiate
                    negotiation.player.amount *= 1 + 0.05 * mood;
                } else {
                    if (teamYears === negotiation.player.years) {
                        // Team and player agree on years, so just update amount
                        if (teamAmount >= negotiation.player.amount) {
                            negotiation.player.amount = teamAmount;
                        } else if (teamAmount > 0.7 * negotiation.player.amount) {
                            negotiation.player.amount = (0.5 * (1 + mood)) * negotiation.orig.amount + (0.5 * (1 - mood)) * teamAmount;
                        } else {
                            negotiation.player.amount *= 1.05;
                        }
                    } else if ((teamYears > negotiation.player.years && negotiation.orig.years > negotiation.player.years) || (teamYears < negotiation.player.years && negotiation.orig.years < negotiation.player.years)) {
                        // Team moves years closer to original value

                        // Update years
                        diffPlayerOrig = negotiation.player.years - negotiation.orig.years;
                        diffTeamOrig = teamYears - negotiation.orig.years;
                        if (diffPlayerOrig > 0 && diffTeamOrig > 0) {
                            // Team moved towards player's original years without overshooting
                            negotiation.player.years = teamYears;
                        } else {
                            // Team overshot original years
                            negotiation.player.years = negotiation.orig.years;
                        }

                        // Update amount
                        if (teamAmount > negotiation.player.amount) {
                            negotiation.player.amount = teamAmount;
                        } else if (teamAmount > 0.85 * negotiation.player.amount) {
                            negotiation.player.amount = (0.5 * (1 + mood)) * negotiation.orig.amount + (0.5 * (1 - mood)) * teamAmount;
                        } else {
                            negotiation.player.amount *= 1.05;
                        }
                    } else {
                        // Team move years further from original value
                        if (teamAmount > 1.1 * negotiation.player.amount) {
                            negotiation.player.amount = teamAmount;
                            if (teamYears > negotiation.player.years) {
                                negotiation.player.years += 1;
                            } else {
                                negotiation.player.years -= 1;
                            }
                        } else if (teamAmount > 0.9 * negotiation.player.amount) {
                            negotiation.player.amount *= 1.15;
                            if (teamYears > negotiation.player.years) {
                                negotiation.player.years += 1;
                            } else {
                                negotiation.player.years -= 1;
                            }
                        } else {
                            negotiation.player.amount *= 1.15;
                        }
                    }

                    // General punishment from angry players
                    if (mood > 0.25) {
                        negotiation.player.amount *= 1 + 0.1 * mood;
                    }
                }

                negotiation.player.amount = validAmount(negotiation.player.amount);
                negotiation.player.years = validYears(negotiation.player.years);

                negotiation.team.amount = teamAmount;
                negotiation.team.years = teamYears;

                dao.negotiations.put({ot: tx, value: negotiation});
            });
        });

        return tx.complete().then(function () {
            return require("core/league").setGameAttributes({lastDbChange: Date.now()});
        });
    }

    /**
     * Cancel contract negotiations with a player.
     *
     * @memberOf core.contractNegotiation
     * @param {number} pid An integer that must correspond with the player ID of a player in an ongoing negotiation.
     * @return {Promise}
     */
    function cancel(pid) {
        // Delete negotiation
        return dao.negotiations.delete({key: pid}).then(function () {
            return require("core/league").setGameAttributes({lastDbChange: Date.now()});
        }).then(function () {
            // If no negotiations are in progress, update status
            return lock.negotiationInProgress(null);
        }).then(function (negotiationInProgress) {
            if (!negotiationInProgress) {
                if (g.phase === g.PHASE.FREE_AGENCY) {
                    ui.updateStatus(g.daysLeft + " days left");
                } else {
                    ui.updateStatus("Idle");
                }
                ui.updatePlayMenu();
            }
        });
    }

    /**
     * Cancel all ongoing contract negotiations.
     *
     * Currently, the only time there should be multiple ongoing negotiations in the first place is when a user is re-signing players at the end of the season, although that should probably change eventually.
     *
     * @memberOf core.contractNegotiation
     * @return {Promise}
     */
    function cancelAll() {
        return dao.negotiations.clear().then(function () {
            return require("core/league").setGameAttributes({lastDbChange: Date.now()});
        }).then(function () {
                if (g.phase < g.PHASE.FREE_AGENCY) {
                    //ui.updateStatus(g.daysLeft + " days left");
                } else {
					ui.updateStatus("Idle");
                }
		
            return ui.updatePlayMenu(null);
        });
    }

    /**
     * Accept the player's offer.
     *
     * If successful, then the team's current roster will be displayed.
     *
     * @memberOf core.contractNegotiation
     * @param {number} pid An integer that must correspond with the player ID of a player in an ongoing negotiation.
     * @return {Promise.<string=>} If an error occurs, resolves to a string error message.
     */
    function accept(pid) {
        return Promise.all([
            dao.negotiations.get({key: pid}),
            team.getPayroll(null, g.userTid).get(0),
            team.filter({
				seasonAttrs: ["cash"],			
                season: g.season
            })			
        ]).spread(function (negotiation, payroll,teams) {
            var tx;

			var cash;
			var addPayrollContract;
            // If this contract brings team over the salary cap, it's not a minimum;
            // contract, and it's not re-signing a current player, ERROR!
    //        cash = _.pluck(teams, "cash");
	//		console.log("cash: "+cash);
		//	console.log("teams[g.userTid].cash: "+teams[g.userTid].cash);
		//	console.log("payroll: "+payroll);
//			console.log("payroll partInt: "+partInt(payroll) );
		//	console.log("payroll*1: "+payroll*1);
		//	console.log("negotiation.player.amount: "+negotiation.player.amount);			
		//	console.log("negotiation.player.amount*1: "+negotiation.player.amount*1);			
	//		console.log("negotiation.player.amount partInt: "+partInt(negotiation.player.amount) );			
//			addPayrollContract = payroll+negotiation.player.amount;
			addPayrollContract = payroll*1+negotiation.player.amount*1;
		//	console.log("addPayrollContract: "+addPayrollContract);
//            if (!negotiation.resigning && ( (payroll + negotiation.player.amount) > teams[g.userTid].cash)) {
//            if (!negotiation.resigning && ( ((payroll + negotiation.player.amount) > teams[g.userTid].cash) && negotiation.player.amount !== 0)) {
            if (!negotiation.resigning && ( ((addPayrollContract) > teams[g.userTid].cash) && negotiation.player.amount !== 0)) {
//            if (!negotiation.resigning && (payroll + negotiation.player.amount > g.salaryCap && negotiation.player.amount !== 0g.minContract)) {
                return "Recruiting this player will bring your recruiting cash negative. Find another player who is easier to recruit.";
            }

            // Adjust to account for in-season signings;
            if (g.phase <= g.PHASE.AFTER_TRADE_DEADLINE) {
                negotiation.player.years -= 1;
            }

            tx = dao.tx(["players", "playerStats"], "readwrite");
            dao.players.iterate({
                ot: tx,
                key: pid,
                callback: function (p) {
                    p.tid = g.userTid;
                    p.gamesUntilTradable = 15;

                    // Handle stats if the season is in progress
                    if (g.phase <= g.PHASE.PLAYOFFS) { // Otherwise, not needed until next season
                        p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
                    }

                    p = player.setContract(p, {
                        amount: negotiation.player.amount,
                        exp: g.season + negotiation.player.years
                    }, true);

                    if (negotiation.resigning) {
                        eventLog.add(null, {
                            type: "reSigned",
                            text: 'You re-signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount, "") + '/year through ' + p.contract.exp + '.',
                            showNotification: false
                        });
                    } else {
                        eventLog.add(null, {
                            type: "freeAgent",
                            text: 'You signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> and used ' + helpers.formatCurrency(p.contract.amount, "") + '.',
                            showNotification: false
                        });
                    }

                    return p;
                }
            });

            return tx.complete().then(function () {
                return cancel(pid);
            }).then(function () {
                return require("core/league").setGameAttributes({lastDbChange: Date.now()});
            });
        });
    }

    return {
        accept: accept,
        cancel: cancel,
        cancelAll: cancelAll,
        create: create,
        offer: offer
    };
});