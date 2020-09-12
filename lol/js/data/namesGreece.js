define([], function () { "use strict";

		var female, first, last;

		first = [
			["George",	11.1	]	,
			["John",	19.65	]	,
			["Constantive",	27.62	]	,
			["Dimitris",	35.27	]	,
			["Nicholas",	42.2	]	,
			["Panagiotis",	46.91	]	,
			["Basil",	50.51	]	,
			["Chris",	54.07	]	,
			["Athanasios",	56.49	]	,
			["Michael",	58.76	]	,
			["Evangelos",	60.74	]	,
			["Spiros",	62.71	]	,
			["Anthony",	64.58	]	,
			["Anastasios",	66.22	]	,
			["Theodore",	67.79	]	,
			["Andrew",	69.33	]	,
			["Charalampos",	70.87	]	,
			["Alexander",	72.32	]	,
			["Emmanuel",	73.69	]	,
			["Elias",	75.03	]	

		];

		female = [

		// NOT GREEK, DON'T USE, set odds to 0%
			["Sophie", 7087],
			["Chloe", 6824],
			["Jessica", 6711],
			["Emily", 6415],
			["Lauren", 6299],
			["Hannah", 5916],
			["Charlotte", 5866],
			["Rebecca", 5828],
			["Amy", 5206],
			["Megan", 4948],
			["Shannon", 4649],
			["Katie", 4337],
			["Bethany", 4271],
			["Emma", 4232],
			["Lucy", 3753],
			["Georgia", 3723],
			["Laura", 3582],
			["Sarah", 3111],
			["Jade", 2750],
			["Danielle", 2641],
			["Abigail", 2595],
			["Eleanor", 2555]

		];

		last = [
			["Papadopoulos"]	,
			["Vlahos"]	,
			["Angelopoulos"]	,
			["Nikolaidis"]	,
			["Georgiou"]	,
			["Petridis"]	,
			["Athanasiadis"]	,
			["Dimitriadis"]	,
			["Papadakis"]	,
			["Panagiotopoulos"]	,
			["Papantoniou"]	,
			["Antoniou"]	

		];

	return {
		first: first,
		female: female,
		last: last
	};
});