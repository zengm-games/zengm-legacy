/**
 * @name util.account
 * @namespace Functions for accessing account crap.
 */
/*eslint camelcase: 0*/
define(["dao", "globals", "core/team", "lib/bluebird", "lib/jquery", "lib/underscore", "util/eventLog"], function (dao, g, team, Promise, $, _, eventLog) {
    "use strict";

    var allAchievements, checkAchievement;

    // IF YOU ADD TO THIS you also need to add to the whitelist in add_achievements.php
	
	
	// for 
	// by kills, number total
	// by kills at one time
	// change language? for different leagues
	//
	
	// World Beater not accurate?
	// undefeated doesn't work, not Ladder and Worlds
	//
	
    allAchievements = [{
        slug: "participation",
        name: "Participation",
        desc: "You get an achievement just for creating an account, you special snowflake!"
    }, {
        slug: "eating",
        name: "Eating",
        desc: "Go undefeated in the regular season."
    }, {
        slug: "fed",
        name: "Fed",
        desc: "Go undefeated in the playoffs and the regular season."
    }, {
        slug: "world_beater",
        name: "World Beater",
        desc: "Go undefeated at Worlds."
    }, {
        slug: "first_blood",
        name: "First Blood",
        desc: "Win a championship in your first season."
    }, {
        slug: "killing_spree",
        name: "Killing Spree",
        desc: "Win 3 championships in a row."
    }, {
        slug: "rampage",
        name: "Rampage",
        desc: "Win 4 championships in a row."
    }, {
        slug: "unstoppable",
        name: "Unstoppable",
        desc: "Win 5 championships in a row."
    }, {
        slug: "dominating",
        name: "Dominating",
        desc: "Win 6 championships in a row."
    }, {
        slug: "godlike",
        name: "Godlike",
        desc: "Win 7 championships in a row."
    }, {
        slug: "legendary",
        name: "Legendary",
        desc: "Win 8 championships in a row."
    }, {
        slug: "ace",
        name: "Ace",
        desc: "Win Worlds."
    }, {
        slug: "penta_kill",
        name: "Penta Kill",
        desc: "Win Worlds 5 years in a row."
    }, {
        slug: "wood",
        name: "Wood",
        desc: "Win 1 championship."
    }, {
        slug: "bronze",
        name: "Bronze",
        desc: "Win 2 championships in 4 years."
    }, {
        slug: "silver",
        name: "Silver",
        desc: "Win 3 championships in a row."
    }, {
        slug: "gold",
        name: "Gold",
        desc: "Win 6 championships in 8 years."
    }, {
        slug: "platinum",
        name: "Platinum",
        desc: "Win 8 championships in a row."
    }, {
        slug: "diamond",
        name: "Diamond",
        desc: "Win 11 championships in 13 years."
    }, {
        slug: "master",
        name: "Master",
        desc: "Win 13 championships in a row."
    }, {
        slug: "challenger",
        name: "Challenger",
        desc: "Win 20 championships in 22 years."
    }, {
        slug: "pro",
        name: "Pro",
        desc: "Win 22 championships in a row."
    }, {
        slug: "hardware_store",
        name: "Hardware Store",
        desc: "Players on your team win MVP and Finals MVP in the same season."		
    }, {
        slug: "ladder_climber",
        name: "Ladder Climber",
        desc: "Win a title with a payroll of no more than $200 thousand."
    }, {
        slug: "ladder_climber2",
        name: "Ladder Climber 2",
        desc: "Win a title with a team that started on the Ladder."
    }, {
        slug: "hacker",
        name: "Hacker",
        desc: 'Privately <a href="http://basketball-gm.com/contact/">report</a> a security issue in <a href="https://bitbucket.org/dumbmatter/bbgm-account">the account system</a> or some other part of the site.'
    }];

    /**
     * Records one or more achievements.
     *
     * If logged in, try to record remotely and fall back to IndexedDB if necessary. If not logged in, just write to IndexedDB. Then, create a notification.
     *
     * @memberOf util.helpers
     * @param {Array.<string>} achievements Array of achievement IDs (see allAchievements above).
     * @param {boolean=} silent If true, don't show any notifications (like if achievements are only being moved from IDB to remote). Default false.
     * @return {Promise}
     */
    function addAchievements(achievements, silent) {
        var addToIndexedDB, notify;

        silent = silent !== undefined ? silent : false;

        notify = function (slug) {
            var i;

            if (silent) {
                return;
            }

            // Find name of achievement
            for (i = 0; i < allAchievements.length; i++) {
                if (allAchievements[i].slug === slug) {
                    eventLog.add(null, {
                        type: "achievement",
                        text: '"' + allAchievements[i].name + '" achievement awarded! <a href="/account">View all achievements.</a>'
                    });
                    break;
                }
            }
        };

        addToIndexedDB = function (achievements) {
            var i, tx;

            tx = dao.tx("achievements", "readwrite");
            for (i = 0; i < achievements.length; i++) {
                dao.achievements.add({
                    ot: tx,
                    value: {
                        slug: achievements[i]
                    }
                });
                notify(achievements[i]);
            }

            return tx.complete();
        };

        return Promise.resolve($.ajax({
            type: "POST",
            url: "http://account.zengm." + g.tld + "/add_achievements.php",
            data: {achievements: achievements, sport: g.sport},
            dataType: "json",
            xhrFields: {
                withCredentials: true
            }
        })).then(function (data) {
            var i;

            if (data.success) {
                for (i = 0; i < achievements.length; i++) {
                    notify(achievements[i]);
                }
            } else {
                return addToIndexedDB(achievements);
            }
        }).catch(function () {
            return addToIndexedDB(achievements);
        });
    }

    function check() {
        return Promise.resolve($.ajax({
            type: "GET",
            url: "http://account.zengm." + g.tld + "/user_info.php",
            data: "sport=" + g.sport,
            dataType: "json",
            xhrFields: {
                withCredentials: true
            }
        })).then(function (data) {
            var tx;

            // Save username for display
            g.vm.topMenu.username(data.username);

            // If user is logged in, upload any locally saved achievements
            if (data.username !== "") {
                tx = dao.tx("achievements", "readwrite");
                return dao.achievements.getAll({ot: tx}).then(function (achievements) {
                    achievements = _.pluck(achievements, "slug");

                    // If any exist, delete and upload
                    if (achievements.length > 0) {
                        dao.achievements.clear({ot: tx});
                        // If this fails to save remotely, will be added to IDB again
                        return addAchievements(achievements, true);
                    }
                });
            }
        }).catch(function () {});
    }

    function getAchievements() {
        var achievements;

        achievements = allAchievements.slice();

        return dao.achievements.getAll().then(function (achievementsLocal) {
            var i, j;

            // Initialize counts
            for (i = 0; i < achievements.length; i++) {
                achievements[i].count = 0;
            }

            // Handle any achivements stored in IndexedDB
            for (j = 0; j < achievementsLocal.length; j++) {
                for (i = 0; i < achievements.length; i++) {
                    if (achievements[i].slug === achievementsLocal[j].slug) {
                        achievements[i].count += 1;
                    }
                }
            }

            // Handle any achievements stored in the cloud
            return Promise.resolve($.ajax({
                type: "GET",
                url: "http://account.zengm." + g.tld + "/get_achievements.php",
                data: "sport=" + g.sport,
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                }
            })).then(function (achievementsRemote) {
                var i;

                // Merge local and remote achievements
                for (i = 0; i < achievements.length; i++) {
                    achievements[i].count += achievementsRemote[achievements[i].slug] !== undefined ? achievementsRemote[achievements[i].slug] : 0;
                }

                return achievements;
            }).catch(function () {
                // No remote connection, just return local achievements
                return achievements;
            });
        });
    }

    // FOR EACH checkAchievement FUNCTION:
    // Returns a promise that resolves to true or false depending on whether the achievement was awarded.
    // HOWEVER, it's only saved to the database if saveAchievement is true (this is the default), but the saving happens asynchronously. It is theoretically possible that this could cause a notification to be displayed to the user about getting an achievement, but some error occurs when saving it.
    checkAchievement = {};

  /*  checkAchievement.fo_fo_fo = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return dao.playoffSeries.get({key: g.season}).then(function (playoffSeries) {
            var found, i, round, series;

            series = playoffSeries.series;

            for (round = 0; round < series.length; round++) {
                found = false;
                for (i = 0; i < series[round].length; i++) {
                    if (series[round][i].away.won === 3 && series[round][i].home.won === 0 && series[round][i].away.tid === g.userTid) {
                        found = true;
                        break;
                    }
                    if (series[round][i].home.won === 3 && series[round][i].away.won === 0 && series[round][i].home.tid === g.userTid) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
            }

            if (saveAchievement) {
                addAchievements(["fo_fo_fo"]);
            }
            return true;
        });
    };*/
	
	checkAchievement.fo_fo_fo = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return dao.playoffSeries.get({key: g.season}).then(function (playoffSeries) {
            var found, i, round, series,seriesStart,seriesEnd;
			var startingRound;

            series = playoffSeries.series;

			console.log(series);
		
			
			
            found = false;		
			startingRound = 0;
            for (round = 0; round < series.length; round++) {
			
				if (round == 0) {
					if (g.gameType == 0) {				 
						seriesStart = 0;
						seriesEnd = 2;				
					} else if (g.gameType == 1) {	
						seriesStart = 0;
						seriesEnd = 9;							
					} else if (g.gameType == 2) {	
						seriesStart = 9;
						seriesEnd = 10;				
					} else if (g.gameType == 3) {	
						seriesStart = 10;
						seriesEnd = 11;				
					} else if (g.gameType == 4) {	
						seriesStart = 11;
						seriesEnd = 12;				
					} else if (g.gameType == 5) {	
	//					seriesStart = 12;
	//					seriesEnd = 24;				
						seriesStart = 9;
						seriesEnd = 16;				
					}			
				} else if (round == 1) {
					if (g.gameType == 0) {				 
						seriesStart = 0;
						seriesEnd = 2;				
					} else if (g.gameType == 1) {	
						seriesStart = 0;
						seriesEnd = 7;							
					} else if (g.gameType == 2) {	
						seriesStart = 7;
						seriesEnd = 8;				
					} else if (g.gameType == 3) {	
						seriesStart = 8;
						seriesEnd = 9;				
					} else if (g.gameType == 4) {	
						seriesStart = 9;
						seriesEnd = 10;				
					} else if (g.gameType == 5) {	
						seriesStart = 7;
						seriesEnd = 13;				
					}						
				} else if (round == 2) {
					if (g.gameType == 0) {				 
						seriesStart = 0;
						seriesEnd = 2;				
					} else if (g.gameType == 1) {	
						seriesStart = 0;
						seriesEnd = 6;							
					} else if (g.gameType == 2) {	
						seriesStart = 6;
						seriesEnd = 7;				
					} else if (g.gameType == 3) {	
						seriesStart = 7;
						seriesEnd = 8;				
					} else if (g.gameType == 4) {	
						seriesStart = 8;
						seriesEnd = 9;				
					} else if (g.gameType == 5) {	
						seriesStart = 6;
						seriesEnd = 11;				
					}						
				} else if (round == 3) {
					if (g.gameType == 0) {				 
						seriesStart = 0;
						seriesEnd = 0;				
					} else if (g.gameType == 1) {	
						seriesStart = 0;
						seriesEnd = 1;							
					} else if (g.gameType == 2) {	
						seriesStart = 1;
						seriesEnd = 2;				
					} else if (g.gameType == 3) {	
						seriesStart = 2;
						seriesEnd = 4;				
					} else if (g.gameType == 4) {	
						seriesStart = 4;
						seriesEnd = 4;				
					} else if (g.gameType == 5) {	
						seriesStart = 1;
						seriesEnd = 4;				
					}						
				} else if (round == 4) {
					if (g.gameType == 0) {				 
						seriesStart = 0;
						seriesEnd = 0;				
					} else if (g.gameType == 1) {	
						seriesStart = 0;
						seriesEnd = 0;							
					} else if (g.gameType == 2) {	
						seriesStart = 0;
						seriesEnd = 0;				
					} else if (g.gameType == 3) {	
						seriesStart = 0;
						seriesEnd = 2;				
					} else if (g.gameType == 4) {	
						seriesStart = 2;
						seriesEnd = 2;				
					} else if (g.gameType == 5) {	
						seriesStart = 0;
						seriesEnd = 2;				
					}	
				} else if (round == 5) {
					if (g.gameType == 0) {				 
						seriesStart = 0;
						seriesEnd = 0;				
					} else if (g.gameType == 1) {	
						seriesStart = 0;
						seriesEnd = 0;							
					} else if (g.gameType == 2) {	
						seriesStart = 0;
						seriesEnd = 0;				
					} else if (g.gameType == 3) {	
						seriesStart = 0;
						seriesEnd = 2;				
					} else if (g.gameType == 4) {	
						seriesStart = 2;
						seriesEnd = 2;				
					} else if (g.gameType == 5) {	
						seriesStart = 0;
						seriesEnd = 2;				
					}					
				} else if (round == 6) {
					if (g.gameType == 5) {	
						seriesStart = 0;
						seriesEnd = 10;				
	//					seriesEnd = 6;				
					}										
				} else if (round == 7) {
					if (g.gameType == 5) {	
						seriesStart = 0;
						seriesEnd = 5;				
					}										
				} else if (round == 8) {
					if (g.gameType == 5) {	
						seriesStart = 0;
						seriesEnd = 8;				
					}										
				} else if (round == 9) {
					if (g.gameType == 5) {	
						seriesStart = 0;
						seriesEnd = 4;				
					}										
				} else if (round == 10) {
					if (g.gameType == 5) {	
						seriesStart = 0;
						seriesEnd = 2;				
					}										
				} else if (round == 11) {
					if (g.gameType == 5) {	
						seriesStart = 0;
						seriesEnd = 1;				
					}										
				}							
			
//            for (round = seriesStart; round < seriesEnd; round++) {

//                for (i = 0; i < series[round].length; i++) {
                for (i = seriesStart; i < seriesEnd; i++) {
					console.log(series[round][i].home.tid+" "+series[round][i].away.tid+" "+ g.userTid);
                    if (series[round][i].away.tid === g.userTid) {
                        found = true;
						startingRound = round;
                        break;
                    }
                    if (series[round][i].home.tid === g.userTid) {
                        found = true;
						startingRound = round;						
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
			
            if (found) {

				//for (round = seriesStart; round < seriesEnd; round++) {
				for (round = startingRound; round < series.length; round++) {
				
				
		
					if (round == 0) {
						if (g.gameType == 0) {				 
							seriesStart = 0;
							seriesEnd = 2;				
						} else if (g.gameType == 1) {	
							seriesStart = 0;
							seriesEnd = 9;							
						} else if (g.gameType == 2) {	
							seriesStart = 9;
							seriesEnd = 10;				
						} else if (g.gameType == 3) {	
							seriesStart = 10;
							seriesEnd = 11;				
						} else if (g.gameType == 4) {	
							seriesStart = 11;
							seriesEnd = 12;				
						} else if (g.gameType == 5) {	
		//					seriesStart = 12;
		//					seriesEnd = 24;				
							seriesStart = 9;
							seriesEnd = 16;				
						}			
					} else if (round == 1) {
						if (g.gameType == 0) {				 
							seriesStart = 0;
							seriesEnd = 2;				
						} else if (g.gameType == 1) {	
							seriesStart = 0;
							seriesEnd = 7;							
						} else if (g.gameType == 2) {	
							seriesStart = 7;
							seriesEnd = 8;				
						} else if (g.gameType == 3) {	
							seriesStart = 8;
							seriesEnd = 9;				
						} else if (g.gameType == 4) {	
							seriesStart = 9;
							seriesEnd = 10;				
						} else if (g.gameType == 5) {	
							seriesStart = 7;
							seriesEnd = 13;				
						}						
					} else if (round == 2) {
						if (g.gameType == 0) {				 
							seriesStart = 0;
							seriesEnd = 2;				
						} else if (g.gameType == 1) {	
							seriesStart = 0;
							seriesEnd = 6;							
						} else if (g.gameType == 2) {	
							seriesStart = 6;
							seriesEnd = 7;				
						} else if (g.gameType == 3) {	
							seriesStart = 7;
							seriesEnd = 8;				
						} else if (g.gameType == 4) {	
							seriesStart = 8;
							seriesEnd = 9;				
						} else if (g.gameType == 5) {	
							seriesStart = 6;
							seriesEnd = 11;				
						}						
					} else if (round == 3) {
						if (g.gameType == 0) {				 
							seriesStart = 0;
							seriesEnd = 0;				
						} else if (g.gameType == 1) {	
							seriesStart = 0;
							seriesEnd = 1;							
						} else if (g.gameType == 2) {	
							seriesStart = 1;
							seriesEnd = 2;				
						} else if (g.gameType == 3) {	
							seriesStart = 2;
							seriesEnd = 4;				
						} else if (g.gameType == 4) {	
							seriesStart = 4;
							seriesEnd = 4;				
						} else if (g.gameType == 5) {	
							seriesStart = 1;
							seriesEnd = 4;				
						}						
					} else if (round == 4) {
						if (g.gameType == 0) {				 
							seriesStart = 0;
							seriesEnd = 0;				
						} else if (g.gameType == 1) {	
							seriesStart = 0;
							seriesEnd = 0;							
						} else if (g.gameType == 2) {	
							seriesStart = 0;
							seriesEnd = 0;				
						} else if (g.gameType == 3) {	
							seriesStart = 0;
							seriesEnd = 2;				
						} else if (g.gameType == 4) {	
							seriesStart = 2;
							seriesEnd = 2;				
						} else if (g.gameType == 5) {	
							seriesStart = 0;
							seriesEnd = 2;				
						}	
					} else if (round == 5) {
						if (g.gameType == 0) {				 
							seriesStart = 0;
							seriesEnd = 0;				
						} else if (g.gameType == 1) {	
							seriesStart = 0;
							seriesEnd = 0;							
						} else if (g.gameType == 2) {	
							seriesStart = 0;
							seriesEnd = 0;				
						} else if (g.gameType == 3) {	
							seriesStart = 0;
							seriesEnd = 2;				
						} else if (g.gameType == 4) {	
							seriesStart = 2;
							seriesEnd = 2;				
						} else if (g.gameType == 5) {	
							seriesStart = 0;
							seriesEnd = 2;				
						}					
					} else if (round == 6) {
						if (g.gameType == 5) {	
							seriesStart = 0;
							seriesEnd = 10;				
		//					seriesEnd = 6;				
						}										
					} else if (round == 7) {
						if (g.gameType == 5) {	
							seriesStart = 0;
							seriesEnd = 5;				
						}										
					} else if (round == 8) {
						if (g.gameType == 5) {	
							seriesStart = 0;
							seriesEnd = 8;				
						}										
					} else if (round == 9) {
						if (g.gameType == 5) {	
							seriesStart = 0;
							seriesEnd = 4;				
						}										
					} else if (round == 10) {
						if (g.gameType == 5) {	
							seriesStart = 0;
							seriesEnd = 2;				
						}										
					} else if (round == 11) {
						if (g.gameType == 5) {	
							seriesStart = 0;
							seriesEnd = 1;				
						}										
					}						
					found = false;
					//for (i = 0; i < series[round].length; i++) {
					for (i = seriesStart; i < seriesEnd; i++) {	
						console.log(startingRound+" "+round+" "+series.length+" "+i+" "+seriesStart+" "+seriesEnd+" "+series[round][i].away.won+" "+series[round][i].home.won+" "+series[round][i].away.tid+" "+ series[round][i].home.tid +" "+g.userTid  );						
						if ( (series[round][i].away.won  < 3 || series[round][i].home.won  > 0) && series[round][i].away.tid === g.userTid) {
							found = true;							
							break;
						}
						if ( (series[round][i].home.won < 3 || series[round][i].away.won > 0) && series[round][i].home.tid === g.userTid) {
							found = true;
							break;
						}
					}
					console.log(found);
				//	if (!found) {
					if (found) {					
						return false;
					}
				}
			}

            if (saveAchievement) {
                addAchievements(["fo_fo_fo"]);
            }
            return true;
        });
    };	

    checkAchievement.eating = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return team.filter({
            seasonAttrs: ["won"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
		    var numGames;
			
			if ((g.gameType == 0) || (g.gameType == 2)){
			   numGames = 18;
			} else if ((g.gameType == 3) ){
			   numGames = 22;
			} else if ((g.gameType == 4) ){
			   numGames = 14;
			}		
		
            if (t.won >= numGames) {
                if (saveAchievement) {
                    addAchievements(["eating"]);
                }
                return true;
            }

            return false;
        });
    };


	
	
    checkAchievement.fed = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return checkAchievement.fo_fo_fo(false).then(function (awarded) {
            if (awarded) {
                return team.filter({
                    seasonAttrs: ["won", "lost"],
                    season: g.season,
                    tid: g.userTid
                }).then(function (t) {
					var numGames;
					
					if ((g.gameType == 0) || (g.gameType == 2)){
					   numGames = 18;
					} else if ((g.gameType == 3) ){
					   numGames = 22;
					} else if ((g.gameType == 4) ){
					   numGames = 14;
					}
				
                    if (t.won === numGames && t.lost === 0) {
                        if (saveAchievement) {
                            addAchievements(["fed"]);
                        }
                        return true;
                    }

                    return false;
                });
            }

            return false;
        });
    };

	
   checkAchievement["ace"] = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        if (g.gameType < 5) {
            return Promise.resolve(false);
        }
		
		return checkDynasty(1, 1, "wood", false).then(function (awarded) {
        //return checkAchievement.fo_fo_fo(false).then(function (awarded) {
            if (awarded) {			
				if (saveAchievement) {
					addAchievements(["ace"]);
				}			   
            }

            return false;
        });
    };

   checkAchievement["penta_kill"] = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        if (g.gameType < 5) {
            return Promise.resolve(false);
        }
		
		return checkDynasty(5, 5, "unstoppable", false).then(function (awarded) {
        //return checkAchievement.fo_fo_fo(false).then(function (awarded) {
            if (awarded) {			
				if (saveAchievement) {
					addAchievements(["penta_kill"]);
				}			   
            }

            return false;
        });
    };		
	
	
 
	
 	checkAchievement.world_beater = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        if (g.gameType < 5) {
            return Promise.resolve(false);
        }
		
		
        return dao.playoffSeries.get({key: g.season}).then(function (playoffSeries) {
            var found, i, round, series;

            series = playoffSeries.series;

			console.log(series);
            for (round = 0; round < series.length; round++) {
                found = false;
                for (i = 0; i < series[round].length; i++) {
					console.log(round+" "+i+" "+g.userTid+" "+series[round].length);
                    if (series[round][i].away.won < 3 && series[round][i].home.won > 0 && series[round][i].away.tid === g.userTid) {
                        found = true;
                        break;
                    }
                    if (series[round][i].home.won < 3 && series[round][i].away.won > 0 && series[round][i].home.tid === g.userTid) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
            }

            if (saveAchievement) {
                addAchievements(["world_beater"]);
            }
            return true;
        });
    };		
	
	
    function checkDynasty(titles, years, slug, saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return dao.teams.get({key: g.userTid}).then(function (t) {
            var i, titlesFound;

			var champRounds;
			champRounds = 3;		
			if (g.gameType == 0) {
				champRounds = 3;
			} else if (g.gameType == 1) {
				champRounds = 27;				
			} else if (g.gameType == 2) {
				champRounds = 4;
			} else if (g.gameType == 3) {
				champRounds = 6;
			} else if (g.gameType == 4) {
				champRounds = 3;
			} else if (g.gameType == 5) {
				champRounds = 6;								
			}
			
			
            titlesFound = 0;
            // Look over past years
            for (i = 0; i < years; i++) {
                // Don't overshoot
                if (t.seasons.length - 1 - i < 0) {
                    break;
                }

                // Won title?
                if (t.seasons[t.seasons.length - 1 - i].playoffRoundsWon === champRounds) {
                    titlesFound += 1;
                }
            }

            if (titlesFound >= titles) {
                if (saveAchievement) {
                    addAchievements([slug]);
                }
                return true;
            }

            return false;
        });
    }
    checkAchievement.killing_spree = function (saveAchievement) {
        return checkDynasty(3, 3, "killing_spree", saveAchievement);
    };
    checkAchievement.rampage = function (saveAchievement) {
        return checkDynasty(4, 4, "rampage", saveAchievement);
    };
    checkAchievement.unstoppable = function (saveAchievement) {
        return checkDynasty(5, 5, "unstoppable", saveAchievement);
    };
    checkAchievement.dominating = function (saveAchievement) {
        return checkDynasty(6, 6, "dominating", saveAchievement);
    };
    checkAchievement.godlike = function (saveAchievement) {
        return checkDynasty(7, 7, "godlike", saveAchievement);
    };
    checkAchievement.legendary = function (saveAchievement) {
        return checkDynasty(8, 8, "legendary", saveAchievement);
    };
    checkAchievement.wood = function (saveAchievement) {
        return checkDynasty(1, 1, "wood", saveAchievement);
    };

    checkAchievement.bronze = function (saveAchievement) {
        return checkDynasty(2, 4, "bronze", saveAchievement);
    };

    checkAchievement.silver = function (saveAchievement) {
        return checkDynasty(3, 3, "silver", saveAchievement);
    };

    checkAchievement.gold = function (saveAchievement) {
        return checkDynasty(6, 9, "gold", saveAchievement);
    };

    checkAchievement.platinum = function (saveAchievement) {
        return checkDynasty(8, 8, "platinum", saveAchievement);
    };
	
    checkAchievement.diamond = function (saveAchievement) {
        return checkDynasty(11, 13, "diamond", saveAchievement);
    };
    checkAchievement.master = function (saveAchievement) {
        return checkDynasty(13, 13, "master", saveAchievement);
    };
    checkAchievement.challenger = function (saveAchievement) {
        return checkDynasty(20, 22, "challenger", saveAchievement);
    };
    checkAchievement.pro = function (saveAchievement) {
        return checkDynasty(22, 22, "pro", saveAchievement);
    };
	
   function checkFirstSeason(firstSeason, slug, saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

		var champRounds;
		champRounds = 3;		
		/*if (g.gameType == 0) {
			champRounds = 3;
		} else if (g.gameType == 1) {
		} else if (g.gameType == 2) {
			champRounds = 4;
		} else if (g.gameType == 3) {
			champRounds = 6;
		} else if (g.gameType == 4) {
			champRounds = 3;
		} else if (g.gameType == 5) {
		} else {
		
		}*/	
			if (g.gameType == 0) {
				champRounds = 3;
			} else if (g.gameType == 1) {
				champRounds = 27;				
			} else if (g.gameType == 2) {
				champRounds = 4;
			} else if (g.gameType == 3) {
				champRounds = 6;
			} else if (g.gameType == 4) {
				champRounds = 3;
			} else if (g.gameType == 5) {
				champRounds = 6;								
			}
			
					
		
        return team.filter({
            seasonAttrs: ["playoffRoundsWon"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            if (t.playoffRoundsWon === champRounds && g.season == firstSeason) {
                if (saveAchievement) {
                    addAchievements([slug]);
                }
                return true;
            }

            return false;
        });
    }	
 
   checkAchievement.first_blood = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return checkFirstSeason(g.startingSeason, "first_blood", saveAchievement);
    };	
	
	
    function checkMoneyball(maxPayroll, slug, saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

		var champRounds;
		champRounds = 3;		
/*		if (g.gameType == 0) {
			champRounds = 3;
		} else if (g.gameType == 1) {
		} else if (g.gameType == 2) {
			champRounds = 4;
		} else if (g.gameType == 3) {
			champRounds = 6;
		} else if (g.gameType == 4) {
			champRounds = 3;
		} else if (g.gameType == 5) {
		} else {
		
		}*/
		if (g.gameType == 0) {
			champRounds = 3;
		} else if (g.gameType == 1) {
			champRounds = 27;				
		} else if (g.gameType == 2) {
			champRounds = 4;
		} else if (g.gameType == 3) {
			champRounds = 6;
		} else if (g.gameType == 4) {
			champRounds = 3;
		} else if (g.gameType == 5) {
			champRounds = 6;								
		}
		
				
		
        return team.filter({
            seasonAttrs: ["expenses", "playoffRoundsWon"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            if (t.playoffRoundsWon === champRounds && t.expenses.salary.amount <= maxPayroll) {
                if (saveAchievement) {
                    addAchievements([slug]);
                }
                return true;
            }

            return false;
        });
    }

    checkAchievement.ladder_climber = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return checkMoneyball(200000, "ladder_climber", saveAchievement);
    };

	checkAchievement["ladder_climber2"] = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        if ((g.gameType != 1) || (g.userTid <= 15)) {
            return Promise.resolve(false);
        }
		
		return checkDynasty(1, 1, "wood", false).then(function (awarded) {
        //return checkAchievement.fo_fo_fo(false).then(function (awarded) {
            if (awarded) {			
				if (saveAchievement) {
					addAchievements(["ladder_climber2"]);
				}			   
            }

            return false;
        });
    };			
	
