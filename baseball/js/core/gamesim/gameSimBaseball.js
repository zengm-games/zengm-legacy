/**
 * @name core.gameSim.gameSimBaseball
 * @namespace Individual game simulation.
 */
//define(["lib/underscore", "util/helpers", "util/random","js/player"], function (_, helpers, random,player) {
define(["lib/underscore", "globals", "util/helpers", "util/random"], function (_, g, helpers, random) {
    "use strict";

	//battingOrder, ptModifier
	
	var battingorder = [[0,1,2,3,4,5,6,7,8],[0,1,2,3,4,5,6,7,8]];
	var positionplayers = [[0,1,2,3,4,5,6,7,8],[0,1,2,3,4,5,6,7,8]];

	var playByPlayOrder = [[],[]];
	var playByPlayOrderPitching = [[],[]];
//	var battingOrderPlayByPlay = 8;
	//var pitchingOrderPlayByPlay = 0;
	var battingOrderPlayByPlay = [8,8];
	var pitchingOrderPlayByPlay = [0,0];
	var liveGameDisplay = [20,20];
	//               <tr data-bind="if: min">
//               <tr data-bind="if: fgaLowPost"> 

	
	var battingOrderGame = [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]] ;
	var fieldingPosition = [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]] ;
	var fieldersGlobal = [0,0,0,0,0,0,0,0,0];
	var batter = [0,0];
	var batterbackup = [0,0];
	var debug = 0;
	var debug1 = 0;
	var debug2 = 0;	
	var debug3 = 0;		
	var debug4 = 0;		
	var debug5 = 0;	
	var debug6 = 0;
	var debug7 = 0;	
	var debug8 = 0;		
	var debug9 = 0;		
	var debug10 = 0;	
	var debug11 = 0;
	var team = 0;
	var winningPitcher = [100,100];
	var losingPitcher = [100,100];
	var saveOpp = [100,100];
	var savingPitcher = [100,100];
	
	var inningsPitched;
	var priorPitcher;
	
	//fielders[i] = positionplayers[this.d][i];							
	//battingorder[8] = positionplayers[this.o][lastspot[this.o]];		
	
	
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
     *                 "battingOrder": 0	 
     *             },
     *             ...
     *         ]
     *     }
     * @param {Object} team2 Same as team1, but for the away team.
     */
	 
	 //// Baseball
	 // get innings out correct
	 // 9 inninings, 3 outs per possession
	 // keep batter position for later
	 // no need for time
	 // overtime used as innings
	 
    function GameSim(gid, team1, team2, doPlayByPlay) {
	
	
		var i;
	    var offenseArray = [];
	    var defenseArray = [];		
	    var kickerArray = [];		
	    var oBenchArray = [];		
	    var dBenchArray = [];		
	    var kBenchArray = [];		
	    var oInactiveArray = [];		
	    var dInactiveArray = [];		
	    var kInactiveArray = [];		
	    var offenseCount = 0;
	    var defenseCount = 0;		
	    var kickerCount = 0;		
	    var oBenchCount = 0;	
		var benchCount	 = 0;	
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
        this.team = [team2, team1];  // If a team plays twice in a day, this needs to be a deep copy
		// making home second team
        this.numPossessions = 9; // 4 possession eaquals 2 innings,  (can have 2 innings for Q1,Q2,Q3, and 3 for Q4) (also experiment with Q1-Q4 2, and OT being 1 inning)
        this.dt = 3; // outs per possession
//        this.numPossessions = Math.round((this.team[0].pace + this.team[1].pace) / 2 * random.uniform(0.9, 1.1));
//        this.dt = 48 / (2 * this.numPossessions); // Time elapsed per possession

        // Starting lineups, which will be reset by updatePlayersOnCourt. This must be done because of injured players in the top 5.
        this.playersOnCourt = [[0, 1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24], [0, 1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]];				
		


				
		for (j = 0; j < 2; j++) {
			teamPlayer = j;
			offenseCount = 0;
			defenseCount = 0;
			kickerCount = 0;
			dBenchCount = 0;
			benchCount = 0;
			oBenchCount = 0;
			kBenchCount = 0;
			oInactiveCount = 0;
			dInactiveCount = 0;
			kInactiveCount = 0;
			
			for (i = 0; i < this.team[teamPlayer].player.length; i++) {
				
				if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="off") && (offenseCount < 8)) {
					if (( .1 > Math.random() ) &&( (this.team[teamPlayer].player[i].compositeRating.endurance) > Math.random() ) && ((g.phase !== g.PHASE.PLAYOFFS) )) {
						this.playersOnCourt[teamPlayer][8+6+0+benchCount] = i;
						oBenchCount += 1;				
						benchCount += 1;						
						
					} else {
						this.playersOnCourt[teamPlayer][offenseCount] = i;							
						offenseCount += 1;
						
					}
				} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="def") && (defenseCount < 6)) {
					this.playersOnCourt[teamPlayer][defenseCount+8] = i;														
					defenseCount += 1;				
				} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="def")) {
					this.playersOnCourt[teamPlayer][8+6+0+benchCount] = i;														
					dBenchCount += 1;	
					benchCount += 1;						
				} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK=="off")) {
					this.playersOnCourt[teamPlayer][8+6+0+benchCount] = i;
					oBenchCount += 1;				
					benchCount += 1;						
				} else if (this.team[teamPlayer].player[i].offDefK=="off") {
					oInactiveCount += 1;				
				} else if (this.team[teamPlayer].player[i].offDefK=="def") {
					dInactiveCount += 1;				
				} else {
					kInactiveCount += 1;				
				}	
			}
		}
		
        this.startersRecorded = false;  // Used to track whether the *real* starters have been recorded or not.
  //      this.updatePlayersOnCourt();

        this.subsEveryN = 6;  // How many possessions to wait before doing substitutions

        this.overtimes = 0;  // Number of overtime periods that have taken place

        this.t = 12; // Game clock, in minutes

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
			// these are switched for Baseball?
            if (t === 1) {
                factor = 0.99;  // Bonus for home team
            } else {
                factor = 1.01;  // Penalty for away team
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
        var out, p, t, i;

        // Simulate the game up to the end of regulation
		batter = [0,0];
	    battingOrderPlayByPlay = [8,8];		
		pitchingOrderPlayByPlay = [0,0];
		liveGameDisplay = [20,20];
		inningsPitched = 0;
	    priorPitcher = 100;		
        this.simPossessions(0);

        for (t = 2; t < 10; t++) {
//			this.team[0].stat.inning[t - 1] = t;
			this.team[1].stat.inning[t - 2] = t;
			//		  <tbody data-bind="foreach: boxScore.teams">
//              <th data-bind="text: $data"></th>
//			            <!-- ko if: (inning) -->			
            //<!-- /ko -->

		}
		
		
        // Play overtime periods if necessary
        while (this.team[0].stat.pts === this.team[1].stat.pts) {
            if (this.overtimes === 0) {
              //  Baseball: these are fixed numbers now
                this.numPossessions = 1;  // 5 minutes of possessions
                this.dt = 3;
              //  this.numPossessions = Math.round(this.numPossessions * 5 / 48);  // 5 minutes of possessions
              //  this.dt = 5 / (2 * this.numPossessions);
            }
            this.t = 6; // baseball: overtime is 6 outs, 1 possession each, 3 outs each half inning (dt)
            this.overtimes += 1;
            this.team[0].stat.ptsQtrs.push(0);
            this.team[1].stat.ptsQtrs.push(0);
	//		this.team[0].stat.inning[this.team[0].stat.ptsQtrs.length - 1] = this.team[0].stat.ptsQtrs.length;
			this.team[1].stat.inning[this.team[1].stat.ptsQtrs.length - 2] = this.team[1].stat.ptsQtrs.length;
       //     this.recordPlay("overtime");
	         
            this.simPossessions(this.overtimes);			
        }

//	var winningPitcher = [100,100];
//	var losingPitcher = [100,100];
		
		
		if (this.team[0].stat.pts > this.team[1].stat.pts) {
				this.recordPlay("win", 0, [this.team[0].player[winningPitcher[0]].name]);		 // this.team[this.o].player[p].name
			//	console.log("win: "+winningPitcher[0]);
			//	console.log("name: "+this.team[0].player[winningPitcher[0]].name);				
			//	console.log("los: "+losingPitcher[1]);
			//	console.log("name: "+this.team[1].player[losingPitcher[1]].name);				
				this.recordPlay("loss", 1, [this.team[1].player[losingPitcher[1]].name]);		 // this.team[this.o].player[p].name		
				//this.recordPlay("loss", 0, this.team[1].player[losingPitcher[0]].name);		 // this.team[this.o].player[p].name		
				this.recordStat(0, winningPitcher[0], "winP");				
				this.recordStat(1, losingPitcher[1], "lossP");
			//	console.log("0: "+saveOpp[0]);
			//	console.log(this.overtimes);
			//	console.log(savingPitcher[0]);
				
				//this.playersOnCourt[this.d][fielders[0]]  /savingPitcher[this.d]
				if ((saveOpp[0] == 1) && (this.overtimes == 0)) {
					this.recordStat(0, savingPitcher[0], "save",1);
					//savingPitcher = positionplayers[0][0]
				}
	//			console.log(winningPitcher[0]+" "+ this.team[0].player[winningPitcher[0]].name);
	//			console.log(losingPitcher[1]+" "+ this.team[1].player[losingPitcher[1]].name);				
/*				this.recordPlay("win", 0, this.team[0].player[this.playersOnCourt[0][winningPitcher[0]]].name);		 // this.team[this.o].player[p].name
				this.recordPlay("loss", 1, this.team[1].player[this.playersOnCourt[1][losingPitcher[1]]].name);		 // this.team[this.o].player[p].name		
				this.recordStat(0, this.playersOnCourt[0][winningPitcher[0]], "winP");
				this.recordStat(1, this.playersOnCourt[1][losingPitcher[1]], "lossP");*/
		//		console.log("1");
			//	console.log("winning Pitcher" +winningPitcher[0]+ " "+losingPitcher[1]);
		} else {
			//	console.log("los: "+losingPitcher[0]);
			//	console.log("name: "+this.team[0].player[losingPitcher[0]].name);				
				this.recordPlay("win", 1, [this.team[1].player[winningPitcher[1]].name]);		 // this.team[this.o].player[p].name		
				this.recordPlay("loss", 0, [this.team[0].player[losingPitcher[0]].name]);		 // this.team[this.o].player[p].name					
				this.recordStat(1, winningPitcher[1], "winP");
				this.recordStat(0,losingPitcher[0], "lossP");
			//	console.log("1: "+saveOpp[0]);
		//		console.log(this.overtimes);
		//		console.log(savingPitcher[0]);
				if ((saveOpp[1] == 1)  && (this.overtimes == 0)) {
					this.recordStat(1, savingPitcher[1], "save",1);
				}
		//		console.log(winningPitcher[1]+" "+ this.team[1].player[winningPitcher[1]].name);
		//		console.log(losingPitcher[0]+" "+ this.team[0].player[losingPitcher[0]].name);				
/*				this.recordPlay("win", 1, this.team[1].player[this.playersOnCourt[1][winningPitcher[1]]].name);		 // this.team[this.o].player[p].name		
				this.recordPlay("loss", 0, this.team[0].player[this.playersOnCourt[0][losingPitcher[0]]].name);		 // this.team[this.o].player[p].name					
				this.recordStat(1, this.playersOnCourt[1][winningPitcher[1]], "winP");
				this.recordStat(0,this.playersOnCourt[0][losingPitcher[0]], "lossP");*/
			//	console.log("3");
				//console.log("losing Pitcher" +winningPitcher[1]+ " "+losingPitcher[0]);
		}
//		console.log("losing Pitcher" +losingPitcher[0]+ " "+losingPitcher[1]);
//		this.recordPlay("win", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
//		this.recordPlay("loss", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
//		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");
		

		
        // Delete stuff that isn't needed before returning
        for (t = 0; t < 2; t++) {
            delete this.team[t].compositeRating;
            delete this.team[t].pace;
            for (p = 0; p < this.team[t].player.length; p++) {
                delete this.team[t].player[p].valueNoPot;
                delete this.team[t].player[p].compositeRating;
                delete this.team[t].player[p].ptModifier;
                delete this.team[t].player[p].battingOrder;
				
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
    GameSim.prototype.simPossessions = function (overtimes) {
        var i, outcome, substitutions;
		var homelead;
		
		// depends on whether away or home;
        this.o = 1;
        this.d = 0;
        
		//// keep track of batting order
		this.batter=[0,0];
    
		homelead = 0; //if home leads in ninth then 1
        i = 0;
        while (i < (this.numPossessions * 2 - homelead)) {         // numPossessions, whole game = 9 innings
            // Keep track of quarters
            if ((i * this.dt > 5 && this.team[0].stat.ptsQtrs.length === 1) ||  //  dt equals 3 outs  12 two innings
                    (i * this.dt > 11 && this.team[0].stat.ptsQtrs.length === 2) ||  // 24 4 innings
                    (i * this.dt > 17 && this.team[0].stat.ptsQtrs.length === 3) ||  // 24 4 innings
                    (i * this.dt > 23 && this.team[0].stat.ptsQtrs.length === 4) ||  // 24 4 innings
                    (i * this.dt > 29 && this.team[0].stat.ptsQtrs.length === 5) ||  // 24 4 innings
                    (i * this.dt > 35 && this.team[0].stat.ptsQtrs.length === 6) ||  // 24 4 innings
                    (i * this.dt > 41 && this.team[0].stat.ptsQtrs.length === 7) ||  // 24 4 innings
                    (i * this.dt > 47 && this.team[0].stat.ptsQtrs.length === 8)) {  // 36 6 innings
   
                this.team[0].stat.ptsQtrs.push(0);   // pushing quarter score  team 0
                this.team[1].stat.ptsQtrs.push(0);   // pushing quarter score  team 1
				
                this.t = 6;  // outs left in quarter
            } 

            // Clock
            this.t -= this.dt;  // x=x-y, t=t-dt,  12 = 12-3  counts down each half possession, half inning
            if (this.t < 0) {
                this.t = 0;
            }

            // Possession change
            this.o = (this.o === 1) ? 0 : 1;
            this.d = (this.o === 1) ? 0 : 1;

      //      this.updateTeamCompositeRatings();  // do I need?, just use player ratings, use team composite for pitching fielding calc
			                                    // then each batter just changes hitting,running calc, defense already set for each hitter
												// may give less flexibility later on?
												// already updates for player changes

            outcome = this.simPossession(i+overtimes);   // actual possession

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
        var b, i, ovrs, p, pp, substitutions, t;

        //substitutions = false;

		//// this is changing batting order
		//// remove changes 
		/*
		
        for (t = 0; t < 2; t++) {
            // Overall values scaled by fatigue
            ovrs = [];
            for (p = 0; p < this.team[t].player.length; p++) {
                // Injured or foulded out players can't play
                if (this.team[t].player[p].injured || this.team[t].player[p].stat.pf >= 6) {
                    ovrs[p] = -Infinity;
                } else {
                    ovrs[p] = this.team[t].player[p].valueNoPot * this.fatigue(this.team[t].player[p].stat.energy) * this.team[t].player[p].ptModifier * random.uniform(0.9, 1.1);
                }
            }

            // Loop through players on court (in inverse order of current roster position)
            i = 0;
            for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
                p = this.playersOnCourt[t][pp];
                this.playersOnCourt[t][i] = p;
                // Loop through bench players (in order of current roster position) to see if any should be subbed in)
                for (b = 0; b < this.team[t].player.length; b++) {
                    if (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured || this.team[t].player[p].stat.pf >= 6) && (!this.team[t].player[b].injured && this.team[t].player[b].stat.pf < 6)))) {
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
                            this.recordPlay("sub", t, [this.team[t].player[b].name, this.team[t].player[p].name]);
                        }
                        break;
                    }
                }
                i += 1;
            }
        }
        */
        // Record starters if that hasn't been done yet. This should run the first time this function is called, and never again.
        /*if (!this.startersRecorded) {
            for (t = 0; t < 2; t++) {
                for (p = 0; p < this.team[t].player.length; p++) {
                    if (this.playersOnCourt[t].indexOf(p) >= 0) {
                        this.recordStat(t, p, "gs");
                    }
                }
            }
            this.startersRecorded = true;
        }*/

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
                    this.recordStat(t, p, "energy", -this.dt * 0.04 * (1 - this.team[t].player[p].compositeRating.endurance));
                    if (this.team[t].player[p].stat.energy < 0) {
                        this.team[t].player[p].stat.energy = 0;
                    }
                } else {
                    this.recordStat(t, p, "benchTime", this.dt);
                    this.recordStat(t, p, "energy", this.dt * 0.1);
                    if (this.team[t].player[p].stat.energy > 1) {
                        this.team[t].player[p].stat.energy = 1;
                    }
                }
            }
        }
    };

	
	
   /**
     * Switch players, if injured, or maybe just in general (energy low), UpdatePlayersOnCourt
     *
     * This doesn't actually compute the type of injury, it just determines if a player is injured bad enough to miss the rest of the game.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.switchPlayers = function (t,i,injured, halfInning) {
      //  var newInjury, p, t;
	  var j,k,kk,tempplayer,tempPosition,m;
		var tempPositionTwo;
		var gotHere;
		var useWeakestPitchers;
		gotHere = 0;

		//console.log("switch");
				  tempPosition = this.team[t].player[this.playersOnCourt[t][i]].pos;
			       if ((tempPosition == "SP") || (tempPosition == "RP") || (tempPosition == "CL")) {
						useWeakestPitchers = 0;
		//console.log(tempPosition+" "+useWeakestPitchers);					   
						if (Math.abs(this.team[this.o].stat.pts - this.team[this.d].stat.pts) > 3) {
							//console.log("Score: "+this.team[this.o].stat.pts+" "+this.team[this.d].stat.pts);
							useWeakestPitchers = 4;
							useWeakestPitchers = random.randInt(4, 5);
						}
						if (Math.abs(this.team[this.o].stat.pts - this.team[this.d].stat.pts) > 5) {
							//console.log("Score: "+this.team[this.o].stat.pts+" "+this.team[this.d].stat.pts);
							useWeakestPitchers = random.randInt(5, 6);
						}						
						if (Math.abs(this.team[this.o].stat.pts - this.team[this.d].stat.pts) > 7) {
							//console.log("Score: "+this.team[this.o].stat.pts+" "+this.team[this.d].stat.pts);
							useWeakestPitchers = random.randInt(6, 7);
						}						
					//	random.randInt(0, teams.length - 1);
		//console.log(tempPosition+" "+useWeakestPitchers);					   
						
						for (j = 14 + useWeakestPitchers; j < 25; j++) {	
	//console.log(j);
							
						
							if (this.team[t].player[this.playersOnCourt[t][i]].stat["fta"]>=9) {
								//console.log(j);
								//console.log("length of players: "+this.team[t].player.length);
										gotHere = 1;
							}						
						   if ((this.team[t].player[this.playersOnCourt[t][j]].injured) || ((this.team[t].player[this.playersOnCourt[t][j]].energy < 95) && (halfInning <= 18))  || (this.team[t].player[this.playersOnCourt[t][j]].stat.gs==1) ) {
						   } else {						     
							 if ((this.team[t].player[this.playersOnCourt[t][j]].pos == "SP") || (this.team[t].player[this.playersOnCourt[t][j]].pos == "RP") || (this.team[t].player[this.playersOnCourt[t][j]].pos == "CL")) {						
							   tempplayer = this.playersOnCourt[t][i];
							   this.playersOnCourt[t][i] = this.playersOnCourt[t][j];
							   this.playersOnCourt[t][j] = tempplayer;			
							   this.team[t].player[this.playersOnCourt[t][i]].pos = "RP";

							   battingOrderPlayByPlay[t] += 1;
								pitchingOrderPlayByPlay[t] += 1;
							    playByPlayOrder[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];
								playByPlayOrderPitching[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];		
								this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlay");
								this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlayPitcher");
								if (this.startersRecorded) {
									this.recordPlay("fta", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
								}
								
							   i = 13;
							   j = 25;
							 }
						   }
						   if (j==24) {
								for (k = 14; k < 25; k++) {			
									if (this.team[t].player[this.playersOnCourt[t][i]].stat["fta"]>=9) {
										console.log("k: "+k);
									}													
									if ((this.team[t].player[this.playersOnCourt[t][k]].injured) || (this.team[t].player[this.playersOnCourt[t][k]].stat.gs==1)){																			
										if (this.team[t].player[this.playersOnCourt[t][i]].stat["fta"]>=9) {
											console.log("k: "+k);
											console.log("injured: "+this.team[t].player[this.playersOnCourt[t][k]].injured);											
											console.log("this.team[t].player[this.playersOnCourt[t][k]].stat.gs==1: "+this.team[t].player[this.playersOnCourt[t][k]].stat.gs==1);																						
										}					
									}	else {
										if (this.team[t].player[this.playersOnCourt[t][i]].stat["fta"]>=9) {
											console.log("k: "+k);
											console.log("this.team[t].player[this.playersOnCourt[t][k]].pos: "+this.team[t].player[this.playersOnCourt[t][k]].pos);
											
										}															
										if ((this.team[t].player[this.playersOnCourt[t][k]].pos == "SP") || (this.team[t].player[this.playersOnCourt[t][k]].pos == "RP") || (this.team[t].player[this.playersOnCourt[t][k]].pos == "CL")) {						
											if (this.team[t].player[this.playersOnCourt[t][i]].stat["fta"]>=9) {
												console.log(" k: "+k);
											}													
											tempPositionTwo = this.team[t].player[this.playersOnCourt[t][k]].pos ;
											tempplayer = this.playersOnCourt[t][i];
											this.playersOnCourt[t][i] = this.playersOnCourt[t][k];
											this.playersOnCourt[t][k] = tempplayer;	
											if  ((tempPositionTwo == "SP") || (tempPositionTwo == "RP")  || (tempPositionTwo == "CL")) {
												this.team[t].player[this.playersOnCourt[t][i]].pos = "RP";
											} else {
											}
											battingOrderPlayByPlay[t] +=1;
											pitchingOrderPlayByPlay[t] += 1;
											playByPlayOrder[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];
											playByPlayOrderPitching[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];	
											this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlay");
											this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlayPitcher");
											if (this.startersRecorded) {
												this.recordPlay("fta", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
											}
											i = 13;
											j = 25;
											k = 25;									
												
										}
									}
	
								
									   if (k==24) {
									if (this.team[t].player[this.playersOnCourt[t][i]].stat["fta"]>=9) {
										console.log("second k: "+k);
										console.log("length of players: "+this.team[t].player.length);
									}			
									if (gotHere == 1) {
										console.log("gotHere: "+gotHere);
										console.log("length of players: "+this.team[t].player.length);
									}			
									
									
											for (kk = 25; kk < this.team[t].player.length; kk++) {		
									if (this.team[t].player[this.playersOnCourt[t][i]].stat["fta"]>=9) {
										console.log("second kk: "+kk);
									}														
												if ((this.team[t].player[kk].injured) || (this.team[t].player[kk].stat.gs==1) || this.team[t].player[kk].stat["fta"]>=9){								
												}	else {
													if ((this.team[t].player[kk].pos == "SP") || (this.team[t].player[kk].pos == "RP") || (this.team[t].player[kk].pos == "CL")) {						
														
														tempPositionTwo = this.team[t].player[kk].pos ;
														tempplayer = this.playersOnCourt[t][i];
														this.playersOnCourt[t][i] = kk;
														//this.playersOnCourt[t][kk] = tempplayer;	
														if  ((tempPositionTwo == "SP") || (tempPositionTwo == "RP")  || (tempPositionTwo == "CL")) {
															this.team[t].player[this.playersOnCourt[t][i]].pos = "RP";
														} else {
														}
														battingOrderPlayByPlay[t] +=1;
														pitchingOrderPlayByPlay[t] += 1;
														playByPlayOrder[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];
														playByPlayOrderPitching[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];	
														this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlay");
														this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlayPitcher");
														if (this.startersRecorded) {
															this.recordPlay("fta", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
														}														i = 13;
														j = 25;
														kk = this.team[t].player.length;	
													//	console.log(this.team[t].player.length);
														
													}
												}
												if (kk==this.team[t].player.length-1) {
													
												//	console.log(halfInning);
												//	console.log(this.team[t].player[tempplayer].energy);
													
												}
											}							   
									   }	
								}								   
						   }
						}			
						this.recordStat(t, this.playersOnCourt[t][ positionplayers[t][0]], "min",1);									
				   } else {				   
						for (j = 14; j < 25; j++) {						
						
						   if ((this.team[t].player[this.playersOnCourt[t][j]].injured) || (this.team[t].player[this.playersOnCourt[t][j]].energy < 95)  || (this.team[t].player[this.playersOnCourt[t][j]].stat.gs==1) ) {						   
						   } else {						     
							 if ((this.team[t].player[this.playersOnCourt[t][j]].pos != "SP") && (this.team[t].player[this.playersOnCourt[t][j]].pos != "RP") && (this.team[t].player[this.playersOnCourt[t][j]].pos != "CL")) {						
							 
							   tempplayer = this.playersOnCourt[t][i];
							   this.playersOnCourt[t][i] = this.playersOnCourt[t][j];
							   this.playersOnCourt[t][j] = tempplayer;			
							   this.team[t].player[this.playersOnCourt[t][i]].pos = this.team[t].player[this.playersOnCourt[t][j]].pos;
							   battingOrderPlayByPlay[t] +=1;
							    playByPlayOrder[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];
								this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlay");
								if (this.startersRecorded) {								
									if (t == this.o) {
										this.recordPlay("pts", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
									} else {
										this.recordPlay("fielding", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
									}
								}								
								
							   i = 14;
							   j = 25;
							 }
						   }
						   if (j==24) {
						   
								for (k = 14; k < 25; k++) {						
									if ((this.team[t].player[this.playersOnCourt[t][k]].injured) || (this.team[t].player[this.playersOnCourt[t][k]].stat.gs==1)){								
									}	else {
										if ((this.team[t].player[this.playersOnCourt[t][k]].pos != "SP") && (this.team[t].player[this.playersOnCourt[t][k]].pos != "RP") && (this.team[t].player[this.playersOnCourt[t][k]].pos != "CL")) {						
									
											tempplayer = this.playersOnCourt[t][i];
											this.playersOnCourt[t][i] = this.playersOnCourt[t][k];
											this.playersOnCourt[t][k] = tempplayer;							   
											this.team[t].player[this.playersOnCourt[t][i]].pos = this.team[t].player[this.playersOnCourt[t][j]].pos;
											battingOrderPlayByPlay[t] +=1;
											playByPlayOrder[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];
											this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlay");
											if (this.startersRecorded) {								
												if (t == this.o) {
													this.recordPlay("pts", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
												} else {
													this.recordPlay("fielding", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
												}
											}								
									
											i = 14;
											j = 25;
											k = 25;			
										}
									}
								}		
								if ((k==24) && (injured==1)) {
									for (m = 1; m < this.team[t].player.length; m++) {						
										if ((this.team[t].player[m].injured) || (this.team[t].player[this.playersOnCourt[t][m]].active)){								
										}	else {
											if ((this.team[t].player[m].pos != "SP") && (this.team[t].player[m].pos != "RP") && (this.team[t].player[m].pos != "CL")) {						
										
												tempplayer = this.playersOnCourt[t][i];
												this.playersOnCourt[t][i] = m;
												this.team[t].player[this.playersOnCourt[t][i]].pos = this.team[t].player[this.playersOnCourt[t][j]].pos;
												battingOrderPlayByPlay[t] +=1;
												playByPlayOrder[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay[t];
												this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlay");
												if (this.startersRecorded) {								
													if (t == this.o) {
														this.recordPlay("pts", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
													} else {
														this.recordPlay("fielding", t, [this.team[t].player[this.playersOnCourt[t][i]].name]);																	
													}
												}								
										
												i = 14;
												j = 25;
												k = 25;	
												m = 60;
											}
										}
									}
								
								}
						   }						   
						}					   				   				   
				   }		
    };	
		
	
	// only want to sub once
   /**
     * sub to keep player healthy (positions players, not pitchers
     *
     * This doesn't actually compute the type of injury, it just determines if a player is injured bad enough to miss the rest of the game.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.subPos = function (t,p) {
        var k;
		var probSub;
		var tempPlayer;


		tempPlayer = this.playersOnCourt[t][p];
        if (Math.random() < .001) {			
			this.switchPlayers(t,p,0);
			if (tempPlayer == this.playersOnCourt[t][p]) {
			} else  {			
				this.recordStat(t, this.playersOnCourt[t][p], "fgaLowPost",liveGameDisplay[t]);
				liveGameDisplay[t] -= 1;			
			}
        }	   
	   
    };	
		
	
	
	
	
   /**
     * See if any injuries occurred this possession, focus on positions making play, running base, pitching, hitting.
     *
     * This doesn't actually compute the type of injury, it just determines if a player is injured bad enough to miss the rest of the game.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.injuriesPos = function (t,p) {
        var newInjury;
        var k;
        newInjury = false;

	   // make an adjustment, if t = offense, only use batter or runners?
	   // or just run this with every play with used fielders/batters/runners
	   
	   // make just one player*****************
	   // make sure to update fielder/battingorder if nec??
//        if (Math.random() < (0.000254 / ((this.team[t].player[this.playersOnCourt[t][p]].compositeRating.endurance)/.50)) ) {
//        if (Math.random() < (0.000254*(1+(1-this.team[t].player[this.playersOnCourt[t][p]].compositeRating.endurance))) ) {
        if (Math.random() < (0.000508*(1+(1-this.team[t].player[this.playersOnCourt[t][p]].compositeRating.endurance))) ) {
            this.team[t].player[this.playersOnCourt[t][p]].injured = true;
            newInjury = true;			
            this.recordPlay("injury", t, [this.team[t].player[this.playersOnCourt[t][p]].name]);
        }	   
        // Sub out injured player
        if (newInjury) {
			this.switchPlayers(t,p,1);
						
			this.recordStat(t, this.playersOnCourt[t][p], "fgaLowPost",liveGameDisplay[t]);
			liveGameDisplay[t] -= 1;				
		   
        }
    };	
	
    /**
     * See if any injuries occurred this possession, and handle the consequences.
     *
     * This doesn't actually compute the type of injury, it just determines if a player is injured bad enough to miss the rest of the game.
     * 
     * @memberOf core.gameSim
     */
    GameSim.prototype.injuries = function (batter,battingorder,fielders) {
        var newInjury, p, t;

        newInjury = false;

		
       
	   // make an adjustment, if t = offense, only use batter or runners?
	   // or just run this with every play with used fielders/batters/runners
        for (t = 0; t < 2; t++) {
            for (p = 0; p < this.team[t].player.length; p++) {
                // Only players on the court can be injured
                if (this.playersOnCourt[t].indexOf(p) >= 0) {
                    // According to data/injuries.ods, 0.25 injuries occur every game. Divided over 10 players and ~200 possessions, that means each player on the court has P = 0.25 / 10 / 200 = 0.000125 probability of being injured this play.
//                    if (Math.random() < 0.000125) {
                    if (Math.random() < 0.000254) {
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
    GameSim.prototype.simPossession = function (halfInning) {
        var ratios, shooter;

		
		//baseball version
		//basketball stats Name	Pos	Min	FG	3Pt	FT	Off	Reb	Ast	TO	Stl	Blk	PF	Pts
		//baseball stats   Name Pos AB  H   R   RBI S   HR  SO   W   R   ER  W  SO  (use last four for pitcher?)  others: Error triple double (make other variable holders?)
		
		// basketball main roster area Min	Pts	Reb	Ast	PER
		// baseball main roster area Min	BA	HR	ERA  SO
		
		
		
        // Turnover?  // no real equiv in baseball, going to gut the code
		// safe to remove, 
		//turnover and steal stats now empty
		// have examples of how to use those stats in these functions
/*        if (this.probTov() > Math.random()) {
            return this.doTov();  // tov
        }*/

        // Shot if there is no turnover
       // ratios = this.ratingArray("usage", this.o);
//        shooter = this.pickPlayer(ratios);

        // shooter always 1(actually the 5th position
		
		//// 0 position 0
		//// 1 position 4
		//// 2 position 1
		//// 3 position 2
		//// 4 postiont 3
   //     this.playersOnCourt = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]];		
		//// 1 gave 4 position
//        this.playersOnCourt = [[0, 4, 1, 2, 3], [0, 4, 1, 2, 3]];		
		//// 1 gave 3 position
   /////////////////////////correct     this.playersOnCourt = [[0, 2, 3, 4, 1], [0, 2, 3, 4, 1]];		
		//// gives accurate positions 0,1,2,3,4
//        this.playersOnCourt = [[0, 2, 3, 4, 1], [0, 2, 3, 4, 1]];		


//// if NL need to use extra player?, expand players on court, seperate hitters and fielders (include 13 instead of pitcher)
		
        var pickpitcher = [[8,9,10,11,12]]
//        this.playersOnCourt = [[0, 1, 2, 3, 4,5,6,7], [0, 1, 2, 3, 4,5,6,7]];				
//        this.playersOnCourt = [[0, 1, 2, 3, 4,5,6,7,8,9,10,11,12], [0, 1, 2, 3, 4,5,6,7,8,9,10,11,12]];				
//        this.playersOnCourt = [[0, 1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], [0, 1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]];				
		//// still doesn't work(is rotating somewhere
		//// if use picking batters doesn't matter
		
		//// why are they switched like that
		//// looks like the display might be off
        return this.doShot(halfInning);  // fg, orb, or drb
    };

	////Baseball
	// nothing called from this so can just remove
	// what may help is probWalk or Strike or Balk or Steal (in between pitch, pitch, results, in between pitch, etc)
    /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probTov = function () {
        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
    };

	//// Basketball
    /**
     * Probability of the current possession ending in a turnover.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.probTovbasketball = function () {
        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
    };



	// what may help is probWalk or Strike or Balk or Steal (in between pitch, pitch, results, in between pitch, etc)

	
//// Baseball	
    /**
     * Turnover.
     * 
     * @memberOf core.gameSim
     * @return {string} Either "tov" or "stl" depending on whether the turnover was caused by a steal or not.
     */
    GameSim.prototype.doTov = function () {
        var p, ratios;

		// could use this framework for something else
		// essentially, uses "tov" variables
		// heads to Stl area

        // in baseball inning can't end until 3 outs		
		
        ratios = this.ratingArray("turnovers", this.o, 0.5);
        p = this.playersOnCourt[this.o][this.pickPlayer(ratios)];
        if (this.probStl() > Math.random()) {
            return this.doStl(p);  // "stl"
        } else {
        }

        return "tov";
    };

	
//// Baseball

// don't have steal
// could use this framework later
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
   //     this.recordStat(this.d, p, "stl");
    //    this.recordPlay("stl", this.d, [this.team[this.d].player[p].name, this.team[this.o].player[pStoleFrom].name]);

        return "stl";
    };

    /**
     * Shot.
     * 
     * @memberOf core.gameSim
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @return {string} Either "fg" or output of this.doReb, depending on make or miss and free throws.
     */
    GameSim.prototype.doShot = function (halfInning) {
        var fatigue, p, passer, probMake, probAndOne, probMissAndFoul, r1, r2, r3, ratios, type;
	

       // location of player on court changing? why is same batter location returning different information, check playersOnCourt
//        p = this.playersOnCourt[this.o][shooter];
        p = this.playersOnCourt[this.o][1];
//        p2 = this.playersOnCourt[this.o][this.batter[this.o]];
        
		 
		  
/////        this.recordStat(this.o, p, "stl");		

// baseball var
        //// global var to keep track of team? hopefully can use this.o
		
		//// hold stat comparison
		
		//// compare pitchers
		//remove
        var compare = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparep = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparemi = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparemo = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var compareci = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var compareco = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];

		// keep
        var comparesp = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparefb = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparesb = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparetb = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparess = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparelf = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparerf = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparecf = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparec = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];


       //// keeps track of who is one base
	    var onbase = [100,100,100];  // 10 means nobody // 0 equal first batter
        //// keeps track of outs
        var  outs = 0;
		

		//// pitchers for both teams
		//// pitchers for both teams, can always assume in same spot (5th?)
		//// later this may come in handy
		//// can either code it here or on roster side
		//// long term roster side is better
		//// for now may do a bit here and then transition code over
		//remove
//		var  pitchers = [0,0];
		//// same for fielders
		var  pitchers = [0,0];
		var  midoutfield = [0,0];	
		var  corneroutfield = [0,0];		
		var  midinfield = [0,0];		
		var  cornerinfield = [0,0];		

// keep
		var  spitcher = [0,0];
		var  firstbase = [0,0];	
		var  secondbase = [0,0];		
		var  thirdbase = [0,0];		
		var  shortstop = [0,0];		
		var  leftfield = [0,0];		
		var  rightfield = [0,0];		
		var  centerfield = [0,0];		
		var  catcher = [0,0];		

		var i,j;
		
		// batting spots expanded
        var comparethree = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparefour = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var compareone = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparetwo = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparefive = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparesix = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var compareseven = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var compareeight = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
        var comparelast = [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00];
		
		
		// batting spots expanded
		var  threespot = [0,0];
		var  fourspot = [0,0];	
		var  onespot = [0,0];		
		var  twospot = [0,0];		
		var  fivespot = [0,0];		
		var  sixspot = [0,0];		
		var  sevenspot = [0,0];		
		var  eightspot = [0,0];				
		var  lastspot = [0,0];		
		
//		var battingorder = [0,1,2,3,4];
		//var fielders = [0,1,2,3,4];
		// expanded
//[[0, 1, 2, 3, 4,5,6,7,8,9,10,11,12], [0, 1, 2, 3, 4,5,6,7,8,9,10,11,12]];			
	//	var battingorder = [[0,1,2,3,4,5,6,7,8],[0,1,2,3,4,5,6,7,8]];
	//	var positionplayers = [[0,1,2,3,4,5,6,7,8],[0,1,2,3,4,5,6,7,8]];
		var fielders = [0,1,2,3,4,5,6,7];
		var pitcherrot = [0,1,2,3,4];
		
    var t;		
/////////////////////////////////////////////////////////////////////////////////		
//// Complete Half Inning Tree		(once this is done game is ready and a real baseball game, but still needs improvements, such as trade ai, more positions)
		//// need to
		//1) pick pitchers and fielders in starting 5 (later just used for backups and roster)	done	
		//2) can adjust batting order after this (later just used for backups and roster)     done
//		For Each Batter
		//3) check if runners on base
		//3a) if so, check for stealing/pickoffs
		//3b) if not, move to 4
		//4) pitch is thrown
		//4a) ball
		//   4ai) swing
        //        4aiI) miss
		//              a) catcher catches
//		                b) catcher misses
//						  I) already 2 strikes batter runs
//						  II) less than 2 strikes batter stays
//						    i) runners on base
//							   a) LOOP: steal for each runner, starting with lead running
//							      i) caught
//								      a) out+1
//								  ii) not caught
//                                    a) runner moved onbase switched (or run scores)
                                          //i) error or no error
										      //a) if error, move again?  (error +1)
											       //// repeat steal formula
//							   b) no steal
//							      I) Strike +1							   
//							ii) no runners on base
//							   a) Strike +1						 						    
        //        4aiI) foul
//		                 i) playable
//                             i) make play (out+1)
//                                   a) runners try to advance(low odds)
//							   ii) drops strike +1 (if not already 2)
 //                      ii) not playable strike +1 (if not already 2)
        //        4aiI) hit (determine 1) ground or fly  and	2) distance)
		                   //// these could be broken up more once we have full team on field
//                        i) infield center
//                              i) air see  outfield right side air							     							
//                              ii) ground see outfield right side ground
//                        ii) infield left side					
//                        iii) infield right side						
//                        iv) outfield center
//                        v) outfield left side					
//                        vi) outfield right side
//                               i) air
//                                     a) caught out+1
//									    i) end of inning
//										ii) not end
//										     a) see swing miss runners
//									 b) not caught
//                                        a) see if runners advance (each tested, start with 3rd, 2nd, 1st then batter) (each runner and base looped, until all stopped)									    
//                                              (can use distance to base, arm, runner speed, fielders catch ability)
//                               ii) ground							   
//                                     a) see air not caught
//                        vii) Homerun
//						       i) all runners score +x runs +x rbis (next batter)		                     
        //              		
		//   4aii) no swing		ball+1
//                   a) 4 - batter to 1st (shift)
//                        i) other runners 2nd, 3rd base                 					 
//                   a) 3 or less ball		
//                      i) runners on base (refer to above)                                            
//                      ii) no runners (nothing)	           
		//4b) strike
		//   4bi) swing
//		           i) refer to ball swing
		//   4bii) no swing (strike +1)
//		           a) refer to ball swing miss
/////////////////////////////////////////////////////////////////////		



       //////////////////////// Improve for Relative Advantage
	   //////////////////////// This could be done at higher level in game
	   //////////////////////// with injuries and subs, may still want it here?
	   
		////I) pick Pitcher (can turn into a function later)
		
		//// need pitching stats for each player (should be in composite file
		//// rotate through each player then pick that player as a pitcher
	
          //// each player has pitching rating this.team[this.o].player[p].compositeRating.shootingLowPost
		  
		  // console output
		  // play by play shows up with live game
		  
		  //// a) gets pitching comparison data data (could be its own function)
//		  this.playersOnCourt[this.d][i]
//		  this.playersOnCourt[this.o][i]
   /*   for (i = 0; i < 5; i++) {
	      comparep[this.playersOnCourt[this.d][i]] = this.team[this.d].player[this.playersOnCourt[this.d][i]].compositeRating.usage + this.team[this.d].player[this.playersOnCourt[this.d][i]].compositeRating.blocking;
        }	    */

/////////////////////////////////// Loop for each team	
	var tempplayer;
	var k,j;
	var tempPosition;

	
    if (halfInning < 1) {

	
	for (t=0;t<2; t++) {

    var comparesub = [0,0,0,0,0,0,0,0,0,0,0,0];	
	var numberpitcher = 0;
	var numbercatcher = 0;
	var numberfirstbase = 0;
	var numbersecondbase = 0;
	var numbershortstop = 0;
	var numberthirdbase = 0;
	var numberleftfield = 0;
	var numberrightfield = 0;
	var numbercenterfield = 0;
	
	
	var totalPos = 0;
	var totalBat = 0;
	var totalPlayer = 0;
	
	var aiType = 0; // 0 normal, 1 use total player, 2 use batting order, 3 use fielder
	// new
	//var 
/*	    console.log("NEW TEAM-before change");
	  for (i = 13; i < 14; i++) {		  
		console.log("t: "+t+"i: "+i+" position: "+this.team[t].player[this.playersOnCourt[t][i]].pos);
	  
	  }		*/
  		
/*
	this.team[t].player[this.playersOnCourt[t][i]].battingOrder
    var comparesub = [0,0,0,0,0,0,0,0,0,0,0,0];	
	var numberpitcher = 0;
	var numbercatcher = 0;
	var numberfirstbase = 0;
	var numbersecondbase = 0;
	var numbershortstop = 0;
	var numberthirdbase = 0;
	var numberleftfield = 0;
	var numberrightfield = 0;
	var numbercenterfield = 0;*/
	
	// in this comparison, use energy , if low then another pitcher chosen, 
	// every out, or pitch can drain a pitcher;

	  // run through injuries, if pitcher, sub pitcher, if hitter sub hitter
	  // this still uses players on court
	  // uses next best player on deck
      for (i = 0; i < 13; i++) {
	           //// by position sub routine?
               if (this.team[t].player[this.playersOnCourt[t][i]].injured) {			   			   
						this.switchPlayers(t,i,1);
			   }   
       }	    	
		//	      console.log("finished loops");
      for (i = 0; i < 13; i++) {
/*	      if (this.team[t].player[this.playersOnCourt[t][i]].battingOrder > 1) {
		     totalBat += 1;
		  }*/
	      if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier > 1) {
		     totalPos += 1;
		  }
/*		  if ( (this.team[t].player[this.playersOnCourt[t][i]].battingOrder > 0) || (this.team[t].player[this.playersOnCourt[t][i]].ptModifier > 0) ) {
		     totalPlayer += 1;
		  }*/
	  
      }	    	
	  
/*	  if (totalPlayer == 0) {
	     aiType  = 0;
	  } else if (totalPlayer < 10) {
	     aiType  = 1;
	  } else if (totalPos > totalBat) {
	     aiType  = 2;	  	  	   
	  } else {
	     aiType  = 3;	  	  
	  }*/
	 // console.log(aiType+" "+totalPlayer+" "+totalPos+" "+totalBat+" "+this.team[t].player[this.playersOnCourt[t][0]].battingOrder+" "+this.team[t].player[this.playersOnCourt[t][0]].ptModifier);
	
        for (i = 0; i < 13; i++) {

          if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==1) {
			
          } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==2) {
		    numberpitcher += 1;
		  } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==3) {
		    numbercatcher += 1;
		  } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4) {
		    numberfirstbase += 1;
		  } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==5) {
		    numbersecondbase += 1;
		  } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==6) {
		    numbershortstop += 1;
		  } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==7) {
		    numberthirdbase += 1;
		  } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8) {
		    numberleftfield += 1;
		  } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==9) {
		    numberrightfield += 1;
		  } else if (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==10) {
		    numbercenterfield += 1;
		  }	
		// console.log("i: "+i);		  
		// console.log("mod: "+this.team[t].player[this.playersOnCourt[t][i]].ptModifier);		  
        }		

	//	 console.log(numberpitcher+" "+numbercatcher);

	
