// @flow

import {g} from '../../common';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateGodMode(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('toggleGodMode')) {
        return {
            godMode: g.godMode,
            disableInjuries: g.disableInjuries,
            numGames: g.numGames,
            quarterLength: g.quarterLength,
            minRosterSize: g.minRosterSize,
            salaryCap: g.salaryCap / 1000000,
            minPayroll: g.minPayroll / 1000000,
            luxuryPayroll: g.luxuryPayroll / 1000000,
            luxuryTax: g.luxuryTax,
            minContract: g.minContract ,
            maxContract: g.maxContract ,
			
            gameBalance: g.gameBalance,			
            importRestriction: g.importRestriction,			
            residencyRequirement: g.residencyRequirement,			
            countryConcentration: g.countryConcentration,			
            ratioEU: g.ratioEU,			
            germanRatio: g.germanRatio,			
			playoffWins: g.playoffWins,
			
        };
    }
}

export default {
    runBefore: [updateGodMode],
};
