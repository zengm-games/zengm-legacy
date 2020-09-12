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
                var champ,champ2,champ3,champ4,champ5, i;
				var conf,conf2,conf3,conf4,conf5;
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
				
                return {
                    awards: awards,
                    champ: champ,
                    champ2: champ2,
                    champ3: champ3,
                    champ4: champ4,
                    champ5: champ5,
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