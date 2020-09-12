/**
 * @name core.season
 * @namespace Somewhat of a hodgepodge. Basically, this is for anything related to a single season that doesn't deserve to be broken out into its own file. Currently, this includes things that happen when moving between phases of the season (i.e. regular season to playoffs) and scheduling. As I write this, I realize that it might make more sense to break up those two classes of functions into two separate modules, but oh well.
 */
define(["dao","db", "globals", "ui", "core/contractNegotiation", "core/draft", "core/finances", "core/freeAgents", "core/player", "core/team" ,"lib/bluebird", "lib/jquery", "lib/underscore", "util/account", "util/eventLog", "util/helpers", "util/message", "util/random"], function (dao,db, g, ui, contractNegotiation, draft, finances, freeAgents, player, team, Promise, $, _, account, eventLog, helpers, message, random) {    

"use strict";

    var phaseText;

	//var topseeds;
	 var topseeds = [];
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
            deltas.wins = 0.25 * (t.won - 81) / 81;
            if (t.playoffRoundsWon < 0) {
                deltas.playoffs = -0.2;
            } else if (t.playoffRoundsWon < 3) {
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


    //    tx = dao.tx(["players", "playerStats", "releasedPlayers", "teams"]);

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
			    var c,sp,fb,sb,ss,tb,lf,cf,rf;
				var j,used;
				var positionsused = [0,0,0,0,0,0,0,0,0];

				
                players = player.filter(players, {
                    attrs: ["pid", "name", "tid", "abbrev", "draft","pos"],
                    stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa","fg","fta","pf","fgAtRim","war","warP","winP","lossP","save","warF"],
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
                players.sort(function (a, b) {  return b.stats.fg + b.stats.pts*2 + b.stats.stl*2  + b.stats.blk*4 - a.stats.fg - a.stats.pts*2 - a.stats.stl*2  - a.stats.blk*4; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
//                players.sort(function (a, b) {  return b.stats.ewa - a.stats.ewa; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
                for (i = 0; i < players.length; i++) {
                    // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
                    if (players[i].draft.year === g.season - 1) {
                        break;
                    }
                }
                p = players[i];
                if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
                    awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast, stl: p.stats.stl, blk: p.stats.blk};
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Rookie of the Year"});
                }

                // Most Valuable Player
                players.sort(function (a, b) {  return (b.stats.fg + b.stats.pts*2 + b.stats.stl*2  + b.stats.blk*4 +  2*b.won) - ( a.stats.fg + a.stats.pts*2 + a.stats.stl*2  + a.stats.blk*4 +  2*a.won); });
//                players.sort(function (a, b) {  return (b.stats.ewa + 0.1 * b.won) - (a.stats.ewa + 0.1 * a.won); });
                p = players[0];
                awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast, stl: p.stats.stl, blk: p.stats.blk};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Most Valuable Player"});
                // Notification unless it's the user's player, in which case it'll be shown below
           /*     if (p.tid !== g.userTid) {
                    eventLog.add(null, {
                        type: "award",
                        text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", p.abbrev]) + '">' + p.abbrev + '</a>) won the Most Valuable Player award.'
                    });
                }*/
				

                // Sixth Man of the Year - same sort as MVP
				// Manager Award?
				// 
                for (i = 0; i < players.length; i++) {
                    // Must have come off the bench in most games
                    if (players[i].stats.gs === 0 || players[i].stats.gp / players[i].stats.gs > 2) {
                        break;
                    }
                }
                p = players[i];
         //       awards.smoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast, stl: p.stats.stl, blk: p.stats.blk};
         //       awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Sixth Man of the Year"}); 

                // All League Team - same sort as MVP
				// Silver Slugger - same as MVP?
//                awards.allLeague = [{title: "Silver Sluggers", players: []}];
                awards.allLeague = [{title: "", players: []}];
                type = "Silver Sluggers";
						for (i= 0; i < 9; i++) {
						  positionsused[i] =0;
						}
						j=0;
						used = 0;
						c=0;
						sp=0;
						fb=0;
						sb=0;
						ss=0;
						tb=0;
						lf=0;
						cf=0;
						rf=0;
						// instead of 9, make 200 or more
						// not having "C" means this takes a while
						for (i = 0; i < players.length; i++) {
							p = players[i];
							if ((sp == 0) && (p.pos == "SP" )) {
						//		awards.allLeague.push({title: "", players: []});
		//                        awards.allLeague.push({title: "SP", players: []});
								type = "Silver Slugger Award - SP";
		//                        type = "SP";
								sp = 1;
								used = 1;
							} 
							/*if (i < 10) {
								console.log("position"+p.pos);
							}*/
							if ((fb == 0) && (p.pos == "1B" )) {
						//		awards.allLeague.push({title: "", players: []});
								type = "Silver Slugger Award - 1B";
								fb = 1;						
								used = 1;						
							} 
							if ((sb == 0) && (p.pos == "2B" )) {
						//		awards.allLeague.push({title: "", players: []});
								type = "Silver Slugger Award - 2B";
								sb = 1;	
								used = 1;
							} 
							if ((tb == 0) && (p.pos == "3B" )) {
						//		awards.allLeague.push({title: "", players: []});
								type = "Silver Slugger Award - 3B";
								tb = 1;						
								used = 1;						
							} 
							if ((ss == 0) && (p.pos == "SS" )) {
						//		awards.allLeague.push({title: "", players: []});
								type = "Silver Slugger Award - SS";
								ss = 1;	
								used = 1;
							} 
							if ((lf== 0) && (p.pos == "LF" )) {
						//		awards.allLeague.push({title: "", players: []});
		//                        awards.allLeague.push({title: "LF", players: []});
							   type = "Silver Slugger Award - LF";
								lf = 1;						
								used = 1;						
							} 
							if ((rf == 0) && (p.pos == "RF" )) {
						//		awards.allLeague.push({title: "", players: []});
		//                        awards.allLeague.push({title: "RF", players: []});
								type = "Silver Slugger Award - RF";
		//                        type = "RF";
								rf = 1;	
								used = 1;						
							} 
							if ((cf == 0) && (p.pos == "CF" )) {
						//		awards.allLeague.push({title: "", players: []});
		//                        awards.allLeague.push({title: "CF", players: []});
								type = "Silver Slugger Award - CF";
		//                        type = "CF";
								cf = 1;	
								used = 1;						
							} 
							if ((c == 0) && (p.pos == "C" )) {
		//                        awards.allLeague.push({title: "C", players: []});
						//		awards.allLeague.push({title: "", players: []});
								type = "Silver Slugger Award - C";
		//                        type = "C";
								c = 1;	
								used = 1;						
							} 
							/*if (i === 5) {
								awards.allLeague.push({title: "Second Team", players: []});
								type = "Second Team All-League";
							} else if (i === 10) {
								awards.allLeague.push({title: "Third Team", players: []});
								type = "Third Team All-League";
							}*/
							if (used == 1) {
								_.last(awards.allLeague).players.push({pid: p.pid, pos: p.pos, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast, stl: p.stats.stl, blk: p.stats.blk});
								awardsByPlayer.push({pid: p.pid, tid: p.tid, pos: p.pos, name: p.name, type: type});
								j += 1;
								used = 0;
							}
							if (j==9) {
							  i = players.length;
							}
							
						}

                // Defensive Player of the Year
				// Now Cy Young Award Winner
//                players.sort(function (a, b) {  return b.stats.gp * (b.stats.trb + 5 * b.stats.blk + 5 * b.stats.stl) - a.stats.gp * (a.stats.trb + 5 * a.stats.blk + 5 * a.stats.stl); });
// later this can be era?
//                players.sort(function (a, b) {  return  b.stats.save -a.stats.save +b.stats.winP*5 - b.stats.lossP*5 - a.stats.winP*5 + a.stats.lossP*5 +b.stats.fta - b.stats.pf*3  - a.stats.fta + a.stats.pf*3 ; });
//                players.sort(function (a, b) {  return  b.stats.save -a.stats.save +b.stats.winP*5 - b.stats.lossP*5 - a.stats.winP*5 + a.stats.lossP*5  - b.stats.pf*30  + a.stats.pf*30 ; });
                players.sort(function (a, b) {  return  b.stats.warP -a.stats.warP + b.stats.winP*.10 - b.stats.lossP*.10  - (a.stats.winP*.10 - a.stats.lossP*.10)  + b.stats.pf - a.stats.pf + b.stats.save*.05 -a.stats.save*.05; });
                for (i = 0; i < players.length; i++) {
					console.log(players[i].stats.warP+" "+players[i].stats.pf+" "+players[i].stats.winP+" "+players[i].stats.lossP+" "+players[i].stats.save+" "+players[i].stats.fta);
                    if ( (players[i].stats.fta > 150 ) || (players[i].stats.save > 50) ) {
						p = players[i];
                        break;
                    }
                }				
				
                awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl, pf: p.stats.pf, fta: p.stats.fta, fgAtRim: p.stats.fgAtRim, winP: p.stats.winP};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Cy Young Award"});
//                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Cy Young AwardDefensive Player of the Year"});

				
				
                // All Defensive Team - same sort as DPOY
				// different sort
//                players.sort(function (a, b) {  return b.stats.fieldAttempts - b.stats.errors  - a.stats.fieldAttempts + a.stats.errors ; });
                players.sort(function (a, b) {  return b.stats.warF - a.stats.warF ; });
				
               awards.allDefensive = [{title: "", players: []}];
                type = "Golden Gloves";
						for (i= 0; i < 9; i++) {
						  positionsused[i] =0;
						}
						j=0;
						used = 0;
						c=0;
						sp=0;
						fb=0;
						sb=0;
						ss=0;
						tb=0;
						lf=0;
						cf=0;
						rf=0;
						// instead of 9, make 200 or more
						// not having "C" means this takes a while
						for (i = 0; i < players.length; i++) {
							p = players[i];
							if ((sp == 0) && (p.pos == "SP" )) {
//								awards.allDefensive = [{title: "First Team", players: []}];
		            //            awards.allDefensive.push({title: "Golden Glove - SP", players: []});
								type = "Golden Glove Award - SP";

//								awards.allDefensive.push({title: "Silver Slugger - SP", players: []});
		//                        awards.allLeague.push({title: "SP", players: []});
		//                        type = "SP";
								sp = 1;
								used = 1;
							} 
						/*	if (i < 10) {
								console.log("position"+p.pos);
							}*/
							if ((fb == 0) && (p.pos == "1B" )) {
		                  //      awards.allDefensive.push({title: "Golden Glove - 1B", players: []});
								type = "Golden Glove Award - 1B";
								fb = 1;						
								used = 1;						
							} 
							if ((sb == 0) && (p.pos == "2B" )) {
		                //        awards.allDefensive.push({title: "Golden Glove - 2B", players: []});
								type = "Golden Glove Award - 2B";
								sb = 1;	
								used = 1;
							} 
							if ((tb == 0) && (p.pos == "3B" )) {
		              //          awards.allDefensive.push({title: "Golden Glove - 3B", players: []});
								type = "Golden Glove Award - 3B";
								tb = 1;						
								used = 1;						
							} 
							if ((ss == 0) && (p.pos == "SS" )) {
		              //          awards.allDefensive.push({title: "Golden Glove - SS", players: []});
								type = "Golden Glove Award - SS";
								ss = 1;	
								used = 1;
							} 
							if ((lf== 0) && (p.pos == "LF" )) {
		               //         awards.allDefensive.push({title: "Golden Glove - LF", players: []});
								type = "Golden Glove Award - LF";
								lf = 1;						
								used = 1;						
							} 
							if ((rf == 0) && (p.pos == "RF" )) {
		              //          awards.allDefensive.push({title: "Golden Glove - RF", players: []});
								type = "Golden Glove Award - RF";
								rf = 1;	
								used = 1;						
							} 
							if ((cf == 0) && (p.pos == "CF" )) {
		               //         awards.allDefensive.push({title: "Golden Glove - CF", players: []});
								type = "Golden Glove Award - CF";
								cf = 1;	
								used = 1;						
							} 
							if ((c == 0) && (p.pos == "C" )) {
		               //         awards.allDefensive.push({title: "Golden Glove - C", players: []});
								type = "Golden Glove Award - C";
								c = 1;	
								used = 1;						
							} 
							/*if (i === 5) {
								awards.allLeague.push({title: "Second Team", players: []});
								type = "Second Team All-League";
							} else if (i === 10) {
								awards.allLeague.push({title: "Third Team", players: []});
								type = "Third Team All-League";
							}*/
							if (used == 1) {
								_.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, pos: p.pos, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl, pf: p.stats.pf, fta: p.stats.fta, fgAtRim: p.stats.fgAtRim});
								awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type, pos: p.pos});
								j += 1;
								used = 0;
							}
							if (j==9) {
							  i = players.length;
							}
							
						}
				
				
				
     /*           if ((cf == 0) && (p.pos == "CF" )) {
				
				}
				
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
                }
					
					if (used == 1) {
						_.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, trb: p.stats.trb, blk: p.stats.blk, stl: p.stats.stl, pf: p.stats.pf, fta: p.stats.fta, fgAtRim: p.stats.fgAtRim});
						awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
						j += 1;
						used = 0;
					}
                    if (j==9) {
						i = players.length;
					}*/
				
				
				
                // Finals MVP - most WS in playoffs
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].playoffRoundsWon === 4) {
                        champTid = teams[i].tid;
                        break;
                    }
                }
                // Need to read from DB again to really make sure I'm only looking at players from the champs. player.filter might not be enough. This DB call could be replaced with a loop manually checking tids, though.
