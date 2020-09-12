/**
 * @name core.phase
 * @namespace Anything related to moving between phases of the game (e.g. regular season, playoffs, draft, etc.).
 */
 
define(["dao", "globals", "ui", "core/contractNegotiation", "core/draft", "core/finances", "core/freeAgents", "core/player", "core/season", "core/team", "lib/bluebird", "lib/underscore", "util/account", "util/ads", "util/eventLog", "util/helpers", "util/lock", "util/message", "util/random"], function (dao, g, ui, contractNegotiation, draft, finances, freeAgents, player, season, team, Promise, _, account, ads, eventLog, helpers, lock, message, random) {
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
		
				console.log("preseason");		
		//console.log("preseasons before free agents: "+ g.daysLeft);
		//g.daysLeft = 30;
		//console.log("preseasons before free agents: "+ g.daysLeft);		
        return freeAgents.autoSign(tx).then(function () { // Important: do this before changing the season or contracts and stats are fucked up
		//console.log("preseasons after free agents: "+ g.daysLeft);
            return require("core/league").setGameAttributes(tx, {season: g.season + 1});
        }).then(function () {
            var coachingRanks, scoutingRank;

            coachingRanks = [];
				console.log("add team stat row ");
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
				console.log("add player stat row and update values");
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
         /*   }).then(function () {
				// sort players after free agency, since no free agency in season
               dao.teams.iterate({
                    ot: tx,
                    callback: function (t) {
						 
						 if (g.userTids.indexOf(t.tid) < 0 || g.autoPlaySeasons > 0) {
							return team.rosterAutoSort(tx, t.tid);
						}	
						return;
                    }
                });			*/	
 			
            }).then(function () {
				if (g.autoPlaySeasons == 0) {				
					if (g.enableLogging && !window.inCordova) {
						ads.show();
					}
				}

                return [undefined, ["playerMovement"]];
            });
        });
    }

    function newPhaseRegularSeason(tx) {

	
		/*return team.checkRosterSizes().then(function (userTeamSizeError) {
			//	console.log("size check");
				if (userTeamSizeError === null) {
			//		console.log("size fine");
				//	return newPhaseRegularSeason();
				} else {
				//	console.log("error");
					ui.updateStatus("Idle");
					helpers.errorNotify(userTeamSizeError);
				//	console.log("error");
				//	phase = g.PHASE.PRESEASON
				//	return newPhasePreseason();
					return newPhaseFinalize(g.PHASE.PRESEASON, undefined, ["playerMovement"]);
				}	*/
				
				
			return team.filter({
				attrs: ["tid","did", "cid"],
				season: g.season,
	            ot: tx
			}).then(function (teams) {	
				//var tx;
				//tx = dao.tx("messages", "readwrite");
			
				return season.setSchedule(tx, season.newSchedule(teams)).then(function () {


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
								text: '<p>Hi. Sorry to bother you, but I noticed that you\'ve been playing this game a bit. Hopefully that means you like it. Either way, we would really appreciate some feedback so we can make this game better. <a href="mailto:commissioner@basketball-gm.com">Send an email</a> (commissioner@basketball-gm.com) or <a href="http://www.reddit.com/r/BasketballGM/">join the discussion on Reddit</a>.</p>'
							}
						});
				    } 
					if ((localStorage.nagged === "1" && Math.random() < 0.25) || (localStorage.nagged === "2" && Math.random < 0.025)) {
						localStorage.nagged = "2"; 						
						return dao.messages.add({
							ot: tx,
							value: {
								read: false,
								from: "The Commissioner",
								year: g.season,
								text: '<p>Hi. Sorry to bother you again, but if you like the game, please share it with your friends! Also:</p><p><a href="https://twitter.com/ZenGMGames">Follow Zen GM on Twitter</a></p><p><a href="https://www.facebook.com/ZenGMGames">Like Zen GM on Facebook</a></p><p><a href="http://www.reddit.com/r/ZenGMBasketballCoach/">Discuss College Basketball Coach on Reddit</a></p><p>The more people that play College Basketball Coach, the more motivation I have to continue improving it. So it is in your best interest to help me promote the game! If you have any other ideas, please <a href="mailto:baseball@zengm.com">email me</a>.</p>'
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

		
       /*    }).then(function () {
				// sort players after free agency, since no free agency in season
				if (g.season > g.startingSeasons) {
					

				   dao.teams.iterate({
						ot: tx,
						callback: function (t) {
							 
							 if (g.userTids.indexOf(t.tid) < 0 || g.autoPlaySeasons > 0) {
								return team.rosterAutoSort(tx, t.tid);
							}	
							return;
						}
					});				
				}*/	
				
			});				
		//});						
    }

    function newPhaseAfterTradeDeadline() {
        return newPhaseFinalize(g.PHASE.AFTER_TRADE_DEADLINE);
    }

    function newPhasePlayoffs(tx) {
		
    //    var  tx;

   //     tx = dao.tx(["players", "playerStats", "playoffSeries", "releasedPlayers", "schedule", "teams"], "readwrite");
		
        // Achievements after regular season
        account.checkAchievement.septuawinarian();

        // Set playoff matchups
        return team.filter({
            ot: tx,
            attrs: ["tid", "cid","did"],
//            seasonAttrs: ["winp"],
            seasonAttrs: ["winpConf","wonConf","winp"],
            season: g.season,
            sortBy: ["winpConf","winp"]			
//            sortBy: "wonConf"
//            sortBy: "winp"			
        }).then(function (teams) {
            var cid,did, i,  series, teamsConf, tidPlayoffs;

            // Add entry for wins for each team; delete winp, which was only needed for sorting
            for (i = 0; i < teams.length; i++) {
                teams[i].won = 0;
            }

            tidPlayoffs = [];
            series = [[], [], [], []];  // First round, second round, third round, fourth round
//            for (cid = 0; cid < 4; cid++) {
            for (did = 0; did < g.divs.length; did++) {
                teamsConf = [];
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].did === did) {
//                        if (teamsConf.length < 8) {
                        if (teamsConf.length < 10) {
                            teamsConf.push(teams[i]);
                            tidPlayoffs.push(teams[i].tid);
                        }
                    }
                }
				
                       series[0][did * 4] = {home: teamsConf[0], away: teamsConf[7]};
                        series[0][did * 4].away.seed = 8;
                        series[0][did * 4].home.seed = 1;
                        series[0][1 + did * 4] = {home: teamsConf[3], away: teamsConf[4]};
                        series[0][1 + did * 4].away.seed = 5;
                        series[0][1 + did * 4].home.seed = 4;
                        series[0][2 + did * 4] = {home: teamsConf[2], away: teamsConf[5]};
                        series[0][2 + did * 4].away.seed = 6;
                        series[0][2 + did * 4].home.seed = 3;
                        series[0][3 + did * 4] = {home: teamsConf[1], away: teamsConf[6]};
                        series[0][3 + did * 4].away.seed = 7;
                        series[0][3 + did * 4].home.seed = 2;			        
            }

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
						var teamSeason;

						teamSeason = t.seasons[t.seasons.length - 1];

						if (tidPlayoffs.indexOf(t.tid) >= 0) {
							t = team.addStatsRow(t, true);

							teamSeason.playoffRoundsWon = 0;

							// More hype for making the playoffs
					 //       teamSeason.hype += 0.05;
							teamSeason.hype *= 0.94;
							teamSeason.hype += 0.010;				 
							if (teamSeason.hype > 1) {
								teamSeason.hype = 1;
							}
						} else {
							// Less hype for missing the playoffs
					   //     teamSeason.hype -= 0.05;
							if (teamSeason.hype < 0) {
								teamSeason.hype = 0;
							}
						}

						return t;
					}
				}),

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
               // finances.assessPayrollMinLuxury(tx),
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

    function newPhaseBeforePlayoff64(tx) {
      //  var tx;

        // Achievements after playoffs
   /*     account.checkAchievement.fo_fo_fo();
        account.checkAchievement["98_degrees"]();
        account.checkAchievement.dynasty();
        account.checkAchievement.dynasty_2();
        account.checkAchievement.dynasty_3();
        account.checkAchievement.moneyball();
        account.checkAchievement.moneyball_2();
        account.checkAchievement.small_market(); */

        // Select winners of the season's awards
        return season.awards(tx).then(function () {

            // Add award for each player on the championship team
            return team.filter({
                attrs: ["tid"],
                seasonAttrs: ["playoffRoundsWon"],
                season: g.season,
                ot: tx
            });
        }).then(function (teams) {
            var i, maxAge, minPot, tid;

            // Give award to all players on the championship team
            for (i = 0; i < teams.length; i++) {
                if (teams[i].playoffRoundsWon === 4) {
                    tid = teams[i].tid;
					dao.players.iterate({
						ot: tx,
						index: "tid",
						key: tid,
						callback: function (p) {
							p.awards.push({season: g.season, type: "Won CT"});
							return p;
						}
					});
				}
            }      
		}).then(function () {
			var url;			
			// Don't redirect if we're viewing a live game now
			if (location.pathname.indexOf("/live_game") === -1) {
				url = helpers.leagueUrl(["history"]);
			}			
			return [url, ["teamFinances"]];						
            //return newPhaseFinalize(g.PHASE.PLAYOFFS, url, ["teamFinances"]);
        });
    }		
	

    function newPhasePlayoffs64(tx) {
		
        //var tx;

        // Achievements after regular season
      //      console.log("did it even get here?");
	//		account.checkAchievement.septuawinarian();
			account.checkAchievement.small_market();
        // Set playoff matchups
        return team.filter({
            ot: tx,
            attrs: ["tid", "cid","did"],
//            seasonAttrs: ["winp"],
           seasonAttrs: ["wonConf","winp","confChamp","wonAway","wonHome","lostAway","lostHome", "lastTen"],
            stats: ["gp", "pts", "oppPts", "diff"],		
            season: g.season
   //         sortBy: ["winpConf","winp"]			
//            sortBy: "wonConf"
//            sortBy: "winp"			
        }).then(function (teams) {
            var cid,did, i,  series, teamsConf, tidPlayoffs;
            var bracket;
			var atLarge, champs;
			
			
			
			/////////////////////
			
				return dao.games.getAll({
						ot: tx,					
						index: "season",
						key: g.season					
				}).then(function (game) {
	//				}).then(function (teams,game) {
					
					//	  console.log("test");
					//	  console.log("game length: "+game.length);
					//	  console.log("teams length: "+teams.length);	
               var i, j, overallRankMetric, playerValuesByTid, weights;

				var teamWins,teamLosses,teamAdjWins,teamAdjLosses, teamOppWins,teamOppLosses, teamOppOppWins,teamOppOppLosses,teamPointsFor,teamPointsAgainst,teamAdjPointsFor,teamAdjPointsAgainst,teamSchedule,teamOppPointsFor,teamOppPointsAgainst,teamOppOppPointsFor,teamOppOppPointsAgainst;
				
				var teamSOS,teamRPI,teamPowerRank;
				
				var trackGames,trackOpps,trackOppsOpps;
				
				
//////////
					var i, j;
							
							var teamPointsFor,teamPointsAgainst,teamAdjPointsFor,teamAdjPointsAgainst,teamSchedule,teamOppPointsFor,teamOppPointsAgainst,teamOppOppPointsFor,teamOppOppPointsAgainst;
							
							var teamPowerRank;
							
							var trackGames,trackOpps,trackOppsOpps;				



					
                teamWins = [];
                teamLosses = [];
                teamAdjWins = [];
                teamAdjLosses = [];
                teamOppWins = [];
                teamOppLosses = [];
                teamOppOppWins = [];
                teamOppOppLosses = [];
                teamPointsFor = [];
                teamPointsAgainst = [];
                teamAdjPointsFor = [];
                teamAdjPointsAgainst = [];
                teamOppPointsFor = [];
                teamOppPointsAgainst = [];
                teamOppOppPointsFor = [];
                teamOppOppPointsAgainst = [];
                trackGames = [];
                trackOpps = [];
                trackOppsOpps = [];
                teamSchedule = [];
				
                teamSOS = [];
                teamRPI = [];
                teamPowerRank = [];

				
                for (i = 0; i < g.numTeams; i++) {
					teamWins[i] = [];
					teamLosses[i] = [];
					teamAdjWins[i] = [];
					teamAdjLosses[i] = [];
					teamOppWins[i] = [];
					teamOppLosses[i] = [];
					teamOppOppWins[i] = [];
					teamOppOppLosses[i] = [];					
					teamPointsFor[i] = [];
					teamPointsAgainst[i] = [];
					teamAdjPointsFor[i] = [];
					teamAdjPointsAgainst[i] = [];
					teamOppPointsFor[i] = [];
					teamOppPointsAgainst[i] = [];
					teamOppOppPointsFor[i] = [];
					teamOppOppPointsAgainst[i] = [];
					teamSOS[i] = [];
					teamRPI[i] = [];
					teamPowerRank[i] = [];					
					trackGames[i] = [];					
					trackOpps[i] = [];
					trackOppsOpps[i] = [];
					teamSchedule[i] = [];
					teamWins[i] = 0;
					teamLosses[i] = 0;					
					teamAdjWins[i] = 0;
					teamAdjLosses[i] = 0;
					teamOppWins[i] = 0;
					teamOppLosses[i] = 0;
					teamOppOppWins[i] = 0;
					teamOppOppLosses[i] = 0;					
					teamPointsFor[i] = 0;
					teamPointsAgainst[i] = 0;
					teamAdjPointsFor[i] = 0;
					teamAdjPointsAgainst[i] = 0;
					teamOppPointsFor[i] = 0;
					teamOppPointsAgainst[i] = 0;
					teamOppOppPointsFor[i] = 0;
					teamOppOppPointsAgainst[i] = 0;		
					trackGames[i] = 0;					
					trackOpps[i] = 0;
					trackOppsOpps[i] = 0;
					teamSOS[i] = 0;
					teamRPI[i] = 0;
					teamPowerRank[i] = 0;						
                }				
				
				

                for (i = 0; i < game.length; i++) {

					teamWins[game[i].won.tid] += 1;
					teamLosses[game[i].lost.tid] += 1;
					teamPointsFor[game[i].won.tid] += game[i].won.pts;
					teamPointsFor[game[i].lost.tid] += game[i].lost.pts;
					teamPointsAgainst[game[i].won.tid] += game[i].lost.pts;
					teamPointsAgainst[game[i].lost.tid] += game[i].won.pts;
					trackGames[game[i].won.tid] += 1;
					trackGames[game[i].lost.tid] += 1;
		        }
                for (i = 0; i < g.numTeams; i++) {
				    if (trackGames[i]> 0) {
						teamPointsFor[i] /= trackGames[i];
						teamPointsAgainst[i] /= trackGames[i];
					}
				}
				//// now track Opp
				//// and OppOpp
				
		
				//// now gather opponent data
                for (i = 0; i < g.numTeams; i++) {
					for (j = 0; j < game.length; j++) {
						if (i===game[j].won.tid) {
							teamOppPointsFor[i] += teamPointsFor[game[j].lost.tid];						   
							teamOppPointsAgainst[i] += teamPointsAgainst[game[j].lost.tid];		
							teamOppLosses[i] += teamLosses[game[j].lost.tid];
							teamOppWins[i] += teamWins[game[j].lost.tid];
							trackOpps[i] += 1;							
						} else if (i===game[j].lost.tid) {
							teamOppPointsFor[i] += teamPointsFor[game[j].won.tid];						
							teamOppPointsAgainst[i] += teamPointsAgainst[game[j].won.tid];						   
							teamOppLosses[i] += teamLosses[game[j].won.tid];
							teamOppWins[i] += teamWins[game[j].won.tid];
							trackOpps[i] += 1;								
						}				
					}				
				}
				
                for (i = 0; i < g.numTeams; i++) {
				    if (trackOpps[i]> 0) {
						teamOppPointsFor[i] /= trackOpps[i];
						teamOppPointsAgainst[i] /= trackOpps[i];
					}
				}				
				

				//// now gather opponent opponent data
                for (i = 0; i < g.numTeams; i++) {
					for (j = 0; j < game.length; j++) {
						if (i===game[j].won.tid) {
							teamOppOppPointsFor[i] += teamOppPointsFor[game[j].lost.tid];						   
							teamOppOppPointsAgainst[i] += teamOppPointsAgainst[game[j].lost.tid];						   
							teamOppOppLosses[i] += teamOppLosses[game[j].lost.tid];
							teamOppOppWins[i] += teamOppWins[game[j].lost.tid];
							trackOppsOpps[i] += 1;							
						} else if (i===game[j].lost.tid) {
							teamOppOppPointsFor[i] += teamOppPointsFor[game[j].won.tid];						
							teamOppOppPointsAgainst[i] += teamOppPointsAgainst[game[j].won.tid];						   
							teamOppOppLosses[i] += teamOppLosses[game[j].won.tid];
							teamOppOppWins[i] += teamOppWins[game[j].won.tid];
							trackOppsOpps[i] += 1;							
						}				
					}				
				}				
				
                for (i = 0; i < g.numTeams; i++) {
				    if (trackOppsOpps[i]> 0) {
						teamOppOppPointsFor[i] /= trackOppsOpps[i];
						teamOppOppPointsAgainst[i] /= trackOppsOpps[i];
					}
				}						
		

					
				// need divsor
				// need to do by wins
                for (i = 0; i < g.numTeams; i++) {
					teamAdjWins[i] = teams[i].wonHome*.6+teams[i].wonAway*1.4
					teamAdjLosses[i] = teams[i].lostHome*1.4+teams[i].lostAway*.6
				//	console.log("RPI calc: "+teams[i].wonHome+" "+teams[i].wonAway+" "+teams[i].lostHome+" "+teams[i].lostAway);
					
				}				
				
				////now create SOS/RPI/PowerRank
                for (i = 0; i < g.numTeams; i++) {
					teams[i].SOS = ((teamOppWins[i]/(teamOppLosses[i]+teamOppWins[i]))*2+teamOppOppWins[i]/(teamOppOppLosses[i]+teamOppOppWins[i]))/3;
					teams[i].RPI = (teamAdjWins[i]/(teamAdjLosses[i]+teamAdjWins[i])+teams[i].SOS*3)/4;
			//		console.log("RPI calc: "+teamAdjWins[i]+" "+teamAdjLosses[i]+" "+teamAdjWins[i]+" "+teams[i].SOS);
					teams[i].power = (teamPointsFor[i]-teamPointsAgainst[i]+teamOppPointsFor[i]*2-teamOppPointsAgainst[i]*2+teamOppOppPointsFor[i]-teamOppOppPointsAgainst[i])/4;;	                       
				//	console.log("rank calc: "+teams[i].SOS+" "+teams[i].RPI+" "+teams[i].power);
				}				
						  
               // PERFORMANCE
                for (i = 0; i < g.numTeams; i++) {
                 //   playerValuesByTid[i] = [];
                    // Modulate point differential by recent record: +5 for 10-0 in last 10 and -5 for 0-10
                    teams[i].performance = teams[i].diff - 5 + 5 * (parseInt(teams[i].lastTen.split("-")[0], 10)) / 10;
                }						  
						  

                teams.sort(function (a, b) { return b.performance - a.performance; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].performanceRank = i + 1;
                }										  
						  
              teams.sort(function (a, b) { return b.SOS - a.SOS; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].SOSRank = i + 1;
                }				
                teams.sort(function (a, b) { return b.RPI - a.RPI; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].RPIRank = i + 1;
                }		
                teams.sort(function (a, b) { return b.power - a.power; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].powerRank = i + 1;
                }							  
						  
                for (i = 0; i < teams.length; i++) {
				//	console.log("rank calc: "+teams[i].SOSRank+" "+teams[i].RPIRank+" "+teams[i].powerRank);
                }							  
						  
						  
				teams.sort(function (b, a) { return b.powerRank - a.powerRank + b.RPIRank*.25 - a.RPIRank*.25 + b.performanceRank - a.performanceRank; });
		

				var atLargeMax, confChampMax;
//////////////////////						  
		

//////////////////////
				if (g.gameType == 0) {
					atLargeMax = 27;
					confChampMax = 5;
				} else if (g.gameType == 1) {						
					atLargeMax = 44;
					confChampMax = 20;
				} 
					
					
					// Add entry for wins for each team; delete winp, which was only needed for sorting
					for (i = 0; i < teams.length; i++) {
						teams[i].won = 0;
					}
			//        console.log("did it even get here? 2");
					tidPlayoffs = [];
					series = [[], [], [], [], [], []];  // First round, second round, third round, fourth round
		//            for (cid = 0; cid < 4; cid++) {
							   atLarge = 0;
							   champs = 0;
							   teamsConf = [];
								for (i = 0; i < teams.length; i++) {
		  //                      for (i = 0; i < 64; i++) {
							 //       console.log("i: "+i);
							//        console.log("teams[i].confChamp: "+teams[i].confChamp);
									if (teams[i].confChamp == 1) {
										champs += 1;
										teamsConf.push(teams[i]);
										tidPlayoffs.push(teams[i].tid);
							//	console.log("atLarge: "+atLarge+" CHAMPS: "+champs+" teams[i].tid: "+ teams[i].tid);
									} else if (atLarge < atLargeMax) {
										atLarge += 1;
										teamsConf.push(teams[i]);
										tidPlayoffs.push(teams[i].tid);
					//			console.log("ATLARGE: "+atLarge+" champs: "+champs+" teams[i].tid: "+ teams[i].tid);

									
									}
									if ((atLarge >= atLargeMax ) && (champs >= confChampMax)) {
//											if ((atLarge >= 108 ) && (champs >= 20)) {
										break;								
									}
								}
							//	console.log("atLarge: "+atLarge+" champs: "+champs);
							
						if (g.gameType == 0) {
										for (bracket = 0; bracket < 4; bracket++) {
								//		console.log("bracket: "+bracket);
											series[0][bracket * 4] = {home: teamsConf[3-bracket], away: teamsConf[8*4-4+bracket]};
											series[0][bracket * 4].away.seed = 8;
											series[0][bracket * 4].home.seed = 1;
											series[0][1 + bracket * 4] = {home: teamsConf[4*4-4+bracket], away: teamsConf[5*4-4+bracket]};
											series[0][1 + bracket * 4].away.seed = 5;
											series[0][1 + bracket * 4].home.seed = 4;
											series[0][2 + bracket * 4] = {home: teamsConf[3*4-4+bracket], away: teamsConf[6*4-4+bracket]};
											series[0][2 + bracket * 4].away.seed = 6;
											series[0][2 + bracket * 4].home.seed = 3;
											series[0][3 + bracket * 4] = {home: teamsConf[2*4-4+bracket], away: teamsConf[7*4-4+bracket]};
											series[0][3 + bracket * 4].away.seed = 7;
											series[0][3+ bracket * 4].home.seed = 2;
										}									
						} else if (g.gameType == 1) {						
									for (bracket = 0; bracket < 4; bracket++) {
							//		console.log("bracket: "+bracket);
										series[0][bracket * 8] = {home: teamsConf[3-bracket], away: teamsConf[16*4-4+bracket]};
										series[0][bracket * 8].away.seed = 16;
										series[0][bracket * 8].home.seed = 1;
										series[0][1 + bracket * 8] = {home: teamsConf[8*4-4+bracket], away: teamsConf[9*4-4+bracket]};
										series[0][1 + bracket * 8].away.seed = 9;
										series[0][1 + bracket * 8].home.seed = 8;
										series[0][2 + bracket * 8] = {home: teamsConf[4*4-4+bracket], away: teamsConf[13*4-4+bracket]};
										series[0][2 + bracket * 8].away.seed = 13;
										series[0][2 + bracket * 8].home.seed = 4;
										series[0][3 + bracket * 8] = {home: teamsConf[5*4-4+bracket], away: teamsConf[12*4-4+bracket]};
										series[0][3 + bracket * 8].away.seed = 12;
										series[0][3 + bracket * 8].home.seed = 5;
										series[0][4 + bracket * 8] = {home: teamsConf[6*4-4+bracket], away: teamsConf[11*4-4+bracket]};
										series[0][4 + bracket * 8].away.seed = 11;
										series[0][4 + bracket * 8].home.seed = 6;
										series[0][5 + bracket * 8] = {home: teamsConf[3*4-4+bracket], away: teamsConf[14*4-4+bracket]};
										series[0][5 + bracket * 8].away.seed = 14;
										series[0][5 + bracket * 8].home.seed = 3;
										series[0][6 + bracket * 8] = {home: teamsConf[7*4-4+bracket], away: teamsConf[10*4-4+bracket]};
										series[0][6 + bracket * 8].away.seed = 10;
										series[0][6 + bracket * 8].home.seed = 7;
										series[0][7 + bracket * 8] = {home: teamsConf[2*4-4+bracket], away: teamsConf[15*4-4+bracket]};
										series[0][7 + bracket * 8].away.seed = 15;
										series[0][7 + bracket * 8].home.seed = 2;
									}
						
						} 									
									
															
					
					tidPlayoffs.forEach(function (tid) {
						eventLog.add(null, {
							type: "playoffs",
							text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[tid], g.season]) + '">' + g.teamRegionsCache[tid] + '</a> made the <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">NT</a>.',
							showNotification: tid === g.userTid,
							tids: [tid]
						});
					});
					
					return Promise.all([
						dao.playoffSeries64.put({
							ot: tx,
							value: {
								season: g.season,
								currentRound: 0,
								series: series
							}
						}),									

							
						dao.teams.iterate({
							ot: tx,
							callback: function (t) {
								var teamSeason;

								teamSeason = t.seasons[t.seasons.length - 1];

								if (tidPlayoffs.indexOf(t.tid) >= 0) {
									t = team.addStatsRow(t, true);

									teamSeason.playoff64RoundsWon = 0;

									// More hype for making the playoffs
									teamSeason.hype *= 0.95;										
									teamSeason.hype += 0.05;
									if (teamSeason.hype > 1) {
										teamSeason.hype = 1;
									}
								} else {
									// Less hype for missing the playoffs
									teamSeason.hype *= 0.95;										
	//										teamSeason.hype -= 0.05;
									if (teamSeason.hype < 0) {
										teamSeason.hype = 0;
									}
								}

								return t;
							}
						})
					]);					

			});									
         }).then(function () {
            return Promise.all([
             //   finances.assessPayrollMinLuxury(tx),
                season.newSchedulePlayoffsDay64(tx)
            ]);
		}).then(function () {
			var url;			
			// Don't redirect if we're viewing a live game now
			if (location.pathname.indexOf("/live_game") === -1) {
				url = helpers.leagueUrl(["playoffs64"]);
			}			
			return [url, ["teamFinances"]];						
            //return newPhaseFinalize(g.PHASE.PLAYOFFS, url, ["teamFinances"]);
        });
    }		


	
			/*}).then(function () {
				return Promise.all([
//					finances.assessPayrollMinLuxury(tx),
					newSchedulePlayoffsDay64(tx)
				]);
			});



			return tx.complete().then(function () {
				var url;			
				// Don't redirect if we're viewing a live game now
				if (location.pathname.indexOf("/live_game") === -1) {
					url = helpers.leagueUrl(["playoffs64"]);
				}			
				return newPhaseFinalize(g.PHASE.PLAYOFFS64, url, ["teamFinances"]);
			});
		//	});						

    }			*/						
	
	
    function newPhaseBeforeDraft(tx) {
       // var tx;
			var playersLeft = [];	   
			var maxAge, minPot;
            var i,  tid;
        // Select winners of the season's awards
     //   return awards64(tx).then(function () {
         //   tx = dao.tx(["events", "messages", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");

            // Add award for each player on the championship team
        return team.filter({
                attrs: ["tid","cid"],
                seasonAttrs: ["playoff64RoundsWon","revenues"],
                season: g.season,
                ot: tx
           // });
        }).then(function (teams) {

			
			
			var playoffSuccess;
			var t;
			
			if (g.gameType == 0) { 

				playoffSuccess = [0,0, 0,0, 0];
			} else { 
				playoffSuccess = [0,0, 0,0, 0,0,0, 0,0, 0,0,0, 0,0, 0,0,0, 0,0, 0];
			}			
            for (i = 0; i < teams.length; i++) {				
				playoffSuccess[teams[i].cid] += teams[i].playoff64RoundsWon;
            }	
            for (i = 0; i < playoffSuccess.length; i++) {
				playoffSuccess[i] += 16;
            }	
			
            for (i = 0; i < teams.length; i++) {
				teams[i].revenues.nationalTv.amount += playoffSuccess[teams[i].cid]*1000;
			}
            dao.teams.iterate({
				ot: tx,
                callback: function (t) {			
						var tid;
						tid = t.tid;
						t.seasons[t.seasons.length - 1].revenues.nationalTv.amount += teams[tid].revenues.nationalTv.amount;
						t.seasons[t.seasons.length - 1].cash += teams[tid].revenues.nationalTv.amount;
						return t;
				}
			});

            // Give award to all players on the championship team
            for (i = 0; i < teams.length; i++) {
                if (teams[i].playoff64RoundsWon === 5+g.gameType) {
                    tid = teams[i].tid;
                    break;
                }
            }
            return dao.players.iterate({
                ot: tx,
                index: "tid",
                key: tid,
                callback: function (p) {
                    p.awards.push({season: g.season, type: "Won NT"});
                    return p;
                }
            });
        }).then(function () {	

            // Do annual tasks for each player, like checking for retirement

            // Players meeting one of these cutoffs might retire
			
			// high pot and high age mean you leave
            maxAge = 23;
            minPot = 40;
			//playersLeft.length = teams.length;
            for (i = 0; i < g.numTeams; i++) {				
				playersLeft.push(0);
            }				
			
            return dao.players.iterate({
                ot: tx,
                index: "tid",
//                key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                callback: function (p) {
                    var update;

                    update = false;

                    // Get player stats, used for HOF calculation
                    return dao.playerStats.getAll({
                        ot: tx,
                        index: "pid, season, tid",
                        key: IDBKeyRange.bound([p.pid], [p.pid, ''])
                    }).then(function (playerStats) {
                        var age, excessAge, excessPot, pot,ovr;
						var YWT;
						var ywtOrAge;
						
                        age = g.season - p.born.year;
                        pot = p.ratings[p.ratings.length - 1].pot;
                        ovr = p.ratings[p.ratings.length - 1].ovr;
						YWT = _.pluck(playerStats, "yearsWithTeam");
                        excessAge = 0;
                        excessAge = (age - 18) ;  // 1 for each year beyond 18
						if (g.gameType==0) {
							excessPot = ((pot-60)+(ovr-60)) / 9 - random.gauss(0, 1);  // 0.02 for each potential rating below 40 (this can be negative)									
						} else {									
							excessPot = ((pot-60)+(ovr-60)) / 16 - random.gauss(0, 1);  // 0.02 for each potential rating below 40 (this can be negative)									
						}
						if (excessPot<0) {
							excessPot = 0;
						}
						if (g.season == g.startingSeason) {
						  ywtOrAge = excessAge;
						} else if ((g.season == (g.startingSeason+1)) && (YWT[YWT.length-2]>1)) {
						  ywtOrAge = excessAge;
						} else if ((g.season == (g.startingSeason+2)) && (YWT[YWT.length-2]>2)) {
						  ywtOrAge = excessAge;
						} else {
						  ywtOrAge = YWT[YWT.length-2];								  
						}

						if ( ( excessPot)  > 4) {

							if ( (g.season == g.startingSeason) &&  (excessAge == 3) ) {									  
							  if (Math.random() > 0.85) {
								playersLeft[p.tid] += 1*ywtOrAge/4;
								p = player.retire(tx, p, playerStats);
								update = true;									  
							  }									
							} else if ( (g.season == g.startingSeason) && (excessAge == 2) ) {
							  if (Math.random() > 0.75) {
								playersLeft[p.tid] += 1*ywtOrAge/4;
								p = player.retire(tx, p, playerStats);
								update = true;									  
							  }									
							} else if ( (g.season == (g.startingSeason+1)) && ( (excessAge == 3)) ) {
							  if (Math.random() > 0.75) {
								playersLeft[p.tid] += 1*ywtOrAge/4;
								p = player.retire(tx, p, playerStats);
								update = true;									  
							  }
							
							} else if ( (g.season == g.startingSeason) && ( (excessAge == 1)) ) {																											
							  if (Math.random() > 0.25) {
								playersLeft[p.tid] += 1*ywtOrAge/4;
								p = player.retire(tx, p, playerStats);
								update = true;
							  }
							} else {
								playersLeft[p.tid] += 1*ywtOrAge/4;
								p = player.retire(tx, p, playerStats);
								update = true;
							}								
						} else if ( (excessAge)  > 3) {
							playersLeft[p.tid] += 1*ywtOrAge/4;
							p = player.retire(tx, p, playerStats);
							update = true;
						}
                        // Update "free agent years" counter and retire players who have been free agents for more than one years
                        if (p.tid === g.PLAYER.FREE_AGENT) {
                            p.yearsFreeAgent += 1;
                            p.contract.exp += 1;
                            p.contract.cre = g.season;							
                            update = true;
                        } else if (p.tid >= 0 && p.yearsFreeAgent > 0) {
                            p.yearsFreeAgent = 0;
                            update = true;
                        }
						//// eliminate contract amounts for all return players
						if  ( p.contract.amount > 0) {
							p.contract.amount = 0;
							update = true;
						}
                        // Heal injures
                        if (p.injury.type !== "Healthy") {
                            if (p.injury.gamesRemaining <= 22) {
                                p.injury = {type: "Healthy", gamesRemaining: 0};
                            } else {
                                p.injury.gamesRemaining -= 22;
                            }
                            update = true;
                        }

                        // Update player in DB, if necessary
                        if (update) {
                            return p;
                        }
                    });
                }
            });

          }).then(function () {
			// use key instead and put in above. just add 15k as it goes.
				dao.teams.iterate({
					ot: tx,
					callback: function (t) {	
						t.seasons[t.seasons.length - 1].revenues.merch.amount += 15000*playersLeft[t.tid];
						t.seasons[t.seasons.length - 1].cash += 15000*playersLeft[t.tid];
						return t;													
					}
				});		
          }).then(function () {
            // Remove released players' salaries from payrolls if their contract expired this year
            dao.releasedPlayers.iterate({
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
            // Set daysLeft here because this is "basically" free agency, so some functions based on daysLeft need to treat it that way (such as the trade AI being more reluctant)
            return require("core/league").setGameAttributes(tx, {daysLeft: 30});			
        }).then(function () {
            var url;
           // Don't redirect if we're viewing a live game now
            if (location.pathname.indexOf("/live_game") === -1) {
                url = helpers.leagueUrl(["history64"]);
            }

            helpers.bbgmPing("season");

            return [url, ["playerMovement"]];
        });
    }					

                // Don't redirect if we're viewing a live game now
            /*    if (location.pathname.indexOf("/live_game") === -1) {
                    url = helpers.leagueUrl(["history64"]);
                }

                return newPhaseFinalize(g.PHASE.BEFORE_DRAFT, url, ["playerMovement"]);
            }).then(function () {
                helpers.bbgmPing("season");
            });
        });
    }*/

    function newPhaseDraft(tx) {

		

	
		return [helpers.leagueUrl(["free_agents"])];
		/*
        return newPhaseFreeAgency().then(function () {
        }).then(function () {
              return newPhaseFinalize(g.PHASE.FREE_AGENCY, helpers.leagueUrl(["free_agents"]), ["playerMovement"]);		
        });*/
    }
    function newPhaseAfterDraft(tx) {
        var promises, round, tid;

        promises = [];

        // Add a new set of draft picks
        for (tid = 0; tid < g.numTeams; tid++) {
            for (round = 1; round <= 2; round++) {
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

	//	console.log("g.phase: "+ g.phase);
        // Achievements after playoffs
        account.checkAchievement.hardware_store();
					
        account.checkAchievement.fo_fo_fo();
        account.checkAchievement["98_degrees"]();
        account.checkAchievement.dynasty();
        account.checkAchievement.dynasty_2();
        account.checkAchievement.dynasty_3();
        account.checkAchievement.moneyball();
        account.checkAchievement.moneyball_2();
        
        account.checkAchievement.sleeper_pick();		
		
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

							//// shouldn't be needed
                            if (p.contract.exp <= g.season && (g.userTids.indexOf(p.tid) < 0 || g.autoPlaySeasons > 0)) {
                                // Automatically negotiate with teams
                                if (strategies[p.tid] === "rebuilding") {
                                    factor = 0.4;
                                } else {
                                    factor = 0;
                                }

                                if (Math.random() < p.value / 100 - factor) { // Should eventually be smarter than a coin flip
								// See also core.team
                                    contract = player.genContract(p);
                                    contract.exp += 1; // Otherwise contracts could expire this season
								//	console.log("shouldn't ever get here");
                                    p = player.setContract(p, contract, true);
                                    p.gamesUntilTradable = 15;
                                    eventLog.add(null, {
                                        type: "reSigned",
                                        text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamNamesCache[p.tid] + '</a> re-signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>.',
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
console.log("bumped?");				
                dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: g.PLAYER.UNDRAFTED_2,
                    callback: function (p) {
                        p.tid = g.PLAYER.UNDRAFTED;
                        p.ratings[0].fuzz /= 2;
                        return p;
                    }
                }).then(function () {
                    dao.players.iterate({
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
//                return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3);
console.log("players generated?");
					return team.filter({
							ot: tx,					
							attrs: ["tid","city","state","longitude","latitude"],
							seasonAttrs: ["pop"],
							season: g.season
					}).then(function (t) {	
console.log("players generated?");					
//						return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3).then(function() {
						return draft.genPlayers(tx, g.PLAYER.UNDRAFTED_3,null,null,t).then(function() {
				
				
					
				
						});
				
					});					
				
				
				
            }).then(function () {
                //return newPhaseFinalize(g.PHASE.FREE_AGENCY, helpers.leagueUrl(["free_agents"]), ["playerMovement"]);
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
    //}


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
//						phaseChangeTx = dao.tx(["gameAttributes", "messages", "schedule"], "readwrite");
						phaseChangeTx = dao.tx(["gameAttributes", "messages", "schedule","teams","players"], "readwrite");
						return newPhaseRegularSeason(phaseChangeTx);
					}
					if (phase === g.PHASE.AFTER_TRADE_DEADLINE) {
						return newPhaseAfterTradeDeadline();
					}
					if (phase === g.PHASE.PLAYOFFS) {
						phaseChangeTx = dao.tx(["players", "playerStats", "playoffSeries", "releasedPlayers", "schedule", "teams"], "readwrite");
						return newPhasePlayoffs(phaseChangeTx);
					}
				   if (phase === g.PHASE.BEFORE_PLAYOFFS64) {
						phaseChangeTx = dao.tx(["awards","events", "messages", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");

						return newPhaseBeforePlayoff64(phaseChangeTx);
					}
					if (phase === g.PHASE.PLAYOFFS64) {					
					    phaseChangeTx = dao.tx(["games","players", "playerStats","playoffSeries64", "releasedPlayers", "schedule", "teams"], "readwrite");		
//					    phaseChangeTx = dao.tx(["games","players", "playerStats", "playoffSeries64", "releasedPlayers", "schedule", "teams"], "readwrite");		
//					    phaseChangeTx = dao.tx(["games","players", "playerStats", "releasedPlayers", "schedule", "teams"], "readwrite");		
//					    phaseChangeTx = dao.tx(["players", "playerStats", "releasedPlayers", "schedule", "teams"], "readwrite");		
//					    phaseChangeTx = dao.tx(["teams"], "readwrite");		
						return newPhasePlayoffs64(phaseChangeTx);
						//return;
					}			
					if (phase === g.PHASE.BEFORE_DRAFT) {
						phaseChangeTx = dao.tx(["awards", "events", "gameAttributes", "messages", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");
						return newPhaseBeforeDraft(phaseChangeTx);
					}
					//if (phase === g.PHASE.DRAFT) {
					////	phaseChangeTx = dao.tx(["draftPicks", "draftOrder", "gameAttributes", "players", "teams"], "readwrite");
					//	return newPhaseDraft(phaseChangeTx);
					//}
					//if (phase === g.PHASE.AFTER_DRAFT) {
					//	phaseChangeTx = dao.tx(["draftPicks", "gameAttributes"], "readwrite");
					//	return newPhaseAfterDraft(phaseChangeTx);
					//}
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
                 //   return phaseChangeTx.complete().then(function () {
                        return finalize(phase, url, updateEvents);
                 //   });
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