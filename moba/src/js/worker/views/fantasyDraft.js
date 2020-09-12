// @flow

import {g} from '../../common';

async function updateFantasyDraft(): void | {[key: string]: any} {
	
	console.log("got here");
	console.log(g.phase);	
    return {
        phase: g.phase,
    };
}

export default {
    runBefore: [updateFantasyDraft],
};
