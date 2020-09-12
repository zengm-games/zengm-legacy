/**
 * @name data.names
 * @namespace First names and last names.
 */
define([], function () {
    "use strict";

    var first, last;

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    first = [

			["Benjamín"],
			["Santiago"],
			["Joaquín"],
			["Bautista"],
			["Santino"],
			["Thiago"],
			["Agustín"],
			["Mateo"],
			["Lucas"],
			["Lautaro"],
			["Vicente"],
			["Martín"],
			["Matías"],
			["Maximiliano"],
			["Agustín"],
			["Cristóbal"],
			["Sebastián"],
			["Tomás"],
			["Alonso"],
			["Sánchez"]


    ];

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
 
 
			["González",5.7],
			["Rodríguez",10.5],
			["Ferreira",14.8],
			["Benítez",18.0],
			["Martínez",20.5],
			["García",23.0],
			["Pérez",24.5],
			["Álvarez",25.8],
			["Sánchez",27.0]


    ];

    return {
        first: first,
        last: last
    };
});