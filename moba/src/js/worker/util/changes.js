// @flow

import {idb} from '../db';
import {logEvent} from '../util';
import type {Conditions} from '../../common/types';

const all = [{
    date: "2018-04-26",
    msg: 'MOBA GM beta release online',
}, {
    date: "2018-06-29",
    msg: 'MOBA GM full release online and on Steam',
}, {
    date: "2018-07-15",
    msg: 'Ability to change jobs after season added if your team does well.',
}, {
    date: "2018-08-16",
    msg: 'Regional awards added.',
}, {
    date: "2018-09-30",
    msg: 'AI trades added.',
}, {
    date: "2018-10-28",
    msg: 'Coach Mode Options page added.',
}, {
    date: "2018-12-02",
    msg: 'Added difficutly menu option when creating new leagues.',
}, {
    date: "2019-06-08",
    msg: 'Quality of life updates for the Coach Mode Draft, Playoff, Champion Synergy/Counter, Overview, Debugging, and Customization pages.',
}, {
    date: "2019-09-22",
    msg: 'Worlds updated for 2019.',
}, {
    date: "2019-10-06",
    msg: 'Improved role placement after draft for users in Coach Mode.',
}, {
    date: "2019-10-06",
    msg: 'Option page added. Ability to control automatic deleting of data to free up disk space and make it easier to export files',
}];

const check = async (conditions: Conditions) => {
    const changesRead = await idb.meta.attributes.get('changesRead');

    // Don't show anything on first visit
    if (changesRead < 0) {
        await idb.meta.attributes.put(all.length, 'changesRead');
        return;
    }

    if (changesRead < all.length) {
        const unread = all.slice(changesRead);

        let text = "";
        let linked = false;

        for (let i = 0; i < unread.length; i++) {
            if (i > 0) {
                text += "<br>";
            }
            text += `<strong>${unread[i].date}</strong>: ${unread[i].msg}`;
            if (i >= 2 && (unread.length - i - 1) > 0) {
                linked = true;
                text += `<br><a href="/changes">...and ${unread.length - i - 1} more changes.</a>`;
                break;
            }
        }

        if (!linked) {
            text += '<br><a href="/changes">View All Changes</a>';
        }

        logEvent({
            type: "changes",
            text,
            saveToDb: false,
        }, conditions);

        await idb.meta.attributes.put(all.length, 'changesRead');
    }
};

export default {
    all,
    check,
};
