import classNames from 'classnames';
import React from 'react';
import AutoAffix from 'react-overlays/lib/AutoAffix';
import {g, helpers} from '../../common';
import {setTitle} from '../util';
import {PlayerNameLabels} from '../components';

class PlayerRow extends React.Component {
    shouldComponentUpdate(nextProps) {
        return this.prevInGame || nextProps.p.inGame;
    }

    render() {
        const {i, p} = this.props;

        // Needed for shouldComponentUpdate because state is mutated so we need to explicitly store the last value
        this.prevInGame = p.inGame;

        const classes = classNames({
            separator: i === 4,
            warning: p.inGame,
        });
        return <tr className={classes}>
			<td>
				<PlayerNameLabels
					injury={p.injury}
					pid={p.pid}			
					skills={p.skills}
				>{p.userID}</PlayerNameLabels>
			</td>
			<td>{p.pos}</td>
			<td>{p.champPicked}</td>	
			<td>{p.min.toFixed(1)}</td>
			<td>{p.fg}-{p.fga}-{p.fgp}</td>
			<td>{p.fgAtRim}-{p.fgaAtRim}-{p.fgpAtRim}</td>
			<td>{p.tp}</td>
			<td>{p.ft}</td>
			<td>{p.orb}-{p.pf}</td>
			<td>{p.fgLowPost}-{p.fgaLowPost}</td>
			<td>{p.fgMidRange}-{p.oppJM}</td>
			<td>{p.trb.toFixed(1)}</td>	
        </tr>;
    }
}

PlayerRow.propTypes = {
    i: React.PropTypes.number.isRequired,
    p: React.PropTypes.object.isRequired,
};

