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
                attrs: ["tid", "cid", "did", "abbrev", "region", "name"],
                seasonAttrs: ["won", "lost", "winp","points","overtime", "wonHome", "lostHome", "wonAway", "lostAway", "wonDiv", "lostDiv", "wonConf", "lostConf", "lastTen", "streak"],
                season: inputs.season,
                sortBy: ["points", "won", "-lost"]
            }).then(function (teams) {
						
				if (g.leagueType == 1) {
				
					var confRanks, confTeams, confs, divTeams, i, j, k, l;

					confs = [];
					for (i = 0; i < g.confs.length; i++) {
						confRanks = [];
						confTeams = [];
						l = 0;
						for (k = 0; k < teams.length; k++) {
							if (g.confs[i].cid === teams[k].cid) {
								confRanks[teams[k].tid] = l + 1; // Store ranks by tid, for use in division standings
								confTeams.push(helpers.deepCopy(teams[k]));
								confTeams[l].rank = l + 1;
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
						}

						confs.push({name: g.confs[i].name, divs: [], teams: confTeams});

						for (j = 0; j < g.divs.length; j++) {
							if (g.divs[j].cid === g.confs[i].cid) {
								divTeams = [];
								l = 0;
								for (k = 0; k < teams.length; k++) {
									if (g.divs[j].did === teams[k].did) {
										divTeams.push(helpers.deepCopy(teams[k]));
										if (l === 0) {
											divTeams[l].gb = 0;
										} else {
											divTeams[l].gb = helpers.gb(divTeams[0], divTeams[l]);
										}
										divTeams[l].confRank = confRanks[divTeams[l].tid];
										if (divTeams[l].tid === g.userTid) {
											divTeams[l].highlight = true;
										} else {
											divTeams[l].highlight = false;
										}
										l += 1;
									}
								}

								confs[i].divs.push({name: g.divs[j].name, teams: divTeams});
							}
						}
					}				
				
				} else {				
				
					var confs, divRanks,divTeamRank, confRanks, confTeams, divTeams, i, j, k, l;
					var divCurrentRank;
					var wildCard;
					var WCRank;
					var confCurrentRank;
					var confCurrentRank;
					confs = [];

					divRanks = [];
					divTeams = [];
					divTeamRank = [];
					
					   for (j = 0; j < g.divs.length; j++) {
							divCurrentRank = 0;
							for (k = 0; k < teams.length; k++) {
								if (g.divs[j].did === teams[k].did) {
								   divCurrentRank += 1;
										divTeamRank[k] = divCurrentRank;
								}
							}
						}					
	 
					
					
					// sort by conference, determine gap between WC, then store, some teams have to be flipped
					var maxPoints;
					for (i = 0; i < g.confs.length; i++) {
					
						confRanks = [];
						confTeams = [];
					
						l = 0;
						maxPoints = 0;
						for (k = 0; k < teams.length; k++) {
							if (g.confs[i].cid === teams[k].cid) {
							   if (divTeamRank[k] <4) {
	//								confRanks[teams[k].tid] = l + 1; // Store ranks by tid, for use in division standings
									confRanks[teams[k].tid] = divTeamRank[k]; // Store ranks by tid, for use in division standings
									confTeams.push(helpers.deepCopy(teams[k]));
		//								confTeams[l].rank = l + 1;
										confTeams[l].rank = divTeamRank[k];
									if (l === 0) {
										confTeams[l].gb = 0;
										maxPoints = confTeams[l].points;
									} else {
	//									confTeams[l].gb = helpers.gb(confTeams[0], confTeams[l]);
										confTeams[l].gb = maxPoints-confTeams[l].points;
									}
									if (confTeams[l].tid === g.userTid) {
										confTeams[l].highlight = true;
									} else {
										confTeams[l].highlight = false;
									}
									l += 1;
								}
							}
						}
						
					   for (k = 0; k < teams.length; k++) {
							if (g.confs[i].cid === teams[k].cid) {
							   if ((divTeamRank[k] > 3) ) {
	//								confRanks[teams[k].tid] = l + 1; // Store ranks by tid, for use in division standings
									confTeams.push(helpers.deepCopy(teams[k]));
									if (l<8) {
										confRanks[teams[k].tid] = 4; // Store ranks by tid, for use in division standings
										confTeams[l].rank = 4;
									} else {
										confTeams[l].rank = l + 1;
									}
									if (l === 0) {
										confTeams[l].gb = 0;
									} else {
	//									confTeams[l].gb = helpers.gb(confTeams[0], confTeams[l]);
										confTeams[l].gb = maxPoints-confTeams[l].points;
									}
									if (confTeams[l].tid === g.userTid) {
										confTeams[l].highlight = true;
									} else {
										confTeams[l].highlight = false;
									}
									l += 1;
								}
							}
						}							
						

						confs.push({name: g.confs[i].name, divs: [], teams: confTeams});

						for (j = 0; j < g.divs.length; j++) {
							if (g.divs[j].cid === g.confs[i].cid) {
								divTeams = [];
								l = 0;
								for (k = 0; k < teams.length; k++) {
									if (g.divs[j].did === teams[k].did) {
										divTeams.push(helpers.deepCopy(teams[k]));
										if (l === 0) {
											divTeams[l].gb = 0;
										} else {
											divTeams[l].gb = helpers.gb(divTeams[0], divTeams[l]);
										}
										divTeams[l].confRank = confRanks[divTeams[l].tid];
										if (divTeams[l].tid === g.userTid) {
											divTeams[l].highlight = true;
										} else {
											divTeams[l].highlight = false;
										}
										l += 1;
									}
								}

								confs[i].divs.push({name: g.divs[j].name, teams: divTeams});
							}
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