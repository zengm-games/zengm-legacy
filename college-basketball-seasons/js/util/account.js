/**
 * @name util.account
 * @namespace Functions for accessing account crap.
 */
/*eslint camelcase: 0*/
define(["dao", "globals", "core/team", "lib/bluebird", "lib/jquery", "lib/underscore", "util/eventLog"], function (dao, g, team, Promise, $, _, eventLog) {
    "use strict";

    var allAchievements, checkAchievement;

    // IF YOU ADD TO THIS you also need to add to the whitelist in add_achievements.php
    allAchievements = [{
        slug: "participation",
        name: "Participation",
        desc: "You get an achievement just for creating an account, you special snowflake!"
    }, {
//        slug: "fo_fo_fo",
        slug: "clutch",
        name: "Clutch",
        desc: "Win your CT and the NT."
    }, {
//        slug: "septuawinarian",
        slug: "loyola39",
        name: "Loyola 39",
        desc: "Go 30-0 through the regular season."
    }, {
//        slug: "98_degrees",
        slug: "hoosiers76",
        name: "Hoosiers 76",
        desc: "Go 40-0 through regular season, CT, and NT."
    }, {
//        slug: "dynasty",
        slug: "ucla65",
        name: "UCLA 65",
        desc: "Win 2 championships in 4 years."
    }, {
//        slug: "dynasty_2",
        slug: "ucla73",
        name: "UCLA 73",
        desc: "Win 7 championships in a row."
    }, {
//        slug: "dynasty_3",
        slug: "ucla75",
        name: "UCLA 75",
        desc: "Win 10 championships in 12 years."
    }, {
//        slug: "moneyball",
        slug: "final_four",
        name: "Final Four",
        desc: "Make it to the Final Four."
    }, {
//        slug: "moneyball_2",
        slug: "elite_eight",
        name: "Elite Eight",
        desc: "Make it to the Elite Eight."
    }, {
        slug: "hardware_store",
        name: "Hardware Store",
        desc: "Players on your team win NPOY, DPOY, and FOY in the same season."
    }, {
//        slug: "small_market",
        slug: "conference_clutch",
        name: "Conference Clutch",
        desc: "Win CT."
    }, {
//        slug: "sleeper_pick",
        slug: "national_clutch",
        name: "National Clutch",
        desc: "Win NT."
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

    checkAchievement.fo_fo_fo = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }
		
		
		return team.filter({
            seasonAttrs: ["playoffRoundsWon","playoff64RoundsWon"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            if ((t.playoffRoundsWon === 4 ) && (t.playoff64RoundsWon === 6 )) {
                if (saveAchievement) {
//                    addAchievements(["fo_fo_fo"]);
                    addAchievements(["clutch"]);
                }
                return true;
            }

            return false;
        });
		
    };

    checkAchievement.septuawinarian = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return team.filter({
            seasonAttrs: ["won"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            if (t.won >= 30) {
                if (saveAchievement) {
		//		loyola39
                    addAchievements(["loyola39"]);
        //            addAchievements(["septuawinarian"]);
                }
                return true;
            }

            return false;
        });
    };

    checkAchievement["98_degrees"] = function (saveAchievement) {
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
                    if (t.won === 30 && t.lost === 0) {
                        if (saveAchievement) {
//                            addAchievements(["98_degrees"]);
                            addAchievements(["hoosiers76"]);
                        }
                        return true;
                    }

                    return false;
                });
            }

            return false;
        });
    };

    function checkDynasty(titles, years, slug, saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return dao.teams.get({key: g.userTid}).then(function (t) {
            var i, titlesFound;

            titlesFound = 0;
            // Look over past years
            for (i = 0; i < years; i++) {
                // Don't overshoot
                if (t.seasons.length - 1 - i < 0) {
                    break;
                }

                // Won title?
                if (t.seasons[t.seasons.length - 1 - i].playoff64RoundsWon === 6) {
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

    checkAchievement.dynasty = function (saveAchievement) {
//        return checkDynasty(2, 4, "dynasty", saveAchievement);
        return checkDynasty(2, 4, "ucla65", saveAchievement);
    };

    checkAchievement.dynasty_2 = function (saveAchievement) {
//        return checkDynasty(7, 7, "dynasty_2", saveAchievement);
        return checkDynasty(7, 7, "ucla73", saveAchievement);
    };

    checkAchievement.dynasty_3 = function (saveAchievement) {
//        return checkDynasty(10,12, "dynasty_3", saveAchievement);
        return checkDynasty(10,12, "ucla75", saveAchievement);
    };

    function checkMoneyball(maxPayroll, slug, saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }
			
		
        return team.filter({
            seasonAttrs: ["playoff64RoundsWon"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            if (t.playoff64RoundsWon >= maxPayroll) {
                if (saveAchievement) {
                    addAchievements([slug]);
                }
                return true;
            }

            return false;
        });
    }

    checkAchievement.moneyball = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

//        return checkMoneyball(4, "moneyball", saveAchievement);
        return checkMoneyball(4, "final_four", saveAchievement);
    };

    checkAchievement.moneyball_2 = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

//        return checkMoneyball(3, "moneyball_2", saveAchievement);
        return checkMoneyball(3, "elite_eight", saveAchievement);
    };

    checkAchievement.hardware_store = function (saveAchievement) {
        saveAchievement = saveAchievement !== undefined ? saveAchievement : true;

        if (g.godModeInPast) {
            return Promise.resolve(false);
        }

        return dao.awards.get({key: g.season}).then(function (awards) {
            if (awards.mvp.tid === g.userTid && awards.dpoy.tid === g.userTid && awards.roy.tid === g.userTid ) {
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
            seasonAttrs: ["playoffRoundsWon"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            if (t.playoffRoundsWon === 4 ) {
                if (saveAchievement) {
//                    addAchievements(["small_market"]);
                    addAchievements(["conference_clutch"]);
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

       return team.filter({
            seasonAttrs: ["playoff64RoundsWon"],
            season: g.season,
            tid: g.userTid
        }).then(function (t) {
            if (t.playoff64RoundsWon === 6 ) {
                if (saveAchievement) {
//                    addAchievements(["sleeper_pick"]);
                    addAchievements(["national_clutch"]);
                }
                return true;
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