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
            deltas.wins = 0.25 * (t.won - 8) / 8;
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
                var champTid, i, p,  type;

                players = player.filter(players, {
                    attrs: ["pid", "name", "tid", "abbrev", "draft","pos"],
                    stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa","qbr","orb","drb","stl","derpa","dec","olr","derpatp","intery","fgaMidRange","der","dep"],
                    season: g.season
                });

                // Add team games won to players
                for (i = 0; i < players.length; i++) {
                    // Special handling for players who were cut mid-season
                    if (players[i].tid >= 0) {
                        players[i].won = teams[players[i].tid].won;
                    } else {
                        players[i].won = 4;
                        //players[i].won = 3;
                    }
                }

                // Rookie of the Year
                players.sort(function (a, b) {  return b.stats.orb - a.stats.orb + b.stats.drb - a.stats.drb + b.stats.stl - a.stats.stl; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
                for (i = 0; i < players.length; i++) {
                    // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
                    if (players[i].draft.year === g.season - 1) {
                        break;
                    }
                }
                p = players[i];
                if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
                    awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast, stl: p.stats.stl, drb: p.stats.drb, orb: p.stats.orb};
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Rookie of the Year"});
                }

                // Most Valuable Player
                players.sort(function (a, b) {  return (b.stats.qbr + 1.0 * b.won*b.gs/16) - (a.stats.qbr + 1.0 * a.won*b.gs/16); });
                p = players[0];
                awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast, stl: p.stats.stl, drb: p.stats.drb, orb: p.stats.orb};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Most Valuable Player"});
                // Notification unless it's the user's player, in which case it'll be shown below
        /*        if (p.tid !== g.userTid) {
                    eventLog.add(null, {
                        type: "award",
                        text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", p.abbrev]) + '">' + p.abbrev + '</a>) won the Most Valuable Player award.'
                    });
                }*/

                // Sixth Man of the Year - same sort as MVP
         /*       players.sort(function (a, b) {  return (b.stats.qbr + 1.0 * b.won*b.gs/16) - (a.stats.qbr + 1.0 * a.won*b.gs/16); });
                for (i = 0; i < players.length; i++) {
                    // Must have come off the bench in most games
                    if (players[i].stats.gs === 0 || players[i].stats.gp / players[i].stats.gs > 2) {
                        break;
                    }
                }
                p = players[i];
                awards.smoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Offensive Player of the Year"});*/

                // All League Team - same sort as MVP
                // Rookie of the Year
				var numQB,numRB,numTE,numOL,numWR,numDone;
				numQB = 0;
				numRB = 0;
				numTE = 0;
				numOL = 0;
				numWR = 0;
				numDone = 0;
                players.sort(function (a, b) {  return b.stats.olr*4 + b.stats.orb - a.stats.orb + b.stats.drb - a.stats.olr*4- a.stats.drb + b.stats.stl - a.stats.stl; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
				
                awards.allLeague = [{title: "All Pro - Offense", players: []}];
                type = "All Pro Offensive Team";
                /*for (i = 0; i < 11; i++) {
                    p = players[i];
						_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
                } */


                for (i = 0; i < players.length; i++) {
                    p = players[i];

//						_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
//						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
			//		console.log(p.pos);
			//		console.log(numQB);
					if ((p.pos == "QB") && (numQB < 1)) {
						type = "All Pro Offensive Team - QB";
						_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
						numQB += 1;
						numDone += 1;
			//			console.log("numQB: "+numQB+" numDone: "+numDone);
					}
					if ((p.pos == "RB") && (numRB < 2)) {
						type = "All Pro Offensive Team - RB";
						_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
						numRB += 1;
						numDone += 1;
				//		console.log("numRB: "+numRB+" numDone: "+numDone);						
					}
					if ((p.pos == "TE") && (numTE < 1)) {
						type = "All Pro Offensive Team - TE";
						_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
						numTE += 1;
						numDone += 1;
					}
					if ((p.pos == "WR") && (numWR < 2)) {
						type = "All Pro Offensive Team - WR";
					
						_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
						numWR += 1;
						numDone += 1;
					/*	if (numWR == 3) {
							numDone += 1;
						}*/
					}
					if ((p.pos == "OL") && (numOL < 5)) {
						type = "All Pro Offensive Team - OL";
					
						_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
						numOL += 1;
						numDone += 1;
					/*	if (numOL == 5) {
							numDone += 1;
						}*/
					}
					if (numDone >= 11) {
						i = players.length;
					}
					
                }

				// fgaMidRange - sacks
				// dec - total plays
				// der - rushes at
				// dep - passes at
				
                // Defensive Player of the Year
//                players.sort(function (a, b) {  return (b.stats.fgaMidRange*2) - (a.stats.fgaMidRange*2) + (b.stats.intery*10-b.stats.der*1 - b.stats.dep) - (a.stats.intery*10 - a.stats.der*1 - a.stats.dep); });
                players.sort(function (a, b) {  return (b.stats.fgaMidRange*1) - (a.stats.fgaMidRange*1) + (b.stats.intery*2) - (a.stats.intery*2); });
				
//                players.sort(function (a, b) {  return (b.stats.fgaMidRange) - (a.stats.fgaMidRange) +(b.stats.dec- b.stats.der*1 - b.stats.dep*1) - (a.stats.dec - a.stats.der*1 - a.stats.dep*1); });
//                players.sort(function (a, b) {  return (b.stats.dec- b.stats.derpa*2) - (a.stats.dec - a.stats.derpa*2); });

                for (i = 0; i < players.length; i++) {
					if (players[i].stats.dec>600) {
						p = players[i];
						break;
					}
				}
				if ((p.pos == "S") || (p.pos == "CB")  || (p.pos == "LB")) {
						awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl, fgaMidRange: p.stats.fgaMidRange, intery: p.stats.intery, derpatp: p.stats.derpatp};
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Defensive Player of the Year"});						
				} else {				
					players.sort(function (a, b) {  return (b.stats.fgaMidRange)*10 - (a.stats.fgaMidRange)*10  ; });
				
//					players.sort(function (a, b) {  return (b.stats.fgaMidRange) - (a.stats.fgaMidRange); });
					p = players[0];
					awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl, fgaMidRange: p.stats.fgaMidRange, intery: p.stats.intery, derpatp: p.stats.derpatp};
					awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Defensive Player of the Year"});
				}

				
