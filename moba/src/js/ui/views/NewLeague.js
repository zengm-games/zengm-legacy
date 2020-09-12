import React from 'react';
import {helpers} from '../../common';
import {emitter, realtimeUpdate, setTitle, toWorker} from '../util';

const PopText = ({teams, tid, typeid}) => {
    let msg = <span>Region population: ?<br />Difficulty: ?</span>;
	let ratio = 1;

	if (typeid == 0) {
		ratio = 1;
	} else if (typeid  == 1) {
		ratio = 1;
	} else if (typeid  == -1) {
		ratio = 3;
	} else if (typeid  == -2) {
		ratio = 3;
	} else if (typeid  == 2) {
		ratio = 1;
	} else if (typeid == 3) {
		ratio = 1;
	} else if (typeid == 4) {
		ratio = 1;
	} else if (typeid  == 5) {
		ratio = 5;
	} else if (typeid  == 6) {
		ratio = 5;
	} else {
		ratio = 17;
	}

    if (tid >= 0) {
        const t = teams.find(t2 => t2.tid === tid);
        if (t) {
            let difficulty;
            if (t.popRank <= 2*ratio) {
                difficulty = "very easy";
            } else if (t.popRank <= 4*ratio) {
                difficulty = "easy";
            } else if (t.popRank <= 6*ratio) {
                difficulty = "normal";
            } else if (t.popRank <= 8*ratio) {
                difficulty = "hard";
            } else {
                difficulty = "very hard";
            }
            msg = <span>Hype #{t.popRank} leaguewide<br />Difficulty: {difficulty}</span>;
        }
    }

    return <span className="help-block">{msg}</span>;
};

PopText.propTypes = {
    teams: React.PropTypes.arrayOf(React.PropTypes.shape({
        // pop and popRank not required for Random Team
        pop: React.PropTypes.number,
        popRank: React.PropTypes.number,
        tid: React.PropTypes.number.isRequired,
    })).isRequired,
    tid: React.PropTypes.number.isRequired,
	typeid: React.PropTypes.number,
};

const defaultTeams = helpers.getTeamsNADefault();
defaultTeams.unshift({
    tid: -1,
    region: "Random",
    name: "Team",
});

const gameType = helpers.getGameType();
const champType = helpers.getChampType();
const patchType = helpers.getPatchType();
const yearType = helpers.getYearType();
const GMCoachType = helpers.getGMCoachType();
const difficultyType = helpers.getDifficultyType();


