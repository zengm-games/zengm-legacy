/**
 * @name core.gameSim
 * @namespace Individual game simulation.
 */
define(["globals","lib/underscore", "util/helpers", "util/random", "util/random"], function (g,_, helpers, random) {
    "use strict";

	
     var penaltyPlayers = [[100, 100, 100, 100, 100,100], [100,100, 100, 100, 100,100]];
     var penaltyTime = [[0, 0, 0, 0, 0,0], [0,0, 0, 0, 0,0]];
     var penaltyNumber = [0, 0];
	
	
    /**
     * Initialize the two teams that are playing this game.
     * 
     * When an instance of this class is created, information about the two teams is passed to GameSim. Then GameSim.run will actually simulate a game and return the results (i.e. stats) of the simulation. Also see core.game where the inputs to this function are generated.
     * 
     * @memberOf core.gameSim
     * @param {number} gid Integer game ID, which must be unique as it will serve as the primary key in the database when the game is saved.
     * @param {Object} team1 Information about the home team. Top-level properties are: id (team ID number), defense (a number representing the overall team defensive rating), pace (the mean number of possessions the team likes to have in a game), stat (an for storing team stats), and player (a list of objects, one for each player on the team, ordered by rosterOrder). Each player's object contains: id (player's unique ID number), valueNoPot (current player value, from core.player.value), stat (an object for storing player stats, similar to the one for team stats), and compositeRatings (an object containing various ratings used in the game simulation), and skills (a list of discrete skills a player has, as defined in core.player.skills, which influence game simulation). In other words...
     *     {
     *         "id": 0,
     *         "defense": 0,
     *         "pace": 0,
     *         "stat": {},
     *         "player": [
     *             {
     *                 "id": 0,
     *                 "valueNoPot": 0,
     *                 "stat": {},
     *                 "compositeRating": {},
     *                 "skills": [],
     *                 "injured": false,
     *                 "ptMultiplier": 1
     *             },
     *             ...
     *         ]
     *     }
     * @param {Object} team2 Same as team1, but for the away team.
     */
    function GameSim(gid, team1, team2, doPlayByPlay) {
        if (doPlayByPlay) {
            this.playByPlay = [];
        }

        this.id = gid;
        this.team = [team1, team2];  // If a team plays twice in a day, this needs to be a deep copy
//        this.numPossessions = Math.round((this.team[0].pace + this.team[1].pace) / 2 * random.uniform(0.9, 1.1));
//        this.numPossessions = Math.round((this.team[0].pace + this.team[1].pace) /  6  * random.uniform(0.9, 1.1));
        this.numPossessions = Math.round((this.team[0].pace + this.team[1].pace) /  2.5  * random.uniform(0.9, 1.1));
        this.dt = 60 / (2 * this.numPossessions); // Time elapsed per possession

        this.playersOnCourt = [[0, 1, 2, 3, 4,5], [0, 1, 2, 3, 4,5]];
		
		
		var p;
		for (p = 0; p < this.team[0].player.length; p++) {
	//	    console.log("0 p: "+p+" offDefK: "+this.team[0].player[p].offDefK+" active: "+this.team[0].player[p].active +"rosterOrder: "+this.team[0].player[p].rosterOrder);
        }
		for (p = 0; p < this.team[1].player.length; p++) {
	//	    console.log("1 p: "+p+" offDefK: "+this.team[1].player[p].offDefK+" active: "+this.team[1].player[p].active +"rosterOrder: "+this.team[1].player[p].rosterOrder);
        }
		
		var offenseCount, defenseCount,i;
			
		offenseCount = 0;
		defenseCount = 0;

		
		for (i = 0; i < this.team[0].player.length; i++) {
			////console.log(i+" "+this.team[0].player[i].injured+" "+this.team[0].player[i].pos+" "+this.team[0].player[i].active+" "+this.team[0].player[i].playing+" "+this.team[0].player[i].ovr+" "+this.team[0].player[i].rosterOrder);
			//console.log("userPlayers[i].offDefK: "+userPlayers[i].offDefK);
			if ((this.team[0].player[i].offDefK=="off") && (offenseCount < 5) && (this.team[0].player[i].injured == false) ) {
				//this.playersOnCourt = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]];
				this.playersOnCourt[0][offenseCount] = i;	
//				vars.starters[offenseCount] = userPlayers[i];
				offenseCount += 1;
		//		console.log("offense");
			} else if ( (this.team[0].player[i].offDefK=="def") && (defenseCount < 1) && (this.team[0].player[i].injured == false) ) {
				this.playersOnCourt[0][5] = i	;
//				vars.goalie[defenseCount] = userPlayers[i];
				defenseCount += 1;				
			//	console.log("goalie");
			
//			} else if ( (this.team[0].player[i].offDefK=="def") && (defenseCount > 0) && (this.team[0].player[i].injured == false) && (this.team[0].player[i].active == true) && (g.phase < g.PHASE.PLAYOFFS) ) {
			} else if ( (this.team[0].player[i].offDefK=="def") && (defenseCount > 0) && (this.team[0].player[i].injured == false) && (this.team[0].player[i].active == true)  ) {
				//if ((this.team[0].player[this.playersOnCourt[0][5]].ovr/100 - this.team[0].player[i].ovr/100) > 0) {
				//console.log(this.team[0].player[this.playersOnCourt[0][5]].ovr/100 - this.team[0].player[i].ovr/100);
					if (g.phase < g.PHASE.PLAYOFFS) {
						if ((this.team[0].player[this.playersOnCourt[0][5]].ovr/100 - this.team[0].player[i].ovr/100+.5) < Math.random()) {
								this.playersOnCourt[0][5] = i;
						}							
					} else {
						if (this.team[0].player[this.playersOnCourt[0][5]].ovr < this.team[0].player[i].ovr) {
								this.playersOnCourt[0][5] = i;
						}													
					}
		
			}
		}		

		offenseCount = 0;
		defenseCount = 0;

		
		for (i = 0; i < this.team[1].player.length; i++) {
			//console.log("userPlayers[i].offDefK: "+userPlayers[i].offDefK);
			if ((this.team[1].player[i].offDefK=="off") && (offenseCount < 5) && (this.team[1].player[i].injured == false))  {
				//this.playersOnCourt = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]];
				this.playersOnCourt[1][offenseCount] = i	;
//				vars.starters[offenseCount] = userPlayers[i];
				offenseCount += 1;
		//		console.log("offense");
			} else if ( (this.team[1].player[i].offDefK=="def") && (defenseCount < 1) && (this.team[1].player[i].injured == false)) {
				this.playersOnCourt[1][5] = i	;
//				vars.goalie[defenseCount] = userPlayers[i];
				defenseCount += 1;				
			//	console.log("goalie");
			
			} else if ( (this.team[1].player[i].offDefK=="def") && (defenseCount > 0) && (this.team[1].player[i].injured == false) && (this.team[1].player[i].active == true) && (g.phase < g.PHASE.PLAYOFFS) ) {
				//if ((this.team[0].player[this.playersOnCourt[0][5]].ovr/100 - this.team[0].player[i].ovr/100) > 0) {
				//console.log(this.team[0].player[this.playersOnCourt[0][5]].ovr/100 - this.team[0].player[i].ovr/100);
				//	console.log((this.team[1].player[this.playersOnCourt[1][5]].ovr/100 - this.team[1].player[i].ovr/100+.5)+" 0backup considered "+this.team[1].player[this.playersOnCourt[1][5]].ovr+" "+this.team[1].player[i].ovr);	
					if ((this.team[1].player[this.playersOnCourt[1][5]].ovr/100 - this.team[1].player[i].ovr/100+.5) < Math.random()) {
					//	console.log("0backup considered"+this.team[1].player[this.playersOnCourt[1][5]].ovr+" "+this.team[1].player[i].ovr);					
					//	if (Math.random() < .5) {
					//		console.log("0backup used");
							this.playersOnCourt[1][5] = i;
					//	}
					}			
			}
		}		

		for (i = 0; i < 6; i++) {
		//	console.log("0 p: "+i+" "+this.team[0].player[this.playersOnCourt[0][i]].pos+" "+this.team[0].player[this.playersOnCourt[0][i]].offDefK);		 
		}		
		for (i = 0; i < 6; i++) {
		//	console.log("1 p: "+i+" "+this.team[1].player[this.playersOnCourt[1][i]].pos+" "+this.team[0].player[this.playersOnCourt[0][i]].offDefK);		 
		}		



		
        // Starting lineups, which will be reset by updatePlayersOnCourt. This must be done because of injured players in the top 5.
//        this.playersOnCourt = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]];
        this.startersRecorded = false;  // Used to track whether the *real* starters have been recorded or not.
        this.updatePlayersOnCourt();

        this.subsEveryN = 1;  // How many possessions to wait before doing substitutions

        this.overtimes = 0;  // Number of overtime periods that have taken place

        this.t = 20; // Game clock, in minutes

        // Parameters
        this.synergyFactor = 0.1;  // How important is synergy?
        this.ratingsWeight = 0.4;  // How important are ratings //.02

        this.homeCourtAdvantage();
    }

    /**
     * Home court advantage.
     *
     * Scales composite ratings, giving home players bonuses and away players penalties.
     *
     * @memberOf core.gameSim
     */
    GameSim.prototype.homeCourtAdvantage = function () {
        var factor, p, r, t;

		// strong away advantage, need to remove, but don't know where it comes from
		// for now, overcompensate here
        for (t = 0; t < 2; t++) {
            if (t === 0) {
                factor = 1.01;  // Bonus for home team
            } else {
                factor = 0.99;  // Penalty for away team
            }

            for (p = 0; p < this.team[t].player.length; p++) {
                for (r in this.team[t].player[p].compositeRating) {
                    if (this.team[t].player[p].compositeRating.hasOwnProperty(r)) {
                        this.team[t].player[p].compositeRating[r] *= factor;
                    }
                }
            }
        }
    };


    /**
     * Simulates the game and returns the results.
     *
     * Also see core.game where the outputs of this function are used.
     *  
     * @memberOf core.gameSim
     * @return {Array.<Object>} Game result object, an array of two objects similar to the inputs to GameSim, but with both the team and player "stat" objects filled in and the extraneous data (pace, valueNoPot, compositeRating) removed. In other words...
     *     {
     *         "gid": 0,
     *         "overtimes": 0,
     *         "team": [
     *             {
     *                 "id": 0,
     *                 "stat": {},
     *                 "player": [
     *                     {
     *                         "id": 0,
     *                         "stat": {},
     *                         "skills": [],
     *                         "injured": false
     *                     },
     *                     ...
     *                 ]
     *             },
     *         ...
     *         ]
     *     }
     */
    GameSim.prototype.run = function () {
        var out, p, t;

        // Simulate the game up to the end of regulation
        this.simPossessions();

        // Play overtime periods if necessary
        while (this.team[0].stat.pts === this.team[1].stat.pts) {
            if (this.overtimes === 0) {
				if (g.phase < g.PHASE.PLAYOFFS ) {			
					this.numPossessions = Math.round(this.numPossessions * 5 / 36);  // 5 minutes of possessions
					this.dt = 5 / (2 * this.numPossessions);
				} else {
					this.numPossessions = Math.round(this.numPossessions * 20 / 36);  // 5 minutes of possessions
					this.dt = 20 / (2 * this.numPossessions);
				}
            }
			// only should be regular season, playoff should be unlimited OT
			if (this.overtimes == 1 && (g.phase < g.PHASE.PLAYOFFS) ) {
				//console.log(Math.random());
				if (Math.random() < .5) {
					this.team[0].stat.pts += 1;
					this.team[0].stat.ptsQtrs[3] += 1;
					
				} else {
					this.team[1].stat.pts += 1;
					this.team[1].stat.ptsQtrs[3] += 1;
				}
			} else {

				if (g.phase < g.PHASE.PLAYOFFS ) {			
					this.t = 5;			
				} else {
					this.t = 20;			
				}
			
				this.overtimes += 1;	
				this.team[0].stat.ptsQtrs.push(0);
				this.team[1].stat.ptsQtrs.push(0);
				this.recordPlay("overtime");
				this.simPossessions();
			}
//console.log(this.overtimes+" "+this.team[0].stat.pts +" "+this.team[1].stat.pts );

        }

        // Delete stuff that isn't needed before returning
        for (t = 0; t < 2; t++) {
            delete this.team[t].compositeRating;
            delete this.team[t].pace;
            for (p = 0; p < this.team[t].player.length; p++) {
                delete this.team[t].player[p].valueNoPot;
                delete this.team[t].player[p].compositeRating;
                delete this.team[t].player[p].ptModifier;
            }
        }

        out = {
            gid: this.id,
            overtimes: this.overtimes,
            team: this.team
        };

        if (this.playByPlay !== undefined) {
            out.playByPlay = this.playByPlay;
            this.playByPlay.unshift({
                type: "init",
                boxScore: this.team
            });
        }

        return out;
    };

    /**
     * Simulate this.numPossessions possessions.
     *
     * To simulate regulation or overtime, just set this.numPossessions to the appropriate value and call this function.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.simPossessions = function () {
        var i,l,l2,t,p,pp, outcome, substitutions;
		var longestPenalty = [0, 0];
        this.o = 0;
        this.d = 1;

        i = 0;
        while (i < this.numPossessions * 2) {
            // Keep track of quarters
            if ((i * this.dt > 20 && this.team[0].stat.ptsQtrs.length === 1) ||
  //                  (i * this.dt > 24 && this.team[0].stat.ptsQtrs.length === 2) ||
//                    (i * this.dt > 36 && this.team[0].stat.ptsQtrs.length === 3)) {
                    (i * this.dt > 40 && this.team[0].stat.ptsQtrs.length === 2)) {
                this.team[0].stat.ptsQtrs.push(0);
                this.team[1].stat.ptsQtrs.push(0);
                this.t = 20;
                this.recordPlay("period");
            }

			/*penaltyPlayers[this.d][0] = this.pickPlayer(ratios);
			penaltyTime[this.d][0] = 120;
			penaltyNumber[this.d] = 1;*/			
						
	       //this.recordStat(this.d, p2, "pf");
			
			// reduce remaining minutes
			// check minutes to cap play?
			//// play longer than penalty time
			
			//// adjust penalty minutes
			longestPenalty[this.o] = 0;
			longestPenalty[this.d] = 0;	


			
			for (t = 0; t < 2; t++) {
				for (l = 0; l < penaltyNumber[t]; l++) {
			//	 console.log("b l: "+l+" penaltyNumber[t]: "+penaltyNumber[t]+" penaltyTime[t][l]: "+penaltyTime[t][l] +" penaltyPlayers[t][l]: "+penaltyPlayers[t][l] );				  
				  penaltyTime[t][l] -= this.dt;
			//	 console.log("a l: "+l+" penaltyNumber[t]: "+penaltyNumber[t]+" penaltyTime[t][l]: "+penaltyTime[t][l] +" penaltyPlayers[t][l]: "+penaltyPlayers[t][l] );
				  if   (longestPenalty[t] < penaltyTime[t][l]) {
						longestPenalty[t] = penaltyTime[t][l];				  
				  }
			//	 console.log("longestPenalty[t]: "+longestPenalty[t] );
				  if ((penaltyTime[t][l]) <= 0) {
				    
					if (penaltyTime[t][l] < 100) {
					} else {
						this.t -= this.dt;
						this.t += penaltyTime[t][l];
					}
					
					//// PlaybyPlay Penalty over, adjust time
					p = penaltyPlayers[t][l];
					if (penaltyTime[t][l] < 100) {
						this.recordPlay("pfOver", t, [this.team[t].player[p].name]);
//						this.recordStat(t, p, "pmin",this.dt+penaltyTime[t][l]);
					} else {
						this.recordPlay("pfOver", (t+this.dt), [this.team[t].player[p].name]);
						this.recordStat(t, p, "pmin",this.dt+penaltyTime[t][l]);
					}

					if (penaltyTime[t][l] < 100) {
					} else {
						this.t += this.dt;
						this.t -= penaltyTime[t][l];
					}					
					
					for (l2 = l; l2 < penaltyNumber[t]-1; l2++) {
						 penaltyPlayers[t][l2] = penaltyPlayers[t][l2+1];
						 penaltyTime[t][l2] = penaltyTime[t][l2+1];						 
					}
					penaltyNumber[t] -= 1;
					penaltyPlayers[t][penaltyNumber[t]] = 100;
					penaltyTime[t][penaltyNumber[t]] = 0;
					l -= 1;
                    this.updateSynergy();					
				  } else {
					p = penaltyPlayers[t][l];
					this.recordStat(t, p, "pmin",this.dt);
				  
				  }
				}
														
			}
			

			// play shorter than penalty time
			
			if ( (longestPenalty[this.o]  == 0) && (longestPenalty[this.d] == 0) ) {
			
			
				for (t = 0; t < 2; t++) {
				// console.log("should be zero l: "+l+" penaltyNumber[t]: "+penaltyNumber[t]+" penaltyTime[t][l]: "+penaltyTime[t][l] +" penaltyPlayers[t][l]: "+penaltyPlayers[t][l] );
					for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
						p = this.playersOnCourt[t][pp];
				    
						this.recordStat(t, p, "emin",this.dt);
					}

				}
						
			
			} else if ((longestPenalty[this.o]  < 0) && (longestPenalty[this.d] < 0)) {
			
				if ((longestPenalty[this.o]  >= longestPenalty[this.d] )) {

					if ((longestPenalty[this.o] < -this.dt) && (longestPenalty[this.o] < -this.dt)) {
					
						for (t = 0; t < 2; t++) {
							if (penaltyNumber[t] > 0) {
							}
						}
					
					
					} else if ((longestPenalty[this.o] > -this.dt) && (longestPenalty[this.o] > -this.dt)) {
					
						for (t = 0; t < 2; t++) {
							if (penaltyNumber[t] > 0) {
							}
						}
					
					} else if ((longestPenalty[this.o] > -this.dt) && (longestPenalty[this.o] < -this.dt)) {
					
						for (t = 0; t < 2; t++) {
							if (penaltyNumber[t] > 0) {
							}
						}
					
					}



				
				} else {
				
					if ((longestPenalty[this.o] < -this.dt) && (longestPenalty[this.o] < -this.dt)) {
					
						for (t = 0; t < 2; t++) {
							if (penaltyNumber[t] > 0) {
							}
						}
					
					
					} else if ((longestPenalty[this.o] > -this.dt) && (longestPenalty[this.o] > -this.dt)) {
					
						for (t = 0; t < 2; t++) {
							if (penaltyNumber[t] > 0) {
							}
						}
					
					} else if ((longestPenalty[this.o] < -this.dt) && (longestPenalty[this.o] > -this.dt)) {
					
						for (t = 0; t < 2; t++) {
							if (penaltyNumber[t] > 0) {
							}
						}
					
					}
				
				
				
				
				}
			
			
			} else if ((longestPenalty[this.o]  < 0) && (longestPenalty[this.d] == 0) ) {
				t = this.o;
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
					p = this.playersOnCourt[t][pp];				    
					this.recordStat(t, p, "shmin",-longestPenalty[this.d]);
					this.recordStat(t, p, "emin",longestPenalty[this.d]+this.dt);
				}
				t = this.d;
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
					p = this.playersOnCourt[t][pp];				    
					this.recordStat(t, p, "ppmin",-longestPenalty[this.d]);
					this.recordStat(t, p, "emin",longestPenalty[this.d]+this.dt);
				}
				
			} else if ((longestPenalty[this.d]  < 0) && (longestPenalty[this.o] == 0) ) {


				t = this.d;
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
					p = this.playersOnCourt[t][pp];				    
					this.recordStat(t, p, "shmin",-longestPenalty[this.d]);
					this.recordStat(t, p, "emin",longestPenalty[this.d]+this.dt);
				}
				t = this.o;
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
					p = this.playersOnCourt[t][pp];				    
					this.recordStat(t, p, "ppmin",-longestPenalty[this.d]);
					this.recordStat(t, p, "emin",longestPenalty[this.d]+this.dt);
				}
			
			}  else if ((longestPenalty[this.o]  > 0) && (longestPenalty[this.d] > 0)) {
			
				for (t = 0; t < 2; t++) {
				// console.log("should be zero l: "+l+" penaltyNumber[t]: "+penaltyNumber[t]+" penaltyTime[t][l]: "+penaltyTime[t][l] +" penaltyPlayers[t][l]: "+penaltyPlayers[t][l] );
					for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
						p = this.playersOnCourt[t][pp];
				    
						this.recordStat(t, p, "emin",this.dt);
					}

				}
									
			}  else if ((longestPenalty[this.o]  > 0)  && (longestPenalty[this.d] == 0) ) {
			
				// console.log("should be zero l: "+l+" penaltyNumber[t]: "+penaltyNumber[t]+" penaltyTime[t][l]: "+penaltyTime[t][l] +" penaltyPlayers[t][l]: "+penaltyPlayers[t][l] );
				t = this.o;
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
					p = this.playersOnCourt[t][pp];				    
					this.recordStat(t, p, "shmin",this.dt);
				}
				t = this.d;
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
					p = this.playersOnCourt[t][pp];				    
					this.recordStat(t, p, "ppmin",this.dt);
				}
			}  else if ((longestPenalty[this.d]  > 0)  && (longestPenalty[this.o] == 0) ) {
			
				// console.log("should be zero l: "+l+" penaltyNumber[t]: "+penaltyNumber[t]+" penaltyTime[t][l]: "+penaltyTime[t][l] +" penaltyPlayers[t][l]: "+penaltyPlayers[t][l] );
				t = this.d;
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
					p = this.playersOnCourt[t][pp];				    
					this.recordStat(t, p, "shmin",this.dt);
				}
				t = this.o;
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
					p = this.playersOnCourt[t][pp];				    
					this.recordStat(t, p, "ppmin",this.dt);
				}
						
			}

			
			
			
			// track used minutes (defenese and offense)
			// track if no power play 
			
			// (limit clock if penalty play is removed?)
			// if small amount left quickly let that run out?
			
            // Clock
            this.t -= this.dt;
			
			for (t = 0; t < 2; t++) {
			    if (penaltyNumber[t] > 0) {
				}
			}

			
			
            if (this.t < 0) {
                this.t = 0;
            }

            // Possession change
            this.o = (this.o === 1) ? 0 : 1;
            this.d = (this.o === 1) ? 0 : 1;

            this.updateTeamCompositeRatings();

            outcome = this.simPossession();

			// if goal is scored one defense gets a player back if there was a penalty, set time for one player to this.dt
			var didOne;
			didOne = 0;
			for (t = 0; t < 2; t++) {
				for (l = 0; l < penaltyNumber[t]; l++) {
			//	 console.log("b l: "+l+" penaltyNumber[t]: "+penaltyNumber[t]+" penaltyTime[t][l]: "+penaltyTime[t][l] +" penaltyPlayers[t][l]: "+penaltyPlayers[t][l] );				  
				  if (t == this.d && outcome == "fg" && didOne == 0) {
//				  if (t == this.d && outcome == "fg") {
					penaltyTime[t][l] = -100;
					//break;
					 didOne += 1;
				  }
				}
			}
			
            // Swap o and d so that o will get another possession when they are swapped again at the beginning of the loop.
            if (outcome === "orb") {
                this.o = (this.o === 1) ? 0 : 1;
                this.d = (this.o === 1) ? 0 : 1;
            }

			// Hit 50% change of chance of change of possession
            if (outcome === "hits") {
				if (Math.random() < .5) {
					this.o = (this.o === 1) ? 0 : 1;
					this.d = (this.o === 1) ? 0 : 1;
				}
            }
			
            this.updatePlayingTime();

            this.injuries();

            if (i % this.subsEveryN === 0) {
                substitutions = this.updatePlayersOnCourt();
                if (substitutions) {
                    this.updateSynergy();
                }
            }

            i += 1;
			
			if (( this.overtimes>=1 ) && (outcome == "fg")) {
			  break;
			}
        }
    };

    /**
     * Perform appropriate substitutions.
     *
     * Can this be sped up?
     * 
     * @memberOf core.gameSim
     * @return {boolean} true if a substitution occurred, false otherwise.
     */
    GameSim.prototype.updatePlayersOnCourt = function () {
        var b, bb,bbb,i, ovrs, p, pp,l, substitutions, t;
		var playerPenalty;
		var oldPlayersOnCourt;
		var sumShifts;
		var startPlayer, endPlayer, goalies,skaters;
		var enduranceImpact, ovrImpact,defenseImpact;
		var backup,next;
		var replacementStart;
		var skaterRank;
		var goalieRank;
		var rank;
		
        substitutions = false;

		oldPlayersOnCourt = [-1,-1,-1,-1,-1,-1];
		sumShifts = [0,0,0,0];
		
		//console.log(this.team[t].player.length);
	//	console.log("GOTHERE"+this.t);
		//console.log(this.t);
		rank = [];
			
		for (t = 0; t < 2; t++) {
			// Overall values scaled by fatigue
			ovrs = [];
			

			skaterRank = [];
			goalieRank = [];			
			endPlayer = 0;
			goalies = 0;	
			skaters = 0;			
			for (p = 0; p < this.team[t].player.length; p++) {
			//	console.log(this.team[t].player[p].playing);
				if (this.team[t].player[p].rosterOrder != p) {
				//	console.log(p+" rosterOrder: "+this.team[t].player[p].rosterOrder+" pos: "+this.team[t].player[p].pos+" "+skaters+" "+goalies+" "+endPlayer);
				}

			  if ((this.team[t].player[p].pos == "LW" || this.team[t].player[p].pos == "LD" || this.team[t].player[p].pos == "RW" || this.team[t].player[p].pos == "RD" || this.team[t].player[p].pos == "C" ) && this.team[t].player[p].playing) {
				if (skaters < 18) {
					skaters += 1;
					endPlayer = p+1;
					skaterRank.push(p);
				//	console.log(skaterRank);
				}				
			  }
			  if ( (this.team[t].player[p].pos == "G" ) && this.team[t].player[p].playing) {
				if (goalies < 2) {
					goalies += 1;
					endPlayer = p+1;	
					goalieRank.push(p);					
				//	console.log(goalieRank);					
				}
			  }
			  
//			  if ((endPlayer > 17) && (goalies > 1)) {
			  if ((endPlayer > 17) && (goalies > 1)) {
				//if (this.t > 19) {
				//	console.log(endPlayer+" "+goalies+" "+p);
				//}
				//endPlayer = p+1;
				break;
			  } else if (p == this.team[t].player.length-1) {
				//if (this.t > 19) {
					//console.log(endPlayer+" "+goalies+" "+p);
				//}
				//endPlayer = p+1;
			  }
			}		
			rank.push(skaterRank);
		}
	//	console.log(rank);
	////	console.log(rank[0][0]);		
		/*if (skaters.length < 18) {
		  console.log(skaters);
			for (p = 0; p < this.team[t].player.length; p++) {	
				console.log(this.team[t].player[p].rosterOrder)
			}
		}*/
		
		if (this.t < 19) { // want best five to start game
				//console.log("GOTHERE2"+this.t);
			for (t = 0; t < 2; t++) {
				
				// Loop through players on court (in inverse order of current roster position)
				i = 0;
				
				//console.log(t+" "+this.playersOnCourt[t]);
				for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
				
					oldPlayersOnCourt[pp] = this.playersOnCourt[t][pp];
				}				
				
				sumShifts[0] = 0;
				for (pp = rank[t][0]; pp < rank[t][5]; pp++) {
				//	console.log(this.playersOnCourt[t].indexOf(pp));
					if (this.playersOnCourt[t].indexOf(pp) >= 0) {				
						sumShifts[0] += 1;
					}
				}				
				sumShifts[1] = 0;
				for (pp = rank[t][5]; pp < rank[t][10]; pp++) {
					if (this.playersOnCourt[t].indexOf(pp) >= 0) {				
						sumShifts[1] += 1;
					}
				}				
				sumShifts[2] = 0;
				for (pp = rank[t][10]; pp < rank[t][15]; pp++) {
					if (this.playersOnCourt[t].indexOf(pp) >= 0) {				
						sumShifts[2] += 1;
					}
				}				
				sumShifts[3] = 0;
				for (pp = rank[t][15]; pp < rank[t][18]; pp++) {
					if (this.playersOnCourt[t].indexOf(pp) >= 0) {				
						sumShifts[3] += 1;
					}
				}				
				
				enduranceImpact = 20; // 20 converts 0 to 1 number to 0 to .05
				ovrImpact = 2000 // 10000 converts 0 to 100 number to .01
				defenseImpact = .05;
				if (sumShifts[0] > 3) {
					// console.log(this.team[t].player[0].ovr);
					if ( (this.team[t].player[rank[t][0]].compositeRating.endurance/enduranceImpact + this.team[t].player[rank[t][0]].ovr/ovrImpact) > Math.random()) {					    
						this.playersOnCourt[t][0] = rank[t][0];
					} else {
						this.playersOnCourt[t][0] = rank[t][5];
					}
					if ( (this.team[t].player[rank[t][1]].compositeRating.endurance/enduranceImpact + this.team[t].player[rank[t][1]].ovr/ovrImpact) > Math.random()) {
						this.playersOnCourt[t][1] = rank[t][1];
					} else {
						this.playersOnCourt[t][1] = rank[t][6];
					}
					if ( (this.team[t].player[rank[t][2]].compositeRating.endurance/enduranceImpact + this.team[t].player[rank[t][2]].ovr/ovrImpact) > Math.random()) {
						this.playersOnCourt[t][2] = rank[t][2];
					} else {
						this.playersOnCourt[t][2] = rank[t][7];
					}
					if ( (this.team[t].player[rank[t][3]].compositeRating.endurance/enduranceImpact+defenseImpact + this.team[t].player[rank[t][3]].ovr/ovrImpact) > Math.random()) {
						this.playersOnCourt[t][3] = rank[t][3];
					} else {
						this.playersOnCourt[t][3] = rank[t][8];
					}
					if ( (this.team[t].player[rank[t][4]].compositeRating.endurance/enduranceImpact+defenseImpact + this.team[t].player[rank[t][4]].ovr/ovrImpact) > Math.random()) {
						this.playersOnCourt[t][4] = rank[t][4];
					} else {
						this.playersOnCourt[t][4] = rank[t][9];
					}				
				} else if (sumShifts[1] > 3) {
					if ( (this.team[t].player[rank[t][5]].compositeRating.endurance/enduranceImpact + this.team[t].player[rank[t][5]].ovr/ovrImpact) > Math.random()) {
						this.playersOnCourt[t][0] = rank[t][5];
					} else if (rank[t].length < 11) {																								
					} else {
						this.playersOnCourt[t][0] = rank[t][10];
					}
					if ((this.team[t].player[rank[t][6]].compositeRating.endurance/enduranceImpact + this.team[t].player[rank[t][6]].ovr/ovrImpact) > Math.random()) {
						this.playersOnCourt[t][1] = rank[t][6];
					} else if (rank[t].length < 12) {																		
					} else {
						this.playersOnCourt[t][1] = rank[t][11];
					}
					if (((this.team[t].player[rank[t][7]].compositeRating.endurance/enduranceImpact/2+ this.team[t].player[rank[t][7]].ovr/ovrImpact) > Math.random()) ||  rank[t].length < 12) {
						this.playersOnCourt[t][2] = rank[t][7];
					} else if (rank[t].length < 13) {												
					} else if ((1-this.team[t].player[rank[t][12]].compositeRating.endurance)/3 > Math.random() && rank[t].length > 15) {
						this.playersOnCourt[t][2] = rank[t][15];
					} else {
						this.playersOnCourt[t][2] = rank[t][12];
					}
					if (((this.team[t].player[rank[t][8]].compositeRating.endurance/enduranceImpact/2+defenseImpact+ this.team[t].player[rank[t][8]].ovr/ovrImpact) > Math.random()) ||  rank[t].length < 13) {
						this.playersOnCourt[t][3] = rank[t][8];
					} else if (rank[t].length < 14) {						
					} else if ((1-this.team[t].player[rank[t][13]].compositeRating.endurance)/3 > Math.random() && rank[t].length > 16) {
						this.playersOnCourt[t][3] = rank[t][16];
					} else {
						this.playersOnCourt[t][3] = rank[t][13];
					}
					if ( ((this.team[t].player[rank[t][9]].compositeRating.endurance/40+defenseImpact+ this.team[t].player[rank[t][9]].ovr/ovrImpact) > Math.random()) ||  rank[t].length < 14) {
						this.playersOnCourt[t][4] = rank[t][9];
					} else if (rank[t].length < 15) {
					} else if ((1-this.team[t].player[rank[t][14]].compositeRating.endurance)/3 > Math.random() && rank[t].length > 17) {
						this.playersOnCourt[t][4] = rank[t][17];
					} else {
						this.playersOnCourt[t][4] = rank[t][14];
					}								
								
//				} else if (sumShifts[2] > 3) {									
				} else  {									
					this.playersOnCourt[t][0] = rank[t][0];
					this.playersOnCourt[t][1] = rank[t][1];
					this.playersOnCourt[t][2] = rank[t][2];
					this.playersOnCourt[t][3] = rank[t][3];
					this.playersOnCourt[t][4] = rank[t][4];					
				} 
				substitutions = true;				

			}
		}
		
		replacementStart = 3;		
		if (Math.random() < .4) {
		  replacementStart = 3;
		} else if (Math.random() < .25) {
		  replacementStart = 4;
		} else if (Math.random() < .25) {
		  replacementStart = 0;
		} else if (Math.random() < .25) {
		  replacementStart = 1;
		} else {
		  replacementStart = 2;
//			replacementStart = random.randInt(5, 9); 
		}
		// Handle Injuries
		for (t = 0; t < 2; t++) {		
			for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
				p = this.playersOnCourt[t][pp];
				next = p+5;
				backup = next-(this.team[t].player.length-1);
				//console.log(t+" "+pp+" "+p+" "+backup+" "+endPlayer+" "+skaterRank+" "+skaterRank.length);	
				//console.log(p+" "+t+" "+this.team[t].player[p].injured+" "+this.team[t].player[p].pos +" "+this.team[t].player[p].playing );
				//if ( (this.team[t].player[p].injured) || (this.team[t].player[p].pos == "G") ||  (this.team[t].player[p].playing == false) ) {
				if ((this.team[t].player[p].injured) || ((this.team[t].player[p].pos == "G") &&  (this.team[t].player[p].playing == false)) ) {
								
				//	console.log(this.t+" "+pp+" "+t+" "+p+" "+this.team[t].player[p].injured+" "+endPlayer+" "+backup);
					if ( (next) < this.team[t].player.length) {
						//console.log(next+" "+endPlayer+" "+p+" "+backup);
						if ((this.playersOnCourt[t].indexOf(next) < 0) && (!this.team[t].player[next].injured) && (this.team[t].player[next].pos != "G") &&  (this.team[t].player[next].playing == true) ) {		
								//console.log(t+" "+this.playersOnCourt[t][pp] +" "+pp+" "+next);
								this.playersOnCourt[t][pp] = next;
								//console.log(t+" "+this.playersOnCourt[t][pp] +" "+pp+" "+next);
//								console.log(this.t+" "+t+" "+next+" "+this.team[t].player[next].injured+" "+endPlayer+" "+backup+" "+this.playersOnCourt[t][pp]+" "+p+" "+pp);
								
						} else {
//							for (b = 0; b < endPlayer; b++) {							
							for (b = replacementStart; b < this.team[t].player.length; b++) {
								if ((this.playersOnCourt[t].indexOf(b) < 0) && (!this.team[t].player[b].injured) && (this.team[t].player[b].pos != "G") &&  (this.team[t].player[b].playing == true) ) {		
									this.playersOnCourt[t][pp] = b;
								//	console.log(this.t+" "+t+" "+b+" "+this.team[t].player[b].injured+" "+endPlayer+" "+backup+" "+this.playersOnCourt[t][pp]+" "+p+" "+pp);
									
									break;
								}			
							}												
						}						
					} else {						
						if ((this.playersOnCourt[t].indexOf(backup) < 0) && (!this.team[t].player[backup].injured) && (this.team[t].player[backup].pos != "G") &&  (this.team[t].player[backup].playing == true) ) {		
								this.playersOnCourt[t][pp] = backup;
								//console.log(this.t+" "+t+" "+backup+" "+this.team[t].player[backup].injured+" "+endPlayer+" "+backup+" "+this.playersOnCourt[t][pp]+" "+p+" "+pp);
								
						} else {
//							for (b = 0; b < endPlayer; b++) {
							for (b = replacementStart; b < this.team[t].player.length; b++) {
								if ((this.playersOnCourt[t].indexOf(b) < 0) && (!this.team[t].player[b].injured) && (this.team[t].player[b].pos != "G") &&  (this.team[t].player[b].playing == true) ) {		
									this.playersOnCourt[t][pp] = b;
							//		console.log(this.t+" "+t+" "+b+" "+this.team[t].player[b].injured+" "+endPlayer+" "+backup+" "+this.playersOnCourt[t][pp]+" "+p+" "+pp);
									
									break;
								}			
							}						
						}					
						
					}
				}
			}		
		}
		// make sure skaters are 0-4 and goalies are 5
		for (t = 0; t < 2; t++) {		
			for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
				p = this.playersOnCourt[t][pp];
				if ((this.team[t].player[p].pos == "G") && (pp <5)) {
					for (b = replacementStart; b < this.team[t].player.length; b++) {
						if ((this.playersOnCourt[t].indexOf(b) < 0) && (!this.team[t].player[b].injured) && (this.team[t].player[b].pos != "G") &&  (this.team[t].player[b].playing == true) ) {	
							this.playersOnCourt[t][pp] = b;							
							break;
						}			
					}				
				}
				if ((this.team[t].player[p].pos != "G") && (pp == 5)) {
					for (b = replacementStart; b < this.team[t].player.length; b++) {
						if ((this.playersOnCourt[t].indexOf(b) < 0) && (!this.team[t].player[b].injured) && (this.team[t].player[b].pos == "G") &&  (this.team[t].player[b].playing == true)) {	
							this.playersOnCourt[t][pp] = b;							
							break;
						} else if (this.team[t].player[b].pos != "G") {
						} else if (this.team[t].player[b].injured) {
						//	console.log("GOALIE INJURED "+this.team[t].player[b].pos+" "+this.team[t].player[b].injured+" "+this.playersOnCourt[t].indexOf(b));
						} else if (this.team[t].player[b].playing == false) {
						//	console.log("GOALIE NOT PLAYING "+this.team[t].player[b].pos+" "+this.team[t].player[b].playing+" "+this.playersOnCourt[t].indexOf(b));
						}
						if (b == this.team[t].player.length-1) {
						//	console.log("NO GOOD PLAYABLE GOALIES "+this.team[t].player.length);
							for (bb = 0; bb < this.team[t].player.length; bb++) {							
								//console.log(this.team[t].player[b].pos);
								if ((this.playersOnCourt[t].indexOf(bb) < 0) && (!this.team[t].player[bb].injured) && (this.team[t].player[bb].pos == "G") &&  (this.team[t].player[bb].active == true)) {	
									this.playersOnCourt[t][pp] = bb;							
									break;								
								}
								if (bb == this.team[t].player.length-1) {
								//	console.log("NO GOOD ACTIVE "+this.team[t].player.length);
									for (bbb = 0; bbb < this.team[t].player.length; bbb++) {							
										//console.log(this.team[t].player[b].pos);
										if ((this.playersOnCourt[t].indexOf(bbb) < 0) && (!this.team[t].player[bbb].injured) && (this.team[t].player[bbb].pos == "G") ) {	
											this.playersOnCourt[t][pp] = bbb;							
											break;								
										}
										if (bbb == this.team[t].player.length-1) {
										//	console.log("NO GOOD MINOR "+this.team[t].player.length);
										}
										
									}
								}								
							}
						}
					}				
				}
				
			}
		}
		
		for (t = 0; t < 2; t++) {			
			for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {			
				p = this.playersOnCourt[t][pp];
				if (this.team[t].player[p].injured) {
				//	console.log(this.t+" "+pp+" "+t+" "+p+" "+this.team[t].player[p].injured+" "+endPlayer+" "+backup+" "+this.playersOnCourt[t][pp]+" "+p);
				}				
			}
		}
		
        // Record starters if that hasn't been done yet. This should run the first time this function is called, and never again.
        if (!this.startersRecorded) {
            for (t = 0; t < 2; t++) {
                for (p = 0; p < this.team[t].player.length; p++) {
					//console.log(this.t+" "+t+" "+p+" "+this.playersOnCourt[t].indexOf(p));
                    if (this.playersOnCourt[t].indexOf(p) >= 0) {
                        this.recordStat(t, p, "gs");
                    }
                }
            }
            this.startersRecorded = true;
        }

        return substitutions;
    };

    // x is value, a controls sharpness, b controls center
    GameSim.prototype.sigmoid = function (x, a, b) {
        return 1 / (1 + Math.exp(-(a * (x - b)))); 
    };

    /**
     * Update synergy.
     *
     * This should be called after this.updatePlayersOnCourt as it only produces different output when the players on the court change.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.updateSynergy = function () {
        var i, p, perimFactor, t, skillsCount;
		
        /*    Ss: "Slapshot",
            A: "Athlete",
//            B: "Ball Handler",
            Sh: "Stickhandler",
            Di: "Interior Defender",
            Dp: "Perimeter Defender",
            Ws: "Wristshot",
            Ps: "Passer",
            R: "Rebounder"		*/

        for (t = 0; t < 2; t++) {
            // Count all the *fractional* skills of the active players on a team (including duplicates)
            skillsCount = {
                Ss: 0,
                A: 0,
                Sh: 0,
                Di: 0,
                Dp: 0,
                Ws: 0,
                Ps: 0,
                R: 0
            };

            for (i = 0; i < 5; i++) {
                p = this.playersOnCourt[t][i];
				
				if (p == penaltyPlayers[t][0] || p == penaltyPlayers[t][1] || p == penaltyPlayers[t][2] || p == penaltyPlayers[t][3] || p == penaltyPlayers[t][4]) {
				} else {
					// 1 / (1 + e^-(15 * (x - 0.7))) from 0 to 1
					skillsCount.Ss += this.sigmoid(this.team[t].player[p].compositeRating.shootingThreePointer, 15, 0.7);
					skillsCount.A += this.sigmoid(this.team[t].player[p].compositeRating.athleticism, 15, 0.7);
					skillsCount.Sh += this.sigmoid(this.team[t].player[p].compositeRating.dribbling, 15, 0.7);
					skillsCount.Di += this.sigmoid(this.team[t].player[p].compositeRating.defenseInterior, 15, 0.7);
					skillsCount.Dp += this.sigmoid(this.team[t].player[p].compositeRating.defensePerimeter, 15, 0.7);
					skillsCount.Ws += this.sigmoid(this.team[t].player[p].compositeRating.shootingLowPost, 15, 0.7);
					skillsCount.Ps += this.sigmoid(this.team[t].player[p].compositeRating.passing, 15, 0.7);
					skillsCount.R += this.sigmoid(this.team[t].player[p].compositeRating.rebounding, 15, 0.7);
				}
            }
           for (i = 5; i < 6; i++) {
                p = this.playersOnCourt[t][i];

                // 1 / (1 + e^-(15 * (x - 0.7))) from 0 to 1
                skillsCount.Di += this.sigmoid(this.team[t].player[p].compositeRating.defenseInterior, 15, 0.7);
                skillsCount.Dp += this.sigmoid(this.team[t].player[p].compositeRating.defensePerimeter, 15, 0.7);
                skillsCount.R += this.sigmoid(this.team[t].player[p].compositeRating.rebounding, 15, 0.7);
            }			

            // Base offensive synergy
            this.team[t].synergy.off = 0;
            this.team[t].synergy.off += 5 * this.sigmoid(skillsCount.Ss, 3, 2); // 5 / (1 + e^-(3 * (x - 2))) from 0 to 5
            this.team[t].synergy.off += 3 * this.sigmoid(skillsCount.Sh, 15, 0.75) + this.sigmoid(skillsCount.Sh, 5, 1.75); // 3 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) from 0 to 5
            this.team[t].synergy.off += 3 * this.sigmoid(skillsCount.Ps, 15, 0.75) + this.sigmoid(skillsCount.Ps, 5, 1.75) + this.sigmoid(skillsCount.Ps, 5, 2.75); // 3 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) + 1 / (1 + e^-(5 * (x - 2.75))) from 0 to 5
            this.team[t].synergy.off += this.sigmoid(skillsCount.Ws, 15, 0.75); // 1 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
            this.team[t].synergy.off += this.sigmoid(skillsCount.A, 15, 1.75) + this.sigmoid(skillsCount.A, 5, 2.75); // 1 / (1 + e^-(15 * (x - 1.75))) + 1 / (1 + e^-(5 * (x - 2.75))) from 0 to 5
            this.team[t].synergy.off /= 17;

            // Punish teams for not having multiple perimeter skills
            perimFactor = helpers.bound(Math.sqrt(1 + skillsCount.Sh + skillsCount.Ps + skillsCount.Ss) - 1, 0, 2) / 2; // Between 0 and 1, representing the perimeter skills
            this.team[t].synergy.off *= 0.5 + 0.5 * perimFactor;

            // Defensive synergy
            this.team[t].synergy.def = 0;
            this.team[t].synergy.def += this.sigmoid(skillsCount.Dp, 15, 0.75); // 1 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
            this.team[t].synergy.def += 2 * this.sigmoid(skillsCount.Di, 15, 0.75); // 2 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
            this.team[t].synergy.def += this.sigmoid(skillsCount.A, 5, 2) + this.sigmoid(skillsCount.A, 5, 3.25); // 1 / (1 + e^-(5 * (x - 2))) + 1 / (1 + e^-(5 * (x - 3.25))) from 0 to 5
            this.team[t].synergy.def /= 6;

            // Rebounding synergy
            this.team[t].synergy.reb = 0;
            this.team[t].synergy.reb += this.sigmoid(skillsCount.R, 15, 0.75) + this.sigmoid(skillsCount.R, 5, 1.75); // 1 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) from 0 to 5
            this.team[t].synergy.reb /= 4;
        }
    };

    /**
     * Update team composite ratings.
     *
     * This should be called once every possession, after this.updatePlayersOnCourt and this.updateSynergy as they influence output, to update the team composite ratings based on the players currently on the court.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.updateTeamCompositeRatings = function () {
        var i, j, p, rating, t, toUpdate;

        // Only update ones that are actually used
        toUpdate = ["dribbling", "passing", "rebounding", "defense", "defensePerimeter", "blocking"];

        for (t = 0; t < 2; t++) {
            for (j = 0; j < toUpdate.length; j++) {
                rating = toUpdate[j];
                this.team[t].compositeRating[rating] = 0;

                for (i = 0; i < 6; i++) {
                    p = this.playersOnCourt[t][i];
//                    this.team[t].compositeRating[rating] += this.team[t].player[p].compositeRating[rating] * this.fatigue(this.team[t].player[p].stat.energy);
                    this.team[t].compositeRating[rating] += this.team[t].player[p].compositeRating[rating] ;
                }

                this.team[t].compositeRating[rating] = this.team[t].compositeRating[rating] / 6;
            }

            this.team[t].compositeRating.dribbling += this.synergyFactor * this.team[t].synergy.off;
            this.team[t].compositeRating.passing += this.synergyFactor * this.team[t].synergy.off;
            this.team[t].compositeRating.rebounding += this.synergyFactor * this.team[t].synergy.reb;
            this.team[t].compositeRating.defense += this.synergyFactor * this.team[t].synergy.def;
            this.team[t].compositeRating.defensePerimeter += this.synergyFactor * this.team[t].synergy.def;
            this.team[t].compositeRating.blocking += this.synergyFactor * this.team[t].synergy.def;
        }
    };

    /**
     * Update playing time stats.
     *
     * This should be called once every possession, at the end, to record playing time and bench time for players.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.updatePlayingTime = function () {
        var p, t;

        for (t = 0; t < 2; t++) {
            // Update minutes (overall, court, and bench)
            for (p = 0; p < this.team[t].player.length; p++) {
                if (this.playersOnCourt[t].indexOf(p) >= 0) {
                    this.recordStat(t, p, "min", this.dt);
                    this.recordStat(t, p, "courtTime", this.dt);
                    // This used to be 0.04. Increase more to lower PT
//                    this.recordStat(t, p, "energy", -this.dt * .06 * (1 - this.team[t].player[p].compositeRating.endurance));
//                    this.recordStat(t, p, "energy", -this.dt * .18 * (1 - this.team[t].player[p].compositeRating.endurance));
//                    this.recordStat(t, p, "energy", -this.dt * (.06 * (1 - this.team[t].player[p].compositeRating.endurance) + .12 ));
//console.log(this.team[t].player[p].compositeRating.endurance);
//                    this.recordStat(t, p, "energy", -this.dt * (.01 * (1 - this.team[t].player[p].compositeRating.endurance) + .10 ));
                    /////this.recordStat(t, p, "energy", -this.dt );
					 this.recordStat(t, p, "energy", -this.dt * 0.06 * (1 - this.team[t].player[p].compositeRating.endurance));
                    if (this.team[t].player[p].stat.energy < 0) {
                        this.team[t].player[p].stat.energy = 0;
                    }
                } else {
                    this.recordStat(t, p, "benchTime", this.dt);
//                    this.recordStat(t, p, "energy", this.dt * .1);
//                    this.recordStat(t, p, "energy", this.dt * .150);
//                    this.recordStat(t, p, "energy", this.dt * .06);
                    //this.recordStat(t, p, "energy", this.dt * .05);
					this.recordStat(t, p, "energy", this.dt * 0.1);
                    if (this.team[t].player[p].stat.energy > 1) {
                        this.team[t].player[p].stat.energy = 1;
                    }
                }
            }
        }
    };

    /**
     * See if any injuries occurred this possession, and handle the consequences.
     *
     * This doesn't actually compute the type of injury, it just determines if a player is injured bad enough to miss the rest of the game.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.injuries = function () {
        var newInjury, p, t;

        newInjury = false;

        for (t = 0; t < 2; t++) {
            for (p = 0; p < this.team[t].player.length; p++) {
                // Only players on the court can be injured
                if (this.playersOnCourt[t].indexOf(p) >= 0) {
                    // According to data/injuries.ods, 0.25 injuries occur every game. Divided over 10 players and ~200 possessions, that means each player on the court has P = 0.25 / 10 / 200 = 0.000125 probability of being injured this play.
                    if (Math.random() < 0.000125) {
                        this.team[t].player[p].injured = true;
                        newInjury = true;
                        this.recordPlay("injury", t, [this.team[t].player[p].name]);
                    }
                }
            }
        }

        // Sub out injured player
        if (newInjury) {
            this.updatePlayersOnCourt();
        }
    };

    /**
     * Simulate a single possession.
     * 
     * @memberOf core.gameSim
     * @return {string} Outcome of the possession, such as "tov", "drb", "orb", "fg", etc.
     */
    GameSim.prototype.simPossession = function () {
        var ratios,ratiosdefense, shooter;

		//// penalty
		//// takeway
		//// giveaway
		//// shot
		//// miss
		
		
        // Turnover? (both Giveaway and Takeaway)
		//console.log(this.probTov());
        if (this.probTov() > Math.random()) {
            return this.doTov();  // tov
        }
			
        if (.08 > Math.random()) {
            return this.doPenalty();  // pen
        }
		
        if (.08 > Math.random()) {
            return this.doFaceOff();  // faceoff
        }
		
		
        // Shot if there is no turnover
//        ratios = this.ratingArray("usage", this.o,4);
        //ratios = this.ratingArray("shootingMidRange", this.o,1);
		
//        //ratios = this.ratingArrayRelative("shootingMidRange","defense", this.o,this.d,.5);
//        ratios = this.ratingArray("shootingMidRange", this.o,.20);
        ratios = this.ratingArray("shootingMidRange", this.o,2.0); //1.5
        shooter = this.pickPlayer(ratios);
	//	console.log(ratios+" "+shooter);
        return this.doShot(shooter);  // fg, orb, or drb
    };

    /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probTov = function () {
		//console.log("turnover: "+ (0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing))) );
//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
//        return 0.50 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
//        return 0.50 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
//        return 0.4 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));

		//console.log(0.4 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing)));
        return 0.415*(1-this.ratingsWeight)+this.ratingsWeight*(0.4 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing)));
    };

    /**
     * Turnover.
     * 
     * @memberOf core.gameSim
     * @return {string} Either "tov" or "stl" depending on whether the turnover was caused by a steal or not.
     */
    GameSim.prototype.doTov = function () {
        var p, ratios;

        ratios = this.ratingArray("turnovers", this.o, 0.5);
        p = this.playersOnCourt[this.o][this.pickPlayer(ratios)];
//console.log(this.probHit());		
		if (this.probHit() > Math.random()) {
//        } else if (this.probHit() > 0) {

            return this.doHit(p);  // "hits"		
        } else if (this.probStl() > Math.random()) {
            return this.doStl(p);  // "stl"        
        } else {
			this.recordStat(this.o, p, "tov");
            this.recordPlay("tov", this.o, [this.team[this.o].player[p].name]);
        }

        return "tov";
    };

    /**
     * Probability that a turnover occurring in this possession is a steal.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probStl = function () {
//        return 0.75 * this.team[this.d].compositeRating.defensePerimeter / (0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));


        return 0.75*(1-this.ratingsWeight)+this.ratingsWeight*(0.75 * this.team[this.d].compositeRating.defensePerimeter / (0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing)));
    };

    /**
     * Steal.
     * 
     * @memberOf core.gameSim
     * @return {string} Currently always returns "stl".
     */
    GameSim.prototype.doStl = function (pStoleFrom) {
        var p, ratios;

        ratios = this.ratingArray("stealing", this.d);
        p = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
        this.recordStat(this.d, p, "stl");
        this.recordPlay("stl", this.d, [this.team[this.d].player[p].name, this.team[this.o].player[pStoleFrom].name]);

        return "stl";
    };
  
    /**
     * Probability that a turnover occurring in this possession is a steal.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probHit = function () {
	   //console.log("hit: "+(.75 * this.team[this.d].compositeRating.defensePerimeter / (0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing))));
//        return .75 * this.team[this.d].compositeRating.defensePerimeter / (0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));

		
        return .72*(1-this.ratingsWeight)+this.ratingsWeight*(.75 * this.team[this.d].compositeRating.defensePerimeter / (0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing)));
    };

    /**
     * Steal.
     * 
     * @memberOf core.gameSim
     * @return {string} Currently always returns "stl".
     */
    GameSim.prototype.doHit = function (pStoleFrom) {
        var p, ratios;

        ratios = this.ratingArray("blocking", this.d);
        p = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
        this.recordStat(this.d, p, "hits");
        this.recordPlay("hit", this.d, [this.team[this.d].player[p].name, this.team[this.o].player[pStoleFrom].name]);

        return "hits";
    };
  	
	
    /**
     * Shot.
     * 
     * @memberOf core.gameSim
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @return {string} Either "fg" or output of this.doReb, depending on make or miss and free throws.
     */
    GameSim.prototype.doShot = function (shooter) {
        var fatigue, p,g, passer, passer2, probMake, probAndOne, probMissAndFoul, r1, r2, r3, ratios, type;
		var assistRatio;
		var weight;
		var shortHanded,powerPlay;

		shortHanded = 0;
		powerPlay = 0;
		
        p = this.playersOnCourt[this.o][shooter];
        g = this.playersOnCourt[this.d][5];

        fatigue = this.fatigue(this.team[this.o].player[p].stat.energy);

        // Is this an "assisted" attempt (i.e. an assist will be recorded if it's made)
        passer = -1;
        passer2 = -1;
//		assistRatio = 5;
//		assistRatio = 2.5;
//		assistRatio = 2.5;
		assistRatio = 2;
		//assistRatio = 1.5;		
        if (this.probAst() > Math.random()) {
            ratios = this.ratingArray("passing", this.o,assistRatio );
            passer = this.pickPlayer(ratios, shooter);
        }
        if (this.probAst() > Math.random()) {
            ratios = this.ratingArray("passing", this.o,assistRatio );
            passer2 = this.pickPlayer(ratios, shooter);
			if (passer == passer2) {
				passer2 = this.pickPlayer(ratios, shooter);
				if (passer == passer2) {
					
					if (Math.random()<.5 ) {
							passer2 = -1;
					} else {
						passer2 = this.pickPlayer(ratios, shooter);
						if (passer == passer2) {
							passer2 = -1;
						} 
					}
				/*	passer2 = this.pickPlayer(ratios, shooter);
					if (passer == passer2) {
						passer2 = this.pickPlayer(ratios, shooter);
						if (passer == passer2) {**/
					/*	}
					}*/
				}
			}
        }

		var skillRatio, goalieRatio, goalieDefenseRatio;
		skillRatio = 3.0;
		goalieDefenseRatio = .5; // between 0-1, 1 all goalie, 0 all defense
//		goalieRatio = 1.50;		
		if (this.team[this.d].player[g].pos == "G") {
		//	goalieRatio = 1.00+Math.random();	
	//		goalieRatio = 1.00+this.team[this.d].compositeRating.defense; 			
//
			goalieRatio = 1.50;					
//			goalieRatio = 1.00;					
			//goalieRatio = .15;			
		} else {
			console.log(this.team[this.d].player[g].pos);
			goalieRatio = -1.5;					
		}
        // Pick the type of shot and store the success rate (with no defense) in probMake and the probability of an and one in probAndOne
        if (this.team[this.o].player[p].compositeRating.shootingThreePointer > 0.4 && Math.random() < (0.35 * this.team[this.o].player[p].compositeRating.shootingThreePointer)) {
            // Three pointer
            type = "threePointer";
//            probMissAndFoul = 0.02;
            probMissAndFoul = 0.00;
//            probMake = this.team[this.o].player[p].compositeRating.shootingThreePointer * 0.5 + 0.1;
            probMake = this.team[this.o].player[p].compositeRating.shootingThreePointer * 0.5*skillRatio + 0.1+ 0.20-(this.team[this.d].player[g].compositeRating.blocking*(goalieDefenseRatio)+this.team[this.d].compositeRating.defense*(1-goalieDefenseRatio))*.2*skillRatio*goalieRatio;
//            probAndOne = 0.01;
            probAndOne = 0.00;
        } else {
            r1 = Math.random() * this.team[this.o].player[p].compositeRating.shootingMidRange-Math.random() * (this.team[this.d].player[g].compositeRating.blocking+this.team[this.d].player[g].compositeRating.defenseInterior)/2;
            r2 = Math.random() * (this.team[this.o].player[p].compositeRating.shootingAtRim-Math.random() * (this.team[this.d].player[g].compositeRating.blocking+this.team[this.d].player[g].compositeRating.defenseInterior)/2 + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def));  // Synergy makes easy shots either more likely or less likely
            r3 = Math.random() * (this.team[this.o].player[p].compositeRating.shootingLowPost-Math.random() * (this.team[this.d].player[g].compositeRating.blocking+this.team[this.d].player[g].compositeRating.defenseInterior)/2 + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def));  // Synergy makes easy shots either more likely or less likely
            if (r1 > r2 && r1 > r3) {
                // Two point jumper
                type = "midRange";
//                probMissAndFoul = 0.07;
                probMissAndFoul = 0.00;
                probMake = this.team[this.o].player[p].compositeRating.shootingMidRange * 0.3*skillRatio + 0.29-((this.team[this.d].player[g].compositeRating.blocking+this.team[this.d].player[g].compositeRating.defenseInterior)*(goalieDefenseRatio)+this.team[this.d].compositeRating.defense*2*(1-goalieDefenseRatio))*.1*skillRatio*goalieRatio;
//                probAndOne = 0.05;
                probAndOne = 0.00;
            } else if (r2 > r3) {
                // Dunk, fast break or half court
                type = "atRim";
//                probMissAndFoul = 0.37;
                probMissAndFoul = 0.0;
//                probMake = this.team[this.o].player[p].compositeRating.shootingAtRim * 0.3*skillRatio + 0.52-this.team[this.d].player[g].compositeRating.blocking*.1*skillRatio*goalieRatio-this.team[this.d].player[g].compositeRating.defenseInterior*.1*skillRatio*goalieRatio;
                probMake = this.team[this.o].player[p].compositeRating.shootingAtRim * 0.3*skillRatio + 0.52-((this.team[this.d].player[g].compositeRating.blocking+this.team[this.d].player[g].compositeRating.defenseInterior)*(goalieDefenseRatio)+this.team[this.d].compositeRating.defense*2*(1-goalieDefenseRatio))*.1*skillRatio*goalieRatio;
				
//                probAndOne = 0.25;
                probAndOne = 0.0;
            } else {
                // Post up
                type = "lowPost";
//                probMissAndFoul = 0.33;
                probMissAndFoul = 0.00;
                probMake = this.team[this.o].player[p].compositeRating.shootingLowPost * 0.3*skillRatio + 0.37-this.team[this.d].player[g].compositeRating.blocking*.1*skillRatio*goalieRatio-this.team[this.d].player[g].compositeRating.defenseInterior*.1*skillRatio*goalieRatio;
//                probMake = this.team[this.o].player[p].compositeRating.shootingLowPost * 0.3*skillRatio + 0.37-((this.team[this.d].player[g].compositeRating.blocking+this.team[this.d].player[g].compositeRating.defenseInterior)*(goalieDefenseRatio)+this.team[this.d].compositeRating.defense*2*(1-goalieDefenseRatio))*.1*skillRatio*goalieRatio;
    //            probMake = this.team[this.o].player[p].compositeRating.shootingAtRim * 0.3*skillRatio + 0.52-((this.team[this.d].player[g].compositeRating.blocking+this.team[this.d].player[g].compositeRating.defenseInterior)*(goalieDefenseRatio)+this.team[this.d].compositeRating.defense*2*(1-goalieDefenseRatio))*.1*skillRatio*goalieRatio;
				
//                probAndOne = 0.15;
                probAndOne = 0.0;
            }
        }

