/**
 * @name core.season
 * @namespace Somewhat of a hodgepodge. Basically, this is for anything related to a single season that doesn't deserve to be broken out into its own file. Currently, this includes things that happen when moving between phases of the season (i.e. regular season to playoffs) and scheduling. As I write this, I realize that it might make more sense to break up those two classes of functions into two separate modules, but oh well.
 */
define(["dao","db", "globals", "ui", "core/contractNegotiation", "core/draft", "core/finances", "core/freeAgents", "core/player", "core/team" ,"lib/bluebird", "lib/jquery", "lib/underscore", "util/account", "util/eventLog", "util/helpers", "util/message", "util/random"], function (dao,db, g, ui, contractNegotiation, draft, finances, freeAgents, player, team, Promise, $, _, account, eventLog, helpers, message, random) {    "use strict";

    var phaseText;

	//var topseeds;
	 var topseeds = [];
    /**
     * Update g.ownerMood based on performance this season.
     *
     * This is based on three factors: regular season performance, playoff performance, and finances. Designed to be called after the playoffs end.
     * 
     * @memberOf core.season
     * @return {Promise.Object} Resolves to an object containing the changes in g.ownerMood this season.
     */
    function updateOwnerMood() {
        return team.filter({
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

                    return require("core/league").setGameAttributes({ownerMood: ownerMood});
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
     function awards() {
        var awards, awardsByPlayer, saveAwardsByPlayer, tx;

        awards = {season: g.season};

        // [{pid, type}]
        awardsByPlayer = [];

        saveAwardsByPlayer = function (awardsByPlayer) {
            var i, pids, tx;

            pids = _.uniq(_.pluck(awardsByPlayer, "pid"));

            tx = dao.tx("players", "readwrite");
            for (i = 0; i < pids.length; i++) {
                dao.players.iterate({
                    ot: tx,
                    key: pids[i],
                    callback: function (p) {
                        var i;

                        for (i = 0; i < awardsByPlayer.length; i++) {
                            if (p.pid === awardsByPlayer[i].pid) {
                                p.awards.push({season: g.season, type: awardsByPlayer[i].type});
                            }
                        }

                        return p;
                    }
                });
            }
            return tx.complete();
        };


        tx = dao.tx(["players", "playerStats", "releasedPlayers", "teams"]);

        // Get teams for won/loss record for awards, as well as finding the teams with the best records
        return team.filter({
            attrs: ["tid", "abbrev", "region", "name", "cid"],
            seasonAttrs: ["won", "lost", "winp", "playoffRoundsWon"],
            season: g.season,
            sortBy: "winp",
            ot: tx
        }).then(function (teams) {
            var  i, foundEast, foundWest, t;


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
			    var c,sp,fb,sb,ss,tb,lf,cf,rf;
				var j,used;
				var positionsused = [0,0,0,0,0,0,0,0,0];

				
                players = player.filter(players, {
                    attrs: ["pid", "name", "tid", "abbrev", "draft","pos"],
                    ratings: ["ovr","ft","fg","tp","ins","dnk","blk","stl","drb","pss","reb"],					
                    stats: ["gp", "gs", "min", "pts", "trb", "ast", "blk", "stl", "ewa","fg","fta","pf","fgAtRim","war","winP","lossP","save"],
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
                players.sort(function (a, b) {  return (b.ratings.ovr - a.ratings.ovr); }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
//                players.sort(function (a, b) {  return b.stats.ewa - a.stats.ewa; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
                for (i = 0; i < players.length; i++) {
                    // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
                    if (players[i].draft.year === g.season - 1) {
                        break;
                    }
                }
                p = players[i];
                if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
                    awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr};
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Rookie of the Year"});
                }

                // Most Valuable Player
                players.sort(function (a, b) {  return (b.ratings.ins + b.ratings.dnk + b.ratings.fg*.5 - a.ratings.ins - a.ratings.dnk - a.ratings.fg*.5); });
//                players.sort(function (a, b) {  return (b.stats.ewa + 0.1 * b.won) - (a.stats.ewa + 0.1 * a.won); });
//                p = players[0];
			/*	for (i = 0; i < players.length; i++) {
//				for (i = 0; i < 20; i++) {
					   console.log(i);				
					    console.log(p.pos);
					    console.log(p.ratings.ovr);
				
//				    if ((p.pos == "1B") || (p.pos == "2B") || (p.pos == "SS") || (p.pos == "3B") || (p.pos == "LF") || (p.pos == "RF")  || (p.pos == "CF") || (p.pos == "C")) {
				    if ((p.pos == "1B")) {
					    console.log(p.pos);
					    console.log(p.ratings.ovr);
						p = players[i];
						i = players.length;
					}
				}*/
						p = players[0];
				
                awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Most Valuable Player"});
                // Notification unless it's the user's player, in which case it'll be shown below
                if (p.tid !== g.userTid) {
                    eventLog.add(null, {
                        type: "award",
                        text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", p.abbrev]) + '">' + p.abbrev + '</a>) won the Most Valuable Player award.'
                    });
                }
				

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
								_.last(awards.allLeague).players.push({pid: p.pid, pos: p.pos, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr});
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
//				players.sort(function (a, b) {  return  (b.ratings.ovr - a.ratings.ovr) ; });
				players.sort(function (a, b) {  return  (b.ratings.blk - a.ratings.blk + b.ratings.stl - a.ratings.stl + b.ratings.drb - a.ratings.drb + b.ratings.pss - a.ratings.pss + b.ratings.reb - a.ratings.reb) ; });
				for (i = 0; i < players.length; i++) {
//				for (i = 0; i < 20; i++) {
				//	   console.log(i);				
				//	    console.log(p.pos);
				//	    console.log(p.ratings.ovr);
				    if ((p.pos == "SP")) {
				//	    console.log(p.pos);
						p = players[i];
						i = players.length;
					}
				}
                awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Cy Young Award"});
//                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Cy Young AwardDefensive Player of the Year"});

				
				
                // All Defensive Team - same sort as DPOY
				// different sort
                players.sort(function (a, b) {  return b.ratings.fg - a.ratings.fg + b.ratings.tp - a.ratings.tp + b.ratings.ft - a.ratings.ft; });
				
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
								_.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, pos: p.pos, tid: p.tid, abbrev: p.abbrev, ft: p.ratings.ft, fg: p.ratings.fg, tp: p.ratings.tp});
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
                    if (teams[i].playoffRoundsWon === 3) {
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
            var i, p, text, tx;				
                    players = player.filter(players, { // Only the champions, only playoff stats
                        attrs: ["pid", "name", "tid", "abbrev"],
						ratings: ["ovr"],											
                        stats: ["pts", "trb", "ast", "ewa","fg","stl","blk"],
                        season: g.season,
                        playoffs: true,
                        tid: champTid
                    });
					// World Series MVP calc
                    players.sort(function (a, b) {  return  b.ratings.ovr - a.ratings.ovr; });
//                    players.sort(function (a, b) {  return b.statsPlayoffs.ewa - a.statsPlayoffs.ewa; });
                    p = players[0];
                    awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr};
                    awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "World Series MVP"});

             tx = dao.tx("awards", "readwrite");
            dao.awards.put({ot: tx, value: awards});
            return tx.complete().then(function () {
                return saveAwardsByPlayer(awardsByPlayer);
            }).then(function () {

                        // Notifications for awards for user's players
                        tx = dao.tx("events", "readwrite");
                        for (i = 0; i < awardsByPlayer.length; i++) {
                            p = awardsByPlayer[i];
                            if (p.tid === g.userTid) {
                                text = 'Your player <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> ';
                                if (p.type.indexOf("Team") >= 0) {
                                    text += 'made the ' + p.type + '.';
                                } else {
                                    text += 'won the ' + p.type + ' award.';
                                }
                                eventLog.add(tx, {
                                    type: "award",
                                    text: text
                                });
                            }
                        }
                        tx.complete().then(function () {
                            // Achievements after awards
                            account.checkAchievement.hardware_store();
                            account.checkAchievement.sleeper_pick();
                });
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
     * @param {Array} tids A list of lists, each containing the team IDs of the home and
            away teams, respectively, for every game in the season, respectively.
     * @return {Promise}
     */
    function setSchedule(tids) {
        var i, newSchedule, tx;

        newSchedule = [];
        for (i = 0; i < tids.length; i++) {
            newSchedule.push({
                homeTid: tids[i][0],
                awayTid: tids[i][1]
            });
        }

        tx = dao.tx("schedule", "readwrite");

        dao.schedule.clear({ot: tx}).then(function () {
            var i;

            for (i = 0; i < newSchedule.length; i++) {
                dao.schedule.add({
                    ot: tx,
                    value: newSchedule[i]
                });
            }
        });

        return tx.complete();
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
//        var cid, days, dids, game, games, good, i, ii, iters, j, jj, jMax, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tidsInDays, tryNum, used;        
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
      //  random.shuffle(tids);
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
      //  random.shuffleWeek(days);  // Otherwise the most dense days will be at the beginning and the least dense days will be at the end
      //  random.shuffle(days);  // Otherwise the most dense days will be at the beginning and the least dense days will be at the end
        tids = _.flatten(days, true);

        return tids;
    }



    phaseText = {
        "-1": " fantasy draft",
        "0": " preseason",
        "1": " regular season",
        "2": " regular season",
        "3": " playoffs",
        "4": " before draft",
        "5": " draft",
        "6": " after draft",
        "7": " re-sign players",
        "8": " free agency"
    };

    /**
     * Common tasks run after a new phrase is set.
     *
     * This updates the phase, executes a callback, and (if necessary) updates the UI. It should only be called from one of the NewPhase* functions defined below.
     * 
     * @memberOf core.season
     * @param {number} phase Integer representing the new phase of the game (see other functions in this module).
     * @param {string=} url Optional URL to pass to ui.realtimeUpdate for redirecting on new phase. If undefined, then the current page will just be refreshed.
     * @param {Array.<string>=} updateEvents Optional array of strings.
     * @return {Promise}
     */
    function newPhaseFinalize(phase, url, updateEvents) {
        updateEvents = updateEvents !== undefined ? updateEvents : [];

        // Set phase before updating play menu
        return require("core/league").setGameAttributes({phase: phase}).then(function () {
            ui.updatePhase(g.season + phaseText[phase]);
            return ui.updatePlayMenu(null).then(function () {
                // Set lastDbChange last so there is no race condition
                return require("core/league").setGameAttributes({lastDbChange: Date.now()}).then(function () {
                    updateEvents.push("newPhase");
                    ui.realtimeUpdate(updateEvents, url);
                });
            });
        });
    }

    function newPhasePreseason() {
        return freeAgents.autoSign().then(function () { // Important: do this before changing the season or contracts and stats are fucked up
            return require("core/league").setGameAttributes({season: g.season + 1});
        }).then(function () {
                var coachingRanks, scoutingRank, tx;

                coachingRanks = [];

                tx =  dao.tx(["players", "playerStats", "teams"], "readwrite");

                // Add row to team stats and season attributes
             dao.teams.iterate({
                ot: tx,
                callback: function (t) {

                        // Save the coaching rank for later
                        coachingRanks[t.tid] = _.last(t.seasons).expenses.coaching.rank;

                        // Only need scoutingRank for the user's team to calculate fuzz when ratings are updated below.
                        // This is done BEFORE a new season row is added.
                        if (t.tid === g.userTid) {
                            scoutingRank = finances.getRankLastThree(t, "expenses", "scouting");
                        }

                        t = team.addSeasonRow(t);
                        t = team.addStatsRow(t);

                     return t;
                }
            }).then(function () {
                // Loop through all non-retired players
                dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                    callback: function (p) {

                                // Update ratings
                                p = player.addRatingsRow(p, scoutingRank);
                                p = player.develop(p, 1, false, coachingRanks[p.tid]);

                        // Update player values after ratings changes
                        return player.updateValues(tx, p, []).then(function (p) {
                            // Add row to player stats if they are on a team
                            if (p.tid >= 0) {
                                p = player.addStatsRow(tx, p, false);
                            }
                            return p;
                        });
                    }
                });
            });

			return tx.complete().then(function () {


                    if (g.enableLogging && !window.inCordova) {
                        // Google Consumer Surveys
                        TriggerPrompt("http://www.zengm.com/", (new Date()).getTime());
                    }
                 // AI teams sign free agents
                return newPhaseFinalize(g.PHASE.PRESEASON, undefined, ["playerMovement"]);
            });
        });
    }

    function newPhaseRegularSeason() {
        return setSchedule(newSchedule()).then(function () {
            var tx;			
            // First message from owner
            if (g.showFirstOwnerMessage) {
                return message.generate({wins: 0, playoffs: 0, money: 0}).then(function () {
                    return newPhaseFinalize(g.PHASE.REGULAR_SEASON);
                });
            }

            // Spam user with another message?

                        if (localStorage.nagged === "true") {
                            // This used to store a boolean, switch to number
                            localStorage.nagged = "1";
                        }

            tx = dao.tx("messages", "readwrite");
            if (g.season === g.startingSeason + 3 && g.lid > 3 && !localStorage.nagged) {
                dao.messages.add({
                    ot: tx,
                    value: {
                                read: false,
                                from: "The Commissioner",
                                year: g.season,
                                text: '<p>Hi. Sorry to bother you, but I noticed that you\'ve been playing this game a bit. Hopefully that means you like it. Either way, we would really appreciate some feedback so we can make this game better. <a href="mailto:baseball@zengm.com">Send an email</a> (baseball@zengm.com) or <a href="http://www.reddit.com/r/ZenGMBaseball/">join the discussion on Reddit</a>.</p>'
					}
                });
                localStorage.nagged = "1";
            } else if ((localStorage.nagged === "1" && Math.random() < 0.25) || (localStorage.nagged === "2" && Math.random < 0.025)) {
                dao.messages.add({
                    ot: tx,
                    value: {
                                read: false,
                                from: "The Commissioner",
                                year: g.season,
                                text: '<p>Hi. Sorry to bother you again, but if you like the game, please share it with your friends! Also:</p><p><a href="https://twitter.com/ZenGMGames">Follow Zen GM Games on Twitter</a></p><p><a href="https://www.facebook.com/ZenGMGames">Like Zen GM Games on Facebook</a></p><p><a href="http://www.reddit.com/r/ZenGMBaseball/">Discuss Baseball GM on Reddit</a></p><p>The more people that play Baseball GM, the more motivation I have to continue improving it. So it is in your best interest to help me promote the game! If you have any other ideas, please <a href="mailto:baseball@zengm.com">email me</a>.</p>'
					}
                });
				localStorage.nagged = "2";
			}
            return tx.complete().then(function () {
                return newPhaseFinalize(g.PHASE.REGULAR_SEASON);
            });
        });
    }

    function newPhaseAfterTradeDeadline() {
        return newPhaseFinalize(g.PHASE.AFTER_TRADE_DEADLINE);
    }

    function newPhasePlayoffs() {
        // Achievements after regular season
        //account.checkAchievement.septuawinarian();
		account.checkAchievement.supercentenarian();

        // Set playoff matchups
        return team.filter({
            attrs: ["tid", "cid","did"],
            seasonAttrs: ["winp"],
            season: g.season,
            sortBy: "winp"
        }).then(function (teams) {
		
            var cid, i,  row, series, teamsConf, tidPlayoffs, tx,seednumber;

            // Add entry for wins for each team; delete winp, which was only needed for sorting
            for (i = 0; i < teams.length; i++) {
                teams[i].won = 0;
            }

            tidPlayoffs = [];
            series = [[], [], [], []];  // First round, second round, third round, fourth round
			topseeds = [];
		//	topseeds = [[],[]];
			seednumber = 0;
			


			var divTeamRank;
			var divCurrentRank;
			var j,k;
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
			
            for (cid = 0; cid < 2; cid++) {
                teamsConf = [];
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].cid === cid) {
//                        if (teamsConf.length < 8) {
                        //if ( (teamsConf.length < 3)  ){
                        if ( (teamsConf.length < 5)  && (divTeamRank[i] < 2) ){
                            teamsConf.push(teams[i]);
                            tidPlayoffs.push(teams[i].tid);
					//		console.log("seednumber: "+seednumber);
					//		console.log("i: "+i);
					//		console.log("teams[i]: "+teams[i]);
							
                            topseeds.push(teams[i]);
					//		console.log("topseeds[seednumber]: "+topseeds[seednumber]);
							seednumber += 1;
                        }
                    }
                }
				
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].cid === cid) {
//                        if (teamsConf.length < 8) {
                        if ((teamsConf.length < 5) && (divTeamRank[i] > 1)) {
                            teamsConf.push(teams[i]);
                            tidPlayoffs.push(teams[i].tid);
						//	console.log("seednumber: "+seednumber);
						//	console.log("i: "+i);
						//	console.log("teams[i]: "+teams[i]);
							
                            topseeds.push(teams[i]);
						//	console.log("topseeds[seednumber]: "+topseeds[seednumber]);
							seednumber += 1;
                        }
                    }
                }
				
				
				
// removed all but wild card teams
// hope to add rest later in 2nd round
// setother series so they are their for later?, may have display issues this way
// works but needs to be displayed differently
                series[0][0  + cid ] = {home: teamsConf[3], away: teamsConf[4]};
                series[0][0 + cid ].home.seed = 4;
                series[0][0 + cid ].away.seed = 5;
				
                series[1][0  + cid*2 ] = {home: teamsConf[0], away: teamsConf[0]};
                series[1][0 + cid*2 ].home.seed = 1;
                series[1][0 + cid*2 ].away.seed = 1;
				
                series[1][1  + cid*2 ] = {home: teamsConf[1], away: teamsConf[2]};
                series[1][1 + cid*2 ].home.seed = 2;
                series[1][1 + cid*2 ].away.seed = 3;
				
				

// doesn't work
//                series[0][1  + cid*4 ] = {home: teamsConf[3], away: teamsConf[4]};
//                series[0][1 + cid*4 ].home.seed = 4;
//                series[0][1 + cid*4 ].away.seed = 5;
			
            }


			
//            row = {season: g.season, currentRound: 0, series: series};
            row = {season: g.season, currentRound: 0, series: series};
            tx =  dao.tx(["players", "playerStats", "playoffSeries", "teams"], "readwrite");
            dao.playoffSeries.put({value: row});
         //   tx.oncomplete = function () {
          //      var tx;

                if (tidPlayoffs.indexOf(g.userTid) >= 0) {
                    eventLog.add(null, {
                        type: "playoffs",
                        text: 'Your team made <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">the playoffs</a>.'
                    });
                } else {
                    eventLog.add(null, {
                        type: "playoffs",
                        text: 'Your team didn\'t make <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">the playoffs</a>.'
                    });
                }

                // Add row to team stats and team season attributes
         //       tx = g.dbl.transaction(["players", "teams"], "readwrite");
            dao.teams.iterate({
                ot: tx,
                callback: function (t) {
                    var  teamSeason;

                     teamSeason = t.seasons[t.seasons.length - 1];
                        if (tidPlayoffs.indexOf(t.tid) >= 0) {
                            t = team.addStatsRow(t, true);

                            teamSeason.playoffRoundsWon = 0;

                            // More hype for making the playoffs
                            teamSeason.hype += 0.05;
                            if (teamSeason.hype > 1) {
                                teamSeason.hype = 1;
                            }

                         //   cursor.update(t);



                        } else {
                            // Less hype for missing the playoffs
                            teamSeason.hype -= 0.05;
                            if (teamSeason.hype < 0) {
                                teamSeason.hype = 0;
                            }

                        }
                    return t;
                    }
            });
			
			// Add row to player stats
			tidPlayoffs.forEach(function (tid) {
				dao.players.iterate({
					ot: tx,
					index: "tid",
					key: tid,
					callback: function (p) {
						return player.addStatsRow(tx, p, true);
					}
				});
			});			
			
            return tx.complete().then(function () {
                return Promise.all([
                    finances.assessPayrollMinLuxury(),
                    newSchedulePlayoffsDay()
                ]);
            }).then(function () {
                    var url;

                    // Don't redirect if we're viewing a live game now
                    if (location.pathname.indexOf("/live_game") === -1) {
                        url = helpers.leagueUrl(["playoffs"]);
                }
                return newPhaseFinalize(g.PHASE.PLAYOFFS, url, ["teamFinances"]);
            });
        });
    }

    function newPhaseBeforeDraft() {
        var tx;
        // Achievements after playoffs
        /*account.checkAchievement.fo_fo_fo();
        account.checkAchievement["98_degrees"]();
        account.checkAchievement.dynasty();
        account.checkAchievement.dynasty_2();
        account.checkAchievement.dynasty_3();
        account.checkAchievement.moneyball();
        account.checkAchievement.moneyball_2();
        account.checkAchievement.small_market();*/
        account.checkAchievement.fo_fo_fo();
        account.checkAchievement["173_degrees"]();
        account.checkAchievement.dynasty_minor();
        account.checkAchievement.dynasty_major();
        account.checkAchievement.dynasty_3();
        account.checkAchievement.dynasty_4();
        account.checkAchievement.dynasty_5();
        account.checkAchievement.moneyball();
        account.checkAchievement.moneyball_2();
        account.checkAchievement.small_market();		

		
        // Select winners of the season's awards
        return awards().then(function () {

			var releasedPlayersStore, tx;
			
			tx =  dao.tx(["events", "messages", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");

			// Add award for each player on the championship team
			team.filter({
				attrs: ["tid"],
				seasonAttrs: ["playoffRoundsWon"],
				season: g.season,
				ot: tx
			//});							
			}).then(function (teams) {
				var i, tid;

				for (i = 0; i < teams.length; i++) {
					if (teams[i].playoffRoundsWon === 3) {
						tid = teams[i].tid;
						break;
					}
				}

			   dao.players.iterate({
					ot: tx,
					index: "tid",
					key: tid,
					callback: function (p) {
						p.awards.push({season: g.season, type: "Won World Series"});
						return p;
					}
				});
			});					
				var maxAge, minPot;
				
				// Players meeting one of these cutoffs might retire
				maxAge = 34;
				minPot = 40;

			// Do annual tasks for each player, like checking for retirement
            dao.players.iterate({
                ot: tx,
                index: "tid",
                key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                callback: function (p) {
					
				var age, cont, cursor, excessAge, excessPot,p, pot, update;

				update = false;


                    // Get player stats, used for HOF calculation
                    return dao.playerStats.getAll({
                        ot: tx,
                        index: "pid, season, tid",
                        key: IDBKeyRange.bound([p.pid], [p.pid, ''])
                    }).then(function (playerStats) {
                        var age, excessAge, excessPot, pot;

                        age = g.season - p.born.year;
                        pot = p.ratings[p.ratings.length - 1].pot;

						if (age > maxAge || pot < minPot) {
							excessAge = 0;
							if (age > 34 || p.tid === g.PLAYER.FREE_AGENT) {  // Only players older than 34 or without a contract will retire
								if (age > 34) {
									excessAge = (age - 34) / 20;  // 0.05 for each year beyond 34
								}
								excessPot = (40 - pot) / 50;  // 0.02 for each potential rating below 40 (this can be negative)
								if (excessAge + excessPot + random.gauss(0, 1) > 0) {
									p = player.retire(tx, p, playerStats);
									update = true;
								}
							}
						}

						// Update "free agent years" counter and retire players who have been free agents for more than one years
						if (p.tid === g.PLAYER.FREE_AGENT) {
							if (p.yearsFreeAgent >= 1) {
								p = player.retire(tx, p, playerStats);
							} else {
								p.yearsFreeAgent += 1;
							}
							p.contract.exp += 1;
							update = true;
						} else if (p.tid >= 0 && p.yearsFreeAgent > 0) {
							p.yearsFreeAgent = 0;
							update = true;
						}

						// Heal injures
						if (p.injury.type !== "Healthy") {
							if (p.injury.gamesRemaining <= 162) {
								p.injury = {type: "Healthy", gamesRemaining: 0};
							} else {
								p.injury.gamesRemaining -= 162;
							}
							update = true;
						}
		//				console.log("b p.energy: "+p.energy)
						if (p.energy<100) {
							p.energy = 100;
							update = true;
						}
			//			console.log("a p.energy: "+p.energy)
						// Update player in DB, if necessary
                      // Update player in DB, if necessary
                        if (update) {
                            return p;
                        }
                    });
                }
            });
           // Remove released players' salaries from payrolls if their contract expired this year
            dao.releasedPlayers.iterate({
                ot: tx,
                index: "contract.exp",
                key: IDBKeyRange.upperBound(g.season),
                callback: function (rp) {
                    dao.releasedPlayers.delete({
                        ot: tx,
                        key: rp.rid
                    });
                }
            });

            return tx.complete().then(function () {
                // Update strategies of AI teams (contending or rebuilding)
                return team.updateStrategies();
            }).then(updateOwnerMood).then(message.generate).then(function () {
                var url;

                // Don't redirect if we're viewing a live game now
                if (location.pathname.indexOf("/live_game") === -1) {
                    url = helpers.leagueUrl(["history"]);
                }

                return newPhaseFinalize(g.PHASE.BEFORE_DRAFT, url, ["playerMovement"]);
            }).then(function () {


                            helpers.bbgmPing("season");
             });
        });
    }

    function newPhaseDraft() {
        return draft.genOrder().then(function () {
            var tx;

            // This is a hack to handle weird cases where players have draft.year set to the current season, which fucks up the draft UI
            tx = dao.tx("players", "readwrite");
            dao.players.iterate({
                ot: tx,
                index: "draft.year",
                key: g.season,
                callback: function (p) {
                    if (p.tid >= 0) {
                        p.draft.year -= 1;
                        return p;
                    }
                }
            });
            return tx.complete();
        }).then(function () {
            return newPhaseFinalize(g.PHASE.DRAFT, helpers.leagueUrl(["draft"]));
        });
    }

    function newPhaseAfterDraft() {

        var round, t, tx,tid;

        // Add a new set of draft picks
        tx = dao.tx("draftPicks", "readwrite");

        // Add a new set of draft picks
        for (tid = 0; tid < g.numTeams; tid++) {
            for (round = 1; round <= 5; round++) {
                dao.draftPicks.add({
                    ot: tx,
                    value: {
                        tid: tid,
                        originalTid: tid,
                        round: round,
                        season: g.season + 4
                    }
                });
            }
        }

        return tx.complete().then(function () {
            return newPhaseFinalize(g.PHASE.AFTER_DRAFT, undefined, ["playerMovement"]);
        });
    }
	
	
     function newPhaseResignPlayers() {
        var tx;

        tx = dao.tx(["gameAttributes", "messages", "negotiations", "players", "teams"], "readwrite");

        player.genBaseMoods(tx).then(function (baseMoods) {
            // Re-sign players on user's team, and some AI players
            dao.players.iterate({
                ot: tx,
                index: "tid",
                key: IDBKeyRange.lowerBound(0),
                callback: function (p) {
                    if (p.contract.exp <= g.season && p.tid === g.userTid) {
                        // Add to free agents first, to generate a contract demand
                        return player.addToFreeAgents(tx, p, g.PHASE.RESIGN_PLAYERS, baseMoods).then(function () {
                            // Open negotiations with player
                            return contractNegotiation.create(tx, p.pid, true).then(function (error) {
                                if (error !== undefined && error) {
                                    eventLog.add(null, {
                                        type: "refuseToSign",
                                        text: error
                                    });
                                }
                            });
                        });
                    }
                }
            });
        });

        return tx.complete().then(function () {
            // Set daysLeft here because this is "basically" free agency, so some functions based on daysLeft need to treat it that way (such as the trade AI being more reluctant)
            return require("core/league").setGameAttributes({daysLeft: 30});
        }).then(function () {
            return newPhaseFinalize(g.PHASE.RESIGN_PLAYERS, helpers.leagueUrl(["negotiation"]), ["playerMovement"]);
        });
    }

    function newPhaseFreeAgency() {
            var strategies;		
        return team.filter({
            attrs: ["strategy"],
            season: g.season
        }).then(function (teams) {

            strategies = _.pluck(teams, "strategy");

            // Delete all current negotiations to resign players
            return contractNegotiation.cancelAll();
        }).then(function () {
            var tx;

            tx = dao.tx(["players", "teams"], "readwrite");

                player.genBaseMoods(tx).then(function (baseMoods) {
                // Reset contract demands of current free agents and undrafted players
                return dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: IDBKeyRange.bound(g.PLAYER.UNDRAFTED, g.PLAYER.FREE_AGENT), // This only works because g.PLAYER.UNDRAFTED is -2 and g.PLAYER.FREE_AGENT is -1
                    callback: function (p) {
                        return player.addToFreeAgents(tx, p, g.PHASE.FREE_AGENCY, baseMoods);
                    }
                }).then(function () {
                    // AI teams re-sign players or they become free agents
                    // Run this after upding contracts for current free agents, or addToFreeAgents will be called twice for these guys
                    return dao.players.iterate({
                        ot: tx,
                        index: "tid",
                        key: IDBKeyRange.lowerBound(0),
                        callback: function (p) {
                            var contract, factor;

                            if (p.contract.exp <= g.season && p.tid !== g.userTid) {
                                    // Automatically negotiate with teams
                                    if (strategies[p.tid] === "rebuilding") {
                                        factor = 0.4;
                                    } else {
                                        factor = 0;
                                    }

                                    if (Math.random() < p.value / 100 - factor) { // Should eventually be smarter than a coin flip
                                        contract = player.genContract(p);
                                        contract.exp += 1; // Otherwise contracts could expire this season
                                        p = player.setContract(p, contract, true);
                                        p.gamesUntilTradable = 15;
                                        return p; // Other endpoints include calls to addToFreeAgents, which handles updating the database
									}

									return player.addToFreeAgents(tx, p, g.PHASE.RESIGN_PLAYERS, baseMoods);
							}
                        }
                    });
                });
            }).then(function () {
                // Bump up future draft classes (nested so tid updates don't cause race conditions)
                dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: g.PLAYER.UNDRAFTED_2,
                    callback: function (p) {
                        p.tid = g.PLAYER.UNDRAFTED;
                        p.ratings[0].fuzz /= 2;
                        return p;
                    }
                }).then(function () {
                    dao.players.iterate({
                        ot: tx,
                        index: "tid",
                        key: g.PLAYER.UNDRAFTED_3,
                        callback: function (p) {
                            p.tid = g.PLAYER.UNDRAFTED_2;
                            p.ratings[0].fuzz /= 2;
                            return p;
                        }
                    });
                });
            });

            return tx.complete().then(function () {
                // Create new draft class for 3 years in the future
                return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3);
            }).then(function () {
                return newPhaseFinalize(g.PHASE.FREE_AGENCY, helpers.leagueUrl(["free_agents"]), ["playerMovement"]);
            });
        });
    }

    function newPhaseFantasyDraft(position) {
        return contractNegotiation.cancelAll().then(function () {
            return draft.genOrderFantasy(position);
        }).then(function () {
            return require("core/league").setGameAttributes({nextPhase: g.phase});
        }).then(function () {
            var tx;

            tx = dao.tx(["players", "releasedPlayers"], "readwrite");

            // Protect draft prospects from being included in this
            dao.players.iterate({
                ot: tx,
                index: "tid",
                key: g.PLAYER.UNDRAFTED,
                callback: function (p) {
                    p.tid = g.PLAYER.UNDRAFTED_FANTASY_TEMP;
                    return p;
                }
            }).then(function () {
                // Make all players draftable
                dao.players.iterate({
                    ot: tx,
                    index: "tid",
                    key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                    callback: function (p) {
                        p.tid = g.PLAYER.UNDRAFTED;
                        return p;
                    }
                });
            });

            // Delete all records of released players
            dao.releasedPlayers.clear({ot: tx});

            return tx.complete();
        }).then(function () {
            return newPhaseFinalize(g.PHASE.FANTASY_DRAFT, helpers.leagueUrl(["draft"]), ["playerMovement"]);
        });
    }

    /**
     * Set a new phase of the game.
     *
     * This function is called to do all the crap that must be done during transitions between phases of the game, such as moving from the regular season to the playoffs. Phases are defined in the g.PHASE.* global variables. The phase update may happen asynchronously if the database must be accessed, so do not rely on g.phase being updated immediately after this function is called. Instead, pass a callback.
     * 
     * @memberOf core.season
     * @param {} extra Parameter containing extra info to be passed to phase changing function. Currently only used for newPhaseFantasyDraft.
     * @return {Promise}
     */
    function newPhase(phase, extra) {
        // Prevent code running twice
        if (phase === g.phase) {
            return;
        }

        // Prevent new phase from being clicked twice by deleting all options from the play menu. The options will be restored after the new phase is set or if there is an error by calling ui.updatePlayMenu.
        g.vm.topMenu.options([]);

        if (phase === g.PHASE.PRESEASON) {
            return newPhasePreseason();
        } else if (phase === g.PHASE.REGULAR_SEASON) {
            return newPhaseRegularSeason();
        } else if (phase === g.PHASE.AFTER_TRADE_DEADLINE) {
            return newPhaseAfterTradeDeadline();
        } else if (phase === g.PHASE.PLAYOFFS) {
            return newPhasePlayoffs();
        } else if (phase === g.PHASE.BEFORE_DRAFT) {
            return newPhaseBeforeDraft();
        } else if (phase === g.PHASE.DRAFT) {
            return newPhaseDraft();
        } else if (phase === g.PHASE.AFTER_DRAFT) {
            return newPhaseAfterDraft();
        } else if (phase === g.PHASE.RESIGN_PLAYERS) {
            return newPhaseResignPlayers();
        } else if (phase === g.PHASE.FREE_AGENCY) {
            return newPhaseFreeAgency();
        } else if (phase === g.PHASE.FANTASY_DRAFT) {
            return newPhaseFantasyDraft( extra);
        }
    }

    /*Creates a single day's schedule for an in-progress playoffs.*/
    function newSchedulePlayoffsDay(cb) {
            var  i,numGames, playoffSeries, rnd, series,tids, tx;		
      //      var cursor, i, matchup, nextRound, numGames, playoffSeries, rnd, series, team0, team1,team2, tids, tidsWon;
			var gameswon;		
		
        tx = dao.tx(["playoffSeries", "teams"], "readwrite");

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
			var cursor, key, matchup, nextRound, team0, team1, team2,team3,team4,tidsWon; 			
			var seedNumber;
			var teamNumberOneC1;
			var teamNumberOneC2;
			var teamNumberTwoC1;
			var teamNumberTwoC2;
			var teamNumberThreeC1;
			var teamNumberThreeC2;
				
			if (tids.length > 0) {
                return setSchedule(tids);
            } 
                // The previous round is over. Either make a new round or go to the next phase.

                // Record who won the league or conference championship
               /* if (rnd === 3) {
                    tx.objectStore("teams").openCursor(series[rnd][0].home.tid).onsuccess = function (event) {
                        var cursor, t, teamSeason;

                        cursor = event.target.result;
                        t = cursor.value;
                        teamSeason = _.last(t.seasons);
                        if (series[rnd][0].home.won === 4) {						   
//                            teamSeason.playoffRoundsWon = 4; 
                            teamSeason.playoffRoundsWon += 1;
                            teamSeason.hype += 0.05;
                            if (teamSeason.hype > 1) {
                                teamSeason.hype = 1;
                            }
                        }
						console.log("1 says how many wins: " +teamSeason.winP)						
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
						console.log("2 says how many wins: " +teamSeason.winP)
                        cursor.update(t);
                    };
                    tx.oncomplete = function () {
                        newPhase(g.PHASE.BEFORE_DRAFT).then(resolve);
                    };*/
					
				if (rnd === 3) {
						if (series[rnd][0].home.won === 4) {
							key = series[rnd][0].home.tid;
						} else if (series[rnd][0].away.won === 4) {
							key = series[rnd][0].away.tid;
						}
						dao.teams.iterate({
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
						});
						return tx.complete().then(function () {
							return newPhase(g.PHASE.BEFORE_DRAFT);
						});
					}					
					
               if (rnd === 0){
                    nextRound = [];
                    tidsWon = [];
					var seed0,seed1;
					var teamBug0,teamBug1;
//                    for (i = 0; i < series[rnd].length; i += 2) {
// prior round was only 2 games, instead of 8
                    for (i = 0; i < 2; i += 2) {
                        // Find the two winning teams
						
						//// first round teams 1-3 auto win
	
  
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
                    dao.playoffSeries.put({ot: tx, value: playoffSeries});

                    // Update hype for winning a series
                    for (i = 0; i < tidsWon.length; i++) {
						dao.teams.get({
							ot: tx,
							key: tidsWon[i]
						}).then(function (t) {
							  var s;

							s = t.seasons.length - 1;
							t.seasons[s].playoffRoundsWon += 0;
							t.seasons[s].hype += 0.05;
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							dao.teams.put({ot: tx, value: t});
						});
					}
					// Next time, the schedule for the first day of the next round will be set
					return tx.complete().then(newSchedulePlayoffsDay);					
                } else {
                    nextRound = [];
                    tidsWon = [];
                    for (i = 0; i < series[rnd].length; i += 2) {
                        // Find the two winning teams
						
						//// first round teams 1-3 auto win
						////
				/*	  if ((rnd==0) && (i==0)) {
					     series[rnd][i].home.won = 4;
					  } 
					  if ((rnd==0) && (i==1)) {
					     series[rnd][i].home.won = 4;
					  } 
					  if ((rnd==0) && (i==2)) {
					     series[rnd][i].home.won = 4;
					  } */
  
//                        if (series[rnd][i].home.won === 4) {
                        if (series[rnd][i].home.won === gameswon) {
                            team1 = helpers.deepCopy(series[rnd][i].home);
                            tidsWon.push(series[rnd][i].home.tid);
                        } else {
                            team1 = helpers.deepCopy(series[rnd][i].away);
                            tidsWon.push(series[rnd][i].away.tid);
                        }
//                        if (series[rnd][i + 1].home.won === 4) {
                        if (series[rnd][i + 1].home.won === gameswon) {
                            team2 = helpers.deepCopy(series[rnd][i + 1].home);
                            tidsWon.push(series[rnd][i + 1].home.tid);
                        } else {
                            team2 = helpers.deepCopy(series[rnd][i + 1].away);
                            tidsWon.push(series[rnd][i + 1].away.tid);
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
                    for (i = 0; i < tidsWon.length; i++) {
						dao.teams.get({
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
						dao.teams.put({ot: tx, value: t});
						});
					}

				// Next time, the schedule for the first day of the next round will be set
				return tx.complete().then(newSchedulePlayoffsDay);
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
        newPhase: newPhase,
        getSchedule: getSchedule,
        setSchedule: setSchedule,				
        newSchedule: newSchedule,
        newSchedulePlayoffsDay: newSchedulePlayoffsDay,
        getDaysLeftSchedule: getDaysLeftSchedule,
        phaseText: phaseText
    };
});