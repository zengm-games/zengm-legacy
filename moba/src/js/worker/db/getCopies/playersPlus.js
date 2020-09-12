// Typing is too hard due to https://github.com/facebook/flow/issues/183

import backboard from 'backboard';
import _ from 'underscore';
import {PLAYER, g, helpers} from '../../../common';
import {filterOrderStats, mergeByPk} from './helpers';
import {player} from '../../core';
import {idb} from '../../db';
import type {Player, PlayerFiltered, PlayerStatType} from '../../../common/types';

type PlayerAttr = string;
type PlayerRatingAttr = string;
type PlayerStatAttr = string;

export type PlayerOptions = {
    season?: number,
    tid?: number,
    attrs?: PlayerAttr[],
    ratings?: PlayerStatAttr[],
    stats?: PlayerRatingAttr[],
    playoffs?: boolean,
    regularSeason?: boolean,
    showNoStats?: boolean,
    showRookies?: boolean,
    showRetired?: boolean,
    fuzz?: boolean,
    oldStats?: boolean,
    numGamesRemaining?: number,
    statType?: PlayerStatType,
};

type PlayerOptionsRequired = {
    season?: number,
    tid?: number,
    attrs: PlayerAttr[],
    ratings: PlayerStatAttr[],
    stats: PlayerRatingAttr[],
    playoffs: boolean,
    regularSeason: boolean,
    showNoStats: boolean,
    showRookies: boolean,
    showRetired: boolean,
    fuzz: boolean,
    oldStats: boolean,
    numGamesRemaining: number,
    statType: PlayerStatType,
};

const awardsOrder = [
    "Inducted into the Hall of Fame",
    "Won Championship",
    "Most Valuable Player",
    "Finals MVP",
    "Defensive Player of the Year",	
    "Sixth Man of the Year",
    "Rookie of the Year",
    "League Scoring Leader",
    "League Rebounding Leader",
    "League Assists Leader",
    "League Steals Leader",
    "League Blocks Leader",
    "First Team All-League",
    "Second Team All-League",
    "Third Team All-League",
    "First Team All-Defensive",
    "Second Team All-Defensive",
    "Third Team All-Defensive",
    "All Rookie Team",
    "Regional - Most Valuable Player",	
    "Regional - All-League",		
    "Regional - Won Championship",	
];

