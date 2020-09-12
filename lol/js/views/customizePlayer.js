/**
 * @name views.customizePlayer
 * @namespace Create a new custom player or customize an existing one.
 */
define(["dao", "globals", "ui", "core/finances", "core/league","data/champions2","core/champion", "core/player", "core/team", "lib/faces", "lib/knockout", "lib/knockout.mapping", "util/bbgmView", "util/helpers"], function (dao, g, ui, finances, league,champions,champion, player, team, faces, ko, komapping, bbgmView, helpers) {
    "use strict";

    var mapping;

    // Same as faces.generate, but round of long decimals
    function generateFace() {
        var face;

        face = faces.generate();
        face.fatness = helpers.round(face.fatness, 2);
        face.eyes[0].angle = helpers.round(face.eyes[0].angle, 1);
        face.eyes[1].angle = helpers.round(face.eyes[1].angle, 1);

        return face;
    }

    function get(req) {
        if (!g.godMode) {
            return {
                errorMessage: 'You can\'t customize players unless you enable <a href="' + helpers.leagueUrl(["god_mode"]) + '">God Mode</a>.'
            };
        }

        if (req.params.hasOwnProperty("pid")) {
            return {
                pid: parseInt(req.params.pid, 10)
            };
        }

        return {
            pid: null
        };
    }

    function InitViewModel() {
        var ratingKeys,ratingKeys2,i;

        this.p = {
            face: ko.observable(),
            ratings: ko.observableArray(),
            languages: ko.observableArray(),
     /*       languages[0]: ko.observableArray(),
            languages[1]: ko.observableArray(),
            languages[2]: ko.observableArray(),
            languages[3]: ko.observableArray(),*/
            /*champions: ko.observableArray(),
            champions[i]: {
                name: ko.observable(),
                skill: ko.observable()
            },*/			
            draft: {
                year: ko.observable()
            },
            born: {
                year: ko.observable()
            },
            loc: {
                year: ko.observable()
            },
        //    championAverage:  ko.observable(),				
            contract: {
                amount: ko.observable(),
                exp: ko.observable()
            }
        };
		
	
        this.positions = [];
		this.country = [];
		this.region = [];	

		
        // Used to kepe track of the TID for an edited player
        this.originalTid = ko.observable(null);


		
        // Easy access to ratings array, since it could have any number of entries and we only want the last one
        this.ratings = {};
        ratingKeys = ["pot", "hgt", "stre", "spd", "jmp", "endu", "ins", "dnk", "ft", "fg", "tp", "blk", "stl", "drb", "pss", "reb"];
        ratingKeys.forEach(function (ratingKey) {
            this.ratings[ratingKey] = ko.computed({
                read: function () {
                    // Critical: this will always call p.ratings() so it knows to update after player is loaded
                    if (this.p.ratings().length > 0) {
                        return this.p.ratings()[this.p.ratings().length - 1][ratingKey]();
                    }

                    return 0;
                },
                write: function (value) {
                    var rating;
                    rating = helpers.bound(parseInt(value, 10), 0, 100);
                    if (isNaN(rating)) { rating = 0; }
                    this.p.ratings()[this.p.ratings().length - 1][ratingKey](rating);
                },
                owner: this
            });
        }, this);

		
		
		
        // Set born.year based on age input
        this.age = ko.computed({
            read: function () {
                return g.season - this.p.born.year();
            },
            write: function (value) {
                var age;
                age = parseInt(value, 10);
                if (age !== age) { age = 20; } // NaN check
                this.p.born.year(g.season - age);
            },
            owner: this
        });

		
       // Set born.year based on age input
        this.language1 = ko.computed({
            read: function () {
				console.log(this.p.languages());				
				if (this.p.languages().length>0) {
					return this.p.languages()[0];
				} else {
					return "";					
				}
            },
            write: function (value) {
				//console.log(this.p.languages());						
				//if (this.p.languages().indexOf(value) >= 0) {
					
			//	} else {
					if (this.p.languages().length>0) {
						//this.p.languages[0](value);						
						this.p.languages()[0] = value;						
					} else {
						if (value == "") {
							
						} else {
							this.p.languages().push(value);					
						}
					}
			//	}
			
			

            },
            owner: this
        });		
		
        // Set born.year based on age input
        this.language2 = ko.computed({
            read: function () {
				if (this.p.languages().length>1) {
					return this.p.languages()[1];
				} else {
					return "";					
				}
            },
            write: function (value) {
				if (this.p.languages().length>1) {
					//this.p.languages()[1](value);
					this.p.languages()[1] = value;						
					
				} else {
					if (value == "") {
						
					} else {
						this.p.languages().push(value);					
					}
				}
            },
            owner: this
        });

       // Set born.year based on age input
        this.language3 = ko.computed({
            read: function () {
				if (this.p.languages().length>2) {
					return this.p.languages()[2];
				} else {
					return "";					
				}
            },
            write: function (value) {
				if (this.p.languages().length>2) {
					this.p.languages()[2] = value;											
					//this.p.languages()[2](value);
				} else {
					if (value == "") {
						
					} else {
						this.p.languages().push(value);					
					}
				}
            },
            owner: this
        });

       // Set born.year based on age input
        this.language4 = ko.computed({
            read: function () {
				if (this.p.languages().length>3) {
					return this.p.languages()[3];
				} else {
					return "";					
				}
            },
            write: function (value) {
				if (this.p.languages().length>3) {
					//this.p.languages()[3](value);
					this.p.languages()[3] = value;						
				} else {
					if (value == "") {
						
					} else {
						this.p.languages().push(value);					
					}
				}
            },
            owner: this
        });		
		
		
        // Contract stuff
        this.contract = {
            amount: ko.computed({
                read: function () {
                    return this.p.contract.amount() ;
                },
                write: function (value) {
                    var amount;
                    // Allow any value, even above or below normal limits, but round to $10k
//                    amount = helpers.round(100 * parseFloat(value)) * 10;
                    amount = helpers.round( parseFloat(value)) ;
                    if (isNaN(amount)) { amount = g.minContract; }
                    this.p.contract.amount(amount);
                },
                owner: this
            }),
            exp: ko.computed({
                read: function () {
                    return this.p.contract.exp();
                },
                write: function (value) {
                    var season;
                    season = parseInt(value, 10);
                    if (isNaN(season)) { season = g.season; }

                    // No contracts expiring in the past
                    if (season < g.season) {
                        season = g.season;
                    }

                    // If current season contracts already expired, then current season can't be allowed for new contract
                    if (season === g.season && g.phase >= g.PHASE.RESIGN_PLAYERS) {
                        season += 1;
                    }

                    this.p.contract.exp(season);
                },
                owner: this
            })
        };
    }

    mapping = {
        teams: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updateCustomizePlayer(inputs, updateEvents) {
        if (updateEvents.indexOf("firstRun") >= 0) {
            return team.filter({
                attrs: ["tid", "region", "name"],
                season: g.season
            }).then(function (teams) {
                var i, positions, seasonOffset, vars,country,region,languagesFirst,languagesRest;

                // Once a new draft class is generated, if the next season hasn't started, need to bump up year numbers
                if (g.phase < g.PHASE.FREE_AGENCY) {
                    seasonOffset = 0;
                } else {
                    seasonOffset = 1;
                }

                for (i = 0; i < teams.length; i++) {
                    teams[i].text = teams[i].region;
                }
                teams.unshift({
                    tid: g.PLAYER.RETIRED,
                    text: "Retired"
                });
                teams.unshift({
                    tid: g.PLAYER.UNDRAFTED_3,
                    text: (g.season + seasonOffset + 2) + " Prospect"
                });
                teams.unshift({
                    tid: g.PLAYER.UNDRAFTED_2,
                    text: (g.season + seasonOffset + 1) + " Prospect"
                });
                teams.unshift({
                    tid: g.PLAYER.UNDRAFTED,
                    text: (g.season + seasonOffset) + " Prospect"
                });
                teams.unshift({
                    tid: g.PLAYER.FREE_AGENT,
                    text: "Free Agent"
                });

                positions = ["TOP", "JGL", "MID", "ADC", "SUP"];
//                country = ["US","KR","CN", "DE", "RO", "ES", "SC", "GR", "AM", "BG", "ENG", "PL", "BE", "DK", "HU", "NO", "SE", "FR", "TW", "RU", "BR", "JP", "AU", "CL", "LatAmN", "LatAmS", "VN"];
                country = ["United States","Korea","China", "Taiwan", "Canada","Dominican Republic","Mexico","Austria","Armenia", "Belgium", "Bulgaria","Czech Republic", "Denmark", "England", "Estonia", "France","Finland","Germany", "Greece", "Hungary","Iceland","Ireland","Italy","Netherlands", "Norway","Portugal", "Poland", "Romania", "Scotland", "Spain", "Sweden","Switzerland","Latvia", "Russia","Ukraine", "Brazil", "Japan", "Australia","New Zealand", "Colombia", "Costa Rica", "Ecuador", "Panama", "Peru", "Puerto Rico", "Venezuela", "Argentina", "Chile", "Paraguay", "Uruguay","Israel","Turkey","United Arab Emirates","South Africa","Malaysia","Philippines","Singapore", "Thailand","Vietnam"];
                region = ["NA","EU","KR", "CN","TW","BR","CIG","CIS","JP","LatAm","OCE", "SEA","TR"];
                languagesFirst = ["English","Korean","Chinese","Spanish","German","French","Italian","Romanian","Greek","Armenian","Bulgarian","Dutch","Polish", "Danish","Finnish","Swedish","Hungarian","Norwegian","Icelandic","Russian","Czech","Portuguese","Japanese","Vietnamese","Turkish"];
                languagesRest = ["","English","Korean","Chinese","Spanish","German","French","Italian","Romanian","Greek","Armenian","Bulgarian","Dutch","Polish", "Danish","Finnish","Swedish","Hungarian","Norwegian","Icelandic","Russian","Czech","Portuguese","Japanese","Vietnamese","Turkish"];

                vars = {
                    appearanceOptions: ["Cartoon Face", "Image URL"],
                    faceOptions: {
                        eyes: [0, 1, 2, 3],
                        nose: [0, 1, 2],
                        mouth: [0, 1, 2, 3, 4],
                        hair: [0, 1, 2, 3, 4]
                    },
                    positions: positions,
                    country: country,
                    region: region,
                    languages1: languagesFirst,
                    languages2: languagesRest,
                    languages3: languagesRest,
                    languages4: languagesRest,
                    teams: teams
                };

                if (inputs.pid === null) {
                    // Generate new player as basis
                    return dao.teams.get({key: g.userTid}).then(function (t) {
					
						return dao.champions.getAll({
//							ot: tx
							ot: "champions"
						}).then(function (c) {
											
							return dao.championPatch.getAll({
										ot: "championPatch"
									}).then(function (cp) {
									/*		console.log("GOT HERE");
									
									console.log(c.length);
									console.log(cp.length);
									console.log(_.size(c));
									console.log(_.size(cpSorted));*/
									
										var i,j;
										var cpSorted;
										var topADC,topMID,topJGL,topTOP,topSUP;
										
										cpSorted = [];
										
										for (i = 0; i < _.size(cp); i++) {
											cpSorted.push({"champion": cp[i].champion,"cpid": cp[i].cpid,"rank": cp[i].rank,"role": cp[i].role});
										}					
										
										cpSorted.sort(function (a, b) { return a.rank - b.rank; });		
										

										topADC = [];
										topMID = [];
										topJGL = [];
										topTOP = [];
										topSUP = [];

										for (i = 0; i < _.size(cpSorted); i++) {
											if ((cpSorted[i].role == "ADC") && (topADC.length < 5) ) {
										//	   console.log(_.size(c));
												for (j = 0; j < _.size(c); j++) {
													if (c[j].name == cpSorted[i].champion) {
														topADC.push(c[j].hid);
														j = _.size(c);
													}
												}
											}
											if ((cpSorted[i].role == "Middle") && (topMID.length < 5) ) {
							//				  topMID.push(cpSorted[i].cpid);
												for (j = 0; j < _.size(c); j++) {
													if (c[j].name == cpSorted[i].champion) {
														topMID.push(c[j].hid);
														j = _.size(c);
													}
												}
											}
											if ((cpSorted[i].role == "Jungle") && (topJGL.length < 5) ) {
							//				  topJGL.push(cpSorted[i].cpid);
												for (j = 0; j < _.size(c); j++) {
													if (c[j].name == cpSorted[i].champion) {
														topJGL.push(c[j].hid);
														j = _.size(c);
													}
												}
											}
											if ((cpSorted[i].role == "Top") && (topTOP.length < 5) ) {
							//				  topTOP.push(cpSorted[i].cpid);
												for (j = 0; j < _.size(c); j++) {
													if (c[j].name == cpSorted[i].champion) {
														topTOP.push(c[j].hid);
														j = _.size(c);
													}
												}
											}
											if ((cpSorted[i].role == "Support") && (topSUP.length < 5) ) {
							//				  topSUP.push(cpSorted[i].cpid);
												for (j = 0; j < _.size(c); j++) {
													if (c[j].name == cpSorted[i].champion) {
														topSUP.push(c[j].hid);
														j = _.size(c);
													}
												}

											}
										
										}											
									
									
									 /*console.log(topADC);
									console.log(topMID);
									console.log(topJGL);
									console.log(topTOP);
									console.log(topSUP);									*/
//										return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3,null,null,c,topADC,topMID,topJGL,topTOP,topSUP);
							
							
/*							return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3,null,null,t).then(function() {


							});						*/
							
										var p, scoutingRank;

										/*var i 
										for (i = 0; i < c.length; i++) {								
											cDefault[i] = c;
											dao.champions.add({ot: tx, value: c});
										}*/	
										
										
										scoutingRank = finances.getRankLastThree(t, "expenses", "scouting");

										
										
											//return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3,null,null,c);
											
											
				/*							return draft.genPlayers(null, g.PLAYER.UNDRAFTED_3,null,null,t).then(function() {
											});						*/
										
										
										
										
										p = player.generate(g.PLAYER.FREE_AGENT,
														20,
														null,
														50,
														50,
														g.season,
														false,
														scoutingRank,
														c,topADC,topMID,topJGL,topTOP,topSUP);

										p.face.fatness = helpers.round(p.face.fatness, 2);
										p.face.eyes[0].angle = helpers.round(p.face.eyes[0].angle, 1);
										p.face.eyes[1].angle = helpers.round(p.face.eyes[1].angle, 1);

										vars.appearanceOption = "Cartoon Face";
										p.imgURL = "http://";
										console.log(p.languages);
																						
										vars.p = p;
										return vars;							
									});						

						});							
						

                    });
                }

                // Load a player to edit
                return dao.players.get({key: inputs.pid}).then(function (p) {
                    if (p.imgURL.length > 0) {
                        vars.appearanceOption = "Image URL";
                    } else {
                        vars.appearanceOption = "Cartoon Face";
                        p.imgURL = "http://";
                    }
				//	console.log(p);
					
                    vars.originalTid = p.tid;
                    vars.p = p;
					//console.log(vars);

                    return vars;
                });
            });
        }
    }

    function uiFirst(vm) {
        if (vm.originalTid() === null) {
            ui.title("Create A Player");
        } else {
            ui.title("Edit Player");
        }

        document.getElementById("randomize-face").addEventListener("click", function () {
            vm.p.face(komapping.fromJS(generateFace()));
        });

        // Since there are two eyes and the updated observable is the first one, update the second in parallel
        ko.computed(function () {
            vm.p.face().eyes()[1].id(vm.p.face().eyes()[0].id());
        }).extend({throttle: 1});
        ko.computed(function () {
            vm.p.face().eyes()[1].angle(vm.p.face().eyes()[0].angle());
        }).extend({throttle: 1});

        // Update picture display
        ko.computed(function () {
            // This ensures it's not drawn when not visible (like if defaulting to Image URL for a
            // player), and it also ensures that this computed is called when appearanceOption
            // changes. Without this "if", it hows a corrupted display for some reason if Image URL
            // is default and the face is switched to.
            if (vm.appearanceOption() === "Cartoon Face") {
                faces.display("picture", ko.toJS(vm.p.face));
            }
        }).extend({throttle: 1});

        document.getElementById("create-a-player").addEventListener("click", function () {
            var p, pid, r,i;

            p = komapping.toJS(vm.p);

            // Fix integers that Knockout may have mangled
            p.tid = parseInt(p.tid, 10);
            p.hgt = parseInt(p.hgt, 10);
            p.weight = parseInt(p.weight, 10);
            p.face.fatness = parseFloat(p.face.fatness);
            p.face.eyes[0].angle = parseFloat(p.face.eyes[0].angle);
            p.face.eyes[1].angle = parseFloat(p.face.eyes[1].angle);

            // Fix draft season
            if (p.tid === g.PLAYER.UNDRAFTED || p.tid === g.PLAYER.UNDRAFTED_2 || p.tid === g.PLAYER.UNDRAFTED_3) {
                if (p.tid === g.PLAYER.UNDRAFTED) {
                    p.draft.year = g.season;
                } else if (p.tid === g.PLAYER.UNDRAFTED_2) {
                    p.draft.year = g.season + 1;
                } else if (p.tid === g.PLAYER.UNDRAFTED_3) {
                    p.draft.year = g.season + 2;
                }

                // Once a new draft class is generated, if the next season hasn't started, need to bump up year numbers
                if (g.phase >= g.PHASE.FREE_AGENCY) {
                    p.draft.year += 1;
                }
            }

            // Set ovr, skills, and bound pot by ovr
            r = p.ratings.length - 1;
            p.ratings[r].ovr = player.ovr(p.ratings[r]);
            p.ratings[r].skills = player.skills(p.ratings[r]);
            if (p.ratings[r].ovr > p.ratings[r].pot) {
                p.ratings[r].pot = p.ratings[r].ovr;
            }
			console.log(p.languages);
		/*	for (i = 0; i <  123; i++) {
				p.champions[i] = {};
				p.champions[i].skill =  Math.round(Math.random()*100,1);
				p.champions[i].name =   champion.name(i,0);
			}*/
		//	p.championAverage = -1;
			var tx;
			
			tx = dao.tx(["champions","championPatch","players", "playerStats"], "readwrite");
		 
		//	console.log("GOT HERE");	
			dao.champions.getAll({
					ot: tx
				}).then(function (c) {
					dao.championPatch.getAll({
								ot: tx
							}).then(function (cp) {
							
							/*console.log(cp.length);
							console.log(c.length);							
							console.log(c[0].name);							*/
								p.champions = {};
								for (i = 0; i <  c.length; i++) {
									p.champions[i] = {};
									p.champions[i].skill =  p.ratings[r].ovr+(Math.round(Math.random()*20,1)-10);
								//	console.log(p.champions[i].skill);
									if (p.champions[i].skill< 0) {
									   p.champions[i].skill = 0;
									} else if (p.champions[i].skill > 100 ) {
									   p.champions[i].skill = 100;
									}
									p.champions[i].name =   c[i].name;
								}			
								//console.log(player.champions.champion.length);
							/*	var playerName = p.name;
								var start_pos = playerName.indexOf("'") + 1;
								var end_pos = playerName.indexOf("'",start_pos);
								var userID = playerName.substring(start_pos,end_pos);
								p.userID = userID;*/
								
								p.ratings[r].MMR = player.MMR(p.ratings[r],p.champions,p.pos,c,cp);
								p.ratings[r].rank = player.rank(p.ratings[r].MMR);
							//	console.log(p.ratings[r].MMR);
							//	console.log(p.ratings[r].rank);			
								// If player was retired, add ratings (but don't develop, because that would change ratings)
								if (vm.originalTid() === g.PLAYER.RETIRED) {
									if (g.season - p.ratings[r].season > 0) {
										p = player.addRatingsRow(p, 15);
									}
								}

								// Only save image URL if it's selected
								if (vm.appearanceOption() !== "Image URL") {
									p.imgURL = "";
								}

								// If we are *creating* a player who is not a draft prospect, make sure he won't show up in the draft this year
								if (p.tid !== g.PLAYER.UNDRAFTED && p.tid !== g.PLAYER.UNDRAFTED_2 && p.tid !== g.PLAYER.UNDRAFTED_3 && g.phase < g.PHASE.FREE_AGENCY) {
									// This makes sure it's only for created players, not edited players
									if (!p.hasOwnProperty("pid")) {
										p.draft.year = g.season - 1;
									}
								}
								// Similarly, if we are editing a draft prospect and moving him to a team, make his draft year in the past
								if ((p.tid !== g.PLAYER.UNDRAFTED && p.tid !== g.PLAYER.UNDRAFTED_2 && p.tid !== g.PLAYER.UNDRAFTED_3) && (vm.originalTid() === g.PLAYER.UNDRAFTED || vm.originalTid() === g.PLAYER.UNDRAFTED_2 || vm.originalTid() === g.PLAYER.UNDRAFTED_3) && g.phase < g.PHASE.FREE_AGENCY) {
									p.draft.year = g.season - 1;
								}


							
							});
				});	
				
	// Recalculate player values, since ratings may have changed
			tx.complete().then(function () {	
					player.updateValues(null, p, []).then(function (p) {
						var tx;

						tx = dao.tx(["players", "playerStats"], "readwrite");


						dao.players.put({ot: tx, value: p}).then(function (pidLocal) {
							// Get pid (primary key) after add, but can't redirect to player page until transaction completes or else it's a race condition
							// When adding a player, this is the only way to know the pid
							pid = pidLocal;

							// Add regular season or playoffs stat row, if necessary
							if (p.tid >= 0 && p.tid !== vm.originalTid() && g.phase <= g.PHASE.PLAYOFFS) {
								p.pid = pid;

								// If it is the playoffs, this is only necessary if p.tid actually made the playoffs, but causes only cosmetic harm otherwise.
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);

								// Add back to database
								dao.players.put({ot: tx, value: p});
							}
						});

						tx.complete().then(function () {
							league.updateLastDbChange();
							ui.realtimeUpdate([], helpers.leagueUrl(["player", pid]));
						});
					});				
		/*		tx.complete().then(function () {
					return league.setGameAttributes({lastDbChange: Date.now()});
				}).then(function () {
					ui.realtimeUpdate([], helpers.leagueUrl(["player", pid]));
				});*/
			});	
		})		
    }

    return bbgmView.init({
        id: "customizePlayer",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updateCustomizePlayer],
        uiFirst: uiFirst
    });
});