/*		for (i = 8; i < 13; i++) {
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparesp[i] = -100;
			} else {
				comparesp[i] = this.team[t].player[this.playersOnCourt[t][i]].compositeRating.usage*2 + this.team[t].player[this.playersOnCourt[t][i]].compositeRating.blocking*3;		  	  		  
			}
        }	    	*/
		
	
		
		
	  //this.team[t].player[p].ptModifier
	  //// b) picks which pitcher to use  (could also be a function)
		for (i = 8; i < 13; i++) {		  
			if 	((this.team[t].player[this.playersOnCourt[t][i]].pos == "RP") || (this.team[t].player[this.playersOnCourt[t][i]].pos == "CL")) {
				this.team[t].player[this.playersOnCourt[t][i]].pos = "SP";
				spitcher[i] = i;	    				
			}
		}		
	  

		if ((this.team[t].player[this.playersOnCourt[t][8]].energy == 100 ) && (this.team[t].player[this.playersOnCourt[t][8]].pos == "SP")) {
			spitcher[t] = 8;	    
		} else if ( (this.team[t].player[this.playersOnCourt[t][9]].energy == 100 )  && (this.team[t].player[this.playersOnCourt[t][9]].pos == "SP")) {
			spitcher[t] = 9;	    
		} else if ((this.team[t].player[this.playersOnCourt[t][10]].energy == 100 )  && (this.team[t].player[this.playersOnCourt[t][10]].pos == "SP")) {
			spitcher[t] = 10;	    
		} else if ((this.team[t].player[this.playersOnCourt[t][11]].energy == 100 ) && (this.team[t].player[this.playersOnCourt[t][11]].pos == "SP")) {
			spitcher[t] = 11;	    
		} else if ((this.team[t].player[this.playersOnCourt[t][12]].energy == 100 ) && (this.team[t].player[this.playersOnCourt[t][12]].pos == "SP")) {
			spitcher[t] = 12;	    
		} else if ((this.team[t].player[this.playersOnCourt[t][14]].energy == 100 ) && (this.team[t].player[this.playersOnCourt[t][14]].pos == "RP")) {
			spitcher[t] = 14;	    
		} else if ((this.team[t].player[this.playersOnCourt[t][15]].energy == 100 ) && (this.team[t].player[this.playersOnCourt[t][15]].pos == "RP")) {
			spitcher[t] = 15;	    
		} else if ((this.team[t].player[this.playersOnCourt[t][16]].energy == 100 ) && (this.team[t].player[this.playersOnCourt[t][16]].pos == "RP")) {
			spitcher[t] = 16;	    
		} else if ((this.team[t].player[this.playersOnCourt[t][17]].energy == 100 ) && (this.team[t].player[this.playersOnCourt[t][17]].pos == "RP")) {
			spitcher[t] = 17;	    
		} else {
			spitcher[t] = 8;	    		
		}

	    
	 /*   spitcher[t] = 8;
        for (i = 9; i < 13; i++) {
		    
			p = this.playersOnCourt[t][i];		
            if (numberpitcher >= 5) {
				if ( (( (comparesp[spitcher[t]] < comparesp[this.playersOnCourt[t][i]]) ) || (this.team[t].player[this.playersOnCourt[t][spitcher[t]]].energy < 96) ) && (this.team[t].player[this.playersOnCourt[t][spitcher[t]]].energy <= this.team[t].player[p].energy ) && (this.team[t].player[p].ptModifier==2) ){
					spitcher[t] = i;
				}
			} else {
//				if ( (( (comparesp[spitcher[t]] < comparesp[this.playersOnCourt[t][i]]) ) || (this.team[t].player[this.playersOnCourt[t][spitcher[t]]].energy < 96) ) && (this.team[t].player[this.playersOnCourt[t][spitcher[t]]].energy <= this.team[t].player[p].energy ) ){
				if ( (this.team[t].player[this.playersOnCourt[t][spitcher[t]]].energy <= 100 ){
					spitcher[t] = i;
				}
			//}
        }			*/
		
		//// c) outputs pitcher as test

		////II) pick rest of positions  future var : position[].team[] = 
		//// rotate through to find best at each position
		//// determine who should play at each
		
		//order, best defense
		// P
		// CenterFild
		// SS
		// 3B
		// C
		// 2B
		// RF
		// LF		
		// 1B
				
