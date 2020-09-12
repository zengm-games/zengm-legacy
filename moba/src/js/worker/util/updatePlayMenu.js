// @flow

import {PHASE, g, helpers} from '../../common';
import {local, lock, toUI} from '../util';

/**
* Update play menu options based on game state.
*
* @memberOf ui
* @return {Promise}
*/
const updatePlayMenu = async () => {
    // $FlowFixMe
    if (typeof it === 'function') { return; }

    const allOptions: {
        [key: string]: {
            id?: string,
            label: string,
            url?: string,
        }
    } = {
        stop: {label: "Stop"},
        day: {label: "One day"},
        week: {label: "One week"},
        month: {label: "One month"},
        untilMSI: {label: "Until MSI"},
        throughMSI: {label: "Through MSI"},
        untilMidseason: {label: "Until midseason"},		
        untilPlayoffs: {label: "Until playoffs"},
        throughPlayoffs: {label: "Through playoffs"},
        dayLive: {url: helpers.leagueUrl(["live"]), label: "One day (live)"},
        weekLive: {url: helpers.leagueUrl(["live"]), label: "One week (live)"},
        untilDraft: {label: "Until draft"},
        viewPicksBans: {url: helpers.leagueUrl(["picks_bans"]), label: "View draft"},
        viewDraft: {url: helpers.leagueUrl(["draft"]), label: "View draft"},
        viewCoachOptions: {url: helpers.leagueUrl(["god_mode2"]), label: "View coach options"},
        untilResignPlayers: {label: "Re-sign players with expiring contracts"},
        untilFreeAgency: {label: "Until free agency"},
        untilPreseason: {label: "Until preseason"},
        untilRegularSeason: {label: "Until regular season"},
        untilSecondHalf: {label: "Until second half"},
        contractNegotiation: {url: helpers.leagueUrl(["negotiation"]), label: "Continue contract negotiation"},
        contractNegotiationList: {url: helpers.leagueUrl(["negotiation"]), label: "Continue re-signing players"},
        message: {url: helpers.leagueUrl(["message"]), label: "Read new message"},
        newLeague: {url: "/new_league", label: "Try again in a new league"},
        newTeam: {url: helpers.leagueUrl(["new_team"]), label: "Try again with a new team"},
        jobOffer: {url: helpers.leagueUrl(["new_team"]), label: "Review other teams offering jobs"},
        stopAuto: {label: `Stop auto play (${local.autoPlaySeasons} seasons left)`},
    };

    let keys = [];
    if (g.phase === g.PHASE.PRESEASON) {
        // Preseason
        keys = ["untilRegularSeason"];
    } else if ( (g.phase === g.PHASE.REGULAR_SEASON ) && (g.gameType >= 6) ) {
        // Regular season - pre trading deadline
		if (g.GMCoachType == 0) {
			if (g.gameType >= 6) {
//				keys = ["day", "dayLive", "week", "month", "untilMSI"];			
				keys = [ "week","weekLive", "month", "untilMSI"];			
			} else {
//				keys = ["day", "dayLive", "week", "month", "untilPlayoffs"];			
				keys = ["week","weekLive", "month", "untilPlayoffs"];			
			}
		} else {
			if (g.gameType >= 6) {
	//			keys = ["viewCoachOptions","viewPicksBans", "day", "dayLive", "week", "month", "untilMSI"];
				keys = ["viewCoachOptions","viewPicksBans", "week","weekLive", "month", "untilMSI"];
			} else {
//				keys = ["viewCoachOptions","viewPicksBans", "day", "dayLive", "week", "month", "untilPlayoffs"];
				keys = ["viewCoachOptions","viewPicksBans","week","weekLive", "month", "untilPlayoffs"];
			}			
		}
    } else if (g.phase === g.PHASE.REGULAR_SEASON) {
        // Regular season - pre trading deadline
		if (g.GMCoachType == 0) {
	//		keys = ["day", "dayLive", "week", "month", "untilPlayoffs"];			
			keys = ["week","weekLive", "month", "untilPlayoffs"];			

		} else {
//			keys = ["viewCoachOptions","viewPicksBans", "day", "dayLive", "week", "month", "untilPlayoffs"];
			keys = ["viewCoachOptions","viewPicksBans", "week","weekLive","month", "untilPlayoffs"];
		}
    } else if ( (g.phase === g.PHASE.AFTER_TRADE_DEADLINE) && (g.gameType >= 6) ) {
        // Regular season - post trading deadline
 		if (g.GMCoachType == 0) {
//			keys = ["day", "dayLive", "week", "month", "untilMSI"];			
			keys = ["week","weekLive","month", "untilMSI"];			
		} else {
//			keys = ["viewCoachOptions","viewPicksBans", "day", "dayLive", "week", "month", "untilMSI"];
			keys = ["viewCoachOptions","viewPicksBans","week","weekLive", "month", "untilMSI"];
		}
    } else if (g.phase === g.PHASE.AFTER_TRADE_DEADLINE) {
        // Regular season - post trading deadline
 		if (g.GMCoachType == 0) {
//			keys = ["day", "dayLive", "week", "month", "untilPlayoffs"];			
			keys = ["week","weekLive",  "month", "untilPlayoffs"];			
		} else {
//			keys = ["viewCoachOptions","viewPicksBans",  "day", "dayLive", "week", "month", "untilPlayoffs"];
			keys = ["viewCoachOptions","viewPicksBans","week","weekLive",  "month", "untilPlayoffs"];
		}
    } else if (g.phase === g.PHASE.MSI) {
        // Playoffs
 		if (g.GMCoachType == 0) {
			keys = ["day", "dayLive", "week", "month", "throughMSI"];			
		} else {
			keys = ["viewCoachOptions","viewPicksBans", "day", "dayLive", "week", "month", "throughMSI"];
		}
    } else if (g.phase === g.PHASE.MIDSEASON) {
        // Offseason - pre draft
//        keys = ["untilDraft"];
//        keys = ["untilMidseason"];		
        keys = ["untilSecondHalf"];		
    } else if (g.phase === g.PHASE.SECOND_HALF) {
        // Regular season - pre trading deadline
 		if (g.GMCoachType == 0) {
		//	keys = ["day", "dayLive", "week", "month", "untilPlayoffs"];
			keys = ["week","weekLive", "month", "untilPlayoffs"];
		} else {
			//keys = ["viewCoachOptions","viewPicksBans", "day", "dayLive", "week", "month", "untilPlayoffs"];
			keys = ["viewCoachOptions","viewPicksBans", "week","weekLive", "month", "untilPlayoffs"];
		}
    } else if (g.phase === g.PHASE.PLAYOFFS) {
        // Playoffs
		if (g.GMCoachType == 0) {
			keys = ["day", "dayLive", "week", "month", "throughPlayoffs"];
		} else {
			keys = ["viewCoachOptions","viewPicksBans", "day", "dayLive", "week", "month", "throughPlayoffs"];
		}
    } else if (g.phase === g.PHASE.BEFORE_DRAFT) {
        // Offseason - pre draft
//        keys = ["untilDraft"];
		if (g.godMode) {
			keys = ["untilResignPlayers"];
		} else {
			keys = ["jobOffer","untilResignPlayers"];
		}
    } else if (g.phase === g.PHASE.DRAFT || g.phase === g.PHASE.FANTASY_DRAFT) {
        // Draft
        keys = ["viewDraft"];
    } else if (g.phase === g.PHASE.AFTER_DRAFT) {
        // Offseason - post draft
        keys = ["untilResignPlayers"];
    } else if (g.phase === g.PHASE.RESIGN_PLAYERS) {
        // Offseason - re-sign players
        keys = ["contractNegotiationList", "untilFreeAgency"];
    } else if (g.phase === g.PHASE.FREE_AGENCY) {
        // Offseason - free agency
        keys = ["day", "week", "untilPreseason"];
    }

    const unreadMessage = await lock.unreadMessage();
    const negotiationInProgress = await lock.negotiationInProgress();

    if (unreadMessage) {
        keys = ["message"];
    }
    if (lock.get('gameSim')) {
        keys = ["stop"];
    }
    if (negotiationInProgress && g.phase !== g.PHASE.RESIGN_PLAYERS) {
        keys = ["contractNegotiation"];
    }
    if (lock.get('newPhase')) {
        keys = [];
    }

    // If there is an unread message, it's from the owner saying the player is fired, so let the user see that first.
    if (g.gameOver && !unreadMessage) {
        keys = ["newTeam", "newLeague"];
    }

    if (local.autoPlaySeasons > 0) {
        keys = ["stopAuto"];
    }

    const someOptions = keys.map(id => {
        allOptions[id].id = id;
        return allOptions[id];
    });

    toUI(['emit', 'updateTopMenu', {options: someOptions}]);
};

export default updatePlayMenu;
