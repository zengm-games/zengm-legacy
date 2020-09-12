/**
 * @name data.names
 * @namespace First names and last names.
 */
define([], function () {
    "use strict";

    var female, first, last;

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    first = [
		
			
			["Emil"],
			["Mathias"],
			["Magnus"],
			["Jonas"],
			["William"],
			["Oliver"],
			["Noah"],
			["Adrian"],
			["Tobias"],
			["Elias"],
			["Daniel"],
			["Henrik"],
			["Sebastian"],
			["Lucas"],
			["Martin"],
			["Andreas"],
			["Benjamin"],
			["Leon"],
			["Sander"],
			["Alexander"],
			["Liam"],
			["Isak"],
			["Jakob"],
			["Kristian"],
			["Aksel"],
			["Julian"],
			["Fredrik"],
			["Sondre"],
			["Johannes"],
			["Erik"]		

    ];
	
	female = [

		["Emma"],
		["Nora"],
		["Sofie"],
		["Thea"],
		["Ingrid"],
		["Emilie"],
		["Julie"],
		["Mia"],
		["Anna"],
		["Ida"],
		["Linnea"],
		["Amalie"],
		["Sara"],
		["Maria"],
		["Ella"],
		["Maja"],
		["Leah"],
		["Tuva"],
		["Frida"],
		["Sofia"],
		["Vilde"],
		["Mathilde"],
		["Marie"],
		["Olivia"],
		["Jenny"],
		["Hanna"],
		["Aurora"],
		["Malin"],
		["Elise"],
		["Victoria"]
	
    ];
	
    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
	
			["Hansen"],
			["Johansen"],
			["Olsen"],
			["Larsen"],
			["Andersen"],
			["Nilsen"],
			["Pedersen"],
			["Kristiansen"],
			["Jensen"],
			["Karlsen"],
			["Johnsen"],
			["Pettersen"],
			["Eriksen"],
			["Berg"],
			["Haugen"],
			["Hagen"],
			["Johannessen"],
			["Andreassen"],
			["Jacobsen"],
			["Halvorsen"],
			["Jørgensen"],
			["Dahl"],
			["Henriksen"],
			["Lund"],
			["Sørensen"],
			["Gundersen"],
			["Jakobsen"],
			["Moen"],
			["Iversen"],
			["Svendsen"]

	
      ];

    return {
        first: first,
		female: female,
        last: last
    };
});