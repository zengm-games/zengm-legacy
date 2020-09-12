/**
 * @name views.leagueDashboard
 * @namespace League dashboard, displaying several bits of information about the league/team.
 */
define(["db", "globals", "ui", "core/player", "core/season", "core/team", "lib/jquery", "lib/knockout", "lib/knockout.mapping", "lib/underscore", "util/bbgmView", "util/helpers", "util/viewHelpers"], function(db, g, ui, player, season, team, $, ko, mapping, _, bbgmView, helpers, viewHelpers) {
	"use strict";

	function InitViewModel() {
		this.completed = ko.observableArray([]);
		this.upcoming = ko.observableArray([]);
	}

	function updateInbox(inputs, updateEvents) {
		var deferred, vars;

		deferred = $.Deferred();
		vars = {};

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0) {
			g.dbl.transaction("messages").objectStore("messages").getAll().onsuccess = function(event) {
				var i, messages;

				messages = event.target.result;
				messages.reverse();

				for ( i = 0; i < messages.length; i++) {
					delete messages[i].text;
				}
				messages = messages.slice(0, 2);

				vars = {
					messages : messages
				};

				deferred.resolve(vars);
			};

			return deferred.promise();
		}
	}

	function updateTeam(inputs, updateEvents) {
		var deferred, vars;

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
			deferred = $.Deferred();
			vars = {};

			g.dbl.transaction("teams").objectStore("teams").get(g.userTid).onsuccess = function(event) {
				var i, userTeam, userTeamSeason;

				userTeam = event.target.result;
				userTeamSeason = _.last(userTeam.seasons);

				vars.region = userTeam.region;
				vars.name = userTeam.name;
				vars.abbrev = userTeam.abbrev;
				vars.won = userTeamSeason.won;
				vars.lost = userTeamSeason.lost;
				vars.cash = userTeamSeason.cash / 1000;
				// [millions of dollars]
				vars.salaryCap = g.salaryCap / 1000;
				// [millions of dollars]
				vars.season = g.season;
				vars.playoffRoundsWon = userTeamSeason.playoffRoundsWon;

				deferred.resolve(vars);
			};
			return deferred.promise();
		}
	}

	function updatePayroll(inputs, updateEvents) {
		var deferred, vars;

		deferred = $.Deferred();
		vars = {};

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("playerMovement") >= 0) {
			db.getPayroll(null, g.userTid, function(payroll) {
				vars.payroll = payroll / 1000;
				// [millions of dollars]

				deferred.resolve(vars);
			});
			return deferred.promise();
		}
	}

	function updateTeams(inputs, updateEvents) {
		var deferred, stats, vars;

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
			deferred = $.Deferred();
			vars = {};

			stats = ["pts", "oppPts", "trb", "ast", "blk", "fgAtRim", "pf", "trb", "fgaMidRange", "qbr", "stl", "drb", "orb", "olr", "fgpAtRim", "fgaMidRange", "derpa", "der", "dep", "derpatp", "ty", "oppty"];
			// This is also used later to find ranks for these team stats
			team.filter({
				attrs : ["tid", "cid"],
				seasonAttrs : ["won", "lost", "winp", "streakLong", "att", "revenue", "profit"],
				stats : stats,
				season : g.season,
				sortBy : ["winp", "-lost", "won"]
			}, function(teams) {
				var cid, i, j, ranks;

				cid = _.find(teams, function(t) {
					return t.tid === g.userTid;
				}).cid;

				vars.rank = 1;
				for ( i = 0; i < teams.length; i++) {
					if (teams[i].cid === cid) {
						if (teams[i].tid === g.userTid) {
							vars.pts = teams[i].pts;
							vars.oppPts = teams[i].oppPts;
							vars.ty = teams[i].ty;
							vars.oppty = teams[i].oppty;
							vars.ast = teams[i].ast;
							vars.blk = teams[i].blk;
							vars.fgAtRim = teams[i].fgAtRim;
							vars.pf = teams[i].pf;
							vars.trb = teams[i].trb;
							vars.wOBA = teams[i].wOBA;
							vars.fgaMidRange = teams[i].fgaMidRange;
							vars.war = teams[i].war;

							vars.streakLong = teams[i].streakLong;
							vars.att = teams[i].att;
							vars.revenue = teams[i].revenue;
							vars.profit = teams[i].profit;
							break;
						} else {
							vars.rank += 1;
						}
					}
				}

				for ( i = 0; i < stats.length; i++) {
					//   if ((stats[i] == "pf") || (stats[i] == "fgaMidRange")  ) {
					//		teams.sort(function (a, b) { return a[stats[i]] - b[stats[i]]; });
					//	} else {
					teams.sort(function(a, b) {
						return b[stats[i]] - a[stats[i]];
					});
					//	}
					for ( j = 0; j < teams.length; j++) {
						if (teams[j].tid === g.userTid) {
							vars[stats[i] + "Rank"] = j + 1;
							break;
						}
					}
				}
				vars.oppPtsRank = 17 - vars.oppPtsRank;
				vars.opptyRank = 17 - vars.opptyRank;

				deferred.resolve(vars);
			});
			return deferred.promise();
		}
	}

	/*
	 function updateTeams(inputs, updateEvents) {
	 var deferred, stats, vars;

	 if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0 || (updateEvents.indexOf("newPhase") >= 0 && g.phase === g.PHASE.PRESEASON)) {
	 deferred = $.Deferred();
	 vars = {};

	 stats = ["pts", "oppPts", "trb", "ast"];  // This is also used later to find ranks for these team stats
	 team.filter({
	 attrs: ["tid", "cid"],
	 seasonAttrs: ["won", "lost", "winp", "att", "revenue", "profit"],
	 stats: stats,
	 season: g.season,
	 sortBy: ["winp", "-lost", "won"]
	 }, function (teams) {
	 var cid, i, j, ranks;

	 cid = _.find(teams, function (t) { return t.tid === g.userTid; }).cid;

	 vars.rank = 1;
	 for (i = 0; i < teams.length; i++) {
	 if (teams[i].cid === cid) {
	 if (teams[i].tid === g.userTid) {
	 vars.pts = teams[i].pts;
	 vars.oppPts = teams[i].oppPts;
	 vars.trb = teams[i].trb;
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

	 deferred.resolve(vars);
	 });
	 return deferred.promise();
	 }
	 }
	 */
	function updateGames(inputs, updateEvents, vm) {
		var deferred, numShowCompleted, vars;

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
			deferred = $.Deferred();
			vars = {};

			numShowCompleted = 4;
			vars.completed = [];
			// This could be made much faster by using a compound index to search for season + team, but that's not supported by IE 10
			g.dbl.transaction("games").objectStore("games").index("season").openCursor(g.season, "prev").onsuccess = function(event) {
				var cursor, game, i, overtime;

				cursor = event.target.result;
				if (cursor && vars.completed.length < numShowCompleted) {
					game = cursor.value;

					if (game.overtimes === 1) {
						overtime = " (OT)";
					} else if (game.overtimes > 1) {
						overtime = " (" + game.overtimes + " OT)";
					} else {
						overtime = "";
					}

					// Check tid
					if (game.teams[0].tid === g.userTid || game.teams[1].tid === g.userTid) {
						vars.completed.push({
							gid : game.gid,
							overtime : overtime
						});

						i = vars.completed.length - 1;
						if (game.teams[0].tid === g.userTid) {
							vars.completed[i].home = true;
							vars.completed[i].pts = game.teams[0].pts;
							vars.completed[i].oppPts = game.teams[1].pts;
							vars.completed[i].oppTid = game.teams[1].tid;
							vars.completed[i].oppAbbrev = g.teamAbbrevsCache[game.teams[1].tid];
							vars.completed[i].won = game.teams[0].pts > game.teams[1].pts;
						} else if (game.teams[1].tid === g.userTid) {
							vars.completed[i].home = false;
							vars.completed[i].pts = game.teams[1].pts;
							vars.completed[i].oppPts = game.teams[0].pts;
							vars.completed[i].oppTid = game.teams[0].tid;
							vars.completed[i].oppAbbrev = g.teamAbbrevsCache[game.teams[0].tid];
							vars.completed[i].won = game.teams[1].pts > game.teams[0].pts;
						}

						vars.completed[i] = helpers.formatCompletedGame(vars.completed[i]);
					}

					cursor.continue();
				} else {
					vm.completed(vars.completed);
					deferred.resolve();
				}
			};
			return deferred.promise();
		}
	}

	function updateSchedule(inputs, updateEvents, vm) {
		var deferred, vars;

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
			deferred = $.Deferred();
			vars = {};

			season.getSchedule(null, 0, function(schedule_) {
				var game, games, i, numShowUpcoming, row, team0, team1;

				games = [];
				numShowUpcoming = 3;
				for ( i = 0; i < schedule_.length; i++) {
					game = schedule_[i];
					if (g.userTid === game.homeTid || g.userTid === game.awayTid) {
						team0 = {
							tid : game.homeTid,
							abbrev : g.teamAbbrevsCache[game.homeTid],
							region : g.teamRegionsCache[game.homeTid],
							name : g.teamNamesCache[game.homeTid]
						};
						team1 = {
							tid : game.awayTid,
							abbrev : g.teamAbbrevsCache[game.awayTid],
							region : g.teamRegionsCache[game.awayTid],
							name : g.teamNamesCache[game.awayTid]
						};
						if (g.userTid === game.homeTid) {
							row = {
								teams : [team1, team0],
								vsat : "at"
							};
						} else {
							row = {
								teams : [team1, team0],
								vsat : "at"
							};
						}
						games.push(row);
					}

					if (games.length >= numShowUpcoming) {
						break;
					}
				}
				vm.upcoming(games);
				deferred.resolve();
			});

			return deferred.promise();
		}
	}

	function updatePlayers(inputs, updateEvents) {
		var deferred, vars;

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0 || updateEvents.indexOf("newPhase") >= 0) {
			deferred = $.Deferred();
			vars = {};

			g.dbl.transaction("players").objectStore("players").index("tid").getAll(IDBKeyRange.lowerBound(g.PLAYER.RETIRED, true)).onsuccess = function(event) {
				var i, players, stats, userPlayers;

				stats = ["pts", "trb", "ast", "blk", "stl", "pf", "trb", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgaMidRange", "fta", "winP", "lossP", "fga", "tp", "ast", "tov", "fgMidRange", "qbr", "stl", "drb", "orb", "olr", "fgpAtRim", "derpa", "der", "dep", "derpatp", "fg", "fga", "fgp", "pya", "ruya", "reyc", "olp", "inter", "intery", "dec", "ft", "pf", "yearsWithTeam"];
				// This is also used later to find team/league leaders for these player stats
				players = player.filter(event.target.result, {
					attrs : ["pid", "name", "abbrev", "tid", "age", "contract", "rosterOrder", "injury", "watch", "pos", "energy", "active", "offDefK"],
					ratings : ["ovr", "pot", "dovr", "dpot", "skills"],
					//stats: ["gp", "min", "pts", "trb", "ast", "per"],
					//                    stats: ["pts", "trb", "ast","blk","stl","pf","trb","wOBA","fgAtRim","fgaMidRange","war","fta","winP","save","fga"],
					stats : stats,

					season : g.season,
					showNoStats : true,
					showRookies : true,
					fuzz : true
				});

				// League leaders
				vars.leagueLeaders = {};
				for ( i = 0; i < stats.length; i++) {
					/*    if ((stats[i] == "pf") || (stats[i] == "fgaMidRange")) {
					 players.sort(function (a, b) { return a.stats[stats[i]] - b.stats[stats[i]] + b.stats["fta"]*.001 - a.stats["fta"]*.001 ; });
					 } else if ((stats[i] == "trb") || (stats[i] == "wOBA")) {
					 players.sort(function (a, b) { return b.stats[stats[i]]*b.stats["fga"] - a.stats[stats[i]]*a.stats["fga"]; });
					 } else {*/
					players.sort(function(a, b) {
						return b.stats[stats[i]] - a.stats[stats[i]];
					});
					//}
					vars.leagueLeaders[stats[i]] = {
						pid : players[0].pid,
						name : players[0].name,
						abbrev : players[0].abbrev,
						stat : players[0].stats[stats[i]]
					};
				}
				/*    vars.leagueLeaders = {};
				stats = ["pts", "trb", "ast"]; // Categories for leaders
				for (i = 0; i < stats.length; i++) {
				players.sort(function (a, b) { return b.stats[stats[i]] - a.stats[stats[i]]; });
				vars.leagueLeaders[stats[i]] = {
				pid: players[0].pid,
				name: players[0].name,
				abbrev: players[0].abbrev,
				stat: players[0].stats[stats[i]]
				};
				}*/

				// Team leaders
				userPlayers = _.filter(players, function(p) {
					return p.tid === g.userTid;
				});
				vars.teamLeaders = {};
				for ( i = 0; i < stats.length; i++) {
					if (userPlayers.length > 0) {
						//						if ((stats[i] == "pf") || (stats[i] == "fgaMidRange") ){
						/*	if ((stats[i] == "fgAtRim") ){
						 //							userPlayers.sort(function (a, b) { return a.stats[stats[i]] - b.stats[stats[i]] + b.stats["fta"]*.001 - a.stats["fta"]*.001; });
						 userPlayers.sort(function (a, b) { return b.stats[stats[i]]*b.stats["fta"] - a.stats[stats[i]]*a.stats["fta"]; });
						 } else if ((stats[i] == "trb") || (stats[i] == "wOBA")) {
						 userPlayers.sort(function (a, b) { return b.stats[stats[i]]*b.stats["fga"] - a.stats[stats[i]]*a.stats["fga"]; });
						 } else {*/
						userPlayers.sort(function(a, b) {
							return b.stats[stats[i]] - a.stats[stats[i]];
						});
						//}

						vars.teamLeaders[stats[i]] = {
							pid : userPlayers[0].pid,
							name : userPlayers[0].name,
							stat : userPlayers[0].stats[stats[i]]
						};
					} else {
						vars.teamLeaders[stats[i]] = {
							pid : 0,
							name : "",
							stat : 0
						};
					}
				}

				/*                userPlayers = _.filter(players, function (p) { return p.tid === g.userTid; });
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
				}*/

				// Roster
				// Find starting 5
				//                vars.starters = userPlayers.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; }).slice(0, 5);
				//                vars.lineup = userPlayers.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; }).slice(0, 11);

				vars.lineup = userPlayers.sort(function(a, b) {
					return a.rosterOrder - b.rosterOrder;
				}).slice(0, 8);
				vars.starters = userPlayers.sort(function(a, b) {
					return a.rosterOrder - b.rosterOrder;
				}).slice(8, 17);
				////      console.log(vars.lineup);
				//      console.log(vars.starters);
				/*      console.log("before");
				console.log(vars.lineup[0]);
				console.log(vars.lineup[1]);
				console.log(vars.lineup[2]);
				console.log(vars.lineup[3]);
				console.log(vars.lineup[4]);
				console.log(vars.lineup[5]);
				console.log(vars.lineup[6]);
				console.log(vars.lineup[7]);
				console.log(vars.lineup[8]);
				console.log(vars.lineup[9]);
				console.log(vars.lineup[10]);
				//	vars.lineup[0] = userPlayers[10];
				//    console.log(vars.lineup[0]);
				console.log("userplayer");

				console.log( userPlayers[0]);
				console.log( userPlayers[1]);
				console.log( userPlayers[2]);
				console.log( userPlayers[3]);
				console.log( userPlayers[4]);
				console.log( userPlayers[5]);*/

				var
				offenseCount, defenseCount, kickerCount;
				//	vars.lineup = {};
				//	vars.starters = {};

				offenseCount = 0;
				defenseCount = 0;
				kickerCount = 0;
				/*dBenchCount = 0;
				 oBenchCount = 0;
				 kBenchCount = 0;
				 oInactiveCount = 0;
				 dInactiveCount = 0;
				 kInactiveCount = 0;*/

				for ( i = 0; i < userPlayers.length; i++) {

					if (userPlayers[i].active && (userPlayers[i].offDefK == "off") && (offenseCount < 8)) {
						//		offenseArray[offenseCount] = userPlayers[i];
						//this.playersOnCourt[teamPlayer][offenseCount] = i
						vars.lineup[offenseCount] = userPlayers[i];
						offenseCount += 1;
						//		console.log("i: "+i+" offenseCount: "+offenseCount);
					} else if (userPlayers[i].active && (userPlayers[i].offDefK == "def") && (defenseCount < 8)) {
						//	defenseArray[defenseCount] = userPlayers[i];
						vars.starters[defenseCount] = userPlayers[i];
						defenseCount += 1;
						//this.playersOnCourt[teamPlayer][defenseCount+10] = i
						//		console.log("i: "+i+" defenseCount: "+defenseCount);

					} else if (userPlayers[i].active && (userPlayers[i].offDefK == "k") && (kickerCount < 1)) {
						//	kickerArray[kickerCount] = userPlayers[i];
						kickerCount += 1;
						vars.starters[defenseCount + kickerCount] = userPlayers[i];

					}
				}

				/*        console.log("after");

				console.log(vars.lineup[0]);
				console.log(vars.lineup[1]);
				console.log(vars.lineup[2]);
				console.log(vars.lineup[3]);
				console.log(vars.lineup[4]);
				console.log(vars.lineup[5]);
				console.log(vars.lineup[6]);
				console.log(vars.lineup[7]);
				console.log(vars.lineup[8]);
				console.log(vars.lineup[9]);
				console.log(vars.lineup[10]);*/

				//      vars.closer = userPlayers.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; }).slice(22, 24);

				deferred.resolve(vars);
			};
			return deferred.promise();
		}
	}

	function updatePlayoffs(inputs, updateEvents) {
		var deferred, vars;

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || (g.phase >= g.PHASE.PLAYOFFS && updateEvents.indexOf("gameSim") >= 0) || (updateEvents.indexOf("newPhase") >= 0 && g.phase === g.PHASE.PLAYOFFS)) {
			deferred = $.Deferred();
			vars = {
				showPlayoffSeries : false,
				playoffsStarted : g.phase >= g.PHASE.PLAYOFFS
			};

			g.dbl.transaction("playoffSeries").objectStore("playoffSeries").get(g.season).onsuccess = function(event) {
				var found, i, playoffSeries, rnd, series;

				playoffSeries = event.target.result;
				if (playoffSeries !== undefined) {
					series = playoffSeries.series;
					found = false;
					// Find the latest playoff series with the user's team in it
					for ( rnd = playoffSeries.currentRound; rnd >= 0; rnd--) {
						for ( i = 0; i < series[rnd].length; i++) {
							if (series[rnd][i].home.tid === g.userTid || series[rnd][i].away.tid === g.userTid) {
								vars.series = [[series[rnd][i]]];
								found = true;
								vars.showPlayoffSeries = true;
								if (rnd === 0) {
									vars.seriesTitle = "Wild Card";
								} else if (rnd === 1) {
									vars.seriesTitle = "Division Round";
								} else if (rnd === 2) {
									vars.seriesTitle = "League Championship";
								} else if (rnd === 3) {
									vars.seriesTitle = "ArenaBowl";
								}
								break;
							}
						}
						if (found) {
							break;
						}
					}
				}

				deferred.resolve(vars);
			};
			return deferred.promise();
		}
	}

	/*
	 function updatePlayoffs(inputs, updateEvents) {
	 var deferred, vars;

	 if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || (g.phase >= g.PHASE.PLAYOFFS && updateEvents.indexOf("gameSim") >= 0) || (updateEvents.indexOf("newPhase") >= 0 && g.phase === g.PHASE.PLAYOFFS)) {
	 deferred = $.Deferred();
	 vars = {
	 showPlayoffSeries: false
	 };

	 g.dbl.transaction("playoffSeries").objectStore("playoffSeries").get(g.season).onsuccess = function (event) {
	 var found, i, playoffSeries, rnd, series;

	 playoffSeries = event.target.result;
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
	 break;
	 }
	 }
	 if (found) {
	 break;
	 }
	 }
	 }

	 deferred.resolve(vars);
	 };
	 return deferred.promise();
	 }
	 }*/

	function updateStandings(inputs, updateEvents, vm) {
		var deferred;

		if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0) {
			deferred = $.Deferred();

			team.filter({
				attrs : ["tid", "cid", "did", "abbrev", "region"],
				seasonAttrs : ["winp", "won", "lost"],
				season : g.season,
				sortBy : ["winp", "-lost", "won"]
			}, function(teams) {
				var cid, confTeams, i, k, l;

				// Find user's conference
				for ( i = 0; i < teams.length; i++) {
					if (teams[i].tid === g.userTid) {
						cid = teams[i].cid;
						break;
					}
				}

				var divTeamRank;
				var divCurrentRank;
				var j, k;
				divTeamRank = [];

				for ( j = 0; j < g.divs.length; j++) {
					divCurrentRank = 0;
					for ( k = 0; k < teams.length; k++) {
						if (g.divs[j].did === teams[k].did) {
							divCurrentRank += 1;
							divTeamRank[k] = divCurrentRank;
						}
					}
				}

				confTeams = [];
				l = 0;
				for ( k = 0; k < teams.length; k++) {
					if (cid === teams[k].cid) {
						if ((divTeamRank[k] < 2)) {

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

				for ( k = 0; k < teams.length; k++) {
					if (cid === teams[k].cid) {
						if ((divTeamRank[k] > 1)) {

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

				deferred.resolve({
					confTeams : confTeams
				});
			});
			return deferred.promise();
		}
	}

	function uiFirst() {
		ui.title("Dashboard");
	}

	return bbgmView.init({
		id : "leagueDashboard",
		InitViewModel : InitViewModel,
		runBefore : [updateInbox, updateTeam, updatePayroll, updateTeams, updateGames, updateSchedule, updatePlayers, updatePlayoffs, updateStandings],
		uiFirst : uiFirst
	});
}); 