//		I)a) Center Field  (was midoutfield)
		  //// a) 1 running .5 throwing .25 fielding
      for (i = 0; i < 8; i++) {
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparecf[i] = -50;
			} else {
	  
				comparecf[i] =this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.6 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*.25+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*1.00;
			}
        }	    	

		
	  //// b) picks which player is best (skips pitcher)
	    comparecf[24] = -100; // use a hitter?
	    centerfield[t] = 24;
		j= 0;
      //   console.log("comparecf[0]: " +comparecf[0]);
      //   console.log("comparecf[1]: " +comparecf[1]);
    //     console.log("comparecf[2]: " +comparecf[2]);
    //     console.log("comparecf[3]: " +comparecf[3]);
    /*     console.log("comparecf[4]: " +comparecf[4]);
         console.log("comparecf[5]: " +comparecf[5]);
         console.log("comparecf[6]: " +comparecf[6]);
         console.log("comparecf[7]: " +comparecf[7]);
         console.log("comparecf[8]: " +comparecf[8]);
         console.log("comparecf[9]: " +comparecf[9]);
         console.log("comparecf[24]: " +comparecf[24]);*/
        for (i = j; i < 8; i++) {	
	//	console.log("in loop cf: "+centerfield[t]);
          		
            if (numbercenterfield == 1) {
				if ( this.team[t].player[this.playersOnCourt[t][i]].ptModifier==10) {
						centerfield[t] = i;
						i = 13;
				}
			} else {
				if ((spitcher[t] == i ) || ((numbercatcher == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==3) ) || ((numberfirstbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4)) || ((numbersecondbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==5)) || ((numbershortstop == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==6)) || ((numberthirdbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==7)) || ((numberleftfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8)) || ((numberrightfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==9))	){
				} else {		
					if (comparecf[centerfield[t]] < comparecf[i]) {
						centerfield[t] = i;
					}
				}	
			}
				
				

        }		
	//	console.log("#centerfield: "+numbercenterfield+"final cf: "+centerfield[t]);
	//II)a) Shortstop / comparess shortstop
		
			  //// a) .25 running .5 throwing 1.00 fielding
		for (i = 0; i < 8; i++) {
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparess[i] = -100;
			} else {
	  
				comparess[i] = this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.2 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*1.00+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*0.25;
			}	  
	  
        }	    	

	  //// b) picks which player is best  (skips pitcher or other assigned players)
	    comparess[24] = -100;
	    shortstop[t] = 24;
		j=0;
		
        for (i = j; i < 8; i++) {	

            if (numbershortstop == 1) {
				if ( (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==6) ){
					shortstop[t] = i;
				}
			} else {
				if ((spitcher[t] == i ) || (centerfield[t] == i)  || ((numbercatcher == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==3) ) || ((numberfirstbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4)) || ((numbersecondbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==5))  || ((numberthirdbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==7)) || ((numberleftfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8)) || ((numberrightfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==9))	) {
				} else {
					if (comparess[shortstop[t]] < comparess[i]) {
						shortstop[t] = i;
					}
				}
				
			}
		}

		

	
	//III)a) 3B / comparetb thirdbase			
			  //// a) .25 running .5 throwing 1.00 fielding
		for (i = 0; i < 8; i++) {
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparetb[i] = -100;
			} else {
	  
				comparetb[i] = this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.2 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*1.00+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*0.25;
			}	  
		}	    	
	  

	  //// b) picks which player is best  (skips pitcher or other assigned players)
	    /*thirdbase[t] = 0;
		j=1;*/
	    comparetb[24] = -100;
	    //shortstop[t] = 13;
		j=0;		
	    thirdbase[t] = 24;
		
		
		
        for (i = j; i < 8; i++) {		

            if (numberthirdbase == 1) {
				if ( (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==7) ){
					thirdbase[t] = i;
				}
			} else {
				if ((spitcher[t] == i ) || (centerfield[t] == i) || (shortstop[t] == i) || ((numbercatcher == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==3) ) || ((numberfirstbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4)) || ((numbersecondbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==5))   || ((numberleftfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8)) || ((numberrightfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==9))) {
				} else {
					if (comparetb[thirdbase[t]] < comparetb[i]) {
						thirdbase[t] = i;
					}
				}

			}

		}
	//	if ((spitcher[t] == i ) || (centerfield[t] == i)  || ((numbercatcher == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==3) ) || ((numberfirstbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4)) || ((numbersecondbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==5)) || ((numbershortstop == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==6)) || ((numberthirdbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==7)) || ((numberleftfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8)) || ((numberrightfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==9))	) {


		
	//IV)a) C / comparec catcher			
			  //// a) .25 running .5 throwing 1.00 fielding
		for (i = 0; i < 8; i++) {
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparec[i] = -100;
			} else {
	  
				comparec[i] = this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.2 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*1.00+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*0.25;
			}	  		
		}	    	
	  

	  //// b) picks which player is best  (skips pitcher or other assigned players)
	  //  catcher[t] = 0;
	//	j=1;
		
	    comparec[24] = -100;
		j=0;		
	    catcher[t] = 24;
//	    thirdbase[t] = 13;
				
		
	    if ((spitcher[t] == 0 ) || (centerfield[t] == 0) || (shortstop[t] == 0) || (thirdbase[t] == 0)) {
  	      if ((spitcher[t] == 1 ) || (centerfield[t] == 1) || (shortstop[t] == 1) || (thirdbase[t] == 1)) {
			if ((spitcher[t] == 2 ) || (centerfield[t] == 2) || (shortstop[t] == 2) || (thirdbase[t] == 2)) {
				if ((spitcher[t] == 3 ) || (centerfield[t] == 3) || (shortstop[t] == 3) || (thirdbase[t] == 3)) {
					catcher[t] = 4;
					j=5;			
				} else {		  			
					catcher[t] = 3;
					j=4;			
				}	
			} else {		  
				catcher[t] = 2;
				j=3;			
			}
		  } else {
	        catcher[t] = 1;		  
  		    j=2;						
		  }
		} 
		
        for (i = j; i < 13; i++) {		

            if (numbercatcher == 1) {
				if ( (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==3) ){
					catcher[t] = i;
				}
			} else {
				if ((spitcher[t] == i ) || (centerfield[t] == i) || (shortstop[t] == i) || (thirdbase[t] == i) || ((numberfirstbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4)) || ((numbersecondbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==5))   || ((numberleftfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8)) || ((numberrightfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==9))) {
				} else {
					if (comparec[catcher[t]] < comparec[i]) {
						catcher[t] = i;
					}
				}

			}

		}		
		
		// 2B
	//V)a) C / comparesb secondbase
			  //// a) .25 running .5 throwing 1.00 fielding
		for (i = 0; i < 8; i++) {
		
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparesb[i] = -100;
			} else {
	  
				comparesb[i] = this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.2 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*1.00+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*0.25;
			}			
		}	    	
	  

	  //// b) picks which player is best  (skips pitcher or other assigned players)
	    secondbase[t] = 24;
		j=0;	
	    comparesb[24] = -100;
//	    comparerf[this.playersOnCourt[t][secondbase[t]]] = -100;		
		
        for (i = j; i < 8; i++) {		

            if (numbersecondbase == 1) {
				if ( (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4) ){
					secondbase[t] = i;
				}
			} else {
				if ((spitcher[t] == i ) || (centerfield[t] == i) || (shortstop[t] == i) || (thirdbase[t] == i) || (catcher[t] == i)  || ((numberfirstbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4))  || ((numberleftfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8)) || ((numberrightfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==9))) {
				} else {
					if (comparesb[secondbase[t]] < comparesb[i]) {
						secondbase[t] = i;
					}
				}

			}

		}	
			
		
		// RF
	//VI)a) C / comparesb secondbase
			  //// a) .25 running .5 throwing 1.00 fielding
		for (i = 0; i < 8; i++) {
		
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparerf[i] = -100;
			} else {
	  
				comparerf[i] = this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.2 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*1.00+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*0.25;
			}				
		
		}	    	
	  

	  
	  //// b) picks which player is best  (skips pitcher or other assigned players)
	    rightfield[t] = 24;
		j=0;
	    comparerf[24] = -100;		
//	    comparerf[this.playersOnCourt[t][rightfield[t]]] = -100;		
		
        for (i = j; i < 8; i++) {		

            if (numberrightfield == 1) {
				if ( (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==9) ){
					rightfield[t] = i;
				}
			} else {
				if ((spitcher[t] == i ) || (centerfield[t] == i) || (shortstop[t] == i) || (thirdbase[t] == i) || (catcher[t] == i) || (secondbase[t] == i) || ((numberfirstbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4))  || ((numberleftfield == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8)) ) {
				} else {
					if (comparerf[rightfield[t]] < comparerf[i]) {
//					if (comparerf[this.playersOnCourt[t][rightfield[t]]] < comparerf[this.playersOnCourt[t][i]]) {
						rightfield[t] = i;
					}
				}

			}

		}			
		
		
		// LF		
	//VII)a) C / comparesb secondbase
			  //// a) .25 running .5 throwing 1.00 fielding
		for (i = 0; i < 8; i++) {
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparelf[i] = -100;
			} else {
	  
				comparelf[i] = this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.2 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*1.00+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*0.25;
			}			
		
		}	    	
	  

	  
	  //// b) picks which player is best  (skips pitcher or other assigned players)
	    leftfield[t] = 24;
		j=0;
	    comparelf[24] = -100;	

		
		
        for (i = j; i < 8; i++) {		

            if (numberleftfield == 1) {
				if ( (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==8) ){
					leftfield[t] = i;
				}
			} else {
				if ((spitcher[t] == i ) || (centerfield[t] == i) || (shortstop[t] == i) || (thirdbase[t] == i) || (catcher[t] == i) || (secondbase[t] == i)|| (rightfield[t] == i) || ((numberfirstbase == 1) && (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4)) ) {
				} else {
					if (comparelf[leftfield[t]] < comparelf[i]) {
						leftfield[t] = i;
					}
				}

			}

		}				
		
		
		
		
		// 1B		
	//VIII)a) C / comparesb secondbase
			  //// a) .25 running .5 throwing 1.00 fielding
		for (i = 0; i < 8; i++) {
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
				comparefb[i] = -100;
			} else {
		
				comparefb[i] = this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.2 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*1.00+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*0.25;
			}				
		
		}	    	

	  
	  //// b) picks which player is best  (skips pitcher or other assigned players)
	    firstbase[t] = 24;
		j=0;
	    comparefb[24] = -100;			
		
		
        for (i = j; i < 8; i++) {		

            if (numberfirstbase == 1) {
				if ( (this.team[t].player[this.playersOnCourt[t][i]].ptModifier==4) ){
					firstbase[t] = i;
				}
			} else {
				if ((spitcher[t] == i ) || (centerfield[t] == i) || (shortstop[t] == i) || (thirdbase[t] == i) || (catcher[t] == i) || (secondbase[t] == i)  || (leftfield[t] == i) || (rightfield[t] == i)  ) {
				} else {
					if (comparefb[firstbase[t]] < comparefb[i]) {
						firstbase[t] = i;
					}
				}

			}

		}		

		if (firstbase[t] >7) {
		  if ( (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "CL") ) {
			firstbase[t] = 24;
		  } else if ( (this.team[t].player[this.playersOnCourt[t][23]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "CP") ) {
			firstbase[t] = 23;
		  }
		} 
		if (secondbase[t] >7) {
		  if ( (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "CL") ) {
			secondbase[t] = 24;
		  } else if ( (this.team[t].player[this.playersOnCourt[t][23]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "CP") ) {
			secondbase[t] = 23;
		  }		
		} 
		if (thirdbase[t] >7) {
		  if ( (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "CL") ) {
		  thirdbase[t] = 24;
		  } else if ( (this.team[t].player[this.playersOnCourt[t][23]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "CP") ) {
		  thirdbase[t] = 23;
		  }		
		} 
		if (shortstop[t] >7) {
		  if ( (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "CL") ) {
		  shortstop[t] = 24;
		  } else if ( (this.team[t].player[this.playersOnCourt[t][23]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "CP") ) {
		  shortstop[t] = 23;
		  }		
		} 
		if (leftfield[t] >7) {
		  if ( (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "CL") ) {
		  leftfield[t] = 24;
		  } else if ( (this.team[t].player[this.playersOnCourt[t][23]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "CP") ) {
		  leftfield[t] = 23;
		  }		
		} 
		if (rightfield[t] >7) {
		  if ( (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "CL") ) {
		  rightfield[t] = 24;
		  } else if ( (this.team[t].player[this.playersOnCourt[t][23]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "CP") ) {
		  rightfield[t] = 23;
		  }		
		} 
		if (centerfield[t] >7) {
		  if ( (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "CL") ) {
		  centerfield[t] = 24;
		  } else if ( (this.team[t].player[this.playersOnCourt[t][23]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "CP") ) {
		  centerfield[t] = 23;
		  }		
		} 
		if (catcher[t] >7) {
		  if ( (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][firstbase[t]]].pos != "CL") ) {
		  catcher[t] = 24;
		  } else if ( (this.team[t].player[this.playersOnCourt[t][23]].pos != "SP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "RP") ||  (this.team[t].player[this.playersOnCourt[t][23]].pos != "CP") ) {
		  catcher[t] = 23;
		  }		
		} 
		


		
        positionplayers[t][0] = spitcher[t];
   //     this.team[t].player[this.playersOnCourt[t][positionplayers[t][0]]].pos = "SP";		
		this.recordStat(t, this.playersOnCourt[t][ positionplayers[t][0]], "min",1);			
//		this.recordStat(t, this.playersOnCourt[t][i], "showPlayByPlayPitcher");
       
        positionplayers[t][1] = firstbase[t];
        this.team[t].player[this.playersOnCourt[t][positionplayers[t][1]]].pos = "1B";		

		positionplayers[t][2] = secondbase[t];
        this.team[t].player[this.playersOnCourt[t][positionplayers[t][2]]].pos = "2B";				
        positionplayers[t][3] = thirdbase[t];
        this.team[t].player[this.playersOnCourt[t][positionplayers[t][3]]].pos = "3B";		
        positionplayers[t][4] = shortstop[t];
        this.team[t].player[this.playersOnCourt[t][positionplayers[t][4]]].pos = "SS";		
        positionplayers[t][5] = leftfield[t];
        this.team[t].player[this.playersOnCourt[t][positionplayers[t][5]]].pos = "LF";		
		positionplayers[t][6] = rightfield[t];
        this.team[t].player[this.playersOnCourt[t][positionplayers[t][6]]].pos = "RF";		
        positionplayers[t][7] = centerfield[t];
        this.team[t].player[this.playersOnCourt[t][positionplayers[t][7]]].pos = "CF";		
        positionplayers[t][8] = catcher[t];
        this.team[t].player[this.playersOnCourt[t][positionplayers[t][8]]].pos = "C";		

  //      this.team[t].player[8].pos = "SP";		
  //      this.team[t].player[9].pos = "SP";		
    //    this.team[t].player[10].pos = "SP";		
      //  this.team[t].player[11].pos = "SP";		
      //  this.team[t].player[12].pos = "SP";		
        //this.team[t].player[13].pos = "CL";	

/*	    console.log("NEW TEAM-before closer");
	  for (i = 13; i < 14; i++) {		  
		console.log("t: "+t+"i: "+i+" position: "+this.team[t].player[this.playersOnCourt[t][i]].pos);
	  
	  }		*/
			if 	((this.team[t].player[this.playersOnCourt[t][13]].pos == "RP") || (this.team[t].player[this.playersOnCourt[t][13]].pos == "SP")) {
				this.team[t].player[this.playersOnCourt[t][13]].pos = "CL";
			}
/*	    console.log("NEW TEAM-after closer");
	  for (i = 13; i < 14; i++) {		  
		console.log("t: "+t+"i: "+i+" position: "+this.team[t].player[this.playersOnCourt[t][i]].pos);
	  
	  }				*/
    /*    for (i = 8; i < 13; i++) {		  
			if 	((this.team[t].player[i].pos == "RP")  || (this.team[t].player[13].pos == "CL")) {
				this.team[t].player[i].pos = "SP";
			}
		}			*/
		

        for (i = 14; i < 25; i++) {		  
			if 	((this.team[t].player[this.playersOnCourt[t][i]].pos == "SP")   || (this.team[t].player[this.playersOnCourt[t][i]].pos == "CL")) {
				this.team[t].player[this.playersOnCourt[t][i]].pos = "RP";
			}
		}			
		

////////////////////////////////////////////////		
						
		
// half inning goes on until 3 outs
// have the above done just at start of game
// have the below done every half inning?
        
        var probpickedoff,baseaggressiveness;

//		battingorder[0] = positionplayers[t][onespot[t]];
		
		
		//console.log(liveGameDisplay);
//		battingOrderGame[t][0] = positionplayers[t][onespot[t]];
		battingOrderGame[t][0] = 0;
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][0]]] = 0;
	//	console.log("h0: "+ this.playersOnCourt[t][battingOrderGame[t][0]]+" "+battingOrderGame[t][0]);
//		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][0]], "fgaLowPost",10);
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][0]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][0]], "gs");	
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][0]], "showPlayByPlay");
		
//		battingorder[1] = positionplayers[t][twospot[t]];	
//		battingOrderGame[t][1] = positionplayers[t][twospot[t]];	
		battingOrderGame[t][1] = 1;	
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][1]]] = 1;
//		console.log("h1: "+ this.playersOnCourt[t][battingOrderGame[t][1]]+" "+battingOrderGame[t][1]);
//		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][1]], "fgaLowPost",9);			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][1]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][1]], "gs");			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][1]], "showPlayByPlay");
//		battingorder[2] = positionplayers[t][threespot[t]];
//		battingOrderGame[t][2] = positionplayers[t][threespot[t]];
		battingOrderGame[t][2] = 2;
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][2]]] = 2;
//		console.log("h2: "+ this.playersOnCourt[t][battingOrderGame[t][2]]+" "+battingOrderGame[t][2]);
//		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][2]], "fgaLowPost",8);			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][2]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][2]], "gs");			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][2]], "showPlayByPlay");
//		battingorder[3] = positionplayers[t][fourspot[t]];
//		battingOrderGame[t][3] = positionplayers[t][fourspot[t]];
		battingOrderGame[t][3] = 3;
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][3]]] = 3;
//		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][3]], "fgaLowPost",7);			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][3]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][3]], "gs");			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][3]], "showPlayByPlay");
//		battingorder[4] = positionplayers[t][fivespot[t]];		
//		battingOrderGame[t][4] = positionplayers[t][fivespot[t]];		
		battingOrderGame[t][4] = 4;		
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][4]]] = 4;
//		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][4]], "fgaLowPost",6);	
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][4]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;		
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][4]], "gs");			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][4]], "showPlayByPlay");
//		battingorder[5] = positionplayers[t][sixspot[t]];		
//		battingOrderGame[t][5] = positionplayers[t][sixspot[t]];		
		battingOrderGame[t][5] = 5;		
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][5]]] = 5;
//		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][5]], "fgaLowPost",5);			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][5]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][5]], "gs");			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][5]], "showPlayByPlay");
//		battingorder[6] = positionplayers[t][sevenspot[t]];		
//		battingOrderGame[t][6] = positionplayers[t][sevenspot[t]];		
		battingOrderGame[t][6] = 6;		
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][6]]] = 6;
//		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][6]], "fgaLowPost",4);			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][6]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;
		
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][6]], "gs");			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][6]], "showPlayByPlay");
//		battingorder[7] = positionplayers[t][eightspot[t]];		
//		battingOrderGame[t][7]  = positionplayers[t][eightspot[t]];		
		battingOrderGame[t][7]  = 7;		
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][7]]] = 7;
		//this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][7]], "fgaLowPost",3);			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][7]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;		
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][7]], "gs");			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][7]], "showPlayByPlay");

//		battingOrderGame[t][8]  = positionplayers[t][lastspot[t]];		
		battingOrderGame[t][8]  = positionplayers[t][0];		
		playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][8]]] = 8;
//		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][8]], "fgaLowPost",2);			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][8]], "fgaLowPost",liveGameDisplay[t]);
		liveGameDisplay[t] -= 1;
		
		//console.log(liveGameDisplay);		
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][8]], "gs");			
		this.recordStat(t, this.playersOnCourt[t][battingOrderGame[t][8]], "showPlayByPlay");

        		
		for (i = 0; i < 9; i++) {		  
			
			if (positionplayers[t][0] == battingOrderGame[t][i]) {
		
				playByPlayOrderPitching[t][this.playersOnCourt[t][positionplayers[t][0]]] = playByPlayOrder[t][this.playersOnCourt[t][battingOrderGame[t][i]]];
				this.recordStat(t, this.playersOnCourt[t][positionplayers[t][0]], "showPlayByPlayPitcher");
				i = 9;
			}
	//		console.log("team"+t+" battingorder: "+i+" fgLowPost: "+this.team[t].player[this.playersOnCourt[t][positionplayers[t][i]]].stat.fgaLowPost+" batter: "+battingOrderGame[t][i]+" positionplayers: "+positionplayers[t][i]);
//			console.log(t+" "+i+" "+battingOrderGame[t][i]);
		
		}	
		
	//	console.log("got here");
		
		// needed?
		this.recordStat(t, this.playersOnCourt[t][0], "fgaMidRange",0);			
		this.recordStat(t, this.playersOnCourt[t][1], "fgaMidRange",1);			
		this.recordStat(t, this.playersOnCourt[t][2], "fgaMidRange",2);			
		this.recordStat(t, this.playersOnCourt[t][3], "fgaMidRange",3);			
		this.recordStat(t, this.playersOnCourt[t][4], "fgaMidRange",4);			
		this.recordStat(t, this.playersOnCourt[t][5], "fgaMidRange",5);			
		this.recordStat(t, this.playersOnCourt[t][6], "fgaMidRange",6);			
		this.recordStat(t, this.playersOnCourt[t][7], "fgaMidRange",7);			
		this.recordStat(t, this.playersOnCourt[t][8], "fgaMidRange",8);			
		this.recordStat(t, this.playersOnCourt[t][9], "fgaMidRange",9);			
		this.recordStat(t, this.playersOnCourt[t][10], "fgaMidRange",10);			
		this.recordStat(t, this.playersOnCourt[t][11], "fgaMidRange",11);			
		this.recordStat(t, this.playersOnCourt[t][12], "fgaMidRange",12);			
				
		var test;
  		
     }		
		this.startersRecorded = true;
	}
	// above just first inning to get starters in place
	// can record starter above
	
// every half inning	
    var tempplayer;
	var tempPosition;
  var pitcherLocation;

	for (i=0; i < 9; i++) {
		fielders[i] = positionplayers[this.d][i] ;
		battingorder[i] = battingOrderGame[this.o][i];
	}    
	
	if ((halfInning>18) && (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].stat.gs==1) ) {
		console.log("starter:"+ halfInning+" "+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].stat.gs+" "+fielders[0])
	}
	if ((halfInning<18) &&(halfInning>15) && (this.team[this.o].stat.pts < this.team[this.d].stat.pts) && ( (this.team[this.o].stat.pts+3) >= this.team[this.d].stat.pts)) {
			
			//// two parts
			//1) is save opp
			//2) can closer do it, or does another pitcher
			
		if  ( (this.team[this.d].player[this.playersOnCourt[this.d][13]].energy) == 100) {
		
			saveOpp[this.o] = 100;
			saveOpp[this.d] = 1;
			tempplayer = this.playersOnCourt[this.d][fielders[0]];
			this.playersOnCourt[this.d][fielders[0]] = this.playersOnCourt[this.d][13];
			this.playersOnCourt[this.d][13] = tempplayer;	
		} else {
			if (((this.team[this.d].player[this.playersOnCourt[this.d][14]].energy) == 100) && (this.team[this.d].player[this.playersOnCourt[this.d][14]].pos == "RP")) {
				saveOpp[this.o] = 100;
				saveOpp[this.d] = 1;
				tempplayer = this.playersOnCourt[this.d][fielders[0]];
				this.playersOnCourt[this.d][fielders[0]] = this.playersOnCourt[this.d][14];
				this.playersOnCourt[this.d][14] = tempplayer;	
			} else if (((this.team[this.d].player[this.playersOnCourt[this.d][15]].energy) == 100) && (this.team[this.d].player[this.playersOnCourt[this.d][15]].pos == "RP"))  {
				saveOpp[this.o] = 100;
				saveOpp[this.d] = 1;
				tempplayer = this.playersOnCourt[this.d][fielders[0]];
				this.playersOnCourt[this.d][fielders[0]] = this.playersOnCourt[this.d][15];
				this.playersOnCourt[this.d][15] = tempplayer;					
			}
		
		}
		
		////should skip starter, but one of these pitchers should be available
		
		savingPitcher[this.d] = this.playersOnCourt[this.d][fielders[0]];
		battingOrderPlayByPlay[this.d] +=1;
		pitchingOrderPlayByPlay[this.d] += 1;		
		playByPlayOrder[this.d][this.playersOnCourt[this.d][fielders[0]]] = battingOrderPlayByPlay[this.d];
		playByPlayOrderPitching[this.d][this.playersOnCourt[this.d][fielders[0]]] = battingOrderPlayByPlay[this.d];										
		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "showPlayByPlay");
		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "showPlayByPlayPitcher");
		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgaLowPost",liveGameDisplay[this.d]);
		liveGameDisplay[this.d] -= 1;
	} else if 	((this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].energy < 40) || ((this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].stat.gs==0) && (halfInning > 11))  || ((this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].stat.gs==1) && (halfInning > 18))) {
			if ( (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].pos == "RP")  || (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].pos == "SP")  || (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].pos == "CL") ) {
				this.switchPlayers(this.d,fielders[0],0,halfInning);
				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgaLowPost",liveGameDisplay[this.d]);
				liveGameDisplay[this.d] -= 1;
				
				saveOpp[this.d] = 100;	  		
			}
	} else {
			saveOpp[this.d] = 100;	  
	}
	
	if ((halfInning>18) && (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].stat.gs==1) ) {
	//	console.log("still starter? "+ halfInning+" "+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].stat.gs+" "+fielders[0])
	}	
	if ((this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].fta>=9) ) {
	//	console.log("still starter? "+ halfInning+" "+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].stat.gs+" "+fielders[0])
	}		
	//// if bottom of ninth, home team is ahead, can skip that half inning
	if (((halfInning<18) &&(halfInning>16)) && (this.team[this.o].stat.pts > this.team[this.d].stat.pts) ) {
	    outs = 3;
	}
	
