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
			ot: tx,						
            seasonAttrs: ["won", "playoffRoundsWon", "playoff64RoundsWon", "profit"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            var deltas, ownerMood;
			var combinedRounds;
			
			combinedRounds = t.playoffRoundsWon+t.playoff64RoundsWon;
			

			deltas = {};
			deltas.wins = 0.25 * (t.won - 17) / 17;

			if (t.playoff64RoundsWon < 0) {
				deltas.playoffs = -.2;
			} else if (t.playoff64RoundsWon < 5+g.gameType) {
	//            } else if (t.playoffRoundsWon < 4) {
				deltas.playoffs = 0.02 * t.playoff64RoundsWon;
			} else {
				deltas.playoffs = 0.2;
			}
			
			if (t.playoffRoundsWon < 1) {
				deltas.money = -0.2;
			} else if (t.playoffRoundsWon < 4) {
				deltas.money = 0.03 * (t.playoffRoundsWon-1);
			} else {
				deltas.money = 0.2;
			}				
				
			
			

						
//            deltas.money = (t.profit - 15) / 100;
         //   deltas.money = 0;

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

      //  tx = dao.tx(["players", "playerStats", "releasedPlayers", "teams"]);

        // Get teams for won/loss record for awards, as well as finding the teams with the best records
        return team.filter({
            attrs: ["tid", "abbrev", "region", "name", "cid"],
            seasonAttrs: ["won", "lost", "winpConf", "playoffRoundsWon", "playoff64RoundsWon"],
//            seasonAttrs: ["won", "lost", "winp", "playoffRoundsWon"],
            season: g.season,
            sortBy: "winpConf",
            ot: tx
        }).then(function (teams) {
            var found0, found1,found2, found3, found4, i, t;

            for (i = 0; i < teams.length; i++) {
                if (!found0 && teams[i].cid === 0) {
                    t = teams[i];
                    awards.bre = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    found0 = true;
                } else if (!found1 && teams[i].cid === 1) {
                    t = teams[i];
                    awards.brw = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    found1 = true;
                } else if (!found2 && teams[i].cid === 2) {
                    t = teams[i];
                    awards.br2 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    found2 = true;
                } else if (!found3 && teams[i].cid === 3) {
                    t = teams[i];
                    awards.br3 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    found3 = true;
                } else if (!found4  && teams[i].cid === 4) {
                    t = teams[i];
                    awards.br4 = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    found4 = true;
                }

                if (found0 && found1 && found2 && found3 && found4) {
                    break;
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
                stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa"],
                season: g.season
            });

            // Add team games won to players
            for (i = 0; i < players.length; i++) {
                // Special handling for players who were cut mid-season
                if (players[i].tid >= 0) {
                    players[i].won = teams[players[i].tid].won;
                } else {
                    players[i].won = 6;
                }
            }

            // Rookie of the Year
            players.sort(function (a, b) {  return b.stats.ewa - a.stats.ewa; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
            for (i = 0; i < players.length; i++) {
                // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
                if (players[i].draft.year === g.season - 1) {
                    break;
                }
            }
            p = players[i];
            if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
                awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Freshman of the Year"});
            }

            // Most Valuable Player
            players.sort(function (a, b) {  return (b.stats.ewa + 0.3 * b.won) - (a.stats.ewa + 0.3 * a.won); });
            p = players[0];
		//	console.log("p.stats.pts: "+p.stats.pts )
		//	console.log("players[100].stats.pts: "+players[100].stats.pts )
		//	console.log("players[200].stats.pts: "+players[200].stats.pts )
            awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Player of the Year"});
            // Notification unless it's the user's player, in which case it'll be shown below
        /*    if (p.tid !== g.userTid) {
                eventLog.add(null, {
                    type: "award",
                    text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", p.abbrev]) + '">' + p.abbrev + '</a>) won the Player of the Year award.'
                });
            }*/

            // Sixth Man of the Year - same sort as MVP
         /*   for (i = 0; i < players.length; i++) {
                // Must have come off the bench in most games
                if (players[i].stats.gs === 0 || players[i].stats.gp / players[i].stats.gs > 2) {
                    break;
                }
            }
            p = players[i];
            awards.smoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Sixth Man of the Year"});
*/
            // All League Team - same sort as MVP
            awards.allLeague = [{title: "First Team", players: []}];
            type = "First Team All-American";
            for (i = 0; i < 15; i++) {
                p = players[i];
                if (i === 5) {
                    awards.allLeague.push({title: "Second Team", players: []});
                    type = "Second Team All-American";
                } else if (i === 10) {
                    awards.allLeague.push({title: "Third Team", players: []});
                    type = "Third Team All-American";
                }
                _.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
            }

            // Defensive Player of the Year
            players.sort(function (a, b) {  return b.stats.gp * (b.stats.trb + 5 * b.stats.blk + 5 * b.stats.stl) - a.stats.gp * (a.stats.trb + 5 * a.stats.blk + 5 * a.stats.stl); });
            p = players[0];
            awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Defensive Player of the Year"});

            // All Defensive Team - same sort as DPOY
            awards.allDefensive = [{title: "First Team", players: []}];
            type = "First Team All-Defensive";
            for (i = 0; i < 15; i++) {
                p = players[i];
                if (i === 5) {
                    awards.allDefensive.push({title: "Second Team", players: []});
                    type = "Second Team All-Defensive";
                } else if (i === 10) {
                    awards.allDefensive.push({title: "Third Team", players: []});
                    type = "Third Team All-Defensive";
                }
                _.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
            }

            // Finals MVP - most WS in playoffs
            for (i = 0; i < teams.length; i++) {
                if (teams[i].playoffRoundsWon === 4) {
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
                stats: ["pts", "trb", "ast", "ewa"],
                season: g.season,
                playoffs: true,
                tid: champTid
            });
            players.sort(function (a, b) {  return b.statsPlayoffs.ewa - a.statsPlayoffs.ewa; });
            p = players[0];
            //awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.statsPlayoffs.pts, trb: p.statsPlayoffs.trb, ast: p.statsPlayoffs.ast};
            //awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Conference Playoff MVP"});

            /*tx = dao.tx("awards", "readwrite");
            dao.awards.put({ot: tx, value: awards});
            return tx.complete().then(function () {*/
			return dao.awards.put({ot: tx, value: awards}).then(function () {				
                return saveAwardsByPlayer(awardsByPlayer);
            }).then(function () {
                var i, p, text, tx;

                // None of this stuff needs to block, it's just notifications of crap

                // Notifications for awards for user's players
               // tx = dao.tx("events", "readwrite");
                for (i = 0; i < awardsByPlayer.length; i++) {
                    p = awardsByPlayer[i];

                    text = '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamAbbrevsCache[p.tid] + '</a>) ';
                    if (p.type.indexOf("Team") >= 0) {
                        text += 'made ' + p.type + '.';
                    } else {
                        text += 'won the ' + p.type + ' award.';
                    }
                    eventLog.add(null, {
                        type: "award",
                        text: text,
                        showNotification: p.tid === g.userTid || p.type === "Player of the Year",
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

        newSchedule = [];
        for (i = 0; i < tids.length; i++) {
            newSchedule.push({
                homeTid: tids[i][0],
                awayTid: tids[i][1]
            });
        }

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
    function newSchedule80Default(teams) {
  //  function newScheduleDefault() {
        var cid, dids, game, games, good, i, ii, iters, j, jj, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tryNum;
		var tryNum2
   //     teams = helpers.getTeamsDefault(); // Only tid, cid, and did are used, so this is okay for now. But if someone customizes cid and did, this will break. To fix that, make this function require DB access (and then fix the tests). Or even better, just accept "teams" as a param to this function, then the tests can use default values and the real one can use values from the DB.
        tids = [];  // tid_home, tid_away

		
		
        var numGames, numRemaining, numWithRemaining;
		var count;
//        numGames = 82;
        numGames = 12;

        // Number of games left to reschedule for each team
        numRemaining = [];
        for (i = 0; i < g.numTeams; i++) {
            numRemaining[i] = numGames;
		//	console.log(teams[i].tid+" "+teams[i].cid+" "+teams[i].did)
        }
        numWithRemaining = g.numTeams; // Number of teams with numRemaining > 0

        tids = [];
        while (tids.length < numGames * g.numTeams) {
            i = -1; // Home tid
            j = -1; // Away tid
            i = random.randInt(0, g.numTeams - 1);
            j = random.randInt(0, g.numTeams - 1);
			count = 0;
			//    console.log("countb: "+count);
            while ( (i === j || numRemaining[i] <= 0 || numRemaining[j] <= 0 || teams[i].cid === teams[j].cid) && (count < 1000) ) {
		//	    console.log("countd: "+count);
		        if (numRemaining[i] > 0) {
					j = random.randInt(0, g.numTeams - 1);
				} else if (numRemaining[j] > 0) {
					i = random.randInt(0, g.numTeams - 1);
				} else {
					i = random.randInt(0, g.numTeams - 1);
					j = random.randInt(0, g.numTeams - 1);
				}			
                //i = random.randInt(0, g.numTeams - 1);
                //j = random.randInt(0, g.numTeams - 1);
				count += 1;
            }
		//	    console.log("counta: "+count);

			if (count>999) {
			  ii = 0;
			  if (numRemaining[i] <= 0) {
				for (ii = 0; ii < g.numTeams; ii++) {
				    if ((numRemaining[ii] > 0) && (ii!=j) && (teams[ii].cid != teams[j].cid)) {
						i = ii;
						ii = g.numTeams;
					}
				}			  
			  }
			  if (numRemaining[j] <= 0) {
				for (jj = 0; jj < g.numTeams; jj++) {				 
				    if ((numRemaining[ii] > 0) && (i!=jj) && (teams[i].cid != teams[jj].cid)) {
						j = jj;
						jj = g.numTeams;
					}
				}			  
			  }
			}
			
            tids.push([i, j]);


            numRemaining[i] -= 1;
            numRemaining[j] -= 1;
		//	console.log("total games left: "+numGames * g.numTeams +" tids.length: "+tids.length + " remaining: "+numWithRemaining+" i: "+i+" "+numRemaining[i]+" j: "+j+" "+numRemaining[j])
            // Make sure we're not left with just one team to play itself
            if (numRemaining[i] === 0) {
                numWithRemaining -= 1;
            }
            if (numRemaining[j] === 0) {
                numWithRemaining -= 1;
            }
            if (numWithRemaining <= 1) {
                // If this happens, we didn't find 82 for each team and one team will play a few less games
                break;
            }
        }		
		
			console.log("total games left: "+numGames * g.numTeams +" tids.length: "+tids.length + " remaining: "+numWithRemaining+" i: "+i+" "+numRemaining[i]+" j: "+j+" "+numRemaining[j])
		
		
		
        // Collect info needed for scheduling
        for (i = 0; i < teams.length; i++) {
            teams[i].homeGames = 0;
            teams[i].awayGames = 0;
        }
        for (i = 0; i < teams.length; i++) {
            for (j = 0; j < teams.length; j++) {
                if (teams[i].tid !== teams[j].tid) {
                    game = [teams[i].tid, teams[j].tid];

                    // Constraint: 1 home game vs. each team in other conference
                    /*if (teams[i].cid !== teams[j].cid) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }*/

                    // Constraint: 2 home schedule vs. each team in same division
                    if (teams[i].did === teams[j].did) {
					   if ((i == 20) || (j == 20)) {
				//	     console.log(i+" "+j+" "+teams[i].did+" "+teams[j].did)
					   }
                        tids.push(game);
                      //  tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }

                    // Constraint: 1-2 home schedule vs. each team in same conference and different division
                    // Only do 1 now
                 /*   if (teams[i].cid === teams[j].cid && teams[i].did !== teams[j].did) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }*/
                }
            }
        }

        // Constraint: 1-2 home schedule vs. each team in same conference and different division
        // Constraint: We need 8 more of these games per home team!
		// actually need 6
		// actual want 8 total, 4 home
        tidsByConf = [[], [],[], [], []];
        dids = [[], [],[], [], []];
        for (i = 0; i < teams.length; i++) {
            tidsByConf[teams[i].cid].push(i);
            dids[teams[i].cid].push(teams[i].did);
        }

        for (cid = 0; cid < 5; cid++) {
            matchups = [];
//            matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
            matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,15,16]);
            games = 0;
//            while (games < 8) {
            while (games < 2) {
                newMatchup = [];
                n = 0;
                while (n <= 15) {  // 14 = num teams in conference - 1
                    iters = 0;
                    while (true) {
                        tryNum = random.randInt(0, 15);
                      //  tryNum2 = random.randInt(0, 4);
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
                        if (iters > 5000) {
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
        }

        return tids;
    }

	
    /**
     * Creates a new regular season schedule for 30 teams.
     *
     * This makes an NBA-like schedule in terms of conference matchups, division matchups, and home/away games.
     *
     * @memberOf core.season
     * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
     */
    function newSchedule320Default(teams) {
        var cid, dids, game, games, good, i, ii, iters, j, jj, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tryNum;
		var tryNum2
      //  teams = helpers.getTeamsDefault(); // Only tid, cid, and did are used, so this is okay for now. But if someone customizes cid and did, this will break. To fix that, make this function require DB access (and then fix the tests). Or even better, just accept "teams" as a param to this function, then the tests can use default values and the real one can use values from the DB.

        tids = [];  // tid_home, tid_away

		
		
        var numGames, numRemaining, numWithRemaining;
		var count;
//        numGames = 82;
        numGames = 12;

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
            i = random.randInt(0, g.numTeams - 1);
            j = random.randInt(0, g.numTeams - 1);
			count = 0;
			//    console.log("countb: "+count);
            while ( (i === j || numRemaining[i] <= 0 || numRemaining[j] <= 0 || teams[i].cid === teams[j].cid) && (count < 3000) ) {
		//	    console.log("countd: "+count);
		        if (numRemaining[i] > 0) {
					j = random.randInt(0, g.numTeams - 1);
				} else if (numRemaining[j] > 0) {
					i = random.randInt(0, g.numTeams - 1);
				} else {
					i = random.randInt(0, g.numTeams - 1);
					j = random.randInt(0, g.numTeams - 1);
				}			
                //i = random.randInt(0, g.numTeams - 1);
                //j = random.randInt(0, g.numTeams - 1);
				count += 1;
            }
		//	    console.log("counta: "+count);

			if (count>2999) {
			  ii = 0;
			  if (numRemaining[i] <= 0) {
				for (ii = 0; ii < g.numTeams; ii++) {
				    if ((numRemaining[ii] > 0) && (ii!=j) && (teams[ii].cid != teams[j].cid)) {
						i = ii;
						ii = g.numTeams;
					}
				}			  
			  }
			  if (numRemaining[j] <= 0) {
				for (jj = 0; jj < g.numTeams; jj++) {				 
				    if ((numRemaining[ii] > 0) && (i!=jj) && (teams[i].cid != teams[jj].cid)) {
						j = jj;
						jj = g.numTeams;
					}
				}			  
			  }
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
            if (numWithRemaining <= 1) {
                // If this happens, we didn't find 82 for each team and one team will play a few less games
                break;
            }
        }		
		
		
		
		
        // Collect info needed for scheduling
        for (i = 0; i < teams.length; i++) {
            teams[i].homeGames = 0;
            teams[i].awayGames = 0;
        }
        for (i = 0; i < teams.length; i++) {
            for (j = 0; j < teams.length; j++) {
                if (teams[i].tid !== teams[j].tid) {
                    game = [teams[i].tid, teams[j].tid];

                    // Constraint: 1 home game vs. each team in other conference
                    /*if (teams[i].cid !== teams[j].cid) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }*/

                    // Constraint: 2 home schedule vs. each team in same division
                    if (teams[i].did === teams[j].did) {
                        tids.push(game);
                      //  tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }

                    // Constraint: 1-2 home schedule vs. each team in same conference and different division
                    // Only do 1 now
                 /*   if (teams[i].cid === teams[j].cid && teams[i].did !== teams[j].did) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }*/
                }
            }
        }

        // Constraint: 1-2 home schedule vs. each team in same conference and different division
        // Constraint: We need 8 more of these games per home team!
		// actually need 6
		// actual want 8 total, 4 home
        tidsByConf = [[], [],[], [], [],[], [],[], [], [],[], [],[], [], [],[], [],[], [], []];
        dids = [[], [],[], [], [],[], [],[], [], [],[], [],[], [], [],[], [],[], [], []];
        for (i = 0; i < teams.length; i++) {
            tidsByConf[teams[i].cid].push(i);
            dids[teams[i].cid].push(teams[i].did);
        }

        for (cid = 0; cid < 20; cid++) {
            matchups = [];
//            matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
            matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,15,16]);
            games = 0;
//            while (games < 8) {
            while (games < 2) {
                newMatchup = [];
                n = 0;
                while (n <= 15) {  // 14 = num teams in conference - 1
                    iters = 0;
                    while (true) {
                        tryNum = random.randInt(0, 15);
                      //  tryNum2 = random.randInt(0, 4);
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
                        if (iters > 5000) {
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
        }

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
    function newScheduleCrappy() {
        var i, j, numGames, numRemaining, numWithRemaining, tids;
		var count, ii,jj;
//        numGames = 82;
        numGames = 30;

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
			count = 0;
            while ( (i === j || numRemaining[i] === 0 || numRemaining[j] === 0 ) && count < 3000) {
			   // console.log("count: "+count);
                i = random.randInt(0, g.numTeams - 1);
                j = random.randInt(0, g.numTeams - 1);
				count += 1;
            }

			if (count>2999) {
			  ii = 0;
			  if (numRemaining[i] === 0) {
				for (ii = 0; ii < g.numTeams; ii++) {
				    if ((numRemaining[ii] > 0) && (ii!=j)) {
						i = ii;
						ii = g.numTeams;
					}
				}			  
			  }
			  if (numRemaining[j] === 0) {
				for (jj = 0; jj < g.numTeams; jj++) {
				    if ((numRemaining[ii] > 0) && (i!=jj)) {
						j = jj;
						jj = g.numTeams;
					}
				}			  
			  }
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
        }

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
    function newScheduleNonCon() {
        var i, j, numGames, numRemaining, numWithRemaining, tids;
		var count, ii,jj;
//        numGames = 82;
        numGames = 12;

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
			count = 0;
            while (  (i === j || numRemaining[i] === 0 || numRemaining[j] === 0) && (count <3000) ) {
			   // console.log("count: "+count);
                i = random.randInt(0, g.numTeams - 1);
                j = random.randInt(0, g.numTeams - 1);
				count += 1;
            }

			if (count>2999) {
			  ii = 0;
			  if (numRemaining[i] === 0) {
				for (ii = 0; ii < g.numTeams; ii++) {
				    if ((numRemaining[ii] > 0) && (ii!=j)) {
						i = ii;
						ii = g.numTeams;
					}
				}			  
			  }
			  if (numRemaining[j] === 0) {
				for (jj = 0; jj < g.numTeams; ii++) {
				    if ((numRemaining[ii] > 0) && (i!=jj)) {
						j = jj;
						jj = g.numTeams;
					}
				}			  
			  }
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
        }

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
		var days2, tids2,tidsInDays2,tids3;
		//// two parts to schedule
		// a) non conference, crappy random
		// b) conference, default

//        if (g.numTeams === 74) {
    //    if (g.numTeams === 80) {
//        if (g.numTeams === 30) {
    /*       tids = newScheduleNonCon();
 //           tids = newScheduleCrappyPlus();
  //      } else {
  //          tids = newScheduleCrappy();
   //     }

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

        console.log("days0: "+days);
        console.log("tidsInDays0: "+tidsInDays);
        console.log("tids0: "+tids);
		days2 = days;
		tidsInDays2 = tidsInDays;
		tids2 = tids;	*/	
		
		
		
		
//        if (g.numTeams === 74) {
//        if (g.numTeams === 80) {
        if (g.numTeams === 80) {
//        if (g.numTeams === 30) {
           tids = newSchedule80Default(teams);
		} else if (g.numTeams === 320) {
//        if (g.numTeams === 30) {
           tids = newSchedule320Default(teams);
 //           tids = newScheduleCrappyPlus();
        } else {
            tids = newScheduleCrappy();
        }

        // Order the schedule so that it takes fewer days to play
    //    random.shuffle(tids);
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
     //   random.shuffle(days); // Otherwise the most dense days will be at the beginning and the least dense days will be at the end
        tids = _.flatten(days, true);
     /*   console.log("days: "+days);
        console.log("tidsInDays: "+tidsInDays);
        console.log("tids1: "+tids);
		//tids3 = tids2+","+tids
        console.log("tids3: "+tids3);
        return tids3;*/
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
        tx = dao.tx(["playoffSeries", "schedule", "teams"], "readwrite", tx);
		var playoffSeries, rnd, series, tids;         
		//console.log("newSchedulePlayoffsDay ");
        // This is a little tricky. We're returning this promise, but within the "then"s we're returning tx.complete() for the same transaction. Probably should be refactored.
        return dao.playoffSeries.get({
            ot: tx,
            key: g.season
        }).then(function (playoffSeriesLocal) {
            var i, numGames;


            playoffSeries = playoffSeriesLocal;
            series = playoffSeries.series;
            rnd = playoffSeries.currentRound;
            tids = [];

            // Try to schedule games if there are active series
            for (i = 0; i < series[rnd].length; i++) {
		//console.log("i: "+i);
			
                if (series[rnd][i].home.won < 1 && series[rnd][i].away.won < 1) {
                    // Make sure to set home/away teams correctly! Home for the lower seed is 1st, 2nd, 5th, and 7th games.
                    numGames = series[rnd][i].home.won + series[rnd][i].away.won;
                    if (numGames === 0) {
                        tids.push([series[rnd][i].home.tid, series[rnd][i].away.tid]);
                    } else {
                        tids.push([series[rnd][i].away.tid, series[rnd][i].home.tid]);
                    }
                }
            }
        }).then(function () {
            var i, key, matchup, team1, team2, tidsWon;

            // Now playoffSeries, rnd, series, and tids are set

            // If series are still in progress, write games and short circuit
            // If series are still in progress, write games and short circuit
            if (tids.length > 0) {
                return setSchedule(tx, tids).then(function () {
                    return false;
                });
            }

            // If playoffs are over, update winner and go to next phase
//            if (rnd === 4) {
            if (rnd === 3) {
			

				for (i = 0; i < series[rnd].length; i += 1) {
			
					/*if (series[rnd][0].home.won === 1) {
						key = series[rnd][0].home.tid;
					} else if (series[rnd][0].away.won === 1) {
						key = series[rnd][0].away.tid;
					}*/
					if (series[rnd][i].home.won === 1) {
						key = series[rnd][i].home.tid;
					} else if (series[rnd][i].away.won === 1) {
						key = series[rnd][i].away.tid;
					}
					dao.teams.iterate({
						ot: tx,
						key: key,
						callback: function (t) {
							var s;

							s = t.seasons.length - 1;

							t.seasons[s].playoffRoundsWon = 4;
							t.seasons[s].confChamp = 1;
	//                        t.seasons[s].playoffRoundsWon = 1;
							t.seasons[s].hype *= 0.99;
							t.seasons[s].hype += 0.01;	
							//t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							return t;
						}
					});
				
				}
				
                //return tx.complete().then(function () {
//                return tion () {				
//                    return newPhase(g.PHASE.PLAYOFFS64);
                    //return newPhase(g.PHASE.BEFORE_PLAYOFFS64);
                    // Playoffs are over! Return true!
                    return true;					
   //                 return newPhase(g.PHASE.BEFORE_DRAFT);
  //              });
            }

            // Playoffs are not over! Make another round

            // Set matchups for next round
            tidsWon = [];
            for (i = 0; i < series[rnd].length; i += 2) {
                // Find the two winning teams
                if (series[rnd][i].home.won === 1) {
                    team1 = helpers.deepCopy(series[rnd][i].home);
                    tidsWon.push(series[rnd][i].home.tid);
                } else {
                    team1 = helpers.deepCopy(series[rnd][i].away);
                    tidsWon.push(series[rnd][i].away.tid);
                }
                if (series[rnd][i + 1].home.won === 1) {
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
				matchup.home.pts2 = "";
				matchup.away.pts2 = "";						
                series[rnd + 1][i / 2] = matchup;
            }

            playoffSeries.currentRound += 1;
            dao.playoffSeries.put({ot: tx, value: playoffSeries});

            // Update hype for winning a series
            return dao.playoffSeries.put({ot: tx, value: playoffSeries}).then(function () {
                // Update hype for winning a series
                return Promise.map(tidsWon, function (tid) {
                    return dao.teams.get({
                        ot: tx,
                        key: tid
                    }).then(function (t) {
						var s;

						s = t.seasons.length - 1;
						t.seasons[s].playoffRoundsWon = playoffSeries.currentRound;
	//                    t.seasons[s].hype += 0.05;
						t.seasons[s].hype *= 0.99;
						t.seasons[s].hype += 0.01;					
						if (t.seasons[s].hype > 1) {
							t.seasons[s].hype = 1;
						}

                        return dao.teams.put({ot: tx, value: t});
                    });
                });
            }).then(function () {
                // Next time, the schedule for the first day of the next round will be set
                return newSchedulePlayoffsDay(tx);
            });
        });
    }
	
    /*Creates a single day's schedule for an in-progress playoffs.*/
    function newSchedulePlayoffsDay64(tx) {
		var playoffSeries64, rnd, series, tids;		
		

        tx = dao.tx(["playoffSeries64", "schedule", "teams"], "readwrite", tx);

		
		console.log("schedule playoff64 day");
        // This is a little tricky. We're returning this promise, but within the "then"s we're returning tx.complete() for the same transaction. Probably should be refactored.
        return dao.playoffSeries64.get({
            ot: tx,
            key: g.season
        }).then(function (playoffSeries64Local) {
            var i, numGames;


            playoffSeries64 = playoffSeries64Local;
            series = playoffSeries64.series;
            rnd = playoffSeries64.currentRound;
            tids = [];

		
	//	    console.log("rnd: "+rnd);
	//	    console.log("series[rnd].length: "+series[rnd].length);
            // Try to schedule games if there are active series
            for (i = 0; i < series[rnd].length; i++) {
                if (series[rnd][i].home.won < 1 && series[rnd][i].away.won < 1) {
                    // Make sure to set home/away teams correctly! Home for the lower seed is 1st, 2nd, 5th, and 7th games.
                    numGames = series[rnd][i].home.won + series[rnd][i].away.won;
                    if (numGames === 0) {
                        tids.push([series[rnd][i].home.tid, series[rnd][i].away.tid]);
                    } else {
                        tids.push([series[rnd][i].away.tid, series[rnd][i].home.tid]);
                    }
                }
            }
        }).then(function () {
            var i, key, matchup, team1, team2, tidsWon;

            // Now playoffSeries, rnd, series, and tids are set

            // If series are still in progress, write games and short circuit
             if (tids.length > 0) {
                return setSchedule(tx, tids).then(function () {
                    return false;
                });
            }

	//	    console.log("rnd: "+rnd);
            // If playoffs are over, update winner and go to next phase
            if (rnd === 4+g.gameType) {
                if (series[rnd][0].home.won === 1) {
                    key = series[rnd][0].home.tid;
                } else if (series[rnd][0].away.won === 1) {
                    key = series[rnd][0].away.tid;
                }
                return dao.teams.iterate({
                    ot: tx,
                    key: key,
                    callback: function (t) {
                        var s;

                        s = t.seasons.length - 1;

                        t.seasons[s].playoff64RoundsWon = 5+g.gameType;
                        t.seasons[s].hype *= 0.7;
                        t.seasons[s].hype += 0.30;						
//                        t.seasons[s].hype += 0.05;
                        if (t.seasons[s].hype > 1) {
                            t.seasons[s].hype = 1;
                        }

                        return t;
                    }
				}).then(function () {
                    return true;
                    //return newPhase(g.PHASE.BEFORE_DRAFT);
                });
            }

            // Playoffs are not over! Make another round

            // Set matchups for next round
            tidsWon = [];
		//	console.log("rnd: "+rnd);
            for (i = 0; i < series[rnd].length; i += 2) {
		//	   console.log("i: "+i);
                // Find the two winning teams
                if (series[rnd][i].home.won === 1) {
                    team1 = helpers.deepCopy(series[rnd][i].home);
                    tidsWon.push(series[rnd][i].home.tid);
                } else {
                    team1 = helpers.deepCopy(series[rnd][i].away);
                    tidsWon.push(series[rnd][i].away.tid);
                }
                if (series[rnd][i + 1].home.won === 1) {
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
				matchup.home.pts2 = "";
				matchup.away.pts2 = "";				
                series[rnd + 1][i / 2] = matchup;
            }

            playoffSeries64.currentRound += 1;
            return dao.playoffSeries64.put({ot: tx, value: playoffSeries64}).then(function () {
                // Update hype for winning a series
                return Promise.map(tidsWon, function (tid) {
                    return dao.teams.get({
                        ot: tx,
                        key: tid
                    }).then(function (t) {
                    var s;

                    s = t.seasons.length - 1;
                    t.seasons[s].playoff64RoundsWon = playoffSeries64.currentRound;
//                    t.seasons[s].hype += 0.05;
                    t.seasons[s].hype *= 0.90;
                    t.seasons[s].hype += 0.10;					
                    if (t.seasons[s].hype > 1) {
                        t.seasons[s].hype = 1;
                    }
                     return dao.teams.put({ot: tx, value: t});
                    });
                });
            }).then(function () {
                // Next time, the schedule for the first day of the next round will be set
                return newSchedulePlayoffsDay64(tx);
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
		var tx;
	//	console.log("getDaysLeftSchedule");
		tx = dao.tx(["players", "teams"], "readwrite");
	//	}).then(function () {
			// sort players after free agency, since no free agency in season
		 return dao.teams.iterate({
				ot: tx,
				callback: function (t) {
					 //if (g.daysLeft >= 30) {
						 if (g.userTids.indexOf(t.tid) < 0 || g.autoPlaySeasons > 0) {
							 //console.log(t.tid);
							return team.rosterAutoSort(tx, t.tid);
						}							 
					 //}

					return;
				}
			//});					
		}).then(function () {
			
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
		});				
    }

    return {
		
        awards: awards,
        updateOwnerMood: updateOwnerMood,
        getSchedule: getSchedule,
        setSchedule: setSchedule,		
        newSchedule: newSchedule,
        newSchedulePlayoffsDay: newSchedulePlayoffsDay,
        newSchedulePlayoffsDay64: newSchedulePlayoffsDay64,
        getDaysLeftSchedule: getDaysLeftSchedule		
    };
});