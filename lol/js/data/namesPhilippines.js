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
		["Caleb"]	,
		["Andrei"]	,
		["Edward"]	,
		["Nate"]	,
		["Xander"]	,
		["Johann"]	,
		["Gabriel"]	,
		["Marcus"]	,
		["Nico"]	,
		["Ethan"]	,
		["Francis"]	,
		["Bon"]	,
		["Justin"]	,
		["Joshua"]	,
		["Kyle"]	,
		["JR"]	,
		["Daniel"]	,
		["Wakee"]	,
		["Kenshin"]	,
		["Jose"]	,
		["Carlos"]	,
		["Carlo"]	,
		["Ronald"]	,
		["Paulo"]	,
		["Joseph"]	,
		["Ryan"]	,
		["Gabriel"]	,
		["Pio"]	

    ];

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
			["Rivera"]	,
			["Aquino"]	,
			["Navarro"]	,
			["Salazar"]	,
			["Mercado"]	,
			["Castillo"]	,
			["Flores"]	,
			["Villanueva"]	,
			["Ramos"]	,
			["Castro"]	,
			["Santos"]	,
			["Reyes"]	,
			["Ocampo"]	,
			["García"]	,
			["Torres"]	,
			["Tomás"]	,
			["Andrada"]	,
			["De Ungria"]	,
			["Dela Cruz"]	,
			["Cruz"]	,
			["Estangco"]	,
			["Esperanza"]	,
			["Estacio"]	,
			["Fajardo"]	,
			["Gaco"]	,
			["Mendoza"]	,
			["Ruiz"]	,
			["Caponpon"]	,
			["Bautista"]

    ];

    return {
        first: first,
        last: last
    };
});