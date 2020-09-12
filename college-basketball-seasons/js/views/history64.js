/**
 * @name views.history64
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
                errorMessage: "There is no league history yet. Check back after the National Tournaments."
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
                    attrs: ["tid", "abbrev", "region", "name"],
                    seasonAttrs: ["playoff64RoundsWon"],
                    season: inputs.season
                })
            ]).spread(function (awards, retiredPlayers, teams) {
                var champ64,runnerUp64, i;
                var finalfour,finalfour1,finalfour2;
                var eliteeight,eliteeight1,eliteeight2,eliteeight3,eliteeight4;
                var sweet,sweet1,sweet2,sweet3,sweet4,sweet5,sweet6,sweet7,sweet8;
				
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
                retiredPlayers = player.filter(retiredPlayers, {
                    attrs: ["pid", "name", "age", "hof","year"],
                    season: inputs.season
                });
                for (i = 0; i < retiredPlayers.length; i++) {
                    // Show age at retirement, not current age
                    retiredPlayers[i].age -= g.season - inputs.season;
                }
                retiredPlayers.sort(function (a, b) { return a.age - b.age; });

                // Get champs
				finalfour = 0;
				eliteeight = 0;
				sweet = 0;
                for (i = 0; i < teams.length; i++) {
			//	   console.log("i: "+i+" teams[i].playoff64RoundsWon: "+teams[i].playoff64RoundsWon+" finalfour: "+finalfour);
                    if (teams[i].playoff64RoundsWon === 6) {
                        champ64 = teams[i];
                      //  break;
                    }
					if (teams[i].playoff64RoundsWon === 5) {
                        runnerUp64 = teams[i];
                   //     break;
                    }					
					if ((teams[i].playoff64RoundsWon === 4) && (finalfour === 0)) {
					    finalfour += 1;
                        finalfour1 = teams[i];
                   //     break;
                    } else  if ((teams[i].playoff64RoundsWon === 4) && (finalfour === 1)) {
					    finalfour += 1;					
                        finalfour2 = teams[i];
                   //     break;
                    }					
					if ((teams[i].playoff64RoundsWon === 3) && (eliteeight === 0)) {
					    eliteeight += 1;
                        eliteeight1 = teams[i];
                   //     break;
                    } else  if ((teams[i].playoff64RoundsWon === 3) && (eliteeight === 1)) {
					    eliteeight += 1;					
                        eliteeight2 = teams[i];
                   //     break;
                    } else  if ((teams[i].playoff64RoundsWon === 3) && (eliteeight === 2)) {
					    eliteeight += 1;					
                        eliteeight3 = teams[i];
                    } else  if ((teams[i].playoff64RoundsWon === 3) && (eliteeight === 3)) {
					    eliteeight += 1;					
                        eliteeight4 = teams[i];
                    }					
					
					if ((teams[i].playoff64RoundsWon === 2) && (sweet === 0)) {
					    sweet += 1;
                        sweet1 = teams[i];
                   //     break;
                    } else  if ((teams[i].playoff64RoundsWon === 2) && (sweet === 1)) {
					    sweet += 1;					
                        sweet2 = teams[i];
                   //     break;
                    } else  if ((teams[i].playoff64RoundsWon === 2) && (sweet === 2)) {
					    sweet += 1;					
                        sweet3 = teams[i];
                    } else  if ((teams[i].playoff64RoundsWon === 2) && (sweet === 3)) {
					    sweet += 1;					
                        sweet4 = teams[i];
                    } else  if ((teams[i].playoff64RoundsWon === 2) && (sweet === 4)) {
					    sweet += 1;					
                        sweet5 = teams[i];
                    } else  if ((teams[i].playoff64RoundsWon === 2) && (sweet === 5)) {
					    sweet += 1;					
                        sweet6 = teams[i];
                    } else  if ((teams[i].playoff64RoundsWon === 2) && (sweet === 6)) {
					    sweet += 1;					
                        sweet7 = teams[i];
                    } else  if ((teams[i].playoff64RoundsWon === 2) && (sweet === 7)) {
					    sweet += 1;					
                        sweet8 = teams[i];
                    }										
					
					
                }

                return {
                    awards: awards,
                    champ64: champ64,
                    runnerUp64: runnerUp64,
                    finalfour1: finalfour1,
                    finalfour2: finalfour2,
                    eliteeight1: eliteeight1,
                    eliteeight2: eliteeight2,
                    eliteeight3: eliteeight3,
                    eliteeight4: eliteeight4,
                    sweet1: sweet1,
                    sweet2: sweet2,
                    sweet3: sweet3,
                    sweet4: sweet4,
                    sweet5: sweet5,
                    sweet6: sweet6,
                    sweet7: sweet7,
                    sweet8: sweet8,
                    retiredPlayers: retiredPlayers,
                    season: inputs.season,
                    userTid: g.userTid
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("National Tournament Summary - " + vm.season());
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("history64-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "history64",
        get: get,
        runBefore: [updateHistory],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});