// @flow

/*eslint camelcase: 0*/
import {SPORT, fetchWrapper, g} from '../../common';
import {season} from '../core';
import {idb} from '../db';
import {env, logEvent, toUI} from '../util';
import type {AchievementKey, Conditions, PartialTopMenu} from '../../common/types';

// IF YOU ADD TO THIS you also need to add to the whitelist in add_achievements.php
const allAchievements: {
    slug: AchievementKey,
    name: string,
    desc: string,
    count?: number,
}[] = [ {
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
        slug: "coach_easy",
        name: "Bronze Coach",
        desc: "Win 1 championship as a coach on easy mode."
    }, {
        slug: "coach_medium",
        name: "Silver Coach",
        desc: "Win 1 championship as a coach on medium mode."
    }, {
        slug: "coach_hard",
        name: "Challenger Coach",
        desc: "Win 1 championship as a coach on hard mode."
    }, {
        slug: "coach_impossible",
        name: "Coach Faker",
        desc: "Win 1 championship as a coach on impossible mode."
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
    /*slug: "fo_fo_fo",
    name: "Fo Fo Fo",
    desc: "Go 16-0 in the playoffs.",
}, {
    slug: "septuawinarian",
    name: "Septuawinarian",
    desc: "Win 70+ games in the regular season.",
}, {
    slug: "98_degrees",
    name: "98 Degrees",
    desc: "Go 98-0 in the playoffs and regular season.",
}, {
    slug: "dynasty",
    name: "Dynasty",
    desc: "Win 6 championships in 8 years.",
}, {
    slug: "dynasty_2",
    name: "Dynasty 2",
    desc: "Win 8 championships in a row.",
}, {
    slug: "dynasty_3",
    name: "Dynasty 3",
    desc: "Win 11 championships in 13 years.",
}, {
    slug: "moneyball",
    name: "Moneyball",
    desc: "Win a title with a payroll under $60 million.",
}, {
    slug: "moneyball_2",
    name: "Moneyball 2",
    desc: "Win a title with a payroll under $45 million.",
}, {
    slug: "hardware_store",
    name: "Hardware Store",
    desc: "Players on your team win MVP, DPOY, SMOY, ROY, and Finals MVP in the same season.",
}, {
    slug: "small_market",
    name: "Small Market",
    desc: "Win a title in a city with under 2 million people.",
}, {
    slug: "sleeper_pick",
    name: "Sleeper Pick",
    desc: "Use a non-lottery pick to draft the ROY.",
}, {*/
    slug: "hacker",
    name: "Hacker",
    desc: 'Privately report a security issue in the account system or some other part of the site.',
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
async function addAchievements(achievements: AchievementKey[], conditions: Conditions, silent?: boolean = false) {
    const notify = slug => {
        if (silent) {
            return;
        }

        // Find name of achievement
        for (let i = 0; i < allAchievements.length; i++) {
            if (allAchievements[i].slug === slug) {
                logEvent({
                    type: "achievement",
                    text: `"${allAchievements[i].name}" achievement awarded! <a href="/account">View all achievements.</a>`,
                    saveToDb: false,
                }, conditions);
                break;
            }
        }
    };

    const addToIndexedDB = achievements2 => {
        return idb.meta.tx('achievements', 'readwrite', (tx) => {
            for (const achievement of achievements2) {
                tx.achievements.add({slug: achievement});
                notify(achievement);
            }
        });
    };

    try {
        const data = await fetchWrapper({
            url: `//account.basketball-gm.${env.tld}/add_achievements.php`,
            method: 'POST',
            data: {achievements, sport: SPORT},
            credentials: 'include',
        });

        if (data.success) {
            achievements.forEach(notify);
        } else {
            return addToIndexedDB(achievements);
        }
    } catch (err) {
        return addToIndexedDB(achievements);
    }
}

async function check(conditions: Conditions): Promise<PartialTopMenu> {
    try {
        const data = await fetchWrapper({
            url: `//account.basketball-gm.${env.tld}/user_info.php`,
            method: 'GET',
            data: {sport: SPORT},
            credentials: 'include',
        });

        const partialTopMenu: PartialTopMenu = {
            email: data.email,
            goldCancelled: !!data.gold_cancelled,
            goldUntil: data.gold_until,
            username: data.username,
        };
        await toUI(['emit', 'updateTopMenu', partialTopMenu]);

        await toUI(['initAds', data.gold_until]);

        // If user is logged in, upload any locally saved achievements
        if (data.username !== '' && idb.league !== undefined) {
            // Should be done inside one transaction to eliminate race conditions, but Firefox doesn't like that and the
            // risk is very small.
            let achievements = await idb.league.achievements.getAll();
            achievements = achievements.map(achievement => achievement.slug);
            // If any exist, delete and upload
            if (achievements.length > 0) {
                await idb.league.achievements.clear();
                // If this fails to save remotely, will be added to IDB again
                await addAchievements(achievements, conditions, true);
            }
        }

        return partialTopMenu;
    } catch (err) {
        // Don't freak out if an AJAX request fails or whatever
        console.log(err);

        return {
            email: '',
            goldCancelled: false,
            goldUntil: Infinity,
            username: '',
        };
    }
}

async function getAchievements() {
    const achievements = allAchievements.slice();
    const achievementsLocal = await idb.meta.achievements.getAll();

    // Initialize counts
    for (let i = 0; i < achievements.length; i++) {
        achievements[i].count = 0;
    }

    // Handle any achivements stored in IndexedDB
    for (let j = 0; j < achievementsLocal.length; j++) {
        for (let i = 0; i < achievements.length; i++) {
            if (achievements[i].slug === achievementsLocal[j].slug) {
                achievements[i].count += 1;
            }
        }
    }

    try {
        // Handle any achievements stored in the cloud
        const achievementsRemote = await fetchWrapper({
            url: `//account.basketball-gm.${env.tld}/get_achievements.php`,
            method: 'GET',
            data: {sport: SPORT},
            credentials: 'include',
        });

        // Merge local and remote achievements
        for (let i = 0; i < achievements.length; i++) {
            if (achievementsRemote[achievements[i].slug] !== undefined) {
                achievements[i].count += achievementsRemote[achievements[i].slug];
            }
        }

        return achievements;
    } catch (err) {
        // If remote fails, still return local achievements
        return achievements;
    }
}

// FOR EACH checkAchievement FUNCTION:
// Returns a promise that resolves to true or false depending on whether the achievement was awarded.
// HOWEVER, it's only saved to the database if saveAchievement is true (this is the default), but the saving happens asynchronously. It is theoretically possible that this could cause a notification to be displayed to the user about getting an achievement, but some error occurs when saving it.
const checkAchievement = {};

checkAchievement.fo_fo_fo = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    const playoffSeries = await idb.getCopy.playoffSeries({season: g.season});
    if (playoffSeries === undefined) {
        // Should only happen if playoffs are skipped
        return false;
    }

    const series = playoffSeries.series;

	var seriesStart,seriesEnd;
	var startingRound;

    for (let round = 0; round < series.length; round++) {
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
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				seriesStart = 10;
				seriesEnd = 11;
			} else if (g.gameType == 3 &&  g.yearType == 2019) {
				seriesStart = 51;
				seriesEnd = 53;
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
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				seriesStart = 8;
				seriesEnd = 9;
			} else if (g.gameType == 3 &&  g.yearType == 2019) {
				seriesStart = 38;
				seriesEnd = 40;
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
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				seriesStart = 7;
				seriesEnd = 8;
			} else if (g.gameType == 3 &&  g.yearType == 2019) {
				seriesStart = 31;
				seriesEnd = 33;
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
			} else if (g.gameType == 3 && (g.yearType == undefined || g.yearType == 0)) {
				seriesStart = 2;
				seriesEnd = 4;
			} else if (g.gameType == 3 &&  g.yearType == 2019) {
				seriesStart = 4;
				seriesEnd = 5;
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

	var startEnd = season.seriesStartEnd(round);
	seriesStart = startEnd.seriesStart;
	seriesEnd = startEnd.seriesEnd;

        let found = false;
//        for (let i = 0; i < series[round].length; i++) {

	//// shouldn't this be reversed?
        for (let i = seriesStart; i < seriesEnd; i++) {
			i = season.seriesStartEndSkip(seriesStart,seriesEnd,round, i);
            if ( series[round][i].away.tid === g.userTid || series[round][i].home.tid === g.userTid) {
//            if (series[round][i].away.tid === g.userTid) {
                found = true;
                break;
            }
        }

        for (let i = seriesStart; i < seriesEnd; i++) {
			i = season.seriesStartEndSkip(seriesStart,seriesEnd,round, i);
            if ( (series[round][i].away.won < 3 || series[round][i].home.won > 0) && series[round][i].away.tid === g.userTid) {
//            if (series[round][i].away.tid === g.userTid) {
                found = false;
                break;
            }
            if ( (series[round][i].home.won < 3 && series[round][i].away.won > 0) && series[round][i].home.tid === g.userTid) {
//            if (series[round][i].home.tid === g.userTid) {
                found = false;
                break;
            }
        }
       /* if (!found) {
            return false;
        }*/
		return found;
    }

    if (saveAchievement) {
       // addAchievements(["fo_fo_fo"], conditions);
    }
    return true;
};

//checkAchievement.septuawinarian = async (conditions: Conditions, saveAchievement: boolean = true) => {
checkAchievement.eating = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    const t = await idb.getCopy.teamsPlus({
        seasonAttrs: ["won"],
        season: g.season,
        tid: g.userTid,
    });

	var numGames;

	if ((g.gameType == 0) || (g.gameType == 2)){
	   numGames = 18;
	} else if ((g.gameType == 3) ){
	   numGames = 22;
	} else if ((g.gameType == 4) ){
	   numGames = 14;
	}
	//// need to add Worlds and Worlds w/ Ladder

    if (t.seasonAttrs.won >= numGames) {
        if (saveAchievement) {
            addAchievements(["eating"], conditions);
        }
        return true;
    }

    return false;
};

