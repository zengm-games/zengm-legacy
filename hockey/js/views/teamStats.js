/**
 * @name views.teamStats
 * @namespace Team stats table.
 */
define(["globals", "ui", "core/team", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (g, ui, team, $, ko, _, components, bbgmView, helpers, viewHelpers) {
    "use strict";

    var mapping;

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function InitViewModel() {
        this.season = ko.observable();
    }

    mapping = {
        teams: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updateTeams(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && (updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0)) || inputs.season !== vm.season()) {
            return team.filter({
                attrs: ["abbrev"],
                seasonAttrs: ["won", "lost","points","overtime"],
                stats: ["gp", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "oppPts", "diff","plusminus","mfg","fgs","hits","ppmin","shmin","fow","fol","sfga","sfg","sfgs","sfgsp","min","oppGoals","goals","diffPG","fop"],
                season: inputs.season
            }).then(function (teams) {
                return {
                    season: inputs.season,
                    teams: teams
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("Team Stats - " + vm.season());
        }).extend({throttle: 1});

        ko.computed(function () {
            var season;
            season = vm.season();
            ui.datatableSinglePage($("#team-stats"), 2, _.map(vm.teams(), function (t) {
//                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), String(t.overtime), String(t.points), helpers.round(t.pts, 1), helpers.round(t.fg, 1), helpers.round(t.ast, 1), helpers.round(t.fga, 1), helpers.round(t.mfg, 1), helpers.round(t.fgs, 1), helpers.round(t.stl, 1), helpers.round(t.tov, 1), helpers.round(t.min, 1), helpers.round(t.ppmin, 1), helpers.round(t.shmin, 1), helpers.round(t.fow, 1), helpers.round(t.fol, 1), helpers.round(t.sfga, 1), helpers.round(t.sfg, 1), helpers.round(t.sfgs, 1), helpers.round(t.sfgsp, 1), helpers.round(t.blk, 1), helpers.round(t.hits, 1), helpers.round(t.oppPts, 1), helpers.round(t.diff, 1)];
//                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), String(t.overtime), String(t.points), helpers.round(t.pts, 1), helpers.round(t.fg, 1), helpers.round(t.ast, 1), helpers.round(t.fga, 1), helpers.round(t.mfg, 1), helpers.round(t.fgs, 1), helpers.round(t.stl, 1), helpers.round(t.tov, 1), helpers.round(t.min, 1), helpers.round(t.ppmin, 1), helpers.round(t.shmin, 1), helpers.round(t.fow, 1), helpers.round(t.fol, 1), helpers.round(t.sfga, 1), helpers.round(t.sfg, 1), helpers.round(t.sfgs, 1), helpers.round(t.sfgsp, 1), helpers.round(t.blk, 1), helpers.round(t.hits, 1), helpers.round(t.goals, 0), helpers.round(t.oppGoals, 0), helpers.round(t.diff, 0)];
//                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), String(t.overtime), String(t.points), helpers.round(t.pts, 1), helpers.round(t.fg, 1), helpers.round(t.ast, 1), helpers.round(t.fga, 1), helpers.round(t.mfg, 1), helpers.round(t.fgs, 1), helpers.round(t.stl, 1), helpers.round(t.tov, 1), helpers.round(t.min, 1), helpers.round(t.ppmin, 1), helpers.round(t.shmin, 1), helpers.round(t.fow, 1), helpers.round(t.fol, 1), helpers.round(t.sfga, 1), helpers.round(t.sfg, 1), helpers.round(t.sfgs, 1), helpers.round(t.sfgsp, 1), helpers.round(t.blk, 1), helpers.round(t.hits, 1), helpers.round(t.goals, 0), helpers.round(t.oppGoals, 0), helpers.round(t.diff, 0), helpers.round(t.diffPG, 1)];
                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), String(t.overtime), String(t.points), helpers.round(t.pts, 1), helpers.round(t.fg, 1), helpers.round(t.ast, 1), helpers.round(t.fga, 1), helpers.round(t.mfg, 1), helpers.round(t.fgs, 1), helpers.round(t.stl, 1), helpers.round(t.tov, 1), helpers.round(t.min, 1), helpers.round(t.ppmin, 1), helpers.round(t.shmin, 1), helpers.round(t.fow, 1), helpers.round(t.fol, 1), helpers.round(t.fop, 1), helpers.round(t.sfga, 1), helpers.round(t.sfg, 1), helpers.round(t.sfgs, 1), helpers.round(t.sfgsp, 1), helpers.round(t.blk, 1), helpers.round(t.hits, 1), helpers.round(t.goals, 0), helpers.round(t.oppGoals, 0), String(t.diff),helpers.round(t.diffPG, 1)];
            }), {
                rowCallback: function (row, data) {
                    // Show point differential in green or red for positive or negative
                    if (data[data.length - 1] > 0) {
                        row.childNodes[row.childNodes.length - 1].classList.add("text-success");
                    } else if (data[data.length - 1] < 0) {
                        row.childNodes[row.childNodes.length - 1].classList.add("text-danger");
                    }
                    if (data[data.length - 2] > 0) {
                        row.childNodes[row.childNodes.length - 2].classList.add("text-success");
                    } else if (data[data.length - 2] < 0) {
                        row.childNodes[row.childNodes.length - 2].classList.add("text-danger");
                    }					
                }             		
            });
        }).extend({throttle: 1});

        ui.tableClickableRows($("#team-stats"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("team-stats-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "teamStats",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updateTeams],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});