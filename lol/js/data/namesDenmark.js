/**
 * @name data.names
 * @namespace First names and last names.
 */
define([], function () {
    "use strict";

    var female,first, last;

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    first = [
		
			
			["William"],
			["Noah"],
			["Lucas"],
			["Oscar"],
			["Victor"],
			["Malthe"],
			["Emil"],
			["Frederik"],
			["Olvier"],
			["Magnus"],
			["Carl"],
			["Villads"],
			["Elias"],
			["Alexander"],
			["Anton"],
			["Christian"],
			["Alfred"],
			["Valdemar"],
			["Mikkel"],
			["Liam"],
			["August"],
			["Mathias"],
			["Felix"],
			["Mads"],
			["Benjamin"],
			["Aksel"],
			["Johan"],
			["Sebastian"],
			["Marius"],
			["Søren"]

    ];

    female = [	
			["Emma"],
			["Sofia"],
			["Ida"],
			["Freja"],
			["Clara"],
			["Laura"],
			["Anna"],
			["Ella"],
			["Isabella"],
			["Karla"],
			["Alma"],
			["Josefine"],
			["Olivia"],
			["Alberte"],
			["Maja"],
			["Sofie"],
			["Mathilde"],
			["Agnes"],
			["Laerke"],
			["Caroline"],
			["Liva"],
			["Emily"],
			["Sara"],
			["Victoria"],
			["Emilie"],
			["Mille"],
			["Frida"],
			["Marie"],
			["Ellen"],
			["Rosa"]
	
    ];
	
    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
	
			["Jensen"],
			["Nielsen"],
			["Hansen"],
			["Pedersen"],
			["Andersen"],
			["Christensen"],
			["Larsen"],
			["Sørensen"],
			["Rasmussen"],
			["Jørgensen"],
			["Petersen"],
			["Madsen"],
			["Kristensen"],
			["Olsen"],
			["Thomsen"],
			["Christiansen"],
			["Poulsen"],
			["Johansen"],
			["Møller"],
			["Mortensen"],
			["Knudsen"],
			["Jakobsen"],
			["Mikkelsen"],
			["Frederiksen"],
			["Laursen"],
			["Henriksen"],
			["Lund"],
			["Schmidt"],
			["Holm"],
			["Bjerg"]

	
      ];

    return {
        first: first,
        female: female,		
        last: last
    };
});