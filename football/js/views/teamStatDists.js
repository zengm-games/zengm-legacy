/**
 * @name views.teamStatDists
 * @namespace Team stat distributions.
 */
define(["globals", "ui", "core/team", "lib/boxPlot", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (g, ui, team, boxPlot, $, ko, _, components, bbgmView, helpers, viewHelpers) {
    "use strict";

    var nbaStatsAll;

    nbaStatsAll = {
        won: [2,2,4,4,4,5,5,6,6,6,7,7,7,7,7,7,8,8,9,10,10,10,10,10,11,11,11,11,12,12,13,13],
        lost: [3,4,4,6,5,6,8,9,9,10,10,10,11,12,14,14,3,4,5,6,5,6,6,7,8,8,9,9,9,11,12,12],
        ty: [263,369,347,353,343,361,311,333,314,375,398,409,359,372,362,299,319,312,337,428,411,355,299,344,354,333,297,362,351,329,364,313,383],
        stl: [188,282,231,234,204,230,187,224,215,296,283,308,253,239,258,214,170,199,172,291,312,239,181,255,237,237,206,206,189,222,249,208,214],
        drb: [75,87,116,119,139,131,123,109,100,79,115,101,106,133,104,86,150,113,165,137,99,116,119,89,117,96,91,156,161,107,115,105,169],
        pya: [4.5,7,6.2,6.3,6,7,5.7,6.1,5.7,6.8,7.4,6.4,6.6,6.6,6.2,5.4,5.3,5.9,5.3,7,7.2,6.8,5.4,6.2,5.7,6.2,5.7,6.9,6.9,6,6.7,5.7,7.2],
        ruya: [3.4,3.7,4.3,4.3,5,4.5,4.2,4.1,4,3.6,3.8,4.1,3.9,4.2,3.8,3.8,4.8,4.1,5.4,4.2,4.3,4.6,3.8,3.8,4.5,3.7,3.6,5.1,4.8,4.2,4.4,4.5,5.2],
        inter: [1.31,0.88,0.91,0.69,1.06,0.75,1,1,1.13,1.19,0.69,1.06,0.5,0.81,1.13,1.06,1.25,0.81,0.75,0.56,1.19,0.94,1.19,1,0.94,0.88,0.94,0.5,0.63,0.88,1.06,1,0.5],
        turn: [2.13,1.13,1.56,1,2.13,1.38,1.5,1.63,1.63,1.81,1.56,2.06,1,1.06,1.69,1.63,2.31,1.63,1.44,1,1.5,1.31,2.31,1.63,2.31,1.88,1.63,1,1.13,1.38,1.44,1.75,0.88],
        pts: [16,26,23,25,22,22,23,24,19,24,30,23,27,26,22,16,13,18,24,35,29,27,18,18,18,21,22,25,26,19,24,21,27],
        oppPts: [16,26,23,25,22,22,23,24,19,24,30,23,27,26,22,16,13,18,24,35,29,27,18,18,18,21,22,25,26,19,24,21,27]
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
//                stats: ["fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "oppPts","ty","stl","inter","turn"],
                stats: ["pts", "oppPts","ty","stl","pya","inter","drb","ruya","turn"],
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
			    if (stat == 'stl') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> py </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
			    } else if (stat == 'drb') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> ry </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');			    
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
                won: [0, 16],
                lost: [0, 16],
                ty: [150, 550],
                stl: [0, 500],
                drb: [0, 200],
                pya: [0, 15],
                ruya: [0, 15],
                inter: [0, 2],
                turn: [0, 3],
                pts: [0, 50],
                oppPts: [0, 50]
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