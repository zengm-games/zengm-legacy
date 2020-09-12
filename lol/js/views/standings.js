/**
 * @name views.standings
 * @namespace Standings.
 */
define(["globals", "ui", "core/team", "lib/jquery", "lib/knockout", "lib/knockout.mapping", "views/components", "util/bbgmView", "util/helpers"], function (g, ui, team, $, ko, komapping, components, bbgmView, helpers) {
    "use strict";

    var mapping;

    function get(req) {
        return {
            season: helpers.validateSeason(req.params.season)
        };
    }

    function InitViewModel() {
        this.season = ko.observable();
        this.confs = ko.observable([]);		
    }

    mapping = {
        confs: {
            create: function (options) {
                return new function () {
                    komapping.fromJS(options.data, {
                        divs: {
                            key: function (data) {
                                return ko.unwrap(data.name);
                            }
                        },
                        teams: {
                            key: function (data) {
                                return ko.unwrap(data.tid);
                            }
                        }
                    }, this);
                }();
            },
            key: function (data) {
                return ko.unwrap(data.name);
            }
        }
    };

    function updateStandings(inputs, updateEvents, vm) {
        if (updateEvents.indexOf("dbChange") >= 0 || (inputs.season === g.season && updateEvents.indexOf("gameSim") >= 0) || inputs.season !== vm.season()) {
            return team.filter({
                attrs: ["tid", "cid", "did", "abbrev", "region", "name","abbrev", "imgURLCountry","country","countrySpecific"],
                seasonAttrs: ["won", "lost", "winp", "wonHome", "lostHome", "wonAway", "lostAway", "wonDiv", "lostDiv", "wonConf", "lostConf", "lastTen", "streak","cidStart", "imgURLCountry","countrySpecific"],
                stats: ["pf","fg","fga","fgp","kda"],
                season: inputs.season,
                sortBy: ["winp", "-lost", "won","kda"]
            }).then(function (teams) {
                var confRanks, confTeams, confs, divTeams, i, j, k, l;
				var confCutoff;
				var typeCutoff;

			//	var s;
			//	console.log(inputs.season+" "+g.startingSeason);
			//	s = inputs.season -g.startingSeason ;
 ///t.seasons.length - 1;	
 
			/*	if  (teams.seasons[s].imgURLCountry == undefined) {
					teams.seasons[s].imgURLCountry = teams.imgURLCountry;
					teams.seasons[s].countrySpecific = teams.countrySpecific;									
				}*/
				
				typeCutoff = 7;
				if (g.gameType == 0) {
					typeCutoff = 6;
				} else if (g.gameType == 1) {
					typeCutoff = 6;
				} else if (g.gameType == 2) {
					typeCutoff = 5;
				} else if (g.gameType == 3) {
					typeCutoff = 8;
				} else if (g.gameType == 4) {
					typeCutoff = 4;
				} else {
					typeCutoff = 6;
				}
				
                confs = [];
                for (i = 0; i < g.confs.length; i++) {
                    confRanks = [];
                    confTeams = [];
					confCutoff = [];
					
                    l = 0;
                    for (k = 0; k < teams.length; k++) {
						
						
						//console.log(k);
					//	console.log(teams[k].country);
						//function(k) {
						//	teams[k].country = team.getCountries(k);
						//	teams[k].imgURLCountry = team.getCountryImage(teams[k].country);
						//	return teams;
						//}.then( function(teams) {																		
							//console.log(teams[k].country);
							//console.log(teams[k].countrySpecific);							
							/*if (teams[k].country == "EU") {								 
								teams[k].onOff = true;							
							} else {
								//teams[k].imgURLCountry="";	
								teams[k].onOff = false; 
							}*/
							//if (g.confs[i].cid === teams[k].cid) {
							if (g.confs[i].cid === teams[k].cidStart) {
								confRanks[teams[k].tid] = l + 1; // Store ranks by tid, for use in division standings
								confTeams.push(helpers.deepCopy(teams[k]));
								confTeams[l].rank = l + 1;
								if  (i == 0) {
							
									confCutoff[teams[k].tid] = typeCutoff; // below might move down to lower conference
									confTeams[l].confCutoff = typeCutoff-1;
									
								} else if (i == 1) {
									if (g.gameType == 1) {
										confCutoff[teams[k].tid] = 4; 
										confTeams[l].confCutoff = 3;								
									} else {
										confCutoff[teams[k].tid] = typeCutoff;
										confTeams[l].confCutoff = typeCutoff-1;
									}
								} else if (i == 2) {
									if (g.gameType == 1) {
										confCutoff[teams[k].tid] = 10; // Above might move up to higher conference
										confTeams[l].confCutoff = 9;
									} else if (g.gameType == 5) {
										confCutoff[teams[k].tid] = 5; 
										confTeams[l].confCutoff = 4;
									} else {
										confCutoff[teams[k].tid] = 5; 
										confTeams[l].confCutoff = 4;
									}
								} else if (i == 3) {
										confCutoff[teams[k].tid] = 8; 
										confTeams[l].confCutoff = 7;
								} else if (i == 4) {
										confCutoff[teams[k].tid] = 4; 
										confTeams[l].confCutoff = 3;
								} else {
										confCutoff[teams[k].tid] = 4; 
										confTeams[l].confCutoff = 3;
								}

								if (l === 0) {
									confTeams[l].gb = 0;
								} else {
									confTeams[l].gb = helpers.gb(confTeams[0], confTeams[l]);
								}
								if (confTeams[l].tid === g.userTid) {
									confTeams[l].highlight = true;
								} else {
									confTeams[l].highlight = false;
								}
								l += 1;
							}
						//});						
                    }

                    confs.push({name: g.confs[i].name, divs: [], teams: confTeams});

                    for (j = 0; j < g.divs.length; j++) {
                        if (g.divs[j].cid === g.confs[i].cid) {
                            divTeams = [];
                            l = 0;
                            for (k = 0; k < teams.length; k++) {
//                                if (g.divs[j].did === teams[k].did) {
                                if (g.divs[j].did === teams[k].cidStart) {
                                    divTeams.push(helpers.deepCopy(teams[k]));
                                    if (l === 0) {
                                        divTeams[l].gb = 0;
                                    } else {
                                        divTeams[l].gb = helpers.gb(divTeams[0], divTeams[l]);
                                    }
                                    divTeams[l].confRank = confRanks[divTeams[l].tid];
                                    divTeams[l].confCutoff = confCutoff[divTeams[l].tid];
                                    if (divTeams[l].tid === g.userTid) {
                                        divTeams[l].highlight = true;
                                    } else {
                                        divTeams[l].highlight = false;
                                    }
                                    l += 1;
                                }
                            }

//                            confs[i].divs.push({name: g.divs[j].name, teams: divTeams, confCutoff: confCutoff[i*10]});
                            confs[i].divs.push({name: g.divs[j].name, teams: divTeams});
                        }
                    }
                }

                return {
                    season: inputs.season,
                    confs: confs
                };
            });
        }
    }

    function uiFirst(vm) {
        ko.computed(function () {
            ui.title("Standings - " + vm.season());
        }).extend({throttle: 1});
    				
        ui.tableClickableRows($(".standings-division"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("standings-dropdown", ["seasons"], [vm.season()], updateEvents);
    }

    return bbgmView.init({
        id: "standings",
        get: get,
        InitViewModel: InitViewModel,
        mapping: mapping,
        runBefore: [updateStandings],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});