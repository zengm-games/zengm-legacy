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

			var NAConference,EUConference, LCSConference,LCSExtended,LCKConference,LPLConference,LMSConference,WorldsPlayoff;

			NAConference = false;
			EUConference = false;
			LCSConference = false;
			LCSExtended = false;
			LCKConference = false;
			LPLConference = false;
			LMSConference = false;
			WorldsPlayoff = false;
			
		//	console.log(	g.gameType);
			if (g.gameType == 0) {
				LCSConference = true;
			} else if ((g.gameType == 1)) {
				LCSConference = true;
				LCSExtended = true;
			} else if (g.gameType == 2) {
				LCKConference = true;
			} else if (g.gameType == 3) {
				LPLConference = true;						
			} else if (g.gameType == 4) {
				LMSConference = true;
			} else {
			//	NAConference = true;
			//	EUConference = true;
				LCKConference = true;
				LPLConference = true;
				LMSConference = true;
				WorldsPlayoff = true;
			}	
		// If in the current season and before playoffs started, display projected matchups
            if (inputs.season === g.season && g.phase < g.PHASE.PLAYOFFS) {
                return team.filter({
                    attrs: ["tid", "cid", "abbrev", "name"],
                    seasonAttrs: ["winp"],
                    stats: ["kda","fg","fga","fgp","pf","oppTw"],					
                    season: inputs.season,
                    sortBy: ["winp","diffTower","kda"]
                }).then(function (teams) {
                    var cid, i, series, teamsConf,teamsConf2,teamsConf3,teamsConf4,teamsConf5,teamsConf6;
					
						
					
                    teamsConf = [];
                    teamsConf2 = [];
                    teamsConf3 = [];
                    teamsConf4 = [];
                    teamsConf5 = [];
                    teamsConf6 = [];

				/*	if (g.gameType == 0) {
						series = [[], [], [], []];  // First round, second round, third round, fourth round
					}	else if  (g.gameType == 1) {
						series = [[], [], [], []];  // First round, second round, third round, fourth round
					} else {*/
//						series = [[], [], [], [], []];  // First round, second round, third round, fourth round
						series = [[], [], [], [], [], [], [], [], [], [], [], []];  // First round, second round, third round, fourth round
					//}
											
					
				////	console.log(LCSConference);
				//	console.log(LCSExtended);
				//	console.log(LCKConference);
				//	console.log(teams.length);
					
					if ((g.gameType == 0) || (g.gameType == 1) || (g.gameType == 5)) {
//					if ( (g.gameType == 1)) {
//					if ((g.gameType  > 5)) {
					
				
					
						for (cid = 0; cid < 1; cid++) {
							teamsConf = [];
						
							for (i = 0; i < teams.length; i++) {
								if (teams[i].cid === cid) {
									teamsConf.push(teams[i]);
								}
							}	
						//	console.log(teamsConf.length);
							series[0][  0 ] = {home: teamsConf[3], away: teamsConf[4]};
							series[0][ 0 ].home.seed = 4;
							series[0][ 0 ].away.seed = 5;	
							
							
							series[1][0] = {home: teamsConf[0],away: teamsConf[0] };
							series[1][0].home.seed = 1;
							
							series[0][1 ] = {home: teamsConf[2], away: teamsConf[5]};
							series[0][1 ].home.seed = 3;
							series[0][1 ].away.seed = 6;							
							
							series[1][1] = {home: teamsConf[1],away: teamsConf[1] };
							series[1][1].home.seed = 2;
							
						/*	series[2][2] = {home: teamsConf[1],away: teamsConf[1] };
							series[2][2].home.seed = 8;						
							series[2][2].away.seed = 8;						
							series[2][3] = {home: teamsConf[1],away: teamsConf[1] };
							series[2][3].home.seed = 9;							
							series[2][3].away.seed = 9;							*/
						}
						
					}	
					if (g.gameType == 1) {
//					if (g.gameType > 1) {
					   for (cid = 1; cid < 2; cid++) {
							for (i = 0; i < teams.length; i++) {
								if (teams[i].cid === cid) {
									teamsConf2.push(teams[i]);
								}
							}	

							//console.log(teamsConf2.length);							
							series[0][  2 ] = {home: teamsConf2[0], away: teamsConf2[3]};
							series[0][ 2 ].home.seed = 1;
							series[0][ 2 ].away.seed = 4;	

							series[0][3  ] = {home: teamsConf2[1], away: teamsConf2[2]};
							series[0][ 3 ].home.seed = 2;
							series[0][ 3 ].away.seed = 3;							


							series[2][2] = {home: teamsConf[(teamsConf.length-2)],away: teamsConf[(teamsConf.length-2)] };
							series[2][2].home.seed = (teamsConf.length-1);
							
							series[2][3] = {home: teamsConf[(teamsConf.length-3)],away: teamsConf[(teamsConf.length-3)] };
							series[2][3].home.seed = (teamsConf.length-2);

											
							
						}			

						for (cid = 2; cid < 3; cid++) {
							for (i = 0; i < teams.length; i++) {
								if (teams[i].cid === cid) {
									teamsConf3.push(teams[i]);
								}
							}	
						//	console.log(teamsConf3.length);	
							series[2][4] = {home: teamsConf2[(teamsConf2.length-2)],away: teamsConf2[(teamsConf2.length-2)] };
							series[2][4].home.seed = (teamsConf2.length-1);
							
							series[1][5] = {home: teamsConf2[(teamsConf2.length-1)],away: teamsConf2[(teamsConf2.length-1)] };
							series[1][5].home.seed = (teamsConf2.length);

							
							series[0][4] = {home: teamsConf3[1], away: teamsConf3[6]};
							series[0][4].home.seed = 2;
							series[0][4].away.seed = 7;	
							
							
							series[0][5] = {home: teamsConf3[2], away: teamsConf3[5]};
							series[0][5].home.seed = 3;
							series[0][5].away.seed = 6;							
							
							series[0][6] = {home: teamsConf3[8], away: teamsConf3[9]};
							series[0][6].home.seed = 9;
							series[0][6].away.seed = 10;							
							
							series[0][7] = {home: teamsConf3[0], away: teamsConf3[7]};
							series[0][7].home.seed = 1;
							series[0][7].away.seed = 8;							
							
							series[0][8] = {home: teamsConf3[3], away: teamsConf3[4]};
							series[0][8].home.seed = 4;
							series[0][8].away.seed = 5;							
							


						}		
					}	
					
					if ((g.gameType == 2)  || (g.gameType == 5)) {			
//					if ((g.gameType == 2) ) {		

						if ((g.gameType == 2) ) {			
							for (i = 0; i < teams.length; i++) {							       
									teamsConf2.push(teams[i]);
							}							
						}							
						if ((g.gameType == 5) ) {	
							for (cid = 2; cid < 3; cid++) {
								teamsConf2 = [];
							
								for (i = 0; i < teams.length; i++) {	
										if (teams[i].cid === cid) {
								
											teamsConf2.push(teams[i]);
										}
								}							
							}							
						}							

							series[0][ 9 ] = {home: teamsConf2[3], away: teamsConf2[4]};
							series[0][ 9 ].home.seed = 4;
							series[0][ 9 ].away.seed = 5;	
							
							series[1][7] = {home: teamsConf2[2],away: teamsConf2[2] };
							series[1][7].home.seed = 3;
																		console.log("here");
							series[2][6] = {home: teamsConf2[1],away: teamsConf2[1] };
							series[2][6].home.seed = 2;

							series[3][1] = {home: teamsConf2[0],away: teamsConf2[0] };
							series[3][1].home.seed = 1;
					}		

					if ((g.gameType == 3)  || (g.gameType == 5)) {			
/*							for (i = 0; i < teams.length; i++) {
									teamsConf.push(teams[i]);
							}							*/

							if ((g.gameType == 3) ) {			
								for (i = 0; i < teams.length; i++) {							       
										teamsConf3.push(teams[i]);
								}							
							}							
							if ((g.gameType == 5) ) {	
								teamsConf3 = [];

								for (cid = 3; cid < 4; cid++) {
									for (i = 0; i < teams.length; i++) {		
										if (teams[i].cid === cid) {								
											teamsConf3.push(teams[i]);
										}
									}							
								}							
							}							
							
							
							series[0][ 10 ] = {home: teamsConf3[6], away: teamsConf3[7]};
							series[0][ 10 ].home.seed = 7;
							series[0][ 10 ].away.seed = 8;	
							
							series[1][8] = {home: teamsConf3[5],away: teamsConf3[5] };
							series[1][8].home.seed = 6;
																		console.log("here");
							series[2][7] = {home: teamsConf3[4],away: teamsConf3[4] };
							series[2][7].home.seed = 5;

							series[3][2] = {home: teamsConf3[3],away: teamsConf3[3] };
							series[3][2].home.seed = 4;
							
							series[3][3] = {home: teamsConf3[2],away: teamsConf3[2] };
							series[3][3].home.seed = 3;
							
							series[4][0] = {home: teamsConf3[1],away: teamsConf3[1] };
							series[4][0].home.seed = 2;
							
							series[4][1] = {home: teamsConf3[0],away: teamsConf3[0] };
							series[4][1].home.seed = 1;
							
					}		
					
					if ((g.gameType == 4)  || (g.gameType == 5)) {			
/*							for (i = 0; i < teams.length; i++) {
									teamsConf.push(teams[i]);
							}							*/

							if ((g.gameType == 4) ) {			
								for (i = 0; i < teams.length; i++) {							       
										teamsConf4.push(teams[i]);
								}							
							}							
							if ((g.gameType == 5) ) {	
								teamsConf4 = [];

								for (cid = 4; cid < 5; cid++) {
									for (i = 0; i < teams.length; i++) {							       
										if (teams[i].cid === cid) {								
											teamsConf4.push(teams[i]);
										}									
									}							
								}							
							}						

							series[0][ 11 ] = {home: teamsConf4[2], away: teamsConf4[3]};
							series[0][ 11 ].home.seed = 3;
							series[0][ 11 ].away.seed = 4;	
							
							series[1][9] = {home: teamsConf4[1],away: teamsConf4[1] };
							series[1][9].home.seed = 2;
																		console.log("here");
							series[2][8] = {home: teamsConf4[0],away: teamsConf4[0] };
							series[2][8].home.seed = 1;

					}	
					if (g.gameType == 5) {		
	
						for (cid = 1; cid < 2; cid++) {
							teamsConf5 = [];
							for (i = 0; i < teams.length; i++) {
								if (teams[i].cid === cid) {
									teamsConf5.push(teams[i]);
								}
							}	

							series[0][  12 ] = {home: teamsConf5[3], away: teamsConf5[4]};
							series[0][ 12 ].home.seed = 4;
							series[0][ 12 ].away.seed = 5;	
							
							
							series[1][10] = {home: teamsConf5[0],away: teamsConf5[0] };
							series[1][10].home.seed = 1;
							
							series[0][13 ] = {home: teamsConf5[2], away: teamsConf5[5]};
							series[0][13 ].home.seed = 3;
							series[0][13 ].away.seed = 6;							
							
							series[1][11] = {home: teamsConf5[1],away: teamsConf5[1] };
							series[1][11].home.seed = 2;
						}	
	
	
						for (cid = 5; cid < 6; cid++) {
								teamsConf = [];
								for (i = 0; i < teams.length; i++) {
									if (teams[i].cid === cid) {
										teamsConf.push(teams[i]);
									}
								}	


								series[0][ 14 ] = {home: teamsConf[1], away: teamsConf[2]};
								series[0][ 14 ].home.seed = 2;
								series[0][ 14 ].away.seed = 3;	
								
								
								series[0][15 ] = {home: teamsConf[0], away: teamsConf[3]};
								series[0][15 ].home.seed = 1;
								series[0][15 ].away.seed = 4;							
								
			/*					series[0][ 12+cid*2 ] = {home: teamsConf[1], away: teamsConf[2]};
								series[0][ 12+cid*2 ].home.seed = 2;
								series[0][ 12+cid*2 ].away.seed = 3;	
								
								
								series[0][13+cid*2 ] = {home: teamsConf[0], away: teamsConf[3]};
								series[0][13+cid*2 ].home.seed = 1;
								series[0][13+cid*2 ].away.seed = 4;							*/
								
							} 	
					/*	for (cid = 0; cid < 6; cid++) {
							teamsConf = [];
							for (i = 0; i < teams.length; i++) {
								if (teams[i].cid === cid) {
									teamsConf.push(teams[i]);
								}
							}	


							series[0][ 12+cid*2 ] = {home: teamsConf[1], away: teamsConf[2]};
							series[0][ 12+cid*2 ].home.seed = 2;
							series[0][ 12+cid*2 ].away.seed = 3;	
							
							
							series[0][13+cid*2 ] = {home: teamsConf[0], away: teamsConf[3]};
							series[0][13+cid*2 ].home.seed = 1;
							series[0][13+cid*2 ].away.seed = 4;							*/
							
							
						/*	series[2][2] = {home: teamsConf[1],away: teamsConf[1] };
							series[2][2].home.seed = 8;						
							series[2][2].away.seed = 8;						
							series[2][3] = {home: teamsConf[1],away: teamsConf[1] };
							series[2][3].home.seed = 9;							
							series[2][3].away.seed = 9;							*/
					//	}
						
					}						
															

					//console.log(LCKConference);
                    return {
                        finalMatchups: false,
						NAConference: NAConference,
						EUConference: EUConference, 
						LCSConference: LCSConference,
						LCSExtended: LCSExtended,
						LCKConference: LCKConference,
						LPLConference: LPLConference,
						LMSConference: LMSConference,
						WorldsPlayoff: WorldsPlayoff,							
                        series: series,
                        season: inputs.season
                    };
                });
            }

            // Display the current or archived playoffs
            return dao.playoffSeries.get({key: inputs.season}).then(function (playoffSeries) {
                var series;

                series = playoffSeries.series;		
			//	console.log(series);
                return {
                    finalMatchups: true,
					NAConference: NAConference,
					EUConference: EUConference, 
					LCSConference: LCSConference,
					LCSExtended: LCSExtended,
					LCKConference: LCKConference,
					LPLConference: LPLConference,
					LMSConference: LMSConference,	
					WorldsPlayoff: WorldsPlayoff,					
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