const processAttrs = (output: PlayerFiltered, p: Player, {
    attrs,
    fuzz,
    numGamesRemaining,
    season,
}: PlayerOptionsRequired) => {
    for (const attr of attrs) {
        if (attr === 'age') {
            output.age = g.season - p.born.year;
        } else if (attr === 'diedYear') {
            // Non-dead players wil not have any diedYear property
            output.diedYear = p.hasOwnProperty('diedYear') ? p.diedYear : null;
        } else if (attr === 'draft') {
            output.draft = Object.assign({}, p.draft, {age: p.draft.year - p.born.year});
            if (fuzz) {
                output.draft.ovr = player.fuzzRating(output.draft.ovr, p.ratings[0].fuzz);
                output.draft.pot = player.fuzzRating(output.draft.pot, p.ratings[0].fuzz);
            }
            // Inject abbrevs
            output.draft.abbrev = g.teamAbbrevsCache[output.draft.tid];
            output.draft.originalAbbrev = g.teamAbbrevsCache[output.draft.originalTid];
        } else if (attr === 'hgtFt') {
            output.hgtFt = Math.floor(p.hgt / 12);
        } else if (attr === 'hgtIn') {
            output.hgtIn = p.hgt - 12 * Math.floor(p.hgt / 12);
        } else if (attr === 'contract') {
            output.contract = helpers.deepCopy(p.contract);  // [millions of dollars]
            output.contract.amount /= 1000;  // [millions of dollars]
        } else if (attr === 'cashOwed') {
            output.cashOwed = player.contractSeasonsRemaining(p.contract.exp, numGamesRemaining) * p.contract.amount / 1000;  // [millions of dollars]
        } else if (attr === 'abbrev') {
            output.abbrev = helpers.getAbbrev(p.tid);
        } else if (attr === 'teamRegion') {
            if (p.tid >= 0) {
                output.teamRegion = g.teamRegionsCache[p.tid];
            } else {
                output.teamRegion = '';
            }
        } else if (attr === 'teamName') {
            if (p.tid >= 0) {
                output.teamName = g.teamNamesCache[p.tid];
            } else if (p.tid === PLAYER.FREE_AGENT) {
                output.teamName = 'Free Agent';
            } else if (p.tid === PLAYER.UNDRAFTED || p.tid === PLAYER.UNDRAFTED_2 || p.tid === PLAYER.UNDRAFTED_3 || p.tid === PLAYER.UNDRAFTED_FANTASY_TEMP) {
                output.teamName = 'Draft Prospect';
            } else if (p.tid === PLAYER.RETIRED) {
                output.teamName = 'Retired';
            }
        } else if (attr === 'injury' && season !== undefined && season < g.season) {
            output.injury = {type: 'Healthy', gamesRemaining: 0};
        } else if (attr === 'salaries') {
            output.salaries = _.map(p.salaries, salary => { salary.amount /= 1000; return salary; });
        } else if (attr === 'salariesTotal') {
            output.salariesTotal = _.reduce(output.salaries, (memo, salary) => memo + salary.amount, 0);
        } else if (attr === 'languagesGrouped') {
			//not used/doesn't exist
            output.languagesGrouped = [];
		//	console.log(p.languages);
			/*output.languagesGrouped.push(p.languages[0]);
			for (let i = 1; i < p.languages.length; i++) {	
				if (p.languages[i] != "undefined") {
					output.languagesGrouped.push(", "+p.languages[i]);
				}
            }
			console.log(p.languages);			*/
			//output.languagesGrouped.push(p.languages[p.languages.length-1]);
		} else if (attr === 'awardsGrouped') {
            output.awardsGrouped = [];
			console.log(p.awards);
            const awardsGroupedTemp = _.groupBy(p.awards, award => award.type);
			console.log(awardsGroupedTemp);
			console.log(awardsOrder);
            for (const award of awardsOrder) {
                if (awardsGroupedTemp.hasOwnProperty(award)) {
                    output.awardsGrouped.push({
                        type: award,
                        count: awardsGroupedTemp[award].length,
                        seasons: helpers.yearRanges(_.pluck(awardsGroupedTemp[award], 'season')),
                    });
                }
            }
        } else if (attr === 'name') {
            //output.name = `${p.firstName}" '"+p.userID +"' "${p.lastName}`;
            output.name = `${p.firstName}  '${p.userID}' ${p.lastName}`;
			//${
        } else {
            // Several other attrs are not primitive types, so deepCopy
            output[attr] = helpers.deepCopy(p[attr]);
        }
    }
};

