import React from 'react';
import {g, helpers} from '../../common';
import {logEvent, setTitle, toWorker} from '../util';

class EditTeamInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            teams: this.props.teams,
        };
        this.handleFile = this.handleFile.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleFile(e) {
        const file = e.target.files[0];

        const reader = new window.FileReader();
        reader.readAsText(file);
        reader.onload = async event => {
            const rosters = JSON.parse(event.target.result);
            const newTeams = rosters.teams;

            // Validate teams
            if (newTeams.length < g.numTeams) {
                console.log("ROSTER ERROR: Wrong number of teams");
                return;
            }
            for (let i = 0; i < newTeams.length; i++) {
                if (i !== newTeams[i].tid) {
                    console.log(`ROSTER ERROR: Wrong tid, team ${i}`);
                    return;
                }		
								
				
				if (g.gameType == 0 || (g.gameType>1 && g.gameType<5)) {
					if (newTeams[i].cid < 0 || newTeams[i].cid > 0) {
						console.log("ROSTER ERROR: Invalid cid, team " + i);
						return;
					}						
				} else if (g.gameType == 1 && (newTeams[i].cid < 0 || newTeams[i].cid > 2) ) {
					//if (newTeams[i].cid < 0 || newTeams[i].cid > 0) {
						console.log("ROSTER ERROR: Invalid cid, team " + i);
						return;
					//}												
				} else if (g.gameType == 5 && (newTeams[i].cid < 0 || newTeams[i].cid > 5) ) {
					if (newTeams[i].cid < 0 || newTeams[i].cid > 0) {
						console.log("ROSTER ERROR: Invalid cid, team " + i);
						return;
					}												
				}
				
				if (g.gameType == 0 || (g.gameType>1 && g.gameType<5)) {
				   if (newTeams[i].did < 0 || newTeams[i].did > 0) {
						console.log("ROSTER ERROR: Invalid did, team " + i);
						return;
					}				
				} else if (g.gameType == 1 && (newTeams[i].did < 0 || newTeams[i].did > 2) ) {
					//if (newTeams[i].did < 0 || newTeams[i].did > 0) {
						console.log("ROSTER ERROR: Invalid did, team " + i);
						return;
					//}												
				} else if (g.gameType == 5 && (newTeams[i].did < 0 || newTeams[i].did > 5) ) {
					//if (newTeams[i].did < 0 || newTeams[i].did > 0) {
						console.log("ROSTER ERROR: Invalid did, team " + i);
						return;
					//}												
				}									
				
				
              //  if (newTeams[i].did < 0 || newTeams[i].did > 5) {
              //      console.log(`ROSTER ERROR: Invalid did, team ${i}`);
             //       return;
             //   }
                if (typeof newTeams[i].region !== "string") {
                    console.log(`ROSTER ERROR: Invalid region, team ${i}`);
                    return;
                }
                if (typeof newTeams[i].name !== "string") {
                    console.log(`ROSTER ERROR: Invalid name, team ${i}`);
                    return;
                }
                if (typeof newTeams[i].abbrev !== "string") {
                    console.log(`ROSTER ERROR: Invalid abbrev, team ${i}`);
                    return;
                }

                // Check for pop in either the root or the most recent season
                if (!newTeams[i].hasOwnProperty("pop") && newTeams[i].hasOwnProperty("seasons")) {
                    newTeams[i].pop = newTeams[i].seasons[newTeams[i].seasons.length - 1].pop;
                }

                if (typeof newTeams[i].pop !== "number") {
                    console.log(`ROSTER ERROR: Invalid pop, team ${i}`);
                    return;
                }
            }

            await toWorker('updateTeamInfo', newTeams);

            this.setState({
                teams: newTeams,
            });

            logEvent({
                type: 'success',
                text: 'New team info successfully loaded.',
                saveToDb: false,
            });
        };
    }

    handleInputChange(i, name, e) {
        // Mutating state, bad
        this.state.teams[i][name] = e.target.value;

        this.setState({
            teams: this.state.teams,
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({
            saving: true,
        });

        await toWorker('updateTeamInfo', this.state.teams);

        logEvent({
            type: 'success',
            text: 'Saved team info.',
            saveToDb: false,
        });

        this.setState({
            saving: false,
        });
    }

    render() {
        setTitle('Edit Team Info');

        if (!this.props.godMode) {
            return <div>
                <h1>Error</h1>
                <p>You can't edit teams unless you enable <a href={helpers.leagueUrl(["god_mode"])}>God Mode</a></p>
            </div>;
        }

        const {saving, teams} = this.state;

        return <div>
            <h1>Edit Team Info</h1>

            <p>You can manually edit the teams below or you can upload a teams file to specify all of the team info at once.</p>

            <h2>Upload Teams File</h2>
            
			<p>The JSON file format is described in <a href="http://basketball-gm.com/manual/customization/teams/">the manual</a>. As examples, you can download <a href="http://zengm.com/files/LCS.json">LCS </a>,  <a href="http://zengm.com/files/LCSLadder.json" >LCS w/ Ladder </a>,  <a href="http://zengm.com/files/LCK.json">LCK </a>,  <a href="http://zengm.com/files/LPL.json" >LPL </a>,  <a href="http://zengm.com/files/LMS.json">LMS </a>, <a href="http://zengm.com/files/Worlds.json">Worlds </a> , and  <a href="http://zengm.com/files/WorldsWithLadder.json">Worlds w/ Ladder </a> team files.</p>
			

            <p className="text-danger">Warning: selecting a valid team file will instantly apply the new team info to your league.</p>

            <p><input type="file" onChange={e => this.handleFile(e)} /></p>

            <h2>Manual Editing</h2>

            <div className="row hidden-xs" style={{fontWeight: 'bold', marginBottom: '0.5em'}}>
                <div className="col-sm-2">
                    <br />Region
                </div>
                <div className="col-sm-2">
                    <br />Name
                </div>
                <div className="col-sm-2 col-md-1">
                    <br />Abbrev
                </div>
                <div className="col-sm-2 col-md-1">
                    <br />Hype
                </div>
                <div className="col-sm-2 col-md-1">
                    <br />Region
                </div>				
                <div className="col-sm-4 col-md-5">
                    <br />Logo URL
                </div>
            </div>

            <form onSubmit={this.handleSubmit}>
                <div className="row">
                    {teams.map((t, i) => <div key={t.tid}>
                        <div className="col-xs-6 col-sm-2 form-group">
                            <label className="visible-xs">Organization</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'region', e)} value={t.region} />
                        </div>
                        <div className="col-xs-6 col-sm-2 form-group">
                            <label className="visible-xs">Short Name</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'name', e)} value={t.name} />
                        </div>
                        <div className="col-xs-6 col-sm-2 col-md-1 form-group">
                            <label className="visible-xs">Abbrev</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'abbrev', e)} value={t.abbrev} />
                        </div>
                        <div className="col-xs-6 col-sm-2 col-md-1 form-group">
                            <label className="visible-xs">Starting Hype</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'pop', e)} value={t.pop} />
                        </div>
                        <div className="col-xs-6 col-sm-2 col-md-1 form-group">
                            <label className="visible-xs">Starting Hype</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'country', e)} value={t.country} />
                        </div>						
                        <div className="col-sm-4 col-md-5 form-group">
                            <label className="visible-xs">Logo URL</label>
                            <input type="text" className="form-control" onChange={e => this.handleInputChange(i, 'imgURL', e)} value={t.imgURL} />
                        </div>
                        <hr className="visible-xs" />
                    </div>)}
                </div>
                <center>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        Update Team Info
                    </button>
                </center>
            </form>
        </div>;
    }
}

EditTeamInfo.propTypes = {
    godMode: React.PropTypes.bool.isRequired,
    teams: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

export default EditTeamInfo;