const BoxScore = ({boxScore}) => <div>
    <center>
        <h2><a href={helpers.leagueUrl(['roster', boxScore.teams[0].abbrev, boxScore.season])}>{boxScore.teams[0].region} </a> {boxScore.teams[0].pf}, <a href={helpers.leagueUrl(['roster', boxScore.teams[1].abbrev, boxScore.season])}>{boxScore.teams[1].region} </a> {boxScore.teams[1].pf} {boxScore.overtime}</h2>
        <table className="table table-bordered" style={{marginTop: '0.5em', width: 'auto'}}>
			<thead><tr><th></th><th title="Outer Turrets">OT</th><th title="Inner Turrets" >IT</th><th title="Inhibitor Turrets" >HT</th><th title="Inhibitors">I</th><th title="Nexus Turrets">NT</th><th title="Nexus">N</th><th title="Dragons">D</th><th title="Barons">B</th><th>K-D-A</th><th>G(k)</th></tr></thead>								
		
            <tbody>
			   {boxScore.teams.map(t => <tr key={t.abbrev}>
					<th><a href={helpers.leagueUrl(['roster', t.abbrev, boxScore.season])}>{t.abbrev}</a></th>
					{t.ptsQtrs.map((pts, i) => <td key={i}>{pts}</td>)}
					<td>{t.fg}-{t.fga}-{t.fgp}</td>
					<td>{t.trb.toFixed(1)}</td>											
				</tr>)}				
            </tbody>
        </table>
        {boxScore.gameOver ? 'Final' : <span>{boxScore.time}</span>}
    </center>
	
	
	<br />
	<center>			
	<table>
		<tbody>

			<table className="table table-striped table-bordered table-condensed table-hover box-score-team">
			<tr> <td> </td> <td> {boxScore.teams[0].abbrev} Bans </td>  <td  >{boxScore.teams[1].abbrev} Bans  </td>  </tr>
			<tr><td> First  </td> <td> {boxScore.teams[0].ban[0].ban} </td>  <td> {boxScore.teams[1].ban[0].ban} </td>  </tr>
			<tr><td> Second  </td> <td> {boxScore.teams[0].ban[1].ban} </td>  <td> {boxScore.teams[1].ban[1].ban} </td>  </tr>
			<tr><td> Third  </td> <td> {boxScore.teams[0].ban[2].ban} </td>  <td> {boxScore.teams[1].ban[2].ban} </td>  </tr>
			<tr><td> Fourth  </td> <td> {boxScore.teams[0].ban[3].ban} </td>  <td> {boxScore.teams[1].ban[3].ban} </td>  </tr>
			<tr><td> Fifth  </td> <td> {boxScore.teams[0].ban[4].ban} </td>  <td> {boxScore.teams[1].ban[4].ban} </td>  </tr>

			</table>					

		</tbody>
	</table>	

	</center>	
	
    {boxScore.teams.map(t => <div key={t.abbrev}>
        <h3><a href={helpers.leagueUrl(['roster', t.abbrev, boxScore.season])}>{t.region} </a></h3>
        <div className="table-responsive">
            <table className="table table-striped table-bordered table-condensed box-score-team">
                <thead>
							<tr><th>UserID</th><th>Role</th><th>Champion</th><th>Min</th><th>K-D-A</th><th>KDA 10</th><th>CS</th><th>CS 20</th><th>Twr-Ln</th><th>Inh-Ln</th><th>Jngl-Rvr</th><th>Gld(k)</th></tr>
                </thead>
                <tbody>
                    {t.players.map((p, i) => <PlayerRow key={p.pid} i={i} p={p} />)}
                </tbody>
                <tfoot>
                    <tr>
						<td>Total</td>								
						<td />								
						<td />																
						<td />		
						<td>{t.fg}-{t.fga}-{t.fgp}</td>
						<td>{t.fgAtRim}-{t.fgaAtRim}-{t.fgpAtRim}</td>
						<td>{t.tp}</td>
						<td>{t.ft}</td>
						<td>{t.orb}-{t.pf}</td>
						<td>{t.fgLowPost}-{t.fgaLowPost}</td>
						<td>{t.fgMidRange}-{t.oppJM}</td>
						<td>{t.trb.toFixed(1)}</td>	
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>)}
    <br />
      <br />
      <br />	
    <p>Viewers: {helpers.numberWithCommas(boxScore.att)}</p>
      <br />		
      <p>Definitions: 
	  <br />	  
	  Twr: Number of towers destroyed by player
	  <br />
	  Inh: Number of inhibitors destroyed by player
	  <br />
	  Ln: Number of towers/inhibitors destroyed in a player's lane
	  <br />
	  Jgnl: Number of jungle monsters killed by player
	  <br />
	  Rvr: Number of jungle monsters killed by player on opponents side (across the river)
	  <br />
	  OT: Outer Towers
	  <br />
	  IT: Inner Towers
	  <br />
	  HT: Inhibitor Towers
	  <br />
	  </p>		
</div>;

BoxScore.propTypes = {
    boxScore: React.PropTypes.object.isRequired,
};

class LiveGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boxScore: props.initialBoxScore ? props.initialBoxScore : {},
            speed: 5,
            started: !!props.events,
        };
        if (props.events) {
            this.startLiveGame(props.events.slice());
        }

        this.handleSpeedChange = this.handleSpeedChange.bind(this);
        this.setPlayByPlayDivHeight = this.setPlayByPlayDivHeight.bind(this);
    }

    componentDidMount() {
        this.componentIsMounted = true;

        // Keep height of plays list equal to window
        this.setPlayByPlayDivHeight();
        window.addEventListener("resize", this.setPlayByPlayDivHeight);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.events && !this.state.started) {
            this.setState({
                boxScore: nextProps.initialBoxScore,
                started: true,
            }, () => {
                this.startLiveGame(nextProps.events.slice());
            });
        }
    }

    componentWillUnmount() {
        this.componentIsMounted = false;

        window.removeEventListener("resize", this.setPlayByPlayDivHeight);
    }

    setPlayByPlayDivHeight() {
        this.playByPlayDiv.style.height = `${window.innerHeight - 104}px`;
    }

     startLiveGame(events) {
        let overtimes = 0;

        const processToNextPause = () => {
            if (!this.componentIsMounted) {
                return;
            }

            const boxScore = this.state.boxScore; // This means we're mutating state, which is a little faster, but bad

            let stop = false;
            let text = null;
			let text2 = "";
            while (!stop && events.length > 0) {
                const e = events.shift();

                if (e.type === "text") {
                    if (e.t === 0 || e.t === 1) {
                        text = `${e.time} - ${boxScore.teams[e.t].abbrev} - ${e.text}`;
                    } else {
                        text = e.text;
                    }

   // Show score after scoring plays
                    if (text.includes('made')) {
                        text += ` (${boxScore.teams[0].pts}-${boxScore.teams[1].pts})`;
                    }

					if (text.indexOf(" Tower") >= 0) {
						if (e.t===0) {
							//text += "<b> Tower (" + (boxScore.teams()[0].pf()+1) + "-" + boxScore.teams()[1].pf() + ") </b>";
							text2 += ` (Towers ${boxScore.teams[0].pf+1}-${boxScore.teams[1].pf})`;
						} else {
//							text += "<b> Tower (" + boxScore.teams()[0].pf() + "-" + (boxScore.teams()[1].pf()+1) + ") </b>";
							text2 += ` (Towers ${boxScore.teams[0].pf}-${boxScore.teams[1].pf+1})`;
							
						}
					} else  if (text.indexOf("the Rift") >= 0) {
						if (e.t===0) {
							text2 += ` (Rift Herald ${boxScore.teams[0].drb+1}-${boxScore.teams[1].drb})`;
						//	text += "<b> Dragon (" + (boxScore.teams()[0].drb()+1) + "-" + boxScore.teams()[1].drb() + ") </b>";
						} else {
							text2 += ` (Rift Herald ${boxScore.teams[0].drb}-${boxScore.teams[1].drb+1})`;
						//	text += "<b> Dragon (" + boxScore.teams()[0].drb() + "-" + (boxScore.teams()[1].drb()+1) + ") </b>";
						}
													
					} else  if (text.indexOf("the Dragon") >= 0) {
						if (e.t===0) {
							text2 += ` (Dragons ${boxScore.teams[0].drb+1}-${boxScore.teams[1].drb})`;
						//	text += "<b> Dragon (" + (boxScore.teams()[0].drb()+1) + "-" + boxScore.teams()[1].drb() + ") </b>";
						} else {
							text2 += ` (Dragons ${boxScore.teams[0].drb}-${boxScore.teams[1].drb+1})`;
						//	text += "<b> Dragon (" + boxScore.teams()[0].drb() + "-" + (boxScore.teams()[1].drb()+1) + ") </b>";
						}
												
					} else  if (text.indexOf("the Baron") >= 0) {
							if (e.t===0) {
								text2 += ` (Barons ${boxScore.teams[0].tov+1}-${boxScore.teams[1].tov})`;
								
							} else {
								text2 += ` (Barons ${boxScore.teams[0].tov}-${boxScore.teams[1].tov+1})`;								
							}												
					} else  if (text.indexOf("the Roshan") >= 0) {
							if (e.t===0) {
								text2 += ` (Roshans ${boxScore.teams[0].tov+1}-${boxScore.teams[1].tov})`;
								
							} else {
								text2 += ` (Roshans ${boxScore.teams[0].tov}-${boxScore.teams[1].tov+1})`;								
							}												
					} else  if ((text.indexOf("killing") >= 0) || (text.indexOf("killed") >= 0)) {
						if (e.t===0) {
							text2 += ` (Kills ${boxScore.teams[0].fg+1}-${boxScore.teams[1].fg})`;
							//text += "<b> Kills (" + (boxScore.teams()[0].fg()+1) + "-" + boxScore.teams()[1].fg() + ") </b>";
						} else {
							text2 += ` (Kills ${boxScore.teams[0].fg}-${boxScore.teams[1].fg+1})`;
						//	text += "<b> Kills (" + boxScore.teams()[0].fg() + "-" + (boxScore.teams()[1].fg()+1) + ") </b>";
						}
												
												
					} 	
					
				
					if ((text.indexOf("destroyed the Nexus")   >= 0 )|| (text.indexOf("destroyed the Ancient")  >= 0)) {
							text2 += `. ${boxScore.teams[e.t].name} has won the game.`;
//						text += ".<b>  " + boxScore.teams()[e.t].name()+" has won the game. </b>";
					}
				
					///////////////////////////////
				   if (text.indexOf("Outer Tower") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
						 ptsQtrs[0] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					}						
	
	
				  if (text.indexOf("Dragon") >= 0) {
					if (text.indexOf("killed") >= 0) {					  
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
				//		 console.log("e.amt: "+e.amt);
						 ptsQtrs[6] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					}	
						 
				   }	
				  if (text.indexOf("Rift") >= 0) {
					if (text.indexOf("killed") >= 0) {					  
					//	 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
				//		 console.log("e.amt: "+e.amt);
					//	 ptsQtrs[6] += 1;
					//	 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					}	
						 
				   }					   
					
					if (text.indexOf("Baron") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
				//		 console.log("e.amt: "+e.amt);
						 ptsQtrs[7] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					}	
					if (text.indexOf("Roshan") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
				//		 console.log("e.amt: "+e.amt);
						 ptsQtrs[7] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					}						
				   if (text.indexOf("Inner Tower") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[1] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					}	
					
					if (text.indexOf("Inhibitor Tower") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[2] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					} else if (text.indexOf("Inhibitor") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[3] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
							if (e.t===0) {
								text2 += ` (Inhibitors ${boxScore.teams[0].fgaLowPost+1}-${boxScore.teams[1].fgaLowPost})`;
							} else {
								text2 += ` (Inhibitors ${boxScore.teams[0].fgaLowPost}-${boxScore.teams[1].fgaLowPost+1})`;
							}							 
					}
					if (text.indexOf("Barracks Tower") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[2] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					} else if (text.indexOf("Barracks") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[3] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
							if (e.t===0) {
								text2 += ` (Barracks ${boxScore.teams[0].fgaLowPost+1}-${boxScore.teams[1].fgaLowPost})`;
							} else {
								text2 += ` (Barracks ${boxScore.teams[0].fgaLowPost}-${boxScore.teams[1].fgaLowPost+1})`;
							}							 
					}					
					
				    if (text.indexOf("Nexus Tower") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[4] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					} else if (text.indexOf("Nexus") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[5] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					}	
				    if (text.indexOf("Ancient Tower") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[4] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					} else if (text.indexOf("Ancient") >= 0) {
						 let ptsQtrs = boxScore.teams[e.t].ptsQtrs;
					//	 console.log("e.amt: "+e.amt);
						 ptsQtrs[5] += 1;
						 boxScore.teams[e.t].ptsQtrs = ptsQtrs;
					}						

	                		
// bug below that stop of last champ selections							
					if (text.indexOf("picked") >= 0) {
						var fullText = e.text;
						var n = fullText.split(" ");
						var t, l;

						for (l = 0; l < 5; l++) {		
							for (t = 0; t < 2; t++) {		
								 
								if  (boxScore.teams[t].players[l].userID == n[n.length - 3]) {
									boxScore.teams[t].players[l].champPicked = n[n.length - 1];
						//	    console.log(t+" "+l+" "+boxScore.teams()[t].players()[l]["userID"]()+" "+ n[n.length - 3]+" "+ boxScore.teams()[t].players()[l]["champPicked"]());									
									t = 2;
									l = 5;
								}
							}
						}						

					
					}			
	
////////////////////					
					
					
                    boxScore.time = e.time;

                    stop = true;
                } else if (e.type === "sub") {
                    for (let i = 0; i < boxScore.teams[e.t].players.length; i++) {
                        if (boxScore.teams[e.t].players[i].pid === e.on) {
                            boxScore.teams[e.t].players[i].inGame = true;
                        } else if (boxScore.teams[e.t].players[i].pid === e.off) {
                            boxScore.teams[e.t].players[i].inGame = false;
                        }
                    }
                } else if (e.type === "stat") {
                    // Quarter-by-quarter score
                /*    if (e.s === "pts") {
                        // This is a hack because array elements are not made observable by default in the Knockout mapping plugin and I didn't want to write a really ugly mapping function.
                        const ptsQtrs = boxScore.teams[e.t].ptsQtrs;
                        if (ptsQtrs.length <= e.qtr) {
                            // Must be overtime! This updates ptsQtrs too.
                            boxScore.teams[0].ptsQtrs.push(0);
                            boxScore.teams[1].ptsQtrs.push(0);

                            if (ptsQtrs.length > 4) {
                                overtimes += 1;
                                if (overtimes === 1) {
                                    boxScore.overtime = " (OT)";
                                } else if (overtimes > 1) {
                                    boxScore.overtime = ` (${overtimes}OT)`;
                                }
                                boxScore.quarter = `${helpers.ordinal(overtimes)} overtime`;
                            } else {
                                boxScore.quarter = `${helpers.ordinal(ptsQtrs.length)} quarter`;
                            }
                        }
                        ptsQtrs[e.qtr] += e.amt;
                        boxScore.teams[e.t].ptsQtrs = ptsQtrs;
                    }*/

					
					////////////////////////////////  ABOVE WORKS, remove (), add = instead of (dskjs), want to remove 0 from champion field
					// Everything else
					if (e.s === "drb") {
//                            boxScore.teams()[e.t].players()[e.p][e.s](boxScore.teams()[e.t].players()[e.p][e.s] + e.amt);
//                           boxScore.teams()[e.t][e.s](boxScore.teams()[e.t][e.s] + e.amt);
						boxScore.teams[e.t].players[e.p][e.s] = boxScore.teams[e.t].players[e.p][e.s] + e.amt;
						boxScore.teams[e.t][e.s] = boxScore.teams[e.t][e.s] + e.amt;
					} else if (e.s === "orb") {
				//        boxScore.teams()[e.t].players()[e.p].trb(boxScore.teams()[e.t].players()[e.p].trb() + e.amt);
				 //       boxScore.teams()[e.t].trb(boxScore.teams()[e.t].trb() + e.amt);
						boxScore.teams[e.t].players[e.p][e.s] = boxScore.teams[e.t].players[e.p][e.s] + e.amt;
						boxScore.teams[e.t][e.s] = boxScore.teams[e.t][e.s] + e.amt;
//                        } else if (e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" || e.s === "pts") {
					} else if (e.s === "ban") {
				//        boxScore.teams()[e.t].players()[e.p].trb(boxScore.teams()[e.t].players()[e.p].trb() + e.amt);
				 //       boxScore.teams()[e.t].trb(boxScore.teams()[e.t].trb() + e.amt);
				 
						boxScore.teams[e.t].ban[e.p][e.s] = e.amt;
//						boxScore.teams[e.t].ban[e.p] = e.amt;
					//	boxScore.teams[e.t][e.s][e.p] = e.amt;
				 
					} else if (e.s === "champPicked") {
				//        boxScore.teams()[e.t].players()[e.p].trb(boxScore.teams()[e.t].players()[e.p].trb() + e.amt);
				 //       boxScore.teams()[e.t].trb(boxScore.teams()[e.t].trb() + e.amt);

						boxScore.teams[e.t].players[e.p][e.s] = e.amt;
						//boxScore.teams()[e.t].players()[e.p][e.s](boxScore.teams()[e.t].players()[e.p][e.s]() + e.amt);
//                        } else if (e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" || e.s === "pts") {
					} else if (e.s ===  "fgaAtRim" || e.s ===  "fgAtRim" || e.s ===  "fgpAtRim" || e.s === "fgp" || e.s === "min" || e.s === "trb" ||e.s === "oppJM" || e.s === "fgaLowPost" || e.s === "fgLowPost" || e.s === "fgaMidRange" || e.s === "fgMidRange" || e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "pf" ) {
			//		console.log(e.s);
						boxScore.teams[e.t].players[e.p][e.s] = boxScore.teams[e.t].players[e.p][e.s] + e.amt;
						boxScore.teams[e.t][e.s] = boxScore.teams[e.t][e.s] + e.amt;
					}
					       
                }
            }			
////////////////////////////// BELOW WORKS			
					
                    // Everything else
             /*       if (e.s === "drb") {
                        boxScore.teams[e.t].players[e.p].trb += e.amt;
                        boxScore.teams[e.t].trb += e.amt;
                    } else if (e.s === "orb") {
                        boxScore.teams[e.t].players[e.p].trb += e.amt;
                        boxScore.teams[e.t].trb += e.amt;
                        boxScore.teams[e.t].players[e.p][e.s] += e.amt;
                        boxScore.teams[e.t][e.s] += e.amt;
                    } else if (e.s === "min" || e.s === "fg" || e.s === "fga" || e.s === "tp" || e.s === "tpa" || e.s === "ft" || e.s === "fta" || e.s === "ast" || e.s === "tov" || e.s === "stl" || e.s === "blk" || e.s === "ba" || e.s === "pf" || e.s === "pts") {
                        boxScore.teams[e.t].players[e.p][e.s] += e.amt;
                        boxScore.teams[e.t][e.s] += e.amt;

                        if (e.s === "pts") {
                            for (let j = 0; j < 2; j++) {
                                for (let k = 0; k < boxScore.teams[j].players.length; k++) {
                                    if (boxScore.teams[j].players[k].inGame) {
                                        boxScore.teams[j].players[k].pm += (e.t === j ? e.amt : -e.amt);
                                    }
                                }
                            }
                        }
                    }
                }
            }*/

            if (text !== null) {
		
			var p = document.createElement("p");
			var t = document.createTextNode(text);
			var t2 = document.createTextNode(text2);
			var b = document.createElement("b");
 
			b.setAttribute('style', 'color: white');   
			b.appendChild(t2);     
			p.appendChild(t);
			p.appendChild(b);


                this.playByPlayDiv.insertBefore(p, this.playByPlayDiv.firstChild);
            }

            if (events.length > 0) {
                setTimeout(processToNextPause, 4000 / (1.2 ** this.state.speed));
            } else {
                boxScore.time = '0:00';
                boxScore.gameOver = true;
            }

            this.setState({
                boxScore,
            });
        };

        processToNextPause();
    }

    handleSpeedChange(e) {
        this.setState({speed: e.target.value});
    }

    render() {
        setTitle('Live Game Simulation');

        return <div>
            <h1>Live Game Simulation</h1>

            <p className="text-danger">If you navigate away from this page, you won't be able to see these play-by-play results again because they are not stored anywhere. The results of this game are already final, though.</p>
            <div className="row">
                <div className="col-md-9">
                    {this.state.boxScore.gid >= 0 ? <BoxScore boxScore={this.state.boxScore} /> : <h1>Loading...</h1>}
                </div>
                <div className="col-md-3">
                    <AutoAffix viewportOffsetTop={60} container={this}>
                        <div>
                            <form>
                                <label htmlFor="playByPlaySpeed">Play-By-Play Speed:</label>
                                <input type="range" id="playByPlaySpeed" min="1" max="33" step="1" style={{width: '100%'}} value={this.state.speed} onChange={this.handleSpeedChange} />
                            </form>
                            <div
                                ref={c => {
                                    this.playByPlayDiv = c;
                                }}
                                style={{height: '100%', overflow: 'auto'}}
                            />
                        </div>
                    </AutoAffix>
                </div>
            </div>
        </div>;
    }
}
LiveGame.propTypes = {
    events: React.PropTypes.arrayOf(React.PropTypes.shape({
        type: React.PropTypes.string.isRequried,
    })),
    initialBoxScore: React.PropTypes.object,
};
export default LiveGame;
