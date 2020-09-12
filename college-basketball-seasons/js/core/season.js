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
     * @return {Promise.Object} Resolves to an object containing the changes in g.ownerMood this season.
     */
    function updateOwnerMood() {
        return team.filter({
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
            } else if (t.playoff64RoundsWon < 6) {
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
				ratings: ["ovr","stl","blk","reb"],					
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
//            players.sort(function (a, b) {  return b.stats.ewa - a.stats.ewa; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
            players.sort(function (a, b) {  return b.ratings.ovr - a.ratings.ovr; }); // Same formula as MVP, but no wins because some years with bad rookie classes can have the wins term dominate EWA
            for (i = 0; i < players.length; i++) {
                // This doesn't factor in players who didn't start playing right after being drafted, because currently that doesn't really happen in the game.
                if (players[i].draft.year === g.season - 1) {
                    break;
                }
            }
            p = players[i];
            if (p !== undefined) { // I suppose there could be no rookies at all.. which actually does happen when skip the draft from the debug menu
                awards.roy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr};
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Freshman of the Year"});
            }

            // Most Valuable Player
//            players.sort(function (a, b) {  return (b.stats.ewa + 0.1 * b.won) - (a.stats.ewa + 0.1 * a.won); });
            players.sort(function (a, b) {  return (b.ovr + 0.1 * b.won) - (a.ovr + 0.1 * a.won); });
            p = players[0];
		//	console.log("p.stats.pts: "+p.stats.pts )
		//	console.log("players[100].stats.pts: "+players[100].stats.pts )
		//	console.log("players[200].stats.pts: "+players[200].stats.pts )
            awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Player of the Year"});
            // Notification unless it's the user's player, in which case it'll be shown below
            if (p.tid !== g.userTid) {
                eventLog.add(null, {
                    type: "award",
                    text: '<a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> (<a href="' + helpers.leagueUrl(["roster", p.abbrev]) + '">' + p.abbrev + '</a>) won the Player of the Year award.'
                });
            }

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
                _.last(awards.allLeague).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr});
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
            }

            // Defensive Player of the Year
