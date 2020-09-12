/**
 * @name util.templateHelpers
 * @namespace Knockout helper functions.
 */
define(["globals", "lib/faces", "lib/knockout", "util/helpers"], function (g, faces, ko, helpers) {
    "use strict";

    ko.bindingHandlers.round = {
        update: function (element, valueAccessor) {
            var args = valueAccessor();
            return ko.bindingHandlers.text.update(element, function () {
                return helpers.round(ko.unwrap(args[0]), args[1]);
            });
        }
    };

    ko.bindingHandlers.roundWinp = {
        update: function (element, valueAccessor) {
            var arg, output;

            arg = ko.unwrap(valueAccessor());

            output = parseFloat(arg).toFixed(3);

            if (output[0] === "0") {
                // Delete leading 0
                output = output.slice(1, output.length);
            } else {
                // Delete trailing digit if no leading 0
                output = output.slice(0, output.length - 1);
            }

            return ko.bindingHandlers.text.update(element, function () {
                return output;
            });
        }
    };

    // It would be better if this took the series object directly
    ko.bindingHandlers.matchup = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var args, season, series, source;

            args = valueAccessor();

            season = viewModel.season();
            series = viewModel.series()[args[0]][args[1]];
		/*	console.log(args[0]);
			console.log(args[1]);
			console.log(series.away.seed());
			console.log(series.home.seed());
			console.log(series.home.tid);
			console.log(series);*/
						
		//	console.log("matchup");
		//	console.log(series);
		//	console.log(series.home.tid);
		//	console.log("matchupend");			
            source = '';
            if (series && series.home.tid) {
                if (series.home.tid() === g.userTid) { source += '<span class="bg-info">'; }
                if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
                source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
                if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
                if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
                if (series.home.tid() === g.userTid) { source += '</span>'; }
                source += '<br>';

                if (series.away.tid() === g.userTid) { source += '<span class="bg-info">'; }
                if (series.home.hasOwnProperty("won") && series.away.won() === 3) { source += '<strong>'; }
                source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
                if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
                if (series.home.hasOwnProperty("won") && series.away.won() === 3) { source += '</strong>'; }
                if (series.away.tid() === g.userTid) { source += '</span>'; }
            }
	//		console.log(source);

            return ko.bindingHandlers.html.update(element, function () {
                return source;
            });
        }
    };

  // It would be better if this took the series object directly
    ko.bindingHandlers.matchupNothing = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var args, season, series, source;

            args = valueAccessor();

            season = viewModel.season();
            series = viewModel.series()[args[0]][args[1]];
		//	console.log(args[0]);
		//	console.log(args[1]);
		//	console.log(series);
						
		//	console.log("matchup");
		//	console.log(series);
		//	console.log(series.home.tid);
		//	console.log("matchupend");			
            source = '';
            if (series && series.home.tid) {
                if (series.home.tid() === g.userTid) { source += '<span class="bg-info">'; }
                if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
				
					source += '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';

                if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
                if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
                if (series.home.tid() === g.userTid) { source += '</span>'; }
                source += '<br>';

                if (series.away.tid() === g.userTid) { source += '<span class="bg-info">'; }
                if (series.home.hasOwnProperty("won") && series.away.won() === 3) { source += '<strong>'; }
				
					source += '<a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				
                if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
                if (series.home.hasOwnProperty("won") && series.away.won() === 3) { source += '</strong>'; }
                if (series.away.tid() === g.userTid) { source += '</span>'; }
            }
	//		console.log(source);

            return ko.bindingHandlers.html.update(element, function () {
                return source;
            });
        }
    };	
	
   // It would be better if this took the series object directly
    ko.bindingHandlers.matchupNoBold = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var args, season, series, source;

            args = valueAccessor();

            season = viewModel.season();
            series = viewModel.series()[args[0]][args[1]];
		//	console.log(args[0]);
		//	console.log(args[1]);
		//	console.log(series);
						
		//	console.log("matchup");
		//	console.log(series);
		//	console.log(series.home.tid);
		//	console.log("matchupend");			
            source = '';
            if (series && series.home.tid) {
                if (series.home.tid() === g.userTid) { source += '<span class="bg-info">'; }
//                if (series.home.hasOwnProperty("won") && series.home.won() >= 4) { source += '<strong>'; }
                if (series.home.hasOwnProperty("won") && series.home.won() >= 4) { source += ''; }
				
				if (args[1] == 0) {
					source += 'LPL1. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				} else if (args[1] == 1) {
					source += 'EU2. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				} else if (args[1] == 2) {
					source += 'LCK1. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				} else if (args[1] == 3) {
					source += 'NA2. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				} else if (args[1] == 4) {
					source += 'EU1. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				} else if (args[1] == 5) {
					source += 'LCK2. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				} else if (args[1] == 6) {
					source += 'NA1. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				} else if (args[1] == 7) {
					source += 'LCK3. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				} else {
					source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
				}
                if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
//                if (series.home.hasOwnProperty("won") && series.home.won() >= 4) { source += '</strong>'; }
                if (series.home.hasOwnProperty("won") && series.home.won() >= 4) { source += ''; }
                if (series.home.tid() === g.userTid) { source += '</span>'; }
                if (series.home.hasOwnProperty("loss") && series.home.loss() === 1) { source += ' (TB)'; }
                if (series.home.hasOwnProperty("loss") && series.home.loss() === 2) { source += ' (TB2)'; }
                source += '<br>';

                if (series.away.tid() === g.userTid) { source += '<span class="bg-info">'; }
//                if (series.home.hasOwnProperty("won") && series.away.won() >= 4) { source += '<strong>'; }
                if (series.home.hasOwnProperty("won") && series.away.won() >= 4) { source += ''; }
				
				if (args[1] == 0) {
					source += 'LMS2. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				} else if (args[1] == 1) {
					source += 'NA3. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				} else if (args[1] == 2) {
					source += 'LPL2. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				} else if (args[1] == 3) {
					source += 'EU3. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				} else if (args[1] == 4) {
					source += 'LPL3. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				} else if (args[1] == 5) {
					source += 'WC1. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				} else if (args[1] == 6) {
					source += 'LMS1. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				} else if (args[1] == 7) {
					source += 'WC2. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				} else {
					source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
				}
				
                if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
//                if (series.home.hasOwnProperty("won") && series.away.won() >= 4) { source += '</strong>'; }
                if (series.home.hasOwnProperty("won") && series.away.won() >= 4) { source += ''; }
                if (series.away.tid() === g.userTid) { source += '</span>'; }
                if (series.home.hasOwnProperty("loss") && series.away.loss() === 1) { source += ' (TB)'; }
                if (series.home.hasOwnProperty("loss") && series.away.loss() === 2) { source += ' (TB2)'; }
            }
	//		console.log(source);

            return ko.bindingHandlers.html.update(element, function () {
                return source;
            });
        }
    };	
	
    // It would be better if this took the series object directly
    ko.bindingHandlers.matchuptopseed = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var args, season, series, source;

            args = valueAccessor();

            season = viewModel.season();
            series = viewModel.series()[args[0]][args[1]];


	//		console.log(series.away.seed());
	//		console.log(series.home.seed());
		//	console.log(series);
	//		console.log(series.home.tid);
	//		console.log(args[0]);
	//		console.log(args[1]);
			
            source = '';
			if (series && series.home.tid) {
		//	console.log(series);
		//	console.log(series.home.tid);
			//	console.log("got Here");

					if (series.away.seed() === series.home.seed() ) {
					
						if (series.home.tid() === g.userTid) { source += '<span class="bg-info">'; }					
						if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
						source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
						if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
						if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
						if (series.home.tid() === g.userTid) { source += '</span>'; }						
						source += '<br>';
						source += '<br>';
						source += '<br>';
			//	console.log("got Here");				
	/*
						if (series.home.hasOwnProperty("won") && series.away.won() === 4) { source += '<strong>'; }
						source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamRegionsCache[series.away.tid()] + '</a>';
						if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
						if (series.home.hasOwnProperty("won") && series.away.won() === 4) { source += '</strong>'; }*/
					} else {
			//	console.log("got Here");			
						if (series.home.tid() === g.userTid) { source += '<span class="bg-info">'; }					
						if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
						source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
						if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
						if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
						if (series.home.tid() === g.userTid) { source += '</span>'; }						
						source += '<br>';
	//			console.log("got Here");				

						if (series.away.tid() === g.userTid) { source += '<span class="bg-info">'; }					
						if (series.away.hasOwnProperty("won") && series.away.won() === 3) { source += '<strong>'; }
						source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
						if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
						if (series.away.hasOwnProperty("won") && series.away.won() === 3) { source += '</strong>'; }
						if (series.away.tid() === g.userTid) { source += '</span>'; }						
				
				
					}
			}

		//	console.log("got Here");				
		//	console.log(source);
            return ko.bindingHandlers.html.update(element, function () {
		//	console.log("got Here");				
			
                return source;
            });
        }
    };	
	
   // It would be better if this took the series object directly
    ko.bindingHandlers.matchupStore = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var args, season, series, source;

            args = valueAccessor();

            season = viewModel.season();
            series = viewModel.series()[args[0]][args[1]];


	//		console.log(series.away.seed());
	//		console.log(series.home.seed());
		//	console.log(series);
	//		console.log(series.home.tid);
