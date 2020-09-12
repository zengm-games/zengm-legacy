import React from 'react';
import {PLAYER, g, helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, Dropdown, NewWindowLink, PlayerNameLabels, RecordAndPlayoffs} from '../components';

const TeamHistory = ({abbrev, bestRecord,championships, history, players, playoffAppearances,groupsAppearances,worldsAppearances, team,
	groups1Appearances, playInAppearances , totalLost, totalWon, totalLostCS, totalWonCS, totalLostLadder,
	totalWonLadder, worstRecord, gameType,yearType}) => {
    setTitle('Team History');

    const historySeasons = history.map((h) => {
        const recordAndPlayoffs = <RecordAndPlayoffs
            abbrev={abbrev}
            lostSpring={h.lostSpring}
            lost={h.lost}
            levelStart={h.levelStart}
            levelMid={h.levelMid}
            playoffRoundsWon={h.playoffRoundsWon }
            playoffRoundsWonWorldsGr={h.playoffRoundsWonWorldsGr}
            season={h.season}
            // Bold championship seasons.
            style={(h.playoffRoundsWon === g.numPlayoffRounds ? {fontWeight: 'bold'} : null)}
            wonSpring={h.wonSpring}
            won={h.won}
        />;

        return <span key={h.season}>
            {recordAndPlayoffs}
            <br />
        </span>;
    });

    const cols = getCols('Name', 'Pos', 'GP', 'Min', 'K', 'D', 'A', 'KDA', 'CS', 'Last Season');
    const rows = players.map(p => {
        return {
            key: p.pid,
            data: [
                <PlayerNameLabels
                    injury={p.injury}
                    pid={p.pid}
                    watch={p.watch}
                >{p.name}</PlayerNameLabels>,
                p.pos,
                p.careerStats.gp,
                p.careerStats.min.toFixed(1),
                p.careerStats.fg.toFixed(1),
                p.careerStats.fga.toFixed(1),
                p.careerStats.fgp.toFixed(1),
                p.careerStats.kda.toFixed(1),
                p.careerStats.tp.toFixed(1),
                p.lastYr,
            ],
            classNames: {
                // Highlight active and HOF players
                danger: p.hof,
                info: p.tid > PLAYER.RETIRED && p.tid !== team.tid, // On other team
                success: p.tid === team.tid, // On this team
            },
        };
    });

    return <div>
        <Dropdown view="team_history" fields={["teams"]} values={[abbrev]} />
        <h1>{team.region} History <NewWindowLink /></h1>
        <p>More: <a href={helpers.leagueUrl(['roster', abbrev])}>Roster</a> | <a href={helpers.leagueUrl(['team_finances', abbrev])}>Finances</a> | <a href={helpers.leagueUrl(['game_log', abbrev])}>Game Log</a> | <a href={helpers.leagueUrl(['transactions', abbrev])}>Transactions</a></p>

        <div className="row">
            <div className="col-sm-3">
                <h2>Overall</h2>
                <p>
                    Record: {totalWon}-{totalLost}<br />
                    Record CS: {totalWonCS}-{totalLostCS}<br />
                    Record Ladder: {totalWonLadder}-{totalLostLadder}<br />
					<br />
                    Playoff Appearances:
					{playoffAppearances}
					<br />
				{gameType == 5 && yearType == 2019 ? (<p>Groups(1) Appearances: {groups1Appearances}<br />
					Play-in Appearances: {playInAppearances}
					</p>
					) : null}
					{gameType >= 5 ? (<p>Groups Appearances: {groupsAppearances}<br />
					Worlds Appearances: {worldsAppearances}<br />
					Championships: {championships}
					</p>
					) : <p>
					Championships: {championships}
					</p>}

                    Best Record:<br /> <RecordAndPlayoffs
                        abbrev={abbrev}
                        lost={bestRecord.lost}
                        lostSpring={bestRecord.lostSpring}
                        levelStart={bestRecord.levelStart}
                        season={bestRecord.season}
                        wonSpring={bestRecord.wonSpring}
                        won={bestRecord.won}
                        levelMid={bestRecord.levelMid}
                        playoffRoundsWon={bestRecord.playoffRoundsWon}
                    /><br />
                    Worst Record:<br /> <RecordAndPlayoffs
                        abbrev={abbrev}
                        lost={worstRecord.lost}
                        lostSpring={worstRecord.lostSpring}
                        levelStart={worstRecord.levelStart}
                        season={worstRecord.season}
                        wonSpring={worstRecord.wonSpring}
                        won={worstRecord.won}
                        levelMid={worstRecord.levelMid}
                        playoffRoundsWon={worstRecord.playoffRoundsWon}
                    />
                </p>

                <h2>Seasons</h2>
                <p style={{MozColumnWidth: '15em', MozColumns: '15em', WebkitColumns: '15em', columns: '15em'}}>
                    {historySeasons}
                </p>
            </div>
            <div className="col-sm-9">
                <h2>Players</h2>
                <p>Players currently on this team are <span className="text-success">highlighted in green</span>. Active players on other teams are <span className="text-info">highlighted in blue</span>. Players in the Hall of Fame are <span className="text-danger">highlighted in red</span>.</p>
                <DataTable
                    cols={cols}
                    defaultSort={[2, 'desc']}
                    name="TeamHistory"
                    rows={rows}
                    pagination
                />
            </div>
        </div>
    </div>;
};

TeamHistory.propTypes = {
    abbrev: React.PropTypes.string.isRequired,
    bestRecord: React.PropTypes.shape({
        lost: React.PropTypes.number.isRequired,
        season: React.PropTypes.number.isRequired,
        won: React.PropTypes.number.isRequired,
    }).isRequired,
    championships: React.PropTypes.number.isRequired,
    history: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    players: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    playoffAppearances: React.PropTypes.number.isRequired,
    groupsAppearances: React.PropTypes.number.isRequired,
    worldsAppearances: React.PropTypes.number.isRequired,
    groups1Appearances: React.PropTypes.number.isRequired,
    playInAppearances: React.PropTypes.number.isRequired,
    gameType: React.PropTypes.number.isRequired,
    yearType: React.PropTypes.number.isRequired,
    team: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        region: React.PropTypes.string.isRequired,
        tid: React.PropTypes.number.isRequired,
    }).isRequired,
    totalLost: React.PropTypes.number.isRequired,
    totalWon: React.PropTypes.number.isRequired,
    totalLostCS: React.PropTypes.number.isRequired,
    totalWonCS: React.PropTypes.number.isRequired,
    totalLostLadder: React.PropTypes.number.isRequired,
    totalWonLadder: React.PropTypes.number.isRequired,
    worstRecord: React.PropTypes.shape({
        lost: React.PropTypes.number.isRequired,
        season: React.PropTypes.number.isRequired,
        won: React.PropTypes.number.isRequired,
    }).isRequired,

};

export default TeamHistory;
