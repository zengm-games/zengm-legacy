// @flow

import {PHASE, g, helpers} from '../../common';
import {contractNegotiation, draft, freeAgents, game, league, phase, season, trade} from '../core';
import {idb, reset} from '../db';
import {local, lock, logEvent, toUI, updatePlayMenu, updateStatus} from '../util';
import type {Conditions} from '../../common/types';

const liveGame = async (gid: number, conditions: Conditions) => {
    await toUI(['realtimeUpdate', [], helpers.leagueUrl(["live_game"]), {fromAction: true}], conditions);
    game.play(1, conditions, true, gid);
};

const negotiate = async (pid: number, conditions: Conditions) => {
    // If there is no active negotiation with this pid, create it
    const negotiation = await idb.cache.negotiations.get(pid);
    if (!negotiation) {
        const errorMsg = await contractNegotiation.create(pid, false);
        if (errorMsg !== undefined && errorMsg) {
            logEvent({
                type: 'error',
                text: errorMsg,
                saveToDb: false,
            }, conditions);
        } else {
            toUI(['realtimeUpdate', [], helpers.leagueUrl(["negotiation", pid])], conditions);
        }
    } else {
        toUI(['realtimeUpdate', [], helpers.leagueUrl(["negotiation", pid])], conditions);
    }
};

type TradeForOptions = {
    otherDpids: number[],
    otherPids: number[],
    pid: number,
    tid: number,
    userDpids: number[],
    userPids: number[],
};

const tradeFor = async ({otherDpids, otherPids, pid, tid, userDpids, userPids}: TradeForOptions, conditions: Conditions) => {
    let teams;

    if (pid !== undefined) {
        const p = await idb.cache.players.get(pid);

        if (!p || p.tid < 0) {
            return;
        }

        // Start new trade for a single player, like a Trade For button
        teams = [{
            tid: g.userTid,
            pids: [],
            dpids: [],
        }, {
            tid: p.tid,
            pids: [pid],
            dpids: [],
        }];
    } else {
        // Start a new trade with everything specified, from the trading block
        teams = [{
            tid: g.userTid,
            pids: userPids,
            dpids: userDpids,
        }, {
            tid,
            pids: otherPids,
            dpids: otherDpids,
        }];
    }

    // Start a new trade based on a list of pids and dpids, like from the trading block
    await trade.create(teams);
    toUI(['realtimeUpdate', [], helpers.leagueUrl(["trade"])], conditions);
};

const playAmount = async (amount: 'day' | 'week' | 'month' | 'untilPreseason', conditions: Conditions) => {
    let numDays;

    if (amount === "day") {
        numDays = 1;
    } else if (amount === "week") {
		if (g.phase == g.PHASE.MSI || g.phase == g.PHASE.PLAYOFFS) {
        numDays = 7;			
		} else {
        numDays = 1;
		}
    } else if (amount === "month") {
		if (g.phase == g.PHASE.MSI || g.phase == g.PHASE.PLAYOFFS) {
        numDays = 30;			
		} else {
        numDays = 4;
		}		

    } else if (amount === "untilPreseason") {
        numDays = g.daysLeft;
    } else {
        throw new Error(`Invalid amount: ${amount}`);
    }


    if (g.phase <= g.PHASE.PLAYOFFS) {
        await updateStatus('Playing...'); // For quick UI updating, before game.play
        // Start playing games
        game.play(numDays, conditions);
    } else if (g.phase === g.PHASE.FREE_AGENCY) {
        if (numDays > g.daysLeft) {
            numDays = g.daysLeft;
        }
        freeAgents.play(numDays, conditions);
    }
};

const playStop = async () => {
    lock.set('stopGameSim', true);
    if (g.phase !== g.PHASE.FREE_AGENCY) {
        // This is needed because we can't be sure if core.game.play will be called again
        await updateStatus('Idle');
    }
    lock.set('gameSim', false);
    await updatePlayMenu();
};

