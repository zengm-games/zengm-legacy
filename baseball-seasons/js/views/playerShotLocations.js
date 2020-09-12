/**
 * @name views.playerShotLocations
 * @namespace Player shot locations table.
 */
define(["dao","globals", "ui", "core/player", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (dao,g, ui, player, $, ko, _, components, bbgmView, helpers, viewHelpers) {
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
        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && (updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0)) || inputs.season !== vm.season()) {
            return dao.players.getAll({
                index: "tid",
                key: IDBKeyRange.lowerBound(g.PLAYER.RETIRED),
                statsSeasons: [inputs.season]
            }).then(function (players) {
                players = player.filter(players, {
                    attrs: ["pid", "name", "pos", "age", "injury", "watch"],
                    ratings: ["skills"],
                    stats: ["abbrev", "gp", "gs", "min", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp","fta","warP","fbp","gbp","babipP","pf","drb","winP","lossP","save"],
                    season: inputs.season
                });
				
				
				// not working

			    players.sort(function (a, b) { return b.stats.fta - a.stats.fta; });  // order by innings pitched
/*                ip = 0;
                for (i = 0; i < players.length; i++) {
//                    if (playersAll[i].stats.gp > gp) {
//                    if (players[i].stats.fta >= ip) {
                    if (players[i].stats.fta >= 0) {
                        ip = players[i].stats.fta;
                    }
                }*/
                // Special case for career totals - use 82 games, unless this is the first season
         /*       if (!inputs.season) {
                    if (g.season > g.startingSeason) {
                        gp = 162;
                    }
                }*/
                playersind = [];
                for (i = 0; i < players.length; i++) {
				    if ( players[i].stats.fta > 0 ) {
                        playersind.push(players[i]);
					}
                    //}
                }				
	
	
	
                return {
                    season: inputs.season,
                    players: players
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("Player Shot Locations - " + vm.season());
        }).extend({throttle: 1});

        ko.computed(function () {
            var season;
            season = vm.season();

		//	    if (players[i].stats.fta > 0 ) {
			
            ui.datatable($("#player-shot-locations"), 0, _.map(vm.players(), function (p) {
			// determines data loaded into pitching stats fields
			//    if (p.stats.fta > 0 ) {
					return [helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, '<a href="' + helpers.leagueUrl(["roster", p.stats.abbrev, season]) + '">' + p.stats.abbrev + '</a>',  helpers.round(p.stats.winP, 0),  helpers.round(p.stats.lossP, 0),  helpers.round(p.stats.save, 0), helpers.round(p.stats.fta, 2), helpers.round(p.stats.fgAtRim, 2), helpers.round(p.stats.fgaAtRim, 2), helpers.round(p.stats.fgLowPost, 2), helpers.round(p.stats.babipP, 3), helpers.round(p.stats.gbp, 2),helpers.round(p.stats.fbp, 2), helpers.round(p.stats.pf, 2), helpers.round(p.stats.fgaMidRange, 2), helpers.round(p.stats.warP, 2)];				
		//		} else {
		//			return;
		//		}
            }));
			
		//		} else {
		//			return;
		//		}
            			
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