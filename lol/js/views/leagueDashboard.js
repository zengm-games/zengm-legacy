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
				var LCS,LCSLadder,LCK,LPL,LMS,Worlds;
                latestSeason = t.seasons[t.seasons.length - 1];

				LCS = false;
				LCSLadder = false;
				LCK = false;
				LPL = false;
				LMS = false;
				Worlds = false;

				if (g.gameType == 0 ) {
					LCS = true;
				} else if (g.gameType == 1) {
					LCSLadder = true;
				} else if (g.gameType == 2) {
					LCK = true;
				} else if (g.gameType == 3) {
					LPL = true;
				} else if (g.gameType == 4) {
					LMS = true;
				} else {
					Worlds = true;
				}
                return {
                    region: t.region,
                    name: t.name,
                    abbrev: t.abbrev,
                    won: latestSeason.won,
                    lost: latestSeason.lost,
                    cash: latestSeason.cash / 1000,  // [millions of dollars]
                    salaryCap: g.salaryCap / 1000,  // [millions of dollars]
                    season: g.season,
					LCS: LCS,
					LCSLadder: LCSLadder,
					LCK: LCK,
					LPL: LPL,
					LMS: LMS,
					Worlds: Worlds,
                    playoffRoundsWon: latestSeason.playoffRoundsWon
                };
            });
        }
    }

    function updatePayroll(inputs, updateEvents) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("playerMovement") >= 0) {
            return team.getPayroll(null, g.userTid).get(0).then(function (payroll) {
                return {
                    payroll: payroll  // [millions of dollars]
                };
            });
        }
    }


    function updateTeams(inputs, updateEvents) {
        var stats, vars;

        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
            vars = {};
            stats = ["pts", "oppPts", "trb", "ast","fg","fga","fgp","tp","kda"];  // This is also used later to find ranks for these team stats

            return team.filter({
                attrs: ["tid", "cid"],
                seasonAttrs: ["won", "lost", "winp", "att", "revenue", "profit"],
                stats: stats,
                season: g.season,
                sortBy: ["winp", "-lost","won","kda"]
            }).then(function (teams) {
                var cid, i, j;

                cid = _.find(teams, function (t) { return t.tid === g.userTid; }).cid;

                vars.rank = 1;
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].cid === cid) {
                        if (teams[i].tid === g.userTid) {
                            vars.pts = teams[i].pts;
                            vars.oppPts = teams[i].oppPts;
                            vars.trb = teams[i].trb;
                            vars.ast = teams[i].ast;
                            vars.fg = teams[i].fg;
                            vars.fga = teams[i].fga;
                            vars.fgp = teams[i].fgp;
                            vars.tp = teams[i].tp;

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

				var numTeams;
				numTeams = 10;
				if (g.gameType == 0 && g.gameType == 2) {
				   numTeams = 10;
				} else if (g.gameType == 1) {
				   numTeams = 30;
				} else if (g.gameType == 3) {
				   numTeams = 12;
				} else if (g.gameType == 4) {
				   numTeams = 8;
				} else if (g.gameType == 5) {
				   numTeams = 57;
				}

                vars.oppPtsRank = numTeams+1 - vars.oppPtsRank;
                vars.fgaRank =  numTeams+1 - vars.fgaRank;

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
                            row = {teams: [team1, team0], vsat: "vs (B)"};
                        } else {
                            row = {teams: [team1, team0], vsat: "vs (B)"};
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
                    attrs: ["pid", "name","userID", "abbrev", "tid", "age", "contract", "rosterOrder", "injury", "watch", "pos","born"],
                    ratings: ["MMR","ovr", "pot", "dovr", "dpot", "skills"],
                    stats: ["gp", "min", "pts", "trb", "ast","tp","fg","fga","fgp", "per", "yearsWithTeam","kda"],
                    season: g.season,
                    showNoStats: true,
                    showRookies: true,
                    fuzz: true
                });

                // League leaders
                vars.leagueLeaders = {};
                stats = ["pts", "trb", "ast","fg","fga","fgp","tp"]; // Categories for leaders
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
//						players[i].name = players[i].name.split(" ")[0] + " '"+players[i].userID +"' " + players[i].name.split(" ")[1];

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


                return vars;
            });
        }
    }

    function updatePlayoffs(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || (g.phase >= g.PHASE.PLAYOFFS && updateEvents.indexOf("gameSim") >= 0) || (updateEvents.indexOf("newPhase") >= 0 && g.phase === g.PHASE.PLAYOFFS)) {
            return dao.playoffSeries.get({key: g.season}).then(function (playoffSeries) {
                var found, i, rnd, series, vars;
				var seriesStart,seriesEnd;

                vars = {
                    showPlayoffSeries: false
                };

                if (playoffSeries !== undefined) {
                    series = playoffSeries.series;
                    found = false;

                    // Find the latest playoff series with the user's team in it
                    for (rnd = playoffSeries.currentRound; rnd >= 0; rnd--) {


							if (rnd == 0) {
								if (g.gameType == 0) {
									seriesStart = 0;
									seriesEnd = 2;
								} else if (g.gameType == 1) {
									seriesStart = 0;
									seriesEnd = 9;
								} else if (g.gameType == 2) {
									seriesStart = 9;
									seriesEnd = 10;
								} else if (g.gameType == 3) {
									seriesStart = 10;
									seriesEnd = 11;
								} else if (g.gameType == 4) {
									seriesStart = 11;
									seriesEnd = 12;
								} else if (g.gameType == 5) {
				//					seriesStart = 12;
				//					seriesEnd = 24;
									seriesStart = 9;
									seriesEnd = 16;
								}
							} else if (rnd == 1) {
								if (g.gameType == 0) {
									seriesStart = 0;
									seriesEnd = 2;
								} else if (g.gameType == 1) {
									seriesStart = 0;
									seriesEnd = 7;
								} else if (g.gameType == 2) {
									seriesStart = 7;
									seriesEnd = 8;
								} else if (g.gameType == 3) {
									seriesStart = 8;
									seriesEnd = 9;
								} else if (g.gameType == 4) {
									seriesStart = 9;
									seriesEnd = 10;
								} else if (g.gameType == 5) {
									seriesStart = 7;
									seriesEnd = 13;
								}
							} else if (rnd == 2) {
								if (g.gameType == 0) {
									seriesStart = 0;
									seriesEnd = 2;
								} else if (g.gameType == 1) {
									seriesStart = 0;
									seriesEnd = 6;
								} else if (g.gameType == 2) {
									seriesStart = 6;
									seriesEnd = 7;
								} else if (g.gameType == 3) {
									seriesStart = 7;
									seriesEnd = 8;
								} else if (g.gameType == 4) {
									seriesStart = 8;
									seriesEnd = 9;
								} else if (g.gameType == 5) {
									seriesStart = 6;
									seriesEnd = 11;
								}
							} else if (rnd == 3) {
								if (g.gameType == 0) {
									seriesStart = 0;
									seriesEnd = 0;
								} else if (g.gameType == 1) {
									seriesStart = 0;
									seriesEnd = 1;
								} else if (g.gameType == 2) {
									seriesStart = 1;
									seriesEnd = 2;
								} else if (g.gameType == 3) {
									seriesStart = 2;
									seriesEnd = 4;
								} else if (g.gameType == 4) {
									seriesStart = 4;
									seriesEnd = 4;
								} else if (g.gameType == 5) {
									seriesStart = 1;
									seriesEnd = 4;
								}
							} else if (rnd == 4) {
								if (g.gameType == 0) {
									seriesStart = 0;
									seriesEnd = 0;
								} else if (g.gameType == 1) {
									seriesStart = 0;
									seriesEnd = 0;
								} else if (g.gameType == 2) {
									seriesStart = 0;
									seriesEnd = 0;
								} else if (g.gameType == 3) {
									seriesStart = 0;
									seriesEnd = 2;
								} else if (g.gameType == 4) {
									seriesStart = 2;
									seriesEnd = 2;
								} else if (g.gameType == 5) {
									seriesStart = 0;
									seriesEnd = 2;
								}
							} else if (rnd == 5) {
								if (g.gameType == 0) {
									seriesStart = 0;
									seriesEnd = 0;
								} else if (g.gameType == 1) {
									seriesStart = 0;
									seriesEnd = 0;
								} else if (g.gameType == 2) {
									seriesStart = 0;
									seriesEnd = 0;
								} else if (g.gameType == 3) {
									seriesStart = 0;
									seriesEnd = 2;
								} else if (g.gameType == 4) {
									seriesStart = 2;
									seriesEnd = 2;
								} else if (g.gameType == 5) {
									seriesStart = 0;
									seriesEnd = 2;
								}
							} else if (rnd == 6) {
								if (g.gameType == 5) {
									seriesStart = 0;
									seriesEnd = 10;
				//					seriesEnd = 6;
								}
							} else if (rnd == 7) {
								if (g.gameType == 5) {
									seriesStart = 0;
									seriesEnd = 5;
								}
							} else if (rnd == 8) {
								if (g.gameType == 5) {
									seriesStart = 0;
									seriesEnd = 8;
								}
							} else if (rnd == 9) {
								if (g.gameType == 5) {
									seriesStart = 0;
									seriesEnd = 4;
								}
							} else if (rnd == 10) {
								if (g.gameType == 5) {
									seriesStart = 0;
									seriesEnd = 2;
								}
							} else if (rnd == 11) {
								if (g.gameType == 5) {
									seriesStart = 0;
									seriesEnd = 1;
								}
							}

//                        for (i = 0; i < series[rnd].length; i++) {
                        for (i = seriesStart; i < seriesEnd; i++) {
                            if (series[rnd][i].home.tid === g.userTid || series[rnd][i].away.tid === g.userTid) {
                                vars.series = [[series[rnd][i]]];
                                found = true;
                                vars.showPlayoffSeries = true;

								if (g.gameType == 0) {
									if (rnd === 0) {
										vars.seriesTitle = "First Round";
									} else if (rnd === 1) {
										vars.seriesTitle = "Second Round";
									} else if (rnd === 2) {
										vars.seriesTitle = "Conference Finals";
									} else if (rnd === 3) {
										vars.seriesTitle = "League Finals";
									}
								} else if ((g.gameType == 1) || (g.gameType == 5)) {

									if ( ((rnd==9) && (i<4)) || ((rnd==0) && (i>10) && (i<14)) || ((rnd==0)  && (i<2))  || ((rnd==1)  && (i==7)) || ((rnd==3) && (i>1) && (i<4)) ){
										vars.seriesTitle = "Quarterfinals";
									} else if ( ((rnd==1) && (i>8) && (i<12)) || ( (rnd==1) && (i<2) )  || ( (rnd==2) && (i==6) )  || ( (rnd==4) && (i<2) ) ||  ((rnd==0) && (i>13) && (i<16)) ||  ((rnd==6) && (i<10)) ||  ((rnd==10) && (i<2))  ) {
										vars.seriesTitle = "Semifinals";
									} else if ( ((rnd==2) && (i<1)) ||   ((rnd==2) && (i==8)) ||   ((rnd==2) && (i==9)) || ((rnd==3) && (i==1)) || ((rnd==5) && (i==0))  || ((rnd==1) && (i==2))  || ((rnd==2) && (i>3) && (i<6)) || ((rnd==1) && (i==12))  || ((rnd==7) && (i==0))  || ((rnd==7) && (i==4))  || ((rnd==11) && (i==0))  )  {
										vars.seriesTitle = "Finals";
									} else if ( ( (rnd==2) && (i==10)) || ((rnd==2) && (i==1)) || ((rnd==5) && (i==1))  || ((rnd==1) && (i==3))  )  {
										vars.seriesTitle = "3rd Place Game";
									} else if ( (rnd==8) && (i<8) )  {
										vars.seriesTitle = "Groups";
									} else if ( ((rnd==0) && (i==10) || ((rnd==0) && (i<9) && (i>3))  )  )  {
										vars.seriesTitle = "Round 1";
									} else if ( ((rnd==1) && (i==8))  || ((rnd==1) && (i<7) && (i>3)) )  {
										vars.seriesTitle = "Round 2";
									} else if (((rnd==0) && (i==2)) || ((rnd==0) && (i==3))   )  {
										vars.seriesTitle = "First Round";
									} else if ( ((rnd==2) && (i==7)) )  {
										vars.seriesTitle = "Seeding Match";
									} else if (  (rnd==0) && (i==9) )  {
										vars.seriesTitle = "Wild Card";
									} else if (  (rnd==2) && (i>1) && (i<4))  {
										vars.seriesTitle = "Promotion";
									}


								} else if (g.gameType == 2) {
									if (rnd === 0) {
										vars.seriesTitle = "Wild Card";
									} else if (rnd === 1) {
										vars.seriesTitle = "Quarterfinals";
									} else if (rnd === 2) {
										vars.seriesTitle = "Semifinals";
									} else if (rnd === 3) {
										vars.seriesTitle = "League Finals";
									}
								} else if (g.gameType == 3) {
									if (rnd === 0) {
										vars.seriesTitle = "First Round";
									} else if (rnd === 1) {
										vars.seriesTitle = "Second Round";
									} else if (rnd === 2) {
										vars.seriesTitle = "Seeding Match";
									} else if (rnd === 3) {
										vars.seriesTitle = "Quarterfinals";
									} else if (rnd === 4) {
										vars.seriesTitle = "Semifinals";
									} else if (rnd === 5) {
										vars.seriesTitle = "League Finals";
									}
								} else if (g.gameType == 4) {
									if (rnd === 0) {
										vars.seriesTitle = "Quarterfinals";
									} else if (rnd === 1) {
										vars.seriesTitle = "Semifinals";
									} else if (rnd === 2) {
										vars.seriesTitle = "League Finals";
									}
								} else if (g.gameType == 5) {
									if (rnd < 6) {
										vars.seriesTitle = "Conference Playoffs";
									} else if (rnd < 8) {
										vars.seriesTitle = "Regionals";
									} else if (rnd === 8) {
										vars.seriesTitle = "Groups";
									} else if (rnd === 9) {
										vars.seriesTitle = "Worlds Quarterfinals";
									} else if (rnd === 10) {
										vars.seriesTitle = "Worlds Semifinals";
									} else if (rnd === 11) {
										vars.seriesTitle = "Worlds Finals";
									}
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

    function updateStandings(inputs, updateEvents) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0) {
            return team.filter({
                attrs: ["tid", "cid", "abbrev", "region","name"],
                seasonAttrs: ["won", "lost", "winp","cidStart"],
                stats: ["kda","fg","fga","fgp"],
                season: g.season,
                sortBy: ["winp", "-lost", "won","kda"]
            }).then(function (teams) {
                var cid, confTeams, i, k, l;
				var typeCutoff;


               // Find user's conference
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].tid === g.userTid) {
//                        cid = teams[i].cid;
                        cid = teams[i].cidStart;
                        break;
                    }
                }
				typeCutoff = 7;
				if (g.gameType == 0) {
					typeCutoff = 6;
				} else if (g.gameType == 1) {
					if (cid == 0) {
						typeCutoff = 5;
					} else if (cid == 1) {
						typeCutoff = 3;
					} else {
						typeCutoff = 9;
					}
				} else if (g.gameType == 2) {
					typeCutoff = 4;
				} else if (g.gameType == 3) {
					typeCutoff = 7;
				} else if (g.gameType == 4) {
					typeCutoff = 3;
				} else {
					if (cid == 0) {
						typeCutoff = 5;
					} else if (cid == 1) {
						typeCutoff = 5;
					} else if (cid == 2) {
						typeCutoff = 4;
					} else if (cid == 3) {
						typeCutoff = 7;
					} else if (cid == 4) {
						typeCutoff = 3;
					} else {
						typeCutoff = 3;
					}
				}




                confTeams = [];
                l = 0;
                for (k = 0; k < teams.length; k++) {
//                    if (cid === teams[k].cid) {
                    if (cid === teams[k].cidStart) {
                        confTeams.push(helpers.deepCopy(teams[k]));
                        confTeams[l].rank = l + 1;
                        if (l === 0) {
                            confTeams[l].gb = 0;
                        } else {
                            confTeams[l].gb = helpers.gb(confTeams[0], confTeams[l]);
                        }
						confTeams[l].confCutoff = typeCutoff;
                        if (confTeams[l].tid === g.userTid) {
                            confTeams[l].highlight = true;
                        } else {
                            confTeams[l].highlight = false;
                        }
                        l += 1;
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
