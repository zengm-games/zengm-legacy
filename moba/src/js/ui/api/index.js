// @flow

import {g, helpers} from '../../common';
import {ads, emitter, realtimeUpdate} from '../util';
import {showEvent} from '../util/logEvent';
import type {GameAttributes, LogEventShowOptions, UpdateEvents} from '../../common/types';

/**
 * Ping a counter at basketball-gm.com.
 *
 * This should only do something if it isn't being run from a unit test and it's actually on basketball-gm.com.
 *
 * @memberOf util.helpers
 * @param {string} type Either "league" for a new league, or "season" for a completed season
 */
const bbgmPing = (type: 'league' | 'season') => {
    if (window.enableLogging && window.ga) {
        if (type === 'league') {
            window.ga('send', 'event', 'MOBAGM', 'New league', String(g.lid));
        } else if (type === 'season') {
            window.ga('send', 'event', 'MOBAGM', 'Completed season', String(g.season));
        }
    }
};

const confirm = (message: string) => {
    return window.confirm(message);
};

const emit = (name: string, content: any) => {
    emitter.emit(name, content);
};

const initAds = () => {
    window.bbgmAds.cmd.push(() => {
        // Show hidden divs. skyscraper has its own code elsewhere to manage display.
        const showDivs =
          window.screen && window.screen.width < 768
            ? ["bbgm-ads-mobile"]
            : [
                "bbgm-ads-top",
                "bbgm-ads-bottom1",
                "bbgm-ads-bottom2",
                "skyscraper-wrapper"
              ];
    
        for (const id of showDivs) {
          const div = document.getElementById(id);
    
          if (div) {
            div.style.removeProperty("display");
          }
        }
    
        const adDivs =
          window.screen && window.screen.width < 768
            ? ["bbgm-ads-mobile"]
            : [
                "bbgm-ads-top",
                "bbgm-ads-bottom1",
                "bbgm-ads-bottom2",
                "bbgm-ads-skyscraper"
              ];
        window.bbgmAds.init(adDivs).then(() => {
          if (window.screen && window.screen.width >= 768) {
            // Show the logo too
            const logo = document.getElementById("bbgm-ads-logo");
    
            if (logo) {
              logo.style.display = "flex";
            }
          }
        });
    });
};

// Should only be called from Shared Worker, to move other tabs to new league because only one can be open at a time
const newLid = async (lid: number) => {
    const parts = location.pathname.split('/');
    if (parseInt(parts[2], 10) !== lid) {
        parts[2] = String(lid);
        const newPathname = parts.join('/');
        await realtimeUpdate(['firstRun'], newPathname);
        emitter.emit('updateTopMenu', {lid});
    }
};

/*const notifyException = (err: Error, name: string, metadata: any) => {
    if (window.Bugsnag) {
        window.Bugsnag.notifyException(err, name, metadata);
    }
};*/

const prompt = (message: string, defaultVal?: string) => {
    return window.prompt(message, defaultVal);
};

async function realtimeUpdate2(updateEvents: UpdateEvents = [], url?: string, raw?: Object) {
    await realtimeUpdate(updateEvents, url, raw);
}

const resetG = () => {
    helpers.resetG();

    // Additionally, here we want to ignore the old lid just to be sure, since the real one will be sent to the UI
    // later. But in the worker, g.lid is already correctly set, so this can't be in helpers.resetG.
    g.lid = undefined;
};

const setGameAttributes = (gameAttributes: GameAttributes) => {
    Object.assign(g, gameAttributes);
};

const showEvent2 = (options: LogEventShowOptions) => {
    showEvent(options);
};

export default {
    bbgmPing,
    confirm,
    emit,
    initAds,
    newLid,
    prompt,
    realtimeUpdate: realtimeUpdate2,
    resetG,
    setGameAttributes,
    showEvent: showEvent2,
};
