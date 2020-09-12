/**
 * @name core.game
 * @namespace Everything about games except the actual simulation. So, loading the schedule, loading the teams, saving the results, and handling multi-day simulations and what happens when there are no games left to play.
 */
define(["dao",  "globals", "ui", "core/freeAgents", "core/finances", "core/gameSim", "core/league", "core/phase", "core/player", "core/season", "core/team", "lib/bluebird", "util/advStats", "util/eventLog", "util/lock", "util/helpers", "util/random"], function (dao, g, ui, freeAgents, finances, gameSim, league, phase, player, season, team, Promise, advStats, eventLog, lock, helpers, random) {
    "use strict";

    function writeTeamStats(tx, results) {
        return Promise.reduce([0, 1], function (att, t1) {
            var t2;

            t2 = t1 === 1 ? 0 : 1;

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
					att = 10000 + (0.1 + 0.9 * Math.pow(teamSeason.hype, 2)) * teamSeason.pop * 1000000 * 0.01;  // Base attendance - between 2% and 0.2% of the region
					 if (g.phase === g.PHASE.PLAYOFFS) {
						att *= 1.5;  // Playoff bonus
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
                if (g.phase !== g.PHASE.PLAYOFFS) {
                    // All in [thousands of dollars]
                    salaryPaid = payroll / 16;
                    scoutingPaid = t.budget.scouting.amount / 16;
                    coachingPaid = t.budget.coaching.amount / 16;
                    healthPaid = t.budget.health.amount / 16;
                    facilitiesPaid = t.budget.facilities.amount / 16;
                    merchRevenue = 3 * att / 1000*82/16*5;
                    if (merchRevenue > 250*82/16*5) {
                        merchRevenue = 250*82/16*5;
                    }
                    sponsorRevenue = 10 * att / 1000*82/16*5;
                    if (sponsorRevenue > 600*82/16*5) {
                        sponsorRevenue = 600*82/16*5;
                    }
                    nationalTvRevenue = 250*82/16*15;
                    localTvRevenue = 10 * att / 1000*82/16*5;
                    if (localTvRevenue > 1200*82/16*5) {
                        localTvRevenue = 1200*82/16*5;
                    }
                }


                // Attendance - final estimate
                if (t1 === 0) { // Base on home team				
					att = random.gauss(att, 1000);
					att *= 100 / t.budget.ticketPrice.amount ;  // Attendance depends on ticket price. Not sure if this formula is reasonable.
					att *= 1 + 0.075 * (g.numTeams - finances.getRankLastThree(t, "expenses", "facilities")) / (g.numTeams - 1);  // Attendance depends on facilities. Not sure if this formula is reasonable.
					att *= .5;  // Attendance depends on facilities. Not sure if this formula is reasonable.
					att += 30000;  // Attendance depends on facilities. Not sure if this formula is reasonable.
					if (att > 90000) {
						att = 90000;
					} else if (att < 0) {
						att = 0;
					}
					att = Math.round(att);
                }
                // This doesn't really make sense				
                ticketRevenue = t.budget.ticketPrice.amount * att / 1000;  // [thousands of dollars]

                // Hype - relative to the expectations of prior seasons
                if (teamSeason.gp > 5 && g.phase !== g.PHASE.PLAYOFFS) {
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
                        winpOld = 0.5;  // Default for new games
                    }

                    // It should never happen, but winp and winpOld sometimes turn up as NaN due to a duplicate season entry or the user skipping seasons
                    if (winp !== winp) {
                        winp = 0;
                    }
                    if (winpOld !== winpOld) {
                        winpOld = 0;
                    }

                    teamSeason.hype = teamSeason.hype + 0.01 * (winp - 0.55) + 0.015 * (winp - winpOld);
                    if (teamSeason.hype > 1) {
                        teamSeason.hype = 1;
                    } else if (teamSeason.hype < 0) {
                        teamSeason.hype = 0;
                    }
                }

                revenue = merchRevenue + sponsorRevenue + nationalTvRevenue + localTvRevenue + ticketRevenue;
                expenses = salaryPaid + scoutingPaid + coachingPaid + healthPaid + facilitiesPaid;
                teamSeason.cash += revenue - expenses;
                if (t1 === 0) {
                    // Only home team gets attendance...
                    teamSeason.att += att;
                    // This is only used for attendance tracking
                    if (!teamSeason.hasOwnProperty("gpHome")) { teamSeason.gpHome = Math.round(teamSeason.gp / 2); } // See also team.js and teamFinances.js
                    teamSeason.gpHome += 1;					
					
                }
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

                keys = ['min', 'fg', 'fga', 'fgAtRim', 'fgaAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts', 'tgts', 'ols', 'olr', 'olp', 'olry', 'olpy', 'olc', 'oltd', 'der', 'dep', 'dery', 'depy', 'dec', 'detd','prp','fdt','fdp','fdr','ty','syl','tda','tdf','rztd','rza','top','fbl','fbll','fblr','fbltd','inter','intery','intertd','pen','peny','qr','qbr','war','warr','warp','warre','ward','warol','wardl','pr','pry','prtd','kr','kry','krtd','kol','koa','koav','koy','rushl','rusha','recl','reca','passa','prl','pra','krl','kra','fgl','fgat','puntl','punta','olary','olapy','olrp','fldgze','fldgtw','fldgth','fldgfo','fldgfi','puntty','punttb','fldgzea','fldgtwa','fldgtha','fldgfoa','fldgfia','turn','turnopp','oppfumble','tottd','opptd','opptdp','opptdr','oppfd','oppfdp','oppfdr','opppasa','opppasc','depc'];
                for (i = 0; i < keys.length; i++) {
                    teamStats[keys[i]] += results.team[t1].stat[keys[i]];
                }
                teamStats.gp += 1;
                teamStats.trb += results.team[t1].stat.orb + results.team[t1].stat.drb;
                teamStats.oppPts += results.team[t2].stat.pts;

                if (teamSeason.lastTen.length === 10 && g.phase !== g.PHASE.PLAYOFFS) {
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
						keys = ['gs', 'min', 'fg', 'fga', 'fgAtRim', 'fgaAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts', 'tgts', 'ols', 'olr', 'olp', 'olry', 'olpy', 'olc', 'oltd', 'der', 'dep', 'dery', 'depy', 'dec', 'detd','prp','fdt','fdp','fdr','ty','syl','tda','tdf','rztd','rza','top','fbl','fbll','fblr','fbltd','inter','intery','intertd','pen','peny','qr','qbr','war','warr','warp','warre','ward','warol','wardl','pr','pry','prtd','kr','kry','krtd','kol','koa','koav','koy','rushl','rusha','recl','reca','passa','prl','pra','krl','kra','fgl','fgat','puntl','punta','olary','olapy','olrp','fldgze','fldgtw','fldgth','fldgfo','fldgfi','puntty','punttb','fldgzea','fldgtwa','fldgtha','fldgfoa','fldgfia','turn','turnopp','oppfumble','tottd','opptd','opptdp','opptdr','oppfd','oppfdp','oppfdr','opppasa','opppasc','depc'];
                        for (i = 0; i < keys.length; i++) {
                            ps[keys[i]] += p.stat[keys[i]];
                        }
                        ps.gp += 1; // Already checked for non-zero minutes played above
                        ps.trb += p.stat.orb + p.stat.drb;

                        injuredThisGame = p.injured && p.injury.type === "Healthy";

                        // Only update player object (values and injuries) every 10 regular season games or on injury
                        if ((ps.gp % 2 === 0 && g.phase !== g.PHASE.PLAYOFFS) || injuredThisGame) {
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

	/*
    function writePlayerStats(tx, results) {
        var  afterDonePlayer,  key, that;

        that = this;

        afterDonePlayer = function () {
            if (p < results.team[t].player.length - 1) {
                results.writePlayerStats(tx, t, p + 1, cb);
            } else if (t === 0) {
                results.writePlayerStats(tx, 1, 0, cb);
            } else {
                cb();
            }
        };
		
        // Only need to write stats if player got minutes
        if (results.team[t].player[p].stat.min === 0) {
            afterDonePlayer();
        } else {				
            key = [results.team[t].player[p].id, g.season, results.team[t].id];
            // "prev" is in case there are multiple entries for the same player, like he was traded away and then brought back
            tx.objectStore("playerStats").index("pid, season, tid").openCursor(key, "prev").onsuccess = function (event) {
 
                var cursor, i, injuredThisGame, keys, playerStats;

                cursor = event.target.result;
//console.log(cursor);
                playerStats = cursor.value;

                // Since index is not on playoffs, manually check
                if (playerStats.playoffs !== (g.phase === g.PHASE.PLAYOFFS)) {
                    return cursor.continue();
                }				// Update stats
				keys = ['gs', 'min', 'fg', 'fga', 'fgAtRim', 'fgaAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts', 'tgts', 'ols', 'olr', 'olp', 'olry', 'olpy', 'olc', 'oltd', 'der', 'dep', 'dery', 'depy', 'dec', 'detd','prp','fdt','fdp','fdr','ty','syl','tda','tdf','rztd','rza','top','fbl','fbll','fblr','fbltd','inter','intery','intertd','pen','peny','qr','qbr','war','warr','warp','warre','ward','warol','wardl','pr','pry','prtd','kr','kry','krtd','kol','koa','koav','koy','rushl','rusha','recl','reca','passa','prl','pra','krl','kra','fgl','fgat','puntl','punta','olary','olapy','olrp','fldgze','fldgtw','fldgth','fldgfo','fldgfi','puntty','punttb','fldgzea','fldgtwa','fldgtha','fldgfoa','fldgfia','turn','turnopp','oppfumble','tottd','opptd','opptdp','opptdr','oppfd','oppfdp','oppfdr','opppasa','opppasc','depc'];
				for (i = 0; i < keys.length; i++) {
					playerStats[keys[i]] += results.team[t].player[p].stat[keys[i]];
				}
				// Only count a game played if the player recorded minutes
                playerStats.gp += 1; // Already checked for non-zero minutes played above

				playerStats.trb += results.team[t].player[p].stat.orb + results.team[t].player[p].stat.drb;
                cursor.update(playerStats);

                injuredThisGame = results.team[t].player[p].injured && results.team[t].player[p].injury.type === "Healthy";

                // Only update player object (values and injuries) every 10 regular season games or on injury
                if ((playerStats.gp % 2 === 0 && g.phase !== g.PHASE.PLAYOFFS) || (injuredThisGame)) {
                    // This could be throttled to happen like every ~10 games or when there is an injury. Need to benchmark potential performance increase
                    tx.objectStore("players").openCursor(results.team[t].player[p].id).onsuccess = function (event) {
                        var cursor, player_;

                        cursor = event.target.result;
                        player_ = cursor.value;

                        // Injury crap - assign injury type if player does not already have an injury in the database
                        if (injuredThisGame) {
                            player_.injury = player.injury(results.team[t].healthRank);
                            results.team[t].player[p].injury = player_.injury; // So it gets written to box score
                            if (results.team[t].id === g.userTid) {
                                eventLog.add(tx, {
                                    type: "injured",
                                    text: '<a href="' + helpers.leagueUrl(["player", player_.pid]) + '">' + player_.name + '</a> was injured! (' + player_.injury.type + ', out for ' + player_.injury.gamesRemaining + ' games)'
                                });
                            }
                        }

                        // Player value depends on ratings and regular season stats, neither of which can change in the playoffs
                        if (g.phase !== g.PHASE.PLAYOFFS) {
                            player.updateValues(tx, player_, [playerStats]).then(function (player_) {

                                cursor.update(player_);
                                afterDonePlayer();
                            });
                        } else {
                            cursor.update(player_);
                            afterDonePlayer();
                        }
                    };
                } else {

                    afterDonePlayer();
                }
            };
        }
    };
	*/

    function writeGameStats(tx, results, att) {
        var gameStats, i, keys, p,  t, text, tl, tw;

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

    //    gameStats = {gid: results.gid, att: this.att, season: g.season, playoffs: this.playoffs, overtimes: this.overtimes, won: {}, lost: {}, teams: [{tid: this.team[0].id, players: []}, {tid: this.team[1].id, players: []}]};
        for (t = 0; t < 2; t++) {
            keys = ['min', 'fg', 'fga', 'fgAtRim', 'fgaAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts', 'ptsQtrs', 'tgts', 'ols', 'olr', 'olp', 'olry', 'olpy', 'olc', 'oltd', 'der', 'dep', 'dery', 'depy', 'dec', 'detd','prp','fdt','fdp','fdr','ty','syl','tda','tdf','rztd','rza','top','fbl','fbll','fblr','fbltd','inter','intery','intertd','pen','peny','qr','qbr','war','warr','warp','warre','ward','warol','wardl','pr','pry','prtd','kr','kry','krtd','kol','koa','koav','koy','rushl','rusha','recl','reca','passa','prl','pra','krl','kra','fgl','fgat','puntl','punta','olary','olapy','olrp','fldgze','fldgtw','fldgth','fldgfo','fldgfi','puntty','punttb','fldgzea','fldgtwa','fldgtha','fldgfoa','fldgfia','turn','turnopp','oppfumble','tottd','opptd','opptdp','opptdr','oppfd','oppfdp','oppfdr','opppasa','opppasc','depc'];
            for (i = 0; i < keys.length; i++) {
                gameStats.teams[t][keys[i]] = results.team[t].stat[keys[i]];
            }
            gameStats.teams[t].trb = results.team[t].stat.orb + results.team[t].stat.drb;

            keys.unshift("gs"); // Also record starters, in addition to other stats
            for (p = 0; p < results.team[t].player.length; p++) {
                gameStats.teams[t].players[p] = {name: results.team[t].player[p].name, pos: results.team[t].player[p].pos, active: results.team[t].player[p].active, offDefK: results.team[t].player[p].offDefK, rosterOrder: results.team[t].player[p].rosterOrder};
                for (i = 0; i < keys.length; i++) {
                    gameStats.teams[t].players[p][keys[i]] = results.team[t].player[p].stat[keys[i]];
                }
                gameStats.teams[t].players[p].trb = results.team[t].player[p].stat.orb + results.team[t].player[p].stat.drb;
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
   /*    if (results.team[0].id === g.userTid || results.team[1].id === g.userTid) {
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
                text = 'Your team defeated the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tl].id], g.season]) + '">' + g.teamNamesCache[results.team[tl].id];
            } else {
                text = 'Your team lost to the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tw].id], g.season]) + '">' + g.teamNamesCache[results.team[tw].id];
            }
            text += '</a> <a href="' + helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid]) + '">' + results.team[tw].stat.pts + "-" + results.team[tl].stat.pts + "</a>.";
            eventLog.add(tx, {
                type: results.team[tw].id === g.userTid ? "gameWon" : "gameLost",
                text: text,
                saveToDb: false,
                tids: [results.team[0].id, results.team[1].id]
            });
        }
		
        /*    if (results.team[tw].id === g.userTid) {
                text = 'Your team defeated the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tl].id], g.season]) + '">' + g.teamNamesCache[results.team[tl].id];
            } else {
                text = 'Your team lost to the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tw].id], g.season]) + '">' + g.teamNamesCache[results.team[tw].id];
            }
            text += '</a> <a href="' + helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.id]) + '">' + results.team[tw].stat.pts + "-" + results.team[tl].stat.pts + "</a>.";
            eventLog.add(tx, {
                type: results.team[tw].id === g.userTid ? "gameWon" : "gameLost",
                text: text
            });
        }*/


        return dao.games.put({ot: tx, value: gameStats}).then(function () {
            // Record progress of playoff series, if appropriate
            if (!gameStats.playoffs) {
                return;
            }

            return dao.playoffSeries.get({ot: tx, key: g.season}).then(function (playoffSeries) {
                //var currentRoundText, i, loserWon, otherTid, playoffRound, series, won0;
                var currentRoundText, i, loserWon, otherTid, playoffRound, playoffSeries, series, won0;
				var winnerPoints,loserPoints;
                var currentRoundText, i, loserTid, loserWon, playoffRound, series, showNotification, winnerTid, won0;
			
                playoffRound = playoffSeries.series[playoffSeries.currentRound];

                // Did the home (true) or away (false) team win this game? Here, "home" refers to this game, not the team which has homecourt advnatage in the playoffs, which is what series.home refers to below.
                if (results.team[0].stat.pts > results.team[1].stat.pts) {
                    won0 = true;
					winnerPoints = results.team[0].stat.pts;
					loserPoints = results.team[1].stat.pts;					
                } else {
                    won0 = false;
					winnerPoints = results.team[0].stat.pts;
					loserPoints = results.team[1].stat.pts;
                }

                for (i = 0; i < playoffRound.length; i++) {
                    series = playoffRound[i];

                    if (series.home.tid === results.team[0].id) {
						
						series.home.pts = results.team[0].stat.pts;
						series.away.pts = results.team[1].stat.pts;													
						
                        if (won0) {
                            series.home.won += 1;
                        } else {
                            series.away.won += 1;
                        }
                        break;
                    } else if (series.away.tid === results.team[0].id) {
						
						series.home.pts = results.team[0].stat.pts;
						series.away.pts = results.team[1].stat.pts;							
						
                        if (won0) {
                            series.away.won += 1;
                        } else {
                            series.home.won += 1;
                        }
                        break;
                    }
                }

                // Check if the user's team won/lost a playoff series (before the finals)
                /*if ((g.userTid === results.team[0].id || g.userTid === results.team[1].id) && playoffSeries.currentRound < 3) {
                    if (series.away.won === 1 || series.home.won === 1) {
                        otherTid = g.userTid === results.team[0].id ? results.team[1].id : results.team[0].id;
                        loserWon = series.away.won === 1 ? series.home.won : series.away.won;

                        if (playoffSeries.currentRound === 0) {
                            currentRoundText = "first round of the playoffs";
                        } else if (playoffSeries.currentRound === 1) {
                            currentRoundText = "second round of the playoffs";
                        } else if (playoffSeries.currentRound === 2) {
                            currentRoundText = "conference finals";
                        }
                        // ...no finals because that is handled separately

                        if ((series.away.tid === g.userTid && series.away.won === 1) || (series.home.tid === g.userTid && series.home.won === 1)) {
                            eventLog.add(tx, {
                                type: "playoffs",
//                                text: 'Your team defeated the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamNamesCache[otherTid] + '</a> in the ' + currentRoundText + ', 1-' + loserWon + '.'
                                text: 'Your team defeated the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamNamesCache[otherTid] + '</a> in the ' + currentRoundText + ','+winnerPoints+'-'+loserPoints+'.'
                            });
                        } else {
                            eventLog.add(tx, {
                                type: "playoffs",
//                                text: 'Your team was eliminated by the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamNamesCache[otherTid] + '</a> in the ' + currentRoundText + ', 1-' + loserWon + '.'
                                text: 'Your team was eliminated by the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamNamesCache[otherTid] + '</a> in the ' + currentRoundText + ','+winnerPoints+'-'+loserPoints+'.'
                            });
                        }
                    }
                }

                // If somebody just won the title, announce it
                if (playoffSeries.currentRound === 3 && (series.away.won === 1 || series.home.won === 1)) {
                    if ((series.away.tid === g.userTid && series.away.won === 1) || (series.home.tid === g.userTid && series.home.won === 1)) {
                        eventLog.add(tx, {
                            type: "playoffs",
//                            text: 'Your team won the ' + g.season + ' league championship!'
                            text: 'Your team won the ' + g.season + ' league championship!'
                        });
                    } else {
                        otherTid = series.away.won === 1 ? series.away.tid : series.home.tid;
                        eventLog.add(tx, {
                            type: "playoffs",
                            text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamRegionsCache[otherTid]+ ' ' + g.teamNamesCache[otherTid] + '</a> won the ' + g.season + ' league championship!'
                        });
                    }
                }*/
                // Log result of playoff series
                if (series.away.won === 1 || series.home.won === 1) {
                    if (series.away.won === 1) {
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
                        text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[winnerTid], g.season]) + '">' + g.teamNamesCache[winnerTid] + '</a> defeated the <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[loserTid], g.season]) + '">' + g.teamNamesCache[loserTid] + '</a> in the ' + currentRoundText + '.',
//                        text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[otherTid], g.season]) + '">' + g.teamRegionsCache[otherTid]+ ' ' + g.teamNamesCache[otherTid] + '</a> won the ' + g.season + ' league championship!'						
                        showNotification: showNotification,
                        tids: [winnerTid, loserTid]
                    });
                }				

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
        var add, component, divideBy, i, r, rcomp, rmax, sign, y;

        if (weights === undefined) {
            // Default: array of ones with same size as components
            weights = [];
            for (i = 0; i < components.length; i++) {
                weights.push(1);
            }
        }

        rating.constant = 50;

        r = 0;
        rmax = 0;
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

		if (typeof(g.customRosterMode) == 'undefined') {
		} else {
			if (g.customRosterMode)  {
				//r += .01;
				//let factor = .99;
				//r = factor;
				//if (r < 0) {
//				  r = .01;
	//			}
		//		r *= (1+(factor)/(1-factor));

				
		        r *= r;
				if (r > 1) {
					console.log(r);					
					r = 1;
				} else if (r < 0) {
					console.log(r);					
					r = 0;
				} else if (r == undefined)				 {
					console.log(r);
				} else if (r <1)				 {

				} else 			 {
					console.log(r);
				}
			//	if (Math.random() > .99) {
				//	console.log(r);
				//}				
					
			} else {
			}
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

        loadTeam = function (tid) {
            return Promise.all([
                dao.players.getAll({ot: ot, index: "tid", key: tid}),
                dao.teams.get({ot: ot, key: tid})
            ]).spread(function (players, team) {
                var i, j,k, numPlayers, p, rating, t, teamSeason;
				
				
		//console.log("preload");

                players.sort(function (a, b) { return a.rosterOrder - b.rosterOrder; });

                t = {id: tid, defense: 0, pace: 0, won: 0, lost: 0, cid: 0, did: 0, stat: {}, player: [], synergy: {off: 0, def: 0, reb: 0}};
 
			//		console.log("g.numTeams: "+g.numTeams)
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

                    for (i = 0; i < players.length; i++) {
                        p = {id: players[i].pid, name: players[i].name, pos: players[i].pos, valueNoPot: players[i].valueNoPot, stat: {}, compositeRating: {}, skills: [],injury: players[i].injury, injured: players[i].injury.type !== "Healthy", ptModifier: players[i].ptModifier, active: players[i].active, offDefK: players[i].offDefK, rosterOrder: players[i].rosterOrder};

                        // Reset ptModifier for AI teams. This should not be necessary since it should always be 1, but let's be safe.
                        if (t.id !== g.userTid) {
                            p.ptModifier = 1;
                        }

                        for (j = 0; j < players[i].ratings.length; j++) {
                            if (players[i].ratings[j].season === g.season) {
                                rating = players[i].ratings[j];
                                break;
                            }
                        }

						if (rating === undefined) {
							throw new Error("Player with no ratings for this season: " + players[i].name + "(ID: " + players[i].pid +")");
						}
						
						
                        p.skills = rating.skills;

                        p.ovr = rating.ovr;

						
						/////
						
						
						////QB (short, long)
	/*					p.compositeRating.throwingAccuracy = makeComposite(rating, ['blk', 'ins', 'stre'], [1, 1, .25]);
						p.compositeRating.throwingDistance = makeComposite(rating, ['blk', 'ins', 'stre'], [1, .5, 1]);
						p.compositeRating.avoidSack = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft'], [1, 1, 1,1, 1, 1]);
						
						// RB  (straight, side)////
						p.compositeRating.runningPower = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft'], [1, 2, 1,1, 2, .25]);

						console.log(t.id+" "+p.name+" "+p.pos+" "+i+" "+p.compositeRating.runningPower);
						
						p.compositeRating.runningSide = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft'], [1, 1, 1, 1, 1, 1]);  // also for any runner QB,WR

						console.log(rating.hgt);
						console.log(rating.stre);
						console.log(rating.jmp);
						console.log(rating.ins);
						console.log(rating.dnk);
						console.log(rating.ft);						
						console.log(t.id+" "+p.name+" "+p.pos+" "+i+" "+p.compositeRating.runningSide);
						
						// WR  (deep,short,crossing)
						p.compositeRating.receivingShort = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'], [.5, 1, 1,1, 1, 1,2,2,4]);  
						p.compositeRating.receivingCrossing = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'], [2, 1, 1,1, 2, 2,1,2,4]);
						p.compositeRating.receivingLong = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','stl'], [8, 1, 1,1, 1, 1,1,4,8]); 
			
						
						
						// OL  (pass ,run)
						p.compositeRating.blockRun = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','drb'], [2, 1, 2,1, 6, 1,1,2,4]); 
						p.compositeRating.blockPass = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'dnk', 'ft','endu','hnd','drb'], [1, 2, 1,2, 1, 2,1,4,8]); 
						
						
						// DL (pass-rush, run stop)
						p.compositeRating.passRush = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','pss'], [2, 2, 2,0, 2, 2,2,0,8]); // skill rushing
						p.compositeRating.runStop = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','reb'], [2, 2, 2,0, 2, 2,2,0,8]);  // skill tackling
						
						// LB (pass-rush, run stop,pass-short)
						p.compositeRating.shortCoverage = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'], [3, 1, 3,0, 2, 2,2,0,8]);  // skill coverage
						
						// S (pass-short, pass-long,pass-crossing)
						p.compositeRating.crossingCoverage = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'], [6, 1, 2,0, 2, 2,0,0,12]);  // skill coverage
						p.compositeRating.deepCoverage = makeComposite(rating, ['hgt', 'stre', 'jmp', 'ins', 'fg', 'tp','endu','hnd','cvr'], [15, 1, 2,0, 2, 2,0,0,15]);  // skill coverage
						
						// CB (pass-short, pass-long,pass-crossing)
						
						p.compositeRating.punting = makeComposite(rating, ['kck', 'stre', 'hgt', 'jmp', 'ins','hnd'], [6, 1, 1,1, 2, 2]);  // skill coverage
						p.compositeRating.kickOff = makeComposite(rating, ['kck', 'stre', 'hgt', 'jmp', 'ins'], [6, 1, 1,1, 0]);  // skill coverage
						p.compositeRating.fieldGoal = makeComposite(rating, ['kck', 'stre', 'hgt', 'jmp', 'ins'], [6, 1, 1,1, 4]);  // skill coverage
                        

                        p.compositeRating.endurance = makeComposite(rating, ['constant', 'spd', 'drb', 'pss', 'stl',  'reb', 'cvr'], [1, 1, -0.02, -0.02, -0.02, -0.02, -0.02]);

*/
				
						//// create composiites
						//// then create gameplay
						
						// instead of POS, can use L/S (long means deeper passes, less running, more side runs, shorter routes, more blitzes less coverage, more quick interception attempts)
						// offense - quicker plays for less yards, defense - try to get the quick stop, but risk the big play
						// could also still use POS, for subbing
						
						// list top offensive matchups (use these)
						// list top defensive matchups (use these)
						// outcomes based on random draw of these matchups
						
						
						//// then create stats/playbyplay
						//// then display stats
						//////////// game summary - football display could be an issue
						
						
                        // These use the same formulas as the skill definitions in player.skills!
                        p.compositeRating.pace = makeComposite(rating, ['spd', 'jmp', 'dnk', 'tp', 'stl', 'drb', 'pss']);
                        p.compositeRating.usage = Math.pow(makeComposite(rating, ['ins', 'dnk', 'fg', 'tp', 'spd', 'drb'], [1.5, 1, 1, 1, 0.15, 0.15]), 1.9);
                        p.compositeRating.dribbling = makeComposite(rating, ['drb', 'spd']);
                        p.compositeRating.passing = makeComposite(rating, ['drb', 'pss'], [0.4, 1]);
                        p.compositeRating.turnovers = makeComposite(rating, ['drb', 'pss', 'spd', 'hgt', 'ins'], [1, 1, -1, 1, 1]);  // This should not influence whether a turnover occurs, it should just be used to assign players
                        p.compositeRating.shootingAtRim = makeComposite(rating, ['hgt', 'spd', 'jmp', 'dnk'], [1, 0.2, 0.6, 0.4]);  // Dunk or layup, fast break or half court
                        p.compositeRating.shootingLowPost = makeComposite(rating, ['hgt', 'stre', 'spd', 'ins'], [1, 0.6, 0.2, 1]);  // Post scoring
                        p.compositeRating.shootingMidRange = makeComposite(rating, ['hgt', 'fg'], [0.2, 1]);  // Two point jump shot
                        p.compositeRating.shootingThreePointer = makeComposite(rating, ['hgt', 'tp'], [0.2, 1]);  // Three point jump shot
                        p.compositeRating.shootingFT = makeComposite(rating, ['ft']);  // Free throw
                        p.compositeRating.rebounding = makeComposite(rating, ['hgt', 'stre', 'jmp', 'reb'], [1.5, 0.1, 0.1, 0.7]);
                        p.compositeRating.stealing = makeComposite(rating, ['constant', 'spd', 'stl'], [1, 1, 1]);
                        p.compositeRating.blocking = makeComposite(rating, ['hgt', 'jmp', 'blk'], [1.5, 0.5, 0.5]);
                        p.compositeRating.fouling = makeComposite(rating, ['constant', 'hgt', 'blk', 'spd'], [1.5, 1, 1, -1]);
                        p.compositeRating.defense = makeComposite(rating, ['hgt', 'stre', 'spd', 'jmp', 'blk', 'stl'], [1, 1, 1, 0.5, 1, 1]);
                        p.compositeRating.defenseInterior = makeComposite(rating, ['hgt', 'stre', 'spd', 'jmp', 'blk'], [2, 1, 0.5, 0.5, 1]);
                        p.compositeRating.defensePerimeter = makeComposite(rating, ['hgt', 'stre', 'spd', 'jmp', 'stl'], [1, 1, 2, 0.5, 1]);
                        p.compositeRating.athleticism = makeComposite(rating, ['stre', 'spd', 'jmp', 'hgt'], [1, 1, 1, 0.5]); // Currently only used for synergy calculation

					  // These use the same formulas as the skill definitions in player.skills!
						for (k in g.compositeWeights) {
							if (g.compositeWeights.hasOwnProperty(k)) {
								p.compositeRating[k] = makeComposite(rating, g.compositeWeights[k].ratings, g.compositeWeights[k].weights);
							}
						}
						p.compositeRating.usage = Math.pow(p.compositeRating.usage, 1.9);						
						//console.log(p.compositeRating);
						
                        p.stat = {gs: 0, min: 0, fg: 0, fga: 0, fgAtRim: 0, fgaAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0, ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, courtTime: 0, benchTime: 0, energy: 1, tgts: 0, ols: 0, olr: 0, olp: 0, olry: 0, olpy: 0, olc: 0, oltd: 0, der: 0, dep: 0, dery: 0, depy: 0, dec: 0, detd: 0,prp:0,fdt:0,fdp:0,fdr:0,ty:0,syl:0,tda:0,tdf:0,rztd:0,rza:0,top:0,fbl:0,fbll:0,fblr:0,fbltd:0,inter:0,intery:0,intertd:0,pen:0,peny:0,qr:0,qbr:0,war:0,warr:0,warp:0,warre:0,ward:0,warol:0,wardl:0,pr:0,pry:0,prtd:0,kr:0,kry:0,krtd:0,kol:0,koa:0,koav:0,koy:0,rushl:0,rusha:0,recl:0,reca:0,passa:0,prl:0,pra:0,krl:0,kra:0,fgl:0,fgat:0,puntl:0,punta:0,olrp:0,fldgze:0,fldgtw:0,fldgth:0,fldgfo:0,fldgfi:0,puntty:0,punttb:0,fldgzea:0,fldgtwa:0,fldgtha:0,fldgfoa:0,fldgfia:0,turn:0,turnopp:0,oppfumble:0,tottd:0,opptd:0,opptdp:0,opptdr:0,oppfd:0,oppfdp:0,oppfdr:0,opppasa:0,opppasc:0,depc:0};
						//console.log(p);
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

                    t.stat = {min: 0, fg: 0, fga: 0, fgAtRim: 0, fgaAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0, ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, ptsQtrs: [0], tgts: 0, ols: 0, olr: 0, olp: 0, olry: 0, olpy: 0, olc: 0, oltd: 0, der: 0, dep: 0, dery: 0, depy: 0, dec: 0, detd: 0,prp:0,fdt:0,fdp:0,fdr:0,ty:0,syl:0,tda:0,tdf:0,rztd:0,rza:0,top:0,fbl:0,fbll:0,fblr:0,fbltd:0,inter:0,intery:0,intertd:0,pen:0,peny:0,qr:0,qbr:0,war:0,warr:0,warp:0,warre:0,ward:0,warol:0,wardl:0,pr:0,pry:0,prtd:0,kr:0,kry:0,krtd:0,kol:0,koa:0,koav:0,koy:0,rushl:0,rusha:0,recl:0,reca:0,passa:0,prl:0,pra:0,krl:0,kra:0,fgl:0,fgat:0,puntl:0,punta:0,olrp:0,fldgze:0,fldgtw:0,fldgth:0,fldgfo:0,fldgfi:0,puntty:0,punttb:0,fldgzea:0,fldgtwa:0,fldgtha:0,fldgfoa:0,fldgfia:0,turn:0,turnopp:0,oppfumble:0,tottd:0,opptd:0,opptdp:0,opptdr:0,oppfd:0,oppfdp:0,oppfdr:0,opppasa:0,opppasc:0,depc:0};
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
        var cbNoGames, cbPlayGames, cbSaveResults, cbSimGames, cbRunDay;

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
            //var cbSaveResult, gidsFinished, gm, i, playByPlay, playoffs, tx;

            gidsFinished = [];
          //  playoffs = g.phase === g.PHASE.PLAYOFFS;

            tx = dao.tx(["events", "games", "players", "playerFeats", "playerStats", "playoffSeries", "releasedPlayers", "schedule", "teams"], "readwrite");
//tx = g.dbl.transaction(["players", "schedule"], "readwrite");

            cbSaveResult = function (i) {
										
//console.log('cbSaveResult ' + i)
                // Save the game ID so it can be deleted from the schedule below
                gidsFinished.push(results[i].gid);

                writeTeamStats(tx, results[i]).then(function (att) {
                    return writeGameStats(tx, results[i], att);
                }).then(function () {
                    return writePlayerStats(tx, results[i]);
                }).then(function () {

                    var j, scheduleStore;

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
            for (i = 0; i < schedule.length; i++) {
                doPlayByPlay = gidPlayByPlay === schedule[i].gid;
                gs = new gameSim.GameSim(schedule[i].gid, teams[schedule[i].homeTid], teams[schedule[i].awayTid], doPlayByPlay);
                results.push(gs.run());
            }
            return cbSaveResults(results);
        };

        // Simulates a day of games. If there are no games left, it calls cbNoGames.
        // Promise is resolved after games are run
        cbPlayGames = function () {
            var tx;

            if (numDays === 1) {
                ui.updateStatus("Playing... (1 week left)");
            } else {
                ui.updateStatus("Playing... (" + numDays + " weeks left)");
            }

            tx = dao.tx(["players", "schedule", "teams"]);

            // Get the schedule for today
            return  season.getSchedule({ot: tx, oneDay: true}).then(function (schedule) {
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
//                            return  season.newSchedulePlayoffsDay().then(function () {
							// oncomplete is to make sure newSchedulePlayoffsDay finishes before continuing
							tx = dao.tx(["playoffSeries", "schedule", "teams"], "readwrite");
							season.newSchedulePlayoffsDay(tx);
							tx.complete().then(function () {								
                                return  season.getSchedule({oneDay: true}).then(function (schedule) {
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
