// @flow

import {g} from '../../common';
import {idb} from '../db';
import type {GetOutput, UpdateEvents} from '../../common/types';

async function updateGodMode(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
): void | {[key: string]: any} {
    if (updateEvents.includes('firstRun') || updateEvents.includes('toggleGodMode')) {
		console.log("bothSplits: "+g.bothSplits);
		
		let t = await idb.getCopy.teamsPlus({
            season: g.season,
            tid: g.userTid,
            attrs: ["tid", "region", "name", "strategy", "imgURL", "imgURLCountry","country","countrySpecific","coach"],
            seasonAttrs: ["profit", "wonSummer", "lostSummer", "wonSpring", "lostSpring", "won", "lost", "playoffRoundsWonWorlds", "playoffRoundsWon", "imgURLCountry","countrySpecific", "cidStart","cidMid"],
        });		
		
		console.log(t);
	console.log(t.coach);
	console.log(t.coach.top);
		
        return {
			coachTOP: t.coach.top,
			coachJGL: t.coach.jgl,
			coachMID: t.coach.mid,
			coachADC: t.coach.adc,
			coachSUP: t.coach.sup,			
			coachTOPjgl: t.coach.topJGL,
			coachJGLjgl: t.coach.jglJGL,
			coachMIDjgl: t.coach.midJGL,
			coachADCjgl: t.coach.adcJGL,
			coachSUPjgl: t.coach.supJGL,					
			coach: t.coach,	
            godMode: g.godMode,
            bothSplits: g.bothSplits,			
			
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
        };
    }
}

export default {
    runBefore: [updateGodMode],
};
