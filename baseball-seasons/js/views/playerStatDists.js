/**
 * @name views.playerStatDists
 * @namespace Player stat distributions.
 */
define(["dao","globals", "ui", "core/player", "lib/boxPlot", "lib/jquery", "lib/knockout", "lib/underscore", "views/components", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (dao,g, ui, player, boxPlot, $, ko, _, components, bbgmView, helpers, viewHelpers) {
    "use strict";

    var nbaQuartiles;

    nbaQuartiles = {
  //      gp: [1, 25, 52, 74, 82],
  //      min: [0, 11.4857142857, 20.3759398496, 28.6286673736, 41.359375],
	fga:	[503,535.2,584.6,630.6,673.2,726],
	blk:	[2,10,14,20,24,53],
	pts:	[30,59,68,76.4,86.4,126],
	stl:	[31,52,65.2,77,84,138],
	tp:	[0,1,3.6,8,20,52],
	trb:	[0.179,0.249,0.2636,0.2794,0.2962,0.348],
	drb:	[0.259,0.3108,0.329,0.341,0.3604,0.442],
	ftp:	[0.298,0.3906,0.417,0.4468,0.4822,0.636],
	wOBA:	[0.247,0.3108,0.3256,0.3414,0.3632,0.455],
	fta:	[162.1,177.56,189.9,200,211,241.2],
	fgAtRim:	[4.72,6.312,7.17,7.71,8.832,11.89],
	fgaAtRim:	[1.29,2.038,2.33,2.778,3.29,4.55],
	fgLowPost:	[0.5,0.682,0.82,0.956,1.146,1.62],
	babipP:	[0.24,0.2698,0.2868,0.298,0.307,0.333],
	gbp:	[0.321,0.4056,0.4424,0.4618,0.4912,0.58],
	fbp:	[0.06,0.0842,0.095,0.1078,0.1242,0.145],
	pf:	[2.19,3.126,3.406,3.708,4.186,5.71],
	fgaMidRange:	[2.61,3.28,3.47,3.814,4.1,4.79]

  
  
 /*       fg: [0, 1.2676056338, 2.6043478261, 4.2253994954, 10.1052631579],
        fga: [0, 2.976744186, 6, 9.144963145, 21.96875],
        fgp: [0, 39.6551724138, 44.2206477733, 48.7304827389, 100],
        tp: [0, 0, 0.25, 0.9499921863, 3],
        tpa: [0, 0.0545454545, 0.9326923077, 2.7269647696, 7.064516129],
        tpp: [0, 0, 28.5714285714, 35.7142857143, 100],
        ft: [0, 0.5, 1.069047619, 2.0634920635, 9.2195121951],
        fta: [0, 0.7464788732, 1.5282193959, 2.8446447508, 10.243902439],
        ftp: [0, 63.6363636364, 74.184204932, 81.4814814815, 100],
        orb: [0, 0.3333333333, 0.6938888889, 1.3094934014, 4.4285714286],
        drb: [0, 1.2272727273, 2.0930735931, 3.2760889292, 9.7317073171],
        trb: [0, 1.625, 2.8438363737, 4.5811403509, 13.1951219512],
        ast: [0, 0.5438596491, 1.1645833333, 2.3024060646, 11.012345679],
        tov: [0, 0.5769230769, 0.9638501742, 1.5492063492, 3.796875],
        stl: [0, 0.2985074627, 0.5330668605, 0.8278070175, 2.3333333333],
        blk: [0, 0.1111111111, 0.23875, 0.5, 2.7804878049],
        pf: [0, 1.2307692308, 1.828536436, 2.4295634921, 4],
        pts: [0, 3.3333333333, 7.0507246377, 11.2698735321, 30.1463414634]*/
    };

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
                index: "tid",
                key: IDBKeyRange.lowerBound(g.PLAYER.RETIRED),
                statsSeasons: [inputs.season]
            }).then(function (players) {
				var i;

				players = player.filter(players, {
					attrs: ["pid", "name", "pos", "age", "injury"],
					ratings: ["skills"],
	//                    stats: ["gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "per"],
	//                    stats: ["fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "per"],
					stats: ["fga", "blk", "pts", "stl", "tp", "trb", "drb", "ftp", "wOBA", "fta", "fgAtRim", "fgaAtRim", "fgLowPost", "babipP", "gbp", "fbp", "pf", "fgaMidRange"],
					
			
	/*fga:	[0,826],
	blk:	[0,63],
	pts:	[0,146],
	stl:	[0,168],
	tp:	[0,62],
	trb:	[0,0.448],
	drb:	[0,0.542],
	ftp:	[0,0.736],
	wOBA:	[0,0.555],
	fta:	[0,291.2],
	fgAtRim:	[0,13.89],
	fgaAtRim:	[0,6.55],
	fgLowPost:	[0,1.92],
	babipP:	[.133,0.433],
	gbp:	[0.221,0.68],
	fbp:	[0,0.175],
	pf:	[1.19,6.71],
	fgaMidRange:	[1.61,5.79]							*/
					
                    season: inputs.season
                });

                statsAll = _.reduce(players, function (memo, player) {
                    var stat;
                    for (stat in player.stats) {
                        if (player.stats.hasOwnProperty(stat)) {
                            if (memo.hasOwnProperty(stat)) {
                                memo[stat].push(player.stats[stat]);
                            } else {
                                memo[stat] = [player.stats[stat]];
                            }
                        }
                    }
                    return memo;
                }, {});

                return {
                    season: inputs.season,
                    statsAll: statsAll
                };
            });
        }
    }

    function uiFirst(vm) {
        var stat, tbody;

        ko.computed(function () {
            ui.title("Player Stat Distributions - " + vm.season());
        }).extend({throttle: 1});

        tbody = $("#player-stat-dists tbody");

        for (stat in vm.statsAll) {
            if (vm.statsAll.hasOwnProperty(stat)) {
//                tbody.append('<tr><td style="text-align: right; padding-right: 1em;">' + stat + '</td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
                if (stat == 'fga') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  ab </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'blk') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  hr </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'pts') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  r </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'stl') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  rbi </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'tp') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  stl </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'trb') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  ave </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'drb') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  obp </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'ftp') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  slg </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'wOBA') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  wOBA </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'fta') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  ip </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'fgAtRim') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  so/9 </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'fgaAtRim') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  bb/9 </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'fgLowPost') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  hr/9 </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'babipP') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  babipP </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'gbp') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  gb% </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'fbp') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  hr% </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'pf') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  era </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else if (stat == 'fgaMidRange') {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">  fip </td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				} else {
					tbody.append('<tr><td style="text-align: right; padding-right: 1em;">' + stat + '</td><td width="100%"><div id="' + stat + 'BoxPlot"></div></td></tr>');
				
				}
				
