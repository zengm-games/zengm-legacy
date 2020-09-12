// @flow

import classNames from 'classnames';
import React from 'react';
import {setTitle} from '../util';

type Props = {
    leagues: {
        lid: number,
        name: string,
        phaseText: string,
        teamName: string,
        teamRegion: string,
    }[]
};

class Dashboard extends React.Component {
    props: Props;

    state: {
        activeLid: number | void,
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            activeLid: undefined,
        };
    }

    setActiveLid(lid: number) {
        this.setState({
            activeLid: lid,
        });
    }

    render() {
        const {leagues} = this.props;

        setTitle('Dashboard');

        return <div>
            <ul className="dashboard-boxes">
                {leagues.map(l => <li key={l.lid} className="league-block">
                    <a
                        className={classNames('btn-custom2 league', {'league-active': l.lid === this.state.activeLid})}
                        href={`/l/${l.lid}`}
                        onClick={() => this.setActiveLid(l.lid)}
                        title={`${l.lid}. ${l.name}`}
                    >
                        {
                            l.lid !== this.state.activeLid
                        ?
                            <div>
                                <strong>{l.lid}. {l.name}</strong><br />
                                <span>{l.teamRegion}</span><br />
                                <span>{l.phaseText}</span>
                            </div>
                        :
                            <div>
                                <br />
                                <strong>Loading...</strong><br />
                            </div>
                        }
                    </a>
                    <a className="delete close" href={`/delete_league/${l.lid}`} aria-hidden="true">&times;</a>
                </li>)}
            </ul>
            <div className="btn-wrapper">
                <div className="dashboard-box-new">
                    <a href="/new_league" className="btn-custom1 btn-new-league">Create new league</a>
                </div>
            </div>
        </div>;
    }
}

Dashboard.propTypes = {
    leagues: React.PropTypes.arrayOf(React.PropTypes.shape({
        lid: React.PropTypes.number.isRequired,
        name: React.PropTypes.string.isRequired,
        phaseText: React.PropTypes.string.isRequired,
        teamName: React.PropTypes.string.isRequired,
        teamRegion: React.PropTypes.string.isRequired,
    })).isRequired,
};

export default Dashboard;
