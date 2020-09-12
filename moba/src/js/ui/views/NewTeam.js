import React from 'react';
import {helpers} from '../../common';
import {NewWindowLink} from '../components';
import {realtimeUpdate, setTitle, toWorker} from '../util';

class NewTeam extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tid: props.teams && props.teams.length > 0 ? props.teams[0].tid : undefined,
        };
        this.handleTidChange = this.handleTidChange.bind(this);
        this.handleNewTeam = this.handleNewTeam.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.tid === undefined && nextProps.teams && nextProps.teams.length > 0) {
            this.setState({
                tid: nextProps.teams[0].tid,
            });
        }
    }

    handleTidChange(event) {
        this.setState({
            tid: parseInt(event.target.value, 10),
        });
    }

    async handleNewTeam() {
        await toWorker('switchTeam', this.state.tid);
        realtimeUpdate([], helpers.leagueUrl([]));
    }

    render() {
        const {gameOver, godMode, teams, phaseRight} = this.props;

        setTitle('New Team');

        if (!gameOver && !godMode && !phaseRight) {
			//if (phaseRight) {
//				return <div>
	//			
		//		</div>;
//			} else {
				return <div>
					<h1>Error</h1>
					<p>You may only switch to another team after you're fired or when you're in <a href={helpers.leagueUrl(["god_mode"])}>God Mode</a></p>
				</div>;
	//		}
        } else if (teams.length == 0) {
				return <div>

					<p>Your team needs to improve in order for you agent to find other job openings for you.</p>
				</div>;			
		}

        let message;
        if (godMode) {
            message = <p>Because you're in <a href={helpers.leagueUrl(['god_mode'])}>God Mode</a>, you can become the GM of any team.</p>;
        } else if (gameOver) {
            message = <p>After you were fired, your agent tried to get you job offers from other teams. Unfortunately, he was only able to secure offers from some of the worst teams in the league. Are you interested in running any of these teams?</p>;
        } else {
            message = <p>Your agent tried to get you job offers from other teams. Here is a list of teams offering jobs. Are you interested in running any of these teams?</p>;
        }

        return <div>
            <h1>Pick a New Team <NewWindowLink /></h1>

            {message}

            <div className="form-group">
                <select className="form-control select-team" onChange={this.handleTidChange} value={this.state.tid}>
                    {teams.map(t => {
                        return <option key={t.tid} value={t.tid}>{t.region} </option>;
                    })}
                </select>
            </div>

            <button className="btn btn-primary" disabled={this.state.tid === undefined} onClick={this.handleNewTeam}>
                {godMode ? 'Switch Team' : 'Accept New Job'}
            </button>
        </div>;
    }
}

NewTeam.propTypes = {
    gameOver: React.PropTypes.bool.isRequired,
    godMode: React.PropTypes.bool.isRequired,
    phaseRight: React.PropTypes.bool.isRequired,	
    teams: React.PropTypes.arrayOf(React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        region: React.PropTypes.string.isRequired,
        tid: React.PropTypes.number.isRequired,
    })).isRequired,
};

export default NewTeam;
