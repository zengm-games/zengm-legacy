// @flow

import {PHASE, g} from '../../common';
import {season, team, trade} from '../core';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateRoster(
    inputs: {abbrev: string, season: number, tid: number},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if (updateEvents.includes('watchList') || (inputs.season === g.season && (updateEvents.includes('gameSim') || updateEvents.includes('playerMovement'))) || inputs.abbrev !== state.abbrev || inputs.season !== state.season) {
        const vars: any = {
            abbrev: inputs.abbrev,
            season: inputs.season,
            editable: inputs.season === g.season && inputs.tid === g.userTid,
            salaryCap: g.salaryCap/1000,
            showTradeFor: inputs.season === g.season && inputs.tid !== g.userTid,
            godMode: g.godMode,
            maxRosterSize: g.maxRosterSize == undefined ? 10 : g.maxRosterSize,
        };

        vars.t = await idb.getCopy.teamsPlus({
            season: inputs.season,
            tid: inputs.tid,
            attrs: ["tid", "region", "name", "strategy", "imgURL", "imgURLCountry","country","countrySpecific"],
            seasonAttrs: ["profit", "wonSummer", "lostSummer", "wonSpring", "lostSpring", "won", "lost", "playoffRoundsWonWorlds","playoffRoundsWonWorldsGr", "playoffRoundsWon", "imgURLCountry","countrySpecific", "cidStart","cidMid"],
        });

		if (g.gameType == 6) {
			vars.t.seasonAttrs.playoffRoundsWon = vars.t.seasonAttrs.playoffRoundsWonWorlds
		}

		if (g.gameType == 7) {
			vars.t.seasonAttrs.playoffRoundsWon = vars.t.seasonAttrs.playoffRoundsWonWorlds
			var levelStart = "LCS";
			var levelMid = "LCS";
			vars.t.seasonAttrs.levelStart = vars.t.seasonAttrs.cidStart % 3;
			vars.t.seasonAttrs.levelMid = vars.t.seasonAttrs.cidMid % 3;
			if (vars.t.seasonAttrs.levelStart == 0) {
				levelStart = "LCS";
			//console.log(levelStart);

			} else if (vars.t.seasonAttrs.levelStart == 1) {
				levelStart = "CS";
			///console.log(levelStart);

			} else if (vars.t.seasonAttrs.levelStart == 2) {
				levelStart = "Ladder";
			//console.log(levelStart);

			}
			if (vars.t.seasonAttrs.levelMid == 0) {
				levelMid = "LCS";
			//console.log(levelMid);

			} else if (vars.t.seasonAttrs.levelMid == 1) {
				levelMid = "CS";
			//console.log(levelMid);

			} else if (vars.t.seasonAttrs.levelMid == 2) {
				levelMid = "Ladder";
			//console.log(levelMid);

			}
			vars.t.seasonAttrs.levelStart = levelStart;
			vars.t.seasonAttrs.levelMid = levelMid;

		}
		//console.log(vars.t);
		if (vars.t.imgURLCountry == undefined) {
			vars.t.imgURLCountry = vars.t.seasonAttrs.imgURLCountry
		}
		vars.t.imgURLCountry = vars.t.imgURLCountry.replace(/ +/g, "");
//.split(" ").join();

        const attrs = ["imgURL", "pid", "tid", "draft", "name", "userID", "age", "born", "contract", "cashOwed", "rosterOrder", "injury", "ptModifier", "watch", "gamesUntilTradable", "ban", "pick","languages","languagesGrouped"];  // tid and draft are used for checking if a player can be released without paying his salary
        const ratings = ["MMR","ovr", "pot", "dovr", "dpot", "skills", "pos","languages","languagesGrouped"];
        const stats = ["gp", "min", "pts", "ast", "per", "yearsWithTeam","fg","fga","fgp", "tp","trb","fgMidRange", "kda"];

        if (inputs.season === g.season) {
            // Show players currently on the roster
            let [schedule, players] = await Promise.all([
                season.getSchedule(),
                idb.cache.players.indexGetAll('playersByTid', inputs.tid),
            ]);
            const payroll = (await team.getPayroll(inputs.tid))[0];

            // numGamesRemaining doesn't need to be calculated except for g.userTid, but it is.
            let numGamesRemaining = 0;
            for (let i = 0; i < schedule.length; i++) {
                if (inputs.tid === schedule[i].homeTid || inputs.tid === schedule[i].awayTid) {
                    numGamesRemaining += 1;
                }
            }
		//	console.log(players);
		//	console.log(inputs.season);
            players = await idb.getCopies.playersPlus(players, {
                attrs,
                ratings,
                stats,
                season: inputs.season,
                tid: inputs.tid,
                showNoStats: true,
                showRookies: true,
                fuzz: true,
                numGamesRemaining,
            });
		///	console.log(players);
            players.sort((a, b) => a.rosterOrder - b.rosterOrder);
		//	console.log(players);
            // Add untradable property
            players = trade.filterUntradable(players);

            for (let i = 0; i < players.length; i++) {
                // Can release from user's team, except in playoffs because then no free agents can be signed to meet the minimum roster requirement
                if (inputs.tid === g.userTid && (g.phase !== g.PHASE.PLAYOFFS || players.length > 10) && !g.gameOver && players.length > 5) {
                    players[i].canRelease = true;
                } else {
                    players[i].canRelease = false;
                }

                // Convert ptModifier to string so it doesn't cause unneeded knockout re-rendering
                players[i].ptModifier = String(players[i].ptModifier);
            }

            vars.players = players;
            vars.payroll = payroll/1000;
        } else {
            // Show all players with stats for the given team and year
            // Needs all seasons because of YWT!
            let players = await idb.getCopies.players({statsTid: inputs.tid});
            players = await idb.getCopies.playersPlus(players, {
                attrs,
                ratings,
                stats,
                season: inputs.season,
                tid: inputs.tid,
                fuzz: true,
            });
            players.sort((a, b) => b.stats.gp * b.stats.min - a.stats.gp * a.stats.min);

            // This is not immediately needed, because players from past seasons don't have the "Trade For" button displayed. However, if an old season is loaded first and then a new season is switched to, Knockout will try to display the Trade For button before all the player objects are updated to include it. I think it might be the komapping.fromJS part from bbgmView not applying everything at exactly the same time.
            players = trade.filterUntradable(players);

            for (let i = 0; i < players.length; i++) {
                players[i].age -= g.season - inputs.season;
                players[i].canRelease = false;
            }

            vars.players = players;
            vars.payroll = undefined;
        }
console.log(vars);
        return vars;
    }
}

export default {
    runBefore: [updateRoster],
};
