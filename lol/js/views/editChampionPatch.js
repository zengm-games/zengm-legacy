/**
 * @name views.editChampionInfo
 * @namespace Edit Champion Info.
 */
define(["dao", "db", "globals", "ui", "core/league", "core/team", "lib/underscore", "util/bbgmView", "util/helpers"], function (dao, db, g, ui, league, team, _, bbgmView, helpers) {
    "use strict";

    function post(req) {
        var button, userName, userRegion;

        button = document.getElementById("edit-champion-patch");
        button.disabled = true;


        dao.championPatch.iterate({
            ot: dao.tx("championPatch", "readwrite"),
            callback: function (c) {
                c.champion = req.params.champion[c.cpid];
                c.role = req.params.role[c.cpid];
                c.rank = req.params.rank[c.cpid];
            //    c.cpid = req.params.cpid[c.cpid];
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
         //   return league.setGameAttributesComplete({
            //    teamAbbrevsCache: req.params.name,
            //    teamRegionsCache: req.params.ratings.attack,
            //    teamNamesCache: req.params.name
         //   });
        }).then(function () {
			league.updateLastDbChange();
            button.disabled = false;
            ui.realtimeUpdate([], helpers.leagueUrl(["edit_champion_patch"]));
        });
    }

    function updateChampionPatch() {
	
//		return dao.champions.getAll({ot: ot});
		return dao.championPatch.getAll().then(function (championPatch) {
		
		return {
                championPatch: championPatch
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

        ui.title("Edit Champion Patch Data");

        fileEl = document.getElementById("custom-patch");
        fileEl.addEventListener("change", function () {
            var file, reader;

            file = fileEl.files[0];

            reader = new window.FileReader();
            reader.readAsText(file);
            reader.onload = function (event) {
                var i, newChampions, champs, userName, userRegion,tx,cp;

                champs = JSON.parse(event.target.result);
                newChampions = champs.championPatch;
			//	console.log(newChampions);

				
                // Validate teams
                /*if (newChampions.length < g.numChampions) {
                    console.log("ROSTER ERROR: Wrong number of champions");
                    return;
                }*/
                for (i = 0; i < newChampions.length; i++) {
                    if (i !== newChampions[i].cpid) {
                        console.log("ROSTER ERROR: Wrong cpid, champion " + i);
                        return;
                    }
                    if (newChampions[i].cpid < 0) {
                        console.log("ROSTER ERROR: Invalid cpid, champion " + i);
                        return;
                    }
                    if (newChampions[i].rank < 0) {
                        console.log("ROSTER ERROR: Invalid champion rank, champion " + i);
                        return;
                    }
                    if (typeof newChampions[i].champion !== "string") {
                        console.log("ROSTER ERROR: Invalid name, champion " + i);
                        return;
                    }
                    if ((newChampions[i].role !== "ADC") && (newChampions[i].role !== "Jungle")  && (newChampions[i].role !== "Top") && (newChampions[i].role !== "Middle") && (newChampions[i].role !== "Support") )   {
                        console.log("ROSTER ERROR: Invalid role, champion " + i);
                        return;
                    }
                }
	///////////// Delete (reverse for adding?
			 tx = dao.tx(["championPatch"], "readwrite");
			 dao.championPatch.getAll({ot: tx}).then(function (championPatch) {
//				 console.log(championPatch.length+" "+newChampions.length);			 

				//// add new patch data
				for (i = championPatch.length; i < newChampions.length; i++) {						
					cp = newChampions[i];
					dao.championPatch.add({ot: tx, value: cp});						
				}		
					
				 
				 //// if less patch data, erase and redo it
				 if (championPatch.length>newChampions.length) {
					dao.championPatch.clear({ot: tx}).then(function () {
						var i;

						for (i = 0; i < newChampions.length; i++) {
							dao.championPatch.add({
								ot: tx,
								value: newChampions[i]
							});
						}
					});				 
				/* } else if (championPatch.length<newChampions.length) {
					dao.championPatch.clear({ot: tx}).then(function () {
						var i;

						for (i = 0; i < newChampions.length; i++) {
							dao.championPatch.add({
								ot: tx,
								value: newChampions[i]
							});
						}
					});							 */
				 }
				
			 });						 
						 
			 tx.complete().then(function () {
		
					var champLength;
							console.log(g.numChampionsPatch);	
			//	if newChampions.length>
					for (i = 0; i < newChampions.length; i++) {						
			//			console.log(i);			
						dao.championPatch.iterate({
							ot: dao.tx("championPatch", "readwrite"),
							key: newChampions[i].cpid,
							callback: function (c) {
						//	console.log(c);
								c.cpid = newChampions[c.cpid].cpid;
								c.champion = newChampions[c.cpid].champion;
								c.role = newChampions[c.cpid].role;
								c.rank = newChampions[c.cpid].rank;
							 //   t.seasons[t.seasons.length - 1].pop = newChampions[t.tid].pop;
		/*                        if (newChampions[c.cpid].imgURL) {
									c.imgURL = newChampions[c.cpid].imgURL;
								}*/

							/*    if (t.tid === g.userTid) {
									userName = t.name;
									userRegion = t.region;
								}*/

								return c;
							}
					   // }).then(function () {
						})
				   }
				}).then(function () {			   
						league.setGameAttributesComplete({numChampionsPatch: newChampions.length});
											
						// Update meta cache of user's team
	//                   return league.updateMetaNameRegion(userName, userRegion);
					   return ;			   
                    // Update meta cache of user's team
//                   return league.updateMetaNameRegion(userName, userRegion);
               //    return ;
                }).then(function () {
                    return league.setGameAttributes({
                        lastDbChange: Date.now(),
						numChampionsPatch: newChampions.length
                        //teamAbbrevsCache: _.pluck(newChampions, "abbrev"),
                        //teamRegionsCache: _.pluck(newChampions, "region"),
                        //teamNamesCache: _.pluck(newChampions, "name")
            //        });
                }).then(function () {
					league.updateLastDbChange();
                    ui.realtimeUpdate(["dbChange"]);
					console.log(g.numChampionsPatch);
                });
            });
        };
      });		
    }

    return bbgmView.init({
        id: "editChampionPatch",
        post: post,
        runBefore: [updateChampionPatch],
        uiFirst: uiFirst
    });
});