// @flow

import faces from '../../vendor/faces';
import _ from 'underscore';
import {COMPOSITE_WEIGHTS, PHASE, PLAYER, g, helpers} from '../../common';
import {finances} from '../core';
import {idb} from '../db';
import * as champions from '../../data/champions2';
import * as championPatch from '../../data/championPatch';
import * as names from '../../data/names';
import * as userIDs from '../../data/userIDs';
import {injuries, logEvent, random} from '../util';
import type {
    Conditions,
    GamePlayer,
    GameResults,
    Phase,
    Player,
    PlayerContract,
    PlayerInjury,
    PlayerRatings,
    PlayerSalary, // eslint-disable-line no-unused-vars
    PlayerSkill,
    PlayerStats,
    PlayerWithStats,
    PlayerWithoutPid,
    RatingKey,
} from '../../common/types';

type Profile = '' | 'Big' | 'Point' | 'Wing';

let playerNames;

/**
 Limit a rating to between 0 and 100.
 *
 * @memberOf core.player
 * @param {number} rating Input rating.
 * @return {number} If rating is below 0, 0. If rating is above 100, 100. Otherwise, rating.
 */
function limitRating(rating: number): number {
    if (rating > 100) {
        return 100;
    }
    if (rating < 0) {
        return 0;
    }
    return Math.floor(rating);
}

/**
 * Calculates the overall rating by averaging together all the other ratings.
 *
 * @memberOf core.player
 * @param {Object.<string, number>} ratings Player's ratings object.
 * @return {number} Overall rating.
 */
/*function ovr(ratings: PlayerRatings): number {
    // This formula is loosely based on linear regression:
    return Math.round((4 * ratings.hgt + ratings.stre + 4 * ratings.spd + 2 * ratings.jmp + 3 * ratings.endu + 3 * ratings.ins + 4 * ratings.dnk + ratings.ft + ratings.fg + 2 * ratings.tp + ratings.blk + ratings.stl + ratings.drb + 3 * ratings.pss + ratings.reb) / 32);
}*/

    function ovr(ratings: PlayerRatings): number {
        ////return Math.round((ratings.hgt + ratings.stre + ratings.spd + ratings.jmp + ratings.endu + ratings.ins + ratings.dnk + ratings.ft + ratings.fg + ratings.tp + ratings.blk + ratings.stl + ratings.drb + ratings.pss + ratings.reb) / 15);



		 var ovrRating;
	   var position;
       var teamplayer,aware; // support and jungle
	   var risk,sumsp; // jungle
	   var teamfight; //support
	   var laning; //top
	   var teamfight; //adc
	   //rest mid

        teamplayer = false;
        aware = false;
        risk = false;
        sumsp = false;
        teamfight = false;
        laning = false;

        // Default position
        if (ratings.drb >= 60) {
            position = 'JGL';
			ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 3 * ratings.jmp + 3 * ratings.endu + 3 * ratings.ins + 1 * ratings.dnk + 1*ratings.ft + 3*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 1*ratings.stl + 4* ratings.drb + 1 * ratings.pss + ratings.reb) / 32);

        } else if (ratings.ins >= 70) {
            position = 'SUP';
			ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 4 * ratings.jmp + 6 * ratings.endu + 4 * ratings.ins + 1 * ratings.dnk + 4*ratings.ft + 1*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 1*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);
        } else {
            position = 'MID';
			ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 3 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 4 * ratings.dnk + 3*ratings.ft + 2*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

		}




		if ((ratings.jmp >  ratings.dnk*.9)) {
            teamplayer = true;  // teamplayer > laning
        }
		if ((ratings.ins >  ratings.stl*.9)) {
            aware = true;  // aware>lasthit
        }
		if ((ratings.fg >  ratings.ft*0.8)) {
            risk = true;  // risk taking > teamfighting
        }
		if ((ratings.drb >  ratings.ft*5.0)) {
            sumsp = true;  // sumspell > teamfighting
        }
		if ((ratings.ft >  ratings.dnk)) {
            teamfight = true;  // teamfight > laning (top vs mid/adc)
        }
		if ((ratings.ft >  ratings.jmp*1.1)) {
            laning = true;  // laning > teamplayer (mid/adc/top vs jungle/support)
        }


        if (teamplayer && aware && !laning) {
		    if (risk && sumsp ) {
				position = 'JGL';
//				ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 4 * ratings.jmp + 3 * ratings.endu + 4 * ratings.ins + 1 * ratings.dnk + 1*ratings.ft + 4*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 1*ratings.stl + 4* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);
			ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 3 * ratings.jmp + 3 * ratings.endu + 3 * ratings.ins + 1 * ratings.dnk + 1*ratings.ft + 3*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 1*ratings.stl + 4* ratings.drb + 1 * ratings.pss + ratings.reb) / 32);

			} else if (teamfight) {
				position = 'SUP';
//			ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 4 * ratings.jmp + 3 * ratings.endu + 4 * ratings.ins + 1 * ratings.dnk + 4*ratings.ft + 1*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 1*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 31);
			ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 4 * ratings.jmp + 6 * ratings.endu + 4 * ratings.ins + 1 * ratings.dnk + 4*ratings.ft + 1*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 1*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

//				ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 7 * ratings.jmp + 3 * ratings.endu + 5 * ratings.ins + 1 * ratings.dnk + 5*ratings.ft + 1*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 1*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 36);

			} else {

				if (risk) {
					position = 'TOP';
					ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 2 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 5 * ratings.dnk + 2*ratings.ft + 3*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 2* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

		        } else if (teamfight) {
					position = 'ADC';
					ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 3 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 4 * ratings.dnk + 4*ratings.ft + 1*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

				} else {
					position = 'MID';
					ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 3 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 4 * ratings.dnk + 3*ratings.ft + 2*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

				}

			/*	if (Math.random() < .75) {
					position = 'MID';
				} else {
					position = 'TOP';
				}*/
			}
        } else if (risk) {
            position = 'TOP';
			ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 2 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 5 * ratings.dnk + 2*ratings.ft + 3*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 2* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

        } else if (teamfight) {
            position = 'ADC';
			ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 3 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 4 * ratings.dnk + 4*ratings.ft + 1*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

        } else  {

			if (Math.random() < .80) {
				position = 'MID';
				ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 3 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 4 * ratings.dnk + 3*ratings.ft + 2*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

			} else if (Math.random() < .60) {
				position = 'ADC';
				ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 3 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 4 * ratings.dnk + 4*ratings.ft + 1*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 1* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

			} else {
				position = 'TOP';
				ovrRating = ((2 * ratings.hgt + 2*ratings.stre + 2 * ratings.spd + 2 * ratings.jmp + 3 * ratings.endu + 2 * ratings.ins + 5 * ratings.dnk + 2*ratings.ft + 3*ratings.fg + 2 * ratings.tp + 2*ratings.blk + 4*ratings.stl + 2* ratings.drb + 1 * ratings.pss + ratings.reb) / 34);

			}
        }

        // This formula is loosely based on linear regression (maybe at some point)
		return Math.round(ovrRating);
    }


function fuzzRating(rating: number, fuzz: number): number {
    // Turn off fuzz in multi team mode, because it doesn't have any meaning there in its current form
    if (g.userTids.length > 1 || g.godMode) {
        fuzz = 0;
    }
	//console.log(rating+" "+fuzz);
//	console.log(Math.round(helpers.bound(rating + fuzz, 0, 100)));

    return Math.round(helpers.bound(rating + fuzz, 0, 100));
}

    /**
     * MMR Calc
     *
     * @memberOf core.player
     * @param {number} rating Input rating.
     * @return {number} If rating is below 0, 0. If rating is above 100, 100. Otherwise, rating.
     */
//    function MMR(ratings,champions,topADC,topTOP,topMID,topJGL,topSUP) {
    function MMR(ratings,champions,pos,c,cp) {

							/*		console.log("GOT HERE");

							console.log(c.length);
							console.log(cp.length);
							console.log(_.size(c));
							console.log(_.size(cpSorted));*/

								var i,j;
								var cpSorted;
								var topADC,topMID,topJGL,topTOP,topSUP;

								cpSorted = [];

								for (i = 0; i < _.size(cp); i++) {
									cpSorted.push({"champion": cp[i].champion,"cpid": cp[i].cpid,"rank": cp[i].rank,"role": cp[i].role});
								}

								cpSorted.sort(function (a, b) { return a.rank - b.rank; });


								topADC = [];
								topMID = [];
								topJGL = [];
								topTOP = [];
								topSUP = [];
								console.log(cpSorted);
								for (i = 0; i < _.size(cpSorted); i++) {
									if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
								//	   console.log(_.size(c));
										for (j = 0; j < _.size(c); j++) {
											if (c[j].name == cpSorted[i].champion) {
												topADC.push(c[j].hid);
												j = _.size(c);
											}
										}
									}
									if ((cpSorted[i].role == "MID") && (topMID.length < 5) ) {
					//				  topMID.push(cpSorted[i].cpid);
										for (j = 0; j < _.size(c); j++) {
											if (c[j].name == cpSorted[i].champion) {
												topMID.push(c[j].hid);
												j = _.size(c);
											}
										}
									}
									if ((cpSorted[i].role == "JGL") && (topJGL.length < 5) ) {
					//				  topJGL.push(cpSorted[i].cpid);
										for (j = 0; j < _.size(c); j++) {
											if (c[j].name == cpSorted[i].champion) {
												topJGL.push(c[j].hid);
												j = _.size(c);
											}
										}
									}
									if ((cpSorted[i].role == "TOP") && (topTOP.length < 5) ) {
					//				  topTOP.push(cpSorted[i].cpid);
										for (j = 0; j < _.size(c); j++) {
											if (c[j].name == cpSorted[i].champion) {
												topTOP.push(c[j].hid);
												j = _.size(c);
											}
										}
									}
									if ((cpSorted[i].role == "SUP") && (topSUP.length < 5) ) {
					//				  topSUP.push(cpSorted[i].cpid);
										for (j = 0; j < _.size(c); j++) {
											if (c[j].name == cpSorted[i].champion) {
												topSUP.push(c[j].hid);
												j = _.size(c);
											}
										}

									}

								}


							/*console.log(topADC);
							console.log(topMID);
							console.log(topJGL);
							console.log(topTOP);
							console.log(topSUP);									*/


				/*							return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3,null,null,t).then(function() {
											});						*/

							var MMR,skillMMR;

							skillMMR = 0;

							//	console.log(topADC.length+" "+topTOP.length+" "+topMID.length+" "+topJGL.length+" "+topSUP.length);
							if (pos == "ADC") {
								for (j = 0; j <  topADC.length; j++) {
									skillMMR += champions[topADC[j]].skill
								}
							}
							if (pos == "TOP") {
								for (j = 0; j <  topTOP.length; j++) {
									skillMMR += champions[topTOP[j]].skill
								}
							}
							if (pos == "MID") {
								for (j = 0; j <  topMID.length; j++) {
									skillMMR += champions[topMID[j]].skill
								}
							}
							if (pos == "JGL") {
								for (j = 0; j <  topJGL.length; j++) {
									skillMMR += champions[topJGL[j]].skill
								}
							}
							if (pos == "SUP") {
								for (j = 0; j <  topSUP.length; j++) {
									skillMMR += champions[topSUP[j]].skill
								}
							}
									//console.log(skillMMR);

							MMR = MMRcalc(ratings.ovr,skillMMR);
							//MMR = Math.round(ratings.ovr*9 +2200+skillMMR*1,0); // up to 500 + 2200 + up to 500
									//console.log(MMR);

						return Math.floor(MMR);


    }

   /**
     * MMR Calc
     *
     * @memberOf core.player
     * @param {number} rating Input rating.
     * @return {number} If rating is below 0, 0. If rating is above 100, 100. Otherwise, rating.
     */
//    function MMR(ratings,champions,topADC,topTOP,topMID,topJGL,topSUP) {
    function MMRcalc(ovr,skillMMR) {

				var MMR

				if (g.gameType == 1 || g.gameType == 6) {
					MMR = Math.round(ovr*ovr/55*5 +2150+skillMMR*skillMMR/200*.5,0); // up to 500 + 2200 + up to 500
				} else if (g.gameType == 7) {
					MMR = Math.round(ovr*ovr/55*5 +2050+skillMMR*skillMMR/200*.5,0); // up to 500 + 2200 + up to 500
				} else {
					MMR = Math.round(ovr*9 +2200+skillMMR*1,0); // up to 500 + 2200 + up to 500
				}
							//console.log(MMR+" "+g.gameType);

				return Math.floor(MMR);


    }

    /**
     * Rank Calc
     *
     * @memberOf core.player
     * @param {number} rating Input rating.
     * @return {number} If rating is below 0, 0. If rating is above 100, 100. Otherwise, rating.
     */
    function rank(MMR) {
		var fuzzedMMR,rank;

		fuzzedMMR = MMR+random.randInt(-50, 50);
		if ( fuzzedMMR < 2200) {
			rank = "Platinum 1";
		} else if ( fuzzedMMR< 2270) {
			rank = "Diamond V";
		} else if (fuzzedMMR < 2340) {
			rank = "Diamond IV";
		} else if (fuzzedMMR < 2410) {
			rank = "Diamond III";
		} else if (fuzzedMMR < 2480) {
			rank = "Diamond II";
		} else if (fuzzedMMR < 2550) {
			rank = "Diamond I";
		} else if (fuzzedMMR < 2750) {
			rank = "Master";
		} else  {
			rank = "Challenger";
		}

	  					//	console.log(rank);
        return rank;
    }


function hasSkill(ratings: PlayerRatings, components: RatingKey[], weights?: number[]): boolean {
    if (weights === undefined) {
        // Default: array of ones with same size as components
        weights = [];
        for (let i = 0; i < components.length; i++) {
            weights.push(1);
        }
    }

    let numerator = 0;
    let denominator = 0;
//	console.log(ratings);
//	console.log(ratings.fuzz);
//	console.log(components.length);
//	console.log(weights.length);
    for (let i = 0; i < components.length; i++) {
        const rating = components[i] === 'hgt' ? ratings[components[i]] : fuzzRating(ratings[components[i]], ratings.fuzz); // don't fuzz height
		//console.log(rating);
        numerator += rating * weights[i];
        denominator += 100 * weights[i];
    }

//    if (numerator / denominator > 0.75) {
	//console.log(numerator+" "+denominator);
	//console.log(numerator+" "+denominator);
    if (numerator / denominator > 0.65) {
        return true;
    }
    return false;
}

/**
 * Assign "skills" based on ratings.
 *
 * "Skills" are discrete categories, like someone is a 3 point shooter or they aren't. These are displayed next to the player's name generally, and are also used in game simulation. The possible skills are:
 *
 * * Three Point Shooter (3)
 * * Athlete (A)
 * * Ball Handler (B)
 * * Interior Defender (Di)
 * * Perimeter Defender (Dp)
 * * Post Scorer (Po)
 * * Passer (Ps)
 * * Rebounder (R)
 *
 * @memberOf core.player
 * @param {Object.<string, number>} ratings Ratings object.
 * @return {Array.<string>} Array of skill IDs.
 */
function skills(ratings: PlayerRatings): PlayerSkill[] {
    const sk = [];

    // These use the same formulas as the composite rating definitions in core.game!
    if (hasSkill(ratings, COMPOSITE_WEIGHTS.shotcalling.ratings, COMPOSITE_WEIGHTS.shotcalling.weights)) {
        sk.push("SC");
    }
    if (hasSkill(ratings, COMPOSITE_WEIGHTS.teamPlayer.ratings, COMPOSITE_WEIGHTS.teamPlayer.weights)) {
        sk.push("TP");
    }
    if (hasSkill(ratings, COMPOSITE_WEIGHTS.jungleControl.ratings, COMPOSITE_WEIGHTS.jungleControl.weights)) {
        sk.push("JC");
    }
    if (hasSkill(ratings, COMPOSITE_WEIGHTS.towering.ratings, COMPOSITE_WEIGHTS.towering.weights)) {
        sk.push("Tw");
    }
    if (hasSkill(ratings, COMPOSITE_WEIGHTS.championKilling.ratings, COMPOSITE_WEIGHTS.championKilling.weights)) {
        sk.push("CK");
    }
    if (hasSkill(ratings, COMPOSITE_WEIGHTS.creepScore.ratings, COMPOSITE_WEIGHTS.creepScore.weights)) {
        sk.push("CS");
    }
    if (hasSkill(ratings, COMPOSITE_WEIGHTS.aggression.ratings, COMPOSITE_WEIGHTS.aggression.weights)) {
        sk.push("Ag");
    }

    return sk;
}

