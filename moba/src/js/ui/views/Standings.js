import classNames from 'classnames';
import React from 'react';
import {helpers} from '../../common';
import {setTitle} from '../util';
import {Dropdown, JumpTo, NewWindowLink} from '../components';
import clickable from '../wrappers/clickable';

const DivStandingsRow = clickable(({clicked, season,  t, gameType, toggleClicked}) => {
    return <tr key={t.tid} className={classNames({info: t.highlight, warning: clicked})} onClick={toggleClicked}>
        <td>
		<img width="19px" height="19px"  src= {t.seasonAttrs.imgURLCountry} title= {t.countrySpecific}></img>
			{t.imgURL != "" ? <img width="19px" height="19px"  src= {t.imgURL} title= {t.region}></img> : null}
        </td>
        <td>
            <a href={helpers.leagueUrl(['roster', t.abbrev, season])}>{t.region}</a>
            <span>{t.playoffsRank ? ` (${t.playoffsRank})` : ''}</span>
        </td>
      {gameType > 5 ?  <td>{t.seasonAttrs.wonSpring}-{t.seasonAttrs.lostSpring}</td> : null}
      {gameType > 5 ?          <td>{t.gbSpring}</td> : null}
      {gameType > 5 ?          <td>{t.seasonAttrs.pointsSpring}</td> : null}
      {gameType > 5 ?          <td>{t.seasonAttrs.confSpring}</td>	 : null}
        <td>{t.seasonAttrs.wonSummer}-{t.seasonAttrs.lostSummer}</td>
        <td>{t.gbSummer}</td>
        <td>{t.seasonAttrs.pointsSummer}</td>
        <td>{t.seasonAttrs.confSummer}</td>
        <td>{t.seasonAttrs.wonHome}-{t.seasonAttrs.lostHome}</td>
        <td>{t.seasonAttrs.wonAway}-{t.seasonAttrs.lostAway}</td>
        <td>{t.seasonAttrs.streak}</td>
        <td>{t.seasonAttrs.lastTen}</td>
    </tr>;
});

DivStandingsRow.propTypes = {
    season: React.PropTypes.number.isRequired,
    t: React.PropTypes.object.isRequired,
	gameType:  React.PropTypes.number.isRequired,
};

const DivStandings = ({div, season,gameType }) => {
    return <div className="table-responsive">
        <table className="table table-striped table-bordered table-condensed table-hover">
            <thead>
                <tr>
					<th></th>
				{div.teams[0].imgURL != "" ? 	null : null}
                    <th width="100%"></th>
					{gameType > 5 ? <th>Spr</th> : null}

                  {gameType > 5 ?  <th></th> : null}
                   {gameType > 5 ? <th></th> : null}
                  {gameType > 5 ?  <th></th>	 : null}
				{gameType > 5 ? <th>Sum</th> : <th></th>}

                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <thead>
                <tr>
					<th></th>
{div.teams[0].imgURL != "" ? 	null: null}
                    <th width="100%">{div.name}</th>
                    {gameType > 5 ?<th>W-L</th>: null}
                    {gameType > 5 ? <th>GB</th>	: null}
                    {gameType > 5 ? <th>CPts</th>	: null}
                    {gameType > 5 ? <th>Conf</th>	: null}
                    <th>W-L</th>
                    <th>GB</th>
                    <th>CPts</th>
                    <th>Conf</th>
                    <th>Blue</th>
                    <th>Red</th>
                    <th>Streak</th>
                    <th>L5</th>
                </tr>
            </thead>
            <tbody>
                {div.teams.map(t => <DivStandingsRow key={t.tid}   t={t} season={season} gameType={gameType} />)}
            </tbody>
        </table>
    </div>;
};

DivStandings.propTypes = {
    div: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        teams: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    }).isRequired,
    season: React.PropTypes.number.isRequired,
	gameType: React.PropTypes.number.isRequired,
};

const ConfStandings = ({playoffsByConference, season, teams}) => {
    return <table className="table table-striped table-bordered table-condensed">
        <thead>
            <tr><th width="100%">Team</th><th style={{textAlign: 'right'}}>GB</th></tr>
        </thead>
        <tbody>
            {teams.map((t, i) => {
                return <tr key={t.tid} className={classNames({info: t.highlight, separator: i === 7 && playoffsByConference})}>
                    <td>{t.rank}. <a href={helpers.leagueUrl(['roster', t.abbrev, season])}>{t.region}</a></td>
                    <td style={{textAlign: 'right'}}>{t.gb}</td>
                </tr>;
            })}
        </tbody>
    </table>;
};

ConfStandings.propTypes = {
    teams: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    playoffsByConference: React.PropTypes.bool.isRequired,
    season: React.PropTypes.number.isRequired,
};

const Standings = ({confs, playoffsByConference, season,gameType, conference}) => {
    if (season === undefined) {
        setTitle('Standings');
    } else {
        setTitle(`Standings - ${season}`);
    }


    let dropdownFields;
    if (gameType >= 5) {
      dropdownFields = ["seasons", "conference"];
    } else {
      dropdownFields = ["seasons"];
    }

    return <div>
        <Dropdown view="standings" fields={dropdownFields} values={[season,conference]} />
        <JumpTo season={season} />
        <h1>Standings <NewWindowLink /></h1>
        {confs.map(conf => <div key={conf.cid}>
            <h2>{conf.name}</h2>
            <div className="row">
                <div className="col-sm-9">
                    {conf.divs.map(div => <DivStandings key={div.did}  div={div} season={season} gameType={gameType} />)}
                </div>

                <div className="col-sm-3 hidden-xs">
                    <ConfStandings playoffsByConference={playoffsByConference} season={season} teams={conf.teams} />
                </div>
            </div>
        </div>)}
    </div>;
};

Standings.propTypes = {
    confs: React.PropTypes.arrayOf(React.PropTypes.shape({
        cid: React.PropTypes.number.isRequired,
        name: React.PropTypes.string.isRequired,
        divs: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    })).isRequired,
    playoffsByConference: React.PropTypes.bool.isRequired,
    season: React.PropTypes.number.isRequired,
	gameType: React.PropTypes.number.isRequired,
	conference: React.PropTypes.string.isRequired,
};

export default Standings;
