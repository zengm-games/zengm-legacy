/**
 * @name util.helpers
 * @namespace Various utility functions that don't have anywhere else to go.
 */
define(["dao", "globals", "lib/knockout", "util/eventLog"], function (dao, g, ko, eventLog) {
    "use strict";

    /**
     * Validate that a given abbreviation corresponds to a team.
     *
     * If the abbreviation is not valid, then g.userTid and its correspodning abbreviation will be returned.
     *
     * @memberOf util.helpers
     * @param  {string} abbrev Three-letter team abbreviation, like "ATL".
     * @return {Array} Array with two elements, the team ID and the validated abbreviation.
     */
    function validateAbbrev(abbrev) {
        var tid;

        tid = g.teamAbbrevsCache.indexOf(abbrev);

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
    function validateTid(tid) {
        var abbrev;

        tid = parseInt(tid, 10);

        if (tid < 0 || tid >= g.teamAbbrevsCache.length || isNaN(tid)) {
            tid = g.userTid;
        }
        abbrev = g.teamAbbrevsCache[tid];

        return [tid, abbrev];
    }

    /**
     * Get the team abbreviation for a team ID.
     *
     * For instance, team ID 0 is Atlanta, which has an abbreviation of ATL. This is a convenience wrapper around validateTid, excpet it will return "FA" if you pass g.PLAYER.FREE_AGENT.
     *
     * @memberOf util.helpers
     * @param {number|string} tid Integer team ID.
     * @return {string} Abbreviation
     */
    function getAbbrev(tid) {
        var abbrev, result;

        if (tid === g.PLAYER.FREE_AGENT) {
            return "FA";
        }
        if (tid < 0) {
            // Draft prospect or retired
            return "";
        }
        result = validateTid(tid);
        tid = result[0];
        abbrev = result[1];

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
    function validateSeason(season) {
        if (!season) {
            return g.season;
        }

        season = Math.floor(season);

        if (isNaN(season)) {
            return g.season;
        }

        return season;
    }

    /**
     * Get a list of all seasons that have been played so far, including the current one.
     *
     * @memberOf util.helpers
     * @param {number=} selectedSeason If defined, then a season matching this year will have its "selected" property set to true.
     * @param {number=} ignoredSeason If defined, then a season matching this year will not be present in the output. This is useful if you need a list of seasons that doesn't include the current season, for instance.
     * @return {Array.<Object>} List of seasons. Each element in the list is an object with with two properties: "season" which contains the year, and "selectedSeason" which is a boolean for whether the year matched selectedSeason.
     */
    function getSeasons(selectedSeason, ignoredSeason) {
        var season, seasons;

        selectedSeason = parseInt(selectedSeason, 10);
        ignoredSeason = ignoredSeason !== undefined ? parseInt(ignoredSeason, 10) : null;

        seasons = [];
        for (season = g.startingSeason; season <= g.season; season++) {
            if (season !== ignoredSeason) {
                seasons.push({season: season, selected: selectedSeason === season});
            }
        }
        return seasons;
    }

    /**
     * Get list of teams, along with some metadata
     *
     * Returns an array of all teams, sorted by tid. Each element contains an object with the following properties:
     *     tid: Integer team ID (from 0 to the number of teams - 1, default 0 to 29).
     *     region: String region name.
     *     name: String team name.
     *     abbrev: String 3-letter team abbreviation.
     *     selected: If selectedTid is defined, this is a boolean representing whether this team is "selected" or not (see below).
     *
     * @memberOf util.helpers
     * @param {number|string} selectedTid A team ID or abbrev for a team that should be "selected" (as in, from a drop down menu). This will add the "selected" key to each team object, as described above.
     * @return {Array.Object} All teams.
     */
    function getTeams(selectedTid) {
        var i, result, teams;

        selectedTid = selectedTid !== undefined ? selectedTid : -1;

        if (typeof selectedTid === "string") {
            if (isNaN(parseInt(selectedTid, 10))) {
                // It's an abbrev, not a tid!
                result = validateAbbrev(selectedTid);
                selectedTid = result[0];
            }
        }

        teams = [];
        for (i = 0; i < g.numTeams; i++) {
            teams[i] = {
                abbrev: g.teamAbbrevsCache[i],
                region: g.teamRegionsCache[i],
                name: g.teamNamesCache[i]
            };
        }

        if (selectedTid >= 0) {
            for (i = 0; i < teams.length; i++) {
                teams[i].selected = false;
            }
            teams[selectedTid].selected = true;
        }

        return teams;
    }

    /**
     * Take a list of teams (similar to the output of getTeamsDefault) and add popRank properties, where 1 is the largest population and teams.length is the smallest.
     *
     * @param {Array.<Object>} teams Teams without popRank properties.
     * @return {Array.<Object>} Teams with added popRank properties.
     */
    function addPopRank(teams) {
        var i, j, teamsSorted;

        // Add popRank
        teamsSorted = teams.slice(); // Deep copy
//        teamsSorted.sort(function (a, b) { return b.pop - a.pop; });
        teamsSorted.sort(function (a, b) { return b.pop - a.pop; });
        for (i = 0; i < teams.length; i++) {
            for (j = 0; j < teamsSorted.length; j++) {
                if (teams[i].tid === teamsSorted[j].tid) {
//                    teams[i].popRank = j + 1;
                    teams[i].popRank = j + 1;
                    break;
                }
            }
        }

        return teams;
    }

	
/**
     * Get list of default teams, along with some more metadata
     *
     * Returns an array of default 30 teams. Each array is an object with the following properties:
     *     tid: Integer team ID (0 to 29).
     *     cid: Integer conference ID (0=East, 1=West).
     *     did: Integer division ID.
     *     region: String region name.
     *     name: String team name.
     *     abbrev: String 3-letter team abbreviation.
     *     pop: From http://www.forbes.com/nba-valuations/ number of people in the region, in millions of people.
     *     popRank: Rank of population, 1=largest, 30=smallest.
     *     selected: If selectedTid is defined, this is a boolean representing whether this team is "selected" or not (see below).
     *
     * This should only be used to initialize things, since many of these values can change from their defaults.
     * 
     * @memberOf util.helpers
     * @param {number|string} selectedTid A team ID or abbrev for a team that should be "selected" (as in, from a drop down menu). This will add the "selected" key to each team object, as described above.
     * @return {Array.<Object>} All teams.
     */
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
            {typeid: 5, teams: 57, tour: 32, name: "Worlds (57 teams) "}
        ];

      //  teams = addPopRank(teams);

        return gameType;
    }	
	
	
/**
     * Get list of default teams, along with some more metadata
     *
     * Returns an array of default 30 teams. Each array is an object with the following properties:
     *     tid: Integer team ID (0 to 29).
     *     cid: Integer conference ID (0=East, 1=West).
     *     did: Integer division ID.
     *     region: String region name.
     *     name: String team name.
     *     abbrev: String 3-letter team abbreviation.
     *     pop: From http://www.forbes.com/nba-valuations/ number of people in the region, in millions of people.
     *     popRank: Rank of population, 1=largest, 30=smallest.
     *     selected: If selectedTid is defined, this is a boolean representing whether this team is "selected" or not (see below).
     *
     * This should only be used to initialize things, since many of these values can change from their defaults.
     * 
     * @memberOf util.helpers
     * @param {number|string} selectedTid A team ID or abbrev for a team that should be "selected" (as in, from a drop down menu). This will add the "selected" key to each team object, as described above.
     * @return {Array.<Object>} All teams.
     */
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
	
    /**
     * Get list of default teams, along with some more metadata
     *
     * Returns an array of default 30 teams. Each array is an object with the following properties:
     *     tid: Integer team ID (0 to 29).
     *     cid: Integer conference ID (0=East, 1=West).
     *     did: Integer division ID.
     *     region: String region name.
     *     name: String team name.
     *     abbrev: String 3-letter team abbreviation.
     *     pop: From http://www.forbes.com/nba-valuations/ number of people in the region, in millions of people.
     *     popRank: Rank of population, 1=largest, 30=smallest.
     *     selected: If selectedTid is defined, this is a boolean representing whether this team is "selected" or not (see below).
     *
     * This should only be used to initialize things, since many of these values can change from their defaults.
     *
     * @memberOf util.helpers
     * @param {number|string} selectedTid A team ID or abbrev for a team that should be "selected" (as in, from a drop down menu). This will add the "selected" key to each team object, as described above.
     * @return {Array.<Object>} All teams.
     */
    function getTeamsDefault() {
        var teams;

        teams = [
           {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 30, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 29, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 28, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 27, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 26, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 25, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 24, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 23, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 22, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 21, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 10, cid: 1, did: 1, region: "Team DigniCoast", name: "DigniCoast", abbrev: "TDC", pop: 20, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 11, cid: 1, did: 1, region: "Team Tons of Damage", name: "Tons of Damage", abbrev: "TTD", pop: 19, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 12, cid: 1, did: 1, region: "Ally eSports", name: "Ally", abbrev: "ALY", pop: 18, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 13, cid: 1, did: 1, region: "Lollipoppy Illuminati", name: "Lollipoppy Illuminati", abbrev: "LIL", pop: 17, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 14, cid: 1, did: 1, region: "Summerwolf", name: "Summerwolf", abbrev: "SWF", pop: 16, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 15, cid: 1, did: 1, region: "Team Beach", name: "Beach", abbrev: "BCH", pop: 15, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 16, cid: 2, did: 2, region: "Win or Bench", name: "Win or Bench", abbrev: "WoB", pop: 14, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 17, cid: 2, did: 2, region: "Team Total Toxic", name: "Total Toxic", abbrev: "TTT", pop: 13, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 18, cid: 2, did: 2, region: "Red Zed Redemption", name: "Red Zed Redemption", abbrev: "RZR", pop: 12, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 19, cid: 2, did: 2, region: "Flash Ignite LVL 1", name: "Flash Ignite LVL 1", abbrev: "Fl1", pop: 11, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 20, cid: 2, did: 2, region: "Deft Punk", name: "Deft Punk", abbrev: "DP", pop: 10, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 21, cid: 2, did: 2, region: "Feeder Esports", name: "Feeder", abbrev: "FDR", pop: 9, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 22, cid: 2, did: 2, region: "Earth Wind and Fiora", name: "Earth Wind and Fiora", abbrev: "EWF", pop: 8, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 23, cid: 2, did: 2, region: "Lost at Bans", name: "Lost at Bans", abbrev: "LaB", pop: 7, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 24, cid: 2, did: 2, region: "Eggs or I Feed", name: "Eggs or I Feed", abbrev: "EIF", pop: 6, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 25, cid: 2, did: 2, region: "Spirit Bomb Survivors", name: "Spirit Bomb Survivors", abbrev: "SBS", pop: 5, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 26, cid: 2, did: 2, region: "Zed Poet Society", name: "Zed Poet Society", abbrev: "ZPS", pop: 4, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 27, cid: 2, did: 2, region: "Did We Win", name: "Did We Win", abbrev: "DWW", pop: 3, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 28, cid: 2, did: 2, region: "Team Cancer", name: "Cancer", abbrev: "TC", pop: 2, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 29, cid: 2, did: 2, region: "Vexillum", name: "Vexillum", abbrev: "VEX", pop: 1, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"}
			
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
	
    /**
     * Get list of default teams, along with some more metadata
     *
     * Returns an array of default 30 teams. Each array is an object with the following properties:
     *     tid: Integer team ID (0 to 29).
     *     cid: Integer conference ID (0=East, 1=West).
     *     did: Integer division ID.
     *     region: String region name.
     *     name: String team name.
     *     abbrev: String 3-letter team abbreviation.
     *     pop: From http://www.forbes.com/nba-valuations/ number of people in the region, in millions of people.
     *     popRank: Rank of population, 1=largest, 30=smallest.
     *     selected: If selectedTid is defined, this is a boolean representing whether this team is "selected" or not (see below).
     *
     * This should only be used to initialize things, since many of these values can change from their defaults.
     *
     * @memberOf util.helpers
     * @param {number|string} selectedTid A team ID or abbrev for a team that should be "selected" (as in, from a drop down menu). This will add the "selected" key to each team object, as described above.
     * @return {Array.<Object>} All teams.
     */
    function getTeamsNADefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 10, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 9, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 8, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 7, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 6, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 5, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 4, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 3, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 2, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 1, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"}
			
			
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
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 10, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 9, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 8, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 7, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 6, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 5, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 4, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 3, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 2, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 1, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"}
			
        ];

        teams = addPopRank(teams);

        return teams;
    }
		
  function getTeamsLPLDefault() {
        var teams;
		
        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 12, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 11, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 10, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 9, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 8, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 7, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 6, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 5, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 8, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 4, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 9, cid: 0, did: 0, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 3, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 10, cid: 0, did: 0, region: "Team YP", name: "YP", abbrev: "YP", pop: 2, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 11, cid: 0, did: 0, region: "Rage Gaming", name: "Rage", abbrev: "RGE", pop: 1, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"}
			
        ];

        teams = addPopRank(teams);

        return teams;
    }
	
   function getTeamsLMSDefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 8, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 1, cid: 0, did: 0, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 7, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 2, cid: 0, did: 0, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 6, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 3, cid: 0, did: 0, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 5, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 4, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 4, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 5, cid: 0, did: 0, region: "Faith Gaming", name: "Faith", abbrev: "FG", pop: 3, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 6, cid: 0, did: 0, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 2, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 7, cid: 0, did: 0, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 1, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"}
			
        ];

        teams = addPopRank(teams);

        return teams;
    }
	
   function getTeamsWorldsDefault() {
        var teams;

        teams = [
            {tid: 0, cid: 0, did: 0, region: "Empire Gaming", name: "Empire", abbrev: "EGA", pop: 57, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 1, cid: 0, did: 0, region: "Proper Logic Gaming", name: "Proper Logic", abbrev: "PLG", pop: 52, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 2, cid: 0, did: 0, region: "Team Repulse", name: "Repulse", abbrev: "TRP", pop: 47, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 3, cid: 0, did: 0, region: "Fury Gaming", name: "Fury", abbrev: "FURY", pop: 42, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 4, cid: 0, did: 0, region: "Hooligan Esports", name: "Hooligan", abbrev: "HGE", pop: 37, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 5, cid: 0, did: 0, region: "Random 5", name: "Random 5", abbrev: "R5", pop: 32, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 6, cid: 0, did: 0, region: "Made in Heaven", name: "Made in Heaven", abbrev: "MiH", pop: 27, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 7, cid: 0, did: 0, region: "KS Gaming", name: "KS", abbrev: "KS", pop: 22, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 8, cid: 0, did: 0, region: "Death Cap for Cutie", name: "Death Cap for Cutie", abbrev: "DCC", pop: 12, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 9, cid: 0, did: 0, region: "Aurea Mediocritas", name: "Aurea Mediocritas", abbrev: "AM", pop: 7, country: "NA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-United-States-of-America.png"},
            {tid: 10, cid: 1, did: 1, region: "Sky10", name: "Sky10", abbrev: "S10", pop: 56,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 11, cid: 1, did: 1, region: "Faith Gaming", name: "Faith", abbrev: "FGM", pop: 51,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 12, cid: 1, did: 1, region: "Legendary eSports", name: "Legendary", abbrev: "LGD", pop: 46,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 13, cid: 1, did: 1, region: "Lollipoppy Illuminati", name: "Lollipoppy Illuminati", abbrev: "LIL", pop: 41,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 14, cid: 1, did: 1, region: "Team Solid", name: "Solid", abbrev: "TS", pop: 36,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 15, cid: 1, did: 1, region: "Luckerdog eSports", name: "Luckerdog", abbrev: "LDE", pop: 31,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 16, cid: 1, did: 1, region: "Oblivion", name: "Oblivion", abbrev: "OBL", pop: 26,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 17, cid: 1, did: 1, region: "Team Solo Top", name: "Solo Top", abbrev: "TST", pop: 21,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 18, cid: 1, did: 1, region: "Dragon Slayers Gaming", name: "Dragon Slayers", abbrev: "DSG", pop: 11,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 19, cid: 1, did: 1, region: "Last Shots Gaming", name: "Last Shots", abbrev: "LSG", pop: 6,country: "EU", imgURLCountry :"/img/flags/flags/48/European Union.png"},
            {tid: 20, cid: 2, did: 2, region: "Team DigniCoast", name: "DigniCoast", abbrev: "TDC", pop: 55, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 21, cid: 2, did: 2, region: "Team Unity", name: "Unity", abbrev: "TUN", pop: 50, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 22, cid: 2, did: 2, region: "Team YP", name: "YP", abbrev: "YP", pop: 45, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 23, cid: 2, did: 2, region: "Griffin Gaming", name: "Griffin", abbrev: "GrG", pop: 40, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 24, cid: 2, did: 2, region: "Team AllMid", name: "AllMid", abbrev: "TAM", pop: 35, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 25, cid: 2, did: 2, region: "MC Aztec Gaming", name: "MC Aztec", abbrev: "MCA", pop: 30, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 26, cid: 2, did: 2, region: "Earthquake Gaming", name: "Earthquake", abbrev: "EG", pop: 25, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 27, cid: 2, did: 2, region: "K2h", name: "K2h", abbrev: "K2H", pop: 20, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 28, cid: 2, did: 2, region: "Cyclops Gaming", name: "Cyclops", abbrev: "CG", pop: 15, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 29, cid: 2, did: 2, region: "Hamburg Lions", name: "Hamburg Lions", abbrev: "HL", pop: 10, country: "KR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Korea-South.png"},
            {tid: 30, cid: 3, did: 3, region: "Young Warrior Gaming", name: "Young Warrior", abbrev: "YWG", pop: 54, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 31, cid: 3, did: 3, region: "Xtatic", name: "Xtatic", abbrev: "XTC", pop: 49, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 32, cid: 3, did: 3, region: "Rage Gaming", name: "Rage", abbrev: "RAGE", pop: 44, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 33, cid: 3, did: 3, region: "Summerwolf", name: "Summerwolf", abbrev: "SWF", pop: 39, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 34, cid: 3, did: 3, region: "Ignite Golems", name: "Ignite Golems", abbrev: "IG", pop: 34, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 35, cid: 3, did: 3, region: "Team Beach", name: "Beach", abbrev: "BCH", pop: 29, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 36, cid: 3, did: 3, region: "The Savage Boys", name: "The Savage Boys", abbrev: "TSB", pop: 24, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 37, cid: 3, did: 3, region: "Thunder10", name: "Thunder10", abbrev: "T10", pop: 14, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 38, cid: 3, did: 3, region: "Chemicals", name: "Chemicals", abbrev: "CH", pop: 9, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 39, cid: 3, did: 3, region: "Conclugen", name: "Conclugen", abbrev: "CON", pop: 4, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 40, cid: 3, did: 3, region: "WTF", name: "WTF", abbrev: "WTF", pop: 3, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 41, cid: 3, did: 3, region: "VAE Gaming", name: "VAE", abbrev: "VAE", pop: 2, country: "CN",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-China.png"},
            {tid: 42, cid: 4, did: 4, region: "eLite5", name: "eLite5", abbrev: "EL5", pop: 53, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 43, cid: 4, did: 4, region: "Team Tons of Damage", name: "Tons of Damage", abbrev: "TTD", pop: 48, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 44, cid: 4, did: 4, region: "Ally eSports", name: "Ally", abbrev: "ALY", pop: 43, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 45, cid: 4, did: 4, region: "Full Ham", name: "Full Ham", abbrev: "FH", pop: 38, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 46, cid: 4, did: 4, region: "Spinner Esports", name: "Spinner", abbrev: "SPIN", pop: 33, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 47, cid: 4, did: 4, region: "Djibouti Giants", name: "Djibouti Giants", abbrev: "DG", pop: 28, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 48, cid: 4, did: 4, region: "Challenger or Cardboard", name: "Challenger or Cardboard", abbrev: "CC", pop: 23, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},
            {tid: 49, cid: 4, did: 4, region: "Water Dragons", name: "Water Dragons", abbrev: "WDS", pop: 13, country: "TW",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Taiwan.png"},			
            {tid: 50, cid: 5, did: 5, region: "Pacific Gaming", name: "Pacific", abbrev: "PAC", pop: 2, country: "SEA",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Vietnam.png"},
            {tid: 51, cid: 5, did: 5, region: "Japanese eSports", name: "Japanese", abbrev: "JAP", pop: 2, country: "JP",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Japan.png"},
            {tid: 52, cid: 5, did: 5, region: "Latin eSports", name: "Latin", abbrev: "LAT", pop: 2, country: "LatAm",imgURLCountry : "http://www.flagandbanner.com/images/K20LAT35.jpg"},
            {tid: 53, cid: 5, did: 5, region: "Turkish Gaming", name: "Turkish", abbrev: "TUR", pop: 2, country: "TR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Turkey.png"},
            {tid: 54, cid: 5, did: 5, region: "Oceanic eSports", name: "Oceanic", abbrev: "OCE", pop: 2, country: "OCE",imgURLCountry : "http://www.anbg.gov.au/images/flags/nation/australia.gif"},
            {tid: 55, cid: 5, did: 5, region: "Brazilian Gaming", name: "Brazilian", abbrev: "BRA", pop: 2, country: "BR",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Brazil.png"},
            {tid: 56, cid: 5, did: 5, region: "CIS Gaming", name: "CIS", abbrev: "CIS", pop: 2, country: "CIS",imgURLCountry : "https://www.countries-ofthe-world.com/flags/flag-of-Russia.png"}

			
        ];

        teams = addPopRank(teams);

        return teams;
    }	
				

	
    /**
     * Clones an object.
     *
     * Taken from http://stackoverflow.com/a/3284324/786644
     *
     * @memberOf util.helpers
     * @param {Object} obj Object to be cloned.
     */
    function deepCopy(obj) {
        var key, retVal;

        if (typeof obj !== "object" || obj === null) { return obj; }
        if (obj.constructor === RegExp) { return obj; }

        retVal = new obj.constructor();
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                retVal[key] = deepCopy(obj[key]);
            }
        }
        return retVal;
    }

    /**
     * Display a whole-page error message to the user.
     *
     * @memberOf util.helpers
     * @param {Object} req Object with parameter "params" containing another object with a string representing the error message in the parameter "error".
     */
    function globalError(req) {
        var contentEl, ui, viewHelpers;

        ui = require("ui");
        viewHelpers = require("util/viewHelpers");

        viewHelpers.beforeNonLeague();

        ui.update({
            container: "content",
            template: "error"
        });

        contentEl = document.getElementById("content");
        ko.cleanNode(contentEl);
        ko.applyBindings({error: req.params.error}, contentEl);
        ui.title("Error");
        req.raw.cb();
    }

    /**
     * Display a whole-page error message to the user, while retaining the league menu.
     *
     * @memberOf util.helpers
     * @param {Object} req Object with parameter "params" containing another object with a string representing the error message in the parameter "error" and an integer league ID in "lid".
     */
    function leagueError(req) {
        var ui, viewHelpers;

        ui = require("ui");
        viewHelpers = require("util/viewHelpers");

        viewHelpers.beforeLeague(req).then(function () {
            var contentEl;

            ui.update({
                container: "league_content",
                template: "error"
            });

            contentEl = document.getElementById("league_content");
            ko.cleanNode(contentEl);
            ko.applyBindings({error: req.params.error}, contentEl);
            ui.title("Error");
            req.raw.cb();
        });
    }

    /**
     * Display a whole-page error message to the user by calling either leagueError or globalError as appropriate.
     *
     * Use errorNotify for minor errors.
     *
     * @memberOf util.helpers
     * @param {string} error Text of the error message to be displayed.
     * @param {function()} cb Optional callback function.
     * @param {boolean} forceGlobal If true, always call globalError (needed if league/global distinction can't be inferred from URL).
     */
    function error(errorText, cb, forceGlobal) {
        var lid, req;

        forceGlobal = forceGlobal !== undefined ? forceGlobal : false;

        req = {params: {error: errorText}, raw: {cb: cb !== undefined ? cb : function () {}}};

        lid = location.pathname.split("/")[2]; // lid derived from URL
        if (/^\d+$/.test(lid) && typeof indexedDB !== "undefined" && !forceGlobal) { // Show global error of no IndexedDB
            req.params.lid = parseInt(lid, 10);
            leagueError(req);
        } else {
            globalError(req);
        }
    }

    /**
     * Display a transient error message as a notification popup.
     *
     * Use error if you need to block the whole page.
     *
     * @memberOf util.helpers
     * @param {string} error Text of the error message to be displayed.
     */
    function errorNotify(errorText) {
        eventLog.add(null, {
            type: "error",
            text: errorText,
            saveToDb: false
        });
    }

    /**
     * Delete all the things from the global variable g that are not stored in league databases.
     *
     * This is used to clear out values from other leagues, to ensure that the appropriate values are updated in the database when calling league.setGameAttributes.
     *
     * @memberOf util.helpers
     */
    function resetG() {
        var key;

        for (key in g) {
            if (g.hasOwnProperty(key) && g.notInDb.indexOf(key) < 0) {
                delete g[key];
            }
        }
    }

    /**
     * Ping a counter at basketball-gm.com.
     *
     * This should only do something if it isn't being run from a unit test and it's actually on basketball-gm.com.
     *
     * @memberOf util.helpers
     * @param {string} type Either "league" for a new league, or "season" for a completed season
     */
    function bbgmPing(type) {
        if (g.enableLogging) {
            if (type === "league") {
			
			    if (g.gameType == 0) {
					_gaq.push(["_trackEvent", "LOL - LCS", "New league", g.lid.toString()]);
				} else if (g.gameType == 1) {
					_gaq.push(["_trackEvent", "LOL - LCS with Ladder", "New league", g.lid.toString()]);
				} else if (g.gameType == 2) {
					_gaq.push(["_trackEvent", "LOL - LCK", "New league", g.lid.toString()]);
				} else if (g.gameType == 3) {
					_gaq.push(["_trackEvent", "LOL - LPL", "New league", g.lid.toString()]);
				} else if (g.gameType == 4) {
					_gaq.push(["_trackEvent", "LOL - LMS", "New league", g.lid.toString()]);
				} else {
					_gaq.push(["_trackEvent", "LOL - Worlds", "New league", g.lid.toString()]);
				}				
				
            } else if (type === "season" && g.autoPlaySeasons === 0) {
			
			    if (g.gameType == 0) {
					_gaq.push(["_trackEvent", "LOL - LCS", "Completed season", g.season.toString()]);
				} else if (g.gameType == 1) {
					_gaq.push(["_trackEvent", "LOL - LCS with Ladder", "Completed season", g.season.toString()]);
				} else if (g.gameType == 2) {
					_gaq.push(["_trackEvent", "LOL - LCK", "Completed season", g.season.toString()]);
				} else if (g.gameType == 3) {
					_gaq.push(["_trackEvent", "LOL - LPL", "Completed season", g.season.toString()]);
				} else if (g.gameType == 4) {
					_gaq.push(["_trackEvent", "LOL - LMS", "Completed season", g.season.toString()]);
				} else {
					_gaq.push(["_trackEvent", "LOL - Worlds", "Completed season", g.season.toString()]);
				}				
			
            }
        }
    }

    /**
     * Generate a block of HTML with a player's skill labels.
     *
     * @memberOf util.helpers
     * @param {Array.<string>} skills Array of skill labels, like "R" for "Rebounder", etc. See: core.player.skills.
     * @return {string} String of HTML-formatted skill labels, ready for output.
     */
    function skillsBlock(skills) {
        var i, skillsHtml, tooltips;

        tooltips = {
            SC: "Shot Calling",  ////***
            TP: "Team Player",   ////***
            GS: "Game Strategy",
            JC: "Jungle Control",  ////***
            Gk: "Ganking",
            Tw: "Tower Attack/Defense", // combine below  ////***
            Ta: "Tower Attack", // combine below
            Td: "Tower Defend", 
            CK: "Champion Killing",      ////****
            VW: "Vision/Warding",       // combine all three
            MV: "Map Vision",       // combine all three
            Wd: "Ward Destruction", // combine below
            Wp: "Ward Placement",
            LS: "Lane Switching",  
            Ad: "Adaptability",
            CS: "Lane Minion Killing",  //// ****
            Ag: "Aggression"   ////***
        };

        skillsHtml = '';
        if (skills !== undefined) {
            for (i = 0; i < skills.length; i++) {
                skillsHtml += '<span class="skill" title="' + tooltips[skills[i]] + '">' + skills[i] + '</span>';
            }
        }

        return skillsHtml;
    }

    /**
     * Create a URL for a page within a league.
     *
     * This will also maintain any query string on the end of the URL, for instance for popup windows, unless options.noQueryString is set. Ignoring the query string can be important for forms in Davis.js until this is fixed: https://github.com/olivernn/davis.js/issues/75
     *
     * @param {Array.<string|number>} components Array of components for the URL after the league ID, which will be combined with / in between.
     * @param {object|number?} lid League ID number, either a number or a knockout observable. If not passed, then g.lid is used. This is needed to make some observables (navbar) depend on the lid.
     * @return {string} URL
     */
    function leagueUrl(components, options, lid) {
        var i, url;

        options = options !== undefined ? options : {};
        lid = lid !== undefined ? ko.unwrap(lid) : g.lid;

        url = "/l/" + lid;
        for (i = 0; i < components.length; i++) {
            if (components[i] !== undefined) {
                url += "/" + ko.unwrap(components[i]);
            }
        }
        if (!options.noQueryString) {
            url += location.search;
        }

        return url;
    }

    function watchBlock(pid, watch) {
        if (watch) {
            return '<span class="glyphicon glyphicon-flag watch watch-active" title="Remove from Watch List" data-pid="' + pid + '"></span>';
        }

        return '<span class="glyphicon glyphicon-flag watch" title="Add to Watch List" data-pid="' + pid + '"></span>';
    }

    /**
     * Generate a block of HTML with a player's name, skill labels.
     *
     * @memberOf util.helpers
     * @param {number} pid Player ID number.
     * @param {string} name Player name.
     * @param {object=} object Injury object (properties: type and gamesRemaining).
     * @param {Array.<string>=} skills Array of skill labels, like "R" for "Rebounder", etc. See: core.player.skills.
     * @param {Array.<string>=} skills True: player is on watch list. False: player is not on watch list. Undefined: not sure, so don't show watch icon.
     * @return {string} String of HTML-formatted skill labels, ready for output.
     */
    function playerNameLabels(pid, name, injury, skills, watch) {
        var html;

		//var test_str = "|text to get| Other text.... migh have \"|\"'s ..."; name
	/*	var start_pos = name.indexOf("'") + 1;
		var end_pos = name.indexOf("'",start_pos);
		var userID = name.substring(start_pos,end_pos);*/
		
        html = '<a href="' + leagueUrl(["player", pid]) + '">' + name + '</a>';
//        html = '<a href="' + leagueUrl(["player", pid]) + '">' + userID + '</a>';

        if (injury !== undefined) {
            if (injury.gamesRemaining > 0) {
                html += '<span class="label label-danger label-injury" title="' + injury.type + ' (out ' + injury.gamesRemaining + ' more games)">' + injury.gamesRemaining + '</span>';
            } else if (injury.gamesRemaining === -1) {
                // This is used in box scores, where it would be confusing to display "out X more games" in old box scores
                html += '<span class="label label-danger label-injury" title="' + injury.type + '">&nbsp;</span>';
            }
        }

        if (skills !== undefined) {
            html += skillsBlock(skills);
        }

        if (watch !== undefined) {
            html += watchBlock(pid, watch);
        }

        return html;
    }

    /**
     * Generate a block of HTML with a player's name, skill labels.
     *
     * @memberOf util.helpers
     * @param {number} pid Player ID number.
     * @param {string} name Player name.
     * @param {object=} object Injury object (properties: type and gamesRemaining).
     * @param {Array.<string>=} skills Array of skill labels, like "R" for "Rebounder", etc. See: core.player.skills.
     * @param {Array.<string>=} skills True: player is on watch list. False: player is not on watch list. Undefined: not sure, so don't show watch icon.
     * @return {string} String of HTML-formatted skill labels, ready for output.
     */
    function playerUserIDLabels(pid, name, injury, skills, watch) {
        var html;

		//var test_str = "|text to get| Other text.... migh have \"|\"'s ..."; name
		var start_pos = name.indexOf("'") + 1;
		var end_pos = name.indexOf("'",start_pos);
		var userID = name.substring(start_pos,end_pos);
		
//        html = '<a href="' + leagueUrl(["player", pid]) + '">' + name + '</a>';
        html = '<a href="' + leagueUrl(["player", pid]) + '">' + userID + '</a>';

        if (injury !== undefined) {
            if (injury.gamesRemaining > 0) {
                html += '<span class="label label-danger label-injury" title="' + injury.type + ' (out ' + injury.gamesRemaining + ' more games)">' + injury.gamesRemaining + '</span>';
            } else if (injury.gamesRemaining === -1) {
                // This is used in box scores, where it would be confusing to display "out X more games" in old box scores
                html += '<span class="label label-danger label-injury" title="' + injury.type + '">&nbsp;</span>';
            }
        }

        if (skills !== undefined) {
            html += skillsBlock(skills);
        }

        if (watch !== undefined) {
            html += watchBlock(pid, watch);
        }

        return html;
    }	
	
    /**
     * Round a number to a certain number of decimal places.
     *
     * @memberOf util.helpers
     * @param {number|string} value Number to round.
     * @param {number=} precision Number of decimal places. Default is 0 (round to integer).
     * @return {string} Rounded number.
     */
    function round(value, precision) {
        precision = precision !== undefined ? parseInt(precision, 10) : 0;

        return parseFloat(value).toFixed(precision);
    }

    /**
     * Pad an array with nulls or truncate it so that it has a fixed length.
     *
     * @memberOf util.helpers
     * @param {Array} array Input array.
     * @param {number} length Desired length.
     * @return {Array} Original array padded with null or truncated so that it has the required length.
     */
    function nullPad(array, length) {
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
     * @param {number|string} amount Input value.
     * @param {string=} append Suffix to append to the number, like "M" for things like $2M.
     * @param {number|string|undefined} precision Number of decimal places. Default is 2 (like $17.62).
     * @return {string} Formatted currency string.
     */
    function formatCurrency(amount, append, precision) {
        append = typeof append === "string" ? append : "";
        precision = typeof precision === "number" || typeof precision === "string" ? precision : 2;

        if (amount < 0) {
            return "-$" + round(Math.abs(amount), precision) + append;
        }
        return "$" + round(amount, precision) + append;
    }

    /**
     * Format a number with commas in the thousands places.
     *
     * Also, rounds the number first.
     *
     * @memberOf util.helpers
     * @param {number|string} x Input number.
     * @return {string} Formatted number.
     */
    function numberWithCommas(x) {

		x = round(x);

        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	/*	if (x == 0) {
          return x;
		} else {
		   return round(x/1000, 0) + "," + (x-(round(x/1000, 0)*1000));
		}*/
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
    function bound(x, min, max) {
        if (x < min) {
            return min;
        }
        if (x > max) {
            return max;
        }
        return x;
    }


    /**
     * Link to an abbrev either as "ATL" or "ATL (from BOS)" if a pick was traded.
     *
     * @memberOf util.helpers
     * @param {string} abbrev Drafting team ID.
     * @param {string} originalTid Original owner of the pick team ID.
     * @param {season=} season Optional season for the roster links.
     * @return {string} HTML link(s).
     */
    function draftAbbrev(tid, originalTid, season) {
        var abbrev, originalAbbrev;

        abbrev = g.teamAbbrevsCache[tid];
        originalAbbrev = g.teamAbbrevsCache[originalTid];

        if (abbrev === originalAbbrev) {
            return '<a href="' + leagueUrl(["roster", abbrev, season]) + '">' + abbrev + '</a>';
        }

        return '<a href="' + leagueUrl(["roster", abbrev, season]) + '">' + abbrev + '</a> (from <a href="' + leagueUrl(["roster", originalAbbrev, season]) + '">' + originalAbbrev + '</a>)';
    }

    function pickDesc(pick) {
        var desc;

        desc = pick.season + " " + (pick.round === 1 ? "first" : "second") + " round pick";
        if (pick.tid !== pick.originalTid) {
            desc += " (from " + g.teamAbbrevsCache[pick.originalTid] + ")";
        }

        return desc;
    }

    function ordinal(x) {
        var suffix;

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

    /**
     * Generate a game log list.
     *
     * @memberOf helpers
     * @param {string} abbrev Abbrev of the team for the list of games.
     * @param {number} season Season for the list of games.
     * @param {number} gid Integer game ID for the box score (a negative number means no box score), which is used only for highlighting the relevant entry in the list.
     * @param {Array.<Object>} gid Array of already-loaded games. If this is not empty, then only new games that are not already in this array will be passed to the callback.
     * @return {Promise.<Array.<Object>>} Resolves to a list of game objects.
     */
    function gameLogList(abbrev, season, gid, loadedGames) {
        var games, maxGid, out, tid;

        out = validateAbbrev(abbrev);
        tid = out[0];
        abbrev = out[1];

        if (loadedGames.length > 0) {
            maxGid = loadedGames[0].gid; // Load new games
        } else {
            maxGid = -1; // Load all games
        }

        games = [];

        // This could be made much faster by using a compound index to search for season + team, but that's not supported by IE 10
        return dao.games.iterate({
            index: "season",
            key: season,
            direction: "prev",
            callback: function (game, shortCircuit) {
                var i, overtime;

                if (game.gid <= maxGid) {
                    return shortCircuit();
                }

                if (game.overtimes === 1) {
                    overtime = " (OT)";
                } else if (game.overtimes > 1) {
                    overtime = " (" + game.overtimes + "OT)";
                } else {
                    overtime = "";
                }

                // Check tid
                if (game.teams[0].tid === tid || game.teams[1].tid === tid) {
                    games.push({
                        gid: game.gid,
                        tid: tid,
                        selected: game.gid === gid,
                        overtime: overtime
                    });

                    i = games.length - 1;
                    if (game.teams[0].tid === tid) {
                        games[i].home = true;
                        games[i].pts = game.teams[0].pts;
                        games[i].oppPts = game.teams[1].pts;
                        games[i].oppTid = game.teams[1].tid;
                        games[i].oppAbbrev = g.teamAbbrevsCache[game.teams[1].tid];
                        games[i].won = game.teams[0].pts > game.teams[1].pts;
                    } else if (game.teams[1].tid === tid) {
                        games[i].home = false;
                        games[i].pts = game.teams[1].pts;
                        games[i].oppPts = game.teams[0].pts;
                        games[i].oppTid = game.teams[0].tid;
                        games[i].oppAbbrev = g.teamAbbrevsCache[game.teams[0].tid];
                        games[i].won = game.teams[1].pts > game.teams[0].pts;
                    }
                }
            }
        }).then(function () {
            return games;
        });
    }

    function formatCompletedGame(game) {
        var output, team0, team1;

        // If not specified, assume user's team is playing
        game.tid = game.tid !== undefined ? game.tid : g.userTid;

        // team0 and team1 are different than they are above! Here it refers to user and opponent, not home and away
        team0 = {tid: game.tid, abbrev: g.teamAbbrevsCache[game.tid], region: g.teamRegionsCache[game.tid], name: g.teamNamesCache[game.tid], pts: game.pts};
        team1 = {tid: game.oppTid, abbrev: g.teamAbbrevsCache[game.oppTid], region: g.teamRegionsCache[game.oppTid], name: g.teamNamesCache[game.oppTid], pts: game.oppPts};

        output = {
            gid: game.gid,
            overtime: game.overtime,
            won: game.won
        };
        if (game.home) {
            output.teams = [team1, team0];
        } else {
            output.teams = [team0, team1];
        }
        if (game.won) {
//            output.score = team0.pts + "-" + team1.pts;
            output.score = " ";
        } else {
//            output.score = team1.pts + "-" + team0.pts;
            output.score = " ";
        }

        return output;
    }


    // Calculate the number of games that team is behind team0
    function gb(team0, team) {
        return ((team0.won - team0.lost) - (team.won - team.lost)) / 2;
    }

    function checkNaNs() {
        var checkObject, wrap, wrapperNaNChecker;

        // Check all properties of an object for NaN
        checkObject = function (obj, foundNaN, replace) {
            var prop;

            foundNaN = foundNaN !== undefined ? foundNaN : false;
            replace = replace !== undefined ? replace : false;

            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (typeof obj[prop] === "object" && obj[prop] !== null) {
                        foundNaN = checkObject(obj[prop], foundNaN, replace);
                    } else if (obj[prop] !== obj[prop]) {
                        // NaN check from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
                        foundNaN = true;
                        if (replace) {
                            obj[prop] = 0;
                        }
                    }
                }
            }

            return foundNaN;
        };

        wrap = function (parent, name, wrapper) {
            var original;

            original = parent[name];
            parent[name] = wrapper(original);
        };

        wrapperNaNChecker = function (_super) {
            return function (obj) {
                var err;

                if (checkObject(obj)) {
                    err = new Error("NaN found before writing to IndexedDB");

                    if (window.Bugsnag) {
                        window.Bugsnag.notifyException(err, "NaNFound", {
                            details: {
                                objectWithNaN: JSON.stringify(obj, function (key, value) {
                                    if (value !== value) {
                                        return "FUCKING NaN RIGHT HERE";
                                    }

                                    return value;
                                })
                            }
                        });
                    }

                    // Hard crash
/*                    gSend = JSON.parse(JSON.stringify(g)); // deepCopy fails for some reason
                    delete gSend.teamAbbrevsCache;
                    delete gSend.teamRegionsCache;
                    delete gSend.teamNamesCache;

                    output = "<h1>Critical Error</h1><p>You ran into the infamous NaN bug. But there's good news! You can help fix it! Please email the following information to <a href=\"mailto:commissioner@basketball-gm.com\">commissioner@basketball-gm.com</a> along with any information about what you think might have caused this glitch. If you want to be extra helpful, <a href=\"" + leagueUrl(["export_league"]) + "\">export your league</a> and send that too (if it's huge, upload to Google Drive or Dropbox or whatever). Thanks!</p>";

                    output += '<textarea class="form-control" style="height: 300px">';
                    output += JSON.stringify({
                        stack: err.stack,
                        input: obj,
                        "this": this,
                        gSend: gSend
                    }, function (key, value) {
                        if (value != value) {
                            return "NaN RIGHT HERE";
                        }

                        return value;
                    }, 2);
                    output += "</textarea>";

                    // Find somewhere to show output
                    contentNode = document.getElementById("league_content");
                    if (!contentNode) {
                        contentNode = document.getElementById("content");
                    }
                    if (!contentNode) {
                        contentNode = document.body;
                    }
                    contentNode.innerHTML = output;

                    throw err;*/

                    // Try to recover gracefully
                    checkObject(obj, false, true); // This will update obj
                    return _super.call(this, obj);
                }

                return _super.apply(this, arguments);
            };
        };

        wrap(IDBObjectStore.prototype, "add", wrapperNaNChecker);
        wrap(IDBObjectStore.prototype, "put", wrapperNaNChecker);
        wrap(IDBCursor.prototype, "update", wrapperNaNChecker);
    }
	
    function updateMultiTeam(tid) {
        require("core/league").setGameAttributesComplete({
            userTid: tid
        }).then(function () {
            // dbChange is kind of a hack because it was designed for multi-window update only, but it should update everything
            require("ui").realtimeUpdate(["dbChange"]);
            require("core/league").updateLastDbChange();
        });
    }	

    return {
        validateAbbrev: validateAbbrev,
        getAbbrev: getAbbrev,
        validateTid: validateTid,
        validateSeason: validateSeason,
        getSeasons: getSeasons,
        getTeams: getTeams,
		getGameType: getGameType,
		getPatchType: getPatchType,
        addPopRank: addPopRank,
        getTeamsDefault: getTeamsDefault,
		getTeamsDefaultEU: getTeamsDefaultEU,
        getTeamsNADefault: getTeamsNADefault,
		getTeamsEUDefault: getTeamsEUDefault,
        getTeamsLCKDefault: getTeamsLCKDefault,
        getTeamsLPLDefault: getTeamsLPLDefault,
        getTeamsLMSDefault: getTeamsLMSDefault,
        getTeamsWorldsDefault: getTeamsWorldsDefault,
        deepCopy: deepCopy,
        error: error,
        errorNotify: errorNotify,
        resetG: resetG,
        bbgmPing: bbgmPing,
        skillsBlock: skillsBlock,
        watchBlock: watchBlock,
        playerNameLabels: playerNameLabels,
        round: round,
        nullPad: nullPad,
        formatCurrency: formatCurrency,
        numberWithCommas: numberWithCommas,
        bound: bound,
        leagueUrl: leagueUrl,
        draftAbbrev: draftAbbrev,
        pickDesc: pickDesc,
        ordinal: ordinal,
        gameLogList: gameLogList,
        formatCompletedGame: formatCompletedGame,
        gb: gb,
        checkNaNs: checkNaNs,
		playerUserIDLabels: playerUserIDLabels,
        updateMultiTeam: updateMultiTeam		
    };
});


	