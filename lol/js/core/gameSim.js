/**
 * @name core.gameSim
 * @namespace Individual game simulation.
 */
define(["lib/underscore", "util/helpers", "util/random", "globals"], function (_, helpers, random, g) {
    "use strict";

	
	var championsList = [[0,0,0,0,0],[0,0,0,0,0]];
	var outerTowerList = [[0,0,0],[0,0,0]];
	var innerTowerList = [[0,0,0],[0,0,0]];
	var inhibTowerList = [[0,0,0],[0,0,0]];
	var inhibList = [[0,0,0],[0,0,0]];
	var inhibRespawn = [[0,0,0],[0,0,0]];
	var inhibFirstTaken = [0,0];
	var nexusTowerList = [[0,0],[0,0]];			
	var nexusList = [0,0];
	var dragonList = [0,0];
	var dragonRespawn = 9999;
	var dragonBuff = [9999,9999]
	var baronList = [0,0];
	var baronRespawn = 9999;
	var baronBuff = [9999,9999]
	
	var teamBuff = [1,1];
	var playerBuff = [[1,1,1,1,1],[1,1,1,1,1]];
	var playerGoldBuff = [[1,1,1,1,1],[1,1,1,1,1]];
	
	var playerDeaths = [[0,0,0,0,0],[0,0,0,0,0]];
	var playerRespawn = [[9999,9999,9999,9999,9999],[9999,9999,9999,9999,9999]];
	
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
		var p, t,i,j;
	// console.log("got here");
        if (doPlayByPlay) {
            this.playByPlay = [];
        }

	//	console.log(1);
        this.id = gid;
        this.team = [team1, team2];  // If a team plays twice in a day, this needs to be a deep copy
		this.numPossession = 1; // keep track of loops
//        this.numPossessions = Math.round((this.team[0].pace + this.team[1].pace) / 2 * random.uniform(0.9, 1.1));
  //      this.dt = 48 / (2 * this.numPossessions); // Time elapsed per possession
		this.dt = Math.random()*100/4/1.2;
/*		console.log(this.dt);
		for (t = 0; t < 2; t++) {
            // Update minutes (overall, court, and bench)
		//	console.log(t+" "+this.team[t].player.length);
			for (p = 0; p < 5; p++) {
//				if (this.playersOnCourt[t].indexOf(p) >= 0) {
		            this.recordStat(t, p, "min", this.dt/.6);
                     this.recordStat(t, p, "gs");					
//				}
			}
		}*/
        // Starting lineups, which will be reset by updatePlayersOnCourt. This must be done because of injured players in the top 5.
        this.playersOnCourt = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]];
        this.startersRecorded = false;  // Used to track whether the *real* starters have been recorded or not.
      //  this.updatePlayersOnCourt();

        this.subsEveryN = 6;  // How many possessions to wait before doing substitutions

        this.overtimes = 0;  // Number of overtime periods that have taken place

