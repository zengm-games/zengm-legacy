// @flow

import React from 'react';
import {Dropdown, JumpTo, NewWindowLink, PlayoffMatchup, PlayoffMatchupStore, PlayoffMatchupGroups} from '../components';
import {setTitle} from '../util';

const MSI = ({confNames, NAConference, EUConference, LCSConference, LCSExtended, LCKConference, LPLConference, LMSConference, WorldsPlayoff,
					 WorldsSpring,  WorldsSummer,finalMatchups,  season, series}: {
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
    finalMatchups: boolean,
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
}) => {
    setTitle(`MSI - ${season}`);

    return <div>
        <Dropdown view="msi" fields={["seasons"]} values={[season]} />
        <JumpTo season={season} />
        <h1>MSI <NewWindowLink /></h1>

        {!finalMatchups ? <p>This is what the playoff matchups would be if the season ended right now.</p> : null}


		{LCSConference ? <h3 className="hidden-xs" >LCS Championship Tournament <span class="pull-right"></span></h3>  : null}
		{WorldsPlayoff ? <h3 className="hidden-xs" >NA LCS Championship Tournament <span class="pull-right"></span></h3>	 : null}
		
	
		<div className="table-responsive">
            <table className="table-condensed" width="100%">
                <tbody>
				  <tr> 
					  {LCSConference ?  <td> Quarterfinals </td> : null}				  
					  {LCSConference ?  <td> Semifinals </td> : null}
					  {LCSConference ?  <td> Finals </td> : null}
					  {LCSConference ?  <td> 3rd Place Game </td> : null}
					  {WorldsPlayoff ?  <td> Quarterfinals </td> : null}
					  {WorldsPlayoff ?  <td> Semifinals </td> : null}
					  {WorldsPlayoff ?  <td> Finals / 3rd Place Game  </td> : null}
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
        </div>				     
		
		
		
		
		{WorldsPlayoff ? <h3 className="hidden-xs" >EU LCS Championship Tournament <span class="pull-right"></span></h3>	 : null}
		
	
        <div className="table-responsive">
            <table className="table-condensed" width="100%">
                <tbody>
				  <tr> 
					  {WorldsPlayoff ?  <td> Quarterfinals </td> : null}
					  {WorldsPlayoff ?  <td> Semifinals </td> : null}
					  {WorldsPlayoff ?  <td> Finals / 3rd Place Game  </td> : null}
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
        </div>		
		

		{LCKConference ? <h3 className="hidden-xs" >LCK Championship Tournament <span class="pull-right"></span></h3>	 : null}		

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
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
		</div>		
		

		{LPLConference ? <h3 className="hidden-xs" >LPL Championship Tournament <span class="pull-right"></span></h3>	 : null}		

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
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
		</div>

		
		
		{LMSConference ? <h3 className="hidden-xs" >LMS Championship Playoffs <span class="pull-right"></span></h3>	 : null}		

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
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
		</div>		
		

		
		{LCSExtended ? <h3 className="hidden-xs" >LCS Promotion Games <span class="pull-right"></span></h3>	 : null}		

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
					{LCSExtended ? <td > Qualifiers</td>	  	   : null}			  

			  </tr>
			  <tr> 
					{LCSExtended ? <td width="14.28%" >  First Round </td>	  	   : null}			  
					{LCSExtended ? <td > Finals / 3rd Place Match</td>	  	   : null}			  
			  
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
					{LCSExtended ? <td > Promotion Games</td>	  	   : null}			  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][2]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][3]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>		

		
		{LCSExtended ? <h3 className="hidden-xs" >CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
 
  				{LCSExtended ? <td > Round 1 </td>	  	   : null}
				{LCSExtended ? <td > Round 2 </td>	  	   : null}	  
				{LCSExtended ? <td > Finals </td>	  	   : null}	  
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
		</div>		
				
		
		{LCSExtended ? <h3 className="hidden-xs" >CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
			  
				{LCSExtended ? <td > Round 1 </td>	  	   : null}
				{LCSExtended ? <td > Round 2 </td>	  	   : null}	  
				{LCSExtended ? <td > Finals </td>	  	   : null}	  
			  

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
		</div>		
		
				

		
		
		{LCSExtended ? <h3 className="hidden-xs" >CS Promotion Games - Third Place Match<span class="pull-right"></span></h3>	 : null}		

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
			  <td>  </td>

			  </tr>
			  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[3][0]} /> </td> 
			  </tr>

			  
			</tbody>
		  </table>
		</div> 		
		
		
		{WorldsPlayoff ? <h3 className="hidden-xs" >Worlds - Regional Finals <span class="pull-right"></span></h3>	 : null}		
		
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>

				<tr> 				
				{WorldsPlayoff ? <h4 className="hidden-xs" >NA - Regional Finals  <span class="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
				{WorldsPlayoff ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{WorldsPlayoff ? <td > Finals </td>	  	   : null}	
				</tr>
			 <tr>
					<td ><PlayoffMatchup season={season} series={series[6][0]} /> </td> 
					<td rowspan="2" ><PlayoffMatchup season={season} series={series[7][0]} /> </td> 				
			  </tr>
			  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[6][1]} /> </td> 
			  </tr>
		   </tbody>
		  </table>
		</div>		

		
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>

				<tr> 				
				{WorldsPlayoff ? <h4 className="hidden-xs" >EU - Regional Finals <span class="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
				{WorldsPlayoff ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{WorldsPlayoff ? <td > Finals </td>	  	   : null}	  </tr>
			 <tr>
					<td ><PlayoffMatchup season={season} series={series[6][2]} /> </td> 
					<td rowspan="2" ><PlayoffMatchup season={season} series={series[7][1]} /> </td> 				
			  </tr>
			  
			  <tr>
				<td > <PlayoffMatchup season={season} series={series[6][3]} /> </td> 
			  </tr>
		   </tbody>
		  </table>
		</div>		
				

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
				<tr> 
				{WorldsPlayoff ? <h4 className="hidden-xs" >LCK - Regional Finals <span class="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
					{WorldsPlayoff ? <td width="14.28%"> Semifinals </td>	  	   : null}
					{WorldsPlayoff ? <td > Finals </td>	  	   : null}
			  </tr>
			 <tr>
					<td ><PlayoffMatchup season={season} series={series[6][4]} /> </td> 
					<td rowspan="2" ><PlayoffMatchup season={season} series={series[7][2]} /> </td> 				
			  </tr>
			  
			  <tr>
					<td ><PlayoffMatchupStore season={season} series={series[6][5]} /> </td> 
			  </tr>
		   </tbody>
		  </table>
		</div>
		
		
		
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
				{WorldsPlayoff ? <h4 className="hidden-xs" >LPL - Regional Finals <span class="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
				{WorldsPlayoff ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{WorldsPlayoff ? <td > Finals </td>	  	   : null}
			  
			  </tr>
			 <tr>
				<td ><PlayoffMatchup season={season} series={series[6][6]} /> </td> 
				<td rowspan="2" ><PlayoffMatchup season={season} series={series[7][3]} /> </td> 
				
			  </tr>
			  
			  <tr>
					<td ><PlayoffMatchup season={season} series={series[6][7]} /> </td> 			  
			  </tr>
		   </tbody>
		  </table>
		</div>		
		
		

		
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
				<tr> 
		{WorldsPlayoff ? <h4 className="hidden-xs" >WC - Regional Finals <span class="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
				{WorldsPlayoff ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{WorldsPlayoff ? <td > Finals </td>	  	   : null}
			  
			  </tr>
			 <tr>
				<td ><PlayoffMatchup season={season} series={series[0][14]} /> </td> 
				<td rowspan="2" ><PlayoffMatchup season={season} series={series[1][12]} /> </td> 
			  </tr>
			  
			  <tr>
				<td ><PlayoffMatchup season={season} series={series[0][15]} /> </td> 
			  </tr>	  
				  
			</tbody>
		  </table>
		</div>		
		


				
		{WorldsPlayoff ? <h3 className="hidden-xs" >Worlds - Groups  <span class="pull-right"></span></h3>	 : null}


		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
				{WorldsPlayoff ? <h4 className="hidden-xs" >Group A <span class="pull-right"></span></h4>	 : null}
			</tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][0]} /> </td> 
					<td ><PlayoffMatchupGroups season={season} series={series[8][1]} /> </td> 
			  </tr>	  
			  <tr>
			  </tr>	  

			</tbody>
		  </table>
		</div>		
		
		
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
					{WorldsPlayoff ? <h4 className="hidden-xs" >Group B <span class="pull-right"></span></h4>	 : null}
			 </tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][2]} /> </td>
					<td  ><PlayoffMatchupGroups season={season} series={series[8][3]} /> </td>   					
			  </tr>	  
			  <tr>
			  </tr>	  

			</tbody>
		  </table>
		</div>		
						
		
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
				{WorldsPlayoff ? <h4 className="hidden-xs" >Group C <span class="pull-right"></span></h4>	 : null}
			  </tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][4]} /> </td>
					<td ><PlayoffMatchupGroups season={season} series={series[8][5]} /> </td>   
			  </tr>	  
			  <tr>
					
			  </tr>	  

			</tbody>
		  </table>
		</div>
		

		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  <tr> 
				{WorldsPlayoff ? <h4 className="hidden-xs" >Group D <span class="pull-right"></span></h4>	 : null}
			</tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][6]} /> </td>  
					<td  ><PlayoffMatchupGroups season={season} series={series[8][7]} /> </td>   
			  </tr>	  
			  <tr>
					
			  </tr>	  

			</tbody>
		  </table>
		</div>	

		{WorldsPlayoff ? <h3 className="hidden-xs" >Worlds - Playoffs  <span class="pull-right"></span></h3>	 : null}
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  {WorldsPlayoff ? <td width="14.28%"> Quarterfinals </td>	  	   : null}
			  {WorldsPlayoff ? <td width="14.28%"> Semifinals </td>	  	   : null}
			  {WorldsPlayoff ? <td width="14.28%"> Finals </td>	  	   : null}

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[9][0]} /> </td>  
				<td width="14.28%" rowspan="2" ><PlayoffMatchup season={season} series={series[10][0]} /> </td> 
				<td rowspan="4" ><PlayoffMatchup season={season} series={series[11][0]} /> </td> 
			  </tr>	  
			  <tr>
				<td ><PlayoffMatchup season={season} series={series[9][1]} /> </td>   
			  </tr>	  
			  <tr>
				<td width="14.28%"  ><PlayoffMatchup season={season} series={series[9][2]} /> </td>  
				<td rowspan="2" ><PlayoffMatchup season={season} series={series[10][1]} /> </td>   
			  </tr>	  
			  <tr>
				<td ><PlayoffMatchup season={season} series={series[9][3]} /> </td>   
			  </tr>	  
			  
			</tbody>
		  </table>
		</div>
		
		{WorldsSpring ? <h3 className="hidden-xs" >MSI Play-In <span class="pull-right"></span></h3>	 : null}
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  {WorldsSpring ? <td width="14.28%"> Play-In </td>	  	   : null}

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[0][16]} /> </td>  
			  </tr>	  
			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[0][17]} /> </td>  
			  </tr>	  			  
			</tbody>
		  </table>
		</div>		

		{WorldsSpring ? <h3 className="hidden-xs" ><span class="pull-right"></span></h3>	 : null}
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  {WorldsSpring ? <td width="14.28%"> Play-In (Loser's Bracket)</td>	  	   : null}

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[1][13]} /> </td>  
			  </tr>	  
			</tbody>
		  </table>
		</div>				

		
		{WorldsSpring ? <h3 className="hidden-xs" >Group Play<span class="pull-right"></span></h3>	 : null}
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  {WorldsSpring ? <td width="14.28%"> </td>	  	   : null}

			  <tr>
				<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[2][11]} /> </td>  
			  </tr>	  
			  <tr>
				<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[2][12]} /> </td>  
			  </tr>	
			  <tr>
				<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[2][13]} /> </td>  
			  </tr>				  
			</tbody>
		  </table>
		</div>	
		
		{WorldsSpring ? <h3 className="hidden-xs" >Group Knockout<span class="pull-right"></span></h3>	 : null}
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  {WorldsSpring ? <td width="14.28%"> </td>	 : null}

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[3][4]} /> </td>  
			  </tr>	  
			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[3][5]} /> </td>  
			  </tr>				  
			</tbody>
		  </table>
		</div>	

		{WorldsSpring ? <h3 className="hidden-xs" >Group Finals<span class="pull-right"></span></h3>	 : null}
		<div class="table-responsive">
		  <table class="table-condensed" width="100%">
			<tbody>
			  {WorldsSpring ? <td width="14.28%"> </td>	  	   : null}

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[4][2]} /> </td>  
			  </tr>	  
			</tbody>
		  </table>
		</div>			
		
    </div>;
};

MSI.propTypes = {
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
    finalMatchups: React.PropTypes.bool.isRequired,
  //  matchups: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
  //  numPlayoffRounds: React.PropTypes.number.isRequired,
    season: React.PropTypes.number.isRequired,
    series: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
};

export default MSI;
