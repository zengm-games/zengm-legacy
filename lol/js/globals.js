/**
 * @name globals
 * @namespace Defines the constant portions of g.
 */
define(["lib/knockout", "util/random"], function (ko,random) {
    "use strict";

    // The way this works is... any "global" variables that need to be widely available are stored in g. Some of these are constants, like the ones defined below. Some others are dynamic, like the year of the current season, and are stored in the gameAttributes object store. The dynamic components of g are retrieved/updated/synced elsewhere. Yes, it's kind of confusing and arbitrary.

    var g, splitUrl;

    g = {};

    // If any of these things are supposed to change at any point, they should be stored in gameAttributes rather than here.
//    g.confs = [{cid: 0, name: "League Championship Series"}, {cid: 1, name: "Challenger Series"}, {cid: 2, name: "Ladder"}];
//    g.divs = [{did: 0, cid: 0, name: "LCS"}, {did: 1, cid: 1, name: "CS"}, {did: 2, cid: 2, name: "L"}];
//    g.confs = [{cid: 0, name: "Eastern Conference"}, {cid: 1, name: "Western Conference"}];
//    g.divs = [{did: 0, cid: 0, name: "Atlantic"}, {did: 1, cid: 0, name: "Central"}, {did: 2, cid: 0, name: "Southeast"}, {did: 3, cid: 1, name: "Southwest"}, {did: 4, cid: 1, name: "Northwest"}, {did: 5, cid: 1, name: "Pacific"}];
    g.salaryCap = 100000000;  // [thousands of dollars]
    g.minPayroll = 0;  // [thousands of dollars]
    g.luxuryPayroll = 100000000;  // [thousands of dollars]
    g.luxuryTax = 0;
    g.minContract = 15;  // [thousands of dollars]
    g.maxContract = 999;  // [thousands of dollars]
   // g.minRosterSize = 6;

//	g.ownerType = random.randInt(0,6);
	//console.log(g.ownerType);
    // Constants in all caps
    g.PHASE = {
        FANTASY_DRAFT: -1,
        PRESEASON: 0,
        REGULAR_SEASON: 1,
        AFTER_TRADE_DEADLINE: 2,
        PLAYOFFS: 3,
        BEFORE_DRAFT: 4,
        RESIGN_PLAYERS: 5,
        FREE_AGENCY: 6
     /*   DRAFT: 5,
        AFTER_DRAFT: 6,
        RESIGN_PLAYERS: 7,
        FREE_AGENCY: 8*/
    };
    g.PLAYER = {
        FREE_AGENT: -1,
        UNDRAFTED: -2,
        RETIRED: -3,
        UNDRAFTED_2: -4, // Next year's draft class
        UNDRAFTED_3: -5, // Next next year's draft class
        UNDRAFTED_FANTASY_TEMP: -6 // Store current draft class here during fantasy draft
    };

    g.PHASE_TEXT = {
        "-1": "fantasy draft",
        "0": "preseason",
        "1": "regular season",
        "2": "regular season",
        "3": "playoffs",
        "4": "before re-signing",		
        "5": "re-sign players",
        "6": "free agency"
    };

	
/*    // Web workers - create only if we're not already inside a web worker!
    g.gameSimWorkers = [];
    if (typeof document !== "undefined") {
        for (i = 0; i < 1; i++) {
            g.gameSimWorkers[i] = new Worker("/js/core/gameSimWorker.js");
        }
    }*/

    g.vm = {
        topMenu: {
            lid: ko.observable(),
            godMode: ko.observable(),
            options: ko.observable([]),
            phaseText: ko.observable(),
            statusText: ko.observable(),
            template: ko.observable(), // Used for left menu on large screens for highlighting active page, so g.vm.topMenu should really be g.vm.menu, since it's used by both
            username: ko.observable(null)
        },
        multiTeam: {
            userTid: ko.observable(null),
            userTids: ko.observable([])
        }		
    };

    g.enableLogging = window.enableLogging;

    // .com or .dev TLD
    if (!window.inCordova) {
        splitUrl = window.location.hostname.split(".");
        g.tld = splitUrl[splitUrl.length - 1];
    } else {
        // From within Cordova, window.location.hostname is not set, so always use .com
        g.tld = "com";
    }

    g.sport = "lol"; // For account ajax stuff

  /*  g.compositeWeights = {
        toweringAttack: {
            ratings: ['hgt', 'stre', 'spd', 'dnk','ft','tp', 'blk', 'stl'], 
            weights: [1,1,1,6, 2, 2,2,2]			
        },
        toweringDefend: {
            ratings: ['ins', 'dnk', 'fg', 'tp', 'spd', 'drb'],
            weights: [1.5, 1, 1, 1, 0.15, 0.15]
        },
        structureAttack: {
            ratings: ['drb', 'spd']
        },
        structureDefend: {
            ratings: ['drb', 'pss'],
            weights: [0.4, 1]
        },
        minionControl: {
            ratings: ['drb', 'pss', 'spd', 'hgt', 'ins'],
            weights: [1, 1, -1, 1, 1]
        },
        monstersKillingBD: {
            ratings: ['hgt', 'spd', 'jmp', 'dnk'],
            weights: [1, 0.2, 0.6, 0.4]
        },
        championKilling: {
            ratings: ['hgt', 'stre', 'spd', 'ins'],
            weights: [1, 0.6, 0.2, 1]
        },
        shotcalling: {
            ratings: ['hgt', 'fg'],
            weights: [0.2, 1]
        },
        gameStrategy: {
            ratings: ['hgt', 'tp'],
            weights: [0.2, 1]
        },
        equipmentBuying: {
            ratings: ['ft']
        },
        levelingAbilities: {
            ratings: ['hgt', 'stre', 'jmp', 'reb'],
            weights: [1.5, 0.1, 0.1, 0.7]
        },
        endurance: {
            ratings: ['constant', 'spd', 'stl'],
            weights: [1, 1, 1]
        },
        adaptability: {
            ratings: ['hgt', 'jmp', 'blk'],
            weights: [1.5, 0.5, 0.5]
        },
        tilt: {
            ratings: ['constant', 'hgt', 'blk', 'spd'],
            weights: [1.5, 1, 1, -1]
        },
        aggression: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'blk', 'stl'],
            weights: [1, 1, 1, 0.5, 1, 1]
        },
        jungleControl: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'blk'],
            weights: [2, 1, 0.5, 0.5, 1]
        },
        monstersKillingJ: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'stl'],
            weights: [1, 1, 2, 0.5, 1]
        },
        gank: {
            ratings: ['constant', 'endu', 'hgt'],
            weights: [1, 1, -0.1]
        },
        teamwork: {
            ratings: ['stre', 'spd', 'jmp', 'hgt'],
            weights: [1, 1, 1, 0.5]
        },
        mapVision: {
            ratings: ['stre', 'spd', 'jmp', 'hgt'],
            weights: [1, 1, 1, 0.5]
        },
        wardDestruction: {
            ratings: ['stre', 'spd', 'jmp', 'hgt'],
            weights: [1, 1, 1, 0.5]
        },
        wardPlacement: {
            ratings: ['stre', 'spd', 'jmp', 'hgt'],
            weights: [1, 1, 1, 0.5]
        },
        laneSwitching: {
            ratings: ['stre', 'spd', 'jmp', 'hgt'],
            weights: [1, 1, 1, 0.5]
        }
	};	*/
	
    // THIS MUST BE ACCURATE OR BAD STUFF WILL HAPPEN
//    g.notInDb = ["dbm", "dbl", "lid", "confs", "divs", "salaryCap", "minPayroll", "luxuryPayroll", "luxuryTax", "minContract", "maxContract", "minRosterSize", "PHASE", "PLAYER","PHASE_TEXT", "gameSimWorkers","vm", "enableLogging", "tld", "sport", "compositeWeights", "notInDb"];
    g.notInDb = ["dbm", "dbl", "lid", "confs", "divs", "salaryCap", "minPayroll", "luxuryPayroll", "luxuryTax", "minContract", "maxContract", "minRosterSize", "PHASE", "PLAYER","PHASE_TEXT", "gameSimWorkers","vm", "enableLogging", "tld", "sport",  "notInDb"];

    return g;
});