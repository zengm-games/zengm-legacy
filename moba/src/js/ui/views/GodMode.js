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
            maxRosterSize: props.maxRosterSize,

			customRosterModeStrength: props.customRosterModeStrength,

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
			difficulty: props.difficulty,

        };
        this.handleChanges = {
            disableInjuries: this.handleChange.bind(this, 'disableInjuries'),
            luxuryPayroll: this.handleChange.bind(this, 'luxuryPayroll'),
            luxuryTax: this.handleChange.bind(this, 'luxuryTax'),
            maxContract: this.handleChange.bind(this, 'maxContract'),
            minContract: this.handleChange.bind(this, 'minContract'),
            minPayroll: this.handleChange.bind(this, 'minPayroll'),
            minRosterSize: this.handleChange.bind(this, 'minRosterSize'),
            maxRosterSize: this.handleChange.bind(this, 'maxRosterSize'),

            customRosterModeStrength: this.handleChange.bind(this, 'customRosterModeStrength'),

            numGames: this.handleChange.bind(this, 'numGames'),
            quarterLength: this.handleChange.bind(this, 'quarterLength'),
            salaryCap: this.handleChange.bind(this, 'salaryCap'),
			aiTrades: this.handleChange.bind(this, 'aiTrades'),
			difficulty: this.handleChange.bind(this, 'difficulty'),

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
                maxRosterSize: nextProps.maxRosterSize,

				aiTrades: nextProps.aiTrades,
				difficulty: nextProps.difficulty,


                customRosterModeStrength: nextProps.customRosterModeStrength,

                numGames: nextProps.numGames,
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

        await toWorker('updateGameAttributes', {
            disableInjuries: this.state.disableInjuries === 'true',
            numGames: parseInt(this.state.numGames, 10),
            quarterLength: parseFloat(this.state.quarterLength),
            minRosterSize: parseInt(this.state.minRosterSize, 10),
            maxRosterSize: parseInt(this.state.maxRosterSize, 10),

            customRosterModeStrength: this.state.customRosterModeStrength,

            salaryCap: parseInt(this.state.salaryCap*1000000),
            minPayroll: parseInt(this.state.minPayroll*1000000),
            luxuryPayroll: parseInt(this.state.luxuryPayroll*1000000),
            luxuryTax: parseFloat(this.state.luxuryTax),
            minContract: parseInt(this.state.minContract ),
            maxContract: parseInt(this.state.maxContract),
			aiTrades: this.state.aiTrades === 'true',
            difficulty: parseInt(this.state.difficulty),

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
            text: 'God Mode options successfully updated.',
            saveToDb: false,
        });

        realtimeUpdate(["toggleGodMode"], helpers.leagueUrl(["god_mode"]));
        realtimeUpdate(["toggleBothSplits"], helpers.leagueUrl(["god_mode"]));
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

        setTitle('God Mode');

        return <div>
            <h1>God Mode <NewWindowLink /></h1>

            <p>God Mode is a collection of customization features that allow you to kind of do whatever you want. If you enable God Mode, you get access to the following features (which show up in the game as <span className="god-mode god-mode-text">purple text</span>):</p>

			<ul>
			  <li>Create custom players by going to Tools > Create A Player</li>
			  <li>Edit any player by going to their player page and clicking Edit Player</li>
			  <li>Force any trade to be accepted by checking the Force Trade checkbox before proposing a trade</li>
			  <li>You can become the GM of another team at any time</li>
			  <li>You will never be fired!</li>
			  <li>You will be able to change the options below</li>
			</ul>

            <p>However, if you enable God Mode within a league, you will not get credit for any <a href="/account">Achievements</a>. This persists even if you disable God Mode. You can only get Achievements in a league where God Mode has never been enabled.</p>

            <button
                className={classNames('btn', godMode ? 'btn-success' : 'btn-danger')}
                onClick={this.handleGodModeToggle}
            >
                {godMode ? 'Disable God Mode' : 'Enable God Mode'}
            </button>

            <h2 style={{marginTop: '1em'}}>God Mode Options</h2>

            <p className="text-danger">These options are not well tested and might make the AI do weird things.</p>



            <form onSubmit={this.handleFormSubmit}>
			<h4 style={{marginTop: '1em'}}>Roster Construction</h4>
            <div className="row">
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Min Roster Size</label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.minRosterSize} value={this.state.minRosterSize} />
                    </div>
          <div className="col-sm-3 col-xs-6 form-group">
                        <label>Max Roster Size</label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.maxRosterSize} value={this.state.maxRosterSize} />
                    </div>
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Regional Restrictions <HelpPopover placement="right" title="Regional Restrictions">
                        When enabled teams must have a certain number of players from the region of the team.
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.regionalRestrictions} value={this.state.regionalRestrictions}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>

                    <div className="col-sm-3 col-xs-6 form-group">
                        <label>Residency Requirement <HelpPopover placement="right" title="Residency Requirement">
                        Number of years it takes for a player learn the local language of a team
                        </HelpPopover></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.residencyRequirement} value={this.state.residencyRequirement} />
                    </div>

                    <div className="col-sm-3 col-xs-6 form-group">
                        <label>Import Restriction <HelpPopover placement="right" title="Import Restriction">
                        How many years a player from another region has to play for a team before his region changes to his current region.
                        </HelpPopover></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.importRestriction} value={this.state.importRestriction} />
                    </div>
            </div>
            <div className="row">

                    <div className="col-sm-3 col-xs-6 form-group">
                        <label>Country Concentration<HelpPopover placement="right" title="Concentration">
                        0 will have the greatest chance at keeping teams together from the same country, 5 is standard, and 30 will ignore country concentration.
                        </HelpPopover></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.countryConcentration} value={this.state.countryConcentration} />
                    </div>


                    <div className="col-sm-3 col-xs-6 form-group">
                        <label>Team Balance <HelpPopover placement="right" title="Team Balance">
                        Not being used yet.
                        </HelpPopover></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.gameBalance} value={this.state.gameBalance} />
                    </div>
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Player Retirement <HelpPopover placement="right" title="Player Retirement">
                        Disable player retirement to better use custom rosters. Also, disables adding new prospects.
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.retirementPlayers} value={this.state.retirementPlayers}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Yearly Position Change <HelpPopover placement="right" title="Yearly Position Change">
                        Disables player position changes from year to year.
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.yearPositionChange} value={this.state.yearPositionChange}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>



            </div>
            <div className="row">
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Refusing To Leave (user) <HelpPopover placement="right" title="Refusing To Leave (user) ">
                        Players can refuse to resign with the user's team
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.refuseToLeave} value={this.state.refuseToLeave}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>

					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Refusing To Sign (user) <HelpPopover placement="right" title="Refusing To Sign (user) ">
                        Players can refuse to sign with the user's team
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.refuseToSign} value={this.state.refuseToSign}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Always Keep (AI) <HelpPopover placement="right" title="Always Keep (AI) ">
                        Enables the AI to always keep players after contracts expire.
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.alwaysKeep} value={this.state.alwaysKeep}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                    <div className="col-sm-3 col-xs-6 form-group">
                        <label>Trades Between AI Teams</label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.aiTrades} value={this.state.aiTrades}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Difficulty</label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.difficulty} value={this.state.difficulty}>
                            <option value="0">Easy</option>
                            <option value="1">Normal</option>
                            <option value="2">Hard</option>
                            <option value="3">Impossible</option>
                        </select>
                    </div>
            </div>


            <h4 style={{marginTop: '1em'}}>Finances</h4>
            <div className="row">
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Min Base Contract <HelpPopover placement="left" title="Min Base Contract.">
                        This is the contract amount before mood, position, and regional import adjustments.
                        </HelpPopover></label>
                        <div className="input-group">
                            <span className="input-group-addon">$</span><input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.minContract} value={this.state.minContract} /><span className="input-group-addon">K</span>
                        </div>
                    </div>

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Max Base Contract <HelpPopover placement="left" title="Max Base Contract.">
                        This is the contract amount before mood, position, and regional import adjustments.
                        </HelpPopover></label>
                        <div className="input-group">
                            <span className="input-group-addon">$</span><input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.maxContract} value={this.state.maxContract} /><span className="input-group-addon">K</span>
                        </div>
                    </div>



            </div>
            <h4 style={{marginTop: '1em'}}>Season</h4>
            <div className="row">

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label># Games Per Season <HelpPopover placement="left" title="# Games Per Season.">
                        This will only apply to seasons that have not started yet. Setting to 0 uses the default number of games, which can vary for each league.
                        </HelpPopover></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.numGames} value={this.state.numGames} />
                    </div>

                     <div className="col-sm-3 col-xs-6 form-group">
                        <label>Playoff Wins <HelpPopover placement="right" title="Playoff wins to advance to next round">
						</HelpPopover></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.playoffWins} value={this.state.playoffWins} />
                    </div>






            </div>

            <h4 style={{marginTop: '1em'}}>New Prospects</h4>
            <div className="row">
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>NA Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (8 out of 57 teams, for instance). 2 will increase the ratio to 9/58, 3 will be 10/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioNA} value={this.state.ratioNA} />
                    </div>
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>EU Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (8 out of 57 teams, for instance). 2 will increase the ratio to 9/58, 3 will be 10/59, etc.
                        </HelpPopover></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioEU} value={this.state.ratioEU} />
                    </div>

                    <div className="col-sm-3 col-xs-6 form-group">
                        <label>German Ratio <HelpPopover placement="right" title="Ratio">
                        0 will remove that country/region from the free agent list. 1 will keep the current ratio. 2 will double it and so on.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.germanRatio} value={this.state.germanRatio} />
                    </div>

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Korean Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (8 out of 57 teams, for instance). 2 will increase the ratio to 9/58, 3 will be 10/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.koreanRatio} value={this.state.koreanRatio} />
                    </div>
            </div>
            <div className="row">
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>China Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (8 out of 57 teams, for instance). 2 will increase the ratio to 9/58, 3 will be 10/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioCN} value={this.state.ratioCN} />
                    </div>

                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Taiwan Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (8 out of 57 teams, for instance). 2 will increase the ratio to 9/58, 3 will be 10/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioTW} value={this.state.ratioTW} />
                    </div>
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Turkey Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (1 out of 57 teams, for instance). 2 will increase the ratio to 2/58, 3 will be 3/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioTR} value={this.state.ratioTR} />
                    </div>
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Oceanic Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (1 out of 57 teams, for instance). 2 will increase the ratio to 2/58, 3 will be 3/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioOCE} value={this.state.ratioOCE} />
                    </div>
            </div>
            <div className="row">
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Brazil Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (1 out of 57 teams, for instance). 2 will increase the ratio to 2/58, 3 will be 3/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioBR} value={this.state.ratioBR} />
                    </div>
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>SEA Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (1 out of 57 teams, for instance). 2 will increase the ratio to 2/58, 3 will be 3/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioSEA} value={this.state.ratioSEA} />
                    </div>
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Japan Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (1 out of 57 teams, for instance). 2 will increase the ratio to 2/58, 3 will be 3/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioJP} value={this.state.ratioJP} />
                    </div>
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>CIS Ratio <HelpPopover placement="right" title="Ratio">
                        1 will keep the current ratio (1 out of 57 teams, for instance). 2 will increase the ratio to 2/58, 3 will be 3/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioCIS} value={this.state.ratioCIS} />
                    </div>
            </div>
            <div className="row">
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>LatAm Ratio <HelpPopover placement="right" title="Latin America Ratio">
                        1 will keep the current ratio (1 out of 57 teams, for instance). 2 will increase the ratio to 2/58, 3 will be 3/59, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.ratioLatAm} value={this.state.ratioLatAm} />
                    </div>
                   <div className="col-sm-3 col-xs-6 form-group">
                        <label>Prospect Ratio <HelpPopover placement="right" title="Prospect Supply Ratio">
                        1 will keep the current level of prospect generation, 2 will double it, etc.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.prospectSupply} value={this.state.prospectSupply} />
                    </div>
                <div className="col-sm-3 col-xs-6 form-group">
                        <label>Female Odds <HelpPopover placement="right" title="Female Odds">
                        The higher the value the greater chance a player will be female. The default is .001 (.1%), where 0 would be no female players and 1 would be all female players.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.femaleOdds} value={this.state.femaleOdds} />
                    </div>

            </div>
            <h4 style={{marginTop: '1em'}}>Game Simulation</h4>
            <div className="row">
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Custom Roster Mode <HelpPopover placement="right" title="Custom Roster Mode">
                        For custom roster that have very high ratings that are very close together this brings ratings performance more in line with the standard rosters. It can also be used to make the standard game less random
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.customRosterMode} value={this.state.customRosterMode}>
                            <option value="false">Disabled</option>
                            <option value="true">Enabled</option>
                        </select>
                    </div>
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Custom Roster Mode Strength<HelpPopover placement="right" title="Custom Roster Mode Strength">
                        1 is no change, greater than 1 makes top teams better relative to bottom teams, less than 1 makes bottom teams better relative to top teams
                        </HelpPopover></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.customRosterModeStrength} value={this.state.customRosterModeStrength} />
                    </div>
                 <div className="col-sm-3 col-xs-6 form-group">
                        <label>Master Game Sim Adjuster <HelpPopover placement="right" title="Master Game Sim Adjuster">
                        The lower the value the longer the game and the harder it is to take objectives (and the less gold/exp/time helps). The higher the value the easier objectives are and the more gold/exp/time help.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.masterGameSimAdjuster} value={this.state.masterGameSimAdjuster} />
                    </div>
                  <div className="col-sm-3 col-xs-6 form-group">
                        <label>GM AI Pick/Ban Strength <HelpPopover placement="right" title="GM AI Pick/Ban Strength">
                        0 will take the top pick always, while 100 will randomly choose any top ranked champ from 0 to 100. The greater the number the greater the game variation.
                        </HelpPopover></label>
                        <label></label>
                        <input type="text" className="form-control" disabled={!godMode} onChange={this.handleChanges.aiPickBanStrength} value={this.state.aiPickBanStrength} />
                    </div>
					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Apply To Coach Mode <HelpPopover placement="right" title="Apply AI Pick/Ban Strength To Coach Mode ">
                        Overrides the existing Coach Mode difficulty level and allow you to set the AI pick/ban difficulty level. Currently 0 is impossible, 5 is hard, 20 is medium, and 50 is easy.
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.applyToCoachMode} value={this.state.applyToCoachMode}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>




            </div>
            <h4 style={{marginTop: '1em'}}>Display and UI</h4>
            <div className="row">

					<div className="col-sm-3 col-xs-6 form-group">
                        <label>Real Champ Names <HelpPopover placement="right" title="Real Champ Names">
                        Turn on real champ names during the draft.
                        </HelpPopover></label>
                        <select className="form-control" disabled={!godMode} onChange={this.handleChanges.realChampNames} value={this.state.realChampNames}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>

            </div>

                <button className="btn btn-primary" id="save-god-mode-options" disabled={!godMode}>Save God Mode Options</button>
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
    maxRosterSize: React.PropTypes.number.isRequired,
	aiTrades: React.PropTypes.bool.isRequired,
	difficulty: React.PropTypes.bool.isRequired,

    customRosterModeStrength: React.PropTypes.number.isRequired,


    numGames: React.PropTypes.number.isRequired,
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
