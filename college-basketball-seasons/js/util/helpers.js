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
		
		//http://www.geonames.org/US/VA/largest-cities-in-virginia.html
		
        teams = [
            {tid: 0, cid: 0, did: 0, region: "Virginia", name: "Colonials", abbrev: "VA", pop: 320, city: "Virginia Beach", state: "VA", latitude: 36.853, longitude: -75.978},
            {tid: 1, cid: 0, did: 0, region: "Maryland", name: "Line", abbrev: "MD", pop: 319, city: "Baltimore", state: "MD", latitude: 39.29, longitude: -76.612},
            {tid: 2, cid: 0, did: 0, region: "Delaware", name: "Blue Hens", abbrev: "DE", pop: 318, city: "Wilmington", state: "DE", latitude: 39.746, longitude: -75.547},
            {tid: 3, cid: 0, did: 0, region: "North Carolina", name: "Tar Heels", abbrev: "NC", pop: 317, city: "Charlotte", state: "NC", latitude: 35.227, longitude: -80.843},
            {tid: 4, cid: 0, did: 0, region: "South Carolina", name: "Wrens", abbrev: "SC", pop: 316, city: "Columbia", state: "SC", latitude: 34.001 , longitude: -81.035},
            {tid: 5, cid: 0, did: 0, region: "Florida", name: "Suns", abbrev: "FLOR", pop: 315, city: "Jacksonville", state: "FL", latitude: 30.332 , longitude: -81.656},
            {tid: 6, cid: 0, did: 0, region: "New Jersey", name: "Gardeners", abbrev: "NJ", pop: 314, city: "Newark", state: "NJ", latitude: 40.736, longitude: -74.172},
            {tid: 7, cid: 0, did: 0, region: "New York", name: "Emperors", abbrev: "NY", pop: 313, city: "New York", state: "NY", latitude: 40.714 , longitude: -74.006},
            {tid: 8, cid: 0, did: 1, region: "Rhode Island", name: "Oceans", abbrev: "RI", pop: 312, city: "Providence ", state: "RI", latitude: 41.824, longitude: -71.413},
            {tid: 9, cid: 0, did: 1, region: "Connecticut", name: "Myristicas", abbrev: "CONN", pop: 311, city: "Bridgeport", state: "CT", latitude: 41.167, longitude:  -73.205},
            {tid: 10, cid: 0, did: 1, region: "Massachusetts", name: "Settlers ", abbrev: "MASS", pop: 310, city: "Boston", state: "MA", latitude: 42.358, longitude: -71.06},
            {tid: 11, cid: 0, did: 1, region: "Maine", name: "Chickadees", abbrev: "MAIN", pop: 309, city: "Portland", state: "ME", latitude: 43.661, longitude: -70.255},
            {tid: 12, cid: 0, did: 1, region: "Georgia", name: "Orange", abbrev: "GEOR", pop: 308, city: "Atlanta", state: "GA", latitude: 33.749, longitude: -84.388},
            {tid: 13, cid: 0, did: 1, region: "New Hampshire", name: "Granite", abbrev: "NH", pop: 307, city: "Manchester ", state: "NH", latitude: 42.996, longitude: -71.455},
            {tid: 14, cid: 0, did: 1, region: "Pennsylvania", name: "Keystones", abbrev: "PENN", pop: 306, city: "Philadelphia", state: "PA", latitude: 39.952, longitude: -75.164},
            {tid: 15, cid: 0, did: 1, region: "Vermont", name: "Mountaineers", abbrev: "VT", pop: 305, city: "Burlington", state: "VT", latitude: 44.476, longitude: -73.212},
            {tid: 16, cid: 1, did: 2, region: "Indiana", name: "Hoosiers", abbrev: "IND", pop: 304, city: "Indianapolis", state: "IN", latitude: 39.768, longitude: -86.158},
            {tid: 17, cid: 1, did: 2, region: "Michigan", name: "Wolverines", abbrev: "MICH", pop: 303, city: "Detroit ", state: "MI", latitude: 42.331, longitude: -83.046},
            {tid: 18, cid: 1, did: 2, region: "Illinois", name: "Ferrets", abbrev: "ILL", pop: 302, city: "Chicago", state: "IL", latitude: 41.85, longitude: -87.65},
            {tid: 19, cid: 1, did: 2, region: "Ohio", name: "Buckeyes", abbrev: "OHIO", pop: 301, city: "Columbus", state: "OH", latitude: 39.961, longitude: -82.999},
            {tid: 20, cid: 1, did: 2, region: "Penn State", name: "Ruffled Grouses", abbrev: "PSU", pop: 300, city: "Pittsburgh", state: "PA", latitude: 40.441, longitude: -79.996},
            {tid: 21, cid: 1, did: 2, region: "Illinois State", name: "Badgers", abbrev: "ILLS", pop: 299, city: "Aurora", state: "IL", latitude: 41.761, longitude: -88.32},
            {tid: 22, cid: 1, did: 2, region: "Illinois Tech", name: "Coyotes", abbrev: "ILLT", pop: 298, city: "Rockford", state: "IL", latitude: 42.271, longitude: -89.094},
            {tid: 23, cid: 1, did: 2, region: "Iowa", name: "Hawkeyes", abbrev: "IOWA", pop: 297, city: "Des Moines", state: "IA", latitude: 41.601, longitude: -93.609},
            {tid: 24, cid: 1, did: 3, region: "Maryland State", name: "Regulars", abbrev: "MDS", pop: 296, city: "Columbia", state: "MD", latitude: 39.24, longitude: -76.839},
            {tid: 25, cid: 1, did: 3, region: "Michigan State", name: "Lakers", abbrev: "MICS", pop: 295, city: "Grand Rapids ", state: "MI", latitude: 42.963, longitude: -85.668},
            {tid: 26, cid: 1, did: 3, region: "Minnesota", name: "Stars", abbrev: "MINN", pop: 294, city: "Minneapolis", state: "MN", latitude: 44.98, longitude: -93.264},
            {tid: 27, cid: 1, did: 3, region: "Nebraska", name: "Cornhuskers", abbrev: "NEB", pop: 293, city: "Omaha", state: "NE", latitude: 41.259, longitude: -95.938},
            {tid: 28, cid: 1, did: 3, region: "Ohio State", name: "Cardinals", abbrev: "OHST", pop: 292, city: "Cleveland ", state: "OH", latitude: 41.499, longitude: -81.695},
            {tid: 29, cid: 1, did: 3, region: "Indiana Tech", name: "Cardinals", abbrev: "INDT", pop: 291, city: "Fort Wayne", state: "IN", latitude: 41.131, longitude: -85.129},
			//// cutoff before adding more teams
            {tid: 30, cid: 1, did: 3, region: "Wisconsin", name: "Badgers", abbrev: "WISC", pop: 290, city: "Milwaukee", state: "WI", latitude: 43.039, longitude: -87.906},
			{tid: 31, cid: 1, did: 3, region: "West Virginia", name: "Mountaineers", abbrev: "WV", pop: 289, city: "Charleston", state: "WV", latitude: 38.35, longitude: -81.633},
            {tid: 32, cid: 2, did: 4, region: "South Carolina State", name: "Palmettos", abbrev: "SCAS", pop: 288, city: "Charleston", state: "SC", latitude: 32.777 , longitude: -79.931},
            {tid: 33, cid: 2, did: 4, region: "Tennessee", name: "Volunteers", abbrev: "TENN", pop: 287, city: "Memphis", state: "TN", latitude: 35.15, longitude: -90.049},
            {tid: 34, cid: 2, did: 4, region: "Georgia Tech", name: "Thrashers", abbrev: "GTEC", pop: 286, city: "Columbus", state: "GA", latitude: 32.461, longitude: -84.988},
			// works, but lose schedule
            {tid: 35, cid: 2, did: 4, region: "Alabama", name: "Yellowhammers", abbrev: "ALA", pop: 285, city: "Birmingham", state: "AL", latitude: 33.521, longitude: -86.802},
            {tid: 36, cid: 2, did: 4, region: "Arkansas", name: "Naturals", abbrev: "ARK", pop: 284, city: "Little Rock", state: "AR", latitude: 34.746, longitude: -92.29},
            {tid: 37, cid: 2, did: 4, region: "Alabama State", name: "Cavalry", abbrev: "ASU", pop: 283, city: "Montgomery", state: "AL", latitude: 32.367, longitude: -86.3},
            {tid: 38, cid: 2, did: 4, region: "Louisiana", name: "Pelicans", abbrev: "LOU", pop: 282, city: "New Orleans", state: "LA", latitude: 29.955, longitude: -90.075},
            {tid: 39, cid: 2, did: 4, region: "Louisiana State", name: "Plunge Divers", abbrev: "LAS", pop: 281, city: "Baton Rouge", state: "LA", latitude: 30.451, longitude: -91.155},
            {tid: 40, cid: 2, did: 5, region: "Arkansas State", name: "Mockingbirds", abbrev: "ARKS", pop: 280, city: "Fort Smith", state: "AR", latitude: 35.386, longitude: -94.399},
            {tid: 41, cid: 2, did: 5, region: "Mississippi", name: "Magnolias", abbrev: "MISI", pop: 279, city: "Jackson", state: "MS", latitude: 32.299, longitude: -90.185}, 
            {tid: 42, cid: 2, did: 5, region: "Mississippi State", name: "Magnols", abbrev: "MSSS", pop: 278, city: "West Gulfport", state: "MS", latitude: 30.404, longitude: -89.094},
            {tid: 43, cid: 2, did: 5, region: "Florida State", name: "Shine", abbrev: "FLOS", pop: 277, city: "Miami", state: "FL", latitude: 25.774, longitude: -80.194},
			//// cutoff before adding more teams
            {tid: 44, cid: 2, did: 5, region: "Arkansas Tech", name: "Wild", abbrev: "ARKT", pop: 276, city: "Fayetteville", state: "AR", latitude: 36.063, longitude: -94.157},
            {tid: 45, cid: 2, did: 5, region: "Tennessee State", name: "Statesmen", abbrev: "TENS", pop: 275, city: "New South Memphis", state: "TN", latitude: 35.087, longitude: -90.057},
            {tid: 46, cid: 2, did: 5, region: "Kentucky", name: "Cardinals", abbrev: "KENT", pop: 274, city: "Lexington-Fayette", state: "KY", latitude: 38.05, longitude: -84.459},
            {tid: 47, cid: 2, did: 5, region: "Texas State", name: "Lone Stars", abbrev: "TEXS", pop: 273, city: "San Antonio", state: "TX", latitude: 29.424, longitude: -98.494},
            {tid: 48, cid: 3, did: 6, region: "Washington", name: "Evergreens", abbrev: "WASH", pop: 272, city: "Seattle", state: "WA", latitude: 47.606, longitude: -122.332},
			// works, but lose schedule
            {tid: 49, cid: 3, did: 6, region: "Washington State", name: "Goldfinches", abbrev: "WASS", pop: 271, city: "Spokane", state: "WA", latitude: 47.66, longitude: -117.429},
            {tid: 50, cid: 3, did: 6, region: "Oregon", name: "Beavers", abbrev: "ORE", pop: 270, city: "Portland", state: "OR", latitude: 45.523, longitude: -122.676},
            {tid: 51, cid: 3, did: 6, region: "Oregon State", name: "Meadowlarks", abbrev: "ORES", pop: 269, city: "Eugene", state: "OR", latitude: 44.052, longitude: -123.087},
            {tid: 52, cid: 3, did: 6, region: "California", name: "Gold", abbrev: "CAL", pop: 268, city: "Los Angeles", state: "CA", latitude: 34.052, longitude: -118.244},
            {tid: 53, cid: 3, did: 6, region: "California State", name: "Poppies ", abbrev: "CALS", pop: 267, city: "San Diego", state: "CA", latitude: 32.715, longitude: -117.157},
            {tid: 54, cid: 3, did: 6, region: "California Tech", name: "Miners", abbrev: "CALT", pop: 266, city: "San Jose", state: "CA", latitude: 37.339, longitude: -121.895},
            {tid: 55, cid: 3, did: 6, region: "Nevada", name: "Silver", abbrev: "NEV", pop: 265, city: "Las Vegas", state: "NV", latitude: 36.175, longitude: -115.137},
			//// cutoff before adding more teams
            {tid: 56, cid: 3, did: 7, region: "Arizona", name: "Copper", abbrev: "ARIZ", pop: 264, city: "Phoenix", state: "AZ", latitude: 33.448, longitude: -112.074},
            {tid: 57, cid: 3, did: 7, region: "Arizona State", name: "Canyons", abbrev: "ARIS", pop: 263, city: "Tucson", state: "AZ", latitude: 32.222, longitude: -110.926},
            {tid: 58, cid: 3, did: 7, region: "Nevada State", name: "Sage", abbrev: "NEVS", pop: 262, city: "Henderson", state: "NV", latitude: 36.04, longitude: -114.982},
            {tid: 59, cid: 3, did: 7, region: "Hawaii", name: "Aloha", abbrev: "HAWA", pop: 261, city: "Honolulu", state: "HI", latitude: 21.307, longitude: -157.858},
            {tid: 60, cid: 3, did: 7, region: "Alaska", name: "Frontiersmen", abbrev: "ALAS", pop: 260, city: "Anchorage", state: "AK", latitude: 61.218, longitude: -149.9},
			// works, but lose schedule
            {tid: 61, cid: 3, did: 7, region: "Utah", name: "Bees", abbrev: "UTAH", pop: 259, city: "Salt Lake City", state: "UT", latitude: 40.761, longitude: -111.891},
            {tid: 62, cid: 3, did: 7, region: "Colorado", name: "Larks", abbrev: "COLO", pop: 258, city: "Denver", state: "CO", latitude: 39.739, longitude: -104.985},
            {tid: 63, cid: 3, did: 7, region: "Idaho", name: "Gems", abbrev: "IDAH", pop: 257, city: "Boise", state: "ID", latitude: 43.614, longitude: -116.203},
            {tid: 64, cid: 4, did: 8, region: "Kansas", name: "Sunflowers", abbrev: "KANS", pop: 256, city: "Wichita", state: "KS", latitude: 37.692, longitude: -97.338},
            {tid: 65, cid: 4, did: 8, region: "Oklahoma", name: "Sooners", abbrev: "OKL", pop: 255, city: "Oklahoma City", state: "OK", latitude: 35.468, longitude: -97.516},
            {tid: 66, cid: 4, did: 8, region: "Minnesota State", name: "Loons", abbrev: "MINS", pop: 254, city: "Saint Paul", state: "MN", latitude: 44.944, longitude: -93.093},
            {tid: 67, cid: 4, did: 8, region: "Kansas State", name: "Meadowlarks", abbrev: "KST", pop: 253, city: "Overland Park", state: "KS", latitude: 38.982, longitude: -94.671},
            {tid: 68, cid: 4, did: 8, region: "Oklahoma State", name: "Scissor Tails", abbrev: "OSU", pop: 252, city: "Tulsa", state: "OK", latitude: 36.154, longitude: -95.993},
            {tid: 69, cid: 4, did: 8, region: "Wyoming", name: "Jurors", abbrev: "WYOM", pop: 251, city: "Cheyenne", state: "WY", latitude: 41.14, longitude:  -104.82},
            {tid: 70, cid: 4, did: 8, region: "Montana", name: "Treasures", abbrev: "MONT", pop: 250, city: "Billings", state: "MT", latitude: 45.783, longitude: -108.501},
            {tid: 71, cid: 4, did: 8, region: "North Dakota", name: "Roughriders", abbrev: "NDU", pop: 249, city: "Fargo", state: "ND", latitude: 46.877, longitude: -96.79},
            {tid: 72, cid: 4, did: 9, region: "South Dakota", name: "Rush", abbrev: "SDU", pop: 248, city: "Sioux Falls", state: "SD", latitude: 43.55, longitude: -96.7},
            {tid: 73, cid: 4, did: 9, region: "Nebraska State", name: "Golden Knights", abbrev: "NEST", pop: 247, city: "Lincoln", state: "NE", latitude: 40.8, longitude: -96.667},
            {tid: 74, cid: 4, did: 9, region: "Texas", name: "Rangers", abbrev: "TEX", pop: 246, city: "Houston", state: "TX", latitude: 29.763, longitude: -95.363},
            {tid: 75, cid: 4, did: 9, region: "Texas Tech", name: "Loners", abbrev: "TEXT", pop: 245, city: "Dallas", state: "TX", latitude: 32.783, longitude: -96.807},
            {tid: 76, cid: 4, did: 9, region: "Missouri", name: "Show", abbrev: "MISS", pop: 244, city: "Kansas City", state: "MO", latitude: 39.1, longitude: -94.579},
            {tid: 77, cid: 4, did: 9, region: "Missouri State", name: "Me", abbrev: "MIST", pop: 243, city: "St Louis", state: "MO", latitude: 38.627, longitude: -90.198},
            {tid: 78, cid: 4, did: 9, region: "New Mexico", name: "Magic", abbrev: "NM", pop: 242, city: "Albuquerque", state: "NM", latitude: 35.084, longitude: -106.651},
            {tid: 79, cid: 4, did: 9, region: "Colorado State", name: "Buntings", abbrev: "CST", pop: 241, city: "Colorado Springs", state: "CO", latitude: 38.834, longitude: -104.821}, 
            {tid: 80, cid: 5, did: 10, region: "Mobile", name: "MoonPies", abbrev: "MOBI", pop: 240, city: "Mobile", state: "AL", latitude: 30.694, longitude: -88.043}, 
            {tid: 81, cid: 5, did: 10, region: "Huntsville", name: "Astronauts", abbrev: "HUNT", pop: 239, city: "Huntsville", state: "AL", latitude: 34.73, longitude: -86.586},
            {tid: 82, cid: 5, did: 10, region: "Tuscaloosa", name: "Roll", abbrev: "TUSC", pop: 238, city: "Tuscaloosa", state: "AL", latitude: 33.21, longitude: -87.569}, 
            {tid: 83, cid: 5, did: 10, region: "Fayetteville", name: "Big Box", abbrev: "FAYE", pop: 237, city: "Fayetteville", state: "AR", latitude: 36.063, longitude: -94.157}, 
            {tid: 84, cid: 5, did: 10, region: "Springdale", name: "Boom", abbrev: "DALE", pop: 236, city: "Springdale", state: "AR", latitude: 36.187, longitude: -94.129}, 
            {tid: 85, cid: 5, did: 10, region: "Jonesboro", name: "Students", abbrev: "JONE", pop: 235, city: "Jonesboro", state: "AR", latitude: 35.842, longitude: -90.704}, 
            {tid: 86, cid: 5, did: 10, region: "Shreveport", name: "Melting Pot", abbrev: "SHRE", pop: 234, city: "Shreveport", state: "LA", latitude: 32.525, longitude: -93.75}, 
            {tid: 87, cid: 5, did: 10, region: "Metairie Terrace", name: "Militaires", abbrev: "METT", pop: 233, city: "Metairie Terrace", state: "LA", latitude: 29.979, longitude: -90.164}, 
            {tid: 88, cid: 5, did: 11, region: "Metairie", name: "Farmers", abbrev: "META", pop: 232, city: "Metairie", state: "LA", latitude: 29.984, longitude: -90.153} ,
            {tid: 89, cid: 5, did: 11, region: "Gulfport", name: "Survivors", abbrev: "GULF", pop: 231, city: "Gulfport", state: "MS", latitude: 30.367, longitude: -89.093} ,
            {tid: 90, cid: 5, did: 11, region: "Southaven", name: "Northwesterns", abbrev: "SOUT", pop: 230, city: "Southaven", state: "MS", latitude: 34.989, longitude: -90.013} ,
            {tid: 91, cid: 5, did: 11, region: "Hattiesburg", name: "Engineers", abbrev: "HATT", pop: 229, city: "Hattiesburg", state: "MS", latitude: 31.327, longitude: -89.29} ,
            {tid: 92, cid: 5, did: 11, region: "Savannah", name: "Hosts", abbrev: "SAVA", pop: 228, city: "Savannah", state: "GA", latitude: 32.084, longitude: -81.1}, 
            {tid: 93, cid: 5, did: 11, region: "Athens", name: "Big Hearts", abbrev: "ATHE", pop: 227, city: "Athens", state: "GA", latitude: 33.961, longitude: -83.378}, 
            {tid: 94, cid: 5, did: 11, region: "Sandy Springs", name: "Charm", abbrev: "SAND", pop: 226, city: "Sandy Springs", state: "GA", latitude: 33.924, longitude: -84.379}, 
            {tid: 95, cid: 5, did: 11, region: "Macon", name: "Heart", abbrev: "MACO", pop: 225, city: "Macon", state: "GA", latitude: 32.841, longitude: -83.632}, 
            {tid: 96, cid: 6, did: 12, region: "Fairbanks", name: "Hearty Souls", abbrev: "FAIR", pop: 224, city: "Fairbanks", state: "AK", latitude: 64.838, longitude: -147.716}, 
            {tid: 97, cid: 6, did: 12, region: "Pearl City, Manana", name: "Trail Blazers", abbrev: "PEAR", pop: 223, city: "Pearl City, Manana", state: "HI", latitude: 21.397, longitude: -157.975}, 
            {tid: 98, cid: 6, did: 12, region: "Salem", name: "Reps", abbrev: "SALE", pop: 222, city: "Salem", state: "OR", latitude: 44.943, longitude: -123.035}, 
            {tid: 99, cid: 6, did: 12, region: "Gresham", name: "Beauty", abbrev: "GRES", pop: 221, city: "Gresham", state: "OR", latitude: 45.498, longitude:  -122.431}, 
            {tid: 100, cid: 6, did: 12, region: "Hillsboro", name: "Silicon Forest", abbrev: "HILL", pop: 220, city: "Hillsboro", state: "OR", latitude: 45.523, longitude: -122.99}, 
            {tid: 101, cid: 6, did: 12, region: "Beaverton", name: "Good Life", abbrev: "BEAV", pop: 219, city: "Beaverton", state: "OR", latitude: 45.487, longitude: -122.804}, 
            {tid: 102, cid: 6, did: 12, region: "Bend", name: "Bitter Brush", abbrev: "BEND", pop: 218, city: "Bend", state: "OR", latitude: 44.058, longitude: -121.315},
            {tid: 103, cid: 6, did: 12, region: "Medford", name: "Bears", abbrev: "MEDF", pop: 217, city: "Medford", state: "OR", latitude: 42.327, longitude: -122.876},
            {tid: 104, cid: 6, did: 13, region: "Springfield", name: "Naturals", abbrev: "ORSP", pop: 216, city: "Springfield", state: "OR", latitude: 44.046, longitude: -123.022},
            {tid: 105, cid: 6, did: 13, region: "Tacoma", name: "Rain", abbrev: "TACO", pop: 215, city: "Tacoma", state: "WA", latitude: 47.253, longitude: -122.444},
            {tid: 106, cid: 6, did: 13, region: "Vancouver", name: "Outpost", abbrev: "VANC", pop: 214, city: "Vancouver", state: "WA", latitude: 45.639, longitude: -122.661},
            {tid: 107, cid: 6, did: 13, region: "Bellevue", name: "Edge", abbrev: "BELL", pop: 213, city: "Bellevue", state: "WA", latitude: 47.61, longitude: -122.201},
            {tid: 108, cid: 6, did: 13, region: "Everett", name: "Marina", abbrev: "EVER", pop: 212, city: "Everett", state: "WA", latitude: 47.979, longitude: -122.202},
            {tid: 109, cid: 6, did: 13, region: "Kent", name: "Waterjets", abbrev: "KEWA", pop: 211, city: "Kent", state: "WA", latitude: 47.381, longitude: -122.235},
            {tid: 110, cid: 6, did: 13, region: "Yakima", name: "Brewers", abbrev: "YAKI", pop: 210, city: "Yakima", state: "WA", latitude: 46.602, longitude: -120.506},
            {tid: 111, cid: 6, did: 13, region: "Renton", name: "Fishermen", abbrev: "RENT", pop: 209, city: "Renton", state: "WA", latitude: 47.483, longitude: -122.217},
            {tid: 112, cid: 7, did: 14, region: "Mesa", name: "Apache", abbrev: "MESA", pop: 208, city: "Mesa", state: "AZ", latitude: 33.422, longitude: -111.823},
            {tid: 113, cid: 7, did: 14, region: "Chandler", name: "Tribe", abbrev: "CHAN", pop: 207, city: "Chandler", state: "AZ", latitude: 33.306, longitude: -111.841},
            {tid: 114, cid: 7, did: 14, region: "Glendale", name: "Canal", abbrev: "GLEN", pop: 206, city: "Glendale", state: "AZ", latitude: 33.539, longitude: -112.186},
            {tid: 115, cid: 7, did: 14, region: "Scottsdale", name: "South Beach", abbrev: "SCOT", pop: 205, city: "Scottsdale", state: "AZ", latitude: 33.509, longitude: -111.899},
            {tid: 116, cid: 7, did: 14, region: "Gilbert", name: "Hay Shippers", abbrev: "GILB", pop: 204, city: "Gilbert", state: "AZ", latitude: 33.353, longitude: -111.789},
            {tid: 117, cid: 7, did: 14, region: "Tempe", name: "Ferry", abbrev: "TEMP", pop: 203, city: "Tempe", state: "AZ", latitude: 33.415, longitude: -111.909},
            {tid: 118, cid: 7, did: 14, region: "Tempe Junction", name: "Ghosts", abbrev: "TEMJ", pop: 202, city: "Tempe Junction", state: "AZ", latitude: 33.414, longitude: -111.943},
            {tid: 119, cid: 7, did: 14, region: "Reno", name: "Gamblers", abbrev: "RENO", pop: 201, city: "Reno", state: "NV", latitude: 39.53, longitude: -119.814},
            {tid: 120, cid: 7, did: 15, region: "Paradise", name: "Strip", abbrev: "PARA", pop: 200, city: "Paradise", state: "NV", latitude: 36.097, longitude: -115.147},
            {tid: 121, cid: 7, did: 15, region: "North Las Vegas", name: "Mojave", abbrev: "NORT", pop: 199, city: "North Las Vegas", state: "NV", latitude: 36.199, longitude: -115.118},
            {tid: 122, cid: 7, did: 15, region: "Sunrise Manor", name: "Frenchmen", abbrev: "SUNR", pop: 198, city: "Sunrise Manor", state: "NV", latitude: 36.211, longitude: -115.073},
            {tid: 123, cid: 7, did: 15, region: "Spring Valley", name: "Racers", abbrev: "NVSP", pop: 197, city: "Spring Valley", state: "NV", latitude: 36.108, longitude: -115.245},
            {tid: 124, cid: 7, did: 15, region: "Enterprise", name: "Desert Oasis", abbrev: "ENTE", pop: 196, city: "Enterprise", state: "NV", latitude: 36.025, longitude: -115.242},
            {tid: 125, cid: 7, did: 15, region: "Carson City", name: "Mountain Men", abbrev: "CARS", pop: 195, city: "Carson City", state: "NV", latitude: 39.535, longitude: -119.753},
            {tid: 126, cid: 7, did: 15, region: "Las Cruces", name: "Crosses", abbrev: "LASC", pop: 194, city: "Las Cruces", state: "NM", latitude: 32.312, longitude: -106.778},
            {tid: 127, cid: 7, did: 15, region: "Rio Rancho", name: "Engine", abbrev: "RIOR", pop: 193, city: "Rio Rancho", state: "NM", latitude: 35.233, longitude: -106.664},
            {tid: 128, cid: 8, did: 16, region: "San Francisco", name: "Gate", abbrev: "SANF", pop: 192, city: "San Francisco", state: "CA", latitude: 37.775, longitude: -122.419},
            {tid: 129, cid: 8, did: 16, region: "Fresno", name: "San Joaquin", abbrev: "FRES", pop: 191, city: "Fresno", state: "CA", latitude: 36.748, longitude: -119.772},
            {tid: 130, cid: 8, did: 16, region: "Sacramento", name: "Seat", abbrev: "SACR", pop: 190, city: "Sacramento", state: "CA", latitude: 38.582, longitude: -121.494},
            {tid: 131, cid: 8, did: 16, region: "Long Beach", name: "Pacific", abbrev: "LONG", pop: 189, city: "Long Beach", state: "CA", latitude: 33.767, longitude: -118.189},
            {tid: 132, cid: 8, did: 16, region: "Oakland", name: "Port", abbrev: "OAKL", pop: 188, city: "Oakland", state: "CA", latitude: 37.804, longitude: -122.271},
            {tid: 133, cid: 8, did: 16, region: "Bakersfield", name: "Oil", abbrev: "BAKE", pop: 187, city: "Bakersfield", state: "CA", latitude: 35.373, longitude: -119.019},
            {tid: 134, cid: 8, did: 16, region: "Anaheim", name: "Orange", abbrev: "ANAH", pop: 186, city: "Anaheim", state: "CA", latitude: 33.835, longitude: -117.915},
            {tid: 135, cid: 8, did: 16, region: "Santa Ana", name: "River", abbrev: "SANT", pop: 185, city: "Santa Ana", state: "CA", latitude: 33.741, longitude: -117.881},
            {tid: 136, cid: 8, did: 17, region: "Riverside", name: "Empire", abbrev: "RIVE", pop: 184, city: "Riverside", state: "CA", latitude: 33.948, longitude: -117.396},
            {tid: 137, cid: 8, did: 17, region: "Stockton", name: "County Seat", abbrev: "STOC", pop: 183, city: "Stockton", state: "CA", latitude: 37.976, longitude: -121.301},
            {tid: 138, cid: 8, did: 17, region: "Chula Vista", name: "South Bay", abbrev: "CHUL", pop: 182, city: "Chula Vista", state: "CA", latitude: 32.628, longitude: -117.048},
            {tid: 139, cid: 8, did: 17, region: "Irvine", name: "Affluent", abbrev: "IRVI", pop: 181, city: "Irvine", state: "CA", latitude: 33.684, longitude: -117.792},
            {tid: 140, cid: 8, did: 17, region: "Fremont", name: "Merge", abbrev: "FREM", pop: 180, city: "Fremont", state: "CA", latitude: 37.543, longitude: -121.983},
            {tid: 141, cid: 8, did: 17, region: "San Bernardino", name: "Anchor", abbrev: "SANB", pop: 179, city: "San Bernardino", state: "CA", latitude: 34.129, longitude: -117.293},
            {tid: 142, cid: 8, did: 17, region: "Modesto", name: "Trees", abbrev: "MODE", pop: 178, city: "Modesto", state: "CA", latitude: 37.661, longitude: -120.995},
            {tid: 143, cid: 8, did: 17, region: "Oxnard", name: "Flights", abbrev: "OXNA", pop: 177, city: "Oxnard", state: "CO", latitude: 34.191, longitude: -119.182},
            {tid: 144, cid: 9, did: 18, region: "Aurora", name: "BBQ", abbrev: "AURO", pop: 176, city: "Aurora", state: "CO", latitude: 39.729, longitude: -104.832},
            {tid: 145, cid: 9, did: 18, region: "Fort Collins", name: "Foothills", abbrev: "FORT", pop: 175, city: "Fort Collins", state: "CO", latitude: 40.585, longitude: -105.084},
            {tid: 146, cid: 9, did: 18, region: "Lakewood", name: "Awe", abbrev: "LAKE", pop: 174, city: "Lakewood", state: "CO", latitude: 39.705, longitude: -105.081},
            {tid: 147, cid: 9, did: 18, region: "Thornton", name: "Home Rule", abbrev: "THOR", pop: 173, city: "Thornton", state: "CO", latitude: 39.868, longitude: -104.972},
            {tid: 148, cid: 9, did: 18, region: "Pueblo", name: "Front Range", abbrev: "PUEB", pop: 172, city: "Pueblo", state: "CO", latitude: 38.254, longitude: -104.609},
            {tid: 149, cid: 9, did: 18, region: "Arvada", name: "Olde Town", abbrev: "ARVA", pop: 171, city: "Arvada", state: "CO", latitude: 39.803, longitude: -105.087},
            {tid: 150, cid: 9, did: 18, region: "Westminster", name: "South Platte Gold", abbrev: "WEST", pop: 170, city: "Westminster", state: "CO", latitude: 39.837, longitude: -105.037},
            {tid: 151, cid: 9, did: 18, region: "Nampa", name: "Railway", abbrev: "NAMP", pop: 169, city: "Nampa", state: "ID", latitude: 43.541, longitude: -116.563},
            {tid: 152, cid: 9, did: 19, region: "Missoula", name: "Perfection", abbrev: "OULA", pop: 168, city: "Missoula", state: "MT", latitude: 46.872, longitude: -113.994},
            {tid: 153, cid: 9, did: 19, region: "Bismarck", name: "Capitol", abbrev: "BISM", pop: 167, city: "Bismarck", state: "ND", latitude: 46.808, longitude: -100.784},
            {tid: 154, cid: 9, did: 19, region: "Rapid City", name: "Black Hills", abbrev: "RAPI", pop: 166, city: "Rapid City", state: "SD", latitude: 44.081, longitude: -103.231},
            {tid: 155, cid: 9, did: 19, region: "West Valley City", name: "Maveriks", abbrev: "WEVC", pop: 165, city: "West Valley City", state: "UT", latitude: 40.692, longitude: -112.001},
            {tid: 156, cid: 9, did: 19, region: "Provo", name: "Missionaries", abbrev: "PROV", pop: 164, city: "Provo", state: "UT", latitude: 40.234, longitude: -111.659},
            {tid: 157, cid: 9, did: 19, region: "West Jordan", name: "Oquirrh", abbrev: "WEJO", pop: 163, city: "West Jordan", state: "UT", latitude: 40.61, longitude: -111.939},
            {tid: 158, cid: 9, did: 19, region: "Sandy Hills", name: "Expos", abbrev: "SAHI", pop: 162, city: "Sandy Hills", state: "UT", latitude: 40.581, longitude: -111.851},
            {tid: 159, cid: 9, did: 19, region: "Casper", name: "Cowboys", abbrev: "CASP", pop: 161, city: "Casper", state: "WY", latitude: 42.867, longitude: -106.313},
            {tid: 160, cid: 10, did: 20, region: "New Haven", name: "Harbor", abbrev: "NEHA", pop: 160, city: "New Haven", state: "CT", latitude: 41.308, longitude: -72.928},
            {tid: 161, cid: 10, did: 20, region: "Hartford", name: "Disbanded", abbrev: "HART", pop: 159, city: "Hartford", state: "CT", latitude: 41.764, longitude: -72.685},
            {tid: 162, cid: 10, did: 20, region: "Stamford", name: "Fortune", abbrev: "STAM", pop: 158, city: "Stamford", state: "CT", latitude: 41.053, longitude: -73.539},
            {tid: 163, cid: 10, did: 20, region: "North Stamford", name: "Stone", abbrev: "NOST", pop: 157, city: "North Stamford", state: "CT", latitude: 41.138, longitude: -73.543},
            {tid: 164, cid: 10, did: 20, region: "Waterbury", name: "Brass", abbrev: "WATE", pop: 156, city: "Waterbury", state: "CT", latitude: 41.558, longitude: -73.051},
            {tid: 165, cid: 10, did: 20, region: "Norwalk", name: "Norwaukees", abbrev: "NORW", pop: 155, city: "Norwalk", state: "CT", latitude: 41.118, longitude: -73.408},
            {tid: 166, cid: 10, did: 20, region: "Lewiston", name: "Androscoggin", abbrev: "LEWI", pop: 154, city: "Lewiston", state: "ME", latitude: 44.1, longitude: -70.215},
            {tid: 167, cid: 10, did: 20, region: "South Boston", name: "Southie", abbrev: "SOBO", pop: 153, city: "South Boston", state: "MA", latitude: 42.333, longitude: -71.049},
            {tid: 168, cid: 10, did: 21, region: "Worcester", name: "Heart", abbrev: "WORC", pop: 152, city: "Worcester", state: "MA", latitude: 42.263, longitude: -71.802},
            {tid: 169, cid: 10, did: 21, region: "Springfield", name: "Firsts", abbrev: "SPMA", pop: 151, city: "Springfield", state: "MA", latitude: 42.101, longitude: -72.59},
            {tid: 170, cid: 10, did: 21, region: "Lowell", name: "Revolution", abbrev: "LOWE", pop: 150, city: "Lowell", state: "MA", latitude: 42.633, longitude: -71.316},
            {tid: 171, cid: 10, did: 21, region: "Cambridge", name: "University", abbrev: "CAMB", pop: 149, city: "Cambridge", state: "MA", latitude: 42.375, longitude: -71.106},
            {tid: 172, cid: 10, did: 21, region: "New Bedford", name: "Whalers", abbrev: "NEBE", pop: 148, city: "New Bedford", state: "MA", latitude: 41.636, longitude: -70.934},
            {tid: 173, cid: 10, did: 21, region: "Nashua", name: "Best", abbrev: "NANH", pop: 147, city: "Nashua", state: "NH", latitude: 42.765, longitude: -71.468},
            {tid: 174, cid: 10, did: 21, region: "Warwick", name: "Revolutionaries", abbrev: "WARW", pop: 146, city: "Warwick", state: "RI", latitude: 41.7, longitude: -71.416},
            {tid: 175, cid: 10, did: 21, region: "South Burlington", name: "Green", abbrev: "SOBU", pop: 145, city: "South Burlington", state: "VT", latitude: 44.467, longitude: -73.171},
            {tid: 176, cid: 11, did: 22, region: "Dover", name: "Air Force", abbrev: "DOVE", pop: 144, city: "Dover", state: "DE", latitude: 39.158, longitude: -75.524},
            {tid: 177, cid: 11, did: 22, region: "NE Washington", name: "Arboretum", abbrev: "NEDC", pop: 143, city: "NE Washington DC", state: "DC", latitude: 38.895 , longitude: -77.036},
            {tid: 178, cid: 11, did: 22, region: "SE Washington", name: "Anacostia", abbrev: "SEDC", pop: 142, city: "SE Washington DC", state: "DC", latitude: 38.895 , longitude: -77.036},
            {tid: 179, cid: 11, did: 22, region: "SW Washington", name: "Mall", abbrev: "SWDC", pop: 141, city: "SW Washington DC", state: "DC", latitude: 38.895 , longitude: -77.036},
            {tid: 180, cid: 11, did: 22, region: "NW Washington", name: "Triangle", abbrev: "NWDC", pop: 140, city: "NW Washington DC", state: "DC", latitude: 38.895 , longitude: -77.036},
            {tid: 181, cid: 11, did: 22, region: "Germantown", name: "Villages", abbrev: "GERM", pop: 139, city: "Germantown", state: "MD", latitude: 39.173 , longitude: -77.272},
            {tid: 182, cid: 11, did: 22, region: "Silver Spring", name: "Renaissance", abbrev: "SILV", pop: 138, city: "Silver Spring", state: "MD", latitude: 38.991 , longitude: -77.026},
            {tid: 183, cid: 11, did: 22, region: "Norfolk", name: "Navy", abbrev: "NORF", pop: 137, city: "Norfolk", state: "VA", latitude: 36.847 , longitude: -76.285},
            {tid: 184, cid: 11, did: 23, region: "Chesapeake", name: "Consolidation", abbrev: "CHES", pop: 136, city: "Chesapeake", state: "VA", latitude: 36.819 , longitude: -76.275},
            {tid: 185, cid: 11, did: 23, region: "Arlington", name: "Capital District", abbrev: "ARLI", pop: 135, city: "Arlington", state: "VA", latitude: 38.881 , longitude: -77.104},
            {tid: 186, cid: 11, did: 23, region: "Richmond", name: "Fall Line", abbrev: "RICH", pop: 134, city: "Richmond", state: "VA", latitude: 37.554 , longitude: -77.46},
            {tid: 187, cid: 11, did: 23, region: "Newport News", name: "New World", abbrev: "NENE", pop: 133, city: "Newport News", state: "VA", latitude: 36.979 , longitude: -76.428},
            {tid: 188, cid: 11, did: 23, region: "East Hampton", name: "Air", abbrev: "EAHA", pop: 132, city: "East Hampton", state: "VA", latitude: 37.037 , longitude: -76.332},
            {tid: 189, cid: 11, did: 23, region: "Alexandria", name: "Belhaven", abbrev: "ALEX", pop: 131, city: "Alexandria", state: "VA", latitude: 38.805 , longitude: -77.047},
            {tid: 190, cid: 11, did: 23, region: "Hampton", name: "Space", abbrev: "HAMPT", pop: 130, city: "Hampton", state: "VA", latitude: 37.03 , longitude: -76.345},
            {tid: 191, cid: 11, did: 23, region: "Portsmouth Heights", name: "Cyclists", abbrev: "POHE", pop: 129, city: "Portsmouth Heights", state: "VA", latitude: 36.821 , longitude: -76.369},
            {tid: 192, cid: 12, did: 24, region: "Tampa", name: "Sticks of Fire", abbrev: "TAMP", pop: 128, city: "Tampa", state: "FL", latitude: 27.971 , longitude: -82.465},
            {tid: 193, cid: 12, did: 24, region: "Saint Petersburg", name: "Petes", abbrev: "STPE", pop: 127, city: "Saint Petersburg", state: "FL", latitude: 27.782 , longitude: -82.668},
            {tid: 194, cid: 12, did: 24, region: "Orlando", name: "Theme", abbrev: "ORLA", pop: 126, city: "Orlando", state: "FL", latitude: 28.534 , longitude: -81.376},
            {tid: 195, cid: 12, did: 24, region: "Hialeah", name: "Elephants", abbrev: "HIAL", pop: 125, city: "Hialeah", state: "FL", latitude: 25.860 , longitude: -80.294},
            {tid: 196, cid: 12, did: 24, region: "Tallahassee", name: "Panhandle", abbrev: "TALL", pop: 124, city: "Tallahassee", state: "FL", latitude: 30.452 , longitude: -84.273},
            {tid: 197, cid: 12, did: 24, region: "Fort Lauderdale", name: "Red Brick Road", abbrev: "FOLA", pop: 123, city: "Fort Lauderdale", state: "FL", latitude:  26.136 , longitude: -80.142},
            {tid: 198, cid: 12, did: 24, region: "Port Saint Lucie", name: "Fishermen", abbrev: "PSTL", pop: 122, city: "Port Saint Lucie", state: "FL", latitude: 27.276 , longitude: -80.355},
            {tid: 199, cid: 12, did: 24, region: "Pembroke Pines", name: "Small Town", abbrev: "PEPI", pop: 121, city: "Pembroke Pines", state: "FL", latitude: 26.013 , longitude: -80.314},
            {tid: 200, cid: 12, did: 25, region: "Coral Springs", name: "Master Planners", abbrev: "COSP", pop: 120, city: "Coral Springs", state: "FL", latitude: 26.271 , longitude: -80.259},
            {tid: 201, cid: 12, did: 25, region: "Gainesville", name: "Swamp", abbrev: "GAIN", pop: 119, city: "Gainesville", state: "FL", latitude: 29.665 , longitude: -82.336},
            {tid: 202, cid: 12, did: 25, region: "Clearwater", name: "Sunshine", abbrev: "CLEA", pop: 118, city: "Clearwater", state: "FL", latitude: 27.974 , longitude: -82.764},
            {tid: 203, cid: 12, did: 25, region: "Cape Coral", name: "Wonder", abbrev: "CACO", pop: 117, city: "Cape Coral", state: "FL", latitude: 26.640 , longitude: -81.982},
            {tid: 204, cid: 12, did: 25, region: "Miami Gardens", name: "Aventura", abbrev: "MIGA", pop: 116, city: "Miami Gardens", state: "FL", latitude: 25.980 , longitude: -80.202},
            {tid: 205, cid: 12, did: 25, region: "Pompano Beach", name: "Water", abbrev: "POBE", pop: 115, city: "Pompano Beach", state: "FL", latitude: 26.235 , longitude: -80.126},
            {tid: 206, cid: 12, did: 25, region: "Hollywood", name: "Tourists", abbrev: "HOLL", pop: 114, city: "Hollywood", state: "FL", latitude: 26.021 , longitude: -80.175},
            {tid: 207, cid: 12, did: 25, region: "Miramar", name: "Havana", abbrev: "MIRA", pop: 113, city: "Miramar", state: "FL", latitude: 25.979 , longitude: -80.282},
            {tid: 208, cid: 13, did: 26, region: "Joliet", name: "Speed", abbrev: "JOLI", pop: 112, city: "Joliet", state: "IL", latitude: 41.525 , longitude: -88.083},
            {tid: 209, cid: 13, did: 26, region: "Naperville", name: "Community", abbrev: "NAPE", pop: 111, city: "Naperville", state: "IL", latitude: 41.786 , longitude: -88.147},
            {tid: 210, cid: 13, did: 26, region: "Springfield", name: "Abrahams", abbrev: "SPIL", pop: 110, city: "Springfield", state: "IL", latitude: 39.802 , longitude: -89.644},
            {tid: 211, cid: 13, did: 26, region: "Peoria", name: "First", abbrev: "PEOR", pop: 109, city: "Peoria", state: "IL", latitude: 40.694 , longitude: -89.589},
            {tid: 212, cid: 13, did: 26, region: "North Peoria", name: "Explorers", abbrev: "NOPE", pop: 108, city: "North Peoria", state: "IL", latitude: 40.718 , longitude: -89.584},
            {tid: 213, cid: 13, did: 26, region: "Elgin", name: "Foxes", abbrev: "ELGI", pop: 107, city: "Elgin", state: "IL", latitude: 42.037 , longitude: -88.281},
            {tid: 214, cid: 13, did: 26, region: "Waukegan", name: "Benny", abbrev: "WAUK", pop: 106, city: "Waukegan", state: "IL", latitude: 42.364 , longitude:  -87.845},
            {tid: 215, cid: 13, did: 26, region: "Cicero", name: "Legion", abbrev: "CICE", pop: 105, city: "Cicero", state: "IL", latitude: 41.845 , longitude: -87.760},
            {tid: 216, cid: 13, did: 27, region: "Champaign", name: "Silicon Prairie", abbrev: "CHAM", pop: 104, city: "Champaign", state: "IL", latitude: 40.113 , longitude: -88.261},
            {tid: 217, cid: 13, did: 27, region: "Bloomington", name: "Normal", abbrev: "BLIL", pop: 103, city: "Bloomington", state: "IL", latitude: 40.478 , longitude: -88.984},
            {tid: 218, cid: 13, did: 27, region: "Arlington Heights", name: "Villagers", abbrev: "ARHE", pop: 102, city: "Arlington Heights", state: "IL", latitude: 42.095 , longitude: -87.981},
            {tid: 219, cid: 13, did: 27, region: "Evansville", name: "Oxbow", abbrev: "EVAN", pop: 101, city: "Evansville", state: "IN", latitude: 37.975 , longitude: -87.556},
            {tid: 220, cid: 13, did: 27, region: "South Bend", name: "Fur Traders", abbrev: "SOBE", pop: 100, city: "South Bend", state: "IN", latitude: 41.683 , longitude: -86.25},
            {tid: 221, cid: 13, did: 27, region: "Hammond", name: "Replacing Gary", abbrev: "HAMM", pop: 99, city: "Hammond", state: "IN", latitude: 41.583 , longitude: -87.5},
            {tid: 222, cid: 13, did: 27, region: "Bloomington", name: "Progressives", abbrev: "BLIN", pop: 98, city: "Bloomington", state: "IN", latitude: 39.165 , longitude: -86.526},
            {tid: 223, cid: 13, did: 27, region: "Gary", name: "Dunes", abbrev: "GARY", pop: 97, city: "Gary", state: "IN", latitude: 41.593 , longitude: -87.346},
            {tid: 224, cid: 14, did: 28, region: "Cedar Rapids", name: "Banks", abbrev: "CERA", pop: 96, city: "Cedar Rapids", state: "IA", latitude: 42.008 , longitude: -91.644},
            {tid: 225, cid: 14, did: 28, region: "Davenport", name: "Mississippi", abbrev: "DAVE", pop: 95, city: "Davenport", state: "IA", latitude: 41.524, longitude: -90.578},
            {tid: 226, cid: 14, did: 28, region: "Sioux City", name: "Missouri", abbrev: "SIOU", pop: 94, city: "Sioux City", state: "IA", latitude: 42.5 , longitude: -96.4},
            {tid: 227, cid: 14, did: 28, region: "Kansas City", name: "Braves of the King", abbrev: "KACI", pop: 93, city: "Kansas City", state: "KS", latitude: 39.114 , longitude: -94.627},
            {tid: 228, cid: 14, did: 28, region: "Topeka", name: "Diggers", abbrev: "TOPE", pop: 92, city: "Topeka", state: "KS", latitude: 39.048 , longitude: -95.678},
            {tid: 229, cid: 14, did: 28, region: "Olathe", name: "Eleventh", abbrev: "OLAT", pop: 91, city: "Olathe", state: "KS", latitude: 38.881 , longitude: -94.819},
            {tid: 230, cid: 14, did: 28, region: "Lawrence", name: "Collegians", abbrev: "LAWR", pop: 90, city: "Lawrence", state: "KS", latitude: 38.972, longitude: -95.235},
            {tid: 231, cid: 14, did: 28, region: "Shawnee", name: "Blue Jackets", abbrev: "SHAW", pop: 89, city: "Shawnee", state: "KS", latitude: 39.042 , longitude:  -94.72},			
            {tid: 232, cid: 14, did: 29, region: "Springfield", name: "Royalty", abbrev: "SPMO", pop: 88, city: "Springfield", state: "MO", latitude: 37.215 , longitude:  -93.298},			
            {tid: 233, cid: 14, did: 29, region: "Independence", name: "Departure", abbrev: "INDE", pop: 87, city: "Independence", state: "MO", latitude: 39.091 , longitude:  -94.416},			
            {tid: 234, cid: 14, did: 29, region: "East Independence", name: "Presidents", abbrev: "EAIN", pop: 86, city: "East Independence", state: "MO", latitude: 39.096 , longitude:  -94.355},			
            {tid: 235, cid: 14, did: 29, region: "Columbia", name: "Midwesterners", abbrev: "COLU", pop: 85, city: "Columbia", state: "MO", latitude: 38.952 , longitude:  -92.334},			
            {tid: 236, cid: 14, did: 29, region: "Lee's Summit", name: "Improvement", abbrev: "LESU", pop: 84, city: "Lee's Summit", state: "MO", latitude: 38.911 , longitude:  -94.382},			
            {tid: 237, cid: 14, did: 29, region: "O'Fallon", name: "Congregations", abbrev: "OFAL", pop: 83, city: "O'Fallon", state: "MO", latitude: 38.811 , longitude:  -90.7},			
            {tid: 238, cid: 14, did: 29, region: "Bellevue", name: "Trading Post", abbrev: "BENE", pop: 82, city: "Bellevue", state: "NE", latitude: 41.137 , longitude:  -95.891},			
            {tid: 239, cid: 14, did: 29, region: "Grand Island", name: "All Americans", abbrev: "GRIS", pop: 81, city: "Grand Island", state: "NE", latitude: 40.925 , longitude:  -98.342},			
            {tid: 240, cid: 15, did: 30, region: "Warren", name: "Army", abbrev: "WARR", pop: 80, city: "Warren", state: "MI", latitude: 42.478 , longitude:  -83.028},			
            {tid: 241, cid: 15, did: 30, region: "Sterling Heights", name: "Core", abbrev: "STHE", pop: 79, city: "Sterling Heights", state: "MI", latitude: 42.58 , longitude:  -83.03},
            {tid: 242, cid: 15, did: 30, region: "Lansing", name: "Magic", abbrev: "LANS", pop: 78, city: "Lansing", state: "MI", latitude: 42.733 , longitude:  -84.556},
            {tid: 243, cid: 15, did: 30, region: "Ann Arbor", name: "Bur Oak", abbrev: "ANAR", pop: 77, city: "Ann Arbor", state: "MI", latitude: 42.278 , longitude:  -83.741},
            {tid: 244, cid: 15, did: 30, region: "Flint", name: "Lumberjacks", abbrev: "FLIN", pop: 76, city: "Flint", state: "MI", latitude: 43.013 , longitude:  -83.687},	
            {tid: 245, cid: 15, did: 30, region: "Clinton", name: "Township", abbrev: "CTOC", pop: 75, city: "Clinton", state: "MI", latitude: 42.587 , longitude:  -82.92},
            {tid: 246, cid: 15, did: 30, region: "Dearborn", name: "Rouge", abbrev: "DEAR", pop: 74, city: "Dearborn", state: "MI", latitude: 42.322 , longitude:  -83.176},
            {tid: 247, cid: 15, did: 30, region: "Livonia", name: "Neighborhoods", abbrev: "LIVO", pop: 73, city: "Livonia", state: "MI", latitude: 42.368 , longitude:  -83.353},		
            {tid: 248, cid: 15, did: 31, region: "Canton", name: "Charter", abbrev: "CANT", pop: 72, city: "Canton", state: "MI", latitude: 42.313 , longitude:  -83.475},		
            {tid: 249, cid: 15, did: 31, region: "Rochester", name: "Zumbro", abbrev: "ROMN", pop: 71, city: "Rochester", state: "MN", latitude: 44.022, longitude:  -92.47},		
            {tid: 250, cid: 15, did: 31, region: "Duluth", name: "Superior", abbrev: "DULU", pop: 70, city: "Duluth", state: "MN", latitude: 46.783 , longitude:  -92.107},		
            {tid: 251, cid: 15, did: 31, region: "Bloomington", name: "Mall", abbrev: "BLMN", pop: 69, city: "Bloomington", state: "MN", latitude: 44.841 , longitude:  -93.298},		
            {tid: 252, cid: 15, did: 31, region: "Madison", name: "Concerts", abbrev: "MADI", pop: 68, city: "Madison", state: "WI", latitude: 43.073 , longitude:  -89.401},		
            {tid: 253, cid: 15, did: 31, region: "Green Bay", name: "Packers", abbrev: "GRBA", pop: 67, city: "Green Bay", state: "WI", latitude: 44.519 , longitude:  -88.02},		
            {tid: 254, cid: 15, did: 31, region: "Kenosha", name: "Michigan", abbrev: "KENO", pop: 66, city: "Kenosha", state: "WI", latitude: 42.585 , longitude:  -87.821},		
            {tid: 255, cid: 15, did: 31, region: "Racine", name: "Root", abbrev: "RACI", pop: 65, city: "Racine", state: "WI", latitude: 42.726 , longitude: -87.783},		
            {tid: 256, cid: 16, did: 32, region: "Jersey City", name: "1930", abbrev: "JECI", pop: 64, city: "Jersey City", state: "NJ", latitude: 40.728 , longitude: -74.078},		
            {tid: 257, cid: 16, did: 32, region: "Paterson", name: "Density", abbrev: "PATE", pop: 63, city: "Paterson", state: "NJ", latitude: 40.917 , longitude: -74.172},		
            {tid: 258, cid: 16, did: 32, region: "Elizabeth", name: "Green", abbrev: "ELIZ", pop: 62, city: "Elizabeth", state: "NJ", latitude: 40.664 , longitude: -74.211},		
            {tid: 259, cid: 16, did: 32, region: "Edison", name: "Raritan", abbrev: "EDIS", pop: 61, city: "Edison", state: "NJ", latitude: 40.519 , longitude: -74.412},		
            {tid: 260, cid: 16, did: 32, region: "Brooklyn", name: "Kings", abbrev: "BROO", pop: 60, city: "Brooklyn", state: "NY", latitude: 40.65 , longitude: -73.95},		
            {tid: 261, cid: 16, did: 32, region: "Queens", name: "Culture", abbrev: "QUEE", pop: 59, city: "Queens", state: "NY", latitude: 40.681 , longitude: -73.837},		
            {tid: 262, cid: 16, did: 32, region: "Manhattan", name: "Island", abbrev: "MANH", pop: 58, city: "Manhattan", state: "NY", latitude: 40.783 , longitude: -73.966},		
            {tid: 263, cid: 16, did: 32, region: "Bronx", name: "Mainland", abbrev: "BRON", pop: 57, city: "Bronx", state: "NY", latitude: 40.85 , longitude: -73.866},		
            {tid: 264, cid: 16, did: 33, region: "Staten Island", name: "Forgotten", abbrev: "STIS", pop: 56, city: "Staten Island", state: "NY", latitude: 40.562 , longitude: -74.14},		
            {tid: 265, cid: 16, did: 33, region: "Buffalo", name: "Erie", abbrev: "BUFF", pop: 55, city: "Buffalo", state: "NY", latitude: 42.886 , longitude: -78.878},		
            {tid: 266, cid: 16, did: 33, region: "Jamaica", name: "Rustdorp", abbrev: "JAMA", pop: 54, city: "Jamaica", state: "NY", latitude: 40.691 , longitude: -73.806},		
            {tid: 267, cid: 16, did: 33, region: "Rochester", name: "Vulgaris", abbrev: "ROCH", pop: 53, city: "Rochester", state: "NY", latitude: 43.155 , longitude: -77.616},		
            {tid: 268, cid: 16, did: 33, region: "Yonkers", name: "Getty", abbrev: "YONK", pop: 52, city: "Yonkers", state: "NY", latitude: 40.931 , longitude: -73.899},		
            {tid: 269, cid: 16, did: 33, region: "Syracuse", name: "Soldato", abbrev: "SYRA", pop: 51, city: "Syracuse", state: "NY", latitude: 43.047 , longitude: -76.144},		
            {tid: 270, cid: 16, did: 33, region: "Albany", name: "Mohawks", abbrev: "ALBA", pop: 50, city: "Albany", state: "NY", latitude: 42.660 , longitude: -73.781},		
            {tid: 271, cid: 16, did: 33, region: "New Rochelle", name: "Huguenots", abbrev: "NERO", pop: 49, city: "New Rochelle", state: "NY", latitude: 40.929 , longitude: -73.784},		
            {tid: 272, cid: 17, did: 34, region: "Meads", name: "Locamotive", abbrev: "MEAD", pop: 48, city: "Meads", state: "KY", latitude: 38.413  , longitude: -82.709},		
            {tid: 273, cid: 17, did: 34, region: "Ironville", name: "Ashland", abbrev: "IRON", pop: 47, city: "Ironville", state: "KY", latitude: 38.456 , longitude: -82.692},		
            {tid: 274, cid: 17, did: 34, region: "Louisville", name: "First Class", abbrev: "LOUI", pop: 46, city: "Louisville", state: "KY", latitude: 38.254 , longitude: -85.759},		
            {tid: 275, cid: 17, did: 34, region: "Raleigh", name: "Oaks", abbrev: "RALE", pop: 45, city: "Raleigh", state: "NC", latitude: 35.772 , longitude: -78.639},		
            {tid: 276, cid: 17, did: 34, region: "West Raleigh", name: "State", abbrev: "WERA", pop: 44, city: "West Raleigh", state: "NC", latitude: 35.787 , longitude: -78.664},		
            {tid: 277, cid: 17, did: 34, region: "Greensboro", name: "Center", abbrev: "GREE", pop: 43, city: "Greensboro", state: "NC", latitude: 36.073 , longitude: -79.792},		
            {tid: 278, cid: 17, did: 34, region: "Winston-Salem", name: "North Main", abbrev: "WISA", pop: 42, city: "Winston-Salem", state: "NC", latitude: 36.1 , longitude: -80.244},		
            {tid: 279, cid: 17, did: 34, region: "Durham", name: "Bulls", abbrev: "DURH", pop: 41, city: "Durham", state: "NC", latitude: 35.994 , longitude: -78.899},		
            {tid: 280, cid: 17, did: 35, region: "Fayetteville", name: "Bragg", abbrev: "FAYE", pop: 40, city: "Fayetteville", state: "NC", latitude: 35.053 , longitude: -78.878},		
            {tid: 281, cid: 17, did: 35, region: "Cary", name: "Researchers", abbrev: "CARY", pop: 39, city: "Cary", state: "NC", latitude: 35.792 , longitude: -78.781},		
            {tid: 282, cid: 17, did: 35, region: "North Charleston", name: "Retail", abbrev: "NOCH", pop: 38, city: "North Charleston", state: "SC", latitude: 32.855 , longitude: -79.975},		
            {tid: 283, cid: 17, did: 35, region: "Nashville", name: "Cumberland", abbrev: "NASH", pop: 37, city: "Nashville", state: "TN", latitude: 36.166 , longitude: -86.784},		
            {tid: 284, cid: 17, did: 35, region: "Knoxville", name: "War", abbrev: "KNOX", pop: 36, city: "Knoxville", state: "TN", latitude: 35.961 , longitude: -83.921},		
            {tid: 285, cid: 17, did: 35, region: "Chattanooga", name: "Nickajack", abbrev: "CHAT", pop: 35, city: "Chattanooga", state: "TN", latitude: 35.046 , longitude: -85.31},		
            {tid: 286, cid: 17, did: 35, region: "East Chattanooga", name: "Walnut", abbrev: "EACH", pop: 34, city: "East Chattanooga", state: "TN", latitude: 35.065 , longitude: -85.249},		
            {tid: 287, cid: 17, did: 35, region: "Clarksville", name: "Frontier Fighters", abbrev: "CLAR", pop: 33, city: "Clarksville", state: "TN", latitude: 36.53 , longitude: -87.359},		
            {tid: 288, cid: 18, did: 36, region: "Cincinnati", name: "Jungle", abbrev: "CINC", pop: 32, city: "Cincinnati", state: "OH", latitude: 39.162 , longitude: -84.457},		
            {tid: 289, cid: 18, did: 36, region: "Toledo", name: "Clear", abbrev: "TOLE", pop: 31, city: "Toledo", state: "OH", latitude: 41.664 , longitude: -83.555},		
            {tid: 290, cid: 18, did: 36, region: "Akron", name: "Marbles", abbrev: "AKRO", pop: 30, city: "Akron", state: "OH", latitude: 41.081 , longitude: -81.519},		
            {tid: 291, cid: 18, did: 36, region: "Dayton", name: "Logistics ", abbrev: "DAYT", pop: 29, city: "Dayton", state: "OH", latitude: 39.759 , longitude: -84.192},		
            {tid: 292, cid: 18, did: 36, region: "Parma", name: "Greenbriar", abbrev: "PARM", pop: 28, city: "Parma", state: "OH", latitude: 41.405 , longitude: -81.723},		
            {tid: 293, cid: 18, did: 36, region: "Canton", name: "Nimishillen", abbrev: "CAOH", pop: 27, city: "Canton", state: "OH", latitude: 40.799 , longitude: -81.378},		
            {tid: 294, cid: 18, did: 36, region: "Youngstown", name: "Grist", abbrev: "YOUN", pop: 26, city: "Youngstown", state: "OH", latitude: 41.1, longitude: -80.65},		
            {tid: 295, cid: 18, did: 36, region: "Lorain", name: "Steel", abbrev: "LORA", pop: 25, city: "Lorain", state: "OH", latitude: 41.453 , longitude: -82.182},		
            {tid: 296, cid: 18, did: 37, region: "Hamilton", name: "Sculpture", abbrev: "HAOH", pop: 24, city: "Hamilton", state: "OH", latitude: 39.396 , longitude: -84.565},		
            {tid: 297, cid: 18, did: 37, region: "Allentown", name: "Valley", abbrev: "ALLE", pop: 23, city: "Allentown", state: "PA", latitude: 40.608 , longitude: -75.49},		
            {tid: 298, cid: 18, did: 37, region: "Erie", name: "Flagship", abbrev: "ERIE", pop: 22, city: "Erie", state: "PA", latitude: 42.129 , longitude: -80.085},		
            {tid: 299, cid: 18, did: 37, region: "Reading", name: "Pretzel", abbrev: "READ", pop: 21, city: "Reading", state: "PA", latitude: 40.336 , longitude: -75.927},		
            {tid: 300, cid: 18, did: 37, region: "Scranton", name: "Federal", abbrev: "SCRA", pop: 20, city: "Scranton", state: "PA", latitude: 41.409 , longitude: -75.665},		
            {tid: 301, cid: 18, did: 37, region: "Bethlehem", name: "Moravians", abbrev: "BETH", pop: 19, city: "Bethlehem", state: "PA", latitude: 40.626 , longitude: -75.37},		
            {tid: 302, cid: 18, did: 37, region: "Lancaster", name: "Pennsylvania Dutch", abbrev: "LANC", pop: 18, city: "Lancaster", state: "PA", latitude: 40.038 , longitude: -76.306},		
            {tid: 303, cid: 18, did: 37, region: "Huntington", name: "Landing", abbrev: "HUWV", pop: 17, city: "Huntington", state: "WV", latitude: 38.419 , longitude: -82.445},		
            {tid: 304, cid: 19, did: 38, region: "Norman", name: "Land Run", abbrev: "NORM", pop: 16, city: "Norman", state: "OK", latitude: 35.223 , longitude: -97.439},		
            {tid: 305, cid: 19, did: 38, region: "Broken Arrow", name: "Creek", abbrev: "BRAR", pop: 15, city: "Broken Arrow", state: "OK", latitude: 36.053 , longitude: -95.791},		
            {tid: 306, cid: 19, did: 38, region: "Lawton", name: "Fort", abbrev: "LAWT", pop: 14, city: "Lawton", state: "OK", latitude: 34.609 , longitude: -98.39},		
            {tid: 307, cid: 19, did: 38, region: "Austin", name: "Pioneers", abbrev: "AUST", pop: 13, city: "Austin", state: "TX", latitude: 30.267 , longitude: -97.743},		
            {tid: 308, cid: 19, did: 38, region: "Fort Worth", name: "Outpost", abbrev: "FOWO", pop: 12, city: "Fort Worth", state: "TX", latitude: 32.725 , longitude: -97.321},		
            {tid: 309, cid: 19, did: 38, region: "El Paso", name: "Grande", abbrev: "ELPA", pop: 11, city: "El Paso", state: "TX", latitude: 31.759 , longitude: -106.487},		
            {tid: 310, cid: 19, did: 38, region: "Arlington", name: "No Seat", abbrev: "ARTX", pop: 10, city: "Arlington", state: "TX", latitude: 32.736 , longitude: -97.108},		
            {tid: 311, cid: 19, did: 38, region: "Corpus Christi", name: "Body", abbrev: "COCH", pop: 9, city: "Corpus Christi", state: "TX", latitude: 27.801 , longitude: -97.396},		
            {tid: 312, cid: 19, did: 39, region: "Plano", name: "Best", abbrev: "PLAN", pop: 8, city: "Plano", state: "TX", latitude: 33.02 , longitude: -96.699},		
            {tid: 313, cid: 19, did: 39, region: "Laredo", name: "International", abbrev: "LARE", pop: 7, city: "Laredo", state: "TX", latitude: 27.506 , longitude: -99.508},		
            {tid: 314, cid: 19, did: 39, region: "Lubbock", name: "Llano Estacado", abbrev: "LUBB", pop: 6, city: "Lubbock", state: "TX", latitude: 33.565 , longitude: -101.878},		
            {tid: 315, cid: 19, did: 39, region: "Garland", name: "Ducks", abbrev: "GARL", pop: 5, city: "Garland", state: "TX", latitude: 32.907 , longitude: -96.635},		
            {tid: 316, cid: 19, did: 39, region: "Irving", name: "Master Planned", abbrev: "IRV", pop: 4, city: "Irving", state: "TX", latitude: 32.847 , longitude: -96.966},		
            {tid: 317, cid: 19, did: 39, region: "Amarillo", name: "Helios", abbrev: "AMAR", pop: 3, city: "Amarillo", state: "TX", latitude: 35.199 , longitude: -101.845},		
            {tid: 318, cid: 19, did: 39, region: "Grand Prairie", name: "Highways", abbrev: "GRPR", pop: 2, city: "Grand Prairie", state: "TX", latitude:  32.715 , longitude: -32.715},		
            {tid: 319, cid: 19, did: 39, region: "Brownsville", name: "Tip", abbrev: "BROW", pop: 1, city: "Brownsville", state: "TX", latitude: 25.930 , longitude: -97.484}		
			// last team has no comma at end
			//http://citylatitudelongitude.com/CA/Riverside.htm			
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
                _gaq.push(["_trackEvent", "College Basketball - Seasons", "New league", g.lid.toString()]);
            } else if (type === "season") {
                _gaq.push(["_trackEvent", "College Basketball - Seasons", "Completed season", g.season.toString()]);
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