//        probMake = (probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) * fatigue;
//        probMake = (probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def))/5 * fatigue;
//        probMake = (probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) * fatigue;
//        probMake = this.team[this.o].player[p].compositeRating.shootingMidRange/10-.05+(probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) ;
//        probMake = this.team[this.o].player[p].ovr/5/100-.10+(probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) ;
		//console.log("goalie: "+this.team[this.d].player[g].compositeRating.defenseInterior);
		
//        probMake = (probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) ;
//        probMake = (probMake - 0.40 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) ;
        probMake = (probMake -.07 - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) ;
      //  probMake = (probMake - 0.25 * (this.team[this.d].compositeRating.defense*.5+this.team[this.d].player[g].compositeRating.defenseInterior*.5) + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) ;
		//console.log("curent prob: "+probMake);
		
	//	var goalieImpact;
	//	goalieImpact = 0.5;
	//	goalieImpact = 0.25;		
		
	//	probMake += goalieImpact*(.80-this.team[this.d].player[g].compositeRating.defenseInterior)
		
//        probMake = (probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) ;
		/*if (this.team[this.o].player[p].pos == "LD" || this.team[this.o].player[p].pos == "RD") {
		   probMake /= 2;
		}*/
		//console.log(probMake);
		//console.log(probMake);
		probMake *= .1; // normalize with .0385
		
		probMake *= this.ratingsWeight; // 
		
		//probMake /= 5;
		//probMake /= 1.6;
	//	console.log(probMake);
	
	// makes teams closer together in scoring ability
		//probMake *= .60;		
		//probMake += .035*.60;		
		// .0415 team average is in the 2.65 area, but too much range
		//
		probMake += .0385*(1-this.ratingsWeight);		// if all same how much variability?
		//console.log("final prob: "+probMake);
		
        // Assisted shots are easier
		if (passer >= 0) {
            probMake *= 2;		
		}
		if (passer2 >= 0) {
            probMake *= 2;		
		}
		//console.log(this.probBlk());