//	battingOrderGame[this.o][] 1-9;
//	fieldingPosition[this.d][] 1-9;
         var batterstart;
		 var oldouts;
		 var pitcherinnings;
		 var newpitcher;
		 var p,o;
		 
		 var errorouts;
		 
		 oldouts = 0;
		 pitcherinnings = 0;
		 newpitcher = 100;
		 p = this.playersOnCourt[this.d][fielders[0]];  
		 if (this.o == 0)  {
	//	    this.recordPlay("quarter");
		    this.recordPlay("quarter");

		 } else {
	//		this.recordPlay("halfInning");
			this.recordPlay("halfInning");

		 }		 
		// console.log("before FTA "+this.d+" "+this.team[this.d].player[p].name+" "+p+" "+fielders[0]+" "+this.team[this.d].player[p].stat["fta"]);
         this.recordPlay("fta", this.d, [this.team[this.d].player[p].name]);		 // this.team[this.o].player[p].name
	//	 console.log("after FTA "+this.d+" "+this.team[this.d].player[p].name+" "+p+" "+fielders[0]+" "+this.team[this.d].player[p].stat["fta"]);		 
		if (this.team[this.d].player[p].stat["fta"]>=9) {
		//	console.log("too many innings: "+this.team[this.d].player[p].stat["fta"]);
			//console.log("half innings: "+halfInning);	
			//console.log("energy: "+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].energy);	 			
			if (this.team[this.d].player[p].stat["gs"]==1) {
				console.log("and a starter "+this.team[this.d].player[p].stat["gs"]);
			}
		//	console.log(fielders[0]);
			this.switchPlayers(this.d,fielders[0],0,halfInning);
			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgaLowPost",liveGameDisplay[this.d]);
			liveGameDisplay[this.d] -= 1;
			
			saveOpp[this.d] = 100;				
		//	console.log(fielders[0]);
			
		}
         errorouts = 2; // no errors, each error lowers by 1, if outs above this then run isn't earned
         while( outs < 3 ) {
		 
		 
			// pitcher gets injured?
			//this.switchPlayers(this.d,fielders[0]) {
			
			// all but pitcher can be subbed (pitchers already have an energy measure to use)
			this.subPos(this.d,fielders[1]);
			this.subPos(this.d,fielders[2]);
			this.subPos(this.d,fielders[3]);
			this.subPos(this.d,fielders[4]);
			this.subPos(this.d,fielders[5]);
			this.subPos(this.d,fielders[6]);
			this.subPos(this.d,fielders[7]);
			this.subPos(this.d,fielders[8]);
			
			// pitchers 58.59, rest around 5%
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);			
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);
			this.injuriesPos(this.d,fielders[0]);			
			this.injuriesPos(this.d,fielders[1]);
			this.injuriesPos(this.d,fielders[2]);
			this.injuriesPos(this.d,fielders[3]);
			this.injuriesPos(this.d,fielders[4]);
			this.injuriesPos(this.d,fielders[5]);
			this.injuriesPos(this.d,fielders[6]);
			this.injuriesPos(this.d,fielders[7]);
			this.injuriesPos(this.d,fielders[8]);
			this.injuriesPos(this.o,battingorder[0]);
			this.injuriesPos(this.o,battingorder[0]);
			
			
			//this.injuriesPos(this.d,fielders[0]);
			//this.injuriesPos(this.d,fielders[0]);
			if (this.o == 1) {
			//	console.log(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].injured+" "+halfInning+" "+outs+" "+this.o+" "+this.playersOnCourt[this.o][battingorder[batter[this.o]]]);
			//	console.log(this.playersOnCourt[this.o][0]+" "+this.playersOnCourt[this.o][1]+" "+this.playersOnCourt[this.o][2]+" "+this.playersOnCourt[this.o][3]+" "+this.playersOnCourt[this.o][4]+" "+this.playersOnCourt[this.o][5]+" "+this.playersOnCourt[this.o][6]+" "+this.playersOnCourt[this.o][7]+" "+this.playersOnCourt[this.o][8]+" "+this.playersOnCourt[this.o][9]+" "+this.playersOnCourt[this.o][10]+" "+this.playersOnCourt[this.o][11]+" "+this.playersOnCourt[this.o][12]+" "+this.playersOnCourt[this.o][13]+" "+this.playersOnCourt[this.o][14]+" "+this.playersOnCourt[this.o][15]);
					//console.log(t+" "+this.playersOnCourt[t][p]+" "+this.team[t].player[this.playersOnCourt[t][p]].injured);
			}
			
			batterstart = batter[this.o] ;
				o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
			//				console.log("actual at bats team:"+this.o+" batterposition: "+batter[this.o]+" actualbatter: "+battingOrderGame[this.o][batter[this.o]]);
				
				this.recordPlay("fga", this.o, [this.team[this.o].player[o].name]);		 			
			outs = this.eachbatter(battingorder, fielders,outs,onbase,errorouts)
			
			// make player specific, use on every play, sub at that moment
      //      this.injuries(batter,battingorder,fielders); // see if batter or fielders gets injured, need to also check starting lineups for injuries

			
			for (i=oldouts; i < outs; i++) {
			 //	console.log("fta stat "+this.d+" "+this.playersOnCourt[this.d][fielders[0]])
				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fta",1/3);			
			}			
			
			oldouts = outs;
			
			if (batterstart === batter[this.o] ) {
			// hit or out, batting uses an at bat
				this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fga");	
				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "abP");
				
				
				batter[this.o] +=1;
				if (batter[this.o] > 8) {
					batter[this.o] = 0;
				}				
				
			} else if ((batterstart - batter[this.o] > 0) || (batterstart - batter[this.o] < -5)) {
				batter[this.o] +=1;			
				if (batter[this.o] > 8) {
					batter[this.o] = 0;
				}					
			// caught stealing, rebat
			} 				

			p = this.playersOnCourt[this.d][fielders[0]];		 

			this.team[this.d].player[p].energy -= 2.6;		 			
		 }				
		 
        return (1);  
    };
	
    /**
     * Probability that a shot taken this possession is blocked.
     * 
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.eachbatter = function (battingorder,fielders,outs,onbase,errorouts) {
	
        //// keeps track of balls strikes
      var  ballsandstrikes = [0,0];
       var overthrow;
	  var stealing; // 0 no steal, 1 steal;
	  var stealingbase;
	  var probtriestosteal;
	  var probthrow;
	  var stealing;
	  var baseaggressiveness;
	  var throwattempt;
	  var pickedoff;
	  var probpickedoff;
	  var proboverthrow;

		  var holdervar;
		  
		/////////// Now START PITCHING
		
		var probabilitystrike;
		var probabilityswingstrike;
		var probabilityswingball;		
		var hittingcontact;
		var pitchingcontact;
		var probabilitycontactball;
		var probabilitycontactstrike;		
		
        var probabilitycontactball;			
		var	probabilityswingball;
		var probabilityfair;
		var probabilityplayable;
		var	probabilitycaught;		
		
		
		var probstealsuccess;
		var manonthirdscores;
		
		var advancetosecond;
		var advancetothird;
		var advancehome;
		
		var probabilitylinedrive;
		var probabilitylinedrivecaught;
		
		var probabilityflyball;
		var probabilityflycaught;
		var manonthirdscores;

		var probabilitylocation; // outfield, ll,lf,lc,cf,cr,rf // infield tb,ts,ss,s2,2b,2f,fb,c,cp,p
		
		var probabilitythrownout;
		var probabilitythrownout2B;
		var probabilitythrownout3B;
		var probabilitythrownoutH;
		var hittingpower;
		
		var i,p,f,o;
		
		var fieldingwieghts = [0,0,0,0,0,0,0,0,0];
		var weightssum = 0;
		
		var ballLocation = 0;
		var location = 100;
		var probError = 0;
		var error = 0;
		
		var probError,probMakePlay,probNoPlay,resultOfPlay;		
		//// power, accuracy, opp hitting, opp power		  
	 //// becomes ,?
	/*  if (batter[this.o] < 9) {

	  } else {
     console.log("this.o  is " + this.o  );						
     console.log("batter[this.o]  is " + batter[this.o]  );						
	  
	  }
	  if (batter[this.o] > -1 ) {

	  } else {
     console.log("this.o  is " + this.o  );						
     console.log("batter[this.o]  is " + batter[this.o]  );						
	  
	  }*/

	var runwillscore = [0,0,0,0];
	var scorer = [100,100,100,100];

	  
		//// loop for each pitch until next batter
		
	var turboON = 1;
	var	atBatOutcome = 0;
	////////////////////// CREATE TURBO VERSION
	if (turboON == 0) {
	//// not by pitch, but by outcomes
	
	//// assuming 3-4 pitches, cuts time by 75%
	
		// atBatOutcome could be altered by pitcher,hitter,fielder
		
		
		/////////////////////////////////PrePitch
		
	  var stealingbase = [0.00,0.00,0.00]; // 0,1;
	  

		
		////III)  prior to pitch
 		
		if (onbase[2] < 100) {
		  // does he get picked off or advance could be function pickofforadvance, or lead (may lead to pickoff,steal,or help with stealing
		    //// based agg, speed, acc, catching
			
			//stealing home? very rare
		  probtriestosteal =  0.002*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.stealing)*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.stealing) ;  // can make this depend on infield defense, hitter,other runners        
/////		  probtriestosteal =  0.03 ;  // can make this depend on infield defense, hitter,other runners        
           stealing = 0.00;
           stealingbase[2] = 0.00;
		  if (probtriestosteal > Math.random()) {
            // And 1
           stealing = 1.00;			
           stealingbase[2] = 1.00;
		   
          }							  
//// removing pick off

		  
		}
		

		if (onbase[1] < 100) {
			if (onbase[2] == 100) {
		  // does he get picked off or advance could be function pickofforadvance, or lead (may lead to pickoff,steal,or help with stealing
		    //// based agg, speed, acc, catching
			
			//stealing home? very rare
//		  probtriestosteal =  0.12*this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing ;  // can make this depend on infield defense, hitter,other runners        
				probtriestosteal =  0.01*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing)*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing) ;  // can make this depend on infield defense, hitter,other runners        

				stealing = 0;
				stealingbase[1] = 0.00;
				if (probtriestosteal > Math.random()) {
            // And 1
					stealing = 1;			
					stealingbase[1] = 1.00;
		   
				}							  
		  
			}
		}

		if (onbase[0] < 100) {
			if (onbase[1] == 100) {
		  // does he get picked off or advance could be function pickofforadvance, or lead (may lead to pickoff,steal,or help with stealing
		    //// based agg, speed, acc, catching
			
			//stealing home? very rare
//		  probtriestosteal =  0.20*this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing;   // can make this depend on infield defense, hitter,other runners        
				probtriestosteal =  0.1*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing)*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing) ;  // can make this depend on infield defense, hitter,other runners        

				stealing = 0.00;
				stealingbase[0] = 0.00;		   
				if (probtriestosteal > Math.random()) {
            // And 1
					stealing = 1.00;			
					stealingbase[0] = 1.00;		   
		   
				}							  
		  
			}
		}
		
		
		//A)SB
		var probstealsuccess;
		
                   if ((stealingbase[2]>0) && (onbase[2]<100)) {
					   probstealsuccess = .5+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.stealing -  this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.defense)/4 ; // stealing - tagging (later catcher arm, pitcher location)
			//		   console.log("3106"+probstealsuccess);
						p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
					    f = this.playersOnCourt[this.d][fielders[0]];
						outs = this.stealingbase(outs,onbase,p,f,probstealsuccess,2,errorouts);	
						if (outs > 2) {
							if (batter[this.o] < 1) {
									batter[this.o] = 8;
							} else {
								batter[this.o] -=1;
							}											 
							return outs;
						}
					}
					if (outs>2) {
						return outs;					
					}					
                    if ((stealingbase[1]>0) && (onbase[1]<100)) {
					   probstealsuccess = .6+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing -  this.team[this.d].player[this.playersOnCourt[this.d][fielders[4]]].compositeRating.defense)/2 ; // stealing - tagging (later catcher arm, pitcher location)					
					//   console.log("3124"+probstealsuccess);
						p = this.playersOnCourt[this.o][battingorder[onbase[1]]];
					    f = this.playersOnCourt[this.d][fielders[0]];
						
						outs = this.stealingbase(outs,onbase,p,f,probstealsuccess,1,errorouts);
						if (outs > 2) {
							if (batter[this.o] < 1) {
									batter[this.o] = 8;
							} else {
								batter[this.o] -=1;
							}											 
							return outs;
						}						
					}
					if (outs>2) {
						return outs;					
					}					
                    if ((stealingbase[0]>0) && (onbase[0]<100)) {
					   probstealsuccess = .6+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing -  this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.defense)/2 ; // stealing - tagging (later catcher arm, pitcher location)					   
					//   console.log("3141"+probstealsuccess);

					   p = this.playersOnCourt[this.o][battingorder[onbase[0]]];
					    f = this.playersOnCourt[this.d][fielders[0]];
					   
						outs = this.stealingbase(outs,onbase,p,f,probstealsuccess,0,errorouts);
						if (outs > 2) {
							if (batter[this.o] < 1) {
									batter[this.o] = 8;
							} else {
								batter[this.o] -=1;
							}											 
							return outs;
						}						
					}
					if (outs>2) {
						return outs;					
					}			
		
		///////////////////////////// USE
		// B)
		// i)SO
		// ii)BB
		// iii)fair
		//// a)type
		//// a)position
		
		// alt, super turbo
		// i)SO
		// ii)BB
		// iii)hit
		//// a)type (s,d,t,h)
		//// b) gb,ld,f   (remove error side)
		//// iv) out
		////  a) position
		////  v) error
		////  a) position
		
		
		
//		probabilitystrike = 0.25+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/2;  // accuracy .25 to .75
		probabilitystrike = 0.44+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/6;  // accuracy .25 to .75, .4 to .6
		hittingcontact = this.team[this.o].player[battingorder[batter[this.o]]].compositeRating.turnovers; // hitting
//		pitchingcontact = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*2+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.blocking*3)/5; // (all 5 pitch areas, even)
		pitchingcontact = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*2+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.blocking*3)/5; // (all 5 pitch areas, even)
//		hittingpower = this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT; // hitting
		hittingpower = this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT; // hitting
		
        // should be based on hitter and pitcher		
		atBatOutcome = Math.random();
		
		
		if (atBatOutcome < .09) {
		//walk
	/*		this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg");	
			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb");										
			this.recordPlay("fg", this.o, [this.team[this.o].player[o].name]);		*/
			
			 ////////////1)create function walk			 
                                this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "ast");							   																		 
								this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgaAtRim");	
								o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];								
								this.recordPlay("ast", this.o, [this.team[this.o].player[o].name]);		 			
								
			     ballsandstrikes[0] = 0;
				 if (onbase[0] < 100) {
                    if (onbase[1] < 100) {
						if (onbase[2] < 100) {
					       //// score run by onbase[3]		
							if 	(outs>errorouts) {										
								this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
                    //            console.log("Run");								
							} else {
								this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");
								this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");							
								this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "stl");							   
                       //         console.log("Earned Run");								
							}			

						   
                            this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");		
							p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
							this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
												//console.log("f6: "+fielders[0]);
							this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
							
							this.walk(onbase,batter,2);													
					        return outs;					   
						} else {
							this.walk(onbase,batter,2);												
					        return outs;							
						}    					  					  
					} else {
						this.walk(onbase,batter,1);						
						return outs;					   
					}  
				 } else {
						this.walk(onbase,batter,0);						
					return outs;
				 }
			return outs;
			
		} else if (atBatOutcome < .30) {
		//SO
//		} if (probabilityfair > Math.random()) {

					outs += 1;
				//	outs += 1;
			/*	console.log("this.o "+ this.o);
				console.log("batter "+ batter[this.o]);
				console.log("battingorder "+ battingorder[batter[this.o]]);
				console.log("playersOnCourt "+ this.playersOnCourt[this.o][battingorder[batter[this.o]]]);*/
				
                    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "tov");							   					
					this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgAtRim");
					o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
					this.recordPlay("tov", this.o, [this.team[this.o].player[o].name],outs);		 			
					
			//		if (outs > 2) {					
						return outs;
			//		}
		} else {
					///////////////// function used below as well							
				   //// ball in play
				          // can be included in getting to 1b, 2b, 3b, but for now to do it this way (later when each fielder has a variable more detail can be added)
						  // based on hitting, line drive, rest based on
						  // makes it too easy (smaller variations)
//				           probabilityflyball = .10+(1-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers+.25*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].skills.dnk))/4.00;   // fly vs line vs grounder						   
//				           probabilitylinedrive = 0.10+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers)*.5;  // line vs grounder
				           probabilityflyball = .40+hittingpower/7;
				           probabilitylinedrive = .40+hittingcontact/7;
						   
				if (probabilityflyball > Math.random()) {
						   
						   //// start Fly Ball
						   
					this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fb");
						   
						     // range from 3/12 to 9/12 so could always fall in or not (weaker batters should focus more infield, stronger batters more outfield)
							 // bumped 0.20 since line drives are not included
							 	//	fielders[4] = cornerinfield[this.d];		*/
//								probabilityflycaught = this.probabilityArray(fielders, 1,1,2,1,2,4,8,4,1,"defensePerimeter");
								                              

                 /*               balllocation = Math.random();
								location3B = 1;
								location3BSS = 1;
								locationSS = 1;
								locationSS2B=1;
								location2B = 1;
								location2B1B = 1;
								location1B = 1;								
								location1BP = 1;																
								locationP = 1;								
								locationPC = 1;																
								locationC = 1;																
								locationLF = 1;																
								locationLFCF = 1;
								locationCF = 1;																
								locationCFRF = 1;								
								locationRF = 1;																
								locationLF3B = 1;																
								locationCFSS = 1;																
								locationCF2B = 1;																
								locationLF1B = 1;																
								
								totallocations = location3B+
								if (balllocation < .1) {
								  
								}*/
								

								
//								location = this.ballLocation(fielders,location3B,location3BSS,locationSS,locationSS2B,location2B,location2B1B,location1B,location1BP,locationP,locationPC,locationC,locationLF,locationLFCF,locationCF,locationCFRF,locationRF,locationLF3B,locationCFSS,locationCF2B,locationLF1B);
					location = this.ballLocation(location,fielders,1,1,1,1,1,1,1,1,1,1,1,5,7,7,7,5,2,2,2,2);
								//if (location < 100) {
//									this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
//								}
								
					if (location == 100) {
					    probabilityflycaught = 0;
					} else {
						probError = .005+(1-this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior)/100;   // .01 to .06
						probMakePlay = .95+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior)/100;   // 0.9 to .95 .8 to .9    .9,.01,.09 to .8,.06,.14
						probNoPlay = probError+(1-probMakePlay);
						resultOfPlay =  Math.random();
								   
						if (probError > resultOfPlay) {								   									   
							probabilityflycaught = -1;  //  error
							//			this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg",-1);																				
							this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "errors");		
							errorouts -= 1;
					//		console.log("got an error: " + errorouts);
							o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
							this.recordPlay("er", this.o, [this.team[this.o].player[o].name]);		 			
						
							this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
										//							console.log("got an error: " + errorouts+" got an error: " + errorouts);
						} else if (probNoPlay > resultOfPlay) {
							probabilityflycaught = 0;	// hit						
						} else {
							probabilityflycaught = 1; // caught
						    this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
									
						}
								   
					}
								

							 
						     //probabilityflycaught = 0.2+(3+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.defensePerimeter+this.team[this.d].player[this.playersOnCourt[this.d][fielders[4]]].compositeRating.defensePerimeter*0.50)+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[1]]].compositeRating.defensePerimeter+this.team[this.d].player[this.playersOnCourt[this.d][fielders[3]]].compositeRating.defensePerimeter*0.50)*3)/12;							 
//						     if (probabilityflycaught > Math.random()) {
					if (probabilityflycaught == 1) {
					    outs +=1;
						o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
						this.recordPlay("fo", this.o, [this.team[this.o].player[o].name],outs);		 			
								
								//// if runner on 3rd, with less than 2 outs, could advance home if ball hit hard enough// future improvement							
						onbase = this.manOnThird(.25,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts);												
				
						return outs;
					} else {
							    //////Fly Ball not caught (same as line drive not caught)
								
							    //how many bases
								//// see below
									  //// can have fielder adjustments, going to wait until have all 9 players
									  //// have drag if on ground for HR
						this.FairBallNotCaught(onbase,batter,battingorder,fielders,probabilityflycaught,errorouts,outs);
								

					}
			} else if (probabilitylinedrive > Math.random()){
						  
						  
						  
				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "ld");
						  
						  // same logic as fly, but greater odds of single and not being caught?
						     // range from .25 to .5
							 
								/*location3B = 1;
								location3BSS = 1;
								locationSS = 1;
								locationSS2B=1;
								location2B = 1;
								location2B1B = 1;
								location1B = 1;								
								location1BP = 1;																
								locationP = 1;								
								locationPC = 1;																
								locationC = 1;																
								locationLF = 1;																
								locationLFCF = 1;
								locationCF = 1;																
								locationCFRF = 1;								
								locationRF = 1;																
								locationLF3B = 1;																
								locationCFSS = 1;																
								locationCF2B = 1;																
								locationLF1B = 1;																*/
				location = this.ballLocation(location,fielders,3,5,5,5,5,5,3,2,1,0,0,5,6,6,6,5,1,1,1,1);
/*								if (location < 100) {
									this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
								}*/
								
				if (location == 100) {
				    probabilityflycaught = 0;
				} else {
					probError = .005+(1-this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior)/100;   // .01 to .10
					probMakePlay = .93+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior)/100;   // .7 to .9    .9,.01,.09 to .8,.06,.14
					probNoPlay = probError+(1-probMakePlay);
					resultOfPlay =  Math.random();
								   
					if (probError > resultOfPlay) {								   									   
						probabilityflycaught = -1;  //  error
						errorouts -= 1;										
					//					this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg",-1);																				
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "errors");	
						//	console.log("got an error: " + errorouts);						
						o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
						this.recordPlay("er", this.o, [this.team[this.o].player[o].name]);		 			
										
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
													//		console.log("got an error: " + errorouts);		
					} else if (probNoPlay > resultOfPlay) {
						probabilityflycaught = 0;	// hit						
					} else {
						probabilityflycaught = 1; // caught
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
										
									
					}
								   
				}

				 
								//probabilityflycaught = .75+this.probabilityArray(fielders, 1,1,3,1,3,8,24,8,1,"defensePerimeter")*.25;

				probabilitylinedrivecaught = probabilityflycaught;
							 
						     //probabilityflycaught = 0.2+(3+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.defensePerimeter+this.team[this.d].player[this.playersOnCourt[this.d][fielders[4]]].compositeRating.defensePerimeter*0.50)+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[1]]].compositeRating.defensePerimeter+this.team[this.d].player[this.playersOnCourt[this.d][fielders[3]]].compositeRating.defensePerimeter*0.50)*3)/12;							 
				if (probabilitylinedrivecaught == 1) {
							 
							 
//							probabilitylinedrivecaught = .75+this.probabilityArray(fielders, 1,1,2,1,2,6,12,6,0,"defensePerimeter")*.25;
							 
//						     if (probabilitylinedrivecaught > Math.random()) {
					outs +=1;
					o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
					this.recordPlay("lo", this.o, [this.team[this.o].player[o].name],outs);		 			
								
								//// if runner on 3rd, with less than 2 outs, could advance home if ball hit hard enough// future improvement											
					onbase = this.manOnThird(.25,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts);												
					return outs;
				} else {
							    // Line Drive not caught
							    //how many bases
								//// see below
									  //// can have fielder adjustments, going to wait until have all 9 players
									  //// have drag if on ground for HR
					this.FairBallNotCaught(onbase,batter,battingorder,fielders,probabilitylinedrive,errorouts,outs);
				}		
						   ///// Line Drive Ends
			} else {
						  // Ground Ball
							/////// Ground Ball starts	
 				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "gb");
				this.groundBall(onbase,stealingbase,batter,scorer,battingorder,fielders,outs,runwillscore,error,errorouts);
						
							
				if (outs > 2) {
					return outs;
				} else {
								
							 //// ground ball stats
					onbase = this.groundBallStats(runwillscore,onbase,batter,scorer,battingorder,fielders,error,errorouts,outs);
								 
				}							
			}						 
			return outs;							

				   
		} 		
		
		
		// above keeps current structure, just reduces loops
		
		// 1)could just take fair code
		// 2)instead of balls strikes just give % to walk, SO
		// 3) have to estimate pitches then
		///////////////////////////// USE END
		// below too general
		
	/*	atBatOutcome = Math.random();
		if (atBatOutcome < .1) {
		//single
			this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg");	
			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb");										
			this.recordPlay("fg", this.o, [this.team[this.o].player[o].name]);		
		} else if (atBatOutcome < .15) {
		//double		
		} else if (atBatOutcome < .2) {
		//triple		
		} else if (atBatOutcome < .25) {
		//HR		
		} else if (atBatOutcome < .30) {
		//walk		
		} else if (atBatOutcome < .35) {
		//SO		
		} else if (atBatOutcome < .40) {
		//fieldingout		
		} else {	
		//error
		}*/

	
		return outs; // not needed?
	
	} else {
	////////////// put while loop in here
		
	var stealingAdjustment;

	//stealingAdjustment = .1; //old
	stealingAdjustment = .14; //new
	//}
		
		/////////////////// LONG VERSION (could use for live games)
    while ((ballsandstrikes[0] < 4) && (ballsandstrikes[1] < 3))  { 		
	  
	  var stealingbase = [0.00,0.00,0.00]; // 0,1;
	  var threeBalls;
	  
	  if (ballsandstrikes[0]  == 3) {
		  threeBalls = true;
	  } else {
		  threeBalls = false;		  
	  }
	  
	  

		
		////III)  prior to pitch
 		
		if (onbase[2] < 100) {
		  // does he get picked off or advance could be function pickofforadvance, or lead (may lead to pickoff,steal,or help with stealing
		    //// based agg, speed, acc, catching
			
			//stealing home? very rare
		  probtriestosteal =  stealingAdjustment/50*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.stealing)*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.stealing) ;  // can make this depend on infield defense, hitter,other runners        
/////		  probtriestosteal =  0.03 ;  // can make this depend on infield defense, hitter,other runners        
           stealing = 0.00;
           stealingbase[2] = 0.00;
		  if (probtriestosteal > Math.random()) {
            // And 1
           stealing = 1.00;			
           stealingbase[2] = 1.00;
		   
          }							  

			//// size of lead?
		   baseaggressiveness = 0.1*(stealingbase[2]-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.stealing   + this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.rebounding)/3;  //stealyes/no-stealing+laziness/awareness
           probthrow = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace + this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.fouling+baseaggressiveness*2)/4;		   
           throwattempt = 0;
		   if (probthrow > Math.random()) {
              throwattempt = 1;		     
			  probpickedoff = probthrow*.01;
			  //probpickedoff = 0;
                pickedoff = 0;						  
			  if (probpickedoff > Math.random()) {			  
			    //// end of innings, outs up
                pickedoff = 1;			
				stealing = 0;
				
		        outs += 1;
				o = this.playersOnCourt[this.o][battingorder[onbase[2]]];
				this.recordPlay("picked", this.o, [this.team[this.o].player[o].name],outs);		 			
				
				onbase[2] = 100;
				//// batter only ends if 3 outs, but get to back next inning
				if (outs > 2) {
					if (batter[this.o] < 1) {
						batter[this.o] = 8;
					} else {
						batter[this.o] -=1;
					}
					
					return outs;
				}
		     } else {
			   proboverthrow = .0025+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[3]]].compositeRating.dribbling+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/400;  // 
			   overthrow = 0;
			   if (proboverthrow > Math.random()) {			  
					overthrow = 1;			   
				 // run scores
					this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "stl");							   			  
					this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");							   			  
			//		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");
					errorouts -= 1;
					this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");
					p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
					this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "errors");
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fieldAttempts");
					
				//					console.log("Run");

					onbase[2] = 100;		
					stealing = 0;
					stealingbase[2] = 0;
			//							console.log("f: "+fielders[0]);
					this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
					
					/*ptsDifference = this.team[this.o].stat.pts - this.team[this.d].stat.pts;
					if (ptsDifference == 1) {
					  winningPitcher[this.o] = fieldingPosition[this.d][0];
					  losingPitcher[this.d] = fielders[0];
					} else if (ptsDifference == 0) {
					  losingPitcher[this.d] = 100;					  					  
					  winningPitcher[this.o] = 100;					  
					}*/

					// based on score new pitcher may get win;