/**
 * Generate a contract for a player.
 *
 * @memberOf core.player
 * @param {Object} ratings Player object. At a minimum, this must have one entry in the ratings array.
 * @param {boolean} randomizeExp If true, then it is assumed that some random amount of years has elapsed since the contract was signed, thus decreasing the expiration date. This is used when generating players in a new league.
 * @return {Object.<string, number>} Object containing two properties with integer values, "amount" with the contract amount in thousands of dollars and "exp" with the contract expiration year.
 */
    function genContract(p, randomizeExp, randomizeAmount, noLimit) {
        var amount, expiration, maxAmount, minAmount, potentialDifference, ratings, years;
		var valueP, potP, ovrP;
		var adjustmentFactor;

        ratings = p.ratings[p.ratings.length - 1];

        randomizeExp = randomizeExp !== undefined ? randomizeExp : false;
        randomizeAmount = randomizeAmount !== undefined ? randomizeAmount : true;
        noLimit = noLimit !== undefined ? noLimit : false;

        // Limits on yearly contract amount, in $1000's

        // Scale proportional to (ovr*2 + pot)*0.5 120-210
        //amount = ((3 * p.value) * 0.85 - 110) / (210 - 120);  // Scale from 0 to 1 (approx)
        //amount = amount * (maxAmount - minAmount) + minAmount;
		//console.log(p.value);

		//console.log(p.pos);
		valueP =  p.value;
		potP = ratings.pot;
		ovrP = ratings.ovr;
		if (typeof(g.customRosterMode) == 'undefined') {
		} else {
			if (g.customRosterMode)  {
				adjustmentFactor = .4;
				valueP -= adjustmentFactor*100;
				potP -= adjustmentFactor*100;
				ovrP -= adjustmentFactor*100;
				valueP *= (1+adjustmentFactor/(1-adjustmentFactor));
				potP *= (1+adjustmentFactor/(1-adjustmentFactor));
				ovrP *= (1+adjustmentFactor/(1-adjustmentFactor));
			} else {
			}
		}

	//	console.log(g.maxContract);
	//	console.log(g.minContract);
		if ( valueP>85  ) {
			minAmount = g.minContract*5/1000;
			maxAmount = g.maxContract/1000;
			amount = ((valueP - 1) / 100 - 0.45) * (maxAmount - minAmount) + minAmount;
		} else if ( valueP>60 ) {
			minAmount = g.minContract*2/1000;
			maxAmount = g.minContract*10/1000-25;
			amount = ((valueP - 1) / 100 - 0.45) * 3.3 *  (maxAmount - minAmount) + minAmount;

		} else {
			minAmount = g.minContract/1000+10;
			maxAmount = g.minContract/1000+25;
			amount = ((valueP - 1) / 100 - 0.45) *  (maxAmount - minAmount) + minAmount;
		}
        if (randomizeAmount) {
            amount *= helpers.bound(random.realGauss(1, 0.1), 0, 2);  // Randomize
        }

		//	console.log(amount);
		if (p.ratings[0].pos== "JGL") {
		 amount *= .8;
		} else if (p.ratings[0].pos== "SUP") {
		 amount *= .7;
		} else if (p.ratings[0].pos== "MID") {
		 amount *= 1.4;
		} else if (p.ratings[0].pos== "TOP") {
		 amount *= 1.1;
		} else {
		 amount *= 1.2;
		}
	//		console.log(amount);
		//amount *= 1.3;
	//	console.log("after: "+ amount);
        // Expiration
        // Players with high potentials want short contracts
        potentialDifference = Math.round((ratings.pot - ratings.ovr) / 4.0);
        years = 3 - potentialDifference;
        if (years < 1) {
            years = 1;
        }
        // Bad players can only ask for short deals
        if (ratings.pot < 40) {
            years = 1;
        } else if (ratings.pot < 60) {
            years = 2;
        } else  {
            years = 3;
        }

        // Randomize expiration for contracts generated at beginning of new game
        if (randomizeExp) {
            years = random.randInt(1, years);

            // Make rookie contracts more reasonable
            if (g.season - p.born.year <= 22) {
                //amount /= 4; // Max $5 million/year
            }
        }

        expiration = g.season + years - 1;

        if (!noLimit) {
            if (amount < minAmount * 1.1) {
                amount = minAmount;
            } else if (amount > maxAmount) {
                amount = maxAmount;
            }
        } else {
            // Well, at least keep it positive
            if (amount < g.minContract+10) {
                amount = g.minContract+10;
            }
        }
		amount = 0.05 * Math.round(amount / 0.05);  // Make it a multiple of 50k
		amount *= 1000;
			//console.log(amount);

	//	if (amount > 200000) {
		//			console.log("HEREHEREEJERKJJDSLFJDSfj");
			//		console.log(p);
				//	console.log(amount);
		//}

        return {amount: amount, exp: expiration};
    }


/**
 * Store a contract in a player object.
 *
 * @memberOf core.player
 * @param {Object} p Player object.
 * @param {Object} contract Contract object with two properties,    exp (year) and amount (thousands of dollars).
 * @param {boolean} signed Is this an official signed contract (true), or just part of a negotiation (false)?
 * @return {Object} Updated player object.
 */
function setContract(
    p: Player | PlayerWithoutPid,
    contract: PlayerContract,
    signed: boolean,
) {
    p.contract = contract;

    // Only write to salary log if the player is actually signed. Otherwise, we're just generating a value for a negotiation.
    if (signed) {
        // Is this contract beginning with an in-progress season, or next season?
        let start = g.season;
        if (g.phase > g.PHASE.AFTER_TRADE_DEADLINE) {
            start += 1;
        }

        for (let i = start; i <= p.contract.exp; i++) {
            p.salaries.push({season: i, amount: contract.amount});
        }
    }
}

   /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function pos(ratings: PlayerRatings): string {

	   var position;
       var teamplayer,aware; // support and jungle
	   var risk,sumsp; // jungle
	   var teamfight; //support
	   var laning; //top
	   var teamfight; //adc
	   //rest mid

        teamplayer = false;
        aware = false;
        risk = false;
        sumsp = false;
        teamfight = false;
        laning = false;

        // Default position
        if (ratings.drb >= 60) {
            position = 'JGL';
        } else if (ratings.ins >= 70) {
            position = 'SUP';
        } else {
            position = 'MID';
		}


		if ((ratings.jmp >  ratings.dnk*.9)) {
            teamplayer = true;  // teamplayer > laning
        }
		if ((ratings.ins >  ratings.stl*.9)) {
            aware = true;  // aware>lasthit
        }
		if ((ratings.fg >  ratings.ft*0.8)) {
            risk = true;  // risk taking > teamfighting
        }

		if ((ratings.drb >  ratings.ft*5.0)) {
            sumsp = true;  // sumspell > teamfighting
        }
		if ((ratings.ft >  ratings.dnk*1.0)) {
            teamfight = true;  // teamfight > laning (top vs mid/adc)
        }
		if ((ratings.ft >  ratings.jmp*1.1)) {
            laning = true;  // laning > teamplayer (mid/adc/top vs jungle/support)
        }


        if (teamplayer && aware && !laning) {
			if (teamfight) {
				position = 'SUP';
		    } else if (risk && sumsp ) {
				position = 'JGL';
			} else {

				if (risk) {
					position = 'TOP';
		        } else if (teamfight) {
					position = 'ADC';
				} else {
					position = 'MID';
				}
			}
        } else if (risk) {
            position = 'TOP';
        } else if (teamfight) {
            position = 'ADC';
        } else  {

			if (Math.random() < .75) {
				position = 'MID';
			} else if (Math.random() < .10) {
				position = 'ADC';
			} else {
				position = 'TOP';
			}
        }

        return position;
    }


	function calcBaseChange(age: number, potentialDifference: number): number {
//       calcBaseChange = function (age, potentialDifference) {
		var val;


	//	console.log(p.ratings[r].reb);
		// Factor in potential difference
		// This only matters for young players who have potentialDifference != 0

		// Average rating change if there is no potential difference
		if (age <= 19) {
			val = 0;
		} else if (age <= 21) {
			val = 0;
		} else if (age <= 23) {
			val = -1;
		} else if (age <= 25) {
			val = -2;
		} else {
			val = -3;
	}


		if (age <= 19) { // was 21
			if (Math.random() < 0.50) {  // was .75
				val += potentialDifference * random.uniform(0.0, 0.9);  // was 0.2
			} else {
				val += potentialDifference * random.uniform(0.0, 0.2);  // was 0.1
			}
		} else if (age <= 21) {   // was 23
			if (Math.random() < 0.15) { // was .25
				val += potentialDifference * random.uniform(0.0, 0.9);  // was 0.2
			} else {
				val += potentialDifference * random.uniform(0.0, 0.2);  // was 0.1
			}
		} else if (age <= 23) {   // was .25 (new)
			if (Math.random() < 0.05) {
				val += potentialDifference * random.uniform(0.0, 0.9);
			} else {
				val += potentialDifference * random.uniform(0.0, 0.2);  // was 0.3
			}
		} else {
			val += potentialDifference * random.uniform(0, 0.1);
		}

		// Noise
		if (age <= 23) {
			val += helpers.bound(random.realGauss(0, 5), -4, 10);
		} else {
			val += helpers.bound(random.realGauss(0, 3), -2, 10);
		}

		return val;
	};


    /**
     * Develop (increase/decrease) player's ratings. This operates on whatever the last row of p.ratings is.
     *
     * Make sure to call player.updateValues after this! Otherwise, player values will be out of sync.
     *
     * @memberOf core.player
     * @param {Object} p Player object.
     * @param {number=} years Number of years to develop (default 1).
     * @param {boolean=} generate Generating a new player? (default false). If true, then the player's age is also updated based on years.
     * @param {number=} coachingRank From 1 to g.numTeams (default 30), where 1 is best coaching staff and g.numTeams is worst. Default is 15.5
     * @return {Object} Updated player object.
     */
	/* function develop(
    p: {born: {loc: string, year: number},
	pos?: string,
	ratings: PlayerRatings[]},
    years?: number = 1,
    newPlayer?: boolean = false,
    coachingRank?: number = 15.5,
) {*/

function develop(
    p: {born: {loc: string, year: number}, pos?: string, ratings: PlayerRatings[]},
    years?: number = 1,
    newPlayer?: boolean = false,
    coachingRank?: number = 15.5,
	topADC,topMID,topJGL,topTOP,topSUP, // need to include in the develop function
) {

			//	console.log(JSON.stringify(p.ratings));

   // function develop(p, years, generate, coachingRank,topADC,topMID,topJGL,topTOP,topSUP) {
        var age, baseChange, baseChangeLocal, i, j, r, ratingKeys;
		var skillMMR;
		var fuzzedMMR;
		//	console.log(p);
      //  years = years !== undefined ? years : 1;
  //      generate = generate !== undefined ? generate : false;
      //  coachingRank = coachingRank !== undefined ? coachingRank : 15.5; // This applies to free agents!

        r = p.ratings.length - 1;

        age = g.season - p.born.year;

        for (i = 0; i < years; i++) {
            age += 1;

            // Randomly make a big jump
            if (Math.random() > 0.985 && age <= 23) {
                p.ratings[r].pot += random.uniform(5, 25);
            }

            // Randomly regress
            if (Math.random() > 0.995 && age <= 23) {
                p.ratings[r].pot -= random.uniform(5, 25);
            }

			// Average rating change if there is no potential difference
			/*if (age <= 19) {
				val = 5+(p.ratings[r].reb-100)/200;  // was -50
			} else if (age <= 22) {
				val = 0+(p.ratings[r].reb-100)/200; // was 150
			} else if (age <= 24) {
				val = -1+(p.ratings[r].reb-100)/100; // was 3 // was 75
			} else if (age <= 26) {
				val = -2+(p.ratings[r].reb-100)/100; // was 5 // was 3 // was 50
			} else {
				val = -3+(p.ratings[r].reb-100)/100; //was 10 // was 5 // was 25
			}		*/
				//console.log(JSON.stringify(p.ratings[r]));
            baseChange = calcBaseChange(age, p.ratings[r].pot - p.ratings[r].ovr);

			//console.log(baseChange);
			//console.log(coachingRank);
					//		console.log(JSON.stringify(p.ratings[r]));
            // Modulate by coaching
            if (baseChange >= 0) { // life is normal
                baseChange *= ((coachingRank - 1) * (-0.5) / (g.numTeams - 1) + 1.25);
            } else {
                baseChange *= ((coachingRank - 1) * (0.5) / (g.numTeams - 1) + 0.75);
            }
			//	console.log(JSON.stringify(p.ratings[r]));
            // Ratings that can increase a lot, but only when young. Decrease when old.
//            ratingKeys = ["stre", "dnk", "blk", "stl"];
            if (age > 23 && !g.retirementPlayers) {
				baseChangeLocal = 0;
			}

            ratingKeys = ["dnk", "ft", "blk", "stl","drb","tp","ins","fg"];
            for (j = 0; j < ratingKeys.length; j++) {
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + baseChange * random.uniform(0.5, 1.5));
            }
				//console.log(JSON.stringify(p.ratings[r]));
            // Ratings that increase most when young, but can continue increasing for a while and only decrease very slowly.
//            ratingKeys = ["hgt", "stre", "spd", "jmp","endu"];
            ratingKeys = ["hgt", "stre", "spd", "jmp","endu"];
            for (j = 0; j < ratingKeys.length; j++) {
                if (age <= 21) {
                    baseChangeLocal = baseChange;
                } else if (age <= 23) {
                    baseChangeLocal = baseChange + 1;
                } else if (!g.retirementPlayers) {
					baseChangeLocal = 0;
                } else {
                    baseChangeLocal = baseChange + 3;
                }
				if (baseChangeLocal<= 1) {
					baseChangeLocal = 1;
				}
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + baseChangeLocal * random.uniform(0.5, 1.5));
            }
				//console.log(JSON.stringify(p.ratings[r]));
//console.log([age, p.ratings[r].pot - p.ratings[r].ovr, ovr(p.ratings[r]) - p.ratings[r].ovr])
            // Update overall and potential
            p.ratings[r].ovr = ovr(p.ratings[r]);
            p.ratings[r].pot += -2 + Math.round(random.realGauss(0, 2));
            if (p.ratings[r].ovr > p.ratings[r].pot || age > 22) {
                p.ratings[r].pot = p.ratings[r].ovr;
            }

			//	console.log(JSON.stringify(p.ratings[r]));


			// champion
//			p.champions = {};
			if ((p.championAverage == -1) || (p.championAverage === undefined)) {
				p.championAverage = -1;
			} else {
				p.championAverage == p.ratings[r].ovr
			}


			//console.log(p.champions.length+" "+g.numChampions);
//			for (j = 0; j <  _.size(p.champions); j++) {
		//	if (g.gameType < 7) {
				for (j = 0; j <  g.numChampions; j++) {
				//	console.log(j);
	//			for (j = 0; j <  125; j++) {
					//console.log(j);
					//console.log(p.champions[j].skill);

					if (p.champions[j] == undefined) {
						p.champions[j] = {skill: 50};
						//console.log(p.champions[j]);
					}


					p.champions[j].skill =   p.ratings[r].ovr*.5+(Math.random()*20-10);
					p.champions[j].skill = Math.round(p.champions[j].skill,0);
					if (p.champions[j].skill< 0) {
					   p.champions[j].skill = 0;
					} else if (p.champions[j].skill > 100 ) {
					   p.champions[j].skill = 100;
					}
					//console.log(p.champions[j].skill);
				}
		//	}


			skillMMR = 0;

			if (p.ratings[0].pos== "ADC") {
				for (j = 0; j <  topADC.length; j++) {
					skillMMR += p.champions[topADC[j]].skill
				}
			}
			if (p.ratings[0].pos== "TOP") {
				for (j = 0; j <  topTOP.length; j++) {
					skillMMR += p.champions[topTOP[j]].skill
				}
			}
			if (p.ratings[0].pos== "MID") {
				for (j = 0; j <  topMID.length; j++) {
					skillMMR += p.champions[topMID[j]].skill
				}
			}
			if (p.ratings[0].pos== "JGL") {
				for (j = 0; j <  topJGL.length; j++) {
					skillMMR += p.champions[topJGL[j]].skill
				}
			}
			if (p.ratings[0].pos== "SUP") {
				for (j = 0; j <  topSUP.length; j++) {
					skillMMR += p.champions[topSUP[j]].skill
				}
			}
		//	console.log(skillMMR);
			p.ratings[r].MMR = MMRcalc(p.ratings[r].ovr,skillMMR);
			//p.ratings[r].MMR = Math.round(p.ratings[r].ovr*9 +2200+skillMMR*1,0); // up to 500 + 2200 + up to 500
			//console.log(p.ratings[0].ovr+" "+skillMMR+" "+p.ratings[0].MMR);
			//console.log(p.ratings[0].MMR);

			fuzzedMMR = p.ratings[0].MMR+random.randInt(-50, 50);
			if ( fuzzedMMR < 2200) {
				p.ratings[r].rank = "Platinum 1";
			} else if ( fuzzedMMR< 2270) {
				p.ratings[r].rank = "Diamond V";
			} else if (fuzzedMMR < 2340) {
				p.ratings[r].rank = "Diamond IV";
			} else if (fuzzedMMR < 2410) {
				p.ratings[r].rank = "Diamond III";
			} else if (fuzzedMMR < 2480) {
				p.ratings[r].rank = "Diamond II";
			} else if (fuzzedMMR < 2550) {
				p.ratings[r].rank = "Diamond I";
			} else if (fuzzedMMR < 2750) {
				p.ratings[r].rank = "Master";
			} else  {
				p.ratings[r].rank = "Challenger";
			}
        }
		//console.log(years+" "+age);
        // If this isn't here outside the loop, then 19 year old players could still have ovr > pot
        if (p.ratings[r].ovr > p.ratings[r].pot || age > 22) {
            p.ratings[r].pot = p.ratings[r].ovr;
        }

        // Likewise, If this isn't outside the loop, then 19 year old players don't get skills
      //  p.ratings[r].skills = skills(p.ratings[r]);

        if (newPlayer) {
            age = g.season - p.born.year + years;
            p.born.year = g.season - age;
        }

		// changing positions?, test first?
		// does algorithm work

       if (p.pos != p.ratings[0].pos) {
            // Must be a custom league player, let's not rock the boat
			// or allows just one position change, OK for now I guess.
            p.ratings[r].pos = p.pos;
        } else {
			if (g.yearPositionChange) {
				p.ratings[r].pos = pos(p.ratings[r]);
				p.pos = p.ratings[r].pos;
			} else {
				p.ratings[r].pos = p.pos;
			}
        }


		p.ratings[r].languages = p.languages; 	// make the function for adding languages go here?
		p.ratings[r].region = p.born.loc; 		 // make the function for adding regions go here?

			//	console.log(r);
	//	console.log(JSON.stringify(p.ratings[r]));
        return p;
    }


