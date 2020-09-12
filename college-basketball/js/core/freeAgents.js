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
	/*	
//        var tx = dao.tx("players", "readwrite");
        tx = dao.tx("players", "readwrite");
   
console.log("FIXING FUCKED UP DRAFT CLASS");
console.log("g.daysLeft " +g.daysLeft);
console.log("g.phase "+ g.phase);
			if (g.phase === g.PHASE.FREE_AGENCY && (g.daysLeft >= 30 || g.daysLeft <= 0)) {
                dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: g.PLAYER.UNDRAFTED_2,
                    callback: function (p) {
						if (p.draft.year === (g.season+3)) {
							p.tid = g.PLAYER.UNDRAFTED_3;							
							return p;							
						} else {
							return;
						}
                    }
                });
            }
        return tx.complete().then(function () {		
		
			// DIRTY QUICK FIX FOR v10 db upgrade bug - eventually remove
			// This isn't just for v10 db upgrade! Needed the same fix for http://www.reddit.com/r/BasketballGM/comments/2tf5ya/draft_bug/cnz58m2?context=3 - draft class not always generated with the correct seasons
			var tx = dao.tx("players", "readwrite");
			dao.players.get({
				ot: tx,
				index: "tid",
				key: g.PLAYER.UNDRAFTED
			}).then(function (p) {
				var season;

				season = p.ratings[0].season;
				if (season !== g.season && g.phase === g.PHASE.FREE_AGENCY) {
	console.log("FIXING FUCKED UP DRAFT CLASS");

					dao.players.iterate({
						ot: tx,
						index: "tid",
	//                    key: g.PLAYER.UNDRAFTED,
						key: g.PLAYER.FREE_AGENT,					
						callback: function (p) {
		//					console.log(p.ratings[0].season+" "+p.draft.year+" "+g.season+" "+p.tid);
							//console.log("here0");			
							p.ratings[0].season = g.season;
						//    p.draft.year = g.season;
						//	console.log(p.ratings[0].season+" "+p.draft.year+" "+g.season);						
							return p;
						}
					});
				}
			});
		//	console.log("here");
//			return tx.complete().then(function () {
			return tx.complete();
						
		}).then(function () {		*/
	//	console.log(g.daysLeft);
			
			tx = dao.tx(["players", "playerStats", "releasedPlayers", "teams"], "readwrite", tx);
			
			return Promise.all([
				team.filter({
					ot: tx,				
					attrs: ["strategy"],
					seasonAttrs: ["cash","hype"],			
					season: g.season
				}),
				dao.players.getAll({
					ot: tx,				
					index: "tid",
	//                key: g.PLAYER.UNDRAFTED
	//                key: g.PLAYER.UNDRAFTED_2
					key: g.PLAYER.FREE_AGENT
				})					
	//        ]).spread(function (teams, players,teamsall) {
			]).spread(function (teams, players) {
				var i,j, signTeam, strategies, tids;
				var cash,hype;
				var maxHypeTid, maxHype;
				var reduceContract;
				
				
				console.log(g.daysLeft);		
			//	console.log("autosign");
				
				strategies = _.pluck(teams, "strategy");
				cash = _.pluck(teams, "cash");
				hype = _.pluck(teams, "hype");
				reduceContract = false;
	//            tx = dao.tx(["teams","players", "playerStats", "releasedPlayers"], "readwrite");

					//		     console.log("before cash: "+cash[0]);
					//			 cash[0] += 10000000;
					//		     console.log("after cash(saved?): "+cash[0]);
				
				
				// List of free agents, sorted by value
				players.sort(function (a, b) { return b.value - a.value; });

			//	console.log("players.length:"+players.length);
				
				if (players.length === 0) {
					return;
				}
		//console.log(g.daysLeft);
		
				// autoPlay, sort by prestige/hype
				if (g.autoPlaySeasons > 0 || g.daysLeft == 0) {
					tids = [];
					for (i = 0; i < g.numTeams; i++) {
						maxHype	= -1;
						maxHypeTid = 0;						
						for (j = 0; j < g.numTeams; j++) {
							if (tids.indexOf(j) < 0) {
								if (maxHype < hype[j]) {
									maxHype	= hype[j];
									maxHypeTid = j;										
								}
							}
						}
						tids.push(maxHypeTid);
						
					//	console.log(tids+" "+maxHypeTid+" "+tids.indexOf(maxHypeTid));
					}						
					console.log(tids);
					
				} else {
					// Randomly order teams
					tids = [];
					for (i = 0; i < g.numTeams; i++) {
						tids.push(i);
					}
					random.shuffle(tids);
					
				}

				signTeam = function (ti) {
					var tid;

					tid = tids[ti];
	//	console.log(g.daysLeft+" "+tid);
					// Finish when all teams have had a turn to sign players. This extra iteration of signTeam is required in case the user's team is the last one.
					if (ti >= tids.length) {
						return;
					}

					// Skip the user's team
					if (g.userTids.indexOf(tid) >= 0 && g.autoPlaySeasons === 0) {
						return signTeam(ti + 1);
					}

					// Small chance of actually trying to sign someone in free agency, gets greater as time goes on
			  /*      if (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.99 * g.daysLeft / 30) {
						return signTeam(ti + 1);
					}*/

					// Skip rebuilding teams sometimes
				   /* if (strategies[tid] === "rebuilding" && Math.random() < 0.7) {
						return signTeam(ti + 1);
					}*/

	/*                    // Randomly don't try to sign some players this day
					while (g.phase === g.PHASE.FREE_AGENCY && Math.random() < 0.7) {
						players.shift();
					}*/
			//	console.log("got here");

					return Promise.all([
						dao.players.count({
							ot: tx,
							index: "tid",
							key: tid
						}),
						team.getPayroll(tx, tid).get(0)
					//	dao.teams.get({ot: tx, key: tid})
					//	dao.teams.get({ot: tx,tid})					
					]).spread(function (numPlayersOnRoster, payroll) {
	//                ]).spread(function (numPlayersOnRoster, payroll,t) {
						var i, p;
						var t;
						var playerSigned;
						var divisor;
						var contractAmount;
						var maxContract;
						var contractMinAmount,contractMaxAmount;
						var hypeRatio;		
						
		//		console.log("numPlayersOnRoster: "+numPlayersOnRoster);					
	//                    if (numPlayersOnRoster < 12) {
		
							//console.log("days left? enough players? "+numPlayersOnRoster+" "+g.daysLeft);	
							
						if (numPlayersOnRoster < 13) {
						
	//						playerSigned = 	Math.round(players.length*((31-g.daysLeft) / 30));
	//						playerSigned = 	Math.round(players.length*((31-g.daysLeft) / 60));
	// always signing the top 10% of players
	//						playerSigned = 	Math.round(players.length*((33-g.daysLeft) / 30 / 10));
	//						playerSigned = 	Math.round(players.length*(.1));
							//playerSigned = 	Math.round(players.length*(.03));						
							playerSigned = 	10;							
							//if ((g.daysLeft == 0 || g.autoPlaySeasons > 0) || g.daysLeft>0) {
							if (g.daysLeft == 0 || g.autoPlaySeasons > 0)  {								
								playerSigned = 	players.length;						
							}		

						/*	console.log("days left? enough players? "+numPlayersOnRoster+" "+g.daysLeft);						
							if (numPlayersOnRoster < 12 && g.daysLeft == 0) {
							//	g.daysLeft = 1;
								console.log("TOO FEW PLAYERS "+numPlayersOnRoster+" "+g.daysLeft);
							}*/
						//	console.log("tid: "+tid);
						//	console.log("players.length: "+players.length);
						//	console.log("g.daysLeft: "+g.daysLeft);
						//	console.log("playerSigned: "+playerSigned);
						//	console.log("payroll: "+payroll);
	//                        for (i = 0; i < players.length; i++) {
							//console.log("players[0].miles[tid]: "+players[0].miles[tid]);
						//	console.log(playerSigned);
							
							for (i = 0; i < playerSigned; i++) {
							
								//// want to check
								////1) cash level
								////2) bonus amount
								////
								
								//// 1) use contract sum only for recent signings?
								//// 2) create bonus structure?
								
							//     console.log("before cash: "+cash[tid]);
							//	 cash[tid] += 1111111;
							//     console.log("after cash(saved?): "+cash[tid]);
					//		console.log("players[i].contract.amount: "+players[i].contract.amount+" payroll: "+payroll+"  cash[tid]: "+ cash[tid]);
			//		             console.log("players[i].miles[tid]: "+players[i].miles[tid]+" players[i].contract.amount: "+players[i].contract.amount+" payroll: "+payroll+" cash[tid]: "+cash[tid]+" numPlayersOnRoster: "+numPlayersOnRoster);
					   //         if divisor
								 //players[i].contract.amount
	//							         amount *= 1 + (miles/300-1)*.5;
								//contractAmount = (players[i].contract.amount)*(1+(players[i].miles[tid]/300-1)*.5) ;
								//contractAmount = (players[i].contract.amount)*(1+(players[i].miles[tid]/300-1)*.5)/ ((hype[tid]+1)/3) ;
								
								if (hype[tid]>.85) {
									contractMaxAmount = (players[i].contract.amount)*(1+(players[i].miles[tid]/300-1)*.5)/ ((hype[tid]+1)/3)  ;
									contractMinAmount = (players[i].contract.amount)*(1+(-1)*.5)/ ((hype[tid]+1)/3)  ;
									hypeRatio = (hype[tid]-.85)/.15;
									contractAmount = contractMinAmount*hypeRatio+contractMaxAmount*(1-hypeRatio)
								//	console.log(contractMaxAmount+"  "+contractAmount+"  "+contractMinAmount);
								} else {
									contractAmount = (players[i].contract.amount)*(1+(players[i].miles[tid]/300-1)*.5)/ ((hype[tid]+1)/3) ;
								}
															
								
								if (g.daysLeft == 0 || g.autoPlaySeasons > 0 ) {
								//if ((g.daysLeft == 0 || g.autoPlaySeasons > 0) || g.daysLeft<=0) {
							//		contractAmount  = 0;
									if (g.gameType == 0) {
										/*contractAmount *= .6 ;
										//contractAmount *= .5 ;
										contractAmount -= 20000 ;								
										if (contractAmount<0) {
											contractAmount = 0 ;
										}*/															
										contractAmount  *= 0.05;																											
									} else {
										contractAmount  *= 0.05;																	
									}
									if (reduceContract == true) {
										contractAmount *= .0;
									}
								}		

								if (g.gameType == 0) {
									if ((13-numPlayersOnRoster) <= 1) {
		//							  maxContract = cash[tid];
									  maxContract = cash[tid]-payroll;
									} else if ((13-numPlayersOnRoster) <= 2) {
		//							  maxContract = (cash[tid])/2*1.5;
									  maxContract = (cash[tid]-payroll)/2*1.25;
									} else {
		//							  maxContract = cash[tid]/2;
									  maxContract = (cash[tid]-payroll)/2.5;
		//							} else {
									}													
								} else {
									if ((13-numPlayersOnRoster) <= 1) {
		//							  maxContract = cash[tid];
									  maxContract = cash[tid]-payroll;
									} else if ((13-numPlayersOnRoster) <= 2) {
		//							  maxContract = (cash[tid])/2*1.5;
									  maxContract = (cash[tid]-payroll)/2*1.5;
									} else {
		//							  maxContract = cash[tid]/2;
									  maxContract = (cash[tid]-payroll)/2;
		//							} else {
									}
									
								}
								
								
	//						    if ( ( (  (players[i].contract.amount + payroll) <= (cash[tid]/(12-numPlayersOnRoster))) && (numPlayersOnRoster < 12) ) || ( (  (players[i].contract.amount ) <= 0) && (numPlayersOnRoster < 12) )  ) {							
	//						    if ( ( (  (contractAmount + payroll) <= (cash[tid]/(13-numPlayersOnRoster))) && (numPlayersOnRoster < 13) ) || ( (  (contractAmount ) <= 0) && (numPlayersOnRoster < 13) )  ) {
								//console.log(tid+" "+i+" "+contractAmount+" "+maxContract+" "+numPlayersOnRoster);
								if ( ( (  (contractAmount <= maxContract) ) && (numPlayersOnRoster < 13) ) || ( (  (contractAmount ) <= 0) && (numPlayersOnRoster < 13) )  ) {
							//	console.log(tid+" signed");
								// Don't sign minimum contract players to fill out the roster													
							 //   if (players[i].contract.amount + payroll <= g.salaryCap || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 12)) {
	//								players[i].contract.amount *= 1 + (players[i].miles[tid]/300-1)*.5;
									players[i].contract.amount = contractAmount;								
									p = players[i];
									p.tid = tid;
									if (g.phase <= g.PHASE.PLAYOFFS) { // Otherwise, not needed until next season
										p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
									}

									p = player.setContract(p, p.contract, true);
									p.gamesUntilTradable = 15;
									eventLog.add(null, {
										type: "freeAgent",
										text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>.',
										showNotification: false,
										pids: [p.pid],
										tids: [p.tid]
									});                                
								//	console.log("t.seasons[t.seasons.length - 1]: "+ t.seasons[t.seasons.length - 1]);
							//		console.log("t.seasons.length: "+ t.seasons.length);
								//	console.log("t.seasons[t.seasons.length - 1].cash: "+ t.seasons[t.seasons.length - 1].cash);

					//				t.seasons[t.seasons.length - 1].cash -= 1;
									
									
	//								});								

						   //              teamSeason.cash = cash[tid];
				/*		                 t = teams[tid];					   
										// t.tid = tid;
										 t.cash = cash[tid];
										 dao.teams.put({ot: tx, value: t});*/

	//									dao.teams.get({ot: tx, key: t2}).then(function (t) {
							/*			dao.teams.get({ot: tx, key: tid}).then(function (t) {
											//t.strategy = goodNeutralBad === 1 ? "contending" : "rebuilding";
											t.cash = cash[tid];
											console.log("tid: "+tid);
											console.log("cash[tid]: "+cash[tid]);
											console.log("b t.cash: "+t.cash);
											dao.teams.put({ot: tx, value: t});
										}); */

										//	console.log("a t.cash: "+t.cash);

										// If we found one, stop looking for this team								
										return dao.players.put({ot: tx, value: p}).then(function () {
											return team.rosterAutoSort(tx, tid);
										}).then(function () {
											players.splice(i, 1); // Remove from list of free agents
	//										return signTeam(ti + 1);
									//		console.log(ti+" "+g.daysLeft+" "+numPlayersOnRoster);				
											//// if team finds a player, allow that team to go again
																												
											return signTeam(ti);
										});
									/*	}).then(function () {
											return dao.teams.put({ot: tx, value: t});
										
										});*/
							 }
							}

							if ((g.daysLeft == 0 || g.autoPlaySeasons > 0) && numPlayersOnRoster < 13)  {
								console.log(ti);
								reduceContract = true;
								return signTeam(ti);
							}
							
							
						}
						
						reduceContract = false;
						// If this is reached, no player was found
						//if (g.daysLeft == 0 && numPlayersOnRoster < 13) {
						//	console.log(ti+" "+g.daysLeft+" "+numPlayersOnRoster);		
							return signTeam(ti + 1);	
					//	} else {
							
					//	}
						
					});
				};

				return signTeam(0);
			});
     //   });		
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
                p.contract.amount -= 500;
                p.contract.amount *= .916; //(a few days all 0)

                if (p.contract.amount < 0) {
                    p.contract.amount = 0;
                }
                if (g.daysLeft === 0) {				
//                    p.contract.amount = 0;
					if (g.gameType == 1) {
						p.contract.amount *= 0.05;							
					} else {
						p.contract.amount *= .3 ;
						p.contract.amount -= 40000 ;								
						if (p.contract.amount<0) {
							p.contract.amount = 0 ;
						}						
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
            return helpers.round(amount );  // Round to nearest 10k, assuming units are thousands
        }

        if (amount > g.maxContract ) {
            amount = g.maxContract ;
        }
        return helpers.round(amount);  // Round to nearest 10k, assuming units are millions
    }

   /**
     * Get contract amount adjusted for mood.
     *
     * @memberOf core.freeAgents
     * @param {number} amount Contract amount, in thousands of dollars or millions of dollars (fun auto-detect!).
     * @param {number} mood Player mood towards a team, from 0 (happy) to 1 (angry).
     * @return {number} Contract amoung adjusted for mood.
     */
    function amountWithMoodMiles(amount, mood,miles) {
	//	console.log("1amount: "+amount);
	//	console.log("mood: "+mood);
	//	console.log("miles: "+miles);

		var moodAdj;
		var milesAdj;
	//	moodAdj = 1 + 0.2 * mood;
	//	milesAdj = 1 + (miles/300-1)*.5;
	//	console.log("moodAdj: "+moodAdj);
	//	console.log("milesAdj: "+milesAdj);
		
        amount *= 1 + 0.2 * mood;
	//	console.log("2amount: "+amount);
//        amount *= 1 + (miles/300-1)*.5;
		if (g.gameType == 1) {
			amount *= 1 + (miles/300-1)*.5;			
		} else {
			amount *= 1 + (miles/1200-1)*.5;
		}
//		console.log("3amount: "+amount);

		
        if (amount >= g.minContract) {
            if (amount > g.maxContract) {
                amount = g.maxContract;
            }
            return helpers.round(amount );  // Round to nearest 10k, assuming units are thousands
        }
     //   console.log("miles: "+miles);
        if (amount > g.maxContract ) {
            amount = g.maxContract ;
        }
        return helpers.round(amount*1);  // Round to nearest 10k, assuming units are millions
    }	
	
	
  function amountWithMoodMilesHype(amount, mood,miles,hype) {

		var moodAdj;
		var milesAdj;
		var contractMaxAmount,contractMinAmount,hypeRatio;

		amount *= 1 + 0.2 * mood;
		
		if (g.gameType == 1) {
			if (hype>.85) {
				contractMaxAmount = (amount)*(1+(miles/300-1)*.5)/ ((hype+1)/3)  ;
				contractMinAmount = (amount)*(1+(-1)*.5)/ ((hype+1)/3)  ;
				hypeRatio = (hype-.85)/.15;
				amount = contractMinAmount*hypeRatio+contractMaxAmount*(1-hypeRatio)			
				//console.log(contractMaxAmount+"  "+contractAmount+"  "+contractMinAmount);			
			} else {
				amount *= 1 + (miles/300-1)*.5;
				amount /= (hype+1)/3;		
	//			contractAmount = (players[i].contract.amount)*(1+(players[i].miles[tid]/1200-1)*.5)/ ((hype[tid]+1)/3) ;
			}				
		} else {
			if (hype>.85) {
				contractMaxAmount = (amount)*(1+(miles/1200-1)*.5)/ ((hype+1)/3)  ;
				contractMinAmount = (amount)*(1+(-1)*.5)/ ((hype+1)/3)  ;
				hypeRatio = (hype-.85)/.15;
				amount = contractMinAmount*hypeRatio+contractMaxAmount*(1-hypeRatio)			
				//console.log(contractMaxAmount+"  "+contractAmount+"  "+contractMinAmount);			
			} else {
				amount *= 1 + (miles/1200-1)*.5;
				amount /= (hype+1)/3;		
	//			contractAmount = (players[i].contract.amount)*(1+(players[i].miles[tid]/1200-1)*.5)/ ((hype[tid]+1)/3) ;
			}			
		}			
	
		
        if (amount >= g.minContract) {
            if (amount > g.maxContract) {
                amount = g.maxContract;
            }
            return helpers.round(amount );  // Round to nearest 10k, assuming units are thousands
        }
        if (amount > g.maxContract ) {
            amount = g.maxContract ;
        }
        return helpers.round(amount*1);  // Round to nearest 10k, assuming units are millions
    }	
			
	
    /**
     * Will a player negotiate with a team, or not?
     *
     * @param {number} amount Player's desired contract amount, already adjusted for mood as in amountWithMood, in thousands of dollars
     * @param {number} mood Player's mood towards the team in question.
     * @return {boolean} Answer to the question.
     */
    function refuseToNegotiate(amount, mood) {
        if (amount * mood > 10000) {
            return true;
        }

        return false;
    }

	
	
    /**
     * Will a player negotiate with a team, or not?
     *
     * @param {number} amount Player's desired contract amount, already adjusted for mood as in amountWithMood, in thousands of dollars
     * @param {number} mood Player's mood towards the team in question.
     * @return {boolean} Answer to the question.
     */
    function refuseToNegotiateMiles(amount, mood,miles) {	    
        if ( (amount * mood * miles/1000 )> 10000) {
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

				 //   console.log("each day this runs? but not running now?");
            // This is called if there are remaining days to simulate
            cbYetAnother = function () {
                decreaseDemands().then(function () {
				  //  console.log("free agency autosign");
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
				 //   console.log("numDays: "+numDays);
			
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
        amountWithMoodMiles: amountWithMoodMiles,
		amountWithMoodMilesHype: amountWithMoodMilesHype,		
        refuseToNegotiate: refuseToNegotiate,
        refuseToNegotiateMiles: refuseToNegotiateMiles,
        play: play
    };
});