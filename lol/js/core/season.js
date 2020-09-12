/**
 * @name core.season
 * @namespace Somewhat of a hodgepodge. Basically, this is for anything related to a single season that doesn't deserve to be broken out into its own file. Currently, this includes things that happen when moving between phases of the season (i.e. regular season to playoffs) and scheduling. As I write this, I realize that it might make more sense to break up those two classes of functions into two separate modules, but oh well.
 */
/*eslint no-use-before-define: 0*/
define(["dao", "globals", "ui", "core/contractNegotiation", "core/draft", "core/finances", "core/freeAgents", "core/player", "core/team", "lib/bluebird", "lib/underscore", "util/account", "util/ads", "util/eventLog", "util/helpers", "util/message", "util/random"], function (dao, g, ui, contractNegotiation, draft, finances, freeAgents, player, team, Promise, _, account, ads, eventLog, helpers, message, random) {
    "use strict";

    var phaseText;

    /**
     * Update g.ownerMood based on performance this season.
     *
     * This is based on three factors: regular season performance, playoff performance, and finances. Designed to be called after the playoffs end.
     *
     * @memberOf core.season
     * @param {(IDBTransaction|null)} tx An IndexedDB transaction on gameAttributes and and teams, readwrite.	 
     * @return {Promise.Object} Resolves to an object containing the changes in g.ownerMood this season.
     */
    function updateOwnerMood(tx) {
        return team.filter({
//            attrs: ["cid"],		
			ot: tx,			
            seasonAttrs: ["won", "playoffRoundsWon", "profit","cidStart"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            var deltas, ownerMood,roundsBeforeChamp,halfSeason;
			
		     halfSeason = 9;
			 roundsBeforeChamp = 3;
			if (g.gameType == 0) {
			   halfSeason = 9;
			   roundsBeforeChamp = 2;
			} else if (g.gameType == 1) {
			   halfSeason = 9;
			   roundsBeforeChamp = 26;
			} else if (g.gameType == 2) {
			   halfSeason = 9;
			   roundsBeforeChamp = 3;
			} else if (g.gameType == 3) {
			   halfSeason = 9;
			   roundsBeforeChamp = 5;
			} else if (g.gameType == 4) {
			   halfSeason = 9;
			   roundsBeforeChamp = 3;
			} else if (g.gameType == 5) {
			   halfSeason = 9;
			   roundsBeforeChamp = 5;
			}
	
			
            deltas = {};
            deltas.wins = 0.25 * (t.won - halfSeason) / halfSeason;
			
			if (g.gameType == 1) {
			//	console.log(t.cidStart);
				if (t.playoffRoundsWon < 4) {
					deltas.playoffs = -0.2;					
				} else if (t.playoffRoundsWon < 7) {
					if (t.cidStart == 1) {
						deltas.playoffs = -0.19 ;
					} else  {
						deltas.playoffs = 0.02 ;
					}								
					
				} else if (t.playoffRoundsWon == 7) {
					if (t.cidStart == 1) {
						deltas.playoffs = -0.04 ;
					} else  {
						deltas.playoffs = 0.2 ;
					}								
				} else if (t.playoffRoundsWon == 13) {
						deltas.playoffs = -0.03 ; // for  making CS

				} else if (t.playoffRoundsWon < 16) {
					if (t.cidStart == 0) {
						deltas.playoffs = -0.19 ;
					} else  {
						deltas.playoffs = -0.03 ;
					}				
				
				} else if (t.playoffRoundsWon == 16) {
					if (t.cidStart == 0) {
						deltas.playoffs = -.18 ;
					} else  {
						deltas.playoffs = 0.03 ;
					}				
					
				} else if (t.playoffRoundsWon == 17) {
					if (t.cidStart == 0) {
						deltas.playoffs = -.18 ;
					} else  {
						deltas.playoffs = 0.04 ;
					}				
				} else if (t.playoffRoundsWon == 18) {
					if (t.cidStart == 0) {
						deltas.playoffs = -.02 ;
					} else  {
						deltas.playoffs = 0.21 ;
					}
				} else if (t.playoffRoundsWon < 24) {
					deltas.playoffs = -0.02 ;
				} else if (t.playoffRoundsWon == 24) {
					deltas.playoffs = -0.01 ;
				} else if (t.playoffRoundsWon == 25) {
					deltas.playoffs = 0.05 ;
				} else if (t.playoffRoundsWon == 26) {
					deltas.playoffs = 0.07 ;
				} else {
					deltas.playoffs = 0.22;
				}			
			
			} else {
			
				if (t.playoffRoundsWon < 0) {
					deltas.playoffs = -0.2;
				} else if (t.playoffRoundsWon < roundsBeforeChamp) {
					deltas.playoffs = 0.2 * (t.playoffRoundsWon+1)/(roundsBeforeChamp+3);
				} else {
					deltas.playoffs = 0.2;
				}
			}

            deltas.money = (t.profit - 50) / 100;
			console.log(deltas.money);
            return Promise.try(function () {
                // Only update owner mood if grace period is over
                if (g.season >= g.gracePeriodEnd) {
                    ownerMood = {};
                    ownerMood.wins = g.ownerMood.wins + deltas.wins;
                    ownerMood.playoffs = g.ownerMood.playoffs + deltas.playoffs;
                    ownerMood.money = g.ownerMood.money + deltas.money;

                    // Bound only the top - can't win the game by doing only one thing, but you can lose it by neglecting one thing
                    if (ownerMood.wins > 1) { ownerMood.wins = 1; }
                    if (ownerMood.playoffs > 1) { ownerMood.playoffs = 1; }
                    if (ownerMood.money > 1) { ownerMood.money = 1; }

                    return require("core/league").setGameAttributes(tx, {ownerMood: ownerMood});
                }
            }).then(function () {
                return deltas;
            });
        });
    }

    /**
     * Compute the awards (MVP, etc) after a season finishes.
     *
     * The awards are saved to the "awards" object store.
     *
     * @memberOf core.season
     * @return {Promise}
     */
    function awards(tx) {
        var awards, awardsByPlayer, saveAwardsByPlayer;

        awards = {season: g.season};

        // [{pid, type}]
        awardsByPlayer = [];

        saveAwardsByPlayer = function (awardsByPlayer) {
            var  pids;

            pids = _.uniq(_.pluck(awardsByPlayer, "pid"));


            return Promise.map(pids, function (pid) {
                return dao.players.get({ot: tx, key: pid}).then(function (p) {
                    var i;

                        for (i = 0; i < awardsByPlayer.length; i++) {
                            if (p.pid === awardsByPlayer[i].pid) {
                                p.awards.push({season: g.season, type: awardsByPlayer[i].type});
                            }
                        }

                    return dao.players.put({ot: tx, value: p});
                });
            });
        };

       // tx = dao.tx(["players", "playerStats", "releasedPlayers", "teams"]);

        // Get teams for won/loss record for awards, as well as finding the teams with the best records
        return team.filter({
            attrs: ["tid", "abbrev", "region", "name", "cid"],
            seasonAttrs: ["won", "lost", "winp", "playoffRoundsWon"],
            season: g.season,
            sortBy: ["winp","kda"],
            ot: tx
        }).then(function (teams) {
            var foundconf1, foundconf2, foundconf3, foundconf4, foundconf5, foundconf6,foundLadder, i, t;

            for (i = 0; i < teams.length; i++) {
                if (!foundconf1 && teams[i].cid === 0) {
                    t = teams[i];
                    awards.conf1 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    foundconf1 = true;
                } else if (!foundconf2 && teams[i].cid === 1) {
                    t = teams[i];
                    awards.conf2 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    foundconf2 = true;
                } else if (!foundconf3 && teams[i].cid === 2) {
                    t = teams[i];
                    awards.conf3 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    foundconf3 = true;
                } else if (!foundconf4 && teams[i].cid === 3) {
                    t = teams[i];
                    awards.conf4 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    foundconf4 = true;
                } else if (!foundconf5 && teams[i].cid === 4) {
                    t = teams[i];
                    awards.conf5 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    foundconf5 = true;
                } else if (!foundconf6 && teams[i].cid === 5) {
                    t = teams[i];
                    awards.conf6 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    foundconf6 = true;
                }

                if (foundconf1 && foundconf2 && foundconf3 && foundconf4 && foundconf5 && foundconf6) {
                    break;
                }
            }
			
			if (g.gameType < 5) {
			
				awards.conf4 = {tid: ""};
				awards.conf5 = {tid: ""};
				awards.conf6 = {tid: ""};
				
				if (g.gameType != 1) {				  
					awards.conf2 = {tid: ""};
					awards.conf3 = {tid: ""};				  
				} 			
			} 

            // Sort teams by tid so it can be easily used in awards formulas
            teams.sort(function (a, b) { return a.tid - b.tid; });

            return [teams, dao.players.getAll({
                ot: tx,
                index: "tid",
                key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT), // Any non-retired player can win an award
                statsSeasons: [g.season]
            })];
        }).spread(function (teams, players) {
            var champTid, i, p, type;

            players = player.filter(players, {
                attrs: ["pid", "name", "tid", "abbrev", "draft"],
                stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa","fga","fg","fgp","kda"],
                season: g.season
            });

            // Add team games won to players
            for (i = 0; i < players.length; i++) {
				//console.log(players[i].pid+" "+players[i].tid);
                // Special handling for players who were cut mid-season
                if (players[i].tid >= 0 && players[i].tid <= (g.numTeams-1)) {		
					//console.log(teams[players[i].tid].cid);
                    players[i].won = teams[players[i].tid].won;
					if (g.gameType == 1) {				
						if (teams[players[i].tid].cid == 0) {
							players[i].won = teams[players[i].tid].won;
							
						} else {
							players[i].won = 0;
							players[i].stats.gp = 0;
						}
					} else if (g.gameType == 5) {
					
						if (teams[players[i].tid].cid == 3) {
							players[i].won = teams[players[i].tid].won/22*18;
							players[i].stats.gp /= 22;
							players[i].stats.gp *= 18;
						} else if (teams[players[i].tid].cid == 4) {
							players[i].won = teams[players[i].tid].won/14*18;
							players[i].stats.gp /= 14;
							players[i].stats.gp *= 18;
						} else if (teams[players[i].tid].cid == 5) {
							players[i].won = teams[players[i].tid].won/12*18;
							players[i].stats.gp /= 12;
							players[i].stats.gp *= 18;
						// adjustment for WildCard, make it a little harder
							players[i].stats.gp *= .9;							
						} else {
							players[i].won = teams[players[i].tid].won;						
						}
					//	console.log(players[i].gp);
					}
                } else {
				//if (g.gameType == 1) {				
				//		players[i].won = 0;
				//		players[i].stats.gp = 0;
				//	} else if (g.gameType == 5) {				
				//		players[i].won = 0;
				//		players[i].stats.gp = 0;
				//	} else {
						players[i].won = 0;
						players[i].stats.gp = 0;						
				//	}
                }
            }

            // Rookie of the Year
//            players.sort(function (a, b) {  return  ((b.stats.fg+b.stats.fgp) - (b.stats.fga)*2)*b.stats.gp - ((a.stats.fg+a.stats.fgp) - (a.stats.fga)*2)*a.stats.gp ; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
            players.sort(function (a, b) {  return  b.stats.kda*b.stats.gp - a.stats.kda*a.stats.gp  ; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
            for (i = 0; i < players.length; i++) {
                // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
                if (players[i].draft.year === g.season - 1) {
                    break;
                }
            }
            p = players[i];
            if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
                awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fga: p.stats.fga, fgp: p.stats.fgp};
           //     awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Rookie of the Year"});
            }

            // Most Valuable Player
//            players.sort(function (a, b) {  return  ((b.stats.fg+b.stats.fgp) - (b.stats.fga)*2)*b.stats.gp - ((a.stats.fg+a.stats.fgp) - (a.stats.fga)*2)*a.stats.gp ; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
          //  console.log(p.tid);

            players.sort(function (a, b) {  return  (b.stats.kda*b.stats.gp+b.won) - (a.stats.kda*a.stats.gp+a.won)  ; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
			
//            players.sort(function (a, b) {  return (b.stats.fg+b.stats.fgp) - (b.stats.fga)*2 -((a.stats.fg+a.stats.fgp) - (a.stats.fga)*2); }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
//            players.sort(function (a, b) {  return (b.stats.ewa + 0.1 * b.won) - (a.stats.ewa + 0.1 * a.won); });
         /*   for (i = 0; i < players.length; i++) {
                // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
				console.log(players[i].stats.fg);
                if (players[i].stats.fg>0) {
                    break;
                }
            }		*/
			console.log(players.length);
            for (i = 0; i < players.length; i++) {
                // Must have come off the bench in most games
				console.log("i: "+i);
				console.log(players[i].stats.gp);
				console.log(players[i].won);
				
                if (players[i].stats.gp / players[i].won >= 1) {
                    break;
                }
            }		
			console.log( players[i]);
            p = players[i];
            awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Most Valuable Player"});
            // Notification unless it's the user's player, in which case it'll be shown below
         /*   if (p.tid !== g.userTid) {
                eventLog.add(null, {
                    type: "award",
                    text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", p.abbrev]) + '">' + p.abbrev + '</a>) won the Most Valuable Player award.'
                });
            }*/

            // Sixth Man of the Year - same sort as MVP
            for (i = 0; i < players.length; i++) {
                // Must have come off the bench in most games
                if (players[i].stats.gs === 0 || players[i].stats.gp / players[i].stats.gs > 2) {
                    break;
                }
            }
            p = players[i];
            awards.smoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga};
          //  awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Sixth Man of the Year"});

            // All League Team - same sort as MVP
            awards.allLeague = [{title: "First Team", players: []}];
            type = "First Team All-League";
            for (i = 0; i < 15; i++) {
                p = players[i];
                if (i === 5) {
                    awards.allLeague.push({title: "Second Team", players: []});
                    type = "Second Team All-League";
                } else if (i === 10) {
                    awards.allLeague.push({title: "Third Team", players: []});
                    type = "Third Team All-League";
                }
                _.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga});
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
            }

            // Support of the Year
//            players.sort(function (a, b) {  return b.stats.gp * (b.stats.trb + 5 * b.stats.blk + 5 * b.stats.stl) - a.stats.gp * (a.stats.trb + 5 * a.stats.blk + 5 * a.stats.stl); });
            players.sort(function (a, b) {  return  ((b.stats.fg+b.stats.fgp*2) - (b.stats.fga))*b.stats.gp - ((a.stats.fg+a.stats.fgp*2) - (a.stats.fga))*a.stats.gp ; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
//            players.sort(function (a, b) {  return (b.stats.fg+b.stats.fgp*2) - (a.stats.fga)*1; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
			
            p = players[0];
            awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga};
           // awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Support of the Year"});

            // All Defensive Team - same sort as DPOY
            awards.allDefensive = [{title: "First Team", players: []}];
            type = "First Team All-Support";
            for (i = 0; i < 15; i++) {
                p = players[i];
                if (i === 5) {
                    awards.allDefensive.push({title: "Second Team", players: []});
                    type = "Second Team All-Support";
                } else if (i === 10) {
                    awards.allDefensive.push({title: "Third Team", players: []});
                    type = "Third Team All-Support";
                }
                _.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.stats.fg, fgp: p.stats.fgp, fga: p.stats.fga});
              //  awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
            }

            // Finals MVP - most WS in playoffs
            for (i = 0; i < teams.length; i++) {
//                if ((teams[i].playoffRoundsWon === 2) && (teams[i].cid === 0)) {
                if ((teams[i].playoffRoundsWon === 3) && (g.gameType === 0)) {
                    champTid = teams[i].tid;
                    break;
                } else if ((teams[i].playoffRoundsWon === 27) && (g.gameType === 1)) {
                    champTid = teams[i].tid;
                    break;
                } else if ((teams[i].playoffRoundsWon === 4) && (g.gameType === 2)) {
                    champTid = teams[i].tid;
                    break;
                } else if ((teams[i].playoffRoundsWon === 6) && (g.gameType === 3)) {
                    champTid = teams[i].tid;
                    break;
                } else if ((teams[i].playoffRoundsWon === 3) && (g.gameType === 4)) {
                    champTid = teams[i].tid;
                    break;
                } else if ((teams[i].playoffRoundsWon === 6) && (g.gameType === 5)) {
                    champTid = teams[i].tid;
                    break;
				}
            }

            // Need to read from DB again to really make sure I'm only looking at players from the champs. player.filter might not be enough. This DB call could be replaced with a loop manually checking tids, though.
            return [champTid, dao.players.getAll({
                ot: tx,
                index: "tid",
                key: champTid,
                statsSeasons: [g.season],
                statsTid: champTid,
                statsPlayoffs: true
            })];
        }).spread(function (champTid, players) {
            var p;

            players = player.filter(players, { // Only the champions, only playoff stats
                attrs: ["pid", "name", "tid", "abbrev"],
                stats: ["pts", "trb", "ast", "ewa","fga","fg","fgp","gp","kda"],
                season: g.season,
                playoffs: true,
                tid: champTid
            });
     //       players.sort(function (a, b) {  return b.statsPlayoffs.ewa - a.statsPlayoffs.ewa; });
         //   players.sort(function (a, b) {  return (b.statsPlayoffs.fg+b.statsPlayoffs.fgp) - (a.statsPlayoffs.fga)*2; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
            players.sort(function (a, b) {  return  (b.statsPlayoffs.kda*b.statsPlayoffs.gp) - (a.statsPlayoffs.kda*a.statsPlayoffs.gp) ; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
//            players.sort(function (a, b) {  return  b.stats.kda*b.stats.gp - a.stats.kda*a.stats.gp  ; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
			
            p = players[0];

            awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, fg: p.statsPlayoffs.fg, fga: p.statsPlayoffs.fga, fgp: p.statsPlayoffs.fgp};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Finals MVP"});

            /*tx = dao.tx("awards", "readwrite");
            dao.awards.put({ot: tx, value: awards});
            return tx.complete().then(function () {*/
			return dao.awards.put({ot: tx, value: awards}).then(function () {
                return saveAwardsByPlayer(awardsByPlayer);
            }).then(function () {
                var i, p, text, tx;

                // None of this stuff needs to block, it's just notifications of crap

                // Notifications for awards for user's players
              //  tx = dao.tx("events", "readwrite");
                for (i = 0; i < awardsByPlayer.length; i++) {
                    p = awardsByPlayer[i];

                    text = '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamAbbrevsCache[p.tid] + '</a>) ';
                    if (p.type.indexOf("Team") >= 0) {
                        text += 'made the ' + p.type + '.';
                    } else {
                        text += 'won the ' + p.type + ' award.';
                    }
                    eventLog.add(null, {
                        type: "award",
                        text: text,
                        showNotification: p.tid === g.userTid || p.type === "Most Valuable Player",
                        pids: [p.pid],
                        tids: [p.tid]
                    });
                }
            });
        });
    }


    /**
     * Get an array of games from the schedule.
     *
     * @param {(IDBObjectStore|IDBTransaction|null)} options.ot An IndexedDB object store or transaction on schedule; if null is passed, then a new transaction will be used.
     * @param {boolean} options.oneDay Number of days of games requested. Default false.
     * @return {Promise} Resolves to the requested schedule array.
     */
    function getSchedule(options) {
        options = options !== undefined ? options : {};
        options.ot = options.ot !== undefined ? options.ot : null;
        options.oneDay = options.oneDay !== undefined ? options.oneDay : false;

        return dao.schedule.getAll({ot: options.ot}).then(function (schedule) {
            var i, tids;

            if (options.oneDay) {
                schedule = schedule.slice(0, g.numTeams / 2);  // This is the maximum number of games possible in a day

                // Only take the games up until right before a team plays for the second time that day
                tids = [];
                for (i = 0; i < schedule.length; i++) {
                    if (tids.indexOf(schedule[i].homeTid) < 0 && tids.indexOf(schedule[i].awayTid) < 0) {
                        tids.push(schedule[i].homeTid);
                        tids.push(schedule[i].awayTid);
                    } else {
                        break;
                    }
                }
                schedule = schedule.slice(0, i);
            }

            return schedule;
        });
    }

    /**
     * Save the schedule to the database, overwriting what's currently there.
     *
     * @param {(IDBTransaction|null)} options.ot An IndexedDB transaction on schedule readwrite; if null is passed, then a new transaction will be used.
     * @param {Array} tids A list of lists, each containing the team IDs of the home and
            away teams, respectively, for every game in the season, respectively.
     * @return {Promise}
     */
    function setSchedule(tx, tids) {
        var i, newSchedule;

		console.log("newSchedule");
		
        newSchedule = [];
	//	console.log(tids.length);
	//	console.log(tids);		
        for (i = 0; i < tids.length; i++) {
            newSchedule.push({
                homeTid: tids[i][0],
                awayTid: tids[i][1]
            });
        }

	//	console.log(newSchedule.length);
	//	console.log(newSchedule);		
        tx = dao.tx("schedule", "readwrite", tx);

        return dao.schedule.clear({ot: tx}).then(function () {
            return Promise.map(newSchedule, function (matchup) {
                return dao.schedule.add({ot: tx, value: matchup});
            });
        });
    }

    /**
     * Creates a new regular season schedule for 30 teams.
     *
     * This makes an NBA-like schedule in terms of conference matchups, division matchups, and home/away games.
     *
     * @memberOf core.season
     * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
     */
    function newScheduleDefault(teams) {
        var cid, dids, game, games, good, i, ii, iters, j, jj, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tryNum;
		var ifCS;
		
		console.log("New schedule every year?");

//console.log(typeid);
//console.log(g.typeid);

		ifCS = 1;
		if (g.gameType == 0) {
		//	teams = helpers.getTeamsNADefault();
		} else if ((g.gameType == 1)) {
		//	teams = helpers.getTeamsDefault();
		} else if (g.gameType == 2) {
		//	teams = helpers.getTeamsLCKDefault();
		} else if (g.gameType == 3) {
		//	teams = helpers.getTeamsLPLDefault();
			
		} else if (g.gameType == 4) {
		//	teams = helpers.getTeamsLMSDefault();
		} else {
		//	teams = helpers.getTeamsWorldsDefault();
			
		}				
        //teams = helpers.getTeamsDefault(); // Only tid, cid, and did are used, so this is okay for now. But if someone customizes cid and did, this will break. To fix that, make this function require DB access (and then fix the tests). Or even better, just accept "teams" as a param to this function, then the tests can use default values and the real one can use values from the DB.

        tids = [];  // tid_home, tid_away

        // Collect info needed for scheduling
		console.log(teams.length);
        for (i = 0; i < teams.length; i++) {
            teams[i].homeGames = 0;
            teams[i].awayGames = 0;
        }
		
		var cid,t,teamsDone,allTeams,cTeams;
		
		
		for (allTeams = 0; allTeams < g.numTeams; allTeams++) {			
			for (cTeams = allTeams; cTeams < g.numTeams; cTeams++) {
				if ((teams[allTeams].cid == teams[cTeams].cid) && (teams[allTeams].tid != teams[cTeams].tid)) {
				
					ifCS = 1;
					if  ((teams[allTeams].cid == 1) && (g.gameType == 1)) {
						ifCS = 2;
					}
				
					for (i = 0; i < ifCS; i++) {
				    
					//  if (Math.random() > .5 ) {
						game = [teams[allTeams].tid, teams[cTeams].tid];
						tids.push(game);
						teams[allTeams].homeGames += 1;
						teams[cTeams].awayGames += 1;					  
					//  } else {
						game = [teams[cTeams].tid, teams[allTeams].tid];
						tids.push(game);
						teams[cTeams].homeGames += 1;
						teams[allTeams].awayGames += 1;					  
					 // }					  
					}
				}							
			}
		}		
		
		
		
		
   /*     for (i = 0; i < teams.length; i++) {
            for (j = 0; j < teams.length; j++) {
                if (teams[i].tid !== teams[j].tid) {
                    game = [teams[i].tid, teams[j].tid];

                    // Constraint: 1 home game vs. each team in other conference
                    if (teams[i].cid !== teams[j].cid) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }

                    // Constraint: 2 home schedule vs. each team in same division
                    if (teams[i].did === teams[j].did) {
                        tids.push(game);
                        tids.push(game);
                        teams[i].homeGames += 2;
                        teams[j].awayGames += 2;
                    }

                    // Constraint: 1-2 home schedule vs. each team in same conference and different division
                    // Only do 1 now
                    if (teams[i].cid === teams[j].cid && teams[i].did !== teams[j].did) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }
                }
            }
        }

        // Constraint: 1-2 home schedule vs. each team in same conference and different division
        // Constraint: We need 8 more of these games per home team!
        tidsByConf = [[], []];
        dids = [[], []];
        for (i = 0; i < teams.length; i++) {
            tidsByConf[teams[i].cid].push(i);
            dids[teams[i].cid].push(teams[i].did);
        }

        for (cid = 0; cid < 2; cid++) {
            matchups = [];
            matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
            games = 0;
            while (games < 8) {
                newMatchup = [];
                n = 0;
                while (n <= 14) {  // 14 = num teams in conference - 1
                    iters = 0;
                    while (true) {
                        tryNum = random.randInt(0, 14);
                        // Pick tryNum such that it is in a different division than n and has not been picked before
                        if (dids[cid][tryNum] !== dids[cid][n] && newMatchup.indexOf(tryNum) < 0) {
                            good = true;
                            // Check for duplicate games
                            for (j = 0; j < matchups.length; j++) {
                                matchup = matchups[j];
                                if (matchup[n] === tryNum) {
                                    good = false;
                                    break;
                                }
                            }
                            if (good) {
                                newMatchup.push(tryNum);
                                break;
                            }
                        }
                        iters += 1;
                        // Sometimes this gets stuck (for example, first 14 teams in fine but 15th team must play itself)
                        // So, catch these situations and reset the newMatchup
                        if (iters > 50) {
                            newMatchup = [];
                            n = -1;
                            break;
                        }
                    }
                    n += 1;
                }
                matchups.push(newMatchup);
                games += 1;
            }
            matchups.shift();  // Remove the first row in matchups
            for (j = 0; j < matchups.length; j++) {
                matchup = matchups[j];
                for (k = 0; k < matchup.length; k++) {
                    t = matchup[k];
                    ii = tidsByConf[cid][t];
                    jj = tidsByConf[cid][matchup[t]];
                    game = [teams[ii].tid, teams[jj].tid];
                    tids.push(game);
                    teams[ii].homeGames += 1;
                    teams[jj].awayGames += 1;
                }
            }
        }*/

        return tids;
    }

    /**
     * Creates a new regular season schedule for an arbitrary number of teams.
     *
     * newScheduleDefault is much nicer and more balanced, but only works for 30 teams.
     *
     * @memberOf core.season
     * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
     */
    function newScheduleCrappy(teams) {
        var i, j, numGames, numRemaining, numWithRemaining, tids;

		
       var cid, dids, game, games, good, i, ii, iters, j, jj, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tryNum;
		var ifCS;
		
		console.log("New schedule every year?");

//console.log(typeid);
//console.log(g.typeid);

		ifCS = 1;
		if (g.gameType == 0) {
		//	teams = helpers.getTeamsNADefault();
		} else if ((g.gameType == 1)) {
		//	teams = helpers.getTeamsDefault();
		} else if (g.gameType == 2) {
		//	teams = helpers.getTeamsLCKDefault();
		} else if (g.gameType == 3) {
		//	teams = helpers.getTeamsLPLDefault();
			
		} else if (g.gameType == 4) {
		//	teams = helpers.getTeamsLMSDefault();
		} else {
		//	teams = helpers.getTeamsWorldsDefault();
			
		}				
        //teams = helpers.getTeamsDefault(); // Only tid, cid, and did are used, so this is okay for now. But if someone customizes cid and did, this will break. To fix that, make this function require DB access (and then fix the tests). Or even better, just accept "teams" as a param to this function, then the tests can use default values and the real one can use values from the DB.

        tids = [];  // tid_home, tid_away

        // Collect info needed for scheduling
        for (i = 0; i < teams.length; i++) {
            teams[i].homeGames = 0;
            teams[i].awayGames = 0;
        }
		
		var cid,t,teamsDone,allTeams,cTeams;
		
		
		for (allTeams = 0; allTeams < g.numTeams; allTeams++) {			
			for (cTeams = allTeams; cTeams < g.numTeams; cTeams++) {
				if ((teams[allTeams].cid == teams[cTeams].cid) && (teams[allTeams].tid != teams[cTeams].tid)) {
				
					ifCS = 1;
					if  ((teams[allTeams].cid == 1) && (g.gameType == 1)) {
						ifCS = 2;
					} else if ((teams[allTeams].cid == 2) && (g.gameType == 1)) {
						ifCS = 1;
					}
				
					if (ifCS == 3) {
					} else {
						for (i = 0; i < ifCS; i++) {

							if  ((teams[allTeams].homeGames<9) && (teams[cTeams].homeGames<9) && (Math.random()<.95)) {				    
								game = [teams[allTeams].tid, teams[cTeams].tid];
								tids.push(game);
								teams[allTeams].homeGames += 1;
								teams[cTeams].awayGames += 1;					  
								game = [teams[cTeams].tid, teams[allTeams].tid];
								tids.push(game);
								teams[cTeams].homeGames += 1;
								teams[allTeams].awayGames += 1;					  
							}
						}
					}
				}							
			}
		}		
				
		for (allTeams = (g.numTeams-1); allTeams >= 0; allTeams--) {			
			for (cTeams = allTeams; cTeams >= 0; cTeams--) {
				if ((teams[allTeams].cid == teams[cTeams].cid) && (teams[allTeams].tid != teams[cTeams].tid)) {
				
					ifCS = 1;
					if  ((teams[allTeams].cid == 1) && (g.gameType == 1)) {
						ifCS = 2;
					} else if ((teams[allTeams].cid == 2) && (g.gameType == 1)) {
						ifCS = 1;
					}
				
					if (ifCS == 3) {
					} else {
						for (i = 0; i < ifCS; i++) {

							if  ((teams[allTeams].homeGames<10) && (teams[cTeams].homeGames<10) && (Math.random()<.95)) {				    
								game = [teams[allTeams].tid, teams[cTeams].tid];
								tids.push(game);
								teams[allTeams].homeGames += 1;
								teams[cTeams].awayGames += 1;					  
								game = [teams[cTeams].tid, teams[allTeams].tid];
								tids.push(game);
								teams[cTeams].homeGames += 1;
								teams[allTeams].awayGames += 1;					  
							}
						}
					}
				}							
			}
		}				
		
		/*	numGames = 20;

			// Number of games left to reschedule for each team
			numRemaining = [];
			for (i = 0; i < g.numTeams; i++) {
				numRemaining[i] = numGames;
			}
			numWithRemaining = g.numTeams; // Number of teams with numRemaining > 0

			tids = [];
			while (tids.length < numGames * g.numTeams) {
				i = -1; // Home tid
				j = -1; // Away tid
				while (i === j || numRemaining[i] === 0 || numRemaining[j] === 0 || teams[i].cid != teams[j].cid) {
					i = random.randInt(0, g.numTeams - 1);
					j = random.randInt(0, g.numTeams - 1);
				}

				tids.push([i, j]);

				numRemaining[i] -= 1;
				numRemaining[j] -= 1;

				// Make sure we're not left with just one team to play itself
				if (numRemaining[i] === 0) {
					numWithRemaining -= 1;
				}
				if (numRemaining[j] === 0) {
					numWithRemaining -= 1;
				}
				if (numWithRemaining === 1) {
					// If this happens, we didn't find 82 for each team and one team will play a few less games
					break;
				}
			} */

        return tids;
    }

    /**
     * Wrapper function to generate a new schedule with the appropriate algorithm based on the number of teams in the league.
     *
     * For 30 teams, use newScheduleDefault (NBA-like).
     *
     * @memberOf core.season
     * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
     */
    function newSchedule(teams) {
        var days, i, j, jMax, tids, tidsInDays, used;
		var standardNumTeams;
		
        if (g.gameType === 0) {
		  standardNumTeams = 10;
		} else if (g.gameType === 1) {
		  standardNumTeams = 30;
		} else if (g.gameType === 2) {
		  standardNumTeams = 10;
		} else if (g.gameType === 3) {
		  standardNumTeams = 12;
		} else if (g.gameType === 4) {
		  standardNumTeams = 8;
		} else if (g.gameType === 5) {
		  standardNumTeams = 57;		
		}
		

        if (g.numTeams === standardNumTeams) {
            tids = newScheduleDefault(teams);
        } else {
           // tids = newScheduleDefault(teams);
            tids = newScheduleCrappy(teams);
        }

        // Order the schedule so that it takes fewer days to play
        random.shuffle(tids);
        days = [[]];
        tidsInDays = [[]];
        jMax = 0;

        for (i = 0; i < tids.length; i++) {
            used = false;
            for (j = 0; j <= jMax; j++) {
                if (tidsInDays[j].indexOf(tids[i][0]) < 0 && tidsInDays[j].indexOf(tids[i][1]) < 0) {
                    tidsInDays[j].push(tids[i][0]);
                    tidsInDays[j].push(tids[i][1]);
                    days[j].push(tids[i]);
                    used = true;
                    break;
                }
            }
            if (!used) {
                days.push([tids[i]]);
                tidsInDays.push([tids[i][0], tids[i][1]]);
                jMax += 1;
            }
        }

        random.shuffle(days); // Otherwise the most dense days will be at the beginning and the least dense days will be at the end
        tids = _.flatten(days, true);

        return tids;
    }

   

    /**
     * Create a single day's schedule for an in-progress playoffs.
     *
     * @memberOf core.season
     * @param {(IDBTransaction|null)} tx An IndexedDB transaction on playoffSeries, schedule, and teams, readwrite.
     * @return {Promise.boolean} Resolves to true if the playoffs are over. Otherwise, false.
     */
    function newSchedulePlayoffsDay(tx) {
        var playoffSeries, rnd, series, tids, tx;

        tx = dao.tx(["playoffSeries", "schedule", "teams"], "readwrite", tx);

        // This is a little tricky. We're returning this promise, but within the "then"s we're returning tx.complete() for the same transaction. Probably should be refactored.
        return dao.playoffSeries.get({
            ot: tx,
            key: g.season
        }).then(function (playoffSeriesLocal) {
            var i, numGames;
			var wonNeeded;
			var seriesStart,seriesEnd;

            playoffSeries = playoffSeriesLocal;
            series = playoffSeries.series;
			//console.log(playoffSeries);
			//console.log(series);
            rnd = playoffSeries.currentRound;
            tids = [];

            // Try to schedule games if there are active series
			  //   console.log(rnd);	
			 seriesStart = 0;
			 seriesEnd = 0;
			// console.log(rnd);
			// console.log(g.gameType);
			 
		//	 seriesEnd = series[rnd].length;
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
					seriesEnd = 8;				
//					seriesEnd = 6;				
				}		
			} else if (rnd == 7) {
				if (g.gameType == 5) {	
					seriesStart = 0;
					seriesEnd = 4;				
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
//            for (i = 0; i < series[rnd].length; i++) {
			if (g.gameType == 5 && rnd<3) {	
 				wonNeeded = 3;
				for (i = 0; i < 2; i++) {
			//	 console.log(i);
					if ( (series[rnd][i].home.won < wonNeeded) && (series[rnd][i].away.won < wonNeeded) ) {
						// Make sure to set home/away teams correctly! Home for the lower seed is 1st, 2nd, 5th, and 7th games.
						numGames = series[rnd][i].home.won + series[rnd][i].away.won;
						if (numGames === 0  || numGames === 2 || numGames === 4) {
							tids.push([series[rnd][i].home.tid, series[rnd][i].away.tid]);
						} else {
							tids.push([series[rnd][i].away.tid, series[rnd][i].home.tid]);
						}
					}
                }
			
			}
		//	}
			var totalWins;
			
			if (g.gameType == 5 && rnd == 8) {	
				totalWins = series[8][0].home.won+series[8][0].away.won+series[8][1].home.won+series[8][1].away.won;
			}
			if (g.gameType == 5 && rnd == 8 && totalWins < 12) {	

	//		console.log("Groups");
				// Group A
				// Group B
				// Group C
				// Group D				

				
				for (i = 0; i < 4; i++) {

					if (totalWins < 2) {
						tids.push([series[8][0+i*2].home.tid, series[8][0+i*2].away.tid]);
						tids.push([series[8][1+i*2].home.tid, series[8][1+i*2].away.tid]);
					} else if (totalWins == 2 ) {
						tids.push([series[8][0+i*2].home.tid, series[8][1+i*2].away.tid]);
						tids.push([series[8][1+i*2].home.tid, series[8][0+i*2].away.tid]);
					} else if (totalWins == 4) {
						tids.push([series[8][0+i*2].home.tid, series[8][1+i*2].home.tid]);
						tids.push([series[8][1+i*2].away.tid, series[8][0+i*2].away.tid]);
					} else if (totalWins == 6) {				
						tids.push([series[8][0+i*2].away.tid, series[8][0+i*2].home.tid]);
						tids.push([series[8][1+i*2].away.tid, series[8][1+i*2].home.tid]);
					} else if (totalWins == 8) {			
						tids.push([series[8][1+i*2].away.tid, series[8][0+i*2].home.tid]);
						tids.push([series[8][0+i*2].away.tid, series[8][1+i*2].home.tid]);
					} else if (totalWins == 10) {		
						  series[8][0+i*2].home.loss = 0;
						  series[8][0+i*2].away.loss = 0;
						  series[8][1+i*2].home.loss = 0;
						  series[8][1+i*2].away.loss = 0;					
					
						tids.push([series[8][1+i*2].home.tid, series[8][0+i*2].home.tid]);
						tids.push([series[8][0+i*2].away.tid, series[8][1+i*2].away.tid]);
					}
					
				}
				
				
			} else if (g.gameType == 5 && rnd == 8 && totalWins >= 12) {	
//			} else if (g.gameType == 5 && rnd == 8 ) {	
		//	console.log("Groups-Wild");			
				var threeWins,threeWinsLocation,j;

				// tie at 3 (now j)
				for (j = 3; j < 6; j++) {
					for (i = 0; i < 4; i++) {
					
						threeWinsLocation = [[],[],[],[]];
						threeWins = 0;
						// Groups TieBreakers
						

						if (series[8][0+i*2].home.won == j) {
						  threeWins += 1;
	//					  threeWinsLocation.push = (series[8][0+i*2].home.tid);
						  threeWinsLocation[threeWins-1] = series[8][0+i*2].home.tid;
						//  console.log(series[8][0+i*2].home.loss);
						} 
						if (series[8][0+i*2].away.won == j) {
						  threeWins += 1;
						  threeWinsLocation[threeWins-1] = series[8][0+i*2].away.tid;
						//  console.log(series[8][0+i*2].away.loss);
						} 
						if (series[8][1+i*2].home.won == j) {
						  threeWins += 1;
						  threeWinsLocation[threeWins-1] = series[8][1+i*2].home.tid;
						//  console.log(series[8][1+i*2].home.loss);
						} 
						if (series[8][1+i*2].away.won == j) {
						  threeWins += 1;
						  threeWinsLocation[threeWins-1] = series[8][1+i*2].away.tid;
						//  console.log(series[8][1+i*2].away.loss);
						} 
					//	console.log(threeWins);
					//	console.log(threeWinsLocation);					
				//		console.log(series[8][0+i*2].home.loss);	
				//		console.log(series[8][0+i*2].away.loss);	
				//		console.log(series[8][1+i*2].home.loss);	
				//		console.log(series[8][1+i*2].away.loss);	
						
						if (threeWins == 2 || threeWins == 3 ) {
								tids.push([threeWinsLocation[0], threeWinsLocation[1]]);
								
								threeWins = 0;
								if ((series[8][0+i*2].home.won == j) && (threeWins <2)) {
								  threeWins += 1;
								  series[8][0+i*2].home.loss += 1;
								} 
								if ((series[8][0+i*2].away.won == j) && (threeWins <2)) {
								  threeWins += 1;
								  series[8][0+i*2].away.loss += 1;
								} 
								if ((series[8][1+i*2].home.won == j) && (threeWins <2)) {
								  threeWins += 1;
								  series[8][1+i*2].home.loss += 1;
								} 
								if ((series[8][1+i*2].away.won == j) && (threeWins <2)) {
								  threeWins += 1;
								  series[8][1+i*2].away.loss += 1;
								} 	
								
						} else if (threeWins == 4) {
								tids.push([threeWinsLocation[0], threeWinsLocation[1]]);
								tids.push([threeWinsLocation[2], threeWinsLocation[3]]);	
								
								if ((series[8][0+i*2].home.won == j) ) {
								  series[8][0+i*2].home.loss += 1;
								} 
								if ((series[8][0+i*2].away.won == j) ) {
								  series[8][0+i*2].away.loss += 1;
								} 
								if ((series[8][1+i*2].home.won == j) ) {
								  series[8][1+i*2].home.loss += 1;
								} 
								if ((series[8][1+i*2].away.won == j) ) {
								  series[8][1+i*2].away.loss += 1;
								} 								
								
						}
					/*	console.log(series[8][0+i*2].home.won );
						console.log(series[8][0+i*2].away.won );
						console.log(series[8][1+i*2].home.won );
						console.log(series[8][1+i*2].away.won );
						console.log(j+" "+i+" "+threeWins+" "+threeWinsLocation);*/

					}
				}				


					
			
			} else if (rnd < 8 || rnd > 8) {
	//		console.log("Normal");						
				for (i = seriesStart; i < seriesEnd; i++) {
							//console.log(tids);						
				
					   wonNeeded = 3;
				/*	 console.log("i: "+i);				 
					 console.log("rnd: "+rnd);				 
					 console.log("wonNeeded: "+wonNeeded);				 
					 console.log("series[rnd][i].home.won: "+series[rnd][i].home.won);				 				 
					 console.log("series[rnd][i].away.won: "+series[rnd][i].away.won);				 				 
					 console.log("series[rnd][i].home.tid: "+series[rnd][i].home.tid);				 				 
					 console.log("series[rnd][i].away.tid: "+series[rnd][i].away.tid);				 				 */
					if ( (series[rnd][i].home.won < wonNeeded) && (series[rnd][i].away.won < wonNeeded) ) {
						// Make sure to set home/away teams correctly! Home for the lower seed is 1st, 2nd, 5th, and 7th games.
						numGames = series[rnd][i].home.won + series[rnd][i].away.won;
					//	console.log(numGames);
						if (numGames === 0  || numGames === 2 || numGames === 4) {
							tids.push([series[rnd][i].home.tid, series[rnd][i].away.tid]);
						//	console.log(tids);
						} else {
							tids.push([series[rnd][i].away.tid, series[rnd][i].home.tid]);
						//	console.log(tids);						
						}
					}
					//console.log("changed?: "+tids);						
					
				}
			}
		//	console.log("tids: "+tids);
		//	console.log("totalWins: "+totalWins);

        }).then(function () {
		
			  //   console.log(rnd);			
		
            var i, key,key2, key3,key4, matchup, team1, team2,team3,team4, tidsWon,tidsLost;
			var confWinSeed,confLoseSeed, matchup1, matchup2, matchup3, matchup4, matchup5, matchup6, matchup7, matchup8;

			var	Team1NA, Team2NA, Team3NA, Team1EU, Team2EU, Team3EU, Team1LCK;
			var Team2LCK, Team3LCK, Team1LPL, Team2LPL, Team3LPL, Team1LMS, Team2LMS, Team3LMS, Team1WC, Team2WC;
            // Now playoffSeries, rnd, series, and tids are set

//console.log(tids);
            // If series are still in progress, write games and short circuit
            if (tids.length > 0) {
                return setSchedule(tx, tids).then(function () {
                    return false;
                });
            }
			tidsWon = [];
			tidsLost = [];			

            // If playoffs are over, update winner and go to next phase
			
			// Do for LCS, LCS promotion, and CS promotion
		
            if (rnd === 2) {
			
				if ((g.gameType == 0) || (g.gameType == 1)  ) {


					// LCS champions
					if (series[rnd][0].home.won >= 3) {
						key = series[rnd][0].home.tid;
						key2 = series[rnd][0].away.tid;
					} else if (series[rnd][0].away.won >= 3) {
						key = series[rnd][0].away.tid;
						key2 = series[rnd][0].home.tid;
					}
					dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							if ((g.gameType == 0)  ) {
								t.seasons[s].playoffRoundsWon = 3;
								t.seasons[s].hype += 0.05;
								
								t.seasons[s].cash += 200000;
								t.seasons[s].revenues.nationalTv.amount += 200000;	
							//	console.log(t.seasons[s].cash);
							//	console.log(t.seasons[s].revenues.nationalTv.amount);								
							} else {
								t.seasons[s].playoffRoundsWon = 27;
								t.seasons[s].hype *= .70;
								t.seasons[s].hype += 0.30;
								t.seasons[s].cash += 200000;
								t.seasons[s].revenues.nationalTv.amount += 200000;	
								
							}
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							return t;
						}
//					}).then(function () {
					})
					
					dao.teams.iterate({
							ot: tx,
							key: key2,
							callback: function (t) {
								var s;

								s = t.seasons.length - 1;

								//t.seasons[s].playoffRoundsWon = 2;
							//	t.seasons[s].hype += 0.05;
								if ((g.gameType == 0)  ) {
									t.seasons[s].playoffRoundsWon = 2;
									t.seasons[s].hype += 0.05;
								} else {
									//t.seasons[s].playoffRoundsWon = 26;
									t.seasons[s].playoffRoundsWon = 26;									
									t.seasons[s].hype *= .70;
									t.seasons[s].hype += 0.25;
								}
								if (t.seasons[s].hype > 1) {
									t.seasons[s].hype = 1;
								}
								
								return t;
							}
//						}).then(function () {						

					//	});						
					});	
//					}).then(function () {
									console.log(g.gameType);			
						if ((g.gameType == 0) ) {
	//							return tx.complete().then(function () {
							//return ete().then(function () {
								// Playoffs are over! Return true!
								console.log("here");
								return true;							
	//							return newPhase(g.PHASE.BEFORE_DRAFT);
							//});					
						}					
	//				});									
				}
				if ((g.gameType == 5) ) {
			
					// NA LCS Regionals Start Here
					if (series[rnd][0].home.won >= 3) {
						key = series[rnd][0].home.tid;
					} else if (series[rnd][0].away.won >= 3) {
						key = series[rnd][0].away.tid;
					}			
			
					// EU LCS Regionals Start Here
					if (series[rnd][9].home.won >= 3) {
						key = series[rnd][9].home.tid;
					} else if (series[rnd][9].away.won >= 3) {
						key = series[rnd][9].away.tid;
					}

													
				}				

				// CS Promotion		
				if ( (g.gameType == 1)) {
							console.log(g.gameType);			
  //              return tx.complete().then(function () {
                // return newPhase(g.PHASE.BEFORE_DRAFT);
					i = 4;
					if (series[rnd][i].away.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
				     ////   tidsWon.push(series[rnd][i].home.tid);
				     //   tidsLost.push(series[rnd][i].away.tid);

					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
				      ////  tidsWon.push(series[rnd][i].away.tid);
				      //  tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].away.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
				    //    tidsWon.push(series[rnd][i + 1].home.tid);
				    //    tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
				     //   tidsWon.push(series[rnd][i + 1].away.tid);
				     //   tidsLost.push(series[rnd][i + 1].home.tid);
					}
					
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[3][0] = matchup;					
				   
				}
				   
				   
                //});
				if ( (g.gameType == 2) || (g.gameType == 5)) {
			////  LCK 
						team1 = helpers.deepCopy(series[3][1].home)
						if (series[rnd][6].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][6].home);
							tidsWon.push(series[rnd][6].home.tid);
							tidsWon.push(series[3][1].home.tid);
							tidsLost.push(series[3][1].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][6].away);
							tidsWon.push(series[rnd][6].away.tid);
							tidsWon.push(series[3][1].home.tid);
							tidsLost.push(series[rnd][6].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[3][1] = matchup;	
						console.log("3 1: "+matchup);
				}					
				
				
             //});
				if ( (g.gameType == 3) || (g.gameType == 5)) {
			////  LPL 
						team1 = helpers.deepCopy(series[3][2].home)
						if (series[rnd][7].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][7].home);
						/*	tidsWon.push(series[rnd][7].home.tid);
							tidsWon.push(series[3][2].home);
							tidsLost.push(series[rnd][7].away.tid);*/
							
						} else {
							team2 = helpers.deepCopy(series[rnd][7].away);
							/*tidsWon.push(series[rnd][7].away.tid);
							tidsWon.push(series[3][2].home);
							tidsLost.push(series[rnd][7].home.tid);*/
							
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[3][2] = matchup;			

						team1 = helpers.deepCopy(series[3][3].home)
						if (series[rnd][7].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][7].away);
						/*	tidsWon.push(series[rnd][7].away.tid);
							tidsWon.push(series[3][2].home);
							tidsLost.push(series[rnd][7].home.tid);*/
						} else {
							team2 = helpers.deepCopy(series[rnd][7].home);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[3][3] = matchup;								
				}					
								
				if ((g.gameType == 4) ) {
			
					// LMS champions
					if (series[rnd][8].home.won >= 3) {
						key = series[rnd][8].home.tid;
						key2 = series[rnd][8].away.tid;
					} else if (series[rnd][8].away.won >= 3) {
						key = series[rnd][8].away.tid;
						key2 = series[rnd][8].home.tid;
					}
					dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 3;
							t.seasons[s].hype += 0.05;
							
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}
							t.seasons[s].cash += 200000;
							t.seasons[s].revenues.nationalTv.amount += 200000;	

							return t;
						}
					});
					dao.teams.iterate({
						ot: tx,
						key: key2,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 2;
						//	t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							return t;
						}
					});					
										
					
					
						//return tx.complete().then(function () {