/*			console.log(args[0]);
			console.log(args[1]);
			console.log(series.away.seed());
			console.log(series.home.seed());
			console.log(series.home.tid);
			console.log(series);*/
			
            source = '';
			if (series && series.home.tid) {
		//	console.log(series);
		//	console.log(series.home.tid);
			//	console.log("got Here");

					if (series.away.seed() === series.home.seed() ) {
					//	if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
					//	source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
					////	if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
					//	if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
					//	source += '<br>';
					//	source += '<br>';
					//	source += '<br>';
			//	console.log("got Here");				
	/*
						if (series.home.hasOwnProperty("won") && series.away.won() === 4) { source += '<strong>'; }
						source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamRegionsCache[series.away.tid()] + '</a>';
						if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
						if (series.home.hasOwnProperty("won") && series.away.won() === 4) { source += '</strong>'; }*/
					} else {
			//	console.log("got Here");		
						if (series.home.tid() === g.userTid) { source += '<span class="bg-info">'; }					
			
						if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
						source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
						if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
						if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
						if (series.home.tid() === g.userTid) { source += '</span>'; }						
						
						source += '<br>';
	//			console.log("got Here");				

						if (series.away.tid() === g.userTid) { source += '<span class="bg-info">'; }					

						if (series.away.hasOwnProperty("won") && series.away.won() === 3) { source += '<strong>'; }
						source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
						if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
						if (series.away.hasOwnProperty("won") && series.away.won() === 3) { source += '</strong>'; }
						if (series.away.tid() === g.userTid) { source += '</span>'; }						
				
				
					}
			}

		//	console.log("got Here");				
		//	console.log(source);
            return ko.bindingHandlers.html.update(element, function () {
		//	console.log("got Here");				
			
                return source;
            });
        }
    };	
		

  // It would be better if this took the series object directly
    ko.bindingHandlers.matchupGroup = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var args, season, series, source;

            args = valueAccessor();

            season = viewModel.season();
  //          series = viewModel.series()[args[0]][args[1]][args[2]][args[3]];
            series = viewModel.series()[args[0]][args[1]];


	//		console.log(series.away.seed());
	//		console.log(series.home.seed());
		//	console.log(series);
	//		console.log(series.home.tid);
	/*		console.log(args[0]); //round
			console.log(args[1]); //game #
			//console.log(args[2]);
			//console.log(args[3]);

			console.log(series);
			console.log(series.home.tid);
			console.log(series.away.tid);
			console.log(series.home2.tid);
			console.log(series.away2.tid);*/
		//	console.log(series.seed1.tid);
		//	console.log(series.seed2.tid);
			
            source = '';
			if (series && series.seed1.tid) {
		//	console.log(series);
		//	console.log(series.home.tid);
			//	console.log("got Here");

					if (series.seed1.seed() === series.seed2.seed() ) {
					//	if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
					//	source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
					////	if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
					//	if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
					//	source += '<br>';
					//	source += '<br>';
					//	source += '<br>';
			//	console.log("got Here");				
	
					} else {
			/*	console.log("got Here");			
				console.log(series.seed1.hasOwnProperty("won"));
				console.log(series.seed2.hasOwnProperty("won"));
				console.log(series.seed3.hasOwnProperty("won"));
				console.log(series.seed4.hasOwnProperty("won"));*/
				/*		console.log(series.seed1.tid());
						console.log(series.seed2.tid());
						console.log(series.seed3.tid());
						console.log(series.seed4.tid());						
						console.log(series.seed1.won());
						console.log(series.seed2.won());
						console.log(series.seed3.won());
						console.log(series.seed4.won());						*/
						if (series.seed1.tid() === g.userTid) { source += '<span class="bg-info">'; }									
						if (series.seed1.hasOwnProperty("won") && series.seed1.won() === 4) { source += '<strong>'; }
						source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.seed1.tid()], season]) + '">' + g.teamNamesCache[series.seed1.tid()] + '</a>';
						if (series.seed1.hasOwnProperty("won")) { source += ' ' + series.seed1.won(); }
						if (series.seed1.hasOwnProperty("won") && series.seed1.won() === 4) { source += '</strong>'; }
						if (series.seed1.tid() === g.userTid) { source += '</span>'; }						
						
						source += '<br>';
			//	console.log("got Here");				

						if (series.seed2.tid() === g.userTid) { source += '<span class="bg-info">'; }									
						if (series.seed2.hasOwnProperty("won") && series.seed2.won() === 4) { source += '<strong>'; }
						source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.seed2.tid()], season]) + '">' + g.teamNamesCache[series.seed2.tid()] + '</a>';
						if (series.seed2.hasOwnProperty("won")) { source += ' ' + series.seed2.won(); }
						if (series.seed2.hasOwnProperty("won") && series.seed2.won() === 4) { source += '</strong>'; }				
						if (series.seed2.tid() === g.userTid) { source += '</span>'; }						

						if (series.seed3.tid() === g.userTid) { source += '<span class="bg-info">'; }									
						if (series.seed3.hasOwnProperty("won") && series.seed3.won() === 4) { source += '<strong>'; }
						source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.seed3.tid()], season]) + '">' + g.teamNamesCache[series.seed3.tid()] + '</a>';
						if (series.seed3.hasOwnProperty("won")) { source += ' ' + series.seed3.won(); }
						if (series.seed3.hasOwnProperty("won") && series.seed3.won() === 4) { source += '</strong>'; }				
						if (series.seed3.tid() === g.userTid) { source += '</span>'; }						

						if (series.seed4.tid() === g.userTid) { source += '<span class="bg-info">'; }									
						if (series.seed4.hasOwnProperty("won") && series.seed4.won() === 4) { source += '<strong>'; }
						if (series.seed4.hasOwnProperty("won") && series.seed4.won() === 5) { source += '<strong>'; }
						if (series.seed4.hasOwnProperty("won") && series.seed4.won() === 6) { source += '<strong>'; }
						if (series.seed4.hasOwnProperty("won") && series.seed4.won() === 7) { source += '<strong>'; }
						source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.seed4.tid()], season]) + '">' + g.teamNamesCache[series.seed4.tid()] + '</a>';
						if (series.seed4.hasOwnProperty("won")) { source += ' ' + series.seed4.won(); }
						if (series.seed4.hasOwnProperty("won") && series.seed4.won() === 4) { source += '</strong>'; }				
						if (series.seed4.hasOwnProperty("won") && series.seed4.won() === 5) { source += '</strong>'; }				
						if (series.seed4.hasOwnProperty("won") && series.seed4.won() === 6) { source += '</strong>'; }				
						if (series.seed4.hasOwnProperty("won") && series.seed4.won() === 7) { source += '</strong>'; }				
						if (series.seed4.tid() === g.userTid) { source += '</span>'; }						
						
					}
			}

		//	console.log("got Here");				
		//	console.log(source);
            return ko.bindingHandlers.html.update(element, function () {
		//	console.log("got Here");				
			
                return source;
            });
        }
    };	
			
	
 // It would be better if this took the series object directly
    ko.bindingHandlers.matchuptopseedTop = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var args, season, series, source;

            args = valueAccessor();

            season = viewModel.season();
            series = viewModel.series()[args[0]][args[1]];


            source = '';
			if (series.away.seed() === series.home.seed() ) {
			
				if (series && series.home.tid) {
					if (series.home.tid() === g.userTid) { source += '<span class="bg-info">'; }													
					if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
					source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
					if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
					if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
					if (series.home.tid() === g.userTid) { source += '</span>'; }						
					
         /*       	source += '<br>';

					if (series.home.hasOwnProperty("won") && series.away.won() === 4) { source += '<strong>'; }
					source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamRegionsCache[series.away.tid()] + '</a>';
					if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
					if (series.home.hasOwnProperty("won") && series.away.won() === 4) { source += '</strong>'; }*/
				}
			} else {
				if (series && series.home.tid) {
					if (series.home.tid() === g.userTid) { source += '<span class="bg-info">'; }																	
					if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '<strong>'; }
					source += series.home.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid()], season]) + '">' + g.teamNamesCache[series.home.tid()] + '</a>';
					if (series.home.hasOwnProperty("won")) { source += ' ' + series.home.won(); }
					if (series.home.hasOwnProperty("won") && series.home.won() === 3) { source += '</strong>'; }
					if (series.home.tid() === g.userTid) { source += '</span>'; }						
					source += '<br>';

					if (series.away.tid() === g.userTid) { source += '<span class="bg-info">'; }																	
					if (series.away.hasOwnProperty("won") && series.away.won() === 3) { source += '<strong>'; }
					source += series.away.seed() + '. <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid()], season]) + '">' + g.teamNamesCache[series.away.tid()] + '</a>';
					if (series.away.hasOwnProperty("won")) { source += ' ' + series.away.won(); }
					if (series.away.hasOwnProperty("won") && series.away.won() === 3) { source += '</strong>'; }
					if (series.away.tid() === g.userTid) { source += '</span>'; }						
				}
			
			
			}

            return ko.bindingHandlers.html.update(element, function () {
                return source;
            });
        }
    };	
	
    ko.bindingHandlers.newWindow = {
        update: function (element, valueAccessor) {
            var args, url;

            args = valueAccessor();

            if (args.length === 0) {
                url = document.URL;
            } else {
                url = helpers.leagueUrl(args);
            }

            return ko.bindingHandlers.html.update(element, function () {
                // Window name is set to the current time, so each window has a unique name and thus a new window is always opened
                return '<a href="javascript:(function () { window.open(\'' + url + '?w=popup\', Date.now(), \'height=600,width=800,scrollbars=yes\'); }())" class="new_window" title="Move To New Window" data-no-davis="true"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA0AAAANABeWPPlAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFOSURBVDiNlZS9isJAFIU/F6s0m0VYYiOrhVukWQsbK4t9CDtbexGs8xY+ghY+QRBsbKcTAjZaqKyGXX2Bs00S1AwBD1yYOXPvmXvv/CAJSQAuoGetzAPCMKRSqTzSOURRRK/Xo1wqldyEewXwfR/P8zLHIAhYr9fZ3BjDeDym1WoBUAZ+i3ZaLBYsl8s7zhiTCbwk3DfwaROYz+fsdjs6nU7GOY6TjVOBGPixCbiuy2g0YrVa0Ww2c+svlpg7DAYDptMp3W6XyWRi9RHwRXKMh8NBKYbDoQC1221dr1dtNhv1+33NZjMZY9KjtAsEQSBAvu/rfD7rEYUC2+1WjuOo0Whov9/ngm8FchcJoFarEYYhnudRrVYLe5QTOJ1OANTrdQCOx6M1MI5jexOftdsMLsBbYb7wDkTAR+KflWC9hRakr+wi6e+2hGfNTb+Bf9965Lxmndc1AAAAAElFTkSuQmCC" height="16" width="16"></a>';
            });
        }
    };

    ko.bindingHandlers.skillsBlock = {
        update: function (element, valueAccessor) {
            var arg = valueAccessor();
            return ko.bindingHandlers.html.update(element, function () {
                return helpers.skillsBlock(ko.unwrap(arg));
            });
        }
    };

    ko.bindingHandlers.watchBlock = {
        update: function (element, valueAccessor) {
            var args = valueAccessor();
            return ko.bindingHandlers.html.update(element, function () {
                return helpers.watchBlock(ko.unwrap(args[0]), ko.unwrap(args[1]));
            });
        }
    };

    ko.bindingHandlers.currency = {
        update: function (element, valueAccessor) {
            var args = valueAccessor();
            return ko.bindingHandlers.text.update(element, function () {
                return helpers.formatCurrency(ko.unwrap(args[0]), args[1]);
            });
        }
    };

    ko.bindingHandlers.numberWithCommas = {
        update: function (element, valueAccessor) {
            var args = valueAccessor();
            return ko.bindingHandlers.text.update(element, function () {
                return helpers.numberWithCommas(ko.unwrap(args));
            });
        }
    };

    ko.bindingHandlers.playerNameLabels = {
        update: function (element, valueAccessor) {
            var args, injury;

            args = valueAccessor();
            injury = ko.unwrap(args[2]);
            injury.type = ko.unwrap(injury.type);
            injury.gamesRemaining = ko.unwrap(injury.gamesRemaining);

            return ko.bindingHandlers.html.update(element, function () {
                return helpers.playerNameLabels(ko.unwrap(args[0]), ko.unwrap(args[1]), injury, ko.unwrap(args[3]), ko.unwrap(args[4]));
            });
        }
    };

    ko.bindingHandlers.attrLeagueUrl = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var args, attr, options, toAttr;

            args = valueAccessor();
            toAttr = {};

            for (attr in args) {
                if (args.hasOwnProperty(attr)) {
                    // No query string for forms because https://github.com/olivernn/davis.js/issues/75
                    if (attr === "action") {
                        options = {noQueryString: true};
                    } else {
                        options = {};
                    }

                    toAttr[attr] = helpers.leagueUrl(args[attr], options, viewModel.lid);
                }
            }

            return ko.bindingHandlers.attr.update(element, function () {
                return toAttr;
            });
        }
    };

    ko.bindingHandlers.dropdown = {
        init: function () {
            // http://www.knockmeout.net/2012/05/quick-tip-skip-binding.html
            return {
                controlsDescendantBindings: true
            };
        },
        update: function (element, valueAccessor) {
            var arg = valueAccessor();
            return ko.bindingHandlers.html.update(element, function () {
                return '<form id="' + arg + '-dropdown" class="form-inline pull-right bbgm-dropdown" role="form">' +
                       '<!-- ko foreach: fields -->' +
                         '<div class="form-group" style="margin-left: 4px; margin-bottom: 4px;">' +
                         '<select data-bind="attr: {id: id, class: \'form-control \' + name}, options: options, optionsText: \'val\', optionsValue: \'key\', value: selected">' +
                         '</select>' +
                         '</div>' +
                       '<!-- /ko -->' +
                       '</form>';
            });
        }
    };

    ko.bindingHandlers.recordAndPlayoffs = {
        update: function (element, valueAccessor) {
            var abbrev, args, extraText, lost, option, output, playoffRoundsWon, season, won;

            args = valueAccessor();
            abbrev = ko.unwrap(args[0]);
            season = ko.unwrap(args[1]);
            won = ko.unwrap(args[2]);
            lost = ko.unwrap(args[3]);
            playoffRoundsWon = ko.unwrap(args[4]);
            option = args.length > 5 ? ko.unwrap(args[5]) : null;

            extraText = "";
			
			
			if (g.gameType == 0) {								
				if (playoffRoundsWon === 0) {
					extraText = "made first round";
				} else if (playoffRoundsWon === 1) {
					extraText = "made second round";
				} else if (playoffRoundsWon === 2) {
					extraText = "made league finals";
				} else if (playoffRoundsWon === 3) {
					extraText = "league champs";
				} else if (playoffRoundsWon === 4) {
					extraText = "league champs";
				}			
			} else if (g.gameType == 1) {								
				if (playoffRoundsWon === 4) {
					extraText = "made CS promotion";
				} else if (playoffRoundsWon === 5) {
					extraText = "made CS round 2";
				} else if (playoffRoundsWon === 6) {
					extraText = "made CS finals";
				} else if (playoffRoundsWon === 7) {
					extraText = "made CS";
				} else if (playoffRoundsWon === 13) {
					extraText = "stay at CS"; // haven't fully added, for when more teams added to CS
				} else if (playoffRoundsWon === 14) {
					extraText = "demoted to CS";
				} else if (playoffRoundsWon === 16) {
					extraText = "made LCS qualifiers";
				} else if (playoffRoundsWon === 17) {
					extraText = "made LCS promotion";
				} else if (playoffRoundsWon === 18) {
					extraText = "made LCS";
				} else if (playoffRoundsWon === 20) {
					extraText = "stayed in LCS";
				} else if (playoffRoundsWon === 24) {
					extraText = "made LCS quarterfinals";
				} else if (playoffRoundsWon === 25) {
					extraText = "made LCS semifinals";
				} else if (playoffRoundsWon === 26) {
					extraText = "made LCS finals";
				} else if (playoffRoundsWon === 27) {
					extraText = "LCS champs";
				}			
			} else if (g.gameType == 2) {								
				if (playoffRoundsWon === 0) {
					extraText = "made wild card";
				} else if (playoffRoundsWon === 1) {
					extraText = "made quarterfinals";
				} else if (playoffRoundsWon === 2) {
					extraText = "made semifinals";
				} else if (playoffRoundsWon === 3) {
					extraText = "made finals";
				} else if (playoffRoundsWon === 4) {
					extraText = "league champs";
				}			
			} else if (g.gameType == 3) {								
				if (playoffRoundsWon === 0) {
					extraText = "made round 1";
				} else if (playoffRoundsWon === 1) {
					extraText = "made round 2";
				} else if (playoffRoundsWon === 2) {
					extraText = "made seeding match";
				} else if (playoffRoundsWon === 3) {
					extraText = "made quarterfinals";
				} else if (playoffRoundsWon === 4) {
					extraText = "made semifinals";
				} else if (playoffRoundsWon === 5) {
					extraText = "made finals";
				} else if (playoffRoundsWon === 6) {
					extraText = "league champs";
				}			
			} else if (g.gameType == 4) {								
				if (playoffRoundsWon === 0) {
					extraText = "made quarterfinals";
				} else if (playoffRoundsWon === 1) {
					extraText = "made semifinals";
				} else if (playoffRoundsWon === 2) {
					extraText = "made finals";
				} else if (playoffRoundsWon === 3) {
					extraText = "league champs";
				}						
			} else {
					//extraText = ""; only for regionals, worlds,
				if (playoffRoundsWon < 0) {
					extraText = "";
				} else if (playoffRoundsWon == 0) {
					extraText = "made conference playoffs";
				} else if (playoffRoundsWon == 1) {
					extraText = "made regionals";
				} else if (playoffRoundsWon == 2) {
					extraText = "made groups";
				} else if (playoffRoundsWon == 3) {
					extraText = "made Worlds";
				} else if (playoffRoundsWon === 4) {
					extraText = "made Worlds semifinals";
				} else if (playoffRoundsWon === 5) {
					extraText = "made Worlds finals";
				} else if (playoffRoundsWon === 6) {
					extraText = "Worlds champions";
				}						
			}
			


            output = '';
            if (option !== "noSeason") {
                output += '<a href="' + helpers.leagueUrl(["roster", abbrev, season]) + '">' + season + '</a>: ';
            }
            output += '<a href="' + helpers.leagueUrl(["standings", season]) + '">' + won + '-' + lost + '</a>';
            if (extraText) {
                output += ', <a href="' + helpers.leagueUrl(["playoffs", season]) + '">' + extraText + '</a>';
            }

            return ko.bindingHandlers.html.update(element, function () {
                return output;
            });
        }
    };

    ko.bindingHandlers.draftAbbrev = {
        update: function (element, valueAccessor) {
            var args = valueAccessor();
            return ko.bindingHandlers.html.update(element, function () {
                return helpers.draftAbbrev(ko.unwrap(args[0]), ko.unwrap(args[1]));
            });
        }
    };

    ko.bindingHandlers.ordinal = {
        update: function (element, valueAccessor) {
            var arg = valueAccessor();
            return ko.bindingHandlers.html.update(element, function () {
                return helpers.ordinal(parseInt(ko.unwrap(arg), 10));
            });
        }
    };
	
    ko.bindingHandlers.multiTeamMenu = {
        update: function (element, valueAccessor) {
            var arg, i, options, teamNames, userTid, userTids;
            arg = valueAccessor();
            userTid = ko.unwrap(arg[0]);
            userTids = ko.unwrap(arg[1]);

            // Hide if not multi team or not loaded yet
            if (userTids.length <= 1 || g.teamRegionsCache === undefined) {

                return ko.bindingHandlers.visible.update(element, function () {
                    return false;
                });
            }

            ko.bindingHandlers.visible.update(element, function () {
                return true;
            });

            teamNames = userTids.map(function (t) {
                return g.teamRegionsCache[t] + " " + g.teamNamesCache[t];
            });

            options = "";
            for (i = 0; i < userTids.length; i++) {
                if (userTid === userTids[i]) {
                    options += '<option value="' + userTids[i] + '" selected>' + teamNames[i] + '</option>';
                } else {
                    options += '<option value="' + userTids[i] + '">' + teamNames[i] + '</option>';
                }
            }

            return ko.bindingHandlers.html.update(element, function () {
                return '<label for="multi-team-select">Currently controlling:</label><br><select class="form-control" id="multi-team-select" onchange="require(\'util/helpers\').updateMultiTeam(parseInt(this.options[this.selectedIndex].value, 10))">' + options + '</select>';
            });
        }
    };	
});