/**
 * Add or subtract amount from all current ratings and update the player's contract appropriately.
 *
 * This should only be called when generating players for a new league. Otherwise, develop should be used. Also, make sure you call player.updateValues and player.setContract after this, because ratings are changed!
 *
 * @memberOf core.player
 * @param {Object} p Player object.
 * @param {number} amount Number to be added to each rating (can be negative).
 * @return {Object} Updated player object.
 */
function bonus(p: Player | PlayerWithoutPid, amount: number) {
    // Make sure age is always defined
    const age = g.season - p.born.year;

    const r = p.ratings.length - 1;

    const ratingKeys = ['stre', 'spd', 'jmp', 'endu', 'ins', 'dnk', 'ft', 'fg', 'tp', 'blk', 'stl', 'drb', 'pss', 'reb', 'pot'];
    for (let i = 0; i < ratingKeys.length; i++) {
        const key = ratingKeys[i];
        p.ratings[r][key] = limitRating(p.ratings[r][key] + amount);
    }

    // Update overall and potential
    p.ratings[r].ovr = ovr(p.ratings[r]);
    if (p.ratings[r].ovr > p.ratings[r].pot || age > 22) {
        p.ratings[r].pot = p.ratings[r].ovr;
    }

    p.ratings[r].skills = skills(p.ratings[r]);
}

/**
 * Calculates the base "mood" factor for any free agent towards a team.
 *
 * This base mood is then modulated for an individual player in addToFreeAgents.
 *
 * @return {Promise} Array of base moods, one for each team.
 */


async function genBaseMoods(): Promise<number[]> {
    const teamSeasons = await idb.cache.teamSeasons.indexGetAll('teamSeasonsBySeasonTid', [`${g.season}`, `${g.season},Z`]);

    return teamSeasons.map(teamSeason => {
        // Special case for winning a title - basically never refuse to re-sign unless a miracle occurs
    //    if (teamSeason.playoffRoundsWon === g.numPlayoffRounds && Math.random() < 0.99) {
     //       return -0.25; // Should guarantee no refusing to re-sign
      //  }

        let baseMood = 0;

        // Hype
		//baseMood += (3.50 - teamSeason.hype*3.5)*1;
        baseMood += 0.5+0.5 * (1 - teamSeason.hype);

        // Facilities - fuck it, just use most recent rank
        baseMood += 0.1 * (finances.getRankLastThree([teamSeason], "expenses", "facilities") - 1) / (g.numTeams - 1);

        // Population
      //  baseMood += 0.2 * (1 - teamSeason.pop / 10);

        // Randomness
   //     baseMood += random.uniform(-0.2, 0.2);

     //   baseMood = helpers.bound(baseMood, 0, 1);

        return baseMood;
    });
}

/**
 * Adds player to the free agents list.
 *
 * This should be THE ONLY way that players are added to the free agents
 * list, because this will also calculate their demanded contract and mood.
 *
 * @memberOf core.player
 * @param {Object} p Player object.
 * @param {?number} phase An integer representing the game phase to consider this transaction under (defaults to g.phase if null).
 * @param {Array.<number>} baseMoods Vector of base moods for each team from 0 to 1, as generated by genBaseMoods.
 */
async function addToFreeAgents(p: Player | PlayerWithoutPid, phase: Phase, baseMoods: number[]) {
    phase = phase !== null ? phase : g.phase;

    const pr = p.ratings[p.ratings.length - 1];
    setContract(p, genContract(p), false);

    // Set initial player mood towards each team
    p.freeAgentMood = baseMoods.map((mood) => {
        if (pr.ovr + pr.pot < 80) {
            // Bad players don't have the luxury to be choosy about teams
            return 0;
        }
        if (phase === g.PHASE.RESIGN_PLAYERS) {
            // More likely to re-sign your own players
//            return helpers.bound(mood + random.uniform(-1, 0.5), 0, 1000);
            return helpers.bound(mood + random.uniform(0, 0.5), 0, 1000);
        }
//        return helpers.bound(mood + random.uniform(-1, 1.5), 0, 1000);
        return helpers.bound(mood + random.uniform(0.5, 1.5), 0, 1000);
    });

    // During regular season, or before season starts, allow contracts for
    // just this year.
    if (phase > g.PHASE.AFTER_TRADE_DEADLINE) {
        p.contract.exp += 1;
    }

	// does this still work?

	if  ( !g.userTids.includes(p.tid) && p.watch && typeof p.watch !== "function") {
//	if  ((p.tid != g.userTid) && p.watch && typeof p.watch !== "function") {
        logEvent({
			type: "freeAgent",
			text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> is a free agent.',
			showNotification: true,
//			showNotification: (p.tid != g.userTid) && p.watch && typeof p.watch !== "function",
//            type: "retired",
  //          text: `<a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> retired.`,
    //        showNotification: p.tid === g.userTid,
            pids: [p.pid],
            tids: [p.tid],
//        }, conditions);
        });
	}

	/*	eventLog.add(null, {
			type: "freeAgent",
			text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> is a free agent.',
			showNotification: (p.tid != g.userTid) && p.watch && typeof p.watch !== "function"
			//pids: [p.pid],
			//tids: [p.tid]
		});		*/

    p.tid = PLAYER.FREE_AGENT;

    p.ptModifier = 1; // Reset
	p.pick = 0; // Reset
	p.ban = 0; // Reset

    await idb.cache.players.put(p);
    idb.cache.markDirtyIndexes('players');
}

/**
 * Release player.
 *
 * This keeps track of what the player's current team owes him, and then calls player.addToFreeAgents.
 *
 * @memberOf core.player
 * @param {Object} p Player object.
 * @param {boolean} justDrafted True if the player was just drafted by his current team and the regular season hasn't started yet. False otherwise. If True, then the player can be released without paying his salary.
 * @return {Promise}
 */
async function release(p: Player, justDrafted: boolean) {
    // Keep track of player salary even when he's off the team, but make an exception for players who were just drafted
    // Was the player just drafted?
    if (!justDrafted) {
        await idb.cache.releasedPlayers.add({
            pid: p.pid,
            tid: p.tid,
            contract: helpers.deepCopy(p.contract),
        });
    } else {
        // Clear player salary log if just drafted, because this won't be paid.
        p.salaries = [];
    }

    logEvent({
        type: "release",
        text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season])}">${g.teamNamesCache[p.tid]}</a> released <a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a>.`,
        showNotification: false,
        pids: [p.pid],
        tids: [p.tid],
    });

    const baseMoods = await genBaseMoods();
    await addToFreeAgents(p, g.phase, baseMoods);
}

/**
 * Generate fuzz.
 *
 * Fuzz is random noise that is added to a player's displayed ratings, depending on the scouting budget.
 *
 * @memberOf core.player
 * @param {number} scoutingRank Between 1 and 30, the rank of scouting spending, probably over the past 3 years via core.finances.getRankLastThree.
 * @return {number} Fuzz, between -5 and 5.
 */
function genFuzz(scoutingRank: number): number {
    const cutoff = 2 + 8 * (scoutingRank - 1) / (g.numTeams - 1);  // Max error is from 2 to 10, based on scouting rank
    const sigma = 1 + 2 * (scoutingRank - 1) / (g.numTeams - 1);  // Stddev is from 1 to 3, based on scouting rank

    let fuzz = random.gauss(0, sigma);
    if (fuzz > cutoff) {
        fuzz = cutoff;
    } else if (fuzz < -cutoff) {
        fuzz = -cutoff;
    }

	//console.log(g.numTeams+" "+scoutingRank+" "+fuzz+" "+cutoff+" "+sigma);
    return fuzz;
}

/**
 * Generate initial ratings for a newly-created player.
 *
 * @param {string} profile [description]
 * @param {number} baseRating [description]
 * @param {number} pot [description]
 * @param {number} season [description]
 * @param {number} scoutingRank Between 1 and g.numTeams (default 30), the rank of scouting spending, probably over the past 3 years via core.finances.getRankLastThree.
 * @param {number} tid [description]
 * @return {Object} Ratings object
 */