//              players.sort(function (a, b) {  return -(b.stats.dec/b.stats.derpa) + (a.stats.dec/a.stats.derpa); });
    //            players.sort(function (a, b) {  return (b.stats.dec- b.stats.der - b.stats.dep) - (a.stats.dec - a.stats.der - a.stats.dep); });
//                players.sort(function (a, b) {  return (b.stats.fgaMidRange) - (a.stats.fgaMidRange) + (b.stats.dec- b.stats.der*15 - b.stats.dep*5) - (a.stats.dec - a.stats.der*15 - a.stats.dep*5); });
//                players.sort(function (a, b) {  return (b.stats.fgaMidRange*2) - (a.stats.fgaMidRange*2) + (b.stats.intery*10-b.stats.der*1 - b.stats.dep) - (a.stats.intery*10 - a.stats.der*1 - a.stats.dep); });
                //players.sort(function (a, b) {  return (b.stats.fgaMidRange*3) - (a.stats.fgaMidRange*3) + (b.stats.intery*10) - (a.stats.intery*10); });
                players.sort(function (a, b) {  return (b.stats.fgaMidRange*1) - (a.stats.fgaMidRange*1) + (b.stats.intery*2) - (a.stats.intery*2); });
				//                players.sort(function (a, b) {  return (b.stats.dec- b.stats.derpa*2) - (a.stats.dec - a.stats.derpa*2); });
                // All Defensive Team - same sort as DPOY
			//	var numCB,numS,numLB,numDL;
				var numCB,numS,numLB,numDL;
			
				numCB = 0;
				numS = 0;
				numLB = 0;
				numDL = 0;
				numDone = 0;
				
                awards.allDefensive = [{title: "All Pro - Defense", players: []}];
                type = "All Pro Defensive Team";