const processRatings = async (output: PlayerFiltered, p: Player, {
    fuzz,
    ratings,
    stats,
    season,
}: PlayerOptionsRequired) => {
	
//	console.log(output);
//console.log(JSON.parse(JSON.stringify(output)));	// 3 (same)
//console.log(JSON.parse(JSON.stringify(p)));	// started (same)
    output.ratings = p.ratings.map((pr, i) => {
        const row = {};
	//console.log("got here");;
        if (season !== undefined && pr.season !== season) {
            return undefined;
        }
//.log(JSON.parse(JSON.stringify(ratings)));	// list of 28 (0-27) (same)
        for (const attr of ratings) {
		//	console.log(attr); // should go through all 28
//console.log(JSON.parse(JSON.stringify(row[attr])));		// shows same data
			
			//console.log(row[attr]); // should go through all 28
            if (attr === 'skills') {
                row.skills = helpers.deepCopy(pr.skills);
            } else if (attr === 'dovr' || attr === 'dpot' || attr === 'dMMR') {
                // Handle dovr and dpot - if there are previous ratings, calculate the fuzzed difference
                const cat = attr.slice(1); // either ovr or pot
                if (i > 0) {
                    row[attr] = player.fuzzRating(pr[cat], pr.fuzz) - player.fuzzRating(p.ratings[i - 1][cat], p.ratings[i - 1].fuzz);
                } else {
                    row[attr] = 0;
                }
            } else if (attr === 'age') {
                row.age = pr.season - p.born.year;
            } else if (attr === 'abbrev') {
                // Find the last stats entry for that season, and use that to determine the team. Requires tid to be requested from stats (otherwise, need to refactor stats fetching to happen outside of processStats)
                if (!stats.includes('tid')) {
                    throw new Error('Crazy I know, but if you request "abbrev" from ratings, you must also request "tid" from stats');
                }
                let tidTemp;
                for (const ps of output.stats) {
                    if (ps.season === pr.season && ps.playoffs === false) {
                        tidTemp = ps.tid;
                    }
                }
                if (tidTemp !== undefined) {
                    row.abbrev = helpers.getAbbrev(tidTemp);
                } else {
                    row.abbrev = undefined;
                }
		   } else if (attr === 'languagesGrouped') {				
				row[attr] = [];
			//	console.log(pr.languages);
			//	console.log(pr.languages[0]);				
				row[attr].push(pr.languages[0]);
				for (let i = 1; i < pr.languages.length; i++) {
					if (pr.languages[i] != undefined) {
//console.log(i+" "+pr.languages[i]); 
						row[attr].push(", "+pr.languages[i]);
					}
				}
			//	console.log(row[attr]);
				//row[attr].push(pr.languages[pr.languages.length-1]);				
            } else if (fuzz && attr !== 'fuzz' && attr !== 'season' && attr !== 'seasonSplit' && attr !== 'hgt' && attr !== 'pos' && attr !== 'MMR' && attr !== 'rank' && attr !== 'languages' && attr !== 'region') {
                row[attr] = player.fuzzRating(pr[attr], pr.fuzz);
            } else {
                row[attr] = pr[attr];
            }
		//	console.log(row[attr]); // shows all data
//			console.log(pr[attr]); // shows all data
//console.log(JSON.parse(JSON.stringify(row[attr])));		// shows same data
        }
//console.log(JSON.parse(JSON.stringify(row)));	 // ratings row completely updated
        return row;
    }).filter((row) => row !== undefined); // Filter at the end because dovr/dpot needs to look back


    if (season !== undefined) {
        output.ratings = output.ratings[0];
    }
};

