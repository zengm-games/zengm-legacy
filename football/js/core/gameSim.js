/**
 * @name core.gameSim
 * @namespace Individual game simulation.
 */
define([ "globals","lib/underscore", "util/helpers", "util/random"], function (g,_, helpers, random) {
    "use strict";


		var fieldPosition;	
		
		// use push instead of a fixed amount (2)
	var firstTimeThrough = [] ; // top 11 plays?
			var firstTimeOffense = [] ; // who player is
		var firstTimeDefense = [] ; // who player is
		var firstTimeBlocking= [] ; // who player is
		var firstTimeRushing = [] ; // who player is
		var firstTimeTackling = [] ; // who player is
		
		// use actual words pass, throw (done)
		var firstTimeType = [] ; // who player is

		// use length instead (next? 1) (done)

		
		// instead of prob, use basketball gm sum of each and have offense pick one. more balanced this way (3)
		// randomly pick players based on ability? or use matchups? still want matchups, but use full roster not just best one, make more team dependent?
		
		// remove sacks and record when QB has negative pass?, there are negative passes, review and maybe have those be sacks
		
		// get balance right, good QBs with best stats
		// play distrubtion, run and pass
		// how good they are at those plays
		// balance between players
		// subbing more players (fatigue)
		// more often sub
		

		var secondTimeThrough = [] ; // top 11 plays?
		var secondTimeOffense = [] ; // who player is
		var secondTimeDefense = [] ; // who player is
		var secondTimeBlocking= [] ; // who player is
		var secondTimeRushing = [] ; // who player is
		var secondTimeTackling = [] ; // who player is

		var secondTimeType = [] ; // who player is
		

		var thirdTimeThrough = [] ; // top 11 plays?
		var thirdTimeOffense = [] ; // who player is
		var thirdTimeDefense = [] ; // who player is
		var thirdTimeBlocking= [] ; // who player is
		var thirdTimeRushing = [] ; // who player is
		var thirdTimeTackling = [] ; // who player is

		var thirdTimeType = [] ; // who player is

		// simplify other arrays
		// simplify picking of players?
		// 
		
		//var driveActive = [0,0];
		//var fieldPosition = 20;
		//var toFirst = 10;
		//var yardsOnPlay = 0;
	var driveNumber = [0,0];			
			
	var playNumber = 0;
	
	var fromPunt = 0;
	
	var homeTeam = 0;
	
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
	
		var i;
	
	    var offenseCount = 0;
	    var defenseCount = 0;		
	    var kickerCount = 0;		
	    var oBenchCount = 0;		
	    var dBenchCount = 0;		
	    var kBenchCount = 0;		
	    var oInactiveCount = 0;		
	    var dInactiveCount = 0;		
	    var kInactiveCount = 0;		
	    var totalCount = 0;		
	
		var teamZeroPlayer = 0;
		var teamOnePlayer = 0;		
		var teamPlayer = 0;
		var tempPlayer;
		
		var j;
		
        if (doPlayByPlay) {
            this.playByPlay = [];
        }

        this.id = gid;
        this.team = [team1, team2];  // If a team plays twice in a day, this needs to be a deep copy

		//// make based on actual play? and yardage?
        this.numPossessions = Math.round((this.team[0].pace + this.team[1].pace) / 2 * random.uniform(0.9, 1.1));
        this.dt = 60 / (2 * this.numPossessions); // Time elapsed per possession
		// make random?
		this.playersOnCourt = [[0, 1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23], [0, 1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]];
		this.playersOnBench = [[24, 25, 26, 27, 28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45], [24, 25, 26, 27, 28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]];

		for (i = 0; i < this.team[0].player.length; i++) {
			if (i>0) {
				teamZeroPlayer += (1+this.team[0].player[i-1].rosterOrder - this.team[0].player[i].rosterOrder)*(1+this.team[0].player[i-1].rosterOrder - this.team[0].player[i].rosterOrder)
			}
		}
		for (i = 0; i < this.team[1].player.length; i++) {
			if (i>0) {
				teamOnePlayer += (1+this.team[1].player[i-1].rosterOrder - this.team[1].player[i].rosterOrder)*(1+this.team[1].player[i-1].rosterOrder - this.team[1].player[i].rosterOrder)
			}
		}
		
		if ((teamZeroPlayer>10) || (teamOnePlayer>10)) {
						
			for (j = 0; j < 2; j++) {
				teamPlayer = j;
				offenseCount = 0;
				defenseCount = 0;
				kickerCount = 0;
				dBenchCount = 0;
				oBenchCount = 0;
				kBenchCount = 0;
				oInactiveCount = 0;
				dInactiveCount = 0;
				kInactiveCount = 0;
				
				for (i = 0; i < this.team[teamPlayer].player.length; i++) {
					
					if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="off") && (offenseCount < 11)) {
						this.playersOnCourt[teamPlayer][offenseCount] = i;							
						offenseCount += 1;
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="def") && (defenseCount < 11)) {
						defenseCount += 1;				
						this.playersOnCourt[teamPlayer][defenseCount+10] = i;														
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="k") && (kickerCount < 2)) {
						kickerCount += 1;				
						this.playersOnCourt[teamPlayer][11+10+kickerCount] = i	;													
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="def")) {
						this.playersOnBench[teamPlayer][11+10+2+dBenchCount+oBenchCount+kBenchCount] = i;														
						dBenchCount += 1;				
					
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="off")) {
						this.playersOnBench[teamPlayer][11+10+2+dBenchCount+oBenchCount+kBenchCount] = i;														
						oBenchCount += 1;				
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="k")) {
						this.playersOnBench[teamPlayer][11+10+2+dBenchCount+oBenchCount+kBenchCount] = i	;													
						kBenchCount += 1;				
					
					} else if (this.team[teamPlayer].player[i].offDefK=="off") {
						oInactiveCount += 1;				
					} else if (this.team[teamPlayer].player[i].offDefK=="def") {
						dInactiveCount += 1;				
					
					} else {
						kInactiveCount += 1;				
					}					
				}					
			}
		}
		
        this.startersRecorded = false;  // Used to track whether the *real* starters have been recorded or not.
        this.updatePlayersOnCourt();

