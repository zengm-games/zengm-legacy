/**
 * @name core.player.playerbaseball
 * @namespace Functions operating on playerbaseball objects, parts of playerbaseball objects, or arrays of playerbaseball objects.
 */
//define(["globals","core/limitrating", "core/finances", "data/injuries", "data/names", "lib/faces", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (g,limitrating, finances, injuries, names, faces, _, eventLog, helpers, random) {
    //"use strict";
//define(["globals","core/player/limitrating", "core/finances", "data/injuries", "data/names", "lib/faces", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (g,limitrating, finances, injuries, names, faces, _, eventLog, helpers, random) {
  //  "use strict";
//define(["globals", "core/finances", "data/injuries", "data/names", "lib/faces", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (g, finances, injuries, names, faces, _, eventLog, helpers, random) {
 //   "use strict";
define(["globals", "core/player","core/finances", "data/injuries", "data/names", "lib/faces", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (g, player,finances, injuries, names, faces, _, eventLog, helpers, random) {
    "use strict";

	var debug = 0;
	//player = require(["core/player"],function(player));

	//Uncaught Error: Module name "core/player" has not been loaded yet for context: _. Use require([])
	//Uncaught ReferenceError: player is not defined 
	
//// GENERAL really should be called from core/player
	
	   function limitRating(rating) {
        if (rating > 100) {
            return 100;
        }
        if (rating < 0) {
            return 0;
        }
        return Math.floor(rating);
    }

	

    function genFuzz(scoutingRank) {
        var cutoff, fuzz, sigma;

        cutoff = 0;  // Max error is from 2 to 10, based on scouting rank		
        //cutoff = 2 + 8 * (scoutingRank - 1) / 29;  // Max error is from 2 to 10, based on scouting rank
        sigma = 1 + 2 * (scoutingRank - 1) / 29;  // Stddev is from 1 to 3, based on scouting rank

        fuzz = random.gauss(0, sigma);
        if (fuzz > cutoff) {
            fuzz = cutoff;
        } else if (fuzz < -cutoff) {
            fuzz = -cutoff;
        }

        return fuzz;
    }
	
	
	
//// BASEBALL start of baseball
	
    /**
	
	baseball
	
     * Calculates the overall rating by averaging together all the other ratings.
     * 
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Player's ratings object.
     * @return {number} Overall rating.
     */
    function ovr(ratings) {
        ////return Math.round((ratings.hgt + ratings.stre + ratings.spd + ratings.jmp + ratings.endu + ratings.ins + ratings.dnk + ratings.ft + ratings.fg + ratings.tp + ratings.blk + ratings.stl + ratings.drb + ratings.pss + ratings.reb) / 15);

        // This formula is loosely based on linear regression:
        //     player = require('core/player'); player.regressRatingsPer();
		
		var ovrPitcher,ovrHitter,ovrFinal,ovrCatcher;
		
//		ovrPitcher = Math.round((2 * ratings.hgt + ratings.stre*2 + 4 * ratings.spd + 2 * ratings.jmp + 2 * ratings.endu + 4 * ratings.ins + 4 * ratings.dnk + 2 * ratings.ft + 2 * ratings.fg + 2 * ratings.tp + 10 * ratings.blk + 10 * ratings.stl + 10 * ratings.drb + 10 * ratings.pss + 10 * ratings.reb) / 76);
		ovrPitcher = Math.round((2 * ratings.hgt + ratings.stre*2 + 4 * ratings.spd + 2 * ratings.jmp + 2 * ratings.endu + 4 * ratings.ins + 4 * ratings.dnk + 2 * ratings.ft + 2 * ratings.fg + 2 * ratings.tp + 40 * ratings.blk + 40 * ratings.stl + 20 * ratings.drb + 20 * ratings.pss + 20 * ratings.reb) / 163);
		ovrHitter = Math.round((2 * ratings.hgt + ratings.stre*2 + 15 * ratings.spd + 2 * ratings.jmp + 2 * ratings.endu + 30 * ratings.ins + 15 * ratings.dnk + 10 * ratings.ft + 20 * ratings.fg + 10 * ratings.tp + 0 * ratings.blk + 0 * ratings.stl + 0 * ratings.drb + 0 * ratings.pss + 0 * ratings.reb) / 108);
//		ovrHitter = Math.round((2 * ratings.hgt + ratings.stre*2 + 2 * ratings.spd + 2 * ratings.jmp + 2 * ratings.endu + 30 * ratings.ins + 15 * ratings.dnk + 10 * ratings.ft + 20 * ratings.fg + 10 * ratings.tp + 0 * ratings.blk + 0 * ratings.stl + 0 * ratings.drb + 0 * ratings.pss + 0 * ratings.reb) / 95);
		ovrCatcher = Math.round((2 * ratings.hgt + ratings.stre*2 + 30 * ratings.spd + 2 * ratings.jmp + 2 * ratings.endu + 30 * ratings.ins + 15 * ratings.dnk + 10 * ratings.ft + 20 * ratings.fg + 10 * ratings.tp + 0 * ratings.blk + 0 * ratings.stl + 0 * ratings.drb + 0 * ratings.pss + 0 * ratings.reb) / 123);

        if (ovrPitcher > ovrHitter) {
			ovrFinal = ovrPitcher;
  //      } else if (ovrCatcher > ovrHitter) {
	//		ovrFinal = ovrCatcher;				
		} else {
			ovrFinal = ovrHitter;		
		}
		
//        return Math.round((1 * ratings.hgt + ratings.stre + 1 * ratings.spd + 1 * ratings.jmp + 1 * ratings.endu + 4 * ratings.ins + 4 * ratings.dnk + 2 * ratings.ft + 2 * ratings.fg + 2 * ratings.tp + 4 * ratings.blk + 4 * ratings.stl + 2 * ratings.drb + 2 * ratings.pss + 2 * ratings.reb) / 33);
        return ovrFinal;
    }	

	
    /**
     * Assign "skills" based on ratings.
     *
     * "Skills" are discrete categories, like someone is a 3 point shooter or they aren't. These are displayed next to the player's name generally, and are also used in game simulation. The possible skills are:
     *  
	 *  new ratings
   
     *  Physical			Durability/Mental	
     *  Height: hgt					Situational Smarts
     *  Strength: stre				Clutch
     *  Speed: 	spd					Endurance
     *  Jumping: jmp 				Work Effort
     *  Endurance: endu 			Team Player

     *  Shooting			Fielders	
     *  Inside: ins					Hitting
     *  Dunks/Layups: dnk 			Power
     *  Free Throws: ft				Arm = throwing speed? + accuracy?
     *  Two Pointers: fg			Running speed
     *  Three Pointers: tp			Fielding

     *  Skill				Pitching	
     *  Blocks: blk					Throwing Speed
     *  Steals: stl					Accuraccy
     *  Dribbling: drb				Pitch1  
     *  Passing: pss 				Pitch2
     *  Rebounding: reb				Pitch3

     *  new combinations

     *  Fielding + Arm + Speed =  Defensive Outfielder (tp,ft,fg)
     *  Fielding + Situational Smarts + Clutch + some Arm=  Defensive Infielder  (tp,hgt,stre)
     *  
     *  Hitting + Power + Clutch  = Hitter  (ins,dnk,stre)
     *  Speed + Hitting + Situational Smarts = Stealer  (fg,ins,hei)


     *  use 
     *  Math.max(5,10);
     *  Speed + max 2 (Pitch 1 + Pitch 2 + Pitch 3) = Power Pitcher  (blk,stl,drb,pss,reb)
     *  Accuracy + max 2 (Pitch 1 + Pitch 2 + Pitch 3) = Finess Pitcher (blk,stl,drb,pss,reb)
     *  Cluch + max 2 (Speed + Accuracy + Pitch 1 + Pitch 2 + Pitch 3) =  Closer  (stre,blk,stl,drb,pss,reb)

     *  Work Effort + Team Player + Situational Smarts + Clutch = Leader   (jmp,endu,hgt,stre)   

	 * *  new skills
	 
     * * Perimeter Defender (Dp)    Defensive Outfielder
     * * Interior Defender (Di)     Defensive Infielder   

     * * Post Scorer (Po)           Hitter
     * * Three Point Shooter (3)     Stealer

     * * Ball Handler (B)          Power Pitcher
     * * Passer (Ps)               Finess Pitcher
     * * Rebounder (R)             Closer
	 
     * * Athlete (A)                Leader
	 
     * 
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {Array.<string>} Array of skill IDs.
     */
	 
    function skills(ratings) {
        var hasSkill, sk;

        sk = [];

        hasSkill = function (ratings, components, weights) {
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
                numerator += (ratings[components[i]] + ratings.fuzz) * weights[i];
                denominator += 100 * weights[i];
            }

            if ( (numerator / denominator) > 0.85) {
                return true;
            }
            return false;
        };
/*    
	 *  Putting this here for easy reference since tp,hgt, tc. don't mean anything 

     *  Fielding + Arm + Speed =  Defensive Outfielder (tp,ft,fg)  (Dp)
     *  Fielding + Situational Smarts + Clutch + some Arm=  Defensive Infielder  (tp,hgt,stre,ft)  (Di)
     *  
     *  Hitting + Power + Clutch  = Hitter  (ins,dnk,stre) (Po)           
     *  Speed + Hitting + Situational Smarts = Stealer  (fg,ins,hgt)  (3)


     *  use 
     *  Math.max(5,10);
     *  Speed +  some accuracy(Pitch 1 + Pitch 2 + Pitch 3) = Power Pitcher  (blk,drb,pss,reb)  (B) 
     *  Accuracy + some speed (Pitch 1 + Pitch 2 + Pitch 3) = Finess Pitcher (stl,drb,pss,reb)  (Ps)
     *  now ave of first 3 future? Cluch + max 2 (Speed + Accuracy + Pitch 1 + Pitch 2 + Pitch 3) =  Closer  (stre,blk,stl,drb,pss,reb)  (R)
     *  future? more pitch types
	 
     *  Work Effort + Team Player + Situational Smarts + Clutch = Leader   (jmp,endu,hgt,stre)   (A) */

        // These use the same formulas as the composite rating definitions in core.game!
//        if (hasSkill(ratings, ['tp', 'ft', 'fg'], [1, 2, 2])) {
        if (hasSkill(ratings, ['fg', 'tp'], [1, 3])) {
            sk.push("Do");
//            sk.push("Dp");
        }
        if (hasSkill(ratings, ['fg', 'tp'], [3, 1])) {
            sk.push("Di");
        }
        if (hasSkill(ratings, ['ins'], [1])) {
//            sk.push("Po");
            sk.push("H");
        }
        if (hasSkill(ratings,  ['dnk'], [1])) {
            sk.push("Ph"); // new
        }		
        if (hasSkill(ratings, ['fg', 'hgt'], [4, 1])) {
//            sk.push("3");
            sk.push("St");
        } 
        if (hasSkill(ratings, ['blk','stl','drb','pss','reb'], [1, 0, 0, 0,0])) {
            sk.push("Pp");
//            sk.push("B");
        }
        if (hasSkill(ratings, ['blk','stl','drb','pss','reb'], [0, 1, 0,0,0])) {
//            sk.push("Ps");
            sk.push("Fp");
        }
        if (hasSkill(ratings, ['stre', 'blk', 'stl','drb','pss','reb'], [3, 1, 1,0,0,0])) {
//            sk.push("R");
       //     sk.push("Cl");
        }
        if (hasSkill(ratings, ['jmp', 'endu', 'hgt', 'stre'], [1, 1, 1, 1])) {
//            sk.push("A");
       //     sk.push("L");
        }

        return sk;
    }
	
	
	
    /**
	
	 * Baseball version
	
     * Generate initial ratings for a newly-created player.
     *
     * @param {string} profile [description]
     * @param {number} baseRating [description]
     * @param {number} pot [description]
     * @param {number} season [description]
     * @param {number} scoutingRank Between 1 and 30, the rank of scouting spending, probably over the past 3 years via core.finances.getRankLastThree.
     * @return {Object} Ratings object	 
	 
	 
	 
	 Base           Outfielder 
	 Point Guard    Infielder
	 Wing           Pitcher
	 Big            Reliever
	 
	 could have many more
	 
	 
     */
    function genRatings(profile, baseRating, pot, season, scoutingRank, tid) {
        var i, key, profileId, profiles, ratingKeys, ratings, rawRating, rawRatings, sigmas;
		var ratingHolder;
		
        if (profile === "Hitter") {
            profileId = 1;
        } else if (profile === "None") {
   //         profileId = 1;
           profileId = 2;
        } else if (profile === "Pitcher") {
            profileId = 3;
        } else if (profile === "PitcherN") {
            profileId = 4;
//        } else if (profile === "Catcher") {
        } else if (profile === "HitterN") {
            profileId = 5;
        } else if (profile === "Fielder") {
            profileId = 6;
        } else if (profile === "Power") {
            profileId = 7;
        } else if (profile === "Speed") {
            profileId = 8;
        } else if (profile === "Catcher") {
            profileId = 9;
        } else if (profile === "FielderN") {
            profileId = 10;
        } else if (profile === "PowerN") {
            profileId = 11;
        } else if (profile === "SpeedN") {
            profileId = 12;
        } else if (profile === "CatcherN") {
            profileId = 13;
        } else if (profile === "Power2") {
            profileId = 14;
        } else if (profile === "Short") {
            profileId = 15;
        } else if (profile === "Third") {
            profileId = 16;
        } else if (profile === "Right") {
            profileId = 17;
        } else {
            profileId = 18;
        }
	//	console.log(profileId);
		//"Pitcher", "Hitter"

        // Each row should sum to ~150
        profiles = [[10,  10, 10, 10,  10,  10, 10,  10,  10,  10,  10,  10,  10, 10, 10],  // Base 0


					[-20,  0, 0,  0,  0,   0,   0,   20,  20,  0,   -60,   -60,  -60,  -80, -80],   // Hitter 1
                    [-20,  0,  0,  0,  0,  -60,   -100,  0,  -20,  -10,   -40,   -40,  -40,  -60,  -60],  // neither 2
                    [-20,  0,  0, 0,  0,  -120,  -150,  10,  -50, -60, 20,  10,   0, 0, 0],  // Pitcher 3
                    [-20,  0,  0, 0,  0,  -150,  -180,  20,  -50, -90, 20,  0,   -10, -10, -10],  // Pitcher New 4
                    [-20,  0, 0,  0,  0,   -20,  -20,   0, 0,  -20,   -80,   -80,  -90,  -90, -90],   // Hitter New 5
                    [-20,  0,  0, 0,  0,  -10,  -30,  30,  10, 100, -60,  -60,   -60, -80, -80],  // Fielder 6     2B
                    [-20,  0,  0, 0,  0,  -20,  80,  30,  30, -20, -60,  -60,   -80, -80, -80],  // Power 7    LF
                    [-20,  0,  0, 0,  0,  10,  -40,  0,  100, 30, -60,  -60,   -80, -80, -80],  //  Speed 8   CF
                    [-20,  0,  100, 0,  0,  -60,  -40,  40,  -10, 20, -60,  -60,   -80, -80, -80],  // Catcher 9  C
                    [-20,  0,  0, 0,  0,  -30,  -90,  20,  20, 30, -80,  -80,   -90, -90, -90],  // Fielder new 10
                    [-20,  0,  0, 0,  0,  -50,  30,  20,  -20, -20, -80,  -80,   -90, -90, -90],  // Power new 11
                    [-20,  0,  0, 0,  0,  -20,  -100,  20,  80, 40, -80,  -80,   -90, -90, -90],  //  Speed new 12
                    [-20,  0,  80, 0,  0,  -80,  -60,  40,  -10, 20, -80,  -80,   -90, -90, -90],  // Catcher new 13					
                    [-20,  0,  0, 0,  0,  -20,  70,  20,  0, 40, -60,  -60,   -80, -80, -80],  // Power2 14   1B
                    [-20,  0,  0, 0,  0,  -10,  -40, 100,  0, 50, -60,  -60,   -80, -80, -80],  //  Short 9  SS
                    [-20,  0,  0, 0,  0,  -30,  70,  50,  -20, 30, -60,  -60,   -80, -80, -80],  //  Third 9  3B
                    [-20,  0,  0, 0,  0,  -10,  -20,  80,  40, 10, -60,  -60,   -80, -80, -80],  //  Right 9  RF
                    [-20,  0,  0,  0,  0,  -60,   -100,  0,  -20,  -10,   -40,   -40,  -40,  -60,  -60]];  // neither 2
					
					
//                    [0,  0, 0,  0,  0,   20,   0,   0,  0,  0,   -10,   -10,  -10,  -20, -20],   // Hitter
//                    [0,  0,  0,  0,  0,  -10,   -20,  0,  0,  -10,   -10,   -10,  -10,  -20,  -20],  // neither
//                    [0,  0,  0, 0,  0,  -10,  -20,  10,  0, -10, 20,  20,   20, 20, 20]];  // Pitcher
//        sigmas = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
//        sigmas = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
//        sigmas = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
//        baseRating = random.gauss(baseRating, 2);
	//	console.log(profiles[0][5]+" "+profiles[1][5]+" "+profiles[2][5]+" "+profiles[3][5]+" "+profiles[4][5]);



//		if ((profileId == 5) || (profileId == 4) || (profileId == 10) || (profileId == 11) || (profileId == 12) || (profileId == 13) ){
//			sigmas = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
   //     	sigmas = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
	//	} else {
//        	sigmas = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
//        	sigmas = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        	sigmas = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
	//	}
   //     sigmas = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
    //    console.log("b: "+baseRating);
        baseRating = random.gauss(baseRating, 10);
     //   console.log("a: "+baseRating);

        rawRatings = [];
        for (i = 0; i < sigmas.length; i++) {
            rawRating = profiles[profileId][i] + baseRating;
//            rawRatings[i] = player.limitRating(random.gauss(rawRating, sigmas[i]));
            rawRatings[i] = limitRating(random.gauss(rawRating, sigmas[i]));
        }

        ratings = {};
        ratingKeys = ["hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb"];
        for (i = 0; i < ratingKeys.length; i++) {
            key = ratingKeys[i];
            ratings[key] = rawRatings[i];
		/*	if (i==5) {
            console.log("ratings key  " + key)
            console.log("rawRatings  " + ratings[key])
			}*/
        }

		// can put further player orientation here
		

		
        // Ugly hack: Pitcher can't be the best hitters, pitchers should have a good fielding arm
        if ((ratings.blk+ratings.stl+ratings.drb+ratings.pss+ratings.reb) > (ratings.ins+ratings.dnk+ratings.ft+ratings.fg+ratings.tp)) {

		    ratingHolder = ratings.ins;
			ratings.ins = ratingHolder/2;
	/*	    if (ratings.ins > 50) {
			   ratings.ins -= 20;
			}			
		    if (ratings.ins > 50) {
			   ratings.ins -= 20;
			}						*/
		    ratingHolder = ratings.ft;
			ratings.ft = (100-ratingHolder)/2+ratingHolder;
//            ratings.drb = limitRating(ratings.drb - (ratings.hgt - 50));
//            ratings.pss = limitRating(ratings.pss - (ratings.hgt - 50));
//            ratings.drb = limitrating.limitRating(ratings.drb - (ratings.hgt - 50));
            //ratings.pss = limitrating.limitRating(ratings.pss - (ratings.hgt - 50));
        } else {
//            ratings.drb = limitRating(ratings.drb + 10);
//            ratings.pss = limitRating(ratings.pss + 10);
//            ratings.drb = limitrating.limitRating(ratings.drb + 10);
            //ratings.pss = limitrating.limitRating(ratings.pss + 10);
        }

		if ((ratings.dnk>30) ) {
		//	ratings.dnk -= random.randInt(0, 40);
		//	ratings.dnk -= random.randInt(0, 20);
		//	ratings.dnk -= random.randInt(0, 10);
			
		}			
			ratings.dnk -= random.randInt(5, 100);

		// being a high average hitter should hurt power
//		if ((ratings.ins>50) && (Math.random() < .60)) {
		if ((ratings.ins>70)) {
//			ratings.dnk -= 20;
			ratings.dnk -= random.randInt(10, 20);
			//random.randInt(0, profiles.length - 1)];
		}	
		if ((ratings.ins>50)) {
//			ratings.dnk -= 20;
			ratings.dnk -= random.randInt(0, 40);
			//random.randInt(0, profiles.length - 1)];
		}
		// being a high speed hitter should hurt power
		if ((ratings.fg>70) ) {
			if (Math.random() < .80) {
				ratings.dnk -= 40;				
			} else {
				ratings.dnk -= 20;
			}
		
		} else if ((ratings.fg> 50) ) {
			ratings.dnk -= random.randInt(0, 40);			
		}		
		// being a power hitter should hurt BA
		if ((ratings.dnk>70) && (Math.random() < .60)) {
			ratings.ins -= 20;
		}		

		
		// being a power pitcher should hurt Command
		if ((ratings.blk>70) && (Math.random() < .70)) {
			ratings.stl -= 40;
		}
		// being a control picther should mean less power
		if ((ratings.stl>70) && (Math.random() < .70)) {
			ratings.blk -= 40;
		}
		
		// number of pitches means less power and control		
		if ((ratings.drb>70) && (ratings.pss>70) && (ratings.reb>70) && (Math.random() < .70)) {
			ratings.stl -= 20;
			ratings.blk -= 20;
		}		

		if (ratings.fg>70) {
			ratings.fg -= random.randInt(0,40);
		}
		if (ratings.dnk>70) {
			ratings.dnk -= random.randInt(5,15);
		//	ratings.dnk -= random.randInt(50,90);
		}
		if (ratings.ins>70) {
			ratings.ins -= random.randInt(5,15);
		}

		
		//if (ratings.blk>70) {
			ratings.blk += random.randInt(0,10);
		//}
		//if (ratings.stl>70) {
			ratings.stl += random.randInt(0,5);
		//}

		if (ratings.drb>70) {
			ratings.drb -= random.randInt(15,40);
		}
		if (ratings.pss>70) {
			ratings.pss -= random.randInt(15,40);
		}
		if (ratings.reb>70) {
			ratings.stl -= random.randInt(15,40);
		}
		

		/*     // Ugly hack: Tall people can't dribble/pass very well
        if (ratings.hgt > 40) {
            ratings.drb = limitRating(ratings.drb - (ratings.hgt - 50));
            ratings.pss = limitRating(ratings.pss - (ratings.hgt - 50));
//            ratings.drb = limitrating.limitRating(ratings.drb - (ratings.hgt - 50));
            //ratings.pss = limitrating.limitRating(ratings.pss - (ratings.hgt - 50));
        } else {
            ratings.drb = limitRating(ratings.drb + 10);
            ratings.pss = limitRating(ratings.pss + 10);
//            ratings.drb = limitrating.limitRating(ratings.drb + 10);
            //ratings.pss = limitrating.limitRating(ratings.pss + 10);
        }*/
	//	if ((profileId == 5) || (profileId == 4) || (profileId == 10) || (profileId == 11) || (profileId == 12) || (profileId == 13) ){

			ratingHolder = pot;
		    pot = (100 - ratingHolder)/2 + ratingHolder;
		/*	if (pot < 80) {
				ratingHolder = pot;
				pot = (100 - ratingHolder)/2 + ratingHolder;
			}
			if (pot < 80) {
				ratingHolder = pot;
				pot = (100 - ratingHolder)/2 + ratingHolder;
			}	*/
			if (pot < 80) {
				ratingHolder = pot;
				pot = ratingHolder+15;
			}					
			if (pot < 80) {
				ratingHolder = pot;
				pot = ratingHolder+15;
			}					
			if (pot < 80) {
				ratingHolder = pot;
				pot = ratingHolder+15;
			}					
			
	//	}

        ratings.season = season;
        ratings.ovr = ovr(ratings);
        ratings.pot = pot;

        ratings.fuzz = genFuzz(scoutingRank);		
		
		if (tid === g.PLAYER.UNDRAFTED_2) {
		 ratings.fuzz *= 2;
		} else if (tid === g.PLAYER.UNDRAFTED_3) {
		 ratings.fuzz *= 4;
		}		
		
        ratings.skills = skills(ratings);

        return ratings;
    }
	


    /**
	
	* Baseball version
	
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     * 
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
	 
	 
	 PG,  starting pitcher     pg
	 G,   closer               g+sg
	 SG,  reliever             sg
	 
	 GF,   slight pitcher          pitcher
	 SF,   slight fielder/batter   hitter
	 
	 PF,   outfield            sf
	 FC,   infield             pf
	 C,    corners             c
	 

        pg = false;  pitching depth
        g = false;   clutch  
        sg = false;  1 strong pitch
		
		above pitching  speed+accuracy
		below hitter    average+power
		
        pf = false;  arm/speed
        fc = false;  fielding
        c = false;   power
	 
	 
     */
    function pos(ratings) {
        var c,fc,pf, pg,g,sg, position;

		var sp,cl,rp;
		var sb,ss,fb,tb,rf,cf,lf;
		
		sp = false;
		cl = false;
		rp = false;
				
		sb = false;
		ss = false;
		fb = false;
		tb = false;
		rf = false;
		cf = false;
		lf = false;
        c = false;
		
		var infield,outfield;
		var powerfield,fieldpower;
		var throwing,speed;
		var powthrsp,spthrpow;

		infield = false;
		outfield = false;
		powerfield = false;
		fieldpower = false;
		throwing = false;
		speed = false;
		powthrsp = false;
		spthrpow = false;
		
        // Default position (pitcher vs fielder)
        if (( (ratings.blk + ratings.stl + ratings.drb + ratings.pss + ratings.reb ) - (ratings.ins + ratings.dnk + ratings.ft + ratings.fg + ratings.tp )) >= 0) {
//            position = 'GF';
            position = 'RP';
			rp = true;
        } else {
//            position = 'SF';
            position = '2B';
			sb = true;
        }

		//pitcher
//        if (  (ratings.blk+ ratings.stl+ratings.drb+ ratings.pss+ ratings.reb) >= 250)  {
        if (  (ratings.blk+ ratings.stl) >= (ratings.drb+ ratings.pss+ ratings.reb) )  {
                //pg = true;
                sp = true;
		}
		//closer
        if ((ratings.stre) >= 60) {
//               g = true;		
               cl = true;		
		}
 /*       if ( ((ratings.drb)  >= 60 ) || ((ratings.pss)  >= 60 ) || ((ratings.reb)  >= 60 )  ) {
//               sg = true;		
               rp = true;		
		}*/
		
		// arm vs run
        if ( (ratings.ft)-(ratings.fg)>= 0) {
                rf = true;
		} else {
		   cf = true
		}
		// catcher
        if ( (ratings.spd*5 - (ratings.ins+ ratings.dnk+ratings.ft+ ratings.fg+ ratings.tp )) >= 100) {
//                pf = true;
                c = true;
		}		

 
         // power vs fielding
		if ((ratings.tp)-(ratings.dnk) >= 0) {
		   ss = true;
		} else {
		  tb = true
		}
		// infield vs outfield
        if ((ratings.tp*2-ratings.ft-ratings.fg)>= 0) {
//            c = true;
            fb = true;
        } else {
		  lf = true;
		}
		// power vs arm/run
        if ((ratings.dnk*2-ratings.ft-ratings.fg)>= 0) {
//            c = true;
            powthrsp = true;
        } else {
		  spthrpow = true;
		}
		// arm vs field
        if ((ratings.ft-ratings.tp)>= 0) {
//            c = true;
            throwing = true;
        } 
		
				
     //*  Free Throws: ft				Arm = throwing speed? + accuracy?
//     *  Two Pointers: fg			Running speed
     //*  Three Pointers: tp			Fielding
		
		
// order matters

//  batters/fielders
        
		if (rp)  {
		// pitcher
		  if (sp)  {
		    position = 'SP';
		  } else if (cl)  {
		    position = 'CL';
		  } else {
		    position = 'RP';
		  }
		
		} else {
		// fielder
		  if (c) {
					position = 'C';		  
		  } else if (fb)  {
		  // infield
		    if (ss)  {
			 //fielder
				if (throwing)  {
					position = 'SS';
				} else {
					position = '2B';				
				}
			 
			} else {
			 //power
				if (throwing)  {
					position = '3B';
				} else {
					position = '1B';				
				}			 
			}
		  
		  } else {
		  // outfield  
		    if (powthrsp)  {
			 //power
					position = 'LF';		 
			} else {
			 //fielder
				if (rf)  {
					position = 'RF';
				} else {
					position = 'CF';				
				}		 
			}		  
		  }
		
		}


		

		

//  pitchers
  /*      if (rp) {
//        if (pg) {
            position = 'RP';
        } */
		
      if (debug < 0) {
       console.log("rp"+rp+" "+ ((ratings.blk + ratings.stl + ratings.drb + ratings.pss + ratings.reb ) - (ratings.ins + ratings.dnk + ratings.ft + ratings.fg + ratings.tp ))) ;
       console.log("sp"+sp);
       console.log("cl"+cl);
       console.log("fb"+fb);
       console.log("ss"+ss);
       console.log("throwing"+throwing+" "+(ratings.ft-ratings.tp));

       console.log("powthrsp"+powthrsp);
       console.log("rf"+rf);

        console.log(" p1 "+ratings.blk +" p1 "+ ratings.stl +" p1 "+ ratings.drb +" p1 "+ ratings.pss +" p1 "+ ratings.reb+" h1 "+ratings.ins+" h1 " + ratings.dnk+" h1 " + ratings.ft+" h1 " + ratings.fg+" h1 " + ratings.tp );	   
	   
/*       console.log("tb"+tb);
       console.log("lf"+lf);
       console.log("cf"+cf);
       console.log("c"+c);*/
       console.log("position"+position);
	    debug +=1;
	   }
       
	
		       
		
        return position;
    }


    return {
	    ovr: ovr,
        skills: skills,
		genRatings: genRatings,
		pos: pos
    };
});