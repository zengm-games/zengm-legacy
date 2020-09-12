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
    g.confs = [{cid: 0, name: "American Football Conference"}, {cid: 1, name: "National Football Conference"}];
//    g.divs = [{did: 0, cid: 0, name: "Atlantic"}, {did: 1, cid: 0, name: "Central"}, {did: 2, cid: 0, name: "Southeast"}, {did: 3, cid: 1, name: "Southwest"}, {did: 4, cid: 1, name: "Northwest"}, {did: 5, cid: 1, name: "Pacific"}];
 //   g.divs = [{did: 0, cid: 0, name: "AFC East"}, {did: 1, cid: 0, name: "AFC Central"}, {did: 2, cid: 0, name: "AFC West"}, {did: 3, cid: 1, name: "NFC East"}, {did: 4, cid: 1, name: "NFC Central"}, {did: 5, cid: 1, name: "NFC West"}];
    g.divs = [{did: 0, cid: 0, name: "AFC East"}, {did: 1, cid: 0, name: "AFC North"}, {did: 2, cid: 0, name: "AFC South"}, {did: 3, cid: 0, name: "AFC West"}, {did: 4, cid: 1, name: "NFC East"}, {did: 5, cid: 1, name: "NFC North"}, {did: 6, cid: 1, name: "NFC South"}, {did: 7, cid: 1, name: "NFC West"}];
    g.salaryCap = 155000;  // [thousands of dollars]
    g.minPayroll = g.salaryCap*.9;  // [thousands of dollars]
    g.luxuryPayroll = 143000;  // [thousands of dollars]
    g.luxuryTax = 1.5;
    g.minContract = 400;  // [thousands of dollars]
    g.maxContract = 200000;  // [thousands of dollars]
//    g.minRosterSize = 10;
    g.minRosterSize = 45;
//    g.minRosterSize = 40;

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

    g.sport = "football"; // For account ajax stuff

    g.compositeWeights = {
        throwingAccuracy: {			 
            ratings: ['blk', 'ins', 'stre'],
            weights:  [1, 1, .25]		
        },
        throwingDistance: {
            ratings: ['blk', 'ins', 'stre'],
            weights: [1, .5, 1]
        },
        avoidSack: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft']	
        },
        runningPower: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft'],
            weights: [1, 2, 1,1, 2, .25]
        },
        runningSide: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft'],
            weights: [1, 1, 1, 1, 1, 1]
        },
        receivingShort: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'],
            weights: [.5, 1, 1,1, 1, 1,2,2,4]
        },
        receivingCrossing: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'],
            weights: [2, 1, 1,1, 2, 2,1,2,4]
        },
        receivingLong: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'],
            weights: [8, 1, 1,1, 1, 1,1,4,8]
        },
        blockRun: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','drb'],
            weights: [2, 1, 2,1, 6, 1,1,2,4]
        },
        blockPass: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','drb'],
			weights: [1, 2, 1,2, 1, 2,1,4,8]
        },
        passRush: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','pss'],
            weights: [2, 2, 2,0, 2, 2,2,0,8]
        },
        runStop: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','reb'],
            weights: [2, 2, 2,0, 2, 2,2,0,8]
        },
        shortCoverage: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'],
            weights: [3, 1, 3,0, 2, 2,2,0,8]
        },
        crossingCoverage: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'],
            weights: [6, 1, 2,0, 2, 2,0,0,12]
        },
        deepCoverage: {
            ratings: ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'],
            weights: [15, 1, 2,0, 2, 2,0,0,15]
        },
        punting: {
            ratings: ['kck', 'stre', 'hgt', 'jmp', 'ins','hnd'],
            weights: [6, 1, 1,1, 2, 2]
        },
        kickOff: {
            ratings: ['kck', 'stre', 'hgt', 'jmp', 'ins'],
            weights: [6, 1, 1,1, 0]
        },
        fieldGoal: {
            ratings: ['kck', 'stre', 'hgt', 'jmp', 'ins'],
            weights: [6, 1, 1,1, 4]
        },
        endurance: {
            ratings: ['constant', 'spd', 'drb', 'pss', 'stl',  'reb', 'cvr'],
            weights: [1, 1, -0.02, -0.02, -0.02, -0.02, -0.02]
        }
    };	
	
    // THIS MUST BE ACCURATE OR BAD STUFF WILL HAPPEN
    g.notInDb = ["dbm", "dbl", "lid", "confs", "divs", "salaryCap", "minPayroll", "luxuryPayroll", "luxuryTax", "minContract", "maxContract", "minRosterSize", "PHASE", "PLAYER","PHASE_TEXT", "gameSimWorkers","vm", "enableLogging", "tld", "sport","compositeWeights", "notInDb"];

    return g;
});