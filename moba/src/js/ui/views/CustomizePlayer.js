/* eslint react/jsx-no-bind: "off" */

import faces from '../../vendor/faces';
import React from 'react';
//import {player} from '../core';
import {PHASE, g, helpers} from '../../common';
import {realtimeUpdate, setTitle, toWorker} from '../util';
import {NewWindowLink, PlayerPicture} from '../components';

const positions = ["TOP", "JGL", "MID", "ADC", "SUP"];
const country = ["United States","Korea","China", "Taiwan", "Canada","Dominican Republic","Mexico","Austria","Armenia", "Belgium", "Bulgaria","Croatia","Czech Republic", "Denmark", "England", "Estonia", "France","Finland","Germany", "Greece", "Hungary","Iceland","Ireland","Italy","Netherlands", "Norway","Portugal", "Poland", "Romania", "Scotland","Serbia", "Spain", "Sweden","Switzerland","Latvia","Slovenia","Slovakia", "Russia","Ukraine", "Brazil", "Japan", "Australia","New Zealand", "Colombia", "Costa Rica", "Ecuador", "Panama", "Peru", "Puerto Rico", "Venezuela", "Argentina", "Chile", "Paraguay", "Uruguay","Israel","Turkey","Iraq","Iran","Syria","United Arab Emirates","South Africa","Indonesia","Malaysia","Philippines","Singapore", "Thailand","Vietnam"];
const region = ["NA","EU","KR", "CN","TW","BR","CIS","JP","LatAm","OCE", "SEA","TR"];
const languagesFirst = ["English","Korean","Chinese","Spanish","German","French","Italian","Romanian","Greek","Armenian","Bulgarian","Dutch","Polish", "Danish","Finnish","Swedish","Hungarian","Norwegian","Icelandic","Russian","Czech","Portuguese","Croatian","Serbian","Slovak","Slovenian","Filipino","Indonesian","Japanese","Malay","Thai","Vietnamese","Turkish","Persian","Arabic"];
const languagesRest = ["","English","Korean","Chinese","Spanish","German","French","Italian","Romanian","Greek","Armenian","Bulgarian","Dutch","Polish", "Danish","Finnish","Swedish","Hungarian","Norwegian","Icelandic","Russian","Czech","Portuguese","Croatian","Serbian","Slovak","Slovenian","Filipino","Indonesian","Japanese","Malay","Thai","Vietnamese","Turkish","Persian","Arabic"];

const faceOptions = faces.partialFileNames;

