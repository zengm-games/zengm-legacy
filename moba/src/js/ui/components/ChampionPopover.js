// @flow

import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import {toWorker} from '../util';

const colorRating = (rating: number, type?: 'ovr') => {
    const classes = ['text-danger', 'text-warning', null, 'text-success'];

    // Different cutoffs for ovr and other ratings, cause it's not fair to expect excellence in all areas!
    let cutoffs = [30, 60, 80, Infinity];
    if (type === 'ovr') {
        cutoffs = [30, 45, 60, Infinity];
    }


    const ind = cutoffs.findIndex((cutoff) => rating < cutoff);
    return classes[ind];
};


type Props = {
    pid: number,
};

type State = {
    ratings: {
        ovr: number,
        pot: number,
        hgt: number,
        stre: number,
        spd: number,
        jmp: number,
        endu: number,
        ins: number,
        dnk: number,
        ft: number,
        fg: number,
        tp: number,
        blk: number,
        stl: number,
        drb: number,
        pss: number,
        reb: number,
    } | void,
    stats: {
        pts: number,
        trb: number,
        ast: number,
        blk: number,
        stl: number,
        tov: number,
        min: number,
        per: number,
        ewa: number,
    } | void,
};

class ChampionPopover extends React.Component {
    props: Props;
    state: State;
    loadData: () => void;

    constructor(props: Props) {
        super(props);

        this.state = {
            synergy: undefined,
            namesSyn: undefined,
			namesCtrs: undefined,
			namesCtr: undefined,
        };

        this.loadData = this.loadData.bind(this);
    }

    async loadData() {
        let p = await toWorker('ratingsStatsPopoverInfoChampions', this.props.pid);
			//p.sort((a, b) => b.synergy - a.synergy);
        // This means retired players will show placeholder, which is probably not ideal
        if (p !== undefined) {
			//champions[i].ratings
            const {synergy, namesSyn, namesCtrs, namesCtr} = p;
            this.setState({
                synergy,
                namesSyn,
				namesCtrs,
				namesCtr,
            });
        }
    }


    render() {
        const {synergy, namesSyn, namesCtrs, namesCtr} = this.state;

        let ratingsBlock;
        if (namesSyn) {
            ratingsBlock = <div className="row">
                <div className="col-xs-6">
                    <b>Counters</b><br />
					  <span className={'text-success'}> {namesCtrs[0][1]}</span>
                    <br />
					  <span className={'text-success'}> {namesCtrs[1][1]}</span>
                    <br />
					  <span className={'text-success'}> {namesCtrs[2][1]}</span>
                    <br />
					  <span className={'text-success'}> {namesCtrs[3][1]}</span>
                    <br />
					  <span className={'text-success'}> {namesCtrs[4][1]}</span>
                    <br />
					  <span className={'text-success'}> {namesCtrs[5][1]}</span>
                    <br /><br />
	                <b>Counter</b><br />
					  <span className={'text-danger'}> {namesCtr[0][1]}</span>
                    <br />
					  <span className={'text-danger'}> {namesCtr[1][1]}</span>
                    <br />
					  <span className={'text-danger'}> {namesCtr[2][1]}</span>
                    <br />
					  <span className={'text-danger'}> {namesCtr[3][1]}</span>
                    <br />
					  <span className={'text-danger'}> {namesCtr[4][1]}</span>
                    <br />
					  <span className={'text-danger'}> {namesCtr[5][1]}</span>
                    <br />				 
                </div>
             
              <div className="col-xs-6">
                    <b>Synergy</b><br />
					  <span className={'text-warning'}> {namesSyn[0][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[1][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[2][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[3][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[4][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[5][1]}</span>
                    <br />
    				  <span className={'text-warning'}> {namesSyn[6][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[7][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[8][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[9][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[10][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[11][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[12][1]}</span>
                    <br />
					  <span className={'text-warning'}> {namesSyn[13][1]}</span>
					  <br />               
                </div>				
            </div>;
        } else {
            ratingsBlock = <div className="row">
                <div className="col-xs-12">
                    <b>Ratings</b><br />
					
					
                    <br />
					
                    <br />
									
                    <br />
                    <br />
                    <br />
                </div>
            </div>;
        }

        let statsBlock;
        if (namesSyn) {
			 statsBlock = <div className="row" style={{marginTop: '1em'}}>
                 <div className="col-xs-12">
                    <b>Stats</b><br />
                    <br />
                    <br />
                    <br />
                </div>
            </div>;         
        } else {
            statsBlock = <div className="row" style={{marginTop: '1em'}}>
                <div className="col-xs-12">
                    <b>Stats</b><br />
                    <br />
                    <br />
                    <br />
                </div>
            </div>;
        }

        const popoverPlayerRatings = <Popover id={`ratings-pop-${this.props.pid}`}>
            <div style={{minWidth: '250px', whiteSpace: 'nowrap'}}>
                {ratingsBlock}		
            </div>
        </Popover>;

        return <OverlayTrigger
            onEnter={this.loadData}
            overlay={popoverPlayerRatings}
            placement="bottom"
            rootClose
            trigger="click"
        >
            <span className="glyphicon glyphicon-stats watch" data-no-row-highlight="true" title="View synergy and counter" />
        </OverlayTrigger>;
    }
}

ChampionPopover.propTypes = {
    pid: React.PropTypes.number.isRequired,
};

export default ChampionPopover;