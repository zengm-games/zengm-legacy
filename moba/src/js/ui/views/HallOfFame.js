import React from 'react';
import {g, helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, NewWindowLink} from '../components';

const HallOfFame = ({players}) => {
    setTitle('Hall of Fame');

   /* const superCols = [{
        title: '',
        colspan: 6,
    }, {
        title: 'Best Season',
        colspan: 9,
    }, {
        title: 'Career Stats',
        colspan: 7,
    }];

    const cols = getCols('Name', 'Pos', 'Started', 'Retired', 'Peak MMR', 'Peak Ovr', 'Year', 'Team', 'GP', 'Min', 'K', 'D', 'A', 'KDA', 'CS', 'GP', 'Min', 'K', 'D', 'A', 'KDA', 'CS');
   // const cols = getCols('Name');

    const rows = players.map(p => {
        return {
            key: p.pid,
            data: [
                <a href={helpers.leagueUrl(["player", p.pid])}>{p.name}</a>,
                p.ratings[p.ratings.length - 1].pos,
                p.draft.year,
                p.retiredYear,
                p.peakMMR,
                p.peakOvr,
                p.bestStats.season,
                <a href={helpers.leagueUrl(["roster", p.bestStats.abbrev, p.bestStats.season])}>{p.bestStats.abbrev}</a>,
                p.bestStats.gp,
                p.bestStats.min.toFixed(1),
                p.bestStats.fg.toFixed(1),
                p.bestStats.fga.toFixed(1),
                p.bestStats.fgp.toFixed(1),
                p.bestStats.kda.toFixed(1),
				p.bestStats.tp.toFixed(1),
                p.careerStats.gp,
                p.careerStats.min.toFixed(1),
                p.careerStats.fg.toFixed(1),
                p.careerStats.fga.toFixed(1),
                p.careerStats.fgp.toFixed(1),
                p.careerStats.kda.toFixed(1),
                p.careerStats.tp.toFixed(1),
            ],
            classNames: {
                danger: p.legacyTid === g.userTid,
                info: p.statsTids.slice(0, p.statsTids.length - 1).includes(g.userTid) && p.legacyTid !== g.userTid,
                success: p.statsTids[p.statsTids.length - 1] === g.userTid && p.legacyTid !== g.userTid,
            },
        };
    });*/

   const superCols = [{
        title: '',
        colspan: 7,
	}, {
        title: 'Best Season',
        colspan: 9,
   }, {
        title: 'Career Stats',
        colspan: 7,
    }];

    const cols = getCols('Name', 'Pos', 'Started', 'Retired',  'Peak Ovr', 'Peak MMR','Awards','Year', 'Team', 'GP', 'Min', 'K', 'D', 'A', 'KDA', 'CS', 'GP', 'Min', 'K', 'D', 'A', 'KDA', 'CS');
   // const cols = getCols('Name');

    const rows = players.map(p => {
        return {
            key: p.pid,
            data: [
                <a href={helpers.leagueUrl(["player", p.pid])}>{p.name}</a>,
                p.ratings[p.ratings.length - 1].pos,
                p.draft.year,
                p.retiredYear,
                p.peakOvr,
                p.peakMMR,
                p.awardsNumber,
                p.bestStats.season,                
                <a href={helpers.leagueUrl(["roster", p.bestStats.abbrev, p.bestStats.season])}>{p.bestStats.abbrev}</a>,
                p.bestStats.gp,
                p.bestStats.gp > 0 ? p.bestStats.min.toFixed(1) : 0,
                p.bestStats.gp > 0 ? p.bestStats.fg.toFixed(1) : 0,
                p.bestStats.gp > 0 ? p.bestStats.fga.toFixed(1): 0,
                p.bestStats.gp > 0 ? p.bestStats.fgp.toFixed(1): 0,
                p.bestStats.gp > 0 ? p.bestStats.kda.toFixed(1): 0,
                p.bestStats.gp > 0 ? p.bestStats.tp.toFixed(1): 0,
                p.careerStats.gp,
                p.careerStats.min.toFixed(1),
                p.careerStats.fg.toFixed(1),
                p.careerStats.fga.toFixed(1),
                p.careerStats.fgp.toFixed(1),
                p.careerStats.kda.toFixed(1),
                p.careerStats.tp.toFixed(1),
            ],
            classNames: {
                danger: p.legacyTid === g.userTid,
                info: p.statsTids.slice(0, p.statsTids.length - 1).includes(g.userTid) && p.legacyTid !== g.userTid,
                success: p.statsTids[p.statsTids.length - 1] === g.userTid && p.legacyTid !== g.userTid,
            },
        };
    });

    return <div>
        <h1>Hall of Fame <NewWindowLink /></h1>

        <p>Players are eligible to be inducted into the Hall of Fame after they retire. Hall of Famers who played for your team are <span className="text-info">highlighted in blue</span>. Hall of Famers who retired with your team are <span className="text-success">highlighted in green</span>. Hall of Famers who played most of their career with your team are <span className="text-danger">highlighted in red</span>.</p>

        <DataTable
            cols={cols}
//            defaultSort={[20, 'desc']}
            defaultSort={[0, 'desc']}
            name="HallOfFame"
            pagination
            rows={rows}
            superCols={superCols}
        />
    </div>;
};

HallOfFame.propTypes = {
    players: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

export default HallOfFame;
