/**
 * @name views.playerShotLocations
 * @namespace Player shot locations table.
 */
define(["globals", "ui", "core/player", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (g, ui, player, $, ko, _, components, bbgmView, helpers, viewHelpers) {
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
        players: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updatePlayers(inputs, updateEvents, vm) {
        var deferred;

        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && (updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0)) || inputs.season !== vm.season()) {
            deferred = $.Deferred();

            g.dbl.transaction(["players"]).objectStore("players").getAll().onsuccess = function (event) {
                var players;

                players = player.filter(event.target.result, {
                    attrs: ["pid", "name", "pos", "age", "injury", "watch"],
                    ratings: ["skills"],
                    stats: ["abbrev", "gp", "gs", "min", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp","olr","olp","olrmpa","der","dep","derpatp","olc","dec"],
                    season: inputs.season
                });

                deferred.resolve({
                    season: inputs.season,
                    players: players
                });
            };
            return deferred.promise();
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("Player Shot Locations - " + vm.season());
        }).extend({throttle: 1});

        ko.computed(function () {
            var season;
            season = vm.season();
            ui.datatable($("#player-shot-locations"), 0, _.map(vm.players(), function (p) {
//                return [helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, '<a href="' + helpers.leagueUrl(["roster", p.stats.abbrev, season]) + '">' + p.stats.abbrev + '</a>', String(p.stats.gp), String(p.stats.gs), helpers.round(p.stats.olr, 0), helpers.round(p.stats.olp, 0), helpers.round(p.stats.olrmpa, 2), helpers.round(p.stats.olc, 0), helpers.round(p.stats.fgAtRim, 0), helpers.round(p.stats.fgaAtRim, 0), helpers.round(p.stats.fgpAtRim, 1), helpers.round(p.stats.fgaMidRange, 0), helpers.round(p.stats.der, 0), helpers.round(p.stats.dep, 0), helpers.round(p.stats.derpatp, 2), helpers.round(p.stats.dec, 0), helpers.round(p.stats.tpa, 1), helpers.round(p.stats.tpp, 1)];
                return [helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, '<a href="' + helpers.leagueUrl(["roster", p.stats.abbrev, season]) + '">' + p.stats.abbrev + '</a>', String(p.stats.gp), String(p.stats.gs), helpers.round(p.stats.olr, 0), helpers.round(p.stats.olp, 0), helpers.round(p.stats.olrmpa, 2), helpers.round(p.stats.olc, 0), helpers.round(p.stats.fgAtRim, 0), helpers.round(p.stats.fgaAtRim, 0), helpers.round(p.stats.fgpAtRim, 1), helpers.round(p.stats.fgaMidRange, 0), helpers.round(p.stats.der, 0), helpers.round(p.stats.dep, 0), helpers.round(p.stats.derpatp, 2), helpers.round(p.stats.dec, 0)];
            }));
        }).extend({throttle: 1});

        ui.tableClickableRows($("#player-shot-locations"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("player-shot-locations-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "playerShotLocations",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updatePlayers],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});