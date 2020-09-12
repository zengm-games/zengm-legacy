/**
 * @name core.league
 * @namespace Creating and removing leagues.
 */
define(["dao", "db", "globals", "ui", "core/champion", "data/championPatch", "data/champions2", "core/draft", "core/finances", "core/phase", "core/player", "core/team", "lib/bluebird", "lib/jquery", "lib/underscore", "util/helpers", "util/random"], function (dao, db, g, ui,champion,championPatch,champions, draft, finances, phase, player, team, Promise, $, _, helpers, random) {
    "use strict";

    // x and y are both arrays of objects with the same length. For each object, any properties in y but not x will be copied over to x.
    function merge(x, y) {
        var i, prop;

        for (i = 0; i < x.length; i++) {
            // Fill in default values as needed
            for (prop in y[i]) {
                if (y[i].hasOwnProperty(prop) && !x[i].hasOwnProperty(prop)) {
                    x[i][prop] = y[i][prop];
                }
            }
        }

        return x;
	}

    function mergeWorlds(x, y) {
        var i, prop;

        for (i = 0; i < x.length; i++) {
            // Fill in default values as needed
            for (prop in y[i]) {
                if (y[i].hasOwnProperty(prop) && !x[i].hasOwnProperty(prop)) {
                    x[i][prop] = y[i][prop];
                }
            }
        }

        return x;
    }

    /**
     * Set values in the gameAttributes objectStore and update the global variable g.
     *
     * Items stored in gameAttributes are globally available through the global variable g. If a value is a constant across all leagues/games/whatever, it should just be set in globals.js instead.
     *
     * @param {Object} gameAttributes Each property in the object will be inserted/updated in the database with the key of the object representing the key in the database.
     * @returns {Promise} Promise for when it finishes.
     */
    function setGameAttributes(tx, gameAttributes) {
        var key, toUpdate;

        tx = dao.tx("gameAttributes", "readwrite", tx);


        toUpdate = [];
        for (key in gameAttributes) {
            if (gameAttributes.hasOwnProperty(key)) {
                if (g[key] !== gameAttributes[key]) {
                    toUpdate.push(key);
                }
            }
        }

        return Promise.map(toUpdate, function (key) {


            return dao.gameAttributes.put({
                ot: tx,
                value: {
                    key: key,
                    value: gameAttributes[key]
                }
            }).then(function () {
                g[key] = gameAttributes[key];

                if (key === "userTid" || key === "userTids") {
                    g.vm.multiTeam[key](gameAttributes[key]);
                }
            }).then(function () {
                // Trigger a signal for the team finances view. This is stupid.
                if (key === "gamesInProgress") {
                    if (gameAttributes[key]) {
                        $("#finances-settings, #free-agents, #live-games-list").trigger("gameSimulationStart");
                    } else {
                        $("#finances-settings, #free-agents, #live-games-list").trigger("gameSimulationStop");
                    }
                }
            });
        });
    }

    // Calls setGameAttributes and ensures transaction is complete. Otherwise, manual transaction managment would always need to be there like this
    function setGameAttributesComplete(gameAttributes) {
        var tx;

		//console.log(gameAttributes);
        tx = dao.tx("gameAttributes", "readwrite");
        setGameAttributes(tx, gameAttributes);
        return tx.complete();
    }

    // Call this after doing DB stuff so other tabs know there is new data.
    // Runs in its own transaction, shouldn't be waited for because this only influences other tabs
    function updateLastDbChange() {
        setGameAttributes(null, {lastDbChange: Date.now()});
    }

    /**
     * Create a new league.
     *
     * @memberOf core.league
     * @param {string} name The name of the league.
     * @param {number} tid The team ID for the team the user wants to manage (or -1 for random).
     */
    function create(name, tid,typeid,patchid, leagueFile, startingSeason, randomizeRosters) {
        var phaseText, skipNewPhase, teams,championLength,championPatchLength, teamsDefault;
		var conferences,divisions,ownerType;
		var regionType;
		var i;
		var minRosterSize;
		var adjLeagueFile = [];

        // Any user input?
        if (!leagueFile) {
            leagueFile = {}; // Allow checking of properties
        }

console.log(leagueFile);
        // Default teams
		//console.log(typeid);
		console.log(patchid);
        teamsDefault = helpers.getTeamsDefault();
		ownerType = random.randInt(0,6);

		if ((typeid == 1) || (typeid == -2)) {
			if (ownerType == 2) {

			} else if (ownerType < 5) {
				ownerType = 0;
			} else {
				ownerType = 2;

			}
		}

	    conferences = [{cid: 0, name: "League Championship Series"}, {cid: 1, name: "Challenger Series"}, {cid: 2, name: "Ladder"}];
		divisions = [{did: 0, cid: 0, name: "LCS"}, {did: 1, cid: 1, name: "CS"}, {did: 2, cid: 2, name: "L"}];


		//https://en.wikipedia.org/wiki/List_of_League_of_Legends_leagues_and_tournaments
        // Default teams
	    if (typeid == 0) {
			teamsDefault = helpers.getTeamsNADefault();
			conferences = [{cid: 0, name: "League Championship Series"}];
			divisions = [{did: 0, cid: 0, name: "LCS"}];
	    } else if (typeid == -1) {
			teamsDefault = helpers.getTeamsEUDefault();
			conferences = [{cid: 0, name: "League Championship Series"}];
			divisions = [{did: 0, cid: 0, name: "LCS"}];
		} else if ((typeid == 1) ) {
			teamsDefault = helpers.getTeamsDefault();
			conferences = [{cid: 0, name: "League Championship Series"}, {cid: 1, name: "Challenger Series"}, {cid: 2, name: "Ladder"}];
			divisions = [{did: 0, cid: 0, name: "LCS"}, {did: 1, cid: 1, name: "CS"}, {did: 2, cid: 2, name: "L"}];
		} else if ((typeid == -2) ) {
			teamsDefault = helpers.getTeamsDefaultEU();
			conferences = [{cid: 0, name: "League Championship Series"}, {cid: 1, name: "Challenger Series"}, {cid: 2, name: "Ladder"}];
			divisions = [{did: 0, cid: 0, name: "LCS"}, {did: 1, cid: 1, name: "CS"}, {did: 2, cid: 2, name: "L"}];
		} else if (typeid == 2) {
			teamsDefault = helpers.getTeamsLCKDefault();
			conferences = [{cid: 0, name: "League Champions Korea"}];
			divisions = [{did: 0, cid: 0, name: "LCK"}];
		} else if (typeid == 3) {
			teamsDefault = helpers.getTeamsLPLDefault();
			conferences = [{cid: 0, name: "Legends Pro League"}];
			divisions = [{did: 0, cid: 0, name: "LPL"}];

		} else if (typeid == 4) {
			teamsDefault = helpers.getTeamsLMSDefault();
			conferences = [{cid: 0, name: "League Masters Series"}];
			divisions = [{did: 0, cid: 0, name: "LMS"}];
		} else {
			teamsDefault = helpers.getTeamsWorldsDefault();
			conferences = [{cid: 0, name: "NA League Championship Series"}, {cid: 1, name: "EU League Championship Series"}, {cid: 2, name: "League Champions Korea"}, {cid: 3, name: "Legends Pro League"}, {cid: 4, name: "League Masters Series"}, {cid: 5, name: "League Wild Card Series"}];
			divisions = [{did: 0, cid: 0, name: "NA-LCS"}, {did: 1, cid: 1, name: "EU-LCS"}, {did: 2, cid: 2, name: "LCK"}, {did: 3, cid: 3, name: "LPL"}, {did: 4, cid: 4, name: "LMS"}, {did: 5, cid: 5, name: "WC"}];

		}


		minRosterSize = 6;

        // Any custom teams?
        if (leagueFile.hasOwnProperty("teams")) {
	/*		if (leagueFile.teams.length == 57 && typeid == -1) {
				for (i = 0; i < teamsDefault.length; i++) {
					adjLeagueFile.push(helpers.deepCopy(leagueFile.teams[10+i]))
					adjLeagueFile[i].tid = i;
					adjLeagueFile[i].cid = 0;
					adjLeagueFile[i].did = 0;

				}
				console.log(adjLeagueFile);
				teams = merge(adjLeagueFile, teamsDefault);

			} else {
				teams = merge(leagueFile.teams, teamsDefault);

			}		*/
			teams = merge(leagueFile.teams, teamsDefault);

            // Add in popRanks
            teams = helpers.addPopRank(teams);
        } else {
            teams = teamsDefault;
        }

        let redoChampions = false;
        if (leagueFile.hasOwnProperty("championPatch")) {
          if (leagueFile.championPatch[0].rank != undefined) {
            if (leagueFile.championPatch[0].rank <= 1 && leagueFile.championPatch[0].rank >= 0) {
                redoChampions = true;
            }
          }
        }
        console.log(redoChampions);
       // Any custom teams?
        if (leagueFile.hasOwnProperty("champions") && !redoChampions) {
        //    championLength = merge(leagueFile.champions, cDefault);
			championLength = leagueFile.champions.length;
            // Add in popRanks
          //  teams = helpers.addPopRank(teams);
        } else {
			championLength = champions.champion.length;
            //teams = teamsDefault;
        }


		if (leagueFile.hasOwnProperty("championPatch") && !redoChampions) {

			championPatchLength = leagueFile.championPatch.length;
		} else {
				championPatchLength	= championPatch.championPatch.length;

		}


			var cDefault,cpDefault,i;
            // Probably is fastest to use this transaction for everything done to create a new league

			cDefault = {};
			if (leagueFile.hasOwnProperty("champions") && !redoChampions) {

//				for (i = 0; i < champions.champion.length; i++) {
				for (i = 0; i < champions.champion.length; i++) {
					cDefault[i] = champion.generate(i);
					//dao.champions.add({ot: tx, value: c});
				}
				//c = champion.generate(i);
				cDefault = merge(leagueFile.champions, cDefault);
				// Add in popRanks
			//	teams = helpers.addPopRank(teams);
			} else {

				for (i = 0; i < champions.champion.length; i++) {
					cDefault[i] = champion.generate(i);

				}

//				teams = teamsDefault;
			}
		//	console.log(g.numChampions);
			cpDefault = {};
			if (leagueFile.hasOwnProperty("championPatch")  && !redoChampions) {
				for (i = 0; i < championPatch.championPatch.length; i++) {
					cpDefault[i] = champion.rank(i);
				}
				cpDefault = merge(leagueFile.championPatch, cpDefault);
			} else {
				for (i = 0; i < championPatch.championPatch.length; i++) {
					cpDefault[i]  = champion.rank(i);
				}
			}

	//	console.log(championLength);

        // Handle random team
        if (tid === -1) {
            tid = random.randInt(0, teams.length - 1);
        }

        if (leagueFile.hasOwnProperty("meta") && leagueFile.meta.hasOwnProperty("phaseText")) {
            phaseText = leagueFile.meta.phaseText;
        } else {
            phaseText = "";
        }

		regionType = "";
		if (typeid == -1) {
			typeid = 0;
			regionType = "EU";
		} else if (typeid == -2) {
			typeid = 1;
			regionType = "EU";
		}
		console.log(typeid);
		console.log(regionType);

        // Record in meta db
        return dao.leagues.add({
            value: {
                name: name,
                tid: tid,
				typeid: typeid,
				patchid: patchid,
				regionType: regionType,
                phaseText: phaseText,
                teamName: teams[tid].name,
                teamRegion: teams[tid].region
            }
        }).then(function (lid) {
            g.lid = lid;

            // Create new league database
            return db.connectLeague(g.lid);
        }).then(function () {
            var gameAttributes, i;

			console.log(typeid);
			console.log("ownerType: "+ownerType);

      let adjustedStartingSeason = startingSeason;

      console.log(leagueFile);
      // handle no starting season, and game is different than file
      if (leagueFile.hasOwnProperty("players")) {
        if (!leagueFile.hasOwnProperty("gameAttributes")) {
           if (leagueFile.players[0].ratings.length == 1) {
             adjustedStartingSeason = leagueFile.players[0].ratings[0].season;
           }
        }
      }

            // Default values
            gameAttributes = {
				ownerType: ownerType,
				userTid: tid,
				userTids: [tid],
				gameType: typeid,
				regionType: regionType,
				patchType: patchid,
				regionalRestrictions: true,
                confs: conferences,
                divs: divisions,
				minRosterSize: minRosterSize,
                season: adjustedStartingSeason,
                startingSeason: adjustedStartingSeason,
                seasonSplit: "Spring",
                startingSplit: "Fall",
                phase: 0,
                nextPhase: null, // Used only for fantasy draft
                daysLeft: 0, // Used only for free agency
                gamesInProgress: false,
				phaseChangeInProgress: false,
                stopGames: false,
                lastDbChange: 0,
                leagueName: name,
                ownerMood: {
                    wins: 0,
                    playoffs: 0,
                    money: 0
                },
                gameOver: false,
                cCache: cDefault,
                cpCache: cpDefault,
                teamAbbrevsCache: _.pluck(teams, "abbrev"),
                teamRegionsCache: _.pluck(teams, "region"),
                teamNamesCache: _.pluck(teams, "name"),
                teamCountryCache: _.pluck(teams, "country"),
                showFirstOwnerMessage: true, // true when user starts with a new team, so initial owner message can be shown
                gracePeriodEnd: startingSeason + 2, // Can't get fired for the first two seasons
//                numChampions: champions.champion.length, // Will be 30 if the user doesn't supply custom rosters
                numChampions: championLength, // Will be 30 if the user doesn't supply custom rosters
                numChampionsPatch: championPatchLength, // Will be 30 if the user doesn't supply custom rosters
				numTeams: teams.length, // Will be 30 if the user doesn't supply custom rosters
				autoPlaySeasons: 0,
				customRosterMode: false,
				godMode: false,
				godModeInPast: false
            };

            // gameAttributes from input
            skipNewPhase = false;
            if (leagueFile.hasOwnProperty("gameAttributes")) {
                for (i = 0; i < leagueFile.gameAttributes.length; i++) {
                    // Set default for anything except team ID and name, since they can be overwritten by form input.
                    if (leagueFile.gameAttributes[i].key !== "userTid" && leagueFile.gameAttributes[i].key !== "leagueName") {

                      // handle MOBA GM champions in LOL GM
                      if (leagueFile.gameAttributes[i].key == "numChampions" && redoChampions) {
                      } else if (leagueFile.gameAttributes[i].key == "numChampionsPatch" && redoChampions) {
                      } else if (leagueFile.gameAttributes[i].key == "minContract" && redoChampions) {
                      } else if (leagueFile.gameAttributes[i].key == "maxContract" && redoChampions) {
                      } else {
                        gameAttributes[leagueFile.gameAttributes[i].key] = leagueFile.gameAttributes[i].value;
                      }

                    }





                    if (leagueFile.gameAttributes[i].key === "phase") {

                        skipNewPhase = true;
						console.log(skipNewPhase);
                    }
                }
				// Special case for userTids - don't use saved value if userTid is not in it
				if (gameAttributes.userTids.indexOf(gameAttributes.userTid) < 0) {
					gameAttributes.userTids = [gameAttributes.userTid];
				}
            }

            // Clear old game attributes from g, to make sure the new ones are saved to the db in setGameAttributes
            helpers.resetG();

            return setGameAttributes(null, gameAttributes);
        }).then(function () {
            var i, j, round, scoutingRank, t, toMaybeAdd, tx;

			var c,cp;
            // Probably is fastest to use this transaction for everything done to create a new league
            tx = dao.tx(["draftPicks", "draftOrder", "players", "playerStats", "teams", "trade", "releasedPlayers", "awards", "schedule", "playoffSeries", "negotiations", "messages", "games","champions","championPatch"], "readwrite");


          //needed again?
    /*  let redoChampions = false;
      if (leagueFile.hasOwnProperty("championPatch")) {
        if (leagueFile.championPatch[0].rank != undefined) {
          if (leagueFile.championPatch[0].rank <= 1 && leagueFile.championPatch[0].rank >= 0) {
              redoChampions = true;
          }
        }
      }*/

			if (leagueFile.hasOwnProperty("champions") && !redoChampions) {


				for (i = 0; i < cDefault.length; i++) {
					c = cDefault[i];
					dao.champions.add({ot: tx, value: c});
				}
				// Add in popRanks
			//	teams = helpers.addPopRank(teams);
			} else {

				for (i = 0; i < champions.champion.length; i++) {
					c = champion.generate(i);
					dao.champions.add({ot: tx, value: c});
				}

//				teams = teamsDefault;
			}
		//	console.log(g.numChampions);
			if (leagueFile.hasOwnProperty("championPatch") && !redoChampions) {

				for (i = 0; i < cpDefault.length; i++) {
					cp = cpDefault[i];
					dao.championPatch.add({ot: tx, value: cp});
				}
				// Add in popRanks
				//teams = helpers.addPopRank(teams);
			} else {
				for (i = 0; i < championPatch.championPatch.length; i++) {
					cp = champion.rank(i);
					dao.championPatch.add({ot: tx, value: cp});
				}
//				teams = teamsDefault;
			}

			var topChamps;



			// sortChampRoles?
			// get top champs for each role
			var cpSorted;
			cpSorted = [];

			for (i = 0; i < _.size(cpDefault); i++) {
				cpSorted.push({"champion": cpDefault[i].champion,"cpid": cpDefault[i].cpid,"rank": cpDefault[i].rank,"role": cpDefault[i].role});
			}

			cpSorted.sort(function (a, b) { return a.rank - b.rank; });

			var topADC,topMID,topJGL,topTOP,topSUP;

			topADC = [];
			topMID = [];
			topJGL = [];
			topTOP = [];
			topSUP = [];

			for (i = 0; i < _.size(cpSorted); i++) {
				if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
			//	   console.log(_.size(cDefault));
					for (j = 0; j < _.size(cDefault); j++) {
					    if (cDefault[j].name == cpSorted[i].champion) {
							topADC.push(cDefault[j].hid);
							j = _.size(cDefault);
						}
					}
				}
				if ((cpSorted[i].role == "Middle") && (topMID.length < 5) ) {
//				  topMID.push(cpSorted[i].cpid);
					for (j = 0; j < _.size(cDefault); j++) {
					    if (cDefault[j].name == cpSorted[i].champion) {
							topMID.push(cDefault[j].hid);
							j = _.size(cDefault);
						}
					}
				}
				if ((cpSorted[i].role == "Jungle") && (topJGL.length < 5) ) {
//				  topJGL.push(cpSorted[i].cpid);
					for (j = 0; j < _.size(cDefault); j++) {
					    if (cDefault[j].name == cpSorted[i].champion) {
							topJGL.push(cDefault[j].hid);
							j = _.size(cDefault);
						}
					}
				}
				if ((cpSorted[i].role == "Top") && (topTOP.length < 5) ) {
//				  topTOP.push(cpSorted[i].cpid);
					for (j = 0; j < _.size(cDefault); j++) {
					    if (cDefault[j].name == cpSorted[i].champion) {
							topTOP.push(cDefault[j].hid);
							j = _.size(cDefault);
						}
					}
				}
				if ((cpSorted[i].role == "Support") && (topSUP.length < 5) ) {
//				  topSUP.push(cpSorted[i].cpid);
					for (j = 0; j < _.size(cDefault); j++) {
					    if (cDefault[j].name == cpSorted[i].champion) {
							topSUP.push(cDefault[j].hid);
							j = _.size(cDefault);
						}
					}

				}

			}
			//console.log(topADC);
		/*	console.log(topADC);
			console.log(topMID);
			console.log(topJGL);
			console.log(topTOP);
			console.log(topSUP);*/

            // Draft picks for the first 4 years, as those are the ones can be traded initially
      /*      if (leagueFile.hasOwnProperty("champions")) {
                for (i = 0; i < leagueFile.champions.length; i++) {
                    dao.champions.add({ot: tx, value: leagueFile.champions[i]});
                }
            } else {
                for (i = 0; i < 4; i++) {
                    for (t = 0; t < g.numTeams; t++) {
                        for (round = 1; round <= 2; round++) {
                            dao.champions.add({
                                ot: tx,
                                value: {
                                    tid: t,
                                    originalTid: t,
                                    round: round,
                                    season: g.startingSeason + i
                                }
                            });
                        }
                    }
                }
            }			*/



            // Draft picks for the first 4 years, as those are the ones can be traded initially
            if (leagueFile.hasOwnProperty("draftPicks")) {
                for (i = 0; i < leagueFile.draftPicks.length; i++) {
                    dao.draftPicks.add({ot: tx, value: leagueFile.draftPicks[i]});
                }
            } else {
                for (i = 0; i < 4; i++) {
                    for (t = 0; t < g.numTeams; t++) {
                        for (round = 1; round <= 2; round++) {
                            dao.draftPicks.add({
                                ot: tx,
                                value: {
                                    tid: t,
                                    originalTid: t,
                                    round: round,
                                    season: g.startingSeason + i
                                }
                            });
                        }
                    }
                }
            }

            // Initialize draft order object store for later use
            if (leagueFile.hasOwnProperty("draftOrder")) {
                for (i = 0; i < leagueFile.draftOrder.length; i++) {
                    dao.draftOrder.add({ot: tx, value: leagueFile.draftOrder[i]});
                }
            } else {
                dao.draftOrder.add({
                    ot: tx,
                    value: {
                        rid: 1,
                        draftOrder: []
                    }
                });
            }

            // teams already contains tid, cid, did, region, name, and abbrev. Let's add in the other keys we need for the league.
		//	console.log(team[0]);
            for (i = 0; i < g.numTeams; i++) {
                t = team.generate(teams[i]);
                dao.teams.add({ot: tx, value: t});

                // Save scoutingRank for later
                if (i === g.userTid) {
                    scoutingRank = finances.getRankLastThree(t, "expenses", "scouting");
                }
            }

            // Create Champions List. Let's add in the other keys we need for the league.
           /* for (i = 0; i < 126; i++) {
                c = champion.generate(i);
                dao.champions.put({ot: tx, value: c});
            }*/

            if (leagueFile.hasOwnProperty("trade")) {
                for (i = 0; i < leagueFile.trade.length; i++) {
                    dao.trade.add({ot: tx, value: leagueFile.trade[i]});
                }
            } else {
                dao.trade.add({
                    ot: tx,
                    value: {
                        rid: 0,
                        teams: [
                            {
                                tid: tid,
                                pids: [],
                                dpids: []
                            },
                            {
                                tid: tid === 0 ? 1 : 0,  // Load initial trade view with the lowest-numbered non-user team (so, either 0 or 1).
                                pids: [],
                                dpids: []
                            }
                        ]
                    }
                });
            }

            // These object stores are blank by default
            toMaybeAdd = ["releasedPlayers", "awards", "schedule", "playoffSeries", "negotiations", "messages", "games"];
            for (j = 0; j < toMaybeAdd.length; j++) {
                if (leagueFile.hasOwnProperty(toMaybeAdd[j])) {
                    for (i = 0; i < leagueFile[toMaybeAdd[j]].length; i++) {
                        dao[toMaybeAdd[j]].add({
                            ot: tx,
                            value: leagueFile[toMaybeAdd[j]][i]
                        });
                    }
                }
            }

	//		console.log(cDefault);
            return player.genBaseMoods(tx).then(function (baseMoods) {
                var agingYears, baseRatings, draftYear, goodNeutralBad, i, n, p, playerTids, players, pots, profile, profiles, t, t2;
				var userPlayerPos,timeThrough;
				var adjustment;
				var playerTids1, playerTids2, playerTids3, playerTids4;
                // Either add players from league file or generate them

                if (leagueFile.hasOwnProperty("players")) {
                    // Use pre-generated players, filling in attributes as needed
                    players = leagueFile.players;

                    // Does the player want the rosters randomized?
                    if (randomizeRosters) {
                        // Assign the team ID of all players to the 'playerTids' array.
                        // Check tid to prevent draft prospects from being swapped with established players
						//console.log(typeid+" "+g.gameType);

						if (g.gameType == 1) {

							playerTids = _.pluck(players.filter(function (p) { return  ((p.tid < 10) && p.tid > g.PLAYER.FREE_AGENT); }), "tid");
							playerTids1 = _.pluck(players.filter(function (p) { return  ((p.tid < 16) && p.tid > 9); }), "tid");
							playerTids2 = _.pluck(players.filter(function (p) { return  (p.tid > 15); }), "tid");

							// Shuffle the teams that players are assigned to.
							random.shuffle(playerTids);
							random.shuffle(playerTids1);
							random.shuffle(playerTids2);

							for (i = 0; i < players.length; i++) {
								if (players[i].tid > g.PLAYER.FREE_AGENT && players[i].tid < 10) {
									players[i].tid = playerTids.pop();
								} else if (players[i].tid > 9 && players[i].tid < 16) {
									players[i].tid = playerTids1.pop();
								} else if (players[i].tid > 15 ) {
									players[i].tid = playerTids2.pop();
								}
							}

						} else if (g.gameType == 5) {

							playerTids = _.pluck(players.filter(function (p) { return  ((p.tid < 10) && p.tid > g.PLAYER.FREE_AGENT); }), "tid");
							playerTids1 = _.pluck(players.filter(function (p) { return  ((p.tid < 20) && p.tid > 9); }), "tid");
							playerTids2 = _.pluck(players.filter(function (p) { return  ((p.tid < 30) && p.tid > 19); }), "tid");
							playerTids3 = _.pluck(players.filter(function (p) { return  ((p.tid < 42) && p.tid > 29); }), "tid");
							playerTids4 = _.pluck(players.filter(function (p) { return  ((p.tid < 50) && p.tid > 41); }), "tid");

							// Shuffle the teams that players are assigned to.
							random.shuffle(playerTids);
							random.shuffle(playerTids1);
							random.shuffle(playerTids2);
							random.shuffle(playerTids3);
							random.shuffle(playerTids4);

							for (i = 0; i < players.length; i++) {
	//                            if (players[i].tid >= g.PLAYER.FREE_AGENT) {
								if (players[i].tid > g.PLAYER.FREE_AGENT && players[i].tid < 10) {
									players[i].tid = playerTids.pop();
								} else if (players[i].tid > 9 && players[i].tid < 20) {
									players[i].tid = playerTids1.pop();
								} else if (players[i].tid > 19 && players[i].tid < 30) {
									players[i].tid = playerTids2.pop();
								} else if (players[i].tid > 29 && players[i].tid < 42) {
									players[i].tid = playerTids3.pop();
								} else if (players[i].tid > 41 && players[i].tid < 50) {
									players[i].tid = playerTids4.pop();
								}
							}

						} else {

//							playerTids = _.pluck(players.filter(function (p) { return  (p.tid >= g.PLAYER.FREE_AGENT); }), "tid");
							playerTids = _.pluck(players.filter(function (p) { return  (p.tid > g.PLAYER.FREE_AGENT); }), "tid");

							// Shuffle the teams that players are assigned to.
							random.shuffle(playerTids);
							for (i = 0; i < players.length; i++) {
								if (players[i].tid > g.PLAYER.FREE_AGENT) {
									players[i].tid = playerTids.pop();
								}
							}
						}

          } // non random rosters

					console.log(topADC,topJGL,topTOP,topSUP);
                    players.forEach(function (p) {
                        var playerStats;

                        p = player.augmentPartialPlayer(p, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);

                        // Don't let imported contracts be created for below the league minimum, and round to nearest $10,000.
                    //    console.log(p.contract.amount);
                    //    console.log( g.minContract);
                        p.contract.amount = Math.max(10 * helpers.round(p.contract.amount / 10), g.minContract);


                        // Separate out stats
                        playerStats = p.stats;
                        delete p.stats;

                        player.updateValues(tx, p, playerStats.reverse()).then(function (p) {
                            dao.players.put({ot: tx, value: p}).then(function (pid) {
                                var addStatsRows;

                                // When adding a player, this is the only way to know the pid
                                p.pid = pid;

                                // If no stats in League File, create blank stats rows for active players if necessary
                                if (playerStats.length === 0) {
                                     if (p.tid >= 0 && g.phase <= g.PHASE.PLAYOFFS) {
                                        // Needs pid, so must be called after put. It's okay, statsTid was already set in player.augmentPartialPlayer
                                        p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
                                    }
                                } else {
                                    // If there are stats in the League File, add them to the database
                                    addStatsRows = function () {
                                        var ps;

                                        ps = playerStats.pop();

                                        // Augment with pid, if it's not already there - can't be done in player.augmentPartialPlayer because pid is not known at that point
                                        ps.pid = p.pid;

                                        // Could be calculated correctly if I wasn't lazy
                                        if (!ps.hasOwnProperty("yearsWithTeam")) {
                                            ps.yearsWithTeam = 1;
                                        }

                                        // Delete psid because it can cause problems due to interaction addStatsRow above
                                        delete ps.psid;

                                        dao.playerStats.add({ot: tx, value: ps}).then(function () {
                                            // On to the next one
                                            if (playerStats.length > 0) {
                                                addStatsRows();
                                            }
                                        });
                                    };
                                    addStatsRows();
                                }
                            });
                        });
                    });
                } else {
                    // No players in league file, so generate new players
                    profiles = ["Point", "Wing", "Big", ""];
//                    baseRatings = [37, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 26, 26, 26];
//                    pots = [75, 65, 55, 55, 60, 50, 70, 40, 55, 50, 60, 60, 45, 45];
                    baseRatings = [37, 37, 36, 35, 34, 33, 32, 31];
                    pots = [75, 65, 55, 55, 60, 50, 70, 40];
					//	console.log(cDefault);
                    for (t = -teams.length*2; t < teams.length; t++) {

                        // Create multiple "teams" worth of players for the free agent pool
                        if (t < 0) {
                            t2 = g.PLAYER.FREE_AGENT;
                        } else {
                            t2 = t;
                        }



						// players based on starting difficulty
						if (t < 0) {
							t2 = g.PLAYER.FREE_AGENT;
//							adjustment = -50;
							adjustment = -20;
                        } else {
                            t2 = t;
							adjustment = (1-(teams[t2].pop/teams.length))*(-40)+20;

							//console.log(g.gameType+" "+teams[t2]);

							if (t2 == g.userTid) {
								adjustment -= 10;
							}
						//	console.log(t+" "+adjustment+" usertid: "+g.userTid);

                        }

						baseRatings = [37+adjustment, 37+adjustment, 36+adjustment, 35+adjustment, 34+adjustment, 33+adjustment, 32+adjustment, 31+adjustment, 30+adjustment, 29+adjustment, 28+adjustment, 26+adjustment, 31+adjustment];
						pots = [75+adjustment, 65+adjustment, 55+adjustment, 55+adjustment, 60+adjustment, 50+adjustment, 70+adjustment, 40+adjustment, 55+adjustment, 50+adjustment, 60+adjustment, 45+adjustment, 55+adjustment];
						//console.log(base)
                        goodNeutralBad = random.randInt(-1, 1);  // determines if this will be a good team or not
                        random.shuffle(pots);

//                        for (n = 0; n < 8; n++) {
                        for (n = 0; n < 8; n++) {
                            profile = profiles[random.randInt(0, profiles.length - 1)];
							if (Math.random() < .80) {
								agingYears = random.randInt(0, 4);
							} else if (Math.random() < .80) {
								agingYears = random.randInt(0, 7);
							} else {
								agingYears = random.randInt(0, 10);
							}
                            draftYear = g.startingSeason - 1 - agingYears;

							if ( (g.userTid == t) && (n<5) ) {
							    userPlayerPos = "";
								timeThrough = 0;
							    while ( (((userPlayerPos != "Top") && (n == 0))  || ((userPlayerPos != "Jgl") && (n == 1)) || ((userPlayerPos != "Mid") && (n == 2)) || ((userPlayerPos != "ADC") && (n == 3)) || ((userPlayerPos != "Sup") && (n == 4)) ) && (timeThrough<20) ) {

									p = player.generate(t2, 18, profile, baseRatings[n], pots[n], draftYear, true, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
									userPlayerPos = p.pos;
									timeThrough += 1;
									if (n==0) {
										p.pos = "TOP"
									} else if (n==1) {
										p.pos = "JGL"
									} else if (n==2) {
										p.pos = "MID"
									} else if (n==3) {
										p.pos = "ADC"
									} else {
										p.pos = "SUP"
									}
								//	console.log(n+" "+userPlayerPos);
								}

//							console.log(n+" "+p.pos);
							} else {
									p = player.generate(t2, 18, profile, baseRatings[n], pots[n], draftYear, true, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
							}
							//console.log(topADC.length+" "+topTOP.length+" "+topMID.length+" "+topJGL.length+" "+topSUP.length);
                            p = player.develop(p, agingYears, true,null,topADC,topMID,topJGL,topTOP,topSUP);

                            if (n < 5) {
                                p = player.bonus(p, goodNeutralBad * random.randInt(0, 20));
                            } else {
                                p = player.bonus(p, 0);
                            }
                            if (t2 === g.PLAYER.FREE_AGENT) {  // Free agents
                                p = player.bonus(p, -15);
                            }

                            // Hack to account for player.addStatsRow being called after dao.players.put - manually assign statsTids
                            if (p.tid >= 0) {
                                p.statsTids = [p.tid];
                            }

                            // Update player values after ratings changes
                            player.updateValues(tx, p, []).then(function (p) {
                                var randomizeExp;

                                // Randomize contract expiration for players who aren't free agents, because otherwise contract expiration dates will all be synchronized
                                randomizeExp = (p.tid !== g.PLAYER.FREE_AGENT);

                                // Update contract based on development. Only write contract to player log if not a free agent.
                                p = player.setContract(p, player.genContract(p, randomizeExp), p.tid >= 0);

                                // Save to database
                                if (p.tid === g.PLAYER.FREE_AGENT) {
                                    player.addToFreeAgents(tx, p, null, baseMoods);
                                } else {
                                    dao.players.put({ot: tx, value: p}).then(function (pid) {
                                        // When adding a player, this is the only way to know the pid
                                        p.pid = pid;

                                        // Needs pid, so must be called after put. It's okay, statsTid was already set above
                                        p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
                                    });
                                }
                            });
                        }

                        // Initialize rebuilding/contending, when possible
                        if (t2 >= 0) {
							console.log(t2);
                            dao.teams.get({ot: tx, key: t2}).then(function (t) {
							//	console.log(t.tid);
                                t.strategy = goodNeutralBad === 1 ? "contending" : "rebuilding";
                                dao.teams.put({ot: tx, value: t});
                            });
                        }
                    }
                }

                return tx.complete().then(function () {
                    return players;
                });
            }).then(function (players) {
                var createUndrafted1, createUndrafted2, createUndrafted3, i, tx;
					//	console.log(cDefault);
                // Use a new transaction so there is no race condition with generating draft prospects and regular players (PIDs can seemingly collide otherwise, if it's an imported roster)
                tx = dao.tx(["players", "playerStats"], "readwrite");

				console.log("create players for future");
                // See if imported roster has draft picks included. If so, create less than 70 (scaled for number of teams)
                createUndrafted1 = Math.round(g.numTeams * 8 * 3 / 5);
                createUndrafted2 = Math.round(g.numTeams * 8 * 3 / 5);
                createUndrafted3 = Math.round(g.numTeams * 8 * 3 / 5);
/*                createUndrafted1 = Math.round(70 * g.numTeams / 30);
                createUndrafted2 = Math.round(70 * g.numTeams / 30);
                createUndrafted3 = Math.round(70 * g.numTeams / 30);*/
                if (players !== undefined) {
                    for (i = 0; i < players.length; i++) {
                        if (players[i].tid === g.PLAYER.UNDRAFTED) {
                            createUndrafted1 -= 1;
                        } else if (players[i].tid === g.PLAYER.UNDRAFTED_2) {
                            createUndrafted2 -= 1;
                        } else if (players[i].tid === g.PLAYER.UNDRAFTED_3) {
                            createUndrafted3 -= 1;
                        }
                    }
                }
                // If the draft has already happened this season but next year's class hasn't been bumped up, don't create any g.PLAYER.UNDRAFTED
                if (createUndrafted1 && (g.phase <= g.PHASE.BEFORE_DRAFT || g.phase >= g.PHASE.FREE_AGENCY)) {
                    draft.genPlayers(tx, g.PLAYER.UNDRAFTED, scoutingRank, createUndrafted1,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
                }
                if (createUndrafted2) {
                    draft.genPlayers(tx, g.PLAYER.UNDRAFTED_2, scoutingRank, createUndrafted2,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
                }
                if (createUndrafted3) {
                    draft.genPlayers(tx, g.PLAYER.UNDRAFTED_3, scoutingRank, createUndrafted3,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
                }

                return tx.complete().then(function () {
					return team.updateCountry();
		//        });
				}).then(function () {

                    if (skipNewPhase) {
						console.log(skipNewPhase);

                        // Game already in progress, just start it
                        return g.lid;
                    }
					console.log(skipNewPhase);

                    // Make schedule, start season
                    return phase.newPhase(g.PHASE.REGULAR_SEASON).then(function () {
                        var lid, tx;

                        ui.updateStatus("Idle");

                        lid = g.lid; // Otherwise, g.lid can be overwritten before the URL redirects, and then we no longer know the league ID

                        helpers.bbgmPing("league");


                        // Auto sort rosters
                        tx = dao.tx("players", "readwrite");
                        return Promise.each(teams, function (t) {
                            return team.rosterAutoSort(tx, t.tid);
                        }).then(function () {
                            return lid;
                        });
                    });
                });
            });
        });
    }

    /**
     * Delete an existing league.
     *
     * @memberOf core.league
     * @param {number} lid League ID.
     * @param {function()=} cb Optional callback.
     */
    function remove(lid) {
        return new Promise(function (resolve, reject) {
            var request;

            if (g.dbl !== undefined) {
                g.dbl.close();
            }

            dao.leagues.delete({key: lid});
            request = indexedDB.deleteDatabase("league" + lid);
            request.onsuccess = function () {
                console.log("Database league" + lid + " successfully deleted");
                resolve();
            };
            request.onfailure = function (event) {
                reject(event);
            };
            request.onblocked = function () {
                // Necessary because g.dbl.close() doesn't always finish in time and
                // http://www.w3.org/TR/IndexedDB/#dfn-steps-for-deleting-a-database
                // says it will still be deleted even if onblocked fires.
                resolve();
            };
        });
    }


    /**
     * Export existing active league.
     *
     * @memberOf core.league
     * @param {string[]} stores Array of names of objectStores to include in export
     * @return {Promise} Resolve to all the exported league data.
     */
    function exportLeague(stores) {
        var exportedLeague;

        exportedLeague = {};

        // Row from leagueStore in meta db.
        // phaseText is needed if a phase is set in gameAttributes.
        // name is only used for the file name of the exported roster file.
        exportedLeague.meta = {phaseText: g.phaseText, name: g.leagueName};

        return Promise.map(stores, function (store) {
            return dao[store].getAll().then(function (contents) {
                exportedLeague[store] = contents;
            });
        }).then(function () {
            // Move playerStats to players object, similar to old DB structure. Makes editing JSON output nicer.
            var i, j, pid;

            if (stores.indexOf("playerStats") >= 0) {
                for (i = 0; i < exportedLeague.playerStats.length; i++) {
                    pid = exportedLeague.playerStats[i].pid;

                    // Find player corresponding with that stats row
                    for (j = 0; j < exportedLeague.players.length; j++) {
                        if (exportedLeague.players[j].pid === pid) {
                            if (!exportedLeague.players[j].hasOwnProperty("stats")) {
                                exportedLeague.players[j].stats = [];
                            }

                            exportedLeague.players[j].stats.push(exportedLeague.playerStats[i]);

                            break;
                        }
                    }
                }

                delete exportedLeague.playerStats;
            }
        }).then(function () {
            return exportedLeague;
        });
    }

    function updateMetaNameRegion(name, region) {
        return dao.leagues.get({key: g.lid}).then(function (l) {
            l.teamName = name;
            l.teamRegion = region;
            return dao.leagues.put({value: l});
        });
    }

    /**
     * Load a game attribute from the database and update the global variable g.
     *
     * @param {(IDBObjectStore|IDBTransaction|null)} ot An IndexedDB object store or transaction on gameAttributes; if null is passed, then a new transaction will be used.
     * @param {string} key Key in gameAttributes to load the value for.
     * @return {Promise}
     */
    function loadGameAttribute(ot, key) {
        return dao.gameAttributes.get({ot: ot, key: key}).then(function (gameAttribute) {
            if (gameAttribute === undefined) {
                throw new Error("Unknown game attribute: " + key);
            }

            g[key] = gameAttribute.value;

            // UI stuff - see also loadGameAttributes
            if (key === "godMode") {
                g.vm.topMenu.godMode(g.godMode);
            }
            if (key === "userTid" || key === "userTids") {
                g.vm.multiTeam[key](gameAttribute.value);
            }
        });
    }

    /**
     * Load game attributes from the database and update the global variable g.
     *
     * @param {(IDBObjectStore|IDBTransaction|null)} ot An IndexedDB object store or transaction on gameAttributes; if null is passed, then a new transaction will be used.
     * @return {Promise}
     */
    function loadGameAttributes(ot) {
        return dao.gameAttributes.getAll({ot: ot}).then(function (gameAttributes) {
            var i;

            for (i = 0; i < gameAttributes.length; i++) {
                g[gameAttributes[i].key] = gameAttributes[i].value;
            }

            // Shouldn't be necessary, but some upgrades fail http://www.reddit.com/r/BasketballGM/comments/2zwg24/cant_see_any_rosters_on_any_teams_in_any_of_my/cpn0j6w
            if (g.userTids === undefined) {
                g.userTids = [g.userTid];
            }

            // UI stuff - see also loadGameAttribute
            g.vm.topMenu.godMode(g.godMode);
            g.vm.multiTeam.userTid(g.userTid);
            g.vm.multiTeam.userTids(g.userTids);
        });
    }

    // Depending on phase, initiate action that will lead to the next phase
    function autoPlay() {
        var freeAgents, game, season;

        freeAgents = require("core/freeAgents");
        game = require("core/game");
        season = require("core/season");

        if (g.phase === g.PHASE.PRESEASON) {
            return phase.newPhase(g.PHASE.REGULAR_SEASON);
        }
        if (g.phase === g.PHASE.REGULAR_SEASON) {
            return season.getDaysLeftSchedule().then(game.play);
        }
        if (g.phase === g.PHASE.PLAYOFFS) {
            return game.play(100);
        }
        if (g.phase === g.PHASE.BEFORE_DRAFT) {
            return phase.newPhase(g.PHASE.RESIGN_PLAYERS);
        }
        if (g.phase === g.PHASE.DRAFT) {
			return draft.untilUserOrEnd();
        }
        if (g.phase === g.PHASE.AFTER_DRAFT) {
            return phase.newPhase(g.PHASE.RESIGN_PLAYERS);
        }
        if (g.phase === g.PHASE.RESIGN_PLAYERS) {
			return phase.newPhase(g.PHASE.FREE_AGENCY);
        }
        if (g.phase === g.PHASE.FREE_AGENCY) {
			return freeAgents.play(g.daysLeft);
        }
    }

    function initAutoPlay() {
        var numSeasons, result;

        result = window.prompt("This will play through multiple seasons, using the AI to manage your team. How many seasons do you want to simulate?", "5");
        numSeasons = parseInt(result, 10);

        if (Number.isInteger(numSeasons)) {
            setGameAttributesComplete({autoPlaySeasons: numSeasons})
                .then(autoPlay);
        }
    }


    return {
        create: create,
        exportLeague: exportLeague,
        remove: remove,
        setGameAttributes: setGameAttributes,
		setGameAttributesComplete: setGameAttributesComplete,
        updateMetaNameRegion: updateMetaNameRegion,
        loadGameAttribute: loadGameAttribute,
        loadGameAttributes: loadGameAttributes,
        updateLastDbChange: updateLastDbChange,
        autoPlay: autoPlay,
        initAutoPlay: initAutoPlay
    };
});
