// @flow

import React from 'react';
import {Dropdown, JumpTo, NewWindowLink, PlayoffMatchup, PlayoffMatchupStore, PlayoffMatchupGroups} from '../components';
import {setTitle} from '../util';

const Playoffs2 = ({confNames, NAConference, EUConference, LCSConference, LCSExtended, LCKConference, LPLConference, LMSConference, WorldsPlayoff,
					 WorldsSpring,  WorldsSummer,WorldsPlayIn,WorldsGroupPlay,WorldsGroupKnockout,
		WorldsGroupFinals,naLadder,euLadder,lckLadder,lplLadder,lmsLadder,wcLadder,	
					 NAWorlds, EUWorlds,CSPromo3,CSPromo2, LadderExtended, LadderExtendedMax,finalMatchups, bothSplits,  season, series,
					 gameType,playoffsTypeSpring}: {
    confNames: string[],
	NAConference: boolean,
	EUConference: boolean,
	LCSConference: boolean,
	LCSExtended: boolean,
	LCKConference: boolean,
	LPLConference: boolean,
	LMSConference: boolean,
	WorldsPlayoff: boolean,
	WorldsSpring: boolean,
	WorldsSummer: boolean,	
	NAWorlds: boolean,
	EUWorlds: boolean,	
	CSPromo3: boolean,
	CSPromo2: boolean,	
	LadderExtendedMax: boolean,
	LadderExtendedMax: boolean,	
					WorldsPlayIn: boolean,
		WorldsGroupPlay: boolean,
		WorldsGroupKnockout: boolean,
		WorldsGroupFinals: boolean,
		naLadder: boolean,
		euLadder: boolean,
		lckLadder: boolean,
		lplLadder: boolean,
		lmsLadder: boolean,
		wcLadder: boolean,	
	
    finalMatchups: boolean,
	bothSplits: boolean,
 /*   matchups: {
        matchup: [number, number],
        rowspan: number,
    }[][],
    numPlayoffRounds: number,*/
    season: number,
    series: {
        cid: number,
        seed: number,
        tid: number,
        winp: number,
        won?: number,
    },
	gameType: number,
	playoffsTypeSpring: string,	
}) => {
    setTitle(`Spring Split Playoffs - ${season}`);

let dropdownFields;
  if (gameType > 4 ) {
    dropdownFields = ["seasons", "playoffsTypeSpring"];
  } else {
    dropdownFields = ["seasons"];
  }	
	
    return <div>
        <Dropdown view="playoffs2" fields={dropdownFields} values={[season,playoffsTypeSpring]} />
        <JumpTo season={season} />
		<a name="Return"></a> 
		
        <h1>Spring Split Playoffs <NewWindowLink /></h1>

		
		
        {!finalMatchups ? <p>This is what the playoff matchups would be if the season ended right now.</p> : null}

		{!bothSplits ? 		<p className="text-danger">This league is only the Summer Split. So these games will not play. Use the Worlds w/ Splits types to play both splits.</p> : null}
	
		{LCSExtended ?  <a href="#NA">NA LCS Promotion</a>  : null}
		{LCSExtended ?  <br /> : null}	
		{LadderExtended ? <a href="#EU">EU LCS Promotion</a>: null}
		{LadderExtended ?  <br /> : null}
		{LadderExtended ? <a href="#LCK">LCK Promotion</a>: null}
		{LadderExtended ?  <br /> : null}
		{LadderExtended ? <a href="#LPL">LPL Promotion</a>: null}
		{LadderExtended ?  <br /> : null}
		{LadderExtended ? <a href="#LMS">LMS Promotion</a>: null}
		{LadderExtended ?  <br /> : null}
		{LadderExtended ? <a href="#WC">WC Promotion</a>: null}
		{LadderExtended ?  <br /> : null}
		

		{LCSConference ? <h3 className="hidden-xs" >LCS Championship Tournament <span class="pull-right"></span></h3>  : null}
		{WorldsPlayoff ? <h3 className="hidden-xs" >NA LCS Championship Tournament <span class="pull-right"></span></h3>	 : null}
		{NAWorlds ? <h3 className="hidden-xs" >NA LCS Championship Tournament <span class="pull-right"></span></h3>	 : null}
		
	
	 {NAWorlds ?	<div className="table-responsive">
            <table className="table-condensed table-style3" width="100%">
                <tbody>
				  <tr> 
					  {LCSConference ?  <td> Quarterfinals </td> : null}				  
					  {LCSConference ?  <td> Semifinals </td> : null}
					  {LCSConference ?  <td> Finals </td> : null}
					  {LCSConference ?  <td> 3rd Place Game </td> : null}
					  {WorldsPlayoff ?  <td> Quarterfinals </td> : null}
					  {WorldsPlayoff ?  <td> Semifinals </td> : null}
					  {WorldsPlayoff ?  <td> Finals / 3rd Place Game  </td> : null}
					  {NAWorlds ?  <td> Quarterfinals </td> : null}
					  {NAWorlds ?  <td> Semifinals </td> : null}
					  {NAWorlds ?  <td> Finals / 3rd Place Game  </td> : null}
					  
				  </tr>	
				  <tr> 
					<td width="14.28%" ></td> 
					<td rowspan="2" width="14.28%">	<PlayoffMatchup season={season} series={series[1][0]} /> </td>
					<td rowspan="4" width="0%">  <PlayoffMatchup season={season} series={series[2][0]} /> </td>  
					
				  </tr> 				  
 
				  <tr>
					<td><PlayoffMatchup season={season} series={series[0][0]} /> </td>  
				  </tr>
				  
				  <tr>
					<td ><PlayoffMatchup season={season} series={series[0][1]} /> </td>  
				  </tr>
				  
				  <tr>
				  
					<td width="14.28%" ></td> 
					<td rowspan="2" width="14.28%"><PlayoffMatchup season={season} series={series[1][1]} /> </td>  

				  
				  </tr>	  

				  <tr>
				  
					<td  width="14.28%"></td> 
					<td  rowspan="2" width="14.28%"></td>
					<td  rowspan="4" width="0%" ><PlayoffMatchup season={season} series={series[2][1]} /> </td>  
				  
				  </tr>	  				  
				  
                </tbody>
            </table>
        </div>	: null}			     
		
		
		
		
		{WorldsPlayoff ? <h3 className="hidden-xs" >EU LCS Championship Tournament <span class="pull-right"></span></h3>	 : null}
		{EUWorlds ? <h3 className="hidden-xs" >EU LCS Championship Tournament <span class="pull-right"></span></h3>	 : null}
		
	
       {EUWorlds ?   <div className="table-responsive">
            <table className="table-condensed table-style3" width="100%">
                <tbody>
				  <tr> 
					  {WorldsPlayoff ?  <td> Quarterfinals </td> : null}
					  {WorldsPlayoff ?  <td> Semifinals </td> : null}
					  {WorldsPlayoff ?  <td> Finals / 3rd Place Game  </td> : null}
					  {EUWorlds ?  <td> Quarterfinals </td> : null}
					  {EUWorlds ?  <td> Semifinals </td> : null}
					  {EUWorlds ?  <td> Finals / 3rd Place Game  </td> : null}
				  </tr>				
				
				  <tr> 
					<td width="14.28%" ></td> 
					<td rowspan="2" width="14.28%">	<PlayoffMatchup season={season} series={series[1][10]} /> </td>
					<td rowspan="4" width="0%">  <PlayoffMatchup season={season} series={series[2][9]} /> </td>  
					
				  </tr> 
  
				  <tr>
					<td><PlayoffMatchup season={season} series={series[0][12]} /> </td>  
				  </tr>
				  
				  <tr>
					<td ><PlayoffMatchup season={season} series={series[0][13]} /> </td>  
				  </tr>
				  
				  <tr>
				  
					<td width="14.28%" ></td> 
					<td rowspan="2" width="14.28%"><PlayoffMatchup season={season} series={series[1][11]} /> </td>  

				  
				  </tr>	  

				  <tr>
				  
					<td  width="14.28%"></td> 
					<td  rowspan="2" width="14.28%"></td>
					<td  rowspan="4" width="0%" ><PlayoffMatchup season={season} series={series[2][10]} /> </td>  
				  
				  </tr>	  
								  
				  
                </tbody>
            </table>
        </div>	: null}	
		

		{LCKConference ? <h3 className="hidden-xs" >LCK Championship Tournament <span class="pull-right"></span></h3>	 : null}		

	{LCKConference ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
  				{LCKConference ? <td > Wild Card  </td>		  	   : null}
				{LCKConference ? <td > Quarterfinals </td>	  	   : null}	  
				{LCKConference ? <td > Semifinals </td>	  	   : null}	  			  
				{LCKConference ? <td > Finals </td>	  	   : null}	
			  
			  </tr>
			  <tr>
			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][7]} /> </td> 
				<td rowspan="4" width="14.28%"  > <PlayoffMatchup season={season} series={series[2][6]} /> </td> 
				<td rowspan="6" width="0%" > <PlayoffMatchup season={season} series={series[3][1]} /> </td>   
			  
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][9]} /> </td> 
			  </tr>

			  
			</tbody>
		  </table>
		</div>		 : null}
		

		{LPLConference ? <h3 className="hidden-xs" >LPL Championship Tournament <span class="pull-right"></span></h3>	 : null}		

		{LPLConference ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
  				{LPLConference ? <td > Gauntlet </td>	  	   : null}			  

			  </tr>	
			  <tr> 
  				{LPLConference ? <td > Round 1 </td>		  	   : null}
				{LPLConference ? <td > Round 2 </td>	  	   : null}	  
				{LPLConference ? <td > Seeding Match </td>	  	   : null}	  			  
				{LPLConference ? <td > Quarterfinals </td>	  	   : null}				
			    
			  </tr>
			  <tr>
			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][8]} /> </td> 
				<td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[2][7]} /> </td> 
				<td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[3][2]} /> </td> 
			  
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][10]} /> </td>
		  
			  </tr>
			  <tr>
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" ></td>
				<td rowspan="2" width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" > <PlayoffMatchup season={season} series={series[3][3]} /> </td> 
			  </tr>	  
				<tr>
				
				</tr>	  
				<tr>

				{LPLConference ? <td > Final Stage  </td>	  	   : null}	  			  
				
				</tr>	  
			  <tr>
				{LPLConference ? <td > Semifinals</td>	  	   : null}	  			  
				{LPLConference ? <td >  Finals / 3rd Place Match </td>	  	   : null}				
			    				  
				  
				  
			  </tr>
			  <tr>
				<td  width="14.28%"  > <PlayoffMatchup season={season} series={series[4][0]} /> </td> 
				<td rowspan="2"   > <PlayoffMatchup season={season} series={series[5][0]} /> </td> 
			  </tr>
			  <tr>
				<td  width="14.28%"  > <PlayoffMatchup season={season} series={series[4][1]} /> </td> 
				<td rowspan="2"   > <PlayoffMatchup season={season} series={series[5][1]} /> </td> 
			  </tr>

			  
			</tbody>
		  </table>
		</div> : null}	

		
		
		{LMSConference ? <h3 className="hidden-xs" >LMS Championship Playoffs <span class="pull-right"></span></h3>	 : null}		

		{LMSConference ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
  				{LMSConference ? <td > Quarterfinals </td>	  	   : null}
				{LMSConference ? <td > Semifinals </td>	  	   : null}	  
				{LMSConference ? <td > Finals </td>	  	   : null}	  			  
			  
			  </tr>
			  <tr>
			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][9]} /> </td> 
				<td rowspan="4" width="14.28%"  > <PlayoffMatchup season={season} series={series[2][8]} /> </td> 
			  
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][11]} /> </td>  
			  </tr>

			  
			</tbody>
		  </table>
		</div>	 : null}		
		

	
		
		{WorldsPlayIn ? <h3 className="hidden-xs" >MSI Play-In <span class="pull-right"></span></h3>	 : null}
	{WorldsPlayIn ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			 <td width="14.28%"> Play-In </td>	  

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[6][8]} /> </td>  
			  </tr>	  
			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[6][9]} /> </td>  
			  </tr>	  			  
			</tbody>
		  </table>
		</div>	 : null}	

		{WorldsPlayIn ? <h3 className="hidden-xs" ><span class="pull-right"></span></h3>	 : null}
	{WorldsPlayIn ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <td width="14.28%"> Play-In (Loser's Bracket)</td>	  	

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[7][4]} /> </td>  
			  </tr>	  
			</tbody>
		  </table>
		</div>	 : null}			

		
		{WorldsGroupPlay ? <h3 className="hidden-xs" >MSI Group Play<span class="pull-right"></span></h3>	 : null}
	{WorldsGroupPlay ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <td width="14.28%"> </td>	  	   

			  <tr>
				<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][8]} /> </td>  
			  </tr>	  
			  <tr>
				<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][9]} /> </td>  
			  </tr>	
			  <tr>
				<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][10]} /> </td>  
			  </tr>				  
			</tbody>
		  </table>
		</div>	: null}
		
		{WorldsGroupKnockout ? <h3 className="hidden-xs" >MSI Group Knockout<span class="pull-right"></span></h3>	 : null}
	{WorldsGroupKnockout ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			 <td width="14.28%"> </td>	

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[9][4]} /> </td>  
			  </tr>	  
			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[9][5]} /> </td>  
			  </tr>				  
			</tbody>
		  </table>
		</div>	 : null}

		{WorldsGroupFinals ? <h3 className="hidden-xs" >MSI Group Finals<span class="pull-right"></span></h3>	 : null}
	{WorldsGroupFinals ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			 <td width="14.28%"> </td>	  

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[10][2]} /> </td>  
			  </tr>	  
			</tbody>
		  </table>
		</div>		: null}	
		
		{LadderExtended ? <a name="NA"></a> : null}		
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}
		
		{naLadder ? <h3 className="hidden-xs" >LCS Promotion Games <span class="pull-right"></span></h3>	 : null}		

		{naLadder ?  <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
				<td > Qualifiers</td>	  	 		  

			  </tr>
			  <tr> 
					 <td width="14.28%" >  First Round </td>	  	 			  
					 <td > Finals / 3rd Place Match</td>	  	 		  
			  
			  </tr>

			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][2]} /> </td>  
				<td rowspan="2"  > <PlayoffMatchup season={season} series={series[1][2]} /> </td> 
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][3]} /> </td> 
			  </tr>
			  <tr>
				<td ></td>  
				<td   > <PlayoffMatchup season={season} series={series[1][3]} /> </td>
			  </tr>
			  
			  <tr> 
					<td > Promotion Games</td>	  			  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][2]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][3]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>		 : null}	

		
		{naLadder ? <h3 className="hidden-xs" >CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

		{naLadder ? <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  			 <td > Round 1 </td>	  	 
				 <td > Round 2 </td>	  	   
			 <td > Finals </td>	  	     
			  </tr>

			  
			  <tr>

			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" ></td>
				<td rowspan="2" width="0.00%"  > <PlayoffMatchup season={season} series={series[2][4]} /> </td>  
			  
			  </tr>
			  <tr>
				<td width="14.28%"  > <PlayoffMatchup season={season} series={series[0][4]} /> </td>  
			  </tr>
			  <tr>
				<td ></td> 
				<td  > <PlayoffMatchup season={season} series={series[1][4]} /> </td>  
			  </tr>
			  <tr>
				<td  width="14.28%" > <PlayoffMatchup season={season} series={series[0][5]} /> </td> 
			  </tr>


			  
			</tbody>
		  </table>
		</div>	 : null}	
				
		
	{naLadder ?  <h3 className="hidden-xs" >CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

	{naLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				<td > Round 1 </td>	  	 
				{CSPromo3 ? <td > Round 2 </td>	  	   : null}	  
				<td > Finals </td>	  	 	  
			  

			  </tr>

			  <tr>
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" > <PlayoffMatchup season={season} series={series[1][5]} /> </td> 
				<td rowspan="4" width="0%" >  <PlayoffMatchup season={season} series={series[2][5]} /> </td> 
			  </tr>
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][6]} /> </td>  
			  </tr>
			  <tr>
				<td >  <PlayoffMatchup season={season} series={series[0][7]} /> </td> 
				<td rowspan="2" width="14.28%"> <PlayoffMatchup season={season} series={series[1][6]} /> </td>   
			  </tr>	  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][8]} /> </td> 
			  </tr>	  

			  
			</tbody>
		  </table>
		</div>	   : null}	 	
		
				

		
		
		{CSPromo3 ? <h3 className="hidden-xs" >CS Promotion Games - Third Place Match<span class="pull-right"></span></h3>	 : null}		

	{CSPromo3 ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  <td>  </td>

			  </tr>
			  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[3][0]} /> </td> 
			  </tr>

			  
			</tbody>
		  </table>
		</div> 		 : null}			
		
		{LadderExtended ?  <a name="EU"></a> : null}
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}
		
		{euLadder ? <h3 className="hidden-xs" >EU LCS Promotion Games <span class="pull-right"></span></h3>	 : null}		

		{euLadder ?  <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					<td > Qualifiers</td>	  			  

			  </tr>
			  <tr> 
				 <td width="14.28%" >  First Round </td>	  			  
					<td > Finals / 3rd Place Match</td>	  	  	  
			  
			  </tr>

			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][16]} /> </td>  
				<td rowspan="2"  > <PlayoffMatchup season={season} series={series[1][13]} /> </td> 
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][17]} /> </td> 
			  </tr>
			  <tr>
				<td ></td>  
				<td   > <PlayoffMatchup season={season} series={series[1][14]} /> </td>
			  </tr>
			  
			  <tr> 
					<td > Promotion Games</td>	  		  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][11]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][12]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>		  : null}		

		
		{euLadder ? <h3 className="hidden-xs" >EU CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

	{euLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				 <td > Round 1 </td>	  
				 <td > Round 2 </td>	  	  
				<td > Finals </td>	  	    
			  </tr>

			  
			  <tr>

			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" ></td>
				<td rowspan="2" width="0.00%"  > <PlayoffMatchup season={season} series={series[2][13]} /> </td>  
			  
			  </tr>
			  <tr>
				<td width="14.28%"  > <PlayoffMatchup season={season} series={series[0][18]} /> </td>  
			  </tr>
			  <tr>
				<td ></td> 
				<td  > <PlayoffMatchup season={season} series={series[1][15]} /> </td>  
			  </tr>
			  <tr>
				<td  width="14.28%" > <PlayoffMatchup season={season} series={series[0][19]} /> </td> 
			  </tr>


			  
			</tbody>
		  </table>
		</div>		   : null}
				
		
		{euLadder ? <h3 className="hidden-xs" >EU CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

	{euLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				 <td > Round 1 </td>	  	   
				{LadderExtendedMax ? <td > Round 2 </td>	  	   : null}	  
				 <td > Finals </td>	  	  	  
			  

			  </tr>

			  <tr>
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" > <PlayoffMatchup season={season} series={series[1][16]} /> </td> 
				<td rowspan="4" width="0%" >  <PlayoffMatchup season={season} series={series[2][14]} /> </td> 
			  </tr>
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][20]} /> </td>  
			  </tr>
			  <tr>
				<td >  <PlayoffMatchup season={season} series={series[0][21]} /> </td> 
				<td rowspan="2" width="14.28%"> <PlayoffMatchup season={season} series={series[1][17]} /> </td>   
			  </tr>	  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][22]} /> </td> 
			  </tr>	  

			  
			</tbody>
		  </table>
		</div>		 : null}		
		
		
		
		{LadderExtended ? <a name="LCK"></a> : null}		
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}

		
		{lckLadder ? <h3 className="hidden-xs" >LCK Promotion Games <span class="pull-right"></span></h3>	 : null}		

	{lckLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					<td > Qualifiers</td>

			  </tr>
			  <tr> 
					<td width="14.28%" >  First Round </td>	  			  
					 <td > Finals / 3rd Place Match</td>	  	  		  
			  
			  </tr>

			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][23]} /> </td>  
				<td rowspan="2"  > <PlayoffMatchup season={season} series={series[1][18]} /> </td> 
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][24]} /> </td> 
			  </tr>
			  <tr>
				<td ></td>  
				<td   > <PlayoffMatchup season={season} series={series[1][19]} /> </td>
			  </tr>
			  
			  <tr> 
					 <td > Promotion Games</td>	  		  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][15]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][16]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>	   : null}	

		
		{lckLadder ? <h3 className="hidden-xs" >Korea CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

	{lckLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				<td > Round 1 </td>	  
				<td > Round 2 </td>	  	 	  
				 <td > Finals </td>	  	  	  
			  </tr>

			  
			  <tr>

			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" ></td>
				<td rowspan="2" width="0.00%"  > <PlayoffMatchup season={season} series={series[2][17]} /> </td>  
			  
			  </tr>
			  <tr>
				<td width="14.28%"  > <PlayoffMatchup season={season} series={series[0][25]} /> </td>  
			  </tr>
			  <tr>
				<td ></td> 
				<td  > <PlayoffMatchup season={season} series={series[1][20]} /> </td>  
			  </tr>
			  <tr>
				<td  width="14.28%" > <PlayoffMatchup season={season} series={series[0][26]} /> </td> 
			  </tr>


			  
			</tbody>
		  </table>
		</div>	 : null}	
				
		
		{lckLadder ? <h3 className="hidden-xs" >Korea CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

	{lckLadder ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				 <td > Round 1 </td>	  	  
				{LadderExtendedMax ? <td > Round 2 </td>	  	   : null}	  
				 <td > Finals </td>	  	    
			  

			  </tr>

			  <tr>
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" > <PlayoffMatchup season={season} series={series[1][21]} /> </td> 
				<td rowspan="4" width="0%" >  <PlayoffMatchup season={season} series={series[2][18]} /> </td> 


				</tr>
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][27]} /> </td>  
			  </tr>
			  <tr>
				<td >  <PlayoffMatchup season={season} series={series[0][28]} /> </td> 
				<td rowspan="2" width="14.28%"> <PlayoffMatchup season={season} series={series[1][22]} /> </td>   
			  </tr>	  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][29]} /> </td> 
			  </tr>	  

			  
			</tbody>
		  </table>
		</div>	 : null}			
		

		
		{LadderExtended ? <a name="LPL"></a> : null}		
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}

		
		{lplLadder ? <h3 className="hidden-xs" >LPL Promotion Games <span class="pull-right"></span></h3>	 : null}		

	{lplLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					<td > Qualifiers</td>	  	 

			  </tr>
			  <tr> 
					 <td width="14.28%" >  First Round </td>	  	
					 <td > Finals / 3rd Place Match</td>	  	  
			  
			  </tr>

			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][30]} /> </td>  
				<td rowspan="2"  > <PlayoffMatchup season={season} series={series[1][23]} /> </td> 
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][31]} /> </td> 
			  </tr>
			  <tr>
				<td ></td>  
				<td   > <PlayoffMatchup season={season} series={series[1][24]} /> </td>
			  </tr>
			  
			  <tr> 
				 <td > Promotion Games</td>	  			  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][19]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][20]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>	  : null}		

		
		{lplLadder ? <h3 className="hidden-xs" >China CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

		{lplLadder ? <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				 <td > Round 1 </td>	  	   
				 <td > Round 2 </td>	  	   
				 <td > Finals </td>	  	   
			  </tr>

			  
			  <tr>

			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" ></td>
				<td rowspan="2" width="0.00%"  > <PlayoffMatchup season={season} series={series[2][21]} /> </td>  
			  
			  </tr>
			  <tr>
				<td width="14.28%"  > <PlayoffMatchup season={season} series={series[0][32]} /> </td>  
			  </tr>
			  <tr>
				<td ></td> 
				<td  > <PlayoffMatchup season={season} series={series[1][25]} /> </td>  
			  </tr>
			  <tr>
				<td  width="14.28%" > <PlayoffMatchup season={season} series={series[0][33]} /> </td> 
			  </tr>


			  
			</tbody>
		  </table>
		</div>	  : null}	 	
				
		
		{lplLadder ? <h3 className="hidden-xs" >China CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

		{lplLadder ? <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				 <td > Round 1 </td>	  	  
				{LadderExtendedMax ? <td > Round 2 </td>	  	   : null}	  
				 <td > Finals </td>	  	  	  
			  

			  </tr>

			  <tr>
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" > <PlayoffMatchup season={season} series={series[1][26]} /> </td> 
				<td rowspan="4" width="0%" >  <PlayoffMatchup season={season} series={series[2][22]} /> </td> 
			  </tr>
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][34]} /> </td>  
			  </tr>
			  <tr>
				<td >  <PlayoffMatchup season={season} series={series[0][35]} /> </td> 
				<td rowspan="2" width="14.28%"> <PlayoffMatchup season={season} series={series[1][27]} /> </td>   
			  </tr>	  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][36]} /> </td> 
			  </tr>	  

			  
			</tbody>
		  </table>
		</div>	: null}		
		

		{LadderExtended ? <a name="LMS"></a> : null}
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}
		
		{lmsLadder ? <h3 className="hidden-xs" >LMS Promotion Games <span class="pull-right"></span></h3>	 : null}		

		{lmsLadder ?  <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					<td > Qualifiers</td>	  	 		  

			  </tr>
			  <tr> 
					 <td width="14.28%" >  First Round </td>			  
					<td > Finals / 3rd Place Match</td>	  	  		  
			  
			  </tr>

			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][37]} /> </td>  
				<td rowspan="2"  > <PlayoffMatchup season={season} series={series[1][28]} /> </td> 
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][38]} /> </td> 
			  </tr>
			  <tr>
				<td ></td>  
				<td   > <PlayoffMatchup season={season} series={series[1][29]} /> </td>
			  </tr>
			  
			  <tr> 
				 <td > Promotion Games</td>	  				  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][23]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][24]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>	 : null}	

		
		{lmsLadder ? <h3 className="hidden-xs" >Taiwan CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

			{lmsLadder ?  <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				 <td > Round 1 </td>	  	  
				 <td > Round 2 </td>	  		  
				 <td > Finals </td>	  	    
			  </tr>

			  
			  <tr>

			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" ></td>
				<td rowspan="2" width="0.00%"  > <PlayoffMatchup season={season} series={series[2][25]} /> </td>  
			  
			  </tr>
			  <tr>
				<td width="14.28%"  > <PlayoffMatchup season={season} series={series[0][39]} /> </td>  
			  </tr>
			  <tr>
				<td ></td> 
				<td  > <PlayoffMatchup season={season} series={series[1][30]} /> </td>  
			  </tr>
			  <tr>
				<td  width="14.28%" > <PlayoffMatchup season={season} series={series[0][40]} /> </td> 
			  </tr>


			  
			</tbody>
		  </table>
		</div>		 : null}	
				
		
		{lmsLadder ? <h3 className="hidden-xs" >Taiwan CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

		{lmsLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				<td > Round 1 </td>	 
				{LadderExtendedMax ? <td > Round 2 </td>	  	   : null}	  
				 <td > Finals </td>	 
			  

			  </tr>

			  <tr>
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" > <PlayoffMatchup season={season} series={series[1][31]} /> </td> 
				<td rowspan="4" width="0%" >  <PlayoffMatchup season={season} series={series[2][26]} /> </td> 
			  </tr>
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][41]} /> </td>  
			  </tr>
			  <tr>
				<td >  <PlayoffMatchup season={season} series={series[0][42]} /> </td> 
				<td rowspan="2" width="14.28%"> <PlayoffMatchup season={season} series={series[1][32]} /> </td>   
			  </tr>	  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][43]} /> </td> 
			  </tr>	  

			  
			</tbody>
		  </table>
		</div>		 : null}	
		
		{LadderExtended ? <a name="WC"></a> : null}	
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}
		
		{wcLadder ? <h3 className="hidden-xs" >Wild Card Promotion Games <span class="pull-right"></span></h3>	 : null}		

	{wcLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					 <td > Qualifiers</td>	  	  

			  </tr>
			  <tr> 
					 <td width="14.28%" >  First Round </td>	  	  
					 <td > Finals / 3rd Place Match</td>	  	  
			  
			  </tr>

			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][44]} /> </td>  
				<td rowspan="2"  > <PlayoffMatchup season={season} series={series[1][33]} /> </td> 
			  </tr>
			  <tr>
				<td  > <PlayoffMatchup season={season} series={series[0][45]} /> </td> 
			  </tr>
			  <tr>
				<td ></td>  
				<td   > <PlayoffMatchup season={season} series={series[1][34]} /> </td>
			  </tr>
			  
			  <tr> 
					<td > Promotion Games</td>	  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][27]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][28]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>	 : null}	

		
		{wcLadder ? <h3 className="hidden-xs" >Wild Card CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

	{wcLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				<td > Round 1 </td>	  
				 <td > Round 2 </td>	
				 <td > Finals </td>	  	
			  </tr>

			  
			  <tr>

			  
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" ></td>
				<td rowspan="2" width="0.00%"  > <PlayoffMatchup season={season} series={series[2][29]} /> </td>  
			  
			  </tr>
			  <tr>
				<td width="14.28%"  > <PlayoffMatchup season={season} series={series[0][46]} /> </td>  
			  </tr>
			  <tr>
				<td ></td> 
				<td  > <PlayoffMatchup season={season} series={series[1][35]} /> </td>  
			  </tr>
			  <tr>
				<td  width="14.28%" > <PlayoffMatchup season={season} series={series[0][47]} /> </td> 
			  </tr>


			  
			</tbody>
		  </table>
		</div>		 : null}	
				
		

		
		{wcLadder ? <h3 className="hidden-xs" >Wild Card CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

		{wcLadder ? <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				<td > Round 1 </td>	  	  
				{LadderExtendedMax ? <td > Round 2 </td>	  	   : null}	  
				 <td > Finals </td>	  	  
			  

			  </tr>

			  <tr>
				<td width="14.28%" ></td> 
				<td rowspan="2" width="14.28%" > <PlayoffMatchup season={season} series={series[1][36]} /> </td> 
				<td rowspan="4" width="0%" >  <PlayoffMatchup season={season} series={series[2][30]} /> </td> 
			  </tr>
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][48]} /> </td>  
			  </tr>
			  <tr>
				<td >  <PlayoffMatchup season={season} series={series[0][49]} /> </td> 
				<td rowspan="2" width="14.28%"> <PlayoffMatchup season={season} series={series[1][37]} /> </td>   
			  </tr>	  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][50]} /> </td> 
			  </tr>	  

			  
			</tbody>
		  </table>
		</div>		  : null}	  	
				
    </div>;
};

