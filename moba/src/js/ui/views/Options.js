import classNames from 'classnames';
import React from 'react';
import {helpers} from '../../common';
import {emitter, logEvent, realtimeUpdate, setTitle, toWorker} from '../util';
import {HelpPopover, NewWindowLink} from '../components';

class Options extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dirty: false,

			regionalRestrictions: String(props.regionalRestrictions),
      autoDeleteOldBoxScores: String(props.regionalRestrictions),
      autoDeleteUnnotableRetiredPlayers: String(props.regionalRestrictions),
			standardBackground: String(props.standardBackground),
        };
        this.handleChanges = {

			regionalRestrictions: this.handleChange.bind(this, 'regionalRestrictions'),
      autoDeleteOldBoxScores: this.handleChange.bind(this, 'autoDeleteOldBoxScores'),
      autoDeleteUnnotableRetiredPlayers: this.handleChange.bind(this, 'autoDeleteUnnotableRetiredPlayers'),
        standardBackground: this.handleChange.bind(this, 'standardBackground'),

        };
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        
        this.handleStandardBackgroundToggle = this.handleStandardBackgroundToggle.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.dirty) {
            this.setState({

			regionalRestrictions: String(nextProps.regionalRestrictions),
      autoDeleteOldBoxScores: String(nextProps.autoDeleteOldBoxScores),
      autoDeleteUnnotableRetiredPlayers: String(nextProps.autoDeleteUnnotableRetiredPlayers),
			standardBackground: String(nextProps.standardBackground),
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

			regionalRestrictions: this.state.regionalRestrictions === 'true',
      autoDeleteOldBoxScores: this.state.autoDeleteOldBoxScores === 'true',
      autoDeleteUnnotableRetiredPlayers: this.state.autoDeleteUnnotableRetiredPlayers === 'true',
      standardBackground: this.state.standardBackground === 'true',
        });

        this.setState({
            dirty: false,
        });

        logEvent({
            type: "success",
            text: 'Options successfully updated.',
            saveToDb: false,
        });
        realtimeUpdate(["toggleStandardBackground"], helpers.leagueUrl(["options"]));
    }

    async handleStandardBackgroundToggle() {
         const attrs = {standardBackground: !this.props.standardBackground};


         await toWorker('updateGameAttributes', attrs);
         emitter.emit('updateTopMenu', {standardBackground: attrs.standardBackground});
         realtimeUpdate(["toggleStandardBackground"]);
     }

    render() {

        const {regionalRestriction} = this.props;

        setTitle('Options');

        return <div>
            <h1>Options <NewWindowLink /></h1>

            <form onSubmit={this.handleFormSubmit}>
        <div className="row">
                  <div className="col-sm-3 col-xs-6 form-group">
                      <label>Standard Background Image <HelpPopover placement="right" title="Background Image">
                      Disable the standard background image to get a solid color image.
                      </HelpPopover></label>
                      <select className="form-control" onChange={this.handleChanges.standardBackground} value={this.state.standardBackground}>
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                      </select>
                  </div>



                  <div className="col-sm-3 col-xs-6 form-group">
                        <label>Auto Delete Old Box Scores <HelpPopover placement="right" title="Auto Delete Old Box Scores">
                        This will automatically delete box scores from previous seasons because box scores use a lot of disk space.
                        </HelpPopover></label>
                        <select className="form-control"  onChange={this.handleChanges.autoDeleteOldBoxScores} value={this.state.autoDeleteOldBoxScores}>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>

                  <div className="col-sm-3 col-xs-6 form-group">
                      <label>Auto Delete Retired Players <HelpPopover placement="right" title="Auto Delete Retired Players">
                      This will automatically delete retired players who did not win awards, or were not on the user's team, because retired players use a lot of disk space and make it hard to export files.
                      </HelpPopover></label>
                      <select className="form-control"  onChange={this.handleChanges.autoDeleteUnnotableRetiredPlayers} value={this.state.autoDeleteUnnotableRetiredPlayers}>
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                      </select>
                  </div>
            </div>

                <button className="btn btn-primary" id="save-god-mode-options" >Save Options</button>
            </form>
        </div>;
    }
}

Options.propTypes = {

    godMode: React.PropTypes.bool.isRequired,

    regionalRestriction: React.PropTypes.bool.isRequired,
    autoDeleteOldBoxScores: React.PropTypes.bool.isRequired,
    autoDeleteUnnotableRetiredPlayers:  React.PropTypes.bool.isRequired,
    standardBackground: React.PropTypes.bool.isRequired,



};

export default Options;
