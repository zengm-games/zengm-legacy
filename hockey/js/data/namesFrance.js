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
		
			
		["Nathan"],
		["Lucas"],
		["Enzo"],
		["Léo"],
		["Louis"],
		["Hugo"],
		["Gabriel"],
		["Ethan"],
		["Mathis"],
		["Jules"],
		["Raphael"],
		["Arthur"],
		["Tom"],
		["Théo"],
		["Noah"],
		["Timeo"],
		["Matheo"],
		["Clément"],
		["Maxime"],
		["Yanis"],
		["Mael"],
		["Adam"],
		["Thomas"],
		["Evan"],
		["Paul"],
		["Nolan"],
		["Axel"],
		["Antoine"],
		["Alexandre"],
		["Noé"]

    ];
	
	female = [

		["Emma"],
		["Léa"],
		["Chloé"],
		["Manon"],
		["Inés"],
		["Lola"],
		["Jade"],
		["Camille"],
		["Sarah"],
		["Louise"],
		["Zoé"],
		["Lilou"],
		["Lena"],
		["Maelys"],
		["Clara"],
		["Eva"],
		["Lina"],
		["Anais"],
		["Louna"],
		["Romane"],
		["Juliette"],
		["Lucie"],
		["Ambre"],
		["Alice"],
		["LouiseLisa"],
		["Clémence"],
		["Jeanne"],
		["Louane"],
		["Mathilde"]
		
    ];
	
    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
	
		["Martin"],
		["Bernard"],
		["Dubois"],
		["Thomas"],
		["Robert"],
		["Richard"],
		["Petit"],
		["Durand"],
		["Leroy"],
		["Moreau"],
		["Simon"],
		["Laurent"],
		["Lefebvre"],
		["Michel"],
		["David"],
		["Bertrand"],
		["Roux"],
		["Vincent"],
		["Fournier"],
		["Morel"],
		["Girard"],
		["Andre"],
		["Lefevre"],
		["Mercier"],
		["Dupont"],
		["Lambert"],
		["Bonnet"],
		["Francois"],
		["Martinez"]
		

      ];

    return {
        first: first,
		female: female,
        last: last
    };
});