//checkAchievement["98_degrees"] = async (conditions: Conditions, saveAchievement: boolean = true) => {
checkAchievement.fed  = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    const awarded = await checkAchievement.fo_fo_fo(conditions, false);
    if (awarded) {
        const t = await idb.getCopy.teamsPlus({
            seasonAttrs: ["won", "lost"],
            season: g.season,
            tid: g.userTid,
        });

		var numGames;

		if ((g.gameType == 0) || (g.gameType == 2)){
		   numGames = 18;
		} else if ((g.gameType == 3) ){
		   numGames = 22;
		} else if ((g.gameType == 4) ){
		   numGames = 14;
		}

        if (t.seasonAttrs.won === numGames && t.seasonAttrs.lost === 0) {
            if (saveAchievement) {
                addAchievements(["fed"], conditions);
            }
            return true;
        }
    }

    return false;
};



checkAchievement.ace  = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    if (g.gameType < 5) {
        return false;
    }
console.log(g.confs);
    const awarded = await checkDynasty(1, 1, "wood", conditions, false);
    if (awarded) {
		if (saveAchievement) {
			addAchievements(["ace"], conditions);
		}
		return true;
    }

    return false;
};


checkAchievement["penta_kill"]   = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    if (g.gameType < 5) {
        return false;
    }

    const awarded = await checkDynasty(5, 5, "unstoppable", conditions, false);
    if (awarded) {
		if (saveAchievement) {
			addAchievements(["penta_kill"], conditions);
		}
		return true;
    }

    return false;
};