const genStatsRow = (p, ps, stats, statType) => {
    const row = {};

    for (const attr of stats) {
        if (attr === 'gp') {
            row.gp = ps.gp;
        } else if (attr === 'championStats') {
			//console.log(ps.championStats)
			row.championStats = helpers.deepCopy(ps.championStats);
			/*console.log(row.championStats);
			console.log(row.championStats[0]);
			console.log(row.championStats[0].fg);
			if (row.championStats.length > 0) {
				console.log(row.championStats.length);
				console.log(row.championStats);
				console.log(row.championStats[0]);
				console.log(row.championStats[0].fg);
				
				row.championStats[0].kda = (row.championStats[0].fg+row.championStats[0].fgp)/row.championStats[0].fga;
			}
			console.log(row.championStats);*/
           // row.championStats = ps.championStats;
        } else if (attr === 'gs') {
            row.gs = ps.gs;
		} else if (attr === 'kda') {
			//if (ps.fga > 0) {
				row.kda = (ps.fg+ps.fgp) / ps.fga;
			//} else {
				//row.kda = infinity;
			//}
						
       /* } else if (attr === 'fgp') {
            if (ps.fga > 0) {
                row.fgp = 100 * ps.fg / ps.fga;
            } else {
                row.fgp = 0;
            }
        } else if (attr === 'fgpAtRim') {
            if (ps.fgaAtRim > 0) {
                row.fgpAtRim = 100 * ps.fgAtRim / ps.fgaAtRim;
            } else {
                row.fgpAtRim = 0;
            }
        } else if (attr === 'fgpLowPost') {
            if (ps.fgaLowPost > 0) {
                row.fgpLowPost = 100 * ps.fgLowPost / ps.fgaLowPost;
            } else {
                row.fgpLowPost = 0;
            }
        } else if (attr === 'fgpMidRange') {
            if (ps.fgaMidRange > 0) {
                row.fgpMidRange = 100 * ps.fgMidRange / ps.fgaMidRange;
            } else {
                row.fgpMidRange = 0;
            }
        } else if (attr === 'tpp') {
            if (ps.tpa > 0) {
                row.tpp = 100 * ps.tp / ps.tpa;
            } else {
                row.tpp = 0;
            }
        } else if (attr === 'ftp') {
            if (ps.fta > 0) {
                row.ftp = 100 * ps.ft / ps.fta;
            } else {
                row.ftp = 0;
            }*/
        } else if (attr === 'season') {
            row.season = ps.season;
        } else if (attr === 'seasonSplit') {
            row.seasonSplit = ps.seasonSplit;
        } else if (attr === 'age') {
            row.age = ps.season - p.born.year;
        } else if (attr === 'abbrev') {
            if (ps.tid === undefined) {
                row.abbrev = helpers.getAbbrev(PLAYER.FREE_AGENT);
            } else {
                row.abbrev = helpers.getAbbrev(ps.tid);
            }
        } else if (attr === 'tid') {
            if (ps.tid === undefined) {
                row.tid = PLAYER.FREE_AGENT;
            } else {
                row.tid = ps.tid;
            }
        } else if (attr === 'per') {
            row.per = ps.per;
        } else if (attr === 'ewa') {
            row.ewa = ps.ewa;
        } else if (attr === 'yearsWithTeam') {
            row.yearsWithTeam = ps.yearsWithTeam;
        } else if (attr === 'psid') {
            row.psid = ps.psid;
        } else if (statType === 'totals') {
            row[attr] = ps[attr];
        } else if (statType === 'per36' && attr !== 'min') { // Don't scale min by 36 minutes
            row[attr] = ps.min > 0 ? ps[attr] * 36 / ps.min : 0;
        } else {
            row[attr] = ps.gp > 0 ? ps[attr] / ps.gp : 0;
        }

        // For keepWithNoStats
        if ((row[attr] === undefined || Number.isNaN(row[attr]))) {
            row[attr] = 0;
        }
    }

    // Since they come in same stream, always need to be able to distinguish
    row.playoffs = ps.playoffs;

    return row;
};

const reduceCareerStats = (careerStats, attr, playoffs) => {
    return careerStats
        .filter((cs) => cs.playoffs === playoffs)
        .map((cs) => {
            if (attr === 'per') {
                // Special case for PER, weight by minutes
                return cs.per * cs.min;
            }
            return cs[attr];
        })
        .reduce((memo, num) => memo + num, 0);
};