const copyValidValues = (source, target, season) => {
    for (const attr of ['hgt', 'tid', 'weight']) {
        const val = parseInt(source[attr], 10);
        if (!isNaN(val)) {
            target[attr] = val;
        }
    }

    target.firstName = source.firstName;
    target.userID = source.userID;	
    target.lastName = source.lastName;
    target.imgURL = source.imgURL;

    {
        const age = parseInt(source.age, 10);
        if (!isNaN(age)) {
            target.born.year = g.season - age;
        }
    }

    target.born.loc = source.born.loc;
	
    target.born.country = source.born.country;	

///    target.languages = source.languages;	
//    target.languages[0] = source.languages[0];	
	{
		const r = source.ratings.length - 1;

		target.languages[0] = source.language1;
		target.ratings[r].languages[0] = source.language1;	
		
		target.languages[1] = source.language2;	
//		if (source.language2 == undefined) {
			//target.ratings[r].languages.pop(1);
		//} else {		
			target.ratings[r].languages[1] = source.language2;	
		//}				

		target.languages[2] = source.language3;	
		//if (source.language3 == undefined) {
			//target.ratings[r].languages.pop(2);
		//} else {		
			target.ratings[r].languages[2] = source.language3;	
		//}		
		//target.ratings[r].languages[2] = source.language3;	

		target.languages[3] = source.language4;
		//if (source.language4 == undefined) {
		//	target.ratings[r].languages.pop(3);
		//} else {		
		target.ratings[r].languages[3] = source.language4;	
		
	//	target.ratings[r].region = source.region;			
		//}

	}
	
	
    target.college = source.college;

    {
        const diedYear = parseInt(source.diedYear, 10);
        if (!isNaN(diedYear)) {
            target.diedYear = diedYear;
        } else {
            target.diedYear = null;
        }
    }

	
	// this doesn't work? what does? need to keep testing. it prevents it from saving
  //  {
    //    const language1 = source.languages[0];
      //  target.language[0] = language1;
    //}	
	
    {
        // Allow any value, even above or below normal limits, but round to $10k and convert from M to k
        let amount = Math.round(100 * parseFloat(source.contract.amount)) * 10;
        if (isNaN(amount)) {
            amount = g.minContract;
        }
        target.contract.amount = amount;
    }

    {
        let exp = parseInt(source.contract.exp, 10);
        if (!isNaN(exp)) {
            // No contracts expiring in the past
            if (exp < season) {
                exp = season;
            }

            // If current season contracts already expired, then current season can't be allowed for new contract
            if (exp === season && g.phase >= g.PHASE.RESIGN_PLAYERS) {
                exp += 1;
            }

            target.contract.exp = exp;
        }
    }

    {
        let gamesRemaining = parseInt(source.injury.gamesRemaining, 10);
        if (isNaN(gamesRemaining) || gamesRemaining < 0) {
            gamesRemaining = 0;
        }
        target.injury.gamesRemaining = gamesRemaining;
    }

    target.injury.type = source.injury.type;

    {
        const r = source.ratings.length - 1;
        for (const rating of Object.keys(source.ratings[r])) {
            //if (rating === 'languages') {
//				target.ratings[r].languages[0] = source.ratings[r].languages[0];
//			} else if (rating === 'pos') {
			if (rating === 'pos') {
				//if (target.ratings[r].pos  == source.ratings[r].pos) {
					//target.ratings[r].MMR = 10000;
				//} 
                target.ratings[r].pos = source.ratings[r].pos;
				
            } else if (['blk', 'dnk', 'drb', 'endu', 'fg', 'ft', 'hgt', 'ins', 'jmp', 'pot', 'pss', 'reb', 'spd', 'stl', 'stre', 'tp','ovr'].includes(rating)) {
                const val = helpers.bound(parseInt(source.ratings[r][rating], 10), 0, 100);
				if (rating == 'ovr' && target.ratings[r][rating] != val ) {
					target.ratings[r].oldOVR = true;
				} else if (rating == 'ovr') {
					target.ratings[r].oldOVR = false;					
				}				
				
                if (!isNaN(val)) {
                    target.ratings[r][rating] = val;
                }						

            }
        }
    }

    // These are already normalized, cause they are selects
    for (const attr of ['ear', 'eyebrow', 'eye', 'faceform', 'haircut', 'mouth', 'nose', 'glasses']) {
        target.face.partials[attr] = source.face.partials[attr];
    }

    target.face.colors.skinColor = source.face.colors.skinColor;
    target.face.colors.hairColor = source.face.colors.hairColor;
};

class CustomizePlayer extends React.Component {
    constructor(props) {
        super(props);

        const p = helpers.deepCopy(props.p);
        if (p !== undefined) {
            p.age = this.props.season - p.born.year;
            p.contract.amount /= 1000;
			p.language1 = p.languages[0];	
			if (p.languages.length > 1) {
				p.language2 = p.languages[1];
			}			
			if (p.languages.length > 2) {
				p.language3 = p.languages[2];
			}	
			if (p.languages.length > 3) {
				p.language4 = p.languages[3];
			} else {
			//	p.language4 = [];
			}				
		//	p.ratings[0].MMR = 9999;
			//p.language3 = p.languages[2];	 		
			//p.language4 = p.languages[3];			
        }
        this.state = {
			ovrOption: props.ovrOption,
            appearanceOption: props.appearanceOption,
            saving: false,
            p,
        };
        this.handleChangeOVROption = this.handleChangeOVROption.bind(this);
        this.handleChangeAppearanceOption = this.handleChangeAppearanceOption.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.randomizeFace = this.randomizeFace.bind(this);
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({
            saving: true,
        });

        const p = this.props.p;

        // Copy over values from state, if they're valid
        copyValidValues(this.state.p, p, this.props.season);

        // Only save image URL if it's selected
        if (this.state.appearanceOption !== "Image URL") {
            p.imgURL = "";
        }

        const pid = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season,this.props.ovrOption);

