/**
 * @name core.team
 * @namespace Functions operating on team objects, parts of team objects, or arrays of team objects.
 */
define(["dao", "globals", "core/player", "lib/bluebird", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (dao, g, player, Promise, _, eventLog, helpers, random) {
    "use strict";

    /**
     * Add a new row of season attributes to a team object.
     *
     * There should be one season attributes row for each year, and a new row should be added for each team at the start of a season.
     *
     * @memberOf core.team
     * @param {Object} t Team object.
     * @return {Object} Updated team object.
     */
    function addSeasonRow(t) {
        var newSeason, s;
		var numTeams;

        s = t.seasons.length - 1; // Most recent season

        // Make sure this isn't a duplicate season
        if (s >= 0 && t.seasons[s].season === g.season) {
            console.log("Attempting to add duplicate team season record!");
            return t;
        }

		if (g.gameType == 0 && g.gameType == 2) {
		   numTeams = 10;
		} else if (g.gameType == 1) {
		   numTeams = 30;
		} else if (g.gameType == 3) {
		   numTeams = 12;
		} else if (g.gameType == 4) {
		   numTeams = 8;
		} else if (g.gameType == 5) {
		   numTeams = 57;
		}		
		
        // Initial entry
        newSeason = {
            season: g.season,
            seasonSplit: g.seasonSplit,
            gp: 0,
            att: 0,
            cash: 10000,
            won: 0,
            lost: 0,
            wonHome: 0,
            lostHome: 0,
            wonAway: 0,
            lostAway: 0,
            wonDiv: 0,
            lostDiv: 0,
            wonConf: 0,
            lostConf: 0,
            lastTen: [],
            streak: 0,
            cidStart: t.cid,
            cidNext: t.cid,
			imgURLCountry: t.imgURLCountry,
			countrySpecific: t.countrySpecific,
            playoffRoundsWon: -1,  // -1: didn't make playoffs. 0: lost in first round. ... 4: won championship
            hype: Math.random(),
            pop: 0,  // Needs to be set somewhere!
            tvContract: {
                amount: 0,
                exp: 0
            },
            revenues: {
                merch: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                sponsor: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                ticket: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                nationalTv: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                localTv: {
                    amount: 0,
                    rank: (numTeams+1)/2
                }
            },
            expenses: {
                salary: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                luxuryTax: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                minTax: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                buyOuts: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                scouting: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                coaching: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                health: {
                    amount: 0,
                    rank: (numTeams+1)/2
                },
                facilities: {
                    amount: 0,
                    rank: (numTeams+1)/2
                }
            },
            payrollEndOfSeason: -1
        };

	//	console.log(s+" "+newSeason.imgURLCountry+" "+t.imgURLCountry);		
	//	console.log(s+" "+newSeason.countrySpecific+" "+t.countrySpecific);		
		
        if (s >= 0) {
            // New season, carrying over some values from the previous season
            newSeason.pop = t.seasons[s].pop * random.uniform(0.98, 1.02);  // Mean population should stay constant, otherwise the economics change too much
            newSeason.hype = t.seasons[s].hype;
            newSeason.cash = t.seasons[s].cash;
            newSeason.tvContract = t.seasons[s].tvContract;
            newSeason.cidStart = t.seasons[s].cidNext;
            newSeason.cidNext = t.seasons[s].cidNext;

       /* } else {
            newSeason.hype = t.seasons[s].pop;		*/
		}

        t.seasons.push(newSeason);

        return t;
    }

    /**
     * Add a new row of stats to a team object.
     *
     * A row contains stats for unique values of (season, playoffs). So new rows need to be added when a new season starts or when a team makes the playoffs.
     *
     * @memberOf core.team
     * @param {Object} t Team object.
     * @param {=boolean} playoffs Is this stats row for the playoffs or not? Default false.
     * @return {Object} Updated team object.
     */
    function addStatsRow(t, playoffs) {
        var i;

        playoffs = playoffs !== undefined ? playoffs : false;

        // If there is already an entry for this season+playoffs, do nothing
        for (i = 0; i < t.stats.length; i++) {
            if (t.stats[i].season === g.season && t.stats[i].playoffs === playoffs) {
                return t;
            }
        }

        t.stats.push({
            season: g.season,
            seasonSplit: g.seasonSplit,
            playoffs: playoffs,
            gp: 0,
            min: 0,
            fg: 0,
            fga: 0,
			fgp: 0,
            fgAtRim: 0,
            fgaAtRim: 0,
            fgLowPost: 0,
            fgaLowPost: 0,
            fgMidRange: 0,
            fgaMidRange: 0,
            tp: 0,
            tpa: 0,
            ft: 0,
            fta: 0,
            orb: 0,
            drb: 0,
            trb: 0,
            ast: 0,
            tov: 0,
            stl: 0,
            blk: 0,
            pf: 0,
			oppTw: 0,
			oppInh: 0,			
            oppJM: 0,
            pts: 0,
            oppPts: 0,
			wardP:0,
			wardD:0,			
			kda:0,
			oppWardP: 0,
			oppWardD: 0,
			oppKDA: 0,
			oppKls: 0,
			oppDth: 0,
			oppAst: 0,
			opprh: 0,
			rh: 0,
			scTwr:0,
			scKills:0,
			grExpTwr:0,
			grExpKills:0,
			grGldTwr:0,
			grGldKills:0,			
			tmBuffTwr:0,
			tmBuffKills:0,			
			tmBAdjTwr:0,
			tmBAdjKills:0,			
			TPTwr:0,
			TPKills:0,
			TwTwr:0,
			TwKills:0,	
			CKTwr:0,
			CKKills:0,	
		/*	CKTwr:0,
			CKKills:0,	*/
			CSTwr:0,
			CSKills:0,	
			AgTwr:0,
			AgKills:0,	
			ChmpnTwr:0,
			ChmpnKills:0
			
			
			
        });

        return t;
    }

    /**
     * Create a new team object.
     *
     * @memberOf core.team
     * @param {Object} tm Team metadata object, likely from core.league.create.
     * @return {Object} Team object to insert in the database.
     */
    function generate(tm) {
        var strategy, t,moneyBonus;

        if (tm.hasOwnProperty("strategy")) {
            strategy = tm.strategy;
        } else {
            strategy = Math.random() > 0.5 ? "contending" : "rebuilding";
        }

		//console.log(tm.hypeRank);
		moneyBonus = 0;
		if (tm.popRank <5) {
		   moneyBonus = 5000*(5-tm.popRank);
		}
		

		
		
        t = {
            tid: tm.tid,
            cid: tm.cid,
            did: tm.did,
            region: tm.region,
            name: tm.name,
            abbrev: tm.abbrev,
            country: tm.country,
			countrySpecific: tm.countrySpecific !== undefined ? tm.imgURLCountry : tm.country,
            imgURLCountry: tm.imgURLCountry !== undefined ? tm.imgURLCountry : "",
            imgURL: tm.imgURL !== undefined ? tm.imgURL : "",
            imgURLStadium: tm.imgURLStadium !== undefined ? tm.imgURLStadium : "",
            stats: tm.hasOwnProperty("stats") ? tm.stats : [],
            seasons: tm.hasOwnProperty("seasons") ? tm.seasons : [],
            budget: {
                ticketPrice: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.amount : helpers.round(25 + 25 * (g.numTeams - tm.popRank) / (g.numTeams - 1), 2),
//                    amount: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.amount : helpers.round(tm.popRank, 2),
                    rank: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.rank : tm.popRank
                },
                scouting: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.scouting.amount : helpers.round(500+moneyBonus + 20000 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 1,
       //             amount: tm.hasOwnProperty("budget") ? tm.budget.scouting.amount : helpers.round(tm.popRank, 2),
                    rank: tm.hasOwnProperty("budget") ? tm.budget.scouting.rank : tm.popRank
                },
                coaching: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.coaching.amount : helpers.round(5000+moneyBonus + 20000 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 1,
    //                amount: tm.hasOwnProperty("budget") ? tm.budget.coaching.amount : helpers.round(tm.popRank, 2),
                    rank: tm.hasOwnProperty("budget") ? tm.budget.coaching.rank : tm.popRank
                },
                health: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.health.amount : helpers.round(100 + 10 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 1,
  //                  amount: tm.hasOwnProperty("budget") ? tm.budget.health.amount : helpers.round(tm.popRank, 2),
                    rank: tm.hasOwnProperty("budget") ? tm.budget.health.rank : tm.popRank
                },
                facilities: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.facilities.amount : helpers.round(1000+moneyBonus + 20000 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 1,
//                    amount: tm.hasOwnProperty("budget") ? tm.budget.facilities.amount : helpers.round(tm.popRank, 2),
                    rank: tm.hasOwnProperty("budget") ? tm.budget.facilities.rank : tm.popRank
                }
            },
            strategy: strategy
        };

        if (!tm.hasOwnProperty("seasons")) {
            t = addSeasonRow(t);
            t.seasons[0].pop = tm.pop;
			t.seasons[0].hype = (tm.pop/g.numTeams)*.8+.1;
        }
        if (!tm.hasOwnProperty("stats")) {
            t = addStatsRow(t);
        }

        return t;
    }

    /**
     * Sort a team's roster based on player ratings and stats.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} tx An IndexedDB transaction on players readwrite; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @return {Promise}
     */
    function rosterAutoSort(tx, tid) {
        if (tx === null) {
            tx = dao.tx("players", "readwrite");
        }

		//console.log("ROSTER AUTO SORT");
		
        // Get roster and sort by value (no potential included)
        return dao.players.getAll({
            ot: tx,
            index: "tid",
            key: tid
        }).then(function (players) {
            var i,j,rosterNumber;

            players = player.filter(players, {
                attrs: ["pid", "valueNoPot", "valueNoPotFuzz", "valueMMR","pos"],
                showNoStats: true,
                showRookies: true
            });
            // Fuzz only for user's team
		/*	console.log(players[0].valueMMR);
			console.log(players[1].valueMMR);
			console.log(players[2].valueMMR);
			console.log(players[3].valueMMR);
			console.log(players[4].valueMMR);
			console.log(players[5].valueMMR);
			console.log(players[0].valueNoPotFuzz);
			console.log(players[0].valueNoPot);*/			
			var MMRundefined;
			MMRundefined = 0;
            for (i = 0; i < players.length; i++) {
				if ( (players[i].valueMMR == undefined)) {
					MMRundefined += 1;
				}
			}
			if ( MMRundefined > 0 ) {
				if (tid === g.userTid && g.autoPlaySeasons === 0) {				
	//                players.sort(function (a, b) { return b.valueNoPotFuzz - a.valueNoPotFuzz; });
					players.sort(function (a, b) { return b.valueNoPotFuzz - a.valueNoPotFuzz; });
				} else {
	//                players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });
					players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });
				}			
			} else {
				if (tid === g.userTid && g.autoPlaySeasons === 0) {				
	//                players.sort(function (a, b) { return b.valueNoPotFuzz - a.valueNoPotFuzz; });
					players.sort(function (a, b) { return b.valueMMR -  a.valueMMR; });
				} else {
	//                players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });
					players.sort(function (a, b) { return b.valueMMR - a.valueMMR; });
				}
			}
			
			var position = [];
			rosterNumber = 0;			
            for (i = 0; i < players.length; i++) {
			    if (players[i].pos == "TOP") {
					players[i].rosterOrder = 0;
					position[0] = i;										
					rosterNumber += 1;
				  break;
				} 
            }
			
            for (i = 0; i < players.length; i++) {
			    if (players[i].pos == "JGL") {
					players[i].rosterOrder = 1;
					position[1] = i;										
					rosterNumber += 1;
				  break;
				}
            }

            for (i = 0; i < players.length; i++) {
			    if (players[i].pos == "MID") {
					players[i].rosterOrder = 2;
					position[2] = i;										
					rosterNumber += 1;
				  break;
				}
            }

            for (i = 0; i < players.length; i++) {
			    if (players[i].pos == "ADC") {
					players[i].rosterOrder = 3;
					position[3] = i;										
					rosterNumber += 1;
				  break;
				}
            }

            for (i = 0; i < players.length; i++) {
			    if (players[i].pos == "SUP") {
					players[i].rosterOrder = 4;
					position[4] = i;										
					rosterNumber += 1;
				  break;
				}
            }			
	

            for (i = 0; i < players.length; i++) {
			
				for (j = 0; j < 5; j++) {
				   if (i == position[j]) {
				     j=5;
				   } else {						
				   }
				}			
				if (j==5) {
					players[i].rosterOrder =  rosterNumber;
					rosterNumber += 1;
				}

            }			
			
			
            // Update rosterOrder
            return dao.players.iterate({
                ot: tx,
                index: "tid",
                key: tid,
                callback: function (p) {
                    var i;

                    for (i = 0; i < players.length; i++) {
                        if (players[i].pid === p.pid) {
                            if (p.rosterOrder !== players[i].rosterOrder) {
                                // Only write to DB if this actually changes
                                p.rosterOrder = players[i].rosterOrder;
                                return p;
                            }
                            break;
                        }
                    }
                }
            });
        });
    }

    /**
    * Gets all the contracts a team owes.
    *
    * This includes contracts for players who have been released but are still owed money.
    *
    * @memberOf core.team
    * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
    * @param {number} tid Team ID.
    * @returns {Promise.Array} Array of objects containing contract information.
    */
    function getContracts(tx, tid) {
        var contracts;

        tx = dao.tx(["players", "releasedPlayers"], "readonly", tx);

        // First, get players currently on the roster
        return dao.players.getAll({
            ot: tx,
            index: "tid",
            key: tid
        }).then(function (players) {
            var i;

            contracts = [];
            for (i = 0; i < players.length; i++) {
                contracts.push({
                    pid: players[i].pid,
                    name: players[i].name,
                    skills: players[i].ratings[players[i].ratings.length - 1].skills,
                    injury: players[i].injury,
                    watch: players[i].watch !== undefined ? players[i].watch : false, // undefined check is for old leagues, can delete eventually
                    amount: players[i].contract.amount,
                    exp: players[i].contract.exp,
                    released: false
                });
            }

            // Then, get any released players still owed money
            return dao.releasedPlayers.getAll({
                ot: tx,
                index: "tid",
                key: tid
            });
        }).then(function (releasedPlayers) {
            if (releasedPlayers.length === 0) {
                return contracts;
            }

            return Promise.map(releasedPlayers, function (releasedPlayer) {
                return dao.players.get({
                    ot: tx,
                    key: releasedPlayer.pid
                }).then(function (p) {
                    if (p !== undefined) { // If a player is deleted, such as if the user deletes retired players to improve performance, this will be undefined
                        contracts.push({
                            pid: releasedPlayer.pid,
                            name: p.name,
                            skills: p.ratings[p.ratings.length - 1].skills,
                            injury: p.injury,
                            amount: releasedPlayer.contract.amount,
                            exp: releasedPlayer.contract.exp,
                            released: true
                        });
                    } else {
                        contracts.push({
                            pid: releasedPlayer.pid,
                            name: "Deleted Player",
                            skills: [],
                            amount: releasedPlayer.contract.amount,
                            exp: releasedPlayer.contract.exp,
                            released: true
                        });
                    }
                });
            }).then(function () {
                return contracts;
            });
        });
    }

	
    /**
    * Gets all the contracts a team owes.
    *
    * This includes contracts for players who have been released but are still owed money.
    *
    * @memberOf core.team
    * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
    * @param {number} tid Team ID.
    * @returns {Promise.Array} Array of objects containing contract information.
    */
   /* function getCountries( tid) {
        var countries,country;
		var maxLength, currentLength;
		var tx;
		
        tx = dao.tx(["players"], "readonly");

        // First, get players currently on the roster
        return dao.players.getAll({
            ot: tx,
            index: "tid",
            key: tid
        }).then(function (players) {
            var i;
			
			players.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });

            countries = [];
            for (i = 0; i < 5; i++) {
                countries.push(players[i].born.country);
            }

			countries.sort();
								
			maxLength = 1;
			currentLength = 1;
			country = countries[0];								
			for (i = 1; i < countries.length; i++) {
				if (countries[i] ==  countries[i-1]) {
					currentLength += 1;
				} else {
					currentLength = 1;
				}
				if (currentLength > maxLength) {
					maxLength = currentLength;
					country = countries[i]; 
				}
				
			}			
			
			console.log(country);
            // Then, get any released players still owed money
            
        //}).then(function () {
          //      return contracts;
           // });
		   return Promise.all(country);
//        });
       // }).then(function () {
		//	return tx.complete();	
		});
	//	 return tx.complete().then(function () {
		
	//	return tx.complete();		
    }	*/
	
   /**
     * Update team strategies (contending or rebuilding) for every team in the league.
     *
     * Basically.. switch to rebuilding if you're old and your success is fading, and switch to contending if you have a good amount of young talent on rookie deals and your success is growing.
     *
     * @memberOf core.team
     * @return {Promise}
     */
    function updateCountry() {
        var tx;
        var countries,country;
		var maxLength, currentLength;

        tx = dao.tx(["players", "playerStats", "teams"], "readwrite");
        dao.teams.iterate({
            ot: tx,
            callback: function (t) {

                // Young stars
                return dao.players.getAll({
                    ot: tx,
                    index: "tid",
                    key: t.tid,
                    statsSeasons: [g.season],
                    statsTid: t.tid
                }).then(function (players) {
                    var i,updated;

					var s;
					s = t.seasons.length - 1;					
					///////// update image per season as well
					
					
                    players = player.filter(players, {
                        season: g.season,
                        tid: t.tid,
                        attrs: ["born","rosterOrder"]
                    });

					
				   var i;
					
					players.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });

					countries = [];
//					for (i = 0; i < 5; i++) {
					for (i = 0; i < players.length; i++) {
						countries.push(players[i].born.country);
					}

					countries.sort();
										
					maxLength = 1;
					currentLength = 1;
					country = countries[0];								
					for (i = 1; i < countries.length; i++) {
						if (countries[i] ==  countries[i-1]) {
							currentLength += 1;
						} else {
							currentLength = 1;
						}
						if (currentLength > maxLength) {
							maxLength = currentLength;
							country = countries[i]; 
						}
						
					}							
					
                    updated = false;	
				//	console.log(t.tid+" "+maxLength+" "+t.countrySpecific+" "+t.country+" "+country);
                    if  ((maxLength>2) && (t.countrySpecific === country)) {
						t.imgURLCountry = getCountryImage2(t.countrySpecific);		
						//t.imgURLCountry = getCountryImage(country);
					//	console.log(t.tid+" "+t.imgURLCountry);			
						updated = true;	
                    } else if  ((maxLength<=2) && (t.country === t.countrySpecific)) {
						if (t.countrySpecific == "EU") {
							t.imgURLCountry = getCountryImage2(t.countrySpecific);													
							updated = true;	
						}		
								
						//t.imgURLCountry = getRegionImage(t.country);						
					//	console.log(t.imgURLCountry);						
                    } else if  (maxLength<=2) {
                        t.countrySpecific = t.country;
						if (t.country == "NA") {
							t.imgURLCountry = getCountryImage2("United States");													
						} else {
//							t.imgURLCountry = getCountryImage2(t.country);													
							t.imgURLCountry = getCountryImage2(t.countrySpecific);													
						}
						
						//t.imgURLCountry = getRegionImage(t.country);
					//	console.log(t.imgURLCountry);						
                        updated = true;						
                    } else  {
                        t.countrySpecific = country;
					//	if (t.country == "NA") {
					//		t.imgURLCountry = getCountryImage2("United States");													
					//	} else {
//							t.imgURLCountry = getCountryImage2(t.country);													
							t.imgURLCountry = getCountryImage2(t.countrySpecific);													
					//	}						
						//t.imgURLCountry = getCountryImage2(country);
						//console.log(t.tid+" "+t.imgURLCountry);
                        updated = true;
                    }
					//console.log(maxLength+" "+t.region+" "+t.imgURLCountry);
                    if (updated) {
						
						t.seasons[s].imgURLCountry = t.imgURLCountry;
						t.seasons[s].countrySpecific = t.countrySpecific;
						
                        return t;
                    }
                });
            }
        });

        return tx.complete();
    }
	
	
   /**
     * Get the total current payroll for a team.
     *
     * This includes players who have been released but are still owed money from their old contracts.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @return {Promise.<number, Array=>} Resolves to an array; first argument is the payroll in thousands of dollars, second argument is the array of contract objects from dao.contracts.getAll.
     */
    function getPositions(tx, tid) {
        tx = dao.tx(["players"], "readonly", tx);

		
      return dao.players.getAll({
            ot: tx,
            index: "tid",
            key: tid
        }).then(function (players) {
            var i,positions;

            positions = [];
            for (i = 0; i < players.length; i++) {
            //for (i = 0; i < 5; i++) {
			//	console.log(i+" "+players[i].rosterOrder);
				if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) { 
					positions.push(players[i].pos);
				}
            }
		
            // Then, get any released players still owed money
            return [positions];
		});				       
    }		
	
   /**
     * Get the total current payroll for a team.
     *
     * This includes players who have been released but are still owed money from their old contracts.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @return {Promise.<number, Array=>} Resolves to an array; first argument is the payroll in thousands of dollars, second argument is the array of contract objects from dao.contracts.getAll.
     */
    function getRegions(tx, tid) {
        tx = dao.tx(["players"], "readonly", tx);

		
      return dao.players.getAll({
            ot: tx,
            index: "tid",
            key: tid
        }).then(function (players) {
            var i,regions;

            regions = [];
            for (i = 0; i < players.length; i++) {
			//	console.log(players[i].rosterOrder);
            //for (i = 0; i < 5; i++) {
			//	console.log(i+" "+players[i].rosterOrder);
				if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
					regions.push(players[i].born.loc);
				}
            }
		
            // Then, get any released players still owed money
            return [regions];
		});				       
    }	
	
   /**
     * Get the total current payroll for a team.
     *
     * This includes players who have been released but are still owed money from their old contracts.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @return {Promise.<number, Array=>} Resolves to an array; first argument is the payroll in thousands of dollars, second argument is the array of contract objects from dao.contracts.getAll.
     */
    function getCountries(tx, tid) {
        tx = dao.tx(["players"], "readonly", tx);

		
      return dao.players.getAll({
            ot: tx,
            index: "tid",
            key: tid
        }).then(function (players) {
            var i,regions;

            regions = [];
            for (i = 0; i < players.length; i++) {
			//	console.log(players[i].rosterOrder);
            //for (i = 0; i < 5; i++) {
			//	console.log(i+" "+players[i].rosterOrder);
				if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
					regions.push(players[i].born.country);
				}
            }
		
            // Then, get any released players still owed money
            return [regions];
		});				       
    }		
	
    /**
     * Get the total current payroll for a team.
     *
     * This includes players who have been released but are still owed money from their old contracts.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @return {Promise.<number, Array=>} Resolves to an array; first argument is the payroll in thousands of dollars, second argument is the array of contract objects from dao.contracts.getAll.
     */
    function getPayroll(tx, tid) {
        tx = dao.tx(["players", "releasedPlayers"], "readonly", tx);

        return getContracts(tx, tid).then(function (contracts) {
            var i, payroll;

            payroll = 0;
            for (i = 0; i < contracts.length; i++) {
			//	console.log(typeof payroll);
			//	console.log(typeof contracts[i].amount);				
			//	console.log(payroll);
                payroll += Number(contracts[i].amount);  // No need to check exp, since anyone without a contract for the current season will not have an entry
			    //console.log(i+" "+contracts[i].amount+" "+payroll);
            }
			//	console.log(payroll);
            return [payroll, contracts];
        });
    }

    /**
     * Get the total current payroll for every team team.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} ot An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
     * @return {Promise} Resolves to an array of payrolls, ordered by team id.
     */
    function getPayrolls(tx) {
        var promises, tid;

        tx = dao.tx(["players", "releasedPlayers"], "readonly", tx);

        promises = [];
        for (tid = 0; tid < g.numTeams; tid++) {
            promises.push(getPayroll(tx, tid).get(0));
        }

        return Promise.all(promises);
    }

    /**
     * Retrieve a filtered team object (or an array of player objects) from the database by removing/combining/processing some components.
     *
     * This can be used to retrieve information about a certain season, compute average statistics from the raw data, etc.
     *
     * This is similar to player.filter, but has some differences. If only one season is requested, the attrs, seasonAttrs, and stats properties will all be merged on the root filtered team object for each team. "stats" is broken out into its own property only when multiple seasons are requested (options.season is undefined). "seasonAttrs" should behave similarly, but it currently doesn't because it just hasn't been used that way anywhere yet.
     *
     * @memberOf core.team
     * @param {Object} options Options, as described below.
     * @param {number=} options.season Season to retrieve stats/ratings for. If undefined, return stats for all seasons in a list called "stats".
     * @param {number=} options.tid Team ID. Set this if you want to return only one team object. If undefined, an array of all teams is returned, ordered by tid by default.
     * @param {Array.<string>=} options.attrs List of team attributes to include in output (e.g. region, abbrev, name, ...).
     * @param {Array.<string>=} options.seasonAttrs List of seasonal team attributes to include in output (e.g. won, lost, payroll, ...).
     * @param {Array.<string=>} options.stats List of team stats to include in output (e.g. fg, orb, ast, blk, ...).
     * @param {boolean=} options.totals Boolean representing whether to return total stats (true) or per-game averages (false); default is false.
     * @param {boolean=} options.playoffs Boolean representing whether to return playoff stats or not; default is false. Unlike player.filter, team.filter returns either playoff stats or regular season stats, never both.
     * @param {string=} options.sortby Sorting method. "winp" sorts by descending winning percentage. If undefined, then teams are returned in order of their team IDs (which is alphabetical, currently).
     * @param {IDBTransaction|null=} options.ot An IndexedDB transaction on players, releasedPlayers, and teams; if null/undefined, then a new transaction will be used.
     * @return {Promise.(Object|Array.<Object>)} Filtered team object or array of filtered team objects, depending on the inputs.
     */
    function filter(options) {
        var filterAttrs, filterSeasonAttrs, filterStats, filterStatsPartial;

if (arguments[1] !== undefined) { throw new Error("No cb should be here"); }

        options = options !== undefined ? options : {};
        options.season = options.season !== undefined ? options.season : null;
        options.tid = options.tid !== undefined ? options.tid : null;
        options.attrs = options.attrs !== undefined ? options.attrs : [];
        options.seasonAttrs = options.seasonAttrs !== undefined ? options.seasonAttrs : [];
        options.stats = options.stats !== undefined ? options.stats : [];
        options.totals = options.totals !== undefined ? options.totals : false;
        options.playoffs = options.playoffs !== undefined ? options.playoffs : false;
        options.sortBy = options.sortBy !== undefined ? options.sortBy : "";

        // Copys/filters the attributes listed in options.attrs from p to fp.
        filterAttrs = function (ft, t, options) {
            var j;

            for (j = 0; j < options.attrs.length; j++) {
                if (options.attrs[j] === "budget") {
                    ft.budget = helpers.deepCopy(t.budget);
                    _.each(ft.budget, function (value, key) {
                        if (key !== "ticketPrice") {  // ticketPrice is the only thing in dollars always
                            value.amount /= 1;
                        }
                    });
                } else {
                    ft[options.attrs[j]] = t[options.attrs[j]];
                }
            }
        };

        // Copys/filters the seasonal attributes listed in options.seasonAttrs from p to fp.
        filterSeasonAttrs = function (ft, t, options) {
            var j,i, lastTenLost, lastTenWon, tsa;

			//console.log(options.seasonAttrs.length);				

            if (options.seasonAttrs.length > 0) {
			//console.log(t.seasons.length);				
                for (i = 0; i < t.seasons.length; i++) {
			//console.log(t.seasons[i].season+" "+options.season);				
                    if (t.seasons[i].season === options.season) {
                        tsa = t.seasons[i];
						tsa.revenue = _.reduce(tsa.revenues, function (memo, revenue) { return memo + revenue.amount; }, 0);
						tsa.expense = _.reduce(tsa.expenses, function (memo, expense) { return memo + expense.amount; }, 0);
						
					   for (j = 0; j < options.seasonAttrs.length; j++) {
							if (options.seasonAttrs[j] === "winp") {
								ft.winp = 0;
								if (tsa.won + tsa.lost > 0) {
									ft.winp = tsa.won / (tsa.won + tsa.lost);
								}
							} else if (options.seasonAttrs[j] === "att") {
								ft.att = 0;
								if (!tsa.hasOwnProperty("gpHome")) { tsa.gpHome = Math.round(tsa.gp / 2); } // See also game.js and teamFinances.js
								if (tsa.gpHome > 0) {
									ft.att = tsa.att / tsa.gpHome;

								}
							} else if (options.seasonAttrs[j] === "cash") {
								ft.cash = tsa.cash / 1000;  // [millions of dollars]
							} else if (options.seasonAttrs[j] === "revenue") {
								ft.revenue = tsa.revenue / 1000;  // [millions of dollars]
							} else if (options.seasonAttrs[j] === "profit") {
								ft.profit = (tsa.revenue - tsa.expense) / 1000;  // [millions of dollars]
							} else if (options.seasonAttrs[j] === "salaryPaid") {
								ft.salaryPaid = tsa.expenses.salary.amount / 1000;  // [millions of dollars]
							} else if (options.seasonAttrs[j] === "payroll") {
								// Handled later
								ft.payroll = null;
							} else if (options.seasonAttrs[j] === "lastTen") {
								lastTenWon = _.reduce(tsa.lastTen, function (memo, num) { return memo + num; }, 0);
								lastTenLost = tsa.lastTen.length - lastTenWon;
								ft.lastTen = lastTenWon + "-" + lastTenLost;
							} else if (options.seasonAttrs[j] === "streak") {  // For standings
								if (tsa.streak === 0) {
									ft.streak = "None";
								} else if (tsa.streak > 0) {
									ft.streak = "Won " + tsa.streak;
								} else if (tsa.streak < 0) {
									ft.streak = "Lost " + Math.abs(tsa.streak);
								}
							} else {
								ft[options.seasonAttrs[j]] = tsa[options.seasonAttrs[j]];
							}
						}						
						
						
                        break;
                    }
                }

// Sometimes get an error when switching to team finances page
//if (tsa.revenues === undefined) { debugger; }
                // Revenue and expenses calculation
//                tsa.revenue = _.reduce(tsa.revenues, function (memo, revenue) { return memo + revenue.amount; }, 0);
//                tsa.expense = _.reduce(tsa.expenses, function (memo, expense) { return memo + expense.amount; }, 0);

       /*         for (j = 0; j < options.seasonAttrs.length; j++) {
                    if (options.seasonAttrs[j] === "winp") {
                        ft.winp = 0;
                        if (tsa.won + tsa.lost > 0) {
                            ft.winp = tsa.won / (tsa.won + tsa.lost);
                        }
                    } else if (options.seasonAttrs[j] === "att") {
                        ft.att = 0;
                        if (tsa.wonHome > 0 || tsa.lostHome > 0) {
                            ft.att = tsa.att / (tsa.wonHome + tsa.lostHome+tsa.wonAway + tsa.lostAway);
                        }
                    } else if (options.seasonAttrs[j] === "cash") {
                        ft.cash = tsa.cash / 1000;  // [millions of dollars]
                    } else if (options.seasonAttrs[j] === "revenue") {
                        ft.revenue = tsa.revenue / 1000;  // [millions of dollars]
                    } else if (options.seasonAttrs[j] === "profit") {
                        ft.profit = (tsa.revenue - tsa.expense) / 1000;  // [millions of dollars]
                    } else if (options.seasonAttrs[j] === "salaryPaid") {
                        ft.salaryPaid = tsa.expenses.salary.amount / 1000;  // [millions of dollars]
                    } else if (options.seasonAttrs[j] === "payroll") {
                        // Handled later
                        ft.payroll = null;
                    } else if (options.seasonAttrs[j] === "lastTen") {
                        lastTenWon = _.reduce(tsa.lastTen, function (memo, num) { return memo + num; }, 0);
                        lastTenLost = tsa.lastTen.length - lastTenWon;
                        ft.lastTen = lastTenWon + "-" + lastTenLost;
                    } else if (options.seasonAttrs[j] === "streak") {  // For standings
                        if (tsa.streak === 0) {
                            ft.streak = "None";
                        } else if (tsa.streak > 0) {
                            ft.streak = "Won " + tsa.streak;
                        } else if (tsa.streak < 0) {
                            ft.streak = "Lost " + Math.abs(tsa.streak);
                        }
                    } else {
                        ft[options.seasonAttrs[j]] = tsa[options.seasonAttrs[j]];
                    }
                }*/
            }
        };

        // Filters s by stats (which should be options.stats) into ft. This is to do one season of stats filtering.
        filterStatsPartial = function (ft, s, stats) {
            var j;

            if (s !== undefined && s.gp > 0) {
                for (j = 0; j < stats.length; j++) {
				   
                    if (stats[j] === "gp") {
                        ft.gp = s.gp;
                /*    } else if (stats[j] === "fgp") {
                        if (s.fga > 0) {
                            ft.fgp = 100 * s.fg / s.fga;
                        } else {
                            ft.fgp = 0;
                        }
                    } else if (stats[j] === "fgpAtRim") {
                        if (s.fgaAtRim > 0) {
                            ft.fgpAtRim = 100 * s.fgAtRim / s.fgaAtRim;
                        } else {
                            ft.fgpAtRim = 0;
                        }
                    } else if (stats[j] === "fgpLowPost") {
                        if (s.fgaLowPost > 0) {
                            ft.fgpLowPost = 100 * s.fgLowPost / s.fgaLowPost;
                        } else {
                            ft.fgpLowPost = 0;
                        }
                    } else if (stats[j] === "fgpMidRange") {
                        if (s.fgaMidRange > 0) {
                            ft.fgpMidRange = 100 * s.fgMidRange / s.fgaMidRange;
                        } else {
                            ft.fgpMidRange = 0;
                        }
                    } else if (stats[j] === "tpp") {
                        if (s.tpa > 0) {
                            ft.tpp = 100 * s.tp / s.tpa;
                        } else {
                            ft.tpp = 0;
                        }
                    } else if (stats[j] === "ftp") {
                        if (s.fta > 0) {
                            ft.ftp = 100 * s.ft / s.fta;
                        } else {
                            ft.ftp = 0;
                        }*/
                    } else if (stats[j] === "kda") {
                        //ft.kda = ft.pts - ft.oppPts;
					//	console.log(s.fg+" "+s.fga+" "+s.fgp)
                       if (s.fga > 0) {
                            ft.kda = (s.fg+s.fgp) /s.fga;
                         //   row.kda = s.kda;
					//	console.log(ft.kda);						 
                        } else {
                            ft.kda = 0;
					//	console.log(ft.kda);							
                        }						
					//	console.log(ft.kda);
                    } else if (stats[j] === "diff") {
                        ft.diff = ft.pts - ft.oppPts;
                    } else if (stats[j] === "diffTower") {
                        ft.diff =  (ft.pf - ft.oppTw);
                    } else if (stats[j] === "season") {
                        ft.season = s.season;
                    } else {
                        if (options.totals) {
                            ft[stats[j]] = s[stats[j]];
                        } else {
                            ft[stats[j]] = s[stats[j]] / s.gp;
						/*	if (stats[j] == "min") {
							  console.log(ft[stats[j]]);
							}*/
                        }
                    }
                }
            } else {
                for (j = 0; j < stats.length; j++) {
                    if (stats[j] === "season") {
                        ft.season = s.season;
                    } else {
                        ft[stats[j]] = 0;
                    }
                }
            }

            return ft;
        };

        // Copys/filters the stats listed in options.stats from p to fp.
        filterStats = function (ft, t, options) {
            var i, j, ts;

            if (options.stats.length > 0) {
                if (options.season !== null) {
                    // Single season
                    for (j = 0; j < t.stats.length; j++) {
                        if (t.stats[j].season === options.season && t.stats[j].playoffs === options.playoffs) {
                            ts = t.stats[j];
                            break;
                        }
                    }
                } else {
                    // Multiple seasons
                    ts = [];
                    for (j = 0; j < t.stats.length; j++) {
                        if (t.stats[j].playoffs === options.playoffs) {
                            ts.push(t.stats[j]);
                        }
                    }
                }
            }

            if (ts !== undefined && ts.length >= 0) {
                ft.stats = [];
                // Multiple seasons
                for (i = 0; i < ts.length; i++) {
                    ft.stats.push(filterStatsPartial({}, ts[i], options.stats));
                }
            } else {
                // Single seasons - merge stats with root object
                ft = filterStatsPartial(ft, ts, options.stats);
            }
        };

        return dao.teams.getAll({ot: options.ot, key: options.tid}).then(function (t) {
            var ft, fts, i, returnOneTeam, savePayroll, sortBy;

            // t will be an array of g.numTeams teams (if options.tid is null) or an array of 1 team. If 1, then we want to return just that team object at the end, not an array of 1 team.
            returnOneTeam = false;
            if (t.length === 1) {
                returnOneTeam = true;
            }

            fts = [];

            for (i = 0; i < t.length; i++) {
                ft = {};
                filterAttrs(ft, t[i], options);
                filterSeasonAttrs(ft, t[i], options);
                filterStats(ft, t[i], options);
                fts.push(ft);
            }

            if (Array.isArray(options.sortBy)) {
                // Sort by multiple properties
                sortBy = options.sortBy.slice();
                fts.sort(function (a, b) {
                    var result;

                    for (i = 0; i < sortBy.length; i++) {
                        result = (sortBy[i].indexOf("-") === 1) ? a[sortBy[i]] - b[sortBy[i]] : b[sortBy[i]] - a[sortBy[i]];

                        if (result || i === sortBy.length - 1) {
                            return result;
                        }
                    }
                });
            } else if (options.sortBy === "winp") {
                // Sort by winning percentage, descending
                fts.sort(function (a, b) { return b.winp - a.winp; });
            }

            // If payroll for the current season was requested, find the current payroll for each team. Otherwise, don't.
            if (options.seasonAttrs.indexOf("payroll") < 0 || options.season !== g.season) {
                return returnOneTeam ? fts[0] : fts;
            }

            savePayroll = function (i) {
                return getPayroll(options.ot, t[i].tid).get(0).then(function (payroll) {
                    fts[i].payroll = payroll ;
//                    fts[i].payroll = payroll ;
                    if (i === fts.length - 1) {
                        return returnOneTeam ? fts[0] : fts;
                    }

                    return savePayroll(i + 1);
                });
            };
            return savePayroll(0);
        });
    }

    // estValuesCached is either a copy of estValues (defined below) or null. When it's cached, it's much faster for repeated calls (like trading block).
    function valueChange(tid, pidsAdd, pidsRemove, dpidsAdd, dpidsRemove, estValuesCached) {
        var add, getPicks, getPlayers, gpAvg, payroll, pop, remove, roster, strategy, tx;

        // UGLY HACK: Don't include more than 2 draft picks in a trade for AI team
        if (dpidsRemove.length > 100) {
            //return -1;
			return Promise.resolve(-1);
        }

        // Get value and skills for each player on team or involved in the proposed transaction
        roster = [];
        add = [];
        remove = [];

        tx = dao.tx(["draftPicks", "players", "releasedPlayers", "teams"]);

        // Get players
        getPlayers = function () {
            var fudgeFactor, i;

            // Fudge factor for AI overvaluing its own players
            if (tid !== g.userTid) {
                fudgeFactor = 1.05;
            } else {
                fudgeFactor = 1;
            }

            // Get roster and players to remove
            dao.players.getAll({
                ot: tx,
                index: "tid",
                key: tid
            }).then(function (players) {
                var i, p;

                for (i = 0; i < players.length; i++) {
                    p = players[i];

                    if (pidsRemove.indexOf(p.pid) < 0) {
                        roster.push({
                            value: p.value,
                            skills: _.last(p.ratings).skills,
                            contract: p.contract,
                            worth: player.genContract(p, false, false, true),
                            injury: p.injury,
                            age: g.season - p.born.year
                        });
                    } else {
                        remove.push({
                            value: p.value * fudgeFactor,
                            skills: _.last(p.ratings).skills,
                            contract: p.contract,
                            worth: player.genContract(p, false, false, true),
                            injury: p.injury,
                            age: g.season - p.born.year
                        });
                    }
                }
            });

            // Get players to add
            for (i = 0; i < pidsAdd.length; i++) {
                dao.players.get({
                    ot: tx,
                    key: pidsAdd[i]
                }).then(function (p) {
                    add.push({
                        value: p.valueWithContract,
                        skills: _.last(p.ratings).skills,
                        contract: p.contract,
                        worth: player.genContract(p, false, false, true),
                        injury: p.injury,
                        age: g.season - p.born.year
                    });
                });
            }
        };

        getPicks = function () {
            // For each draft pick, estimate its value based on the recent performance of the team
            if (dpidsAdd.length > 0 || dpidsRemove.length > 0) {
                // Estimate the order of the picks by team
                dao.teams.getAll({ot: tx}).then(function (teams) {
                    var estPicks, estValues, gp, i, rCurrent, rLast, rookieSalaries, s, sorted, t, withEstValues, wps;

                    // This part needs to be run every time so that gpAvg is available
                    wps = []; // Contains estimated winning percentages for all teams by the end of the season
                    for (i = 0; i < teams.length; i++) {
                        t = teams[i];
                        s = t.seasons.length;
                        if (t.seasons.length === 1) {
                            // First season
                            if (t.seasons[0].won + t.seasons[0].lost > 8) {
                                rCurrent = [t.seasons[0].won, t.seasons[0].lost];
                            } else {
                                // Fix for new leagues - don't base this on record until we have some games played, and don't let the user's picks be overvalued
                                if (i === g.userTid) {
                                    rCurrent = [24, 0];
                                } else {
                                    rCurrent = [0, 24];
                                }
                            }
                            if (i === g.userTid) {
                                rLast = [12, 8];
                            } else {
                                rLast = [8, 12]; // Assume a losing season to minimize bad trades
                            }
                        } else {
                            // Second (or higher) season
                            rCurrent = [t.seasons[s - 1].won, t.seasons[s - 1].lost];
                            rLast = [t.seasons[s - 2].won, t.seasons[s - 2].lost];
                        }

                        gp = rCurrent[0] + rCurrent[1]; // Might not be "real" games played

                        // If we've played half a season, just use that as an estimate. Otherwise, take a weighted sum of this and last year
                        if (gp >= 8) {
                            wps.push(rCurrent[0] / gp);
                        } else if (gp > 0) {
                            wps.push((gp / 8 * rCurrent[0] / gp + (8 - gp) / 8 * rLast[0] / 24));
                        } else {
                            wps.push(rLast[0] / 24);
                        }
                    }

                    // Get rank order of wps http://stackoverflow.com/a/14834599/786644
                    sorted = wps.slice().sort(function (a, b) { return a - b; });
                    estPicks = wps.slice().map(function (v) { return sorted.indexOf(v) + 1; }); // For each team, what is their estimated draft position?

                    rookieSalaries = require("core/draft").getRookieSalaries();

                    // Actually add picks after some stuff below is done
                    withEstValues = function () {
                        var i;

                        for (i = 0; i < dpidsAdd.length; i++) {
                            dao.draftPicks.get({ot: tx, key: dpidsAdd[i]}).then(function (dp) {
                                var estPick, seasons, value;

                                estPick = estPicks[dp.originalTid];

                                // For future draft picks, add some uncertainty
                                seasons = dp.season - g.season;
                                estPick = Math.round(estPick * (5 - seasons) / 5 + 15 * seasons / 5);

                                // No fudge factor, since this is coming from the user's team (or eventually, another AI)
                                if (estValues[dp.season]) {
                                    value = estValues[dp.season][estPick - 1 + g.numTeams * (dp.round - 1)];
                                }
                                if (!value) {
                                    value = estValues.default[estPick - 1 + g.numTeams * (dp.round - 1)];
                                }

                                add.push({
                                    value: value,
                                    skills: [],
                                    contract: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)],
                                        exp: dp.season + 2 + (2 - dp.round) // 3 for first round, 2 for second
                                    },
                                    worth: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)],
                                        exp: dp.season + 2 + (2 - dp.round) // 3 for first round, 2 for second
                                    },
                                    injury: {type: "Healthy", gamesRemaining: 0},
                                    age: 19,
                                    draftPick: true
                                });
                            });
                        }

                        for (i = 0; i < dpidsRemove.length; i++) {
                            dao.draftPicks.get({ot: tx, key: dpidsRemove[i]}).then(function (dp) {
                                var estPick, fudgeFactor, seasons, value;

                                estPick = estPicks[dp.originalTid];

                                // For future draft picks, add some uncertainty
                                seasons = dp.season - g.season;
                                estPick = Math.round(estPick * (5 - seasons) / 5 + 15 * seasons / 5);

                                // Set fudge factor with more confidence if it's the current season
                                if (seasons === 0 && gp >= 8) {
                                    fudgeFactor = (1 - gp / 24) * 5;
                                } else {
                                    fudgeFactor = 5;
                                }

                                // Use fudge factor: AI teams like their own picks
                                if (estValues[dp.season]) {
                                    value = estValues[dp.season][estPick - 1 + g.numTeams * (dp.round - 1)] + (tid !== g.userTid) * fudgeFactor;
                                }
                                if (!value) {
                                    value = estValues.default[estPick - 1 + g.numTeams * (dp.round - 1)] + (tid !== g.userTid) * fudgeFactor;
                                }

                                remove.push({
                                    value: value,
                                    skills: [],
                                    contract: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)] / 1000,
                                        exp: dp.season + 2 + (2 - dp.round) // 3 for first round, 2 for second
                                    },
                                    worth: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)] / 1000,
                                        exp: dp.season + 2 + (2 - dp.round) // 3 for first round, 2 for second
                                    },
                                    injury: {type: "Healthy", gamesRemaining: 0},
                                    age: 19,
                                    draftPick: true
                                });
                            });
                        }
                    };

                    if (estValuesCached) {
                        estValues = estValuesCached;
                        withEstValues();
                    } else {
                        require("core/trade").getPickValues(tx).then(function (newEstValues) {
                            estValues = newEstValues;
                            withEstValues();
                        });
                    }
                });
            }
        };

        // Get team strategy and population, for future use
        filter({
            attrs: ["strategy"],
            seasonAttrs: ["pop"],
            stats: ["gp"],
            season: g.season,
            tid: tid,
            ot: tx
        }).then(function (t) {
            strategy = t.strategy;
            pop = t.pop;
            if (pop > 20) {
                pop = 20;
            }
            gpAvg = t.gp; // Ideally would be done separately for each team, but close enough

            getPlayers();
            getPicks();
        });

        getPayroll(tx, tid).then(function (payrollLocal) {
            payroll = payrollLocal;
        });

        return tx.complete().then(function () {
            var base, contractsFactor, doSkillBonuses, dv, rosterAndAdd, rosterAndRemove, salaryAddedThisSeason, salaryRemoved, skillsNeeded, sumContracts, sumValues;

            gpAvg = helpers.bound(gpAvg, 0, 6);

/*            // Handle situations where the team goes over the roster size limit
            if (roster.length + remove.length > 15) {
                // Already over roster limit, so don't worry unless this trade actually makes it worse
                needToDrop = (roster.length + add.length) - (roster.length + remove.length);
            } else {
                needToDrop = (roster.length + add.length) - 15;
            }
            roster.sort(function (a, b) { return a.value - b.value; }); // Sort by value, ascending
            add.sort(function (a, b) { return a.value - b.value; }); // Sort by value, ascending
            while (needToDrop > 0) {
                // Find lowest value player, from roster or add. Delete him and move his salary to the second lowest value player.
                if (roster[0].value < add[0].value) {
                    if (roster[1].value < add[0].value) {
                        roster[1].contract.amount += roster[0].contract.amount;
                    } else {
                        add[0].contract.amount += roster[0].contract.amount;
                    }
                    roster.shift(); // Remove from value calculation
                } else {
                    if (add.length > 1 && add[1].value < roster[0].value) {
                        add[1].contract.amount += add[0].contract.amount;
                    } else {
                        roster[0].contract.amount += add[0].contract.amount;
                    }
                    add.shift(); // Remove from value calculation
                }

                needToDrop -= 1;
            }*/

            // This roughly corresponds with core.gameSim.updateSynergy
            skillsNeeded = {
                SC: 1,
                TP: 2,
                JC: 1,
                Tw: 3,
                CK: 3,
                CS: 3,
                Ag: 0
            };
			
		

            doSkillBonuses = function (test, roster) {
                var i, j, rosterSkills, rosterSkillsCount, s;

                // What are current skills?
                rosterSkills = [];
                for (i = 0; i < roster.length; i++) {
                    if (roster[i].value >= 0) {
//                    if (roster[i].value >= 45) {
                        rosterSkills.push(roster[i].skills);
                    }
                }
                rosterSkills = _.flatten(rosterSkills);
                rosterSkillsCount = _.countBy(rosterSkills);

                // Sort test by value, so that the highest value players get bonuses applied first
                test.sort(function (a, b) { return b.value - a.value; });

                for (i = 0; i < test.length; i++) {
//                    if (test.value >= 45) {
//                    if (test.value >= 45) {
                    if (test.value >= 0) {
                        for (j = 0; j < test[i].skills.length; j++) {
                            s = test[i].skills[j];

                            if (rosterSkillsCount[s] <= skillsNeeded[s] - 2) {
                                // Big bonus
                                test.value *= 1.1;
                            } else if (rosterSkillsCount[s] <= skillsNeeded[s] - 1) {
                                // Medium bonus
                                test.value *= 1.05;
                            } else if (rosterSkillsCount[s] <= skillsNeeded[s]) {
                                // Little bonus
                                test.value *= 1.025;
                            }

                            // Account for redundancy in test
                            rosterSkillsCount[s] += 1;
                        }
                    }
                }

				
				
                return test;
            };

            // Apply bonuses based on skills coming in and leaving
            rosterAndRemove = roster.concat(remove);
            rosterAndAdd = roster.concat(add);
            add = doSkillBonuses(add, rosterAndRemove);
            remove = doSkillBonuses(remove, rosterAndAdd);

            base = 1.25;

            sumValues = function (players, includeInjuries) {
                var exponential;

                includeInjuries = includeInjuries !== undefined ? includeInjuries : false;

                if (players.length === 0) {
                    return 0;
                }

                exponential = _.reduce(players, function (memo, p) {
                    var contractSeasonsRemaining, contractValue, playerValue, value;

                    playerValue = p.value;
			//	console.log(playerValue);
                  //  if (strategy === "rebuilding") {
                        // Value young/cheap players and draft picks more. Penalize expensive/old players
                        if (p.draftPick) {
                            playerValue *= 1.15;
                        } else {
                            if (p.age <= 18) {
                                playerValue *= 1.20;
                            } else if (p.age === 19) {
                                playerValue *= 1.15;
                            } else if (p.age === 20) {
                                playerValue *= 1.10;
                            } else if (p.age === 21) {
                                playerValue *= 1.10;
                            } else if (p.age === 22) {
                                playerValue *= 1.10;
                            } else if (p.age === 23) {
                                playerValue *= 1.07;
                            } else if (p.age === 24) {
                                playerValue *= 1.04;
                            } else if (p.age === 25) {
                                playerValue *= 0.99;
                            } else if (p.age === 26) {
                                playerValue *= 0.94;
                            } else if (p.age >= 27) {
                                playerValue *= 0.91;
                            }
                        }
                 //   }

                    // Anything below 45 is pretty worthless
//                    playerValue -= 45;
                    playerValue -= 0;
                    playerValue *= playerValue;
                    playerValue /= 100;
                    playerValue *= playerValue;
                    playerValue /= 100;
                    playerValue *= playerValue;
                    playerValue /= 100;


                    // Normalize for injuries
                    if (includeInjuries && tid !== g.userTid) {
                        if (p.injury.gamesRemaining > 75) {
                            playerValue -= playerValue * 0.75;
                        } else {
                            playerValue -= playerValue * p.injury.gamesRemaining / 100;
                        }
                    }

                    contractValue = (p.worth.amount - p.contract.amount) ;
//	console.log( playerValue+ " "+ contractValue+" "+p.worth.amount+" "+p.contract.amount);
					
                    // Account for duration
                    contractSeasonsRemaining = player.contractSeasonsRemaining(p.contract.exp, 6 - gpAvg);
                    if (contractSeasonsRemaining > 1) {
                        // Don't make it too extreme
                        contractValue *= Math.pow(contractSeasonsRemaining, 0.25);
//	console.log(contractValue+" "+p.worth.amount+" "+p.contract.amount);
                    } else {
                        // Raising < 1 to < 1 power would make this too large
                        contractValue *= contractSeasonsRemaining;
	//console.log( contractValue+" "+p.worth.amount+" "+p.contract.amount);
                    }

                    // Really bad players will just get no PT
                    if (playerValue < 0) {
                        playerValue = 0;
                    }
//console.log([playerValue, contractValue]);

//                    value = playerValue + 0.5 * contractValue;
                    value = playerValue ;
				//	console.log(value);
				//	console.log(value + " "+ contractValue+" "+p.worth.amount+" "+p.contract.amount);
//console.log(memo);
                    if (value === 0) {
                        return memo;
                    }
				/*	console.log(Math.pow(Math.abs(value), base))
					console.log(base);
					console.log(Math.abs(value));
					console.log(value);*/
                    return memo + Math.pow(Math.abs(value), base) * Math.abs(value) / value;
                }, 0);

                if (exponential === 0) {
                    return exponential;
                }
                return Math.pow(Math.abs(exponential), 1 / base) * Math.abs(exponential) / exponential;
            };

            // Sum of contracts
            // If onlyThisSeason is set, then amounts after this season are ignored and the return value is the sum of this season's contract amounts in millions of dollars
            sumContracts = function (players, onlyThisSeason) {
                var sum;

                onlyThisSeason = onlyThisSeason !== undefined ? onlyThisSeason : false;

                if (players.length === 0) {
                    return 0;
                }

                sum = _.reduce(players, function (memo, p) {
                    if (p.draftPick) {
                        return memo;
                    }

//                    return memo + p.contract.amount / 1000 * Math.pow(player.contractSeasonsRemaining(p.contract.exp, 24 - gpAvg), 0.25 - (onlyThisSeason ? 0.25 : 0));
                    return memo + p.contract.amount  * Math.pow(player.contractSeasonsRemaining(p.contract.exp, 24 - gpAvg), 0.25 - (onlyThisSeason ? 0.25 : 0));
                }, 0);

                return sum;
            };

        /*    if (strategy === "rebuilding") {
                contractsFactor = 0.3;
            } else {
                contractsFactor = 0.1;
            }*/

            salaryRemoved = sumContracts(remove) - sumContracts(add);

//            dv = sumValues(add, true) - sumValues(remove) + contractsFactor * salaryRemoved;

		/*	console.log(sumValues(add, true));
			console.log(sumValues(remove));
			console.log(add);
			console.log(remove);*/
			
            dv = sumValues(add, true) - sumValues(remove);
/*console.log("Added players/picks: " + sumValues(add, true));
console.log("Removed players/picks: " + (-sumValues(remove)));
console.log("Added contract quality: -" + contractExcessFactor + " * " + sumContractExcess(add));
console.log("Removed contract quality: -" + contractExcessFactor + " * " + sumContractExcess(remove));
console.log("Total contract amount: " + contractsFactor + " * " + salaryRemoved);*/

            // Aversion towards losing cap space in a trade during free agency
            if (g.phase >= g.PHASE.RESIGN_PLAYERS || g.phase <= g.PHASE.FREE_AGENCY) {
                // Only care if cap space is over 2 million
				//console.log(sumContracts(add, true));
			//	console.log(sumContracts(remove, true));
				
                if (payroll + 2000 < g.salaryCap) {
                    salaryAddedThisSeason = sumContracts(add, true) - sumContracts(remove, true);
					
                    // Only care if cap space is being used
                    if (salaryAddedThisSeason > 0) {
//console.log("Free agency penalty: -" + (0.2 + 0.8 * g.daysLeft / 30) * salaryAddedThisSeason);
                        dv -= (0.2 + 0.8 * g.daysLeft / 30) * salaryAddedThisSeason; // 0.2 to 1 times the amount, depending on stage of free agency
                    }
                }
            }

            // Normalize for number of players, since 1 really good player is much better than multiple mediocre ones
            // This is a fudge factor, since it's one-sided to punish the player
            if (add.length > remove.length) {
                dv -= add.length - remove.length;
            }
		//	console.log(dv);
            return dv;
/*console.log('---');
console.log([sumValues(add), sumContracts(add)]);
console.log([sumValues(remove), sumContracts(remove)]);
console.log(dv);*/
        });
    }

    /**
     * Update team strategies (contending or rebuilding) for every team in the league.
     *
     * Basically.. switch to rebuilding if you're old and your success is fading, and switch to contending if you have a good amount of young talent on rookie deals and your success is growing.
     *
     * @memberOf core.team
	 * @param {IDBTransaction} tx An IndexedDB transaction on players, playerStats, and teams, readwrite.	 	 
     * @return {Promise}
     */
    function updateStrategies(tx) {
        //var tx;

        //tx = dao.tx(["players", "playerStats", "teams"], "readwrite");
        return dao.teams.iterate({
            ot: tx,
            callback: function (t) {
                var dWon, s, won;

                // Skip user's team
                if ((t.tid === g.userTid) && g.autoPlaySeasons === 0) {
                    return;
                }

                // Change in wins
                s = t.seasons.length - 1;
                won = t.seasons[s].won;
                if (s > 0) {
                    dWon = won - t.seasons[s - 1].won;
                } else {
                    dWon = 0;
                }

                // Young stars
                return dao.players.getAll({
                    ot: tx,
                    index: "tid",
                    key: t.tid,
                    statsSeasons: [g.season],
                    statsTid: t.tid
                }).then(function (players) {
                    var age, denominator, i, numerator, score, updated, youngStar;

                    players = player.filter(players, {
                        season: g.season,
                        tid: t.tid,
                        attrs: ["age", "value", "contract"],
                        stats: ["min"]
                    });

                    youngStar = 0; // Default value

                    numerator = 0; // Sum of age * mp
                    denominator = 0; // Sum of mp
                    for (i = 0; i < players.length; i++) {
                        numerator += players[i].age * players[i].stats.min;
                        denominator += players[i].stats.min;

                        // Is a young star about to get a pay raise and eat up all the cap after this season?
                        if (players[i].value > 65 && players[i].contract.exp === g.season + 1 && players[i].contract.amount <= 5 && players[i].age <= 19) {
                            youngStar += 1;
                        }
                    }

                    // Average age, weighted by minutes played
                    age = numerator / denominator;

                    score = 0.8 * dWon + (won - 8) + 5 * (20 - age) + youngStar * 20;

                    updated = false;
                    if (score > 10 && t.strategy === "rebuilding") {
                        t.strategy = "contending";
                        updated = true;
                    } else if (score < -10 && t.strategy === "contending") {
                        t.strategy = "rebuilding";
                        updated = true;
                    }

                    if (updated) {
                        return t;
                    }
                });
            }
        });

     //   return tx.complete();
    }

    /**
     * Check roster size limits
     *
     * If any AI team is over the maximum roster size, cut their worst players.
     * If any AI team is under the minimum roster size, sign minimum contract
     * players until the limit is reached. If the user's team is breaking one of
     * these roster size limits, display a warning.
     *
     * @memberOf core.team
     * @return {Promise.?string} Resolves to null if there is no error, or a string with the error message otherwise.
     */
    function checkRosterSizes() {
        var checkRosterSize, minFreeAgents, minFreeAgentsTop, minFreeAgentsMid, minFreeAgentsJgl, minFreeAgentsADC, minFreeAgentsSup, tx, userTeamSizeError;

        checkRosterSize = function (tid) {
            return dao.players.getAll({ot: tx, index: "tid", key: tid}).then(function (players) {
                var i, numPlayersOnRoster, numPlayersOnRosterStart, p, promises;
				var numFromRegion;
				var addedPos;
				var top, mid, jgl, sup,adc,playersDropped;
				
				playersDropped = 0;

				promises = [];
				addedPos = [];
                numPlayersOnRoster = players.length;
                numPlayersOnRosterStart = players.length;				
				numFromRegion = 0;
				if (typeof(g.regionalRestrictions) == 'undefined') {
					numFromRegion = 10;
				} else if (!g.regionalRestrictions) {
					numFromRegion = 10;
				} else if (typeof(g.teamCountryCache) == 'undefined') {
					numFromRegion = 10;
				} else {
					for (i = 0; i < (numPlayersOnRoster); i++) {
					///for (i = 0; i < 5; i++) {
					//	console.log(i+" "+players[i].rosterOrder);
						if (players[i].born.loc == g.teamCountryCache[tid]) {
							if ((players[i].rosterOrder< 5) || (players[i].rosterOrder == 666)) {
								numFromRegion += 1;
							}
						}						
					}					
					//console.log(i+" "+numFromRegion);
					
				}

			//	players.sort(function (a, b) { return a.value - b.value; }); // Lowest first
				var top, mid, jgl, sup,adc,playersAdded;
				top = 0;
				mid = 0;
				jgl = 0;
				sup = 0;
				adc = 0;
				
				for (i = 0; i < (numPlayersOnRosterStart); i++) {
				//	console.log(numPlayersOnRoster+" "+i+" "+players[i].pos);
				   if (players[i].pos == "TOP") {
					  top += 1;
				   } else  if (players[i].pos == "MID") {
					  mid += 1;
				   } else  if (players[i].pos == "JGL") {
					  jgl += 1;
				   } else  if (players[i].pos == "SUP") {
					  sup += 1;
				   } else  if (players[i].pos == "ADC") {
					  adc += 1;
				   }
				   
//					player.release(tx, players[i], false);
				}				
				
				
				if (numPlayersOnRoster < g.minRosterSize) {
					if (g.userTids.indexOf(tid) >= 0   && g.autoPlaySeasons === 0) {
						if (g.userTids.length <= 1) {
							userTeamSizeError = 'Your team has ';
						} else {
							userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
						}
						userTeamSizeError += 'less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
					
//                    if (tid === g.userTid && g.autoPlaySeasons === 0) {
  //                      userTeamSizeError = 'Your team currently has less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
                    } else {
                        // Auto-add players
//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);

						//// Handle this by position
                     /*   while ((numPlayersOnRoster < g.minRosterSize) && (minFreeAgents.length>0)) {
                            p = minFreeAgents.shift();
                            p.tid = tid;
                            p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
                            p = player.setContract(p, p.contract, true);
                            p.gamesUntilTradable = 4;
							addedPos.push(p.pos);
                            eventLog.add(null, {
                                type: "freeAgent",
                                text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamNamesCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount / 1000, "M") + '/year through ' + p.contract.exp + '.',
                                showNotification: p.watch && typeof p.watch !== "function",
                                pids: [p.pid],
                                tids: [p.tid]
                            });							
                            promises.push(dao.players.put({ot: tx, value: p}));

                            numPlayersOnRoster += 1;
                        } */
						

						/*for (i = 0; i < (addedPos.length); i++) {
						//	console.log(numPlayersOnRoster+" "+i+" "+players[i].pos);							
						   if (addedPos[i] == "TOP") {
							  top += 1;
						   } else  if (addedPos[i] == "MID") {
							  mid += 1;
						   } else  if (addedPos[i] == "JGL") {
							  jgl += 1;
						   } else  if (addedPos[i] == "SUP") {
							  sup += 1;
						   } else  if (addedPos[i] == "ADC") {
							  adc += 1;
						   }
						   
		//					player.release(tx, players[i], false);
						}*/				
						
						playersAdded = 0;
						
						
						
						if ((top<1) && (minFreeAgentsTop.length > 0)) {
						//   console.log(minFreeAgentsTop.length);
						//   console.log(players.length);
						//   console.log(tid);


								p = minFreeAgentsTop.shift();
								while ((p.country != g.teamCountryCache[tid]) && (numFromRegion < 3) && (minFreeAgentsTop.length > 0)) {
									p = minFreeAgentsTop.shift();							
								} 			
								if (p.born.loc == g.teamCountryCache[tid]) {
							//	if (p.country == g.teamCountryCache[tid]) {				
									numFromRegion += 1;								
								}							
							//	console.log(p.pid+" "+p.tid+" "+tid);
								p.tid = tid;
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
								p = player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;

								eventLog.add(null, {
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount, "K") + '/year through ' + p.contract.exp + '.',
									showNotification: false,
									pids: [p.pid],
									tids: [p.tid]
								});						
								promises.push(dao.players.put({ot: tx, value: p}));
								numPlayersOnRoster += 1;				
								playersAdded += 1;
								top +=1;
							//}
						}
						if ((mid<1) && (minFreeAgentsMid.length > 0)) {
						
						   if (tid === g.userTid && g.autoPlaySeasons === 0) {
		//                        userTeamSizeError = 'Your team currently does not have a TOP position playerhas less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
							} else {
							
								p = minFreeAgentsMid.shift();
								while ((p.country != g.teamCountryCache[tid]) && (numFromRegion < 3) && (minFreeAgentsMid.length > 0)) {
									p = minFreeAgentsMid.shift();
								} 		
								if (p.born.loc == g.teamCountryCache[tid]) {
							//	if (p.country == g.teamCountryCache[tid]) {				
									numFromRegion += 1;							
								}													
								p.tid = tid;
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
								p = player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;

								eventLog.add(null, {
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount, "K") + '/year through ' + p.contract.exp + '.',
									showNotification: false,
									pids: [p.pid],
									tids: [p.tid]
								});						
								promises.push(dao.players.put({ot: tx, value: p}));
								numPlayersOnRoster += 1;	
								playersAdded += 1;
								mid +=1;					
							}
						}
						if ((jgl<1) && (minFreeAgentsJgl.length > 0)) {
						
						   if (tid === g.userTid && g.autoPlaySeasons === 0) {
		//                        userTeamSizeError = 'Your team currently does not have a TOP position playerhas less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
							} else {				
								p = minFreeAgentsJgl.shift();
								while ((p.country != g.teamCountryCache[tid]) && (numFromRegion < 3) && (minFreeAgentsJgl.length > 0)) {
									p = minFreeAgentsJgl.shift();
								} 							
								if (p.born.loc == g.teamCountryCache[tid]) {
							//	if (p.country == g.teamCountryCache[tid]) {				
									numFromRegion += 1;								
								}													
								p.tid = tid;
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
								p = player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;

								eventLog.add(null, {
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount, "K") + '/year through ' + p.contract.exp + '.',
									showNotification: false,
									pids: [p.pid],
									tids: [p.tid]
								});						
								promises.push(dao.players.put({ot: tx, value: p}));
								numPlayersOnRoster += 1;				
								playersAdded += 1;					
								jgl +=1;
							}
						}
						if ((adc<1) && (minFreeAgentsADC.length > 0)) {
						   if (tid === g.userTid && g.autoPlaySeasons === 0) {
		//                        userTeamSizeError = 'Your team currently does not have a TOP position playerhas less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
							} else {					
								p = minFreeAgentsADC.shift();
								while ((p.country != g.teamCountryCache[tid]) && (numFromRegion < 3)  && (minFreeAgentsADC.length > 0)) {
									p = minFreeAgentsADC.shift();
								} 							
								if (p.born.loc == g.teamCountryCache[tid]) {
							//	if (p.country == g.teamCountryCache[tid]) {				
									numFromRegion += 1;								
								}													
								p.tid = tid;
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
								p = player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;

								eventLog.add(null, {
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount, "K") + '/year through ' + p.contract.exp + '.',
									showNotification: false,
									pids: [p.pid],
									tids: [p.tid]
								});						
								promises.push(dao.players.put({ot: tx, value: p}));
								numPlayersOnRoster += 1;				
								playersAdded += 1;					
								adc +=1;	
							}
						}
						if ((sup<1)  && (minFreeAgentsSup.length > 0)) {
						   if (tid === g.userTid && g.autoPlaySeasons === 0) {
		//                        userTeamSizeError = 'Your team currently does not have a TOP position playerhas less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
							} else {					
								p = minFreeAgentsSup.shift();
								while ((p.country != g.teamCountryCache[tid]) && (numFromRegion < 3)  && (minFreeAgentsSup.length > 0)) {
									p = minFreeAgentsSup.shift();
								} 							
								if (p.born.loc == g.teamCountryCache[tid]) {
							//	if (p.country == g.teamCountryCache[tid]) {				
									numFromRegion += 1;							
								}													
								p.tid = tid;
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
								p = player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 4;

								eventLog.add(null, {
									type: "freeAgent",
									text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount, "K") + '/year through ' + p.contract.exp + '.',
									showNotification: false,
									pids: [p.pid],
									tids: [p.tid]
								});						
								promises.push(dao.players.put({ot: tx, value: p}));
								numPlayersOnRoster += 1;				
								playersAdded += 1;					
								sup +=1;					
							}
						}							
						
//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);
                    }
