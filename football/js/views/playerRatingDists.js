/**
 * @name views.playerRatingDists
 * @namespace Player rating distributions.
 */
define(["dao", "globals", "ui", "core/player", "lib/boxPlot", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers"], function (dao, g, ui, player, boxPlot, $, ko, _, components, bbgmView, helpers) {

    "use strict";

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function InitViewModel() {
        this.season = ko.observable();
    }

    function updatePlayers(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && (updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0)) || inputs.season !== vm.season()) {
            return dao.players.getAll({
                statsSeasons: [inputs.season]
            }).then(function (players) {
                var ratingsAll;

                players = player.filter(players, {
                    ratings: ["ovr", "pot", "hgt", "stre", "spd", "jmp", "endu","hnd", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb","cvr","kck"],
                    season: inputs.season,
                    showNoStats: true,
                    showRookies: true,
                    fuzz: true
                });

                ratingsAll = _.reduce(players, function (memo, player) {
                    var rating;
                    for (rating in player.ratings) {
                        if (player.ratings.hasOwnProperty(rating)) {
                            if (memo.hasOwnProperty(rating)) {
                                memo[rating].push(player.ratings[rating]);
                            } else {
                                memo[rating] = [player.ratings[rating]];
                            }
                        }
                    }
                    return memo;
                }, {});

                return {
                    season: inputs.season,
                    ratingsAll: ratingsAll
                };
            });
        }
    }

    function uiFirst(vm) {
        var rating, tbody;

        ko.computed(function () {
            ui.title("Player Rating Distributions - " + vm.season());
        }).extend({throttle: 1});


        tbody = $("#player-rating-dists tbody");

        for (rating in vm.ratingsAll) {
            if (vm.ratingsAll.hasOwnProperty(rating)) {
			
			
			if (rating == 'hgt') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> spd </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'spd') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> end </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'jmp') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> a </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'endu') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> hgt </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'ins') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> giq </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'dnk') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> tgh </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'ft') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> awr </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'fg') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> agg </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'tp') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> mtr </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'blk') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> pss </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'stl') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> rec </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'drb') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> blk </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'pss') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> dru </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else if (rating == 'reb') {
				tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> tck </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			} else {
                tbody.append('<tr><td style="text-align: right; padding-right: 1em;">' + rating + '</td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			}
			/*	if (rating == 'hgt') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> spd </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'spd') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> end </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'jmp') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> a </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'endu') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> hgt </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'ins') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> giq </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'dnk') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> tgh </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'ft') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> awr </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'fg') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> agg </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'tp') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> mtr </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'blk') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> pss </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'stl') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> rec </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'drb') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> blk </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'pss') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> dru </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else if (rating == 'reb') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;"> tck </td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
				} else { */
				//	tbody.append('<tr><td style="text-align: right; padding-right: 1em;">' + rating + '</td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
//////////////////////                tbody.append('<tr><td style="text-align: right; padding-right: 1em;">' + rating + '</td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
	
				//}
			
                //tbody.append('<tr><td style="text-align: right; padding-right: 1em;">' + rating + '</td><td width="100%"><div id="' + rating + 'BoxPlot"></div></td></tr>');
			
            }
        }

        ko.computed(function () {
            var rating;

            for (rating in vm.ratingsAll) {
                if (vm.ratingsAll.hasOwnProperty(rating)) {
                    boxPlot.create({
                        data: vm.ratingsAll[rating](),
                        scale: [0, 100],
                        container: rating + "BoxPlot"
                    });
                }
            }
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("player-rating-dists-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "playerRatingDists",
        get: get,
        InitViewModel: InitViewModel,
        runBefore: [updatePlayers],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});