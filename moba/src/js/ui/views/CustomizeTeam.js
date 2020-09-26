/* eslint react/jsx-no-bind: "off" */

import faces from '../../vendor/faces';
import React from 'react';
//import {player} from '../core';
import {PHASE, g, helpers} from '../../common';
import {realtimeUpdate, setTitle, toWorker} from '../util';
import {HelpPopover, NewWindowLink, PlayerPicture} from '../components';

const positions = ["TOP", "JGL", "MID", "ADC", "SUP"];
const country = ["United States","Korea","China", "Taiwan", "Canada","Dominican Republic","Mexico","Austria","Armenia", "Belgium", "Bulgaria","Czech Republic", "Denmark", "England", "Estonia", "France","Finland","Germany", "Greece", "Hungary","Iceland","Ireland","Italy","Netherlands", "Norway","Portugal", "Poland", "Romania", "Scotland", "Spain", "Sweden","Switzerland","Latvia","Slovakia", "Russia","Ukraine", "Brazil", "Japan", "Australia","New Zealand", "Colombia", "Costa Rica", "Ecuador", "Panama", "Peru", "Puerto Rico", "Venezuela", "Argentina", "Chile", "Paraguay", "Uruguay","Israel","Turkey","Iraq","United Arab Emirates","South Africa","Indonesia","Malaysia","Philippines","Singapore", "Thailand","Vietnam"];
const region = ["NA","EU","KR", "CN","TW","BR","CIS","JP","LatAm","OCE", "SEA","TR"];
const languagesFirst = ["English","Korean","Chinese","Spanish","German","French","Italian","Romanian","Greek","Armenian","Bulgarian","Dutch","Polish", "Danish","Finnish","Swedish","Hungarian","Norwegian","Icelandic","Russian","Czech","Portuguese","Filipino","Indonesian","Japanese","Malay","Thai","Vietnamese","Turkish"];
const languagesRest = ["","English","Korean","Chinese","Spanish","German","French","Italian","Romanian","Greek","Armenian","Bulgarian","Dutch","Polish", "Danish","Finnish","Swedish","Hungarian","Norwegian","Icelandic","Russian","Czech","Portuguese","Filipino","Indonesian","Japanese","Malay","Thai","Vietnamese","Turkish"];

const faceOptions = faces.partialFileNames;

const copyValidValues = (source, target, season) => {
//    for (const attr of ['hgt', 'tid', 'weight']) {
  //      const val = parseInt(source[attr], 10);
    //    if (!isNaN(val)) {
      //      target[attr] = val;
        //}
    //}

    target.region = source.region;
    target.name = source.name;
    target.abbrev = source.abbrev;
    //target.tid = source.tid;
   // target.did = source.did;
   // target.cid = source.cid;
    target.country = source.country;
    target.countrySpecific = source.countrySpecific;
    target.imgURL = source.imgURL;

	
    //target.firstName = source.firstName;
    //target.userID = source.userID;	
    //target.lastName = source.lastName;
    //target.imgURL = source.imgURL;

  //  {
		
        let valtid = parseInt(source.tid,10);
		if (!isNaN(valtid)) {
			target.tid = valtid;
		}		
        let valcid = parseInt(source.cid,10);
		if (!isNaN(valcid)) {
			target.cid = valcid;
		}		
        let valdid = parseInt(source.did,10);
		if (!isNaN(valdid)) {
			target.did = valdid;
		}				
      //  const age = parseInt(source.age, 10);
   //     if (!isNaN(age)) {
        //    target.born.year = g.season - age;
  //      }
   // }

 //   target.born.loc = source.born.loc;
	
 //   target.born.country = source.born.country;	

///    target.languages = source.languages;	
//    target.languages[0] = source.languages[0];	
	{
	/*	const r = source.ratings.length - 1;

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
		
	//	target.ratings[r].region = source.region;*/			
		//}

	}
	
	
   // target.college = source.college;

    {
    //    const diedYear = parseInt(source.diedYear, 10);
      ///  if (!isNaN(diedYear)) {
     //       target.diedYear = diedYear;
//} else {
       //     target.diedYear = null;
     //   }
    }

	
	// this doesn't work? what does? need to keep testing. it prevents it from saving
  //  {
    //    const language1 = source.languages[0];
      //  target.language[0] = language1;
    //}	
	
    {
        // Allow any value, even above or below normal limits, but round to $10k and convert from M to k
    //    let amount = Math.round(100 * parseFloat(source.contract.amount)) * 10;
//        if (isNaN(amount)) {
   //         amount = g.minContract;
  //      }
    //    target.contract.amount = amount;
    }

    {
      //  let exp = parseInt(source.contract.exp, 10);
     //   if (!isNaN(exp)) {
            // No contracts expiring in the past
      //      if (exp < season) {
      //          exp = season;
      //      }

            // If current season contracts already expired, then current season can't be allowed for new contract
        //    if (exp === season && g.phase >= g.PHASE.RESIGN_PLAYERS) {
        //        exp += 1;
        //    }
//
         //   target.contract.exp = exp;
       // }
    }

    {
        //let gamesRemaining = parseInt(source.injury.gamesRemaining, 10);
     //   if (isNaN(gamesRemaining) || gamesRemaining < 0) {
       //     gamesRemaining = 0;
    //    }
       // target.injury.gamesRemaining = gamesRemaining;
    }

   // target.injury.type = source.injury.type;

    {
     //   const r = source.ratings.length - 1;
     //   for (const rating of Object.keys(source.ratings[r])) {
            //if (rating === 'languages') {
//				target.ratings[r].languages[0] = source.ratings[r].languages[0];
//			} else if (rating === 'pos') {
		//	if (rating === 'pos') {
				//if (target.ratings[r].pos  == source.ratings[r].pos) {
					//target.ratings[r].MMR = 10000;
				//} 
           //     target.ratings[r].pos = source.ratings[r].pos;
				
        //    } else if (['blk', 'dnk', 'drb', 'endu', 'fg', 'ft', 'hgt', 'ins', 'jmp', 'pot', 'pss', 'reb', 'spd', 'stl', 'stre', 'tp'].includes(rating)) {
            //   const val = helpers.bound(parseInt(source.ratings[r][rating], 10), 0, 100);
             ///   if (!isNaN(val)) {
             //       target.ratings[r][rating] = val;
             //   }
		
				
        //    }
      //  }
    }

    // These are already normalized, cause they are selects
   // for (const attr of ['ear', 'eyebrow', 'eye', 'faceform', 'haircut', 'mouth', 'nose', 'glasses']) {
    //    target.face.partials[attr] = source.face.partials[attr];
   // }

  //  target.face.colors.skinColor = source.face.colors.skinColor;
  //  target.face.colors.hairColor = source.face.colors.hairColor;
};

