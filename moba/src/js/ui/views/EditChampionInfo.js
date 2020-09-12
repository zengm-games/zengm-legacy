import React from 'react';
import {g, helpers} from '../../common';
import {logEvent, setTitle, toWorker} from '../util';

class EditChampionPatch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            champions: this.props.champions,			
        };
        this.handleFile = this.handleFile.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleFile(e) {
        const file = e.target.files[0];

        const reader = new window.FileReader();
        reader.readAsText(file);
        reader.onload = async event => {
            const patch = JSON.parse(event.target.result);
            const newPatch = patch.championPatch;
            const rosters = JSON.parse(event.target.result);
            const newChampions = rosters.champions;			

			
           // Validate teams
            if (newChampions.length < g.numChampions) {
                console.log("ROSTER ERROR: Wrong number of champions");
                return;
            }
            for (let i = 0; i < newChampions.length; i++) {
                if (i !== newChampions[i].hid) {
                    console.log(`ROSTER ERROR: Wrong hid, champion ${i}`);
                    return;
                }		
								
				
				if (newChampions[i].hid < 0) {
					console.log("ROSTER ERROR: Invalid hid, champion " + i);
					return;
				}
			/*	if (newChampions[i].ratings.early < 0 || newChampions[i].ratings.early > 100) {
					console.log("ROSTER ERROR: Invalid attack rating, champion " + i);
					return;
				}
				if (newChampions[i].ratings.defense2 < 0 || newChampions[i].ratings.defense2 > 100) {
					console.log("ROSTER ERROR: Invalid defense rating, champion " + i);
					return;
				}
				if (newChampions[i].ratings.ability2 < 0 || newChampions[i].ratings.ability2 > 100) {
					console.log("ROSTER ERROR: Invalid ability rating, champion " + i);
					return;
				} */
				if (typeof newChampions[i].name !== "string") {
					console.log("ROSTER ERROR: Invalid name, champion " + i);
					return;
				}
			}

            await toWorker('updateChampionInfo', newChampions);

            this.setState({
                champions: newChampions,
            });

            logEvent({
                type: 'success',
                text: 'New champion info successfully loaded.',
                saveToDb: false,
            });
        };
    }

    handleInputChange(i, name, e) {
        // Mutating state, bad
		if (name == "name") {
			this.state.champions[i][name] = e.target.value;		
		} else {
			this.state.champions[i].ratings[name] = e.target.value;		
		}

        this.setState({
            champions: this.state.champions,			
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({
            saving: true,
        });

      await toWorker('updateChampionInfo', this.state.champions);

        logEvent({
            type: 'success',
            text: 'Saved champion info.',
            saveToDb: false,
        });


        this.setState({
            saving: false,
        });
    }

    render() {
        setTitle('Edit Champion Info');

        if (!this.props.godMode) {
            return <div>
                <h1>Error</h1>
                <p>You can't edit champions unless you enable <a href={helpers.leagueUrl(["god_mode"])}>God Mode</a></p>
            </div>;
        }

        const {saving, champions} = this.state;
		var label1 = "Early";
		var label2 = "Mid";
		var label3 = "Late";
		
		if (this.props.champType == 0) {
			//Role		Damage		Toughness		Control	Mobility	Utility	Damage Type
			// early mid late
			//label1 = 1;
			//label2 = 3;
			//label3 = 2;
		} else {
		}
		
        return <div>
            <h1>Edit Champion Info</h1>

			<p>You can manually edit some aspects of champion info below or you can upload a champion file to specify all of the champion info at once.</p>

			<h2>Upload Champion File</h2>

			<p>The JSON file format is described in <a href="http://basketball-gm.com/manual/customization/teams/">the manual</a>. You can also  <a href="http://zengm.com/files/championBasicInfoMOBA.json">download </a> the current champion file to make changes for uploading. You can have as few or many champions as you would like.</p>

			<p>If you are adding new champions give it a few seconds for the champions to update. Every player is getting a new player champion skill rating. </p>

            <p className="text-danger">Warning: selecting a valid champion file will instantly apply the new champion info to your league.</p>

            <p><input type="file" onChange={e => this.handleFile(e)} /></p>
			
            <h2>Manual Editing</h2>

            <div className="row hidden-xs" style={{fontWeight: 'bold', marginBottom: '0.5em'}}>
                <div className="col-sm-3">
                    <br />Name
                </div>
                <div className="col-sm-3">
                    <br /> {label1} 
                </div>
                <div className="col-sm-3">
                    <br /> {label2} 
                </div>
                <div className="col-sm-3">
                    <br /> {label3} 
                </div>
            </div>


         <form onSubmit={this.handleSubmit}>
	 
                <div className="row">
                    {champions.map((c, i) => <div key={c.hid}>
                        <div className="col-xs-6 col-sm-3 form-group">
                            <label className="visible-xs">Name</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'name', e)} value={c.name} />
                        </div>
                        <div className="col-xs-6 col-sm-3 form-group">
                            <label className="visible-xs">Early</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'early', e)} value={c.ratings.early} />
                        </div>
                        <div className="col-xs-6 col-sm-3 form-group">
                            <label className="visible-xs">Mid</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'mid', e)} value={c.ratings.mid} />
                        </div>
                        <div className="col-xs-6 col-sm-3 form-group">
                            <label className="visible-xs">Late</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'late', e)} value={c.ratings.late} />
                        </div>						

                        <hr className="visible-xs" />
                    </div>)}
                </div>
                <center>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        Update champion Info
                    </button>
                </center>
            </form>			
			
			
			
			
			
        </div>;
    }
}

EditChampionPatch.propTypes = {
    godMode: React.PropTypes.bool.isRequired,
    champType: React.PropTypes.bool.isRequired,	
    teams: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    champions: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,		
};

export default EditChampionPatch;
