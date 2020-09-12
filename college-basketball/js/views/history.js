/**
 * @name views.history
 * @namespace Summaries of past seasons, leaguewide.
 */
define(["dao", "globals", "ui", "core/player", "core/team", "lib/bluebird", "lib/knockout", "util/bbgmView", "util/helpers", "views/components"], function (dao, g, ui, player, team, Promise, ko, bbgmView, helpers, components) {
    "use strict";

    function get(req) {
        var season;

        season = helpers.validateSeason(req.params.season);

        // If playoffs aren't over, season awards haven't been set
        if (g.phase <= g.PHASE.PLAYOFFS) {
            // View last season by default
            if (season === g.season) {
                season -= 1;
            }
        }

        if (season < g.startingSeason) {
            return {
                errorMessage: "There is no league history yet. Check back after the playoffs."
            };
        }

        return {
            season: season
        };
    }

    function updateHistory(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || vm.season() !== inputs.season) {
			
			var extraConferences;
			
			extraConferences = false;
			if (g.gameType == 1)  {
				extraConferences = true;					  
			}					
			
            return Promise.all([
                dao.awards.get({key: inputs.season}),
                dao.players.getAll({
                    index: "retiredYear",
                    key: inputs.season
                }),
                team.filter({
                    attrs: ["tid", "cid","abbrev", "region", "name"],
                    seasonAttrs: ["playoffRoundsWon"],
                    season: inputs.season
                })
            ]).spread(function (awards, retiredPlayers, teams) {
                var champ,champ2,champ3,champ4,champ5,champ6,champ7,champ8,champ9,champ10,champ11,champ12,champ13,champ14,champ15,champ16,champ17,champ18,champ19,champ20, i;
				var conf,conf2,conf3,conf4,conf5,conf6,conf7,conf8,conf9,conf10,conf11,conf12,conf13,conf14,conf15,conf16,conf17,conf18,conf19,conf20;
 //               var champ, i;

                // Hack placeholder for old seasons before Finals MVP existed
                if (!awards.hasOwnProperty("finalsMvp")) {
                    awards.finalsMvp = {
                        pid: 0,
                        name: "N/A",
                        pts: 0,
                        trb: 0,
                        ast: 0
                    };
                }

                // Get list of retired players
          /*      retiredPlayers = player.filter(retiredPlayers, {
                    attrs: ["pid", "name", "age", "hof"],
                    season: inputs.season
                });
                for (i = 0; i < retiredPlayers.length; i++) {
                    // Show age at retirement, not current age
                    retiredPlayers[i].age -= g.season - inputs.season;
                }
                retiredPlayers.sort(function (a, b) { return b.age - a.age; }); */


                // Get champs
                /*for (i = 0; i < teams.length; i++) {
				  console.log("i: "+i+"teams[i].playoffRoundsWon: "+teams[i].playoffRoundsWon+"teams[i].cid: "+teams[i].cid);
                }*/
                // Get champs
                for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if (teams[i].playoffRoundsWon === 4) {                        
						champ = teams[i];	
						conf = i;
                        break;
                    }
                }
                // Get champs2
        /*        for (i = 0; i < teams.length; i++) {
                    if (teams[i].playoffRoundsWon === 4) && (champ != teams[i]) {                        
						champ2 = teams[i];						
                        break;
                    }
                }
                console.log("champ2: "+champ2);*/
               for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i)) {                        
						champ2 = teams[i];						
						conf2 = i;						
                        break;
                    }
                }				
               for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i)) {                        
						champ3 = teams[i];						
						conf3 = i;						
                        break;
                    }
                }				
               for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i)) {                        
						champ4 = teams[i];						
						conf4 = i;						
                        break;
                    }
                }				
               for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i)) {                        
						champ5 = teams[i];						
						conf5 = i;						
                        break;
                    }
                }		
              for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i)) {                        
						champ6 = teams[i];						
						conf6 = i;						
                        break;
                    }
                }					
              for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i)) {                        
						champ7 = teams[i];						
						conf7 = i;						
                        break;
                    }
                }							
				
              for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i)) {                        
						champ8 = teams[i];						
						conf8 = i;						
                        break;
                    }
                }						
				
              for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i)) {                        
						champ9 = teams[i];						
						conf9 = i;						
                        break;
                    }
                }						
				
              for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i)) {                        
						champ10 = teams[i];						
						conf10 = i;						
                        break;
                    }
                }	

              for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i)) {                        
						champ11 = teams[i];						
						conf11 = i;						
                        break;
                    }
                }	

            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i)) {                        
						champ12 = teams[i];						
						conf12 = i;						
                        break;
                    }
                }					

            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i) && (conf12!=i)) {                        
						champ13 = teams[i];	
						conf13 = i;						
                        break;
                    }
                }				

            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i) && (conf12!=i) && (conf13!=i)) { 
						champ14 = teams[i];	
						conf14 = i;						
                        break;
                    }
                }								
				
            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i) && (conf12!=i) && (conf13!=i) && (conf14!=i)) { 
						champ15 = teams[i];	
						conf15 = i;						
                        break;
                    }
                }								
				
            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i) && (conf12!=i) && (conf13!=i) && (conf14!=i) && (conf15!=i)) { 
						champ16 = teams[i];	
						conf16 = i;						
                        break;
                    }
                }				

            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i) && (conf12!=i) && (conf13!=i) && (conf14!=i) && (conf15!=i) && (conf16!=i)) { 
						champ17 = teams[i];	
						conf17 = i;						
                        break;
                    }
                }

            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i) && (conf12!=i) && (conf13!=i) && (conf14!=i) && (conf15!=i) && (conf16!=i) && (conf17!=i)) { 
						champ18 = teams[i];	
						conf18 = i;						
                        break;
                    }
                }

            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i) && (conf12!=i) && (conf13!=i) && (conf14!=i) && (conf15!=i) && (conf16!=i) && (conf17!=i) && (conf18!=i)) { 
						champ19 = teams[i];	
						conf19 = i;						
                        break;
                    }
                }

            for (i = 0; i < teams.length; i++) {
//7y                     if (teams[i].playoffRoundsWon === 3) {                        
                    if ((teams[i].playoffRoundsWon === 4) && (conf!=i) && (conf2!=i) && (conf3!=i) && (conf4!=i) && (conf5!=i) && (conf6!=i) && (conf7!=i) && (conf8!=i) && (conf9!=i) && (conf10!=i) && (conf11!=i) && (conf12!=i) && (conf13!=i) && (conf14!=i) && (conf15!=i) && (conf16!=i) && (conf17!=i) && (conf18!=i) && (conf19!=i)) { 
						champ20 = teams[i];	
						conf20 = i;						
                        break;
                    }
                }				
				if (g.gameType == 0)  {
                     champ6 = champ;
                    champ7 = champ;
                    champ8 = champ;
                    champ9 = champ;
                    champ10 = champ;
                    champ11 = champ;
                    champ12 = champ;
                    champ13 = champ;
                    champ14 = champ;
                    champ15 = champ;
                    champ16 = champ;
                    champ17 = champ;
                    champ18 = champ;
                    champ19 = champ;
                    champ20 = champ;
				}						
				
                return {
                    awards: awards,
                    champ: champ,
                    champ2: champ2,
                    champ3: champ3,
                    champ4: champ4,
                    champ5: champ5,
                    champ6: champ6,
                    champ7: champ7,
                    champ8: champ8,
                    champ9: champ9,
                    champ10: champ10,
                    champ11: champ11,
                    champ12: champ12,
                    champ13: champ13,
                    champ14: champ14,
                    champ15: champ15,
                    champ16: champ16,
                    champ17: champ17,
                    champ18: champ18,
                    champ19: champ19,
                    champ20: champ20,
					extraConferences: extraConferences,
                    retiredPlayers: retiredPlayers,
                    season: inputs.season,
                    userTid: g.userTid
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("Conference Tournaments and Regular Season Summary - " + vm.season());
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("history-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "history",
        get: get,
        runBefore: [updateHistory],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});