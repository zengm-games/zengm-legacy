/**
 * @name views.playoffs
 * @namespace Show current or archived playoffs, or projected matchups for an in-progress season.
 */
define(["dao", "globals", "ui", "core/team", "lib/knockout", "util/bbgmView", "util/helpers", "views/components"], function (dao, g, ui, team, ko, bbgmView, helpers, components) {
    "use strict";

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function updatePlayoffs(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || inputs.season !== vm.season() || (inputs.season === g.season && updateEvents.indexOf("gameSim") >= 0)) {
            // If in the current season and before playoffs started, display projected matchups
            if (inputs.season === g.season && g.phase < g.PHASE.PLAYOFFS) {
                return team.filter({
                    attrs: ["tid", "cid","did", "abbrev", "name"],
                    seasonAttrs: ["points","lost"],
                    season: inputs.season,
                    sortBy: ["points", "-lost"]
                }).then(function (teams) {

				
				    if (g.leagueType == 1) {
						var cid, i, series, teamsConf;
						var initialDid,secondTeam,firstTeam;
						
						series = [[], [], [], []];  // First round, second round, third round, fourth round
						for (cid = 0; cid < 2; cid++) {
							initialDid = -1;
							firstTeam = -1;
							secondTeam = -1;						
							teamsConf = [];
							for (i = 0; i < teams.length; i++) {
								if ( (teams[i].cid === cid) && (initialDid != teams[i].did) && (teamsConf.length < 2) ) {
									initialDid = teams[i].did;
									secondTeam = i;
									if (firstTeam < 0) {
										firstTeam = i;									
									}
									teamsConf.push(teams[i]);
								}
							}
							
							for (i = 0; i < teams.length; i++) {
								if ( (teams[i].cid === cid) && (i != firstTeam) && (i != secondTeam) ) {
									teamsConf.push(teams[i]);
								}
							}
							series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
							series[0][cid * 4].home.seed = 1;
							series[0][cid * 4].away.seed = 8;
							series[0][1 + cid * 4] = {home: teamsConf[3], away: teamsConf[4]};
							series[0][1 + cid * 4].home.seed = 4;
							series[0][1 + cid * 4].away.seed = 5;
							series[0][2 + cid * 4] = {home: teamsConf[2], away: teamsConf[5]};
							series[0][2 + cid * 4].home.seed = 3;
							series[0][2 + cid * 4].away.seed = 6;
							series[0][3 + cid * 4] = {home: teamsConf[1], away: teamsConf[6]};
							series[0][3 + cid * 4].home.seed = 2;
							series[0][3 + cid * 4].away.seed = 7;
						}
					} else {
						var cid, did,i, series, teamsConf, tidPlayoffs;
						var div0Seeds;
						var div1Seeds;
						var teamsWC,teamsDiv1,teamsDiv2;
						var divFirst;
						var divSecond;
						var WC;
						var topSeed;
						//// 4 seeds each division WC, top 3 make it, then next best 2 in conference
						tidPlayoffs = [];
						series = [[], [], [], []];  // First round, second round, third round, fourth round
						for (cid = 0; cid < 2; cid++) {
							teamsConf = [];
							teamsDiv1 = [];
							teamsDiv2 = [];
							teamsWC = [];
							divFirst = 0;
							divSecond = 0;
							WC = 0;
							topSeed = 0;
							for (i = 0; i < teams.length; i++) {
								if (teams[i].cid === cid) {
									if (teams[i].did === (cid*2)) {
									
												if (teamsDiv1.length == 0 && teamsDiv2.length == 0) {
													topSeed = 0;
												}
									
												if (teamsDiv1.length < 3) {
													teamsDiv1.push(teams[i]);
													tidPlayoffs.push(teams[i].tid);
													divFirst += 1;										
												} else if (teamsWC.length < 2) {
													teamsWC.push(teams[i]);
													tidPlayoffs.push(teams[i].tid);
													WC += 1;										
												
												}
						
									}			
									if (teams[i].did === (cid*2+1)) {
									
												if (teamsDiv1.length == 0 && teamsDiv2.length == 0) {
													topSeed = 1;
												}						
									
												if (teamsDiv2.length < 3) {
													teamsDiv2.push(teams[i]);
													tidPlayoffs.push(teams[i].tid);
													divSecond += 1;										
												} else if (teamsWC.length < 2) {
													teamsWC.push(teams[i]);
													tidPlayoffs.push(teams[i].tid);
													WC += 1;										
												
												}
												
									}			
									
								}
							}
							

							series[0][cid * 4] = {home: teamsDiv1[0], away: teamsWC[1-topSeed]};
							series[0][cid * 4].home.seed = 1;
							series[0][cid * 4].away.seed = 4;
							series[0][1 + cid * 4] = {home: teamsDiv1[1], away: teamsDiv1[2]};
							series[0][1 + cid * 4].home.seed = 2;
							series[0][1 + cid * 4].away.seed = 3;
							series[0][2 + cid * 4] = {home: teamsDiv2[0], away: teamsWC[topSeed]};
							series[0][2 + cid * 4].home.seed = 1;
							series[0][2 + cid * 4].away.seed = 4;
							series[0][3 + cid * 4] = {home: teamsDiv2[1], away: teamsDiv2[2]};
							series[0][3 + cid * 4].home.seed = 2;
							series[0][3 + cid * 4].away.seed = 3;	
							
						}					
					
					}
					
                    return {
                        finalMatchups: false,
                        series: series,
                        season: inputs.season
                    };
                });
            }

            // Display the current or archived playoffs
            return dao.playoffSeries.get({key: inputs.season}).then(function (playoffSeries) {
                var series;

                series = playoffSeries.series;

                return {
                    finalMatchups: true,
                    series: series,
                    season: inputs.season
                };
            });
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