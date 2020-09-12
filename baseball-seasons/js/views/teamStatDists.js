/**
 * @name views.teamStatDists
 * @namespace Team stat distributions.
 */
define(["globals", "ui", "core/team", "lib/boxPlot", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (g, ui, team, boxPlot, $, ko, _, components, bbgmView, helpers, viewHelpers) {
    "use strict";

    var nbaStatsAll;

    nbaStatsAll = {
        won: [93,91,97,86,85,74,96,63,97,71,96,86,94,92,92,92,62,90,74,85,81,74,73,78,66,66,76,74,76,51],
        lost: [69,72,65,76,77,88,66,99,65,91,66,76,68,71,70,70,100,72,88,77,81,88,89,84,96,96,86,88,86,111],
        fga: [6382,6242,6209,6145,6144,6388,6260,6168,6133,6293,6202,6135,6093,6334,6165,6196,6047,6122,6207,6064,6079,6152,6152,6045,6212,6014,6172,6077,6020,6021],
        blk: [178,165,186,138,212,176,164,107,181,155,125,161,112,130,171,176,161,146,130,157,172,185,159,144,151,140,188,148,148,95],
        pts: [853,700,767,649,745,796,733,629,688,698,783,634,648,685,745,730,656,618,619,640,602,712,706,650,614,610,624,598,610,513],
        stl: [819,670,725,618,719,767,696,596,656,664,745,603,620,647,711,691,621,578,593,610,576,669,673,614,590,578,597,574,566,485],
        tp: [123,73,74,78,79,35,82,67,64,67,45,94,153,62,117,149,88,118,114,142,63,112,112,115,52,73,49,105,110,78],
        trb: [0.277,0.257,0.254,0.264,0.26,0.283,0.264,0.26,0.249,0.249,0.269,0.245,0.26,0.259,0.255,0.262,0.251,0.245,0.237,0.252,0.238,0.252,0.27,0.242,0.242,0.248,0.237,0.249,0.24,0.231],
		
		
        drb: [0.349,0.329,0.327,0.326,0.313,0.346,0.329,0.32,0.321,0.327,0.332,0.313,0.315,0.323,0.327,0.323,0.313,0.308,0.306,0.311,0.3,0.318,0.323,0.307,0.312,0.306,0.306,0.302,0.299,0.293],
        ftp: [0.446,0.408,0.419,0.396,0.431,0.434,0.414,0.381,0.402,0.391,0.401,0.396,0.379,0.391,0.41,0.412,0.398,0.378,0.366,0.398,0.392,0.411,0.418,0.376,0.38,0.384,0.39,0.378,0.375,0.335],
        errors: [0.019,0.009,0.013,0.02,0.016,0.013,0.014,0.013,0.012,0.017,0.014,0.01,0.014,0.018,0.012,0.014,0.016,0.012,0.014,0.014,0.021,0.018,0.019,0.018,0.015,0.016,0.016,0.012,0.013,0.018],
        warH: [36.6,30.3,27.5,27.4,26.6,26.5,26.4,26.2,25.3,24.4,23.2,23,22.5,21.9,21.8,21.7,19.5,18.6,18.4,17.9,16.9,16.4,16,10.4,9.4,6.2,4.5,3.2,2.3,-0.7],
        fta: [1462.7,1463.3,1454,1448.3,1447.3,1436,1450.3,1455,1459.7,1465,1452,1445.7,1470.7,1464,1450.3,1441.3,1460,1473.7,1452,1453,1495,1476.7,1436.3,1457.7,1450.3,1448,1447.3,1442.7,1455,1440],
        fgAtRim: [8.79,8.05,8.01,7.51,7.67,6.67,7.65,7.73,7.73,7.97,7.33,7.69,7.72,8.05,8.02,8.61,7.26,7.91,7.49,7.24,7.33,7.37,7.51,7.41,6.11,7.36,7.81,7.02,7.24,6.78],
        fgaAtRim: [2.84,3.06,3.24,2.91,2.72,3.24,2.54,3.15,2.78,2.94,2.65,2.52,3.15,2.96,2.85,3.46,3.24,2.66,3.1,2.93,2.92,2.79,3.17,3.29,2.84,3.36,3.24,2.91,3.25,3.85],
        fgLowPost: [0.79,0.97,0.97,0.96,1.06,0.85,0.79,1.13,0.69,1.07,1.01,0.88,0.62,0.94,0.79,0.92,0.75,1.04,1.21,1.25,1.06,0.93,0.95,1.03,1.04,0.99,0.9,1.09,0.96,1.19],
        pf: [3.61,3.63,3.79,3.45,3.94,4.44,3.18,4,3.43,4.32,3.56,3.59,3.27,3.74,3.25,3.82,3.71,3.38,4.26,4.2,3.92,3.78,4.34,4.24,4.55,4,4,3.84,3.98,4.79],
        fgaMidRange: [3.27,3.77,3.84,3.83,3.89,3.96,3.44,4.13,3.39,3.89,3.83,3.55,3.42,3.71,3.45,3.73,3.69,3.81,4.3,4.33,4.04,3.79,3.94,4.08,4.23,4.1,3.8,4.12,4,4.67],
        warP: [29.3,23.6,21.7,19.9,18.5,18,17.9,17.4,16.7,16.6,16.4,16.4,16.2,16,15.9,15,14.1,14,11.8,11.6,11,10.9,10.5,10.3,10.1,9.8,8,6.6,4.4,1.6],			
		
    };

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function InitViewModel() {
        this.season = ko.observable();
    }

    function updateTeams(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && (updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0)) || inputs.season !== vm.season()) {
            return team.filter({
                seasonAttrs: ["won", "lost"],
                stats: ["fga", "blk", "pts", "stl", "tp", "trb","drb",  "ftp", "errors", "warH", "fta", "fgAtRim", "fgaAtRim", "fgLowPost", "pf", "fgaMidRange", "warP"],
                season: inputs.season
            }).then(function (teams) {
                var statsAll;

                statsAll = _.reduce(teams, function (memo, team) {
                    var stat;
                    for (stat in team) {
                        if (team.hasOwnProperty(stat)) {
                            if (memo.hasOwnProperty(stat)) {
                                memo[stat].push(team[stat]);
                            } else {
                                memo[stat] = [team[stat]];
                            }
                        }
                    }
                    return memo;
                }, {});

                return {
                    season: inputs.season,
                    statsAll: statsAll
                };
            });
        }
    }

    function uiFirst(vm) {
        var stat, tbody;

        ko.computed(function () {
            ui.title("Team Stat Distributions - " + vm.season());
        }).extend({throttle: 1});

        tbody = $("#team-stat-dists tbody");

        for (stat in vm.statsAll) {
            if (vm.statsAll.hasOwnProperty(stat)) {
			    if (stat == 'blk') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> hr </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'fga') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> ab </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'stl') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> rbi </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'pts') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> r </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'tp') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> stl </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'trb') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> ave </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'drb') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> obp </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'ftp') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> slg </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'errors') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> e% </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'warH') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> warH </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'fta') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> ip </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'fgAtRim') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> so/9 </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'fgaAtRim') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> bb/9 </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'fgLowPost') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> hr/9 </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'pf') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> era </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'fgaMidRange') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> fip </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'warP') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> warP </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">' + stat + '</td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				}
                if (nbaStatsAll.hasOwnProperty(stat)) {
					tbody.append('<tr><td></td><td width="100%"><div id="' + stat + 'BoxPlotNba" style="margin-top: -26px"></div></td></tr>');					
                }
            }
        }

        ko.computed(function () {
            var scale, stat;

            // Scales for the box plots. This is not done dynamically so that the plots will be comparable across seasons.
            scale = {
                won: [0, 162],
                lost: [0, 162],
                fga: [0,6500],
                blk: [0, 250],
                pts: [0, 950],
                stl: [0, 925],
                tp: [0, 200],
                trb: [.225, .315],

                drb: [.25, .40],
                ftp: [.30, .550],
                errors: [.00, .03],
                warH: [-10, 50],
                fta: [0, 1600],
                fgAtRim: [4, 11],
                fgaAtRim: [1.5, 5.5],
                fgLowPost: [.5, 1.5],
                pf: [2.5, 5.5],
                fgaMidRange: [2, 5],
                warP: [-10, 50],		
		
            };

            for (stat in vm.statsAll) {
                if (vm.statsAll.hasOwnProperty(stat)) {

                    boxPlot.create({
                        data: vm.statsAll[stat](),
                        scale: scale[stat],
                        container: stat + "BoxPlot"
                    });

                    if (nbaStatsAll.hasOwnProperty(stat)) {
                        boxPlot.create({
                            data: nbaStatsAll[stat],
                            scale: scale[stat],
                            container: stat + "BoxPlotNba",
                            color: "#0088cc",
                            labels: false
                        });
                    }
                }
            }
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("team-stat-dists-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "teamStatDists",
        get: get,
        InitViewModel: InitViewModel,
        runBefore: [updateTeams],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});