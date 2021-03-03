/**
 * @name views.playerStats
 * @namespace Player stats table.
 */
define(["dao", "globals", "ui", "core/player", "lib/jquery", "lib/knockout", "views/components", "util/bbgmView", "util/helpers"], function (dao, g, ui, player, $, ko, components, bbgmView, helpers) {

    "use strict";

    var mapping;

    function get(req) {
        var abbrev;

        if (g.teamAbbrevsCache.indexOf(req.params.abbrev) >= 0) {
            abbrev = req.params.abbrev;
        } else {
            abbrev = "all";
        }

        return {
            abbrev: abbrev,
            season: req.params.season === "career" ? null : helpers.validateSeason(req.params.season),
            statType: req.params.statType !== undefined ? req.params.statType : "per_game",
            playoffs: req.params.playoffs !== undefined ? req.params.playoffs : "regular_season"
        };
    }

    function InitViewModel() {
        this.abbrev = ko.observable();
        this.season = ko.observable();
        this.statType = ko.observable();
        this.playoffs = ko.observable();
    }

    mapping = {
        players: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updatePlayers(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && (updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0)) || inputs.abbrev !== vm.abbrev() || inputs.season !== vm.season() || inputs.statType !== vm.statType() || inputs.playoffs !== vm.playoffs()) {
            return dao.players.getAll({
                index: "tid",
                key: IDBKeyRange.lowerBound(g.PLAYER.RETIRED),
                statsSeasons: inputs.season !== null ? [inputs.season] : "all", // If no season is input, get all stats for career totals
                statsPlayoffs: inputs.playoffs === "playoffs"
            }).then(function (players) {
                var i, gp, tid;

                tid = g.teamAbbrevsCache.indexOf(inputs.abbrev);
                if (tid < 0) { tid = null; } // Show all teams

                players = player.filter(players, {
                    attrs: ["pid", "name", "pos", "age", "injury", "tid", "hof", "watch"],
                    ratings: ["skills"],
                    stats: ["abbrev", "tid", "gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "per", "ewa","plusminus","mfg","fgs","hits","ppmin","shmin","fow","fol","sfga","sfg","sfgs","sfgsp","pmin","fop"],
                    season: inputs.season, // If null, then show career stats!
                    tid: tid,
                    totals: inputs.statType === "totals",
                    per36: inputs.statType === "per_36",
                    playoffs: inputs.playoffs === "playoffs"
                });

                // Find max gp to use for filtering
                gp = 0;
                for (i = 0; i < players.length; i++) {
                    if (players[i].stats.gp > gp) {
                        gp = players[i].stats.gp;
                    }
                }
                // Special case for career totals - use 82 games, unless this is the first season
                if (!inputs.season) {
                    if (g.season > g.startingSeason) {
                        gp = 82;
                    }
                }

                 // Only keep players with more than 5 mpg
                players = players.filter(function (p) {
                    var min;

                    // Minutes played
                    if (inputs.statType === "totals") {
                        if (inputs.season) {
                            min = p.stats.min;
                        } else {
                            min = p.careerStats.min;
                        }
                    } else {
                        if (inputs.season) {
                            min = p.stats.gp * p.stats.min;
                        } else {
                            min = p.careerStats.gp * p.careerStats.min;
                        }
                    }

                    if (min > gp * 5) {
                        return true;
                    }
                 });

                return {
                    players: players,
                    abbrev: inputs.abbrev,
                    season: inputs.season,
                    statType: inputs.statType,
                    playoffs: inputs.playoffs
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            var label;

            label = vm.season() !== null ? vm.season() : "Career Totals";
            ui.title("Player Stats - " + label);
        }).extend({throttle: 1});

        ko.computed(function () {
            var abbrev, d, i, p, players, rows, season, tid;

            season = vm.season();

            // Number of decimals for many stats
            if (vm.statType() === "totals") {
                d = 0;
            } else {
                d = 1;
            }

            rows = [];
            players = vm.players();
            for (i = 0; i < vm.players().length; i++) {
                p = players[i];

                // HACKS to show right stats, info
                if (season === null) {
                    p.stats = p.careerStats;
                    abbrev = helpers.getAbbrev(p.tid);
                    tid = p.tid;
                    if (vm.playoffs() === "playoffs") {
                        p.stats = p.careerStatsPlayoffs;
                    }
                } else {
                    abbrev = p.stats.abbrev;
                    tid = p.stats.tid;
                    if (vm.playoffs() === "playoffs") {
                        p.stats = p.statsPlayoffs;
                    }
                }

                // Skip no stats: never played, didn't make playoffs, etc
                if (p.stats.gp) {
				//, helpers.round(p.stats.pts, 1), helpers.round(p.stats.fg, 1), helpers.round(p.stats.ast, 1), helpers.round(p.stats.fga, 1), helpers.round(p.stats.mfg, 1), helpers.round(p.stats.fgs, 1), helpers.round(p.stats.stl, 1), helpers.round(p.stats.tov, 1), helpers.round(p.stats.min, 1), helpers.round(p.stats.ppmin, 1), helpers.round(p.stats.shmin, 1), helpers.round(p.stats.fow, 1), helpers.round(p.stats.fol, 1), helpers.round(p.stats.sfga, 1), helpers.round(p.stats.sfg, 1), helpers.round(p.stats.sfgs, 1), helpers.round(p.stats.sfgsp, 1), helpers.round(p.stats.hits, 1), helpers.round(p.stats.blk, 1), 
                    rows.push([helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, '<a href="' + helpers.leagueUrl(["roster", abbrev, season]) + '">' + abbrev + '</a>', String(p.stats.gp), String(p.stats.gs), helpers.round(p.stats.min, d), helpers.round(p.stats.pts, 0), helpers.round(p.stats.fg, 0), helpers.round(p.stats.ast, 0), helpers.round(p.stats.plusminus, 0), helpers.round(p.stats.fga, 0), helpers.round(p.stats.mfg, 0), helpers.round(p.stats.fgs, 0), helpers.round(p.stats.stl, 0), helpers.round(p.stats.tov, 0), helpers.round(p.stats.pmin, 1), helpers.round(p.stats.ppmin, 1), helpers.round(p.stats.shmin, 1), helpers.round(p.stats.fow, 0), helpers.round(p.stats.fol, 0), helpers.round(p.stats.fop, 1), helpers.round(p.stats.sfga, 0), helpers.round(p.stats.sfg, 1), helpers.round(p.stats.sfgs, 0), helpers.round(p.stats.sfgsp, 1), helpers.round(p.stats.blk, 0), helpers.round(p.stats.hits, 0),  p.hof, tid === g.userTid]);
 //                   rows.push([helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, '<a href="' + helpers.leagueUrl(["roster", abbrev, season]) + '">' + abbrev + '</a>', String(p.stats.gp), String(p.stats.gs), helpers.round(p.stats.min, d), helpers.round(p.stats.pts, 0), helpers.round(p.stats.fg, 0), helpers.round(p.stats.ast, 0), string(p.stats.plusminus), helpers.round(p.stats.fga, 0), helpers.round(p.stats.mfg, 0), helpers.round(p.stats.fgs, 0), helpers.round(p.stats.stl, 0), helpers.round(p.stats.tov, 0), helpers.round(p.stats.pmin, 1), helpers.round(p.stats.ppmin, 1), helpers.round(p.stats.shmin, 1), helpers.round(p.stats.fow, 0), helpers.round(p.stats.fol, 0), helpers.round(p.stats.sfga, 0), helpers.round(p.stats.sfg, 1), helpers.round(p.stats.sfgs, 0), helpers.round(p.stats.sfgsp, 1), helpers.round(p.stats.hits, 0), helpers.round(p.stats.blk, 0),  p.hof, tid === g.userTid]);
                }
            }

            ui.datatable($("#player-stats"), 2, rows, {
                rowCallback: function (row, data) {
                    // Highlight HOF players
                    if (data[data.length - 2]) {
                        row.classList.add("danger");
                    }
                    // Highlight user's team
                    if (data[data.length - 1]) {
                        row.classList.add("info");
                    }
                }
            });
        }).extend({throttle: 1});

        ui.tableClickableRows($("#player-stats"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("player-stats-dropdown", ["teamsAndAll", "seasonsAndCareer", "statTypes", "playoffs"], [vm.abbrev(), vm.season(), vm.statType(), vm.playoffs()], updateEvents);
    }

    return bbgmView.init({
        id: "playerStats",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updatePlayers],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});