//                } else if (numFromRegion < 3) {
                } else if (numFromRegion < 3) {
					if (g.userTids.indexOf(tid) >= 0   && g.autoPlaySeasons === 0) {
						if (g.userTids.length <= 1) {
							userTeamSizeError = 'Your team has ';
						} else {
							userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
						}
						userTeamSizeError += 'less than the minimum number of starters (3) from your region. You must adjust your roster or add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
					
//                    if (tid === g.userTid && g.autoPlaySeasons === 0) {
  //                      userTeamSizeError = 'Your team currently has less than the minimum number of starters (3) from your region. You must adjust your roster or add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
                    } else {	
					   var ii, found;
					   ii = 0;

                       while  (numFromRegion < 3 && minFreeAgentsTop.length <= ii) {
						   	found = false;
						 //  console.log(minFreeAgents.length);
							/*if (minFreeAgents.length < 1) {
								break;
							}
                            p = minFreeAgents.shift();*/
						/*	 {
							if ((mid<1) && (minFreeAgentsMid.length > 0)) {
							if ((jgl<1) && (minFreeAgentsJgl.length > 0)) {
							if ((adc<1) && (minFreeAgentsADC.length > 0)) {
							if ((sup<1)  && (minFreeAgentsSup.length > 0)) {*/
							if ((top<3) && (minFreeAgentsTop.length > ii) ) {
								if (minFreeAgentsTop[ii].born.loc == g.teamCountryCache[tid]) {
									found = true;	
									p = minFreeAgentsTop[ii];
									console.log(ii);
									console.log(minFreeAgentsTop[ii]);									
									minFreeAgentsTop.splice(ii,1);
									console.log(p);																		
									top += 1;
								}
							}
							if ((mid<3) && (minFreeAgentsMid.length > ii) && !found ) {
								if (minFreeAgentsMid[ii].born.loc == g.teamCountryCache[tid]) {
									found = true;	
									p = minFreeAgentsMid[ii];
									console.log(ii);
									console.log(minFreeAgentsMid[ii]);									
									minFreeAgentsMid.splice(ii,1);
									console.log(p);																		
									mid += 1;									
								}
							}							
							if ((jgl<3) && (minFreeAgentsJgl.length > ii) && !found ) {
								if (minFreeAgentsJgl[ii].born.loc == g.teamCountryCache[tid]) {
									found = true;	
									p = minFreeAgentsJgl[ii];
									console.log(ii);
									console.log(minFreeAgentsJgl[ii]);									
									minFreeAgentsJgl.splice(ii,1);
									console.log(p);																		
									jgl += 1;									
								}
							}							
							if ((adc<3) && (minFreeAgentsADC.length > ii) && !found ) {
								if (minFreeAgentsADC[ii].born.loc == g.teamCountryCache[tid]) {
									found = true;	
									p = minFreeAgentsADC[ii];
									console.log(ii);
									console.log(minFreeAgentsADC[ii]);									
									minFreeAgentsADC.splice(ii,1);
									console.log(p);																		
									adc += 1;									
								}
							}		
							if ((sup<3) && (minFreeAgentsSup.length > ii) && !found ) {
								if (minFreeAgentsSup[ii].born.loc == g.teamCountryCache[tid]) {
									found = true;	
									console.log(ii);
									console.log(minFreeAgentsSup[ii]);
									p = minFreeAgentsSup[ii];
									minFreeAgentsSup.splice(ii,1);
									console.log(p);									
									sup += 1;									
								}
							}								
							
						 //  console.log(numFromRegion+" "+p.country);
						 //  console.log(g.teamCountryCache[tid]+" "+p.value);
						    if (found) {
								
								console.log(ii+" "+found);
								console.log(p);								
								console.log(p.born.loc);																
								if (p.born.loc == g.teamCountryCache[tid]) {						 
								console.log(p.born.loc);								
								//if (p.country == g.teamCountryCache[tid]) {									
									p.tid = tid;
									p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
									p = player.setContract(p, p.contract, true);
									p.gamesUntilTradable = 4;
									addedPos.push(p.pos);
									eventLog.add(null, {
										type: "freeAgent",
										text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount / 1000, "M") + '/year through ' + p.contract.exp + '.',
										showNotification: p.watch && typeof p.watch !== "function",
										pids: [p.pid],
										tids: [p.tid]
									});								
									promises.push(dao.players.put({ot: tx, value: p}));
								/*   if (players[i].pos == "TOP") {
									  top += 1;
								   } else  if (players[i].pos == "MID") {
									  mid += 1;
								   } else  if (players[i].pos == "JGL") {
									  jgl += 1;
								   } else  if (players[i].pos == "SUP") {
									  sup += 1;
								   } else  if (players[i].pos == "ADC") {
									  adc += 1;
								   }*/
									numPlayersOnRoster += 1;								
									numFromRegion += 1;								
								}	
							}							
							ii += 1;
                        }
					}						
              //  }
				
							/*if (p.country == g.teamCountryCache[tid]) {				
								numFromRegion += 1;								
							}*/														
		/*		top = 0;
				mid = 0;
				jgl = 0;
				sup = 0;
				adc = 0;
				for (i = 0; i < (numPlayersOnRoster); i++) {
				   if (players[i].pos == "Top") {
				      top += 1;
				   } else  if (players[i].pos == "Mid") {
				      mid += 1;
				   } else  if (players[i].pos == "Jgl") {
				      jgl += 1;
				   } else  if (players[i].pos == "Sup") {
				      sup += 1;
				   } else  if (players[i].pos == "ADC") {
				      adc += 1;
				   }
				}				*/
				
				
				
