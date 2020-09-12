/**
 * @name views.teamStats
 * @namespace Team stats table.
 */
define(["globals", "ui", "core/team", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers"], function (g, ui, team, $, ko, _, components, bbgmView, helpers) {
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
                stats: ["min","gp", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "oppPts", "diff","fgLowPost","fgaLowPost","fgMidRange","oppJM","oppTw","oppInh","kda","scTwr","scKills",'grExpTwr','grExpKills','grGldTwr','grGldKills','tmBuffTwr','tmBuffKills','tmBAdjTwr','tmBAdjKills',
				'TPTwr',
				'TPKills',
				'TwTwr',
				'CKKills',
				'CSTwr',
				'CSKills',
				'AgTwr',
				'AgKills',
				'ChmpnTwr',				
				'ChmpnKills'
				],
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

		/*fgaLowPost
		pf*/
        ko.computed(function () {
            var season;
            season = vm.season();
            ui.datatableSinglePage($("#team-stats"), 2, _.map(vm.teams(), function (t) {
                return ['<a href="' + helpers.leagueUrl(["roster", t.abbrev, season]) + '">' + t.abbrev + '</a>', String(t.gp), String(t.won), String(t.lost), helpers.round(t.min, 0), helpers.round(t.fg, 1), helpers.round(t.fga, 1), helpers.round(t.fgp, 1), helpers.round(t.kda, 1),
//				helpers.round(t.scKills, 1), helpers.round(t.grExpKills, 1), helpers.round(t.grGldKills, 1), helpers.round(t.tmBuffKills, 1), helpers.round(t.tmBAdjKills, 1), helpers.round(t.TPKills, 1), helpers.round(t.CKKills, 1), helpers.round(t.AgKills, 1), helpers.round(t.ChmpnKills, 1),
//				helpers.round(t.pf, 1), helpers.round(t.oppTw, 1), helpers.round(t.scTwr, 1), helpers.round(t.grExpTwr, 1), helpers.round(t.grGldTwr, 1), helpers.round(t.tmBuffTwr, 1), helpers.round(t.tmBAdjTwr, 1), helpers.round(t.TPTwr, 1), helpers.round(t.TwTwr, 1), helpers.round(t.AgTwr, 1), helpers.round(t.ChmpnTwr, 1),
				helpers.round(t.scKills, 1), helpers.round(t.TPKills, 1), helpers.round(t.CKKills, 1), helpers.round(t.ChmpnKills, 1),
				helpers.round(t.pf, 1), helpers.round(t.oppTw, 1), helpers.round(t.scTwr, 1), helpers.round(t.TPTwr, 1), helpers.round(t.TwTwr, 1), helpers.round(t.ChmpnTwr, 1), 
				helpers.round(t.fgaLowPost, 1), helpers.round(t.oppInh, 1), helpers.round(t.tp, 1), helpers.round(t.tpa, 1), helpers.round(t.ft, 1), helpers.round(t.fta, 1), helpers.round(t.fgMidRange, 1), helpers.round(t.oppJM, 1), helpers.round(t.drb, 1), helpers.round(t.blk, 1), helpers.round(t.tov, 1), helpers.round(t.ast, 1), helpers.round(t.trb, 1)];
            }), {
                rowCallback: function (row, data) {
                    // Show point differential in green or red for positive or negative
                    if (data[data.length - 1] > 0) {
                    //    row.childNodes[row.childNodes.length - 1].classList.add("text-success");
                    } else if (data[data.length - 1] < 0) {
                     //   row.childNodes[row.childNodes.length - 1].classList.add("text-danger");
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