//							return newPhase(g.PHASE.BEFORE_DRAFT);
									console.log("here");
							return true;
						//});					
				}
				
				if ( (g.gameType == 5)) {
			
					// LCS champions
					if (series[rnd][8].home.won >= 3) {
						key = series[rnd][8].home.tid;
					} else if (series[rnd][8].away.won >= 3) {
						key = series[rnd][8].away.tid;
					}						
				}				
				
				if ( (g.gameType == 1)) {
							console.log(g.gameType);			
				  for (i = 2; i < 4; i++) {
						// LCS/CS Promotion 

						if (series[rnd][i].home.won >= 3) {
							key = series[rnd][i].home.tid;
							key2 = series[rnd][i].away.tid;
						} else if (series[rnd][i].away.won >= 3) {
							key = series[rnd][i].away.tid;
							key2 = series[rnd][i].home.tid;
						}
						dao.teams.iterate({
							ot: tx,
							key: key,
							callback: function (t) {
								var s;

								s = t.seasons.length - 1;
								console.log(t);
								t.seasons[s].playoffRoundsWon = 17;
								console.log(t.seasons[s].playoffRoundsWon);
								t.seasons[s].hype += 0.05;
								if (t.seasons[s].hype > 1) {
									t.seasons[s].hype = 1;
								}

								return t;
							}
						});
						
						dao.teams.iterate({
							ot: tx,
							key: key2,
							callback: function (t) {
								var s;

								s = t.seasons.length - 1;
								console.log(t);
								//t.seasons[s].playoffRoundsWon = 2;
							//	t.seasons[s].hype += 0.05;
								//t.seasons[s].playoffRoundsWon = 16;
								t.seasons[s].playoffRoundsWon = 16;
								console.log(t.seasons[s].playoffRoundsWon);								
								return t;
							}
						});	
						

					}
				  for (i = 4; i < 6; i++) {
						// LCS/CS Promotion 

						if (series[rnd][i].home.won >= 3) {
							key3 = series[rnd][i].home.tid;
							key4 = series[rnd][i].away.tid;
						} else if (series[rnd][i].away.won >= 3) {
							key3 = series[rnd][i].away.tid;
							key4 = series[rnd][i].home.tid;
						}

						dao.teams.iterate({
							ot: tx,
							key: key3,
							callback: function (t) {
								var s;

								s = t.seasons.length - 1;
								console.log(t);
								t.seasons[s].playoffRoundsWon = 8;

								console.log(t.seasons[s].playoffRoundsWon);
								t.seasons[s].hype += 0.05;
								if (t.seasons[s].hype > 1) {
									t.seasons[s].hype = 1;
								}

								return t;
							}
						});

						dao.teams.iterate({
							ot: tx,
							key: key4,
							callback: function (t) {
								var s;

								s = t.seasons.length - 1;
								console.log(t);
								//t.seasons[s].playoffRoundsWon = 2;
							//	t.seasons[s].hype += 0.05;
								//t.seasons[s].playoffRoundsWon = 16;

								t.seasons[s].playoffRoundsWon = 6;

								console.log(t.seasons[s].playoffRoundsWon);								
								return t;
							}
						});	
						

					}					

//					console.log("end Ladder playoffs");
					// LCS w/ Ladder playoffs over, end playoffs
				////	return true;
				}		
				
				
            }
			
            if (rnd === 3) {

				// CS Promotion, 3rd place game
				if ( (g.gameType == 1)) {
			
					if (series[rnd][0].home.won >= 3) {
						key = series[rnd][0].home.tid;
						key2 = series[rnd][0].away.tid;
					} else if (series[rnd][0].away.won >= 3) {
						key = series[rnd][0].home.tid;
						key2 = series[rnd][0].away.tid;
					}
				
					
					return dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 6; 
							t.seasons[s].hype += 0.05; //hype but no rounds won
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}
							
							return t;
						}
					}).then(function () {
						return  dao.teams.iterate({
							ot: tx,
							key: key2,
							callback: function (t) {
								var s;

								s = t.seasons.length - 1;

								t.seasons[s].playoffRoundsWon = 6; 
								t.seasons[s].hype += 0.05; //hype but no rounds won
								if (t.seasons[s].hype > 1) {
									t.seasons[s].hype = 1;
								}
								
								return t;
							}
						});
					}).then(function () {					
						//return tx.complete().then(function () {
//							return newPhase(g.PHASE.BEFORE_DRAFT);

							return true;
					});
					
				
				}
				// LCK champ
				if ( (g.gameType == 2)) {
			
					if (series[rnd][1].home.won >= 3) {
						key = series[rnd][1].home.tid;
						key2 = series[rnd][1].away.tid;
					} else if (series[rnd][1].away.won >= 3) {
						key = series[rnd][1].away.tid;
						key2 = series[rnd][1].home.tid;
					}
					return dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 4;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}
							t.seasons[s].cash += 200000;
							t.seasons[s].revenues.nationalTv.amount += 200000;	

							return t;
						}
					}).then(function () {
						dao.teams.iterate({
							ot: tx,
							key: key2,
							callback: function (t) {
								var s;

								s = t.seasons.length - 1;

								t.seasons[s].playoffRoundsWon = 3;
								if (t.seasons[s].hype > 1) {
									t.seasons[s].hype = 1;
								}

								return t;
							}
						});
					}).then(function () {															
					//return tx.complete().then(function () {
//						return newPhase(g.PHASE.BEFORE_DRAFT);

						return true;
					});
					
				
				}				
				// LCK regionals start here
				if ( (g.gameType == 5)) {
					if (series[rnd][1].home.won >= 3) {
						key = series[rnd][1].home.tid;
					} else if (series[rnd][1].away.won >= 3) {
						key = series[rnd][1].away.tid;
					}				
				}				
				
				if ( (g.gameType == 3)  || (g.gameType == 5)) {
			////  LPL 
						team1 = helpers.deepCopy(series[4][0].home);
						if (series[rnd][3].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][3].home);
							tidsWon.push(series[rnd][3].home.tid);
							tidsWon.push(series[4][0].home.tid);
							tidsLost.push(series[rnd][3].away.tid);
							
						} else {
							team2 = helpers.deepCopy(series[rnd][3].away);
							tidsWon.push(series[rnd][3].away.tid);
							tidsWon.push(series[4][0].home.tid);
							tidsLost.push(series[rnd][3].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[4][0] = matchup;			

						team1 = helpers.deepCopy(series[4][1].home);
						if (series[rnd][2].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][2].home);
							tidsWon.push(series[rnd][2].home.tid);
							tidsWon.push(series[4][1].home.tid);
							tidsLost.push(series[rnd][2].away.tid);
							
						} else {
							team2 = helpers.deepCopy(series[rnd][2].away);
							tidsWon.push(series[rnd][2].away.tid);
							tidsWon.push(series[4][1].home.tid);
							tidsLost.push(series[rnd][2].home.tid);							
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[4][1] = matchup;								
				}						
				
            }			

			
            if (rnd === 4) {
			
				if ( (g.gameType == 3) || (g.gameType == 5)) {
			////  LPL 
//						team1 = helpers.deepCopy(series[5][0].home);
						if (series[rnd][0].home.won >= 3) {
							team1 = helpers.deepCopy(series[rnd][0].home);
							tidsWon.push(series[rnd][0].home.tid);
							tidsLost.push(series[rnd][0].away.tid);							
							
						} else {
							team1 = helpers.deepCopy(series[rnd][0].away);
							tidsWon.push(series[rnd][0].away.tid);
							tidsLost.push(series[rnd][0].home.tid);							
						}
						if (series[rnd][1].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][1].home);
							tidsWon.push(series[rnd][1].home.tid);
							tidsLost.push(series[rnd][1].away.tid);							
						} else {
							team2 = helpers.deepCopy(series[rnd][1].away);
							tidsWon.push(series[rnd][1].away.tid);
							tidsLost.push(series[rnd][1].home.tid);							
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[5][0] = matchup;			

//						team1 = helpers.deepCopy(series[5][1].home);
						if (series[rnd][0].home.won >= 3) {
							team1 = helpers.deepCopy(series[rnd][0].away);
						//	tidsWon.push(series[rnd][0].home.tid);
						//	tidsLost.push(series[rnd][0].away.tid);							
						} else {
							team1 = helpers.deepCopy(series[rnd][0].home);
						//	tidsWon.push(series[rnd][0].home.tid);
						//	tidsLost.push(series[rnd][0].home.tid);							
						}
						if (series[rnd][1].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][1].away);
						} else {
							team2 = helpers.deepCopy(series[rnd][1].home);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[5][1] = matchup;								
				}					

			}

           if (rnd === 5) {
			
				if ( (g.gameType == 3)) {
			////  LPL champions
					if (series[rnd][0].home.won >= 3) {
						key = series[rnd][0].home.tid;
						key2 = series[rnd][0].away.tid;
					} else if (series[rnd][0].away.won >= 3) {
						key = series[rnd][0].away.tid;
						key2 = series[rnd][0].home.tid;
					}
					return dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 6;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}
							t.seasons[s].cash += 200000;
							t.seasons[s].revenues.nationalTv.amount += 200000;	

							return t;
						}
					}).then(function () {
						return dao.teams.iterate({
							ot: tx,
							key: key2,
							callback: function (t) {
								var s;

								s = t.seasons.length - 1;

								t.seasons[s].playoffRoundsWon = 5;
								if (t.seasons[s].hype > 1) {
									t.seasons[s].hype = 1;
								}

								return t;
							}
						});					
					}).then(function () {					
					//return tx.complete().then(function () {
//						return newPhase(g.PHASE.BEFORE_DRAFT);

						return true;
					});
				}		

				
				if ( (g.gameType == 5)) {
					// NA LCS Regionals
					if (series[2][0].home.won >= 3) {
					   confWinSeed = series[2][ 0 ].home.seed;
					   confLoseSeed = series[2][ 0 ].away.seed;
					} else {
					   confLoseSeed = series[2][ 0 ].home.seed;
					   confWinSeed = series[2][ 0 ].away.seed;
					}

					//team1 = helpers.deepCopy(series[1][0].home);			// seed 1					
					//team1 = helpers.deepCopy(series[1][1].home);			// seed 2					
					team1 = helpers.deepCopy(series[0][1].home); //seed 3
					team2 = helpers.deepCopy(series[0][0].home); //seed 4
					team3 = helpers.deepCopy(series[0][0].away); //seed 5								
					team4 = helpers.deepCopy(series[0][1].away); //seed 6		

					// Winner, Best Next Regular Season Standings, Winner Regionals
					if (confWinSeed == 1) {
					} else if (confWinSeed == 2) {
					} else if (confWinSeed == 3) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,4,5,6												
					} else if (confWinSeed == 4) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,5,6												
						team2 = helpers.deepCopy(series[0][1].home);													
					} else if (confWinSeed == 5) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,4,6
						team2 = helpers.deepCopy(series[0][1].home);													
						team3 = helpers.deepCopy(series[0][0].home);													
					} else if (confWinSeed == 6) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,4,5											
						team2 = helpers.deepCopy(series[0][1].home);													
						team3 = helpers.deepCopy(series[0][0].home);													
						team4 = helpers.deepCopy(series[0][0].away);													
					} 
					// Winner, Loser, Winner Regionals	(need to finish)				
				/*	if ((confWinSeed == 1) &&  (confLoseSeed == 2)) {
					} else if ((confWinSeed == 2) &&  (confLoseSeed == 1)) {
					} else if (confWinSeed == 3) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,4,5,6												
					} else if (confWinSeed == 4) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,5,6												
						team2 = helpers.deepCopy(series[0][1].home);													
					} else if (confWinSeed == 5) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,4,6
						team2 = helpers.deepCopy(series[0][1].home);													
						team3 = helpers.deepCopy(series[0][0].home);													
					} else if (confWinSeed == 6) {
						team1 = helpers.deepCopy(series[1][1].home);	// 2,3,4,5											
						team2 = helpers.deepCopy(series[0][1].home);													
						team3 = helpers.deepCopy(series[0][0].home);													
						team4 = helpers.deepCopy(series[0][0].away);													
					}*/ 
					
					
					
					matchup1 = {home: team1, away: team4};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					series[6][0] = matchup1;																
					matchup2 = {home: team2, away: team3};
					matchup2.home.won = 0;
					matchup2.away.won = 0;
					series[6][1] = matchup2;																

					// EU LCS Regionals
					if (series[2][9].home.won >= 3) {
					   confWinSeed = series[2][ 9 ].home.seed;
					} else {
					   confWinSeed = series[2][ 9 ].away.seed;
					}

					//team1 = helpers.deepCopy(series[1][10].home);			// seed 1					
					//team1 = helpers.deepCopy(series[1][11].home);			// seed 2					
					
					team1 = helpers.deepCopy(series[0][13].home); //seed 3
					team2 = helpers.deepCopy(series[0][12].home); //seed 4
					team3 = helpers.deepCopy(series[0][12].away); //seed 5								
					team4 = helpers.deepCopy(series[0][13].away); //seed 6								
					
					if (confWinSeed == 1) {
					} else if (confWinSeed == 2) {
					} else if (confWinSeed == 3) {
						team1 = helpers.deepCopy(series[1][11].home);	// 2,4,5,6													
					} else if (confWinSeed == 4) {
						team1 = helpers.deepCopy(series[1][11].home);	// 2,3,5,6												
						team2 = helpers.deepCopy(series[0][13].home);													
					} else if (confWinSeed == 5) {
						team1 = helpers.deepCopy(series[1][11].home);		// 2,3,4,6											
						team2 = helpers.deepCopy(series[0][13].home);													
						team3 = helpers.deepCopy(series[0][12].home);													
					} else  {
						team1 = helpers.deepCopy(series[1][11].home);	// 2,3,4,5												
						team2 = helpers.deepCopy(series[0][13].home);													
						team3 = helpers.deepCopy(series[0][12].home);													
						team4 = helpers.deepCopy(series[0][12].away);													
					}
					matchup1 = {home: team1, away: team4};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					series[6][2] = matchup1;																
					matchup2 = {home: team2, away: team3};
					matchup2.home.won = 0;
					matchup2.away.won = 0;
					series[6][3] = matchup2;																
					
									
					// LCK Regionals
					if (series[3][1].home.won >= 3) {
					   confWinSeed = series[3][ 1 ].home.seed;
					} else {
					   confWinSeed = series[3][ 1 ].away.seed;
					}

					//team1 = helpers.deepCopy(series[3][1].home);			// seed 1					
					//team1 = helpers.deepCopy(series[2][6].home);			// seed 2					
					
					team1 = helpers.deepCopy(series[1][7].home); //seed 3
					team2 = helpers.deepCopy(series[0][9].home); //seed 4
					team3 = helpers.deepCopy(series[0][9].away); //seed 5								
					team4 = helpers.deepCopy(series[6][5].away); //seed 6 //new version that hides unless different								
					
					if (confWinSeed == 1) {
					} else if (confWinSeed == 2) {
					} else if (confWinSeed == 3) {
						team1 = helpers.deepCopy(series[2][6].home);	// 2,4,5,6													
					} else if (confWinSeed == 4) {
						team1 = helpers.deepCopy(series[2][6].home);	// 2,3,5,6												
						team2 = helpers.deepCopy(series[1][7].home);													
					} else if (confWinSeed == 5) {
						team1 = helpers.deepCopy(series[2][6].home);		// 2,3,4,6											
						team2 = helpers.deepCopy(series[1][7].home);													
						team3 = helpers.deepCopy(series[0][9].home);													
					} else  {
						team1 = helpers.deepCopy(series[2][6].home);	// 2,3,4,5												
						team2 = helpers.deepCopy(series[1][7].home);													
						team3 = helpers.deepCopy(series[0][9].home);													
						team4 = helpers.deepCopy(series[0][9].away);													
					}
					matchup1 = {home: team1, away: team4};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					series[6][4] = matchup1;																
					matchup2 = {home: team2, away: team3};
					matchup2.home.won = 0;
					matchup2.away.won = 0;
					series[6][5] = matchup2;		

			

			// LPL Regionals
					if (series[5][0].home.won >= 3) {
					   confWinSeed = series[5][ 0 ].home.seed;
					} else {
					   confWinSeed = series[5][ 0 ].away.seed;
					}

					//team1 = helpers.deepCopy(series[4][1].home);			// seed 1					
					//team1 = helpers.deepCopy(series[4][0].home);			// seed 2					
					
					team1 = helpers.deepCopy(series[3][3].home); //seed 3
					team2 = helpers.deepCopy(series[3][2].home); //seed 4
					team3 = helpers.deepCopy(series[2][7].home); //seed 5								
					team4 = helpers.deepCopy(series[1][8].home); //seed 6 //new version that hides unless different								
					
					if (confWinSeed == 1) {
					} else if (confWinSeed == 2) {
					} else if (confWinSeed == 3) {
						team1 = helpers.deepCopy(series[4][0].home);	// 2,4,5,6													
					} else if (confWinSeed == 4) {
						team1 = helpers.deepCopy(series[4][0].home);	// 2,3,5,6												
						team2 = helpers.deepCopy(series[3][3].home);													
					} else if (confWinSeed == 5) {
						team1 = helpers.deepCopy(series[4][0].home);		// 2,3,4,6											
						team2 = helpers.deepCopy(series[3][3].home);													
						team3 = helpers.deepCopy(series[3][2].home);													
					} else  {
						team1 = helpers.deepCopy(series[4][0].home);	// 2,3,4,5												
						team2 = helpers.deepCopy(series[3][3].home);													
						team3 = helpers.deepCopy(series[3][2].home);													
						team4 = helpers.deepCopy(series[2][7].home);													
					}
					matchup1 = {home: team1, away: team4};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
					series[6][6] = matchup1;																
					matchup2 = {home: team2, away: team3};
					matchup2.home.won = 0;
					matchup2.away.won = 0;
					series[6][7] = matchup2;						
								
								
			// LMS Regionals
				/*	if (series[2][8].home.won >= 3) {
					   confWinSeed = series[2][ 8 ].home.seed;
					} else {
					   confWinSeed = series[2][ 8 ].away.seed;
					}

					//team1 = helpers.deepCopy(series[2][8].home);			// seed 1					
					//team1 = helpers.deepCopy(series[1][9].home);			// seed 2					
					
					team1 = helpers.deepCopy(series[0][11].home); //seed 3
					team2 = helpers.deepCopy(series[0][11].away); //seed 4
					
					// update 5/6
					team3 = helpers.deepCopy(series[6][8].home); //seed 5								
					team4 = helpers.deepCopy(series[6][9].home); //seed 6 //new version that hides unless different								
					
					if (confWinSeed == 1) {
					} else if (confWinSeed == 2) {
					} else if (confWinSeed == 3) {
						team1 = helpers.deepCopy(series[1][9].home);	// 2,4,5,6													
					} else if (confWinSeed == 4) {
						team1 = helpers.deepCopy(series[1][9].home);	// 2,3,5,6												
						team2 = helpers.deepCopy(series[0][11].home);													
					} else if (confWinSeed == 5) {
						team1 = helpers.deepCopy(series[1][9].home);		// 2,3,4,6											
						team2 = helpers.deepCopy(series[0][11].home);													
						team3 = helpers.deepCopy(series[0][11].away);													
					} else  {
						team1 = helpers.deepCopy(series[1][9].home);	// 2,3,4,5												
						team2 = helpers.deepCopy(series[0][11].home);													
						team3 = helpers.deepCopy(series[0][11].away);													
						team4 = helpers.deepCopy(series[6][8].home);													
					}
					// Winner of this doesn't make Worlds, so try to remove
					matchup1 = {home: team1, away: team4};
					matchup1.home.won = 0;
					matchup1.away.won = 0;
				//	series[6][8] = matchup1;																
					matchup2 = {home: team2, away: team3};
					matchup2.home.won = 0;
					matchup2.away.won = 0;*/
				//	series[6][9] = matchup2;									
					// Do Regionals, start at round 6
					
					
				}					

			}			
			
           if (rnd === 6) {
		   
			   i = 0;
			   console.log(series[rnd][i].home.tid);
				if (series[rnd][i].home.won >= 3) {
					team1 = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
					tidsLost.push(series[rnd][i].away.tid);
				} else {
					team1 = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
					tidsLost.push(series[rnd][i].home.tid);
				}
				if (series[rnd][i + 1].home.won >= 3) {
					team2 = helpers.deepCopy(series[rnd][i + 1].home);
					tidsWon.push(series[rnd][i + 1].home.tid);
					tidsLost.push(series[rnd][i + 1].away.tid);
				} else {
					team2 = helpers.deepCopy(series[rnd][i + 1].away);
					tidsWon.push(series[rnd][i + 1].away.tid);
					tidsLost.push(series[rnd][i + 1].home.tid);
				}
								
				matchup = {home: team1, away: team2};
				matchup.home.won = 0;
				matchup.away.won = 0;
				series[7][0] = matchup;		   
			
			
			   i = 2;
				if (series[rnd][i].home.won >= 3) {
					team1 = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
					tidsLost.push(series[rnd][i].away.tid);
				} else {
					team1 = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
					tidsLost.push(series[rnd][i].home.tid);
				}
				if (series[rnd][i + 1].home.won >= 3) {
					team2 = helpers.deepCopy(series[rnd][i + 1].home);
					tidsWon.push(series[rnd][i + 1].home.tid);
					tidsLost.push(series[rnd][i + 1].away.tid);
				} else {
					team2 = helpers.deepCopy(series[rnd][i + 1].away);
					tidsWon.push(series[rnd][i + 1].away.tid);
					tidsLost.push(series[rnd][i + 1].home.tid);
				}
								
				matchup = {home: team1, away: team2};
				matchup.home.won = 0;
				matchup.away.won = 0;
				series[7][1] = matchup;		   

			   i = 4;
				if (series[rnd][i].home.won >= 3) {
					team1 = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
					tidsLost.push(series[rnd][i].away.tid);
				} else {
					team1 = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
					tidsLost.push(series[rnd][i].home.tid);
				}
				if (series[rnd][i + 1].home.won >= 3) {
					team2 = helpers.deepCopy(series[rnd][i + 1].home);
					tidsWon.push(series[rnd][i + 1].home.tid);
					tidsLost.push(series[rnd][i + 1].away.tid);
				} else {
					team2 = helpers.deepCopy(series[rnd][i + 1].away);
					tidsWon.push(series[rnd][i + 1].away.tid);
					tidsLost.push(series[rnd][i + 1].home.tid);
				}
								
				matchup = {home: team1, away: team2};
				matchup.home.won = 0;
				matchup.away.won = 0;
				series[7][2] = matchup;		   

			   i = 6;
				if (series[rnd][i].home.won >= 3) {
					team1 = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
					tidsLost.push(series[rnd][i].away.tid);
				} else {
					team1 = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
					tidsLost.push(series[rnd][i].home.tid);
				}
				if (series[rnd][i + 1].home.won >= 3) {
					team2 = helpers.deepCopy(series[rnd][i + 1].home);
					tidsWon.push(series[rnd][i + 1].home.tid);
					tidsLost.push(series[rnd][i + 1].away.tid);
				} else {
					team2 = helpers.deepCopy(series[rnd][i + 1].away);
					tidsWon.push(series[rnd][i + 1].away.tid);
					tidsLost.push(series[rnd][i + 1].home.tid);
				}
								
				matchup = {home: team1, away: team2};
				matchup.home.won = 0;
				matchup.away.won = 0;
				series[7][3] = matchup;		   

//				i = 0;
			/*	i = 8;
				if (series[rnd][i].home.won >= 3) {
					team1 = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
					tidsLost.push(series[rnd][i].away.tid);
				} else {
					team1 = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
					tidsLost.push(series[rnd][i].home.tid);
				}
				if (series[rnd][i + 1].home.won >= 3) {
					team2 = helpers.deepCopy(series[rnd][i + 1].home);
					tidsWon.push(series[rnd][i + 1].home.tid);
					tidsLost.push(series[rnd][i + 1].away.tid);
				} else {
					team2 = helpers.deepCopy(series[rnd][i + 1].away);
					tidsWon.push(series[rnd][i + 1].away.tid);
					tidsLost.push(series[rnd][i + 1].home.tid);
				}
								
				matchup = {home: team1, away: team2};
				matchup.home.won = 0;
				matchup.away.won = 0;
				series[7][4] = matchup;	*/	   
				
				
			}			
			if (rnd === 7) {
			
			
			//// winner of splits
				i = 0;
				if (series[2][i].home.won >= 3) {
					Team1NA = helpers.deepCopy(series[2][i].home);
					tidsWon.push(series[2][i].home.tid);
				} else {
					Team1NA = helpers.deepCopy(series[2][i].away);
					tidsWon.push(series[2][i].away.tid);
				}			
				i = 9;
				if (series[2][i].home.won >= 3) {
					Team1EU = helpers.deepCopy(series[2][i].home);
					tidsWon.push(series[2][i].home.tid);
				} else {
					Team1EU = helpers.deepCopy(series[2][i].away);
					tidsWon.push(series[2][i].away.tid);
				}	
				i = 1;
				if (series[3][i].home.won >= 3) {
					Team1LCK = helpers.deepCopy(series[3][i].home);
					tidsWon.push(series[3][i].home.tid);
				} else {
					Team1LCK = helpers.deepCopy(series[3][i].away);
					tidsWon.push(series[3][i].away.tid);
				}		
				i = 0;
				if (series[5][i].home.won >= 3) {
					Team1LPL = helpers.deepCopy(series[5][i].home);
					tidsWon.push(series[5][i].home.tid);
				} else {
					Team1LPL = helpers.deepCopy(series[5][i].away);
					tidsWon.push(series[5][i].away.tid);
				}		
				i = 8;
				if (series[2][i].home.won >= 3) {
					Team1LMS = helpers.deepCopy(series[2][i].home);
					tidsWon.push(series[2][i].home.tid);
				} else {
					Team1LMS = helpers.deepCopy(series[2][i].away);
					tidsWon.push(series[2][i].away.tid);
				}	
				i = 12;				
				if (series[1][i].home.won >= 3) {
					Team1WC = helpers.deepCopy(series[1][i].home);
					tidsWon.push(series[1][i].home.tid);
				} else {
					Team1WC = helpers.deepCopy(series[1][i].away);
					tidsWon.push(series[1][i].away.tid);
				}					
					

				// winner of regionals	
				i = 0;
				if (series[rnd][i].home.won >= 3) {
					Team3NA = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
				} else {
					Team3NA = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
				}			
				i = 1;
				if (series[rnd][i].home.won >= 3) {
					Team3EU = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
				} else {
					Team3EU = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
				}	
				i = 2;
				if (series[rnd][i].home.won >= 3) {
					Team3LCK = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
				} else {
					Team3LCK = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
				}		
				i = 3;
				if (series[rnd][i].home.won >= 3) {
					Team3LPL = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
				} else {
					Team3LPL = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
				}		
				/*i = 4;
				if (series[rnd][i].home.won >= 3) {
					Team3LMS = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
				} else {
					Team3LMS = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
				}*/	
				
				
			
				// NA best record, but not winner of split
				
				if (series[2][0].home.won >= 3) {
				   confWinSeed = series[2][ 0 ].home.seed;
				} else {
				   confWinSeed = series[2][ 0 ].away.seed;
				}

				Team2NA = helpers.deepCopy(series[1][1].home);	
				//team1 = helpers.deepCopy(series[1][0].home);			// seed 1					
				//team1 = helpers.deepCopy(series[1][1].home);			// seed 2					
				if (confWinSeed == 1) {
				} else  {
				  Team2NA = helpers.deepCopy(series[1][0].home);	
				}		
					
					
				// EU best record, but not winner of split
				if (series[2][9].home.won >= 3) {
				   confWinSeed = series[2][ 9 ].home.seed;
				} else {
				   confWinSeed = series[2][ 9 ].away.seed;
				}

				Team2EU = helpers.deepCopy(series[1][11].home);	
				//team1 = helpers.deepCopy(series[1][0].home);			// seed 1					
				//team1 = helpers.deepCopy(series[1][1].home);			// seed 2					
				if (confWinSeed == 1) {
				} else  {
				  Team2EU = helpers.deepCopy(series[1][10].home);	
				}		
					
					
			// LCK best record, but not winner of split
				if (series[3][1].home.won >= 3) {
				   confWinSeed = series[3][ 1 ].home.seed;
				} else {
				   confWinSeed = series[3][ 1 ].away.seed;
				}

				Team2LCK = helpers.deepCopy(series[2][6].home);	
				//team1 = helpers.deepCopy(series[1][0].home);			// seed 1					
				//team1 = helpers.deepCopy(series[1][1].home);			// seed 2					
				if (confWinSeed == 1) {
				} else  {
				  Team2LCK = helpers.deepCopy(series[3][1].home);	
				}	
			
				
			// LPL best record, but not winner of split
				if (series[5][0].home.won >= 3) {
					confWinSeed = series[5][ 0 ].home.seed;
				} else {
					confWinSeed = series[5][ 0 ].away.seed;
				}

				//team1 = helpers.deepCopy(series[1][0].home);			// seed 1					
				//team1 = helpers.deepCopy(series[1][1].home);			// seed 2					
				if (confWinSeed == 1) {
				  Team2LPL = helpers.deepCopy(series[4][0].home);	
				} else  {
				  Team2LPL = helpers.deepCopy(series[4][1].home);	
				}							
					

					
			// LMS best record, but not winner of split
			//     console.log(series[2][8].home.won);
			//     console.log(series[2][8].away.won);				 
				if (series[2][8].home.won >= 3) {
				   confWinSeed = series[2][ 8 ].home.seed;
					console.log(series[2][8].home.seed);				 
				} else {
				   confWinSeed = series[2][ 8 ].away.seed;
					console.log(series[2][8].away.seed);				 
				}

				//console.log(confWinSeed);
				Team2LMS = helpers.deepCopy(series[1][9].home);	
				//team1 = helpers.deepCopy(series[1][0].home);			// seed 1					
				//team1 = helpers.deepCopy(series[1][1].home);			// seed 2					
			/*	console.log(Team2LMS);
				console.log(series[2][8]);
				console.log(series[1][9]);*/
				if (confWinSeed == 1) {
				} else  {
					console.log(Team2LMS);
				
				  Team2LMS = helpers.deepCopy(series[2][8].home);	
					console.log(Team2LMS);
				}		
			/*	console.log("LMS: "+confWinSeed);
				console.log(series[2][8].home.seed);
				console.log(series[2][8].home.won);
				console.log(series[2][8].home.tid);
				console.log(series[1][9].home.seed);
				console.log(series[1][9].home.won);
				console.log(series[1][9].home.tid);
				console.log(Team2LMS);*/
				
			// WC best record, but not winner of split
				if (series[1][12].home.won >= 3) {
				   confWinSeed = series[1][ 12 ].home.seed;
				} else {
				   confWinSeed = series[1][ 12 ].away.seed;
				}

				Team2WC = helpers.deepCopy(series[0][14].home);	
				//team1 = helpers.deepCopy(series[1][0].home);			// seed 1					
				//team1 = helpers.deepCopy(series[1][1].home);			// seed 2					
				if (confWinSeed == 1) {
				} else  {
				  Team2WC = helpers.deepCopy(series[0][15].home);	
				}							
				
				
				//http://2015.na.lolesports.com/articles/2015-world-championship-format
				// WC, LMS, LPL, LCK, EU, NA
				
				// Pool 1 LPL1, LCK1, EU1, NA1
				// Pool 2 LMS1, LMS2, LPL2, LPL3, LCK2, LCK3, EU2, NA2
				// Pool 3 EU3, NA3, WC1, WC2
				
			/*	console.log(Team1LPL);
				console.log(Team2LPL); 
				console.log(Team3LPL);
				console.log(Team1LCK);
				console.log(Team2LCK);
				console.log(Team3LCK); 
				console.log(Team1EU);  
				console.log(Team2EU);
				console.log(Team3EU);
				console.log(Team1NA);
				console.log(Team2NA);
				console.log(Team3NA);
				console.log(Team1LMS); 
				console.log(Team2LMS); //same as 1
				console.log(Team3LMS);
				console.log(Team1WC);
				console.log(Team2WC);*/
				
				
				// Each group is 1, 2, 1
				// don't watch same region in same group
				
				// A   LPL1 LMS2 EU2 NA3
				// B   LCK1 LPL2 NA2 EU3
				// C   EU1  LPL3 LCK2 WC1
				// D   NA1	LMS1 LCK3 WC2		
				
					// this comes at end with groups. 
					// A
				
				// A   LPL1 LMS2 EU2 NA3
				matchup1 = {home: Team1LPL, away: Team2LMS}; //LMS2 is wrong
				matchup1.home.won = 0;
				matchup1.away.won = 0;
				matchup1.home.loss = 0;
				matchup1.away.loss = 0;
				
				series[8][0] = matchup1;																
				matchup1 = {home: Team2EU, away: Team3NA};
				matchup1.home.won = 0;
				matchup1.away.won = 0;
				matchup1.home.loss = 0;
				matchup1.away.loss = 0;
				
				series[8][1] = matchup1;																

				
					// this comes at end with groups.
					// B
									// B   LCK1 LPL2 NA2 EU3

				matchup2 = {home: Team1LCK, away: Team2LPL};
				matchup2.home.won = 0;
				matchup2.away.won = 0;
				matchup2.home.loss = 0;
				matchup2.away.loss = 0;
				
				series[8][2] = matchup2;		
				
				matchup2 = {home: Team2NA, away: Team3EU};
				matchup2.home.won = 0;
				matchup2.away.won = 0;
				matchup2.home.loss = 0;
				matchup2.away.loss = 0;
				
				series[8][3] = matchup2;																

					// this comes at end with groups.
					// C
				// C   EU1  LPL3 LCK2 WC1
					
				matchup3 = {home: Team1EU, away: Team3LPL};
				matchup3.home.won = 0;
				matchup3.away.won = 0;
				matchup3.home.loss = 0;
				matchup3.away.loss = 0;

				series[8][4] = matchup3;		
				
				matchup3 = {home: Team2LCK, away: Team1WC};
				matchup3.home.won = 0;
				matchup3.away.won = 0;
				matchup3.home.loss = 0;
				matchup3.away.loss = 0;

					// this comes at end with groups.
					// D
				// D   NA1	LMS1 LCK3 WC2		
					
					series[8][5] = matchup3;																
				matchup4 = {home: Team1NA, away: Team1LMS};
				matchup4.home.won = 0;
				matchup4.away.won = 0;
				matchup4.home.loss = 0;
				matchup4.away.loss = 0;

				series[8][6] = matchup4;	
				
				matchup4 = {home: Team3LCK, away: Team2WC};
				matchup4.home.won = 0;
				matchup4.away.won = 0;
				matchup4.home.loss = 0;
				matchup4.away.loss = 0;

				series[8][7] = matchup4;			
			
				console.log(series[8][0]);
				console.log(series[8][1]);
				console.log(series[8][2]);
				console.log(series[8][3]);
				console.log(series[8][4]);
				console.log(series[8][5]);
				console.log(series[8][6]);
				console.log(series[8][7]);
			}			
			
			if (rnd === 8) {
			
				// find teams with most wins from groups
				var j,k;
				var orderGroup, orderGroupWin, orderGroupLoss, orderGroupCopy,teamGroup;
				var orderGroupTemp, orderGroupWinTemp, orderGroupLossTemp,orderGroupCopyTemp ;
				orderGroup = [[],[],[],[]];
				orderGroupWin = [[],[],[],[]];
				orderGroupLoss = [[],[],[],[]];
				orderGroupCopy = [[],[],[],[]];
				teamGroup = [[],[],[],[],[],[],[],[]];
				// From Group 1
				//i = 0;			
                for (i = 0; i < 4; i++) {
					orderGroup = [[],[],[],[]];
					orderGroupWin = [[],[],[],[]];
					orderGroupLoss = [[],[],[],[]];
					orderGroupCopy = [[],[],[],[]];
					console.log(orderGroupCopy);
					orderGroup[0] = series[rnd][i*2].home.tid;
					orderGroupWin[0] = series[rnd][i*2].home.won;				
					orderGroupLoss[0] = series[rnd][i*2].home.loss;				
					orderGroupCopy[0] = helpers.deepCopy(series[rnd][i*2].home);				
					orderGroup[1] = series[rnd][i*2].away.tid;
					orderGroupWin[1] = series[rnd][i*2].away.won;				
					orderGroupLoss[1] = series[rnd][i*2].away.loss;				
					orderGroupCopy[1] = helpers.deepCopy(series[rnd][i*2].away);				
					orderGroup[2] = series[rnd][i*2+1].home.tid;
					orderGroupWin[2] = series[rnd][i*2+1].home.won;				
					orderGroupLoss[2] = series[rnd][i*2+1].home.loss;				
					orderGroupCopy[2] =helpers.deepCopy( series[rnd][i*2+1].home);				
					orderGroup[3] = series[rnd][i*2+1].away.tid;
					orderGroupWin[3] = series[rnd][i*2+1].away.won;	
					orderGroupLoss[3] = series[rnd][i*2+1].away.loss;	
					orderGroupCopy[3] = helpers.deepCopy(series[rnd][i*2+1].away);	
					
					
					
					for (j = 0; j < 4; j++) {
						for (k = (j+1); k < 4; k++) {
						   if ( (orderGroupWin[j]-orderGroupLoss[j]) < (orderGroupWin[k]-orderGroupLoss[k]) ) {
								orderGroupTemp = orderGroup[j];
								orderGroupWinTemp = orderGroupWin[j];
								orderGroupLossTemp = orderGroupLoss[j];
								orderGroupCopyTemp = helpers.deepCopy( orderGroupCopy[j]);
								orderGroup[j] = orderGroup[k];
								orderGroupWin[j] = orderGroupWin[k];
								orderGroupLoss[j] = orderGroupLoss[k];
								orderGroupCopy[j] = helpers.deepCopy( orderGroupCopy[k]);
								orderGroup[k] = orderGroupTemp;
								orderGroupWin[k] = orderGroupWinTemp;
								orderGroupLoss[k] = orderGroupLossTemp;
								orderGroupCopy[k] = helpers.deepCopy( orderGroupCopyTemp);
							  
						   }
					   }								
					}
					
					/*console.log(orderGroup);
					console.log(orderGroupWin);
					console.log(orderGroupLoss);
					console.log(orderGroupCopy);*/
					//team1 = helpers.deepCopy(orderGroupCopy[0]);
					//team2 = helpers.deepCopy(orderGroupCopy[1]);
					teamGroup[i*2]= helpers.deepCopy(orderGroupCopy[0]);
					teamGroup[1+i*2]= helpers.deepCopy(orderGroupCopy[1]);
				}
				//matchup1 = {home: team1};
				//matchup1 = {away: team2};
				console.log(teamGroup);
				console.log(teamGroup[0].tid);
				console.log(teamGroup[1].tid);
				console.log(teamGroup[2].tid);
				console.log(teamGroup[3].tid);
				console.log(teamGroup[4].tid);
				console.log(teamGroup[5].tid);
				console.log(teamGroup[6].tid);
				console.log(teamGroup[7].tid);
				
				matchup1 = {home: teamGroup[0],away: teamGroup[5]};				
				matchup1.home.won = 0;
				matchup1.away.won = 0;			
				series[9][0] = matchup1;				
				matchup2 = {home: teamGroup[2],away: teamGroup[7]};				
				matchup2.home.won = 0;
				matchup2.away.won = 0;			
				series[9][1] = matchup2;				
				matchup3 = {home: teamGroup[4],away: teamGroup[1]};				
				matchup3.home.won = 0;
				matchup3.away.won = 0;			
				series[9][2] = matchup3;				
				matchup4 = {home: teamGroup[6],away: teamGroup[3]};				
				matchup4.home.won = 0;
				matchup4.away.won = 0;			
				series[9][3] = matchup4;				
			
			}			
			
			if (rnd === 9) {
			
			    i = 0;
				if (series[rnd][i].home.won >= 3) {
					team1 = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
				} else {
					team1 = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
				}
				if (series[rnd][i + 1].home.won >= 3) {
					team2 = helpers.deepCopy(series[rnd][i + 1].home);
					tidsWon.push(series[rnd][i + 1].home.tid);
				} else {
					team2 = helpers.deepCopy(series[rnd][i + 1].away);
					tidsWon.push(series[rnd][i + 1].away.tid);
				}
								
				matchup = {home: team1, away: team2};
				matchup.home.won = 0;
				matchup.away.won = 0;
				series[10][0] = matchup;

			    i = 2;
				if (series[rnd][i].home.won >= 3) {
					team1 = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
				} else {
					team1 = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
				}
				if (series[rnd][i + 1].home.won >= 3) {
					team2 = helpers.deepCopy(series[rnd][i + 1].home);
					tidsWon.push(series[rnd][i + 1].home.tid);
				} else {
					team2 = helpers.deepCopy(series[rnd][i + 1].away);
					tidsWon.push(series[rnd][i + 1].away.tid);
				}
								
				matchup = {home: team1, away: team2};
				matchup.home.won = 0;
				matchup.away.won = 0;
				series[10][1] = matchup;				
				console.log(tidsWon);					
				console.log(tidsWon.length);					

							
			}				
			
			if (rnd === 10) {
			
				// find teams with most wins from groups
				i = 0;
				if (series[rnd][i].home.won >= 3) {
					team1 = helpers.deepCopy(series[rnd][i].home);
					tidsWon.push(series[rnd][i].home.tid);
				} else {
					team1 = helpers.deepCopy(series[rnd][i].away);
					tidsWon.push(series[rnd][i].away.tid);
				}
				if (series[rnd][i + 1].home.won >= 3) {
					team2 = helpers.deepCopy(series[rnd][i + 1].home);
					tidsWon.push(series[rnd][i + 1].home.tid);
				} else {
					team2 = helpers.deepCopy(series[rnd][i + 1].away);
					tidsWon.push(series[rnd][i + 1].away.tid);
				}
								
				matchup = {home: team1, away: team2};
				matchup.home.won = 0;
				matchup.away.won = 0;
				series[11][0] = matchup;				
				console.log(tidsWon);					
				console.log(tidsWon.length);					
				/*if ( (g.gameType == 5)) {
					return tx.complete().then(function () {
						return newPhase(g.PHASE.BEFORE_DRAFT);
					});					
				}*/					
			}				
			
			if (rnd === 11) {			
					if (series[rnd][0].home.won >= 3) {
						key = series[rnd][0].home.tid;
					} else if (series[rnd][0].away.won >= 3) {
						key = series[rnd][0].away.tid;
					}
					dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 6;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}
							t.seasons[s].cash += 200000;
							t.seasons[s].revenues.nationalTv.amount += 200000;	

							return t;
						}
					});			
			
			
				if ( (g.gameType == 5)) {
									console.log("here");					
					return true;
					/*return tx.complete().then(function () {
						return newPhase(g.PHASE.BEFORE_DRAFT);
					});					
					return tx.complete().then(function () {
						return newPhase(g.PHASE.BEFORE_DRAFT);
					});									*/
				}					
			}				
			
            // Playoffs are not over! Make another round

            // Set matchups for next round
			// Do for LCS, LCS promotion, and CS promotion			
            //
			if (rnd == 0) {

			console.log(rnd);
				if ((g.gameType == 0) || (g.gameType == 1) || (g.gameType == 5)) {
			
					//// First LCS game second round
						team1 = helpers.deepCopy(series[1][0].home)
						if (series[rnd][0].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][0].home);
							tidsWon.push(series[rnd][0].home.tid);
							tidsWon.push(series[1][0].home.tid);
							tidsLost.push(series[rnd][0].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][0].away);
							tidsWon.push(series[rnd][0].away.tid);
							tidsWon.push(series[1][0].home.tid);
							tidsLost.push(series[rnd][0].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[1][0] = matchup;



					
					//// Second LCS game second round				
						team1 = helpers.deepCopy(series[1][1].home)
						if (series[rnd][1].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][1].home);
							tidsWon.push(series[rnd][1].home.tid);
							tidsWon.push(series[1][1].home.tid);
							tidsLost.push(series[rnd][1].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][1].away);
							tidsWon.push(series[rnd][1].away.tid);
							tidsWon.push(series[1][1].home.tid);
							tidsLost.push(series[rnd][1].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[1][1] = matchup;				
			console.log(g.gameType);						
				}	
				
				if ( (g.gameType == 5)) {
			
					//// First LCS game second round
						team1 = helpers.deepCopy(series[1][10].home)
						if (series[rnd][12].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][12].home);
							tidsWon.push(series[rnd][12].home.tid);
							tidsWon.push(series[1][10].home.tid);							
							tidsLost.push(series[rnd][12].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][12].away);
							tidsWon.push(series[rnd][12].away.tid);
							tidsWon.push(series[1][10].home.tid);														
							tidsLost.push(series[rnd][12].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[1][10] = matchup;



					
					//// Second LCS game second round				
						team1 = helpers.deepCopy(series[1][11].home)
						if (series[rnd][13].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][13].home);
							tidsWon.push(series[rnd][13].home.tid);
							tidsWon.push(series[1][11].home.tid);	
							tidsLost.push(series[rnd][13].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][13].away);
							tidsWon.push(series[rnd][13].away.tid);
							tidsWon.push(series[1][11].home.tid);	
							tidsLost.push(series[rnd][13].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[1][11] = matchup;				
			console.log(g.gameType);												
				}					
			
			
				if ( (g.gameType == 1)) {
			



				//// First LCS promotional game second round				
					
				   i = 2;
					if (series[rnd][i].home.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
						tidsWon.push(series[rnd][i].home.tid);
						tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
						tidsWon.push(series[rnd][i].away.tid);
						tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
						tidsWon.push(series[rnd][i + 1].away.tid);
						tidsLost.push(series[rnd][i + 1].home.tid);
					}
									
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[1][2] = matchup;

				//// Second LCS promotional game second round				
				   i = 2;
					if (series[rnd][i].away.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
					    tidsWon.push(series[rnd][i].home.tid);
				        tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
				        tidsWon.push(series[rnd][i].away.tid);
					    tidsLost.push(series[rnd][i].home.tid);
					}

					if (series[rnd][i + 1].away.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
					    tidsWon.push(series[rnd][i + 1].home.tid);
				        tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
				        tidsWon.push(series[rnd][i + 1].away.tid);
					    tidsLost.push(series[rnd][i + 1].home.tid);
					}
									
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[1][3] = matchup;


					// First CS promotional game second round
				   // Find the two winning teams
				   i = 4;
					if (series[rnd][i].home.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
						tidsWon.push(series[rnd][i].home.tid);
						tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
						tidsWon.push(series[rnd][i].away.tid);
						tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
						tidsWon.push(series[rnd][i + 1].away.tid);
						tidsLost.push(series[rnd][i + 1].home.tid);
					}
					
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[1][4] = matchup;				
					
				//// Second CS promotional game second round				
					team1 = helpers.deepCopy(series[1][5].home)				
					if (series[rnd][6].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][6].home);
						tidsWon.push(series[rnd][6].home.tid);
						tidsLost.push(series[rnd][6].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][6].away);
						tidsWon.push(series[rnd][6].away.tid);
						tidsLost.push(series[rnd][6].home.tid);
					}
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[1][5] = matchup;
					
					
					// Third CS promotinal game second round
				   // Find the two winning teams
					i = 7;
					if (series[rnd][i].home.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
						tidsWon.push(series[rnd][i].home.tid);
						tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
						tidsWon.push(series[rnd][i].away.tid);
						tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
						tidsWon.push(series[rnd][i + 1].away.tid);
						tidsLost.push(series[rnd][i + 1].home.tid);
					}
					
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[1][6] = matchup;						
				
				}			

				// LCK
				if ( (g.gameType == 2) || (g.gameType == 5)) {
			////  LCK 
						team1 = helpers.deepCopy(series[1][7].home)
						if (series[rnd][9].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][9].home);
							tidsWon.push(series[rnd][9].home.tid);
							tidsLost.push(series[rnd][9].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][9].away);
							tidsWon.push(series[rnd][9].away.tid);
							tidsLost.push(series[rnd][9].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[1][7] = matchup;			
			console.log(g.gameType);												
				}		

				// LPL
				if ( (g.gameType == 3) || (g.gameType == 5)) {
			////  LPL 
						team1 = helpers.deepCopy(series[1][8].home)
						if (series[rnd][10].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][10].home);
							tidsWon.push(series[rnd][10].home.tid);
							tidsLost.push(series[rnd][10].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][10].away);
							tidsWon.push(series[rnd][10].away.tid);
							tidsLost.push(series[rnd][10].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[1][8] = matchup;			
			console.log(g.gameType);												
				}						
				
				// 
				if ( (g.gameType == 4) || (g.gameType == 5)) {
			////  
						team1 = helpers.deepCopy(series[1][9].home)
						if (series[rnd][11].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][11].home);
							tidsWon.push(series[rnd][11].home.tid);
							tidsLost.push(series[rnd][11].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][11].away);
							tidsWon.push(series[rnd][11].away.tid);
							tidsLost.push(series[rnd][11].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[1][9] = matchup;	
			console.log(g.gameType);												
				}		

				if ( (g.gameType == 5)) {
					i = 14;
					if (series[rnd][i].home.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
						tidsWon.push(series[rnd][i].home.tid);
						tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
						tidsWon.push(series[rnd][i].away.tid);
						tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
						tidsWon.push(series[rnd][i + 1].away.tid);
						tidsLost.push(series[rnd][i + 1].home.tid);
					}
					
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[1][12] = matchup;												
				}						
				
			}
			
			if (rnd == 1) {
			
			
				if ((g.gameType == 0) || (g.gameType == 1) || (g.gameType == 5)) {
			
					// LCS Final
				   // Find the two winning teams
					i = 0;
					if (series[rnd][i].home.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
						tidsWon.push(series[rnd][i].home.tid);
						tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
						tidsWon.push(series[rnd][i].away.tid);
						tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
						tidsWon.push(series[rnd][i + 1].away.tid);
						tidsLost.push(series[rnd][i + 1].home.tid);
					}
					
				
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[2][0] = matchup	;	

					// LCS 3rd Place Game
				   // Find the two winning teams
					i = 0;
					if (series[rnd][i].away.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
				        tidsWon.push(series[rnd][i].home.tid);
				        tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
				        tidsWon.push(series[rnd][i].away.tid);
				        tidsLost.push(series[rnd][i].away.tid);
					}
					if (series[rnd][i + 1].away.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
				        tidsWon.push(series[rnd][i + 1].home.tid);
				        tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
				        tidsWon.push(series[rnd][i + 1].away.tid);
				        tidsLost.push(series[rnd][i + 1].home.tid);
					}
					

					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[2][1] = matchup;			
				}		

				if ((g.gameType == 5)) {
			
					// LCS Final
				   // Find the two winning teams
					i = 10;
					if (series[rnd][i].home.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
						tidsWon.push(series[rnd][i].home.tid);
						tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
						tidsWon.push(series[rnd][i].away.tid);
						tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
						tidsWon.push(series[rnd][i + 1].away.tid);
						tidsLost.push(series[rnd][i + 1].home.tid);
					}
					
				
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[2][9] = matchup	;	

					// LCS 3rd Place Game
				   // Find the two winning teams
					i = 10;
					if (series[rnd][i].away.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
				        tidsWon.push(series[rnd][i].home.tid);
				        tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
				        tidsWon.push(series[rnd][i].away.tid);
				        tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].away.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
				        tidsWon.push(series[rnd][i + 1].home.tid);
				        tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
				        tidsWon.push(series[rnd][i + 1].away.tid);
				        tidsLost.push(series[rnd][i + 1].home.tid);
					}
					

					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[2][10] = matchup;			
				}						

				
				if ( (g.gameType == 1)) {
				
				// for LCS promotion, and CS, use something different than tidsWon?, tidsWonCS and tidsWonLadder?
				
				// winner of finals, makes it to LCS, CS 2nd 3rd play LCS 8 and 9 for final two spots
					if (series[rnd][2].home.won >= 3) {
						key = series[rnd][2].home.tid;
					} else if (series[rnd][2].away.won >= 3) {
						key = series[rnd][2].away.tid;
					}
					dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 17;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							return t;
						}
					});						
				
				//// First LCS promotional game second round				
					team1 = helpers.deepCopy(series[2][2].home)
					if (series[rnd][2].away.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][2].home);
						//tidsWon.push(series[rnd][2].home.tid);
						//tidsLost.push(series[rnd][2].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][2].away);
						//tidsWon.push(series[rnd][2].away.tid);
						//tidsLost.push(series[rnd][2].home.tid);
					}
					
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[2][2] = matchup;
				
					
					
				//// Second LCS promotional game second round				
					team1 = helpers.deepCopy(series[2][3].home)
					if (series[rnd][3].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][3].home);
						//tidsWon.push(series[rnd][3].home.tid);
						//tidsLost.push(series[rnd][3].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][3].away);
						//tidsWon.push(series[rnd][3].away.tid);
						//tidsLost.push(series[rnd][3].home.tid);
					}
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[2][3] = matchup;				
					
					if (series[rnd][3].home.won >= 3) {
						key = series[rnd][3].away.tid;
					} else if (series[rnd][3].away.won >= 3) {
						key = series[rnd][3].home.tid;
					}
					dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 15;
							//t.seasons[s].hype += 0.05;
						//	if (t.seasons[s].hype > 1) {
							//	t.seasons[s].hype = 1;
							//}

							return t;
						}
					});						
					
					
				//// First CS promotional final
					team1 = helpers.deepCopy(series[2][4].home)				
					if (series[rnd][4].home.won >= 3) {
					    team2 = helpers.deepCopy(series[rnd][4].home);
						tidsWon.push(series[rnd][4].home.tid);
						tidsLost.push(series[rnd][4].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][4].away);
						tidsWon.push(series[rnd][4].away.tid);
						tidsLost.push(series[rnd][4].home.tid);
					}
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[2][4] = matchup;				
					
					// CS Promoational 2nd Final
				   // Find the two winning teams
					i = 5;
					if (series[rnd][i].home.won >= 3) {
						team1 = helpers.deepCopy(series[rnd][i].home);
						tidsWon.push(series[rnd][i].home.tid);
						tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
						tidsWon.push(series[rnd][i].away.tid);
						tidsLost.push(series[rnd][i].home.tid);
					}
					if (series[rnd][i + 1].home.won >= 3) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					}
					
					matchup = {home: team1, away: team2};
					matchup.home.won = 0;
					matchup.away.won = 0;
					series[2][5] = matchup;		

				
				}
				
				if ( (g.gameType == 2) || (g.gameType == 5)) {
			////  LCK 
						team1 = helpers.deepCopy(series[2][6].home)
						if (series[rnd][7].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][7].home);
							tidsWon.push(series[rnd][7].home.tid);
							tidsLost.push(series[rnd][7].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][7].away);
							tidsWon.push(series[rnd][7].away.tid);
							tidsLost.push(series[rnd][7].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[2][6] = matchup;			
				}		

				if ( (g.gameType == 3) || (g.gameType == 5)) {
			////  LPL 
						team1 = helpers.deepCopy(series[2][7].home)
						if (series[rnd][8].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][8].home);
							tidsWon.push(series[rnd][8].home.tid);
							tidsLost.push(series[rnd][8].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][8].away);
							tidsWon.push(series[rnd][8].away.tid);
							tidsLost.push(series[rnd][8].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[2][7] = matchup;			
				}		

				
				if ( (g.gameType == 4) || (g.gameType == 5)) {
			////  LMS
						team1 = helpers.deepCopy(series[2][8].home)
						if (series[rnd][9].home.won >= 3) {
							team2 = helpers.deepCopy(series[rnd][9].home);
							tidsWon.push(series[rnd][9].home.tid);
							tidsLost.push(series[rnd][9].away.tid);
						} else {
							team2 = helpers.deepCopy(series[rnd][9].away);
							tidsWon.push(series[rnd][9].away.tid);
							tidsLost.push(series[rnd][9].home.tid);
						}
						matchup = {home: team1, away: team2};
						matchup.home.won = 0;
						matchup.away.won = 0;
						series[2][8] = matchup;			
				}		
				
			
			}
			
			
			/*
            for (i = 0; i < series[rnd].length; i += 2) {
                // Find the two winning teams
                if (series[rnd][i].home.won === 2) {
                    team1 = helpers.deepCopy(series[rnd][i].home);
                    tidsWon.push(series[rnd][i].home.tid);
                } else {
                    team1 = helpers.deepCopy(series[rnd][i].away);
                    tidsWon.push(series[rnd][i].away.tid);
                }
                if (series[rnd][i + 1].home.won === 2) {
                    team2 = helpers.deepCopy(series[rnd][i + 1].home);
                    tidsWon.push(series[rnd][i + 1].home.tid);
                } else {
                    team2 = helpers.deepCopy(series[rnd][i + 1].away);
                    tidsWon.push(series[rnd][i + 1].away.tid);
                }

                // Set home/away in the next round
                if (team1.winp > team2.winp) {
                    matchup = {home: team1, away: team2};
                } else {
                    matchup = {home: team2, away: team1};
                }

                matchup.home.won = 0;
                matchup.away.won = 0;
                series[rnd + 1][i / 2] = matchup;
            }*/

            playoffSeries.currentRound += 1;

            dao.playoffSeries.put({ot: tx, value: playoffSeries});

            // Update hype for winning a series
		/*	console.log("update hype");					
			console.log(rnd);					
			console.log(tidsWon.length);					
			console.log(tidsWon);					*/
			//console.log(tidsWon);
            //for (i = 0; i < tidsWon.length; i++) {
				//console.log(i);					
            return dao.playoffSeries.put({ot: tx, value: playoffSeries}).then(function () {
                // Update hype for winning a series
				console.log(tidsWon.length);
				console.log(tidsWon[0]);				
				console.log(tidsWon[1]);								
                return Promise.map(tidsWon, function (tid) {
                    return dao.teams.get({					
						ot: tx,
						key: tid
					}).then(function (t) {
						var s;

						s = t.seasons.length - 1;
						if (g.gameType == 1) {
							//if (rnd < 2) {
								//console.log(t.seasons[s].playoffRoundsWon);					
								t.seasons[s].playoffRoundsWon += 1;
								//console.log(t.seasons[s].playoffRoundsWon);
							//}
						} else if  ((g.gameType == 5) && (rnd>8)) {
							t.seasons[s].playoffRoundsWon = playoffSeries.currentRound-6;
						
						} else if (g.gameType == 5) {
							//t.seasons[s].playoffRoundsWon = playoffSeries.currentRound;					
						} else {
							t.seasons[s].playoffRoundsWon = playoffSeries.currentRound;
						}
						t.seasons[s].hype += 0.05;
						if (t.seasons[s].hype > 1) {
							t.seasons[s].hype = 1;
						}

							return dao.teams.put({ot: tx, value: t});
						});
                });
            }).then(function () {
			//   return dao.playoffSeries.put({ot: tx, value: playoffSeries}).then(function () {
					// Update hype for winning a series
					return Promise.map(tidsLost, function (tid) {
						return dao.teams.get({					
							ot: tx,
							key: tid
						}).then(function (t) {				
			/*console.log(tidsLost);			
            for (i = 0; i < tidsLost.length; i++) {
                dao.teams.get({
                    ot: tx,
                    key: tidsLost[i]
                }).then(function (t) {*/
							var s;

							s = t.seasons.length - 1;
							if ((g.gameType == 1) || (g.gameType == 5)) {
								//t.seasons[s].playoffRoundsWon += 1;
							} else {
								t.seasons[s].playoffRoundsWon = playoffSeries.currentRound-1;
							}					
							t.seasons[s].hype -= 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}
					
						   return dao.teams.put({ot: tx, value: t});
						});
					});
				//});					
            }).then(function () {

// do this for those rounds
// round 0 done
// round 5+1 1
				if ((g.gameType == 5) && (rnd == 5)) {
					for (i = 0; i < 8; i++) {
						dao.teams.get({
							ot: tx,
							key: series[rnd+1][i].away.tid
						}).then(function (t) {
							var s;

							s = t.seasons.length - 1;
							t.seasons[s].playoffRoundsWon = 1;
							t.seasons[s].hype *= 0.95;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							dao.teams.put({ot: tx, value: t});
						});
					}
				}
				if ((g.gameType == 5) && (rnd == 5)) {
					for (i = 0; i < 8; i++) {
						dao.teams.get({
							ot: tx,
							key: series[rnd+1][i].home.tid
						}).then(function (t) {
							var s;

							s = t.seasons.length - 1;
							t.seasons[s].playoffRoundsWon = 1;
							t.seasons[s].hype *= 0.95;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							dao.teams.put({ot: tx, value: t});
						});
					}
				}			
	// round 7+1 2
				if ((g.gameType == 5) && (rnd == 7)) {
					for (i = 0; i < 8; i++) {
						dao.teams.get({
							ot: tx,
							key: series[rnd+1][i].away.tid
						}).then(function (t) {
							var s;

							s = t.seasons.length - 1;
							t.seasons[s].playoffRoundsWon = 2;
							t.seasons[s].hype *= 0.95;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							dao.teams.put({ot: tx, value: t});
						});
					}
				}
				if ((g.gameType == 5) && (rnd == 7)) {
					for (i = 0; i < 8; i++) {
						dao.teams.get({
							ot: tx,
							key: series[rnd+1][i].home.tid
						}).then(function (t) {
							var s;

							s = t.seasons.length - 1;
							t.seasons[s].playoffRoundsWon = 2;
							t.seasons[s].hype *= 0.95;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							dao.teams.put({ot: tx, value: t});
						});
					}
				}			
	// round 8+1 3
				if ((g.gameType == 5) && (rnd == 8)) {
					for (i = 0; i < 4; i++) {
						dao.teams.get({
							ot: tx,
							key: series[rnd+1][i].away.tid
						}).then(function (t) {
							var s;

							s = t.seasons.length - 1;
							t.seasons[s].playoffRoundsWon = 3;
							t.seasons[s].hype *= 0.95;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							dao.teams.put({ot: tx, value: t});
						});
					}
				}			
				if ((g.gameType == 5) && (rnd == 8)) {
					for (i = 0; i < 4; i++) {
						dao.teams.get({
							ot: tx,
							key: series[rnd+1][i].home.tid
						}).then(function (t) {
							var s;

							s = t.seasons.length - 1;
							t.seasons[s].playoffRoundsWon = 3;
							t.seasons[s].hype *= 0.95;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							dao.teams.put({ot: tx, value: t});
						});
					}
				}				
			}).then(function () {
				// Next time, the schedule for the first day of the next round will be set
				console.log("got here next day");
				return newSchedulePlayoffsDay(tx);
			});
		});			
    }

    /**
     * Get the number of days left in the regular season schedule.
     *
     * @memberOf core.season
     * @return {Promise} The number of days left in the schedule.
     */
    function getDaysLeftSchedule() {
        return getSchedule().then(function (schedule) {
            var i, numDays, tids;

            numDays = 0;

            while (schedule.length > 0) {
                // Only take the games up until right before a team plays for the second time that day
                tids = [];
                for (i = 0; i < schedule.length; i++) {
                    if (tids.indexOf(schedule[i].homeTid) < 0 && tids.indexOf(schedule[i].awayTid) < 0) {
                        tids.push(schedule[i].homeTid);
                        tids.push(schedule[i].awayTid);
                    } else {
                        break;
                    }
                }
                numDays += 1;
                schedule = schedule.slice(i);
            }

            return numDays;
        });
    }

    return {

        awards: awards,
        updateOwnerMood: updateOwnerMood,
        getSchedule: getSchedule,
        setSchedule: setSchedule,		
        newSchedule: newSchedule,
        newSchedulePlayoffsDay: newSchedulePlayoffsDay,
        getDaysLeftSchedule: getDaysLeftSchedule			
		
		
    };
});