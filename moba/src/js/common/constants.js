// @flow
/*
function PHASE() {

	var PHASE;

	//console.log(g.gameType);
	//if g.gameType
	PHASE = {
		FANTASY_DRAFT: -1,
		PRESEASON: 0,
		REGULAR_SEASON: 1,
		AFTER_TRADE_DEADLINE: 2,
		PLAYOFFS: 3,
		BEFORE_DRAFT: 4,
		RESIGN_PLAYERS: 5,
		FREE_AGENCY: 6,
	};

    return PHASE;
}*/

const PHASE = {
  //  FANTASY_DRAFT: -1,
  //  PRESEASON: 0,
  //  REGULAR_SEASON: 1,
  //  AFTER_TRADE_DEADLINE: 2,
  //  PLAYOFFS: 3,
  //  BEFORE_DRAFT: 4,
  //  RESIGN_PLAYERS: 5,
  //  FREE_AGENCY: 6,
};

const PLAYER = {
    FREE_AGENT: -1,
    UNDRAFTED: -2,
    RETIRED: -3,
    UNDRAFTED_2: -4, // Next year's draft class
    UNDRAFTED_3: -5, // Next next year's draft class
    UNDRAFTED_FANTASY_TEMP: -6, // Store current draft class here during fantasy draft
};


const PHASE_TEXT = {
 //   '-1': 'fantasy draft',
    //'0': 'preseason',
    //'1': 'regular season',
    //'2': 'regular season',
    //'3': 'playoffs',
    //'4': 'before free agency',
    //'5': 're-sign players',
    //'6': 'free agency',
};

const SPORT = 'moba'; // For account ajax stuff

const COMPOSITE_WEIGHTS = {
    pace: {
        ratings: ['spd', 'jmp', 'dnk', 'tp', 'stl', 'drb', 'pss'],
    },
    usage: {
        ratings: ['hgt','stre', 'spd', 'jmp','endu', 'ins','fg'],
        weights: [1,1,1,1,4, 1, 1],
    },
    shotcalling: {
        ratings: ['hgt','stre', 'spd', 'jmp','endu', 'ins','fg'],
        weights: [1,1,1,1,4, 1, 1],
    },	
    teamPlayer: {
        ratings: ['hgt','stre', 'spd', 'jmp'],
        weights: [1,1, 1, 2],
    },
    gameStrategy: {
        ratings: ['hgt','stre','spd','ins', 'dnk', 'ft', 'fg'],
        weights: [1, 1,1, 1, 1, 1,1],
    },
    jungleControl: {
        ratings: ['hgt', 'ins', 'fg', 'stre', 'spd','drb','blk','pss','reb'],
        weights: [1, 1, 1,1,1,4,2,1,1],
    },
    monstersKillingJ: {
        ratings: ['hgt', 'ins', 'fg', 'stre', 'spd','drb','blk','pss','reb'],
        weights: [1, 1, 1,1,1,4,2,1,1],
    },	
    ganking: {
        ratings: ['hgt', 'stre', 'spd', 'jmp','endu','ins', 'ft', 'fg','tp','blk','drb'],
        weights: [1, 1, 1, 3,1,3,  1,12,1,1,1],
    },
    towering: {
        ratings: ['hgt', 'stre', 'spd', 'dnk','ft','tp', 'blk', 'stl'],
        weights: [1,1,1,6, 2, 2,2,2],
    },
    toweringAttack: {
        ratings: ['hgt', 'stre', 'spd', 'dnk','ft','tp', 'blk', 'stl'],
        weights: [1,1,1,6, 2, 2,2,2],
    },	
    toweringDefend: {
        ratings: ['hgt', 'stre', 'spd', 'dnk','ft','tp', 'blk', 'stl'],
        weights: [1,1,1,6, 2, 2,2,2],
    },		
    structureAttack: {
        ratings: ['hgt', 'stre', 'spd','fg','blk'],
        weights: [1,1,1,1, 4],
    },		
    structureDefend: {
        ratings: ['blk', 'hgt', 'stre', 'jmp'],
        weights: [1, .25, .25, .25],
    },		
    championKilling: {
        ratings: ['hgt', 'stre', 'spd', 'ins','ft', 'fg','tp', 'blk', 'drb'],
        weights:  [1,1,1,1, 3, 1, 1, 1, 1],
    },
    creepScore: {
        ratings: ['stl', 'blk', 'dnk','spd','pss','reb'],
        weights: [2, .25, .25,.25,.25,.25],
    },
    minionControl: {
        ratings: ['stl', 'blk', 'dnk','spd','pss','reb'],
        weights: [2, .25, .25,.25,.25,.25],
    },	
    aggression: {
        ratings: ['fg', 'ins', 'tp'],
        weights:  [2, 1, 1],
    },
    wardDestruction: {
        ratings: ['hgt','stre', 'spd', 'jmp','ins','ft'],
        weights:  [1,1, 1, 2,1,1],
    },
    wardPlacement: {
        ratings: ['hgt','stre', 'spd', 'jmp','ins','ft'],
        weights:  [1,1, 1, 2,1,1],
    },
    mapVision: {
        ratings: ['hgt','stre', 'spd', 'jmp','ins','ft'],
        weights:  [1,1, 1, 2,1,1],
    },
    laneSwitching: {
        ratings: ['hgt','stre', 'spd', 'jmp','ins','ft'],
        weights:  [1,1, 1, 2,1,1],
/*    },
    stealing: {
        ratings: [50, 'spd', 'stl'],
        weights: [1, 1, 1],
    },
    blocking: {
        ratings: ['hgt', 'jmp', 'blk'],
        weights: [1.5, 0.5, 0.5],
    },
    fouling: {
        ratings: [50, 'hgt', 'blk', 'spd'],
        weights: [1.5, 1, 1, -1],
    },
    defense: {
        ratings: ['hgt', 'stre', 'spd', 'jmp', 'blk', 'stl'],
        weights: [1, 1, 1, 0.5, 1, 1],
    },
    defenseInterior: {
        ratings: ['hgt', 'stre', 'spd', 'jmp', 'blk'],
        weights: [2, 1, 0.5, 0.5, 1],
    },
    defensePerimeter: {
        ratings: ['hgt', 'stre', 'spd', 'jmp', 'stl'],
        weights: [1, 1, 2, 0.5, 1],
    },
    endurance: {
        ratings: [50, 'endu', 'hgt'],
        weights: [1, 1, -0.1],
    },
    athleticism: {
        ratings: ['stre', 'spd', 'jmp', 'hgt'],
        weights: [1, 1, 1, 0.5],*/
    },
};

// Test: pk_test_gFqvUZCI8RgSl5KMIYTmZ5yI
const STRIPE_PUBLISHABLE_KEY = 'pk_live_Dmo7Vs6uSaoYHrFngr4lM0sa';

export {
    COMPOSITE_WEIGHTS,
    PHASE,
    PLAYER,
    PHASE_TEXT,
    SPORT,
    STRIPE_PUBLISHABLE_KEY,
};
