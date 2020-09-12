// @flow

import {g} from '../../common';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateGodMode(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('toggleGodMode')) {
		console.log("bothSplits: "+g.bothSplits);
        return {
            godMode: g.godMode,
            bothSplits: g.bothSplits,

            disableInjuries: g.disableInjuries,
            numGames: g.numGames,
            quarterLength: g.quarterLength,
            minRosterSize: g.minRosterSize,
            maxRosterSize: g.maxRosterSize == undefined ? 10 : g.maxRosterSize,           
            salaryCap: g.salaryCap / 1000000,
            minPayroll: g.minPayroll / 1000000,
            luxuryPayroll: g.luxuryPayroll / 1000000,
            luxuryTax: g.luxuryTax,
            minContract: g.minContract ,
            maxContract: g.maxContract ,

			regionalRestrictions: g.regionalRestrictions,

            gameBalance: g.gameBalance,
            importRestriction: g.importRestriction,
            residencyRequirement: g.residencyRequirement,
            countryConcentration: g.countryConcentration,

			prospectSupply: g.prospectSupply,

            ratioEU: g.ratioEU,
            koreanRatio: g.koreanRatio,
            ratioNA: g.ratioNA,
            ratioCN: g.ratioCN,
            ratioTW: g.ratioTW,
            ratioTR: g.ratioTR,
            ratioOCE: g.ratioOCE,
            ratioBR: g.ratioBR,
            ratioSEA: g.ratioSEA,
            ratioJP: g.ratioJP,
            ratioCIS: g.ratioCIS,
            ratioLatAm: g.ratioLatAm,

            germanRatio: g.germanRatio,

			customRosterMode: g.customRosterMode,
			customRosterModeStrength: g.customRosterModeStrength,

			playoffWins: g.playoffWins,
			realChampNames: g.realChampNames,
            standardBackground: g.standardBackground ,

			applyToCoachMode: g.applyToCoachMode,
            aiPickBanStrength: g.aiPickBanStrength ,

            masterGameSimAdjuster: g.masterGameSimAdjuster ,
            femaleOdds: g.femaleOdds ,



            retirementPlayers: g.retirementPlayers ,
            yearPositionChange: g.yearPositionChange ,
            supportLevel: g.supportLevel ,

            refuseToLeave: g.refuseToLeave ,
            refuseToSign: g.refuseToSign ,
            alwaysKeep: g.alwaysKeep ,
			aiTrades: g.aiTrades,
			difficulty: g.difficulty,
        };
    }
}

export default {
    runBefore: [updateGodMode],
};
