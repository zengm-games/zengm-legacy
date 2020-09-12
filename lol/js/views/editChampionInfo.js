/**
 * @name views.editChampionInfo
 * @namespace Edit Champion Info.
 */
define(["dao", "db", "globals", "ui", "core/league", "core/team", "lib/underscore", "util/bbgmView", "util/helpers"], function (dao, db, g, ui, league, team, _, bbgmView, helpers) {
    "use strict";

    function post(req) {
        var button, userName, userRegion;

        button = document.getElementById("edit-champion-info");
        button.disabled = true;


        dao.champions.iterate({
            ot: dao.tx("champions", "readwrite"),
            callback: function (c) {
                c.name = req.params.name[c.hid];
                c.ratings.attack = req.params.attack[c.hid];
                c.ratings.defense = req.params.defense[c.hid];
                c.ratings.ability = req.params.ability[c.hid];
                //t.seasons[t.seasons.length - 1].pop = parseFloat(req.params.pop[t.tid]);

             /*   if (t.tid === g.userTid) {
                    userName = t.name;
                    userRegion = t.region;
                }*/

                return c;
            }
        }).then(function () {
            // Update meta cache of user's team
//            return league.updateMetaNameRegion(userName, userRegion);
            return ;
        }).then(function () {
           // return league.setGameAttributesComplete({
            //    teamAbbrevsCache: req.params.name,
            //    teamRegionsCache: req.params.ratings.attack,
            //    teamNamesCache: req.params.name
           // });
        }).then(function () {
			league.updateLastDbChange();
            button.disabled = false;
            ui.realtimeUpdate([], helpers.leagueUrl(["edit_champion_info"]));
        });
    }

    function updateChampionInfo() {
	
//		return dao.champions.getAll({ot: ot});
		return dao.champions.getAll().then(function (champions) {
		
		return {
                champions: champions
            };
        });
		
		
        /*return team.filter({
            attrs: ["tid", "abbrev", "region", "name"],
            seasonAttrs: ["pop"],
            season: g.season
        }).then(function (teams) {
            var i;

            for (i = 0; i < teams.length; i++) {
                teams[i].pop = helpers.round(teams[i].pop, 6);
            }

            return {
                champions: champions
            };
        });*/
    }

    function uiFirst() {
        var fileEl;

        ui.title("Edit Basic Champion Ratings");

        fileEl = document.getElementById("custom-champions");
        fileEl.addEventListener("change", function () {
            var file, reader;

            file = fileEl.files[0];

            reader = new window.FileReader();
            reader.readAsText(file);
            reader.onload = function (event) {
                var i, newChampions, champs, userName, userRegion;
				var numChampions;

                champs = JSON.parse(event.target.result);
                newChampions = champs.champions;

						console.log(g.numChampions);
				

                for (i = 0; i < newChampions.length; i++) {
                    if (i !== newChampions[i].hid) {
                        console.log("ROSTER ERROR: Wrong hid, champion " + i);
                        return;
                    }
                    if (newChampions[i].hid < 0) {
                        console.log("ROSTER ERROR: Invalid hid, champion " + i);
                        return;
                    }
                    if (newChampions[i].ratings.attack < 0 || newChampions[i].ratings.attack > 100) {
                        console.log("ROSTER ERROR: Invalid attack rating, champion " + i);
                        return;
                    }
                    if (newChampions[i].ratings.defense < 0 || newChampions[i].ratings.defense > 100) {
                        console.log("ROSTER ERROR: Invalid defense rating, champion " + i);
                        return;
                    }
                    if (newChampions[i].ratings.ability < 0 || newChampions[i].ratings.ability > 100) {
                        console.log("ROSTER ERROR: Invalid ability rating, champion " + i);
                        return;
                    } 
                    if (typeof newChampions[i].name !== "string") {
                        console.log("ROSTER ERROR: Invalid name, champion " + i);
                        return;
                    }
                }
				
                // Add new champions
                if (newChampions.length > g.numChampions) {
					for (i = g.numChampions ; i < newChampions.length; i++) {	
//						dao.champions.add({ot: dao.tx("champions", "readwrite"), value: newChampions[i]});						
							console.log(i);
						dao.champions.add({ot: dao.tx("champions", "readwrite"), value: newChampions[i]											
//						}).then(function () {
						}).then(function (i) {
						//iterate on players to add champ stats
						//	console.log(i);
						//	console.log(newChampions[i]);
							dao.players.iterate({
							//	ot: tx,
								ot: dao.tx("players", "readwrite"),								
								//key: key,
								callback: function (p) {														
									//console.log(i);
								//	console.log(newChampions[i]);									
									p.champions[i] = {};
						//			p.champions[i].skill =  p.ratings[0].ovr+(Math.round(Math.random()*100,0)-10);
						//			p.champions[i].skill =  p.ratings[0].ovr+(Math.random()*100*20-10);
							//		console.log(p.ratings);
									p.champions[i].skill =  Math.round( p.ratings[0].ovr+(Math.random()*40-20),0);

									if (p.champions[i].skill< 0) {
									   p.champions[i].skill = 0;
									} else if (p.champions[i].skill > 100 ) {
									   p.champions[i].skill = 100;
									}
									//
									p.champions[i].name =   newChampions[i].name;
									

									return p;
								}
		//					}).then(function () {
							})	
						});										
					}
					//g.numChampions	= newChampions.length;
				} else if (newChampions.length < g.numChampions) {
					
					for (i = newChampions.length ; i < g.numChampions; i++) {	
							console.log(i);					
						var id;
						id = i;
//						dao.champions.add({ot: dao.tx("champions", "readwrite"), value: newChampions[i]});						
							console.log(i);
						dao.champions.delete({ot: dao.tx("champions", "readwrite"), key: id											
//						}).then(function () {
						}).then(function (id) {
						//iterate on players to add champ stats
							console.log(i);
						//	console.log(newChampions[i]);
	
						});										
					}
					//}.then(function (id) {					
					//	g.numChampions	= newChampions.length;	
					//});
					dao.players.iterate({
					//	ot: tx,
						ot: dao.tx("players", "readwrite"),								
						//key: key,
						callback: function (p) {	
							var ii;
							//	console.log(i);	
							//	console.log(newChampions.length);
							//	console.log(g.numChampions);									
							
							for (ii = newChampions.length ; ii < i; ii++) {						
							//	console.log(p.champions[ii]);
								
								delete p.champions[ii].name;
								delete p.champions[ii].skill;									
								delete p.champions[ii];									
							}

							return p;
							
						}
//					}).then(function () {
					})					
				}
				
			
				
				// count champions
				dao.champions.count({
                        ot: dao.tx("champions")
                }).then(function (numChampions) {

					/*if (numChampions>newChampions.length) {
						console.log("ROSTER ERROR: Too few champions");
						return;
					} */
				  //  league.setGameAttributesComplete({
//numChampions: newChampions.length
				///	}).then(function () {						
					//});			
					console.log(numChampions);
					//g.numChampions	= newChampions.length;	
						dao.champions.iterate({
							ot: dao.tx("champions", "readwrite"),
							callback: function (c) {
								c.hid = newChampions[c.hid].hid;
								c.ratings.attack = newChampions[c.hid].ratings.attack;
								c.ratings.defense = newChampions[c.hid].ratings.defense;
								c.ratings.ability = newChampions[c.hid].ratings.ability;
							 //   t.seasons[t.seasons.length - 1].pop = newChampions[t.tid].pop;
								if (newChampions[c.hid].imgURL) {
									c.imgURL = newChampions[c.hid].imgURL;
								}

							/*    if (t.tid === g.userTid) {
									userName = t.name;
									userRegion = t.region;
								}*/

								return c;
							}
					//	});							
					}).then(function () {
					console.log(numChampions);	
						league.setGameAttributesComplete({numChampions: numChampions});
											
						// Update meta cache of user's team
	//                   return league.updateMetaNameRegion(userName, userRegion);
					   return ;
					}).then(function () {
					console.log(numChampions);												
						return league.setGameAttributes({
					//		lastDbChange: Date.now()
						//	lastDbChange: Date.now(),							
							numChampions: numChampions
							//teamAbbrevsCache: _.pluck(newChampions, "abbrev"),
							//teamRegionsCache: _.pluck(newChampions, "region"),
							//teamNamesCache: _.pluck(newChampions, "name")
						});
					}).then(function () {
						league.updateLastDbChange();
						ui.realtimeUpdate(["dbChange"]);
						console.log(g.numChampions);
					});
				});					
            };
        });
    }

    return bbgmView.init({
        id: "editChampionInfo",
        post: post,
        runBefore: [updateChampionInfo],
        uiFirst: uiFirst
    });
});