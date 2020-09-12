import classNames from 'classnames';
import React from 'react';
import {PHASE, g, helpers} from '../../common';
//import {team} from '../core';
import {setTitle} from '../util';
import {NewWindowLink, PlayerNameLabels, PlayoffMatchup, RatingWithChange} from '../components';

const LeagueDashboard = ({abbrev, ast, astRank, att, cash, completed, confTeams, fg, fga, fgp, fgRank,fgaRank,fgpRank,leagueLeaders, lost, lostSpring, lostSummer, messages, name, oppPts, oppPtsRank, payroll, playoffRoundsWon, playoffsByConference, profit, pts, ptsRank, rank, region, revenue, salaryCap, season, series, seriesTitle, showPlayoffSeries, starters, teamLeaders, trb, trbRank, tp, tpRank, typeCutoff, upcoming, won, wonSpring, wonSummer}) => {
    setTitle('Dashboard');

// these global variables aren't really there
//	const numGames = team.getNumGames(g.userTid);
	const numGames = helpers.getNumGames(g.userTid);
    // Show the remaining number of games, only for the regular season.
    const gamesPlayed = won + lost;
    const gamesRemaining = numGames - gamesPlayed;
    const percentComplete = gamesPlayed / numGames;

    let gamesRemainingTag = null;
    if (g.phase === PHASE.REGULAR_SEASON) {
        gamesRemainingTag = <p>{gamesRemaining} games remaining ({(percentComplete * 100).toFixed(1)}% complete)</p>;
    }

    return <div>
        <h1>{region} Dashboard <NewWindowLink /></h1>

        <div className="row">
            <div className="col-md-9">
                <div className="row">
                    <div className="col-sm-4 hidden-xs">
                        <h3 />
                        <table className="table table-striped table-bordered table-condensed">
                            <thead>
                                <tr><th width="100%">Team</th><th style={{textAlign: 'right'}}>GB</th></tr>
                            </thead>
                            <tbody>
                                {confTeams.map((t, i) => {
                                    return <tr key={t.tid} className={classNames({separator: i === typeCutoff && playoffsByConference, info: t.tid === g.userTid})}>
                                        <td>{t.rank}. <a href={helpers.leagueUrl(['roster', t.abbrev])}>{t.region}</a></td>
                                        <td style={{textAlign: 'right'}}>{t.gb}</td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                        <a href={helpers.leagueUrl(['standings'])}>» League Standings</a>
                    </div>
                    <div className="col-sm-8">
                        <div style={{textAlign: 'center'}}>
                        {g.gameType > 5 ? <span style={{fontSize: '48px'}}>{wonSpring}-{lostSpring},{wonSummer}-{lostSummer}</span> :
                            <span style={{fontSize: '48px'}}>{wonSummer}-{lostSummer}</span>}<br />
                            <span style={{fontSize: '24px'}}>
                                {playoffRoundsWon < 0 ? <span>{helpers.ordinal(rank)} in conference</span> : helpers.roundsWonText(playoffRoundsWon)}
                            </span>
                        </div>

                        <div className="row">
                            <div className="col-xs-6">
                                <h3>Team Leaders</h3>
                                <p>
                                    <a href={helpers.leagueUrl(['player', teamLeaders.fg.pid])}>{teamLeaders.fg.userID}</a>: {teamLeaders.fg.stat.toFixed(1)} Kills<br />
                                    <a href={helpers.leagueUrl(['player', teamLeaders.fgp.pid])}>{teamLeaders.fgp.userID}</a>: {teamLeaders.fgp.stat.toFixed(1)} Assists<br />
                                    <a href={helpers.leagueUrl(['player', teamLeaders.tp.pid])}>{teamLeaders.tp.userID}</a>: {teamLeaders.tp.stat.toFixed(1)} Creep Score<br />
                                    <a href={helpers.leagueUrl(['roster'])}>» Full Roster</a>
                                </p>
                                <h3>League Leaders</h3>
                                <p>
                                    <a href={helpers.leagueUrl(['player', leagueLeaders.fg.pid])}>{leagueLeaders.fg.userID}</a>, <a href={helpers.leagueUrl(['roster', leagueLeaders.fg.abbrev])}>{leagueLeaders.fg.abbrev}</a>: {leagueLeaders.fg.stat.toFixed(1)} Kills<br />
                                    <a href={helpers.leagueUrl(['player', leagueLeaders.fgp.pid])}>{leagueLeaders.fgp.userID}</a>, <a href={helpers.leagueUrl(['roster', leagueLeaders.fgp.abbrev])}>{leagueLeaders.fgp.abbrev}</a>: {leagueLeaders.fgp.stat.toFixed(1)} Assists<br />
                                    <a href={helpers.leagueUrl(['player', leagueLeaders.tp.pid])}>{leagueLeaders.tp.userID}</a>, <a href={helpers.leagueUrl(['roster', leagueLeaders.tp.abbrev])}>{leagueLeaders.tp.abbrev}</a>: {leagueLeaders.tp.stat.toFixed(1)} Creep Score<br />
                                    <a href={helpers.leagueUrl(['leaders'])}>» League Leaders</a><br />
                                    <a href={helpers.leagueUrl(['player_stats'])}>» Player Stats</a>
                                </p>
                                <h3>Inbox</h3>
                                <table className="table table-bordered table-condensed messages-table" id="messages">
                                    <tbody>
                                        {messages.map(m => <tr key={m.mid} className={m.read ? '' : 'unread'}>
                                            <td className="year"><a href={helpers.leagueUrl(['message', m.mid])}>{m.year}</a></td>
                                            <td className="from"><a href={helpers.leagueUrl(['message', m.mid])}>{m.from}</a></td>
                                        </tr>)}
                                    </tbody>
                                </table>
                                <p>
                                    <a href={helpers.leagueUrl(['inbox'])}>» All Messages</a>
                                </p>
                            </div>
                            <div className="col-xs-6">
                                <h3>Team Stats</h3>
                                <p>
									Kills: {fg.toFixed(1)} ({helpers.ordinal(fgRank)})<br />
									Deaths: {fga.toFixed(1)} ({helpers.ordinal(fgaRank)})<br />
                                    Assists: {fgp.toFixed(1)} ({helpers.ordinal(fgpRank)})<br />
                                    Creep Score: {tp.toFixed(1)} ({helpers.ordinal(tpRank)})<br />

                                    <a href={helpers.leagueUrl(['team_stats'])}>» Team Stats</a>
                                </p>
                                <h3>Finances</h3>
                                <p>
                                    Avg Attendance: {helpers.numberWithCommas(att)}<br />
                                    Revenue (YTD): {helpers.formatCurrency(revenue, 'K')}<br />
                                    Profit (YTD): {helpers.formatCurrency(profit, 'K')}<br />
                                    Cash: {helpers.formatCurrency(cash, 'K')}<br />
                                    Payroll: {helpers.formatCurrency(payroll, 'K')}<br />
                                    <a href={helpers.leagueUrl(['team_finances'])}>» Team Finances</a><br />
                                    <a href={helpers.leagueUrl(['league_finances'])}>» League Finances</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="clearfix visible-sm" />
            <div className="col-md-3">
                <div className="row">
                    <div className="col-md-12 col-xs-6">
                        {showPlayoffSeries ? <div>
                            <h3>Playoffs</h3>
                            <b>{seriesTitle}</b><br />
                            <PlayoffMatchup season={season} series={series} />
                            <a href={helpers.leagueUrl(['playoffs'])}>» Playoffs</a>
                        </div> : <div>
                            <h3>Upcoming Games</h3>
                            {gamesRemainingTag}
                            <ul className="list-group table-style1" style={{marginBottom: '6px'}}>
                                {upcoming.map(game => <li key={game.gid} className="list-group-item schedule-row">
                                    <a href={helpers.leagueUrl(['roster', game.teams[0].abbrev])}><span className="span">{game.teams[0].region}</span></a>
                                    <span className="schedule-at"> vs </span>
                                    <a href={helpers.leagueUrl(['roster', game.teams[1].abbrev])}><span className="span">{game.teams[1].region}</span></a>
                                </li>)}
                            </ul>
                            {upcoming.length === 0 ? <p>None</p> : null}
                            <a href={helpers.leagueUrl(['schedule'])}>» Schedule</a>
                        </div>}
                    </div>
                    <div className="col-md-12 col-xs-6">
                        <h3>Completed Games</h3>
                        <ul className="list-group table-style2" style={{marginBottom: '6px'}}>
                            {completed.map(game => <li key={game.gid} className={classNames('list-group-item', 'schedule-row', {'list-group-item-success': game.won, 'list-group-item-danger': !game.won})}>
                                <div className="schedule-results">
                                    <div className="schedule-wl">{game.won ? 'W' : 'L'}</div>
                                    <div className="schedule-score"><a href={helpers.leagueUrl(['game_log', abbrev, season, game.gid])}></a></div>
                                </div>
                                <a href={helpers.leagueUrl(['roster', game.teams[0].abbrev])}>{game.teams[0].abbrev}</a>
                                <span className="schedule-at"> vs </span>
                                <a href={helpers.leagueUrl(['roster', game.teams[1].abbrev])}>{game.teams[1].abbrev}</a>
                            </li>)}
                        </ul>
                        {completed.length === 0 ? <p>None</p> : null}
                        <a href={helpers.leagueUrl(['game_log'])}>» Game Log</a>
                    </div>
                </div>
            </div>
        </div>

        <h3>Starting Lineup</h3>
        <div className="table-responsive">
            <table className="table table-striped table-bordered table-condensed">
                <thead>
					<tr><th>Name</th><th title="Position">Pos</th><th>Age</th><th title="Years With Team">YWT</th><th >Region</th><th title="Ranked Match Making Rating">MMR</th><th title="Overall Rating">Ovr</th><th title="Potential Rating">Pot</th><th>Contract</th><th title="Games Played">GP</th><th title="Minutes Per Game">Min</th><th title="Kills per Game">K</th><th title="Deaths per Game">D</th><th title="Assists per Game">A</th><th title="(Kills + Assists) / Deaths">KDA</th><th title="Creep Score">CS</th></tr>

                </thead>
                <tbody>
                    {starters.map(p => <tr key={p.pid}>
                        <td>
                            <PlayerNameLabels
                                injury={p.injury}
                                pid={p.pid}
                                skills={p.ratings.skills}
                                watch={p.watch}
                            >{p.name}</PlayerNameLabels>
                        </td>
                        <td>{p.ratings.pos}</td>
                        <td>{p.age}</td>
                        <td>{p.stats.yearsWithTeam}</td>
						<td>{p.born.loc}</td>
                        <td><RatingWithChange change={p.ratings.dMMR}>{p.ratings.MMR}</RatingWithChange></td>
                        <td><RatingWithChange change={p.ratings.dovr}>{p.ratings.ovr}</RatingWithChange></td>
                        <td><RatingWithChange change={p.ratings.dpot}>{p.ratings.pot}</RatingWithChange></td>
                        <td>
                            {helpers.formatCurrency(p.contract.amount, 'K')} thru {p.contract.exp}
                        </td>
                        <td>{p.stats.gp}</td>
                        <td>{p.stats.min.toFixed(1)}</td>
                        <td>{p.stats.fg.toFixed(1)}</td>
                        <td>{p.stats.fga.toFixed(1)}</td>
                        <td>{p.stats.fgp.toFixed(1)}</td>
                        <td>{p.stats.kda.toFixed(1)}</td>
                        <td>{p.stats.tp.toFixed(1)}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
        <a href={helpers.leagueUrl(['roster'])}>» Full Roster</a>
    </div>;
};

LeagueDashboard.propTypes = {
    abbrev: React.PropTypes.string.isRequired,
    ast: React.PropTypes.number.isRequired,
    astRank: React.PropTypes.number.isRequired,
    att: React.PropTypes.number.isRequired,
    cash: React.PropTypes.number.isRequired,
    completed: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    confTeams: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    fg: React.PropTypes.number.isRequired,
    fgRank: React.PropTypes.number.isRequired,
    fga: React.PropTypes.number.isRequired,
    fgaRank: React.PropTypes.number.isRequired,
    fgp: React.PropTypes.number.isRequired,
    fgpRank: React.PropTypes.number.isRequired,
    leagueLeaders: React.PropTypes.object.isRequired,
    lost: React.PropTypes.number.isRequired,
    lostSpring: React.PropTypes.number.isRequired,
    lostSummer: React.PropTypes.number.isRequired,
    messages: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    name: React.PropTypes.string.isRequired,
    oppPts: React.PropTypes.number.isRequired,
    oppPtsRank: React.PropTypes.number.isRequired,
    payroll: React.PropTypes.number.isRequired,
    playoffRoundsWon: React.PropTypes.number.isRequired,
    playoffsByConference: React.PropTypes.bool.isRequired,
    profit: React.PropTypes.number.isRequired,
    pts: React.PropTypes.number.isRequired,
    ptsRank: React.PropTypes.number.isRequired,
    rank: React.PropTypes.number.isRequired,
    region: React.PropTypes.string.isRequired,
    revenue: React.PropTypes.number.isRequired,
    salaryCap: React.PropTypes.number.isRequired,
    season: React.PropTypes.number.isRequired,
    series: React.PropTypes.object,
    seriesTitle: React.PropTypes.string,
    showPlayoffSeries: React.PropTypes.bool.isRequired,
    starters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    teamLeaders: React.PropTypes.object.isRequired,
    trb: React.PropTypes.number.isRequired,
    trbRank: React.PropTypes.number.isRequired,
    tp: React.PropTypes.number.isRequired,
    tpRank: React.PropTypes.number.isRequired,
    upcoming: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    won: React.PropTypes.number.isRequired,
    wonSpring: React.PropTypes.number.isRequired,
    wonSummer: React.PropTypes.number.isRequired,
};

export default LeagueDashboard;
