/**
 * @name core.team
 * @namespace Functions operating on team objects, parts of team objects, or arrays of team objects.
 */
define(["db", "globals", "core/player", "lib/underscore", "util/helpers", "util/random"], function (db, g, player, _, helpers, random) {
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

        s = t.seasons.length - 1; // Most recent ratings

        // Initial entry
        newSeason = {
            season: g.season,
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
                    rank: 8.5
                },
                sponsor: {
                    amount: 0,
                    rank: 8.5
                },
                ticket: {
                    amount: 0,
                    rank: 8.5
                },
                nationalTv: {
                    amount: 0,
                    rank: 8.5
                },
                localTv: {
                    amount: 0,
                    rank: 8.5
                }
            },
            expenses: {
                salary: {
                    amount: 0,
                    rank: 8.5
                },
                luxuryTax: {
                    amount: 0,
                    rank: 8.5
                },
                minTax: {
                    amount: 0,
                    rank: 8.5
                },
                buyOuts: {
                    amount: 0,
                    rank: 8.5
                },
                scouting: {
                    amount: 0,
                    rank: 8.5
                },
                coaching: {
                    amount: 0,
                    rank: 8.5
                },
                health: {
                    amount: 0,
                    rank: 8.5
                },
                facilities: {
                    amount: 0,
                    rank: 8.5
                }
            },
            payrollEndOfSeason: -1
        };

        if (s >= 0) {
            // New season, carrying over some values from the previous season
            newSeason.pop = t.seasons[s].pop * random.uniform(0.98, 1.02);  // Mean population should stay constant, otherwise the economics change too much
            newSeason.hype = t.seasons[s].hype;
            newSeason.cash = t.seasons[s].cash;
            newSeason.tvContract = t.seasons[s].tvContract;
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
        playoffs = playoffs !== undefined ? playoffs : false;

        t.stats.push({
            season: g.season,
            playoffs: playoffs,
            gp: 0,
            min: 0,
            fg: 0,
            fga: 0,
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
            pts: 0,
            oppPts: 0,
			tgts: 0,
			ols: 0, 
			olr: 0, 
			olp: 0, 
			olry: 0, 
			olpy: 0, 
			olc: 0, 
			oltd: 0, 
			der: 0, 
			dep: 0, 
			dery: 0, 
			depy: 0, 
			dec: 0, 
			detd: 0,
			prp:0,
			fdt:0,
			fdp:0,
			fdr:0,
			ty:0,
			syl:0,
			tda:0,
			tdf:0,
			rztd:0,
			rza:0,
			top:0,
			fbl:0,
			fbll:0,
			fblr:0,
			fbltd:0,
			inter:0,
			intery:0,
			intertd:0,
			pen:0,
			peny:0,
			qr:0,
			qbr:0,
			war:0,
			warr:0,
			warp:0,
			warre:0,
			ward:0,
			warol:0,
			wardl:0,
			pr:0,
			pry:0,
			prtd:0,
			kr:0,
			kry:0,
			krtd:0,
			kol:0,
			koa:0,
			koav:0,
			koy:0,
			rushl:0,
			rusha:0,
			recl:0,
			reca:0,
			passa:0,
			prl:0,
			pra:0,
			krl:0,
			kra:0,
			fgl:0,
			fgat:0,
			puntl:0,
			punta:0,			
			ytp:0,
			turn:0,
			turnopp:0,
			oppfumble:0,
			tottd:0,
			opptd:0,
			opptdp:0,
			opptdr:0,
			oppfd:0,
			oppfdp:0,
			oppfdr:0,
			oppty:0,
			opptp:0,			
			oppyp:0,	
			oppruya:0,			
			opppaya:0,			
			opppasa:0,
			opppasc:0,
			depc:0,
			opppp:0			
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
       var strategy, t;

        if (tm.hasOwnProperty("strategy")) {
            strategy = tm.strategy;
        } else {
            strategy = Math.random() > 0.5 ? "contending" : "rebuilding";
        }
        t = {
            tid: tm.tid,
            cid: tm.cid,
            did: tm.did,
            region: tm.region,
            name: tm.name,
            abbrev: tm.abbrev,
            imgURL: tm.imgURL !== undefined ? tm.imgURL : "",
            stats: tm.hasOwnProperty("stats") ? tm.stats : [],
            seasons: tm.hasOwnProperty("seasons") ? tm.seasons : [],
            budget: {
                ticketPrice: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.amount : helpers.round(25 + 25 * (g.numTeams - tm.popRank) / (g.numTeams - 1), 2),
                    rank: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.rank : tm.popRank
                },
                scouting: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.scouting.amount : helpers.round(900 + 900 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 10,
                    rank: tm.hasOwnProperty("budget") ? tm.budget.scouting.rank : tm.popRank
                },
                coaching: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.coaching.amount : helpers.round(900 + 900 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 10,
                    rank: tm.hasOwnProperty("budget") ? tm.budget.coaching.rank : tm.popRank
                },
                health: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.health.amount : helpers.round(900 + 900 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 10,
                    rank: tm.hasOwnProperty("budget") ? tm.budget.health.rank : tm.popRank
                },
                facilities: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.facilities.amount : helpers.round(900 + 900 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 10,
                    rank: tm.hasOwnProperty("budget") ? tm.budget.facilities.rank : tm.popRank
                }
            },
            strategy: strategy
        };
		if (!tm.hasOwnProperty("seasons")) {
            t = addSeasonRow(t);
            t.seasons[0].pop = tm.pop;
        }
        if (!tm.hasOwnProperty("stats")) {
            t = addStatsRow(t);
        }
        
        return t;
    }

	 function switchPlayer(players,i,j) {
	 var tempPlayer;
	 				tempPlayer = players[i];
					players[i] = players[j]
					players[j] = tempPlayer;
		return;
	 }	
	
	
    /**
     * Sort a team's roster based on player ratings and stats.
     *
     * If ot is null, then the callback will run only after the transaction finishes (i.e. only after the updated roster order is actually saved to the database). If ot is not null, then the callback might run earlier, so don't rely on the updated roster order actually being in the database yet.
     *
     * So, ot should NOT be null if you're sorting multiple roster as a component of some larger operation, but the results of the sorts don't actually matter. ot should be null if you need to ensure that the roster order is updated before you do something that will read the roster order (like updating the UI).
     * 
     * @memberOf core.team
     * @param {(IDBObjectStore|IDBTransaction|null)} ot An IndexedDB object store or transaction on players readwrite; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @param {function()=} cb Optional callback.
     */
    function rosterAutoSort(ot, tid, cb) {
        var players, playerStore, tx;

        tx = db.getObjectStore(ot, "players", null, true);
        playerStore = tx.objectStore("players");

        // Get roster and sort by value (no potential included)
        playerStore.index("tid").getAll(tid).onsuccess = function (event) {
            var i;

            players = player.filter(event.target.result, {
//                attrs: ["pid", "valueNoPot","pos","offense","offensebench"],
                attrs: ["pid", "valueNoPot","pos","offense","active"],
                showNoStats: true,
                showRookies: true,
                fuzz: tid === g.userTid
            });
			
		//	console.log("players.length: "+players.length);
			
            players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; }); // This will be fuzzed based on player.filter

			
			
		////////////////////////// change from hitting/pitching to offense/defense	
		//// change weakest pitcher to weakest defender?
		var weakestDefender,lastPosition,startPosition;
		var i,k,j;
		var benchLimit;
		
		weakestDefender = 21;				
            for (i = 0; i < 11; i++) {
			    if (((players[i].pos != "QB") && (players[i].pos != "OL") && (players[i].pos != "WR")  && (players[i].pos != "RB") && (players[i].pos != "TE") ) && (i<11)) {
					for (k = (i+1); k < players.length; k++) {
					
						if ((players[k].pos == "QB") || (players[k].pos == "OL") || (players[k].pos == "WR") || (players[k].pos == "RB") || (players[k].pos == "TE")) {				    
							switchPlayer(players,i,k);	

							if (weakestDefender <11) {
							
							} else {
								switchPlayer(players,weakestDefender,k);	
								weakestDefender -= 1;
							}
							k = players.length;
						}
					}
				}

            }	
			

			lastPosition = 0;
			for (i = lastPosition; i < 11; i++) {				
					if (players[i].pos != "QB")  {
						for (k = (i+1); k < 11; k++) {				
							if (players[k].pos == "QB") {
								switchPlayer(players,i,k);	
								k = players.length;							                             														
							}										
						}	
					} 
					if ( (players[i].pos == "QB") && (i>0) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "TE") || (players[k].pos == "OL") || (players[k].pos == "WR") || (players[k].pos == "RB")) {				    
								switchPlayer(players,i,k);								
								k = players.length;
							}					
						}
					}	
					if ( (players[i].pos != "QB") && (i==0) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "QB")) {				    
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
					}	
										
			}	
			
			for (k = 24; k < players.length; k++) {
		
				if ((players[k].pos == "QB") && (players[0].valueNoPot < players[k].valueNoPot) ) {				    
					switchPlayer(players,0,k);	
				}					
			}

			
			lastPosition = 1;				
			for (i = lastPosition; i < 11; i++) {				
					if (players[i].pos != "RB")  {
						for (k = (i+1); k < 11; k++) {				
							if (players[k].pos == "RB") {
								switchPlayer(players,i,k);								
								k = players.length;							                             														
							}		
							for (j = (k+1); j < players.length; j++) {				
								if ((players[j].pos == "RB") && (players[i].valueNoPot < players[j].valueNoPot)) {
									switchPlayer(players,i,j);								
								}		
							}
						}	
						
					} 
					if ( (players[i].pos == "RB") && (i>2) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "TE") || (players[k].pos == "OL") || (players[k].pos == "WR")) {				    
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
					}	
					
					if ( (players[i].pos != "RB") && (i==1) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "RB")) {				    
								switchPlayer(players,i,k);	
								k = players.length;
							}		

							for (j = (k+1); j < players.length; j++) {				
								if ((players[j].pos == "RB") && (players[i].valueNoPot < players[j].valueNoPot)) {
									switchPlayer(players,i,j);								
								}		
							}
							
						}
					}	


                   if (players[i].pos == "RB") {
						for (j = (i+1); j < players.length; j++) {				
							if ((players[j].pos == "RB") && (players[i].valueNoPot < players[j].valueNoPot)) {
								switchPlayer(players,i,j);								
							}		
						}				   
						lastPosition = i;
				   }
			}	
			
			if ( (lastPosition == 2) && (players[1].valueNoPot < players[2].valueNoPot) ) {			
				switchPlayer(players,1,2);								
			}
			
			
		//	lastPosition = 1;				
		    startPosition = lastPosition;
			for (i = (lastPosition+1); i < 11; i++) {				
//			while (weakestPitcher <= 17) {
			//	console.log("i: "+i);			    
					if (players[i].pos != "TE")  {
						for (k = (i+1); k < 11; k++) {				
							if (players[k].pos == "TE") {
								switchPlayer(players,i,k);	
								k = players.length;							                             														
							}		
							for (j = (i+1); j < players.length; j++) {				
								if ((players[j].pos == "TE") && (players[i].valueNoPot < players[j].valueNoPot)) {
									switchPlayer(players,i,j);								
								//	j = players.length;							                             														
								}		
							}								
						//	k = 21;							                             							
						}	
						
					} 
					if ( (players[i].pos == "TE") && (i> (startPosition+1) )) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "OL") || (players[k].pos == "WR")) {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}			
						}
					}	
					
					if ( (players[i].pos != "TE") && (i==startPosition) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "TE")) {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}				
							for (j = (i+1); j < players.length; j++) {				
								if ((players[j].pos == "TE") && (players[i].valueNoPot < players[j].valueNoPot)) {
									switchPlayer(players,i,j);								
								//	j = players.length;							                             														
								}		
							}								
						}
					}	

					
					
					
                   if (players[i].pos == "TE") {
						for (j = (i+1); j < players.length; j++) {				
							if ((players[j].pos == "TE") && (players[i].valueNoPot < players[j].valueNoPot)) {
								switchPlayer(players,i,j);								
							//	j = players.length;							                             														
							}		
						}						   
				      lastPosition = i;
				   }
			}	
			
						////////// Have and Rank WR
			
		    startPosition = lastPosition;
			for (i = (lastPosition+1); i < 11; i++) {				
					if (players[i].pos != "WR")  {
						for (k = (i+1); k < 11; k++) {				
							if (players[k].pos == "WR") {
								switchPlayer(players,i,k);	
								k = players.length;							                             														
							}										
						}	
						
					} 
					if ( (players[i].pos == "WR") && ( (i> 5 )) ) {
						for (k = 24; k < players.length; k++) {
					
							if (players[k].pos == "OL")  {				    
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
					}	
					
//					if ( (players[i].pos != "WE") && ((i==startPosition) || (i < 5 ) )) {
					if ( (players[i].pos != "WR") &&  (i < 6 ) ) {
						for (k = 24; k < players.length; k++) {
					
							if (players[k].pos == "WR") {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}			
							for (j = (i+1); j < players.length; j++) {				
								if ((players[j].pos == "TE") && (players[i].valueNoPot < players[j].valueNoPot)) {
									switchPlayer(players,i,j);								
								//	j = players.length;							                             														
								}		
							}								
						}
					}

					
					
					
                   if (players[i].pos == "WR") {
						for (j = (i+1); j < players.length; j++) {				
							if ((players[j].pos == "WR") && (players[i].valueNoPot < players[j].valueNoPot)) {
								switchPlayer(players,i,j);								
							//	j = players.length;							                             														
							}		
						}					   
				      lastPosition = i;
				   }
			}	

			if ( (lastPosition > (startPosition+1)) ) {			
				for (i = (startPosition+1); i < lastPosition; i++) {				
					for (k = (i+1); k < (lastPosition+1); k++) {							  
						if ( (players[i].valueNoPot < players[k].valueNoPot) ) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
			}
			
			
			
			//// sort offensive linemen
				for (i = 6; i < 10; i++) {				
					for (k = (i+1); k < (11); k++) {							  
						if ( (players[i].valueNoPot < players[k].valueNoPot) ) {			
							switchPlayer(players,i,k);								
						}			
					}
					for (j = (i+1); j < players.length; j++) {				
						if ((players[j].pos == "OL") && (players[i].valueNoPot < players[j].valueNoPot)) {
							switchPlayer(players,i,j);								
						//	j = players.length;							                             														
						}		
					}						
				}
						
			//////////////////////////////////////////// above offense

////////////////////////// below defense			
			
						/////////////////////////////////////////////////////////   Defense 
// sort before defense	
			startPosition = 11;
			lastPosition = players.length-1;
		//	console.log(lastPosition);
			for (i = (startPosition+1); i < lastPosition; i++) {				
				for (k = (i+1); k < (lastPosition+1); k++) {							  
					if  (players[i].valueNoPot < players[k].valueNoPot)  {			
						switchPlayer(players,i,k);								
					}			
				}
			}			
			
			
			
			
			
			
            for (i = 11; i < 22; i++) {			
				if (((players[i].pos != "CB") && (players[i].pos != "DL") && (players[i].pos != "S") && (players[i].pos != "LB") ) && ((i>10) && (i<22))) {
					for (k = (i+1); k < players.length; k++) {
						//console.log("pos: "+ players[k].pos);
					
						if ((players[k].pos == "CB") || (players[k].pos == "DL") || (players[k].pos == "S") || (players[k].pos == "LB")  ) {				    
   //    console.log("switchdefense" +i+" "+k);		
							switchPlayer(players,i,k);	
												
							
							k = players.length;							
						}
					//tempPlayer = players[1];
					//players[1] = players[0]
					//players[0] = tempPlayer;		
					}
				}  
			}
			
			
			
			///// Have Cornerbacks
			lastPosition = 11;
			for (i = lastPosition; i < 22; i++) {				
//			while (weakestPitcher <= 17) {
			//	console.log("i: "+i);			    
					if (players[i].pos != "CB")  {
						for (k = (i+1); k < 22; k++) {				
							if (players[k].pos == "CB") {
								switchPlayer(players,i,k);	
								k = players.length;							                             														
							}										
						//	k = 21;							                             							
						}	
						
					} 
					if ( (players[i].pos == "CB") && (i>13) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "S") || (players[k].pos == "LB") || (players[k].pos == "DL")) {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
					}	
					if ( (players[i].pos != "CB") && (i==11) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "CB")) {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
					}	
                   if (players[i].pos == "CB") {
						for (j = (i+1); j < players.length; j++) {				
							if ((players[j].pos == "CB") && (players[i].valueNoPot < players[j].valueNoPot)) {
								switchPlayer(players,i,j);								
							//	j = players.length;							                             														
							}		
						}					   
				      lastPosition = i;
				   }										
			}	
			
			///// Have Safeties
		//	lastPosition = 11;
		    startPosition = lastPosition
			for (i = (lastPosition+1); i < 22; i++) {				
//			while (weakestPitcher <= 17) {
			//	console.log("i: "+i);			    
					if (players[i].pos != "S")  {
						for (k = (i+1); k < 22; k++) {				
							if (players[k].pos == "S") {
								switchPlayer(players,i,k);	
								k = players.length;							                             														
							}										
						//	k = 21;							                             							
						}	
						
					} 
					if ( (players[i].pos == "S") && (i>14) ) {
						for (k = 24; k < players.length; k++) {
					
							if ( (players[k].pos == "LB") || (players[k].pos == "DL")) {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
					}	
					if ( (players[i].pos != "S") && (i<14) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "S")) {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
						if  (players[i].pos != "S") {
							for (k = 24; k < players.length; k++) {
								if ((players[k].pos == "CB")) {				    
     //  console.log("switchoffense" +i+" "+k);		
									switchPlayer(players,i,k);	
									k = players.length;
								}							
							}
						}
					}	
                   if ((players[i].pos == "S") || (players[i].pos == "CB")) {
						for (j = (i+1); j < players.length; j++) {				
							if (((players[j].pos == "CB")||(players[j].pos == "S") ) && (players[i].valueNoPot < players[j].valueNoPot)) {
								switchPlayer(players,i,j);								
							//	j = players.length;							                             														
							}		
						}					   
				      lastPosition = i;
				   }						
										
			}	
			
			var lastSplit;
			lastSplit =11;
			if (lastPosition > 11)  {	
				for (i = 11; i < lastPosition; i++) {				
			  
					if 	(players[i].pos == "CB") {
					 lastSplit = i;
					} else {
						for (k = (i+1); k < (lastPosition+1); k++) {							  
							if ( players[k].pos == "CB" ) {			
								switchPlayer(players,i,k);								
								lastSplit = i;								
							}			
						}					
					}
				

				}
			}			
						
			
			if (lastPosition > 11)  {			
				for (i = 11; i < lastSplit; i++) {				
					for (k = (i+1); k < (lastSplit+1); k++) {							  
						if ( (players[i].valueNoPot < players[k].valueNoPot) ) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
			}		
			
			if (lastPosition > lastSplit)  {			
				for (i = lastSplit+1; i < lastPosition; i++) {				
					for (k = (i+1); k < (lastPosition+1); k++) {							  
						if ( (players[i].valueNoPot < players[k].valueNoPot) ) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
			}					
			
			
			///// Have LineBackers
	//		lastPosition = 11;
	        startPosition = lastPosition;
			for (i = (lastPosition+1); i < 22; i++) {				
//			while (weakestPitcher <= 17) {
			//	console.log("i: "+i);			    
					if (players[i].pos != "LB")  {
						for (k = (i+1); k < 22; k++) {				
							if (players[k].pos == "LB") {
								switchPlayer(players,i,k);	
								k = players.length;							                             														
							}										
						//	k = 21;							                             							
						}	
						
					} 
					if ( (players[i].pos == "LB") && (i>17) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "DL")) {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
					}	
					if ( (players[i].pos != "LB") && (i<16) ) {
						for (k = 24; k < players.length; k++) {
					
							if ((players[k].pos == "LB")) {				    
     //  console.log("switchoffense" +i+" "+k);		
								switchPlayer(players,i,k);	
								k = players.length;
							}					
						}
					}	
                   if (players[i].pos == "LB") {
						for (j = (i+1); j < players.length; j++) {				
							if ((players[j].pos == "LB") && (players[i].valueNoPot < players[j].valueNoPot)) {
								switchPlayer(players,i,j);								
							//	j = players.length;							                             														
							}		
						}						   
				      lastPosition = i;
				   }										
			}				
			

			if (lastPosition > (startPosition+1))  {			
				for (i = (startPosition+1); i < lastPosition; i++) {				
					for (k = (i+1); k < (lastPosition+1); k++) {							  
						if ( (players[i].valueNoPot < players[k].valueNoPot) ) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
			}			
						
			
//// sort DL			
			startPosition = lastPosition;
			lastPosition = 21;
			if (lastPosition > (startPosition+1))  {			
				for (i = (startPosition+1); i < lastPosition; i++) {				
//					for (k = (i+1); k < (lastPosition+1); k++) {							  
					for (k = (i+1); k <  players.length; k++) {							  
						if ((players[k].pos == "DL") &&  (players[i].valueNoPot < players[k].valueNoPot) ) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
			}			


/////////////////// kicker			
			
			
			
			
			
			
			
            for (i = 22; i < 24; i++) {			
			

				if (((players[i].pos != "K") && (players[i].pos != "P")) && ((i>21) && (i<24))) {
					for (k = (i+1); k < players.length; k++) {
						//console.log("pos: "+ players[k].pos);
					
						if ((players[k].pos == "K") || (players[k].pos == "P")) {				    
   //    console.log("switchdefense" +i+" "+k);		
							switchPlayer(players,i,k);	
							k = players.length;							
						}
					//tempPlayer = players[1];
					//players[1] = players[0]
					//players[0] = tempPlayer;		
					}
				}  
				for (k = (i+1); k <  players.length; k++) {							  
					if ((players[k].pos == "K") &&  (players[i].valueNoPot < players[k].valueNoPot) ) {			
						switchPlayer(players,i,k);								
					}			
				}			
							
			}				
			
			
			
			
					
// sort reserves	
			startPosition = 24;
			lastPosition = players.length-1;
		//	console.log(lastPosition);
			for (i = (startPosition+1); i < lastPosition; i++) {				
				for (k = (i+1); k < (lastPosition+1); k++) {							  
					if  (players[i].valueNoPot < players[k].valueNoPot)  {			
						switchPlayer(players,i,k);								
					}			
				}
			}
							
			
			
			
			if (players.length >45) {
				benchLimit = 45;
			} else {
				benchLimit = players.length;
			}
			
            for (i = 24; i < benchLimit; i++) {			
				if (((players[i].pos != "CB") && (players[i].pos != "DL") && (players[i].pos != "S") && (players[i].pos != "LB") ) && ((i>23) && (i<45))) {
					for (k = (i+1); k < benchLimit; k++) {
						//console.log("pos: "+ players[k].pos);
					
						if ((players[k].pos == "CB") || (players[k].pos == "DL") || (players[k].pos == "S") || (players[k].pos == "LB")  ) {				    
   //    console.log("switchdefense" +i+" "+k);		
							switchPlayer(players,i,k);	
							k = players.length;							
						} else if ( (k==(benchLimit-1)) && (i <= 30)  && (players.length>k)) {
							for (j = benchLimit; j < players.length; j++) {
								if ((players[j].pos == "CB") || (players[j].pos == "DL") || (players[j].pos == "S") || (players[j].pos == "LB")  ) {				    
   //    console.log("switchdefense" +i+" "+k);		
									switchPlayer(players,i,j);	
									j = players.length;							
									k = players.length;							
								}
						    }
						}
					//tempPlayer = players[1];
					//players[1] = players[0]
					//players[0] = tempPlayer;		
					}
				} 

			}
				


				
		
			
//// now organize reserves, defense first, then offense
            lastPosition = 24;
			for (i = 24; i < benchLimit; i++) {				
				if ((players[i].pos != "K") && (players[i].pos != "P")) {				    				    
					for (k = (i+1); k < (lastPosition+1); k++) {							  
						if ((players[k].pos == "K") || (players[k].pos == "P")) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
				if ((players[i].pos != "K") && (players[i].pos != "P")) {				    				    					    
					lastPosition = i-1;					
					i = 45;
				}
			}
			
        	startPosition = lastPosition;	
			for (i = (startPosition+1); i < benchLimit; i++) {				
				if ((players[i].pos != "S") && (players[i].pos != "LB") && (players[i].pos != "DL") && (players[i].pos != "CB")) {				    				    
					for (k = (i+1); k < (lastPosition+1); k++) {							  
						if ((players[k].pos == "S") || (players[k].pos == "LB") || (players[k].pos == "DL") || (players[k].pos == "CB")) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
				if ((players[i].pos != "S") && (players[i].pos != "LB") && (players[i].pos != "DL") && (players[i].pos != "CB")) {				    				    
					lastPosition = i-1;					
					i = benchLimit;
				}					
			}
	
// sort defense	
//			startPosition = lastPosition
//			lastPosition = 21;
			if (lastPosition > (startPosition+1))  {			
				for (i = (startPosition+1); i < lastPosition; i++) {				
					for (k = (i+1); k < (lastPosition+1); k++) {							  
						if ( (players[i].valueNoPot < players[k].valueNoPot) ) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
			}					
			
			
// sort offense	
			startPosition = lastPosition;
			lastPosition = benchLimit-1;
			if (lastPosition > (startPosition+1))  {			
				for (i = (startPosition+1); i < lastPosition; i++) {				
					for (k = (i+1); k < (lastPosition+1); k++) {							  
						if ( (players[i].valueNoPot < players[k].valueNoPot) ) {			
							switchPlayer(players,i,k);								
						}			
					}
				}
			}					
			
			
			
			
			
						
			
		//	console.log("before players[50].active: "+players[50].active);
            for (i = 0; i < players.length; i++) {
                players[i].rosterOrder = i;
				

				
            }
		//	console.log("after players[50].active: "+players[50].active);

            // Update rosterOrder
            playerStore.index("tid").openCursor(tid).onsuccess = function (event) {
                var cursor, i, p;

                cursor = event.target.result;
                if (cursor) {
                    p = cursor.value;
		//			console.log("2 players.length: "+players.length);

                    for (i = 0; i < players.length; i++) {
					
						if (i<45) {
//							players[i].active = true;

							p.active = true;
						} else {
//							players[i].active = false;
							p.active = false;
						}					
					
                        if (players[i].pid === p.pid) {
                            p.rosterOrder = players[i].rosterOrder;
                            break;
                        }
                    }
                    cursor.update(p);
                    cursor.continue();
                }
            };


			
			
			
			
            if (ot !== null) {
                // This function doesn't have its own transaction, so we need to call the callback now even though the update might not have been processed yet.
                if (cb !== undefined) {
                    cb();
                }
            }
        };

        if (ot === null) {
            // This function has its own transaction, so wait until it finishes before calling the callback.
            tx.oncomplete = function () {
                if (cb !== undefined) {
                    cb();
                }
            };
        }
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
     * @param {function(Object|Array.<Object>)} cb Callback function called with filtered team object or array of filtered team objects, depending on the inputs.
     */
    function filter(options, cb) {
        var filterAttrs, filterSeasonAttrs, filterStats, filterStatsPartial, tx;

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
                            value.amount /= 1000;
                        }
                    });
                } else {
                    ft[options.attrs[j]] = t[options.attrs[j]];
                }
            }
        };

        // Copys/filters the seasonal attributes listed in options.seasonAttrs from p to fp.
        filterSeasonAttrs = function (ft, t, options) {
            var j, lastTenLost, lastTenWon, tsa;

            if (options.seasonAttrs.length > 0) {
                for (j = 0; j < t.seasons.length; j++) {
                    if (t.seasons[j].season === options.season) {
                        tsa = t.seasons[j];
                        break;
                    }
                }

                // Revenue and expenses calculation
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
                        if (tsa.gp > 0) {
                            ft.att = tsa.att / tsa.gp;
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
                    } else if (options.seasonAttrs[j] === "streakLong") {  // For dashboard
                        if (tsa.streak === 0) {
                            ft.streakLong = null;
                        } else if (tsa.streak === 1) {
                            ft.streakLong = "won last game";
                        } else if (tsa.streak > 1) {
                            ft.streakLong = "won last " + tsa.streak + " games";
                        } else if (tsa.streak === -1) {
                            ft.streakLong = "lost last game";
                        } else if (tsa.streak < -1) {
                            ft.streakLong = "lost last " + Math.abs(tsa.streak) + " games";
                        }
                    } else {
                        ft[options.seasonAttrs[j]] = tsa[options.seasonAttrs[j]];
                    }
                }
            }
        };

        // Filters s by stats (which should be options.stats) into ft. This is to do one season of stats filtering.
        filterStatsPartial = function (ft, s, stats) {
            var j;

            if (s !== undefined && s.gp > 0) {
                for (j = 0; j < stats.length; j++) {
                    if (stats[j] === "gp") {
                        ft.gp = s.gp;
                    } else if (stats[j] === "oppty") {
                    //    if (s.fga > 0) {
                            ft.oppty = (s.dery + s.depy)/s.gp;
                   //     } else {
                   //         ft.oppty = 0;
                   //     }
                    } else if (stats[j] === "opptp") {
                    //    if (s.fga > 0) {
                            ft.opptp = (s.der + s.dep)/s.gp;
                   //     } else {
                   //         ft.oppty = 0;
                   //     }oppruya
                    } else if (stats[j] === "oppyp") {
                        if ((s.der + s.dep) > 0) {
                            ft.oppyp = (s.dery + s.depy)/(s.der + s.dep);
                        } else {
                            ft.oppyp = 0;
                        }
                    } else if (stats[j] === "oppruya") {
                        if ((s.der) > 0) {
                            ft.oppruya = (s.dery/s.der);
                        } else {
                            ft.oppruya = 0;
                        }
                    } else if (stats[j] === "opppaya") {
                        if ((s.dep) > 0) {
                            ft.opppaya = (s.depy/s.dep);
                        } else {
                            ft.opppaya = 0;
                        }
						
                    } else if (stats[j] === "fgp") {
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
                        }
                    } else if (stats[j] === "pya") {
                        if (s.fga > 0) {
                            ft.pya =  s.stl / s.fga;
                        } else {
                            ft.pya = 0;
                        }
                    } else if (stats[j] === "ruya") {
                        if (s.tov > 0) {
                            ft.ruya =  s.drb / s.tov;
                        } else {
                            ft.ruya = 0;
                        }						
                    } else if (stats[j] === "ytp") {
                        if (s.prp > 0) {
                            ft.ytp =  s.ty / s.prp;
                        } else {
                            ft.ytp = 0;
                        }						
                    } else if (stats[j] === "opppp") {
                        if (s.dep > 0) {
                            ft.opppp =  100*s.depc / s.dep;
                        } else {
                            ft.opppp = 0;
                        }						
						
                    } else if (stats[j] === "diff") {
                        ft.diff = ft.pts - ft.oppPts;
                    } else if (stats[j] === "season") {
                        ft.season = s.season;
                    } else {
                        if (options.totals) {
                            ft[stats[j]] = s[stats[j]];
                        } else {
                            ft[stats[j]] = s[stats[j]] / s.gp;
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

        tx = db.getObjectStore(options.ot, ["players", "releasedPlayers", "teams"], null);
        tx.objectStore("teams").getAll(options.tid).onsuccess = function (event) {
            var ft, fts, i, returnOneTeam, savePayroll, t, sortBy;

            t = event.target.result;

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
                    for (i = 0; i < sortBy.length; i++) {
                        var prop = sortBy[i],
                            result = (prop.indexOf("-") === 1) ? a[sortBy[i]] - b[sortBy[i]] : b[sortBy[i]] - a[sortBy[i]];

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
                cb(returnOneTeam ? fts[0] : fts);
            } else {
                savePayroll = function (i) {
                    db.getPayroll(options.ot, t[i].tid, function (payroll) {
                        fts[i].payroll = payroll / 1000;
                        if (i === fts.length - 1) {
                            cb(returnOneTeam ? fts[0] : fts);
                        } else {
                            savePayroll(i + 1);
                        }
                    });
                };
                savePayroll(0);
            }
        };
    }

    // estValuesCached is either a copy of estValues (defined below) or null. When it's cached, it's much faster for repeated calls (like trading block).
    function valueChange(tid, pidsAdd, pidsRemove, dpidsAdd, dpidsRemove, estValuesCached, cb) {
        var add, getPicks, getPlayers, gpAvg, payroll, pop, remove, roster, strategy, tx;

		console.log("got here");
        // UGLY HACK: Don't include more than 2 draft picks in a trade for AI team
        if (dpidsRemove.length > 2) {
            cb(-1);
            return;
        }

        // Get value and skills for each player on team or involved in the proposed transaction
        roster = [];
        add = [];
        remove = [];

        tx = g.dbl.transaction(["draftPicks", "players", "releasedPlayers", "teams"]);

        // Get players
        getPlayers = function () {
            var fudgeFactor, i;

            // Fudge factor for AI overvaluing its own players
            if (tid !== g.userTid) {
                fudgeFactor = 1.05;
            } else {
                fudgeFactor = 1;
            }

            tx.objectStore("players").index("tid").openCursor(tid).onsuccess = function (event) {
                var cursor, p;

                cursor = event.target.result;
                if (cursor) {
                    p = cursor.value;

                    if (pidsRemove.indexOf(p.pid) < 0) {
                        roster.push({
                            value: player.value(p),
                            skills: _.last(p.ratings).skills,
                            contract: p.contract,
                            worth: player.genContract(p, false, false, true),
                            injury: p.injury,
                            age: g.season - p.born.year
                        });
                    } else {
                        remove.push({
                            value: player.value(p) * fudgeFactor,
                            skills: _.last(p.ratings).skills,
                            contract: p.contract,
                            worth: player.genContract(p, false, false, true),
                            injury: p.injury,
                            age: g.season - p.born.year
                        });
                    }

                    cursor.continue();
                }
            };

            for (i = 0; i < pidsAdd.length; i++) {
                tx.objectStore("players").get(pidsAdd[i]).onsuccess = function (event) {
                    var p;

                    p = event.target.result;

                    add.push({
                        value: player.value(p, {withContract: true}),
                        skills: _.last(p.ratings).skills,
                        contract: p.contract,
                        worth: player.genContract(p, false, false, true),
                        injury: p.injury,
                        age: g.season - p.born.year
                    });
                };
            }
        };
	//	console.log("got here2");
        getPicks = function () {
            // For each draft pick, estimate its value based on the recent performance of the team
            if (dpidsAdd.length > 0 || dpidsRemove.length > 0) {
                // Estimate the order of the picks by team
                tx.objectStore("teams").getAll().onsuccess = function (event) {
                    var estPicks, estValues, gp, i, rCurrent, rLast, rookieSalaries, s, sorted, t, teams, trade, withEstValues, wps;

                    teams = event.target.result;

                    // This part needs to be run every time so that gpAvg is available
                    wps = []; // Contains estimated winning percentages for all teams by the end of the season
                    for (i = 0; i < teams.length; i++) {
                        t = teams[i];
                        s = t.seasons.length;
                        if (t.seasons.length === 1) {
                            // First season
                            if (t.seasons[0].won + t.seasons[0].lost > 7) {
                                rCurrent = [t.seasons[0].won, t.seasons[0].lost];
                            } else {
                                // Fix for new leagues - don't base this on record until we have some games played, and don't let the user's picks be overvalued
                                if (i === g.userTid) {
                                    rCurrent = [16, 0];
                                } else {
                                    rCurrent = [0, 16];
                                }
                            }
                            if (i === g.userTid) {
                                rLast = [10, 6];
                            } else {
                                rLast = [6, 10]; // Assume a losing season to minimize bad trades
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
                            wps.push((gp / 16 * rCurrent[0] / gp + (8 - gp) / 8 * rLast[0] / 16));
                        } else {
                            wps.push(rLast[0] / 16);
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
                            tx.objectStore("draftPicks").get(dpidsAdd[i]).onsuccess = function (event) {
                                var dp, estPick, seasons, value;

                                dp = event.target.result;
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
                            };
                        }

                        for (i = 0; i < dpidsRemove.length; i++) {
                            tx.objectStore("draftPicks").get(dpidsRemove[i]).onsuccess = function (event) {
                                var dp, estPick, fudgeFactor, seasons, value;

                                dp = event.target.result;
                                estPick = estPicks[dp.originalTid];

                                // For future draft picks, add some uncertainty
                                seasons = dp.season - g.season;
                                estPick = Math.round(estPick * (5 - seasons) / 5 + 15 * seasons / 5);

                                // Set fudge factor with more confidence if it's the current season
                                if (seasons === 0 && gp >= 8) {
                                    fudgeFactor = (1 - gp / 16) * 5;
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
                                        exp: dp.season + 2 + (6 - dp.round) // 3 for first round, 2 for second
                                    },
                                    worth: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)] / 1000,
                                        exp: dp.season + 2 + (6 - dp.round) // 3 for first round, 2 for second
                                    },
                                    injury: {type: "Healthy", gamesRemaining: 0},
                                    age: 19,
                                    draftPick: true
                                });
                            };
                        }
                    };

                    if (estValuesCached) {
                        estValues = estValuesCached;
                        withEstValues();
                    } else {
                        trade = require("core/trade");
                        trade.getPickValues(tx, function (newEstValues) {
                            estValues = newEstValues;
                            withEstValues();
                        });
                    }
                };
            }
        };
	//	console.log("got here 3");
        // Get team strategy and population, for future use
        filter({
            attrs: ["strategy"],
            seasonAttrs: ["pop"],
            stats: ["gp"],
            season: g.season,
            tid: tid,
            ot: tx
        }, function (t) {
            strategy = t.strategy;
            pop = t.pop;
            if (pop > 20) {
                pop = 20;
            }
            gpAvg = t.gp; // Ideally would be done separately for each team, but close enough

            getPlayers();
            getPicks();
        });
	//	console.log("got here 4");
        db.getPayroll(tx, tid, function (payrollLocal) {
            payroll = payrollLocal;
        });
	//	console.log("got here 5");
        tx.oncomplete = function () {
            var contractsFactor, base, doSkillBonuses, dv, needToDrop, rosterAndAdd, rosterAndRemove, salaryAddedThisSeason, salaryRemoved, skillsNeeded, sumContracts, sumValues;

            gpAvg = helpers.bound(gpAvg, 0, 16);

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
		//console.log("got here 6");
            // This roughly corresponds with core.gameSim.updateSynergy
            skillsNeeded = {
                Pp: 1,
                Pd: 1,
                Pe: 1,
                RuP: 1,
                RuF: 1,
                Res: 1,
                Rec: 1,
                Red: 1,
                Bp: 2,
                Br: 2,
                Sa: 2,
                Rs: 2,
                Cs: 1,
                Cc: 1,
                Cd: 1,
                Fg: 1,
                P: 1,
                K: 1
            };

            doSkillBonuses = function (test, roster) {
                var i, j, rosterSkills, rosterSkillsCount, s;

                // What are current skills?
                rosterSkills = [];
                for (i = 0; i < roster.length; i++) {
                    if (roster[i].value >= 45) {
                        rosterSkills.push(roster[i].skills);
                    }
                }
                rosterSkills = _.flatten(rosterSkills);
                rosterSkillsCount = _.countBy(rosterSkills);

                // Sort test by value, so that the highest value players get bonuses applied first
                test.sort(function (a, b) { return b.value - a.value; });

                for (i = 0; i < test.length; i++) {
                    if (test.value >= 45) {
                        for (j = 0; j < test[i].skills.length; j++) {
                            s = test[i].skills[j];

                            if (rosterSkillsCount[s] <= skillsNeeded[s] - 2) {
                                // Big bonus
                                test.value *= 1.1;
                            } else if (rosterSkillsCount[s] <= skillsNeeded[s] - 1) {
                                // Medium bonus
                                test.value *= 1.2;
                            } else if (rosterSkillsCount[s] <= skillsNeeded[s]) {
                                // Little bonus
//                                test.value *= 1.025;
                                test.value *= 1.1;
                            }

                            // Account for redundancy in test
                            rosterSkillsCount[s] += 1;
                        }
                    }
                }

                return test;
            };
		//console.log("got here 7");
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

                    if (strategy === "rebuilding") {
                        // Value young/cheap players and draft picks more. Penalize expensive/old players
                        if (p.draftPick) {
                            playerValue *= 1.15;
                        } else {
                            if (p.age <= 23) {
                                playerValue *= 1.15;
                            } else if (p.age === 20) {
                                playerValue *= 1.1;
                            } else if (p.age === 21) {
                                playerValue *= 1.075;
                            } else if (p.age === 22) {
                                playerValue *= 1.05;
                            } else if (p.age === 23) {
                                playerValue *= 1.025;
                            } else if (p.age === 27) {
                                playerValue *= 0.975;
                            } else if (p.age === 28) {
                                playerValue *= 0.95;
                            } else if (p.age >= 29) {
                                playerValue *= 0.9;
                            }
                        }
                    }

                    // Anything below 45 is pretty worthless
                    playerValue -= 45;

                    // Normalize for injuries
                    if (includeInjuries && tid !== g.userTid) {
                        if (p.injury.gamesRemaining > 15) {
                            playerValue -= playerValue * 0.75;
                        } else {
                            playerValue -= playerValue * p.injury.gamesRemaining / 100;
                        }
                    }

                    contractValue = (p.worth.amount - p.contract.amount) / 1000;

                    // Account for duration
                    contractSeasonsRemaining = player.contractSeasonsRemaining(p.contract.exp, 16 - gpAvg);
                    if (contractSeasonsRemaining > 1) {
                        // Don't make it too extreme
                        contractValue *= Math.pow(contractSeasonsRemaining, 0.25);
                    } else {
                        // Raising < 1 to < 1 power would make this too large
                        contractValue *= contractSeasonsRemaining;
                    }

                    // Really bad players will just get no PT
                    if (playerValue < 0) {
                        playerValue = 0;
                    }
//console.log([playerValue, contractValue]);

                    value = playerValue + 0.5 * contractValue;

                    if (value === 0) {
                        return memo;
                    }
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

                    return memo + p.contract.amount / 1000 * Math.pow(player.contractSeasonsRemaining(p.contract.exp, 16 - gpAvg), 0.25 - (onlyThisSeason ? 0.25 : 0));
                }, 0);

                return sum;
            };

            if (strategy === "rebuilding") {
                contractsFactor = 0.3;
            } else {
                contractsFactor = 0.1;
            }

            salaryRemoved = sumContracts(remove) - sumContracts(add);
	//	console.log("got here 8");
            dv = sumValues(add, true) - sumValues(remove) + contractsFactor * salaryRemoved;
/*console.log("Added players/picks: " + sumValues(add, true));
console.log("Removed players/picks: " + (-sumValues(remove)));
console.log("Added contract quality: -" + contractExcessFactor + " * " + sumContractExcess(add));
console.log("Removed contract quality: -" + contractExcessFactor + " * " + sumContractExcess(remove));
console.log("Total contract amount: " + contractsFactor + " * " + salaryRemoved);*/

            // Aversion towards losing cap space in a trade during free agency
            if (g.phase >= g.PHASE.RESIGN_PLAYERS || g.phase <= g.PHASE.FREE_AGENCY) {
                // Only care if cap space is over 2 million
                if (payroll + 2000 < g.salaryCap) {
                    salaryAddedThisSeason = sumContracts(add, true) - sumContracts(remove, true);
                    // Only care if cap space is being used
                    if (salaryAddedThisSeason > 0) {
//console.log("Free agency penalty: -" + (0.2 + 0.8 * g.daysLeft / 30) * salaryAddedThisSeason);
                        dv -= (0.2 + 0.8 * g.daysLeft / 30) * salaryAddedThisSeason; // 0.2 to 1 times the amount, depending on stage of free agency
                    }
                }
            }

            // Below is TOO SLOW and TOO CONFUSING. Above is less correct, but performs well.
            /*// Teams should be less likely to trade in free agency, since they could alternatively just sign a free agent
            if (g.phase >= g.PHASE.RESIGN_PLAYERS || g.phase <= g.PHASE.FREE_AGENCY) {
                // Short circuit if we're not adding any salary
                if (salaryRemoved > 0) {
                    return cb(dv);
                }

                tx = g.dbl.transaction(["players", "releasedPlayers"]);

                // Is this team under the cap?
                db.getPayroll(tx, tid, function (payroll) {
                    if (payroll < g.salaryCap) {
console.log(payroll);
                        // Get the top free agent that fits under the cap
                        tx.objectStore("players").index("tid").getAll(g.PLAYER.FREE_AGENT).onsuccess = function (event) {
                            var i, players, topFreeAgent;

                            // List of free agents, sorted by value
                            players = event.target.result;
                            players.sort(function (a, b) { return player.value(b) - player.value(a); });

                            for (i = 0; i < players.length; i++) {
                                if (players[i].contract.amount + payroll <= g.salaryCap) {
                                    topFreeAgent = players[i];
                                    break;
                                }
                            }
console.log(topFreeAgent);

                            // Short circuit to prevent infinite callbacks
                            if (pidsAdd[0] === topFreeAgent.pid && pidsAdd.length === 1 && pidsRemove.length === 0 && dpidsAdd.length === 0 && dpidsRemove.length === 0) {
                                return cb(dv);
                            }

                            // Short circuit if the added salary doesn't impact this signing
                            if (topFreeAgent.contract.amount + payroll - salaryRemoved * 1000 <= g.salaryCap) {
console.log("Trade doesn't add so much as to prevent FA signing");
                                return cb(dv);
                            }

                            valueChange(tid, [topFreeAgent.pid], [], [], [], function (dvFreeAgent) {
console.log([dv, dvFreeAgent]);
                                if (dvFreeAgent > dv) {
console.log("Better options in free agency");
                                } else {
console.log("Worse options in free agency")
                                }
                            });
                        };
                    } else {
                        cb(dv);
                    }
                });
            } else {
                cb(dv);
            }*/

            // Normalize for number of players, since 1 really good player is much better than multiple mediocre ones
            // This is a fudge factor, since it's one-sided to punish the player
            if (add.length > remove.length) {
                dv *= Math.pow(0.9, add.length - remove.length);
            }
	//	console.log("got here 9");
            cb(dv);
/*console.log('---');
console.log([sumValues(add), sumContracts(add)]);
console.log([sumValues(remove), sumContracts(remove)]);
console.log(dv);*/

        };
		console.log("done");
    }

    /**
     * Update team strategies (contending or rebuilding) for every team in the league.
     *
     * Basically.. switch to rebuilding if you're old and your success is fading, and switch to contending if you have a good amount of young talent on rookie deals and your success is growing.
     * 
     * @memberOf core.team
     * @param {function ()} cb Callback.
     */
    function updateStrategies(cb) {
        var tx;

        // For
        tx = g.dbl.transaction(["players", "teams"], "readwrite");
        tx.objectStore("teams").openCursor().onsuccess = function (event) {
            var dWon, cursor, s, t, won;

            cursor = event.target.result;
            if (cursor) {
                t = cursor.value;

                // Skip user's team
                if (t.tid === g.userTid) {
                    return cursor.continue();
                }

                s = t.seasons.length - 1;
                won = t.seasons[s].won;
                if (s > 0) {
                    dWon = won - t.seasons[s - 1].won;
                } else {
                    dWon = 0;
                }

                tx.objectStore("players").index("tid").getAll(t.tid).onsuccess = function (event) {
                    var age, denominator, i, numerator, players, score, updated, youngStar;

                    players = player.filter(event.target.result, {
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
                        if (players[i].value > 65 && players[i].contract.exp === g.season + 1 && players[i].contract.amount <= 5 && players[i].age <= 25) {
                            youngStar += 1;
                        }
                    }

                    // Average age, weighted by minutes played
                    age = numerator / denominator;

//console.log([t.abbrev, 0.8 * dWon, (won - 41), 5 * (26 - age), youngStar * 20])
                    score = 0.8 * dWon + (won - 8) + 5 * (26 - age) + youngStar * 20;

                    updated = false;
                    if (score > 20 && t.strategy === "rebuilding") {
//console.log(t.abbrev + " switch to contending")
                        t.strategy = "contending";
                        updated = true;
                    } else if (score < -20 && t.strategy === "contending") {
//console.log(t.abbrev + " switch to rebuilding")
                        t.strategy = "rebuilding";
                        updated = true;
                    }

                    if (updated) {
                        cursor.update(t);
                    }

                    cursor.continue();
                };
            }
        };

        tx.oncomplete = function () {
            cb();
        };
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
     * @param {function (?userTeamSizeError)} cb Callback whose argument is
     *     undefined if there is no error, or a string with the error message
     *     otherwise.
     */
    function checkRosterSizes(cb) {
        var checkRosterSize, minFreeAgents,minFreeAgentsQB,minFreeAgentsOL,minFreeAgentsWR,minFreeAgentsK,minFreeAgentsRB, playerStore, tx, userTeamSizeError;

        checkRosterSize = function (tid) {
            playerStore.index("tid").getAll(tid).onsuccess = function (event) {
                var i, numPlayersOnRoster, p, players,numActivePlayersOnRoster,hasQB,hasTwoK,hasRB;
				var hasWR;
				var hasRB2;
				var hasOL;
                players = event.target.result;
                numPlayersOnRoster = players.length;

			/*	var payroll;
				for (i = 0; i < players.length; i++) {
					// Don't sign minimum contract players to fill out the roster
//					if (players[i].contract.amount + payroll <= g.salaryCap || (players[i].contract.amount === g.minContract && numPlayersOnRoster < 45)) {
						p = players[i];
						payroll += p.contract.amount;
					
				}*/
				
			//	console.log("g.salaryCap : "+g.salaryCap+" payroll: "+payroll);
				//console.log("players.length: "+players.length);
				//console.log("players.length: "+players.length);
				//console.log("offense? players.length: "+players.off.length);
//				console.log("offense? active players.length: "+players.off.active.length);
			//	console.log("offense? active players.length: "+players[1]);
//				console.log("offense? active players.length: "+players.active.length);
				//console.log("offense? active players.length: "+players[1].active); // true/false
				numActivePlayersOnRoster = 0;
				hasQB = false;
				hasRB = false;
				hasRB2 = 0;
				hasOL = 0;
				hasWR = false;
				hasTwoK = 0;
                for (i = 0; i < (numPlayersOnRoster); i++) {
//                        for (i = 0; i < (numPlayersOnRoster - 15); i++) {
					if (players[i].pos == "QB") {
					    hasQB = true;
					}
					if (players[i].pos == "K") {
					    hasTwoK += 1;
					}					
					if (players[i].pos == "RB") {
					    hasRB = true;
						hasRB2 += 1;
					}
					if (players[i].pos == "WR") {
					    hasWR = true;
					}
					if (players[i].pos == "OL") {
					    hasOL += 1;
					}
					
					if (players[i].active == true) {
						numActivePlayersOnRoster += 1;
					//	console.log("i: "+i+"position : "+players[i].pos);
						//			console.log("i: "+i+" true players[i].active: "+players[i].active); // true/false
						
					} else {
			//			console.log("i: "+i+" false players[i].active: "+players[i].active); // true/false
					}
                     
                }
				
		//		console.log("hasQB: "+hasQB);
				
			//	console.log("numActivePlayersOnRoster: "+numActivePlayersOnRoster); // true/false
			//	console.log("players[0].active: "+players[0].active); // true/false
				
//                if (numPlayersOnRoster > 15) { // mistake
                if (hasQB == false) {
			//			console.log("hasQB: "+hasQB+"numPlayersOnRoster: "+numPlayersOnRoster+" g.minRosterSize: "+g.minRosterSize);
                            p = minFreeAgentsQB.shift();
				//			console.log("tid: "+tid);						
                            p.tid = tid;
                            p = player.addStatsRow(p);
                            p = player.setContract(p, p.contract, true);
                            p.gamesUntilTradable = 4;
                            playerStore.put(p);

                            numPlayersOnRoster += 1;				
//                } else if (hasRB == false) {
                } else if (hasRB2 < 2) {
			//			console.log("hasRB: "+hasRB+"numPlayersOnRoster: "+numPlayersOnRoster+" g.minRosterSize: "+g.minRosterSize);
                            p = minFreeAgentsRB.shift();
			//				console.log("tid: "+tid);						
                            p.tid = tid;
                            p = player.addStatsRow(p);
                            p = player.setContract(p, p.contract, true);
                            p.gamesUntilTradable = 4;
                            playerStore.put(p);

                            numPlayersOnRoster += 1;				
                } else if (hasWR == false) {
			//			console.log("hasRB: "+hasRB+"numPlayersOnRoster: "+numPlayersOnRoster+" g.minRosterSize: "+g.minRosterSize);
                            p = minFreeAgentsWR.shift();
			//				console.log("tid: "+tid);						
                            p.tid = tid;
                            p = player.addStatsRow(p);
                            p = player.setContract(p, p.contract, true);
                            p.gamesUntilTradable = 4;
                            playerStore.put(p);

                            numPlayersOnRoster += 1;				
				} else if (hasTwoK < 2) {
			//			console.log("hasTwoK: "+hasTwoK+"numPlayersOnRoster: "+numPlayersOnRoster+" g.minRosterSize: "+g.minRosterSize);
                            p = minFreeAgentsK.shift();
			//				console.log("tid: "+tid);						
                            p.tid = tid;
                            p = player.addStatsRow(p);
                            p = player.setContract(p, p.contract, true);
                            p.gamesUntilTradable = 4;
                            playerStore.put(p);

                            numPlayersOnRoster += 1;				
				} else if (hasOL < 5) {
			//			console.log("hasTwoK: "+hasTwoK+"numPlayersOnRoster: "+numPlayersOnRoster+" g.minRosterSize: "+g.minRosterSize);
                            p = minFreeAgentsOL.shift();
			//				console.log("tid: "+tid);						
                            p.tid = tid;
                            p = player.addStatsRow(p);
                            p = player.setContract(p, p.contract, true);
                            p.gamesUntilTradable = 4;
                            playerStore.put(p);

                            numPlayersOnRoster += 1;				
					
					
					
					
				} else if (numPlayersOnRoster > 53) {
                    if ((tid === g.userTid) && (g.startingSeason != g.season)) {						

                        userTeamSizeError = 'Your team currently has more than the maximum number of players (53). You must remove players (by <a href="' + helpers.leagueUrl(["roster"]) + '">releasing them from your roster</a> or through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
 					} else {

                        // Automatically drop lowest value players until we reach 15
                        players.sort(function (a, b) { return player.value(a) - player.value(b); }); // Lowest first
                        for (i = 0; i < (numPlayersOnRoster - 53); i++) {
//                        for (i = 0; i < (numPlayersOnRoster - 15); i++) {
                            player.release(tx, players[i], false);
                        }
                    }
                } else if (numPlayersOnRoster < g.minRosterSize) {
                    if ((tid === g.userTid) && (g.startingSeason != g.season)) {						

                        userTeamSizeError = 'Your team currently has less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
                    } else {
                        // Auto-add players
console.log([tid, minFreeAgents.length, numPlayersOnRoster]);

                        while (numPlayersOnRoster < g.minRosterSize) {
				//		console.log("numPlayersOnRoster: "+numPlayersOnRoster+" g.minRosterSize: "+g.minRosterSize);
                            p = minFreeAgents.shift();
							console.log("tid: "+tid);						
                            p.tid = tid;
                            p = player.addStatsRow(p);
                            p = player.setContract(p, p.contract, true);
                            p.gamesUntilTradable = 4;
                            playerStore.put(p);

                            numPlayersOnRoster += 1;
                        }
//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);
                    }
                } else if (numActivePlayersOnRoster != 45 && numActivePlayersOnRoster != 0) {
                    if ((tid === g.userTid) && (g.startingSeason != g.season)) {						

						if (numActivePlayersOnRoster > 45) {
						//	console.log("too many"+numActivePlayersOnRoster);
							userTeamSizeError = 'Your team currently has more than the required number of active players (45). You can fix this at the roster page by moving players from active to inactive.';
						} else {
							userTeamSizeError = 'Your team currently has less than the required number of active players (45). You can fix this at the roster page by moving players from inactive to active.';
						//	console.log("too few"+numActivePlayersOnRoster);
						}
                    } else {

						//// this should never happen, as long as there are enough players, the AI roster should always have enough active players and never too many
						//rosterAutoSort(playerStore, tid);
						//console.log("AI teams active roster # wrong, this should never happen: "+numActivePlayersOnRoster);

						
                        // Automatically drop lowest value players until we reach 15
                        /*players.sort(function (a, b) { return player.value(a) - player.value(b); }); // Lowest first
                        for (i = 0; i < (numPlayersOnRoster - 53); i++) {
//                        for (i = 0; i < (numPlayersOnRoster - 15); i++) {
                            player.release(tx, players[i], false);
                        }*/
                    }
				}

                // Auto sort rosters (except player's team)
                if (tid !== g.userTid) {
                    rosterAutoSort(playerStore, tid);
                }
            };
        };

        tx = g.dbl.transaction(["players", "releasedPlayers", "teams"], "readwrite");
        playerStore = tx.objectStore("players");

        userTeamSizeError = null;

        playerStore.index("tid").getAll(g.PLAYER.FREE_AGENT).onsuccess = function (event) {
            var i, players;

            players = event.target.result;

            // List of free agents looking for minimum contracts, sorted by value. This is used to bump teams up to the minimum roster size.
            minFreeAgentsQB = [];
            for (i = 0; i < players.length; i++) {
                if ((players[i].contract.amount <= 20000) && (players[i].pos == "QB")) {
                    minFreeAgentsQB.push(players[i]);
                }
            }
            minFreeAgentsQB.sort(function (a, b) { return player.value(b) - player.value(a); });

            // List of free agents looking for minimum contracts, sorted by value. This is used to bump teams up to the minimum roster size.
            minFreeAgentsRB = [];
            for (i = 0; i < players.length; i++) {
                if ((players[i].contract.amount <= 20000) && (players[i].pos == "RB")) {
                    minFreeAgentsRB.push(players[i]);
                }
            }
            minFreeAgentsRB.sort(function (a, b) { return player.value(b) - player.value(a); });

            // List of free agents looking for minimum contracts, sorted by value. This is used to bump teams up to the minimum roster size.
            minFreeAgentsWR = [];
            for (i = 0; i < players.length; i++) {
                if ((players[i].contract.amount <= 20000) && (players[i].pos == "WR")) {
                    minFreeAgentsWR.push(players[i]);
                }
            }
            minFreeAgentsWR.sort(function (a, b) { return player.value(b) - player.value(a); });
			
            // List of free agents looking for minimum contracts, sorted by value. This is used to bump teams up to the minimum roster size.
            minFreeAgentsK = [];
            for (i = 0; i < players.length; i++) {
                if ((players[i].contract.amount <= 20000) && (players[i].pos == "K")) {
                    minFreeAgentsK.push(players[i]);
                }
            }
            minFreeAgentsK.sort(function (a, b) { return player.value(b) - player.value(a); });

            minFreeAgentsOL = [];
            for (i = 0; i < players.length; i++) {
                if ((players[i].contract.amount <= 20000) && (players[i].pos == "OL")) {
                    minFreeAgentsOL.push(players[i]);
                }
            }
            minFreeAgentsOL.sort(function (a, b) { return player.value(b) - player.value(a); });

			
            // Make sure teams are all within the roster limits
        /*    for (i = 0; i < g.numTeams; i++) {
                checkRosterSize(i);
            }			*/
			
			
            // List of free agents looking for minimum contracts, sorted by value. This is used to bump teams up to the minimum roster size.
            minFreeAgents = [];
            for (i = 0; i < players.length; i++) {
//                if (players[i].contract.amount <= 400) {
                if ((players[i].contract.amount <= 400) && (players[i].pos != "QB") && (players[i].pos != "K") && (players[i].pos != "RB") && (players[i].pos != "OL") && (players[i].pos != "WR")) {
                    minFreeAgents.push(players[i]);
                }
            }
            minFreeAgents.sort(function (a, b) { return player.value(b) - player.value(a); });

            // Make sure teams are all within the roster limits
            for (i = 0; i < g.numTeams; i++) {
                checkRosterSize(i);
            }
        };

        tx.oncomplete = function () {
            cb(userTeamSizeError);
        };
    }

    return {
        addSeasonRow: addSeasonRow,
        addStatsRow: addStatsRow,
        generate: generate,
        rosterAutoSort: rosterAutoSort,
        filter: filter,
        valueChange: valueChange,
        updateStrategies: updateStrategies,
        checkRosterSizes: checkRosterSizes
    };
});