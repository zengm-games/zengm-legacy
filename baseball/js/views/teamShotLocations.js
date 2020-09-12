/**
 * @name views.teamShotLocations
 * @namespace Team shot locations table.
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
                stats: ["gp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp","pf","fta","babipP","gbp","fbp","ld","fb","gb","abP","drb","warP","save"],
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
            ui.title("Team Shot Locations - " + vm.season());
        }).extend({throttle: 1});

        ko.computed(function () {
            var season;
            season = vm.season();
            ui.datatableSinglePage($("#team-shot-locations"), 2, _.map(vm.teams(), function (t) {
                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), helpers.round(t.save, 0), helpers.round(t.fta, 1), helpers.round(t.fgAtRim, 1), helpers.round(t.fgaAtRim, 1), helpers.round(t.fgLowPost, 1), helpers.round(t.babipP, 3), helpers.round(t.gbp, 2), helpers.round(t.fbp, 2), helpers.round(t.pf, 2), helpers.round(t.fgaMidRange, 2), helpers.round(t.warP, 2)];
            }));
        }).extend({throttle: 1});

        ui.tableClickableRows($("#team-shot-locations"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("team-shot-locations-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "teamShotLocations",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updateTeams],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});