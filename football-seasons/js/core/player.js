/**
 * @name core.player
 * @namespace Functions operating on player objects, parts of player objects, or arrays of player objects.
 */
define(["globals", "core/finances", "data/injuries", "data/names", "lib/faces", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (g, finances, injuries, names, faces, _, eventLog, helpers, random) {
    "use strict";

    /**
     * Limit a rating to between 0 and 100.
     *
     * @memberOf core.player
     * @param {number} rating Input rating.
     * @return {number} If rating is below 0, 0. If rating is above 100, 100. Otherwise, rating.
     */
    function limitRating(rating) {
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
    function ovr(ratings) {
        ///return Math.round((ratings.hgt + ratings.stre + ratings.spd + ratings.jmp + ratings.endu + ratings.ins + ratings.dnk + ratings.ft + ratings.fg + ratings.tp + ratings.blk + ratings.stl + ratings.drb + ratings.pss + ratings.reb) / 15);

		var runningBackRating,safetyRating,tightEndRating,ovrRating;
		var mainRating;
        var qb, rb, te, wr, position, ol,dl,lb,cb,s,k,offense,defense;

        qb = false;
        rb = false;
        te = false;
        wr = false;
        ol = false;
        dl = false;
        lb = false;
        cb = false;
        s = false;
		k = false;
        offense = false;
        defense = false;
		
		
           runningBackRating = (ratings.dnk+ratings.ft+ratings.hgt+ratings.stre+ratings.spd+ratings.jmp)/6*1.1;
			safetyRating = ((ratings.reb+ratings.cvr)/2)*1.1;
			tightEndRating = ((ratings.stl+ratings.drb)/2)*1.1;
		
		if (ratings.drb > ratings.reb) {
				position = 'OL';
				ovrRating  =  (ratings.drb*4+ratings.ft*4+ratings.dnk+ratings.hgt+ratings.stre*4+ratings.jmp+ratings.hnd*4)/19;
		} else {
				position = 'DL';
				ovrRating  =  (ratings.pss*4+ratings.reb*3+ratings.stre*2+ratings.hgt*2+ratings.jmp*2+ratings.hnd*2+ratings.fg*4+ratings.tp*2)/21;
		}

		
		//  ovrRating = (4 * ratings.hgt + ratings.stre + 4 * ratings.spd + 2 * ratings.jmp + 3 * ratings.endu + 3 * ratings.ins + 4 * ratings.dnk + ratings.ft + ratings.fg + 2 * ratings.tp + ratings.blk + ratings.stl + ratings.drb + 3 * ratings.pss + ratings.reb) / 32;
		
		          runningBackRating = ((ratings.dnk+ratings.ft+ratings.hgt+ratings.stre+ratings.spd+ratings.jmp)/6);
			safetyRating = ((ratings.reb+ratings.cvr)/2)*1.1;
			tightEndRating = ((ratings.stl+ratings.drb)/2)*1.1;

			if (((ratings.blk>=tightEndRating) && (ratings.blk>=safetyRating) && (ratings.blk>=runningBackRating) &&(ratings.blk>=ratings.stl) && (ratings.blk>=ratings.drb) && (ratings.blk>=ratings.pss) && (ratings.blk>=ratings.reb) && (ratings.blk>=ratings.cvr) && (ratings.blk>=ratings.kck) )){
				qb = true;
				ovrRating  =  (ratings.ins*4+ratings.blk*4+ratings.stre*2+ratings.hgt+ratings.jmp+ratings.ft*2+ratings.dnk)/15;
				
			} 

			mainRating = ratings.stl;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) &&(mainRating>ratings.blk) && (mainRating>ratings.drb) && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
				wr = true;
				ovrRating  =   (ratings.hgt*4+ratings.stl*4+ratings.drb+ratings.stre+ratings.jmp+ratings.ft+ratings.dnk)/13;
				
			} 

			mainRating = ratings.drb;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
				ol = true;
				ovrRating  =  (ratings.drb*4+ratings.ft*4+ratings.dnk+ratings.hgt+ratings.stre*4+ratings.jmp+ratings.hnd*4)/19;
			} 

			mainRating = ratings.pss;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
				dl = true;
				ovrRating  =  (ratings.pss*4+ratings.reb*3+ratings.stre*2+ratings.hgt*2+ratings.jmp*2+ratings.hnd*2+ratings.fg*4+ratings.tp*2)/21;
			} 

			mainRating = ratings.reb; 
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) &&  (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
				lb = true;
				ovrRating  =  (ratings.reb*4+ratings.pss*4+ratings.cvr*2+ratings.fg*4+ratings.tp*4+ratings.hgt*4+ratings.stre*4+ratings.jmp)/27;
			} 
			mainRating = ratings.cvr;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.kck)) ){
				cb = true;
				ovrRating  =  (ratings.cvr*4+ratings.hgt*4+ratings.fg+ratings.tp+ratings.reb*2+ratings.hnd)/13;
			} 
			mainRating = ratings.kck;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
				 k= true;
				ovrRating  =  (ratings.kck*4+ratings.stre*4+ratings.jmp*1+ratings.ins*1+ratings.ft*1)/11;
			} 	
			mainRating = tightEndRating;
			if (((mainRating>ratings.kck) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
				te = true;
				ovrRating  =  (ratings.stl*4+ratings.drb*4+ratings.dnk*3+ratings.ft*3+ratings.hgt*2+ratings.stre*2)/18;
			} 
			mainRating = safetyRating;
			if (((mainRating>ratings.kck) && (mainRating>tightEndRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
				ovrRating  =  (ratings.reb*4+ratings.cvr*4+ratings.hgt*4+ratings.stre*2+ratings.jmp*2+ratings.hnd+ratings.fg*2+ratings.tp*2)/21;
				s = true;
			} 		
			mainRating = runningBackRating;
			if (((mainRating>ratings.kck) && (mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
				ovrRating  =  (ratings.dnk*4+ratings.ft*4+ratings.hgt*4+ratings.stre*4+ratings.spd*2+ratings.jmp*2+ratings.hnd*2)/22;
				rb = true;			
			}

			
			 if (qb) {
			   position = 'QB';
				ovrRating  =  (ratings.ins*4+ratings.blk*4+ratings.stre*2+ratings.hgt+ratings.jmp+ratings.ft*2+ratings.dnk)/15;
			   
			 } else {
					 if (rb) {
					   position = 'RB';
						ovrRating  =  (ratings.dnk*4+ratings.ft*4+ratings.hgt*4+ratings.stre*4+ratings.spd*2+ratings.jmp*2+ratings.hnd*2)/22;
					   
					 }			 
					 if (te) {
					   position = 'TE';
						ovrRating  =  (ratings.stl*4+ratings.drb*4+ratings.dnk*3+ratings.ft*3+ratings.hgt*2+ratings.stre*2)/18;
					   
					 } else if (wr) {
					   position = 'WR';
				ovrRating  =   (ratings.hgt*4+ratings.stl*4+ratings.drb+ratings.stre+ratings.jmp+ratings.ft+ratings.dnk)/13;
					   
					 }				 
					 /*if (dl) {
					   position = 'DL';
					 }	*/
					 if (lb) {
					   position = 'LB';
				ovrRating  =  (ratings.reb*4+ratings.pss*4+ratings.cvr*2+ratings.fg*4+ratings.tp*4+ratings.hgt*4+ratings.stre*4+ratings.jmp)/27;
					   
					 }		
					 if (s) {
					   position = 'S';
						ovrRating  =  (ratings.reb*4+ratings.cvr*4+ratings.hgt*4+ratings.stre*2+ratings.jmp*2+ratings.hnd+ratings.fg*2+ratings.tp*2)/21;
					   
					 }					 
					 if (cb) {
					   position = 'CB';
						ovrRating  =  (ratings.cvr*4+ratings.hgt*4+ratings.fg+ratings.tp+ratings.reb*2+ratings.hnd)/13;
					   
					 }					 
					 if (k) {
					   position = 'K';
				ovrRating  =  (ratings.kck*4+ratings.stre*4+ratings.jmp*1+ratings.ins*1+ratings.ft*1)/11;
					   
					 }		
			}			 
		
		
		
		
		
		
        // This formula is loosely based on linear regression:
        //     player = require('core/player'); player.regressRatingsPer();
//        return Math.round((4 * ratings.hgt + ratings.stre + 4 * ratings.spd + 2 * ratings.jmp + 3 * ratings.endu + 3 * ratings.ins + 4 * ratings.dnk + ratings.ft + ratings.fg + 2 * ratings.tp + ratings.blk + ratings.stl + ratings.drb + 3 * ratings.pss + ratings.reb) / 32);
        return Math.round(ovrRating);
    }

    /**
     * Calculates the overall rating by averaging together all the other ratings.
     * 
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Player's ratings object.
     * @return {number} Overall rating.
     */
    function ovrOnly(ratings,position) {
        ///return Math.round((ratings.hgt + ratings.stre + ratings.spd + ratings.jmp + ratings.endu + ratings.ins + ratings.dnk + ratings.ft + ratings.fg + ratings.tp + ratings.blk + ratings.stl + ratings.drb + ratings.pss + ratings.reb) / 15);

		var runningBackRating,safetyRating,tightEndRating,ovrRating;
		var mainRating;
        var qb, rb, te, wr, ol,dl,lb,cb,s,k,offense,defense;

        qb = false;
        rb = false;
        te = false;
        wr = false;
        ol = false;
        dl = false;
        lb = false;
        cb = false;
        s = false;
		k = false;
        offense = false;
        defense = false;
						
		console.log(position);
		console.log(ratings);
			if (position == 'OL') {
				ovrRating  =  (ratings.drb*4+ratings.ft*4+ratings.dnk+ratings.hgt+ratings.stre*4+ratings.jmp+ratings.hnd*4)/19;
			}
			if (position == 'DL') {
				ovrRating  =  (ratings.pss*4+ratings.reb*3+ratings.stre*2+ratings.hgt*2+ratings.jmp*2+ratings.hnd*2+ratings.fg*4+ratings.tp*2)/21;
			}
		
			
	

			if (position == 'QB') {
					ovrRating  =  (ratings.ins*4+ratings.blk*4+ratings.stre*2+ratings.hgt+ratings.jmp+ratings.ft*2+ratings.dnk)/15;
			}
			if (position == 'RB') {
					ovrRating  =  (ratings.dnk*4+ratings.ft*4+ratings.hgt*4+ratings.stre*4+ratings.spd*2+ratings.jmp*2+ratings.hnd*2)/22;
			}			
			if (position == 'TE') {
							ovrRating  =  (ratings.stl*4+ratings.drb*4+ratings.dnk*3+ratings.ft*3+ratings.hgt*2+ratings.stre*2)/18;
			}
			if (position == 'WR') {
					ovrRating  =   (ratings.hgt*4+ratings.stl*4+ratings.drb+ratings.stre+ratings.jmp+ratings.ft+ratings.dnk)/13;
			}			

			if (position == 'LB') {
					ovrRating  =  (ratings.reb*4+ratings.pss*4+ratings.cvr*2+ratings.fg*4+ratings.tp*4+ratings.hgt*4+ratings.stre*4+ratings.jmp)/27;
			}
			if (position == 'S') {
							ovrRating  =  (ratings.reb*4+ratings.cvr*4+ratings.hgt*4+ratings.stre*2+ratings.jmp*2+ratings.hnd+ratings.fg*2+ratings.tp*2)/21;
			}			
			if (position == 'CB') {
							ovrRating  =  (ratings.cvr*4+ratings.hgt*4+ratings.fg+ratings.tp+ratings.reb*2+ratings.hnd)/13;
			}
			if (position == 'K') {
					ovrRating  =  (ratings.kck*4+ratings.stre*4+ratings.jmp*1+ratings.ins*1+ratings.ft*1)/11;
			}			
						 
			
				 
		
		console.log(ovrRating);		
		
		
		
		
        // This formula is loosely based on linear regression:
        //     player = require('core/player'); player.regressRatingsPer();
//        return Math.round((4 * ratings.hgt + ratings.stre + 4 * ratings.spd + 2 * ratings.jmp + 3 * ratings.endu + 3 * ratings.ins + 4 * ratings.dnk + ratings.ft + ratings.fg + 2 * ratings.tp + ratings.blk + ratings.stl + ratings.drb + 3 * ratings.pss + ratings.reb) / 32);
        return Math.round(ovrRating);
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
    function skills(ratings) {
        var hasSkill, sk;

        sk = [];

        hasSkill = function (ratings, components, weights, cutoff) {
            var denominator, i, numerator;

            if (weights === undefined) {
                // Default: array of ones with same size as components
                weights = [];
                for (i = 0; i < components.length; i++) {
                    weights.push(1);
                }
            }

            numerator = 0;
            denominator = 0;
            for (i = 0; i < components.length; i++) {
                numerator += ratings[components[i]] * weights[i];
                denominator += 100 * weights[i];
            }

			// temporarily turning skills off (may not use?)
//            if (numerator / denominator > 1.01) {
            if (numerator / denominator > cutoff) {
//            if (numerator / denominator > .81) {
                return true;
            }
            return false;
        };

        // These use the same formulas as the composite rating definitions in core.game!
        if (hasSkill(ratings,['blk', 'ins', 'stre'], [1, 1, .25],.95)) {
            sk.push("Pp");
        }
        if (hasSkill(ratings,['blk', 'ins', 'stre'], [1, .5, 1],.85)) {
            sk.push("Pd");
        }
        if (hasSkill(ratings,['blk'], [1],.70)) {
			if (hasSkill(ratings,['blk'], [ 1],.70)) {
				if (hasSkill(ratings,['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft'], [1, 1, 1,1, 1, 1], .6)) {
					sk.push("Pe");
				}			
			}
        }
		
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft'], [1, 2, 1,1, 2, .25],.80)) {
            sk.push("RuP");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft'], [2, 1, 2,2, .25, 2],.80)) {
            sk.push("RuF");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'], [.5, 1, 1,1, 1, 1,2,2,4],.75)) {
            sk.push("ReS");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'], [2, 1, 1,1, 2, 2,1,2,4],.75)) {
            sk.push("ReC");
        }
        if (hasSkill(ratings,  ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'], [8, 1, 1,1, 1, 1,1,4,8],.85)) {
            sk.push("ReD");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','drb'], [1, 2, 1,2, 1, 2,1,4,8],.80)) {
            sk.push("Bp");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','drb'], [2, 1, 2,1, 6, 1,1,2,4],.70)) {
            sk.push("Br");
        }

        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','pss'], [2, 2, 2,0, 2, 2,2,0,8],.80)) {
            sk.push("Sa");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','reb'], [2, 2, 2,0, 2, 2,2,0,8],.80)) {
            sk.push("Rs");
        }

		
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'], [3, 1, 3,0, 2, 2,2,0,8],.80)) {
            sk.push("Cs");
        }		
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'], [6, 1, 2,0, 2, 2,0,0,12],.86)) {
            sk.push("Cc");
        }		
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'], [15, 1, 2,0, 2, 2,0,0,15],.86)) {
            sk.push("Cd");
        }

        if (hasSkill(ratings, ['kck', 'stre', 'hgt', 'jmp', 'ins','hnd'], [6, 1, 1,1, 2, 2],.7)) {
            sk.push("P");
        }
        if (hasSkill(ratings, ['kck', 'stre', 'hgt', 'jmp', 'ins'], [6, 1, 1,1, 0],.75)) {
            sk.push("K");
        }
        if (hasSkill(ratings, ['kck', 'stre', 'hgt', 'jmp', 'ins'], [6, 1, 1,1, 4],.80)) {
            sk.push("Fg");
        }

		
		/*
        if (hasSkill(ratings, ['stre', 'spd', 'jmp', 'hgt'], [1, 1, 1, 0.5])) {
            sk.push("A");
        }
        if (hasSkill(ratings, ['drb', 'spd'])) {
            sk.push("B");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'spd', 'jmp', 'blk'], [2, 1, 0.5, 0.5, 1])) {
            sk.push("Di");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'spd', 'jmp', 'stl'], [1, 1, 2, 0.5, 1])) {
            sk.push("Dp");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'spd', 'ins'], [1, 0.6, 0.2, 1])) {
            sk.push("Po");
        }
        if (hasSkill(ratings, ['drb', 'pss'], [0.4, 1])) {
            sk.push("Ps");
        }
        if (hasSkill(ratings, ['hgt', 'stre', 'jmp', 'reb'], [1, 0.1, 0.1, 0.7])) {
            sk.push("R");
        } */

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

        ratings = _.last(p.ratings);

        randomizeExp = randomizeExp !== undefined ? randomizeExp : false;
        randomizeAmount = randomizeAmount !== undefined ? randomizeAmount : true;
        noLimit = noLimit !== undefined ? noLimit : false;

        // Limits on yearly contract amount, in $1000's
        minAmount = 400;
        maxAmount = 40000;

        // Scale proportional to (ovr*2 + pot)*0.5 120-210
        //amount = ((3 * value(p)) * 0.85 - 110) / (210 - 120);  // Scale from 0 to 1 (approx)
        //amount = amount * (maxAmount - minAmount) + minAmount;
//        amount = ((value(p) - 1) / 100 - 0.55) * .9 * (maxAmount - minAmount) + minAmount;
        amount = ((value(p) - 1) / 100 - 0.55) * .55 * (maxAmount - minAmount) + minAmount;
		if (p.pos == "QB") {
		   amount *= 1.4;
		} else {
		   amount *= .7;
		}
        if (randomizeAmount) {
            amount *= helpers.bound(random.realGauss(1, 0.1), 0, 2);  // Randomize
        }

        // Expiration
        // Players with high potentials want short contracts
        potentialDifference = Math.round((ratings.pot - ratings.ovr) / 4.0);
        years = 5 - potentialDifference;
        if (years < 2) {
            years = 2;
        }
        // Bad players can only ask for short deals
        if (ratings.pot < 40) {
            years = 1;
        } else if (ratings.pot < 50) {
            years = 2;
        } else if (ratings.pot < 60) {
            years = 3;
        }

        // Randomize expiration for contracts generated at beginning of new game
        if (randomizeExp) {
            years = random.randInt(1, years);

            // Make rookie contracts more reasonable
            if (g.season - p.born.year <= 22) {
                amount /= 4; // Max $5 million/year
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
            if (amount < 0) {
                amount = 0;
            }
        }

        amount = 50 * Math.round(amount / 50);  // Make it a multiple of 50k

        return {amount: amount, exp: expiration};
    }

    /**
     * Store a contract in a player object.
     * 
     * @memberOf core.player
     * @param {Object} p Player object.
     * @param {Object} contract Contract object with two properties, exp (year) and amount (thousands of dollars).
     * @param {boolean} signed Is this an official signed contract (true), or just part of a negotiation (false)?
     * @return {Object} Updated player object.
     */
    function setContract(p, contract, signed) {
        var i, start;

        p.contract = contract;

        // Only write to salary log if the player is actually signed. Otherwise, we're just generating a value for a negotiation.
        if (signed) {
            // Is this contract beginning with an in-progress season, or next season?
            start = g.season;
            if (g.phase > g.PHASE.AFTER_TRADE_DEADLINE) {
                start += 1;
            }

            for (i = start; i <= p.contract.exp; i++) {
                p.salaries.push({season: i, amount: contract.amount});
            }
        }

        return p;
    }

    /**
     * Develop (increase/decrease) player's ratings. This operates on whatever the last row of p.ratings is.
     * 
     * @memberOf core.player
     * @param {Object} p Player object.
     * @param {number=} years Number of years to develop (default 1).
     * @param {boolean=} generate Generating a new player? (default false). If true, then the player's age is also updated based on years.
     * @param {number=} coachingRank From 1 to g.numTeams (default 30), where 1 is best coaching staff and g.numTeams is worst. Default is 15.5
     * @return {Object} Updated player object.
     */
    function develop(p, years, generate, coachingRank) {
        var age, baseChange, i, j, ratingKeys, r, sigma, sign;

        years = years !== undefined ? years : 1;
        generate = generate !== undefined ? generate : false;
        coachingRank = coachingRank !== undefined ? coachingRank : 15.5;

        r = p.ratings.length - 1;

        age = g.season - p.born.year;

        for (i = 0; i < years; i++) {
            age += 1;

            // Randomly make a big jump
            if (Math.random() > 0.985 && age < 25) {
                p.ratings[r].pot += 10;
            }

            // Variance of ratings change is proportional to the potential difference
            sigma = (p.ratings[r].pot - p.ratings[r].ovr) / 10;

            // 60% of the time, improve. 20%, regress. 20%, stay the same
            baseChange = random.gauss(random.randInt(-1, 3), sigma);

            // Bound possible changes
            if (baseChange > 30) {
                baseChange = 30;
            } else if (baseChange < -5) {
                baseChange = -5;
            }
            if (baseChange + p.ratings[r].pot > 95) {
                baseChange = 95 - p.ratings[r].pot;
            }

            // Modulate by potential difference, but only for growth, not regression
            if (baseChange > 0) {
                baseChange *= 1 + (p.ratings[r].pot - p.ratings[r].ovr) / 8;
            }

            // Modulate by age
            if (age > 26) {
                baseChange /= 3;
            }
            if (age > 29) {
                baseChange -= 1;
            }
            if (age > 31) {
                baseChange -= 1;
            }
            if (age > 35) {
                baseChange -= 1;
            }

            // Modulate by coaching
            sign = baseChange ? baseChange < 0 ? -1 : 1 : 0;
            if (sign >= 0) { // life is normal
                baseChange *= ((coachingRank - 1) * (-0.5) / (g.numTeams - 1) + 1.25);
            } else {
                baseChange *= ((coachingRank - 1) * (0.5) / (g.numTeams - 1) + 0.75);
            }

			
			
			
			
			//console.log(p.pos);
            /*ratingKeys = ['stre', 'spd', 'jmp', 'endu', 'ins', 'dnk', 'ft', 'fg', 'tp', 'blk', 'stl', 'drb', 'pss', 'reb'];
            for (j = 0; j < ratingKeys.length; j++) {
                //increase = plusMinus
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + random.gauss(1, 2) * baseChange);
            }*/
			
	
			
			

				// Easy to improve  // IQ and SKILL
				if ( (p.pos == "QB")  ) {
					ratingKeys = ['ins','blk'];
				} else if ( (p.pos == "WR")  ) {
					ratingKeys = ['ins','stl'];
				} else if ( (p.pos == "RB")  ) {
					ratingKeys = ['ins'];
				} else if ( (p.pos == "TE")  ) {
					ratingKeys = ['ins'];
				} else if ( (p.pos == "OL")  ) {
					ratingKeys = ['ins','drb'];
				} else if ( (p.pos == "CB")  ) {
					ratingKeys = ['ins','cvr'];
				} else if ( (p.pos == "S")  ) {
					ratingKeys = ['ins','cvr'];
				} else if ( (p.pos == "LB")  ) {
					ratingKeys = ['ins','reb'];
				} else if ( (p.pos == "DL")  ) {
					ratingKeys = ['ins','pss'];
				} else if ( (p.pos == "K")  ) {
					ratingKeys = ['ins','k'];
				} 
				
				for (j = 0; j < ratingKeys.length; j++) {
					p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + random.gauss(2, 2) * baseChange);
				}
				
				// In between   // STRE, AWARE (offense), END
				if ( (p.pos == "QB")  ) {
					ratingKeys = ['stre','spd'];
				} else if ( (p.pos == "WR")  ) {
					ratingKeys = ['stre','spd'];
				} else if ( (p.pos == "RB")  ) {
					ratingKeys = ['stre','spd','drb','stl'];
				} else if ( (p.pos == "TE")  ) {
					ratingKeys = ['stre','spd','drb','stl'];
				} else if ( (p.pos == "OL")  ) {
					ratingKeys = ['stre','spd'];
				} else if ( (p.pos == "CB")  ) {
					ratingKeys = ['stre','spd','reb'];
				} else if ( (p.pos == "S")  ) {
					ratingKeys = ['stre','spd','reb'];
				} else if ( (p.pos == "LB")  ) {
					ratingKeys = ['stre','spd','cvr','pss'];
				} else if ( (p.pos == "DL")  ) {
					ratingKeys = ['stre','spd','reb'];
				} else if ( (p.pos == "K")  ) {
					ratingKeys = ['stre','spd'];
				} 
				
				
				for (j = 0; j < ratingKeys.length; j++) {
					p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(random.gauss(1, 2) * baseChange, -100, 35));
				}
			//	 Hard to improve // aware/aggre
				 
				if ( (p.pos == "QB")  ) {
					ratingKeys = ['ft'];
				} else if ( (p.pos == "WR")  ) {
					ratingKeys = ['ft'];
				} else if ( (p.pos == "RB")  ) {
					ratingKeys = ['ft'];
				} else if ( (p.pos == "TE")  ) {
					ratingKeys = ['ft'];
				} else if ( (p.pos == "OL")  ) {
					ratingKeys = ['ft'];
				} else if ( (p.pos == "CB")  ) {
					ratingKeys = ['fg'];
				} else if ( (p.pos == "S")  ) {
					ratingKeys = ['fg'];
				} else if ( (p.pos == "LB")  ) {
					ratingKeys = ['fg'];
				} else if ( (p.pos == "DL")  ) {
					ratingKeys = ['fg'];
				} else if ( (p.pos == "K")  ) {
					ratingKeys = ['ft'];
				} 				 
				 
		 
				for (j = 0; j < ratingKeys.length; j++) {
					p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(random.gauss(1, 2) * baseChange, -10, 20));
				}

				
				
			// Hard to improve  // speed, athletic, HEIGHT (aware DEFENSE)
//				ratingKeys = ['blk','endu','ins','dnk','ft','fg','tp'];
				if (age <30) {
				
				
					if ( (p.pos == "QB")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "WR")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "RB")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "TE")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "OL")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "CB")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','ft','tp'];
					} else if ( (p.pos == "S")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','ft','tp'];
					} else if ( (p.pos == "LB")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','ft','tp'];
					} else if ( (p.pos == "DL")  ) {
						ratingKeys = ['hgt','jmp','endu','hnd','dnk','fg','tp'];
					} 				 
									
				
				} else {
				
				
					if ( (p.pos == "QB")  ) {
						ratingKeys = ['endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "WR")  ) {
						ratingKeys = ['endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "RB")  ) {
						ratingKeys = ['endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "TE")  ) {
						ratingKeys = ['endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "OL")  ) {
						ratingKeys = ['endu','hnd','dnk','fg','tp'];
					} else if ( (p.pos == "CB")  ) {
						ratingKeys = ['endu','hnd','dnk','ft','tp'];
					} else if ( (p.pos == "S")  ) {
						ratingKeys = ['endu','hnd','dnk','ft','tp'];
					} else if ( (p.pos == "LB")  ) {
						ratingKeys = ['endu','hnd','dnk','ft','tp'];
					} else if ( (p.pos == "DL")  ) {
						ratingKeys = ['endu','hnd','dnk','ft','tp'];
					} else if ( (p.pos == "K")  ) {
						ratingKeys = ['endu','hnd','dnk','ft','tp'];
					} 				 
											
					
				
				}				
				//ratingKeys = ['blk','endu','ft','fg','tp'];
				for (j = 0; j < ratingKeys.length; j++) {
					p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(random.gauss(1, 2) * baseChange, -10, 10));
	//                p.ratings[r][ratingKeys[j]] = limitrating.limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(random.gauss(1, 2) * baseChange, -10, 20));
				}				
				
				
				// barely moves  // falls NON-SKILL, over 30 SPD, ATH
				if (age <30) {
				
//						ratingKeys = ['blk','stl','drb','pss','reb','cvr','kck'];
			
					if ( (p.pos == "QB")  ) {
						ratingKeys = ['stl','drb','pss','reb','cvr','kck'];
					} else if ( (p.pos == "WR")  ) {
						ratingKeys = ['blk','drb','pss','reb','cvr','kck'];
					} else if ( (p.pos == "RB")  ) {
						ratingKeys = ['blk','pss','reb','cvr','kck'];
					} else if ( (p.pos == "TE")  ) {
						ratingKeys = ['blk','pss','reb','cvr','kck'];
					} else if ( (p.pos == "OL")  ) {
						ratingKeys = ['blk','stl','pss','reb','cvr','kck'];
					} else if ( (p.pos == "CB")  ) {
						ratingKeys = ['blk','stl','drb','pss','kck'];
					} else if ( (p.pos == "S")  ) {
						ratingKeys = ['blk','stl','drb','pss','kck'];
					} else if ( (p.pos == "LB")  ) {
						ratingKeys = ['blk','stl','drb','kck'];
					} else if ( (p.pos == "DL")  ) {
						ratingKeys = ['blk','stl','drb','cvr','kck'];
					} else if ( (p.pos == "K")  ) {
						ratingKeys = ['stl','drb','pss','reb','cvr','blk'];
					} 				 
											
				
				} else {
				
			
					if ( (p.pos == "QB")  ) {
						ratingKeys = ['hgt','jmp','stl','drb','pss','reb','cvr','kck'];
					} else if ( (p.pos == "WR")  ) {
						ratingKeys = ['hgt','jmp','blk','drb','pss','reb','cvr','kck'];
					} else if ( (p.pos == "RB")  ) {
						ratingKeys = ['hgt','jmp','blk','pss','reb','cvr','kck'];
					} else if ( (p.pos == "TE")  ) {
						ratingKeys = ['hgt','jmp','blk','pss','reb','cvr','kck'];
					} else if ( (p.pos == "OL")  ) {
						ratingKeys = ['hgt','jmp','blk','stl','pss','reb','cvr','kck'];
					} else if ( (p.pos == "CB")  ) {
						ratingKeys = ['hgt','jmp','blk','stl','drb','pss','kck'];
					} else if ( (p.pos == "S")  ) {
						ratingKeys = ['hgt','jmp','blk','stl','drb','pss','kck'];
					} else if ( (p.pos == "LB")  ) {
						ratingKeys = ['hgt','jmp','blk','stl','drb','kck'];
					} else if ( (p.pos == "DL")  ) {
						ratingKeys = ['hgt','jmp','blk','stl','drb','cvr','kck'];
					} else if ( (p.pos == "K")  ) {
						ratingKeys = ['hgt','jmp','stl','drb','pss','reb','cvr','blk'];
					} 				 
				
				}				
				for (j = 0; j < ratingKeys.length; j++) {
					p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(random.gauss(1, 2) * baseChange, -100, 5));
	//                p.ratings[r][ratingKeys[j]] = limitrating.limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(random.gauss(1, 2) * baseChange, -10, 20));
				}
			
			
						
			
            // Easy to improve
   /*         ratingKeys = ['stre', 'endu', 'ins', 'ft', 'fg', 'tp', 'blk', 'stl'];
            for (j = 0; j < ratingKeys.length; j++) {
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + random.gauss(2, 2) * baseChange);
            }
            // In between
            ratingKeys = ['spd', 'jmp', 'dnk'];
            for (j = 0; j < ratingKeys.length; j++) {
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(random.gauss(1, 2) * baseChange, -100, 35));
            }
            // Hard to improve
            ratingKeys = ['drb', 'pss', 'reb'];
            for (j = 0; j < ratingKeys.length; j++) {
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(random.gauss(1, 2) * baseChange, -10, 20));
            }*/

            // Update overall and potential
            p.ratings[r].ovr = ovr(p.ratings[r]);
            p.ratings[r].pot += -2 + Math.round(random.gauss(0, 2));
            if (p.ratings[r].ovr > p.ratings[r].pot || age > 28) {
                p.ratings[r].pot = p.ratings[r].ovr;
            }

            // Skills
            p.ratings[r].skills = skills(p.ratings[r]);
        }

        // If this isn't here outside the loop, then 19 year old players could still have ovr > pot
        if (p.ratings[r].ovr > p.ratings[r].pot || age > 28) {
            p.ratings[r].pot = p.ratings[r].ovr;
        }

        if (generate) {
            age = g.season - p.born.year + years;
            p.born.year = g.season - age;
        }

        return p;
    }

    /**
     * Add or subtract amount from all current ratings and update the player's contract appropriately.
     * 
     * This should only be called when generating players for a new league. Otherwise, develop should be used. 
     * 
     * @memberOf core.player
     * @param {Object} p Player object.
     * @param {number} amount Number to be added to each rating (can be negative).
     * @param {boolean} randomizeExp Should the number of years on the player's contract be randomized?.
     * @return {Object} Updated player object.
     */
    function bonus(p, amount, randomizeExp) {
        var age, i, key, r, ratingKeys;

        // Make sure age is always defined
        age = g.season - p.born.year;

        r = p.ratings.length - 1;

        ratingKeys = ['hgt', 'stre', 'spd', 'jmp', 'endu','hnd', 'ins', 'dnk', 'ft', 'fg', 'tp', 'blk', 'stl', 'drb', 'pss', 'reb','cvr','kck', 'pot'];
        for (i = 0; i < ratingKeys.length; i++) {
            key = ratingKeys[i];
            p.ratings[r][key] = limitRating(p.ratings[r][key] + amount);
        }

        // Update overall and potential
        p.ratings[r].ovr = ovr(p.ratings[r]);
        if (p.ratings[r].ovr > p.ratings[r].pot || age > 28) {
            p.ratings[r].pot = p.ratings[r].ovr;
        }

        // Update contract based on development. Only write contract to log if not a free agent.
        p = setContract(p, genContract(p, randomizeExp), p.tid >= 0);

        return p;
    }

    /**
     * Calculates the base "mood" factor for any free agent towards a team.
     *
     * This base mood is then modulated for an individual player in addToFreeAgents.
     * 
     * @param {(IDBObjectStore|IDBTransaction|null)} ot An IndexedDB object store or transaction on teams; if null is passed, then a new transaction will be used.
     * @return {function(Array.<number>)} Callback function whose argument is an array of base moods, one for each team.
     */
    function genBaseMoods(ot, cb) {
        var baseMoods, teamStore;

        baseMoods = [];

        teamStore = require("db").getObjectStore(ot, "teams", "teams");
        teamStore.getAll().onsuccess = function (event) {
            var i, s, teams;

            teams = event.target.result;

            s = teams[0].seasons.length - 1;  // Most recent season index

            for (i = 0; i < teams.length; i++) {
                // Special case for winning a title - basically never refuse to re-sign unless a miracle occurs
                if (teams[i].seasons[s].playoffRoundsWon === 4 && Math.random() < 0.99) {
                    baseMoods[i] = -0.25; // Should guarantee no refusing to re-sign
                } else {
                    baseMoods[i] = 0;

                    // Hype
                    baseMoods[i] += 0.5 * (1 - teams[i].seasons[s].hype);

                    // Facilities
                    baseMoods[i] += 0.1 * (finances.getRankLastThree(teams[i], "expenses", "facilities") - 1) / (g.numTeams - 1);

                    // Population
                    baseMoods[i] += 0.2 * (1 - teams[i].seasons[s].pop / 10);

                    // Randomness
                    baseMoods[i] += random.uniform(-0.2, 0.2);

                    baseMoods[i] = helpers.bound(baseMoods[i], 0, 1);
                }
            }

            cb(baseMoods);
        };
    }

    /**
     * Adds player to the free agents list.
     * 
     * This should be THE ONLY way that players are added to the free agents
     * list, because this will also calculate their demanded contract and mood.
     * 
     * @memberOf core.player
     * @param {(IDBObjectStore|IDBTransaction|null)} ot An IndexedDB object store or transaction on players readwrite; if null is passed, then a new transaction will be used.
     * @param {Object} p Player object.
     * @param {?number} phase An integer representing the game phase to consider this transaction under (defaults to g.phase if null).
     * @param {Array.<number>} baseMoods Vector of base moods for each team from 0 to 1, as generated by genBaseMoods.
     * @param {function()=} cb Optional callback.
     */
    function addToFreeAgents(ot, p, phase, baseMoods, cb) {
        var pr;

        phase = phase !== null ? phase : g.phase;

        pr = _.last(p.ratings);
        p = setContract(p, genContract(p), false);

        // Set initial player mood towards each team
        p.freeAgentMood = _.map(baseMoods, function (mood) {
            if (pr.ovr + pr.pot < 80) {
                // Bad players don't have the luxury to be choosy about teams
                return 0;
            }
            if (phase === g.PHASE.RESIGN_PLAYERS) {
                // More likely to re-sign your own players
                return helpers.bound(mood + random.uniform(-1, 0.5), 0, 1000);
            }
            return helpers.bound(mood + random.uniform(-1, 1.5), 0, 1000);
        });

        // During regular season, or before season starts, allow contracts for
        // just this year.
        if (phase > g.PHASE.AFTER_TRADE_DEADLINE) {
            p.contract.exp += 1;
        }

        p.tid = g.PLAYER.FREE_AGENT;

        p.ptModifier = 1; // Reset

        // The put doesn't always work in Chrome. No idea why.
        require("db").getObjectStore(ot, "players", "players", true).put(p);

        if (cb !== undefined) {
            cb();
        }
    }

    /**
     * Release player.
     * 
     * This keeps track of what the player's current team owes him, and then calls player.addToFreeAgents.
     * 
     * @memberOf core.player
     * @param {IDBTransaction} tx An IndexedDB transaction on players, releasedPlayers, and teams, readwrite.
     * @param {Object} p Player object.
     * @param {boolean} justDrafted True if the player was just drafted by his current team and the regular season hasn't started yet. False otherwise. If True, then the player can be released without paying his salary.
     * @param {function()=} cb Optional callback function.
     */
    function release(tx, p, justDrafted, cb) {
        // Keep track of player salary even when he's off the team, but make an exception for players who were just drafted
        // Was the player just drafted?
        if (!justDrafted) {
            tx.objectStore("releasedPlayers").add({
                pid: p.pid,
                tid: p.tid,
                contract: p.contract
            });
        }

        genBaseMoods(tx, function (baseMoods) {
            addToFreeAgents(tx, p, g.phase, baseMoods, cb);
        });
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
    function genFuzz(scoutingRank) {
        var cutoff, fuzz, sigma;

        cutoff = 2 + 8 * (scoutingRank - 1) / (g.numTeams - 1);  // Max error is from 2 to 10, based on scouting rank
        sigma = 1 + 2 * (scoutingRank - 1) / (g.numTeams - 1);  // Stddev is from 1 to 3, based on scouting rank

//        fuzz = random.gauss(0, sigma);
        fuzz = 0;
        if (fuzz > cutoff) {
            fuzz = cutoff;
        } else if (fuzz < -cutoff) {
            fuzz = -cutoff;
        }

        return fuzz;
    }
	 /*
	     
Physical
------
Speed (acceleratino, could be athlete) "hgt", 
Strength "stre",
Endurance "spd", 
Quickness/Athlete/Body Control "jmp", 
Height "endu",
Hands "Hnd"

Mental
--------
GameIQ "ins", 
Toughness    "dnk", 
Awareness/Instincts "ft", 
Aggressiveness "fg",
Motor "tp",

Skill
------
Throwing Accuracy "blk", 
Catching "stl", 
Blocking "drb",
Rushing  "pss", 
Tackling "reb"
Coverage "cvr"
Kick "kck"
	 
	 */
	 
    /**
     * Generate initial ratings for a newly-created player.
     *
     * @param {string} profile [description]
     * @param {number} baseRating [description]
     * @param {number} pot [description]
     * @param {number} season [description]
     * @param {number} scoutingRank Between 1 and g.numTeams (default 30), the rank of scouting spending, probably over the past 3 years via core.finances.getRankLastThree.
     * @return {Object} Ratings object
     */
    function genRatings(profile, baseRating, pot, season, scoutingRank) {
        var i, key, profileId, profiles, ratingKeys, ratings, rawRating, rawRatings, sigmas;

        if (profile === "Point") {   // QB
            profileId = 1;
        } else if (profile === "Wing") { //// RB
            profileId = 2;
        } else if (profile === "Big") { //// WR
            profileId = 3;
        } else if (profile === "Kicker") {  // kicker punter
            profileId = 4;
        } else if (profile === "QB") {  
            profileId = 5;
        } else if (profile === "RB") {  
            profileId = 6;
        } else if (profile === "TE") {  
            profileId = 7;
        } else if (profile === "WR") {  
            profileId = 8;
        } else if (profile === "OL") {  
            profileId = 9;
        } else if (profile === "DL") {  
            profileId = 10;
        } else if (profile === "LB") {  
            profileId = 11;
        } else if (profile === "S") {  
            profileId = 12;
        } else if (profile === "CB") { 
            profileId = 13;
        } else {
            profileId = 0;
        }

        // Each row should sum to ~150 (need to include this)
		
		//// create profile for everyposition, update league and draft for proportion and check roster
        profiles = [[10,  10,  10,  10,  10,10,  10,  10,  10,  10,  25,  10,  10,  10,  10,  10,10,10],  // Base 
                    [30, -10, 30,  30,  30,10,   15,   -10,   -10,  -10,  0,   30,   30,  -10,  -10,  -10,0,0],   // Point Gaurd (offense skill)
                    [30,  10,  30,  30,  0,-10,   15,   15,  15,  15,  0,   -10,   -10,  10,  10,   30,10,0],  // Wing (defense field)
                    [-10,  30,  -10, -10, -10,10,  15,  30,  30,   30, 0, -10,  -10,   30, 30, 30,-10,-10],  // Big (linemen)
                    [-10,  -10,  -10, -10, -10, -10,  -10, -10, -10, -10, -10, -10,  -10,  -10,  -10,  -10,-10,50],  // Kicker
                    [-10,  10,  20, 10, 10, 10,  50, 0, 10, 0, -10, 50,  10,  0,  -0,  0,0,0],  // QB 150
                    [40,  40,  10, 10, -10, 10,  -10, 40, 40, 0, 0, -10,  10,  10,  -10,  -10,-10,-10],  // RB  150
                    [10,  40,  10, 10, 10, 10,  20, 20, 40, 0, 0, -10,  30,  30,  -10,  -10,-10,-10],  // TE  150
                    [40,  10,  10, 10, 10, 40,  -10, 0, 20, 0, 0, -10,  50,  10,  -10,  -10,-10,-10],  // WR  150
                    [-40,  40,  10, 10, 10, 30,  20, 20, 30, 0, 0, -10,  -10,  50,  -10,  -10,-10,-10],  // OL  150
                    [10,  40,  10, 10, 10, 20,  0, 0, 0, 40, 30, -10,  -10,  -10,  50,  40,-10,-10],  // DL  150
                    [10,  40,  10, 10, 10, 10,  0, 0, 0, 30, 40, -10,  0,  -10,  30,  40, 20,-10],  // LB  150 last
                    [20,  20,  10, 10, 10, -10,  0, 0, 0, 20, 20, -10,  0,  -10,  10,  30,40,-10],  // S  150 last
                    [30,  10,  10, 10, 10, -10,  0, 0, 0, 10, 10, -10,  0,  -10,  0,  15, 50,-10]];  // CB  150 last
					
        sigmas = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,10,10,10,10];
        baseRating = random.gauss(baseRating, 5);

        rawRatings = [];
        for (i = 0; i < sigmas.length; i++) {
            rawRating = profiles[profileId][i] + baseRating;
            rawRatings[i] = limitRating(random.gauss(rawRating, sigmas[i]));
        }

        ratings = {};
        ratingKeys = ["hgt", "stre", "spd", "jmp", "endu","hnd", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb","cvr","kck"];
        for (i = 0; i < ratingKeys.length; i++) {
            key = ratingKeys[i];
            ratings[key] = rawRatings[i];
        }

        // Ugly hack: Tall people can't dribble/pass very well
    /*    if (ratings.hgt > 40) {
            ratings.drb = limitRating(ratings.drb - (ratings.hgt - 50));
            ratings.pss = limitRating(ratings.pss - (ratings.hgt - 50));
        } else {
            ratings.drb = limitRating(ratings.drb + 10);
            ratings.pss = limitRating(ratings.pss + 10);
        }*/

		

        ratings.season = season;
        ratings.ovr = ovr(ratings);
        ratings.pot = pot;

        ratings.skills = skills(ratings);

        ratings.fuzz = genFuzz(scoutingRank);

        return ratings;
    }

    function name(nationality) {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 90.04);
        for (i = 0; i < names.first.length; i++) {
            if (names.first[i][1] >= fnRand) {
                break;
            }
        }
        fn = names.first[i][0];


        // Last name
        lnRand = random.uniform(0, 77.48);
        for (i = 0; i < names.last.length; i++) {
            if (names.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = names.last[i][0];

        return fn + " " + ln;
    }

    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     * 
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
	 
	 /*
	     
Physical
------
Speed (acceleratino, could be athlete) "hgt", 
Strength "stre",
Endurance "spd", 
Quickness/Athlete/Body Control "jmp", 
Height "endu",
Hands "Hnd"

Mental
--------
GameIQ "ins", 
Toughness    "dnk", 
Awareness/Instincts "ft", 
Aggressiveness "fg",
Motor "tp",

Skill
------
Throwing Accuracy "blk", 
Catching "stl", 
Blocking "drb",
Rushing  "pss", 
Tackling "reb"
Coverage "cvr"
Kick "kck"
	 
	 */
	 
	 
    function pos(ratings) {
        var qb, rb, te, wr, position, ol,dl,lb,cb,s,k,offense,defense;
		var mainRating,safetyRating,tightEndRating,runningBackRating;

        qb = false;
        rb = false;
        te = false;
        wr = false;
        ol = false;
        dl = false;
        lb = false;
        cb = false;
        s = false;
		k = false;
        offense = false;
        defense = false;

        // Default position // make general, then get specific during set up
		if (ratings.drb > ratings.reb) {
				position = 'OL';
		} else {
				position = 'DL';
		}
    /*    if (ratings.blk >= 60) {
            position = 'QB';
        }  else if (ratings.stl >= 60) {
            position = 'WR';
        }  else if (ratings.jmp >= 60) {
			if (ratings.stl >= 30)  {
				position = 'TE';
			} else {
				position = 'RB';
			}
			
        }  else if (ratings.cvr >= 60) {
            position = 'CB';
        }  else if (ratings.drb >= 50) {
			position = 'OL';	

			

        }  else if (ratings.pss >= 40) {
				//position = 'DL';		     
			
		   if (ratings.stre>50) {
				position = 'DL';		     
		   } else {
				position = 'LB';		     
		   }			
			
        }  else if (ratings.kck >= 50) {
  //          position = 'K';
			
		   if (ratings.stre>50) {
				position = 'P';		     
		   } else {
				position = 'K';		     
		   }			
						
			
        } else {
		    if (ratings.spd>50) {
				position = 'CB';
			
			} else if (ratings.stre<30) {
				position = 'S';
			} else {
				position = 'LB';
			}
        }
*/
/*
WR
	
*/	

//// need to have one for RB and include it below
//// also will need TE  (OL/WR)
//// also will need S (CB/LB)  (CB is coverage)


/*	 Toughness    "dnk", 
Awareness/Instincts "ft", 
Speed (acceleratino, could be athlete) "hgt", 
Strength "stre",
Endurance "spd", 
Quickness/Athlete/Body Control "jmp", */

            
	/*		if (((ratings.hgt+ratings.stre)/3 > (ratings.blk+ratings.stl+ratings.drb)) || ((ratings.hgt+ratings.stre)/3 > (ratings.pss+ratings.reb+ratings.cvr))) {
					   position = 'RB';			  				   			
			} else if ( (ratings.blk+ratings.stl+ratings.drb) > (ratings.pss+ratings.reb+ratings.cvr) ) {
			  if ( ((ratings.blk+ratings.stl+ratings.drb)/3) > ratings.kck) {
			     if (ratings.blk > ((ratings.stl+ratings.drb)/2)) {
					   position = 'QB';			  				   
				 } else {
					if (ratings.stl >ratings.drb) {
					      
						if (ratings.stl >ratings.drb*1.5) {
							position = 'WR';			  				   						  
						} else {
							position = 'TE';			  				   						  						  
						}
					} else {
					   position = 'OL';			  				   
					}

				 }
			  
			  } else {
					   position = 'K';			  
			  }
			} else {
			  if ( (ratings.pss+ratings.reb+ratings.cvr)/3 > ratings.kck) {
			  
			     if (ratings.cvr > (ratings.pss+ratings.reb)/2) {

				 		if (ratings.cvr > (ratings.pss+ratings.reb))  {
							position = 'CB';			  				   						  
						} else {
							position = 'S';			  				   						  						  
						}
			  				   
				 } else {
					if (ratings.pss >ratings.reb) {
					   position = 'DL';			  				   
					      
					} else {
					   position = 'LB';			  				   
					}

				 }

			  } else {
					   position = 'K';			  
			  }			
			}
*/


//            runningBackRating = (ratings.dnk+ratings.ft+ratings.hgt+ratings.stre+ratings.spd+ratings.jmp)/6*1.1
            runningBackRating = ((ratings.dnk+ratings.ft+ratings.hgt+ratings.stre+ratings.spd+ratings.jmp)/6);
			safetyRating = ((ratings.reb+ratings.cvr)/2)*1.1;
			tightEndRating = ((ratings.stl+ratings.drb)/2)*1.1;

			if (((ratings.blk>=tightEndRating) && (ratings.blk>=safetyRating) && (ratings.blk>=runningBackRating) &&(ratings.blk>=ratings.stl) && (ratings.blk>=ratings.drb) && (ratings.blk>=ratings.pss) && (ratings.blk>=ratings.reb) && (ratings.blk>=ratings.cvr) && (ratings.blk>=ratings.kck) )){
				qb = true;
			} 

			mainRating = ratings.stl;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) &&(mainRating>ratings.blk) && (mainRating>ratings.drb) && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
				wr = true;
			} 

			mainRating = ratings.drb;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
				ol = true;
			} 

			mainRating = ratings.pss;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
				dl = true;
			} 

			mainRating = ratings.reb; 
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) &&  (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
				lb = true;
			} 
			mainRating = ratings.cvr;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.kck)) ){
				cb = true;
			} 
			mainRating = ratings.kck;
			if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
				 k= true;
			} 	
			mainRating = tightEndRating;
			if (((mainRating>ratings.kck) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
				te = true;
			} 
			mainRating = safetyRating;
			if (((mainRating>ratings.kck) && (mainRating>tightEndRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
				s = true;
			} 		
			mainRating = runningBackRating;
			if (((mainRating>ratings.kck) && (mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
				rb = true;			
			}

              
			 if (qb) {
			   position = 'QB';
			 } else {
					 if (rb) {
					   position = 'RB';
					 }			 
					 if (te) {
					   position = 'TE';
					 } else if (wr) {
					   position = 'WR';
					 }				 
					 /*if (dl) {
					   position = 'DL';
					 }	*/
					 if (lb) {
					   position = 'LB';
					 }		
					 if (s) {
					   position = 'S';
					 }					 
					 if (cb) {
					   position = 'CB';
					 }					 
					 if (k) {
					   position = 'K';
					 }		
			}			 
/*

            runningBackRating = (ratings.dnk+ratings.ft+ratings.hgt+ratings.stre+ratings.spd+ratings.jmp)/6
			safetyRating = ((ratings.reb+ratings.cvr)/2)*1.1;
			tightEndRating = ((ratings.stl+ratings.drb)/2)*1.1;

		    if (((ratings.blk>=tightEndRating) && (ratings.blk>=safetyRating) && (ratings.blk>=runningBackRating) &&(ratings.blk>=ratings.stl) && (ratings.blk>=ratings.drb) && (ratings.blk>=ratings.pss) && (ratings.blk>=ratings.reb) && (ratings.blk>=ratings.cvr) && (ratings.blk>=ratings.kck) )){
				qb = true;
				position = 'QB';				
			} else {
				mainRating = ratings.stl;
				if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) &&(mainRating>ratings.blk) && (mainRating>ratings.drb) && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
					wr = true;
					position = 'WR';				
				} else {	
				
				
					mainRating = ratings.drb;
					if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
						ol = true;
						position = 'OL';				
					} else {	
					
					
					
						mainRating = ratings.pss;
						if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb) && (mainRating>ratings.reb) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
							dl = true;
							position = 'DL';				
						} else {	
						
						
							mainRating = ratings.reb; 
							if (((mainRating>tightEndRating) && (mainRating>safetyRating) &&  (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.cvr) && (mainRating>ratings.kck)) ){
								dl = true;
								position = 'LB';				
						} else {	
								mainRating = ratings.cvr;
								if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.kck)) ){
									dl = true;
									position = 'CB';				
								} else {	
									mainRating = ratings.kck;
									if (((mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
										dl = true;
										position = 'K';				
									} else {	
										mainRating = tightEndRating;
										if (((mainRating>ratings.kck) && (mainRating>safetyRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
											dl = true;
											position = 'TE';				
										} else {	
											mainRating = safetyRating;
											if (((mainRating>ratings.kck) && (mainRating>tightEndRating) && (mainRating>runningBackRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
												dl = true;
												position = 'S';				
											} else {	
												mainRating = runningBackRating;
												if (((mainRating>ratings.kck) && (mainRating>tightEndRating) && (mainRating>safetyRating) && (mainRating>ratings.blk) && (mainRating>ratings.stl) && (mainRating>ratings.drb)  && (mainRating>ratings.pss) && (mainRating>ratings.reb) && (mainRating>ratings.cvr)) ){
													dl = true;
													position = 'RB';				
												}
											}	
										}		
									}			
								}				
							}					
						}
					}			
				}
			}			*/
   /*     rb = false;
        te = false;
        wr = false;
        ol = false;
        dl = false;
        lb = false;
        cb = false;
        s = false;
        offense = false;
        defense = false;*/
		

		
		
		
		
   /*     if (ratings.hgt <= 30 || ratings.spd >= 85) {
            g = true;
            if ((ratings.pss + ratings.drb) >= 100) {
                pg = true;
            }
            if (ratings.hgt >= 30) {
                sg = true;
            }
        }
        if (ratings.hgt >= 50 && ratings.hgt <= 65 && ratings.spd >= 40) {
            sf = true;
        }
        if (ratings.hgt >= 70) {
            pf = true;
        }
        if ((ratings.hgt + ratings.stre) >= 130) {
            c = true;
        }

        if (pg && !sg && !sf && !pf && !c) {
            position = 'PG';
        } else if (!pg && (g || sg) && !sf && !pf && !c) {
            position = 'SG';
        } else if (!pg && !sg && sf && !pf && !c) {
            position = 'SF';
        } else if (!pg && !sg && !sf && pf && !c) {
            position = 'PF';
        } else if (!pg && !sg && !sf && !pf && c) {
            position = 'C';
        }

        // Multiple poss
        if ((pf || sf) && g) {
            position = 'GF';
        } else if (c && (pf || sf)) {
            position = 'FC';
        } else if (pg && sg) {
            position = 'G';
        }
        if (position === 'F' && ratings.drb <= 20) {
            position = 'PF';
        }
*/
        return position;
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
    function addRatingsRow(p, scoutingRank) {
        var key, newRatings, r;

        newRatings = {};
        r = p.ratings.length - 1; // Most recent ratings
        for (key in p.ratings[r]) {
            if (p.ratings[r].hasOwnProperty(key)) {
                newRatings[key] = p.ratings[r][key];
            }
        }
        newRatings.season = g.season;
        newRatings.fuzz = (newRatings.fuzz + genFuzz(scoutingRank)) / 2;
        p.ratings.push(newRatings);

        return p;
    }

    /**
     * Add a new row of stats to a player object.
     * 
     * A row contains stats for unique values of (team, season, playoffs). So new rows need to be added when a player joins a new team, when a new season starts, or when a player's team makes the playoffs. The team ID in p.tid will be used in the stats row, so if a player is changing teams, update p.tid before calling this.
     *
     * @memberOf core.player
     * @param {Object} p Player object.
     * @param {=boolean} playoffs Is this stats row for the playoffs or not? Default false.
     * @return {Object} Updated player object.
     */
    function addStatsRow(p, playoffs) {
        playoffs = playoffs !== undefined ? playoffs : false;
			
        p.stats.push({season: g.season, tid: p.tid, playoffs: playoffs, gp: 0, gs: 0, min: 0, fg: 0, fga: 0, fgAtRim: 0, fgaAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0, trb: 0, ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, per: 0, ewa: 0, tgts: 0, ols: 0, olr: 0, olp: 0, olry: 0, olpy: 0, olc: 0, oltd: 0, der: 0, dep: 0, dery: 0, depy: 0, dec: 0, detd: 0,prp:0,fdt:0,fdp:0,fdr:0,ty:0,syl:0,tda:0,tdf:0,rztd:0,rza:0,top:0,fbl:0,fbll:0,fblr:0,fbltd:0,inter:0,intery:0,intertd:0,pen:0,peny:0,qr:0,qbr:0,war:0,warr:0,warp:0,warre:0,ward:0,warol:0,wardl:0,pr:0,pry:0,prtd:0,kr:0,kry:0,krtd:0,kol:0,koa:0,koav:0,koy:0,rushl:0,rusha:0,recl:0,reca:0,passa:0,prl:0,pra:0,krl:0,kra:0,fgl:0,fgat:0,puntl:0,punta:0,tdp:0,intp:0,pya:0,sackp:0,apya:0,pyc:0,pyg:0,bya:0,abya:0,ruya:0,ruag:0,ruyg:0,reyc:0,reyg:0,recg:0,reyt:0,olary:0,olapy:0,olrp:0,olrmp:0,olrmpg:0,olrmpa:0,puntay:0,fldgp:0,exptp:0,fldgze:0,fldgtw:0,fldgth:0,fldgfo:0,fldgfi:0,puntty:0,punttb:0,fldgzea:0,fldgtwa:0,fldgtha:0,fldgfoa:0,fldgfia:0,fldgzep:0,fldgtwp:0,fldgthp:0,fldgfop:0,fldgfip:0,dera:0,depa:0,derpa:0,derpag:0,derpatp:0,turn:0,turnopp:0,oppfumble:0,tottd:0,opptd:0,opptdp:0,opptdr:0,oppfd:0,oppfdp:0,oppfdr:0,opppasa:0,opppasc:0,depc:0});
        p.statsTids.push(p.tid);
        p.statsTids = _.uniq(p.statsTids);

        return p;
    }

    function generate(tid, age, profile, baseRating, pot, draftYear, newLeague, scoutingRank) {
        var maxHgt, minHgt, maxWeight, minWeight, nationality, p;

        p = {}; // Will be saved to database
        p.tid = tid;
        p.statsTids = [];
        p.stats = [];
        if (tid >= 0) {
            // This only happens when generating random players for a new league, as otherwis tid would be negative (draft prospect)
            addStatsRow(p, false);
        }
        p.rosterOrder = 666;  // Will be set later
        p.ratings = [];
        if (newLeague) {
            // Create player for new league
            p.ratings.push(genRatings(profile, baseRating, pot, g.startingSeason, scoutingRank));
        } else {
            // Create player to be drafted
            p.ratings.push(genRatings(profile, baseRating, pot, draftYear, scoutingRank));
        }

        if (tid === g.PLAYER.UNDRAFTED_2) {
            p.ratings[0].fuzz *= 2;
        } else if (tid === g.PLAYER.UNDRAFTED_3) {
            p.ratings[0].fuzz *= 4;
        }

		//http://www.sprayberryfootball.com/page/show/292837-nfl-player-specs
        minHgt = 68;  // 5'8"
        maxHgt = 82;  // 6'10"
        minWeight = 150;
        maxWeight = 290;

        p.pos = pos(p.ratings[0]);  // Position (PG, SG, SF, PF, C, G, GF, FC)
		
		if (p.pos == "QB") {
			minHgt = 71;  // 5'11"
			maxHgt = 78;  // 7'1"
			minWeight = 190;
			maxWeight = 240;
		} else if ((p.pos == "CB") || (p.pos == "S")  || (p.pos == "WR"))  {
			minHgt = 67;  // 5'7"
			maxHgt = 76;  // 6'4"
			minWeight = 190;
			maxWeight = 240;
		} else if (p.pos == "LB") {
			minHgt = 70;  // 5'10"
			maxHgt = 77;  // 6'5"
			minWeight = 210;
			maxWeight = 260;
		} else if (p.pos == "RB") {
			minHgt = 67;  // 5'7"
			maxHgt = 76;  // 6'4"
			minWeight = 190;
			maxWeight = 240;
		} else if (p.pos == "TE") {
			minHgt = 70;  // 5'10"
			maxHgt = 78;  // 6'6"
			minWeight = 230;
			maxWeight = 270;
		} else if (p.pos == "DL") {
			minHgt = 71;  // 5'11"
			maxHgt = 78;  // 6'6"
			minWeight = 230;
			maxWeight = 330;
		} else if (p.pos == "OL") {
			minHgt = 71;  // 5'11"
			maxHgt = 78;  // 6'6"
			minWeight = 270;
			maxWeight = 340;
		} else if (p.pos == "K") {
			minHgt = 68;  // 5'8"
			maxHgt = 76;  // 6'4"
			minWeight = 160;
			maxWeight = 220;
		}		
		
        p.hgt = Math.round(random.randInt(-2, 2) + p.ratings[0].endu * (maxHgt - minHgt) / 100 + minHgt);  // Height in inches (from minHgt to maxHgt)
        p.weight = Math.round(random.randInt(-20, 20) + (p.ratings[0].endu + 0.5 * p.ratings[0].stre) * (maxWeight - minWeight) / 150 + minWeight);  // Weight in pounds (from minWeight to maxWeight)

        if ((p.pos == "QB") || (p.pos == "RB") || (p.pos == "TE")  || (p.pos == "WR")  || (p.pos == "OL")) {
            p.offDefK = "off";
        } else if (p.pos == "K") {
            p.offDefK = "k";
        } else {
            p.offDefK = "def";
        }
//        p.active = Math.random() < 0.75 ? true : false; // Delete after real roster ordering AI exists
//        p.active = true; // Delete after real roster ordering AI exists
        p.active = false; // Delete after real roster ordering AI exists

        // Randomly choose nationality  
        nationality = 'USA';
        p.born = {
            year: g.season - age,
            loc: nationality
        };

        p.name = name(nationality);
        p.college = "";
        p.imgURL = ""; // Custom rosters can define player image URLs to be used rather than vector faces

        p.salaries = [];
        p = setContract(p, genContract(p), false);

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

        p.face = faces.generate();
        p.injury = {type: "Healthy", gamesRemaining: 0};

        p.ptModifier = 1;

        p.hof = false;
        p.watch = false;
        p.gamesUntilTradable = 0;

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
    function injury(healthRank) {
        var i, rand, type;

        rand = random.uniform(0, 10882);
        for (i = 0; i < injuries.cumSum.length; i++) {
            if (injuries.cumSum[i] >= rand) {
                break;
            }
        }
        return {
            type: injuries.types[i],
            gamesRemaining: Math.round((0.7 * (healthRank - 1) / (g.numTeams - 1) + 0.65)  * random.uniform(0.25, 1.75) * injuries.gamesRemainings[i])
        };
    }

    /**
     * Filter a player object (or an array of player objects) by removing/combining/processing some components.
     *
     * This can be used to retrieve information about a certain season, compute average statistics from the raw data, etc.
     *
     * For a player object (p), create an object suitible for output based on the appropriate options, most notably a options.season and options.tid to find rows in of stats and ratings, and options.attributes, options.stats, and options.ratings to extract teh desired information. In the output, the attributes keys will be in the root of the object. There will also be stats and ratings properties containing filtered stats and ratings objects.
     * 
     * If options.season is undefined, then the stats and ratings objects will contain lists of objects for each season and options.tid is ignored. Then, there will also be a careerStats property in the output object containing an object with career averages.
     *
     * There are several more options (all described below) which can make things pretty complicated, but most of the time, they are not needed.
     * 
     * @memberOf core.player
     * @param {Object|Array.<Object>} p Player object or array of player objects to be filtered.
     * @param {Object} options Options, as described below.
     * @param {number=} options.season Season to retrieve stats/ratings for. If undefined, return stats/ratings for all seasons in a list as well as career totals in player.careerStats.
     * @param {number=} options.tid Team ID to retrieve stats for. This is useful in the case where a player played for multiple teams in a season. Eventually, there should be some way to specify whether the stats for multiple teams in a single season should be merged together or not. For now, if this is undefined, it just picks the first entry, which is clearly wrong.
     * @param {Array.<string>=} options.attrs List of player attributes to include in output.
     * @param {Array.<string>=} options.ratings List of player ratings to include in output.
     * @param {Array.<string>=} options.stats List of player stats to include in output.
     * @param {boolean=} options.totals Boolean representing whether to return total stats (true) or per-game averages (false); default is false.
     * @param {boolean=} options.playoffs Boolean representing whether to return playoff stats (statsPlayoffs and careerStatsPlayoffs) or not; default is false. Either way, regular season stats are always returned.
     * @param {boolean=} options.showNoStats When true, players are returned with zeroed stats objects even if they have accumulated no stats for a team (such as  players who were just traded for, free agents, etc.); this applies only for regular season stats. Even when this is true, undefined will still be returned if a season is requested from before they entered the league. To show draft prospects, options.showRookies is needed. Default is false, but if options.stats is empty, this is always true.
     * @param {boolean=} options.showRookies If true (default false), then future draft prospects and rookies drafted in the current season (g.season) are shown if that season is requested. This is mainly so, after the draft, rookies can show up in the roster, player ratings view, etc; and also so prospects can be shown in the watch list. After the next season starts, then they will no longer show up in a request for that season since they didn't actually play that season.
     * @param {boolean=} options.showRetired If true (default false), then players with no ratings for the current season are still returned, with either 0 for every rating and a blank array for skills (retired players) or future ratings (draft prospects). This is currently only used for the watch list, so retired players (and future draft prospects!) can still be watched.
     * @param {boolean=} options.fuzz When true (default false), noise is added to any returned ratings based on the fuzz variable for the given season (default: false); any user-facing rating should use true, any non-user-facing rating should use false.
     * @param {boolean=} options.oldStats When true (default false), stats from the previous season are displayed if there are no stats for the current season. This is currently only used for the free agents list, so it will either display stats from this season if they exist, or last season if they don't.
     * @param {number=} options.numGamesRemaining If the "cashOwed" attr is requested, options.numGamesRemaining is used to calculate how much of the current season's contract remains to be paid. This is used for buying out players.
     * @return {Object|Array.<Object>} Filtered player object or array of filtered player objects, depending on the first argument.
     */
    function filter(p, options) {
        var filterAttrs, filterRatings, filterStats, filterStatsPartial, fp, fps, gatherStats, i, returnOnePlayer;

        returnOnePlayer = false;
        if (!_.isArray(p)) {
            p = [p];
            returnOnePlayer = true;
        }

        options = options !== undefined ? options : {};
        options.season = options.season !== undefined ? options.season : null;
        options.tid = options.tid !== undefined ? options.tid : null;
        options.attrs = options.attrs !== undefined ? options.attrs : [];
        options.stats = options.stats !== undefined ? options.stats : [];
        options.ratings = options.ratings !== undefined ? options.ratings : [];
        options.totals = options.totals !== undefined ? options.totals : false;
        options.playoffs = options.playoffs !== undefined ? options.playoffs : false;
        options.showNoStats = options.showNoStats !== undefined ? options.showNoStats : false;
        options.showRookies = options.showRookies !== undefined ? options.showRookies : false;
        options.showRetired = options.showRetired !== undefined ? options.showRetired : false;
        options.fuzz = options.fuzz !== undefined ? options.fuzz : false;
        options.oldStats = options.oldStats !== undefined ? options.oldStats : false;
        options.numGamesRemaining = options.numGamesRemaining !== undefined ? options.numGamesRemaining : 0;
        options.per36 = options.per36 !== undefined ? options.per36 : false;

        // If no stats are requested, force showNoStats to be true since the stats will never be checked otherwise.
        if (options.stats.length === 0) {
            options.showNoStats = true;
        }

        // Copys/filters the attributes listed in options.attrs from p to fp.
        filterAttrs = function (fp, p, options) {
            var award, awardsGroupedTemp, i, j;

            for (i = 0; i < options.attrs.length; i++) {
                if (options.attrs[i] === "age") {
                    fp.age = g.season - p.born.year;
                } else if (options.attrs[i] === "draft") {
                    fp.draft = p.draft;
                    fp.draft.age = p.draft.year - p.born.year;
                    if (options.fuzz) {
                        fp.draft.ovr =  Math.round(helpers.bound(fp.draft.ovr + p.ratings[0].fuzz, 0, 100));
                        fp.draft.pot =  Math.round(helpers.bound(fp.draft.pot + p.ratings[0].fuzz, 0, 100));
                    }
                    // Inject abbrevs
                    fp.draft.abbrev = g.teamAbbrevsCache[fp.draft.tid];
                    fp.draft.originalAbbrev = g.teamAbbrevsCache[fp.draft.originalTid];
                } else if (options.attrs[i] === "hgtFt") {
                    fp.hgtFt = Math.floor(p.hgt / 12);
                } else if (options.attrs[i] === "hgtIn") {
                    fp.hgtIn = p.hgt - 12 * Math.floor(p.hgt / 12);
                } else if (options.attrs[i] === "contract") {
                    fp.contract = helpers.deepCopy(p.contract);  // [millions of dollars]
                    fp.contract.amount = fp.contract.amount / 1000;  // [millions of dollars]
                } else if (options.attrs[i] === "cashOwed") {
                    fp.cashOwed = contractSeasonsRemaining(p.contract.exp, options.numGamesRemaining) * p.contract.amount / 1000;  // [millions of dollars]
                } else if (options.attrs[i] === "abbrev") {
                    fp.abbrev = helpers.getAbbrev(p.tid);
                } else if (options.attrs[i] === "teamRegion") {
                    if (p.tid >= 0) {
                        fp.teamRegion = g.teamRegionsCache[p.tid];
                    } else {
                        fp.teamRegion = "";
                    }
                } else if (options.attrs[i] === "teamName") {
                    if (p.tid >= 0) {
                        fp.teamName = g.teamNamesCache[p.tid];
                    } else if (p.tid === g.PLAYER.FREE_AGENT) {
                        fp.teamName = "Free Agent";
                    } else if (p.tid === g.PLAYER.UNDRAFTED || p.tid === g.PLAYER.UNDRAFTED_2 || p.tid === g.PLAYER.UNDRAFTED_3 || p.tid === g.PLAYER.UNDRAFTED_FANTASY_TEMP) {
                        fp.teamName = "Draft Prospect";
                    } else if (p.tid === g.PLAYER.RETIRED) {
                        fp.teamName = "Retired";
                    }
                } else if (options.attrs[i] === "injury" && options.season !== null && options.season < g.season) {
                    fp.injury = {type: "Healthy", gamesRemaining: 0};
                } else if (options.attrs[i] === "salaries") {
                    fp.salaries = _.map(p.salaries, function (salary) { salary.amount /= 1000; return salary; });
                } else if (options.attrs[i] === "salariesTotal") {
                    fp.salariesTotal = _.reduce(fp.salaries, function (memo, salary) { return memo + salary.amount; }, 0);
                } else if (options.attrs[i] === "value") {
                    fp.value = value(p);
                } else if (options.attrs[i] === "valueNoPot") {
                    fp.valueNoPot = value(p, {noPot: true, fuzz: options.fuzz});
                } else if (options.attrs[i] === "awardsGrouped") {
                    fp.awardsGrouped = [];
                    awardsGroupedTemp = _.groupBy(p.awards, function (award) { return award.type; });
                    for (award in awardsGroupedTemp) {
                        if (awardsGroupedTemp.hasOwnProperty(award)) {
                            fp.awardsGrouped.push({
                                type: award,
                                count: awardsGroupedTemp[award].length,
                                seasons: _.pluck(awardsGroupedTemp[award], "season")
                            });
                        }
                    }
                } else if (options.attrs[i] === "yearsWithTeam") {
                    fp.yearsWithTeam = 0;
                    // Count non-playoff seasons starting from the current one
                    for (j = p.stats.length - 1; j >= 0; j--) {
                        if (p.stats[j].playoffs === false) { // Can do this because any playoff entry follows a regular season entry with the same team
                            if (p.stats[j].tid === p.tid && options.season === p.stats[j].season) {
                                // Find season requested
                                fp.yearsWithTeam = 1;
                            } else {
                                if (fp.yearsWithTeam) {
                                    // We found the season requested, so now count back until you find another team
                                    if (p.stats[j].tid === p.tid) {
                                        fp.yearsWithTeam += 1;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                } else if (options.attrs[i] === "watch") {
                    // This is needed for old player objects without the watch property
                    if (p.watch !== undefined && typeof p.watch !== "function") { // In Firefox, objects have a "watch" function
                        fp.watch = p.watch;
                    } else {
                        fp.watch = false;
                    }
                } else {
                    fp[options.attrs[i]] = p[options.attrs[i]];
                }
            }
        };

        // Copys/filters the ratings listed in options.ratings from p to fp.
        filterRatings = function (fp, p, options) {
            var cat, hasStats, i, j, k, kk, pr, tidTemp;

            if (options.season !== null) {
                // One season
                pr = null;
                for (j = 0; j < p.ratings.length; j++) {
                    if (p.ratings[j].season === options.season) {
                        pr = p.ratings[j];
                        break;
                    }
                }
                if (pr === null) {
                    // Must be retired, or not in the league yet
                    if (options.showRetired && p.tid === g.PLAYER.RETIRED) {
                        // If forcing to show retired players, blank it out
                        fp.ratings = {};
                        for (k = 0; k < options.ratings.length; k++) {
                            if (options.ratings[k] === "skills") {
                                fp.ratings[options.ratings[k]] = [];
                            } else {
                                fp.ratings[options.ratings[k]] = 0;
                            }
                        }
                        return true;
                    } else if (options.showRetired && (p.tid === g.PLAYER.UNDRAFTED || p.tid === g.PLAYER.UNDRAFTED_2 || p.tid === g.PLAYER.UNDRAFTED_3)) {
                        // What not show draft prospects too? Just for fun.
                        pr = p.ratings[0]; // Only has one entry
                    } else {
                        return false;
                    }
                }

                if (options.ratings.length > 0) {
                    fp.ratings = {};
                    for (k = 0; k < options.ratings.length; k++) {
                        fp.ratings[options.ratings[k]] = pr[options.ratings[k]];
                        if (options.ratings[k] === "dovr" || options.ratings[k] === "dpot" || options.ratings[k] === "dhgt" || options.ratings[k] === "dstre" || options.ratings[k] === "dspd" || options.ratings[k] === "djmp" || options.ratings[k] === "dendu" || options.ratings[k] === "dblk" || options.ratings[k] === "dstl" || options.ratings[k] === "ddrb" || options.ratings[k] === "dpss" || options.ratings[k] === "dreb" || options.ratings[k] === "dins" || options.ratings[k] === "ddnk" || options.ratings[k] === "dft" || options.ratings[k] === "dfg" || options.ratings[k] === "dtp" || options.ratings[k] === "dhnd" || options.ratings[k] === "dcvr" || options.ratings[k] === "dkck") {
  						
//                        if (options.ratings[k] === "dovr" || options.ratings[k] === "dpot") {
                            // Handle dovr and dpot - if there are previous ratings, calculate the fuzzed difference
                            cat = options.ratings[k].slice(1); // either ovr or pot
                            if (j > 0) {
                                fp.ratings[options.ratings[k]] = Math.round(helpers.bound(p.ratings[j][cat] + p.ratings[j].fuzz, 0, 100)) - Math.round(helpers.bound(p.ratings[j - 1][cat] + p.ratings[j - 1].fuzz, 0, 100));
                            } else {
                                fp.ratings[options.ratings[k]] = 0;
                            }
                        } else if (options.fuzz && options.ratings[k] !== "fuzz" && options.ratings[k] !== "season" && options.ratings[k] !== "skills" && options.ratings[k] !== "hgt") {
                            fp.ratings[options.ratings[k]] = Math.round(helpers.bound(fp.ratings[options.ratings[k]] + pr.fuzz, 0, 100));
                        }
                    }
                }
            } else {
                // All seasons
                fp.ratings = [];
                for (k = 0; k < p.ratings.length; k++) {
                    // If a specific tid was requested, only return ratings if a stat was accumulated for that tid
                    if (options.tid !== null) {
                        hasStats = false;
                        for (j = 0; j < p.stats.length; j++) {
                            if (options.tid === p.stats[j].tid && p.ratings[k].season === p.stats[j].season) {
                                hasStats = true;
                                break;
                            }
                        }
                        if (!hasStats) {
                            continue;
                        }
                    }

                    kk = fp.ratings.length; // Not always the same as k, due to hasStats filtering above
                    fp.ratings[kk] = {};
                    for (j = 0; j < options.ratings.length; j++) {
                        if (options.ratings[j] === "age") {
                            fp.ratings[kk].age = p.ratings[k].season - p.born.year;
                        } else if (options.ratings[j] === "abbrev") {
                            // Find the last stats entry for that season, and use that to determine the team
                            for (i = 0; i < p.stats.length; i++) {
                                if (p.stats[i].season === p.ratings[k].season && p.stats[i].playoffs === false) {
                                    tidTemp = p.stats[i].tid;
                                }
                            }
                            if (tidTemp >= 0) {
                                fp.ratings[kk].abbrev = helpers.getAbbrev(tidTemp);
                                tidTemp = undefined;
                            } else {
                                fp.ratings[kk].abbrev = null;
                            }
                        } else {
                            fp.ratings[kk][options.ratings[j]] = p.ratings[k][options.ratings[j]];
                            if (options.fuzz && options.ratings[j] !== "fuzz" && options.ratings[j] !== "season" && options.ratings[j] !== "skills" && options.ratings[j] !== "hgt") {
                                fp.ratings[kk][options.ratings[j]] = Math.round(helpers.bound(p.ratings[k][options.ratings[j]] + p.ratings[k].fuzz, 0, 100));
                            }
                        }
                    }
                }
            }

            return true;
        };

        // Returns stats object, containing properties "r" for regular season, "p" for playoffs, and "cr"/"cp" for career. "r" and "p" can be either objects (single season) or arrays of objects (multiple seasons). All these outputs are raw season totals, not per-game averages.
        gatherStats = function (p, options) {
            var ignoredKeys, j, key, ps;

            ps = {};

            if (options.stats.length > 0) {
                if (options.season !== null) {
                    // Single season
                    ps.r = {}; // Regular season
                    ps.p = {}; // Playoffs
                    if (options.tid !== null) {
                        // Get stats for a single team
                        for (j = 0; j < p.stats.length; j++) {
                            if (p.stats[j].season === options.season && p.stats[j].playoffs === false && p.stats[j].tid === options.tid) {
                                ps.r = p.stats[j];
                            }
                            if (options.playoffs && p.stats[j].season === options.season && p.stats[j].playoffs === true && p.stats[j].tid === options.tid) {
                                ps.p = p.stats[j];
                            }
                        }
                    } else {
                        // Get stats for all teams - eventually this should imply adding together multiple stats objects rather than just using the first?
                        for (j = 0; j < p.stats.length; j++) {
                            if (p.stats[j].season === options.season && p.stats[j].playoffs === false) {
                                ps.r = p.stats[j];
                            }
                            if (options.playoffs && p.stats[j].season === options.season && p.stats[j].playoffs === true) {
                                ps.p = p.stats[j];
                            }
                        }
                    }

                    // Load previous season if no stats this year and options.oldStats set
                    if (options.oldStats && _.isEmpty(ps.r)) {
                        for (j = 0; j < p.stats.length; j++) {
                            if (p.stats[j].season === g.season - 1 && p.stats[j].playoffs === false) {
                                ps.r = p.stats[j];
                            }
                            if (options.playoffs && p.stats[j].season === g.season - 1 && p.stats[j].playoffs === true) {
                                ps.p = p.stats[j];
                            }
                        }
                    }
                } else {
                    // Multiple seasons
                    ps.r = []; // Regular season
                    ps.p = []; // Playoffs
                    for (j = 0; j < p.stats.length; j++) {
                        // Save stats for the requested tid, or any tid if no tid was requested
                        if (options.tid === null || options.tid === p.stats[j].tid) {
                            if (p.stats[j].playoffs === false) {
                                ps.r.push(p.stats[j]);
                            } else if (options.playoffs) {
                                ps.p.push(p.stats[j]);
                            }
                        }
                    }

                    // Career totals
                    ps.cr = {}; // Regular season
                    ps.cp = {}; // Playoffs
                    if (ps.r.length > 0) {
                        // Aggregate annual stats and ignore other things
                        ignoredKeys = ["age", "playoffs", "season", "tid"];
                        for (key in ps.r[0]) {
                            if (ps.r[0].hasOwnProperty(key)) {
                                if (ignoredKeys.indexOf(key) < 0) {
                                    ps.cr[key] = _.reduce(_.pluck(ps.r, key), function (memo, num) { return memo + num; }, 0);
                                    if (options.playoffs) {
                                        ps.cp[key] = _.reduce(_.pluck(ps.p, key), function (memo, num) { return memo + num; }, 0);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return ps;
        };

        // Filters s by stats (which should be options.stats) and returns a filtered object. This is to do one season of stats filtering.
        filterStatsPartial = function (p, s, stats) {
            var j, row;
			var qbrA,qbrB,qbrC,qbrD;
            row = {};

            if (!_.isEmpty(s) && s.gp > 0) {
                for (j = 0; j < stats.length; j++) {
                    if (stats[j] === "gp") {
                        row.gp = s.gp;
                    } else if (stats[j] === "gs") {
                        row.gs = s.gs;
                    } else if (stats[j] === "fgp") {
                        if (s.fga > 0) {
                            row.fgp = 100 * s.fg / s.fga;
                        } else {
                            row.fgp = 0;
                        }
                    } else if (stats[j] === "tdp") {
                        if (s.fga > 0) {
                            row.tdp = 100 * s.blk / s.fga;
                        } else {
                            row.tdp = 0;
                        }
                    } else if (stats[j] === "intp") {
                        if (s.fga > 0) {
                            row.intp = 100 * s.inter / s.fga;
                        } else {
                            row.intp = 0;
                        }
                    } else if (stats[j] === "olrmp") {
                        if (s.olrp > 0) {
                            row.olrmp =  (s.olr-s.olp);
                        } else {
                            row.olrmp = 0;
                        }
                    } else if (stats[j] === "olrmpg") {
                        if (s.olrp > 0) {
                            row.olrmpg =  (s.olr-s.olp)/s.gp;
                        } else {
                            row.olrmpg = 0;
                        }
                    } else if (stats[j] === "olrmpa") {
                        if (s.olrp > 0) {
                            row.olrmpa =  (s.olr-s.olp)/s.olc;
                        } else {
                            row.olrmpa = 0;
                        }
						
                    } else if (stats[j] === "olary") {
                        if (s.olr > 0) {
                            row.olary =  s.olry / s.olr;
                        } else {
                            row.olary = 0;
                        }
                    } else if (stats[j] === "olapy") {
                        if (s.olp > 0) {
                            row.olapy =  s.olpy / s.olp;
                        } else {
                            row.olapy = 0;
                        }						
                    } else if (stats[j] === "ruya") {
                        if (s.tov > 0) {
                            row.ruya =  s.drb / s.tov;
                        } else {
                            row.ruya = 0;
                        }
                    } else if (stats[j] === "ruyg") {
                        if (s.tov > 0) {
                            row.ruyg =  (s.drb) / s.gp;
                        } else {
                            row.ruyg = 0;
                        }
                    } else if (stats[j] === "ruag") {
                        if (s.tov > 0) {
                            row.ruag =  (s.tov) / s.gp;
                        } else {
                            row.ruag = 0;
                        }
                    } else if (stats[j] === "reyc") {
                        if (s.ast > 0) {
                            row.reyc =  s.orb / s.ast;
                        } else {
                            row.reyc = 0;
                        }
                    } else if (stats[j] === "reyt") {
                        if (s.ast > 0) {
                            row.reyt =  s.orb / s.tgts;
                        } else {
                            row.reyt = 0;
                        }
                    } else if (stats[j] === "reyg") {
                        if (s.ast > 0) {
                            row.reyg =  (s.orb) / s.gp;
                        } else {
                            row.reyg = 0;
                        }
                    } else if (stats[j] === "recg") {
                        if (s.ast > 0) {
                            row.recg =  (s.ast) / s.gp;
                        } else {
                            row.recg = 0;
                        }
						
                    } else if (stats[j] === "pya") {
                        if (s.fga > 0) {
                            row.pya =  s.stl / s.fga;
                        } else {
                            row.pya = 0;
                        }
                    } else if (stats[j] === "apya") {
                        if (s.fga > 0) {
                            row.apya =  (s.stl+s.blk*20-s.inter*45) / s.fga;
                        } else {
                            row.apya = 0;
                        }
                    } else if (stats[j] === "pyg") {
                        if (s.fga > 0) {
                            row.pyg =  (s.stl) / s.gp;
                        } else {
                            row.pyg = 0;
                        }
                    } else if (stats[j] === "pyc") {
                        if (s.fga > 0) {
                            row.pyc =  (s.stl) / s.fg;
                        } else {
                            row.pyc = 0;
                        }
                    } else if (stats[j] === "bya") {
                        if (s.fga > 0) {
                            row.bya =  (s.stl+s.syl) / (s.fga-s.tp);
                        } else {
                            row.bya = 0;
                        }
                    } else if (stats[j] === "abya") {
                        if (s.fga > 0) {
                            row.abya =  (s.stl+s.syl+s.blk*20-s.inter*45) / (s.fga-s.tp);
                        } else {
                            row.abya = 0;
                        }
                    } else if (stats[j] === "sackp") {
                        if (s.fga > 0) {
                            row.sackp = 100 * s.tp / s.fga;
                        } else {
                            row.sackp = 0;
                        }
                    } else if (stats[j] === "puntay") {
                        if (s.punta > 0) {
                            row.puntay =  (s.puntty) / s.punta;
                        } else {
                            row.puntay = 0;
                        }
                    } else if (stats[j] === "dera") {
                        if (s.der > 0) {
                            row.dera =  (s.dery) / s.der;
                        } else {
                            row.dera = 0;
                        }
                    } else if (stats[j] === "depa") {
                        if (s.dep > 0) {
                            row.depa =  (s.depy) / s.dep;
                        } else {
                            row.depa = 0;
                        }
                    } else if (stats[j] === "derpa") {
                        //if (s.dep > 0) {
                            row.derpa =  s.dep+s.der;
                        //} else {
                            //row.derpa = 0;
                        //}
                    } else if (stats[j] === "derpag") {
                        if (s.gp > 0) {
                            row.derpag =  (s.dep+s.der) / s.gp;
                        } else {
                            row.derpag = 0;
                        }
                    } else if (stats[j] === "derpatp") {
                        if (s.dec > 0) {
                            row.derpatp =  (s.dep+s.der) / s.dec;
                        } else {
                            row.derpatp = 0;
                        }
						
                    } else if (stats[j] === "qbr") {
                        if (s.fga > 0) {
						    qbrA = ((s.fg/s.fga)-.3)*5;
							if (qbrA < 0) {
							  qbrA = 0;
							} else if (qbrA>2.375) {
							  qbrA = 2.375;
							}
						    qbrB = ((s.stl/s.fga)-3)*.25;
							if (qbrB < 0) {
							  qbrB = 0;
							} else if (qbrB>2.375) {
							  qbrB = 2.375;
							}
						    qbrC = (s.blk/s.fga)*20;
							if (qbrC < 0) {
							  qbrC = 0;
							} else if (qbrC>2.375) {
							  qbrC = 2.375;
							}
							qbrD = (2.375-((s.inter/s.fga)*25));
							if (qbrD < 0) {
							  qbrD = 0;
							} else if (qbrD>2.375) {
							  qbrD = 2.375;
							}
						//	console.log("qbr: "+row.qbr);							
                            row.qbr = (qbrA+qbrB+qbrC+qbrD)/6*100;
                        } else {
                            row.qbr = 0;
                        }
                    } else if (stats[j] === "fldgfip") {
                        if (s.fldgfia > 0) {
                            row.fldgfip = 100 * s.fldgfi / s.fldgfia;
                        } else {
                            row.fldgfip = 0;
                        }
                    } else if (stats[j] === "fldgfop") {
                        if (s.fldgfoa > 0) {
                            row.fldgfop = 100 * s.fldgfo / s.fldgfoa;
                        } else {
                            row.fldgfop = 0;
                        }
                    } else if (stats[j] === "fldgthp") {
                        if (s.fldgtha > 0) {
                            row.fldgthp = 100 * s.fldgth / s.fldgtha;
                        } else {
                            row.fldgthp = 0;
                        }
                    } else if (stats[j] === "fldgtwp") {
                        if (s.fldgtwa > 0) {
                            row.fldgtwp = 100 * s.fldgtw / s.fldgtwa;
                        } else {
                            row.fldgtwp = 0;
                        }
						
                    } else if (stats[j] === "fldgzep") {
                        if (s.fldgzea > 0) {
                            row.fldgzep = 100 * s.fldgze / s.fldgzea;
                        } else {
                            row.fldgzep = 0;
                        }
                    } else if (stats[j] === "fgpAtRim") {
                        if (s.fgaAtRim > 0) {
                            row.fgpAtRim = 100 * s.fgAtRim / s.fgaAtRim;
                        } else {
                            row.fgpAtRim = 0;
                        }
                    } else if (stats[j] === "fgpLowPost") {
                        if (s.fgaLowPost > 0) {
                            row.fgpLowPost = 100 * s.fgLowPost / s.fgaLowPost;
                        } else {
                            row.fgpLowPost = 0;
                        }
                    } else if (stats[j] === "fgpMidRange") {
                        if (s.fgaMidRange > 0) {
                            row.fgpMidRange = 100 * s.fgMidRange / s.fgaMidRange;
                        } else {
                            row.fgpMidRange = 0;
                        }
                    } else if (stats[j] === "tpp") {
                        if (s.tpa > 0) {
                            row.tpp = 100 * s.tp / s.tpa;
                        } else {
                            row.tpp = 0;
                        }
                    } else if (stats[j] === "ftp") {
                        if (s.fta > 0) {
                            row.ftp = 100 * s.ft / s.fta;
                        } else {
                            row.ftp = 0;
                        }
                    } else if (stats[j] === "season") {
                        row.season = s.season;
                    } else if (stats[j] === "age") {
                        row.age = s.season - p.born.year;
                    } else if (stats[j] === "abbrev") {
                        row.abbrev = helpers.getAbbrev(s.tid);
                    } else if (stats[j] === "tid") {
                        row.tid = s.tid;
                    } else if (stats[j] === "per") {
                        row.per = s.per;
                    } else if (stats[j] === "ewa") {
                        row.ewa = s.ewa;
                    } else {
                        if (options.totals) {
                            row[stats[j]] = s[stats[j]];
                        } else if (options.per36 && stats[j] !== "min") { // Don't scale min by 36 minutes
                            row[stats[j]] = s[stats[j]] * 36 / s.min;
                        } else {
                            row[stats[j]] = s[stats[j]];
                        }
                    }
                }
            } else {
                for (j = 0; j < stats.length; j++) {
                    if (stats[j] === "season") {
                        row.season = s.season;
                    } else if (stats[j] === "age") {
                        row.age = s.season - p.born.year;
                    } else if (stats[j] === "abbrev") {
                        row.abbrev = helpers.getAbbrev(s.tid);
                    } else {
                        row[stats[j]] = 0;
                    }
                }
            }

            return row;
        };

        // Copys/filters the stats listed in options.stats from p to fp. If no stats are found for the supplied settings, then fp.stats remains undefined.
        filterStats = function (fp, p, options) {
            var i, ps;

            ps = gatherStats(p, options);

            // Always proceed for options.showRookies; proceed if we found some stats (checking for empty objects or lists); proceed if options.showNoStats
            if ((options.showRookies && p.draft.year >= g.season && (options.season === g.season || options.season === null)) || (!_.isEmpty(ps) && !_.isEmpty(ps.r)) || (options.showNoStats && (options.season > p.draft.year || options.season === null))) {
                if (options.season === null && options.stats.length > 0) {
                    if (!_.isEmpty(ps) && !_.isEmpty(ps.r)) {
                        // Multiple seasons, only show if there is data
                        fp.stats = [];
                        for (i = 0; i < ps.r.length; i++) {
                            fp.stats.push(filterStatsPartial(p, ps.r[i], options.stats));
                        }
                        if (options.playoffs) {
                            fp.statsPlayoffs = [];
                            for (i = 0; i < ps.p.length; i++) {
                                fp.statsPlayoffs.push(filterStatsPartial(p, ps.p[i], options.stats));
                            }
                        }
                    }

                    // Career totals
                    fp.careerStats = filterStatsPartial(p, ps.cr, options.stats);
                    // Special case for PER - weight by minutes per season
                    if (options.totals) {
                        fp.careerStats.per = _.reduce(ps.r, function (memo, psr) { return memo + psr.per * psr.min; }, 0) / (fp.careerStats.min);
                    } else {
                        fp.careerStats.per = _.reduce(ps.r, function (memo, psr) { return memo + psr.per * psr.min; }, 0) / (fp.careerStats.min * fp.careerStats.gp);
                    }
                    if (isNaN(fp.careerStats.per)) { fp.careerStats.per = 0; }
                    fp.careerStats.ewa = _.reduce(ps.r, function (memo, psr) { return memo + psr.ewa; }, 0); // Special case for EWA - sum
                    if (options.playoffs) {
                        fp.careerStatsPlayoffs = filterStatsPartial(p, ps.cp, options.stats);
                        fp.careerStatsPlayoffs.per = _.reduce(ps.p, function (memo, psp) { return memo + psp.per * psp.min; }, 0) / (fp.careerStatsPlayoffs.min * fp.careerStatsPlayoffs.gp); // Special case for PER - weight by minutes per season
                        if (isNaN(fp.careerStatsPlayoffs.per)) { fp.careerStatsPlayoffs.per = 0; }
                        fp.careerStatsPlayoffs.ewa = _.reduce(ps.p, function (memo, psp) { return memo + psp.ewa; }, 0); // Special case for EWA - sum
                    }
                } else if (options.stats.length > 0) { // Return 0 stats if no entry and a single year was requested, unless no stats were explicitly requested
                    // Single seasons
                    fp.stats = filterStatsPartial(p, ps.r, options.stats);
                    if (options.playoffs) {
                        if (!_.isEmpty(ps.p)) {
                            fp.statsPlayoffs = filterStatsPartial(p, ps.p, options.stats);
                        } else {
                            fp.statsPlayoffs = {};
                        }
                    }
                }

                return true;
            }
            return false;
        };

        fps = []; // fps = "filtered players"
        for (i = 0; i < p.length; i++) {
            fp = {};

            // Only add a player if filterStats finds something (either stats that season, or options overriding that check)
            if (filterStats(fp, p[i], options)) {
                // Only add a player if he was active for this season and thus has ratings for this season
                if (filterRatings(fp, p[i], options)) {
                    // This can never fail because every player has attributes
                    filterAttrs(fp, p[i], options);

                    fps.push(fp);
                }
            }
        }

        // Return an array or single object, based on the input
        return returnOnePlayer ? fps[0] : fps;
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
    function madeHof(p) {
        var df, ewa, ewas, fudgeSeasons, i, mins, pers, prls, va,qbr,gp;

		var py,rcy,ruy,sacks,olr;
		var overall;
		
        overall =  _.pluck(p.ratings, "ovr");
        mins = _.pluck(p.stats, "min");
      //  pers = _.pluck(p.stats, "per");
        qbr = _.pluck(p.stats, "qbr");
        gp = _.pluck(p.stats, "gp");

        py = _.pluck(p.stats, "stl");
        rcy = _.pluck(p.stats, "orb");
        ruy = _.pluck(p.stats, "drb");
        sacks = _.pluck(p.stats, "fgaMidRange");
        olr = _.pluck(p.stats, "olr");
		
		
        //qbr = _.pluck(p.stats, "qbr");
		
		
        // Position Replacement Levels http://insider.espn.go.com/nba/hollinger/statistics
        prls = {
            QB: 500,
            WR: 200,
            TE: 100,
            RB: 200,
            DL: 1,
            LB: .67,
            OL: 20,
            PF: 11.5,
            FC: 11.05,
            C: 10.6
        };

        // Estimated wins added for each season http://insider.espn.go.com/nba/hollinger/statistics
        ewas = [];
		
		/*console.log("gp: "+gp.length);
		console.log("qbr: "+qbr.length);
		console.log("pers: "+pers.length);
		console.log("mins: "+mins.length);*/
        for (i = 0; i < gp.length; i++) {
	//		console.log("qbr: "+qbr[i]);		
	//		console.log("gp: "+gp[i]);		
//            va = gp[i] * (qbr[i] - prls[p.pos]) / 16;
          /*  if (prls[p.pos] >0) {
				va = (py[i]+rcy[i]+ruy[i]+sacks[i]+olr[i])/(prls[p.pos]);
			} else {
				va = 0;
			}*/
			 va = overall;
//            ewas.push(va / 30 * 0.8); // 0.8 is a fudge factor to approximate the difference between (in-game) EWA and (real) win shares
            ewas.push(va ); // 0.8 is a fudge factor to approximate the difference between (in-game) EWA and (real) win shares
        }
//console.log(ewas)
//console.log(_.pluck(p.stats, "ewa"))

        // Calculate career EWA and "dominance factor" DF (top 5 years EWA - 50)
        ewas.sort(function (a, b) { return b - a; }); // Descending order
        ewa = 0;
        df = -25;
        for (i = 0; i < ewas.length; i++) {
            ewa += ewas[i]-80;
	//		console.log("ewas[i]: "+ewas[i]);		
	//		console.log("ewa: "+ewa);		
            if (i < 5) {
                df += ewas[i]-80;
            }
        }


        // Fudge factor for players generated when the league started
        fudgeSeasons = g.startingSeason - p.draft.year - 3;
        if (fudgeSeasons > 0) {
            ewa += ewas[0] * fudgeSeasons;
        }
	//	console.log("ewa: "+ewa+" df: "+df);

        // Final formula
        if (ewa + df > 15) {
            return true;
        }

        return false;
    }

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
     * @param {Object=} options Object containing several optional options:
     *     noPot: When true, don't include potential in the value calcuation (useful for roster
     *         ordering and game simulation). Default false.
     *     fuzz: When true, used fuzzed ratings (useful for roster ordering, draft prospect
     *         ordering). Default false.
     *     age: If set, override the player's real age. This is only useful for draft prospects,
     *         because you can use the age they will be at the draft.
     * @return {boolean} Value of the player, usually between 50 and 100 like overall and potential
     *     ratings.
     */
    function value(p, options) {
        var age, current, i, potential, pr, ps, ps1, ps2, s, worth, worthFactor;

        options = options !== undefined ? options : {};
        options.noPot = options.noPot !== undefined ? options.noPot : false;
        options.fuzz = options.fuzz !== undefined ? options.fuzz : false;
        options.age = options.age !== undefined ? options.age : null;
        options.withContract = options.withContract !== undefined ? options.withContract : false;

        // Current ratings
        pr = {}; // Start blank, add what we need (efficiency, wow!)
        s = p.ratings.length - 1; // Latest season

        // Fuzz?
        if (options.fuzz) {
            pr.ovr = Math.round(helpers.bound(p.ratings[s].ovr + p.ratings[s].fuzz, 0, 100));
            pr.pot = Math.round(helpers.bound(p.ratings[s].pot + p.ratings[s].fuzz, 0, 100));
        } else {
            pr.ovr = p.ratings[s].ovr;
            pr.pot = p.ratings[s].pot;
        }
		
		if (p.pos == "QB") {
		    if (pr.pot>80) {		
				pr.bonus = 1.05;
			} else {
				pr.bonus = 1.0;
			}
		    if (pr.ovr>70) {		
				pr.bonus *= 1.05;
			} else {
				pr.bonus = 1.0;
			}			
		} else if (p.pos == "RB") {			
			pr.bonus = .93;
		} else if (p.pos == "WR") {			
			pr.bonus = .99;
		} else if (p.pos == "TE") {			
			pr.bonus = 0.97;
			
		} else if (p.pos == "S") {			
			pr.bonus = 0.99;
		} else if (p.pos == "CB") {			
			pr.bonus = 0.99;
		} else if (p.pos == "OL") {			
			pr.bonus = 0.96;
		} else if (p.pos == "DL") {			
			pr.bonus = 1.02;		
		} else if (p.pos == "LB") {			
			pr.bonus = 1.04;		
		} else if (p.pos == "K") {			
			pr.bonus = 0.85;
		} else {
			pr.bonus = 1.0;
		}		
				
		
		

        // Regular season stats ONLY, in order starting with most recent
        ps = [];
        if (p.stats !== undefined) { // Filtered player objects might not include it, for rookies
            for (i = 0; i < p.stats.length; i++) {
                if (!p.stats[i].playoffs) {
                    ps.push(p.stats[i]); // Okay that it's not deep copied, because this isn't modified
                }
            }
            ps.reverse();
        }

        // 1. Account for stats (and current ratings if not enough stats)
        current = pr.ovr*pr.bonus; // No stats at all? Just look at ratings more, then.
     /*   if (ps.length > 0) {
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
        if (options.noPot) {
            return current;
        }

        // 2. Potential
        potential = pr.pot*pr.bonus;

        // If performance is already exceeding predicted potential, just use that
        if (current >= potential && age < 29) {
            return current;
        }

        // Otherwise, combine based on age
        if (options.age) {
            age = options.age;
        } else {
            age = g.season - p.born.year;
        }
/*        if (age <= 23) {
            return 0.5 * potential + 0.5 * current;
        }
        if (age === 24) {
            return 0.3 * potential + 0.7 * current;
        }
        if (age === 25) {
            return 0.1 * potential + 0.9 * current;
        }*/
        if (age <= 23) {
            return 0.4 * potential + 0.6 * current;
        }
        if (age === 24) {
            return 0.25 * potential + 0.75 * current;
        }
        if (age === 25) {
            return 0.1 * potential + 0.9 * current;
        }		
/*        if (age === 26) {
            return 0.3 * potential + 0.7 * current;
        }
        if (age === 23) {
            return 0.15 * potential + 0.85 * current;
        }
        if (age === 24) {
            return 0.1 * potential + 0.9 * current;
        }
        if (age === 25) {
            return 0.05 * potential + 0.95 * current;
        }*/
        if (age > 25 && age < 29) {
            return current;
        }
        if (age === 29) {
            return 0.975 * current;
        }
        if (age === 30) {
            return 0.95 * current;
        }
        if (age === 31) {
            return 0.9 * current;
        }
        if (age === 32) {
            return 0.85 * current;
        }
        if (age === 33) {
            return 0.8 * current;
        }
        if (age > 33) {
            return 0.7 * current;
        }
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
    function retire(tx, p) {
        if (p.tid === g.userTid) {
            eventLog.add(tx, {
                type: "retired",
                text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> retired.'
            });
        }

        p.tid = g.PLAYER.RETIRED;
        p.retiredYear = g.season;

        // Add to Hall of Fame?
        if (madeHof(p)) {
            p.hof = true;
            p.awards.push({season: g.season, type: "Inducted into the Hall of Fame"});
            if (p.statsTids.indexOf(g.userTid) >= 0) {
                eventLog.add(tx, {
                    type: "hallOfFame",
                    text: 'Your former player <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> was inducted into the <a href="' + helpers.leagueUrl(["hall_of_fame"]) + '">Hall of Fame</a>.'
                });
            }
        }

        return p;
    }


    /**
     * How many seasons are left on this contract? The answer can be a fraction if the season is partially over
     * 
     * @memberOf core.player
     * @param {Object} exp Contract expiration year.
     * @return {number} numGamesRemaining Number of games remaining in the current season (0 to 82).
     */
    function contractSeasonsRemaining(exp, numGamesRemaining) {
        return (exp - g.season) + numGamesRemaining / 82;
    }

    // See views.negotiation for moods as well
    function moodColorText(p) {
        if (p.freeAgentMood[g.userTid] < 0.25) {
            return {
                color: "#5cb85c",
                text: 'Eager to reach an agreement.'
            };
        }

        if (p.freeAgentMood[g.userTid] < 0.5) {
            return {
                color: "#ccc",
                text: 'Willing to sign for the right price.'
            };
        }

        if (p.freeAgentMood[g.userTid] < 0.75) {
            return {
                color: "#f0ad4e",
                text: 'Annoyed at you.'
            };
        }

        return {
            color: "#d9534f",
            text: 'Insulted by your presence.'
        };
    }
	
    /**
     * Take a partial player object, such as from an uploaded JSON file, and add everything it needs to be a real player object.
     * 
     * @memberOf core.player
     * @param {Object} p Partial player object.
     * @return {Object} p Full player object.
     */
    function augmentPartialPlayer(p, scoutingRank) {
        var age, j, pg, simpleDefaults;

        if (!p.hasOwnProperty("born")) {
            age = random.randInt(19, 35);
        } else {
            age = g.startingSeason - p.born.year;
        }

        // This is used to get at default values for various attributes
        pg = generate(p.tid, age, "", 0, 0, g.startingSeason - age, true, scoutingRank);

        // Optional things
        simpleDefaults = ["awards", "born", "college", "contract", "draft", "face", "freeAgentMood", "hgt", "imgURL", "injury", "pos", "ptModifier", "retiredYear", "rosterOrder", "weight", "yearsFreeAgent"];
        for (j = 0; j < simpleDefaults.length; j++) {
            if (!p.hasOwnProperty(simpleDefaults[j])) {
                p[simpleDefaults[j]] = pg[simpleDefaults[j]];
            }
        }
        if (!p.hasOwnProperty("salaries")) {
            p.salaries = [];
            if (p.contract.exp < g.startingSeason) {
                p.contract.exp = g.startingSeason;
            }
            if (p.tid >= 0) {
                p = setContract(p, p.contract, true);
            }
        }
        if (!p.hasOwnProperty("statsTids")) {
            p.statsTids = [];
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

        // Fix always-missing info
        if (p.tid === g.PLAYER.UNDRAFTED_2) {
            p.ratings[0].season = g.startingSeason + 1;
        } else if (p.tid === g.PLAYER.UNDRAFTED_3) {
            p.ratings[0].season = g.startingSeason + 2;
        } else {
            if (!p.ratings[0].hasOwnProperty("season")) {
                p.ratings[0].season = g.startingSeason;
            }
        }
        if (!p.hasOwnProperty("stats")) {
            p.stats = [];
            if (p.tid >= 0) {
                p = addStatsRow(p, false);
            }
        }

        return p;
    }
    
    return {
        addRatingsRow: addRatingsRow,
        addStatsRow: addStatsRow,
        genBaseMoods: genBaseMoods,
        addToFreeAgents: addToFreeAgents,
        bonus: bonus,
        genContract: genContract,
        setContract: setContract,
        develop: develop,
        injury: injury,
        generate: generate,
        ovr: ovr,
        ovrOnly: ovrOnly,		
        release: release,
        skills: skills,
        filter: filter,
        madeHof: madeHof,
        value: value,
        retire: retire,
        name: name,
        contractSeasonsRemaining: contractSeasonsRemaining,
        moodColorText: moodColorText,
        augmentPartialPlayer: augmentPartialPlayer
    };
});