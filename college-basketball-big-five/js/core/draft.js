/**
 * @name core.draft
 * @namespace The annual draft of new prospects.
 */
define(["dao", "globals", "ui", "core/finances", "core/player", "core/team", "lib/bluebird", "util/helpers", "util/random"], function (dao, g, ui, finances, player, team, Promise, helpers, random) {
    "use strict";

    /**
     * Retrieve the current remaining draft order.
     *
     * @memberOf core.draft
     * @return {Promise} Resolves to an ordered array of pick objects.
     */
    function getOrder() {
        return dao.draftOrder.get({key: 0}).then(function (row) {
            return row.draftOrder;
        });
    }

    /**
     * Save draft order for future picks to the database.
     *
     * @memberOf core.draft
     * @param {Array.<Object>} draftOrder Ordered array of pick objects, as generated by genOrder.
     * @return {Promise}
     */
    function setOrder(draftOrder) {
        var tx;

        tx = dao.tx("draftOrder", "readwrite");
        dao.draftOrder.put({
            ot: tx,
            value: {
                rid: 0,
                draftOrder: draftOrder
            }
        });
        return tx.complete();
    }

	
	
//				return team.filter({
		function genMiles(p) {
		
//		return team.filter({
		team.filter({
				attrs: ["tid","city","state","longitude","latitude"],
				seasonAttrs: ["pop"],
				season: g.season
	//		});
		}).then(function (t) {		
	//	});

			var t3,lat1,lon1,lat2,lon2,R,a,kilometers;
			for (t3 = 0; t3 < t.length; t3++) {							

				lat1 = 	t[t3].latitude;			
				lon1 = 	t[t3].longitude;			
				lat2 = 	p.latitude;								
				lon2 = 	p.longitude;	
				R = 6371;								
				a = 0.5 - Math.cos((lat2 - lat1) * Math.PI / 180)/2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *  (1 - Math.cos((lon2 - lon1) * Math.PI / 180))/2;
				
				kilometers = R * 2 * Math.asin(Math.sqrt(a));
				p.miles[t3] = 0.621371*kilometers;
			}					
		   return (p);
		//	console.log("p1.miles: "+p.miles);
		//// for team
		//	return(p);
				});		
		};	
	
	
    /**
     * Generate a set of draft prospects.
     *
     * This is called after draft classes are moved up a year, to create the new UNDRAFTED_3 class. It's also called 3 times when a new league starts, to create all 3 draft classes.
     *
     * @memberOf core.draft
     * @param {IDBTransaction|null} ot An IndexedDB transaction on players (and teams if scoutingRank is not set), readwrite; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID number for the generated draft class. Should be g.PLAYER.UNDRAFTED, g.PLAYER.UNDRAFTED_2, or g.PLAYER.UNDRAFTED_3.
     * @param {?number=} scoutingRank Between 1 and g.numTeams, the rank of scouting spending, probably over the past 3 years via core.finances.getRankLastThree. If null, then it's automatically found.
     * @param {?number=} numPlayers The number of prospects to generate. Default value is 70.
     * @return {Promise}
     */
    function genPlayers(ot, tid, scoutingRank, numPlayers,t) {
        scoutingRank = scoutingRank !== undefined ? scoutingRank : null;

		
		
		
        if (numPlayers === null || numPlayers === undefined) {
//            numPlayers = Math.round(120 * g.numTeams / 32); // 70 scaled by number of teams
            numPlayers = Math.round(150 * g.numTeams / 32); // 70 scaled by number of teams
        }
     //   console.log("numPlayers: "+numPlayers);
       return Promise.try(function () {
            if (scoutingRank === null) {
				if (t === null) {
					scoutingRank = (1+g.numTeams)/2;
				} else {
					return dao.teams.get({ot: ot, key: g.userTid}).then(function (t) {
						return finances.getRankLastThree(t, "expenses", "scouting");
					});					
				}
            } 

            return scoutingRank;
        }).then(function (scoutingRank) {
	
            var agingYears, baseAge, baseRating, draftYear, i, p, pot, profile, profiles, promises;

            profiles = ["Point", "Wing", "Big", "Big", ""];

            promises = [];

	///////////		
//	 var t;

		///////////	
		//	console.log("numPlayers: "+numPlayers);
            for (i = 0; i < numPlayers; i++) {			 
      //  console.log("i: "+i);
	 	  
	  
//                baseRating = random.randInt(8, 31);
				if (Math.random() <.40) {

					baseRating = random.randInt(8, 61);
	//                pot = Math.round(helpers.bound(random.realGauss(48, 17), baseRating, 90));
	//                pot = Math.round(helpers.bound(random.realGauss(48, 34), baseRating, 90));
					pot = Math.round(helpers.bound(random.realGauss(40, 34), baseRating, 90));

				} else {
					baseRating = random.randInt(0, 15);
	//                pot = Math.round(helpers.bound(random.realGauss(48, 17), baseRating, 90));
	//                pot = Math.round(helpers.bound(random.realGauss(48, 34), baseRating, 90));
					pot = Math.round(helpers.bound(random.realGauss(15, 10), baseRating, 90));

				
				}
                profile = profiles[random.randInt(0, profiles.length - 1)];
                agingYears = 0;
//                agingYears = random.randInt(0, 3);
                draftYear = g.season;

                baseAge = 18;
//                if (g.season === g.startingSeason && g.phase < g.PHASE.DRAFT) {
                if (g.season === g.startingSeason && g.phase < g.PHASE.PLAYOFFS) {
				
                    // New league, creating players for draft in same season and following 2 seasons
                    if (tid === g.PLAYER.UNDRAFTED_2) {
                        baseAge -= 1;
                        draftYear += 1;
                    } else if (tid === g.PLAYER.UNDRAFTED_3) {
                        baseAge -= 2;
                        draftYear += 2;
                    }
                } else if (tid === g.PLAYER.UNDRAFTED_3) {
       // console.log("g.PLAYER.UNDRAFTED_3");
                    // Player being generated after draft ends, for draft in 3 years
//                    baseAge -= 3;
                    baseAge -= 3;
//                    draftYear += 3;
                    draftYear += 3;
//                    draftYear += 2;
                }
            //   scoutingRank = 15;
                p = player.generate(tid, baseAge, profile, baseRating, pot, draftYear, false, scoutingRank);
                p = player.develop(p, agingYears, true);
			//	console.log("test genplayer");
				
			/*from roster.js 268
			    players = player.filter(players, {
                            attrs: attrs,
                            ratings: ratings,
                            stats: stats,
                            season: inputs.season,
                            tid: inputs.tid,
                            showNoStats: true,
                            showRookies: true,
                            fuzz: true,
                            numGamesRemaining: numGamesRemaining
                        }); */
			
			/*	t = team.filter(t, {
    						attrs: ["tid","city","state","longitude","latitude"],
							seasonAttrs: ["pop"],
							season: g.season
                        });			
			
			console.log("t[0].latitude: "+t[0].latitude);
			console.log("t[0].longitude: "+t[0].longitude);
			console.log("t[1].latitude: "+t[1].latitude);
			console.log("t[1].longitude: "+t[1].longitude); */
				/*	team.filter({
							attrs: ["tid","city","state","longitude","latitude"],
							seasonAttrs: ["pop"],
							season: g.season
					}).then(function (t) {		*/

						var t3,lat1,lon1,lat2,lon2,R,a,kilometers;
	//					for (t3 = 0; t3 < t.length; t3++) {							
						for (t3 = 0; t3 < g.numTeams; t3++) {							


						    if (typeof(g.teamLatitudeCache) != "undefined") {
								lat1 = 	g.teamLatitudeCache[t3];			
								lon1 = 	g.teamLongitudeCache[t3];											
							} else {
								lat1 = 	t[t3].latitude;			
								lon1 = 	t[t3].longitude;								
							}		
							lat2 = 	p.latitude;								
							lon2 = 	p.longitude;	
							R = 6371;								
							a = 0.5 - Math.cos((lat2 - lat1) * Math.PI / 180)/2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *  (1 - Math.cos((lon2 - lon1) * Math.PI / 180))/2;
							
							kilometers = R * 2 * Math.asin(Math.sqrt(a));
							p.miles[t3] = 0.621371*kilometers;
						}					
				//		console.log("p1.miles: "+p.miles);
					//});		

		
				//	console.log("p2.miles: "+p.miles);
				
                // Update player values after ratings changes
                promises.push(player.updateValues(ot, p, []).then(function (p) {
		//		    console.log("saved");
                    return dao.players.put({ot: ot, value: p});
                }));
				
            }
		
//////////////	

//console.log("after new players put");
					//////////////
			

            return Promise.all(promises);
        });
		
		

    }

    /**
     * Sets draft order and save it to the draftOrder object store.
     *
     * This is currently based on an NBA-like lottery, where the first 3 picks can be any of the non-playoff teams (with weighted probabilities).
     *
     * @memberOf core.draft
     * @return {Promise}
     */
    function genOrder() {
        return team.filter({
            attrs: ["tid", "cid"],
            seasonAttrs: ["winp", "playoffRoundsWon"],
            season: g.season
        }).then(function (teams) {
            var chances, draw, firstThree, i, pick;

			// console.log("genOrder");
            // Sort teams by making playoffs (NOT playoff performance) and winp, for first round
            teams.sort(function (a, b) {
                if ((a.playoffRoundsWon >= 0) && !(b.playoffRoundsWon >= 0)) {
                    return 1;
                }
                if (!(a.playoffRoundsWon >= 0) && (b.playoffRoundsWon >= 0)) {
                    return -1;
                }
                return a.winp - b.winp;
            });

            // Draft lottery
            chances = [250, 199, 156, 119, 88, 63, 43, 28, 17, 11, 8, 7, 6, 5];
            // cumsum
            for (i = 1; i < chances.length; i++) {
                chances[i] = chances[i] + chances[i - 1];
            }
            // Pick first three picks based on chances
            firstThree = [];
            while (firstThree.length < 3) {
 //           while (firstThree.length < 0) {
                draw = random.randInt(1, 1000);
                for (i = 0; i < chances.length; i++) {
                    if (chances[i] > draw) {
                        break;
                    }
                }
                if (firstThree.indexOf(i) < 0) {
                    firstThree.push(i);
                }
            }

            return dao.draftPicks.getAll({
                index: "season",
                key: g.season
            }).then(function (draftPicks) {
                var draftOrder, draftPicksIndexed, i, tid, tx;

                // Reorganize this to an array indexed on originalTid and round
                draftPicksIndexed = [];
 //               for (i = 0; i < 0; i++) {
                for (i = 0; i < draftPicks.length; i++) {
                    tid = draftPicks[i].originalTid;
                    // Initialize to an array
                    if (draftPicksIndexed.length < tid || draftPicksIndexed[tid] === undefined) {
                        draftPicksIndexed[tid] = [];
                    }
                    draftPicksIndexed[tid][draftPicks[i].round] = {
                        tid: draftPicks[i].tid
                    };
                }

                draftOrder = [];
                // First round - lottery winners
                for (i = 0; i < firstThree.length; i++) {
                    tid = draftPicksIndexed[teams[firstThree[i]].tid][1].tid;
                    draftOrder.push({
                        round: 1,
                        pick: i + 1,
                        tid: tid,
                        originalTid: teams[firstThree[i]].tid
                    });
                }

                // First round - everyone else
                pick = 4;
                for (i = 0; i < teams.length; i++) {
                    if (firstThree.indexOf(i) < 0) {
                        tid = draftPicksIndexed[teams[i].tid][1].tid;
                        draftOrder.push({
                            round: 1,
                            pick: pick,
                            tid: tid,
                            originalTid: teams[i].tid
                        });
                        pick += 1;
                    }
                }

                // Sort teams by winp only, for second round
                teams.sort(function (a, b) { return a.winp - b.winp; });

                // Second round
                for (i = 0; i < teams.length; i++) {
                    tid = draftPicksIndexed[teams[i].tid][2].tid;
                    draftOrder.push({
                        round: 2,
                        pick: i + 1,
                        tid: tid,
                        originalTid: teams[i].tid
                    });
                }

                // Delete from draftPicks object store so that they are completely untradeable
                tx = dao.tx("draftPicks", "readwrite");
                for (i = 0; i < draftPicks.length; i++) {
                    dao.draftPicks.delete({
                        ot: tx,
                        key: draftPicks[i].dpid
                    });
                }

                return tx.complete().then(function () {
                    return setOrder(draftOrder);
                });
            });
        });
    }

    /**
     * Sets fantasy draft order and save it to the draftOrder object store.
     *
     * Randomize team order and then snake for 12 rounds.
     *
     * @memberOf core.draft
     * @return {Promise}
     */
    function genOrderFantasy(position) {
        var draftOrder, i, round, tids;

        // Randomly-ordered list of tids
        tids = [];
        for (i = 0; i < g.numTeams; i++) {
            tids.push(i);
        }
        random.shuffle(tids);
        if (position >= 1 && position <= g.numTeams) {
            i = 0;
            while (tids[position - 1] !== g.userTid && i < 1000) {
                random.shuffle(tids);
                i += 1;
            }
        }

        // Set total draft order: 12 rounds, snake
        draftOrder = [];
        for (round = 1; round <= 12; round++) {
            for (i = 0; i < tids.length; i++) {
                draftOrder.push({
                    round: round,
                    pick: i + 1,
                    tid: tids[i],
                    originalTid: tids[i]
                });
            }

            tids.reverse(); // Snake
        }

        return setOrder(draftOrder);
    }

    /**
     * Get a list of rookie salaries for all players in the draft.
     *
     * By default there are 60 picks, but some are added/removed if there aren't 30 teams.
     *
     * @memberOf core.draft
     * @return {Array.<number>} Array of salaries, in thousands of dollars/year.
     */
    function getRookieSalaries() {
        var rookieSalaries;
       // console.log("rookieSalaries");
        // Default for 60 picks
        rookieSalaries = [5000, 4500, 4000, 3500, 3000, 2750, 2500, 2250, 2000, 1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200, 1100, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500];

        while (g.numTeams * 2 > rookieSalaries.length) {
            // Add min contracts on to end
            rookieSalaries.push(500);
        }
        while (g.numTeams * 2 < rookieSalaries.length) {
            // Remove smallest salaries
            rookieSalaries.pop();
        }

        return rookieSalaries;
    }

    /**
     * Select a player for the current drafting team.
     *
     * This can be called in response to the user clicking the "draft" button for a player, or by some other function like untilUserOrEnd.
     *
     * @memberOf core.draft
     * @param {object} pick Pick object, like from getOrder, that contains information like the team, round, etc.
     * @param {number} pid Integer player ID for the player to be drafted.
     * @return {Promise}
     */
    function selectPlayer(pick, pid) {
        var tx;

        tx = dao.tx(["players", "playerStats"], "readwrite");
      //  console.log("selectPlayer");
        dao.players.get({
            ot: tx,
            key: pid
        }).then(function (p) {
            var i, rookieSalaries, years;

            // Draft player
            p.tid = pick.tid;
            if (g.phase !== g.PHASE.FANTASY_DRAFT) {
			
                p.draft = {
                    round: pick.round,
                    pick: pick.pick,
                    tid: pick.tid,
                    year: g.season,
                    originalTid: pick.originalTid,
                    pot: p.ratings[0].pot,
                    ovr: p.ratings[0].ovr,
                    skills: p.ratings[0].skills
                }; 
            }

            // Contract
            if (g.phase !== g.PHASE.FANTASY_DRAFT) {
                rookieSalaries = getRookieSalaries();
                i = pick.pick - 1 + g.numTeams * (pick.round - 1);
                years = 4 - pick.round;  // 2 years for 2nd round, 3 years for 1st round;
                p = player.setContract(p, {
                    amount: rookieSalaries[i],
                    exp: g.season + years
                }, true); 
            }

            // Add stats row if necessary (fantasy draft in ongoing season)
            if (g.phase === g.PHASE.FANTASY_DRAFT && g.nextPhase <= g.PHASE.PLAYOFFS) {
                p = player.addStatsRow(tx, p, g.nextPhase === g.PHASE.PLAYOFFS);
            }

            dao.players.put({ot: tx, value: p});
        });

        return tx.complete();
    }

    /**
     * Simulate draft picks until it's the user's turn or the draft is over.
     *
     * This could be made faster by passing a transaction around, so all the writes for all the picks are done in one transaction. But when calling selectPlayer elsewhere (i.e. in testing or in response to the user's pick), it needs to be sure that the transaction is complete before continuing. So I would need to create a special case there to account for it. Given that this isn't really *that* slow now, that probably isn't worth the complexity. Although... team.rosterAutoSort does precisely this... so maybe it would be a good idea...
     *
     * @memberOf core.draft
     * @return {Promise.[Array.<Object>, Array.<number>]} Resolves to array. First argument is the list of draft picks (from getOrder). Second argument is a list of player IDs who were drafted during this function call, in order.
     */
    function untilUserOrEnd() {
        var pids;

        pids = [];
      //  console.log("untilUserOrEnd");
        return Promise.all([
            dao.players.getAll({
                index: "tid",
                key: g.PLAYER.UNDRAFTED
            }),
            getOrder()
        ]).spread(function (playersAll, draftOrder) {
            var afterDoneAuto, autoSelectPlayer, pick, pid, selection;

            playersAll.sort(function (a, b) { return b.value - a.value; });

            // Called after either the draft is over or it's the user's pick
            afterDoneAuto = function (draftOrder, pids) {
                return setOrder(draftOrder).then(function () {
                    var season, tx;

                    // Is draft over?;
                    if (draftOrder.length === 0) {
                        season = require("core/season"); // Circular reference

                        // Fantasy draft special case!
                        if (g.phase === g.PHASE.FANTASY_DRAFT) {
                            tx = dao.tx(["players", "teams"], "readwrite");

                            // Undrafted players become free agents
                            return player.genBaseMoods(tx).then(function (baseMoods) {
                                return dao.players.iterate({
                                    ot: tx,
                                    index: "tid",
                                    key: g.PLAYER.UNDRAFTED,
                                    callback: function (p) {
                                        return player.addToFreeAgents(tx, p, g.PHASE.FREE_AGENCY, baseMoods);
                                    }
                                });
                            }).then(function () {
                                // Swap back in normal draft class
                                return dao.players.iterate({
                                    ot: tx,
                                    index: "tid",
                                    key: g.PLAYER.UNDRAFTED_FANTASY_TEMP,
                                    callback: function (p) {
                                        p.tid = g.PLAYER.UNDRAFTED;

                                        return p;
                                    }
                                });
                            }).then(function () {
                                return require("core/league").setGameAttributes({
                                    lastDbChange: Date.now(),
                                    phase: g.nextPhase,
                                    nextPhase: null
                                }).then(function () {
                                    ui.updatePhase(g.season + season.phaseText[g.phase]);
                                    return ui.updatePlayMenu(null).then(function () {
                                        return pids;
                                    });
                                });
                            });
                        }

                        // Non-fantasy draft
                        return season.newPhase(g.PHASE.AFTER_DRAFT).then(function () {
                            return pids;
                        });
                    }

                    // Draft is not over, so continue
                    return require("core/league").setGameAttributes({lastDbChange: Date.now()}).then(function () {
                        return pids;
                    });
                });
            };

            // This will actually draft "untilUserOrEnd"
            autoSelectPlayer = function () {
                if (draftOrder.length > 0) {
                    pick = draftOrder.shift();

                    // noAutoPick is for people who want to switch to each AI team and control
                    // their selection, like someone manually running a multiplayer league.
                    // Eventually this should have a better implementation.
                    if (pick.tid === g.userTid || localStorage.noAutoPick) {
                        draftOrder.unshift(pick);
                        return afterDoneAuto(draftOrder, pids);
                    }

                    selection = Math.floor(Math.abs(random.gauss(0, 2)));  // 0=best prospect, 1=next best prospect, etc.
                    pid = playersAll[selection].pid;
                    return selectPlayer(pick, pid).then(function () {
                        pids.push(pid);
                        playersAll.splice(selection, 1);  // Delete from the list of undrafted players

                        return autoSelectPlayer();
                    });
                }

                return afterDoneAuto(draftOrder, pids);
            };

            return autoSelectPlayer();
        });
    }

    return {
        getOrder: getOrder,
        setOrder: setOrder,
        genPlayers: genPlayers,
        genMiles: genMiles,
        genOrder: genOrder,
        genOrderFantasy: genOrderFantasy,
        untilUserOrEnd: untilUserOrEnd,
        getRookieSalaries: getRookieSalaries,
        selectPlayer: selectPlayer
    };
});
