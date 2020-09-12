// @flow

import {account} from '../util';
import type {Conditions, GetOutput, UpdateEvents} from '../../common/types';

async function updateAccount(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
    state: any,
    conditions: Conditions,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('account')) {
        const partialTopMenu = await account.check(conditions);

        const goldUntilDate = new Date(partialTopMenu.goldUntil * 1000);
        const goldUntilDateString = goldUntilDate.toDateString();

        const currentTimestamp = Math.floor(Date.now() / 1000);
        const showGoldActive = !partialTopMenu.goldCancelled && currentTimestamp <= partialTopMenu.goldUntil;
        const showGoldCancelled = partialTopMenu.goldCancelled && currentTimestamp <= partialTopMenu.goldUntil;
        const showGoldPitch = !showGoldActive;

        return {
            email: partialTopMenu.email,
            goldMessage: inputs.goldMessage,
            goldSuccess: inputs.goldSuccess,
            goldUntilDateString,
            showGoldActive,
            showGoldCancelled,
            showGoldPitch,
            username: partialTopMenu.username,
        };
    }
}

async function updateAchievements(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun')) {
        const achievements = await account.getAchievements();

        return {
            achievements,
        };
    }
}

export default {
    runBefore: [updateAccount, updateAchievements],
};
