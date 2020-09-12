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
		
			
			["Louis"],
			["Lucas"],
			["Arthur"],
			["Adam"],
			["Noah"],
			["Liam"],
			["Mohamed"],
			["Nathan"],
			["Jules"],
			["Mathis"],
			["Victor"],
			["Gabriel"],
			["Hugo"],
			["Vince"],
			["Finn"],
			["Ethan"],
			["Eden"],
			["Thomas"],
			["Theo"],
			["Matteo"],
			["Maxime"],
			["Rayan"],
			["Oscar"],
			["Alexander"],
			["Seppe"],
			["Stan"],
			["Lars"],
			["Luca"],
			["Milan"],
			["Simon"]

    ];
	
	female = [
	
		["Emma"],
		["Louise"],
		["Elise"],
		["Olivia"],
		["Lina"],
		["Marie"],
		["Lucie"],
		["Ella"],
		["Alice"],
		["Juliette"],
		["Mila"],
		["Chloe"],
		["Elena"],
		["Anna"],
		["Camille"],
		["Lea"],
		["Nina"],
		["Lena"],
		["Charlotte"],
		["Julie"],
		["Noor"],
		["Zoe"],
		["Sofia"],
		["Jade"],
		["Nora"],
		["Sarah"],
		["Laura"],
		["Eva"],
		["Julia"],
		["Manon"]	
	
    ];

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
	
		["Peeters"],
		["Janssens"],
		["Maes"],
		["Jacobs"],
		["Mertens"],
		["Willems"],
		["Claes"],
		["Goossens"],
		["Wouters"],
		["De Smet"],
		["Vermeulen"],
		["Pauwels"],
		["Dubois"],
		["Hermans"],
		["Aerts"],
		["Michiels"],
		["Lambert"],
		["Martens"],
		["De Vos"],
		["Smets"],
		["Dupont"],
		["Claeys"],
		["De Clercq"],
		["Desmet"],
		["Hendrickx"],
		["Van Damme"],
		["Stevens"],
		["De Backer"],
		["Janssen"],
		["Devos"]

	
      ];

    return {
        first: first,
        female: female,
        last: last
    };
});