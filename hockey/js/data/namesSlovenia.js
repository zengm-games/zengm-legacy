/**
 * @name data.names
 * @namespace First names and last names.
 */
define([], function () {
    "use strict";

    var  first, last;

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    first = [
		
			
		["Luka"],
		["Nik"],
		["Filip"],
		["Jakob"],
		["Mark"],
		["Žan"],
		["Anže"],
		["Jan"],
		["Jaka"],
		["Vid"]



    ];
	

	
    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
	
	["Novak"],
	["Horvat"],
	["Kovacic"],
	["Krajnc"],
	["Zupancic"],
	["Potocnik"],
	["Kovac"],
	["Mlakar"],
	["Kos"],
	["Vidmar"],
	["Golob"],
	["Turk"],
	["Božic"],
	["Kralj"],
	["Korošec"],
	["Zupan"],
	["Bizjak"],
	["Hribar"],
	["Kotnik"],
	["Kavcic"],
	["Rozman"],
	["Kastelic"],
	["Oblak"],
	["Žagar"],
	["Petek"],
	["Hocevar"],
	["Kolar"],
	["Košir"],
	["Koren"],
	["Klemencic"]



	
      ];

    return {
        first: first,
        last: last
    };
});