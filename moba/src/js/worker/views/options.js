// @flow

import {g} from '../../common';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateOptions(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('toggleStandardBackground') ) {
		console.log("autoDeleteOldBoxScores: "+g.autoDeleteOldBoxScores);
        return {
            godMode: g.godMode,


			    regionalRestrictions: g.regionalRestrictions,
          standardBackground: g.standardBackground ,
          autoDeleteOldBoxScores: g.autoDeleteOldBoxScores == undefined ? false : g.autoDeleteOldBoxScores ,
          autoDeleteUnnotableRetiredPlayers: g.autoDeleteUnnotableRetiredPlayers == undefined ? false : g.autoDeleteUnnotableRetiredPlayers ,

        };
    }
}

export default {
    runBefore: [updateOptions],
};