//						        while (this.team[0].stat.pts === this.team[1].stat.pts) {

//						 	var winningPitcher = [100,100];
	//var losingPitcher = [100,100];
	//var saveOpp = [100,100];
				 
				 
				 /////
				 // run scores, add to runner a run
				 // add to team a run
				 // add to pitcher an error
				 // may also add an error to catcher
			   } else if (stealingbase[2] == 1) {
					//this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "tpa");							   			  		  			   
			   }
			 }
           } else if (stealingbase[2] == 1) {
			//	this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "tpa");							   			  		  
		   }
		  
		}
		

		if (onbase[1] < 100) {
		  if (overthrow == 1) {
				 onbase[2] = onbase[1];				 
				 onbase[1] = 100;				 		    
				 
		  } else if (onbase[2] == 100) {
		  // does he get picked off or advance could be function pickofforadvance, or lead (may lead to pickoff,steal,or help with stealing
		    //// based agg, speed, acc, catching
			
			//stealing home? very rare
//		  probtriestosteal =  0.12*this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing ;  // can make this depend on infield defense, hitter,other runners        
		  probtriestosteal =  stealingAdjustment*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing)*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing) ;  // can make this depend on infield defense, hitter,other runners        

		  stealing = 0;
           stealingbase[1] = 0.00;
		  if (probtriestosteal > Math.random()) {
            // And 1
           stealing = 1;			
           stealingbase[1] = 1.00;
		   
          }							  
		  
			//// size of lead?
//		   baseaggressiveness = 0.10*(stealing-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing   + this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.rebounding)/3;  //stealyes/no-stealing+laziness/awareness
		   baseaggressiveness = 0.10*(stealingbase[1]-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing   + this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.rebounding)/3;  //stealyes/no-stealing+laziness/awareness
           probthrow = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace + this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.fouling+baseaggressiveness*2)/4	;	   
           throwattempt = 0;
		   if (probthrow > Math.random()) {
              throwattempt = 1;		     
			  probpickedoff = probthrow*.01;
			  //probpickedoff = 0;
                pickedoff = 0;						  
			  if (probpickedoff > Math.random()) {			  
			    //// end of innings, outs up
                pickedoff = 1;
				stealing = 0;
				stealingbase[1] = 0;
		        outs += 1;
				o = this.playersOnCourt[this.d][battingorder[onbase[1]]];
				this.recordPlay("picked", this.o, [this.team[this.o].player[o].name],outs);		 			
				onbase[1] = 100;
				//// batter only ends if 3 outs, but get to back next inning
				if (outs > 2) {
					if (batter[this.o] < 1) {
						batter[this.o] = 8;
					} else {
						batter[this.o] -=1;
					}
									
					return outs;
				}
		     } else {
//				proboverthrow = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.dribbling+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/2;  // 
				proboverthrow = .0025+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.dribbling+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/400;  // 
				overthrow = 0;
				if (proboverthrow > Math.random()) {			  
					overthrow = 1;			   
					onbase[1] = 100;	
					stealing = 0;
					stealingbase[1] = 0;
					errorouts -= 1;
//					this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "errors");
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fieldAttempts");

				 /////
				 // add to pitcher an error
				 // may also add an error to catcher
				} else if (stealingbase[1] == 1) {
					//this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[1]]], "tpa");							   			  		  			   
				}
			 }
           } else if (stealingbase[1] == 1) {
					//this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[1]]], "tpa");							   			  		  			   
		   }
		  }
		}

		if (onbase[0] < 100) {
		  if (overthrow == 1) {
				 onbase[1] = onbase[0];				 
				 onbase[0] = 100;				 		    
		  } else if (onbase[1] == 100) {
		  // does he get picked off or advance could be function pickofforadvance, or lead (may lead to pickoff,steal,or help with stealing
		    //// based agg, speed, acc, catching
			
			//stealing home? very rare
//		  probtriestosteal =  0.20*this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing;   // can make this depend on infield defense, hitter,other runners        
		  probtriestosteal =  stealingAdjustment*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing)*(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing) ;  // can make this depend on infield defense, hitter,other runners        

		  stealing = 0.00;
           stealingbase[0] = 0.00;		   
		  if (probtriestosteal > Math.random()) {
            // And 1
           stealing = 1.00;			
           stealingbase[0] = 1.00;		   
		   
          }							  
		  
			//// size of lead?
		   baseaggressiveness = 0.10*(stealingbase[0]-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing   + this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.rebounding)/3;  //stealyes/no-stealing+laziness/awareness
           probthrow = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace + this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.fouling+baseaggressiveness*2)/4	;	   
           throwattempt = 0;
		   if (probthrow > Math.random()) {
              throwattempt = 1;		     
			  probpickedoff = probthrow*.01;
			  //probpickedoff = 0;
                pickedoff = 0;						  
			  if (probpickedoff > Math.random()) {			  
			    //// end of innings, outs up
                pickedoff = 1;			
				stealing = 0;
			    stealingbase[0] = 0;
		        outs += 1;
				o = this.playersOnCourt[this.o][battingorder[onbase[0]]];
				this.recordPlay("picked", this.o, [this.team[this.o].player[o].name],outs);		 			
				onbase[0] = 100;
				//// batter only ends if 3 outs, but get to back next inning
				if (outs > 2) {
					if (batter[this.o] < 1) {
						batter[this.o] = 8;
					} else {
						batter[this.o] -=1;
					}								
					return outs;
				}
		     } else {
//			   proboverthrow = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[1]]].compositeRating.dribbling+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/2;  // 
			   proboverthrow = .0025+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[1]]].compositeRating.dribbling+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/400;  // 
			   overthrow = 0;
			   if (proboverthrow > Math.random()) {			  
					overthrow = 1;			   
					stealingbase[0] = 0;
					errorouts -= 1;
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "errors");
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fieldAttempts");
				 
					onbase[1] = onbase[0];					 
					onbase[0] = 100;		
					if (onbase[2] < 100) {
				 
				 
						this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "stl");							   
						this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");			
						//this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");				  
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");		
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "errors");
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fieldAttempts");
						p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
						this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
						onbase[2] = 100;		
										//	console.log("f1: "+fielders[0]);
						this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
				    						//			console.log(" Run");
						// based on score new pitcher may get win;
//						        while (this.team[0].stat.pts === this.team[1].stat.pts) {

//						 	var winningPitcher = [100,100];
	//var losingPitcher = [100,100];
	//var saveOpp = [100,100];

				 
				 
				 
				 /////
				 // run scores, add to runner a run
				 // add to team a run
				   
				 }
				 // add to pitcher an error
				 // may also add an error to catcher
				 
			   } else if (stealingbase[0] == 1) {
              //    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[0]]], "tpa");							   		   			   
			   }
			 }
           } else if (stealingbase[0] == 1) {
              //    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[0]]], "tpa");							   		   
		   }
		  }
		}

		/////////// Pre pitch prep done

        //        4aiI) foul
//		                 i) playable
//                             i) make play (out+1)
//                                   a) runners try to advance(low odds)
//							   ii) drops strike +1 (if not already 2)
 //                      ii) not playable strike +1 (if not already 2)
        //        4aiI) hit (determine 1) ground or fly  and	2) distance)
		                   //// these could be broken up more once we have full team on field
//                        i) infield center
//                              i) air see  outfield right side air							     							
//                              ii) ground see outfield right side ground
//                        ii) infield left side					
//                        iii) infield right side						
//                        iv) outfield center
//                        v) outfield left side					
//                        vi) outfield right side
//                               i) air
//                                     a) caught out+1
//									    i) end of inning
//										ii) not end
//										     a) see swing miss runners
//									 b) not caught
//                                        a) see if runners advance (each tested, start with 3rd, 2nd, 1st then batter) (each runner and base looped, until all stopped)									    
//                                              (can use distance to base, arm, runner speed, fielders catch ability)
//                               ii) ground							   
//                                     a) see air not caught
//                        vii) Homerun
//						       i) all runners score +x runs +x rbis (next batter)	
		

		//// can be based on count
		//// for now just use accuracy
		hittingcontact = this.team[this.o].player[battingorder[batter[this.o]]].compositeRating.turnovers; // hitting
		hittingpower = this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT; // hitting
		pitchingcontact = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*2+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.blocking*3)/5; // (all 5 pitch areas, even)

	//	console.log(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos);
		if ((this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'SP') || (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'RP') || (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'CL')) {

		   hittingcontact /= 3;	
		   hittingcontact -= .2;	
		   hittingpower /= 3;	
		   hittingpower -= .1;	
        }	

        var battingKnowledge;
		
		battingKnowledge = 1;
		if (this.playersOnCourt[this.d][fielders[0]] == priorPitcher) {
		  inningsPitched +=1;
		  if (inningsPitched == 3) {
		    battingKnowledge = pitchingcontact;
			pitchingcontact *= battingKnowledge;
			
			if ((this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'SP') || (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'RP') || (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'CL')) {

			   hittingcontact -= .25;	
			}				
		  } else if (inningsPitched >3) {
		    battingKnowledge = pitchingcontact;
			pitchingcontact *= battingKnowledge;
			pitchingcontact *= battingKnowledge;
			if ((this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'SP') || (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'RP') || (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == 'CL')) {
			   hittingcontact -= .5;	
			}				
		  /*} else if (inningsPitched > 4) {
		    battingKnowledge = pitchingcontact;
			pitchingcontact *= battingKnowledge;
			pitchingcontact *= battingKnowledge;
			pitchingcontact *= battingKnowledge;*/
		  }
		} else {
		  inningsPitched = 1;		
		  priorPitcher = this.playersOnCourt[this.d][fielders[0]];
		}
	    if (inningsPitched < 2) {
			pitchingcontact = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*2+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.blocking*3)/10+.5; // (all 5 pitch areas, even)
	    }
		
		var probMPSLD,probMPBLD,probMPSFB,probMPBFB;
		var probStrikeFB,probBallFB,probStrikeLD,probBallLD;
		
		var groundBall,groundOut;
		// prob without fielding adjustment added later
		// prob make play, strike, line drive
		
//http://www.fangraphs.com/library/pitching/batted-ball/		

//    League Average
// LD 21%
// GB 44%
// FB 35%
// IFFB 11%

//     AVE   ISO   wOBA
// GB .239   0.020  .220
// LD .685   .190   .684
// FB .207   .378   .335


// 20 players above .300, #60 .276
// 5> 40 HRs, #60 is 19
// 12 triples, 6 players >8, #30 is 5
		
/*		// prob make play, strike, line drive
		probMPSLD = .320-hittingpower/100*10;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, ball, line drive
		probMPBLD = .370-hittingpower/100*10;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, strike, fly ball
		probMPSFB = .85-hittingpower/100*10;   // 0.9 to .95 .8 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, ball, fly ball
		probMPBFB =  .86-hittingpower/100*10;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// ground ball?	
			
		//probabilityflyball strike		(ave .35)
		probStrikeFB = .21+hittingpower/100*24;		// .28 to .38
		//probabilityflyball ball
		probBallFB = .25+hittingpower/100*24;  // .32 to .42
		//probabilitylinedrive strike  (ave. 21, but compared to ground ball .3)		
		probStrikeLD = .26+hittingcontact/100*10;		// .26 to .36
		//probabilitylinedrive ball
		probBallLD = .22+hittingcontact/100*10;  // .2 to .3*/

		
		
		// prob make play, strike, line drive
//		probMPSLD = .260-hittingcontact/100*5;   // .7 to .9    .9,.01,.09 to .8,.06,.14
/*		probMPSLD = .258;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, ball, line drive
//		probMPBLD = .310-hittingcontact/100*5;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		probMPBLD = .308;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, strike, fly ball
		probMPSFB = .79-hittingpower/100*8;   // 0.9 to .95 .8 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, ball, fly ball
		probMPBFB =  .80-hittingpower/100*8;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// ground ball?	
			
		//probabilityflyball strike		(ave .35)
		probStrikeFB = .32+hittingpower/100*10;		// .28 to .38
		//probabilityflyball ball
		probBallFB = .37+hittingpower/100*10;  // .32 to .42
		//probabilitylinedrive strike  (ave. 21, but compared to ground ball .3)		
		probStrikeLD = .33-hittingpower/100*5+hittingcontact/100*5;		// .26 to .36
		//probabilitylinedrive ball
		probBallLD = .29-hittingpower/100*5+hittingcontact/100*5;  // .2 to .3*/
		

		
		// prob make play, strike, line drive
//		probMPSLD = .260-hittingcontact/100*5;   // .7 to .9    .9,.01,.09 to .8,.06,.14
//		probMPSLD = .260;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		probMPSLD = .300;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, ball, line drive
//		probMPBLD = .310-hittingcontact/100*5;   // .7 to .9    .9,.01,.09 to .8,.06,.14
//		probMPBLD = .308;   // .7 to .9    .9,.01,.09 to .8,.06,.14
//		probMPBLD = .308;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		probMPBLD = .348;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, strike, fly ball
//		probMPSFB = .86-hittingpower*.18+pitchingcontact*.2;   // 0.9 to .95 .8 to .9    .9,.01,.09 to .8,.06,.14
//		probMPSFB = .74-hittingpower*.14+pitchingcontact*.12;   // 0.9 to .95 .8 to .9    .9,.01,.09 to .8,.06,.14
//		probMPSFB = .82-hittingpower*.17;   // 0.9 to .95 .8 to .9    .9,.01,.09 to .8,.06,.14
		probMPSFB = .84-hittingpower*.17;   // 0.9 to .95 .8 to .9    .9,.01,.09 to .8,.06,.14
//		probMPSFB = .82-hittingpower*.21;   // 0.9 to .95 .8 to .9    .9,.01,.09 to .8,.06,.14
		// prob make play, ball, fly bal
//		probMPBFB =  .88-hittingpower*.18+pitchingcontact*.2;   // .7 to .9    .9,.01,.09 to .8,.06,.14
//		probMPBFB =  .75-hittingpower*.11+pitchingcontact*.06;   // .7 to .9    .9,.01,.09 to .8,.06,.14
//		probMPBFB =  .75-hittingpower*.11+pitchingcontact*.06;   // .7 to .9    .9,.01,.09 to .8,.06,.14
//		probMPBFB =  .75-hittingpower*.05;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		probMPBFB =  .77-hittingpower*.05;   // .7 to .9    .9,.01,.09 to .8,.06,.14
//		probMPBFB =  .75-hittingpower*.06;   // .7 to .9    .9,.01,.09 to .8,.06,.14
		// ground ball?	
			
		//probabilityflyball strike		(ave .35)
//		probStrikeFB = .29+hittingpower/100*8;		// .28 to .38
//		probStrikeFB = .35;		// .28 to .38
//		probStrikeFB = 0.35;		// .28 to .38
//		probStrikeFB = 0.35;		// .28 to .38
//		probStrikeFB = 0.30+(hittingpower-.20)*.20;		// .28 to .38
//		probStrikeFB = 0.40;		// .28 to .38
//		probStrikeFB = 0.32+(hittingpower-.2)*.16;		// .28 to .38
		probStrikeFB = 0.38+(hittingpower-.2)*.17-pitchingcontact*.14;		// .28 to .38
//		probStrikeFB = 0.40+(hittingpower-.2)*.19-pitchingcontact*.14;		// .28 to .38
		//probabilityflyball ball
//		probBallFB = .25+(hittingpower-.2)*.15;  // .32 to .42
//		probBallFB = 0.35;  // .32 to .42
//		probBallFB = 0.33+(hittingpower-.2)*.10-pitchingcontact*.10;  // .32 to .42
		probBallFB = 0.28+(hittingpower-.2)*.12-pitchingcontact*.12;  // .32 to .42
//		probBallFB = 0.30+(hittingpower-.2)*.12-pitchingcontact*.12;  // .32 to .42
//		probBallFB = 0.33+(hittingpower-.2)*.05;  // .32 to .42
//		probBallFB = .35;  // .32 to .42
//		probBallFB = .35+.10;  // .32 to .42
//		probBallFB = .35+.10+.05 +.05;  // .32 to .42
//		probBallFB = .35+.10+.05 +.05+.05 ;  // .32 to .42
//		probBallFB = .35+hittingpower/100*25 ;  // .32 to .42
//		probBallFB = .20+(hittingpower-.20)*.60 ;  // .32 to .42
		//console.log(hittingpower);
		//console.log(probBallFB);
		
		//probabilitylinedrive strike  (ave. 21, but compared to ground ball .3)		
//		probStrikeLD = .23-hittingpower/100*10;		// .26 to .36
		//probStrikeLD = .33+hittingcontact/100*5-pitchingcontact/100*12-hittingpower/100*10;		// .26 to .36
//		probStrikeLD = .33+hittingcontact/100*5-pitchingcontact/100*12-hittingpower/100*10;		// .26 to .36
//		probStrikeLD = .36+hittingcontact/100*5-pitchingcontact/100*12-hittingpower/100*10;		// .26 to .36
//		probStrikeLD = .39+hittingcontact/100*2.5-pitchingcontact/100*6-hittingpower/100*10;		// .26 to .36
//		probStrikeLD = .42+hittingcontact/100*2.5-pitchingcontact/100*9-hittingpower/100*10;		// .26 to .36
//		probStrikeLD = .42+hittingcontact/100*2.5-pitchingcontact/100*9-hittingpower/100*10;		// .26 to .36
//		probStrikeLD = .45+hittingcontact/100*2.5-pitchingcontact/100*9-hittingpower/100*10;		// .26 to .36
//		probStrikeLD = .35+hittingcontact/100*8-pitchingcontact/100*9-hittingpower/100*15;		// .26 to .36
//		probStrikeLD = .05+hittingcontact/100*38-pitchingcontact/100*9-hittingpower/100*15;		// .26 to .36
//		probStrikeLD = .05+hittingcontact/100*38-pitchingcontact/100*9;		// .26 to .36
//		probStrikeLD = .20+(hittingcontact-20)*1.00-pitchingcontact*.50;		// .26 to .36
//		probStrikeLD = .33;		// .26 to .36
//		probStrikeLD = .0-hittingpower*10+hittingcontact*30-pitchingcontact*.1;		// .26 to .36
//		probStrikeLD = 0.28;		// .26 to .36
//		probStrikeLD = 0.18+hittingcontact*.10-hittingpower*.04-pitchingcontact*.05;		// .26 to .36
		probStrikeLD = 0.24+hittingcontact*.20-hittingpower*.20-Math.pow(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace,inningsPitched+1)*.04-pitchingcontact*.04;		// .26 to .36
//		probStrikeLD = 0.22+hittingcontact*.20-hittingpower*.20-Math.pow(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace,inningsPitched+1)*.04-pitchingcontact*.04;		// .26 to .36
//		probStrikeLD = 0.24+hittingcontact*.20-hittingpower*.24-Math.pow(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace,inningsPitched+1)*.04-pitchingcontact*.04;		// .26 to .36
		//probabilitylinedrive ball
//		probBallLD = .22-hittingpower/100*10;  // .2 to .3
//		probBallLD = .33+hittingcontact/100*5-pitchingcontact/100*12-hittingpower/100*10;  // .2 to .3
//		probBallLD = .33-.10+hittingcontact/100*5-pitchingcontact/100*12-hittingpower/100*10;  // .2 to .3
//		probBallLD = .33-.10+hittingcontact/100*4-pitchingcontact/100*12-hittingpower/100*10;  // .2 to .3
//		probBallLD = .43-.10+hittingcontact/100*10-pitchingcontact/100*12-hittingpower/100*30;  // .2 to .3
//		probBallLD = .03+hittingcontact/100*40-pitchingcontact/100*12-hittingpower/100*30;  // .2 to .3
//		probBallLD = .03+hittingcontact/100*40-pitchingcontact/100*12;  // .2 to .3
//		probBallLD = .15+(hittingcontact-.20)*1.00-pitchingcontact*.50;  // .2 to .3
//		probBallLD = .33;  // .2 to .3
//		probBallLD = .0-hittingpower*.10+hittingcontact*.30-pitchingcontact*.1;  // .2 to .3
//		probBallLD = 0.18;  // .2 to .3
//		probBallLD = 0.15+hittingcontact*.08-hittingpower*.07-pitchingcontact*.10;  // .2 to .3
		probBallLD = 0.19+hittingcontact*.18-hittingpower*.17-Math.pow(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism,inningsPitched+1)*.04-pitchingcontact*.04;  // .2 to .3
//		probBallLD = 0.17+hittingcontact*.18-hittingpower*.17-Math.pow(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism,inningsPitched+1)*.04-pitchingcontact*.04;  // .2 to .3
//		probBallLD = 0.19+hittingcontact*.18-hittingpower*.21-Math.pow(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism,inningsPitched+1)*.04-pitchingcontact*.04;  // .2 to .3
		//console.log(hittingcontact);
	//	console.log(pitchingcontact);
	//	console.log(probBallLD);			
		
	/*	probStrikeFB = 0.00;		
		probBallFB = 0.00; // .2 to .4
		probStrikeLD = 1.01;		
		//probabilitylinedrive ball
		probBallLD = 1.01;  // .4 to .6*/
				
		////////// control LD and FB		
		// FairBallNotCaught : odds of making it past first		
		////////// control ground ball
		// GroundBall : 
		// GroundBallStats : odds of getting past first (should be very low)
		// throwOutProb :  odds of getting on base (depend on where ball hit) 
		
	//	probabilitystrike = 0.50+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/6-hittingpower/20-hittingcontact/100;  // accuracy .25 to .75, .4 to .6
	//	   probabilityswingstrike = .83+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling)/8*.30;  // hitting *3 + (sit,cl,team)*1  .25 to .75
		
		
		// control likelihood of getting HRs?

		// HR too high, BA for those player's too low
		// 
		var threeBallsBoost;
		
		if (threeBalls) {
			threeBallsBoost = .1;
		} else {
			threeBallsBoost = .00;
		}
			

		
		
		//http://www.beyondtheboxscore.com/2011/11/10/2551718/investigating-foul-balls-as-a-skill-or-signal-of-skill
		// foul balls linked to power
		/*
		
// Get FIP right with HR, SO, BB
// Then adjust rest to get ERA right		
		
http://www.fangraphs.com/library/offense/plate-discipline/		
Stat	Average
O-Swing	30%
Z-Swing	65%
Swing	46%
O-Contact	66%
Z-Contact	87%
Contact	80%
Zone	45%
F-Strike	59%
SwStr	9.5%

O-Swing% = Swings at pitches outside the zone / pitches outside the zone
Z-Swing%  = Swings at pitches inside the zone / pitches inside the zone
Swing% = Swings / Pitches
O-Contact% = Number of pitches on which contact was made on pitches outside the zone / Swings on pitches outside the zone
Z-Contact%  = Number of pitches on which contact was made on pitches inside the zone / Swings on pitches inside the zone
Contact% = Number of pitches on which contact was made / Swings
Zone% = Pitches in the strike zone / Total pitches
F-Strike% = First pitch strikes / PA
SwStr% = Swings and misses / Total pitches
*/
		
		//// Strike Contact
		//SP
	/*	probabilitycontactstrike = 1.00+hittingcontact*.15-pitchingcontact*.38;	// .6 to .8 ////.3 to .7 	//// was reversed, .1 to .9				
		// RP/CL
		probabilitycontactstrike = 1.00+hittingcontact*.15-pitchingcontact*.50;	// .6 to .8 ////.3 to .7 	//// was reversed, .1 to .9				
		// Else
		probabilitycontactstrike = 1.00+hittingcontact*.15-pitchingcontact*.50;	// .6 to .8 ////.3 to .7 	//// was reversed, .1 to .9
		
		// Strike Fair
		probabilityfair = (1.4+hittingcontact*.3-pitchingcontact*.3)/2;  //// 0.6 to .9


		// Ball Contact
		probabilityswingball = .1+(0.10+(0.80-(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling)/4)*0.1)*.4;  // .1 to .9  // change to .1 to .18

		probabilitycontactball = 1.00+hittingcontact*.25-pitchingcontact*1.00;	// .6 to .8 ////.3 to .7 	//// was reversed, .1 to .9

        probabilityfair = (.6+hittingcontact*.4-pitchingcontact*.4)/2;  //// .1 to .5*/
		
		//// range .25 to .75		
