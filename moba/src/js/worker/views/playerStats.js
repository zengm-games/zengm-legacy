// @flow

import {PHASE, PLAYER, g} from '../../common';
import {idb} from '../db';
import type {PlayerStatType, UpdateEvents} from '../../common/types';

async function updatePlayers(
    inputs: {
        abbrev: string,
        playoffs: 'playoffs' | 'regularSeason',
        season: number,
        statType: PlayerStatType,
    },
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if ((inputs.season === g.season && (updateEvents.includes('gameSim') || updateEvents.includes('playerMovement'))) || inputs.abbrev !== state.abbrev || inputs.season !== state.season || inputs.statType !== state.statType || inputs.playoffs !== state.playoffs) {
        let players;
        console.log(PLAYER.FREE_AGENT);
        let tid = g.teamAbbrevsCache.indexOf(inputs.abbrev);
        if (tid < 0) { tid = undefined; } // Show all teams

        if (g.season === inputs.season && g.phase <= g.PHASE.PLAYOFFS) {
            players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
            console.log(players);
        } else {
          // this doesn't work
//            players = await idb.getCopies.players({activeSeason: inputs.season});

            players = await idb.getCopies.players({statsTid: tid});
        //    players = await idb.getCopies.players();
            console.log(players);
        }

console.log(players);
    //    tid = g.teamAbbrevsCache.indexOf(inputs.abbrev);
    //    if (tid < 0) { tid = undefined; } // Show all teams

        if (!tid && inputs.abbrev === "watch") {
            players = players.filter(p => p.watch && typeof p.watch !== "function");
        }
console.log(tid);
console.log(inputs);

        players = await idb.getCopies.playersPlus(players, {
//            attrs: ["pid", "name", "tid", "abbrev", "teamRegion", "teamName", "age", "hgtFt", "hgtIn", "weight", "born", "diedYear", "contract", "draft", "face", "mood", "injury", "salaries", "salariesTotal", "awardsGrouped", "freeAgentMood", "imgURL", "watch", "gamesUntilTradable", "college"],
  //          ratings: ["season", "abbrev", "age","MMR","rank","ovr", "pot", "hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb", "skills", "pos"],
    //        stats: ["psid", "season", "tid", "abbrev", "age", "gp", "gs", "min", "fg", "fga", "fgp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp", "ft", "fta", "ftp", "pm", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "per", "ewa","oppJM","kda","scTwr","scKills","region","languages"],

            attrs: ["abbrev", "pid", "name", "age", "injury", "tid", "hof", "watch"],
            ratings: ["skills", "pos"],
//            stats: ["psid", "season", "tid", "abbrev", "age", "gp", "gs", "min", "fg", "fga", "fgp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp", "ft", "fta", "ftp", "pm", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "per", "ewa","oppJM","kda","scTwr","scKills","region","languages"],
//            stats: ["psid", "season", "tid", "abbrev", "age", "gp", "gs", "min", "fg", "fga", "fgp", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange", "tp", "tpa", "tpp", "ft", "fta", "ftp", "pm", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "per", "ewa","oppJM","kda","scTwr","scKills","region","languages"],
//            stats: ["abbrev", "tid", "gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "pm", "per", "ewa", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange","oppJM","kda","scTwr","scKills","region","languages"],
//            stats: ["abbrev", "tid", "gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "pm", "per", "ewa", "fgAtRim", "fgaAtRim", "fgpAtRim", "fgLowPost", "fgaLowPost", "fgpLowPost", "fgMidRange", "fgaMidRange", "fgpMidRange"],
/////            stats: ["abbrev", "tid", "gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "pm", "per", "ewa","kda","scKills"],
                   stats: ["abbrev", "tid", "gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts", "per", "ewa","fgLowPost","fgaLowPost","fgMidRange","oppJM","kda","scTwr","scKills","riftKills","riftAssists","firstBlood"],


//            attrs: ["pid", "name", "age", "injury", "tid", "hof", "watch"],
//            ratings: ["skills", "pos"],
//            stats: ["abbrev", "tid", "gp", "gs", "min", "fg", "fga", "fgp", "tp", "tpa", "tpp", "ft", "fta", "ftp", "orb", "drb", "trb", "ast", "tov", "stl", "blk", "ba", "pf", "pts", "pm", "per", "ewa"],
            season: inputs.season, // If null, then show career stats!
            tid,
            statType: inputs.statType,
            playoffs: inputs.playoffs === "playoffs",
            regularSeason: inputs.playoffs !== "playoffs",
        });
console.log(players);

if (g.season === inputs.season) {
    if (tid !== undefined) {
        players = players.filter(p => p.abbrev === inputs.abbrev);
    }

    for (let i = 0; i < players.length; i++) {
        players[i].stats.abbrev = players[i].abbrev;
    }
} else if (tid !== undefined) {
    players = players.filter(p => p.stats.abbrev === inputs.abbrev);
}
console.log(players);
        // Find max gp to use for filtering
        let gp = 0;
        for (const p of players) {
            if (p.stats.gp > gp) {
                gp = p.stats.gp;
            }
        }
        // Special case for career totals - use g.numGames games, unless this is the first season
        if (!inputs.season) {
            if (g.season > g.startingSeason) {
                gp = g.numGames;
            }
        }

        // Only keep players with more than 5 mpg in regular season, of any PT in playoffs
        if (inputs.abbrev !== 'watch') {
            players = players.filter(p => {
            //  return true;
                // Minutes played
                let gpPlayer;
                if (inputs.statType === 'totals') {
                    if (inputs.season) {
                        gpPlayer = p.stats.gp;
                    } else if (inputs.playoffs !== 'playoffs') {
                        gpPlayer = p.careerStats.gp;
                    }
                } else if (inputs.season) {
                    gpPlayer = p.stats.gp ;
                } else if (inputs.playoffs !== 'playoffs') {
                    gpPlayer = p.careerStats.gp ;
                }

                if (inputs.playoffs !== 'playoffs') {
                    if (gpPlayer !== undefined && gpPlayer > gp*.5) {
                        return true;
                    }
                }

                // Or, keep players who played in playoffs
                if (inputs.playoffs === 'playoffs') {
                    if (inputs.season) {
                        if (p.stats.gp > 0) {
                            return true;
                        }
                    } else if (p.careerStatsPlayoffs.gp > 0) {
                        return true;
                    }
                }

                return false;
            });
        }
console.log(players);
        return {
            players,
            abbrev: inputs.abbrev,
            season: inputs.season,
            statType: inputs.statType,
            playoffs: inputs.playoffs,
        };
    }
}

export default {
    runBefore: [updatePlayers],
};