//            players.sort(function (a, b) {  return b.ovr+(b.reb+b.stl+b.blk)*.33 - a.ovr - (a.stl + a.blk + a.reb)*.33; });
            players.sort(function (a, b) {  return (b.ratings.reb+b.ratings.stl+b.ratings.blk)*.33 -  (a.ratings.stl + a.ratings.blk + a.ratings.reb)*.33; });
            p = players[0];
            awards.dpoy = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr, reb: p.ratings.reb, stl: p.ratings.stl, blk: p.ratings.blk};
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
                _.last(awards.allDefensive).players.push({pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, ovr: p.ratings.ovr, reb: p.ratings.reb, stl: p.ratings.stl, blk: p.ratings.blk});
                awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: type});
            }
            console.log(awardsByPlayer.length);
            for (i = 0; i < awardsByPlayer.length; i++) {
				console.log(awardsByPlayer[i].type);
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
            var p, tx;

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

            tx = dao.tx("awards", "readwrite");
            dao.awards.put({ot: tx, value: awards});
            return tx.complete().then(function () {
                return saveAwardsByPlayer(awardsByPlayer);
            }).then(function () {
                var i, p, text, tx;

                // None of this stuff needs to block, it's just notifications of crap

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
              //      account.checkAchievement.sleeper_pick();
                });
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
    function awards64() {
	

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

			///////////////////
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
            players.sort(function (a, b) {  return (b.stats.ewa + 0.1 * b.won) - (a.stats.ewa + 0.1 * a.won); });
            p = players[0];
		//	console.log("p.stats.pts: "+p.stats.pts )
		//	console.log("players[100].stats.pts: "+players[100].stats.pts )
		//	console.log("players[200].stats.pts: "+players[200].stats.pts )
            awards.mvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.stats.pts, trb: p.stats.trb, ast: p.stats.ast};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "Player of the Year"});
            // Notification unless it's the user's player, in which case it'll be shown below
         /*   if (p.tid !== g.userTid) {
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
			
			
			
			///////////////////
        
            // Finals MVP - most WS in playoffs
            for (i = 0; i < teams.length; i++) {
                if (teams[i].playoff64RoundsWon === 6) {
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
            var p, tx;

            players = player.filter(players, { // Only the champions, only playoff stats
                attrs: ["pid", "name", "tid", "abbrev"],
                stats: ["pts", "trb", "ast", "ewa"],
                season: g.season,
                playoffs: true,
                tid: champTid
            });
            players.sort(function (a, b) {  return b.statsPlayoffs.ewa - a.statsPlayoffs.ewa; });
            p = players[0];
            awards.finalsMvp = {pid: p.pid, name: p.name, tid: p.tid, abbrev: p.abbrev, pts: p.statsPlayoffs.pts, trb: p.statsPlayoffs.trb, ast: p.statsPlayoffs.ast};
            awardsByPlayer.push({pid: p.pid, tid: p.tid, name: p.name, type: "National Tournament MVP"});

            tx = dao.tx("awards", "readwrite");
            dao.awards.put({ot: tx, value: awards});
            return tx.complete().then(function () {
          //      return saveAwardsByPlayer(awardsByPlayer);
            }).then(function () {
                var i, p, text, tx;

                // None of this stuff needs to block, it's just notifications of crap

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
     * This makes an NBA-like schedule in terms of conference matchups, division matchups, and home/away games.
     *
     * @memberOf core.season
     * @return {Array.<Array.<number>>} All the season's games. Each element in the array is an array of the home team ID and the away team ID, respectively.
     */
    function newScheduleDefault(teams) {
        var cid, dids, game, games, good, i, ii, iters, j, jj, k, matchup, matchups, n, newMatchup, t, teams, tids, tidsByConf, tryNum;
		var tryNum2
     //   teams = helpers.getTeamsDefault(); // Only tid, cid, and did are used, so this is okay for now. But if someone customizes cid and did, this will break. To fix that, make this function require DB access (and then fix the tests). Or even better, just accept "teams" as a param to this function, then the tests can use default values and the real one can use values from the DB.

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
        if (g.numTeams === 320) {
//        if (g.numTeams === 30) {
           tids = newScheduleDefault(teams);
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
	
	

    phaseText = {
        "-1": " fantasy draft",
        "0": " preseason",
        "1": " regular season",
        "2": " regular season",
        "3": " CT",
//        "3": " playoffs",
//        "4": " before draft",
//        "4": " playoffs",
        "4": " CT summary",
//        "4": " NT",
//        "5": " draft",
 //       "6": " after draft",
  //      "7": " re-sign players",
        "5": " NT",
        "6": " NT summary",
//        "6": " message",
        "7": " recruiting",
        "8": " free agency8",
        "9": " free agency9",
        "10": " recruiting old"
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
	    //  console.log("newPhasePreseason (before autoSign): "+newPhasePreseason);
        return freeAgents.autoSign().then(function () { // Important: do this before changing the season or contracts and stats are fucked up
            return require("core/league").setGameAttributes({season: g.season + 1});
        }).then(function () {
            var coachingRanks, scoutingRank, tx;

            coachingRanks = [];

            tx = dao.tx(["players", "playerStats", "teams"], "readwrite");

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
                    ads.show();
                }

                // AI teams sign free agents
                return newPhaseFinalize(g.PHASE.PRESEASON, undefined, ["playerMovement"]);
            });
        });
    }

    function newPhaseRegularSeason() {
	
	
		return team.checkRosterSizes().then(function (userTeamSizeError) {
			//	console.log("size check");
				if (userTeamSizeError === null) {
			//		console.log("size fine");
				//	return newPhaseRegularSeason();
				} else {
				//	console.log("error");
					ui.updateStatus("Idle");
					helpers.errorNotify(userTeamSizeError);
				//	console.log("error");
				//	phase = g.PHASE.PRESEASON
				//	return newPhasePreseason();
					return newPhaseFinalize(g.PHASE.PRESEASON, undefined, ["playerMovement"]);
				}	
	
			return team.filter({
				attrs: ["tid","did", "cid"],
				season: g.season
	//            ot: tx
			}).then(function (teams) {		
	
				return setSchedule(newSchedule(teams)).then(function () {
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
								text: '<p>Hi. Sorry to bother you, but I noticed that you\'ve been playing this game a bit. Hopefully that means you like it. Either way, we would really appreciate some feedback so we can make this game better. <a href="mailto:commissioner@basketball-gm.com">Send an email</a> (baseball@zengm.com) or <a href="http://www.reddit.com/r/ZenGMBasketballCoach/">join the discussion on Reddit</a>.</p>'
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
								text: '<p>Hi. Sorry to bother you again, but if you like the game, please share it with your friends! Also:</p><p><a href="https://twitter.com/ZenGMGames">Follow Zen GM on Twitter</a></p><p><a href="https://www.facebook.com/ZenGMGames">Like Zen GM on Facebook</a></p><p><a href="http://www.reddit.com/r/ZenGMBasketballCoach/">Discuss College Basketball Coach on Reddit</a></p><p>The more people that play College Basketball Coach, the more motivation I have to continue improving it. So it is in your best interest to help me promote the game! If you have any other ideas, please <a href="mailto:baseball@zengm.com">email me</a>.</p>'
							}
						});
						localStorage.nagged = "2"; 
			   /*     } else if ((localStorage.nagged === "2" && Math.random() < 0.25) || (localStorage.nagged === "3" && Math.random < 0.025)) {
						_gaq.push(["_trackEvent", "Ad Display", "DraftKings"]);
						dao.messages.add({
							ot: tx,
							value: {
								read: false,
								from: "The Commissioner",
								year: g.season,
								text: '<p>DraftKings is a great new way to play fantasy sports and win money. They are running a special promotion for Basketball GM players: they\'ll waive the entry fee for a $30k fantasy NBA pool and match your first deposit for free! All you have to do is draft the best 8 player team. Your Basketball GM experience may prove to be useful!</p><p><a href="https://www.draftkings.com/gateway?s=640365236"><img src="/img/dk-logo.png"></a></p><p>And better yet, by signing up through <a href="https://www.draftkings.com/gateway?s=640365236">this link</a>, you will be supporting Basketball GM. So even if you\'re not totally sure if you want to try DraftKings, give it a shot as a personal favor to me. In return, I will continue to improve this free game that you\'ve spent hours playing - there is some cool stuff in the works, stay tuned!</p>'
							}
						});
						localStorage.nagged = "3"; */
					}
					return tx.complete().then(function () {
						return newPhaseFinalize(g.PHASE.REGULAR_SEASON);
					});
				});
			});		
		});		
    }

    function newPhaseAfterTradeDeadline() {
        return newPhaseFinalize(g.PHASE.AFTER_TRADE_DEADLINE);
    }

    function newPhasePlayoffs() {
        // Achievements after regular season
        account.checkAchievement.septuawinarian();

        // Set playoff matchups
        return team.filter({
            attrs: ["tid", "cid","did"],
//            seasonAttrs: ["winp"],
            seasonAttrs: ["wonConf","winpConf","winp"],
            season: g.season,
            sortBy: ["winpConf","winp"]			
//            sortBy: "wonConf"
//            sortBy: "winp"			
        }).then(function (teams) {
            var cid,did, i, row, series, teamsConf, tidPlayoffs, tx;

            // Add entry for wins for each team; delete winp, which was only needed for sorting
            for (i = 0; i < teams.length; i++) {
                teams[i].won = 0;
            }

            tidPlayoffs = [];
            series = [[], [], [], []];  // First round, second round, third round, fourth round
//            for (cid = 0; cid < 4; cid++) {
            for (did = 0; did < 40; did++) {
                teamsConf = [];
                for (i = 0; i < teams.length; i++) {
                    if (teams[i].did === did) {
//                        if (teamsConf.length < 8) {
                        if (teamsConf.length < 10) {
                            teamsConf.push(teams[i]);
                            tidPlayoffs.push(teams[i].tid);
                        }
                    }
                }
				
                       series[0][did * 4] = {home: teamsConf[0], away: teamsConf[7]};
                        series[0][did * 4].away.seed = 8;
                        series[0][did * 4].home.seed = 1;
                        series[0][1 + did * 4] = {home: teamsConf[3], away: teamsConf[4]};
                        series[0][1 + did * 4].away.seed = 5;
                        series[0][1 + did * 4].home.seed = 4;
                        series[0][2 + did * 4] = {home: teamsConf[2], away: teamsConf[5]};
                        series[0][2 + did * 4].away.seed = 6;
                        series[0][2 + did * 4].home.seed = 3;
                        series[0][3 + did * 4] = {home: teamsConf[1], away: teamsConf[6]};
                        series[0][3 + did * 4].away.seed = 7;
                        series[0][3 + did * 4].home.seed = 2;
			
          /*      series[0][cid * 8] = {home: teamsConf[0], away: teamsConf[15]};
                series[0][cid * 8].home.seed = 1;
                series[0][cid * 8].away.seed = 16;
                series[0][1 + cid * 8] = {home: teamsConf[7], away: teamsConf[8]};
                series[0][1 + cid * 8].home.seed = 8;
                series[0][1 + cid * 8].away.seed = 9;
                series[0][2 + cid * 8] = {home: teamsConf[3], away: teamsConf[12]};
                series[0][2 + cid * 8].home.seed = 4;
                series[0][2 + cid * 8].away.seed = 13;
                series[0][3 + cid * 8] = {home: teamsConf[4], away: teamsConf[11]};
                series[0][3 + cid * 8].home.seed = 5;
                series[0][3 + cid * 8].away.seed = 12;
                series[0][4 + cid * 8] = {home: teamsConf[1], away: teamsConf[14]};
                series[0][4 + cid * 8].home.seed = 2;
                series[0][4 + cid * 8].away.seed = 15;
                series[0][5 + cid * 8] = {home: teamsConf[6], away: teamsConf[9]};
                series[0][5 + cid * 8].home.seed = 7;
                series[0][5 + cid * 8].away.seed = 10;
                series[0][6 + cid * 8] = {home: teamsConf[2], away: teamsConf[13]};
                series[0][6 + cid * 8].home.seed = 3;
                series[0][6 + cid * 8].away.seed = 14;
                series[0][7 + cid * 8] = {home: teamsConf[5], away: teamsConf[10]};
                series[0][7 + cid * 8].home.seed = 6;
                series[0][7 + cid * 8].away.seed = 11;*/
            }

            row = {season: g.season, currentRound: 0, series: series};
            tx = dao.tx(["players", "playerStats", "playoffSeries", "teams"], "readwrite");
            dao.playoffSeries.put({value: row});

          /*  if (tidPlayoffs.indexOf(g.userTid) >= 0) {
                eventLog.add(null, {
                    type: "playoffs",
                    text: 'Your team made <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">the playoffs</a>.'
                });
            } else {
                eventLog.add(null, {
                    type: "playoffs",
                    text: 'Your team didn\'t make <a href="' + helpers.leagueUrl(["playoffs", g.season]) + '">the playoffs</a>.'
                });
            }*/

            // Add row to team stats and team season attributes
            dao.teams.iterate({
                ot: tx,
                callback: function (t) {
                    var teamSeason;

                    teamSeason = t.seasons[t.seasons.length - 1];

                    if (tidPlayoffs.indexOf(t.tid) >= 0) {
                        t = team.addStatsRow(t, true);

                        teamSeason.playoffRoundsWon = 0;

                        // More hype for making the playoffs
                  //      teamSeason.hype += 0.05;
                        teamSeason.hype *= 0.94;
                        teamSeason.hype += 0.010;				  
                        if (teamSeason.hype > 1) {
                            teamSeason.hype = 1;
                        }
                    } else {
                        // Less hype for missing the playoffs
                   //     teamSeason.hype -= 0.05;
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

    function newPhaseBeforePlayoff64() {
        var tx;

        // Achievements after playoffs
   /*     account.checkAchievement.fo_fo_fo();
        account.checkAchievement["98_degrees"]();
        account.checkAchievement.dynasty();
        account.checkAchievement.dynasty_2();
        account.checkAchievement.dynasty_3();
        account.checkAchievement.moneyball();
        account.checkAchievement.moneyball_2();
        account.checkAchievement.small_market(); */

        // Select winners of the season's awards
        return awards().then(function () {
            tx = dao.tx(["events", "messages", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");

            // Add award for each player on the championship team
            return team.filter({
                attrs: ["tid"],
                seasonAttrs: ["playoffRoundsWon"],
                season: g.season,
                ot: tx
            });
        }).then(function (teams) {
            var i, maxAge, minPot, tid;

            // Give award to all players on the championship team
            for (i = 0; i < teams.length; i++) {
                if (teams[i].playoffRoundsWon === 4) {
                    tid = teams[i].tid;
					dao.players.iterate({
						ot: tx,
						index: "tid",
						key: tid,
						callback: function (p) {
							p.awards.push({season: g.season, type: "Won CT"});
							return p;
						}
					});					
                }
            }


            // Do annual tasks for each player, like checking for retirement

            // Players meeting one of these cutoffs might retire
       //     maxAge = 34;
       //     minPot = 40;
/*
            dao.players.iterate({
                ot: tx,
                index: "tid",
                key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                callback: function (p) {
                    var update;

                    update = false;

                    // Get player stats, used for HOF calculation
                    return dao.playerStats.getAll({
                        ot: tx,
                        index: "pid, season, tid",
                        key: IDBKeyRange.bound([p.pid], [p.pid, ''])
                    }).then(function (playerStats) {
                        var age, excessAge, excessPot, pot;

//                        age = g.season - p.born.year;
  //                      pot = p.ratings[p.ratings.length - 1].pot;

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
                            if (p.injury.gamesRemaining <= 82) {
                                p.injury = {type: "Healthy", gamesRemaining: 0};
                            } else {
                                p.injury.gamesRemaining -= 82;
                            }
                            update = true;
                        } 

                        // Update player in DB, if necessary
                        if (update) {
                            return p;
                        }
                    });
                }
            }); */

            // Remove released players' salaries from payrolls if their contract expired this year
        /*    dao.releasedPlayers.iterate({
                ot: tx,
                index: "contract.exp",
                key: IDBKeyRange.upperBound(g.season),
                callback: function (rp) {
                    dao.releasedPlayers.delete({
                        ot: tx,
                        key: rp.rid
                    });
                }
            }); */
            return tx.complete().then(function () {
                // Update strategies of AI teams (contending or rebuilding)
                return team.updateStrategies();
				

				
//            }).then(updateOwnerMood).then(message.generate).then(function () {
//            }).then(updateOwnerMood).then(function () {
            }).then(function () {
                var url;

                // Don't redirect if we're viewing a live game now
                if (location.pathname.indexOf("/live_game") === -1) {
                    url = helpers.leagueUrl(["history"]);
                }

                return newPhaseFinalize(g.PHASE.BEFORE_PLAYOFFS64, url, ["teamFinances"]);
            }).then(function () {
               // helpers.bbgmPing("season");
            }); 
		/*	return tx.complete().then(function ()
            }).then(function () {
 

                var url;

				if (location.pathname.indexOf("/live_game") === -1) {
                    url = helpers.leagueUrl(["history"]);
                }
		        return newPhaseFinalize(g.PHASE.BEFORE_PLAYOFFS64, url);
			});*/
			
        });
    }	
	

    function newPhasePlayoffs64() {
        // Achievements after regular season
      //      console.log("did it even get here?");
	//		account.checkAchievement.septuawinarian();
			account.checkAchievement.small_market();
        // Set playoff matchups
        return team.filter({
            attrs: ["tid", "cid","did"],
//            seasonAttrs: ["winp"],
           seasonAttrs: ["wonConf","winp","confChamp","wonAway","wonHome","lostAway","lostHome", "lastTen"],
            stats: ["gp", "pts", "oppPts", "diff"],		
            season: g.season
   //         sortBy: ["winpConf","winp"]			
//            sortBy: "wonConf"
//            sortBy: "winp"			
        }).then(function (teams) {
            var cid,did, i, row, series, teamsConf, tidPlayoffs, tx;
            var bracket;
			var atLarge, champs;
			
			
			
			/////////////////////
			
				return dao.games.getAll({
						index: "season",
						key: g.season					
					}).then(function (game) {
	//				}).then(function (teams,game) {
					
					//	  console.log("test");
					//	  console.log("game length: "+game.length);
					//	  console.log("teams length: "+teams.length);	

             var i, j, overallRankMetric, playerValuesByTid, weights;

				var teamWins,teamLosses,teamAdjWins,teamAdjLosses, teamOppWins,teamOppLosses, teamOppOppWins,teamOppOppLosses,teamPointsFor,teamPointsAgainst,teamAdjPointsFor,teamAdjPointsAgainst,teamSchedule,teamOppPointsFor,teamOppPointsAgainst,teamOppOppPointsFor,teamOppOppPointsAgainst;
				
				var teamSOS,teamRPI,teamPowerRank;
				
				var trackGames,trackOpps,trackOppsOpps;
				
				
//////////
					var i, j;
							
							var teamPointsFor,teamPointsAgainst,teamAdjPointsFor,teamAdjPointsAgainst,teamSchedule,teamOppPointsFor,teamOppPointsAgainst,teamOppOppPointsFor,teamOppOppPointsAgainst;
							
							var teamPowerRank;
							
							var trackGames,trackOpps,trackOppsOpps;				
//                   console.log(g.season);

		/*			console.log("game.length"+game.length);
					console.log("keys"+Object.keys(game));*/
					
                teamWins = [];
                teamLosses = [];
                teamAdjWins = [];
                teamAdjLosses = [];
                teamOppWins = [];
                teamOppLosses = [];
                teamOppOppWins = [];
                teamOppOppLosses = [];
                teamPointsFor = [];
                teamPointsAgainst = [];
                teamAdjPointsFor = [];
                teamAdjPointsAgainst = [];
                teamOppPointsFor = [];
                teamOppPointsAgainst = [];
                teamOppOppPointsFor = [];
                teamOppOppPointsAgainst = [];
                trackGames = [];
                trackOpps = [];
                trackOppsOpps = [];
                teamSchedule = [];
				
                teamSOS = [];
                teamRPI = [];
                teamPowerRank = [];

				
                for (i = 0; i < g.numTeams; i++) {
					teamWins[i] = [];
					teamLosses[i] = [];
					teamAdjWins[i] = [];
					teamAdjLosses[i] = [];
					teamOppWins[i] = [];
					teamOppLosses[i] = [];
					teamOppOppWins[i] = [];
					teamOppOppLosses[i] = [];					
					teamPointsFor[i] = [];
					teamPointsAgainst[i] = [];
					teamAdjPointsFor[i] = [];
					teamAdjPointsAgainst[i] = [];
					teamOppPointsFor[i] = [];
					teamOppPointsAgainst[i] = [];
					teamOppOppPointsFor[i] = [];
					teamOppOppPointsAgainst[i] = [];
					teamSOS[i] = [];
					teamRPI[i] = [];
					teamPowerRank[i] = [];					
					trackGames[i] = [];					
					trackOpps[i] = [];
					trackOppsOpps[i] = [];
					teamSchedule[i] = [];
					teamWins[i] = 0;
					teamLosses[i] = 0;					
					teamAdjWins[i] = 0;
					teamAdjLosses[i] = 0;
					teamOppWins[i] = 0;
					teamOppLosses[i] = 0;
					teamOppOppWins[i] = 0;
					teamOppOppLosses[i] = 0;					
					teamPointsFor[i] = 0;
					teamPointsAgainst[i] = 0;
					teamAdjPointsFor[i] = 0;
					teamAdjPointsAgainst[i] = 0;
					teamOppPointsFor[i] = 0;
					teamOppPointsAgainst[i] = 0;
					teamOppOppPointsFor[i] = 0;
					teamOppOppPointsAgainst[i] = 0;		
					trackGames[i] = 0;					
					trackOpps[i] = 0;
					trackOppsOpps[i] = 0;
					teamSOS[i] = 0;
					teamRPI[i] = 0;
					teamPowerRank[i] = 0;						
                }				
				
				

                for (i = 0; i < game.length; i++) {
/*				  console.log("game: "+i);
				  console.log("game[i].won.tid: "+game[i].won.tid);
				  console.log("game[i].lost.tid: "+game[i].lost.tid);
				  console.log("game[i].won.pts: "+game[i].won.pts);
				  console.log("game[i].lost.pts: "+game[i].lost.pts);
				  console.log("game[i].lost.pts: "+game[i].lost.pts); */
				 //   console.log("away: "+game[i].team[0].tid);
				 //   console.log("home: "+game[i].team[1].tid);
					teamWins[game[i].won.tid] += 1;
					teamLosses[game[i].lost.tid] += 1;
					teamPointsFor[game[i].won.tid] += game[i].won.pts;
					teamPointsFor[game[i].lost.tid] += game[i].lost.pts;
					teamPointsAgainst[game[i].won.tid] += game[i].lost.pts;
					teamPointsAgainst[game[i].lost.tid] += game[i].won.pts;
					trackGames[game[i].won.tid] += 1;
					trackGames[game[i].lost.tid] += 1;
		        }
                for (i = 0; i < g.numTeams; i++) {
				    if (trackGames[i]> 0) {
						teamPointsFor[i] /= trackGames[i];
						teamPointsAgainst[i] /= trackGames[i];
					}
				}
				//// now track Opp
				//// and OppOpp
				
/*					console.log("keysWins"+Object.keys(teamWins));
					console.log("keyslosses"+Object.keys(teamLosses));*/
		
				//// now gather opponent data
                for (i = 0; i < g.numTeams; i++) {
					for (j = 0; j < game.length; j++) {
						if (i===game[j].won.tid) {
							teamOppPointsFor[i] += teamPointsFor[game[j].lost.tid];						   
							teamOppPointsAgainst[i] += teamPointsAgainst[game[j].lost.tid];		
							teamOppLosses[i] += teamLosses[game[j].lost.tid];
							teamOppWins[i] += teamWins[game[j].lost.tid];
							trackOpps[i] += 1;							
						} else if (i===game[j].lost.tid) {
							teamOppPointsFor[i] += teamPointsFor[game[j].won.tid];						
							teamOppPointsAgainst[i] += teamPointsAgainst[game[j].won.tid];						   
							teamOppLosses[i] += teamLosses[game[j].won.tid];
							teamOppWins[i] += teamWins[game[j].won.tid];
							trackOpps[i] += 1;								
						}				
					}				
				}
				
                for (i = 0; i < g.numTeams; i++) {
				    if (trackOpps[i]> 0) {
						teamOppPointsFor[i] /= trackOpps[i];
						teamOppPointsAgainst[i] /= trackOpps[i];
					}
				}				
				

				//// now gather opponent opponent data
                for (i = 0; i < g.numTeams; i++) {
					for (j = 0; j < game.length; j++) {
						if (i===game[j].won.tid) {
							teamOppOppPointsFor[i] += teamOppPointsFor[game[j].lost.tid];						   
							teamOppOppPointsAgainst[i] += teamOppPointsAgainst[game[j].lost.tid];						   
							teamOppOppLosses[i] += teamOppLosses[game[j].lost.tid];
							teamOppOppWins[i] += teamOppWins[game[j].lost.tid];
							trackOppsOpps[i] += 1;							
						} else if (i===game[j].lost.tid) {
							teamOppOppPointsFor[i] += teamOppPointsFor[game[j].won.tid];						
							teamOppOppPointsAgainst[i] += teamOppPointsAgainst[game[j].won.tid];						   
							teamOppOppLosses[i] += teamOppLosses[game[j].won.tid];
							teamOppOppWins[i] += teamOppWins[game[j].won.tid];
							trackOppsOpps[i] += 1;							
						}				
					}				
				}				
				
                for (i = 0; i < g.numTeams; i++) {
				    if (trackOppsOpps[i]> 0) {
						teamOppOppPointsFor[i] /= trackOppsOpps[i];
						teamOppOppPointsAgainst[i] /= trackOppsOpps[i];
					}
				}						
		

					
				// need divsor
				// need to do by wins
                for (i = 0; i < g.numTeams; i++) {
					teamAdjWins[i] = teams[i].wonHome*.6+teams[i].wonAway*1.4
					teamAdjLosses[i] = teams[i].lostHome*1.4+teams[i].lostAway*.6
				//	console.log("RPI calc: "+teams[i].wonHome+" "+teams[i].wonAway+" "+teams[i].lostHome+" "+teams[i].lostAway);
					
				}				
				
				////now create SOS/RPI/PowerRank
                for (i = 0; i < g.numTeams; i++) {
					teams[i].SOS = ((teamOppWins[i]/(teamOppLosses[i]+teamOppWins[i]))*2+teamOppOppWins[i]/(teamOppOppLosses[i]+teamOppOppWins[i]))/3;
					teams[i].RPI = (teamAdjWins[i]/(teamAdjLosses[i]+teamAdjWins[i])+teams[i].SOS*3)/4;
			//		console.log("RPI calc: "+teamAdjWins[i]+" "+teamAdjLosses[i]+" "+teamAdjWins[i]+" "+teams[i].SOS);
					teams[i].power = (teamPointsFor[i]-teamPointsAgainst[i]+teamOppPointsFor[i]*2-teamOppPointsAgainst[i]*2+teamOppOppPointsFor[i]-teamOppOppPointsAgainst[i])/4;;	                       
				//	console.log("rank calc: "+teams[i].SOS+" "+teams[i].RPI+" "+teams[i].power);
/*					teamSOS[i] = (teamOppWins[i]/(teamOppLosses[i]+teamOppWins[i])*2+teamOppOppWins[i]/(teamOppOppLosses[i]+teamOppOppWins[i]))/3;
					teamRPI[i] = (teamAdjWins[i]/(teamAdjLosses[i]+teamAdjWins[i])+teamSOS[i]*3)/4;
					teamPowerRank[i] = (teamPointsFor[i]-teamPointsAgainst[i]+teamOppPointsFor[i]*2-teamOppPointsAgainst[i]*2+teamOppOppPointsFor[i]-teamOppOppPointsAgainst[i])/4;;	                       */
				}				
						  
               // PERFORMANCE
                for (i = 0; i < g.numTeams; i++) {
                 //   playerValuesByTid[i] = [];
                    // Modulate point differential by recent record: +5 for 10-0 in last 10 and -5 for 0-10
                    teams[i].performance = teams[i].diff - 5 + 5 * (parseInt(teams[i].lastTen.split("-")[0], 10)) / 10;
                }						  
						  

                teams.sort(function (a, b) { return b.performance - a.performance; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].performanceRank = i + 1;
                }										  
						  
              teams.sort(function (a, b) { return b.SOS - a.SOS; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].SOSRank = i + 1;
                }				
                teams.sort(function (a, b) { return b.RPI - a.RPI; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].RPIRank = i + 1;
                }		
                teams.sort(function (a, b) { return b.power - a.power; });
                for (i = 0; i < teams.length; i++) {
                    teams[i].powerRank = i + 1;
                }							  
						  
                for (i = 0; i < teams.length; i++) {
				//	console.log("rank calc: "+teams[i].SOSRank+" "+teams[i].RPIRank+" "+teams[i].powerRank);
                }							  
						  
						  
		
				teams.sort(function (b, a) { return b.powerRank - a.powerRank + b.RPIRank*.25 - a.RPIRank*.25 + b.performanceRank - a.performanceRank; });

          /*      for (i = 0; i < teams.length; i++) {
					console.log("rank calc: "+teams[i].performanceRank+" "+teams[i].RPIRank+" "+teams[i].powerRank);
                }							  */
						  				
				
//////////////////////						  



//////////////////////

							
							
							// Add entry for wins for each team; delete winp, which was only needed for sorting
							for (i = 0; i < teams.length; i++) {
								teams[i].won = 0;
							}
					//        console.log("did it even get here? 2");
							tidPlayoffs = [];
							series = [[], [], [], [], [], []];  // First round, second round, third round, fourth round
				//            for (cid = 0; cid < 4; cid++) {
									   atLarge = 0;
									   champs = 0;
									   teamsConf = [];
										for (i = 0; i < teams.length; i++) {
				  //                      for (i = 0; i < 64; i++) {
									 //       console.log("i: "+i);
									//        console.log("teams[i].confChamp: "+teams[i].confChamp);
											if (teams[i].confChamp == 1) {
												champs += 1;
												teamsConf.push(teams[i]);
												tidPlayoffs.push(teams[i].tid);
								//		console.log("atLarge: "+atLarge+" CHAMPS: "+champs+" teams[i].tid: "+ teams[i].tid);
											} else if (atLarge < 44) {
												atLarge += 1;
												teamsConf.push(teams[i]);
												tidPlayoffs.push(teams[i].tid);
									//	console.log("ATLARGE: "+atLarge+" champs: "+champs+" teams[i].tid: "+ teams[i].tid);

											/*} else if (atLarge < 108 {
												atLarge += 1;
												teamsConf.push(teams[i]);
												tidPlayoffs.push(teams[i].tid);*/
											
											}
											if ((atLarge >= 44 ) && (champs >= 20)) {
//											if ((atLarge >= 108 ) && (champs >= 20)) {
												break;								
											}
										}
									//	console.log("atLarge: "+atLarge+" champs: "+champs);
										for (bracket = 0; bracket < 4; bracket++) {
								//		console.log("bracket: "+bracket);
											series[0][bracket * 8] = {home: teamsConf[3-bracket], away: teamsConf[16*4-4+bracket]};
											series[0][bracket * 8].away.seed = 16;
											series[0][bracket * 8].home.seed = 1;
											series[0][1 + bracket * 8] = {home: teamsConf[8*4-4+bracket], away: teamsConf[9*4-4+bracket]};
											series[0][1 + bracket * 8].away.seed = 9;
											series[0][1 + bracket * 8].home.seed = 8;
											series[0][2 + bracket * 8] = {home: teamsConf[4*4-4+bracket], away: teamsConf[13*4-4+bracket]};
											series[0][2 + bracket * 8].away.seed = 13;
											series[0][2 + bracket * 8].home.seed = 4;
											series[0][3 + bracket * 8] = {home: teamsConf[5*4-4+bracket], away: teamsConf[12*4-4+bracket]};
											series[0][3 + bracket * 8].away.seed = 12;
											series[0][3 + bracket * 8].home.seed = 5;
											series[0][4 + bracket * 8] = {home: teamsConf[6*4-4+bracket], away: teamsConf[11*4-4+bracket]};
											series[0][4 + bracket * 8].away.seed = 11;
											series[0][4 + bracket * 8].home.seed = 6;
											series[0][5 + bracket * 8] = {home: teamsConf[3*4-4+bracket], away: teamsConf[14*4-4+bracket]};
											series[0][5 + bracket * 8].away.seed = 14;
											series[0][5 + bracket * 8].home.seed = 3;
											series[0][6 + bracket * 8] = {home: teamsConf[7*4-4+bracket], away: teamsConf[10*4-4+bracket]};
											series[0][6 + bracket * 8].away.seed = 10;
											series[0][6 + bracket * 8].home.seed = 7;
											series[0][7 + bracket * 8] = {home: teamsConf[2*4-4+bracket], away: teamsConf[15*4-4+bracket]};
											series[0][7 + bracket * 8].away.seed = 15;
											series[0][7 + bracket * 8].home.seed = 2;
										}
								/*	for (bracket = 0; bracket < 4; bracket++) {
								//		console.log("bracket: "+bracket);
											series[0][bracket * 8] = {home: teamsConf[3-bracket+64], away: teamsConf[16*4-4+bracket+64]};
											series[0][bracket * 8].away.seed = 16;
											series[0][bracket * 8].home.seed = 1;
											series[0][1 + bracket * 8] = {home: teamsConf[8*4-4+bracket+64], away: teamsConf[9*4-4+bracket+64]};
											series[0][1 + bracket * 8].away.seed = 9;
											series[0][1 + bracket * 8].home.seed = 8;
											series[0][2 + bracket * 8] = {home: teamsConf[4*4-4+bracket+64], away: teamsConf[13*4-4+bracket+64]};
											series[0][2 + bracket * 8].away.seed = 13;
											series[0][2 + bracket * 8].home.seed = 4;
											series[0][3 + bracket * 8] = {home: teamsConf[5*4-4+bracket+64], away: teamsConf[12*4-4+bracket+64]};
											series[0][3 + bracket * 8].away.seed = 12;
											series[0][3 + bracket * 8].home.seed = 5;
											series[0][4 + bracket * 8] = {home: teamsConf[6*4-4+bracket+64], away: teamsConf[11*4-4+bracket+64]};
											series[0][4 + bracket * 8].away.seed = 11;
											series[0][4 + bracket * 8].home.seed = 6;
											series[0][5 + bracket * 8] = {home: teamsConf[3*4-4+bracket+64], away: teamsConf[14*4-4+bracket+64]};
											series[0][5 + bracket * 8].away.seed = 14;
											series[0][5 + bracket * 8].home.seed = 3;
											series[0][6 + bracket * 8] = {home: teamsConf[7*4-4+bracket+64], away: teamsConf[10*4-4+bracket+64]};
											series[0][6 + bracket * 8].away.seed = 10;
											series[0][6 + bracket * 8].home.seed = 7;
											series[0][7 + bracket * 8] = {home: teamsConf[2*4-4+bracket+64], away: teamsConf[15*4-4+bracket+64]};
											series[0][7 + bracket * 8].away.seed = 15;
											series[0][7 + bracket * 8].home.seed = 2;
										}*/

						 /*   for (did = 0; did < 10; did++) {
								teamsConf = [];
								for (i = 0; i < teams.length; i++) {
									if (teams[i].did === did) {
				//                        if (teamsConf.length < 8) {
										if (teamsConf.length < 10) {
											teamsConf.push(teams[i]);
											tidPlayoffs.push(teams[i].tid);
										}
									}
								}
								
									   series[0][did * 4] = {home: teamsConf[0], away: teamsConf[7]};
										series[0][did * 4].away.seed = 8;
										series[0][did * 4].home.seed = 1;
										series[0][1 + did * 4] = {home: teamsConf[3], away: teamsConf[4]};
										series[0][1 + did * 4].away.seed = 5;
										series[0][1 + did * 4].home.seed = 4;
										series[0][2 + did * 4] = {home: teamsConf[2], away: teamsConf[5]};
										series[0][2 + did * 4].away.seed = 6;
										series[0][2 + did * 4].home.seed = 3;
										series[0][3 + did * 4] = {home: teamsConf[1], away: teamsConf[6]};
										series[0][3 + did * 4].away.seed = 7;
										series[0][3 + did * 4].home.seed = 2;
							
							}*/
							
							

							row = {season: g.season, currentRound: 0, series: series};
							//console.log("test")
							//// this is failing?
							tx = dao.tx(["players", "playerStats", "playoffSeries64", "teams"], "readwrite");
							//console.log("test2")			
							//tx = dao.tx(["players", "playerStats", "teams"], "readwrite");
				//            tx = dao.tx(["players", "playerStats", "playoffSeries", "teams"], "readwrite");
				//            dao.playoffSeries.put({value: row});
							dao.playoffSeries64.put({value: row});
							//console.log("test3")			

							if (tidPlayoffs.indexOf(g.userTid) >= 0) {
								eventLog.add(null, {
									type: "playoffs64",
									text: 'Your team made <a href="' + helpers.leagueUrl(["playoffs64", g.season]) + '">the NT</a>.'
								});
							} else {
								eventLog.add(null, {
									type: "playoffs64",
									text: 'Your team didn\'t make <a href="' + helpers.leagueUrl(["playoffs64", g.season]) + '">the NT</a>.'
								});
							}
							//console.log("test4")			

							// Add row to team stats and team season attributes
							dao.teams.iterate({
								ot: tx,
								callback: function (t) {
									var teamSeason;

									teamSeason = t.seasons[t.seasons.length - 1];

									if (tidPlayoffs.indexOf(t.tid) >= 0) {
										t = team.addStatsRow(t, true);

										teamSeason.playoff64RoundsWon = 0;

										// More hype for making the playoffs
										teamSeason.hype *= 0.95;										
										teamSeason.hype += 0.05;

										if (teamSeason.hype > 1) {
											teamSeason.hype = 1;
										}
									} else {
										// Less hype for missing the playoffs
										teamSeason.hype *= 0.95;											
	//									teamSeason.hype -= 0.05;
										if (teamSeason.hype < 0) {
											teamSeason.hype = 0;
										}
									}

									return t;
								}
							}); 
						//	console.log("test5")			

							// Add row to player stats
						/*    tidPlayoffs.forEach(function (tid) {
								dao.players.iterate({
									ot: tx,
									index: "tid",
									key: tid,
									callback: function (p) {
										return player.addStatsRow(tx, p, true);
									}
								});
							}); */
							//console.log("test6")			

							return tx.complete().then(function () {
								return Promise.all([
									finances.assessPayrollMinLuxury(),
									newSchedulePlayoffsDay64()
								]);
							}).then(function () {
								var url;
						//	console.log("test7")			

								// Don't redirect if we're viewing a live game now
								if (location.pathname.indexOf("/live_game") === -1) {
									url = helpers.leagueUrl(["playoffs64"]);
								}
						//	console.log("test8")			
								return newPhaseFinalize(g.PHASE.PLAYOFFS64, url, ["teamFinances"]);
							});



							
			
					});				
			
			/////////////////////
			
			
			
			////////////////
			
        });
	//	console.log("finished");
    }
	
	
    function newPhaseBeforeDraft() {
        var tx;

	//	console.log("g.phase: "+ g.phase);
        // Achievements after playoffs
        account.checkAchievement.fo_fo_fo();
        account.checkAchievement["98_degrees"]();
        account.checkAchievement.dynasty();
        account.checkAchievement.dynasty_2();
        account.checkAchievement.dynasty_3();
        account.checkAchievement.moneyball();
        account.checkAchievement.moneyball_2();
        
        account.checkAchievement.sleeper_pick();		

        // Select winners of the season's awards
        return awards64().then(function () {
            tx = dao.tx(["events", "messages", "players", "playerStats", "releasedPlayers", "teams"], "readwrite");

            // Add award for each player on the championship team
            return team.filter({
                attrs: ["tid","cid"],
                seasonAttrs: ["playoff64RoundsWon","revenues"],
                season: g.season,
                ot: tx
            });
        }).then(function (teams) {
            var i, maxAge, minPot, tid;
			
			
			var playoffSuccess;
			var t;
			
            playoffSuccess = [0,0, 0,0, 0,0,0, 0,0, 0,0,0, 0,0, 0,0,0, 0,0, 0];
            for (i = 0; i < teams.length; i++) {

		//		console.log("i: "+i);
		//		console.log("teams[i].cid: "+teams[i].cid);
		//		console.log("teams[i].playoff64RoundsWon: "+teams[i].playoff64RoundsWon);
				
				playoffSuccess[teams[i].cid] += teams[i].playoff64RoundsWon;
            }	
            for (i = 0; i < 20; i++) {
				playoffSuccess[i] += 16;
            }	
			
		/*	console.log("0: "+playoffSuccess[0]);
+			console.log("1: "+playoffSuccess[1]);
+			console.log("2: "+playoffSuccess[2]);
+			console.log("3: "+playoffSuccess[3]);
+			console.log("4: "+playoffSuccess[4]);			*/
            for (i = 0; i < teams.length; i++) {
//				console.log("i: "+i);			
//				console.log("teams[i].revenues.nationalTv.amount: "+teams[i].revenues.nationalTv.amount);			
				teams[i].revenues.nationalTv.amount += playoffSuccess[teams[i].cid]*1000;
//				console.log("teams[i].revenues.nationalTv.amount: "+teams[i].revenues.nationalTv.amount);		
		//		t[i].revenues.nationalTv.amount = teams[i].revenues.nationalTv.amount;
			}
			//dao.teams.put({ot: tx, value: teams});
//			var t2;

			

//						nationalRevenue = teams[0].revenues.nationalTv.amount;
//						console.log("nationalRevenue:"+nationalRevenue);
//            dao.players.iterate({
            dao.teams.iterate({
				ot: tx,
                callback: function (t) {			
						var tid;
						tid = t.tid;
						
						t.seasons[t.seasons.length - 1].revenues.nationalTv.amount += teams[tid].revenues.nationalTv.amount;
						t.seasons[t.seasons.length - 1].cash += teams[tid].revenues.nationalTv.amount;
						return t;
				}
			});


            // Give award to all players on the championship team
            for (i = 0; i < teams.length; i++) {
                if (teams[i].playoff64RoundsWon === 6) {
                    tid = teams[i].tid;
                    break;
                }
            }
            dao.players.iterate({
                ot: tx,
                index: "tid",
                key: tid,
                callback: function (p) {
                    p.awards.push({season: g.season, type: "Won NT"});
                    return p;
                }
            });
			
		/*	for (i = 0; i < teams.length; i++) {
                if (teams[i].playoffRoundsWon === 4) {
                    tid = teams[i].tid;
                    break;
                }
            }
            dao.players.iterate({
                ot: tx,
                index: "tid",
                key: tid,
                callback: function (p) {
                    p.awards.push({season: g.season, type: "Won CT"});
                    return p;
                }
            });			*/

            // Do annual tasks for each player, like checking for retirement

            // Players meeting one of these cutoffs might retire
			
			// high pot and high age mean you leave
            maxAge = 23;
            minPot = 40;
			
			var playersLeft = [];
			//playersLeft.length = teams.length;
            for (i = 0; i < teams.length; i++) {
 
		//		console.log("i: "+i);
		//		console.log("teams[i].cid: "+teams[i].cid);
		//		console.log("teams[i].playoff64RoundsWon: "+teams[i].playoff64RoundsWon);
				
				playersLeft.push(0);
            }				
	
            dao.players.iterate({
                ot: tx,
                index: "tid",
//                key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                key: IDBKeyRange.lowerBound(g.PLAYER.FREE_AGENT),
                callback: function (p) {
                    var update;

                    update = false;

                    // Get player stats, used for HOF calculation
                    return dao.playerStats.getAll({
                        ot: tx,
                        index: "pid, season, tid",
                        key: IDBKeyRange.bound([p.pid], [p.pid, ''])
                    }).then(function (playerStats) {
                        var age, excessAge, excessPot, pot,ovr;
						var YWT;
						var ywtOrAge;
						
                        age = g.season - p.born.year;
                        pot = p.ratings[p.ratings.length - 1].pot;
                        ovr = p.ratings[p.ratings.length - 1].ovr;
						YWT = _.pluck(playerStats, "yearsWithTeam");
					//	console.log("yearsWithTeam: "+p.yearsWithTeam);
					    //console.log(p.playerStats.length);
			
 //                       if (age > maxAge || pot < minPot) {
                            excessAge = 0;
//                            if (age > 23) {  // Only players older than 34 or without a contract will retire
//                            if (age > 22 || p.tid === g.PLAYER.FREE_AGENT) {  // Only players older than 34 or without a contract will retire
  //                              if (age > 23) {
                                    excessAge = (age - 18) ;  // 1 for each year beyond 18
  //                              }
                                excessPot = ((pot-60)+(ovr-60)) / 16 - random.gauss(0, 1);  // 0.02 for each potential rating below 40 (this can be negative)
								if (excessPot<0) {
								    excessPot = 0;
								}
			//					console.log("excessAge: "+excessAge+ "excessPot: "+excessPot);
//								console.log("excessAge: "+excessAge);
//                                if ( (excessAge)  > 4) {
//                                if ( (excessAge/2 + excessPot)  > 4) {
								if (g.season == g.startingSeason) {
								  ywtOrAge = excessAge;
								} else if ((g.season == (g.startingSeason+1)) && (YWT[YWT.length-2]>1)) {
								  ywtOrAge = excessAge;
								} else if ((g.season == (g.startingSeason+2)) && (YWT[YWT.length-2]>2)) {
								  ywtOrAge = excessAge;
								} else {
								  ywtOrAge = YWT[YWT.length-2];								  
								}


                                if ( (excessPot)  > 4) {
								
			                        if ( (g.season == g.startingSeason) &&  (excessAge == 3) ) {									  
									  if (Math.random() > 0.85) {
										playersLeft[p.tid] += 1*ywtOrAge/4;
										p = player.retire(tx, p, playerStats);
										update = true;									  
									  }									
									} else if ( (g.season == g.startingSeason) && (excessAge == 2) ) {
									  if (Math.random() > 0.75) {
										playersLeft[p.tid] += 1*ywtOrAge/4;
										p = player.retire(tx, p, playerStats);
										update = true;									  
									  }									
									} else if ( (g.season == (g.startingSeason+1)) && ( (excessAge == 3)) ) {
									  if (Math.random() > 0.75) {
										playersLeft[p.tid] += 1*ywtOrAge/4;
										p = player.retire(tx, p, playerStats);
										update = true;									  
									  }
									
									} else if ( (g.season == g.startingSeason) && ( (excessAge == 1)) ) {																		
									
									  if (Math.random() > 0.25) {
										playersLeft[p.tid] += 1*ywtOrAge/4;
										p = player.retire(tx, p, playerStats);
										update = true;
									  
									  }
									
									
									} else {
										playersLeft[p.tid] += 1*ywtOrAge/4;
									//	console.log("playersLeft[i]: "+playersLeft[p.tid]);
										p = player.retire(tx, p, playerStats);
										update = true;
									}								
								
//									playersLeft[p.tid] += 1*excessAge/4;								

  //                                  p = player.retire(tx, p, playerStats);
    //                                update = true;
                                } else if ( (excessAge)  > 3) {
									playersLeft[p.tid] += 1*ywtOrAge/4;
                                    p = player.retire(tx, p, playerStats);
                                    update = true;
								}
  //                          }
  //                      }

                        // Update "free agent years" counter and retire players who have been free agents for more than one years
                        if (p.tid === g.PLAYER.FREE_AGENT) {
                         //   if (p.yearsFreeAgent >= 1) {
                           //     p = player.retire(tx, p, playerStats);
                          //  } else {
                                p.yearsFreeAgent += 1;
                           // }
                            p.contract.exp += 1;
                            update = true;
                        } else if (p.tid >= 0 && p.yearsFreeAgent > 0) {
                            p.yearsFreeAgent = 0;
                            update = true;
                        }
						//// eliminate contract amounts for all return players
				//		console.log("contract before: "+p.contract.amount);
						if  ( p.contract.amount > 0) {
							p.contract.amount = 0;
							update = true;
						}
					//	console.log("contract after: "+p.contract.amount);

                        // Heal injures
                        if (p.injury.type !== "Healthy") {
                            if (p.injury.gamesRemaining <= 22) {
                                p.injury = {type: "Healthy", gamesRemaining: 0};
                            } else {
                                p.injury.gamesRemaining -= 22;
                            }
                            update = true;
                        }

                        // Update player in DB, if necessary
                        if (update) {
                            return p;
                        }
                    });
                }
//            });
 //           });

 
            }).then(function () {
			// use key instead and put in above. just add 15k as it goes.
				dao.teams.iterate({
					ot: tx,
					callback: function (t) {	
							
						//		console.log("p.tid: "+p.tid);
						//		console.log("t.tid: "+t.tid);
							//	console.log("t.tid: "+t.tid);
				//			if (p.tid == t.tid) {
					//			console.log("p.tid: "+p.tid);
				//				console.log("t.tid: "+t.tid);
				//				console.log("t.seasons[t.seasons.length - 1].cash: "+t.seasons[t.seasons.length - 1].cash);
				//				console.log("playersLeft[t.tid]: "+playersLeft[t.tid]);
						
								t.seasons[t.seasons.length - 1].revenues.merch.amount += 15000*playersLeft[t.tid];
								t.seasons[t.seasons.length - 1].cash += 15000*playersLeft[t.tid];
				//				console.log("t.seasons[t.seasons.length - 1].cash: "+t.seasons[t.seasons.length - 1].cash);
								return t;													
					//		}

					}
				});		
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
                    url = helpers.leagueUrl(["history64"]);
                }

                return newPhaseFinalize(g.PHASE.BEFORE_DRAFT, url, ["playerMovement"]);
            }).then(function () {
                helpers.bbgmPing("season");
            });
        });
    }

    function newPhaseDraft() {
	
	//// create new players instead?
	//console.log("newPhaseDraft now free agency");
	
		//	console.log("g.phase: "+ g.phase);
//    function newPhaseFreeAgency() {	
//        return draft.genPlayers().then(function () {
        return newPhaseFreeAgency().then(function () {
	
	
	// convert draft to free agents
	
    //    return draft.genOrder().then(function () {
      /*      var tx;

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
            return tx.complete(); */
        }).then(function () {
//            return newPhaseFinalize(g.PHASE.DRAFT, helpers.leagueUrl(["draft"]));
//            return newPhaseFinalize(g.PHASE.DRAFT, helpers.leagueUrl(["draft"]));
//            return newPhaseFinalize(g.PHASE.AFTER_DRAFT, undefined, ["playerMovement"]);
              return newPhaseFinalize(g.PHASE.FREE_AGENCY, helpers.leagueUrl(["free_agents"]), ["playerMovement"]);
			
			
        });
    }

    function newPhaseAfterDraft() {
        var round, tid, tx;

	//console.log("newPhaseAfterDraft");		
	//	console.log("g.phase: "+ g.phase);	
        tx = dao.tx("draftPicks", "readwrite");

        // Add a new set of draft picks
        for (tid = 0; tid < g.numTeams; tid++) {
            for (round = 1; round <= 2; round++) {
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
	//console.log("newPhaseResignPlayers");	
	//		console.log("g.phase: "+ g.phase);
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
	//console.log("newPhaseFreeAgency");	
			console.log("g.phase: "+ g.phase);
        return team.filter({
            attrs: ["strategy"],
            season: g.season
        }).then(function (teams) {
            strategies = _.pluck(teams, "strategy");

            // Delete all current negotiations to resign players
            return contractNegotiation.cancelAll();
        }).then(function () {
            var tx;

		//	console.log("newPhaseFreeAgency");
			
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

							//// shouldn't be needed
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
								//	console.log("shouldn't ever get here");
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
//                return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3);

					return team.filter({
			//				ot: tx,					
							attrs: ["tid","city","state","longitude","latitude"],
							seasonAttrs: ["pop"],
							season: g.season
					}).then(function (t) {	
//						return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3).then(function() {
						return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3,null,null,t).then(function() {
				
				
					
				
						});
				
					});					
				
				
				
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
     * @param {number} phase Numeric phase ID. This should always be one of the g.PHASE.* variables defined in globals.js.
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
			//	console.log("preseason 1g.phase: "+ g.phase);
		
            return newPhasePreseason();
        }
        if (phase === g.PHASE.REGULAR_SEASON) {
		//		console.log("reg season 1g.phase: "+ g.phase);
		
            return newPhaseRegularSeason();
        }
        if (phase === g.PHASE.AFTER_TRADE_DEADLINE) {
		//		console.log("deadline 1g.phase: "+ g.phase);
            return newPhaseAfterTradeDeadline();
        }
        if (phase === g.PHASE.PLAYOFFS) {
			//	console.log("CT 1g.phase: "+ g.phase);
            return newPhasePlayoffs();
        }
        if (phase === g.PHASE.BEFORE_PLAYOFFS64) {
			//	console.log("CT Summary 1g.phase: "+ g.phase);
            return newPhaseBeforePlayoff64();
        }
        if (phase === g.PHASE.PLAYOFFS64) {
			//	console.log("NT 1g.phase: "+ g.phase);
            return newPhasePlayoffs64();
        }
		
        if (phase === g.PHASE.BEFORE_DRAFT) {
			//	console.log("NT summary before draft 1g.phase: "+ g.phase);
            return newPhaseBeforeDraft();
        }
        if (phase === g.PHASE.DRAFT) {
			//	console.log("draft 1g.phase: "+ g.phase);
            return newPhaseDraft();
        }
        if (phase === g.PHASE.AFTER_DRAFT) {
			//	console.log("after draft 1g.phase: "+ g.phase);
            return newPhaseAfterDraft();
        }
        if (phase === g.PHASE.RESIGN_PLAYERS) {
			//	console.log("resign 1g.phase: "+ g.phase);
            return newPhaseResignPlayers();
        }
        if (phase === g.PHASE.FREE_AGENCY) {
			//	console.log("free agency 1g.phase: "+ g.phase);
            return newPhaseFreeAgency();
        }
        if (phase === g.PHASE.FANTASY_DRAFT) {
            return newPhaseFantasyDraft(extra);
        }
    }

    /*Creates a single day's schedule for an in-progress playoffs.*/
    function newSchedulePlayoffsDay() {
        var playoffSeries, rnd, series, tids, tx;
        tx = dao.tx(["playoffSeries", "teams"], "readwrite");
         
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
            if (tids.length > 0) {
                return setSchedule(tids);
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
//							t.seasons[s].hype += 0.05;
							t.seasons[s].hype *= 0.99;
							t.seasons[s].hype += 0.01;								
							if (t.seasons[s].hype > 1) {
								t.seasons[s].hype = 1;
							}

							return t;
						}
					});
				
				}
				
                return tx.complete().then(function () {
				
//                    return newPhase(g.PHASE.PLAYOFFS64);
                    return newPhase(g.PHASE.BEFORE_PLAYOFFS64);
					
   //                 return newPhase(g.PHASE.BEFORE_DRAFT);
                });
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
//                    t.seasons[s].hype += 0.05;
                    t.seasons[s].hype *= 0.99;
                    t.seasons[s].hype += 0.01;						
                    if (t.seasons[s].hype > 1) {
                        t.seasons[s].hype = 1;
                    }

                    dao.teams.put({ot: tx, value: t});
                });
            }

            // Next time, the schedule for the first day of the next round will be set
            return tx.complete().then(newSchedulePlayoffsDay);
        });
    }
	
    /*Creates a single day's schedule for an in-progress playoffs.*/
    function newSchedulePlayoffsDay64() {
        var playoffSeries64, rnd, series, tids, tx;
        tx = dao.tx(["playoffSeries64", "teams"], "readwrite");

		
		//console.log("schedule playoff64 day")
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
			 //   console.log("i: "+i);
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
                return setSchedule(tids);
            }

	//	    console.log("rnd: "+rnd);
            // If playoffs are over, update winner and go to next phase
            if (rnd === 5) {
                if (series[rnd][0].home.won === 1) {
                    key = series[rnd][0].home.tid;
                } else if (series[rnd][0].away.won === 1) {
                    key = series[rnd][0].away.tid;
                }
                dao.teams.iterate({
                    ot: tx,
                    key: key,
                    callback: function (t) {
                        var s;

                        s = t.seasons.length - 1;

                        t.seasons[s].playoff64RoundsWon = 6;
//                        t.seasons[s].hype += 0.05;
                        t.seasons[s].hype *= 0.7;
                        t.seasons[s].hype += 0.30;							
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
                series[rnd + 1][i / 2] = matchup;
            }

            playoffSeries64.currentRound += 1;
            dao.playoffSeries64.put({ot: tx, value: playoffSeries64});

            // Update hype for winning a series
            for (i = 0; i < tidsWon.length; i++) {
                dao.teams.get({
                    ot: tx,
                    key: tidsWon[i]
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

                    dao.teams.put({ot: tx, value: t});
                });
            }

            // Next time, the schedule for the first day of the next round will be set
            return tx.complete().then(newSchedulePlayoffsDay64);
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
        newSchedulePlayoffsDay64: newSchedulePlayoffsDay64,
        getDaysLeftSchedule: getDaysLeftSchedule,
        phaseText: phaseText
    };
});