//        this.t = 12; // Game clock, in minutes
        this.t = 0; // Game clock, in minutes
		//time should go up
		
		//champion = {Achelois,Achelous,Aeolus 
		
		//champion = {id: 0, name: players[i].name, 
		//championsList.push(champion)
		this.team[0].stat.ptsQtrs = [0,0,0,0,0,0,0,0];
		this.team[1].stat.ptsQtrs = [0,0,0,0,0,0,0,0];
		
		outerTowerList = [[0,0,0],[0,0,0]];
		innerTowerList = [[0,0,0],[0,0,0]];
		inhibTowerList = [[0,0,0],[0,0,0]];
		inhibList = [[0,0,0],[0,0,0]];
		inhibRespawn = [[0,0,0],[0,0,0]];	
		inhibFirstTaken = [0,0];		
	    nexusTowerList = [[0,0],[0,0]];		
		nexusList = [0,0];
		dragonList = [0,0];
		dragonRespawn = 9999;
	    dragonBuff = [9999,9999]
		baronList = [0,0];
		baronRespawn = 9999;
	    baronBuff = [9999,9999]
		championsList = [[0,0,0,0,0],[0,0,0,0,0]];
	
		teamBuff = [1,1];
		playerBuff = [[1,1,1,1,1],[1,1,1,1,1]];		
		playerGoldBuff = [[1,1,1,1,1],[1,1,1,1,1]];		
		playerDeaths = [[0,0,0,0,0],[0,0,0,0,0]];
		playerRespawn = [[9999,9999,9999,9999,9999],[9999,9999,9999,9999,9999]];
		
		this.updateTeamCompositeRatings();

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
        var factor, p, r, t,b,d,c;
		
		//// turn this into choosing Champions
		
		// console.log("got here");
		/*var j;
		console.log(this.team[0].player[0].name);
		console.log(this.team[0].player[0].champions[0].name);
		console.log(this.team[0].player[0].champions[0].draftValue);
		console.log(this.team[0].player[0].champRel[0].ratings.overall);
		for (j = 0; j < 125; j++) {		
			console.log(this.team[0].player[0].champRel[0].ratings.relative[j]);
		} */		

        // t = 0 is home, so they pick first
		
		var topChampion, topPlayer,topValue,  c,p;
		var topValueCompare;
		var oppt;
		var pp, pp2;
		var positionBonus,positionBonusDefense,ovrAdjustment,over50OVR;
		
		var blockedChampions = [ [],[]];
		var usedChampions = [ [],[]];
		var usedPlayer = [ [],[]];
	//	var topValue =  [ [],[]];
		var pick;
		/*console.log(this.team[0].player[0].championRank[0].role);
		console.log(this.team[0].player[0].championRank[0].champion);		
		console.log(this.team[0].player[0].championRank[0].rank);				*/
		

	//	console.log(g.numChampions);
		for (b = 0; b < 6; b++) {		    		
		
			if (b==0 || b==2 || b==4) {
				t = 1;
				oppt = 0;
			} else {
				t = 0;
				oppt = 1;
			}
			topPlayer = 0;
			topChampion = -1;

			//// user bans
			//console.log(this.team[t].player[0].ban);
			/*console.log(this.team[t].player[1].ban);
			console.log(this.team[t].player[2].ban);
			console.log(this.team[t].player[3].ban);
			console.log(this.team[t].player[4].ban);*/
		//	console.log(blockedChampions);
			if (typeof(this.team[t].player[0].ban) == 'undefined') {
			} else {
			
				////// First Round Of Bans
				if ((b == 0) && (this.team[t].player[0].ban>0)) {
				  topChampion = this.team[t].player[0].ban-1;
			//	  console.log(topChampion+" "+this.team[t].player[0].ban);
				} 
				
				if ((b == 1) && (this.team[t].player[0].ban>0)  ) {
				
				  if (( (this.team[t].player[0].ban-1) != blockedChampions[0][0]) &&  ( (this.team[t].player[0].ban-1) != blockedChampions[1][0]) ) {
					topChampion = this.team[t].player[0].ban-1;
				  } else if (( (this.team[t].player[1].ban-1) != blockedChampions[oppt][0]) &&  ( (this.team[t].player[1].ban-1) != blockedChampions[1][0])  && ((this.team[t].player[1].ban-1) >0)) {
					topChampion = this.team[t].player[1].ban-1;
				//  console.log(topChampion+" "+this.team[t].player[0].ban);
				  }
				} 
				////// Second Round Of Bans			
				if ((b == 2) && (this.team[t].player[1].ban>0) ) {
				
				  if ( ( (this.team[t].player[1].ban-1) != blockedChampions[0][0])  && ( (this.team[t].player[1].ban-1) != blockedChampions[1][0]) ) {
					topChampion = this.team[t].player[1].ban-1;
				  } else if ( ((this.team[t].player[2].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[2].ban-1) != blockedChampions[1][0])) {
					topChampion = this.team[t].player[2].ban-1;
				  } else if ( ((this.team[t].player[3].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[3].ban-1) != blockedChampions[1][0])) {
					topChampion = this.team[t].player[3].ban-1;
				  }
				  //console.log(topChampion+" "+this.team[t].player[0].ban);
				}
				if ((b == 3) && (this.team[t].player[1].ban>0) ) {
				
				  if ( ( (this.team[t].player[1].ban-1) != blockedChampions[0][0])  && ( (this.team[t].player[1].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[1].ban-1) != blockedChampions[oppt][1]) ) {
					topChampion = this.team[t].player[1].ban-1;
				  } else if ( ((this.team[t].player[2].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[2].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[2].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[2].ban-1) != blockedChampions[1][1])) {
					topChampion = this.team[t].player[2].ban-1;
				  } else if (( (this.team[t].player[3].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[3].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[3].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[3].ban-1) != blockedChampions[1][1])) {
					topChampion = this.team[t].player[3].ban-1;
				  } else if ( ((this.team[t].player[4].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[4].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[4].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[4].ban-1) != blockedChampions[1][1])) {
					topChampion = this.team[t].player[4].ban-1;
				  }
				  //console.log(topChampion+" "+this.team[t].player[0].ban);
				}			
				////// Third/Final Round Of Bans			
				if ((b == 4) && (this.team[t].player[2].ban>0) ) {
				
				  if ( ((this.team[t].player[2].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[2].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[2].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[2].ban-1) != blockedChampions[1][1]) && ( (this.team[t].player[2].ban-1) != blockedChampions[0][2]) && ( (this.team[t].player[2].ban-1) != blockedChampions[1][2])) {
					topChampion = this.team[t].player[2].ban-1;
				  } else if (( (this.team[t].player[3].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[3].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[3].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[3].ban-1) != blockedChampions[1][1]) && ( (this.team[t].player[3].ban-1) != blockedChampions[0][2]) && ( (this.team[t].player[3].ban-1) != blockedChampions[1][2])) {
					topChampion = this.team[t].player[3].ban-1;
				  } else if ( ((this.team[t].player[4].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[4].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[4].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[4].ban-1) != blockedChampions[1][1]) && ( (this.team[t].player[4].ban-1) != blockedChampions[0][2]) && ( (this.team[t].player[4].ban-1) != blockedChampions[1][2])) {
					topChampion = this.team[t].player[4].ban-1;
				  }
				}	
				
				if ((b == 5) && (this.team[t].player[2].ban>0) ) {
				
				  if ( ((this.team[t].player[2].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[2].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[2].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[2].ban-1) != blockedChampions[1][1]) && ( (this.team[t].player[2].ban-1) != blockedChampions[0][2]) && ( (this.team[t].player[2].ban-1) != blockedChampions[1][2]) ) {
					topChampion = this.team[t].player[2].ban-1;
				  } else if (( (this.team[t].player[3].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[3].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[3].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[3].ban-1) != blockedChampions[1][1]) && ( (this.team[t].player[3].ban-1) != blockedChampions[0][2]) && ( (this.team[t].player[3].ban-1) != blockedChampions[1][2])) {
					topChampion = this.team[t].player[3].ban-1;
				  } else if ( ((this.team[t].player[4].ban-1) != blockedChampions[0][0])   && ( (this.team[t].player[4].ban-1) != blockedChampions[1][0]) && ( (this.team[t].player[4].ban-1) != blockedChampions[0][1]) && ( (this.team[t].player[4].ban-1) != blockedChampions[1][1]) && ( (this.team[t].player[4].ban-1) != blockedChampions[0][2]) && ( (this.team[t].player[4].ban-1) != blockedChampions[1][2])) {
					topChampion = this.team[t].player[4].ban-1;
				  }
				}	
			
			}
			/////////// If champ not picked by GM, do normally champ banning process
			if (topChampion == -1) {
				///////// normal banning process
		//		for (p = 0; p < this.team[t].player.length; p++) {
				topValue = -200;
				for (p = 0; p < 5; p++) {		    		
				
					for (c = 0; c < this.team[0].player[0].champRel.length; c++) {		
						//console.log(this.team[t].player[p].champions[c].draftValue);
						
						if (c == blockedChampions[0][0] || c == blockedChampions[0][1] || c == blockedChampions[1][0] || c == blockedChampions[1][1] || c == blockedChampions[0][2] || c == blockedChampions[1][2]) {
						} else {
			//				topValueCompare = this.team[0].player[j].champions[i].draftValue * this.team[0].player[j].champRel[i].ratings.relative[r];
							topValueCompare = (this.team[t].player[p].champions[c].draftValue);
						
							if (topValueCompare > topValue) {
						//		console.log(topValue+" "+this.team[t].player[topPlayer].champions[topChampion].name+" "+topValueCompare+" "+this.team[t].player[p].champions[c].name);
							
							   // make it so top ban only done 50% of time so more a mix of top 10 spots
								if (Math.random() < .25) {
									topValue = topValueCompare;
									topPlayer = p;
									topChampion = c;
								}
							}												
						}
					} 			
				}	

			}
			
		//	console.log(b+" "+this.team[t].player[topPlayer].champions[topChampion].name+" "+topValue+" "+topPlayer);
			if (b < 2) {
				blockedChampions[t][0] = topChampion;
			} else if (b<4) {
				blockedChampions[t][1] = topChampion;
			} else {
				blockedChampions[t][2] = topChampion;
			}
		//    this.team[t].player[topPlayer].champUsed = this.team[t].player[topPlayer].champions[topChampion].name;
		 //   this.team[t].player[topPlayer].posPlayed = "Bot";		
//			this.recordPlay("ban", oppt, [this.team[t].player[topPlayer].champions[topChampion].name]);
			this.recordPlay("ban", t, [this.team[t].player[topPlayer].champions[topChampion].name]);
			
		
		}

		
		
		pp = -1;
		pp2 = -1;
		for (d = 0; d < 10; d++) {		    		
		

			if (d==0 || d==3  || d==4  || d==7  || d==8) {
				t = 1;
				oppt = 0;
				pp += 1;
			} else {
				t = 0;
				oppt = 1;
				pp2 +=1;
			}		
		
			topValue = 0;
			topPlayer = 0;
			topChampion = 0;
	//		for (p = 0; p < this.team[t].player.length; p++) {
			for (p = 0; p < 5; p++) {		    		
						
			    if (p == usedPlayer[t][0] || p == usedPlayer[t][1] || p == usedPlayer[t][2] || p == usedPlayer[t][3]) {
				} else {
			
			
					//// Normal Selection:
					
					for (c = 0; c < this.team[0].player[0].champRel.length; c++) {		
		//				topValueCompare = this.team[0].player[j].champions[i].draftValue * this.team[0].player[j].champRel[i].ratings.relative[r];
						if (c == blockedChampions[0][0] || c == blockedChampions[0][1] || c == blockedChampions[1][0] || c == blockedChampions[1][1] || c == blockedChampions[0][2] || c == blockedChampions[1][2]) {
						} else if (c == usedChampions[t][0] || c == usedChampions[t][1] || c == usedChampions[t][2] || c == usedChampions[t][3] || c == usedChampions[t][4]) {
						} else if (c == usedChampions[oppt][0] || c == usedChampions[oppt][1] || c == usedChampions[oppt][2] || c == usedChampions[oppt][3] || c == usedChampions[oppt][4]) {
						} else {

							topValueCompare = this.team[t].player[p].champions[c].draftValue;
							
							//// if User wants this pick, make the value very high so it gets chosen
						//	console.log(this.team[t].player[p].pick);
							if (typeof(this.team[t].player[p].pick) == 'undefined') {							
								pick = -100;
							} else {						
								pick = this.team[t].player[p].pick;
							}
							
							if (pick == (c+1)) {
								//console.log("GOT HERE "+ this.team[t].player[p].pick );

							  topValue = 1000;
							  topPlayer = p;
							  topChampion = c;
							  // console.log(this.team[t].player[topPlayer].champions[topChampion].name);
								if (t == 1) {
									usedChampions[t][pp] = topChampion;
									usedPlayer[t][pp] = p;
								} else {
									usedChampions[t][pp2] = topChampion;							
									usedPlayer[t][pp2] = p;									
								}							  
							} else {
							
								if (topValueCompare > topValue) {
							//	console.log(topValue+" "+this.team[t].player[topPlayer].champions[topChampion].name+" "+topValueCompare+" "+this.team[t].player[p].champions[c].name);
									// make it so top pick only used 50% of time
									if (Math.random() < .5) {
										topValue = topValueCompare;
										topPlayer = p;
										topChampion = c;
										if (t == 1) {
											usedChampions[t][pp] = topChampion;
											usedPlayer[t][pp] = p;
										} else {
											usedChampions[t][pp2] = topChampion;							
											usedPlayer[t][pp2] = p;									
										}
									}
								}
							}
						}
					}
					
					
					
					
					
				} 		

				
			}
			
		//	console.log(d+" FINAL: "+topValue+" "+this.team[t].player[topPlayer].champions[topChampion].name)
			this.team[t].player[topPlayer].champUsed = this.team[t].player[topPlayer].champions[topChampion].name;	
			if (topValue >= 1000) {
			   topValue = this.team[t].player[topPlayer].champions[topChampion].draftValue;
			}
		//	console.log(this.team[t].player[topPlayer].champions[topChampion].name);			   
		//	console.log(topValue);			   
			
			this.team[t].player[topPlayer].champValue = topValue;			
		   this.recordStat(t, topPlayer, "champPicked",this.team[t].player[topPlayer].champions[topChampion].name);

			
	
			this.recordPlay("champion", t, [this.team[t].player[topPlayer].userID,this.team[t].player[topPlayer].champions[topChampion].name]);
			
		//	console.log(this.team[0].player[0].champRel[0].name);
		//	console.log(this.team[0].player[0].champions[0].name);
			for (c = 0; c < this.team[0].player[0].champRel.length; c++) {		
			
			    if  (this.team[t].player[topPlayer].champions[topChampion].name == this.team[t].player[topPlayer].champRel[c].name) {
					//console.log(topValue);
					//console.log(this.team[t].player[topPlayer].champRel[c].ratings.attack);
					
/*			   this.team[t].player[topPlayer].champions[topChampion].attack = this.team[t].player[topPlayer].champRel[c].ratings.attack+topValue/4-45;
			   this.team[t].player[topPlayer].champions[topChampion].defense = this.team[t].player[topPlayer].champRel[c].ratings.defense+topValue/4-45;
			   this.team[t].player[topPlayer].champions[topChampion].ability = this.team[t].player[topPlayer].champRel[c].ratings.ability+topValue/4-45;*/
			/*   console.log(this.team[t].player[topPlayer].pos);
			   console.log(this.team[t].player[topPlayer].ovr);	*/
			   positionBonus = 0.00;
			   positionBonusDefense = 0.00;			   
/*				if (this.team[t].player[topPlayer].pos == 'MID') {
				  positionBonus = 40;
				} else if (this.team[t].player[topPlayer].pos == 'ADC') {
				  positionBonus = 60;
				} else if (this.team[t].player[topPlayer].pos == 'TOP') {
				  positionBonus = 20;
				} else if (this.team[t].player[topPlayer].pos == 'JGL') {
				  positionBonus = 10;
				} else if (this.team[t].player[topPlayer].pos == 'SUP') {
				  positionBonus = -10;
				}*/
			//	console.log(topPlayer);
				if (topPlayer == 2) {
				  positionBonus = 15;
				} else if (topPlayer == 3) {
				  positionBonus = 10;
				} else if (topPlayer == 0) {
				  positionBonus = 0;
				} else if (topPlayer == 1) {
				  positionBonus = -20;
				} else if (topPlayer == 4) {
				  positionBonus = -100;
				}				
				if (topPlayer == 2) {
				  positionBonusDefense = 0;
				} else if (topPlayer == 3) {
				  positionBonusDefense = 0;
				} else if (topPlayer == 0) {
//				  positionBonusDefense = 40;
//				  positionBonusDefense = 35;
				  positionBonusDefense = 0;
				} else if (topPlayer == 1) {
//				  positionBonusDefense = 30;
				  positionBonusDefense = -15;
				} else if (topPlayer == 4) {
				  positionBonusDefense = -20;
				}		
				if (topPlayer == 2) {
				  ovrAdjustment = 1.0;
				} else if (topPlayer == 3) {
				  ovrAdjustment = 2.0;
				} else if (topPlayer == 0) {
//				  positionBonusDefense = 40;
				  ovrAdjustment = 3.0;
				} else if (topPlayer == 1) {
//				  positionBonusDefense = 30;
				  ovrAdjustment = 0.5;
				} else if (topPlayer == 4) {
				  ovrAdjustment = 1.0;
				}					
			   			   
				if (this.team[t].player[topPlayer].ovr>50) {
					over50OVR = this.team[t].player[topPlayer].ovr-50;
				} else {
					over50OVR = 0;
				}
			   
			    this.team[t].player[topPlayer].champRel[c].ratings.attack *= .1;
			   this.team[t].player[topPlayer].champRel[c].ratings.defense *= .1;
			   this.team[t].player[topPlayer].champRel[c].ratings.ability *= .1;
				   
				   var combinedSkills;
				   var champWeight,ovrWeight;
				   
				   
				   champWeight = 4.00;  // 4 means about 10 (best to worst) // 1 means 50
				   ovrWeight = 4.0;  // 4 means about 150 best to worst   // 6 means 100
//				   champWeight = 4.00;  // 4 means about 10 (best to worst) // 1 means 50
//				   ovrWeight = 4.00;  // 4 means about 150 best to worst   // 6 means 100
//				   champWeight = 1.00;  // 4 means about 10 (best to worst) // 1 means 50
//				   ovrWeight = 6.00;  // 4 means about 150 best to worst   // 6 means 100
				   //champWeight = 2;
				   
					this.team[t].player[topPlayer].champRel[c].ratings.attack += ((topValue/4-45)/champWeight+(this.team[t].player[topPlayer].compositeRating.championKilling+this.team[t].player[topPlayer].ovr-50)/4*ovrWeight+positionBonus)/5;
				   this.team[t].player[topPlayer].champRel[c].ratings.defense +=  ((topValue/4-45)/champWeight+(this.team[t].player[topPlayer].compositeRating.jungleControl*1.5+this.team[t].player[topPlayer].compositeRating.minionControl*1.5+this.team[t].player[topPlayer].compositeRating.teamwork*.5+this.team[t].player[topPlayer].compositeRating.toweringAttack*.5)/4*4/ovrWeight+(this.team[t].player[topPlayer].ovr-50)/ovrWeight*4+positionBonusDefense)/5;
				   this.team[t].player[topPlayer].champRel[c].ratings.ability += ((topValue/4-45)/champWeight+(this.team[t].player[topPlayer].ovr*2-50)/4*ovrWeight)/4;			   

			   
			   
			   if (this.team[t].player[topPlayer].champRel[c].ratings.attack<1) {
					this.team[t].player[topPlayer].champRel[c].ratings.attack = 1;
			   }
			   if (this.team[t].player[topPlayer].champRel[c].ratings.defense<1) {
					this.team[t].player[topPlayer].champRel[c].ratings.defense = 1;
			   }
			   if (this.team[t].player[topPlayer].champRel[c].ratings.ability<1) {
					this.team[t].player[topPlayer].champRel[c].ratings.ability = 1;
			   }	
			   if (this.team[t].player[topPlayer].champRel[c].ratings.attack>1000) {
					this.team[t].player[topPlayer].champRel[c].ratings.attack = 1000;
			   }
			   if (this.team[t].player[topPlayer].champRel[c].ratings.defense>1000) {
					this.team[t].player[topPlayer].champRel[c].ratings.defense = 1000;
			   }
			   if (this.team[t].player[topPlayer].champRel[c].ratings.ability>1000) {
					this.team[t].player[topPlayer].champRel[c].ratings.ability = 1000;
			   }					   
/*				if (topPlayer == 2) {
				  ovrAdjustment = 1.0;
					this.team[t].player[topPlayer].champRel[c].ratings.attack = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.defense = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.ability = this.team[t].player[topPlayer].ovr;			   
				} else if (topPlayer == 3) {
				  ovrAdjustment = 2.0;
					this.team[t].player[topPlayer].champRel[c].ratings.attack = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.defense = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.ability = this.team[t].player[topPlayer].ovr;			   
				} else if (topPlayer == 0) {
//				  positionBonusDefense = 40;
					this.team[t].player[topPlayer].champRel[c].ratings.attack = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.defense = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.ability = this.team[t].player[topPlayer].ovr;			   
`				} else if (topPlayer == 1) {
//				  positionBonusDefense = 30;
					this.team[t].player[topPlayer].champRel[c].ratings.attack = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.defense = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.ability = this.team[t].player[topPlayer].ovr;			   
				} else if (topPlayer == 4) {
					this.team[t].player[topPlayer].champRel[c].ratings.attack = this.team[t].player[topPlayer].ovr;
				   this.team[t].player[topPlayer].champRel[c].ratings.defense = 1000;
				   this.team[t].player[topPlayer].champRel[c].ratings.ability = this.team[t].player[topPlayer].ovr;			   
				}	*/
				
				}
			}
			championsList[t][topPlayer] = topChampion;
			
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
	//	console.log(3);
        // Simulate the game up to the end of regulation
	// console.log("got here");	
		// loop until nexus found
        this.simPossessions();

		//after game ends
		
		
  

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
        var i,j, t,p,outcome, substitutions,goldTime,iO;
	//	console.log(4);
        this.o = 0;
        this.d = 1;
// console.log("got here");
		
		goldTime = 475/1000;
	   for (i = 0; i < 2; i++) {	       
			iO =  (i-1)*(i-1);  	   
			for (j = 0; j < 5; j++) {
		//			goldTime = this.dt*7/5*100;
		//			console.log(this.dt+" "+goldTime);
					this.recordStat(i, j, "trb",goldTime);		
					this.recordStat(iO, j, "stl",goldTime);					  
			}
		}			
		
        i = 0;
		outcome = "";
		
		
		
        while (outcome != "nexus") {
		
		
            // Keep track of quarters
        /*    if ((i * this.dt > 12 && this.team[0].stat.ptsQtrs.length === 1) ||
                    (i * this.dt > 24 && this.team[0].stat.ptsQtrs.length === 2) ||
                    (i * this.dt > 36 && this.team[0].stat.ptsQtrs.length === 3)) {
                this.team[0].stat.ptsQtrs.push(0);
                this.team[1].stat.ptsQtrs.push(0);
                this.t = 12;
                this.recordPlay("quarter");
            }*/

            // Clock (should move up)
			if (outcome == "done") {
				this.dt = Math.random()/10+.02; // range 0.02 to .12 // don't do creep score
				this.done = true;
			} else {
			//	this.recordPlay("time", t, []);									
//				this.dt = (Math.random()+.5)/3;	 // range .5/3 to 1.5/3 or .16 or .5				
//				this.dt = .33;	 // range .5/3 to 1.5/3 or .16 or .5				
//				this.dt = .16;	 // range .5/3 to 1.5/3 or .16 or .5				
				this.dt = .08;	 // range .5/3 to 1.5/3 or .16 or .5				
				this.done = false;				
			}
//console.log(this.dt+" "+outcome);			
//			this.dt = (Math.random()+.5)/30;											
			/*if ( (this.team[0].stat.fg+this.team[1].stat.fg) < 5) {
				this.dt = (Math.random()+.5)/3;								
			} else if ( (this.team[0].stat.fg+this.team[1].stat.fg) < 10) {
				this.dt = (Math.random()+.5)/4;								
			} else if ( (this.team[0].stat.fg+this.team[1].stat.fg) < 15) {
				this.dt = (Math.random()+.5)/5;								
			} else if ( (this.team[0].stat.fg+this.team[1].stat.fg) < 20) {
				this.dt = (Math.random()+.5)/6;								
			} else  {
				this.dt = (Math.random()+.5)/10;											
			}*/
			/*if (this.t < 1000) {
				this.dt = (Math.random()+.5)/3;				
			} else {
				this.dt = .75-((this.t-10)-(this.team[0].stat.fg+this.team[1].stat.fg-2))/20;				
				if (this.dt < .1) {
					this.dt = .1;
				} else if (this.dt>1) {
					this.dt = 1;				
				}
			}*/
            this.t += this.dt;
		//	console.log(this.t+" "+this.dt+" "+this.team[0].stat.fg+" "+this.team[1].stat.fg+" "+this.team[0].stat.pf+" "+this.team[1].stat.pf);
			
	//		console.log(this.t+" "+this.dt);
            if (this.t < 0) {
                this.t = 0;
            }

			for (t = 0; t < 2; t++) {
				// Update minutes (overall, court, and bench)
			//	console.log(t+" "+this.team[t].player.length);
				for (p = 0; p < 5; p++) {
	//				if (this.playersOnCourt[t].indexOf(p) >= 0) {
						this.recordStat(t, p, "min", this.dt);
						 this.recordStat(t, p, "gs");					
	//				}
				}
			}			
            // Possession change
      /*      this.o = (this.o === 1) ? 0 : 1;
            this.d = (this.o === 1) ? 0 : 1;*/

         //   this.updateTeamCompositeRatings();

            outcome = this.simPossession();

            // Swap o and d so that o will get another possession when they are swapped again at the beginning of the loop.
       /*     if (outcome === "orb") {
                this.o = (this.o === 1) ? 0 : 1;
                this.d = (this.o === 1) ? 0 : 1;
            }*/
			

		//	outcome = "nexus";
			/*if (outcome = "nexus") {
			   break;
			}*/

          //  this.updatePlayingTime();


/*
            if (i % this.subsEveryN === 0) {
                substitutions = this.updatePlayersOnCourt();
                if (substitutions) {
                    this.updateSynergy();
                }
            } */

            i += 1;
        }
    //     this.injuries();		
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

        substitutions = false;
// console.log("got here");
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
              /*          if (this.playByPlay !== undefined) {
                            this.playByPlay.push({
                                type: "sub",
                                t: t,
                                on: this.team[t].player[b].id,
                                off: this.team[t].player[p].id
                            });
                        }*/

                        // It's only a "substitution" if it's not the starting lineup
                        if (this.startersRecorded) {
            //                this.recordPlay("sub", t, [this.team[t].player[b].name, this.team[t].player[p].name]);
                        }
                        break;
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
               //         this.recordStat(t, p, "gs");
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
        var i, p, perimFactor, skillsCount, t;

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
        var i, j, p, rating, t, toUpdate,toUpdateMax,toUpdateJungle;
// console.log("got here");
        // Only update ones that are actually used
        toUpdate = ["wardDestruction", "wardPlacement", "mapVision", "adaptability", "teamwork", "aggression", "laneSwitching"];
        toUpdateMax = ["shotcalling"];
        toUpdateJungle = ["gank"];

        for (t = 0; t < 2; t++) {
            for (j = 0; j < toUpdate.length; j++) {
                rating = toUpdate[j];
                this.team[t].compositeRating[rating] = 0;

                for (i = 0; i < 5; i++) {
                    p = this.playersOnCourt[t][i];
                    this.team[t].compositeRating[rating] += this.team[t].player[p].compositeRating[rating];
                }

                this.team[t].compositeRating[rating] = this.team[t].compositeRating[rating] / 5;
            }
            for (j = 0; j < toUpdateJungle.length; j++) {
                rating = toUpdateJungle[j];
                this.team[t].compositeRating[rating] = 0;

                p = this.playersOnCourt[t][1];
				this.team[t].compositeRating[rating] = this.team[t].player[p].compositeRating[rating];
            }
			
            for (j = 0; j < toUpdateMax.length; j++) {
                rating = toUpdateMax[j];
                this.team[t].compositeRating[rating] = 0;

                for (i = 0; i < 5; i++) {
                    p = this.playersOnCourt[t][i];
					if (this.team[t].compositeRating[rating] < this.team[t].player[p].compositeRating[rating]) {
						this.team[t].compositeRating[rating] = this.team[t].player[p].compositeRating[rating];
					}
                }
            }			
        /*    this.team[t].compositeRating.dribbling += this.synergyFactor * this.team[t].synergy.off;
            this.team[t].compositeRating.passing += this.synergyFactor * this.team[t].synergy.off;
            this.team[t].compositeRating.rebounding += this.synergyFactor * this.team[t].synergy.reb;
            this.team[t].compositeRating.defense += this.synergyFactor * this.team[t].synergy.def;
            this.team[t].compositeRating.defensePerimeter += this.synergyFactor * this.team[t].synergy.def;
            this.team[t].compositeRating.blocking += this.synergyFactor * this.team[t].synergy.def;*/
        }
	//	console.log(this.team[0].compositeRating.gank);
	//	console.log(this.team[1].compositeRating.gank);		
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
// console.log("got here");
        for (t = 0; t < 2; t++) {
            // Update minutes (overall, court, and bench)
            for (p = 0; p < this.team[t].player.length; p++) {
                if (this.playersOnCourt[t].indexOf(p) >= 0) {
        //            this.recordStat(t, p, "min", this.dt);
        //            this.recordStat(t, p, "courtTime", this.dt);
                    // This used to be 0.04. Increase more to lower PT
         //           this.recordStat(t, p, "energy", -this.dt * 0.06 * (1 - this.team[t].player[p].compositeRating.endurance));
                    if (this.team[t].player[p].stat.energy < 0) {
                        this.team[t].player[p].stat.energy = 0;
                    }
                } else {
        //            this.recordStat(t, p, "benchTime", this.dt);
        //            this.recordStat(t, p, "energy", this.dt * 0.1);
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
// console.log("got here");
        for (t = 0; t < 2; t++) {
            for (p = 0; p < this.team[t].player.length; p++) {
                // Only players on the court can be injured
                if (this.playersOnCourt[t].indexOf(p) >= 0) {
                    // According to data/injuries.ods, 0.25 injuries occur every game. Divided over 10 players and ~200 possessions, that means each player on the court has P = 0.25 / 10 / 200 = 0.000125 probability of being injured this play.
                    if (Math.random() < 0.000125) {
                        this.team[t].player[p].injured = true;
                        newInjury = true;
              //          this.recordPlay("injury", t, [this.team[t].player[p].name]);
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
        var outcome,p,pD,t,tD,i,iO,j,groupType,groupNumber,groupNumberD,timeOne,timeTwo,timeThree,timeFour,creeps,creepOdds,creepOddsOpp,groupBuff,groupGoldBuff,goldTime,goldKD;
		var groupAttack,groupDefense,groupAbility;
		var killed,killer,assisted,assisted2,assisted3,assisted4, killerRating;
		var championAdjustment;
		var rangeBot, rangeTop;
		var times;
		var pFind;
		var pAlt = [0,0,0,0,0];
		var teamBuffAdj;
		var groupBuffAdj
		var groupGoldBuff;
		
		var groupBuffAdjraw = [1.00,1.00];
		var groupGoldBuffraw = [1.00,1.00];
		

		///// take out certain var to see value
		var withoutTP;
		var withoutSC;
		var withouTW;
		var withoutCS;
		var withoutJC;
		var withoutCK;
		
		
	// console.log("got here");	
		p = [-1,-1,-1,-1,-1];
		pD = [-1,-1,-1,-1,-1];		
		
	//	p = [[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1];
	//	groupNumber = [0,0];
	//	pD = [-1,-1,-1,-1,-1];
		groupAttack = [0,0];
		groupDefense = [0,0];
		groupAbility = [0,0];
		//console.log(10);
        // Turnover?
    /*    if (this.probTov() > Math.random()) {
            return this.doTov();  // tov
        }*/
        
/*	var outerTowerList = [[0,0,0],[0,0,0]];
	var innerTowerList = [[0,0,0],[0,0,0]];
	var inhibTowerList = [[0,0,0],[0,0,0]];
	var inhibList = [[0,0,0],[0,0,0]];
	var nexusTowerList = [[0,0,0],[0,0,0]];
	var nexusList = [0,0];
	var dragonList = [0,0];
	var baronList = [0,0];*/

		outcome = "notNexus";	
		
		// make CS less relative and more absolute (then raise)
		// do champion KDA
		// bring player/champ specific data
		// update league stat and player stat pages (see if they want any other stats
		

		if (this.t <5) {
			timeOne = .95;
			timeTwo = .05;
			timeThree = 0;
			timeFour = 0;
		} else if (this.t <10) {
	/*		timeOne = .6;
			timeTwo = .3;
			timeThree = .09;
			timeFour = .01;*/
			timeOne = .5;
			timeTwo = .4;
			timeThree = .09;
			timeFour = .01;
		} else if (this.t <20) {
			timeOne = .3;
			timeTwo = .3;
//			timeTwo = .2;
			timeThree = .3;
			timeFour = .1;
		} else if (this.t <30) {
			timeOne = .1;
//			timeTwo = .3;
			timeTwo = .2;
			timeThree = .4;
//			timeThree = .5;
			timeFour = .3;
		} else  {
			timeOne = .00;
			timeTwo = .05;
			timeThree = .2;
			timeFour = .75;
		}		


		 ///////////////  Pick Team

		if (this.done == true) {
			if (Math.random() < .75) {
				t = this.turn;
			} else {
				t = (this.turn-1)*(this.turn-1);				
			}
			tD = (t-1)*(t-1);
			
		} else {
//		if (Math.random() < .50) {
			if (this.turn == 1) {
			   t = 0;
			   tD = 1;
			   this.turn = 0;
			 } else {
			   t = 1;		   
			   tD = 0;
			   this.turn = 1;		   
			}
		}
		//console.log(this.turn+" "+this.done);
		//////////////// Penalty for wrong position
		if (this.t < .50) {
		//	console.log(this.t);
		   for (i = 0; i < 2; i++) {	       
			//	iO =  (i-1)*(i-1);  	   
				for (j = 0; j < 5; j++) {
				
				  if (j==0) {
					if (this.team[i].player[j].pos == "TOP") {					
					} else {
					  playerBuff[i][j] /= 2.0;
					}
				  }
				  if (j==1) {
					if (this.team[i].player[j].pos == "JGL") {					
					} else {
					  playerBuff[i][j] /= 2.0;
					}
				  }
				  if (j==2) {
					if (this.team[i].player[j].pos == "MID") {					
					} else {
					  playerBuff[i][j] /= 2.0;
					}
				  }

				  if (j==3) {
					if (this.team[i].player[j].pos == "ADC") {					
					} else {
					  playerBuff[i][j] /= 2.0;
					}
				  }
				  if (j==4) {
					if (this.team[i].player[j].pos == "SUP") {					
					} else {
					  playerBuff[i][j] /= 2.0;
					}
				  }
				  
				//console.log(this.team[i].player[j].pos);
			//this.team[j].player[i]
				}
			}
		}
		///////////////// basic gold 
		if (this.t > (.90)) { 
			goldTime = Math.round(this.dt*7/5*100)/1000; //Math.round(
	//		console.log(this.dt+" "+goldTime);
		   for (i = 0; i < 2; i++) {	       
				iO =  (i-1)*(i-1);  	   
				for (j = 0; j < 5; j++) {
			//			goldTime = this.dt*7/5*100;
			//			console.log(this.dt+" "+goldTime);
						this.recordStat(i, j, "trb",goldTime);		
						this.recordStat(iO, j, "stl",goldTime);		
						//playerBuff[i][j] *= (1+(goldTime/5));
					//	playerGoldBuff[i][j] *= (1+(goldTime/5));						
						playerGoldBuff[i][j] *= (1+(goldTime/playerGoldBuff[i][j] ));							
						/*this.team[j].player[i].champRel[championsList[j][i]].ratings.attack *= (1+(goldTime/5));	
						this.team[j].player[i].champRel[championsList[j][i]].ratings.defense *= (1+(goldTime/5));	
						this.team[j].player[i].champRel[championsList[j][i]].ratings.ability *= (1+(goldTime/5));	*/

						
				}
			}				
		}
		///////////////////   Pick Player
		
		//// see if composites work
		//// create composites for every type of play and use for each team
	/*	console.log(this.team[0].player[0].compositeRating.toweringAttack);
		console.log(this.team[0].player[1].compositeRating.toweringAttack);
		console.log(this.team[0].player[2].compositeRating.toweringAttack);
		console.log(this.team[0].player[3].compositeRating.toweringAttack);
		console.log(this.team[0].player[4].compositeRating.toweringAttack);
		console.log(this.team[1].player[0].compositeRating.toweringAttack);
		console.log(this.team[1].player[1].compositeRating.toweringAttack);
		console.log(this.team[1].player[2].compositeRating.toweringAttack);
		console.log(this.team[1].player[3].compositeRating.toweringAttack);
		console.log(this.team[1].player[4].compositeRating.toweringAttack);		


		console.log(this.team[0].player[0].champRel[0].name);
		console.log(this.team[0].player[0].champRel[0].ratings.attack);
		console.log(this.team[0].player[0].champRel[0].ratings.defense);
		console.log(this.team[0].player[0].champRel[0].ratings.ability);*/
		
		
		///// available players
		
	// console.log("got here");	
		// group type     0 top lane, 1 top jungle, 2 mid lane, 3 bot jungle, 4 bot lane								
		// early phase
		if (Math.random() < timeOne) {
			groupNumber = 1;

			 if (Math.random() < 1/6) {
				p[0] = 0;
				groupType = 0;
								
//			 } else if (Math.random() < 1/3) {
			 } else if (Math.random() < 1/5) {
			   p[0] = 1;
				groupType = 1;
				
			 } else if (Math.random() < 1/4) {
			   p[0] = 2;		   
				groupType = 2;
				
			 } else if (Math.random() < 1/3) {
			   p[0] = 3;		   
				groupType = 4;
				
			 } else if (Math.random() < 1/2) {
			   p[0] = 3;		   
			   p[1] = 4;		  			   
				groupType = 4;
			   groupNumber = 2;
				
			 } else  {
			   p[0] = 4;		   
				groupType = 4;
				
			 }
		} else if (Math.random() < (timeOne+timeTwo)) { // early/mid phase, ganking
			groupNumber = 2;
		
			 if (Math.random() < 1/8) {
//			 if (Math.random() < 1/5) {
			   p[0] = 0;		   
			   p[1] = 1;		   		   
				groupType = .5;			   
				
			 } else if (Math.random() < 1/7) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 2;		   
			   p[1] = 1;		   		   
				groupType = 1.5;			   
			 } else if (Math.random() < 1/6) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 0;		   
			   p[1] = 2;		   		   
				groupType = 1;			   
			 } else if (Math.random() < 1/5) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 0;		   
			   p[1] = 4;		   		   
				groupType = 2;			   
			 } else if (Math.random() < 1/4) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 1;		   
			   p[1] = 4;		   		   
				groupType = 2.5;			   
			 } else if (Math.random() < 1/3) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 2;		   
			   p[1] = 4;		   		   
				groupType = 3;			   
			 } else if (Math.random() < 1/2) {
			   p[0] = 2;		   
			   p[1] = 3;		   		   
			   p[2] = 4;		   		   
				groupType = 3;			   
				groupNumber = 3;				
				
			 } else  {
			   p[0] = 1;		   
			   p[1] = 3;		   		   
			   p[2] = 4;		   		   
				groupType = 3;			   
				groupNumber = 3;
				
			 }
		 } else if (Math.random() < (timeOne+timeTwo+timeThree)) { // mid/late phase, small teams
			 if (Math.random() < 1/6) {
			   p[0] = 0;		   
			   p[1] = 1;		   		   
			   p[2] = 2;		   		   
				groupType = 1;			   
 			groupNumber = 3;
			} else if (Math.random() < 1/5) {
			   p[0] = 0;		   
			   p[1] = 1;		   		   
			   p[2] = 4;		   		   
				groupType = 2.5;			   
 			groupNumber = 3;
			   
			} else if (Math.random() < 1/4) {
			   p[0] = 0;		   
			   p[1] = 2;		   		   
			   p[2] = 4;		   		   
				groupType = 2;			   
 			groupNumber = 3;
			} else if (Math.random() < 1/3) {
			   p[0] = 0;		   
			   p[1] = 3;		   		   
			   p[2] = 4;		   		   
				groupType = 2.3;			   
 			groupNumber = 3;
			   
			 } else if (Math.random() < 1/2) {
			   p[0] = 1;		   
			   p[1] = 2;		   		   
			   p[2] = 3;		   		   
			   p[3] = 4;		   
				groupType = 2.75;			   			   
 			groupNumber = 4;
				
			 } else {
			   p[0] = 0;		   
			   p[1] = 2;		   		   
			   p[2] = 3;		   		   
			   p[3] = 4;		   
				groupType = 2;			   			   
 			groupNumber = 4;
				
			 }
//		 } else if (Math.random() < timeFour) { // late phase, small teams
		 } else  { // late phase, small teams
			   p[0] = 0;		   
			   p[1] = 1;		   		   
			   p[2] = 2;		   		   
			   p[3] = 3;		   		   
			   p[4] = 4;		   		   			 
				groupType = 2;			   			   
				groupNumber = 5;			   
		 }
		 
		 if (groupNumber == 1) {
			groupBuff = playerBuff[t][p[0]]/playerBuff[tD][p[0]];
			groupGoldBuff = playerGoldBuff[t][p[0]]/playerGoldBuff[tD][p[0]];
		
			groupBuffAdjraw[t] = playerBuff[t][p[0]];
			groupGoldBuffraw[t] = playerGoldBuff[t][p[0]];
			groupBuffAdjraw[tD] = playerBuff[tD][p[0]];
			groupGoldBuffraw[tD] = playerGoldBuff[tD][p[0]];
		 } else if (groupNumber == 2) {
			groupBuff = (playerBuff[t][p[0]]/playerBuff[tD][p[0]])*(playerBuff[t][p[1]]/playerBuff[tD][p[1]]);
			groupGoldBuff = (playerGoldBuff[t][p[0]]/playerGoldBuff[tD][p[0]])*(playerGoldBuff[t][p[1]]/playerGoldBuff[tD][p[1]]);
			
			groupBuffAdjraw[t] = playerBuff[t][p[0]]+playerBuff[t][p[1]];
			groupGoldBuffraw[t] = playerGoldBuff[t][p[0]]+playerGoldBuff[t][p[1]];
			groupBuffAdjraw[tD] = playerBuff[tD][p[0]]+playerBuff[tD][p[1]];
			groupGoldBuffraw[tD] = playerGoldBuff[tD][p[0]]+playerGoldBuff[tD][p[1]];
		} else if (groupNumber == 3) {
			groupBuff = (playerBuff[t][p[0]]/playerBuff[tD][p[0]])*(playerBuff[t][p[1]]/playerBuff[tD][p[1]])*(playerBuff[t][p[2]]/playerBuff[tD][p[2]]);
			groupGoldBuff = (playerGoldBuff[t][p[0]]/playerGoldBuff[tD][p[0]])*(playerGoldBuff[t][p[1]]/playerGoldBuff[tD][p[1]])*(playerGoldBuff[t][p[2]]/playerGoldBuff[tD][p[2]]);

			groupBuffAdjraw[t] = playerBuff[t][p[0]]+playerBuff[t][p[1]]+playerBuff[t][p[2]];
			groupGoldBuffraw[t] = playerGoldBuff[t][p[0]]+playerGoldBuff[t][p[1]]+playerGoldBuff[t][p[2]];
			groupBuffAdjraw[tD] = playerBuff[tD][p[0]]+playerBuff[tD][p[1]]+playerBuff[tD][p[2]];
			groupGoldBuffraw[tD] = playerGoldBuff[tD][p[0]]+playerGoldBuff[tD][p[1]]+playerGoldBuff[tD][p[2]];
			
		} else if (groupNumber == 4) {		 
			groupBuff = (playerBuff[t][p[0]]/playerBuff[tD][p[0]])*(playerBuff[t][p[1]]/playerBuff[tD][p[1]])*(playerBuff[t][p[2]]/playerBuff[tD][p[2]])*(playerBuff[t][p[3]]/playerBuff[tD][p[3]]);
			groupGoldBuff = (playerGoldBuff[t][p[0]]/playerGoldBuff[tD][p[0]])*(playerGoldBuff[t][p[1]]/playerGoldBuff[tD][p[1]])*(playerGoldBuff[t][p[2]]/playerGoldBuff[tD][p[2]])*(playerGoldBuff[t][p[3]]/playerGoldBuff[tD][p[3]]);

			groupBuffAdjraw[t] = playerBuff[t][p[0]]+playerBuff[t][p[1]]+playerBuff[t][p[2]]+playerBuff[t][p[3]];
			groupGoldBuffraw[t] = playerGoldBuff[t][p[0]]+playerGoldBuff[t][p[1]]+playerGoldBuff[t][p[2]]+playerGoldBuff[t][p[3]];
			groupBuffAdjraw[tD] = playerBuff[tD][p[0]]+playerBuff[tD][p[1]]+playerBuff[tD][p[2]]+playerBuff[tD][p[3]];
			groupGoldBuffraw[tD] = playerGoldBuff[tD][p[0]]+playerGoldBuff[tD][p[1]]+playerGoldBuff[tD][p[2]]+playerGoldBuff[tD][p[3]];
			
		 } else if (groupNumber == 5) {			 
			groupBuff = (playerBuff[t][p[0]]/playerBuff[tD][p[0]])*(playerBuff[t][p[1]]/playerBuff[tD][p[1]])*(playerBuff[t][p[2]]/playerBuff[tD][p[2]])*(playerBuff[t][p[3]]/playerBuff[tD][p[3]])*(playerBuff[t][p[4]]/playerBuff[tD][p[4]]);
			groupGoldBuff = (playerGoldBuff[t][p[0]]/playerGoldBuff[tD][p[0]])*(playerGoldBuff[t][p[1]]/playerGoldBuff[tD][p[1]])*(playerGoldBuff[t][p[2]]/playerGoldBuff[tD][p[2]])*(playerGoldBuff[t][p[3]]/playerGoldBuff[tD][p[3]])*(playerGoldBuff[t][p[4]]/playerGoldBuff[tD][p[4]]);
		 
			groupBuffAdjraw[t] = playerBuff[t][p[0]]+playerBuff[t][p[1]]+playerBuff[t][p[2]]+playerBuff[t][p[3]]+playerBuff[t][p[4]];
			groupGoldBuffraw[t] = playerGoldBuff[t][p[0]]+playerGoldBuff[t][p[1]]+playerGoldBuff[t][p[2]]+playerGoldBuff[t][p[3]]+playerGoldBuff[t][p[4]];
			groupBuffAdjraw[tD] = playerBuff[tD][p[0]]+playerBuff[tD][p[1]]+playerBuff[tD][p[2]]+playerBuff[tD][p[3]]+playerBuff[tD][p[4]];
			groupGoldBuffraw[tD] = playerGoldBuff[tD][p[0]]+playerGoldBuff[tD][p[1]]+playerGoldBuff[tD][p[2]]+playerGoldBuff[tD][p[3]]+playerGoldBuff[tD][p[4]];
		 }
		 
		 
		// buffs, perm and temp		
        for (i = 0; i < 2; i++) {
			if ( ((this.t-dragonBuff[i]) > 3.00) ) {
						dragonBuff[i] = 9999;		
						teamBuff[i] /= 1.40;
			}			
			if ( ((this.t-baronBuff[i]) > 3.00) ) {
						baronBuff[i] = 9999;		
						teamBuff[i] /= 1.50;
			}			
			for (j = 0; j < 5; j++) {
				if (this.t-playerRespawn[i][j] > 1.50 ) {
				  playerRespawn[i][j] = 9999;
				  playerDeaths[i][j] = 0;
				  
				} 
			//	playerBuff[t][i] *= [[1,1,1,1,1],[1,1,1,1,1]];		
			}
		}
				 
	//	 console.log(groupNumber+ " "+groupType+" "+p);
	//	 if (this.t<5) {
			//	console.log("time: "+ this.t+" team: "+t);
		//	for (i = 0; i < 5; i++) {
//			for (i = 0; i < 5; i++) {

		//		console.log(this.t+" 0 "+playerBuff[0][0]+" 1 "+playerBuff[0][1]+" 2 "+playerBuff[0][2]+" 3 "+playerBuff[0][3]+"  4 "+playerBuff[0][4]);
				
			//	console.log(i+" "+playerBuff[t][i]);
	//		}
	//	}
		//	 console.log(groupType+" "+groupNumber+" "+groupBuff);
		 //// remove players who are dead?
	//var playerDeaths = [[0,0,0,0,0],[0,0,0,0,0]];
	//var playerRespawn = [[9999,9999,9999,9999,9999],[9999,9999,9999,9999,9999]];
		pFind = 0;
		teamBuffAdj = [5,5];
        for (j = 0; j < 2; j++) {		
//			for (i = 0; i < groupNumber; i++) {
			for (i = 0; i < 5; i++) {
			   if (playerDeaths[j][i] == 1)  {
			   
					// 5 is whole team, 0 is nobody left. So can give a team fraction strength, but still keep track of max teambuff strength. 
			        teamBuffAdj[j] -= 1;
					for (pFind = 0; pFind < groupNumber; pFind++) {
						if ((i == p[pFind]) || (i == pAlt[pFind])) {
						   if (j == t) {
							  groupBuff /= playerBuff[j][playerDeaths[j][i]];
							  groupGoldBuff /= playerGoldBuff[j][playerDeaths[j][i]];
							  groupBuffAdjraw[j] /= playerBuff[j][playerDeaths[j][i]];
							  groupGoldBuffraw[j] /= playerGoldBuff[j][playerDeaths[j][i]];
							   
							   
							   
							  pAlt[pFind] = p[pFind];					  
							////  p[pFind] = 9999;							 
						   } else if (j == tD) {
							  groupBuff *= playerBuff[j][playerDeaths[j][i]];
							  groupGoldBuff *= playerGoldBuff[j][playerDeaths[j][i]];
							  groupBuffAdjraw[j]  /= playerBuff[j][playerDeaths[j][i]];
							  groupGoldBuffraw[j] /= playerGoldBuff[j][playerDeaths[j][i]];
							////  pAlt[pFind] = 9999;					  							 
						   }
						}
				   }
			   }
//				console.log(pFind+" "+p[pFind]+" "+pAlt[pFind]);	
			   
			}
		}

	//	console.log(groupBuff);
/*	    if 	(groupBuff>5) {
		  groupBuff = 5;*/
		//  console.log(this.t+" "+groupBuff+ " "+groupGoldBuff);
	    if 	(groupBuff>100) {
		  groupBuff = 100;
		}
	    if 	(groupGoldBuff>100) {
		  groupGoldBuff = 100;
		}
	    if 	(groupBuff<.01) {
		  groupBuff = .01;
		}
	    if 	(groupGoldBuff<.01) {
		  groupGoldBuff = .01;
		}

		
		
		
        for (j = 0; j < 2; j++) {		

			if 	(teamBuffAdj[j]>1000) {
	//		 console.log(teamBuffAdj[j]);
			  teamBuffAdj[j] = 1000;
			}
			if 	(teamBuffAdj[j]<.001) {
//console.log(teamBuffAdj[j]);			
			  teamBuffAdj[j] = .001;
			}	

			if 	(teamBuff[j]>1000) {
	//		 console.log(teamBuff[j]);
			 teamBuff[j] = 1000;
			}
			if 	(teamBuff[j]<.001) {
	//		 console.log(teamBuff[j]);
			 teamBuff[j] = .001;
			}	
		}		
	    /*if 	(groupBuff>500) {
		  groupBuff = 500;
		}
	    if 	(groupGoldBuff>500) {
		  groupGoldBuff = 500;
		}
	    if 	(groupBuff<.01) {
		  groupBuff = .01;
		}
	    if 	(groupGoldBuff<.01) {
		  groupGoldBuff = .01;
		}*/		
	//	console.log(teamBuffAdj[0]+" "+teamBuffAdj[1]);
		
		 //championsList[0][0]
		 // using t, p[0], and group number
		 
		 // need opposing group as well
		 // use same as above, but make random adjustments? Or just don't let 4v5 happen?, unless dead?

		 
//		this.team[t].compositeRating.toweringAttack	


		///////////////// Team Composite Ratings (FIXED)
		   /*toUpdate = ["wardDestruction", "wardPlacement", "mapVision", "adaptability", "teamwork", "aggression", "laneSwitching"];
			toUpdateMax = ["shotcalling"];
			toUpdateJungle = ["gank"];*/
		////////////// Group Composite Ratings	
		var max1,max2,max3,max4,max5,max6,max7;
		
		var outerAdj,innerAdj,nexTowerAdj,nexusAdj,inhibTowerAdj,inhibAdj,dragonAdj,baronAdj;
		
		var outerTowerOdds,innerTowerOdds,inhibTowerOdds, inhibOdds,nexusTowerOdds, nexusOdds,dragonOdds, baronOdds,champOdds;
		
		var outerTowerOddsNoSC,innerTowerOddsNoSC,inhibTowerOddsNoSC, inhibOddsNoSC,nexusTowerOddsNoSC, nexusOddsNoSC,dragonOddsNoSC, baronOddsNoSC,champOddsNoSC;
		var outerTowerOddsNoExp,innerTowerOddsNoExp,inhibTowerOddsNoExp, inhibOddsNoExp,nexusTowerOddsNoExp, nexusOddsNoExp,dragonOddsNoExp, baronOddsNoExp,champOddsNoExp;
		var outerTowerOddsNoGold,innerTowerOddsNoGold,inhibTowerOddsNoGold, inhibOddsNoGold,nexusTowerOddsNoGold, nexusOddsNoGold,dragonOddsNoGold, baronOddsNoGold,champOddsNoGold;
		var outerTowerOddsNoTBuff,innerTowerOddsNoTBuff,inhibTowerOddsNoTBuff, inhibOddsNoTBuff,nexusTowerOddsNoTBuff, nexusOddsNoTBuff,dragonOddsNoTBuff, baronOddsNoTBuff,champOddsNoTBuff;
		var outerTowerOddsNoTBuffAdj,innerTowerOddsNoTBuffAdj,inhibTowerOddsNoTBuffAdj, inhibOddsNoTBuffAdj,nexusTowerOddsNoTBuffAdj, nexusOddsNoTBuffAdj,dragonOddsNoTBuffAdj, baronOddsNoTBuffAdj,champOddsNoTBuffAdj;

		var outerTowerOddsNoTP,innerTowerOddsNoTP,inhibTowerOddsNoTP, inhibOddsNoTP,nexusTowerOddsNoTP, nexusOddsNoTP,dragonOddsNoTP, baronOddsNoTP,champOddsNoTP;
		var outerTowerOddsNoTw,innerTowerOddsNoTw,inhibTowerOddsNoTw, inhibOddsNoTw,nexusTowerOddsNoTw, nexusOddsNoTw,dragonOddsNoTw, baronOddsNoTw,champOddsNoTw;
		var outerTowerOddsNoCK,innerTowerOddsNoCK,inhibTowerOddsNoCK, inhibOddsNoCK,nexusTowerOddsNoCK, nexusOddsNoCK,dragonOddsNoCK, baronOddsNoCK,champOddsNoCK;
		var outerTowerOddsNoCS,innerTowerOddsNoCS,inhibTowerOddsNoCS, inhibOddsNoCS,nexusTowerOddsNoCS, nexusOddsNoCS,dragonOddsNoCS, baronOddsNoCS,champOddsNoCS;
		var outerTowerOddsNoAg,innerTowerOddsNoAg,inhibTowerOddsNoAg, inhibOddsNoAg,nexusTowerOddsNoAg, nexusOddsNoAg,dragonOddsNoAg, baronOddsNoAg,champOddsNoAg;
		var outerTowerOddsNoChmpn,innerTowerOddsNoChmpn,inhibTowerOddsNoChmpn, inhibOddsNoChmpn,nexusTowerOddsNoChmpn, nexusOddsNoChmpn,dragonOddsNoChmpn, baronOddsNoChmpn,champOddsNoChmpn;
		//var outerTowerOddsNoExp,innerTowerOddsNoExp,inhibTowerOddsNoExp, inhibOddsNoExp,nexusTowerOddsNoExp, nexusOddsNoExp,dragonOddsNoExp, baronOddsNoExp,champOddsNoExp;

		
		var wardAdjustment;
		var shotCaller;
		
		shotCaller = [0,0];
		
		outerAdj = [0,0];
		innerAdj = [0,0];
		nexTowerAdj = [0,0];
		nexusAdj = [0,0];
		inhibTowerAdj = [0,0];
		inhibAdj = [0,0];
		dragonAdj = [0,0];
		baronAdj = [0,0];

		groupBuffAdj = groupNumber;
		
		////// First Skill - Shotcalling, track without
		var outerAdjNoSC,innerAdjNoSC;
		var outerAdjNoTP,innerAdjNoTP;
		var outerAdjNoAg,innerAdjNoAg;
		
		outerAdjNoSC = [0,0];
		innerAdjNoSC = [0,0];
		outerAdjNoTP = [0,0];
		innerAdjNoTP = [0,0];
		outerAdjNoAg = [0,0];
		innerAdjNoAg = [0,0];
		
	//	console.log("BEFORE: "+p.length+" "+groupBuffAdj);
		
		
        for (j = 0; j < 2; j++) {		
		
			max1 = 0;
			max2 = 0;
			this.team[j].compositeRating.teamwork = 0;			
			this.team[j].compositeRating.shotcalling = 0;			
			this.team[j].compositeRating.gank = 0;			
			this.team[j].compositeRating.mapVision = 0;			
			this.team[j].compositeRating.wardDestruction = 0;			
			this.team[j].compositeRating.wardPlacement = 0;			
			this.team[j].compositeRating.laneSwitching = 0;			
			this.team[j].compositeRating.aggression = 0;			
			this.team[j].compositeRating.allComposite = 0; // put max of each skill in here;
			this.team[j].compositeRating.allCompositeNoSC = 0; // put max of each skill in here;
			this.team[j].compositeRating.allCompositeNoTP0 = 0; // put max of each skill in here;
			this.team[j].compositeRating.allCompositeNoTP1 = 0; // put max of each skill in here;
			this.team[j].compositeRating.allCompositeNoTP2 = 0; // put max of each skill in here;
			this.team[j].compositeRating.allCompositeNoTP3 = 0; // put max of each skill in here;
			this.team[j].compositeRating.allCompositeNoTP4 = 0; // put max of each skill in here;
			shotCaller[j] = 0;
			
			for (i = 0; i < 5; i++) {
				if (max1 < this.team[j].player[i].compositeRating.shotcalling) {
					max1 = this.team[j].player[i].compositeRating.shotcalling ;
					max2 = this.team[j].player[i].compositeRating.teamwork ;
					shotCaller[j] = i;
				}
				this.team[j].compositeRating.teamwork += this.team[j].player[i].compositeRating.teamwork;
				this.team[j].compositeRating.gank += this.team[j].player[i].compositeRating.gank;
				this.team[j].compositeRating.mapVision += this.team[j].player[i].compositeRating.mapVision;
				this.team[j].compositeRating.wardDestruction += this.team[j].player[i].compositeRating.wardDestruction;
				this.team[j].compositeRating.wardPlacement += this.team[j].player[i].compositeRating.wardPlacement;
				this.team[j].compositeRating.laneSwitching += this.team[j].player[i].compositeRating.laneSwitching;				
			}
			this.team[j].compositeRating.shotcalling = max1;
			this.team[j].compositeRating.teamwork -= max2;
			this.team[j].compositeRating.teamwork /= 4;
			
			this.team[j].compositeRating.allComposite += this.team[j].compositeRating.shotcalling+this.team[j].compositeRating.teamwork;	
			this.team[j].compositeRating.allComposite += this.team[j].compositeRating.mapVision/5;	
			
			this.team[j].compositeRating.allCompositeNoSC += this.team[j].compositeRating.teamwork;	
			this.team[j].compositeRating.allCompositeNoSC += this.team[j].compositeRating.mapVision/5;	
			
	
			
			
			
			
			groupAttack[j] = 0;
			groupDefense[j] = 0;
			groupAbility[j] = 0;
			max1 = 0;
			max2 = 0;
			max3 = 0;
			max4 = 0;
//		if (this.t>100) {
		if (this.t>100) {
		   console.log("groupAttack[t]: "+groupAttack[t]);		   
		   console.log("groupDefense[tD]: "+groupDefense[tD]);		   
		   console.log("groupAbility[t]: "+groupAbility[t]);		   
		   console.log("groupAbility[tD]: "+groupAbility[tD]);		   
		
		}				
			for (i = 0; i < groupNumber; i++) {

		//	console.log(this.team[j].player[i].champions[championsList[j][i]].draftValue);
		/*if (this.t<2) {
			console.log(this.team[j].player[i].champions.length);
			console.log(this.team[j].player[i].champRel.length);			
				console.log(	this.team[j].player[i].champions[championsList[j][i]].draftValue);			
		}*/
		//players[i].champions[j].draftValue
				if (playerDeaths[j][p[i]] == 0) { 
				//	console.log(this.team[j].player[i].champRel[championsList[j][i]].ratings.attack);
				
					groupAttack[j] += this.team[j].player[i].champRel[championsList[j][i]].ratings.attack;
					groupDefense[j] += this.team[j].player[i].champRel[championsList[j][i]].ratings.defense;
					groupAbility[j] += this.team[j].player[i].champRel[championsList[j][i]].ratings.ability;	
//		if (this.t>100) {
		if (this.t>100) {
		
		   console.log(championsList[j][i]+" "+j+" "+i+" this.team[j].player[i].champRel[championsList[j][i]].ratings.attack: "+this.team[j].player[i].champRel[championsList[j][i]].ratings.attack);		   
		   console.log(championsList[j][i]+" "+j+" "+i+"this.team[j].player[i].champRel[championsList[j][i]].ratings.defense: "+this.team[j].player[i].champRel[championsList[j][i]].ratings.defense);		   
		   console.log(championsList[j][i]+" "+j+" "+i+"this.team[j].player[i].champRel[championsList[j][i]].ratings.ability: "+this.team[j].player[i].champRel[championsList[j][i]].ratings.ability);		   
		
		}
/*					groupAttack[j] += this.team[j].player[i].champRel[championsList[j][i]].ratings.attack;
					groupDefense[j] += this.team[j].player[i].champRel[championsList[j][i]].ratings.defense;
					groupAbility[j] += this.team[j].player[i].champRel[championsList[j][i]].ratings.ability;	*/
					if (max1<this.team[j].player[i].champRel[championsList[j][i]].ratings.attack) {
						max1 = this.team[j].player[i].champRel[championsList[j][i]].ratings.attack;
					}
					if (max2<this.team[j].player[i].champRel[championsList[j][i]].ratings.defense) {
						max2 = this.team[j].player[i].champRel[championsList[j][i]].ratings.defense;
					}
					if (max3<this.team[j].player[i].champRel[championsList[j][i]].ratings.defense) {
						max3 = this.team[j].player[i].champRel[championsList[j][i]].ratings.defense;
					}
					
				} else {
				 groupBuffAdj -= 1;
			//	 console.log("PLAYER DEAD"+p[i]);
				}
			//    console.log(t+" "+j+" "+groupAttack[j]+" "+this.team[j].player[i].champRel[championsList[j][i]].ratings.attack+ " "+this.team[j].player[i].pos)				
			}
			// console.log("got here");
			//// this is champion, not player ability
			//groupAttack[j] += max1;
			//groupDefense[j] += max2;
			//groupAbility[j] += max3;	
						
		    if (j == t) {
				this.team[j].compositeRating.toweringAttack = 0;
				this.team[j].compositeRating.structureAttack = 0;
				this.team[j].compositeRating.monstersKillingBD = 0;
				this.team[j].compositeRating.championKilling = 0;		
				this.team[j].compositeRating.gameStrategy = 0;		
				max1 = 0;
				max2 = 0;
				max3 = 0;
				max4 = 0;				
				max5 = 0;				
				max6 = 0;							
				for (i = 0; i < groupNumber; i++) {
				
					if (playerDeaths[j][p[i]] == 0) { 				
					//	console.log(i+" tA "+this.team[j].player[i].compositeRating.toweringAttack);
					//	console.log(i+" sA "+this.team[j].player[i].compositeRating.structureAttack);						
					
						this.team[j].compositeRating.toweringAttack += this.team[j].player[i].compositeRating.toweringAttack;
						this.team[j].compositeRating.structureAttack += this.team[j].player[i].compositeRating.structureAttack;
						this.team[j].compositeRating.monstersKillingBD += this.team[j].player[i].compositeRating.monstersKillingBD;
						this.team[j].compositeRating.championKilling += this.team[j].player[i].compositeRating.championKilling;
						this.team[j].compositeRating.gameStrategy += this.team[j].player[i].compositeRating.gameStrategy;
						this.team[j].compositeRating.aggression += this.team[j].player[i].compositeRating.aggression;						
						
						if (max1<this.team[j].player[i].compositeRating.toweringAttack) {
							max1 = this.team[j].player[i].compositeRating.toweringAttack;
						}
						if (max2<this.team[j].player[i].compositeRating.structureAttack) {
							max2 = this.team[j].player[i].compositeRating.structureAttack;
						}
						if (max3<this.team[j].player[i].compositeRating.monstersKillingBD) {
							max3 = this.team[j].player[i].compositeRating.monstersKillingBD;
						}
						if (max4<this.team[j].player[i].compositeRating.championKilling) {
							max4 = this.team[j].player[i].compositeRating.championKilling;
						}
						if (max5<this.team[j].player[i].compositeRating.gameStrategy) {
							max5 = this.team[j].player[i].compositeRating.gameStrategy;
						}		
						if (max6<this.team[j].player[i].compositeRating.aggression) {
							max6 = this.team[j].player[i].compositeRating.aggression;
						}						
						
					}
				}		
				// want extra player ability
				this.team[j].compositeRating.toweringAttack += max1;
				this.team[j].compositeRating.structureAttack += max2;
				this.team[j].compositeRating.monstersKillingBD += max3;
				this.team[j].compositeRating.championKilling += max4;		
				this.team[j].compositeRating.gameStrategy += max5;													
				this.team[j].compositeRating.aggression += max6;	
				
				this.team[j].compositeRating.allComposite += max1+max4+max5;	
				this.team[j].compositeRating.allCompositeNoSC += max1+max4+max5;	

			} else {
				this.team[j].compositeRating.toweringDefend = 0; // can use this with barron dragon?
				this.team[j].compositeRating.structureDefend = 0;
				this.team[j].compositeRating.monstersKillingBD = 0;
				this.team[j].compositeRating.championKilling = 0;
				this.team[j].compositeRating.gameStrategy = 0;			
				this.team[j].compositeRating.aggression = 0;			
				
				max1 = 0;
				max2 = 0;
				max3 = 0;
				max4 = 0;				
				max5 = 0;								
				max6 = 0;					
				for (i = 0; i < groupNumber; i++) {
		/*if (this.t<2) {
		   console.log(i+" playerdeath "+playerDeaths[j][p[i]] );		
		}*/		   				     
					if (playerDeaths[j][p[i]] == 0) { 			
		/*if (this.t<2) {
		   console.log(this.t);		
		   console.log(j+" this.team[t].compositeRating.structureDefend: "+this.team[j].compositeRating.structureDefend+" "+this.team[j].player[i].compositeRating.structureDefend);
		   console.log(j+" this.team[t].compositeRating.toweringDefend: "+this.team[j].compositeRating.toweringDefend+" "+this.team[j].player[i].compositeRating.toweringDefend);
		}*/		   
					
						this.team[j].compositeRating.toweringDefend += this.team[j].player[i].compositeRating.toweringDefend;
						this.team[j].compositeRating.structureDefend += this.team[j].player[i].compositeRating.structureDefend;
						this.team[j].compositeRating.monstersKillingBD += this.team[j].player[i].compositeRating.monstersKillingBD;
						this.team[j].compositeRating.championKilling += this.team[j].player[i].compositeRating.championKilling;
						this.team[j].compositeRating.gameStrategy += this.team[j].player[i].compositeRating.gameStrategy;
						this.team[j].compositeRating.aggression += this.team[j].player[i].compositeRating.aggression;						

						
						if (max1<this.team[j].player[i].compositeRating.toweringDefend) {
							max1 = this.team[j].player[i].compositeRating.toweringDefend;
						}
						if (max2<this.team[j].player[i].compositeRating.structureDefend) {
							max2 = this.team[j].player[i].compositeRating.structureDefend;
						}
						if (max3<this.team[j].player[i].compositeRating.monstersKillingBD) {
							max3 = this.team[j].player[i].compositeRating.monstersKillingBD;
						}
						if (max4<this.team[j].player[i].compositeRating.championKilling) {
							max4 = this.team[j].player[i].compositeRating.championKilling;
						}						
						if (max5<this.team[j].player[i].compositeRating.gameStrategy) {
							max5 = this.team[j].player[i].compositeRating.gameStrategy;
						}								
						if (max6<this.team[j].player[i].compositeRating.aggression) {
							max6 = this.team[j].player[i].compositeRating.aggression;
						}													
					}
				}	
				
		/*if (this.t<2) {
		   console.log(this.t);		
		   console.log(j+" this.team[t].compositeRating.structureDefend: "+this.team[j].compositeRating.structureDefend);
		   console.log(j+" this.team[t].compositeRating.toweringDefend: "+this.team[j].compositeRating.toweringDefend);
		}*/		   
				this.team[j].compositeRating.toweringDefend += max1;
				this.team[j].compositeRating.structureDefend += max2;
				this.team[j].compositeRating.monstersKillingBD += max3;
				this.team[j].compositeRating.championKilling += max4;					
				this.team[j].compositeRating.gameStrategy += max5;					
				this.team[j].compositeRating.aggression += max6;	
				
				this.team[j].compositeRating.allComposite += max1+max4+max5;	
				this.team[j].compositeRating.allCompositeNoSC += max1+max4+max5;	

			}	
		/*if (this.t<2) {
		   console.log(this.t);		
		   console.log(j+" this.team[t].compositeRating.structureDefend: "+this.team[j].compositeRating.structureDefend);
		   console.log(j+" this.team[t].compositeRating.toweringDefend: "+this.team[j].compositeRating.toweringDefend);
		}*/		   			
/*						this.team[j].compositeRating.teamwork = 0;			
			this.team[j].compositeRating.shotcalling = 0;			
			this.team[j].compositeRating.gank = 0;			
			this.team[j].compositeRating.mapVision = 0;			
			this.team[j].compositeRating.wardDestruction = 0;			
			this.team[j].compositeRating.wardPlacement = 0;			
			this.team[j].compositeRating.laneSwitching = 0;			
			this.team[j].compositeRating.aggression = 0;	
			*/
			wardAdjustment = this.team[j].compositeRating.wardDestruction+this.team[j].compositeRating.wardPlacement;
			
			
			var teamworkAdjustment;
			var shotcallingAdjustment;
			
			teamworkAdjustment = 1.5;
//			shotcallingAdjustment = 1.5 ;
			shotcallingAdjustment = 2 ;
			
			// also add special case for bottom lane, groupNumber == 2
            if (groupNumber == 1) {
/*				outerAdj[j] = (this.team[j].compositeRating.gameStrategy+this.team[j].player[p[0]].compositeRating.mapVision)/100;
				innerAdj[j] = (this.team[j].compositeRating.gameStrategy+this.team[j].player[p[0]].compositeRating.mapVision)/100;*/
				outerAdj[j] = (this.team[j].compositeRating.toweringAttack+this.team[j].player[p[0]].compositeRating.championKilling)/100;
				innerAdj[j] = (this.team[j].compositeRating.toweringAttack+this.team[j].player[p[0]].compositeRating.championKilling)/100;

				
			//	console.log(j+" "+groupNumber+" single: "+outerAdj[j]);				
			} else {
/*				outerAdj[j] =  (this.team[j].compositeRating.shotcalling+this.team[j].compositeRating.teamwork+this.team[j].compositeRating.mapVision+wardAdjustment+this.team[j].compositeRating.laneSwitching)/100;
				innerAdj[j] =  (this.team[j].compositeRating.shotcalling+this.team[j].compositeRating.teamwork+this.team[j].compositeRating.mapVision+wardAdjustment+this.team[j].compositeRating.laneSwitching)/100;*/
/*				outerAdj[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment*this.team[j].compositeRating.teamwork*teamworkAdjustment)/50/50*2;
				innerAdj[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment*this.team[j].compositeRating.teamwork*teamworkAdjustment)/50/50*2;
				
				outerAdjNoSC[j] =  (shotcallingAdjustment*this.team[j].compositeRating.teamwork*teamworkAdjustment)/50/50*2;
				innerAdjNoSC[j] =  (shotcallingAdjustment*this.team[j].compositeRating.teamwork*teamworkAdjustment)/50/50*2;*/


				outerAdj[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment+this.team[j].compositeRating.teamwork*teamworkAdjustment)/10;
				innerAdj[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment+this.team[j].compositeRating.teamwork*teamworkAdjustment)/10;
				
				outerAdjNoSC[j] =  (this.team[j].compositeRating.teamwork*teamworkAdjustment+1)/10;
				innerAdjNoSC[j] =  (this.team[j].compositeRating.teamwork*teamworkAdjustment+1)/10;

				outerAdjNoTP[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment+1)/10;
				innerAdjNoTP[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment+1)/10;
			
		
				//console.log(outerAdj[j]+" "+outerAdjNoSC[j]);
				
			//	console.log(j+" "+groupNumber+" team: "+outerAdj[j]);				
			}
		//	console.log(this.team[j].compositeRating.shotcalling+" "+this.team[j].compositeRating.teamwork);
		/*	nexTowerAdj[j] =
			nexusAdj[j] =
			inhibTowerAdj[j] = 
			inhibAdj[j] =
			dragonAdj[j] =
			baronAdj[j] =			*/
			
		}
//		console.log("AFTER: "+p.length+" "+groupBuffAdj);	
		if (groupAttack[t] > 1000) {
		  groupAttack[t] = 1000;
		}
		if (groupDefense[t] > 1000) {
		  groupDefense[t] = 1000;
		}
		if (groupAbility[t] > 1000) {
		  groupAbility[t] = 1000;
		}
		if (groupAttack[t] < 1) {
		  groupAttack[t] = 1;
		}
		if (groupDefense[t] < 1) {
		  groupDefense[t] = 1;
		}
		if (groupAbility[t] < 1) {
		  groupAbility[t] = 1;
		}
	
		championAdjustment = 0;
		if (this.t>100) {
		   console.log("championAdjustment 0: "+championAdjustment);
		}		   
		championAdjustment = ((groupAttack[t]-groupDefense[tD])/(groupAttack[t]+groupDefense[tD]+1)) + ((groupAbility[t]-groupAbility[tD])/(groupAbility[t]+groupAbility[tD]+1))*(this.t/60);
//		if (this.t>100) {
		if (this.t>100) {
		   console.log("championAdjustment: "+championAdjustment);		   
		   console.log("groupAttack[t]: "+groupAttack[t]);		   
		   console.log("groupDefense[tD]: "+groupDefense[tD]);		   
		   console.log("groupAbility[t]: "+groupAbility[t]);		   
		   console.log("groupAbility[tD]: "+groupAbility[tD]);		   
		   console.log("this.team[t].compositeRating.toweringDefend: "+this.team[t].compositeRating.toweringDefend);		   
		   console.log("this.team[tD].compositeRating.toweringDefend: "+this.team[tD].compositeRating.toweringDefend);		   
		
		}		
	/*	if (this.t<1) {
		   console.log("championAdjustment: "+championAdjustment);		   
		   console.log("groupAttack[t]: "+groupAttack[t]);		   
		   console.log("groupDefense[tD]: "+groupDefense[tD]);		   
		   console.log("groupAbility[t]: "+groupAbility[t]);		   
		   console.log("groupAbility[tD]: "+groupAbility[tD]);		   
		
		}				*/
//		championAdjustment = ((groupAttack[t]-groupDefense[tD])/(groupAttack[t]+groupDefense[tD]));
		//	// console.log("got here");

		// lower puts more empasis on TW/CS, higher more on Killing? was in the hundreds?, review more
		// 500, .15 or 4 and 1.5
		
		outerAdjNoAg[t] = outerAdj[t];
		innerAdjNoAg[t] =  innerAdj[t];
		outerAdjNoAg[tD] = outerAdj[tD];
		innerAdjNoAg[tD] = innerAdj[tD];
			
		outerAdj[t] +=  (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		innerAdj[t] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		outerAdj[tD] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		innerAdj[tD] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		
		outerAdjNoSC[t] +=  (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		innerAdjNoSC[t] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		outerAdjNoSC[tD] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		innerAdjNoSC[tD] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;


		outerAdjNoTP[t] +=  (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		innerAdjNoTP[t] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		outerAdjNoTP[tD] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		innerAdjNoTP[tD] +=   (100 - this.team[t].compositeRating.aggression - this.team[tD].compositeRating.aggression)/400;
		
	
	
		
	//			console.log(outerAdj[t]+" "+outerAdjNoSC[tD]);		
	//console.log(this.team[t].compositeRating.aggression );
		
		if (outerAdj[t] < .1) {
		  outerAdj[t] = .1;
		}		
		if (innerAdj[t] < .1) {
		  innerAdj[t] = .1;
		}
		if (outerAdj[tD] < .1) {
		  outerAdj[tD] = .1;
		}

		if (innerAdj[tD] < .1) {
		  innerAdj[tD] = .1;
		}
		
		if (outerAdjNoSC[t] < .1) {
		  outerAdjNoSC[t] = .1;
		}		
		if (innerAdjNoSC[t] < .1) {
		  innerAdjNoSC[t] = .1;
		}
		if (outerAdjNoSC[tD] < .1) {
		  outerAdjNoSC[tD] = .1;
		}

		if (innerAdjNoSC[tD] < .1) {
		  innerAdjNoSC[tD] = .1;
		}		


		if (outerAdjNoTP[t] < .1) {
		  outerAdjNoTP[t] = .1;
		}		
		if (innerAdjNoTP[t] < .1) {
		  innerAdjNoTP[t] = .1;
		}
		if (outerAdjNoTP[tD] < .1) {
		  outerAdjNoTP[tD] = .1;
		}

		if (innerAdjNoTP[tD] < .1) {
		  innerAdjNoTP[tD] = .1;
		}		

		if (outerAdjNoAg[t] < .1) {
		  outerAdjNoAg[t] = .1;
		}		
		if (innerAdjNoAg[t] < .1) {
		  innerAdjNoAg[t] = .1;
		}
		if (outerAdjNoAg[tD] < .1) {
		  outerAdjNoAg[tD] = .1;
		}

		if (innerAdjNoAg[tD] < .1) {
		  innerAdjNoAg[tD] = .1;
		}		
		
		

		
////console.log(outerAdj[t]);
//console.log(innerAdj[tD]);
//console.log(outerAdj[t]);
//console.log(innerAdj[tD]);

		var boostT1, boostT2;
		boostT1 = 0;
		boostT2 = 0;
		if (this.t>10) {
		//	boostT1 = .05;
		}
		if (this.t>20) {
		//	boostT2 = .20;
		}

		
		var inhibBaronSynergy;
		 inhibBaronSynergy = 1;
		//////////////////////////// Respawn
		
		//Inhib
        for (i = 0; i < 3; i++) {
//			if ( ((this.t-inhibRespawn[t][i]) > 3) && (inhibList[t][i] == 1)) {
			if ( ((this.t-inhibRespawn[t][i]) > 5) && (inhibList[t][i] == 1)) {  // give a cushion
					inhibList[t][i] = 0;
					this.team[t].stat.ptsQtrs[3] -= 1;
			}
			
			if (inhibList[t][i] == 1) {
				inhibBaronSynergy *= 2;
			}
		}	
		
		// dragon
//		if ( ((this.t-dragonRespawn) > 3.6) ) {
		if ( ((this.t-dragonRespawn) > 6) ) {  // give a cushion
//		if ( ((this.t-dragonRespawn) > 4) ) {  // give less cushion
					dragonRespawn = 9999;
					//dragonList[t] = 0;
					//this.team[t].stat.ptsQtrs[3] -= 1;
		}		
		
		// baron
//		if ( ((this.t-baronRespawn) > 7) ) {  // give a cushion
		if ( ((this.t-baronRespawn) > 7) ) {  // give a cushion
					baronRespawn = 9999;
					//dragonList[t] = 0;
					//this.team[t].stat.ptsQtrs[3] -= 1;
		} else if (baronRespawn != 9999) {
			inhibBaronSynergy *= 2;
		}
		
		var towerPower,outerPower,innerPower;
		var structurePlayerBuff,championKillPlayerBuff,creepPlayerBuff,junglePlayerBuff;
		var structurePlayerBuffAll;
		var killBonus,assistBonus;
		var objectiveOddsAdjustment, championKillOddsAdjustment,championKillOddsEarly;
		var killCSRatio;
		var killGoldAdj;
		var jungleRatio;
		var groupBuffPower;
		var groupGoldBuffPower;		
		var objectivesFirst;
		var outerTowerSum;
		var innerTowerSum;
		
		var teamBuffPower,teamBuffAdjPower;
				
		outerTowerSum = outerTowerList[t][0]+outerTowerList[t][1]+outerTowerList[t][2] ;		
		innerTowerSum = innerTowerList[t][0]+innerTowerList[t][1]+innerTowerList[t][2] ;		
		
			//killBonus = .1;						
//						killBonus = .2;
//						killBonus = .5;
		
		// killbonus falls with time? as levels matter less	
		///////// SKILL - CHAMPION KILLING
		killCSRatio = 40;
		jungleRatio = 3;
		if (this.t < 5) {
//			killBonus = 1;			//% of champ killed
			killBonus = .5;			//% of champ killed
			structurePlayerBuff = 2.0;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.5;  //> 1
/*			creepPlayerBuff = .05;  /////////////// SKILL - CS
			junglePlayerBuff = .15; /////////////// SKILL - Jungle Control*/
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		} else if (this.t < 10) {
//			killBonus = .5;			
			killBonus = .25;			
			structurePlayerBuff = 1.5;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.25;  //> 1
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		} else if (this.t < 15) {
//			killBonus = .3;			
			killBonus = .13;			
			structurePlayerBuff = 1.3;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.15;  //> 1
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		} else if (this.t < 20) {
//			killBonus = .2;			
			killBonus = .1;			
			structurePlayerBuff = 1.2;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.10;  //> 1
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		} else if (this.t < 25) {
//			killBonus = .15;			
			killBonus = .07;			
			structurePlayerBuff = 1.15;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.07;  //> 1
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		} else if (this.t < 30) {
			//killBonus = .13;			
			killBonus = .06;			
			structurePlayerBuff = 1.13;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.06;  //> 1
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		} else if (this.t < 35) {
//			killBonus = .1;			
			killBonus = .05;			
			structurePlayerBuff = 1.1;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.05;  //> 1
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		} else if (this.t < 40) {
//			killBonus = .07;			
			killBonus = .04;			
			structurePlayerBuff = 1.07;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.035;  //> 1
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		} else {
//			killBonus = .05;			
			killBonus = .03;			
			structurePlayerBuff = 1.05;  // >1       ////////// SKILL - TOWER
			structurePlayerBuffAll = 1.025;  //> 1
			creepPlayerBuff = killBonus/killCSRatio;  /////////////// SKILL - CS
			junglePlayerBuff = creepPlayerBuff*jungleRatio; /////////////// SKILL - Jungle Control
			
		}
		
		//// Add more for other skills, want all skills here, then find a balance
		//// High skilled players should win
		//// Combo stats to create?
		//assistBonus = 1;		//not used
		
		//////ADD - ChampionPower,AttackPower,DefensePower 
		
//		towerPower = 20;
//		towerPower = 30;
		towerPower = 25;

		// dragon, outter towers
		outerPower = 5; // champkilling, towerattack             ////// AGGRESSION for both teams
		
		//barron and dragon, inner towers, inhibs
		innerPower = 5; // shotcalling teamwork  ////////// SKILL - SHOTCALLING, TEAMWORK     ////// AGGRESSION for both teams
		
		// was 1 1
/*		groupBuffPower = .1 ;   //(maybe do fractions to make less important)
		groupGoldBuffPower = .5;  //(maybe do fractions to make less important)*/
/*		groupBuffPower = .05 ;   //(maybe do fractions to make less important)   shotcalling and aggression matter
		groupGoldBuffPower = .25;  //(maybe do fractions to make less important)*/
/*		groupBuffPower = .10 ;   //(maybe do fractions to make less important)
		groupGoldBuffPower = .5;  //(maybe do fractions to make less important)
		groupBuffPower = .10 ;   //(maybe do fractions to make less important)
		groupGoldBuffPower = .25;  //(maybe do fractions to make less important)
//		groupGoldBuffPower = .5;  //(maybe do fractions to make less important)
//		groupBuffPower = .20 ;   //(maybe do fractions to make less important)
		groupBuffPower = .30 ;   //(maybe do fractions to make less important)
		groupGoldBuffPower = .5;  //(maybe do fractions to make less important)
		groupBuffPower = .20 ;   //(maybe do fractions to make less important)
		groupGoldBuffPower = .3;  //(maybe do fractions to make less important)*/
//		groupGoldBuffPower = .75;  //(maybe do fractions to make less important)
/*		groupGoldBuffPower = 1.00;  //(maybe do fractions to make less important)
		groupBuffPower = .5;   //(maybe do fractions to make less important)*/
//		groupBuffPower = Math.pow(groupGoldBuffPower,1.35);   //(maybe do fractions to make less important)
//		groupGoldBuffPower = 1.50;  //(maybe do fractions to make less important)

	//	console.log(g.customRosterMode);
	var customOn;
	customOn = false;
		if (typeof(g.customRosterMode) == 'undefined') {
/*				groupGoldBuffPower = 1.25;  //(maybe do fractions to make less important)
				groupBuffPower = .60;   //(maybe do fractions to make less important)
				teamBuffPower = 1.00;
				teamBuffAdjPower = 1.00;*/
				groupGoldBuffPower = 0.80;  //(maybe do fractions to make less important)
				groupBuffPower = .40;   //(maybe do fractions to make less important)
				teamBuffPower = .67;
				teamBuffAdjPower = .67;
				
		} else {
			if (g.customRosterMode)  {
					customOn = true;
////				groupGoldBuffPower = 0.6125;  //(maybe do fractions to make less important)
////				groupBuffPower = .30;   //(maybe do fractions to make less important)
				groupGoldBuffPower = 0.1125;  //(maybe do fractions to make less important)
				groupBuffPower = .05;   //(maybe do fractions to make less important)
				teamBuffPower = .10;
				teamBuffAdjPower = .10;
			/*	groupGoldBuffPower = 0.24;  //(maybe do fractions to make less important)
				groupBuffPower = .1;   //(maybe do fractions to make less important)
				teamBuffPower = .20;
				teamBuffAdjPower = .20;*/
			/*	groupGoldBuffPower = 0.01125;  //(maybe do fractions to make less important)
				groupBuffPower = .005;   //(maybe do fractions to make less important)
				teamBuffPower = .010;
				teamBuffAdjPower = .010;*/
			} else {
				/*groupGoldBuffPower = 11.25;  //(maybe do fractions to make less important)
				groupBuffPower = 1.60;   //(maybe do fractions to make less important)
				teamBuffPower = 11.00;
				teamBuffAdjPower = 11.00;*/

/*				groupGoldBuffPower = 1.25;  //(maybe do fractions to make less important)
				groupBuffPower = .60;   //(maybe do fractions to make less important)
				teamBuffPower = 1.00;
				teamBuffAdjPower = 1.00;*/
				groupGoldBuffPower = 0.1125;  //(maybe do fractions to make less important)
				groupBuffPower = .05;   //(maybe do fractions to make less important)
				teamBuffPower = .10;
				teamBuffAdjPower = .10;
//OLD
 /*
				groupGoldBuffPower = 0.80;  //(maybe do fractions to make less important)
				groupBuffPower = .40;   //(maybe do fractions to make less important)
				teamBuffPower = .67;
				teamBuffAdjPower = .67;*/
			}
		}
	
	//	console.log(groupGoldBuff);
		//console.log(Math.pow(groupBuff,groupBuffPower)+ " "+Math.pow(groupGoldBuff,groupGoldBuffPower));
		// keeping these low really brings out shotcalling, teamwork, and aggressiveness, but does it lose the rest?
		
	//	console.log(groupGoldBuff+ " "+groupBuff);
		//championKillPlayerBuff = 2;
		
		///////////////////// Shotcalling around line 1811
		///////////////////// Teamwork around line 1811
		
		
		//creepPlayerBuff = .01;  /////////////// SKILL - CS
		//junglePlayerBuff = .03; /////////////// SKILL - Jungle Control
	//	objectiveOddsAdjustment = 1.50;
//		objectiveOddsAdjustment = 1.50;
//		objectiveOddsAdjustment = .150;
//		objectiveOddsAdjustment = .300;
		objectiveOddsAdjustment = .400;  // 15 kills, 10 towers,baron,dragon
//		championKillOddsAdjustment = 8.0; // keep kills between 10-20 per team
//		championKillOddsAdjustment = .20; // keep kills between 10-20 per team
//		championKillOddsAdjustment = .30; // keep kills between 10-20 per team
//		championKillOddsAdjustment = .35; // keep kills between 10-20 per team
//		championKillOddsAdjustment = .35; // keep kills between 10-20 per team  OLD
		championKillOddsAdjustment = 1.00; // keep kills between 10-20 per team
//		championKillOddsEarly = .05;
//////////////////		championKillOddsEarly = .10; // old
//		championKillOddsEarly = 1- this.t/10 + .40; // new
		championKillOddsEarly = 1- this.t/10 ; // new
		// need power for group exp odds, group gold. Too strong right now
		
/*		objectiveOddsAdjustment = 1.50;
		objectiveOddsAdjustment = 1.2550;
		championKillOddsAdjustment = 2;
		championKillOddsEarly = .05;*/
		
		//// Percentage Objectives first vs only Kills
		//// really impacts game speed
//		objectivesFirst = .30;
//		objectivesFirst = .27;
		objectivesFirst = .33;
		objectivesFirst -= (this.team[0].stat.pf+this.team[1].stat.pf)/100;
		objectivesFirst += this.t/600;
	//	console.log(objectivesFirst);
//		killGoldAdj = 10;
//		killGoldAdj = 7.5;
		killGoldAdj = 10;
/*		killBonus = 1;			
		assistBonus = 1;		//not used
		structurePlayerBuff = 2;
		structurePlayerBuffAll = 1.5;
		
		championKillPlayerBuff = 2;
		
		creepPlayerBuff = .01;
		junglePlayerBuff = .03;*/
		
		////////////////playerGoldBuff
		//groupGoldBuff
		
		var standardTOdds,standardTNoSC,standardTNoExp,standardTNoGold,standardTNoTBuff,standardTNoTBuffAdj,standardTNoTw,standardTNoChmpn,standardTNoTP,standardTNoAg; 
		var standardCOdds,standardCNoSC,standardCNoExp,standardCNoGold,standardCNoTBuff,standardCNoTBuffAdj,standardCNoCK,standardCNoChmpn,standardCNoTP,standardCNoAg; 
		var towerToChamp;
		
		
		var outerSum,innerSum,inhibTsum;
		outerSum = (outerTowerList[t][0] + outerTowerList[t][1] + outerTowerList[t][2])/3;
		innerSum = (innerTowerList[t][0]+innerTowerList[t][1]+innerTowerList[t][2])/3;
		inhibTsum = (inhibTowerList[t][0]+inhibTowerList[t][1]+inhibTowerList[t][2])/3;

		
		//var standardCKOdds;
		
	/*	standardTOdds =  ((Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+Math.pow(this.team[t].compositeRating.toweringAttack/(this.team[tD].compositeRating.toweringDefend+1),towerPower)+this.team[t].compositeRating.teamwork/(this.team[tD].compositeRating.teamwork+1)+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1;
		standardTNoSC = standardTOdds + (Math.pow(innerAdjNoSC[t]/innerAdjNoSC[tD],innerPower))- (Math.pow(innerAdj[t]/innerAdj[tD],innerPower));
		standardTNoExp = standardTOdds + 1 - Math.pow(groupBuff,groupBuffPower);
		standardTNoGold = standardTOdds + 1 - Math.pow(groupGoldBuff,groupGoldBuffPower);
		standardTNoTBuff = standardTOdds + 1 - Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower);
		standardTNoTBuffAdj = standardTOdds + 1 - Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower);
		standardTNoTw = standardTOdds + 1 - Math.pow(this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend,towerPower);
		standardTNoChmpn = standardTOdds - championAdjustment + 0;
		standardTNoTP = standardTOdds + (Math.pow(innerAdjNoTP[t]/innerAdjNoTP[tD],innerPower)) - (Math.pow(innerAdj[t]/innerAdj[tD],innerPower)) -  this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork + 1;
		standardTNoAg = standardTOdds + (Math.pow(innerAdjNoAg[t]/innerAdjNoAg[tD],innerPower)) - (Math.pow(innerAdj[t]/innerAdj[tD],innerPower));*/

//groupBuffAdjraw groupGoldBuffraw

//		standardTOdds =  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1+ (this.team[t].compositeRating.teamwork-this.team[tD].compositeRating.teamwork)*.1+ (innerAdj[t]-innerAdj[tD])+	 championAdjustment*.1		+  (teamBuff[t] - teamBuff[tD])*.05		+ (groupBuffAdjraw[t]/groupBuffAdjraw[tD])*.01		+ (groupGoldBuffraw[t]/groupGoldBuffraw[tD])*.015;	
		
		if (customOn == true) {
			standardTOdds =  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.15+ (this.team[t].compositeRating.teamwork-this.team[tD].compositeRating.teamwork)*.15+ (innerAdj[t]-innerAdj[tD])*1.5+	 championAdjustment*.15		+  (teamBuff[t] - teamBuff[tD])*.025		+ (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.0005		+ (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.00075;			
			standardTNoSC = standardTOdds + (innerAdjNoSC[t]-innerAdjNoSC[tD])- (innerAdj[t]-innerAdj[tD]);
			standardTNoExp = standardTOdds  - (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.0005;
			standardTNoGold = standardTOdds   - (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.00075;	
			standardTNoTBuff = standardTOdds  - (teamBuff[t] - teamBuff[tD])*.025	;
			standardTNoTw = standardTOdds  -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.15 ;
			standardTNoChmpn = standardTOdds - championAdjustment*.15;
			standardTNoTP = standardTOdds  + (innerAdjNoTP[t]-innerAdjNoTP[tD])*1.5 - (innerAdj[t]-innerAdj[tD])*1.5  -  (this.team[t].compositeRating.teamwork-this.team[tD].compositeRating.teamwork )*.15;
			standardTNoAg = standardTOdds + (innerAdjNoAg[t]-innerAdjNoAg[tD])*1.5 - (innerAdj[t]-innerAdj[tD])*1.5;
			towerToChamp = (this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling)*.15 -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.15 ;

		} else {
			standardTOdds =  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1+ (this.team[t].compositeRating.teamwork-this.team[tD].compositeRating.teamwork)*.1+ (innerAdj[t]-innerAdj[tD])+	 championAdjustment*.1		+  (teamBuff[t] - teamBuff[tD])*.05		+ (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.001		+ (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.0015;	
			standardTNoSC = standardTOdds + (innerAdjNoSC[t]-innerAdjNoSC[tD])- (innerAdj[t]-innerAdj[tD]);
			standardTNoExp = standardTOdds  - (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.001;
			standardTNoGold = standardTOdds   - (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.0015;	
			standardTNoTBuff = standardTOdds  - (teamBuff[t] - teamBuff[tD])*.05	;
			standardTNoTw = standardTOdds  -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1 ;
			standardTNoChmpn = standardTOdds - championAdjustment*.1;
			standardTNoTP = standardTOdds  + (innerAdjNoTP[t]-innerAdjNoTP[tD]) - (innerAdj[t]-innerAdj[tD])  -  (this.team[t].compositeRating.teamwork-this.team[tD].compositeRating.teamwork )*.1;
			standardTNoAg = standardTOdds + (innerAdjNoAg[t]-innerAdjNoAg[tD]) - (innerAdj[t]-innerAdj[tD]);
			towerToChamp = (this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling)*.1 -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1 ;
			
		}
      // console.log( ((this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1)+ "  "+ ((this.team[t].compositeRating.teamwork-this.team[tD].compositeRating.teamwork)*.1)+ " " + (innerAdj[t]-innerAdj[tD])+" "+	 championAdjustment*.1		+" "+  ((teamBuff[t] - teamBuff[tD],teamBuffPower)*.05)+	" "	+ ((groupBuffAdjraw[t]/groupBuffAdjraw[tD])*.01)	+"	"+ ((groupGoldBuffraw[t]/groupGoldBuffraw[tD])*.015))
		
		// remove
	//	standardTNoTBuffAdj = standardTOdds + 1 - Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower);
		
		standardCOdds = standardTOdds + towerToChamp ;
		standardCNoSC = standardTNoSC + towerToChamp ;
		standardCNoExp = standardTNoExp + towerToChamp ;
		standardCNoGold = standardTNoGold + towerToChamp ;
		standardCNoTBuff = standardTNoTBuff + towerToChamp ;
//		standardCNoTBuffAdj = standardTOdds + 1 - Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower);
		standardCNoCK = standardTOdds  -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1 ;
	//	standardCNoCK =   -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1 ;
		standardCNoChmpn = standardTNoChmpn + towerToChamp ;
		standardCNoTP = standardTNoTP + towerToChamp ;
		standardCNoAg = standardTNoAg + towerToChamp ;


		standardCOdds += 1.15;
		standardCNoSC += 1.15;
		standardCNoExp += 1.15;
		standardCNoGold += 1.15;
		standardCNoTBuff += 1.15;
		standardCNoCK += 1.15;
		standardCNoChmpn += 1.15;
		standardCNoTP += 1.15;
		standardCNoAg += 1.15;
		
		standardCOdds /= 3.95;
		standardCNoSC /= 3.95;
		standardCNoExp /= 3.95;
		standardCNoGold /= 3.95;
		standardCNoTBuff /= 3.95;
		standardCNoCK /= 3.95;
		standardCNoChmpn /= 3.95;
		standardCNoTP /= 3.95;
		standardCNoAg /= 3.95;

		standardTOdds += 0.70;
		standardTNoSC += 0.70;
		standardTNoExp += 0.70;
		standardTNoGold += 0.70;
		standardTNoTBuff += 0.70;
		standardTNoTw += 0.70;
		standardTNoChmpn += 0.70;
		standardTNoTP += 0.70;
		standardTNoAg += 0.70;
		
		standardTOdds /= 3.15;
		standardTNoSC /= 3.15;
		standardTNoExp /= 3.15;
		standardTNoGold /= 3.15;
		standardTNoTBuff /= 3.15;
		standardTNoTw /= 3.15;
		standardTNoChmpn /= 3.15;
		standardTNoTP /= 3.15;
		standardTNoAg /= 3.15;

		standardTOdds *= inhibBaronSynergy/2.5;
		standardTNoSC *= inhibBaronSynergy/2.5;
		standardTNoExp *= inhibBaronSynergy/2.5;
		standardTNoGold *= inhibBaronSynergy/2.5;
		standardTNoTBuff *= inhibBaronSynergy/2.5;
		standardTNoTw *= inhibBaronSynergy/2.5;
		standardTNoChmpn *= inhibBaronSynergy/2.5;
		standardTNoTP *= inhibBaronSynergy/2.5;
		standardTNoAg *= inhibBaronSynergy/2.5;


		standardCOdds *= inhibBaronSynergy/2;
		standardCNoSC *= inhibBaronSynergy/2;
		standardCNoExp *= inhibBaronSynergy/2;
		standardCNoGold *= inhibBaronSynergy/2;
		standardCNoTBuff *= inhibBaronSynergy/2;
		standardCNoCK *= inhibBaronSynergy/2;
		standardCNoChmpn *= inhibBaronSynergy/2;
		standardCNoTP *= inhibBaronSynergy/2;
		standardCNoAg *= inhibBaronSynergy/2;
		
	//	console.log(this.t+" "+t+" "+standardTOdds+ " "+standardCOdds+" "+inhibBaronSynergy+" "+groupBuffAdjraw[t]+" " +groupBuffAdjraw[tD]+" "+groupGoldBuffraw[t]+" " +groupGoldBuffraw[tD]);

		
/*CK (CKOdds+1.15)/3.95  gives odds of 0-1 ,  .2 to .4 early then 0 to 1 late
TW (TWOdds+.70)/3.15   give odds of 0-1,  .06 to .15 early to 0 to 1 late*/		
/*
Tower Odds
Champion Odds

*/
		
		
/*Champion Kill CK*.1 (-.1+.1 to -.5,+5) +  
outer tower  TW*.1  (-.15 to +.15)  +   

same  inner (-.1 to .1) + Champ*.1 (-.15 to +.15) + TeamBuff*.05  (0 to +- .3) + groupBuffAdjraw*.01 (div, .06 time 0 to 1.35 time 30) + groupGoldBuffraw*.015 (div, .075 time 0 to .45 time 30)

divide level by 25, 

outer  -1.5
dragon   -1.5    
inner towre -2 or -3.5
baron -3.5 or -4.5
inhib tower -3.5 or -4.5
inhib -3.5 or -4.5
nexus tower -4.5 or -6.5
nexus -4.5 or -6.5*/

		
		
		
	/*	standardTOdds *= .01;
		standardTNoSC *= .01;
		standardTNoExp *= .01;
		standardTNoGold *= .01;
		standardTNoTBuff *= .01;
		standardTNoTBuffAdj *= .01;
		standardTNoTw *= .01;
		standardTNoChmpn *= .01;
		standardTNoTP *= .01;
		standardTNoAg *= .01;*/

				
		
		var OTLevel,ITLevel,HTLevel,DLevel,BLevel,NTLevel,NLevel;
		var baseLevelExp,baseLevelGld;
		
/*		OTLevel = (Math.pow(groupBuffAdjraw[t]+groupGoldBuffraw[t],.1)-1)*1;
		ITLevel = (Math.pow(groupBuffAdjraw[t]+groupGoldBuffraw[t],.15)-1)*1;
		HTLevel = (Math.pow(groupBuffAdjraw[t]+groupGoldBuffraw[t],.2)-1)*1;
		DLevel = (Math.pow(groupBuffAdjraw[t]+groupGoldBuffraw[t],.15)-1)*1;
		BLevel = (Math.pow(groupBuffAdjraw[t]+groupGoldBuffraw[t],.2) -1)*1;
		NTLevel = (Math.pow(groupBuffAdjraw[t]+groupGoldBuffraw[t],.22) -1)*1;
		NLevel = (Math.pow(groupBuffAdjraw[t]+groupGoldBuffraw[t],.22) -1)*1;*/
		
		baseLevelExp = (groupBuffAdjraw[t])/600;
		baseLevelGld = (groupGoldBuffraw[t])/600;
		
		OTLevel = baseLevelExp + baseLevelGld - 0.20 + this.t/60;
		DLevel = baseLevelExp + baseLevelGld - 0.20+ this.t/60;
		ITLevel = baseLevelExp + baseLevelGld - .45 + outerSum*.15 + this.t/60;
		BLevel = baseLevelExp + baseLevelGld - .45 + outerSum*.15 + this.t/60;
		HTLevel = baseLevelExp + baseLevelGld - .90 + innerSum*.30 + this.t/60;
		NTLevel = baseLevelExp + baseLevelGld - .90 + inhibTsum*.30 + this.t/60;
		NLevel = baseLevelExp + baseLevelGld - .90 + inhibTsum*.30 + this.t/60;

/*		OTLevel = baseLevelExp + baseLevelGld - 0.30;
		DLevel = baseLevelExp + baseLevelGld - 0.30;
		ITLevel = baseLevelExp + baseLevelGld - 1.25 + outerSum ;
		BLevel = baseLevelExp + baseLevelGld - 1.25 + outerSum ;
		HTLevel = baseLevelExp + baseLevelGld - 1.25 + innerSum ;
		NTLevel = baseLevelExp + baseLevelGld - 1.25 + inhibTsum ;
		NLevel = baseLevelExp + baseLevelGld - .25;*/
		
/*		OTLevel = baseLevelExp + baseLevelGld - 0.25;
		DLevel = baseLevelExp + baseLevelGld - 0.25;
		ITLevel = baseLevelExp + baseLevelGld - 0.30;
		BLevel = baseLevelExp + baseLevelGld - .35;
		HTLevel = baseLevelExp + baseLevelGld - .35;
		NTLevel = baseLevelExp + baseLevelGld - .85;
		NLevel = baseLevelExp + baseLevelGld - .85;*/
		
		
/*		OTLevel = baseLevelExp + baseLevelGld - 0.6;
		DLevel = baseLevelExp + baseLevelGld - 0.6;
		ITLevel = baseLevelExp + baseLevelGld - 0.75;
		BLevel = baseLevelExp + baseLevelGld - 1.00;
		HTLevel = baseLevelExp + baseLevelGld - 1.00;
		NTLevel = baseLevelExp + baseLevelGld - 1.25;
		NLevel = baseLevelExp + baseLevelGld - 1.25;*/

		//console.log(t+" "+this.t+" "+standardTOdds+" "+OTLevel+" "+DLevel+" "+ITLevel+" "+HTLevel+" "+NTLevel+" "+NLevel);
		//standardCKOdds =  (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+Math.pow(this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend,towerPower)+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1;
		
//console.log("START"+this.t);
//		outerTowerOdds = 1.5*inhibBaronSynergy*2.0*(championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(.09*(this.t-6)*teamBuff[t]/teamBuff[tD]*((groupBuff+50)/50)*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*Math.pow(this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend,towerPower)));

//							  groupBuffAdjraw[j]  /= playerBuff[j][playerDeaths[j][i]];
//							  groupGoldBuffraw[j] /= playerGoldBuff[j][playerDeaths[j][i]];

//		outerTowerOdds = (outerTowerSum+innerTowerSum+1)*.1*objectiveOddsAdjustment*inhibBaronSynergy*2.0*(championAdjustment/50+(Math.pow(outerAdj[t]/outerAdj[tD],outerPower))*(.09*(this.t-6)*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*((Math.pow(groupGoldBuff,groupGoldBuffPower)+50)/50)*((Math.pow(groupBuff,groupBuffPower)+50)/50)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)*Math.pow(this.team[t].compositeRating.toweringAttack/(this.team[tD].compositeRating.toweringDefend+.01),towerPower)));
		outerTowerOdds = OTLevel+ standardTOdds;
	//	console.log(this.t+" "+this.dt+" outer odds: "+outerTowerOdds+" exp: "+groupBuffAdjraw[t]+" gold: "+groupGoldBuffraw[t]+" "+2);
		outerTowerOddsNoSC = OTLevel + standardTNoSC;
		outerTowerOddsNoExp = OTLevel + standardTNoExp - baseLevelExp ;
		outerTowerOddsNoGold = OTLevel + standardTNoGold -   baseLevelGld;
		outerTowerOddsNoTBuff = OTLevel + standardTNoTBuff;
		outerTowerOddsNoTBuffAdj = OTLevel + standardTNoTBuffAdj;

		outerTowerOddsNoTw = OTLevel + standardTNoTw;
		outerTowerOddsNoChmpn = OTLevel+ standardTNoChmpn;
		outerTowerOddsNoTP = OTLevel + standardTNoTP;
		outerTowerOddsNoAg = OTLevel + standardTNoAg;

	//	console.log(t+" "+this.t+" outerTowerOdds "+outerTowerOdds+" exp "+baseLevelExp+" gld "+baseLevelGld+" stnd "+standardTOdds +" alive  " +teamBuffAdj+" exp "+groupBuffAdjraw+" gold " +groupGoldBuffraw);		
		
		//console.log(this.t+" "+t+" outer odds "+outerTowerOdds+" OTLevel "+OTLevel+" standardTNoTw "+standardTNoTw+" teambuff "+teamBuffAdj +" gbt "+groupBuffAdjraw[t]+" gbtd "+groupBuffAdjraw[tD]+" ggbt "+groupGoldBuffraw[t]+" ggbtd "+groupGoldBuffraw[tD]);

		// do tower, champion, champion killing, team player, 
		// gold/exp can be used for CS?
		
		
		if (this.t<10) {
	//		console.log(outerTowerOdds);			
		
//			outerTowerOdds = -0.01;
			
		} else if (this.t>20) {
		   
//			if (outerTowerOdds>.05) {
			if (outerTowerOdds<.01) {

		//		outerTowerOdds = 0.01;
			//	outerTowerOdds *= 10;
			} else {
				//outerTowerOdds = 0.25;
			}
		} else {
		}
		//console.log(outerTowerSum+" "+innerTowerSum+" "+outerTowerOdds);
//		if (outerTowerOdds<.2) {
//			outerTowerOdds = .2;
		if (outerTowerOdds<.05) {
		//	outerTowerOdds = .05;
		}
		dragonOdds = DLevel + standardTOdds;

//		dragonOdds = 10*2*objectiveOddsAdjustment*inhibBaronSynergy*8*(championAdjustment/50+(Math.pow(innerAdj[t]/innerAdj[tD],innerPower))*(Math.pow(outerAdj[t]/outerAdj[tD],outerPower))*(.15*groupNumber-.20)*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*Math.pow(groupGoldBuff,groupGoldBuffPower)*Math.pow(groupBuff,groupBuffPower)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower));
		//dragonOddsNoSC = 10*2*objectiveOddsAdjustment*inhibBaronSynergy*8*(championAdjustment/50+(Math.pow(innerAdjNoSC[t]/innerAdjNoSC[tD],innerPower))*(Math.pow(outerAdjNoSC[t]/outerAdjNoSC[tD],outerPower))*(.15*groupNumber-.20)*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*Math.pow(groupGoldBuff,groupGoldBuffPower)*Math.pow(groupBuff,groupBuffPower)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower));
		
		if (dragonOdds<.05) {
		//	dragonOdds = .05;
		}
				

		innerTowerOdds = ITLevel+ standardTOdds;;
		

		innerTowerOddsNoSC = ITLevel + standardTNoSC;
		innerTowerOddsNoExp = ITLevel + standardTNoExp - baseLevelExp ;
		innerTowerOddsNoGold = ITLevel + standardTNoGold -  baseLevelGld;
		innerTowerOddsNoTBuff = ITLevel + standardTNoTBuff;
		innerTowerOddsNoTBuffAdj = ITLevel + standardTNoTBuffAdj;

		innerTowerOddsNoTw = ITLevel + standardTNoTw;
		innerTowerOddsNoChmpn = ITLevel + standardTNoChmpn;
		innerTowerOddsNoTP = ITLevel + standardTNoTP;
		innerTowerOddsNoAg = ITLevel + standardTNoAg;
				
		
		if (this.t<12.5) {
		//	innerTowerOdds = -0.01;
			
		} else if (this.t>40) {
		/*	if (innerTowerOdds>0) {
				innerTowerOdds = 1.01;
			} else {
				innerTowerOdds = 0.50;
			}*/
			
		} else {
		}


//console.log(innerTowerOdds);
		if (this.t<20) {
			baronOdds = -.01;
		} else {
			
			
			baronOdds = BLevel + standardTOdds;;
			
//			baronOdds = 10*2*objectiveOddsAdjustment*inhibBaronSynergy*2*((championAdjustment/50+(Math.pow(innerAdj[t]/innerAdj[tD],innerPower))*(.10*groupNumber-.20)*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*Math.pow(groupGoldBuff,groupGoldBuffPower)*Math.pow(groupBuff,groupBuffPower)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower))*.5);
		}
		
//console.log(baronOdds);

		inhibTowerOdds = HTLevel + standardTOdds;;
		inhibOdds = HTLevel + standardTOdds;;


		inhibTowerOddsNoSC = HTLevel + standardTNoSC;
		inhibTowerOddsNoExp = HTLevel + standardTNoExp - baseLevelExp ;
		inhibTowerOddsNoGold = HTLevel + standardTNoGold -   baseLevelGld;
		inhibTowerOddsNoTBuff = HTLevel + standardTNoTBuff;
		inhibTowerOddsNoTBuffAdj = HTLevel + standardTNoTBuffAdj;

		inhibTowerOddsNoTw = HTLevel + standardTNoTw;
		inhibTowerOddsNoChmpn = HTLevel + standardTNoChmpn;
		inhibTowerOddsNoTP = HTLevel + standardTNoTP;
		inhibTowerOddsNoAg = HTLevel + standardTNoAg;
			
		
		if (this.t<15) {
		//	inhibTowerOdds = -0.01;
		//	inhibOdds = -0.01;
		} else if (this.t>50) {
			/*if (inhibTowerOdds>0) {
				inhibTowerOdds = 1.01;
				inhibOdds = 1.01;
			} else {
				inhibTowerOdds = 0.50;
				inhibOdds = 0.50;
			}*/		
		} else {
		}
		nexusTowerOdds = NTLevel + standardTOdds;

		nexusTowerOddsNoSC = NTLevel + standardTNoSC;
		nexusTowerOddsNoExp = NTLevel + standardTNoExp - baseLevelExp ;
		nexusTowerOddsNoGold = NTLevel + standardTNoGold -  baseLevelGld;
		nexusTowerOddsNoTBuff = NTLevel + standardTNoTBuff;
		nexusTowerOddsNoTBuffAdj = NTLevel + standardTNoTBuffAdj;

		nexusTowerOddsNoTw = NTLevel + standardTNoTw;
		nexusTowerOddsNoChmpn = NTLevel + standardTNoChmpn;
		nexusTowerOddsNoTP = NTLevel + standardTNoTP;
		nexusTowerOddsNoAg = NTLevel + standardTNoAg;
		


		nexusOdds = NLevel + standardTOdds;
		
		
//		nexusOdds = objectiveOddsAdjustment*inhibBaronSynergy*2*(championAdjustment/50+(Math.pow(innerAdj[t]/innerAdj[tD],innerPower))*.30*(inhibList[t][0]+inhibList[t][1]+inhibList[t][2]+1 )*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*Math.pow(groupGoldBuff,groupGoldBuffPower)*Math.pow(groupBuff,groupBuffPower)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)*Math.pow(this.team[t].compositeRating.toweringAttack/(this.team[tD].compositeRating.toweringDefend+.01),towerPower));

		if (this.t<20) {
//			nexusTowerOdds = .1*objectiveOddsAdjustment*inhibBaronSynergy*2*(championAdjustment/50+(Math.pow(innerAdj[t]/innerAdj[tD],innerPower))*.02*(inhibList[t][0]+inhibList[t][1]+inhibList[t][2]+1 )*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*Math.pow(groupGoldBuff,groupGoldBuffPower)*Math.pow(groupBuff,groupBuffPower)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)*Math.pow(this.team[t].compositeRating.toweringAttack/(this.team[tD].compositeRating.toweringDefend+.01),towerPower));
//			nexusTowerOddsNoSC = .1*objectiveOddsAdjustment*inhibBaronSynergy*2*(championAdjustment/50+(Math.pow(innerAdjNoSC[t]/innerAdjNoSC[tD],innerPower))*.02*(inhibList[t][0]+inhibList[t][1]+inhibList[t][2]+1 )*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*Math.pow(groupGoldBuff,groupGoldBuffPower)*Math.pow(groupBuff,groupBuffPower)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)*Math.pow(this.team[t].compositeRating.toweringAttack/(this.team[tD].compositeRating.toweringDefend+.01),towerPower));

//			nexusOdds = objectiveOddsAdjustment*inhibBaronSynergy*2*(championAdjustment/50+(Math.pow(innerAdj[t]/innerAdj[tD],innerPower))*.30*(inhibList[t][0]+inhibList[t][1]+inhibList[t][2]+1 )*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*Math.pow(groupGoldBuff,groupGoldBuffPower)*Math.pow(groupBuff,groupBuffPower)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)*Math.pow(this.team[t].compositeRating.toweringAttack/(this.team[tD].compositeRating.toweringDefend+.01),towerPower));			
		} else if (this.t>60) {
		/*	if (nexusTowerOdds>0) {
				nexusTowerOdds = 1.01;
				nexusOdds = 1.01;
			} else {
				nexusTowerOdds = 0.50;
				nexusOdds = 0.50;
			}			*/
			
		} else {
		}
		
	    if (this.t<10) {
/*			champOdds = (championKillOddsEarly*(( (Math.pow(outerAdj[t]/outerAdj[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));

			champOddsNoSC = (championKillOddsEarly*(( (Math.pow(outerAdjNoSC[t]/outerAdjNoSC[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoExp = (championKillOddsEarly*(( (Math.pow(outerAdj[t]/outerAdj[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+1+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoGold = (championKillOddsEarly*(( (Math.pow(outerAdj[t]/outerAdj[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+1+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoTBuff = (championKillOddsEarly*(( (Math.pow(outerAdj[t]/outerAdj[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+1+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoTBuffAdj = (championKillOddsEarly*(( (Math.pow(outerAdj[t]/outerAdj[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+1-7)*1+.5+boostT1+boostT2));

			champOddsNoCK = (championKillOddsEarly*(( (Math.pow(outerAdj[t]/outerAdj[tD],outerPower))+1+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoChmpn = (championKillOddsEarly*(( (Math.pow(outerAdj[t]/outerAdj[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+0+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-8)*.5+.05+boostT1+boostT2));
			champOddsNoTP = (championKillOddsEarly*(( (Math.pow(outerAdj[t]/outerAdj[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+1+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoAg = (championKillOddsEarly*(( (Math.pow(outerAdjNoAg[t]/outerAdjNoAg[tD],outerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));*/
			
			champOdds = standardCOdds-championKillOddsEarly;
			champOddsNoSC = standardCNoSC-championKillOddsEarly;
			champOddsNoExp =  standardCNoExp-championKillOddsEarly;
			champOddsNoGold = standardCNoGold-championKillOddsEarly;
			champOddsNoTBuff = standardCNoTBuff-championKillOddsEarly;
			champOddsNoTBuffAdj = standardCNoTBuffAdj-championKillOddsEarly;

			champOddsNoCK =  standardCNoCK-championKillOddsEarly;
			champOddsNoChmpn = standardCNoChmpn-championKillOddsEarly;
			champOddsNoTP = standardCNoTP-championKillOddsEarly;
			champOddsNoAg = standardCNoAg-championKillOddsEarly;
			
			//console.log(this.t+" "+t+" "+champOdds);
		} else {
			/*champOdds = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-8 )*.5+1+boostT1+boostT2));
			champOddsNoSC = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdjNoSC[t]/innerAdjNoSC[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoExp = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+1+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoGold = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+1+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoTBuff = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+1+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoTBuffAdj = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+1-7)*1+.5+boostT1+boostT2));
			champOddsNoCK = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+1+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoChmpn = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+0+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoTP = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+1+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));
			champOddsNoAg = (championKillOddsAdjustment*inhibBaronSynergy*(( (Math.pow(innerAdjNoAg[t]/innerAdjNoAg[tD],innerPower))+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+championAdjustment+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+Math.pow(groupGoldBuff,groupGoldBuffPower)+Math.pow(groupBuff,groupBuffPower)+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower)-7)*1+.5+boostT1+boostT2));*/


			champOdds = championKillOddsAdjustment*standardCOdds;
			champOddsNoSC = championKillOddsAdjustment*standardCNoSC;
			champOddsNoExp =  championKillOddsAdjustment*standardCNoExp;
			champOddsNoGold = championKillOddsAdjustment*standardCNoGold;
			champOddsNoTBuff = championKillOddsAdjustment*standardCNoTBuff;
			champOddsNoTBuffAdj = championKillOddsAdjustment*standardCNoTBuffAdj;

			champOddsNoCK = championKillOddsAdjustment*standardCNoCK;
			champOddsNoChmpn = championKillOddsAdjustment*standardCNoChmpn;
			champOddsNoTP = championKillOddsAdjustment*standardCNoTP;
			champOddsNoAg = championKillOddsAdjustment*standardCNoAg;			
			//console.log(this.t+" "+t+" "+champOdds);
			//console.log(this.t+" odds: "+champOdds+" "+champOddsNoSC+" "+champOddsNoExp+" "+champOddsNoGold+" "+champOddsNoTBuff+" "+champOddsNoTBuffAdj+" "+champOddsNoCK+" "+champOddsNoChmpn+" "+champOddsNoTP+" "+champOddsNoAg)
		//	console.log(this.t+" "+championKillOddsAdjustment+" "+inhibBaronSynergy+" "+innerAdj[t]+" "+innerAdj[tD]+" "+this.team[t].compositeRating.championKilling+" "+this.team[t].compositeRating.teamwork+" "+this.team[tD].compositeRating.championKilling+" "+this.team[tD].compositeRating.teamwork+" "+championAdjustment+" "+teamBuff[t]+" "+teamBuff[tD]+" "+groupGoldBuff+" "+groupBuff+" "+teamBuffAdj[t]+" "+teamBuffAdj[tD])
		//////////////	console.log(this.t+" raw: "+championKillOddsAdjustment+" "+inhibBaronSynergy+" "+innerAdj[t]/innerAdj[tD]+" "+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+" "+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+" "+championAdjustment+" "+teamBuff[t]/teamBuff[tD]+" "+groupGoldBuff+" "+groupBuff+" "+teamBuffAdj[t]/teamBuffAdj[tD])
//			console.log(this.t+" odds: "+champOdds+" adjusted: "+championKillOddsAdjustment+" inhib "+inhibBaronSynergy+" inner "+(Math.pow(innerAdj[t]/innerAdj[tD],innerPower))+" CK "+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+" TP "+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+" ChampAdj "+championAdjustment+" teambuff "+Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)+" goldbuff "+Math.pow(groupGoldBuff,groupGoldBuffPower)+" expbuff "+Math.pow(groupBuff,groupBuffPower)+" #members "+Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower) );
//			console.log(this.t+" inner "+(Math.pow(innerAdj[t]/innerAdj[tD],innerPower)));


/*
inner .6 to 1.7 / -.1 to .1 -
CK     0 to infl /  -1, +1     -5 to +5
TP     .6 to 1.7 / -.1 to .1 -
Champ   -1.5, 1.5 
TeamBuff      .3 to 3.3 /   0 grows to +/- 6   -
groupGoldBuff  time 10, still around 1 (.8, 1.2); time 18 .6 to 1.8; time 20 .2, 5; time 30  
groupGoldBuff  1 death time 10, still around 1 (.8, 1.2); time 13 .15 to 7; time 16 .01, 100 (when down 1 player?)
groupGoldBuff  2 deaths time 10, still around 1 (.8, 1.2); time 15 .03 to 27; time 16 .01, 100 (when down 2 players?)
groupBuff  0 to 100 right away, seems crazy
teamBuffAdj  5,4,3 how many team champions alive

groupBuffAdjraw[t]  time 10 1.5 to 9, time 15 1.5 to 23, time 20 1.5 to 52, time 25 2 to 75; time 30 135 to 1.5 
groupGoldBuffraw[t] time 10  3 to 17, time 15 3 to 15, time 20 5 to 30, time 25 1.37 to 36; time 30 3 to 45

innerAdjNoSC +/  -.05 to +.05
innerAdjNoAg +/  -.05 to +.05
innerAdjNoTP +/  -.083 to +.083

inhibBaronSynergy  time 10 1; time 15 1 ; time 20 1; time 25  1.5 ; time 30  2.25;


Towering  / time 10 .75, 1.25, with deaths can become infinity, .5 to 2 later
Towering  +- time 10 +.75, -.75, time 28 -1.5,+1.5

Champion Kill CK*.1 (-.1+.1 to -.5,+5) +  
outer tower  TW*.1  (-.15 to +.15)  +   

same  inner (-.1 to .1) + TP (-.1 to .1) + Champ*.1 (-.15 to +.15) + TeamBuff*.05  (0 to +- .3) + groupBuffAdjraw*.01 (div, .06 time 0 to 1.35 time 30) + groupGoldBuffraw*.015 (div, .075 time 0 to .45 time 30)

range -.35 to -.65, +.485 to +2.3
total range CK -.45 to -1.15,  .585 to +2.8
total range TW -.50 to -.70,  .635 to +2.45

CK raw range .855 to 3.95, 
TW raw range .955 to 3.15, 

CK (CKOdds+1.15)/3.95  gives odds of 0-1 ,  .2 to .4 early then 0 to 1 late
TW (TWOdds+.70)/3.15   give odds of 0-1,  .06 to .15 early to 0 to 1 late

level  50/50 groupBuff groupGoldbuff

time 10 min 4.5 max 26, time 15 4.5 to 38, time 20 6.5 to 82, time 25 3.36 to 111, time 30 4.5 to 180

formula?

normalize the two areas, divide level by ? or multiply odds by?

divide level by 25, so 1, 1.5, 3, 4, 6, then subtract (0 to 1 plus 0 to 1 minus 1.5 = -1.5 to .5 for 10 minute outter tower ) 1.5, 2, 3.5, 4.5, 6.5

what range do you give non level items?

divide level by 25, 

outer  -1.5
dragon   -1.5    
inner towre -2 or -3.5
baron -3.5 or -4.5
inhib tower -3.5 or -4.5
inhib -3.5 or -4.5
nexus tower -4.5 or -6.5
nexus -4.5 or -6.5

should allow each game to finish by 30 minute mark, better teams quickly, weaker teams longer with luck


change CS to be based on dt
make dt based on time and 


Champion Kill CK*.1 (-.1+.1 to -.5,+5) +  
outer tower  TW*.1  (-.15 to +.15)  +   

same  inner (-.1 to .1) + Champ*.1 (-.15 to +.15) + TeamBuff*.05  (0 to +- .3) + groupBuffAdjraw*.01 (div, .06 time 0 to 1.35 time 30) + groupGoldBuffraw*.015 (div, .075 time 0 to .45 time 30)

divide level by 25, 

outer  -1.5
dragon   -1.5    
inner towre -2 or -3.5
baron -3.5 or -4.5
inhib tower -3.5 or -4.5
inhib -3.5 or -4.5
nexus tower -4.5 or -6.5
nexus -4.5 or -6.5



*/


var testck;
//testck = (this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling);
//testck = this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork
//testck = this.team[t].compositeRating.teamwork-this.team[tD].compositeRating.teamwork
//testck = innerAdj[t]-innerAdj[tD];
//testck = championAdjustment;
//testck = teamBuff[t]/teamBuff[tD];
//testck = teamBuff[t]-teamBuff[tD];
//testck = groupGoldBuff;
//testck = groupBuff;
//testck = teamBuffAdj[t];
//testck = groupBuffAdjraw[t];
//testck = groupGoldBuffraw[t];
//testck = innerAdjNoSC[t]-innerAdjNoSC[tD];
//testck = innerAdjNoAg[t]-innerAdjNoAg[tD];
//testck = inhibBaronSynergy;
//testck = this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend;
//testck = this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend;
//testck = innerAdjNoTP[t]-innerAdjNoTP[tD];






//			console.log(t+" "+this.t+" Champ "+testck+" "+innerAdj[t] +" "+innerAdj[tD]);
//			console.log(t+" "+this.t+" TP +- "+testck+" "+teamBuffAdj);
//			console.log(t+" "+this.t+" groupBuffAdjraw "+groupBuffAdjraw+" "+teamBuffAdj);
//			console.log(t+" "+this.t+" groupGoldBuffraw "+groupGoldBuffraw+" "+teamBuffAdj);
		//	console.log(this.t+" "+groupBuffAdjraw[t]+" "+groupBuffAdjraw[tD]+" "+groupGoldBuffraw[t]+" "+groupGoldBuffraw[tD]+" "+championKillOddsAdjustment+" "+inhibBaronSynergy+" "+innerAdj[t]/innerAdj[tD]+" "+this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling+" "+this.team[t].compositeRating.teamwork/this.team[tD].compositeRating.teamwork+" "+championAdjustment+" "+teamBuff[t]/teamBuff[tD]+" "+groupGoldBuff+" "+groupBuff+" "+teamBuffAdj[t]/teamBuffAdj[tD])
 //groupBuffAdjraw[j]  /= playerBuff[j][playerDeaths[j][i]];
//							  groupGoldBuffraw[j] /= playerGoldBuff[j][playerDeaths[j][i]];			
		}
	//	console.log(groupNumber+" "+this.t+" "+champOdds+" "+champOddsNoSC+" "+innerTowerOdds+" "+innerTowerOddsNoSC+" "+nexusTowerOdds+" "+nexusTowerOddsNoSC+" "+outerTowerOdds+" "+outerTowerOddsNoSC)
//		if (champOdds <= .15) {
		if (champOdds <= .05) {
//		  champOdds = .15;
		//  champOdds = .05;
		}
		
		
		if (typeof(g.customRosterMode) == 'undefined') {
		} else {
			if (g.customRosterMode)  {
			
			} else {
			}
		}		
//console.log(champOdds);

//		if ((this.t<1) || ((this.t>10) && (this.t<11)) || ((this.t>10) && (this.t<11)) || ((this.t>20) && (this.t<21)) || ((this.t>30) && (this.t<31)) || ((this.t>40) && (this.t<41))) {
		if (this.t>100) {
		 //  console.log(this.t);		
	/*	   console.log("(outerAdj[t]-outerAdj[tD]): "+(outerAdj[t]-outerAdj[tD]));
		   console.log("teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5): "+teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5));
		   console.log("teamBuff[t]/teamBuff[tD]: "+teamBuff[t]/teamBuff[tD]);
		   console.log("groupBuff: "+groupBuff);
		   console.log("inhibBaronSynergy: "+inhibBaronSynergy);		   
		   console.log("championAdjustment: "+championAdjustment);		   
		   console.log("outerAdj[t]: "+outerAdj[t]);		   
		   console.log("outerAdj[tD]: "+outerAdj[tD]);		   
		   console.log("teamBuff[t]: "+teamBuff[t]);
		   console.log("teamBuff[tD]: "+teamBuff[tD]);
		   console.log("this.team[t].compositeRating.structureAttack: "+this.team[t].compositeRating.structureAttack);
		   console.log("this.team[t].compositeRating.structureAttack: "+this.team[t].compositeRating.structureAttack);
		   console.log("this.team[tD].compositeRating.structureAttack: "+this.team[tD].compositeRating.structureAttack);
		   console.log("this.team[t].compositeRating.structureDefend: "+this.team[t].compositeRating.structureDefend);
		   console.log("this.team[tD].compositeRating.structureDefend: "+this.team[tD].compositeRating.structureDefend);
		   console.log("this.team[t].compositeRating.toweringDefend: "+this.team[t].compositeRating.toweringDefend);
		   console.log("this.team[tD].compositeRating.toweringDefend: "+this.team[tD].compositeRating.toweringDefend);
		   console.log("this.team[t].compositeRating.toweringAttack: "+this.team[t].compositeRating.toweringAttack);
		   console.log("this.team[tD].compositeRating.toweringAttack: "+this.team[tD].compositeRating.toweringAttack);
		   console.log("this.team[t].compositeRating.championKilling: "+this.team[t].compositeRating.championKilling);
		   console.log("this.team[tD].compositeRating.championKilling: "+this.team[tD].compositeRating.championKilling);

		   console.log("d: "+dragonOdds);		   
		   console.log("in: "+innerTowerOdds);		   
		   console.log("b: "+baronOdds);		   
		   console.log("inht: "+inhibTowerOdds);		   
		   console.log("inh: "+inhibOdds);		   
		   console.log("nt: "+nexusTowerOdds);		   
		   console.log("n: "+nexusOdds);		   
		   console.log("ck: "+champOdds);		*/   
		   
		}
		
		if ((this.t>9) && (this.t<10)) {
		 /*  console.log(this.t);
		   console.log("(outerAdj[t]-outerAdj[tD]): "+(outerAdj[t]-outerAdj[tD]));
		   console.log("teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5): "+teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5));
		   console.log("teamBuff[t]/teamBuff[tD]: "+teamBuff[t]/teamBuff[tD]);
		   console.log("groupBuff: "+groupBuff);
		   console.log("teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5): "+(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5));
		   console.log("out: "+outerTowerOdds);
		   console.log("d: "+dragonOdds);		   
		   console.log("in: "+innerTowerOdds);		   
		   console.log("b: "+baronOdds);		   
		   console.log("inht: "+inhibTowerOdds);		   
		   console.log("inh: "+inhibOdds);		   
		   console.log("nt: "+nexusTowerOdds);		   
		   console.log("n: "+nexusOdds);		   
		   console.log("ck: "+champOdds);		   */
		   
		}		
	//	console.log(championAdjustment);
	/*	console.log(groupAttack[0]);
		console.log(groupAttack[1]);
		console.log(groupDefense[0]);
		console.log(groupDefense[1]);
		console.log(groupAbility[0]);
		console.log(groupAbility[1]);*/
//		*this.team[i].player[j].compositeRating.toweringAttack/this.team[iO].player[j].compositeRating.toweringAttack
		
		//*this.team[t].compositeRating.monstersKillingBD/this.team[tD].compositeRating.monstersKillingBD

		//////////////////////////// Player Kills/Deaths/Assists
		
		// group score, role (ADC protected? Support less, Jungle less, Top more?)
		// eventually focus more on attack/defense/ability (high attack/low defense greater death/attack rate, ability more death less kills at first, but then switches late game)
		// 
		
					// console.log("got here");
	///////////////// FROM DRAGON, USED TO KILL
		//console.log(this.t+" groupBuff: "+groupBuff+" "+teamBuff[t]+" "+teamBuff[tD]);
		
//				playerDeaths = [[0,0,0,0,0],[0,0,0,0,0]];
//		playerRespawn = [[0,0,0,0,0],[0,0,0,0,0]];

		//console.log(p.length);
		
		
		
     /*   for (i = 0; i < groupNumber; i++) {
		   
		   //this.team[j].compositeRating.championKilling
		   
		}*/
	//	console.log(this.team[t].compositeRating.championKilling);
/*	console.log(this.team[0].player[0].champRel[0].name);
		console.log(this.team[0].player[0].champRel[0].ratings.attack);
		console.log(this.team[0].player[0].champRel[0].ratings.defense);
		console.log(this.team[0].player[0].champRel[0].ratings.ability);*/
//		if ( ((playerDeaths[t][0] == 0)  && (playerRespawn[t][0] == 9999) && (outcome != "done") ) {


		
		

		
		////TODO
		// make CS feed into player and team buff
		//
// console.log("got here");		
		////////////////////////// Minions (CreepScore)
		                //<td data-bind="text: tp() + '-' + tpa()"></td>
                //<td data-bind="text: ft() + '-' + fta()"></td>
	//			console.log(this.team[t].player[0].pos)
	//console.log(this.done);
//	   if ( (this.t > (.90+.10)) && (this.done == false) ) {  // 90 to spawn 10 to reach champion
	   if ( (this.t > (.90+.10)) ) {  // 90 to spawn 10 to reach champion
		   for (i = 0; i < 2; i++) {	       
				iO =  (i-1)*(i-1);  
				for (j = 0; j < 5; j++) {					
				
//				    if (this.team[i].player[j].pos == "SUP") {
				    if (j == 4) {
//						creepOdds = .36;	playerGoldBuff
						creepOdds = .036*.99+.036*playerGoldBuff[i][j]/playerGoldBuff[iO][j]*playerBuff[i][j]/playerBuff[iO][j]*.01*this.team[i].player[j].compositeRating.minionControl/this.team[iO].player[j].compositeRating.minionControl;					
						if (creepOdds> 0.1) {
							creepOdds = .1;
						}
						
//						creepOdds = .036*playerBuff[i][j]/playerBuff[iO][j];					
//					} else if (this.team[i].player[j].pos == "JGL") {
					} else if (j == 1) {
//						creepOdds = .09*playerBuff[i][j]/playerBuff[iO][j];					
						creepOdds = .09*.99+.09*playerGoldBuff[i][j]/playerGoldBuff[iO][j]*playerBuff[i][j]/playerBuff[iO][j]*.01*this.team[i].player[j].compositeRating.minionControl/this.team[iO].player[j].compositeRating.minionControl;											
//					} else if (this.team[i].player[j].pos == "TOP") {
					} else if (j == 0) {

//						creepOdds = .09*playerBuff[i][j]/playerBuff[iO][j];					
						creepOdds = .50*.99+.50*playerGoldBuff[i][j]/playerGoldBuff[iO][j]*playerBuff[i][j]/playerBuff[iO][j]*.01*this.team[i].player[j].compositeRating.minionControl/this.team[iO].player[j].compositeRating.minionControl;											
//					} else if (this.team[i].player[j].pos == "MID") {
					} else if (j == 2) {
//						creepOdds = .09*playerBuff[i][j]/playerBuff[iO][j];					
						creepOdds = .65*.99+.65*playerGoldBuff[i][j]/playerGoldBuff[iO][j]*playerBuff[i][j]/playerBuff[iO][j]*.01*this.team[i].player[j].compositeRating.minionControl/this.team[iO].player[j].compositeRating.minionControl;											
					} else {
						creepOdds = .7*.99+.7*playerGoldBuff[i][j]/playerGoldBuff[iO][j]*playerBuff[i][j]/playerBuff[iO][j]*.01*this.team[i].player[j].compositeRating.minionControl/this.team[iO].player[j].compositeRating.minionControl;											
						// support bonus	
						creepOdds *= .90+.05*playerGoldBuff[i][4]/playerGoldBuff[iO][4]*playerBuff[i][4]/playerBuff[iO][4]+.05*this.team[i].player[4].compositeRating.teamwork/this.team[iO].player[4].compositeRating.teamwork;											
//						creepOdds = .6*playerBuff[i][j]/playerBuff[iO][j];					
					}
					
					// opposing player dead always get creeps
					if (playerDeaths[iO][j] == 1) { 								
					   creepOdds = 1;
					}
				    if ( creepOdds > Math.random()-.05 ) {
//						creeps =  random.randInt(3,  4);
//						creeps =  random.randInt(4,  5);
						creeps =  random.randInt(1,  1);
						/*if ( Math.random()<.25 ) {
							creeps =  random.randInt(2,  2);
						}*/	
						playerBuff[i][j] *= (1+creeps*creepPlayerBuff);
						if (j==3) {
							playerBuff[i][4] *= (1+creeps*creepPlayerBuff);
						}
					} else {
					     creeps = 0;
						//creeps =  random.randInt(0,  1); 
					}
					
					
//					goldTime = Math.round(creeps*(40*.1+23*.45+17*.45));
					goldTime = Math.round(creeps*(40*.1+23*.45+17*.45))/1000;

					
					if (playerDeaths[i][j] == 0) { 								
						this.recordStat(i, j, "trb",goldTime);		
						this.recordStat(i, j, "tp",creeps);		
						if (this.t<20) {
							this.recordStat(i, j, "ft",creeps);		
						}
						this.recordStat(iO, j, "stl",goldTime);	
						this.recordStat(iO, j, "tpa",creeps);		
						if (this.t<20) {
							this.recordStat(iO, j, "fta",creeps);		
						}
					//	playerGoldBuff[i][j] += goldTime;
//						playerGoldBuff[i][j] *= (1+(goldTime/5));	
						playerGoldBuff[i][j] *= (1+goldTime/playerGoldBuff[i][j]);		
						
					}
					
				}
			}		
		}
		
// console.log("got here");		
		///////////////////// Jungle monsters
		
		//http://leagueoflegends.wikia.com/wiki/Jungling?file=Jungle_camps_SR.jpg
		// 4 yellow, 1 red, blue (baron and dragon handled elsewhere)
	   if ( (this.t > (.90+.10)) && (this.done == false) ) {  // 90 to spawn 10 to reach champion
		   for (i = 0; i < 2; i++) {	       
				iO =  (i-1)*(i-1);  
				for (j = 0; j < 5; j++) {
//				    if ((this.team[i].player[j].pos == "JGL")) {
				    if ((j == 1)) {
//						creepOdds = .36;		
						if (this.t>5) {
							creepOdds = .25*.95+.15*playerBuff[i][j]/playerBuff[iO][j]*.05*(this.team[i].player[j].compositeRating.monstersKillingJ+5)/(this.team[iO].player[j].compositeRating.monstersKillingJ+5);					
							creepOddsOpp = .05*playerBuff[i][j]/playerBuff[iO][j]*(this.team[i].player[j].compositeRating.monstersKillingJ+5)/(this.team[iO].player[j].compositeRating.monstersKillingJ+5);					
						} else {
							creepOdds = .25*playerBuff[i][j]*this.team[i].player[j].compositeRating.monstersKillingJ/50;
							creepOddsOpp = 0;					
						}
						
					//	console.log("JGL: "+creepOdds+" "+creepOddsOpp);
						if (playerDeaths[iO][j] == 1) { 								
						   creepOdds = 1;
						}						

						
//				    } else if ((this.team[i].player[j].pos == "SUP")) {
				    } else if ((j == 4)) {
//						creepOdds = .36;		
						if (this.t>5) {
							creepOdds = .0005*.95+.0005*playerBuff[i][j]/playerBuff[iO][j]*.05*(this.team[i].player[j].compositeRating.monstersKillingJ+5)/(this.team[iO].player[j].compositeRating.monstersKillingJ+5);					
						//	creepOdds = .0005*playerBuff[i][j]/playerBuff[iO][j];					
							creepOddsOpp = .0001*playerBuff[i][j]/playerBuff[iO][j]*(this.team[i].player[j].compositeRating.monstersKillingJ+5)/(this.team[iO].player[j].compositeRating.monstersKillingJ+5);					
						} else {
							creepOdds = .0005*playerBuff[i][j]*this.team[i].player[j].compositeRating.monstersKillingJ/50;
							creepOddsOpp = 0;					
						}
					//	console.log("SUP: "+creepOdds+" "+creepOddsOpp);
						if (playerDeaths[iO][j] == 1) { 								
						   creepOdds += .0005;
						}								
					} else {
						creepOdds = .02*playerBuff[i][j]/playerBuff[iO][j]*(this.team[i].player[j].compositeRating.monstersKillingJ+5)/(this.team[iO].player[j].compositeRating.monstersKillingJ+5);					
						if (this.t>5) {
							creepOdds = .020*.95+.020*playerBuff[i][j]/playerBuff[iO][j]*.05*(this.team[i].player[j].compositeRating.monstersKillingJ+5)/(this.team[iO].player[j].compositeRating.monstersKillingJ+5);					
						//	creepOdds = .020*playerBuff[i][j]/playerBuff[iO][j];					
							creepOddsOpp = .005*playerBuff[i][j]/playerBuff[iO][j]*(this.team[i].player[j].compositeRating.monstersKillingJ+5)/(this.team[iO].player[j].compositeRating.monstersKillingJ+5);					
						} else {
							creepOdds = .020*playerBuff[i][j]*this.team[i].player[j].compositeRating.monstersKillingJ/50;
							creepOddsOpp = 0;					
						}			
				//		console.log("REST: "+creepOdds+" "+creepOddsOpp+" "+playerBuff[i][j]+" "+playerBuff[iO][j]+" "+this.team[i].player[j].compositeRating.monstersKillingJ+" "+this.team[iO].player[j].compositeRating.monstersKillingJ);
						
						if (playerDeaths[iO][j] == 1) { 								
						   creepOdds += .002;
						}								
					}


					if (playerDeaths[i][j] == 0) { 								
					
						if ( creepOdds/1.2 > Math.random() ) {
//							creeps =  random.randInt(1,  3);
//							creeps =  random.randInt(1,  4);
							creeps =  random.randInt(1,  1);
							playerBuff[i][j] *= (1+creeps*junglePlayerBuff);
						} else if ( creepOddsOpp/1.2 > Math.random() ) {
//							creeps =  random.randInt(1,  3);
//							creeps =  random.randInt(1,  4);
							creeps =  random.randInt(1,  1);
							playerBuff[i][j] *= (1+creeps*junglePlayerBuff);
							this.recordStat(i, j, "oppJM",creeps);		
						} else {
							 creeps = 0;
							//creeps =  random.randInt(0,  1); 
						}
					
						goldTime = Math.round(creeps*(40*.1+23*.45+17*.45)*1.8)/1000;
						this.recordStat(i, j, "trb",goldTime);		
						this.recordStat(iO, j, "stl",goldTime);						
						
						this.recordStat(i, j, "fgMidRange",creeps);		
						this.recordStat(iO, j, "fgaMidRange",creeps);		
						this.recordStat(i, j, "tp",creeps);		
						this.recordStat(iO, j, "tpa",creeps);		
						if (this.t<12) {
							this.recordStat(i, j, "ft",creeps);		
							this.recordStat(iO, j, "fta",creeps);		
						}				
//						playerGoldBuff[i][j] *= (1+(goldTime/5));		
						playerGoldBuff[i][j] *= (goldTime/playerGoldBuff[i][j]+1);		
						
					}					
					

				}
			}		
		}		
		
// console.log("got here");		

///////////////////////////////// Group Type was too restrictive, this should loosen up as time goes on
		
				if ((this.t>25) && (outerTowerSum<3)) {   // outer towers usually down by minute 25-30
				
							///////////////// OUTER TOWERS
							if ((outerTowerList[t][0] == 0)  && (outcome != "done") && (groupType <= 2) && (groupBuffAdj>0) ) {
					//		  	if (Math.random() < (championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(.09*(this.t-6)*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend))) {
								if (Math.random() < outerTowerOdds) {
								
								
									this.groupPlay(groupNumber,"towerOutTop","orb",p,t);
									goldTime = 125/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
									this.recordStat(t, 0, "pf");	
									this.recordStat(tD, 0, "oppTw");									
									outerTowerList[t][0] = 1;
									this.team[t].stat.ptsQtrs[0] += 1;
									outcome = "done";
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}
							if ((outerTowerList[t][1] == 0)  && (outcome != "done")  && (groupType <= 3)  && (groupType > 1)  && (groupBuffAdj>0)) {
								if (Math.random() < outerTowerOdds) {
									this.groupPlay(groupNumber,"towerOutMid","orb",p,t);
									goldTime = 125/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
									this.recordStat(t, 2, "pf");
									this.recordStat(tD, 2, "oppTw");									
									outerTowerList[t][1] = 1;
									this.team[t].stat.ptsQtrs[0] += 1;
									outcome = "done";				
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}		
							
							if ((outerTowerList[t][2] == 0)  && (outcome != "done")  && (groupType >= 1)  && (groupBuffAdj>0)) {
								if (Math.random() < outerTowerOdds) {
									this.groupPlay(groupNumber,"towerOutBot","orb",p,t);		
									goldTime = 125/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	
									
									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
									this.recordStat(t, 3, "pf");
									this.recordStat(tD, 3, "oppTw");									
									outerTowerList[t][2] = 1;
									this.team[t].stat.ptsQtrs[0] += 1;
									outcome = "done";		
								
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}				
				}		

		var shotCallMissed, instance;
		shotCallMissed = false;
		
		// only get objective half the time, let kills even out and make objective easier
		if (this.done == true) {
	//		objectivesFirst /= 3;
		} else {
	//		objectivesFirst = .33;
		}
		
		//totalTowerSum = outerTowerList[t][0] + outerTowerList[t][1] + outerTowerList[t][2]
		//console.log(outerSum+" "+innerSum +" "+inhibTsum);
		
		if (Math.random() < objectivesFirst) {
						


						///////////////// BARON
					//		if ( ((innerTowerList[t][0] == 1)  || (innerTowerList[t][1] == 1) || (innerTowerList[t][0] == 1))  && (baronRespawn == 9999) && (outcome != "done")  && (groupType < 3)  && (this.t > 12)) {
							if ( ((innerTowerList[t][0] == 1)  || (innerTowerList[t][1] == 1) || (innerTowerList[t][0] == 1))  && (baronRespawn == 9999) && (outcome != "done")  && (groupType < 3)  && (groupBuffAdj>0)) {
						//	console.log(this.t+" "+teamBuff[t]+" "+teamBuff[tD]*groupBuff);
					//		  	if (Math.random() < (.07*groupNumber-.20)*teamBuff[t]/teamBuff[t]) {
					//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(.10*groupNumber-.20)*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5) ) {
								if (Math.random() < baronOdds ) {
									this.groupPlay(groupNumber,"baron","ast",p,t);			
									//this.recordPlay("towerInrTop", t, [this.team[t].player[0].userID]);
									this.recordStat(t, 2, "tov");				
								//	dragonList[t][0] = 1;
								
									goldTime = 300/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);				
								
									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
/*										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerGoldBuff[i][j] *= (1+(goldTime/5));										*/
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));	
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
								
								//drb
									baronRespawn = this.t;
									baronList[t] += 1;		
					//				teamBuff[t] *= (1.06)
									teamBuff[t] *= (2.00)
									baronBuff[t] = this.t;
									this.team[t].stat.ptsQtrs[6] += 1;
									outcome = "done";
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}																					
							


		///////////////// DRAGON
							//console.log("dragon: "+ this.t+" groupBuffAdj: "+groupBuffAdj+" dragon odds: "+dragonOdds+" groupType: "+groupType);
//							if ( ((outerTowerList[t][0] == 1)  || (outerTowerList[t][1] == 1) || (outerTowerList[t][0] == 1))  && (dragonRespawn == 9999) && (outcome != "done")  && (groupType > 1)  && (groupBuffAdj>0) ) {
							if ( (dragonRespawn == 9999) && (outcome != "done")  && (groupType > 1)  && (groupBuffAdj>0) ) {
					//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(outerAdj[t]-outerAdj[tD])+(.15*groupNumber-.20)*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)) {
								if (Math.random() < dragonOdds) {
									this.groupPlay(groupNumber,"dragon","blk",p,t);			
									//this.recordPlay("towerInrTop", t, [this.team[t].player[0].userID]);
									this.recordStat(t, 2, "drb");				
								//	dragonList[t][0] = 1;
									goldTime = 150/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);					
								//drb
									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
								
								
									dragonRespawn = this.t;
									dragonList[t] += 1;		
									if (dragonList[t]>4) {
										teamBuff[t] *= (1.40)
										dragonBuff[t] = this.t;
									} else {
										teamBuff[t] *= (1.10)
									}
									this.team[t].stat.ptsQtrs[6] += 1;
									outcome = "done";
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}								
						

							
				
				// console.log("got here");
						/////////// NEXUS
					//	console.log(this.t+" "+t+" "+outerTowerList[t][0]+" "+outerTowerList[t][1]+" "+outerTowerList[t][2]);
						if ( ((nexusTowerList[t][0] == 1) && (nexusTowerList[t][1] == 1)  && ((inhibList[t][0] == 1) || (inhibList[t][1] == 1) || (inhibList[t][2] == 1)) ) && (outcome != "done")  && (groupBuffAdj>0)) {
				//			if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.30*(inhibList[t][0]+inhibList[t][1]+inhibList[t][2]+1 )*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.structureAttack/this.team[tD].compositeRating.structureDefend) {
					
							if (Math.random() < nexusOdds) {
								outcome = "nexus";
								this.groupPlayOnly(groupNumber,"nexus",p,t);
								this.team[t].stat.ptsQtrs[5] += 1;				
								this.recordStat(t, 3, "pts",1);	
								
				//				this.recordPlay("nexus", t, [this.team[t].player[p].userID]);
							} else {
							//  console.log("Fail: "+this.t+" "+(.02*(inhibList[t][0]+inhibList[t][1]+inhibList[t][2]+1 )*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)));
							}
						}

						if (outcome!= "nexus") {
												
					// console.log("got here");		
								///////////////// NEXUS TOWERS
							
							if (( (inhibTowerList[t][0] == 1) || (inhibTowerList[t][1] == 1) || (inhibTowerList[t][2] == 1) ) && (inhibFirstTaken[t] > 0)  && (nexusTowerList[t][0] == 0)  && (outcome != "done")  && (groupBuffAdj>0)  ) {
					//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.02*(inhibList[t][0]+inhibList[t][1]+inhibList[t][2]+1 )*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend) {
								instance	= Math.random();					
								if (instance < nexusTowerOdds) {
								
																
									if (instance >= nexusTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}	


			
										/*var outerTowerOddsNoTP,innerTowerOddsNoTP,inhibTowerOddsNoTP, inhibOddsNoTP,nexusTowerOddsNoTP, nexusOddsNoTP,dragonOddsNoTP, baronOddsNoTP,champOddsNoTP;
		var innerTowerOddsNoTw,inhibTowerOddsNoTw, inhibOddsNoTw,nexusTowerOddsNoTw, nexusOddsNoTw,dragonOddsNoTw, baronOddsNoTw,champOddsNoTw;
		var outerTowerOddsNoCK,innerTowerOddsNoCK,inhibTowerOddsNoCK, inhibOddsNoCK,nexusTowerOddsNoCK, nexusOddsNoCK,dragonOddsNoCK, baronOddsNoCK,champOddsNoCK;
		var outerTowerOddsNoCS,innerTowerOddsNoCS,inhibTowerOddsNoCS, inhibOddsNoCS,nexusTowerOddsNoCS, nexusOddsNoCS,dragonOddsNoCS, baronOddsNoCS,champOddsNoCS;
		var innerTowerOddsNoChmpn,inhibTowerOddsNoChmpn, inhibOddsNoChmpn,nexusTowerOddsNoChmpn, nexusOddsNoChmpn,dragonOddsNoChmpn, baronOddsNoChmpn,champOddsNoChmpn;
		
		champOddsNoAg
		*/
								
								
									this.groupPlay(groupNumber,"towerNexBot","orb",p,t);

									goldTime = 50/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
									//	playerGoldBuff[t][i] *= (1+(goldTime/5));	
//										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);												
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);												
										
									}
									
					//				this.recordPlay("towerNexBot", t, [this.team[t].player[p].userID]);
												
					
									this.recordStat(t, 3, "pf");			
									this.recordStat(tD, 3, "oppTw");				
									nexusTowerList[t][0] = 1;
									this.team[t].stat.ptsQtrs[4] += 1;				
									outcome = "done";
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}
							if (( (inhibTowerList[t][0] == 1) || (inhibTowerList[t][1] == 1) || (inhibTowerList[t][2] == 1) )  && (inhibFirstTaken[t] > 0)  && (nexusTowerList[t][1] == 0) && (outcome != "done")  && (groupBuffAdj>0) ) {
								instance = Math.random();					
								if (instance < nexusTowerOdds) {

									if (instance >= nexusTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}
									if (instance >= nexusTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}	
																	
									if (instance >= nexusTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= nexusTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}	


			
										/*var outerTowerOddsNoTP,innerTowerOddsNoTP,inhibTowerOddsNoTP, inhibOddsNoTP,nexusTowerOddsNoTP, nexusOddsNoTP,dragonOddsNoTP, baronOddsNoTP,champOddsNoTP;
		var innerTowerOddsNoTw,inhibTowerOddsNoTw, inhibOddsNoTw,nexusTowerOddsNoTw, nexusOddsNoTw,dragonOddsNoTw, baronOddsNoTw,champOddsNoTw;
		var outerTowerOddsNoCK,innerTowerOddsNoCK,inhibTowerOddsNoCK, inhibOddsNoCK,nexusTowerOddsNoCK, nexusOddsNoCK,dragonOddsNoCK, baronOddsNoCK,champOddsNoCK;
		var outerTowerOddsNoCS,innerTowerOddsNoCS,inhibTowerOddsNoCS, inhibOddsNoCS,nexusTowerOddsNoCS, nexusOddsNoCS,dragonOddsNoCS, baronOddsNoCS,champOddsNoCS;
		var innerTowerOddsNoChmpn,inhibTowerOddsNoChmpn, inhibOddsNoChmpn,nexusTowerOddsNoChmpn, nexusOddsNoChmpn,dragonOddsNoChmpn, baronOddsNoChmpn,champOddsNoChmpn;
		
		champOddsNoAg
		*/
			
									
									this.groupPlay(groupNumber,"towerNexTop","orb",p,t);	

									
									goldTime = 50/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									
									
									
									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
											
									}
									for (i = 0; i < 5; i++) {	
/*										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerGoldBuff[i][j] *= (1+(goldTime/5));										*/
										playerBuff[t][i]	*= structurePlayerBuffAll;
//										playerGoldBuff[t][i] *= (1+(goldTime/5));	
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									

									
					//				this.recordPlay("towerNexTop", t, [this.team[t].player[p].userID]);
									this.recordStat(t, 0, "pf");	
									this.recordStat(tD, 0, "oppTw");					
									nexusTowerList[t][1] = 1;
									this.team[t].stat.ptsQtrs[4] += 1;				
									outcome = "done";				
										
									
								} else {
							//	  console.log("Fail: "+this.t);
								  
								}
							}						
		

					 // console.log("got here");
							///////////////// INHIB  inhibList
							
							if ((inhibTowerList[t][0] == 1)  && (inhibList[t][0] == 0)  && (outcome != "done")   && (groupType < 3)  && (groupBuffAdj>0)) {
					//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.3*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.structureAttack/this.team[tD].compositeRating.structureDefend) {
								if (Math.random() < inhibOdds) {
					//			    this.groupPlayOnly(groupNumber,"inhibTop",p,t);
									this.groupPlay(groupNumber,"inhibTop","fgLowPost",p,t);
									this.recordStat(t, 0, "fgaLowPost");				
									this.recordStat(tD, 0, "oppInh");			

									/*for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
									}*/
									
					//				this.recordPlay("inhibTop", t, [this.team[t].player[0].userID]);
							//		this.recordStat(t, 0, "orb");				
									inhibList[t][0] = 1;
									inhibFirstTaken[t] += 1;
									inhibRespawn[t][0] = this.t;								
									this.team[t].stat.ptsQtrs[3] += 1;
							//		console.log("inhibRespawn[t][0]: "+inhibRespawn[t][0]);				
									outcome = "done";
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}
							if ((inhibTowerList[t][1] == 1) && (inhibList[t][1] == 0)   && (outcome != "done")    && (groupType > 1)    && (groupType < 3)  && (groupBuffAdj>0)) {
								if (Math.random() < inhibOdds) {
					//			    this.groupPlayOnly(groupNumber,"inhibMid",p,t);
									this.groupPlay(groupNumber,"inhibMid","fgLowPost",p,t);
									this.recordStat(t, 2, "fgaLowPost");				
									this.recordStat(tD, 2, "oppInh");			

								/*	for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
									}*/
						
								
					//				this.recordPlay("inhibMid", t, [this.team[t].player[2].userID]);
							//		this.recordStat(t, 2, "orb");				
									inhibList[t][1] = 1;
									inhibFirstTaken[t] += 1;				
									inhibRespawn[t][1] = this.t;		
									this.team[t].stat.ptsQtrs[3] += 1;
							//		console.log("inhibRespawn[t][1]: "+inhibRespawn[t][1]);
									outcome = "done";				
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}		
							
							if ((inhibTowerList[t][2] == 1)  && (inhibList[t][2] == 0)  && (outcome != "done") && (groupType > 1)  && (groupBuffAdj>0)) {
								if (Math.random() < inhibOdds) {
									//this.groupPlayOnly(groupNumber,"inhibBot",p,t);
									this.groupPlay(groupNumber,"inhibBot","fgLowPost",p,t);
									this.recordStat(t, 3, "fgaLowPost");
									this.recordStat(tD, 3, "oppInh");


						/*			for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
									}*/
									
					//				this.recordPlay("inhibBot", t, [this.team[t].player[3].userID]);
							//		this.recordStat(t, 3, "orb");				
									inhibList[t][2] = 1;
									inhibFirstTaken[t] += 1;				
									inhibRespawn[t][2] = this.t;
									this.team[t].stat.ptsQtrs[3] += 1;
						//			console.log("inhibRespawn[t][2]: "+inhibRespawn[t][2]);								
									outcome = "done";				
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}									

//outerSum,,inhibTsum;&& (innerSum>Math.random())
							///////////////// INHIB TOWERS
					// console.log("got here");		
							if ((innerTowerList[t][0] == 1)  && (inhibTowerList[t][0] == 0)  && (outcome != "done")  && (groupType < 2)  && (groupBuffAdj>0) ) {
					//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.02*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend) {

								instance = Math.random();					
								if (instance < inhibTowerOdds) {
								
									if (instance >= inhibTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	
									
									
									if (instance >= inhibTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}	
									
									
									if (instance >= inhibTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}	

									
									this.groupPlay(groupNumber,"towerInhTop","orb",p,t);
									goldTime = 175/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	
									
									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
/*										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerGoldBuff[i][j] *= (1+(goldTime/5));										*/
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));	
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
					//				this.recordPlay("towerInhTop", t, [this.team[t].player[0].userID]);
									this.recordStat(t, 0, "pf");	
									this.recordStat(tD, 0, "oppTw");									
									inhibTowerList[t][0] = 1;
									this.team[t].stat.ptsQtrs[2] += 1;
									outcome = "done";
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}
							if ((innerTowerList[t][1] == 1) && (inhibTowerList[t][1] == 0)   && (outcome != "done")   && (groupType > 1)  && (groupType < 3)  && (groupBuffAdj>0) ) {

								instance = Math.random();					
								if (instance < inhibTowerOdds) {
								
									if (instance >= inhibTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	
									
									if (instance >= inhibTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}	

									if (instance >= inhibTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}										

									
									this.groupPlay(groupNumber,"towerInhMid","orb",p,t);

									goldTime = 175/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
/*										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerGoldBuff[t][p[i]] *= (1+(goldTime/5));										*/
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
					//				this.recordPlay("towerInhMid", t, [this.team[t].player[2].userID]);
									this.recordStat(t, 2, "pf");	
									this.recordStat(tD, 2, "oppTw");									
									inhibTowerList[t][1] = 1;
									this.team[t].stat.ptsQtrs[2] += 1;
									outcome = "done";				
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}		
							
							if ((innerTowerList[t][2] == 1)  && (inhibTowerList[t][2] == 0)  && (outcome != "done")   && (groupType > 2)  && (groupBuffAdj>0)  ) {

								instance = Math.random();					
								if (instance < inhibTowerOdds) {
								
									if (instance >= inhibTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	

									if (instance >= inhibTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}	
									
									if (instance >= inhibTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= inhibTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}										
									
									this.groupPlay(groupNumber,"towerInhBot","orb",p,t);

									goldTime = 175/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}

									
					//				this.recordPlay("towerInhBot", t, [this.team[t].player[3].userID]);
									this.recordStat(t, 3, "pf");			
									this.recordStat(tD, 3, "oppTw");									
									inhibTowerList[t][2] = 1;
									this.team[t].stat.ptsQtrs[2] += 1;
									outcome = "done";				
								
									
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}							
							
					// console.log("got here");	
						///////////////// INNER TOWERS
							
							if ((outerTowerList[t][0] == 1)  && (innerTowerList[t][0] == 0)  && (outcome != "done")  && (groupType < 2)  && (groupBuffAdj>0) ) {
					//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.02*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend) {
								//if (Math.random() < innerTowerOdds) {
								instance = Math.random();					
								if (instance < innerTowerOdds) {
								
									if (instance >= innerTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	
									
									if (instance >= innerTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= innerTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}										
									
									if (instance >= innerTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= innerTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= innerTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}										
									
									this.groupPlay(groupNumber,"towerInrTop","orb",p,t);		
									goldTime = 150/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
									//this.recordPlay("towerInrTop", t, [this.team[t].player[0].userID]);
									this.recordStat(t, 0, "pf");	
									this.recordStat(tD, 0, "oppTw");									
									innerTowerList[t][0] = 1;
									this.team[t].stat.ptsQtrs[1] += 1;
									outcome = "done";
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}
							if ((outerTowerList[t][1] == 1) && (innerTowerList[t][1] == 0)   && (outcome != "done")  && (groupType < 3)  && (groupType > 1)  && (groupBuffAdj>0) ) {
//								if (Math.random() < innerTowerOdds) {
								instance = Math.random();					
								if (instance < innerTowerOdds) {
								
									if (instance >= innerTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	
									if (instance >= innerTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= innerTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}

									if (instance >= innerTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= innerTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= innerTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}	
									
									this.groupPlay(groupNumber,"towerInrMid","orb",p,t);
									goldTime = 150/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);				
					//				this.recordPlay("towerInrMid", t, [this.team[t].player[2].userID]);
					
									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
					
									this.recordStat(t, 2, "pf");		
									this.recordStat(tD, 2, "oppTw");									
									innerTowerList[t][1] = 1;
									this.team[t].stat.ptsQtrs[1] += 1;
									outcome = "done";				
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}		
							
							if ((outerTowerList[t][2] == 1)  && (innerTowerList[t][2] == 0)  && (outcome != "done") && (groupType > 2)  && (groupBuffAdj>0)  ) {

								//if (Math.random() < innerTowerOdds) {
								instance = Math.random();					
								if (instance < innerTowerOdds) {
								
									if (instance >= innerTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	
									if (instance >= innerTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= innerTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}									

									if (instance >= innerTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= innerTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= innerTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= innerTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}	
									
					//				this.recordPlay("towerInrBot", t, [this.team[t].player[3].userID]);
									this.groupPlay(groupNumber,"towerInrBot","orb",p,t);
									goldTime = 150/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
									this.recordStat(t, 3, "pf");	
									this.recordStat(tD, 3, "oppTw");									
									innerTowerList[t][2] = 1;
									this.team[t].stat.ptsQtrs[1] += 1;
									outcome = "done";	
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}				
							
												
	
													
							///////////////// OUTER TOWERS
							if ((outerTowerList[t][0] == 0)  && (outcome != "done") && (groupType < 1) && (groupBuffAdj>0) ) {
					//		  	if (Math.random() < (championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(.09*(this.t-6)*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend))) {
							//	if (Math.random() < outerTowerOdds) {
								instance = Math.random();					
								if (instance < outerTowerOdds) {
								
									if (instance >= outerTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	
									if (instance >= outerTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= outerTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}
								
									if (instance >= outerTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= outerTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= outerTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}									
								
									this.groupPlay(groupNumber,"towerOutTop","orb",p,t);
									goldTime = 125/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
									this.recordStat(t, 0, "pf");	
									this.recordStat(tD, 0, "oppTw");									
									outerTowerList[t][0] = 1;
									this.team[t].stat.ptsQtrs[0] += 1;
									outcome = "done";
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}
							if ((outerTowerList[t][1] == 0)  && (outcome != "done")  && (groupType < 3)  && (groupType > 1)  && (groupBuffAdj>0)) {
								//if (Math.random() < outerTowerOdds) {
								instance = Math.random();					
								if (instance < outerTowerOdds) {
								
									if (instance >= outerTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}										
									
									if (instance >= outerTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= outerTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}									
									
									if (instance >= outerTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= outerTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= outerTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}	
									
									this.groupPlay(groupNumber,"towerOutMid","orb",p,t);
									goldTime = 125/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	

									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
									this.recordStat(t, 2, "pf");
									this.recordStat(tD, 2, "oppTw");									
									outerTowerList[t][1] = 1;
									this.team[t].stat.ptsQtrs[0] += 1;
									outcome = "done";				
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}		
							
							if ((outerTowerList[t][2] == 0)  && (outcome != "done")  && (groupType > 2)  && (groupBuffAdj>0)) {
//								if (Math.random() < outerTowerOdds) {

								instance = Math.random();					
								if (instance < outerTowerOdds) {
								
									if (instance >= outerTowerOddsNoSC) {
										this.recordStat(t, shotCaller[t], "scTwr");
										this.recordStat(tD, shotCaller[tD], "scTwr",-1);
									}	
									if (instance >= outerTowerOddsNoExp) {
										this.recordStat(t, shotCaller[t], "grExpTwr");
										this.recordStat(tD, shotCaller[tD], "grExpTwr",-1);
									}	
									if (instance >= outerTowerOddsNoGold) {
										this.recordStat(t, shotCaller[t], "grGldTwr");
										this.recordStat(tD, shotCaller[tD], "grGldTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTBuff) {
										this.recordStat(t, shotCaller[t], "tmBuffTwr");
										this.recordStat(tD, shotCaller[tD], "tmBuffTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTBuffAdj) {
										this.recordStat(t, shotCaller[t], "tmBAdjTwr");
										this.recordStat(tD, shotCaller[tD], "tmBAdjTwr",-1);
									}
									
									if (instance >= outerTowerOddsNoTw) {
										this.recordStat(t, shotCaller[t], "TwTwr");
										this.recordStat(tD, shotCaller[tD], "TwTwr",-1);
									}	
									if (instance >= outerTowerOddsNoTP) {
										this.recordStat(t, shotCaller[t], "TPTwr");
										this.recordStat(tD, shotCaller[tD], "TPTwr",-1);
									}	
									if (instance >= outerTowerOddsNoAg) {
										this.recordStat(t, shotCaller[t], "AgTwr");
										this.recordStat(tD, shotCaller[tD], "AgTwr",-1);
									}	
									if (instance >= outerTowerOddsNoChmpn) {
										this.recordStat(t, shotCaller[t], "ChmpnTwr");
										this.recordStat(tD, shotCaller[tD], "ChmpnTwr",-1);
									}	
									
									this.groupPlay(groupNumber,"towerOutBot","orb",p,t);		
									goldTime = 125/1000;
									this.recordStat(t, 0, "trb",goldTime);		
									this.recordStat(tD, 0, "stl",goldTime);	
									this.recordStat(t, 1, "trb",goldTime);		
									this.recordStat(tD, 1, "stl",goldTime);	
									this.recordStat(t, 2, "trb",goldTime);		
									this.recordStat(tD, 2, "stl",goldTime);	
									this.recordStat(t, 3, "trb",goldTime);		
									this.recordStat(tD, 3, "stl",goldTime);	
									this.recordStat(t, 4, "trb",goldTime);		
									this.recordStat(tD, 4, "stl",goldTime);	
									
									for (i = 0; i < groupNumber; i++) {	
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (i = 0; i < 5; i++) {	
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
										playerBuff[t][i]	*= structurePlayerBuffAll;
										//playerGoldBuff[t][i] *= (1+(goldTime/5));										
										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);											
									}
									
									this.recordStat(t, 3, "pf");
									this.recordStat(tD, 3, "oppTw");									
									outerTowerList[t][2] = 1;
									this.team[t].stat.ptsQtrs[0] += 1;
									outcome = "done";		
								
								} else {
							//	  console.log("Fail: "+this.t);
								}
							}				
						
						}

						
			

				//console.log(championAdjustment);
		
		} else {
		///////////////////
		
			//////////////// Killing Champions (put after everything else, those are more important)
			var numberOfAssists;
			var assistLocation;
			if  ((outcome != "done") && (outcome != "nexus")  && (groupBuffAdj>0)) {
		//	console.log("combined: "+((this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling+championAdjustment+teamBuff[t]-teamBuff[tD]+groupBuff )/100+.05) +"chamKill t: "+this.team[t].compositeRating.championKilling+" chamKill tD:  "+this.team[tD].compositeRating.championKilling+" champAdjustment "+championAdjustment+" teamBuff "+teamBuff[t] +" teamBuff "+teamBuff[tD]+" groupBuff "+groupBuff);
		//	console.log(((this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling)+championAdjustment)/5+(teamBuff[t]-teamBuff[tD]+groupBuff)/100 );
	//		  	if (Math.random() <  ((this.team[t].compositeRating.championKilling/this.team[tD].compositeRating.championKilling)*.25+championAdjustment/25) ) {
	//		  	if (Math.random() <  ((this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling)+championAdjustment)/5*teamBuff[t]/teamBuff[tD]*groupBuff ) {
	if ((this.t<11) && (this.t>10)) {
		//	console.log("chamKill t: "+this.team[t].compositeRating.championKilling+" chamKill tD:  "+this.team[tD].compositeRating.championKilling+" champAdjustment "+championAdjustment+" teamBuff "+teamBuff[t] +" teamBuff "+teamBuff[tD]+" groupBuff "+groupBuff);
		//	console.log((((this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling+championAdjustment)*(teamBuff[t]/teamBuff[tD]*groupBuff)+.10)*(this.t/60)) );

	}				
				var modifiedGroupAttack;
				  modifiedGroupAttack = groupAttack[t];
		//		  console.log("ATTACK");
				for (i = 0; i < groupNumber; i++) {	
				
					if (p[i]==4) {
						modifiedGroupAttack += (playerGoldBuff[t][p[i]]+playerBuff[t][p[i]]+this.team[t].player[p[i]].champRel[championsList[t][p[i]]].ratings.attack*this.t)/10;	
					} else {
						modifiedGroupAttack += playerGoldBuff[t][p[i]]+ playerBuff[t][p[i]]+this.team[t].player[p[i]].champRel[championsList[t][p[i]]].ratings.attack*this.t;	
					}				
				   //modifiedGroupAttack += playerBuff[t][p[i]]+this.team[t].player[p[i]].champRel[championsList[t][p[i]]].ratings.attack*this.t;	
			//		console.log(this.team[t].player[p[i]].pos+ " "+playerBuff[t][p[i]]+" "+this.team[t].player[p[i]].champRel[championsList[t][p[i]]].ratings.attack);
//					modifiedGroupAttack += playerBuff[t][p[i]];	
				}
		//		  console.log(modifiedGroupAttack);
				
				var modifiedGroupDefense,maxDefense;

				maxDefense = playerGoldBuff[tD][p[0]] +playerBuff[tD][p[0]] +this.team[tD].player[p[0]].champRel[championsList[tD][p[0]]].ratings.defense*this.t;
				modifiedGroupDefense = groupDefense[t];
				for (i = 0; i < groupNumber; i++) {	
				   if ((playerBuff[tD][p[i]] +playerGoldBuff[tD][p[i]] +this.team[tD].player[p[i]].champRel[championsList[tD][p[i]]].ratings.defense) > maxDefense) {
//						maxDefense += playerBuff[tD][p[i]] +this.team[tD].player[p[i]].champRel[championsList[tD][p[i]]].ratings.defense;	
						maxDefense = playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +this.team[tD].player[p[i]].champRel[championsList[tD][p[i]]].ratings.defense*this.t;	
//						maxDefense += playerBuff[tD][p[i]] ;	
				   }
				}				
				  
			//	  console.log("ATTACK");
			//	  console.log("maxDefense");		  
  			   for (i = 0; i < groupNumber; i++) {	
				   modifiedGroupDefense += maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +this.team[tD].player[p[i]].champRel[championsList[tD][p[i]]].ratings.defense*this.t);	
				//	console.log(this.team[tD].player[p[i]].pos+ " "+playerBuff[tD][p[i]]+" "+this.team[tD].player[p[i]].champRel[championsList[tD][p[i]]].ratings.defense);
//				   modifiedGroupDefense += maxDefense- (playerBuff[tD][p[i]] );	
				}				
				//  console.log(modifiedGroupDefense);
	// console.log("got here");
	////		  	if (Math.random() <  (((this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling+championAdjustment)/1+(teamBuff[t]-teamBuff[tD]+groupBuff - 1 )/6)*(this.t/60))) {
	//		  	if (Math.random() <  (((this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling+championAdjustment)*(teamBuff[t]/teamBuff[tD]*groupBuff)+.10)*(this.t/15))) {
	//		  	if (Math.random() <  (((this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling+championAdjustment)*(teamBuff[t]/teamBuff[tD]*groupBuff)+.15)*(this.t/20))) {
	//		  	if (Math.random() <  3.5*((((outerAdj[t]-outerAdj[tD])+this.team[t].compositeRating.championKilling*1.5-this.team[tD].compositeRating.championKilling+championAdjustment)*(teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5))+.05+boostT1+boostT2)*(this.t/30))) {
			//	if (Math.random() <  champOdds) {
				instance = Math.random();					
				if (instance < champOdds) {

									
					if (instance >= champOddsNoSC) {
						this.recordStat(t, shotCaller[t], "scKills");
						this.recordStat(tD, shotCaller[tD], "scKills",-1);
					}		
					if (instance >= champOddsNoExp) {
						this.recordStat(t, shotCaller[t], "grExpKills");
						this.recordStat(tD, shotCaller[tD], "grExpKills",-1);
					}	
					if (instance >= champOddsNoGold) {
						this.recordStat(t, shotCaller[t], "grGldKills");
						this.recordStat(tD, shotCaller[tD], "grGldKills",-1);
					}	
					if (instance >= champOddsNoTBuff) {
						this.recordStat(t, shotCaller[t], "tmBuffKills");
						this.recordStat(tD, shotCaller[tD], "tmBuffKills",-1);
					}	
					if (instance >= champOddsNoTBuffAdj) {
						this.recordStat(t, shotCaller[t], "tmBAdjKills");
						this.recordStat(tD, shotCaller[tD], "tmBAdjKills",-1);
					}					
					
					if (instance >= champOddsNoCK) {
						this.recordStat(t, shotCaller[t], "CKKills");
						this.recordStat(tD, shotCaller[tD], "CKKills",-1);
					}	
					if (instance >= champOddsNoTP) {
						this.recordStat(t, shotCaller[t], "TPKills");
						this.recordStat(tD, shotCaller[tD], "TPKills",-1);
					}	
					if (instance >= champOddsNoAg) {
						this.recordStat(t, shotCaller[t], "AgKills");
						this.recordStat(tD, shotCaller[tD], "AgKills",-1);
					}	
					if (instance >= champOddsNoChmpn) {
						this.recordStat(t, shotCaller[t], "ChmpnKills");
						this.recordStat(tD, shotCaller[tD], "ChmpnKills",-1);
					}						
					
			//console.log("GotKilled");
				
					//this.groupPlay(groupNumber,"kill","fgp",p,t);
					//playerBuff[i][j]								
					
					//killed = random.randInt(0,  groupDefense[tD]);
					killer = p[0];
	//				killerRating = random.randInt(0,  groupAttack[t]);
					killerRating = random.randInt(0,  modifiedGroupAttack);
				/*	console.log(modifiedGroupAttack);
					console.log(killerRating);*/
					
					rangeBot = 0;
					rangeTop = 0;
			//		console.log(killer);				
					for (i = 0; i < groupNumber; i++) {	
						//console.log(p[i]);			
						/*var modifiedAttack,	modifiedDefense,modifiedAbility;
						modifiedAttack = this.team[j].player[i].champRel[championsList[j][i]].ratings.attack + playerBuff[t][p[0]];
						modifiedDefense = this.team[j].player[i].champRel[championsList[j][i]].ratings.defense;
						modifiedAbility = this.team[j].player[i].champRel[championsList[j][i]].ratings.ability;	*/

	//					rangeTop += this.team[t].player[p[i]].champRel[championsList[t][p[i]]].ratings.attack;
						if (p[i]==4) {
							rangeTop += (this.team[t].player[p[i]].champRel[championsList[t][p[i]]].ratings.attack*this.t+playerBuff[t][p[i]]+playerGoldBuff[t][p[i]])/10;
						} else {
							rangeTop += this.team[t].player[p[i]].champRel[championsList[t][p[i]]].ratings.attack*this.t+playerBuff[t][p[i]]+playerGoldBuff[t][p[i]];
						}
//						rangeTop += playerBuff[t][p[i]];
						
			//			console.log(rangeTop);
					//	console.log(rangeTop+" "+rangeBot+" "+killerRating+" "+this.team[t].player[p[i]].pos+" "+this.team[t].player[p[i]].champRel[championsList[t][p[i]]].ratings.attack);	
						if ((killerRating<=rangeTop) && (killerRating >= rangeBot)) {
						
						  killer = p[i];
					//	  console.log("KILLER"+killer);
						   rangeBot = rangeTop;						  
						} else {
					//		console.log("NOKILLER");
						   rangeBot = rangeTop;	
						   
						}
					}
					
					  if (killer == 4) {
							//console.log(1.00/groupNumber);
							if (Math.random() <= 1.00/groupNumber) {
								killer = p[0];
							} else if (Math.random() <= 2.00/groupNumber) {
								killer = p[1];
							} else if (Math.random() <= 3.00/groupNumber) {
								killer = p[2];
							} else if (Math.random() <= 4.00/groupNumber) {
								killer = p[3];
							} else {
								killer = p[4];
							}
					  }				
	//				console.log(killer);
	//				console.log(killerRating);
	//				console.log(groupAttack[t]);				
					
				/*	for (i = 0; i < groupNumber; i++) {	
						console.log(p[i]);					
						rangeTop += this.team[tD].player[p[i]].champRel[championsList[tD][p[i]]].ratings.attack;
						console.log(rangeTop);
						if ((killer<=rangeTop) && (killer >= rangeBot)) {
						  killer = p[i];
						} else {
						   rangeBot = rangeTop;	
						   
						}
					}				*/
					//assisted = random.randInt(0,  groupAttack[t]);
					
					//make an assist automatic
					/*
					assisted = p[random.randInt(0,  groupNumber-1)];			
					times = 0;
					while ( ( (assisted == killer) || (playerDeaths[t][assisted] == 1)) && (times < 25)    ) {				
						assisted = p[random.randInt(0,  groupNumber-1)];				
						times += 1;
					}
					assisted2 = p[random.randInt(0,  groupNumber-1)];	
					times = 0;
					while (  ((assisted2 == killer) || (assisted == assisted2) ||  (playerDeaths[t][assisted2] == 1)  ) && (times < 25)  ) {				
						assisted2 = p[random.randInt(0,  groupNumber-1)];				
						times += 1;
					}
					assisted3 = p[random.randInt(0,  groupNumber-1)];				
					times = 0;				
					while ( (  (assisted3 == killer) || (assisted3 == assisted) || (assisted3 == assisted2) || (playerDeaths[t][assisted3] == 1)) && (times < 25) ) {
						assisted3 = p[random.randInt(0,  groupNumber-1)];				
						times += 1;
					}
					
					assisted4 = p[random.randInt(0,  groupNumber-1)];				
					times = 0;				
					while ( (  (assisted4 == killer) || (assisted4 == assisted) || (assisted4 == assisted2) || (assisted4 == assisted3) || (playerDeaths[t][assisted4] == 1)) && (times < 25) ) {
						assisted4 = p[random.randInt(0,  groupNumber-1)];				
						times += 1;
					}*/
					numberOfAssists = 0;
					assistLocation = [0,0,0,0];
					for (i = 0; i < groupNumber; i++) {	
					  if ((playerDeaths[t][p[i]] == 0) && (p[i]!=killer)) {
						assistLocation[numberOfAssists] = p[i];
						numberOfAssists += 1;		
					  }
					}
					//console.log(numberOfAssists);
					assisted = assistLocation[0];
					assisted2 = assistLocation[1];
					assisted3 = assistLocation[2];
					assisted4 = assistLocation[3];				
					
					// made based on defense?
					killed = p[random.randInt(0,  groupNumber-1)];

					var killedRating,j;

//					if (Math.random < .90) {
					if (Math.random < .9) {
						killed = p[0];
						killedRating = random.randInt(0,  modifiedGroupDefense);
						rangeBot = 0;
						rangeTop = 0;
						for (i = 0; i < groupNumber; i++) {	
							rangeTop += maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +this.team[tD].player[p[i]].champRel[championsList[tD][p[i]]].ratings.defense*this.t);
							if ((killedRating<=rangeTop) && (killedRating >= rangeBot)) {
							  killed = p[i];
							   rangeBot = rangeTop;						  
							} else {
							   rangeBot = rangeTop;	
							   
							}
						}	
						
					}
					
					
					
	/*				killed = p[random.randInt(0,  groupNumber-1)];
					killer = p[random.randInt(0,  groupNumber-1)];
					assisted = p[random.randInt(0,  groupNumber-1)];*/
					goldTime = this.t*500/60/1000;
					if (goldTime> 500) {
					  goldTime = 500/1000/this.t*killGoldAdj;
					}
			//		console.log(t+" "+killer+" "+goldTime);
			
						
					if ((playerDeaths[t][killer] == 0) && (playerDeaths[tD][killed] == 0)) { 								
			
						this.recordStat(t, killer, "trb",goldTime);	
						
					/////	playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus);					//extra??
						
				//		console.log("here");
						if ((assisted == killer) || (playerDeaths[t][assisted] == 1))  {
						   assisted = 9999;					   
						}				

				//		console.log(assisted);	
						playerDeaths[tD][killed] = 1;
						playerRespawn[tD][killed] = this.t;
						
				/*		console.log(playerDeaths[tD]);						
						console.log(playerRespawn[tD]);										
						console.log(t);										
						console.log(tD);														
						console.log(killer);																		
						console.log(killed);							
						console.log(this.team[t].player[killer].userID);																						
						console.log(this.team[tD].player[killed].userID);																										
						console.log(t+" "+killer+" "+this.team[t].player[killer].userID+" "+this.team[tD].player[killed].userID);					*/
						
					//	if (assisted == 9999)  {
					
						
						if (numberOfAssists == 0)  {
							this.recordPlay("kill", t, [this.team[t].player[killer].userID,this.team[tD].player[killed].userID]);
						
							goldTime = this.t*500/60/1000;
							if (goldTime> 500) {
							  goldTime = 500/1000/this.t*killGoldAdj;							  
							}
							this.recordStat(t, killer, "trb",goldTime);		
							playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus);					
							//playerGoldBuff[t][killer] *= (1+(goldTime/5));										
							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);												
						
	//					} else if ((assisted2 == killer) || (assisted2==assisted) || (playerDeaths[t][assisted2] == 1)) { 
						} else if (numberOfAssists == 1) { 
					//		console.log(t+" "+assisted);					
							this.recordStat(t, assisted, "fgp");	
							this.recordPlay("assist1", t, [this.team[t].player[killer].userID,this.team[tD].player[killed].userID,this.team[t].player[assistLocation[0]].userID]);
							
							goldTime = this.t*500/60/1000/2;
							if (goldTime> 500/2) {
							  goldTime = 500/1000/2/this.t*killGoldAdj;
							}
							this.recordStat(t, killer, "trb",goldTime);		
							this.recordStat(t, assisted, "trb",goldTime);		
							playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus/2*2);	
//							playerGoldBuff[t][killer] *= (1+(goldTime/5));										
							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);												
							
							if (assisted == 4) {							
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/2);					
								playerGoldBuff[t][assisted] *= (1+(goldTime/5));										
								playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);												
								
								
							} else {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/2);					
								//playerGoldBuff[t][assisted] *= (1+(goldTime/5));										
								playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);																				
							}
							if (this.t < 10) {
								this.recordStat(t, assisted, "fgpAtRim");							
							}
							
	//					} else if ((assisted3 == killer) || (assisted3==assisted) || (assisted3==assisted2) || (playerDeaths[t][assisted3] == 1)) { 
						} else if (numberOfAssists == 2) { 
					//		console.log(t+" "+assisted);					
							this.recordStat(t, assisted, "fgp");	
							this.recordStat(t, assisted2, "fgp");	
							this.recordPlay("assist2", t, [this.team[t].player[killer].userID,this.team[tD].player[killed].userID,this.team[t].player[assisted].userID,this.team[t].player[assisted2].userID]);
							goldTime = this.t*500/60/1000/3;
							if (goldTime> 500/3) {
							  goldTime = 500/1000/3/this.t*killGoldAdj;
							}
							this.recordStat(t, killer, "trb",goldTime);		
							this.recordStat(t, assisted, "trb",goldTime);		
							this.recordStat(t, assisted2, "trb",goldTime);		
							playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus/3*3);	
/*							playerGoldBuff[t][killer] *= (1+(goldTime/5*3));										
							playerGoldBuff[t][assisted] *= (1+(goldTime/5));										
							playerGoldBuff[t][assisted2] *= (1+(goldTime/5));										*/
							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);												
							playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);												
							playerGoldBuff[t][assisted2] *= (1+goldTime/playerGoldBuff[t][assisted2]);												
							if (assisted == 4) {							
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/3);					
								
							} else {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/3);					
							}							
//							playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/3);					
							if (assisted2 == 4) {							
								playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/3);					
							} else {
								playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/3);					
							}							
//							playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/3);					
							if (this.t < 10) {
								this.recordStat(t, assisted, "fgpAtRim");							
								this.recordStat(t, assisted2, "fgpAtRim");							
							}
							
	//					} else if ((assisted4 == killer) || (assisted4==assisted) || (assisted4==assisted2) || (assisted4==assisted3) || (playerDeaths[t][assisted4] == 1))   { 
						} else if (numberOfAssists == 3) { 
					//		console.log(t+" "+assisted);					
							this.recordStat(t, assisted, "fgp");	
							this.recordStat(t, assisted2, "fgp");	
							this.recordStat(t, assisted3, "fgp");								
							this.recordPlay("assist3", t, [this.team[t].player[killer].userID,this.team[tD].player[killed].userID,this.team[t].player[assisted].userID,this.team[t].player[assisted2].userID,this.team[t].player[assisted3].userID]);
							goldTime = this.t*500/60/1000/4;
							if (goldTime> 500/4) {
							  goldTime = 500/1000/4/this.t*killGoldAdj;
							}
							this.recordStat(t, killer, "trb",goldTime);		
							this.recordStat(t, assisted, "trb",goldTime);		
							this.recordStat(t, assisted2, "trb",goldTime);		
							this.recordStat(t, assisted3, "trb",goldTime);
						/*	playerGoldBuff[t][killer] *= (1+(goldTime/5*4));										
							playerGoldBuff[t][assisted] *= (1+(goldTime/5));										
							playerGoldBuff[t][assisted2] *= (1+(goldTime/5));										
							playerGoldBuff[t][assisted3] *= (1+(goldTime/5));										*/
							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);												
							playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);												
							playerGoldBuff[t][assisted2] *= (1+goldTime/playerGoldBuff[t][assisted2]);	
							playerGoldBuff[t][assisted3] *= (1+goldTime/playerGoldBuff[t][assisted3]);								
							playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus/4*4);		
							if (assisted == 4) {							
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/4);					
							} else {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/4);					
							}							
//							playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/3);					
							if (assisted2 == 4) {							
								playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/4);					
							} else {
								playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/4);					
							}								
							if (assisted3 == 4) {							
								playerBuff[t][assisted3] += (1+(playerBuff[tD][assisted3]-1)*killBonus/4);					
							} else {
								playerBuff[t][assisted3] += (1+(playerBuff[tD][assisted3]-1)*killBonus/4);					
							}								
							
							/*playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/4);					
							playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/4);					
							playerBuff[t][assisted3] += (1+(playerBuff[tD][assisted3]-1)*killBonus/4);*/
							if (this.t < 10) {
								this.recordStat(t, assisted, "fgpAtRim");							
								this.recordStat(t, assisted2, "fgpAtRim");							
								this.recordStat(t, assisted3, "fgpAtRim");							
							}
							
						} else {
					//	console.log("4");				
							this.recordStat(t, assisted, "fgp");	
							this.recordStat(t, assisted2, "fgp");	
							this.recordStat(t, assisted3, "fgp");	
							this.recordStat(t, assisted4, "fgp");	
							this.recordPlay("assist4", t, [this.team[t].player[killer].userID,this.team[tD].player[killed].userID,this.team[t].player[assisted].userID,this.team[t].player[assisted2].userID,this.team[t].player[assisted3].userID,this.team[t].player[assisted4].userID]);
							goldTime = this.t*500/60/1000/5;
							if (goldTime> 500/5) {
							  goldTime = 500/1000/5/this.t*killGoldAdj;
							}
							this.recordStat(t, killer, "trb",goldTime);		
							this.recordStat(t, assisted, "trb",goldTime);		
							this.recordStat(t, assisted2, "trb",goldTime);		
							this.recordStat(t, assisted3, "trb",goldTime);		
							this.recordStat(t, assisted4, "trb",goldTime);	
							
				/*			playerGoldBuff[t][killer] *= (1+(goldTime/5*5));										
							playerGoldBuff[t][assisted] *= (1+(goldTime/5));										
							playerGoldBuff[t][assisted2] *= (1+(goldTime/5));										
							playerGoldBuff[t][assisted3] *= (1+(goldTime/5));										
							playerGoldBuff[t][assisted4] *= (1+(goldTime/5));										*/
							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);												
							playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);												
							playerGoldBuff[t][assisted2] *= (1+goldTime/playerGoldBuff[t][assisted2]);	
							playerGoldBuff[t][assisted3] *= (1+goldTime/playerGoldBuff[t][assisted3]);								
							playerGoldBuff[t][assisted4] *= (1+goldTime/playerGoldBuff[t][assisted4]);	
							
							playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus/5*5);					
						/*	playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/5);					
							playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/5);					
							playerBuff[t][assisted3] += (1+(playerBuff[tD][assisted3]-1)*killBonus/5);					
							playerBuff[t][assisted4] += (1+(playerBuff[tD][assisted4]-1)*killBonus/5);	*/
							if (assisted == 4) {							
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/5);					
							} else {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/5);					
							}							
//							playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/3);					
							if (assisted2 == 4) {							
								playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/5);					
							} else {
								playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/5);					
							}								
							if (assisted3 == 4) {							
								playerBuff[t][assisted3] += (1+(playerBuff[tD][assisted3]-1)*killBonus/5);					
							} else {
								playerBuff[t][assisted3] += (1+(playerBuff[tD][assisted3]-1)*killBonus/5);					
							}	
							if (assisted4 == 4) {							
								playerBuff[t][assisted4] += (1+(playerBuff[tD][assisted4]-1)*killBonus/5);					
							} else {
								playerBuff[t][assisted4] += (1+(playerBuff[tD][assisted4]-1)*killBonus/5);					
							}								
							if (this.t < 10) {
								this.recordStat(t, assisted, "fgpAtRim");							
								this.recordStat(t, assisted2, "fgpAtRim");							
								this.recordStat(t, assisted3, "fgpAtRim");							
								this.recordStat(t, assisted4, "fgpAtRim");							
							}
						}
					//	console.log("here");
						this.recordStat(t, killer, "fg");				
						this.recordStat(tD, killed, "fga");
						if (this.t < 10) {
							this.recordStat(t, killer, "fgAtRim");				
							this.recordStat(tD, killed, "fgaAtRim");				
							/*if (assisted == 9999) {
							} else {
								this.recordStat(t, assisted, "fgpAtRim");							
							}*/						
					//	console.log("here");				
						}

					}
					outcome = "done";
				} else {
			//	  console.log("Fail: "+this.t);
				}
			} 		
		
		}
			//	console.log("here");		
		//console.log(this.team[tD].compositeRating.championKilling);				
		
		if (this.t > 100) {
			//console.log(this.t);
		} 
		if (this.t>110) {
				outcome = "nexus";		
		  
		}
		
