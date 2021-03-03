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
   // g.confs = [{cid: 0, name: "Eastern Conference"}, {cid: 1, name: "Western Conference"}];
//    g.divs = [{did: 0, cid: 0, name: "Atlantic"}, {did: 1, cid: 0, name: "Metropolitan"}, {did: 2, cid: 0, name: "Gone"}, {did: 3, cid: 1, name: "Central"}, {did: 4, cid: 1, name: "Pacific"}, {did: 5, cid: 1, name: "Gone2"}];
   // g.divs = [{did: 0, cid: 0, name: "Atlantic"}, {did: 1, cid: 0, name: "Metropolitan"}, {did: 2, cid: 1, name: "Central"}, {did: 3, cid: 1, name: "Pacific"}];
    g.salaryCap = 73500;  // [thousands of dollars]
    g.minPayroll = 55800;  // [thousands of dollars]
    g.luxuryPayroll = 71400;  // [thousands of dollars]
    g.luxuryTax = 1.5;
    g.minContract = 575;  // [thousands of dollars]
    g.maxContract = 14280;  // [thousands of dollars]
    g.minRosterSize = 20;

    // Constants in all caps
    g.PHASE = {
        FANTASY_DRAFT: -1,
        PRESEASON: 0,
        REGULAR_SEASON: 1,
        AFTER_TRADE_DEADLINE: 2,
        PLAYOFFS: 3,
        BEFORE_DRAFT: 4,
        DRAFT: 5,
        AFTER_DRAFT: 6,
        RESIGN_PLAYERS: 7,
        FREE_AGENCY: 8
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
        "4": "before draft",
        "5": "draft",
        "6": "after draft",
        "7": "re-sign players",
        "8": "free agency"
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

    g.sport = "hockey"; // For account ajax stuff

    g.compositeWeights = {
        pace: {
            ratings: ['spd', 'jmp', 'dnk', 'tp', 'stl', 'drb', 'pss']
        },
        usage: {
            ratings: ['ovr'],
            weights: [1.1]
        },
        dribbling: {
            ratings: ['blk', 'pss','stl','ft','quik','jmp','stre','hgt','spd','hsd','ins','dnk'],
            weights: [.25, 3,.25,.25,.25,.25,.25,.25,.25,.25,.25,.25]
        },
        passing: {
            ratings: ['blk', 'pss','stl','ft','quik','jmp','stre','hgt','spd','ins','dnk'],
            weights: [2,2,2,.5,.5,.25,.25,.25,.25,.5,.5]
        },
        turnovers: {
            ratings: ['pss', 'stl', 'blk', 'quik', 'jmp','spd','stre','hgt','ins','ft']
        },
        shootingAtRim: {
            ratings: ['spd','hgt','stre', 'jmp', 'quik', 'drb', 'reb', 'pss', 'stl','ins','dnk','ft'],
            weights: [2.0,0.25,0.25, 1, 1, 0.1,0,1,3,.5,.1,.5]
        },
        shootingLowPost: {
            ratings: ['spd','hgt','stre', 'jmp', 'quik', 'drb', 'reb', 'pss', 'stl','ins','dnk','ft'],
            weights: [0.25,0.5,2, 2, 2, 2,2,2,2,2,.5,2]
        },
        shootingMidRange: {
            ratings: ['spd','hgt','stre', 'jmp', 'quik', 'drb', 'reb', 'pss', 'stl','ins','dnk','ft'],
            weights: [.5,.5,.5, .5, .5, 2,0,1,1,1,.1,.5]
        },
        shootingThreePointer: {
            ratings: ['spd','hgt','stre', 'jmp', 'quik', 'drb', 'reb', 'pss', 'stl','ins','dnk','ft'],
            weights: [.5,1,1.5, .25, .25, 2,0,.25,.25,.25,.25,.25]
        },
        shootingFT: {
            ratings: ['spd','hgt','stre', 'jmp', 'quik', 'drb', 'reb', 'pss', 'stl','ins','dnk','ft'],
			weights: [.25,0,.25, 1, 1, 0.1,0,2,2,1,0,1]
        },
        rebounding: {
            ratings: ['stre', 'jmp', 'quik', 'ins', 'ft', 'fg', 'tp', 'stl', 'pss', 'reb'],
            weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 10]
        },
        stealing: {
            ratings: ['constant', 'spd', 'jmp', 'quik','hsd','fg','tp','pss'],
            weights: [1, 1, 1,1,1,1,1,5]
        },
        blocking: {
            ratings: ['hgt', 'stre', 'spd','jmp','quik','ins','fg','tp','pss','reb'],
            weights: [1, 1, 1, 1, 1,1, 5, 10, 1, 1]
        },
        fouling: {
            ratings: ['constant', 'hgt', 'stre', 'spd', 'jmp', 'quik','ins','dnk','fg','tp'],
            weights: [1.5, -.1, -.1, -.1, -.1, -.1, -.5, -.5, 1, 1]
        },
        defense: {
            ratings: [ 'hgt', 'stre', 'spd', 'jmp', 'quik','hsd','dnk','fg','tp','pss','reb'],
            weights: [ 2, 2, 2, 2, 2, 4, 2, 5, 5,5,5]
        },
        defenseInterior: {
            ratings: [ 'hgt', 'stre', 'spd', 'jmp', 'quik','hsd','dnk','fg','tp','pss','reb'],
            weights: [ 2, 4, 2, 2, 4, 2, 1, 10, 10,5,10]
        },
        defensePerimeter: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'quik','hsd','dnk','fg','tp','pss','reb'],
            weights: [ 4, 2, 4, 4, 2, 4, 2, 5, 5,15,5]
        },
        endurance: {
            ratings: [ 'endu'],
            weights: [1]
        },
        athleticism: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'quik'], 
            weights: [0.5, 1, 1, 1,1]
        },
        faceoff: {
            ratings: ['hgt', 'stre', 'spd', 'jmp', 'quik', 'face', 'fg'],
            weights:  [0.1,0.1, 0.1, 0.1, 0.5, 1.0,0.1]
        }
    };	
	
    // THIS MUST BE ACCURATE OR BAD STUFF WILL HAPPEN
    g.notInDb = ["dbm", "dbl", "lid", "confs", "divs", "salaryCap", "minPayroll", "luxuryPayroll", "luxuryTax", "minContract", "maxContract", "minRosterSize", "PHASE", "PLAYER","PHASE_TEXT", "gameSimWorkers","vm", "enableLogging", "tld", "sport", "compositeWeights", "notInDb"];

    return g;
});