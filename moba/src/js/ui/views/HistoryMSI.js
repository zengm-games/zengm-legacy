import React from 'react';
import {helpers} from '../../common';
import {setTitle} from '../util';
import {Dropdown, JumpTo, NewWindowLink} from '../components';

const History = ({awards, champ, confs, invalidSeason, retiredPlayers, season, userTid}) => {
    setTitle(`Season Summary - ${season}`);

    if (invalidSeason) {
        return <div>
            <h1>Error</h1>
            <p>Invalid season.</p>
        </div>;
    }

    return <div>
        <Dropdown view="history" fields={["seasons"]} values={[season]} />
        <JumpTo season={season} />
        <h1>Season Summary <NewWindowLink /></h1>

        <p />
        <div className="row">
            <div className="col-md-3 col-sm-4 col-xs-12">
                <div className="row">
                    <div className="col-sm-12 col-xs-6">
                        <h4>League Champions</h4>
                        {champ ? <div>
                            <p>
                                <span className={champ.tid === userTid ? 'bg-info' : null}><b><a href={helpers.leagueUrl(['roster', champ.abbrev, season])}> {champ.name}</a></b></span><br />
                                <a href={helpers.leagueUrl(['playoffs', season])}>Playoffs Bracket</a>
                            </p>
                            <p>Finals MVP: <b><a className={champ.tid === userTid ? 'bg-info' : null} href={helpers.leagueUrl(['player', awards.finalsMvp.pid])}>{awards.finalsMvp.name}</a></b><br />
                                {awards.finalsMvp.fg.toFixed(1)} kills, {awards.finalsMvp.fga.toFixed(1)} deaths, {awards.finalsMvp.fgp.toFixed(1)} assists
							</p>
								
                        </div> : <p>???</p>}						
                        <h4>Best Record</h4>
							{awards.bestRecordConfs.map((t, i) => <p key={t.tid}>
								{confs[i].name}:<br />
								<span className={t.tid === userTid ? 'bg-info' : null}><a href={helpers.leagueUrl(['roster', t.abbrev, season])}> {t.name}</a> ({t.won}-{t.lost})</span><br />
							</p>)}						
                        <h4>Most Valuable Player</h4>
                        <p>
                            <span className={awards.mvp.tid === userTid ? 'bg-info' : null}><b><a href={helpers.leagueUrl(['player', awards.mvp.pid])}>{awards.mvp.name}</a></b> (<a href={helpers.leagueUrl(['roster', awards.mvp.abbrev, season])}>{awards.mvp.abbrev}</a>)</span><br />
                            {awards.mvp.fg.toFixed(1)} kills, {awards.mvp.fga.toFixed(1)} deaths, {awards.mvp.fgp.toFixed(1)} assists						
                        </p>
                    </div>
                    <div className="col-sm-12 col-xs-6">
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-4 col-xs-6">
                <h4>All-League Teams</h4>
					{awards.allLeague.map(t => <div key={t.title}>
						<h5>{t.title}</h5>
						{t.players.map(p => <div key={p.pid}>
							<span className={p.tid === userTid ? 'bg-info' : null}><a href={helpers.leagueUrl(['player', p.pid])}>{p.name}</a> (<a href={helpers.leagueUrl(['roster', p.abbrev, season])}>{p.abbrev}</a>)</span><br />
						</div>)}
					</div>)}				
            </div>

            <div className="clearfix visible-sm visible-xs" />
            <div className="col-md-3 col-sm-12">
                <h4>Retired Players</h4>
					<p style={{MozColumnWidth: '12em', MozColumns: '12em', WebkitColumns: '12em', columns: '12em'}}>
						{retiredPlayers.map(p => <span key={p.pid} className={p.stats.tid === userTid ? 'bg-info' : null}>
							<a href={helpers.leagueUrl(['player', p.pid])}>{p.name}</a> ({p.stats.tid >= 0 ? <span><a href={helpers.leagueUrl(['roster', p.stats.abbrev, season])}>{p.stats.abbrev}</a>, </span> : null}age: {p.age}{p.hof ? <span>; <a href={helpers.leagueUrl(['hall_of_fame'])}><b>HoF</b></a></span> : null})<br />
						</span>)}
					</p>				
            </div>
        </div>
    </div>;
};

History.propTypes = {
    awards: React.PropTypes.object,
    champ: React.PropTypes.object,
    confs: React.PropTypes.arrayOf(React.PropTypes.object),
    invalidSeason: React.PropTypes.bool.isRequired,
    retiredPlayers: React.PropTypes.arrayOf(React.PropTypes.object),
    season: React.PropTypes.number.isRequired,
    userTid: React.PropTypes.number,
};

export default History;
