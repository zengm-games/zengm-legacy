import React from 'react';
import {g, helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, Dropdown, JumpTo, NewWindowLink} from '../components';

const LeagueFinances = ({minPayroll, luxuryPayroll, luxuryTax, salaryCap, season, championPatch, champions}) => {
    setTitle(`Champion Basic Info`);

//    const cols = getCols('Champion','Role','Games Played','Win Rate','Kills','Deaths','Assists','KDA','Creep Score','Role','Damage','Toughness','Control','Mobility','Utility','Damage','Damage Type');
//    const cols = getCols('Champion','Role','Games Played','Win Rate','Kills','Deaths','Assists','KDA','Creep Score','Role');
//    const cols = getCols('Champion','Role','Games Played','Win Rate','Kills','Deaths','Deaths','Role');
	var cols;
	var rows;
	//EML
	//MRL		MR		SAI		Carry	Support	Nuker	Disabler	Jungler	Durable	Escape	Pusher	Initiator

	if (g.champType == 0) {
		cols = getCols('Champion','Role','Control','Damage','Mobility','Toughness','Utility','Damage Type','EML','TOP','JGL','MID','ADC','SUP');
		rows = champions.map(t => {
			return {
				key: t.hid,
				data: [
					t.name,
					t.role,
					t.ratings.control,
					t.ratings.damage,
					t.ratings.mobility,
					t.ratings.toughness,
					t.ratings.utility,
					t.ratings.damageType,
					t.ratings.earlyMidLate,
					t.TOP,
					t.JGL,
					t.MID,
					t.ADC,
					t.SUP,

				],
			};
		});
	} else {
		cols = getCols('Champion','MR','SAI','Carry','Disabler','Durable','Escape','Initiator','Jungler','Nuker','Pusher','Support','EML','SAFE','OFF','MID','JGL','ROAM');
		rows = champions.map(t => {
			return {
				key: t.hid,
				data: [
					t.name,
					t.ratings.MR,
					t.ratings.SAI,
					t.ratings.carry,
					t.ratings.disabler,
					t.ratings.durable,
					t.ratings.escapeR,
					t.ratings.initiator,
					t.ratings.jungler,
					t.ratings.nuker,
					t.ratings.pusher,
					t.ratings.support,
					t.ratings.earlyMidLate,
					t.SAFE,
					t.OFF,
					t.MID,
					t.JGL,
					t.ROAM,

				],
			};
		});
	}
//    const cols = getCols('Champion','Role');


	// need to update this
//    const rows = championPatch.map(t => {


    return <div>
        <h1>Champion Basic Stats</h1>


        <DataTable
            cols={cols}
            defaultSort={[0, 'desc']}
//            defaultSort={[0, 'desc']}
            name="LeagueFinances"
            rows={rows}
        />
    </div>;
};

LeagueFinances.propTypes = {
    minPayroll: React.PropTypes.number.isRequired,
    luxuryPayroll: React.PropTypes.number.isRequired,
    luxuryTax: React.PropTypes.number.isRequired,
    salaryCap: React.PropTypes.number.isRequired,
    season: React.PropTypes.number.isRequired,
   championPatch: React.PropTypes.arrayOf(React.PropTypes.shape({
        champion: React.PropTypes.string.isRequired,
        role: React.PropTypes.string.isRequired,
        gp: React.PropTypes.number.isRequired,
        test1: React.PropTypes.number.isRequired,
        test2: React.PropTypes.number.isRequired,
        winp: React.PropTypes.number.isRequired,
        fg: React.PropTypes.number.isRequired,
        fg2: React.PropTypes.number.isRequired,
        fga: React.PropTypes.number.isRequired,
        fga2: React.PropTypes.number.isRequired,
        fgp: React.PropTypes.number.isRequired,
        fgp2: React.PropTypes.number.isRequired,
        kda: React.PropTypes.number.isRequired,
        tp: React.PropTypes.number.isRequired,
        tp2: React.PropTypes.number.isRequired,
        role2: React.PropTypes.string.isRequired,

    })).isRequired,
   champions: React.PropTypes.arrayOf(React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        champion: React.PropTypes.string.isRequired,
		ratings: React.PropTypes.shape({
            control: React.PropTypes.number.isRequired,
            damage: React.PropTypes.number.isRequired,
            mobility: React.PropTypes.number, // Not required for past seasons
            toughness: React.PropTypes.number.isRequired,
            utility: React.PropTypes.number.isRequired,
            damageType: React.PropTypes.string.isRequired,
            earlyMidLate: React.PropTypes.string.isRequired,
        }).isRequired,
        role: React.PropTypes.string.isRequired,
        test1: React.PropTypes.number.isRequired,
        test2: React.PropTypes.number.isRequired,

    })).isRequired,
};

export default LeagueFinances;