const playMenu = {
    stop: async () => {
        await playStop();
    },

    day: async (conditions: Conditions) => {
        await playAmount('day', conditions);
    },

    week: async (conditions: Conditions) => {
        await playAmount('week', conditions);
    },

    month: async (conditions: Conditions) => {
        await playAmount('month', conditions);
    },

    untilMSI: async (conditions: Conditions) => {
        if (g.phase < g.PHASE.MSI) {		
            await updateStatus('Playing...'); // For quick UI updating, before await
            const numDays = await season.getDaysLeftSchedule();
            game.play(numDays, conditions);
        }
    },	
	
    throughMSI: async (conditions: Conditions) => {
        if (g.phase === g.PHASE.MSI) {
            await updateStatus('Playing...'); // For quick UI updating, before await
            const msiSeries = await idb.cache.msiSeries.get(g.season);

            // Max 7 days per round that hasn't started yet
            //const numDaysFutureRounds = (g.numPlayoffRounds - 1 - playoffSeries.currentRound) * 7;

            // All current series are in sync, so just check one and see how many games are left
            //const series = playoffSeries.series[playoffSeries.currentRound][0];
//            const numDaysThisSeries = 7 - series.home.won - series.away.won;
            //const numDaysThisSeries = 5;

            const numDays = 100;
//            const numDays = numDaysFutureRounds + numDaysThisSeries;
            game.play(numDays, conditions);
        }
    },
	
    untilMidseason: async (conditions: Conditions) => {
        await playAmount('untilMidseason', conditions);
    },	
	
    untilPlayoffs: async (conditions: Conditions) => {
        if (g.phase < g.PHASE.PLAYOFFS) {

			
            await updateStatus('Playing...'); // For quick UI updating, before await
            const numDays = await season.getDaysLeftSchedule();
            game.play(numDays, conditions);
        }
    },

    throughPlayoffs: async (conditions: Conditions) => {
        if (g.phase === g.PHASE.PLAYOFFS) {
            await updateStatus('Playing...'); // For quick UI updating, before await
            const playoffSeries = await idb.cache.playoffSeries.get(g.season);

            // Max 7 days per round that hasn't started yet
            //const numDaysFutureRounds = (g.numPlayoffRounds - 1 - playoffSeries.currentRound) * 7;

            // All current series are in sync, so just check one and see how many games are left
            //const series = playoffSeries.series[playoffSeries.currentRound][0];
//            const numDaysThisSeries = 7 - series.home.won - series.away.won;
            //const numDaysThisSeries = 5;

            const numDays = 100;
//            const numDays = numDaysFutureRounds + numDaysThisSeries;
            game.play(numDays, conditions);
        }
    },

    untilDraft: async (conditions: Conditions) => {
        if (g.phase === g.PHASE.BEFORE_DRAFT) {
            await phase.newPhase(g.PHASE.DRAFT, conditions);
        }
    },

    untilResignPlayers: async (conditions: Conditions) => {
        if (g.phase === g.PHASE.BEFORE_DRAFT) {
//        if (g.phase === g.PHASE.AFTER_DRAFT) {
            await phase.newPhase(g.PHASE.RESIGN_PLAYERS, conditions);
        }
    },

    untilFreeAgency: async (conditions: Conditions) => {
        if (g.phase === g.PHASE.RESIGN_PLAYERS) {
            const negotiations = await idb.cache.negotiations.getAll();
            const numRemaining = negotiations.length;

            // Show warning dialog only if there are players remaining un-re-signed
            let proceed = true;
            if (numRemaining > 0) {
                proceed = await toUI(['confirm', `Are you sure you want to proceed to free agency while ${numRemaining} of your players remain unsigned? If you do not re-sign them before free agency begins, they will be free to sign with any team, and you won't be able to go over the salary cap to sign them.`], conditions);
            }
            if (proceed) {
                await phase.newPhase(g.PHASE.FREE_AGENCY, conditions);
                await updateStatus(`${g.daysLeft} days left`);
            }
        }
    },

    untilPreseason: async (conditions: Conditions) => {
        await playAmount('untilPreseason', conditions);
    },

    /*untilRegularSeason: async (conditions: Conditions) => {
        if (g.phase === g.PHASE.PRESEASON) {
            await phase.newPhase(g.PHASE.REGULAR_SEASON, conditions);
        }
    },*/
	
    untilRegularSeason: async (conditions: Conditions) => {
        if (g.phase === g.PHASE.PRESEASON) {
            await phase.newPhase(g.PHASE.REGULAR_SEASON, conditions);
        }
    },	
	
    untilSecondHalf: async (conditions: Conditions) => 	{	
        if (g.phase === g.PHASE.MIDSEASON) {
            await phase.newPhase(g.PHASE.SECOND_HALF, conditions);
        }
    },	
    stopAuto: async () => {
        local.autoPlaySeasons = 0;
        updatePlayMenu();
        await playStop();
    },
};

const toolsMenu = {
    autoPlaySeasons: (conditions: Conditions) => {
        league.initAutoPlay(conditions);
    },

    skipToMSI: async (conditions: Conditions) => {
        await phase.newPhase(g.PHASE.MSI, conditions);
    },

    skipToMidseason: async (conditions: Conditions) => {
        await phase.newPhase(g.PHASE.MIDSEASON, conditions);
    },	

    skipToPlayoffs: async (conditions: Conditions) => {
        await phase.newPhase(g.PHASE.PLAYOFFS, conditions);
    },

    skipToBeforeDraft: async (conditions: Conditions) => {
        await phase.newPhase(g.PHASE.BEFORE_DRAFT, conditions);
    },

    skipToAfterDraft: async (conditions: Conditions) => {
        await phase.newPhase(g.PHASE.AFTER_DRAFT, conditions);
    },

    skipToPreseason: async (conditions: Conditions) => {
        await phase.newPhase(g.PHASE.PRESEASON, conditions);
    },

    forceResumeDraft: async (conditions: Conditions) => {
        await draft.untilUserOrEndFantasy(conditions);
    },

    resetDb: async (conditions: Conditions) => {
        const response = await toUI(['confirm', 'Are you sure you want to reset the database? This will delete all your current saved games.'], conditions);
        if (response) {
            await reset();
        }
    },
};

export default {
    liveGame,
    negotiate,
    playMenu,
    toolsMenu,
    tradeFor,
};
