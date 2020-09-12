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
                seasonAttrs: ["won", "lost"],
                stats: ["gp", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "oppPts", "diff","ty","ruya","pya","fgAtRim","fgaAtRim","fgpAtRim","inter","ytp","prp","fdt","fdp","fdr","turn"],
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
                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), helpers.round(t.ty, 0), helpers.round(t.prp, 0), helpers.round(t.ytp, 1), helpers.round(t.fdt, 0), helpers.round(t.turn, 1), helpers.round(t.fg, 0), helpers.round(t.fga, 0), helpers.round(t.fgp, 1), helpers.round(t.stl, 0), helpers.round(t.pya, 1), helpers.round(t.blk, 1), helpers.round(t.inter, 1), helpers.round(t.fdp, 0), helpers.round(t.tov, 0), helpers.round(t.drb, 0), helpers.round(t.ruya, 1), helpers.round(t.fdr, 0), helpers.round(t.fgAtRim, 1), helpers.round(t.fgaAtRim, 1), helpers.round(t.fgpAtRim, 1), helpers.round(t.pts, 1), helpers.round(t.oppPts, 1), helpers.round(t.diff, 1)];
            }), {
                rowCallback: function (row, data) {
                    // Show point differential in green or red for positive or negative
                    if (data[data.length - 1] > 0) {
                        row.childNodes[row.childNodes.length - 1].classList.add("text-success");
                    } else if (data[data.length - 1] < 0) {
                        row.childNodes[row.childNodes.length - 1].classList.add("text-danger");
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