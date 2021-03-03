/**
 * @name core.season
 * @namespace Somewhat of a hodgepodge. Basically, this is for anything related to a single season that doesn't deserve to be broken out into its own file. Currently, this includes things that happen when moving between phases of the season (i.e. regular season to playoffs) and scheduling. As I write this, I realize that it might make more sense to break up those two classes of functions into two separate modules, but oh well.
 */
define(["dao","db", "globals", "ui", "core/contractNegotiation", "core/draft", "core/finances", "core/freeAgents", "core/player", "core/team" ,"lib/bluebird", "lib/jquery", "lib/underscore", "util/account", "util/eventLog", "util/helpers", "util/message", "util/random"], function (dao,db, g, ui, contractNegotiation, draft, finances, freeAgents, player, team, Promise, $, _, account, eventLog, helpers, message, random) {    

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
            seasonAttrs: ["won", "playoffRoundsWon", "profit"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            var deltas, ownerMood;

            deltas = {};
            deltas.wins = 0.25 * (t.won - 41) / 41;
            if (t.playoffRoundsWon < 0) {
                deltas.playoffs = -0.2;
            } else if (t.playoffRoundsWon < 4) {
                deltas.playoffs = 0.04 * t.playoffRoundsWon;
            } else {
                deltas.playoffs = 0.2;
            }
            deltas.money = (t.profit - 15) / 100;

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
            seasonAttrs: ["won", "lost", "winp", "playoffRoundsWon"],
            season: g.season,
            sortBy: "winp",
            ot: tx
		}).then(function (teams) {
            var i, foundEast, foundWest, t;


            for (i = 0; i < teams.length; i++) {
                if (!foundEast && teams[i].cid === 0) {
                    t = teams[i];
                    awards.bre = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    foundEast = true;
                } else if (!foundWest && teams[i].cid === 1) {
                    t = teams[i];
                    awards.brw = {tid: t.tid, abbrev: t.abbrev, region: t.region, name: t.name, won: t.won, lost: t.lost};
                    foundWest = true;
                }

                if (foundEast && foundWest) {
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
                var champTid, i, p,   type;

                players = player.filter(players, {
                    attrs: ["pid", "name", "tid", "abbrev", "draft","pos"],
                    stats: ["gp", "gs", "min", "pts","fg", "ast","hits","blk","stl","sfg","sfgs","sfgsp"],
                    season: g.season
                });

                // Add team games won to players
                for (i = 0; i < players.length; i++) {
                    // Special handling for players who were cut mid-season
                    if (players[i].tid >= 0) {
                        players[i].won = teams[players[i].tid].won;
                    } else {
                        players[i].won = 20;
                    }
                }

                // Rookie of the Year
                players.sort(function (a, b) {  return b.stats.pts - a.stats.pts; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
                for (i = 0; i < players.length; i++) {
                    // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
                    if (players[i].draft.year === g.season - 1) {
                        break;
                    }
                }
                p = players[i];
                if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
                    awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, fg: p.stats.fg, ast: p.stats.ast};
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Rookie of the Year"});
                }

                // Most Valuable Player
                players.sort(function (a, b) {  return   (b.stats.sfgsp*b.stats.gp - a.stats.sfgsp*a.stats.gp)/75 +(b.stats.pts + 0.1 * b.won) - (a.stats.pts + 0.1 * a.won); });
				let mvp = 0;
                for (i = 0; i < players.length; i++) {
					if (players[i].stats.pts > 80 ||  players[i].stats.sfgsp > 90 ) {
						mvp = i;
						break;
					}
				}					
			//	console.log(players[0].stats);
			//	console.log(players[1].stats);		
			//	console.log(players[2].stats);		
			//	console.log(players[3].stats);		
			//	console.log(players[4].stats);		
			//	console.log(players);		
//                p = players[0];	
			//	console.log(mvp);
                p = players[mvp];				
                awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, fg: p.stats.fg, ast: p.stats.ast, sfgsp: p.stats.sfgsp};
			//	console.log(awards.mvp);
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Most Valuable Player"});
                // Notification unless it's the user's player, in which case it'll be shown below
             /*   if (p.tid !== g.userTid) {
                    eventLog.add(null, {
                        type: "award",
                        text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", p.abbrev]) + '">' + p.abbrev + '</a>) won the Most Valuable Player award.'
                    });
                }*/

                players.sort(function (a, b) {  return  (b.stats.pts + 0.1 * b.won) - (a.stats.pts + 0.1 * a.won); });

                for (i = 0; i < players.length; i++) {
				//	console.log(players[i]);
					players[i].stats.ranking = 100-i;
				//		console.log(players[i].stats.ranking);						
				}
			//	console.log(players);
                players.sort(function (a, b) {  return b.stats.sfgsp - a.stats.sfgsp; });
				let countGoalies = 0;
                for (i = 0; i < 15; i++) {
                    if (players[i].stats.gs >41 && players[i].pos == "G" && countGoalies < 3) {					
				//	console.log(players[i]);					
					//	console.log(i);				
						players[i].stats.ranking = 100-countGoalies*5-3;
						//console.log(players[i].stats.ranking);										
						countGoalies += 1;	
					} else {
						players[i].stats.ranking = 0;						
					}
				}
				//console.log(players);				
                players.sort(function (a, b) {  return b.stats.ranking - a.stats.ranking; });
					
				//console.log(players);
                // All League Team - same sort as MVP
                awards.allLeague = [{title: "First Team", players: []}];
                type = "First Team All-League";
                for (i = 0; i < 15; i++) {
					//console.log(players[i]);					
						console.log(players[i].stats.ranking);							
                    p = players[i];
                    if (i === 5) {
                        awards.allLeague.push({title: "Second Team", players: []});
                        type = "Second Team All-League";
                    } else if (i === 10) {
                        awards.allLeague.push({title: "Third Team", players: []});
                        type = "Third Team All-League";
                    }
                    _.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, fg: p.stats.fg, ast: p.stats.ast});
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
                }

				
                // Goalie of the Year 
                players.sort(function (a, b) {  return b.stats.sfgsp - a.stats.sfgsp; });
                for (i = 0; i < players.length; i++) {
                    // Must have come off the bench in most games
//                    if ((players[i].stats.gs >60) || (i>10 && players[i].pos == "G")) {
                    if (players[i].stats.gs >41 && players[i].pos == "G") {
                        break;
                    }
                    if (i >= players.length-1) {
						//fixes per game bug, stats not recording?
						i = 0;
                        break;
                    }					
                }
                p = players[i];
                awards.smoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, sfg: p.stats.sfg, sfgs: p.stats.sfgs, sfgsp: p.stats.sfgsp};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Goalie of the Year"});
				
                // Defensive Player of the Year
                players.sort(function (a, b) {  return (b.stats.hits +  b.stats.blk + 5 * b.stats.stl) - (a.stats.hits +  a.stats.blk + 5 * a.stats.stl); });
                p = players[0];
                awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, hits: p.stats.hits, blk: p.stats.blk, stl: p.stats.stl};
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
                    _.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, hits: p.stats.hits, blk: p.stats.blk, stl: p.stats.stl});
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
            var i, p, text;			
                    players = player.filter(players, { // Only the champions, only playoff stats
                        attrs: ["pid", "name", "tid", "abbrev"],
                        stats: ["gp", "gs", "min", "pts","fg", "ast","hits","blk","stl","sfg","sfgs","sfgsp"],
                        season: g.season,
                        playoffs: true,
                        tid: champTid
                    });
                    players.sort(function (a, b) {  return  (b.stats.sfgsp*b.stats.gp - a.stats.sfgsp*a.stats.gp)/80 + (b.statsPlayoffs.pts/b.statsPlayoffs.gp - a.statsPlayoffs.pts/a.statsPlayoffs.gp); });
					let mvpFinals = 0;
					for (i = 0; i < players.length; i++) {
						if (players[i].stats.pts > 10 ||  players[i].stats.sfgsp > 90 ) {
							mvpFinals = i;
							break;
						}
					}						
                    p = players[mvpFinals];
                    awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.statsPlayoffs.pts, fg: p.statsPlayoffs.fg, ast: p.statsPlayoffs.ast, sfgsp: p.statsPlayoffs.sfgsp};
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Playoff MVP"});

            /*tx = dao.tx("awards", "readwrite");
            dao.awards.put({ot: tx, value: awards});
            return tx.complete().then(function () {*/
			return dao.awards.put({ot: tx, value: awards}).then(function () {				
                return saveAwardsByPlayer(awardsByPlayer);
            }).then(function () {

                        // Notifications for awards for user's players
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
    function newScheduleDefault() {
        var cid, dids, game, games, good, i, ii, iters, j, jj, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tryNum;

        teams = helpers.getTeamsDefault(); // Only tid, cid, and did are used, so this is okay for now. But if someone customizes cid and did, this will break. To fix that, make this function require DB access (and then fix the tests). Or even better, just accept "teams" as a param to this function, then the tests can use default values and the real one can use values from the DB.

        tids = [];  // tid_home, tid_away

        // Collect info needed for scheduling
        for (i = 0; i < teams.length; i++) {
            teams[i].homeGames = 0;
            teams[i].awayGames = 0;
        }
        for (i = 0; i < teams.length; i++) {
            for (j = 0; j < teams.length; j++) {
                if (teams[i].tid !== teams[j].tid) {
                    game = [teams[i].tid, teams[j].tid];
					
                    // Constraint: 1 home game vs. each team in other conference // 32 and 28
                    if (teams[i].cid !== teams[j].cid) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }

                    // Constraint: 2 home schedule vs. each team in same division // 24 and 28
                    if (teams[i].did === teams[j].did ) {
                        tids.push(game);
                        tids.push(game);
                        teams[i].homeGames += 2;
                        teams[j].awayGames += 2;
                    }
					
                    // Constraint: 1-2 home schedule vs. each team in same conference and different division // 14 and 16
                    // Only do 1 now
                    if (teams[i].cid === teams[j].cid && teams[i].did !== teams[j].did ) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }
					
                }
            }
        }
		// total is 70 and 72, need 12 and 10 games more

		
        console.log("got here");
        // Constraint: 1-2 home schedule vs. each team in same conference and different division
        // Constraint: We need 8 more of these games per home team!
        tidsByConf = [[], []];
        dids = [[], []];
        for (i = 0; i < teams.length; i++) {
            tidsByConf[teams[i].cid].push(i);
            dids[teams[i].cid].push(teams[i].did);
        }

		var gamesNeeded,teamsConference;
		
        for (cid = 0; cid < 2; cid++) {
            matchups = [];			
            //matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
            games = 0;
			
			//// needs to be based on conference
			if  (cid == 0) {
              matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,15]);
  //            matchups.push([0, 1, 2, 3, 4, 5, 6, 7]);
//			  gamesNeeded = 10;
			  gamesNeeded = 5;
			  teamsConference = 15;
			} else {
			  matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
	//		  matchups.push([0, 1, 2, 3, 4, 5, 6]);
//			  gamesNeeded = 14;
//			  gamesNeeded = 7;
			  gamesNeeded = 6;
			  teamsConference = 13;
			}
			
