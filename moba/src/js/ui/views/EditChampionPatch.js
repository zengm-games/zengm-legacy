import React from 'react';
import {g, helpers} from '../../common';
import {logEvent, setTitle, toWorker} from '../util';

class EditChampionPatch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            championPatch: this.props.championPatch,
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

			
			// don't think they work, prevent from loading or not?
			console.log("do these work anymore");
            // Validate teams
          // if (newPatch.length < g.numTeams) {
          //      console.log("ROSTER ERROR: Wrong number of champion patch ranks");
          //      return;
         //   }
			//console.log(newPatch);
			//console.log(newPatch.length);			
            for (let i = 0; i < newPatch.length; i++) {
			//	console.log(i);
			//	console.log(newPatch[i]);
				
		        if (i !== newPatch[i].cpid) {
                    console.log(`CHAMPION PATCH ERROR: Wrong cpid, champion patch ${i}`);
                    return;
                }		
								
       
				if (newPatch[i].cpid < 0) {
					console.log("ROSTER ERROR: Invalid cpid, champion " + i);
					return;
				}
		 		if (newPatch[i].rank < 0) {
					console.log("ROSTER ERROR: Invalid champion rank, champion " + i);
					return;
				}
				if (typeof newPatch[i].champion !== "string") {
					console.log("ROSTER ERROR: Invalid name, champion " + i);
					return;
				}
		/*if (g.champType == 0) {
					if ((newPatch[i].role !== "ADC") && (newPatch[i].role !== "JGL")  && (newPatch[i].role !== "TOP") && (newPatch[i].role !== "MID") && (newPatch[i].role !== "SUP") )   {
						console.log("ROSTER ERROR: Invalid role, champion " + i);
						return;
					}					
				} else {
					if ((newPatch[i].role !== "SAFE") && (newPatch[i].role !== "JGL")  && (newPatch[i].role !== "OFF") && (newPatch[i].role !== "MID") && (newPatch[i].role !== "ROAM") )   {
						console.log("ROSTER ERROR: Invalid role, champion " + i);
						return;
					}					
				}*/




              /*  if (typeof newPatch[i].rank !== "number") {
                    console.log(`ROSTER ERROR: Invalid rank, champion patch ${i}`);
                    return;
                }*/
            }

            await toWorker('updateChampionPatch', newPatch);

            this.setState({
                championPatch: newPatch,
            });

            logEvent({
                type: 'success',
                text: 'New champion patch info successfully loaded.',
                saveToDb: false,
            });
        };
    }

    handleInputChange(i, name, e) {
        // Mutating state, bad
        this.state.championPatch[i][name] = e.target.value;

        this.setState({
            championPatch: this.state.championPatch,
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({
            saving: true,
        });

        await toWorker('updateChampionPatch', this.state.championPatch);

        logEvent({
            type: 'success',
            text: 'Saved champion patch info.',
            saveToDb: false,
        });

        this.setState({
            saving: false,
        });
    }

    render() {
        setTitle('Champion Patch Info');

        if (!this.props.godMode) {
            return <div>
                <h1>Error</h1>
                <p>You can't edit champion patch info unless you enable <a href={helpers.leagueUrl(["god_mode"])}>God Mode</a></p>
            </div>;
        }

        const {saving, championPatch} = this.state;

        return <div>
			<h1>Edit Champion Patch Info</h1>

			<p>You can manually edit champion patch strength below or you can upload a champion patch file to specify all of the champion info at once. Uploading also allows you to add or subtract as many roles as you want for uploading into new leagues.</p>

			<h2>Upload Champion Patch File</h2>

			<p>The JSON file format is described in <a href="http://basketball-gm.com/manual/customization/teams/">the manual</a>. You can also  <a href="http://zengm.com/files/championPatchMOBA.json">download </a> the starting champion patch file to make changes for uploading. In leagues with changing champion patch data go to Tools > Export for the current patch data.</p>


            <p className="text-danger">Warning: selecting a valid champion patch file will instantly apply the new champion patch info to your league.</p>

            <p><input type="file" onChange={e => this.handleFile(e)} /></p>

            <h2>Manual Editing</h2>

            <div className="row hidden-xs" style={{fontWeight: 'bold', marginBottom: '0.5em'}}>
                <div className="col-sm-4">
                    <br />Name
                </div>
                <div className="col-sm-4" >
                    <br />Role
                </div>
                <div className="col-sm-4">
                    <br />Patch Level (1.00=best)
                </div>
            </div>

            <form onSubmit={this.handleSubmit}>
                <div className="row">
                    {championPatch.map((cp, i) => <div key={cp.cpid}>
                        <div className="col-xs-6 col-sm-4 form-group">
                            <label className="visible-xs">Organization</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'champion', e)} value={cp.champion} />
                        </div>
                        <div className="col-xs-6 col-sm-4   form-group">
                            <label className="visible-xs">Short Name</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'role', e)} value={cp.role} />
                        </div>
                        <div className="col-xs-6 col-sm-4  form-group">
                            <label className="visible-xs">Abbrev</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'rank', e)} value={cp.rank} />
                        </div>
                        <hr className="visible-xs" />
                    </div>)}
                </div>
                <center>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        Update Champion Patch Info
                    </button>
                </center>
            </form>
        </div>;
    }
}

EditChampionPatch.propTypes = {
    godMode: React.PropTypes.bool.isRequired,
    teams: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    championPatch: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,	
};

export default EditChampionPatch;
