/**
 * @name globals
 * @namespace Defines the constant portions of g.
 */
define(["lib/knockout"], function (ko) {
    "use strict";

    // The way this works is... any "global" variables that need to be widely available are stored in g. Some of these are constants, like the ones defined below. Some others are dynamic, like the year of the current season, and are stored in the gameAttributes object store. The dynamic components of g are retrieved/updated/synced elsewhere. Yes, it's kind of confusing and arbitrary.

    var g, splitUrl;

    g = {};

    // If any of these things are supposed to change at any point, they should be stored in gameAttributes rather than here.
//    g.confs = [{cid: 0, name: "Atlantic Coast Conference"}, {cid: 1, name: "Big Ten Conference"}, {cid: 2, name: "Southeastern Conference"}, {cid: 3, name: "Pac 12 Conference"}, {cid: 4, name: "Big East Conference"}, {cid: 5, name: "Big 12 Conference"}];
//    g.confs = [{cid: 0, name: "Atlantic Coast Conference"}, {cid: 1, name: "Big North Conference"}, {cid: 2, name: "South East Conference"}, {cid: 3, name: "Pacific Coast Conference"}, {cid: 4, name: "Mid West Conference"}, {cid: 5, name: "AL AR GA LA MS Conference"}, {cid: 6, name: "AK HI OR WA Conference"}, {cid: 7, name: "AZ NV NM Conference"}, {cid: 8, name: "CA Conference"}, {cid: 9, name: "CO ID MT ND SD UT WY Conference"}, {cid: 10, name: "CT ME MA NH RI VT Conference"}, {cid: 11, name: "DC DE MD VA Conference"}, {cid: 12, name: "FL Conference"}, {cid: 13, name: "IL IN Conference"}, {cid: 14, name: "IA KS MO NE Conference"}, {cid: 15, name: "MI MN WI Conference"}, {cid: 16, name: "NY NJ Conference"}, {cid: 17, name: "KY NC SC TN Conference"}, {cid: 18, name: "OH PA WV Conference"}, {cid: 19, name: "OK TX Conference"}];
//    g.divs = [{did: 0, cid: 0, name: "ACC - North"}, {did: 1, cid: 0, name: "ACC - South"}, {did: 2, cid: 1, name: "Big North - East"}, {did: 3, cid: 1, name: "Big North - West"}, {did: 4, cid: 2, name: "SEC - East"}, {did: 5, cid: 2, name: "SEC - West"}, {did: 6, cid: 3, name: "PCC - North"}, {did: 7, cid: 3, name: "PCC - South"}, {did: 8, cid: 4, name: "Mid West - North"}, {did: 9, cid: 4, name: "Mid West - South"}, {did: 10, cid: 5, name: "AAGLM - East"}, {did: 11, cid: 5, name: "AAGLM - West"}, {did: 12, cid: 6, name: "AHOW - East"}, {did: 13, cid: 6, name: "AHOW - West"}, {did: 14, cid: 7, name: "ANN - North"}, {did: 15, cid: 7, name: "ANN - South"}, {did: 16, cid: 8, name: "C - North"}, {did: 17, cid: 8, name: "C - South"}, {did: 18, cid: 9, name: "CIMNSUW - North"}, {did: 19, cid: 9, name: "CIMNSUW - South"}, {did: 20, cid: 10, name: "CMMNRV - East"}, {did: 21, cid: 10, name: "CMMNRV - West"}, {did: 22, cid: 11, name: "DDMV - North"}, {did: 23, cid: 11, name: "DDMV - South"}, {did: 24, cid: 12, name: "F - North"}, {did: 25, cid: 12, name: "F - South"}, {did: 26, cid: 13, name: "II - North"}, {did: 27, cid: 13, name: "II - South"}, {did: 28, cid: 14, name: "IKMN - North"}, {did: 29, cid: 14, name: "IKMN - South"}, {did: 30, cid: 15, name: "MMW - East"}, {did: 31, cid: 15, name: "MMW - West"}, {did: 32, cid: 16, name: "NN - North"}, {did: 33, cid: 16, name: "NN - South"}, {did: 34, cid: 17, name: "KNST - East"}, {did: 35, cid: 17, name: "KNST - West"}, {did: 36, cid: 18, name: "OPW - East"}, {did: 37, cid: 18, name: "OPW - West"}, {did: 38, cid: 19, name: "OT - North"}, {did: 39, cid: 19, name: "OT - South"}];
    g.confs = [{cid: 0, name: "Atlantic Coast Conference"}, {cid: 1, name: "Big North Conference"}, {cid: 2, name: "South East Conference"}, {cid: 3, name: "Pacific Coast Conference"}, {cid: 4, name: "Mid West Conference"}, {cid: 5, name: "Deep South Conference"}, {cid: 6, name: "West Ocean Conference"}, {cid: 7, name: "Desert Conference"}, {cid: 8, name: "California Conference"}, {cid: 9, name: "Rocky Conference"}, {cid: 10, name: "New England Conference"}, {cid: 11, name: "Capital Conference"}, {cid: 12, name: "Florida Conference"}, {cid: 13, name: "Chicago Conference"}, {cid: 14, name: "Breadbasket Conference"}, {cid: 15, name: "Great Lakes Conference"}, {cid: 16, name: "New Empire Conference"}, {cid: 17, name: "Carolina Conference"}, {cid: 18, name: "Swing State Conference"}, {cid: 19, name: "Ranch Conference"}];
    g.divs = [{did: 0, cid: 0, name: "ACC - North"}, {did: 1, cid: 0, name: "ACC - South"}, {did: 2, cid: 1, name: "Big North - East"}, {did: 3, cid: 1, name: "Big North - West"}, {did: 4, cid: 2, name: "SEC - East"}, {did: 5, cid: 2, name: "SEC - West"}, {did: 6, cid: 3, name: "PCC - North"}, {did: 7, cid: 3, name: "PCC - South"}, {did: 8, cid: 4, name: "Mid West - North"}, {did: 9, cid: 4, name: "Mid West - South"}, {did: 10, cid: 5, name: "Deep South - East"}, {did: 11, cid: 5, name: "Deep South - West"}, {did: 12, cid: 6, name: "West Ocean - East"}, {did: 13, cid: 6, name: "West Ocean - West"}, {did: 14, cid: 7, name: "Desert - North"}, {did: 15, cid: 7, name: "Desert - South"}, {did: 16, cid: 8, name: "California - North"}, {did: 17, cid: 8, name: "California - South"}, {did: 18, cid: 9, name: "Rocky - North"}, {did: 19, cid: 9, name: "Rocky - South"}, {did: 20, cid: 10, name: "New England - East"}, {did: 21, cid: 10, name: "New England - West"}, {did: 22, cid: 11, name: "Capital - North"}, {did: 23, cid: 11, name: "Capital - South"}, {did: 24, cid: 12, name: "Florida - North"}, {did: 25, cid: 12, name: "Florida - South"}, {did: 26, cid: 13, name: "Chicago - North"}, {did: 27, cid: 13, name: "Chicago - South"}, {did: 28, cid: 14, name: "Breadbasket - North"}, {did: 29, cid: 14, name: "Breadbasket - South"}, {did: 30, cid: 15, name: "Great Lakes - East"}, {did: 31, cid: 15, name: "Great Lakes - West"}, {did: 32, cid: 16, name: "New Empire - North"}, {did: 33, cid: 16, name: "New Empire - South"}, {did: 34, cid: 17, name: "Carolina - East"}, {did: 35, cid: 17, name: "Carolina - West"}, {did: 36, cid: 18, name: "Swing State - East"}, {did: 37, cid: 18, name: "Swing State - West"}, {did: 38, cid: 19, name: "Ranch - North"}, {did: 39, cid: 19, name: "Ranch - South"}];
    g.salaryCap = 10000000;  // [thousands of dollars]
    g.minPayroll = 0;  // [thousands of dollars]
    g.luxuryPayroll = 10000000;  // [thousands of dollars]
    g.luxuryTax = 1.5;
    g.minContract = 0;  // [thousands of dollars]
    g.maxContract = 5000000;  // [thousands of dollars]
    g.minRosterSize = 13;

    // Constants in all caps
    g.PHASE = {
        FANTASY_DRAFT: -1,
        PRESEASON: 0,
        REGULAR_SEASON: 1,
        AFTER_TRADE_DEADLINE: 2,
        PLAYOFFS: 3,
/*        BEFORE_DRAFT: 4,
        DRAFT: 5,
        AFTER_DRAFT: 6,
        RESIGN_PLAYERS: 7,
        FREE_AGENCY: 8*/		
        BEFORE_PLAYOFFS64: 4,
        PLAYOFFS64: 5,
		//// remove

        BEFORE_DRAFT: 6,
        //// don't actually draft, just create players and have them undrafted
  //      DRAFT: 7,
		
  //      AFTER_DRAFT: 8,
		//// autoresign, but can still cut later, so remove this
    //    RESIGN_PLAYERS: 9,
		//// keep (can cut for no cost)		
        FREE_AGENCY: 7
		
    };
    g.PLAYER = {
        FREE_AGENT: -1,
        UNDRAFTED: -2,
        RETIRED: -3,
        UNDRAFTED_2: -4, // Next year's draft class
        UNDRAFTED_3: -5, // Next next year's draft class
        UNDRAFTED_FANTASY_TEMP: -6 // Store current draft class here during fantasy draft
    };

/*    // Web workers - create only if we're not already inside a web worker!
    g.gameSimWorkers = [];
    if (typeof document !== "undefined") {
        for (i = 0; i < 1; i++) {
            g.gameSimWorkers[i] = new Worker("/js/core/gameSimWorker.js");
        }
    }*/
	
    g.PHASE_TEXT = {
        "-1": "fantasy draft",
        "0": "preseason",
        "1": "regular season",
        "2": "regular season",
        "3": "CT",
        "4": "CT summary",
        "5": "NT",
        "6": "NT summary",
        "7": "recruiting",
        "8": "free agency8",
        "9": "free agency9",
        "10": "recruitingold"
    };

	

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

    g.sport = "collegebasketball"; // For account ajax stuff

    g.compositeWeights = {
        pace: {
            ratings: ['spd', 'jmp', 'dnk', 'tp', 'stl', 'drb', 'pss']
        },
        usage: {
            ratings: ['ins', 'dnk', 'fg', 'tp', 'spd', 'drb'],
            weights: [1.5, 1, 1, 1, 0.15, 0.15]
        },
        dribbling: {
            ratings: ['drb', 'spd']
        },
        passing: {
            ratings: ['drb', 'pss'],
            weights: [0.4, 1]
        },
        turnovers: {
            ratings: ['drb', 'pss', 'spd', 'hgt', 'ins'],
            weights: [1, 1, -1, 1, 1]
        },
        shootingAtRim: {
            ratings: ['hgt', 'spd', 'jmp', 'dnk'],
            weights: [.5, 0.2, 0.6, 1.0]
        },
        shootingLowPost: {
            ratings: ['hgt', 'stre', 'spd', 'ins'],
            weights: [0.5, 0.6, 0.2, 1]
        },
        shootingMidRange: {
            ratings: ['hgt','spd', 'fg'],
            weights:  [0.1,0.1, 1]
        },
        shootingThreePointer: {
            ratings: ['hgt','spd', 'tp'],
            weights: [0.1,0.1, 1]
        },
        shootingFT: {
            ratings: ['ft']
        },
        rebounding: {
            ratings: ['hgt', 'stre', 'jmp', 'reb'],
            weights: [0.5, 0.1, 0.1, 0.7]
        },
        stealing: {
            ratings: ['constant', 'spd', 'stl'],
            weights: [1, 1, 1]
        },
        blocking: {
            ratings: ['hgt', 'jmp', 'blk'],
            weights: [0.5, 0.5, 0.5]
        },
        fouling: {
            ratings: ['constant', 'hgt', 'blk', 'spd'],
            weights: [1.5, 1, 1, -1]
        },
        defense: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'blk', 'stl'],
            weights: [1, 1, 1, 0.5, 1, 1]
        },
        defenseInterior: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'blk'],
            weights: [2, 1, 0.5, 0.5, 1]
        },
        defensePerimeter: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'stl'],
            weights: [0.5, 1, 2, 0.5, 1]
        },
        endurance: {
            ratings: ['constant', 'endu', 'hgt'],
            weights: [1, 1, -0.1]
        },
        athleticism: {
            ratings: ['stre', 'spd', 'jmp', 'hgt'],
            weights: [1, 1, 1, 0.5]
        }
    };	
	
    // THIS MUST BE ACCURATE OR BAD STUFF WILL HAPPEN
    g.notInDb = ["dbm", "dbl", "lid", "confs", "divs", "salaryCap", "minPayroll", "luxuryPayroll", "luxuryTax", "minContract", "maxContract", "minRosterSize", "PHASE", "PLAYER","PHASE_TEXT", "gameSimWorkers","vm", "enableLogging", "tld", "sport", "compositeWeights", "notInDb"];

    return g;
});