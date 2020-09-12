/**get
 * @name views.roster
 * @namespace Current or historical rosters for every team. Current roster for user's team is editable.
 */
define(["dao", "globals", "ui", "core/league", "core/player", "core/season", "core/team", "core/trade", "lib/bluebird", "lib/knockout", "lib/jquery", "views/components", "util/bbgmView", "util/helpers"], function (dao, g, ui, league, player, season, team, trade, Promise, ko, $, components, bbgmView, helpers) {


    "use strict";

    var mapping;

    function highlightHandles(offDefK) {
        var i;
		
        i = 0;
        if (offDefK === "off" ) {
            $("#roster-" + offDefK + "-active tbody").children().each(function () {
                var tr;

                // Skip first, it's placeholder
                if (i === 0) {
                    i++;
                    return;
                }

                tr = $(this);
                if (i <= 8) {
                    // Because of CSS specificity issues, hard code color
                    //tr.find("td:first").removeClass("btn-info").addClass("btn-primary");
                    tr.find("td:first").css("background-color", "#428bca");
                } else {
                    //tr.find("td:first").removeClass("btn-primary").addClass("btn-info");
                    tr.find("td:first").css("background-color", "#5bc0de");
                }
                if (i === 8) {
                    tr.addClass("separator");
                } else {
                    tr.removeClass("separator");
                }
                i++;
            });
        } else {
            $("#roster-" + offDefK + "-active tbody").children().each(function () {
                var tr;

                // Skip first, it's placeholder
                if (i === 0) {
                    i++;
                    return;
                }

                tr = $(this);
                if (i <= 5) {
                    // Because of CSS specificity issues, hard code color
                    //tr.find("td:first").removeClass("btn-info").addClass("btn-primary");
                    tr.find("td:first").css("background-color", "#428bca");
                } else if (i <= 6) {
                    // Because of CSS specificity issues, hard code color
                    //tr.find("td:first").removeClass("btn-info").addClass("btn-primary");
                    tr.find("td:first").css("background-color", "#2E64FE");
                } else {
                    //tr.find("td:first").removeClass("btn-primary").addClass("btn-info");
                    tr.find("td:first").css("background-color", "#5bc0de");
                }
                if ((i === 5) || (i === 6)) {
                    tr.addClass("separator");
                } else {
                    tr.removeClass("separator");
                }
                i++;
            });
        }
        i = 0;
        $("#roster-" + offDefK + "-inactive tbody").children().each(function () {
            var tr;

            // Skip first, it's placeholder
            if (i === 0) {
                i++;
                return;
            }

            tr = $(this);
            tr.find("td:first").css("background-color", "#EFF2FB");
            tr.removeClass("separator");
            i++;
        });
		
		//		console.log("highlightHandles");
		
		
		
		
    }

      function doReorder(active, sortedPids,  vm) {
        var tx;

       tx = dao.tx("players", "readwrite");
				console.log(vm.players.off.active().length);
	   
	   dao.players.iterate({
			ot: tx,
			index: "tid",
			key: g.userTid,
			callback: function (p) {
				var i, j, players;
	  
				for (i = 0; i < sortedPids.length; i++) {
                    if (sortedPids[i] === p.pid) {
                        // Set active and rosterOrder in database and viewmodel

                        // Find current spot in viewmodel
                        // Ultimately this would be better if it moved items between active and inactive lists, but I am lazy
                        players = vm.players[p.offDefK].active().concat(vm.players[p.offDefK].inactive());
                        for (j = 0; j < players.length; j++) {
                            if (players[j].pid() === p.pid) {
                                break;
                            }
                        }

                        // Set rosterOrder
                        if (p.rosterOrder !== i) {
                            p.rosterOrder = i;
                            players[j].rosterOrder(i);
                        }

                        // Set active
                        if (p.active !== active) {
                            p.active = active;
                            players[j].active(i);
                        }

                        break;
                    }
                }			
			
				
				return p;
			}
		});	   
	   
 

        return tx.complete().then(function () {
            league.updateLastDbChange();
        });
    }
	

    function doRelease(pid, justDrafted) {
        var tx;

        tx = dao.tx(["players", "releasedPlayers", "teams"], "readwrite");

        return dao.players.count({
            ot: tx,
            index: "tid",
            key: g.userTid
        }).then(function (numPlayersOnRoster) {
            if (numPlayersOnRoster <= 25) {
                return "You must keep at least 25 players on your roster.";
            }

            return dao.players.get({ot: tx, key: pid}).then(function (p) {
                // Don't let the user update CPU-controlled rosters
                if (p.tid === g.userTid) {
                    player.release(tx, p, justDrafted);
                    return tx.complete().then(function () {
                        league.updateLastDbChange();
                    });
                }

                return "You aren't allowed to do this.";
            });
        });
    }

    function editableChanged(offDefK, editable, vm) {
        var rosterTbody;

        rosterTbody = $("#roster-" + offDefK + "-active tbody, #roster-" + offDefK + "-inactive tbody");
        if (!rosterTbody.is(":ui-sortable")) {
            // The first time editableChanged is called, set up sorting, but disable it by default
            rosterTbody.sortable({
                helper: function (e, ui) {
                    // Return helper which preserves the width of table cells being reordered
                    ui.children().each(function () {
                        $(this).width($(this).width());
                    });
                    return ui;
                },
                cursor: "move",
                update: function (e, ui) {
                    var i, sortedPids;

                    sortedPids = $(this).sortable("toArray", {attribute: "data-pid"});
                    for (i = 0; i < sortedPids.length; i++) {
                        sortedPids[i] = parseInt(sortedPids[i], 10);
                    }

                    doReorder(this.dataset.active === "1",sortedPids, vm).then(highlightHandles(offDefK));

                },
                handle: ".roster-handle",
                disabled: true,
                connectWith: ".roster-" + offDefK + " tbody",
                items: ">*:not(.roster-sort-disabled)" // http://stackoverflow.com/questions/3751436/jquery-ui-sortable-unable-to-drop-tr-in-empty-tbody
            });
        }

        if (editable) {
            rosterTbody.sortable("enable");//.disableSelection();
        } else {
            rosterTbody.sortable("disable");//.enableSelection();
        }
	//	console.log("editableChanged");
    }

    function get(req) {
        var inputs, out;

        // Fix broken links
        if (req.params.abbrev === "FA") {
            return {
                redirectUrl: helpers.leagueUrl(["free_agents"])
            };
        }

        inputs = {};

        out = helpers.validateAbbrev(req.params.abbrev);
        inputs.tid = out[0];
        inputs.abbrev = out[1];
        inputs.season = helpers.validateSeason(req.params.season);
			//	console.log("get");
        return inputs;
    }

    function InitViewModel() {
        this.abbrev = ko.observable();
        this.season = ko.observable();
        this.payroll = ko.observable();
        this.salaryCap = ko.observable();
        this.team = {
            cash: ko.observable(),
            name: ko.observable(),
            region: ko.observable()
        };
        this.players = {
            off: {
                active: ko.observableArray(),
                inactive: ko.observableArray()
            },
            def: {
                active: ko.observableArray(),
                inactive: ko.observableArray()
            },
            k: {
                active: ko.observableArray(),
                inactive: ko.observableArray()
            }
        };
        this.showTradeFor = ko.observable();
        this.editable = ko.observable();
		

        // Throttling these makes transient error messages like "Message: ReferenceError: isCurrentSeason is undefined". Not throttling doesn't seem to induce any lag.
        this.numRosterSpots = ko.computed(function () {
//            return 15 - this.players.length;
//            return 53 - this.players.off.active().length;
//            return 0 - this.players.off.active().length;
            return 40 - this.players.off.active().length - this.players.def.active().length - this.players.k.active().length- this.players.off.inactive().length - this.players.def.inactive().length - this.players.k.inactive().length
        }, this);
        this.numActiveSpots = ko.computed(function () {
            var count;
            count = 25; // Total number allowed

            // Needs this ugly mess instead of a simple thing like numRosterSpots because the active() observables are what's updated, not the actual membership in the active/inactive arrays
            ["off", "def", "k"].forEach(function (offDefK) {
                ["active", "inactive"].forEach(function (activeStatus) {
                    this.players[offDefK][activeStatus]().forEach(function (player) {
                        if (player.active()) {
                            count -= 1;
                        }
                    }.bind(this));
                }.bind(this));
            }.bind(this));

            return count;
        }, this);
		
        this.isCurrentSeason = ko.computed(function () {
            return g.season === this.season();
        }, this);
		
        this.ptChange = function (p) {
       // this.ptChange = function (p) {			
            var pid, ptModifier;

            // NEVER UPDATE AI TEAMS
            // This shouldn't be necessary, but sometimes it gets triggered
            if (this.team.tid() !== g.userTid) {
                return;
            }

            // Update ptModifier in database
            pid = p.pid();
            ptModifier = parseFloat(p.ptModifier());
				//	console.log(ptModifier);			
            dao.players.get({key: pid}).then(function (p) {
                if (p.ptModifier !== ptModifier) {
                    p.ptModifier = ptModifier;
				//	console.log(ptModifier);
                    dao.players.put({value: p}).then(function () {
                        league.updateLastDbChange();
                    });
                }
            });
        }.bind(this);		
		//		console.log("InitViewModel");
    }

   function ChangeViewModel() {
  // function InitViewModel() {	   
     //   this.abbrev = ko.observable();
    //    this.season = ko.observable();
   //     this.payroll = ko.observable();
   //     this.salaryCap = ko.observable();
   /*     this.team = {
            cash: ko.observable(),
            name: ko.observable(),
            region: ko.observable()
        };*/
        this.players = {
            off: {
                active: ko.observableArray(),
                inactive: ko.observableArray()
            },
            def: {
                active: ko.observableArray(),
                inactive: ko.observableArray()
            },
            k: {
                active: ko.observableArray(),
                inactive: ko.observableArray()
            }
        };
        this.showTradeFor = ko.observable();
        this.editable = ko.observable();
		

        // Throttling these makes transient error messages like "Message: ReferenceError: isCurrentSeason is undefined". Not throttling doesn't seem to induce any lag.
        this.numRosterSpots = ko.computed(function () {
//            return 15 - this.players.length;
//            return 53 - this.players.off.active().length;
//            return 0 - this.players.off.active().length;
            return 40 - this.players.off.active().length - this.players.def.active().length - this.players.k.active().length- this.players.off.inactive().length - this.players.def.inactive().length - this.players.k.inactive().length
        }, this);
        this.numActiveSpots = ko.computed(function () {
            return 25 - this.players.off.active().length - this.players.def.active().length - this.players.k.active().length
        }, this).extend({throttle: 100});
		
        this.isCurrentSeason = ko.computed(function () {
            return g.season === this.season();
        }, this);

					

    }	
	
	
	
	
	
	
	
    mapping = {
        /*players: {
            key: function (data) {
                return ko.unwrap(data.pid);
            }
        }*/
    };

    function updateRoster(inputs, updateEvents, vm) {
        var vars, tx;

        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && (updateEvents.indexOf("gameSim") >= 0 || updateEvents.indexOf("playerMovement") >= 0)) || inputs.abbrev !== vm.abbrev() || inputs.season !== vm.season()) {
            
            vars = {
                abbrev: inputs.abbrev,
                season: inputs.season,
                editable: inputs.season === g.season && inputs.tid === g.userTid,
                salaryCap: g.salaryCap / 1000,
                showTradeFor: inputs.season === g.season && inputs.tid !== g.userTid,
               ptModifiers: [
                   {text: "", ptModifier: "1"},
               //     {text: "SP", ptModifier: 2},
                    {text: "C", ptModifier: "3"},
                    {text: "1B", ptModifier: "4"},
                    {text: "2B ", ptModifier: "5"},
                    {text: "SS", ptModifier: "6"},
                    {text: "3B", ptModifier: "7"},
                    {text: "LF", ptModifier: "8"},
                    {text: "RF", ptModifier: "9"},
                    {text: "CF", ptModifier: "10"}
             /*       {text: "CL", ptModifier: 11},
                    {text: "SP1", ptModifier: 12},
                    {text: "SP2", ptModifier: 13},
                    {text: "SP3", ptModifier: 14},
                    {text: "SP4", ptModifier: 15},
                    {text: "SP5", ptModifier: 16}*/
                ],
                battingOrder: [
                    {text: "", battingOrder: "0"},
                    {text: "1st", battingOrder: "21"},
                    {text: "2nd", battingOrder: "22"},
                    {text: "3rd", battingOrder: "23"},
                    {text: "4th ", battingOrder: "24"},
                    {text: "5th", battingOrder: "25"},
                    {text: "6th", battingOrder: "26"},
                    {text: "7th", battingOrder: "27"},
                    {text: "8th", battingOrder: "28"}
                ]						
				
                /*ptModifiers: [
                    {text: "0", ptModifier: 0},
                    {text: "-", ptModifier: 0.75},
                    {text: " ", ptModifier: 1},
                    {text: "+", ptModifier: 1.25},
                    {text: "++", ptModifier: 1.75}
                ]*/
            };

            tx = dao.tx(["players", "playerStats", "releasedPlayers", "schedule", "teams"]);

            return team.filter({
                season: inputs.season,
                tid: inputs.tid,
                attrs: ["tid", "region", "name", "strategy", "imgURL"],
                seasonAttrs: ["profit", "won", "lost", "playoffRoundsWon"],
                ot: tx
            }).then(function (t) {
                var attrs, ratings, stats;

                vars.team = t;

                attrs = ["pid", "tid", "draft", "name", "pos", "age", "contract", "cashOwed", "rosterOrder", "injury", "ptModifier", "watch", "offDefK", "active", "gamesUntilTradable"];  // tid and draft are used for checking if a player can be released without paying his salary
                ratings = ["ovr", "pot", "dovr", "dpot", "skills"];
                stats = ["gp", "min", "pts", "trb", "ast", "per","fga","blk","fta","fgAtRim","fgaAtRim","pf","stl","war","save","winP", "yearsWithTeam"];
				
//                stats = ["gp", "min", "pts", "trb", "ast", "per","qbr","ruya","reyc","olrmpa","fgAtRim","fgaAtRim","fgpAtRim","fgLowPost","fgaLowPost","fgpLowPost","punta","puntty","punttb","derpatp","fg","fga","fgp","stl","pya","blk","inter","drb","orb","olr","olp","fgaMidRange","derpa","der","dep","intery","dec"]; 

                if (inputs.season === g.season) {
                    // Show players currently on the roster
                    return Promise.all([
                        season.getSchedule({ot: tx}),
                        dao.players.getAll({
                            ot: tx,
                            index: "tid",
                            key: inputs.tid,
                            statsSeasons: [inputs.season],
                            statsTid: inputs.tid
                        }),
                        team.getPayroll(tx, inputs.tid).get(0)
                    ]).spread(function (schedule, players, payroll) {
                        var i, numGamesRemaining;

                        // numGamesRemaining doesn't need to be calculated except for g.userTid, but it is.
                        numGamesRemaining = 0;
                        for (i = 0; i < schedule.length; i++) {
                            if (inputs.tid === schedule[i].homeTid || inputs.tid === schedule[i].awayTid) {
                                numGamesRemaining += 1;
                            }
                        }


                            players = player.filter(players, {
                                attrs: attrs,
                                ratings: ratings,
                                stats: stats,
                                season: inputs.season,
                                tid: inputs.tid,
                                showNoStats: true,
                                showRookies: true,
                                fuzz: true,
                                numGamesRemaining: numGamesRemaining
                            });
                            players.sort(function (a, b) {  return a.rosterOrder - b.rosterOrder; });

							// Add untradable property
							players = trade.filterUntradable(players);
							
							
                            for (i = 0; i < players.length; i++) {							
								// Can release from user's team, except in playoffs because then no free agents can be signed to meet the minimum roster requirement
								if (inputs.tid === g.userTid && (g.phase !== g.PHASE.PLAYOFFS  || players.length > 40)) {
                                    players[i].canRelease = true;
                                } else {
                                    players[i].canRelease = false;
                                }

                                // Convert ptModifier to string so it doesn't cause unneeded knockout re-rendering
                                players[i].ptModifier = String(players[i].ptModifier);
								
								
 							}
                            vars.players = {
                                off: {
                                    active: players.filter(function (p) { return p.offDefK === "off" && p.active; }),
                                    inactive: players.filter(function (p) { return p.offDefK === "off" && !p.active; }),
                                },
                                def: {
                                    active: players.filter(function (p) { return p.offDefK === "def" && p.active; }),
                                    inactive: players.filter(function (p) { return p.offDefK === "def" && !p.active; }),
                                },
                                k: {
                                    active: players.filter(function (p) { return p.offDefK === "k" && p.active; }),
                                    inactive: players.filter(function (p) { return p.offDefK === "k" && !p.active; }),
                                }
                            };


                                vars.payroll = payroll / 1000;

                        return vars;
                    });
                } else {
                    // Show all players with stats for the given team and year
                    // Needs all seasons because of YWT!
                    return dao.players.getAll({
                        ot: tx,
                        index: "statsTids",
                        key: inputs.tid,
                        statsSeasons: "all",
                        statsTid: inputs.tid
                    }).then(function (players) {
                        var i;

                        players = player.filter(players, {
                            attrs: attrs,
                            ratings: ratings,
                            stats: stats,
                            season: inputs.season,
                            tid: inputs.tid,
                            fuzz: true
                        });
                        players.sort(function (a, b) {  return b.stats.gp * b.stats.min - a.stats.gp * a.stats.min; });

                        for (i = 0; i < players.length; i++) {
                            players[i].age = players[i].age - (g.season - inputs.season);
                            players[i].canRelease = false;
                        }

						vars.players = {
							off: {
								active: players.filter(function (p) { return p.offDefK === "off" && p.active; }),
								inactive: players.filter(function (p) { return p.offDefK === "off" && !p.active; }),
							},
							def: {
								active: players.filter(function (p) { return p.offDefK === "def" && p.active; }),
								inactive: players.filter(function (p) { return p.offDefK === "def" && !p.active; }),
							},
							k: {
								active: players.filter(function (p) { return p.offDefK === "k" && p.active; }),
								inactive: players.filter(function (p) { return p.offDefK === "k" && !p.active; }),
							}
						};
                        vars.payroll = null;

                        return vars;
                    });
                }
            });
        }
    }

    function uiFirst(vm) {
        // Release and Buy Out buttons, which will only appear if the roster is editable
        // Trade For button is handled by POST
		

		var players;
        players = vm.players.off.active();
		

		
		
        $(".roster").on("click", "button", function (event) {
            var justDrafted, i,j,iOrJ, pid, players, releaseMessage, tr;
			var k,l,m,n;
			
			
            pid = parseInt(this.parentNode.parentNode.dataset.pid, 10);
//            players = vm.players.off.active();
    //        players = vm.players;
            players = vm.players.def.active();
			
		//	console.log(players.length);
			iOrJ = 0;
		//	console.log("i: "+players.length)
			for (i = 0; i < players.length; i++) {
				//	 console.log("i: "+i);
                if (players[i].pid() === pid) {
					iOrJ = i;
					break;
                }
				
				if (i == players.length-1) {
					players = vm.players.off.active();
		//	 console.log("j: "+players.length)
					for (j = 0; j < players.length; j++) {
					//	console.log("j: "+j);
						if (players[j].pid() === pid) {
							iOrJ = j;
					//	console.log("found");						
							break;
						}
						
						if (j == players.length-1) {
							players = vm.players.off.inactive();
				//	 console.log("j: "+players.length)
							if (players.length>0) {
								for (k = 0; k < players.length; k++) {
								//	console.log("j: "+j);
									if (players[k].pid() === pid) {
										iOrJ = k;
								//	console.log("found");						
										break;
									}
									if (k == players.length-1) {
									
										players = vm.players.def.inactive();
							//	 console.log("j: "+players.length)
										if (players.length>0) {
											for (m = 0; m < players.length; m++) {
											//	console.log("j: "+j);
												if (players[m].pid() === pid) {
													iOrJ = m;
											//	console.log("found");						
													break;
												}
											}
									
										}	
									
									}									
								}
								

								
								
								
							} else {
							
								players = vm.players.def.inactive();
					//	 console.log("j: "+players.length)
								if (players.length>0) {
									for (m = 0; m < players.length; k++) {
									//	console.log("j: "+j);
										if (players[m].pid() === pid) {
											iOrJ = m;
									//	console.log("found");						
											break;
										}
									}
							
								}	
							}
						}
						
						
						
						
					}
					
					
					
					
					
				}
				
				
            }
		//	console.log(iOrj);
			i = iOrJ;
            if (this.dataset.action === "release") {
                // If a player was just drafted by his current team and the regular season hasn't started, then he can be released without paying anything
			//	console.log("players[9].tid() : "+players[0].tid());				
			//	console.log("i: "+i);
			//	console.log("players[i].tid() : "+players[i].tid());
                justDrafted = players[i].tid() === players[i].draft.tid() && ((players[i].draft.year() === g.season && g.phase >= g.PHASE.DRAFT) || (players[i].draft.year() === g.season - 1 && g.phase < g.PHASE.REGULAR_SEASON));
                if (justDrafted) {
                    releaseMessage = "Are you sure you want to release " + players[i].name() + "?  He will become a free agent and no longer take up a roster spot on your team. Because you just drafted him and the regular season has not started yet, you will not have to pay his contract.";
                } else {
                    releaseMessage = "Are you sure you want to release " + players[i].name() + "?  He will become a free agent and no longer take up a roster spot on your team, but you will still have to pay his salary (and have it count against the salary cap) until his contract expires in " + players[i].contract.exp() + ".";
                }
                if (window.confirm(releaseMessage)) {
                    tr = this.parentNode.parentNode;
                    doRelease(pid, justDrafted).then(function (error) {
                        if (error) {
                            alert("Error: " + error);
                        } else {
                            ui.realtimeUpdate(["playerMovement"]);
                        }
                    });
                }
            }
        });

		
		
        $("#roster-auto-sort").click(function () {
            var tx;			
            // This is a hack to force a UI update because the jQuery UI sortable roster reordering does not update the view model, which can cause the view model to think the roster is sorted correctly when it really isn't. (Example: load the roster, auto sort, reload, drag reorder it, auto sort -> the auto sort doesn't update the UI.) Fixing this issue would fix flickering.  
            vm.players.off.active([]);
            vm.players.off.inactive([]);
            vm.players.def.active([]);
            vm.players.def.inactive([]);
            vm.players.k.active([]);
            vm.players.k.inactive([]);

            tx = dao.tx("players", "readwrite");
            team.rosterAutoSort(tx, g.userTid);
			
            // Explicitly make sure writing is done for rosterAutoSort
            tx.complete().then(function () {
                league.updateLastDbChange();

                ui.realtimeUpdate(["playerMovement"]);
            });
        });

		
		
        ko.computed(function () {

            ui.title(vm.team.region() + " " + vm.team.name() + " " + "Roster - " + vm.season());
        }).extend({throttle: 1});

        ko.computed(function () {
            vm.players.off.active(); // Ensure this runs when vm.players.off changes.
            vm.players.off.inactive();
            if (vm.editable()) {
                highlightHandles("off");
            }
            editableChanged("off", vm.editable(), vm);
			
             //   active: ko.observableArray();
              //  inactive: ko.observableArray();
		//	ChangeViewModel();
		/*	this.players = {
            off: {
                active: ko.observableArray(),
                inactive: ko.observableArray()
            }
			};*/
			
        }).extend({throttle: 1});
        ko.computed(function () {
            vm.players.def.active(); // Ensure this runs when vm.players.def changes.
            vm.players.def.inactive();
            if (vm.editable()) {
                highlightHandles("def");
            }
            editableChanged("def", vm.editable(), vm);
        }).extend({throttle: 1});
        ko.computed(function () {
            vm.players.k.active(); // Ensure this runs when vm.players.k changes.
            vm.players.k.inactive();
            if (vm.editable()) {
                highlightHandles("k");
            }
            editableChanged("k", vm.editable(), vm);
        }).extend({throttle: 1});

        ko.computed(function () {
            var picture;
            picture = document.getElementById("picture");

            // If imgURL is not an empty string, use it for team logo on roster page
            if (vm.team.imgURL()) {
                picture.style.display = "inline";
                picture.style.backgroundImage = "url('" + vm.team.imgURL() + "')";
            }
        }).extend({throttle: 1});

		
        $("#help-roster-pt").popover({
            title: "Playing Time Modifier",
            html: true,
            content: "<p>Your coach will pick positions for you. However, you can override those by selecting a position</p>"
        });

        $("#help-roster-release").popover({
            title: "Release Player",
            html: true,
            content: "<p>To free up a roster spot, you can release a player from your team. You will still have to pay his salary (and have it count against the salary cap) until his contract expires (you can view your released players' contracts in your <a href=\"" + helpers.leagueUrl(["team_finances"]) + "\">Team Finances</a>).</p>However, if you just drafted a player and the regular season has not started yet, his contract is not guaranteed and you can release him for free."
       });

        $(".roster").on("change", "select", function () {
            var backgroundColor, color, pid, ptModifier;

			

            // Update select color
			
            // NEVER UPDATE AI TEAMS
            // This shouldn't be necessary, but sometimes it gets triggered
            if (vm.team.tid() !== g.userTid) {
                return;
            }


            // These don't work in Firefox, so do it manually
//            backgroundColor = $('option:selected', this).css('background-color');
//            color = $('option:selected', this).css('color');
            if (this.value === "1") {
                backgroundColor = "#ccc";
                color = "#000";
            } else if (this.value === "1.75") {
                backgroundColor = "#070";
                color = "#fff";
            } else if (this.value === "1.25") {
                backgroundColor = "#0f0";
                color = "#000";
            } else if (this.value === "0.75") {
                backgroundColor = "#ff0";
                color = "#000";
            } else if (this.value === "0") {
                backgroundColor = "#a00";
                color = "#fff";
            }

            this.style.color = color;
            this.style.backgroundColor = backgroundColor;

        });

        ui.tableClickableRows($("#roster-off-active"));
        ui.tableClickableRows($("#roster-off-inactive"));
		
		
		

           /* vm.players.off.active([]);
            vm.players.off.inactive([]);
            vm.players.def.active([]);
            vm.players.def.inactive([]);
            vm.players.k.active([]);
            vm.players.k.inactive([]);*/
					//	console.log("uiFirst");
				
		
		
		
		
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("roster-dropdown", ["teams", "seasons"], [vm.abbrev(), vm.season()], updateEvents);
					//	console.log("uiEvery");

        $(".roster select").change(); // Set initial bg colors
    }

    return bbgmView.init({
        id: "roster",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updateRoster],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});