//        return this.doShot(shooter);  // fg, orb, or drb
        return outcome;  // fg, orb, or drb
    };

	
  /**
     * Probability of the current possession ending in a turnover.
     *
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.groupPlay = function (groupNumber,playType,statType,p,t) {
	
	              var i,groupNumberNew,iNew;

			/////	  console.log("group ISSUE?");
				  // reorder by removing dead players
				groupNumberNew = groupNumber;
				iNew = 0;
				for (i = 0; i < groupNumber; i++) {	
					//iNew = i+groupNumber-groupNumberNew;
			//		console.log(i+" "+iNew+" "+groupNumberNew+" "+groupNumber);
					if ((playerDeaths[t][p[iNew]] == 1) && (i+1<groupNumber) ) { 
				//		console.log("ONE DEAD");
					    if (playerDeaths[t][p[iNew+1]] == 1) { 				
					//	console.log("TWO DEAD");
							if (playerDeaths[t][p[iNew+2]] == 1) { 				
						//console.log("THREE DEAD");						
								if (playerDeaths[t][p[iNew+3]] == 1) { 				
						//console.log("FOUR DEAD");								
									if (playerDeaths[t][p[iNew+4]] == 1) { 				
						//console.log("FIVE DEAD");									
										groupNumberNew = 0;
										iNew += 4;
									} else {
										groupNumberNew -= 4;									
										p[i]=p[iNew+4];
									//	groupNumberNew -= 4;						
										iNew += 4;					
									}	
								} else {
										groupNumberNew -= 3;									
										p[i]=p[iNew+3];
									//	groupNumberNew -= 3;						
										iNew += 3;							
								}										
							} else {
										groupNumberNew -= 2;									
										p[i]=p[iNew+2];
									//	groupNumberNew -= 2;						
										iNew += 2;							
							}										
						} else {
										groupNumberNew -= 1;									
										p[i]=p[iNew+1];
								//		groupNumberNew -= 1;						
										iNew += 1;						
										
						}
						
					} 
					if (iNew >= groupNumber-1) {
					    break;
					}
				}				
				groupNumber =   groupNumberNew;
			
			    if (groupNumber == 1) {
//					if (playerDeaths[t][p[0]] == 0) { 				
						this.recordPlay(playType, t, [this.team[t].player[p[0]].userID]);
						this.recordStat(t, p[0], statType);									
	//				}
				} else if (groupNumber == 2) {				
		//			if ((playerDeaths[t][p[0]] == 0) && (playerDeaths[t][p[1]] == 0))  { 								

						this.recordPlay(playType, t, [this.team[t].player[p[0]].userID,this.team[t].player[p[1]].userID]);				
						this.recordStat(t, p[0], statType);									
						this.recordStat(t, p[1], statType);						
			/*		} else if ((playerDeaths[t][p[0]] == 0) && (playerDeaths[t][p[1]] == 1))  { 				
					
						groupNumber=1;					
						this.recordPlay(playType, t, [this.team[t].player[p[0]].userID]);				
						this.recordStat(t, p[0], statType);									
					} else if ((playerDeaths[t][p[0]] == 1) && (playerDeaths[t][p[1]] == 0))  { 				
					
						groupNumber=1;					
						this.recordPlay(playType, t, [this.team[t].player[p[1]].userID]);				
						this.recordStat(t, p[1], statType);									
					}		*/
					
				} else if (groupNumber == 3) {
				  //   console.log(groupNumber+" "+p[0]);
					this.recordPlay(playType, t, [this.team[t].player[p[0]].userID,this.team[t].player[p[1]].userID,this.team[t].player[p[2]].userID]);				
					this.recordStat(t, p[0], statType);									
					this.recordStat(t, p[1], statType);									
					this.recordStat(t, p[2], statType);									
				} else if (groupNumber == 4) {
				   //  console.log(groupNumber+" "+p[0]);
					this.recordPlay(playType, t, [this.team[t].player[p[0]].userID,this.team[t].player[p[1]].userID,this.team[t].player[p[2]].userID,this.team[t].player[p[3]].userID]);				
					this.recordStat(t, p[0], statType);									
					this.recordStat(t, p[1], statType);									
					this.recordStat(t, p[2], statType);									
					this.recordStat(t, p[3], statType);									
				} else {
				//     console.log(groupNumber+" "+p[0]);
					this.recordPlay(playType, t, [this.team[t].player[p[0]].userID,this.team[t].player[p[1]].userID,this.team[t].player[p[2]].userID,this.team[t].player[p[3]].userID,this.team[t].player[p[4]].userID]);				
					this.recordStat(t, p[0], statType);									
					this.recordStat(t, p[1], statType);									
					this.recordStat(t, p[2], statType);									
					this.recordStat(t, p[3], statType);									
					this.recordStat(t, p[4], statType);									
				}	
				/////////  console.log("guess not?");
        return ;
    };	
	
 /**
     * Probability of the current possession ending in a turnover.
     *
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    GameSim.prototype.groupPlayOnly = function (groupNumber,playType,p,t) {
	
			    if (groupNumber == 1) {
					this.recordPlay(playType, t, [this.team[t].player[p[0]].userID]);									
				} else if (groupNumber == 2) {
					this.recordPlay(playType, t, [this.team[t].player[p[0]].userID,this.team[t].player[p[1]].userID]);					
				} else if (groupNumber == 3) {
					this.recordPlay(playType, t, [this.team[t].player[p[0]].userID,this.team[t].player[p[1]].userID,this.team[t].player[p[2]].userID]);				

				} else if (groupNumber == 4) {
					this.recordPlay(playType, t, [this.team[t].player[p[0]].userID,this.team[t].player[p[1]].userID,this.team[t].player[p[2]].userID,this.team[t].player[p[3]].userID]);				
				} else {
					this.recordPlay(playType, t, [this.team[t].player[p[0]].userID,this.team[t].player[p[1]].userID,this.team[t].player[p[2]].userID,this.team[t].player[p[3]].userID,this.team[t].player[p[4]].userID]);				
				}	
	
        return ;
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
       // this.recordStat(this.o, p, "tov");
        if (this.probStl() > Math.random()) {
            return this.doStl(p);  // "stl"
        }

   //     this.recordPlay("tov", this.o, [this.team[this.o].player[p].name]);

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
     //   this.recordStat(this.d, p, "stl");
      //  this.recordPlay("stl", this.d, [this.team[this.d].player[p].name, this.team[this.o].player[pStoleFrom].name]);

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
        var fatigue, p, passer, probAndOne, probMake, probMissAndFoul, r1, r2, r3, ratios, type;

        p = this.playersOnCourt[this.o][shooter];

        fatigue = this.fatigue(this.team[this.o].player[p].stat.energy);

        // Is this an "assisted" attempt (i.e. an assist will be recorded if it's made)
        passer = -1;
        if (this.probAst() > Math.random()) {
            ratios = this.ratingArray("passing", this.o, 2);
            passer = this.pickPlayer(ratios, shooter);
        }

        // Pick the type of shot and store the success rate (with no defense) in probMake and the probability of an and one in probAndOne
        if (this.team[this.o].player[p].compositeRating.shootingThreePointer > 0.5 && Math.random() < (0.35 * this.team[this.o].player[p].compositeRating.shootingThreePointer)) {
            // Three pointer
            type = "threePointer";
            probMissAndFoul = 0.02;
            probMake = this.team[this.o].player[p].compositeRating.shootingThreePointer * 0.35 + 0.24;
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
      //  this.recordStat(this.o, p, "fga");
        if (type === "atRim") {
   //         this.recordStat(this.o, p, "fgaAtRim");
  //          this.recordPlay("missAtRim", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
    //        this.recordStat(this.o, p, "fgaLowPost");
     //       this.recordPlay("missLowPost", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
     //       this.recordStat(this.o, p, "fgaMidRange");
      //      this.recordPlay("missMidRange", this.o, [this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
       //     this.recordStat(this.o, p, "tpa");
        //    this.recordPlay("missTp", this.o, [this.team[this.o].player[p].name]);
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
 //       this.recordStat(this.o, p, "fga");
        if (type === "atRim") {
  //          this.recordStat(this.o, p, "fgaAtRim");
        } else if (type === "lowPost") {
  //          this.recordStat(this.o, p, "fgaLowPost");
        } else if (type === "midRange") {
   //         this.recordStat(this.o, p, "fgaMidRange");
        } else if (type === "threePointer") {
   //         this.recordStat(this.o, p, "tpa");
        }

        ratios = this.ratingArray("blocking", this.d, 4);
        p2 = this.playersOnCourt[this.d][this.pickPlayer(ratios)];
    //    this.recordStat(this.d, p2, "blk");


        if (type === "atRim") {
     //       this.recordPlay("blkAtRim", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
      //      this.recordPlay("blkLowPost", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
      //      this.recordPlay("blkMidRange", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
      //      this.recordPlay("blkTp", this.d, [this.team[this.d].player[p2].name, this.team[this.o].player[p].name]);
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
  //      this.recordStat(this.o, p, "fga");
   //     this.recordStat(this.o, p, "fg");
   //     this.recordStat(this.o, p, "pts", 2);  // 2 points for 2's
        if (type === "atRim") {
    //        this.recordStat(this.o, p, "fgaAtRim");
   //         this.recordStat(this.o, p, "fgAtRim");
   //         this.recordPlay("fgAtRim" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
     //       this.recordStat(this.o, p, "fgaLowPost");
     //       this.recordStat(this.o, p, "fgLowPost");
     //       this.recordPlay("fgLowPost" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
     //       this.recordStat(this.o, p, "fgaMidRange");
     //       this.recordStat(this.o, p, "fgMidRange");
     //       this.recordPlay("fgMidRange" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
     //       this.recordStat(this.o, p, "pts");  // Extra point for 3's
     //       this.recordStat(this.o, p, "tpa");
     //       this.recordStat(this.o, p, "tp");
     //       this.recordPlay("tp" + (andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
        }

        if (passer >= 0) {
            p = this.playersOnCourt[this.o][passer];
      //      this.recordStat(this.o, p, "ast");
       //     this.recordPlay("ast", this.o, [this.team[this.o].player[p].name]);
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
      //      this.recordStat(this.o, p, "fta");
            if (Math.random() < this.team[this.o].player[p].compositeRating.shootingFT * 0.3 + 0.6) {  // Between 60% and 90%
        //        this.recordStat(this.o, p, "ft");
          //      this.recordStat(this.o, p, "pts");
            //    this.recordPlay("ft", this.o, [this.team[this.o].player[p].name]);
                outcome = "fg";
            } else {
              //  this.recordPlay("missFt", this.o, [this.team[this.o].player[p].name]);
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
    //    this.recordStat(this.d, p, "pf");
    //    this.recordPlay("pf", this.d, [this.team[this.d].player[p].name]);
        // Foul out
        if (this.team[this.d].player[p].stat.pf >= 6) {
     //       this.recordPlay("foulOut", this.d, [this.team[this.d].player[p].name]);
            // Force substitutions now
         //   this.updatePlayersOnCourt();
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
  //          this.recordStat(this.d, p, "drb");
 //           this.recordPlay("drb", this.d, [this.team[this.d].player[p].name]);

            return "drb";
        }

        ratios = this.ratingArray("rebounding", this.o);
        p = this.playersOnCourt[this.o][this.pickPlayer(ratios)];
     //   this.recordStat(this.o, p, "orb");
     //   this.recordPlay("orb", this.o, [this.team[this.o].player[p].name]);

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
        amt = amt !== undefined ? amt : 1;
	//	console.log(s+" "+amt);


        if (s !== "gs" && s !== "courtTime" && s !== "benchTime" && s !== "energy") {
            this.team[t].stat[s] += amt;
            // Record quarter-by-quarter scoring too
            if (s === "pts") {
                this.team[t].stat.ptsQtrs[this.team[t].stat.ptsQtrs.length - 1] += amt;
            } else if  (s == "champPicked") {
				this.team[t].player[p].stat[s] = amt;
			} else {
				this.team[t].player[p].stat[s] += amt;				
			}
//			console.log(this.team[t].player[p].stat[s]);					
		//	console.log(s);					
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
        var i, sec, text, texts,namesUsed;

        if (this.playByPlay !== undefined) {
            if (type === "injury") {
                texts = ["{0} was injured!"];
            } else if (type === "ban") {
                texts = ["banned {0}"];							
            } else if (type === "champion") {
                texts = ["{0} picked {1}"];							
            } else if (type === "kill") {
                texts = ["{0} killed {1}"];				
            } else if (type === "assist1") {
                texts = ["{0} killed {1} with {2}"];				
            } else if (type === "assist2") {
                texts = ["{0} killed {1} with {2} and {3}"];				
            } else if (type === "assist3") {
                texts = ["{0} killed {1} with {2}, {3}, and {4}"];				
            } else if (type === "assist4") {
                texts = ["{0} killed {1} with {2}, {3}, {4}, and {5}"];				
            } else if (type === "nexus") {
                texts = ["{0} destroyed the Nexus"];							
            } else if (type === "towerOutBot") {
                texts = ["{0} destroyed the Bottom Lane Outer Tower"];
            } else if (type === "towerOutTop") {
                texts = ["{0} destroyed the Top Lane Outer Tower"];
            } else if (type === "towerOutMid") {
                texts = ["{0} destroyed the Middle Lane Outer Tower"];
            } else if (type === "dragon") {
                texts = ["{0} killed the Dragon"];
            } else if (type === "baron") {
                texts = ["{0} killed the Baron"];
            } else if (type === "towerInrBot") {
                texts = ["{0} destroyed the Bottom Lane Inner Tower"];
            } else if (type === "towerInrTop") {
                texts = ["{0} destroyed the Top Lane Inner Tower"];
            } else if (type === "towerInrMid") {
                texts = ["{0} destroyed the Middle Lane Inner Tower"];
            } else if (type === "towerInhBot") {
                texts = ["{0} destroyed the Bottom Lane Inhibitor Tower"];
            } else if (type === "towerInhTop") {
                texts = ["{0} destroyed the Top Lane Inhibitor Tower"];
            } else if (type === "towerInhMid") {
                texts = ["{0} destroyed the Middle Lane Inhibitor Tower"];
            } else if (type === "inhibBot") {
                texts = ["{0} destroyed the Bottom Lane Inhibitor"];
            } else if (type === "inhibTop") {
                texts = ["{0} destroyed the Top Lane Inhibitor"];
            } else if (type === "inhibMid") {
                texts = ["{0} destroyed the Middle Lane Inhibitor"];								
            } else if (type === "towerNexTop") {
                texts = ["{0} destroyed the Top Nexus Tower"];
            } else if (type === "towerNexBot") {
                texts = ["{0} destroyed the Bottom Nexus Tower"];
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
                texts = ["(assist: {0})"];
            } else if (type === "quarter") {
                texts = ["<b>Start of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length) + " quarter</b>"];
            } else if (type === "overtime") {
                texts = ["<b>Start of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length - 4) + " overtime period</b>"];
            } else if (type === "ft") {
                texts = ["{0} made a free throw"];
            } else if (type === "missFt") {
                texts = ["{0} missed a free throw"];
            } else if (type === "pf") {
                texts = ["Foul on {0}"];
            } else if (type === "foulOut") {
                texts = ["{0} fouled out"];
            } else if (type === "sub") {
                texts = ["Substitution: {0} for {1}"];
            } else if (type === "time") {
                texts = ["time"];
            }

            if (texts) {
                //text = random.choice(texts);
                text = texts[0];
                if (names && (this.t >  0) && (type != "kill") && (type != "assist1") && (type != "assist2") && (type != "assist3") && (type != "assist4") ) {
				    if (names.length == 1) {
//                        text = text.replace("{" + i + "}", names[i]);
					   namesUsed = names[0];
					} else if (names.length == 2) {
					   namesUsed = names[0]+" and "+names[1];
					} else if (names.length == 2) {
					   namesUsed = names[0]+" and "+names[1];
					} else if (names.length == 3) {
					   namesUsed = names[0]+", "+names[1]+", and "+names[2];
					} else if (names.length == 4) {
					   namesUsed = names[0]+", "+names[1]+", "+names[2]+", and "+names[3];
					} else if (names.length == 5) {
					   namesUsed = names[0]+", "+names[1]+", "+names[2]+", "+names[3]+", and "+names[4];
					}
	                   text = text.replace("{0}", namesUsed);
					
                   /* for (i = 0; i < names.length; i++) {
                        text = text.replace("{" + i + "}", names[i]);
                    }*/
                } else if (names) {
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