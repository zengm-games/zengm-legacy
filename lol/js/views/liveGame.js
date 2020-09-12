/**
 * @name views.live
 * @namespace Live play-by-play game simulation.
 */
define(["dao", "globals", "ui", "core/game", "lib/jquery", "lib/knockout", "util/bbgmView", "util/helpers"], function (dao, g, ui, game, $, ko, bbgmView, helpers) {
    "use strict";

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
        if (inputs.playByPlay !== undefined && inputs.playByPlay.length > 0) {
            return dao.games.get({key: inputs.gidPlayByPlay}).then(function (boxScore) {
                var i, j, resetStats, s;

                // Stats to set to 0
//                resetStats = ["min", "fg", "fga","fgp","fgAtRim","fgaAtRim","fgpAtRim","fgLowPost","fgaLowPost", "fgMidRange", "fgaMidRange", "tp", "tpa", "ft", "fta", "orb","drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts","champPicked","oppJM"];
                resetStats = [ "min","fg", "fga","fgp","fgpAtRim","fgAtRim","fgaAtRim","fgpAtRim","fgLowPost","fgaLowPost", "fgMidRange", "fgaMidRange", "tp", "tpa", "ft", "fta", "orb","drb", "trb", "ast", "tov", "stl", "blk", "pf", "pts","champPicked","oppJM"];

                boxScore.overtime = "";
                boxScore.quarter = "";
                boxScore.time = "0:00";
                boxScore.gameOver = false;
                for (i = 0; i < boxScore.teams.length; i++) {
                    // Team metadata
                    boxScore.teams[i].abbrev = g.teamAbbrevsCache[boxScore.teams[i].tid];
                    boxScore.teams[i].region = g.teamRegionsCache[boxScore.teams[i].tid];
                    boxScore.teams[i].name = g.teamNamesCache[boxScore.teams[i].tid];

				//	console.log("boxScore.teams[i].ptsQtrs : "+boxScore.teams[i].ptsQtrs );
                    boxScore.teams[i].ptsQtrs = [0,0,0,0,0,0,0,0];
                    for (s = 0; s < resetStats.length; s++) {
							boxScore.teams[i][resetStats[s]] = 0;
                    }
                    for (j = 0; j < boxScore.teams[i].players.length; j++) {
                        // Fix for players who were hurt this game - don't show right away!
                        if (boxScore.teams[i].players[j].injury.type !== "Healthy" && boxScore.teams[i].players[j].min > 0) {
                            boxScore.teams[i].players[j].injury = {type: "Healthy", gamesRemaining: 0};
                        }

                        for (s = 0; s < resetStats.length; s++) {						
							if (resetStats[s] == "champPicked") {
								boxScore.teams[i].players[j][resetStats[s]] = "";
							} else {
								boxScore.teams[i].players[j][resetStats[s]] = 0;
							}						
                        }

                        if (j < 5) {
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

    function uiFirst() {
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
		var fullChampName;
		
        if (inputs.playByPlay !== undefined && inputs.playByPlay.length > 0) {
            events = inputs.playByPlay;
            overtimes = 0;

            processToNextPause = function () {
                var e, i, ptsQtrs, stop, text, l,t;

                stop = false;
                while (!stop && events.length > 0) {
                    text = null;

                    e = events.shift();

				/*	console.log(e.type);
					console.log(e.text)
					console.log(e.t);
					console.log(vm.boxScore.teams()[0].players()[0]["userID"]());*/
//                      vm.boxScore.teams()[e.t].players()[e.p][e.s]("test");
                  //    vm.boxScore.teams()["champPicked"].players()[e.p][e.s]("test");
				  
				  // this worked to reset:
								//boxScore.teams[i].players[j][resetStats[s]] = "";
/*					  var fullText = e.text;
					  
					  var n = fullText.split(" ");

					  if (n[n.length - 2] = "picked") {
    					for (l = 0; l < 5; l++) {		
							for (t = 0; t < 2; t++) {		
								if  (vm.boxScore.teams()[t].players()[l]["userID"]() == n[n.length - 3]) {
									vm.boxScore.teams()[t].players()[l]["champPicked"](n[n.length - 1]);
								}
							}
						}
					  } */


					

                 //   vm.boxScore.teams()[e.t].players()[e.p][e.s](e.text);
					
                    if (e.type === "text") {
                        if (e.t === 0 || e.t === 1) {
                            text = e.time + " - " + vm.boxScore.teams()[e.t].abbrev() + " - " + e.text;
                        } else {
                            text = e.text;
                        }

                        // Show score after scoring plays
                        if (text.indexOf("made") >= 0) {
                            text += " (" + vm.boxScore.teams()[0].pts() + "-" + vm.boxScore.teams()[1].pts() + ")";
                        }
                        if (text.indexOf(" Tower") >= 0) {
						    if (e.t===0) {
								text += "<b> Tower (" + (vm.boxScore.teams()[0].pf()+1) + "-" + vm.boxScore.teams()[1].pf() + ") </b>";
							} else {
								text += "<b> Tower (" + vm.boxScore.teams()[0].pf() + "-" + (vm.boxScore.teams()[1].pf()+1) + ") </b>";
							}
                        } else  if (text.indexOf("the Dragon") >= 0) {
							if (e.t===0) {
								text += "<b> Dragon (" + (vm.boxScore.teams()[0].drb()+1) + "-" + vm.boxScore.teams()[1].drb() + ") </b>";
							} else {
								text += "<b> Dragon (" + vm.boxScore.teams()[0].drb() + "-" + (vm.boxScore.teams()[1].drb()+1) + ") </b>";
							}
													
                        } else  if (text.indexOf("the Baron") >= 0) {
							if (e.t===0) {
								text += "<b> Baron (" + (vm.boxScore.teams()[0].tov()+1) + "-" + vm.boxScore.teams()[1].tov() + ") </b>";
							} else {
								text += "<b> Baron (" + vm.boxScore.teams()[0].tov() + "-" + (vm.boxScore.teams()[1].tov()+1) + ") </b>";
							}
                        } else  if ((text.indexOf("killing") >= 0) || (text.indexOf("killed") >= 0)) {
							if (e.t===0) {
								text += "<b> Kills (" + (vm.boxScore.teams()[0].fg()+1) + "-" + vm.boxScore.teams()[1].fg() + ") </b>";
							} else {
								text += "<b> Kills (" + vm.boxScore.teams()[0].fg() + "-" + (vm.boxScore.teams()[1].fg()+1) + ") </b>";
							}
													
													
						}                     				
						
						
                        if (text.indexOf("destroyed the Nexus") >= 0) {
                            text += ".<b>  " + vm.boxScore.teams()[e.t].name()+" has won the game. </b>";
						}

                       if (text.indexOf("Outer Tower") >= 0) {
                             ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
					//		 console.log("e.amt: "+e.amt);
                             ptsQtrs[0] += 1;
                             vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                        }						
						
                      if (text.indexOf("Dragon") >= 0) {
                             ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
					//		 console.log("e.amt: "+e.amt);
                             ptsQtrs[6] += 1;
                             vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                        }	
						
                      if (text.indexOf("Baron") >= 0) {
                             ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
					//		 console.log("e.amt: "+e.amt);
                             ptsQtrs[7] += 1;
                             vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                        }	
						
                       if (text.indexOf("Inner Tower") >= 0) {
                             ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
						//	 console.log("e.amt: "+e.amt);
                             ptsQtrs[1] += 1;
                             vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                        }								
                       if (text.indexOf("Inhibitor Tower") >= 0) {
                             ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
						//	 console.log("e.amt: "+e.amt);
                             ptsQtrs[2] += 1;
                             vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                        } else  if (text.indexOf("Inhibitor") >= 0) {
                             ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
						//	 console.log("e.amt: "+e.amt);
                             ptsQtrs[3] += 1;
                             vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
								if (e.t===0) {
									text += "<b> Inhibitor (" + (vm.boxScore.teams()[0].fgaLowPost()+1) + "-" + vm.boxScore.teams()[1].fgaLowPost() + ") </b>";
								} else {
									text += "<b> Inhibitor (" + vm.boxScore.teams()[0].fgaLowPost() + "-" + (vm.boxScore.teams()[1].fgaLowPost()+1) + ") </b>";
								}							 
                        }									
                       if (text.indexOf("Nexus Tower") >= 0) {
                             ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
						//	 console.log("e.amt: "+e.amt);
                             ptsQtrs[4] += 1;
                             vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                        } else if (text.indexOf("Nexus") >= 0) {
                             ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
						//	 console.log("e.amt: "+e.amt);
                             ptsQtrs[5] += 1;
                             vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                        }		
						
                        if (text.indexOf("picked") >= 0) {
						    var fullText = e.text;
							var n = fullText.split(" ");
							
							/*	    console.log(n[n.length - 4]);
								    console.log(n[n.length - 3]);									
								    console.log(n[n.length - 2]);
								    console.log(n[n.length - 1]);							*/
							for (l = 0; l < 5; l++) {		
								for (t = 0; t < 2; t++) {		
                                     
									if  (vm.boxScore.teams()[t].players()[l]["userID"]() == n[n.length - 3]) {
										vm.boxScore.teams()[t].players()[l]["champPicked"](n[n.length - 1]);
							//	    console.log(t+" "+l+" "+vm.boxScore.teams()[t].players()[l]["userID"]()+" "+ n[n.length - 3]+" "+ vm.boxScore.teams()[t].players()[l]["champPicked"]());									
										t = 2;
										l = 5;
									}
								}
								//console.log(t+" "+l);
								if (t==2 && l ==4)	{
								/*console.log("COULDNT FIND IT");
								    console.log(n[n.length - 4]);
								    console.log(n[n.length - 3]);									
								    console.log(n[n.length - 2]);
								    console.log(n[n.length - 1]);									*/
									
									for (l = 0; l < 5; l++) {		
										for (t = 0; t < 2; t++) {		
								//    console.log(vm.boxScore.teams()[t].players()[l]["userID"]() );									

											if  (vm.boxScore.teams()[t].players()[l]["userID"]() == n[n.length - 4] ) {
											    fullChampName = n[n.length - 2] +" "+ n[n.length - 1];
												vm.boxScore.teams()[t].players()[l]["champPicked"](fullChampName);
												t = 2;
												l = 5;
											}
										}
									}						
								
								}
							}						

						
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
                        //if (e.s === "pts") {
                    /*    if (e.s === "fgaLowPost") {
						
                            // This is a hack because array elements are not made observable by default in the Knockout mapping plugin and I didn't want to write a really ugly mapping function.
                            ptsQtrs = vm.boxScore.teams()[e.t].ptsQtrs();
							//console.log("ptsQtrs.length: "+ptsQtrs.length);
                            if (ptsQtrs.length <= e.qtr) {
                                // Must be overtime! This updates ptsQtrs too.
                                vm.boxScore.teams()[0].ptsQtrs.push(0);
                                vm.boxScore.teams()[1].ptsQtrs.push(0);

                                if (ptsQtrs.length > 4) {
                                    overtimes += 1;
                                    if (overtimes === 1) {
                                        vm.boxScore.overtime(" (OT)");
                                    } else if (overtimes > 1) {
                                        vm.boxScore.overtime(" (" + overtimes + "OT)");
                                    }
                                    vm.boxScore.quarter(helpers.ordinal(overtimes) + " overtime");
                                } else {
                                    vm.boxScore.quarter(helpers.ordinal(ptsQtrs.length) + " quarter");
                                }
                            }
							console.log("e.qtr: "+e.qtr);
							console.log("e.amt: "+e.amt);
                            ptsQtrs[e.qtr] += e.amt;
                            vm.boxScore.teams()[e.t].ptsQtrs(ptsQtrs);
                        }*/

                        // Everything else
                        if (e.s === "drb") {
//                            vm.boxScore.teams()[e.t].players()[e.p][e.s](vm.boxScore.teams()[e.t].players()[e.p][e.s] + e.amt);
 //                           vm.boxScore.teams()[e.t][e.s](vm.boxScore.teams()[e.t][e.s] + e.amt);
                            vm.boxScore.teams()[e.t].players()[e.p][e.s](vm.boxScore.teams()[e.t].players()[e.p][e.s]() + e.amt);
                            vm.boxScore.teams()[e.t][e.s](vm.boxScore.teams()[e.t][e.s]() + e.amt);
                        } else if (e.s === "orb") {
                    //        vm.boxScore.teams()[e.t].players()[e.p].trb(vm.boxScore.teams()[e.t].players()[e.p].trb() + e.amt);
                     //       vm.boxScore.teams()[e.t].trb(vm.boxScore.teams()[e.t].trb() + e.amt);
                            vm.boxScore.teams()[e.t].players()[e.p][e.s](vm.boxScore.teams()[e.t].players()[e.p][e.s]() + e.amt);
                            vm.boxScore.teams()[e.t][e.s](vm.boxScore.teams()[e.t][e.s]() + e.amt);
//                        } else if (e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" || e.s === "pts") {
                        } else if (e.s === "champPicked") {
                    //        vm.boxScore.teams()[e.t].players()[e.p].trb(vm.boxScore.teams()[e.t].players()[e.p].trb() + e.amt);
                     //       vm.boxScore.teams()[e.t].trb(vm.boxScore.teams()[e.t].trb() + e.amt);

                            vm.boxScore.teams()[e.t].players()[e.p][e.s](e.amt);
                            //vm.boxScore.teams()[e.t].players()[e.p][e.s](vm.boxScore.teams()[e.t].players()[e.p][e.s]() + e.amt);
//                        } else if (e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" || e.s === "pts") {
                        } else if (e.s ===  "fgaAtRim" || e.s ===  "fgAtRim" || e.s ===  "fgpAtRim" || e.s === "fgp" || e.s === "min" || e.s === "trb" ||e.s === "oppJM" || e.s === "fgaLowPost" || e.s === "fgLowPost" || e.s === "fgaMidRange" || e.s === "fgMidRange" || e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" ) {
				//		console.log(e.s);
                            vm.boxScore.teams()[e.t].players()[e.p][e.s](vm.boxScore.teams()[e.t].players()[e.p][e.s]() + e.amt);
                            vm.boxScore.teams()[e.t][e.s](vm.boxScore.teams()[e.t][e.s]() + e.amt);
						}
						
                    }
                }

                if (text !== null) {
                    vm.playByPlay.unshift(text);
                }

                if (events.length > 0) {
                    setTimeout(processToNextPause, 4000 / Math.pow(1.2, vm.speed()));
                } else {
                  //  vm.boxScore.time("0:00");
                    vm.boxScore.gameOver(true);
                }
            };

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