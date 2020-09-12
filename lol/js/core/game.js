/**
 * @name core.game
 * @namespace Everything about games except the actual simulation. So, loading the schedule, loading the teams, saving the results, and handling multi-day simulations and what happens when there are no games left to play.
 */
define(["dao", "globals", "ui", "core/champion", "core/freeAgents", "core/finances", "core/gameSim", "core/league", "core/phase", "core/player", "core/season", "core/team", "lib/bluebird", "util/advStats", "util/eventLog", "util/lock", "util/helpers", "util/random"], function (dao, g, ui, champion,freeAgents, finances, gameSim, league, phase, player, season, team, Promise, advStats, eventLog, lock, helpers, random) {
    "use strict";

    function writeTeamStats(tx, results) {
        return Promise.reduce([0, 1], function (att, t1) {
            var t2;

            t2 = t1 === 1 ? 0 : 1;
			//console.log(att);
            return Promise.all([
                team.getPayroll(tx, results.team[t1].id).get(0),
                dao.teams.get({ot: tx, key: results.team[t1].id})
            ]).spread(function (payroll, t) {
                var coachingPaid, count, expenses, facilitiesPaid, healthPaid, i, keys, localTvRevenue, merchRevenue, nationalTvRevenue, revenue, salaryPaid, scoutingPaid, sponsorRevenue, teamSeason, teamStats, ticketRevenue, winp, winpOld, won;

                teamSeason = t.seasons[t.seasons.length - 1];
                teamStats = t.stats[t.stats.length - 1];

                if (results.team[t1].stat.pts > results.team[t2].stat.pts) {
                    won = true;
                } else {
                    won = false;
                }

                // Attendance - base calculation now, which is used for other revenue estimates
                if (t1 === 0) { // Base on home team
                    att = 12000 + (Math.pow(teamSeason.hype, 10)) * 75000 ;  // Base attendance - between 2% and 0.2% of the region
                    if (g.phase === g.PHASE.PLAYOFFS) {
                        att *= 1.5;  // Playoff bonus
                    }
                }

				var numGames,revenueBoost;
				
				numGames = 18+1;
			//	console.log(t.cid)
				//console.log(t.cidStart)
				
				if ((g.gameType == 0) || (g.gameType == 2)){
				   numGames = 18+1;
				} else if (g.gameType == 1){
					if (t.cid == 0) {
						numGames = 18+1;					
					} else if (t.cid == 1) {
						numGames = 20+1;					
					} else {
						numGames = 26+1;
					}
				} else if (g.gameType == 3) {
				   numGames = 22+1;
				} else if (g.gameType == 4) {
				   numGames = 14+1;
				} else {
					if (t.cid == 0) {
						numGames = 18+1;					
					} else if (t.cid == 1) {
						numGames = 18+1;					
					} else if (t.cid == 2) {
						numGames = 18+1;					
					} else if (t.cid == 3) {
						numGames = 22+1;					
					} else if (t.cid == 4) {
						numGames = 14+1;					
					} else if (t.cid == 5) {
						numGames = 12+1;					
					} else {
						numGames = 22+1;
					}
				}
				
                // Some things are only paid for regular season games.
                salaryPaid = 0;
                scoutingPaid = 0;
                coachingPaid = 0;
                healthPaid = 0;
                facilitiesPaid = 0;
                merchRevenue = 0;
                sponsorRevenue = 0;
                nationalTvRevenue = 0;
                localTvRevenue = 0;
				

				
               // Attendance - final estimate
                if (t1 === 0) { // Base on home team
                    att = random.gauss(att, 1000);
                  //  att *= 30 / t.budget.ticketPrice.amount;  // Attendance depends on ticket price. Not sure if this formula is reasonable.
                //    att *= 1 + 0.075 * (g.numTeams - finances.getRankLastThree(t, "expenses", "facilities")) / (g.numTeams - 1);  // Attendance depends on facilities. Not sure if this formula is reasonable.
                    if (att > 75000) {
                        att = 75000;
                    } else if (att < 0) {
                        att = 0;
                    }
                    att = Math.round(att);
                }

				revenueBoost = 1.00;
		/*		if (teamSeason.hype > .9) {
				  revenueBoost = (teamSeason.hype-.9)*2
				} else if (teamSeason.hype < .5) {
				  revenueBoost = (teamSeason.hype+.5);
				}*/			
				if (g.gameType == 1) {
					if (teamSeason.hype>.75) {
						revenueBoost = 3.0;
					} else if (teamSeason.hype>.50) {
						revenueBoost = 2.0;
					} else {
						revenueBoost = 1.50;
					}
				} else if (g.gameType == 4) {
					if (teamSeason.hype>.75) {
						revenueBoost = 3.0;
					} else if (teamSeason.hype>.50) {
						revenueBoost = 2.0;
					} else {
						revenueBoost = 1.5;
					}
				} else if (g.gameType == 5) {
					if (teamSeason.hype>.75) {
						revenueBoost = 3.0;
					} else if (teamSeason.hype>.50) {
						revenueBoost = 2.0;
					} else {
						revenueBoost = 1.50;
					}
				} else {
					if (teamSeason.hype>.75) {
						revenueBoost = 3.0;
					} else if (teamSeason.hype>.50) {
						revenueBoost = 2.0;
					} else {
						revenueBoost = 1.5;
					}
				}
				
                if (g.phase !== g.PHASE.PLAYOFFS) {
                    // All in [thousands of dollars]
			
                    salaryPaid = Number(payroll) / numGames*1000;
                    scoutingPaid = t.budget.scouting.amount / numGames;
                    coachingPaid = t.budget.coaching.amount / numGames;
//                    healthPaid = t.budget.health.amount / 30;
                    healthPaid = 0;
                    facilitiesPaid = t.budget.facilities.amount / numGames;
//                    merchRevenue = att*.55*revenueBoost  ;
                    merchRevenue = att*.30*revenueBoost*18/numGames  ;
					//console.log(merchRevenue);
                    if (merchRevenue > 25000000) {
                        merchRevenue = 25000000;
                    }
  //                  sponsorRevenue =  att*1.7*revenueBoost ;
                    sponsorRevenue =  att*1.0*revenueBoost*18/numGames ;
                    if (sponsorRevenue > 6000000) {
                        sponsorRevenue = 6000000;
                    }
                    nationalTvRevenue = 0;                
                    localTvRevenue = 0;
                    if (localTvRevenue > 1200) {
                        localTvRevenue = 1200;
                    }
                }

 
                // This doesn't really make sense
//                ticketRevenue = t.budget.ticketPrice.amount * att / 1000;  // [thousands of dollars]
                ticketRevenue = 0;  // [thousands of dollars]
				
				
                // Hype - relative to the expectations of prior seasons
                if (teamSeason.gp > 5 && g.phase !== g.PHASE.PLAYOFFS) {
					var winpHurdle, winpDivisor;
				
					winpHurdle = .55;
					winpDivisor = 1.00;
					if (g.gameType == 1) {
					  if (t.cid == 0) {
							winpHurdle = .55
					  } else if (t.cid == 1) {
							winpHurdle = .75
							winpDivisor = 1.5;
					  } else {
							winpHurdle = 1.00
							winpDivisor = 2;
					  }
					}

				
				
                    winp = teamSeason.won / (teamSeason.won + teamSeason.lost);
                    winpOld = 0;
                    count = 0;
                    for (i = t.seasons.length - 2; i >= 0; i--) { // Start at last season, go back
                        winpOld += t.seasons[i].won / (t.seasons[i].won + t.seasons[i].lost);
                        count++;
                        if (count === 4) {
                            break;  // Max 4 seasons
                        }
                    }
                    if (count > 0) {
                        winpOld /= count;
                    } else {
                        //winpOld = 0.5;  // Default for new games
					//	console.log(teamSeason.hype);
                        winpOld = teamSeason.hype;  // Default for new games
                    }

                    // It should never happen, but winp and winpOld sometimes turn up as NaN due to a duplicate season entry or the user skipping seasons
                    if (winp !== winp) {
                        winp = 0;
                    }
                    if (winpOld !== winpOld) {
                        winpOld = 0;
                    }

					
				/*	if (g.gameType == 1) {
					  if (t.cid == 0) {
					  } else if (t.cid == 1) {
							winp /= 1.25
							winpOld /= 1.25
					  } else {
							winp /= 1.5
							winpOld /= 1.5
					  }
					}										*/
//                    teamSeason.hype = teamSeason.hype + 0.01 * (winp - 0.55) + 0.015 * (winp - winpOld);
//                    teamSeason.hype = teamSeason.hype + 0.04/winpDivisor * (winp - winpHurdle) + 0.06 * (winp - winpOld);
					teamSeason.hype *= 1-(1/(numGames-5));
					teamSeason.hype += winp/(numGames-5);
					//teamSeason.hype += (winp-winOld)/(numGames-5));
					
                    //teamSeason.hype = teamSeason.hype + 0.3/(numGames-5)/winpDivisor * (winp - winpHurdle) + 0.45/(numGames-5) * (winp - winpOld);
					
                    if (teamSeason.hype > 1) {
                        teamSeason.hype = 1;
                    } else if (teamSeason.hype < 0) {
                        teamSeason.hype = 0;
                    }
                }

//                revenue = merchRevenue + sponsorRevenue + nationalTvRevenue + localTvRevenue + ticketRevenue;
                revenue = merchRevenue + sponsorRevenue ;
                expenses = salaryPaid + scoutingPaid + coachingPaid + facilitiesPaid;
		//		console.log(payroll+" "+merchRevenue+" "+sponsorRevenue+" "+salaryPaid+" "+scoutingPaid+" "+coachingPaid+" "+facilitiesPaid);
		
				
                teamSeason.cash += revenue - expenses;
               // if (t1 === 0) {
                    // Only home team gets attendance...
                    teamSeason.att += att;

                    // This is only used for attendance tracking
                    if (!teamSeason.hasOwnProperty("gpHome")) { teamSeason.gpHome = Math.round(teamSeason.gp / 2); } // See also team.js and teamFinances.js
                    teamSeason.gpHome += 1;					
                //}
                teamSeason.gp += 1;
                teamSeason.revenues.merch.amount += merchRevenue;
                teamSeason.revenues.sponsor.amount += sponsorRevenue;
                teamSeason.revenues.nationalTv.amount += nationalTvRevenue;
                teamSeason.revenues.localTv.amount += localTvRevenue;
                teamSeason.revenues.ticket.amount += ticketRevenue;
                teamSeason.expenses.salary.amount += salaryPaid;
                teamSeason.expenses.scouting.amount += scoutingPaid;
                teamSeason.expenses.coaching.amount += coachingPaid;
                teamSeason.expenses.health.amount += healthPaid;
                teamSeason.expenses.facilities.amount += facilitiesPaid;
//'min', removed
                keys = [ 'trb','fg', 'fga','fgp', 'fgAtRim', 'fgaAtRim', 'fgpAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts','oppJM','oppInh','oppTw','scTwr','scKills',
				'grExpTwr',
				'grExpKills',
				'grGldTwr',
				'grGldKills',
				'tmBuffTwr',
				'tmBuffKills',
				'tmBAdjTwr',
				'tmBAdjKills',
				'TPTwr',
				'TPKills',
				'TwTwr',
				'TwKills',
				'CKTwr',
				'CKKills',
				'CSTwr',
				'CSKills',
				'AgTwr',
				'AgKills',
				'ChmpnTwr',
				'ChmpnKills'

				];
                for (i = 0; i < keys.length; i++) {
                    teamStats[keys[i]] += results.team[t1].stat[keys[i]];
                }
                teamStats.gp += 1;
                teamStats.min += results.team[t1].stat.min/5;				
              //  teamStats.trb += results.team[t1].stat.orb + results.team[t1].stat.drb;
                teamStats.oppPts += results.team[t2].stat.pts;

                if (teamSeason.lastTen.length === 5 && g.phase !== g.PHASE.PLAYOFFS) {
                    teamSeason.lastTen.pop();
                }

                if (won && g.phase !== g.PHASE.PLAYOFFS) {
                    teamSeason.won += 1;
                    if (results.team[0].did === results.team[1].did) {
                        teamSeason.wonDiv += 1;
                    }
                    if (results.team[0].cid === results.team[1].cid) {
                        teamSeason.wonConf += 1;
                    }

                    if (t1 === 0) {
                        teamSeason.wonHome += 1;
                    } else {
                        teamSeason.wonAway += 1;
                    }

                    teamSeason.lastTen.unshift(1);

                    if (teamSeason.streak >= 0) {
                        teamSeason.streak += 1;
                    } else {
                        teamSeason.streak = 1;
                    }
                } else if (g.phase !== g.PHASE.PLAYOFFS) {
                    teamSeason.lost += 1;
                    if (results.team[0].did === results.team[1].did) {
                        teamSeason.lostDiv += 1;
                    }
                    if (results.team[0].cid === results.team[1].cid) {
                        teamSeason.lostConf += 1;
                    }

                    if (t1 === 0) {
                        teamSeason.lostHome += 1;
                    } else {
                        teamSeason.lostAway += 1;
                    }

                    teamSeason.lastTen.unshift(0);

                    if (teamSeason.streak <= 0) {
                        teamSeason.streak -= 1;
                    } else {
                        teamSeason.streak = -1;
                    }
                }

                return dao.teams.put({ot: tx, value: t}).then(function () {
                    return att;
                });
            });
        }, 0);
    }

    function writePlayerStats(tx, results) {
        return Promise.map(results.team, function (t) {
            return Promise.map(t.player, function (p) {
                // Only need to write stats if player got minutes
			
                if (p.stat.min === 0) {
                    return;
                }
		
				player.checkStatisticalFeat(tx, p.id, t.id, p, results);		
		
                dao.playerStats.iterate({
                    ot: tx,
                    index: "pid, season, tid",
                    key: [p.id, g.season, t.id],
                    direction: "prev", // In case there are multiple entries for the same player, like he was traded away and then brought back
                    callback: function (ps, shortCircuit) {
                        var i, injuredThisGame, keys;

                        // Since index is not on playoffs, manually check
                        if (ps.playoffs !== (g.phase === g.PHASE.PLAYOFFS)) {
                            return;
                        }

                        // Found it!
                        shortCircuit();

                        // Update stats
                        keys = ['gs', 'min','trb', 'fg', 'fga','fgp', 'fgAtRim', 'fgaAtRim', 'fgpAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts','oppJM','oppInh','oppTw','champPicked','scTwr','scKills',
						'grExpTwr',
						'grExpKills',
						'grGldTwr',
						'grGldKills',
						'tmBuffTwr',
						'tmBuffKills',
						'tmBAdjTwr',
						'tmBAdjKills',
						'TPTwr',
						'TPKills',
						'TwTwr',
						'TwKills',
						'CKTwr',
						'CKKills',
						'CSTwr',
						'CSKills',
						'AgTwr',
						'AgKills',
						'ChmpnTwr',
						'ChmpnKills'
						];
						
                        for (i = 0; i < keys.length; i++) {
                            ps[keys[i]] += p.stat[keys[i]];
                        }
                        ps.gp += 1; // Already checked for non-zero minutes played above
                    //    ps.trb += p.stat.orb + p.stat.drb;

                        injuredThisGame = p.injured && p.injury.type === "Healthy";

                        // Only update player object (values and injuries) every 10 regular season games or on injury
                        if ((ps.gp % 10 === 0 && g.phase !== g.PHASE.PLAYOFFS) || injuredThisGame) {
                            dao.players.get({ot: tx, key: p.id}).then(function (p_) {
                                // Injury crap - assign injury type if player does not already have an injury in the database
                                if (injuredThisGame) {
                                    p_.injury = player.injury(t.healthRank);
                                    p.injury = p_.injury; // So it gets written to box score
                                    eventLog.add(tx, {
                                        type: "injured",
                                        text: '<a href="' + helpers.leagueUrl(["player", p_.pid]) + '">' + p_.name + '</a> was injured! (' + p_.injury.type + ', out for ' + p_.injury.gamesRemaining + ' games)',
                                        showNotification: p_.tid === g.userTid,
                                        pids: [p_.pid],
                                        tids: [p_.tid]
                                    });
                                }

                                // Player value depends on ratings and regular season stats, neither of which can change in the playoffs
                                if (g.phase !== g.PHASE.PLAYOFFS) {
                                    return player.updateValues(tx, p_, [ps]);
                                }
                                return p_;
                            }).then(function (p_) {

                                dao.players.put({ot: tx, value: p_});
                            });
                        }


                        return ps;
                    }
                });
            });
        });
    }

    function writeGameStats(tx, results, att) {
        var gameStats, i, keys, p, t, text, tl, tw;
				//console.log("here");
        gameStats = {
            gid: results.gid,
            att: att,
            season: g.season,
            playoffs: g.phase === g.PHASE.PLAYOFFS,
            overtimes: results.overtimes,
            won: {},
            lost: {},
            teams: [
                {tid: results.team[0].id, players: []},
                {tid: results.team[1].id, players: []}
            ]
        };
			//	console.log("here");
        for (t = 0; t < 2; t++) {
				//console.log(t);			
            keys = ['min','trb', 'fg', 'fga','fgp', 'fgAtRim', 'fgaAtRim', 'fgpAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts', 'ptsQtrs','champPicked','oppJM','oppInh','oppTw','scTwr','scKills',
			'grExpTwr',
			'grExpKills',
			'grGldTwr',
			'grGldKills',
			'tmBuffTwr',
			'tmBuffKills',
			'tmBAdjTwr',
			'tmBAdjKills',
			'TPTwr',
			'TPKills',
			'TwTwr',
			'TwKills',
			'CKTwr',
			'CKKills',
			'CSTwr',
			'CSKills',
			'AgTwr',
			'AgKills',
			'ChmpnTwr',
			'ChmpnKills'
			];
			
         //   console.log(results.team[t].stat['min']);
			for (i = 0; i < keys.length; i++) {
				//console.log(keys[i]+" "+i);
                gameStats.teams[t][keys[i]] = results.team[t].stat[keys[i]];
            }
            //gameStats.teams[t].trb = results.team[t].stat.orb + results.team[t].stat.drb;

            keys.unshift("gs"); // Also record starters, in addition to other stats
//            for (p = 0; p < results.team[t].player.length; p++) {
            for (p = 0; p < 5; p++) {
		//		console.log(p);				
         //   console.log(results.team[t].player[p].stat['min']);
                gameStats.teams[t].players[p] = {name: results.team[t].player[p].name, pos: results.team[t].player[p].pos, posPlayed: results.team[t].player[p].posPlayed,champUsed: results.team[t].player[p].champUsed, userID: results.team[t].player[p].userID};
                for (i = 0; i < keys.length; i++) {
                    gameStats.teams[t].players[p][keys[i]] = results.team[t].player[p].stat[keys[i]];
                }
             //   gameStats.teams[t].players[p].trb = results.team[t].player[p].stat.orb + results.team[t].player[p].stat.drb;
                gameStats.teams[t].players[p].pid = results.team[t].player[p].id;
                gameStats.teams[t].players[p].skills = results.team[t].player[p].skills;
                gameStats.teams[t].players[p].injury = results.team[t].player[p].injury;
            }
        }

        // Store some extra junk to make box scores easy
        if (results.team[0].stat.pts > results.team[1].stat.pts) {
            tw = 0;
            tl = 1;
        } else {
            tw = 1;
            tl = 0;
        }

        gameStats.won.tid = results.team[tw].id;
        gameStats.lost.tid = results.team[tl].id;
        gameStats.won.pts = results.team[tw].stat.pts;
        gameStats.lost.pts = results.team[tl].stat.pts;

        // Event log
     /*   if (results.team[0].id === g.userTid || results.team[1].id === g.userTid) {
            showNotification = true;
        } else {
            showNotification = false;
        }
        text = 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tw].id], g.season]) + '">' + g.teamNamesCache[results.team[tw].id] + '</a> defeated the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tl].id], g.season]) + '">' + g.teamNamesCache[results.team[tl].id] + '</a> <a href="' + helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid]) + '">' + results.team[tw].stat.pts + "-" + results.team[tl].stat.pts + "</a>.";
        eventLog.add(tx, {
            type: results.team[tw].id === g.userTid ? "gameWon" : "gameLost",
            text: text,
            showNotification: showNotification,
            tids: [results.team[0].id, results.team[1].id]
        });*/
        // Event log
        if (results.team[0].id === g.userTid || results.team[1].id === g.userTid) {
            if (results.team[tw].id === g.userTid) {
                text = 'Your team defeated <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tl].id], g.season]) + '">' + g.teamRegionsCache[results.team[tl].id];
            } else {
                text = 'Your team lost to <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tw].id], g.season]) + '">' + g.teamRegionsCache[results.team[tw].id];
            }
       //     text += '</a> <a href="' + helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid]) + '">' + results.team[tw].stat.pts + "-" + results.team[tl].stat.pts + "</a>.";
            text += '</a> <a href="' + helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid]) + '"></a>.';
            eventLog.add(tx, {
                type: results.team[tw].id === g.userTid ? "gameWon" : "gameLost",
                text: text,
                saveToDb: false,
                tids: [results.team[0].id, results.team[1].id]
            });
        }		
			
        /*    if (results.team[tw].id === g.userTid) {
                text = 'Your team defeated <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tl].id], g.season]) + '">' + g.teamNamesCache[results.team[tl].id];
            } else {
                text = 'Your team lost to <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tw].id], g.season]) + '">' + g.teamNamesCache[results.team[tw].id];
            }
//            text += '</a> <a href="' + helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid]) + '">' + results.team[tw].stat.pts + "-" + results.team[tl].stat.pts + "</a>.";
            text += '</a> <a href="' + helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid]) + '"></a>.';
            eventLog.add(tx, {
                type: results.team[tw].id === g.userTid ? "gameWon" : "gameLost",
                text: text
            });
        }*/
	//	console.log("here");				
	//	console.log(gameStats);				
        return dao.games.put({ot: tx, value: gameStats}).then(function () {
	//	console.log("here");							
            // Record progress of playoff series, if appropriate
            if (!gameStats.playoffs) {
                return;
            }
	//	console.log("here");				
            return dao.playoffSeries.get({ot: tx, key: g.season}).then(function (playoffSeries) {
                var currentRoundText, i, loserWon, otherTid, playoffRound, series, won0,won1;
				var seriesStart,seriesEnd;
                var currentRoundText, i, loserTid, loserWon, playoffRound, series, showNotification, winnerTid, won0;
				
		//console.log("here");								
			//	console.log(playoffSeries.currentRound);
                playoffRound = playoffSeries.series[playoffSeries.currentRound];
			//	console.log(playoffRound);

                // Did the home (true) or away (false) team win this game? Here, "home" refers to this game, not the team which has homecourt advnatage in the playoffs, which is what series.home refers to below.
                if (results.team[0].stat.pts > results.team[1].stat.pts) {
                    won0 = true;
                } else {
                    won0 = false;
					won1 = true;
                }

								
			if (playoffSeries.currentRound == 0) {
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
			} else if (playoffSeries.currentRound == 1) {
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
			} else if (playoffSeries.currentRound == 2) {
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
			} else if (playoffSeries.currentRound == 3) {
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
			} else if (playoffSeries.currentRound == 4) {
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
			} else if (playoffSeries.currentRound == 5) {
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
			} else if (playoffSeries.currentRound == 6) {
				if (g.gameType == 5) {	
					seriesStart = 0;
					seriesEnd = 10;				
//					seriesEnd = 6;				
				}										
			} else if (playoffSeries.currentRound == 7) {
				if (g.gameType == 5) {	
					seriesStart = 0;
					seriesEnd = 5;				
				}										
			} else if (playoffSeries.currentRound == 8) {
				if (g.gameType == 5) {	
					seriesStart = 0;
					seriesEnd = 8;				
				}										
			} else if (playoffSeries.currentRound == 9) {
				if (g.gameType == 5) {	
					seriesStart = 0;
					seriesEnd = 4;				
				}										
			} else if (playoffSeries.currentRound == 10) {
				if (g.gameType == 5) {	
					seriesStart = 0;
					seriesEnd = 2;				
				}										
			} else if (playoffSeries.currentRound == 11) {
				if (g.gameType == 5) {	
					seriesStart = 0;
					seriesEnd = 1;				
				}										
			}			
					
			//	console.log(seriesStart);
			//	console.log(seriesEnd);
			//	if (playoffSeries.currentRound < 3) {				
			if ((g.gameType == 5) && (playoffSeries.currentRound  < 3)) {					
				for (i = 0; i < 2; i++) {
			//	console.log(i);
//                for (i = 0; i < playoffRound.length; i++) {
					series = playoffRound[i];
			//	console.log(series);
					if (series.home.tid === results.team[0].id) {
						if (won0) {
							series.home.won += 1;
						} else {
							series.away.won += 1;
						}
						break;
					} else if (series.away.tid === results.team[0].id) {
						if (won0) {
							series.away.won += 1;
						} else {
							series.home.won += 1;
						}
						break;
					}
				}				
			}
				
//);
		//	console.log(results.team[0].id);
		//	console.log(results.team[1].id);
		/*	console.log(playoffRound.length);
			console.log(playoffRound);
			console.log(playoffRound[0]);
			console.log(playoffRound[1]);
			console.log(playoffRound[2]);
			console.log(playoffRound[3]);
			console.log(playoffRound[4]);
			console.log(playoffRound[5]);
			console.log(playoffRound[6]);
			console.log(playoffRound[7]);
			console.log(seriesStart);
			console.log(seriesEnd);*/
			for (i = seriesStart; i < seriesEnd; i++) {
	//	console.log("here");								
//                for (i = 0; i < playoffRound.length; i++) {
				
			/*	console.log(series);
				console.log(series.home.tid);
				console.log(series.away.tid);
				console.log(series.home.name);
				console.log(series.away.name);
				console.log(results.team[0].id);
				console.log(results.team[0].name);*/
			
			
			// tracking need to be based on initial 8-0 8-1, but individual win loss is based on results
			
			// change this to 8-0 or 8-1. 
				series = playoffRound[i];

				if ((g.gameType == 5) && (playoffSeries.currentRound  == 8)) {	
					if (series.home.tid === results.team[0].id) {
						if (won0) {
							series.home.won += 1;
						} 
					} 
					if (series.away.tid === results.team[0].id) {
						if (won0) {
							series.away.won += 1;
						} 
					}
					if (series.home.tid === results.team[1].id) {
						if (won1) {
							series.home.won += 1;
						} 
					} 
					if (series.away.tid === results.team[1].id) {
						if (won1) {
							series.away.won += 1;
						} 
					}					
				} else {				
					if (series.home.tid === results.team[0].id) {
						if (won0) {
							series.home.won += 1;
						} else {
							series.away.won += 1;
						}
						break;
					} else if (series.away.tid === results.team[0].id) {
						if (won0) {
							series.away.won += 1;
						} else {
							series.home.won += 1;
						}
						break;
					}
				}
				
				
			}

				var titleRound;
				if (g.gameType == 0) {
					titleRound = 11;
				} else if (g.gameType == 1) {
					titleRound = 3;
				} else if (g.gameType == 2) {
					titleRound = 3;
				} else if (g.gameType == 3) {
					titleRound = 3;
				} else if (g.gameType == 4) {
					titleRound = 3;
				} else if (g.gameType == 5) {
					titleRound = 11;
				} else {
					titleRound = 3;
				}
                // Check if the user's team won/lost a playoff series (before the finals)
            /*   if ((g.userTid === results.team[0].id || g.userTid === results.team[1].id) && playoffSeries.currentRound < titleRound) {
                    if (series.away.won === 3 || series.home.won === 3) {
                        otherTid = g.userTid === results.team[0].id ? results.team[1].id : results.team[0].id;
                        loserWon = series.away.won === 3 ? series.home.won : series.away.won;
                        if (playoffSeries.currentRound === 0) {
                            currentRoundText = "first round of the playoffs";
                        } else if (playoffSeries.currentRound === 1) {
                            currentRoundText = "second round of the playoffs";
                        } else if (playoffSeries.currentRound === 2) {
                            currentRoundText = "conference finals";
                        }
                        // ...no finals because that is handled separately

                        if ((series.away.tid === g.userTid && series.away.won === 3) || (series.home.tid === g.userTid && series.home.won === 3)) {
                            eventLog.add(tx, {
                                type: "playoffs",
                                text: 'Your team defeated the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamNamesCache[otherTid] + '</a> in the ' + currentRoundText + ', 3-' + loserWon + '.'
                            });
                        } else {
                            eventLog.add(tx, {
                                type: "playoffs",
                                text: 'Your team was eliminated by the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamNamesCache[otherTid] + '</a> in the ' + currentRoundText + ', 3-' + loserWon + '.'
                            });
                        }
                    }
                }

                // If somebody just won the title, announce it
				// adjust based on gameType

                if (playoffSeries.currentRound === titleRound && (series.away.won === 3 || series.home.won === 3)) {
                    if ((series.away.tid === g.userTid && series.away.won === 3) || (series.home.tid === g.userTid && series.home.won === 3)) {
                        eventLog.add(tx, {
                            type: "playoffs",
                            text: 'Your team won the ' + g.season + ' league championship!'
                        });
                    } else {
                        otherTid = series.away.won === 3 ? series.away.tid : series.home.tid;
                        eventLog.add(tx, {
                            type: "playoffs",
                            text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamRegionsCache[otherTid] + ' ' + g.teamNamesCache[otherTid] + '</a> won the ' + g.season + ' league championship!'
                        });
                    }
                }*/

				// don't use, too complex?
                // Log result of playoff series
              /*  if (series.away.won === 4 || series.home.won === 4) {
                    if (series.away.won === 4) {
                        winnerTid = series.away.tid;
                        loserTid = series.home.tid;
                        loserWon = series.home.won;
                    } else {
                        winnerTid = series.home.tid;
                        loserTid = series.away.tid;
                        loserWon = series.away.won;
                    }

                    if (playoffSeries.currentRound === 0) {
                        currentRoundText = "first round of the playoffs";
                    } else if (playoffSeries.currentRound === 1) {
                        currentRoundText = "second round of the playoffs";
                    } else if (playoffSeries.currentRound === 2) {
                        currentRoundText = "conference finals";
                    } else if (playoffSeries.currentRound === 3) {
                        currentRoundText = "league championship";
                    }

                    if (series.away.tid === g.userTid  || series.home.tid === g.userTid || playoffSeries.currentRound === 3) {
                        showNotification = true;
                    } else {
                        showNotification = false;
                    }
                    eventLog.add(tx, {
                        type: "playoffs",
                        text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[winnerTid], g.season]) + '">' + g.teamNamesCache[winnerTid] + '</a> defeated the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[loserTid], g.season]) + '">' + g.teamNamesCache[loserTid] + '</a> in the ' + currentRoundText + ', 4-' + loserWon + '.',
                        showNotification: showNotification,
                        tids: [winnerTid, loserTid]
                    });
                }		*/		
				
                dao.playoffSeries.put({ot: tx, value: playoffSeries});
            });
        });
    }

    /**
     * Build a composite rating.
     *
     * Composite ratings are combinations of player ratings meant to represent one facet of the game, like the ability to make a jump shot. All composite ratings are scaled from 0 to 1.
     *
     * @memberOf core.game
     * @param {Object.<string, number>} ratings Player's ratings object.
     * @param {Array.<string>} components List of player ratings to include in the composite ratings. In addition to the normal ones, "constant" is a constant value of 50 for every player, which can be used to add a baseline value for a stat.
     * @param {Array.<number>=} weights Optional array of weights used in the linear combination of components. If undefined, then all weights are assumed to be 1. If defined, this must be the same size as components.
     * @return {number} Composite rating, a number between 0 and 1.
     */
    function makeComposite(rating, components, weights) {
        var component, divideBy, i, r, rcomp;

        if (weights === undefined) {
            // Default: array of ones with same size as components
            weights = [];
            for (i = 0; i < components.length; i++) {
                weights.push(1);
            }
        }

        rating.constant = 50;

        r = 0;
        divideBy = 0;
        for (i = 0; i < components.length; i++) {
            component = components[i];
            // Sigmoidal transformation
            //y = (rating[component] - 70) / 10;
            //rcomp = y / Math.sqrt(1 + Math.pow(y, 2));
            //rcomp = (rcomp + 1) * 50;
            rcomp = weights[i] * rating[component];

            r = r + rcomp;

            divideBy = divideBy + 100 * weights[i];
        }

        r = r / divideBy;  // Scale from 0 to 1
        if (r > 1) {
            r = 1;
        } else if (r < 0) {
            r = 0;
        }

        return r;
    }

    /**
     * Load all teams into an array of team objects.
     *
     * The team objects contain all the information needed to simulate games. It would be more efficient if it only loaded team data for teams that are actually playing, particularly in the playoffs.
     *
     * @memberOf core.game
     * @param {IDBObjectStore|IDBTransaction|null} ot An IndexedDB object store or transaction on players and teams; if null is passed, then a new transaction will be used.
     * @param {Promise} Resolves to an array of team objects, ordered by tid.
     */
    function loadTeams(ot) {
        var loadTeam, promises, tid;

	//	var hid;
	//	hid = 0;
		
        loadTeam = function (tid) {
            return Promise.all([
                //dao.players.getAll({ot: ot, index: "tid", key: tid}),
//				dao.players.getAll({ot: ot, index: "statsTids",	key: tid,statsSeasons: "all",statsTid: tid}),				
				dao.players.getAll({ot: ot, index: "tid",	key: tid,statsSeasons: "all",tid: tid}),				
                dao.teams.get({ot: ot, key: tid}),
                dao.champions.getAll({ot: ot}),
                dao.championPatch.getAll({ot: ot})
//            ]).spread(function (players,playersStats, team,champions,championPatch) {
            ]).spread(function (players, team,champions,championPatch) {
                var i, j, numPlayers, p, rating, t, teamSeason, k;
				var adjustment,idealPosition;
				
				var c = [];
				//console.log(tid);
				//console.log(tid);
				//var c;
			////	console.log(players.length);
			////	console.log(players[0]);
				//console.log(playerStats.length);
				//yearsWithTeam				
				//
			   for (i = 0; i < champions.length; i++) {				   
					c[i] = [];
					c[i] = champions[i];
				//	console.log(c[i]);
				}		

				var championRank = [];
				for (i = 0; i < championPatch.length; i++) {	
//console.log(championPatch[i]);				
//					championRank[i] = champion.rank(i);
					championRank[i] = championPatch[i];
				}		
				
                players.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });

                t = {id: tid, defense: 0, pace: 0, won: 0, lost: 0, cid: 0, did: 0, stat: {}, player: [], synergy: {off: 0, def: 0, reb: 0}};

                for (j = 0; j < team.seasons.length; j++) {
                    if (team.seasons[j].season === g.season) {
                        teamSeason = team.seasons[j];
                        break;
                    }
                }
                t.won = teamSeason.won;
                t.lost = teamSeason.lost;
                t.cid = team.cid;
                t.did = team.did;
                t.healthRank = teamSeason.expenses.health.rank;

				
				//console.log(players[0].champions[0].name);
				//console.log(c[0].name);
				
				///////// See how much penalty comes from languanges
				var topRanked,position,r;
				var langAdj,countryAdj;
				var langList,countryList;
				var maxLength,currentLength;
				var starterNumber;
				
				langList = [];
				countryList = [];
				//for (i = 0; i < players.length; i++) {
					
					
				////////////// Penalty For Not Speaking Same Languange	
				// just want starters
				if (players.length>5) {
					starterNumber = 5;					
				} else {
					console.log(team.tid);
					starterNumber = players.length;					
				}
				for (i = 0; i < starterNumber; i++) {
					if 	(typeof(players[i].languages) != 'undefined') {
						for (j = 0; j < players[i].languages.length; j++) {
								langList.push(players[i].languages[j]);									
						}
					}
				}
				
				langList.sort();
				
				maxLength = 1;
				currentLength = 1;
				for (i = 1; i < langList.length; i++) {
					if (langList[i] ==  langList[i-1]) {
						currentLength += 1;
					} else {
						currentLength = 1;
					}
					if (currentLength > maxLength) {
						maxLength = currentLength;
					}
					
				}
				
				langAdj = (maxLength-5)/5; // scale of -.8 to 0;
				langAdj /= 20;  // scale of -.04 to 0
				
				////////////// Penalty For Not Coming from Same Country
				// just want starters
				for (i = 0; i < starterNumber; i++) {
					if 	(typeof(players[i].born.country) != 'undefined') {
						countryList.push(players[i].born.country);									
					}
				}
						
				countryList.sort();
				
				maxLength = 1;
				currentLength = 1;
				for (i = 1; i < countryList.length; i++) {
					if (countryList[i] ==  countryList[i-1]) {
						currentLength += 1;
					} else {
						currentLength = 1;
					}
					if (currentLength > maxLength) {
						maxLength = currentLength;
					}
					
				}
				
				countryAdj = (maxLength-5)/5; // scale of -.8 to 0;
				countryAdj /= 20;  // scale of -.04 to 0				

				// combine language and country aspects
				langAdj += countryAdj;
				
                for (i = 0; i < players.length; i++) {
			//	console.log(players[i].championAverage);
					
					if (players[i].pos == "JGL") {
					   position = "Jungle";
					} else 	if (players[i].pos == "SUP") {
					   position = "Support";
					} else 	if (players[i].pos == "MID") {
					   position = "Middle";
					} else 	if (players[i].pos == "TOP") {
					   position = "Top";
					} else {
					   position = players[i].pos;
					}
					
					if (i==0) {
						idealPosition = "Top";
					} else if (i==1) {
						idealPosition = "Jungle";
					} else if (i==2) {
						idealPosition = "Middle";
					} else if (i==3) {
						idealPosition = "ADC";
					} else if (i==4) {
						idealPosition = "Support";
					}
				
				//console.log(j+" "+r+" "+i+" "+idealPosition+" "+position);
					if (idealPosition ==  position) {
						adjustment = 1.00;
					} else {
						adjustment = 0.50;							  
					}					
				
				//	console.log(champions.length);
					for (j = 0; j < champions.length; j++) {
//						players[i].champions[j].draftValue =  (players[i].champions[j].skill*c[j].ratings.overall)/50;	

						//console.log(players[i].champions.count);
				//		console.log(players[i].champions.size);
						//console.log(players[i].champions[j]);
						//console.log(j+" "+g.numChampions+" "+champions.length);
			////			if (j > g.numChampions-1) {
//						if (j > 125) {
						//	players[i].champions[j].draftValue = 50;
				/////			players[i].champions[j] = {name: champions[j].name,draftValue: 50}
						//	console.log(j+" "+players[i].champions[j].draftValue+" "+players[i].champions[j].name+" "+ champions[j].name)							
					//	console.log(players[i].champions[j].draftValue);										
///						} else if ((players[i].championAverage == -1) || (players[i].championAverage == undefined)) {
						if (players[i].champions[j] == undefined) {
							players[i].champions[j] = {};
							players[i].champions[j].draftValue =  50;														
							
						} else if ( (players[i].championAverage == -1) || (players[i].championAverage == undefined)) {
							players[i].champions[j].draftValue =  (players[i].champions[j].skill);														
						//console.log(players[i].champions[j].draftValue);							
						} else {						
							players[i].champions[j].draftValue =  Number(players[i].championAverage);							
					//	console.log(players[i].champions[j].draftValue);							
						}
					//	console.log(players[i].champions[j].draftValue);
					//	console.log(players[i].championAverage+" "+players[i].champions[j].skill)
					/*	   if (j< 10) {
						     console.log(players[i].champions[j].draftValue+" "+players[i].champions[j].name);
						   }						*/
						topRanked = championPatch.length;
						
						for (r = 0; r < championPatch.length; r++) {		

						
						// put in code here that ensures top 5 positions are top, jgl,mid,adc,sup (if not then penalize)
							
							
//						   if ((players[i].champions[j].name == championRank[r].champion) && (position == championRank[r].role)) {
						   if ((players[i].champions[j].name == championRank[r].champion) && (position == championRank[r].role)) {
							 /*  if (j< 10) {
								 console.log(players[i].champions[j].name+" "+championRank[r].champion+" "+position+" "+championRank[r].role);
							   }*/
							  // console.log(championRank[r].rank);
								  if  (championRank[r].rank < topRanked) {
										topRanked = championRank[r].rank;
								  }
								 // break;
								 
								 ////// Make patch data used, but if wrong role, punish the patch ranking
								 ////// need to get this working so using champs in wrong role is punished
								 ////// then make sure game works without pick ban at league createElement
								 ////// then write post
						   /*} else if (players[i].champions[j].name == championRank[r].champion) {
								  if  ( (championRank[r].rank+50) < topRanked) {
										topRanked = championRank[r].rank+50;
								  }*/
						   
						   }
						   
//						   else {
	//					      players[i].champions[j].draftValue = 0;
		//				   }

						}
						
//						players[i].champions[j].draftValue /= (topRanked)/200; // range from 1 to .5, or same to double
						/*console.log(i+" "+j);
						console.log(players[i].champions[j].draftValue);
						console.log(adjustment+" "+topRanked+" "+idealPosition+" "+position);*/
						players[i].champions[j].draftValue += (200*adjustment-topRanked)*.8; // range from 1 to .5, or same to double
					/*	if (players[i].champions[j].name == "test1") {
						  console.log(players[i].champions[j].draftValue);
						}*/
					//	console.log(players[i].champions[j].draftValue);
						//console.log(players[i].champions[j].draftValue);
				//		console.log(players[i].champions[j].draftValue+" "+adjustment+" "+topRanked+" "+idealPosition+" "+position);
						
//						players[i].champions[j].draftValue /= (topRanked+200)/400; // range from 1 to .5, or same to double
					//	console.log(players[i].champions[j].draftValue);
						//players[i].champions[j].draftValue /= (topRanked)/200; // range from 1 to .5, or same to double
						//console.log(players[i].champions[j].draftValue);

				/*	    players[i].champions[j].relativeValue = [];
						for (k = 0; k < 125; j++) {
						    players[i].champions[j].relativeValue[k] = [];
							players[i].champions[j].relativeValue[k] = (players[i].champions[j].draftValue*c[j].ratings.relative[k])/50;
						}*/
					}
                    p = {id: players[i].pid, userID: players[i].userID, name: players[i].name, pos: players[i].pos, posPlayed: players[i].posPlayed,champUsed: "",championRank: championRank,champRel: c, champions: players[i].champions, valueNoPot: players[i].valueNoPot, stat: {}, compositeRating: {}, skills: [], injury: players[i].injury, injured: players[i].injury.type !== "Healthy", ptModifier: players[i].ptModifier, pick: players[i].pick, ban: players[i].ban};
//                    p = {id: players[i].pid, userID: players[i].userID, name: players[i].name, pos: players[i].pos,champRel: c, champions: players[i].champions, valueNoPot: players[i].valueNoPot, stat: {}, compositeRating: {}, skills: [], injury: players[i].injury, injured: players[i].injury.type !== "Healthy", ptModifier: players[i].ptModifier};

                    // Reset ptModifier for AI teams. This should not be necessary since it should always be 1, but let's be safe.
                    if (t.id !== g.userTid) {
                        p.ptModifier = 1;
                        p.pick = 0;
                        p.ban = 0;
                    }
					

                    for (j = 0; j < players[i].ratings.length; j++) {
                        if (players[i].ratings[j].season === g.season) {
                            rating = players[i].ratings[j];
                            break;
                        }
                    }

					
/*
        Top Champion List
        player.champions.one, player.champions.oneRating
        player.champions.two, player.champions.twoRating
        player.champions.three, player.champions.threeRating
        player.champions.four, player.champions.fourRating
        player.champions.five, player.champions.fiveRating
        player.champions.six, player.champions.sixRating
        player.champions.seven, player.champions.sevenRating
        player.champions.eight, player.champions.eightRating		

      Mental
		Adaptability: hgt
		Fortitude: stre
        Consistency: spd
        Team Player: jmp
        Leadership: endu
        
		Tactical
        Awareness: ins
        Laning: dnk
        Team Fighting: ft
        Risk Taking: fg
		        
		Game
        Positioning: tp
        Skill Shots: blk
        Last Hitting: stl
        Summoner Spells: drb
		
        Physical
        Stamina: pss
        Injury Prone: reb*/
		
					var YWTadj; // give a bonus for being with team longer than 1 year, bump all ratings up 1 point for each year
					if (players[i].stats !== undefined) {
						if (players[i].stats.length !== undefined) {
							if (players[i].stats[players[i].stats.length-1] !== undefined) {
								if (players[i].stats[players[i].stats.length-1].yearsWithTeam !== undefined) {
									YWTadj = players[i].stats[players[i].stats.length-1].yearsWithTeam/50-.02;
								} else {
									YWTadj = 0;
								}
							} else  {
								YWTadj = 0;						
							}
						} else {
							YWTadj = 0;						
						}
					} else {
						YWTadj = 0;						
					}
					

                    if (rating === undefined) {
                        throw new Error("Player with no ratings for this season: " + players[i].name + "(ID: " + players[i].pid +")");
                    }
					
					//console.log(players[i].stats[players[i].stats.length-1].yearsWithTeam);
						//console.log(rating.skills);
                    p.skills = rating.skills;

                    p.ovr = rating.ovr+YWTadj;
																					
                    // These use the same formulas as the skill definitions in player.skills!
					
                    p.compositeRating.toweringAttack = makeComposite(rating, ['hgt', 'stre', 'spd', 'dnk','ft','tp', 'blk', 'stl'], [1,1,1,6, 2, 2,2,2])+YWTadj+langAdj ; // positioning, skill shots, risk taking, teamfighting
                    p.compositeRating.toweringDefend = makeComposite(rating, ['hgt', 'stre', 'spd', 'dnk','ft','tp', 'blk', 'stl'], [1,1,1,6, 2, 2,2,2])+YWTadj+langAdj; // positioning, skill shots, laning, teamfighting
                    p.compositeRating.structureAttack = makeComposite(rating, ['hgt', 'stre', 'spd','fg','blk'], [1,1,1,1, 4])+YWTadj; //skill shots,
                    p.compositeRating.structureDefend = makeComposite(rating, ['blk', 'hgt', 'stre', 'jmp'], [ 1, .25, .25, .25])+YWTadj;  //skill shots, adaptability, fortitude, teamplayer
                    p.compositeRating.minionControl =  makeComposite(rating, ['stl', 'blk', 'dnk','spd','pss','reb'], [2, .25, .25,.25,.25,.25])+YWTadj+langAdj; // last hitting,skill shot,laning, 
					
					// remove last hitting, focus on summoner spell for jungle
                    p.compositeRating.monstersKillingBD =  makeComposite(rating, ['stl', 'blk', 'tp', 'ins', 'fg'], [.25, 1, .25,.25,.5])+YWTadj+langAdj; // last hitting,skill shot,positioning, awareness, risktaking 
                    p.compositeRating.championKilling =  makeComposite(rating, ['hgt', 'stre', 'spd', 'ins','ft', 'fg','tp', 'blk', 'drb'], [1,1,1,1, 3, 1, 1, 1, 1])+YWTadj+langAdj; // positioning, skill shots, summoner spells, team fighting, risk taking
					
                    p.compositeRating.shotcalling =  makeComposite(rating, ['hgt','stre', 'spd', 'jmp','endu', 'ins','fg'], [1,1,1,1,4, 1, 1])+YWTadj+langAdj; //leadership, risk taking, awareness, adaptability
                    p.compositeRating.gameStrategy =  makeComposite(rating, ['hgt','stre', 'spd', 'jmp','endu', 'ins','fg'], [1,1,1,1,4, 1, 1])+YWTadj+langAdj; //leadership, risk taking, awareness, adaptability
                    p.compositeRating.equipmentBuying =  makeComposite(rating, ['ins', 'hgt'], [1, 1])+YWTadj+langAdj; // awareness, adaptability
                    p.compositeRating.levelingAbilities =  makeComposite(rating, ['ins', 'hgt', 'blk'], [1, 1, 1])+YWTadj+langAdj; // awareness, adaptability, skill shot
                    p.compositeRating.endurance =  makeComposite(rating, ['spd','pss'], [1,2]); // stamina
                    p.compositeRating.adaptability =  makeComposite(rating, ['hgt', 'stre', 'spd', ], [3,1,1])+YWTadj+langAdj; // adaptability
                    p.compositeRating.tilt =  makeComposite(rating, ['hgt', 'stre', 'spd', 'pss'], [1, 1, 1, 1])+YWTadj+langAdj; // adaptability, fortitude, consistency, stamina
                    p.compositeRating.aggression =  makeComposite(rating, ['fg', 'ins', 'tp'], [2, 1, 1])+YWTadj+langAdj; // risk taking, awareness, positioning
					
                    p.compositeRating.jungleControl =  makeComposite(rating, ['hgt', 'ins', 'fg', 'stre', 'spd','drb', 'blk','pss','reb'], [1, 1, 1,1,1,4,2,1,1])+YWTadj+langAdj; // adaptability, awareness, risk taking
                    p.compositeRating.monstersKillingJ =  makeComposite(rating, ['hgt', 'ins', 'fg', 'stre', 'spd','drb', 'blk','pss','reb'], [1, 1, 1,1,1,4,2,1,1])+YWTadj+langAdj; // adaptability, awareness, risk taking
					
					
                    p.compositeRating.gank =  makeComposite(rating, ['hgt', 'stre', 'spd', 'jmp','endu','ins', 'ft', 'fg','tp','blk','drb'], [1, 1, 1, 3,1,3,  1,12,1,1,1])+YWTadj+langAdj; // awareness , team fighting, risk taking, team player
					
                    p.compositeRating.teamwork =  makeComposite(rating,['hgt','stre', 'spd', 'jmp','ins','ft'], [1,1, 1, 2,1,1])+YWTadj+langAdj; // awareness, team fighting, leadership, team player				
                    p.compositeRating.mapVision =  makeComposite(rating,['hgt','stre', 'spd', 'jmp','ins','ft'], [1,1, 1, 2,1,1])+YWTadj+langAdj; // awareness, team fighting, leadership, team player				
                    p.compositeRating.wardDestruction =  makeComposite(rating,['hgt','stre', 'spd', 'jmp','ins','ft'], [1,1, 1, 2,1,1])+YWTadj+langAdj; // awareness, team fighting, leadership, team player				
                    p.compositeRating.wardPlacement =  makeComposite(rating,['hgt','stre', 'spd', 'jmp','ins','ft'], [1,1, 1, 2,1,1])+YWTadj+langAdj; // awareness, team fighting, leadership, team player				
                    p.compositeRating.laneSwitching =  makeComposite(rating,['hgt','stre', 'spd', 'jmp','ins','ft'], [1,1, 1, 2,1,1])+YWTadj+langAdj; // awareness, team fighting, leadership, team player				

					/// basketball below
					
                    p.compositeRating.pace = makeComposite(rating, ['spd', 'jmp', 'dnk', 'tp', 'stl', 'drb', 'pss'])+YWTadj+langAdj;
                    p.compositeRating.usage = Math.pow(makeComposite(rating, ['ins', 'dnk', 'fg', 'tp', 'spd', 'drb'], [1.5, 1, 1, 1, 0.15, 0.15]), 1.9)+YWTadj+langAdj;
                    p.compositeRating.dribbling = makeComposite(rating, ['drb', 'spd']);
                    p.compositeRating.passing = makeComposite(rating, ['drb', 'pss'], [0.4, 1]);
                    p.compositeRating.turnovers = makeComposite(rating, ['drb', 'pss', 'spd', 'hgt', 'ins'], [1, 1, -1, 1, 1])+YWTadj+langAdj;  // This should not influence whether a turnover occurs, it should just be used to assign players
                    p.compositeRating.shootingAtRim = makeComposite(rating, ['hgt', 'spd', 'jmp', 'dnk'], [1, 0.2, 0.6, 0.4])+YWTadj+langAdj;  // Dunk or layup, fast break or half court
                    p.compositeRating.shootingLowPost = makeComposite(rating, ['hgt', 'stre', 'spd', 'ins'], [1, 0.6, 0.2, 1])+YWTadj+langAdj;  // Post scoring
                    p.compositeRating.shootingMidRange = makeComposite(rating, ['hgt', 'fg'], [0.2, 1])+YWTadj+langAdj;  // Two point jump shot
                    p.compositeRating.shootingThreePointer = makeComposite(rating, ['hgt', 'tp'], [0.2, 1])+YWTadj+langAdj;  // Three point jump shot
                    p.compositeRating.shootingFT = makeComposite(rating, ['ft']);  // Free throw
                    p.compositeRating.rebounding = makeComposite(rating, ['hgt', 'stre', 'jmp', 'reb'], [1.5, 0.1, 0.1, 0.7])+YWTadj+langAdj;
                    p.compositeRating.stealing = makeComposite(rating, ['constant', 'spd', 'stl'], [1, 1, 1])+YWTadj+langAdj;
                    p.compositeRating.blocking = makeComposite(rating, ['hgt', 'jmp', 'blk'], [1.5, 0.5, 0.5])+YWTadj+langAdj;
                    p.compositeRating.fouling = makeComposite(rating, ['constant', 'hgt', 'blk', 'spd'], [1.5, 1, 1, -1])+YWTadj;
                    p.compositeRating.defense = makeComposite(rating, ['hgt', 'stre', 'spd', 'jmp', 'blk', 'stl'], [1, 1, 1, 0.5, 1, 1])+YWTadj+langAdj;
                    p.compositeRating.defenseInterior = makeComposite(rating, ['hgt', 'stre', 'spd', 'jmp', 'blk'], [2, 1, 0.5, 0.5, 1])+YWTadj+langAdj;
                    p.compositeRating.defensePerimeter = makeComposite(rating, ['hgt', 'stre', 'spd', 'jmp', 'stl'], [1, 1, 2, 0.5, 1])+YWTadj+langAdj;
                    p.compositeRating.endurance = makeComposite(rating, ['constant', 'endu', 'hgt'], [1, 1, -0.1])+YWTadj+langAdj;
                    p.compositeRating.athleticism = makeComposite(rating, ['stre', 'spd', 'jmp', 'hgt'], [1, 1, 1, 0.5])+YWTadj+langAdj; // Currently only used for synergy calculation

                  // These use the same formulas as the skill definitions in player.skills!
                    /*for (k in g.compositeWeights) {
                        if (g.compositeWeights.hasOwnProperty(k)) {
                            p.compositeRating[k] = makeComposite(rating, g.compositeWeights[k].ratings, g.compositeWeights[k].weights);
                        }
                    }
                    p.compositeRating.usage = Math.pow(p.compositeRating.usage, 1.9);*/							
					
					
                    p.stat = {gs: 0, min: 0, fg: 0, fga: 0,fgp:0, fgAtRim: 0, fgaAtRim: 0, fgpAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0,trb: 0, ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, courtTime: 0, benchTime: 0, energy: 1,oppJM:0,oppInh:0,oppTw:0,champPicked:"",scTwr:0,scKills:0,
						grExpTwr:0,
						grExpKills:0,
						grGldTwr:0,
						grGldKills:0,			
						tmBuffTwr:0,
						tmBuffKills:0,			
						tmBAdjTwr:0,
						tmBAdjKills:0,	
						TPTwr:0,
						TPKills:0,
						TwTwr:0,
						TwKills:0,	
						CKTwr:0,
						CKKills:0,	
					/*	CKTwr:0,
						CKKills:0,	*/
						CSTwr:0,
						CSKills:0,	
						AgTwr:0,
						AgKills:0,							
						ChmpnTwr:0,
						ChmpnKills:0
						
					};

                    t.player.push(p);
                }

                // Number of players to factor into pace and defense rating calculation
                numPlayers = t.player.length;
                if (numPlayers > 7) {
                    numPlayers = 7;
                }

                // Would be better if these were scaled by average min played and endurancence
                t.pace = 0;
                for (i = 0; i < numPlayers; i++) {
                    t.pace += t.player[i].compositeRating.pace;
                }
                t.pace /= numPlayers;
                t.pace = t.pace * 15 + 100;  // Scale between 100 and 115

                // Initialize team composite rating object
                t.compositeRating = {};
                for (rating in p.compositeRating) {
                    if (p.compositeRating.hasOwnProperty(rating)) {
                        t.compositeRating[rating] = 0;
                    }
                }

				
		      //  console.log(t.compositeRating)			
		
				
				
                t.stat = {min: 0, fg: 0, fga: 0,fgp:0, fgAtRim: 0, fgaAtRim: 0, fgpAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0, trb: 0,ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, ptsQtrs: [0],oppJM:0,oppInh:0,oppTw:0,scTwr:0,scKills:0,
					grExpTwr:0,
					grExpKills:0,
					grGldTwr:0,
					grGldKills:0,			
					tmBuffTwr:0,
					tmBuffKills:0,			
					tmBAdjTwr:0,
					tmBAdjKills:0,
					TPTwr:0,
					TPKills:0,
					TwTwr:0,
					TwKills:0,	
					CKTwr:0,
					CKKills:0,	
					/*CKTwr:0,
					CKKills:0,	*/
					CSTwr:0,
					CSKills:0,	
					AgTwr:0,
					AgKills:0,	
					ChmpnTwr:0,
					ChmpnKills:0
					
				};

                return t;
            });
        };

        promises = [];

        for (tid = 0; tid < g.numTeams; tid++) {
            promises.push(loadTeam(tid));
        }

        return Promise.all(promises);
    }

    /**
     * Play one or more days of games.
     *
     * This also handles the case where there are no more games to be played by switching the phase to either the playoffs or before the draft, as appropriate.
     *
     * @memberOf core.game
     * @param {number} numDays An integer representing the number of days to be simulated. If numDays is larger than the number of days remaining, then all games will be simulated up until either the end of the regular season or the end of the playoffs, whichever happens first.
     * @param {boolean} start Is this a new request from the user to play games (true) or a recursive callback to simulate another day (false)? If true, then there is a check to make sure simulating games is allowed. Default true.
     * @param {number?} gidPlayByPlay If this number matches a game ID number, then an array of strings representing the play-by-play game simulation are included in the ui.realtimeUpdate raw call.
     */
    function play(numDays, start, gidPlayByPlay) {
        var cbNoGames, cbPlayGames, cbRunDay, cbSaveResults, cbSimGames;

        start = start !== undefined ? start : true;

        // This is called when there are no more games to play, either due to the user's request (e.g. 1 week) elapsing or at the end of the regular season
        cbNoGames = function () {
            ui.updateStatus("Idle");
            return league.setGameAttributesComplete({gamesInProgress: false}).then(function () {
                return ui.updatePlayMenu(null);
            }).then(function () {
                // Check to see if the season is over
                if (g.phase < g.PHASE.PLAYOFFS) {
                    return season.getSchedule().then(function (schedule) {
                        if (schedule.length === 0) {
                            // No return here, meaning no need to wait for phase.newPhase to resolve - is that correct?
                            phase.newPhase(g.PHASE.PLAYOFFS);
                            ui.updateStatus("Idle");  // Just to be sure..
                        }
                    });
                }
            });
        };

        // Saves a vector of results objects for a day, as is output from cbSimGames
        cbSaveResults = function (results) {
            var cbSaveResult, gidsFinished, tx;

			//console.log("gamePlayed");
            gidsFinished = [];

            tx = dao.tx(["events", "games", "players", "playerFeats", "playerStats", "playoffSeries", "releasedPlayers", "schedule", "teams","champions"], "readwrite");

            cbSaveResult = function (i) {
//console.log('cbSaveResult ' + i)
                // Save the game ID so it can be deleted from the schedule below
                gidsFinished.push(results[i].gid);

//console.log(results[i]);
			//	console.log("here");
                writeTeamStats(tx, results[i]).then(function (att) {
				//console.log("here");
                    return writeGameStats(tx, results[i], att);
                }).then(function () {
				//console.log("here");			
                    return writePlayerStats(tx, results[i]);

                }).then(function () {
					//console.log("written");					
                    var j;

                    if (i > 0) {
                        cbSaveResult(i - 1);
                    } else {
                        // Delete finished games from schedule
                        for (j = 0; j < gidsFinished.length; j++) {
                            dao.schedule.delete({ot: tx, key: gidsFinished[j]});
                        }

                        // Update ranks
                        finances.updateRanks(tx, ["expenses", "revenues"]);

                        // Injury countdown - This must be after games are saved, of there is a race condition involving new injury assignment in writeStats
                        dao.players.iterate({
                            ot: tx,
                            index: "tid",
                            key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                            callback: function (p) {
                                var changed;

                                changed = false;
                                if (p.injury.gamesRemaining > 0) {
                                    p.injury.gamesRemaining -= 1;
                                    changed = true;
                                }
                                // Is it already over?
                                 // Is it already over?
                                if (p.injury.type !== "Healthy" && p.injury.gamesRemaining <= 0) {
                                    p.injury = {type: "Healthy", gamesRemaining: 0};
                                    changed = true;

                                    eventLog.add(tx, {
                                        type: "healed",
                                        text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> has recovered from his injury.',
                                        showNotification: p.tid === g.userTid,
                                        pids: [p.pid],
                                        tids: [p.tid]
                                    });
                                }

                                // Also check for gamesUntilTradable
                                if (!p.hasOwnProperty("gamesUntilTradable")) {
                                    p.gamesUntilTradable = 0; // Initialize for old leagues
                                    changed = true;
                                } else if (p.gamesUntilTradable > 0) {
                                    p.gamesUntilTradable -= 1;
                                    changed = true;
                                }

                                // Also check for gamesUntilTradable
                                if (!p.hasOwnProperty("gamesUntilTradable")) {
                                    p.gamesUntilTradable = 0; // Initialize for old leagues
                                    changed = true;
                                } else if (p.gamesUntilTradable > 0) {
                                    p.gamesUntilTradable -= 1;
                                    changed = true;
                                }

                                if (changed) {
                                    return p;
                                }
                            }
                        });
                    }
                });
            };

            if (results.length > 0) {
                cbSaveResult(results.length - 1);
            }

            tx.complete().then(function () {
                var i, raw, url;

                // If there was a play by play done for one of these games, get it
                if (gidPlayByPlay !== undefined) {
                    for (i = 0; i < results.length; i++) {
                        if (results[i].playByPlay !== undefined) {
                            raw = {
                                gidPlayByPlay: gidPlayByPlay,
                                playByPlay: results[i].playByPlay
                            };
                            url = helpers.leagueUrl(["live_game"]);
                        }
                    }
                } else {
                    url = undefined;
                }

                // Update all advanced stats every day
                advStats.calculateAll().then(function () {
                    ui.realtimeUpdate(["gameSim"], url, function () {
                        league.updateLastDbChange();

                        if (g.phase === g.PHASE.PLAYOFFS) {
                            // oncomplete is to make sure newSchedulePlayoffsDay finishes before continuing
                            tx = dao.tx(["playoffSeries", "schedule", "teams"], "readwrite");
                            season.newSchedulePlayoffsDay(tx).then(function (playoffsOver) {
                                tx.complete().then(function () {
                                    if (playoffsOver) {
                                        return phase.newPhase(g.PHASE.BEFORE_DRAFT);
                                    }
                                }).then(function () {
                                    play(numDays - 1, false);
                                });
                            });
                        } else {
                            play(numDays - 1, false);
                        }
                    }, raw);
                });
            });
        };

        // Simulates a day of games (whatever is in schedule) and passes the results to cbSaveResults
        cbSimGames = function (schedule, teams) {
            var doPlayByPlay, gs, i, results;

            results = [];
			//console.log(schedule.length);
            for (i = 0; i < schedule.length; i++) {
                doPlayByPlay = gidPlayByPlay === schedule[i].gid;
			//	console.log(doPlayByPlay);
                gs = new gameSim.GameSim(schedule[i].gid, teams[schedule[i].homeTid], teams[schedule[i].awayTid], doPlayByPlay);
                results.push(gs.run());
            }
            return cbSaveResults(results);
        };

        // Simulates a day of games. If there are no games left, it calls cbNoGames.
        // Promise is resolved after games are run
        cbPlayGames = function () {
            var tx;

			if (g.phase <= g.PHASE.PLAYOFFS) {
				if (numDays === 1) {
					ui.updateStatus("Playing (1 week left)");
				} else {
					ui.updateStatus("Playing (" + numDays + " weeks left)");
				}				
			} else {
				if (numDays === 1) {
					ui.updateStatus("Playing (1 day left)");
				} else {
					ui.updateStatus("Playing (" + numDays + " days left)");
				}				
			}


//            tx = dao.tx(["players", "schedule", "teams","champions"]);
            tx = dao.tx(["players", "playerStats", "schedule", "teams","champions","championPatch"]);

            // Get the schedule for today
            return season.getSchedule({ot: tx, oneDay: true}).then(function (schedule) {
                // Stop if no games
                // This should also call cbNoGames after the playoffs end, because g.phase will have been incremented by season.newSchedulePlayoffsDay after the previous day's games
                if (schedule.length === 0 && g.phase !== g.PHASE.PLAYOFFS) {
                    return cbNoGames();
                }

                // Load all teams, for now. Would be more efficient to load only some of them, I suppose.
                return loadTeams(tx).then(function (teams) {
                    var tx;					
                    // Play games
                    // Will loop through schedule and simulate all games

                    if (schedule.length === 0 && g.phase === g.PHASE.PLAYOFFS) {
                        // Sometimes the playoff schedule isn't made the day before, so make it now
                        // This works because there should always be games in the playoffs phase. The next phase will start before reaching this point when the playoffs are over.
                        //return season.newSchedulePlayoffsDay().then(function () {
                        // oncomplete is to make sure newSchedulePlayoffsDay finishes before continuing
                        tx = dao.tx(["playoffSeries", "schedule", "teams"], "readwrite");
                        season.newSchedulePlayoffsDay(tx);
                        tx.complete().then(function () {							
							//console.log(schedule.length);
						
                            return season.getSchedule({oneDay: true}).then(function (schedule) {
						//	console.log(schedule.length);
						//	console.log(schedule);
							
// Can't merge easily with next call because of schedule overwriting
                                return cbSimGames(schedule, teams);
                            });
                        });
                    }
                    return cbSimGames(schedule, teams);
                });
            });
        };

        // This simulates a day, including game simulation and any other bookkeeping that needs to be done
        cbRunDay = function () {
             if (numDays > 0) {
                // Hit the DB to check stopGames in case it came from another tab
                return league.loadGameAttribute(null, "stopGames").then(function () {
                    // If we didn't just stop games, let's play
                    // Or, if we are starting games (and already passed the lock), continue even if stopGames was just seen
                    if (start || !g.stopGames) {
                        return Promise.try(function () {
                            // If start is set, then reset stopGames
                            if (g.stopGames) {
                                return league.setGameAttributesComplete({stopGames: false});
                            }
                        }).then(function () {
                            // Check if it's the playoffs and do some special stuff if it is or isn't
                            return Promise.try(function () {
                            if (g.phase !== g.PHASE.PLAYOFFS) {
                                     // Decrease free agent demands and let AI teams sign them
                                    return freeAgents.decreaseDemands().then(freeAgents.autoSign);
                                }
                            }).then(cbPlayGames);
                        });
                    }

                    // Update UI if stopped
                    return cbNoGames();
                });
            }

            if (numDays === 0) {
                // If this is the last day, update play menu
                return cbNoGames();
            }
        };

        // If this is a request to start a new simulation... are we allowed to do
        // that? If so, set the lock and update the play menu
        if (start) {
            lock.canStartGames(null).then(function (canStartGames) {
// How do I flatten conditional into promise chain?
                if (canStartGames) {
				//	console.log("checkroster?");
                    team.checkRosterSizes().then(function (userTeamSizeError) {
                        if (userTeamSizeError === null) {
                            league.setGameAttributesComplete({gamesInProgress: true}).then(function () {
                                ui.updatePlayMenu(null).then(cbRunDay);
                            });
                        } else {
                            ui.updateStatus("Idle");
                            helpers.errorNotify(userTeamSizeError);
                        }
                    });
                }
            });
        } else {
            cbRunDay();
        }
    }

    return {
        play: play
    };
});