/*                for (i = 0; i < 11; i++) {
                    p = players[i];
                    _.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
                }*/


                for (i = 0; i < players.length; i++) {
					if (players[i].stats.dec>600) {
						p = players[i];
	//						_.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast});
	//						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
				//		console.log(p.pos);
				//		console.log(numQB);
						if ((p.pos == "CB") && (numCB < 2)) {
							type = "All Pro Defensive Team - CB";
						_.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
							numCB += 1;
							numDone += 1;
				//			console.log("numQB: "+numQB+" numDone: "+numDone);
						}
						if ((p.pos == "S") && (numS < 2)) {
							type = "All Pro Defensive Team - S";
						_.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
							numS += 1;
							numDone += 1;
					//		console.log("numRB: "+numRB+" numDone: "+numDone);						
						}
						if ((p.pos == "LB") && (numLB < 3)) {
							type = "All Pro Defensive Team - LB";
						_.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
							numLB += 1;
							numDone += 1;
						}

						if (numDone >= 7) {
							i = players.length;
						}
					}
                }				
				
										
//                players.sort(function (a, b) {  return (b.stats.fgaMidRange*2) - (a.stats.fgaMidRange*2) + (b.stats.intery*10-b.stats.der*1 - b.stats.dep) - (a.stats.intery*10 - a.stats.der*1 - a.stats.dep); });
                //players.sort(function (a, b) {  return (b.stats.fgaMidRange*3) - (a.stats.fgaMidRange*3) + (b.stats.intery*10) - (a.stats.intery*10); });
                players.sort(function (a, b) {  return (b.stats.fgaMidRange*1) - (a.stats.fgaMidRange*1) + (b.stats.intery*2) - (a.stats.intery*2); });
				//                players.sort(function (a, b) {  return (b.stats.fgaMidRange)*10 - (a.stats.fgaMidRange)*10  - (b.stats.der) + (a.stats.der); });
                // All Defensive Team - same sort as DPOY
						
	
				numCB = 0;
				numS = 0;
				numLB = 0;
				numDL = 0;
				numDone = 0;
				
          //      awards.allDefensive = [{title: "All Pro - Defense", players: []}];
          //      type = "All Pro Defensive Team";
