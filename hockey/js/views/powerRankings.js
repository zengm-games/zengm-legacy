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
                attrs: ["tid", "abbrev", "region", "name","cid","did"],
                seasonAttrs: ["won", "lost", "lastTen","overtime"],
                stats: ["gp", "fg", "oppPts", "diff"],
                    season: g.season
                }),
                dao.players.getAll({
                    index: "tid",
                    key: IDBKeyRange.lowerBound(0)
                })
            ]).spread(function (teams, players) {
                    var i, j, overallRankMetric,  playerValuesByTid, playerValuesByTidG, playerValuesByTidC, playerValuesByTidW, playerValuesByTidD;
					var weights,weightsG,weightsC,weightsW,weightsD,removeConference,removeDivision;

                    // Array of arrays, containing the values for each player on each team
                    playerValuesByTid = [];
                    playerValuesByTidG = [];
                    playerValuesByTidC = [];
                    playerValuesByTidW = [];
                    playerValuesByTidD = [];

                    for (i = 0; i < g.numTeams; i++) {
                        playerValuesByTid[i] = [];
                        playerValuesByTidG[i] = [];
                        playerValuesByTidC[i] = [];
                        playerValuesByTidW[i] = [];
                        playerValuesByTidD[i] = [];
                        teams[i].talent = 0;
                        teams[i].talentG = 0;
                        teams[i].talentC = 0;
                        teams[i].talentW = 0;
                        teams[i].talentD = 0;
                    }

                    // TALENT
                    // Get player values and sort by tid
                    for (i = 0; i < players.length; i++) {
                        playerValuesByTid[players[i].tid].push(players[i].valueNoPot);
						if (players[i].pos == "G") {
							playerValuesByTidG[players[i].tid].push(players[i].valueNoPot);
						} else if (players[i].pos == "C") {
							playerValuesByTidC[players[i].tid].push(players[i].valueNoPot);
						} else if ((players[i].pos == "RW") || (players[i].pos == "LW")) {
							playerValuesByTidW[players[i].tid].push(players[i].valueNoPot);
						} else {
							playerValuesByTidD[players[i].tid].push(players[i].valueNoPot);
						}
                    }
                    // Sort and weight the values - doesn't matter how good your 12th man is
                    weights = [2.5,2.5, 2.3, 2.3, 2.3, 2.1, 2.1, 2.1, 1.9, 1.9, 1.6, 1.6, 1.6, 1.6, 1.6, 1.0, 0.9, 0.6, 0.6, 0.6];
                    weightsG = [2,.6];
                    weightsC = [2,1.8,1.6];
                    weightsW = [2,2,1.8,1.8,1.6,1.6];
                    weightsD = [2,2,1.8,1.8,1.6,1.6];

                    for (i = 0; i < playerValuesByTid.length; i++) {
                        playerValuesByTid[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidG[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidC[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidW[i].sort(function (a, b) { return b - a; });
                        playerValuesByTidD[i].sort(function (a, b) { return b - a; });

                        /*for (j = 0; j < playerValuesByTid[i].length; j++) {
                            if (j < weights.length) {
                                teams[i].talent += weights[j] * playerValuesByTid[i][j];
                            }
                        }*/
                        for (j = 0; j < playerValuesByTidG[i].length; j++) {
                            if (j < weightsG.length) {
                                teams[i].talentG += weightsG[j] * playerValuesByTidG[i][j];
                            }
                        }
                        for (j = 0; j < playerValuesByTidC[i].length; j++) {
                            if (j < weightsC.length) {
                                teams[i].talentC += weightsC[j] * playerValuesByTidC[i][j];
                            }
                        }						
                        for (j = 0; j < playerValuesByTidW[i].length; j++) {
                            if (j < weightsW.length) {
                                teams[i].talentW += weightsW[j] * playerValuesByTidW[i][j];
                            }
                        }						
                        for (j = 0; j < playerValuesByTidD[i].length; j++) {
                            if (j < weightsD.length) {
                                teams[i].talentD += weightsD[j] * playerValuesByTidD[i][j];
                            }
                        }						
						
						teams[i].talent = teams[i].talentG*1+teams[i].talentC*1+teams[i].talentW*1+teams[i].talentD*1;						
                    }
					

                    // PERFORMANCE
                    for (i = 0; i < g.numTeams; i++) {
                        playerValuesByTid[i] = [];
						playerValuesByTidG[i] = [];
						playerValuesByTidC[i] = [];
						playerValuesByTidW[i] = [];
						playerValuesByTidD[i] = [];						
                        // Modulate point differential by recent record: +5 for 10-0 in last 10 and -5 for 0-10
                        teams[i].performance = teams[i].diff - 5 + 5 * (parseInt(teams[i].lastTen.split("-")[0], 10)) / 10;
						if  (teams[i].gp == 0) {
							teams[i].ptsFor = 0;
							teams[i].ptsAgainst = 0;
						} else {
							teams[i].ptsFor = teams[i].fg / teams[i].gp;
							teams[i].ptsAgainst = teams[i].oppPts /teams[i].gp;
						}						
						
                    }

                    // RANKS
                    teams.sort(function (a, b) { return b.talent - a.talent; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentRank = i + 1;
                    }
					 											
                    teams.sort(function (a, b) { return b.talentG - a.talentG; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentRankG = i + 1;
                    }
					 											
                    teams.sort(function (a, b) { return b.talentC - a.talentC; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentRankC = i + 1;
                    }
					 											
                    teams.sort(function (a, b) { return b.talentW - a.talentW; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentRankW = i + 1;
                    }
					 											
                    teams.sort(function (a, b) { return b.talentD - a.talentD; });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].talentRankD = i + 1;
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
                        if (t.gp < 10) {
                            return t.performanceRank * 4 * t.gp / 10 + t.talentRank * (30 - t.gp) / 10;
                        }

                        return t.performanceRank * 4 + t.talentRank * 2;
                    };
                    teams.sort(function (a, b) {
                        return overallRankMetric(a) - overallRankMetric(b);
                    });
                    for (i = 0; i < teams.length; i++) {
                        teams[i].overallRank = i + 1;
						teams[i].teamConf = g.confs[teams[i].cid].name;
						removeConference = teams[i].teamConf;
						removeConference = removeConference.replace('Conference','');
						teams[i].teamConf = removeConference;	
						
						teams[i].teamDiv = g.divs[teams[i].did].name;
						removeDivision = teams[i].teamDiv;
						removeDivision = removeDivision.replace('Division','');
						teams[i].teamDiv = removeDivision;							
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
                return [String(t.overallRank), performanceRank, offensiveRank, defensiveRank, String(t.talentRank), String(t.talentRankG), String(t.talentRankC), String(t.talentRankW), String(t.talentRankD), '<a href="' + helpers.leagueUrl(["roster", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>',String(t.teamConf),String(t.teamDiv), String(t.won), String(t.lost), String(t.overtime), t.lastTen, helpers.round(t.diff, 1), t.tid === g.userTid];
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