// @flow

import orderBy from 'lodash.orderby';
import {PLAYER, g} from '../common';
import type {GameProcessed, GameProcessedCompleted, Pick, TeamBasic} from '../common/types';

/**
 * Validate that a given abbreviation corresponds to a team.
 *
 * If the abbreviation is not valid, then g.userTid and its correspodning abbreviation will be returned.
 *
 * @memberOf util.helpers
 * @param  {string} abbrev Three-letter team abbreviation, like "ATL".
 * @return {Array} Array with two elements, the team ID and the validated abbreviation.
 */
function validateAbbrev(abbrev: string): [number, string] {
    let tid = g.teamAbbrevsCache.indexOf(abbrev);

    if (tid < 0) {
        tid = g.userTid;
        abbrev = g.teamAbbrevsCache[tid];
    }

    return [tid, abbrev];
}

/**
 * Validate that a given team ID corresponds to a team.
 *
 * If the team ID is not valid, then g.userTid and its correspodning abbreviation will be returned.
 *
 * @memberOf util.helpers
 * @param {number|string} tid Integer team ID.
 * @return {Array} Array with two elements, the validated team ID and the corresponding abbreviation.
 */
function validateTid(tid: number | string): [number, string] {
    tid = parseInt(tid, 10);

    if (tid < 0 || tid >= g.teamAbbrevsCache.length || isNaN(tid)) {
        tid = g.userTid;
    }
    const abbrev = g.teamAbbrevsCache[tid];

    return [tid, abbrev];
}

/**
 * Get the team abbreviation for a team ID.
 *
 * For instance, team ID 0 is Atlanta, which has an abbreviation of ATL. This is a convenience wrapper around validateTid, excpet it will return "FA" if you pass PLAYER.FREE_AGENT.
 *
 * @memberOf util.helpers
 * @param {number|string} tid Integer team ID.
 * @return {string} Abbreviation
 */
function getAbbrev(tid: number | string): string {
    tid = parseInt(tid, 10);

    if (tid === PLAYER.FREE_AGENT) {
        return "FA";
    }
    if (tid < 0 || isNaN(tid)) {
        // Draft prospect or retired
        return "";
    }
    const result = validateTid(tid);
    const abbrev = result[1];

    return abbrev;
}

/**
 * Validate the given season.
 *
 * Currently this doesn't really do anything except replace "undefined" with g.season.
 *
 * @memberOf util.helpers
 * @param {number|string|undefined} season The year of the season to validate. If undefined, then g.season is used.
 * @return {number} Validated season (same as input unless input is undefined, currently).
 */
function validateSeason(season?: number | string): number {
    if (season === undefined) {
        return g.season;
    }

    season = parseInt(season, 10);

    if (isNaN(season)) {
        return g.season;
    }

    return season;
}

/**
 * Take a list of teams (similar to the output of getTeamsDefault) and add popRank properties, where 1 is the largest population and teams.length is the smallest.
 *
 * @param {Array.<Object>} teams Teams without popRank properties.
 * @return {Array.<Object>} Teams with added popRank properties.
 */
function addPopRank(teams: any[]): any[] {
    // Add popRank
    const teamsSorted = teams.slice(); // Deep copy
    teamsSorted.sort((a, b) => b.pop - a.pop);
    for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teamsSorted.length; j++) {
            if (teams[i].tid === teamsSorted[j].tid) {
                teams[i].popRank = j + 1;
                break;
            }
        }
    }

    return teams;
}


function getGameType() {
var gameType;


gameType = [
//            {tid: 0, cid: 0, did: 2, region: "Atlanta", name: "Gold Club", abbrev: "ATL", pop: 4.3},
//     {typeid: 0, teams: 20, tour: 4, name: "20 teams, 4 team tournament, 5 conferences"},

   // LCK Korea
   // LPL China
   // LMS East Asia
   // Worlds - all plus Turkey Russia Oceania Brazil and Latin America
    {typeid: 0, teams: 10, tour: 4, name: "NA LCS (10 Teams)"},
    {typeid: -1, teams: 10, tour: 4, name: "EU LCS (10 Teams)"},
    {typeid: 1, teams: 30, tour: 4, name: "NA LCS, CS, and Ladder (30 Teams)"},
    {typeid: -2, teams: 30, tour: 4, name: "EU LCS, CS, and Ladder (30 Teams)"},
    {typeid: 2, teams: 10, tour: 4, name: "LCK (10 Teams)"},
    {typeid: 3, teams: 12, tour: 32, name: "LPL (12 Teams)"},
    {typeid: 4, teams: 8, tour: 32, name: "LMS (8 Teams) "},
    {typeid: 5, teams: 57, tour: 32, name: "Worlds (57 teams) "},
    {typeid: 6, teams: 57, tour: 32, name: "Worlds w/Splits w/MSI (57 teams) "},
    {typeid: 7, teams: 129, tour: 32, name: "Worlds w/Splits w/MSI w/Ladder (129 teams) "}
];

return gameType;
}

function getYearType() {
var yearType;


yearType = [
//            {tid: 0, cid: 0, did: 2, region: "Atlanta", name: "Gold Club", abbrev: "ATL", pop: 4.3},
//     {typeid: 0, teams: 20, tour: 4, name: "20 teams, 4 team tournament, 5 conferences"},

   // LCK Korea
   // LPL China
   // LMS East Asia
   // Worlds - all plus Turkey Russia Oceania Brazil and Latin America
    {yearid: 0, name: "Default"},
    {yearid: 2019, name: "2019"},
];

return yearType;
}

function getChampType() {
var champType;


champType = [

		// change champion rankings or keep them fixed, could have more game options here
    {champid: 0, name: "LOL: Champions with a greater emphasis on the meta (Patch Data)"},
	{champid: 1, name: "DOTA2: Champions with a greater emphasis on countering/synergy (Champion Data)"},
];

//  teams = addPopRank(teams);

return champType;
}

function getPatchType() {
var patchType;


patchType = [

		// change champion rankings or keep them fixed, could have more game options here
    {patchid: 0, name: "Each Season Changes (large nerfs/buffs for top/bottom champs)"},
    {patchid: 2, name: "Each Season Changes (gradual weakening/strengthening)"},
    {patchid: 1, name: "Fixed (only user can change)"}
];

//  teams = addPopRank(teams);

return patchType;
}

function getGMCoachType() {
var GMCoachType;


GMCoachType = [

		// change champion rankings or keep them fixed, could have more game options here
    {GMCoachid: 0, name: "GM Mode: focus is on roster management"},
    {GMCoachid: 1, name: "Coach Mode (easy): GM Mode with need to do in game drafting effectively"},
    {GMCoachid: 2, name: "Coach Mode (medium): GM Mode with need to do in game drafting effectively"},
    {GMCoachid: 3, name: "Coach Mode (hard): GM Mode with need to do in game drafting effectively"},
    {GMCoachid: 4, name: "Coach Mode (impossible): GM Mode with need to do in game drafting effectively"},
];

return GMCoachType;
}

function getDifficultyType() {
var DifficultyType;


DifficultyType = [

		// change champion rankings or keep them fixed, could have more game options here
    {difficulty: 0, name: "Easy"},
    {difficulty: 1, name: "Normal"},
    {difficulty: 2, name: "Hard"},
    {difficulty: 3, name: "Impossible"},
];

//  teams = addPopRank(teams);

return DifficultyType;
}

