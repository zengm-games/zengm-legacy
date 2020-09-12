import classNames from 'classnames';
import React from 'react';
import {helpers} from '../../common';
import {Dropdown, NewWindowLink, PlayerNameLabels} from '../components';
import {realtimeUpdate, setTitle} from '../util';
import clickable from '../wrappers/clickable';

const StatsRow = clickable(({clicked, i, numPlayers, p, toggleClicked}) => {
    const classes = classNames({
        separator: i === 4 || i === numPlayers - 1,
        warning: clicked,
    });
    return <tr className={classes} onClick={toggleClicked}>
        <td>
            <PlayerNameLabels
                injury={p.injury}
                pid={p.pid}			
                skills={p.skills}
            >{p.userID}</PlayerNameLabels>
        </td>
        <td>{p.pos}</td>
        <td>{p.champPicked}</td>	
        <td>{p.min.toFixed(1)}</td>
        <td>{p.fg}-{p.fga}-{p.fgp}</td>
        <td>{p.fgAtRim}-{p.fgaAtRim}-{p.fgpAtRim}</td>
        <td>{p.tp}</td>
        <td>{p.ft}</td>
        <td>{p.orb}-{p.pf}</td>
        <td>{p.fgLowPost}-{p.fgaLowPost}</td>
        <td>{p.fgMidRange}-{p.oppJM}</td>
        <td>{p.trb.toFixed(1)}</td>		
    </tr>;
});

StatsRow.propTypes = {
    i: React.PropTypes.number.isRequired,
    numPlayers: React.PropTypes.number.isRequired,
    p: React.PropTypes.object.isRequired,
};