const processStats = async (output: PlayerFiltered, p: Player, keepWithNoStats: boolean, {
    playoffs,
    regularSeason,
    season,
    tid,
    showNoStats,
    oldStats,
    statType,
    stats,
}: PlayerOptionsRequired) => {
    let playerStats;
//	console.log(p); //before
//	console.log(keepWithNoStats); // false	
//	console.log(output); // after transform, this is limited	
	let output2 = output;
//	console.log(output2); // after transform, this is limited	
//	console.log(JSON.parse(JSON.stringify(output2))); // empty
    const playerStatsFromCache = () => {
        // Last 1-2 seasons, from cache
        return idb.cache.playerStats.indexGetAll('playerStatsAllByPid', p.pid);
    };
//	console.log(playerStatsFromCache); //    	
	//console.log(playerStatsFromCache);	
	//console.log("got here");
//	console.log(season); //undefined
//	console.log(g.season);	// 2018
//	console.log(p.tid);	//4
    if (season === undefined || p.tid === PLAYER.RETIRED) {
        // All seasons, or retired player with stats not in cache
        playerStats = mergeByPk(
            await idb.league.playerStats.index('pid, season, tid').getAll(backboard.bound([p.pid], [p.pid, ''])),
            await playerStatsFromCache(),
            idb.cache.storeInfos.playerStats.pk,
        );
//	console.log(JSON.parse(JSON.stringify(playerStats))); //    	
    } else if (season >= g.season - 1) {
        playerStats = await playerStatsFromCache();
//	console.log(JSON.parse(JSON.stringify(playerStats))); //   normally goes here full stats, file also has the smame thing
    } else {
        // Single season, from database
        playerStats = await idb.league.playerStats.index('pid, season, tid').getAll(backboard.bound([p.pid, season], [p.pid, season, '']));
	//console.log(JSON.parse(JSON.stringify(playerStats))); // 
    }
	//console.log(playerStats);
	//console.log(JSON.parse(JSON.stringify(playerStats))); //    all stats w/ playofs, file also full stats w/ playoffs
    // Handle playoffs/regularSeason
    playerStats = filterOrderStats(playerStats, playoffs, regularSeason);
	//console.log(playerStats);
    // Only season(s) and team in question
	
    playerStats = playerStats.filter((ps) => {
	//console.log(ps); // all stats /
//	console.log(ps.season+" "+season);  // 2018 2018  // 2012 //2018
	//console.log(ps.tid+" "+tid); // 0 undefined // 0 undefined
		
        const seasonCheck = season === undefined || ps.season === season;
        const tidCheck = tid === undefined || ps.tid === tid;
		//console.log(seasonCheck);  // true / false
	//	console.log(tidCheck);  // true  / true
		
        return seasonCheck && tidCheck;
    });
	//console.log(JSON.parse(JSON.stringify(playerStats))); // all stats w/ playofs // file empty
	//console.log(playerStats); // has this so far
    // oldStats crap
    if (oldStats && season !== undefined && playerStats.length === 0) {
        const oldSeason = season - 1;

        // This isn't very DRY with above code, but oh well

        if (oldSeason >= g.season - 1) {
            playerStats = await playerStatsFromCache();
        } else {
            playerStats = await idb.league.playerStats.index('pid, season, tid').getAll(backboard.bound([p.pid, oldSeason], [p.pid, oldSeason, '']));
        }
        playerStats = filterOrderStats(playerStats, playoffs, regularSeason);
	//console.log(JSON.parse(JSON.stringify(playerStats))); // 		
        playerStats = playerStats.filter((ps) => {
            const seasonCheck = season === undefined || ps.season === oldSeason;
            const tidCheck = tid === undefined || ps.tid === tid;
            return seasonCheck && tidCheck;
        });
    }

    if (playerStats.length === 0 && showNoStats) {
        playerStats.push({});
    }
	//console.log(JSON.parse(JSON.stringify(playerStats))); // all stats with playoffs
	
    const careerStats = [];

    output.stats = playerStats.map((ps) => {
        if (season === undefined) {
            careerStats.push(ps);
        }

        return genStatsRow(p, ps, stats, statType);
    });

	//console.log(output);
	//console.log(JSON.parse(JSON.stringify(output)));	// empty, has stats and playoffs false
    if (season !== undefined && ((playoffs && !regularSeason) || (!playoffs && regularSeason))) {
        output.stats = output.stats[output.stats.length - 1]; // Take last value, in case player was traded/signed to team twice in a season
	//console.log(output);		
	//console.log(JSON.parse(JSON.stringify(output)));	// empty, has stats and playoffs false
    } else if (season === undefined) {
        // Aggregate annual stats and ignore other things
        const ignoredKeys = ['pid', 'season', 'tid', 'yearsWithTeam'];
        const statSums = {};
        const statSumsPlayoffs = {};
        const attrs = careerStats.length > 0 ? Object.keys(careerStats[0]) : [];
        for (const attr of attrs) {
            if (!ignoredKeys.includes(attr)) {
                statSums[attr] = reduceCareerStats(careerStats, attr, false);
                statSumsPlayoffs[attr] = reduceCareerStats(careerStats, attr, true);
            }
        }

        // Special case for PER, weight by minutes
        statSums.per /= statSums.min;
        statSumsPlayoffs.per /= statSumsPlayoffs.min;

        if (regularSeason) {
            output.careerStats = genStatsRow(p, statSums, stats, statType);
        }
        if (playoffs) {
            output.careerStatsPlayoffs = genStatsRow(p, statSumsPlayoffs, stats, statType);
        }
	//console.log(output);	
	//console.log(JSON.parse(JSON.stringify(output)));	// never got to	
    }
};

