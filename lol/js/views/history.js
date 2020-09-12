/**
 * @name views.history
 * @namespace Summaries of past seasons, leaguewide.
 */
define(["dao", "globals", "ui", "core/player", "core/team", "lib/bluebird", "lib/knockout", "util/bbgmView", "util/helpers", "views/components"], function (dao, g, ui, player, team, Promise, ko, bbgmView, helpers, components) {
    "use strict";

    function get(req) {
        var season;

        season = helpers.validateSeason(req.params.season);

        // If playoffs aren't over, season awards haven't been set
        if (g.phase <= g.PHASE.PLAYOFFS) {
            // View last season by default
            if (season === g.season) {
                season -= 1;
            }
        }

        if (season < g.startingSeason) {
            return {
                errorMessage: "There is no league history yet. Check back after the playoffs."
            };
        }

        return {
            season: season
        };
    }

    function updateHistory(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || updateEvents.indexOf("firstRun") >= 0 || vm.season() !== inputs.season) {
            return Promise.all([
                dao.awards.get({key: inputs.season}),
                dao.players.getAll({
                    index: "retiredYear",
                    key: inputs.season
                }),
                team.filter({
                    attrs: ["tid","cid", "abbrev", "region", "name"],
                    seasonAttrs: ["playoffRoundsWon"],
                    season: inputs.season
                })
            ]).spread(function (awards, retiredPlayers, teams) {
                var champ, i;
				var teamsConf,teamsConf2,teamsConf3;
				var cid;
				
				var LCK, LCS, LMS, LPL,LCSLadder,Worlds;
				
										
				teamsConf = [];
				teamsConf2 = [];
				teamsConf3 = [];

				LCS = false;
				LCSLadder = false;
				LCK = false;
				LPL = false;
				LMS = false;
				Worlds = false;
				
				if (g.gameType == 0) {
					LCS = true;
				} else if ((g.gameType == 1)) {
					LCSLadder = true;
					//LCSExtended = true;
				} else if (g.gameType == 2) {
					LCK = true;
				} else if (g.gameType == 3) {
					LPL = true;						
				} else if (g.gameType == 4) {
					LMS = true;
				} else {
				//	NAConference = true;
				//	EUConference = true;
//					WorldsPlayoff = true;
					Worlds = true;
				}	
				
                // Hack placeholder for old seasons before Finals MVP existed
                if (!awards.hasOwnProperty("finalsMvp")) {
                    awards.finalsMvp = {
                        pid: 0,
                        name: "N/A",
                        pts: 0,
                        trb: 0,
                        ast: 0
                    };
                }

                // Get list of retired players
                retiredPlayers = player.filter(retiredPlayers, {
                    attrs: ["pid", "name", "age", "hof"],
                    season: inputs.season
                });
                for (i = 0; i < retiredPlayers.length; i++) {
                    // Show age at retirement, not current age
                    retiredPlayers[i].age -= g.season - inputs.season;
                }
                retiredPlayers.sort(function (a, b) { return b.age - a.age; });

                // Get champs
                for (i = 0; i < teams.length; i++) {			
				//   console.log(i+" "+teams[i].playoffRoundsWon);
                }
                for (i = 0; i < teams.length; i++) {			
					
				   if ((teams[i].playoffRoundsWon === 3) && (g.gameType === 0)) {
						champ = teams[i];
						break;
					} else if ((teams[i].playoffRoundsWon === 27) && (g.gameType === 1)) {
						champ = teams[i];
						break;
					} else if ((teams[i].playoffRoundsWon === 4) && (g.gameType === 2)) {
						champ = teams[i];
						break;
					} else if ((teams[i].playoffRoundsWon === 6) && (g.gameType === 3)) {
						champ = teams[i];
						break;
					} else if ((teams[i].playoffRoundsWon === 3) && (g.gameType === 4)) {
						champ = teams[i];
						break;
					} else if ((teams[i].playoffRoundsWon === 6) && (g.gameType === 5)) {
						champ = teams[i];
						break;
					}					
                }
				
				
				for (cid = 0; cid < 1; cid++) {
					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
							teamsConf.push(i);
						}
					}				
				}	
				for (cid = 1; cid < 2; cid++) {
					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
							teamsConf2.push(i);
						}
					}				
				}					
				for (cid = 2; cid < 3; cid++) {
					for (i = 0; i < teams.length; i++) {
						if (teams[i].cid === cid) {
							teamsConf3.push(i);
						}
					}				
				}									
				
				
		/*		console.log(teams[teamsConf[7]].playoffRoundsWon);
				console.log(teams[teamsConf[8]].playoffRoundsWon);
				console.log(teams[teamsConf[9]].playoffRoundsWon);
				console.log(teams[teamsConf2[0]].playoffRoundsWon);
				console.log(teams[teamsConf2[1]].playoffRoundsWon);
				console.log(teams[teamsConf2[2]].playoffRoundsWon);
				console.log(teams[teamsConf2[3]].playoffRoundsWon);
				console.log(teams[teamsConf2[4]].playoffRoundsWon);
				console.log(teams[teamsConf2[5]].playoffRoundsWon);
				console.log(teams[teamsConf3[0]].playoffRoundsWon);
				console.log(teams[teamsConf3[1]].playoffRoundsWon);
				console.log(teams[teamsConf3[2]].playoffRoundsWon);
				console.log(teams[teamsConf3[3]].playoffRoundsWon);
				console.log(teams[teamsConf3[4]].playoffRoundsWon);
				console.log(teams[teamsConf3[5]].playoffRoundsWon);
				console.log(teams[teamsConf3[6]].playoffRoundsWon);
				console.log(teams[teamsConf3[7]].playoffRoundsWon);
				console.log(teams[teamsConf3[8]].playoffRoundsWon);
				console.log(teams[teamsConf3[9]].playoffRoundsWon);*/
  

                return {
                    awards: awards,
                    champ: champ,
                    retiredPlayers: retiredPlayers,
                    season: inputs.season,
					LCK: LCK,
					LCS: LCS,
					LMS: LMS,
					LPL: LPL,			
					LCSLadder: LCSLadder,
					Worlds: Worlds,
                    userTid: g.userTid
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("Season Summary - " + vm.season());
        }).extend({throttle: 1});
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("history-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "history",
        get: get,
        runBefore: [updateHistory],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});