//            while (games < 8) {
            while (games < gamesNeeded) {
                newMatchup = [];
                n = 0;
//                while (n <= 14) {  // 14 = num teams in conference - 1
                while (n <= teamsConference) {  // 14 = num teams in conference - 1
                    iters = 0;
                    while (true) {
//                        tryNum = random.randInt(0, 14);
                        tryNum = random.randInt(0, teamsConference);
                        // Pick tryNum such that it is in a different division than n and has not been picked before
//                        if (dids[cid][tryNum] !== dids[cid][n] && newMatchup.indexOf(tryNum) < 0) {
                        if (newMatchup.indexOf(tryNum) < 0) {
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
    function newScheduleKHL() {
        var cid, dids, game, games, good, i, ii, iters, j, jj, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tryNum;

        teams = helpers.getTeamsRussia(); // Only tid, cid, and did are used, so this is okay for now. But if someone customizes cid and did, this will break. To fix that, make this function require DB access (and then fix the tests). Or even better, just accept "teams" as a param to this function, then the tests can use default values and the real one can use values from the DB.

        tids = [];  // tid_home, tid_away

        // Collect info needed for scheduling
        for (i = 0; i < teams.length; i++) {
            teams[i].homeGames = 0;
            teams[i].awayGames = 0;
        }
        for (i = 0; i < teams.length; i++) {
            for (j = 0; j < teams.length; j++) {
                if (teams[i].tid !== teams[j].tid) {
                    game = [teams[i].tid, teams[j].tid];
					
                    // Constraint: 1 home game vs. each team in other conference // 32 and 28
                    if (teams[i].cid !== teams[j].cid) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }

                    // Constraint: 2 home schedule vs. each team in same division // 24 and 28
                    if (teams[i].did === teams[j].did ) {
                        tids.push(game);
                    //    tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }
					
                    // Constraint: 1-2 home schedule vs. each team in same conference and different division // 14 and 16
                    // Only do 1 now
                    if (teams[i].cid === teams[j].cid && teams[i].did !== teams[j].did ) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }
					
                }
            }
        }
		// total is 70 and 72, need 12 and 10 games more

		
        console.log("got here");
        // Constraint: 1-2 home schedule vs. each team in same conference and different division
        // Constraint: We need 8 more of these games per home team!
        tidsByConf = [[], []];
        dids = [[], []];
        for (i = 0; i < teams.length; i++) {
            tidsByConf[teams[i].cid].push(i);
            dids[teams[i].cid].push(teams[i].did);
        }

		var gamesNeeded,teamsConference;
		
        for (cid = 0; cid < 2; cid++) {
            matchups = [];			
            //matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
            games = 0;
			
			//// needs to be based on conference
			if  (cid == 0) {
              matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  //            matchups.push([0, 1, 2, 3, 4, 5, 6, 7]);
//			  gamesNeeded = 10;
			  gamesNeeded = 1;
			  teamsConference = 14;
			} else {
			  matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,14]);
	//		  matchups.push([0, 1, 2, 3, 4, 5, 6]);
//			  gamesNeeded = 14;
//			  gamesNeeded = 7;
			  gamesNeeded = 1;
			  teamsConference = 14;
			}
			
//            while (games < 8) {
            while (games < gamesNeeded) {
                newMatchup = [];
                n = 0;
//                while (n <= 14) {  // 14 = num teams in conference - 1
                while (n <= teamsConference) {  // 14 = num teams in conference - 1
                    iters = 0;
                    while (true) {
//                        tryNum = random.randInt(0, 14);
                        tryNum = random.randInt(0, teamsConference);
                        // Pick tryNum such that it is in a different division than n and has not been picked before
//                        if (dids[cid][tryNum] !== dids[cid][n] && newMatchup.indexOf(tryNum) < 0) {
                        if (newMatchup.indexOf(tryNum) < 0) {
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

        numGames = 82;

        // Number of games left to reschedule for each team
        numRemaining = [];
        for (i = 0; i < g.numTeams; i++) {
            numRemaining[i] = numGames;
        }
        numWithRemaining = g.numTeams; // Number of teams with numRemaining > 0
		console.log("crappy");
        tids = [];
        while (tids.length < numGames * g.numTeams) {
            i = -1; // Home tid
            j = -1; // Away tid
            while (i === j || numRemaining[i] === 0 || numRemaining[j] === 0) {
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
    function newSchedule() {
        var days, i, j, jMax, tids, tidsInDays, used;

        if (g.numTeams === 30) {
  //      if (g.numTeams === 10) {
			if (g.leagueType == 0) {
				tids = newScheduleDefault();
			} else {
				tids = newScheduleKHL();
			}
        } else {
            tids = newScheduleCrappy();
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
            var  i, key, numGames, playoffSeries, rnd, series,tids, tx;		
         //   var cursor, i, matchup, nextRound, numGames, playoffSeries, rnd, series, team1, team2, tids, tidsWon;		
         tx = dao.tx(["playoffSeries", "schedule", "teams"], "readwrite", tx);

        // This is a little tricky. We're returning this promise, but within the "then"s we're returning tx.complete() for the same transaction. Probably should be refactored.
        return dao.playoffSeries.get({
            ot: tx,
            key: g.season
        }).then(function (playoffSeriesLocal) {

		//console.log("here");
            playoffSeries = playoffSeriesLocal;
            series = playoffSeries.series;
            rnd = playoffSeries.currentRound;
            tids = [];
			 // Try to schedule games if there are active series
            for (i = 0; i < series[rnd].length; i++) {
                if (series[rnd][i].home.won < 4 && series[rnd][i].away.won < 4) {
                    // Make sure to set home/away teams correctly! Home for the lower seed is 1st, 2nd, 5th, and 7th games.
                    numGames = series[rnd][i].home.won + series[rnd][i].away.won;
                    if (numGames === 0 || numGames === 1 || numGames === 4 || numGames === 6) {
                        tids.push([series[rnd][i].home.tid, series[rnd][i].away.tid]);
                    } else {
                        tids.push([series[rnd][i].away.tid, series[rnd][i].home.tid]);
                    }
                }
            }
			
        }).then(function () {
			var cursor, matchup, nextRound,  team0, team1, team2,team3,team4,tidsWon; 				
		//	console.log(tids.length);									
            // If series are still in progress, write games and short circuit
            if (tids.length > 0) {
                return setSchedule(tx, tids).then(function () {
                    return false;
                });
            }
                // The previous round is over. Either make a new round or go to the next phase.

                // Record who won the league or conference championship
              /*  if (rnd === 3) {
                    tx.objectStore("teams").openCursor(series[rnd][0].home.tid).onsuccess = function (event) {
                        var cursor, t, teamSeason;

                        cursor = event.target.result;
                        t = cursor.value;
                        teamSeason = _.last(t.seasons);
                        if (series[rnd][0].home.won === 4) {
                            teamSeason.playoffRoundsWon += 1;
                            teamSeason.hype += 0.05;
                            if (teamSeason.hype > 1) {
                                teamSeason.hype = 1;
                            }
                        }
                        cursor.update(t);
                    };
                    tx.objectStore("teams").openCursor(series[rnd][0].away.tid).onsuccess = function (event) {
                        var cursor, t, teamSeason;

                        cursor = event.target.result;
                        t = cursor.value;
                        teamSeason = _.last(t.seasons);
                        if (series[rnd][0].away.won === 4) {
                            teamSeason.playoffRoundsWon += 1;
                            teamSeason.hype += 0.1;
                            if (teamSeason.hype > 1) {
                                teamSeason.hype = 1;
                            }
                        }
                        cursor.update(t);
                    };
                    tx.oncomplete = function () {
                        newPhase(g.PHASE.BEFORE_DRAFT).then(resolve);
                    }; */
					
				if (rnd === 3) {
						if (series[rnd][0].home.won === 4) {
							key = series[rnd][0].home.tid;
						} else if (series[rnd][0].away.won === 4) {
							key = series[rnd][0].away.tid;
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

								return t;
							}
						}).then(function () {
							// Playoffs are over! Return true!
							return true;							
//							return newPhase(g.PHASE.BEFORE_DRAFT);
						});
					}					
					
				//if (rnd === 0){				
                    nextRound = [];
                    tidsWon = [];
			//console.log(series[rnd].length);														
                    for (i = 0; i < series[rnd].length; i += 2) {
                        // Find the two winning teams
                        if (series[rnd][i].home.won === 4) {
                            team1 = helpers.deepCopy(series[rnd][i].home);
                            tidsWon.push(series[rnd][i].home.tid);
                        } else {
                            team1 = helpers.deepCopy(series[rnd][i].away);
                            tidsWon.push(series[rnd][i].away.tid);
                        }
                        if (series[rnd][i + 1].home.won === 4) {
                            team2 = helpers.deepCopy(series[rnd][i + 1].home);
                            tidsWon.push(series[rnd][i + 1].home.tid);
                        } else {
                            team2 = helpers.deepCopy(series[rnd][i + 1].away);
                            tidsWon.push(series[rnd][i + 1].away.tid);
                        }

                        // Set home/away in the next round
						//console.log(team1);
						//console.log(team2);
						if (rnd < 2) {
							if (team1.seed < team2.seed) {
								matchup = {home: team1, away: team2};
							} else {
								matchup = {home: team2, away: team1};
							}						
						} else {
							if (team1.points > team2.points) {
								matchup = {home: team1, away: team2};
							} else {
								matchup = {home: team2, away: team1};
							}
						}

                        matchup.home.won = 0;
                        matchup.away.won = 0;
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
/*                    for (i = 0; i < tidsWon.length; i++) {
						dao.teams.get({
							ot: tx,
							key: tidsWon[i]
						}).then(function (t) {*/
							 var s;

							s = t.seasons.length - 1;
							t.seasons[s].playoffRoundsWon = playoffSeries.currentRound;
							t.seasons[s].hype += 0.05;
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
               /*      dao.teams.put({ot: tx, value: t});
                });
            }

            // Next time, the schedule for the first day of the next round will be set
            return tx.complete().then(newSchedulePlayoffsDay);*/
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