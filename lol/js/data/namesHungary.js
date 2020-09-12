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
		
			
			["Bence"],
			["Máté"],
			["Levente"],
			["Ádám"],
			["Dávid"],
			["Dániel"],
			["Marcell"],
			["Balázs"],
			["Milán"],
			["Dominik"],
			["Áron"],
			["Zalán"],
			["Noel"],
			["Kristóf"],
			["Péter"],
			["Botond"],
			["Gergő"],
			["Tamás"],
			["László"],
			["Bálint"],
			["Zsombor"],
			["Olivér"],
			["Zoltán"],
			["Márk"],
			["Ákos"],
			["Attila"],
			["Krisztián"],
			["András"],
			["Gábor"],
			["István"]

    ];
	
	female = [

			["Hanna"],
			["Anna"],
			["Jázmin"],
			["Lili"],
			["Zsófia"],
			["Emma"],
			["Luca"],
			["Boglárka"],
			["Zoé"],
			["Nóra"],
			["Csenge"],
			["Dorina"],
			["Dóra"],
			["Viktória"],
			["Fanni"],
			["Lilla"],
			["Réka"],
			["Laura"],
			["Léna"],
			["Eszter"],
			["Petra"],
			["Gréta"],
			["Noémi"],
			["Vivien"],
			["Izabella"],
			["Sára"],
			["Flóra"],
			["Dorka"],
			["Bianka"],
			["Rebeka"]	
	
    ];
	
    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
	
			["Nagy"],
			["Kovács"],
			["Tóth"],
			["Szabó"],
			["Horváth"],
			["Kiss"],
			["Varga"],
			["Molnár"],
			["Németh"],
			["Farkas"],
			["Papp"],
			["Balogh"],
			["Takács"],
			["Juhász"],
			["Mészáros"],
			["Fekete"],
			["Szűcs"],
			["Gál"],
			["Vörös"],
			["Szalai"],
			["Szilágyi"],
			["Török"],
			["Hegedűs"],
			["Rózsa"],
			["Rácz"],
			["Fehér"],
			["Pintér"],
			["Kocsis"],
			["Hosszu"],
			["Fodor"]

	
      ];

    return {
        first: first,
		female: female,
        last: last
    };
});