class BoxScore extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeydown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeydown);
    }

    handleKeydown(e) {
        if (e.keyCode === 37 && this.props.boxScore && this.props.prevGid !== null) {
            // prev
            realtimeUpdate([], helpers.leagueUrl(['game_log', this.props.abbrev, this.props.season, this.props.prevGid]));
        } else if (e.keyCode === 39 && this.props.boxScore && this.props.nextGid !== null) {
            // next
            realtimeUpdate([], helpers.leagueUrl(['game_log', this.props.abbrev, this.props.season, this.props.nextGid]));
        }
    }

    render() {
        const {abbrev, boxScore, nextGid, prevGid, season} = this.props;

        return <div>
            <center>
                <h2><a href={helpers.leagueUrl(['roster', boxScore.won.abbrev, boxScore.season])}>{boxScore.won.region} </a> {boxScore.won.pf}, <a href={helpers.leagueUrl(['roster', boxScore.lost.abbrev, boxScore.season])}>{boxScore.lost.region} </a> {boxScore.lost.pf}{boxScore.overtime}</h2>

                <table>
                    <tbody><tr><td>
                        <a
                            className={classNames('btn', 'btn-default', {disabled: prevGid === null})}
                            style={{marginRight: '30px'}}
                            href={helpers.leagueUrl(['game_log', abbrev, season, prevGid])}
                        >Prev</a>
                    </td><td style={{textAlign: 'center'}}>
                        <div className="game-log-score">
                            <table className="table table-bordered table-condensed" style={{margin: '0 auto'}}>
								<thead><tr><th></th><th title="Outer Turrets">OT</th><th title="Inner Turrets" >IT</th><th title="Inhibitor Turrets" >HT</th><th title="Inhibitors">I</th><th title="Nexus Turrets">NT</th><th title="Nexus">N</th><th title="Dragons">D</th><th title="Barons">B</th><th>K-D-A</th><th>G(k)</th></tr></thead>								
                                <tbody>
                                    {boxScore.teams.map(t => <tr key={t.abbrev}>
                                        <th><a href={helpers.leagueUrl(['roster', t.abbrev, boxScore.season])}>{t.abbrev}</a></th>
                                        {t.ptsQtrs.map((pts, i) => <td key={i}>{pts}</td>)}
                                        <td>{t.fg}-{t.fga}-{t.fgp}</td>
                                        <td>{t.trb.toFixed(1)}</td>											
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>             
                    </td><td>
                        <a
                            className={classNames('btn', 'btn-default', {disabled: nextGid === null})}
                            style={{marginLeft: '30px'}}
                            href={helpers.leagueUrl(['game_log', abbrev, season, nextGid])}
                        >Next</a>
                    </td></tr></tbody>
                </table>
            </center>
			<br />
            <center>			
			<table>
				<tbody>

                    <table className="table table-striped table-bordered table-condensed table-hover box-score-team">
					<tr> <td> </td> <td> {boxScore.teams[0].abbrev} Bans </td>  <td  >{boxScore.teams[1].abbrev} Bans   </td>  </tr>
					<tr><td> First  </td> <td> {boxScore.draft[0].draft.name} </td>  <td> {boxScore.draft[1].draft.name} </td>  </tr>
					<tr><td> Second  </td> <td> {boxScore.draft[3].draft.name} </td>  <td> {boxScore.draft[2].draft.name} </td>  </tr>
					<tr><td> Third  </td> <td> {boxScore.draft[4].draft.name} </td>  <td> {boxScore.draft[5].draft.name} </td>  </tr>
					<tr><td> Fourth  </td> <td> {boxScore.draft[13].draft.name} </td>  <td> {boxScore.draft[12].draft.name} </td>  </tr>
					<tr><td> Fifth  </td> <td> {boxScore.draft[15].draft.name} </td>  <td> {boxScore.draft[14].draft.name} </td>  </tr>

                    </table>					

				</tbody>
			</table>	

            </center>
					
            {boxScore.teams.map(t => <div key={t.abbrev}>
                <h3><a href={helpers.leagueUrl(['roster', t.abbrev, boxScore.season])}>{t.region}</a></h3>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-condensed table-hover box-score-team">
                        <thead>
							<tr><th>UserID</th><th>Role</th><th>Champion</th><th>Min</th><th>K-D-A</th><th>KDA 10</th><th>CS</th><th>CS 20</th><th>Twr-Ln</th><th>Inh-Ln</th><th>Jngl-Rvr</th><th>Gld(k)</th></tr>

                        </thead>
                        <tbody>
                            {t.players.map((p, i) => {
                                return <StatsRow key={p.pid} i={i} numPlayers={t.players.length} p={p} />;
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>Total</td>								
                                <td />								
                                <td />																
                                <td />		
								<td>{t.fg}-{t.fga}-{t.fgp}</td>
								<td>{t.fgAtRim}-{t.fgaAtRim}-{t.fgpAtRim}</td>
								<td>{t.tp}</td>
								<td>{t.ft}</td>
								<td>{t.orb}-{t.pf}</td>
								<td>{t.fgLowPost}-{t.fgaLowPost}</td>
								<td>{t.fgMidRange}-{t.oppJM}</td>
								<td>{t.trb.toFixed(1)}</td>																						
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>)}
            <br />
            <p>Viewers: {helpers.numberWithCommas(boxScore.att)}</p>
        </div>;
    }
}

BoxScore.propTypes = {
    abbrev: React.PropTypes.string.isRequired,
    boxScore: React.PropTypes.object.isRequired,
    nextGid: React.PropTypes.number,
    prevGid: React.PropTypes.number,
    season: React.PropTypes.number.isRequired,
};

function findPrevNextGids(games = [], currentGid) {
    let prevGid = null;
    let nextGid = null;

    for (let i = 0; i < games.length; i++) {
        if (games[i].gid === currentGid) {
            if (i > 0) {
                nextGid = games[i - 1].gid;
            }
            if (i < games.length - 1) {
                prevGid = games[i + 1].gid;
            }
            break;
        }
    }

    return {prevGid, nextGid};
}

const GameLog = ({abbrev, boxScore, gamesList = {games: []}, season}) => {
    setTitle(`Game Log - ${season}`);

    const {nextGid, prevGid} = findPrevNextGids(gamesList.games, boxScore.gid);

    return <div>
        <Dropdown view="game_log" extraParam={boxScore.gid} fields={["teams", "seasons"]} values={[abbrev, season]} />
        <h1>Game Log <NewWindowLink /></h1>

        <p>More: <a href={helpers.leagueUrl(['roster', abbrev, season])}>Roster</a> | <a href={helpers.leagueUrl(['team_finances', abbrev])}>Finances</a> | <a href={helpers.leagueUrl(['team_history', abbrev])}>History</a> | <a href={helpers.leagueUrl(['transactions', abbrev])}>Transactions</a></p>

        <p />
        <div className="row">
            <div className="col-md-10">
                {boxScore.gid >= 0 ? <BoxScore
                    abbrev={abbrev}
                    boxScore={boxScore}
                    nextGid={nextGid}
                    prevGid={prevGid}
                    season={season}
                /> : <p>Select a game from the menu to view a box score.</p>}
            </div>

            <div className="col-md-2">
                <table className="table table-striped table-bordered table-condensed game-log-list">
                    <thead>
                        <tr><th>Opp</th><th>W/L</th><th>Desc</th></tr>
                    </thead>
                    <tbody>
                        {gamesList.abbrev !== abbrev ? <tr>
                            <td colSpan="3">Loading...</td>
                        </tr> : gamesList.games.map(gm => {
                            return <tr key={gm.gid} className={gm.gid === boxScore.gid ? 'info' : null}>
                                <td className="game-log-cell">
                                    <a href={helpers.leagueUrl(['game_log', abbrev, season, gm.gid])}>
                                        {gm.home ? '' : '@'}{gm.oppAbbrev}
                                    </a>
                                </td>
                                <td className="game-log-cell">
                                    <a href={helpers.leagueUrl(['game_log', abbrev, season, gm.gid])}>
                                        {gm.won ? 'W ' : 'L '}
										{gm.pf}-{gm.opppf}	
										
                                    </a>
                                </td>
                               <td className="game-log-cell">
                                    <a href={helpers.leagueUrl(['game_log', abbrev, season, gm.gid])}>
										{gm.seasonSplit}
																				
                                        {gm.playoffs ? ' P ' : ' RS '}										
                                        {gm.playoffType}											
                                    </a>
                                </td>								
                            </tr>;
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>;
};

GameLog.propTypes = {
    abbrev: React.PropTypes.string.isRequired,
    boxScore: React.PropTypes.object.isRequired,
    gamesList: React.PropTypes.object,
    season: React.PropTypes.number.isRequired,
};

export default GameLog;
