// @flow

/* eslint quote-props: "off" */

import {helpers} from '../../common';
import type {SortOrder, SortType} from '../../common/types';

const cols: {
    [key: string]: {
        desc?: string,
        sortSequence?: SortOrder[],
        sortType?: SortType,
        title?: string, // Should actually be required, but is only added later
    }
} = {
    '': {
        sortSequence: ['desc', 'asc'],
    },
    '#': {},
    '%': {
        desc: 'Percentage',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    '+/-': {
        desc: 'Plus/Minus',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'ADC': {
        desc: 'ADC Tier List',
        sortType: 'number',
    },
    'TOP': {
        desc: 'TOP Tier List',
        sortType: 'number',
    },
    'MID': {
        desc: 'MID Tier List',
        sortType: 'number',
    },
    'JGL': {
        desc: 'JGL Tier List',
        sortType: 'number',
    },
    'SUP': {
        desc: 'SUP Tier List',
        sortType: 'number',
    },
    'SAFE': {
        desc: 'SAFE Tier List',
        sortType: 'number',
    },
    'OFF': {
        desc: 'OFF Tier List',
        sortType: 'number',
    },
    'ROAM': {
        desc: 'ROAM Tier List',
        sortType: 'number',
    },
    'A': {
        desc: 'Assists',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Ability': {
        desc: 'Ability Strength',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Awards': {
        desc: 'Number of Awards',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'ADT': {
        desc: 'All Defensive Team',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'ALT': {
        desc: 'All League Team',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'ART': {
        desc: 'All Rookie Team',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Age': {
        sortType: 'number',
    },
    'Amount': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
    },
    'Asking For': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
    },
    'Ast': {
        desc: 'Assists Per Game',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Attack': {
        desc: 'Attack Strength',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Assists': {
        desc: 'Assists Per Game',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Avg Attendance': {
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Avg Stream': {
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'BA': {
        desc: 'Blocks Against',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Baron': {
        desc: 'Neutral Monster Baron Nashor',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'BR': {
        desc: 'Best Record',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'BRC': {
        desc: 'Best Conference Record',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Blk': {
        desc: 'Blocks',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Carry': {
        desc: 'Champion Carry Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Cash': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
    },
    'Chmpn': {
        desc: 'Due to Champion Picks',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Champion': {
        desc: 'Champion',
        sortType: 'champion',
    },
    'CK': {
        desc: 'Due to Champion Killng Skill',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Championships': {
        desc: 'Championships Won',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Conference': {},
    'Contract': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
    },
   'Control': {
        desc: 'Champion Control Rating (from 0 to 3)',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Count': {
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Country': {},
    'Current Contract': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
	},
    'CS': {
        desc: 'Creep Score',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
	},
    'Creep Score': {
        desc: 'Creep Score',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'CSOpp': {
        desc: 'Opponent Creep Score',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'D': {
        desc: 'Deaths',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Damage': {
        desc: 'Champion Damage Rating (from 0 to 3)',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Damage Type': {
        desc: 'Champion Damage Type (Physical, Magical, or Mixed)',
        sortType: 'name',
    },
    'Deaths': {
        desc: 'Deaths',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Defense': {
        desc: 'Defense Strength',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Dst': {
        desc: 'Destroyed',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'DPOY': {
        desc: 'Defensive Player of the Year',
        sortType: 'name',
    },
    'Def': {
        desc: 'Defensive',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Desired Contract': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
    },
    'Diff': {
        desc: 'Towers Destroyed Differential',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Disabler': {
        desc: 'Champion Disabler Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Division': {},
    'Draft': {
        sortSequence: [],
    },
    'Drafted': {},
    'Dragon': {
        desc: 'Neutral Monster Dragon',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Durable': {
        desc: 'Champion Durable Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'EML': {
        desc: 'Early, mid, or late game strength',
        sortType: 'name',
    },
    'Escape': {
        desc: 'Champion Durable Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'EWA': {
        desc: 'Estimated Wins Added',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'FG%': {
        desc: 'Field Goal Percentage',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'FT%': {
        desc: 'Free Throw Percentage',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Finals': {
        desc: 'Finals Appearances',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Finals MVP': {
        desc: 'Finals Most Valuable Player',
        sortType: 'name',
    },
    'FB': {
        desc: 'First Blood',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'GP': {
        desc: 'Games Played',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Games Played': {
        desc: 'Games Played',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Gender': {
        desc: 'Whether player is male or female',
        sortType: 'name',
    },

    'GS': {
        desc: 'Games Started',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'GmSc': {
        desc: 'Game Score',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Games Won': {
        desc: 'Games Played',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Gld(k)': {
        desc: 'Gold Earned (000s)',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'HOF': {
        sortSequence: ['desc', 'asc'],
    },
    'Inhibitors': {},
    'Initiator': {
        desc: 'Champion Initiator Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Jgl': {
        desc: 'Minions Killed In Jungle',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Jungle': {
        desc: 'Neutral Jungle Monsters',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Jungler': {
        desc: 'Champion Jungler Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'K': {
        desc: 'Kills',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Kills': {
        desc: 'Kills',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'KDA': {
        desc: '(Kills + Assists)/Deaths',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Knockout': {
        desc: 'Made it to the MSI Group Knockout Stage',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'L': {
        desc: 'Games Lost',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'L5': {
        desc: 'Last Five Games',
        sortSequence: ['desc', 'asc'],
        sortType: 'lastTen',
    },
    'L10': {
        desc: 'Last Ten Games',
        sortSequence: ['desc', 'asc'],
        sortType: 'lastTen',
    },
    'Lane': {
        desc: 'Lane champion can play in',
        sortType: 'name',
	},
    'Languages': {
        desc: 'Languages Fluent In',
        sortType: 'name',
	},
    'Last': {
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Last Playoffs': {
        sortType: 'number',
    },
    'Last Season': {
        desc: 'Last Season with Team',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Last Title': {
        sortType: 'number',
    },
    'Last Worlds': {
        sortType: 'number',
    },
    'League': {
        desc: 'Team League',
    },
    'League Champion': {},
    'M': {
        desc: 'Made',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'MMR': {
        desc: 'Ranked Match Making Rating',
        sortType: 'number',
    },
    'MR': {
        desc: 'Champion is melee or ranged',
        sortType: 'name',
    },
    'MVP': {
        desc: 'Most Valuable Player',
        sortType: 'number',
    },
    'Min': {
        desc: 'Minutes Per Game',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Minutes': {
        desc: 'Minutes Per Game',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
   'Mobility': {
        desc: 'Champion Mobility Rating (from 0 to 3)',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Mood': {},
    'Name': {
        sortType: 'name',
    },
    'Negotiate': {},
    'Nuker': {
        desc: 'Champion Nuker Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'O': {
        desc: 'Overall',
        sortType: 'number',
    },
    'OPts': {
        desc: "Opponent's Points",
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Opp': {
        desc: 'Opponent',
    },
    'Off': {
        desc: 'Offensive',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Ovr': {
        desc: 'Overall Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'P': {
        desc: 'Performance',
        sortType: 'number',
    },
    'PER': {
        desc: 'Player Efficiency Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'PF': {
        desc: 'Personal Fouls',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'PPG': {
        desc: 'Points Per Game',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Patch Strength': {
        desc: 'Patch Strength',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Payroll': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
    },
    'Peak MMR': {
        desc: 'Peak Ranked Match Making Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },    'Peak Ovr': {
        desc: 'Peak Overall Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Pick': {
        desc: 'Draft Pick',
        sortType: 'draftPick',
    },
    '# Players': {
        desc: 'Number of players on each team',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Playoffs': {
        desc: 'Playoff Appearances',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Pos': {
        desc: 'Position',
    },
    'Pot': {
        desc: 'Potential Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Profit (YTD)': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
    },
    'Pts': {
        desc: 'Points',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Pusher': {
        desc: 'Champion Pusher Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Rank': {
        desc: 'Rank',
        sortType: 'name',
    },
    'Reb': {
        desc: 'Rebounds Per Game',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Region': {
        desc: 'Region',
        sortType: 'name',
    },
    'RMVP': {
        desc: 'Regional Most Valuable Player',
        sortType: 'number',
    },
    'RALT': {
        desc: 'Regional All League Team',
        sortType: 'number',
    },
    'RChamp': {
        desc: 'Regional Championship',
        sortType: 'number',
    },
    'Result': {},
    'Retired': {
        sortSequence: ['desc', 'asc'],
    },
    'Revenue (YTD)': {
        sortSequence: ['desc', 'asc'],
        sortType: 'currency',
    },
    'Rvr': {
        desc: 'Jungle Monsters Killed Across River (Opp Jungle)',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'ROY': {
        desc: 'Rookie of the Year',
        sortType: 'name',
    },
    'Role': {
        desc: 'Role',
        sortType: 'name',
    },
    'Runner Up': {},
    'Score': {
        desc: 'Champion Score (GP*KDA)',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'SMOY': {
        desc: 'Sixth Man of the Year',
        sortType: 'name',
    },
    'Season': {
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'SC': {
        desc: 'Shotcalling',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Skills': {},
    'Split': {},
    'Started': {},
    'Stl': {
        desc: 'Steals',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'SAI': {
        desc: 'Champion damage increases with strength, agility, or intelligence',
        sortType: 'name',
    },
    'Support': {
        desc: 'Champion Support Rating',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'T': {
        desc: 'Talent',
        sortType: 'number',
    },
    'T-MMR': {
        desc: 'Talent Based On MMR',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'T-OVR': {
        desc: 'Talent Based On OVR',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'TO': {
        desc: 'Turnovers',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'TP': {
        desc: 'Due To Team Player Skill',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'TP%': {
        desc: 'Three Point Percentage',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Team': {},
    'Toughness': {
        desc: 'Champion Toughness Rating (from 0 to 3)',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Tot': {
        desc: 'Total',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Twr': {
        desc: 'Due to Towering Skill',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Towers': {},
   'Utility': {
        desc: 'Champion Utility Rating (from 0 to 3)',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Win Rate': {
        desc: 'Win Percentage',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'W': {
        desc: 'Games Won',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Worlds': {
        desc: 'Worlds Appearances',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'Year': {},

    // "rating:" prefix is to prevent collisions with stats
    // "rating:" prefix is to prevent collisions with stats
    'rating:RT': {
        desc: 'Risk Taking',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:Ps': {
        desc: 'Positioning',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:SkS': {
        desc: 'SkS',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:La': {
        desc: 'Laning',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:SuS': {
        desc: 'Summoner Spells',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:Ld': {
        desc: 'Leadership',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:Ad': {
        desc: 'Adaptability',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:Aw': {
        desc: 'Awareness',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:TP': {
        desc: 'Team Player',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:TF': {
        desc: 'Team Fighting',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:St': {
        desc: 'Stamina',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:InjR': {
        desc: 'Injury Resistant',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:Con': {
        desc: 'Consistency',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:LH': {
        desc: 'Last Hitting',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
    'rating:Ft': {
        desc: 'Fortitude',
        sortSequence: ['desc', 'asc'],
        sortType: 'number',
    },
};

for (const key of Object.keys(cols)) {
    cols[key].title = key.replace('rating:', '');
}

export default (...titles: string[]) => {
    return titles.map((title) => {
        if (!cols.hasOwnProperty(title)) {
            throw new Error(`Unknown column: "${title}"`);
        }

        // Deep copy so other properties can be set on col, like width
        return helpers.deepCopy(cols[title]);
    });
};
