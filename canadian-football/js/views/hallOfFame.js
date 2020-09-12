/**
 * @name views.hallOfFame
 * @namespace Hall of fame table.
 */
define(["globals", "ui", "core/player", "lib/jquery", "lib/knockout", "lib/underscore", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (g, ui, player, $, ko, _, bbgmView, helpers, viewHelpers) {
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
        var deferred, playersAll;

        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || (updateEvents.indexOf("newPhase") >= 0 && g.phase === g.PHASE.BEFORE_DRAFT)) {
            deferred = $.Deferred();

            playersAll = [];

            g.dbl.transaction("players").objectStore("players").index("tid").openCursor(g.PLAYER.RETIRED).onsuccess = function (event) {
                var cursor, i, j, p, players;

                cursor = event.target.result;
                if (cursor) {
                    p = cursor.value;
                    if (p.hof) {
                        playersAll.push(p);
                    }
                    cursor.continue();
                } else {
                    players = player.filter(playersAll, {
                        attrs: ["pid", "name", "pos", "draft", "retiredYear", "statsTids"],
                        ratings: ["ovr"],
                        stats: ["season", "abbrev", "gp", "min", "trb", "ast", "pts", "per", "ewa","qbr","ruya","orb","olr","fgaMidRange","drb"]
                    });

                    // This stuff isn't in player.filter because it's only used here.
                    for (i = 0; i < players.length; i++) {
                        players[i].peakOvr = 0;
                        for (j = 0; j < players[i].ratings.length; j++) {
                            if (players[i].ratings[j].ovr > players[i].peakOvr) {
                                players[i].peakOvr = players[i].ratings[j].ovr;
                            }
                        }

                        players[i].bestStats = {
                            gp: 0,
                            min: 0,
							qbr: 0,							
							ruya: 0,
							orb: 0,
							drb: 0,
							olr: 0,
                            fgaMidRange: 0
                        };
                        for (j = 0; j < players[i].stats.length; j++) {
//                            if (players[i].stats[j].gp * players[i].stats[j].qbr * players[i].stats[j].per > players[i].bestStats.gp * players[i].bestStats.min * players[i].bestStats.per) {
							
							if (players[i].pos == "QB") {
								if (players[i].stats[j].gp * players[i].stats[j].qbr  > players[i].bestStats.gp * players[i].bestStats.qbr) {
									players[i].bestStats = players[i].stats[j];
								}
							}
							if (players[i].pos == "RB") {
								if (players[i].stats[j].drb  >  players[i].bestStats.drb) {
									players[i].bestStats = players[i].stats[j];
								}
							}
							if ((players[i].pos == "TE") || (players[i].pos == "WR")) {
								if (players[i].stats[j].orb  >  players[i].bestStats.orb) {
									players[i].bestStats = players[i].stats[j];
								}
							}							
							if ((players[i].pos == "DL") || (players[i].pos == "LB")) {
								if (players[i].stats[j].fgaMidRange  >  players[i].bestStats.fgaMidRange) {
									players[i].bestStats = players[i].stats[j];
								}
							}							
							if ((players[i].pos == "OL")) {
								if (players[i].stats[j].olr  >  players[i].bestStats.olr) {
									players[i].bestStats = players[i].stats[j];
								}
							}							
							
                        }
                    }

                    deferred.resolve({
                        players: players
                    });
                }
            };
            return deferred.promise();
        }
    }

    function uiFirst(vm) {
        ui.title("Hall of Fame");

        ko.computed(function () {
            ui.datatable($("#hall-of-fame"), 2, _.map(vm.players(), function (p) {
                return ['<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>', p.pos, String(p.draft.year), String(p.retiredYear), String(p.peakOvr), String(p.bestStats.season),  '<a href="' + helpers.leagueUrl(["roster", p.bestStats.abbrev, p.bestStats.season]) + '">' + p.bestStats.abbrev + '</a>', String(p.bestStats.gp), helpers.round(p.bestStats.qbr, 1), helpers.round(p.bestStats.drb, 0), helpers.round(p.bestStats.orb, 0), helpers.round(p.bestStats.olr, 0), helpers.round(p.bestStats.fgaMidRange, 0), String(p.careerStats.gp), helpers.round(p.careerStats.qbr, 1), helpers.round(p.careerStats.drb, 0), helpers.round(p.careerStats.orb, 0), helpers.round(p.careerStats.olr, 0), helpers.round(p.careerStats.fgaMidRange, 0), p.statsTids.indexOf(g.userTid) >= 0];
//                return ['<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>', p.pos, String(p.draft.year), String(p.retiredYear), String(p.peakOvr), String(p.bestStats.season),  '<a href="' + helpers.leagueUrl(["roster", p.bestStats.abbrev, p.bestStats.season]) + '">' + p.bestStats.abbrev + '</a>', String(p.bestStats.gp), helpers.round(p.bestStats.qbr, 1), helpers.round(p.bestStats.ruya, 1), helpers.round(p.bestStats.orb, 0), helpers.round(p.bestStats.olr, 0), helpers.round(p.bestStats.fgaMidRange, 0), String(p.careerStats.gp), helpers.round(p.careerStats.qbr, 1), helpers.round(p.careerStats.ruya, 1), helpers.round(p.careerStats.orb, 1), helpers.round(p.careerStats.olr, 0), helpers.round(p.careerStats.fgaMidRange, 0), helpers.round(p.careerStats.ewa, 1), p.statsTids.indexOf(g.userTid) >= 0];
            }), {
                fnRowCallback: function (nRow, aData) {
                    // Highlight players from the user's team
                    if (aData[aData.length - 1]) {
                        nRow.classList.add("info");
                    }
                }
            });
        }).extend({throttle: 1});

        ui.tableClickableRows($("#hall-of-fame"));
    }

    return bbgmView.init({
        id: "hallOfFame",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updatePlayers],
        uiFirst: uiFirst
    });
});