//// add position min				
			//	console.log(numPlayersOnRoster+" "+tid);
				} else if (numPlayersOnRoster > 10) {
					if (g.userTids.indexOf(tid) >= 0  && g.autoPlaySeasons === 0) {
						if (g.userTids.length <= 1) {
							userTeamSizeError = 'Your team has ';
						} else {
							userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
						}
						userTeamSizeError += 'more than the maximum number of players (10). You must remove players (by <a href="' + helpers.leagueUrl(["roster"]) + '">releasing them from your roster</a> or through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';

//                    if (tid === g.userTid && g.autoPlaySeasons === 0) {
  //                      userTeamSizeError = 'Your team currently has more than the maximum number of players (10). You must remove players (by <a href="' + helpers.leagueUrl(["roster"]) + '">releasing them from your roster</a> or through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
                    } else {
                        // Automatically drop lowest value players until we reach 15
					//	console.log("too many: "+tid+" "+numFromRegion);
                        players.sort(function (a, b) { return a.value - b.value; }); // Lowest first
					/*	top = 0;
						mid = 0;
						jgl = 0;
						sup = 0;
						adc = 0;
						playersDropped = 0;
						for (i = 0; i < (numPlayersOnRoster); i++) {
						   if (players[i].pos == "TOP") {
							  top += 1;
						   } else  if (players[i].pos == "MID") {
							  mid += 1;
						   } else  if (players[i].pos == "JGL") {
							  jgl += 1;
						   } else  if (players[i].pos == "SUP") {
							  sup += 1;
						   } else  if (players[i].pos == "ADC") {
							  adc += 1;
						   }
						   
		//					player.release(tx, players[i], false);
						}							*/
						
						if (numFromRegion < 4) {
							for (i = 0; i < (numPlayersOnRoster); i++) {
							//	console.log(tid+" "+i+ " "+players[i].rosterOrder+" "+ players[i].country+" "+g.teamCountryCache[tid]);
								
								if ((players[i].rosterOrder < 5) && (players[i].born.loc != g.teamCountryCache[tid]) && (numFromRegion < 4)) {
									promises.push(player.release(tx, players[i], true));
									playersDropped += 1;									
									//numFromRegion += 1;
								}

							}						
						} else {
						

					
							
							// check for # of positions, only drop if >1
	//                        for (i = 0; i < (numPlayersOnRoster - 10); i++) {
							for (i = 0; i < (numPlayersOnRoster); i++) {
								console.log(numFromRegion+" "+players[i].born.loc+" "+g.teamCountryCache[tid]);
							//	if ( (numFromRegion > 3) || (players[i].country != g.teamCountryCache[tid]) ) {
//								   if ( ((players[i].pos == "TOP") && ((top>1)) ) ||  ((players[i].pos == "MID") && ((mid>1) || (p.country != g.teamCountryCache[tid]))) || ((players[i].pos == "JGL") && ((jgl>1) || (p.country != g.teamCountryCache[tid]))) || ((players[i].pos == "SUP") && ((sup>1) || (p.country != g.teamCountryCache[tid]))) || ((players[i].pos == "ADC") && ((adc>1) || (p.country != g.teamCountryCache[tid]))) ){						   
								   if ( ((players[i].pos == "TOP") && (top>1) ) ||  ((players[i].pos == "MID") && (mid>1) ) || ((players[i].pos == "JGL") && (jgl>1)) || ((players[i].pos == "SUP") && (sup>1) ) || ((players[i].pos == "ADC") && (adc>1) ) ){						   
									//	console.log("dropped: "+players[i].pos);
										if (players[i].pos == "TOP") {
										  top -= 1;
									   } else  if (players[i].pos == "MID") {
										  mid -= 1;
										} else  if (players[i].pos == "JGL") {
										  jgl -= 1;
									   } else  if (players[i].pos == "SUP") {
										  sup -= 1;
									   } else  if (players[i].pos == "ADC") {
										  adc -= 1;
									   }						
								   
										/*if (p.country == g.teamCountryCache[tid]) {
											numFromRegion -= 1;
										}*/									
										promises.push(player.release(tx, players[i], true));
										playersDropped += 1;													
										
								   } 
							//   }
							   if  ( (numPlayersOnRoster - playersDropped) < 11)  {
								   i = numPlayersOnRoster;
							   }							
							}
						}
                    }
									console.log(numPlayersOnRoster+" "+playersDropped);
//                } else if (numPlayersOnRoster < g.minRosterSize) {
            /*    } 
			if (tid === g.userTid && g.autoPlaySeasons === 0) {
//                        userTeamSizeError = 'Your team currently does not have a TOP position playerhas less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
			} else {
			
				//minFreeAgentsTop, minFreeAgentsMid, minFreeAgentsJgl, minFreeAgentsADC, minFreeAgentsSup,
			//	console.log(tid+" need:"+playersAdded);
					if (numPlayersOnRoster > 10) {
					   if (tid === g.userTid && g.autoPlaySeasons === 0) {
		//                        userTeamSizeError = 'Your team currently does not have a TOP position playerhas less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						} else {					*/
						//	players.sort(function (a, b) { return a.value - b.value; }); // Lowest first				
						/*	for (i = 0; i < (numPlayersOnRoster); i++) {
								if ((player.born.loc == g.teamCountryCache[tid]) && (numFromRegion < 4)) {
									
								} else if ((players[i].pos == "TOP")&&(top>1)) {
									promises.push(player.release(tx, players[i], true));
									top -= 1;
									playersAdded -= 1;	
									numPlayersOnRoster -= 1;
							   } else  if ((players[i].pos == "MID")&&(mid>1)) {
									promises.push(player.release(tx, players[i], true));
								  mid -= 1;
									playersAdded -= 1;						
									numPlayersOnRoster -= 1;
							   } else  if ((players[i].pos == "JGL")&&(jgl>1)) {
									promises.push(player.release(tx, players[i], true));
								  jgl -= 1;
									playersAdded -= 1;						
									numPlayersOnRoster -= 1;
							   } else  if ((players[i].pos == "SUP")&&(sup>1)) {
									promises.push(player.release(tx, players[i], true));
								  sup -= 1;
									playersAdded -= 1;						
									numPlayersOnRoster -= 1;
							   } else  if ((players[i].pos == "ADC")&&(adc>1)) {
									promises.push(player.release(tx, players[i], true));
								  adc -= 1;
									playersAdded -= 1;						
									numPlayersOnRoster -= 1;
							   }
							   if (playersAdded<=0) {
								 break;
							   }
							}*/
					//	}
				//	}
				}				
				//console.log(tid+" done now sort?"+playersAdded+" "+numPlayersOnRoster);
				return Promise.all(promises);				
            }).then(function () {				
                // Auto sort rosters (except player's team)
                // This will sort all AI rosters before every game. Excessive? It could change some times, but usually it won't
			
                if (g.userTids.indexOf(tid) < 0 || g.autoPlaySeasons > 0) {
                    return rosterAutoSort(tx, tid);
                }
            });
        };

        tx = dao.tx(["players", "playerStats", "releasedPlayers", "teams"], "readwrite");

        userTeamSizeError = null;

        return dao.players.getAll({ot: tx, index: "tid", key: g.PLAYER.FREE_AGENT}).then(function (players) {
            var i, promises;

			promises = [];						
			
            // List of free agents looking for minimum contracts, sorted by value. This is used to bump teams up to the minimum roster size.
            minFreeAgents = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= 100) {
                    minFreeAgents.push(players[i]);
                }
            }
            minFreeAgents.sort(function (a, b) { return b.value - a.value; });
			
            minFreeAgentsTop = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= 100) {
					if (players[i].pos == "TOP") {
						minFreeAgentsTop.push(players[i]);
					}
                }
            }
            minFreeAgentsTop.sort(function (a, b) { return b.value - a.value; });
			
            minFreeAgentsMid = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= 100) {
					 if (players[i].pos == "MID") {
						minFreeAgentsMid.push(players[i]);
					}
               }
            }
            minFreeAgentsMid.sort(function (a, b) { return b.value - a.value; });
			
            minFreeAgentsJgl = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= 100) {
					 if (players[i].pos == "JGL") {
						minFreeAgentsJgl.push(players[i]);
					}
                }
            }
            minFreeAgentsJgl.sort(function (a, b) { return b.value - a.value; });
			
            minFreeAgentsADC = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= 100) {
					 if (players[i].pos == "ADC") {
						minFreeAgentsADC.push(players[i]);
					}
			   
                }
            }
            minFreeAgentsADC.sort(function (a, b) { return b.value - a.value; });
			
            minFreeAgentsSup = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= 100) {
					 if (players[i].pos == "SUP") {
						minFreeAgentsSup.push(players[i]);
					}
                }
            }
            minFreeAgentsSup.sort(function (a, b) { return b.value - a.value; });

          /*  maxFreeAgentsSup = [];
            for (i = 0; i < players.length; i++) {
                if (players[i].contract.amount <= 100) {
					 if (players[i].pos == "SUP") {
						minFreeAgentsSup.push(players[i]);
					}
                }
            }
            minFreeAgentsSup.sort(function (a, b) { return b.value - a.value; });*/
			
			
            // Make sure teams are all within the roster limits
            for (i = 0; i < g.numTeams; i++) {
                promises.push(checkRosterSize(i));
				//teams[i].country = team.getCountries(k);
				//teams[i].imgURLCountry = team.getCountryImage(teams[k].country);
            }
			            
      //  });

            return Promise.all(promises);
        }).then(function () {
            // If I move this outside and use it exclusively to resolve this function, Chrome gets a little racy and one of my unit tests fails
            return tx.complete().then(function () {
				return updateCountry();
			});
        }).then(function () {
            return userTeamSizeError;
            
        });
    }
	
        /*return tx.complete().then(function () {
            return updateCountry();
//        });
        }).then(function () {
            return userTeamSizeError;

        });
    }*/


    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function getCountryImage(country) {
		var imgURLCountry;
		//console.log(country);
		imgURLCountry = "";
		
		console.log(country);		
		
		if (country == 'United States') {			
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		} else if (country == 'Canada') {				
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Canada.png";
		} else if (country == 'Germany') {				
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Germany.png";
		} else if (country == 'Romania') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Romania.png";
		} else if (country == 'Spain') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Spain.png";
		} else if (country == 'Scotland') {
			imgURLCountry = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flag_of_Scotland.svg/255px-Flag_of_Scotland.svg.png";
		} else if (country == 'Greece') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Greece.png";
		} else if (country == 'Armenia') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Armenia.png";
		} else if (country == 'Bulgaria') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Bulgaria.png";
		} else if (country == 'Netherlands') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Netherlands.png";
		} else if (country == 'England') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-Kingdom.png";
		} else if (country == 'Poland') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Poland.png";
		} else if (country == 'Belgium') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Belgium.png";
		} else if (country == 'Denmark') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Denmark.png";
		} else if  (country == 'Hungary') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Hungary.png";
		} else if  (country == 'Norway') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Norway.png";
		} else if (country == 'Sweden') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Sweden.png";
		} else if (country == 'France') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-France.png";
		} else if (country == 'Iceland') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Iceland.png";
		} else if (country == 'Korea') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png";
		} else if (country == 'China') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-China.png";
		} else if (country == 'Taiwan') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png";
		} else if (country == 'Russia') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Russia.png";
		} else if (country == 'Brazil') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Brazil.png";
		} else if (country == 'Japan') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Japan.png";
		} else if (country == 'Australia') {
			imgURLCountry = "http://www.anbg.gov.au/images/flags/nation/australia.gif";
		} else if (country == 'Chile') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Chile.png";
		} else if (country == 'Ecuador') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Ecuador.png";
		} else if (country == 'Colombia') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Colombia.png";
		} else if (country == 'Peru') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Peru.png";
		} else if (country == 'Venezuela') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Venezuela.png";
		} else if (country == 'Puerto Rico') {
			imgURLCountry = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Flag_of_Puerto_Rico.svg/255px-Flag_of_Puerto_Rico.svg.png";
		} else if (country == 'Costa Rica') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Costa-Rica.png";
		} else if (country == 'Panama') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Panama.png";
		} else if (country == 'Argentina') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Argentina.png";
		} else if (country == 'Paraguay') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Paraguay.png";
		} else if (country == 'Uruguay') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Uruguay.png";
		} else if (country == 'Vietnam') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Vietnam.png";
		} else if (country == 'Turkey') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Turkey.png";
		} else {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		}
			
        return imgURLCountry;
    }
	
   /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function getCountryImage2(country) {
		var imgURLCountry;
		//console.log(country);
		imgURLCountry = "";
		
	//	console.log(country);
		
		if (country=="") {
			
		} else if (country=="EU") {
			imgURLCountry = "/img/flags/flags/48/European Union.png";						
		} else if (country == 'NA') {			
			imgURLCountry = "/img/flags/flags/48/United_States.png";
		} else if (country == 'EU') {				
			imgURLCountry = "/img/flags/flags/48/European_Union.png";
		} else if (country == 'KR') {			
			imgURLCountry = "/img/flags/flags/48/Korea.png";	
		} else if (country == 'CN') {
			imgURLCountry = "/img/flags/flags/48/China.png";	
		} else if (country == 'TW') {
			imgURLCountry = "/img/flags/flags/48/Taiwan.png";	
		} else if (country == 'CIS') {
			imgURLCountry = "/img/flags/flags/48/Russia.png";	
		} else if (country == 'BR') {
			imgURLCountry = "/img/flags/flags/48/Brazil.png";	
		} else if (country == 'JP') {
			imgURLCountry = "/img/flags/flags/48/Japan.png";	
		} else if (country == 'OCE') {
			imgURLCountry = "/img/flags/flags/48/Australia.png";	
		} else if (country == 'LatAm') {
			imgURLCountry = "http://www.flagandbanner.com/images/K20LAT35.jpg";
		} else if (country == 'SEA') {
			imgURLCountry = "/img/flags/flags/48/Vietnam.png";	
		} else if (country == 'TR') {
			imgURLCountry = "/img/flags/flags/48/Turkey.png";	
	//	} else {
//			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";			
		} else {
			imgURLCountry = "/img/flags/flags/48/"+country+".png";			
		}
		
		
		//https://en.wikipedia.org/wiki/Gallery_of_sovereign_state_flags#U
	/*	if (country == 'United States') {			
			imgURLCountry = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/190px-Flag_of_the_United_States.svg.png";
		} else if (country == 'Canada') {				
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Canada.png";
		} else if (country == 'Germany') {				
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Germany.png";
		} else if (country == 'Romania') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Romania.png";
		} else if (country == 'Spain') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Spain.png";
		} else if (country == 'Scotland') {
			imgURLCountry = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flag_of_Scotland.svg/255px-Flag_of_Scotland.svg.png";
		} else if (country == 'Greece') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Greece.png";
		} else if (country == 'Armenia') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Armenia.png";
		} else if (country == 'Bulgaria') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Bulgaria.png";
		} else if (country == 'Netherlands') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Netherlands.png";
		} else if (country == 'England') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-Kingdom.png";
		} else if (country == 'Poland') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Poland.png";
		} else if (country == 'Belgium') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Belgium.png";
		} else if (country == 'Denmark') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Denmark.png";
		} else if  (country == 'Hungary') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Hungary.png";
		} else if  (country == 'Norway') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Norway.png";
		} else if (country == 'Sweden') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Sweden.png";
		} else if (country == 'France') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-France.png";
		} else if (country == 'Iceland') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Iceland.png";
		} else if (country == 'Korea') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png";
		} else if (country == 'China') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-China.png";
		} else if (country == 'Taiwan') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png";
		} else if (country == 'Russia') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Russia.png";
		} else if (country == 'Brazil') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Brazil.png";
		} else if (country == 'Japan') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Japan.png";
		} else if (country == 'Australia') {
			imgURLCountry = "http://www.anbg.gov.au/images/flags/nation/australia.gif";
		} else if (country == 'Chile') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Chile.png";
		} else if (country == 'Ecuador') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Ecuador.png";
		} else if (country == 'Colombia') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Colombia.png";
		} else if (country == 'Peru') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Peru.png";
		} else if (country == 'Venezuela') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Venezuela.png";
		} else if (country == 'Puerto Rico') {
			imgURLCountry = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Flag_of_Puerto_Rico.svg/255px-Flag_of_Puerto_Rico.svg.png";
		} else if (country == 'Costa Rica') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Costa-Rica.png";
		} else if (country == 'Panama') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Panama.png";
		} else if (country == 'Argentina') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Argentina.png";
		} else if (country == 'Paraguay') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Paraguay.png";
		} else if (country == 'Uruguay') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Uruguay.png";
		} else if (country == 'Vietnam') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Vietnam.png";
		} else if (country == 'Turkey') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Turkey.png";
		} else {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		}*/
			
        return imgURLCountry;
    }	
    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function getRegionImage(region) {
		var imgURLCountry;
		//console.log(country);
		imgURLCountry = "";
				console.log(region);
		if (region == 'NA') {			
			imgURLCountry = "/img/flags/flags/48/United_States.png";
		} else if (regoin == 'EU') {				
			imgURLCountry = "/img/flags/flags/48/European_Union.png";
		} else if (regoin == 'KR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png";
		} else if (regoin == 'CN') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-China.png";
		} else if (regoin == 'TW') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png";
		} else if (regoin == 'CIS') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Russia.png";
		} else if (regoin == 'BR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Brazil.png";
		} else if (regoin == 'JP') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Japan.png";
		} else if (regoin == 'OCE') {
			imgURLCountry = "http://www.anbg.gov.au/images/flags/nation/australia.gif";
		} else if (regoin == 'LatAm') {
			imgURLCountry = "http://www.flagandbanner.com/images/K20LAT35.jpg";
		} else if (regoin == 'SEA') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Vietnam.png";
		} else if (regoin == 'TR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Turkey.png";
		} else {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		}
			
        return imgURLCountry;
    }	
	
    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function getRegionImage2(region) {
		var imgURLCountry;
		//console.log(country);
		imgURLCountry = "";
		console.log(getRegionImage2);
		if (region == 'NA') {			
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		} else if (regoin == 'EU') {				
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Canada.png";
		} else if (regoin == 'KR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png";
		} else if (regoin == 'CN') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-China.png";
		} else if (regoin == 'TW') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png";
		} else if (regoin == 'CIS') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Russia.png";
		} else if (regoin == 'BR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Brazil.png";
		} else if (regoin == 'JP') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Japan.png";
		} else if (regoin == 'OCE') {
			imgURLCountry = "http://www.anbg.gov.au/images/flags/nation/australia.gif";
		} else if (regoin == 'LatAm') {
			imgURLCountry = "http://www.flagandbanner.com/images/K20LAT35.jpg";
		} else if (regoin == 'SEA') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Vietnam.png";
		} else if (regoin == 'TR') {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-Turkey.png";
		} else {
			imgURLCountry = "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png";
		}
			
        return imgURLCountry;
    }		
	
    return {
        addSeasonRow: addSeasonRow,
        addStatsRow: addStatsRow,
        generate: generate,
        rosterAutoSort: rosterAutoSort,
        filter: filter,
        valueChange: valueChange,
        updateStrategies: updateStrategies,
		updateCountry: updateCountry,
        checkRosterSizes: checkRosterSizes,
        getPayroll: getPayroll,
        getPayrolls: getPayrolls,
		getRegions: getRegions,
		getPositions: getPositions,
		getCountries: getCountries,
		getCountryImage: getCountryImage,	
		getRegionImage: getRegionImage
    };
});