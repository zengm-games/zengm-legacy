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
		
			
		["Ben"],
		["Luis"],
		["Paul"],
		["Lukas"],
		["Jonah"],
		["Leon"],
		["Finn"],
		["Noah"],
		["Elias"],
		["Luca"],
		["Maximilian"],
		["Felix"],
		["Max"],
		["Henry"],
		["Moritz"],
		["Julian"],
		["Tim"],
		["Jacob"],
		["Emil"],
		["Philipp"],
		["Niklas"],
		["Alexander"],
		["David"],
		["Oskar"],
		["Mats"],
		["January"],
		["Tom"],
		["Anton"],
		["Liam"],
		["Erik"]

    ];
	
	female = [

		["Emma"],
		["Mia"],
		["Hannah"],
		["Sofia"],
		["Emilia"],
		["Ann"],
		["Lena"],
		["Lea"],
		["Emily"],
		["Marie"],
		["Lina"],
		["Léonie"],
		["Amelie"],
		["Sophie"],
		["Luisa"],
		["Johanna"],
		["Nele"],
		["Laura"],
		["Lilly"],
		["Lara"],
		["Clara"],
		["Mila"],
		["Leni"],
		["Maja"],
		["Charlotte"],
		["Sarah"],
		["Frieda"],
		["Ida"],
		["Greta"],
		["Pia"]	
		
    ];
	
    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
	
			["Müller"],
			["Schmidt"],
			["Meyer"],
			["Schneider"],
			["Fischer"],
			["Weber"],
			["Becker"],
			["Wagner"],
			["Schaefer"],
			["Schulz"],
			["Hoffmann"],
			["Bauer"],
			["Koch"],
			["Klein"],
			["Schröder"],
			["Schwarz"],
			["Wolf"],
			["Neumann"],
			["Braun"],
			["Zimmermann"],
			["Weiss"],
			["Richter"],
			["Lange"],
			["Krauss"],
			["Krüger"],
			["Werner"],
			["Peters"],
			["Fuchs"]
	

	
      ];

    return {
        first: first,
		female: female,
        last: last
    };
});