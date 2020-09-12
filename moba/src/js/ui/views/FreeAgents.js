import React from 'react';
import {PHASE, g, helpers} from '../../common';
import {DataTable, HelpPopover, NewWindowLink, PlayerNameLabels} from '../components';
import {getCols, setTitle, toWorker} from '../util';

const FreeAgents = ({capSpace, gamesInProgress, minContract, numRosterSpots, phase, players}) => {
    setTitle('Free Agents');

    if (phase >= g.PHASE.AFTER_TRADE_DEADLINE && phase <= g.PHASE.RESIGN_PLAYERS) {
        return <div>
            <h1>Error</h1>
            <p>You're not allowed to sign free agents now.</p>
        </div>;
    }

    const cols = getCols('Name', 'Pos', 'Age', 'Region', 'MMR', 'Ovr', 'Pot', 'Min', 'K', 'D', 'A','KDA', 'CS', 'Asking For', 'Mood', 'Negotiate','Country', 'Languages');

    const rows = players.map(p => {
        let negotiateButton;
        if (helpers.refuseToNegotiate(p.contract.amount, p.freeAgentMood[g.userTid]) && g.refuseToSign) {
            negotiateButton = "Refuses!";
        } else {
            negotiateButton = <button
                className="btn btn-default btn-xs"
                disabled={gamesInProgress}
                onClick={() => toWorker('actions.negotiate', p.pid)}
            >Negotiate</button>;
        }
        return {
            key: p.pid,
            data: [
                <PlayerNameLabels
                    pid={p.pid}
                    injury={p.injury}
                    skills={p.ratings.skills}
                    watch={p.watch}
                >{p.name}</PlayerNameLabels>,
                p.ratings.pos,
                p.age,
                p.born.loc,
                p.ratings.MMR,
                p.ratings.ovr,
                p.ratings.pot,
                p.stats.min.toFixed(1),
                p.stats.fg.toFixed(1),
                p.stats.fga.toFixed(1),
                p.stats.fgp.toFixed(1),
                p.stats.kda.toFixed(1),
                p.stats.tp.toFixed(1),
                <span>{helpers.formatCurrency(p.contract.amount, "K")} thru {p.contract.exp}</span>,
                <div title={p.mood.text} style={{width: '100%', height: '21px', backgroundColor: p.mood.color}}><span style={{display: 'none'}}>
                    {p.freeAgentMood[g.userTid]}
                </span></div>,
                negotiateButton,
                p.born.country,
                p.ratings.languagesGrouped,
            ],
        };
    });

    return <div>
        <h1>Free Agents <NewWindowLink /></h1>
        <p>More: <a href={helpers.leagueUrl(['upcoming_free_agents'])}>Upcoming Free Agents</a></p>

        <p>You currently have <b>{numRosterSpots}</b> open roster spots.</p>

        {gamesInProgress ? <p className="text-danger">Stop game simulation to sign free agents.</p> : null}

        <DataTable
            cols={cols}
            defaultSort={[4, 'desc']}
            name="FreeAgents"
            pagination
            rows={rows}
        />
    </div>;
};

FreeAgents.propTypes = {
    capSpace: React.PropTypes.number.isRequired,
    gamesInProgress: React.PropTypes.bool.isRequired,
    minContract: React.PropTypes.number.isRequired,
    numRosterSpots: React.PropTypes.number.isRequired,
    phase: React.PropTypes.number.isRequired,
    players: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

export default FreeAgents;
