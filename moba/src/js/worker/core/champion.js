// @flow

//import faces from 'facesjs';
import _ from 'underscore';
//import {COMPOSITE_WEIGHTS, PHASE, PLAYER, g, helpers} from '../../common';
//import {idb} from '../db';
import * as championPatch from '../../data/championPatch';
import * as champions from '../../data/champions2';
import * as championPatchLOL from '../../data/championPatchLOL';
import * as championPatchDOTA2 from '../../data/championPatchDOTA2';
import * as championsLOL from '../../data/championsLOL';
import * as championsDOTA2 from '../../data/championsDOTA2';
import {random} from '../util';



/**
 * @name core.champion
 * @namespace Functions operating on player objects, parts of player objects, or arrays of player objects.
 */
 //"data/championPatch", "data/champions2", championPatch,champions,
//define(["dao", "globals", "core/finances", "data/injuries",  "lib/bluebird", "lib/faces", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (dao, g, finances, injuries, Promise, faces, _, eventLog, helpers, random) {
  //  "use strict";


	/*
	Get Champion list

	Name
	Attack
	Defense
	Ability
	Difficulty
	IP
	RP
	Also, space for
	Early, Late, Mid
	Relative Strength Versus Other Charachters

	Whatever isn't loaded is random

	put into:

	Attack
	Defense
	Early
	Mid
	Late
	Relative Strength

	Based on 1,2,3 guess Early, Mid, Late
	Bsaed on 1,2,3 and E,M,L gues relative

	Can hard code these as well.

	Allow users to export and use this list, also upload instead of calc

	Eventually:

	Have full details to calc

	Attack
	Defense

	also full equip and level and ability details to calc

	Early
	Mid
	Late

	Full details also allow for calc of relative

	Whatever user gives will be used, detailed calcs basic, calcs used
	*/

    function rank(champid,i) {
        var championRank;
		championRank =  {}; // Will be saved to database
	//	championRank.role = championPatch.championPatch[i][0];
//		championRank.champion = championPatch.championPatch[i][1];
	//	championRank.rank = championPatch.championPatch[i][2];
//	console.log(championPatchLOL.championPatch);
	//console.log(championPatchDOTA2.championPatch);
  console.log(champid);
		if (champid == 0) {
			championRank.role = championPatchLOL.championPatch[i][0];
			championRank.champion = championPatchLOL.championPatch[i][1];
			championRank.rank = championPatchLOL.championPatch[i][2];


     ////////// convert patch data to real names
      for (let hid = 0; hid < championsLOL.champion.length; hid++) {
  //      console.log(hid+" "+championRank.champion+" "+name(0,hid,0)+" "+name(0,hid,1));
        if (championRank.champion ==  name(0,hid,1)) {
            championRank.champion = name(0,hid,0);
            break;
        }
			}
      /////////// end conversion
		} else {
			championRank.role = championPatchDOTA2.championPatch[i][0];
			championRank.champion = championPatchDOTA2.championPatch[i][1];
			championRank.rank = championPatchDOTA2.championPatch[i][2];
      ////////// convert patch data to real names
      for (let hid = 0; hid < championsDOTA2.champion.length; hid++) {
         //console.log(hid+" "+championRank.champion+" "+name(1,hid,0)+" "+name(1,hid,1));
       if (championRank.champion ==  name(1,hid,1)) {
           championRank.champion = name(1,hid,0);
           break;
       }
 			}
       /////////// end conversion
		}

		championRank.cpid = i;

        return championRank;
    }

    function name(champid,hid,data) {
      var cn, i;

  		if (champid == 0) {

  			cn = championsLOL.champion[hid][data];
  		} else {
  			cn = championsDOTA2.champion[hid][data];
  		}
      return cn;
    }

    function generate(champid,hid) {
        var  c,i;

        c = {}; // Will be saved to database
        c.hid = hid;

	//	console.log(champid);
	//	console.log(hid);
	//	console.log(0);


     /////// switch back to fake names if necessary
        //c.nameReal = name(champid,hid,0);
        c.nameReal = name(champid,hid,1);
        //c.name = name(champid,hid,1);
        c.name = name(champid,hid,0);
    /////// switch back to fake names if necessary
		c.ratings = {};

		if (champid == 0) {
			//c.name = name(champid,hid,1);
			c.role = name(champid,hid,2);
			c.ratings.damage = name(champid,hid,3);
			c.ratings.toughness = name(champid,hid,4);
			c.ratings.control = name(champid,hid,5);
			c.ratings.mobility = name(champid,hid,6);
			c.ratings.utility = name(champid,hid,7);
			c.ratings.damageType = name(champid,hid,8);
			c.ratings.early = name(champid,hid,9);
			c.ratings.mid = name(champid,hid,10);
			c.ratings.late = name(champid,hid,11);
			// 12 is win rate, but not used
			c.ratings.counter = [];
			for (i = 0; i < championsLOL.champion.length; i++) {
				c.ratings.counter[i] =  name(champid,hid,13+i);;
			}

//			c.ratings.synergyWith = [];
			c.ratings.synergy = [];
			for (i = 0; i < championsLOL.champion.length; i++) {
				c.ratings.synergy[i] =  name(champid,hid,13+championsLOL.champion.length+i);;
			}

		} else {
			c.ratings.MRL = name(champid,hid,2);
			c.ratings.MR = name(champid,hid,3);
			c.ratings.SAI = name(champid,hid,4);
			c.ratings.carry = name(champid,hid,5);
			c.ratings.support = name(champid,hid,6);
			c.ratings.nuker = name(champid,hid,7);
			c.ratings.disabler = name(champid,hid,8);
			c.ratings.jungler = name(champid,hid,9);
			c.ratings.durable = name(champid,hid,10);
			c.ratings.escapeR = name(champid,hid,11);
			c.ratings.pusher = name(champid,hid,12);
			c.ratings.initiator = name(champid,hid,13);
			c.ratings.early = name(champid,hid,14);
			c.ratings.mid = name(champid,hid,15);
			c.ratings.late = name(champid,hid,16);
			// 17 is win rate, but not used
//			c.ratings.strengthAgainst = [];
			c.ratings.counter = [];
			for (i = 0; i < championsDOTA2.champion.length; i++) {
				c.ratings.counter[i] =  name(champid,hid,18+i);;
			}

//			c.ratings.synergyWith = [];
			c.ratings.synergy = [];
			for (i = 0; i < championsDOTA2.champion.length; i++) {
				c.ratings.synergy[i] =  name(champid,hid,18+championsDOTA2.champion.length+i);;
			}

		}

     /*   c.role = name(hid,1);
        c.role2 = name(hid,2);*/

		c.imgURL =  "";
		//tm.imgURL !== undefined ? tm.imgURL : "",

	/*	c.ratings = {};
		c.ratings.attack = name(hid,3)*10;
		c.ratings.defense = name(hid,4)*10;
		c.ratings.ability = name(hid,5)*10;
		c.ratings.attack2 = name(hid,3)*10;
		c.ratings.defense2 = name(hid,4)*10;
		c.ratings.ability2 = name(hid,5)*10;
		c.ratings.difficulty = name(hid,6)*10;

		c.ratings.support = Math.round(Math.random()*100,1);
		c.ratings.jungle = Math.round(Math.random()*100,1);
		c.ratings.ganking = Math.round(Math.random()*100,1);
		c.ratings.laning = Math.round(Math.random()*100,1);
		c.ratings.teamFighting = Math.round(Math.random()*100,1);


		c.ratings.overall = Math.round((c.ratings.attack+c.ratings.defense+c.ratings.ability)/3,1);

		c.ratings.early =  Math.round((c.ratings.attack*3+c.ratings.defense*2+c.ratings.ability)/6,1);
		c.ratings.late =  Math.round((c.ratings.attack*1+c.ratings.defense*2+c.ratings.ability*3)/6,1);
		c.ratings.mid =  Math.round((c.ratings.early+c.ratings.late)/2,1);

		c.ratings.strengthAgainst = [];
        for (i = 0; i < champions.champion.length; i++) {
			c.ratings.strengthAgainst[i] =  Math.round(Math.random()*100,1);
		}

		c.ratings.synergyWith = [];
        for (i = 0; i < champions.champion.length; i++) {
			c.ratings.synergyWith[i] =  Math.round(Math.random()*100,1);
		}	*/
        return c;
    }


   function tier(championPatch,champions,role,j,i,tier) {
       // var  c,i;
		//tier;

		if (championPatch[j].role == role && championPatch[j].champion ==  champions[i].name) {
			if (championPatch[j].rank > 0.55) {
				tier = "1";
			} else if (championPatch[j].rank > 0.525) {
				tier = "2";
			} else if (championPatch[j].rank > 0.50) {
				tier = "3";
			} else if (championPatch[j].rank > 0.475) {
				tier = "4";
			} else {
				tier = "5";
			}
		} else if (tier == undefined) {
			tier = "";
		}



        return tier;
    }


export default {
		rank: rank,
		name: name,
		tier: tier,
		generate: generate,
};

/*
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
};*/
