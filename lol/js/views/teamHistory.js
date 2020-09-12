/**
 * @name views.teamHistory
 * @namespace Team history.
 */
define(["dao", "globals", "ui", "core/player", "lib/bluebird", "lib/jquery", "lib/knockout", "lib/underscore", "util/bbgmView", "util/helpers", "views/components"], function (dao, g, ui, player, Promise, $, ko, _, bbgmView, helpers, components) {
    "use strict";

    var mapping;

    function get(req) {
        var inputs, out;

        inputs = {};

        inputs.show = req.params.show !== undefined ? req.params.show : "10";
        out = helpers.validateAbbrev(req.params.abbrev);
        inputs.tid = out[0];
        inputs.abbrev = out[1];

        return inputs;
    }

    mapping = {
        history: {
            create: function (options) {
                return options.data;
            }
        },
        players: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updateTeamHistory(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || updateEvents.indexOf("gameSim") >= 0 || inputs.abbrev !== vm.abbrev()) {
            return Promise.all([
                dao.teams.get({key: inputs.tid}),
                dao.players.getAll({
                    index: "statsTids",
                    key: inputs.tid,
                    statsSeasons: "all",
                    statsTid: inputs.tid
                })
            ]).spread(function (userTeam, players) {
                var championships, history, i, j, playoffAppearances, totalLost, totalWon;

                history = [];
                totalWon = 0;
                totalLost = 0;
                playoffAppearances = 0;
                championships = 0;
                for (i = 0; i < userTeam.seasons.length; i++) {
                    history.push({
                        season: userTeam.seasons[i].season,
                        won: userTeam.seasons[i].won,
                        lost: userTeam.seasons[i].lost,
                        playoffRoundsWon: userTeam.seasons[i].playoffRoundsWon
                    });
                    totalWon += userTeam.seasons[i].won;
                    totalLost += userTeam.seasons[i].lost;
					
					if (g.gameType == 0 ) {
						if (userTeam.seasons[i].playoffRoundsWon >= 0) { playoffAppearances += 1; }
						if (userTeam.seasons[i].playoffRoundsWon === 3) { championships += 1; }
					
					} else if (g.gameType == 1 ) {
						if (userTeam.seasons[i].playoffRoundsWon >= 24) { playoffAppearances += 1; }
						if (userTeam.seasons[i].playoffRoundsWon === 27) { championships += 1; }
					} else if (g.gameType == 2 ) {
						if (userTeam.seasons[i].playoffRoundsWon >= 0) { playoffAppearances += 1; }
						if (userTeam.seasons[i].playoffRoundsWon === 4) { championships += 1; }
					} else if (g.gameType == 3 ) {
						if (userTeam.seasons[i].playoffRoundsWon >= 0) { playoffAppearances += 1; }
						if (userTeam.seasons[i].playoffRoundsWon === 6) { championships += 1; }
					} else if (g.gameType == 4 ) {
						if (userTeam.seasons[i].playoffRoundsWon >= 0) { playoffAppearances += 1; }
						if (userTeam.seasons[i].playoffRoundsWon === 3) { championships += 1; }
					} else if (g.gameType == 5 ) {
						if (userTeam.seasons[i].playoffRoundsWon >= 0) { playoffAppearances += 1; }
						if (userTeam.seasons[i].playoffRoundsWon === 6) { championships += 1; }
					}
					
					
                }
                history.reverse(); // Show most recent season first

                players = player.filter(players, {
                    attrs: ["pid", "name", "pos", "injury", "tid", "hof", "watch"],
                    stats: ["season", "abbrev", "gp", "min", "pts", "trb", "ast", "per", "ewa","min", "pts", "trb", "ast", "per","tp","fg","fga","fgp","kda"],
                    tid: inputs.tid
                });

                for (i = 0; i < players.length; i++) {
                    players[i].stats.reverse();

                    for (j = 0; j < players[i].stats.length; j++) {
                        if (players[i].stats[j].abbrev === userTeam.abbrev) {
                            players[i].lastYr = players[i].stats[j].season + ' ';
                            break;
                        }
                    }					
                    delete players[i].ratings;
                    delete players[i].stats;
                }

                return {
                    abbrev: inputs.abbrev,
                    history: history,
                    players: players,
                    team: {
                        name: userTeam.name,
                        region: userTeam.region,
                        tid: inputs.tid
                    },
                    totalWon: totalWon,
                    totalLost: totalLost,
                    playoffAppearances: playoffAppearances,
                    championships: championships
                };
            });
        }
    }

    function uiFirst(vm) {
        ui.title("Team History");

        ko.computed(function () {
            ui.datatable($("#team-history-players"), 2, _.map(vm.players(), function (p) {
                return [helpers.playerNameLabels(p.pid, p.name, p.injury, [], p.watch), p.pos, String(p.careerStats.gp), helpers.round(p.careerStats.min, 1), helpers.round(p.careerStats.fg, 1), helpers.round(p.careerStats.fga, 1), helpers.round(p.careerStats.fgp, 1), helpers.round(p.careerStats.kda, 1), helpers.round(p.careerStats.tp, 1), p.lastYr, p.hof, p.tid > g.PLAYER.RETIRED && p.tid !== vm.team.tid(), p.tid === vm.team.tid()];
//                return [helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, String(p.age), String(p.born.loc), String(p.ratings.ovr), String(p.ratings.pot), helpers.round(p.stats.min, 1), helpers.round(p.stats.fg, 1), helpers.round(p.stats.fga, 1), helpers.round(p.stats.fgp, 1), helpers.round(p.stats.tp, 1), helpers.formatCurrency(p.contract.amount, "K") + ' thru ' + p.contract.exp, '<div title="' + p.mood.text + '" style="width: 100%; height: 21px; background-color: ' + p.mood.color + '"><span style="display: none">' + p.freeAgentMood[g.userTid] + '</span></div>', negotiateButton];
				
            }), {
                rowCallback: function (row, data) {
                    // Highlight active players
                    if (data[data.length - 1]) {
                        row.classList.add("success"); // On this team
                    } else if (data[data.length - 2]) {
                        row.classList.add("info"); // On other team
                    } else if (data[data.length - 3]) {
                        row.classList.add("danger"); // Hall of Fame
                    }
                }
            });
        }).extend({throttle: 1});

        ui.tableClickableRows($("#team-history-players"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("team-history-dropdown", ["teams"], [vm.abbrev()], updateEvents);
    }

    return bbgmView.init({
        id: "teamHistory",
        get: get,
        mapping: mapping,
        runBefore: [updateTeamHistory],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});