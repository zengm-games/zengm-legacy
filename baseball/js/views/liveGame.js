/**
 * @name views.live
 * @namespace Live play-by-play game simulation.
 */
define(["dao", "globals", "ui", "core/game", "lib/jquery", "lib/knockout", "util/bbgmView", "util/helpers"], function (dao, g, ui, game, $, ko, bbgmView, helpers) {

    "use strict";

	//var playerorder = [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]];
	
    function get(req) {
        if (req.raw.playByPlay !== undefined) {
            return {
                gidPlayByPlay: req.raw.gidPlayByPlay,
                playByPlay: req.raw.playByPlay
            };
        }
    }

    function post(req) {
        var gid;

        gid = parseInt(req.params.gid, 10);

        $("#live-games-list button").attr("disabled", "disabled");

        // Start 1 day of game simulation
        // Prevent any redirects, somehow
        // Get play by play for gid through raw of ui.realtimeUpdate
        // gameSim with playByPlay in raw leads to display of play by play in updatePlayByPlay
        game.play(1, true, gid);
    }

    function InitViewModel() {
        this.playByPlay = ko.observableArray();

        this.games = ko.observable();
        this.speed = ko.observable(4);


					
        // See views.gameLog for explanation
        this.boxScore = {
            gid: ko.observable(-1)
        };
        this.showBoxScore = ko.computed(function () {
            return this.boxScore.gid() >= 0;
        }, this).extend({throttle: 1});
    }

    function updatePlayByPlay(inputs, updateEvents, vm) {
        var deferred, events, overtimes;

        if (inputs.playByPlay !== undefined && inputs.playByPlay.length > 0) {
             return dao.games.get({key: inputs.gidPlayByPlay}).then(function (boxScore) {
                var i, j, resetStats, s;

                // Stats to set to 0
//                resetStats = ["min", "fg", "fga", "tp", "tpa", "ft", "fta", "orb", "trb", "ast", "tov", "stl", "blk", "pf", "pts","errors","fieldAttempts","drb","fgAtRim","fgaAtRim","fgLowPost","pfE"];
//                resetStats = ["min", "fg", "fga", "tp", "tpa", "ft", "fta", "orb", "trb", "ast", "tov", "stl", "blk", "pf", "pts","errors","fieldAttempts","drb","fgAtRim","fgaAtRim","pfE"];
                resetStats = [ "fg", "fga", "tp", "tpa", "ft", "fta", "orb", "trb", "ast", "tov", "stl", "blk", "pf", "pts","errors","fieldAttempts","drb","fgAtRim","fgaAtRim","pfE","showPlayByPlay","showPlayByPlayPitcher"];

                boxScore.overtime = "";
                boxScore.quarter = "1st inning";
                boxScore.time = "12:00";
                boxScore.gameOver = false;
                for (i = 0; i < boxScore.teams.length; i++) {
//                for (i = 1; i > -1; i++) {
                    // Team metadata
                    boxScore.teams[i].abbrev = g.teamAbbrevsCache[boxScore.teams[i].tid];
                    boxScore.teams[i].region = g.teamRegionsCache[boxScore.teams[i].tid];
                    boxScore.teams[i].name = g.teamNamesCache[boxScore.teams[i].tid];

                    boxScore.teams[i].ptsQtrs = [0];

		// added, see if works?
             /*       for (j = 0; j < boxScore.teams[i].players.length; j++) {		
						playerorder[i][j] = boxScore.teams[i].players[j]["fgaLowPost"];
						console.log("j: "+j+" "+playerorder[i][j]);
					}*/
					boxScore.teams[i].players.sort(function (a, b) {
                        // This sorts by starters first and minutes second, since .min is always far less than 1000 and gs is either 1 or 0. Then injured players are listed third, since .injury.gamesRemaining is 0 for healthy and -1 for injured.
						// sort by pitching information as well (have them come after the hitters? keep track of #pitches)
//                        return (b.fga+b.ast) - (a.fga+a.ast);
                        return (b.fgaLowPost) - (a.fgaLowPost);
//                        return (b.gs * 1000 + b.min + b.injury.gamesRemaining * 1000) - (a.gs * 1000 + a.min + a.injury.gamesRemaining * 1000);
                    });		

                    for (s = 0; s < resetStats.length; s++) {
                        boxScore.teams[i][resetStats[s]] = 0;
                    }
										
					
					
                    for (j = 0; j < boxScore.teams[i].players.length; j++) {
                        // Fix for players who were hurt this game - don't show right away!
          //              if (boxScore.teams[i].players[j].injury.type !== "Healthy" && boxScore.teams[i].players[j].min > 0) {
         //                   boxScore.teams[i].players[j].injury = {type: "Healthy", gamesRemaining: 0};
         //               }

				//		console.log(boxScore.teams[i].players[j]);
                        for (s = 0; s < resetStats.length; s++) {	
						
					//		console.log(j+" "+s+" "+boxScore.teams[i].players[j][resetStats[s]]);
                            boxScore.teams[i].players[j][resetStats[s]] = 0;
                        }

                        if (j < 9) {
                            boxScore.teams[i].players[j].inGame = true;
                        } else {
                            boxScore.teams[i].players[j].inGame = false;
                        }
                    }
                }

				
				
                 return {
                    boxScore: boxScore
                };
            });
        }

        // If no game is loaded by this point (either by this GET or a prior one), leave
        if (vm.boxScore.gid() < 0) {
            return {
                redirectUrl: helpers.leagueUrl(["live"])
            };
        }
    }

    function uiFirst(vm) {
        var playByPlayList;

        ui.title("Live Game Simulation");

        // Keep plays list always visible
        $("#affixPlayByPlay").affix({
            offset: {
                top: 80
            }
        });

        // Keep height of plays list equal to window
        playByPlayList = document.getElementById("playByPlayList");
        playByPlayList.style.height = (window.innerHeight - 114) + "px";
        window.addEventListener("resize", function () {
            playByPlayList.style.height = (window.innerHeight - 114) + "px";
        });
    }
	
	
    function startLiveGame(inputs, updateEvents, vm) {
        var events, overtimes, processToNextPause;

        if (inputs.playByPlay !== undefined && inputs.playByPlay.length > 0) {
            events = inputs.playByPlay;
            overtimes = 0;

			
        function processToNextPause() {
            var e, i, ptsQtrs, stop, text;
			var innings;
		//	var playerlocation;
            stop = false;
			
			var firstReliever,firstPlayer;
			
			firstReliever = 13;
			firstPlayer = 13;
            while (!stop && events.length > 0) {
                text = null;

                e = events.shift();

/*			for (i = 0; i < game.teams.length; i++) {
//					vm.boxScore.teams[i].players.sort(function (a, b) {
					vm.boxScore.teams()[[e.t].players()[e.p][e.s].sort(function (a, b) {
                        // This sorts by starters first and minutes second, since .min is always far less than 1000 and gs is either 1 or 0. Then injured players are listed third, since .injury.gamesRemaining is 0 for healthy and -1 for injured.
						// sort by pitching information as well (have them come after the hitters? keep track of #pitches)
//                        return (b.fga+b.ast) - (a.fga+a.ast);
                        return (b.fgaLowPost) - (a.fgaLowPost);
//                        return (b.gs * 1000 + b.min + b.injury.gamesRemaining * 1000) - (a.gs * 1000 + a.min + a.injury.gamesRemaining * 1000);
                    });	
									
                }*/
				
                if (e.type === "text") {
                    if (e.t === 0 || e.t === 1) {
//                        text = e.time + "  " + vm.boxScore.teams()[e.t].abbrev() + " - " + e.text;
                        text = vm.boxScore.teams()[e.t].abbrev() + " - " + e.text;
                    } else {
                        text = e.text;
                    }

                    // Show score after scoring plays
//                    if (text.indexOf("made") >= 0) { // change to scored
                    if (text.indexOf("scored") >= 0) { // change to scored
                        text += " (" + vm.boxScore.teams()[0].pts() + "-" + vm.boxScore.teams()[1].pts() + ")";
                    }

                    vm.boxScore.time(e.time);

                    stop = true;
                } else if (e.type === "sub") {
                    for (i = 0; i < vm.boxScore.teams()[e.t].players().length; i++) {
                        if (vm.boxScore.teams()[e.t].players()[i].pid() === e.on) {
                            vm.boxScore.teams()[e.t].players()[i].inGame(true);
                        } else if (vm.boxScore.teams()[e.t].players()[i].pid() === e.off) {
                            vm.boxScore.teams()[e.t].players()[i].inGame(false);
                        }
                    }
                } else if (e.type === "stat") {
                    // Quarter-by-quarter score
                    if (e.s === "pts") {
                        // This is a hack because array elements are not made observable by default in the Knockout mapping plugin and I didn't want to write a really ugly mapping function.
                        ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
                    //        console.log("length 1: "+ptsQtrs.length);	// shows length											
                   //         console.log("points 1: "+ptsQtrs);						
                   //         console.log("end quarter: "+e.qtr);							
                   //         console.log("e.s: "+e.s);							
                   //         console.log("e.s: "+e.amt);							
//                            console.log("length: "+ptsQtrs.length);							
                        if (ptsQtrs.length <= e.qtr) {
                            // Must be overtime! This updates ptsQtrs too.
                         /*   console.log("2: "+ptsQtrs(0));
                            console.log("2: "+ptsQtrs(1));
                            console.log("2: "+ptsQtrs(2));*/
/*                            console.log("2: "+ptsQtrs[0]);
                            console.log("2: "+ptsQtrs[1]);
                            console.log("2: "+ptsQtrs[2]);*/
                            vm.boxScore.teams()[0].ptsQtrs.push(0);
                            vm.boxScore.teams()[1].ptsQtrs.push(0);
                  /*          console.log("2: "+ptsQtrs[0]);
                            console.log("2: "+ptsQtrs[1]);
                            console.log("2: "+ptsQtrs.length);*/
                            if (ptsQtrs.length > 9) {
                                overtimes += 1;
                               // if (overtimes === 1) {
								    innings = overtimes+9;
                                    vm.boxScore.overtime(" ("+innings+")");
                             //   } //else if (overtimes > 1) {
                                   // vm.boxScore.overtime(" (" + overtimes + "OT)");
                                //}
//                                vm.boxScore.quarter(helpers.ordinal(overtimes) + " inning");
                                vm.boxScore.quarter(helpers.ordinal(innings) + " inning");
                            } else {
                                vm.boxScore.quarter(helpers.ordinal(ptsQtrs.length) + " inning");
                            }
                        }
                        ptsQtrs[e.qtr] += e.amt;
                        vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                    }
					
					

					
                    // Everything else
/*(e.s === "drb") {
                        vm.boxScore.teams()[e.t].players()[e.p].trb(vm.boxScore.teams()[e.t].players()[e.p].trb() + e.amt);
                        vm.boxScore.teams()[e.t].trb(vm.boxScore.teams()[e.t].trb() + e.amt);
                    } else if (e.s === "orb") {
                        vm.boxScore.teams()[e.t].players()[e.p].trb(vm.boxScore.teams()[e.t].players()[e.p].trb() + e.amt);
                        vm.boxScore.teams()[e.t].trb(vm.boxScore.teams()[e.t].trb() + e.amt);
                        vm.boxScore.teams()[e.t].players()[e.p][e.s](vm.boxScore.teams()[e.t].players()[e.p][e.s]() + e.amt);
                        vm.boxScore.teams()[e.t][e.s](vm.boxScore.teams()[e.t][e.s]() + e.amt); //,"drb","fgAtRim","fgaAtRim","fgLowPost"
                    } else if*/
//					if (e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" || e.s === "pts" || e.s === "errors" || e.s === "fieldAttempts"|| e.s === "fgAtRim" || e.s === "fgaAtRim" || e.s === "fgLowPost"|| e.s === "drb" || e.s === "orb" || e.s === "pfE" || e.s === "showPlayByPlay" || e.s === "showPlayByPlayPitcher") {
					if (e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" || e.s === "pts" || e.s === "errors" || e.s === "fieldAttempts"|| e.s === "fgAtRim" || e.s === "fgaAtRim" || e.s === "fgLowPost"|| e.s === "drb" || e.s === "orb" || e.s === "pfE" || e.s === "showPlayByPlay" || e.s === "showPlayByPlayPitcher") {
//					if (e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" || e.s === "pts" || e.s === "errors" || e.s === "fieldAttempts"|| e.s === "fgAtRim" || e.s === "fgaAtRim" || e.s === "fgLowPost"|| e.s === "drb" || e.s === "orb" || e.s === "pfE" || e.s === "showPlayByPlayPitcher") {
//                        vm.boxScore.teams()[e.t].players()[e.p][e.s](vm.boxScore.teams()[e.t].players()[e.p][e.s]() + e.amt);
				//		playerlocation = 10-vm.boxScore.teams()[e.t].players()[e.p]["fgLowPost"]();
			//			console.log(playerlocation+" "+vm.boxScore.teams()[e.t].players()[e.p]["fgLowPost"]());
			//			console.log(e.p+" "+vm.boxScore.teams()[e.t].players()[e.p][e.s]()+" "+ e.amt);
           //             vm.boxScore.teams()[e.t].players()[playerlocation][e.s](vm.boxScore.teams()[e.t].players()[playerlocation][e.s]() + e.amt);
	//	   console.log("e.t: "+e.t+" e.p: "+e.p+" e.s: "+e.s+" e.amt: "+e.amt)
		//   console.log("e.p: "+e.p+)
		   //console.log(+"e.s: "+e.s+)
		   //console.log(+"e.amt: "+e.amt+)
//		   console.log("e.amt: "+e.amt)
//		   console.log("e.amt: "+e.amt)
		   
		   //if (e.p >100) {		   
		      //e.p -= 100;
		   //}
	//	   if (e.p >40) {		   
	//	      e.p -= 40;
	//	   }
		   //if (e.p >40) {		   
		     // e.p -= 40;
		   //}
/*   		   if (e.p >40) {		 
			  if (e.p == firstPlayer) {
				e.p = firstReliever;
			  } else {
				firstPlayer = e.p;
				firstReliever += 1;
				e.p = firstReliever;
			  }
		   }*/

		   
		 //  e.t: 0 liveGame.js:161
//e.p: 48 liveGame.js:162      (player 48 way too big?)
//e.s: showPlayByPlay liveGame.js:163
//e.amt: 1 
		//   console.log("team: "+e.t+" order by p: "+e.p+" e.s: "+e.s+" e.amt: "+e.amt);
                        vm.boxScore.teams()[e.t].players()[e.p][e.s](vm.boxScore.teams()[e.t].players()[e.p][e.s]() + e.amt);
                        vm.boxScore.teams()[e.t][e.s](vm.boxScore.teams()[e.t][e.s]() + e.amt);
						if (e.s === "fta") {
					//	 console.log("t: "+e.t+" p: "+e.p);
						}
                    }
                }
            }

            if (text !== null) {
                vm.playByPlay.unshift(text);
            }

            if (events.length > 0) {
                setTimeout(processToNextPause, 4000 / Math.pow(1.2, vm.speed()));
            } else {
                vm.boxScore.time("0:00");
                vm.boxScore.gameOver(true);
            }
        }	

           processToNextPause();
        }
    }		
		
    return bbgmView.init({
        id: "liveGame",
        get: get,
        post: post,
        InitViewModel: InitViewModel,
        runBefore: [updatePlayByPlay],
        runAfter: [startLiveGame],		
        uiFirst: uiFirst
    });
});