class CustomizePlayer extends React.Component {
    constructor(props) {
        super(props);
console.log(this.props)		
        const t = helpers.deepCopy(props.t);

      //  const p = helpers.deepCopy(props.p);
     /*   if (p !== undefined) {
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
        }*/
        this.state = {
          //  appearanceOption: props.appearanceOption,
            saving: false,
      //      p,
            t,			
        };
     //   this.handleChangeAppearanceOption = this.handleChangeAppearanceOption.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
      //  this.randomizeFace = this.randomizeFace.bind(this);
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({
            saving: true,
        });

        const p = this.props.p;
        const pAll = this.props.pAll;		
        const t = this.props.t;		

        // Copy over values from state, if they're valid
   //     copyValidValues(this.state.p, p, this.props.season);
        copyValidValues(this.state.t, t, this.props.season);

        // Only save image URL if it's selected
        if (this.state.appearanceOption !== "Image URL") {
            t.imgURL = "";
        }
console.log(this.props)
   //     const pid = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
   console.log("got here");
//        const tid = await toWorker('upsertCustomizedTeam', t, this.props.originalTid, this.props.season);
        const tid = await toWorker('upsertCustomizedTeam', t, this.props.originalTid, this.props.season);
		
		if  (this.props.originalTid == undefined) {
			p.tid = tid;
			pAll[0].tid = tid;		
			pAll[1].tid = tid;		
			pAll[2].tid = tid;		
			pAll[3].tid = tid;		
			pAll[4].tid = tid;		
			pAll[5].tid = tid;		
			
			let tid2 = -1;
			// create team?
			//let p;
		   // const pid1 = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
			//const pid2 = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
			//const pid3 = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
			//const pid4 = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
			//const pid5 = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
			//const pid6 = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
			//const pid7 = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
			//const pid8 = await toWorker('upsertCustomizedPlayer', p, this.props.originalTid, this.props.season);
			const pid1 = await toWorker('upsertCustomizedPlayer', pAll[0], tid2, this.props.season);
			const pid2 = await toWorker('upsertCustomizedPlayer', pAll[1], tid2, this.props.season);
			const pid3 = await toWorker('upsertCustomizedPlayer', pAll[2], tid2, this.props.season);
			const pid4 = await toWorker('upsertCustomizedPlayer', pAll[3], tid2, this.props.season);
			const pid5 = await toWorker('upsertCustomizedPlayer', pAll[4], tid2, this.props.season);
			const pid6 = await toWorker('upsertCustomizedPlayer', pAll[5], tid2, this.props.season);		
			/*const pid2 = await toWorker('upsertCustomizedPlayer', p, tid2, this.props.season);
			const pid3 = await toWorker('upsertCustomizedPlayer', p, tid2, this.props.season);
			const pid4 = await toWorker('upsertCustomizedPlayer', p, tid2, this.props.season);
			const pid5 = await toWorker('upsertCustomizedPlayer', p, tid2, this.props.season);
			const pid6 = await toWorker('upsertCustomizedPlayer', p, tid2, this.props.season);
			const pid7 = await toWorker('upsertCustomizedPlayer', p, tid2, this.props.season);
			const pid8 = await toWorker('upsertCustomizedPlayer', p, tid2, this.props.season);*/
		}
    //    realtimeUpdate([], helpers.leagueUrl(["player", pid1.pid]));
//        realtimeUpdate([], helpers.leagueUrl(["player", pid1.pid]));
//        realtimeUpdate([], helpers.leagueUrl(["roster", pid1]));
        realtimeUpdate([], helpers.leagueUrl(["standings"]));
    }

