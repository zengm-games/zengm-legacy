import type {GameAttributes} from '../../common/types';

// Additional league-specific attributes (userTid, userTids, season, ...) are set when creating a new league

const defaultGameAttributes: GameAttributes = {
    phase: 0,
    nextPhase: null, // Used only for fantasy draft
    daysLeft: 0, // Used only for free agency
    ownerMood: {
        wins: 0,
        playoffs: 0,
        money: 0,
    },
    gameOver: false,
    showFirstOwnerMessage: true, // true when user starts with a new team, so initial owner message can be shown
    godMode: false,
    godModeInPast: false,
    salaryCap: 1000000000, // [thousands of dollars]
			    minPayroll: 0,  // [thousands of dollars]
				luxuryPayroll: 100000000,  // [thousands of dollars]
				luxuryTax: 0,
				minContract: 15000,  // [thousands of dollars]
				maxContract: 999000,  // [thousands of dollars] */
				numGames: 0,
				gameBalance: 1,
				importRestriction: 3,
				residencyRequirement: 4,
				countryConcentration: 5,
				difficulty: 1,

				ratioEU: 1,
				koreanRatio: 1.00,
				ratioNA: 1.00,
				ratioCN: 1.00,
				ratioTW: 1.00,
				ratioTR: 1.00,
				ratioOCE: 2.00,
				ratioBR: 2.00,
				ratioSEA: 2.00,
				ratioJP: 2.00,
				ratioCIS: 2.00,
				ratioLatAm: 2.00,

				germanRatio: 1,

				prospectSupply: 1,

				regionalRestrictions: true,
				bothSplits: false,
             //   seasonSplit: "Spring",
             //   startingSplit: "Spring", // Spring Summer rotate
				customRosterMode: false,
				standardBackground: true,
				aiPickBanStrength: 3,
				applyToCoachMode: false,
				masterGameSimAdjuster: .70,

				retirementPlayers: true,
				yearPositionChange: false,
				supportLevel: 1.00,

				refuseToLeave: true,
				refuseToSign: true,

				alwaysKeep: false,
				customRosterModeStrength: 2.00,

				playoffType: "",

				femaleOdds: 0.001,


  //  minPayroll: 0, // [thousands of dollars]
  //  luxuryPayroll: 100000, // [thousands of dollars]
  //  luxuryTax: 1.5,
  //  minContract: 750, // [thousands of dollars]
  //  maxContract: 30000, // [thousands of dollars]
    minRosterSize: 6,
    numGames: 0, // per season
    quarterLength: 12, // [minutes]
    disableInjuries: false,
   /* confs: [
        {cid: 0, name: "Eastern Conference"},
        {cid: 1, name: "Western Conference"},
    ],
    divs: [
        {did: 0, cid: 0, name: "Atlantic"},
        {did: 1, cid: 0, name: "Central"},
        {did: 2, cid: 0, name: "Southeast"},
        {did: 3, cid: 1, name: "Southwest"},
        {did: 4, cid: 1, name: "Northwest"},
        {did: 5, cid: 1, name: "Pacific"},
    ],*/
    numPlayoffRounds: 4,
	aiTrades: true,
  autoDeleteOldBoxScores: true,
  autoDeleteUnnotableRetiredPlayers: true,  
};

export default defaultGameAttributes;