// FOR EACH checkAchievement FUNCTION:
// Returns a promise that resolves to true or false depending on whether the achievement was awarded.
// HOWEVER, it's only saved to the database if saveAchievement is true (this is the default), but the saving happens asynchronously. It is theoretically possible that this could cause a notification to be displayed to the user about getting an achievement, but some error occurs when saving it.


checkAchievement.world_beater = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    const playoffSeries = await idb.getCopy.playoffSeries({season: g.season});
    if (playoffSeries === undefined) {
        // Should only happen if playoffs are skipped
        return false;
    }

    const series = playoffSeries.series;
	var seriesStart, seriesEnd;

    for (let round = 0; round < series.length; round++) {


        let found = false;
//        for (let i = 0; i < series[round].length; i++) {

	//// shouldn't this be reversed?
        for (let i = seriesStart; i < seriesEnd; i++) {
            if ( series[round][i].away.tid === g.userTid || series[round][i].home.tid === g.userTid) {
//            if (series[round][i].away.tid === g.userTid) {
                found = true;
                break;
            }
        }

        for (let i = seriesStart; i < seriesEnd; i++) {

            if ( (series[round][i].away.won < 3 || series[round][i].home.won > 0) && series[round][i].away.tid === g.userTid) {
//            if (series[round][i].away.tid === g.userTid) {
                found = false;
                break;
            }
            if ( (series[round][i].home.won < 3 && series[round][i].away.won > 0) && series[round][i].home.tid === g.userTid) {
//            if (series[round][i].home.tid === g.userTid) {
                found = false;
                break;
            }
        }
       /* if (!found) {
            return false;
        }*/
		return found;
    }

    if (saveAchievement) {
        addAchievements(["world_beater"], conditions);
    }
    return true;
};

