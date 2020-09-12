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
    g.confs = [{cid: 0, name: "East Conference"}, {cid: 1, name: "West Conference"}];
//    g.divs = [{did: 0, cid: 0, name: "Atlantic"}, {did: 1, cid: 0, name: "Central"}, {did: 2, cid: 0, name: "Southeast"}, {did: 3, cid: 1, name: "Southwest"}, {did: 4, cid: 1, name: "Northwest"}, {did: 5, cid: 1, name: "Pacific"}];
 //   g.divs = [{did: 0, cid: 0, name: "AFC East"}, {did: 1, cid: 0, name: "AFC Central"}, {did: 2, cid: 0, name: "AFC West"}, {did: 3, cid: 1, name: "NFC East"}, {did: 4, cid: 1, name: "NFC Central"}, {did: 5, cid: 1, name: "NFC West"}];
    g.divs = [{did: 0, cid: 0, name: "East"}, {did: 1, cid: 1, name: "West"}];
    g.salaryCap = 1330000;  // [thousands of dollars]
    g.minPayroll = 10000;  // [thousands of dollars]
    g.luxuryPayroll = 1330000;  // [thousands of dollars]
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

    // THIS MUST BE ACCURATE OR BAD STUFF WILL HAPPEN
    g.notInDb = ["dbm", "dbl", "lid", "confs", "divs", "salaryCap", "minPayroll", "luxuryPayroll", "luxuryTax", "minContract", "maxContract", "minRosterSize", "PHASE", "PLAYER", "gameSimWorkers", "vm", "enableLogging", "tld", "sport", "notInDb"];

    return g;
});