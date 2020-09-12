import React from 'react';
import {g, helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, Dropdown, JumpTo, NewWindowLink} from '../components';

const LeagueFinances = ({minPayroll, luxuryPayroll, luxuryTax, salaryCap, season,  championPatch}) => {
    setTitle(`Champion Stats`);

	// issue with chrome for champ pages
    const cols = getCols('Champion','Role','Score','Games Played','Win Rate','Kills','Deaths','Assists','KDA','Creep Score');
    //const cols = getCols('Champion');

    const rows = championPatch.map(t => {


        return {
            key: t.cpid,
            data: [
                t.champion,
                t.role,
                t.score.toFixed(2),
                t.gp2,
                t.winp.toFixed(0),
                t.fg2.toFixed(1),
                t.fga2.toFixed(1),
                t.fgp2.toFixed(1),
                t.kda.toFixed(1),
                t.tp2.toFixed(1),

            ],
        };
    });

    return <div>
            <Dropdown view="champion_stats" fields={["seasons"]} values={[season]} />
        <h1>Champion Stats</h1>


        <DataTable
            cols={cols}
            defaultSort={[3, 'desc']}
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

    })).isRequired,
};

export default LeagueFinances;
