/**
 * @name views.hallOfFame
 * @namespace Hall of fame table.
 */
define(["dao", "globals", "ui", "core/player", "lib/jquery", "lib/knockout", "lib/underscore", "util/bbgmView", "util/helpers"], function (dao, g, ui, player, $, ko, _, bbgmView, helpers) {

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
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || (updateEvents.indexOf("newPhase") >= 0 && g.phase === g.PHASE.BEFORE_DRAFT)) {
            return dao.players.getAll({
                index: "tid",
                key: g.PLAYER.RETIRED,
                statsSeasons: "all",
                filter: function (p) {
                    return p.hof;
                }
            }).then(function (players) {
                var i, j;
				players = player.filter(players, {
					attrs: ["pid", "name", "pos", "draft", "retiredYear", "statsTids","awards","numberAwardsNoChamp"],
					ratings: ["ovr"],
					stats: ["season", "abbrev", "gp", "min", "trb", "ast", "pts", "per", "ewa","qbr","ruya","orb","olr","fgaMidRange","drb","intery"]
				});

				// This stuff isn't in player.filter because it's only used here.
				for (i = 0; i < players.length; i++) {
					players[i].peakOvr = 0;
					for (j = 0; j < players[i].ratings.length; j++) {
						if (players[i].ratings[j].ovr > players[i].peakOvr) {
							players[i].peakOvr = players[i].ratings[j].ovr;
						}
					}
					players[i].awardsNumber = players[i].awards.length;
					console.log(players[i].numberAwardsNoChamp+" "+players[i].awardsNumber);
					console.log(players[i].awards);
					//console.log(p.awards);
					//for (let j = 0; j < p.awards.length; j++) {
//						p.awardsNumber += p.awardsGrouped[j].count;
						//p.awardsNumber += p.awardsGrouped[j].count;
					//}	
					players[i].bestStats = {
						gp: 0,
						min: 0,
						qbr: 0,							
						ruya: 0,
						orb: 0,
						drb: 0,
						olr: 0,						
						intery: 0,							
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
						if ((players[i].pos == "CB")) {
							if (players[i].stats[j].intery  >  players[i].bestStats.intery) {
								players[i].bestStats = players[i].stats[j];
							}
						}		
						if ((players[i].pos == "S")) {
							if (players[i].stats[j].intery  >  players[i].bestStats.intery) {
								players[i].bestStats = players[i].stats[j];
							}
						}								
					}
				}

                return {
                    players: players
                };
            });
        }
    }

    function uiFirst(vm) {
        ui.title("Hall of Fame");

        ko.computed(function () {
            ui.datatable($("#hall-of-fame"), 2, _.map(vm.players(), function (p) {
                return ['<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>', p.pos, String(p.draft.year), String(p.retiredYear), String(p.peakOvr),String(p.awardsNumber), String(p.bestStats.season),  '<a href="' + helpers.leagueUrl(["roster", p.bestStats.abbrev, p.bestStats.season]) + '">' + p.bestStats.abbrev + '</a>', String(p.bestStats.gp), helpers.round(p.bestStats.qbr, 1), helpers.round(p.bestStats.drb, 0), helpers.round(p.bestStats.orb, 0), helpers.round(p.bestStats.olr, 0), helpers.round(p.bestStats.fgaMidRange, 0), helpers.round(p.bestStats.intery, 0), String(p.careerStats.gp), helpers.round(p.careerStats.qbr, 1), helpers.round(p.careerStats.drb, 0), helpers.round(p.careerStats.orb, 0), helpers.round(p.careerStats.olr, 0), helpers.round(p.careerStats.fgaMidRange, 0), helpers.round(p.careerStats.intery, 0), p.statsTids.indexOf(g.userTid) >= 0];
//                return ['<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a>', p.pos, String(p.draft.year), String(p.retiredYear), String(p.peakOvr), String(p.bestStats.season),  '<a href="' + helpers.leagueUrl(["roster", p.bestStats.abbrev, p.bestStats.season]) + '">' + p.bestStats.abbrev + '</a>', String(p.bestStats.gp), helpers.round(p.bestStats.qbr, 1), helpers.round(p.bestStats.ruya, 1), helpers.round(p.bestStats.orb, 0), helpers.round(p.bestStats.olr, 0), helpers.round(p.bestStats.fgaMidRange, 0), String(p.careerStats.gp), helpers.round(p.careerStats.qbr, 1), helpers.round(p.careerStats.ruya, 1), helpers.round(p.careerStats.orb, 1), helpers.round(p.careerStats.olr, 0), helpers.round(p.careerStats.fgaMidRange, 0), helpers.round(p.careerStats.ewa, 1), p.statsTids.indexOf(g.userTid) >= 0];
            }), {
                rowCallback: function (row, data) {
                    // Highlight players from the user's team
                    if (data[data.length - 1]) {
                        row.classList.add("info");
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