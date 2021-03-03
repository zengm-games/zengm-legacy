/**
 * @name views.exportRosters
 * @namespace Export rosters.
 */
define(["dao", "globals", "ui", "core/player", "lib/bluebird", "lib/underscore", "util/bbgmView", "util/helpers"], function (dao, g, ui, player, Promise, _, bbgmView, helpers) {
    "use strict";

    function genFileName(leagueName, season, grouping) {
        var fileName;

        fileName = "HGM_" + leagueName.replace(/[^a-z0-9]/gi, '_') + "_" + season + "_" + (season === "all" ? "seasons" : "season") + (grouping === "averages" ? "_Average_Stats" : "_Game_Stats");

        return fileName + ".csv";
    }

    // playerAveragesCSV(2015) - just 2015 stats
    // playerAveragesCSV("all") - all stats
    function playerAveragesCSV(season) {
        return dao.players.getAll({
            statsSeasons: season === "all" ? "all" : [season]
        }).then(function (players) {
            var output, seasons;

            // Array of seasons in stats, either just one or all of them
            seasons = _.uniq(_.pluck(_.flatten(_.pluck(players, "stats")), "season"));

            output = "pid,Name,Pos,Age,Team,Season,GP,GS,Min,Pts,G,A,+/-,SOG,MS,BS,Tk,Gv,PIM,PP,SH,FOW,FOL,FO%,SA,GA,Sa,Sa%,Blk,Hts\n";

            seasons.forEach(function (s) {
                player.filter(players, {
                    attrs: ["pid", "name", "pos", "age"],
                    stats: ["abbrev", "gp", "gs", "min", "pts", "fg", "ast", "plusminus", "fga", "mfg", "fgs", "stl", "tov", "pmin", "ppmin", "shmin", "fow", "fol", "fop", "sfga", "sfg", "sfgs", "sfgs", "sfgsp","hits","blk"],
                    season: s
                }).forEach(function (p) {
                    output += [p.pid, p.name, p.pos, p.age, p.stats.abbrev, s, p.stats.gp, p.stats.gs, p.stats.min, p.stats.pts, p.stats.fg, p.stats.ast, p.stats.plusminus, p.stats.fga, p.stats.mfg, p.stats.fgs, p.stats.stl, p.stats.tov, p.stats.pmin, p.stats.ppmin, p.stats.shmin, p.stats.fow, p.stats.fol, p.stats.fop, p.stats.sfga, p.stats.sfg, p.stats.sfgs, p.stats.sfgsp, p.stats.hits, p.stats.blk].join(",") + "\n";
                });
            });

            return output;
        });
    }

    // playerAveragesCSV(2015) - just 2015 games
    // playerAveragesCSV("all") - all games
    function playerGamesCSV(season) {
        var gamesPromise;

        if (season === "all") {
            gamesPromise = dao.games.getAll();
        } else {
            gamesPromise = dao.games.getAll({index: "season", key: season});
        }
        return gamesPromise.then(function (games) {
            var i, j, output, seasons, gameStats, t, t2, teams;

            output = "pid,Name,Pos,Team,Opp,Score,WL,Season,Playoffs,Min,Pts,G,A,+/-,SOG,MS,BS,Tk,Gv,PIM,PP,SH,FOW,FOL,FO%,SA,GA,Sa,Sa%,Blk,Hts\n";

            teams = _.pluck(games, "teams");
            seasons = _.pluck(games, "season");
            for (i = 0; i < teams.length; i++) {
                for (j = 0; j < 2; j++) {
                    t = teams[i][j];
                    t2 = teams[i][j === 0 ? 1 : 0];
                    t.players.forEach(function (p) {
                        output += [p.pid, p.name, p.pos, g.teamAbbrevsCache[t.tid], g.teamAbbrevsCache[t2.tid], t.pts + "-" + t2.pts, t.pts > t2.pts ? "W" : "L", seasons[i], games[i].playoffs,  p.min, p.pts, p.fg, p.ast, p.plusminus, p.fga, p.mfg, p.fgs, p.stl, p.tov, p.pmin, p.ppmin, p.shmin, p.fow, p.fol, p.fop, p.sfga, p.sfg, p.sfgs, p.sfgsp, p.hits, p.blk].join(",") + "\n";
                    });
                }
            }

            return output;
        });
    }

    function InitViewModel() {
        this.formChanged = function () {
            // Clear old link when form changes
            document.getElementById("download-link").innerHTML = ""; // Clear "Generating..."
        };
    }

    function post(req) {
        var csvPromise, downloadLink, objectStores, season, statsSeasons;

        downloadLink = document.getElementById("download-link");
        downloadLink.innerHTML = "Generating...";

        season = req.params.season === "all" ? "all" : parseInt(req.params.season, 10);

        if (req.params.grouping === "averages") {
            csvPromise = playerAveragesCSV(season);
        } else if (req.params.grouping === "games") {
            csvPromise = playerGamesCSV(season);
        } else {
            throw new Error("This should never happen");
        }

        Promise.all([
            csvPromise,
            dao.leagues.get({key: g.lid})
        ]).spread(function (output, l) {
            var a, blob, fileName, url;

            blob = new Blob([output], {type: "text/csv"});
            url = window.URL.createObjectURL(blob);

            fileName = genFileName(l.name, season, req.params.grouping);

            a = document.createElement("a");
            a.download = fileName;
            a.href = url;
            a.textContent = "Download Exported Stats";
            a.dataset.noDavis = "true";
//                a.click(); // Works in Chrome to auto-download, but not Firefox

            downloadLink.innerHTML = ""; // Clear "Generating..."
            downloadLink.appendChild(a);

            // Delete object, eventually
            window.setTimeout(function () {
                window.URL.revokeObjectURL(url);
                downloadLink.innerHTML = "Download link expired."; // Remove expired link
            }, 60 * 1000);
        });
    }

    function updateExportStats(inputs, updateEvents) {
        var j, options, seasons;

        if (updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("newPhase") >= 0 || updateEvents.indexOf("dbChange") >= 0) {
            seasons = helpers.getSeasons();
            options = [{
                key: "all",
                val: "All Seasons"
            }];
            for (j = 0; j < seasons.length; j++) {
                options.push({
                    key: seasons[j].season,
                    val: seasons[j].season + " season"
                });
            }
            return {seasons: options};
        }
    }

    function uiFirst() {
        ui.title("Export Stats");
    }

    return bbgmView.init({
        id: "exportStats",
        InitViewModel: InitViewModel,
        post: post,
        runBefore: [updateExportStats],
        uiFirst: uiFirst
    });
});