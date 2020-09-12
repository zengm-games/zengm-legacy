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
		
			
			["Lucas"],
			["William"],
			["Oscar"],
			["Oliver"],
			["Liam"],
			["Elias"],
			["Hugo"],
			["Vincent"],
			["Charlie"],
			["Alexander"],
			["Axel"],
			["Ludvig"],
			["Elliot"],
			["Noah"],
			["Leo"],
			["Viktor"],
			["Filip"],
			["Arvid"],
			["Alfred"],
			["Nils"],
			["Isak"],
			["Emil"],
			["Theo"],
			["Theodor"],
			["Edvin"],
			["Melvin"],
			["Gustav"],
			["Sixten"],
			["Adam"],
			["Anton"]

    ];
	
	female = [

			["Elsa"],
			["Alice"],
			["Maja"],
			["Agnes"],
			["Lilly"],
			["Olivia"],
			["Julia"],
			["Ebba"],
			["Linnea"],
			["Molly"],
			["Ella"],
			["Wilma"],
			["Klara"],
			["Stella"],
			["Freja"],
			["Alicia"],
			["Alva"],
			["Alma"],
			["Isabelle"],
			["Ellen"],
			["Saga"],
			["Ellie"],
			["Astrid"],
			["Emma"],
			["Nellie"],
			["Emilia"],
			["Vera"],
			["Signe"],
			["Elvira"],
			["Nova"]	
	
    ];
	
    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
	
			["Johansson"],
			["Andersson"],
			["Karlsson"],
			["Nilsson"],
			["Eriksson"],
			["Larsson"],
			["Olsson"],
			["Persson"],
			["Svensson"],
			["Gustafsson"],
			["Pettersson"],
			["Jonsson"],
			["Jansson"],
			["Hansson"],
			["Bengtsson"],
			["Jönsson"],
			["Petersson"],
			["Carlsson"],
			["Magnusson"],
			["Lindberg"],
			["Gustavsson"],
			["Olofsson"],
			["Lindström"],
			["Lindgren"],
			["Axelsson"],
			["Jakobsson"],
			["Lundberg"],
			["Bergström"],
			["Lundgren"],
			["Berg"]
	

	
      ];

    return {
        first: first,
		female: female,
        last: last
    };
});