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

			["Samuel"],
			["Santiago"],
			["José"],
			["Nicolás"],
			["Sebastián"],
			["Alejandro"],
			["Tomás"],
			["Miguel"],
			["Esteban"],
			["Diego"],
			["Gabriel"],
			["Alejandro"],
			["David"],
			["Juan"],
			["Andrés"]

	];

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
 

 
			["Sánchez"],
			["Muñoz"],
			["Jurado"],
			["Lara"],
			["Ascázubi"],
			["Rojas"],
			["Flores"],
			["Hernández"],
			["López"],
			["Santos"],
			["Martínez"],
			["Reyes"],
			["Mora"],
			["Jiménez"]


 
			

    ];

    return {
        first: first,
        last: last
    };
});