//		probabilitystrike = 0.25+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/2;  // accuracy .25 to .75
//		probabilitystrike = 0.48+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/6-hittingpower/20-hittingcontact/100;  // accuracy .25 to .75, .4 to .6
//		probabilitystrike = 0.48+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/6-hittingpower/20-hittingcontact/100;  // accuracy .25 to .75, .4 to .6

//		probabilitystrike = 0.50+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/6-hittingpower/20-hittingcontact/100;  // accuracy .25 to .75, .4 to .6

//		probabilitystrike = 0.50+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/6-hittingpower/20-hittingcontact/100;  // accuracy .25 to .75, .4 to .6
		//probabilitystrike = 0.45;  // accuracy .25 to .75, .4 to .6
//		probabilitystrike = 0.50+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/10-hittingpower/10-hittingcontact/50;  // accuracy .25 to .75, .4 to .6
//		probabilitystrike = -110.50+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)/10-hittingpower/10-hittingcontact/50;  // accuracy .25 to .75, .4 to .6
//		probabilitystrike = .42+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)*.27-hittingpower*hittingpower*hittingpower*hittingcontact*.30;  // accuracy .25 to .75, .4 to .6
		probabilitystrike = .43+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.pace)*.27-hittingpower*hittingpower*hittingpower*hittingcontact*.29;  // accuracy .25 to .75, .4 to .6
		
		//		pitchingcontact = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*2+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.blocking*3)/5; // (all 5 pitch areas, even)
//		hittingpower = this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT; // hitting
		
		
		// ***** Caught Stealing, lowering runs?
		// debugging
//		probabilitystrike == 1.01 //only play 8 2/3 ?
	//	probabilitystrike == -1.01 //only play 8 2/3 ?
		
		
		
		if (probabilitystrike > Math.random()) {
//		   probabilityswingstrike = .575+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling)/7*.10 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.00 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*.10;  // hitting *3 + (sit,cl,team)*1  .25 to .75
//		   probabilityswingstrike = .475+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling)/7*.10 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.00 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*.10;  // hitting *3 + (sit,cl,team)*1  .25 to .75
//		   probabilityswingstrike = .525+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling)/7*.10 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.00 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*.10;  // hitting *3 + (sit,cl,team)*1  .25 to .75
//		   probabilityswingstrike = .550+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling)/7*.10 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.00 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*.10;  // hitting *3 + (sit,cl,team)*1  .25 to .75
		   probabilityswingstrike = .575+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT*3+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling)/7*.10 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.00 - this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.usage*.10;  // hitting *3 + (sit,cl,team)*1  .25 to .75
		   
		   // deubgging
		 //  probabilityswingstrike = 1.01; // ? 
		   
			if (probabilityswingstrike > Math.random()) {
				if  ((this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == "SP") )  {
					probabilitycontactstrike = 0.91+hittingcontact*.04-pitchingcontact*.045-this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.10;	// .6 to .8 ////.3 to .7 	//// was reversed, .1 to .9				
				} else if  ( (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == "RP") || (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].pos == "CL"))  {
					probabilitycontactstrike = 0.91+hittingcontact*.04-pitchingcontact*.045-this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.10;	// .6 to .8 ////.3 to .7 	//// was reversed, .1 to .9				
				} else {
					probabilitycontactstrike = 0.91+hittingcontact*.04-pitchingcontact*.045-this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.10;	// .6 to .8 ////.3 to .7 	//// was reversed, .1 to .9				
				}
				
		   // deubgging
	//	   probabilitycontactstrike = 1.01; contact seems to work				
//		   probabilitycontactstrike = -1.01; 	both seem to work			
				if (probabilitycontactstrike > Math.random()) {
					probabilityfair = 0.83+hittingcontact*.1-pitchingcontact*.2;  //// 0.6 to .9
					
		   // deubgging
		   //probabilityfair = 1.01; 	 // fair seems to work
		//   probabilityfair = -1.01; 	 // fair seems to work
					if (probabilityfair > Math.random()) {
					///////////////// function used below as well							
				   //// ball in play
				          // can be included in getting to 1b, 2b, 3b, but for now to do it this way (later when each fielder has a variable more detail can be added)
						  // based on hitting, line drive, rest based on
						  // makes it too easy (smaller variations)
					probabilityflyball = probStrikeFB;
					probabilitylinedrive = probStrikeLD;						   
						   
					
					outs = this.fairBall(probabilityflyball,probabilitylinedrive,probMPSFB,probMPSLD,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,error,errorouts,runwillscore,scorer,stealingbase);
					return outs;							

					break;
					} else {
					  //// foul ball                  //shootingFT//athleticism
					  probabilityplayable = 0.05;
					  ////keeping this simple for now
					  if (probabilityplayable > Math.random()) {
						probabilitycaught = .75+this.probabilityArray(fielders, 0,1,0,1,0,2,2,0,1,"defensePerimeter")*.25;
						  if (probabilitycaught > Math.random()) {
							outs += 1;
							o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
							this.recordPlay("fo", this.o, [this.team[this.o].player[o].name],outs);	
							
							return outs;					     
						  }

					  } else {
						ballsandstrikes[1] += 1;	
						if (ballsandstrikes[1] > 2) {
						  ballsandstrikes[1] = 2;
						}					
					  }
					}		   
				  } else {
				  // if a swing but no contact and no out then a potential steal	
				  
					ballsandstrikes[1] += 1;			
					if (ballsandstrikes[1] > 2) {
						outs += 1;
						
						this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "tov");							   					
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgAtRim");
						o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
						this.recordPlay("tov", this.o, [this.team[this.o].player[o].name],outs);		 			
						
						if (outs > 2) {					
							return outs;
						}
					}
						if ((stealingbase[2]>0) && (onbase[2]<100)) {
							outs = this.stealingOuts(0.6,2,2,battingorder,fielders,outs,onbase,errorouts);							
							if (outs > 2) {
								batter = this.batterChange(batter);									
								return outs;
							}
						}
						if (outs>2) {
							return outs;					
						}					
						if ((stealingbase[1]>0) && (onbase[1]<100)) {
							outs = this.stealingOuts(0.6,1,4,battingorder,fielders,outs,onbase,errorouts);							
							if (outs > 2) {
								batter = this.batterChange(batter);									
								return outs;
							}						
						}
						if (outs>2) {
							return outs;					
						}					
						if ((stealingbase[0]>0) && (onbase[0]<100)) {
							outs = this.stealingOuts(0.6,0,2,battingorder,fielders,outs,onbase,errorouts);	
							if (outs > 2) {
								batter = this.batterChange(batter);									
								return outs;
							}						
						}
						if (outs>2) {
							return outs;					
						}								
				  }	
	////			  
			   } else {
					ballsandstrikes[1] += 1;			
					if (ballsandstrikes[1] > 2) {
						outs += 1;

						this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "tov");			
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgAtRim");		
						o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
						this.recordPlay("tov", this.o, [this.team[this.o].player[o].name],outs);		 			
						
							if (outs > 2) {					
								return outs;
							}
					}
				  // if a called strike then a potential steal		
				  // if no walk then potential steal	
				  
					outs =  this.stealingOutsAllBases(batter,stealingbase,battingorder,fielders,outs,onbase,errorouts);
					if (outs>2) {
						return outs;					
					}					

			   }
				// then ball
			} else {
				//threeBalls
				if (threeBalls) {
					probabilityswingball = .25-(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*.045+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling*.045)+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.045;  // hitting *3 + (sit,cl,team)*1  .25 to .75		   				
				} else {
					probabilityswingball = .26-(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.turnovers*.045+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.fouling*.045)+this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.045;  // hitting *3 + (sit,cl,team)*1  .25 to .75		   				
				}
			   if (probabilityswingball > Math.random()) {
				  // hit or miss
	////		   
					probabilitycontactball = 0.45+hittingcontact*.04-pitchingcontact*.05-this.team[this.d].player[this.playersOnCourt[this.d][fielders[0]]].compositeRating.athleticism*.09;	// .6 to .8 ////.3 to .7 	//// was reversed, .1 to .9				
				 if (probabilitycontactball > Math.random()) {
					probabilityfair = 0.83+hittingcontact*.05-pitchingcontact*.10;  //// .1 to .5
					if (probabilityfair > Math.random()) {
							//////////////////////////// create function fair? use above as well?
							
					   //// ball in play
							  // can be included in getting to 1b, 2b, 3b, but for now to do it this way (later when each fielder has a variable more detail can be added)
							  // based on hitting, line drive, rest based on
							  // makes it too easy (smaller variations)
							 probabilityflyball = probBallFB;  // .2 to .4
							 probabilitylinedrive = probBallLD;  // .4 to .6
							   
					
							outs = this.fairBall(probabilityflyball,probabilitylinedrive,probMPBFB,probMPBLD,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,error,errorouts,runwillscore,scorer,stealingbase);
							
							return outs;							
					  //// end ball in play
					} else {
					/////////// create function foul ball
					  //// foul ball                  //shootingFT//athleticism
					  probabilityplayable = 0.05;
					  ////keeping this simple for now
					  if (probabilityplayable > Math.random()) {
						probabilitycaught = .75+this.probabilityArray(fielders, 0,1,0,1,0,2,2,0,1,"defensePerimeter")*.25;
						  if (probabilitycaught > Math.random()) {
							outs += 1;
							o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
							this.recordPlay("fo", this.o, [this.team[this.o].player[o].name],outs);		 									
							return outs;					     
						  }
					  } else {
						ballsandstrikes[1] += 1;	
						if (ballsandstrikes[1] > 2) {
						  ballsandstrikes[1] = 2;
						}									  
					  }
					}		   
				  } else {
				  //// swinging strike (even though pitch was a ball)
				  //////////////////////// could steal here			 			  
					ballsandstrikes[1] += 1;			
					if (ballsandstrikes[1] > 2) {
						outs += 1;

							o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;						
							this.recordPlay("tov", this.o, [this.team[this.o].player[o].name],outs);		 			
							this.recordStat(this.o, o, "tov");							
							this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgAtRim");							
						return outs;
					}             
				  // if inning not over then potential steal			  
			
						outs =  this.stealingOutsAllBases(batter,stealingbase,battingorder,fielders,outs,onbase,errorouts);					
						if (outs>2) {
							return outs;					
						}
					
				  }	
	////			  
				  
				} else {
				 // ball
					ballsandstrikes[0] += 1;	
					if (ballsandstrikes[0] > 3) {	
					 
						ballsandstrikes[0] = 0;
						let walkedBatter = this.batterWalked(outs, onbase,errorouts, losingPitcher,winningPitcher,fielders,fieldingPosition);
						onbase = walkedBatter.onbase;
						outs = walkedBatter.outs;					 
						return outs;
					 
					} else {
				  // if no walk then potential steal			              
						outs =  this.stealingOutsAllBases(batter,stealingbase,battingorder,fielders,outs,onbase,errorouts);										
						if (outs>2) {
							return outs;					
						}
					}			  
				}	
			}	 	
		}		
		}
		return outs;
    };


				   //// ball in play
							  // can be included in getting to 1b, 2b, 3b, but for now to do it this way (later when each fielder has a variable more detail can be added)
							  // based on hitting, line drive, rest based on
							  // makes it too easy (smaller variations)
				/*				 probabilityflyball = probBallFB;  // .2 to .4
								 probabilitylinedrive = probBallLD;  // .4 to .6
							   
							  if (probabilityflyball > Math.random()) {
							   
								this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fb");
							
								let resultsFlyBall = this.flyBall("FLYBALL","BALL",probMPBFB,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts);
								onbase = resultsFlyBall.onbase;
								outs = resultsFlyBall.outs;
								location = resultsFlyBall.location;
								probabilityflycaught = resultsFlyBall.probabilityflycaught;							 
								 
							  } else if (probabilitylinedrive > Math.random()){
							  
							
								let resultsFlyBall = this.flyBall("LINEDRIVE","STRIKE",probMPBLD,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts);
								onbase = resultsFlyBall.onbase;
								outs = resultsFlyBall.outs;
								location = resultsFlyBall.location;
								probabilityflycaught = resultsFlyBall.probabilityflycaught;							 
								 
							   ///// Line Drive Ends
							  } else {
							  // Ground Ball
								/////// Ground Ball starts	
									this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "gb");
								
								// stolen base
								//this.groundBall(onbase,stealingbase,batter,scorer,battingorder,fielders,outs,runwillscore,error,errorouts);
								groundBall = this.groundBall(onbase,stealingbase,batter,scorer,battingorder,fielders,outs,runwillscore,error,errorouts);
								
								if (groundBall.outs>outs) {
									groundOut = 1;
								} else {
									groundOut = 0;							
								}							
								onbase = groundBall.onbase;
								scorer = groundBall.scorer;
								runwillscore = groundBall.runwillscore;
								outs = groundBall.outs;							
								error = groundBall.error;							
								errorouts = groundBall.errorouts;							
								if (outs > 2) {
									return outs;
								} else {								
								 //// ground ball 
									onbase = this.groundBallStats(runwillscore,onbase,batter,scorer,battingorder,fielders,error,errorouts,outs,groundOut);
								}							
							}						 
							return outs;	*/	
	
	GameSim.prototype.fairBall = function (probabilityflyball,probabilitylinedrive,probMPSFB,probMPSLD,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,error,errorouts,runwillscore,scorer,stealingbase) {							
	
	let location;
	let probabilityflycaught;
	
	// debugging
//	probabilityflyball = 1.01; // popup no pitching stats 
	//probabilityflyball = -1.01; //  
//	probabilitylinedrive = 1.01; // line drive no pitching stats
//	probabilitylinedrive = -1.01; // ground ball has pitching stats
	//
	
	   if (probabilityflyball > Math.random()) {
			//this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fb");
		   
		   // added later?
		//	this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fb"); (done alter?)
		   
		   //// start Fly Ball
		 //  outs +=1; // debuggin works, something wrong with these functions, not all variables counted?
			//console.log(outs);		 
			let resultsFlyBall = this.flyBall("FLYBALL","STRIKE",probMPSFB,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts);
			//console.log("this function works");
			//onbase = resultsFlyBall.onbase;
			//console.log(resultsFlyBall)
		//	console.log(resultsFlyBall)
//			outs = resultsFlyBall.outs;
			outs = resultsFlyBall.outs;
			//location = resultsFlyBall.location;
			//probabilityflycaught = resultsFlyBall.probabilityflycaught;
		//	console.log(outs);
			 
		} else if (probabilitylinedrive > Math.random()) {
		//	this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "ld");
		
			let resultsFlyBall = this.flyBall("LINEDRIVE","STRIKE",probMPSLD,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts);			//onbase = resultsFlyBall.onbase;
		//	console.log(resultsFlyBall);
			outs = resultsFlyBall.outs;
			//location = resultsFlyBall.location;
			//probabilityflycaught = resultsFlyBall.probabilityflycaught;
			 
		   ///// Line Drive Ends
		} else {
		  // Ground Ball
			/////// Ground Ball starts	
			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "gb");
			//console.log(outs);
			let groundBall = this.groundBall(onbase,stealingbase,batter,scorer,battingorder,fielders,outs,runwillscore,error,errorouts);
			//console.log(groundBall);
			let groundOut;
			if (groundBall.outs>outs) {
				groundOut = 1;
			} else {
				groundOut = 0;							
			}
			
			onbase = groundBall.onbase;
			scorer = groundBall.scorer;
			runwillscore = groundBall.runwillscore;
			outs = groundBall.outs;							
			error = groundBall.error;							
			errorouts = groundBall.errorouts;							
			
			if (outs > 2) {
				return outs;
			} else {
				
			  //// ground ball stats
				onbase = this.groundBallStats(runwillscore,onbase,batter,scorer,battingorder,fielders,error,errorouts,outs,groundOut);
				 
			}						
		}	
	
		return outs;
		//return {
		//	onbase: onbase,
			//outs: outs,
//		};			 
	};			
	
	GameSim.prototype.batterWalked = function (outs, onbase,errorouts, losingPitcher,winningPitcher,fielders,fieldingPosition) {							
	
	   this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "ast");							   																		 
		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgaAtRim");	
		let o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];								
		this.recordPlay("ast", this.o, [this.team[this.o].player[o].name]);		 			
						
		// ballsandstrikes[0] = 0;
		 if (onbase[0] < 100) {
			if (onbase[1] < 100) {
				if (onbase[2] < 100) {
				   //// score run by onbase[3]		
					if 	(outs>errorouts) {										
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
//console.log(" Run");																			
					} else {
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");
						this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");							
						this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "stl");							   
//console.log("Earned Run");																			
					}			

				   
					this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");		
					let p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
					this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
										//console.log("f6: "+fielders[0]);
					this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
					
					this.walk(onbase,batter,2);													
					//return outs;					   
				} else {
					this.walk(onbase,batter,2);												
				//	return outs;							
				}    					  					  
			} else {
				this.walk(onbase,batter,1);						
				//return outs;					   
			}  
		 } else {
				this.walk(onbase,batter,0);						
		//	return outs;
		 }		
		 
		return {
			onbase: onbase,
			outs: outs,
		};			 
	};				
		
	GameSim.prototype.stealingOutsAllBases = function (batter,stealingbase,battingorder,fielders,outs,onbase,errorouts) {							
		if ((stealingbase[2]>0) && (onbase[2]<100)  && outs <= 2) {
			outs = this.stealingOuts(0.5,2,2,battingorder,fielders,outs,onbase,errorouts);						
			if (outs > 2) {
				batter = this.batterChange(batter);																
				return outs;
			}						
		}
		
		if ((stealingbase[1]>0) && (onbase[1]<100)  && outs <= 2) {
			outs = this.stealingOuts(0.6,1,4,battingorder,fielders,outs,onbase,errorouts);												
			if (outs > 2) {
				batter = this.batterChange(batter);									
				return outs;
			}						
		}
		if ((stealingbase[0]>0) && (onbase[0]<100)  && outs <= 2) {
			outs = this.stealingOuts(0.6,0,2,battingorder,fielders,outs,onbase,errorouts);	
			//outs = this.stealingOuts(0.7,0,2,battingorder,fielders,outs,onbase,errorouts);						// for balls?
			
			if (outs > 2) {	
				batter = this.batterChange(batter);						
				return outs;
			}						
		}			
		return outs;			
		
	};					
		
		// this changes for each: probMPSFB
	GameSim.prototype.flyBall = function (flyLine, ballStrike,probMPSFB,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts) {		
		
	   //// start Fly Ball
		let probabilityflycaught;
		let location;
		
	    if (flyLine == "FLYBALL" ) {
			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fb");
			if (ballStrike == "STRIKE" ){
				location = this.ballLocation(location,fielders,1,1,1,1,1,1,1,1,1,1,1,5,7,7,7,5,2,2,2,2);			
			} else {
				location = this.ballLocation(location,fielders,1,1,1,1,1,1,1,1,1,1,1,10,14,14,14,10,2,2,2,2);  			
			}			
		} else {
			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "ld");
			if (ballStrike == "STRIKE" ){							
				location = this.ballLocation(location,fielders,3,5,5,5,5,5,3,2,1,0,0,5,6,6,6,5,1,1,1,1);					
			} else {			
				location = this.ballLocation(location,fielders,4,10,10,10,10,10,4,2,1,0,0,10,12,12,12,10,1,1,1,1);			
			}
		}

   
	 // range from 3/12 to 9/12 so could always fall in or not (weaker batters should focus more infield, stronger batters more outfield)
	 // bumped 0.20 since line drives are not included
	 
	 // two types

		
		if (location == 100) {
			probabilityflycaught = 0;
		} else {

			probabilityflycaught = this.isFlyCaught(0,.005,probMPSFB,fielders,location,battingorder,batter);
			if (probabilityflycaught == -1) {
				errorouts -= 1;										
			}												
		   
		}
					//				 console.log(outs)			 
		 if (probabilityflycaught == 1) {
			outs +=1;
			let o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
			if (flyLine == "FLYBALL" ) {			
				this.recordPlay("fo", this.o, [this.team[this.o].player[o].name],outs);		 			
			} else {
				this.recordPlay("lo", this.o, [this.team[this.o].player[o].name],outs);					
			}
			
			//// if runner on 3rd, with less than 2 outs, could advance home if ball hit hard enough// future improvement									
			onbase = this.manOnThird(.25,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts);												
		// console.log(outs)			
			//return outs;
		 } else {
			//////Fly Ball not caught (same as line drive not caught)
			
			//how many bases
			//// see below
				  //// can have fielder adjustments, going to wait until have all 9 players
				  //// have drag if on ground for HR
		// console.log(outs)				  
				this.FairBallNotCaught(onbase,batter,battingorder,fielders,probabilityflycaught,errorouts,outs);
		 }	
		// console.log(outs)
		 
		return {
			onbase: onbase,
			outs: outs,
			location: location,
			probabilityflycaught: probabilityflycaught,
		};		 
		
	};				 
		
	GameSim.prototype.manOnThird = function (baseline,onbase,outs,batter,losingPitcher,winningPitcher,fielders,fieldingPosition,battingorder,errorouts) {		
	
		if ((onbase[2] < 100) && (outs < 3)) {
		  // range .25 to .75
		   let manonthirdscores = baseline+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.stealing+this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.shootingFT)/4-(this.team[this.d].player[this.playersOnCourt[this.d][fielders[1]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[3]]].compositeRating.passing)/4;
			  if (manonthirdscores > Math.random()) {
			///	this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");		(this was in twice, already a bug?)					   			  
				this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");	
				
				if 	(outs>errorouts) {										
					this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
//console.log("Run");											
				} else {
					this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
					this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");											
					this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  																			
//console.log("Earned Run");											
				}
				let p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
				this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
//console.log("f3: "+fielders[0]);
				this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
				
				onbase[2] = 100;												
			  }
		}	
		return onbase;
	};					
	
	GameSim.prototype.isFlyCaught = function (hit,baseProbError,probMPSFB,fielders,location, battingorder,batter) {		
	
			let probError = baseProbError+(1-this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior)/100;   // .01 to .06
			let probMakePlay =	probMPSFB+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior)/100;									
			let probNoPlay = probError+(1-probMakePlay);
			let resultOfPlay =  Math.random();
			let probabilityflycaught;
		   
		   // debugging 
		  // resultOfPlay = 0.50;
		  // console.log(probError+" "+probNoPlay+" "+resultOfPlay);
			if (probError > resultOfPlay) {								   									   
				probabilityflycaught = -1;  //  error
				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "errors");		
			//	errorouts -= 1;
				let o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
				this.recordPlay("er", this.o, [this.team[this.o].player[o].name]);		 			
				
				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
				
			} else if (probNoPlay > resultOfPlay) {
				probabilityflycaught = hit;	// hit						
			} else {
				probabilityflycaught = 1; // caught
				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
			
			}	
		//	console.log(probabilityflycaught);
		return probabilityflycaught;
    };		
	
	GameSim.prototype.batterChange = function (batter) {		
		if (batter[this.o] < 1) {
			batter[this.o] = 8;
		} else {
			batter[this.o] -=1;
		}	
		return batter;
    };								
	
	GameSim.prototype.stealingOuts = function (baseline, onbaseIndiv, fielder, battingorder,fielders,outs,onbase,errorouts) {		
		var probstealsuccess = baseline+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[onbaseIndiv]]]].compositeRating.stealing -  this.team[this.d].player[this.playersOnCourt[this.d][fielders[fielder]]].compositeRating.defense)/2 ; // stealing - tagging (later catcher arm, pitcher location)					
		var p = this.playersOnCourt[this.o][battingorder[onbase[onbaseIndiv]]];
		var f = this.playersOnCourt[this.d][fielders[0]];
	//	console.log(p);
	//	console.log(f);
	//	console.log(probstealsuccess);		
		outs = this.stealingbase(outs,onbase,p,f,probstealsuccess,fielder,errorouts);
		return outs;
    };	
	
    /**
     * WinLoss
     * 
     * @memberOf core.gameSim
     * @return  outs
     */
    GameSim.prototype.winLoss = function (losingPitcher,winningPitcher,fielders,fieldingPosition) {
	
		var ptsDifference;
	
					ptsDifference = this.team[this.o].stat.pts - this.team[this.d].stat.pts;
					if (ptsDifference == 1) {
					  winningPitcher[this.o] = this.playersOnCourt[this.o][positionplayers[this.o][0]];
//					  losingPitcher[this.d] = this.playersOnCourt[this.d][fielders[0]];
					  losingPitcher[this.d] = this.playersOnCourt[this.d][positionplayers[this.d][0]];
			//		  console.log("win loss fieldp field: " + winningPitcher[this.o]+" "+losingPitcher[this.d]+" "+ fieldingPosition[this.d][0]+" "+fielders[0]);
					} else if (ptsDifference == 0) {
					  losingPitcher[this.d] = 100;					  					  
					  winningPitcher[this.o] = 100;					  
			//		  console.log("win loss : " + winningPitcher[this.o]+" "+losingPitcher[this.d]);					  
					}
				//	console.log("d: "+this.d);					
				//	console.log("f: "+fielders[0]);
				//	console.log("los: "+losingPitcher[this.d]);
	
		return ;
    };
	
    /**
     * BallLocation
     * 
     * @memberOf core.gameSim
     * @return  outs
     */
    GameSim.prototype.ballLocation = function (location,fielders,location3B,location3BSS,locationSS,locationSS2B,location2B,location2B1B,location1B,location1BP,locationP,locationPC,locationC,locationLF,locationLFCF,locationCF,locationCFRF,locationRF,locationLF3B,locationCFSS,locationCF2B,locationLF1B) {

	
		var ballLocation;
	//	var ballLocation2;		
		var totalLocations;
		//var location;
		var probpos1;
		var probpos2;
		
        ballLocation = Math.random();
		location = 100;
								
		totalLocations = location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF+locationCF+locationCFRF+locationRF+locationLF3B+locationCFSS+locationCF2B+locationLF1B;
        ballLocation = Math.random()*totalLocations;		
		if (ballLocation < location3B) {
		   location = 3;								  
		} else if (ballLocation < (location3B+location3BSS)) {
			location = this.locationTwoPositions(location,ballLocation,3,4,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS)) {
		   location = 4;								  					
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B)) {
			location = this.locationTwoPositions(location,ballLocation,2,3,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B)) {
		   location = 2;								  					
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B)) {
			location = this.locationTwoPositions(location,ballLocation,1,2,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B)) {
		   location = 1;
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP)) {
			location = this.locationTwoPositions(location,ballLocation,0,1,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP)) {
		   location = 0;
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC)) {
			location = this.locationTwoPositions(location,ballLocation,8,0,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC)) {
		   location = 8;
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF)) {
		   location = 5;
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF)) {
			location = this.locationTwoPositions(location,ballLocation,7,5,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF+locationCF)) {
		   location = 7;
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF+locationCF+locationCFRF)) {
			location = this.locationTwoPositions(location,ballLocation,6,7,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF+locationCF+locationCFRF+locationRF)) {
		   location = 6;
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF+locationCF+locationCFRF+locationRF+locationLF3B)) {
			location = this.locationTwoPositions(location,ballLocation,5,3,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF+locationCF+locationCFRF+locationRF+locationLF3B+locationCFSS)) {
			location = this.locationTwoPositions(location,ballLocation,7,4,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF+locationCF+locationCFRF+locationRF+locationLF3B+locationCFSS+locationCF2B)) {
			location = this.locationTwoPositions(location,ballLocation,7,2,fielders);
		} else if (ballLocation < (location3B+location3BSS+locationSS+locationSS2B+location2B+location2B1B+location1B+location1BP+locationP+locationPC+locationC+locationLF+locationLFCF+locationCF+locationCFRF+locationRF+locationLF3B+locationCFSS+locationCF2B+locationLF1B)) {
			location = this.locationTwoPositions(location,ballLocation,5,1,fielders);
		}


		return (location);
    };

    /**
     * Fair Ball Not Caught (used for Line Drives)
     * 
     * @memberOf core.gameSim
     * @return  outs
     */
    GameSim.prototype.locationTwoPositions = function (location,ballLocation,pos1,pos2,fielders) {

	var ballLocation2;
	var probPos1,probPos2;
	var probBoth;

	        if ((pos1 < 5) || (pos1 == 8)) {
				probPos1 = (.97+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[pos1]]].compositeRating.defenseInterior)*.02)/2;
			} else {
				probPos1 = (.97+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[pos1]]].compositeRating.defensePerimeter)*.02)/2;
			}
	        if ((pos2 < 5) || (pos2 == 8)) {
				probPos2 = (.97+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[pos1]]].compositeRating.defenseInterior)*.02)/2;  // .8 to .9
			} else {
				probPos2 = (.97+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[pos1]]].compositeRating.defensePerimeter)*.02)/2;
			}			