    handleChange(type, field, e) {
        let val = e.target.value;
     //   const p = this.state.p;
        const t = this.state.t;		

		console.log(type+" "+field);
        if (type === 'root') {
			//if (field == "language1") {
				//p.ratings[p.ratings.length - 1].languages[0] = val;
				//p.languages[0] = val;
			//} else {
			//	p[field] = val;
				t[field] = val;
			//}
		//	if (field = "region") { // two places
			//	p.ratings[p.ratings.length - 1][field] = val;
		//}
        } else if (['born', 'contract', 'injury'].includes(type)) {
         //   p[type][field] = val;		
		//	if (field = "loc") {
		///		p.ratings[p.ratings.length - 1].region = val;
		//	}
        } else if (type === 'rating') {
			
		//	if (field == "language1") {
		//		p.ratings[p.ratings.length - 1].languages[0] = val;
		//		p.languages[0] = val;
		//	} else {				
		//		p.ratings[p.ratings.length - 1][field] = val;
		//	}
        } else if (type === 'face') {
            if (['ear', 'eyebrow', 'eye', 'faceform', 'haircut', 'mouth', 'nose', 'glasses'].includes(field)) {
                if (!val) {
                    // If empty string or undefined or null.
                    console.error("Error while submitting the player form! ", "Type: ", type, ' Field: ', field , ' Value: ', val);
                    return;
                }

           //     p[type]['partials'][field] = val;

            } else if (field === 'skinColor') {
           //     p[type]['colors'][field] = val;
            } else if (field === 'hairColor') {
           //     p[type]['colors'][field] = val;
            }
        }


        this.setState({
      //      p,
			t,
        });
	
    }

    handleChangeAppearanceOption(e) {
        this.setState({
            appearanceOption: e.target.value,
        });
    }

    randomizeFace(e) {
        e.preventDefault(); // Don't submit whole form

      //  const face = faces.generate();

     //   this.state.p.face = face;
        this.setState({
         //   p: this.state.p,
            t: this.state.t,			
        });
    }

    trimFacePartialName(optionName){
        // E.g.: a usual partial path in a player "face" property looks like "/img/svg_face_partials/eyebrows/4.svg". A usual option text for select looks like: "4". So we need to trim the "/img/svg_face_partials/" part leaving only "4.svg". Then trim the ".svg" part.
        let trimmedName = optionName.slice(optionName.lastIndexOf('/') + 1).split('.svg')[0];

        return trimmedName;
    }

