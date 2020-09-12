import classNames from 'classnames';
import React from 'react';
import {helpers} from '../../common';
import {setTitle} from '../util';
import {Dropdown, NewWindowLink} from '../components';

const Schedule = ({abbrev, completed, season, upcoming}) => {
    setTitle('Schedule');

    return <div>
        <Dropdown view="schedule" fields={["teams"]} values={[abbrev]} />
        <h1>Schedule <NewWindowLink /></h1>

        <div className="row">
            <div className="col-sm-6">
                <h2>Upcoming Games</h2>
                <ul className="list-group table-style1">
                    {upcoming.map(({gid, teams}) => <li className="list-group-item schedule-row" key={gid}>
                        <a href={helpers.leagueUrl(['roster', teams[0].abbrev])}><span className="schedule-extra span">{teams[0].region} (R) ({teams[0].seasonAttrs.won}-{teams[0].seasonAttrs.lost})</span></a>
                        <span className="schedule-at"> vs </span>
                        <a href={helpers.leagueUrl(['roster', teams[1].abbrev])}><span className="schedule-extra span">{teams[1].region} (B) ({teams[1].seasonAttrs.won}-{teams[1].seasonAttrs.lost})</span></a>
                    </li>)}
                </ul>
            </div>
            <div className="col-sm-6 hidden-xs">
                <h2>Completed Games</h2>
                <ul className="list-group table-style2">
                    {completed === undefined ? 'Loading...' : completed.map(({gid, overtime, score, teams, won, seasonSplit2, playoffs2}) => {
                        const classes = classNames('list-group-item', 'schedule-row', {
                            'list-group-item-success': won,
                            'list-group-item-danger': !won,
                        });
                        return <li className={classes} key={gid}>
                            <div className="schedule-results">
                                <div className="schedule-wl"> {won ? 'W' : 'L'}  </div>
                            </div>
			
							<a className="w42" href={helpers.leagueUrl(['roster', teams[0].abbrev])}>(R)  {teams[0].region}</a>
                            <span className="schedule-at"> vs </span>
							
                            <a className="w42" href={helpers.leagueUrl(['roster', teams[1].abbrev])}>(B) {teams[1].region}</a>
							{playoffs2} 								
							{seasonSplit2} 		
								

								
							
                        </li>;
                    })}
                </ul>
            </div>
        </div>
    </div>;
};

Schedule.propTypes = {
    abbrev: React.PropTypes.string.isRequired,
    completed: React.PropTypes.arrayOf(React.PropTypes.object),
    season: React.PropTypes.number.isRequired,
    upcoming: React.PropTypes.arrayOf(React.PropTypes.shape({
        gid: React.PropTypes.number.isRequired,
        teams: React.PropTypes.arrayOf(React.PropTypes.shape({
            abbrev: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired,
            region: React.PropTypes.string.isRequired,
            seasonAttrs: React.PropTypes.shape({
                lost: React.PropTypes.number.isRequired,
                won: React.PropTypes.number.isRequired,
            }).isRequired,
        })).isRequired,
    })).isRequired,
};

export default Schedule;