const processPlayer = async (p: Player, options: PlayerOptions) => {
    const output = {};
	//console.log("got here");
	//console.log(p);
	//console.log(options);	
	//	console.log(JSON.parse(JSON.stringify(p))); // before all

    const keepWithNoStats = (options.showRookies && p.draft.year >= g.season && (options.season === g.season || options.season === undefined)) || (options.showNoStats && (options.season === undefined || options.season > p.draft.year));

	//	console.log(keepWithNoStats);
	//	console.log(options.stats.length);		
	//console.log(JSON.parse(JSON.stringify(output))); // empty
	
    if (options.stats.length > 0 || keepWithNoStats) {
	//console.log("got here");		
	//console.log(output);
	//console.log(JSON.parse(JSON.stringify(output)));
	//console.log(options); // season says 2018 // file 2018 should be 2012
        await processStats(output, p, keepWithNoStats, options);
//	console.log(JSON.parse(JSON.stringify(p))); //starting
	//console.log(JSON.parse(JSON.stringify(output))); // 3 part (correct)
//	console.log(output);		
        // Only add a player if filterStats finds something (either stats that season, or options overriding that check)
        if (output.stats === undefined && !keepWithNoStats) {
//	console.log("got here");			
            return undefined;
        }
    }
	//return output;
	// bad by here
//console.log(options.ratings.length); // 20
    if (options.ratings.length > 0) {
        processRatings(output, p, options);
	//console.log(JSON.parse(JSON.stringify(output))); // 4 part (not correct)
//	console.log(output);
        // Only add a player if he was active for this season and thus has ratings for this season
        if (output.ratings === undefined) {
//	console.log(output);			
            return undefined;
        }
    }
	//console.log(output);	
	//console.log("got here");
    if (options.attrs.length > 0) {
        processAttrs(output, p, options);
    }
//	console.log(JSON.parse(JSON.stringify(output))); // merged (all parts) (not reached)
	//console.log("got here");
    return output;
};

