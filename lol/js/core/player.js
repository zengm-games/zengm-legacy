/**
 * @name core.player
 * @namespace Functions operating on player objects, parts of player objects, or arrays of player objects.
 */
define(["dao", "globals","data/champions2","core/champion", "core/finances", "data/injuries", "data/names", "data/namesSwitzerland", "data/namesItaly", "data/namesIceland", "data/namesCanada", "data/namesFrenchCanada", "data/namesKorea", "data/namesChina", "data/namesRussia", "data/namesTurkey", "data/namesBrazil", "data/namesJapan","data/namesAustralia","data/namesChile","data/namesVietnam","data/namesPhilippines","data/namesGermany","data/namesBelgium","data/namesDenmark","data/namesHungary","data/namesNorway","data/namesSweden","data/namesFrance","data/namesLatAmN","data/namesLatAmS","data/namesNetherlands","data/namesEngland","data/namesPoland","data/namesRomania","data/namesSpain","data/namesScotland","data/namesGreece","data/namesArmenia","data/namesBulgaria","data/userIDs", "lib/bluebird", "lib/faces", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (dao, g,champions,champion, finances, injuries, names,namesSwitzerland,namesItaly,namesIceland,namesCanada,namesFrenchCanada,namesKorea,namesChina,namesRussia,namesTurkey,namesBrazil,namesJapan,namesAustralia,namesChile,namesVietnam,namesPhilippines,namesGermany,namesBelgium,namesDenmark,namesHungary,namesNorway,namesSweden,namesFrance,namesLatAmN,namesLatAmS,namesNetherlands,namesEngland,namesPoland,namesRomania,namesSpain,namesScotland,namesGreece,namesArmenia,namesBulgaria,userIDs, Promise, faces, _, eventLog, helpers, random) {
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
									if ((cpSorted[i].role == "Middle") && (topMID.length < 5) ) {
					//				  topMID.push(cpSorted[i].cpid);
										for (j = 0; j < _.size(c); j++) {
											if (c[j].name == cpSorted[i].champion) {
												topMID.push(c[j].hid);
												j = _.size(c);
											}
										}
									}
									if ((cpSorted[i].role == "Jungle") && (topJGL.length < 5) ) {
					//				  topJGL.push(cpSorted[i].cpid);
										for (j = 0; j < _.size(c); j++) {
											if (c[j].name == cpSorted[i].champion) {
												topJGL.push(c[j].hid);
												j = _.size(c);
											}
										}
									}
									if ((cpSorted[i].role == "Top") && (topTOP.length < 5) ) {
					//				  topTOP.push(cpSorted[i].cpid);
										for (j = 0; j < _.size(c); j++) {
											if (c[j].name == cpSorted[i].champion) {
												topTOP.push(c[j].hid);
												j = _.size(c);
											}
										}
									}
									if ((cpSorted[i].role == "Support") && (topSUP.length < 5) ) {
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

				if (g.gameType == 1) {
					MMR = Math.round(ovr*ovr/55*5 +2150+skillMMR*skillMMR/200*.5,0); // up to 500 + 2200 + up to 500
				} else {
					MMR = Math.round(ovr*9 +2200+skillMMR*1,0); // up to 500 + 2200 + up to 500
				}
						//	console.log(MMR+" "+g.gameType);

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

//            if (numerator / denominator > 0.75) {
//            if (numerator / denominator > 0.80) {
//            if (numerator / denominator > 0.81) {
			var cutoff;

			if (g.gameType == 1) {
//			   cutoff = .73;
			   cutoff = .65;
			} else if (g.gameType == 5) {
//			   cutoff = .80;
			   cutoff = .65;
			} else {
			   cutoff = .65;
			}

            if (numerator / denominator > cutoff) {
//            if (numerator / denominator > 0.85) {
                return true;
            }
            return false;
        };

		       /*     SC: "Shot Calling",
            TP: "Team Player",
            GS: "Game Strategy",
            JC: "Jungle Control",
            Gk: "Ganking",
            Ta: "Tower Attack",
            Td: "Tower Defend",
            CK: "Champion Killing",
            MV: "Map Vision",
            Wd: "Ward Destruction",
            Wp: "Ward Placement",
            LS: "Lane Switching",
            Ad: "Adaptability",
            Ag: "Aggression"*/


  /*     SC: "Shot Calling",
            TP: "Team Player",
            GS: "Game Strategy",
            JC: "Jungle Control",
            Gk: "Ganking",
            Tw: "Tower Attack/Defense",
            CK: "Champion Killing",
			VW: "Vision/Warding"
            LS: "Lane Switching",
            Ad: "Adaptability",
            Ag: "Aggression"*/

 /*     SC: "Shot Calling",
            TP: "Team Player",
            GS: "Game Strategy",
            JC: "Jungle Control",
            Gk: "Ganking",
            Tw: "Tower Attack/Defense",
            CK: "Champion Killing",
			VW: "Vision/Warding"
*/

        // These use the same formulas as the composite rating definitions in core.game!
        if (hasSkill(ratings, ['hgt','stre', 'spd', 'jmp','endu', 'ins','fg'], [1,1,1,1,4, 1, 1])) {
            sk.push("SC");
        }
        if (hasSkill(ratings, ['hgt','stre', 'spd', 'jmp'], [1,1, 1, 2])) {
            sk.push("TP");
        }
        /*if (hasSkill(ratings, ['hgt','stre','spd','ins', 'dnk', 'ft', 'fg'], [1, 1,1, 1, 1, 1,1])) {
            sk.push("GS");
        }*/
        if (hasSkill(ratings, ['hgt', 'ins', 'fg', 'stre', 'spd','drb','blk','pss','reb'], [1, 1, 1,1,1,4,2,1,1])) {
            sk.push("JC");
        }
      /*  if (hasSkill(ratings, ['hgt', 'stre', 'spd', 'jmp','endu','ins', 'ft', 'fg','tp','blk','drb'], [1, 1, 1, 3,1,3,  1,12,1,1,1])) {
            sk.push("Gk");
        }*/
        if (hasSkill(ratings, ['hgt', 'stre', 'spd', 'dnk','ft','tp', 'blk', 'stl'], [1,1,1,6, 2, 2,2,2])) {
            sk.push("Tw");
        }
    /*    if (hasSkill(ratings, ['blk'], [1])) {
            sk.push("Ta");
        }
        if (hasSkill(ratings, ['tp', 'blk', 'dnk','ft'], [1, 1, .25,.25])) {
            sk.push("Td");
        }*/
        if (hasSkill(ratings, ['hgt', 'stre', 'spd', 'ins','ft', 'fg','tp', 'blk', 'drb'], [1,1,1,1, 3, 1, 1, 1, 1])) {
            sk.push("CK");
        }
        if (hasSkill(ratings, ['stl', 'blk', 'dnk','spd','pss','reb'], [2, .25, .25,.25,.25,.25])) {
            sk.push("CS");
        }

      /*  if (hasSkill(ratings, ['hgt', 'stre', 'spd','jmp', 'ins', 'fg'], [1,1,1, 4,4,4])) {
            sk.push("VW");
        }*/
        /*if (hasSkill(ratings, ['ins'], [1])) {
            sk.push("MV");
        }
        if (hasSkill(ratings, ['ins', 'jmp', 'stl'], [1, 1, 2])) {
            sk.push("Wd");
        }
        if (hasSkill(ratings, ['ins', 'jmp'], [1, 1])) {
            sk.push("Wp");
        }*/
    /*    if (hasSkill(ratings, ['hgt', 'stre', 'spd','jmp', 'ins','dnk','stl'], [1,1,1, 2, 2,2,2])) {
            sk.push("LS");
        }
        if (hasSkill(ratings,  ['hgt', 'stre', 'spd','jmp','endu','ins','fg'], [2,1,1,1,1,2,1])) {
            sk.push("Ad");
        }*/
        if (hasSkill(ratings,  ['fg', 'ins', 'tp'], [2, 1, 1])) {
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

        ratings = _.last(p.ratings);

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


		if ( valueP>85  ) {
			minAmount = 75;
			maxAmount = 999;
			amount = ((valueP - 1) / 100 - 0.45) * (maxAmount - minAmount) + minAmount;
		} else if ( valueP>60 ) {
			minAmount = 30;
			maxAmount = 125;
			amount = ((valueP - 1) / 100 - 0.45) * 3.3 *  (maxAmount - minAmount) + minAmount;

		} else {
			minAmount = 25;
			maxAmount = 40;
			amount = ((valueP - 1) / 100 - 0.45) *  (maxAmount - minAmount) + minAmount;
		}
        if (randomizeAmount) {
            amount *= helpers.bound(random.realGauss(1, 0.1), 0, 2);  // Randomize
        }

		if (p.pos == "JGL") {
		 amount *= .8;
		} else if (p.pos == "SUP") {
		 amount *= .7;
		} else if (p.pos == "MID") {
		 amount *= 1.4;
		} else if (p.pos == "TOP") {
		 amount *= 1.1;
		} else {
		 amount *= 1.2;
		}

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
            if (amount < 25) {
                amount = 25;
            }
        }

       // amount = 1 * Math.round(amount / 1);  // Make it a multiple of 50k

        amount = 1 * Math.round(amount*100)/100;  // Make it a multiple of 50k


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
     * Make sure to call player.updateValues after this! Otherwise, player values will be out of sync.
     *
     * @memberOf core.player
     * @param {Object} p Player object.
     * @param {number=} years Number of years to develop (default 1).
     * @param {boolean=} generate Generating a new player? (default false). If true, then the player's age is also updated based on years.
     * @param {number=} coachingRank From 1 to g.numTeams (default 30), where 1 is best coaching staff and g.numTeams is worst. Default is 15.5
     * @return {Object} Updated player object.
     */
    function develop(p, years, generate, coachingRank,topADC,topMID,topJGL,topTOP,topSUP) {
        var age, baseChange, baseChangeLocal, calcBaseChange, i, j, r, ratingKeys;
		var skillMMR;
		var fuzzedMMR;

        years = years !== undefined ? years : 1;
        generate = generate !== undefined ? generate : false;
        coachingRank = coachingRank !== undefined ? coachingRank : 15.5; // This applies to free agents!

        r = p.ratings.length - 1;

        age = g.season - p.born.year;

        calcBaseChange = function (age, potentialDifference) {
            var val;

            // Average rating change if there is no potential difference
            if (age <= 19) {
                val = 5+(p.ratings[r].reb-100)/200;  // was -50
            } else if (age <= 22) {
                val = 0+(p.ratings[r].reb-100)/200; // was 150
            } else if (age <= 24) {
                val = -1+(p.ratings[r].reb-100)/100; // was 3 // was 75
            } else if (age <= 26) {
                val = -2+(p.ratings[r].reb-100)/100; // was 5 // was 3 // was 50
            } else {
                val = -3+(p.ratings[r].reb-100)/100; //was 10 // was 5 // was 25
            }
		//	console.log(p.ratings[r].reb);
            // Factor in potential difference
            // This only matters for young players who have potentialDifference != 0

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

            baseChange = calcBaseChange(age, p.ratings[r].pot - p.ratings[r].ovr);

            // Modulate by coaching
            if (baseChange >= 0) { // life is normal
                baseChange *= ((coachingRank - 1) * (-0.5) / (g.numTeams - 1) + 1.25);
            } else {
                baseChange *= ((coachingRank - 1) * (0.5) / (g.numTeams - 1) + 0.75);
            }

            // Ratings that can only increase a little, and only when young. Decrease when old.
//            ratingKeys = ["spd", "jmp", "endu"];
            /*ratingKeys = ["spd", "jmp", "endu"];
            for (j = 0; j < ratingKeys.length; j++) {
                if (age <= 21) {
                    baseChangeLocal = baseChange;
                } else if (age <= 24) {
                    baseChangeLocal = baseChange - 1;
                } else {
                    baseChangeLocal = baseChange - 2;
                }
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(baseChangeLocal * random.uniform(0.5, 1.5), -20, 10));
            }*/

            // Ratings that can only increase a little, and only when young. Decrease slowly when old.
//            ratingKeys = ["drb", "pss", "reb"];
/*            ratingKeys = ["drb", "pss", "reb"];
            for (j = 0; j < ratingKeys.length; j++) {
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + helpers.bound(baseChange * random.uniform(0.5, 1.5), -1, 10));
            }*/

            // Ratings that can increase a lot, but only when young. Decrease when old.
//            ratingKeys = ["stre", "dnk", "blk", "stl"];
            ratingKeys = ["dnk", "ft", "blk", "stl","drb","tp","ins","fg"];
            for (j = 0; j < ratingKeys.length; j++) {
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + baseChange * random.uniform(0.5, 1.5));
            }

            // Ratings that increase most when young, but can continue increasing for a while and only decrease very slowly.
//            ratingKeys = ["hgt", "stre", "spd", "jmp","endu"];
            ratingKeys = ["hgt", "stre", "spd", "jmp","endu"];
            for (j = 0; j < ratingKeys.length; j++) {
                if (age <= 21) {
                    baseChangeLocal = baseChange;
                } else if (age <= 23) {
                    baseChangeLocal = baseChange + 1;
                } else {
                    baseChangeLocal = baseChange + 3;
                }
				if (baseChangeLocal<= 1) {
					baseChangeLocal = 1;
				}
                p.ratings[r][ratingKeys[j]] = limitRating(p.ratings[r][ratingKeys[j]] + baseChangeLocal * random.uniform(0.5, 1.5));
            }

//console.log([age, p.ratings[r].pot - p.ratings[r].ovr, ovr(p.ratings[r]) - p.ratings[r].ovr])
            // Update overall and potential
            p.ratings[r].ovr = ovr(p.ratings[r]);
            p.ratings[r].pot += -2 + Math.round(random.realGauss(0, 2));
            if (p.ratings[r].ovr > p.ratings[r].pot || age > 22) {
                p.ratings[r].pot = p.ratings[r].ovr;
            }




			// champion
//			p.champions = {};
			if ((p.championAverage == -1) || (p.championAverage === undefined)) {
				p.championAverage = -1;
			} else {
				p.championAverage == p.ratings[r].ovr
			}

			//console.log(p.ratings);
			//console.log(p.champions);
			//console.log(p.champions(0).name);
			//console.log(p.champions{0}.name);
			//console.log(p.champions[0].name);
			//console.log(_.size(p.champions));

			//console.log(p.champions.length+" "+g.numChampions);
//			for (j = 0; j <  _.size(p.champions); j++) {
			for (j = 0; j <  g.numChampions; j++) {
			//	console.log(j);
//			for (j = 0; j <  125; j++) {
				//console.log(j);
				//console.log(p.champions[j].skill);

				if (p.champions[j] == undefined) {
					p.champions[j] = {skill: 50};
					//console.log(p.champions[j]);
				}
				//console.log(p.champions[j]);
			////	p.champions[j].skill *=  .5;
				//p.champions[j].skill +=  p.ratings[r].ovr*.5+(Math.round(Math.random()*20,0)-10)*.5;
//				p.champions[i].skill =   p.ratings[0].ovr*.5+(Math.random()*20-10);
//				p.champions[i].skill = Math.round(p.champions[i].skill,0);
//				p.champions[j].skill =   p.ratings[0].ovr*.5+(Math.random()*20-10);
				p.champions[j].skill =   p.ratings[r].ovr*.5+(Math.random()*20-10);
				p.champions[j].skill = Math.round(p.champions[j].skill,0);
				if (p.champions[j].skill< 0) {
				   p.champions[j].skill = 0;
				} else if (p.champions[j].skill > 100 ) {
				   p.champions[j].skill = 100;
				}
				//console.log(p.champions[j].skill);
			}

			skillMMR = 0;

			//	console.log(topADC.length+" "+topTOP.length+" "+topMID.length+" "+topJGL.length+" "+topSUP.length);
			if (p.pos == "ADC") {
				for (j = 0; j <  topADC.length; j++) {
					skillMMR += p.champions[topADC[j]].skill
				}
			}
			if (p.pos == "TOP") {
				for (j = 0; j <  topTOP.length; j++) {
					skillMMR += p.champions[topTOP[j]].skill
				}
			}
			if (p.pos == "MID") {
				for (j = 0; j <  topMID.length; j++) {
					skillMMR += p.champions[topMID[j]].skill
				}
			}
			if (p.pos == "JGL") {
				for (j = 0; j <  topJGL.length; j++) {
					skillMMR += p.champions[topJGL[j]].skill
				}
			}
			if (p.pos == "SUP") {
				for (j = 0; j <  topSUP.length; j++) {
					skillMMR += p.champions[topSUP[j]].skill
				}
			}
		//	console.log(skillMMR);
			p.ratings[r].MMR = MMRcalc(p.ratings[r].ovr,skillMMR);
			//p.ratings[r].MMR = Math.round(p.ratings[r].ovr*9 +2200+skillMMR*1,0); // up to 500 + 2200 + up to 500
			//console.log(p.ratings[0].ovr+" "+skillMMR);
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




        // If this isn't here outside the loop, then 19 year old players could still have ovr > pot
        if (p.ratings[r].ovr > p.ratings[r].pot || age > 22) {
            p.ratings[r].pot = p.ratings[r].ovr;
        }

        // Likewise, If this isn't outside the loop, then 19 year old players don't get skills
        p.ratings[r].skills = skills(p.ratings[r]);

        if (generate) {
            age = g.season - p.born.year + years;
            p.born.year = g.season - age;
        }

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
    function bonus(p, amount) {
        var age, i, key, r, ratingKeys;

        // Make sure age is always defined
        age = g.season - p.born.year;

        r = p.ratings.length - 1;

        ratingKeys = ['stre', 'spd', 'jmp', 'endu', 'ins', 'dnk', 'ft', 'fg', 'tp', 'blk', 'stl', 'drb', 'pss', 'reb', 'pot'];
        for (i = 0; i < ratingKeys.length; i++) {
            key = ratingKeys[i];
            p.ratings[r][key] = limitRating(p.ratings[r][key] + amount);
        }

        // Update overall and potential
        p.ratings[r].ovr = ovr(p.ratings[r]);
        if (p.ratings[r].ovr > p.ratings[r].pot || age > 22) {
            p.ratings[r].pot = p.ratings[r].ovr;
        }

        return p;
    }

    /**
     * Calculates the base "mood" factor for any free agent towards a team.
     *
     * This base mood is then modulated for an individual player in addToFreeAgents.
     *
     * @param {(IDBObjectStore|IDBTransaction|null)} ot An IndexedDB object store or transaction on teams; if null is passed, then a new transaction will be used.
     * @return {Promise} Array of base moods, one for each team.
     */
    function genBaseMoods(ot) {
        return dao.teams.getAll({ot: ot}).then(function (teams) {
            var baseMoods, i, s;

            baseMoods = [];

            s = teams[0].seasons.length - 1;  // Most recent season index

            for (i = 0; i < teams.length; i++) {
                // Special case for winning a title - basically never refuse to re-sign unless a miracle occurs

            /*    if (teams[i].seasons[s].playoffRoundsWon === 4 && Math.random() < 0.99) {
                    baseMoods[i] = -0.25; // Should guarantee no refusing to re-sign
                } else {*/
                    baseMoods[i] = 0;

                    // Hype
//                    baseMoods[i] += 0.5 * (1 - teams[i].seasons[s].hype);
                    baseMoods[i] += (3.50 - teams[i].seasons[s].hype*3.5)*1;

                    // Facilities
                    baseMoods[i] += 0.1 * (finances.getRankLastThree(teams[i], "expenses", "facilities") - 1) / (g.numTeams - 1);

                    // Population
                 //   baseMoods[i] += 0.2 * (1 - teams[i].seasons[s].pop / 10);

                    // Randomness
             //       baseMoods[i] += random.uniform(-0.05, 0.05);

              //      baseMoods[i] = helpers.bound(baseMoods[i], 0, 1);
          //      }
            }

            return baseMoods;
        });
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
     * @return {Promise}
     */
    function addToFreeAgents(ot, p, phase, baseMoods) {
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

		eventLog.add(null, {
			type: "freeAgent",
			text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> is a free agent.',
			showNotification: (p.tid != g.userTid) && p.watch && typeof p.watch !== "function"
			//pids: [p.pid],
			//tids: [p.tid]
		});

        p.tid = g.PLAYER.FREE_AGENT;

        p.ptModifier = 1; // Reset
        p.pick = 0; // Reset
        p.ban = 0; // Reset



        // The put doesn't always work in Chrome. No idea why.
        return dao.players.put({ot: ot, value: p}).then(function () {
            return; // No output
        });
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
     * @return {Promise}
     */
    function release(tx, p, justDrafted) {
        // Keep track of player salary even when he's off the team, but make an exception for players who were just drafted
        // Was the player just drafted?
        if (!justDrafted) {
            dao.releasedPlayers.add({
                ot: tx,
                value: {
                    pid: p.pid,
                    tid: p.tid,
                    contract: p.contract
                }
            });
        }

        eventLog.add(null, {
            type: "release",
            text: '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamRegionsCache[p.tid] + '</a> released <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>.',
            showNotification: p.watch && typeof p.watch !== "function",
            pids: [p.pid],
            tids: [p.tid]
        });


        return genBaseMoods(tx).then(function (baseMoods) {
            return addToFreeAgents(tx, p, g.phase, baseMoods);
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

        fuzz = random.gauss(0, sigma);
        if (fuzz > cutoff) {
            fuzz = cutoff;
        } else if (fuzz < -cutoff) {
            fuzz = -cutoff;
        }

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
     * @return {Object} Ratings object
     */
    function genRatings(profile, baseRating, pot, season, scoutingRank, tid) {
        var i, j, key, profileId, profiles, ratingKeys, ratings, rawRating, rawRatings, sigmas;

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
//                    [10, 10, 10, 70, 10, 50, -30, 50, -30, 10, 10, -30, -30, 10, 10], // Support
                    [10, 10, 10, 50, 10, 50, -30, 50, -30, 10, 10, -30, -30, 10, 10], // Support
//                    [10, 10, 10, 25, 10, 35, -30, -30, 35, 10, 10, -30, 35, 10, 10], // Jungle
//                    [10, 10, 10, 25, 10, 35, -30, -30, 35, 10, 10, -30, 35, 10, 10], // Jungle
//                    [5, 5, 5, 35, 5, 45, -30, -30, 45, 5, 5, -30, 45, 5, 5], // Jungle
                    [15, 15, 15, 25, 15, 25, -30, -30, 30, 15, 15, -30, 30, 15, 15], // Jungle
//                    [10, 10, 10, 90, 10, 50, -30, 50, -30, 10, 10, -30, -30, 10, 10], // Support
  //                  [10, 10, 10, 30, 10, 40, -30, -30, 40, 10, 10, -30, 40, 10, 10], // Jungle
                    [10, 10, 10, 0, 0, 10, 30, 20, 0, 10, 10, 30, -10, 10, 10]]; // Top/mid/adc 210 170 160 150
        sigmas = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
        baseRating = random.gauss(baseRating, 5);

        rawRatings = [];
        for (i = 0; i < sigmas.length; i++) {
            rawRating = profiles[profileId][i] + baseRating;
            rawRatings[i] = limitRating(random.gauss(rawRating, sigmas[i]));
        }

        // Small chance of freakish ability in 2 categories
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

        ratings = {};
        ratingKeys = ["hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb"];
        for (i = 0; i < ratingKeys.length; i++) {
            key = ratingKeys[i];
            ratings[key] = rawRatings[i];
        }

        // Ugly hack: Tall people can't dribble/pass very well
       /* if (ratings.hgt > 40) {
            ratings.drb = limitRating(ratings.drb - (ratings.hgt - 50));
            ratings.pss = limitRating(ratings.pss - (ratings.hgt - 50));
        } else {
            ratings.drb = limitRating(ratings.drb + 10);
            ratings.pss = limitRating(ratings.pss + 10);
        }*/


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

		// support
   /*     if ((ratings.jmp > 40) && (ratings.ins > 40) && (ratings.ft > 40)) {
            //ratings.drb = limitRating(ratings.drb - (ratings.hgt - 50));
            ratings.fg = limitRating(ratings.fg - (ratings.jmp+ratings.ins+ratings.ft - 150)/12);
            ratings.stl = limitRating(ratings.stl - (ratings.jmp+ratings.ins+ratings.ft - 150)/12);
            ratings.drb = limitRating(ratings.drb - (ratings.jmp+ratings.ins+ratings.ft - 150)/12);
            ratings.dnk = limitRating(ratings.dnk - (ratings.jmp+ratings.ins+ratings.ft - 150)/12);
            ratings.jmp = limitRating(ratings.jmp + 20);
            ratings.ins = limitRating(ratings.ins + 20 );
            ratings.ft = limitRating(ratings.ft + 20 );
        } else {
            ratings.fg = limitRating(ratings.fg + 10);
            ratings.stl = limitRating(ratings.stl + 10);
            ratings.drb = limitRating(ratings.drb + 10 );
            ratings.dnk = limitRating(ratings.dnk + 10 );

            ratings.jmp = limitRating(ratings.jmp - 10);
            ratings.ins = limitRating(ratings.ins - 10 );
            ratings.ft = limitRating(ratings.ft - 10 );

        }*/



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

    function name() {
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

    function nameAsian() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 90.04);
        for (i = 0; i < names.first.length; i++) {
            if (names.first[i][1] >= fnRand) {
                break;
            }
        }
        fn = names.first[i][0];
		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}
        // Last name
        lnRand = random.uniform(0, 77.48);

		if (Math.random() < .50) {

			lnRand = random.uniform(0, 43.961835);
			for (i = 0; i < namesKorea.last.length; i++) {
				if (namesKorea.last[i][1] >= lnRand) {
					break;
				}
			}
			ln = namesKorea.last[i][0];
			if (typeof ln === 'undefined') {
				console.log(i+" "+ln)
			}
		} else if (Math.random() < 1.01) {

			// Last name
			lnRand = random.uniform(0, 99);
			for (i = 0; i < namesChina.last.length; i++) {
				if (i >= lnRand) {
					break;
				}
			}
			ln = namesChina.last[i];
			if (typeof ln === 'undefined') {
				console.log(i+" "+ln)
			}
		}

        return fn + " " + ln;
    }

   function nameKorean() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 199);
        for (i = 0; i < namesKorea.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesKorea.first[i];

		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}

        // Last name
        lnRand = random.uniform(0, 43.961835);
        for (i = 0; i < namesKorea.last.length; i++) {
            if (namesKorea.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesKorea.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}
        return fn + " " + ln;
    }

	function nameChinese() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 199);
        for (i = 0; i < namesChina.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesChina.first[i];

		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}
        // Last name
        lnRand = random.uniform(0, 99);
        for (i = 0; i < namesChina.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesChina.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameRussian() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 85);
        for (i = 0; i < namesRussia.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesRussia.first[i];

		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}
        // Last name
        lnRand = random.uniform(0, 1885);
        for (i = 0; i < namesRussia.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesRussia.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameTurkish() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 157);
        for (i = 0; i < namesTurkey.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesTurkey.first[i];
		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}

        // Last name
        lnRand = random.uniform(0, 569);
        for (i = 0; i < namesTurkey.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesTurkey.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameBrazilian() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 88);
        for (i = 0; i < namesBrazil.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesBrazil.first[i];
		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}

        // Last name
        lnRand = random.uniform(0, 173.909924);
        for (i = 0; i < namesBrazil.last.length; i++) {
            if (namesBrazil.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesBrazil.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameJapanese() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 942);
        for (i = 0; i < namesJapan.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesJapan.first[i];

		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}
        // Last name
        lnRand = random.uniform(0, 565);
        for (i = 0; i < namesJapan.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesJapan.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }


	function nameAustralian() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 99);
        for (i = 0; i < namesAustralia.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesAustralia.first[i];

		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}
        // Last name
        lnRand = random.uniform(0, 7.3805);
        for (i = 0; i < namesAustralia.last.length; i++) {
          if (namesAustralia.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesAustralia.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }


	function nameChilean() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 66);
        for (i = 0; i < namesChile.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesChile.first[i];
		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}

        // Last name
        lnRand = random.uniform(0, 15.80298);
        for (i = 0; i < namesChile.last.length; i++) {
            if (namesChile.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesChile.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameVietnamese() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 94);
        for (i = 0; i < namesVietnam.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesVietnam.first[i];
		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}

        // Last name
        lnRand = random.uniform(0, 88.7);
        for (i = 0; i < namesVietnam.last.length; i++) {
            if (namesVietnam.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesVietnam.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameFilipino() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 27);
        for (i = 0; i < namesPhilippines.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesPhilippines.first[i];
		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}

        // Last name
        lnRand = random.uniform(0, 28);
        for (i = 0; i < namesPhilippines.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesPhilippines.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameGerman() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesGermany.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesGermany.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesGermany.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesGermany.female[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

        // Last name
        lnRand = random.uniform(0, 27);
        for (i = 0; i < namesGermany.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesGermany.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameBelgin() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesBelgium.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesBelgium.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesBelgium.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesBelgium.female[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

        // Last name
        lnRand = random.uniform(0, 29);
        for (i = 0; i < namesBelgium.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesBelgium.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameDanish() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesDenmark.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesDenmark.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesDenmark.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesDenmark.female[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

        // Last name
        lnRand = random.uniform(0, 29);
        for (i = 0; i < namesDenmark.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesDenmark.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }


	function nameHungarian() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesHungary.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesHungary.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesHungary.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesHungary.female[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

        // Last name
        lnRand = random.uniform(0, 29);
        for (i = 0; i < namesHungary.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesHungary.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }


	function nameNorwegian() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesNorway.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesNorway.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesNorway.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesNorway.female[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

        // Last name
        lnRand = random.uniform(0, 29);
        for (i = 0; i < namesNorway.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesNorway.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameSwedish() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesSweden.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesSweden.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesSweden.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesSweden.female[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

        // Last name
        lnRand = random.uniform(0, 29);
        for (i = 0; i < namesSweden.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesSweden.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameFrench() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesFrance.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesFrance.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 28);
			for (i = 0; i < namesFrance.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesFrance.female[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

        // Last name
        lnRand = random.uniform(0, 28);
        for (i = 0; i < namesFrance.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesFrance.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameLatAmN() {
        var fn, fnRand, i, ln, lnRand;

		// First name
		fnRand = random.uniform(0, 14);
		for (i = 0; i < namesLatAmN.first.length; i++) {
			if (i >= fnRand) {
				break;
			}
		}
		fn = namesLatAmN.first[i];
		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}

        // Last name
        lnRand = random.uniform(0, 13);
        for (i = 0; i < namesLatAmN.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesLatAmN.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameLatAmS() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 19);
        for (i = 0; i < namesLatAmS.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesLatAmS.first[i];
		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}


        // Last name
        lnRand = random.uniform(0, 27.0);
        for (i = 0; i < namesLatAmS.last.length; i++) {
            if (namesLatAmS.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesLatAmS.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }


	function nameDutch() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
//		if (Math.random() <.2) {
			// First name
			fnRand = random.uniform(0, 372);
			for (i = 0; i < namesNetherlands.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesNetherlands.first[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}

		} else {

			// Female name
			fnRand = random.uniform(0, 115);
			for (i = 0; i < namesNetherlands.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
		//	console.log(i+" "+fnRand+" "+namesNetherlands.female.length);
			fn = namesNetherlands.female[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}

		}

        // Last name
        lnRand = random.uniform(0, 97);
        for (i = 0; i < namesNetherlands.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesNetherlands.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameEnglish() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, namesEngland.first.length-1);
			for (i = 0; i < namesEngland.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesEngland.first[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}

		} else {

			// Female name
			fnRand = random.uniform(0, namesEngland.female.length-1);
			for (i = 0; i < namesEngland.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesEngland.female[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}

		}

        // Last name
        lnRand = random.uniform(0, namesEngland.last.length-1);
        for (i = 0; i < namesEngland.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesEngland.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function namePolish() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 33);
			for (i = 0; i < namesPoland.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesPoland.first[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}

		} else {

			// Female name
			fnRand = random.uniform(0, 17);
			for (i = 0; i < namesPoland.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesPoland.female[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}

		}

       // Last name
        lnRand = random.uniform(0, 288.72078);
        for (i = 0; i < namesPoland.last.length; i++) {
            if (namesPoland.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesPoland.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameRomanian() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 50);
			for (i = 0; i < namesRomania.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesRomania.first[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 21);
			for (i = 0; i < namesRomania.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesRomania.female[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

       // Last name
        lnRand = random.uniform(0, 49);
        for (i = 0; i < namesRomania.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesRomania.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameSpanish() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 214);
			for (i = 0; i < namesSpain.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesSpain.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 45);
			for (i = 0; i < namesSpain.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesSpain.female[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

       // Last name
        lnRand = random.uniform(0, 87.59);
        for (i = 0; i < namesSpain.last.length; i++) {
            if (namesSpain.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesSpain.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameScottish() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 38);
			for (i = 0; i < namesScotland.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesScotland.first[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
//			fn = "test";
		} else {

			// Female name
			fnRand = random.uniform(0, 29);
			for (i = 0; i < namesScotland.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesScotland.female[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

       // Last name
        lnRand = random.uniform(0, 42);
        for (i = 0; i < namesScotland.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesScotland.last[i][0];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameGreek() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <1.01) { //Female names wrong
			// First name
			fnRand = random.uniform(0, 75.03);
			for (i = 0; i < namesGreece.first.length; i++) {
				if (namesGreece.first[i][1] >= fnRand) {
					break;
				}
			}
			fn = namesGreece.first[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 17);
			for (i = 0; i < namesGreece.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesGreece.female[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

       // Last name
        lnRand = random.uniform(0, 11);
        for (i = 0; i < namesGreece.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesGreece.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameArmenian() {//here
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <1.01) { //Female names wrong
			// First name
			fnRand = random.uniform(0, 47);
			for (i = 0; i < namesArmenia.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesArmenia.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {


			// Female name
			fnRand = random.uniform(0, 17);
			for (i = 0; i < namesArmenia.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesArmenia.female[i][0];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

       // Last name
        lnRand = random.uniform(0,53);
        for (i = 0; i < namesArmenia.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesArmenia.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameBulgarian() {
        var fn, fnRand, i, ln, lnRand;

		if (Math.random() <.98) {
			// First name
			fnRand = random.uniform(0, 64);
			for (i = 0; i < namesBulgaria.first.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesBulgaria.first[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		} else {

			// Female name
			fnRand = random.uniform(0, 52);
			for (i = 0; i < namesBulgaria.female.length; i++) {
				if (i >= fnRand) {
					break;
				}
			}
			fn = namesBulgaria.female[i];
			if (typeof fn === 'undefined') {
				console.log(i+" "+fn)
			}
		}

       // Last name
        lnRand = random.uniform(0, 9);
        for (i = 0; i < namesBulgaria.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesBulgaria.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }

	function nameCanadian() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 99);
        for (i = 0; i < namesCanada.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesCanada.first[i];

		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}
        // Last name
        lnRand = random.uniform(0, 299);
        for (i = 0; i < namesCanada.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesCanada.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }
	function nameFrenchCanadian() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 99);
        for (i = 0; i < namesFrenchCanada.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }
        fn = namesFrenchCanada.first[i];

		if (typeof fn === 'undefined') {
			console.log(i+" "+fn)
		}
        // Last name
        lnRand = random.uniform(0, 38);
        for (i = 0; i < namesFrenchCanada.last.length; i++) {
            if (i >= lnRand) {
                break;
            }
        }
        ln = namesFrenchCanada.last[i];
		if (typeof ln === 'undefined') {
			console.log(i+" "+ln)
		}

        return fn + " " + ln;
    }



    function nameIcelanders() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 75);
        for (i = 0; i < namesIceland.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }

        fn = namesIceland.first[i][0];

        // Last name
        lnRand = random.uniform(0, 102);
        for (i = 0; i < namesIceland.last.length; i++) {
            if (namesIceland.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesIceland.last[i][0];

        return fn + " " + ln;
    }

    function nameItalian() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 89);
        for (i = 0; i < namesItaly.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }

        fn = namesItaly.first[i][0];

        // Last name
        lnRand = random.uniform(0, 102);
        for (i = 0; i < namesItaly.last.length; i++) {
            if (namesItaly.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesItaly.last[i][0];

        return fn + " " + ln;
    }

   function nameSwiss() {
        var fn, fnRand, i, ln, lnRand;

        // First name
        fnRand = random.uniform(0, 89);
        for (i = 0; i < namesSwitzerland.first.length; i++) {
            if (i >= fnRand) {
                break;
            }
        }

        fn = namesSwitzerland.first[i][0];

        // Last name
        lnRand = random.uniform(0, 82);
        for (i = 0; i < namesSwitzerland.last.length; i++) {
            if (namesSwitzerland.last[i][1] >= lnRand) {
                break;
            }
        }
        ln = namesSwitzerland.last[i][0];

        return fn + " " + ln;
    }

    function userID() {
        var prefixID,baseID,suffixID,numberID,prefixRand,baseRand, suffixRand, i, numberRand,userID;

		var usedSomething;
		//prefix,base,suffix,number;

       prefixRand = random.uniform(0, userIDs.prefix.length-1);

        for (i = 0; i < userIDs.prefix.length; i++) {
            if (i >= prefixRand) {
                break;
            }
        }
        prefixID = userIDs.prefix[i];


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
		//  console.log(userID.length);
		//  console.log(suffixID.length);
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

//		if (usedSomething == 0) {
			if (Math.random() < .25 ) {
			  userID = userID.replace("i", "I");
			  usedSomething += 1;
			}
//		}

//		if (usedSomething == 0) {
			if (Math.random() < .10 ) {
			  userID = userID.replace("a", "A");
			  usedSomething += 1;
			}
//		}
//		if (usedSomething == 0) {
			if (Math.random() < .10 ) {
			  userID = userID.replace("e", "E");
			  usedSomething += 1;
			}
//		}
//		if (usedSomething == 0) {
			if (Math.random() < .10 ) {
			  userID = userID.replace("o", "O");
			  usedSomething += 1;
			}

			if (Math.random() < .10 ) {
			  userID = userID.replace("u", "U");
			  usedSomething += 1;
			}
//		}

        return userID;
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
		} else if (nationality == 'SEA') {

			if (Math.random() < .5) {
				country = 'Philippines';
			} else {
				country = 'Vietnam';
			}
		} else if (nationality == 'TR') {
			country = 'Turkey';
		} else {
			country = 'United States';
		}

        return country;
    }


    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function languages(country) {
		var languages;
		//console.log(country);
		languages = [];

		if (country == 'United States') {
			languages.push('English');
		} else if (country == 'Canada') {
			if (Math.random() < .8) {
				languages.push('English');
			} else {
				languages.push('French');
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
		} else if (country == 'Korea') {
			languages.push('Korean');
		} else if (country == 'China') {
			languages.push('Chinese');
			if (Math.random() < .08) {
				languages.push('English');
			}
		} else if (country == 'Taiwan') {
			languages.push('Chinese');
		} else if (country == 'Russia') {
			languages.push('Russian');
			if (Math.random() < .05) {
				languages.push('English');
			}
		} else if (country == 'Brazil') {
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
		} else if (country == 'Peru') {
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
		} else if (country == 'Philippines') {
			languages.push('Filipino');
			if (Math.random() < .65) {
				languages.push('English');
			}
		} else if (country == 'Vietnam') {
			languages.push('Vietnamese');
		} else if (country == 'Turkey') {
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
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function pos(ratings) {
 /*       var gank, lane, tower, team, position, lead, skill,fight,skill2,team2,fight2,skill3,fight3;

        gank = false;
        lane = false;
        team = false;
        fight = false;
        skill = false;
        team2 = false;
        skill2 = false;
        fight2 = false;
        skill3 = false;
        fight3 = false;

        // Default position
        if (ratings.stl >= 30) {
            position = 'TOP';
        } else {
            position = 'SUP';
        }

        if ((ratings.dnk <=  ratings.ins*.4 )) {
            gank = true;  // laning < awareness
        }
        if (( (ratings.drb+ratings.blk)/2*3 > ratings.stl)) {   // spell+skill / 2 > last hitting
            skill = true;
        }
        if (( (ratings.drb+ratings.blk)/3 > ratings.stl)) {   // spell+skill / 2 > last hitting
            skill2 = true;
        }
       if (( (ratings.drb+ratings.blk) > ratings.stl)) {   // spell+skill / 2 > last hitting
            skill3 = true;
        }
        if (( (ratings.jmp+ratings.ft)/2*3 > (ratings.stl+ratings.dnk) )) {  // team player plus team fighting > last hit + laning
             team = true;
        }
        if (( (ratings.jmp+ratings.ft) > (ratings.stl+ratings.dnk) )) {  // team player plus team fighting > last hit + laning
             team2 = true;
        }

        if ((ratings.stl*1.5 > ratings.jmp) ) {  // last hit > team player
            fight = true;
        }
        if ((ratings.stl*2 > ratings.jmp) ) {  // last hit > team player
            fight2 = true;
        }
        if ((ratings.stl*1 > ratings.jmp) ) {  // last hit > team player
            fight3 = true;
        }
        if (skill && team && fight) {
            position = 'ADC';
        } else if (fight3 && skill3) {
            position = 'MID';
        } else if (gank) {
            position = 'JGL';
        } else if (fight2) {
            position = 'TOP';
        }*/

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
//		if ((ratings.drb >  ratings.ft*1.4)) {
//		if ((ratings.drb >  ratings.ft*1.0)) {
//		if ((ratings.drb >  ratings.ft*1.2)) {
//		if ((ratings.drb >  ratings.ft*1.6)) {
		if ((ratings.drb >  ratings.ft*5.0)) {
            sumsp = true;  // sumspell > teamfighting
        }
//		if ((ratings.ft >  ratings.dnk*1.5)) {
//		if ((ratings.ft >  ratings.dnk*1.8)) {
//		if ((ratings.ft >  ratings.dnk*2.0)) {
		if ((ratings.ft >  ratings.dnk*1.0)) {
//		if ((ratings.ft >  ratings.dnk*1.0)) {
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
/*		    if (risk && sumsp ) {
				position = 'JGL';
			} else if (teamfight) {
				position = 'SUP';*/
			} else {

				if (risk) {
					position = 'TOP';
		        } else if (teamfight) {
					position = 'ADC';
				} else {
					position = 'MID';
				}

			/*	if (Math.random() < .75) {
					position = 'MID';
				} else {
					position = 'TOP';
				}*/
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
            /*position = 'TOP';
            position = 'JGL';
            position = 'MID';
            position = 'ADC';
            position = 'SUP';*/

        return position;
    }


    /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
    function pos2(ratings) {
        var c, g, pf, pg, position, sf, sg;

        g = false;
        pg = false;
        sg = false;
        sf = false;
        pf = false;
        c = false;

        // Default position
        if (ratings.drb >= 50) {
//            position = 'GF';
            position = 'M';
        } else {
//            position = 'F';
            position = 'A';
        }

        if (ratings.hgt <= 30 || ratings.spd >= 85) {
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
//            position = 'PG';
            position = 'S';
        } else if (!pg && (g || sg) && !sf && !pf && !c) {
//            position = 'SG';
//            position = 'SA';
            position = 'F';
        } else if (!pg && !sg && sf && !pf && !c) {
//            position = 'SF';
            position = 'T';
        } else if (!pg && !sg && !sf && pf && !c) {
//            position = 'PF';
            position = 'R';
        } else if (!pg && !sg && !sf && !pf && c) {
//            position = 'C';
            position = 'SM';
        }

        // Multiple poss
        if ((pf || sf) && g) {
//            position = 'GF';
            position = 'FT';
        } else if (c && (pf || sf)) {
            // This means that anyone with c=true and height >=70 will NOT be labeled just a C. only pure Cs are short guys!
//            position = 'FC';
            position = 'RM';
        } else if (pg && sg) {
//            position = 'G';
            position = 'SM';
        }
        if (position === 'F' && ratings.drb <= 20) {
//            position = 'PF';
            position = 'AM';
        }

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
     * Add a new row of stats to the playerStats database.
     *
     * A row contains stats for unique values of (pid, team, season, playoffs). So new rows need to be added when a player joins a new team, when a new season starts, or when a player's team makes the playoffs. The team ID in p.tid and player ID in p.pid will be used in the stats row, so if a player is changing teams, update p.tid before calling this.
     *
     * The return value is the player object with an updated statsTids as its argument. This is NOT written to the database within addStatsRow because it is often updated in several different ways before being written. Only the entry to playerStats is actually written to the databse by this function (which happens asynchronously). You probably want to write the updated player object to the database soon after calling this, in the same transaction.
     *
     * @memberOf core.player
     * @param {(IDBObjectStore|IDBTransaction|null)} ot An IndexedDB object store or transaction on playerStats readwrite; if null is passed, then a new transaction will be used.
     * @param {Object} p Player object.
     * @param {=boolean} playoffs Is this stats row for the playoffs or not? Default false.
     * @return {Object} Updated player object.
     */
    function addStatsRow(ot, p, playoffs) {
        var ps, statsRow, stopOnSeason;

        playoffs = playoffs !== undefined ? playoffs : false;

	//	console.log(playoffs);
        statsRow = {pid: p.pid, season: g.season, seasonSplit: g.seasonSplit, tid: p.tid, playoffs: playoffs, gp: 0, gs: 0, min: 0, fg: 0, fga: 0, fgp: 0, fgpAtRim: 0, fgAtRim: 0, fgaAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0, trb: 0, ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, per: 0, ewa: 0, yearsWithTeam: 1, oppJM: 0,oppTw: 0,oppInh: 0,	 champPicked: "",wardP:0,wardD:0,wardPT:0,wardDT:0,klsT:0,dthT:0,astT:0,gldT:0,mnnT:0,kda:0,klsP:0,dthP:0,astP:0,gldP:0,mnnP:0,wardDP:0,wardPP:0,rh:0,scTwr:0,scKills:0,
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
			ChmpnKills:0
		};

        p.statsTids.push(p.tid);
        p.statsTids = _.uniq(p.statsTids);

        // Calculate yearsWithTeam
        // Iterate over player stats objects, most recent first
        ps = [];
        Promise.try(function () {
            if (!playoffs) {
                // Because the "pid, season, tid" index does not order by psid, the first time we see a tid !== p.tid could
                // be the same season a player was traded to that team, and there still could be one more with tid ===
                // p.tid. So when we se tid !== p.tid, set stopOnSeason to the previous (next... I mean lower) season so we
                // can stop storing stats when it's totally safe.
                stopOnSeason = 0;

                return dao.playerStats.iterate({
                    ot: ot,
                    index: "pid, season, tid",
                    key: IDBKeyRange.bound([p.pid, 0], [p.pid, g.season + 1]),
                    direction: "prev",
                    callback: function (psTemp, shortCircuit) {
                        // Skip playoff stats
                        if (psTemp.playoffs) {
                            return;
                        }

                        // Continue only if we haven't hit a season with another team yet
                        if (psTemp.season === stopOnSeason) {
                            shortCircuit();
                        } else {
                            if (psTemp.tid !== p.tid) {
                                // Hit another team! Stop after this season is exhausted
                                stopOnSeason = psTemp.season - 1;
                            }

                            // Store stats
                            ps.push(psTemp);
                        }
                    }
                });
            }
        }).then(function () {
            var i;

            ps = ps.sort(function (a, b) {
                // Sort seasons in descending order. This is necessary because otherwise the index will cause ordering to be by tid within a season, which is probably not what is ever wanted.
                return b.psid - a.psid;
            });

            // Count non-playoff seasons starting from the current one
            for (i = 0; i < ps.length; i++) {
                if (ps[i].tid === p.tid) {
                    statsRow.yearsWithTeam += 1;
                } else {
                    break;
                }
                // Is this a complete duplicate entry? If so, not needed. This can happen e.g. in fantasy draft
                // This is not quite a unique constraint because if a player is traded away from a team then back again, this check won't be reached because of the "break" above. That's fine. It shows the stints separately, which is probably best.
                if (ps[i].pid === statsRow.pid && ps[i].season === statsRow.season && ps[i].tid === statsRow.tid && ps[i].playoffs === statsRow.playoffs) {
                    return;
                }
            }

            dao.playerStats.add({ot: ot, value: statsRow});
        });

        return p;
    }

    function generate(tid, age, profile, baseRating, pot, draftYear, newLeague, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP) {
        var maxHgt, maxWeight, minHgt, minWeight, nationality, country, p,i;


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
		if (((g.gameType  < 2) || ((g.gameType == 5)  && (p.tid<=9) && (p.tid>=0))) && (g.regionType != "EU"))  {
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
		} else if (((g.gameType == 5)  && (p.tid<=19) && (p.tid>=10)) ||  (g.regionType == "EU"))  {

			nationality = 'EU';
			if (Math.random() > .93) { // was .8
//				nationality = 'NA';
				nationality = 'KR';
			} else if (Math.random() < .02) {
				nationality = 'SEA';
//			} else if (Math.random() > .45) {
//			} else if (Math.random() > .80) {
	//			nationality = 'KR';
		//	} else if (Math.random() > .45) {
			//	nationality = 'SEA';
			} else {
				nationality = 'EU';
			}

		} else if ((g.gameType == 2) || ((g.gameType == 5) && (p.tid>=20) && (p.tid<=29))) {
			nationality = 'KR';
			/*if (Math.random() > .99) {
				nationality = 'NA';
			} else if (Math.random() > .99) {
				nationality = 'EU';
			} else if (Math.random() > .05) {
				nationality = 'KR';
			} else if (Math.random() > .50) {
				nationality = 'TW';
			} else {
				nationality = 'KR';
			}*/
		} else if ((g.gameType == 3) || ((g.gameType == 5) && (p.tid>=30) && (p.tid<=41))) {
			nationality = 'CN';
			if (Math.random() > .80) {
		//		nationality = 'NA';
			//} else if (Math.random() > .99) {
				//nationality = 'EU';
			//} else if (Math.random() > .85) {
				nationality = 'KR';
			} else if (Math.random() > .95) {
				nationality = 'TW';
			} else {
				nationality = 'CN';
			}
		} else if ((g.gameType == 4) || ((g.gameType == 5) && (p.tid>=42) && (p.tid<=49))) {
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
		} else if (g.gameType == 5) {
					nationality = 'KR';
		       if (p.tid == 50) {
					nationality = 'SEA';
			   }
		       if (p.tid == 51) {
					nationality = 'JP';
			   }
		       if (p.tid == 52) {
					nationality = 'LatAm';
			   }
		       if (p.tid == 53) {
					nationality = 'TR';
			   }
		       if (p.tid == 54) {
					nationality = 'OCE';
			   }

		       if (p.tid == 55) {
					nationality = 'BR';
			   }
		       if (p.tid == 56) {
					nationality = 'CIS';
			   }
		       if (p.tid < 0) {

					if (Math.random() < .15) {
						nationality = 'NA';
					} else if (Math.random() < .20) {
						nationality = 'EU';
					} else if (Math.random() < .25) {
						nationality = 'CN';
					} else if (Math.random() < .33) {
						nationality = 'TW';
					} else if (Math.random() < .60) {
						nationality = 'KR';
					} else if (Math.random() < .1) {
						nationality = 'TR';
					} else if (Math.random() < .15) {
						nationality = 'CIS';
					} else if (Math.random() < .20) {
						nationality = 'SEA';
					} else if (Math.random() < .25) {
						nationality = 'JP';
					} else if (Math.random() < .33) {
						nationality = 'LatAm';
					} else if (Math.random() < .5) {
						nationality = 'OCE';
					} else  {
						nationality = 'BR';
					}
			   }

		} else {
				nationality = 'NA';
		}

		country = 'US';


		//https://en.wikipedia.org/wiki/List_of_countries_by_English-speaking_population

		//http://www.pewresearch.org/fact-tank/2015/10/08/more-than-any-other-foreign-language-european-youths-learn-english/
		// younger people speak at higher rate than older
		if (nationality == 'NA') {

			if (Math.random() < .90) {
				country = 'United States';

				p.languages.push('English');

				if (Math.random() < .60) {
					p.name = name();
				} else {
					p.name = nameAsian();
				}

			} else  {
				country = 'Canada';
				if (Math.random() < .8) {
					p.name = nameCanadian();
					p.languages.push('English');
				} else {
					p.name = nameFrenchCanadian();
					p.languages.push('French');
				}
			}

		} else if (nationality == 'EU') {
			p.name = name();
			if (Math.random() < .10) {
				p.name = nameGerman();
				country = 'Germany';
				p.languages.push('German');
				if (Math.random() < .85) {
					p.languages.push('English');
				}
			} else if (Math.random() < .02) {
				p.name = nameRomanian();
				country = 'Romania';
				p.languages.push('Romanian');
				//Hungarian, English, Lithuanian, Bulgarian, Serbo-Croatian, Russian, Slovak, Romani, Ukrainian, and German
				if (Math.random() < .45) {
					p.languages.push('English');
				}
			} else if (Math.random() < .11) {
				p.name = nameSpanish();
				country = 'Spain';
				p.languages.push('Spanish');
				if (Math.random() < .90) {
					p.languages.push('English');
				}
			} else if (Math.random() < .03) {
				p.name = nameScottish();
				country = 'Scotland';
				p.languages.push('English');
			} else if (Math.random() < .06) {
				p.name = nameGreek();
				country = 'Greece';
				p.languages.push('Greek');
				if (Math.random() < .75) {
					p.languages.push('English');
				}
			} else if (Math.random() < .02) {
				p.name = nameArmenian();
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
				p.name = nameBulgarian();
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
				p.name = nameDutch();
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
				p.name = nameEnglish();
				country = 'England';
				p.languages.push('English');
			} else if (Math.random() < .18) {
				p.name = namePolish();
				country = 'Poland';
				p.languages.push('Polish');
				if (Math.random() < .95) {
					p.languages.push('English');
				}
			} else if (Math.random() < .20) {
				p.name = nameBelgin();
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
				p.name = nameDanish();
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
				p.name = nameHungarian();
				country = 'Hungary';
				p.languages.push('Hungarian');
				if (Math.random() < .40) {
					p.languages.push('English');
				}
			} else if  (Math.random() < .30) {
				p.name = nameNorwegian();
				country = 'Norway';
				p.languages.push('Norwegian');
				if (Math.random() < .95) {
					p.languages.push('English');
				}
			} else if (Math.random() < .4) {
				p.name = nameSwedish();
				country = 'Sweden';
				p.languages.push('Swedish');
				if (Math.random() < .96) {
					p.languages.push('English');
				}
			} else if (Math.random() < .50) {
				p.name = nameFrench();
				country = 'France';
				p.languages.push('French');
				if (Math.random() < .93) {
					p.languages.push('English');
				}
			} else if (Math.random() < .70) {
				p.name = nameItalian();
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
				p.name = nameSwiss();
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
				p.name = nameIcelanders();
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

				p.name = name();
				country = 'United States';
				p.languages.push('English');
			}

		} else if (nationality == 'KR') {
			p.name = nameKorean();
			country = 'Korea';
			p.languages.push('Korean');
		} else if (nationality == 'CN' ) {
			p.name = nameChinese();
			country = 'China';
			p.languages.push('Chinese');
			if (Math.random() < .08) {
				p.languages.push('English');
			}
		} else if (nationality == 'TW') {
			p.name = nameChinese();
			country = 'Taiwan';
			p.languages.push('Chinese');
		} else if (nationality == 'CIS') {
			p.name = nameRussian();
			country = 'Russia';
			p.languages.push('Russian');
			if (Math.random() < .05) {
				p.languages.push('English');
			}
		} else if (nationality == 'BR') {
			p.name = nameBrazilian();
			country = 'Brazil';
			p.languages.push('Portuguese');
			if (Math.random() < .05) {
				p.languages.push('English');
			}
		} else if (nationality == 'JP') {
			p.name = nameJapanese();
			country = 'Japan';
			p.languages.push('Japanese');
		} else if (nationality == 'OCE') {
			p.name = nameAustralian();
			country = 'Australia';
			p.languages.push('English');
		} else if (nationality == 'LatAm') {
			if (Math.random() < .15) {
				p.name = nameChilean();
				country = 'Chile';
				p.languages.push('Spanish');
				if (Math.random() < .10) {
					p.languages.push('English');
				}
			} else if (Math.random() < .55) {
				p.name = nameLatAmN();
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
				p.name = nameLatAmS();
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
		} else if (nationality == 'SEA') {


			if (Math.random() < .5) {
				p.name = nameFilipino();
				country = 'Philippines';
				p.languages.push('Filipino');
				if (Math.random() < .64) {
					p.languages.push('English');
				}

			} else {
				p.name = nameVietnamese();
				country = 'Vietnam';
				p.languages.push('Vietnamese');

			}

		} else if (nationality == 'TR') {
			p.name = nameTurkish();
			country = 'Turkey';
			p.languages.push('Turkish');
			if (Math.random() < .17) {
				p.languages.push('English');
			}
		} else {
			p.name = name();
			country = 'United States';
			p.languages.push('English');
		}

		//p.languages.push('Test2');
		//p.languages.push('Test3');
        p.born = {
            year: g.season - age,
            country: country,
            loc: nationality
        };


        p.ratings = [];

		if (nationality == 'KR') {
			baseRating += 6;
		} else {
			baseRating -= 1;
		}

        if (newLeague) {
            // Create player for new league
            p.ratings.push(genRatings(profile, baseRating, pot, g.startingSeason, scoutingRank, tid));
        } else {
            // Create player to be drafted
            p.ratings.push(genRatings(profile, baseRating, pot, draftYear, scoutingRank));
        }

		/*console.log(p.ratings);
		console.log(p.ratings[0]);
		console.log(p.ratings[0].ovr);
		console.log(p.ratings[1]);
		console.log(p.ratings[2]);
		console.log(pot);*/

		p.champions = {};

		// this needs to call from champions list, really should be global
//        for (i = 0; i <  champions.champion.length; i++) {
//	console.log(g.numChampions);
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

			//p.champions[i].name =   champion.name(i,0);
		}

		// use YWT
		/*p.synergy = {};
        for (i = 0; i <  g.numChampions; i++) {
			p.synergy.SUP = .5;
			p.synergy.ADC = .5;
			p.synergy.TOP = .5;
			p.synergy.MID = .5;
			p.synergy.JGL = .5;
		}*/
		//console.log(p.synergy)
	//	console.log(p.champions[0].skill+" "+p.ratings[0].ovr);



      /*  if (newLeague) {
            // Create player for new league
            p.ratings.push(genRatings(profile, baseRating, pot, g.startingSeason, scoutingRank));
        } else {
            // Create player to be drafted
            p.ratings.push(genRatings(profile, baseRating, pot, draftYear, scoutingRank));
        }*/

	//	console.log(p.champions[0].skill);
		//console.log(champions.champion.length);

		 //dao.champions.getAll({ot: ot}),
		         /*return dao.playerStats.getAll({
                        ot: tx,
                        index: "pid, season, tid",
                        key: IDBKeyRange.bound([p.pid], [p.pid, ''])
                    }).then(function (playerStats) {
					      if (update) {
                            return p;
                        }
                    });*/


		p.championsRnk = {};
        for (i = 0; i <  g.numChampions; i++) {
			p.championsRnk[i] = {};
			p.championsRnk[i].skill =  0;
			p.championsRnk[i].name =   "";
		}
		p.championAverage = -1;
	//	console.log(p.champions[0].skill+" "+p.champions[0].name);
		// test using player synergy, tracks how many games player together
		// went with YWT for main synergy, can use this to be more precise at some point.
		p.teamSyn = {};
        for (i = 0; i <  8; i++) {
			p.teamSyn[i] = {};
			p.teamSyn[i].name =  "";
			p.teamSyn[i].games =   0;
		}

        if (tid === g.PLAYER.UNDRAFTED_2) {
            p.ratings[0].fuzz *= 2;
        } else if (tid === g.PLAYER.UNDRAFTED_3) {
            p.ratings[0].fuzz *= 4;
        }

        minHgt = 63;  // 5'3"
        maxHgt = 73;  // 6'1"
        minWeight = 110;
        maxWeight = 170;

        p.pos = pos(p.ratings[0]);  // Position (TOP,MID,JGL,ADC,SUP)
        p.pos2 = pos2(p.ratings[0]);  // Position (PG, SG, SF, PF, C, G, GF, FC)


		//console.log(p.ratings.season);
//		console.log(p.ratings[r].season);
	//	console.log(p.ratings.length);
	//	console.log(p.ratings[0].season);
	//	console.log(p.ratings[0].ovr);
	//	console.log(p.pos);
	//	console.log(p.pos2);
	//	console.log(p.champions[topADC[0]].skill);
		/*console.log(p.pos);
		console.log(p.champions[topADC[0]].skill);
		console.log(p.champions[topADC[1]].skill);
		console.log(p.champions[topADC[2]].skill);
		console.log(p.champions[topADC[3]].skill);
		console.log(p.champions[topADC[4]].skill);		*/
		var skillMMR;
		skillMMR = 0;

		if (p.pos == "ADC") {
			for (i = 0; i <  topADC.length; i++) {
				skillMMR += p.champions[topADC[i]].skill
			}
		}
		if (p.pos == "TOP") {
			for (i = 0; i <  topTOP.length; i++) {
				skillMMR += p.champions[topTOP[i]].skill
			}
		}
		if (p.pos == "MID") {
			for (i = 0; i <  topMID.length; i++) {
				skillMMR += p.champions[topMID[i]].skill
			}
		}
		if (p.pos == "JGL") {

			for (i = 0; i <  topJGL.length; i++) {
			//console.log(i);
			//console.log(topJGL[i]);
				skillMMR += p.champions[topJGL[i]].skill
			//console.log(skillMMR);
			}
		}
		if (p.pos == "SUP") {
			for (i = 0; i <  topSUP.length; i++) {
				skillMMR += p.champions[topSUP[i]].skill
			}
		}
	//	console.log(skillMMR);
		p.ratings[0].MMR = MMRcalc(p.ratings[0].ovr,skillMMR);
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

	//	p.ratings[0].MMR = skillMMR; // up to 500 + 2200 + up to 500
	//	console.log(p.ratings[0].MMR);
	//	console.log(p.ratings[0].rank);

	//	console.log(p.ratings[0].rank);
	//	console.log(p.champions);

        p.hgt = Math.round(random.randInt(-2, 2) + p.ratings[0].hgt * (maxHgt - minHgt) / 100 + minHgt);  // Height in inches (from minHgt to maxHgt)
        p.weight = Math.round(random.randInt(-20, 20) + (p.ratings[0].hgt + 0.5 * p.ratings[0].stre) * (maxWeight - minWeight) / 150 + minWeight);  // Weight in pounds (from minWeight to maxWeight)





		p.userID = userID();

		//console.log(p.name.split(" ").length);
		if (p.name.split(" ").length == 2) {
			p.name = p.name.split(" ")[0] + " '"+p.userID +"' " + p.name.split(" ")[1];
		} else if (p.name.split(" ").length == 3) {
			p.name = p.name.split(" ")[0] + " '"+p.userID +"' " + p.name.split(" ")[1]+" "+p.name.split(" ")[2];
		} else if (p.name.split(" ").length == 4) {
			p.name = p.name.split(" ")[0] + " '"+p.userID +"' " + p.name.split(" ")[1]+" "+p.name.split(" ")[2]+" "+p.name.split(" ")[3];
		} else {
			p.name = p.name.split(" ")[0] + " '"+p.userID +"' " + p.name.split(" ")[1]+" "+p.name.split(" ")[2]+" "+p.name.split(" ")[3]+" "+p.name.split(" ")[4];
		}



	//	console.log(p.userID);
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

        p.face = faces.generate();
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
        p = setContract(p, genContract(p), false);

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
        var i, rand;

        rand = random.uniform(0, 10882);
        for (i = 0; i < injuries.cumSum.length; i++) {
            if (injuries.cumSum[i] >= rand) {
                break;
            }
        }
        return {
            type: injuries.types[i],
            gamesRemaining: Math.round((0.7 * (healthRank - 1) / (g.numTeams - 1) + 0.65) * random.uniform(0.25, 1.75) * injuries.gamesRemainings[i])
        };
    }

    /**
     * How many seasons are left on this contract? The answer can be a fraction if the season is partially over
     *
     * @memberOf core.player
     * @param {Object} exp Contract expiration year.
     * @return {number} numGamesRemaining Number of games remaining in the current season (0 to 82).
     */
    function contractSeasonsRemaining(exp, numGamesRemaining) {
        return (exp - g.season) + numGamesRemaining / 20;
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
            var award, awardsGroupedTemp, i;

            for (i = 0; i < options.attrs.length; i++) {
                if (options.attrs[i] === "age") {
                    fp.age = g.season - p.born.year;
                } else if (options.attrs[i] === "draft") {
                    fp.draft = p.draft;
                    fp.draft.age = p.draft.year - p.born.year;
                    if (options.fuzz) {
                        fp.draft.ovr = Math.round(helpers.bound(fp.draft.ovr + p.ratings[0].fuzz, 0, 100));
                        fp.draft.pot = Math.round(helpers.bound(fp.draft.pot + p.ratings[0].fuzz, 0, 100));
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
                    fp.contract.amount = fp.contract.amount / 1;  // [millions of dollars]
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
                        fp.teamName = "Prospect";
                    } else if (p.tid === g.PLAYER.RETIRED) {
                        fp.teamName = "Retired";
                    }
                } else if (options.attrs[i] === "injury" && options.season !== null && options.season < g.season) {
                    fp.injury = {type: "Healthy", gamesRemaining: 0};
                } else if (options.attrs[i] === "salaries") {
                    fp.salaries = _.map(p.salaries, function (salary) { salary.amount /= 1; return salary; });
                } else if (options.attrs[i] === "salariesTotal") {
                    fp.salariesTotal = _.reduce(fp.salaries, function (memo, salary) { return memo + salary.amount; }, 0);
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
                        if (options.ratings[k] === "dovr" || options.ratings[k] === "dpot") {
                            // Handle dovr and dpot - if there are previous ratings, calculate the fuzzed difference
                            cat = options.ratings[k].slice(1); // either ovr or pot
                            if (j > 0) {
                                fp.ratings[options.ratings[k]] = Math.round(helpers.bound(p.ratings[j][cat] + p.ratings[j].fuzz, 0, 100)) - Math.round(helpers.bound(p.ratings[j - 1][cat] + p.ratings[j - 1].fuzz, 0, 100));
                            } else {
                                fp.ratings[options.ratings[k]] = 0;
                            }
                        } else if (options.fuzz && options.ratings[k] !== "rank" && options.ratings[k] !== "MMR" && options.ratings[k] !== "fuzz" && options.ratings[k] !== "season" && options.ratings[k] !== "skills" && options.ratings[k] !== "hgt") {
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
                        if (options.ratings[j] === "rank") {
                            fp.ratings[kk].rank = p.ratings[k].rank;
                        } else if (options.ratings[j] === "MMR") {
                            fp.ratings[kk].MMR = p.ratings[k].MMR;
                        } else if (options.ratings[j] === "age") {
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
                            if (options.fuzz && options.ratings[j] !== "rank" && options.ratings[j] !== "MMR" && options.ratings[j] !== "fuzz" && options.ratings[j] !== "season" && options.ratings[j] !== "skills" && options.ratings[j] !== "hgt") {
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

            row = {};

            if (!_.isEmpty(s) && s.gp > 0) {
                for (j = 0; j < stats.length; j++) {
                    if (stats[j] === "gp") {
                        row.gp = s.gp;
                    } else if (stats[j] === "gs") {
                        row.gs = s.gs;
                    } else if (stats[j] === "kda") {
                        if (s.fga > 0) {
                            row.kda = (s.fg+s.fgp) / s.fga;
                         //   row.kda = s.kda;
                        } else if ( (s.fg+s.fgp)  > 0) {
                            row.kda = (s.fg+s.fgp) / s.fga;
//                            row.kda = "inf";
                        } else {
                            row.kda = 0;
                        }
                    /*} else if (stats[j] === "fgpAtRim") {
                       // if (s.fgaAtRim > 0) {
//                            row.fgpAtRim = 100 * s.fgAtRim / s.fgaAtRim;
                            row.fgaAtRim = s.fgaAtRim;

                       // } else {
                            row.fgpAtRim = 0;
                       // }
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
                        }*/
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
                    } else if (stats[j] === "yearsWithTeam") {
                        row.yearsWithTeam = s.yearsWithTeam;
                    } else {
                        if (options.totals) {
                            row[stats[j]] = s[stats[j]];
                        } else if (options.per36 && stats[j] !== "min") { // Don't scale min by 36 minutes
                            row[stats[j]] = s[stats[j]] * 36 / s.min;
                        } else {
                            row[stats[j]] = s[stats[j]] / s.gp;
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
                    } else if (stats[j] === "yearsWithTeam" && !_.isEmpty(s)) {
                        // Everyone but players acquired in the offseason should be here
                        row.yearsWithTeam = s.yearsWithTeam;
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
    function madeHof(p, playerStats) {
        var df, ewa, ewas, fudgeSeasons, i, mins, pers, prls, va;
		var kills,assists,deaths,gp,kda;
		var usedSeasons;
        //mins = _.pluck(playerStats, "min");
        gp = _.pluck(playerStats, "gp");
//        pers = _.pluck(playerStats, "per");
        kills = _.pluck(playerStats, "fg");
        assists = _.pluck(playerStats, "fgp");
        deaths = _.pluck(playerStats, "fga");
        kda = _.pluck(playerStats, "kda");


        // Position Replacement Levels http://insider.espn.go.com/nba/hollinger/statistics

		if (g.gameType == 1 ||  g.gameType == 5 ) {
//		if (g.gameType == 1  ) {
			ewa = p.awards.length;
			fudgeSeasons = g.startingSeason - p.draft.year ;
			usedSeasons = g.season - g.startingSeason+1;

			if (g.gameType == 1 ) {
				if (fudgeSeasons > 1) {
					ewa += p.awards.length * (fudgeSeasons / (usedSeasons) );
				}
				if (ewa  > 5) {
					return true;
				}
			} else {
				if (fudgeSeasons > 1) {
					ewa += p.awards.length * (fudgeSeasons / (usedSeasons*3) );
				}
				if (ewa  >= 3 ) {
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
		//	console.log(gp.length);
			for (i = 0; i < gp.length; i++) {
				//va = gp[i] * (pers[i] - prls[p.pos]) / 67;
				if  (deaths[i] > 0) {
				//	console.log(kda[i]);
			//	console.log(kills[i]+" "+assists[i]+" "+deaths[i]+" "+prls[p.pos]);
					va = gp[i] * ((kills[i] +assists[i])/deaths[i] - prls[p.pos]) / 16;
				//	console.log(i+" "+va);
				//	va = gp[i] * (kda[i] - prls[p.pos]) / 16.0;
	//				va = gp[i] * (kda[i] - prls[p.pos]) / 16;
					//console.log(i+" "+va);
				} else {
					va = 0;
				}
			  //  ewas.push(va / 30 * 0.8); // 0.8 is a fudge factor to approximate the difference between (in-game) EWA and (real) win shares
				ewas.push(va); // 0.8 is a fudge factor to approximate the difference between (in-game) EWA and (real) win shares
			}
	//console.log(ewas)
	//console.log(_.pluck(p.stats, "ewa"))

			// Calculate career EWA and "dominance factor" DF (top 5 years EWA - 50)
			ewas.sort(function (a, b) { return b - a; }); // Descending order
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

			if (ewa + df > cutOffByGameType) {
				return true;
			}
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
     * @param {Array.<Object>} Array of playerStats objects, regular season only, starting with most recent. Only the first 1 or 2 will be used.
     * @param {Object=} options Object containing several optional options:
     *     noPot: When true, don't include potential in the value calcuation (useful for roster
     *         ordering and game simulation). Default false.
     *     fuzz: When true, used fuzzed ratings (useful for roster ordering, draft prospect
     *         ordering). Default false.
     * @return {boolean} Value of the player, usually between 50 and 100 like overall and potential
     *     ratings.
     */
    function value(p, ps, options) {
        var age, current, potential, pr, ps1, ps2, s;

        options = options !== undefined ? options : {};
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

    // ps: player stats objects, regular season only, most recent first
    // Currently it is assumed that ps, if passed, will be the latest season. This assumption could be easily relaxed if necessary, just might make it a bit slower
    function updateValues(ot, p, ps) {
        return Promise.try(function () {
            var season;

            // Require up to the two most recent regular season stats entries, unless the current season has 2000+ minutes
            if (ps.length === 0 || (ps.length === 1 && ps[0].min < 2000)) {
                // Start search for past stats either at this season or at the most recent ps season
                // This assumes ps[0].season is the most recent entry for this player!
                if (ps.length === 0) {
                    season = g.season;
                } else {
                    season = ps[0].season - 1;
                }

                // New player objects don't have pids let alone stats, so just skip
                if (!p.hasOwnProperty("pid")) {
                    return;
                }

                // Start at season and look backwards until we hit
                // This will not work totally right if a player played for multiple teams in a season. It should be ordered by psid, instead it's ordered by tid because of the index used
                return dao.playerStats.iterate({
                    ot: ot,
                    index: "pid, season, tid",
                    key: IDBKeyRange.bound([p.pid, 0], [p.pid, season + 1]),
                    direction: "prev",
                    callback: function (psTemp, shortCircuit) {
                        // Skip playoff stats
                        if (psTemp.playoffs) {
                            return;
                        }

                        // Store stats
                        ps.push(psTemp);

                        // Continue only if we need another row
                        if (ps.length === 1 && ps[0].min < 2000) {
                            shortCircuit();
                        }
                    }
                });
            }
        }).then(function () {
            p.value = value(p, ps);
            p.valueNoPot = value(p, ps, {noPot: true});
            p.valueMMR = value(p, ps, {MMR: true});
            p.valueFuzz = value(p, ps, {fuzz: true});
            p.valueNoPotFuzz = value(p, ps, {noPot: true, fuzz: true});
            p.valueWithContract = value(p, ps, {withContract: true});

            return p;
        });
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
    function retire(tx, p, playerStats) {
        eventLog.add(tx, {
            type: "retired",
            text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>  retired.',
            showNotification: (p.tid === g.userTid || (p.watch && typeof p.watch !== "function")),
            pids: [p.pid],
            tids: [p.tid]
        });

        p.tid = g.PLAYER.RETIRED;
        p.retiredYear = g.season;

        // Add to Hall of Fame?
        if (madeHof(p, playerStats)) {
            p.hof = true;
            p.awards.push({season: g.season, type: "Inducted into the Hall of Fame"});
            eventLog.add(tx, {
                type: "hallOfFame",
                text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> was inducted into the <a href="' + helpers.leagueUrl(["hall_of_fame"]) + '">Hall of Fame</a>.',
                showNotification: p.statsTids.indexOf(g.userTid) >= 0 || (p.watch && typeof p.watch !== "function"),
                pids: [p.pid],
                tids: p.statsTids
            });
        }

        return p;
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
     * This doesn't add the things from player.updateValues!
     *
     * @memberOf core.player
     * @param {Object} p Partial player object.
     * @return {Object} p Full player object.
     */
    function augmentPartialPlayer(p, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP) {
        var age, region, i, pg, simpleDefaults;

        if (!p.hasOwnProperty("born")) {
            age = random.randInt(19, 35);
        } else {
            age = g.startingSeason - p.born.year;
        }
		//console.log(g.gameType+" "+g.numTeams+" "+p.tid);
		//g.regionType
		// initial work on allow World Roster to work with other leagues.
	/*	if (g.gameType != 5 && g.numTeams == 57) {
			if (g.gameType == 0 && g.regionType == "EU") {
				if ((p.tid >= 10) && (p.tid <= 19)) {
					p.tid -= 10;
				} else {
					p.tid = 10;
				}
			}
			if (g.gameType == 1 && g.regionType == "EU") {
				if ((p.tid >= 10) && (p.tid <= 19)) {
					p.tid -= 10;
				} else {
					p.tid = 10;
				}
			}
			if (g.gameType == 2) {
				if ((p.tid >= 20) && (p.tid <= 29)) {
					p.tid -= 20;
				} else {
					p.tid = 10;
				}
			}
			if (g.gameType == 3) {
				if ((p.tid >= 30) && (p.tid <= 31)) {
					p.tid -= 30;
				} else {
					p.tid = 12;
				}
			}
			if (g.gameType == 4) {
				if ((p.tid >= 42) && (p.tid <= 49)) {
					p.tid -= 42;
				} else {
					p.tid = 8;
				}
			}
		} */

//console.log(p);
        // This is used to get at default values for various attributes
        pg = generate(p.tid, age, "", 0, 0, g.startingSeason - age, true, scoutingRank,cDefault,topADC,topMID,topJGL,topTOP,topSUP);
//console.log(pg);

        // Optional things
        simpleDefaults = ["awards", "born", "college", "contract", "draft", "face", "freeAgentMood", "gamesUntilTradable", "hgt", "hof", "imgURL", "injury", "pos", "ptModifier", "pick", "ban", "retiredYear", "rosterOrder", "watch", "weight", "yearsFreeAgent"];
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
                p = setContract(p, p.contract, true);
            }
        }
        if (!p.hasOwnProperty("stats")) {
            p.stats = [];
        }
        if (!p.hasOwnProperty("statsTids")) {
            p.statsTids = [];
            if (p.tid >= 0 && g.phase <= g.PHASE.PLAYOFFS) {
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

        if (p.hasOwnProperty("firstName") && !p.hasOwnProperty("name")) {

            p.name = p.firstName+" "+p.userID+" "+p.lastName;
            delete p.firstName;
            delete p.lastName;

            // old faces break edit game feature, even if user using files  
            p.face = helpers.deepCopy(pg.face);

           // fix contracts as Well
           if (p.hasOwnProperty("contract")) {
             p.contract.amount /= 1000;
           }
        }

        return p;
    }

    function checkStatisticalFeat(tx, pid, tid, p, results) {
        var carry, feat, featText, featTextArr, i, j, k, key, logFeat, saveFeat, statArr, won;

        saveFeat = false;

        logFeat = function (text) {
            eventLog.add(tx, {
                type: "playerFeat",
                text: text,
                showNotification: tid === g.userTid,
                pids: [pid],
                tids: [tid]
            });
        };

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
  /*      if (p.stat.pts >= 5 && p.stat.ast >= 5 && p.stat.stl >= 5 && p.stat.blk >= 5 && (p.stat.orb + p.stat.drb) >= 5) {
            statArr.points = p.stat.pts;
            statArr.rebounds = p.stat.orb + p.stat.drb;
            statArr.assists = p.stat.ast;
            statArr.steals = p.stat.stl;
            statArr.blocks = p.stat.blk;
            saveFeat = true;
        }*/
        if (carry >= 3) {
/*            if (p.stat.pts >= 10) { statArr.points = p.stat.pts; }
            if (p.stat.orb + p.stat.drb >= 10) { statArr.rebounds = p.stat.orb + p.stat.drb; }
            if (p.stat.ast >= 10) { statArr.assists = p.stat.ast; }
            if (p.stat.stl >= 10) { statArr.steals = p.stat.stl; }
            if (p.stat.blk >= 10) { statArr.blocks = p.stat.blk; }*/
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

/*        if (p.stat.tp >= 10) {
            statArr["three pointers"] = p.stat.tp;
            saveFeat = true;
        }*/


        if (saveFeat) {
            if (results.team[0].id === tid) {
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
            }
//            featText += '</a> in a ' + results.team[i].stat.pts + "-" + results.team[j].stat.pts + (won ? ' win over the ' : ' loss to the ') + g.teamNamesCache[results.team[j].id] + '.';
            featText += '</a> in a ' + (won ? ' win over ' : ' loss to ') + g.teamRegionsCache[results.team[j].id] + '.';

            logFeat(featText);

            feat = {
                pid: pid,
                name: p.name,
                pos: p.pos,
                season: g.season,
                tid: tid,
                oppTid: results.team[j].id,
                playoffs: g.phase === g.PHASE.PLAYOFFS,
                gid: results.gid,
                stats: p.stat,
                won: won,
                score: results.team[i].stat.pts + "-" + results.team[j].stat.pts,
                overtimes: results.overtimes
            };

            dao.playerFeats.add({ot: tx, value: feat});
        }
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
        MMR: MMR,
        rank: rank,
        release: release,
        skills: skills,
        filter: filter,
        madeHof: madeHof,
        //value: value,
        updateValues: updateValues,
        retire: retire,
        name: name,
        nameKorean: nameKorean,
        nameChinese: nameChinese,
        nameRussian: nameRussian,
        nameTurkish: nameTurkish,
        nameJapanese: nameJapanese,
        nameBrazilian: nameBrazilian,
		nameAustralian: nameAustralian,
		nameChilean: nameChilean,
		nameVietnamese: nameVietnamese,
		nameCanadian: nameCanadian,
		nameFrenchCanadian: nameFrenchCanadian,
        contractSeasonsRemaining: contractSeasonsRemaining,
        moodColorText: moodColorText,
        augmentPartialPlayer: augmentPartialPlayer,
		languages: languages,
		country: country,
        checkStatisticalFeat: checkStatisticalFeat
    };
});
