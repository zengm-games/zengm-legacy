/**
 * @name core.phase
 * @namespace Anything related to moving between phases of the game (e.g. regular season, playoffs, draft, etc.).
 */
 
 define(["dao","db", "globals", "ui", "core/contractNegotiation", "core/draft", "core/finances", "core/freeAgents", "core/player", "core/season", "core/team" ,"lib/bluebird", "lib/jquery", "lib/underscore", "util/account", "util/eventLog", "util/helpers", "util/lock", "util/message", "util/random"], function (dao,db, g, ui, contractNegotiation, draft, finances, freeAgents, player, season, team, Promise, $, _, account, eventLog, helpers, lock, message, random) {    

"use strict";


    var phaseChangeTx;

    /**
     * Common tasks run after a new phrase is set.
     *
     * This updates the phase, executes a callback, and (if necessary) updates the UI. It should only be called from one of the NewPhase* functions defined below.
     *
     * @memberOf core.phase
     * @param {number} phase Integer representing the new phase of the game (see other functions in this module).
     * @param {string=} url Optional URL to pass to ui.realtimeUpdate for redirecting on new phase. If undefined, then the current page will just be refreshed.
     * @param {Array.<string>=} updateEvents Optional array of strings.
     * @return {Promise}
     */
    function finalize(phase, url, updateEvents) {
        updateEvents = updateEvents !== undefined ? updateEvents : [];

        // Set phase before updating play menu
        return require("core/league").setGameAttributesComplete({phase: phase, phaseChangeInProgress: false}).then(function () {
            ui.updatePhase(g.season + " " + g.PHASE_TEXT[phase]);
            return ui.updatePlayMenu(null).then(function () {
                // Set lastDbChange last so there is no race condition (WHAT DOES THIS MEAN??)
                require("core/league").updateLastDbChange();
                updateEvents.push("newPhase");
                ui.realtimeUpdate(updateEvents, url);
            });
        }).then(function () {
            // If auto-simulating, initiate next action
            if (g.autoPlaySeasons > 0) {
				// Not totally sure why setTimeout is needed, but why not?
                setTimeout(function () {
                    require("core/league").autoPlay();
                }, 100);
            }			
        });
    }
	
   

    function newPhasePreseason(tx) {
        return freeAgents.autoSign(tx).then(function () { // Important: do this before changing the season or contracts and stats are fucked up
            return require("core/league").setGameAttributes(tx, {season: g.season + 1});
        }).then(function () {
            var coachingRanks, scoutingRank;

            coachingRanks = [];

            // Add row to team stats and season attributes
            return dao.teams.iterate({
                ot: tx,
                callback: function (t) {

                        // Save the coaching rank for later
                        coachingRanks[t.tid] = _.last(t.seasons).expenses.coaching.rank;

                        // Only need scoutingRank for the user's team to calculate fuzz when ratings are updated below.
                        // This is done BEFORE a new season row is added.
                        if (t.tid === g.userTid) {
                            scoutingRank = finances.getRankLastThree(t, "expenses", "scouting");
                        }

                        t = team.addSeasonRow(t);
                        t = team.addStatsRow(t);

                    return t;
                }
            }).then(function () {
                // Loop through all non-retired players
                dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                    callback: function (p) {

                                // Update ratings
                                p = player.addRatingsRow(p, scoutingRank);
                                p = player.develop(p, 1, false, coachingRanks[p.tid]);

                        // Update player values after ratings changes
                        return player.updateValues(tx, p, []).then(function (p) {
                            // Add row to player stats if they are on a team
                            if (p.tid >= 0) {
                                p = player.addStatsRow(tx, p, false);
                            }
                            return p;
                        });
                    }
                });
            }).then(function () {
                if (g.autoPlaySeasons > 0) {
                    return require("core/league").setGameAttributes(tx, {autoPlaySeasons: g.autoPlaySeasons - 1});
                }
            }).then(function () {
				
					if (g.autoPlaySeasons == 0) {				
						if (g.enableLogging && !window.inCordova) {
	//                        if (Math.random() < 0.85) {
								// Google Consumer Surveys
								TriggerPrompt("http://www.zengm.com/", (new Date()).getTime());
	//                        } else {
								// Amazon ads
	//                            $("#modal-ads").modal("show");
	//                        }
						}
					}
                return [undefined, ["playerMovement"]];
            });
        });
    }

    function newPhaseRegularSeason(tx) {
       // var tx;

        //tx = dao.tx(["messages", "schedule"], "readwrite");

        return season.setSchedule(tx, season.newSchedule()).then(function () {
            // First message from owner
            if (g.showFirstOwnerMessage) {
                return message.generate(tx, {wins: 0, playoffs: 0, money: 0});
            }

            // Spam user with another message?
            if (localStorage.nagged === "true") {
                // This used to store a boolean, switch to number
                localStorage.nagged = "1";
            }

            if (g.season === g.startingSeason + 3 && g.lid > 3 && !localStorage.nagged) {
                localStorage.nagged = "1";
                return dao.messages.add({
                    ot: tx,
                    value: {
                        read: false,
                        from: "The Commissioner",
                        year: g.season,
                        text: '<p>Hi. Sorry to bother you, but I noticed that you\'ve been playing this game a bit. Hopefully that means you like it. Either way, we would really appreciate some feedback so we can make this game better. <a href="mailto:baseball@zengm.com">Send an email</a> (baseball@zengm.com) or <a href="http://www.reddit.com/r/ZenGMHockey/">join the discussion on Reddit</a>.</p>'
					}
                });
          //      localStorage.nagged = "1";
            } 
			if ((localStorage.nagged === "1" && Math.random() < 0.25) || (localStorage.nagged === "2" && Math.random < 0.025)) {
                localStorage.nagged = "2";				
                return dao.messages.add({
                    ot: tx,
                    value: {
                        read: false,
                        from: "The Commissioner",
                        year: g.season,
                        text: '<p>Hi. Sorry to bother you again, but if you like the game, please share it with your friends! Also:</p><p><a href="https://twitter.com/zengmgames">Follow Zen GM Games on Twitter</a></p><p><a href="https://www.facebook.com/zengmgames">Like Zen GM Games on Facebook</a></p><p><a href="http://www.reddit.com/r/ZenGMHockey/">Discuss Hockey GM on Reddit</a></p><p>The more people that play Hockey GM, the more motivation I have to continue improving it. So it is in your best interest to help me promote the game! If you have any other ideas, please <a href="mailto:baseball@zengm.com">email me</a>.</p>'
                    }
                });
            }
    /*    }).catch(function (err) {
            // If there was any error in the phase change, abort transaction
            tx.abort();
            throw err;			
        });

        return tx.complete().then(function () {
            return newPhaseFinalize(g.PHASE.REGULAR_SEASON);*/
        }).then(function () {
            return [undefined, ["playerMovement"]];
        });

    }

    function newPhaseAfterTradeDeadline() {
        return newPhaseFinalize(g.PHASE.AFTER_TRADE_DEADLINE);
    }

    function newPhasePlayoffs(tx) {
		
   //     var tx;

   //     tx = dao.tx(["players", "playerStats", "playoffSeries", "releasedPlayers", "schedule", "teams"], "readwrite");
		
        // Achievements after regular season
        account.checkAchievement.septuawinarian();
        account.checkAchievement.mostPoints();

        // Set playoff matchups
        return team.filter({
            ot: tx,
            attrs: ["tid", "cid","did"],
            seasonAttrs: ["points","lost","won"],
            season: g.season,
            sortBy: ["points", "-lost", "won"]
        }).then(function (teams) {
	
            var cid, did,i,   series, teamsConf, tidPlayoffs;
			var div0Seeds;
			var div1Seeds;
			var teamsWC,teamsDiv1,teamsDiv2;
			
			
            // Add entry for wins for each team; delete winp, which was only needed for sorting
            for (i = 0; i < teams.length; i++) {
                teams[i].won = 0;
            }

			if (g.leagueType == 1) {
				   var cid, i, j, keys, series, teamsConf;
					var initialDid,secondTeam,firstTeam;
					
					tidPlayoffs = [];					
					series = [[], [], [], []];  // First round, second round, third round, fourth round
					for (cid = 0; cid < 2; cid++) {
						initialDid = -1;
						firstTeam = -1;
						secondTeam = -1;						
						teamsConf = [];
						for (i = 0; i < teams.length; i++) {
							if ( (teams[i].cid === cid) && (initialDid != teams[i].did) && (teamsConf.length < 2) ) {
								initialDid = teams[i].did;
								secondTeam = i;
								if (firstTeam < 0) {
									firstTeam = i;									
								}
								teamsConf.push(teams[i]);
								tidPlayoffs.push(teams[i].tid);
							}
						}
						
						for (i = 0; i < teams.length; i++) {
							if ( (teams[i].cid === cid) && (i != firstTeam) && (i != secondTeam) ) {
								teamsConf.push(teams[i]);
								tidPlayoffs.push(teams[i].tid);								
							}
						}
						series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
						series[0][cid * 4].home.seed = 1;
						series[0][cid * 4].away.seed = 8;
						series[0][1 + cid * 4] = {home: teamsConf[3], away: teamsConf[4]};
						series[0][1 + cid * 4].home.seed = 4;
						series[0][1 + cid * 4].away.seed = 5;
						series[0][2 + cid * 4] = {home: teamsConf[2], away: teamsConf[5]};
						series[0][2 + cid * 4].home.seed = 3;
						series[0][2 + cid * 4].away.seed = 6;
						series[0][3 + cid * 4] = {home: teamsConf[1], away: teamsConf[6]};
						series[0][3 + cid * 4].home.seed = 2;
						series[0][3 + cid * 4].away.seed = 7;
					}
					
			} else {			
			
			
			
			
			
			
			
			
			
			
				var divFirst;
				var divSecond;
				var WC;
				var topSeed;
				//// 4 seeds each division WC, top 3 make it, then next best 2 in conference
				tidPlayoffs = [];
				series = [[], [], [], []];  // First round, second round, third round, fourth round
				for (cid = 0; cid < 2; cid++) {
					teamsConf = [];
					teamsDiv1 = [];
					teamsDiv2 = [];
					teamsWC = [];
					divFirst = 0;
					divSecond = 0;
					WC = 0;
					topSeed = 0;
					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
							if (teams[i].did === (cid*2)) {
							
										if (teamsDiv1.length == 0 && teamsDiv2.length == 0) {
											topSeed = 0;
										}
							
										if (teamsDiv1.length < 3) {
											teamsDiv1.push(teams[i]);
											tidPlayoffs.push(teams[i].tid);
											divFirst += 1;										
										} else if (teamsWC.length < 2) {
											teamsWC.push(teams[i]);
											tidPlayoffs.push(teams[i].tid);
											WC += 1;										
										
										}
				
							}			
							if (teams[i].did === (cid*2+1)) {
							
										if (teamsDiv1.length == 0 && teamsDiv2.length == 0) {
											topSeed = 1;
										}						
							
										if (teamsDiv2.length < 3) {
											teamsDiv2.push(teams[i]);
											tidPlayoffs.push(teams[i].tid);
											divSecond += 1;										
										} else if (teamsWC.length < 2) {
											teamsWC.push(teams[i]);
											tidPlayoffs.push(teams[i].tid);
											WC += 1;										
										
										}
										
							}			
							
						}
					}
					

					
					series[0][cid * 4] = {home: teamsDiv1[0], away: teamsWC[1-topSeed]};
					series[0][cid * 4].home.seed = 1;
					series[0][cid * 4].away.seed = 4;
					series[0][1 + cid * 4] = {home: teamsDiv1[1], away: teamsDiv1[2]};
					series[0][1 + cid * 4].home.seed = 2;
					series[0][1 + cid * 4].away.seed = 3;
					series[0][2 + cid * 4] = {home: teamsDiv2[0], away: teamsWC[topSeed]};
					series[0][2 + cid * 4].home.seed = 1;
					series[0][2 + cid * 4].away.seed = 4;
					series[0][3 + cid * 4] = {home: teamsDiv2[1], away: teamsDiv2[2]};
					series[0][3 + cid * 4].home.seed = 2;
					series[0][3 + cid * 4].away.seed = 3;

	/*                series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
					series[0][cid * 4].home.seed = 1;
					series[0][cid * 4].away.seed = 8;
					series[0][1 + cid * 4] = {home: teamsConf[3], away: teamsConf[4]};
					series[0][1 + cid * 4].home.seed = 4;
					series[0][1 + cid * 4].away.seed = 5;
					series[0][2 + cid * 4] = {home: teamsConf[2], away: teamsConf[5]};
					series[0][2 + cid * 4].home.seed = 3;
					series[0][2 + cid * 4].away.seed = 6;
					series[0][3 + cid * 4] = {home: teamsConf[1], away: teamsConf[6]};
					series[0][3 + cid * 4].home.seed = 2;
					series[0][3 + cid * 4].away.seed = 7; */

					
					
				}
			
			}

		//	console.log("here");
             tidPlayoffs.forEach(function (tid) {
                eventLog.add(null, {
                    type: "playoffs",
                    text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[tid], g.season]) + '">' + g.teamNamesCache[tid] + '</a> made the <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">playoffs</a>.',
                    showNotification: tid === g.userTid,
                    tids: [tid]
                });
            });

            /*if (tidPlayoffs.indexOf(g.userTid) >= 0) {
                eventLog.add(null, {
                    type: "playoffs",
                    text: 'Your team made <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">the playoffs</a>.'
                });
            } else {
                eventLog.add(null, {
                    type: "playoffs",
                    text: 'Your team didn\'t make <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">the playoffs</a>.'
                });
            }*/
		//	console.log("here");
		
            return Promise.all([		
			  dao.playoffSeries.put({
					ot: tx,
					value: {
						season: g.season,
						currentRound: 0,
						series: series
					}
				}),	
				// Add row to team stats and team season attributes
				dao.teams.iterate({
					ot: tx,
					callback: function (t) {
						
					var  teamSeason;

						teamSeason = t.seasons[t.seasons.length - 1];
						if (tidPlayoffs.indexOf(t.tid) >= 0) {
							t = team.addStatsRow(t, true);

							teamSeason.playoffRoundsWon = 0;

							// More hype for making the playoffs
							teamSeason.hype += 0.05;
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}

						 //   cursor.update(t);



						} else {
							// Less hype for missing the playoffs
							teamSeason.hype -= 0.05;
							if (teamSeason.hype < 0) {
								teamSeason.hype = 0;
							}

						}
						return t;
					}
				}),
				
				// Add row to player stats
                // Add row to player stats
                Promise.map(tidPlayoffs, function (tid) {
                    return dao.players.iterate({
                        ot: tx,
                        index: "tid",
                        key: tid,
                        callback: function (p) {
                            return player.addStatsRow(tx, p, true);
                        }
                    });
                })					
            ]);			
        }).then(function () {
            return Promise.all([
                finances.assessPayrollMinLuxury(tx),
                season.newSchedulePlayoffsDay(tx)
            ]);
		}).then(function () {
			var url;
			// Don't redirect if we're viewing a live game now
			if (location.pathname.indexOf("/live_game") === -1) {
				url = helpers.leagueUrl(["playoffs"]);
			}						
			return [url, ["teamFinances"]];			
            //return newPhaseFinalize(g.PHASE.PLAYOFFS, url, ["teamFinances"]);
        });
    }		

    function newPhaseBeforeDraft(tx) {
      //  var tx;

		// Select winners of the season's awards
//        return awards().then(function () {
        return season.awards(tx).then(function () {
			
			var releasedPlayersStore;

			//tx =  dao.tx(["events", "messages", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");

			// Add award for each player on the championship team
			return team.filter({
				attrs: ["tid"],
				seasonAttrs: ["playoffRoundsWon"],
				season: g.season,
				ot: tx
            });
        }).then(function (teams) {
				var i, tid;

				for (i = 0; i < teams.length; i++) {
					if (teams[i].playoffRoundsWon === 4) {
						tid = teams[i].tid;
						break;
					}
				}

			   return dao.players.iterate({
					ot: tx,
					index: "tid",
					key: tid,
					callback: function (p) {
						p.awards.push({season: g.season, type: "Won Stanley Cup"});
						return p;
                }
            });
        }).then(function () {

				var maxAge, minPot;
				
				// Players meeting one of these cutoffs might retire
				maxAge = 34;
				minPot = 40;

			// Do annual tasks for each player, like checking for retirement
            dao.players.iterate({
                ot: tx,
                index: "tid",
                key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                callback: function (p) {
					
				var age, cont, cursor, excessAge, excessPot,p, pot, update;

				update = false;

                    // Get player stats, used for HOF calculation
                    return dao.playerStats.getAll({
                        ot: tx,
                        index: "pid, season, tid",
                        key: IDBKeyRange.bound([p.pid], [p.pid, ''])
                    }).then(function (playerStats) {
                        var age, excessAge, excessPot, pot;

                        age = g.season - p.born.year;
                        pot = p.ratings[p.ratings.length - 1].pot;
						

						if (age > maxAge || pot < minPot) {
							excessAge = 0;
							if (age > 34 || p.tid === g.PLAYER.FREE_AGENT) {  // Only players older than 34 or without a contract will retire
								if (age > 34) {
									excessAge = (age - 34) / 20;  // 0.05 for each year beyond 34
								}
								excessPot = (40 - pot) / 50;  // 0.02 for each potential rating below 40 (this can be negative)
								if (excessAge + excessPot + random.gauss(0, 1) > 0) {
									p = player.retire(tx, p, playerStats);
									update = true;
								}
							}
						}

						// Update "free agent years" counter and retire players who have been free agents for more than one years
						if (p.tid === g.PLAYER.FREE_AGENT) {
							if (p.yearsFreeAgent >= 1) {
								p = player.retire(tx, p, playerStats);
							} else {
								p.yearsFreeAgent += 1;
							}
							p.contract.exp += 1;
							update = true;
						} else if (p.tid >= 0 && p.yearsFreeAgent > 0) {
							p.yearsFreeAgent = 0;
							update = true;
						}

						// Heal injures
						if (p.injury.type !== "Healthy") {
							if (p.injury.gamesRemaining <= 82) {
								p.injury = {type: "Healthy", gamesRemaining: 0};
							} else {
								p.injury.gamesRemaining -= 82;
							}
							update = true;
						}

						// Update player in DB, if necessary
                      // Update player in DB, if necessary
                        if (update) {
                            return p;
                        }
                    });
                }				
            });  
        }).then(function () {
            // Remove released players' salaries from payrolls if their contract expired this year
            return dao.releasedPlayers.iterate({
                ot: tx,
                index: "contract.exp",
                key: IDBKeyRange.upperBound(g.season),
                callback: function (rp) {
                    dao.releasedPlayers.delete({
                        ot: tx,
                        key: rp.rid
                    });
                }
            });

        }).then(function () {
            return team.updateStrategies(tx);
        }).then(function () {
            return season.updateOwnerMood(tx);
        }).then(function (deltas) {
            return message.generate(tx, deltas);
        }).then(function () {
            var url;			
			
            // Don't redirect if we're viewing a live game now
            if (location.pathname.indexOf("/live_game") === -1) {
                url = helpers.leagueUrl(["history"]);
            }

            helpers.bbgmPing("season");

            return [url, ["playerMovement"]];
        });
    }			
  
         /*      // Don't redirect if we're viewing a live game now
                if (location.pathname.indexOf("/live_game") === -1) {
                    url = helpers.leagueUrl(["history"]);
                }

                return newPhaseFinalize(g.PHASE.BEFORE_DRAFT, url, ["playerMovement"]);
            }).then(function () {

                            helpers.bbgmPing("season");
            });
        });
    }*/

    function newPhaseDraft(tx) {
		
		// Achievements after awards
		account.checkAchievement.hardware_store();
		account.checkAchievement.sleeper_pick();		
		
        // Achievements after playoffs
        account.checkAchievement.fo_fo_fo();
        account.checkAchievement["98_degrees"]();
        account.checkAchievement.dynasty();
        account.checkAchievement.dynasty_2();
        account.checkAchievement.dynasty_3();
        account.checkAchievement.dynasty_4();
        account.checkAchievement.dynasty_5();
        account.checkAchievement.moneyball();
        account.checkAchievement.moneyball_2();
        account.checkAchievement.small_market();

		
		
        return draft.genOrder(tx).then(function () {
            // This is a hack to handle weird cases where players have draft.year set to the current season, which fucks up the draft UI
            return dao.players.iterate({
                ot: tx,
                index: "draft.year",
                key: g.season,
                callback: function (p) {
                    if (p.tid >= 0) {
                        p.draft.year -= 1;
                        return p;
                    }
                }
            });
        }).then(function () {
            return [helpers.leagueUrl(["draft"])];
        });
    }
	
	
    function newPhaseAfterDraft(tx) {
        var promises, round, tid,rounds;

        promises = [];
		rounds = 2+g.gameType;
        // Add a new set of draft picks
        for (tid = 0; tid < g.numTeams; tid++) {
            for (round = 1; round <= rounds; round++) {
                promises.push(dao.draftPicks.add({
                    ot: tx,
                    value: {
                        tid: tid,
                        originalTid: tid,
                        round: round,
                        season: g.season + 4
                    }
                }));
            }
        }

        return Promise.all(promises).then(function () {
            return [undefined, ["playerMovement"]];
        });
    }	


	
    function newPhaseResignPlayers(tx) {
        return player.genBaseMoods(tx).then(function (baseMoods) {
             // Re-sign players on user's team
            return dao.players.iterate({
                ot: tx,
                index: "tid",
                key: IDBKeyRange.lowerBound(0),
                callback: function (p) {
                    var tid;										
                    if (p.contract.exp <= g.season && g.userTids.indexOf(p.tid) >= 0 && g.autoPlaySeasons === 0) {

                        tid = p.tid;
                        // Add to free agents first, to generate a contract demand
                        return player.addToFreeAgents(tx, p, g.PHASE.RESIGN_PLAYERS, baseMoods).then(function () {
                            // Open negotiations with player
                            return contractNegotiation.create(tx, p.pid, true, tid).then(function (error) {
                                if (error !== undefined && error) {
                                    eventLog.add(null, {
                                        type: "refuseToSign",
                                        text: error,
                                        pids: [p.pid],
                                        tids: [tid]
                                    });
                                }
                            });
                        });
                    }
                }
            });
        }).then(function () {
            // Set daysLeft here because this is "basically" free agency, so some functions based on daysLeft need to treat it that way (such as the trade AI being more reluctant)
            return require("core/league").setGameAttributes(tx, {daysLeft: 30});
        }).then(function () {
            return [helpers.leagueUrl(["negotiation"]), ["playerMovement"]];
        });
    }

    function newPhaseFreeAgency(tx) {
        var strategies;

        return team.filter({
            ot: tx,
            attrs: ["strategy"],
            season: g.season
        }).then(function (teams) {
            strategies = _.pluck(teams, "strategy");

            // Delete all current negotiations to resign players
            return contractNegotiation.cancelAll(tx);
        }).then(function () {
            return player.genBaseMoods(tx).then(function (baseMoods) {
                // Reset contract demands of current free agents and undrafted players
                return dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: IDBKeyRange.bound(g.PLAYER.UNDRAFTED, g.PLAYER.FREE_AGENT), // This only works because g.PLAYER.UNDRAFTED is -2 and g.PLAYER.FREE_AGENT is -1
                    callback: function (p) {
                        return player.addToFreeAgents(tx, p, g.PHASE.FREE_AGENCY, baseMoods);
                    }
                }).then(function () {
                    // AI teams re-sign players or they become free agents
                    // Run this after upding contracts for current free agents, or addToFreeAgents will be called twice for these guys
                    return dao.players.iterate({
                        ot: tx,
                        index: "tid",
                        key: IDBKeyRange.lowerBound(0),
                        callback: function (p) {
                            var contract, factor;

                            if (p.contract.exp <= g.season && (g.userTids.indexOf(p.tid) < 0 || g.autoPlaySeasons > 0)) {
                                // Automatically negotiate with teams
                                if (strategies[p.tid] === "rebuilding") {
                                    factor = 0.4;
                                } else {
                                    factor = 0;
                                }
							//	console.log(p);
								let age = g.season - p.born.year;
							//	console.log(age+" "+p.pos+" "+p.ratings[0].ovr+" "+p.ratings[0].pot+" "+p.value);
//								if ( (p.value > 40 && Math.random() > .5) || p.value > 45) { // Should eventually be smarter than a coin flip
								if (  p.value > 70  || (p.value > 60 && Math.random() > .2) || (p.value > 50 && Math.random() > .5)) { // Should eventually be smarter than a coin flip

//                                if (Math.random() < p.value / 100 - factor) { // Should eventually be smarter than a coin flip
                             //   if (Math.random() < p.value / 100 - factor) { // Should eventually be smarter than a coin flip
								// See also core.team
                                    contract = player.genContract(p);
                                    contract.exp += 1; // Otherwise contracts could expire this season
                                    p = player.setContract(p, contract, true);
                                    p.gamesUntilTradable = 15;
                                    eventLog.add(null, {
                                        type: "reSigned",
                                        text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamNamesCache[p.tid] + '</a> re-signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount / 1000, "M") + '/year through ' + p.contract.exp + '.',
                                        showNotification: false,
                                        pids: [p.pid],
                                        tids: [p.tid]
                                    });									
                                    return p; // Other endpoints include calls to addToFreeAgents, which handles updating the database
                                }

                                return player.addToFreeAgents(tx, p, g.PHASE.RESIGN_PLAYERS, baseMoods);
                            }
                        }
                    });
                });
            }).then(function () {
                // Bump up future draft classes (nested so tid updates don't cause race conditions)
                return dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: g.PLAYER.UNDRAFTED_2,
                    callback: function (p) {
                        p.tid = g.PLAYER.UNDRAFTED;
                        p.ratings[0].fuzz /= 2;
                        return p;
                    }
                }).then(function () {
                    return dao.players.iterate({
                        ot: tx,
                        index: "tid",
                        key: g.PLAYER.UNDRAFTED_3,
                        callback: function (p) {
                            p.tid = g.PLAYER.UNDRAFTED_2;
                            p.ratings[0].fuzz /= 2;
                            return p;
                        }
                    });
                });
            }).then(function () {
                // Create new draft class for 3 years in the future
                return draft.genPlayers(tx, g.PLAYER.UNDRAFTED_3);
            }).then(function () {
                return [helpers.leagueUrl(["free_agents"]), ["playerMovement"]];
            });
        });
    }	


    function newPhaseFantasyDraft(tx, position) {
        return contractNegotiation.cancelAll(tx).then(function () {
            return draft.genOrderFantasy(tx, position);
        }).then(function () {
            return require("core/league").setGameAttributes(tx, {nextPhase: g.phase});
        }).then(function () {
            // Protect draft prospects from being included in this
            return dao.players.iterate({
                ot: tx,
                index: "tid",
                key: g.PLAYER.UNDRAFTED,
                callback: function (p) {
                    p.tid = g.PLAYER.UNDRAFTED_FANTASY_TEMP;
                    return p;
                }
            }).then(function () {
                // Make all players draftable
                dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                    callback: function (p) {
                        p.tid = g.PLAYER.UNDRAFTED;
                        return p;
                    }
                });
            });

        }).then(function () {
            return dao.releasedPlayers.clear({ot: tx});
        }).then(function () {
            return [helpers.leagueUrl(["draft"]), ["playerMovement"]];
        });
    }


    /**
     * Set a new phase of the game.
     *
     * This function is called to do all the crap that must be done during transitions between phases of the game, such as moving from the regular season to the playoffs. Phases are defined in the g.PHASE.* global variables. The phase update may happen asynchronously if the database must be accessed, so do not rely on g.phase being updated immediately after this function is called. Instead, pass a callback.
     *
     * phaseChangeTx contains the transaction for the phase change. Phase changes are atomic: if there is an error, it all gets cancelled. The user can also manually abort the phase change. IMPORTANT: For this reason, gameAttributes must be included in every phaseChangeTx to prevent g.phaseChangeInProgress from being changed. Since phaseChangeTx is readwrite, nothing else will be able to touch phaseChangeInProgress until it finishes.
     *
     * @memberOf core.phase
     * @param {number} phase Numeric phase ID. This should always be one of the g.PHASE.* variables defined in globals.js.
     * @param {} extra Parameter containing extra info to be passed to phase changing function. Currently only used for newPhaseFantasyDraft.
     * @return {Promise}
     */
    function newPhase(phase, extra) {
        // Prevent at least some cases of code running twice
        if (phase === g.phase) {
            return;
        }

        return lock.phaseChangeInProgress().then(function (phaseChangeInProgress) {
            if (!phaseChangeInProgress) {
                return require("core/league").setGameAttributesComplete({phaseChangeInProgress: true}).then(function () {
                    ui.updatePlayMenu(null);
					
                    // In Chrome, this will update play menu in other windows. In Firefox, it won't because ui.updatePlayMenu gets blocked until phaseChangeTx finishes for some reason.
                    require("core/league").updateLastDbChange();					
					
				
					if (phase === g.PHASE.PRESEASON) {
						phaseChangeTx = dao.tx(["gameAttributes", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");
						return newPhasePreseason(phaseChangeTx);
					}
					if (phase === g.PHASE.REGULAR_SEASON) {
						phaseChangeTx = dao.tx(["gameAttributes", "messages", "schedule"], "readwrite");
						return newPhaseRegularSeason(phaseChangeTx);
					}
					if (phase === g.PHASE.AFTER_TRADE_DEADLINE) {
						return newPhaseAfterTradeDeadline();
					}
					if (phase === g.PHASE.PLAYOFFS) {
						phaseChangeTx = dao.tx(["players", "playerStats", "playoffSeries", "releasedPlayers", "schedule", "teams"], "readwrite");
						return newPhasePlayoffs(phaseChangeTx);
					}
					if (phase === g.PHASE.BEFORE_DRAFT) {
						phaseChangeTx = dao.tx(["awards", "events", "gameAttributes", "messages", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");
						return newPhaseBeforeDraft(phaseChangeTx);
					}
					if (phase === g.PHASE.DRAFT) {
						phaseChangeTx = dao.tx(["draftPicks", "draftOrder", "gameAttributes", "players", "teams"], "readwrite");
						return newPhaseDraft(phaseChangeTx);
					}
					if (phase === g.PHASE.AFTER_DRAFT) {
						phaseChangeTx = dao.tx(["draftPicks", "gameAttributes"], "readwrite");
						return newPhaseAfterDraft(phaseChangeTx);
					}
					if (phase === g.PHASE.RESIGN_PLAYERS) {
						phaseChangeTx = dao.tx(["gameAttributes", "messages", "negotiations", "players", "teams"], "readwrite");
						return newPhaseResignPlayers(phaseChangeTx);
					}
					if (phase === g.PHASE.FREE_AGENCY) {
						phaseChangeTx = dao.tx(["gameAttributes", "messages", "negotiations", "players", "teams"], "readwrite");
						return newPhaseFreeAgency(phaseChangeTx);
					}
					if (phase === g.PHASE.FANTASY_DRAFT) {
						phaseChangeTx = dao.tx(["draftOrder", "gameAttributes", "messages", "negotiations", "players", "releasedPlayers"], "readwrite");
						return newPhaseFantasyDraft(phaseChangeTx, extra);
					}
                }).catch(function (err) {
                    // If there was any error in the phase change, abort transaction
                    if (phaseChangeTx && phaseChangeTx.abort) {
                        phaseChangeTx.abort();
                    }

                    require("core/league").setGameAttributesComplete({phaseChangeInProgress: false}).then(function () {
                        throw err;
                    });
                }).spread(function (url, updateEvents) {
                  //  return phaseChangeTx.complete().then(function () {
                        return finalize(phase, url, updateEvents);
                  //  });
                });
            }

            helpers.errorNotify("Phase change already in progress, maybe in another tab.");
        });
    }

    function abort() {
        try {
            // Stop error from bubbling up, since this function is only called on purpose
            phaseChangeTx.onerror = function (e) {
                e.stopPropagation();
                e.preventDefault();
            };

            phaseChangeTx.abort();
        } catch (err) {
            // Could be here because tx already ended, phase change is happening in another tab, or something weird.
            console.log("This is probably not actually an error:");
            console.log(err.stack);
            helpers.errorNotify("If \"Abort\" doesn't work, check if you have another tab open.");
        } finally {
            // If another window has a phase change in progress, this won't do anything until that finishes
            require("core/league").setGameAttributesComplete({phaseChangeInProgress: false}).then(function () {
                return ui.updatePlayMenu(null);
            });
        }
    }


    return {
        newPhase: newPhase,
        abort: abort
    };
});