async function checkDynasty(titles: number, years: number, slug: AchievementKey, conditions: Conditions, saveAchievement: boolean): Promise<boolean> {
    if (g.godModeInPast) {
        return false;
    }

    const teamSeasons = await idb.getCopies.teamSeasons({tid: g.userTid});

	var champRounds = 3;

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
	} else if (g.gameType == 7 || g.gameType == 6) {
			champRounds = 3;
	}


    let titlesFound = 0;
    // Look over past years
	var actualWon;
    for (let i = 0; i < years; i++) {
        // Don't overshoot
        if (teamSeasons.length - 1 - i < 0) {
            break;
        }

		if (g.gameType == 7 || g.gameType == 6) {
			actualWon = teamSeasons[teamSeasons.length - 1 - i].playoffRoundsWonWorlds;
		} else {
			actualWon = teamSeasons[teamSeasons.length - 1 - i].playoffRoundsWon;
		}

        // Won title?
//        if (teamSeasons[teamSeasons.length - 1 - i].playoffRoundsWon === g.numPlayoffRounds) {
//        if (teamSeasons[teamSeasons.length - 1 - i].playoffRoundsWon === champRounds) {
        if (actualWon === champRounds) {
            titlesFound += 1;
        }
    }

    if (titlesFound >= titles) {
        if (saveAchievement) {
            addAchievements([slug], conditions);

			if (slug == "wood") {
				if (g.GMCoachType == 1) {
					addAchievements(["coach_easy"], conditions);
				} else if (g.GMCoachType == 2) {
					addAchievements(["coach_medium"], conditions);
				} else if (g.GMCoachType == 3) {
					addAchievements(["coach_hard"], conditions);
				} else if (g.GMCoachType == 4) {
					addAchievements(["coach_impossible"], conditions);
				}

			}
        }
        return true;
    }

    return false;
}

checkAchievement.killing_spree = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(3, 3, "killing_spree", conditions, saveAchievement);
checkAchievement.rampage = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(4, 4, "rampage", conditions, saveAchievement);
checkAchievement.unstoppable = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(5, 5, "unstoppable", conditions, saveAchievement);
checkAchievement.dominating = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(6, 6, "dominating", conditions, saveAchievement);
checkAchievement.godlike = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(7, 7, "godlike", conditions, saveAchievement);
checkAchievement.legendary = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(8, 8, "legendary", conditions, saveAchievement);
checkAchievement.wood = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(1, 1, "wood", conditions, saveAchievement);
checkAchievement.bronze = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(2, 4, "bronze",  conditions, saveAchievement);
checkAchievement.silver = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(3, 3, "silver", conditions, saveAchievement);
checkAchievement.gold = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(6, 9, "gold", conditions, saveAchievement);
checkAchievement.platinum = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(8, 8, "platinum", conditions, saveAchievement);
checkAchievement.diamond = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(11, 13, "diamond", conditions, saveAchievement);
checkAchievement.master = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(13, 13, "master", conditions, saveAchievement);
checkAchievement.challenger = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(20, 22, "challenger", conditions, saveAchievement);
checkAchievement.pro = (conditions: Conditions, saveAchievement: boolean = true) => checkDynasty(22, 22, "pro", conditions, saveAchievement);


checkAchievement.first_blood   = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    if (g.gameType < 5) {
        return false;
    }

    const awarded = await checkFirstSeason(g.startingSeason, "first_blood", conditions, false);
    if (awarded) {
		if (saveAchievement) {
			addAchievements(["first_blood"], conditions);
		}
		return true;
    }

    return false;
};