function genRatings(
    profile: Profile,
    baseRating: number,
    pot: number,
    season: number,
    seasonSplit: number,
    scoutingRank: number,
    tid: number,
): PlayerRatings {

//console.log(profile);
//console.log(baseRating);
//console.log(pot);
		//console.log(ratings);
     //function genRatings(profile, baseRating, pot, season, scoutingRank, tid) {
        var i, j, key, profileId, profiles, ratingKeys, rawRating, rawRatings, sigmas;

        if (profile === "Point") { //support
            profileId = 1;
        } else if (profile === "Wing") { //jungle
            profileId = 2;
        } else if (profile === "Big") {  // top/mid/adc
            profileId = 3;
        } else {
            profileId = 0;  //
        }

        // Each row should sum to ~150
        profiles = [[10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // Base 150
                    [10, 10, 10, 50, 10, 50, -30, 50, -30, 10, 10, -30, -30, 10, 10], // Support
                    [15, 15, 15, 25, 15, 25, -30, -30, 30, 15, 15, -30, 30, 15, 15], // Jungle
                    [10, 10, 10, 0, 0, 10, 30, 20, 0, 10, 10, 30, -10, 10, 10]]; // Top/mid/adc 210 170 160 150
        sigmas = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
        baseRating = random.gauss(baseRating, 5);

	//	console.log(baseRating);

        rawRatings = [];
        for (i = 0; i < sigmas.length; i++) {
            rawRating = profiles[profileId][i] + baseRating;
		//console.log(rawRating);
            rawRatings[i] = limitRating(random.gauss(rawRating, sigmas[i]));
        }

		//console.log(rawRating);
//console.log(rawRatings);
      //  // Small chance of freakish ability in 2 categories
        for (i = 0; i < 2; i++) {
            if (Math.random() < 0.2) {
                // Randomly pick a non-height rating to improve
                j = random.randInt(0, 14);
				if  (j==12) {
				    if ((profileId == 2)  || (profileId == 0))  {
						rawRatings[j] = limitRating(rawRatings[j] + 30);
					}
				} else if  (j==3) {
				    if ((profileId != 3) ) {
						rawRatings[j] = limitRating(rawRatings[j] + 30);
					}
				} else if  (j==5) {
				    if ((profileId != 3) ) {
						rawRatings[j] = limitRating(rawRatings[j] + 30);
					}
				} else if  (j==6) {
				    if ((profileId == 3) || (profileId == 0)) {
						rawRatings[j] = limitRating(rawRatings[j] + 50);
					}
				} else if (j==7) {
					if ((profileId == 3) || (profileId == 1) || (profileId == 0)) {
						rawRatings[j] = limitRating(rawRatings[j] + 30);
					}
				} else if (j==8) {
					if ((profileId == 2)  || (profileId == 0)) {
						rawRatings[j] = limitRating(rawRatings[j] + 30);
					}
				} else if (j==11) {
					if ((profileId == 3) || (profileId == 0)) {
						rawRatings[j] = limitRating(rawRatings[j] + 50);
					}
				} else {
					rawRatings[j] = limitRating(rawRatings[j] + 50);
				}
            }
        }
//console.log(rawRatings);
      /*  ratings = {};
        ratingKeys = ["hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb"];
        for (i = 0; i < ratingKeys.length; i++) {
            key = [i];
            ratings[key] = rawRatings[i];
        }*/
			//		console.log(ratings);
				//	console.log(ratings);
		const ratings = {
			hgt: rawRatings[0],
			//hgt: "test",
			stre: rawRatings[1],
			spd: rawRatings[2],
			jmp: rawRatings[3],
			endu: rawRatings[4],
			ins: rawRatings[5],
			dnk: rawRatings[6],
			ft: rawRatings[7],
			fg: rawRatings[8],
			tp: rawRatings[9],
			blk: rawRatings[10],
			stl: rawRatings[11],
			drb: rawRatings[12],
			pss: rawRatings[13],
			reb: rawRatings[14],

			/*stre: "test",
			spd: "test",
			jmp: "test",
			endu: "test",
			ins: "test",
			dnk: "test",
			ft: "test",
			fg: "test",
			tp: "test",
			blk: "test",
			stl: 45,
			drb: "test",
			pss: "test",
			reb: "test",*/

			fuzz: genFuzz(scoutingRank),
			ovr: 0,
			pos: '',
			pot,
			season,
			seasonSplit,
			languages: [],
			region: '',
			skills: [],
		};


		// laning/lasthitting and awareness
		// summonerspells/awareness/teamplayer, teamfighting/lane

		// jungler
		// summoner spells high, weaker in last hitting, teamfighting, laning (jungler vs rest)
        if (ratings.drb > 40) {
            //ratings.drb = limitRating(ratings.drb - (ratings.hgt - 50));
            ratings.stl = limitRating(ratings.stl - (ratings.drb - 15));
            ratings.ft = limitRating(ratings.ft - (ratings.drb - 15));
            ratings.dnk = limitRating(ratings.dnk - (ratings.drb - 15));
        } else {
            ratings.stl = limitRating(ratings.stl + 10);
            ratings.ft = limitRating(ratings.ft + 10);
            ratings.dnk = limitRating(ratings.dnk + 10 );
        }

		//laners
		// last hitting high, awareness lower (laners vs support and jungler)
        if (ratings.stl > 40) {
            //ratings.drb = limitRating(ratings.drb - (ratings.hgt - 50));
            ratings.ins = limitRating(ratings.ins - (ratings.ins - 50));
        } else {
            ratings.ins = limitRating(ratings.ins + 10);
        }


        ratings.season = season;
        ratings.ovr = ovr(ratings);
        ratings.pot = pot;

        ratings.fuzz = genFuzz(scoutingRank);

		if (tid === PLAYER.UNDRAFTED_2) {
		 ratings.fuzz *= 2;
		} else if (tid === PLAYER.UNDRAFTED_3) {
		 ratings.fuzz *= 4;
		}

		//console.log(ratings);
        ratings.skills = skills(ratings);
		//console.log(ratings.skills);
		ratings.pos = pos(ratings);

		    // Likewise, If this isn't outside the loop, then 19 year old players don't get skills
     //   p.ratings[0].skills = skills(p.ratings[0]);

	//	console.log(profile);
	//	console.log(ratings);
        return ratings;
    }


function name(countryAlready: string, asianUS: boolean): {country: string, firstName: string, lastName: string, maleFemale: string} {
    if (playerNames === undefined) {
        // This makes it wait until g is loaded before calling names.load, so user-defined names will be used if provided
        playerNames = names.load();
    }


	// Country
	//console.log(playerNames.countries);
	//console.log(playerNames.countries.length);
   /* const cRand = random.uniform(0, playerNames.countries[playerNames.countries.length - 1][1]); // use countryAlready to loop to find country data?
	///console.log(cRand);
    const countryRow = playerNames.countries.find(row => row[1] >= cRand);
	//console.log(countryRow);
    if (countryRow === undefined) {
        throw new Error(`Undefined countryRow (cRand=${cRand}`);
    }
    var country = countryRow[0];*/

	//console.log(playerNames.countries);
	//console.log(country+" "+countryAlready);


	if (countryAlready == "United States") {
		country = "USA";
	} else if (countryAlready == "Korea") {
		country = "South Korea";
	} else if (countryAlready == "Taiwan" || countryAlready == "Hong Kong" || countryAlready == "Macao") {
		country = "China";
	} else if (countryAlready == "Ecuador") {
		country = "LatAmN";
	} else if (countryAlready == "Peru") {
		country = "LatAmN";
	} else if (countryAlready == "Costa Rica") {
		country = "LatAmN";
	} else if (countryAlready == "Paraguay") {
		country = "LatAmS";
	} else {
		country = countryAlready;
	}
	//console.log(country+" "+countryAlready);
	//console.log(country);

    // First name

    const fnRand = random.uniform(0, playerNames.first[country][playerNames.first[country].length - 1][1]);
    const firstNameRow = playerNames.first[country].find(row => row[1] >= fnRand);
    if (firstNameRow === undefined) {
        throw new Error(`Undefined firstNameRow (fnRand=${fnRand}`);
    }
    const firstName = firstNameRow[0];

	if (asianUS) {
		country = "China"
	}

    // Last name
    const lnRand = random.uniform(0, playerNames.last[country][playerNames.last[country].length - 1][1]);
    const lastNameRow = playerNames.last[country].find(row => row[1] >= lnRand);
    if (lastNameRow === undefined) {
        throw new Error(`Undefined lastNameRow (lnRand=${lnRand}`);
    }
    const lastName = lastNameRow[0];

    return {
        country,
        firstName,
        lastName,
    };
}


function nameAsian(): {country: string, firstName: string, lastName: string} {
    if (playerNames === undefined) {
        // This makes it wait until g is loaded before calling names.load, so user-defined names will be used if provided
        playerNames = names.load();
    }

    // Country Supplied
/*    const cRand = random.uniform(0, playerNames.countries[playerNames.countries.length - 1][1]);
    const countryRow = playerNames.countries.find(row => row[1] >= cRand);
    if (countryRow === undefined) {
        throw new Error(`Undefined countryRow (cRand=${cRand}`);
    }
    const country = countryRow[0]; */

	var country = "United States";
    // First name
    const fnRand = random.uniform(0, playerNames.first[country][playerNames.first[country].length - 1][1]);
    const firstNameRow = playerNames.first[country].find(row => row[1] >= fnRand);
    if (firstNameRow === undefined) {
        throw new Error(`Undefined firstNameRow (fnRand=${fnRand}`);
    }
    const firstName = firstNameRow[0];

	if (Math.random() < .50) {
		country = "China";
	} else {
		country = "South Korea";
	}
    // Last name
    const lnRand = random.uniform(0, playerNames.last[country][playerNames.last[country].length - 1][1]);
    const lastNameRow = playerNames.last[country].find(row => row[1] >= lnRand);
    if (lastNameRow === undefined) {
        throw new Error(`Undefined lastNameRow (lnRand=${lnRand}`);
    }
    const lastName = lastNameRow[0];

    return {
        country,
        firstName,
        lastName,
    };
}



	// this will be replaced with a name file, maybe filtered
    function userID() {
//        var prefixID,baseID,suffixID,numberID,prefixRand,baseRand, suffixRand, i, numberRand,userID;
        var userIDPlayer,userIDLocation, i;
//        var userIDPlayer,userIDString,userIDLocation, i;

		//var usedSomething;
		//prefix,base,suffix,number;

	//	console.log(userIDs.userIDs);
		userIDLocation = random.randInt(0, userIDs.userIDs.length-1);

	  // console.log(userIDLocation);
		userIDPlayer = userIDs.userIDs[userIDLocation][0];
		//userIDString = userIDPlayer[0];
		//console.log(typeof(userIDPlayer));
		//console.log(typeof(userIDString));
		//console.log(userIDPlayer);
		userIDPlayer = userIDPlayer.replace(/\s+/g, '');
		//console.log(userIDPlayer);

     /*   for (i = 0; i < userIDs.userIDs.length; i++) {
            if (i >= userIDLocation) {
                break;
            }
        }
		userID = userIDs.userIDs[i]
	   console.log(userID);*/

//        prefixID = userIDs.prefix[i];
/*

       baseRand = random.uniform(0, userIDs.base.length-1);
        for (i = 0; i < userIDs.base.length; i++) {
            if (i >= baseRand) {
                break;
            }
        }
        baseID = userIDs.base[i];

        // suffix
        suffixRand = random.uniform(0, 4.06);
        for (i = 0; i < userIDs.suffix.length; i++) {
            if (userIDs.suffix[i][1] >= suffixRand) {
                break;
            }
        }
        suffixID = userIDs.suffix[i][0];


        // number
        numberRand = random.uniform(0, 3.86);
        for (i = 0; i < userIDs.number.length; i++) {
            if (userIDs.number[i][1] >= numberRand) {
                break;
            }
        }
        numberID = userIDs.number[i][0];

		userID = "";
		usedSomething = 0;
		if (Math.random() < .5 ) {
		  if ((userID.length+prefixID.length)< 17) {
			  userID += prefixID;
			  usedSomething += 1;
		  }
		}
  	    userID += baseID;
		if (Math.random() < .35 ) {
		  if ((userID.length+suffixID.length)< 17) {
			  userID += suffixID;
			  usedSomething += 1;
		  }
		}
		if (Math.random() < .35 ) {
		  if ((userID.length+numberID.length)< 17) {

			  userID += numberID;
			  usedSomething += 1;
		  }

		}

		if (Math.random() < .25 ) {
		  userID = userID.replace("i", "I");
		  usedSomething += 1;
		}

		if (Math.random() < .10 ) {
		  userID = userID.replace("a", "A");
		  usedSomething += 1;
		}

		if (Math.random() < .10 ) {
		  userID = userID.replace("e", "E");
		  usedSomething += 1;
		}

		if (Math.random() < .10 ) {
		  userID = userID.replace("o", "O");
		  usedSomething += 1;
		}

		if (Math.random() < .10 ) {
		  userID = userID.replace("u", "U");
		  usedSomething += 1;
		} 		*/


        return userIDPlayer;
    }

    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function country(nationality) {
		var country;
		//console.log(country);
		country = 'United States';



		if (nationality == 'NA') {
			if (Math.random() < .90) {
				country = 'United States';
			} else  {
				country = 'Canada';
			}
		} else if (nationality == 'EU') {
			if (Math.random() < .10) {
				country = 'Germany';
			} else if (Math.random() < .02) {
				country = 'Romania';
			} else if (Math.random() < .11) {
				country = 'Spain';
			} else if (Math.random() < .03) {
				country = 'Scotland';
			} else if (Math.random() < .06) {
				country = 'Greece';
			} else if (Math.random() < .02) {
				country = 'Armenia';
			} else if (Math.random() < .02) {
				country = 'Bulgaria';
			} else if (Math.random() < .14) {
				country = 'Netherlands';
			} else if (Math.random() < .10) {
				country = 'England';
			} else if (Math.random() < .18) {
				country = 'Poland';
			} else if (Math.random() < .20) {
				country = 'Belgium';
			} else if (Math.random() < .25) {
				country = 'Denmark';
			} else if  (Math.random() < .10) {
				country = 'Hungary';
			} else if  (Math.random() < .30) {
				country = 'Norway';
			} else if (Math.random() < .4) {
				country = 'Sweden';
			} else if (Math.random() < 0.50) {
				country = 'France';
			} else if (Math.random() < 0.70) {
				country = 'Italy';
			} else if (Math.random() < 0.90) {
				country = 'Switzerland';
			} else if (Math.random() < 1.1) {
				country = 'Iceland';
			} else {
				country = 'United States';
			}

		} else if (nationality == 'KR') {
			country = 'Korea';
		} else if (nationality == 'CN' ) {
			country = 'China';
		} else if (nationality == 'TW') {
			country = 'Taiwan';
		} else if (nationality == 'CIS') {
			country = 'Russia';
		} else if (nationality == 'BR') {
			country = 'Brazil';
		} else if (nationality == 'JP') {
			country = 'Japan';
		} else if (nationality == 'OCE') {
			country = 'Australia';
		} else if (nationality == 'LatAm') {
			if (Math.random() < .15) {
				country = 'Chile';
			} else if (Math.random() < .55) {
				if (Math.random() < 1/7) {
					country = 'Ecuador';
				} else if (Math.random() < 1/6) {
					country = 'Colombia';
				} else if (Math.random() < 1/5) {
					country = 'Peru';
				} else if (Math.random() < 1/4) {
					country = 'Venezuela';
				} else if (Math.random() < 1/3) {
					country = 'Puerto Rico';
				} else if (Math.random() < 1/2) {
					country = 'Costa Rica';
				} else  {
					country = 'Panama';
				}
			} else {
				if (Math.random() < 1/3) {
					country = 'Argentina';
				} else if (Math.random() < 1/2) {
					country = 'Paraguay';
				} else {
					country = 'Uruguay';
				}
			}
		} else if (nationality == 'VNM') {
			country = 'Vietnam';
		} else if (nationality == 'SEA') {

			//if (Math.random() < .5) {
				country = 'Philippines';
			//} else {
			//	country = 'Vietnam';
			//}
		} else if (nationality == 'TR') {
			country = 'Turkey';
		} else {
			country = 'United States';
		}

        return country;
    }

    function languages(country, learn) {
		var languages;
		//console.log(country);
		languages = [];

		if (learn == undefined) {
			learn = false;
		}

		if (country == 'United States' || country == 'NA'  || country == 'EU' || country == 'OCE') {
			languages.push('English');
		} else if (country == 'Canada') {
			if (Math.random() < .8) {
				languages.push('English');
				if (Math.random() < .1) {
					languages.push('French');
				}
			} else {
				languages.push('French');
				if (Math.random() < .45) {
					languages.push('English');
				}
			}
		} else if (country == 'Germany') {
			languages.push('German');
			if (Math.random() < .8) {
				languages.push('English');
			}
		} else if (country == 'Romania') {
			languages.push('Romanian');
			//Hungarian, English, Lithuanian, Bulgarian, Serbo-Croatian, Russian, Slovak, Romani, Ukrainian, and German
			if (Math.random() < .45) {
				languages.push('English');
			}
		} else if (country == 'Spain') {
			languages.push('Spanish');
			if (Math.random() < .97) {
				languages.push('English');
			}
		} else if (country == 'Scotland') {
			languages.push('English');
		} else if (country == 'Greece') {
			languages.push('Greek');
			if (Math.random() < .75) {
				languages.push('English');
			}
		} else if (country == 'Armenia') {
//Russian.    English.    Other.    Kurdish.    Russian.    Assyrian.    Ukrainian.    Greek.
			languages.push('Armenian');
			if (Math.random() < .45) {
				languages.push('Russian');
			}
			if (Math.random() < .23) {
				languages.push('English');
			}
		} else if (country == 'Bulgaria') {
			languages.push('Bulgarian');
			if (Math.random() < .45) {
				languages.push('Russian');
			}
			if (Math.random() < .25) {
				languages.push('English');
			}
			//Russian (35% claimed workable knowledge of it), followed by English (23%), Italian and Spanish (12%), and French (9%).
		} else if (country == 'Netherlands') {
			languages.push('Dutch');
			//Netherlands: between 90%[12] and 93%[13] of the total population are able to converse in English, 71% in German, 29% in French and 5% in Spanish.
			if (Math.random() < .96) {
				languages.push('English');
			}
			if (Math.random() < .71) {
				languages.push('German');
			}
			if (Math.random() < .29) {
				languages.push('French');
			}
			if (Math.random() < .05) {
				languages.push('Spanish');
			}
		} else if (country == 'England') {
			languages.push('English');
		} else if (country == 'Poland') {
			languages.push('Polish');
			if (Math.random() < .97) {
				languages.push('English');
			}
		} else if (country == 'Belgium') {
			if (Math.random() < .6) {
				languages.push('Dutch');
			} else {
				languages.push('French');
			}
			if (Math.random() < .8) {
				languages.push('English');
			}
		} else if (country == 'Denmark') {
			languages.push('Danish');
			// english 86%, German 47%, Swedish 13%
			if (Math.random() < .96) {
				languages.push('English');
			}
			if (Math.random() < .47) {
				languages.push('German');
			}
			if (Math.random() < .13) {
				languages.push('Swedish');
			}
		} else if  (country == 'Hungary') {
			languages.push('Hungarian');
		} else if  (country == 'Norway') {
			languages.push('Norwegian');
			if (Math.random() < .95) {
				languages.push('English');
			}
		} else if (country == 'Sweden') {
			languages.push('Swedish');
			if (Math.random() < .96) {
				languages.push('English');
			}
		} else if (country == 'France') {
			languages.push('French');
			if (Math.random() < .93) {
				languages.push('English');
			}
		} else if (country == 'Italy'	) {
			languages.push('Italian');
			if (Math.random() < .98) {
				languages.push('English');
			}
			if (Math.random() < .16) {
				languages.push('French');
			}
			if (Math.random() < .11) {
				languages.push('Spanish');
			}
			if (Math.random() < .05) {
				languages.push('German');
			}
		} else if (country == 'Switzerland'	) {
			if (Math.random() < .86) {
				languages.push('German');
			}
			if (Math.random() < .85) {
				languages.push('French');
			}
			if (Math.random() < .36) {
				languages.push('Italian');
			}
			if (Math.random() < .80) {
				languages.push('English');
			}
		} else if (country == 'Iceland') {
			languages.push('Icelandic');
			if (Math.random() < .95) {
				languages.push('English');
			}
			if (Math.random() < .90) {
				languages.push('Danish');
			}
			if (Math.random() < .05) {
				languages.push('German');
			} else if (Math.random() < .05) {
				languages.push('French');
			} else if (Math.random() < .05) {
				languages.push('Spanish');
			}
		} else if (country == 'United States') {
			languages.push('English');
		} else if (country == 'Korea' || country == 'KR') {
			languages.push('Korean');
		} else if (country == 'China' || country == 'CN') {
			languages.push('Chinese');
			if (Math.random() < .08) {
			//	console.log("ENGLISH CHINESE");
				languages.push('English');
			}
		} else if (country == 'Taiwan' || country == 'TW') {
			languages.push('Chinese');
		} else if (country == 'Russia' || country == 'CIS') {
			languages.push('Russian');
			if (Math.random() < .05) {
				languages.push('English');
			}
		} else if (country == 'Brazil' || country == 'BR') {
			languages.push('Portuguese');
			if (Math.random() < .05) {
				languages.push('English');
			}
		} else if (country == 'Japan') {
			languages.push('Japanese');
		} else if (country == 'Australia') {
			languages.push('English');
		} else if (country == 'Chile') {
			languages.push('Spanish');
			if (Math.random() < .10) {
				languages.push('English');
			}
		} else if (country == 'Ecuador') {
			languages.push('Spanish');
		} else if (country == 'Colombia') {
			languages.push('Spanish');
			if (Math.random() < .042) {
				languages.push('English');
			}
		} else if (country == 'Peru' || country == 'LatAm') {
			languages.push('Spanish');
		} else if (country == 'Venezuela') {
			languages.push('Spanish');
		} else if (country == 'Puerto Rico') {
			languages.push('Spanish');
			languages.push('English');
		} else if (country == 'Costa Rica') {
			languages.push('Spanish');
		} else if (country == 'Panama') {
			languages.push('Spanish');
		} else if (country == 'Argentina') {
			languages.push('Spanish');
			if (Math.random() < .065) {
				languages.push('English');
			}
		} else if (country == 'Paraguay') {
			languages.push('Spanish');
		} else if (country == 'Uruguay') {
			languages.push('Spanish');
		} else if (country == 'Philippines' || country == 'SEA') {
			languages.push('Filipino');
			if (Math.random() < .65) {
				languages.push('English');
			}
		} else if (country == 'Vietnam') {
			languages.push('Vietnamese');
		} else if (country == 'Turkey' || country == 'TR') {
			languages.push('Turkish');
			if (Math.random() < .17) {
				languages.push('English');
			}
		} else {
			languages.push('English');
		}

        return languages;
    }


/**
 * Add a new row of ratings to a player object.
 *
 * There should be one ratings row for each year a player is not retired, and a new row should be added for each non-retired player at the start of a season.
 *
 * @memberOf core.player
 * @param {Object} p Player object.
 * @param {number} scoutingRank Between 1 and g.numTeams (default 30), the rank of scouting spending, probably over the past 3 years via core.finances.getRankLastThree.
 * @return {Object} Updated player object.
 */
function addRatingsRow(
    p: Player | PlayerWithoutPid,
    scoutingRank: number,
) {
    const newRatings = Object.assign({}, p.ratings[p.ratings.length - 1]);
    newRatings.season = g.season;
    newRatings.seasonSplit = g.seasonSplit;

	//console.log(newRatings.season+" "+newRatings.seasonSplit);


    newRatings.fuzz = (newRatings.fuzz + genFuzz(scoutingRank)) / 2;
    p.ratings.push(newRatings);
}

/**
 * Add a new row of stats to the playerStats database.
 *
 * A row contains stats for unique values of (pid, team, season, playoffs). So new rows need to be added when a player joins a new team, when a new season starts, or when a player's team makes the playoffs. The team ID in p.tid and player ID in p.pid will be used in the stats row, so if a player is changing teams, update p.tid before calling this.
 *
 * Additionally, `p.statsTids` is mutated to reflect the new row, but `p` is NOT saved to the database! So make sure you do that after calling this function. (Or before would be fine too probably, it'd still get marked dirty and flush from cache).
 *
 * @memberOf core.player
 * @param {Object} p Player object.
 * @param {=boolean} playoffs Is this stats row for the playoffs or not? Default false.
 */
async function addStatsRow(p: Player, playoffs?: boolean = false) {

	///console.log(p);
	//console.log(playoffs);

		const championStats = []

/*		= {
				gp: 0,
				won: 0,
				fg: 0,
				fga: 0,
				fgp: 0,
				tp: 0,
				min: 0,
		};*/

        const statsRow = {
			pid: p.pid,
			season: g.season,
			seasonSplit: g.seasonSplit,
			tid: p.tid,
			playoffs: playoffs,
			championStats: championStats,
			gp: 0,
			gs: 0,
			min: 0,
			fg: 0,
			fga: 0,
			fgp: 0,
			fgpAtRim: 0,
			fgAtRim: 0, fgaAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0, trb: 0, ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, per: 0, ewa: 0,
			yearsWithTeam: 1, oppJM: 0,oppTw: 0,oppInh: 0,	 champPicked: "",wardP:0,wardD:0,wardPT:0,wardDT:0,klsT:0,dthT:0,astT:0,gldT:0,mnnT:0,kda:0,klsP:0,dthP:0,astP:0,gldP:0,mnnP:0,wardDP:0,wardPP:0,rh:0,scTwr:0,scKills:0,
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
			ChmpnKills:0,
			championStats: [],
			riftKills:0,				// brought in later
			riftAssists:0,			// brought in later
			firstBlood:0,			// brought in later
		};


  /*  const statsRow = {
        pid: p.pid,
        season: g.season,
        tid: p.tid,
        playoffs,
        gp: 0,
        gs: 0,
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
        pm: 0,
        orb: 0,
        drb: 0,
        trb: 0,
        ast: 0,
        tov: 0,
        stl: 0,
        blk: 0,
        ba: 0,
        pf: 0,
        pts: 0,
        per: 0,
        ewa: 0,
        yearsWithTeam: 1,
    };*/

    p.statsTids.push(p.tid);
    p.statsTids = _.uniq(p.statsTids);
	//console.log(statsRow);
	//console.log(g.seasonSplit);
    // Calculate yearsWithTeam
    const playerStats = (await idb.cache.playerStats.indexGetAll('playerStatsAllByPid', p.pid))
        .filter((ps) => !ps.playoffs);
		//console.log(playerStats);
		//console.log(playerStats.length );

    if (playerStats.length > 0) {
        const i = playerStats.length - 1;
	//	console.log(i+" "+g.phase+" "+g.seasonSplit+" "+statsRow.yearsWithTeam+" "+playerStats[i].yearsWithTeam+" "+playerStats[i].season+" "+g.season+ " "+playerStats[i].tid+" "+p.tid);

        if (playerStats[i].season === g.season - 1 && playerStats[i].tid === p.tid) {
			//console.log(statsRow.yearsWithTeam);
		//	if (g.gameType >= 6) {
		//		statsRow.yearsWithTeam += 1;
		//	} else {
			//	if (statsRow.yearsWithTeam != playerStats[i].yearsWithTeam) {
			//		statsRow.yearsWithTeam = playerStats[i].yearsWithTeam
			//	}

				statsRow.yearsWithTeam = playerStats[i].yearsWithTeam + 1;
		//	}
		//	console.log(statsRow.yearsWithTeam);
        } else if (playerStats[i].tid === p.tid) {
				statsRow.yearsWithTeam = playerStats[i].yearsWithTeam;
		}
		//console.log(i+" "+g.phase+" "+g.seasonSplit+" "+statsRow.yearsWithTeam+" "+playerStats[i].yearsWithTeam+" "+playerStats[i].season+" "+g.season+ " "+playerStats[i].tid+" "+p.tid);

        if (playerStats[i].season === g.season - 1 ) {
//            statsRow.championStats = helpers.deepCopy(playerStats[i].championStats);
			//console.log(statsRow.championStats);
			//console.log(playerStats[i].championStats);
            statsRow.championStats = playerStats[i].championStats;
		//	console.log(statsRow.championStats);
        }

    }

    await idb.cache.playerStats.add(statsRow);
}


function generate(
    tid: number,
    age: number,
    profile: Profile,
    baseRating: number,
    pot: number,
    draftYear: number,
    newLeague: boolean,
    scoutingRank: number,
	// need to make sure these are loaded
	cDefault,
	topADC: array,
	topMID: array,
	topJGL: array,
	topTOP: array,
	topSUP: array,

): PlayerWithoutPid {
        var maxHgt, maxWeight, minHgt, minWeight, nationality, country, p,i;
		var maxRegions, countryTid, randomCountry;
		var rolls;

		var nameCountry;
		var nameInfo;
		var asianUS;

		asianUS = false;

        p = {}; // Will be saved to database
        p.tid = tid;
        p.statsTids = [];
        p.rosterOrder = 666;  // Will be set later

		p.languages = [];

		//p.languages.push();
        // Randomly choose nationality
		// know tid, cid, gametype
		// g.gameType == 2
		// tid
		//
		// LCS 0/1
		// LCK Korea 2
	   // LPL China  3
	   // LMS East Asia 4
	   // Worlds - all plus Turkey Russia Oceania Brazil and Latin America 5
	   //console.log(draftYear);
	   //console.log(newLeague);
	   //console.log(scoutingRank);
	   //console.log(cDefault);
	   //console.log(topADC);
	   //console.log(topMID);
	   //console.log(topJGL);
	   //console.log(topTOP);
	   //console.log(topSUP);

	   if (p.tid < 0) {

			rolls = g.ratioEU-1;
			let rollsKR = g.koreanRatio-1;

			let rollsNA = g.ratioNA-1;
			let rollsCN = g.ratioCN-1;
			let rollsTW = g.ratioTW-1;
			let rollsTR = g.ratioTR-1;
			let rollsOCE = g.ratioOCE-1;
			let rollsSEA = g.ratioSEA-1;
			let rollsJP = g.ratioJP-1;
			let rollsCIS = g.ratioCIS-1;
			let rollsBR = g.ratioBR -1;
			let rollsLatAm = g.ratioLatAm-1;
			let rollsVNM = 1;

			let tidOpions = [];


		   // new method
		   for (let i = 0; i < g.numTeams; i++) {
				tidOpions.push(i);
				while (rollsNA>=1 && g.teamCountryCache[i] == 'NA') {
					tidOpions.push(i);
					rollsNA -= 1;
				}
				while (rolls>=1 && g.teamCountryCache[i] == 'EU') {
					tidOpions.push(i);
					rolls -= 1;
				}
				while (rollsKR>=1 && g.teamCountryCache[i] == 'KR') {
					tidOpions.push(i);
					rollsKR -= 1;
				}
				while (rollsCN>=1 && g.teamCountryCache[i] == 'CN') {
					tidOpions.push(i);
					rollsCN -= 1;
				}
				while (rollsTW>=1 && g.teamCountryCache[i] == 'TW') {
					tidOpions.push(i);
					rollsTW -= 1;
				}
				while (rollsTR>=1 && g.teamCountryCache[i] == 'TR') {
					tidOpions.push(i);
					rollsTR -= 1;
				}
				while (rollsOCE>=1 && g.teamCountryCache[i] == 'OCE') {
					tidOpions.push(i);
					rollsOCE -= 1;
				}
				while (rollsSEA>=1 && g.teamCountryCache[i] == 'SEA') {
					tidOpions.push(i);
					rollsSEA -= 1;
				}
				while (rollsJP>=1 && g.teamCountryCache[i] == 'JP') {
					tidOpions.push(i);
					rollsJP -= 1;
				}
				while (rollsCIS>=1 && g.teamCountryCache[i] == 'CIS') {
					tidOpions.push(i);
					rollsCIS -= 1;
				}
				while (rollsLatAm>=1 && g.teamCountryCache[i] == 'LatAm') {
					tidOpions.push(i);
					rollsLatAm -= 1;
				}
				while (rollsVNM>=1 && g.teamCountryCache[i] == 'VNM') {
					tidOpions.push(i);
					rollsVNM -= 1;
				}
				while (rollsBR>=1 && g.teamCountryCache[i] == 'BR') {
					tidOpions.push(i);
					rollsBR -= 1;
				}

		   }
		 //  console.log(tidOpions.length);
		 //  console.log(tidOpions);

			countryTid = tidOpions[random.randInt(0,tidOpions.length-1)];
		//	console.log(g.ratioEU+" "+g.koreanRatio)


				/*ratioNA: 1.00,
				ratioCN: 1.00,
				ratioTW: 1.00,
				ratioTR: 1.00,
				ratioOCE: 1.00,
				ratioBR: 1.00,
				ratioSEA: 1.00,
				ratioJP: 1.00,
				ratioCIS: 1.00,
				ratioLatAm: 1.00,				*/

	/*		while (rollsCN>=1 && g.teamCountryCache[countryTid] != 'CN' ) {
				countryTid = random.randInt(0,g.numTeams-1);
				rollsCN -= 1;
				if (rollsCN<1 && rollsCN>0 && g.teamCountryCache[countryTid] != 'CN') {
					if (Math.random() < rollsCN) {
						countryTid = random.randInt(0,g.numTeams-1);
					}
					rollsCN -= 1;
				}
			}					*/

		/*	while (rollsNA>=1 && g.teamCountryCache[countryTid] != 'NA' ) {
				countryTid = random.randInt(0,g.numTeams-1);
				rollsNA -= 1;
				if (rollsNA<1 && rollsNA>0 && g.teamCountryCache[countryTid] != 'NA') {
					if (Math.random() < rollsNA) {
						countryTid = random.randInt(0,g.numTeams-1);
					}
					rollsNA -= 1;
				}
			}*/

		/*	while (rollsKR>=1 && g.teamCountryCache[countryTid] != 'KR' ) {
				countryTid = random.randInt(0,g.numTeams-1);
				rollsKR -= 1;
				if (rollsKR<1 && rollsKR>0 && g.teamCountryCache[countryTid] != 'KR') {
					if (Math.random() < rollsKR) {
						countryTid = random.randInt(0,g.numTeams-1);
					}
					rollsKR -= 1;
				}
			}

			while (rolls>=1 && g.teamCountryCache[countryTid] != 'EU' ) {
				countryTid = random.randInt(0,g.numTeams-1);
				rolls -= 1;
				if (rolls<1 && rolls>0 && g.teamCountryCache[countryTid] != 'EU') {
					if (Math.random() < rolls) {
						countryTid = random.randInt(0,g.numTeams-1);
					}
					rolls -= 1;
				}
			}*/

		// add functionality to reduce later?
		/*	if (g.ratioEU<1) {
				if (Math.random() > g.ratioEU && g.teamCountryCache[countryTid] == 'EU' ) {
					countryTid = random.randInt(0,g.numTeams-1);
				}
			}
			if (g.koreanRatio<1) {
				if (Math.random() > g.koreanRatio && g.teamCountryCache[countryTid] == 'KR' ) {
					countryTid = random.randInt(0,g.numTeams-1);
				}
			}	*/

		} else {
			countryTid = p.tid;
		}

	//	 console.log(countryTid+" "+g.teamCountryCache[countryTid]);
		if ((g.teamCountryCache[countryTid] == 'NA')) {
			if (Math.random() > .15) { // was .25
				nationality = 'NA';
			} else if (Math.random() > .30) {  // was .1
				nationality = 'KR';
			} else if (Math.random() > .45) {
				nationality = 'EU';
			} else if (Math.random() > .45) {
				nationality = 'TW';
			} else {
				nationality = 'CN';
			}
		} else if (g.teamCountryCache[countryTid] == 'EU') {

			nationality = 'EU';
			if (Math.random() > .93) { // was .8
				nationality = 'KR';
			} else if (Math.random() < .02) {
				nationality = 'SEA';

			} else {
				nationality = 'EU';
			}

		} else if (g.teamCountryCache[countryTid] == 'KR') {
			nationality = 'KR';

		} else if (g.teamCountryCache[countryTid] == 'CN') {
			nationality = 'CN';
			if (Math.random() > .80) {

				nationality = 'KR';
			} else if (Math.random() > .95) {
				nationality = 'TW';
			} else {
				nationality = 'CN';
			}
		} else if (g.teamCountryCache[countryTid] == 'TW') {
		//} else if ((g.gameType == 4) || ((g.gameType == 5) && (p.tid>=42) && (p.tid<=49))) {
			nationality = 'TW';
			if (Math.random() > .99) {
				nationality = 'SEA';
			} else if (Math.random() > .99) {
				nationality = 'SEA';
			} else if (Math.random() > .99) {
				nationality = 'KR';
			} else if (Math.random() > .95) {
				nationality = 'CN';
			} else {
				nationality = 'TW';
			}
		} else {
			nationality = 'KR';
			if (g.teamCountryCache[countryTid] == 'VNM') {
				nationality = 'VNM';
		   }
			if (g.teamCountryCache[countryTid] == 'SEA') {
				nationality = 'SEA';
		   }
			if (g.teamCountryCache[countryTid] == 'JP') {
				nationality = 'JP';
		   }

			if (g.teamCountryCache[countryTid] == 'LatAm') {
				nationality = 'LatAm';
		   }
			if (g.teamCountryCache[countryTid] == 'TR') {
				nationality = 'TR';
		   }
			if (g.teamCountryCache[countryTid] == 'OCE') {
				nationality = 'OCE';
		   }

			if (g.teamCountryCache[countryTid] == 'BR') {
				nationality = 'BR';
		   }

			if (g.teamCountryCache[countryTid] == 'CIS') {
				nationality = 'CIS';
		   }


		}// else {
			//	nationality = 'NA';
		//}
		//}
		country = 'US';

		//https://en.wikipedia.org/wiki/List_of_countries_by_English-speaking_population

		//http://www.pewresearch.org/fact-tank/2015/10/08/more-than-any-other-foreign-language-european-youths-learn-english/
		// younger people speak at higher rate than older
		if (nationality == 'NA') {

			if (Math.random() < .90) {
				country = 'United States';

				p.languages.push('English');

				nameCountry  = "USA"
				if (Math.random() < .60) {
					//p.name = name(country);
				} else {
//					nameCountry  = "Asian"
					asianUS = true;
					//p.name = nameAsian(country);
				}

			} else  {
				country = 'Canada';
				if (Math.random() < .8) {
					//p.name = nameCanadian();

					p.languages.push('English');
				} else {
					//p.name = nameFrenchCanadian();
					p.languages.push('French');
				}
			}

		} else if (nationality == 'EU') {
			//p.name = name();
			if (Math.random() < .10*g.germanRatio) {
				//p.name = nameGerman();
				country = 'Germany';
				p.languages.push('German');
				if (Math.random() < .85) {
					p.languages.push('English');
				}
			} else if (Math.random() < .02) {
				//p.name = nameRomanian();
				country = 'Romania';
				p.languages.push('Romanian');
				//Hungarian, English, Lithuanian, Bulgarian, Serbo-Croatian, Russian, Slovak, Romani, Ukrainian, and German
				if (Math.random() < .45) {
					p.languages.push('English');
				}
			} else if (Math.random() < .11) {
				//p.name = nameSpanish();
				country = 'Spain';
				p.languages.push('Spanish');
				if (Math.random() < .90) {
					p.languages.push('English');
				}
			} else if (Math.random() < .03) {
				//p.name = nameScottish();
				country = 'Scotland';
				p.languages.push('English');
			} else if (Math.random() < .06) {
				//p.name = nameGreek();
				country = 'Greece';
				p.languages.push('Greek');
				if (Math.random() < .75) {
					p.languages.push('English');
				}
			} else if (Math.random() < .02) {
				//p.name = nameArmenian();
				country = 'Armenia';
    //Russian.    English.    Other.    Kurdish.    Russian.    Assyrian.    Ukrainian.    Greek.
				p.languages.push('Armenian');
				if (Math.random() < .33) {
					p.languages.push('Russian');
				}
				if (Math.random() < .45) {
					p.languages.push('English');
				}
			} else if (Math.random() < .02) {
				//p.name = nameBulgarian();
				country = 'Bulgaria';
				p.languages.push('Bulgarian');
				if (Math.random() < .35) {
					p.languages.push('Russian');
				}
				if (Math.random() < .45) {
					p.languages.push('English');
				}
				//Russian (35% claimed workable knowledge of it), followed by English (23%), Italian and Spanish (12%), and French (9%).
			} else if (Math.random() < .14) {
				//p.name = nameDutch();
				country = 'Netherlands';
				p.languages.push('Dutch');
				//Netherlands: between 90%[12] and 93%[13] of the total population are able to converse in English, 71% in German, 29% in French and 5% in Spanish.
				if (Math.random() < .90) {
					p.languages.push('English');
				}
				if (Math.random() < .71) {
					p.languages.push('German');
				}
				if (Math.random() < .29) {
					p.languages.push('French');
				}
				if (Math.random() < .05) {
					p.languages.push('Spanish');
				}
			} else if (Math.random() < .10) {
				//p.name = nameEnglish();
				country = 'England';
				p.languages.push('English');
			} else if (Math.random() < .18) {
				//p.name = namePolish();
				country = 'Poland';
				p.languages.push('Polish');
				if (Math.random() < .95) {
					p.languages.push('English');
				}
			} else if (Math.random() < .20) {
				//p.name = nameBelgin();
				country = 'Belgium';
				if (Math.random() < .6) {
					p.languages.push('Dutch');
				} else {
					p.languages.push('French');
				}
				if (Math.random() < .8) {
					p.languages.push('English');
				}
			} else if (Math.random() < .25) {
				//p.name = nameDanish();
				country = 'Denmark';
				p.languages.push('Danish');
				// english 86%, German 47%, Swedish 13%
				if (Math.random() < .96) {
					p.languages.push('English');
				}
				if (Math.random() < .47) {
					p.languages.push('German');
				}
				if (Math.random() < .13) {
					p.languages.push('Swedish');
				}
			} else if  (Math.random() < .10) {
				//p.name = nameHungarian();
				country = 'Hungary';
				p.languages.push('Hungarian');
				if (Math.random() < .40) {
					p.languages.push('English');
				}
			} else if  (Math.random() < .30) {
				//p.name = nameNorwegian();
				country = 'Norway';
				p.languages.push('Norwegian');
				if (Math.random() < .95) {
					p.languages.push('English');
				}
			} else if (Math.random() < .4) {
				//p.name = nameSwedish();
				country = 'Sweden';
				p.languages.push('Swedish');
				if (Math.random() < .96) {
					p.languages.push('English');
				}
			} else if (Math.random() < .50) {
				//p.name = nameFrench();
				country = 'France';
				p.languages.push('French');
				if (Math.random() < .93) {
					p.languages.push('English');
				}
			} else if (Math.random() < .70) {
				//p.name = nameItalian();
				country = 'Italy';
				p.languages.push('Italian');
				if (Math.random() < .96) {
					p.languages.push('English');
				}
				if (Math.random() < .16) {
					p.languages.push('French');
				}
				if (Math.random() < .11) {
					p.languages.push('Spanish');
				}
				if (Math.random() < .05) {
					p.languages.push('German');
				}
			} else if (Math.random() < .90) {
				//p.name = nameSwiss();
				country = 'Switzerland';
				if (Math.random() < .86) {
					p.languages.push('German');
				}
				if (Math.random() < .85) {
					p.languages.push('French');
				}
				if (Math.random() < .36) {
					p.languages.push('Italian');
				}
				if (Math.random() < .80) {
					p.languages.push('English');
				}
//nameSwiss
			} else if (Math.random() < 1.1) {
				//p.name = nameIcelanders();
				country = 'Iceland';
				p.languages.push('Icelandic');
				if (Math.random() < .90) {
					p.languages.push('English');
				}
				if (Math.random() < .90) {
					p.languages.push('Danish');
				}
				if (Math.random() < .05) {
					p.languages.push('German');
				} else if (Math.random() < .05) {
					p.languages.push('French');
				} else if (Math.random() < .05) {
					p.languages.push('Spanish');
				}
			} else {

				//p.name = name();
				country = 'United States';
				p.languages.push('English');
			}

		} else if (nationality == 'KR') {
			//p.name = nameKorean();
			country = 'Korea';
			p.languages.push('Korean');
		} else if (nationality == 'CN' ) {
			//p.name = nameChinese();
			country = 'China';
			p.languages.push('Chinese');
			if (Math.random() < .08) {
				p.languages.push('English');
			}
		} else if (nationality == 'TW') {
			//p.name = nameChinese();
			if (Math.random() < .70) {
				country = 'Taiwan';
			} else if (Math.random() < .80) {
				country = 'Hong Kong';
			} else {
				country = 'Macao';
			}
			p.languages.push('Chinese');
		} else if (nationality == 'CIS') {
			//p.name = nameRussian();
			country = 'Russia';
			p.languages.push('Russian');
			if (Math.random() < .05) {
				p.languages.push('English');
			}
		} else if (nationality == 'BR') {
			//p.name = nameBrazilian();
			country = 'Brazil';
			p.languages.push('Portuguese');
			if (Math.random() < .05) {
				p.languages.push('English');
			}
		} else if (nationality == 'JP') {
			//p.name = nameJapanese();
			country = 'Japan';
			p.languages.push('Japanese');
		} else if (nationality == 'OCE') {
			//p.name = nameAustralian();
			country = 'Australia';
			p.languages.push('English');
		} else if (nationality == 'LatAm') {
			if (Math.random() < .15) {
				//p.name = nameChilean();
				country = 'Chile';
				p.languages.push('Spanish');
				if (Math.random() < .10) {
					p.languages.push('English');
				}
			} else if (Math.random() < .55) {
				//p.name = nameLatAmN();
				//country = 'LatAmN';
				//Ecuador-Colombia-Peru-Venezuela-Puerto Rico-Mexico-Costa Rica-Panama
				if (Math.random() < 1/7) {
					country = 'Ecuador';
					p.languages.push('Spanish');
				} else if (Math.random() < 1/6) {
					country = 'Colombia';
					p.languages.push('Spanish');
					if (Math.random() < .042) {
						p.languages.push('English');
					}
				} else if (Math.random() < 1/5) {
					country = 'Peru';
					p.languages.push('Spanish');
				} else if (Math.random() < 1/4) {
					country = 'Venezuela';
					p.languages.push('Spanish');
				} else if (Math.random() < 1/3) {
					country = 'Puerto Rico';
					p.languages.push('Spanish');
					p.languages.push('English');
				} else if (Math.random() < 1/2) {
					country = 'Costa Rica';
					p.languages.push('Spanish');
				} else  {
					country = 'Panama';
					p.languages.push('Spanish');
				}
			} else {
				//p.name = nameLatAmS();
			//	country = 'LatAmS';
//Chile-Argentina-Paraguay-Uruguay
				if (Math.random() < 1/3) {
					country = 'Argentina';
					p.languages.push('Spanish');
					if (Math.random() < .065) {
						p.languages.push('English');
					}
				} else if (Math.random() < 1/2) {
					country = 'Paraguay';
					p.languages.push('Spanish');
				} else {
					country = 'Uruguay';
					p.languages.push('Spanish');
				}
			}
		} else if (nationality == 'VNM') {
				country = 'Vietnam';
				//nameInfo = name(country);
				p.languages.push('Vietnamese');
		} else if (nationality == 'SEA') {


		//	if (Math.random() < .5) {
				//p.name = nameFilipino();
				country = 'Philippines';
				p.languages.push('Filipino');
				if (Math.random() < .64) {
					p.languages.push('English');
				}

		//	} else {
				//p.name = nameVietnamese();
			//	country = 'Vietnam';
				//nameInfo = name(country);
			//	p.languages.push('Vietnamese');

			//}

		} else if (nationality == 'TR') {
			//p.name = nameTurkish();
			country = 'Turkey';
			//nameInfo = name(country);
			p.languages.push('Turkish');
			if (Math.random() < .17) {
				p.languages.push('English');
			}
		} else {
		//	p.name = name();
			country = 'United States';
			nameInfo = name("USA",asianUS);
			p.languages.push('English');
		}

	/*	let nameInfo;
		if (country == 'United States') {
			if (Math.random() < .60) {
				nameInfo = name(country);
				//p.name = name(country);
			} else {
				nameInfo = name(country);
				//p.name = nameAsian(country);
			}
		} else {
				nameInfo = name(country);
				//p.name = name(country);
		}*/
		if (nameInfo == undefined) {
			nameInfo = name(country,asianUS);
		//	console.log(nameInfo);
		} else {
		//	console.log(nameInfo);
		}
		let maleFemale = "Male";

		let randomNumber = Math.random();

//		if (randomNumber < .001) {

		if (randomNumber < g.femaleOdds) {
			//console.log(randomNumber)
			maleFemale = "Female";
		}
////https://www.esportsearnings.com/players/female-players		female player names from esports
		if (maleFemale == "Female") {
			p.firstName = "Sasha";
			if (country == "Canada") {
			p.firstName = "Sasha";
			} else if (nationality == "NA") {
//				p.firstName = "Katherine";
				let optionsNames = ["Katherine","Ricki", "Marjorie", "Christian","Vanessa","Alice"];
				let randomInt = random.randInt(0, optionsNames.length-1);
				p.firstName = optionsNames[randomInt];
			} else if (nationality == "EU") {
				if (country == "Sweden") {
					p.firstName = "Julia";	//Julia Zainab
				} else if (country == "Spain") {
					p.firstName = "Irene";	//Julia Zainab
				} else if (country == "Denmark") {
					p.firstName = "Michaela";	//Julia Zainab
				} else if (country == "France") {
					p.firstName = "Melie";	//Julia Zainab
				} else {
					let optionsNames = ["Sarah","Irene","Julia","Michaela","Melie","Sandrine"];
					let randomInt = random.randInt(0, optionsNames.length-1);
					p.firstName = optionsNames[randomInt];
				}
				//p.firstName = "Sarah";
			} else if (nationality == "KR") {
				let optionsNames = ["HyeonAn","JiSoo", "HyelYeong", "SuMin","JongUn","YeJi"];
				let randomInt = random.randInt(0, optionsNames.length-1);
				p.firstName = optionsNames[randomInt];
			} else if (nationality == "CN" || nationality == "TW") {
				let optionsNames = ["XiaoMeng","Xinyu", "YuYan", "Haiyun","DongMei","Ting","Ruo Tian","Qianqian","Ma","Xiao Qin"];
				let randomInt = random.randInt(0, optionsNames.length-1);
				p.firstName = optionsNames[randomInt];
		//	} else if (nationality == "TW") {
	//			p.firstName = "Ting";
			} else if (nationality == "SEA") {
				//if (country == "Sweden") {
//					p.firstName = "Julia";	//Julia Zainab
	//			} else if (country == "Spain") {
		//			p.firstName = "Irene";	//Julia Zainab
			//	} else if (country == "Denmark") {
				//	p.firstName = "Michaela";	//Julia Zainab
				//} else {
					p.firstName = "Sarindhorn";
				//}
			} else if (nationality == "LatAm") {
				p.firstName = "Mirlet";
			} else if (nationality == "BR") {
				p.firstName = "Paula";
			} else if (nationality == "TR") {
				p.firstName = "Elif";		// just a popular turkish name
			} else if (nationality == "CIS") {
				p.firstName = "Ksenia";
			} else if (nationality == "JP") {
				p.firstName = "Yuko";		// from article
			} else if (nationality == "OCE") {
				p.firstName = "Eileen";
			}

		//	console.log(randomNumber+" "+g.femaleOdds+" "+nationality+" "+country+" "+p.firstName);

		} else {
			p.firstName = nameInfo.firstName;
		}
		p.lastName = nameInfo.lastName;


		p.userID = userID();
	//	console.log(p.userID);

		//p.languages.push('Test2');
		//p.languages.push('Test3');
        p.born = {
            year: g.season - age,
            country: country,
            loc: nationality,
            maleFemale: maleFemale,
        };


        p.ratings = [];

		// for dota switch to EU and China
		// EU , CN
		//console.log(baseRating);
		if (g.champType == 0) {
			if (nationality == 'KR') {
				baseRating += 6;
			} else {
				baseRating -= 1;
			}
		} else {
			if (nationality == 'EU') {
				baseRating += 6;
			} else if (nationality == 'CN') {
				baseRating += 6;
			} else {
				baseRating -= 1;
			}
		}
		//console.log(baseRating);
		//console.log(newLeague);
        if (newLeague) {
            // Create player for new league
            p.ratings.push(genRatings(profile, baseRating, pot, g.startingSeason, g.startingSplit, scoutingRank, tid));
        } else {
            // Create player to be drafted
            p.ratings.push(genRatings(profile, baseRating, pot, draftYear, g.seasonSplit, scoutingRank));
        }

	//console.log(p.ratings);
	// Likewise, If this isn't outside the loop, then 19 year old players don't get skills
//	console.log(p.ratings[0]);
		if (p.ratings[0].skills.length == 0) {
			p.ratings[0].skills = skills(p.ratings[0]);
	//console.log(p.ratings[0].skills);

		}
		/*console.log(p.ratings);
		console.log(p.ratings[0]);
		console.log(p.ratings[0].ovr);
		console.log(p.ratings[1]);
		console.log(p.ratings[2]);
		console.log(pot);*/

		p.champions = [];

		// this needs to call from champions list, really should be global
//        for (i = 0; i <  champions.champion.length; i++) {
//	console.log(g.numChampions);
		//if (g.gameType < 7) {
		//console.log( p.ratings[0].ovr);
		//	console.log(cDefault);
///			console.log(cDefault.length);
	//		console.log( g.numChampions);

			for (i = 0; i <  g.numChampions; i++) {
				p.champions[i] = {};
	//			p.champions[i].skill =  p.ratings[0].ovr+(Math.round(Math.random()*100,0)-10);
	//			p.champions[i].skill =  p.ratings[0].ovr+(Math.random()*100*20-10);
				p.champions[i].skill =  Math.round( p.ratings[0].ovr+(Math.random()*40-20),0);

				if (p.champions[i].skill< 0) {
				   p.champions[i].skill = 0;
				} else if (p.champions[i].skill > 100 ) {
				   p.champions[i].skill = 100;
				}
				//
				p.champions[i].name =   cDefault[i].name;
			}
	//	}
	//	console.log(p);
		p.championsRnk = {};
    //    for (i = 0; i <  g.numChampions; i++) {
	//		p.championsRnk[i] = {};
	//		p.championsRnk[i].skill =  0;
	//		p.championsRnk[i].name =   "";
	//	}
		p.championAverage = -1;

		// test using player synergy, tracks how many games player together
		// went with YWT for main synergy, can use this to be more precise at some point.
		p.teamSyn = {};
        for (i = 0; i <  8; i++) {
			p.teamSyn[i] = {};
			p.teamSyn[i].name =  "";
			p.teamSyn[i].games =   0;
		}

        if (tid === PLAYER.UNDRAFTED_2) {
            p.ratings[0].fuzz *= 2;
        } else if (tid === PLAYER.UNDRAFTED_3) {
            p.ratings[0].fuzz *= 4;
        }

        minHgt = 63;  // 5'3"
        maxHgt = 73;  // 6'1"
        minWeight = 110;
        maxWeight = 170;


		p.ratings[0].pos = pos(p.ratings[0]);// Position (TOP,MID,JGL,ADC,SUP)
        p.pos = p.ratings[0].pos;
//console.log(p.ratings);
      //  p.pos2 = pos2(p.ratings[0]);  // Position (PG, SG, SF, PF, C, G, GF, FC)

		var skillMMR;
		skillMMR = 0;

		if (p.champions == undefined)	{
			console.log(p);
		}

		if (p.ratings[0].pos== "ADC") {
			for (i = 0; i <  topADC.length; i++) {
				skillMMR += p.champions[topADC[i]].skill
			}
		}
		if (p.ratings[0].pos== "TOP") {
			for (i = 0; i <  topTOP.length; i++) {
				skillMMR += p.champions[topTOP[i]].skill
			}
		}
		if (p.ratings[0].pos== "MID") {
			for (i = 0; i <  topMID.length; i++) {
				skillMMR += p.champions[topMID[i]].skill
			}
		}
		if (p.ratings[0].pos== "JGL") {

			for (i = 0; i <  topJGL.length; i++) {
			//console.log(i);
			//console.log(topJGL[i]);
				skillMMR += p.champions[topJGL[i]].skill
			//console.log(skillMMR);
			}
		}
		if (p.ratings[0].pos== "SUP") {
			for (i = 0; i <  topSUP.length; i++) {
				skillMMR += p.champions[topSUP[i]].skill
			}
		}
	//	console.log(skillMMR);
		p.ratings[0].MMR = MMRcalc(p.ratings[0].ovr,skillMMR);
		//p.ratings[0].MMR = Math.round(p.ratings[0].ovr*9 +2200+skillMMR/5,0); // up to 500 + 2200 + up to 500
//console.log(p.ratings);
		//console.log(p.ratings[0].MMR);
		var fuzzedMMR;
		fuzzedMMR = p.ratings[0].MMR+random.randInt(-50, 50);
		if ( fuzzedMMR < 2200) {
			p.ratings[0].rank = "Platinum 1";
		} else if ( fuzzedMMR< 2270) {
			p.ratings[0].rank = "Diamond V";
		} else if (fuzzedMMR < 2340) {
			p.ratings[0].rank = "Diamond IV";
		} else if (fuzzedMMR < 2410) {
			p.ratings[0].rank = "Diamond III";
		} else if (fuzzedMMR < 2480) {
			p.ratings[0].rank = "Diamond II";
		} else if (fuzzedMMR < 2550) {
			p.ratings[0].rank = "Diamond I";
		} else if (fuzzedMMR < 2750) {
			p.ratings[0].rank = "Master";
		} else  {
			p.ratings[0].rank = "Challenger";
		}

		p.ratings[0].languages = p.languages;
		p.ratings[0].region = p.born.loc;



        p.hgt = Math.round(random.randInt(-2, 2) + p.ratings[0].hgt * (maxHgt - minHgt) / 100 + minHgt);  // Height in inches (from minHgt to maxHgt)
        p.weight = Math.round(random.randInt(-20, 20) + (p.ratings[0].hgt + 0.5 * p.ratings[0].stre) * (maxWeight - minWeight) / 150 + minWeight);  // Weight in pounds (from minWeight to maxWeight)


		//console.log(p.name.split(" ").length);
		 if (p.hasOwnProperty("name") && !(p.hasOwnProperty("firstName")) && !(p.hasOwnProperty("lastName"))) {
				if (p.name.split(" ").length == 2) {
					p.name = p.name.split(" ")[0] + " '"+p.userID +"' " + p.name.split(" ")[1];
				} else if (p.name.split(" ").length == 3) {
					p.name = p.name.split(" ")[0] + " '"+p.userID +"' " + p.name.split(" ")[1]+" "+p.name.split(" ")[2];
				} else if (p.name.split(" ").length == 4) {
					p.name = p.name.split(" ")[0] + " '"+p.userID +"' " + p.name.split(" ")[1]+" "+p.name.split(" ")[2]+" "+p.name.split(" ")[3];
				} else {
					p.name = p.name.split(" ")[0] + " '"+p.userID +"' " + p.name.split(" ")[1]+" "+p.name.split(" ")[2]+" "+p.name.split(" ")[3]+" "+p.name.split(" ")[4];
				}
		 }

        p.college = "";
        p.imgURL = ""; // Custom rosters can define player image URLs to be used rather than vector faces

        p.awards = [];

        p.freeAgentMood = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        p.yearsFreeAgent = 0;
        p.retiredYear = null;

        p.draft = {
            round: 0,
            pick: 0,
            tid: -1,
            originalTid: -1,
            year: draftYear,
            teamName: null,
            teamRegion: null,
            pot: pot,
            ovr: p.ratings[0].ovr,
            skills: p.ratings[0].skills
        };
	//	console.log(p);
		if (asianUS) {
			p.face = faces.generate("KR");
		} else {
			p.face = faces.generate(p.born.loc);
		}
		//console.log(p.face);
		if (p.born.maleFemale == "Female") {
		//	console.log(p.face);
		//	console.log(p.face.partials.haircut);
		//	console.log(p.face.partials.mouth);
			p.face.partials.haircut = "/img/svg_face_partials/haircuts/1.svg"
			p.face.partials.faceform = "/img/svg_face_partials/faceforms/8.svg"
			p.face.partials.mouth = "/img/svg_face_partials/mouths/1.svg"
		////	console.log(p.face.partials.haircut);
		//	console.log(p.face.partials.mouth);
		//	console.log(p.face);
		}
		//console.log(p.face);
        p.injury = {type: "Healthy", gamesRemaining: 0};

        p.ptModifier = 1;
        p.pick = 0;
        p.ban = 0;

        p.hof = false;
        p.watch = false;
        p.gamesUntilTradable = 0;

        // These should be set by player.updateValues after player is completely done (automatic in player.develop)
        p.value = 0;
        p.valueNoPot = 0;
        p.valueMMR = 0;
        p.valueFuzz = 0;
        p.valueNoPotFuzz = 0;
        p.valueWithContract = 0;

        // Must be after value*s are set, because genContract depends on them
        p.salaries = [];
        setContract(p, genContract(p), false);
//console.log(p.ratings);
//console.log(p);

        return p;
    }


/**
 * Pick injury type and duration.
 *
 * This depends on core.data.injuries, health expenses, and randomness.
 *
 * @param {number} healthRank Between 1 and g.numTeams (default 30), 1 if the player's team has the highest health spending this season and g.numTeams if the player's team has the lowest.
 * @return {Object} Injury object (type and gamesRemaining)
 */
function injury(healthRank: number): PlayerInjury {
    const rand = random.uniform(0, 10882);
    const i = injuries.cumSum.findIndex(cs => cs >= rand);

    return {
        type: injuries.types[i],
        gamesRemaining: Math.round((0.7 * (healthRank - 1) / (g.numTeams - 1) + 0.65) * random.uniform(0.25, 1.75) * injuries.gamesRemainings[i]),
    };
}

/**
 * How many seasons are left on this contract? The answer can be a fraction if the season is partially over
 *
 * @memberOf core.player
 * @param {Object} exp Contract expiration year.
 * @return {number} numGamesRemaining Number of games remaining in the current season (0 to g.numGames).
 */

function contractSeasonsRemaining(exp: number, numGamesRemaining: number): number {

	var numGames;
	if (g.numGames == 0) {
		numGames = 22;
	} else {
		numGames = g.numGames;
	}

    let frac = numGamesRemaining / numGames;
    if (frac > 1) { frac = 1; } // This only happens if the user changed g.numGames mid season
    return (exp - g.season) + frac;
}

/**
 * Is a player worthy of the Hall of Fame?
 *
 * This calculation is based on http://espn.go.com/nba/story/_/id/8736873/nba-experts-rebuild-springfield-hall-fame-espn-magazine except it uses PER-based estimates of wins added http://insider.espn.go.com/nba/hollinger/statistics (since PER is already calculated for each season) and it includes each playoff run as a separate season.
 *
 * @memberOf core.player
 * @param {Object} p Player object.
 * @return {boolean} Hall of Fame worthy?
 */
 function madeHof(p: Player, playerStats: PlayerStats[]): boolean {
        var df, ewa, ewas, fudgeSeasons, i, mins, pers, prls, pos, va;
	//	var kills,assists,deaths,gp,kda;
		var usedSeasons;

   // const mins = playerStats.map(ps => ps.min);
   // const pers = playerStats.map(ps => ps.per);
    const gp = playerStats.map(ps => ps.gp);
    const kills = playerStats.map(ps => ps.fg);
    const assists = playerStats.map(ps => ps.fgp);
    const deaths = playerStats.map(ps => ps.fga);
    const kda = playerStats.map(ps => ps.kda);

  /*  function madeHof(p, playerStats) {
        //mins = _.pluck(playerStats, "min");
        gp = _.pluck(playerStats, "gp");
//        pers = _.pluck(playerStats, "per");
        kills = _.pluck(playerStats, "fg");
        assists = _.pluck(playerStats, "fgp");
        deaths = _.pluck(playerStats, "fga");
        kda = _.pluck(playerStats, "kda"); */

		pos = p.ratings[p.ratings.length - 1].pos;
        // Position Replacement Levels http://insider.espn.go.com/nba/hollinger/statistics

		  if (g.gameType == 1 ||  g.gameType >= 5 ) {
//		if (g.gameType == 1  ) {
			ewa = p.awards.length;
			fudgeSeasons = g.startingSeason - p.draft.year ;
			usedSeasons = g.season - g.startingSeason+1;

      let didPlay = false;
			for (i = 0; i < gp.length; i++) {
        if (gp[i] > 0) {
          didPlay = true;
        }
			}

			if (g.gameType == 1 ) {
				if (fudgeSeasons > 1) {
					ewa += p.awards.length * (fudgeSeasons / (usedSeasons) );
				}
				if (ewa  > 7 && didPlay) {
					return true;
				}
			} else {
				if (fudgeSeasons > 1) {
					//ewa += p.awards.length * (fudgeSeasons / (usedSeasons*3) );
					ewa += p.awards.length * (fudgeSeasons / (usedSeasons) );
				}
				if (ewa  >= 5 && didPlay) {
					return true;
				}
			}
		} else {
			if (g.gameType == 5) {
				prls = {
				   TOP: 2.5,
					JGL: 2.3,
					MID: 2.6,
					ADC: 2.6,
					SUP: 2.0
				};
			} else {
				prls = {
				   TOP: 2.0,
					JGL: 2.0,
					MID: 2.0,
					ADC: 2.0,
					SUP: 2.0
				};
			}
			// Estimated wins added for each season http://insider.espn.go.com/nba/hollinger/statistics
			ewas = [];
      let didPlay = false;
			for (i = 0; i < gp.length; i++) {
        if (gp[i] > 0) {
          didPlay = true;
        }
				if  (deaths[i] > 0) {
					va = gp[i] * ((kills[i] +assists[i])/deaths[i] - prls[pos]) / 16;
				} else {
					va = 0;
				}
				ewas.push(va); // 0.8 is a fudge factor to approximate the difference between (in-game) EWA and (real) win shares
			}

			// Calculate career EWA and "dominance factor" DF (top 5 years EWA - 50)

//			ewas.sort((a, b) => b - a); // Descending order

			//ewas.sort(function (a, b) { return b - a; }); // Descending order
			ewa = 0;
			df = -4;
			for (i = 0; i < ewas.length; i++) {
				ewa += ewas[i];
				if (i < 2) {
					df += ewas[i];
				}
			}
		//			console.log(ewa);
		//			console.log(df);
			// Fudge factor for players generated when the league started
			fudgeSeasons = g.startingSeason - p.draft.year ;
			if (fudgeSeasons > 1) {
				ewa += ewas[0] * (fudgeSeasons-1);
			}

			// Final formula
		//	console.log(ewa+" "+df+" "+(ewa+df));

			var cutOffByGameType;

			cutOffByGameType = 15;
			if (g.gameType == 5) {
				cutOffByGameType = 20;
			} else {
				cutOffByGameType = 15;
			}

			if ( (ewa + df > cutOffByGameType) && didPlay) {
				return true;
			}
		}
        return false;
    }


type ValueOptions = {
    fuzz?: boolean,
    noPot?: boolean,
    withContract?: boolean,
};

/**
 * Returns a numeric value for a given player, representing is general worth to a typical team
 * (i.e. ignoring how well he fits in with his teammates and the team's strategy/finances). It
 * is similar in scale to the overall and potential ratings of players (0-100), but it is based
 * on stats in addition to ratings. The main components are:
 *
 * 1. Recent stats: Avg of last 2 seasons' PER if min > 2000. Otherwise, scale by min / 2000 and
 *     use ratings to estimate the rest.
 * 2. Potential for improvement (or risk for decline): Based on age and potential rating.
 *
 * @memberOf core.player
 * @param {Object} p Player object.
 * @param {Array.<Object>} Array of playerStats objects, regular season only, starting with oldest. Only the first 1 or 2 will be used.
 * @param {Object=} options Object containing several optional options:
 *     noPot: When true, don't include potential in the value calcuation (useful for roster
 *         ordering and game simulation). Default false.
 *     fuzz: When true, used fuzzed ratings (useful for roster ordering, draft prospect
 *         ordering). Default false.
 * @return {number} Value of the player, usually between 50 and 100 like overall and potential
 *     ratings.
 */
 function value(p: any, ps: PlayerStats[], options: ValueOptions = {}): number {
     //function value(p, ps, options) {
        var age, current, potential, pr, ps1, ps2, s;

      //  options = options !== undefined ? options : {};
        options.noPot = options.noPot !== undefined ? options.noPot : false;
        options.MMR = options.MMR !== undefined ? options.MMR : false;
        options.fuzz = options.fuzz !== undefined ? options.fuzz : false;
        options.withContract = options.withContract !== undefined ? options.withContract : false;

        // Current ratings
        pr = {}; // Start blank, add what we need (efficiency, wow!)
        s = p.ratings.length - 1; // Latest season

        // Fuzz?
        if (options.fuzz) {
            pr.ovr = Math.round(helpers.bound(p.ratings[s].ovr + p.ratings[s].fuzz, 0, 100));
            pr.pot = Math.round(helpers.bound(p.ratings[s].pot + p.ratings[s].fuzz, 0, 100));
        } else if (options.MMR) {
            pr.ovr = p.ratings[s].MMR;
            pr.pot = p.ratings[s].MMR;
        } else {
            pr.ovr = p.ratings[s].ovr;
            pr.pot = p.ratings[s].pot;
        }

        // 1. Account for stats (and current ratings if not enough stats)
        current = pr.ovr; // No stats at all? Just look at ratings more, then.
       /* if (ps.length > 0) {
            if (ps.length === 1) {
                // Only one year of stats
                current = 3.75 * ps[0].per;
                if (ps[0].min < 2000) {
                    current = current * ps[0].min / 2000 + pr.ovr * (1 - ps[0].min / 2000);
                }
            } else {
                // Two most recent seasons
                ps1 = ps[0];
                ps2 = ps[1];
                if (ps1.min + ps2.min > 0) {
                    current = 3.75 * (ps1.per * ps1.min + ps2.per * ps2.min) / (ps1.min + ps2.min);
                }
                if (ps1.min + ps2.min < 2000) {
                    current = current * (ps1.min + ps2.min) / 2000 + pr.ovr * (1 - (ps1.min + ps2.min) / 2000);
                }
            }
            current = 0.1 * pr.ovr + 0.9 * current; // Include some part of the ratings
        }*/

        // Short circuit if we don't care about potential
        if ((options.noPot) || (options.MMR)) {
            return current;
        }

        // 2. Potential
        potential = pr.pot;

        // If performance is already exceeding predicted potential, just use that
        if (current >= potential && age < 29) {
            return current;
        }

        // Otherwise, combine based on age
        if (p.draft.year > g.season) {
            // Draft prospect
            age = p.draft.year - p.born.year;
        } else {
            age = g.season - p.born.year;
        }
        if (age <= 17) {
            return 0.55 * potential + 0.45 * current;  // was .4 .6
        }
        if (age === 18) {
            return 0.3 * potential + 0.7 * current;  // was .4 .6
        }
        if (age === 19) {
            return 0.15 * potential + 0.85 * current;
        }
        if (age === 20) {
            return 0.1 * potential + 0.9 * current;
        }
        if (age === 21) {
            return 0.05 * potential + 0.95 * current;
        }
        if (age === 22) {
            return 0.99 * current;
        }
        if (age === 23) {
            return 0.98 * current; // was .95
        }
        if (age === 24) {
            return 0.97 * current;
        }
        if (age === 25) {
            return 0.96 * current; // was .85
        }
        if (age === 26) {
            return 0.95 * current; // was .8
        }
        if (age >= 27) {
            return 0.94 * current; // was .7
        }
    }


async function updateValues(p: Player | PlayerWithoutPid, psOverride?: PlayerStats[]) {
    let playerStats;

	//console.log(psOverride);
	//console.log(p);
	//console.log(p.pid);
	// how to handle a mix of new and non new players
    if (psOverride) {
        // Only when creating new league from file, since no cache yet then
        playerStats = psOverride;
    } else if (typeof p.pid === 'number') {
        playerStats = (await idb.cache.playerStats.indexGetAll('playerStatsAllByPid', p.pid))
            .filter((ps) => !ps.playoffs);
    } else {
        // New player objects don't have pids let alone stats, so just skip
        playerStats = [];
    }

    p.value = value(p, playerStats);
    p.valueNoPot = value(p, playerStats, {noPot: true});
	p.valueMMR = value(p, playerStats, {MMR: true});
    p.valueFuzz = value(p, playerStats, {fuzz: true});
    p.valueNoPotFuzz = value(p, playerStats, {noPot: true, fuzz: true});
    p.valueWithContract = value(p, playerStats, {withContract: true});
}

/**
 * Have a player retire, including all event and HOF bookkeeping.
 *
 * This just updates a player object. You need to write it to the database after.
 *
 * @memberOf core.player
 * @param {IDBTransaction} ot An IndexedDB transaction on events.
 * @param {Object} p Player object.
 * @return {Object} p Updated (retired) player object.
 */
function retire(p: Player, playerStats: PlayerStats[], conditions: Conditions, retiredNotification?: boolean = true) {
    if (retiredNotification) {
        logEvent({
            type: "retired",
            text: `<a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> retired.`,
            //showNotification: p.tid === g.userTid,
			showNotification: (g.userTids.includes(p.tid) || (p.watch && typeof p.watch !== "function")),
            pids: [p.pid],
            tids: [p.tid],
        }, conditions);
    }

    p.tid = PLAYER.RETIRED;
    p.retiredYear = g.season;
//	console.log(p);
	delete p.champions;
	//if (p.hasOwnProperty("championsRnk")) {
//		delete p.championsRnk;
//	}
	p.champions = [];
//	p.championsRank = [];
//	console.log(p);

    // Add to Hall of Fame?
    if (madeHof(p, playerStats)) {
        p.hof = true;
        p.awards.push({season: g.season, type: "Inducted into the Hall of Fame"});
        logEvent({
            type: "hallOfFame",
            text: `<a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.lastName}</a> was inducted into the <a href="${helpers.leagueUrl(["hall_of_fame"])}">Hall of Fame</a>.`,
            //showNotification: p.statsTids.includes(g.userTid),
			showNotification: p.statsTids.indexOf(g.userTid) >= 0 || (p.watch && typeof p.watch !== "function"),
            pids: [p.pid],
            tids: p.statsTids,
        }, conditions);
    }
}

// See views.negotiation for moods as well
function moodColorText(p: Player) {
    if (p.freeAgentMood[g.userTid] < 0.5) {
        return {
            color: "#5cb85c",
            text: 'Eager to reach an agreement.',
        };
    }

    if (p.freeAgentMood[g.userTid] < 1.0) {
        return {
            color: "#ccc",
            text: 'Willing to sign for the right price.',
        };
    }

    if (p.freeAgentMood[g.userTid] < 1.50) {
        return {
            color: "#f0ad4e",
            text: 'Annoyed at you.',
        };
    }

    return {
        color: "#d9534f",
        text: 'Insulted by your presence.',
    };
}

/**
 * Take a partial player object, such as from an uploaded JSON file, and add everything it needs to be a real player object.
 *
 * This doesn't add the things from player.updateValues!
 *
 * @memberOf core.player
 * @param {Object} p Partial player object.
 * @return {Object} p Full player object.
 */
 function augmentPartialPlayer(p: any, scoutingRank: number,cDefault,topADC,topMID,topJGL,topTOP,topSUP,mobaGMFile): PlayerWithStats {
 //   function augmentPartialPlayer(p, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP) {
        var age, region, i, pg, simpleDefaults;


	//	console.log(p);

        if (!p.hasOwnProperty("born")) {
            age = random.randInt(18, 25);
        } else {
            age = g.startingSeason - p.born.year;
        }



	//	console.log(age);
        // This is used to get at default values for various attributes
	//	console.log(p.tid,g.startingSeason,age,scoutingRank);

	//	console.log(p.tid,g.startingSeason,age,scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
	//	console.log(scoutingRank);
	//	console.log(cDefault);
	//	console.log(topADC);
	//	console.log(topMID);
	//	console.log(topJGL);
	//	console.log(topTOP);
	//	console.log(topSUP);
        pg = generate(p.tid, age, "", 0, 0, g.startingSeason - age, true, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
	//	console.log(pg);
	//	console.log(p);
		if (Math.random() < .05) {
		//	console.log("new player");
		//	console.log(pg);
		//	console.log(p);
		}

        // Optional things
        simpleDefaults = ["awards", "born", "college", "contract", "draft", "face", "freeAgentMood", "gamesUntilTradable", "hgt", "hof", "imgURL", "injury", "ptModifier", "pick", "ban", "retiredYear", "rosterOrder", "watch", "weight", "yearsFreeAgent"];
        for (i = 0; i < simpleDefaults.length; i++) {
            if (!p.hasOwnProperty(simpleDefaults[i])) {
                p[simpleDefaults[i]] = pg[simpleDefaults[i]];
            }
        }
        if (!p.hasOwnProperty("salaries")) {
            p.salaries = [];
            if (p.contract.exp < g.startingSeason) {
                p.contract.exp = g.startingSeason;
            }
            if (p.tid >= 0) {
                setContract(p, p.contract, true);
            }
        }

    if (p.retiredYear === null) {
        p.retiredYear = Infinity;
    }

        if (!p.hasOwnProperty("stats")) {
            p.stats = [];
        }
        if (!p.hasOwnProperty("statsTids")) {
            p.statsTids = [];
            if (p.tid >= 0 && g.phase <= PHASE.PLAYOFFS) {
                p.statsTids.push(p.tid);
            }
        }
        if (!p.ratings[0].hasOwnProperty("fuzz")) {
            p.ratings[0].fuzz = pg.ratings[0].fuzz;
        }
        if (!p.ratings[0].hasOwnProperty("skills")) {
            p.ratings[0].skills = skills(p.ratings[0]);
        }
        if (!p.ratings[0].hasOwnProperty("ovr")) {
            p.ratings[0].ovr = ovr(p.ratings[0]);
        }
        if (p.ratings[0].pot < p.ratings[0].ovr) {
            p.ratings[0].pot = p.ratings[0].ovr;
        }

         if (!p.ratings[0].hasOwnProperty("seasonSplit")) {
            p.ratings[0].seasonSplit =  g.seasonSplit;
        }


		//console.log(p);
	//	console.log(pg);
	//	console.log(p.ratings[0].hasOwnProperty("pos"));
       if (!p.ratings[0].hasOwnProperty("pos")) {
		 //  console.log("pos");
		   if (!p.hasOwnProperty("pos")) {
				p.ratings[0].pos =  pg.ratings[0].pos;
		   } else {
				p.ratings[0].pos =  p.pos;
		   }
		//   console.log(pg.ratings[0].pos);
            //p.ratings[0].seasonSplit =  g.seasonSplit;
        }
       if (!p.ratings[0].hasOwnProperty("languages")) {
		 //  console.log("languages");
		 //  console.log(pg.ratings[0].languages);
            p.ratings[0].languages =  pg.ratings[0].languages;
            //p.ratings[0].seasonSplit =  g.seasonSplit;
        }
       if (!p.ratings[0].hasOwnProperty("region")) {
		 //  console.log("region");
		 //  console.log(pg.ratings[0].region);
            p.ratings[0].region =  pg.ratings[0].region;
            //p.ratings[0].seasonSplit =  g.seasonSplit;
        }

//console.log(p.stats);
    //   if (!p.stats[0].hasOwnProperty("championStats")) {
    //        p.stats[0].championStats = [];
    //    }
		 //p.stats[p.stats.length-1].championStats

    if (p.hasOwnProperty("name") && !(p.hasOwnProperty("firstName")) && !(p.hasOwnProperty("lastName"))) {
        // parse and split names from roster file
        p.firstName = p.name.split(" ")[0];
        p.lastName = p.name.split(" ").slice(1, p.name.split(" ").length).join(" ");

        if (p.hasOwnProperty("contract")) {
          p.contract.amount *= 1000;
        }
    }


        if (!p.born.hasOwnProperty("country")) {
            p.born.country = pg.born.country;

        }
        if (p.born.hasOwnProperty("country")) {
			if (p.born.country == 'Test') {
				p.born.country = 'United States';
			}

        }

        if (p.born.hasOwnProperty("loc")) {
      //      p.languages = languages(p.born.country);
            if (p.born.loc == 'US') {
				p.born.loc = 'NA';
			}
        }

        if (!p.hasOwnProperty("languages")) {
            p.languages = languages(p.born.country);
//            p.languages = pg.languages;
        }

        // Fix improperly-set season in ratings
        if (p.ratings.length === 1 && p.ratings[0].season < g.startingSeason && p.tid !== PLAYER.RETIRED) {
            p.ratings[0].season = g.startingSeason;
        }

        // Handle old format position
        // Don't delete p.pos because it is used as a marker that this is from a league file and we shouldn't automatically change pos over time
        // Don't update ratings of pos because it is used as a marker that this is from a league file and we shouldn't automatically change pos over time
        if (p.hasOwnProperty("pos")) {
            for (i = p.ratings.length-1; i < p.ratings.length; i++) {
                if (!p.ratings[i].hasOwnProperty("pos")) {
              //      p.ratings[i].pos = p.pos;
                }
            }
           // delete p.pos;
        }


        // Fix always-missing info
        if (p.tid === PLAYER.UNDRAFTED_2) {
            p.ratings[0].season = g.startingSeason + 1;
        } else if (p.tid === PLAYER.UNDRAFTED_3) {
            p.ratings[0].season = g.startingSeason + 2;
        } else {
            if (!p.ratings[0].hasOwnProperty("season")) {
                p.ratings[0].season = g.startingSeason;
            }
        }

		// put champ update here
	//	if (Math.random() < .02) {
		//	console.log(p);
		//}
		//	console.log(mobaGMFile);
		//	console.log(p.hasOwnProperty("champions") );

		let createChamps = false;

		if (p.hasOwnProperty("champions") && !mobaGMFile || !p.hasOwnProperty("champions")) {
			createChamps = true;
		} else if (p.champions.length == 0) {
			createChamps = true;
		}

			//console.log(createChamps);
//		if (p.hasOwnProperty("champions") && !mobaGMFile || !p.hasOwnProperty("champions")) {
		if (createChamps) {
//			console.log(p);
	//		console.log(pg);

			p.champions = [];

		// this needs to call from champions list, really should be global
//        for (i = 0; i <  champions.champion.length; i++) {
//	console.log(g.numChampions);
		//if (g.gameType < 7) {
		//console.log( p.ratings[0].ovr);
//console.log(pg.champions.length);
//console.log(g.numChampions);
			for (i = 0; i <  g.numChampions; i++) {
			//	console.log(i);
				p.champions[i] = {};
				//p.champions.push({});
	//			p.champions[i].skill =  p.ratings[0].ovr+(Math.round(Math.random()*100,0)-10);
	//			p.champions[i].skill =  p.ratings[0].ovr+(Math.random()*100*20-10);
				p.champions[i].skill =  Math.round( p.ratings[0].ovr+(Math.random()*40-20),0);

				if (p.champions[i].skill< 0) {
				   p.champions[i].skill = 0;
				} else if (p.champions[i].skill > 100 ) {
				   p.champions[i].skill = 100;
				}
				//
				p.champions[i].name =   pg.champions[i].name;
				//p.champions.length = i;
			}
	//	}
		//	console.log(p.champions);
			//p.champions = helpers.deepCopy(pg.champions);

		}

		if (p.hasOwnProperty("champions")) {
		// make sure MMR is correct
			//console.log(topADC);
			///console.log(topTOP);
//console.log(topMID);
		//	console.log(topJGL);
		//	console.log(topSUP);
		//	console.log(p.ratings[0].pos);
		//	console.log(p.champions);
			let skillMMR = 0;
			//console.log(skillMMR);
			if (p.ratings[0].pos == "ADC") {
				for (i = 0; i <  topADC.length; i++) {
					skillMMR += p.champions[topADC[i]].skill;
				}
			}
			//console.log(skillMMR);
			if (p.ratings[0].pos == "TOP") {
				for (i = 0; i <  topTOP.length; i++) {
					skillMMR += p.champions[topTOP[i]].skill;
				}
			}
		//	console.log(skillMMR);
			if (p.ratings[0].pos == "MID") {
				for (i = 0; i <  topMID.length; i++) {
					skillMMR += p.champions[topMID[i]].skill;
				}
			}
		//	console.log(skillMMR);
			if (p.ratings[0].pos == "JGL") {

				for (i = 0; i <  topJGL.length; i++) {
				//console.log(i);
				//console.log(topJGL[i]);
					skillMMR += p.champions[topJGL[i]].skill;
				//console.log(skillMMR);
				}
			}
		//	console.log(skillMMR);
			if (p.ratings[0].pos== "SUP") {
				for (i = 0; i <  topSUP.length; i++) {
				//	console.log(i);
				//	console.log(topSUP[i]);
				//	console.log(p.champions[topSUP[i]]);
//
					skillMMR += p.champions[topSUP[i]].skill;
				}
			}
		//	console.log(skillMMR);
		//	console.log(skillMMR);
		//	console.log(p.ratings[0].ovr);
			p.ratings[0].MMR = MMRcalc(p.ratings[0].ovr,skillMMR);
		//	console.log(p.ratings[0].MMR);
			//p.ratings[0].MMR = Math.round(p.ratings[0].ovr*9 +2200+skillMMR/5,0); // up to 500 + 2200 + up to 500

			//console.log(p.ratings[0].MMR);
			var fuzzedMMR;
			fuzzedMMR = p.ratings[0].MMR+random.randInt(-50, 50);
			if ( fuzzedMMR < 2200) {
				p.ratings[0].rank = "Platinum 1";
			} else if ( fuzzedMMR< 2270) {
				p.ratings[0].rank = "Diamond V";
			} else if (fuzzedMMR < 2340) {
				p.ratings[0].rank = "Diamond IV";
			} else if (fuzzedMMR < 2410) {
				p.ratings[0].rank = "Diamond III";
			} else if (fuzzedMMR < 2480) {
				p.ratings[0].rank = "Diamond II";
			} else if (fuzzedMMR < 2550) {
				p.ratings[0].rank = "Diamond I";
			} else if (fuzzedMMR < 2750) {
				p.ratings[0].rank = "Master";
			} else  {
				p.ratings[0].rank = "Challenger";
			}

		} else {
			console.log("why not?");
		}

		if (p.face.hasOwnProperty("fatness")) {
			p.face = helpers.deepCopy(pg.face);
		}

	//	console.log(p);

        return p;
    }

function checkStatisticalFeat(pid: number, tid: number, p: GamePlayer, results: GameResults, conditions: Conditions) {
    //function checkStatisticalFeat(tx, pid, tid, p, results) {
        var carry, feat,  featTextArr, i, j, k, key, saveFeat, statArr, won;

        saveFeat = false;

		const logFeat = text => {
			logEvent({
				type: "playerFeat",
				text,
				showNotification: tid === g.userTid,
				pids: [pid],
				tids: [tid],
			}, conditions);
		};

/*        logFeat = function (text) {
            eventLog.add(tx, {
                type: "playerFeat",
                text: text,
                showNotification: tid === g.userTid,
                pids: [pid],
                tids: [tid]
            });
        };*/

        carry = ["fg", "fgp"].reduce(function (count, stat) {
            if (p.stat[stat] >= 8) {
                return count + 1;
            }
            return count;
        }, 0);
        if (p.stat.fga <= 2) {
            carry += 1;
        }

        statArr = {};

        if (carry >= 3) {
            statArr.kills = p.stat.fg;
            statArr.deaths = p.stat.fga;
            statArr.assists = p.stat.fgp;
            saveFeat = true;
        }
        if (p.stat.fg >= 10) {
            statArr.kills = p.stat.fg;
            saveFeat = true;
        }
        if (p.stat.fga <= 0) {
			if ((p.stat.fg+p.stat.fgp) >= 13) {
				statArr.deaths = p.stat.fga;
				statArr.kills = p.stat.fg;
				statArr.assists = p.stat.fgp;
				saveFeat = true;
			}

        }
        if (p.stat.fgp >= 20) {
            statArr.assists = p.stat.fgp;
            saveFeat = true;
        }
        if (p.stat.tp/p.stat.min >= 11) {
			//console.log(Math.round(p.stat.tp/p.stat.min,2));
            statArr["creep score per minute"]  = Math.round(p.stat.tp/p.stat.min,2);
            statArr["creep score"]  = p.stat.tp;
          //  statArr.minutes  = p.stat.min;
            saveFeat = true;
        }
        if (p.stat.orb >= 9) {
            statArr["towers"]  = p.stat.orb;
            saveFeat = true;
        }

        if (saveFeat) {

			const [i, j] = results.team[0].id === tid ? [0, 1] : [1, 0];
			const won = results.team[i].stat.pts > results.team[j].stat.pts;
			const featTextArr = Object.keys(statArr).map(stat => `${statArr[stat]} ${stat}`);

			//console.log(p.name);
		//	console.log(p);

			let featText = `<a href="${helpers.leagueUrl(["player", pid])}">${p.name}</a> had <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[tid], g.season, results.gid])}">`;

            for (let k = 0; k < featTextArr.length; k++) {
                if (featTextArr.length > 1 && k === featTextArr.length - 1) {
                    featText += " and ";
                }

                featText += featTextArr[k];

                if (featTextArr.length > 2 && k < featTextArr.length - 2) {
                    featText += ", ";
                }
            }


          /*  if (results.team[0].id === tid) {
                i = 0;
                j = 1;
            } else {
                i = 1;
                j = 0;
            }

            if (results.team[i].stat.pts > results.team[j].stat.pts) {
                won = true;
            } else {
                won = false;
            }

            featTextArr = [];
            for (key in statArr) {
                if (statArr.hasOwnProperty(key)) {
                    featTextArr.push(statArr[key] + " " + key);
                }
            }

            featText = '<a href="' + helpers.leagueUrl(["player", pid]) + '">' + p.name + '</a> had <a href="' + helpers.leagueUrl(["game_log", g.teamAbbrevsCache[tid], g.season, results.gid]) + '">';

            for (k = 0; k < featTextArr.length; k++) {
                if (featTextArr.length > 1 && k === featTextArr.length - 1) {
                    featText += " and ";
                }

                featText += featTextArr[k];

                if (featTextArr.length > 2 && k < featTextArr.length - 2) {
                    featText += ", ";
                }
            }*/
//            featText += '</a> in a ' + results.team[i].stat.pts + "-" + results.team[j].stat.pts + (won ? ' win over the ' : ' loss to the ') + g.teamNamesCache[results.team[j].id] + '.';
       //     featText += '</a> in a ' + (won ? ' win over ' : ' loss to ') + g.teamRegionsCache[results.team[j].id] + '.';


        logFeat(featText);

        idb.cache.playerFeats.add({
            pid,
            name: p.name,
            pos: p.pos,
            season: g.season,
            tid,
            oppTid: results.team[j].id,
            playoffs: (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI),
            gid: results.gid,
            stats: p.stat,
            won,
            score: `${results.team[i].stat.pts}-${results.team[j].stat.pts}`,
            overtimes: results.overtimes,
        });
    }
}



async function killOne(conditions: Conditions) {
    const reason = random.choice([
			"died from a drug overdose",
			"was killed by a gunshot during an altercation at the team's gaming house",
			"was eaten by wolves",
			"died in a car crash",
			"was stabbed to death by a jealous ex-girlfriend",
			"committed suicide",
			"died from a rapidly progressing case of ebola",
			"was killed in a gaming bar fight",
			"died after falling out of his 13th floor hotel room",
			"was shredded to bits by the team plane's propeller",
			"was hit by a stray meteor",
			"accidentally shot himself in the head while cleaning his gun",
			"was beheaded by ISIS",
			"spontaneously combusted",
			"had a stroke after reading about the owner's plans to trade him",
			"rode his Segway off a cliff",
			"fell into the gorilla pit at the zoo and was dismembered as the staff decided not to shoot the gorilla",
			"was pursued by a bear, and mauled", // poor Antigonus
			"was smothered by a throng of ravenous, autograph-seeking fans after exiting the team plane",
			'was killed by'+ random.choice(["Miss Scarlet", "Professor Plum", "Mrs. Peacock", "Reverend Green", "Colonel Mustard", "Mrs. White"])+', in the '+random.choice(["kitchen", "ballroom", "conservatory", "dining room", "cellar", "billiard room", "library", "lounge", "hall", "study"])+', with the '+random.choice(["candlestick", "dagger", "lead pipe", "revolver", "rope", "spanner"]),
			"suffered a heart attack in the team's gaming house and died",
			"was lost at sea and is presumed dead",
			"was run over by a car",
			"was run over by a car, and then was run over by a second car. Police believe only the first was intentional",
			"died in an internet cafe after training 43 hours straight.",
			"died after training and competing for 24 unrelenting days.",
    ]);

    // Pick random team
    const tid = random.randInt(0, g.numTeams - 1);

    const players = await idb.cache.players.indexGetAll('playersByTid', tid);

    // Pick a random player on that team
    const p = random.choice(players);

    // Get player stats, used for HOF calculation
    const playerStats = await idb.getCopies.playerStats({pid: p.pid});

    retire(p, playerStats, conditions, false);
    p.diedYear = g.season;

    await idb.cache.players.put(p);
    idb.cache.markDirtyIndexes('players');

    logEvent({
        type: 'tragedy',
        text: `<a href="${helpers.leagueUrl(['player', p.pid])}">${p.firstName} ${p.lastName}</a> ${reason}.`,
        showNotification: tid === g.userTid,
        pids: [p.pid],
        tids: [tid],
        persistent: true,
    }, conditions);
}

export default {
    addRatingsRow,
    addStatsRow,
    genBaseMoods,
    addToFreeAgents,
    bonus,
    genContract,
    setContract,
    develop,
    injury,
    generate,
    ovr,
		MMR: MMR,
		MMRcalc: MMRcalc,
		rank: rank,
    release,
    skills,
    madeHof,
    updateValues,
    retire,
    name,
    contractSeasonsRemaining,
    moodColorText,
    augmentPartialPlayer,
	languages: languages,
	country: country,
    checkStatisticalFeat,
    killOne,
    fuzzRating,
};
