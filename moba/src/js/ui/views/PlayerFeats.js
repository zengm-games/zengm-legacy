import React from 'react';
import {g, helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, Dropdown, NewWindowLink, PlayerNameLabels} from '../components';

const PlayerFeats = ({abbrev, feats, playoffs, season}) => {
    setTitle('Statistical Feats');

    const superCols = [{
        title: '',
        colspan: 4,
    }, {
        title: 'Champions',
        desc: 'Champion Stats',
        colspan: 5,
    }, {
        title: 'Towers',
        desc: 'Towers',
        colspan: 3,
    }, {
        title: 'Inhibitors',
        desc: 'Inhibitors',
        colspan: 2,
    }, {
        title: 'CS',
        desc: 'Creep Score',
        colspan: 2,
    }, {
        title: 'CS-20',
        desc: 'Creep Score in first 20 minutes',
        colspan: 2,
    }, {
        title: 'Jungle',
        desc: 'Neutral Jungle Monsters',
        colspan: 2,
    }, {
        title: 'Dragon',
        desc: 'Neutral Monster Dragon',
        colspan: 2,
    }, {
        title: 'Baron',
        desc: 'Neutral Monster Baron Nashor',
        colspan: 2,
    }, {
        title: '',
        colspan: 3,
    }];

    const cols = getCols('Name', 'Pos', 'Team', 'Min', 'K', 'D', 'A', 'KDA', 'SC', 'Dst', 'A', 'SC', 'Dst' ,'A', 'CS', 'CSOpp', 'CS', 'CSOpp', 'Jgl', 'Rvr', 'K', 'A', 'K', 'A',  'Gld(k)', 'Opp', 'Result', 'Season');

    const rows = feats.map(p => {
        const rowAbbrev = g.teamAbbrevsCache[p.tid];
        const oppAbbrev = g.teamAbbrevsCache[p.oppTid];

        return {
            key: p.fid,
            data: [
                <PlayerNameLabels
                    injury={p.injury}
                    pid={p.pid}
                    watch={p.watch}
                >{p.name}</PlayerNameLabels>,
                p.pos,
                <a href={helpers.leagueUrl(["roster", rowAbbrev, p.season])}>{rowAbbrev}</a>,
                p.stats.min.toFixed(1),
                p.stats.fg,
                p.stats.fga,
                p.stats.fgp,
                p.stats.kda.toFixed(1),
                p.stats.scKills,
                p.stats.pf,
                p.stats.orb,
                p.stats.scTwr,
                p.stats.fgaLowPost,
                p.stats.fgLowPost,
                p.stats.tp,
                p.stats.tpa,
                p.stats.ft,
                p.stats.fta,
                p.stats.fgMidRange,
                p.stats.oppJM,
                p.stats.drb,
                p.stats.blk,
                p.stats.tov,
                p.stats.ast,				
                p.stats.trb.toFixed(1),				
                <a href={helpers.leagueUrl(["roster", oppAbbrev, p.season])}>{oppAbbrev}</a>,
                <a href={helpers.leagueUrl(["game_log", rowAbbrev, p.season, p.gid])}>{p.won ? 'W' : 'L'}</a>,
                p.season,
            ],
            classNames: {
                info: p.tid === g.userTid,
            },
        };
    });

    return <div>
        <Dropdown view="player_feats" fields={["teamsAndAll", "seasonsAndAll", "playoffs"]} values={[abbrev, season, playoffs]} />
        <h1>Statistical Feats <NewWindowLink /></h1>

		<p>All games where a player got a statistical feat are listed here. Statistical feats from your players are <span className="text-info">highlighted in blue</span>.</p>


        <DataTable
            cols={cols}
            defaultSort={[4, 'desc']}
            name="PlayerFeats"
            rows={rows}
            pagination
            superCols={superCols}
        />
    </div>;
};

PlayerFeats.propTypes = {
    abbrev: React.PropTypes.string.isRequired,
    feats: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    playoffs: React.PropTypes.oneOf(['playoffs', 'regularSeason']).isRequired,
    season: React.PropTypes.oneOfType([
        React.PropTypes.number,
        React.PropTypes.string,
    ]).isRequired,
};

export default PlayerFeats;
