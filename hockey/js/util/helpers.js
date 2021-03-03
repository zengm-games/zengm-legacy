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
        var  tid;

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
    function getTeamsOld() {
        var teams;

		//http://fivethirtyeight.blogs.nytimes.com/2013/05/31/why-cant-canada-win-the-stanley-cup/?_r=0
		//http://mattenglish.kinja.com/fivethirtyeight-hilariously-thinks-sudbury-ontario-des-1631081577
		
		//https://en.wikipedia.org/wiki/List_of_census_metropolitan_areas_and_agglomerations_in_Canada
		// locations based on Hockey Interest
        teams = [
            {tid: 0, cid: 0, did: 0, region: "Atlanta", name: "Gold Club", abbrev: "ATL", pop: 4.3}, //.233 really low
            {tid: 1, cid: 0, did: 1, region: "Baltimore", name: "Crabs", abbrev: "BAL", pop: 2.2},   //
            {tid: 2, cid: 0, did: 0, region: "Boston", name: "Massacre", abbrev: "BOS", pop: 4.4},   // 1.1
            {tid: 3, cid: 0, did: 1, region: "Chicago", name: "Whirlwinds", abbrev: "CHI", pop: 8.8}, // 1.0
            {tid: 4, cid: 0, did: 1, region: "Cincinnati", name: "Riots", abbrev: "CIN", pop: 1.6},   // 
            {tid: 5, cid: 0, did: 1, region: "Cleveland", name: "Curses", abbrev: "CLE", pop: 1.9},   //.226
            {tid: 6, cid: 1, did: 2, region: "Dallas", name: "Snipers", abbrev: "DAL", pop: 4.7},   // .32
            {tid: 7, cid: 1, did: 3, region: "Denver", name: "High", abbrev: "DEN", pop: 2.2},       // .333
            {tid: 8, cid: 0, did: 1, region: "Detroit", name: "Muscle", abbrev: "DET", pop: 4.0},    //.744
            {tid: 9, cid: 1, did: 2, region: "Houston", name: "Apollos", abbrev: "HOU", pop: 4.3},  //.141
            {tid: 10, cid: 1, did: 2, region: "Las Vegas", name: "Blue Chips", abbrev: "LV", pop: 1.7},  // .09
            {tid: 11, cid: 1, did: 3, region: "Los Angeles", name: "Earthquakes", abbrev: "LA", pop: 12.3}, // 1.1
            {tid: 12, cid: 0, did: 1, region: "Mexico City", name: "Aztecs", abbrev: "MXC", pop: 19.4}, //
            {tid: 13, cid: 0, did: 0, region: "Miami", name: "Cyclones", abbrev: "MIA", pop: 5.4}, // .172
            {tid: 14, cid: 1, did: 3, region: "Minneapolis", name: "Blizzards", abbrev: "MIN", pop: 2.6}, //.622
            {tid: 15, cid: 0, did: 0, region: "Montreal", name: "Mounties", abbrev: "MON", pop: 4.0},  // 2.3
            {tid: 16, cid: 0, did: 0, region: "New York", name: "Bankers", abbrev: "NYC", pop: 18.7},  // 2.5
            {tid: 17, cid: 0, did: 0, region: "Philadelphia", name: "Cheesesteaks", abbrev: "PHI", pop: 5.4}, // 1.1
            {tid: 18, cid: 1, did: 2, region: "Phoenix", name: "Vultures", abbrev: "PHO", pop: 3.4},   //.263
            {tid: 19, cid: 0, did: 1, region: "Pittsburgh", name: "Rivers", abbrev: "PIT", pop: 1.8},  //.846
            {tid: 20, cid: 1, did: 3, region: "Portland", name: "Roses", abbrev: "POR", pop: 1.8},  // 
            {tid: 21, cid: 1, did: 2, region: "Sacramento", name: "Gold Rush", abbrev: "SAC", pop: 1.6}, // 
            {tid: 22, cid: 1, did: 3, region: "San Diego", name: "Pandas", abbrev: "SD", pop: 2.9}, //
            {tid: 23, cid: 1, did: 2, region: "San Francisco", name: "Venture Capitalists", abbrev: "SF", pop: 3.4}, // .353
            {tid: 24, cid: 1, did: 3, region: "Seattle", name: "Symphony", abbrev: "SEA", pop: 3.0}, //.241
            {tid: 25, cid: 1, did: 2, region: "St. Louis", name: "Spirits", abbrev: "STL", pop: 2.2}, //.319
            {tid: 26, cid: 0, did: 1, region: "Tampa", name: "Turtles", abbrev: "TPA", pop: 2.2}, //.279
            {tid: 27, cid: 0, did: 0, region: "Toronto", name: "Beavers", abbrev: "TOR", pop: 6.3},  // in 5million 5.1
            {tid: 28, cid: 1, did: 3, region: "Vancouver", name: "Whalers", abbrev: "VAN", pop: 2.3},  // 2.3
            {tid: 29, cid: 0, did: 0, region: "Washington", name: "Monuments", abbrev: "WAS", pop: 4.2}  // .5

			// new
          //  {tid: 29, cid: 0, did: 0, region: "Edmonton", name: "Monuments", abbrev: "WAS", pop: 4.2} // 1.1			  
			
			
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
    function getTeamsDefault() {
        var teams;

		//http://fivethirtyeight.blogs.nytimes.com/2013/05/31/why-cant-canada-win-the-stanley-cup/?_r=0
		
		//https://mowatcentre.ca/wp-content/uploads/publications/19_the_new_economics_of_the_nhl.pdf
		// locations based on Hockey Interest
        teams = [
			{tid: 0, cid: 0, did: 1, region: "Atlanta", name: "Gold Club", abbrev: "ATL", pop: .2}, //.233 really low
            {tid: 1, cid: 0, did: 1, region: "Boston", name: "Massacre", abbrev: "BOS", pop: 1.1},   
            {tid: 2, cid: 0, did: 0, region: "Buffalo", name: "Erie", abbrev: "BUF", pop: .5},
            {tid: 3, cid: 1, did: 3, region: "Calgary", name: "Horned Owls", abbrev: "CAL", pop: 1.0},   
            {tid: 4, cid: 1, did: 2, region: "Chicago", name: "Whirlwinds", abbrev: "CHI", pop: 1.0}, 
            {tid: 5, cid: 1, did: 2, region: "Dallas", name: "Snipers", abbrev: "DAL", pop: .3},  
            {tid: 6, cid: 1, did: 2, region: "Denver", name: "High", abbrev: "DEN", pop: .3}, //
            {tid: 7, cid: 0, did: 0, region: "Detroit", name: "Muscle", abbrev: "DET", pop: .7},  
            {tid: 8, cid: 1, did: 3, region: "Edmonton", name: "Gateway", abbrev: "EDM", pop: 1.1}, 
            {tid: 9, cid: 0, did: 0, region: "Halifax", name: "Highlanders", abbrev: "HAL", pop: .3}, //
            {tid: 10, cid: 0, did: 0, region: "Hamilton", name: "Tigers", abbrev: "HAM", pop: .4},       
            {tid: 11, cid: 1, did: 3, region: "Los Angeles", name: "Earthquakes", abbrev: "LA", pop: 1.1}, // 1.1
            {tid: 12, cid: 0, did: 1, region: "Miami", name: "Cyclones", abbrev: "MIA", pop: .2}, // .172
            {tid: 13, cid: 1, did: 2, region: "Minneapolis", name: "Blizzards", abbrev: "MIN", pop: .6}, //.622
            {tid: 14, cid: 0, did: 0, region: "Montreal", name: "Mounties", abbrev: "MON", pop: 2.2},  // 2.3
            {tid: 15, cid: 0, did: 1, region: "New York", name: "Bankers", abbrev: "NYC", pop: 2.5},  // 2.5
            {tid: 16, cid: 0, did: 0, region: "Ottawa", name: "Traders", abbrev: "OTT", pop: .8},  // .09			
            {tid: 17, cid: 0, did: 1, region: "Philadelphia", name: "Cheesesteaks", abbrev: "PHI", pop: 1.1}, // 1.1
            {tid: 18, cid: 1, did: 3, region: "Phoenix", name: "Vultures", abbrev: "PHO", pop: .3},   //.263
            {tid: 19, cid: 0, did: 1, region: "Pittsburgh", name: "Rivers", abbrev: "PIT", pop: .8},  //.846
            {tid: 20, cid: 0, did: 0, region: "Quebec", name: "Nordics", abbrev: "QUE", pop: .5},  
            {tid: 21, cid: 1, did: 2, region: "Saskatoon", name: "Sasquatches", abbrev: "SAS", pop: .2}, // .172			
            {tid: 22, cid: 1, did: 3, region: "San Francisco", name: "Venture Capitalists", abbrev: "SF", pop: .4}, // .353
            {tid: 23, cid: 1, did: 3, region: "Seattle", name: "Symphony", abbrev: "SEA", pop: .2}, //.241
            {tid: 24, cid: 1, did: 2, region: "St. Louis", name: "Spirits", abbrev: "STL", pop: .3}, //.319
            {tid: 25, cid: 0, did: 1, region: "Tampa", name: "Turtles", abbrev: "TPA", pop: .3}, //.279
            {tid: 26, cid: 0, did: 0, region: "Toronto", name: "Beavers", abbrev: "TOR", pop: 5.1},  // in 5million 5.1
            {tid: 27, cid: 1, did: 3, region: "Vancouver", name: "Whalers", abbrev: "VAN", pop: 2.3},  // 2.3
            {tid: 28, cid: 0, did: 1, region: "Washington", name: "Monuments", abbrev: "WAS", pop: .5},  // .5
            {tid: 29, cid: 1, did: 2, region: "Winnipeg", name: "Red", abbrev: "WIN", pop: .6}

			// new
          //  {tid: 29, cid: 0, did: 0, region: "Edmonton", name: "Monuments", abbrev: "WAS", pop: 4.2} // 1.1			  
			
			
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
    function getTeamsRussia() {
        var teams;

		//https://en.wikipedia.org/wiki/Kontinental_Hockey_League#Season_structure
		// use rink size for team strength?
		//http://www.hockeydb.com/nhl-attendance/att_graph_season.php?lid=KHL2009&sid=2016
		// attendence?
        teams = [
            {tid: 0, cid: 0, did: 1, region: "Astana", name: "Barys", abbrev: "AST", pop: .3},  // in 5million 5.1
            {tid: 1, cid: 1, did: 2, region: "Bratislava", name: "Slovan", abbrev: "BRA", pop: .2},  
            {tid: 2, cid: 0, did: 0, region: "Chelyabinsk", name: "Traktor", abbrev: "CHL", pop: .6}, // 1) ADJUST POP, 2) ADJUST KHL REVENUE PROFIT/LOSS			
            {tid: 3, cid: 1, did: 3, region: "Cherepovets", name: "Severstal", abbrev: "CHE", pop: .16}, // 1.1
            {tid: 4, cid: 1, did: 2, region: "Helsinki", name: "Jokerit", abbrev: "HEL", pop: .3},
            {tid: 5, cid: 0, did: 0, region: "Kazan", name: "Ak Bars", abbrev: "KAZ", pop: .6},  // .09			
            {tid: 6, cid: 0, did: 1, region: "Khabarovsk", name: "Amur", abbrev: "KHA", pop: .3}, //.319
            {tid: 7, cid: 0, did: 0, region: "Khanty-Mansiysk", name: "Yugra", abbrev: "MAN", pop: .04}, // .353
            {tid: 8, cid: 0, did: 0, region: "Kunlun", name: "Red Star", abbrev: "KUN", pop: .02},  
            {tid: 9, cid: 0, did: 0, region: "Magnitogorsk", name: "Metallurg", abbrev: "MAG", pop: .2},  //.846
            {tid: 10, cid: 1, did: 2, region: "Malmö", name: "Redhawks", abbrev: "TOK", pop: .16},  // 2.5
			{tid: 11, cid: 1, did: 2, region: "Minsk", name: "Dinamo", abbrev: "MIN", pop: 1.0}, //.233 really low
            {tid: 12, cid: 1, did: 3, region: "Moscow-CSKA", name: "CSKA", abbrev: "MCS", pop: 6}, 
            {tid: 13, cid: 1, did: 3, region: "Moscow-Dynamo", name: "Dynamo", abbrev: "MDY", pop: 6}, //
            {tid: 14, cid: 1, did: 3, region: "Moscow Oblast", name: "Vityaz", abbrev: "MON", pop: 6},  // 2.3
            {tid: 15, cid: 1, did: 2, region: "Moscow-Spartak", name: "Spartak", abbrev: "MSP", pop: 6}, //
            {tid: 16, cid: 0, did: 0, region: "Nizhnekamsk", name: "Neftekhimik", abbrev: "NZH", pop: .12},  
            {tid: 17, cid: 1, did: 3, region: "Nizhny Novgorod", name: "Torpedo", abbrev: "NIZ", pop: .6}, //.622
            {tid: 18, cid: 0, did: 1, region: "Novokuznetsk", name: "Metallurg", abbrev: "NOV", pop: .275},  // 2.3
            {tid: 19, cid: 0, did: 1, region: "Novosibirsk", name: "Sibir", abbrev: "NOS", pop: .75},
            {tid: 20, cid: 0, did: 1, region: "Omsk", name: "Avangard", abbrev: "OMS", pop: .6}, //.279
            {tid: 21, cid: 1, did: 2, region: "Riga", name: "Dinamo", abbrev: "RIG", pop: .32},   
            {tid: 22, cid: 1, did: 2, region: "Saint Petersburg", name: "SKA", abbrev: "STP", pop: 2.6}, 
            {tid: 23, cid: 1, did: 3, region: "Sochi", name: "Sochi", abbrev: "SOC", pop: .18}, // .172
            {tid: 24, cid: 0, did: 0, region: "Togliatti", name: "Lada", abbrev: "TOG", pop: .36},   //.263
            {tid: 25, cid: 0, did: 1, region: "Ufa", name: "Salavat Yulaev", abbrev: "UFA", pop: .54},  // .5
            {tid: 26, cid: 0, did: 1, region: "Vladivostok", name: "Admiral", abbrev: "VLA", pop: .3}, //.241
            {tid: 27, cid: 1, did: 3, region: "Yaroslavl", name: "Lokomotiv", abbrev: "YAR", pop: .3},       
            {tid: 28, cid: 0, did: 0, region: "Yekaterinburg", name: "Avtomobilist", abbrev: "YEK", pop: 0.7}, // 1.1
            {tid: 29, cid: 1, did: 2, region: "Zagreb", name: "Medveščak", abbrev: "ZAG", pop: 0.4}


			// new
          //  {tid: 29, cid: 0, did: 0, region: "Edmonton", name: "Monuments", abbrev: "WAS", pop: 4.2} // 1.1			  
			
			
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
    function getGameType() {
        var gameType;

		//http://fivethirtyeight.blogs.nytimes.com/2013/05/31/why-cant-canada-win-the-stanley-cup/?_r=0
		
		//https://mowatcentre.ca/wp-content/uploads/publications/19_the_new_economics_of_the_nhl.pdf
		// locations based on Hockey Interest
        gameType = [
            {typeid: 0, name: "2 Round Draft, No Minor League Players"},
            {typeid: 1, name: "3 Round Draft, 5 Player Minors"},
            {typeid: 2, name: "4 Round Draft, 10 Player Minors"},
            {typeid: 3, name: "5 Round Draft, 15 Player Minors"},
            {typeid: 4, name: "6 Round Draft, 20 Player Minors"},
           {typeid: 5, name: "7 Round Draft, 23 Player Minors"}

			// new
          //  {tid: 29, cid: 0, did: 0, region: "Edmonton", name: "Monuments", abbrev: "WAS", pop: 4.2} // 1.1			  
			
			
        ];

       // teams = addPopRank(teams);

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
    function getLeagueType() {
        var leagueType;

		//http://fivethirtyeight.blogs.nytimes.com/2013/05/31/why-cant-canada-win-the-stanley-cup/?_r=0
		
		//https://mowatcentre.ca/wp-content/uploads/publications/19_the_new_economics_of_the_nhl.pdf
		// locations based on Hockey Interest
        leagueType = [
            {leagueid: 0, name: "US/Canada"},
            {leagueid: 1, name: "Europe/Russia"}


			// new
          //  {tid: 29, cid: 0, did: 0, region: "Edmonton", name: "Monuments", abbrev: "WAS", pop: 4.2} // 1.1			  
			
			
        ];

       // teams = addPopRank(teams);

        return leagueType;
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
        var contentEl, data, ui, viewHelpers;

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
				if (g.leagueType == 0) {
					if ( g.gameType == 0) {
						_gaq.push(["_trackEvent", "Hockey-NHL 2RD", "New league", g.lid.toString()]);
					} else if ( g.gameType == 1) {
						_gaq.push(["_trackEvent", "Hockey-NHL 3RD", "New league", g.lid.toString()]);
					} else if ( g.gameType == 2) {
						_gaq.push(["_trackEvent", "Hockey-NHL 4RD", "New league", g.lid.toString()]);
					} else if ( g.gameType == 3) {
						_gaq.push(["_trackEvent", "Hockey-NHL 5RD", "New league", g.lid.toString()]);
					} else if ( g.gameType == 4) {
						_gaq.push(["_trackEvent", "Hockey-NHL 6RD", "New league", g.lid.toString()]);
					} else {
						_gaq.push(["_trackEvent", "Hockey-NHL 7RD", "New league", g.lid.toString()]);
					}
				} else {
					_gaq.push(["_trackEvent", "Hockey-KHL", "New league", g.lid.toString()]);
				}
            } else if (type === "season" && g.autoPlaySeasons === 0) {
				if (g.leagueType == 0) {
					if ( g.gameType == 0) {
						_gaq.push(["_trackEvent", "Hockey-NHL 2RD", "Completed season", g.season.toString()]);
					} else if ( g.gameType == 1) {
						_gaq.push(["_trackEvent", "Hockey-NHL 3RD", "Completed season", g.season.toString()]);
					} else if ( g.gameType == 2) {
						_gaq.push(["_trackEvent", "Hockey-NHL 4RD", "Completed season", g.season.toString()]);
					} else if ( g.gameType == 3) {
						_gaq.push(["_trackEvent", "Hockey-NHL 5RD", "Completed season", g.season.toString()]);
					} else if ( g.gameType == 4) {
						_gaq.push(["_trackEvent", "Hockey-NHL 6RD", "Completed season", g.season.toString()]);
					} else {
						_gaq.push(["_trackEvent", "Hockey-NHL 7RD", "Completed season", g.season.toString()]);
					}				
				} else {
					_gaq.push(["_trackEvent", "Hockey-KHL", "Completed season", g.season.toString()]);
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
            Ss: "Slapshot",
            A: "Athlete",
//            B: "Ball Handler",
            Sh: "Stickhandler",
            Di: "Interior Defender",
            Dp: "Perimeter Defender",
            Ws: "Wristshot",
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
        } else {
            return '<span class="glyphicon glyphicon-flag watch" title="Add to Watch List" data-pid="' + pid + '"></span>';
        }
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

		if (pick.round == 1) {
			desc = pick.season + " first round pick";
		} else if (pick.round == 2) {								
			desc = pick.season + " second round pick";		
		} else if (pick.round == 3) {								
			desc = pick.season + " third round pick";		
		} else if (pick.round == 4) {								
			desc = pick.season + " fourth round pick";		
		} else if (pick.round  == 5) {								
			desc = pick.season + " fifth round pick";		
		} else if (pick.round  == 6) {								
			desc = pick.season + " sixth round pick";		
		} else  {								
			desc = pick.season + " seventh round pick";	
		}		
     //   desc = pick.season + " " + (pick.round === 1 ? "first" : "second") + " round pick";
     //   desc = pick.season + " " + (pick.round === 1 ? "first" : "second") + " round pick";
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
        game.tid = game.tid !== undefined ? game.tid :  g.userTid;

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
        return (team0.points - team.points) ;
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
		getTeamsRussia: getTeamsRussia,
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
		getLeagueType: getLeagueType,
		getGameType: getGameType,
        checkNaNs: checkNaNs,
        updateMultiTeam: updateMultiTeam		
    };
});
