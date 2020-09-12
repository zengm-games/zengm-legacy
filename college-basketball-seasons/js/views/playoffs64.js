/**
 * @name views.playoffs64
 * @namespace Show current or archived playoffs, or projected matchups for an in-progress season.
 */
define(["dao", "globals", "ui", "core/team", "lib/knockout", "util/bbgmView", "util/helpers", "views/components", "lib/underscore"], function (dao, g, ui, team, ko, bbgmView, helpers, components, _) {
    "use strict";

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function updatePlayoffs(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || inputs.season !== vm.season() || (inputs.season === g.season && updateEvents.indexOf("gameSim") >= 0)) {
            // If in the current season and before playoffs started, display projected matchups
//            if (inputs.season === g.season && g.phase < g.PHASE.PLAYOFFS) {
            if (inputs.season === g.season && g.phase < g.PHASE.PLAYOFFS64) {
			
       //    return Promise.all([			
                return team.filter({
                    attrs: ["tid", "cid","did", "abbrev", "name"],
                    seasonAttrs: ["winpConf","winp"],
                   season: inputs.season
     //             sortBy: ["winpConf","winp"]
                }).then(function (teams) {
                    var cid,did, i, series, teamsConf,bracket;
					
	
					return dao.games.getAll({
						index: "season",
						key: g.season					
					}).then(function (game) {
	//				}).then(function (teams,game) {
					
					//	  console.log("test");
					//	  console.log("game length: "+game.length);
					//	  console.log("teams length: "+teams.length);	
						  
							var i, j;
							
							var teamPointsFor,teamPointsAgainst,teamAdjPointsFor,teamAdjPointsAgainst,teamSchedule,teamOppPointsFor,teamOppPointsAgainst,teamOppOppPointsFor,teamOppOppPointsAgainst;
							
							var teamPowerRank;
							
							var trackGames,trackOpps,trackOppsOpps;
			//                   console.log(g.season);

					/*			console.log("game.length"+game.length);
								console.log("keys"+Object.keys(game));*/
									
							teamPointsFor = [];
							teamPointsAgainst = [];
							teamAdjPointsFor = [];
							teamAdjPointsAgainst = [];
							teamOppPointsFor = [];
							teamOppPointsAgainst = [];
							teamOppOppPointsFor = [];
							teamOppOppPointsAgainst = [];
							trackGames = [];
							trackOpps = [];
							trackOppsOpps = [];
							teamSchedule = [];
							
							teamPowerRank = [];

							
							for (i = 0; i < g.numTeams; i++) {
								teamPointsFor[i] = [];
								teamPointsAgainst[i] = [];
								teamAdjPointsFor[i] = [];
								teamAdjPointsAgainst[i] = [];
								teamOppPointsFor[i] = [];
								teamOppPointsAgainst[i] = [];
								teamOppOppPointsFor[i] = [];
								teamOppOppPointsAgainst[i] = [];
								teamPowerRank[i] = [];					
								trackGames[i] = [];					
								trackOpps[i] = [];
								trackOppsOpps[i] = [];
								teamSchedule[i] = [];
								teamPointsFor[i] = 0;
								teamPointsAgainst[i] = 0;
								teamAdjPointsFor[i] = 0;
								teamAdjPointsAgainst[i] = 0;
								teamOppPointsFor[i] = 0;
								teamOppPointsAgainst[i] = 0;
								teamOppOppPointsFor[i] = 0;
								teamOppOppPointsAgainst[i] = 0;		
								trackGames[i] = 0;					
								trackOpps[i] = 0;
								trackOppsOpps[i] = 0;
								teamPowerRank[i] = 0;						
							}				
							
						  
						   for (i = 0; i < game.length; i++) {
									teamPointsFor[game[i].won.tid] += game[i].won.pts;
									teamPointsFor[game[i].lost.tid] += game[i].lost.pts;
									teamPointsAgainst[game[i].won.tid] += game[i].lost.pts;
									teamPointsAgainst[game[i].lost.tid] += game[i].won.pts;
									trackGames[game[i].won.tid] += 1;
									trackGames[game[i].lost.tid] += 1;
							}
							for (i = 0; i < g.numTeams; i++) {
								if (trackGames[i]> 0) {
									teamPointsFor[i] /= trackGames[i];
									teamPointsAgainst[i] /= trackGames[i];
								}
							}		


				
							//// now gather opponent data
							for (i = 0; i < g.numTeams; i++) {
								for (j = 0; j < game.length; j++) {
									if (i===game[j].won.tid) {
										teamOppPointsFor[i] += teamPointsFor[game[j].lost.tid];						   
										teamOppPointsAgainst[i] += teamPointsAgainst[game[j].lost.tid];		
										trackOpps[i] += 1;							
									} else if (i===game[j].lost.tid) {
										teamOppPointsFor[i] += teamPointsFor[game[j].won.tid];						
										teamOppPointsAgainst[i] += teamPointsAgainst[game[j].won.tid];						   
										trackOpps[i] += 1;								
									}				
								}				
							}
							
							for (i = 0; i < g.numTeams; i++) {
								if (trackOpps[i]> 0) {
									teamOppPointsFor[i] /= trackOpps[i];
									teamOppPointsAgainst[i] /= trackOpps[i];
								}
							}				
							

							//// now gather opponent opponent data
							for (i = 0; i < g.numTeams; i++) {
								for (j = 0; j < game.length; j++) {
									if (i===game[j].won.tid) {
										teamOppOppPointsFor[i] += teamOppPointsFor[game[j].lost.tid];						   
										teamOppOppPointsAgainst[i] += teamOppPointsAgainst[game[j].lost.tid];						   
										trackOppsOpps[i] += 1;							
									} else if (i===game[j].lost.tid) {
										teamOppOppPointsFor[i] += teamOppPointsFor[game[j].won.tid];						
										teamOppOppPointsAgainst[i] += teamOppPointsAgainst[game[j].won.tid];						   
										trackOppsOpps[i] += 1;							
									}				
								}				
							}				
							
							for (i = 0; i < g.numTeams; i++) {
								if (trackOppsOpps[i]> 0) {
									teamOppOppPointsFor[i] /= trackOppsOpps[i];
									teamOppOppPointsAgainst[i] /= trackOppsOpps[i];
								}
							}						
					

								
							
							////now create SOS/RPI/PowerRank
							for (i = 0; i < g.numTeams; i++) {
								teams[i].power = (teamPointsFor[i]-teamPointsAgainst[i]+teamOppPointsFor[i]*2-teamOppPointsAgainst[i]*2+teamOppOppPointsFor[i]-teamOppOppPointsAgainst[i])/4;;	                       
							}				

							teams.sort(function (a, b) { return b.power - a.power; });

							////////////
							
			//  console.log("test");
			//			  console.log("teams length: "+teams.length);						
			//			  console.log("game length: "+game.length);
					
                    series = [[], [], [], [], [], []];  // First round, second round, third round, fourth round
//                    for (cid = 0; cid < 4; cid++) {
                        teamsConf = [];
//                        for (i = 0; i < teams.length; i++) {
                        for (i = 0; i < 64; i++) {
                                teamsConf.push(teams[i]);
                        }
						
						for (bracket = 0; bracket < 4; bracket++) {
							series[0][bracket * 8] = {home: teams[3-bracket], away: teams[16*4-4+bracket]};
							series[0][bracket * 8].away.seed = 16;
							series[0][bracket * 8].home.seed = 1;
							series[0][1 + bracket * 8] = {home: teamsConf[8*4-4+bracket], away: teamsConf[9*4-4+bracket]};
							series[0][1 + bracket * 8].away.seed = 9;
							series[0][1 + bracket * 8].home.seed = 8;
							series[0][2 + bracket * 8] = {home: teamsConf[4*4-4+bracket], away: teamsConf[13*4-4+bracket]};
							series[0][2 + bracket * 8].away.seed = 13;
							series[0][2 + bracket * 8].home.seed = 4;
							series[0][3 + bracket * 8] = {home: teamsConf[5*4-4+bracket], away: teamsConf[12*4-4+bracket]};
							series[0][3 + bracket * 8].away.seed = 12;
							series[0][3 + bracket * 8].home.seed = 5;
							series[0][4 + bracket * 8] = {home: teamsConf[6*4-4+bracket], away: teamsConf[11*4-4+bracket]};
							series[0][4 + bracket * 8].away.seed = 11;
							series[0][4 + bracket * 8].home.seed = 6;
							series[0][5 + bracket * 8] = {home: teamsConf[3*4-4+bracket], away: teamsConf[14*4-4+bracket]};
							series[0][5 + bracket * 8].away.seed = 14;
							series[0][5 + bracket * 8].home.seed = 3;
							series[0][6 + bracket * 8] = {home: teamsConf[7*4-4+bracket], away: teamsConf[10*4-4+bracket]};
							series[0][6 + bracket * 8].away.seed = 10;
							series[0][6 + bracket * 8].home.seed = 7;
							series[0][7 + bracket * 8] = {home: teamsConf[2*4-4+bracket], away: teamsConf[15*4-4+bracket]};
							series[0][7 + bracket * 8].away.seed = 15;
							series[0][7 + bracket * 8].home.seed = 2;
						}
						
         /*       series[0][cid * 8] = {home: teamsConf[0], away: teamsConf[15]};
                series[0][cid * 8].home.seed = 1;
                series[0][cid * 8].away.seed = 16;
                series[0][1 + cid * 8] = {home: teamsConf[7], away: teamsConf[8]};
                series[0][1 + cid * 8].home.seed = 8;
                series[0][1 + cid * 8].away.seed = 9;
                series[0][2 + cid * 8] = {home: teamsConf[3], away: teamsConf[12]};
                series[0][2 + cid * 8].home.seed = 4;
                series[0][2 + cid * 8].away.seed = 13;
                series[0][3 + cid * 8] = {home: teamsConf[4], away: teamsConf[11]};
                series[0][3 + cid * 8].home.seed = 5;
                series[0][3 + cid * 8].away.seed = 12;
                series[0][4 + cid * 8] = {home: teamsConf[1], away: teamsConf[14]};
                series[0][4 + cid * 8].home.seed = 2;
                series[0][4 + cid * 8].away.seed = 15;
                series[0][5 + cid * 8] = {home: teamsConf[6], away: teamsConf[9]};
                series[0][5 + cid * 8].home.seed = 7;
                series[0][5 + cid * 8].away.seed = 10;
                series[0][6 + cid * 8] = {home: teamsConf[2], away: teamsConf[13]};
                series[0][6 + cid * 8].home.seed = 3;
                series[0][6 + cid * 8].away.seed = 14;
                series[0][7 + cid * 8] = {home: teamsConf[5], away: teamsConf[10]};
                series[0][7 + cid * 8].home.seed = 6;
                series[0][7 + cid * 8].away.seed = 11;						*/
						
						


                    return {
                        finalMatchups64: false,
                        series: series,
                        season: inputs.season
                    };							
							
							
							
							
							
						  //////////////
					});				
					///////

					///////

                });
				
				
            }

            // Display the current or archived playoffs
//            return dao.playoffSeries.get({key: inputs.season}).then(function (playoffSeries) {
            return dao.playoffSeries64.get({key: inputs.season}).then(function (playoffSeries64) {
                var series;

                series = playoffSeries64.series;

                return {
                    finalMatchups64: true,
                    series: series,
                    season: inputs.season
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("National Tournament (NT) - " + vm.season());
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("playoffs64-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "playoffs64",
        get: get,
        runBefore: [updatePlayoffs],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});