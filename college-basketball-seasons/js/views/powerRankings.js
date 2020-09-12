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
                    attrs: ["tid", "abbrev", "region", "name","cid","state"],
                    seasonAttrs: ["won", "lost","wonAway","wonHome","lostAway","lostHome", "lastTen"],
                    stats: ["gp", "pts", "oppPts", "diff"],
                    season: g.season
                }),
                dao.players.getAll({
                    index: "tid",
                    key: IDBKeyRange.lowerBound(0)
                }),
				dao.games.getAll({
					index: "season",
					key: g.season					
				})						
				
            ]).spread(function (teams, players,game) {
                var i, j, overallRankMetric, playerValuesByTid, weights;

				var teamWins,teamLosses,teamAdjWins,teamAdjLosses, teamOppWins,teamOppLosses, teamOppOppWins,teamOppOppLosses,teamPointsFor,teamPointsAgainst,teamAdjPointsFor,teamAdjPointsAgainst,teamSchedule,teamOppPointsFor,teamOppPointsAgainst,teamOppOppPointsFor,teamOppOppPointsAgainst;
				
				var teamSOS,teamRPI,teamPowerRank;
				
				var trackGames,trackOpps,trackOppsOpps;
//                   console.log(g.season);

		/*			console.log("game.length"+game.length);
					console.log("keys"+Object.keys(game));*/
					
                teamWins = [];
                teamLosses = [];
                teamAdjWins = [];
                teamAdjLosses = [];
                teamOppWins = [];
                teamOppLosses = [];
                teamOppOppWins = [];
                teamOppOppLosses = [];
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
				
                teamSOS = [];
                teamRPI = [];
                teamPowerRank = [];

				
                for (i = 0; i < g.numTeams; i++) {
					teamWins[i] = [];
					teamLosses[i] = [];
					teamAdjWins[i] = [];
					teamAdjLosses[i] = [];
					teamOppWins[i] = [];
					teamOppLosses[i] = [];
					teamOppOppWins[i] = [];
					teamOppOppLosses[i] = [];					
					teamPointsFor[i] = [];
					teamPointsAgainst[i] = [];
					teamAdjPointsFor[i] = [];
					teamAdjPointsAgainst[i] = [];
					teamOppPointsFor[i] = [];
					teamOppPointsAgainst[i] = [];
					teamOppOppPointsFor[i] = [];
					teamOppOppPointsAgainst[i] = [];
					teamSOS[i] = [];
					teamRPI[i] = [];
					teamPowerRank[i] = [];					
					trackGames[i] = [];					
					trackOpps[i] = [];
					trackOppsOpps[i] = [];
					teamSchedule[i] = [];
					teamWins[i] = 0;
					teamLosses[i] = 0;					
					teamAdjWins[i] = 0;
					teamAdjLosses[i] = 0;
					teamOppWins[i] = 0;
					teamOppLosses[i] = 0;
					teamOppOppWins[i] = 0;
					teamOppOppLosses[i] = 0;					
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
					teamSOS[i] = 0;
					teamRPI[i] = 0;
					teamPowerRank[i] = 0;						
                }				
				
				

                for (i = 0; i < game.length; i++) {
/*				  console.log("game: "+i);
				  console.log("game[i].won.tid: "+game[i].won.tid);
				  console.log("game[i].lost.tid: "+game[i].lost.tid);
				  console.log("game[i].won.pts: "+game[i].won.pts);
				  console.log("game[i].lost.pts: "+game[i].lost.pts);
				  console.log("game[i].lost.pts: "+game[i].lost.pts); */
				 //   console.log("away: "+game[i].team[0].tid);
				 //   console.log("home: "+game[i].team[1].tid);
					teamWins[game[i].won.tid] += 1;
					teamLosses[game[i].lost.tid] += 1;
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
				//// now track Opp
				//// and OppOpp
				
/*					console.log("keysWins"+Object.keys(teamWins));
					console.log("keyslosses"+Object.keys(teamLosses));*/
		
				//// now gather opponent data
                for (i = 0; i < g.numTeams; i++) {
					for (j = 0; j < game.length; j++) {
						if (i===game[j].won.tid) {
							teamOppPointsFor[i] += teamPointsFor[game[j].lost.tid];						   
							teamOppPointsAgainst[i] += teamPointsAgainst[game[j].lost.tid];		
							teamOppLosses[i] += teamLosses[game[j].lost.tid];
							teamOppWins[i] += teamWins[game[j].lost.tid];
							trackOpps[i] += 1;							
						} else if (i===game[j].lost.tid) {
							teamOppPointsFor[i] += teamPointsFor[game[j].won.tid];						
							teamOppPointsAgainst[i] += teamPointsAgainst[game[j].won.tid];						   
							teamOppLosses[i] += teamLosses[game[j].won.tid];
							teamOppWins[i] += teamWins[game[j].won.tid];
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
							teamOppOppLosses[i] += teamOppLosses[game[j].lost.tid];
							teamOppOppWins[i] += teamOppWins[game[j].lost.tid];
							trackOppsOpps[i] += 1;							
						} else if (i===game[j].lost.tid) {
							teamOppOppPointsFor[i] += teamOppPointsFor[game[j].won.tid];						
							teamOppOppPointsAgainst[i] += teamOppPointsAgainst[game[j].won.tid];						   
							teamOppOppLosses[i] += teamOppLosses[game[j].won.tid];
							teamOppOppWins[i] += teamOppWins[game[j].won.tid];
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
		

					
				// need divsor
				// need to do by wins
                for (i = 0; i < g.numTeams; i++) {
					teamAdjWins[i] = teams[i].wonHome*.6+teams[i].wonAway*1.4
					teamAdjLosses[i] = teams[i].lostHome*1.4+teams[i].lostAway*.6
				}				
				
				////now create SOS/RPI/PowerRank
                for (i = 0; i < g.numTeams; i++) {
					teams[i].SOS = ((teamOppWins[i]/(teamOppLosses[i]+teamOppWins[i]))*2+teamOppOppWins[i]/(teamOppOppLosses[i]+teamOppOppWins[i]))/3;
					teams[i].RPI = (teamAdjWins[i]/(teamAdjLosses[i]+teamAdjWins[i])+teams[i].SOS*3)/4;
					teams[i].power = (teamPointsFor[i]-teamPointsAgainst[i]+teamOppPointsFor[i]*2-teamOppPointsAgainst[i]*2+teamOppOppPointsFor[i]-teamOppOppPointsAgainst[i])/4;;	                       
/*					teamSOS[i] = (teamOppWins[i]/(teamOppLosses[i]+teamOppWins[i])*2+teamOppOppWins[i]/(teamOppOppLosses[i]+teamOppOppWins[i]))/3;
					teamRPI[i] = (teamAdjWins[i]/(teamAdjLosses[i]+teamAdjWins[i])+teamSOS[i]*3)/4;
					teamPowerRank[i] = (teamPointsFor[i]-teamPointsAgainst[i]+teamOppPointsFor[i]*2-teamOppPointsAgainst[i]*2+teamOppOppPointsFor[i]-teamOppOppPointsAgainst[i])/4;;	                       */
				}				

				
	
				
                // Array of arrays, containing the values for each player on each team
                playerValuesByTid = [];

                for (i = 0; i < g.numTeams; i++) {
                    playerValuesByTid[i] = [];
                    teams[i].talent = 0;
                }

                // TALENT
                // Get player values and sort by tid
                for (i = 0; i < players.length; i++) {
                    playerValuesByTid[players[i].tid].push(players[i].valueNoPot);
                }
                // Sort and weight the values - doesn't matter how good your 12th man is
                weights = [2, 1.5, 1.25, 1.1, 1, 0.9, 0.8, 0.7, 0.6, 0.4, 0.2, 0.1];
                for (i = 0; i < playerValuesByTid.length; i++) {
                    playerValuesByTid[i].sort(function (a, b) { return b - a; });

                    for (j = 0; j < playerValuesByTid[i].length; j++) {
                        if (j < weights.length) {
                            teams[i].talent += weights[j] * playerValuesByTid[i][j];
                        }
                    }
                }

                // PERFORMANCE
                for (i = 0; i < g.numTeams; i++) {
                    playerValuesByTid[i] = [];
                    // Modulate point differential by recent record: +5 for 10-0 in last 10 and -5 for 0-10
                    teams[i].performance = teams[i].diff - 5 + 5 * (parseInt(teams[i].lastTen.split("-")[0], 10)) / 10;
                }

                // RANKS
                teams.sort(function (a, b) { return b.talent - a.talent; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].talentRank = i + 1;
                }
                teams.sort(function (a, b) { return b.performance - a.performance; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].performanceRank = i + 1;
                }

                teams.sort(function (a, b) { return b.SOS - a.SOS; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].SOSRank = i + 1;
                }				
                teams.sort(function (a, b) { return b.RPI - a.RPI; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].RPIRank = i + 1;
                }		
                teams.sort(function (a, b) { return b.power - a.power; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].powerRank = i + 1;
                }	

			
                // OVERALL RANK
                // Weighted average depending on GP
                overallRankMetric = function (t) {
                    if (t.gp < 30) {
                        return t.performanceRank * 6 * t.gp / 30 + t.talentRank * 2 * (30 - t.gp) / 30;
                    }

                    return t.performanceRank * 6 + t.talentRank * 2;
                };
				
				
                teams.sort(function (a, b) {
                    return overallRankMetric(a) - overallRankMetric(b);
                });
				
				var removeConference;
				
                for (i = 0; i < teams.length; i++) {
                    teams[i].overallRank = i + 1;
                    teams[i].teamConf = g.confs[teams[i].cid].name;
					removeConference = teams[i].teamConf;
					removeConference = removeConference.replace('Conference','');
                    teams[i].teamConf = removeConference;
					
                }
//                return dao.teams.put({ot: tx, value: t}).then(function () {
        //        return dao.teams.put({ot: tx, value: teams}).then(function () {

					return {
						teams: teams
					};
				
            //    });
				
				
				
            });
        }
    }

    function uiFirst(vm) {
        ui.title("Power Rankings");

        ko.computed(function () {
            ui.datatableSinglePage($("#power-rankings"), 0, _.map(vm.teams(), function (t) {
                var performanceRank,powerRank,RPIRank,SOSRank;
                performanceRank = t.gp > 0 ? String(t.performanceRank) : "-";
                powerRank = t.gp > 0 ? String(t.powerRank) : "-";
                RPIRank = t.gp > 0 ? String(t.RPIRank) : "-";
                SOSRank = t.gp > 0 ? String(t.SOSRank) : "-";
                return [String(t.overallRank), performanceRank, String(t.talentRank), SOSRank, RPIRank, powerRank, '<a href="' + helpers.leagueUrl(["roster", t.abbrev]) + '">' + t.region + ' ' + t.name + '</a>',String(t.teamConf),String(t.state), String(t.won), String(t.lost), t.lastTen, helpers.round(t.diff, 1), t.tid === g.userTid];
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