//                tx.objectStore("players").index("tid").getAll(champTid).onsuccess = function (event) {
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
                        stats: ["pts", "trb", "ast", "ewa","fg","stl","blk"],
                        season: g.season,
                        playoffs: true,
                        tid: champTid
                    });
					// World Series MVP calc
                    players.sort(function (a, b) {  return b.statsPlayoffs.fg + b.statsPlayoffs.pts*2 + b.statsPlayoffs.stl*2 + b.statsPlayoffs.blk*4 - a.statsPlayoffs.fg - a.statsPlayoffs.pts*2 - a.statsPlayoffs.stl*2 - a.statsPlayoffs.blk*4; });
//                    players.sort(function (a, b) {  return b.statsPlayoffs.ewa - a.statsPlayoffs.ewa; });
                    p = players[0];
                    awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.statsPlayoffs.pts, trb: p.statsPlayoffs.trb, ast: p.statsPlayoffs.ast, stl: p.statsPlayoffs.stl, blk: p.statsPlayoffs.blk};
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "World Series MVP"});

            /*tx = dao.tx("awards", "readwrite");
            dao.awards.put({ot: tx, value: awards});
            return tx.complete().then(function () {*/
			return dao.awards.put({ot: tx, value: awards}).then(function () {				
                return saveAwardsByPlayer(awardsByPlayer);
            }).then(function () {

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
     * This makes an MLB-like schedule in terms of conference matchups, division matchups, and home/away games.
     * 
     * @memberOf core.season
     * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
     */
//    function newSchedule() {
  //      var cid, days, dids, game, games, good, i, ii, iters, j, jj, jMax, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tidsInDays, tryNum, used;        
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
//                    game = [teams[i].tid, teams[j].tid];
                    game = [teams[j].tid, teams[i].tid];

                    // Constraint: 1 home game vs. each team in other conference
                    if (teams[i].cid !== teams[j].cid) {
                        tids.push(game);
                        teams[i].homeGames += 1;
                        teams[j].awayGames += 1;
                    }

                    // Constraint: 2 home schedule vs. each team in same division
                    if (teams[i].did === teams[j].did) {
					// expanded from 2 to 5 to 10 to 9
					  // only want to do once, 					    
                        tids.push(game);
                        tids.push(game);
                        tids.push(game);
                        tids.push(game);
                        tids.push(game);
                        tids.push(game);
                        tids.push(game);
//                        tids.push(game);
//                        tids.push(game);				
                        teams[i].homeGames += 7;
                        teams[j].awayGames += 7;
                    }

                    // Constraint: 1-2 home schedule vs. each team in same conference and different division
                    // Only do 1 now
                    if (teams[i].cid === teams[j].cid && teams[i].did !== teams[j].did) {
					// expanded from 1 to 2
                        tids.push(game);
                        tids.push(game);
                        tids.push(game);
                        teams[i].homeGames += 3;
                        teams[j].awayGames += 3;
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

//        for (cid = 0; cid < 2; cid++) {
        for (cid = 0; cid < 2; cid++) {
            matchups = [];
            matchups.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
            games = 0;
//            while (games < 8) {
//            while (games < 4) {
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
//                    game = [teams[ii].tid, teams[jj].tid];
                    game = [teams[jj].tid, teams[ii].tid];
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

        numGames = 162;

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
            tids = newScheduleDefault();
        } else {
            tids = newScheduleCrappy();
        }
		
		
        // Order the schedule so that it takes fewer days to play
        //random.shuffle(tids);
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
		//// testing shuffle of more than one day
        random.shuffleWeek(days,15);  // Otherwise the most dense days will be at the beginning and the least dense days will be at the end
      //  random.shuffle(days);  // Otherwise the most dense days will be at the beginning and the least dense days will be at the end
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
            var  i,numGames, playoffSeries, rnd, series,tids, tx;		
           // var cursor, i, matchup, nextRound, numGames, playoffSeries, rnd, series, team0, team1,team2, tids, tidsWon;
			var gameswon;		
        tx = dao.tx(["playoffSeries", "schedule", "teams"], "readwrite", tx);

        // This is a little tricky. We're returning this promise, but within the "then"s we're returning tx.complete() for the same transaction. Probably should be refactored.
        return dao.playoffSeries.get({
            ot: tx,
            key: g.season
        }).then(function (playoffSeriesLocal) {

			
            playoffSeries = playoffSeriesLocal;
            series = playoffSeries.series;
            rnd = playoffSeries.currentRound;
            tids = [];



			
			
            // Try to schedule games if there are active series			
            for (i = 0; i < series[rnd].length; i++) {
				
//              if ((rnd=0) && (i==0)) {
//			    series[rnd][i].home.won = 4;
//			  }
				if (rnd == 0) {
					gameswon = 1;
				} else if (rnd==1) {
					gameswon = 3;
				} else {
					gameswon = 4;
				}
//                if (series[rnd][i].home.won < 4 && series[rnd][i].away.won < 4) {
                if (series[rnd][i].home.won < gameswon && series[rnd][i].away.won < gameswon) {
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
			var cursor, key, matchup, nextRound, team0, team1, team2,team3,team4,tidsWon, tidsLost; 
			var seedNumber;
			var teamNumberOneC1;
			var teamNumberOneC2;
			var teamNumberTwoC1;
			var teamNumberTwoC2;
			var teamNumberThreeC1;
			var teamNumberThreeC2;			
			
            // If series are still in progress, write games and short circuit
            if (tids.length > 0) {
                return setSchedule(tx, tids).then(function () {
                    return false;
                });
            }
        
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
					
					
		   if (rnd === 0) {
				nextRound = [];
				tidsWon = [];

				var seed0,seed1;
				var teamBug0,teamBug1;
//                    for (i = 0; i < series[rnd].length; i += 2) {
// prior round was only 2 games, instead of 8
				for (i = 0; i < 2; i += 2) {
					// Find the two winning teams
					
					//// first round teams 1-3 auto win
					////
	

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
					if (series[rnd][i + 1].home.won === 1) {
						team1 = helpers.deepCopy(series[rnd][i + 1].home);
						teamBug1 = helpers.deepCopy(series[rnd][i+1].away);
						tidsWon.push(series[rnd][i + 1].home.tid);
//					    series[1][2].away.seed = 4;										
						seed1 = 4;																					
					} else {
						team1 = helpers.deepCopy(series[rnd][i + 1].away);
						teamBug1 = helpers.deepCopy(series[rnd][i+1].home);							
						tidsWon.push(series[rnd][i + 1].away.tid);
//						    series[1][2].away.seed = 5;														
						seed1 = 5;																					
						
					}
					
 
			
					teamNumberOneC1 = helpers.deepCopy(series[1][0].home);
					teamNumberOneC2 = helpers.deepCopy(series[1][2].home);
					teamNumberTwoC1 = helpers.deepCopy(series[1][1].home);
					teamNumberTwoC2 = helpers.deepCopy(series[1][3].home);
					teamNumberThreeC1 = helpers.deepCopy(series[1][1].away);
					teamNumberThreeC2 = helpers.deepCopy(series[1][3].away);
			


					series[rnd+1][0]  = {home: teamNumberOneC1, away: team0};                //// error here :Uncaught TypeError: Cannot read property '0' of undefined 

///////						series[rnd+1][0]  = {home: topseeds[0], away: team0};                //// error here :Uncaught TypeError: Cannot read property '0' of undefined 
					//series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
					series[1][0].home.seed = 1;
					series[1][0].away.seed = seed0;													
					series[1][0].home.won	= 0
					series[1][0].away.won	= 0

					
					series[rnd+1][1]  = {home: teamNumberTwoC1, away:  teamNumberThreeC1 };
//						series[rnd+1][1]  = {home: topseeds[1], away:  topseeds[2] };
////////////////////////////						series[rnd+1][1]  = {home: topseeds[1], away:  topseeds[2] };
					//series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
					series[1][1].home.seed = 2;
					series[1][1].away.seed = 3;
					series[1][1].home.won	= 0
					series[1][1].away.won	= 0
					
					series[rnd+1][2]  = {home: teamNumberOneC2, away: team1};
/////////////////						series[rnd+1][2]  = {home: topseeds[5], away: team1};
					//series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
					series[1][2].home.seed = 1;
					series[1][2].away.seed = seed1;																
					series[1][2].home.won	= 0
					series[1][2].away.won	= 0

					
					series[rnd+1][3]  = {home: teamNumberTwoC2, away: teamNumberThreeC2};
					//series[0][cid * 4] = {home: teamsConf[0], away: teamsConf[7]};
					series[1][3].home.seed = 2;
					series[1][3].away.seed = 3;
					series[1][3].home.won	= 0
					series[1][3].away.won	= 0


					
				}
				playoffSeries.currentRound += 1;
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
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

						 return dao.teams.put({ot: tx, value: t});
						});
					});
				}).then(function () {
					// Next time, the schedule for the first day of the next round will be set
					newSchedulePlayoffsDay(tx);
				});			
			} else {
				nextRound = [];
				tidsWon = [];
				tidsLost = [];					
				for (i = 0; i < series[rnd].length; i += 2) {
					// Find the two winning teams
					
					//// first round teams 1-3 auto win
					////
	

//                        if (series[rnd][i].home.won === 4) {
					if (series[rnd][i].home.won === gameswon) {
						team1 = helpers.deepCopy(series[rnd][i].home);
						tidsWon.push(series[rnd][i].home.tid);
						tidsLost.push(series[rnd][i].away.tid);
					} else {
						team1 = helpers.deepCopy(series[rnd][i].away);
						tidsWon.push(series[rnd][i].away.tid);
						tidsLost.push(series[rnd][i].home.tid);
					}
//                        if (series[rnd][i + 1].home.won === 4) {
					if (series[rnd][i + 1].home.won === gameswon) {
						team2 = helpers.deepCopy(series[rnd][i + 1].home);
						tidsWon.push(series[rnd][i + 1].home.tid);
						tidsLost.push(series[rnd][i + 1].away.tid);
					} else {
						team2 = helpers.deepCopy(series[rnd][i + 1].away);
						tidsWon.push(series[rnd][i + 1].away.tid);
						tidsLost.push(series[rnd][i + 1].home.tid);
					}

					// here can put int bye teams
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
								t.seasons[s].hype += 0.05;
								if (t.seasons[s].hype > 1) {
									t.seasons[s].hype = 1;
								}
							return dao.teams.put({ot: tx, value: t});
						});
					});
				}).then(function () {
				// Update hype for winning a series
					if (playoffSeries.currentRound == 2) {					
						return Promise.map(tidsLost, function (tid) {
							return dao.teams.get({
								ot: tx,
								key: tid
							}).then(function (t) {
									  var s;

									s = t.seasons.length - 1;
									t.seasons[s].playoffRoundsWon = 1;
									t.seasons[s].hype += 0.05;
									if (t.seasons[s].hype > 1) {
										t.seasons[s].hype = 1;
									}
				// Next time, the schedule for the first day of the next round will be set

							 return dao.teams.put({ot: tx, value: t});
							});
						});
					}	
					
				}).then(function () {
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