    render() {
        const {godMode, originalTid, teams} = this.props;
//        const {appearanceOption, p, saving, t} = this.state;
        const {appearanceOption,  saving, t} = this.state;

        const title = originalTid === undefined ? 'Create Team' : 'Edit Team';

        setTitle(title);

        if (!godMode) {
            return <div>
                <h1>Error</h1>
                <p>You can't customize teams unless you enable <a href={helpers.leagueUrl(["god_mode"])}>God Mode</a></p>
            </div>;
        }

  //      const r = p.ratings.length - 1;

        let pictureDiv = null;

     
		pictureDiv = <div className="form-group">
			<label>Image URL</label>
			<input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'imgURL')} value={t.imgURL} />
			<span className="help-block">Your image must be hosted externally. If you need to upload an image, try using <a href="http://imgur.com/">imgur</a>. For ideal display, crop your image so it has a 2:3 aspect ratio (such as 100px wide and 150px tall).</span>
		</div>;

        return <div>
            <h1>{title} <NewWindowLink /></h1>

            <p>Here, you can {originalTid === undefined ? 'create a custom team with' : 'edit a team to have'} whatever name and division/conference you want. Be sure that each divisin/conference has enough teams for the playoffs to work. In general, you can add as many teams as you want to a division/conference, but you can't reduce the number of teams without breaking the playoffs.</p>

			<p>The JSON file format is described in <a href="http://basketball-gm.com/manual/customization/teams/">the manual</a>. As examples of how the game uses TID, DID, and CID, you can download <a href="http://zengm.com/files/LCS.json">LCS </a>,  <a href="http://zengm.com/files/LCSLadder.json" >LCS w/ Ladder </a>,  <a href="http://zengm.com/files/LCK.json">LCK </a>,  <a href="http://zengm.com/files/LPL.json" >LPL </a>,  <a href="http://zengm.com/files/LMS.json">LMS </a>, <a href="http://zengm.com/files/Worlds.json">Worlds </a> , and  <a href="http://zengm.com/files/WorldsWithLadder.json">Worlds w/ Ladder </a> team files.</p>
			
			            <p className="text-danger">{originalTid === undefined ? 'New teams need to be created during the Preseason to play games for that year.' :  'Existing teams should switch conferences during the preseason for schedules to be created correctly'}</p>

						
						
            <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col-md-7">
                        <h2>Attributes</h2>

                        <div className="row">
							
                            <div className="col-sm-3 form-group">
                                <label>Name 1</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'region')} value={t.region} />
                            </div>
                            <div className="col-sm-3 form-group">
                                <label>Name 2</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'name')} value={t.name} />
                            </div>									
                            <div className="col-sm-3 form-group">
                                <label>Abbrev</label>
                                <input type="text" className="form-control" onChange={this.handleChange.bind(this, 'root', 'abbrev')} value={t.abbrev} />
                            </div>			
                            <div className="col-sm-3 form-group">
                                <label>TID <HelpPopover placement="right" title="Team ID">Each team is given a unique ID called TID. 
                       </HelpPopover>
						</label>
                                <input type="text" className="form-control"  onChange={this.handleChange.bind(this, 'root', 'tid')} value={t.tid} />
                            </div>
                            <div className="col-sm-3 form-group">
                                <label>CID <HelpPopover placement="right" title="Conference ID">Each team is given a conference ID called CID. Changing this will change the conference of the team. 
                       </HelpPopover>								
								</label>
                                <input type="text" className="form-control"  onChange={this.handleChange.bind(this, 'root', 'cid')} value={t.cid} />
                            </div>
                            <div className="col-sm-3 form-group">
                                <label>DID <HelpPopover placement="right" title="Division ID">Each team is given a division ID called DID. Changing this will change the division of the team. If there is just
								one division in each conference then it will be the same as the CID for each team.
                       </HelpPopover>													
								</label>
                                <input type="integer" className="form-control"  onChange={this.handleChange.bind(this, 'root', 'did')} value={t.did} />
                            </div>
                            <div className="col-sm-3 form-group">
                                <label>Region</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'root', 'country')} value={t.country}>
                                    {region.map(loc => {
                                        return <option key={loc} value={loc}>{loc}</option>;
                                    })}
                                </select>
                            </div>							
                            <div className="col-sm-3 form-group">
                                <label>Country</label>
                                <select className="form-control" onChange={this.handleChange.bind(this, 'root', 'countrySpecific')} value={t.countrySpecific}>
                                    {country.map(countrySpecific => {
                                        return <option key={countrySpecific} value={countrySpecific}>{countrySpecific}</option>;
                                    })}
                                </select>
                            </div>									
								
                        </div>

                        <h2>Team Logo</h2>

                        <div className="form-group">
                            <label>You can specify the URL to an image to create logo for the team.</label>
                        </div>

                        {pictureDiv}
                    </div>

                    <div className="clearfix visible-sm visible-xs" />

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
    appearanceOption: React.PropTypes.oneOf([
        'Cartoon Face',
        'Image URL',
    ]),
    godMode: React.PropTypes.bool.isRequired,
    originalTid: React.PropTypes.number,
    p: React.PropTypes.object,
    t: React.PropTypes.object,
    season: React.PropTypes.number,
    teams: React.PropTypes.arrayOf(React.PropTypes.shape({
        text: React.PropTypes.string.isRequired,
        tid: React.PropTypes.number.isRequired,
    })),
    pAll: React.PropTypes.array,
	
};

export default CustomizePlayer;