Playoffs2.propTypes = {
    confNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
		NAConference: React.PropTypes.bool.isRequired,
		EUConference: React.PropTypes.bool.isRequired,
		LCSConference: React.PropTypes.bool.isRequired,
		LCSExtended: React.PropTypes.bool.isRequired,
		LCKConference: React.PropTypes.bool.isRequired,
		LPLConference: React.PropTypes.bool.isRequired,
		LMSConference: React.PropTypes.bool.isRequired,
		WorldsPlayoff: React.PropTypes.bool.isRequired,
		WorldsSpring: React.PropTypes.bool.isRequired,
		WorldsSummer: React.PropTypes.bool.isRequired,
		NAWorlds: React.PropTypes.bool.isRequired,
		EUWorlds: React.PropTypes.bool.isRequired,
		CSPromo3: React.PropTypes.bool.isRequired,
		CSPromo2: React.PropTypes.bool.isRequired,
		LadderExtended: React.PropTypes.bool.isRequired,
		LadderExtendedMax: React.PropTypes.bool.isRequired,
		WorldsPlayIn: React.PropTypes.bool.isRequired,
		WorldsGroupPlay: React.PropTypes.bool.isRequired,
		WorldsGroupKnockout: React.PropTypes.bool.isRequired,
		WorldsGroupFinals: React.PropTypes.bool.isRequired,
		naLadder: React.PropTypes.bool.isRequired,
		euLadder: React.PropTypes.bool.isRequired,
		lckLadder: React.PropTypes.bool.isRequired,
		lplLadder: React.PropTypes.bool.isRequired,
		lmsLadder: React.PropTypes.bool.isRequired,
		wcLadder: React.PropTypes.bool.isRequired,		
    finalMatchups: React.PropTypes.bool.isRequired,
  //  matchups: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
  //  numPlayoffRounds: React.PropTypes.number.isRequired,
    season: React.PropTypes.number.isRequired,
    series: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
};

export default Playoffs2;