//        if (this.probBlk()*10 > Math.random()) {
        if (this.probBlk() > Math.random()) {
            return this.doBlk(shooter, type);  // orb or drb
        }

    /*    if ((1-probMake)*.6 < Math.random()) {
            return this.doMiss(shooter, type);  // orb or drb
        }*/
		
		
        // Make
		//console.log(probMake);
//        if (probMake*1.5 > Math.random()) {  //// save vs make
        if (probMake > Math.random()) {  //// save vs make
            // And 1
      //      if (probAndOne > Math.random()) {
      //          return this.doFg(shooter, passer, type, true);  // fg, orb, or drb
      //      }
            return this.doFg(shooter, passer, passer2, type);  // fg
        } else {
		
			//this.recordStat(this.d, g, "sfgs");
		}

        // Miss, but fouled
     /*   if (probMissAndFoul > Math.random()) {
            if (type === "threePointer") {
                return this.doFt(shooter, 1);  // fg, orb, or drb
            }
            return this.doFt(shooter, 1);  // fg, orb, or drb
        }*/

        // Miss
        p = this.playersOnCourt[this.o][shooter];
		g = this.playersOnCourt[this.d][5];
		
		shortHanded = this.shortOrPower(this.o);
		powerPlay = this.shortOrPower(this.d);
		if ( (shortHanded - powerPlay) > 0) {
			this.recordStat(this.o, p, "sh");		
		} else if ( (shortHanded - powerPlay) < 0) {
			this.recordStat(this.o, p, "pp");		
		}
		
        this.recordStat(this.o, p, "fga");
        this.recordStat(this.o, p, "mfg");
		
        this.recordStat(this.d, g, "sfga");
        this.recordStat(this.d, g, "sfgs");		
        if (type === "atRim") {
            this.recordStat(this.o, p, "fgaAtRim");
            this.recordStat(this.d, g, "sfgaAtRim");
            this.recordPlay("missAtRim", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
            this.recordStat(this.o, p, "fgaLowPost");
            this.recordStat(this.d, g, "sfgaLowPost");
            this.recordPlay("missLowPost", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
            this.recordStat(this.o, p, "fgaMidRange");
            this.recordStat(this.d, g, "sfgaMidRange");
            this.recordPlay("missMidRange", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
            this.recordStat(this.o, p, "tpa");
            this.recordStat(this.d, g, "stpa");
            this.recordPlay("missTp", this.o, [this.team[this.o].player[p].name]);
        }
        return this.doReb();  // orb or drb
    };

	
	
   

    /**
     * Blocked shot.
     * 
     * @memberOf core.gameSim
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @return {string} Output of this.doReb.
     */
    GameSim.prototype.doMiss = function (shooter, type) {
        var p,g, p2, ratios;
		var shortHanded, powerPlay;
		

        p = this.playersOnCourt[this.o][shooter];
        g = this.playersOnCourt[this.d][5];
		shortHanded = 0;
		powerPlay = 0;
		
		
		shortHanded = this.shortOrPower(this.o);
		powerPlay = this.shortOrPower(this.d);
		if ( (shortHanded - powerPlay) > 0) {
			this.recordStat(this.o, p, "sh");		
		} else if ( (shortHanded - powerPlay) < 0) {
			this.recordStat(this.o, p, "pp");		
		}
				
		
        this.recordStat(this.o, p, "fga");
        this.recordStat(this.o, p, "mfg");
        this.recordStat(this.d, g, "sfga");		
        this.recordStat(this.d, g, "sfgs");				
        if (type === "atRim") {
            this.recordStat(this.o, p, "fgaAtRim");	
      //      this.recordStat(this.o, p, "mfgaAtRim");	
            this.recordPlay("fgaAtRim", this.o, [this.team[this.o].player[p].name]);
			
        } else if (type === "lowPost") {
            this.recordStat(this.o, p, "fgaLowPost");
         //   this.recordStat(this.o, p, "mfgaLowPost");
            this.recordPlay("fgaLowPost", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
            this.recordStat(this.o, p, "fgaMidRange");
          //  this.recordStat(this.o, p, "mfgaMidRange");
            this.recordPlay("fgaAtRim", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "fgaMidRange") {
            this.recordStat(this.o, p, "tpa");
          //  this.recordStat(this.o, p, "mtpa");
            this.recordPlay("tpa", this.o, [this.team[this.o].player[p].name]);
        }

   //     p2 = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
   //     this.recordStat(this.d, p2, "blk");



        return this.doReb();  // orb or drb
    };
	
	
	
	
	
	
    /**
     * Probability that a shot taken this possession is blocked.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probBlk = function () {
//        return 0.1 * this.team[this.d].compositeRating.blocking;
//        return 0.40;
		//console.log(0.1 * this.team[this.d].compositeRating.blocking);
		var weight;
		
		weight = .02;
        return 0.40*(1-weight)+weight*0.8* this.team[this.d].compositeRating.blocking;
    };

    /**
     * Blocked shot.
     * 
     * @memberOf core.gameSim
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @return {string} Output of this.doReb.
     */
    GameSim.prototype.doBlk = function (shooter, type) {
        var p, p2, ratios;

        p = this.playersOnCourt[this.o][shooter];
		
		
        //this.recordStat(this.o, p, "fga");
        this.recordStat(this.o, p, "fgs");
        if (type === "atRim") {
            this.recordStat(this.o, p, "fgaAtRim");
        } else if (type === "lowPost") {
            this.recordStat(this.o, p, "fgaLowPost");
        } else if (type === "midRange") {
            this.recordStat(this.o, p, "fgaMidRange");
        } else if (type === "threePointer") {
            this.recordStat(this.o, p, "tpa");
        }

        ratios = this.ratingArray("blocking", this.d, 4);
        p2 = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
        this.recordStat(this.d, p2, "blk");


        if (type === "atRim") {
            this.recordPlay("blkAtRim", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
            this.recordPlay("blkLowPost", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
            this.recordPlay("blkMidRange", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
            this.recordPlay("blkTp", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        }

        return this.doReb();  // orb or drb
    };

   /**
     * Blocked shot.
     * 
     * @memberOf core.gameSim
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @return {string} Output of this.doReb.
     */
    GameSim.prototype.doPenalty = function (shooter) {
        var p, p2, ratios;

        ratios = this.ratingArray("fouling", this.o, 4);
        p = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
//        p = this.playersOnCourt[this.o][shooter];
     //   this.recordStat(this.o, p, "fga");
     //   this.recordStat(this.o, p, "fgs");
     /*   if (type === "atRim") {
            this.recordStat(this.o, p, "fgaAtRim");
        } else if (type === "lowPost") {
            this.recordStat(this.o, p, "fgaLowPost");
        } else if (type === "midRange") {
            this.recordStat(this.o, p, "fgaMidRange");
        } else if (type === "threePointer") {
            this.recordStat(this.o, p, "tpa");
        }*/

        ratios = this.ratingArray("fouling", this.d, 4);
        p2 = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
        this.recordStat(this.d, p2, "pf");

			/*console.log(p2+" "+p);
			console.log(this.team[this.d].player.length+" "+this.team[this.o].player.length);
			console.log(this.playersOnCourt);
			console.log(this.team[this.d].player[p2].name+" "+this.team[this.o].player[p].name);*/
            this.recordPlay("pf", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);

		if 	(penaltyPlayers[this.d][0] == 100) {
			penaltyPlayers[this.d][0] = p2;
			penaltyTime[this.d][0] = 2;
			penaltyNumber[this.d] = 1;
		} else if 	(penaltyPlayers[this.d][1] == 100) {
			penaltyPlayers[this.d][1] = p2;
			penaltyTime[this.d][1] = 2;
			penaltyNumber[this.d] = 2;
		} else if 	(penaltyPlayers[this.d][2] == 100) {
			penaltyPlayers[this.d][2] = p2;
			penaltyTime[this.d][2] = 2;
			penaltyNumber[this.d] = 3;
		} else if 	(penaltyPlayers[this.d][3] == 100) {
			penaltyPlayers[this.d][3] = p2;
			penaltyTime[this.d][3] = 2;
			penaltyNumber[this.d] = 4;
		} else if 	(penaltyPlayers[this.d][4] == 100) {
			penaltyPlayers[this.d][4] = p2;
			penaltyTime[this.d][4] = 2;
			penaltyNumber[this.d] = 5;
		} 
		
			
/*        if (type === "atRim") {
            this.recordPlay("blkAtRim", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
            this.recordPlay("blkLowPost", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
            this.recordPlay("blkMidRange", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
            this.recordPlay("blkTp", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        }*/
        this.updateSynergy();
		
		
        return this.doFaceOff();  // orb or drb
    };	
	
	
    /**
     * Field goal.
     *
     * Simulate a successful made field goal.
     * 
     * @memberOf core.gameSim
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the passing player, who will get an assist. -1 if no assist.
     * @param {number} type 2 for a two pointer, 3 for a three pointer.
     * @return {string} fg, orb, or drb (latter two are for and ones)
     */
    GameSim.prototype.doFg = function (shooter, passer, passer2, type, andOne) {
        var p,g,i,shortHanded,powerPlay;

		shortHanded = 0;
		powerPlay = 0;
		
        p = this.playersOnCourt[this.o][shooter];
        g = this.playersOnCourt[this.d][5];
        this.recordStat(this.o, p, "fga");
        this.recordStat(this.o, p, "fg");


		
		// if shorthand
		shortHanded = this.shortOrPower(this.o);
		powerPlay = this.shortOrPower(this.d);
		if ( (shortHanded - powerPlay) > 0) {
			this.recordStat(this.o, p, "shg");		
			this.recordStat(this.o, p, "sh");		
		} else if ( (shortHanded - powerPlay) < 0) {
			this.recordStat(this.o, p, "ppg");		
			this.recordStat(this.o, p, "pp");		
		}
		// if powerplay
		
        this.recordStat(this.d, g, "sfga");
        this.recordStat(this.d, g, "sfg");
		
        this.recordStat(this.o, this.playersOnCourt[this.o][0], "plusminus",1);
        this.recordStat(this.d, this.playersOnCourt[this.d][0], "plusminus",-1);
        this.recordStat(this.o, this.playersOnCourt[this.o][1], "plusminus",1);
        this.recordStat(this.d, this.playersOnCourt[this.d][1], "plusminus",-1);
        this.recordStat(this.o, this.playersOnCourt[this.o][2], "plusminus",1);
        this.recordStat(this.d, this.playersOnCourt[this.d][2], "plusminus",-1);
        this.recordStat(this.o, this.playersOnCourt[this.o][3], "plusminus",1);
        this.recordStat(this.d, this.playersOnCourt[this.d][3], "plusminus",-1);
        this.recordStat(this.o, this.playersOnCourt[this.o][4], "plusminus",1);
        this.recordStat(this.d, this.playersOnCourt[this.d][4], "plusminus",-1);
        this.recordStat(this.o, this.playersOnCourt[this.o][5], "plusminus",1);
        this.recordStat(this.d, this.playersOnCourt[this.d][5], "plusminus",-1);

		
        this.recordStat(this.o, p, "pts", 1);  // 2 points for 2's
        if (type === "atRim") {
            this.recordStat(this.o, p, "fgaAtRim");
            this.recordStat(this.o, p, "fgAtRim");
        this.recordStat(this.d, g, "sfgaAtRim");
        this.recordStat(this.d, g, "sfgAtRim");
            this.recordPlay("fgAtRim" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
            this.recordStat(this.o, p, "fgaLowPost");
            this.recordStat(this.o, p, "fgLowPost");
            this.recordStat(this.d, g, "sfgaLowPost");
            this.recordStat(this.d, g, "sfgLowPost");
            this.recordPlay("fgLowPost" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
            this.recordStat(this.o, p, "fgaMidRange");
            this.recordStat(this.o, p, "fgMidRange");
            this.recordStat(this.d, g, "sfgaMidRange");
            this.recordStat(this.d, g, "sfgMidRange");
            this.recordPlay("fgMidRange" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
         //   this.recordStat(this.o, p, "pts");  // Extra point for 3's
            this.recordStat(this.o, p, "tpa");
            this.recordStat(this.o, p, "tp");
            this.recordStat(this.d, g, "stpa");
            this.recordStat(this.d, g, "stp");
            this.recordPlay("tp" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        }

        if (passer >= 0) {
            p = this.playersOnCourt[this.o][passer];
            this.recordStat(this.o, p, "ast");
            this.recordPlay("ast", this.o, [this.team[this.o].player[p].name]);
        }
        if (passer2 >= 0) {
            p = this.playersOnCourt[this.o][passer2];
            this.recordStat(this.o, p, "ast");
            this.recordPlay("ast", this.o, [this.team[this.o].player[p].name]);
        }
       /* if (andOne) {
            return this.doFt(shooter, 1);  // fg, orb, or drb
        }*/
        return "fg";
    };

    /**
     * Probability that a shot taken this possession is assisted.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probAst = function () {
		//console.log("Ast: "+(0.6 * (2 + this.team[this.o].compositeRating.passing) / (2 + this.team[this.d].compositeRating.defense)));
//        return 0.6 * (2 + this.team[this.o].compositeRating.passing) / (2 + this.team[this.d].compositeRating.defense);
		// 0.6 seems like a good average for goals, but assists too low
		// 0.7 seems like a good ratio, but goals now too hight
		var weight;
		weight = .02;
		
        return 0.7*(1-weight)+weight*(0.6 * (2 + this.team[this.o].compositeRating.passing) / (2 + this.team[this.d].compositeRating.defense));
      //  return (0.6 * (2 + this.team[this.o].compositeRating.passing) / (2 + this.team[this.d].compositeRating.defense))*.5+.3;
    };

    /**
     * Free throw.
     * 
     * @memberOf core.gameSim
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @param {number} amount Integer representing the number of free throws to shoot
     * @return {string} "fg" if the last free throw is made; otherwise, this.doReb is called and its output is returned.
     */
    GameSim.prototype.doFt = function (shooter, amount) {
        var i, outcome, p;

        this.doPf(this.d);
        p = this.playersOnCourt[this.o][shooter];
        for (i = 0; i < amount; i++) {
            this.recordStat(this.o, p, "fta");
            if (Math.random() < this.team[this.o].player[p].compositeRating.shootingFT * 0.3 + 0.6) {  // Between 60% and 90%
                this.recordStat(this.o, p, "ft");
                this.recordStat(this.o, p, "pts");
                this.recordPlay("ft", this.o, [this.team[this.o].player[p].name]);
                outcome = "fg";
            } else {
                this.recordPlay("missFt", this.o, [this.team[this.o].player[p].name]);
                outcome = null;
            }
        }

        if (outcome !== "fg") {
            outcome = this.doReb();  // orb or drb
        }

        return outcome;
    };

    /**
     * Personal foul.
     *
     * @memberOf core.gameSim
     * @param {number} t Team (0 or 1, this.or or this.d).
     */
    GameSim.prototype.doPf = function (t) {
        var p, ratios;

        ratios = this.ratingArray("fouling", t);
        p = this.playersOnCourt[t][this.pickPlayer(ratios)];
        this.recordStat(this.d, p, "pf");
        this.recordPlay("pf", this.d, [this.team[this.d].player[p].name]);
        // Foul out
        if (this.team[this.d].player[p].stat.pf >= 6) {
            this.recordPlay("foulOut", this.d, [this.team[this.d].player[p].name]);
            // Force substitutions now
            this.updatePlayersOnCourt();
            this.updateSynergy();
        }
    };

	

    /**
     * Rebound.
     *
     * Simulates a rebound opportunity (e.g. after a missed shot).
     * 
     * @memberOf core.gameSim
     * @return {string} "drb" for a defensive rebound, "orb" for an offensive rebound, null for no rebound (like if the ball goes out of bounds).
     */
    GameSim.prototype.doFaceOff = function () {
        var p,p2, ratios;

/*        if (0.15 > Math.random()) {
            return null;
        }*/
			// find "C", if none, use ratios
			/*if (this.team[this.o].player[this.playersOnCourt[this.d][0]].pos == "C") {
			  p
			}*/
		p = this.findCenter(this.d);
		if (p == -1) {
			ratios = this.ratingArray("faceoff", this.d);
			p = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
		}
		
		p2 = this.findCenter(this.o);
		if (p2 == -1) {
			ratios = this.ratingArray("faceoff", this.o);
			p2 = this.playersOnCourt[this.o][this.pickPlayer(ratios)];
		}

//        if ( ((2 + this.team[this.d].player[p].compositeRating.faceoff) / (2 + this.team[this.o].player[p2].compositeRating.faceoff) )> Math.random()) {
        if ( ( .5*(1-this.ratingsWeight)+this.ratingsWeight*((2 + this.team[this.d].player[p].compositeRating.faceoff) / (2 + this.team[this.o].player[p2].compositeRating.faceoff) ) )> Math.random()) {
            this.recordStat(this.d, p, "fow");
            this.recordStat(this.o, p2, "fol");
            this.recordPlay("faceoff", this.d,  [this.team[this.d].player[p].name, this.team[this.o].player[p2].name] );

            return "drb";
        }

            this.recordStat(this.d, p, "fol");
            this.recordStat(this.o, p2, "fow");
            this.recordPlay("faceoff", this.o, [this.team[this.o].player[p2].name, this.team[this.d].player[p].name] );

        return "orb";
    };	
	
	
    /**
     * Rebound.
     *
     * Simulates a rebound opportunity (e.g. after a missed shot).
     * 
     * @memberOf core.gameSim
     * @return {string} "drb" for a defensive rebound, "orb" for an offensive rebound, null for no rebound (like if the ball goes out of bounds).
     */
    GameSim.prototype.doReb = function () {
        var p, ratios;

        if (0.15 > Math.random()) {
            return null;
        }

        if (0.75 * (2 + this.team[this.d].compositeRating.rebounding) / (2 + this.team[this.o].compositeRating.rebounding) > Math.random()) {
            ratios = this.ratingArray("rebounding", this.d);
            p = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
            this.recordStat(this.d, p, "drb");
            this.recordPlay("drb", this.d, [this.team[this.d].player[p].name]);

            return "drb";
        }

        ratios = this.ratingArray("rebounding", this.o);
        p = this.playersOnCourt[this.o][this.pickPlayer(ratios)];
        this.recordStat(this.o, p, "orb");
        this.recordPlay("orb", this.o, [this.team[this.o].player[p].name]);

        return "orb";
    };

  /**
     * Generate an array of composite ratings.
     * 
     * @memberOf core.gameSim
     * @param {string} rating Key of this.team[t].player[p].compositeRating to use.
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number=} power Power that the composite rating is raised to after the components are linearly combined by  the weights and scaled from 0 to 1. This can be used to introduce nonlinearities, like making a certain stat more uniform (power < 1) or more unevenly distributed (power > 1) or making a composite rating an inverse (power = -1). Default value is 1.
     * @return {Array.<number>} Array of composite ratings of the players on the court for the given rating and team.
     */
    GameSim.prototype.shortOrPower = function (t) {
        var i, p, shortHand;

		shortHand = 0;
        for (i = 0; i < 5; i++) {
            p = this.playersOnCourt[t][i];            
			if (p == penaltyPlayers[t][0]) {
			  shortHand += 1;
			} else if (p == penaltyPlayers[t][1]) {
			  shortHand += 1;
			} else if (p == penaltyPlayers[t][2]) {
			  shortHand += 1;
			} else if (p == penaltyPlayers[t][3]) {
			  shortHand += 1;
			} else if (p == penaltyPlayers[t][4]) {
			  shortHand += 1;
			}
        }

        return shortHand;
    };		
	
   /**
     * Generate an array of composite ratings.
     * 
     * @memberOf core.gameSim
     * @param {string} rating Key of this.team[t].player[p].compositeRating to use.
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number=} power Power that the composite rating is raised to after the components are linearly combined by  the weights and scaled from 0 to 1. This can be used to introduce nonlinearities, like making a certain stat more uniform (power < 1) or more unevenly distributed (power > 1) or making a composite rating an inverse (power = -1). Default value is 1.
     * @return {Array.<number>} Array of composite ratings of the players on the court for the given rating and team.
     */
    GameSim.prototype.findCenter = function (t) {
        var i, p, center;

		center = -1;
        for (i = 0; i < 5; i++) {
            p = this.playersOnCourt[t][i];            
			if (p == penaltyPlayers[t][0]) {
			} else if (p == penaltyPlayers[t][1]) {
			} else if (p == penaltyPlayers[t][2]) {
			} else if (p == penaltyPlayers[t][3]) {
			} else if (p == penaltyPlayers[t][4]) {
			} else if (this.team[t].player[p].pos == "C") {
			  center = p;
			  break;
			}
        }

        return center;
    };	
	
    /**
     * Generate an array of composite ratings.
     * 
     * @memberOf core.gameSim
     * @param {string} rating Key of this.team[t].player[p].compositeRating to use.
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number=} power Power that the composite rating is raised to after the components are linearly combined by  the weights and scaled from 0 to 1. This can be used to introduce nonlinearities, like making a certain stat more uniform (power < 1) or more unevenly distributed (power > 1) or making a composite rating an inverse (power = -1). Default value is 1.
     * @return {Array.<number>} Array of composite ratings of the players on the court for the given rating and team.
     */
    GameSim.prototype.ratingArray = function (rating, t, power) {
        var array, i, p;

        power = power !== undefined ? power : 1;

        array = [0, 0, 0, 0, 0];
        for (i = 0; i < 5; i++) {
            p = this.playersOnCourt[t][i];
			if ( ( (rating == "shootingMidRange") || (rating == "passing")  ) && (this.team[t].player[p].pos == "RD" || this.team[t].player[p].pos == "LD")) {
				array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] , power)/2;			
				//array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] , power)/2;			
			} else if  (this.team[t].player[p].pos == "G") {
				array[i] = 0;
				console.log(this.t+" "+t+" "+p+" "+this.team[t].player[p].pos+" "+rating);
//				array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] , power);
			} else {
				array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] , power);
	//			array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] , power);
			}
			if (p == penaltyPlayers[t][0]) {
				array[i] = 0;			
					//console.log("t: "+t+" penalty "+0);
			} else if (p == penaltyPlayers[t][1]) {
				array[i] = 0;			   
				//	console.log("t: "+t+" penalty "+1);				
			} else if (p == penaltyPlayers[t][2]) {
				array[i] = 0;			   
				//	console.log("t: "+t+" penalty "+2);				
			} else if (p == penaltyPlayers[t][3]) {
				array[i] = 0;	

				//	console.log("t: "+t+" penalty "+3);				
			} else if (p == penaltyPlayers[t][4]) {
				array[i] = 0;	
				//	console.log("t: "+t+" penalty "+4);				
			}
        }

        return array;
    };

    /**
     * Generate an array of composite ratings.
     * 
     * @memberOf core.gameSim
     * @param {string} rating Key of this.team[t].player[p].compositeRating to use.
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number=} power Power that the composite rating is raised to after the components are linearly combined by  the weights and scaled from 0 to 1. This can be used to introduce nonlinearities, like making a certain stat more uniform (power < 1) or more unevenly distributed (power > 1) or making a composite rating an inverse (power = -1). Default value is 1.
     * @return {Array.<number>} Array of composite ratings of the players on the court for the given rating and team.
     */
    GameSim.prototype.ratingArrayRelative = function (rating,ratingD, t,tD, power) {
        var array, i, p;

        power = power !== undefined ? power : 1;

        array = [0, 0, 0, 0, 0];
        for (i = 0; i < 5; i++) {
            p = this.playersOnCourt[t][i];
		//	console.log(this.team[t].player[p].compositeRating[rating]+" "+this.team[tD].compositeRating[ratingD]);
//            array[i] = Math.pow( (this.team[t].player[p].compositeRating[rating]-this.team[tD].compositeRating[ratingD] ) * this.fatigue(this.team[t].player[p].stat.energy), power);
            array[i] = Math.pow( (this.team[t].player[p].compositeRating[rating]-this.team[tD].compositeRating[ratingD] ) , power);
//            array[i] = Math.pow( (this.team[t].player[p].compositeRating[rating]-this.team[tD].compositeRating[ratingD] ) , power);
			if (p == penaltyPlayers[t][0] || (array[i]<0) ) {
				array[i] = 0;			
					//console.log("t: "+t+" penalty "+0);
			} else if (p == penaltyPlayers[t][1] || (array[i]<0) ) {
				array[i] = 0;			   
				//	console.log("t: "+t+" penalty "+1);				
			} else if (p == penaltyPlayers[t][2] || (array[i]<0) ) {
				array[i] = 0;			   
				//	console.log("t: "+t+" penalty "+2);				
			} else if (p == penaltyPlayers[t][3] || (array[i]<0) ) {
				array[i] = 0;	

				//	console.log("t: "+t+" penalty "+3);				
			} else if (p == penaltyPlayers[t][4] || (array[i]<0) ) {
				array[i] = 0;	
				//	console.log("t: "+t+" penalty "+4);				
			}
        }

        return array;
    };	
	
    /**
     * Pick a player to do something.
     * 
     * @memberOf core.gameSim
     * @param {Array.<number>} ratios output of this.ratingArray.
     * @param {number} exempt An integer representing a player that can't be picked (i.e. you can't assist your own shot, which is the only current use of exempt). The value of exempt ranges from 0 to 4, corresponding to the index of the player in this.playersOnCourt. This is *NOT* the same value as the player ID *or* the index of the this.team[t].player list. Yes, that's confusing.
     */
    GameSim.prototype.pickPlayer = function (ratios, exempt) {
        var pick, rand;

        exempt = exempt !== undefined ? exempt : false;

        if (exempt !== false) {
            ratios[exempt] = 0;
        }
				
        rand = Math.random() * (ratios[0] + ratios[1] + ratios[2] + ratios[3] + ratios[4]);
        if (rand < ratios[0]) {
            pick = 0;
			//		console.log("ratios: "+ratios[0]+ " pick: "+0);			
        } else if (rand < (ratios[0] + ratios[1])) {
            pick = 1;
				//	console.log("ratios: "+ratios[0]+" pick: "+1);			
        } else if (rand < (ratios[0] + ratios[1] + ratios[2])) {
            pick = 2;
				//	console.log("ratios: "+ratios[0]+" pick: "+2);			
        } else if (rand < (ratios[0] + ratios[1] + ratios[2] + ratios[3])) {
            pick = 3;
				//	console.log("ratios: "+ratios[0]+" pick: "+3);			
        } else {
            pick = 4;
				//	console.log("ratios: "+ratios[0]+" pick: "+4);			
        }
        return pick;
    };

    /**
     * Pick a player to do something.
     * 
     * @memberOf core.gameSim
     * @param {Array.<number>} ratios output of this.ratingArray.
     * @param {number} exempt An integer representing a player that can't be picked (i.e. you can't assist your own shot, which is the only current use of exempt). The value of exempt ranges from 0 to 4, corresponding to the index of the player in this.playersOnCourt. This is *NOT* the same value as the player ID *or* the index of the this.team[t].player list. Yes, that's confusing.
     */
    GameSim.prototype.pickPlayerAbsolute = function (ratios, exempt) {
        var pick, rand;

        exempt = exempt !== undefined ? exempt : false;

        if (exempt !== false) {
            ratios[exempt] = 0;
        }
				
        rand = Math.random() * (ratios[0] + ratios[1] + ratios[2] + ratios[3] + ratios[4]);
        if (rand < ratios[0]) {
            pick = 0;
			//		console.log("ratios: "+ratios[0]+ " pick: "+0);			
        } else if (rand < (ratios[0] + ratios[1])) {
            pick = 1;
				//	console.log("ratios: "+ratios[0]+" pick: "+1);			
        } else if (rand < (ratios[0] + ratios[1] + ratios[2])) {
            pick = 2;
				//	console.log("ratios: "+ratios[0]+" pick: "+2);			
        } else if (rand < (ratios[0] + ratios[1] + ratios[2] + ratios[3])) {
            pick = 3;
				//	console.log("ratios: "+ratios[0]+" pick: "+3);			
        } else {
            pick = 4;
				//	console.log("ratios: "+ratios[0]+" pick: "+4);			
        }
        return pick;
    };	
	
    /**
     * Increments a stat (s) for a player (p) on a team (t) by amount (default is 1).
     *
     * @memberOf core.gameSim
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number} p Integer index of this.team[t].player for the player of interest.
     * @param {string} s Key for the property of this.team[t].player[p].stat to increment.
     * @param {number} amt Amount to increment (default is 1).
     */
    GameSim.prototype.recordStat = function (t, p, s, amt) {
        amt = amt !== undefined ? amt : 1;
        this.team[t].player[p].stat[s] += amt;
        if (s !== "gs" && s !== "courtTime" && s !== "benchTime" && s !== "energy") {
            this.team[t].stat[s] += amt;
            // Record quarter-by-quarter scoring too
//            if (s === "pts") {
            if (s === "fg") {
                this.team[t].stat.ptsQtrs[this.team[t].stat.ptsQtrs.length - 1] += amt;
            }
            if (this.playByPlay !== undefined) {
                this.playByPlay.push({
                    type: "stat",
                    qtr: this.team[t].stat.ptsQtrs.length - 1,
                    t: t,
                    p: p,
                    s: s,
                    amt: amt
                });
            }
        }
    };

    GameSim.prototype.recordPlay = function (type, t, names) {
        var i, qtr, sec, text, texts;

        if (this.playByPlay !== undefined) {
            if (type === "injury") {
                texts = ["{0} was injured!"];
            } else if (type === "faceoff") {
                texts = ["{0} won faceoff against {1}"];  // adjusted
            } else if (type === "tov") {
                texts = ["Giveaway by {0}"];  // adjusted
            } else if (type === "hit") {
			  //if (Math.random() > .7) { 
                texts = ["Hit by {0} in offensive zone"];
            } else if (type === "stl") {
			  //if (Math.random() > .7) { 
                texts = ["Takeaway by {0} in offensive zone"];
			  //} else if (Math.random() > .5) {  
                //texts = ["Takeaway by {0} in defensive zone"];
			  //} else {
                // texts = ["Takeaway by {0} in neutral zone"];
			  //}

			  
//                texts = ["Takeaway by {0} stole the ball from {1}"];
            } else if (type === "fgAtRim") {
//                texts = ["{0} made a dunk/layup"];
                texts = ["<b> Goal scored by {0} </b> "];
			   
               // texts = ["{0} made a dunk/layup"];
            } else if (type === "fgaAtRim") {
                texts = ["{0} missed shot"];
//                texts = ["{0} made a dunk/layup and got fouled!"];
            } else if (type === "fgLowPost") {
                texts = ["<b> Goal scored by {0} </b> "];
//                texts = ["{0} made a low post shot"];
            } else if (type === "fgaLowPost") {
                texts = ["{0} missed shot"];
//                texts = ["{0} made a low post shot and got fouled!"];
            } else if (type === "fgMidRange") {
                texts = ["<b> Goal scored by {0} </b> "];
//                texts = ["{0} made a mid-range shot"];
            } else if (type === "fgaMidRange") {
                texts = ["{0} missed shot"];
//                texts = ["{0} made a mid-range shot and got fouled!"];
            } else if (type === "tp") {
                texts = ["<b> Goal scored by {0} </b> "];
//                texts = ["{0} made a three pointer shot"];
            } else if (type === "tpa") {
                texts = ["{0} missed shot"];
//                texts = ["{0} made a three pointer and got fouled!"];
            } else if (type === "blkAtRim") {
                texts = ["{1} shot blocked by {0}"];
//                texts = ["{0} blocked {1}'s dunk/layup"];
            } else if (type === "blkLowPost") {
                texts = ["{1} shot blocked by {0}"];
//                texts = ["{0} blocked {1}'s low post shot"];
            } else if (type === "blkMidRange") {
                texts = ["{1} shot blocked by {0}"];
//                texts = ["{0} blocked {1}'s mid-range shot"];
            } else if (type === "blkTp") {
                texts = ["{1} shot blocked by {0}"];
//                texts = ["{0} blocked {1}'s three pointer"];
            } else if (type === "missAtRim") {
                texts = ["Shot missed by {0}"];
//                texts = ["{0} missed a dunk/layup"];
            } else if (type === "missLowPost") {
                texts = ["Shot missed by {0}"];
//                texts = ["{0} missed a low post shot"];
            } else if (type === "missMidRange") {
                texts = ["Shot missed by {0}"];
//                texts = ["{0} missed a mid-range shot"];
            } else if (type === "missTp") {
                texts = ["Shot missed by {0}"];
//                texts = ["{0} missed a three pointer"];
            } else if (type === "orb") {
                texts = ["Shot missed by {0}"];
//                texts = ["{0} grabbed the offensive rebound"];
            } else if (type === "drb") {
                texts = ["{0} grabbed the defensive rebound"];
//                texts = ["{0} grabbed the defensive rebound"];
            } else if (type === "ast") {
                texts = ["<b> (assist: {0}) </b>"];
            } else if (type === "period") {
                texts = ["<b>Start of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length) + " period</b>"];
            } else if (type === "overtime") {
                texts = ["<b>Start of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length - 3) + " overtime period</b>"];
            } else if (type === "ft") {
                texts = ["{0} made a free throw(shouldn't happen)"];
         //       texts = ["{0} made a free throw"];
            } else if (type === "missFt") {
                texts = ["{0} missed a free throw(shouldn't happen)"];
           //     texts = ["{0} missed a free throw"];
            } else if (type === "pf") {
				if (Math.random() < .06) {
					texts = ["<b> penalty to {0} for Hooking {1} </b>"];
				} else if (Math.random() < .07) {
					texts = ["<b> penalty to {0} for Boarding {1} </b>"];
				} else if (Math.random() < .08) {
					texts = ["<b> penalty to {0} for Charging {1} </b>"];
				} else if (Math.random() < .09) {
					texts = ["<b> penalty to {0} for Clipping {1} </b>"];
				} else if (Math.random() < .1) {
					texts = ["<b> penalty to {0} for Diving {1} </b>"];
				} else if (Math.random() < .11) {
					texts = ["<b> penalty to {0} for Elbowing {1} </b>"];
				} else if (Math.random() < .12) {
					texts = ["<b> penalty to {0} for Fighting {1} </b>"];
				} else if (Math.random() < .13) {
					texts = ["<b> penalty to {0} for High-sticking {1} </b>"];
				} else if (Math.random() < .14) {
					texts = ["<b> penalty to {0} for Holding {1} </b>"];
				} else if (Math.random() < .15) {
					texts = ["<b> penalty to {0} for Interference {1} </b>"];
				} else if (Math.random() < .2) {
					texts = ["<b> penalty to {0} for Kneeing {1} </b>"];
				} else if (Math.random() < .25) {
					texts = ["<b> penalty to {0} for Roughing {1} </b>"];
				} else if (Math.random() < .33) {
					texts = ["<b> penalty to {0} for Slashing {1} </b>"];
				} else if (Math.random() < .5) {
					texts = ["<b> penalty to {0} for Tripping {1} </b>"];
				} else {
					texts = ["<b> penalty to {0} for Unsportsmanlike conduct {1} </b>"];
				} 
            } else if (type === "pfOver") {
                texts = ["<b> penalty time finished for {0} </b>"];
            } else if (type === "foulOut") {
                texts = ["{0} fouled out"];
            } else if (type === "sub") {
                texts = ["Substitution: {0} for {1}"];
            }

            if (texts) {
                //text = random.choice(texts);
                text = texts[0];
                if (names) {
                    for (i = 0; i < names.length; i++) {
                        text = text.replace("{" + i + "}", names[i]);
                    }
                }

                if (type === "ast") {
                    // Find most recent made shot, count assist for it
                    for (i = this.playByPlay.length - 1; i >= 0; i--) {
                        if (this.playByPlay[i].type === "text") {
                            this.playByPlay[i].text += " " + text;
                            break;
                        }
                    }
                } else {
                    sec = Math.floor(this.t % 1 * 60);
                    if (sec < 10) {
                        sec = "0" + sec;
                    }
                    this.playByPlay.push({
                        type: "text",
                        text: text,
                        t: t,
                        time: Math.floor(this.t) + ":" + sec
                    });
                }
            } else {
                throw new Error("No text for " + type);
            }
        }
    };

    /**
     * Convert energy into fatigue, which can be multiplied by a rating to get a fatigue-adjusted value.
     * 
     * @memberOf core.gameSim
     * @param {number} energy A player's energy level, from 0 to 1 (0 = lots of energy, 1 = none).
     * @return {number} Fatigue, from 0 to 1 (0 = lots of fatigue, 1 = none).
     */
    GameSim.prototype.fatigue = function (energy) {
	//console.log(energy);
        energy += 0.05;
        if (energy > 1) {
            energy = 1;
        }

        return energy;
    };

    return {
        GameSim: GameSim
    };
});