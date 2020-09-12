// @flow

import {g, helpers} from '../../common';
//import _ from 'underscore';
import {idb} from '../db'; // temporary to test champion data
import {random,toUI} from '../util';
import type {PlayerSkill} from '../../common/types';

//import {promiseWorker} from '../util';
//import type {Conditions} from '../../common/types';


	var championsList = [[0,0,0,0,0],[0,0,0,0,0]];
	var championsListPatch = [[0,0,0,0,0],[0,0,0,0,0]];
	var champRatings = [[{},{},{},{},{}],[{},{},{},{},{}]];
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

	var championData;
	var firstBlood = true;
	var riftKilled = false;
	var riftTimer = 0;

type PlayType = 'ast' | 'blkAtRim' | 'blkLowPost' | 'blkMidRange' | 'blkTp' | 'drb' | 'fgAtRim' | 'fgAtRimAndOne' | 'fgLowPost' | 'fgLowPostAndOne' | 'fgMidRange' | 'fgMidRangeAndOne' | 'foulOut' | 'ft' | 'injury' | 'missAtRim' | 'missFt' | 'missLowPost' | 'missMidRange' | 'missTp' | 'orb' | 'overtime' | 'pf' | 'quarter' | 'stl' | 'sub' | 'tov' | 'tp' | 'tpAndOne';
type ShotType = 'atRim' | 'ft' | 'lowPost' | 'midRange' | 'threePointer';
type Stat = 'ast' | 'ba' | 'benchTime' | 'blk' | 'courtTime' | 'drb' | 'energy' | 'fg' | 'fgAtRim' | 'fgLowPost' | 'fgMidRange' | 'fga' | 'fgaAtRim' | 'fgaLowPost' | 'fgaMidRange' | 'ft' | 'fta' | 'gs' | 'min' | 'orb' | 'pf' | 'pts' | 'stl' | 'tov' | 'tp' | 'tpa';
type PlayerNumOnCourt = 0 | 1 | 2 | 3 | 4;
type TeamNum = 0 | 1;
type CompositeRating = 'blocking' | 'fouling' | 'passing' | 'rebounding' | 'stealing' | 'turnovers' | 'usage';


type PlayerGameSim = {
    id: number,
    name: string,
    pos: string,
    valueNoPot: number,
    stat: Object,
    compositeRating: Object,
    skills: PlayerSkill[],
    injured: boolean,
    ptModifier: number,
};
type TeamGameSim = {
    id: number,
    defense: number, // overall team defensive rating
    pace: number, // mean number of possessions the team likes to have in a game
    stat: Object,
    compositeRating: Object,
    player: PlayerGameSim[],
    compositeRating: Object,
	champ2Rel: Object,
	championRank: Object,
    synergy: {
        def: number,
        off: number,
        reb: number,
    },
};

// x is value, a controls sharpness, b controls center
const sigmoid = (x: number, a: number, b: number): number => {
    return 1 / (1 + Math.exp(-(a * (x - b))));
};

/**
 * Pick a player to do something.
 *
 * @param {Array.<number>} ratios output of this.ratingArray.
 * @param {number} exempt An integer representing a player that can't be picked (i.e. you can't assist your own shot, which is the only current use of exempt). The value of exempt ranges from 0 to 4, corresponding to the index of the player in this.playersOnCourt. This is *NOT* the same value as the player ID *or* the index of the this.team[t].player list. Yes, that's confusing.
 */
const pickPlayer = (ratios: [number, number, number, number, number], exempt?: PlayerNumOnCourt): PlayerNumOnCourt => {
    if (exempt !== undefined) {
        ratios[exempt] = 0;
    }

    const rand = Math.random() * (ratios[0] + ratios[1] + ratios[2] + ratios[3] + ratios[4]);

    let pick;
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
 * Convert energy into fatigue, which can be multiplied by a rating to get a fatigue-adjusted value.
 *
 * @param {number} energy A player's energy level, from 0 to 1 (0 = lots of energy, 1 = none).
 * @return {number} Fatigue, from 0 to 1 (0 = lots of fatigue, 1 = none).
 */
const fatigue = (energy: number): number => {
    energy += 0.05;
    if (energy > 1) {
        energy = 1;
    }

    return energy;
};

class GameSim {
    id: number;
    team: [TeamGameSim, TeamGameSim];
    dt: number;
    playersOnCourt: [[number, number, number, number, number], [number, number, number, number, number]];
    startersRecorded: boolean;
    subsEveryN: number;
    overtimes: number;
    t: number;
    synergyFactor: number;
    lastScoringPlay: {
        team: number,
        player: number,
        type: ShotType,
        time: number,
    }[];
    clutchPlays: ({
        type: 'playerFeat',
        text: string,
        showNotification: boolean,
        pids: [number],
        tids: [number],
    } | {
        type: 'playerFeat',
        tempText: string,
        showNotification: boolean,
        pids: [number],
        tids: [number],
    })[];
    o: TeamNum;
    d: TeamNum;
    playByPlay: Object[];

    /**
     * Initialize the two teams that are playing this game.
     *
     * When an instance of this class is created, information about the two teams is passed to GameSim. Then GameSim.run will actually simulate a game and return the results (i.e. stats) of the simulation. Also see core.game where the inputs to this function are generated.
     */
    constructor(picksBans, gid: number, team1: TeamGameSim, team2: TeamGameSim, doPlayByPlay: boolean) {
        if (doPlayByPlay) {
            this.playByPlay = [];
        }

        this.id = gid;




		/*let schedule = await idb.cache.schedule.getAll();
		let undrafted = await idb.cache.champions.getAll();
		let patch = await idb.cache.championPatch.getAll();

		var teamHome;
		var teamAway;

		let i;
		let ii;
		let usersGame;
		let drafted;

		for (ii = 0; ii < undrafted.length; ii++) {
			let early =  undrafted[ii].ratings.early;
			let mid =  undrafted[ii].ratings.mid;
			let late  =  undrafted[ii].ratings.late;
			if (early>mid && early>late) {
				undrafted[ii].ratings.earlyMidLate = "Early";
			} else if (mid>early && mid>late) {
				undrafted[ii].ratings.earlyMidLate = "Mid";
			} else {
				undrafted[ii].ratings.earlyMidLate = "Late";
			}
			undrafted[ii].lane = "";
			for (i = 0; i < patch.length; i++) {
		//		console.log(i+" "+patch.length+" "+ii+" "+undrafted.length+" "+patch[i].champion+" "+undrafted[ii].name);
			  if (patch[i].champion == undrafted[ii].name) {
				  if (undrafted[ii].lane.length == 0) {
					undrafted[ii].lane += patch[i].role;
				  } else {
					undrafted[ii].lane += " ";
					undrafted[ii].lane += patch[i].role;
				  }

			  }
			}
		}



		for (i = 0; i < schedule.length; i++) {
				schedule[i].champions = {undrafted: undrafted};

				usersGame = helpers.deepCopy(schedule[i]);


				teamHome = await idb.cache.players.indexGetAll(
						"playersByTid",
						usersGame.homeTid,
					);

				teamAway = await idb.cache.players.indexGetAll(
						"playersByTid",
						usersGame.awayTid,
					);

				drafted = [];

				drafted = await draft.setDraftOrder(drafted,usersGame);

				schedule[i].champions.drafted = drafted;
				schedule[i].champions.patch = patch;
				schedule[i].teamHome = teamHome;
				schedule[i].teamAway = teamAway;
				ii = i;
				schedule[ii] = 	helpers.deepCopy(schedule[ii]);
		}	*/






	//	console.log(team1);
	//	console.log(team2);
		team1.draft = picksBans;
		team2.draft = picksBans;

        this.team = [team1, team2]; // If a team plays twice in a day, this needs to be a deep copy
		//console.log(this.team);
//        const numPossessions = Math.round((this.team[0].pace + this.team[1].pace) / 2 * random.uniform(0.9, 1.1));
        const numPossessions = 1;
        //this.dt = 48 / (2 * numPossessions); // Time elapsed per possession
		this.dt = Math.random()*100/4/1.2;

        // Starting lineups, which will be reset by updatePlayersOnCourt. This must be done because of injured players in the top 5.
        this.playersOnCourt = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]];
        this.startersRecorded = false; // Used to track whether the *real* starters have been recorded or not.
       // this.updatePlayersOnCourt();

        this.subsEveryN = 6; // How many possessions to wait before doing substitutions

        this.overtimes = 0; // Number of overtime periods that have taken place

        //this.t = g.quarterLength; // Game clock, in minutes
		this.t = 0; // Game clock, in minutes

		this.team[0].stat.ptsQtrs = [0,0,0,0,0,0,0,0];
		this.team[1].stat.ptsQtrs = [0,0,0,0,0,0,0,0];

		this.team[0].ban = [{ban:""},{ban:""},{ban:""},{ban:""},{ban:""}];
		this.team[1].ban = [{ban:""},{ban:""},{ban:""},{ban:""},{ban:""}];

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
		firstBlood = true;
		riftKilled = false;
		riftTimer = 0;

		this.updateTeamCompositeRatings();

        // Parameters
        this.synergyFactor = 0.1; // How important is synergy?

		// choosing champions
        this.homeCourtAdvantage();

        this.lastScoringPlay = [];
        this.clutchPlays = [];
    }

    /**
     * Home court advantage.
     *
     * Scales composite ratings, giving home players bonuses and away players penalties.
     *
     */
  /*  homeCourtAdvantage() {
        for (let t = 0; t < 2; t++) {
            let factor;
            if (t === 0) {
                factor = 1.01; // Bonus for home team
            } else {
                factor = 0.99; // Penalty for away team
            }

            for (let p = 0; p < this.team[t].player.length; p++) {
                for (const r of Object.keys(this.team[t].player[p].compositeRating)) {
                    this.team[t].player[p].compositeRating[r] *= factor;
                }
            }
        }
    }*/


    /**
     * Home court advantage.
     *
     * Scales composite ratings, giving home players bonuses and away players penalties.
     *
     * @memberOf core.gameSim
     */
