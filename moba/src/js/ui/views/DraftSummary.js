import React from 'react';
import {g, helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, DraftAbbrev, Dropdown, JumpTo, NewWindowLink, SkillsBlock} from '../components';

const DraftSummary = ({players, season}) => {
    setTitle(`${season} Draft Summary`);

    const superCols = [{
        title: '',
        colspan: 3,
    }, {
        title: 'At Draft',
        colspan: 5,
    }, {
        title: 'Current',
        colspan: 5,
    }, {
        title: 'Career Stats',
        colspan: 7,
    }];

    const cols = getCols('Name', 'Pos', 'Team', 'Age', 'Ovr', 'Pot', 'Skills', 'Team', 'Age', 'Ovr', 'Pot', 'Skills', 'GP', 'K', 'D', 'A', 'KDA', 'CS');

    const rows = players.map(p => {
        return {
            key: p.pid,
            data: [
                <a href={helpers.leagueUrl(["player", p.pid])}>{p.name}</a>,
                p.pos,
                <DraftAbbrev originalTid={p.draft.originalTid} season={season} tid={p.draft.tid}>{p.draft.tid} {p.draft.originalTid}</DraftAbbrev>,
                p.draft.age,
                p.draft.ovr,
                p.draft.pot,
                <span className="skills-alone"><SkillsBlock skills={p.draft.skills} /></span>,
                <a href={helpers.leagueUrl(["roster", p.currentAbbrev])}>{p.currentAbbrev}</a>,
                p.currentAge,
                p.currentOvr,
                p.currentPot,
                <span className="skills-alone"><SkillsBlock skills={p.currentSkills} /></span>,
                p.careerStats.gp.toFixed(),
                p.careerStats.min.toFixed(1),
                p.careerStats.fg.toFixed(1),
                p.careerStats.fga.toFixed(1),
                p.careerStats.fgp.toFixed(1),
                p.careerStats.kda.toFixed(1),
                p.careerStats.tp.toFixed(1),
            ],
            classNames: {
                danger: p.hof,
                info: p.draft.tid === g.userTid,
            },
        };
    });

    return <div>
        <Dropdown view="draft_summary" fields={["seasons"]} values={[season]} />
        <JumpTo season={season} />
        <h1>{season} Past Prospects Summary <NewWindowLink /></h1>

        <p>More: <a href={helpers.leagueUrl(['draft_scouting'])}>Future Prospect Scouting</a></p>

        <p>Players in the Hall of Fame are <span className="text-danger">highlighted in red</span>.</p>

        <DataTable
            cols={cols}
            defaultSort={[0, 'asc']}
            name="DraftSummary"
            rows={rows}
            superCols={superCols}
        />
    </div>;
};

DraftSummary.propTypes = {
    players: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    season: React.PropTypes.number.isRequired,
};

export default DraftSummary;