async function checkFirstSeason(firstSeason: number, slug: AchievementKey, conditions: Conditions, saveAchievement: boolean): Promise<boolean> {
    if (g.godModeInPast) {
        return false;
    }

    const teamSeasons = await idb.getCopies.teamSeasons({tid: g.userTid});

	var champRounds = 3;

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


    //let titlesFound = 0;
    // Look over past years
  //  for (let i = 0; i < years; i++) {
        // Don't overshoot
	if (teamSeasons.length - 1 < 0) {
		return false;
	}

	// Won title?
//        if (teamSeasons[teamSeasons.length - 1 - i].playoffRoundsWon === g.numPlayoffRounds) {
	if (teamSeasons[teamSeasons.length - 1 ].playoffRoundsWon === champRounds && g.season == firstSeason) {
		addAchievements([slug], conditions);
		return true;
	}
   // }

    return false;
}


async function checkMoneyball(maxPayroll, slug, conditions: Conditions, saveAchievement) {
    if (g.godModeInPast) {
        return false;
    }

    const t = await idb.getCopy.teamsPlus({
        seasonAttrs: ["expenses", "playoffRoundsWon"],
        season: g.season,
        tid: g.userTid,
    });


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

//    if (t.seasonAttrs.playoffRoundsWon === g.numPlayoffRounds && t.seasonAttrs.expenses.salary.amount <= maxPayroll) {
    if (t.seasonAttrs.playoffRoundsWon === champRounds  && t.seasonAttrs.expenses.salary.amount <= maxPayroll) {
        if (saveAchievement) {
            addAchievements([slug], conditions);
        }
        return true;
    }

    return false;
}

checkAchievement.ladder_climber = (conditions: Conditions, saveAchievement: boolean = true) => checkMoneyball(200000,  "ladder_climber", conditions, saveAchievement);

//checkAchievement.moneyball_2 = (conditions: Conditions, saveAchievement: boolean = true) => checkMoneyball(45000, "moneyball_2", conditions, saveAchievement);

checkAchievement.ladder_climber2   = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    if ((g.gameType != 1) || (g.userTid <= 15)) {
        return false;
    }

    const awarded = await checkDynasty(1, 1, "wood", conditions, false);
    if (awarded) {
		if (saveAchievement) {
			addAchievements(["ladder_climber2"], conditions);
		}
		return true;
    }

    return false;
};

checkAchievement.hardware_store = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    const awards = await idb.getCopy.awards({season: g.season});

//    if (awards !== undefined && awards.mvp.tid === g.userTid && awards.dpoy.tid === g.userTid && awards.smoy.tid === g.userTid && awards.roy.tid === g.userTid && awards.finalsMvp.tid === g.userTid) {
	if (awards !== undefined) {
		if (awards.mvp  !== undefined) {
			if (awards.mvp.tid  !== undefined) {
				if (awards.mvp.tid === g.userTid  && awards.finalsMvp.tid === g.userTid) {
					if (saveAchievement) {
						addAchievements(["hardware_store"], conditions);
					}
					return true;
				}
			}
		}
	}

    return false;
};

/*checkAchievement.small_market = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    const t = await idb.getCopy.teamsPlus({
        seasonAttrs: ["playoffRoundsWon", "pop"],
        season: g.season,
        tid: g.userTid,
    });

    if (t.seasonAttrs.playoffRoundsWon === g.numPlayoffRounds && t.seasonAttrs.pop <= 2) {
        if (saveAchievement) {
            addAchievements(["small_market"], conditions);
        }
        return true;
    }

    return false;
};

checkAchievement.sleeper_pick = async (conditions: Conditions, saveAchievement: boolean = true) => {
    if (g.godModeInPast) {
        return false;
    }

    const awards = await idb.getCopy.awards({season: g.season});
    if (awards && awards.roy && awards.roy.tid === g.userTid) {
        const p = await idb.cache.players.get(awards.roy.pid);
        if (p.tid === g.userTid && p.draft.tid === g.userTid && p.draft.year === g.season - 1 && (p.draft.round > 1 || p.draft.pick >= 15)) {
            if (saveAchievement) {
                addAchievements(["sleeper_pick"], conditions);
            }
            return true;
        }
    }

    return false;
};*/

export default {
    check,
    getAchievements,
    addAchievements,
    checkAchievement,
};