/*fga:	[0,826],
	blk:	[0,63],
	pts:	[0,146],
	stl:	[0,168],
	tp:	[0,62],
	trb:	[0,0.448],
	drb:	[0,0.542],
	ftp:	[0,0.736],
	wOBA:	[0,0.555],
	fta:	[0,291.2],
	fgAtRim:	[0,13.89],
	fgaAtRim:	[0,6.55],
	fgLowPost:	[0,1.92],
	babipP:	[.133,0.433],
	gbp:	[0.221,0.68],
	fbp:	[0,0.175],
	pf:	[1.19,6.71],
	fgaMidRange:	[1.61,5.79]					*/
				
				
				
                if (nbaQuartiles.hasOwnProperty(stat)) {
//                    tbody.append('<tr><td></td><td width="100%"><div id="' + stat + 'BoxPlotNba" style="margin-top: -26px"></div></td></tr>');
                    tbody.append('<tr><td></td><td width="100%"><div id="' + stat + 'BoxPlotNba" style="margin-top: -26px"></div></td></tr>');
                }
            }
        }

        ko.computed(function () {
            var scale, stat;

            // Scales for the box plots. This is not done dynamically so that the plots will be comparable across seasons.
            scale = {
    //            gp: [0, 82],
   //             gs: [0, 82],
   //             min: [0, 50],
     /*           fg: [0, 20],
                fga: [0, 40],
                fgp: [0, 100],
                tp: [0, 5],
                tpa: [0, 10],
                tpp: [0, 100],
                ft: [0, 15],
                fta: [0, 25],
                ftp: [0, 100],
                orb: [0, 10],
                drb: [0, 15],
                trb: [0, 25],
                ast: [0, 15],
                tov: [0, 10],
                stl: [0, 5],
                blk: [0, 5],
                pf: [0, 6],
                pts: [0, 50],
                per: [0, 35]*/
				
	fga:	[0,826],
	blk:	[0,63],
	pts:	[0,146],
	stl:	[0,168],
	tp:	[0,62],
	trb:	[0,0.448],
	drb:	[0,0.542],
	ftp:	[0,0.736],
	wOBA:	[0,0.555],
	fta:	[0,291.2],
	fgAtRim:	[0,13.89],
	fgaAtRim:	[0,6.55],
	fgLowPost:	[0,1.92],
	babipP:	[0,0.433],
	gbp:	[0,.68],
	fbp:	[0,.175],
	pf:	[0,6.71],
	fgaMidRange:	[0,5.79]			
				
				
            };

            for (stat in vm.statsAll) {
                if (vm.statsAll.hasOwnProperty(stat)) {
                    boxPlot.create({
                        data: vm.statsAll[stat](),
                        scale: scale[stat],
                        container: stat + "BoxPlot"
                    });

                    if (nbaQuartiles.hasOwnProperty(stat)) {
                        boxPlot.create({
                            quartiles: nbaQuartiles[stat],
                            scale: scale[stat],
                            container: stat + "BoxPlotNba",
                            color: "#0088cc",
                            labels: false
                        });
                    }
                }
            }
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("player-stat-dists-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "playerStatDists",
        get: get,
        InitViewModel: InitViewModel,
        runBefore: [updatePlayers],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});