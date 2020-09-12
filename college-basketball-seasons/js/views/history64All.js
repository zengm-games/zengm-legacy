/**
 * @name views.history64All
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
                var championships64ByTid, i, seasons;
                var runnerUp64ByTid;
                seasons = [];
                for (i = 0; i < awards.length; i++) {
                    seasons[i] = {
                        season: awards[i].season,
               //         finalsMvp: awards[i].finalsMvp
               //         mvp: awards[i].mvp,
                //        dpoy: awards[i].dpoy,
                 //       roy: awards[i].roy
                    };
                }

                teams.forEach(function (t) {
                    var found, i, j;
					var found4;
					found4 = 0;
                    // t.seasons has same season entries as the "seasons" array built from awards
                    for (i = 0; i < seasons.length; i++) {
                        // Find corresponding entries in seasons and t.seasons. Can't assume they are the same because they aren't if some data has been deleted (Improve Performance)
                        found = false;
                        for (j = 0; j < t.seasons.length; j++) {
                            if (t.seasons[j].season === seasons[i].season) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            return;
                        }

                        if (t.seasons[j].playoff64RoundsWon === 6) {
                            seasons[i].champ64 = {
                                tid: t.tid,
                                abbrev: t.abbrev,
                                region: t.region,
                                name: t.name,
                                won: t.seasons[j].won,
                                lost: t.seasons[j].lost
                            };
                        } else if (t.seasons[j].playoff64RoundsWon === 5) {
                            seasons[i].runnerUp64 = {
                                abbrev: t.abbrev,
                                region: t.region,
                                name: t.name,
                                won: t.seasons[j].won,
                                lost: t.seasons[j].lost
                            };
                        } else if (t.seasons[j].playoff64RoundsWon === 4) {
						    found4+=1;
							if (found4===1) {
							  console.log("found first final four: "+found4);
								seasons[i].finalFour641st = {
									abbrev: t.abbrev,
									region: t.region,
									name: t.name,
									won: t.seasons[j].won,
									lost: t.seasons[j].lost
								};
							} else {
							  console.log("found second final four 2: "+found4);							
								seasons[i].finalFour642nd = {
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
                championships64ByTid = [];
                for (i = 0; i < g.numTeams; i++) {
                    championships64ByTid.push(0);
                }
				

                for (i = 0; i < seasons.length; i++) {
                    if (seasons[i].champ64) {
                        championships64ByTid[seasons[i].champ64.tid] += 1;						
                        seasons[i].champ64.count = championships64ByTid[seasons[i].champ64.tid];
                        delete seasons[i].champ64.tid;
                    }
                }

			/*	runnerUp64ByTid = [];
                for (i = 0; i < g.numTeams; i++) {
                    runnerUp64ByTid.push(0);
                }
				
                for (i = 0; i < seasons.length; i++) {
                    if (seasons[i].runnerUp64) {
                        runnerUp64ByTid[seasons[i].runnerUp64.tid] += 1;
                        seasons[i].runnerUp64.count = runnerUp64ByTid[seasons[i].runnerUp64.tid];
                        delete seasons[i].runnerUp64.tid;
                    }
                }*/
				
			//	runnerUp64ByTid
				
                return {
                    seasons: seasons
                };
            });
        }
    }

    function uiFirst(vm) {
        var awardName, teamName;

        ui.title("National Tournament History");

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
            ui.datatable($("#history64-all"), 0, vm.seasons().map(function (s) {
                var countText, countText2, seasonLink;

                if (s.champ64) {
                    seasonLink = '<a href="' + helpers.leagueUrl(["history64", s.season]) + '">' + s.season + '</a>';
                    countText = ' - ' + helpers.ordinal(s.champ64.count) + ' title';
                } else {
                    // This happens if there is missing data, such as from Improve Performance
                    seasonLink = String(s.season);
                    countText = '';
                }

            /*   if (s.runnerUp64) {
                //    seasonLink = '<a href="' + helpers.leagueUrl(["history64", s.season]) + '">' + s.season + '</a>';
                    countText2 = ' - ' + helpers.ordinal(s.runnerUp64.count) + ' time';
                } else {
                    // This happens if there is missing data, such as from Improve Performance
                //    seasonLink = String(s.season);
                    countText2 = '';
                }*/
				
				
//                return [seasonLink, teamName(s.champ64, s.season) + countText, teamName(s.runnerUp64, s.season), teamName(s.finalFour64, s.season), awardName(s.finalsMvp64, s.season)];
//                return [seasonLink, teamName(s.champ64, s.season) + countText, teamName(s.runnerUp64, s.season) + countText2, teamName(s.finalFour641st, s.season), teamName(s.finalFour642nd, s.season), awardName(s.finalsMvp64, s.season)];
//                return [seasonLink, teamName(s.champ64, s.season) + countText, teamName(s.runnerUp64, s.season) , teamName(s.finalFour641st, s.season), teamName(s.finalFour642nd, s.season)];
                return [seasonLink, teamName(s.champ64, s.season) + countText, teamName(s.runnerUp64, s.season)];
//                return [seasonLink, teamName(s.champ, s.season) + countText, teamName(s.runnerUp, s.season), awardName(s.finalsMvp, s.season), awardName(s.mvp, s.season), awardName(s.dpoy, s.season), awardName(s.roy, s.season)];
            }));
        }).extend({throttle: 1});
    }

    return bbgmView.init({
        id: "history64All",
        mapping: mapping,
        runBefore: [updateHistory],
        uiFirst: uiFirst
    });
});