//    GameSim.prototype.homeCourtAdvantage = function () {
    homeCourtAdvantage() {
        var factor, p, r, t,b,d,c,tBan;

		//// turn this into choosing Champions

		var topChampion, topPlayer,topValue,  c,p;
		var topValueCompare;
		var oppt;
		var pp, pp2;
		var positionBonus,positionBonusDefense,ovrAdjustment,over50OVR;

		var blockedChampions = [ [],[]];
		var usedChampions = [ [],[]];
		var usedPlayer = [ [],[]];

		var pick;
		var doPicks;
		var champLocation;

		if (this.team[0].draft.champions == undefined) {
			doPicks = true;
		} else if (this.team[0].draft.champions.drafted[19].draft.name == undefined) { // check last pick and not first
			doPicks = true;
		} else {
			doPicks = false;
		}

		if (doPicks) {

			this.team[0].draft.champions.patch = this.team[0].championRank;
			this.team[0].draft.champions.undrafted = this.team[0].champ2Rel;


			let playersAIHome = helpers.deepCopy(this.team[0].player);//usersGame.teamAway);
			let playersAIAway = helpers.deepCopy(this.team[1].player); //(usersGame.teamHome);

			let playersUsedAway = [];
			let playersUsedHome = [];
			let playersUsed = [];

			for ( let i = 0; i < 20; i++) {
			//	console.log("NEW ROUND");
			//	console.log(i);
				let allPossiblePicks = [];
				let playersUsed;
				let playersAI;
			//this.team[0].draft.champions.drafted[i].draft.pick == "PICK"
			     let idSame = false;
			     if (this.team[0].id == this.team[0].draft.champions.drafted[i].draft.tid) {
					 idSame = true;
				 }
			     let isPick = false;
			     if (this.team[0].draft.champions.drafted[i].draft.pick == "PICK") {
					 isPick = true;
				 }
//				if ((this.team[0].id == this.team[0].draft.champions.drafted[i].draft.tid && this.team[0].draft.champions.drafted[i].draft.pick == "PICK") ||) {
				if ( (idSame && isPick) || (!idSame && !isPick) ) {
					t = 0;
					playersUsed = playersUsedHome;
					playersAI = helpers.deepCopy(playersAIHome);
					tBan= 1;
				} else {
					t = 1;
					playersUsed = playersUsedAway;
					playersAI =  helpers.deepCopy(playersAIAway);
					tBan= 0;
				}

					//console.log(playersAI);
				//	console.log(playersUsed);
				//	console.log(this.team[0].draft.champions);
				for (let iv = 0; iv < 5; iv++) {
					// check if player has picked before
				//	console.log(iv);
					//console.log(playersUsed);
				//	console.log(playersAI);
				//	console.log(playersAI[iv]);
				//	console.log(this.team[0].draft.champions);
				//	console.log(allPossiblePicks);

					if (playersUsed.includes(iv)) {
					//	console.log(iv);
					} else {
						for (let v = 0; v < playersAI[iv].champions.length; v++) {
							for (let vi = 0; vi < this.team[0].draft.champions.undrafted.length; vi++) {
								if (this.team[0].draft.champions.undrafted[vi].name == playersAI[iv].champions[v].name) {
									//console.log(iv+" "+this.team[0].draft.champions.undrafted[vi].name+" "+ playersAI[iv].champions[v].name);
									for (let vii = 0; vii < this.team[0].draft.champions.patch.length; vii++) {
									//console.log(iv+" "+this.team[0].draft.champions.undrafted[vi].name+" "+ this.team[0].draft.champions.patch[vii].champion +" "+ playersAI[iv].pos+" "+this.team[0].draft.champions.patch[vii].role);
									let role = this.team[0].draft.champions.patch[vii].role;
									if (role == "SAFE") {
										if (Math.random() < .5) {
											role = "SUP";
										} else {
										role = "ADC";
										}
									} else if (role == "OFF") {
										role = "TOP";
									} else if (role == "ROAM") {
										role = "JGL";
									}


										if (this.team[0].draft.champions.undrafted[vi].name == this.team[0].draft.champions.patch[vii].champion &&  playersAI[iv].pos == role) {

								//	console.log(iv+" "+this.team[0].draft.champions.undrafted[vi].name+" "+ this.team[0].draft.champions.patch[vii].champion +" "+ playersAI[iv].pos+" "+this.team[0].draft.champions.patch[vii].role);
											// add role?
											// safe player/role

											let possiblePick = playersAI[iv].champions[v];
											possiblePick.player = iv;
											possiblePick.rosterOrder = playersAI[iv].rosterOrder;
											possiblePick.posPlayer = playersAI[iv].pos;

											possiblePick.hid = this.team[0].draft.champions.undrafted[vi].hid;
											possiblePick.cpid = this.team[0].draft.champions.patch[vii].cpid;
											possiblePick.name = this.team[0].draft.champions.undrafted[vi].name;
											possiblePick.nameReal = this.team[0].draft.champions.undrafted[vi].nameReal;
											possiblePick.synergy = this.team[0].draft.champions.undrafted[vi].ratings.synergy;
											possiblePick.counter = this.team[0].draft.champions.undrafted[vi].ratings.counter;

											possiblePick.name = this.team[0].draft.champions.undrafted[vi].name;
											possiblePick.undraftedLocation = vi;
											allPossiblePicks.push(possiblePick);
										}
									}
								}
								// then do patch?, then include all matches
							}
						}
					}
				//	console.log(allPossiblePicks);

				}

				// now do champion synergy and counter adjustments?
				// doesn't apply for first pick

				for (let p = 0; p < allPossiblePicks.length; p++) {
					for (let d = 0; d < i; d++) {
						// don't count synergy and counter data for banned champs
						if (this.team[0].draft.champions.drafted[d].draft.pick == "BAN") {
						} else {
							// synergy and counter for champs picked for either team
							if (this.team[0].draft.champions.drafted[d].draft.tid == this.team[0].draft.champions.drafted[i].draft.tid) {
								// do synergy
								if (allPossiblePicks[p].synergy[this.team[0].draft.champions.drafted[d].draft.hid] == undefined) {
								//	console.log("what to do if undefined?");
								} else {
									allPossiblePicks[p].draftValue +=  allPossiblePicks[p].synergy[this.team[0].draft.champions.drafted[d].draft.hid];
								}
							} else {
								if (allPossiblePicks[p].counter[this.team[0].draft.champions.drafted[d].draft.hid] == undefined) {
								//	console.log("what to do if undefined?");
								} else {
									allPossiblePicks[p].draftValue +=  allPossiblePicks[p].counter[this.team[0].draft.champions.drafted[d].draft.hid];
								}
								// do counter
							}
						}
					}
				}

				// for future
				// now do early/mid/late game checking (in case imbalanced)
				// now do melee ranged checks?
				// other balance checks before sorting values

				allPossiblePicks.sort((a, b) => b.draftValue - a.draftValue);

//				let difficulty = 3;
				let difficulty = g.aiPickBanStrength;
				if (g.userTids.includes(this.team[0].draft.champions.drafted[i].draft.tid) && (g.GMCoachType > 0) ) {
					difficulty = allPossiblePicks.length-1;
				}

				let pickLocation = random.randInt(0, difficulty);
			//	 pickLocation = 0; // for testing
				if (allPossiblePicks.length <= pickLocation) {
					pickLocation = allPossiblePicks.length-1;
				}

				if (this.team[0].draft.champions.drafted[i].draft.pick == "PICK") {
					// make this a game option, varying levels of coach mode challenge
				//	console.log(playersUsed);
				////	console.log(allPossiblePicks);
				//	console.log(pickLocation);
				//	console.log(allPossiblePicks[pickLocation]);

					playersUsed.push(allPossiblePicks[pickLocation].player);
				//	console.log("PICK");
				}

				// sort to get highest available champ with remaining players
				let pid = allPossiblePicks[pickLocation].player;
				// inputting new champ
				let ii = pid;



				this.team[0].draft.champions.drafted[i].pid = pid;

				this.team[0].draft.champions.drafted[i].draft.hid = allPossiblePicks[pickLocation].hid;
				this.team[0].draft.champions.drafted[i].draft.cpid = allPossiblePicks[pickLocation].cpid;
				this.team[0].draft.champions.drafted[i].draft.synergy = allPossiblePicks[pickLocation].synergy;
				this.team[0].draft.champions.drafted[i].draft.counter = allPossiblePicks[pickLocation].counter;
				this.team[0].draft.champions.drafted[i].draft.name =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].name;
				this.team[0].draft.champions.drafted[i].draft.nameReal =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].nameReal;
				this.team[0].draft.champions.drafted[i].draft.posPlayer = allPossiblePicks[pickLocation].posPlayer;
				this.team[0].draft.champions.drafted[i].draft.rosterOrder = allPossiblePicks[pickLocation].rosterOrder;
				this.team[0].draft.champions.drafted[i].draft.role =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].role;
				this.team[0].draft.champions.drafted[i].draft.lane =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].lane;
				this.team[0].draft.champions.drafted[i].draft.ratings  = {};
				this.team[0].draft.champions.drafted[i].draft.ratings.MR =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.MR;
				this.team[0].draft.champions.drafted[i].draft.ratings.ability2 =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.ability2;
				this.team[0].draft.champions.drafted[i].draft.ratings.defense2 =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.defense2;
				this.team[0].draft.champions.drafted[i].draft.ratings.attack2 = this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.attack2;
				this.team[0].draft.champions.drafted[i].draft.ratings.control =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.control;
				this.team[0].draft.champions.drafted[i].draft.ratings.damage =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.damage;
				this.team[0].draft.champions.drafted[i].draft.ratings.mobility =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.mobility;
				this.team[0].draft.champions.drafted[i].draft.ratings.toughness =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.toughness;
				this.team[0].draft.champions.drafted[i].draft.ratings.utility =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.utility;
				this.team[0].draft.champions.drafted[i].draft.ratings.damageType =  this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.damageType;
				let early =   this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.early;
				let mid =   this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.mid;
				let late  =   this.team[0].draft.champions.undrafted[allPossiblePicks[pickLocation].undraftedLocation].ratings.late;
				if (early>mid && early>late) {
					 this.team[0].draft.champions.drafted[i].draft.ratings.earlyMidLate = "Early";
				} else if (mid>early && mid>late) {
					 this.team[0].draft.champions.drafted[i].draft.ratings.earlyMidLate = "Mid";
				} else {
					 this.team[0].draft.champions.drafted[i].draft.ratings.earlyMidLate = "Late";
				}

				 this.team[0].draft.champions.drafted[i].draft.cpid = allPossiblePicks[pickLocation].cpid;
				 this.team[0].draft.champions.drafted[i].draft.draftValue = allPossiblePicks[pickLocation].draftValue;
				 this.team[0].draft.champions.undrafted.splice(allPossiblePicks[pickLocation].undraftedLocation, 1);

				champRatings[t][pid] = 	this.team[0].draft.champions.drafted[i].draft;

				p = this.team[t].draft.champions.drafted[i].pid;

				let draftValue = this.team[t].draft.champions.drafted[i].draft.draftValue;
				let champLocation = this.team[t].draft.champions.drafted[i].draft.hid;
				let champLocation1 = this.team[t].draft.champions.drafted[i].draft.cpid;

				c = this.team[t].draft.champions.drafted[i].draft.name;

				if (this.team[t].draft.champions.drafted[i].draft.pick == "BAN") {
					this.recordStat(tBan, this.team[t].draft.champions.drafted[i].draft.round-1, "ban",c);
					this.recordPlay("ban", tBan, [c]);
				} else {
					this.recordStat(t, p, "champPicked",c);
					this.recordPlay("champion", t, [this.team[t].player[p].userID,c]);
				}
				this.recordStat(t, p, "cpid",champLocation1); // champLocation is cpid // was hid (does this break anything?)
				this.recordStat(t, p, "hid",champLocation); // champLocation is hid


				championsList[t][p] = champLocation;
				championsListPatch[t][p] = this.team[t].draft.champions.drafted[i].draft.cpid;

			}

		} else {

			// picks already made, just place with player
			let allBans = [];
			let allPicks = [];
			let champValues = [];
			let team0 = [];
			let team1 = [];
			let champPatchLoc = [];
			let champLoc = [];
let champValuesByChampByPlayer = [];
			for (let i = 0; i < 20; i++) {
				if (this.team[0].id == this.team[0].draft.champions.drafted[i].draft.tid)	{
					t = 0;
				} else {
					t = 1;
				}

				// find champ and add needed ratings data
				for (let iii = 0; iii < this.team[0].champ2Rel.length; iii++) {
						// add stat data for each champ
					if (this.team[0].draft.champions.drafted[i].draft.name == this.team[0].champ2Rel[iii].name) {
						this.team[0].draft.champions.drafted[i].draft.ratings.synergy = this.team[0].champ2Rel[iii].ratings.synergy;
						this.team[0].draft.champions.drafted[i].draft.ratings.counter =  this.team[0].champ2Rel[iii].ratings.counter;
						this.team[0].draft.champions.drafted[i].draft.ratings.early =  this.team[0].champ2Rel[iii].ratings.early;
						this.team[0].draft.champions.drafted[i].draft.ratings.mid =  this.team[0].champ2Rel[iii].ratings.mid;
						this.team[0].draft.champions.drafted[i].draft.ratings.late =  this.team[0].champ2Rel[iii].ratings.late;
					}
				}

				c = this.team[t].draft.champions.drafted[i].draft.name;

				if (this.team[t].draft.champions.drafted[i].draft.pick == "BAN") {
					this.recordStat(t, this.team[t].draft.champions.drafted[i].draft.round-1, "ban",c);
					this.recordPlay("ban", t, [c]);
					allBans.push(c);
				} else if (!g.userTids.includes(this.team[t].draft.champions.drafted[i].draft.tid)) {
					// get it from AI draft
					p = this.team[t].draft.champions.drafted[i].pid;

					let draftValue = this.team[t].draft.champions.drafted[i].draft.draftValue;
					champLocation = this.team[t].draft.champions.drafted[i].draft.hid

					this.recordStat(t, p, "champPicked",c);
					// have to search for patch and matching role
					this.recordPlay("champion", t, [this.team[t].player[p].userID,c]);
					this.recordStat(t, p, "cpid",champLocation); // champLocation is cpid // really hid
					this.recordStat(t, p, "hid",champLocation); // champLocation is cpid
					allPicks.push(c);

					// this is repeated, need to be in a function 3 places

					championsList[t][p] = champLocation;
					championsListPatch[t][p] = this.team[t].draft.champions.drafted[i].draft.cpid;
				} else {
					// already have champ
					// just need to match with player and patchid

					// need to find values for both teams
					// current values are only based on who was picked before that champ and with AI team
					// then use this info to do gameSim

					// 1) simplify, everything based on champ winrate with an adjustment based on team OVR
					// 2) then odds change with early/mid/late and with Gold/Levels
					// 3) then use subratings, Gold/Levels, champ win rate at that time (factoring in early/mid/late) to determine who gets kills, etc

					// this could really simplify game simulation
					// then could add wrinkles later

					// can give user the option to adjust impact of barron, inhibs, towers, etc

					// use that to create dota and lol variable values

//////////////// THIS SECTION NOT NEEDED? handled after now for user team

					// find champ patch
					champPatchLoc = [];
					champLoc = [];
					//console.log(this.team[0].draft.champions.drafted);
					//console.log(this.team[t].player[0]);
					//console.log(this.team[t]);
					for (let iii = 0; iii < this.team[t].player[0].champions.length; iii++) {
						if (this.team[0].draft.champions.drafted[i].draft.name == this.team[t].player[0].champions[iii].name) {
						//	console.log(this.team[0].draft.champions.drafted[i].draft.name);
						//	console.log(this.team[t].player[0].champions[iii].name);
							champPatchLoc.push(iii);
						}
					}

					champValues = [];
					// has two if pick all adc? this breaks things
//console.log(champPatchLoc);
					// find all player champ combinations
					for (let iii = 0; iii < champPatchLoc.length; iii++) {
						let champValuesByPlayer = [];

						for (let ii = 0; ii < 5; ii++) {
							this.team[t].player[ii].champions[champPatchLoc[iii]].player = ii;
							this.team[t].player[ii].champions[champPatchLoc[iii]].cpid = champPatchLoc[iii];
							this.team[t].player[ii].champions[champPatchLoc[iii]].ratings = this.team[0].draft.champions.drafted[i].draft.ratings;

							champValues.push(this.team[t].player[ii].champions[champPatchLoc[iii]]);
							champValuesByPlayer.push(this.team[t].player[ii].champions[champPatchLoc[iii]]);
						}
					}
					// need to put in counter and synergy data here
//console.log(champValues);
					for (let p = 0; p < champValues.length; p++) {
						for (let d = 0; d < i; d++) {
							// don't count synergy and counter data for banned champs
							// change t to 0?
							if (this.team[t].draft.champions.drafted[d].draft.pick == "BAN") {
							} else {
								// synergy and counter for champs picked for either team
								if (this.team[t].draft.champions.drafted[d].draft.tid == this.team[t].draft.champions.drafted[i].draft.tid) {
									// do synergy
									if (champValues[p].ratings.synergy[this.team[t].draft.champions.drafted[d].draft.hid] == undefined) {
									} else {
										champValues[p].draftValue +=  champValues[p].ratings.synergy[this.team[t].draft.champions.drafted[d].draft.hid];
									}
								} else {
									// do counter
									if (champValues[p].ratings.counter[this.team[t].draft.champions.drafted[d].draft.hid] == undefined) {
									} else {
										champValues[p].draftValue +=  champValues[p].ratings.counter[this.team[t].draft.champions.drafted[d].draft.hid];
									}

								}
							}
						}
					}

//console.log(champValues);
					// do for each champ, pick the champ/player combo with biggest gap from 1st to 2nd
			champValuesByChampByPlayer.push(champValues);
					// sort by highest champ value
					champValues.sort(function (a, b) { return b.draftValue - a.draftValue; });
					// pick player to select champ
					let draftValue;
					for (let ii = 0; ii < champValues.length; ii++) {

						p = champValues[ii].player
						if (t == 0) {
							if (team0.indexOf(champValues[ii].player) >= 0) {
							} else {
								team0.push(champValues[ii].player);
								champLocation = champValues[ii].cpid;
								draftValue = champValues[ii].draftValue;
								break;
							}
						} else {
							if (team1.indexOf(champValues[ii].player) >= 0) {
							} else {
								team1.push(champValues[ii].player);
								champLocation = champValues[ii].cpid;
								draftValue = champValues[ii].draftValue;
								break;
							}
						}
					}
				}
			}


//////// check for only one of role, do firstRun
//////// issue is if all champs multiple roles, may accidently get left
//////// with a champ in wrong role
//////// sanity check at end where roles can be swapped?
//////// keep swapping until all players in correct role? could lead to inf Loop
//////// check to make sure another player plays role that champ can also play

//////// alternate method of selecting player champ combinations after drafted
//////// focus on champs that play with 1 player first, then 2, then 3

//////// If too complicated just do no harm, make sure position and role match?


				//champValuesByChampByPlayer
				// count by role, do
				for (let t2 = 0; t2 < 2; t2++) {
	//		g.userTids.includes
	// if users team find optimal champion/player combination, if AI already DONE
	// handles having two user teams play eachother
			if (g.userTids.includes(this.team[t2].id))	{
			//if (this.team[0].id == this.team[0].draft.champions.drafted[i].draft.tid)	{
				t = t2;

					/// below not used?
			/*		let TOP = 0;
					let JGL = 0;
					let MID = 0;
					let ADC = 0;
					let SUP = 0;
					for (let picks = 0; picks < 5; picks++) {
							for (let c = 0; c < champValuesByChampByPlayer.length; c++) {
	                if (champValuesByChampByPlayer[picks][picks].draftValue > .15) {
										if (champValuesByChampByPlayer[c][picks].role == "TOP") {
											TOP += 1;
										}
										if (champValuesByChampByPlayer[c][picks].role == "JGL") {
											JGL += 1;
										}
										if (champValuesByChampByPlayer[c][picks].role == "MID") {
											MID += 1;
										}
										if (champValuesByChampByPlayer[c][picks].role == "ADC") {
											ADC += 1;
										}
										if (champValuesByChampByPlayer[c][picks].role == "SUP") {
											SUP += 1;
										}
									}
							}
					}*/
          //console.log(TOP);
          //console.log(JGL);
					//console.log(MID);
          //console.log(ADC);
          //console.log(SUP);

					/// above not used?

				//	console.log(g.userTids);
//					console.log(this.team);
					//console.log(t2);
					//console.log(champValuesByChampByPlayer);

					let playerChampValues = [];
					let playerTOP = [];
					let playerJGL = [];
					let playerMID = [];
					let playerADC = [];
					let playerSUP = [];
					for (let picks = 0; picks < 5; picks++) {
							for (let c = 0; c < champValuesByChampByPlayer.length; c++) {
								if (champValuesByChampByPlayer[c][picks].player == 0) {
									playerTOP.push(champValuesByChampByPlayer[c][picks]);
								}
								if (champValuesByChampByPlayer[c][picks].player == 1) {
									playerJGL.push(champValuesByChampByPlayer[c][picks]);
								}
								if (champValuesByChampByPlayer[c][picks].player == 2) {
									playerMID.push(champValuesByChampByPlayer[c][picks]);
								}
								if (champValuesByChampByPlayer[c][picks].player == 3) {
									playerADC.push(champValuesByChampByPlayer[c][picks]);
								}
								if (champValuesByChampByPlayer[c][picks].player == 4) {
									playerSUP.push(champValuesByChampByPlayer[c][picks]);
								}
							}
					}

	playerTOP.sort(function (a, b) { return b.cpid - a.cpid; });
	playerJGL.sort(function (a, b) { return b.cpid - a.cpid; });
	playerMID.sort(function (a, b) { return b.cpid - a.cpid; });
	playerADC.sort(function (a, b) { return b.cpid - a.cpid; });
	playerSUP.sort(function (a, b) { return b.cpid - a.cpid; });

//console.log(playerTOP);
//console.log(playerJGL);
//console.log(playerMID);
//console.log(playerADC);
//console.log(playerSUP);

	// brute force it?
	// will check every option and pick best ones
	// once you filter for 1 champ per role, only 120 possibilities
	let optionsAll = [];
	for (let pickTOP = 0; pickTOP < 5; pickTOP++) {
		for (let pickJGL = 0; pickJGL < 5; pickJGL++) {
			for (let pickMID = 0; pickMID < 5; pickMID++) {
				for (let pickADC = 0; pickADC < 5; pickADC++) {
					for (let pickSUP = 0; pickSUP < 5; pickSUP++) {
						  let arrayOfLocations = [];
							arrayOfLocations.push(pickSUP);
							arrayOfLocations.push(pickADC);
							arrayOfLocations.push(pickMID);
							arrayOfLocations.push(pickJGL);
							arrayOfLocations.push(pickTOP);
							// make sure all chaps are selected
							if (arrayOfLocations.indexOf(0) >= 0 && arrayOfLocations.indexOf(1) >= 0 &&
							arrayOfLocations.indexOf(2) >= 0 && arrayOfLocations.indexOf(3) >= 0 &&
							arrayOfLocations.indexOf(4) >= 0) {
								// store which players have which champs and the team draft value
								let valueSum = playerTOP[pickTOP].draftValue;
								valueSum += playerJGL[pickJGL].draftValue;
								valueSum += playerMID[pickMID].draftValue;
								valueSum += playerADC[pickADC].draftValue;
								valueSum += playerSUP[pickSUP].draftValue;
								let optionsOne = {
									valueSum: valueSum,
									valueTOP: playerTOP[pickTOP].draftValue,
									valueJGL: playerJGL[pickJGL].draftValue,
									valueMID: playerMID[pickMID].draftValue,
									valueADC: playerADC[pickADC].draftValue,
									valueSUP: playerSUP[pickSUP].draftValue,
									pickTOP: pickTOP,
									pickJGL: pickJGL,
									pickMID: pickMID,
									pickADC: pickADC,
									pickSUP: pickSUP,
								};
								optionsAll.push(optionsOne);
							}
					}
				}
			}
		}
	}

	optionsAll.sort(function (a, b) { return b.valueSum - a.valueSum; });


	/////////////
	let p2 = playerTOP[optionsAll[0].pickTOP].player;
	let c2 = playerTOP[optionsAll[0].pickTOP].name;
	let cpid2 = playerTOP[optionsAll[0].pickTOP].cpid;
	let hid2 = playerTOP[optionsAll[0].pickTOP].cpid;// cpid now hid

	// find real cpid, draft stores This
	for (let i = 0; i < 20; i++) {
		     if (this.team[t].draft.champions.drafted[i].draft.name == c2) {
	       cpid2 = this.team[t].draft.champions.drafted[i].draft.cpid;
					break;
			 }
	}
						this.recordStat(t, p2, "champPicked",c2);

						this.recordPlay("champion", t, [this.team[t].player[p2].userID,c2]);
						this.recordStat(t, p2, "cpid",hid2); // champLocation is cpid // really hid
						allPicks.push(c2);

						championsList[t][p2] = hid2; // why is this the patch id?
						championsListPatch[t][p2] = cpid2;
	/////////////
						 p2 = playerJGL[optionsAll[0].pickJGL].player;
						 c2 = playerJGL[optionsAll[0].pickJGL].name;
						 cpid2 = playerJGL[optionsAll[0].pickJGL].cpid;
						 hid2 = playerJGL[optionsAll[0].pickJGL].cpid;// cpid now hid

						 // find real cpid, draft stores This
						 for (let i = 0; i < 20; i++) {
						 	     if (this.team[t].draft.champions.drafted[i].draft.name == c2) {
						        cpid2 = this.team[t].draft.champions.drafted[i].draft.cpid;
										break;
						 		 }
						 }

						this.recordStat(t, p2, "champPicked",c2);

						this.recordPlay("champion", t, [this.team[t].player[p2].userID,c2]);
						this.recordStat(t, p2, "cpid",hid2); // champLocation is cpid // really hid
						allPicks.push(c2);

						championsList[t][p2] = hid2; // why is this the patch id?
						championsListPatch[t][p2] = cpid2;
	////////////
						 p2 = playerMID[optionsAll[0].pickMID].player;
						 c2 = playerMID[optionsAll[0].pickMID].name;
						 cpid2 = playerMID[optionsAll[0].pickMID].cpid;
						 hid2 = playerMID[optionsAll[0].pickMID].cpid;// cpid now hid

						 // find real cpid, draft stores This
						 for (let i = 0; i < 20; i++) {
						 	     if (this.team[t].draft.champions.drafted[i].draft.name == c2) {
						        cpid2 = this.team[t].draft.champions.drafted[i].draft.cpid;
										break;
						 		 }
						 }

						this.recordStat(t, p2, "champPicked",c2);

						this.recordPlay("champion", t, [this.team[t].player[p2].userID,c2]);
						this.recordStat(t, p2, "cpid",hid2); // champLocation is cpid // really hid
						allPicks.push(c2);

						championsList[t][p2] = hid2; // why is this the patch id?
						championsListPatch[t][p2] = cpid2;
	////////////
						 p2 = playerADC[optionsAll[0].pickADC].player;
						 c2 = playerADC[optionsAll[0].pickADC].name;
						 cpid2 = playerADC[optionsAll[0].pickADC].cpid;
						 hid2 = playerADC[optionsAll[0].pickADC].cpid;// cpid now hid

						 // find real cpid, draft stores This
						 for (let i = 0; i < 20; i++) {
						 	     if (this.team[t].draft.champions.drafted[i].draft.name == c2) {
						        cpid2 = this.team[t].draft.champions.drafted[i].draft.cpid;
										break;
						 		 }
						 }
						this.recordStat(t, p2, "champPicked",c2);

						this.recordPlay("champion", t, [this.team[t].player[p2].userID,c2]);
						this.recordStat(t, p2, "cpid",hid2); // champLocation is cpid // really hid
						allPicks.push(c2);

						championsList[t][p2] = hid2; // why is this the patch id?
						championsListPatch[t][p2] = cpid2;

	////////
					   p2 = playerSUP[optionsAll[0].pickSUP].player;
						 c2 = playerSUP[optionsAll[0].pickSUP].name;
						 cpid2 = playerSUP[optionsAll[0].pickSUP].cpid;
						 hid2 = playerSUP[optionsAll[0].pickSUP].cpid;// cpid now hid

						 // find real cpid, draft stores This
						 for (let i = 0; i < 20; i++) {
						 	     if (this.team[t].draft.champions.drafted[i].draft.name == c2) {
						        cpid2 = this.team[t].draft.champions.drafted[i].draft.cpid;
						 		 }
						 }

						this.recordStat(t, p2, "champPicked",c2);

						this.recordPlay("champion", t, [this.team[t].player[p2].userID,c2]);
						this.recordStat(t, p2, "cpid",hid2); // champLocation is cpid // really hid
						allPicks.push(c2);

						championsList[t][p2] = hid2; // why is this the patch id?
						championsListPatch[t][p2] = cpid2;
					}
				}
			}
    };


    /**
     * Simulates the game and returns the results.
     *
     * Also see core.game where the outputs of this function are used.
     *
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
    run() {



        // Simulate the game up to the end of regulation
        this.simRegulation();
        // Play overtime periods if necessary
       // while (this.team[0].stat.pts === this.team[1].stat.pts) {
         //   this.checkGameTyingShot();
          //  this.simOvertime();
       // }
      ////////////////////////////  this.checkGameWinner();
        // Delete stuff that isn't needed before returning
        for (let t = 0; t < 2; t++) {
            delete this.team[t].compositeRating;
            delete this.team[t].pace;
            for (let p = 0; p < this.team[t].player.length; p++) {
                delete this.team[t].player[p].valueNoPot;
                delete this.team[t].player[p].compositeRating;
                delete this.team[t].player[p].ptModifier;
            }
        }

        const out = {
            gid: this.id,
            overtimes: this.overtimes,
            team: this.team,
            clutchPlays: this.clutchPlays,
            playByPlay: undefined,
        };

        if (this.playByPlay !== undefined) {
            out.playByPlay = this.playByPlay;
            this.playByPlay.unshift({
                type: "init",
                boxScore: this.team,
            });
        }

        return out;
    }

   /* simRegulation() {
        this.o = 0;
        this.d = 1;
        let quarter = 1;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            while (this.t > 0) {
                this.simPossession();
            }
            quarter += 1;

            if (quarter === 5) {
                break;
            }
            this.team[0].stat.ptsQtrs.push(0);
            this.team[1].stat.ptsQtrs.push(0);
            this.t = g.quarterLength;
            this.lastScoringPlay = [];
            this.recordPlay("quarter");
        }
    }*/


    //GameSim.prototype.simPossessions = function () {
    simRegulation() {
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

//		let objectiveKills = false;
	/*	let objectiveKills;
		let objectiveKills2;
		objectiveKills  = this.userResponse();
		//sleep(10);
//		objectiveKills2 = setTimeout( setTimeout(this.userResponse(), 5000) , 5000);
		objectiveKills2 = setTimeout( ""  , 5000);
		console.log(objectiveKills);
		console.log(objectiveKills2);

	   var currentTime = new Date().getTime();
		var miliseconds = 5000;
	   while (currentTime + miliseconds >= new Date().getTime()) {
	   }
		console.log(objectiveKills);
		console.log(objectiveKills2);
		//while (objectiveKills != 100) {
		//}
	//	function sleep(miliseconds) {

	//	}		*/


        while (outcome != "nexus") {

            // Clock (should move up)
			if (outcome == "done") {
				this.dt = Math.random()/10+.02; // range 0.02 to .12 // don't do creep score
				this.done = true;
			} else {
				this.dt = .08;	 // range .5/3 to 1.5/3 or .16 or .5
				this.done = false;
			}

            this.t += this.dt;
			//console.log(this.t);
		//	if (this.t > 60) {
			//	console.log(this.t);
				//console.log(this.team);
			//}
			//console.log(this.t);
            if (this.t < 0) {
                this.t = 0;
            }

			for (t = 0; t < 2; t++) {
				for (p = 0; p < 5; p++) {
						this.recordStat(t, p, "min", this.dt);
						 this.recordStat(t, p, "gs");
				}
			}

            outcome = this.simPossession();

			this.lastScoringPlay = [];
            i += 1;
        }
    //     this.injuries();
    };




    simOvertime() {
        this.t = Math.ceil(0.4 * g.quarterLength); // 5 minutes by default, but scales
        this.lastScoringPlay = [];
        this.overtimes += 1;
        this.team[0].stat.ptsQtrs.push(0);
        this.team[1].stat.ptsQtrs.push(0);
        this.recordPlay("overtime");
        this.o = Math.random() < 0.5 ? 0 : 1;
        this.d = this.o === 0 ? 1 : 0;
        while (this.t > 0) {
            this.simPossession();
        }
    }



