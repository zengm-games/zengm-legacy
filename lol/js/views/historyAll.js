/**
 * @name views.historyAll
 * @namespace Single table summary of all past seasons, leaguewide.
 */
define(["dao", "globals", "ui", "lib/bluebird", "lib/jquery", "lib/knockout", "util/bbgmView", "util/helpers"], function (dao, g, ui, Promise, $, ko, bbgmView, helpers) {
    "use strict";

    var mapping;

    mapping = {
        seasons: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updateHistory(inputs, updateEvents) {
        if (updateEvents.indexOf("firstRun") >= 0) {
            return Promise.all([
                dao.awards.getAll(),
                dao.teams.getAll()
            ]).spread(function (awards, teams) {
                var championshipsByTid, i, seasons;

                seasons = [];
                for (i = 0; i < awards.length; i++) {
                    seasons[i] = {
                        season: awards[i].season,
                        finalsMvp: awards[i].finalsMvp,
                        mvp: awards[i].mvp,
                        dpoy: awards[i].dpoy,
                        roy: awards[i].roy
                    };
                }

                teams.forEach(function (t) {
                    var found, i, j;
					var champRounds,runnerupRounds;

					champRounds = 2;
					runnerupRounds = 1;
					if (g.gameType == 0) {
						champRounds = 3;
						runnerupRounds = 2;
					} else if (g.gameType == 1) {
						champRounds = 27;
						runnerupRounds = 26;
					} else if (g.gameType == 2) {
						champRounds = 4;
						runnerupRounds = 3;
					} else if (g.gameType == 3) {
						champRounds = 6;
						runnerupRounds = 5;
					} else if (g.gameType == 4) {
						champRounds = 3;
						runnerupRounds = 2;
					} else if (g.gameType == 5) {
						champRounds = 6;
						runnerupRounds = 5;					
					}
					
                    // t.seasons has same season entries as the "seasons" array built from awards
				//	console.log(seasons.length);
				//	console.log(t.seasons.length);
                    for (i = 0; i < seasons.length; i++) {
                        // Find corresponding entries in seasons and t.seasons. Can't assume they are the same because they aren't if some data has been deleted (Improve Performance)
                        found = false;
                        for (j = 0; j < t.seasons.length; j++) {
						//	console.log(t.seasons[j].season+" "+seasons[i].season)
                            if (t.seasons[j].season === seasons[i].season) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                           // return;
                        } else {
						
						//	console.log(t.seasons[j].playoffRoundsWon);
							if (t.seasons[j].playoffRoundsWon === champRounds) {
								console.log(t.tid);
								seasons[i].champ = {
									tid: t.tid,
									abbrev: t.abbrev,
									region: t.region,
									name: t.name,
									won: t.seasons[j].won,
									lost: t.seasons[j].lost
								};
							} else if (t.seasons[j].playoffRoundsWon === runnerupRounds) {
								seasons[i].runnerUp = {
									abbrev: t.abbrev,
									region: t.region,
									name: t.name,
									won: t.seasons[j].won,
									lost: t.seasons[j].lost
								};
							}
						}						
                    }
                });

                // Count up number of championships per team
                championshipsByTid = [];
                for (i = 0; i < g.numTeams; i++) {
                    championshipsByTid.push(0);
                }
                for (i = 0; i < seasons.length; i++) {
                    if (seasons[i].champ) {
                        championshipsByTid[seasons[i].champ.tid] += 1;
                        seasons[i].champ.count = championshipsByTid[seasons[i].champ.tid];
                        delete seasons[i].champ.tid;
                    }
                }

                return {
                    seasons: seasons
                };
            });
        }
    }

    function uiFirst(vm) {
        var awardName, teamName;

        ui.title("League History");

        awardName = function (award, season) {
            if (!award) {
                // For old seasons with no Finals MVP
                return 'N/A';
            }

            return helpers.playerNameLabels(award.pid, award.name) + ' (<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[award.tid], season]) + '">' + g.teamAbbrevsCache[award.tid] + '</a>)';
        };
        teamName = function (t, season) {
            if (t) {
                return '<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.region + '</a> (' + t.won + '-' + t.lost + ')';
            }

            // This happens if there is missing data, such as from Improve Performance
            return 'N/A';
        };

        ko.computed(function () {
            ui.datatable($("#history-all"), 0, vm.seasons().map(function (s) {
                var countText, seasonLink;

                if (s.champ) {
                    seasonLink = '<a href="' + helpers.leagueUrl(["history", s.season]) + '">' + s.season + '</a>';
                    countText = ' - ' + helpers.ordinal(s.champ.count) + ' title';
                } else {
                    // This happens if there is missing data, such as from Improve Performance
                    seasonLink = String(s.season);
                    countText = '';
                }

//                return [seasonLink, teamName(s.champ, s.season) + countText, teamName(s.runnerUp, s.season), awardName(s.finalsMvp, s.season), awardName(s.mvp, s.season), awardName(s.dpoy, s.season), awardName(s.roy, s.season)];
                return [seasonLink, teamName(s.champ, s.season) + countText, teamName(s.runnerUp, s.season), awardName(s.finalsMvp, s.season), awardName(s.mvp, s.season)];
            }));
        }).extend({throttle: 1});
    }

    return bbgmView.init({
        id: "historyAll",
        mapping: mapping,
        runBefore: [updateHistory],
        uiFirst: uiFirst
    });
});