/*                for (i = 0; i < 11; i++) {
                    p = players[i];
                    _.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
                }*/


                for (i = 0; i < players.length; i++) {
					if (players[i].stats.dec>600) {					
						p = players[i];

						if ((p.pos == "DL") && (numDL < 4)  ) {
							type = "All Pro Defensive Team - DL";
						
							_.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl});
							awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
							numDL += 1;
							numDone += 1;
						/*	if (numWR == 3) {
								numDone += 1;
							}*/
						}
						if (numDone >= 4) {
							i = players.length;
						}
					}
					
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
                        stats: ["pts", "trb", "ast", "ewa","orb","drb","stl"],
                        season: g.season,
                        playoffs: true,
                        tid: champTid
                    });
                    players.sort(function (a, b) {  return b.statsPlayoffs.orb - a.statsPlayoffs.orb + b.statsPlayoffs.drb - a.statsPlayoffs.drb + b.statsPlayoffs.stl - a.statsPlayoffs.stl ; });
                    p = players[0];
                    awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.statsPlayoffs.pts, trb: p.statsPlayoffs.trb, ast: p.statsPlayoffs.ast, stl: p.statsPlayoffs.stl, drb: p.statsPlayoffs.drb, orb: p.statsPlayoffs.orb};
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Super Bowl MVP"});

            /*tx = dao.tx("awards", "readwrite");
            dao.awards.put({ot: tx, value: awards});
            return tx.complete().then(function () {*/
			return dao.awards.put({ot: tx, value: awards}).then(function () {				
                return saveAwardsByPlayer(awardsByPlayer);
            }).then(function () {

                // None of this stuff needs to block, it's just notifications of crap

                // Notifications for awards for user's players
             //   tx = dao.tx("events", "readwrite");
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
	//	console.log("gotHere");
        newSchedule = [];
        for (i = 0; i < tids.length; i++) {
            newSchedule.push({
                homeTid: tids[i][0],
                awayTid: tids[i][1]
            });
        }

        tx = dao.tx("schedule", "readwrite", tx);
	//	console.log("gotHere");
        return dao.schedule.clear({ot: tx}).then(function () {
				//	console.log("gotHere");
            return Promise.map(newSchedule, function (matchup) {
					//	console.log("gotHere");
                return dao.schedule.add({ot: tx, value: matchup});
						//console.log("gotHere");
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
		var homeGames;
		var iRandom,ii,jj,kk;
		
        teams = helpers.getTeamsDefault(); // Only tid, cid, and did are used, so this is okay for now. But if someone customizes cid and did, this will break. To fix that, make this function require DB access (and then fix the tests). Or even better, just accept "teams" as a param to this function, then the tests can use default values and the real one can use values from the DB.

        tids = [];  // tid_home, tid_away
		iRandom = [];
			
		
        // Collect info needed for scheduling
        for (i = 0; i < teams.length; i++) {
			iRandom.push(i);
            teams[i].homeGames = 0;
            teams[i].awayGames = 0;
        }
		
		random.shuffle(iRandom);		
		
//        for (i = 0; i < teams.length; i++) {
        for (ii = 0; ii < teams.length; ii++) {
			i = iRandom[ii];
//            for (j = 0; j < teams.length; j++) {
            for (jj = 0; jj < teams.length; jj++) {
				j = iRandom[jj];
				
                if (teams[i].tid !== teams[j].tid) {
                    game = [teams[i].tid, teams[j].tid];

                    // Constraint: 1 home game vs. each team in other conference
                    if (teams[i].cid !== teams[j].cid) {
                        //tids.push(game);
                        teams[i].homeGames += 0;
                        teams[j].awayGames += 0;
                    }

//                    // Constraint: 2 home schedule vs. each team in same division
                    // Constraint: 1 home schedule vs. each team in same division
					// 6 games, 10 left
                    if (teams[i].did === teams[j].did) {
                        tids.push(game);
                        //tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }

                    // Constraint: 1-2 home schedule vs. each team in same conference and different division
                    // Only do 1 now
					// home against team 1 ahead, away against team 1 back
                    if (teams[i].cid === teams[j].cid && teams[i].did !== teams[j].did) {
                        //tids.push(game);
                        teams[i].homeGames += 0;
                        teams[j].awayGames += 0;
                    }								


					// could make this very specific
			
                }
            }
        }

		//http://operations.nfl.com/the-game/creating-the-nfl-schedule/
		                    // same conference different division
					// diff conference 
					// play teams 8 before home, and 8 after away
        //for (i = 0; i < teams.length; i++) {
		var loops;
		loops = 0;
        for (ii = 0; ii < teams.length; ii++) {	
			i = iRandom[ii];		
		      //      console.log("i: "+teams[i].tid+" division "+teams[i].did+" teams.length: "+teams.length);
					homeGames = 0;						
					//k= i+1;
					kk = ii+1;
					k = iRandom[kk];							
					/*if (k > (teams.length-1)) {
						k=0;
					}*/					
					if (kk > (teams.length-1)) {
						kk = 0;
						k  = iRandom[kk];													
					}							
					while (homeGames < 5) {
						//console.log(kk+" "+k+" "+ii+" "+i+" "+homeGames+" "+teams[i].homeGames +" "+teams[k].awayGames);
		      //      console.log("homeGames: "+homeGames+" k: "+k+" teams.length: "+teams.length+" teams[k].awayGames: "+teams[k].awayGames);
					    
				//		if (teams[i].tid !== teams[k].tid) {
							game = [teams[i].tid, teams[k].tid];
						
						//		console.log("k: "+teams[k].tid+" division "+teams[k].did+" homeGames "+homeGames+" awayGames "+teams[k].awayGames);

//							if ((teams[i].did !== teams[k].did) &&  (teams[k].awayGames <8)) {
//							if ( ((teams[i].did !== teams[k].did) &&  (teams[k].awayGames <5)) || loops > 2) {
												// 8 away games is total. Already start with 3.
							if  ((teams[i].did !== teams[k].did || loops > 2) &&  (teams[k].awayGames <8)) {
//							if ((teams[i].did !== teams[k].did)) {
							
								tids.push(game);
								teams[i].homeGames += 1;
								teams[k].awayGames += 1;
								homeGames +=1;
							}		
							/*k += 1;
							if (k > (teams.length-1)) {
								k=0;
							}*/							
							kk += 1;
							if (kk > (teams.length-1)) {
								kk=0;
								loops += 1;
							}	
							k= iRandom[kk];														
				//		}
					}
        }

	//    console.log("finished");
		
 

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

        numGames = 16;
	//	console.log("games: "+16);
        // Number of games left to reschedule for each team
        numRemaining = [];
        for (i = 0; i < g.numTeams; i++) {
            numRemaining[i] = numGames;
        }
        numWithRemaining = g.numTeams; // Number of teams with numRemaining > 0
	//	     console.log("numWithRemaining: "+numWithRemaining);

        tids = [];
        while (tids.length < numGames * g.numTeams) {
	//	     console.log("tids.length: "+tids.length);
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
		//    console.log(" tids.length: "+tids.length+ " numGames * g.numTeams: "+ numGames * g.numTeams);
		//    console.log(" numWithRemaining: "+numWithRemaining);
		 //   console.log(" numWithRemaining: "+numWithRemaining);
		 //   console.log(" numWithRemaining: "+numWithRemaining);
			
            if (numWithRemaining === 1) {
		//		console.log("one left");
                // If this happens, we didn't find 82 for each team and one team will play a few less games
                break;
            }
		//     console.log("numWithRemaining: "+numWithRemaining);
		//     console.log("numRemaining[i]: "+numRemaining[i]);
		//     console.log("numRemaining[j]: "+numRemaining[j]);
			
        }
//		console.log("done");

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

        if (g.numTeams === 32) {
            tids = newScheduleDefault();
        } else {
            tids = newScheduleCrappy();
        }
	//	console.log("schedule finished");
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
            var  i,playoffSeries, rnd, series,tids, tx;

        tx = dao.tx(["playoffSeries", "schedule", "teams"], "readwrite", tx);

		console.log("got here");
        // This is a little tricky. We're returning this promise, but within the "then"s we're returning tx.complete() for the same transaction. Probably should be refactored.
        return dao.playoffSeries.get({
            ot: tx,
            key: g.season
        }).then(function (playoffSeriesLocal) {
	
							console.log("got here");		
            playoffSeries = playoffSeriesLocal;
            series = playoffSeries.series;
            rnd = playoffSeries.currentRound;
            tids = [];
			
			//console.log(rnd);
			
            for (i = 0; i < series[rnd].length; i++) {
			console.log(i+" "+series[rnd][i].home.won+" "+series[rnd][i].away.won);				
			console.log(i+" "+series[rnd][i].home.tid+" "+series[rnd][i].away.tid);				
                if (series[rnd][i].home.won < 1 && series[rnd][i].away.won < 1) {
                    // Make sure to set home/away teams correctly! Home for the lower seed is 1st, 2nd, 5th, and 7th games.
					// only 1 game, should always be home
                        tids.push([series[rnd][i].home.tid, series[rnd][i].away.tid]);
                }
            }
			
        }).then(function () {			
			var cursor,  matchup, nextRound, numGames, team0, team1, team2,team3,team4,tidsWon,tidsLost; 	
			var teamNumberOneC1;
			var teamNumberOneC2;
			var teamNumberTwoC1;
			var teamNumberTwoC2;
			var teamNumberThreeC1;
			var teamNumberThreeC2;	
			var key;
									console.log("got here");	
            // If series are still in progress, write games and short circuit
            if (tids.length > 0) {
									console.log("got here");					
									console.log(tids.length);
                return setSchedule(tx, tids).then(function () {
									console.log("got here");						
                    return false;
                });
            }		
									console.log("got here");					
                // The previous round is over. Either make a new round or go to the next phase.

                // Record who won the league or conference championship
               /* if (rnd === 3) {
                    tx.objectStore("teams").openCursor(series[rnd][0].home.tid).onsuccess = function (event) {
                        var cursor, t, teamSeason;

                        cursor = event.target.result;
                        t = cursor.value;
                        teamSeason = _.last(t.seasons);
                        if (series[rnd][0].home.won === 1) {
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
                        if (series[rnd][0].away.won === 1) {
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
                    };*/
					
					if (rnd === 3) {
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

								t.seasons[s].playoffRoundsWon += 1;
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
					
														console.log("got here");	
			////////////////////////////////////////////////////		
                if (rnd === 0){
					console.log(rnd);
                    nextRound = [];
                    tidsWon = [];
					var seed0,seed1,seed2,seed3;
					var teamBug0,teamBug1;
//                    for (i = 0; i < series[rnd].length; i += 2) {
// prior round was only 2 games, instead of 8
                    for (i = 0; i < 2; i += 2) {
                        // Find the two winning teams
						
						//// first round teams 1-3 auto win
						//// first round teams 1-2 auto win
                        if (series[rnd][i].home.won === 1) {
                            team0 = helpers.deepCopy(series[rnd][i].home);
                            teamBug0 = helpers.deepCopy(series[rnd][i].away);
                            tidsWon.push(series[rnd][i].home.tid);
						    //series[1][0].away.seed = 4;							
						    seed0 = 4;							
                        } else {
                            team0 = helpers.deepCopy(series[rnd][i].away);
                            teamBug0 = helpers.deepCopy(series[rnd][i].home);
                            tidsWon.push(series[rnd][i].away.tid);
						    seed0 = 5;														
                        }
                        if (series[rnd][i  + 2].home.won === 1) {
                            team1 = helpers.deepCopy(series[rnd][i + 2].home);
                            teamBug1 = helpers.deepCopy(series[rnd][i+2].away);
                            tidsWon.push(series[rnd][i + 2].home.tid);
	//					    series[1][2].away.seed = 4;										
							seed1 = 4;																					
                        } else {
                            team1 = helpers.deepCopy(series[rnd][i + 2].away);
                            teamBug1 = helpers.deepCopy(series[rnd][i+2].home);							
                            tidsWon.push(series[rnd][i + 2].away.tid);
//						    series[1][2].away.seed = 5;														
							seed1 = 5;																					
							
                        }
                        if (series[rnd][i + 1].home.won === 1) {
                            team2 = helpers.deepCopy(series[rnd][i+1].home);
                            teamBug0 = helpers.deepCopy(series[rnd][i+1].away);
                            tidsWon.push(series[rnd][i+1].home.tid);
						    //series[1][0].away.seed = 4;							
						    seed2 = 3;							
                        } else {
                            team2 = helpers.deepCopy(series[rnd][i+1].away);
                            teamBug0 = helpers.deepCopy(series[rnd][i+1].home);
                            tidsWon.push(series[rnd][i+1].away.tid);
						    seed2 = 6;														
                        }
                        if (series[rnd][i + 1 + 2].home.won === 1) {
                            team3 = helpers.deepCopy(series[rnd][i + 1+2].home);
                            teamBug1 = helpers.deepCopy(series[rnd][i+1+2].away);
                            tidsWon.push(series[rnd][i + 1+2].home.tid);
	//					    series[1][2].away.seed = 4;										
							seed3 = 3;																					
                        } else {
                            team3 = helpers.deepCopy(series[rnd][i + 1+2].away);
                            teamBug1 = helpers.deepCopy(series[rnd][i+1+2].home);							
                            tidsWon.push(series[rnd][i + 1].away.tid);
//						    series[1][2].away.seed = 5;														
							seed3 = 6;																					
							
                        }
					//			console.log("0: "+ seed0+" 1: "+ seed1+" 2: "+ seed2+" 3: "+ seed3);
								
				
						teamNumberOneC1 = helpers.deepCopy(series[1][0].home);
						teamNumberOneC2 = helpers.deepCopy(series[1][2].home);
						teamNumberTwoC1 = helpers.deepCopy(series[1][1].home);
						teamNumberTwoC2 = helpers.deepCopy(series[1][3].home);
		//		teamNumberThreeC1 = helpers.deepCopy(series[1][1].away);
		//		teamNumberThreeC2 = helpers.deepCopy(series[1][3].away);								
					//			console.log("1C1 0: "+ teamNumberOneC1+" 1C2 1: "+ teamNumberOneC2+" 2C1 2: "+ teamNumberTwoC1+" 2C2 3: "+ teamNumberTwoC2);
								
								
								//// works
						series[rnd+1][0]  = {home: teamNumberOneC1, away: team0};                //// error here :Uncaught TypeError: Cannot read property '0' of undefined 
                        
///////						series[rnd+1][0]  = {home: topseeds[0], away: team0};                //// error here :Uncaught TypeError: Cannot read property '0' of undefined 
						//series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
															
						series[1][0].home.seed = 1;
//						series[1][0].away.seed = 15;													
						series[1][0].away.seed = seed0;													
						series[1][0].home.won	= 0
						series[1][0].away.won	= 0


						//// doesn't work

					//	teamNumberOneC2
						series[rnd+1][2]  = {home: teamNumberOneC2, away:  team1 };
//						series[rnd+1][2]  = {home: teamNumberOneC2, away:  team2 };
//						series[rnd+1][1]  = {home: topseeds[1], away:  topseeds[2] };
////////////////////////////						series[rnd+1][1]  = {home: topseeds[1], away:  topseeds[2] };
						//series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
						series[1][2].home.seed = 1;
////						series[1][2].away.seed = 30;
						series[1][2].away.seed = seed1;
						series[1][2].home.won	= 0
						series[1][2].away.won	= 0
						
						
						//// works						
//						series[rnd+1][1]  = {home: teamNumberTwoC1, away: team1};
						series[rnd+1][1]  = {home: teamNumberTwoC1, away: team2};
/////////////////						series[rnd+1][2]  = {home: topseeds[5], away: team1};
						//series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
						series[1][1].home.seed = 2;
					    series[1][1].away.seed = seed2;																
//					    series[1][1].away.seed = 45;																
						series[1][1].home.won	= 0
						series[1][1].away.won	= 0

						
						//// doesn't work
						series[rnd+1][3]  = {home: teamNumberTwoC2, away: team3};
						//series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
						series[1][3].home.seed = 2;
						series[1][3].away.seed = seed3;
//						series[1][3].away.seed = 60;
						series[1][3].home.won	= 0
						series[1][3].away.won	= 0


						
                    }
                    playoffSeries.currentRound += 1;
                    return dao.playoffSeries.put({ot: tx, value: playoffSeries}).then(function() {
						return Promise.map(tidsWon, function (tid) {
                    // Update hype for winning a series
							//for (i = 0; i < tidsWon.length; i++) {
								return dao.teams.get({
									ot: tx,
									key: tidsWon[i]
								}).then(function (t) {
							
								   var s;

									s = t.seasons.length - 1;
									t.seasons[s].playoffRoundsWon = playoffSeries.currentRound;
									t.seasons[s].hype += 0.05;
									if (t.seasons[s].hype > 1) {
										t.seasons[s].hype = 1;
									}

									return dao.teams.put({ot: tx, value: t});
								});
							//}					
						});							
					}).then(function () {
						newSchedulePlayoffsDay(tx);
					});							
				///////////////////////////////////////////	
						//	console.log("gotHere");
					// Next time, the schedule for the first day of the next round will be set
					//return tx.complete().then(newSchedulePlayoffsDay);					
					
                } else {
					console.log(rnd);					
					console.log("got here");						
                    nextRound = [];
                    tidsWon = [];
					tidsLost = [];
			//		console.log("rnd: "+rnd+" series[rnd].length: "+series[rnd].length);
//                    for (i = 0; i < series[rnd].length; i += 2) {
                    for (i = 0; i < series[rnd].length; i += 2) {
				//		console.log("series[rnd][i].home.won: "+series[rnd][i].home.won);
				//		console.log("series[rnd][i].away.won: "+series[rnd][i].away.won);
                        // Find the two winning teams
                        if (series[rnd][i].home.won === 1) {
                            team1 = helpers.deepCopy(series[rnd][i].home);
                            tidsWon.push(series[rnd][i].home.tid);
                            tidsLost.push(series[rnd][i].away.tid);							
                        } else {
                            team1 = helpers.deepCopy(series[rnd][i].away);
                            tidsWon.push(series[rnd][i].away.tid);
                            tidsLost.push(series[rnd][i].home.tid);
                        }
                        if (series[rnd][i + 1].home.won === 1) {
                            team2 = helpers.deepCopy(series[rnd][i + 1].home);
                            tidsWon.push(series[rnd][i + 1].home.tid);
                            tidsLost.push(series[rnd][i + 1].away.tid);
                        } else {
                            team2 = helpers.deepCopy(series[rnd][i + 1].away);
                            tidsWon.push(series[rnd][i + 1].away.tid);
                            tidsLost.push(series[rnd][i + 1].home.tid);
                        }
              //          console.log("i: "+i+" team1: "+team1+" team2: "+team2);
                        // Set home/away in the next round
                        if (team1.winp > team2.winp) {
                            matchup = {home: team1, away: team2};
                        } else {
                            matchup = {home: team2, away: team1};
                        }

                        matchup.home.won = 0;
                        matchup.away.won = 0;
                        series[rnd + 1][i / 2] = matchup;
                    }
                    playoffSeries.currentRound += 1;
						console.log("got here");						
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
									t.seasons[s].hype += 0.10;
									if (t.seasons[s].hype > 1) {
										t.seasons[s].hype = 1;
									}
								return dao.teams.put({ot: tx, value: t});
							});
						});							
					}).then(function () {
								if (playoffSeries.currentRound == 2) {
										return Promise.map(tidsLost, function (tid) {
											return dao.teams.get({
												ot: tx,
												key: tid
											}).then(function (t) {
												 var s;

												s = t.seasons.length - 1;
												t.seasons[s].playoffRoundsWon = playoffSeries.currentRound-1;
												t.seasons[s].hype += 0.05;
												if (t.seasons[s].hype > 1) {
													t.seasons[s].hype = 1;
												}						

											return dao.teams.put({ot: tx, value: t});

										});
								
									});
								}			
					//	});
						console.log("got here");							
					}).then(function () {
						console.log("got here");						
						// Next time, the schedule for the first day of the next round will be set
						return newSchedulePlayoffsDay(tx);
					});
			}
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