/**
 * Retrieve a filtered copy of a player object, or an array of filtered player objects.
 *
 * This can be used to retrieve information about a certain season, compute average statistics from the raw data, etc.
 *
 * For a player object (p), create an object suitible for output based on the appropriate options, most notably a options.season and options.tid to find rows in of stats and ratings, and options.attributes, options.stats, and options.ratings to extract teh desired information. In the output, the attributes keys will be in the root of the object. There will also be stats and ratings properties containing filtered stats and ratings objects.
 *
 * If options.season is undefined, then the stats and ratings objects will contain lists of objects for each season and options.tid is ignored. Then, there will also be a careerStats property in the output object containing an object with career averages.
 *
 * There are several more options (all described below) which can make things pretty complicated, but most of the time, they are not needed.
 *
 * @memberOf core.player
 * @param {Object|Array.<Object>} players Player object or array of player objects to be filtered.
 * @param {Object} options Options, as described below.
 * @param {number=} options.season Season to retrieve stats/ratings for. If undefined, return stats/ratings for all seasons in a list as well as career totals in player.careerStats.
 * @param {number=} options.tid Team ID to retrieve stats for. This is useful in the case where a player played for multiple teams in a season. Eventually, there should be some way to specify whether the stats for multiple teams in a single season should be merged together or not. For now, if this is undefined, it just picks the first entry, which is clearly wrong.
 * @param {Array.<string>=} options.attrs List of player attributes to include in output.
 * @param {Array.<string>=} options.ratings List of player ratings to include in output.
 * @param {Array.<string>=} options.stats List of player stats to include in output.
 * @param {boolean=} options.playoffs Boolean representing whether to return playoff stats (statsPlayoffs and careerStatsPlayoffs) or not; default is false. Either way, regular season stats are always returned.
 * @param {boolean=} options.showNoStats When true, players are returned with zeroed stats objects even if they have accumulated no stats for a team (such as  players who were just traded for, free agents, etc.); this applies only for regular season stats. To show draft prospects, options.showRookies is needed. Default is false, but if options.stats is empty, this is always true.
 * @param {boolean=} options.showRookies If true (default false), then future draft prospects and rookies drafted in the current season (g.season) are shown if that season is requested. This is mainly so, after the draft, rookies can show up in the roster, player ratings view, etc; and also so prospects can be shown in the watch list. After the next season starts, then they will no longer show up in a request for that season since they didn't actually play that season.
 * @param {boolean=} options.showRetired If true (default false), then players with no ratings for the current season are still returned, with either 0 for every rating and a blank array for skills (retired players) or future ratings (draft prospects). This is currently only used for the watch list, so retired players (and future draft prospects!) can still be watched.
 * @param {boolean=} options.fuzz When true (default false), noise is added to any returned ratings based on the fuzz variable for the given season (default: false); any user-facing rating should use true, any non-user-facing rating should use false.
 * @param {boolean=} options.oldStats When true (default false), stats from the previous season are displayed if there are no stats for the current season. This is currently only used for the free agents list, so it will either display stats from this season if they exist, or last season if they don't.
 * @param {number=} options.numGamesRemaining If the "cashOwed" attr is requested, options.numGamesRemaining is used to calculate how much of the current season's contract remains to be paid. This is used for buying out players.
 * @param {string=} options.statType What type of stats to return, 'perGame', 'per36', or 'totals' (default is 'perGame).
 * @return {Object|Array.<Object>} Filtered player object or array of filtered player objects, depending on the first argument.
 */
const getCopies = async (players: Player[], {
    season,
    seasonSplit,	
    tid,
    attrs = [],
    ratings = [],
    stats = [],
    playoffs = false,
    regularSeason = true,
    showNoStats = false,
    showRookies = false,
    showRetired = false,
    fuzz = false,
    oldStats = false,
    numGamesRemaining = 0,
    statType = 'perGame',
}: PlayerOptions = {}): Promise<PlayerFiltered[]> => {
    const options: PlayerOptionsRequired = {
        season,
        seasonSplit,		
        tid,
        attrs,
        ratings,
        stats,
        playoffs,
        regularSeason,
        showNoStats,
        showRookies,
        showRetired,
        fuzz,
        oldStats,
        numGamesRemaining,
        statType,
    };
 
	//console.log("got here");
	//console.log(players); // before all
//	console.log(options); // season 2018	// file is 2018 , should be 2012
    const playersFiltered = await Promise.all(players.map((p) => processPlayer(p, options)));	
//	console.log("got here");
//	console.log(playersFiltered); // all
//	console.log("got here");	
    return playersFiltered.filter((p) => p !== undefined);
};

export default getCopies;