class NewLeague extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            creating: false,
            customize: 'random',
            invalidLeagueFile: false,
            leagueFile: null,
            name: props.name,
			typeid: 0,
			typeid2: 'NA',
			champid: 0,			
			patchid: 0,
			GMCoachid: 0,
			yearid: 0,			
			difficulty: 1,
            parsing: false,
            randomizeRosters: false,
            teams: defaultTeams,
            tid: props.lastSelectedTid,
        };

		this.handleWorkingType = this.handleWorkingType.bind(this);

        this.handleChanges = {
            name: this.handleChange.bind(this, 'name'),
            randomizeRosters: this.handleChange.bind(this, 'randomizeRosters'),
            tid: this.handleChange.bind(this, 'tid'),
        };

        this.handleChangesChamp = {
            champid: this.handleChange.bind(this, 'champid'),
        };		
		
        this.handleChangesPatch = {
            patchid: this.handleChange.bind(this, 'patchid'),
        };
        this.handleChangesYear = {
            yearid: this.handleChange.bind(this, 'yearid'),
        };		
        this.handleChangesGMCoach = {
            GMCoachid: this.handleChange.bind(this, 'GMCoachid'),
        };		
        this.handleChangesDifficulty = {
            difficulty: this.handleChange.bind(this, 'difficulty'),
        };				
        this.handleCustomizeChange = this.handleCustomizeChange.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

	handleWorkingType(e) {
        const updatedState = {
            typeid: e.target.value,
        };

		let newTeams2;

        if (updatedState.typeid === 0) {
			newTeams2 = helpers.getTeamsNADefault();
        } else if (updatedState.typeid == -1) {
			newTeams2 = helpers.getTeamsNADefault();
        } else if (updatedState.typeid == 1) {
			newTeams2 = helpers.getTeamsDefault();
        } else if (updatedState.typeid == -2) {
			newTeams2 = helpers.getTeamsDefault();
        } else if (updatedState.typeid == 2) {
			newTeams2 = helpers.getTeamsLCKDefault();
        } else if (updatedState.typeid == 3) {
			newTeams2 = helpers.getTeamsLPLDefault();
        } else if (updatedState.typeid == 4) {
			newTeams2 = helpers.getTeamsLMSDefault();
        } else if (updatedState.typeid == 5) {
			newTeams2 = helpers.getTeamsWorldsDefault();
        } else if (updatedState.typeid == 6) {
			newTeams2 = helpers.getTeamsWorldsDefault();
        } else {
			newTeams2 = helpers.getTeamsWorldsLadderDefault();
		}


		// Add random team
		newTeams2.unshift({
			tid: -1,
			region: "Random",
			name: "Team",
		});

		updatedState.teams = newTeams2;

        this.setState(updatedState);
    }

    handleChangesChamp(name, e) {
        let val = e.target.value;

        this.setState({
            [name]: val,
        });
    }
	
    handleChangesPatch(name, e) {
        let val = e.target.value;

        this.setState({
            [name]: val,
        });
    }



    handleChangesDifficulty(name, e) {
        let val = e.target.value;

        this.setState({
            [name]: val,
        });
    }

    handleChangesGMCoach(name, e) {
        let val = e.target.value;

        this.setState({
            [name]: val,
        });
    }	
    handleChange(name, e) {
        let val = e.target.value;
        if (name === 'tid') {
            val = parseInt(e.target.value, 10);
        } else if (name === 'randomizeRosters') {
            val = e.target.checked;
        }
        this.setState({
            [name]: val,
        });
    }

    handleCustomizeChange(e) {
        const updatedState = {
            customize: e.target.value,
            invalidLeagueFile: false,
        };
        if (updatedState.customize === 'random') {

			if (state.typeid === 0) {
				newTeams2 = helpers.getTeamsNADefault();
			} else if (state.typeid == -1) {
				newTeams2 = helpers.getTeamsNADefault();
			} else if (state.typeid == 1) {
				newTeams2 = helpers.getTeamsDefault();
			} else if (state.typeid == -2) {
				newTeams2 = helpers.getTeamsDefault();
			} else if (state.typeid == 2) {
				newTeams2 = helpers.getTeamsLCKDefault();
			} else if (state.typeid == 3) {
				newTeams2 = helpers.getTeamsLPLDefault();
			} else if (state.typeid == 4) {
				newTeams2 = helpers.getTeamsLMSDefault();
			} else if (state.typeid == 5) {
				newTeams2 = helpers.getTeamsWorldsDefault();
			} else if (state.typeid == 6) {
				newTeams2 = helpers.getTeamsWorldsDefault();
			} else {
				newTeams2 = helpers.getTeamsWorldsLadderDefault();
			}
			// Add random team
			newTeams2.unshift({
				tid: -1,
				region: "Random",
				name: "Team",
			});
			updatedState.teams = newTeams2;
        }

        this.setState(updatedState);
    }

    handleFile(e) {
        this.setState({
            invalidLeagueFile: false,
            leagueFile: null,
            parsing: true,
        });
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const reader = new window.FileReader();
        reader.readAsText(file);
        reader.onload = event => {
            let leagueFile;
            try {
                leagueFile = JSON.parse(event.target.result);
            } catch (err) {
                console.log(err);
                this.setState({
                    invalidLeagueFile: true,
                    parsing: false,
                });
                return;
            }

            const updatedState = {
                invalidLeagueFile: false,
                leagueFile,
                parsing: false,
            };

            let newTeams = helpers.deepCopy(leagueFile.teams);
            if (newTeams) {
                for (const t of newTeams) {
                    // Is pop hidden in season, like in editTeamInfo import?
                    if (!t.hasOwnProperty("pop") && t.hasOwnProperty("seasons")) {
                        t.pop = t.seasons[t.seasons.length - 1].pop;
                    }

                    t.pop = parseFloat(t.pop.toFixed(2));
                }

                newTeams = helpers.addPopRank(newTeams);

                // Add random team
                newTeams.unshift({
                    tid: -1,
                    region: "Random",
                    name: "Team",
                });

                updatedState.teams = newTeams;
            }

            // Is a userTid specified?
            if (leagueFile.hasOwnProperty("gameAttributes")) {
                leagueFile.gameAttributes.some(attribute => {
                    if (attribute.key === "userTid") {
                        // Set it to select the userTid entry
                        updatedState.tid = attribute.value;
                    }
                });
            }

            this.setState(updatedState);
        };
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({creating: true});

        let startingSeason = 2019;

        let leagueFile;
        let randomizeRosters = false;
        if (this.state.customize === 'custom-rosters') {
            leagueFile = this.state.leagueFile;
            randomizeRosters = this.state.randomizeRosters;
            startingSeason = leagueFile.startingSeason !== undefined ? leagueFile.startingSeason : startingSeason;
        }

        const lid = await toWorker('createLeague',startingSeason,  this.state.name, this.state.tid,   this.state.typeid2, this.state.typeid, this.state.champid, this.state.patchid,  this.state.yearid,  this.state.GMCoachid, this.state.difficulty, leagueFile,  randomizeRosters);
        realtimeUpdate([], `/l/${lid}`);
		let bothSplits = false;
		if (this.state.typeid>5) {
			bothSplits = true;
		} 
//		emitter.emit('updateTopMenu', {bothSplits: this.state.typeidz>5});
//		emitter.emit('updateTopMenu', {bothSplits: true});
		emitter.emit('updateTopMenu', {bothSplits: bothSplits});
    }

    render() {
        const {creating, customize, invalidLeagueFile, leagueFile, name, typeid, typeid2, champid, patchid, yearid,GMCoachid, difficulty, parsing, randomizeRosters, teams, tid} = this.state;

        setTitle('Create New League');

        return <div className="newleague-wrapper">
            <h1 className="disabled">Create New League</h1>

            <form onSubmit={this.handleSubmit}>
                <div className="row">

                    <div className="form-group col-md-6 col-sm-12 col-lg-4 select-wrapper2">
                        <label>Which game type do you want to play?</label>
                        <select
                            className="form-control"
                            onChange={this.handleWorkingType}
                            value={typeid}
                        >
                            {gameType.map(gt => {
                                return <option key={gt.typeid} value={gt.typeid}>
                                    {gt.name}
                                </option>;
                            })}
                        </select>
                    </div>
                  <div className="form-group col-md-6 col-sm-12 col-lg-4 select-wrapper2">
                        <label>Year Format</label>
                        <select className="form-control" value={yearid} onChange={this.handleChangesYear.yearid}>
                            {yearType.map(ct => {
                                return <option key={ct.yearid} value={ct.yearid}>
                                    {ct.name}
                                </option>;
                            })}
                        </select>
                    </div>						
                    <div className="form-group col-md-6 col-sm-12 col-lg-4 select-wrapper2">
                        <label>Champion/Hero Type</label>
                        <select className="form-control" value={champid} onChange={this.handleChangesChamp.champid}>
                            {champType.map(pt => {
                                return <option key={pt.champid} value={pt.champid}>
                                    {pt.name}
                                </option>;
                            })}
                        </select>
                    </div>
                    <div className="form-group col-md-6 col-sm-12 col-lg-4 select-wrapper2">
                        <label>GM or Coach Mode?</label>
                        <select className="form-control" value={GMCoachid} onChange={this.handleChangesGMCoach.GMCoachid}>
                            {GMCoachType.map(ct => {
                                return <option key={ct.GMCoachid} value={ct.GMCoachid}>
                                    {ct.name}
                                </option>;
                            })}
                        </select>
                    </div>					
                   <div className="form-group col-md-6 col-sm-12 col-lg-4 select-wrapper2">
                        <label>Difficulty</label>
                        <select className="form-control" value={difficulty} onChange={this.handleChangesDifficulty.difficulty}>
                            {difficultyType.map(ct => {
                                return <option key={ct.difficulty} value={ct.difficulty}>
                                    {ct.name}
                                </option>;
                            })}
                        </select>
                    </div>	

                </div>

                <div className="row">
                    <div className="form-group col-md-6 col-sm-12 col-lg-4 select-wrapper2">
                        <label>League name</label>
                        <input className="form-control" type="text" value={name} onChange={this.handleChanges.name} />
                    </div>
                    <div className="form-group col-md-6 col-sm-12 col-lg-4 select-wrapper2">
                        <label>Which team do you want to manage?</label>
                        <select className="form-control" value={tid} onChange={this.handleChanges.tid}>
                            {teams.map(t => {
                                return <option key={t.tid} value={t.tid}>
                                    {t.region}
                                </option>;
                            })}
                        </select>
                        <PopText typeid={typeid}  tid={tid} teams={teams} />
                    </div> 
                    <div className="col-md-6 col-sm-12 col-lg-4 select-wrapper2">
                        <div className="form-group">
                            <label>Customize</label>
                            <select
                                className="form-control"
                                onChange={this.handleCustomizeChange}
                                value={customize}
                            >
                                <option value="random">Random Players</option>
                                <option value="custom-rosters">Upload League File</option>
                            </select>
                            <span className="help-block">Teams in your new league can either be filled by randomly-generated players or by players from a <a href="https://basketball-gm.com/manual/customization/">custom League File</a> you upload.</span>
                        </div>
                        {customize === 'custom-rosters' ? <div>
                            <div>
                                <input type="file" onChange={this.handleFile} />
                                {invalidLeagueFile ? <p className="text-danger" style={{marginTop: '1em'}}>Error: Invalid League File</p> : null}
                                {parsing ? <p className="text-info" style={{marginTop: '1em'}}>Parsing league file...</p> : null}
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input onChange={this.handleChanges.randomizeRosters} type="checkbox" value={randomizeRosters} /> Shuffle Rosters
                                </label>
                            </div>
                        </div> : null}
                    </div>

                </div>

				{yearid == 0 || (yearid == 2019 && (typeid == 3 || typeid == 5) ) ? <div className="row">

                    <div className="col-md-12 col-sm-5 text-center">
                        <div className="visible-sm invisible-xs"><br /><br /></div>
                        <button type="submit" className="btn-custom1 btn-gradient1" disabled={creating || parsing || (customize === 'custom-rosters' && (invalidLeagueFile || leagueFile === null))}>
                            Create New League
                        </button>
                    </div>

                </div> :
				<div className="row">

                    <div className="col-md-12 col-sm-5 text-center">
                        <div className="visible-sm invisible-xs"><br /><br /></div>
                       
                           Only changes are for LPL and Worlds.
                        
                    </div>

                </div>
				}

            </form>
        </div>;
    }
}

NewLeague.propTypes = {
    name: React.PropTypes.string.isRequired,
    lastSelectedTid: React.PropTypes.number.isRequired,
};

export default NewLeague;