/*	testProcedure () {


		return {} ;

	}	*/
    /**
     * Simulate a single possession.
     *
     * @memberOf core.gameSim
     * @return {string} Outcome of the possession, such as "tov", "drb", "orb", "fg", etc.
     */
    //GameSim.prototype.simPossession = function () {
    simPossession() {
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

		groupAttack = [0,0];
		groupDefense = [0,0];
		groupAbility = [0,0];


		outcome = "notNexus";

		// make CS less relative and more absolute (then raise)
		// do champion KDA
		// bring player/champ specific data
		// update league stat and player stat pages (see if they want any other stats

//////////////////////  based on length of game, determines how grouped up teams are
		let groupOddsVar = this.groupOdds();
	//	console.log(groupOddsVar);
		timeOne = groupOddsVar.timeOne;
		timeTwo = groupOddsVar.timeTwo;
		timeThree = groupOddsVar.timeThree;
		timeFour = groupOddsVar.timeFour;


		 ///////////////  Pick Team

		let pickTeamVar = this.pickTeam();
		t =  pickTeamVar.t;
		tD = pickTeamVar.tD;


		///////////////// basic gold
		// need to skip this and CS if team is going twice back to back with small time movement ? or track time change
		playerGoldBuff = this.basicGold(playerGoldBuff);


		///////////////////   Pick Player
		///// available players
		let pickPlayersVar = this.pickPlayers(p, timeOne,timeTwo,timeThree,timeFour);

		p = pickPlayersVar.p;
		groupType = pickPlayersVar.groupType;
		groupNumber = pickPlayersVar.groupNumber;
	//	console.log(pickPlayersVar);

		// Have a function that takes all of this into account;
		 //////////////// GOLD
 		//console.log(playerGoldBuff);

		///////champRatings
		// Champ/position adjustment draftValue
		// Synvergy
		// Counter
		// early mid late

			//console.log(champRatings);

		///////////// champ locations by player
		//championsList

		////////////////
		// Buffs
		// win % impact

		// put everything in terms of win %
		// should make tracking much easier

		// compile all of the above to make single win/loss percentage

		 ////////// calculate buffs based on group
		let groupBuffsVar = this.groupBuffs(t,tD,p,groupNumber,playerBuff,playerGoldBuff);

		groupBuff = groupBuffsVar.groupBuff;
		groupGoldBuff = groupBuffsVar.groupGoldBuff;
		groupBuffAdjraw = groupBuffsVar.groupBuffAdjraw;
		groupGoldBuffraw = groupBuffsVar.groupGoldBuffraw;


		 /////////////////////  Dragon Buffs, Baron Buff, Include in win calc
		// buffs, perm and temp
		let dragonBarronBuffsVar = this.dragonBarronBuffs(dragonBuff,teamBuff,playerRespawn,playerDeaths);


		dragonBuff = dragonBarronBuffsVar.dragonBuff;
		dragonBuff = dragonBarronBuffsVar.dragonBuff;
		playerRespawn = dragonBarronBuffsVar.playerRespawn;
		playerDeaths = dragonBarronBuffsVar.playerDeaths;
	//	console.log(dragonBarronBuffsVar);


	//////////////////////////////////////// Adjusted For Deaths
	// not game win rate adjustment, but a tempory adjustment

		let deathAdjustmentVar = this.deathAdjustment(groupNumber,p, pAlt, t, tD, playerDeaths,playerBuff,playerGoldBuff,groupBuff,groupGoldBuff,groupBuffAdjraw,groupGoldBuffraw,teamBuff);

		groupBuff = deathAdjustmentVar.groupBuff;
		groupGoldBuff = deathAdjustmentVar.groupGoldBuff;
		groupBuffAdjraw = deathAdjustmentVar.groupBuffAdjraw;
		groupGoldBuffraw = deathAdjustmentVar.groupGoldBuffraw;
		teamBuff = deathAdjustmentVar.teamBuff;
		teamBuffAdj = deathAdjustmentVar.teamBuffAdj;
		pAlt = deathAdjustmentVar.pAlt;



	//	console.log(teamBuffAdj[0]+" "+teamBuffAdj[1]);

		 //championsList[0][0]
		 // using t, p[0], and group number

		 // need opposing group as well
		 // use same as above, but make random adjustments? Or just don't let 4v5 happen?, unless dead?


//		this.team[t].compositeRating.toweringAttack


		///////////////// Team Composite Ratings (FIXED)
		   /*toUpdate = ["wardDestruction", "wardPlacement", "mapVision", "adaptability", "teamPlayer", "aggression", "laneSwitching"];
			toUpdateMax = ["shotcalling"];
			toUpdateJungle = ["gank"];*/
		////////////// Group Composite Ratings


		///////////////// Player Ratings
		///////////////// Combined with standard win rate?
		/////////////////  mix, start 50% 50%
		//////////////// also impact how game unfold
		//////////////// if team really weak against towers or killing then opponent make take advantage of that even if otherwise equal
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


		//////////////// Team comp and outer and inner
		let teamCompVar = this.teamComp(groupNumber,playerDeaths,p,t,outerAdj,innerAdj,outerAdjNoSC,innerAdjNoSC,outerAdjNoTP,innerAdjNoTP,groupBuffAdj);
		outerAdj = teamCompVar.outerAdj;
		innerAdj = teamCompVar.innerAdj;
		outerAdjNoSC = teamCompVar.outerAdjNoSC;
		innerAdjNoSC = teamCompVar.innerAdjNoSC;
		outerAdjNoTP = teamCompVar.outerAdjNoTP;
		innerAdjNoTP = teamCompVar.innerAdjNoTP;
		groupBuffAdj = teamCompVar.groupBuffAdj;
		groupAttack = teamCompVar.groupAttack;
		groupDefense = teamCompVar.groupDefense;
		groupAbility = teamCompVar.groupAbility;
		shotCaller = teamCompVar.shotCaller;

		//	return {outerAdj,innerAdj,outerAdjNoSC,innerAdjNoSC,outerAdjNoTP,innerAdjNoTP,groupAttack,groupDefense,groupAbility,shotCaller};
		///////////// test
		// champ/buff ratings
		////////////  test
		// player ratings


		/////////////////// This shouldn't be necessary
//		console.log("AFTER: "+p.length+" "+groupBuffAdj);


		//////////////////////////  Champion Adjustment
		///// this needs to be
		// 1) winrate w/ player champ ability w/ position adjustment
		// 2) synergy
		// 3) countering
		// 4) early/mid/late game
		// how to make this matter enough?
		championAdjustment = 0;
		if (this.t>200) {
		   console.log("championAdjustment 0: "+championAdjustment);
		}

		// this shouldn't be based on gorupsttack/dfeense
		// this should be based on win rates
		// then the kills, etc should be based on groupAttack/defense

		championAdjustment = ((groupAttack[t]-groupDefense[tD])/(groupAttack[t]+groupDefense[tD]+1)) + ((groupAbility[t]-groupAbility[tD])/(groupAbility[t]+groupAbility[tD]+1))*(this.t/60);

		let groupChampValue = [0,0];

		for (let i = 0; i < groupNumber; i++) {
			if (playerDeaths[t][p[i]] == 0) {
				groupChampValue[t] += this.team[t].player[p[i]].champions[championsList[t][p[i]]].draftValue;
			}
			if (playerDeaths[tD][p[i]] == 0) {
				groupChampValue[tD] += this.team[tD].player[p[i]].champions[championsList[tD][[p[i]]]].draftValue;
			}
		}
		//groupChampValue[t] /= groupNumber;
//		groupChampValue[tD] /= groupNumber;
		// normalize winrate here? then only have one number for next calculations?
		// ok to normalize after? double counting?
		// maybe due early/mid/late then normalize
		// then synergy and countering
	//	console.log(this.t);
		let stage;
		// early mid late win rate are based on 25 and 35
		// making it earlier for game since you need to build a lead and then have it hold
		// otherwise early game champs overpowered
		// this could be a god mode option
		if (this.t < 15) {
			stage = "early";
		} else if (this.t > 25) {
			stage = "late";
		} else {
			stage = "mid";
		}
	//	console.log(this.t+" "+stage+" "+championData[championsList[t][p[0]]].ratings[stage]);
		for (let i = 0; i < groupNumber; i++) {
			if (playerDeaths[t][p[i]] == 0) {
				groupChampValue[t] += championData[championsList[t][p[i]]].ratings[stage];
			}
			if (playerDeaths[tD][p[i]] == 0) {
				groupChampValue[tD] += championData[championsList[tD][p[i]]].ratings[stage];
			}
		}



		// only do synergy for one side, since otherwise that would be double counting
		for (let i = 0; i < groupNumber; i++) {
			for (let ii = 0; ii < groupNumber; ii++) {
				if (playerDeaths[t][p[i]] == 0) {
					if (championData[championsList[t][p[i]]].ratings.synergy[championsList[t][p[ii]]] == undefined) {
					} else {
						groupChampValue[t]  += championData[championsList[t][p[i]]].ratings.synergy[championsList[t][p[ii]]];;
					}
				}
				if (playerDeaths[t][p[i]] == 0) {
					if (championData[championsList[tD][p[i]]].ratings.synergy[championsList[tD][p[ii]]] == undefined) {
					} else {
						groupChampValue[tD] += championData[championsList[tD][p[i]]].ratings.synergy[championsList[tD][p[ii]]];
					}
				}
			}
		}

		let tTeamChampOdds =  groupChampValue[t]-groupChampValue[tD];
		let tTeamChampOdds2 =  (groupChampValue[t]-groupChampValue[tD])/(groupChampValue[t]+groupChampValue[tD]);
	//	console.log(groupChampValue);
	//	console.log(tTeamChampOdds+" "+tTeamChampOdds2);

		// only do counter for one side, since otherwise that would be double counting
		for (let i = 0; i < groupNumber; i++) {
			for (let ii = 0; ii < groupNumber; ii++) {
				if (playerDeaths[t][p[i]] == 0) {
					if (championData[championsList[t][p[i]]].ratings.counter[championsList[tD][p[ii]]] == undefined) {
					} else {
						tTeamChampOdds += championData[championsList[t][p[i]]].ratings.counter[championsList[tD][p[ii]]];
					}
					if (championData[championsList[t][p[i]]].ratings.counter[championsList[tD][p[ii]]] == undefined) {
					} else {
						tTeamChampOdds2 += championData[championsList[t][p[i]]].ratings.counter[championsList[tD][p[ii]]];
					}
				}
			}
		}
		//console.log(this.t+" "+tTeamChampOdds+" "+tTeamChampOdds2+" "+championAdjustment);
		championAdjustment	= tTeamChampOdds;

		//console.log(this.t+" "+tTeamChampOdds+" "+groupNumber);
		if  ((	(this.team[0].id == g.userTid) || 	(this.team[1].id == g.userTid)) && this.t < 1 && g.GMCoachType>0) {
			//console.log(g.userTid+" "+this.t);
			////console.log(g.GMCoachType);
			///console.log(this.team);
			//console.log(championsList);
		//	console.log(championData);
			let oppAI = this.o;
			let user = this.d;
			if (this.team[this.o].id == g.userTid) {
				oppAI = this.d;
				 user = this.o;
			}
		//	console.log(championsList[0]);
//			console.log(championsList[0][0]);
			//console.log(oppAI);
			//console.log(championsList[oppAI]);
			//console.log(championsList[oppAI][3]);
			//console.log(championData[championsList[oppAI][3]]);
			//console.log(championData[championsList[oppAI][3]].ratings);
			///console.log(championData[championsList[oppAI][3]].ratings.early);

			let difficultyCoach = 25;
			if (g.GMCoachType == 2) {
				difficultyCoach = 50;
			} else if (g.GMCoachType == 3) {
				difficultyCoach = 100;
			}

			this.team[oppAI].coach.adc = championData[championsList[oppAI][3]].ratings.early-championData[championsList[user][3]].ratings.early*100+5 ;
			this.team[oppAI].coach.top = championData[championsList[oppAI][0]].ratings.early-championData[championsList[user][0]].ratings.early*100+5 ;
			this.team[oppAI].coach.mid = championData[championsList[oppAI][2]].ratings.early-championData[championsList[user][2]].ratings.early*100+5 ;
			this.team[oppAI].coach.jgl = championData[championsList[oppAI][1]].ratings.early-championData[championsList[user][1]].ratings.early*100+5 ;
			this.team[oppAI].coach.sup = championData[championsList[oppAI][4]].ratings.early-championData[championsList[user][4]].ratings.early*100+5 ;
			this.team[oppAI].coach.adcJGL = this.team[oppAI].coach.adc+this.team[oppAI].coach.jgl-5;
			this.team[oppAI].coach.topJGL = this.team[oppAI].coach.top+this.team[oppAI].coach.jgl-5;
			this.team[oppAI].coach.midJGL = this.team[oppAI].coach.mid+this.team[oppAI].coach.jgl-5;
			this.team[oppAI].coach.jglJGL = this.team[oppAI].coach.jgl+this.team[oppAI].coach.jgl-5;
			this.team[oppAI].coach.supJGL = this.team[oppAI].coach.sup+this.team[oppAI].coach.jgl-5;
		//	console.log(this.team);
		}
	//	groupChampValue[t] /= groupNumber;
//		groupChampValue[tD] /= groupNumber;

		//console.log(groupNumber);


		// multi player rating time champ rating
		// then normalize so they add to 1.00
		// if players clearly better that will dominate champion ratings.



		// raw win rate
		//// find this for all players on both sides of group
		  // this.team[t].players[p[i]].champions[championsList[t][i]].draftValue;
		// synergy
		   //championData[championsList[t][p[i]]].ratings.synergy[championsList[tD][p[ii]]];
		// counter
		   //championData[championsList[t][p[i]]].ratings.counter[championsList[tD][p[ii]]];
		// early mid late
			//championData[championsList[t][p[i]]].ratings.early
			//championData[championsList[t][p[i]]].ratings.mid
			//championData[championsList[t][p[i]]].ratings.late
		// sum, give a % win/loss that can modify in game stuff

		// next, test this vs other stuff
		// how much should it weight?



			//console.log(championsList);
			//console.log(this.team);
		//	console.log(championsList);
//			console.log(championsListPatch);
	//		console.log(this.team);
		//console.log(championData);
		// champion data for champ data
						//groupAttack[j] += championData[championsList[j][i]].ratings.carry;
						//groupDefense[j] += championData[championsList[j][i]].ratings.durable;
		// player patch values for patch data

	//	console.log(groupAttack);
	//	console.log(groupDefense);
	//	console.log(groupAbility);

//		if (this.t>100) {
		if (this.t>200) {
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


		///////////////////////// Put in terms of percentage

		let inOutStatVar = this.inOutStat(t,tD,outerAdj,innerAdj,outerAdjNoAg,innerAdjNoAg,outerAdjNoSC,innerAdjNoSC,outerAdjNoTP,innerAdjNoTP);
		outerAdj = inOutStatVar.outerAdj;
		innerAdj = inOutStatVar.innerAdj;
		outerAdjNoAg = inOutStatVar.outerAdjNoAg;
		innerAdjNoAg = inOutStatVar.innerAdjNoAg;
		outerAdjNoSC = inOutStatVar.outerAdjNoSC;
		innerAdjNoSC = inOutStatVar.innerAdjNoSC;
		outerAdjNoTP = inOutStatVar.outerAdjNoTP;
		innerAdjNoTP = inOutStatVar.innerAdjNoTP;
		//console.log(inOutStatVar);
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

		////////////////////////////////////////////////  inhib Barron Synvergy
		///////////////  can't this be handled above?
		var inhibBaronSynergy;
		 inhibBaronSynergy = 1;
		//////////////////////////// Respawn

		let respawnTimersVar = this.respawnTimers(t,inhibRespawn,inhibList,inhibBaronSynergy,dragonRespawn,baronRespawn);
		inhibRespawn = respawnTimersVar.inhibRespawn;
		inhibList = respawnTimersVar.inhibList;
		inhibBaronSynergy = respawnTimersVar.inhibBaronSynergy;
		dragonRespawn = respawnTimersVar.dragonRespawn;
		baronRespawn = respawnTimersVar.baronRespawn;

		//console.log(respawnTimersVar);


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


		var timeScalingVar = this.timeScaling(killCSRatio,jungleRatio,killBonus,structurePlayerBuff,structurePlayerBuffAll,creepPlayerBuff,junglePlayerBuff);
		killCSRatio = timeScalingVar.killCSRatio;
		jungleRatio = timeScalingVar.jungleRatio;
		killBonus = timeScalingVar.killBonus;
		structurePlayerBuff = timeScalingVar.structurePlayerBuff;
		structurePlayerBuffAll = timeScalingVar.structurePlayerBuffAll;
		creepPlayerBuff = timeScalingVar.creepPlayerBuff;
		junglePlayerBuff = timeScalingVar.junglePlayerBuff;

		//console.log(timeScalingVar);

		//// Add more for other skills, want all skills here, then find a balance
		//// High skilled players should win
		//// Combo stats to create?
		//assistBonus = 1;		//not used

		var customOn;

		var standardTOdds,standardTNoSC,standardTNoExp,standardTNoGold,standardTNoTBuff,standardTNoTBuffAdj,standardTNoTw,standardTNoChmpn,standardTNoTP,standardTNoAg;
		var standardCOdds,standardCNoSC,standardCNoExp,standardCNoGold,standardCNoTBuff,standardCNoTBuffAdj,standardCNoCK,standardCNoChmpn,standardCNoTP,standardCNoAg;
		var towerToChamp;

		var outerSum,innerSum,inhibTsum;

		var OTLevel,ITLevel,HTLevel,DLevel,BLevel,NTLevel,NLevel;
		var baseLevelExp,baseLevelGld;

		//////ADD - ChampionPower,AttackPower,DefensePower

		towerPower = 25;

		// dragon, outter towers
		outerPower = 5; // champkilling, towerattack             ////// AGGRESSION for both teams

		//barron and dragon, inner towers, inhibs
		innerPower = 5; // shotcalling teamPlayer  ////////// SKILL - SHOTCALLING, teamPlayer     ////// AGGRESSION for both teams


	//	console.log(g.customRosterMode);
	customOn = false;
		if (typeof(g.customRosterMode) == 'undefined') {
			//	groupGoldBuffPower = 0.80;  //(maybe do fractions to make less important)
		//		groupBuffPower = .40;   //(maybe do fractions to make less important)
	//			teamBuffPower = .67;
//				teamBuffAdjPower = .67;
				groupGoldBuffPower = 0.1125;  //(maybe do fractions to make less important)
				groupBuffPower = .05;   //(maybe do fractions to make less important)
				teamBuffPower = .10;
				teamBuffAdjPower = .10;

		} else {
			if (g.customRosterMode)  {
					customOn = true;
				groupGoldBuffPower = 0.1125;  //(maybe do fractions to make less important)
				groupBuffPower = .05;   //(maybe do fractions to make less important)
				teamBuffPower = .10;
				teamBuffAdjPower = .10;
			} else {
				groupGoldBuffPower = 0.1125;  //(maybe do fractions to make less important)
				groupBuffPower = .05;   //(maybe do fractions to make less important)
				teamBuffPower = .10;
				teamBuffAdjPower = .10;

//				groupGoldBuffPower = 0.80;  //(maybe do fractions to make less important)
	//			groupBuffPower = .40;   //(maybe do fractions to make less important)
		//		teamBuffPower = .67;
			//	teamBuffAdjPower = .67;

//				groupGoldBuffPower = 0.1125;  //(maybe do fractions to make less important)
	//			groupBuffPower = .05;   //(maybe do fractions to make less important)
		//		teamBuffPower = .10;
			//	teamBuffAdjPower = .10;
			}
		}

		objectiveOddsAdjustment = .400;  // 15 kills, 10 towers,baron,dragon

		championKillOddsAdjustment = 1.00; // keep kills between 10-20 per team

		championKillOddsEarly = 1- this.t/10 ; // new
		// need power for group exp odds, group gold. Too strong right now


		//// Percentage Objectives first vs only Kills
		//// really impacts game speed
		if (g.champType == 0) {
			// LOL Style Game (less deaths, more objective focus);
			objectivesFirst = .33;
			objectivesFirst -= (this.team[0].stat.pf+this.team[1].stat.pf)/100;
			objectivesFirst += this.t/600;
		} else {
			// DOtA 2 Style Game (more deaths, less objective focus, less objectives, no dragons, baron stronger);
			// actually, at the pro level this may not be the case
			objectivesFirst = .33;
			objectivesFirst -= (this.team[0].stat.pf+this.team[1].stat.pf)/100;
			objectivesFirst += this.t/600;
		}


		//console.log(g.champType+" "+objectivesFirst);

		killGoldAdj = 10;



		outerSum = (outerTowerList[t][0] + outerTowerList[t][1] + outerTowerList[t][2])/3;
		innerSum = (innerTowerList[t][0]+innerTowerList[t][1]+innerTowerList[t][2])/3;
		inhibTsum = (inhibTowerList[t][0]+inhibTowerList[t][1]+inhibTowerList[t][2])/3;



		if (customOn == true) {
			standardTOdds =  championAdjustment	+ (1.00/.85)*((this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.15+ (this.team[t].compositeRating.teamPlayer-this.team[tD].compositeRating.teamPlayer)*.15+ (innerAdj[t]-innerAdj[tD])*1.5	+  (teamBuff[t] - teamBuff[tD])*.025		+ (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.0005		+ (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.00075);
			standardTNoSC = standardTOdds + (innerAdjNoSC[t]-innerAdjNoSC[tD])- (innerAdj[t]-innerAdj[tD]);
			standardTNoExp = standardTOdds  - (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.0005;
			standardTNoGold = standardTOdds   - (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.00075;
			standardTNoTBuff = standardTOdds  - (teamBuff[t] - teamBuff[tD])*.025	;
			standardTNoTw = standardTOdds  -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.15 ;
			standardTNoChmpn = standardTOdds - championAdjustment*.15;
			standardTNoTP = standardTOdds  + (innerAdjNoTP[t]-innerAdjNoTP[tD])*1.5 - (innerAdj[t]-innerAdj[tD])*1.5  -  (this.team[t].compositeRating.teamPlayer-this.team[tD].compositeRating.teamPlayer )*.15;
			standardTNoAg = standardTOdds + (innerAdjNoAg[t]-innerAdjNoAg[tD])*1.5 - (innerAdj[t]-innerAdj[tD])*1.5;
			towerToChamp = (this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling)*.15 -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.15 ;

		} else {
//			standardTOdds =  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1+ (this.team[t].compositeRating.teamPlayer-this.team[tD].compositeRating.teamPlayer)*.1+ (innerAdj[t]-innerAdj[tD])+	 championAdjustment*.1		+  (teamBuff[t] - teamBuff[tD])*.05		+ (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.001		+ (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.0015;
			standardTOdds =  championAdjustment +  (1.00/.9)*((this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1+ (this.team[t].compositeRating.teamPlayer-this.team[tD].compositeRating.teamPlayer)*.1+ (innerAdj[t]-innerAdj[tD])		+  (teamBuff[t] - teamBuff[tD])*.05		+ (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.001		+ (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.0015);
			let nonChampOdds =  (1.00/.9)*((this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1+ (this.team[t].compositeRating.teamPlayer-this.team[tD].compositeRating.teamPlayer)*.1+ (innerAdj[t]-innerAdj[tD])		+  (teamBuff[t] - teamBuff[tD])*.05		+ (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.001		+ (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.0015);
//		console.log(this.t+" "+tTeamChampOdds+" "+tTeamChampOdds2+" "+championAdjustment+" "+nonChampOdds);
	//	console.log(this.t+" "+championAdjustment+" "+nonChampOdds);

			standardTNoSC = standardTOdds + (innerAdjNoSC[t]-innerAdjNoSC[tD])- (innerAdj[t]-innerAdj[tD]);
			standardTNoExp = standardTOdds  - (groupBuffAdjraw[t]-groupBuffAdjraw[tD])*.001;
			standardTNoGold = standardTOdds   - (groupGoldBuffraw[t]-groupGoldBuffraw[tD])*.0015;
			standardTNoTBuff = standardTOdds  - (teamBuff[t] - teamBuff[tD])*.05	;
			standardTNoTw = standardTOdds  -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1 ;
			standardTNoChmpn = standardTOdds - championAdjustment*.1;
			standardTNoTP = standardTOdds  + (innerAdjNoTP[t]-innerAdjNoTP[tD]) - (innerAdj[t]-innerAdj[tD])  -  (this.team[t].compositeRating.teamPlayer-this.team[tD].compositeRating.teamPlayer )*.1;
			standardTNoAg = standardTOdds + (innerAdjNoAg[t]-innerAdjNoAg[tD]) - (innerAdj[t]-innerAdj[tD]);
			towerToChamp = (this.team[t].compositeRating.championKilling-this.team[tD].compositeRating.championKilling)*.1 -  (this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1 ;

		}
	//	console.log(championAdjustment);
    //   console.log( ((this.team[t].compositeRating.toweringAttack-this.team[tD].compositeRating.toweringDefend)*.1)+ "  "+ ((this.team[t].compositeRating.teamPlayer-this.team[tD].compositeRating.teamPlayer)*.1)+ " " + (innerAdj[t]-innerAdj[tD])+" "+	 championAdjustment*.1		+" "+  ((teamBuff[t] - teamBuff[tD],teamBuffPower)*.05)+	" "	+ ((groupBuffAdjraw[t]/groupBuffAdjraw[tD])*.01)	+"	"+ ((groupGoldBuffraw[t]/groupGoldBuffraw[tD])*.015))

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

//console.log("standardTOdds: "+standardTOdds+" towerToChamp: "+towerToChamp);

		standardCOdds = this.oddsTransformation(standardCOdds,1.15,3.95,inhibBaronSynergy,2);
		standardCNoSC = this.oddsTransformation(standardCNoSC,1.15,3.95,inhibBaronSynergy,2);
		standardCNoExp = this.oddsTransformation(standardCNoExp,1.15,3.95,inhibBaronSynergy,2);
		standardCNoGold = this.oddsTransformation(standardCNoGold,1.15,3.95,inhibBaronSynergy,2);
		standardCNoTBuff = this.oddsTransformation(standardCNoTBuff,1.15,3.95,inhibBaronSynergy,2);
		standardCNoCK = this.oddsTransformation(standardCNoCK,1.15,3.95,inhibBaronSynergy,2);
		standardCNoChmpn = this.oddsTransformation(standardCNoChmpn,1.15,3.95,inhibBaronSynergy,2);
		standardCNoTP = this.oddsTransformation(standardCNoTP,1.15,3.95,inhibBaronSynergy,2);
		standardCNoAg = this.oddsTransformation(standardCNoAg,1.15,3.95,inhibBaronSynergy,2);

		standardTOdds = this.oddsTransformation(standardTOdds,0.70,3.15,inhibBaronSynergy,2.5);
		standardTNoSC = this.oddsTransformation(standardTNoSC,0.70,3.15,inhibBaronSynergy,2.5);
		standardTNoExp = this.oddsTransformation(standardTNoExp,0.70,3.15,inhibBaronSynergy,2.5);
		standardTNoGold = this.oddsTransformation(standardTNoGold,0.70,3.15,inhibBaronSynergy,2.5);
		standardTNoTBuff = this.oddsTransformation(standardTNoTBuff,0.70,3.15,inhibBaronSynergy,2.5);
		standardTNoTw = this.oddsTransformation(standardTNoTw,0.70,3.15,inhibBaronSynergy,2.5);
		standardTNoChmpn = this.oddsTransformation(standardTNoChmpn,0.70,3.15,inhibBaronSynergy,2.5);
		standardTNoTP = this.oddsTransformation(standardTNoTP,0.70,3.15,inhibBaronSynergy,2.5);
		standardTNoAg = this.oddsTransformation(standardTNoAg,0.70,3.15,inhibBaronSynergy,2.5);



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
		var masterImpact, timeImpact, goldImpact, expImpact,outerDifficulty, innerDifficulty, inhibTowerDifficulty, restImpact;
//		masterImpact = .80;
		masterImpact = g.masterGameSimAdjuster;

//		timeImpact = 60;
		timeImpact = 60/masterImpact;
//		timeImpact = 120;
		goldImpact = 600/masterImpact;
//		goldImpact = 1200;
		expImpact = 600/masterImpact;
//		expImpact = 1200;
		outerDifficulty = .15*masterImpact;  // really inner and baron
//		outerDifficulty = .07;  // really inner and baron
		innerDifficulty = .30*masterImpact; // inhib towers
//		innerDifficulty = .15; // inhib towers
		inhibTowerDifficulty = .30*masterImpact;	 // really nexus
//		inhibTowerDifficulty = .15;	 // really nexus
		restImpact = 1.00*masterImpact; // includes champions, rations, deaths, buffs
//		restImpact = .50; // includes champions, rations, deaths, buffs


		baseLevelExp = (groupBuffAdjraw[t])/expImpact;
		baseLevelGld = (groupGoldBuffraw[t])/goldImpact;

		OTLevel = baseLevelExp + baseLevelGld - 0.20 + this.t/timeImpact;
		DLevel = baseLevelExp + baseLevelGld - 0.20+ this.t/timeImpact;
		ITLevel = baseLevelExp + baseLevelGld - .45 + outerSum*outerDifficulty + this.t/timeImpact;
		BLevel = baseLevelExp + baseLevelGld - .45 + outerSum*outerDifficulty + this.t/timeImpact;
		HTLevel = baseLevelExp + baseLevelGld - .90 + innerSum*innerDifficulty + this.t/timeImpact;
		NTLevel = baseLevelExp + baseLevelGld - .90 + inhibTsum*inhibTowerDifficulty + this.t/timeImpact;
		NLevel = baseLevelExp + baseLevelGld - .90 + inhibTsum*inhibTowerDifficulty + this.t/timeImpact;

		standardTOdds *= restImpact;
		standardCOdds *= restImpact;

	//	console.log(this.t+" "+standardTOdds);

		if (riftKilled == true && riftTimer > this.t) {
			standardTOdds += .33;
		}
//console.log(this.t+" "+OTLevel+" "+standardTOdds);

		outerTowerOdds = OTLevel+ standardTOdds;
		outerTowerOddsNoSC = OTLevel + standardTNoSC;
		outerTowerOddsNoExp = OTLevel + standardTNoExp - baseLevelExp ;
		outerTowerOddsNoGold = OTLevel + standardTNoGold -   baseLevelGld;
		outerTowerOddsNoTBuff = OTLevel + standardTNoTBuff;
		outerTowerOddsNoTBuffAdj = OTLevel + standardTNoTBuffAdj;

		outerTowerOddsNoTw = OTLevel + standardTNoTw;
		outerTowerOddsNoChmpn = OTLevel+ standardTNoChmpn;
		outerTowerOddsNoTP = OTLevel + standardTNoTP;
		outerTowerOddsNoAg = OTLevel + standardTNoAg;


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

		innerTowerOdds = ITLevel+ standardTOdds;

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

		if (this.t<20) {
			baronOdds = -.01;
		} else {
			baronOdds = BLevel + standardTOdds;;
//			baronOdds = 10*2*objectiveOddsAdjustment*inhibBaronSynergy*2*((championAdjustment/50+(Math.pow(innerAdj[t]/innerAdj[tD],innerPower))*(.10*groupNumber-.20)*Math.pow(teamBuff[t]/teamBuff[tD],teamBuffPower)*Math.pow(groupGoldBuff,groupGoldBuffPower)*Math.pow(groupBuff,groupBuffPower)*Math.pow((teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5),teamBuffAdjPower))*.5);
		}

		inhibTowerOdds = HTLevel + standardTOdds;
		inhibOdds = HTLevel + standardTOdds;


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

		}
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

//		if (champOdds <= .15) {
		if (champOdds <= .05) {
//		  champOdds = .15;
		//  champOdds = .05;
		}

		////TODO
		// make CS feed into player and team buff
		//
		////////////////////////// Minions (CreepScore)

///////////////////////////////////////////////////////////////////       CS

		let laneCSVar = this.laneCS (creepOdds,creeps,goldTime,playerGoldBuff,playerBuff,creepPlayerBuff,playerDeaths);
		playerBuff = laneCSVar.playerBuff;
		playerGoldBuff = laneCSVar.playerGoldBuff;


// console.log("got here");
		///////////////////// Jungle monsters

		//http://leagueoflegends.wikia.com/wiki/Jungling?file=Jungle_camps_SR.jpg
		// 4 yellow, 1 red, blue (baron and dragon handled elsewhere)

		/////////////////////////////// JUNGLE

	let jungleCSVar = this.jungleCS (creepOdds,creepOddsOpp,creeps,playerBuff,playerGoldBuff,playerDeaths,goldTime,junglePlayerBuff);
		playerBuff = jungleCSVar.playerBuff;
		playerGoldBuff = jungleCSVar.playerGoldBuff;
// console.log("got here");

///////////////////////////////// Group Type was too restrictive, this should loosen up as time goes on
///////////////////////// after 25 minutes make sure outer towers fall
	    let outerTowersAlwaysFallVar = this.outerTowersAlwaysFall (outcome,t,tD,p,groupType,groupNumber,groupBuffAdj,outerTowerSum,outerTowerList,outerTowerOdds,goldTime,playerBuff,playerGoldBuff,structurePlayerBuff,structurePlayerBuffAll);
		outcome = outerTowersAlwaysFallVar.outcome;
		outerTowerList = outerTowersAlwaysFallVar.outerTowerList;
		playerBuff = outerTowersAlwaysFallVar.playerBuff;
		playerGoldBuff = outerTowersAlwaysFallVar.playerGoldBuff;



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

	//	console.log(g.champType+" "+objectivesFirst);
		//console.log(g.startingSeason);

//		let resultUser = toUI(['prompt', 'This will play through multiple seasons, using the AI to manage your team. How many seasons do you want to simulate?', '5'], conditions);
	/*	let resultUser = toUI(['prompt', 'This will play through multiple seasons, using the AI to manage your team. How many seasons do you want to simulate?', '5']);
		let numSeasons = parseInt(resultUser, 10);
		//console.log(numSeasons);
		let objectiveKills;
		if (Number.isInteger(numSeasons)) {
			objectiveKills = true;
		//	local.autoPlaySeasons = numSeasons;
			//autoPlay(conditions);
		}
		console.log(resultUser);
		console.log(numSeasons);
		console.log(objectiveKills);*/

		if (Math.random() < objectivesFirst) {

						///////////////// BARON
							let baronVar = this.baron (p,groupNumber,innerTowerList,baronRespawn,baronList,baronBuff,teamBuff,outcome,groupType,groupBuffAdj,baronOdds,t,tD,playerBuff,playerGoldBuff,goldTime,structurePlayerBuff,structurePlayerBuffAll);
							playerBuff = baronVar.playerBuff;
							playerGoldBuff = baronVar.playerGoldBuff;
							baronRespawn = baronVar.baronRespawn;
							baronList = baronVar.baronList;
							teamBuff = baronVar.teamBuff;
							baronBuff = baronVar.baronBuff;
							outcome = baronVar.outcome;
							//return {playerBuff,playerGoldBuff,baronRespawn,baronList,teamBuff,baronBuff,outcome} ;

		///////////////// DRAGON

							if (g.champType == 0) {
								// only LOL has dragon
									let dragonVar = this.dragon (dragonRespawn,dragonList,dragonOdds,outcome,groupType,groupBuffAdj,p,t,tD,goldTime,groupNumber,playerBuff,structurePlayerBuff,structurePlayerBuffAll,playerGoldBuff,teamBuff);
									outcome = dragonVar.outcome;
									dragonList = dragonVar.dragonList;
									dragonRespawn = dragonVar.dragonRespawn;
									teamBuff = dragonVar.teamBuff;
									dragonBuff = dragonVar.dragonBuff;
									playerBuff = dragonVar.playerBuff;
									playerGoldBuff = dragonVar.playerGoldBuff;


									let riftVar = this.rift (dragonOdds,outcome,groupType,groupBuffAdj,p,t,tD,goldTime,groupNumber,playerBuff,structurePlayerBuff,structurePlayerBuffAll,playerGoldBuff,teamBuff);
									outcome = riftVar.outcome;

							}
		//return {outcome,dragonList,dragonRespawn,teamBuff,dragonBuff,playerBuff,playerGoldBuff} ;



				// console.log("got here");
						/////////// NEXUS
						let nexusVar = this.nexus (nexusTowerList,inhibList,outcome,groupBuffAdj,t,p,nexusOdds,groupNumber);
						outcome = nexusVar.outcome;

						if (outcome!= "nexus") {

					// console.log("got here");
								///////////////// NEXUS TOWERS


							let nexusTowerVar = this.nexusTower (0,inhibTowerList,inhibFirstTaken,nexusTowerList,outcome,groupBuffAdj,nexusTowerOdds,shotCaller,t,tD,p,
										nexusTowerOddsNoSC,nexusTowerOddsNoExp,nexusTowerOddsNoGold,nexusTowerOddsNoTBuff,nexusTowerOddsNoTBuffAdj,nexusTowerOddsNoTw,nexusTowerOddsNoTP,
										nexusTowerOddsNoAg,nexusTowerOddsNoChmpn,
										goldTime,groupNumber,playerBuff,structurePlayerBuff,structurePlayerBuffAll,playerGoldBuff);
							//return {outcome,nexusTowerList,playerBuff,playerGoldBuff} ;
							outcome = nexusTowerVar.outcome;
							nexusTowerList = nexusTowerVar.nexusTowerList;
							playerBuff = nexusTowerVar.playerBuff;
							playerGoldBuff = nexusTowerVar.playerGoldBuff;

							let nexusTowerVar2 = this.nexusTower (1,inhibTowerList,inhibFirstTaken,nexusTowerList,outcome,groupBuffAdj,nexusTowerOdds,shotCaller,t,tD,p,
										nexusTowerOddsNoSC,nexusTowerOddsNoExp,nexusTowerOddsNoGold,nexusTowerOddsNoTBuff,nexusTowerOddsNoTBuffAdj,nexusTowerOddsNoTw,nexusTowerOddsNoTP,
										nexusTowerOddsNoAg,nexusTowerOddsNoChmpn,
										goldTime,groupNumber,playerBuff,structurePlayerBuff,structurePlayerBuffAll,playerGoldBuff);
							//return {outcome,nexusTowerList,playerBuff,playerGoldBuff} ;
							outcome = nexusTowerVar2.outcome;
							nexusTowerList = nexusTowerVar2.nexusTowerList;
							playerBuff = nexusTowerVar2.playerBuff;
							playerGoldBuff = nexusTowerVar2.playerGoldBuff;


							///////////////// INHIB  inhibList

							let inhibsVar = this.inhibs3 (inhibTowerList,inhibList,outcome,groupType,groupBuffAdj,inhibOdds,t,tD,p,inhibFirstTaken,inhibRespawn,groupNumber);
							inhibList = inhibsVar.inhibList;
							inhibFirstTaken = inhibsVar.inhibFirstTaken;
							inhibRespawn = inhibsVar.inhibRespawn;
							outcome = inhibsVar.outcome;
		//return {inhibList,inhibFirstTaken,inhibRespawn,outcome} ;

//outerSum,,inhibTsum;&& (innerSum>Math.random())
							///////////////// INHIB TOWERS
					// console.log("got here");

							let inhibTowersVar = this.inhibTowers (innerTowerList,inhibTowerList,outcome,groupType,groupBuffAdj,inhibTowerOdds,shotCaller,t,tD,p,groupNumber,inhibTowerOddsNoSC,inhibTowerOddsNoExp,inhibTowerOddsNoGold,inhibTowerOddsNoTBuff,inhibTowerOddsNoTBuffAdj,
										inhibTowerOddsNoTw,inhibTowerOddsNoTP,inhibTowerOddsNoAg,inhibTowerOddsNoChmpn,goldTime,playerBuff,playerGoldBuff,structurePlayerBuff,structurePlayerBuffAll);
							outcome = inhibTowersVar.outcome;
							inhibTowerList = inhibTowersVar.inhibTowerList;
							playerBuff = inhibTowersVar.playerBuff;
							playerGoldBuff = inhibTowersVar.playerGoldBuff;


						///////////////// INNER TOWERS
							let innerTowersVar = this.innerTowers (outerTowerList,innerTowerList,outcome,groupType,groupBuffAdj,
								innerTowerOddsNoSC,innerTowerOddsNoExp,innerTowerOddsNoGold,innerTowerOddsNoTBuff,innerTowerOddsNoTBuffAdj,
								innerTowerOddsNoTw,innerTowerOddsNoTP,innerTowerOddsNoAg,innerTowerOddsNoChmpn,
								t,tD,p,innerTowerOdds,goldTime,shotCaller,groupNumber,structurePlayerBuff,structurePlayerBuffAll,playerBuff,playerGoldBuff);

							outcome = innerTowersVar.outcome;
							innerTowerList = innerTowersVar.innerTowerList;
							playerBuff = innerTowersVar.playerBuff;
							playerGoldBuff = innerTowersVar.playerGoldBuff;


							///////////////// OUTER TOWERS
							let outerTowersVar = this.outerTowers (outerTowerList,outcome,groupType,groupBuffAdj,
									outerTowerOddsNoSC,outerTowerOddsNoExp,outerTowerOddsNoGold,outerTowerOddsNoTBuff,outerTowerOddsNoTBuffAdj,
									outerTowerOddsNoTw,outerTowerOddsNoTP,outerTowerOddsNoAg,outerTowerOddsNoChmpn,
									t,tD,p,outerTowerOdds,goldTime,shotCaller,groupNumber,structurePlayerBuff,structurePlayerBuffAll,playerBuff,playerGoldBuff);

							outcome = outerTowersVar.outcome;
							outerTowerList = outerTowersVar.outerTowerList;
							playerBuff = outerTowersVar.playerBuff;
							playerGoldBuff = outerTowersVar.playerGoldBuff;
						}
		} else {
			//////////////// Killing Champions (put after everything else, those are more important)
			var numberOfAssists;
			var assistLocation;
			if  ((outcome != "done") && (outcome != "nexus")  && (groupBuffAdj>0)) {

				var modifiedGroupAttack;
				  modifiedGroupAttack = groupAttack[t];
				for (i = 0; i < groupNumber; i++) {
					if (p[i]==4) {
						if (g.champType == 0) {
							modifiedGroupAttack += (playerGoldBuff[t][p[i]]+playerBuff[t][p[i]]+championData[championsList[t][p[i]]].ratings.damage*this.t)/10;
						} else {
							modifiedGroupAttack += (playerGoldBuff[t][p[i]]+playerBuff[t][p[i]]+championData[championsList[t][p[i]]].ratings.carry*this.t)/10;
						}
//								groupAttack[j] += championData[championsList[j][i]].ratings.damage;
	//							groupDefense[j] += championData[championsList[j][i]].ratings.toughness;
							//groupAttack[j] += championData[championsList[j][i]].ratings.carry;
							//groupDefense[j] += championData[championsList[j][i]].ratings.durable;

//						modifiedGroupAttack += (playerGoldBuff[t][p[i]]+playerBuff[t][p[i]]+.5*this.t)/10;
					} else {
						if (g.champType == 0) {
							modifiedGroupAttack += (playerGoldBuff[t][p[i]]+playerBuff[t][p[i]]+championData[championsList[t][p[i]]].ratings.damage*this.t);
						} else {
							modifiedGroupAttack += (playerGoldBuff[t][p[i]]+playerBuff[t][p[i]]+championData[championsList[t][p[i]]].ratings.carry*this.t);
						}
						//modifiedGroupAttack += playerGoldBuff[t][p[i]]+ playerBuff[t][p[i]]+.5*this.t;
					}
				}

				var modifiedGroupDefense,maxDefense;

				maxDefense = playerGoldBuff[tD][p[0]] +playerBuff[tD][p[0]] +.5*this.t;
				modifiedGroupDefense = groupDefense[t];
				for (i = 0; i < groupNumber; i++) {
				   if ((playerBuff[tD][p[i]] +playerGoldBuff[tD][p[i]] +.5) > maxDefense) {
						if (g.champType == 0) {
							maxDefense += playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] + championData[championsList[tD][p[i]]].ratings.toughness*this.t;
						} else {
							maxDefense += playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] + championData[championsList[tD][p[i]]].ratings.durable*this.t;
						}
//						maxDefense = playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +.5*this.t;
				   }
				}

  			   for (i = 0; i < groupNumber; i++) {
					if (g.champType == 0) {
						modifiedGroupDefense +=  maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[tD][p[i]]].ratings.toughness*this.t);
					} else {
						modifiedGroupDefense +=  maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[tD][p[i]]].ratings.durable*this.t);
					}
//				   modifiedGroupDefense += maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +.5*this.t);
				}

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

					killer = p[0];
					killerRating = random.randInt(0,  modifiedGroupAttack);

					rangeBot = 0;
					rangeTop = 0;
					for (i = 0; i < groupNumber; i++) {
						if (p[i]==4) {
							if (g.champType == 0) {
								rangeTop += (championData[championsList[t][p[i]]].ratings.damage*this.t+playerBuff[t][p[i]]+playerGoldBuff[t][p[i]])/10;
						//		modifiedGroupDefense +=  maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[j][i]].ratings.toughness*this.t);
							} else {
								rangeTop += (championData[championsList[t][p[i]]].ratings.carry*this.t+playerBuff[t][p[i]]+playerGoldBuff[t][p[i]])/10;
						//		modifiedGroupDefense +=  maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[j][i]].ratings.durable*this.t);
							}
							//rangeTop += (.5*this.t+playerBuff[t][p[i]]+playerGoldBuff[t][p[i]])/10;
						} else {
							if (g.champType == 0) {
								rangeTop += championData[championsList[t][p[i]]].ratings.damage*this.t+playerBuff[t][p[i]]+playerGoldBuff[t][p[i]];
						//		modifiedGroupDefense +=  maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[j][i]].ratings.toughness*this.t);
							} else {
								rangeTop += championData[championsList[t][p[i]]].ratings.carry*this.t+playerBuff[t][p[i]]+playerGoldBuff[t][p[i]];
						//		modifiedGroupDefense +=  maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[j][i]].ratings.durable*this.t);
							}
							//rangeTop += .5*this.t+playerBuff[t][p[i]]+playerGoldBuff[t][p[i]];
						}
					//if (g.champType == 0) {
							//modifiedGroupAttack += (playerGoldBuff[t][p[i]]+playerBuff[t][p[i]]+championData[championsList[t][p[i]]].ratings.damage*this.t);
						//} else {
							//modifiedGroupAttack += (playerGoldBuff[t][p[i]]+playerBuff[t][p[i]]+championData[championsList[t][p[i]]].ratings.carry*this.t);
						//}

						if ((killerRating<=rangeTop) && (killerRating >= rangeBot)) {

						  killer = p[i];
						   rangeBot = rangeTop;
						} else {
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

					numberOfAssists = 0;
					assistLocation = [0,0,0,0];
					for (i = 0; i < groupNumber; i++) {
					  if ((playerDeaths[t][p[i]] == 0) && (p[i]!=killer)) {
						assistLocation[numberOfAssists] = p[i];
						numberOfAssists += 1;
					  }
					}

					assisted = assistLocation[0];
					assisted2 = assistLocation[1];
					assisted3 = assistLocation[2];
					assisted4 = assistLocation[3];

					// made based on defense?
					killed = p[random.randInt(0,  groupNumber-1)];

					var killedRating,j;

					if (Math.random < .9) {
						killed = p[0];
						killedRating = random.randInt(0,  modifiedGroupDefense);
						rangeBot = 0;
						rangeTop = 0;
						for (i = 0; i < groupNumber; i++) {

							if (g.champType == 0) {
								rangeTop += maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] + championData[championsList[tD][p[i]]].ratings.toughness*this.t);
							} else {
								rangeTop += maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[tD][p[i]]].ratings.durable*this.t);
							}
						//	rangeTop += maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +.5*this.t);

		//if (g.champType == 0) {
						//modifiedGroupDefense +=  maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[j][i]].ratings.toughness*this.t);
					//} else {
						//modifiedGroupDefense +=  maxDefense - (playerGoldBuff[tD][p[i]] +playerBuff[tD][p[i]] +championData[championsList[j][i]].ratings.durable*this.t);
					//}

							if ((killedRating<=rangeTop) && (killedRating >= rangeBot)) {
							  killed = p[i];
							   rangeBot = rangeTop;
							} else {
							   rangeBot = rangeTop;

							}
						}

					}

					goldTime = this.t*500/60/1000;
					if (goldTime> 500) {
					  goldTime = 500/1000/this.t*killGoldAdj;
					}

					if ((playerDeaths[t][killer] == 0) && (playerDeaths[tD][killed] == 0)) {
						this.recordStat(t, killer, "trb",goldTime);
						if ((assisted == killer) || (playerDeaths[t][assisted] == 1))  {
						   assisted = 9999;
						}

						playerDeaths[tD][killed] = 1;
						playerRespawn[tD][killed] = this.t;

						if (numberOfAssists == 0)  {
							this.recordPlay("kill", t, [this.team[t].player[killer].userID,this.team[tD].player[killed].userID]);
							//console.log(this.team);
							goldTime = this.t*500/60/1000;
							if (goldTime> 500) {
							  goldTime = 500/1000/this.t*killGoldAdj;
							}
							this.recordStat(t, killer, "trb",goldTime);
							playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus);
							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);

						} else if (numberOfAssists == 1) {
							this.recordStat(t, assisted, "fgp");
							this.recordPlay("assist1", t, [this.team[t].player[killer].userID,this.team[tD].player[killed].userID,this.team[t].player[assistLocation[0]].userID]);

							goldTime = this.t*500/60/1000/2;
							if (goldTime> 500/2) {
							  goldTime = 500/1000/2/this.t*killGoldAdj;
							}
							this.recordStat(t, killer, "trb",goldTime);
							this.recordStat(t, assisted, "trb",goldTime);
							playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus/2*2);
							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);

							if (assisted == 4) {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/2);
								playerGoldBuff[t][assisted] *= (1+(goldTime/5));
								playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);


							} else {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/2);
								playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);
							}
							if (this.t < 10) {
								this.recordStat(t, assisted, "fgpAtRim");
							}

						} else if (numberOfAssists == 2) {
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
							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);
							playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);
							playerGoldBuff[t][assisted2] *= (1+goldTime/playerGoldBuff[t][assisted2]);
							if (assisted == 4) {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/3);

							} else {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/3);
							}
							if (assisted2 == 4) {
								playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/3);
							} else {
								playerBuff[t][assisted2] += (1+(playerBuff[tD][assisted2]-1)*killBonus/3);
							}
							if (this.t < 10) {
								this.recordStat(t, assisted, "fgpAtRim");
								this.recordStat(t, assisted2, "fgpAtRim");
							}

						} else if (numberOfAssists == 3) {
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

							if (this.t < 10) {
								this.recordStat(t, assisted, "fgpAtRim");
								this.recordStat(t, assisted2, "fgpAtRim");
								this.recordStat(t, assisted3, "fgpAtRim");
							}

						} else {

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

							playerGoldBuff[t][killer] *= (1+goldTime/playerGoldBuff[t][killer]);
							playerGoldBuff[t][assisted] *= (1+goldTime/playerGoldBuff[t][assisted]);
							playerGoldBuff[t][assisted2] *= (1+goldTime/playerGoldBuff[t][assisted2]);
							playerGoldBuff[t][assisted3] *= (1+goldTime/playerGoldBuff[t][assisted3]);
							playerGoldBuff[t][assisted4] *= (1+goldTime/playerGoldBuff[t][assisted4]);

							playerBuff[t][killer] += (1+(playerBuff[tD][killed]-1)*killBonus/5*5);

							if (assisted == 4) {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/5);
							} else {
								playerBuff[t][assisted] += (1+(playerBuff[tD][assisted]-1)*killBonus/5);
							}

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

						this.recordStat(t, killer, "fg");
						if (firstBlood) {
				//			console.log(this.t);
							this.recordStat(t, killer, "firstBlood");
							firstBlood = false;
						}
						this.recordStat(tD, killed, "fga");
						if (this.t < 10) {
							this.recordStat(t, killer, "fgAtRim");
							this.recordStat(tD, killed, "fgaAtRim");

						}

					}
					outcome = "done";
				} else {

				}
			}
		}

		if (this.t > 100) {
			//console.log(this.t);
		}
		if (this.t>110) {
				outcome = "nexus";

		}

        return outcome;
    }


    groupOdds() {


		let timeOne;
		let timeTwo;
		let timeThree;
		let timeFour;

		let gankingAggression;


		//console.log(this.t);
		gankingAggression = ((this.team[this.o].coach.topJGL+this.team[this.d].coach.topJGL-10) +
			(this.team[this.o].coach.jglJGL+this.team[this.d].coach.jglJGL-10) +
			(this.team[this.o].coach.midJGL+this.team[this.d].coach.midJGL-10) +
			(this.team[this.o].coach.supJGL+this.team[this.d].coach.supJGL-10) +
			(this.team[this.o].coach.adcJGL+this.team[this.d].coach.adcJGL-10) ) /50; // range from -1 to 1

		if (this.t <5) {
			timeOne = .95 - gankingAggression/5;
			timeTwo = .05 + gankingAggression/5;
			timeThree = 0;
			timeFour = 0;
		} else if (this.t <10) {
	/*		timeOne = .6;
			timeTwo = .3;
			timeThree = .09;
			timeFour = .01;*/
			timeOne = .5 - gankingAggression/5;
			timeTwo = .4 + gankingAggression/5;
			timeThree = .09;
			timeFour = .01;
		} else if (this.t <20) {
			if (this.t < 15) {
				gankingAggression /= 5;
			} else {
				gankingAggression = 0;
			}
			timeOne = .3 - gankingAggression;
			timeTwo = .3 + gankingAggression;
//			timeTwo = .2;
			timeThree = .3 ;
			timeFour = .1 + gankingAggression;
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

		return {timeOne, timeTwo, timeThree, timeFour};

	}

    pickTeam() {

		let t;
		let tD;

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

		return {t, tD};

	}

    basicGold(playerGoldBuff) {

		if (this.t > (.90)) {
			let goldTime = Math.round(this.dt*7/5*100)/1000; //Math.round(
	//		console.log(this.dt+" "+goldTime);
		   for (let i = 0; i < 2; i++) {
				let iO =  (i-1)*(i-1);
				for (let j = 0; j < 5; j++) {
			//			goldTime = this.dt*7/5*100;
			//			console.log(this.dt+" "+goldTime);
						this.recordStat(i, j, "trb",goldTime);
						this.recordStat(iO, j, "stl",goldTime);
						//playerBuff[i][j] *= (1+(goldTime/5));
					//	playerGoldBuff[i][j] *= (1+(goldTime/5));
						playerGoldBuff[i][j] *= (1+(goldTime/playerGoldBuff[i][j] ));
						/*this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.attack *= (1+(goldTime/5));
						this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.defense *= (1+(goldTime/5));
						this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.ability *= (1+(goldTime/5));	*/


				}
			}
		}

		return playerGoldBuff;

	}


    pickPlayers(p, timeOne,timeTwo,timeThree,timeFour) {

		let	groupNumber;
		let	groupType;


		let topAggression = (this.team[this.o].coach.top+this.team[this.d].coach.top-10);
		let jglAggression = (this.team[this.o].coach.jgl+this.team[this.d].coach.jgl-10);
		let midAggression = (this.team[this.o].coach.mid+this.team[this.d].coach.mid-10);
		let adcAggression = (this.team[this.o].coach.adc+this.team[this.d].coach.adc-10);
		let supAggression = (this.team[this.o].coach.sup+this.team[this.d].coach.sup-10);

		let topJGLAggression = (this.team[this.o].coach.topJGL+this.team[this.d].coach.topJGL-10);
		let jglJGLAggression = (this.team[this.o].coach.jglJGL+this.team[this.d].coach.jglJGL-10);
		let midJGLAggression = (this.team[this.o].coach.midJGL+this.team[this.d].coach.midJGL-10);
		let adcJGLAggression = (this.team[this.o].coach.adcJGL+this.team[this.d].coach.adcJGL-10);
		let supJGLAggression = (this.team[this.o].coach.supJGL+this.team[this.d].coach.supJGL-10);
		if (this.t > 15) {
			topAggression = 0;
			jglAggression = 0;
			midAggression = 0;
			adcAggression = 0;
			supAggression = 0;

			topJGLAggression = 0;
			jglJGLAggression = 0;
			midJGLAggression = 0;
			adcJGLAggression = 0;
			supJGLAggression = 0;
		}
		if (Math.random() < timeOne) {
			groupNumber = 1;

			 if (Math.random() < 1/6 +topAggression/60 ) { // range from almost 0 to double odds
				p[0] = 0;
				groupType = 0;

//			 } else if (Math.random() < 1/3) {
			 } else if (Math.random() < 1/5  +jglAggression/50) {
			   p[0] = 1;
				groupType = 1;

			 } else if (Math.random() < 1/4  +midAggression/40) {
			   p[0] = 2;
				groupType = 2;

			 } else if (Math.random() < 1/3  +adcAggression/30) {
			   p[0] = 3;
				groupType = 4;

			 } else if (Math.random() < 1/2  +supAggression/20) {
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

			 if (Math.random() < 1/8 +topJGLAggression/80) {
//			 if (Math.random() < 1/5) {
			   p[0] = 0;
			   p[1] = 1;
				groupType = .5;

			 } else if (Math.random() < 1/7 +midJGLAggression/70) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 2;
			   p[1] = 1;
				groupType = 1.5;
			 } else if (Math.random() < 1/6) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 0;
			   p[1] = 2;
				groupType = 1;
			 } else if (Math.random() < 1/5 ) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 0;
			   p[1] = 4;
				groupType = 2;
			 } else if (Math.random() < 1/4 +supJGLAggression/40) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 1;
			   p[1] = 4;
				groupType = 2.5;
			 } else if (Math.random() < 1/3 ) {
//			 } else if (Math.random() < 1/5) {
			   p[0] = 2;
			   p[1] = 4;
				groupType = 3;
			 } else if (Math.random() < 1/2 ) {
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

		return {p, groupType, groupNumber};

	}


    groupBuffs(t,tD,p,groupNumber,playerBuff,playerGoldBuff) {

		let groupBuff;
		let groupGoldBuff;
		var groupBuffAdjraw = [1.00,1.00];
		var groupGoldBuffraw = [1.00,1.00];

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

		return {groupBuff,groupGoldBuff,groupBuffAdjraw,groupGoldBuffraw};

	}

    dragonBarronBuffs(dragonBuff,teamBuff,playerRespawn,playerDeaths) {

        for (let i = 0; i < 2; i++) {
			if ( ((this.t-dragonBuff[i]) > 3.00) ) {
						dragonBuff[i] = 9999;
						teamBuff[i] /= 1.40;
			}
			if ( ((this.t-baronBuff[i]) > 3.00) ) {
						baronBuff[i] = 9999;
						teamBuff[i] /= 1.50;
			}
			for (let j = 0; j < 5; j++) {
				if (this.t-playerRespawn[i][j] > 1.50 ) {
				  playerRespawn[i][j] = 9999;
				  playerDeaths[i][j] = 0;

				}
			//	playerBuff[t][i] *= [[1,1,1,1,1],[1,1,1,1,1]];
			}
		}

		return {dragonBuff,teamBuff,playerRespawn,playerDeaths};

	}

    deathAdjustment(groupNumber,p, pAlt, t, tD, playerDeaths,playerBuff,playerGoldBuff,groupBuff,groupGoldBuff,groupBuffAdjraw,groupGoldBuffraw,teamBuff) {

		let pFind = 0;
		let teamBuffAdj = [5,5];
        for (let j = 0; j < 2; j++) {
//			for (i = 0; i < groupNumber; i++) {
			for (let i = 0; i < 5; i++) {
			   if (playerDeaths[j][i] == 1)  {

					// 5 is whole team, 0 is nobody left. So can give a team fraction strength, but still keep track of max teambuff strength.
			        teamBuffAdj[j] -= 1;
					for (let pFind = 0; pFind < groupNumber; pFind++) {
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

		///////////////////////// This shouldn't be necessary
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



		///////////////////////////// This shouldn't be necessary
        for (let j = 0; j < 2; j++) {

			if 	(teamBuffAdj[j]>1000) {
	//		 console.log(teamBuffAdj[j]);
			  teamBuffAdj[j] = 1000;
			}
			if 	(teamBuffAdj[j]<.001) {
//console.log(teamBuffAdj[j]);
			  teamBuffAdj[j] = .001;
			}

			// this wasn't adjusted, where is it?

			if 	(teamBuff[j]>1000) {
	//		 console.log(teamBuff[j]);
			 teamBuff[j] = 1000;
			}
			if 	(teamBuff[j]<.001) {
	//		 console.log(teamBuff[j]);
			 teamBuff[j] = .001;
			}
		}

		return {groupBuff,groupGoldBuff,groupBuffAdjraw,groupGoldBuffraw, pAlt,teamBuff,teamBuffAdj};

	}

   teamComp(groupNumber,playerDeaths,p,t,outerAdj,innerAdj,outerAdjNoSC,innerAdjNoSC,outerAdjNoTP,innerAdjNoTP,groupBuffAdj) {

		let shotCaller = [0,0]
		let groupAttack = [0,0]
		let groupDefense = [0,0]
		let groupAbility = [0,0]
//					groupAttack[j] += this.team[j
        for (let j = 0; j < 2; j++) {

			let max1 = 0;
			let max2 = 0;
			this.team[j].compositeRating.teamPlayer = 0;
			this.team[j].compositeRating.shotcalling = 0;
			this.team[j].compositeRating.ganking = 0;
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

			for (let i = 0; i < 5; i++) {
				if (max1 < this.team[j].player[i].compositeRating.shotcalling) {
					max1 = this.team[j].player[i].compositeRating.shotcalling ;
					max2 = this.team[j].player[i].compositeRating.teamPlayer ;
					shotCaller[j] = i;
				}
				this.team[j].compositeRating.teamPlayer += this.team[j].player[i].compositeRating.teamPlayer;
				//console.log(JSON.stringify(this.team[j].player[i].compositeRating));
				//console.log(JSON.stringify(this.team[j].player[i].compositeRating.ganking));
				//console.log(JSON.stringify(this.team[j].player[i].compositeRating.ganking));
				//console.log(this.team[j].compositeRating.teamPlayer+" "+this.team[j].player[i].compositeRating.teamPlayer);
				this.team[j].compositeRating.ganking += this.team[j].player[i].compositeRating.ganking;
				this.team[j].compositeRating.mapVision += this.team[j].player[i].compositeRating.mapVision;
				this.team[j].compositeRating.wardDestruction += this.team[j].player[i].compositeRating.wardDestruction;
				this.team[j].compositeRating.wardPlacement += this.team[j].player[i].compositeRating.wardPlacement;
				this.team[j].compositeRating.laneSwitching += this.team[j].player[i].compositeRating.laneSwitching;
			}
			this.team[j].compositeRating.shotcalling = max1;
			this.team[j].compositeRating.teamPlayer -= max2;
			this.team[j].compositeRating.teamPlayer /= 4;

			this.team[j].compositeRating.allComposite += this.team[j].compositeRating.shotcalling+this.team[j].compositeRating.teamPlayer;
			this.team[j].compositeRating.allComposite += this.team[j].compositeRating.mapVision/5;

			this.team[j].compositeRating.allCompositeNoSC += this.team[j].compositeRating.teamPlayer;
			this.team[j].compositeRating.allCompositeNoSC += this.team[j].compositeRating.mapVision/5;






			groupAttack[j] = 0;
			groupDefense[j] = 0;
			groupAbility[j] = 0;
			max1 = 0;
			max2 = 0;
			let max3 = 0;
			let max4 = 0;

			let max5 = 0;
			let max6 = 0;
//		if (this.t>100) {
		if (this.t>200) {
		   console.log("groupAttack[t]: "+groupAttack[t]);
		   console.log("groupDefense[tD]: "+groupDefense[tD]);
		   console.log("groupAbility[t]: "+groupAbility[t]);
		   console.log("groupAbility[tD]: "+groupAbility[tD]);

		}

					//console.log(championsList);
					//console.log(this.team[0].player[0].champ2Rel[1]);

			for (let i = 0; i < groupNumber; i++) {

		//	console.log(this.team[j].player[i].champions[championsList[j][i]].draftValue);
		/*if (this.t<2) {
			console.log(this.team[j].player[i].champions.length);
			console.log(this.team[j].player[i].champ2Rel.length);
				console.log(	this.team[j].player[i].champions[championsList[j][i]].draftValue);
		}*/
		//players[i].champions[j].draftValue
				if (playerDeaths[j][p[i]] == 0) {
				//	console.log(this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.attack);

			//		groupAttack[j] += .5;
				//	groupDefense[j] += .5;
					groupAbility[j] += .5;	// not using?
					/// why is this needed? sometimes doesn't record number of champs right for some teams

					if (this.team[0].champ2Rel.length > this.team[1].champ2Rel.length) {
						championData = this.team[0].champ2Rel;
					} else {
						championData = this.team[1].champ2Rel;
					}
				//	console.log(championData.length);

					if (g.champType == 0) {
							groupAttack[j] += championData[championsList[j][p[i]]].ratings.damage;
							groupDefense[j] += championData[championsList[j][p[i]]].ratings.toughness;

					} else {
						groupAttack[j] += championData[championsList[j][p[i]]].ratings.carry;
						groupDefense[j] += championData[championsList[j][p[i]]].ratings.durable;
					}
		//			groupAbility[j] += this.team[j].champ2Rel[championsList[j][i]].ratings.ability;

					//console.log(this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.attack);
					//console.log(this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.defense);
					//console.log(this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.ability);
//		if (this.t>100) {
		if (this.t>200) {

		   console.log(championsList[j][i]+" "+j+" "+i+" this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.attack: "+this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.attack);
		   console.log(championsList[j][i]+" "+j+" "+i+"this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.defense: "+this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.defense);
		   console.log(championsList[j][i]+" "+j+" "+i+"this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.ability: "+this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.ability);

		}
/*					groupAttack[j] += this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.attack;
					groupDefense[j] += this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.defense;
					groupAbility[j] += this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.ability;	*/
				/*	if (max1<this.team[j].champ2Rel[championsList[j][i]].ratings.attack) {
						max1 = this.team[j].champ2Rel[championsList[j][i]].ratings.attack;
					}
					if (max2<this.team[j].champ2Rel[championsList[j][i]].ratings.defense) {
						max2 = this.team[j].champ2Rel[championsList[j][i]].ratings.defense;
					}
					if (max3<this.team[j].champ2Rel[championsList[j][i]].ratings.defense) {
						max3 = this.team[j].champ2Rel[championsList[j][i]].ratings.defense;
					}*/

				} else {
				 groupBuffAdj -= 1;
			//	 console.log("PLAYER DEAD"+p[i]);
				}
			//    console.log(t+" "+j+" "+groupAttack[j]+" "+this.team[j].player[i].champ2Rel[championsList[j][i]].ratings.attack+ " "+this.team[j].player[i].pos)
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
				for (let i = 0; i < groupNumber; i++) {

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
				for (let i = 0; i < groupNumber; i++) {
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
/*						this.team[j].compositeRating.teamPlayer = 0;
			this.team[j].compositeRating.shotcalling = 0;
			this.team[j].compositeRating.ganking = 0;
			this.team[j].compositeRating.mapVision = 0;
			this.team[j].compositeRating.wardDestruction = 0;
			this.team[j].compositeRating.wardPlacement = 0;
			this.team[j].compositeRating.laneSwitching = 0;
			this.team[j].compositeRating.aggression = 0;
			*/
			let wardAdjustment = this.team[j].compositeRating.wardDestruction+this.team[j].compositeRating.wardPlacement;


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
/*				outerAdj[j] =  (this.team[j].compositeRating.shotcalling+this.team[j].compositeRating.teamPlayer+this.team[j].compositeRating.mapVision+wardAdjustment+this.team[j].compositeRating.laneSwitching)/100;
				innerAdj[j] =  (this.team[j].compositeRating.shotcalling+this.team[j].compositeRating.teamPlayer+this.team[j].compositeRating.mapVision+wardAdjustment+this.team[j].compositeRating.laneSwitching)/100;*/
/*				outerAdj[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment*this.team[j].compositeRating.teamPlayer*teamworkAdjustment)/50/50*2;
				innerAdj[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment*this.team[j].compositeRating.teamPlayer*teamworkAdjustment)/50/50*2;

				outerAdjNoSC[j] =  (shotcallingAdjustment*this.team[j].compositeRating.teamPlayer*teamworkAdjustment)/50/50*2;
				innerAdjNoSC[j] =  (shotcallingAdjustment*this.team[j].compositeRating.teamPlayer*teamworkAdjustment)/50/50*2;*/


				outerAdj[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment+this.team[j].compositeRating.teamPlayer*teamworkAdjustment)/10;
				innerAdj[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment+this.team[j].compositeRating.teamPlayer*teamworkAdjustment)/10;

				outerAdjNoSC[j] =  (this.team[j].compositeRating.teamPlayer*teamworkAdjustment+1)/10;
				innerAdjNoSC[j] =  (this.team[j].compositeRating.teamPlayer*teamworkAdjustment+1)/10;

				outerAdjNoTP[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment+1)/10;
				innerAdjNoTP[j] =  (this.team[j].compositeRating.shotcalling*shotcallingAdjustment+1)/10;


				//console.log(outerAdj[j]+" "+outerAdjNoSC[j]);

			//	console.log(j+" "+groupNumber+" team: "+outerAdj[j]);
			}
		//	console.log(this.team[j].compositeRating.shotcalling+" "+this.team[j].compositeRating.teamPlayer);
		/*	nexTowerAdj[j] =
			nexusAdj[j] =
			inhibTowerAdj[j] =
			inhibAdj[j] =
			dragonAdj[j] =
			baronAdj[j] =			*/
	////////////////////////// This shouldn't be needed?
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
		}
		return {outerAdj,innerAdj,outerAdjNoSC,innerAdjNoSC,outerAdjNoTP,innerAdjNoTP,groupBuffAdj,groupAttack,groupDefense,groupAbility,shotCaller};

	}



   inOutStat(t,tD,outerAdj,innerAdj,outerAdjNoAg,innerAdjNoAg,outerAdjNoSC,innerAdjNoSC,outerAdjNoTP,innerAdjNoTP) {

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


		////////////////// Not needed?
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

		return {outerAdj,innerAdj,outerAdjNoAg,innerAdjNoAg,outerAdjNoSC,innerAdjNoSC,outerAdjNoTP,innerAdjNoTP};

	}

   respawnTimers(t,inhibRespawn,inhibList,inhibBaronSynergy,dragonRespawn,baronRespawn) {

		//Inhib
        for (let i = 0; i < 3; i++) {
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


		return {inhibRespawn,inhibList,inhibBaronSynergy,dragonRespawn,baronRespawn};

	}


   timeScaling(killCSRatio,jungleRatio,killBonus,structurePlayerBuff,structurePlayerBuffAll,creepPlayerBuff,junglePlayerBuff) {

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

		return {killCSRatio,jungleRatio,killBonus,structurePlayerBuff,structurePlayerBuffAll,creepPlayerBuff,junglePlayerBuff};

	}



	oddsTransformation (standardCOdds,add,divide,mutiplyDivWhat,What) {
//console.log(standardCOdds);
		standardCOdds += add;
		standardCOdds /= divide;
		standardCOdds *= mutiplyDivWhat/What;
//console.log(standardCOdds);
			return standardCOdds;

	}

	laneCS (creepOdds,creeps,goldTime,playerGoldBuff,playerBuff,creepPlayerBuff,playerDeaths) {

		////////////////////////// Minions (CreepScore)

///////////////////////////////////////////////////////////////////       CS
	   if ( (this.t > (.90+.10)) ) {  // 90 to spawn 10 to reach champion
		   for (let i = 0; i < 2; i++) {
				let iO =  (i-1)*(i-1);
				for (let j = 0; j < 5; j++) {

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
						creepOdds *= .90+.05*playerGoldBuff[i][4]/playerGoldBuff[iO][4]*playerBuff[i][4]/playerBuff[iO][4]+.05*this.team[i].player[4].compositeRating.teamPlayer/this.team[iO].player[4].compositeRating.teamPlayer;
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


		return {playerBuff,playerGoldBuff} ;

	}

	jungleCS (creepOdds,creepOddsOpp,creeps,playerBuff,playerGoldBuff,playerDeaths,goldTime,junglePlayerBuff) {

	   if ( (this.t > (.90+.10)) && (this.done == false) ) {  // 90 to spawn 10 to reach champion
		   for (let i = 0; i < 2; i++) {
				let iO =  (i-1)*(i-1);
				for (let j = 0; j < 5; j++) {
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

		return {playerBuff,playerGoldBuff} ;

	}



	outerTowersAlwaysFall (outcome,t,tD,p,groupType,groupNumber,groupBuffAdj,outerTowerSum,outerTowerList,outerTowerOdds,goldTime,playerBuff,playerGoldBuff,structurePlayerBuff,structurePlayerBuffAll) {

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

									for (let i = 0; i < groupNumber; i++) {
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (let i = 0; i < 5; i++) {
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

									for (let i = 0; i < groupNumber; i++) {
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (let i = 0; i < 5; i++) {
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

									for (let i = 0; i < groupNumber; i++) {
										playerBuff[t][p[i]]	*= structurePlayerBuff;
									}
									for (let i = 0; i < 5; i++) {
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

		return {outcome,outerTowerList,playerBuff,playerGoldBuff} ;

	}


	baron (p,groupNumber,innerTowerList,baronRespawn,baronList,baronBuff,teamBuff,outcome,groupType,groupBuffAdj,baronOdds,t,tD,playerBuff,playerGoldBuff,goldTime,structurePlayerBuff,structurePlayerBuffAll) {

		if ( ((innerTowerList[t][0] == 1)  || (innerTowerList[t][1] == 1) || (innerTowerList[t][0] == 1))  && (baronRespawn == 9999) && (outcome != "done")  && (groupType < 3)  && (groupBuffAdj>0)) {
	//	console.log(this.t+" "+teamBuff[t]+" "+teamBuff[tD]*groupBuff);
//		  	if (Math.random() < (.07*groupNumber-.20)*teamBuff[t]/teamBuff[t]) {
//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(.10*groupNumber-.20)*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5) ) {
			if (Math.random() < baronOdds ) {
				this.groupPlay(groupNumber,"baron","ast",p,t);
				//this.recordPlay("towerInrTop", t, [this.team[t].player[0].userID]);
			//	console.log(groupNumber);

				if (p.includes(1)) {
					this.recordStat(t, 1, "tov");
				} else if (p.includes(3)) {
					this.recordStat(t, 3, "tov");
				} else if (p.includes(2)) {
					this.recordStat(t, 2, "tov");
				} else if (p.includes(0)) {
					this.recordStat(t, 0, "tov");
				} else {
					this.recordStat(t, 4, "tov");
				}

				//this.recordStat(t, 1, "tov");
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

				for (let i = 0; i < groupNumber; i++) {
					playerBuff[t][p[i]]	*= structurePlayerBuff;
				}
				for (let i = 0; i < 5; i++) {
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
				this.team[t].stat.ptsQtrs[7] += 1;
				outcome = "done";
			} else {
		//	  console.log("Fail: "+this.t);
			}
		}
		return {playerBuff,playerGoldBuff,baronRespawn,baronList,teamBuff,baronBuff,outcome} ;

	}

	dragon (dragonRespawn,dragonList,dragonOdds,outcome,groupType,groupBuffAdj,p,t,tD,goldTime,groupNumber,playerBuff,structurePlayerBuff,structurePlayerBuffAll,playerGoldBuff,teamBuff) {

		if ( (dragonRespawn == 9999) && (outcome != "done")  && (groupType > 1)  && (groupBuffAdj>0) ) {
//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(outerAdj[t]-outerAdj[tD])+(.15*groupNumber-.20)*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)) {
			if (Math.random() < dragonOdds) {
				this.groupPlay(groupNumber,"dragon","blk",p,t);
				//this.recordPlay("towerInrTop", t, [this.team[t].player[0].userID]);
			//	console.log(groupNumber);
			//	console.log(p);
				if (p.includes(1)) {
					this.recordStat(t, 1, "drb");
				} else if (p.includes(3)) {
					this.recordStat(t, 3, "drb");
				} else if (p.includes(2)) {
					this.recordStat(t, 2, "drb");
				} else if (p.includes(0)) {
					this.recordStat(t, 0, "drb");
				} else {
					this.recordStat(t, 4, "drb");
				}
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
				for (let i = 0; i < groupNumber; i++) {
					playerBuff[t][p[i]]	*= structurePlayerBuff;
				}
				for (let i = 0; i < 5; i++) {
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

		return {outcome,dragonList,dragonRespawn,teamBuff,dragonBuff,playerBuff,playerGoldBuff} ;

	}

	rift (riftOdds,outcome,groupType,groupBuffAdj,p,t,tD,goldTime,groupNumber,playerBuff,structurePlayerBuff,structurePlayerBuffAll,playerGoldBuff,teamBuff) {

		//console.log(this.t);
		if ( (outcome != "done")  && (groupType < 3)  && (groupBuffAdj>0) && this.t > 10 && this.t < 20  && !riftKilled) {
//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(outerAdj[t]-outerAdj[tD])+(.15*groupNumber-.20)*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)) {
			if (Math.random() < riftOdds) {
				this.groupPlay(groupNumber,"rift","riftAssists",p,t);
				//this.recordPlay("towerInrTop", t, [this.team[t].player[0].userID]);
			//	console.log(groupNumber);
			//	console.log(p);
				if (p.includes(1)) {
					this.recordStat(t, 1, "riftKills");
				} else if (p.includes(0)) {
					this.recordStat(t, 0, "riftKills");
				} else if (p.includes(2)) {
					this.recordStat(t, 2, "riftKills");
				} else if (p.includes(1)) {
					this.recordStat(t, 1, "riftKills");
				} else {
					this.recordStat(t, 4, "riftKills");
				}
			//	dragonList[t][0] = 1;
			/*	goldTime = 150/1000;
				this.recordStat(t, 0, "trb",goldTime);
				this.recordStat(tD, 0, "stl",goldTime);
				this.recordStat(t, 1, "trb",goldTime);
				this.recordStat(tD, 1, "stl",goldTime);
				this.recordStat(t, 2, "trb",goldTime);
				this.recordStat(tD, 2, "stl",goldTime);
				this.recordStat(t, 3, "trb",goldTime);
				this.recordStat(tD, 3, "stl",goldTime);
				this.recordStat(t, 4, "trb",goldTime);
				this.recordStat(tD, 4, "stl",goldTime);					*/
			//drb
			//	for (let i = 0; i < groupNumber; i++) {
				//	playerBuff[t][p[i]]	*= structurePlayerBuff;
				//}
				//for (let i = 0; i < 5; i++) {
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
					//playerBuff[t][i]	*= structurePlayerBuffAll;
					//playerGoldBuff[t][i] *= (1+(goldTime/5));
					//playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);
//				}


	//			dragonRespawn = this.t;
		//		dragonList[t] += 1;
			//	if (dragonList[t]>4) {
				//	teamBuff[t] *= (1.40)
					//dragonBuff[t] = this.t;
				//} else {
//					teamBuff[t] *= (1.10)
	//			}
		//		this.team[t].stat.ptsQtrs[6] += 1;
				outcome = "done";
				riftKilled = true;
				riftTimer = this.t+4;
			//	console.log(this.t);
			//	console.log(riftTimer);
				// need to track eye of herald timer (4 minutes)
			} else {
		//	  console.log("Fail: "+this.t);
			}
		}

		return {outcome,dragonList,dragonRespawn,teamBuff,dragonBuff,playerBuff,playerGoldBuff} ;

	}


	nexus (nexusTowerList,inhibList,outcome,groupBuffAdj,t,p,nexusOdds,groupNumber) {

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
		return {outcome} ;

	}

	//tower should be 0 or 1
	nexusTower (tower,inhibTowerList,inhibFirstTaken,nexusTowerList,outcome,groupBuffAdj,nexusTowerOdds,shotCaller,t,tD,p,
				nexusTowerOddsNoSC,nexusTowerOddsNoExp,nexusTowerOddsNoGold,nexusTowerOddsNoTBuff,nexusTowerOddsNoTBuffAdj,nexusTowerOddsNoTw,nexusTowerOddsNoTP,
				nexusTowerOddsNoAg,nexusTowerOddsNoChmpn,
				goldTime,groupNumber,playerBuff,structurePlayerBuff,structurePlayerBuffAll,playerGoldBuff) {


		if (( (inhibTowerList[t][0] == 1) || (inhibTowerList[t][1] == 1) || (inhibTowerList[t][2] == 1) ) && (inhibFirstTaken[t] > 0)  && (nexusTowerList[t][tower] == 0)  && (outcome != "done")  && (groupBuffAdj>0)  ) {
//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.02*(inhibList[t][0]+inhibList[t][1]+inhibList[t][2]+1 )*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend) {
			let instance	= Math.random();
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

				for (let i = 0; i < groupNumber; i++) {
					playerBuff[t][p[i]]	*= structurePlayerBuff;
				}
				for (let i = 0; i < 5; i++) {
//										playerBuff[t][p[i]]	*= structurePlayerBuffAll;
					playerBuff[t][i]	*= structurePlayerBuffAll;
				//	playerGoldBuff[t][i] *= (1+(goldTime/5));
//										playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);
					playerGoldBuff[t][i] *= (1+goldTime/playerGoldBuff[t][i]);

				}

//				this.recordPlay("towerNexBot", t, [this.team[t].player[p].userID]);


				this.recordStat(t, 3-tower*3, "pf");
				this.recordStat(tD, 3-tower*3, "oppTw");
				nexusTowerList[t][tower] = 1;
				this.team[t].stat.ptsQtrs[4] += 1;
				outcome = "done";
				//console.log(tower);
				//console.log(nexusTowerList);
				if (riftKilled == true && riftTimer > this.t) {
					riftTimer = this.t+.30;
				}

			} else {
		//	  console.log("Fail: "+this.t);
			}
		}

		return {outcome,nexusTowerList,playerBuff,playerGoldBuff} ;

	}


//	inhibs3 (inhibTowerList,inhibList,outcome,groupType,groupBuffAdj,inhibOdds,t,tD,p,inhibFirstTaken,inhibRespawn,outcome) {
	inhibs3 (inhibTowerList,inhibList,outcome,groupType,groupBuffAdj,inhibOdds,t,tD,p,inhibFirstTaken,inhibRespawn,groupNumber) {



		if ((inhibTowerList[t][0] == 1)  && (inhibList[t][0] == 0)  && (outcome != "done")   && (groupType < 3)  && (groupBuffAdj>0)) {
//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.3*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.structureAttack/this.team[tD].compositeRating.structureDefend) {
			if (Math.random() < inhibOdds) {
//			    this.groupPlayOnly(groupNumber,"inhibTop",p,t);
				this.groupPlay(groupNumber,"inhibTop","fgLowPost",p,t);
				this.recordStat(t, 0, "fgaLowPost");
				this.recordStat(tD, 0, "oppInh");


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

				inhibList[t][1] = 1;
				inhibFirstTaken[t] += 1;
				inhibRespawn[t][1] = this.t;
				this.team[t].stat.ptsQtrs[3] += 1;
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


		return {inhibList,inhibFirstTaken,inhibRespawn,outcome} ;

	}


	inhibTowers (innerTowerList,inhibTowerList,outcome,groupType,groupBuffAdj,inhibTowerOdds,shotCaller,t,tD,p,groupNumber,inhibTowerOddsNoSC,inhibTowerOddsNoExp,inhibTowerOddsNoGold,inhibTowerOddsNoTBuff,inhibTowerOddsNoTBuffAdj,
					inhibTowerOddsNoTw,inhibTowerOddsNoTP,inhibTowerOddsNoAg,inhibTowerOddsNoChmpn,goldTime,playerBuff,playerGoldBuff,structurePlayerBuff,structurePlayerBuffAll) {

			if ((innerTowerList[t][0] == 1)  && (inhibTowerList[t][0] == 0)  && (outcome != "done")  && (groupType < 2)  && (groupBuffAdj>0) ) {
	//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.02*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend) {

				let instance = Math.random();
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

					for (let i = 0; i < groupNumber; i++) {
						playerBuff[t][p[i]]	*= structurePlayerBuff;
					}
					for (let i = 0; i < 5; i++) {
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
					if (riftKilled == true && riftTimer > this.t) {
						riftTimer = this.t+.30;
					}

				} else {
			//	  console.log("Fail: "+this.t);
				}
			}
			if ((innerTowerList[t][1] == 1) && (inhibTowerList[t][1] == 0)   && (outcome != "done")   && (groupType > 1)  && (groupType < 3)  && (groupBuffAdj>0) ) {

				let instance = Math.random();
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

					for (let i = 0; i < groupNumber; i++) {
						playerBuff[t][p[i]]	*= structurePlayerBuff;
					}
					for (let i = 0; i < 5; i++) {
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
					if (riftKilled == true && riftTimer > this.t) {
						riftTimer = this.t+.30;
					}

				} else {
			//	  console.log("Fail: "+this.t);
				}
			}

			if ((innerTowerList[t][2] == 1)  && (inhibTowerList[t][2] == 0)  && (outcome != "done")   && (groupType > 2)  && (groupBuffAdj>0)  ) {

				let instance = Math.random();
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

					for (let i = 0; i < groupNumber; i++) {
						playerBuff[t][p[i]]	*= structurePlayerBuff;
					}
					for (let i = 0; i < 5; i++) {
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
					if (riftKilled == true && riftTimer > this.t) {
						riftTimer = this.t+.30;
					}

				} else {
			//	  console.log("Fail: "+this.t);
				}
			}

		return {outcome,inhibTowerList,playerBuff,playerGoldBuff} ;

	}


	innerTowers (outerTowerList,innerTowerList,outcome,groupType,groupBuffAdj,
					innerTowerOddsNoSC,innerTowerOddsNoExp,innerTowerOddsNoGold,innerTowerOddsNoTBuff,innerTowerOddsNoTBuffAdj,
					innerTowerOddsNoTw,innerTowerOddsNoTP,innerTowerOddsNoAg,innerTowerOddsNoChmpn,
					t,tD,p,innerTowerOdds,goldTime,shotCaller,groupNumber,structurePlayerBuff,structurePlayerBuffAll,playerBuff,playerGoldBuff) {

			if ((outerTowerList[t][0] == 1)  && (innerTowerList[t][0] == 0)  && (outcome != "done")  && (groupType < 2)  && (groupBuffAdj>0) ) {
	//		  	if (Math.random() < championAdjustment/50+(outerAdj[t]-outerAdj[tD])+.02*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend) {
				//if (Math.random() < innerTowerOdds) {
				let instance = Math.random();
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

					for (let i = 0; i < groupNumber; i++) {
						playerBuff[t][p[i]]	*= structurePlayerBuff;
					}
					for (let i = 0; i < 5; i++) {
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
					if (riftKilled == true && riftTimer > this.t) {
						riftTimer = this.t+.30;
					}
				} else {
			//	  console.log("Fail: "+this.t);
				}
			}
			if ((outerTowerList[t][1] == 1) && (innerTowerList[t][1] == 0)   && (outcome != "done")  && (groupType < 3)  && (groupType > 1)  && (groupBuffAdj>0) ) {
//								if (Math.random() < innerTowerOdds) {
				let instance = Math.random();
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

					for (let i = 0; i < groupNumber; i++) {
						playerBuff[t][p[i]]	*= structurePlayerBuff;
					}
					for (let i = 0; i < 5; i++) {
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
					if (riftKilled == true && riftTimer > this.t) {
						riftTimer = this.t+.30;
					}

				} else {
			//	  console.log("Fail: "+this.t);
				}
			}

			if ((outerTowerList[t][2] == 1)  && (innerTowerList[t][2] == 0)  && (outcome != "done") && (groupType > 2)  && (groupBuffAdj>0)  ) {

				//if (Math.random() < innerTowerOdds) {
				let instance = Math.random();
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

					for (let i = 0; i < groupNumber; i++) {
						playerBuff[t][p[i]]	*= structurePlayerBuff;
					}
					for (let i = 0; i < 5; i++) {
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
					if (riftKilled == true && riftTimer > this.t) {
						riftTimer = this.t+.30;
					}

				} else {
			//	  console.log("Fail: "+this.t);
				}
			}


		return {outcome,innerTowerList,playerBuff,playerGoldBuff} ;

	}


	outerTowers (outerTowerList,outcome,groupType,groupBuffAdj,
					outerTowerOddsNoSC,outerTowerOddsNoExp,outerTowerOddsNoGold,outerTowerOddsNoTBuff,outerTowerOddsNoTBuffAdj,
					outerTowerOddsNoTw,outerTowerOddsNoTP,outerTowerOddsNoAg,outerTowerOddsNoChmpn,
					t,tD,p,outerTowerOdds,goldTime,shotCaller,groupNumber,structurePlayerBuff,structurePlayerBuffAll,playerBuff,playerGoldBuff) {

				if ((outerTowerList[t][0] == 0)  && (outcome != "done") && (groupType < 1) && (groupBuffAdj>0) ) {
		//		  	if (Math.random() < (championAdjustment/50+(outerAdj[t]-outerAdj[tD])+(.09*(this.t-6)*teamBuff[t]/teamBuff[tD]*groupBuff*(teamBuffAdj[t]/5)/((teamBuffAdj[tD]+1)/5)*this.team[t].compositeRating.toweringAttack/this.team[tD].compositeRating.toweringDefend))) {
				//	if (Math.random() < outerTowerOdds) {
					let instance = Math.random();
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

						for (let i = 0; i < groupNumber; i++) {
							playerBuff[t][p[i]]	*= structurePlayerBuff;
						}
						for (let i = 0; i < 5; i++) {
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

						if (riftKilled == true && riftTimer > this.t) {
							riftTimer = this.t+.30;
						}

					} else {
				//	  console.log("Fail: "+this.t);
					}
				}
				if ((outerTowerList[t][1] == 0)  && (outcome != "done")  && (groupType < 3)  && (groupType > 1)  && (groupBuffAdj>0)) {
					//if (Math.random() < outerTowerOdds) {
					let instance = Math.random();
					if ( instance < outerTowerOdds) {

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

						for (let i = 0; i < groupNumber; i++) {
							playerBuff[t][p[i]]	*= structurePlayerBuff;
						}
						for (let i = 0; i < 5; i++) {
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
						if (riftKilled == true && riftTimer > this.t) {
							riftTimer = this.t+.30;
						}

					} else {
				//	  console.log("Fail: "+this.t);
					}
				}

				if ((outerTowerList[t][2] == 0)  && (outcome != "done")  && (groupType > 2)  && (groupBuffAdj>0)) {
//								if (Math.random() < outerTowerOdds) {

					let instance = Math.random();
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

						for (let i = 0; i < groupNumber; i++) {
							playerBuff[t][p[i]]	*= structurePlayerBuff;
						}
						for (let i = 0; i < 5; i++) {
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
						if (riftKilled == true && riftTimer > this.t) {
							riftTimer = this.t+.30;
						}

					} else {
				//	  console.log("Fail: "+this.t);
					}
				}

		return {outcome,outerTowerList,playerBuff,playerGoldBuff} ;

	}




  /**
     * Probability of the current possession ending in a turnover.
     *
     * @memberOf core.gameSim
     * @return {number} Probability from 0 to 1.
     */
    //GameSim.prototype.groupPlay = function (groupNumber,playType,statType,p,t) {
    groupPlay(groupNumber,playType,statType,p,t) {

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
    }


    /**
     * Perform appropriate substitutions.
     *
     * Can this be sped up?
     *
     * @return {boolean} true if a substitution occurred, false otherwise.
     */
    updatePlayersOnCourt() {
     /*   let substitutions = false;

        for (let t = 0; t < 2; t++) {
            // Overall values scaled by fatigue
            const ovrs = [];
            for (let p = 0; p < this.team[t].player.length; p++) {
                // Injured or fouled out players can't play
                if (this.team[t].player[p].injured || this.team[t].player[p].stat.pf >= 6) {
                    ovrs[p] = -Infinity;
                } else {
                    ovrs[p] = this.team[t].player[p].valueNoPot * fatigue(this.team[t].player[p].stat.energy) * this.team[t].player[p].ptModifier * random.uniform(0.9, 1.1);
                }
            }

            // Loop through players on court (in inverse order of current roster position)
            let i = 0;
            for (let pp = 0; pp < this.playersOnCourt[t].length; pp++) {
                const p = this.playersOnCourt[t][pp];
                this.playersOnCourt[t][i] = p;
                // Loop through bench players (in order of current roster position) to see if any should be subbed in)
                for (let b = 0; b < this.team[t].player.length; b++) {
                    if (!this.playersOnCourt[t].includes(b) && ((this.team[t].player[p].stat.courtTime > 3 && this.team[t].player[b].stat.benchTime > 3 && ovrs[b] > ovrs[p]) || ((this.team[t].player[p].injured || this.team[t].player[p].stat.pf >= 6) && (!this.team[t].player[b].injured && this.team[t].player[b].stat.pf < 6)))) {
                        // Check if position of substitute makes for a valid lineup
                        const pos = [];
                        for (let j = 0; j < this.playersOnCourt[t].length; j++) {
                            if (j !== pp) {
                                pos.push(this.team[t].player[this.playersOnCourt[t][j]].pos);
                            }
                        }
                        pos.push(this.team[t].player[b].pos);
                        // Requre 2 Gs (or 1 PG) and 2 Fs (or 1 C)
                        let numG = 0;
                        let numPG = 0;
                        let numF = 0;
                        let numC = 0;
                        for (let j = 0; j < pos.length; j++) {
                            if (pos[j].includes('G')) {
                                numG += 1;
                            }
                            if (pos[j] === 'PG') {
                                numPG += 1;
                            }
                            if (pos[j].includes('F')) {
                                numF += 1;
                            }
                            if (pos[j] === 'C') {
                                numC += 1;
                            }
                        }
                        if ((numG < 2 && numPG === 0) || (numF < 2 && numC === 0)) {
                            if (fatigue(this.team[t].player[p].stat.energy) > 0.7) {
                                // Exception for ridiculously tired players, so really unbalanced teams won't play starters whole game
                                continue;
                            }
                        }

                        substitutions = true;

                        // Substitute player
                        this.playersOnCourt[t][i] = b;

                        this.team[t].player[b].stat.courtTime = random.uniform(-2, 2);
                        this.team[t].player[b].stat.benchTime = random.uniform(-2, 2);
                        this.team[t].player[p].stat.courtTime = random.uniform(-2, 2);
                        this.team[t].player[p].stat.benchTime = random.uniform(-2, 2);

                        // Keep track of deviations from the normal starting lineup for the play-by-play
                        if (this.playByPlay !== undefined) {
                            this.playByPlay.push({
                                type: "sub",
                                t,
                                on: this.team[t].player[b].id,
                                off: this.team[t].player[p].id,
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

        // Record starters if that hasn't been done yet. This should run the first time this function is called, and never again.
        if (!this.startersRecorded) {
            for (let t = 0; t < 2; t++) {
                for (let p = 0; p < this.team[t].player.length; p++) {
                    if (this.playersOnCourt[t].includes(p)) {
                        this.recordStat(t, p, "gs");
                    }
                }
            }
            this.startersRecorded = true;
        }

        return substitutions;*/
    }

    /**
     * Update synergy.
     *
     * This should be called after this.updatePlayersOnCourt as it only produces different output when the players on the court change.
     */
    updateSynergy() {
     /*   for (let t = 0; t < 2; t++) {
            // Count all the *fractional* skills of the active players on a team (including duplicates)
            const skillsCount = {
                '3': 0,
                A: 0,
                B: 0,
                Di: 0,
                Dp: 0,
                Po: 0,
                Ps: 0,
                R: 0,
            };

            for (let i = 0; i < 5; i++) {
                const p = this.playersOnCourt[t][i];

                // 1 / (1 + e^-(15 * (x - 0.7))) from 0 to 1
                skillsCount["3"] += sigmoid(this.team[t].player[p].compositeRating.shootingThreePointer, 15, 0.7);
                skillsCount.A += sigmoid(this.team[t].player[p].compositeRating.athleticism, 15, 0.7);
                skillsCount.B += sigmoid(this.team[t].player[p].compositeRating.dribbling, 15, 0.7);
                skillsCount.Di += sigmoid(this.team[t].player[p].compositeRating.defenseInterior, 15, 0.7);
                skillsCount.Dp += sigmoid(this.team[t].player[p].compositeRating.defensePerimeter, 15, 0.7);
                skillsCount.Po += sigmoid(this.team[t].player[p].compositeRating.shootingLowPost, 15, 0.7);
                skillsCount.Ps += sigmoid(this.team[t].player[p].compositeRating.passing, 15, 0.7);
                skillsCount.R += sigmoid(this.team[t].player[p].compositeRating.rebounding, 15, 0.7);
            }

            // Base offensive synergy
            this.team[t].synergy.off = 0;
            this.team[t].synergy.off += 5 * sigmoid(skillsCount["3"], 3, 2); // 5 / (1 + e^-(3 * (x - 2))) from 0 to 5
            this.team[t].synergy.off += 3 * sigmoid(skillsCount.B, 15, 0.75) + sigmoid(skillsCount.B, 5, 1.75); // 3 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) from 0 to 5
            this.team[t].synergy.off += 3 * sigmoid(skillsCount.Ps, 15, 0.75) + sigmoid(skillsCount.Ps, 5, 1.75) + sigmoid(skillsCount.Ps, 5, 2.75); // 3 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) + 1 / (1 + e^-(5 * (x - 2.75))) from 0 to 5
            this.team[t].synergy.off += sigmoid(skillsCount.Po, 15, 0.75); // 1 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
            this.team[t].synergy.off += sigmoid(skillsCount.A, 15, 1.75) + sigmoid(skillsCount.A, 5, 2.75); // 1 / (1 + e^-(15 * (x - 1.75))) + 1 / (1 + e^-(5 * (x - 2.75))) from 0 to 5
            this.team[t].synergy.off /= 17;

            // Punish teams for not having multiple perimeter skills
            const perimFactor = helpers.bound(Math.sqrt(1 + skillsCount.B + skillsCount.Ps + skillsCount["3"]) - 1, 0, 2) / 2; // Between 0 and 1, representing the perimeter skills
            this.team[t].synergy.off *= 0.5 + 0.5 * perimFactor;

            // Defensive synergy
            this.team[t].synergy.def = 0;
            this.team[t].synergy.def += sigmoid(skillsCount.Dp, 15, 0.75); // 1 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
            this.team[t].synergy.def += 2 * sigmoid(skillsCount.Di, 15, 0.75); // 2 / (1 + e^-(15 * (x - 0.75))) from 0 to 5
            this.team[t].synergy.def += sigmoid(skillsCount.A, 5, 2) + sigmoid(skillsCount.A, 5, 3.25); // 1 / (1 + e^-(5 * (x - 2))) + 1 / (1 + e^-(5 * (x - 3.25))) from 0 to 5
            this.team[t].synergy.def /= 6;

            // Rebounding synergy
            this.team[t].synergy.reb = 0;
            this.team[t].synergy.reb += sigmoid(skillsCount.R, 15, 0.75) + sigmoid(skillsCount.R, 5, 1.75); // 1 / (1 + e^-(15 * (x - 0.75))) + 1 / (1 + e^-(5 * (x - 1.75))) from 0 to 5
            this.team[t].synergy.reb /= 4;
        }*/
    }

    /**
     * Update team composite ratings.
     *
     * This should be called once every possession, after this.updatePlayersOnCourt and this.updateSynergy as they influence output, to update the team composite ratings based on the players currently on the court.
     */
    updateTeamCompositeRatings() {

        var i, j, p, rating, t;
// console.log("got here");
        // Only update ones that are actually used

        // Only update ones that are actually used
//        const toUpdate = ["dribbling", "passing", "rebounding", "defense", "defensePerimeter", "blocking"];
        const toUpdate = ["wardDestruction", "wardPlacement", "mapVision", "adaptability", "teamPlayer", "aggression", "laneSwitching"];
        const toUpdateMax = ["shotcalling"];
        const toUpdateJungle = ["ganking"];

        for (t = 0; t < 2; t++) {
            for (j = 0; j < toUpdate.length; j++) {
                rating = toUpdate[j];
                this.team[t].compositeRating[rating] = 0;

                for (i = 0; i < 5; i++) {
                    p = this.playersOnCourt[t][i];
//                    this.team[t].compositeRating[rating] += this.team[t].player[p].compositeRating[rating] * fatigue(this.team[t].player[p].stat.energy);
					if (this.team[t].player[p] == undefined) {
						console.log(this.team);
						console.log(this.playersOnCourt);
						console.log(p);
						console.log(t);
						console.log(i);
					}
				/*	if (this.team[t].player[p] == undefined) {
						console.log(t);
						console.log(i);
						console.log(p);
						console.log(this.team);
						console.log(this.playersOnCourt);
					}*/
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
        }
    }

    /**
     * Update playing time stats.
     *
     * This should be called once every possession, at the end, to record playing time and bench time for players.
     */
    updatePlayingTime(possessionTime: number) {
       /* for (let t = 0; t < 2; t++) {
            // Update minutes (overall, court, and bench)
            for (let p = 0; p < this.team[t].player.length; p++) {
                if (this.playersOnCourt[t].includes(p)) {
                    this.recordStat(t, p, "min", possessionTime);
                    this.recordStat(t, p, "courtTime", possessionTime);
                    // This used to be 0.04. Increase more to lower PT
                    this.recordStat(t, p, "energy", -possessionTime * 0.06 * (1 - this.team[t].player[p].compositeRating.endurance));
                    if (this.team[t].player[p].stat.energy < 0) {
                        this.team[t].player[p].stat.energy = 0;
                    }
                } else {
                    this.recordStat(t, p, "benchTime", possessionTime);
                    this.recordStat(t, p, "energy", possessionTime * 0.1);
                    if (this.team[t].player[p].stat.energy > 1) {
                        this.team[t].player[p].stat.energy = 1;
                    }
                }
            }
        }*/
    }



    /**
     * See if any injuries occurred this possession, and handle the consequences.
     *
     * This doesn't actually compute the type of injury, it just determines if a player is injured bad enough to miss the rest of the game.
     */
    injuries() {
        if (g.disableInjuries) {
            return;
        }

        let newInjury = false;

       /* for (let t = 0; t < 2; t++) {
            for (let p = 0; p < this.team[t].player.length; p++) {
                // Only players on the court can be injured
                if (this.playersOnCourt[t].includes(p)) {
                    // According to data/injuries.ods, 0.25 injuries occur every game. Divided over 10 players and ~200 possessions, that means each player on the court has P = 0.25 / 10 / 200 = 0.000125 probability of being injured this play.
                    if (Math.random() < 0.000125) {
                        this.team[t].player[p].injured = true;
                        newInjury = true;
                        this.recordPlay("injury", t, [this.team[t].player[p].name]);
                    }
                }
            }
        }*/

        // Sub out injured player
        if (newInjury) {
            this.updatePlayersOnCourt();
        }
    }

    /**
     * Simulate a single possession.
     *
     * @return {string} Outcome of the possession, such as "tov", "drb", "orb", "fg", etc.
     */
    getPossessionOutcome() {
        // Turnover?
        if (this.probTov() > Math.random()) {
            return this.doTov(); // tov
        }

        // Shot if there is no turnover
        const ratios = this.ratingArray("usage", this.o);
        const shooter = pickPlayer(ratios);

        return this.doShot(shooter); // fg, orb, or drb
    }

    groupPlayOnly(groupNumber,playType,p,t) {

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
    }

//    async function userResponse() {
   /* userResponse() {

	//		let resultUser = toUI(['prompt', 'This will play through multiple seasons, using the AI to manage your team. How many seasons do you want to simulate?', '5'], conditions);
		let resultUser = 100;
	//	while (resultUser == 100) {
		resultUser = toUI(['prompt', 'Test Giving User In Game Options', '100']);
	//	}
		console.log(resultUser);
		console.log(numSeasons);
	   var currentTime = new Date().getTime();
		var miliseconds = 5000;
	   while (currentTime + miliseconds >= new Date().getTime()) {
	   }
		let numSeasons = parseInt(resultUser, 10);
		console.log(resultUser);
		console.log(numSeasons);
		//let objectiveKills;
		//if (Number.isInteger(numSeasons)) {
			//objectiveKills = true;
		//	local.autoPlaySeasons = numSeasons;
			//autoPlay(conditions);
		//}
	var person = prompt("Please enter your name", "Harry Potter");

    if (person != null) {
		console.log("person");
    }

		return numSeasons;
    }	*/
    /**
     * Probability of the current possession ending in a turnover.
     *
     * @return {number} Probability from 0 to 1.
     */
    probTov() {
        return 0.13 * (1 + this.team[this.d].compositeRating.defense) / (1 + 0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
    }

    /**
     * Turnover.
     *
     * @return {string} Either "tov" or "stl" depending on whether the turnover was caused by a steal or not.
     */
    doTov() {
        const ratios = this.ratingArray("turnovers", this.o, 0.5);
        const p = this.playersOnCourt[this.o][pickPlayer(ratios)];
        this.recordStat(this.o, p, "tov");
        if (this.probStl() > Math.random()) {
            return this.doStl(p); // "stl"
        }

        this.recordPlay("tov", this.o, [this.team[this.o].player[p].name]);

        return "tov";
    }


    /**
     * Probability that a turnover occurring in this possession is a steal.
     *
     * @return {number} Probability from 0 to 1.
     */
    probStl() {
        return 0.55 * this.team[this.d].compositeRating.defensePerimeter / (0.5 * (this.team[this.o].compositeRating.dribbling + this.team[this.o].compositeRating.passing));
    }

    /**
     * Steal.
     *
     * @return {string} Currently always returns "stl".
     */
    doStl(pStoleFrom: number) {
        const ratios = this.ratingArray("stealing", this.d);
        const p = this.playersOnCourt[this.d][pickPlayer(ratios)];
        this.recordStat(this.d, p, "stl");
        this.recordPlay("stl", this.d, [this.team[this.d].player[p].name, this.team[this.o].player[pStoleFrom].name]);

        return "stl";
    }

    /**
     * Shot.
     *
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @return {string} Either "fg" or output of this.doReb, depending on make or miss and free throws.
     */
    doShot(shooter: PlayerNumOnCourt) {
        const p = this.playersOnCourt[this.o][shooter];

        const currentFatigue = fatigue(this.team[this.o].player[p].stat.energy);

        // Is this an "assisted" attempt (i.e. an assist will be recorded if it's made)
        let passer;
        if (this.probAst() > Math.random()) {
            const ratios = this.ratingArray("passing", this.o, 2);
            passer = pickPlayer(ratios, shooter);
        }

        // Pick the type of shot and store the success rate (with no defense) in probMake and the probability of an and one in probAndOne
        let probAndOne;
        let probMake;
        let probMissAndFoul;
        let type;7
        if (this.team[this.o].player[p].compositeRating.shootingThreePointer > 0.5 && Math.random() < (0.35 * this.team[this.o].player[p].compositeRating.shootingThreePointer)) {
            // Three pointer
            type = "threePointer";
            probMissAndFoul = 0.02;
            probMake = this.team[this.o].player[p].compositeRating.shootingThreePointer * 0.35 + 0.24;
            probAndOne = 0.01;
        } else {
            const r1 = Math.random() * this.team[this.o].player[p].compositeRating.shootingMidRange;
            const r2 = Math.random() * (this.team[this.o].player[p].compositeRating.shootingAtRim + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)); // Synergy makes easy shots either more likely or less likely
            const r3 = Math.random() * (this.team[this.o].player[p].compositeRating.shootingLowPost + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)); // Synergy makes easy shots either more likely or less likely
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

        probMake = (probMake - 0.25 * this.team[this.d].compositeRating.defense + this.synergyFactor * (this.team[this.o].synergy.off - this.team[this.d].synergy.def)) * currentFatigue;

        // Assisted shots are easier
        if (passer !== undefined) {
            probMake += 0.025;
        }

        if (this.probBlk() > Math.random()) {
            return this.doBlk(shooter, type); // orb or drb
        }

        // Make
        if (probMake > Math.random()) {
            // And 1
            if (probAndOne > Math.random()) {
                return this.doFg(shooter, passer, type, true); // fg, orb, or drb
            }
            return this.doFg(shooter, passer, type); // fg
        }

        // Miss, but fouled
        if (probMissAndFoul > Math.random()) {
            if (type === "threePointer") {
                return this.doFt(shooter, 3); // fg, orb, or drb
            }
            return this.doFt(shooter, 2); // fg, orb, or drb
        }

        // Miss
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
        return this.doReb(); // orb or drb
    }

    /**
     * Probability that a shot taken this possession is blocked.
     *
     * @return {number} Probability from 0 to 1.
     */
    probBlk() {
        return 0.1 * this.team[this.d].compositeRating.blocking;
    }

    /**
     * Blocked shot.
     *
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @return {string} Output of this.doReb.
     */
    doBlk(shooter: PlayerNumOnCourt, type: ShotType) {
        const p = this.playersOnCourt[this.o][shooter];
        this.recordStat(this.o, p, "ba");
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

        const ratios = this.ratingArray("blocking", this.d, 4);
        const p2 = this.playersOnCourt[this.d][pickPlayer(ratios)];
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

        return this.doReb(); // orb or drb
    }

    /**
     * Field goal.
     *
     * Simulate a successful made field goal.
     *
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the passing player, who will get an assist. -1 if no assist.
     * @param {number} type 2 for a two pointer, 3 for a three pointer.
     * @return {string} fg, orb, or drb (latter two are for and ones)
     */
    doFg(shooter: PlayerNumOnCourt, passer?: PlayerNumOnCourt, type: ShotType, andOne?: boolean = false) {
        const p = this.playersOnCourt[this.o][shooter];
        this.recordStat(this.o, p, "fga");
        this.recordStat(this.o, p, "fg");
        this.recordStat(this.o, p, "pts", 2); // 2 points for 2's
        if (type === "atRim") {
            this.recordStat(this.o, p, "fgaAtRim");
            this.recordStat(this.o, p, "fgAtRim");
            this.recordPlay(andOne ? 'fgAtRimAndOne' : 'fgAtRim', this.o, [this.team[this.o].player[p].name]);
        } else if (type === "lowPost") {
            this.recordStat(this.o, p, "fgaLowPost");
            this.recordStat(this.o, p, "fgLowPost");
            this.recordPlay(andOne ? 'fgLowPostAndOne' : 'fgLowPost', this.o, [this.team[this.o].player[p].name]);
        } else if (type === "midRange") {
            this.recordStat(this.o, p, "fgaMidRange");
            this.recordStat(this.o, p, "fgMidRange");
            this.recordPlay(andOne ? 'fgMidRangeAndOne' : 'fgMidRange', this.o, [this.team[this.o].player[p].name]);
        } else if (type === "threePointer") {
            this.recordStat(this.o, p, "pts"); // Extra point for 3's
            this.recordStat(this.o, p, "tpa");
            this.recordStat(this.o, p, "tp");
            this.recordPlay(andOne ? 'tpAndOne' : 'tp', this.o, [this.team[this.o].player[p].name]);
        }
        this.recordLastScore(this.o, p, type, this.t);

        if (passer !== undefined) {
            const p2 = this.playersOnCourt[this.o][passer];
            this.recordStat(this.o, p2, "ast");
            this.recordPlay("ast", this.o, [this.team[this.o].player[p2].name]);
        }

        if (andOne) {
            return this.doFt(shooter, 1); // fg, orb, or drb
        }
        return "fg";
    }

    /**
     * Probability that a shot taken this possession is assisted.
     *
     * @return {number} Probability from 0 to 1.
     */
    probAst() {
        return 0.6 * (2 + this.team[this.o].compositeRating.passing) / (2 + this.team[this.d].compositeRating.defense);
    }

    checkGameTyingShot() {
        if (this.lastScoringPlay.length === 0) { return; }

        // can assume that the last scoring play tied the game
        const i = this.lastScoringPlay.length - 1;
        const play = this.lastScoringPlay[i];

        let shotType = 'a basket';
        switch (play.type) {
            case "atRim":
            case "lowPost":
            case "midRange":
                break;
            case "threePointer":
                shotType = "a three-pointer";
                break;
            case "ft":
                shotType = "a free throw";
                if (i > 0) {
                    const prevPlay = this.lastScoringPlay[i - 1];
                    if (prevPlay.team === play.team) {
                        switch (prevPlay.type) {
                            case "atRim":
                            case "lowPost":
                            case "midRange":
                                shotType = "a three-point play";
                                break;
                            case "threePointer":
                                shotType = "a four-point play";
                                break;
                            case "ft":
                                if (i > 1 && this.lastScoringPlay[i - 2].team === play.team && this.lastScoringPlay[i - 2].type === "ft") {
                                    shotType = "three free throws";
                                } else {
                                    shotType = "two free throws";
                                }
                                break;
                            default:
                        }
                    }
                }
                break;
            default:
        }

        const team = this.team[play.team];
        const player = this.team[play.team].player[play.player];

        let eventText = `<a href="${helpers.leagueUrl(["player", player.id])}">${player.name}</a> made ${shotType}`;
        if (play.time > 0) {
            eventText += ` with ${play.time} seconds remaining`;
        } else {
            eventText += (play.type === "ft" ? ' with no time on the clock' : ' at the buzzer');
        }
        eventText += ` to force ${helpers.overtimeCounter(this.team[0].stat.ptsQtrs.length - 3)} overtime`;

        this.clutchPlays.push({
            type: "playerFeat",
            tempText: eventText,
            showNotification: team.id === g.userTid,
            pids: [player.id],
            tids: [team.id],
        });
    }

    checkGameWinner() {
        if (this.lastScoringPlay.length === 0) { return; }

        const winner = this.team[0].stat.pts > this.team[1].stat.pts ? 0 : 1;
        const loser = winner === 0 ? 1 : 0;
        let margin = this.team[winner].stat.pts - this.team[loser].stat.pts;

        // work backwards from last scoring plays, check if any resulted in a tie-break or lead change
        let pts = 0;
        let shotType = 'basket';
        for (let i = this.lastScoringPlay.length - 1; i >= 0; i--) {
            const play = this.lastScoringPlay[i];
            switch (play.type) {
                case "atRim":
                case "lowPost":
                case "midRange":
                    pts = 2;
                    break;
                case "threePointer":
                    shotType = "three-pointer";
                    pts = 3;
                    break;
                case "ft":
                    // Special handling for free throws
                    shotType = "free throw";
                    if (i > 0) {
                        const prevPlay = this.lastScoringPlay[i - 1];
                        if (prevPlay.team === play.team) {
                            switch (prevPlay.type) {
                                // cases where the basket ties the game, and the and-one wins it
                                case "atRim":
                                case "lowPost":
                                case "midRange":
                                    shotType = "three-point play";
                                    break;
                                case "threePointer":
                                    shotType = "four-point play";
                                    break;
                                // case where more than one free throw is needed to take the lead
                                case "ft":
                                    shotType += "s";
                                    break;
                                default:
                            }
                        }
                    }
                    pts = 1;
                    break;
                default:
            }

            margin -= (play.team === winner ? pts : -pts);
            if (margin <= 0) {
                const team = this.team[play.team];
                const player = this.team[play.team].player[play.player];

                let eventText = `<a href="${helpers.leagueUrl(["player", player.id])}">${player.name}</a> made the game-winning ${shotType}`;
                if (play.time > 0) {
                    eventText += ` with ${play.time} seconds remaining`;
                } else {
                    eventText += (play.type === "ft" ? ' with no time on the clock' : ' at the buzzer');
                }
                eventText += ` in ${this.team[winner].stat.pts.toString().charAt(0) === '8' ? 'an' : 'a'} <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[team.id], g.season, this.id])}">${this.team[winner].stat.pts}-${this.team[loser].stat.pts}</a> win over the ${g.teamNamesCache[this.team[loser].id]}.`;

                this.clutchPlays.push({
                    type: "playerFeat",
                    text: eventText,
                    showNotification: team.id === g.userTid,
                    pids: [player.id],
                    tids: [team.id],
                });
                return;
            }
        }
    }

    recordLastScore(teamnum: TeamNum, playernum: number, type: ShotType, time: number) {
        // only record plays in the fourth quarter or overtime...
        if (this.team[0].stat.ptsQtrs.length < 4) { return; }
        // ...in the last 24 seconds...
        if (time > 0.4) { return; }
        // ...when the lead is 3 or less
        if (Math.abs(this.team[0].stat.pts - this.team[1].stat.pts) > 4) { return; }

        const currPlay = {
            team: teamnum,
            player: playernum,
            type,
            time: Math.floor(time * 600) / 10, // up to 0.1 of a second
        };

        if (this.lastScoringPlay.length === 0) {
            this.lastScoringPlay.push(currPlay);
        } else {
            const lastPlay = this.lastScoringPlay[0];
            if (lastPlay.time !== currPlay.time) { this.lastScoringPlay = []; }
            this.lastScoringPlay.push(currPlay);
        }
    }

    /**
     * Free throw.
     *
     * @param {number} shooter Integer from 0 to 4 representing the index of this.playersOnCourt[this.o] for the shooting player.
     * @param {number} amount Integer representing the number of free throws to shoot
     * @return {string} "fg" if the last free throw is made; otherwise, this.doReb is called and its output is returned.
     */
    doFt(shooter: PlayerNumOnCourt, amount: number) {
        this.doPf(this.d);
        const p = this.playersOnCourt[this.o][shooter];

        let outcome;
        for (let i = 0; i < amount; i++) {
            this.recordStat(this.o, p, "fta");
            if (Math.random() < this.team[this.o].player[p].compositeRating.shootingFT * 0.3 + 0.6) { // Between 60% and 90%
                this.recordStat(this.o, p, "ft");
                this.recordStat(this.o, p, "pts");
                this.recordPlay("ft", this.o, [this.team[this.o].player[p].name]);
                outcome = "fg";
                this.recordLastScore(this.o, p, "ft", this.t);
            } else {
                this.recordPlay("missFt", this.o, [this.team[this.o].player[p].name]);
                outcome = null;
            }
        }

        if (outcome !== "fg") {
            outcome = this.doReb(); // orb or drb
        }

        return outcome;
    }

    /**
     * Personal foul.
     *
     * @param {number} t Team (0 or 1, this.o or this.d).
     */
    doPf(t: TeamNum) {
        const ratios = this.ratingArray("fouling", t);
        const p = this.playersOnCourt[t][pickPlayer(ratios)];
        this.recordStat(this.d, p, "pf");
        this.recordPlay("pf", this.d, [this.team[this.d].player[p].name]);
        // Foul out
        if (this.team[this.d].player[p].stat.pf >= 6) {
            this.recordPlay("foulOut", this.d, [this.team[this.d].player[p].name]);
            // Force substitutions now
            this.updatePlayersOnCourt();
            this.updateSynergy();
        }
    }

    /**
     * Rebound.
     *
     * Simulates a rebound opportunity (e.g. after a missed shot).
     *
     * @return {string} "drb" for a defensive rebound, "orb" for an offensive rebound, null for no rebound (like if the ball goes out of bounds).
     */
    doReb() {
        let p;
        let ratios;

        if (Math.random() < 0.15) {
            return null;
        }

        if (0.75 * (2 + this.team[this.d].compositeRating.rebounding) / (2 + this.team[this.o].compositeRating.rebounding) > Math.random()) {
            ratios = this.ratingArray("rebounding", this.d);
            p = this.playersOnCourt[this.d][pickPlayer(ratios)];
            this.recordStat(this.d, p, "drb");
            this.recordPlay("drb", this.d, [this.team[this.d].player[p].name]);

            return "drb";
        }

        ratios = this.ratingArray("rebounding", this.o);
        p = this.playersOnCourt[this.o][pickPlayer(ratios)];
        this.recordStat(this.o, p, "orb");
        this.recordPlay("orb", this.o, [this.team[this.o].player[p].name]);

        return "orb";
    }

    /**
     * Generate an array of composite ratings.
     *
     * @param {string} rating Key of this.team[t].player[p].compositeRating to use.
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number=} power Power that the composite rating is raised to after the components are linearly combined by  the weights and scaled from 0 to 1. This can be used to introduce nonlinearities, like making a certain stat more uniform (power < 1) or more unevenly distributed (power > 1) or making a composite rating an inverse (power = -1). Default value is 1.
     * @return {Array.<number>} Array of composite ratings of the players on the court for the given rating and team.
     */
    ratingArray(rating: CompositeRating, t: TeamNum, power?: number = 1) {
        const array = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            const p = this.playersOnCourt[t][i];
            array[i] = (this.team[t].player[p].compositeRating[rating] * fatigue(this.team[t].player[p].stat.energy)) ** power;
        }

        return array;
    }

    /**
     * Increments a stat (s) for a player (p) on a team (t) by amount (default is 1).
     *
     * @param {number} t Team (0 or 1, this.or or this.d).
     * @param {number} p Integer index of this.team[t].player for the player of interest.
     * @param {string} s Key for the property of this.team[t].player[p].stat to increment.
     * @param {number} amt Amount to increment (default is 1).
     */
 /*   recordStat(t: TeamNum, p: number, s: Stat, amt?: number = 1) {
        this.team[t].player[p].stat[s] += amt;
        if (s !== "gs" && s !== "courtTime" && s !== "benchTime" && s !== "energy") {
            this.team[t].stat[s] += amt;
            // Record quarter-by-quarter scoring too
            if (s === "pts") {
                this.team[t].stat.ptsQtrs[this.team[t].stat.ptsQtrs.length - 1] += amt;
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 5; j++) {
                        const k = this.playersOnCourt[i][j];
                        this.team[i].player[k].stat.pm += (i === t ? amt : -amt);
                    }
                }
            }
            if (this.playByPlay !== undefined) {
                this.playByPlay.push({
                    type: "stat",
                    qtr: this.team[t].stat.ptsQtrs.length - 1,
                    t,
                    p,
                    s,
                    amt,
                });
            }
        }
    }*/

    recordStat(t: TeamNum, p: number, s: Stat, amt?: number = 1) {
        //amt = amt !== undefined ? amt : 1;
	//	console.log(s+" "+amt);

		//console.log(t+" "+p+" "+s+" "+amt);
				//if (s == "pf") {
					//console.log(this.t+" "+t+" "+p+" "+s+" "+this.team[t].player[p].stat[s] +" "+amt);
				//}

        if (s !== "gs" && s !== "courtTime" && s !== "benchTime" && s !== "energy") {
            this.team[t].stat[s] += amt;
            // Record quarter-by-quarter scoring too
            if (s === "pts") {
              //  this.team[t].stat.ptsQtrs[this.team[t].stat.ptsQtrs.length - 1] += amt;
            } else if  (s == "champPicked" || s == "cpid" || s == "hid") {

								//this.recordStat(t, 0, "trb",goldTime);
									//this.recordStat(tD, 0, "stl",goldTime);

				this.team[t].player[p].stat[s] = amt;
            } else if  (s == "ban" ) {
				// p is kind of a placeholder for 1st to 5th ban
				this.team[t].ban[p].ban = amt;
			//	console.log(this.team[t]);
			} else {
				this.team[t].player[p].stat[s] += amt;
//				if (s == "trb" && this.t<5) {
			//	if (s == "pf") {
				//	console.log(this.t+" "+t+" "+p+" "+s+" "+this.team[t].player[p].stat[s] +" "+amt);
				//}
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
//	let undrafted = await idb.cache.champions.getAll();
	//let undrafted = idb.cache.champions.getAll();
//	console.log(undrafted);
//	throw new Error("Something went badly wrong!");


    }

  /*  recordPlay(type: PlayType, t?: TeamNum, names?: string[]) {
        let texts;
        if (this.playByPlay !== undefined) {
            if (type === "injury") {
                texts = ["{0} was injured!"];
            } else if (type === "tov") {
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
                texts = ["(assist: {0})"];
            } else if (type === "quarter") {
                texts = [`<b>Start of ${helpers.ordinal(this.team[0].stat.ptsQtrs.length)} quarter</b>`];
            } else if (type === "overtime") {
                texts = [`<b>Start of ${helpers.ordinal(this.team[0].stat.ptsQtrs.length - 4)} overtime period</b>`];
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
            }

            if (texts) {
                //text = random.choice(texts);
                let text = texts[0];
                if (names) {
                    for (let i = 0; i < names.length; i++) {
                        text = text.replace(`{${i}}`, names[i]);
                    }
                }

                if (type === "ast") {
                    // Find most recent made shot, count assist for it
                    for (let i = this.playByPlay.length - 1; i >= 0; i--) {
                        if (this.playByPlay[i].type === "text") {
                            this.playByPlay[i].text += ` ${text}`;
                            break;
                        }
                    }
                } else {
                    let sec = Math.floor(this.t % 1 * 60);
                    if (sec < 10) {
                        sec = `0${sec}`;
                    }
                    this.playByPlay.push({
                        type: "text",
                        text,
                        t,
                        time: `${Math.floor(this.t)}:${sec}`,
                    });
                }
            } else {
                throw new Error(`No text for ${type}`);
            }
        }
    }*/


    //GameSim.prototype.recordPlay = function (type, t, names) {
    recordPlay(type: PlayType, t?: TeamNum, names?: string[]) {
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
				if (g.champType == 0) {
					texts = ["{0} destroyed the Nexus"];
				} else {
					texts = ["{0} destroyed the Ancient"];
				}
            } else if (type === "towerOutBot") {
                texts = ["{0} destroyed the Bottom Lane Outer Tower"];
            } else if (type === "towerOutTop") {
                texts = ["{0} destroyed the Top Lane Outer Tower"];
            } else if (type === "towerOutMid") {
                texts = ["{0} destroyed the Middle Lane Outer Tower"];
            } else if (type === "rift") {
                texts = ["{0} killed the Rift Herald"];
            } else if (type === "dragon") {
                texts = ["{0} killed the Dragon"];
            } else if (type === "baron") {
				if (g.champType == 0) {
					texts = ["{0} killed Baron"];
				} else {
					texts = ["{0} killed Roshan"];
				}
            } else if (type === "towerInrBot") {
                texts = ["{0} destroyed the Bottom Lane Inner Tower"];
            } else if (type === "towerInrTop") {
                texts = ["{0} destroyed the Top Lane Inner Tower"];
            } else if (type === "towerInrMid") {
                texts = ["{0} destroyed the Middle Lane Inner Tower"];
            } else if (type === "towerInhBot") {
				if (g.champType == 0) {
					texts = ["{0} destroyed the Bottom Lane Inhibitor Tower"];
				} else {
					texts = ["{0} destroyed the Bottom Lane Barracks Tower"];
				}
            } else if (type === "towerInhTop") {
				if (g.champType == 0) {
					texts = ["{0} destroyed the Top Lane Inhibitor Tower"];
				} else {
					texts = ["{0} destroyed the Top Lane Barracks Tower"];
				}
            } else if (type === "towerInhMid") {
				if (g.champType == 0) {
					texts = ["{0} destroyed the Middle Lane Inhibitor Tower"];
				} else {
					texts = ["{0} destroyed the Middle Lane Inhibitor Tower"];
				}
            } else if (type === "inhibBot") {
				if (g.champType == 0) {
					texts = ["{0} destroyed the Bottom Lane Inhibitor"];
				} else {
					texts = ["{0} destroyed the Bottom Lane Barracks"];
				}
            } else if (type === "inhibTop") {
				if (g.champType == 0) {
					texts = ["{0} destroyed the Top Lane Barracks"];
				} else {
					texts = ["{0} destroyed the Top Lane Barracks"];
				}
            } else if (type === "inhibMid") {
				if (g.champType == 0) {
					texts = ["{0} destroyed the Middle Lane Inhibitor"];
				} else {
					texts = ["{0} destroyed the Middle Lane Barracks"];
				}
            } else if (type === "towerNexTop") {
				if (g.champType == 0) {
					texts = ["{0} destroyed the Top Nexus Tower"];
				} else {
					texts = ["{0} destroyed the Top Ancient Tower"];
				}

            } else if (type === "towerNexBot") {
				if (g.champType == 0) {
					texts = ["{0} destroyed the Bottom Nexus Tower"];
				} else {
					texts = ["{0} destroyed the Bottom Ancient Tower"];
				}
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
    }

}

export default GameSim;