/*
function getTeamsDefault(): any[] {
    let teams: TeamBasic[] = [
        {tid: 0, cid: 0, did: 2, region: "Atlanta", name: "Gold Club", abbrev: "ATL", pop: 4.3},
        {tid: 1, cid: 0, did: 2, region: "Baltimore", name: "Crabs", abbrev: "BAL", pop: 2.2},
        {tid: 2, cid: 0, did: 0, region: "Boston", name: "Massacre", abbrev: "BOS", pop: 4.4},
        {tid: 3, cid: 0, did: 1, region: "Chicago", name: "Whirlwinds", abbrev: "CHI", pop: 8.8},
        {tid: 4, cid: 0, did: 1, region: "Cincinnati", name: "Riots", abbrev: "CIN", pop: 1.6},
        {tid: 5, cid: 0, did: 1, region: "Cleveland", name: "Curses", abbrev: "CLE", pop: 1.9},
        {tid: 6, cid: 1, did: 3, region: "Dallas", name: "Snipers", abbrev: "DAL", pop: 4.7},
        {tid: 7, cid: 1, did: 4, region: "Denver", name: "High", abbrev: "DEN", pop: 2.2},
        {tid: 8, cid: 0, did: 1, region: "Detroit", name: "Muscle", abbrev: "DET", pop: 4.0},
        {tid: 9, cid: 1, did: 3, region: "Houston", name: "Apollos", abbrev: "HOU", pop: 4.3},
        {tid: 10, cid: 1, did: 5, region: "Las Vegas", name: "Blue Chips", abbrev: "LV", pop: 1.7},
        {tid: 11, cid: 1, did: 5, region: "Los Angeles", name: "Earthquakes", abbrev: "LA", pop: 12.3},
        {tid: 12, cid: 1, did: 3, region: "Mexico City", name: "Aztecs", abbrev: "MXC", pop: 19.4},
        {tid: 13, cid: 0, did: 2, region: "Miami", name: "Cyclones", abbrev: "MIA", pop: 5.4},
        {tid: 14, cid: 1, did: 4, region: "Minneapolis", name: "Blizzards", abbrev: "MIN", pop: 2.6},
        {tid: 15, cid: 0, did: 0, region: "Montreal", name: "Mounties", abbrev: "MON", pop: 4.0},
        {tid: 16, cid: 0, did: 0, region: "New York", name: "Bankers", abbrev: "NYC", pop: 18.7},
        {tid: 17, cid: 0, did: 0, region: "Philadelphia", name: "Cheesesteaks", abbrev: "PHI", pop: 5.4},
        {tid: 18, cid: 1, did: 3, region: "Phoenix", name: "Vultures", abbrev: "PHO", pop: 3.4},
        {tid: 19, cid: 0, did: 1, region: "Pittsburgh", name: "Rivers", abbrev: "PIT", pop: 1.8},
        {tid: 20, cid: 1, did: 4, region: "Portland", name: "Roses", abbrev: "POR", pop: 1.8},
        {tid: 21, cid: 1, did: 5, region: "Sacramento", name: "Gold Rush", abbrev: "SAC", pop: 1.6},
        {tid: 22, cid: 1, did: 5, region: "San Diego", name: "Pandas", abbrev: "SD", pop: 2.9},
        {tid: 23, cid: 1, did: 5, region: "San Francisco", name: "Venture Capitalists", abbrev: "SF", pop: 3.4},
        {tid: 24, cid: 1, did: 4, region: "Seattle", name: "Symphony", abbrev: "SEA", pop: 3.0},
        {tid: 25, cid: 1, did: 3, region: "St. Louis", name: "Spirits", abbrev: "STL", pop: 2.2},
        {tid: 26, cid: 0, did: 2, region: "Tampa", name: "Turtles", abbrev: "TPA", pop: 2.2},
        {tid: 27, cid: 0, did: 0, region: "Toronto", name: "Beavers", abbrev: "TOR", pop: 6.3},
        {tid: 28, cid: 1, did: 4, region: "Vancouver", name: "Whalers", abbrev: "VAN", pop: 2.3},
        {tid: 29, cid: 0, did: 2, region: "Washington", name: "Monuments", abbrev: "WAS", pop: 4.2},
    ];

    for (const t of teams) {
        t.imgURL = `/img/logos/${t.abbrev}.png`;
    }

    teams = addPopRank(teams);

    return teams;
}*/

    function getTeamsDefault() {
        var teams;

        teams = [
           {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 30, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 29, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 28, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 27, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 26, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 25, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 24, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 23, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 22, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 21, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 10, cid: 1, did: 1, region: "Team DigniCoast", name: "DigniCoast", abbrev: "TDC", pop: 20, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 11, cid: 1, did: 1, region: "Team Tons of Damage", name: "Tons of Damage", abbrev: "TTD", pop: 19, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 12, cid: 1, did: 1, region: "Ally eSports", name: "Ally", abbrev: "ALY", pop: 18, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 13, cid: 1, did: 1, region: "Lollipoppy Illuminati", name: "Lollipoppy Illuminati", abbrev: "LIL", pop: 17, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 14, cid: 1, did: 1, region: "Summerwolf", name: "Summerwolf", abbrev: "SWF", pop: 16, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 15, cid: 1, did: 1, region: "Team Beach", name: "Beach", abbrev: "BCH", pop: 15, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 16, cid: 2, did: 2, region: "Win or Bench", name: "Win or Bench", abbrev: "WoB", pop: 14, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 17, cid: 2, did: 2, region: "Team Total Toxic", name: "Total Toxic", abbrev: "TTT", pop: 13, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 18, cid: 2, did: 2, region: "Red Zed Redemption", name: "Red Zed Redemption", abbrev: "RZR", pop: 12, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 19, cid: 2, did: 2, region: "Flash Ignite LVL 1", name: "Flash Ignite LVL 1", abbrev: "Fl1", pop: 11, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 20, cid: 2, did: 2, region: "Deft Punk", name: "Deft Punk", abbrev: "DP", pop: 10, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 21, cid: 2, did: 2, region: "Feeder Esports", name: "Feeder", abbrev: "FDR", pop: 9, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 22, cid: 2, did: 2, region: "Earth Wind and Fiora", name: "Earth Wind and Fiora", abbrev: "EWF", pop: 8, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 23, cid: 2, did: 2, region: "Lost at Bans", name: "Lost at Bans", abbrev: "LaB", pop: 7, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 24, cid: 2, did: 2, region: "Eggs or I Feed", name: "Eggs or I Feed", abbrev: "EIF", pop: 6, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 25, cid: 2, did: 2, region: "Spirit Bomb Survivors", name: "Spirit Bomb Survivors", abbrev: "SBS", pop: 5, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 26, cid: 2, did: 2, region: "Zed Poet Society", name: "Zed Poet Society", abbrev: "ZPS", pop: 4, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 27, cid: 2, did: 2, region: "Did We Win", name: "Did We Win", abbrev: "DWW", pop: 3, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 28, cid: 2, did: 2, region: "Team Cancer", name: "Cancer", abbrev: "TC", pop: 2, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 29, cid: 2, did: 2, region: "Vexillum", name: "Vexillum", abbrev: "VEX", pop: 1, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"}

        ];

        teams = addPopRank(teams);

        return teams;
    }

    function getTeamsDefaultEU() {
        var teams;

        teams = [
           {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 30,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 29,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 28,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 27,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 26,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 25,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 24,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 23,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 22,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 21,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 10, cid: 1, did: 1, region: "Team DigniCoast", name: "DigniCoast", abbrev: "TDC", pop: 20,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 11, cid: 1, did: 1, region: "Team Tons of Damage", name: "Tons of Damage", abbrev: "TTD", pop: 19,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 12, cid: 1, did: 1, region: "Ally eSports", name: "Ally", abbrev: "ALY", pop: 18,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 13, cid: 1, did: 1, region: "Lollipoppy Illuminati", name: "Lollipoppy Illuminati", abbrev: "LIL", pop: 17,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 14, cid: 1, did: 1, region: "Summerwolf", name: "Summerwolf", abbrev: "SWF", pop: 16,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 15, cid: 1, did: 1, region: "Team Beach", name: "Beach", abbrev: "BCH", pop: 15,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 16, cid: 2, did: 2, region: "Win or Bench", name: "Win or Bench", abbrev: "WoB", pop: 14,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 17, cid: 2, did: 2, region: "Team Total Toxic", name: "Total Toxic", abbrev: "TTT", pop: 13,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 18, cid: 2, did: 2, region: "Red Zed Redemption", name: "Red Zed Redemption", abbrev: "RZR", pop: 12,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 19, cid: 2, did: 2, region: "Flash Ignite LVL 1", name: "Flash Ignite LVL 1", abbrev: "Fl1", pop: 11,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 20, cid: 2, did: 2, region: "Deft Punk", name: "Deft Punk", abbrev: "DP", pop: 10,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 21, cid: 2, did: 2, region: "Feeder Esports", name: "Feeder", abbrev: "FDR", pop: 9,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 22, cid: 2, did: 2, region: "Earth Wind and Fiora", name: "Earth Wind and Fiora", abbrev: "EWF", pop: 8,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 23, cid: 2, did: 2, region: "Lost at Bans", name: "Lost at Bans", abbrev: "LaB", pop: 7,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 24, cid: 2, did: 2, region: "Eggs or I Feed", name: "Eggs or I Feed", abbrev: "EIF", pop: 6,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 25, cid: 2, did: 2, region: "Spirit Bomb Survivors", name: "Spirit Bomb Survivors", abbrev: "SBS", pop: 5,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 26, cid: 2, did: 2, region: "Zed Poet Society", name: "Zed Poet Society", abbrev: "ZPS", pop: 4,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 27, cid: 2, did: 2, region: "Did We Win", name: "Did We Win", abbrev: "DWW", pop: 3,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 28, cid: 2, did: 2, region: "Team Cancer", name: "Cancer", abbrev: "TC", pop: 2,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 29, cid: 2, did: 2, region: "Vexillum", name: "Vexillum", abbrev: "VEX", pop: 1,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"}

        ];

        teams = addPopRank(teams);

        return teams;
    }

    function getTeamsNADefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 10, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 9, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 8, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 7, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 6, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 5, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 4, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 3, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 2, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 1, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"}


        ];

        teams = addPopRank(teams);

        return teams;
    }

    function getTeamsEUDefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 10,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 9,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 8,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 7,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 6,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 5,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 4,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 3,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 2,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 1,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"}


        ];

        teams = addPopRank(teams);

        return teams;
    }

    function getTeamsLCKDefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 10, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 9, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 8, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 7, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 6, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 5, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 4, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 3, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 2, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 1, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},

        ];

        teams = addPopRank(teams);

        return teams;
    }

  function getTeamsLPLDefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 12, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 11, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 10, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 9, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 8, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 7, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 6, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 5, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 4, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 3, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 10, cid: 0, did: 0, region: "Team YP", name: "YP", abbrev: "YP", pop: 2, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 11, cid: 0, did: 0, region: "Rage Gaming", name: "Rage", abbrev: "RGE", pop: 1, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},

        ];

        teams = addPopRank(teams);

        return teams;
    }

   function getTeamsLMSDefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 8, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 7, country: "TW", imgURLCountry :  "/img/flags/flags/48/Taiwan.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 6, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 5, country: "TW", imgURLCountry :  "/img/flags/flags/48/Taiwan.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 4, country: "TW", imgURLCountry :  "/img/flags/flags/48/Taiwan.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 3, country: "TW", imgURLCountry :  "/img/flags/flags/48/Taiwan.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 2, country: "TW", imgURLCountry :  "/img/flags/flags/48/Taiwan.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 1, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"}

        ];

        teams = addPopRank(teams);

        return teams;
    }

   function getTeamsWorldsLadderDefault() {
        var teams;

        teams = [

			// NA
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 1, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 2, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 3, cid: 0, did: 0, region: "Fury Gaming", name: "Fury", abbrev: "FURY", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 4, cid: 0, did: 0, region: "Hooligan Esports", name: "Hooligan", abbrev: "HGE", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 5, cid: 0, did: 0, region: "Random 5", name: "Random 5", abbrev: "R5", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 6, cid: 0, did: 0, region: "Made in Heaven", name: "Made in Heaven", abbrev: "MiH", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 7, cid: 0, did: 0, region: "KS Gaming", name: "KS", abbrev: "KS", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 8, cid: 0, did: 0, region: "Death Cap for Cutie", name: "Death Cap for Cutie", abbrev: "DCC", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 9, cid: 0, did: 0, region: "Aurea Mediocritas", name: "Aurea Mediocritas", abbrev: "AM", pop: 115, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},

			// NA CS	(DONE)
            {tid: 10, cid: 1, did: 1, region: "Team Trump Card", name: "Trump Card", abbrev: "TTC", pop: 80,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 11, cid: 1, did: 1, region: "Omega Squad", name: "Omega", abbrev: "OMG", pop: 80,country: "NA", imgURLCountry :"/img/flags/flags/48/UnitedStates.png"},
            {tid: 12, cid: 1, did: 1, region: "White Fang United", name: "White Fang United", abbrev: "WFU", pop: 80,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 13, cid: 1, did: 1, region: "Team Pheonix", name: "Pheonix", abbrev: "RIS", pop: 80,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 14, cid: 1, did: 1, region: "Team All Mid", name: "All Mid", abbrev: "MID", pop: 80,country: "NA", imgURLCountry :  "/img/flags/flags/48/UnitedStates.png"},
            {tid: 15, cid: 1, did: 1, region: "GG eSports", name: "GG", abbrev: "GG", pop: 80,country: "NA", imgURLCountry :   "/img/flags/flags/48/UnitedStates.png"},

			// NA Ladder (need to replace)
             {tid: 16, cid: 2, did: 2, region: "Win or Bench", name: "Win or Bench", abbrev: "WoB", pop: 30,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 17, cid: 2, did: 2, region: "T.I.L.T. eSports", name: "T.I.L.T. ", abbrev: "TLT", pop: 30,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 18, cid: 2, did: 2, region: "Justice eSports", name: "Justice", abbrev: "JST", pop: 30,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
			{tid: 19, cid: 2, did: 2, region: "Onion Heads Gaming", name: "Onion Heads", abbrev: "ONN", pop: 30,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 20, cid: 2, did: 2, region: "Team Total Toxic", name: "Total Toxic", abbrev: "TTT", pop: 30,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 21, cid: 2, did: 2, region: "Red Zed Redemption", name: "Red Zed Redemption", abbrev: "RZR", pop: 30,country: "NA", imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},


			//EU
            {tid: 22, cid: 3, did: 3, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 23, cid: 3, did: 3, region: "Faith Gaming", name: "Faith", abbrev: "FGM", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 24, cid: 3, did: 3, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 25, cid: 3, did: 3, region: "The Final Evil", name: "Final Evil", abbrev: "EVL", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 26, cid: 3, did: 3, region: "Team Solid", name: "Solid", abbrev: "TS", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 27, cid: 3, did: 3, region: "Luckerdog eSports", name: "Luckerdog", abbrev: "LDE", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 28, cid: 3, did: 3, region: "Oblivion", name: "Oblivion", abbrev: "OBL", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 29, cid: 3, did: 3, region: "Team Solo Top", name: "Solo Top", abbrev: "TST", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 30, cid: 3, did: 3, region: "Dragon Slayers Gaming", name: "Dragon Slayers", abbrev: "DSG", pop: 115,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 31, cid: 3, did: 3, region: "Last Shots Gaming", name: "Last Shots", abbrev: "LSG", pop: 115,country: "EU", imgURLCountry : "/img/flags/flags/48/European Union.png"},


			//EU CS
            {tid: 32, cid: 4, did: 4, region: "Paris Gaming", name: "Paris", abbrev: "PRS", pop: 80,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 33, cid: 4, did: 4, region: "Century eSports", name: "Century", abbrev: "CNT", pop: 80,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 34, cid: 4, did: 4, region: "Novus eSports", name: "Novus", abbrev: "NVS", pop: 80,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},

            {tid: 35, cid: 4, did: 4, region: "Chicks dig MMR", name: "Chicks dig MMR", abbrev: "MMR", pop: 80,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 36, cid: 4, did: 4, region: "Team Open Secret", name: "Open Secret", abbrev: "SCR", pop: 80,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 37, cid: 4, did: 4, region: "Hamburg Lions", name: "Hamburg Lions", abbrev: "HL", pop: 80, country: "EU",imgURLCountry : "/img/flags/flags/48/European Union.png"},

			//EU Ladder


            {tid: 38, cid: 5, did: 5, region: "Shulk03 eSports", name: "Shulk03", abbrev: "K03", pop: 30,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 39, cid: 5, did: 5, region: "Carpe Diem Gaming", name: "Carpe Diem", abbrev: "CRP", pop: 30,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 40, cid: 5, did: 5, region: "Vae Victis eSports", name: "Vae Victis", abbrev: "VIC", pop: 30,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 41, cid: 5, did: 5, region: "Earth Wind and Fiora", name: "Earth Wind and Fiora", abbrev: "EWF", pop: 30,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 42, cid: 5, did: 5, region: "Lost at Bans", name: "Lost at Bans", abbrev: "LaB", pop: 30,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 43, cid: 5, did: 5, region: "Eggs or I Feed", name: "Eggs or I Feed", abbrev: "EIF", pop: 30,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},


			// Korea
            {tid: 44, cid: 6, did: 6, region: "Team DigniCoast", name: "DigniCoast", abbrev: "TDC", pop: 130, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 45, cid: 6, did: 6, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 130, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 46, cid: 6, did: 6, region: "Team YP", name: "YP", abbrev: "YP", pop: 130, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 47, cid: 6, did: 6, region: "Griffin Gaming", name: "Griffin", abbrev: "GrG", pop: 130, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 48, cid: 6, did: 6, region: "Team ARAM", name: "ARAM", abbrev: "RAM", pop: 130, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 49, cid: 6, did: 6, region: "MC Aztec Gaming", name: "MC Aztec", abbrev: "MCA", pop: 130, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 50, cid: 6, did: 6, region: "Earthquake Gaming", name: "Earthquake", abbrev: "EG", pop: 130, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 51, cid: 6, did: 6, region: "K2h", name: "K2h", abbrev: "K2H", pop: 130, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 52, cid: 6, did: 6, region: "Cyclops Gaming", name: "Cyclops", abbrev: "CG", pop: 130, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 53, cid: 6, did: 6, region: "Team Beach", name: "Beach", abbrev: "BCH", pop: 130,country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},

			//Korea CS (DONE)
            {tid: 54, cid: 7, did: 7, region: "White Knights Gaming", name: "White Knights", abbrev: "WHT", pop: 95, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 55, cid: 7, did: 7, region: "Seoul Saints Gaming", name: "Seoul Saints", abbrev: "SST", pop: 95, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 56, cid: 7, did: 7, region: "Seoul Telecom Coaster", name: "Seoul Telecom Coaster", abbrev: "SS", pop: 95,  country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 57, cid: 7, did: 7, region: "Walkquest Gaming", name: "Walkquest", abbrev: "WLK", pop: 95,  country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 58, cid: 7, did: 7, region: "Sixth Sense eSports", name: "Sixth Sense", abbrev: "SIX", pop: 95,  country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 59, cid: 7, did: 7, region: "Lollipoppy Illuminati", name: "Lollipoppy Illuminati", abbrev: "LIL", pop: 95,  country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},



			//Korea Ladder
            {tid: 60, cid: 8, did: 8, region: "Flash Ignite LVL 1", name: "Flash Ignite LVL 1", abbrev: "Fl1", pop: 50, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 61, cid: 8, did: 8, region: "Deft Punk", name: "Deft Punk", abbrev: "DP", pop: 50, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 62, cid: 8, did: 8, region: "Feeder Esports", name: "Feeder", abbrev: "FDR", pop: 50, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 63, cid: 8, did: 8, region: "Spirit Bomb Survivors", name: "Spirit Bomb Survivors", abbrev: "SBS", pop: 50, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 64, cid: 8, did: 8, region: "Zed Poet Society", name: "Zed Poet Society", abbrev: "ZPS", pop: 50, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 65, cid: 8, did: 8, region: "Two Star Universe", name: "Two Star Universe", abbrev: "TSU", pop: 50, country: "KR",imgURLCountry : "/img/flags/flags/48/Korea.png"},


			// China
            {tid: 66, cid: 9, did: 9, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 67, cid: 9, did: 9, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 68, cid: 9, did: 9, region: "Rage Gaming", name: "Rage", abbrev: "RAGE", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 69, cid: 9, did: 9, region: "Summerwolf", name: "Summerwolf", abbrev: "SWF", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 70, cid: 9, did: 9, region: "Ignite Golems", name: "Ignite Golems", abbrev: "IG", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 71, cid: 9, did: 9, region: "Team Forever", name: "Forever", abbrev: "FRV", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 72, cid: 9, did: 9, region: "The Savage Boys", name: "The Savage Boys", abbrev: "TSB", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 73, cid: 9, did: 9, region: "Thunder10", name: "Thunder10", abbrev: "T10", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 74, cid: 9, did: 9, region: "Chemicals", name: "Chemicals", abbrev: "CH", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 75, cid: 9, did: 9, region: "Conclugen", name: "Conclugen", abbrev: "CON", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 76, cid: 9, did: 9, region: "WTF", name: "WTF", abbrev: "WTF", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 77, cid: 9, did: 9, region: "VAE Gaming", name: "VAE", abbrev: "VAE", pop: 115, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},

			// China CS (DONE)
            {tid: 78, cid: 10, did: 10, region: "Emerald Esports Club", name: "Emerald", abbrev: "EEC", pop: 80, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 79, cid: 10, did: 10, region: "Team Panda", name: "Panda", abbrev: "PND", pop: 80, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 80, cid: 10, did: 10, region: "Statikk Gaming", name: "Statikk", abbrev: "STT", pop: 80, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 81, cid: 10, did: 10, region: "Team Synergy", name: "Synergy", abbrev: "SYG", pop: 80, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 82, cid: 10, did: 10, region: "Team Redemption", name: "Redemption", abbrev: "RDM", pop: 80, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 83, cid: 10, did: 10, region: "Rebellion Gaming", name: "Rebellion", abbrev: "RBL", pop: 80, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},

			// China ladder (top two from before)
            {tid: 84, cid: 11, did: 11, region: "Team Cancer", name: "Cancer", abbrev: "TC", pop: 30, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 85, cid: 11, did: 11, region: "Vexillum", name: "Vexillum", abbrev: "VEX", pop: 30, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},

			// need to replace (DONE)
            {tid: 86, cid: 11, did: 11, region: "Predators Gaming", name: "Predators", abbrev: "PRD", pop: 30, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 87, cid: 11, did: 11, region: "Zero Friction Gaming", name: "Zero Friction", abbrev: "ZRF", pop: 30, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 88, cid: 11, did: 11, region: "Team Death Sentence", name: "Death Sentence", abbrev: "DTH", pop: 30, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 89, cid: 11, did: 11, region: "CD Burn eSports", name: "CD Burn", abbrev: "CDB", pop: 30, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},



			// Taiwan
            {tid: 90, cid: 12, did: 12, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 115, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 91, cid: 12, did: 12, region: "Team Tons of Damage", name: "Tons of Damage", abbrev: "TTD", pop: 115, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 92, cid: 12, did: 12, region: "Ally eSports", name: "Ally", abbrev: "ALY", pop: 115, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 93, cid: 12, did: 12, region: "Full Ham", name: "Full Ham", abbrev: "FH", pop: 115, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 94, cid: 12, did: 12, region: "Spinner Esports", name: "Spinner", abbrev: "SPIN", pop: 115, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 95, cid: 12, did: 12, region: "Djibouti Giants", name: "Djibouti Giants", abbrev: "DG", pop: 115, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 96, cid: 12, did: 12, region: "Challenger or Cardboard", name: "Challenger or Cardboard", abbrev: "CC", pop: 115, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 97, cid: 12, did: 12, region: "Water Dragons", name: "Water Dragons", abbrev: "WDS", pop: 115, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},

			// Taiwan CS (DONE)
            {tid: 98, cid: 13, did: 13, region: "Team High Voltage", name: "High Voltage", abbrev: "VLT", pop: 80, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
			{tid: 99, cid: 13, did: 13, region: "Risen eSports", name: "Risen", abbrev: "RSN", pop: 80, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 100, cid: 13, did: 13, region: "Total Logic Gaming", name: "Total Logic", abbrev: "TLG", pop: 80, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 101, cid: 13, did: 13, region: "Team Cloud 10", name: "Cloud 10", abbrev: "TEN", pop: 80, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 102, cid: 13, did: 13, region: "Claw eSports", name: "Claw", abbrev: "CLW", pop: 80, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 103, cid: 13, did: 13, region: "Anarchy Gaming ", name: "Anarchy", abbrev: "RKY", pop: 80, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},


			// Taiwan ladder (DONE)
            {tid: 104, cid: 14, did: 14, region: "Frenzy Gaming", name: "Frenzy", abbrev: "NZY", pop: 30, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 105, cid: 14, did: 14, region: "Ace Gaming", name: "Ace", abbrev: "ACE", pop: 30, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 106, cid: 14, did: 14, region: "Game Essence eSports", name: "Game Essence", abbrev: "ESS", pop: 30, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 107, cid: 14, did: 14, region: "Team Thunderbots", name: "Thunderbots", abbrev: "THB", pop: 30, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 108, cid: 14, did: 14, region: "Revenge Gaming", name: "Revenge", abbrev: "RVG", pop: 30, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 109, cid: 14, did: 14, region: "Animal Squad", name: "Animal Squad", abbrev: "ANI", pop: 30, country: "TW",imgURLCountry : "/img/flags/flags/48/Taiwan.png"},

			// WC
            {tid: 110, cid: 15, did: 15, region: "Pacific Gaming", name: "Pacific", abbrev: "PAC", pop: 105, country: "SEA",imgURLCountry : "/img/flags/flags/48/Vietnam.png"},
            {tid: 111, cid: 15, did: 15, region: "Japanese eSports", name: "Japanese", abbrev: "JAP", pop: 105, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
            {tid: 112, cid: 15, did: 15, region: "Latin eSports", name: "Latin", abbrev: "LAT", pop: 105, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
            {tid: 113, cid: 15, did: 15, region: "Turkish Gaming", name: "Turkish", abbrev: "TUR", pop: 105, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
            {tid: 114, cid: 15, did: 15, region: "Oceanic eSports", name: "Oceanic", abbrev: "OCE", pop: 105, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
            {tid: 115, cid: 15, did: 15, region: "Brazilian Gaming", name: "Brazilian", abbrev: "BRA", pop: 105, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
            {tid: 116, cid: 15, did: 15, region: "CIS Gaming", name: "CIS", abbrev: "CIS", pop: 105, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},

			// WC CS
            {tid: 117, cid: 16, did: 16, region: "Team Latin North", name: "Latin North", abbrev: "LTN", pop: 65, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
            {tid: 118, cid: 16, did: 16, region: "Latin South Gaming", name: "Latin South ", abbrev: "LTS", pop: 65, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
            {tid: 119, cid: 16, did: 16, region: "Siberian Wolves eSports", name: "Siberian Wolves", abbrev: "WLV", pop: 65, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
            {tid: 120, cid: 16, did: 16, region: "Australian Gaming", name: "Australian", abbrev: "AUS", pop: 65, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
            {tid: 121, cid: 16, did: 16, region: "Turk eSports", name: "Turk", abbrev: "TRK", pop: 65, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
            {tid: 122, cid: 16, did: 16, region: "Fuji Crew", name: "Fuji", abbrev: "FJC", pop: 65, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},

// latein american flag from here, but saved to game: "http://www.flagandbanner.com/images/K20LAT35.jpg"
			// WC ladder
            {tid: 123, cid: 17, did: 17, region: "Latin East Gaming", name: "Latin East", abbrev: "LTE", pop: 15, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
            {tid: 124, cid: 17, did: 17, region: "Latin West eSports", name: "Latin West ", abbrev: "LTW", pop: 15, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
            {tid: 125, cid: 17, did: 17, region: "Indonesian eSports", name: "Indonesian", abbrev: "IND", pop: 15, country: "SEA",imgURLCountry : "/img/flags/flags/48/Indonesia.png"},
            {tid: 126, cid: 17, did: 17, region: "Philippines Gaming", name: "Philippines", abbrev: "PHL", pop: 15, country: "SEA",imgURLCountry : "/img/flags/flags/48/Philippines.png"},
            {tid: 127, cid: 17, did: 17, region: "Team Vietnam", name: "Vietnam", abbrev: "VTN", pop: 15, country: "SEA",imgURLCountry : "/img/flags/flags/48/Vietnam.png"},
            {tid: 128, cid: 17, did: 17, region: "Team Thailand", name: "Thailand", abbrev: "THL", pop: 15, country: "SEA",imgURLCountry : "/img/flags/flags/48/Thailand.png"}


        ];

        teams = addPopRank(teams);

        return teams;
    }



   function getTeamsWorldsDefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 57, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 1, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 52, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 2, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 47, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 3, cid: 0, did: 0, region: "Fury Gaming", name: "Fury", abbrev: "FURY", pop: 42, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 4, cid: 0, did: 0, region: "Hooligan Esports", name: "Hooligan", abbrev: "HGE", pop: 37, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 5, cid: 0, did: 0, region: "Random 5", name: "Random 5", abbrev: "R5", pop: 32, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 6, cid: 0, did: 0, region: "Made in Heaven", name: "Made in Heaven", abbrev: "MiH", pop: 27, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 7, cid: 0, did: 0, region: "KS Gaming", name: "KS", abbrev: "KS", pop: 22, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 8, cid: 0, did: 0, region: "Death Cap for Cutie", name: "Death Cap for Cutie", abbrev: "DCC", pop: 12, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 9, cid: 0, did: 0, region: "Aurea Mediocritas", name: "Aurea Mediocritas", abbrev: "AM", pop: 7, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
            {tid: 10, cid: 1, did: 1, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 56,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 11, cid: 1, did: 1, region: "Faith Gaming", name: "Faith", abbrev: "FGM", pop: 51,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 12, cid: 1, did: 1, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 46,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 13, cid: 1, did: 1, region: "Lollipoppy Illuminati", name: "Lollipoppy Illuminati", abbrev: "LIL", pop: 41,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 14, cid: 1, did: 1, region: "Team Solid", name: "Solid", abbrev: "TS", pop: 36,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 15, cid: 1, did: 1, region: "Luckerdog eSports", name: "Luckerdog", abbrev: "LDE", pop: 31,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 16, cid: 1, did: 1, region: "Oblivion", name: "Oblivion", abbrev: "OBL", pop: 26,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 17, cid: 1, did: 1, region: "Team Solo Top", name: "Solo Top", abbrev: "TST", pop: 21,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 18, cid: 1, did: 1, region: "Dragon Slayers Gaming", name: "Dragon Slayers", abbrev: "DSG", pop: 11,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 19, cid: 1, did: 1, region: "Hamburg Lions", name: "Hamburg Lions", abbrev: "HL", pop: 6,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 20, cid: 2, did: 2, region: "Team DigniCoast", name: "DigniCoast", abbrev: "TDC", pop: 55, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 21, cid: 2, did: 2, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 50, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 22, cid: 2, did: 2, region: "Team YP", name: "YP", abbrev: "YP", pop: 45, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 23, cid: 2, did: 2, region: "Griffin Gaming", name: "Griffin", abbrev: "GrG", pop: 40, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 24, cid: 2, did: 2, region: "Team AllMid", name: "AllMid", abbrev: "TAM", pop: 35, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 25, cid: 2, did: 2, region: "MC Aztec Gaming", name: "MC Aztec", abbrev: "MCA", pop: 30, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 26, cid: 2, did: 2, region: "Earthquake Gaming", name: "Earthquake", abbrev: "EG", pop: 25, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 27, cid: 2, did: 2, region: "K2h", name: "K2h", abbrev: "K2H", pop: 20, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 28, cid: 2, did: 2, region: "Cyclops Gaming", name: "Cyclops", abbrev: "CG", pop: 15, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 29, cid: 2, did: 2, region: "Last Shots Gaming", name: "Last Shots", abbrev: "LSG", pop: 10, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
            {tid: 30, cid: 3, did: 3, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 54, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 31, cid: 3, did: 3, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 49, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 32, cid: 3, did: 3, region: "Rage Gaming", name: "Rage", abbrev: "RAGE", pop: 44, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 33, cid: 3, did: 3, region: "Summerwolf", name: "Summerwolf", abbrev: "SWF", pop: 39, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 34, cid: 3, did: 3, region: "Ignite Golems", name: "Ignite Golems", abbrev: "IG", pop: 34, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 35, cid: 3, did: 3, region: "Team Beach", name: "Beach", abbrev: "BCH", pop: 29, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 36, cid: 3, did: 3, region: "The Savage Boys", name: "The Savage Boys", abbrev: "TSB", pop: 24, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 37, cid: 3, did: 3, region: "Thunder10", name: "Thunder10", abbrev: "T10", pop: 14, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 38, cid: 3, did: 3, region: "Chemicals", name: "Chemicals", abbrev: "CH", pop: 9, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 39, cid: 3, did: 3, region: "Conclugen", name: "Conclugen", abbrev: "CON", pop: 4, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 40, cid: 3, did: 3, region: "WTF", name: "WTF", abbrev: "WTF", pop: 3, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 41, cid: 3, did: 3, region: "VAE Gaming", name: "VAE", abbrev: "VAE", pop: 2, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
            {tid: 42, cid: 4, did: 4, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 53, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 43, cid: 4, did: 4, region: "Team Tons of Damage", name: "Tons of Damage", abbrev: "TTD", pop: 48, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 44, cid: 4, did: 4, region: "Ally eSports", name: "Ally", abbrev: "ALY", pop: 43, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 45, cid: 4, did: 4, region: "Full Ham", name: "Full Ham", abbrev: "FH", pop: 38, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 46, cid: 4, did: 4, region: "Spinner Esports", name: "Spinner", abbrev: "SPIN", pop: 33, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 47, cid: 4, did: 4, region: "Djibouti Giants", name: "Djibouti Giants", abbrev: "DG", pop: 28, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 48, cid: 4, did: 4, region: "Challenger or Cardboard", name: "Challenger or Cardboard", abbrev: "CC", pop: 23, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 49, cid: 4, did: 4, region: "Water Dragons", name: "Water Dragons", abbrev: "WDS", pop: 13, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
            {tid: 50, cid: 5, did: 5, region: "Pacific Gaming", name: "Pacific", abbrev: "PAC", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},
            {tid: 51, cid: 5, did: 5, region: "Japanese eSports", name: "Japanese", abbrev: "JAP", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
            {tid: 52, cid: 5, did: 5, region: "Latin eSports", name: "Latin", abbrev: "LAT", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
            {tid: 53, cid: 5, did: 5, region: "Turkish Gaming", name: "Turkish", abbrev: "TUR", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
            {tid: 54, cid: 5, did: 5, region: "Oceanic eSports", name: "Oceanic", abbrev: "OCE", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
            {tid: 55, cid: 5, did: 5, region: "Brazilian Gaming", name: "Brazilian", abbrev: "BRA", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
            {tid: 56, cid: 5, did: 5, region: "CIS Gaming", name: "CIS", abbrev: "CIS", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"}


        ];

        teams = addPopRank(teams);

        return teams;
    }

	// need teams for a bunch on new conferences
	// Taiwan 2 spots
	// https://lol.gamepedia.com/2019_Season_World_Championship
/*	 1 from BR
 Brazil
1 from CIS
 CIS
1 from JP
 Japan
1 from LAT
 Latin America
1 from OCE
 Oceania
1 from SEA
 SEA
1 from TR
 Turkey */
   function getTeamsWorlds2019() {
        var teams;

        teams = [
        {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 57, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 1, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 52, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 2, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 47, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 3, cid: 0, did: 0, region: "Fury Gaming", name: "Fury", abbrev: "FURY", pop: 42, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 4, cid: 0, did: 0, region: "Hooligan Esports", name: "Hooligan", abbrev: "HGE", pop: 37, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 5, cid: 0, did: 0, region: "Random 5", name: "Random 5", abbrev: "R5", pop: 32, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 6, cid: 0, did: 0, region: "Made in Heaven", name: "Made in Heaven", abbrev: "MiH", pop: 27, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 7, cid: 0, did: 0, region: "KS Gaming", name: "KS", abbrev: "KS", pop: 22, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 8, cid: 0, did: 0, region: "Death Cap for Cutie", name: "Death Cap for Cutie", abbrev: "DCC", pop: 12, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 9, cid: 0, did: 0, region: "Aurea Mediocritas", name: "Aurea Mediocritas", abbrev: "AM", pop: 7, country: "NA",imgURLCountry : "/img/flags/flags/48/UnitedStates.png"},
         {tid: 10, cid: 1, did: 1, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 56,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 11, cid: 1, did: 1, region: "Faith Gaming", name: "Faith", abbrev: "FGM", pop: 51,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 12, cid: 1, did: 1, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 46,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 13, cid: 1, did: 1, region: "Lollipoppy Illuminati", name: "Lollipoppy Illuminati", abbrev: "LIL", pop: 41,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 14, cid: 1, did: 1, region: "Team Solid", name: "Solid", abbrev: "TS", pop: 36,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 15, cid: 1, did: 1, region: "Luckerdog eSports", name: "Luckerdog", abbrev: "LDE", pop: 31,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 16, cid: 1, did: 1, region: "Oblivion", name: "Oblivion", abbrev: "OBL", pop: 26,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 17, cid: 1, did: 1, region: "Team Solo Top", name: "Solo Top", abbrev: "TST", pop: 21,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 18, cid: 1, did: 1, region: "Dragon Slayers Gaming", name: "Dragon Slayers", abbrev: "DSG", pop: 11,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 19, cid: 1, did: 1, region: "Hamburg Lions", name: "Hamburg Lions", abbrev: "HL", pop: 6,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
         {tid: 20, cid: 2, did: 2, region: "Team DigniCoast", name: "DigniCoast", abbrev: "TDC", pop: 55, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 21, cid: 2, did: 2, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 50, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 22, cid: 2, did: 2, region: "Team YP", name: "YP", abbrev: "YP", pop: 45, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 23, cid: 2, did: 2, region: "Griffin Gaming", name: "Griffin", abbrev: "GrG", pop: 40, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 24, cid: 2, did: 2, region: "Team AllMid", name: "AllMid", abbrev: "TAM", pop: 35, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 25, cid: 2, did: 2, region: "MC Aztec Gaming", name: "MC Aztec", abbrev: "MCA", pop: 30, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 26, cid: 2, did: 2, region: "Earthquake Gaming", name: "Earthquake", abbrev: "EG", pop: 25, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 27, cid: 2, did: 2, region: "K2h", name: "K2h", abbrev: "K2H", pop: 20, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 28, cid: 2, did: 2, region: "Cyclops Gaming", name: "Cyclops", abbrev: "CG", pop: 15, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 29, cid: 2, did: 2, region: "Last Shots Gaming", name: "Last Shots", abbrev: "LSG", pop: 10, country: "KR", imgURLCountry : "/img/flags/flags/48/Korea.png"},
         {tid: 30, cid: 3, did: 3, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 54, country: "CN",imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 31, cid: 3, did: 3, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 49, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 32, cid: 3, did: 3, region: "Rage Gaming", name: "Rage", abbrev: "RAGE", pop: 44, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 33, cid: 3, did: 3, region: "Summerwolf", name: "Summerwolf", abbrev: "SWF", pop: 39, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 34, cid: 3, did: 3, region: "Ignite Golems", name: "Ignite Golems", abbrev: "IG", pop: 34, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 35, cid: 3, did: 3, region: "Team Beach", name: "Beach", abbrev: "BCH", pop: 29, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 36, cid: 3, did: 3, region: "The Savage Boys", name: "The Savage Boys", abbrev: "TSB", pop: 24, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 37, cid: 3, did: 3, region: "Thunder10", name: "Thunder10", abbrev: "T10", pop: 14, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 38, cid: 3, did: 3, region: "Chemicals", name: "Chemicals", abbrev: "CH", pop: 9, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 39, cid: 3, did: 3, region: "Conclugen", name: "Conclugen", abbrev: "CON", pop: 4, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 40, cid: 3, did: 3, region: "WTF", name: "WTF", abbrev: "WTF", pop: 3, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 41, cid: 3, did: 3, region: "VAE Gaming", name: "VAE", abbrev: "VAE", pop: 2, country: "CN", imgURLCountry : "/img/flags/flags/48/China.png"},
         {tid: 42, cid: 4, did: 4, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 53, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
         {tid: 43, cid: 4, did: 4, region: "Team Tons of Damage", name: "Tons of Damage", abbrev: "TTD", pop: 48, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
         {tid: 44, cid: 4, did: 4, region: "Ally eSports", name: "Ally", abbrev: "ALY", pop: 43, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
         {tid: 45, cid: 4, did: 4, region: "Full Ham", name: "Full Ham", abbrev: "FH", pop: 38, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
         {tid: 46, cid: 4, did: 4, region: "Spinner Esports", name: "Spinner", abbrev: "SPIN", pop: 33, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
         {tid: 47, cid: 4, did: 4, region: "Djibouti Giants", name: "Djibouti Giants", abbrev: "DG", pop: 28, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
         {tid: 48, cid: 4, did: 4, region: "Challenger or Cardboard", name: "Challenger or Cardboard", abbrev: "CC", pop: 23, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},
   {tid: 49, cid: 4, did: 4, region: "Water Dragons", name: "Water Dragons", abbrev: "WDS", pop: 13, country: "TW", imgURLCountry : "/img/flags/flags/48/Taiwan.png"},

   // Vietnam 8 teams, 2 spots VCS
         {tid: 50, cid: 5, did: 5, region: "Megabyte Warriors", name: "Warriors", abbrev: "MB", pop: 2, country: "VNM",imgURLCountry : "/img/flags/flags/48/Vietnam.png"},
         {tid: 51, cid: 5, did: 5, region: "Saigon Seekers", name: "Seekers", abbrev: "SS", pop: 2, country: "VNM",imgURLCountry : "/img/flags/flags/48/Vietnam.png"},
         {tid: 52, cid: 5, did: 5, region: "Lotus", name: "Lotus", abbrev: "LTS", pop: 2, country: "VNM",imgURLCountry : "/img/flags/flags/48/Vietnam.png"},
         {tid: 53, cid: 5, did: 5, region: "Terabyte Army", name: "Terabyte", abbrev: "TA", pop: 2, country: "VNM",imgURLCountry : "/img/flags/flags/48/Vietnam.png"},
         {tid: 54, cid: 5, did: 5, region: "Charging Buffalo", name: "Buffalo", abbrev: "CB", pop: 2, country: "VNM",imgURLCountry : "/img/flags/flags/48/Vietnam.png"},
         {tid: 55, cid: 5, did: 5, region: "Hanoi Hurricanes", name: "Hurricanes", abbrev: "HH", pop: 2, country: "VNM",imgURLCountry : "/img/flags/flags/48/Vietnam.png"},
         {tid: 56, cid: 5, did: 5, region: "Red Dragons", name: "Dragons", abbrev: "RD", pop: 2, country: "VNM",imgURLCountry : "/img/flags/flags/48/Vietnam.png"}	,
         {tid: 57, cid: 5, did: 5, region: "Black Crocodiles", name: "Crocodiles", abbrev: "BC", pop: 2, country: "VNM",imgURLCountry : "/img/flags/flags/48/Vietnam.png"}	,
 // korea 3
//china 3
// EU 	3
//NA 3
// LMS 3
// VCS 2
// SOUTHEAST ASIA – LST 1
// BRAZIL – CBLOL - 1
//COMMONWEALTH OF INDEPENDENT STATES – LCL - 1
// JAPAN – LJL -1
//LATIN AMERICA – LLA  1
//OCEANIA – OPL - 1
//TURKEY – TCL 1

//https://nexus.leagueoflegends.com/en-us/2019/08/which-teams-are-competing-in-the-2019-wo/
//https://lol.gamepedia.com/CBLOL/2019_Season/Split_1
// https://lol.gamepedia.com/VCS/2019_Season
   // SEA, LST  8 teams 1 spot
         {tid: 58, cid: 6, did: 6, region: "Pacific Gaming", name: "Pacific", abbrev: "PG", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},
         {tid: 59, cid: 6, did: 6, region: "Singapore Giants", name: "Giants", abbrev: "SIG", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},
         {tid: 60, cid: 6, did: 6, region: "Siamese Cats", name: "Cats", abbrev: "SC", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},
         {tid: 61, cid: 6, did: 6, region: "Yellow Turtles", name: "Turtles", abbrev: "YT", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},
         {tid: 62, cid: 6, did: 6, region: "Golden Squirrels", name: "Squirrels", abbrev: "GS", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},
         {tid: 63, cid: 6, did: 6, region: "Water Buffalos", name: "Buffalos", abbrev: "WB", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},
         {tid: 64, cid: 6, did: 6, region: "White Elephants", name: "Elephants", abbrev: "WE", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},
         {tid: 65, cid: 6, did: 6, region: "Komodo Dragons", name: "Dragons", abbrev: "KD", pop: 2, country: "SEA", imgURLCountry : "/img/flags/flags/48/Philippines.png"},

   // Brazil CBLOL 8 teams, 1 spot
         {tid: 66, cid: 7, did: 7, region: "Rio Raiders", name: "Raiders", abbrev: "RR", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
         {tid: 67, cid: 7, did: 7, region: "Sao Paulo PAIN", name: "PAIN", abbrev: "PAIN", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
         {tid: 68, cid: 7, did: 7, region: "Agony Gaming", name: "Agony", abbrev: "AG", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
         {tid: 69, cid: 7, did: 7, region: "Jaguar Gaming", name: "Jaguar", abbrev: "JG", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
         {tid: 70, cid: 7, did: 7, region: "Orchid eSports", name: "Orchid", abbrev: "OE", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
         {tid: 71, cid: 7, did: 7, region: "Brazilian Gaming", name: "Brazilian", abbrev: "BRG", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
         {tid: 72, cid: 7, did: 7, region: "Ecstasy Gaming", name: "Ecstasy", abbrev: "XTSY", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
         {tid: 73, cid: 7, did: 7, region: "Rush Gaming", name: "Rush", abbrev: "RG", pop: 2, country: "BR",imgURLCountry : "/img/flags/flags/48/Brazil.png"},
   // CIS, now LCL 8 teams 1 spot
         {tid: 74, cid: 8, did: 8, region: "Snowed In Gaming", name: "Snow", abbrev: "SNW", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
         {tid: 75, cid: 8, did: 8, region: "Moscow United", name: "United", abbrev: "MSCW", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
         {tid: 76, cid: 8, did: 8, region: "Red Star eSports", name: "Red Star", abbrev: "RS", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
         {tid: 77, cid: 8, did: 8, region: "Tornado Rocks Gaming", name: "Tornado Rocks ", abbrev: "TR", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
         {tid: 78, cid: 8, did: 8, region: "Team Annex", name: "Annex", abbrev: "ANX", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
         {tid: 79, cid: 8, did: 8, region: "The Elementalists", name: "Elementalists", abbrev: "ELEM", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
         {tid: 80, cid: 8, did: 8, region: "Moscow Miners", name: "Miners", abbrev: "MNR", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
         {tid: 81, cid: 8, did: 8, region: "CIS Gaming", name: "CIS", abbrev: "CIS", pop: 2, country: "CIS",imgURLCountry : "/img/flags/flags/48/Russia.png"},
   // Japan LJL, 8 teams 1 spot
         {tid: 82, cid: 9, did: 9, region: "Suduko Esports", name: "Suduko", abbrev: "SUD", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
         {tid: 83, cid: 9, did: 9, region: "Samari Esports", name: "Samari", abbrev: "SMR", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
         {tid: 84, cid: 9, did: 9, region: "Rising Sun", name: "Sun", abbrev: "RISE", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
         {tid: 85, cid: 9, did: 9, region: "Japanese eSports", name: "Japanese", abbrev: "JPN", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
         {tid: 86, cid: 9, did: 9, region: "Kyoto Assasinins", name: "Assasinins", abbrev: "KA", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
         {tid: 87, cid: 9, did: 9, region: "Team Shattered Nexus", name: "Nexus", abbrev: "NXS", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
         {tid: 88, cid: 9, did: 9, region: "Don't Focus Me", name: "Focus", abbrev: "FCS", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
         {tid: 89, cid: 9, did: 9, region: "Tokyo Blossom", name: "Blossom", abbrev: "TOK", pop: 2, country: "JP",imgURLCountry : "/img/flags/flags/48/Japan.png"},
   // Latin America LlA - 8 teams 1 spot
         {tid: 90, cid: 10, did: 10, region: "Mexico Marauders ", name: "Marauders", abbrev: "MM", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
         {tid: 91, cid: 10, did: 10, region: "Chile Peppers", name: "Peppers", abbrev: "CP", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
         {tid: 92, cid: 10, did: 10, region: "Latin eSports", name: "Latin", abbrev: "LE", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
         {tid: 93, cid: 10, did: 10, region: "Buenos Aires Air", name: "Air", abbrev: "AIR", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
         {tid: 94, cid: 10, did: 10, region: "Not Brazil eSports", name: "Not", abbrev: "NOT", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
         {tid: 95, cid: 10, did: 10, region: "Scorching Gaming", name: "Scorching", abbrev: "SG", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
         {tid: 96, cid: 10, did: 10, region: "Rather Be Gaming", name: "Rather Be", abbrev: "RBG", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
         {tid: 97, cid: 10, did: 10, region: "Ecuador Line", name: "Line", abbrev: "LINE", pop: 2, country: "LatAm",imgURLCountry : "/img/flags/flags/48/LatinAmerica.png"},
   // OCE  , OPL - 8 teams  1 spot
         {tid: 98, cid: 11, did: 11, region: "New Zealand Marines", name: "Marines", abbrev: "NZM", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
         {tid: 99, cid: 11, did: 11, region: "Sydney Submarines", name: "Submarines", abbrev: "SUB", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
         {tid: 100, cid: 11, did: 11, region: "Canberra Caps", name: "Caps", abbrev: "CAPS", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
         {tid: 101, cid: 11, did: 11, region: "Melbourne Gaming", name: "Melbourne", abbrev: "MG", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
         {tid: 102, cid: 11, did: 11, region: "Oceanic eSports", name: "Oceanic", abbrev: "OCE", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
         {tid: 103, cid: 11, did: 11, region: "Islanders", name: "Islanders", abbrev: "ISL", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
         {tid: 104, cid: 11, did: 11, region: "Perth Worth", name: "Worth", abbrev: "PW", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
         {tid: 105, cid: 11, did: 11, region: "Auckland", name: "Auckland", abbrev: "AUCK", pop: 2, country: "OCE",imgURLCountry : "/img/flags/flags/48/Australia.png"},
   // Turkey, TC 10 teams 1 spot
         {tid: 106, cid: 12, did: 12, region: "Star Warriors", name: "Warriors", abbrev: "SW", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
         {tid: 107, cid: 12, did: 12, region: "Evil Eyes", name: "Eyes", abbrev: "EE", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
         {tid: 108, cid: 12, did: 12, region: "Istanbul Bulls", name: "Bulls", abbrev: "IB", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
         {tid: 109, cid: 12, did: 12, region: "Sultan Gaming", name: "Sultan", abbrev: "SUG", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
         {tid: 110, cid: 12, did: 12, region: "Sophia eSports", name: "Sophia", abbrev: "SE", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
         {tid: 111, cid: 12, did: 12, region: "Blue Gaming", name: "Blue", abbrev: "BG", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
         {tid: 112, cid: 12, did: 12, region: "Turkish Delight", name: "Turkish", abbrev: "TD", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
   {tid: 113, cid: 12, did: 12, region: "Galata Armada", name: "Armada", abbrev: "GA", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
   {tid: 114, cid: 12, did: 12, region: "Turkish Empire", name: "Empire", abbrev: "TE", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},
   {tid: 115, cid: 12, did: 12, region: "Grey Wolves", name: "Wolves", abbrev: "GW", pop: 2, country: "TR",imgURLCountry : "/img/flags/flags/48/Turkey.png"},

        ];

        teams = addPopRank(teams);

        return teams;
    }


/**
 * Clones an object.
 *
 * Taken from http://stackoverflow.com/a/3284324/786644
 */
function deepCopy<T>(obj: T): T {
    if (typeof obj !== "object" || obj === null) { return obj; }
    if (obj.constructor === RegExp) { return obj; }

    const retVal = new obj.constructor();
    for (const key of Object.keys(obj)) {
        retVal[key] = deepCopy(obj[key]);
    }
    return retVal;
}

// Hacky solution to http://stackoverflow.com/q/39683076/786644
function keys<T: string>(obj: any): Array<T> {
    return Object.keys(obj);
}

/**
 * Delete all the things from the global variable g that are not stored in league databases.
 *
 * This is used to clear out values from other leagues, to ensure that the appropriate values are updated in the database when calling league.setGameAttributes.
 *
 * @memberOf util.helpers
 */
function resetG() {
    for (const key of keys(g)) {
        if (key !== 'lid') {
            delete g[key];
        }
    }
}

/**
 * Create a URL for a page within a league.
 *
 * @param {Array.<string|number>} components Array of components for the URL after the league ID, which will be combined with / in between.
 * @return {string} URL
 */
function leagueUrl(components: (number | string)[]): string {
    let url = `/l/${g.lid}`;
	//console.log(components);
    for (let i = 0; i < components.length; i++) {
        if (components[i] !== undefined) {
            url += `/${components[i]}`;
        }
    }
	//console.log(url);
    return url;
}

/**
 * Pad an array with nulls or truncate it so that it has a fixed length.
 *
 * @memberOf util.helpers
 * @param {Array} array Input array.
 * @param {number} length Desired length.
 * @return {Array} Original array padded with null or truncated so that it has the required length.
 */
function nullPad<T>(array: (?T)[], length: number): (?T)[] {
    if (array.length > length) {
        return array.slice(0, length);
    }

    while (array.length < length) {
        array.push(null);
    }

    return array;
}

/**
 * Format a number as currency, correctly handling negative values.
 *
 * @memberOf util.helpers
 * @param {number} amount Input value.
 * @param {string=} append Suffix to append to the number, like "M" for things like $2M.
 * @param {number|string|undefined} precision Number of decimal places. Default is 2 (like $17.62).
 * @return {string} Formatted currency string.
 */
function formatCurrency(amount: number, append: string = '', precision: number = 2): string {
    if (amount < 0) {
        return `-$${Math.abs(amount).toFixed(precision)}${append}`;
    }
    if (append === 'K' && amount > 1000000) {
        //amount /= 1000;
       // append = 'M';
    } else {
      //  amount *= 1000;

	}
	//append = 'K';

    return `$${amount.toFixed(precision)}${append}`;
}

/**
 * Format a number as an integer with commas in the thousands places.
 */
function numberWithCommas(x: number | string): string {
    return parseFloat(x).toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Bound a number so that it can't exceed min and max values.
 *
 * @memberOf util.helpers
 * @param {number} x Input number.
 * @param {number} min Minimum bounding variable.
 * @param {number} max Maximum bounding variable.
 * @return {number} Bounded number.
 */
function bound(x: number, min: number, max: number): number {
    if (x < min) {
        return min;
    }
    if (x > max) {
        return max;
    }
    return x;
}

function pickDesc(pick: Pick): string {
    let desc = `${pick.season} ${pick.round === 1 ? "1st" : "2nd"} round pick`;
    if (pick.tid !== pick.originalTid) {
        desc += ` (from ${g.teamAbbrevsCache[pick.originalTid]})`;
    }

    return desc;
}

function ordinal(x?: ?number): string {
    if (x === undefined || x === null) {
        return '';
    }

    let suffix;
    if (x >= 11 && x <= 13) {
        suffix = "th";
    } else if (x % 10 === 1) {
        suffix = "st";
    } else if (x % 10 === 2) {
        suffix = "nd";
    } else if (x % 10 === 3) {
        suffix = "rd";
    } else {
        suffix = "th";
    }

    return x.toString() + suffix;
}

function formatCompletedGame(game: GameProcessed): GameProcessedCompleted {
    // If not specified, assume user's team is playing
    game.tid = game.tid !== undefined ? game.tid : g.userTid;

	//console.log(game);
    // team0 and team1 are different than they are above! Here it refers to user and opponent, not home and away
    const team0 = {tid: game.tid, abbrev: g.teamAbbrevsCache[game.tid], region: g.teamRegionsCache[game.tid], name: g.teamNamesCache[game.tid], pts: game.pts};
    const team1 = {tid: game.oppTid, abbrev: g.teamAbbrevsCache[game.oppTid], region: g.teamRegionsCache[game.oppTid], name: g.teamNamesCache[game.oppTid], pts: game.oppPts};


	if (game.seasonSplit == undefined) {
		game.seasonSplit = "";
		game.seasonSplit2 = "";
	}
	if (game.playoffType == undefined) {
		game.playoffType = "";
	} else {
	//	game.playoffType = "t";
	}
	//console.log(game);
/*
	if (game.playoffs == true) {
		game.playoffs2 = "Playoffs";
	} else {
		game.playoffs2 = "Regular Season";
	}*/
    return {
        gid: game.gid,
        overtime: game.overtime,
        score: game.won ? `${team0.pts}-${team1.pts}` : `${team1.pts}-${team0.pts}`,
        teams: game.home ? [team1, team0] : [team0, team1],
        won: game.won,
        seasonSplit: game.seasonSplit,
        seasonSplit2: game.seasonSplit2,
		playoffType: game.playoffType,
        playoffs: game.playoffs,
        playoffs2: game.playoffs2,
    };
}


// Calculate the number of games that team is behind team0
type teamWonLost = {lost: number, won: number};
function gb(team0: teamWonLost, team: teamWonLost) {
    return ((team0.won - team0.lost) - (team.won - team.lost)) / 2;
}

type teamWonLostSpring = {lostSpring: number, wonSpring: number};
function gbSpring(team0: teamWonLostSpring, team: teamWonLostSpring) {
    return ((team0.wonSpring - team0.lostSpring) - (team.wonSpring - team.lostSpring)) / 2;
}

type teamWonLostSummer = {lostSummer: number, wonSummer: number};
function gbSummer(team0: teamWonLostSummer, team: teamWonLostSummer) {
    return ((team0.wonSummer - team0.lostSummer) - (team.wonSummer - team.lostSummer)) / 2;
}

function gameScore(arg: {[key: string]: number}): string {
    return (arg.pts + 0.4 * arg.fg - 0.7 * arg.fga - 0.4 * (arg.fta - arg.ft) + 0.7 * arg.orb + 0.3 * (arg.trb - arg.orb) + arg.stl + 0.7 * arg.ast + 0.7 * arg.blk - 0.4 * arg.pf - arg.tov).toFixed(1);
}

function plusMinus(arg: number, d: number): string {
    if (isNaN(arg)) { return ""; }
    return (arg > 0 ? "+" : "") + arg.toFixed(d);
}

// Used to fix links in the event log, which will be wrong if a league is exported and then imported
function correctLinkLid(event: {text: string}) {
    event.text = event.text.replace(/\/l\/\d+\//g, `/l/${g.lid}/`);
}

function overtimeCounter(n: number): string {
    switch (n) {
        case 1: return "";
        case 2: return "double";
        case 3: return "triple";
        case 4: return "quadruple";
        case 5: return "quintuple";
        case 6: return "sextuple";
        case 7: return "septuple";
        case 8: return "octuple";
        default: return `a ${ordinal(n)}`;
    }
}

function yearRanges(arr: number[]): string[] {
    if (arr.length <= 1) {
        return arr.map(String);
    }

    const runArr = [];
    const tempArr = [[arr[0]]];

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] - arr[i - 1] > 1) {
            tempArr.push([]);
        }
        tempArr[tempArr.length - 1].push(arr[i]);
    }

    for (let i = 0; i < tempArr.length; i++) {
        // runs of up to 2 consecutive years are displayed individually
        if (tempArr[i].length <= 2) {
            runArr.push(String(tempArr[i][0]));
            if (tempArr[i].length === 2) {
                runArr.push(String(tempArr[i][1]));
            }
        } else {
            // runs of 3 or more are displayed as a range
            runArr.push(`${tempArr[i][0]}-${tempArr[i][tempArr[i].length - 1]}`);
        }
    }

    return runArr;
}

function roundsWonText(playoffRoundsWon: number, playoffRoundsWonWorldsGr: number): string {


	var numConferences;

	if (g.gameType == 0) {
		numConferences = 1;
	} else if (g.gameType == 1) {
		numConferences = 3;
	} else if (g.gameType == 2) {
		numConferences = 1;
	} else if (g.gameType == 3) {
		numConferences = 1;
	} else if (g.gameType == 4) {
		numConferences = 1;
	} else if (g.gameType == 5) {
		numConferences = 6;
	} else if (g.gameType == 6) {
		numConferences = 6;
	} else {
		numConferences = 18;
	}


    const playoffsByConference = g.confs.length === numConferences;// && !localStorage.getItem('top16playoffs');



	if (g.gameType == 0) {
		if (playoffRoundsWon === 0) {
			return "made first round";
		} else if (playoffRoundsWon === 1) {
			return "made second round";
		} else if (playoffRoundsWon === 2) {
			return "made league finals";
		} else if (playoffRoundsWon === 3) {
			return "league champs";
		} else if (playoffRoundsWon === 4) {
			return "league champs";
		}
	} else if (g.gameType == 1) {
		if (playoffRoundsWon === 4) {
			return "made CS promotion";
		} else if (playoffRoundsWon === 5) {
			return "made CS round 2";
		} else if (playoffRoundsWon === 6) {
			return "made CS finals";
		} else if (playoffRoundsWon === 7) {
			return "made CS";
		} else if (playoffRoundsWon === 13) {
			return "stay at CS"; // haven't fully added, for when more teams added to CS
		} else if (playoffRoundsWon === 14) {
			return "demoted to CS";
		} else if (playoffRoundsWon === 16) {
			return "made LCS qualifiers";
		} else if (playoffRoundsWon === 17) {
			return "made LCS promotion";
		} else if (playoffRoundsWon === 18) {
			return "made LCS";
		} else if (playoffRoundsWon === 20) {
			return "stayed in LCS";
		} else if (playoffRoundsWon === 24) {
			return "made LCS quarterfinals";
		} else if (playoffRoundsWon === 25) {
			return "made LCS semifinals";
		} else if (playoffRoundsWon === 26) {
			return "made LCS finals";
		} else if (playoffRoundsWon === 27) {
			return "LCS champs";
		}
	} else if (g.gameType == 2) {
		if (playoffRoundsWon === 0) {
			return "made wild card";
		} else if (playoffRoundsWon === 1) {
			return "made quarterfinals";
		} else if (playoffRoundsWon === 2) {
			return "made semifinals";
		} else if (playoffRoundsWon === 3) {
			return "made finals";
		} else if (playoffRoundsWon === 4) {
			return "league champs";
		}
	} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
		if (playoffRoundsWon === 0) {
			return "made round 1";
		} else if (playoffRoundsWon === 1) {
			return "made round 2";
		} else if (playoffRoundsWon === 2) {
			return "made seeding match";
		} else if (playoffRoundsWon === 3) {
			return "made quarterfinals";
		} else if (playoffRoundsWon === 4) {
			return "made semifinals";
		} else if (playoffRoundsWon === 5) {
			return "made finals";
		} else if (playoffRoundsWon === 6) {
			return "league champs";
		}
	} else if (g.gameType == 3 && g.yearType == 2019) {
		if (playoffRoundsWon === 0) {
			return "made round 1";
		} else if (playoffRoundsWon === 1) {
			return "made round 2";
		} else if (playoffRoundsWon === 2) {
			return "made semifinals";
		} else if (playoffRoundsWon === 3) {
			return "made finals";
		} else if (playoffRoundsWon === 4) {
			return "league champs";
		}
	} else if (g.gameType == 4) {
		if (playoffRoundsWon === 0) {
			return "made quarterfinals";
		} else if (playoffRoundsWon === 1) {
			return "made semifinals";
		} else if (playoffRoundsWon === 2) {
			return "made finals";
		} else if (playoffRoundsWon === 3) {
			return "league champs";
		}
//	} else if (g.gameType == 5 ) {
	} else if (g.gameType == 5 ) {
			//extraText = ""; only for regionals, worlds,
		if (g.yearType == 2019) {
			if (playoffRoundsWon < 0) {
				return "";
			} else if (playoffRoundsWon == 0) {
				return "made conference playoffs";
			} else if (playoffRoundsWon == 1) {
				return "made regionals";
			} else if (playoffRoundsWon == 2) {
				return "made groups 1";
			} else if (playoffRoundsWon == 3) {
				return "made play-in";
			} else if (playoffRoundsWon == 6) {
				return "made groups 2";
			} else if (playoffRoundsWon == 7) {
				return "made Worlds quarterfinals";
			} else if (playoffRoundsWon === 8) {
				return "made Worlds semifinals";
			} else if (playoffRoundsWon === 9) {
				return "made Worlds finals";
			} else if (playoffRoundsWon === 10) {
				return "Worlds champions";
			}

		} else {
			if (playoffRoundsWon < 0) {
				return "";
			} else if (playoffRoundsWon == 0) {
				return "made conference playoffs";
			} else if (playoffRoundsWon == 1) {
				return "made regionals";
			} else if (playoffRoundsWon == 2) {
				return "made groups";
			} else if (playoffRoundsWon == 3) {
				return "made Worlds quarterfinals";
			} else if (playoffRoundsWon === 4) {
				return "made Worlds semifinals";
			} else if (playoffRoundsWon === 5) {
				return "made Worlds finals";
			} else if (playoffRoundsWon === 6) {
				return "Worlds champions";
			}
		}
	} else {
		if (playoffRoundsWon < 0) {
			if (playoffRoundsWonWorldsGr >= 0) {
				return "made groups";
			} else {
				return "";
			}
		} else if (playoffRoundsWon == 0) {
			return "made Worlds quarterfinals";
		} else if (playoffRoundsWon === 1) {
			return "made Worlds semifinals";
		} else if (playoffRoundsWon === 2) {
			return "made Worlds finals";
		} else if (playoffRoundsWon === 3) {
			return "Worlds champions";
		} else if (playoffRoundsWonWorldsGr >= 0) {
			return "made groups";
		}
	}




  /*  if (playoffRoundsWon === g.numPlayoffRounds) {
        return "League champs";
    }
    if (playoffRoundsWon === g.numPlayoffRounds - 1) {
        return playoffsByConference ? "Conference champs" : "Made finals";
    }
    if (playoffRoundsWon === g.numPlayoffRounds - 2) {
        return playoffsByConference ? "Made conference finals" : "Made semifinals";
    }
    if (playoffRoundsWon >= 1) {
        return `Made ${ordinal(playoffRoundsWon + 1)} round`;
    }
    if (playoffRoundsWon === 0) {
        return "Made playoffs";
    }*/
    return "";
}

function roundWinp(winp: number): string {
    let output = winp.toFixed(3);

    if (output[0] === "0") {
        // Delete leading 0
        output = output.slice(1, output.length);
    } else {
        // Delete trailing digit if no leading 0
        output = output.slice(0, output.length - 1);
    }

    return output;
}

//orderBySplitWinp
//winpSpring,
//winpSummer,


const orderByChampPoints = <T: {seasonAttrs: {pointsYear: number, pointsSpring: number, pointsSummer: number, wonSummer: number}}>(teams: T[]): T[] => {

	return orderBy(
		teams,
//		[(t) => t.seasonAttrs.pointsSpring+t.seasonAttrs.pointsSummer, (t) => t.seasonAttrs.wonSummer],
//		[(t) => t.seasonAttrs.pointsYear, (t) => t.seasonAttrs.wonSummer],
		[(t) => t.seasonAttrs.pointsYear, (t) => t.seasonAttrs.pointsSummer],
		['desc', 'desc'],
	);

};

const orderBySplitWinp = <T: {seasonAttrs: {winp: number, winpSpring: number, winpSummer: number, wonSummer: number, wonSpring: number,  kda: number}}>(teams: T[]): T[] => {

	if (g.seasonSplit == "Summer") {
		return orderBy(
			teams,
			[(t) => t.seasonAttrs.winpSummer, (t) => t.seasonAttrs.wonSummer, (t) => t.seasonAttrs.winp, (t) => t.stats.kda],
//      [(t) => t.tid],
//      [(t) => t.seasonAttrs.winpSummer, (t) => t.stats.kda],
			['desc', 'desc', 'desc'],
		);
	} else {
		return orderBy(
			teams,
			[(t) => t.seasonAttrs.winpSpring,(t) => t.seasonAttrs.wonSpring, (t) => t.seasonAttrs.winp, (t) => t.stats.kda],
			['desc', 'desc', 'desc'],
		);

	}

};


const orderByWinp = <T: {seasonAttrs: {winp: number, won: number, kda: number}}>(teams: T[]): T[] => {
    return orderBy(
        teams,
        [(t) => t.seasonAttrs.winp, (t) => t.seasonAttrs.won, (t) => t.stats.kda],
        ['desc', 'desc', 'desc'],
    );
};

const orderByWinpTowerKDA = <T: {seasonAttrs: {winp: number, diffTower: number, kda: number}}>(teams: T[]): T[] => {
    return orderBy(
        teams,
        [(t) => t.seasonAttrs.winp, (t) => t.stats.pf-t.stats.oppTw, (t) => t.stats.kda],
        ['desc', 'desc', 'desc'],
    );
};

const orderByWinpSpringTowerKDA = <T: {seasonAttrs: {winpSpring: number, diffTower: number, kda: number}}>(teams: T[]): T[] => {
    return orderBy(
        teams,
        [(t) => t.seasonAttrs.winpSpring, (t) => t.stats.pf-t.stats.oppTw, (t) => t.stats.kda],
        ['desc', 'desc', 'desc'],
    );
};

const orderByWinpSummerTowerKDA = <T: {seasonAttrs: {winpSummer: number, diffTower: number, kda: number}}>(teams: T[]): T[] => {
    return orderBy(
        teams,
        [(t) => t.seasonAttrs.winpSummer, (t) => t.stats.pf-t.stats.oppTw, (t) => t.stats.kda],
        //[(t) => t.stats.pf-t.stats.oppTw],
        ['desc', 'desc', 'desc'],
    );
};


/**
 * Will a player negotiate with a team, or not?
 *
 * @param {number} amount Player's desired contract amount, already adjusted for mood as in amountWithMood, in thousands of dollars
 * @param {number} mood Player's mood towards the team in question.
 * @return {boolean} Answer to the question.
 */
const refuseToNegotiate = (amount: number, mood: number): boolean => {

//    return amount * mood > (100 + 50 - g.difficulty*25);
    if (g.difficulty == undefined) {
		return amount * mood > (200);
    } else if (g.difficulty == 0) {
//		return false;
		return  amount * mood > (500);
    } else if (g.difficulty == 1) {
		return amount * mood > (200);
    } else if (g.difficulty == 2) {
		return amount * mood > (100);
	} else {
		return amount * mood > (50);
	}
   // return amount * mood > (500 - g.difficulty*50);
};

   /**
     * Assign a position (PG, SG, SF, PF, C, G, GF, FC) based on ratings.
     *
     * @memberOf core.player
     * @param {Object.<string, number>} ratings Ratings object.
     * @return {string} Position.
     */
function getNumGames(cid) {

	var numGames;
	if (cid == undefined) {
		numGames = 22;
	} else if (g.numGames == 0) {

		numGames = 18;
	//	console.log(t.cid)
		//console.log(t.cidStart)

		if ((g.gameType == 0) || (g.gameType == 2)){
		   numGames = 18;
		} else if (g.gameType == 1){
			if (cid == 0) {
				numGames = 18;
			} else if (cid == 1) {
				numGames = 20;
			} else {
				numGames = 26;
			}
		} else if (g.gameType == 3) {
		   numGames = 22;
		} else if (g.gameType == 4) {
		   numGames = 14;
		} else if (g.gameType == 5) {
			if (cid == 0) {
				numGames = 18;
			} else if (cid == 1) {
				numGames = 18;
			} else if (cid == 2) {
				numGames = 18;
			} else if (cid == 3) {
				numGames = 22;
			} else if (cid == 4) {
				numGames = 14;
			} else if (cid == 5) {
				numGames = 12;
			} else {
				numGames = 22;
			}
		} else {
			/*if (cid == 0) {
				numGames = 18;
			} else if (cid == 1) {
				numGames = 18;
			} else if (cid == 2) {
				numGames = 18;
			} else if (cid == 3) {
				numGames = 22;
			} else if (cid == 4) {
				numGames = 14;
			} else if (cid == 5) {
				numGames = 12;
			} else {
				numGames = 22;
			}*/
		}

	} else {
		numGames = g.numGames;
	}

	return numGames;
}

export default {
    validateAbbrev,
    getAbbrev,
    validateTid,
    validateSeason,
    addPopRank,
		getGameType: getGameType,
		getChampType: getChampType,
		getPatchType: getPatchType,
		getYearType: getYearType,
		getGMCoachType: getGMCoachType,
		getDifficultyType: getDifficultyType,
    getTeamsDefault,
	getTeamsDefaultEU: getTeamsDefaultEU,
	getTeamsNADefault: getTeamsNADefault,
	getTeamsEUDefault: getTeamsEUDefault,
	getTeamsLCKDefault: getTeamsLCKDefault,
	getTeamsLPLDefault: getTeamsLPLDefault,
	getTeamsLMSDefault: getTeamsLMSDefault,
	getTeamsWorldsDefault: getTeamsWorldsDefault,
	getTeamsWorlds2019,
	getTeamsWorldsLadderDefault: getTeamsWorldsLadderDefault,
    deepCopy,
    keys,
    resetG,
    nullPad,
    formatCurrency,
    numberWithCommas,
    bound,
    leagueUrl,
    pickDesc,
    ordinal,
    formatCompletedGame,
    gb,
    gbSpring,
    gbSummer,
    gameScore,
    plusMinus,
    correctLinkLid,
    overtimeCounter,
    yearRanges,
    roundsWonText,
    roundWinp,
    orderByWinp,
	orderByWinpTowerKDA,
	orderByWinpSpringTowerKDA,
	orderByWinpSummerTowerKDA,
	orderBySplitWinp,
	orderByChampPoints,
    refuseToNegotiate,
    getNumGames,
};
