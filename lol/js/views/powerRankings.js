/**
 * @name views.powerRankings
 * @namespace Power Rankings based on player ratings, stats, team performance
 */
define(["dao", "globals", "ui", "core/team", "lib/bluebird", "lib/jquery", "lib/underscore", "lib/knockout", "util/bbgmView", "util/helpers"], function (dao, g, ui, team, Promise, $, _, ko, bbgmView, helpers) {
    "use strict";

    var mapping;

    mapping = {
        teams: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updatePowerRankings(inputs, updateEvents) {
        if (updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("gameSim") >= 0) {
            return Promise.all([
                team.filter({
                    attrs: ["tid", "abbrev", "region", "name","did","cid"],
                    seasonAttrs: ["won", "lost", "lastTen"],
                    stats: ["gp", "pts", "oppPts", "fg","fga","fgp","pf","oppTw","kda"],
                    season: g.season
                }),
                dao.players.getAll({
                    index: "tid",
                    key: IDBKeyRange.lowerBound(0)
                })
            ]).spread(function (teams, players) {
                var i, j, overallRankMetric, playerValuesByTid,playerRolesByTid, playerValuesMMRByTid,playerRolesMMRByTid, weights;
				var ADC,TOP,JGL,MID,SUP;
				var weightsPosition;
                // Array of arrays, containing the values for each player on each team
                playerValuesByTid = [];
                playerRolesByTid = [];
                playerValuesMMRByTid = [];
                playerRolesMMRByTid = [];

                for (i = 0; i < g.numTeams; i++) {
                    playerValuesByTid[i] = [];
                    playerRolesByTid[i] = [];
                playerValuesMMRByTid[i]  = [];
                playerRolesMMRByTid[i]  = [];
                    teams[i].talent = 0;
                    teams[i].talentMMR = 0;
					
                }
				
				
				 players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });

				for (i = 0; i < players.length; i++) {
					playerValuesByTid[players[i].tid].push(players[i].valueNoPot);
					playerRolesByTid[players[i].tid].push(players[i].pos);
				}
					 
					 
//                weights = [3, 2.5, 2, 1.5, 1];
                weights = [2.4, 2.2, 2.0, 1.8, 1.6];
//                weights = [2.0, 2.0, 2.0, 2.0, 2.0];
                for (i = 0; i < playerValuesByTid.length; i++) {
                  //  playerValuesByTid[i].sort(function (a, b) { return b - a; });
			        ADC = false;
					TOP = false;
					JGL = false;
					MID = false;
					SUP = false;
					weightsPosition = 0;
					
                    for (j = 0; j < playerValuesByTid[i].length; j++) {
                        if (weightsPosition < weights.length) {
							if  ( ((playerRolesByTid[i][j]== "ADC") && (!ADC)) || ((playerRolesByTid[i][j]== "TOP") && (!TOP)) || ((playerRolesByTid[i][j]== "JGL") && (!JGL)) || ((playerRolesByTid[i][j]== "MID") && (!MID)) || ((playerRolesByTid[i][j]== "SUP") && (!SUP))) {
						//		console.log(i+" "+playerRolesByTid[i][j]+" "+playerValuesByTid[i][j]);
								teams[i].talent += weights[weightsPosition] * playerValuesByTid[i][j];
								weightsPosition += 1;
								
								if (playerRolesByTid[i][j] == "ADC") {
									ADC = true;
								}
								if (playerRolesByTid[i][j] == "TOP") {
									TOP = true;
								}
								if (playerRolesByTid[i][j] == "JGL") {
									JGL = true;
								}
								if (playerRolesByTid[i][j] == "MID") {
									MID = true;
								}
								if (playerRolesByTid[i][j] == "SUP") {
									SUP = true;
								}								
							}
                        }
                    }
					//console.log(i+" "+teams[i].talent);
                }					 
//                 playerValuesByTid[i].sort(function (a, b) { return b - a; });
//                 players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });

 

				if (players[i].valueMMR == undefined) {
					 players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });
					// TALENT
					// Get player values and sort by tid
					for (i = 0; i < players.length; i++) {
	                    playerValuesMMRByTid[players[i].tid].push(players[i].valueNoPot);
						playerRolesMMRByTid[players[i].tid].push(players[i].pos);
					}
				
				} else {
					 players.sort(function (a, b) { return b.valueMMR - a.valueMMR; });
					// TALENT
					// Get player values and sort by tid
					for (i = 0; i < players.length; i++) {
	//                    playerValuesByTid[players[i].tid].push(players[i].valueNoPot);
						playerValuesMMRByTid[players[i].tid].push(players[i].valueMMR);
						playerRolesMMRByTid[players[i].tid].push(players[i].pos);
					}
				}
/*                for (i = 0; i < playerValuesByTid.length; i++) {
                }*/
                // Sort and weight the values - doesn't matter how good your 12th man is
//                weights = [2, 1.5, 1.25, 1.1, 1, 0.1, 0.1, 0.1];

 
             //   weights = [3, 2.5, 2, 1.5, 1];
                for (i = 0; i < playerValuesMMRByTid.length; i++) {
                  //  playerValuesByTid[i].sort(function (a, b) { return b - a; });
			        ADC = false;
					TOP = false;
					JGL = false;
					MID = false;
					SUP = false;
					weightsPosition = 0;
					
                    for (j = 0; j < playerValuesMMRByTid[i].length; j++) {
                        if (weightsPosition < weights.length) {
							if  ( ((playerRolesMMRByTid[i][j]== "ADC") && (!ADC)) || ((playerRolesMMRByTid[i][j]== "TOP") && (!TOP)) || ((playerRolesMMRByTid[i][j]== "JGL") && (!JGL)) || ((playerRolesMMRByTid[i][j]== "MID") && (!MID)) || ((playerRolesMMRByTid[i][j]== "SUP") && (!SUP))) {
						//		console.log(i+" "+playerRolesByTid[i][j]+" "+playerValuesByTid[i][j]);
								teams[i].talentMMR += weights[weightsPosition] * playerValuesMMRByTid[i][j];
								weightsPosition += 1;
								
								if (playerRolesMMRByTid[i][j] == "ADC") {
									ADC = true;
								}
								if (playerRolesMMRByTid[i][j] == "TOP") {
									TOP = true;
								}
								if (playerRolesMMRByTid[i][j] == "JGL") {
									JGL = true;
								}
								if (playerRolesMMRByTid[i][j] == "MID") {
									MID = true;
								}
								if (playerRolesMMRByTid[i][j] == "SUP") {
									SUP = true;
								}								
							}
                        }
                    }
					//console.log(i+" "+teams[i].talent);
                }

                // PERFORMANCE
                for (i = 0; i < g.numTeams; i++) {
                    playerValuesByTid[i] = [];
                    // Modulate point differential by recent record: +5 for 10-0 in last 10 and -5 for 0-10
//                    teams[i].performance = teams[i].diff - 5 + 5 * (parseInt(teams[i].lastTen.split("-")[0], 10)) / 10;
//                    teams[i].performance = teams[i].fg - teams[i].fga - 2.5 + 2.5 * (parseInt(teams[i].lastTen.split("-")[0], 5)) / 5;
//                    teams[i].performance = (teams[i].fg + teams[i].fgp)/teams[i].fga;
                    teams[i].diff = (teams[i].pf - teams[i].oppTw);
                    teams[i].performance = (teams[i].pf - teams[i].oppTw);
					
                }

                // RANKS
                teams.sort(function (a, b) { return b.talent - a.talent; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].talentRank = i + 1;
                }
                teams.sort(function (a, b) { return b.talentMMR - a.talentMMR; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].talentRankMMR = i + 1;
                }
				
                teams.sort(function (a, b) { return b.performance - a.performance; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].performanceRank = i + 1;
                }

                // OVERALL RANK
                // Weighted average depending on GP
                overallRankMetric = function (t) {
                  /*  if (t.gp < 5) {
                        return t.performanceRank * 4 * t.gp / 5 + 2 * t.talentRank * (6 - t.gp) / 5;
                    }*/
                    if (t.gp == 4) {
                        return t.performanceRank * 4  + 2 * t.talentRank;
                    }
                    if (t.gp == 3) {
                        return t.performanceRank * 3  + 3 * t.talentRank;
                    }
                    if (t.gp == 2) {
                        return t.performanceRank * 2  + 4 * t.talentRank;
                    }
                    if (t.gp == 1) {
                        return t.performanceRank * 1  + 5 * t.talentRank;
                    }
                    if (t.gp == 0) {
                        return  6 * t.talentRank;
                    }

                    return t.performanceRank * 4 + t.talentRank * 2;
                };
                teams.sort(function (a, b) {
                    return overallRankMetric(a) - overallRankMetric(b);
                });
				
				var removeConference;
				
				//	console.log(g.confs);
				for (i = 0; i < teams.length; i++) {
                    teams[i].overallRank = i + 1;
					//console.log(teams[i].did);
					//console.log(g.divs[teams[i].did].name);					
//                    teams[i].teamConf = g.divs[teams[i].did].name;
				//	console.log(teams[i].cid);
                    teams[i].teamConf = g.confs[teams[i].cid].name;
					//console.log(teams[i].teamConf);						
				//	removeConference = teams[i].teamConf;
				//	removeConference = removeConference.replace('League','');
                 //   teams[i].teamConf = removeConference;
					
                }

		
				

                return {
                    teams: teams
                };
            });
        }
    }

    function uiFirst(vm) {
        ui.title("Power Rankings");

        ko.computed(function () {
            ui.datatableSinglePage($("#power-rankings"), 0, _.map(vm.teams(), function (t) {
                var performanceRank;
                performanceRank = t.gp > 0 ? String(t.performanceRank) : "-";
                return [String(t.overallRank), performanceRank, String(t.talentRankMMR), String(t.talentRank), '<a href="' + helpers.leagueUrl(["roster", t.abbrev]) + '">' + t.region  + '</a>',String(t.teamConf), String(t.won), String(t.lost), t.lastTen, helpers.round(t.diff, 1), t.tid === g.userTid];
            }), {
                rowCallback: function (row, data) {
                    // Show point differential in green or red for positive or negative
                    if (data[data.length - 2] > 0) {
                        row.childNodes[row.childNodes.length - 1].classList.add("text-success");
                    } else if (data[data.length - 2] < 0) {
                        row.childNodes[row.childNodes.length - 1].classList.add("text-danger");
                    }

                    // Highlight user team
                    if (data[data.length - 1]) {
                        row.classList.add("info");
                    }
                }
            });
        }).extend({throttle: 1});

        ui.tableClickableRows($("#power-rankings"));
    }

    return bbgmView.init({
        id: "powerRankings",
        mapping: mapping,
        runBefore: [updatePowerRankings],
        uiFirst: uiFirst
    });
});