/*    checkAchievement.moneyball_2 = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return checkMoneyball(30000, "moneyball_2", saveAchievement);
    };
*/
    checkAchievement.hardware_store = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return dao.awards.get({key: g.season}).then(function (awards) {
            if (awards.mvp.tid === g.userTid  && awards.finalsMvp.tid === g.userTid) {
                if (saveAchievement) {
                    addAchievements(["hardware_store"]);
                }
                return true;
            }

            return false;
        });
    };

    checkAchievement.small_market = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return team.filter({
            seasonAttrs: ["playoffRoundsWon", "pop"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            if (t.playoffRoundsWon === 4 && t.pop <= 2) {
                if (saveAchievement) {
                    addAchievements(["small_market"]);
                }
                return true;
            }

            return false;
        });
    };

    checkAchievement.sleeper_pick = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return dao.awards.get({key: g.season}).then(function (awards) {
            if (awards.roy.tid === g.userTid) {
                return dao.players.get({key: awards.roy.pid}).then(function (p) {
                    if (p.tid === g.userTid && p.draft.tid === g.userTid && p.draft.year === g.season - 1 && (p.draft.round > 1 || p.draft.pick >= 15)) {
                        if (saveAchievement) {
                            addAchievements(["sleeper_pick"]);
                        }
                        return true;
                    }

                    return false;
                });
            }

            return false;
        });
    };

    return {
        check: check,
        getAchievements: getAchievements,
        addAchievements: addAchievements,
        checkAchievement: checkAchievement
    };
});