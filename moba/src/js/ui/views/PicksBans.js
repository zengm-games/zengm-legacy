import classNames from 'classnames';
import React from 'react';
import {g, helpers} from '../../common';
import {getCols, realtimeUpdate, setTitle, toWorker} from '../util';
import {DataTable, DraftAbbrev, NewWindowLink, PlayerNameLabels,ChampionNameLabels} from '../components';

function scrollLeft(pos: number) {
    // https://blog.hospodarets.com/native_smooth_scrolling
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            left: pos,
            top: document.body.scrollTop,
            behavior: 'smooth',
        });
    } else {
        window.scrollTo(pos, document.body.scrollTop);
    }
}

const viewDrafted = () => {
    scrollLeft(document.body.scrollWidth - document.body.clientWidth);
};
const viewUndrafted = () => {
    scrollLeft(0);
};

class Draft extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fantasyDrafted: [],
            fantasyDraftedNewPids: [],
        };
    }

    componentWillReceiveProps() {
        if (this.props.fantasyDraft) {
            const newDrafted = this.state.fantasyDraftedNewPids.map((pid, i) => {
                const p = this.props.undrafted.find(p2 => p2.pid === pid);
                p.draft = this.props.drafted[i].draft;
                return p;
            });

            this.setState({
                fantasyDrafted: this.state.fantasyDrafted.concat(newDrafted),
                fantasyDraftedNewPids: [],
            });
        }
    }

    savePids(pids) {
        if (this.props.fantasyDraft) {
            this.setState({
                fantasyDraftedNewPids: this.state.fantasyDraftedNewPids.concat(pids),
            });
        }
    }

    async draftUntilUserOrEnd() {
        const pids = await toWorker('draftUntilUserOrEnd');
        this.savePids(pids);
        await realtimeUpdate(["playerMovement"]);
    }

    async endDraft() {
        //const pids = await toWorker('draftUntilUserOrEnd');
        await toWorker('endDraft');
        //this.savePids(pids);
        //await realtimeUpdate(["playerMovement"]);
    }	
	
    async draftUser(pid) {
        await toWorker('draftUser', pid);
        this.savePids([pid]);
        await realtimeUpdate(["playerMovement"]);
        await this.draftUntilUserOrEnd(); // Needed for when user has #1 pick in fantasy draft, otherwise no
    }

    render() {
        const {drafted, fantasyDraft, started,noUserGame, ended, undrafted, userTids} = this.props;

        setTitle('Draft');

        const nextPick = drafted.find(p => p.pid < 0);// this will have to be expanded
//		console.log(nextPick);
        const usersTurn = nextPick && userTids.includes(nextPick.draft.tid);
		
  //      const usersTurn = true; // test always true
		var colsUndrafted;
		if (g.champType == 0) {				
			colsUndrafted = getCols('Champion','Lane', 'Role','Damage Type','EML','Draft');
		} else {
			colsUndrafted = getCols('Champion','Lane', 'MR','EML','Draft');
		}
      //  colsUndrafted[0].width = '100%';

        if (fantasyDraft) {
            colsUndrafted.splice(5, 0, ...getCols('Contract', 'PER', 'EWA'));
        }

        const rowsUndrafted = undrafted.map(p => {
			var data;			
			if (g.champType == 0) {
				if (g.realChampNames) {
					data = [
							 <ChampionNameLabels
                               
                                pid={p.hid}
     
                            >{p.nameReal}</ChampionNameLabels>,
						p.lane,				
						p.role,
						p.ratings.damageType,
						p.ratings.earlyMidLate,				
						<button className="btn btn-xs btn-primary" disabled={!usersTurn} onClick={() => this.draftUser(p.hid)}>Select</button>,
					];
				} else {
					data = [
						 <ChampionNameLabels
                               
                                pid={p.hid}
     
                            >{p.name}</ChampionNameLabels>,
						p.lane,				
						p.role,
						p.ratings.damageType,
						p.ratings.earlyMidLate,				
						<button className="btn btn-xs btn-primary" disabled={!usersTurn} onClick={() => this.draftUser(p.hid)}>Select</button>,
					];
					
				}
			} else {
				if (g.realChampNames) {				
					data = [
	//					p.name,
							 <ChampionNameLabels
                               
                                pid={p.hid}
     
                            >{p.nameReal}</ChampionNameLabels>,
						p.lane,				
						p.ratings.MR,
						p.ratings.earlyMidLate,				
						<button className="btn btn-xs btn-primary" disabled={!usersTurn} onClick={() => this.draftUser(p.hid)}>Select</button>,
					];
				} else {
					data = [
							 <ChampionNameLabels
                               
                                pid={p.hid}
     
                            >{p.name}</ChampionNameLabels>,
	//					p.nameReal,
						p.lane,				
						p.ratings.MR,
						p.ratings.earlyMidLate,				
						<button className="btn btn-xs btn-primary" disabled={!usersTurn} onClick={() => this.draftUser(p.hid)}>Select</button>,
					];
					
				}
				
			}

            if (fantasyDraft) {
                data.splice(5, 0,
                    `${helpers.formatCurrency(p.contract.amount, 'M')} thru ${p.contract.exp}`,
                    p.stats.per.toFixed(1),
                    p.stats.ewa.toFixed(1),
                );
            }

            return {
                key: p.pid,
                data,
            };
        });

        const colsDrafted = getCols('Pick', 'Team').concat(colsUndrafted.slice(0, -1));

        const draftedMerged = fantasyDraft ? this.state.fantasyDrafted.concat(drafted) : drafted;
        const rowsDrafted = draftedMerged.map((p, i) => {
			var data;
			if (g.champType == 0) {
				if (g.realChampNames) {					
					data = [
						`${p.draft.round}-${p.draft.pick}`,
						<DraftAbbrev originalTid={p.draft.originalTid} season={g.season} tid={p.draft.tid}>{p.draft.tid} {p.draft.originalTid}</DraftAbbrev>,
	//					p.pid >= 0 ? p.draft.name : null,
						p.pid >= 0 ?  <ChampionNameLabels
                               
                                pid={p.draft.hid}
     
                            >{p.draft.nameReal}</ChampionNameLabels> : null,
						p.pid >= 0 ? p.draft.lane : null,                
						p.pid >= 0 ? p.draft.role : null,
						p.pid >= 0 ? p.draft.ratings.damageType : null,
						p.pid >= 0 ? p.draft.ratings.earlyMidLate : null,                
					];
				} else {
					data = [
						`${p.draft.round}-${p.draft.pick}`,
						<DraftAbbrev originalTid={p.draft.originalTid} season={g.season} tid={p.draft.tid}>{p.draft.tid} {p.draft.originalTid}</DraftAbbrev>,
						p.pid >= 0 ?  <ChampionNameLabels
                               
                                pid={p.draft.hid}
     
                            >{p.draft.name}</ChampionNameLabels>  : null,
						p.pid >= 0 ? p.draft.lane : null,                
						p.pid >= 0 ? p.draft.role : null,
						p.pid >= 0 ? p.draft.ratings.damageType : null,
						p.pid >= 0 ? p.draft.ratings.earlyMidLate : null,                
					];				
				}
			} else {
				if (g.realChampNames) {					
					data = [
						`${p.draft.round}-${p.draft.pick}`,
						<DraftAbbrev originalTid={p.draft.originalTid} season={g.season} tid={p.draft.tid}>{p.draft.tid} {p.draft.originalTid}</DraftAbbrev>,
						p.pid >= 0 ?  <ChampionNameLabels
                               
                                pid={p.draft.hid}
     
                            >{p.draft.nameReal}</ChampionNameLabels>  : null,
						p.pid >= 0 ? p.draft.lane : null,                
						p.pid >= 0 ? p.draft.ratings.MR : null,
						p.pid >= 0 ? p.draft.ratings.earlyMidLate : null,                
					];
				} else {
					data = [
						`${p.draft.round}-${p.draft.pick}`,
						<DraftAbbrev originalTid={p.draft.originalTid} season={g.season} tid={p.draft.tid}>{p.draft.tid} {p.draft.originalTid}</DraftAbbrev>,
						p.pid >= 0 ?  <ChampionNameLabels
                               
                                pid={p.draft.hid}
     
                            >{p.draft.name}</ChampionNameLabels>  : null,
						p.pid >= 0 ? p.draft.lane : null,                
						p.pid >= 0 ? p.draft.ratings.MR : null,
						p.pid >= 0 ? p.draft.ratings.earlyMidLate : null,                
					];					
				}
				
			}
            if (fantasyDraft) {
                data.splice(7, 0,
                    p.pid >= 0 ? `${helpers.formatCurrency(p.contract.amount, 'M')} thru ${p.contract.exp}` : null,
                    p.pid >= 0 ? p.stats.per.toFixed(1) : null,
                    p.pid >= 0 ? p.stats.ewa.toFixed(1) : null,
                );
            }

            return {
                key: i,
                data,
                classNames: {info: userTids.includes(p.draft.tid)},
            };
        });

        const buttonClasses = classNames('btn', 'btn-info', 'btn-xs', {'visible-xs': !fantasyDraft});

        const wrapperClasses = classNames('row', 'row-offcanvas', 'row-offcanvas-right', {
            'row-offcanvas-force': fantasyDraft,
            'row-offcanvas-right-force': fantasyDraft,
        });

        const colClass = fantasyDraft ? 'col-xs-12' : 'col-sm-6';
        const undraftedColClasses = classNames(colClass);
        const draftedColClasses = classNames('sidebar-offcanvas', colClass, {'sidebar-offcanvas-force': fantasyDraft});

        return <div>
            <h1>Champion Banning/Picking <NewWindowLink /></h1>

            <p>When your turn to pick or ban comes up, select from the list of available champions on the left.</p>

            {started ? null : <p><button className="btn btn-large btn-success" onClick={() => this.draftUntilUserOrEnd()}>Start Bans/Picks</button></p>}

            {ended ? null : <p className="text-success"><b>Draft Complete!</b> You can now play one day and your draft will be used for that game.</p>	}
			
            <div className={wrapperClasses}>
                <div className={undraftedColClasses}>
                    <h2>
                        Available Champions
                        <span className="pull-right"><button type="button" className={buttonClasses} onClick={viewDrafted}>View Drafted</button></span>
                    </h2>

                    <DataTable
                        cols={colsUndrafted}
                        defaultSort={[0, 'desc']}
                        name="Draft:Undrafted"
                        rows={rowsUndrafted}
                    />
                </div>
                <div className={draftedColClasses}>
                    <h2>
                        Selections
                        <span className="pull-right"><button type="button" className={buttonClasses} onClick={viewUndrafted}>View Undrafted</button></span>
                    </h2>

                    <DataTable
                        cols={colsDrafted}
                        defaultSort={[1, 'asc']}
                        name="Draft:Drafted"
                        rows={rowsDrafted}
                    />
                </div>
            </div>
        </div>;
    }
}

Draft.propTypes = {
    drafted: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    fantasyDraft: React.PropTypes.bool.isRequired,
    started: React.PropTypes.bool.isRequired,
    noUserGame: React.PropTypes.bool.isRequired,
    ended: React.PropTypes.bool.isRequired,
    undrafted: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    userTids: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
};

export default Draft;
