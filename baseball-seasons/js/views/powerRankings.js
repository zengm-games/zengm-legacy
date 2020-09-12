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

    function updatePowerRankings(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("gameSim") >= 0) {
            return Promise.all([
            team.filter({
                attrs: ["tid", "abbrev", "region", "name"],
                seasonAttrs: ["won", "lost", "lastTen"],
                stats: ["gp", "pts", "oppPts", "diff"],
                    season: g.season
                }),
                dao.players.getAll({
                    index: "tid",
                    key: IDBKeyRange.lowerBound(0)
                })
            ]).spread(function (teams, players) {
					
                    var i, j, overallRankMetric, playerValuesByTid, weights, weightsOD,weightsK;
					var playerValuesByTidOff, playerValuesByTidDef, playerValuesByTidK;
					var weightsHitters,weightsPitchers;
					var weightsStarters,weightsRelievers,weightsBench,weightsLineup;
					var weightsQB,weightsRB,weightsTE,weightsWR,weightsOL;
					var weightsLB,weightsDL,weightsCB,weightsS;
					var playerValuesByTidQB,playerValuesByTidWR,playerValuesByTidRB,playerValuesByTidTE,playerValuesByTidOL;
					var playerValuesByTidCB,playerValuesByTidS,playerValuesByTidLB,playerValuesByTidDL;

                    // Array of arrays, containing the values for each player on each team
                    playerValuesByTid = [];
                    playerValuesByTidOff = [];
                    playerValuesByTidDef = [];
                    playerValuesByTidK = [];
                    playerValuesByTidQB = [];
                    playerValuesByTidWR = [];
                    playerValuesByTidRB = [];
                    playerValuesByTidTE = [];
                    playerValuesByTidOL = [];
                    playerValuesByTidDL = [];
                    playerValuesByTidLB = [];
                    playerValuesByTidS = [];
                    playerValuesByTidCB = [];
					
                    for (i = 0; i < g.numTeams; i++) {
                        playerValuesByTid[i] = [];
                        playerValuesByTidOff[i] = [];
                        playerValuesByTidDef[i] = [];
                        playerValuesByTidK[i] = [];
					    playerValuesByTidQB[i] = [];
						playerValuesByTidWR[i] = [];
						playerValuesByTidRB[i] = [];
						playerValuesByTidTE[i] = [];
						playerValuesByTidOL[i] = [];
						playerValuesByTidDL[i] = [];
						playerValuesByTidLB[i] = [];
						playerValuesByTidS[i] = [];
						playerValuesByTidCB[i] = [];

												
                        teams[i].talentStarters = 0;
                        teams[i].talentRelievers = 0;
                        teams[i].talentLineup = 0;
                        teams[i].talentBench = 0;
                        teams[i].talent = 0;
                        teams[i].talentK = 0;
                        teams[i].talentDef = 0;
                        teams[i].talentOff = 0;
                        teams[i].talentQB = 0;						
                        teams[i].talentRB = 0;						
						teams[i].talentTE = 0;						
						teams[i].talentWR = 0;						
						teams[i].talentOL = 0;						
						teams[i].talentCB = 0;						
						teams[i].talentS = 0;						
						teams[i].talentLB = 0;						
						teams[i].talentDL = 0;						
                    }

		
                    // TALENT
                    // Get player values and sort by tid
                    for (i = 0; i < players.length; i++) {
						    if (players[i].offDefK === "off") {
								playerValuesByTidOff[players[i].tid].push(players[i].valueNoPot);
							} else if (players[i].offDefK === "def") {
								playerValuesByTidDef[players[i].tid].push(players[i].valueNoPot);								
							}
							
                    }
                    // Sort and weight the values - doesn't matter how good your 12th man is
                    weightsOD = [2, 2, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0,0.9, 0.8, 0.75, 0.7, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35];
                    weightsHitters = [2, 2, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0,0.9, 0.8, 0.75, 0.7, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35];
                    weightsPitchers = [2, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0,0.9, 0.8, 0.75, 0.7, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35];
                    weightsStarters = [2, 2, 2, 2, 2];
                    weightsRelievers = [2, 1, 0.8, 0.6, 0.4];
                    weightsBench = [0.8, 0.6, 0.4, 0.2, 0.1];
                    weightsLineup = [1, 1, 1, 1, 1, 1, 1, 1];
                    weightsK = [2, 1.5];
                    weightsQB = [2];
                    weightsRB = [2,1.9,1.8,1.7];
                    weightsWR = [2,1.9,1.8,1.7,1.6,1.5,1.4,1.3];
                    weightsOL = [2,1.9,1.8,1.7,1.6,1.5,1.4,1.3];
                    weightsTE = [2,1.9,1.8,1.7];					
                    weightsS = [2,1.5];
                    weightsCB = [2,1.5];
                    weightsLB = [2,1.5,1.25,1];
                    weightsDL = [2,1.5,1.25,1];
					// break down by position (QB means more, OL means less, etc)
					
					//	console.log("playerValuesByTid.length: "+playerValuesByTid.length);					
                    for (i = 0; i < playerValuesByTid.length; i++) {
                        playerValuesByTid[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidOff[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidDef[i].sort(function (a, b) { return b - a; });

                        for (j = 0; j < playerValuesByTidOff[i].length; j++) {
	                            if (j < weightsOD.length) {
							//		teams[i].talentOff += weightsOD[j] * playerValuesByTidOff[i][j];									
								}																	
	                            if (j < weightsLineup.length) {
								
									teams[i].talentLineup += weightsLineup[j] * playerValuesByTidOff[i][j];									
								} else if (j < (weightsLineup.length+weightsBench.length )) {
									teams[i].talentBench += weightsBench[j-weightsLineup.length] * playerValuesByTidOff[i][j];									
								}
								
                        }
                        for (j = 0; j < playerValuesByTidDef[i].length; j++) {
	                            if (j < weightsOD.length) {
							//		teams[i].talentDef += weightsOD[j] * playerValuesByTidDef[i][j];									
								}			
	                            if (j < weightsStarters.length) {
									teams[i].talentStarters += weightsStarters[j] * playerValuesByTidDef[i][j];									
								} else if (j < (weightsStarters.length+weightsRelievers.length )) {
									teams[i].talentRelievers += weightsRelievers[j-weightsStarters.length] * playerValuesByTidDef[i][j];									
								}								
                        }						
     		

                        teams[i].talentOff = teams[i].talentLineup+teams[i].talentBench;	
                        teams[i].talentDef = teams[i].talentStarters+teams[i].talentRelievers;
                        teams[i].talent = teams[i].talentOff*1.4+teams[i].talentDef;
//						console.log(teams[i].talent+" "+teams[i].talentOff+" "+teams[i].talentDef+" "+teams[i].talentLineup+" "+teams[i].talentBench+" "+teams[i].talentStarters+" "+teams[i].talentRelievers);						
                    }

                    // PERFORMANCE
                    for (i = 0; i < g.numTeams; i++) {
                        playerValuesByTid[i] = [];
                        playerValuesByTidOff[i] = [];
                        playerValuesByTidDef[i] = [];
    							
                        // Modulate point differential by recent record: +5 for 10-0 in last 10 and -5 for 0-10
                        teams[i].performance = teams[i].diff - 5 + 5 * (parseInt(teams[i].lastTen.split("-")[0], 10)) / 10;
						if  (teams[i].gp == 0) {
							teams[i].ptsFor = 0;
							teams[i].ptsAgainst = 0;
						} else {
							teams[i].ptsFor = teams[i].pts / teams[i].gp;
							teams[i].ptsAgainst = teams[i].oppPts /teams[i].gp;
						}
                    }

                    // RANKS
                    teams.sort(function (a, b) { return b.talentOff - a.talentOff; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentOffRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentDef - a.talentDef; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentDefRank = i + 1;
                    }
                   teams.sort(function (a, b) { return b.talentStarters - a.talentStarters; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentStartersRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentRelievers - a.talentRelievers; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentRelieversRank = i + 1;
                    }					
                    teams.sort(function (a, b) { return b.talentLineup - a.talentLineup; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentLineupRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentBench - a.talentBench; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentBenchRank = i + 1;
                    }							
					
					              
					
                    teams.sort(function (a, b) { return b.talent - a.talent; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.performance - a.performance; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].performanceRank = i + 1;
                    }
					
                    teams.sort(function (a, b) { return b.ptsFor - a.ptsFor; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].ptsForRank = i + 1;
                    }
                    teams.sort(function (b, a) { return b.ptsAgainst - a.ptsAgainst; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].ptsAgainstRank = i + 1;
                    }					
					
                    // OVERALL RANK
                    // Weighted average depending on GP
                    overallRankMetric = function (t) {
                        if (t.gp < 30) {
                            return t.performanceRank * 4 * t.gp / 30 + t.talentRank * (160 - t.gp) / 30;
                        }

                        return t.performanceRank * 4 + t.talentRank * 2;
                    };
                    teams.sort(function (a, b) {
                        return overallRankMetric(a) - overallRankMetric(b);
                    });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].overallRank = i + 1;
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
                var performanceRank,offensiveRank,defensiveRank;
                performanceRank = t.gp > 0 ? String(t.performanceRank) : "-";
                offensiveRank = t.gp > 0 ? String(t.ptsForRank) : "-";
                defensiveRank = t.gp > 0 ? String(t.ptsAgainstRank) : "-";
                return [String(t.overallRank), performanceRank, offensiveRank, defensiveRank, String(t.talentRank), String(t.talentOffRank), String(t.talentLineupRank), String(t.talentBenchRank), String(t.talentDefRank), String(t.talentStartersRank), String(t.talentRelieversRank), '<a href="' + helpers.leagueUrl(["roster", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>', String(t.won), String(t.lost), t.lastTen, helpers.round(t.diff, 1), t.tid === g.userTid];
            }), {
                fnRowCallback: function (nRow, aData) {
                    // Show point differential in green or red for positive or negative
                    if (aData[aData.length - 2] > 0) {
                        nRow.childNodes[nRow.childNodes.length - 1].classList.add("text-success");
                    } else if (aData[aData.length - 2] < 0) {
                        nRow.childNodes[nRow.childNodes.length - 1].classList.add("text-danger");
                    }

                    // Highlight user team
                    if (aData[aData.length - 1]) {
                        nRow.classList.add("info");
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