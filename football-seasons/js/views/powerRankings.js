/**
 * @name views.powerRankings
 * @namespace Power Rankings based on player ratings, stats, team performance
 */
define(["globals", "ui", "core/team", "core/player", "lib/jquery", "lib/underscore", "lib/knockout", "lib/knockout.mapping", "views/components", "util/bbgmView", "util/helpers", "util/viewHelpers"], function (g, ui, team, player, $, _, ko, komapping, components, bbgmView, helpers, viewHelpers) {
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
        var deferred, tx;
					
        if (updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("gameSim") >= 0) {
            deferred = $.Deferred();

            tx = g.dbl.transaction(["players", "teams"]);
		
            team.filter({
                attrs: ["tid", "abbrev", "region", "name"],
                seasonAttrs: ["won", "lost", "lastTen"],
                stats: ["gp", "pts", "oppPts", "diff"],
                season: g.season,
                ot: tx
            }, function (teams) {

                tx.objectStore("players").index("tid").getAll(IDBKeyRange.lowerBound(0)).onsuccess = function (event) {
                    var i, j, overallRankMetric, players, playerValuesByTid, weights, weightsOD,weightsK;
					var playerValuesByTidOff, playerValuesByTidDef, playerValuesByTidK;
					var weightsQB,weightsRB,weightsTE,weightsWR,weightsOL;
					var weightsLB,weightsDL,weightsCB,weightsS;
					var playerValuesByTidQB,playerValuesByTidWR,playerValuesByTidRB,playerValuesByTidTE,playerValuesByTidOL;
					var playerValuesByTidCB,playerValuesByTidS,playerValuesByTidLB,playerValuesByTidDL;
					
                    players = event.target.result;

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
								playerValuesByTidOff[players[i].tid].push(player.value(players[i], {noPot: true}));
							} else if (players[i].offDefK === "def") {
								playerValuesByTidDef[players[i].tid].push(player.value(players[i], {noPot: true}));
								
							} else {
								playerValuesByTidK[players[i].tid].push(player.value(players[i], {noPot: true}));
							}
						    if (players[i].pos === "QB") {
								playerValuesByTidQB[players[i].tid].push(player.value(players[i], {noPot: true}));
							} else if (players[i].pos === "RB") {
								playerValuesByTidRB[players[i].tid].push(player.value(players[i], {noPot: true}));								
							} else if (players[i].pos === "TE") {
								playerValuesByTidTE[players[i].tid].push(player.value(players[i], {noPot: true}));
							} else if (players[i].pos === "WR") {
								playerValuesByTidWR[players[i].tid].push(player.value(players[i], {noPot: true}));
							} else if (players[i].pos === "OL") {
								playerValuesByTidOL[players[i].tid].push(player.value(players[i], {noPot: true}));
							} else if (players[i].pos === "S") {
								playerValuesByTidS[players[i].tid].push(player.value(players[i], {noPot: true}));
							} else if (players[i].pos === "CB") {
								playerValuesByTidCB[players[i].tid].push(player.value(players[i], {noPot: true}));
							} else if (players[i].pos === "LB") {
								playerValuesByTidLB[players[i].tid].push(player.value(players[i], {noPot: true}));
							} else {
								playerValuesByTidDL[players[i].tid].push(player.value(players[i], {noPot: true}));
							}							
                    }
                    // Sort and weight the values - doesn't matter how good your 12th man is
                    weightsOD = [2, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0,0.9, 0.8, 0.75, 0.7, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35];
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
                        playerValuesByTidK[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidQB[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidRB[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidWR[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidOL[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidTE[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidS[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidCB[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidLB[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidDL[i].sort(function (a, b) { return b - a; });

                        for (j = 0; j < playerValuesByTidOff[i].length; j++) {
	                            if (j < weightsOD.length) {
									teams[i].talentOff += weightsOD[j] * playerValuesByTidOff[i][j];									
								}																	
                        }
                        for (j = 0; j < playerValuesByTidDef[i].length; j++) {
	                            if (j < weightsOD.length) {
									teams[i].talentDef += weightsOD[j] * playerValuesByTidDef[i][j];									
								}																	
                        }						
                       for (j = 0; j < playerValuesByTidK[i].length; j++) {
	                            if (j < weightsK.length) {
									teams[i].talentK += weightsOD[j] * playerValuesByTidK[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidQB[i].length; j++) {
	                            if (j < weightsQB.length) {
									teams[i].talentQB += weightsQB[j] * playerValuesByTidQB[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidRB[i].length; j++) {
	                            if (j < weightsRB.length) {
									teams[i].talentRB += weightsRB[j] * playerValuesByTidRB[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidTE[i].length; j++) {
	                            if (j < weightsTE.length) {
									teams[i].talentTE += weightsTE[j] * playerValuesByTidTE[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidWR[i].length; j++) {
	                            if (j < weightsWR.length) {
									teams[i].talentWR += weightsWR[j] * playerValuesByTidWR[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidOL[i].length; j++) {
	                            if (j < weightsOL.length) {
									teams[i].talentOL += weightsOL[j] * playerValuesByTidOL[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidS[i].length; j++) {
	                            if (j < weightsS.length) {
									teams[i].talentS += weightsS[j] * playerValuesByTidS[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidCB[i].length; j++) {
	                            if (j < weightsCB.length) {
									teams[i].talentCB += weightsCB[j] * playerValuesByTidCB[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidLB[i].length; j++) {
	                            if (j < weightsLB.length) {
									teams[i].talentLB += weightsLB[j] * playerValuesByTidLB[i][j];									
								}																	
                        }							
                       for (j = 0; j < playerValuesByTidDL[i].length; j++) {
	                            if (j < weightsDL.length) {
									teams[i].talentDL += weightsDL[j] * playerValuesByTidDL[i][j];									
								}																	
                        }							
						
//                        teams[i].talent = teams[i].talentK*2+teams[i].talentOff*11+teams[i].talentDef*11;
//                        teams[i].talent = teams[i].talentK*2+teams[i].talentOff*11+teams[i].talentDef*11;
                        teams[i].talentOff = teams[i].talentQB*6+teams[i].talentTE*2+teams[i].talentWR*1+teams[i].talentRB*2+teams[i].talentOL*1;	
//console.log(teams[i].talentOff+" "+teams[i].talentQB+" "+teams[i].talentTE+" "+teams[i].talentWR+" "+teams[i].talentRB+" "+teams[i].talentOL);						
                        teams[i].talentDef = teams[i].talentCB*5+teams[i].talentS*4+teams[i].talentLB*2+teams[i].talentDL*2;
//console.log(teams[i].talentDef+" "+teams[i].talentCB+" "+teams[i].talentS+" "+teams[i].talentLB+" "+teams[i].talentDL);						
                        teams[i].talent = teams[i].talentK*2+teams[i].talentOff*11+teams[i].talentDef*11;
						
                    }

                    // PERFORMANCE
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
                    teams.sort(function (a, b) { return b.talentK - a.talentK; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentKRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentQB - a.talentQB; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentQBRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentRB - a.talentRB; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentRBRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentTE - a.talentTE; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentTERank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentWR - a.talentWR; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentWRRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentOL - a.talentOL; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentOLRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentCB - a.talentCB; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentCBRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentS - a.talentS; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentSRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentDL - a.talentDL; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentDLRank = i + 1;
                    }
                    teams.sort(function (a, b) { return b.talentLB - a.talentLB; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentLBRank = i + 1;
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
                        if (t.gp < 5) {
                            return t.performanceRank * 4 * t.gp / 5 + t.talentRank * (16 - t.gp) / 5;
                        }

                        return t.performanceRank * 4 + t.talentRank * 2;
                    };
                    teams.sort(function (a, b) {
                        return overallRankMetric(a) - overallRankMetric(b);
                    });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].overallRank = i + 1;
                    }

                    deferred.resolve({
                        teams: teams
                    });
                };
            });

            return deferred.promise();
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
                return [String(t.overallRank), performanceRank, offensiveRank, defensiveRank, String(t.talentRank), String(t.talentOffRank), String(t.talentQBRank), String(t.talentRBRank), String(t.talentTERank), String(t.talentWRRank), String(t.talentOLRank), String(t.talentDefRank), String(t.talentCBRank), String(t.talentSRank), String(t.talentLBRank), String(t.talentDLRank), String(t.talentKRank), '<a href="' + helpers.leagueUrl(["roster", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>', String(t.won), String(t.lost), t.lastTen, helpers.round(t.diff, 1), t.tid === g.userTid];
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