        realtimeUpdate([], helpers.leagueUrl(["player", pid]));
    }

    handleChange(type, field, e) {
        let val = e.target.value;
        const p = this.state.p;


        if (type === 'root') {
			//if (field == "language1") {
				//p.ratings[p.ratings.length - 1].languages[0] = val;
				//p.languages[0] = val;
			//} else {
				p[field] = val;
			//}
		//	if (field = "region") { // two places
			//	p.ratings[p.ratings.length - 1][field] = val;
		//}
        } else if (['born', 'contract', 'injury'].includes(type)) {
            p[type][field] = val;		
		//	if (field = "loc") {
		///		p.ratings[p.ratings.length - 1].region = val;
		//	}
        } else if (type === 'stats') {
			
		//	if (field == "language1") {
		//		p.ratings[p.ratings.length - 1].languages[0] = val;
		//		p.languages[0] = val;
		//	} else {		
		
				p.stats[p.stats.length - 1][field] = val;
        } else if (type === 'rating') {
			
		//	if (field == "language1") {
		//		p.ratings[p.ratings.length - 1].languages[0] = val;
		//		p.languages[0] = val;
		//	} else {		
console.log(field);
console.log(val);
		
				p.ratings[p.ratings.length - 1][field] = val;
		//	}
        } else if (type === 'face') {
            if (['ear', 'eyebrow', 'eye', 'faceform', 'haircut', 'mouth', 'nose', 'glasses'].includes(field)) {
                if (!val) {
                    // If empty string or undefined or null.
                    console.error("Error while submitting the player form! ", "Type: ", type, ' Field: ', field , ' Value: ', val);
                    return;
                }

                p[type]['partials'][field] = val;

            } else if (field === 'skinColor') {
                p[type]['colors'][field] = val;
            } else if (field === 'hairColor') {
                p[type]['colors'][field] = val;
            }
        }


        this.setState({
            p,
        });
    }


    handleChangeOVROption(e) {
        this.setState({
            ovrOption: e.target.value,
        });
    }	
    handleChangeAppearanceOption(e) {
        this.setState({
            appearanceOption: e.target.value,
        });
    }

    randomizeFace(e) {
        e.preventDefault(); // Don't submit whole form

        const face = faces.generate();

        this.state.p.face = face;
        this.setState({
            p: this.state.p,
        });
    }

    trimFacePartialName(optionName){
        // E.g.: a usual partial path in a player "face" property looks like "/img/svg_face_partials/eyebrows/4.svg". A usual option text for select looks like: "4". So we need to trim the "/img/svg_face_partials/" part leaving only "4.svg". Then trim the ".svg" part.
        let trimmedName = optionName.slice(optionName.lastIndexOf('/') + 1).split('.svg')[0];

        return trimmedName;
    }

    render() {
        const {godMode, originalTid, teams} = this.props;
        const {appearanceOption, p, saving, ovrOption} = this.state;

        const title = originalTid === undefined ? 'Create Player' : 'Edit Player';

        setTitle(title);

        if (!godMode) {
            return <div>
                <h1>Error</h1>
                <p>You can't customize players unless you enable <a href={helpers.leagueUrl(["god_mode"])}>God Mode</a></p>
            </div>;
        }

        const r = p.ratings.length - 1;

        let ovrDiv = null;

        if (ovrOption === 'ratings') {
			  ovrDiv =      <div className="row">
                            <div className="col-xs-4">
                                <h3>Mental</h3>
                                <div className="form-group">
                                    <label>Adaptability</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'hgt')} value={p.ratings[r].hgt} />
                                </div>
                                <div className="form-group">
                                    <label>Fortitude</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'stre')} value={p.ratings[r].stre} />
                                </div>
                                <div className="form-group">
                                    <label>Consistency</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'spd')} value={p.ratings[r].spd} />
                                </div>
                                <div className="form-group">
                                    <label>Team Player</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'jmp')} value={p.ratings[r].jmp} />
                                </div>
                                <div className="form-group">
                                    <label>Leadership</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'endu')} value={p.ratings[r].endu} />
                                </div>
                            </div>
                            <div className="col-xs-4">
                                <h3>Tactical</h3>
                                <div className="form-group">
                                    <label>Awareness</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'ins')} value={p.ratings[r].ins} />
                                </div>
                                <div className="form-group">
                                    <label>Laning</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'dnk')} value={p.ratings[r].dnk} />
                                </div>
                                <div className="form-group">
                                    <label>Team Fighting</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'ft')} value={p.ratings[r].ft} />
                                </div>
                                <div className="form-group">
                                    <label>Risk Taking</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'fg')} value={p.ratings[r].fg} />
                                </div>

                            </div>
                            <div className="col-xs-4">
                                <h3>Game</h3>
                                <div className="form-group">
                                    <label>Positioning</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'tp')} value={p.ratings[r].tp} />
                                </div>								
                                <div className="form-group">
                                    <label>Skill Shots</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'blk')} value={p.ratings[r].blk} />
                                </div>
                                <div className="form-group">
                                    <label>Last Hitting</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'stl')} value={p.ratings[r].stl} />
                                </div>
                                <div className="form-group">
                                    <label>Summoner Spells</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'drb')} value={p.ratings[r].drb} />
                                </div>
								<h3>Physical</h3>	
                                <div className="form-group">
                                    <label>Stamina</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'pss')} value={p.ratings[r].pss} />
                                </div>
                                <div className="form-group">
                                    <label>Injury Prone</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'reb')} value={p.ratings[r].reb} />
                                </div>
                            </div>
                        </div>;
			
			
		} else {			
            ovrDiv =   <div className="row">
                            <div className="col-xs-4">
                                <div className="form-group">
                                    <label>Overall</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'ovr')}value={p.ratings[r].ovr} />
                                </div>
                            </div>
                            <div className="col-xs-8" />
                        </div>;
        }		
		
        let pictureDiv = null;

        if (appearanceOption === 'Cartoon Face') {
            pictureDiv = <div className="row">
                <div className="col-sm-4">
                    <div className="face" style={{height: '300px', maxWidth: '150px'}}>
                        <PlayerPicture face={p.face} />
                    </div>
                    <center>
                        <button type="button" className="btn btn-default" onClick={this.randomizeFace}>
                            Randomize
                        </button>
                    </center>
                </div>
                <div className="col-sm-8">
                    <div className="row">
                        <div className="col-xs-6 form-group">
                            <label>Skin Color</label>
                            <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'face', 'skinColor')} value={p.face.colors.skinColor} />
                        </div>
                        <div className="col-xs-6 form-group">
                            <label>Hair Color</label>
                            <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'face', 'hairColor')} value={p.face.colors.hairColor} />
                        </div>

                        <div className="col-xs-6 form-group">
                            <label>Ear</label>
                            <select className="form-control" onChange={this.handleChange.bind(this, 'face', 'ear')} value={p.face.partials.ear}>
                                {faceOptions.ears.map(val => <option key={faces.paths.root + faces.paths.partials.ears + val} value={faces.paths.root + faces.paths.partials.ears + val}>{this.trimFacePartialName(val)}</option>)}
                            </select>
                        </div>

                        <div className="col-xs-6 form-group">
                            <label>Eyebrow</label>
                            <select className="form-control" onChange={this.handleChange.bind(this, 'face', 'eyebrow')} value={p.face.partials.eyebrow}>
                                {faceOptions.eyebrows.map(val => <option key={faces.paths.root + faces.paths.partials.eyebrows + val} value={faces.paths.root + faces.paths.partials.eyebrows + val}>{this.trimFacePartialName(val)}</option>)}
                            </select>
                        </div>

                        <div className="col-xs-6 form-group">
                            <label>Eye</label>
                            <select className="form-control" onChange={this.handleChange.bind(this, 'face', 'eye')} value={p.face.partials.eye}>
                                {faceOptions.eyes.map(val => <option key={faces.paths.root + faces.paths.partials.eyes + val} value={faces.paths.root + faces.paths.partials.eyes + val}>{this.trimFacePartialName(val)}</option>)}
                            </select>
                        </div>

                        <div className="col-xs-6 form-group">
                            <label>Faceform</label>
                            <select className="form-control" onChange={this.handleChange.bind(this, 'face', 'faceform')} value={p.face.partials.faceform}>
                                {faceOptions.faceforms.map(val => <option key={faces.paths.root + faces.paths.partials.faceforms + val} value={faces.paths.root + faces.paths.partials.faceforms + val}>{this.trimFacePartialName(val)}</option>)}
                            </select>
                        </div>


                        <div className="col-xs-6 form-group">
                            <label>Haircut</label>
                            <select className="form-control" onChange={this.handleChange.bind(this, 'face', 'haircut')} value={p.face.partials.haircut}>
                                {faceOptions.haircuts.map(val => <option key={faces.paths.root + faces.paths.partials.haircuts + val} value={faces.paths.root + faces.paths.partials.haircuts + val}>{this.trimFacePartialName(val)}</option>)}
                            </select>
                        </div>

                        <div className="col-xs-6 form-group">
                            <label>Mouth</label>
                            <select className="form-control" onChange={this.handleChange.bind(this, 'face', 'mouth')} value={p.face.partials.mouth}>
                                {faceOptions.mouths.map(val => <option key={faces.paths.root + faces.paths.partials.mouths + val} value={faces.paths.root + faces.paths.partials.mouths + val}>{this.trimFacePartialName(val)}</option>)}
                            </select>
                        </div>

                        <div className="col-xs-6 form-group">
                            <label>Nose</label>
                            <select className="form-control" onChange={this.handleChange.bind(this, 'face', 'nose')} value={p.face.partials.nose}>
                                {faceOptions.noses.map(val => <option key={faces.paths.root + faces.paths.partials.noses + val} value={faces.paths.root + faces.paths.partials.noses + val}>{this.trimFacePartialName(val)}</option>)}
                            </select>
                        </div>

                        <div className="col-xs-6 form-group">
                            <label>Glasses</label>
                            <select className="form-control" onChange={this.handleChange.bind(this, 'face', 'glasses')} value={p.face.partials.glasses}>
                                {faceOptions.glasses.map(val => <option key={faces.paths.root + faces.paths.partials.glasses + val} value={faces.paths.root + faces.paths.partials.glasses + val}>{this.trimFacePartialName(val)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>;
        } else {
            pictureDiv = <div className="form-group">
                <label>Image URL</label>
                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'imgURL')} value={p.imgURL} />
                <span className="help-block">Your image must be hosted externally. If you need to upload an image, try using <a href="http://imgur.com/">imgur</a>. For ideal display, crop your image so it has a 2:3 aspect ratio (such as 100px wide and 150px tall).</span>
            </div>;
        }

        return <div>
            <h1>{title} <NewWindowLink /></h1>

            <p>Here, you can {originalTid === undefined ? 'create a custom player with' : 'edit a player to have'} whatever attributes and ratings you want. If you want to make a whole league of custom players, you should probably create a <a href="https://basketball-gm.com/manual/customization/">custom League File</a>.</p>

            <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col-md-7">
                        <h2>Attributes</h2>

                        <div className="row">
                            <div className="col-sm-3 form-group">
                                <label>First Name</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'firstName')} value={p.firstName} />
                            </div>
                            <div className="col-sm-3 form-group">
                                <label>User ID</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'userID')} value={p.userID} />
                            </div>										
                            <div className="col-sm-3 form-group">
                                <label>Last Name</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'lastName')} value={p.lastName} />
                            </div>			
                            <div className="col-sm-3 form-group">
                                <label>Age</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'age')} value={p.age} />
                            </div>
                            <div className="col-sm-3 form-group">
                                <label>Team</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'root', 'tid')} value={p.tid}>
                                    {teams.map(t => {
                                        return <option key={t.tid} value={t.tid}>{t.text}</option>;
                                    })}
                                </select>
                            </div>
                            <div className="col-sm-3 form-group">
                                <label>Position</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'rating', 'pos')} value={p.ratings[r].pos}>
                                    {positions.map(pos => {
                                        return <option key={pos} value={pos}>{pos}</option>;
                                    })}
                                </select>
                            </div>
                            <div className="col-sm-3 form-group">
                                <label>Region</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'born', 'loc')} value={p.born.loc}>
                                    {region.map(loc => {
                                        return <option key={loc} value={loc}>{loc}</option>;
                                    })}
                                </select>
                            </div>							
                            <div className="col-sm-3 form-group">
                                <label>Country</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'born', 'country')} value={p.born.country}>
                                    {country.map(country => {
                                        return <option key={country} value={country}>{country}</option>;
                                    })}
                                </select>
                            </div>									
	
	                        <div className="col-sm-3 form-group">
                                <label>Language 1</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'root','language1')} value={p.language1}>
                                    {languagesFirst.map(language1 => {
                                        return <option key={language1} value={language1}>{language1}</option>;
                                    })}
                                </select>
                            </div>	

	                        <div className="col-sm-3 form-group">
                                <label>Language 2</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'root','language2')} value={p.language2}>
                                    {languagesRest.map(language2 => {
                                        return <option key={language2} value={language2}>{language2}</option>;
                                    })}
                                </select>
                            </div>	

	                        <div className="col-sm-3 form-group">
                                <label>Language 3</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'root','language3')} value={p.language3}>
                                    {languagesRest.map(language3 => {
                                        return <option key={language3} value={language3}>{language3}</option>;
                                    })}
                                </select>
                            </div>	
							

	                        <div className="col-sm-3 form-group">
                                <label>Language 4</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'root','language4')} value={p.language4}>
                                    {languagesRest.map(language4 => {
                                        return <option key={language4} value={language4}>{language4}</option>;
                                    })}
                                </select>
                            </div>	


                            <div className="col-sm-6 form-group">
                                <label>Contract Amount</label>
                                <div className="input-group">
                                    <span className="input-group-addon">$</span>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'contract', 'amount')} value={p.contract.amount} />
                                    <span className="input-group-addon">K per year</span>
                                </div>
                            </div>
                            <div className="col-sm-6 form-group">
                                <label>Contract Expiration</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'contract', 'exp')} value={p.contract.exp} />
                            </div>
							
							
                            <div className="col-sm-6 form-group">
                                <label>Year of Death (blank for alive)</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'diedYear')} value={p.diedYear} />
                            </div>
 						
							
                        </div>

                        <h2>Appearance</h2>

                        <div className="form-group">
                            <label>You can either create a cartoon face or specify the URL to an image.</label>
                            <select className="form-control" onChange={this.handleChangeAppearanceOption} style={{maxWidth: '150px'}} value={appearanceOption}>
                                <option value="Cartoon Face">Cartoon Face</option>
                                <option value="Image URL">Image URL</option>
                            </select>
                        </div>

                        {pictureDiv}
                    </div>

                    <div className="clearfix visible-sm visible-xs" />

                    <div className="col-md-5">
                        <h2>Ratings</h2>

                        <div className="form-group">
                            <label>You can either adjust ratings indvidually or just adjust the overall rating (OVR)</label>
                            <select className="form-control" onChange={this.handleChangeOVROption} style={{maxWidth: '150px'}} value={ovrOption}>
                                <option value="ratings">Individual Ratings</option>
                                <option value="OVR">OVR</option>
                            </select>
                        </div>		
                        <p>All ratings are on a scale of 0 to 100.</p>

                        <div className="row">
                            <div className="col-xs-4">
                                <div className="form-group">
                                    <label>Potential</label>
                                    <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'rating', 'pot')}value={p.ratings[r].pot} />
                                </div>
                            </div>
                            <div className="col-xs-8" />
                        </div>
                       				
                         {ovrDiv} 
                    </div>
                </div>

                <br />
                <center>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                        {title}
                    </button>
                </center>
            </form>
        </div>;
    }
}

CustomizePlayer.propTypes = {
    ovrOption: React.PropTypes.oneOf([
        'ratings',
        'OVR',
    ]),	
    appearanceOption: React.PropTypes.oneOf([
        'Cartoon Face',
        'Image URL',
    ]),
    godMode: React.PropTypes.bool.isRequired,
    originalTid: React.PropTypes.number,
    p: React.PropTypes.object,
    season: React.PropTypes.number,
    teams: React.PropTypes.arrayOf(React.PropTypes.shape({
        text: React.PropTypes.string.isRequired,
        tid: React.PropTypes.number.isRequired,
    })),
};

export default CustomizePlayer;