//        this.subsEveryN = 6;  // How many possessions to wait before doing substitutions
        this.subsEveryN = 2;  // How many possessions to wait before doing substitutions
		// reall want to sub by plays

        this.overtimes = 0;  // Number of overtime periods that have taken place

        this.t = 60; // Game clock, in minutes  make full game 60 minutes

        // Parameters
        this.synergyFactor = 0.1;  // How important is synergy?

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
		
		fieldPosition = 20;
		driveNumber[0] = 0; // 
		driveNumber[1] = 0; // 
		playNumber = 0;
        this.simPossessions();

        // Play overtime periods if necessary
        while (this.team[0].stat.pts === this.team[1].stat.pts) {
            if (this.overtimes === 0) {
                this.numPossessions = Math.round(this.numPossessions * 15 / 60);  // 5 minutes of possessions
                this.dt = 15 / (2 * this.numPossessions);
            }
            this.t = 15;
            this.overtimes += 1;
            this.team[0].stat.ptsQtrs.push(0);
            this.team[1].stat.ptsQtrs.push(0);
            this.recordPlay("overtime");
            this.simPossessions();
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
        var i, outcome, substitutions;

        this.o = 0;
        this.d = 1;
		homeTeam = this.o;
		
        i = 0;
//        while (i < this.numPossessions * 2) {
        while (this.t > 0) {
            // Keep track of quarters
		//	console.log("time: "+this.t+" quarter: "+this.team[0].stat.ptsQtrs.length);
/*            if ((this.t <= 45 && this.team[0].stat.ptsQtrs.length === 1) ||
                    (this.t <= 30 && this.team[0].stat.ptsQtrs.length === 2) ||
                    (this.t <= 15 && this.team[0].stat.ptsQtrs.length === 3)) {
                this.team[0].stat.ptsQtrs.push(0);
                this.team[1].stat.ptsQtrs.push(0);
              //  this.t = 15;
                this.recordPlay("quarter");
            }*/

            // Clock
			
			// make this.dt adjusted from possession
//            this.t -= this.dt;
            this.t -= .15;
			this.recordStat(this.o, this.playersOnCourt[this.o][0], "top",.15);		
            if (this.t < 0) {
                this.t = 0;
            }

            // Possession change // done during game after downs, only need this at halftime?
            this.o = (this.o === 1) ? 0 : 1;
            this.d = (this.o === 1) ? 0 : 1;

            this.updateTeamCompositeRatings();

            outcome = this.simPossession();

            // Swap o and d so that o will get another possession when they are swapped again at the beginning of the loop.
            if (outcome === "orb") {
                this.o = (this.o === 1) ? 0 : 1;
                this.d = (this.o === 1) ? 0 : 1;
            }

            this.updatePlayingTime();

            this.injuries();

			
			
			//////////////////// change I change this
            if (i % this.subsEveryN === 0) {
                substitutions = this.updatePlayersOnCourt();
                if (substitutions) {
                    this.updateSynergy();
                }
            }

            i += 1;
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
        var b, i, ovrs, p, pp, substitutions, t, currentFatigue, modifiedFatigue;

        substitutions = false;

        for (t = 0; t < 2; t++) {
            // Overall values scaled by fatigue
            ovrs = [];
            for (p = 0; p < this.team[t].player.length; p++) {
                // Injured or foulded out players can't play
                if (this.team[t].player[p].injured ) {
                    ovrs[p] = -Infinity;
                } else {
				//	if (this.team[t].player[p].pos = "WR") {					    
				//		ovrs[p] = this.team[t].player[p].valueNoPot * this.fatigue(this.team[t].player[p].stat.energy)* this.fatigue(this.team[t].player[p].stat.energy) * this.team[t].player[p].ptModifier * random.uniform(0.9, 1.1);
				//	} else {
			//	console.log("pos: "+this.team[t].player[p].pos);
					currentFatigue = this.fatigue(this.team[t].player[p].stat.energy);
					modifiedFatigue = currentFatigue;
					modifiedFatigue *= currentFatigue;
				
//						ovrs[p] = this.team[t].player[p].valueNoPot * this.fatigue(this.team[t].player[p].stat.energy) * this.team[t].player[p].ptModifier * random.uniform(0.9, 1.1);
						ovrs[p] = this.team[t].player[p].valueNoPot * modifiedFatigue * this.team[t].player[p].ptModifier * random.uniform(0.9, 1.1);
				//	}
					
                }
            }

            // Loop through players on court (in inverse order of current roster position)
            i = 0;
           // skip passer
            for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
                p = this.playersOnCourt[t][pp];
                this.playersOnCourt[t][i] = p;
                // Loop through bench players (in order of current roster position) to see if any should be subbed in)
                for (b = 0; b < this.team[t].player.length; b++) {
//                    if (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured || this.team[t].player[p].stat.pf >= 6) && (!this.team[t].player[b].injured && this.team[t].player[b].stat.pf < 6)))) {
//                    if (  (this.team[t].player[b].active) && (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured ) && (!this.team[t].player[b].injured)))) && ( (this.team[t].player[b].pos == this.team[t].player[p].pos    ) && ( ((this.team[t].player[p].pos != 'QB') ) && ((this.team[t].player[p].pos != 'K') ) )) ) {
                    if (  (this.team[t].player[b].active) && (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured ) && (!this.team[t].player[b].injured)))) && ( (this.team[t].player[b].pos == this.team[t].player[p].pos    ) ) ) {
						if (((this.team[t].player[p].pos == 'QB')  || (this.team[t].player[p].pos == 'K') || ( pp == 0)  || (  this.playersOnCourt[t][0] == b) )  && (!this.team[t].player[p].injured) ) {
						} else {
							substitutions = true;

							// Substitute player
							this.playersOnCourt[t][i] = b;
							//p = b;
							this.team[t].player[b].stat.courtTime = random.uniform(-2, 2);
							this.team[t].player[b].stat.benchTime = random.uniform(-2, 2);
							this.team[t].player[p].stat.courtTime = random.uniform(-2, 2);
							this.team[t].player[p].stat.benchTime = random.uniform(-2, 2);

							// Keep track of deviations from the normal starting lineup for the play-by-play
							if (this.playByPlay !== undefined) {
								this.playByPlay.push({
									type: "sub",
									t: t,
									on: this.team[t].player[b].id,
									off: this.team[t].player[p].id
								});
							}

							// It's only a "substitution" if it's not the starting lineup
							if (this.startersRecorded) {
								//this.recordPlay("sub", t, [this.team[t].player[b].name, this.team[t].player[p].name]);
							}
							break;
						}
					}					
					//// check for injured player (put in some matching offense/defense)															
                }
				
				if ((p == this.playersOnCourt[t][i]) && (this.team[t].player[p].injured ))  {				
					for (b = 0; b < this.team[t].player.length; b++) {
		//                    if (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured || this.team[t].player[p].stat.pf >= 6) && (!this.team[t].player[b].injured && this.team[t].player[b].stat.pf < 6)))) {
		//                    if (  (this.team[t].player[b].active) && (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured ) && (!this.team[t].player[b].injured)))) && ( (this.team[t].player[b].pos == this.team[t].player[p].pos    ) && ( ((this.team[t].player[p].pos != 'QB') ) && ((this.team[t].player[p].pos != 'K') ) )) ) {
							if (  (this.team[t].player[b].active) && (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured ) && (!this.team[t].player[b].injured)))) ) {
							
									if ( (((this.team[t].player[b].pos == 'QB') || (this.team[t].player[b].pos == 'RB')  || (this.team[t].player[b].pos == 'TE')  || (this.team[t].player[b].pos == 'WR')  || (this.team[t].player[b].pos == 'OL') ) && ((this.team[t].player[p].pos == 'QB') || (this.team[t].player[p].pos == 'RB') || (this.team[t].player[p].pos == 'TE') || (this.team[t].player[p].pos == 'WR') || (this.team[t].player[p].pos == 'OL') ) ) || (((this.team[t].player[b].pos == 'CB') || (this.team[t].player[b].pos == 'S')  || (this.team[t].player[b].pos == 'LB')  || (this.team[t].player[b].pos == 'DL')  ) && ((this.team[t].player[p].pos == 'CB') || (this.team[t].player[p].pos == 'S') || (this.team[t].player[p].pos == 'DL') || (this.team[t].player[p].pos == 'LB') ) ) || (((this.team[t].player[p].pos == 'K') ) && ((this.team[t].player[b].pos == 'RB')  ) ) )   {
							
										substitutions = true;

										// Substitute player
										this.playersOnCourt[t][i] = b;
										//p = b;
										this.team[t].player[b].stat.courtTime = random.uniform(-2, 2);
										this.team[t].player[b].stat.benchTime = random.uniform(-2, 2);
										this.team[t].player[p].stat.courtTime = random.uniform(-2, 2);
										this.team[t].player[p].stat.benchTime = random.uniform(-2, 2);

										// Keep track of deviations from the normal starting lineup for the play-by-play
										if (this.playByPlay !== undefined) {
											this.playByPlay.push({
												type: "sub",
												t: t,
												on: this.team[t].player[b].id,
												off: this.team[t].player[p].id
											});
										}

										// It's only a "substitution" if it's not the starting lineup
										if (this.startersRecorded) {
											//this.recordPlay("sub", t, [this.team[t].player[b].name, this.team[t].player[p].name]);
										}
										break;
									}								
							}							
							//// check for injured player (put in some matching offense/defense)																					
						}														
				}   										
                i += 1;
            }
        }

        // Record starters if that hasn't been done yet. This should run the first time this function is called, and never again.
        if (!this.startersRecorded) {
            for (t = 0; t < 2; t++) {
                for (p = 0; p < this.team[t].player.length; p++) {
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

        for (t = 0; t < 2; t++) {
            // Count all the *fractional* skills of the active players on a team (including duplicates)
            skillsCount = {
                "3": 0,
                A: 0,
                B: 0,
                Di: 0,
                Dp: 0,
                Po: 0,
                Ps: 0,
                R: 0
            };

			//// update these
			
			
            for (i = 0; i < 5; i++) {
                p = this.playersOnCourt[t][i];

                // 1 / (1 + e^-(15 * (x - 0.7))) from 0 to 1
                skillsCount["3"] += this.sigmoid(this.team[t].player[p].compositeRating.shootingThreePointer, 15, 0.7);
                skillsCount.A += this.sigmoid(this.team[t].player[p].compositeRating.athleticism, 15, 0.7);
                skillsCount.B += this.sigmoid(this.team[t].player[p].compositeRating.dribbling, 15, 0.7);
                skillsCount.Di += this.sigmoid(this.team[t].player[p].compositeRating.defenseInterior, 15, 0.7);
                skillsCount.Dp += this.sigmoid(this.team[t].player[p].compositeRating.defensePerimeter, 15, 0.7);
                skillsCount.Po += this.sigmoid(this.team[t].player[p].compositeRating.shootingLowPost, 15, 0.7);
                skillsCount.Ps += this.sigmoid(this.team[t].player[p].compositeRating.passing, 15, 0.7);
                skillsCount.R += this.sigmoid(this.team[t].player[p].compositeRating.rebounding, 15, 0.7);
            }

            // Base offensive synergy
            this.team[t].synergy.off = 0;
            this.team[t].synergy.off += 5 * this.sigmoid(skillsCount["3"], 3, 2); // 5 / (1 + e^-(3 * (x - 2))) from 0 to 5
            this.team[t].synergy.off += 3 * this.sigmoid(skillsCount.B, 15, 0.75) + this.sigmoid(skillsCount.B, 5, 1.75); // 3 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) from 0 to 5
            this.team[t].synergy.off += 3 * this.sigmoid(skillsCount.Ps, 15, 0.75) + this.sigmoid(skillsCount.Ps, 5, 1.75) + this.sigmoid(skillsCount.Ps, 5, 2.75); // 3 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) + 1 / (1 + e^-(5 * (x - 2.75))) from 0 to 5
            this.team[t].synergy.off += this.sigmoid(skillsCount.Po, 15, 0.75); // 1 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
            this.team[t].synergy.off += this.sigmoid(skillsCount.A, 15, 1.75) + this.sigmoid(skillsCount.A, 5, 2.75); // 1 / (1 + e^-(15 * (x - 1.75))) + 1 / (1 + e^-(5 * (x - 2.75))) from 0 to 5
            this.team[t].synergy.off /= 17;

            // Punish teams for not having multiple perimeter skills
            perimFactor = helpers.bound(Math.sqrt(1 + skillsCount.B + skillsCount.Ps + skillsCount["3"]) - 1, 0, 2) / 2; // Between 0 and 1, representing the perimeter skills
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

                for (i = 0; i < 5; i++) {
                    p = this.playersOnCourt[t][i];
                    this.team[t].compositeRating[rating] += this.team[t].player[p].compositeRating[rating] * this.fatigue(this.team[t].player[p].stat.energy);
                }

                this.team[t].compositeRating[rating] = this.team[t].compositeRating[rating] / 5;
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
                    this.recordStat(t, p, "energy", -this.dt  * 0.06 * (1 - this.team[t].player[p].compositeRating.endurance));
                    if (this.team[t].player[p].stat.energy < 0) {
                        this.team[t].player[p].stat.energy = 0;
                    }
                } else {
                    this.recordStat(t, p, "benchTime", this.dt);
                    this.recordStat(t, p, "energy", this.dt  * 0.1);
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
//                    if (Math.random() < 0.00250) {
                    if (Math.random() < 0.00100) {
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
        var ratios, shooter;

  		
		////
		
		
		/*	loop possession/drive
		    loop series
			---------
			loop down ( determine top mismatches for offense to use, running recieving, then pick among them)
			( 1st,2nd,3rd,4th)
			end on downs,new possession, or points */
		
		// doShot can be a play?
		var driveActive;
		var playDown;
		var i,j,k;	

		
		var tempVar;
		
		var teamTemp;
		

       //// organize players
//// this could be done earlier
//// then just redone after each sub

   
	     
		 //// running options, passing options, blockers
		 
		 
		 ////////
		 //////// *** control variables here to balance game ***
		 ////////
		 var sackOdds, runPass, runBoost,passBoost, runYards, passYards,passRange,runRange,passLine,runLine,lineRange,runPassPlus;
		 var rushLevel, rushImpact,thirdDownAdj;
		 
		 //thirdDownAdj = .95;
		 thirdDownAdj = .00;
		 //this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy
		 //throwingDistance
		 //
		 thirdDownAdj += this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy;
		 thirdDownAdj += this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingDistance;
		 thirdDownAdj += this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.avoidSack;
		 thirdDownAdj /= 3;
		 
		 //avoidSack
		 sackOdds = 1.0;  // odds of a negative passing play being a sack
//		 runPass = 0.70; //0.8 still to run heavy		 
//		 runPass = 1.20; //0.8 still to run heavy, less more pass, high more run		 
//		 runPass = 1.00; //0.8 still to run heavy, less more pass, high more run		 
//		 runPass = 0.80; //0.8 still to run heavy, less more pass, high more run		 
		 runPass = 1.00; //0.8 still to run heavy, less more pass, high more run		 
		if (typeof(g.customRosterMode) == 'undefined') {
		} else {
			if (g.customRosterMode)  {				
				//runPass = 2.00; //0.8 still to run heavy, less more pass, high more run		 				
			} else {
			}
		}			 
//		 runPassPlus = 3.00;
		 runPassPlus = 2.00;
		 
		 //// amplify or minimize player skill impact
		 runYards = 0.95;  // boost yards of play 
		 passYards = 0.82;  // boost yeards of play
		 

		 // amplify or level
		 runLine = 1.00;  // expand or shrink range
		 passLine = 1.00;  // expand or shrink range

		 // amplify or minimize line
//		 runRange = .27;  // expand or shrink range
//		 passRange = .35;  // expand or shrink range		 
//		 lineRange = .09;
		 runRange = .13;  // expand or shrink range
		 passRange = .35;  // expand or shrink range		 
		 lineRange = .04;
		 
		 //// amplify or minimize player skill impact
//		 runBoost = -0.04; //boost odds of play
//		 passBoost = -0.090;   // boost odds of play
		 runBoost = -0.02; //boost odds of play
		 passBoost = -0.20;   // boost odds of play
		if (typeof(g.customRosterMode) == 'undefined') {
		} else {
			if (g.customRosterMode)  {				
				//passBoost = -0.30;   // boost odds of play
			} else {
			}
		}			 
		 // spread off offense, more spread out, less spread out (greater impact of fatigue?)
		 // want top WR to get less passes
		 //
		 
// set all to 0 and see what differentials do

// not used 
		 runYards = 1.0;  // boost yards of play 
		 passYards = 1.0;  // boost yeards of play

		 // 1 is same
		 runRange = 1.0;  // expand or shrink range
		 passRange = 1.1;  // expand or shrink range		 
		 lineRange = 1.0;
		 
		 // 0 is same
		 //// amplify or minimize player skill impact
		 runBoost = 0.0; //boost odds of play
		 passBoost = 0.0;   // boost odds of play
////////////////////////////		 
		 // 1 is same
//		 runRange = .50;  // expand or shrink range
//		 passRange = .5;  // expand or shrink range		 
//		 lineRange = .25;
		 runRange = .300;  // expand or shrink range
//		 passRange = .70;  // expand or shrink range		 
		 passRange = .35;  // expand or shrink range		 
		 lineRange = .20;
		 
		 // 0 is same
		 //// amplify or minimize player skill impact
		 // needs to offset impact from range*playerteamskill
//		 runBoost = -0.005; //boost YARDAGE of play
	//	 passBoost = -0.055;   // boost YARDAGE of play
//		 runBoost = -0.025; //boost YARDAGE of play
//		 passBoost = -0.045;   // boost YARDAGE of play
		 runBoost = -0.000; //boost YARDAGE of play
//		 passBoost = 0.030;   // boost YARDAGE of play
		 passBoost = 0.02;   // boost YARDAGE of play
		 
//		 rushLevel = .55; // base odds of staying in to 1st level where most running plays are;		 
		 rushLevel = .45; // base odds of staying in to 1st level where most running plays are;		 
		 rushImpact = 1.0; // base is -.05 to 0.25 or so
		 
		if (typeof(g.customRosterMode) == 'undefined') {
		} else {
			if (g.customRosterMode)  {				
				//rushLevel = .5; // base odds of staying in to 1st level where most running plays are;		 
			} else {
			}
		}			 
		 
         //// remove this (allow for subs stats)
		 if (driveNumber[this.o] >= 0) {
			
		 


			// receivingOptions = 0;
			// blockingOptions = 0;
			 
			 
			 //rushingOptions = 0;
			// coverageOptions = 0;
			 
			 //// need to track locations, 
			 //// then create order, best to worst,
			 //// then create matchups
			 //// then create adjustments
			 			 
						 
						 // only do one team
						 // push
						 // set to blank every time through
			var qbDetailed = [] ;

			var runningDetailed = [] ; // done
			
			
			var receivingDetailed = [] ;
			var blockingDetailed = [] ;

			var rushingDetailed = [] ;
			var coverageDetailed = [] ;


			var runningPower = [] ;
			var runningSide = [] ;
			var receivingShort = [] ;
			var receivingCrossing = [] ;
			var receivingLong = [] ;
			var blockingRun = [] ;
			var blockingPass = [] ;
			var rushPass = [] ;
			var rushRun = [] ;
			var coverShort = [] ;
			var coverCross = [] ;
			var coverLong = [] ;


			var compareRunPower = [] ;
			var compareRunSide = [] ;
			var compareRecShort = [] ;
			var compareRecCross = [] ;
			var compareRecLong = [] ;
			var compareBlockRun = [] ;
			var compareBlockPass = [] ;
			var compareRushPass = [] ;
			var compareRushRun = [] ;
			var compareCovShort = [] ;
			var compareCovCross = [] ;
			var compareCovDeep = [] ;
			

			
			////////// offense
			
			//// track players for each function
			
			for (j = 0; j < 11; j++) {		  
				i = this.playersOnCourt[this.o][j];

				if 	((this.team[this.o].player[i].pos == "QB")){
					qbDetailed.push(i);
				}
				if 	((this.team[this.o].player[i].pos == "RB") || (this.team[this.o].player[i].pos == "QB")){
					runningDetailed.push(i);
					runningPower.push(i);
					runningSide.push(i);
				}
				if 	( ((this.team[this.o].player[i].pos == "WR") || (this.team[this.o].player[i].pos == "TE") || (this.team[this.o].player[i].pos == "RB") ) && (j > 0)){
					receivingDetailed.push(i);
					receivingShort.push(i);
					receivingCrossing.push(i);
					receivingLong.push(i);
				}
				if 	(((this.team[this.o].player[i].pos == "OL") || (this.team[this.o].player[i].pos == "TE") || (this.team[this.o].player[i].pos == "RB") ) && (j > 0)){
					blockingDetailed.push(i);
					blockingRun.push(i);
					blockingPass.push(i);
				}
				
			}						
			
			
			/////// defense
			
			//// track players for each function			
			
			for (j = 11; j < 22; j++) {		  
				i = this.playersOnCourt[this.d][j];

				if 	((this.team[this.d].player[i].pos == "DL") || (this.team[this.d].player[i].pos == "LB")){
					rushingDetailed.push(i);
					rushPass.push(i);
					rushRun.push(i);
				}
				if 	((this.team[this.d].player[i].pos == "CB") || (this.team[this.d].player[i].pos == "S") || (this.team[this.d].player[i].pos == "LB")){
					coverageDetailed.push(i);
					coverLong.push(i);
					coverCross.push(i);
					coverShort.push(i);
				}
				
			}			
	
		
		
			///// sort  by type of run/pass
			
			
			
			////////////////  Offense
			
			
			////////////////////// values for each option
			
			///////////////////// running
			for (j = 0; j < runningDetailed.length; j++) {		  
				i = runningDetailed[j];			
				 compareRunPower.push(this.team[this.o].player[i].compositeRating.runningPower*this.team[this.o].player[i].stat.energy);
				 compareRunSide.push(this.team[this.o].player[i].compositeRating.runningSide*this.team[this.o].player[i].stat.energy);			
			}			

			this.sortSkill(compareRunPower,runningPower);
						
			this.sortSkill(compareRunSide,runningSide);

			/////////////////////////// receiving
			var QBAdj;
			var QBPen;
			var QBImpact;
			var WRImpact;
			
			QBImpact = 1.00;
			WRImpact = 1.00; // was 3
//			QBImpact = 1.25;
//			WRImpact = 0.75; // was 3
//			QBImpact = 1.5;
//			WRImpact = 0.5; // was 3
			for (j = 0; j < receivingDetailed.length; j++) {		  
				i = receivingDetailed[j];		
				 
				 if (this.team[this.o].player[0].pos == "QB") {
				   QBAdj = 1;
				   QBPen = 0;
				 } else {
//				   QBAdj = .05;
				   QBAdj = 1.00;
				   QBPen = -1.0;	
					//console.log(compareRecShort);
//					console.log(compareRecCross);
	//				console.log(compareRecLong);				
				 }
				 compareRecShort.push(((this.team[this.o].player[i].compositeRating.receivingShort*this.team[this.o].player[i].stat.energy)*WRImpact+this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy*QBImpact)*QBAdj/(QBImpact+WRImpact)+QBPen);
				 compareRecCross.push( ((this.team[this.o].player[i].compositeRating.receivingCrossing*this.team[this.o].player[i].stat.energy)*WRImpact+(this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy*QBImpact)*QBAdj+(this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingDistance*QBImpact)*QBAdj)/(QBImpact*2+WRImpact)+QBPen);
				 // another bug, avoid sack was wrong;
				 compareRecLong.push(((this.team[this.o].player[i].compositeRating.receivingLong*this.team[this.o].player[i].stat.energy)*WRImpact+(this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingDistance*QBImpact)*QBAdj+this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy*QBImpact)*QBAdj/(QBImpact*2+WRImpact)+QBPen);				 
			}
			this.sortSkill(compareRecShort,receivingShort);
			
			this.sortSkill(compareRecCross,receivingCrossing);
			
			this.sortSkill(compareRecLong,receivingLong);


			// blocking
			for (j = 0; j < blockingDetailed.length; j++) {		  
				i = blockingDetailed[j];			
				 compareBlockRun.push( this.team[this.o].player[i].compositeRating.blockRun*this.team[this.o].player[i].stat.energy);
				 compareBlockPass.push( this.team[this.o].player[i].compositeRating.blockPass*this.team[this.o].player[i].stat.energy);
			}
			
			this.sortSkill(compareBlockRun,blockingRun);
			
			this.sortSkill(compareBlockPass,blockingPass);

			
			////////////////////Defense
			
			// rushing
			for (j = 0; j < rushingDetailed.length; j++) {		  
				i = rushingDetailed[j];			
				 compareRushRun.push( this.team[this.d].player[i].compositeRating.runStop*this.team[this.d].player[i].stat.energy);
				 compareRushPass.push(  this.team[this.d].player[i].compositeRating.passRush*this.team[this.d].player[i].stat.energy);
			}
			
			this.sortSkillDefense(compareRushRun,rushRun);
			
			this.sortSkillDefense(compareRushPass,rushPass);
			
			// coverage
			for (j = 0; j < coverageDetailed.length; j++) {		  
				i = coverageDetailed[j];		
			
				 compareCovShort.push( this.team[this.d].player[i].compositeRating.shortCoverage*this.team[this.d].player[i].stat.energy);
				 compareCovCross.push( this.team[this.d].player[i].compositeRating.crossingCoverage*this.team[this.d].player[i].stat.energy);
				 compareCovDeep.push( this.team[this.d].player[i].compositeRating.deepCoverage*this.team[this.d].player[i].stat.energy);
			}
			
			this.sortSkillDefense(compareCovShort,coverShort);
			
			this.sortSkillDefense(compareCovCross,coverCross);
			
			this.sortSkillDefense(compareCovDeep,coverLong);
			
			//////////////  matchups

				 
			var lineDifferentialsRun = [] ;
			var lineDifferentialsPass = [] ;

						
			var receivingDifferentialsShort = [] ;
			var receivingDifferentialsCrossing = [] ;
			var receivingDifferentialsLong = [] ;
				 
				 
			var skillDiffRunOptions,skillDiffPassOptions,skillDiffShortOptions,skillDiffCrossingOptions,skillDiffLongOptions;
				 //// all blockers , all rushers
				 
				 ///// looking for matchups
				 
				 ///// if offense goes pass, who will pick up that receiver (who could sack the QB)
				 ///// if offense goes run, who could tackle that runner (run at weakest lineman/LB)
				 
				 //// then rank form best to worst (WR1,RB1 run, RB1 pass, WR2, etc)
				 
				 //// if defense uses one player (take that player out of other rankings?  how to deal with duplicates?)
				 
				 //// more you use another successful play, eases up other plays
				 //// more you use another unsuccesful play, other plays made tougher
				 
				 //// RB can't catch pass right away (mostly goes short), TE even have a slight delay (hard to go long)
				 //// WR can't run right away, TE slight delay running?
				 
			skillDiffRunOptions = 10;
			skillDiffPassOptions = 10;
			skillDiffShortOptions = 10;
			skillDiffCrossingOptions = 10;
			skillDiffLongOptions =10;
				 ////
		//	console.log("bb rush options: "+ rushingDetailed.length+" block "+blockingDetailed.length+" minRun  "+skillDiffRunOptions);
			if (rushingDetailed.length>blockingDetailed.length) {
				skillDiffRunOptions = blockingDetailed.length;
				skillDiffPassOptions = blockingDetailed.length;
			} else {
				skillDiffRunOptions = rushingDetailed.length;
				skillDiffPassOptions = rushingDetailed.length;
			}		
			if (coverageDetailed.length>receivingDetailed.length) {
				skillDiffShortOptions = receivingDetailed.length;
				skillDiffCrossingOptions = receivingDetailed.length;
				skillDiffLongOptions = receivingDetailed.length;
			} else {
				skillDiffShortOptions = coverageDetailed.length;
				skillDiffCrossingOptions = coverageDetailed.length;
				skillDiffLongOptions = coverageDetailed.length;
			}					
				 
			///// Adjust impact of
				//// 1) offense and defense (defense weighs less so that offensive players still perform somewhat in line to norms)
				//// 2) extra blocker (reduce impact to bring more formations in line)
				//// game may over adjust to differences
				
		//	console.log("Line-Run");
			this.skillDifferential("blockRun","runStop",lineDifferentialsRun,blockingRun,rushRun,skillDiffRunOptions);
		//	console.log("Line-Pass");
			this.skillDifferential("blockPass","passRush",lineDifferentialsPass,blockingPass,rushPass,skillDiffPassOptions);
			this.skillDifferential("receivingShort","shortCoverage",receivingDifferentialsShort,receivingShort,coverShort,skillDiffShortOptions);
			this.skillDifferential("receivingCrossing","crossingCoverage",receivingDifferentialsCrossing,receivingCrossing,coverCross,skillDiffCrossingOptions);
			this.skillDifferential("receivingLong","deepCoverage",receivingDifferentialsLong,receivingLong,coverLong,skillDiffLongOptions);
			////////////// LINE-ALL (need to split, run(each runner) ,pass
			/*console.log("line run: "+lineDifferentialsRun);
			console.log("line pass: "+lineDifferentialsPass);
			console.log("short: "+receivingDifferentialsShort);
			console.log("crossing: "+receivingDifferentialsCrossing);
			console.log("long: "+receivingDifferentialsLong);			*/
			
			
			
			//First time through (just short passes to receivers)
			
		//// create list  receive-short, just receivers, runners can run (3 and 1, this will be weighted higher, quick throw)
////////////////////			
			var l,skipped,blockingLanes;

			skipped = 0;
			firstTimeThrough = [];
			firstTimeDefense = [];
			firstTimeOffense = [];
			firstTimeBlocking = [];
			firstTimeRushing = [];			
			firstTimeType = [];

			/*console.log(receivingShort.length);
			console.log(receivingCrossing.length);
			console.log(receivingLong.length);
			console.log(coverShort.length);
			console.log(coverCross.length);
			console.log(coverLong.length);
			console.log(blockingPass.length);
			console.log(rushPass.length);
			console.log(blockingRun.length);
			console.log(rushRun.length);			*/
			
			
			for (k = 0; k < skillDiffShortOptions; k++) {		  
				
//				if ((this.team[this.o].player[ receivingShort[k]].pos == "RB")  || (this.team[this.o].player[ receivingShort[k]].pos == "TE") ) {
				if ((this.team[this.o].player[ receivingShort[k]].pos == "RB")  ) {
					skipped += 1;
//				} else {				
				} else if ((receivingDifferentialsShort.length>k) && (coverShort.length>k) && (receivingShort.length>k) && (blockingPass.length>k) && (rushPass.length>k) ){				

					firstTimeThrough.push(receivingDifferentialsShort[k]); //= receivingDifferentialsShort[k]+.5;
					firstTimeDefense.push(coverShort[k]); ///= coverShort[k];
					firstTimeOffense.push(receivingShort[k]); //= receivingShort[k];
					firstTimeBlocking.push(blockingPass[k]);// =blockingPass[k] ;
					firstTimeRushing.push(rushPass[k]);

					firstTimeType.push("shortPass") ;

				}
			}				
						
				
			for (l = 0; l < runningDetailed.length; l++) {		  

				for (k = 0; k < skillDiffRunOptions; k++) {		  
				   
				   // if non QB, only first two 0-1
				   // if QB all
					if ((k<2) && (this.team[this.o].player[runningSide[l]].pos != "QB") ) {
						
						firstTimeThrough.push( (lineDifferentialsRun[k]+this.team[this.o].player[runningDetailed[l]].compositeRating.runningSide*.25)/2 ); //= receivingDifferentialsShort[k]+.5;
						firstTimeDefense.push(rushRun[k]); ///= coverShort[k];
						firstTimeOffense.push(runningSide[l]); //= receivingShort[k];
						firstTimeBlocking.push(blockingRun[k]);// =blockingPass[k] ;
						firstTimeRushing.push(rushRun[k]);

						firstTimeType.push("runningSide") ;
						
						
						//// want to give runners - blocker - rusher
						//// right now not giving a rusher, blocker not being displayed later?
		
					}		
					if ((k>1) && (this.team[this.o].player[runningPower[l]].pos != "QB") ) {
						// only if non QB (from 2-on)
						if  ((lineDifferentialsRun.length>k) && (runningPower.length>l) && (rushRun.length>k) && (blockingRun.length>k) && (rushRun.length>k) ){				

							firstTimeThrough.push( (lineDifferentialsRun[k]+this.team[this.o].player[runningPower[l]].compositeRating.runningPower*.25)/2 ); //= receivingDifferentialsShort[k]+.5;
							firstTimeDefense.push(rushRun[k]); ///= coverShort[k];
							firstTimeOffense.push(runningPower[l]); //= receivingShort[k];
							firstTimeBlocking.push(blockingRun[k]);// =blockingPass[k] ;
							firstTimeRushing.push(rushRun[k]);
						
							firstTimeType.push("runningPower") ;
						}
	
					}
					//// too many options, cut to managable size (may want to expand this, lets see if the limit is normally hit)
					
				}							
				
			}							

			
			
			/////// makes sure ranking is done correction, correct values and sort
			
			
			var tempThrough;
			var tempDefense;
			var tempOffense;
			var tempBlocking;
			var tempRushing;
			var tempType;
			
			var tempRunning;

			/////// sort, give odds?
			/*console.log(firstTimeThrough.length+" "+firstTimeThrough);
			console.log(firstTimeDefense.length+" "+firstTimeDefense);	
			console.log(firstTimeOffense.length+" "+firstTimeOffense);	
			console.log(firstTimeBlocking.length+" "+firstTimeBlocking);	
			console.log(firstTimeRushing.length+" "+firstTimeRushing);	
			console.log(firstTimeType.length+" "+firstTimeType);*/
			//console.log(playersOnCourt);
			
			for (i = 0; i < (firstTimeType.length-1); i++) {		  
			
				for (k = (i+1); k < firstTimeType.length; k++) {		  
			
					if ( firstTimeThrough[k] > firstTimeThrough[i]) {
										
						tempThrough = firstTimeThrough[i]; //this.o
						tempDefense = firstTimeDefense[i]; //this.d
						tempOffense = firstTimeOffense[i]; //this.o
						tempBlocking = firstTimeBlocking[i]; // this.o			
						tempRushing = firstTimeRushing[i];	// this.d				
						tempType = firstTimeType[i];									
					
						firstTimeThrough[i] = firstTimeThrough[k];
						firstTimeDefense[i] = firstTimeDefense[k];
						firstTimeOffense[i] = firstTimeOffense[k];
						firstTimeBlocking[i] = firstTimeBlocking[k];							
						firstTimeRushing[i] = firstTimeRushing[k];							
						firstTimeType[i] = firstTimeType[k];										

						firstTimeThrough[k] = tempThrough;
						firstTimeDefense[k] = tempDefense;
						firstTimeOffense[k] = tempOffense;
						firstTimeBlocking[k] = tempBlocking;							
						firstTimeRushing[k] = tempRushing;							
						firstTimeType[k] = tempType;	
					}					
				}
			}
		
		////////////	console.log("end team 1st time");
			/////// t1 plays
			/////// t2 plays (repeated?)
////////////////////						
			
			// initial running sucess based on line, how much after based on running back  (no QB run in first series?)
			// if top two line are strong (run outside)
			// if rest are strong run inside
			
			
			/////////////////////////////////////////////Second time through (just short pass to TE, short and crossing to WR)
			////////////////////////////////////////////
		//////////////////////////////////////
		
		
		
		//////////////////////// DO SECOND TIME THROUGH - USE SAME STANDARD AS FIRST TIME THROUGH (THEN REPEAT FOR 3RD) - very close to finished , then can start actual game
		
		
		
		//// create list  receive-short, just receivers, runners can run (3 and 1, this will be weighted higher, quick throw)
////////////////////			

			
			var q;
					  
			var l,skipped,blockingLanes;

			skipped = 0;
			
			secondTimeThrough = [] ; // top 11 plays?
			secondTimeOffense = [] ; // who player is
			secondTimeDefense = [] ; // who player is
			secondTimeBlocking= [] ; // who player is
			secondTimeRushing = [] ; // who player is
			secondTimeTackling = [] ; // who player is
		
			secondTimeType = [];
			
			for (k = 0; k < skillDiffShortOptions; k++) {		  
				
				//// allowing TE on short
				if ((this.team[this.o].player[ receivingShort[k]].pos == "RB")  ) {
					//skipped += 1;
				} else {
				
					if  ((receivingDifferentialsShort.length>k) && (coverShort.length>k) && (receivingShort.length>k) && (blockingPass.length>k) && (rushPass.length>k) ){								

						secondTimeThrough.push(receivingDifferentialsShort[k]);
						secondTimeDefense.push(coverShort[k]);
						secondTimeOffense.push(receivingShort[k]);

						secondTimeBlocking.push(blockingPass[k]);
						secondTimeRushing.push(rushPass[k]);

						secondTimeType.push("shortPass");
					}
				}										
			}		


			for (k = 0; k < skillDiffCrossingOptions; k++) {		  
								//// crossing
				if ((this.team[this.o].player[ receivingCrossing[k]].pos == "RB") || (this.team[this.o].player[receivingCrossing[k]].pos == "TE")  ) {
					//skipped += 1;
				} else {

					if  ((receivingDifferentialsCrossing.length>k) && (coverCross.length>k) && (receivingCrossing.length>k) && (blockingPass.length>k) && (rushPass.length>k) ){								

						secondTimeThrough.push(receivingDifferentialsCrossing[k]);
						secondTimeDefense.push(coverCross[k]);
						secondTimeOffense.push(receivingCrossing[k]);
						secondTimeBlocking.push(blockingPass[k]);
						secondTimeRushing.push(rushPass[k]);

						secondTimeType.push("crossingPass");
						
					}

				}			
			}		
						
			
			// no rushing second time (QB is third time) (only edge rushing, nothing down the middle)
			for (l = 0; l < runningDetailed.length; l++) {		  
				for (k = 0; k < skillDiffRunOptions; k++) {		  
				   
				   // if non QB, only first two 0-1
				   // if QB all
					if ((k<2) && (this.team[this.o].player[runningSide[l]].pos == "QB") ) {
//						secondTimeThrough.push( (lineDifferentialsRun[k]+this.team[this.o].player[runningDetailed[l]].compositeRating.runningSide*.25)/2);
						if ( Math.pow(this.team[this.o].player[runningDetailed[l]].compositeRating.runningSide+.25,2)-.25>Math.random() ) {
							secondTimeThrough.push( (this.team[this.o].player[runningDetailed[l]].compositeRating.runningSide-.55)*.8);
							secondTimeDefense.push(rushRun[k]);
							secondTimeOffense.push(runningSide[l]);
							secondTimeBlocking.push(blockingRun[k]);
							secondTimeRushing.push(rushRun[k]);												

							secondTimeType.push("runningSide") ;					
						}
					}							
				}											
			}							
			
			
			/////// makes sure ranking is done correction, correct values and sort
			
			
			var tempThrough;
			var tempDefense;
			var tempOffense;
			var tempRunning;
			var tempType;
			
			for (i = 0; i < (secondTimeType.length); i++) {		  
			}
			/////// sort, give odds?
			for (i = 0; i < (secondTimeType.length-1); i++) {		  
				for (k = (i+1); k < secondTimeType.length; k++) {		  
			
					if ( secondTimeThrough[k] > secondTimeThrough[i]) {
										
						tempThrough = secondTimeThrough[i];
						tempDefense = secondTimeDefense[i];
						tempOffense = secondTimeOffense[i];
						tempBlocking = secondTimeBlocking[i];					
						tempRushing = secondTimeRushing[i];					
						tempType = secondTimeType[i];					
					
						secondTimeThrough[i] = secondTimeThrough[k];
						secondTimeDefense[i] = secondTimeDefense[k];
						secondTimeOffense[i] = secondTimeOffense[k];
						secondTimeBlocking[i] = secondTimeBlocking[k];							
						secondTimeRushing[i] = secondTimeRushing[k];							
						secondTimeType[i] = secondTimeType[k];							

						secondTimeThrough[k] = tempThrough;
						secondTimeDefense[k] = tempDefense;
						secondTimeOffense[k] = tempOffense;
						secondTimeBlocking[k] = tempBlocking;							
						secondTimeRushing[k] = tempRushing;							
						secondTimeType[k] = tempType;							
												
					}
				}
			}
			
			//Third time through (RB short, TE short crossing, WR all) (opens up QB run)
			// can repeat third until pass, sack, or QB run
			
			//Third time through (no room for deep)
			
		
		
		//// create list  receive-short, just receivers, runners can run (3 and 1, this will be weighted higher, quick throw)
////////////////////			

			
			var q;
			var l,skipped,blockingLanes;

			skipped = 0;

			thirdTimeThrough = [] ; // top 11 plays?
			thirdTimeOffense = [] ; // who player is
			thirdTimeDefense = [] ; // who player is
			thirdTimeBlocking= [] ; // who player is
			thirdTimeRushing = [] ; // who player is
			thirdTimeTackling = [] ; // who player is					
			
			thirdTimeType = [];
			for (k = 0; k < skillDiffShortOptions; k++) {		  
				

				if  ((receivingDifferentialsShort.length>k) && (coverShort.length>k) && (receivingShort.length>k) && (blockingPass.length>k) && (rushPass.length>k) ){								

					thirdTimeThrough.push(receivingDifferentialsShort[k]);
					thirdTimeDefense.push(coverShort[k]);
					thirdTimeOffense.push(receivingShort[k]);
					thirdTimeBlocking.push(blockingPass[k]);
					thirdTimeRushing.push( rushPass[k]);
					
					thirdTimeType.push("shortPass") ;
					
				}
				
			}		

			for (k = 0; k < skillDiffCrossingOptions; k++) {		  
								//// crossing
				if ((this.team[this.o].player[ receivingCrossing[k]].pos == "RB") ) {
					//skipped += 1;
				} else {
				
					if  ((receivingDifferentialsCrossing.length>k) && (coverCross.length>k) && (receivingCrossing.length>k) && (blockingPass.length>k) && (rushPass.length>k) ){								

						thirdTimeThrough.push(receivingDifferentialsCrossing[k]);
						thirdTimeDefense.push(coverCross[k]);
						thirdTimeOffense.push(receivingCrossing[k]);
						thirdTimeBlocking.push(blockingPass[k]);
						thirdTimeRushing.push( rushPass[k]);
						
						thirdTimeType.push("crossingPass");
					}
				}			
			}		


			for (k = 0; k < skillDiffLongOptions; k++) {		  
								//// crossing
				if ((this.team[this.o].player[ receivingLong[k]].pos == "RB") || (this.team[this.o].player[ receivingLong[k]].pos == "TE")) {
					//skipped += 1;
				} else {
				
					if  ((receivingDifferentialsLong.length>k) && (coverLong.length>k) && (receivingLong.length>k) && (blockingPass.length>k) && (rushPass.length>k) ){								

						thirdTimeThrough.push(receivingDifferentialsLong[k]);
						thirdTimeDefense.push(coverLong[k]);
						thirdTimeOffense.push(receivingLong[k]);
						thirdTimeBlocking.push(blockingPass[k]);
						thirdTimeRushing.push( rushPass[k]);
						
						thirdTimeType.push("longPass") ;
					
					}
				}			
			}		
			
			
			// no rushing third time (QB is third time) (only edge rushing, nothing down the middle)
			for (l = 0; l < runningDetailed.length; l++) {		  			
				for (k = 0; k < skillDiffRunOptions; k++) {		  				   
				   // if non QB, only first two 0-1
				   // if QB all
					if ((k<2) && (this.team[this.o].player[runningSide[l]].pos == "QB") ) {
//						thirdTimeThrough.push( (lineDifferentialsRun[k]+this.team[this.o].player[runningDetailed[l]].compositeRating.runningSide*.25)/2);
						if ( Math.pow(this.team[this.o].player[runningDetailed[l]].compositeRating.runningSide+.25,2)-.25>Math.random() ) {

							thirdTimeThrough.push( (this.team[this.o].player[runningDetailed[l]].compositeRating.runningSide-.55)*.8);
							thirdTimeDefense.push(rushRun[k]);
							thirdTimeOffense.push(runningSide[l]);
							thirdTimeBlocking.push(blockingRun[k]);
							thirdTimeRushing.push(rushRun[k]);						
							thirdTimeType.push("runningSide");	
						}
					}		
					//// too many options, cut to managable size (may want to expand this, lets see if the limit is normally hit)				
				}											
			}										
			
			/////// makes sure ranking is done correction, correct values and sort			
			
			var tempThrough;
			var tempDefense;
			var tempOffense;
			var tempRunning;
			var tempType;
			
			/*for (i = 0; i < (thirdTimeType.length); i++) {		  
			}*/
			/////// sort, give odds?
			for (i = 0; i < (thirdTimeType.length-1); i++) {		  
				for (k = (i+1); k < thirdTimeType.length; k++) {		  
                //console.log("b i "+i+" FTT "+thirdTimeThrough[i]+ " k "+k +" FTTk " +thirdTimeThrough[k]);					
			
					if ( thirdTimeThrough[k] > thirdTimeThrough[i]) {
					
					
						tempThrough = thirdTimeThrough[i];
						tempDefense = thirdTimeDefense[i];
						tempOffense = thirdTimeOffense[i];
						tempBlocking = thirdTimeBlocking[i];					
						tempRushing = thirdTimeRushing[i];					
						tempType = thirdTimeType[i];					
				//		tempRunning = thirdTimeRunning[this.o][i];					
					
						thirdTimeThrough[i] = thirdTimeThrough[k];
						thirdTimeDefense[i] = thirdTimeDefense[k];
						thirdTimeOffense[i] = thirdTimeOffense[k];
						thirdTimeBlocking[i] = thirdTimeBlocking[k];							
						thirdTimeRushing[i] = thirdTimeRushing[k];							
						thirdTimeType[i] = thirdTimeType[k];							

						thirdTimeThrough[k] = tempThrough;
						thirdTimeDefense[k] = tempDefense;
						thirdTimeOffense[k] = tempOffense;
						thirdTimeBlocking[k] = tempBlocking;							
						thirdTimeRushing[k] = tempRushing;							
						thirdTimeType[k] = tempType;													
					}					
				}
			}					
			////////////// rank matchups from offense point of view
			
			/////// once this is done can start actually doing downs, and run the game (hopefully happens quickly)
			/////// need to balance run/pass
			
			/////// after catch, and tackling big issue
			
			//////////////								 
		}	

		
	/*	console.log(firstTimeThrough.length+" "+"first time: "+firstTimeThrough);
		console.log(secondTimeThrough.length+" "+"second time: "+secondTimeThrough);
		console.log(thirdTimeThrough.length+" "+"third time: "+thirdTimeThrough);
		console.log(firstTimeOffense.length+" "+"first time O: "+firstTimeOffense);
		console.log(secondTimeOffense.length+" "+"second time O: "+secondTimeOffense);
		console.log(thirdTimeOffense.length+" "+"third time O: "+thirdTimeOffense);
		console.log(this.playersOnCourt.length+" "+"this.playersOnCourt: "+this.playersOnCourt); */
		
		
		///// then matchups, with #player adjustments (calc odds of pass or run play called) (those odds also influenced by downs, yardage, field position, and score)
		
			
		var driveActive,toFirst,yardsOnPlay,playProb,yardsProb;
		var timeThroughProb;

		var playType;
		var timeThrough;	
		var playerOfType;
		var p;
		var fieldGoal,kickPunt;
		var probMakeFieldGoal;
		var rawFieldPosition,rawFieldPosition1,rawFieldPosition2;
		var finalFieldPosition;		
		var touchback ;
		var passOrSack;
		var downAdj;
		var pureRush;
		
		passOrSack = 0;
		//////////// universal?
		driveActive = 1;
		toFirst = 10;
		yardsOnPlay = 0;
		touchback = 0;		
 
				
		if ( (driveNumber[this.o]+driveNumber[this.d]) == 0) {
		  fieldPosition = 20;
		}


		if (fromPunt == 1) {
			fieldPosition *= -1;
			fieldPosition += 100;		  
			fromPunt = 0;
		} else {

		  if ( (fieldPosition >= 100) || (fieldPosition <= 0) ||  ((driveNumber[this.o]+driveNumber[this.d]) == 0) ) {
		    
//			 rawFieldPosition = 61.8+this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.kickOff*3
			 rawFieldPosition = random.realGauss(0, 1)*5+61.8+this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.kickOff*3;
		//	 console.log(rawFieldPosition);
			 //rawFieldPosition += ;
//			 rawFieldPosition = random.randInt(20, 200)*this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.kickOff;
			 finalFieldPosition = Math.round(rawFieldPosition);
			 fieldPosition = 65;
			 fieldPosition -= finalFieldPosition;
			 if (fieldPosition <= 0) {
			   fieldPosition = 20;
			   touchback = 1;
			 } else {
			   
			   fieldPosition += Math.abs(Math.round(random.realGauss(0, 10))); 
			 }
		//	 console.log(fieldPosition);			 
			if (touchback == 0) {
				p= this.playersOnCourt[this.d][22];
				playDown = 1;
				toFirst = 10;			
				this.recordPlay("kickoff", this.o, [this.team[this.d].player[p].name],finalFieldPosition,playDown,toFirst,fieldPosition);		
				this.t -= Math.random()/4+(1-yardsOnPlay/100);		
				
			} else {
				p= this.playersOnCourt[this.d][22];
				playDown = 1;
				toFirst = 10;			
			   touchback = 0;
			   this.recordPlay("kickoffTouch", this.o, [this.team[this.d].player[p].name],finalFieldPosition,playDown,toFirst,fieldPosition);		
				this.t -= Math.random()/10+(1-yardsOnPlay/100);		
			   
			}
		  } else {
			fieldPosition *= -1;
			fieldPosition += 100;		  
		  }
		}

		driveNumber[this.o] += 1;
		
		p= this.playersOnCourt[this.o][22];
		playDown = 1;
		toFirst = 10;

		
		
	
		var playPicked;
		var timeType;
		var quarterActive;
		var thirdDown;
		var newDrive;
		var redZone;
		var timePlay;
		var interception,fumble;
		var puntLength;
		var rushSum;
		var sackPlayer;
		var gaveUpSack;
		var sackProb;
		var runStuffSum;
		var coverSum;
		var fatigue;
		
		var ratios;
		var iTemp;
		
		sackPlayer = 100;
		gaveUpSack = 100;
		sackProb = 0;
		if (this.t >45) {
		  quarterActive = 1;
		} else if (this.t >30) {
		  quarterActive = 2;
		} else if (this.t >15) {
		  quarterActive = 3;
		} else {
		  quarterActive = 4;
		}
		
		this.dt = 0;
		thirdDown = 0;		
		newDrive = 0;
		redZone = 0;
		interception = 0;
		fumble = 0;
		puntLength = 0;
		while (driveActive == 1) {		
			playDown = 1;			
			while (playDown < 5) {

				//console.log(this.o+" "+playDown+" "+fieldPosition);
				
			    if ((fieldPosition>=80) && (redZone == 0)) {
				  redZone = 1;
  				  this.recordStat(this.o, this.playersOnCourt[this.o][0], "rza");		
				}
				if ((newDrive == 1) && (playDown == 1)) {
					this.recordStat(this.o, this.playersOnCourt[this.o][0], "fdt");		
					this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfd");		
					if (playType > 2) {
						this.recordStat(this.o, this.playersOnCourt[this.o][0], "fdp");		
						this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfdp");		
					  
					} else {
						this.recordStat(this.o, this.playersOnCourt[this.o][0], "fdr");		
						this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfdr");		
					}
				} else {
					newDrive = 1;
				}
								
				if (playDown < 4) {
				
					for (i = 0; i < 11; i++) {		  				
						this.recordStat(this.o, this.playersOnCourt[this.o][i], "olc");		
						this.recordStat(this.d, this.playersOnCourt[this.d][i+11], "dec");		
					}
				}
				if ((thirdDown == 1) && (playDown == 1)) {
					this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");						  
				}
				if (playDown == 3) {
  				  this.recordStat(this.o, this.playersOnCourt[this.o][0], "tda");						  
				  thirdDown = 1;
				} else {
				  thirdDown = 0;
				}
				playPicked = 0;
				playNumber += 1;
										yardsProb = Math.random() ;
											yardsProb *= 1+(1-yardsProb)/10;
										
	////////////		console.log("Yardes Prob new every down: " +yardsProb);
			 //////////////////   this.doDown; // create procedure doDown (or play), from there it should go quiockly (feed back time, driveActive, touchdown, fg, ep)
				//// for now just write it, later can make it this.doDown
				
//				if (playDown == 1) {
				//// for now each down equal, fourth should include a punt, also based on time, etc could have other things
	//			if (playDown < 5) {
				
					//// odds change based on down and yards
				
				///// Field goal?
				
				//// kicker
				//// distance
				//// score
				//// time
				fieldGoal = 0;
				timeType = 0;
				kickPunt = 0;
				playerOfType = 100;
				
				if ( (playDown == 4) && (fieldPosition>55) || ((fieldPosition>50) && (this.t >= 30) && (this.t <= 30.25) ) || ((this.t <= 0.25) && (this.team[this.o].stat.pts <= this.team[this.d].stat.pts) && (this.team[this.o].stat.pts+3 >= this.team[this.d].stat.pts) && (fieldPosition>40) ) ) {
				
					if ((this.t >= 30) && (this.t <= 30.25) ) {
					   this.t = 30;
					}
					if ((this.t < .25)  ) {
					   this.t = 0;
					}					
												
					probMakeFieldGoal = this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal;
					this.recordStat(this.o, this.playersOnCourt[this.o][22], "fgaAtRim");		
					this.recordStat(this.o, this.playersOnCourt[this.o][22], "puntl");		
					if (fieldPosition > 90) {
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgzea");		
					} else if (fieldPosition > 80) {
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgtwa");		
					} else if (fieldPosition > 70) {
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgtha");		
					} else if (fieldPosition > 60) {
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgfoa");		
					
					} else {
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgfia");		
					}
					if ((Math.random()*Math.random()*Math.random())<(fieldPosition/100*fieldPosition/100*fieldPosition/100*this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal)) {
					
//						this.recordStat(this.o, 22, "pts",3);		
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "pts",3);		
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fgAtRim");		
						p= this.playersOnCourt[this.o][22];
						this.recordPlay("fg", this.o, [this.team[this.o].player[p].name],110-fieldPosition);	
						if (fieldPosition > 90) {
							this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgze");		
						} else if (fieldPosition > 80) {
							this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgtw");		
						} else if (fieldPosition > 70) {
							this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgth");		
						} else if (fieldPosition > 60) {
							this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgfo");		
						
						} else {
							this.recordStat(this.o, this.playersOnCourt[this.o][22], "fldgfi");		
						}						

						fieldGoal = 1;						
						fieldPosition = 110;
					} else {
						p= this.playersOnCourt[this.o][22];
						playDown = 1;
						toFirst = 10;
						this.recordPlay("fgm", this.d, [this.team[this.o].player[p].name],110-fieldPosition,playDown,toFirst,100-fieldPosition);	
						fieldGoal = 1;					
					}
				} else if ((playDown == 4) && (((this.t >= 2) && ((this.t >= 30.25) || (this.t <= 30))) ||  (this.team[this.o].stat.pts > this.team[this.d].stat.pts)) )  {
				    
					//// punting skill

// seperate out, test more

//                    rawFieldPosition1 = random.randInt(20, 80)*this.team[this.o].player[this.playersOnCourt[this.o][23]].compositeRating.punting;
//                    rawFieldPosition2 = random.randInt(20, 80)*this.team[this.o].player[this.playersOnCourt[this.o][23]].compositeRating.punting;
                  /*  rawFieldPosition1 = random.randInt(40, 80)*this.team[this.o].player[this.playersOnCourt[this.o][23]].compositeRating.punting;
                    rawFieldPosition2 = random.randInt(40, 80)*this.team[this.o].player[this.playersOnCourt[this.o][23]].compositeRating.punting;
					if (rawFieldPosition1>rawFieldPosition2) {
						rawFieldPosition = rawFieldPosition1;
					} else {
						rawFieldPosition = rawFieldPosition2;						
					}*/
            //        rawFieldPosition2 = Math.round(37+this.team[this.o].player[this.playersOnCourt[this.o][23]].compositeRating.punting*9);
			//		finalFieldPosition = random.randInt(rawFieldPosition2-15, rawFieldPosition2+15);	

					finalFieldPosition = Math.round(random.realGauss(0, 1)*5+37+this.team[this.o].player[this.playersOnCourt[this.o][23]].compositeRating.punting*9);
					
//					finalFieldPosition = Math.round(rawFieldPosition);	
				//	puntLength = fieldPosition;
					fieldPosition += finalFieldPosition;
				//	puntLength *= -1;
				//	puntLength += fieldPosition;
					puntLength = finalFieldPosition
					this.recordStat(this.o, this.playersOnCourt[this.o][23], "puntty",puntLength);		
					kickPunt = 1;
					this.recordStat(this.o, this.playersOnCourt[this.o][23], "punta");		
					this.recordStat(this.o, this.playersOnCourt[this.o][23], "puntl");						
					if (fieldPosition>=100) {
						fieldPosition = 80;					
						p= this.playersOnCourt[this.o][23];
						playDown = 1;
						toFirst = 10;
						//touchback = 0;
						this.recordPlay("puntTouch", this.d, [this.team[this.o].player[p].name],finalFieldPosition,playDown,toFirst,100-fieldPosition);		
						this.recordStat(this.o, this.playersOnCourt[this.o][23], "punttb");		
						
						fromPunt = 1;
					} else {
					
						p= this.playersOnCourt[this.o][23];
						playDown = 1;
						toFirst = 10;
						this.recordPlay("punt", this.d, [this.team[this.o].player[p].name],finalFieldPosition,playDown,toFirst,100-fieldPosition);		
						fromPunt = 1;
					}
				} else {
						rushSum = 0;
						pureRush = 0;
						runStuffSum = 0;
						var maxSackProb, sackSkill;
						maxSackProb = 0;
						sackSkill = [];
						  // rushing and blocking match,
						  // once blockers run out still want to include all rushers.
						
						//console.log(firstTimeBlocking.length+" "+firstTimeRushing.length);						
						//console.log("block: "+firstTimeBlocking+" rush: "+firstTimeRushing);						
						
//						for (i = 0; i < 5; i++) {		    
								//console.log(sackProb);
						sackPlayer = 100;
						gaveUpSack = 100;
						
						for (i = 0; i < firstTimeBlocking.length; i++) {		    

//                            if 	((firstTimeBlocking[i] < 100) && 	(firstTimeRushing[i]<100)) {		  
                            if 	(firstTimeRushing.length>i+1) {		  
								rushSum += (this.team[this.d].player[firstTimeRushing[i]].compositeRating.passRush*this.team[this.d].player[i].stat.energy - this.team[this.o].player[firstTimeBlocking[i]].compositeRating.blockPass*this.team[this.o].player[i].stat.energy);
								pureRush += (this.team[this.d].player[firstTimeRushing[i]].compositeRating.passRush*this.team[this.d].player[i].stat.energy + this.team[this.d].player[firstTimeRushing[i]].compositeRating.runStop*this.team[this.d].player[i].stat.energy)/2/firstTimeBlocking.length;
								runStuffSum += (this.team[this.d].player[firstTimeRushing[i]].compositeRating.runStop*this.team[this.d].player[i].stat.energy - this.team[this.o].player[firstTimeBlocking[i]].compositeRating.blockRun*this.team[this.o].player[i].stat.energy);
						//		coverSum += (this.team[this.d].player[firstTimeRushing[i]].compositeRating.crossingCoverage - this.team[this.o].player[firstTimeBlocking[i]].compositeRating.blockRun);
								sackProb = ((this.team[this.d].player[firstTimeRushing[i]].compositeRating.passRush*2.0 - this.team[this.o].player[firstTimeBlocking[i]].compositeRating.blockPass))/2;
								sackSkill.push(sackProb*100);
//								sackProb = ((this.team[this.d].player[firstTimeRushing[i]].compositeRating.passRush*1.5 - this.team[this.o].player[firstTimeBlocking[i]].compositeRating.blockPass))/2;
//								sackProb = ((this.team[this.d].player[firstTimeRushing[i]].compositeRating.passRush - this.team[this.o].player[firstTimeBlocking[i]].compositeRating.blockPass)+.1)/2;
//								sackProb = ((this.team[this.d].player[firstTimeRushing[i]].compositeRating.passRush*this.team[this.d].player[i].stat.energy*1.5 - this.team[this.o].player[firstTimeBlocking[i]].compositeRating.blockPass*this.team[this.o].player[i].stat.energy)+.1)/2;
								//console.log(this.team[this.d].player[firstTimeRushing[i]].compositeRating.passRush+" "+this.team[this.o].player[firstTimeBlocking[i]].compositeRating.blockPass+" "+this.team[this.d].player[i].stat.energy+" "+this.team[this.o].player[i].stat.energy+" "+sackProb);
							//	console.log(sackProb);
							}
							if (playDown == 3) {
								downAdj = 1+(thirdDownAdj*2-2.2*pureRush-.5)*.5;
								//console.log(downAdj);
							} else {
								downAdj = 1;					
							}							
							if ((Math.random() < sackProb) && (sackProb>maxSackProb) ) {
//							if ((Math.random() < sackProb)  && (sackPlayer==100)) {
								sackPlayer = firstTimeRushing[i];
								gaveUpSack = firstTimeBlocking[i];
							} else {
//								sackPlayer = 100;
	//							gaveUpSack = 100;
							}

						}
						if (sackPlayer == 100) {
								sackPlayer = firstTimeRushing[0];
								gaveUpSack = firstTimeBlocking[0];
						}
						
					//	ratios = this.ratingArray("shootingMidRange", this.o,2.0); //1.5
					//	shooter = this.pickPlayer(ratios);
						//ratios = this.ratingArray("passRush", this.d,1.0); //1.5
//						    GameSim.prototype.ratingArraySimplest = function (player, rating, t, power) {
						////ratios = this.ratingArraySimplest(firstTimeRushing,"passRush",this.d,2);
//						ratios = this.ratingArraySimple(firstTimeThrough,1);
						////sackPlayer = this.pickPlayerVariable(ratios,firstTimeRushing.length);
						//pickPlayerVariable
					//	console.log(sackSkill);
						ratios = this.ratingArraySimple(sackSkill,1);
					//	console.log(ratios);						
					//	console.log(firstTimeRushing.length);						
						sackPlayer = this.pickPlayerVariable(ratios,firstTimeRushing.length);
						sackPlayer = firstTimeRushing[sackPlayer];
						gaveUpSack = firstTimeBlocking[sackPlayer];						
					//	console.log(sackPlayer);												

					//	console.log(ratios);
					//	console.log(sackPlayer);
					//
						
						rushSum /=5;
						runStuffSum /=5;
						rushSum /=3;
						runStuffSum /=3;
					//	coverSum /= 5;
						
						if ((this.t <= 0.25) && (this.team[this.o].stat.pts < this.team[this.d].stat.pts) && (fieldPosition<95) ) {
							timeThroughProb = 1 ;
						} else if ((this.t <= 1) && (this.team[this.o].stat.pts < this.team[this.d].stat.pts) && (fieldPosition<60) ) {
							timeThroughProb = 1 ;
						} else if ((this.t <= .25) && (this.team[this.o].stat.pts > this.team[this.d].stat.pts)  ) {
							timeThroughProb = 0 ;
						} else {
							timeThroughProb = Math.random() ;
						}

						//console.log(rushSum);
						//this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.avoidSack			

						if ( ((timeThroughProb < (rushLevel+rushSum*rushImpact) ) && (firstTimeType.length>0) ) || ( (secondTimeType.length==0) && (firstTimeType.length>0) ) ) {
											timeType = 1;							  
							//while (playPicked == 0) {
								//for (i = 0; i < firstTimeType.length; i++) {		  
								  //  fatigue = this.fatigue(this.team[this.o].player[firstTimeOffense[i]].stat.energy);
									
									// Pick play
									//ratios = this.ratingArray("usage", this.o);
									//shooter = this.pickPlayer(ratios);
									//ratios = this.ratingArray(firstTimeThrough); // use first Time Through instead
									//i = this.pickPlayer(ratios);

									
									for (i = 0; i < firstTimeType.length; i++) {										
										if (firstTimeType[i] == "runningSide" || firstTimeType[i] == "runningPower" ) {
											firstTimeThrough[i] *= runPass;																			
										} else {
											firstTimeThrough[i] /= runPass;									
										}										
										firstTimeThrough[i] += runPassPlus;																																						
									}
									
									ratios = this.ratingArraySimple(firstTimeThrough,1);
									iTemp = this.pickPlayerVariable(ratios,firstTimeThrough.length);

									
//									playProb = (((firstTimeThrough[i])+.0)/3)-(.1-fatigue/10)*2+.05;
									//console.log(firstTimeThrough[i]+" "+fatigue+" "+playProb);
									
									for (i = 0; i < firstTimeType.length; i++) {										
										firstTimeThrough[i] -= runPassPlus;																																															
										if (firstTimeType[i] == "runningSide" || firstTimeType[i] == "runningPower" ) {
											firstTimeThrough[i] /= runPass;																			
										} else {
											firstTimeThrough[i] *= runPass;									
										}										
									}							
									i = iTemp;
									playProb = firstTimeThrough[i];
									
									if (typeof(i) == 'undefined') {
										console.log(ratios);			
										console.log(firstTimeThrough);
										console.log(firstTimeThrough.length);
										
		console.log(firstTimeThrough.length+" "+"first time: "+firstTimeThrough);
		console.log(secondTimeThrough.length+" "+"second time: "+secondTimeThrough);
		console.log(thirdTimeThrough.length+" "+"third time: "+thirdTimeThrough);
		console.log(firstTimeOffense.length+" "+"first time O: "+firstTimeOffense);
		console.log(secondTimeOffense.length+" "+"second time O: "+secondTimeOffense);
		console.log(thirdTimeOffense.length+" "+"third time O: "+thirdTimeOffense);
		console.log(this.playersOnCourt.length+" "+"this.playersOnCourt: "+this.playersOnCourt);
										
									}									
									
									
								/*	if (playProb<.05) {
									  playProb = .05;
									}*/
									
								/*	if (firstTimeType.length == 1) {
									  playProb = 2;
									}*/
									
								//	if ( (Math.random()*1.5) < (playProb+.5) ) {
							   
										if ((firstTimeType[i]) == "runningSide") {											

											playType = 1;
											timeThrough = 1;		
											playerOfType = i;			
											///// yardage for earch type of play, impacted by location(just cap at max yards), player skill?, player position?
											///// depending on where play ends, determines who tackles
											///// also determines who misses tackles?
											
											///// for running really about missed tackles and how big a whole
											///// could do get to 5 yard line? then based on missed tackles say how much later
											
											///// for passing, want sack odds, pass/catch odds, run after play odds
											
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+runYards;
											//yardsProb *= runRange;
						//					console.log(runStuffSum+" "+playProb);
											yardsProb += playProb*runRange-runStuffSum*lineRange+runBoost;															
											
											
											
											if (yardsProb <.80) {
												yardsProb *= downAdj;											
												//yardsProb -= runStuffSum;											
												//yardsProb += playProb/2*runYards-.03;
											} else if (yardsProb <.90) { 
//												yardsProb *= 1.01;											
												//yardsProb *= 1.01;											
												//yardsProb -= runStuffSum/2;											
												//yardsProb += playProb/2*runYards-.03;
											} else if (yardsProb <.95) { 
												//yardsProb *= 1.005;											
												//yardsProb -= runStuffSum/4;											
												//yardsProb += playProb/10*runYards;
											} else if (yardsProb <.98) { 
												//yardsProb *= 1.002;											
												//yardsProb -= runStuffSum/10;											
												//yardsProb += playProb/100*runYards;
											} else  { 
												//yardsProb += playProb/100*runYards;
											}											
											yardsOnPlay = this.rushingYards(yardsProb);
											if (Math.random() < (.013*(1-playProb) )) {
												fumble = 1;
											}
											playPicked = 1;
										} else if ((firstTimeType[i]) == "runningPower") {										
											playType = 2;
											timeThrough = 1;		
											playerOfType = i;	
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+runYards;
											//yardsProb *= runRange;
											yardsProb += playProb*runRange-runStuffSum*lineRange+runBoost;	
											yardsProb *= downAdj;											
											if (yardsProb <.80) {
											//	yardsProb *= 1.05;											
												
												//yardsProb -= runStuffSum;											
												//yardsProb += playProb/2*runYards-.03;
											} else if (yardsProb <.90) { 
											//	yardsProb *= .99;											
												//yardsProb -= runStuffSum/2;											
												//yardsProb += playProb/2*runYards-.03;
											} else if (yardsProb <.95) { 
											//	yardsProb *= .995;											
												//yardsProb -= runStuffSum/4;											
												//yardsProb += playProb/10*runYards;
											} else if (yardsProb <.98) { 
											//	yardsProb *= .998;											
												//yardsProb -= runStuffSum/10;											
												//yardsProb += playProb/100*runYards;
											} else  { 
												//yardsProb += playProb/100*runYards;
											}									
											// same function?
											yardsOnPlay = this.rushingYards(yardsProb,yardsOnPlay);
											if (Math.random() < (.013*(1-playProb) )) {
												fumble = 1;
											}
											playPicked = 1;											
										} else if ((firstTimeType[i]) == "shortPass") {
										// new function for passes
										// same with adj yardsProb?
										// or diff?
										// tiered - sack, catch , run after?
										// or do like run, have those reversed engineered?
										
											playType = 3;
											timeThrough = 1;		
											playerOfType = i;	
										
										// Short Pass
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+passYards;
											//yardsProb *= passRange;
											yardsProb += playProb*passRange+passBoost;											
											
											// short pass
											//yardsProb *= .8;	
											yardsProb *= downAdj;											
											if (yardsProb < 0.059) {
		//										yardsProb += playProb/10
												//yardsProb -= .005;
												//yardsProb += playProb/10*passYards;
											} else if (yardsProb <.439) { 
											// less chance of incomplete
												//yardsProb -= .10;
												//yardsProb += playProb/2*passYards-.09;
												//playProb/100;
											} else if (yardsProb < .733) { 
												//yardsProb -= .10;
												//yardsProb += playProb/2*passYards-.09;
											} else if (yardsProb <.90) { 
												//yardsProb -= .10;
												//yardsProb += playProb/2*passYards-.09;
											} else if (yardsProb <.95) { 
												//yardsProb -= .05;
												//yardsProb += playProb/100*passYards;
											} else  { 
											// 2% cushion, that is removed at top
												//yardsProb -= .02;
												//yardsProb += playProb/100*passYards;
											} 									
											
		//									this.passingYards(yardsProb,yardsOnPlay);
											yardsOnPlay = this.passingYards(yardsProb);
											if (yardsOnPlay>0) {
												if (Math.random() < (.045+(.160-playProb)*.12 )*.66) {
													interception = 1;
												}
											}
											if (interception == 0 ) {
												if (Math.random() < (.013*(1-playProb) )) {
														fumble = 1;
												}
											}
											
											playPicked = 1;	
										
										}
										//i = firstTimeType.length;
									//}									
								//}								
						 //   }
						 // was 0.85
						} else if ( ((timeThroughProb < (rushLevel+rushSum*rushImpact)*3/2) && (secondTimeType.length>0) ) || ( (thirdTimeType.length==0) && (secondTimeType.length>0) )) {
						   // second time trough		
											timeType = 2;	
							//while (playPicked == 0) {
								//for (i = 0; i < secondTimeType.length; i++) {		  

									for (i = 0; i < secondTimeThrough.length; i++) {										
										if (secondTimeType[i] == "runningSide" || secondTimeType[i] == "runningPower" ) {
											secondTimeThrough[i] *= runPass;																			
										} else {
											secondTimeThrough[i] /= runPass;									
										}										
										secondTimeThrough[i] += runPassPlus;									
									}
									
								
									ratios = this.ratingArraySimple(secondTimeThrough,1);
									iTemp = this.pickPlayerVariable(ratios,secondTimeThrough.length);
								
//								    fatigue = this.fatigue(this.team[this.o].player[secondTimeOffense[i]].stat.energy);
//									playProb = (((secondTimeThrough[i])+.0)/3-(.1-fatigue/10)*2+.05 );

									for (i = 0; i < secondTimeThrough.length; i++) {										
										secondTimeThrough[i] -= runPassPlus;										
										if (secondTimeType[i] == "runningSide" || secondTimeType[i] == "runningPower" ) {
											secondTimeThrough[i] /= runPass;																			
										} else {
											secondTimeThrough[i] *= runPass;									
										}										
									}
									i = iTemp;
									playProb = secondTimeThrough[i];									
									if (typeof(i) == 'undefined') {
										console.log(ratios);			
										console.log(secondTimeThrough);
										console.log(secondTimeThrough.length);
		console.log(firstTimeThrough.length+" "+"first time: "+firstTimeThrough);
		console.log(secondTimeThrough.length+" "+"second time: "+secondTimeThrough);
		console.log(thirdTimeThrough.length+" "+"third time: "+thirdTimeThrough);
		console.log(firstTimeOffense.length+" "+"first time O: "+firstTimeOffense);
		console.log(secondTimeOffense.length+" "+"second time O: "+secondTimeOffense);
		console.log(thirdTimeOffense.length+" "+"third time O: "+thirdTimeOffense);
		console.log(this.playersOnCourt.length+" "+"this.playersOnCourt: "+this.playersOnCourt);
									}	
									
									/*if (playProb<.05) {
									  playProb = .05;
									}*/
									
								/*	if (secondTimeType.length == 1) {
									  playProb = 2;
									}									*/
																		
						/////////////////			console.log("i: "+i+" 2nd time through playProb: "+playProb);
									
								//	if ( (Math.random()*1.5) < (playProb+.5) ) {
								   		if ((secondTimeType[i]) == "runningSide") {
																	
											///// yardage for earch type of play, impacted by location(just cap at max yards), player skill?, player position?
											///// depending on where play ends, determines who tackles
											///// also determines who misses tackles?
											
											///// for running really about missed tackles and how big a whole
											///// could do get to 5 yard line? then based on missed tackles say how much later
											
											///// for passing, want sack odds, pass/catch odds, run after play odds
											playType = 1;
											timeThrough = 2;		
											playerOfType = i;	
											
											yardsProb = Math.random() ;
										//	console.log("0 "+yardsProb);
											//yardsProb *= 1+(1-yardsProb)/10+runYards;
										//	console.log("1 "+yardsProb);											
											//yardsProb *= runRange;
										//	console.log("2 "+yardsProb);											
											yardsProb += playProb*runRange+runBoost;
											yardsProb *= downAdj;											
											if (yardsProb <.80) {
												//yardsProb += playProb/2*runYards-.03;
											} else if (yardsProb <.90) { 
												//yardsProb += playProb/2*runYards-.03;
											} else if (yardsProb <.95) { 
												//yardsProb += playProb/100*runYards;
											} else if (yardsProb <.98) { 
												//yardsProb += playProb/100*runYards;
											} else  { 
												//yardsProb += playProb/100*runYards;
											}
										//	console.log("final "+yardsProb);
											
											yardsOnPlay = this.rushingYards(yardsProb);
										//	console.log("yards "+yardsOnPlay);
											if (Math.random() < (.013*(1-playProb) )) {
												fumble = 1;
											}
											playPicked = 1;																													
	
										} else if ((secondTimeType[i]) == "shortPass") {
											
										// new function for passes
										// same with adj yardsProb?
										// or diff?
										// tiered - sack, catch , run after?
										// or do like run, have those reversed engineered?
										
											playType = 3;
											timeThrough = 2;		
											playerOfType = i;	
										
										// Short Pass
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+passYards;
											//yardsProb *= passRange;
											yardsProb += playProb*passRange+passBoost;
											
											
											// short pass
											//yardsProb *= .99;											
											yardsProb *= downAdj;											
											if (yardsProb < 0.059) {
		//										yardsProb += playProb/10
												//yardsProb += .005;
												//yardsProb += playProb/10*passYards;
											} else if (yardsProb <.439) { 
											// less chance of incomplete
												//yardsProb += .10;
												//yardsProb += playProb/2*passYards-.09;
												//playProb/100;
											} else if (yardsProb < .733) { 
												//yardsProb += playProb/2*passYards-.09;
											} else if (yardsProb <.90) { 
												//yardsProb -= .10;
												//yardsProb += playProb/2*passYards-.09;
											} else if (yardsProb <.95) { 
												//yardsProb -= .05;
												//yardsProb += playProb/100*passYards;
											} else  { 
											// 2% cushion, that is removed at top
												//yardsProb -= .02;
												//yardsProb += playProb/100*passYards;
											} 									
											
		//									this.passingYards(yardsProb,yardsOnPlay);
											yardsOnPlay = this.passingYards(yardsProb);
											if (yardsOnPlay>0) {
//												if (Math.random() < (.160-playProb)*.5 ) {
												if (Math.random() < (.045+(.160-playProb)*.12 )*.66) {
												
											//		console.log("int: "+ playProb);
													interception = 1;
												}
											}
											
											if (interception == 0 ) {
												if (Math.random() < (.013*(1-playProb) )) {
														fumble = 1;
												}
											}
																		
											playPicked = 1;										
										
										} else if ((secondTimeType[i]) == "crossingPass") {											
											playType = 4;
											timeThrough = 2;		
											playerOfType = i;	
										// Crossing Pass
											yardsProb = Math.random() ;
										//	yardsProb *= 1+(1-yardsProb)/10+passYards;
										//	yardsProb *= passRange;
											yardsProb += playProb*passRange+passBoost;

											// short pass
											//yardsProb *= .995;											
											yardsProb *= downAdj;
											
											if (yardsProb < 0.059) {
		//										yardsProb += playProb/10
											//	yardsProb += .005;
												//////yardsProb += playProb/10*passYards;
											} else if (yardsProb <.439) { 
											// less chance of incomplete
										//		yardsProb += .10;
												/////////yardsProb += playProb/2*passYards-.09;
												//playProb/100;
											} else if (yardsProb < .733) { 
												//yardsProb -= .10;
												///////////yardsProb += playProb/2*passYards-.09;
											} else if (yardsProb <.90) { 
										//		yardsProb -= .10;
												//////////yardsProb += playProb/2*passYards-.09;
											} else if (yardsProb <.95) { 
									//			yardsProb -= .05;
												//////////yardsProb += playProb/100*passYards;
											} else  { 
											// 2% cushion, that is removed at top
									//			yardsProb -= .02;
												///////////yardsProb += playProb/100*passYards;
											} 											
											yardsOnPlay = this.passingYards(yardsProb);
											if (yardsOnPlay>0) {
												if (Math.random() < (.045+(.160-playProb)*.12 )*.66) {
													interception = 1;
												}
											}
											
											if (interception == 0 ) {
												if (Math.random() < (.013*(1-playProb) )) {
														fumble = 1;
												}
											}
							
										
											playPicked = 1;
										} else if ((secondTimeType[i]) == "longPass") {
										// Long Pass
											playType = 5;
											timeThrough = 2;		
											playerOfType = i;	
										
											yardsProb = Math.random() ;
										//	yardsProb *= 1+(1-yardsProb)/10+passYards;;
										//	yardsProb *= passRange;
											yardsProb += playProb*passRange+passBoost;
											yardsProb *= downAdj;											
											if (yardsProb < 0.059) {
		//										yardsProb += playProb/10
												//yardsProb -= .005;
												//yardsProb += playProb/10;
											} else if (yardsProb <.10) { 
											// less chance of incomplete
												//yardsProb -= .05;
												//yardsProb += playProb/1*passYards-.06;
												//playProb/100;
											} else if (yardsProb <.439) { 
											// less chance of incomplete
										//		yardsProb += .10;
												////////////yardsProb += playProb/1*passYards-.06;
												//playProb/100;
											} else if (yardsProb < .533) { 
												//yardsProb -= .10;
												//yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb < .633) { 
												//yardsProb += .20;
												//yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb < .733) { 
												//yardsProb += .10;
												//yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb <.90) { 
										//		yardsProb -= .10;
												//////////yardsProb += playProb/10*passYards;
											} else if (yardsProb <.95) { 
									//			yardsProb -= .05;
												///////yardsProb += playProb/10*passYards;
											} else  { 
											// 2% cushion, that is removed at top
									//			yardsProb -= .02;
												////////yardsProb += playProb/10*passYards;
											} 																			
											yardsOnPlay = this.passingYards(yardsProb);
											if (yardsOnPlay>0) {
												if (Math.random() < (.045+(.160-playProb)*.12 )*.66) {
													interception = 1;
												}
											}
											
											if (interception == 0 ) {
												if (Math.random() < (.013*(1-playProb) )) {
														fumble = 1;
												}
											}																				
											playPicked = 1;
										}
									//	i = secondTimeType.length;
									//}									
							//	}
							//}
						} else {						
							timeType = 3;							
							// third time trough				
	//						while (playPicked == 0) {				
		//						for (i = 0; i < thirdTimeType.length; i++) {		  
								
								
									for (i = 0; i < thirdTimeThrough.length; i++) {										
										if (thirdTimeType[i] == "runningSide" || thirdTimeType[i] == "runningPower" ) {
											thirdTimeThrough[i] *= runPass;																			
										} else {
											thirdTimeThrough[i] /= runPass;									
										}																			
										thirdTimeThrough[i] += runPassPlus;												
									}								
								
									ratios = this.ratingArraySimple(thirdTimeThrough,1);
									iTemp = this.pickPlayerVariable(ratios,thirdTimeThrough.length);
								
								
//								    fatigue = this.fatigue(this.team[this.o].player[thirdTimeOffense[i]].stat.energy);
//									playProb = (((thirdTimeThrough[i])+.0)/3) -(.1-fatigue/10)*2+.05;
									
									for (i = 0; i < thirdTimeThrough.length; i++) {										
										thirdTimeThrough[i] -= runPassPlus;												
										if (thirdTimeType[i] == "runningSide" || thirdTimeType[i] == "runningPower" ) {
											thirdTimeThrough[i] /= runPass;																			
										} else {
											thirdTimeThrough[i] *= runPass;									
										}	
									}								
									i = iTemp;
									playProb = thirdTimeThrough[i];
									if (typeof(i) == 'undefined') {
										console.log(ratios);			
										console.log(thirdTimeThrough);
										console.log(thirdTimeThrough.length);
		console.log(firstTimeThrough.length+" "+"first time: "+firstTimeThrough);
		console.log(secondTimeThrough.length+" "+"second time: "+secondTimeThrough);
		console.log(thirdTimeThrough.length+" "+"third time: "+thirdTimeThrough);
		console.log(firstTimeOffense.length+" "+"first time O: "+firstTimeOffense);
		console.log(secondTimeOffense.length+" "+"second time O: "+secondTimeOffense);
		console.log(thirdTimeOffense.length+" "+"third time O: "+thirdTimeOffense);
		console.log(this.playersOnCourt.length+" "+"this.playersOnCourt: "+this.playersOnCourt);
									}									
									
								/*	if (playProb<.05) {
									  playProb = .05;
									}*/
						////////////////			console.log("i: "+i+" 3rd time through playProb: "+playProb);
				/*					if (thirdTimeType.length == 1) {
									  playProb = 2;
									}								*/
			//						if ( (Math.random()*1.5) < (playProb+.5) ) {
										if ((thirdTimeType[i]) == "runningSide") {
																	
											///// yardage for earch type of play, impacted by location(just cap at max yards), player skill?, player position?
											///// depending on where play ends, determines who tackles
											///// also determines who misses tackles?
											
											///// for running really about missed tackles and how big a whole
											///// could do get to 5 yard line? then based on missed tackles say how much later
											
											///// for passing, want sack odds, pass/catch odds, run after play odds
											playType = 1;
											timeThrough = 3;		
											playerOfType = i;	
											
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+runYards;
											//yardsProb *= runRange;
											yardsProb += playProb*runRange+runBoost;
											yardsProb *= downAdj;											
											if (yardsProb <.80) {
												////////yardsProb += playProb/1*runYards-.06;
											} else if (yardsProb <.90) { 
												///////yardsProb += playProb/1*runYards-.06;
											} else if (yardsProb <.95) { 
												/////////yardsProb += playProb/1*runYards-.06;
											} else if (yardsProb <.98) { 
												/////////yardsProb += playProb/10*runYards;
											} else  { 
												/////////yardsProb += playProb/10*runYards;
											}
											
											yardsOnPlay = this.rushingYards(yardsProb);
												if (Math.random() < (.013*(1-playProb) )) {
													fumble = 1;
												}
											playPicked = 1;																		
										} else if ((thirdTimeType[i]) == "runningPower") {
											
											playType = 2;
											timeThrough = 3;		
											playerOfType = i;	
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+runYards;
											//yardsProb *= runRange;
											yardsProb += playProb*runRange+runBoost;
											yardsProb *= downAdj;											
											if (yardsProb <.80) {
												//yardsProb += .05;
											
												//yardsProb += playProb/1*runYards-.06;
											} else if (yardsProb <.90) { 
												//yardsProb += .01;
											
												//yardsProb += playProb/1*runYards-.06;
											} else if (yardsProb <.95) { 
												//yardsProb += .005;
											
												//yardsProb += playProb/10*runYards;
											} else if (yardsProb <.98) { 
												//yardsProb += .001;
											
												//yardsProb += playProb/10*runYards;
											} else  { 
												//yardsProb += playProb/10*runYards;
											}									
											yardsOnPlay = this.rushingYards(yardsProb);
											if (Math.random() < (.013*(1-playProb) )) {
												fumble = 1;
											}
											playPicked = 1;
										} else if ((thirdTimeType[i]) == "shortPass") {
										// new function for passes
										// same with adj yardsProb?
										// or diff?
										// tiered - sack, catch , run after?
										// or do like run, have those reversed engineered?
										
											playType = 3;
											timeThrough = 3;		
											playerOfType = i;	
										
										// Short Pass
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+passYards;
											//yardsProb *= passRange;
											yardsProb += playProb*passRange+passBoost;
											yardsProb *= downAdj;											
											if (yardsProb < 0.059) {
		//										yardsProb += playProb/10
												//yardsProb += .005;
												//yardsProb += playProb/10*passYards;
											} else if (yardsProb <.439) { 
											// less chance of incomplete
												//yardsProb += .10;
												//yardsProb += playProb/1*passYards-.06;
												//playProb/100;
											} else if (yardsProb < .733) { 
												//yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb <.90) { 
												//yardsProb -= .10;
												//yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb <.95) { 
												//yardsProb -= .05;
												//yardsProb += playProb/10*passYards;
											} else  { 
											// 2% cushion, that is removed at top
												//yardsProb -= .02;
												//yardsProb += playProb/10*passYards;
											} 									
											
											yardsOnPlay = this.passingYards(yardsProb);
											if (yardsOnPlay>0) {
												if (Math.random() <(.045+(.160-playProb)*.12 )*.66) {
													interception = 1;
												}
											}
											if (interception == 0 ) {
												if (Math.random() < (.013*(1-playProb) )) {
														fumble = 1;
												}
											}
								
																					
											playPicked = 1;										
										
										} else if ((thirdTimeType[i]) == "crossingPass") {											
											playType = 4;
											timeThrough = 3;		
											playerOfType = i;	
										// Crossing Pass
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+passYards;
											//yardsProb *= passRange;
											yardsProb += playProb*passRange+passBoost;	
											yardsProb *= downAdj;											
											if (yardsProb < 0.059) {
												//////////yardsProb += .005;
		//										yardsProb += playProb/10
											//	yardsProb += .005;
												///////////yardsProb += playProb/10*passYards;
											} else if (yardsProb <.439) { 
												/////////yardsProb += .050;
											// less chance of incomplete
										//		yardsProb += .10;
												/////////yardsProb += playProb/1*passYards-.06;
												//playProb/100;
											} else if (yardsProb < .733) { 
												////////////yardsProb += .050;
												//yardsProb -= .10;
												////////////yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb <.90) { 
												///////////yardsProb += .010;
										//		yardsProb -= .10;
												////////////yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb <.95) { 
												////////////yardsProb += .005;
									//			yardsProb -= .05;
												////////////yardsProb += playProb/10*passYards;
											} else  { 
											// 2% cushion, that is removed at top
									//			yardsProb -= .02;
												///////////yardsProb += playProb/10*passYards;
											} 											
											yardsOnPlay = this.passingYards(yardsProb);
											if (yardsOnPlay>0) {
												if (Math.random() <(.045+(.160-playProb)*.12 )*.66) {
													interception = 1;
												}
											}
											
											if (interception == 0 ) {
												if (Math.random() < (.013*(1-playProb) )) {
														fumble = 1;
												}
											}
										
											playPicked = 1;
										} else if ((thirdTimeType[i]) == "longPass") {
											playType = 5;
											timeThrough = 3;		
											playerOfType = i;	
										// Long Pass
											yardsProb = Math.random() ;
											//yardsProb *= 1+(1-yardsProb)/10+passYards;
											//yardsProb *= passRange;
											yardsProb += playProb*passRange+passBoost;	
											
											// long pass
											//yardsProb *= 1.20;											
											yardsProb *= downAdj;											
											if (yardsProb < 0.059) {
		//										yardsProb += playProb/10
												//yardsProb += .005;
												//yardsProb += playProb/10*passYards;
											} else if (yardsProb <.10) { 
											// less chance of incomplete
												///yardsProb += .05;
												///yardsProb += playProb/10*passYards;
												//playProb/100;
											} else if (yardsProb <.439) { 
											// less chance of incomplete
										//		yardsProb += .10;
												//yardsProb += playProb/1*passYards-.06;
												//playProb/100;
											} else if (yardsProb < .533) { 
												//yardsProb += .10;
												//yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb < .633) { 
												//yardsProb += .20;
												//yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb < .733) { 
												//yardsProb += .10;
												//yardsProb += playProb/1*passYards-.06;
											} else if (yardsProb <.90) { 
										//		yardsProb -= .10;
												//yardsProb += playProb/10*passYards;
											} else if (yardsProb <.95) { 
									//			yardsProb -= .05;
												//yardsProb += playProb/10*passYards;
											} else  { 
											// 2% cushion, that is removed at top
									//			yardsProb -= .02;
												//yardsProb += playProb/10*passYards;
											} 									
										
											yardsOnPlay = this.passingYards(yardsProb);
											if (yardsOnPlay>0) {
												if (Math.random() <(.045+(.160-playProb)*.12 )*.66) {
													interception = 1;
												}
											}
											
											if (interception == 0 ) {
												if (Math.random() < (.013*(1-playProb) )) {
														fumble = 1;
												}
											}

																														
											playPicked = 1;
										}
										i = thirdTimeType.length;
								//	} 
								//}									
							//}
						} 	
				}
				
				
				if ((fieldGoal == 0) && (kickPunt == 0) ) {
					fieldPosition += yardsOnPlay;
					toFirst -= yardsOnPlay;				
					
					if ((toFirst <= 0) ) {
						playDown = 1; // if turnover driveActive ==0, if touchdown driveActive = 1,touchdown = 1, fieldGoal = 1; 
						toFirst = 10;
					} else {
						playDown += 1; // if turnover driveActive ==0, if touchdown driveActive = 1,touchdown = 1, fieldGoal = 1; 
					}															
					if (fieldPosition >= 100) {
					  playDown = 100;
					  yardsOnPlay -= fieldPosition-100;
					//  fieldPosition = 20;
					  // need scoring stat stored here
					  // also need extra point attempt, or 2 pt conversion
					  
					  //////////// should be all playTypes unless it is a fieldGoal and Punt
					  
					  ///////////////// something not working here
					  ////////////////// hang ups
					  
						if (timeType == 1) {						
							this.recordStat(this.o, firstTimeOffense[playerOfType], "pts",6);		
							if (playType >2) {
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");																
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");
								
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
								
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);		
								this.recordStat(this.o, firstTimeOffense[playerOfType], "tgts");								
								this.recordStat(this.o, firstTimeOffense[playerOfType], "orb",yardsOnPlay);									
								if (firstTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, firstTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
								}			
								if (firstTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,firstTimeDefense[playerOfType], "depy",yardsOnPlay);		
									this.recordStat(this.d,firstTimeDefense[playerOfType], "depc");												
								}	
								
								this.recordStat(this.o, firstTimeOffense[playerOfType], "ast");			
								p= firstTimeOffense[playerOfType];																					
							
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "blk");	
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdp");	
								if ((redZone == 1 )) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");		
								}

								if ((thirdDown == 1 )) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");						  
								}
								
								this.recordStat(this.o, firstTimeOffense[playerOfType], "pf");		
								p= firstTimeOffense[playerOfType];
								this.recordPlay("passTD", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
																
							} else {
							//	console.log(firstTimeOffense+" "+playerOfType);
								this.recordStat(this.o, firstTimeOffense[playerOfType], "drb",yardsOnPlay);	
								if (firstTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, firstTimeBlocking[playerOfType], "olry",yardsOnPlay);			
								}				
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
									
								this.recordStat(this.o, firstTimeOffense[playerOfType], "tov");		
								if (firstTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, firstTimeBlocking[playerOfType], "olr");			
									this.recordStat(this.o, firstTimeBlocking[playerOfType], "olrp");			
								}
								if (firstTimeDefense[playerOfType] <100) {
									this.recordStat(this.d, firstTimeDefense[playerOfType], "der");			
								}								
								if (firstTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,firstTimeDefense[playerOfType], "dery",yardsOnPlay);			
								}										
							
								this.recordStat(this.o, firstTimeOffense[playerOfType], "ft");	
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdr");	
								
								if ((redZone == 1 )) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");		
								}
								
								if ((thirdDown == 1 )) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");						  
								}								
								p= firstTimeOffense[playerOfType];
								this.recordPlay("rushTD", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
								
							}
							p= firstTimeOffense[playerOfType];
						}
						if (timeType == 2) {						
							this.recordStat(this.o, secondTimeOffense[playerOfType], "pts",6);		
							
							if (playType >2) {
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");	
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");																
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");
								
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
								
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);										
								this.recordStat(this.o, secondTimeOffense[playerOfType], "orb",yardsOnPlay);	
								this.recordStat(this.o, secondTimeOffense[playerOfType], "tgts");								
								this.recordStat(this.o, secondTimeOffense[playerOfType], "ast");									
								if (secondTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, secondTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
								}			
								if (secondTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,secondTimeDefense[playerOfType], "depy",yardsOnPlay);			
									this.recordStat(this.d,secondTimeDefense[playerOfType], "depc");											
								}	
							
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "blk");	
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdp");	
								
								if ((redZone == 1 )) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");		
								}
								
								if ((thirdDown == 1) ) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");						  
								}									
								this.recordStat(this.o, secondTimeOffense[playerOfType], "pf");		
								p= secondTimeOffense[playerOfType];
								this.recordPlay("passTD", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
							} else {
								this.recordStat(this.o, secondTimeOffense[playerOfType], "drb",yardsOnPlay);	
								if (secondTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, secondTimeBlocking[playerOfType], "olry",yardsOnPlay);			
								}				
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
									
								this.recordStat(this.o, secondTimeOffense[playerOfType], "tov");		
								if (secondTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, secondTimeBlocking[playerOfType], "olr");	
									this.recordStat(this.o, secondTimeBlocking[playerOfType], "olrp");			
									
								}
								if (secondTimeDefense[playerOfType] <100) {
									this.recordStat(this.d, secondTimeDefense[playerOfType], "der");			
								}								
								if (secondTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,secondTimeDefense[playerOfType], "dery",yardsOnPlay);			
								}	
								this.recordStat(this.o, secondTimeOffense[playerOfType], "ft");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdr");									
								if ((redZone == 1 )) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");		
								}
								
								if ((thirdDown == 1) ) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");						  
								}									
								p= secondTimeOffense[playerOfType];
								this.recordPlay("rushTD", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
							}
							p= secondTimeOffense[playerOfType];
						}
						if (timeType == 3) {						
							
							this.recordStat(this.o, thirdTimeOffense[playerOfType], "pts",6);		
							
							if (playType >2) {
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");	
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");																
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");
								
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
								
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);	
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "tgts");								
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "orb",yardsOnPlay);	
								
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "ast");									
								if (thirdTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
								}			
								if (thirdTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,thirdTimeDefense[playerOfType], "depy",yardsOnPlay);			
									this.recordStat(this.d,thirdTimeDefense[playerOfType], "depc");												
								}												
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "blk");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdp");	
								
								if ((redZone == 1 )) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");		
								}
								
								if ((thirdDown == 1) ) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");						  
								}									
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "pf");		
								p= thirdTimeOffense[playerOfType];
								this.recordPlay("passTD", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
							} else {
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "drb",yardsOnPlay);	
								if (thirdTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olry",yardsOnPlay);			
								}				
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
									
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "tov");		
								if (thirdTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olr");	
									this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olrp");			
									
								}
								if (thirdTimeDefense[playerOfType] <100) {
									this.recordStat(this.d, thirdTimeDefense[playerOfType], "der");			
								}								
								if (thirdTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,thirdTimeDefense[playerOfType], "dery",yardsOnPlay);			
								}	
							
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "ft");	
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");	
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdr");									
								if ((redZone == 1 )) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");		
								}
								
								if ((thirdDown == 1) ) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");						  
								}									
								p= thirdTimeOffense[playerOfType];
								this.recordPlay("rushTD", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
							}
							p= thirdTimeOffense[playerOfType];
						}						
							//// extra point
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fgaLowPost");		
						if ( (Math.random()*Math.random()*Math.random()) <((this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal)/2+.5)) {						
								this.recordStat(this.o, this.playersOnCourt[this.o][22], "pts",1);																
								p= this.playersOnCourt[this.o][22];
								this.recordPlay("ep", this.o,[this.team[this.o].player[p].name]);	
								this.recordStat(this.o, this.playersOnCourt[this.o][22], "fgLowPost");		
						} else {
								p= this.playersOnCourt[this.o][22];
								this.recordPlay("epm", this.o, [this.team[this.o].player[p].name]);	
						}						
							//// two point conversion						
					
					} else {										
						if (( interception == 1) || (fumble == 1)) {
						//	playDown = 1;
						//	yardsOnPlay -= fieldPosition-100;						
						}
					////////////// firstTimeRushing empty (need to find right matchup)									
					  //// do tackles
						if (timeType == 1) {	
							passOrSack = Math.random();

							if (playType > 2) {							    
								
								if (yardsOnPlay == 0) {
								    //// typically incomplete
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
									
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");		
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");									
									this.recordStat(this.o, firstTimeOffense[playerOfType], "tgts");										
									p = firstTimeOffense[playerOfType];
									
									this.recordPlay("inc", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									if (firstTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, firstTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, firstTimeBlocking[playerOfType], "olrp");			
									}
									if (firstTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,firstTimeDefense[playerOfType], "dep");			
									}		
							
																		
								} else if (yardsOnPlay < 0 && passOrSack < sackOdds) {
								    //// typically sack
									
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
									
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);										
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");		
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");																		
									if (firstTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, firstTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, firstTimeBlocking[playerOfType], "olrp");			
									}											
									if (firstTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, firstTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
									}										
									if (firstTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,firstTimeDefense[playerOfType], "dep");			
									}		
									if (firstTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,firstTimeDefense[playerOfType], "depy",yardsOnPlay);			
									}								
									if (fumble == 1) {
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "fbl");			
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");	
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
										
										playDown = 1;
										toFirst = 10;
										p= firstTimeOffense[playerOfType];
									    fieldPosition -= 100;
										fieldPosition *= -1;
																					
										this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									
									} 								 
									
								} else {
								    if (interception == 1) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "inter");	
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppinter");			
										
										p= this.playersOnCourt[this.o][0];

										playDown = 1;
										toFirst = 10;
									    fieldPosition -= 100;
										fieldPosition *= -1;
										this.recordPlay("int", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);	
										
									} else {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");	
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");
										
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
										
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);										
										this.recordStat(this.o, firstTimeOffense[playerOfType], "orb",yardsOnPlay);									
										if (firstTimeBlocking[playerOfType] <100) {
											this.recordStat(this.o, firstTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
										}			
										if (firstTimeDefense[playerOfType] <100) {
											this.recordStat(this.d,firstTimeDefense[playerOfType], "depy",yardsOnPlay);			
											this.recordStat(this.d,firstTimeDefense[playerOfType], "depc");												
										}								
										this.recordStat(this.o, firstTimeOffense[playerOfType], "ast");			
										p= firstTimeOffense[playerOfType];
										this.recordPlay("pass", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);	
										if (fumble == 1) {
											
											this.recordStat(this.o,  this.playersOnCourt[this.o][0], "fbl");	
											this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
											this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
											this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
												
											playDown = 1;
											toFirst = 10;
											p= firstTimeOffense[playerOfType];
												
											fieldPosition -= 100;
											fieldPosition *= -1;
												
											this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
										
										} 									
									}
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
									
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");	
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");																		
									this.recordStat(this.o, firstTimeOffense[playerOfType], "tgts");										
								
									if (firstTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, firstTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, firstTimeBlocking[playerOfType], "olrp");			
									}				
									if (firstTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,firstTimeDefense[playerOfType], "dep");			
									}		
									
								}
							} else {
								
							//	console.log(firstTimeOffense+" "+playerOfType);									
								this.recordStat(this.o, firstTimeOffense[playerOfType], "drb",yardsOnPlay);	
								if (firstTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, firstTimeBlocking[playerOfType], "olry",yardsOnPlay);			
								}								
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
																	
								this.recordStat(this.o, firstTimeOffense[playerOfType], "tov");			
								if (firstTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, firstTimeBlocking[playerOfType], "olr");			
									this.recordStat(this.o, firstTimeBlocking[playerOfType], "olrp");			
								}
								if (firstTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,firstTimeDefense[playerOfType], "der");			
								}		
								if (firstTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,firstTimeDefense[playerOfType], "dery",yardsOnPlay);			
								}								
								
								p= firstTimeOffense[playerOfType];
								this.recordPlay("rush", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
							    if (fumble == 1) {
									
									this.recordStat(this.o, firstTimeOffense[playerOfType], "fbl");	
									this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
									this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
									this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
									
									playDown = 1;
									toFirst = 10;
									p= firstTimeOffense[playerOfType];
									fieldPosition -= 100;
									fieldPosition *= -1;
									
									this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
								
								} 								 
							}

							if (playType >2 && yardsOnPlay<0 && passOrSack < sackOdds) {
								if (sackPlayer <100) {							  
									this.recordStat(this.d, sackPlayer, "fgaMidRange");				
									this.recordStat(this.d,  sackPlayer, "fgMidRange");		
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tp");										
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "syl",-yardsOnPlay);										
						        if  (gaveUpSack < 100) {
									this.recordStat(this.o, gaveUpSack, "ols");										
								}
								if (sackPlayer <100) {							  
									p = sackPlayer;
									this.recordPlay("sack", this.o, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
								} else {
//									this.recordPlay("sackGroup", this.o, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									this.recordPlay("sackGroup", this.o, "",yardsOnPlay,playDown,toFirst,fieldPosition);		
								}
								if (fieldPosition <= 0) {					
									if (sackPlayer <100) {							  
										this.recordStat(this.d,  firstTimeRushing[playerOfType], "pts",2);		
										p = sackPlayer;
										this.recordPlay("safety", this.d, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									}
									playDown = 100;

								}
							} else if (playType >2 && yardsOnPlay==0) {
							} else if (playType >2 && interception==1) {
									this.recordStat(this.d, firstTimeDefense[playerOfType], "intery");	
							}	else {
								if ( (yardsOnPlay < 4) || (playType > 2) ) {
									if (yardsOnPlay > 15) {
										for (i = 11; i < 22; i++) {		  
										   if ((this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'S')  || (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'CB') ){
												if (Math.random() <.40) {
													this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");										   
													i = 22;					
												}
										   }
										   if (i == 21) {
												this.recordStat(this.d, firstTimeDefense[playerOfType], "fgMidRange");	
										   }
										}										  
									} else {
										this.recordStat(this.d, firstTimeDefense[playerOfType], "fgMidRange");	
									}									
								} else if ( (this.team[this.d].player[firstTimeDefense[playerOfType]].pos != 'DL') ) {
									this.recordStat(this.d, firstTimeDefense[playerOfType], "fgMidRange");	
								} else {
									for (i = 11; i < 22; i++) {		  
									   if (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'LB') {
									        if (Math.random() <.40) {
												this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");										   
												i = 22;					
											}
									   }
									   if (i == 21) {
											this.recordStat(this.d, firstTimeDefense[playerOfType], "fgMidRange");										   
									   }
								    }	
								}	
								if (fieldPosition <= 0) {					
									playDown = 1;
									this.recordStat(this.d,  firstTimeDefense[playerOfType], "pts",2);		
									p = firstTimeDefense[playerOfType];
									this.recordPlay("safety", this.d, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									playDown = 100;
								}									
							}							
						}
						if (timeType == 2) {						
							passOrSack = Math.random();
							if (playType > 2) {
								if (yardsOnPlay == 0) {
								    //// typically incomplete
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");		
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");																		
									this.recordStat(this.o, secondTimeOffense[playerOfType], "tgts");										
									p = secondTimeOffense[playerOfType];
									if (secondTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, secondTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, secondTimeBlocking[playerOfType], "olrp");			
									}		
									if (secondTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,secondTimeDefense[playerOfType], "dep");			
									}		
									
									this.recordPlay("inc", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
								} else if (yardsOnPlay < 0 && passOrSack < sackOdds) {
								    //// typically sack
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
									
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);										
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");	
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");																		
									if (secondTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, secondTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, secondTimeBlocking[playerOfType], "olrp");			
									}		
									if (secondTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, secondTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
									}		
									if (secondTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,secondTimeDefense[playerOfType], "dep");			
									}		
									if (secondTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,secondTimeDefense[playerOfType], "depy",yardsOnPlay);			
									}								
									if (fumble == 1) {
										
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "fbl");	
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
										playDown = 1;
										toFirst = 10;
										p= secondTimeOffense[playerOfType];
									    fieldPosition -= 100;
										fieldPosition *= -1;
										this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									} 									
								} else {								
								    if (interception == 1) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "inter");	
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppinter");												
										p= this.playersOnCourt[this.o][0];
										playDown = 1;
										toFirst = 10;
									
									    fieldPosition -= 100;
										fieldPosition *= -1;

										this.recordPlay("int", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);	
									    
									} else {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");	
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");
										
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
										
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);										
										this.recordStat(this.o, secondTimeOffense[playerOfType], "orb",yardsOnPlay);									
										if (secondTimeBlocking[playerOfType] <100) {
											this.recordStat(this.o, secondTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
										}			
										if (secondTimeDefense[playerOfType] <100) {
											this.recordStat(this.d,secondTimeDefense[playerOfType], "depy",yardsOnPlay);	
											this.recordStat(this.d,secondTimeDefense[playerOfType], "depc");			
											
										}								
										this.recordStat(this.o, secondTimeOffense[playerOfType], "ast");			
										p= secondTimeOffense[playerOfType];
										this.recordPlay("pass", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);	
										if (fumble == 1) {
											
											this.recordStat(this.o,  secondTimeOffense[playerOfType], "fbl");		
											this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
											this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
											this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
												
											playDown = 1;
											toFirst = 10;
											p= secondTimeOffense[playerOfType];
											fieldPosition -= 100;
											fieldPosition *= -1;
												
											this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
										} 									
									}
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
									
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");		
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");																		
									this.recordStat(this.o, secondTimeOffense[playerOfType], "tgts");										
								
									if (secondTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, secondTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, secondTimeBlocking[playerOfType], "olrp");			
									}				
									if (secondTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,secondTimeDefense[playerOfType], "dep");			
									}										
								}
							} else {
								
								this.recordStat(this.o, secondTimeOffense[playerOfType], "drb",yardsOnPlay);	
								if (secondTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, secondTimeBlocking[playerOfType], "olry",yardsOnPlay);			
								}				
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
									
								this.recordStat(this.o, secondTimeOffense[playerOfType], "tov");		
								if (secondTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, secondTimeBlocking[playerOfType], "olr");		
									this.recordStat(this.o, secondTimeBlocking[playerOfType], "olrp");											
								}
								if (secondTimeDefense[playerOfType] <100) {
									this.recordStat(this.d, secondTimeDefense[playerOfType], "der");			
								}								
								if (secondTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,secondTimeDefense[playerOfType], "dery",yardsOnPlay);			
								}										

								p= secondTimeOffense[playerOfType];
								this.recordPlay("rush", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
							    if (fumble == 1) {
//////////////////// was wrong, was first time before, needs to fixed in all versions**										
									this.recordStat(this.o, secondTimeOffense[playerOfType], "fbl");			
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
																	
									playDown = 1;
									toFirst = 10;
									p= secondTimeOffense[playerOfType];
									    fieldPosition -= 100;
										fieldPosition *= -1;
									
									this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
						
								
								} 									 
							}
							
							if (playType >2 && yardsOnPlay<0 && passOrSack < sackOdds) {
								if (sackPlayer <100) {							  
								
									this.recordStat(this.d, sackPlayer, "fgaMidRange");		
									this.recordStat(this.d,  sackPlayer, "fgMidRange");		
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tp");	
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "syl",-yardsOnPlay);																		
						        if  (gaveUpSack < 100) {								
									this.recordStat(this.o, gaveUpSack, "ols");										
								}
								if (sackPlayer <100) {							  								
									p = sackPlayer;
									this.recordPlay("sack", this.o, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
								} else {
									p = sackPlayer;
//									this.recordPlay("sackGroup", this.o, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									this.recordPlay("sackGroup", this.o, "",yardsOnPlay,playDown,toFirst,fieldPosition);		
								
								}
								if (fieldPosition <= 0) {					
									playDown = 1;

									if (sackPlayer <100) {							  
										this.recordStat(this.d,  sackPlayer, "pts",2);		
										p = sackPlayer;
										this.recordPlay("safety", this.d, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									}
									playDown = 100;									
								}			
							} else if (playType >2 && yardsOnPlay==0) {

							} else if (playType >2 && interception==1) {

									this.recordStat(this.d, secondTimeDefense[playerOfType], "intery");	
								
							} 	else {
							
								if ( (yardsOnPlay < 4) || (playType > 2) ) {
									
									if (yardsOnPlay > 15) {
										for (i = 11; i < 22; i++) {		  
										   if ((this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'S')  || (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'CB') ){
												if (Math.random() <.40) {
													this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");										   
													i = 22;					
												}
										   }
										   if (i == 21) {
												this.recordStat(this.d, secondTimeDefense[playerOfType], "fgMidRange");	
										   }
										}										  
									} else {
										this.recordStat(this.d, secondTimeDefense[playerOfType], "fgMidRange");	
									}
									
								} else if ( (this.team[this.d].player[secondTimeDefense[playerOfType]].pos != 'DL') ) {
									this.recordStat(this.d, secondTimeDefense[playerOfType], "fgMidRange");	
								} else {
									for (i = 11; i < 22; i++) {		  
									   if (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'LB') {
									        if (Math.random() <.40) {
												this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");										   
												i = 22;					
											}
									   }
									   if (i == 21) {
									this.recordStat(this.d, secondTimeDefense[playerOfType], "fgMidRange");	
									   }
								    }	
								}	
								
								if (fieldPosition <= 0) {					
									playDown = 100;
									this.recordStat(this.d,  secondTimeDefense[playerOfType], "pts",2);		
									p = secondTimeDefense[playerOfType];
									this.recordPlay("safety", this.d, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
								}									
							}							
							
						}
						if (timeType == 3) {						
						
							passOrSack = Math.random();							
							
							if (playType > 2) {
								if (yardsOnPlay == 0) {
								    //// typically incomplete
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");											
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");	
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");																		
									this.recordStat(this.o, thirdTimeOffense[playerOfType], "tgts");										
									p = thirdTimeOffense[playerOfType];
									if (thirdTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olrp");			
									}																		
									if (thirdTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,thirdTimeDefense[playerOfType], "dep");			
									}		
									this.recordPlay("inc", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									
								} else if (yardsOnPlay < 0 && passOrSack < sackOdds) {
								    //// typically sack
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
									
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);										
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");		
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");																		
									if (thirdTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olrp");			
									}	
									if (thirdTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
									}										
									if (thirdTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,thirdTimeDefense[playerOfType], "dep");			
									}		
									if (thirdTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,thirdTimeDefense[playerOfType], "depy",yardsOnPlay);			
									}	
									if (fumble == 1) {
										
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "fbl");		
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
										
										playDown = 1;
										toFirst = 10;
										p= thirdTimeOffense[playerOfType];
										
									    fieldPosition -= 100;
										fieldPosition *= -1;
										
										this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);										
									} 										
								} else {
								
								
								    if (interception == 1) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "inter");		
										this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
										this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppinter");												
										p= this.playersOnCourt[this.o][0];
										playDown = 1;
										toFirst = 10;
											
									    fieldPosition -= 100;
										fieldPosition *= -1;

										this.recordPlay("int", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);	
									    
									} else {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");
										
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
										
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);										
										this.recordStat(this.o, thirdTimeOffense[playerOfType], "orb",yardsOnPlay);									
										if (thirdTimeBlocking[playerOfType] <100) {
											this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olpy",yardsOnPlay);			
										}			
										if (thirdTimeDefense[playerOfType] <100) {
											this.recordStat(this.d,thirdTimeDefense[playerOfType], "depy",yardsOnPlay);			
											this.recordStat(this.d,thirdTimeDefense[playerOfType], "depc");												
										}								
										this.recordStat(this.o, thirdTimeOffense[playerOfType], "ast");			
										p= thirdTimeOffense[playerOfType];
										this.recordPlay("pass", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);	
										if (fumble == 1) {
											
											this.recordStat(this.o,  thirdTimeOffense[playerOfType], "fbl");			
											this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
											this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
											this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
											
											playDown = 1;
											toFirst = 10;
											p= thirdTimeOffense[playerOfType];
											fieldPosition -= 100;
											fieldPosition *= -1;
											
											this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
										
										} 										
									}
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
									
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");		
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");																		
									this.recordStat(this.o, thirdTimeOffense[playerOfType], "tgts");										

									if (thirdTimeBlocking[playerOfType] <100) {
										this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olp");			
										this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olrp");			
									}				

									if (thirdTimeDefense[playerOfType] <100) {
										this.recordStat(this.d,thirdTimeDefense[playerOfType], "dep");			
									}		
								}
							} else {
							//	console.log(thirdTimeOffense+" "+playerOfType);																
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "drb",yardsOnPlay);	
								if (thirdTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olry",yardsOnPlay);			
								}				
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);		
																	
								this.recordStat(this.o, thirdTimeOffense[playerOfType], "tov");	
								if (thirdTimeBlocking[playerOfType] <100) {
									this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olr");			
									this.recordStat(this.o, thirdTimeBlocking[playerOfType], "olrp");			
								}
								if (thirdTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,thirdTimeDefense[playerOfType], "der");			
								}									
								if (thirdTimeDefense[playerOfType] <100) {
									this.recordStat(this.d,thirdTimeDefense[playerOfType], "dery",yardsOnPlay);			
								}								
								p= thirdTimeOffense[playerOfType];
								this.recordPlay("rush", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
							    if (fumble == 1) {
/////////////////////////////////////// was wrong, was first time offense, need to change in all versions										
									this.recordStat(this.o, thirdTimeOffense[playerOfType], "fbl");			
									this.recordStat(this.o,  this.playersOnCourt[this.o][0], "turn");			
									this.recordStat(this.d,  this.playersOnCourt[this.d][0], "turnopp");			
									this.recordStat(this.d,  this.playersOnCourt[this.d][0], "oppfumble");			
																		
									playDown = 1;
									toFirst = 10;
									p= thirdTimeOffense[playerOfType];
									fieldPosition -= 100;
									fieldPosition *= -1;
																				
									this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);										
								} 								
							}							
							
							
							
							if (playType >2 && yardsOnPlay<0 && passOrSack < sackOdds) {							
								if (sackPlayer <100) {							  
									this.recordStat(this.d, sackPlayer, "fgaMidRange");		
									this.recordStat(this.d,sackPlayer, "fgMidRange");		
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tp");		
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "syl",-yardsOnPlay);																		
						        if  (gaveUpSack < 100) {																
									this.recordStat(this.o, gaveUpSack, "ols");										
								}
						        if  (sackPlayer < 100) {																
									p = sackPlayer;
									this.recordPlay("sack", this.o, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
								} else {
									p = sackPlayer;
//									this.recordPlay("sackGroup", this.o, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									this.recordPlay("sackGroup", this.o, "",yardsOnPlay,playDown,toFirst,fieldPosition);		
								
								}
								
								if (fieldPosition <= 0) {					
									if  (sackPlayer < 100) {																
										this.recordStat(this.d,  thirdTimeRushing[playerOfType], "pts",2);		
										p = sackPlayer;
										this.recordPlay("safety", this.d, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
									}
									playDown = 100;									
								}									
							} else if (playType >2 && yardsOnPlay==0) {

							} else if (playType >2 && interception==1) {

									this.recordStat(this.d, thirdTimeDefense[playerOfType], "intery");	
							} 	else {

								if ( (yardsOnPlay < 4) || (playType > 2) ) {
																
									if (yardsOnPlay > 15) {
										for (i = 11; i < 22; i++) {		  
										   if ((this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'S')  || (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'CB') ){
												if (Math.random() <.40) {
													this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");										   
													i = 22;					
												}
										   }
										   if (i == 21) {
												this.recordStat(this.d, thirdTimeDefense[playerOfType], "fgMidRange");	
										   }
										}										  
									} else {
										this.recordStat(this.d, thirdTimeDefense[playerOfType], "fgMidRange");	
									}
																											
								} else if ( (this.team[this.d].player[thirdTimeDefense[playerOfType]].pos != 'DL') ) {
									this.recordStat(this.d, thirdTimeDefense[playerOfType], "fgMidRange");	
								} else {
									for (i = 11; i < 22; i++) {		  
									   if (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'LB') {
									        if (Math.random() <.40) {
												this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");										   
												i = 22;					
											}
									   }
									   if (i == 21) {
											this.recordStat(this.d, thirdTimeDefense[playerOfType], "fgMidRange");	
									   }
								    }	
								}	
								
								if (fieldPosition <= 0) {					
									playDown = 100;
									this.recordStat(this.d,  thirdTimeDefense[playerOfType], "pts",2);		
									p = thirdTimeDefense[playerOfType];
									this.recordPlay("safety", this.d, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		
								}									
							}							
						}										
					}
				} else {
					playDown = 5; // if turnover driveActive ==0, if touchdown driveActive = 1,touchdown = 1, fieldGoal = 1; 				
				}
				//// want to adjust based on run/pass/yards

				//// make based on yards
				//// adjust based on play type
		////		console.log("before: "+this.t)
		////		console.log("yardsOnPlay: "+yardsOnPlay)
		////		console.log("yardsOnPlay/100: "+yardsOnPlay/100)
				timePlay = 0;
				if (yardsOnPlay>=0) { 
				    timePlay = Math.random()/4+yardsOnPlay/100/2+.15;	
					this.t -= timePlay;		
					this.dt += timePlay;
					this.recordStat(this.o, this.playersOnCourt[this.o][0], "top",timePlay);		
					
				} else {
				    timePlay = Math.random()/4+yardsOnPlay/100*-1+.15;	
					this.t -= timePlay;		
					this.dt += timePlay;
					this.recordStat(this.o, this.playersOnCourt[this.o][0], "top",timePlay);		
				}

				if ((this.t <= 45 && this.team[0].stat.ptsQtrs.length === 1) ||
						(this.t <= 30 && this.team[0].stat.ptsQtrs.length === 2) ||
						(this.t <= 15 && this.team[0].stat.ptsQtrs.length === 3)) {
						
						if ((this.t <= 30 && this.team[0].stat.ptsQtrs.length === 2) ) {
							this.o = 1-homeTeam;
							this.d = homeTeam;
							homeTeam = this.d;
							playDown = 5;						
							fieldPosition = 150;						
						}
						if ((this.t <= 0 && this.team[0].stat.ptsQtrs.length === 4) ) {
							this.o = homeTeam;
							this.d = 1-homeTeam;
							homeTeam = this.o;
							playDown = 5;						
							fieldPosition = 150;						
						}
						
					this.team[0].stat.ptsQtrs.push(0);
					this.team[1].stat.ptsQtrs.push(0);
					this.recordPlay("quarter");					
				}
				if (this.t <= 0) {
				  playDown = 5;
				}				
				if ((interception == 1) || (fumble == 1)) {
				   playDown = 5;
				   fieldPosition *=-1;
				   fieldPosition += 100;
				}
				if ((this.overtimes > 0) && ((this.team[1].stat.ptsQtrs[this.team[1].stat.ptsQtrs.length - 1] > 0) || (this.team[0].stat.ptsQtrs[this.team[0].stat.ptsQtrs.length - 1] > 0))) {
					this.team[0].stat.ptsQtrs.push(0);
					this.team[1].stat.ptsQtrs.push(0);
					this.t = -5;
					playDown = 5;
				}
			}
		   driveActive = 0;
		}
    };

	
	
    /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.skillDifferential = function (blockRun,runStop,lineDifferentials,blockingRun,rushRun,lineDiffRunOptions) {
	
	var j,i;
	var differentialRatio;
	var extraBlockerImpact;
	var differentialRatioM;
	var diffAdjustment;
	var	teamOffense,teamOffImpact;
	var	teamDefense,teamDefImpact;
	var offset;
	
	
	///////////////// Adjust impact of these skills
	extraBlockerImpact = .5;  // extra blocker divided by number of total blockers, then half?
	diffAdjustment = .42;
	offset = 0.15;
	


// need to keep this positive using an adjustment when creating ratios

	differentialRatio = 0.5;  // individual player, Defense only counts half?
	teamDefImpact = 2;	// team, good at lower end	, less variation so more pronounced, used with offset
	differentialRatioM = 1.5; // indiv player offense, not enough player focus, 
	teamOffImpact = 0.0; // team offense

		
		if (rushRun.length>blockingRun.length) {
			
				teamOffense = 0;
				teamDefense = 0;
				for (j = 0; j < blockingRun.length; j++) {	
				//	console.log(this.team[this.o].player[blockingRun[j]].pos+" "+blockingRun.length);
					teamOffense += this.team[this.o].player[blockingRun[j]].compositeRating[blockRun]/blockingRun.length;
					teamDefense += this.team[this.d].player[rushRun[j]].compositeRating[runStop]/blockingRun.length;
				}		
			
				lineDiffRunOptions = blockingRun.length;
				for (j = 0; j < blockingRun.length; j++) {		  
				//console.log(teamOffense+"  "+teamDefense+" "+this.team[this.o].player[blockingRun[j]].compositeRating[blockRun]+" "+blockingRun.length);
					lineDifferentials.push( (this.team[this.o].player[blockingRun[j]].compositeRating[blockRun]*differentialRatioM - differentialRatio*this.team[this.d].player[rushRun[j]].compositeRating[runStop] +teamOffense*teamOffImpact-teamDefense*teamDefImpact)*diffAdjustment+offset);
				}			
				for (j = blockingRun.length; j < rushRun.length; j++) {		  
					for (i = 0; i < blockingRun.length; i++) {		  
						lineDifferentials.push( (0-extraBlockerImpact*differentialRatio*this.team[this.d].player[rushRun[i]].compositeRating[runStop]/blockingRun.length +teamOffense*teamOffImpact-teamDefense*teamDefImpact)*diffAdjustment+offset);
					}			
				}		
		} else if (rushRun.length<blockingRun.length) {
			
				teamOffense = 0;
				teamDefense = 0;
				for (j = 0; j < rushRun.length; j++) {		  
					teamOffense += this.team[this.o].player[blockingRun[j]].compositeRating[blockRun]/blockingRun.length;
					teamDefense += this.team[this.d].player[rushRun[j]].compositeRating[runStop]/blockingRun.length;
				}			
			
			
				lineDiffRunOptions = rushRun.length;		
				for (j = 0; j < rushRun.length; j++) {		  
					lineDifferentials.push( (this.team[this.o].player[blockingRun[j]].compositeRating[blockRun]*differentialRatioM  - differentialRatio*this.team[this.d].player[rushRun[j]].compositeRating.runStop+teamOffense*teamOffImpact-teamDefense*teamDefImpact	)*diffAdjustment+offset);
				}			
				for (j = rushRun.length; j < blockingRun.length; j++) {		  
					for (i = 0; i < rushRun.length; i++) {		  
						lineDifferentials.push( (extraBlockerImpact*this.team[this.o].player[blockingRun[i]].compositeRating[blockRun]/rushRun.length*differentialRatioM +teamOffense*teamOffImpact-teamDefense*teamDefImpact	)*diffAdjustment+offset);
					}		
				}																
		} else {
				teamOffense = 0;
				teamDefense = 0;
				for (j = 0; j < rushRun.length; j++) {		  
					teamOffense += this.team[this.o].player[blockingRun[j]].compositeRating[blockRun]/blockingRun.length;
					teamDefense += this.team[this.d].player[rushRun[j]].compositeRating[runStop]/blockingRun.length;
				}	
				
				lineDiffRunOptions = rushRun.length;			
				for (j = 0; j < rushRun.length; j++) {		  
					lineDifferentials.push( (this.team[this.o].player[blockingRun[j]].compositeRating[blockRun]*differentialRatioM  - differentialRatio*this.team[this.d].player[rushRun[j]].compositeRating[runStop] +teamOffense*teamOffImpact-teamDefense*teamDefImpact	)*diffAdjustment+offset);
				}			
			
		}
		lineDiffRunOptions = rushRun.length;			
			

	
	
        return ;
//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
    };
	
		

   /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.rushingYards = function (yardsProb) {
	
	var yardsOnPlay;
	
			if (yardsProb < .0000) {
				yardsOnPlay = -10;
			} else if (yardsProb < .0000) {
				yardsOnPlay = -9;
			} else if (yardsProb < .0000) {
				yardsOnPlay = -8;
			} else if (yardsProb < .0005) {
				yardsOnPlay = -7;
			} else if (yardsProb < .0015) {
				yardsOnPlay = -6;
			} else if (yardsProb < .005) {
				yardsOnPlay = -5;
			} else if (yardsProb < .014) {
				yardsOnPlay = -4;
			} else if (yardsProb < .0300) {
				yardsOnPlay = -3;
			} else if (yardsProb < .0567) {
				yardsOnPlay = -2;
			} else if (yardsProb < .1178) {
				yardsOnPlay = -1;
			} else if (yardsProb < .2123) {
				yardsOnPlay = 0;
			} else if (yardsProb < .3301) {
				yardsOnPlay = 1;
			} else if (yardsProb < .4578) {
				yardsOnPlay = 2;
			} else if (yardsProb < .575) {
				yardsOnPlay = 3;
			} else if (yardsProb < .67) {
				yardsOnPlay = 4;
			} else if (yardsProb < .7422) {
				yardsOnPlay = 5;
			} else if (yardsProb < .7907) {
				yardsOnPlay = 6;
			} else if (yardsProb < .831) {
				yardsOnPlay = 7;
			} else if (yardsProb < .8616) {
				yardsOnPlay = 8;
			} else if (yardsProb < .8904) {
				yardsOnPlay = 9;
			} else if (yardsProb < .9141) {
			//// harder to get 10 because of 1st down
			//// should be up to first down, make first down, extra
			
				yardsOnPlay = 10;
			} else if (yardsProb < .9313) {
				yardsOnPlay = 11;
			} else if (yardsProb < .9415) {
				yardsOnPlay = 12;
			} else if (yardsProb < .9509) {
				yardsOnPlay = 13;
			} else if (yardsProb < .9597) {
				yardsOnPlay = 14;
			} else if (yardsProb < .9657) {
				yardsOnPlay = 15;
			} else if (yardsProb < .9714) {
				yardsOnPlay = 16;
			} else if (yardsProb < .9759) {
				yardsOnPlay = 17;
			} else if (yardsProb < .9788) {
				yardsOnPlay = 18;
			} else if (yardsProb < .9821) {
				yardsOnPlay = 19;
			} else if (yardsProb < .9843) {
				yardsOnPlay = 20;										
			} else if (yardsProb < .9860) {
				yardsOnPlay = 21;
			} else if (yardsProb < .9877) {
				yardsOnPlay = 22;
			} else if (yardsProb < .9892) {
				yardsOnPlay = 23;
			} else if (yardsProb < .9906) {
				yardsOnPlay = 24;
			} else if (yardsProb < .9916) {
				yardsOnPlay = 25;
			} else if (yardsProb < .9925) {
				yardsOnPlay = 26;
			} else if (yardsProb < .9933) {
				yardsOnPlay = 27;
			} else if (yardsProb < .9940) {
				yardsOnPlay = 28;
			} else if (yardsProb < .9946) {
				yardsOnPlay = 29;
			} else if (yardsProb < .9951) {
				yardsOnPlay = 30;
			} else if (yardsProb < .9955) {
				yardsOnPlay = 31;
			} else if (yardsProb < .9958) {
				yardsOnPlay = 32;
			} else if (yardsProb < .9961) {
				yardsOnPlay = 33;
			} else if (yardsProb < .9963) {
				yardsOnPlay = 34;
			} else if (yardsProb < .9964) {
				yardsOnPlay = 35;
			} else if (yardsProb < .9965) {
				yardsOnPlay = 36;
			} else if (yardsProb < .9966) {
				yardsOnPlay = 37;
			} else if (yardsProb < .9967) {
				yardsOnPlay = 38;
			} else if (yardsProb < .9968) {
				yardsOnPlay = 39;
			} else if (yardsProb < .9969) {
				yardsOnPlay = 40;
			} else if (yardsProb < .9970) {
				yardsOnPlay = 41;
			} else if (yardsProb < .99705) {
				yardsOnPlay = 42;
			} else if (yardsProb < .9971) {
				yardsOnPlay = 43;
			} else if (yardsProb < .99715) {
				yardsOnPlay = 44;
			} else if (yardsProb < .9972) {
				yardsOnPlay = 45;
			} else if (yardsProb < .99725) {
				yardsOnPlay = 46;
			} else if (yardsProb < .9973) {
				yardsOnPlay = 47;
			} else if (yardsProb < .99735) {
				yardsOnPlay = 48;
			} else if (yardsProb < .9974) {
				yardsOnPlay = 49;
			} else if (yardsProb < .99745) {
				yardsOnPlay = 50;
			} else if (yardsProb < .9975) {
				yardsOnPlay = 51;
			} else if (yardsProb < .99755) {
				yardsOnPlay = 52;
			} else if (yardsProb < .9976) {
				yardsOnPlay = 53;
			} else if (yardsProb < .99765) {
				yardsOnPlay = 54;
			} else if (yardsProb < .9977) {
				yardsOnPlay = 55;
			} else if (yardsProb < .99775) {
				yardsOnPlay = 56;
			} else if (yardsProb < .9978) {
				yardsOnPlay = 57;
			} else if (yardsProb < .99785) {
				yardsOnPlay = 58;
			} else if (yardsProb < .9979) {
				yardsOnPlay = 59;
			} else if (yardsProb < .99795) {
				yardsOnPlay = 60;
			} else if (yardsProb < .9980) {
				yardsOnPlay = 61;
			} else if (yardsProb < .99805) {
				yardsOnPlay = 62;
			} else if (yardsProb < .9981) {
				yardsOnPlay = 63;
			} else if (yardsProb < .99815) {
				yardsOnPlay = 64;
			} else if (yardsProb < .9982) {
				yardsOnPlay = 65;
			} else if (yardsProb < .99825) {
				yardsOnPlay = 66;
			} else if (yardsProb < .9983) {
				yardsOnPlay = 67;
			} else if (yardsProb < .99835) {
				yardsOnPlay = 68;
			} else if (yardsProb < .9984) {
				yardsOnPlay = 69;
			} else if (yardsProb < .99845) {
				yardsOnPlay = 70;
			} else if (yardsProb < .9985) {
				yardsOnPlay = 71;
			} else if (yardsProb < .99855) {
				yardsOnPlay = 72;
			} else if (yardsProb < .9986) {
				yardsOnPlay = 73;
			} else if (yardsProb < .99865) {
				yardsOnPlay = 74;
			} else if (yardsProb < .9987) {
				yardsOnPlay = 75;
			} else if (yardsProb < .99875) {
				yardsOnPlay = 76;
			} else if (yardsProb < .9988) {
				yardsOnPlay = 77;
			} else if (yardsProb < .99885) {
				yardsOnPlay = 78;
			} else if (yardsProb < .9989) {
				yardsOnPlay = 79;
			} else if (yardsProb < .99895) {
				yardsOnPlay = 80;
			} else if (yardsProb < .9990) {
				yardsOnPlay = 81;
			} else if (yardsProb < .99905) {
				yardsOnPlay = 82;
			} else if (yardsProb < .9991) {
				yardsOnPlay = 83;
			} else if (yardsProb < .99915) {
				yardsOnPlay = 84;
			} else if (yardsProb < .9992) {
				yardsOnPlay = 85;
			} else if (yardsProb < .99925) {
				yardsOnPlay = 86;
			} else if (yardsProb < .9993) {
				yardsOnPlay = 87;
			} else if (yardsProb < .99935) {
				yardsOnPlay = 88;
			} else if (yardsProb < .9994) {
				yardsOnPlay = 89;
			} else if (yardsProb < .99945) {
				yardsOnPlay = 90;
			} else if (yardsProb < .9995) {
				yardsOnPlay = 91;
			} else if (yardsProb < .99955) {
				yardsOnPlay = 92;
			} else if (yardsProb < .9996) {
				yardsOnPlay = 93;
			} else if (yardsProb < .99965) {
				yardsOnPlay = 94;
			} else if (yardsProb < .9997) {
				yardsOnPlay = 95;
			} else if (yardsProb < .99975) {
				yardsOnPlay = 96;
			} else if (yardsProb < .9998) {
				yardsOnPlay = 97;
			} else if (yardsProb < .99985) {
				yardsOnPlay = 98;
			} else if (yardsProb < .9999) {
				yardsOnPlay = 99;
			} else  {
				yardsOnPlay = 100;
			}

	
	
        return yardsOnPlay;
    };
	
		
   /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.passingYards = function (yardsProb) {
	
	
	var yardsOnPlay;
          // first 10 or so are sacks if cross/long , could be pass if short?
		  // 0 is incomplete
		  // +0 is pass
	
			if (yardsProb < .0000) {
				yardsOnPlay = -10;
			} else if (yardsProb < .0060) {
				yardsOnPlay = -9;
			} else if (yardsProb < .0140) {
				yardsOnPlay = -8;
			} else if (yardsProb < .024) {
				yardsOnPlay = -7;
			} else if (yardsProb < .032) {
				yardsOnPlay = -6;
			} else if (yardsProb < .038) {
				yardsOnPlay = -5;
			} else if (yardsProb < .044) {
				yardsOnPlay = -4;
			} else if (yardsProb < .048) {
				yardsOnPlay = -3;
			} else if (yardsProb < .051) {
				yardsOnPlay = -2;
			} else if (yardsProb < .059) {
				yardsOnPlay = -1;
			} else if (yardsProb < .439) {
				yardsOnPlay = 0;
			} else if (yardsProb < .449) {
				yardsOnPlay = 1;
			} else if (yardsProb < .464) {
				yardsOnPlay = 2;
			} else if (yardsProb < .489) {
				yardsOnPlay = 3;
			} else if (yardsProb < .519) {
				yardsOnPlay = 4;
			} else if (yardsProb < .559) {
				yardsOnPlay = 5;
			} else if (yardsProb < .599) {
				yardsOnPlay = 6;
			} else if (yardsProb < .639) {
				yardsOnPlay = 7;
			} else if (yardsProb < .678) {
				yardsOnPlay = 8;
			} else if (yardsProb < .718) {
				yardsOnPlay = 9;
			} else if (yardsProb < .733) {
			//// harder to get 10 because of 1st down
			//// should be up to first down, make first down, extra
			
				yardsOnPlay = 10;
			} else if (yardsProb < .758) {
				yardsOnPlay = 11;
			} else if (yardsProb < .782) {
				yardsOnPlay = 12;
			} else if (yardsProb < .802) {
				yardsOnPlay = 13;
			} else if (yardsProb < .82) {
				yardsOnPlay = 14;
			} else if (yardsProb < .83629) {
				yardsOnPlay = 15;
			} else if (yardsProb < .850) {
				yardsOnPlay = 16;
			} else if (yardsProb < .863) {
				yardsOnPlay = 17;
			} else if (yardsProb < .875) {
				yardsOnPlay = 18;
			} else if (yardsProb < .885) {
				yardsOnPlay = 19;
			} else if (yardsProb < .8948) {
				yardsOnPlay = 20;										
			} else if (yardsProb < .9037) {
				yardsOnPlay = 21;
			} else if (yardsProb < .9117) {
				yardsOnPlay = 22;
			} else if (yardsProb < .9290) {
				yardsOnPlay = 23;
			} else if (yardsProb < .9356) {
				yardsOnPlay = 24;
			} else if (yardsProb < .9416) {
				yardsOnPlay = 25;
			} else if (yardsProb < .9470) {
				yardsOnPlay = 26;
			} else if (yardsProb < .9519) {
				yardsOnPlay = 27;
			} else if (yardsProb < .9563) {
				yardsOnPlay = 28;
			} else if (yardsProb < .9603) {
				yardsOnPlay = 29;
			} else if (yardsProb < .9639) {
				yardsOnPlay = 30;
			} else if (yardsProb < .9672) {
				yardsOnPlay = 31;
			} else if (yardsProb < .9702) {
				yardsOnPlay = 32;
			} else if (yardsProb < .9729) {
				yardsOnPlay = 33;
			} else if (yardsProb < .9750) {
				yardsOnPlay = 34;
			} else if (yardsProb < .9772) {
				yardsOnPlay = 35;
			} else if (yardsProb < .9792) {
				yardsOnPlay = 36;
			} else if (yardsProb < .9810) {
				yardsOnPlay = 37;
			} else if (yardsProb < .9826) {
				yardsOnPlay = 38;
			} else if (yardsProb < .9841) {
				yardsOnPlay = 39;
			} else if (yardsProb < .9854) {
				yardsOnPlay = 40;
			} else if (yardsProb < .9866) {
				yardsOnPlay = 41;
			} else if (yardsProb < .9877) {
				yardsOnPlay = 42;
			} else if (yardsProb < .9886) {
				yardsOnPlay = 43;
			} else if (yardsProb < .9895) {
				yardsOnPlay = 44;
			} else if (yardsProb < .9903) {
				yardsOnPlay = 45;
			} else if (yardsProb < .9910) {
				yardsOnPlay = 46;
			} else if (yardsProb < .9916) {
				yardsOnPlay = 47;
			} else if (yardsProb < .9922) {
				yardsOnPlay = 48;
			} else if (yardsProb < .9927) {
				yardsOnPlay = 49;
			} else if (yardsProb < .99319) {
				yardsOnPlay = 50;
			} else if (yardsProb < .99363) {
				yardsOnPlay = 51;
			} else if (yardsProb < .99403) {
				yardsOnPlay = 52;
			} else if (yardsProb < .99439) {
				yardsOnPlay = 53;
			} else if (yardsProb < .99472) {
				yardsOnPlay = 54;
			} else if (yardsProb < .99502) {
				yardsOnPlay = 55;
			} else if (yardsProb < .99529) {
				yardsOnPlay = 56;
			} else if (yardsProb < .99553) {
				yardsOnPlay = 57;
			} else if (yardsProb < .99575) {
				yardsOnPlay = 58;
			} else if (yardsProb < .99595) {
				yardsOnPlay = 59;
			} else if (yardsProb < .99613) {
				yardsOnPlay = 60;
			} else if (yardsProb < .99629) {
				yardsOnPlay = 61;
			} else if (yardsProb < .99643) {
				yardsOnPlay = 62;
			} else if (yardsProb < .99656) {
				yardsOnPlay = 63;
			} else if (yardsProb < .99668) {
				yardsOnPlay = 64;
			} else if (yardsProb < .99679) {
				yardsOnPlay = 65;
			} else if (yardsProb < .99689) {
				yardsOnPlay = 66;
			} else if (yardsProb < .99698) {
				yardsOnPlay = 67;
			} else if (yardsProb < .99707) {
				yardsOnPlay = 68;
			} else if (yardsProb < .99715) {
				yardsOnPlay = 69;
			} else if (yardsProb < .99722) {
				yardsOnPlay = 70;
			} else if (yardsProb < .99728) {
				yardsOnPlay = 71;
			} else if (yardsProb < .99733) {
				yardsOnPlay = 72;
			} else if (yardsProb < .99737) {
				yardsOnPlay = 73;
			} else if (yardsProb < .99741) {
				yardsOnPlay = 74;
			} else if (yardsProb < .99745) {
				yardsOnPlay = 75;
			} else if (yardsProb < .99749) {
				yardsOnPlay = 76;
			} else if (yardsProb < .99752) {
				yardsOnPlay = 77;
			} else if (yardsProb < .99755) {
				yardsOnPlay = 78;
			} else if (yardsProb < .99758) {
				yardsOnPlay = 79;
			} else if (yardsProb < .99760) {
				yardsOnPlay = 80;
			} else if (yardsProb < .99762) {
				yardsOnPlay = 81;
			} else if (yardsProb < .99764) {
				yardsOnPlay = 82;
			} else if (yardsProb < .99766) {
				yardsOnPlay = 83;
			} else if (yardsProb < .99767) {
				yardsOnPlay = 84;
			} else if (yardsProb < .99768) {
				yardsOnPlay = 85;
			} else if (yardsProb < .99769) {
				yardsOnPlay = 86;
			} else if (yardsProb < .99770) {
				yardsOnPlay = 87;
			} else if (yardsProb < .99771) {
				yardsOnPlay = 88;
			} else if (yardsProb < .99772) {
				yardsOnPlay = 89;
			} else if (yardsProb < .99773) {
				yardsOnPlay = 90;
			} else if (yardsProb < .99774) {
				yardsOnPlay = 91;
			} else if (yardsProb < .99775) {
				yardsOnPlay = 92;
			} else if (yardsProb < .99776) {
				yardsOnPlay = 93;
			} else if (yardsProb < .99777) {
				yardsOnPlay = 94;
			} else if (yardsProb < .99778) {
				yardsOnPlay = 95;
			} else if (yardsProb < .99779) {
				yardsOnPlay = 96;
			} else if (yardsProb < .99780) {
				yardsOnPlay = 97;
			} else if (yardsProb < .99781) {
				yardsOnPlay = 98;
			} else if (yardsProb < .99782) {
				yardsOnPlay = 99;
			} else  {
			      //// higher than real odds, but limited by field position
			
				yardsOnPlay = 100;
			}

	
	
        return yardsOnPlay;
    };
	
	
	
    /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.sortSkill = function (compareRunPower,runningPower) {
	
	var j,i,k,tempVar;
	
	

			//// sort and give location
			for (j = 0; j < runningPower.length; j++) {		  			
				for (k = j; k < runningPower.length; k++) {		  			
			  
					//i = runningDetailed[j];			
					
					if (compareRunPower[j] < compareRunPower[k]) {
					   tempVar = compareRunPower[j];
					   compareRunPower[j] = compareRunPower[k];
					   compareRunPower[k] = tempVar;
					   tempVar = runningPower[j];
					   runningPower[j] = runningPower[k];
					   runningPower[k] = tempVar;
					}
				}			
			}			
			
        return ;
//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
    };
	
	
    /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.sortSkillDefense = function (compareRunPower,runningPower) {
	
	var j,i,k,tempVar;
	


			//// sort and give location
			for (j = 0; j < runningPower.length; j++) {		  			
				for (k = j; k < runningPower.length; k++) {		  						  	
					
					if (compareRunPower[j] < compareRunPower[k]) {
					   tempVar = compareRunPower[j];
					   compareRunPower[j] = compareRunPower[k];
					   compareRunPower[k] = tempVar;
					   tempVar = runningPower[j];
					   runningPower[j] = runningPower[k];
					   runningPower[k] = tempVar;
					}
				}			
			}							
	
        return ;
//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
    };
	
	
	
	
    /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.dDown = function () {
	
	
	    // calculate opposing line, secondary, linebacker
		//  QB, WR1,WR2,WR3, RB, 
		// create matchups (lineman, 
		
		
		// create composites
		// - recieving
		// - running
		// - throwing
		// - blocking
		// - rushing
		// - tackling
		
		    //this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing
		
		
	
        return ;
//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
    };
	
	
	
    /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probTov = function () {
        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
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
        this.recordStat(this.o, p, "tov");
        if (this.probStl() > Math.random()) {
            return this.doStl(p);  // "stl"
        } else {
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
        return 0.55 * this.team[this.d].compositeRating.defensePerimeter / (0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
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
     * Shot.
     * 
     * @memberOf core.gameSim
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @return {string} Either "fg" or output of this.doReb, depending on make or miss and free throws.
     */
    GameSim.prototype.doShot = function (shooter) {
        var fatigue, p, passer, probMake, probAndOne, probMissAndFoul, r1, r2, r3, ratios, type;

        p = this.playersOnCourt[this.o][shooter];

        fatigue = this.fatigue(this.team[this.o].player[p].stat.energy);

        // Is this an "assisted" attempt (i.e. an assist will be recorded if it's made)
        passer = -1;
        if (this.probAst() > Math.random()) {
            ratios = this.ratingArray("passing", this.o, 2);
            passer = this.pickPlayer(ratios, shooter);
        }

        // Pick the type of shot and store the success rate (with no defense) in probMake and the probability of an and one in probAndOne
        if (this.team[this.o].player[p].compositeRating.shootingThreePointer > 0.4 && Math.random() < (0.35 * this.team[this.o].player[p].compositeRating.shootingThreePointer)) {
            // Three pointer
            type = "threePointer";
            probMissAndFoul = 0.02;
            probMake = this.team[this.o].player[p].compositeRating.shootingThreePointer * 0.5 + 0.1;
            probAndOne = 0.01;
        } else {
            r1 = Math.random() * this.team[this.o].player[p].compositeRating.shootingMidRange;
            r2 = Math.random() * (this.team[this.o].player[p].compositeRating.shootingAtRim + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def));  // Synergy makes easy shots either more likely or less likely
            r3 = Math.random() * (this.team[this.o].player[p].compositeRating.shootingLowPost + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def));  // Synergy makes easy shots either more likely or less likely
            if (r1 > r2 && r1 > r3) {
                // Two point jumper
                type = "midRange";
                probMissAndFoul = 0.07;
                probMake = this.team[this.o].player[p].compositeRating.shootingMidRange * 0.3 + 0.29;
                probAndOne = 0.05;
            } else if (r2 > r3) {
                // Dunk, fast break or half court
                type = "atRim";
                probMissAndFoul = 0.37;
                probMake = this.team[this.o].player[p].compositeRating.shootingAtRim * 0.3 + 0.52;
                probAndOne = 0.25;
            } else {
                // Post up
                type = "lowPost";
                probMissAndFoul = 0.33;
                probMake = this.team[this.o].player[p].compositeRating.shootingLowPost * 0.3 + 0.37;
                probAndOne = 0.15;
            }
        }

        probMake = (probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) * fatigue;

        // Assisted shots are easier
        if (passer >= 0) {
            probMake += 0.025;
        }

        if (this.probBlk() > Math.random()) {
            return this.doBlk(shooter, type);  // orb or drb
        }

        // Make
        if (probMake > Math.random()) {
            // And 1
            if (probAndOne > Math.random()) {
                return this.doFg(shooter, passer, type, true);  // fg, orb, or drb
            }
            return this.doFg(shooter, passer, type);  // fg
        }

        // Miss, but fouled
        if (probMissAndFoul > Math.random()) {
            if (type === "threePointer") {
                return this.doFt(shooter, 3);  // fg, orb, or drb
            }
            return this.doFt(shooter, 2);  // fg, orb, or drb
        }

        // Miss
        p = this.playersOnCourt[this.o][shooter];
        this.recordStat(this.o, p, "fga");
        if (type === "atRim") {
            this.recordStat(this.o, p, "fgaAtRim");
            this.recordPlay("missAtRim", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
            this.recordStat(this.o, p, "fgaLowPost");
            this.recordPlay("missLowPost", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
            this.recordStat(this.o, p, "fgaMidRange");
            this.recordPlay("missMidRange", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
            this.recordStat(this.o, p, "tpa");
            this.recordPlay("missTp", this.o, [this.team[this.o].player[p].name]);
        }
        return this.doReb();  // orb or drb
    };

    /**
     * Probability that a shot taken this possession is blocked.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probBlk = function () {
        return 0.1 * this.team[this.d].compositeRating.blocking;
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
        this.recordStat(this.o, p, "fga");
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
    GameSim.prototype.doFg = function (shooter, passer, type, andOne) {
        var p;

        p = this.playersOnCourt[this.o][shooter];
        this.recordStat(this.o, p, "fga");
        this.recordStat(this.o, p, "fg");
        this.recordStat(this.o, p, "pts", 2);  // 2 points for 2's
        if (type === "atRim") {
            this.recordStat(this.o, p, "fgaAtRim");
            this.recordStat(this.o, p, "fgAtRim");
            this.recordPlay("fgAtRim" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
            this.recordStat(this.o, p, "fgaLowPost");
            this.recordStat(this.o, p, "fgLowPost");
            this.recordPlay("fgLowPost" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
            this.recordStat(this.o, p, "fgaMidRange");
            this.recordStat(this.o, p, "fgMidRange");
            this.recordPlay("fgMidRange" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
            this.recordStat(this.o, p, "pts");  // Extra point for 3's
            this.recordStat(this.o, p, "tpa");
            this.recordStat(this.o, p, "tp");
            this.recordPlay("tp" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        }

        if (passer >= 0) {
            p = this.playersOnCourt[this.o][passer];
            this.recordStat(this.o, p, "ast");
            this.recordPlay("ast", this.o, [this.team[this.o].player[p].name]);
        }

        if (andOne) {
            return this.doFt(shooter, 1);  // fg, orb, or drb
        }
        return "fg";
    };

    /**
     * Probability that a shot taken this possession is assisted.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probAst = function () {
        return 0.6 * (2 + this.team[this.o].compositeRating.passing) / (2 + this.team[this.d].compositeRating.defense);
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
    GameSim.prototype.ratingArray = function (rating, t, power) {
        var array, i, p;

        power = power !== undefined ? power : 1;

        array = [0, 0, 0, 0, 0];
        for (i = 0; i < 5; i++) {
            p = this.playersOnCourt[t][i];
            array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] * this.fatigue(this.team[t].player[p].stat.energy), power);
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
    GameSim.prototype.ratingArraySimple = function (rating,power) {
        var array, i;

        power = power !== undefined ? power : 1;
        array = [];
		
        for (i = 0; i < rating.length; i++) {
			array.push(0);
		}

        for (i = 0; i < rating.length; i++) {
//            p = this.playersOnCourt[t][i];
            array[i] = Math.pow(rating[i], power);
        }

        return array;
    };
	
	
    GameSim.prototype.ratingArraySimplest = function (player, rating, t, power) {
   /*     var array, i, p;

        power = power !== undefined ? power : 1;

        array = [0, 0, 0, 0, 0];
        for (i = 0; i < 5; i++) {
            p = this.playersOnCourt[t][i];
            array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] * this.fatigue(this.team[t].player[p].stat.energy), power);
        }*/

        var array, i, p;

        power = power !== undefined ? power : 1;
        array = [];
		
        for (i = 0; i < player.length; i++) {
			array.push(0);
		}

        for (i = 0; i < player.length; i++) {
			// this is pulling offensive players, need to fix, want defensive
			if (player[i]< this.playersOnCourt[t].length) {
				p = this.playersOnCourt[t][player[i]];
				console.log(player[i]+" "+p);
				array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] * this.fatigue(this.team[t].player[p].stat.energy), power);
			} else {
				array[i] = 0;
				
			}
			
//            array[i] = Math.pow(rating[i], power);
        }

      //  return array;		
		
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
        } else if (rand < (ratios[0] + ratios[1])) {
            pick = 1;
        } else if (rand < (ratios[0] + ratios[1] + ratios[2])) {
            pick = 2;
        } else if (rand < (ratios[0] + ratios[1] + ratios[2] + ratios[3])) {
            pick = 3;
        } else {
            pick = 4;
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
    GameSim.prototype.pickPlayerVariable = function (ratios,length, exempt) {
        var pick, rand,sum,i,partialSum;

        exempt = exempt !== undefined ? exempt : false;

        if (exempt !== false) {
            ratios[exempt] = 0;
        }
		
		sum = 0;
		partialSum = [];
        for (i = 0; i < length; i++) {
			if (ratios.length>i) {
				sum += ratios[i];
				if (i == 0) {
					partialSum.push(ratios[i]);
				} else {
					partialSum.push(ratios[i]+partialSum[i-1]);
				}				
			}

		}
		//console.log(ratios);				
		//console.log(sum);		
		//console.log(partialSum);
		//console.log(rand);		
		//console.log(Math.random());				
        rand = Math.random() * (sum);
		//console.log(rand);				
        if (rand < partialSum[0]) {
            pick = 0;
        } else if (rand < partialSum[1]) {
            pick = 1;
        } else if (rand < partialSum[2]) {
            pick = 2;
        } else if (rand < partialSum[3]) {
            pick = 3;
        } else if (rand < partialSum[4]) {
            pick = 4;
        } else if (rand < partialSum[5]) {
            pick = 5;
        } else if (rand < partialSum[6]) {
            pick = 6;
        } else if (rand < partialSum[7]) {
            pick = 7;
        } else if (rand < partialSum[8]) {
            pick = 8;
        } else if (rand < partialSum[9]) {
            pick = 9;
        } else if (rand < partialSum[10]) {
            pick = 10;
        } else if (rand < partialSum[11]) {
            pick = 11;
        } else if (rand < partialSum[12]) {
            pick = 12;
        } else if (rand < partialSum[13]) {
            pick = 13;
        } else if (rand < partialSum[14]) {
            pick = 14;
        } else if (rand < partialSum[15]) {
            pick = 15;
        } else if (rand < partialSum[16]) {
            pick = 16;
        } else if (rand < partialSum[17]) {
            pick = 17;
        } else if (rand < partialSum[18]) {
            pick = 18;
        } else if (rand < partialSum[19]) {
            pick = 19;
        } else {
            pick = 20;
			console.log("got last pick, might be a bug in data");
			console.log(ratios);			
			console.log(partialSum);
			
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
		
	//	console.log(t+" "+p+" "+s+" "+amt);
		
        if (s !== "gs" && s !== "courtTime" && s !== "benchTime" && s !== "energy") {
            this.team[t].stat[s] += amt;
            // Record quarter-by-quarter scoring too
            if (s === "pts") {
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

    GameSim.prototype.recordPlay = function (type, t, names,yardsOnPlay,down,yardToGo,fieldPosition) {
        var i, qtr, sec, text, texts;
		var tAdj;
		var fieldPositionSide,fieldPositionAdj;
		
		if (fieldPosition>=50) {
		  fieldPositionAdj = 100 - fieldPosition;
		  fieldPositionSide = "Opp";
		} else {
		  fieldPositionAdj = fieldPosition;
		  fieldPositionSide = "Own";
		}
		
        if (this.playByPlay !== undefined) {
            if (type === "injury") {
                texts = ["{0} was injured!"];
            } else if (type === "td") {
                texts = ["{0} scored a touchdown"];
				//console.log(texts);				
            } else if (type === "ep") {
                texts = ["{0} made the extra point"];
				//console.log(texts);				
            } else if (type === "epm") {
                texts = ["{0} missed the extra point"];
				//console.log(texts);				
            } else if (type === "punt") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+" , {0} punted the ball for "+yardsOnPlay+" yards"];
				//console.log(texts);				
            } else if (type === "puntTouch") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+" , {0} punted the ball into the endzone for a touchback"];							
				//console.log(texts);				
            } else if (type === "kickoff") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+" , {0} kicked off the ball for "+yardsOnPlay+" yards"];
				//console.log(texts);				
            } else if (type === "kickoffTouch") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+" , {0} kicked off the ball into the endzone for a touchback"];							
				//console.log(texts);				
            } else if (type === "fg") {
                texts = ["{0} made a field goal from "+yardsOnPlay+" yards out"];
            } else if (type === "fgm") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+" , {0} missed a field goal from "+yardsOnPlay+" yards out"];
            } else if (type === "pass") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+", {0} caught the ball for "+yardsOnPlay+" yards"];
            } else if (type === "rush") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+", {0} ran the ball for "+yardsOnPlay+" yards"];
            } else if (type === "passTD") {
                texts = ["{0} caught the ball for "+yardsOnPlay+" yards and scored a touchdown"];
				//console.log(texts);				
            } else if (type === "rushTD") {
                texts = ["{0} ran the ball for "+yardsOnPlay+" yards and scored a touchdown"];
				//console.log(texts);				
            } else if (type === "sack") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+", {0} sacked the QB for a loss of "+yardsOnPlay+" yards"];
            } else if (type === "sackGroup") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+", QB sacked for a loss of "+yardsOnPlay+" yards"];
            } else if (type === "int") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+", {0} threw an <b>interception</b>"];
				//console.log(texts);
            } else if (type === "fumble") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+", {0} <b>fumbled</b>"];
				//console.log(texts);				
            } else if (type === "safety") {
                texts = ["Safety, defense scores two"];
				//console.log(texts);				
            } else if (type === "inc") {
                texts = ["("+down+"-"+yardToGo+") on "+fieldPositionSide+" "+fieldPositionAdj+", incomplete pass to {0}"];
     //       } else if (type === "down") {
    //            texts = [down+"-"+yardsOnPlay];
      /*      } else if (type === "tov") {
                texts = ["{0} turned the ball over"];
            } else if (type === "stl") {
                texts = ["{0} stole the ball from {1}"];
            } else if (type === "fgAtRim") {
                texts = ["{0} made a dunk/layup"];
            } else if (type === "fgAtRimAndOne") {
                texts = ["{0} made a dunk/layup and got fouled!"];
            } else if (type === "fgLowPost") {
                texts = ["{0} made a low post shot"];
            } else if (type === "fgLowPostAndOne") {
                texts = ["{0} made a low post shot and got fouled!"];
            } else if (type === "fgMidRange") {
                texts = ["{0} made a mid-range shot"];
            } else if (type === "fgMidRangeAndOne") {
                texts = ["{0} made a mid-range shot and got fouled!"];
            } else if (type === "tp") {
                texts = ["{0} made a three pointer shot"];
            } else if (type === "tpAndOne") {
                texts = ["{0} made a three pointer and got fouled!"];
            } else if (type === "blkAtRim") {
                texts = ["{0} blocked {1}'s dunk/layup"];
            } else if (type === "blkLowPost") {
                texts = ["{0} blocked {1}'s low post shot"];
            } else if (type === "blkMidRange") {
                texts = ["{0} blocked {1}'s mid-range shot"];
            } else if (type === "blkTp") {
                texts = ["{0} blocked {1}'s three pointer"];
            } else if (type === "missAtRim") {
                texts = ["{0} missed a dunk/layup"];
            } else if (type === "missLowPost") {
                texts = ["{0} missed a low post shot"];
            } else if (type === "missMidRange") {
                texts = ["{0} missed a mid-range shot"];
            } else if (type === "missTp") {
                texts = ["{0} missed a three pointer"];
            } else if (type === "orb") {
                texts = ["{0} grabbed the offensive rebound"];
            } else if (type === "drb") {
                texts = ["{0} grabbed the defensive rebound"];
            } else if (type === "ast") {
                texts = ["(assist: {0})"]; */
            } else if (type === "quarter") {
                texts = ["<b>Start of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length) + " quarter</b>"];
			//	console.log(texts);						
            } else if (type === "overtime") {
                texts = ["<b>Start of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length - 4) + " overtime period</b>"];
				//console.log(texts);						
/*            } else if (type === "ft") {
                texts = ["{0} made a free throw"];
            } else if (type === "missFt") {
                texts = ["{0} missed a free throw"];
            } else if (type === "pf") {
                texts = ["Foul on {0}"];
            } else if (type === "foulOut") {
                texts = ["{0} fouled out"]; */
            } else if (type === "sub") {
                texts = ["Substitution: {0} for {1}"];
            }

		//	console.log(texts);
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
	/*				if (sec < 15) {
					} else if (sec <30) {
					  sec -= 15;
					} else if (sec <45) {
					  sec -= 30;
					} else {
					  sec -= 45;
					}
                    if (sec < 10) {
                        sec = "0" + sec;
                    }*/
					//// done use t, use something else
					//this.team[0].stat.ptsQtrs.length
                    if (sec < 10) {
                        sec = "0" + sec;
                    }
										
					if ((this.team[0].stat.ptsQtrs.length == 4) || (this.overtimes>0)) {
					  tAdj = this.t;					 
					  if (tAdj < 0) {
					   tAdj = 0;
					   sec = "00";					   
					  }
					} else if (this.team[0].stat.ptsQtrs.length == 3) {
					  tAdj = this.t - 15;
					  if (tAdj < 0) {
					   tAdj = 0;
					   sec = "00";					   
					  }
					} else if (this.team[0].stat.ptsQtrs.length == 2) {
					  tAdj = this.t - 30;
					  if (tAdj < 0) {
					   tAdj = 0;
					   sec = "00";
					   }
					} else {
					  tAdj = this.t - 45;
					  if (tAdj < 0) {
					   tAdj = 0;
					   sec = "00";
					  }
					}
/*					if (this.t < 15) {
					  tAdj = this.t;					 
					} else if (this.t <30) {
					  tAdj = this.t - 15;
					} else if (this.t <45) {
					  tAdj = this.t - 30;
					} else {
					  tAdj = this.t - 45;
					}*/

					
                    this.playByPlay.push({
                        type: "text",
                        text: text,
                        t: t,
                        time: Math.floor(tAdj) + ":" + sec
//                        time: Math.floor(this.t) + ":" + sec
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