//			probPos2 = (.25+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[pos2]]].compositeRating.defensePerimeter)*.5)/2;
			probBoth = probPos1+probPos2;
			ballLocation2 = Math.random();		  

			if (ballLocation2 <probPos1) {
				location = pos1;
			} else if (ballLocation2 <probBoth) {
				location = pos2;		  
			} else {
				location = 100; // hit
			}		  		 		 
								
		return (location);
    };
								
    /**
     * Fair Ball Not Caught (used for Line Drives)
     * 
     * @memberOf core.gameSim
     * @return  outs
     */
    GameSim.prototype.FairBallNotCaught = function (onbase,batter,battingorder,fielders,probabilityflycaught,errorouts,outs) {

	
//(onbase,stealingbase,batter,scorer,battingorder,fielders,outs,runwillscore) {	
							    // Line Drive not caught
							    //how many bases
								//// see below
									  //// can have fielder adjustments, going to wait until have all 9 players
									  //// have drag if on ground for HR
									  
		var advancetosecond;
		var advancetothird;
		var advancehome;
		var p,o;
		
		//probabilityflycaught 0 Fly Ball
		// probabilityflycaught 2 Line Drive
		
									//	advancetosecond = .65+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.shootingLowPost)/10;
									//	advancetothird = .35+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.shootingMidRange)/10;
									//	advancehome = .6+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/2.2;
									o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
									
//									let getSingle = 876+ 40;
//									let getSingle = 176+ 40;
									let getSingle = 376+ 40;
//									let getDouble = 274+this.team[this.o].player[0].compositeRating.shootingLowPost*60;
									let getDouble = 174+this.team[this.o].player[0].compositeRating.shootingLowPost*260;
									let getTriple = 29+ this.team[this.o].player[o].compositeRating.shootingMidRange*2;
//									let getHR = 223+this.team[this.o].player[o].compositeRating.shootingThreePointer*80;
									let getHR = 123+this.team[this.o].player[o].compositeRating.shootingThreePointer*280;
									let sumOdds = getSingle + getDouble + getTriple + getHR;
									let randomNumber = Math.random()*sumOdds;
							//		console.log(getSingle+" "+getDouble+" "+getTriple+" "+getHR+" "+randomNumber+" "+sumOdds);
									
									let singleHit = false;
									let doubleHit = false;
									let tripleHit = false;
									let hrHit = false;
									
									if (randomNumber < getSingle) {
										singleHit = true;
									} else if (randomNumber < getSingle + getDouble) {
										doubleHit = true;
									} else if (randomNumber < getSingle + getDouble + getTriple) {
										doubleHit = true;
										tripleHit = true;
									} else {
										doubleHit = true;
										tripleHit = true;
										hrHit = true;										
									}
									//console.log(sumOdds+" "+randomNumber);
									
									
									if (probabilityflycaught == -1) {
									} else {
										this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg");	
										this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb");										
										this.recordPlay("fg", this.o, [this.team[this.o].player[o].name]);		 			
									}
						//			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb"); 
									  if (onbase[2] < 100) {
									    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");	
										p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
										this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
														//	console.log("f7: "+fielders[0]);
										this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
										
														if (probabilityflycaught == -1) {

															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");													
													//		console.log("Run");											
														} else {
																this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  									  
														
															if 	(outs>errorouts) {										
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
														//		console.log(" Run");											
																
															} else {
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
//console.log("Earned Run");																											
															}																
														
														
														}
											
									    onbase[2] = 100;
									  }
									  if (onbase[1] < 100) {
										onbase[2] = onbase[1];
										onbase[1] = 100;
										  
										if (Math.random() < .5 ) {
											this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");	
												p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
												this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
																//	console.log("f7: "+fielders[0]);
												this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
												
																if (probabilityflycaught == -1) {

																	this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");													
															//		console.log("Run");											
																} else {
																		this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  									  
																
																	if 	(outs>errorouts) {										
																		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
																//		console.log(" Run");											
																		
																	} else {
																		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
																		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
		//console.log("Earned Run");																											
																	}																
																
																
																}
													
												onbase[2] = 100;											
										}  
									  }									  
									  if (onbase[0] < 100) {
											onbase[1] = onbase[0];
											onbase[0] = 100;
										if ((Math.random() < .5 ) && (onbase[2]==100))  {
											onbase[2] = onbase[1];
											onbase[1] = 100;
											  
											if (Math.random() < .5 ) {
												this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");	
													p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
													this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
																	//	console.log("f7: "+fielders[0]);
													this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
													
																	if (probabilityflycaught == -1) {

																		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");													
																//		console.log("Run");											
																	} else {
																			this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  									  
																	
																		if 	(outs>errorouts) {										
																			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
																	//		console.log(" Run");											
																			
																		} else {
																			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
																			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
			//console.log("Earned Run");																											
																		}																
																	
																	
																	}
														
													onbase[2] = 100;											
											}  
										  }											
									  }																  
									  onbase[0] = batter[this.o];									  
									  
									  if (probabilityflycaught == 0) {
//										advancetosecond = .70+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.shootingLowPost)/10;
										advancetosecond = .65+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.shootingLowPost)/10;
									  } else if (probabilityflycaught == 2) {
										advancetosecond = (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.shootingLowPost)/4;
									  }
//									  	if (advancetosecond > Math.random()) {										
									  	if (doubleHit) {										
										
										    if (onbase[2] < 100) {
												this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
												
												p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
												this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
																//	console.log("f8: "+fielders[0]);
												this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
																							
												
														if (probabilityflycaught == -1) {
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
											//	console.log(" Run");											
														} else {
																this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  											   
														
															if 	(outs>errorouts) {										
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");		
//console.log("Run");																											
															} else {
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
//console.log("Earned Run");																											
															}																
																												     
															
														}
												
												onbase[2] = 100;												   
											}
										    if (onbase[1] < 100) {
												onbase[2] = onbase[1];																		
												onbase[1] = 100;
												if (Math.random() < .50 ) {
													this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");	
														p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
														this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
																		//	console.log("f7: "+fielders[0]);
														this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
														
																		if (probabilityflycaught == -1) {

																			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");													
																	//		console.log("Run");											
																		} else {
																				this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  									  
																		
																			if 	(outs>errorouts) {										
																				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
																		//		console.log(" Run");											
																				
																			} else {
																				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
																				this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
				//console.log("Earned Run");																											
																			}																
																		
																		
																		}
															
														onbase[2] = 100;											
												} 												
											}											
										    onbase[1] = onbase[0];																		
										    onbase[0] = 100;					
											
											if (probabilityflycaught == 0) {
//													advancetothird = .5+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.shootingMidRange)/10;
													advancetothird = .35+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.shootingMidRange)/10;
											  } else if (probabilityflycaught == 2) {
													advancetothird = (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.shootingMidRange)/10;
											  }											
//											if (advancetothird > Math.random()) {	
											if (tripleHit) {	
												if (onbase[2] < 100) {
													this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
													p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
													this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
																		//console.log("f9: "+fielders[0]);
													this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
													
														if (probabilityflycaught == -1) {
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
										//		console.log(" Run");											
														} else {
															if 	(outs>errorouts) {										
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");															
//console.log("Run");																											
															} else {
																this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  											   														
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");															
//console.log("Earned Run");																											
															}																
															
														}
													
													
													onbase[2] = 100;												   													
												}
												onbase[2] = onbase[1];																		
												onbase[1] = 100;
											//	advancehome = .90+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/5;
//												advancehome = .65+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/3;
//												advancehome = .35+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/1;
//												advancehome = .15+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)*1.2;
//												advancehome = .75+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/4;
												if (probabilityflycaught == 0) {
//														advancehome = .5+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/2;
//														advancehome = .6+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/2;
//														advancehome = .6+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/2;
//														advancehome = .3+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/1.3;
//														advancehome = .4+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/1.5;
//														advancehome = .45+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/1.7;
//														advancehome = .5+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/2.0;
														advancehome = .6+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/2.2;
												  } else if (probabilityflycaught == 2) {
														advancehome = (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer);
												  }	
//												if (advancehome > Math.random()) {	
												if (hrHit) {	
													if (onbase[2] < 100) {
														this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");	
														if (probabilityflycaught == -1) {
															o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
														this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");
													//		console.log(" Run");											
														} else {
															o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];
															this.recordPlay("blk", this.o, [this.team[this.o].player[o].name]);		 
															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  											   																													
//															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "blk");
															this.recordStat(this.o, o, "blk");	
//															this.recordStat(this.o, this.playersOnCourt[this.o][o], "blk");	
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgLowPost");															

															if 	(outs>errorouts) {										
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");															
//console.log("Run");																											
															} else {
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");		
//console.log("Earned Run");																											
															}	
															
															
														}
														p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
														this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
																		//	console.log("f: "+fielders[0]);
														this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
														
														onbase[2] = 100;												   														
													}
												}    else {
														if (probabilityflycaught == -1) {
															
														} else {
//															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "orb");												
															o =  this.playersOnCourt[this.o][battingorder[batter[this.o]]];
															this.recordStat(this.o, o, "orb");	
														//	this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg");	
														//	this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb");																
															this.recordPlay("orb", this.o, [this.team[this.o].player[o].name]);		 
															
														}
												
													
												}												
											}   else {
														if (probabilityflycaught == -1) {
															
														} else {
//															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[1]]], "ft");		
															o =  this.playersOnCourt[this.o][battingorder[batter[this.o]]];
															this.recordStat(this.o, o, "ft");	
													//		this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg");	
													//		this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb");																
															this.recordPlay("ft", this.o, [this.team[this.o].player[o].name]);		 
															
														}
											
													
											} 
                                      											
										}
									  
								

													  

	return;
    };


	
	

    /**
     * Ground Ball
     * 
     * @memberOf core.gameSim
     * @return  outs
     */
    GameSim.prototype.groundBall = function (onbase,stealingbase,batter,scorer,battingorder,fielders,outs,runwillscore,error,errorouts) {

        var probabilitythrownout;	
        var probabilitythrownout2B;
        var probabilitythrownout3B;
        var probabilitythrownoutH;
		
	// Ground Ball
						     // range 25-75% // may want to make tighter
							 // added 0.20 to make it harder now that line drives are there
 	
	var ballLocation = 0;
		var location = 100;
		var probError = 0;
		
		var probError,probMakePlay,probNoPlay,resultOfPlay;									 
		probabilitythrownout = 0;
							 
		var startOuts;
		var o;
		var error = 0;
							location = this.ballLocation(location,fielders,3,5,5,5,5,5,3,2,1,0,0,5,6,6,6,5,1,1,1,1);
							startOuts = outs;
	
							
							// do for all (allow for 2nd, 3rd out adjustment)
							// allow for error 

								
							// make this base on who fields ball
							probabilitythrownout = this.throwOutProb(probabilitythrownout,outs,startOuts,location,battingorder,batter,fielders);
						//	 console.log(probabilitythrownout+" "+startOuts+" "+outs);
//						     probabilitythrownout = 0.20+(3-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.stealing*1.5+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.defenseInterior+this.team[this.d].player[this.playersOnCourt[this.d][fielders[4]]].compositeRating.defenseInterior*0.50))/6;							 
							 
							 //// probability thrown out
							 
							 
							 
							 probabilitythrownout2B = 0.00;
							 probabilitythrownout3B = 0.00;							 
							 if (onbase[0] < 100) {
							   if (stealingbase[0] < .5) {
//						         probabilitythrownout2B =  (3-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing*1.5+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.defenseInterior+this.team[this.d].player[this.playersOnCourt[this.d][fielders[4]]].compositeRating.defenseInterior*0.50))/6;							 							 
//						         probabilitythrownout2B =  (3-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.stealing*1.5+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior)/6;							 							 
									probabilitythrownout2B = this.throwOutProb(probabilitythrownout2B,outs,startOuts,location,battingorder,batter,fielders);
									probabilitythrownout2B /= 2;
									probabilitythrownout /= 2;
								 
								// create for each position (new function) 
								//
								 
							   } else {
							    // assume makes it, play is at first
								probabilitythrownout2B = 0;
							   }
							   if (onbase[1] < 100) {
							     if (stealingbase[0] < .5) {
								    // could make base adjustment later
									probabilitythrownout3B = this.throwOutProb(probabilitythrownout3B,outs,startOuts,location,battingorder,batter,fielders);
									probabilitythrownout3B /= 3/2;
									probabilitythrownout2B /= 3/2;
									probabilitythrownout /= 3/2;
								 
									//probabilitythrownout3B =  (3-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.stealing*1.5+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.defenseInterior+this.team[this.d].player[this.playersOnCourt[this.d][fielders[4]]].compositeRating.defenseInterior*0.50))/6;							 							 
							     } else {
							       // assume makes it, play is at first
								   probabilitythrownout3B = 0;								   
							     }
								if (onbase[2] < 100) {
									if (stealingbase[0] < .5) {
									probabilitythrownoutH = this.throwOutProb(probabilitythrownoutH,outs,startOuts,location,battingorder,batter,fielders);

									probabilitythrownoutH /= 4/3;
									probabilitythrownout3B /= 4/3;
									probabilitythrownout2B /= 4/3;
									probabilitythrownout /= 4/3;
									
								//		probabilitythrownoutH =  (3-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.stealing*1.5+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[2]]].compositeRating.defenseInterior+this.team[this.d].player[this.playersOnCourt[this.d][fielders[4]]].compositeRating.defenseInterior*0.50))/6;							 							 
									} else {
										// assume makes it, play is at first
										probabilitythrownoutH = 0;
									}
									//	console.log(probabilitythrownoutH);
									// run with batter 1b,2b,3b									
										if (probabilitythrownoutH > Math.random() ) {
											outs +=1;	
											onbase[1]=100;					
											this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
											o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
											this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
											
										} else {								    
										    if ((Math.random()<.01) && (location < 10)) { 
								//				this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg",-1);	
											//	this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb",-1); 
												o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
												this.recordPlay("er", this.o, [this.team[this.o].player[o].name]);		 			
												error = 1;
												errorouts -= 1;												
												this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "errors");										
												this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");	
						//	console.log("got an error: " + errorouts);												
											}
										
											runwillscore[0] = 1;
											scorer[0] = onbase[2];
											onbase[2]=100;
										}		
								//	probabilitythrownout3B = this.throwOutProb(probabilitythrownout3B,outs,startOuts,location,battingorder,batter,fielders);
										//console.log(probabilitythrownout3B);	
										if ( ( (probabilitythrownout3B-(outs-startOuts)*.2) > Math.random()) && (outs < 3)) {
											outs +=1;	
											o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
											this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 														
											this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
											onbase[1]=100;	
											
										} else {								    
											onbase[2] = onbase[1];																	
											onbase[1] = 100;																																											
										}								  
									//probabilitythrownout2B = this.throwOutProb(probabilitythrownout2B,outs,startOuts,location,battingorder,batter,fielders);
																//	console.log(probabilitythrownout2B);			
										if (((probabilitythrownout2B-(outs-startOuts)*.2) > Math.random()) && (outs < 3))  {
											outs +=1;	
											o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
											this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
											this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
											
											onbase[0]=100;																		
										} else {								    
											onbase[1] = onbase[0];																	
											onbase[0] = 100;																																		
										}
									//	probabilitythrownout = this.throwOutProb(probabilitythrownout,outs,startOuts,location,battingorder,batter,fielders);
									//	console.log(probabilitythrownout);
										if (((probabilitythrownout-(outs-startOuts)*.2) > Math.random()) && (outs < 3))  {
											outs +=1;
											o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
											this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
											this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
											
										} else {
											onbase[0] = batter[this.o];																																										
											//// determine extra bases 
											
										}									
							   
							    } else {
								  // run with batter, 1b, 2b		
								  	if (((probabilitythrownout3B-(outs-startOuts)*.25) > Math.random()) && (outs < 3))  {
											outs +=1;	
											o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
											this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
											this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
											
											onbase[1]=100;		
											this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
											
										} else {	
										    if ((Math.random()<.01) && (location < 9)){ 
									//			this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg",-1);
									//			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb",-1); 	
												o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
												this.recordPlay("er", this.o, [this.team[this.o].player[o].name]);		 			
												error = 1;		
												errorouts -= 1;
												this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "errors");										
												this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");	
						//	console.log("got an error: " + errorouts);												
											}										
											onbase[2] = onbase[1];																	
											onbase[1] = 100;																																											
										}	
									probabilitythrownout2B =  this.throwOutProb(probabilitythrownout2B,outs,startOuts,location,battingorder,batter,fielders);
										
									if (((probabilitythrownout2B-(outs-startOuts)*.25) > Math.random()) && (outs < 3))  {
										outs +=1;	
										o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
										this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
										this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
										
										onbase[0]=100;																		
									} else {								    
										onbase[1] = onbase[0];																	
										onbase[0] = 100;																																		
									}
									probabilitythrownout =  this.throwOutProb(probabilitythrownout,outs,startOuts,location,battingorder,batter,fielders);
									
									if (((probabilitythrownout-(outs-startOuts)*.25) > Math.random()) && (outs < 3))  {
										outs +=1;
										o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
										this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
										this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
										
									} else {
									
										onbase[0] = batter[this.o];																																										
										//// determine extra bases 
									}									  
								}
							  }	else {
							  // run with batter and 1b
							    if (probabilitythrownout2B > Math.random()) {
									outs +=1;	
										o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
										this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
										this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
									
                                    onbase[0]=100;																		
									this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");									
								} else {						
										    if ((Math.random()<.01) && (location < 9)){ 
								//				this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg",-1);	
									//			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb",-1); 
												o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
												this.recordPlay("er", this.o, [this.team[this.o].player[o].name]);		 			
												error = 1;
												errorouts -= 1;												
												this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "errors");										
												this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");		
						//	console.log("got an error: " + errorouts);												
											}								
                                    onbase[1] = onbase[0];																	
                                    onbase[0] = 100;																																		
								}
								//probabilitythrownout = this.throwOutProb(probabilitythrownout,outs,startOuts,location,battingorder,batter,fielders);
								
								if (((probabilitythrownout-(outs-startOuts)*.33) > Math.random()) && (outs < 3))  {
//								if (probabilitythrownout == 0) {
									outs +=1;
										o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
										this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
										this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");
									
								} else {
                                    onbase[0] = batter[this.o];																																										
									if (onbase[2] < 100) {
											runwillscore[0] = 1;
											scorer[0] = onbase[2];
											onbase[2]=100;									  
									}									
									//// determine extra bases 
									
								}								  
							  }
							 } else {
							   //run with batter
								if (probabilitythrownout > Math.random()) {
//								if (probabilitythrownout ==0) {
									outs +=1;
										o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
										this.recordPlay("go", this.o, [this.team[this.o].player[o].name],outs);		 			
									
									this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");									
								} else {
										    if ((Math.random()<.01) && (location < 9)){ 
									//			this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg",-1);
									//			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb",-1); 
												o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;
												this.recordPlay("er", this.o, [this.team[this.o].player[o].name]);		 			
												error = 1;
												errorouts -= 1;												
												this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "errors");										
												this.recordStat(this.d, this.playersOnCourt[this.d][fielders[location]], "fieldAttempts");	
						//	console.log("got an error: " + errorouts);												
											}								
								
                                    onbase[0] = batter[this.o];																																										
									//// determine how many bases 
									//check for 2nd and 3rd
									if (onbase[2] < 100) {
											runwillscore[0] = 1;
											scorer[0] = onbase[2];
											onbase[2]=100;									  
									}
									if (onbase[1] < 100) {
											onbase[2] = onbase[1];																	
											onbase[1] = 100;										   
									}
									
								}								   
							 }
					//console.log(probabilitythrownout+" "+startOuts+" "+outs);		
		return {
			onbase: onbase,
			scorer: scorer,
			runwillscore: runwillscore,
			outs: outs,
			error: error,
			errorouts: errorouts			
		};
    };


	
    /**
     * Probability of being thrown out
     * 
     * @memberOf core.gameSim
     * @return  outs
     */
    GameSim.prototype.throwOutProb = function (probabilitythrownout,outs,startOuts,location,battingorder,batter,fielders) {

		var adjustment = 0;
//		var startingLevel = 0.75;
		var startingLevel = 0.78;

							if ((outs-startOuts)>0)	{
							  //adjustment = .4;
							  adjustment = .7;
							} 
							if ((outs-startOuts)>1)	{
							  adjustment = 1.1; //double play
							} 


							/*	probabilitythrownout = 0.60-adjustment;
								probabilitythrownout = location;// keep debugging
								probabilitythrownout = fielders[location];
								probabilitythrownout = this.playersOnCourt[this.d][fielders[location]];
								probabilitythrownout = this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing;
								probabilitythrownout = this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior;
								probabilitythrownout = this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.stealing; // .6 to .93*/
						//	console.log(adjustment);
						    if (location == 0) {
								probabilitythrownout = startingLevel-adjustment+(0.975+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1 +.05+.055; //8 // .6 to .933  now it is a range between .200-.300
							//	console.log("0 "+probabilitythrownout);								
							} else if (location == 1) {
								probabilitythrownout = startingLevel-adjustment+(0.98+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1+.15+.055; //16 .7 to .95
							//	console.log("1 "+probabilitythrownout);								
							} else if (location == 2) {
								probabilitythrownout = startingLevel-adjustment+(0.96+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1+.075+.055; //4 .4 to .9
							//	console.log("2 "+probabilitythrownout);								
							} else if (location == 3) {
								probabilitythrownout = startingLevel-adjustment+(0.96+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1+.075+.055; //4 .4 to .9
							//	console.log("3 "+probabilitythrownout);								
							} else if (location == 4) {
								probabilitythrownout = startingLevel-adjustment+(0.96+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1-.1+.055; //4 .2 to .86
							//	console.log("4 "+probabilitythrownout);								
							} else if (location == 5) {
								probabilitythrownout = startingLevel-adjustment+(0.96+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1-.6+.055; //4 .0 to .1
							//	console.log("5 "+probabilitythrownout);								
							} else if (location == 6) {
								probabilitythrownout = startingLevel-adjustment+(0.96+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1-.3+.055; //4 .0 to .5
						//		console.log("6 "+probabilitythrownout);								
							} else if (location == 7) {
								probabilitythrownout = startingLevel-adjustment+(0.96+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1-.5+.055; //4 .0 to .2
						//		console.log("7 "+probabilitythrownout);								
							} else if (location == 8) { // location ==0
								probabilitythrownout = startingLevel-adjustment+(0.97+(this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.passing+this.team[this.d].player[this.playersOnCourt[this.d][fielders[location]]].compositeRating.defenseInterior-this.team[this.o].player[this.playersOnCourt[this.o][battingorder[batter[this.o]]]].compositeRating.groundBall*2))*.1+.10+.055; //8 .6 to .93
						//		console.log("8 "+probabilitythrownout);								
							} else {
								probabilitythrownout = 0;
						//		console.log(">8 "+probabilitythrownout);								
							}
						/*	if (probabilitythrownout != 0) {
								probabilitythrownout = .75-adjustment;
							//	probabilitythrownout += .10;
							}*/
	
		return probabilitythrownout;
    };
	
	
	
	
	
	
	
    /**
     * Ground Ball Stats
     * 
     * @memberOf core.gameSim
     * @return  outs
     */
    GameSim.prototype.groundBallStats = function (runwillscore,onbase,batter,scorer,battingorder,fielders,error,errorouts,outs,groundOut) {

	
	var advancetosecond;
	var advancetothird;
	var advancehome;
	var p,o;

								
///////////////////////
	
	
								  //// ground ball stats
									if (error == 1) {
									} else if (groundOut == 1) {
									} else {
										this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg");							   			  									  
										this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb");
										o = this.playersOnCourt[this.o][battingorder[batter[this.o]]] ;										
										this.recordPlay("fg", this.o, [this.team[this.o].player[o].name]);		 			
									}	
									

									

								   if (runwillscore[0] == 1) {
									   this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[scorer[0]]], "pts");
								//	     console.log("error: "+error+" outs: "+outs+" errorouts: "+errorouts);
													if (error ==1 ) {
														this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");														
												//	console.log("Run");											
													} else {

														if 	(outs>errorouts) {										
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");	
//console.log("Run");																											
														} else {
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");															
//console.log("Earned Run");																											
														}	
													
													
														this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  											   
														
													}											
										//p = battingorder[scorer[0]];
										p = this.playersOnCourt[this.o][battingorder[scorer[0]]] ;											
										this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name
														//	console.log("f19: "+fielders[0]);
										this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
										
								  }
								  //// can have fielder adjustments, going to wait until have all 9 players
								  //// have drag if on ground for HR
								  if ((groundOut == 1) || (error == 1)) {
								  } else {
									  onbase[0] = batter[this.o];
//									  advancetosecond = .2+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.shootingLowPost)/20;
									  advancetosecond = (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[0]]]].compositeRating.shootingLowPost)/20;
										if (advancetosecond > Math.random()) {										
											if (onbase[2] < 100) {
											   this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
										//     console.log("error: "+error+" outs: "+outs+" errorouts: "+errorouts);											   
														if (error ==1 ) {
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");														
								//						console.log("Run");											
														} else {
															if 	(outs>errorouts) {										
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
									//							console.log(" Run");											
															} else {
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
	//console.log(" Run");																											
															}														
															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  											   
															
														}
												
												p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
												this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name	
				//	console.log("f20: "+fielders[0]);												
												this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
												
												onbase[2] = 100;												   
											}
											if (onbase[1] < 100) {
												onbase[2] = onbase[1];																		
												onbase[1] = 100;					
											}											
											onbase[1] = onbase[0];																		
											onbase[0] = 100;					
											
//											advancetothird = .1+(this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.shootingMidRange)/20;
											advancetothird = (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[1]]]].compositeRating.shootingMidRange)/20;
											if (advancetothird > Math.random()) {										
												if (onbase[2] < 100) {
													this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");	
													p = this.playersOnCourt[this.o][battingorder[onbase[2]]];						
													this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name		
				//	console.log("f21: "+fielders[0]);													
													this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
										//     console.log("error: "+error+" outs: "+outs+" errorouts: "+errorouts);													
														if (error ==1 ) {
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");														
													//	console.log(" Run");											
														} else {
													/*		if 	(outs>errorouts) {										
															} else {
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
															}															
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  											   */
															if 	(outs>errorouts) {										
												//				console.log(" Run");											
															} else {
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
												//			console.log("Earned Run");											
															}															
	//															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");	
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  											   
															
														}
													
													onbase[2] = 100;												   													
												}
												onbase[2] = onbase[1];																		
												onbase[1] = 100;
//												advancehome = (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/10;
												advancehome = (this.team[this.o].player[this.playersOnCourt[this.o][battingorder[onbase[2]]]].compositeRating.shootingThreePointer)/20;
												if (advancehome > Math.random()) {										
													if (onbase[2] < 100) {
														this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
										//		     console.log("error: "+error+" outs: "+outs+" errorouts: "+errorouts);													

														
														if (error ==1 ) {
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");														
															//														console.log(" Run");											

														} else {
															o = this.playersOnCourt[this.o][battingorder[batter[this.o]]];														
															this.recordPlay("blk", this.o, [this.team[this.o].player[o].name]);		 														
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pfE");																
	//															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "blk");	
															this.recordStat(this.o, o, "blk");	
															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "stl");							   			  											   																											
															this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "fgLowPost");																
															if 	(outs>errorouts) {		
													//		console.log(" Run");											
															
															} else {
																this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "pf");		
													//		console.log("Earned Run");											
																
															}															
														}
														p = this.playersOnCourt[this.o][battingorder[onbase[2]]];
														//console.log("don't need? ")
														//this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name		
				//	console.log("f22: "+fielders[0]);														
														this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
														
														onbase[2] = 100;												   														
													}
												}    else {
														if (error ==1 ) {
														} else {
															o =  this.playersOnCourt[this.o][battingorder[batter[this.o]]];
	//															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "orb");																									
															this.recordStat(this.o, o, "orb");				
												//			this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg");	
												//			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb");																
															this.recordPlay("orb", this.o, [this.team[this.o].player[o].name]);		 
														}
													
												}												
											}   else {
														if (error ==1 ) {
														} else {													
															o = battingorder[batter[this.o]];
	//															this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[1]]], "ft");		
															this.recordStat(this.o, this.playersOnCourt[this.o][o], "ft");	
												//			this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[batter[this.o]]], "fg");	
												//			this.recordStat(this.d, this.playersOnCourt[this.d][fielders[0]], "drb");																
															o =  this.playersOnCourt[this.o][battingorder[batter[this.o]]];
															this.recordPlay("ft", this.o, [this.team[this.o].player[o].name]);		 
														}
													
											} 														                                       											
										}
									}
                                   // ground ball stats end	
		return onbase;
    };

    /**
     * Stealing bases?(reduce above to functions allow for easy changes
     * 
     * @memberOf core.gameSim
	 * @param {number} base potentially stolen: updates outs or stolen base related stats
     * @return 
     */
