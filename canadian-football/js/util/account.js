/**
 * @name util.account
 * @namespace Functions for accessing account crap.
 */
define(["globals", "core/team", "lib/jquery", "lib/underscore", "util/eventLog"], function (g, team, $, _, eventLog) {
    "use strict";

    var allAchievements, checkAchievement;

    // IF YOU ADD TO THIS you also need to add to the whitelist in add_achievements.php
    allAchievements = [{
        slug: "participation",
        name: "Participation",
        desc: "You get an achievement just for creating an account, you special snowflake!"
    }, {
        slug: "almost_almost",
        name: "Almost Almost Perfect",
        desc: "Win 16 games in the regular season."
    }, {
        slug: "almost_perfect",
        name: "Almost Perfect",
        desc: "Win 17 games in the regular season."
    }, {
        slug: "can_you",
        name: "Can You Be The Stampeders?",
        desc: "Go 18-0 in the regular season."
    }, {
        slug: "72_dolphins",
        name: "Better than 48 Stampeders",
        desc: "Go 20-0 in the playoffs and regular season."
    }, {
        slug: "won_sb",
        name: "Grey Cup",
        desc: "Win Grey Cup."
    }, {
        slug: "minor_dynasty",
        name: "Minor Dynasty",
        desc: "Win 2 championships in 4 years."
    }, {
        slug: "major_dynasty",
        name: "Major Dynasty",
        desc: "Win 3 championships in 3 years."
    }, {
        slug: "dynasty",
        name: "Dynasty",
        desc: "Win 6 championships in 8 years."
    }, {
        slug: "dynasty_2",
        name: "Dynasty 2",
        desc: "Win 8 championships in a row."
    }, {
        slug: "dynasty_3",
        name: "Dynasty 3",
        desc: "Win 11 championships in 13 years."
    }, {
        slug: "hardware_store",
        name: "Hardware Store",
        desc: "Players on your team win MVP, DPOY, ROY, and Finals MVP in the same season."
    }, {
        slug: "sleeper_pick",
        name: "Sleeper Pick",
        desc: "Use a pick after the 15th pick to draft the ROY."
    }, {
        slug: "hacker",
        name: "Hacker",
        desc: 'Privately <a href="http://zengm.com/contact/">report</a> a security issue in <a href="https://bitbucket.org/dumbmatter/bbgm-account">the account system</a> or some other part of the site.'
    }];

    function check(cb) {
        $.ajax({
            type: "GET",
            url: "http://account.zengm." + g.tld + "/user_info.php",
            data: "sport=" + g.sport,
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var achievementStore, tx;

                // Save username for display
                g.vm.topMenu.username(data.username);

                // If user is logged in, upload any locally saved achievements
                if (data.username !== "") {
                    tx = g.dbm.transaction("achievements", "readwrite");
                    achievementStore = tx.objectStore("achievements");
                    achievementStore.getAll().onsuccess = function (event) {
                        var achievements;

                        achievements = _.pluck(event.target.result, "slug");

                        // If any exist, delete and upload
                        if (achievements.length > 0) {
                            achievementStore.clear();
                            // If this fails to save remotely, will be added to IDB again
                            addAchievements(achievements, true, function () {
                                if (cb !== undefined) {
                                    cb();
                                }
                            });
                        } else {
                            if (cb !== undefined) {
                                cb();
                            }
                        }
                    };
                } else {
                    if (cb !== undefined) {
                        cb();
                    }
                }
            },
            error: function () {
                if (cb !== undefined) {
                    cb();
                }
            }
        });
    }

    function getAchievements(cb) {
        var achievements;

        achievements = allAchievements.slice();

        g.dbm.transaction("achievements").objectStore("achievements").getAll().onsuccess = function (event) {
            var achievementsLocal, i, j;

            // Initialize counts
            for (i = 0; i < achievements.length; i++) {
                achievements[i].count = 0;
            }

            // Handle any achivements stored in IndexedDB
            achievementsLocal = event.target.result;
            for (j = 0; j < achievementsLocal.length; j++) {
                for (i = 0; i < achievements.length; i++) {
                    if (achievements[i].slug === achievementsLocal[j].slug) {
                        achievements[i].count += 1;
                    }
                }
            }

            // Handle any achievements stored in the cloud
            $.ajax({
                type: "GET",
                url: "http://account.zengm." + g.tld + "/get_achievements.php",
                data: "sport=" + g.sport,
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                success: function (achievementsRemote) {
                    var i;

                    for (i = 0; i < achievements.length; i++) {
                        achievements[i].count += achievementsRemote[achievements[i].slug] !== undefined ? achievementsRemote[achievements[i].slug] : 0;
                    }

                    cb(achievements);
                },
                error: function () {
                    cb(achievements);
                }
            });
        };
    }

    /**
     * Records one or more achievements.
     *
     * If logged in, try to record remotely and fall back to IndexedDB if necessary. If not logged in, just write to IndexedDB. Then, create a notification.
     * 
     * @memberOf util.helpers
     * @param {Array.<string>} achievements Array of achievement IDs (see allAchievements above).
     * @param {boolean=} silent If true, don't show any notifications (like if achievements are only being moved from IDB to remote). Default false.
     * @param {function()=} cb Optional callback.
     */
    function addAchievements(achievements, silent, cb) {
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

        addToIndexedDB = function (achievements, cb) {
            var i, achievementStore, tx;

            tx = g.dbm.transaction("achievements", "readwrite");
            achievementStore = tx.objectStore("achievements");
            for (i = 0; i < achievements.length; i++) {
                achievementStore.add({
                    slug: achievements[i]
                });
                notify(achievements[i]);
            }

            tx.oncomplete = function () {
                if (cb !== undefined) {
                    cb();
                }
            };
        };

        $.ajax({
            type: "POST",
            url: "http://account.zengm." + g.tld + "/add_achievements.php",
            data: {achievements: achievements, sport: g.sport},
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var i;

                if (data.success) {
                    for (i = 0; i < achievements.length; i++) {
                        notify(achievements[i]);
                    }

                    if (cb !== undefined) {
                        cb();
                    }
                } else {
                    addToIndexedDB(achievements, cb);
                }
            },
            error: function () {
                addToIndexedDB(achievements, cb);
            }
        });
    }

    // FOR EACH checkAchievement FUNCTION:
    // If cb is passed, it gets true/false depending on if achievement should be awarded, but nothing is actually recorded. If cb is not, the achievement is directly added if it's awarded.
    checkAchievement = {};

    checkAchievement.won_sb = function (cb) {
	
		if (g.godModeInPast) {
            if (cb !== undefined) {
                cb(false);
            }
            return;
        }
			
        g.dbl.transaction("playoffSeries").objectStore("playoffSeries").get(g.season).onsuccess = function (event) {
            var found, i, playoffSeries, round, series;

            playoffSeries = event.target.result;
            series = playoffSeries.series;

            for (round = 1; round < series.length; round++) {
                found = false;
                for (i = 0; i < series[round].length; i++) {
                    if (series[round][i].away.won === 1 && series[round][i].home.won === 0 && series[round][i].away.tid === g.userTid) {
                        found = true;
                        break;
                    }
                    if (series[round][i].home.won === 1 && series[round][i].away.won === 0 && series[round][i].home.tid === g.userTid) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    if (cb !== undefined) {
                        cb(false);
                    }
                    return;
                }
            }

            if (cb !== undefined) {
                cb(true);
            } else {
                addAchievements(["won_sb"]);
            }
        };
    };

    checkAchievement.almost_almost = function (cb) {
	
		if (g.godModeInPast) {
			if (cb !== undefined) {
                cb(false);
            }
            return;
        }
			
        team.filter({
            seasonAttrs: ["won"],
            season: g.season,
            tid: g.userTid
        }, function (t) {
            if (t.won >= 16) {
                if (cb !== undefined) {
                    cb(true);
                } else {
                    addAchievements(["almost_almost"]);
                }
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        });
    };

    checkAchievement.almost_perfect = function (cb) {
	
		if (g.godModeInPast) {
			if (cb !== undefined) {
                cb(false);
            }
            return;
        }
			
        team.filter({
            seasonAttrs: ["won"],
            season: g.season,
            tid: g.userTid
        }, function (t) {
            if (t.won >= 17) {
                if (cb !== undefined) {
                    cb(true);
                } else {
                    addAchievements(["almost_perfect"]);
                }
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        });
    };
	
	
    checkAchievement.can_you = function (cb) {
	
		if (g.godModeInPast) {
			if (cb !== undefined) {
                cb(false);
            }
            return;
        }
			
        team.filter({
            seasonAttrs: ["won"],
            season: g.season,
            tid: g.userTid
        }, function (t) {
            if (t.won >= 18) {
                if (cb !== undefined) {
                    cb(true);
                } else {
                    addAchievements(["can_you"]);
                }
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        });
    };

//    checkAchievement["72_dolphins"] = function (cb) {
    checkAchievement["72_dolphins"] = function (cb) {	
        checkAchievement.won_sb(function (awarded) {

		if (g.godModeInPast) {
			if (cb !== undefined) {
                cb(false);
            }
            return;
        }
				
            if (awarded) {
                team.filter({
                    seasonAttrs: ["won", "lost"],
                    season: g.season,
                    tid: g.userTid
                }, function (t) {
                    if (t.won === 18 && t.lost === 0) {
                        if (cb !== undefined) {
                            cb(true);
                        } else {
                            addAchievements(["72_dolphins"]);
                        }
                    } else {
                        if (cb !== undefined) {
                            cb(false);
                        }
                    }
                });
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        });
    };

    function checkDynasty(titles, years, slug, cb) {
	
		if (g.godModeInPast) {
			if (cb !== undefined) {
                cb(false);
            }
            return;
        }
			
        g.dbl.transaction("teams").objectStore("teams").getAll().onsuccess = function (event) {
            var i, t, titlesFound;

            t = event.target.result[g.userTid];

            titlesFound = 0;
            // Look over past years
            for (i = 0; i < years; i++) {
                // Don't overshoot
                if (t.seasons.length - 1 - i < 0) {
                    break;
                }

                // Won title?
                if (t.seasons[t.seasons.length - 1 - i].playoffRoundsWon === 3) {
                    titlesFound += 1;
                }
            }

            if (titlesFound >= titles) {
                if (cb !== undefined) {
                    cb(true);
                } else {
                    addAchievements([slug]);
                }
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        };
    }

    checkAchievement.minor_dynasty = function (cb) {
        checkDynasty(2, 4, "minor_dynasty", cb);
    };

    checkAchievement.major_dynasty = function (cb) {
        checkDynasty(3, 3, "major_dynasty", cb);
    };
	
	
    checkAchievement.dynasty = function (cb) {
        checkDynasty(6, 8, "dynasty", cb);
    };

    checkAchievement.dynasty_2 = function (cb) {
        checkDynasty(8, 8, "dynasty_2", cb);
    };

    checkAchievement.dynasty_3 = function (cb) {
        checkDynasty(11, 13, "dynasty_3", cb);
    };
/*
    function checkMoneyball(maxPayroll, slug, cb) {
        team.filter({
            seasonAttrs: ["expenses", "playoffRoundsWon"],
            season: g.season,
            tid: g.userTid
        }, function (t) {
            if (t.playoffRoundsWon === 4 && t.expenses.salary.amount <= maxPayroll) {
                if (cb !== undefined) {
                    cb(true);
                } else {
                    addAchievements([slug]);
                }
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        });
    }*/
/*
    checkAchievement.moneyball = function (cb) {
        checkMoneyball(40000, "moneyball", cb);
    };

    checkAchievement.moneyball_2 = function (cb) {
        checkMoneyball(30000, "moneyball_2", cb);
    };*/

    checkAchievement.hardware_store = function (cb) {
	
		if (g.godModeInPast) {
			if (cb !== undefined) {
                cb(false);
            }
            return;
        }
			
        g.dbl.transaction("awards").objectStore("awards").get(g.season).onsuccess = function (event) {
            var awards;

            awards = event.target.result;

//            if (awards.mvp.tid === g.userTid && awards.dpoy.tid === g.userTid && awards.smoy.tid === g.userTid && awards.roy.tid === g.userTid && awards.finalsMvp.tid === g.userTid) {
            if (awards.mvp.tid === g.userTid && awards.dpoy.tid === g.userTid  && awards.roy.tid === g.userTid && awards.finalsMvp.tid === g.userTid) {
                if (cb !== undefined) {
                    cb(true);
                } else {
                    addAchievements(["hardware_store"]);
                }
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        };
    };
/*
    checkAchievement.small_market = function (cb) {
        team.filter({
            seasonAttrs: ["playoffRoundsWon", "pop"],
            season: g.season,
            tid: g.userTid
        }, function (t) {
            if (t.playoffRoundsWon === 4 && t.pop <= 2) {
                if (cb !== undefined) {
                    cb(true);
                } else {
                    addAchievements(["small_market"]);
                }
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        });
    };
*/
    checkAchievement.sleeper_pick = function (cb) {
	
		if (g.godModeInPast) {
			if (cb !== undefined) {
                cb(false);
            }
            return;
        }
			
        g.dbl.transaction("awards").objectStore("awards").get(g.season).onsuccess = function (event) {
            var awards;

            awards = event.target.result;

            if (awards.roy.tid === g.userTid) {
                g.dbl.transaction("players").objectStore("players").get(awards.roy.pid).onsuccess = function (event) {
                    var p;

                    p = event.target.result;

                    if (p.tid === g.userTid && p.draft.tid === g.userTid && p.draft.year === g.season - 1 && (p.draft.round > 1 || p.draft.pick >= 15)) {
                        if (cb !== undefined) {
                            cb(true);
                        } else {
                            addAchievements(["sleeper_pick"]);
                        }
                    } else {
                        if (cb !== undefined) {
                            cb(false);
                        }
                    }
                };
            } else {
                if (cb !== undefined) {
                    cb(false);
                }
            }
        };
    };

    return {
        check: check,
        getAchievements: getAchievements,
        addAchievements: addAchievements,
        checkAchievement: checkAchievement
    };
});