import classNames from 'classnames';
import React from 'react';
import {helpers} from '../../common';
import {emitter, logEvent, realtimeUpdate, setTitle, toWorker} from '../util';
import {HelpPopover, NewWindowLink} from '../components';

class GodMode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dirty: false,
            disableInjuries: String(props.disableInjuries),
            luxuryPayroll: props.luxuryPayroll,
            luxuryTax: props.luxuryTax,
            maxContract: props.maxContract,
            minContract: props.minContract,
            minPayroll: props.minPayroll,
            minRosterSize: props.minRosterSize,
			
			customRosterModeStrength: props.customRosterModeStrength,

            coachTOP: props.coachTOP,
            coachJGL: props.coachJGL,
            coachMID: props.coachMID,
            coachADC: props.coachADC,
            coachSUP: props.coachSUP,			
            coachTOPjgl: props.coachTOPjgl,
            coachJGLjgl: props.coachJGLjgl,
            coachMIDjgl: props.coachMIDjgl,
            coachADCjgl: props.coachADCjgl,
            coachSUPjgl: props.coachSUPjgl,	
            coach: props.coach,			
			
            numGames: props.numGames,
            quarterLength: props.quarterLength,
            salaryCap: props.salaryCap,
			
            gameBalance: props.gameBalance,
			importRestriction: props.importRestriction,
			residencyRequirement: props.residencyRequirement,
			countryConcentration: props.countryConcentration,

			prospectSupply: props.prospectSupply,
			
			ratioEU: props.ratioEU,
			
			ratioNA: props.ratioNA,
			ratioCN: props.ratioCN,
			ratioTW: props.ratioTW,
			ratioTR: props.ratioTR,
			ratioOCE: props.ratioOCE,
			ratioBR: props.ratioBR,
			ratioSEA: props.ratioSEA,
			ratioJP: props.ratioJP,
			ratioCIS: props.ratioCIS,
			ratioLatAm: props.ratioLatAm,			
   			
			
			
			germanRatio: props.germanRatio,
			
			koreanRatio: props.koreanRatio,			
			
			playoffWins: props.playoffWins,			
			realChampNames: String(props.realChampNames),				
			standardBackground: String(props.standardBackground),			
			
			regionalRestrictions: String(props.regionalRestrictions),
			
		//	retirementPlayers: String(props.retirementPlayers),
			alwaysKeep: String(props.alwaysKeep),			
			
			applyToCoachMode: String(props.applyToCoachMode),			
			
			refuseToLeave: String(props.refuseToLeave),	
			refuseToSign: String(props.refuseToSign),				

			
			retirementPlayers: String(props.retirementPlayers),	
			yearPositionChange: String(props.yearPositionChange),				
			
			
			aiPickBanStrength: props.aiPickBanStrength,
			masterGameSimAdjuster: props.masterGameSimAdjuster,
			femaleOdds: props.femaleOdds,

			supportLevel: props.supportLevel,	
			
			customRosterMode: String(props.customRosterMode),	
		
			aiTrades: props.aiTrades,			
			
        };
        this.handleChanges = {
            disableInjuries: this.handleChange.bind(this, 'disableInjuries'),
            luxuryPayroll: this.handleChange.bind(this, 'luxuryPayroll'),
            luxuryTax: this.handleChange.bind(this, 'luxuryTax'),
            maxContract: this.handleChange.bind(this, 'maxContract'),
            minContract: this.handleChange.bind(this, 'minContract'),
            minPayroll: this.handleChange.bind(this, 'minPayroll'),
            minRosterSize: this.handleChange.bind(this, 'minRosterSize'),
			
            customRosterModeStrength: this.handleChange.bind(this, 'customRosterModeStrength'),			
			
            numGames: this.handleChange.bind(this, 'numGames'),
            coachTOP: this.handleChange.bind(this, 'coachTOP'),
            coachADC: this.handleChange.bind(this, 'coachADC'),
            coachMID: this.handleChange.bind(this, 'coachMID'),
            coachJGL: this.handleChange.bind(this, 'coachJGL'),
            coachSUP: this.handleChange.bind(this, 'coachSUP'),
			
            coachTOPjgl: this.handleChange.bind(this, 'coachTOPjgl'),
            coachADCjgl: this.handleChange.bind(this, 'coachADCjgl'),
            coachMIDjgl: this.handleChange.bind(this, 'coachMIDjgl'),
            coachJGLjgl: this.handleChange.bind(this, 'coachJGLjgl'),
            coachSUPjgl: this.handleChange.bind(this, 'coachSUPjgl'),

			
			
			
            quarterLength: this.handleChange.bind(this, 'quarterLength'),
            salaryCap: this.handleChange.bind(this, 'salaryCap'),
			aiTrades: this.handleChange.bind(this, 'aiTrades'),			
			
            gameBalance: this.handleChange.bind(this, 'gameBalance'),
            importRestriction: this.handleChange.bind(this, 'importRestriction'),
            residencyRequirement: this.handleChange.bind(this, 'residencyRequirement'),
            countryConcentration: this.handleChange.bind(this, 'countryConcentration'),
			
			
			
            prospectSupply: this.handleChange.bind(this, 'prospectSupply'),
			
            ratioEU: this.handleChange.bind(this, 'ratioEU'),
            ratioNA: this.handleChange.bind(this, 'ratioNA'),
            ratioCN: this.handleChange.bind(this, 'ratioCN'),
            ratioTW: this.handleChange.bind(this, 'ratioTW'),
            ratioTR: this.handleChange.bind(this, 'ratioTR'),
            ratioOCE: this.handleChange.bind(this, 'ratioOCE'),
            ratioBR: this.handleChange.bind(this, 'ratioBR'),
            ratioSEA: this.handleChange.bind(this, 'ratioSEA'),
            ratioJP: this.handleChange.bind(this, 'ratioJP'),
            ratioCIS: this.handleChange.bind(this, 'ratioCIS'),
            ratioLatAm: this.handleChange.bind(this, 'ratioLatAm'),
			
			
			
            germanRatio: this.handleChange.bind(this, 'germanRatio'),
			
            koreanRatio: this.handleChange.bind(this, 'koreanRatio'),			
			
            playoffWins: this.handleChange.bind(this, 'playoffWins'),
            realChampNames: this.handleChange.bind(this, 'realChampNames'),
            standardBackground: this.handleChange.bind(this, 'standardBackground'),			
			
			regionalRestrictions: this.handleChange.bind(this, 'regionalRestrictions'),					
			
			
            refuseToLeave: this.handleChange.bind(this, 'refuseToLeave'),					
            refuseToSign: this.handleChange.bind(this, 'refuseToSign'),					

			
            retirementPlayers: this.handleChange.bind(this, 'retirementPlayers'),					
            yearPositionChange: this.handleChange.bind(this, 'yearPositionChange'),								
            alwaysKeep: this.handleChange.bind(this, 'alwaysKeep'),								


            applyToCoachMode: this.handleChange.bind(this, 'applyToCoachMode'),			
            aiPickBanStrength: this.handleChange.bind(this, 'aiPickBanStrength'),
            masterGameSimAdjuster: this.handleChange.bind(this, 'masterGameSimAdjuster'),
            femaleOdds: this.handleChange.bind(this, 'femaleOdds'),
			

			customRosterMode: this.handleChange.bind(this, 'customRosterMode'),	
			
			
        };
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleGodModeToggle = this.handleGodModeToggle.bind(this);
        this.handleBothSplitsToggle = this.handleBothSplitsToggle.bind(this);		
        this.handleCustomRosterToggle = this.handleCustomRosterToggle.bind(this);
        this.handleRealChampNamesToggle = this.handleRealChampNamesToggle.bind(this);		
        this.handleStandardBackgroundToggle = this.handleStandardBackgroundToggle.bind(this);				
        this.handleApplyToCoachModeToggle = this.handleApplyToCoachModeToggle.bind(this);		
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.dirty) {
            this.setState({
                disableInjuries: String(nextProps.disableInjuries),
                luxuryPayroll: nextProps.luxuryPayroll,
                luxuryTax: nextProps.luxuryTax,
                maxContract: nextProps.maxContract,
                minContract: nextProps.minContract,
                minPayroll: nextProps.minPayroll,
                minRosterSize: nextProps.minRosterSize,
				aiTrades: nextProps.aiTrades,						
				
                customRosterModeStrength: nextProps.customRosterModeStrength,				
				
                numGames: nextProps.numGames,
                coachTOP: nextProps.coachTOP,
                coachJGL: nextProps.coachJGL,
                coachMID: nextProps.coachMID,
                coachADC: nextProps.coachADC,
                coachSUP: nextProps.coachSUP,				
                coachTOPjgl: nextProps.coachTOPjgl,
                coachJGLjgl: nextProps.coachJGLjgl,
                coachMIDjgl: nextProps.coachMIDjgl,
                coachADCjgl: nextProps.coachADCjgl,
                coachSUPjgl: nextProps.coachSUPjgl,
                coach: nextProps.coach,				
				
				
                quarterLength: nextProps.quarterLength,
                salaryCap: nextProps.salaryCap,

                gameBalance: nextProps.gameBalance,
                importRestriction: nextProps.importRestriction,				
                residencyRequirement: nextProps.residencyRequirement,
                countryConcentration: nextProps.countryConcentration,

				prospectSupply: nextProps.ratioEU,
				
                ratioEU: nextProps.ratioEU,
				
                ratioNA: nextProps.ratioNA,
                ratioCN: nextProps.ratioCN,
                ratioTW: nextProps.ratioTW,
                ratioTR: nextProps.ratioTR,
                ratioOCE: nextProps.ratioOCE,
                ratioBR: nextProps.ratioBR,
                ratioSEA: nextProps.ratioSEA,
                ratioJP: nextProps.ratioJP,
                ratioCIS: nextProps.ratioCIS,
                ratioLatAm: nextProps.ratioLatAm,
								
							
                germanRatio: nextProps.germanRatio,
                koreanRatio: nextProps.koreanRatio,
				
				
				
                playoffWins: nextProps.playoffWins,				
			realChampNames: String(nextProps.realChampNames),						
			standardBackground: String(nextProps.standardBackground),				
			
			regionalRestrictions: String(nextProps.regionalRestrictions),					
			
				
			refuseToLeave: String(nextProps.refuseToLeave),					
			refuseToSign: String(nextProps.refuseToSign),					
			
			
			
			retirementPlayers: String(nextProps.retirementPlayers),					
			yearPositionChange: String(nextProps.yearPositionChange),								
			alwaysKeep: String(nextProps.alwaysKeep),								

			
			applyToCoachMode: String(nextProps.applyToCoachMode),				
                aiPickBanStrength: nextProps.aiPickBanStrength,
                masterGameSimAdjuster: nextProps.masterGameSimAdjuster,
                femaleOdds: nextProps.femaleOdds,

				
			customRosterMode: String(nextProps.customRosterMode),						
			
            });
        }
    }

    handleChange(name, e) {
        this.setState({
            dirty: true,
            [name]: e.target.value,
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();

		// need new function
	//	updateTeamCoachSelections

        await toWorker('updateTeamCoachSelections', {
			coachTOP: parseInt(this.state.coachTOP, 10),
			coachJGL: parseInt(this.state.coachJGL, 10),
			coachMID: parseInt(this.state.coachMID, 10),
			coachADC: parseInt(this.state.coachADC, 10),
			coachSUP: parseInt(this.state.coachSUP, 10),
			coachTOPjgl: parseInt(this.state.coachTOPjgl, 10),
			coachJGLjgl: parseInt(this.state.coachJGLjgl, 10),
			coachMIDjgl: parseInt(this.state.coachMIDjgl, 10),
			coachADCjgl: parseInt(this.state.coachADCjgl, 10),
			coachSUPjgl: parseInt(this.state.coachSUPjgl, 10),			
			//top: this.state.coach.top,
			//jgl: this.state.coach.jgl,
			//mid: this.state.coach.mid,
			//adc: this.state.coach.adc,
			//sup: this.state.coach.sup,			
        });
		
        await toWorker('updateGameAttributes', {
            disableInjuries: this.state.disableInjuries === 'true',
            numGames: parseInt(this.state.numGames, 10),

			
			
            quarterLength: parseFloat(this.state.quarterLength),
            minRosterSize: parseInt(this.state.minRosterSize, 10),

            customRosterModeStrength: this.state.customRosterModeStrength,			
			
            salaryCap: parseInt(this.state.salaryCap*1000000),
            minPayroll: parseInt(this.state.minPayroll*1000000),
            luxuryPayroll: parseInt(this.state.luxuryPayroll*1000000),
            luxuryTax: parseFloat(this.state.luxuryTax),
            minContract: parseInt(this.state.minContract ),
            maxContract: parseInt(this.state.maxContract),
			aiTrades: this.state.aiTrades === 'true',
 
            gameBalance: parseInt(this.state.gameBalance),
            importRestriction: parseInt(this.state.importRestriction),
            residencyRequirement: parseInt(this.state.residencyRequirement),
            countryConcentration: parseInt(this.state.countryConcentration),
			
			prospectSupply: parseFloat(this.state.prospectSupply),
			
            ratioEU: parseInt(this.state.ratioEU),
            ratioNA: parseInt(this.state.ratioNA),
            ratioCN: parseInt(this.state.ratioCN),
            ratioTW: parseInt(this.state.ratioTW),
            ratioTR: parseInt(this.state.ratioTR),
            ratioOCE: parseInt(this.state.ratioOCE),
            ratioBR: parseInt(this.state.ratioBR),
            ratioSEA: parseInt(this.state.ratioSEA),
            ratioJP: parseInt(this.state.ratioJP),
            ratioCIS: parseInt(this.state.ratioCIS),
            ratioLatAm: parseInt(this.state.ratioLatAm),
			
				
			
            germanRatio: parseInt(this.state.germanRatio),
            koreanRatio: parseInt(this.state.koreanRatio),			
			
            playoffWins: parseInt(this.state.playoffWins),			
            realChampNames: this.state.realChampNames === 'true',
            standardBackground: this.state.standardBackground === 'true',			
			
			regionalRestrictions: this.state.regionalRestrictions === 'true',			
			
		
            refuseToLeave: this.state.refuseToLeave === 'true',			
            refuseToSign: this.state.refuseToSign === 'true',			
			
            retirementPlayers: this.state.retirementPlayers === 'true',			
            yearPositionChange: this.state.yearPositionChange === 'true',						
            alwaysKeep: this.state.alwaysKeep === 'true',						

			
            aiPickBanStrength: parseInt(this.state.aiPickBanStrength),
            applyToCoachMode: this.state.applyToCoachMode === 'true',			
			
//            masterGameSimAdjuster: parseInt(this.state.masterGameSimAdjuster*100),
            masterGameSimAdjuster: this.state.masterGameSimAdjuster,
            femaleOdds: this.state.femaleOdds,
			
			
			
            customRosterMode: this.state.customRosterMode === 'true',			
			
        });

        this.setState({
            dirty: false,
        });

        logEvent({
            type: "success",
            text: 'Coach Mode options successfully updated.',
            saveToDb: false,
        });

        realtimeUpdate(["toggleGodMode"], helpers.leagueUrl(["god_mode2"]));
        realtimeUpdate(["toggleBothSplits"], helpers.leagueUrl(["god_mode2"]));		
    }

    async handleGodModeToggle() {
        const attrs = {godMode: !this.props.godMode};

        if (attrs.godMode) {
            attrs.godModeInPast = true;
        }

        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {godMode: attrs.godMode});
        realtimeUpdate(["toggleGodMode"]);
    }
	
   async handleBothSplitsToggle() {
        const attrs = {bothSplits: !this.props.bothSplits};

        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {bothSplits: attrs.bothSplits});
        realtimeUpdate(["toggleBothSplits"]);
    }	
	
   async handleCustomRosterToggle() {
        const attrs = {customRosterMode: !this.props.customRosterMode};

        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {customRosterMode: attrs.customRosterMode});
        realtimeUpdate(["toggleCustomRoster"]);
    }

   async handleRegionalRestrictionToggle() {
        const attrs = {regionalRestriction: !this.props.regionalRestriction};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {regionalRestriction: attrs.regionalRestriction});
        realtimeUpdate(["toggleRegionalRestriction"]);
    }	
	
   async handleRealChampNamesToggle() {
        const attrs = {realChampNames: !this.props.realChampNames};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {realChampNames: attrs.realChampNames});
        realtimeUpdate(["toggleRealChampNames"]);
    }

   async handleStandardBackgroundToggle() {
        const attrs = {standardBackground: !this.props.standardBackground};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {standardBackground: attrs.standardBackground});
        realtimeUpdate(["toggleStandardBackground"]);
    }	
	


  async handleRefuseToLeaveToggle() {
        const attrs = {refuseToLeave: !this.props.refuseToLeave};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {refuseToLeave: attrs.refuseToLeave});
        realtimeUpdate(["toggleRefuseToLeave"]);
    }	


  async handleRefuseToSignToggle() {
        const attrs = {refuseToSign: !this.props.refuseToSign};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {refuseToSign: attrs.refuseToSign});
        realtimeUpdate(["toggleRefuseToSign"]);
    }		

				
  async handleRetirementPlayersToggle() {
        const attrs = {retirementPlayers: !this.props.retirementPlayers};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {retirementPlayers: attrs.retirementPlayers});
        realtimeUpdate(["toggleRetirementPlayers"]);
    }	
	
  async handleYearPositionChangeToggle() {
        const attrs = {yearPositionChange: !this.props.yearPositionChange};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {yearPositionChange: attrs.yearPositionChange});
        realtimeUpdate(["toggleYearPositionChange"]);
    }	
  async handleAlwaysKeepToggle() {
        const attrs = {alwaysKeep: !this.props.alwaysKeep};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {alwaysKeep: attrs.alwaysKeep});
        realtimeUpdate(["toggleAlwaysKeep"]);
    }		
		
	
   async handleApplyToCoachModeToggle() {
        const attrs = {applyToCoachMode: !this.props.applyToCoachMode};


        await toWorker('updateGameAttributes', attrs);
        emitter.emit('updateTopMenu', {applyToCoachMode: attrs.applyToCoachMode});
        realtimeUpdate(["toggleApplyToCoachMode"]);
    }		

    render() {
        const {godMode} = this.props;
        const {bothSplits} = this.props;		
        const {customRosterMode} = this.props;
        const {regionalRestriction} = this.props;

        setTitle('Coach Mode Options');

        return <div>
            <h1>Coach Mode Options<NewWindowLink /></h1>

            <form onSubmit={this.handleFormSubmit}>
        
			
            <h2 style={{marginTop: '1em'}}>Early Game Aggression</h2>
			
		
            <h4 style={{marginTop: '1em'}}> (1 safe, 5 neutral, 10 aggresive)</h4>	
            <div className="row">	
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>TOP <HelpPopover placement="left" title="How Aggressive Your Top Laner Will Be.">
                        Here you can have strong early game champions be played more aggressively or strong players play more aggressively. You can also have players play safely if you think they would lose the lane early. (1 safe, 5 neutral, 10 aggresive)
                        </HelpPopover></label>
                        <input type="text" className="form-control" onChange={this.handleChanges.coachTOP} value={this.state.coachTOP} />
                    </div>
			

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>JGL <HelpPopover placement="left" title="How Aggressive Your Jungler Will Be Invading Enemy Jungle.">
                        Here you can have strong early game champions be played more aggressively or strong players play more aggressively. You can also have players play safely if you think they would lose invades early. (1 safe, 5 neutral, 10 aggresive)
                        </HelpPopover></label>
                        <input type="text" className="form-control"  onChange={this.handleChanges.coachJGL} value={this.state.coachJGL} />
                    </div>

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>MID <HelpPopover placement="left" title="How Aggressive Your Middle Laner Will Be.">
                        Here you can have strong early game champions be played more aggressively or strong players play more aggressively. You can also have players play safely if you think they would lose the lane early. (1 safe, 5 neutral, 10 aggresive)
                        </HelpPopover></label>
                        <input type="text" className="form-control"  onChange={this.handleChanges.coachMID} value={this.state.coachMID} />
                    </div>

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>BOT <HelpPopover placement="left" title="How Aggressive Your Bottom Lane Will Be.">
                        Here you can have strong early game champions be played more aggressively or strong players play more aggressively. You can also have players play safely if you think they would lose the lane early. (1 safe, 5 neutral, 10 aggresive)
                        </HelpPopover></label>
                        <input type="text" className="form-control"  onChange={this.handleChanges.coachADC} value={this.state.coachADC} />
                    </div>									
            </div>

           <h2 style={{marginTop: '1em'}}>Early Jungler Focus</h2>
			
		
            <h4 style={{marginTop: '1em'}}> (1 ignore, 5 opportunistic, 10 camp)</h4>	
            <div className="row">	
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>TOP <HelpPopover placement="left" title="Top Lane Jungler Focus.">
                        This adjust how often the jungler will look to gank top lane.
                        </HelpPopover></label>
                        <input type="text" className="form-control" onChange={this.handleChanges.coachTOPjgl} value={this.state.coachTOPjgl} />
                    </div>
			

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>JGL <HelpPopover placement="left" title="Ganking Jungler Focus.">
                        This adjust how often the jungler will look to gank one of the lanes.
                        </HelpPopover></label>
                        <input type="text" className="form-control"  onChange={this.handleChanges.coachJGLjgl} value={this.state.coachJGLjgl} />
                    </div>

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>MID <HelpPopover placement="left" title="Middle Lane Jungler Focus.">
                        This adjust how often the jungler will look to gank the middle lane.
                        </HelpPopover></label>
                        <input type="text" className="form-control"  onChange={this.handleChanges.coachMIDjgl} value={this.state.coachMIDjgl} />
                    </div>

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>BOT <HelpPopover placement="left" title="Bottom Lane Jungler Focus.">
                        This adjust how often the jungler will look to gank the bottom lane.
                        </HelpPopover></label>
                        <input type="text" className="form-control"  onChange={this.handleChanges.coachADCjgl} value={this.state.coachADCjgl} />
                    </div>					
            </div>            
         

                <button className="btn btn-primary" id="save-god-mode-options" >Save Coach Mode Options</button>
            </form>
        </div>;
    }
}