//    GameSim.prototype.stealingbase = function (outs,stealingbase,onbase,batter,battingorder,fielders,probstealsuccess,base) {
    GameSim.prototype.stealingbase = function (outs,onbase,p,f,probstealsuccess,base,errorouts) {
   // var p;
		
		//(outs,onbase,p,f,probstealsuccess,2);	 (outs,onbase,p,probstealsuccess,base,errorouts) {
		
		this.recordStat(this.o, p, "tpa");							   			  		  			   
		//		this.recordStat(this.o, p, "tp");		
			//	console.log("p: "+probstealsuccess);
			//	console.log("r: "+Math.random());
				
		if (probstealsuccess > Math.random()) {
			if (base == 2) {
		//		this.recordStat(this.o, p, "stl");							   
				this.recordStat(this.o, p, "pts");	
				if (errorouts < outs) {
									//										console.log(" Run");											

				} else {
					this.recordStat(this.d, f, "pf");						 
									//						console.log("Earned Run");											
					
				}
				this.recordStat(this.d, f, "pfE");									
				this.recordStat(this.o, p, "tp");	
//				o = battingorder[batter[this.o]];
				this.recordPlay("stlH", this.o, [this.team[this.o].player[p].name]);		 			
				
				//p = battingorder[onbase[2]];
				this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);		 // this.team[this.o].player[p].name												
//				this.winLoss(losingPitcher,winningPitcher,fielders,fieldingPosition);
				
				fieldersGlobal[0] = fieldingPosition[this.d][0] ;
			//		console.log("f23: "+f);
				this.winLoss(losingPitcher,winningPitcher,f,fieldingPosition);
				
				onbase[base] = 100;						 					     						 						
			} else {
				this.recordStat(this.o, p, "tp");	
				if (base == 1) {
					this.recordPlay("stl3", this.o, [this.team[this.o].player[p].name]);		 			
				} else {
					this.recordPlay("stl2", this.o, [this.team[this.o].player[p].name]);		 			
				}
				onbase[base+1] = onbase[base];						 					     
				onbase[base] = 100;						 					     
			}
		}  else {
		    outs += 1;
			//p = battingorder[batter[this.o]];			
			this.recordPlay("thrownOut", this.o, [this.team[this.o].player[p].name],outs);		 // this.team[this.o].player[p].name															
			
			onbase[base] = 100;						 

		}
			
	
	
	
        return outs;
    };

    /**
     * Walk (4 balls)
     * 
     * @memberOf core.gameSim
     * @return  outs
     */
    GameSim.prototype.walk = function (onbase,batter,base) {


				    onbase[base] = batter[this.o];
					if (base > 0) {
						onbase[1] = onbase[0];					
					}
					if (base > 1) {
						onbase[2] = onbase[1];					
					}
					
					if (batter[this.o] > 7) {
						batter[this.o] = 0;
					} else {
						batter[this.o] +=1;
					}	
       return;
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
     //   this.recordStat(this.o, p, "fga");
        if (type === "atRim") {
         //   this.recordStat(this.o, p, "fgaAtRim");
        } else if (type === "lowPost") {
        //    this.recordStat(this.o, p, "fgaLowPost");
        } else if (type === "midRange") {
         //   this.recordStat(this.o, p, "fgaMidRange");
        } else if (type === "threePointer") {
         //   this.recordStat(this.o, p, "tpa");
        }

        ratios = this.ratingArray("blocking", this.d, 4);
        p2 = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
  //      this.recordStat(this.d, p2, "blk");


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
//        this.recordStat(this.o, p, "fga");
//        this.recordStat(this.o, p, "fg");
//        this.recordStat(this.o, p, "pts", 2);  // 2 points for 2's
        if (type === "atRim") {
//            this.recordStat(this.o, p, "fgaAtRim");
//            this.recordStat(this.o, p, "fgAtRim");
//            this.recordPlay("fgAtRim" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
//            this.recordStat(this.o, p, "fgaLowPost");
//            this.recordStat(this.o, p, "fgLowPost");
//            this.recordPlay("fgLowPost" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
//            this.recordStat(this.o, p, "fgaMidRange");
//            this.recordStat(this.o, p, "fgMidRange");
//            this.recordPlay("fgMidRange" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
//            this.recordStat(this.o, p, "pts");  // Extra point for 3's
//            this.recordStat(this.o, p, "tpa");
//            this.recordStat(this.o, p, "tp");
//            this.recordPlay("tp" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        }

        if (passer >= 0) {
            p = this.playersOnCourt[this.o][passer];
     //       this.recordStat(this.o, p, "ast");
      //      this.recordPlay("ast", this.o, [this.team[this.o].player[p].name]);
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
         //   this.recordStat(this.o, p, "fta");
            if (Math.random() < this.team[this.o].player[p].compositeRating.shootingFT * 0.3 + 0.6) {  // Between 60% and 90%
         //       this.recordStat(this.o, p, "ft");
         //       this.recordStat(this.o, p, "pts");
         //       this.recordPlay("ft", this.o, [this.team[this.o].player[p].name]);
                outcome = "fg";
            } else {
         //       this.recordPlay("missFt", this.o, [this.team[this.o].player[p].name]);
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
      //  this.recordStat(this.d, p, "pf");
    //    this.recordPlay("pf", this.d, [this.team[this.d].player[p].name]);
        // Foul out
        if (this.team[this.d].player[p].stat.pf >= 6) {
     //       this.recordPlay("foulOut", this.d, [this.team[this.d].player[p].name]);
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
      //      this.recordStat(this.d, p, "drb");
     //       this.recordPlay("drb", this.d, [this.team[this.d].player[p].name]);

            return "drb";
        }

        ratios = this.ratingArray("rebounding", this.o);
        p = this.playersOnCourt[this.o][this.pickPlayer(ratios)];
  //      this.recordStat(this.o, p, "orb");
  //      this.recordPlay("orb", this.o, [this.team[this.o].player[p].name]);

        return "orb";
    };

//Baseball 
    /**
     * Generate an array of composite ratings.
     * 
     * @memberOf core.gameSim
     * @param {string} rating Key of this.team[t].player[p].compositeRating to use.
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number=} power Power that the composite rating is raised to after the components are linearly combined by  the weights and scaled from 0 to 1. This can be used to introduce nonlinearities, like making a certain stat more uniform (power < 1) or more unevenly distributed (power > 1) or making a composite rating an inverse (power = -1). Default value is 1.
	 // old
     * @return {Array.<number>} Array of composite ratings of the players on the court for the given rating and team.
     */
    GameSim.prototype.probabilityArray = function (fielders, pos0,pos1,pos2,pos3,pos4,pos5,pos6,pos7,pos8,fieldingtype) {
        var weightssum = 0;
        var	fieldingweights =  [pos0,pos1,pos2,pos3,pos4,pos5,pos6,pos7,pos8];
		var probability  = 0;
		var i;
		
		
		for (i=0; i < 9; i++) {
			probability = (this.team[this.d].player[this.playersOnCourt[this.d][fielders[i]]].compositeRating[fieldingtype])*fieldingweights[i];				
			weightssum += fieldingweights[i]
		}
		probability /= weightssum;
		weightssum = 0;		
		
		
        return probability;
    };
	
	
	
//// Baseball	
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
		
		    // player on court i, for team t  
            p = this.playersOnCourt[t][i];
					
			////  this.team[t].player[p].compositeRating[rating] team t player p compositerating rating(specified above in function)
			//// * fatigue function
            array[i] = Math.pow(this.team[t].player[p].compositeRating[rating] * this.fatigue(this.team[t].player[p].stat.energy), power);
        }

        return array;
    };
	
//// Basketball	
    /**
     * Generate an array of composite ratings.
     * 
     * @memberOf core.gameSim
     * @param {string} rating Key of this.team[t].player[p].compositeRating to use.
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number=} power Power that the composite rating is raised to after the components are linearly combined by  the weights and scaled from 0 to 1. This can be used to introduce nonlinearities, like making a certain stat more uniform (power < 1) or more unevenly distributed (power > 1) or making a composite rating an inverse (power = -1). Default value is 1.
     * @return {Array.<number>} Array of composite ratings of the players on the court for the given rating and team.
     */
    GameSim.prototype.ratingArrayBasketball = function (rating, t, power) {
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
     * Increments a stat (s) for a player (p) on a team (t) by amount (default is 1).
     *
     * @memberOf core.gameSim
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number} p Integer index of this.team[t].player for the player of interest.
     * @param {string} s Key for the property of this.team[t].player[p].stat to increment.
     * @param {number} amt Amount to increment (default is 1).
     */
    GameSim.prototype.recordStat = function (t, p, s, amt) {
	    var battingorder = p;
		
		if (p>= 0) { //tov //tov
		} else {
			console.log("s: "+s+" t: "+t+" p: "+p);
		}
        amt = amt !== undefined ? amt : 1;
        this.team[t].player[p].stat[s] += amt;
        if (s !== "gs" && s !== "courtTime" && s !== "benchTime" && s !== "energy") {
            this.team[t].stat[s] += amt;
            // Record quarter-by-quarter scoring too
            if (s === "pts") {
                this.team[t].stat.ptsQtrs[this.team[t].stat.ptsQtrs.length - 1] += amt;
			/*	if (t == 0) {
						this.team[t].stat.inning[this.team[t].stat.ptsQtrs.length - 1] += this.team[t].stat.ptsQtrs.length;
				}*/
            }
			
			//for i = 
//			p = battingorder[t][p]
// this.playersOnCourt[t][p]
//this.playersOnCourt[t][battingOrderGame[t][0]]
        // playByPlayOrder = battingorder (subs later);    
			
			//battingOrderPlayByPlay +=1;
//			playByPlayOrder[t][this.playersOnCourt[t][i]] = battingOrderPlayByPlay;		
/* 	var playByPlayOrder = [[],[]];
	var playByPlayOrderPitching = [[],[]];
	var battingOrderPlayByPlay = 8;
	var pitchingOrderPlayByPlay = 0;										*/
	/*	if (s == "showPlayByPlay") {
			console.log("Pt: "+t+ " p: "+p+ " s: "+s+ " amt: "+amt+" playByPlayOrderPitching[t][p]: "+playByPlayOrder[t][p]);
		}
		if (s == "showPlayByPlayPitcher") {
			console.log("Pt: "+t+ " p: "+p+ " s: "+s+ " amt: "+amt+" playByPlayOrderPitching[t][p]: "+playByPlayOrderPitching[t][p]);
		}*/
	
	
	       if ((s === "fta") || (s === "drb") || (s === "pf") || (s === "pfE") || (s === "fgAtRim") || (s === "fgaAtRim") || (s === "fgLowPost") || (s === "showPlayByPlayPitcher")){
	
				if (this.playByPlay !== undefined) {
			//	    console.log("t: "+t+" p: "+ p+" playByPlayOrderPitching[t][p]: "+playByPlayOrderPitching[t][p]+ " s: "+ s);
					this.playByPlay.push({
						type: "stat",
						qtr: this.team[t].stat.ptsQtrs.length - 1,
						t: t,
	//                    p: p,
						p: playByPlayOrderPitching[t][p] ,
						s: s,
						amt: amt
					});
				}
		   } else {
	
				if (this.playByPlay !== undefined) {
					this.playByPlay.push({
						type: "stat",
						qtr: this.team[t].stat.ptsQtrs.length - 1,
						t: t,
	//                    p: p,
						p: playByPlayOrder[t][p] ,
						s: s,
						amt: amt
					});
				}
		   }
	
			
        }
    };
	

//    GameSim.prototype.recordPlay = function (type, t, names) {
    GameSim.prototype.recordPlay = function (type, t, names,outs) {
        var i, qtr, sec, text, texts;
		var combinedName;
		
		
        outs = outs !== undefined ? outs : -1;		
	//	if (type == "showPlayByPlay") {
	//		console.log("names: "+names+ " type: "+type+ " t: "+t+ " outs: "+outs);
	//	}


        if (this.playByPlay !== undefined) {
            if (type === "injury") {
                texts = ["{0} was injured!"];
            } else if (type === "tov") {
                texts = ["{0} struck out <b>("+outs+")</b>"];
//                texts = ["{0} struck out by {1}"];
            //else if (type === "stl") {
              //  texts = ["{0} stole the ball from {1}"];
			//	console.log(texts);						  
			} else 	if (type === "triplePlay") {
                texts = ["{0} triple play <b>("+outs+")</b>"];			  
			//	console.log(texts);							
			} else 	if (type === "doublePlay") {
                texts = ["{0} double play <b>("+outs+")</b>"];			  
			//	console.log(texts);							
			} else 	if (type === "picked") {
                texts = ["{0} picked off <b>("+outs+")</b>"];			  
			//	console.log(texts);							
			} else 	if (type === "stlH") {
                texts = ["{0} stole home"];			  
			} else 	if (type === "stl3") {
                texts = ["{0} stole third"];			  
			} else 	if (type === "stl2") {
                texts = ["{0} stole second"];			  
			} else 	if (type === "fta") {
                texts = ["{0} pitching"];
			} else 	if (type === "fielding") {
                texts = ["{0} fielding"];
			} else 	if (type === "fga") {
                texts = ["{0} batting"];
			} else 	if (type === "pts") {
                texts = ["<b>{0} scored</b>"];
			} else 	if (type === "er") {
                texts = ["{0} got on base from an error"];
			} else 	if (type === "lo") {
                texts = ["{0} lined out <b>("+outs+")</b>"];
			//	console.log(texts);						
			} else 	if (type === "go") {

                texts = ["{0} grounded out <b>("+outs+")</b>"];
			//	console.log(texts);				
			} else 	if (type === "fo") {
                texts = ["{0} flied out <b>("+outs+")</b>"];
			//	console.log(texts);						
			} else 	if (type === "fg") {
                texts = ["{0} makes it to first"];
			} else 	if (type === "blk") {
                texts = ["{0} hit a home run"];
			} else 	if (type === "ft") {
                texts = ["{0} hit a double"];
			} else 	if (type === "orb") {
                texts = ["{0} hit a triple"];
			} else 	if (type === "ast") {
                texts = ["{0} walked"];
			} else 	if (type === "tp") {
                texts = ["{0} stole a base"];
			} else 	if (type === "caught") {
                texts = ["{0} got caught stealing <b>("+outs+")</b>"];
			} else 	if (type === "picked") {
                texts = ["{0} got picked off <b>("+outs+")</b>"];
			//	console.log(texts);				
			} else 	if (type === "flyed") {
                texts = ["{0} fly ball is caught by {1}"];
			//	console.log(texts);				
			} else 	if (type === "lined") {
                texts = ["{0} line drive caught by {1}"];
			//	console.log(texts);				
			} else 	if (type === "thrownOut") {
                texts = ["{0} thrown out stealing <b>("+outs+")</b>"];
			//	console.log(texts);				
			} else 	if (type === "groundout") {
                texts = ["{0} thrown out <b>("+outs+")</b>"];
			//	console.log(texts);
			} else 	if (type === "win") {
                texts = ["{0} was the winning pitcher"];
			//	console.log("winning pitcher: "+names);
			} else 	if (type === "loss") {
                texts = ["{0} was the losing pitcher"];
				
				
/*            } else if (type === "fgAtRim") {
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
                texts = ["(assist: {0})"];*/
            } else if (type === "halfInning") {
                texts = ["<b>Bottom of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length) + " inning</b>"];
            } else if (type === "quarter") {
                texts = ["<b>Top of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length) + " inning</b>"];
            } else if (type === "overtime") {
                texts = ["<b>Top of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length) + " inning</b>"];
/*            } else if (type === "ft") {
                texts = ["{0} made a free throw"];
            } else if (type === "missFt") {
                texts = ["{0} missed a free throw"];
            } else if (type === "pf") {
                texts = ["Foul on {0}"];
            } else if (type === "foulOut") {
                texts = ["{0} fouled out"];
            } else if (type === "sub") {
                texts = ["Substitution: {0} for {1}"];*/
            }

			
            if (texts) {
                //text = random.choice(texts);
                text = texts[0];
                if (names) {
				//// see if you can add (lets get at least the play by play right
				//// then see about boxscore, why so off - maybe number system off? see why it jumps from 0-10 to the 40s, 150s
			/*		if (names.length>1) {
					for (i = 0; i < names.length; i++) {
							combinedName += names[i];
						}
						text = text.replace("{" + i + "}", combinedName);
//						text = text.replace("{" + i + "}", names);
						
					} else {*/
					
						for (i = 0; i < names.length; i++) {
							text = text.replace("{" + i + "}", names[i]);
						//	console.log("text: "+text +" i: "+i);
						}
				//	}
                }/* else {
					console.log("text: "+text);
				}*/
				
              /*  if (type === "ast") {
                    // Find most recent made shot, count assist for it
                    for (i = this.playByPlay.length - 1; i >= 0; i--) {
                        if (this.playByPlay[i].type === "text") {
                            this.playByPlay[i].text += " " + text;
                            break;
                        }
                    }
                } else {*/
                 /*   sec = Math.floor(this.t % 1 * 60);
                    if (sec < 10) {
                        sec = "0" + sec;
                    }*/
                    this.playByPlay.push({
                        type: "text",
                        text: text,
                        t: t,
//                        time: Math.floor(this.t) + ":" + sec
                        time: " "
                    });
                //}
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
	
//});
});
