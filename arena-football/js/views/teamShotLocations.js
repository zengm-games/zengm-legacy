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
        var deferred, seasonAttributes;

        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && (updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0)) || inputs.season !== vm.season()) {
            deferred = $.Deferred();

            team.filter({
                attrs: ["abbrev"],
                seasonAttrs: ["won", "lost"],
                stats: ["gp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp", "pts", "oppPts", "diff","oppty","opptp","oppyp","oppfd","turnopp","intery","oppfdp","oppfdr","der","dery","oppruya","opptdp","opppaya","depy","opppasa","opppasc","dep","depc","opppp"],
                season: inputs.season
            }, function (teams) {
                deferred.resolve({
                    season: inputs.season,
                    teams: teams
                });
            });
            return deferred.promise();
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
//                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), helpers.round(t.fgAtRim, 1), helpers.round(t.fgaAtRim, 1), helpers.round(t.fgpAtRim, 1), helpers.round(t.fgLowPost, 1), helpers.round(t.fgaLowPost, 1), helpers.round(t.fgpLowPost, 1), helpers.round(t.fgMidRange, 1), helpers.round(t.fgaMidRange, 1), helpers.round(t.fgpMidRange, 1), helpers.round(t.tp, 1), helpers.round(t.tpa, 1), helpers.round(t.tpp, 1)];
                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), helpers.round(t.oppty, 0), helpers.round(t.opptp, 0), helpers.round(t.oppyp, 1), helpers.round(t.oppfd, 1), helpers.round(t.turnopp, 1), helpers.round(t.depc, 0), helpers.round(t.dep, 0), helpers.round(t.opppp, 1), helpers.round(t.depy, 0), helpers.round(t.opppaya, 1), helpers.round(t.opptdp, 0), helpers.round(t.intery, 0), helpers.round(t.oppfdp, 0), helpers.round(t.der, 0), helpers.round(t.dery, 0), helpers.round(t.oppruya, 1), helpers.round(t.oppfdr, 0), helpers.round(t.pts, 1), helpers.round(t.oppPts, 1), helpers.round(t.diff, 1)];

			}), {
                fnRowCallback: function (nRow, aData) {
                    // Show point differential in green or red for positive or negative
                    if (aData[aData.length - 1] > 0) {
                        nRow.childNodes[nRow.childNodes.length - 1].classList.add("text-success");
                    } else if (aData[aData.length - 1] < 0) {
                        nRow.childNodes[nRow.childNodes.length - 1].classList.add("text-danger");
                    }
                }
            });
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