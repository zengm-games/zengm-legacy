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
        teamsSorted.sort(function (a, b) { return b.pop - a.pop; });
        for (i = 0; i < teams.length; i++) {
            for (j = 0; j < teamsSorted.length; j++) {
                if (teams[i].tid === teamsSorted[j].tid) {
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
    function getTeamsDefault() {
        var teams;

		
		//http://www.50states.com/bio/nickname5.htm#.VRQjbivF-So
		//http://www.50states.com/bird/#.VRQi7SvF-So
        teams = [
            {tid: 0, cid: 0, did: 0, region: "Virginia", name: "Colonials", abbrev: "VA", pop: 79, city: "Virginia Beach", state: "VA", latitude: 36.853, longitude: -75.978},
            {tid: 1, cid: 0, did: 0, region: "Maryland", name: "Line", abbrev: "MD", pop: 78, city: "Baltimore", state: "MD", latitude: 39.29, longitude: -76.612},
            {tid: 2, cid: 0, did: 0, region: "Delaware", name: "Blue Hens", abbrev: "DE", pop: 77, city: "Wilmington", state: "DE", latitude: 39.746, longitude: -75.547},
            {tid: 3, cid: 0, did: 0, region: "North Carolina", name: "Tar Heels", abbrev: "NC", pop: 76, city: "Charlotte", state: "NC", latitude: 35.227, longitude: -80.843},
            {tid: 4, cid: 0, did: 0, region: "South Carolina", name: "Wrens", abbrev: "SC", pop: 75, city: "Columbia", state: "SC", latitude: 34.001 , longitude: -81.035},
            {tid: 5, cid: 0, did: 0, region: "Florida", name: "Suns", abbrev: "FLOR", pop: 74, city: "Jacksonville", state: "FL", latitude: 30.332 , longitude: -81.656},
            {tid: 6, cid: 0, did: 0, region: "New Jersey", name: "Gardeners", abbrev: "NJ", pop: 73, city: "Newark", state: "NJ", latitude: 40.736, longitude: -74.172},
            {tid: 7, cid: 0, did: 0, region: "New York", name: "Emperors", abbrev: "NY", pop: 72, city: "New York", state: "NY", latitude: 40.714 , longitude: -74.006},
            {tid: 8, cid: 0, did: 1, region: "Rhode Island", name: "Oceans", abbrev: "RI", pop: 71, city: "Providence ", state: "RI", latitude: 41.824, longitude: -71.413},
            {tid: 9, cid: 0, did: 1, region: "Connecticut", name: "Myristicas", abbrev: "CONN", pop: 70, city: "Bridgeport", state: "CT", latitude: 41.167, longitude:  -73.205},
            {tid: 10, cid: 0, did: 1, region: "Massachusetts", name: "Settlers ", abbrev: "MASS", pop: 69, city: "Boston", state: "MA", latitude: 42.358, longitude: -71.06},
            {tid: 11, cid: 0, did: 1, region: "Maine", name: "Chickadees", abbrev: "MAIN", pop: 68, city: "Portland", state: "ME", latitude: 43.661, longitude: -70.255},
            {tid: 12, cid: 0, did: 1, region: "Georgia", name: "Orange", abbrev: "GEOR", pop: 67, city: "Atlanta", state: "GA", latitude: 33.749, longitude: -84.388},
            {tid: 13, cid: 0, did: 1, region: "New Hampshire", name: "Granite", abbrev: "NH", pop: 66, city: "Manchester ", state: "NH", latitude: 42.996, longitude: -71.455},
            {tid: 14, cid: 0, did: 1, region: "Pennsylvania", name: "Keystones", abbrev: "PENN", pop: 65, city: "Philadelphia", state: "PA", latitude: 39.952, longitude: -75.164},
            {tid: 15, cid: 0, did: 1, region: "Vermont", name: "Mountaineers", abbrev: "VT", pop: 64, city: "Burlington", state: "VT", latitude: 44.476, longitude: -73.212},
            {tid: 16, cid: 1, did: 2, region: "Indiana", name: "Hoosiers", abbrev: "IND", pop: 63, city: "Indianapolis", state: "IN", latitude: 39.768, longitude: -86.158},
            {tid: 17, cid: 1, did: 2, region: "Michigan", name: "Wolverines", abbrev: "MICH", pop: 62, city: "Detroit ", state: "MI", latitude: 42.331, longitude: -83.046},
            {tid: 18, cid: 1, did: 2, region: "Illinois", name: "Ferrets", abbrev: "ILL", pop: 61, city: "Chicago", state: "IL", latitude: 41.85, longitude: -87.65},
            {tid: 19, cid: 1, did: 2, region: "Ohio", name: "Buckeyes", abbrev: "OHIO", pop: 60, city: "Columbus", state: "OH", latitude: 39.961, longitude: -82.999},
            {tid: 20, cid: 1, did: 2, region: "Penn State", name: "Ruffled Grouses", abbrev: "PSU", pop: 59, city: "Pittsburgh", state: "PA", latitude: 40.441, longitude: -79.996},
            {tid: 21, cid: 1, did: 2, region: "Illinois State", name: "Badgers", abbrev: "ILLS", pop: 58, city: "Aurora", state: "IL", latitude: 41.761, longitude: -88.32},
            {tid: 22, cid: 1, did: 2, region: "Illinois Tech", name: "Coyotes", abbrev: "ILLT", pop: 57, city: "Rockford", state: "IL", latitude: 42.271, longitude: -89.094},
            {tid: 23, cid: 1, did: 2, region: "Iowa", name: "Hawkeyes", abbrev: "IOWA", pop: 56, city: "Des Moines", state: "IA", latitude: 41.601, longitude: -93.609},
            {tid: 24, cid: 1, did: 3, region: "Maryland State", name: "Regulars", abbrev: "MDS", pop: 55, city: "Columbia", state: "MD", latitude: 39.24, longitude: -76.839},
            {tid: 25, cid: 1, did: 3, region: "Michigan State", name: "Lakers", abbrev: "MICS", pop: 54, city: "Grand Rapids ", state: "MI", latitude: 42.963, longitude: -85.668},
            {tid: 26, cid: 1, did: 3, region: "Minnesota", name: "Stars", abbrev: "MINN", pop: 53, city: "Minneapolis", state: "MN", latitude: 44.98, longitude: -93.264},
            {tid: 27, cid: 1, did: 3, region: "Nebraska", name: "Cornhuskers", abbrev: "NEB", pop: 52, city: "Omaha", state: "NE", latitude: 41.259, longitude: -95.938},
            {tid: 28, cid: 1, did: 3, region: "Ohio State", name: "Cardinals", abbrev: "OHST", pop: 51, city: "Cleveland ", state: "OH", latitude: 41.499, longitude: -81.695},
            {tid: 29, cid: 1, did: 3, region: "Indiana Tech", name: "Cardinals", abbrev: "INDT", pop: 50, city: "Fort Wayne", state: "IN", latitude: 41.131, longitude: -85.129},
			//// cutoff before adding more teams
            {tid: 30, cid: 1, did: 3, region: "Wisconsin", name: "Badgers", abbrev: "WISC", pop: 49, city: "Milwaukee", state: "WI", latitude: 43.039, longitude: -87.906},			
            {tid: 31, cid: 1, did: 3, region: "West Virginia", name: "Mountaineers", abbrev: "WV", pop: 48, city: "Charleston", state: "WV", latitude: 38.35, longitude: -81.633},
            {tid: 32, cid: 2, did: 4, region: "South Carolina State", name: "Palmettos", abbrev: "SCAS", pop: 47, city: "Charleston", state: "SC", latitude: 32.777 , longitude: -79.931},
            {tid: 33, cid: 2, did: 4, region: "Tennessee", name: "Volunteers", abbrev: "TENN", pop: 46, city: "Memphis", state: "TN", latitude: 35.15, longitude: -90.049},
            {tid: 34, cid: 2, did: 4, region: "Georgia Tech", name: "Thrashers", abbrev: "GTEC", pop: 45, city: "Columbus", state: "GA", latitude: 32.461, longitude: -84.988},
			// works, but lose schedule
            {tid: 35, cid: 2, did: 4, region: "Alabama", name: "Yellowhammers", abbrev: "ALA", pop: 44, city: "Birmingham", state: "AL", latitude: 33.521, longitude: -86.802},
            {tid: 36, cid: 2, did: 4, region: "Arkansas", name: "Naturals", abbrev: "ARK", pop: 43, city: "Little Rock", state: "AR", latitude: 34.746, longitude: -92.29},
            {tid: 37, cid: 2, did: 4, region: "Alabama State", name: "Cavalry", abbrev: "ASU", pop: 42, city: "Montgomery", state: "AL", latitude: 32.367, longitude: -86.3},
            {tid: 38, cid: 2, did: 4, region: "Louisiana", name: "Pelicans", abbrev: "LOU", pop: 41, city: "New Orleans", state: "LA", latitude: 29.955, longitude: -90.075},
            {tid: 39, cid: 2, did: 4, region: "Louisiana State", name: "Plunge Divers", abbrev: "LAS", pop: 40, city: "Baton Rouge", state: "LA", latitude: 30.451, longitude: -91.155},
            {tid: 40, cid: 2, did: 5, region: "Arkansas State", name: "Mockingbirds", abbrev: "ARKS", pop: 39, city: "Fort Smith", state: "AR", latitude: 35.386, longitude: -94.399},
            {tid: 41, cid: 2, did: 5, region: "Mississippi", name: "Magnolias", abbrev: "MISI", pop: 38, city: "Jackson", state: "MS", latitude: 32.299, longitude: -90.185}, 
            {tid: 42, cid: 2, did: 5, region: "Mississippi State", name: "Magnols", abbrev: "MSSS", pop: 37, city: "West Gulfport", state: "MS", latitude: 30.404, longitude: -89.094},
            {tid: 43, cid: 2, did: 5, region: "Florida State", name: "Shine", abbrev: "FLOS", pop: 36, city: "Miami", state: "FL", latitude: 25.774, longitude: -80.194},
			//// cutoff before adding more teams
            {tid: 44, cid: 2, did: 5, region: "Arkansas Tech", name: "Wild", abbrev: "ARKT", pop: 35, city: "Fayetteville", state: "AR", latitude: 36.063, longitude: -94.157},
            {tid: 45, cid: 2, did: 5, region: "Tennessee State", name: "Statesmen", abbrev: "TENS", pop: 34, city: "New South Memphis", state: "TN", latitude: 35.087, longitude: -90.057},
            {tid: 46, cid: 2, did: 5, region: "Kentucky", name: "Cardinals", abbrev: "KENT", pop: 33, city: "Lexington-Fayette", state: "KY", latitude: 38.05, longitude: -84.459},
            {tid: 47, cid: 2, did: 5, region: "Texas State", name: "Lone Stars", abbrev: "TEXS", pop: 32, city: "San Antonio", state: "TX", latitude: 29.424, longitude: -98.494},
            {tid: 48, cid: 3, did: 6, region: "Washington", name: "Evergreens", abbrev: "WASH", pop: 31, city: "Seattle", state: "WA", latitude: 47.606, longitude: -122.332},
			// works, but lose schedule
            {tid: 49, cid: 3, did: 6, region: "Washington State", name: "Goldfinches", abbrev: "WASS", pop: 30, city: "Spokane", state: "WA", latitude: 47.66, longitude: -117.429},
            {tid: 50, cid: 3, did: 6, region: "Oregon", name: "Beavers", abbrev: "ORE", pop: 29, city: "Portland", state: "OR", latitude: 45.523, longitude: -122.676},
            {tid: 51, cid: 3, did: 6, region: "Oregon State", name: "Meadowlarks", abbrev: "ORES", pop: 28, city: "Eugene", state: "OR", latitude: 44.052, longitude: -123.087},
            {tid: 52, cid: 3, did: 6, region: "California", name: "Gold", abbrev: "CAL", pop: 27, city: "Los Angeles", state: "CA", latitude: 34.052, longitude: -118.244},
            {tid: 53, cid: 3, did: 6, region: "California State", name: "Poppies ", abbrev: "CALS", pop: 26, city: "San Diego", state: "CA", latitude: 32.715, longitude: -117.157},
            {tid: 54, cid: 3, did: 6, region: "California Tech", name: "Miners", abbrev: "CALT", pop: 25, city: "San Jose", state: "CA", latitude: 37.339, longitude: -121.895},
            {tid: 55, cid: 3, did: 6, region: "Nevada", name: "Silver", abbrev: "NEV", pop: 24, city: "Las Vegas", state: "NV", latitude: 36.175, longitude: -115.137},
			//// cutoff before adding more teams
            {tid: 56, cid: 3, did: 7, region: "Arizona", name: "Copper", abbrev: "ARIZ", pop: 23, city: "Phoenix", state: "AZ", latitude: 33.448, longitude: -112.074},
            {tid: 57, cid: 3, did: 7, region: "Arizona State", name: "Canyons", abbrev: "ARIS", pop: 22, city: "Tucson", state: "AZ", latitude: 32.222, longitude: -110.926},
            {tid: 58, cid: 3, did: 7, region: "Nevada State", name: "Sage", abbrev: "NEVS", pop: 21, city: "Henderson", state: "NV", latitude: 36.04, longitude: -114.982},
            {tid: 59, cid: 3, did: 7, region: "Hawaii", name: "Aloha", abbrev: "HAWA", pop: 20, city: "Honolulu", state: "HI", latitude: 21.307, longitude: -157.858},
            {tid: 60, cid: 3, did: 7, region: "Alaska", name: "Frontiersmen", abbrev: "ALAS", pop: 19, city: "Anchorage", state: "AK", latitude: 61.218, longitude: -149.9},
			// works, but lose schedule
            {tid: 61, cid: 3, did: 7, region: "Utah", name: "Bees", abbrev: "UTAH", pop: 18, city: "Salt Lake City", state: "UT", latitude: 40.761, longitude: -111.891},
            {tid: 62, cid: 3, did: 7, region: "Colorado", name: "Larks", abbrev: "COLO", pop: 17, city: "Denver", state: "CO", latitude: 39.739, longitude: -104.985},
            {tid: 63, cid: 3, did: 7, region: "Idaho", name: "Gems", abbrev: "IDAH", pop: 16, city: "Boise", state: "ID", latitude: 43.614, longitude: -116.203},
            {tid: 64, cid: 4, did: 8, region: "Kansas", name: "Sunflowers", abbrev: "KANS", pop: 15, city: "Wichita", state: "KS", latitude: 37.692, longitude: -97.338},
            {tid: 65, cid: 4, did: 8, region: "Oklahoma", name: "Sooners", abbrev: "OKL", pop: 14, city: "Oklahoma City", state: "OK", latitude: 35.468, longitude: -97.516},
            {tid: 66, cid: 4, did: 8, region: "Minnesota State", name: "Loons", abbrev: "MINS", pop: 13, city: "Saint Paul", state: "MN", latitude: 44.944, longitude: -93.093},
            {tid: 67, cid: 4, did: 8, region: "Kansas State", name: "Meadowlarks", abbrev: "KST", pop: 12, city: "Overland Park", state: "KS", latitude: 38.982, longitude: -94.671},
            {tid: 68, cid: 4, did: 8, region: "Oklahoma State", name: "Scissor Tails", abbrev: "OSU", pop: 11, city: "Tulsa", state: "OK", latitude: 36.154, longitude: -95.993},
            {tid: 69, cid: 4, did: 8, region: "Wyoming", name: "Jurors", abbrev: "WYOM", pop: 10, city: "Cheyenne", state: "WY", latitude: 41.14, longitude:  -104.82},
            {tid: 70, cid: 4, did: 8, region: "Montana", name: "Treasures", abbrev: "MONT", pop: 9, city: "Billings", state: "MT", latitude: 45.783, longitude: -108.501},
            {tid: 71, cid: 4, did: 8, region: "North Dakota", name: "Roughriders", abbrev: "NDU", pop: 8, city: "Fargo", state: "ND", latitude: 46.877, longitude: -96.79},
            {tid: 72, cid: 4, did: 9, region: "South Dakota", name: "Rush", abbrev: "SDU", pop: 7, city: "Sioux Falls", state: "SD", latitude: 43.55, longitude: -96.7},
            {tid: 73, cid: 4, did: 9, region: "Nebraska State", name: "Golden Knights", abbrev: "NEST", pop: 6, city: "Lincoln", state: "NE", latitude: 40.8, longitude: -96.667},
            {tid: 74, cid: 4, did: 9, region: "Texas", name: "Rangers", abbrev: "TEX", pop: 5, city: "Houston", state: "TX", latitude: 29.763, longitude: -95.363},
            {tid: 75, cid: 4, did: 9, region: "Texas Tech", name: "Loners", abbrev: "TEXT", pop: 4, city: "Dallas", state: "TX", latitude: 32.783, longitude: -96.807},
            {tid: 76, cid: 4, did: 9, region: "Missouri", name: "Show", abbrev: "MISS", pop: 3, city: "Kansas City", state: "MO", latitude: 39.1, longitude: -94.579},
            {tid: 77, cid: 4, did: 9, region: "Missouri State", name: "Me", abbrev: "MIST", pop: 2, city: "St Louis", state: "MO", latitude: 38.627, longitude: -90.198},
            {tid: 78, cid: 4, did: 9, region: "New Mexico", name: "Magic", abbrev: "NM", pop: 1, city: "Albuquerque", state: "NM", latitude: 35.084, longitude: -106.651},
            {tid: 79, cid: 4, did: 9, region: "Colorado State", name: "Buntings", abbrev: "CST", pop: .5, city: "Colorado Springs", state: "CO", latitude: 38.834, longitude: -104.821} 
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
                _gaq.push(["_trackEvent", "College Basketball - Big Five", "New league", g.lid.toString()]);
            } else if (type === "season") {
                _gaq.push(["_trackEvent", "College Basketball - Big Five", "Completed season", g.season.toString()]);
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
            "3": "Three Point Shooter",
            A: "Athlete",
            B: "Ball Handler",
            Di: "Interior Defender",
            Dp: "Perimeter Defender",
            Po: "Post Scorer",
            Ps: "Passer",
            R: "Rebounder"
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

        html = '<a href="' + leagueUrl(["player", pid]) + '">' + name + '</a>';

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
        precision = typeof precision === "number" || typeof precision === "string" ? precision : 0;

		if (amount <1000) {
			if (amount < 0) {
	            return "-$" + round(Math.abs(amount), precision) + append;
			}
	        return "$" + round(amount, precision) + append;
		} else {
			if (amount < 0) {
				return "-$" + numberWithCommas(Math.abs(amount)) + append;
	//            return "-$" + round(Math.abs(amount), precision) + append;
			}
			return "$" + numberWithCommas(amount) + append;
	//        return "$" + round(amount, precision) + append;
		}
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
            output.score = team0.pts + "-" + team1.pts;
        } else {
            output.score = team1.pts + "-" + team0.pts;
        }

        return output;
    }


    // Calculate the number of games that team is behind team0
    function gb(team0, team) {
//        return ((team0.won - team0.lost) - (team.won - team.lost)) / 2;
        return ((team0.wonConf - team0.lostConf) - (team.wonConf - team.lostConf)) / 2;
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

    return {
        validateAbbrev: validateAbbrev,
        getAbbrev: getAbbrev,
        validateTid: validateTid,
        validateSeason: validateSeason,
        getSeasons: getSeasons,
        getTeams: getTeams,
        addPopRank: addPopRank,
        getTeamsDefault: getTeamsDefault,
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
        checkNaNs: checkNaNs
    };
});
