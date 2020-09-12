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
                            //if (gps[i] > 82) {
                                //gps[i] = 82;
                            if (gps[i] > 162) {
                                gps[i] = 162;
                            }

                            break;
                        }
                    }
                }

                   players = player.filter(players, {
                        attrs: ["pid", "name", "injury", "watch","pos"],
                        ratings: ["skills"],
  //                      stats: ["pts", "trb", "ast", "fgp", "tpp", "ftp", "blk", "stl", "min", "per", "ewa", "gp", "fg", "tp", "ft", "abbrev", "tid"],
//                        stats: ["pts", "stl", "blk", "ft", "orb", "fg", "fg", "tp", "fgAtRim", "per", "ewa", "gp", "fga", "tp", "fta", "abbrev", "tid"],
                        stats: ["pts",  "ast", "fgp", "tpp", "blk", "stl", "min", "per", "ewa", "gp", "fg", "tp", "ft", "abbrev", "tid","stl","fga","orb","fgAtRim","fta","pf","fgaMidRange", "trb", "ftp","trb"],
                        season: inputs.season
                    });
					
                    userAbbrev = helpers.getAbbrev(g.userTid);

                    // minStats and minValues are the NBA requirements to be a league leader for each stat http://www.nba.com/leader_requirements.html. If any requirement is met, the player can appear in the league leaders
                    categories = [];
//                    categories.push({name: "Runs", stat: "R", title: "Points Per Game", data: [], minStats: ["gp", "pts"], minValue: [70, 1400]});
                    categories.push({name: "Runs", stat: "R", title: "Points Per Game", data: [], minStats: ["fga", "pts"], minValue: [250, 1400]}); //OK
                    categories.push({name: "Runs Batted In", stat: "RBI", title: "Rebounds Per Game", data: [], minStats: ["fga", "trb"], minValue: [0, 800]}); //OK
                    categories.push({name: "Home Runs", stat: "HR", title: "Assists Per Game", data: [], minStats: ["fga", "ast"], minValue: [0, 400]});  // OK
                    categories.push({name: "Doubles", stat: "2B", title: "Field Goal Percentage", data: [], minStats: ["fga"], minValue: [300]}); // OK
                    categories.push({name: "Triples", stat: "3B", title: "Three-Pointer Percentage", data: [], minStats: ["fga"], minValue: [55]}); // OK
                    categories.push({name: "Batting Average", stat: "BA", title: "Free Throw Percentage", data: [], minStats: ["fga"], minValue: [502]});
                    categories.push({name: "Slugging Percentage", stat: "SLG", title: "Blocks Per Game", data: [], minStats: ["fga", "blk"], minValue: [502, 100]});
                    categories.push({name: "Steals", stat: "Stl", title: "Steals Per Game", data: [], minStats: ["fga", "stl"], minValue: [502, 125]}); // OK
                    categories.push({name: "Earned Run Average", stat: "ERA", title: "Player Efficiency Rating", data: [], minStats: ["fta"], minValue: [162]});
                    categories.push({name: "Fielding Independent Pitching", stat: "FIP", title: "Estimated Wins Added", data: [], minStats: ["fta"], minValue: [162]});
                    categories.push({name: "Strike Outs", stat: "SO", title: "Minutes Per Game", data: [], minStats: ["fta", "fta"], minValue: [162, 2000]});
//                    stats = ["pts", "trb", "ast", "fgp", "tpp", "ftp", "blk", "stl", "min", "per", "ewa"];
//                    stats = ["pts", "stl", "blk", "ft", "orb", "orb", "orb", "tp", "fgAtRim", "fgAtRim", "fgAtRim"];
                    stats = ["pts", "stl", "blk", "ft", "orb", "trb", "ftp", "tp", "pf", "fgaMidRange", "fgAtRim"];

 

                    for (i = 0; i < categories.length; i++) {
					    
						if ((i < 8) || (i>9)) {
							players.sort(function (a, b) { return b.stats[stats[i]] - a.stats[stats[i]]; });
						} else {
						    players.sort(function (a, b) { return -b.stats[stats[i]] + a.stats[stats[i]]; });
						}
                        for (j = 0; j < players.length; j++) {
                            // Test if the player meets the minimum statistical requirements for this category
                            pass = false;
                            for (k = 0; k < categories[i].minStats.length; k++) {
                                // Everything except gp is a per-game average, so we need to scale them by games played
//                                if (categories[i].minStats[k] === "gp") {
                                if (categories[i].minStats[k] === "fga") {
                                    playerValue = players[j].stats[categories[i].minStats[k]];
                                } else if (categories[i].minStats[k] === "fta") {
									if ((players[j].pos == "SP") || (players[j].pos == "RP") || (players[j].pos == "CL")) {						
										playerValue = players[j].stats[categories[i].minStats[k]] * players[j].stats.gp;
									} else {
										playerValue = players[j].stats[categories[i].minStats[k]] * players[j].stats.gp;										
									}
                                } else {
                                    playerValue = players[j].stats[categories[i].minStats[k]] * players[j].stats.gp;
                                }

                                // Compare against value normalized for team games played
                                if (playerValue >= Math.ceil(categories[i].minValue[k] * gps[players[j].stats.tid] / 162)) {
                                    pass = true;
                                    break;  // If one is true, don't need to check the others
                                }
                            }

                            if (pass) {
                                leader = helpers.deepCopy(players[j]);
                                leader.i = categories[i].data.length + 1;
                                leader.stat = leader.stats[stats[i]];
                                leader.statname = i; // mark stat type
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