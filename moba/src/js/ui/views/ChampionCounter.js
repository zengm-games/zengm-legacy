import React from 'react';
import {g, helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, Dropdown, JumpTo, NewWindowLink} from '../components';

const LeagueFinances = ({minPayroll, luxuryPayroll, luxuryTax, salaryCap, season, champion,  championPatch, championAdjusted}) => {
    setTitle(`Champion Counter Info`);

	var cols;
	var colsObject;

	var rowData;
	var rowDataPoint;
	var rows;

	//https://datatables.net/


	cols = []
	colsObject = {
					title: 'Champion',
					desc: 'Champion Name',
					sortType: 'champion',
				};
	cols.push(colsObject);
	for (let i = 0; i < championAdjusted.length; i++) {
		if (championAdjusted[i].name == champion) {

	colsObject = {
						title: champion,
						desc: 'Champion Countering',
						sortType: 'champion',
					};
		cols.push(colsObject);
		}
	}

// rows and championAdjust same thing?
//rows = championAdjusted;
    	rows = championAdjusted.map(t => {

            rowData = [];
        		rowDataPoint = t.name;
        		rowData.push(rowDataPoint);

      			rowDataPoint = t.counter;
      			rowData.push(rowDataPoint);
            return {
        			key: t.hid,
        			data: rowData,
        		};
      });

    return <div>
	<Dropdown view="champion_counter" fields={["champion"]} values={[champion]} />
        <h1>Champion Countering</h1>
        <p>How {champion} does against these champions.</p>
        <DataTable
            cols={cols}
            defaultSort={[0, 'asc']}
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
	champion: React.PropTypes.string.isRequired,
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
   championAdjusted: React.PropTypes.arrayOf(React.PropTypes.shape({
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