GodMode.propTypes = {
    disableInjuries: React.PropTypes.bool.isRequired,
    godMode: React.PropTypes.bool.isRequired,
    bothSplits: React.PropTypes.bool.isRequired,	
	
    realChampNames: React.PropTypes.bool.isRequired,	
    standardBackground: React.PropTypes.bool.isRequired,		
	
    regionalRestrictions: React.PropTypes.bool.isRequired,
    alwaysKeep: React.PropTypes.bool.isRequired,	


    refuseToLeave: React.PropTypes.bool.isRequired,			
    refuseToSign: React.PropTypes.bool.isRequired,			
	
    retirementPlayers: React.PropTypes.bool.isRequired,			
    yearPositionChange: React.PropTypes.bool.isRequired,		
	
    applyToCoachMode: React.PropTypes.bool.isRequired,	
	aiPickBanStrength: React.PropTypes.number.isRequired,	

    luxuryPayroll: React.PropTypes.number.isRequired,
    luxuryTax: React.PropTypes.number.isRequired,
    maxContract: React.PropTypes.number.isRequired,
    minContract: React.PropTypes.number.isRequired,
    minPayroll: React.PropTypes.number.isRequired,
    minRosterSize: React.PropTypes.number.isRequired,
	aiTrades: React.PropTypes.bool.isRequired,
	
    customRosterModeStrength: React.PropTypes.number.isRequired,
	
	
    numGames: React.PropTypes.number.isRequired,
    coachTOP: React.PropTypes.number.isRequired,
	coachJGL: React.PropTypes.number.isRequired,
	coachMID: React.PropTypes.number.isRequired,
	coachADC: React.PropTypes.number.isRequired,
	coachSUP: React.PropTypes.number.isRequired,	
    coachTOPjgl: React.PropTypes.number.isRequired,
	coachJGLjgl: React.PropTypes.number.isRequired,
	coachMIDjgl: React.PropTypes.number.isRequired,
	coachADCjgl: React.PropTypes.number.isRequired,
	coachSUPjgl: React.PropTypes.number.isRequired,	
    coach: React.PropTypes.object.isRequired,
	
	
    quarterLength: React.PropTypes.number.isRequired,
    salaryCap: React.PropTypes.number.isRequired,
	
    regionalRestriction: React.PropTypes.bool.isRequired,
    customRosterMode: React.PropTypes.bool.isRequired,	
	
	gameBalance: React.PropTypes.number.isRequired,
	importRestriction: React.PropTypes.number.isRequired,
	residencyRequirement: React.PropTypes.number.isRequired,
	countryConcentration: React.PropTypes.number.isRequired,
	
	prospectSupply: React.PropTypes.number.isRequired,
	
	ratioEU: React.PropTypes.number.isRequired,

	ratioNA: React.PropTypes.number.isRequired,
	ratioCN: React.PropTypes.number.isRequired,
	ratioTW: React.PropTypes.number.isRequired,
	ratioOCE: React.PropTypes.number.isRequired,
	ratioBR: React.PropTypes.number.isRequired,
	ratioSEA: React.PropTypes.number.isRequired,
	ratioJP: React.PropTypes.number.isRequired,
	ratioCIS: React.PropTypes.number.isRequired,
	ratioLatAm: React.PropTypes.number.isRequired,

	

	
	germanRatio: React.PropTypes.number.isRequired,
	koreanRatio: React.PropTypes.number.isRequired,
	
	
	
	playoffWins: React.PropTypes.number.isRequired,	

	masterGameSimAdjuster: React.PropTypes.number.isRequired,		
	femaleOdds: React.PropTypes.number.isRequired,		
	
	
};

export default GodMode;
