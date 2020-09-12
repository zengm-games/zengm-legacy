/**
 * @name views.playoffs
 * @namespace Show current or archived playoffs, or projected matchups for an in-progress season.
 */
define(["globals", "ui", "core/season", "core/team", "lib/jquery", "lib/knockout", "util/bbgmView", "util/helpers", "util/viewHelpers", "views/components"], function (g, ui, season, team, $, ko, bbgmView, helpers, viewHelpers, components) {
    "use strict";

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function updatePlayoffs(inputs, updateEvents, vm) {
        var deferred;

        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || inputs.season !== vm.season() || (inputs.season === g.season && updateEvents.indexOf("gameSim") >= 0)) {
            deferred = $.Deferred();

            if (inputs.season === g.season && g.phase < g.PHASE.PLAYOFFS) {
                // In the current season, before playoffs start, display projected matchups
                team.filter({
                    attrs: ["tid", "cid", "abbrev", "name","did"],
                    seasonAttrs: ["winp","-lost","won"],
                    season: inputs.season,
                    sortBy: ["winp", "-lost", "won"]
                }, function (teams) {
                    var cid, i, j, keys, series, teamsConf;

					
					var divTeamRank;
					var divCurrentRank;
					var j,k;
					divTeamRank = [];
					
					
				   for (j = 0; j < g.divs.length; j++) {
						divCurrentRank = 0;
						for (k = 0; k < teams.length; k++) {
							if (g.divs[j].did === teams[k].did) {
							   divCurrentRank += 1;
									divTeamRank[k] = divCurrentRank;
							}
						}
					}				
					
										
					
                    series = [[], [], [], []];  // First round, second round, third round, fourth round
                    for (cid = 0; cid < 2; cid++) {
                        teamsConf = [];
            /*            for (i = 0; i < teams.length; i++) {
                            if (teams[i].cid === cid) {
                                teamsConf.push(teams[i]);
                            }
                        }*/
						  for (i = 0; i < teams.length; i++) {
						//	  console.log(i);						  
						//	  console.log(teams[i].cid);						  
						//	  console.log(cid);						  
								if (teams[i].cid === cid) {
								    console.log(teamsConf.length)
								    console.log(divTeamRank[i])
									
									if ( (teamsConf.length < 2)  && (divTeamRank[i] < 2) ){
										teamsConf.push(teams[i]);
									}
								}
							}
							for (i = 0; i < teams.length; i++) {
						//	  console.log(i);						  
						//	  console.log(teams[i].cid);						  
						//	  console.log(cid);						  
								if (teams[i].cid === cid) {
								    console.log(teamsConf.length)
								    console.log(divTeamRank[i])
									if ( (teamsConf.length < 4)  && (divTeamRank[i] > 1) ){
										teamsConf.push(teams[i]);									
									}
								}
							}				
   				   //  console.log( teamsConf[0]);
   				  //   console.log( teamsConf[1]);					 
   				   //  console.log( teamsConf[2]);					 
   				   //  console.log( teamsConf[3]);					 
					 
                     series[0][ 0 + cid*2 ] = {home: teamsConf[0], away: teamsConf[3]};
                     series[1][ 0 + cid*2 ] = {home: teamsConf[0], away: teamsConf[3]};
                        series[1][0 + cid*2 ].home.seed = 1;
                        series[1][0 + cid*2 ].away.seed = 4;	
						
                       series[1][1+cid * 2] = {home: teamsConf[1],away: teamsConf[2] };
                        series[1][1+cid * 2].home.seed = 2;						
                        series[1][1+ cid*2 ].away.seed = 3;	
						
                     /*  series[1][cid * 2] = {home: teamsConf[0],away: teamsConf[0] };
                        series[1][cid * 2].home.seed = 1;
                        series[1][1 + cid * 2] = {home: teamsConf[1], away: teamsConf[1]};
                        series[1][1 + cid * 2].home.seed = 2;*/
						
                    }

                    deferred.resolve({
                        finalMatchups: false,
                        series: series,
                        season: inputs.season
                    });
                });
            } else {
                // Display the current or archived playoffs
                g.dbl.transaction("playoffSeries").objectStore("playoffSeries").get(inputs.season).onsuccess = function (event) {
                    var i, j, playoffSeries, series;

                    playoffSeries = event.target.result;
                    series = playoffSeries.series;

                    deferred.resolve({
                        finalMatchups: true,
                        series: series,
                        season: inputs.season
                    });
                };
            }

            return deferred.promise();
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("Playoffs - " + vm.season());
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("playoffs-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "playoffs",
        get: get,
        runBefore: [updatePlayoffs],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});