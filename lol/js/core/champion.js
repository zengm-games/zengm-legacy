/**
 * @name core.champion
 * @namespace Functions operating on player objects, parts of player objects, or arrays of player objects.
 */
define(["dao", "globals", "core/finances", "data/injuries", "data/championPatch", "data/champions2", "lib/bluebird", "lib/faces", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (dao, g, finances, injuries,championPatch,champions, Promise, faces, _, eventLog, helpers, random) {
    "use strict";

 
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
	
    function rank(i) {
        var championRank;
		championRank =  {}; // Will be saved to database
		/*championRank.role = [];		
		championRank.champion = [];		
		championRank.rank = [];		*/
        // Get Champion Name

        //for (i = 0; i < championPatch.championPatch.length; i++) {
		   // console.log(championPatch.championPatch[i][0]);
		    championRank.role = championPatch.championPatch[i][0];
		    championRank.champion = championPatch.championPatch[i][1];
		    championRank.rank = championPatch.championPatch[i][2];
		    championRank.cpid = i;
			
        /*    if (championPatch.championPatch[i][7] >= hid) {
                break;
            }*/
   //     }
        //cn = championPatch.championPatch[i][data];

        return championRank;
    }
	
    function name(hid,data) {
        var cn, i;

        // Get Champion Name

        for (i = 0; i < champions.champion.length; i++) {
            if (champions.champion[i][7] >= hid+1) {
                break;
            }
        }
        cn = champions.champion[i][data];

        return cn;
    }

	
    function generate(hid) {
        var  c,i;

        c = {}; // Will be saved to database
        c.hid = hid;		
        c.name = name(hid,0);
        c.role = name(hid,1);
        c.role2 = name(hid,2);
		
		c.imgURL =  "";
		//tm.imgURL !== undefined ? tm.imgURL : "",
		
		c.ratings = {};
		c.ratings.attack = name(hid,3)*10;
		c.ratings.defense = name(hid,4)*10;
		c.ratings.ability = name(hid,5)*10;
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
		/*c.ratings.relative = [];
        for (i = 0; i < champions.champion.length; i++) {
			c.ratings.relative[i] =  Math.round(Math.random()*100,1);
		}*/
		
		c.ratings.synergyWith = [];
        for (i = 0; i < champions.champion.length; i++) {
			c.ratings.synergyWith[i] =  Math.round(Math.random()*100,1);
		}
	//	console.log(c);
	//	console.log(c.hid+" "+c.name+" "+c.role+" "+c.role2+" "+c.ratings.overall+" "+c.ratings.relative[0]+" "+c.ratings.attack+" "+c.ratings.defense+" "+c.ratings.ability+" "+c.ratings.difficulty+" "+c.ratings.early+" "+c.ratings.mid+" "+c.ratings.late);
				
		//find champion rank?		
		// use new variable?
		
        return c;
    }	



	
    return {
		rank: rank,
		name: name,
		generate: generate
    };
});