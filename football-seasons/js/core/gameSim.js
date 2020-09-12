/**
 * @name core.gameSim
 * @namespace Individual game simulation.
 */
define(["lib/underscore", "util/helpers", "util/random"], function(_, helpers, random) {
	"use strict";

	var fieldPosition;

	var firstTimeThrough = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// top 11 plays?
	var firstTimeOffense = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var firstTimeDefense = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var firstTimeBlocking = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var firstTimeRushing = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var firstTimeTackling = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var firstTimeType = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is

	//		var firstTimeRunning = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
	var count1 = [0, 0];

	var secondTimeThrough = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// top 11 plays?
	var secondTimeOffense = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var secondTimeDefense = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var secondTimeBlocking = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var secondTimeRushing = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var secondTimeTackling = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var secondTimeType = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is

	//		var secondTimeRunning = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
	var count2 = [0, 0];

	var thirdTimeThrough = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// top 11 plays?
	var thirdTimeOffense = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var thirdTimeDefense = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var thirdTimeBlocking = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var thirdTimeRushing = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var thirdTimeTackling = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is
	var thirdTimeType = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
	// who player is

	//	var thirdTimeRunning = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
	var count3 = [0, 0];

	//var driveActive = [0,0];
	//var fieldPosition = 20;
	//var toFirst = 10;
	//var yardsOnPlay = 0;
	var driveNumber = [0, 0];

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
		this.team = [team1, team2];
		// If a team plays twice in a day, this needs to be a deep copy

		//// make based on actual play? and yardage?
		this.numPossessions = Math.round((this.team[0].pace + this.team[1].pace) / 2 * random.uniform(0.9, 1.1));
		this.dt = 60 / (2 * this.numPossessions);
		// Time elapsed per possession
		// make random?
		this.playersOnCourt = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]];
		this.playersOnBench = [[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]];

		//	console.log(this.playersOnCourt);
		//	if ((this.team[0].player[0].rosterOrder == this.team[0].player[1].rosterOrder) || (this.team[1].player[0].rosterOrder == this.team[1].player[1].rosterOrder) ) {
		// Starting lineups, which will be reset by updatePlayersOnCourt. This must be done because of injured players in the top 5.
		//        this.playersOnCourt = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]];
		for ( i = 0; i < this.team[0].player.length; i++) {
			//			console.log("i: "+i+" GameSim team 0 player 0: "+this.team[0].player[i].pos+" active: "+this.team[0].player[i].active+" offDefK: "+this.team[0].player[i].offDefK+"  rosterOrder: "+this.team[0].player[i].rosterOrder);
			if (i > 0) {
				teamZeroPlayer += (1 + this.team[0].player[i - 1].rosterOrder - this.team[0].player[i].rosterOrder) * (1 + this.team[0].player[i - 1].rosterOrder - this.team[0].player[i].rosterOrder)
			}
		}
		for ( i = 0; i < this.team[1].player.length; i++) {
			//				console.log("i: "+i+" GameSim team 1 player 0: "+this.team[1].player[i].pos+" active: "+this.team[1].player[i].active+" offDefK: "+this.team[1].player[i].offDefK+" rosterOrder: "+this.team[1].player[i].rosterOrder);
			if (i > 0) {
				teamOnePlayer += (1 + this.team[1].player[i - 1].rosterOrder - this.team[1].player[i].rosterOrder) * (1 + this.team[1].player[i - 1].rosterOrder - this.team[1].player[i].rosterOrder)
			}
		}

		//	console.log("Zero: "+teamZeroPlayer);
		//	console.log("One: "+teamOnePlayer);

		if ((teamZeroPlayer > 10) || (teamOnePlayer > 10)) {

			/*if (teamZeroPlayer>0) {
			 teamPlayer = 0;
			 } else {
			 teamPlayer = 1;
			 }*/

			for ( i = 0; i < this.team[0].player.length; i++) {
				//		console.log("i: "+i+" GameSim team 0 player 0: "+this.team[0].player[i].pos+" active: "+this.team[0].player[i].active+" offDefK: "+this.team[0].player[i].offDefK+"  rosterOrder: "+this.team[0].player[i].rosterOrder+" playerOnCourt: "+this.playersOnCourt[0][i]);
			}
			for ( i = 0; i < this.team[1].player.length; i++) {
				//		console.log("i: "+i+" GameSim team 1 player 0: "+this.team[1].player[i].pos+" active: "+this.team[1].player[i].active+" offDefK: "+this.team[1].player[i].offDefK+" rosterOrder: "+this.team[1].player[i].rosterOrder+" playerOnCourt: "+this.playersOnCourt[1][i]);

			}

			for ( j = 0; j < 2; j++) {
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

				for ( i = 0; i < this.team[teamPlayer].player.length; i++) {

					if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK == "off") && (offenseCount < 11)) {
						//		offenseArray[offenseCount] = this.team[teamPlayer].player[i];
						this.playersOnCourt[teamPlayer][offenseCount] = i;
						offenseCount += 1;
						//		console.log("i: "+i+" offenseCount: "+offenseCount);
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK == "def") && (defenseCount < 11)) {
						//	defenseArray[defenseCount] = this.team[teamPlayer].player[i];
						defenseCount += 1;
						this.playersOnCourt[teamPlayer][defenseCount + 10] = i;
						//		console.log("i: "+i+" defenseCount: "+defenseCount);
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK == "k") && (kickerCount < 2)) {
						//	kickerArray[kickerCount] = this.team[teamPlayer].player[i];
						kickerCount += 1;
						this.playersOnCourt[teamPlayer][11 + 10 + kickerCount] = i;
						//		console.log("i: "+i+" kickerCount: "+kickerCount);
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK == "def")) {
						//	dBenchArray[dBenchCount] = this.team[teamPlayer].player[i];
						this.playersOnBench[teamPlayer][11 + 10 + 2 + dBenchCount + oBenchCount + kBenchCount] = i;
						dBenchCount += 1;

					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK == "off")) {
						//	oBenchArray[oBenchCount] = this.team[teamPlayer].player[i];
						this.playersOnBench[teamPlayer][11 + 10 + 2 + dBenchCount + oBenchCount + kBenchCount] = i;
						oBenchCount += 1;
					} else if (this.team[teamPlayer].player[i].active && (this.team[teamPlayer].player[i].offDefK == "k")) {
						//		kBenchArray[kBenchCount] = this.team[teamPlayer].player[i];
						this.playersOnBench[teamPlayer][11 + 10 + 2 + dBenchCount + oBenchCount + kBenchCount] = i;
						kBenchCount += 1;

					} else if (this.team[teamPlayer].player[i].offDefK == "off") {
						//	oInactiveArray[oInactiveCount] = this.team[teamPlayer].player[i];
						oInactiveCount += 1;
					} else if (this.team[teamPlayer].player[i].offDefK == "def") {
						//	dInactiveArray[dInactiveCount] = this.team[teamPlayer].player[i];
						dInactiveCount += 1;

					} else {
						//		kInactiveArray[kInactiveCount] = this.team[teamPlayer].player[i];
						kInactiveCount += 1;
					}

					//	console.log("i: "+i+" GameSim team 0 player 0: "+this.team[0].player[i].pos+" active: "+this.team[0].player[i].active+" offDefK: "+this.team[0].player[i].offDefK+"  rosterOrder: "+this.team[0].player[i].rosterOrder);
				}

				/*	for (i = 0; i < this.team[teamPlayer].player.length; i++) {
				 if (i<11) {
				 this.team[teamPlayer].player[i] = offenseArray[i];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 } else if (i<22) {
				 this.team[teamPlayer].player[i] = defenseArray[i-11];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 } else if (i<24) {
				 this.team[teamPlayer].player[i] = kickerArray[i-22];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 } else if ((24+dBenchCount-i)>0) {
				 this.team[teamPlayer].player[i] = dBenchArray[i-24];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 } else if ((24+oBenchCount+dBenchCount-i)>0) {
				 this.team[teamPlayer].player[i] = oBenchArray[i-24-dBenchCount];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 } else if ((24+oBenchCount+dBenchCount+kBenchCount-i)>0) {
				 this.team[teamPlayer].player[i] = kBenchArray[i-24-dBenchCount-oBenchCount];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 } else if ((24+oBenchCount+dBenchCount+kBenchCount+oInactiveCount-i)>0) {
				 this.team[teamPlayer].player[i] = oInactiveArray[i-24-dBenchCount-oBenchCount-kBenchCount];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 } else if ((24+oBenchCount+dBenchCount+kBenchCount+oInactiveCount+dInactiveCount-i)>0) {
				 this.team[teamPlayer].player[i] = dInactiveArray[i-24-dBenchCount-oBenchCount-kBenchCount-oInactiveCount];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 } else if ((24+oBenchCount+dBenchCount+kBenchCount+oInactiveCount+dInactiveCount+kInactiveCount-i)>0) {
				 this.team[teamPlayer].player[i] = kInactiveArray[i-24-dBenchCount-oBenchCount-kBenchCount-oInactiveCount-dInactiveCount];
				 this.team[teamPlayer].player[i].rosterOrder	= i;
				 }

				 }*/

			}

			for ( i = 0; i < this.team[0].player.length; i++) {
				//		console.log("i: "+i+" GameSim team 0 player 0: "+this.team[0].player[i].pos+" active: "+this.team[0].player[i].active+" offDefK: "+this.team[0].player[i].offDefK+"  rosterOrder: "+this.team[0].player[i].rosterOrder+" playerOnCourt: "+this.playersOnCourt[0][i]);
			}
			for ( i = 0; i < this.team[1].player.length; i++) {
				//		console.log("i: "+i+" GameSim team 1 player 0: "+this.team[1].player[i].pos+" active: "+this.team[1].player[i].active+" offDefK: "+this.team[1].player[i].offDefK+" rosterOrder: "+this.team[1].player[i].rosterOrder+" playerOnCourt: "+this.playersOnCourt[1][i]);
			}

		}
		/*			tempPlayer = this.team[0].player[0];
		this.team[0].player[0] = this.team[0].player[2];
		this.team[0].player[2] = tempPlayer;
		tempPlayer = this.team[1].player[0];
		this.team[1].player[0] = this.team[1].player[2];
		this.team[1].player[2] = tempPlayer;			*/

		///////////// organize roster
		/*	var offenseStarter;
		var defenseStarter;
		for (i = 0; i < this.team[0].player.length; i++) {
		//0-10 off start
		//11- off bench
		// 11-21 def start
		// rest def benc
		// kicker

		}*/
		//	}

		//	console.log(this.playersOnCourt);

		this.startersRecorded = false;
		// Used to track whether the *real* starters have been recorded or not.
		this.updatePlayersOnCourt();

		this.subsEveryN = 6;
		// How many possessions to wait before doing substitutions

		this.overtimes = 0;
		// Number of overtime periods that have taken place

		//        this.t = 12; // Game clock, in minutes
		//        this.t = 15; // Game clock, in minutes  15 minutes a quarter for football
		this.t = 60;
		// Game clock, in minutes  make full game 60 minutes

		// Parameters
		this.synergyFactor = 0.1;
		// How important is synergy?

		this.homeCourtAdvantage();
	}

	/**
	 * Home court advantage.
	 *
	 * Scales composite ratings, giving home players bonuses and away players penalties.
	 *
	 * @memberOf core.gameSim
	 */
	GameSim.prototype.homeCourtAdvantage = function() {
		var factor, p, r, t;

		for ( t = 0; t < 2; t++) {
			if (t === 0) {
				factor = 1.01;
				// Bonus for home team
			} else {
				factor = 0.99;
				// Penalty for away team
			}

			for ( p = 0; p < this.team[t].player.length; p++) {
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
	GameSim.prototype.run = function() {
		var out, p, t;

		// Simulate the game up to the end of regulation

		fieldPosition = 20;
		driveNumber[0] = 0;
		//
		driveNumber[1] = 0;
		//
		playNumber = 0;
		this.simPossessions();

		// Play overtime periods if necessary
		while (this.team[0].stat.pts === this.team[1].stat.pts) {
			if (this.overtimes === 0) {
				this.numPossessions = Math.round(this.numPossessions * 15 / 60);
				// 5 minutes of possessions
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
		for ( t = 0; t < 2; t++) {
			delete this.team[t].compositeRating;
			delete this.team[t].pace;
			for ( p = 0; p < this.team[t].player.length; p++) {
				delete this.team[t].player[p].valueNoPot;
				delete this.team[t].player[p].compositeRating;
				delete this.team[t].player[p].ptModifier;
			}
		}

		out = {
			gid : this.id,
			overtimes : this.overtimes,
			team : this.team
		};

		if (this.playByPlay !== undefined) {
			out.playByPlay = this.playByPlay;
			this.playByPlay.unshift({
				type : "init",
				boxScore : this.team
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
	GameSim.prototype.simPossessions = function() {
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
			this.recordStat(this.o, this.playersOnCourt[this.o][0], "top", .15);
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

			//   this.injuries();

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
	GameSim.prototype.updatePlayersOnCourt = function() {
		var b, i, ovrs, p, pp, substitutions, t, currentFatigue, modifiedFatigue;

		substitutions = false;

		for ( t = 0; t < 2; t++) {
			// Overall values scaled by fatigue
			ovrs = [];
			for ( p = 0; p < this.team[t].player.length; p++) {
				// Injured or foulded out players can't play
				if (this.team[t].player[p].injured) {
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
			//            for (pp = 0; pp < this.playersOnCourt[t].length; pp++) {
			// skip passer
			for ( pp = 0; pp < this.playersOnCourt[t].length; pp++) {
				p = this.playersOnCourt[t][pp];
				this.playersOnCourt[t][i] = p;
				// Loop through bench players (in order of current roster position) to see if any should be subbed in)
				for ( b = 0; b < this.team[t].player.length; b++) {
					//                    if (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured || this.team[t].player[p].stat.pf >= 6) && (!this.team[t].player[b].injured && this.team[t].player[b].stat.pf < 6)))) {
					//                    if (  (this.team[t].player[b].active) && (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured ) && (!this.team[t].player[b].injured)))) && ( (this.team[t].player[b].pos == this.team[t].player[p].pos    ) && ( ((this.team[t].player[p].pos != 'QB') ) && ((this.team[t].player[p].pos != 'K') ) )) ) {
					if ((this.team[t].player[b].active) && (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured ) && (!this.team[t].player[b].injured)))) && ((this.team[t].player[b].pos == this.team[t].player[p].pos    ) )) {
						if (((this.team[t].player[p].pos == 'QB') || (this.team[t].player[p].pos == 'K') || (pp == 0) || (this.playersOnCourt[t][0] == b) ) && (!this.team[t].player[p].injured)) {
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
									type : "sub",
									t : t,
									on : this.team[t].player[b].id,
									off : this.team[t].player[p].id
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

				if ((p == this.playersOnCourt[t][i]) && (this.team[t].player[p].injured )) {

					for ( b = 0; b < this.team[t].player.length; b++) {
						//                    if (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured || this.team[t].player[p].stat.pf >= 6) && (!this.team[t].player[b].injured && this.team[t].player[b].stat.pf < 6)))) {
						//                    if (  (this.team[t].player[b].active) && (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured ) && (!this.team[t].player[b].injured)))) && ( (this.team[t].player[b].pos == this.team[t].player[p].pos    ) && ( ((this.team[t].player[p].pos != 'QB') ) && ((this.team[t].player[p].pos != 'K') ) )) ) {
						if ((this.team[t].player[b].active) && (this.playersOnCourt[t].indexOf(b) === -1 && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured ) && (!this.team[t].player[b].injured))))) {

							if ((((this.team[t].player[b].pos == 'QB') || (this.team[t].player[b].pos == 'RB') || (this.team[t].player[b].pos == 'TE') || (this.team[t].player[b].pos == 'WR') || (this.team[t].player[b].pos == 'OL') ) && ((this.team[t].player[p].pos == 'QB') || (this.team[t].player[p].pos == 'RB') || (this.team[t].player[p].pos == 'TE') || (this.team[t].player[p].pos == 'WR') || (this.team[t].player[p].pos == 'OL') ) ) || (((this.team[t].player[b].pos == 'CB') || (this.team[t].player[b].pos == 'S') || (this.team[t].player[b].pos == 'LB') || (this.team[t].player[b].pos == 'DL')  ) && ((this.team[t].player[p].pos == 'CB') || (this.team[t].player[p].pos == 'S') || (this.team[t].player[p].pos == 'DL') || (this.team[t].player[p].pos == 'LB') ) ) || (((this.team[t].player[p].pos == 'K') ) && ((this.team[t].player[b].pos == 'RB')  ) )) {

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
										type : "sub",
										t : t,
										on : this.team[t].player[b].id,
										off : this.team[t].player[p].id
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
			for ( t = 0; t < 2; t++) {
				for ( p = 0; p < this.team[t].player.length; p++) {
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
	GameSim.prototype.sigmoid = function(x, a, b) {
		return 1 / (1 + Math.exp(-(a * (x - b))));
	};

	/**
	 * Update synergy.
	 *
	 * This should be called after this.updatePlayersOnCourt as it only produces different output when the players on the court change.
	 *
	 * @memberOf core.gameSim
	 */
	GameSim.prototype.updateSynergy = function() {
		var i, p, perimFactor, t, skillsCount;

		for ( t = 0; t < 2; t++) {
			// Count all the *fractional* skills of the active players on a team (including duplicates)
			skillsCount = {
				"3" : 0,
				A : 0,
				B : 0,
				Di : 0,
				Dp : 0,
				Po : 0,
				Ps : 0,
				R : 0
			};

			//// update these

			for ( i = 0; i < 5; i++) {
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
			this.team[t].synergy.off += 5 * this.sigmoid(skillsCount["3"], 3, 2);
			// 5 / (1 + e^-(3 * (x - 2))) from 0 to 5
			this.team[t].synergy.off += 3 * this.sigmoid(skillsCount.B, 15, 0.75) + this.sigmoid(skillsCount.B, 5, 1.75);
			// 3 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) from 0 to 5
			this.team[t].synergy.off += 3 * this.sigmoid(skillsCount.Ps, 15, 0.75) + this.sigmoid(skillsCount.Ps, 5, 1.75) + this.sigmoid(skillsCount.Ps, 5, 2.75);
			// 3 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) + 1 / (1 + e^-(5 * (x - 2.75))) from 0 to 5
			this.team[t].synergy.off += this.sigmoid(skillsCount.Po, 15, 0.75);
			// 1 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
			this.team[t].synergy.off += this.sigmoid(skillsCount.A, 15, 1.75) + this.sigmoid(skillsCount.A, 5, 2.75);
			// 1 / (1 + e^-(15 * (x - 1.75))) + 1 / (1 + e^-(5 * (x - 2.75))) from 0 to 5
			this.team[t].synergy.off /= 17;

			// Punish teams for not having multiple perimeter skills
			perimFactor = helpers.bound(Math.sqrt(1 + skillsCount.B + skillsCount.Ps + skillsCount["3"]) - 1, 0, 2) / 2;
			// Between 0 and 1, representing the perimeter skills
			this.team[t].synergy.off *= 0.5 + 0.5 * perimFactor;

			// Defensive synergy
			this.team[t].synergy.def = 0;
			this.team[t].synergy.def += this.sigmoid(skillsCount.Dp, 15, 0.75);
			// 1 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
			this.team[t].synergy.def += 2 * this.sigmoid(skillsCount.Di, 15, 0.75);
			// 2 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
			this.team[t].synergy.def += this.sigmoid(skillsCount.A, 5, 2) + this.sigmoid(skillsCount.A, 5, 3.25);
			// 1 / (1 + e^-(5 * (x - 2))) + 1 / (1 + e^-(5 * (x - 3.25))) from 0 to 5
			this.team[t].synergy.def /= 6;

			// Rebounding synergy
			this.team[t].synergy.reb = 0;
			this.team[t].synergy.reb += this.sigmoid(skillsCount.R, 15, 0.75) + this.sigmoid(skillsCount.R, 5, 1.75);
			// 1 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) from 0 to 5
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
	GameSim.prototype.updateTeamCompositeRatings = function() {
		var i, j, p, rating, t, toUpdate;

		// Only update ones that are actually used
		toUpdate = ["dribbling", "passing", "rebounding", "defense", "defensePerimeter", "blocking"];

		for ( t = 0; t < 2; t++) {
			for ( j = 0; j < toUpdate.length; j++) {
				rating = toUpdate[j];
				this.team[t].compositeRating[rating] = 0;

				for ( i = 0; i < 5; i++) {
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
	GameSim.prototype.updatePlayingTime = function() {
		var p, t;

		for ( t = 0; t < 2; t++) {
			// Update minutes (overall, court, and bench)
			for ( p = 0; p < this.team[t].player.length; p++) {
				if (this.playersOnCourt[t].indexOf(p) >= 0) {
					this.recordStat(t, p, "min", this.dt);
					this.recordStat(t, p, "courtTime", this.dt);
					// This used to be 0.04. Increase more to lower PT
					this.recordStat(t, p, "energy", -this.dt * 0.06 * (1 - this.team[t].player[p].compositeRating.endurance));
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
	 * See if any injuries occurred this possession, and handle the consequences.
	 *
	 * This doesn't actually compute the type of injury, it just determines if a player is injured bad enough to miss the rest of the game.
	 *
	 * @memberOf core.gameSim
	 */
	GameSim.prototype.injuries = function() {
		var newInjury, p, t;

		newInjury = false;

		for ( t = 0; t < 2; t++) {
			for ( p = 0; p < this.team[t].player.length; p++) {
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
	GameSim.prototype.simPossession = function() {
		var ratios, shooter;

		// Turnover?
		//    if (this.probTov() > Math.random()) {
		//        return this.doTov();  // tov
		//    }

		// Shot if there is no turnover
		//      ratios = this.ratingArray("usage", this.o);
		//       shooter = this.pickPlayer(ratios);

		///// want to remove above

		////

		/*	loop possession/drive
		loop series
		---------
		loop down ( determine top mismatches for offense to use, running recieving, then pick among them)
		( 1st,2nd,3rd,4th)
		end on downs,new possession, or points */

		// doShot can be a play?
		var
		driveActive;
		var playDown;
		var i, j, k;
		var qbOptions
		var runningOptions;
		var receivingOptions;
		var blockingOptions;
		var rushingOptions;
		var coverageOptions;

		var tempVar;

		var teamTemp;

		//	console.log("this.t: "+this.t+" quarterActive: "+quarterActive);
		/*	if (this.t >30 && quarterActive == 1) {
		teamTemp = this.o;
		this.o = this.d;
		this.d = teamTemp;
		} */
		//// organize players
		//// this could be done earlier
		//// then just redone after each sub

		// find position
		//for i
		//this.team[this.o].player[this.playersOnCourt[t][positionplayers[t][0]]].pos = "RB";

		//// running options, passing options, blockers

		//	 console.log("test")
		//		 if (this.t>59) {

		//// remove this (allow for subs stats)
		if (driveNumber[this.o] >= 0) {

			//			driveNumber[this.o] = 0; //
			//		console.log("team 0 player 0: "+this.team[0].player[0].pos+" active: "+this.team[0].player[0].active+" offDefK: "+this.team[0].player[0].offDefK);
			//		console.log("team 1 player 0: "+this.team[1].player[0].pos+" active: "+this.team[1].player[0].active+" offDefK: "+this.team[1].player[0].offDefK);

			qbOptions = 0;
			runningOptions = 0;
			receivingOptions = 0;
			blockingOptions = 0;

			rushingOptions = 0;
			coverageOptions = 0;

			//// need to track locations,
			//// then create order, best to worst,
			//// then create matchups
			//// then create adjustments

			//fieldingPosition[this.d][i]

			var qbDetailed = [[100], [100]];
			var runningDetailed = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var receivingDetailed = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var blockingDetailed = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];

			var rushingDetailed = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var coverageDetailed = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];

			var runningPower = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var runningSide = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var receivingShort = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var receivingCrossing = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var receivingLong = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var blockingRun = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var blockingPass = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			//		var blockingPass = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var rushPass = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var rushRun = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var coverShort = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var coverCross = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var coverLong = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];

			var compareRunPower = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareRunSide = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareRecShort = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareRecCross = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareRecLong = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareBlockRun = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareBlockPass = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareRushPass = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareRushRun = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareCovShort = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareCovCross = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
			var compareCovDeep = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];

			////////// offense

			for ( j = 0; j < 11; j++) {
				i = this.playersOnCourt[this.o][j];
				//			console.log("this.team[this.o].player[i].pos: "+this.team[this.o].player[i].pos);

				if ((this.team[this.o].player[i].pos == "QB")) {
					qbDetailed[this.o][qbOptions] = i;
					qbOptions += 1;
				}
				if ((this.team[this.o].player[i].pos == "RB") || (this.team[this.o].player[i].pos == "QB")) {
					runningDetailed[this.o][runningOptions] = i;
					runningPower[this.o][runningOptions] = i;
					runningSide[this.o][runningOptions] = i;
					runningOptions += 1;
				}
				if (((this.team[this.o].player[i].pos == "WR") || (this.team[this.o].player[i].pos == "TE") || (this.team[this.o].player[i].pos == "RB") ) && (j > 0)) {
					receivingDetailed[this.o][receivingOptions] = i;
					receivingShort[this.o][receivingOptions] = i;
					receivingCrossing[this.o][receivingOptions] = i;
					receivingLong[this.o][receivingOptions] = i;
					receivingOptions += 1;
					//			console.log("passingDetailed[this.o][passingOptions]: "+passingDetailed[this.o][passingOptions]);
				}
				if (((this.team[this.o].player[i].pos == "OL") || (this.team[this.o].player[i].pos == "TE") || (this.team[this.o].player[i].pos == "RB") ) && (j > 0)) {
					blockingDetailed[this.o][blockingOptions] = i;
					blockingRun[this.o][blockingOptions] = i;
					blockingPass[this.o][blockingOptions] = i;
					//			console.log("blockingDetailed[this.o][blockingOptions]: "+blockingDetailed[this.o][blockingOptions]);
					blockingOptions += 1;
				}

			}

			/////// defense

			for ( j = 11; j < 22; j++) {
				i = this.playersOnCourt[this.d][j];
				//	console.log("this.team[this.d].player[i].pos: "+this.team[this.d].player[i].pos);
				if ((this.team[this.d].player[i].pos == "DL") || (this.team[this.d].player[i].pos == "LB")) {
					rushingDetailed[this.d][rushingOptions] = i;
					rushPass[this.d][rushingOptions] = i;
					rushRun[this.d][rushingOptions] = i;

					rushingOptions += 1;
					//	console.log("rushingDetailed[this.o][rushingOptions]: "+rushingDetailed[this.o][rushingOptions]);
				}
				if ((this.team[this.d].player[i].pos == "CB") || (this.team[this.d].player[i].pos == "S") || (this.team[this.d].player[i].pos == "LB")) {
					coverageDetailed[this.d][coverageOptions] = i;
					coverLong[this.d][coverageOptions] = i;
					coverCross[this.d][coverageOptions] = i;
					coverShort[this.d][coverageOptions] = i;
					coverageOptions += 1;
					//	console.log("coverageDetailed[this.o][coverageOptions] : "+coverageDetailed[this.o][coverageOptions] );
				}

			}
			/*	console.log("this.t: "+this.t);
			console.log("qb: "+qbOptions);
			console.log("running: "+runningOptions);
			console.log("pass: "+passingOptions);
			console.log("block: "+blockingOptions);
			console.log("rush: "+rushingOptions);
			console.log("cover: "+coverageOptions);*/

			//// baseball
			/*      for (i = 0; i < 8; i++) {
			if (this.team[t].player[this.playersOnCourt[t][i]].injured) {
			comparecf[i] = -100;
			} else {

			comparecf[i] =this.team[t].player[this.playersOnCourt[t][i]].compositeRating.passing*.6 + (this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defenseInterior)*.25+(this.team[t].player[this.playersOnCourt[t][i]].compositeRating.defensePerimeter)*1.00;
			}
			}	*/

			///// sort  by type of run/pass

			////////////////  Offense

			////////// running
			for ( j = 0; j < runningOptions; j++) {
				i = runningDetailed[this.o][j];
				compareRunPower[j] = this.team[this.o].player[i].compositeRating.runningPower;
				compareRunSide[j] = this.team[this.o].player[i].compositeRating.runningSide;
				//	console.log("compareRunPower[j]: "+compareRunPower[j]+" after : "+runningPower[this.o][j]);
				//console.log("compareRunSide[j]: "+compareRunSide[j]);

			}

			this.sortSkill(runningOptions, compareRunPower, runningPower);

			for ( j = 0; j < runningOptions; j++) {
				i = runningDetailed[this.o][j];
				//	console.log("compareRunSide[j]: "+compareRunSide[j]+" after : "+runningSide[this.o][j]);
			}

			this.sortSkill(runningOptions, compareRunSide, runningSide);

			//	console.log("throw acc comp : " +this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy)
			// receiving
			var QBAdj;
			for ( j = 0; j < receivingOptions; j++) {
				i = receivingDetailed[this.o][j];

				if (this.team[this.d].player[0].pos == "QB") {
					QBAdj = 1;
				} else {
					QBAdj = .5;

				}
				compareRecShort[j] = ((this.team[this.o].player[i].compositeRating.receivingShort) * 3 + (this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy) * QBAdj) / 4 - .2;
				compareRecCross[j] = ((this.team[this.o].player[i].compositeRating.receivingCrossing) * 3 + (this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy) * QBAdj / 2 + (this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingDistance) * QBAdj / 2) / 4 - .30;
				compareRecLong[j] = ((this.team[this.o].player[i].compositeRating.receivingLong) * 3 + (this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingDistance) * QBAdj / 2 + (this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.avoidSack) * QBAdj / 2) / 4 - .30;

				//				 compareRecShort[j] = ((this.team[this.o].player[i].compositeRating.receivingShort)*3+(this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy)*1)/4-.2;
				//				 compareRecCross[j] = ((this.team[this.o].player[i].compositeRating.receivingCrossing)*3+(this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingAccuracy)*.5+(this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingDistance)*.5)/4-.30;
				//				 compareRecLong[j] = ((this.team[this.o].player[i].compositeRating.receivingLong)*3+(this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.throwingDistance)*.5+(this.team[this.o].player[this.playersOnCourt[this.o][0]].compositeRating.avoidSack)*.5)/4-.30;
				//	console.log("compareRecShort[j]: "+compareRecShort[j]+" receivingShort[j]: "+receivingShort[this.o][j]);
				//console.log("compareRunSide[j]: "+compareRunSide[j]);

			}

			this.sortSkill(receivingOptions, compareRecShort, receivingShort);

			for ( j = 0; j < receivingOptions; j++) {
				i = receivingDetailed[this.o][j];
				//		console.log("compareRecCross[j]: "+compareRecCross[j]+" receivingCrossing[j]: "+receivingCrossing[this.o][j]);
			}

			this.sortSkill(receivingOptions, compareRecCross, receivingCrossing);

			for ( j = 0; j < receivingOptions; j++) {
				i = receivingDetailed[this.o][j];
				//		console.log("compareRecLong[j]: "+compareRecLong[j]+" receivingLong[j]: "+receivingLong[this.o][j]);
			}

			this.sortSkill(receivingOptions, compareRecLong, receivingLong);

			// blocking
			for ( j = 0; j < blockingOptions; j++) {
				i = blockingDetailed[this.o][j];
				compareBlockRun[j] = this.team[this.o].player[i].compositeRating.blockRun;
				compareBlockPass[j] = this.team[this.o].player[i].compositeRating.blockPass;
				//		console.log("compareBlockRun[j]: "+compareBlockRun[j]+" blockingRun[j]: "+blockingRun[this.o][j]);
				//console.log("compareRunSide[j]: "+compareRunSide[j]);

			}

			this.sortSkill(blockingOptions, compareBlockRun, blockingRun);

			for ( j = 0; j < blockingOptions; j++) {
				i = blockingDetailed[this.o][j];
				//	console.log("compareBlockPass[j]: "+compareBlockPass[j]+" blockingPass[j]: "+blockingPass[this.o][j]);
			}

			this.sortSkill(blockingOptions, compareBlockPass, blockingPass);

			////////////////////Defense

			// rushing
			for ( j = 0; j < rushingOptions; j++) {
				i = rushingDetailed[this.d][j];
				compareRushRun[j] = this.team[this.d].player[i].compositeRating.runStop;
				compareRushPass[j] = this.team[this.d].player[i].compositeRating.passRush;
				//	console.log("compareRushRun[j]: "+compareRushRun[j]+" rushRun[j]: "+rushRun[this.d][j]);
				//console.log("compareRunSide[j]: "+compareRunSide[j]);

			}

			this.sortSkillDefense(rushingOptions, compareRushRun, rushRun);

			for ( j = 0; j < rushingOptions; j++) {
				i = rushingDetailed[this.d][j];
				//	console.log("compareRushPass[j]: "+compareRushPass[j]+" rushPass[j]: "+rushPass[this.d][j]);
			}

			this.sortSkillDefense(rushingOptions, compareRushPass, rushPass);

			// coverage
			for ( j = 0; j < coverageOptions; j++) {
				i = coverageDetailed[this.d][j];

				compareCovShort[j] = this.team[this.d].player[i].compositeRating.shortCoverage;
				compareCovCross[j] = this.team[this.d].player[i].compositeRating.crossingCoverage;
				compareCovDeep[j] = this.team[this.d].player[i].compositeRating.deepCoverage;
				//	console.log("compareCovShort[j]: "+compareCovShort[j]+" coverShort[j]: "+coverShort[this.d][j]);
				//console.log("compareRunSide[j]: "+compareRunSide[j]);

			}

			this.sortSkillDefense(coverageOptions, compareCovShort, coverShort);

			for ( j = 0; j < coverageOptions; j++) {
				i = coverageDetailed[this.d][j];
				//	console.log("compareCovCross[j]: "+compareCovCross[j]+" coverCross[j]: "+coverCross[this.d][j]);
			}

			this.sortSkillDefense(coverageOptions, compareCovCross, coverCross);

			for ( j = 0; j < coverageOptions; j++) {
				i = coverageDetailed[this.d][j];
				//		console.log("compareCovDeep[j]: "+compareCovDeep[j]+" coverLong[j]: "+coverLong[this.d][j]);
			}

			this.sortSkillDefense(coverageOptions, compareCovDeep, coverLong);

			//////////////  matchups
			/*				var runningPower = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var runningSide = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var receivingShort = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var receivingCrossing = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var receivingLong = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var blockingRun = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var blockingPass = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var blockingPass = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var rushPass = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var rushRun = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var coverShort = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var coverCross = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var coverLong = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;

			var compareRunPower = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareRunSide = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareRecShort = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareRecCross = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareRecLong = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareBlockRun = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareBlockPass = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareRushPass = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareRushRun = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareCovShort = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareCovCross = [100,100,100,100,100,100,100,100,100,100,100] ;
			var compareCovDeep = [100,100,100,100,100,100,100,100,100,100,100] ; */

			//// line match ups

			//// first line matchup
			/*				 compareBlockRun[j] = this.team[this.o].player[i].compositeRating.blockRun;
			compareBlockPass[j] = this.team[this.o].player[i].compositeRating.blockPass;
			compareRushRun[j] = this.team[this.d].player[i].compositeRating.runStop;
			compareRushPass[j] = this.team[this.d].player[i].compositeRating.passRush;*/

			/*	 qbOptions = 0;
			runningOptions = 0;
			receivingOptions = 0;
			blockingOptions = 0;

			rushingOptions = 0;
			coverageOptions = 0;

			//// need to track locations,
			//// then create order, best to worst,
			//// then create matchups
			//// then create adjustments

			//fieldingPosition[this.d][i]

			var qbDetailed = [[100],[100]] ;
			var runningDetailed = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var receivingDetailed = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var blockingDetailed = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;

			var rushingDetailed = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			var coverageDetailed = [[100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100]] ;
			*/

			var lineDifferentialsRun = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var lineDifferentialsPass = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];

			var receivingDifferentialsShort = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var receivingDifferentialsCrossing = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];
			var receivingDifferentialsLong = [[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]];

			var skillDiffRunOptions, skillDiffPassOptions, skillDiffShortOptions, skillDiffCrossingOptions, skillDiffLongOptions;
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
			skillDiffLongOptions = 10;
			////
			//	console.log("bb rush options: "+ rushingOptions+" block "+blockingOptions+" minRun  "+skillDiffRunOptions);
			if (rushingOptions > blockingOptions) {
				skillDiffRunOptions = blockingOptions;
				skillDiffPassOptions = blockingOptions;
			} else {
				skillDiffRunOptions = rushingOptions;
				skillDiffPassOptions = rushingOptions;
			}
			if (coverageOptions > receivingOptions) {
				skillDiffShortOptions = receivingOptions;
				skillDiffCrossingOptions = receivingOptions;
				skillDiffLongOptions = receivingOptions;
			} else {
				skillDiffShortOptions = coverageOptions;
				skillDiffCrossingOptions = coverageOptions;
				skillDiffLongOptions = coverageOptions;
			}

			//		console.log("b rush options: "+ rushingOptions+" block "+blockingOptions+" minRun  "+skillDiffRunOptions);
			//			console.log("lineDifferentialsRun b: "+ lineDifferentialsRun);
			//	console.log("Line-Run");
			this.skillDifferential("blockRun", "runStop", lineDifferentialsRun, rushingOptions, blockingOptions, blockingRun, rushRun, skillDiffRunOptions);
			//		console.log("a rush options: "+ rushingOptions+" block "+blockingOptions+" minRun  "+skillDiffRunOptions);
			//		console.log("lineDifferentialsRun a: "+ lineDifferentialsRun);
			//	console.log("Line-Pass");
			this.skillDifferential("blockPass", "passRush", lineDifferentialsPass, rushingOptions, blockingOptions, blockingPass, rushPass, skillDiffPassOptions);
			//		console.log("rush options: "+ rushingOptions+" block "+blockingOptions+" minPass  "+skillDiffPassOptions);
			//	console.log("Receive-Short");
			this.skillDifferential("receivingShort", "shortCoverage", receivingDifferentialsShort, coverageOptions, receivingOptions, receivingShort, coverShort, skillDiffShortOptions);
			//		console.log("cover options: "+ coverageOptions+" receive "+receivingOptions+" minshort  "+skillDiffShortOptions);
			//	console.log("Receive-Cross");
			this.skillDifferential("receivingCrossing", "crossingCoverage", receivingDifferentialsCrossing, coverageOptions, receivingOptions, receivingCrossing, coverCross, skillDiffCrossingOptions);
			//		console.log("cover options: "+ coverageOptions+" receive "+receivingOptions+" mincrossing  "+skillDiffCrossingOptions);
			//	console.log("Receive-Long");
			this.skillDifferential("receivingLong", "deepCoverage", receivingDifferentialsLong, coverageOptions, receivingOptions, receivingLong, coverLong, skillDiffLongOptions);
			//		console.log("cover options: "+ coverageOptions+" receive "+receivingOptions+" minlong  "+skillDiffLongOptions);
			////////////// LINE-ALL (need to split, run(each runner) ,pass

			//First time through (just short passes to receivers)

			//// create list  receive-short, just receivers, runners can run (3 and 1, this will be weighted higher, quick throw)
			////////////////////

			/*i = 0;
			while (lineDifferentialsRun[this.o][i] <100) {
			i += 1;
			}
			j = 0;
			while (receivingDifferentialsShort[this.o][j] <100) {
			j += 1;
			}
			//	j = 0;*/

			//runningOptions
			//this.sortSkill(runningOptions,compareRunPower,runningPower);		// after first two each runner
			//this.sortSkill(runningOptions,compareRunSide,runningSide);		// first two in line/adjust for each runner	 (for QB use this anywhere on line)

			//runningOptions

			//total is i*runningOptions+j

			//	var firstTimeThrough = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // top 11 plays?
			//		var firstTimeOffense = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			/*			var firstTimeDefense = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var firstTimeBlocking= [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var firstTimeRushing = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var firstTimeType = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is

			var firstTimeRunning = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is */
			//var count1 = 0;

			//			for (k = 0; k < (i*runningOption+j); k++) {
			var
			l, skipped, blockingLanes;

			//			console.log("skillDiffShortOptions: "+skillDiffShortOptions);
			//			console.log("receivingShort0: "+receivingShort[this.o][0]);
			//			console.log("receivingShort1: "+receivingShort[this.o][1]);
			//		console.log("receivingShort2: "+receivingShort[this.o][2]);
			skipped = 0;
			count1[this.o] = 0;
			//			for (k = 0; k < j; k++) {
			for ( k = 0; k < skillDiffShortOptions; k++) {

				if ((this.team[this.o].player[receivingShort[this.o][k]].pos == "RB") || (this.team[this.o].player[receivingShort[this.o][k]].pos == "TE")) {
					skipped += 1;
				} else {

					//					firstTimeThrough[this.o][k] = receivingDifferentialsShort[this.o][k];
					//					firstTimeDefense[this.d][k] = coverShort[this.d][k];
					//					firstTimeOffense[this.o][k] = receivingShort[this.o][k];
					firstTimeThrough[this.o][count1[this.o]] = receivingDifferentialsShort[this.o][k] + .5;
					firstTimeDefense[this.d][count1[this.o]] = coverShort[this.d][k];
					firstTimeOffense[this.o][count1[this.o]] = receivingShort[this.o][k];
					firstTimeBlocking[this.o][count1[this.o]] = blockingPass[this.o][k];
					firstTimeRushing[this.d][count1[this.o]] = rushPass[this.d][k];
					//	firstTimeBlocking[this.o][count1[this.o]] = 100;
					//		firstTimeRushing[this.d][count1[this.o]] = 100;
					firstTimeType[this.o][count1[this.o]] = 3;
					//					console.log("k: "+k+" diff "+firstTimeThrough[this.o][k]+" def "+firstTimeDefense[this.d][k]+" off "+firstTimeOffense[this.o][k]+" run? "+firstTimeRunning[this.o][k]);
					//			console.log("k: "+k+" count1[this.o]: "+count1[this.o]+" diff "+firstTimeThrough[this.o][count1[this.o]]+" defcovershort "+firstTimeDefense[this.d][count1[this.o]]+" offreceiveshort "+firstTimeOffense[this.o][count1[this.o]]+" blocking "+firstTimeBlocking[this.o][count1[this.o]]+" rushing "+firstTimeRushing[this.d][count1[this.o]]);
					count1[this.o] += 1;
				}
				//	console.log("compareCovCross[j]: "+compareCovCross[j]+" coverCross[j]: "+coverCross[this.d][j]);
			}

			/*compareRunPower[j] = this.team[this.o].player[i].compositeRating.runningPower;
			compareRunSide[j] = this.team[this.o].player[i].compositeRating.runningSide;	*/

			//count1[this.o] = j-skipped;
			//	console.log("count1[this.o]: "+count1[this.o]);
			for ( l = 0; l < runningOptions; l++) {

				/*	if (rushingOptions>blockingOptions) {
				 blockingLanes = blockingOptions;
				 } else {
				 blockingLanes = rushingOptions;
				 }*/
				for ( k = 0; k < skillDiffRunOptions; k++) {

					// if non QB, only first two 0-1
					// if QB all
					//					if ((k<2) || (this.team[this.o].player[l].pos == "QB") ) {
					if ((k < 2) && (this.team[this.o].player[runningSide[this.o][l]].pos != "QB")) {
						//		console.log("line "+lineDifferentialsRun[this.o][k]/5+" playerS "+ this.team[this.o].player[runningDetailed[this.o][l]].compositeRating.runningSide+" combo "+(lineDifferentialsRun[this.o][k]/5+this.team[this.o].player[runningDetailed[this.o][l]].compositeRating.runningSide-.50)+" player pos "+this.team[this.o].player[runningSide[this.o][l]].pos+" player# "+runningSide[this.o][l]);
						firstTimeThrough[this.o][count1[this.o]] = lineDifferentialsRun[this.o][k] / 5 + this.team[this.o].player[runningDetailed[this.o][l]].compositeRating.runningSide - .50;
						firstTimeDefense[this.d][count1[this.o]] = rushRun[this.d][k];
						firstTimeOffense[this.o][count1[this.o]] = runningSide[this.o][l];
						firstTimeBlocking[this.o][count1[this.o]] = blockingRun[this.o][k];
						firstTimeRushing[this.d][count1[this.o]] = rushRun[this.d][k];
						firstTimeType[this.o][count1[this.o]] = 1;

						//// want to give runners - blocker - rusher
						//// right now not giving a rusher, blocker not being displayed later?

						//	console.log("count1[this.o]: "+count1[this.o]+" blockingRun[this.o][k]: "+blockingRun[this.o][k]);
						//	console.log("combo "+firstTimeThrough[this.o][count1[this.o]] );
						//	console.log("compareCovCross[j]: "+compareCovCross[j]+" coverCross[j]: "+coverCross[this.d][j]);
						//			console.log("count1[this.o]: "+count1[this.o]+" diff "+firstTimeThrough[this.o][count1[this.o]]+" def "+firstTimeDefense[this.d][count1[this.o]]+" off "+firstTimeOffense[this.o][count1[this.o]]+" run? "+firstTimeRunning[this.o][count1[this.o]]);
						//		console.log("count1[this.o]: "+count1[this.o]+" diff "+firstTimeThrough[this.o][count1[this.o]]+" def "+firstTimeDefense[this.d][count1[this.o]]+" off "+firstTimeOffense[this.o][count1[this.o]]+" blocker "+firstTimeBlocking[this.o][count1[this.o]]+" rusher "+firstTimeRushing[this.o][count1[this.o]]);
						count1[this.o] += 1;
					}
					if ((k > 1) && (this.team[this.o].player[runningPower[this.o][l]].pos != "QB")) {
						// only if non QB (from 2-on)
						//			console.log(lineDifferentialsRun[this.o][k]+" "+this.team[this.o].player[i].compositeRating.runningPower/5);
						//			console.log("line "+lineDifferentialsRun[this.o][k]/5+" playerP "+ this.team[this.o].player[runningPower[this.o][l]].compositeRating.runningPower+" combo "+(lineDifferentialsRun[this.o][k]/5+this.team[this.o].player[runningPower[this.o][l]].compositeRating.runningPower-.50)+" player pos "+this.team[this.o].player[runningPower[this.o][l]].pos+" player# "+runningPower[this.o][l]);
						firstTimeThrough[this.o][count1[this.o]] = lineDifferentialsRun[this.o][k] / 5 + this.team[this.o].player[runningPower[this.o][l]].compositeRating.runningPower - .50;
						firstTimeDefense[this.d][count1[this.o]] = rushRun[this.d][k];
						firstTimeOffense[this.o][count1[this.o]] = runningPower[this.o][l];
						firstTimeBlocking[this.o][count1[this.o]] = blockingRun[this.o][k];
						firstTimeRushing[this.d][count1[this.o]] = rushRun[this.d][k];
						firstTimeType[this.o][count1[this.o]] = 2;
						//		console.log("count1[this.o]: "+count1[this.o]+" diff "+firstTimeThrough[this.o][count1[this.o]]+" def "+firstTimeDefense[this.d][count1[this.o]]+" off "+firstTimeOffense[this.o][count1[this.o]]+" run? "+firstTimeRunning[this.o][count1[this.o]]);
						//			console.log("count1[this.o]: "+count1[this.o]+" diff "+firstTimeThrough[this.o][count1[this.o]]+" def "+firstTimeDefense[this.d][count1[this.o]]+" off "+firstTimeOffense[this.o][count1[this.o]]+" blocker "+firstTimeBlocking[this.o][count1[this.o]]+" rusher "+firstTimeRushing[this.o][count1[this.o]]);
						count1[this.o] += 1;
					}
					//// too many options, cut to managable size (may want to expand this, lets see if the limit is normally hit)
					if (count1[this.o] > 21) {
						k = skillDiffRunOptions;
						l = runningOptions;
					}

				}

			}
			//	console.log("count1[this.o]"+count1[this.o]);

			/////// makes sure ranking is done correction, correct values and sort

			var
			tempThrough;
			var tempDefense;
			var tempOffense;
			var tempBlocking;
			var tempRushing;
			var tempType;

			var tempRunning;
			/*		for (i = 0; i < (count1[this.o]); i++) {
			console.log("b i "+i+" FTT "+firstTimeThrough[this.o][i]+ " k "+i +" FTTk " +firstTimeThrough[this.o][i]+" pos "+ this.team[this.o].player[firstTimeOffense[this.o][i]].pos );
			}*/
			/////// sort, give odds?
			for ( i = 0; i < (count1[this.o] - 1); i++) {
				//   console.log("FTT "+firstTimeThrough[this.o][i]+ " FTD " +firstTimeDefense[this.d][i]+ " FTO "+firstTimeOffense[this.o][i] +" FTR " +firstTimeRunning[this.o][i]);
				for ( k = (i + 1); k < count1[this.o]; k++) {
					//console.log("b i "+i+" FTT "+firstTimeThrough[this.o][i]+ " k "+k +" FTTk " +firstTimeThrough[this.o][k]);

					if (firstTimeThrough[this.o][k] > firstTimeThrough[this.o][i]) {

						tempThrough = firstTimeThrough[this.o][i];
						tempDefense = firstTimeDefense[this.d][i];
						tempOffense = firstTimeOffense[this.o][i];
						tempBlocking = firstTimeBlocking[this.o][i];
						tempRushing = firstTimeRushing[this.d][i];
						tempType = firstTimeType[this.o][i];

						//		tempRunning = firstTimeRunning[this.o][i];

						firstTimeThrough[this.o][i] = firstTimeThrough[this.o][k];
						firstTimeDefense[this.d][i] = firstTimeDefense[this.d][k];
						firstTimeOffense[this.o][i] = firstTimeOffense[this.o][k];
						firstTimeBlocking[this.o][i] = firstTimeBlocking[this.o][k];
						firstTimeRushing[this.d][i] = firstTimeRushing[this.d][k];
						firstTimeType[this.o][i] = firstTimeType[this.o][k];

						//			firstTimeRunning[this.o][i] = firstTimeRunning[this.o][k];

						firstTimeThrough[this.o][k] = tempThrough;
						firstTimeDefense[this.d][k] = tempDefense;
						firstTimeOffense[this.o][k] = tempOffense;
						firstTimeBlocking[this.o][k] = tempBlocking;
						firstTimeRushing[this.d][k] = tempRushing;
						firstTimeType[this.o][k] = tempType;

						//			firstTimeRunning[this.o][k] = tempRunning;

					}
					//console.log("a i "+i+" FTT "+firstTimeThrough[this.o][i]+ " k "+k +" FTTk " +firstTimeThrough[this.o][k]);

				}
				//    console.log("FTT "+firstTimeThrough[this.o][i]+ " FTD " +firstTimeDefense[this.d][i]+ " FTO "+firstTimeOffense[this.o][i] +" FTR " +firstTimeRunning[this.o][i]);

			}

			////////////////// if defense says 100, then want to use a random pick of defensive players

			for ( i = 0; i < count1[this.o]; i++) {
				//		console.log(" DefPOS "+this.team[this.d].player[1].pos);
				//			tempThrough = firstTimeDefense[this.d][i];
				//			console.log(" DefPOS "+tempThrough);
				//			console.log(" DefPOS "+this.team[this.d].player[tempThrough].pos);
				//	console.log(" DefPOS "+this.team[this.d].player[firstTimeDefense[this.d][i]].pos);
				if (firstTimeDefense[this.d][i] == 100) {
					//			console.log("i: "+i+" diff "+firstTimeThrough[this.o][i]+" def "+firstTimeDefense[this.d][i]+" off "+firstTimeOffense[this.o][i]+" block "+firstTimeBlocking[this.o][i]+" rush "+firstTimeRushing[this.d][i]+" 0type "+firstTimeType[this.o][i]);
					//			console.log(firstTimeOffense[this.o][i]);
					////////////					console.log("i: "+i+" diff "+firstTimeThrough[this.o][i]+" def "+firstTimeDefense[this.d][i]+" off "+firstTimeOffense[this.o][i]+" run? "+firstTimeRunning[this.o][i]+" OffPOS error DefPOS: random");
					//			console.log("i: "+i+" diff "+firstTimeThrough[this.o][i]+" def "+firstTimeDefense[this.d][i]+" off "+firstTimeOffense[this.o][i]+" run? "+firstTimeRunning[this.o][i]+" OffPOS "+this.team[this.o].player[firstTimeOffense[this.o][i]].pos+" DefPOS: random");
				}
				else {
					//			console.log("i: "+i+" diff "+firstTimeThrough[this.o][i]+" def "+firstTimeDefense[this.d][i]+" off "+firstTimeOffense[this.o][i]+" block "+firstTimeBlocking[this.o][i]+" rush "+firstTimeRushing[this.d][i]+" 1type "+firstTimeType[this.o][i]);
					//							console.log("i: "+i+" diff "+firstTimeThrough[this.o][i]+" def "+firstTimeDefense[this.d][i]+" off "+firstTimeOffense[this.o][i]+" run? "+firstTimeRunning[this.o][i]+" OffPOS "+this.team[this.o].player[firstTimeOffense[this.o][i]].pos+" DefPOS "+this.team[this.d].player[firstTimeDefense[this.d][i]].pos+" type "+firstTimeType[this.o][i]);
					//////////////					console.log("i: "+i+" diff "+firstTimeThrough[this.o][i]+" def "+firstTimeDefense[this.d][i]+" off "+firstTimeOffense[this.o][i]+" block "+firstTimeBlocking[this.o][i]+" rush "+firstTimeRushing[this.d][i]+" OffPOS "+this.team[this.o].player[firstTimeOffense[this.o][i]].pos+" DefPOS "+this.team[this.d].player[firstTimeDefense[this.d][i]].pos+" type "+firstTimeType[this.o][i]);
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

			var
			q;

			/*		i = 0;
			while (lineDifferentialsRun[this.o][i] <100) {
			i += 1;
			}
			j = 0;
			while (receivingDifferentialsShort[this.o][j] <100) {
			j += 1;
			}
			q = 0;
			while (receivingDifferentialsCrossing[this.o][q] <100) {
			q += 1;
			}	*/

			//	j = 0;

			//runningOptions
			//this.sortSkill(runningOptions,compareRunPower,runningPower);		// after first two each runner
			//this.sortSkill(runningOptions,compareRunSide,runningSide);		// first two in line/adjust for each runner	 (for QB use this anywhere on line)

			//runningOptions

			//total is i*runningOptions+j
			/*	var secondTimeThrough = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // top 11 plays?
			var secondTimeOffense = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var secondTimeDefense = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var secondTimeBlocking= [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var secondTimeRushing = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var secondTimeType = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is */

			//			var secondTimeRunning = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			//		var count2[this.o] = 0;

			//			for (k = 0; k < (i*runningOption+j); k++) {
			var l, skipped, blockingLanes;

			/////////////////////		console.log("j: "+j);
			skipped = 0;
			count2[this.o] = 0;
			for ( k = 0; k < skillDiffShortOptions; k++) {

				//// allowing TE on short
				if ((this.team[this.o].player[receivingShort[this.o][k]].pos == "RB")) {
					//skipped += 1;
				} else {

					//					secondTimeThrough[this.o][k] = receivingDifferentialsShort[this.o][k];
					//					secondTimeDefense[this.d][k] = coverShort[this.d][k];
					//					secondTimeOffense[this.o][k] = receivingShort[this.o][k];

					secondTimeThrough[this.o][count2[this.o]] = receivingDifferentialsShort[this.o][k] + .5;
					secondTimeDefense[this.d][count2[this.o]] = coverShort[this.d][k];
					secondTimeOffense[this.o][count2[this.o]] = receivingShort[this.o][k];
					//firstTimeBlocking[this.o][count1[this.o]] =blockingPass[this.o][k] ;
					//					firstTimeRushing[this.d][count1[this.o]] = rushPass[this.d][k] ;
					secondTimeBlocking[this.o][count2[this.o]] = blockingPass[this.o][k];
					secondTimeRushing[this.d][count2[this.o]] = rushPass[this.d][k];
					secondTimeType[this.o][count2[this.o]] = 3;
					//					console.log("k: "+k+" diff "+secondTimeThrough[this.o][k]+" def "+secondTimeDefense[this.d][k]+" off "+secondTimeOffense[this.o][k]+" run? "+secondTimeRunning[this.o][k]);
					///////////////////		console.log("k: "+k+"count2[this.o]: "+count2[this.o]+" diff "+secondTimeThrough[this.o][count2[this.o]]+" def "+secondTimeDefense[this.d][count2[this.o]]+" off "+secondTimeOffense[this.o][count2[this.o]]+" run? "+secondTimeRunning[this.o][count2[this.o]]);
					count2[this.o] += 1;
				}

				//	console.log("compareCovCross[j]: "+compareCovCross[j]+" coverCross[j]: "+coverCross[this.d][j]);
			}

			//			console.log("q: "+q);
			//	skipped = 0;
			//	count2[this.o] = 0;
			for ( k = 0; k < skillDiffCrossingOptions; k++) {
				//// crossing
				if ((this.team[this.o].player[receivingCrossing[this.o][k]].pos == "RB") || (this.team[this.o].player[receivingCrossing[this.o][k]].pos == "TE")) {
					//skipped += 1;
				} else {

					//					secondTimeThrough[this.o][k] = receivingDifferentialsShort[this.o][k];
					//					secondTimeDefense[this.d][k] = coverShort[this.d][k];
					//					secondTimeOffense[this.o][k] = receivingShort[this.o][k];

					secondTimeThrough[this.o][count2[this.o]] = receivingDifferentialsCrossing[this.o][k] + .5;
					secondTimeDefense[this.d][count2[this.o]] = coverCross[this.d][k];
					secondTimeOffense[this.o][count2[this.o]] = receivingCrossing[this.o][k];
					secondTimeBlocking[this.o][count2[this.o]] = blockingPass[this.o][k];
					secondTimeRushing[this.d][count2[this.o]] = rushPass[this.d][k];
					//					secondTimeBlocking[this.o][count2[this.o]] = 100;
					//					secondTimeRushing[this.d][count2[this.o]] = 100;
					secondTimeType[this.o][count2[this.o]] = 4;
					//					console.log("k: "+k+" diff "+secondTimeThrough[this.o][k]+" def "+secondTimeDefense[this.d][k]+" off "+secondTimeOffense[this.o][k]+" run? "+secondTimeRunning[this.o][k]);
					////////////////////		console.log("k: "+k+"count2[this.o]: "+count2[this.o]+" diff "+secondTimeThrough[this.o][count2[this.o]]+" def "+secondTimeDefense[this.d][count2[this.o]]+" off "+secondTimeOffense[this.o][count2[this.o]]+" run? "+secondTimeRunning[this.o][count2[this.o]]);
					count2[this.o] += 1;
				}
			}

			/*compareRunPower[j] = this.team[this.o].player[i].compositeRating.runningPower;
			compareRunSide[j] = this.team[this.o].player[i].compositeRating.runningSide;	*/

			//count2[this.o] = j-skipped;
			//////////////////	console.log("count2[this.o]: "+count2[this.o]);

			// no rushing second time (QB is third time) (only edge rushing, nothing down the middle)
			for ( l = 0; l < runningOptions; l++) {

				for ( k = 0; k < skillDiffRunOptions; k++) {

					// if non QB, only first two 0-1
					// if QB all
					if ((k < 2) && (this.team[this.o].player[runningSide[this.o][l]].pos == "QB")) {
						////////////////////			console.log("line "+lineDifferentialsRun[this.o][k]/5+" playerS "+ this.team[this.o].player[l].compositeRating.runningSide+" combo "+(lineDifferentialsRun[this.o][k]/5+this.team[this.o].player[l].compositeRating.runningSide-.50)+" player pos "+this.team[this.o].player[l].pos);
						secondTimeThrough[this.o][count2[this.o]] = lineDifferentialsRun[this.o][k] / 5 + this.team[this.o].player[runningDetailed[this.o][l]].compositeRating.runningSide - .50;
						secondTimeDefense[this.d][count2[this.o]] = rushRun[this.d][k];
						secondTimeOffense[this.o][count2[this.o]] = runningSide[this.o][l];
						secondTimeBlocking[this.o][count2[this.o]] = blockingRun[this.o][k];
						secondTimeRushing[this.d][count2[this.o]] = rushRun[this.d][k];
						secondTimeType[this.o][count2[this.o]] = 1;

						//		secondTimeRunning[this.o][count2[this.o]] = blockingRun[this.o][k];

						//	console.log("combo "+secondTimeThrough[this.o][count2[this.o]] );
						//	console.log("compareCovCross[j]: "+compareCovCross[j]+" coverCross[j]: "+coverCross[this.d][j]);
						//			console.log("count2[this.o]: "+count2[this.o]+" diff "+secondTimeThrough[this.o][count2[this.o]]+" def "+secondTimeDefense[this.d][count2[this.o]]+" off "+secondTimeOffense[this.o][count2[this.o]]+" run? "+secondTimeRunning[this.o][count2[this.o]]);
						count2[this.o] += 1;
					}
					/*if ((k>1) && (this.team[this.o].player[l].pos != "QB") ) {
					// only if non QB (from 2-on)
					//			console.log(lineDifferentialsRun[this.o][k]+" "+this.team[this.o].player[i].compositeRating.runningPower/5);
					console.log("line "+lineDifferentialsRun[this.o][k]/5+" playerP "+ this.team[this.o].player[l].compositeRating.runningPower+" combo "+(lineDifferentialsRun[this.o][k]/5+this.team[this.o].player[l].compositeRating.runningPower-.50)+" player pos "+this.team[this.o].player[l].pos);
					secondTimeThrough[this.o][count2[this.o]] = lineDifferentialsRun[this.o][k]/5+this.team[this.o].player[l].compositeRating.runningPower-.50;
					secondTimeDefense[this.d][count2[this.o]] = rushRun[this.d][k];
					secondTimeOffense[this.o][count2[this.o]] = runningPower[this.o][l];
					secondTimeRunning[this.o][count2[this.o]] = blockingRun[this.o][k];
					//		console.log("count2[this.o]: "+count2[this.o]+" diff "+secondTimeThrough[this.o][count2[this.o]]+" def "+secondTimeDefense[this.d][count2[this.o]]+" off "+secondTimeOffense[this.o][count2[this.o]]+" run? "+secondTimeRunning[this.o][count2[this.o]]);
					count2[this.o] += 1;
					}*/
					//// too many options, cut to managable size (may want to expand this, lets see if the limit is normally hit)
					if (count2[this.o] > 21) {
						k = blockingOptions;
						l = runningOptions;
					}

				}

			}
			////////////////	console.log("count2[this.o]"+count2[this.o]);

			/////// makes sure ranking is done correction, correct values and sort

			var
			tempThrough;
			var tempDefense;
			var tempOffense;
			var tempRunning;
			var tempType;

			for ( i = 0; i < (count2[this.o]); i++) {
				/////////////////////   console.log("b i "+i+" FTT "+secondTimeThrough[this.o][i]+ " k "+i +" FTTk " +secondTimeThrough[this.o][i]);
			}
			/////// sort, give odds?
			for ( i = 0; i < (count2[this.o] - 1); i++) {
				//   console.log("FTT "+secondTimeThrough[this.o][i]+ " FTD " +secondTimeDefense[this.d][i]+ " FTO "+secondTimeOffense[this.o][i] +" FTR " +secondTimeRunning[this.o][i]);
				for ( k = (i + 1); k < count2[this.o]; k++) {
					//console.log("b i "+i+" FTT "+secondTimeThrough[this.o][i]+ " k "+k +" FTTk " +secondTimeThrough[this.o][k]);

					if (secondTimeThrough[this.o][k] > secondTimeThrough[this.o][i]) {

						tempThrough = secondTimeThrough[this.o][i];
						tempDefense = secondTimeDefense[this.d][i];
						tempOffense = secondTimeOffense[this.o][i];
						tempBlocking = secondTimeBlocking[this.o][i];
						tempRushing = secondTimeRushing[this.d][i];
						tempType = secondTimeType[this.o][i];
						//			tempRunning = secondTimeRunning[this.o][i];

						secondTimeThrough[this.o][i] = secondTimeThrough[this.o][k];
						secondTimeDefense[this.d][i] = secondTimeDefense[this.d][k];
						secondTimeOffense[this.o][i] = secondTimeOffense[this.o][k];
						secondTimeBlocking[this.o][i] = secondTimeBlocking[this.o][k];
						secondTimeRushing[this.d][i] = secondTimeRushing[this.d][k];
						secondTimeType[this.o][i] = secondTimeType[this.o][k];
						//			secondTimeRunning[this.o][i] = secondTimeRunning[this.o][k];

						secondTimeThrough[this.o][k] = tempThrough;
						secondTimeDefense[this.d][k] = tempDefense;
						secondTimeOffense[this.o][k] = tempOffense;
						secondTimeBlocking[this.o][k] = tempBlocking;
						secondTimeRushing[this.d][k] = tempRushing;
						secondTimeType[this.o][k] = tempType;
						//		secondTimeRunning[this.o][k] = tempRunning;

					}
					//console.log("a i "+i+" FTT "+secondTimeThrough[this.o][i]+ " k "+k +" FTTk " +secondTimeThrough[this.o][k]);

				}
				//    console.log("FTT "+secondTimeThrough[this.o][i]+ " FTD " +secondTimeDefense[this.d][i]+ " FTO "+secondTimeOffense[this.o][i] +" FTR " +secondTimeRunning[this.o][i]);

			}

			////////////////// if defense says 100, then want to use a random pick of defensive players

			for ( i = 0; i < count2[this.o]; i++) {
				//		console.log(" DefPOS "+this.team[this.d].player[1].pos);
				//			tempThrough = secondTimeDefense[this.d][i];
				//			console.log(" DefPOS "+tempThrough);
				//			console.log(" DefPOS "+this.team[this.d].player[tempThrough].pos);
				//	console.log(" DefPOS "+this.team[this.d].player[secondTimeDefense[this.d][i]].pos);
				if (secondTimeDefense[this.d][i] == 100) {
					//							console.log("i: "+i+" diff "+secondTimeThrough[this.o][i]+" def "+secondTimeDefense[this.d][i]+" off "+secondTimeOffense[this.o][i]+" run? "+secondTimeRunning[this.o][i]);
					//			console.log(secondTimeOffense[this.o][i]);
					///////////////			console.log("i: "+i+" diff "+secondTimeThrough[this.o][i]+" def "+secondTimeDefense[this.d][i]+" off "+secondTimeOffense[this.o][i]+" run? "+secondTimeRunning[this.o][i]+" OffPOS error DefPOS: random");
					//					console.log("i: "+i+" diff "+secondTimeThrough[this.o][i]+" def "+secondTimeDefense[this.d][i]+" off "+secondTimeOffense[this.o][i]+" run? "+secondTimeRunning[this.o][i]+" OffPOS error DefPOS: random");
					//			console.log("i: "+i+" diff "+secondTimeThrough[this.o][i]+" def "+secondTimeDefense[this.d][i]+" off "+secondTimeOffense[this.o][i]+" run? "+secondTimeRunning[this.o][i]+" OffPOS "+this.team[this.o].player[secondTimeOffense[this.o][i]].pos+" DefPOS: random");
				}
				else {
					//							console.log("i: "+i+" diff "+secondTimeThrough[this.o][i]+" def "+secondTimeDefense[this.d][i]+" off "+secondTimeOffense[this.o][i]+" run? "+secondTimeRunning[this.o][i]+" OffPOS "+this.team[this.o].player[secondTimeOffense[this.o][i]].pos+" DefPOS "+this.team[this.d].player[secondTimeDefense[this.d][i]].pos+" Type "+secondTimeType[this.o][i]);
					///		console.log("i: "+i+" diff "+secondTimeThrough[this.o][i]+" def "+secondTimeDefense[this.d][i]+" off "+secondTimeOffense[this.o][i]+" block "+secondTimeBlocking[this.o][i]+" rush "+secondTimeRushing[this.d][i]+" OffPOS "+this.team[this.o].player[secondTimeOffense[this.o][i]].pos+" DefPOS "+this.team[this.d].player[secondTimeDefense[this.d][i]].pos+" Type "+secondTimeType[this.o][i]);
				}
			}
			/////	console.log("end team second time");

			//Third time through (RB short, TE short crossing, WR all) (opens up QB run)
			// can repeat third until pass, sack, or QB run

			//Third time through (no room for deep)

			//// create list  receive-short, just receivers, runners can run (3 and 1, this will be weighted higher, quick throw)
			////////////////////

			var
			q;

			/*		i = 0;
			while (lineDifferentialsRun[this.o][i] <100) {
			i += 1;
			}
			j = 0;
			while (receivingDifferentialsShort[this.o][j] <100) {
			j += 1;
			}
			q = 0;
			while (receivingDifferentialsCrossing[this.o][q] <100) {
			q += 1;
			}	*/

			//	j = 0;

			//runningOptions
			//this.sortSkill(runningOptions,compareRunPower,runningPower);		// after first two each runner
			//this.sortSkill(runningOptions,compareRunSide,runningSide);		// first two in line/adjust for each runner	 (for QB use this anywhere on line)

			//runningOptions

			//total is i*runningOptions+j

			/*	var thirdTimeThrough = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // top 11 plays?
			var thirdTimeOffense = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var thirdTimeDefense = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var thirdTimeBlocking= [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var thirdTimeRushing = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			var thirdTimeType = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is */

			//		var thirdTimeRunning = [[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]] ; // who player is
			//		var count3[this.o] = 0;

			//			for (k = 0; k < (i*runningOption+j); k++) {
			var l, skipped, blockingLanes;

			/////////////////////		console.log("j: "+j);
			skipped = 0;
			count3[this.o] = 0;
			for ( k = 0; k < skillDiffShortOptions; k++) {

				//					thirdTimeThrough[this.o][k] = receivingDifferentialsShort[this.o][k];
				//					thirdTimeDefense[this.d][k] = coverShort[this.d][k];
				//					thirdTimeOffense[this.o][k] = receivingShort[this.o][k];

				thirdTimeThrough[this.o][count3[this.o]] = receivingDifferentialsShort[this.o][k] + .5;
				thirdTimeDefense[this.d][count3[this.o]] = coverShort[this.d][k];
				thirdTimeOffense[this.o][count3[this.o]] = receivingShort[this.o][k];
				thirdTimeBlocking[this.o][count3[this.o]] = blockingPass[this.o][k];
				thirdTimeRushing[this.d][count3[this.o]] = rushPass[this.d][k];

				//thirdTimeBlocking[this.o][count3[this.o]] = 100;
				//thirdTimeRushing[this.d][count3[this.o]] = 100;
				thirdTimeType[this.o][count3[this.o]] = 3;
				//					console.log("k: "+k+" diff "+thirdTimeThrough[this.o][k]+" def "+thirdTimeDefense[this.d][k]+" off "+thirdTimeOffense[this.o][k]+" run? "+thirdTimeRunning[this.o][k]);
				///////////////////		console.log("k: "+k+"count3[this.o]: "+count3[this.o]+" diff "+thirdTimeThrough[this.o][count3[this.o]]+" def "+thirdTimeDefense[this.d][count3[this.o]]+" off "+thirdTimeOffense[this.o][count3[this.o]]+" run? "+thirdTimeRunning[this.o][count3[this.o]]);
				count3[this.o] += 1;

				//	console.log("compareCovCross[j]: "+compareCovCross[j]+" coverCross[j]: "+coverCross[this.d][j]);
			}

			//			console.log("q: "+q);
			//	skipped = 0;
			//	count3[this.o] = 0;
			for ( k = 0; k < skillDiffCrossingOptions; k++) {
				//// crossing
				if ((this.team[this.o].player[receivingCrossing[this.o][k]].pos == "RB")) {
					//skipped += 1;
				} else {

					//					thirdTimeThrough[this.o][k] = receivingDifferentialsShort[this.o][k];
					//					thirdTimeDefense[this.d][k] = coverShort[this.d][k];
					//					thirdTimeOffense[this.o][k] = receivingShort[this.o][k];

					thirdTimeThrough[this.o][count3[this.o]] = receivingDifferentialsCrossing[this.o][k] + .5;
					thirdTimeDefense[this.d][count3[this.o]] = coverCross[this.d][k];
					thirdTimeOffense[this.o][count3[this.o]] = receivingCrossing[this.o][k];
					thirdTimeBlocking[this.o][count3[this.o]] = blockingPass[this.o][k];
					thirdTimeRushing[this.d][count3[this.o]] = rushPass[this.d][k];

					//					thirdTimeBlocking[this.o][count3[this.o]] = 100;
					//					thirdTimeRushing[this.d][count3[this.o]] = 100;
					thirdTimeType[this.o][count3[this.o]] = 4;
					//					console.log("k: "+k+" diff "+thirdTimeThrough[this.o][k]+" def "+thirdTimeDefense[this.d][k]+" off "+thirdTimeOffense[this.o][k]+" run? "+thirdTimeRunning[this.o][k]);
					////////////////////		console.log("k: "+k+"count3[this.o]: "+count3[this.o]+" diff "+thirdTimeThrough[this.o][count3[this.o]]+" def "+thirdTimeDefense[this.d][count3[this.o]]+" off "+thirdTimeOffense[this.o][count3[this.o]]+" run? "+thirdTimeRunning[this.o][count3[this.o]]);
					count3[this.o] += 1;
				}
			}

			//			console.log("q: "+q);
			//	skipped = 0;
			//	count3[this.o] = 0;
			for ( k = 0; k < skillDiffLongOptions; k++) {
				//// crossing
				if ((this.team[this.o].player[receivingLong[this.o][k]].pos == "RB") || (this.team[this.o].player[receivingLong[this.o][k]].pos == "TE")) {
					//skipped += 1;
				} else {

					//					thirdTimeThrough[this.o][k] = receivingDifferentialsShort[this.o][k];
					//					thirdTimeDefense[this.d][k] = coverShort[this.d][k];
					//					thirdTimeOffense[this.o][k] = receivingShort[this.o][k];

					thirdTimeThrough[this.o][count3[this.o]] = receivingDifferentialsLong[this.o][k] + .5;
					thirdTimeDefense[this.d][count3[this.o]] = coverLong[this.d][k];
					thirdTimeOffense[this.o][count3[this.o]] = receivingLong[this.o][k];
					thirdTimeBlocking[this.o][count3[this.o]] = blockingPass[this.o][k];
					thirdTimeRushing[this.d][count3[this.o]] = rushPass[this.d][k];

					//thirdTimeBlocking[this.o][count3[this.o]] = 100;
					//thirdTimeRushing[this.d][count3[this.o]] = 100;
					thirdTimeType[this.o][count3[this.o]] = 5;
					//					console.log("k: "+k+" diff "+thirdTimeThrough[this.o][k]+" def "+thirdTimeDefense[this.d][k]+" off "+thirdTimeOffense[this.o][k]+" run? "+thirdTimeRunning[this.o][k]);
					////////////////////		console.log("k: "+k+"count3[this.o]: "+count3[this.o]+" diff "+thirdTimeThrough[this.o][count3[this.o]]+" def "+thirdTimeDefense[this.d][count3[this.o]]+" off "+thirdTimeOffense[this.o][count3[this.o]]+" run? "+thirdTimeRunning[this.o][count3[this.o]]);
					count3[this.o] += 1;
				}
			}

			/*compareRunPower[j] = this.team[this.o].player[i].compositeRating.runningPower;
			compareRunSide[j] = this.team[this.o].player[i].compositeRating.runningSide;	*/

			//count3[this.o] = j-skipped;
			//////////////////	console.log("count3[this.o]: "+count3[this.o]);

			// no rushing third time (QB is third time) (only edge rushing, nothing down the middle)
			for ( l = 0; l < runningOptions; l++) {

				for ( k = 0; k < skillDiffRunOptions; k++) {

					// if non QB, only first two 0-1
					// if QB all
					if ((k < 2) && (this.team[this.o].player[runningSide[this.o][l]].pos == "QB")) {
						////////////////////			console.log("line "+lineDifferentialsRun[this.o][k]/5+" playerS "+ this.team[this.o].player[l].compositeRating.runningSide+" combo "+(lineDifferentialsRun[this.o][k]/5+this.team[this.o].player[l].compositeRating.runningSide-.50)+" player pos "+this.team[this.o].player[l].pos);
						thirdTimeThrough[this.o][count3[this.o]] = lineDifferentialsRun[this.o][k] / 5 + this.team[this.o].player[runningDetailed[this.o][l]].compositeRating.runningSide - .50;
						thirdTimeDefense[this.d][count3[this.o]] = rushRun[this.d][k];
						thirdTimeOffense[this.o][count3[this.o]] = runningSide[this.o][l];
						thirdTimeBlocking[this.o][count3[this.o]] = blockingRun[this.o][k];
						thirdTimeRushing[this.d][count3[this.o]] = rushRun[this.d][k];
						thirdTimeType[this.o][count3[this.o]] = 1;

						//	thirdTimeRunning[this.o][count3[this.o]] = blockingRun[this.o][k];

						//	console.log("combo "+thirdTimeThrough[this.o][count3[this.o]] );
						//	console.log("compareCovCross[j]: "+compareCovCross[j]+" coverCross[j]: "+coverCross[this.d][j]);
						//			console.log("count3[this.o]: "+count3[this.o]+" diff "+thirdTimeThrough[this.o][count3[this.o]]+" def "+thirdTimeDefense[this.d][count3[this.o]]+" off "+thirdTimeOffense[this.o][count3[this.o]]+" run? "+thirdTimeRunning[this.o][count3[this.o]]);
						count3[this.o] += 1;
					}
					/*if ((k>1) && (this.team[this.o].player[l].pos != "QB") ) {
					// only if non QB (from 2-on)
					//			console.log(lineDifferentialsRun[this.o][k]+" "+this.team[this.o].player[i].compositeRating.runningPower/5);
					console.log("line "+lineDifferentialsRun[this.o][k]/5+" playerP "+ this.team[this.o].player[l].compositeRating.runningPower+" combo "+(lineDifferentialsRun[this.o][k]/5+this.team[this.o].player[l].compositeRating.runningPower-.50)+" player pos "+this.team[this.o].player[l].pos);
					thirdTimeThrough[this.o][count3[this.o]] = lineDifferentialsRun[this.o][k]/5+this.team[this.o].player[l].compositeRating.runningPower-.50;
					thirdTimeDefense[this.d][count3[this.o]] = rushRun[this.d][k];
					thirdTimeOffense[this.o][count3[this.o]] = runningPower[this.o][l];
					thirdTimeRunning[this.o][count3[this.o]] = blockingRun[this.o][k];
					//		console.log("count3[this.o]: "+count3[this.o]+" diff "+thirdTimeThrough[this.o][count3[this.o]]+" def "+thirdTimeDefense[this.d][count3[this.o]]+" off "+thirdTimeOffense[this.o][count3[this.o]]+" run? "+thirdTimeRunning[this.o][count3[this.o]]);
					count3[this.o] += 1;
					}*/
					//// too many options, cut to managable size (may want to expand this, lets see if the limit is normally hit)
					if (count3[this.o] > 21) {
						k = blockingOptions;
						l = runningOptions;
					}

				}

			}
			////////////////	console.log("count3[this.o]"+count3[this.o]);

			/////// makes sure ranking is done correction, correct values and sort

			var
			tempThrough;
			var tempDefense;
			var tempOffense;
			var tempRunning;
			var tempType;

			for ( i = 0; i < (count3[this.o]); i++) {
				/////////////////////   console.log("b i "+i+" FTT "+thirdTimeThrough[this.o][i]+ " k "+i +" FTTk " +thirdTimeThrough[this.o][i]);
			}
			/////// sort, give odds?
			for ( i = 0; i < (count3[this.o] - 1); i++) {
				//   console.log("FTT "+thirdTimeThrough[this.o][i]+ " FTD " +thirdTimeDefense[this.d][i]+ " FTO "+thirdTimeOffense[this.o][i] +" FTR " +thirdTimeRunning[this.o][i]);
				for ( k = (i + 1); k < count3[this.o]; k++) {
					//console.log("b i "+i+" FTT "+thirdTimeThrough[this.o][i]+ " k "+k +" FTTk " +thirdTimeThrough[this.o][k]);

					if (thirdTimeThrough[this.o][k] > thirdTimeThrough[this.o][i]) {

						tempThrough = thirdTimeThrough[this.o][i];
						tempDefense = thirdTimeDefense[this.d][i];
						tempOffense = thirdTimeOffense[this.o][i];
						tempBlocking = thirdTimeBlocking[this.o][i];
						tempRushing = thirdTimeRushing[this.d][i];
						tempType = thirdTimeType[this.o][i];
						//		tempRunning = thirdTimeRunning[this.o][i];

						thirdTimeThrough[this.o][i] = thirdTimeThrough[this.o][k];
						thirdTimeDefense[this.d][i] = thirdTimeDefense[this.d][k];
						thirdTimeOffense[this.o][i] = thirdTimeOffense[this.o][k];
						thirdTimeBlocking[this.o][i] = thirdTimeBlocking[this.o][k];
						thirdTimeRushing[this.d][i] = thirdTimeRushing[this.d][k];
						thirdTimeType[this.o][i] = thirdTimeType[this.o][k];
						//		thirdTimeRunning[this.o][i] = thirdTimeRunning[this.o][k];

						thirdTimeThrough[this.o][k] = tempThrough;
						thirdTimeDefense[this.d][k] = tempDefense;
						thirdTimeOffense[this.o][k] = tempOffense;
						thirdTimeBlocking[this.o][k] = tempBlocking;
						thirdTimeRushing[this.d][k] = tempRushing;
						thirdTimeType[this.o][k] = tempType;
						//		thirdTimeRunning[this.o][k] = tempRunning;

					}
					//console.log("a i "+i+" FTT "+thirdTimeThrough[this.o][i]+ " k "+k +" FTTk " +thirdTimeThrough[this.o][k]);

				}
				//    console.log("FTT "+thirdTimeThrough[this.o][i]+ " FTD " +thirdTimeDefense[this.d][i]+ " FTO "+thirdTimeOffense[this.o][i] +" FTR " +thirdTimeRunning[this.o][i]);

			}

			////////////////// if defense says 100, then want to use a random pick of defensive players

			for ( i = 0; i < count3[this.o]; i++) {
				//		console.log(" DefPOS "+this.team[this.d].player[1].pos);
				//			tempThrough = thirdTimeDefense[this.d][i];
				//			console.log(" DefPOS "+tempThrough);
				//			console.log(" DefPOS "+this.team[this.d].player[tempThrough].pos);
				//	console.log(" DefPOS "+this.team[this.d].player[thirdTimeDefense[this.d][i]].pos);
				if (thirdTimeDefense[this.d][i] == 100) {
					//							console.log("i: "+i+" diff "+thirdTimeThrough[this.o][i]+" def "+thirdTimeDefense[this.d][i]+" off "+thirdTimeOffense[this.o][i]+" run? "+thirdTimeRunning[this.o][i]);
					//			console.log(thirdTimeOffense[this.o][i]);
					///////////////			console.log("i: "+i+" diff "+thirdTimeThrough[this.o][i]+" def "+thirdTimeDefense[this.d][i]+" off "+thirdTimeOffense[this.o][i]+" run? "+thirdTimeRunning[this.o][i]+" OffPOS error DefPOS: random");
					/////				console.log("i: "+i+" diff "+thirdTimeThrough[this.o][i]+" def "+thirdTimeDefense[this.d][i]+" off "+thirdTimeOffense[this.o][i]+" run? "+thirdTimeRunning[this.o][i]+" OffPOS error DefPOS: random");
					//			console.log("i: "+i+" diff "+thirdTimeThrough[this.o][i]+" def "+thirdTimeDefense[this.d][i]+" off "+thirdTimeOffense[this.o][i]+" run? "+thirdTimeRunning[this.o][i]+" OffPOS "+this.team[this.o].player[thirdTimeOffense[this.o][i]].pos+" DefPOS: random");
				}
				else {
					/////				console.log("i: "+i+" diff "+thirdTimeThrough[this.o][i]+" def "+thirdTimeDefense[this.d][i]+" off "+thirdTimeOffense[this.o][i]+" block "+thirdTimeBlocking[this.o][i]+" rush "+thirdTimeRushing[this.d][i]+" OffPOS "+this.team[this.o].player[thirdTimeOffense[this.o][i]].pos+" DefPOS "+this.team[this.d].player[thirdTimeDefense[this.d][i]].pos+" Type "+thirdTimeType[this.o][i]);
				}
			}
			////	console.log("end team third time");

			////					console.log("1count1[this.o]: "+count1[this.o]);
			///				console.log("count2[this.o]: "+count2[this.o]);
			////				console.log("count3[this.o]: "+count3[this.o]);

			////////////// rank matchups from offense point of view

			/////// once this is done can start actually doing downs, and run the game (hopefully happens quickly)
			/////// need to balance run/pass

			/////// after catch, and tackling big issue

			//////////////

		}

		///// then matchups, with #player adjustments (calc odds of pass or run play called) (those odds also influenced by downs, yardage, field position, and score)
		/*	console.log("math.random(): "+ Math.random());
		console.log("math.random(): "+ Math.random());
		console.log("math.random(): "+ Math.random());
		console.log("math.random(): "+ Math.random());*/

		var
		driveActive, toFirst, yardsOnPlay, playProb, yardsProb;
		var timeThroughProb;

		var playType;
		var timeThrough;
		var playerOfType;
		var p;
		var fieldGoal, kickPunt;
		var probMakeFieldGoal;
		var rawFieldPosition;
		var finalFieldPosition;
		var touchback;
		var passOrSack;

		passOrSack = 0;
		//////////// universal?
		driveActive = 1;
		//	fieldPosition = 20;
		toFirst = 10;
		yardsOnPlay = 0;
		touchback = 0;
		//  	var driveNumber = [0,0];
		//// only print out driveNumber[this.o] < 2;, too much data otherwise

		////////////	console.log("driveActive: " +driveActive+" fieldPosition: "+fieldPosition+" toFirst: "+toFirst);
		/*	if (driveNumber[this.o] == 0) {
		console.log("this.o "+this.o);
		console.log("0driveNumber[this.o]: "+driveNumber[this.o]);
		console.log("2count1[this.o]: "+count1[this.o]);
		console.log("count2[this.o]: "+count2[this.o]);
		console.log("count3[this.o]: "+count3[this.o]);
		}
		if (driveNumber[this.o] == 1) {
		console.log("this.o "+this.o);
		console.log("1driveNumber[this.o]: "+driveNumber[this.o]);
		console.log("2count1[this.o]: "+count1[this.o]);
		console.log("count2[this.o]: "+count2[this.o]);
		console.log("count3[this.o]: "+count3[this.o]);
		}		*/

		//rawFieldPosition = random.randInt(1, 80)*this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.punting;
		///////		console.log("rawFieldPosition: "+rawFieldPosition);
		//		finalFieldPosition = Math.round(rawFieldPosition);
		//	fieldPosition += finalFieldPosition;

		if ((driveNumber[this.o] + driveNumber[this.d]) == 0) {
			fieldPosition = 20;
		}

		//    console.log("drive numbero: "+driveNumber[this.o]+" drive numberd: "+driveNumber[this.d]+" fieldPosition: "+fieldPosition);
		//       console.log("drive number: "+(driveNumber[this.o]+driveNumber[this.d])+" fieldPosition: "+fieldPosition);
		//		  if (((fieldPosition >= 100) || (fieldPosition <= 0)) || ( (driveNumber[this.o]+driveNumber[this.d]) == 0)) {
		if (fromPunt == 1) {
			fieldPosition *= -1;
			fieldPosition += 100;
			fromPunt = 0;
		} else {

			if ((fieldPosition >= 100) || (fieldPosition <= 0) || ((driveNumber[this.o] + driveNumber[this.d]) == 0)) {

				rawFieldPosition = random.randInt(20, 200) * this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.kickOff;
				//		 console.log("rawFieldPosition: "+rawFieldPosition);
				///////		console.log("rawFieldPosition: "+rawFieldPosition);
				finalFieldPosition = Math.round(rawFieldPosition);
				// console.log(finalFieldPosition+" 1 "+fieldPosition);
				fieldPosition = 65;
				//	 console.log(finalFieldPosition+" 2 "+fieldPosition);
				fieldPosition -= finalFieldPosition;
				//	 console.log(finalFieldPosition+" 3 "+fieldPosition);
				if (fieldPosition <= 0) {
					fieldPosition = 20;
					touchback = 1;
				} else {

				}
				if (touchback == 0) {
					//				p= this.playersOnCourt[this.o][22];
					p = this.playersOnCourt[this.d][22];
					playDown = 1;
					toFirst = 10;
					//				this.recordPlay("kickoff", this.o, [this.team[this.o].player[p].name],finalFieldPosition,playDown,toFirst,fieldPosition);
					this.recordPlay("kickoff", this.o, [this.team[this.d].player[p].name], finalFieldPosition, playDown, toFirst, fieldPosition);
					this.t -= Math.random() / 4 + (1 - yardsOnPlay / 100);

				} else {
					//				p= this.playersOnCourt[this.o][22];
					p = this.playersOnCourt[this.d][22];
					playDown = 1;
					toFirst = 10;
					touchback = 0;
					//			   this.recordPlay("kickoffTouch", this.o, [this.team[this.o].player[p].name],finalFieldPosition,playDown,toFirst,fieldPosition);
					this.recordPlay("kickoffTouch", this.o, [this.team[this.d].player[p].name], finalFieldPosition, playDown, toFirst, fieldPosition);
					this.t -= Math.random() / 10 + (1 - yardsOnPlay / 100);

				}
				//fieldPosition = 20;
			} else {
				fieldPosition *= -1;
				fieldPosition += 100;
			}
		}
		//	}
		///////////// why do we need this?

		//   console.log("got here2");
		driveNumber[this.o] += 1;

		p = this.playersOnCourt[this.o][22];
		playDown = 1;
		toFirst = 10;

		/*		if (driveNumber[this.o] < 3) {
		console.log("START0 this.o "+this.o);
		console.log("driveNumber[this.o]: "+driveNumber[this.o]);
		console.log("2count1[this.o]: "+count1[this.o]);
		console.log("count2[this.o]: "+count2[this.o]);
		console.log("count3[this.o]: "+count3[this.o]);
		//			console.log("firstTimeThrough[this.o][1]: "+firstTimeThrough[0][1]);
		//			console.log("firstTimeThrough[this.o][1]: "+firstTimeThrough[1][1]);
		console.log("firstTimeThrough[this.o][1]: "+firstTimeThrough[this.o][1]);
		console.log("secondTimeThrough[this.o][1]: "+secondTimeThrough[this.o][1]);
		console.log("thirdTimeThrough[this.o][1]: "+thirdTimeThrough[this.o][1]);
		console.log("firstTimeThrough[this.o][0]: "+firstTimeThrough[this.o][0]);
		console.log("secondTimeThrough[this.o][0]: "+secondTimeThrough[this.o][0]);
		console.log("thirdTimeThrough[this.o][0]: "+thirdTimeThrough[this.o][0]);
		}*/

		//// gets hung up using global variables?

		//	console.log("driveNumber[0]: "+driveNumber[0]);
		//	console.log("driveNumber[1]: "+driveNumber[1]);
		var
		playPicked;
		var timeType;
		var quarterActive;
		var thirdDown;
		var newDrive;
		var redZone;
		var timePlay;
		var interception, fumble;
		var puntLength;
		var rushSum;
		var sackPlayer;
		var gaveUpSack;
		var sackProb;
		var runStuffSum;
		var coverSum;
		var fatigue;

		sackPlayer = 100;
		gaveUpSack = 100;
		sackProb = 0;
		if (this.t > 45) {
			quarterActive = 1;
		} else if (this.t > 30) {
			quarterActive = 2;
		} else if (this.t > 15) {
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

			//////////	console.log("playDown: " +playDown);

			while (playDown < 5) {

				if ((fieldPosition >= 80) && (redZone == 0)) {
					redZone = 1;
					this.recordStat(this.o, this.playersOnCourt[this.o][0], "rza");
				}
				if ((newDrive == 1) && (playDown == 1)) {
					//		console.log("2 first down: "+playType);
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

					for ( i = 0; i < 11; i++) {
						this.recordStat(this.o, this.playersOnCourt[this.o][i], "olc");
						this.recordStat(this.d, this.playersOnCourt[this.d][i + 11], "dec");
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
				yardsProb = Math.random();
				yardsProb *= 1 + (1 - yardsProb) / 10;

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
				//			this.recordPlay("down", this.o, this.playersOnCourt[this.o][22],toFirst,playDown);

				if ((playDown == 4) && (fieldPosition > 55) || ((fieldPosition > 50) && (this.t >= 30) && (this.t <= 30.25) ) || ((this.t <= 0.25) && (this.team[this.o].stat.pts <= this.team[this.d].stat.pts) && (this.team[this.o].stat.pts + 3 >= this.team[this.d].stat.pts) && (fieldPosition > 40) )) {

					if ((this.t >= 30) && (this.t <= 30.25)) {
						this.t = 30;
					}
					if ((this.t < .25)) {
						this.t = 0;
					}

					//			console.log("this.playersOnCourt[this.o][22]: "+this.playersOnCourt[this.o][22]);
					//			console.log("this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal: "+this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal);
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
					if ((Math.random() * Math.random() * Math.random()) < (fieldPosition / 100 * fieldPosition / 100 * fieldPosition / 100 * this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal)) {

						//						this.recordStat(this.o, 22, "pts",3);
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "pts", 3);
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fgAtRim");
						p = this.playersOnCourt[this.o][22];
						this.recordPlay("fg", this.o, [this.team[this.o].player[p].name], 110 - fieldPosition);
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
						//p= thirdTimeOffense[this.o][playerOfType];
						//		this.recordPlay("pts", this.o, [this.team[this.o].player[22].name]);
						fieldGoal = 1;

						fieldPosition = 110;
					} else {
						p = this.playersOnCourt[this.o][22];
						playDown = 1;
						toFirst = 10;
						this.recordPlay("fgm", this.d, [this.team[this.o].player[p].name], 110 - fieldPosition, playDown, toFirst, 100 - fieldPosition);
						//						this.recordPlay("punt", this.d, [this.team[this.o].player[p].name],finalFieldPosition,playDown,toFirst,100-fieldPosition);
						//						this.recordPlay("fgm", this.o, [this.team[this.o].player[p].name],fieldPosition);
						fieldGoal = 1;

					}
					/////////////			console.log("fieldGoal"+fieldGoal);
				}
				else if ((playDown == 4) && (((this.t >= 2) && ((this.t >= 30.25) || (this.t <= 30))) || (this.team[this.o].stat.pts > this.team[this.d].stat.pts))) {

					//// punting skill
					////this.team[this.o].player[blockingRun[this.o][j]].compositeRating[blockRun]
					////////////////this.team[this.o].player[blockingRun[this.o][j]].compositeRating.punting;

					// put in punting stats to determine length
					// use back LB stats?
					//					fieldPosition += Math.round(random.randInt(1, 80)*this.team[this.o].player[this.playersOnCourt[this.o][23]].compositeRating.punting);

					// seperate out, test more
					//			console.log("this.playersOnCourt[this.o][22]: "+this.playersOnCourt[this.o][22]);
					//			console.log("this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.blockRun: "+this.team[this.o].player[0].compositeRating.blockRun);
					//			console.log("this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.blockRun: "+this.team[this.o].player[1].compositeRating.blockRun);
					//			console.log("this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.blockRun: "+this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.blockRun);
					//		console.log("this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.punting: "+this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.punting);
					//		console.log("this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.punting: "+this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.punting);
					//		console.log("this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.punting: "+this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.punting);
					rawFieldPosition = random.randInt(20, 80) * this.team[this.o].player[this.playersOnCourt[this.o][23]].compositeRating.punting;
					//////		console.log("rawFieldPosition: "+rawFieldPosition);
					finalFieldPosition = Math.round(rawFieldPosition);
					puntLength = fieldPosition;
					fieldPosition += finalFieldPosition;
					puntLength *= -1;
					puntLength += fieldPosition;
					this.recordStat(this.o, this.playersOnCourt[this.o][23], "puntty", puntLength);
					////////		console.log("fieldPosition: "+fieldPosition);
					kickPunt = 1;
					//random.randInt(1, years);
					//Math.round((ratings.pot - ratings.ovr) / 4.0);
					this.recordStat(this.o, this.playersOnCourt[this.o][23], "punta");
					this.recordStat(this.o, this.playersOnCourt[this.o][23], "puntl");
					if (fieldPosition >= 100) {
						fieldPosition = 80;
						p = this.playersOnCourt[this.o][23];
						playDown = 1;
						toFirst = 10;
						//touchback = 0;
						this.recordPlay("puntTouch", this.d, [this.team[this.o].player[p].name], finalFieldPosition, playDown, toFirst, 100 - fieldPosition);
						this.recordStat(this.o, this.playersOnCourt[this.o][23], "punttb");

						fromPunt = 1;
					} else {

						p = this.playersOnCourt[this.o][23];
						playDown = 1;
						toFirst = 10;
						this.recordPlay("punt", this.d, [this.team[this.o].player[p].name], finalFieldPosition, playDown, toFirst, 100 - fieldPosition);
						fromPunt = 1;

						/////////////		console.log("fieldPosition: "+fieldPosition);
					}

					//	console.log("punt"+fieldPosition);
				} else {

					//secondTimeBlocking[this.o][i] ;
					//secondTimeRushing[this.d][i] ;
					//// locations
					//		console.log("firstTimeBlocking[this.o][1]: "+firstTimeBlocking[this.o][1]+" firstTimeRushing[this.d][1]: "+firstTimeRushing[this.d][1]);
					//		console.log("this.team[this.o].player[firstTimeBlocking[this.o][1]].compositeRating.blockPass: "+this.team[this.o].player[firstTimeBlocking[this.o][1]].compositeRating.blockPass+" this.team[this.d].player[firstTimeRushing[this.d][1]].compositeRating.passRush: "+this.team[this.d].player[firstTimeRushing[this.d][1]].compositeRating.passRush);
					//						console.log("firstTimeBlocking[this.o][2]: "+firstTimeBlocking[this.o][2]+" firstTimeRushing[this.d][1]: "+firstTimeRushing[this.d][2]);
					//						console.log("firstTimeBlocking[this.o][3]: "+firstTimeBlocking[this.o][3]+" firstTimeRushing[this.d][1]: "+firstTimeRushing[this.d][3]);
					//						console.log("firstTimeBlocking[this.o][4]: "+firstTimeBlocking[this.o][4]+" firstTimeRushing[this.d][1]: "+firstTimeRushing[this.d][4]);
					//						console.log("firstTimeBlocking[this.o][5]: "+firstTimeBlocking[this.o][5]+" firstTimeRushing[this.d][1]: "+firstTimeRushing[this.d][5]);
					rushSum = 0;
					runStuffSum = 0;
					//	coverSum = 0;
					for ( i = 0; i < 5; i++) {

						if ((firstTimeBlocking[this.o][i] < 100) && (firstTimeRushing[this.d][i] < 100)) {
							rushSum += (this.team[this.d].player[firstTimeRushing[this.d][i]].compositeRating.passRush - this.team[this.o].player[firstTimeBlocking[this.o][i]].compositeRating.blockPass);
							runStuffSum += (this.team[this.d].player[firstTimeRushing[this.d][i]].compositeRating.runStop - this.team[this.o].player[firstTimeBlocking[this.o][i]].compositeRating.blockRun);
							//		coverSum += (this.team[this.d].player[firstTimeRushing[this.d][i]].compositeRating.crossingCoverage - this.team[this.o].player[firstTimeBlocking[this.o][i]].compositeRating.blockRun);
							sackProb = (this.team[this.d].player[firstTimeRushing[this.d][i]].compositeRating.passRush - this.team[this.o].player[firstTimeBlocking[this.o][i]].compositeRating.blockPass) + .1;
						}
						if (Math.random() < sackProb) {
							sackPlayer = firstTimeRushing[this.d][i];
							gaveUpSack = firstTimeBlocking[this.o][i];
						} else {
							sackPlayer = 100;
							gaveUpSack = 100;
						}

					}
					if (sackPlayer == 100) {
						sackPlayer = firstTimeRushing[this.d][0];
						gaveUpSack = firstTimeBlocking[this.o][0];
					}
					rushSum /= 5;
					runStuffSum /= 5;
					rushSum /= 3;
					runStuffSum /= 3;
					//	coverSum /= 5;

					if ((this.t <= 0.25) && (this.team[this.o].stat.pts < this.team[this.d].stat.pts) && (fieldPosition < 95)) {
						timeThroughProb = 1;
					} else if ((this.t <= 1) && (this.team[this.o].stat.pts < this.team[this.d].stat.pts) && (fieldPosition < 60)) {
						timeThroughProb = 1;
					} else if ((this.t <= .25) && (this.team[this.o].stat.pts > this.team[this.d].stat.pts)) {
						timeThroughProb = 0;
					} else {
						timeThroughProb = Math.random();
					}
					///////////////		console.log("timeThroughProb: "+timeThroughProb);
					if (((timeThroughProb < (.66 + rushSum) ) && (count1[this.o] > 0) ) || ((count2[this.o] == 0) && (count1[this.o] > 0) )) {
						timeType = 1;
						// first time trough
						//	firstTimeThrough[this.o][i] = firstTimeThrough[this.o][k];
						//		firstTimeDefense[this.d][i] = firstTimeDefense[this.d][k];
						//		firstTimeOffense[this.o][i] = firstTimeOffense[this.o][k];
						//		firstTimeBlocking[this.o][i] = firstTimeBlocking[this.o][k];
						//		firstTimeRushing[this.d][i] = firstTimeRushing[this.d][k];
						//		firstTimeType[this.o][i] = firstTimeType[this.o][k];
						////	console.log("count1[this.o]: "+count1[this.o]);
						while (playPicked == 0) {

							for ( i = 0; i < count1[this.o]; i++) {
								//	    fatigue = this.fatigue(this.team[this.o].player[firstTimeOffense[this.o][i]].stat.energy);
								fatigue = .5 + Math.random() / 2;

								//	console.log(fatigue);
								//	-(.1-fatigue/10);
								//this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "orb",yardsOnPlay);
								//								this.recordStat(this.o, this.playersOnCourt[this.o][0], "syl",-yardsOnPlay);
								//	console.log("thirdTimeBlocking[this.o][playerOfType]: "+thirdTimeBlocking[this.o][playerOfType]);
								//if  (thirdTimeBlocking[this.o][playerOfType] < 100) {
								//this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "ols");

								playProb = (((firstTimeThrough[this.o][i]) + .0) / 3) - (.1 - fatigue / 10) * 2 + .05;

								if (playProb < .05) {
									playProb = .05;
								}

								if (count1[this.o] == 1) {
									playProb = 2;
								}
								////////////////			console.log("i: "+i+" 1st time through playProb: "+playProb);

								if ((Math.random() * 1.5) < (playProb + .5)) {

									if ((firstTimeType[this.o][i]) == 1) {

										playType = 1;
										timeThrough = 1;
										playerOfType = i;
										///// yardage for earch type of play, impacted by location(just cap at max yards), player skill?, player position?
										///// depending on where play ends, determines who tackles
										///// also determines who misses tackles?

										///// for running really about missed tackles and how big a whole
										///// could do get to 5 yard line? then based on missed tackles say how much later

										///// for passing, want sack odds, pass/catch odds, run after play odds

										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;
										//	console.log("time 1 type 1: "+playProb);
										if (yardsProb < .80) {
											yardsProb -= runStuffSum;
											yardsProb += playProb / 2 - .03;
										} else if (yardsProb < .90) {
											yardsProb -= runStuffSum / 2;
											yardsProb += playProb / 2 - .03;
										} else if (yardsProb < .95) {
											yardsProb -= runStuffSum / 4;
											yardsProb += playProb / 10;
										} else if (yardsProb < .98) {
											yardsProb -= runStuffSum / 10;
											yardsProb += playProb / 100;
										} else {
											yardsProb += playProb / 100;
										}

										//									this.rushingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.rushingYards(yardsProb);
										//	if (yardsOnPlay>0) {
										//												if (Math.random() < (.011*(1-playProb) )) {
										if (Math.random() < (.013 * (1 - playProb) )) {
											//				console.log("fumble: "+ playProb);
											fumble = 1;
										}
										//	}

										playPicked = 1;

									} else if ((firstTimeType[this.o][i]) == 2) {

										playType = 2;
										timeThrough = 1;
										playerOfType = i;
										//	console.log("time 1 type 2: "+playProb);
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < .80) {
											yardsProb -= runStuffSum;
											yardsProb += playProb / 2 - .03;
										} else if (yardsProb < .90) {
											yardsProb -= runStuffSum / 2;
											yardsProb += playProb / 2 - .03;
										} else if (yardsProb < .95) {
											yardsProb -= runStuffSum / 4;
											yardsProb += playProb / 10;
										} else if (yardsProb < .98) {
											yardsProb -= runStuffSum / 10;
											yardsProb += playProb / 100;
										} else {
											yardsProb += playProb / 100;
										}
										// same function?
										yardsOnPlay = this.rushingYards(yardsProb, yardsOnPlay);
										//	if (yardsOnPlay>0) {
										//												if (Math.random() < (.011*(1-playProb) )) {
										if (Math.random() < (.013 * (1 - playProb) )) {
											//			console.log("fumble: "+ playProb);
											fumble = 1;
										}
										//	}
										playPicked = 1;
									} else if ((firstTimeType[this.o][i]) == 3) {
										// new function for passes
										// same with adj yardsProb?
										// or diff?
										// tiered - sack, catch , run after?
										// or do like run, have those reversed engineered?

										playType = 3;
										timeThrough = 1;
										playerOfType = i;
										//		console.log("time 1 type 3: "+playProb);

										// Short Pass
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											//										yardsProb += playProb/10
											yardsProb -= .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .439) {
											// less chance of incomplete
											yardsProb -= .10;
											yardsProb += playProb / 2 - .09;
											//playProb/100;
										} else if (yardsProb < .733) {
											yardsProb -= .10;
											yardsProb += playProb / 2 - .09;
										} else if (yardsProb < .90) {
											yardsProb -= .10;
											yardsProb += playProb / 2 - .09;
										} else if (yardsProb < .95) {
											yardsProb -= .05;
											yardsProb += playProb / 100;
										} else {
											// 2% cushion, that is removed at top
											yardsProb -= .02;
											yardsProb += playProb / 100;
										}

										//									this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {
												//	console.log("int: "+ playProb);
												interception = 1;
											}
										}
										if (interception == 0) {
											//												if (Math.random() < (.011*(1-playProb) )) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//		console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;

									} else if ((firstTimeType[this.o][i]) == 4) {

										playType = 4;
										timeThrough = 1;
										playerOfType = i;

										// Crossing Pass
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											//										yardsProb += playProb/10
											//	yardsProb += .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .439) {
											// less chance of incomplete
											//		yardsProb += .10;
											yardsProb += playProb / 2 - .09;
											//playProb/100;
										} else if (yardsProb < .733) {
											//yardsProb -= .10;
											yardsProb += playProb / 2 - .09;
										} else if (yardsProb < .90) {
											//		yardsProb -= .10;
											yardsProb += playProb / 2 - .09;
										} else if (yardsProb < .95) {
											//			yardsProb -= .05;
											yardsProb += playProb / 100;
										} else {
											// 2% cushion, that is removed at top
											//			yardsProb -= .02;
											yardsProb += playProb / 100;
										}
										//									this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											//												if (Math.random() < (.160-playProb)*.5 ) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {

												//		console.log("int: "+ playProb);
												interception = 1;
											}
										}

										if (interception == 0) {
											//												if (Math.random() < (.011*(1-playProb) )) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//			console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;
									} else if ((firstTimeType[this.o][i]) == 5) {

										playType = 5;
										timeThrough = 1;
										playerOfType = i;

										// Long Pass
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											//										yardsProb += playProb/10
											yardsProb -= .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .10) {
											// less chance of incomplete
											yardsProb -= .05;
											yardsProb += playProb / 1;
											//playProb/100;
										} else if (yardsProb < .439) {
											// less chance of incomplete
											//		yardsProb += .10;
											yardsProb += playProb / 1;
											//playProb/100;
										} else if (yardsProb < .533) {
											yardsProb -= .10;
											yardsProb += playProb / 1;
										} else if (yardsProb < .633) {
											yardsProb += .20;
											yardsProb += playProb / 1;
										} else if (yardsProb < .733) {
											yardsProb += .10;
											yardsProb += playProb / 1;
										} else if (yardsProb < .90) {
											//		yardsProb -= .10;
											yardsProb += playProb / 1;
										} else if (yardsProb < .95) {
											//			yardsProb -= .05;
											yardsProb += playProb / 10;
										} else {
											// 2% cushion, that is removed at top
											//			yardsProb -= .02;
											yardsProb += playProb / 10;
										}

										//									this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											//												if (Math.random() < (.160-playProb)*.5 ) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {

												//			console.log("int: "+ playProb);
												interception = 1;
											}
										}
										if (interception == 0) {
											//												if (Math.random() < (.011*(1-playProb) )) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//			console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;
									}
									///////////		console.log("firstTimeType[this.o][i]: "+firstTimeType[this.o][i]+" yardsProb: "+yardsProb+" yardsOnPlay: "+yardsOnPlay);
									i = count1[this.o];

								}

							}

						}

					} else if (((timeThroughProb < (.85 + rushSum)) && (count2[this.o] > 0) ) || ((count3[this.o] == 0) && (count2[this.o] > 0) )) {
						// second time trough
						timeType = 2;
						///////////////		console.log("count2[this.o]: "+count2[this.o]);
						while (playPicked == 0) {
							for ( i = 0; i < count2[this.o]; i++) {
								//fatigue = this.fatigue(this.team[this.o].player[secondTimeOffense[this.o][i]].stat.energy);
								fatigue = .5 + Math.random() / 2;

								//	console.log(fatigue);
								//-(.1-fatigue/10);

								playProb = (((secondTimeThrough[this.o][i]) + .0) / 3 - (.1 - fatigue / 10) * 2 + .05 );

								if (playProb < .05) {
									playProb = .05;
								}

								if (count2[this.o] == 1) {
									playProb = 2;
								}
								/////////////////			console.log("i: "+i+" 2nd time through playProb: "+playProb);

								if ((Math.random() * 1.5) < (playProb + .5)) {

									if ((secondTimeType[this.o][i]) == 1) {

										///// yardage for earch type of play, impacted by location(just cap at max yards), player skill?, player position?
										///// depending on where play ends, determines who tackles
										///// also determines who misses tackles?

										///// for running really about missed tackles and how big a whole
										///// could do get to 5 yard line? then based on missed tackles say how much later

										///// for passing, want sack odds, pass/catch odds, run after play odds
										playType = 1;
										timeThrough = 2;
										playerOfType = i;

										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < .80) {
											yardsProb += playProb / 2 - .03;
										} else if (yardsProb < .90) {
											yardsProb += playProb / 2 - .03;
										} else if (yardsProb < .95) {
											yardsProb += playProb / 100;
										} else if (yardsProb < .98) {
											yardsProb += playProb / 100;
										} else {
											yardsProb += playProb / 100;
										}

										//									this.rushingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.rushingYards(yardsProb);
										//			if (yardsOnPlay>0) {
										//												if (Math.random() < (.011*(1-playProb) )) {
										if (Math.random() < (.013 * (1 - playProb) )) {
											//		console.log("fumble: "+ playProb);
											fumble = 1;
										}
										//		}
										playPicked = 1;

									} else if ((secondTimeType[this.o][i]) == 2) {
										playType = 2;
										timeThrough = 2;
										playerOfType = i;
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < .80) {
											yardsProb += playProb / 2 - .03;
										} else if (yardsProb < .90) {
											yardsProb += playProb / 10;
										} else if (yardsProb < .95) {
											yardsProb += playProb / 100;
										} else if (yardsProb < .98) {
											yardsProb += playProb / 100;
										} else {
											yardsProb += playProb / 100;
										}
										// same function?
										//									this.rushingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.rushingYards(yardsProb);
										//		if (yardsOnPlay>0) {
										//												if (Math.random() < (.011*(1-playProb) )) {
										if (Math.random() < (.013 * (1 - playProb) )) {
											//			console.log("fumble: "+ playProb);
											fumble = 1;
										}
										//		}
										playPicked = 1;

									} else if ((secondTimeType[this.o][i]) == 3) {
										// new function for passes
										// same with adj yardsProb?
										// or diff?
										// tiered - sack, catch , run after?
										// or do like run, have those reversed engineered?

										playType = 3;
										timeThrough = 2;
										playerOfType = i;

										// Short Pass
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											//										yardsProb += playProb/10
											yardsProb += .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .439) {
											// less chance of incomplete
											yardsProb += .10;
											yardsProb += playProb / 2 - .09;
											//playProb/100;
										} else if (yardsProb < .733) {
											yardsProb += playProb / 2 - .09;
										} else if (yardsProb < .90) {
											yardsProb -= .10;
											yardsProb += playProb / 2 - .09;
										} else if (yardsProb < .95) {
											yardsProb -= .05;
											yardsProb += playProb / 100;
										} else {
											// 2% cushion, that is removed at top
											yardsProb -= .02;
											yardsProb += playProb / 100;
										}

										//									this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											//												if (Math.random() < (.160-playProb)*.5 ) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {

												//		console.log("int: "+ playProb);
												interception = 1;
											}
										}

										if (interception == 0) {
											//												if (Math.random() < (.011*(1-playProb) )) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//			console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;

									} else if ((secondTimeType[this.o][i]) == 4) {
										playType = 4;
										timeThrough = 2;
										playerOfType = i;
										// Crossing Pass
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											//										yardsProb += playProb/10
											//	yardsProb += .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .439) {
											// less chance of incomplete
											//		yardsProb += .10;
											yardsProb += playProb / 2 - .09;
											//playProb/100;
										} else if (yardsProb < .733) {
											//yardsProb -= .10;
											yardsProb += playProb / 2 - .09;
										} else if (yardsProb < .90) {
											//		yardsProb -= .10;
											yardsProb += playProb / 2 - .09;
										} else if (yardsProb < .95) {
											//			yardsProb -= .05;
											yardsProb += playProb / 100;
										} else {
											// 2% cushion, that is removed at top
											//			yardsProb -= .02;
											yardsProb += playProb / 100;
										}
										//				this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											//												if (Math.random() < (.160-playProb)*.5 ) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {

												//		console.log("int: "+ playProb);
												interception = 1;
											}
										}

										if (interception == 0) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//			console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;
									} else if ((secondTimeType[this.o][i]) == 5) {
										// Long Pass
										playType = 5;
										timeThrough = 2;
										playerOfType = i;

										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											//										yardsProb += playProb/10
											yardsProb -= .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .10) {
											// less chance of incomplete
											yardsProb -= .05;
											yardsProb += playProb / 1 - .06;
											//playProb/100;
										} else if (yardsProb < .439) {
											// less chance of incomplete
											//		yardsProb += .10;
											yardsProb += playProb / 1 - .06;
											//playProb/100;
										} else if (yardsProb < .533) {
											yardsProb -= .10;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .633) {
											yardsProb += .20;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .733) {
											yardsProb += .10;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .90) {
											//		yardsProb -= .10;
											yardsProb += playProb / 10;
										} else if (yardsProb < .95) {
											//			yardsProb -= .05;
											yardsProb += playProb / 10;
										} else {
											// 2% cushion, that is removed at top
											//			yardsProb -= .02;
											yardsProb += playProb / 10;
										}

										//									this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											//												if (Math.random() < (.160-playProb)*.5 ) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {

												//		console.log("int: "+ playProb);
												interception = 1;
											}
										}

										if (interception == 0) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//			console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;

									}
									/////////////			console.log("secondTimeType[this.o][i]: "+secondTimeType[this.o][i]+" yardsProb: "+yardsProb+" yardsOnPlay: "+yardsOnPlay);
									i = count2[this.o];

								}

							}
						}
						//// orb can be total yards
						//this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "orb",yardsOnPlay);

						//					} else if (timeThroughProb < .96) {
					}
					else {

						timeType = 3;
						// third time trough
						while (playPicked == 0) {
							//////////////		console.log("count3[this.o]: "+count3[this.o]);
							for ( i = 0; i < count3[this.o]; i++) {
								//								    fatigue = this.fatigue(this.team[this.o].player[thirdTimeOffense[this.o][i]].stat.energy);
								fatigue = .5 + Math.random() / 2;

								//console.log(fatigue);
								//	-(.1-fatigue/10);
								playProb = (((thirdTimeThrough[this.o][i]) + .0) / 3) - (.1 - fatigue / 10) * 2 + .05;

								if (playProb < .05) {
									playProb = .05;
								}

								if (count3[this.o] == 1) {
									playProb = 2;
								}
								////////////////			console.log("i: "+i+" 3rd time through playProb: "+playProb);

								if ((Math.random() * 1.5) < (playProb + .5)) {

									if ((thirdTimeType[this.o][i]) == 1) {

										///// yardage for earch type of play, impacted by location(just cap at max yards), player skill?, player position?
										///// depending on where play ends, determines who tackles
										///// also determines who misses tackles?

										///// for running really about missed tackles and how big a whole
										///// could do get to 5 yard line? then based on missed tackles say how much later

										///// for passing, want sack odds, pass/catch odds, run after play odds
										playType = 1;
										timeThrough = 3;
										playerOfType = i;

										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < .80) {
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .90) {
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .95) {
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .98) {
											yardsProb += playProb / 10;
										} else {
											yardsProb += playProb / 10;
										}

										//									this.rushingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.rushingYards(yardsProb);
										//		if (yardsOnPlay>0) {
										if (Math.random() < (.013 * (1 - playProb) )) {
											//				console.log("fumble: "+ playProb);
											fumble = 1;
										}
										//		}
										playPicked = 1;

									} else if ((thirdTimeType[this.o][i]) == 2) {
										playType = 2;
										timeThrough = 3;
										playerOfType = i;
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < .80) {
											yardsProb += .05;

											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .90) {
											yardsProb += .01;

											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .95) {
											yardsProb += .005;

											yardsProb += playProb / 10;
										} else if (yardsProb < .98) {
											yardsProb += .001;

											yardsProb += playProb / 10;
										} else {
											yardsProb += playProb / 10;
										}
										// same function?
										//									this.rushingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.rushingYards(yardsProb);
										//		if (yardsOnPlay>0) {
										if (Math.random() < (.013 * (1 - playProb) )) {
											//			console.log("fumble: "+ playProb);
											fumble = 1;
										}
										//		}
										playPicked = 1;
									} else if ((thirdTimeType[this.o][i]) == 3) {
										// new function for passes
										// same with adj yardsProb?
										// or diff?
										// tiered - sack, catch , run after?
										// or do like run, have those reversed engineered?

										playType = 3;
										timeThrough = 3;
										playerOfType = i;

										// Short Pass
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											//										yardsProb += playProb/10
											yardsProb += .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .439) {
											// less chance of incomplete
											yardsProb += .10;
											yardsProb += playProb / 1 - .06;
											//playProb/100;
										} else if (yardsProb < .733) {
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .90) {
											yardsProb -= .10;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .95) {
											yardsProb -= .05;
											yardsProb += playProb / 10;
										} else {
											// 2% cushion, that is removed at top
											yardsProb -= .02;
											yardsProb += playProb / 10;
										}

										//									this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											//												if (Math.random() < (.160-playProb)*.5 ) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {

												//		console.log("int: "+ playProb);
												interception = 1;
											}
										}
										if (interception == 0) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//		console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;

									} else if ((thirdTimeType[this.o][i]) == 4) {
										playType = 4;
										timeThrough = 3;
										playerOfType = i;
										// Crossing Pass
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											yardsProb += .005;
											//										yardsProb += playProb/10
											//	yardsProb += .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .439) {
											yardsProb += .050;
											// less chance of incomplete
											//		yardsProb += .10;
											yardsProb += playProb / 1 - .06;
											//playProb/100;
										} else if (yardsProb < .733) {
											yardsProb += .050;
											//yardsProb -= .10;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .90) {
											yardsProb += .010;
											//		yardsProb -= .10;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .95) {
											yardsProb += .005;
											//			yardsProb -= .05;
											yardsProb += playProb / 10;
										} else {
											// 2% cushion, that is removed at top
											//			yardsProb -= .02;
											yardsProb += playProb / 10;
										}
										//									this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											//												if (Math.random() < (.160-playProb)*.5 ) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {

												//			console.log("int: "+ playProb);
												interception = 1;
											}
										}

										if (interception == 0) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//			console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;
									} else if ((thirdTimeType[this.o][i]) == 5) {
										playType = 5;
										timeThrough = 3;
										playerOfType = i;
										// Long Pass
										yardsProb = Math.random();
										yardsProb *= 1 + (1 - yardsProb) / 10;

										if (yardsProb < 0.059) {
											//										yardsProb += playProb/10
											yardsProb += .005;
											yardsProb += playProb / 10;
										} else if (yardsProb < .10) {
											// less chance of incomplete
											yardsProb += .05;
											yardsProb += playProb / 10;
											//playProb/100;
										} else if (yardsProb < .439) {
											// less chance of incomplete
											//		yardsProb += .10;
											yardsProb += playProb / 1 - .06;
											//playProb/100;
										} else if (yardsProb < .533) {
											yardsProb += .10;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .633) {
											yardsProb += .20;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .733) {
											yardsProb += .10;
											yardsProb += playProb / 1 - .06;
										} else if (yardsProb < .90) {
											//		yardsProb -= .10;
											yardsProb += playProb / 10;
										} else if (yardsProb < .95) {
											//			yardsProb -= .05;
											yardsProb += playProb / 10;
										} else {
											// 2% cushion, that is removed at top
											//			yardsProb -= .02;
											yardsProb += playProb / 10;
										}

										//									this.passingYards(yardsProb,yardsOnPlay);
										yardsOnPlay = this.passingYards(yardsProb);
										if (yardsOnPlay > 0) {
											//												if (Math.random() < (.160-playProb)*.5 ) {
											if (Math.random() < (.045 + (.160 - playProb) * .12 )) {

												//		console.log("int: "+ playProb);
												interception = 1;
											}
										}

										if (interception == 0) {
											if (Math.random() < (.013 * (1 - playProb) )) {
												//			console.log("fumble: "+ playProb);
												fumble = 1;
											}
										}

										playPicked = 1;
									}
									//////////////////		console.log("thirdTimeType[this.o][i]: "+thirdTimeType[this.o][i]+" yardsProb: "+yardsProb+" yardsOnPlay: "+yardsOnPlay);
									i = count3[this.o];

								}
							}

						}

						//// orb can be total yards
						//this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "orb",yardsOnPlay);

					}

				}
				/*					} else {

				// play dead (sack?)
				// should this happen earlier?
				console.log("sack? ")
				}*/

				//}

				/*	if (driveNumber[this.o] < 3) {
				 console.log("START BEFORE this.o "+this.o);
				 console.log("driveNumber[this.o]: "+driveNumber[this.o]);
				 console.log("yardsOnPlay: "+yardsOnPlay);
				 console.log("playDown: "+playDown);
				 console.log("toFirst: "+toFirst);
				 console.log("fieldPosition: "+fieldPosition);
				 }				*/

				if ((fieldGoal == 0) && (kickPunt == 0)) {
					fieldPosition += yardsOnPlay;
					toFirst -= yardsOnPlay;

					//					if ((toFirst <= 0) || (interception == 1) || (fumble == 1)) {
					//					if ((toFirst <= 0) || (interception == 1)) {
					if ((toFirst <= 0)) {
						playDown = 1;
						// if turnover driveActive ==0, if touchdown driveActive = 1,touchdown = 1, fieldGoal = 1;
						toFirst = 10;
					} else {
						playDown += 1;
						// if turnover driveActive ==0, if touchdown driveActive = 1,touchdown = 1, fieldGoal = 1;
					}

					if (fieldPosition >= 100) {
						playDown = 100;
						yardsOnPlay -= fieldPosition - 100;
						//  fieldPosition = 20;
						// need scoring stat stored here
						// also need extra point attempt, or 2 pt conversion

						//////////// should be all playTypes unless it is a fieldGoal and Punt

						///////////////// something not working here
						////////////////// hang ups

						//						if (playType == 1) {
						if (timeType == 1) {
							/*thirdTimeThrough[this.o][k] = tempThrough;
							 thirdTimeDefense[this.d][k] = tempDefense;
							 thirdTimeOffense[this.o][k] = tempOffense;
							 thirdTimeBlocking[this.o][k] = tempBlocking;
							 thirdTimeRushing[this.d][k] = tempRushing;
							 thirdTimeType[this.o][k] = tempType;*/
							this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "pts", 6);
							//							this.recordPlay("td", this.o, firstTimeOffense[this.o][playerOfType],fieldPosition);
							if (playType > 2) {

								//////////
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");

								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
								this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "orb", yardsOnPlay);
								if (firstTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
								}
								if (firstTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "depc");

								}
								/////////////

								this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "ast");
								p = firstTimeOffense[this.o][playerOfType];

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

								this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "pf");
								p = firstTimeOffense[this.o][playerOfType];
								this.recordPlay("passTD", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

							} else {
								//////////////////////
								this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "drb", yardsOnPlay);
								if (firstTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olry", yardsOnPlay);
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "tov");
								if (firstTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olr");
									this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olrp");
								}
								if (firstTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "der");
								}
								if (firstTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "dery", yardsOnPlay);
								}
								/////////////////

								this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "ft");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdr");

								if ((redZone == 1 )) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");
								}

								if ((thirdDown == 1 )) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");
								}
								p = firstTimeOffense[this.o][playerOfType];
								this.recordPlay("rushTD", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

							}
							p = firstTimeOffense[this.o][playerOfType];
							//	this.recordPlay("td", this.o, [this.team[this.o].player[p].name],fieldPosition);
							//							this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);
							/////////////////		console.log("touchdown")
							//					    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
						}
						if (timeType == 2) {
							/*thirdTimeThrough[this.o][k] = tempThrough;
							 thirdTimeDefense[this.d][k] = tempDefense;
							 thirdTimeOffense[this.o][k] = tempOffense;
							 thirdTimeBlocking[this.o][k] = tempBlocking;
							 thirdTimeRushing[this.d][k] = tempRushing;
							 thirdTimeType[this.o][k] = tempType;*/
							this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "pts", 6);

							if (playType > 2) {

								//////////
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");

								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
								this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "orb", yardsOnPlay);
								this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "ast");
								if (secondTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
								}
								if (secondTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "depc");
								}
								/////////////

								this.recordStat(this.o, this.playersOnCourt[this.o][0], "blk");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdp");

								if ((redZone == 1 )) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");
								}

								if ((thirdDown == 1)) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");
								}
								this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "pf");
								p = secondTimeOffense[this.o][playerOfType];
								this.recordPlay("passTD", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
							} else {
								/////////////////
								this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "drb", yardsOnPlay);
								if (secondTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olry", yardsOnPlay);
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "tov");
								if (secondTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olr");
									this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olrp");

								}
								if (secondTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "der");
								}
								if (secondTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "dery", yardsOnPlay);
								}

								///////////////
								this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "ft");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdr");
								if ((redZone == 1 )) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");
								}

								if ((thirdDown == 1)) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");
								}
								p = secondTimeOffense[this.o][playerOfType];
								this.recordPlay("rushTD", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
							}
							p = secondTimeOffense[this.o][playerOfType];
							//this.recordPlay("td", this.o, [this.team[this.o].player[p].name],fieldPosition);
							//		this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);
							//	console.log("touchdown")
							//					    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
						}
						if (timeType == 3) {
							/*thirdTimeThrough[this.o][k] = tempThrough;
							 thirdTimeDefense[this.d][k] = tempDefense;
							 thirdTimeOffense[this.o][k] = tempOffense;
							 thirdTimeBlocking[this.o][k] = tempBlocking;
							 thirdTimeRushing[this.d][k] = tempRushing;
							 thirdTimeType[this.o][k] = tempType;*/

							this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "pts", 6);

							if (playType > 2) {

								//////////
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");

								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
								this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "orb", yardsOnPlay);
								this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "ast");
								if (thirdTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
								}
								if (thirdTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "depc");
								}
								/////////////
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "blk");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdp");

								if ((redZone == 1 )) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");
								}

								if ((thirdDown == 1)) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");
								}
								this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "pf");
								p = thirdTimeOffense[this.o][playerOfType];
								this.recordPlay("passTD", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
							} else {

								/////////////////
								this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "drb", yardsOnPlay);
								if (thirdTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olry", yardsOnPlay);
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "tov");
								if (thirdTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olr");
									this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olrp");

								}
								if (thirdTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "der");
								}
								if (thirdTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "dery", yardsOnPlay);
								}

								///////////////

								this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "ft");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tottd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptd");
								this.recordStat(this.d, this.playersOnCourt[this.d][0], "opptdr");
								if ((redZone == 1 )) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "rztd");
								}

								if ((thirdDown == 1)) {
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "tdf");
								}
								p = thirdTimeOffense[this.o][playerOfType];
								this.recordPlay("rushTD", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
							}
							p = thirdTimeOffense[this.o][playerOfType];
							//			this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);
							//this.recordPlay("td", this.o, [this.team[this.o].player[p].name],fieldPosition);

							//					    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
						}

						//probMakeFieldGoal = this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal;
						//if (Math.random()>(fieldPosition/100*this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal)) {
						//this.recordStat(this.o, 22, "pts",3);
						//p= thirdTimeOffense[this.o][playerOfType];
						//		this.recordPlay("pts", this.o, [this.team[this.o].player[22].name]);
						//fieldGoal = 1;
						//}
						//// extra point
						this.recordStat(this.o, this.playersOnCourt[this.o][22], "fgaLowPost");
						//		console.log("fieldGoal prob: "+this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal);
						if ((Math.random() * Math.random() * Math.random()) < ((this.team[this.o].player[this.playersOnCourt[this.o][22]].compositeRating.fieldGoal) / 2 + .5)) {

							this.recordStat(this.o, this.playersOnCourt[this.o][22], "pts", 1);
							p = this.playersOnCourt[this.o][22];
							this.recordPlay("ep", this.o, [this.team[this.o].player[p].name]);
							//			console.log("extra point")

							this.recordStat(this.o, this.playersOnCourt[this.o][22], "fgLowPost");
						} else {
							p = this.playersOnCourt[this.o][22];
							this.recordPlay("epm", this.o, [this.team[this.o].player[p].name]);
						}

						//// two point conversion

					}
					else {

						if ((interception == 1) || (fumble == 1)) {
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
									//	this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "tgts");
									p = firstTimeOffense[this.o][playerOfType];

									this.recordPlay("inc", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
									if (firstTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (firstTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "dep");
									}

								} else if (yardsOnPlay < 0 && passOrSack < .25) {
									//// typically sack

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									if (firstTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (firstTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
									}
									if (firstTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "dep");
									}
									if (firstTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
									}
									if (fumble == 1) {
										//	playdown = 1;
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fbl");
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

										//p= firstTimeOffense[this.o][playerOfType];
										playDown = 1;
										toFirst = 10;
										p = firstTimeOffense[this.o][playerOfType];
										fieldPosition -= 100;
										fieldPosition *= -1;

										this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

									}

								} else {
									if (interception == 1) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "inter");
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppinter");

										p = this.playersOnCourt[this.o][0];
										//	console.log("Int happened was Here");
										playDown = 1;
										toFirst = 10;
										fieldPosition -= 100;
										fieldPosition *= -1;
										this.recordPlay("int", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

									} else {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");

										this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

										this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
										this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "orb", yardsOnPlay);
										if (firstTimeBlocking[this.o][playerOfType] < 100) {
											this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
										}
										if (firstTimeDefense[this.d][playerOfType] < 100) {
											this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
											this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "depc");
										}
										this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "ast");
										p = firstTimeOffense[this.o][playerOfType];
										this.recordPlay("pass", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
										if (fumble == 1) {
											this.recordStat(this.o, this.playersOnCourt[this.o][0], "fbl");
											this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
											this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
											this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

											//p= firstTimeOffense[this.o][playerOfType];
											playDown = 1;
											toFirst = 10;
											//											p=  this.playersOnCourt[this.o][0];
											p = firstTimeOffense[this.o][playerOfType];

											fieldPosition -= 100;
											fieldPosition *= -1;

											this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

										}
									}
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "tgts");

									if (firstTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (firstTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "dep");
									}

								}
							} else {

								this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "drb", yardsOnPlay);
								if (firstTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olry", yardsOnPlay);
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "tov");
								if (firstTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olr");
									this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "olrp");
								}
								if (firstTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "der");
								}
								if (firstTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "dery", yardsOnPlay);
								}

								p = firstTimeOffense[this.o][playerOfType];
								this.recordPlay("rush", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								if (fumble == 1) {
									this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "fbl");
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

									//p= firstTimeOffense[this.o][playerOfType];
									playDown = 1;
									toFirst = 10;
									p = firstTimeOffense[this.o][playerOfType];
									fieldPosition -= 100;
									fieldPosition *= -1;

									this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

								}
							}

							/*thirdTimeThrough[this.o][k] = tempThrough;
							 thirdTimeDefense[this.d][k] = tempDefense;
							 thirdTimeOffense[this.o][k] = tempOffense;
							 thirdTimeBlocking[this.o][k] = tempBlocking;
							 thirdTimeRushing[this.d][k] = tempRushing;
							 thirdTimeType[this.o][k] = tempType;*/
							if (playType > 2 && yardsOnPlay < 0 && passOrSack < .25) {

								//		   console.log("sack");
								//	   console.log(firstTimeRushing[this.d][playerOfType]);
								//if (secondTimeDefense[this.d][playerOfType] <100) {
								//console.log("sackPlayer: "+sackPlayer);
								//								console.log("firstTimeBlocking[this.o][playerOfType]: "+firstTimeBlocking[this.o][playerOfType]);

								/*if (thirdTimeRushing[this.d][playerOfType] <100) {
								this.recordStat(this.d, sackPlayer, "fgaMidRange");
								this.recordStat(this.d,sackPlayer, "fgMidRange");
								}*/

								//								if (thirdTimeRushing[this.d][playerOfType] <100) {
								if (sackPlayer < 100) {
									this.recordStat(this.d, sackPlayer, "fgaMidRange");
									this.recordStat(this.d, sackPlayer, "fgMidRange");
								}
								//								this.recordStat(this.d, firstTimeRushing[this.d][playerOfType], "fgaMidRange");
								//								this.recordStat(this.d,  firstTimeRushing[this.d][playerOfType], "fgMidRange");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "syl", -yardsOnPlay);
								//		p = firstTimeBlocking[this.d][playerOfType];
								//		console.log("firstTimeBlocking[this.o][playerOfType]: "+firstTimeBlocking[this.o][playerOfType]);
								//								gaveUpSack = firstTimeBlocking[this.o][0];

								if (gaveUpSack < 100) {
									//						        if  (firstTimeBlocking[this.o][playerOfType] < 100) {
									//									this.recordStat(this.o, firstTimeBlocking[this.o][playerOfType], "ols");
									this.recordStat(this.o, gaveUpSack, "ols");
								}

								if (sackPlayer < 100) {
									p = sackPlayer;
									//								this.recordPlay("sack", this.d, [this.team[this.d].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);
									this.recordPlay("sack", this.o, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								} else {
									this.recordPlay("sackGroup", this.o, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								}
								//this.recordStat(this.o, this.playersOnCourt[this.o][0], "blk");
								if (fieldPosition <= 0) {
									if (sackPlayer < 100) {
										this.recordStat(this.d, firstTimeRushing[this.d][playerOfType], "pts", 2);
										p = sackPlayer;
										this.recordPlay("safety", this.d, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
									}
									playDown = 100;

								}
							} else if (playType > 2 && yardsOnPlay == 0) {

							} else if (playType > 2 && interception == 1) {

								this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "intery");

							} else {

								if ((yardsOnPlay < 4) || (playType > 2)) {
									//this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "fgMidRange");

									if (yardsOnPlay > 15) {
										for ( i = 11; i < 22; i++) {
											if ((this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'S') || (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'CB')) {
												if (Math.random() < .40) {
													this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");
													i = 22;
												}
											}
											if (i == 21) {
												this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "fgMidRange");
											}
										}
									} else {
										this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "fgMidRange");
									}

								} else if ((this.team[this.d].player[firstTimeDefense[this.d][playerOfType]].pos != 'DL')) {
									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "fgMidRange");
									//this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "fgMidRange");
									//								if ( (yardsOnPlay < 4) || (playType > 2) || (this.team[this.d].player[firstTimeDefense[this.d][playerOfType]].pos != 'DL')) {
									//									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "fgMidRange");
								} else {
									for ( i = 11; i < 22; i++) {
										if (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'LB') {
											if (Math.random() < .40) {
												this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");
												i = 22;
											}
										}
										if (i == 21) {
											this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "fgMidRange");
										}
									}
								}
								if (fieldPosition <= 0) {
									playDown = 1;
									this.recordStat(this.d, firstTimeDefense[this.d][playerOfType], "pts", 2);
									p = firstTimeDefense[this.d][playerOfType];
									this.recordPlay("safety", this.d, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
									playDown = 100;
								}
							}

							//p = firstTimeDefense[this.o][playerOfType];
							//this.recordPlay("pts", this.o, [this.team[this.o].player[p].name]);
							//console.log("tackle")
							//					    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
						}
						if (timeType == 2) {
							passOrSack = Math.random();

							/*thirdTimeThrough[this.o][k] = tempThrough;
							thirdTimeDefense[this.d][k] = tempDefense;
							thirdTimeOffense[this.o][k] = tempOffense;
							thirdTimeBlocking[this.o][k] = tempBlocking;
							thirdTimeRushing[this.d][k] = tempRushing;
							thirdTimeType[this.o][k] = tempType;*/
							//	this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "pts",6);
							if (playType > 2) {

								if (yardsOnPlay == 0) {
									//// typically incomplete
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
									//		this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "tgts");
									p = secondTimeOffense[this.o][playerOfType];
									if (secondTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (secondTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "dep");
									}

									this.recordPlay("inc", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								} else if (yardsOnPlay < 0 && passOrSack < .25) {
									//// typically sack
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									if (secondTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (secondTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
									}
									if (secondTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "dep");
									}
									if (secondTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
									}
									if (fumble == 1) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fbl");
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

										//p= firstTimeOffense[this.o][playerOfType];
										playDown = 1;
										toFirst = 10;
										//										p= this.playersOnCourt[this.o][0];
										p = secondTimeOffense[this.o][playerOfType];

										fieldPosition -= 100;
										fieldPosition *= -1;

										this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

									}

								} else {

									if (interception == 1) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "inter");
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppinter");
										p = this.playersOnCourt[this.o][0];
										//											console.log("Int happened was Here");
										playDown = 1;
										toFirst = 10;

										fieldPosition -= 100;
										fieldPosition *= -1;

										this.recordPlay("int", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

									} else {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");

										this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

										this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
										this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "orb", yardsOnPlay);
										if (secondTimeBlocking[this.o][playerOfType] < 100) {
											this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
										}
										if (secondTimeDefense[this.d][playerOfType] < 100) {
											this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
											this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "depc");

										}
										this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "ast");
										p = secondTimeOffense[this.o][playerOfType];
										this.recordPlay("pass", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
										if (fumble == 1) {
											this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "fbl");
											this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
											this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
											this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

											//p= firstTimeOffense[this.o][playerOfType];
											playDown = 1;
											toFirst = 10;
											p = secondTimeOffense[this.o][playerOfType];
											fieldPosition -= 100;
											fieldPosition *= -1;

											this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

										}
									}
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "tgts");

									if (secondTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (secondTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "dep");
									}

									/*		this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									 this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
									 this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);
									 this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "tgts");

									 this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "orb",yardsOnPlay);
									 this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "ast");
									 if (secondTimeBlocking[this.o][playerOfType] <100) {
									 this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olp");
									 }
									 if (secondTimeBlocking[this.o][playerOfType] <100) {
									 this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olpy",yardsOnPlay);
									 }
									 if (secondTimeDefense[this.d][playerOfType] <100) {
									 this.recordStat(this.d,secondTimeDefense[this.d][playerOfType], "dep");
									 }
									 if (secondTimeDefense[this.d][playerOfType] <100) {
									 this.recordStat(this.d,secondTimeDefense[this.d][playerOfType], "depy",yardsOnPlay);
									 }
									 p= secondTimeOffense[this.o][playerOfType];
									 this.recordPlay("pass", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);	*/
								}

							} else {
								this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "drb", yardsOnPlay);
								if (secondTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olry", yardsOnPlay);
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "tov");
								if (secondTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olr");
									this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "olrp");
								}
								if (secondTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "der");
								}
								if (secondTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "dery", yardsOnPlay);
								}

								p = secondTimeOffense[this.o][playerOfType];
								this.recordPlay("rush", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								if (fumble == 1) {
									this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "fbl");
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

									//p= firstTimeOffense[this.o][playerOfType];
									playDown = 1;
									toFirst = 10;
									p = secondTimeOffense[this.o][playerOfType];
									fieldPosition -= 100;
									fieldPosition *= -1;

									this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

								}
							}

							if (playType > 2 && yardsOnPlay < 0 && passOrSack < .25) {

								//							if (playType >2 && yardsOnPlay<0) {

								//	console.log(secondTimeRushing[this.d][playerOfType]);
								//								console.log("sackPlayer: "+sackPlayer);
								//								console.log("secondTimeBlocking[this.o][playerOfType] : "+secondTimeBlocking[this.o][playerOfType] );

								//								if (secondTimeRushing[this.d][playerOfType] <100) {
								if (sackPlayer < 100) {

									this.recordStat(this.d, sackPlayer, "fgaMidRange");
									this.recordStat(this.d, sackPlayer, "fgMidRange");
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "syl", -yardsOnPlay);
								//		console.log("secondTimeBlocking[this.o][playerOfType]: "+secondTimeBlocking[this.o][playerOfType]);

								//						        if  (secondTimeBlocking[this.o][playerOfType] < 100) {
								if (gaveUpSack < 100) {
									//									this.recordStat(this.o, secondTimeBlocking[this.o][playerOfType], "ols");
									this.recordStat(this.o, gaveUpSack, "ols");
								}
								if (sackPlayer < 100) {

									p = sackPlayer;
									this.recordPlay("sack", this.o, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								} else {
									p = sackPlayer;
									this.recordPlay("sackGroup", this.o, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

								}
								if (fieldPosition <= 0) {
									playDown = 1;

									if (sackPlayer < 100) {
										this.recordStat(this.d, sackPlayer, "pts", 2);
										//									this.recordStat(this.d,  secondTimeRushing[this.d][playerOfType], "pts",2);
										p = sackPlayer;
										this.recordPlay("safety", this.d, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
									}
									playDown = 100;
								}
							} else if (playType > 2 && yardsOnPlay == 0) {

							} else if (playType > 2 && interception == 1) {

								this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "intery");

							} else {

								/*					this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "drb",yardsOnPlay);
								 this.recordStat(this.o, secondTimeOffense[this.o][playerOfType], "tov");
								 p= secondTimeOffense[this.o][playerOfType];
								 this.recordPlay("rush", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);
								 */

								if ((yardsOnPlay < 4) || (playType > 2)) {

									if (yardsOnPlay > 15) {
										for ( i = 11; i < 22; i++) {
											if ((this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'S') || (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'CB')) {
												if (Math.random() < .40) {
													this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");
													i = 22;
												}
											}
											if (i == 21) {
												this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "fgMidRange");
											}
										}
									} else {
										this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "fgMidRange");
									}

								} else if ((this.team[this.d].player[secondTimeDefense[this.d][playerOfType]].pos != 'DL')) {
									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "fgMidRange");
									//								if ( (yardsOnPlay < 4) || (playType > 2) || (this.team[this.d].player[secondTimeDefense[this.d][playerOfType]].pos != 'DL')) {
									//									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "fgMidRange");
								} else {
									for ( i = 11; i < 22; i++) {
										if (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'LB') {
											if (Math.random() < .40) {
												this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");
												i = 22;
											}
										}
										if (i == 21) {
											this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "fgMidRange");
										}
									}
								}

								if (fieldPosition <= 0) {
									playDown = 100;
									this.recordStat(this.d, secondTimeDefense[this.d][playerOfType], "pts", 2);
									p = secondTimeDefense[this.d][playerOfType];
									this.recordPlay("safety", this.d, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								}
							}

							//					    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
						}
						if (timeType == 3) {

							passOrSack = Math.random();

							/*thirdTimeThrough[this.o][k] = tempThrough;
							thirdTimeDefense[this.d][k] = tempDefense;
							thirdTimeOffense[this.o][k] = tempOffense;
							thirdTimeBlocking[this.o][k] = tempBlocking;
							thirdTimeRushing[this.d][k] = tempRushing;
							thirdTimeType[this.o][k] = tempType;*/
							//this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "pts",6);

							if (playType > 2) {
								if (yardsOnPlay == 0) {
									//// typically incomplete
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
									//	this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty",yardsOnPlay);

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "tgts");
									p = thirdTimeOffense[this.o][playerOfType];
									if (thirdTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (thirdTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "dep");
									}
									this.recordPlay("inc", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

								} else if (yardsOnPlay < 0 && passOrSack < .25) {
									//// typically sack
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									if (thirdTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (thirdTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
									}
									if (thirdTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "dep");
									}
									if (thirdTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
									}
									if (fumble == 1) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fbl");
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

										//p= firstTimeOffense[this.o][playerOfType];
										playDown = 1;
										toFirst = 10;
										//p= this.playersOnCourt[this.o][0];
										p = thirdTimeOffense[this.o][playerOfType];

										fieldPosition -= 100;
										fieldPosition *= -1;

										this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

									}
								} else {

									if (interception == 1) {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "inter");
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppinter");
										p = this.playersOnCourt[this.o][0];
										//									console.log("Int happened was Here");
										playDown = 1;
										toFirst = 10;

										fieldPosition -= 100;
										fieldPosition *= -1;

										this.recordPlay("int", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

									} else {
										this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
										this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasc");

										this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

										this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl", yardsOnPlay);
										this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "orb", yardsOnPlay);
										if (thirdTimeBlocking[this.o][playerOfType] < 100) {
											this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olpy", yardsOnPlay);
										}
										if (thirdTimeDefense[this.d][playerOfType] < 100) {
											this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "depy", yardsOnPlay);
											this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "depc");
										}
										this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "ast");
										p = thirdTimeOffense[this.o][playerOfType];
										this.recordPlay("pass", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
										if (fumble == 1) {
											this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "fbl");
											this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
											this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
											this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

											//p= firstTimeOffense[this.o][playerOfType];
											playDown = 1;
											toFirst = 10;
											p = thirdTimeOffense[this.o][playerOfType];
											fieldPosition -= 100;
											fieldPosition *= -1;

											this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
											//   fieldPosition -= 100;
											//	fieldPosition *= -1;

										}
									}
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");

									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "opppasa");
									this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "tgts");

									if (thirdTimeBlocking[this.o][playerOfType] < 100) {
										this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olp");
										this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olrp");
									}
									if (thirdTimeDefense[this.d][playerOfType] < 100) {
										this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "dep");
									}

									/*									this.recordStat(this.o, this.playersOnCourt[this.o][0], "fga");
									 this.recordStat(this.o, this.playersOnCourt[this.o][0], "fg");
									 this.recordStat(this.o, this.playersOnCourt[this.o][0], "stl",yardsOnPlay);

									 this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "tgts");
									 this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "orb",yardsOnPlay);
									 this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "ast");
									 if (thirdTimeBlocking[this.o][playerOfType] <100) {
									 this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olp");
									 }
									 if (thirdTimeBlocking[this.o][playerOfType] <100) {
									 this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olpy",yardsOnPlay);
									 }
									 if (thirdTimeDefense[this.d][playerOfType] <100) {
									 this.recordStat(this.d,thirdTimeDefense[this.d][playerOfType], "dep");
									 }
									 if (thirdTimeDefense[this.d][playerOfType] <100) {
									 this.recordStat(this.d,thirdTimeDefense[this.d][playerOfType], "depy",yardsOnPlay);
									 }
									 p= thirdTimeOffense[this.o][playerOfType];
									 this.recordPlay("pass", this.o, [this.team[this.o].player[p].name],yardsOnPlay,playDown,toFirst,fieldPosition);		 */

								}

							} else {

								this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "drb", yardsOnPlay);
								if (thirdTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olry", yardsOnPlay);
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "prp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "ty", yardsOnPlay);

								this.recordStat(this.o, thirdTimeOffense[this.o][playerOfType], "tov");
								if (thirdTimeBlocking[this.o][playerOfType] < 100) {
									this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olr");
									this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "olrp");
								}
								if (thirdTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "der");
								}
								if (thirdTimeDefense[this.d][playerOfType] < 100) {
									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "dery", yardsOnPlay);
								}
								p = thirdTimeOffense[this.o][playerOfType];
								this.recordPlay("rush", this.o, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								if (fumble == 1) {
									this.recordStat(this.o, firstTimeOffense[this.o][playerOfType], "fbl");
									this.recordStat(this.o, this.playersOnCourt[this.o][0], "turn");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "turnopp");
									this.recordStat(this.d, this.playersOnCourt[this.d][0], "oppfumble");

									//p= firstTimeOffense[this.o][playerOfType];
									playDown = 1;
									toFirst = 10;
									p = thirdTimeOffense[this.o][playerOfType];
									fieldPosition -= 100;
									fieldPosition *= -1;

									this.recordPlay("fumble", this.d, [this.team[this.o].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

								}
							}

							if (playType > 2 && yardsOnPlay < 0 && passOrSack < .25) {

								//							if (playType >2 && yardsOnPlay<0) {

								//		console.log(thirdTimeRushing[this.d][playerOfType]);
								//								console.log("sackPlayer: "+sackPlayer);
								//								console.log("thirdTimeBlocking[this.o][playerOfType]  : "+thirdTimeBlocking[this.o][playerOfType]  );
								//								console.log("thirdTimeRushing[this.d][playerOfType] : "+thirdTimeRushing[this.d][playerOfType]  );

								if (sackPlayer < 100) {
									//								if (thirdTimeRushing[this.d][playerOfType] <100) {
									this.recordStat(this.d, sackPlayer, "fgaMidRange");
									this.recordStat(this.d, sackPlayer, "fgMidRange");
								}
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "tp");
								this.recordStat(this.o, this.playersOnCourt[this.o][0], "syl", -yardsOnPlay);
								//	console.log("thirdTimeBlocking[this.o][playerOfType]: "+thirdTimeBlocking[this.o][playerOfType]);
								//						        if  (thirdTimeBlocking[this.o][playerOfType] < 100) {
								if (gaveUpSack < 100) {
									this.recordStat(this.o, gaveUpSack, "ols");
									//									this.recordStat(this.o, thirdTimeBlocking[this.o][playerOfType], "ols");
								}
								//this.recordStat(this.o, this.playersOnCourt[this.o][0], "blk");
								//// if 100 who records sack?, could split it up
								//						        if  (thirdTimeRushing[this.d][playerOfType] < 100) {
								if (sackPlayer < 100) {
									p = sackPlayer;
									this.recordPlay("sack", this.o, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								} else {
									p = sackPlayer;
									this.recordPlay("sackGroup", this.o, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);

								}

								if (fieldPosition <= 0) {
									//									if  (thirdTimeBlocking[this.o][playerOfType] < 100) {
									//										this.recordStat(this.d,  thirdTimeRushing[this.d][playerOfType], "pts",2);
									//									}
									if (sackPlayer < 100) {
										this.recordStat(this.d, thirdTimeRushing[this.d][playerOfType], "pts", 2);
										p = sackPlayer;
										this.recordPlay("safety", this.d, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
									}
									playDown = 100;

								}
							} else if (playType > 2 && yardsOnPlay == 0) {

							} else if (playType > 2 && interception == 1) {

								this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "intery");
							} else {

								//this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "fgMidRange");

								if ((yardsOnPlay < 4) || (playType > 2)) {

									//									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "fgMidRange");

									if (yardsOnPlay > 15) {
										for ( i = 11; i < 22; i++) {
											if ((this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'S') || (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'CB')) {
												if (Math.random() < .40) {
													this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");
													i = 22;
												}
											}
											if (i == 21) {
												this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "fgMidRange");
											}
										}
									} else {
										this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "fgMidRange");
									}

								} else if ((this.team[this.d].player[thirdTimeDefense[this.d][playerOfType]].pos != 'DL')) {
									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "fgMidRange");
								} else {
									for ( i = 11; i < 22; i++) {
										if (this.team[this.d].player[this.playersOnCourt[this.d][i]].pos == 'LB') {
											if (Math.random() < .40) {
												this.recordStat(this.d, this.playersOnCourt[this.d][i], "fgMidRange");
												i = 22;
											}
										}
										if (i == 21) {
											this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "fgMidRange");
										}
									}
								}

								if (fieldPosition <= 0) {
									playDown = 100;
									this.recordStat(this.d, thirdTimeDefense[this.d][playerOfType], "pts", 2);
									p = thirdTimeDefense[this.d][playerOfType];
									this.recordPlay("safety", this.d, [this.team[this.d].player[p].name], yardsOnPlay, playDown, toFirst, fieldPosition);
								}
							}

							//					    this.recordStat(this.o, this.playersOnCourt[this.o][battingorder[onbase[2]]], "pts");
						}

					}

				} else {

					playDown = 5;
					// if turnover driveActive ==0, if touchdown driveActive = 1,touchdown = 1, fieldGoal = 1;
				}
				//if (this.t>59) {
				//// want to adjust based on run/pass/yards

				//// make based on yards
				//// adjust based on play type
				////		console.log("before: "+this.t)
				////		console.log("yardsOnPlay: "+yardsOnPlay)
				////		console.log("yardsOnPlay/100: "+yardsOnPlay/100)
				timePlay = 0;
				if (yardsOnPlay >= 0) {
					timePlay = Math.random() / 4 + yardsOnPlay / 100 / 2 + .15;
					this.t -= timePlay;
					this.dt += timePlay;
					this.recordStat(this.o, this.playersOnCourt[this.o][0], "top", timePlay);

				} else {
					timePlay = Math.random() / 4 + yardsOnPlay / 100 * -1 + .15;
					this.t -= timePlay;
					this.dt += timePlay;
					this.recordStat(this.o, this.playersOnCourt[this.o][0], "top", timePlay);
					//this.t -= Math.random()/4+yardsOnPlay/100*-1+.15;
					//					this.dt += Math.random()/4+yardsOnPlay/100*-1+.15;
				}
				////		console.log("after: "+this.t)
				////				this.t -= .25

				if (driveNumber[this.o] < 3) {
					//								console.log("this.t: "+this.t+"timeThrough: "+timeThrough+" playType: "+playType+" playerOfType: "+playerOfType+" timeThroughProb: " +timeThroughProb+" playProb: "+playProb+" yardsProb: "+yardsProb+" START AFTER this.o "+this.o+" driveNumber[this.o]: "+driveNumber[this.o]+" yardsOnPlay: "+yardsOnPlay+" fieldPosition: "+fieldPosition+" playDown: "+playDown+" toFirst: "+toFirst);
					/////						console.log(" yardsProb: "+yardsProb+" yardsOnPlay: "+yardsOnPlay+" fieldPosition: "+fieldPosition+" playDown: "+playDown+" toFirst: "+toFirst);
				}

				if ((this.t <= 45 && this.team[0].stat.ptsQtrs.length === 1) || (this.t <= 30 && this.team[0].stat.ptsQtrs.length === 2) || (this.t <= 15 && this.team[0].stat.ptsQtrs.length === 3)) {

					if ((this.t <= 30 && this.team[0].stat.ptsQtrs.length === 2)) {
						this.o = 1 - homeTeam;
						this.d = homeTeam;
						homeTeam = this.d;
						playDown = 5;
						fieldPosition = 150;
					}
					if ((this.t <= 0 && this.team[0].stat.ptsQtrs.length === 4)) {
						this.o = homeTeam;
						this.d = 1 - homeTeam;
						homeTeam = this.o;
						playDown = 5;
						fieldPosition = 150;
					}

					this.team[0].stat.ptsQtrs.push(0);
					this.team[1].stat.ptsQtrs.push(0);
					//  this.t = 15;
					this.recordPlay("quarter");

				}
				if (this.t <= 0) {
					playDown = 5;
				}
				if ((interception == 1) || (fumble == 1)) {
					playDown = 5;
					fieldPosition *= -1;
					fieldPosition += 100;
				}

				//		console.log("points 0: "+this.team[0].stat.ptsQtrs[this.team[0].stat.ptsQtrs.length - 1]);
				//		console.log("points 1: "+this.team[1].stat.ptsQtrs[this.team[1].stat.ptsQtrs.length - 1]);
				if ((this.overtimes > 0) && ((this.team[1].stat.ptsQtrs[this.team[1].stat.ptsQtrs.length - 1] > 0) || (this.team[0].stat.ptsQtrs[this.team[0].stat.ptsQtrs.length - 1] > 0))) {
					this.team[0].stat.ptsQtrs.push(0);
					this.team[1].stat.ptsQtrs.push(0);
					this.t = -5;
					playDown = 5;
					//	fieldPosition = 150;
					//	    console.log("Overtime this.t: "+this.t);
					//	this.recordPlay("quarter");
				}
				/*if (this.t < 0) {
				playDown = 5;
				}*/

				/*	if ( ((quarterActive = 1) && (this.t <45)) ) {
				playDown = 5;
				}										*/

				//(this.t >45) {
				/*	if (((quarterActive = 1) && (this.t <=45)) || ((quarterActive = 2) && (this.t <=30)) || ((quarterActive = 3) && (this.t <=15)) || ((quarterActive = 4) && (this.t <=0))) {
				 playDown = 5;
				 }								*/
			}

			driveActive = 0;
			/////   console.log("number of Plays: "+playNumber);
		}
		//	console.log("drive over: "+driveActive);

		//// stopping basketball sim, all stats now 0
		//// replacing points with football
		//////////////	this.doShot(shooter);

		//        return this.doShot(shooter);  // fg, orb, or drb
	};

	/**
	 * Probability of the current possession ending in a turnover.
	 *
	 * @memberOf core.gameSim
	 * @return {number} Probability from 0 to 1.
	 */
	GameSim.prototype.skillDifferential = function(blockRun, runStop, lineDifferentials, rushingOptions, blockingOptions, blockingRun, rushRun, lineDiffRunOptions) {

		var j, i;

		if (rushingOptions > blockingOptions) {
			lineDiffRunOptions = blockingOptions;
			for ( j = 0; j < blockingOptions; j++) {
				lineDifferentials[this.o][j] = this.team[this.o].player[blockingRun[this.o][j]].compositeRating[blockRun] - this.team[this.d].player[rushRun[this.d][j]].compositeRating[runStop];
				//		console.log("o rush vs d rush: "+this.team[this.o].player[blockingRun[this.o][j]].compositeRating[blockRun]+" "+this.team[this.d].player[rushRun[this.d][j]].compositeRating[runStop]+" "+this.team[this.o].player[blockingRun[this.o][j]].pos+" "+this.team[this.d].player[rushRun[this.d][j]].pos);
			}
			for ( j = blockingOptions; j < rushingOptions; j++) {
				//lineDifferentials = this.team[this.o].player[blockingRun[this.o][j]].compositeRating.blockRun - this.team[this.d].player[rushRun[this.d][j]].compositeRating.runStop;
				for ( i = 0; i < blockingOptions; i++) {
					lineDifferentials[this.o][i] += 0 - this.team[this.d].player[rushRun[this.d][i]].compositeRating[runStop] / blockingOptions;
					//console.log("o rush vs d rush: "+this.team[this.o].player[blockingRun[this.o][j]].compositeRating.blockRun+" "+this.team[this.d].player[rushRun[this.d][j]].compositeRating.runStop+" "+this.team[this.o].player[blockingRun[this.o][j]].pos+" "+this.team[this.d].player[rushRun[this.d][j]].pos);
				}

				//		console.log("o rush vs d rush:  "+this.team[this.d].player[rushRun[this.d][j]].compositeRating[runStop]+" "+this.team[this.d].player[rushRun[this.d][j]].pos);

			}
		} else if (rushingOptions < blockingOptions) {
			lineDiffRunOptions = rushingOptions;
			for ( j = 0; j < rushingOptions; j++) {
				lineDifferentials[this.o][j] = this.team[this.o].player[blockingRun[this.o][j]].compositeRating[blockRun] - this.team[this.d].player[rushRun[this.d][j]].compositeRating.runStop;
				//		console.log("o rush vs d rush: "+this.team[this.o].player[blockingRun[this.o][j]].compositeRating[blockRun]+" "+this.team[this.d].player[rushRun[this.d][j]].compositeRating.runStop+" "+this.team[this.o].player[blockingRun[this.o][j]].pos+" "+this.team[this.d].player[rushRun[this.d][j]].pos);
			}
			for ( j = rushingOptions; j < blockingOptions; j++) {
				//lineDifferentials = this.team[this.o].player[blockingRun[this.o][j]].compositeRating.blockRun - this.team[this.d].player[rushRun[this.d][j]].compositeRating.runStop;
				//	console.log("o rush vs d rush: "+this.team[this.o].player[blockingRun[this.o][j]].compositeRating[blockRun]+" "+this.team[this.o].player[blockingRun[this.o][j]].pos);
				for ( i = 0; i < rushingOptions; i++) {
					lineDifferentials[this.o][i] += this.team[this.o].player[blockingRun[this.o][i]].compositeRating[blockRun] / rushingOptions;
					//console.log("o rush vs d rush: "+this.team[this.o].player[blockingRun[this.o][j]].compositeRating.blockRun+" "+this.team[this.d].player[rushRun[this.d][j]].compositeRating.runStop+" "+this.team[this.o].player[blockingRun[this.o][j]].pos+" "+this.team[this.d].player[rushRun[this.d][j]].pos);
				}

			}
		} else {
			lineDiffRunOptions = rushingOptions;
			for ( j = 0; j < rushingOptions; j++) {
				lineDifferentials[this.o][j] = this.team[this.o].player[blockingRun[this.o][j]].compositeRating[blockRun] - this.team[this.d].player[rushRun[this.d][j]].compositeRating[runStop];
				//		console.log("o rush vs d rush: "+this.team[this.o].player[blockingRun[this.o][j]].compositeRating[blockRun]+" "+this.team[this.d].player[rushRun[this.d][j]].compositeRating[runStop]+" "+this.team[this.o].player[blockingRun[this.o][j]].pos+" "+this.team[this.d].player[rushRun[this.d][j]].pos);
			}

		}
		lineDiffRunOptions = rushingOptions;

		/*	for (j = 0; j < 11; j++) {
		 console.log("o rush vs d rush: "+lineDifferentials[this.o][j]);
		 }		*/

		return;
		//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
	};

	/**
	 * Probability of the current possession ending in a turnover.
	 *
	 * @memberOf core.gameSim
	 * @return {number} Probability from 0 to 1.
	 */
	GameSim.prototype.rushingYards = function(yardsProb) {

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
		} else {
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
	GameSim.prototype.passingYards = function(yardsProb) {

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
		} else {
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
	GameSim.prototype.sortSkill = function(runningOptions, compareRunPower, runningPower) {

		var j, i, k, tempVar;

		/*			for (j = 0; j < runningOptions; j++) {
		i = runningDetailed[this.o][j];
		compareRunPower[j] = this.team[this.o].player[i].compositeRating.runningPower;
		compareRunSide[j] = this.team[this.o].player[i].compositeRating.runningSide;
		console.log("compareRunPower[j]: "+compareRunPower[j]);
		//console.log("compareRunSide[j]: "+compareRunSide[j]);

		}
		for (j = 0; j < runningOptions; j++) {
		i = runningDetailed[this.o][j];
		console.log("compareRunSide[j]: "+compareRunSide[j]);
		}			*/

		//// sort and give location
		for ( j = 0; j < runningOptions; j++) {
			for ( k = j; k < runningOptions; k++) {

				//i = runningDetailed[this.o][j];

				if (compareRunPower[j] < compareRunPower[k]) {
					tempVar = compareRunPower[j];
					compareRunPower[j] = compareRunPower[k];
					compareRunPower[k] = tempVar;
					tempVar = runningPower[this.o][j];
					runningPower[this.o][j] = runningPower[this.o][k];
					runningPower[this.o][k] = tempVar;
				}
			}
		}

		/*	for (j = 0; j < runningOptions; j++) {
		 //console.log("after : "+compareRunPower[j]+" after : "+runningPower[this.o][j]);
		 }		*/

		return;
		//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
	};

	/**
	 * Probability of the current possession ending in a turnover.
	 *
	 * @memberOf core.gameSim
	 * @return {number} Probability from 0 to 1.
	 */
	GameSim.prototype.sortSkillDefense = function(runningOptions, compareRunPower, runningPower) {

		var j, i, k, tempVar;

		/*			for (j = 0; j < runningOptions; j++) {
		i = runningDetailed[this.o][j];
		compareRunPower[j] = this.team[this.o].player[i].compositeRating.runningPower;
		compareRunSide[j] = this.team[this.o].player[i].compositeRating.runningSide;
		console.log("compareRunPower[j]: "+compareRunPower[j]);
		//console.log("compareRunSide[j]: "+compareRunSide[j]);

		}
		for (j = 0; j < runningOptions; j++) {
		i = runningDetailed[this.o][j];
		console.log("compareRunSide[j]: "+compareRunSide[j]);
		}			*/

		//// sort and give location
		for ( j = 0; j < runningOptions; j++) {
			for ( k = j; k < runningOptions; k++) {

				//i = runningDetailed[this.o][j];

				if (compareRunPower[j] < compareRunPower[k]) {
					tempVar = compareRunPower[j];
					compareRunPower[j] = compareRunPower[k];
					compareRunPower[k] = tempVar;
					tempVar = runningPower[this.d][j];
					runningPower[this.d][j] = runningPower[this.d][k];
					runningPower[this.d][k] = tempVar;
				}
			}
		}

		/*	for (j = 0; j < runningOptions; j++) {
		 console.log("after : "+compareRunPower[j]+" after : "+runningPower[this.d][j]);
		 }		*/

		return;
		//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
	};

	/**
	 * Probability of the current possession ending in a turnover.
	 *
	 * @memberOf core.gameSim
	 * @return {number} Probability from 0 to 1.
	 */
	GameSim.prototype.dDown = function() {

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

		return;
		//        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
	};

	/**
	 * Probability of the current possession ending in a turnover.
	 *
	 * @memberOf core.gameSim
	 * @return {number} Probability from 0 to 1.
	 */
	GameSim.prototype.probTov = function() {
		return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
	};

	/**
	 * Turnover.
	 *
	 * @memberOf core.gameSim
	 * @return {string} Either "tov" or "stl" depending on whether the turnover was caused by a steal or not.
	 */
	GameSim.prototype.doTov = function() {
		var p, ratios;

		ratios = this.ratingArray("turnovers", this.o, 0.5);
		p = this.playersOnCourt[this.o][this.pickPlayer(ratios)];
		this.recordStat(this.o, p, "tov");
		if (this.probStl() > Math.random()) {
			return this.doStl(p);
			// "stl"
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
	GameSim.prototype.probStl = function() {
		return 0.55 * this.team[this.d].compositeRating.defensePerimeter / (0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
	};

	/**
	 * Steal.
	 *
	 * @memberOf core.gameSim
	 * @return {string} Currently always returns "stl".
	 */
	GameSim.prototype.doStl = function(pStoleFrom) {
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
	GameSim.prototype.doShot = function(shooter) {
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
			r2 = Math.random() * (this.team[this.o].player[p].compositeRating.shootingAtRim + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def));
			// Synergy makes easy shots either more likely or less likely
			r3 = Math.random() * (this.team[this.o].player[p].compositeRating.shootingLowPost + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def));
			// Synergy makes easy shots either more likely or less likely
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
			return this.doBlk(shooter, type);
			// orb or drb
		}

		// Make
		if (probMake > Math.random()) {
			// And 1
			if (probAndOne > Math.random()) {
				return this.doFg(shooter, passer, type, true);
				// fg, orb, or drb
			}
			return this.doFg(shooter, passer, type);
			// fg
		}

		// Miss, but fouled
		if (probMissAndFoul > Math.random()) {
			if (type === "threePointer") {
				return this.doFt(shooter, 3);
				// fg, orb, or drb
			}
			return this.doFt(shooter, 2);
			// fg, orb, or drb
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
		return this.doReb();
		// orb or drb
	};

	/**
	 * Probability that a shot taken this possession is blocked.
	 *
	 * @memberOf core.gameSim
	 * @return {number} Probability from 0 to 1.
	 */
	GameSim.prototype.probBlk = function() {
		return 0.1 * this.team[this.d].compositeRating.blocking;
	};

	/**
	 * Blocked shot.
	 *
	 * @memberOf core.gameSim
	 * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
	 * @return {string} Output of this.doReb.
	 */
	GameSim.prototype.doBlk = function(shooter, type) {
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

		return this.doReb();
		// orb or drb
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
	GameSim.prototype.doFg = function(shooter, passer, type, andOne) {
		var p;

		p = this.playersOnCourt[this.o][shooter];
		this.recordStat(this.o, p, "fga");
		this.recordStat(this.o, p, "fg");
		this.recordStat(this.o, p, "pts", 2);
		// 2 points for 2's
		if (type === "atRim") {
			this.recordStat(this.o, p, "fgaAtRim");
			this.recordStat(this.o, p, "fgAtRim");
			this.recordPlay("fgAtRim" + ( andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
		} else if (type === "lowPost") {
			this.recordStat(this.o, p, "fgaLowPost");
			this.recordStat(this.o, p, "fgLowPost");
			this.recordPlay("fgLowPost" + ( andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
		} else if (type === "midRange") {
			this.recordStat(this.o, p, "fgaMidRange");
			this.recordStat(this.o, p, "fgMidRange");
			this.recordPlay("fgMidRange" + ( andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
		} else if (type === "threePointer") {
			this.recordStat(this.o, p, "pts");
			// Extra point for 3's
			this.recordStat(this.o, p, "tpa");
			this.recordStat(this.o, p, "tp");
			this.recordPlay("tp" + ( andOne ? "AndOne" : ""), this.o, [this.team[this.o].player[p].name]);
		}

		if (passer >= 0) {
			p = this.playersOnCourt[this.o][passer];
			this.recordStat(this.o, p, "ast");
			this.recordPlay("ast", this.o, [this.team[this.o].player[p].name]);
		}

		if (andOne) {
			return this.doFt(shooter, 1);
			// fg, orb, or drb
		}
		return "fg";
	};

	/**
	 * Probability that a shot taken this possession is assisted.
	 *
	 * @memberOf core.gameSim
	 * @return {number} Probability from 0 to 1.
	 */
	GameSim.prototype.probAst = function() {
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
	GameSim.prototype.doFt = function(shooter, amount) {
		var i, outcome, p;

		this.doPf(this.d);
		p = this.playersOnCourt[this.o][shooter];
		for ( i = 0; i < amount; i++) {
			this.recordStat(this.o, p, "fta");
			if (Math.random() < this.team[this.o].player[p].compositeRating.shootingFT * 0.3 + 0.6) {// Between 60% and 90%
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
			outcome = this.doReb();
			// orb or drb
		}

		return outcome;
	};

	/**
	 * Personal foul.
	 *
	 * @memberOf core.gameSim
	 * @param {number} t Team (0 or 1, this.or or this.d).
	 */
	GameSim.prototype.doPf = function(t) {
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
	GameSim.prototype.doReb = function() {
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
	GameSim.prototype.ratingArray = function(rating, t, power) {
		var array, i, p;

		power = power !== undefined ? power : 1;

		array = [0, 0, 0, 0, 0];
		for ( i = 0; i < 5; i++) {
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
	GameSim.prototype.pickPlayer = function(ratios, exempt) {
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
	GameSim.prototype.recordStat = function(t, p, s, amt) {
		amt = amt !== undefined ? amt : 1;
		//     this.team[t].player[p].stat[s] += amt;
		if (s !== "gs" && s !== "courtTime" && s !== "benchTime" && s !== "energy") {
			this.team[t].stat[s] += amt;
			// Record quarter-by-quarter scoring too
			if (s === "pts") {
				this.team[t].stat.ptsQtrs[this.team[t].stat.ptsQtrs.length - 1] += amt;
			}
			if (this.playByPlay !== undefined) {
				this.playByPlay.push({
					type : "stat",
					qtr : this.team[t].stat.ptsQtrs.length - 1,
					t : t,
					p : p,
					s : s,
					amt : amt
				});
			}
		}
	};

	GameSim.prototype.recordPlay = function(type, t, names, yardsOnPlay, down, yardToGo, fieldPosition) {
		var i, qtr, sec, text, texts;
		var tAdj;
		var fieldPositionSide, fieldPositionAdj;

		if (fieldPosition >= 50) {
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
			} else if (type === "ep") {
				texts = ["{0} made the extra point"];
			} else if (type === "epm") {
				texts = ["{0} missed the extra point"];
			} else if (type === "punt") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + " , {0} punted the ball for " + yardsOnPlay + " yards"];
			} else if (type === "puntTouch") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + " , {0} punted the ball into the endzone for a touchback"];
			} else if (type === "kickoff") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + " , {0} kicked off the ball for " + yardsOnPlay + " yards"];
			} else if (type === "kickoffTouch") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + " , {0} kicked off the ball into the endzone for a touchback"];
			} else if (type === "fg") {
				texts = ["{0} made a field goal from " + yardsOnPlay + " yards out"];
			} else if (type === "fgm") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + " , {0} missed a field goal from " + yardsOnPlay + " yards out"];
			} else if (type === "pass") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + ", {0} caught the ball for " + yardsOnPlay + " yards"];
			} else if (type === "rush") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + ", {0} ran the ball for " + yardsOnPlay + " yards"];
			} else if (type === "passTD") {
				texts = ["{0} caught the ball for " + yardsOnPlay + " yards and scored a touchdown"];
			} else if (type === "rushTD") {
				texts = ["{0} ran the ball for " + yardsOnPlay + " yards and scored a touchdown"];
			} else if (type === "sack") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + ", {0} sacked the QB for a loss of " + yardsOnPlay + " yards"];
			} else if (type === "sackGroup") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + ", QB sacked for a loss of " + yardsOnPlay + " yards"];
			} else if (type === "int") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + ", {0} threw an <b>interception</b>"];
			} else if (type === "fumble") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + ", {0} <b>fumbled</b>"];
			} else if (type === "safety") {
				texts = ["Safety, defense scores two"];
			} else if (type === "inc") {
				texts = ["(" + down + "-" + yardToGo + ") on " + fieldPositionSide + " " + fieldPositionAdj + ", incomplete pass to {0}"];
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
			} else if (type === "overtime") {
				texts = ["<b>Start of " + helpers.ordinal(this.team[0].stat.ptsQtrs.length - 4) + " overtime period</b>"];
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

			if (texts) {
				//text = random.choice(texts);
				text = texts[0];
				if (names) {
					for ( i = 0; i < names.length; i++) {
						text = text.replace("{" + i + "}", names[i]);
					}
				}

				if (type === "ast") {
					// Find most recent made shot, count assist for it
					for ( i = this.playByPlay.length - 1; i >= 0; i--) {
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

					if ((this.team[0].stat.ptsQtrs.length == 4) || (this.overtimes > 0)) {
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
						type : "text",
						text : text,
						t : t,
						time : Math.floor(tAdj) + ":" + sec
						//                        time: Math.floor(this.t) + ":" + sec
					});
				}
			} else {
				console.log("No text for " + type);
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
	GameSim.prototype.fatigue = function(energy) {
		energy += 0.05;
		if (energy > 1) {
			energy = 1;
		}

		return energy;
	};

	return {
		GameSim : GameSim
	};
}); 