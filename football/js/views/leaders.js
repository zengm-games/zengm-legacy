/**
 * @name views.leaders
 * @namespace League stat leaders.
 */
define(["dao", "globals", "ui", "core/player", "lib/bluebird", "lib/knockout", "lib/knockout.mapping", "util/bbgmView", "util/helpers", "views/components"], function (dao, g, ui, player, Promise, ko, komapping, bbgmView, helpers, components) {
    "use strict";

    var mapping;

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function InitViewModel() {
        this.season = ko.observable();
        this.categories = ko.observable([]);
    }

    mapping = {
        categories: {
            create: function (options) {
                return new function () {
                    komapping.fromJS(options.data, {
                        data: {
                            key: function (data) {
                                return ko.unwrap(data.pid);
                            }
                        }
                    }, this);
                }();
            },
            key: function (data) {
                return ko.unwrap(data.name);
            }
        }
    };

    function updateLeaders(inputs, updateEvents, vm) {
        // Respond to watchList in case players are listed twice in different categories
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("watchList") >= 0 || (inputs.season === g.season && updateEvents.indexOf("gameSim") >= 0) || inputs.season !== vm.season()) {

            return Promise.all([
                dao.teams.getAll(),
                dao.players.getAll({
                    statsSeasons: [inputs.season]
                })
            ]).spread(function (teams, players) {
                var categories, gps, i, j, k, leader, pass, userAbbrev, playerValue, stats;

                // Calculate the number of games played for each team, which is used later to test if a player qualifies as a league leader
                gps = [];
                for (i = 0; i < teams.length; i++) {
                    for (j = 0; j < teams[i].seasons.length; j++) {
                        if (teams[i].seasons[j].season === inputs.season) {
                            gps[i] = teams[i].seasons[j].gp;

                            // Don't count playoff games
                            if (gps[i] > 16) {
                                gps[i] = 16;
                            }

                            break;
                        }
                    }
                }

                   players = player.filter(players, {
                        attrs: ["pid", "name", "injury", "watch"],
                        ratings: ["skills"],
                        stats: ["qbr", "ruya", "reyc", "stl", "drb", "orb", "blk", "stl", "fgaAtRim","min", "per", "ewa", "gp","gs", "fg", "tp", "ft", "abbrev", "tid","fg","fga","fgp","fgaMidRange","olr","fgpAtRim","tov","tgts","olr"],
                        season: inputs.season
                    });					
					
                    userAbbrev = helpers.getAbbrev(g.userTid);

                    // minStats and minValues are the NBA requirements to be a league leader for each stat http://www.nba.com/leader_requirements.html. If any requirement is met, the player can appear in the league leaders
                    categories = [];
                    categories.push({name: "QB Rating", stat: "QBR", title: "Quarterback Rating", data: [], minStats: [ "fga"], minValue: [ 20]});
                    categories.push({name: "Rushing Y/A", stat: "RuY/A", title: "Rushing Yard Per Attempt", data: [], minStats: [ "tov"], minValue: [ 10]});
                    categories.push({name: "Receiving Y/C", stat: "ReY/C", title: "Receiving Yard Per Catch", data: [], minStats: ["tgts"], minValue: [ 2]});
                    categories.push({name: "Passing Yards", stat: "PY", title: "Total Passing Yards", data: [], minStats: ["fga","fga"], minValue: [20,20]});
                    categories.push({name: "Rushing Yards", stat: "RushY", title: "Total Rushing Yards", data: [], minStats: ["tov","tov"], minValue: [10,10]});
                    categories.push({name: "Receiving Yards", stat: "RecY", title: "Total Receiving Yards", data: [], minStats: ["tgts","tgts"], minValue: [2,2]});
                    categories.push({name: "Lead Blocks", stat: "LB", title: "Lead Blocker On Running Play", data: [], minStats: ["olr", "olr"], minValue: [5, 5]});
                    categories.push({name: "FG Percentage", stat: "FG%", title: "Field Goal Percentage", data: [], minStats: ["fgaAtRim", "fgaAtRim"], minValue: [1, 1]});
                    //categories.push({name: "Minutes", stat: "Min", title: "Minutes Per Game", data: [], minStats: ["gp", "gs"], minValue: [8,8]});
                    //categories.push({name: "Player Efficiency Rating", stat: "PER", title: "Player Efficiency Rating", data: [], minStats: ["gp","gs"], minValue: [8,8]});
                    categories.push({name: "Sacks", stat: "Sk", title: "Sacks Of Quarterback", data: [], minStats: ["fgaMidRange","fgaMidRange"], minValue: [0.25,0.25]});
//                    stats = ["qbr", "ruya", "reyc", "stl", "drb", "orb", "olr", "fgpAtRim", "fga", "fgp", "fgaMidRange"];
                    stats = ["qbr", "ruya", "reyc", "stl", "drb", "orb", "olr", "fgpAtRim", "fgaMidRange"];

 

                    for (i = 0; i < categories.length; i++) {
                        players.sort(function (a, b) { return b.stats[stats[i]] - a.stats[stats[i]]; });
                        for (j = 0; j < players.length; j++) {
                            // Test if the player meets the minimum statistical requirements for this category
                            pass = false;
                            for (k = 0; k < categories[i].minStats.length; k++) {
                                // Everything except gp is a per-game average, so we need to scale them by games played
                             //   if (categories[i].minStats[k] === "gp") {
                             //       playerValue = players[j].stats[categories[i].minStats[k]];
                             //   } else {
                                    playerValue = players[j].stats[categories[i].minStats[k]] * players[j].stats.gp;
//                                    playerValue = players[j].stats[categories[i].minStats[k]];
                              //  }

//								gps[players[j].stats.tid] / g.numGames
//                                if (playerValue >= Math.ceil(categories[i].minValue[k] )) {
//                                if (playerValue >= Math.ceil(categories[i].minValue[k] * gps[players[j].stats.tid] / g.numGames )) {
                                if (playerValue >= Math.ceil(categories[i].minValue[k] * gps[players[j].stats.tid] )) {
                                    pass = true;
                                    break;  // If one is true, don't need to check the others
                                }
                            }

                            if (pass) {
                                leader = helpers.deepCopy(players[j]);
                                leader.i = categories[i].data.length + 1;
                                leader.stat = leader.stats[stats[i]];
                                leader.abbrev = leader.stats.abbrev;
                                delete leader.stats;
                                if (userAbbrev === leader.abbrev) {
                                    leader.userTeam = true;
                                } else {
                                    leader.userTeam = false;
                                }
                                categories[i].data.push(leader);
                            }

                            // Stop when we found 10
                            if (categories[i].data.length === 10) {
                                break;
                            }
                        }

                        delete categories[i].minStats;
                        delete categories[i].minValue;
                    }

                return {
                    season: inputs.season,
                    categories: categories
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("League Leaders - " + vm.season());
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("leaders-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "leaders",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updateLeaders],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});