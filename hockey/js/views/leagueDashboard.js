/**
 * @name views.leagueDashboard
 * @namespace League dashboard, displaying several bits of information about the league/team.
 */
define(["dao", "globals", "ui", "core/player", "core/season", "core/team", "lib/knockout", "lib/knockout.mapping", "lib/underscore", "util/bbgmView", "util/helpers"], function (dao, g, ui, player, season, team, ko, komapping, _, bbgmView, helpers) {

    "use strict";

    function InitViewModel() {
        this.completed = ko.observableArray([]);
        this.upcoming = ko.observableArray([]);
    }

    function updateInbox(inputs, updateEvents) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0) {
            return dao.messages.getAll().then(function (messages) {
                var i;

                messages.reverse();

                for (i = 0; i < messages.length; i++) {
                    delete messages[i].text;
                }
                messages = messages.slice(0, 2);


                return {
                    messages: messages
                };
            });
        }
    }

    function updateTeam(inputs, updateEvents) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
            return dao.teams.get({key: g.userTid}).then(function (t) {
                var latestSeason;

                latestSeason = t.seasons[t.seasons.length - 1];


                return {
                    region: t.region,
                    name: t.name,
                    abbrev: t.abbrev,
                    won: latestSeason.won,
                    lost: latestSeason.lost,
					overtime: latestSeason.overtime,					
                    cash: latestSeason.cash / 1000,  // [millions of dollars]
                    salaryCap: g.salaryCap / 1000,  // [millions of dollars]
                    season: g.season,
                    playoffRoundsWon: latestSeason.playoffRoundsWon
                };
            });
        }
    }

    function updatePayroll(inputs, updateEvents) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("playerMovement") >= 0) {
            return team.getPayroll(null, g.userTid).get(0).then(function (payroll) {
                return {
                    payroll: payroll / 1000 // [millions of dollars]
                };
            });
        }
    }


    function updateTeams(inputs, updateEvents) {
        var stats, vars;

        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
            vars = {};

            stats = ["pts", "oppPts", "fg", "ast"];  // This is also used later to find ranks for these team stats
            return team.filter({
                attrs: ["tid", "cid"],
                seasonAttrs: ["won", "lost", "winp", "att", "revenue", "profit","overtime"],
                stats: stats,
                season: g.season,
                sortBy: ["winp", "-lost", "won"]
            }).then(function (teams) {
                var cid, i, j;

                cid = _.find(teams, function (t) { return t.tid === g.userTid; }).cid;

                vars.rank = 1;
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].cid === cid) {
                        if (teams[i].tid === g.userTid) {
                            vars.pts = teams[i].pts;
                            vars.oppPts = teams[i].oppPts;
                            vars.fg = teams[i].fg;
                            vars.ast = teams[i].ast;

                            vars.att = teams[i].att;
                            vars.revenue = teams[i].revenue;
                            vars.profit = teams[i].profit;
                            break;
                        } else {
                            vars.rank += 1;
                        }
                    }
                }

                for (i = 0; i < stats.length; i++) {
                    teams.sort(function (a, b) { return b[stats[i]] - a[stats[i]]; });
                    for (j = 0; j < teams.length; j++) {
                        if (teams[j].tid === g.userTid) {
                            vars[stats[i] + "Rank"] = j + 1;
                            break;
                        }
                    }
                }
                vars.oppPtsRank = 31 - vars.oppPtsRank;

                return vars;
            });
        }
    }

    function updateGames(inputs, updateEvents, vm) {
        var completed, numShowCompleted;

        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
            numShowCompleted = 4;
            completed = [];

            // This could be made much faster by using a compound index to search for season + team, but that's not supported by IE 10
            return dao.games.iterate({
                index: "season",
                key: g.season,
                direction: "prev",
                callback: function (game, shortCircuit) {
                    var i, overtime;

                    if (completed.length >= numShowCompleted) {
                        return shortCircuit();
                    }
					
					
                    if (game.overtimes === 1) {
                        overtime = " (OT)";
                    } else if (game.overtimes > 1) {
                        overtime = " (" + game.overtimes + "OT)";
                    } else {
                        overtime = "";
                    }

                    // Check tid
                    if (game.teams[0].tid === g.userTid || game.teams[1].tid === g.userTid) {
                        completed.push({
                            gid: game.gid,
                            overtime: overtime
                        });

                        i = completed.length - 1;
                        if (game.teams[0].tid === g.userTid) {
                            completed[i].home = true;
                            completed[i].pts = game.teams[0].pts;
                            completed[i].oppPts = game.teams[1].pts;
                            completed[i].oppTid = game.teams[1].tid;
                            completed[i].oppAbbrev = g.teamAbbrevsCache[game.teams[1].tid];
                            completed[i].won = game.teams[0].pts > game.teams[1].pts;
                        } else if (game.teams[1].tid === g.userTid) {
                            completed[i].home = false;
                            completed[i].pts = game.teams[1].pts;
                            completed[i].oppPts = game.teams[0].pts;
                            completed[i].oppTid = game.teams[0].tid;
                            completed[i].oppAbbrev = g.teamAbbrevsCache[game.teams[0].tid];
                            completed[i].won = game.teams[1].pts > game.teams[0].pts;
                       }

                        completed[i] = helpers.formatCompletedGame(completed[i]);
                    }
                }
            }).then(function () {
                vm.completed(completed);
            });
        }
    }

    function updateSchedule(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
            return season.getSchedule().then(function (schedule_) {
                var game, games, i, numShowUpcoming, row, team0, team1;

                games = [];
                numShowUpcoming = 3;
                for (i = 0; i < schedule_.length; i++) {
                    game = schedule_[i];
                    if (g.userTid === game.homeTid || g.userTid === game.awayTid) {
                        team0 = {tid: game.homeTid, abbrev: g.teamAbbrevsCache[game.homeTid], region: g.teamRegionsCache[game.homeTid], name: g.teamNamesCache[game.homeTid]};
                        team1 = {tid: game.awayTid, abbrev: g.teamAbbrevsCache[game.awayTid], region: g.teamRegionsCache[game.awayTid], name: g.teamNamesCache[game.awayTid]};
                        if (g.userTid === game.homeTid) {
                            row = {teams: [team1, team0], vsat: "at"};
                        } else {
                            row = {teams: [team1, team0], vsat: "at"};
                        }
                        games.push(row);
                    }

                    if (games.length >= numShowUpcoming) {
                        break;
                    }
                }
                vm.upcoming(games);
            });
        }
    }

    function updatePlayers(inputs, updateEvents) {
        var vars;

        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
            vars = {};

            return dao.players.getAll({
                index: "tid",
                key: IDBKeyRange.lowerBound(g.PLAYER.UNDRAFTED),
                statsSeasons: [g.season]
            }).then(function (players) {
                var i, stats, userPlayers;

                players = player.filter(players, {
                    attrs: ["pid", "name", "abbrev", "tid", "age", "contract", "rosterOrder", "injury", "watch", "pos","offDefK"],
                    ratings: ["ovr", "pot", "dovr", "dpot", "skills"],
                    stats: ["gp", "min", "pts", "fg", "ast", "plusminus","sfga","sfg","sfgs","sfgsp", "yearsWithTeam"],
                    season: g.season,
                    showNoStats: true,
                    showRookies: true,
                    fuzz: true
                });

                // League leaders
                vars.leagueLeaders = {};
                stats = ["pts", "fg", "ast"]; // Categories for leaders
                for (i = 0; i < stats.length; i++) {
                    players.sort(function (a, b) { return b.stats[stats[i]] - a.stats[stats[i]]; });
                    vars.leagueLeaders[stats[i]] = {
                        pid: players[0].pid,
                        name: players[0].name,
                        abbrev: players[0].abbrev,
                        stat: players[0].stats[stats[i]]
                    };
                }

                // Team leaders
                userPlayers = _.filter(players, function (p) { return p.tid === g.userTid; });
                vars.teamLeaders = {};
                for (i = 0; i < stats.length; i++) {
                    if (userPlayers.length > 0) {
                        userPlayers.sort(function (a, b) { return b.stats[stats[i]] - a.stats[stats[i]]; });
                        vars.teamLeaders[stats[i]] = {
                            pid: userPlayers[0].pid,
                            name: userPlayers[0].name,
                            stat: userPlayers[0].stats[stats[i]]
                        };
                    } else {
                        vars.teamLeaders[stats[i]] = {
                            pid: 0,
                            name: "",
                            stat: 0
                        };
                    }
                }

                // Roster
                // Find starting 5
                vars.starters = userPlayers.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; }).slice(0, 5);
                vars.goalie = userPlayers.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; }).slice(5, 6);

				
		    var offenseCount, defenseCount;
				
					offenseCount = 0;
					defenseCount = 0;

					
					for (i = 0; i < userPlayers.length; i++) {
						//console.log("userPlayers[i].offDefK: "+userPlayers[i].offDefK);
						if ((userPlayers[i].offDefK=="off") && (offenseCount < 5)) {
							vars.starters[offenseCount] = userPlayers[i];
							offenseCount += 1;
					//		console.log("offense");
						} else if ( (userPlayers[i].offDefK=="def") && (defenseCount < 1)) {
							vars.goalie[defenseCount] = userPlayers[i];
							defenseCount += 1;				
						//	console.log("goalie");
						
						}							
					}				
				
				
                 return vars;
            });
        }
    }

    function updatePlayoffs(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || (g.phase >= g.PHASE.PLAYOFFS && updateEvents.indexOf("gameSim") >= 0) || (updateEvents.indexOf("newPhase") >= 0 && g.phase === g.PHASE.PLAYOFFS)) {

           return dao.playoffSeries.get({key: g.season}).then(function (playoffSeries) {
                var found, i, rnd, series, vars;

                vars = {
                    showPlayoffSeries: false
                };

                if (playoffSeries !== undefined) {
                    series = playoffSeries.series;
                    found = false;

                    // Find the latest playoff series with the user's team in it
                    for (rnd = playoffSeries.currentRound; rnd >= 0; rnd--) {
                        for (i = 0; i < series[rnd].length; i++) {
                            if (series[rnd][i].home.tid === g.userTid || series[rnd][i].away.tid === g.userTid) {
                                vars.series = [[series[rnd][i]]];
                                found = true;
                                vars.showPlayoffSeries = true;
                                if (rnd === 0) {
                                    vars.seriesTitle = "First Round";
                                } else if (rnd === 1) {
                                    vars.seriesTitle = "Second Round";
                                } else if (rnd === 2) {
                                    vars.seriesTitle = "Conference Finals";
                                } else if (rnd === 3) {
                                    vars.seriesTitle = "League Finals";
                                }
                                 // Update here rather than by returning vars because returning vars doesn't guarantee order of updates, so it can cause an error when showPlayoffSeries is true before the other stuff is set (try it with the same league in two tabs). But otherwise (for normal page loads), this isn't sufficient and we need to return vars. I don't understand, but it works.
                                if (updateEvents.indexOf("dbChange") >= 0) {
                                    komapping.fromJS({series: vars.series, seriesTitle: vars.seriesTitle}, vm);
                                }
                                break;
                            }
                        }
                        if (found) {
                            break;
                        }
                    }
                }

                return vars;
            });
        }
    }

    function updateStandings(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0) {
            return team.filter({
                attrs: ["tid", "cid","did", "abbrev", "region"],
                seasonAttrs: ["won", "lost","winp","points","overtime"],
                season: g.season,
                sortBy: ["points","winp", "-lost", "won"]
            }).then(function (teams) {
                var cid, confTeams, i, k, l;

                // Find user's conference
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].tid === g.userTid) {
                        cid = teams[i].cid;
                        break;
                    }
                }
				
				
				if (g.leagueType == 1) {
				
					var confRanks, confTeams, divTeams, i, j, k, l;

				//	confs = [];
					
					confRanks = [];
					confTeams = [];
					l = 0;
					for (k = 0; k < teams.length; k++) {
						if (cid === teams[k].cid) {
							confRanks[teams[k].tid] = l + 1; // Store ranks by tid, for use in division standings
							confTeams.push(helpers.deepCopy(teams[k]));
							confTeams[l].rank = l + 1;
							if (l === 0) {
								confTeams[l].gb = 0;
							} else {
								confTeams[l].gb = helpers.gb(confTeams[0], confTeams[l]);
							}
							if (confTeams[l].tid === g.userTid) {
								confTeams[l].highlight = true;
							} else {
								confTeams[l].highlight = false;
							}
							l += 1;
						}
					}

				/*	confs.push({name: g.confs[i].name, divs: [], teams: confTeams});

					for (j = 0; j < g.divs.length; j++) {
						if (g.divs[j].cid === g.confs[i].cid) {
							divTeams = [];
							l = 0;
							for (k = 0; k < teams.length; k++) {
								if (g.divs[j].did === teams[k].did) {
									divTeams.push(helpers.deepCopy(teams[k]));
									if (l === 0) {
										divTeams[l].gb = 0;
									} else {
										divTeams[l].gb = helpers.gb(divTeams[0], divTeams[l]);
									}
									divTeams[l].confRank = confRanks[divTeams[l].tid];
									if (divTeams[l].tid === g.userTid) {
										divTeams[l].highlight = true;
									} else {
										divTeams[l].highlight = false;
									}
									l += 1;
								}
							}

							confs[i].divs.push({name: g.divs[j].name, teams: divTeams});
						}
					}*/
						
				
				} else {
				
					var divTeamRank;
					var divCurrentRank;
					var j;
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
					
					confTeams = [];
					l = 0;
					for (k = 0; k < teams.length; k++) {
						if (cid === teams[k].cid) {
						   if (divTeamRank[k] <4) {					
								confTeams.push(helpers.deepCopy(teams[k]));
								confTeams[l].rank = l + 1;
								if (l === 0) {
									confTeams[l].gb = 0;
								} else {
									confTeams[l].gb = helpers.gb(confTeams[0], confTeams[l]);
								}
								if (confTeams[l].tid === g.userTid) {
									confTeams[l].highlight = true;
								} else {
									confTeams[l].highlight = false;
								}
								
								l += 1;
							}
						}
					}
					
					//// dashboard and standings different?
					//// confTeams, make sure correct and dashboard is printing same thing
					for (k = 0; k < teams.length; k++) {
						if (cid === teams[k].cid) {
						   if (divTeamRank[k] >3) {
								confTeams.push(helpers.deepCopy(teams[k]));
								confTeams[l].rank = l + 1;
								if (l === 0) {
									confTeams[l].gb = 0;
								} else {
									confTeams[l].gb = helpers.gb(confTeams[0], confTeams[l]);
								}
								if (confTeams[l].tid === g.userTid) {
									confTeams[l].highlight = true;
								} else {
									confTeams[l].highlight = false;
								}
								
								l += 1;
							}
						}
					}				

				}
				
                return {
                    confTeams: confTeams
                };
            });
        }
    }

    function uiFirst() {
        ui.title("Dashboard");
    }

    return bbgmView.init({
        id: "leagueDashboard",
        InitViewModel: InitViewModel,
        runBefore: [updateInbox, updateTeam, updatePayroll, updateTeams, updateGames, updateSchedule, updatePlayers, updatePlayoffs, updateStandings],
        uiFirst: uiFirst
    });
});