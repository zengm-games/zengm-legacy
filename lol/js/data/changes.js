/**
 * @name data.changes
 * @namespace Changes in gameplay to show the user.
 */
define(["lib/jquery", "util/eventLog"], function ($, eventLog) {
    "use strict";

    var all;

    all = [{
        date: "2016-01-17",
        msg: 'Custom Roster Mode makes ratings matter much more for those who want less randomness. Enable God Mode, then go to Tools > Custom Roster Mode.'
    }, {
        date: "2016-01-20",
        msg: 'Major bugs and balance issues fixed over past month. Can now upload more champions, adjust number of patch roles at any time, etc. Full list <a href="https://www.reddit.com/r/zengmlol/comments/3xvz12/bug_fixes_and_balance_adjustments/">here.</a>'
    }, {
        date: "2016-01-20",
        msg: 'Ban and pick champions on the roster page.'
    }, {
        date: "2016-01-20",
        msg: 'Champion patch data can now change every season or be fixed. Choose when starting a new league.'
    }, {
        date: "2016-01-27",
        msg: 'Champion patch data can now change gradually or with large buffs/nerfs. Choose when starting a new league.'
    }, {
        date: "2016-02-02",
        msg: 'Player MMR and Player Rank added. Player Champion Skill matters much more. MMR gives insight into how well a player does in the current Meta (Patch Data).'
    }, {
        date: "2016-02-25",
        msg: 'Shotcalling stats added for Champion Kills and Towers Destroyed'
    }, {
        date: "2016-03-15",
        msg: 'Team Player, Champion Killing, Tower Destroying, and Champion Skill team stats added .'
    }, {
        date: "2016-03-15",
        msg: 'Game simulation updated. '
    }, {
        date: "2016-04-07",
        msg: 'Player/Team Synergy added. The longer a player is with a team the more the player will outperform his MMR/OVR.'
    }, {
        date: "2016-05-02",
        msg: 'Six new possible owners added for most game types. One new possible owner for LCS w/ Ladder.'
    }, {
        date: "2016-06-12",
        msg: 'Player languanges added. Language synergy now added. Teams with players that can speak the same language will outperform their MMR/OVR.'
    }, {
        date: "2016-06-12",
        msg: 'Three players from a team/s region must be on the roster.'
    }, {
        date: "2016-06-12",
        msg: 'LCS versions now split up into NA and EU.'
    }, {
        date: "2016-06-26",
        msg: 'Each team now has a country based on player composition. Teams with players from the same country will outperform their MMR/OVR.'
    }, {
        date: "2016-11-14",
        msg: 'Want to really nerd out? Go to Tools > Export Stats.'
    }, {
        date: "2016-11-14",
        msg: 'Keep an eye on great individual performances in the new Statistical Feats page.'
    }, {
        date: "2016-12-14",
        msg: 'Did something cool in the game that you want to share? Go to Tools > Screenshot from any page.'	
    }, {
        date: "2016-12-28",
        msg: 'Enable God Mode (in the Tools menu) and then go to Tools > Multi Team Mode for some new ways to play!'						
    }, {
        date: "2017-01-07",
        msg: 'Player rating distributions for later years are more in line with the initial year.'						
    }, {
        date: "2017-01-22",
        msg: 'Add champions to existing leagues by going to Tools > Edit Champion Info. There is also a new simplified champion file for easy editing.'						
    }, {
        date: "2017-02-06",
        msg: 'Updated player ratings and free agency.'						
    }];

    function check() {
        var i, linked, text, unread;

        // Don't show anything on first visit
        if (localStorage.changesRead === undefined) {
            localStorage.changesRead = all.length;
        }

        if (localStorage.changesRead < all.length) {
            unread = all.slice(localStorage.changesRead);

            text = "";
            linked = false;

            for (i = 0; i < unread.length; i++) {
                if (i > 0) {
                    text += "<br>";
                }
                text += "<strong>" + unread[i].date + "</strong>: " + unread[i].msg;
                if (i >= 2 && (unread.length - i - 1) > 0) {
                    linked = true;
                    text += '<br><a href="/changes">...and ' + (unread.length - i - 1) + ' more changes.</a>';
                    break;
                }
            }

            if (!linked) {
                text += '<br><a href="/changes">View All Changes</a>';
            }

            eventLog.add(null, {
                type: "changes",
                text: text,
                saveToDb: false
            });

            localStorage.changesRead = all.length;
        }
    }

    return {
        all: all,
        check: check
    };
});