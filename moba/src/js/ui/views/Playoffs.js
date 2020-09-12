// @flow

import React from 'react';
import {Dropdown, JumpTo, NewWindowLink, PlayoffMatchup, PlayoffMatchupStore, PlayoffMatchupGroups} from '../components';
import {setTitle} from '../util';

const Playoffs = ({confNames, NAConference, EUConference, LCSConference, LCSExtended, LCKConference, LPLConference, LMSConference, WorldsPlayoff,
					LadderExtended, LadderExtendedMax, NALCSWorlds, EULCSWorlds, naLadder,euLadder,lckLadder,lplLadder,lmsLadder,wcLadder,worlds2019,
					 WorldsSpring,  WorldsSummer, WorldsRegionals, WorldsGroups,finalMatchups,  season, series,gameType,yearType, playoffsTypeSummer,
					 vietnam,sea,brazil,cis,japan,latin,oce,turkey,groups1,playoff1,groups2,playoff2
					 } : {
										 
    confNames: string[],
	NAConference: boolean,
	EUConference: boolean,
	LCSConference: boolean,
	LCSExtended: boolean,
	LCKConference: boolean,
	LPLConference: boolean,
	LMSConference: boolean,
	WorldsPlayoff: boolean,
	WorldsRegionals: boolean,
	WorldsGroups: boolean,
	WorldsSpring: boolean,
	WorldsSummer: boolean,	
	LadderExtendedMax: boolean,
	LadderExtendedMax: boolean,	
	NALCSWorlds: boolean,
	EULCSWorlds: boolean,	
	naLadder: boolean,	
	euLadder: boolean,	
	lckLadder: boolean,	
	lplLadder: boolean,	
	lmsLadder: boolean,	
	wcLadder: boolean,		
    finalMatchups: boolean,
	worlds2019: boolean,
	vietnam: boolean,
	sea: boolean,
	brazil: boolean,
	cis: boolean,
	japan: boolean,
	latin: boolean,
	oce: boolean,
	turkey: boolean,
	
			groups1: boolean,
				playoff1: boolean,
				groups2: boolean,
				playoff2: boolean,	
    season: number,
    series: {
        cid: number,
        seed: number,
        tid: number,
        winp: number,
        won?: number,
    },
	gameType: number,
	yearType: number,
	playoffsTypeSummer: string,
}) => {
    setTitle(`Summer Split Playoffs - ${season}`);

 let dropdownFields;
  if (gameType > 4 ) {
    dropdownFields = ["seasons", "playoffsTypeSummer"];
  } else {
    dropdownFields = ["seasons"];
  }
	
	
    return <div>
        <Dropdown view="playoffs" fields={dropdownFields} values={[season,playoffsTypeSummer]} />
        <JumpTo season={season} />
        <h1>Summer Split Playoffs <NewWindowLink /></h1>

        {!finalMatchups ? <p>This is what the playoff matchups would be if the season ended right now.</p> : null}

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
 
		{LCSConference ? <h3 className="hidden-xs" >LCS Championship Tournament <span className="pull-right"></span></h3>  : null}
		{NALCSWorlds ? <h3 className="hidden-xs" >NA LCS Championship Tournament <span className="pull-right"></span></h3>	 : null}
		
	
	{NALCSWorlds || LCSConference ?	<div className="table-responsive">
            <table className="table-condensed table-style3" width="100%">
                <tbody>
				  <tr> 
					  {LCSConference ?  <td> Quarterfinals </td> : null}				  
					  {LCSConference ?  <td> Semifinals </td> : null}
					  {LCSConference ?  <td> Finals </td> : null}
					  {LCSConference ?  <td> 3rd Place Game </td> : null}
					  {NALCSWorlds  ?  <td> Quarterfinals </td> : null}
					  {NALCSWorlds   ?  <td> Semifinals </td> : null}
					  {NALCSWorlds  ?  <td> Finals / 3rd Place Game  </td> : null}
				  </tr>	
				  <tr> 
					<td width="14.28%" ></td> 
					{NALCSWorlds || LCSConference ? <td rowspan="2" width="14.28%">	<PlayoffMatchup season={season} series={series[1][0]} /> </td> : null}
				{NALCSWorlds || LCSConference ? 	<td rowspan="4" width="0%">  <PlayoffMatchup season={season} series={series[2][0]} /> </td>   : null}
					
				  </tr> 				  
 
				  <tr>
				{NALCSWorlds || LCSConference ? 	<td><PlayoffMatchup season={season} series={series[0][0]} /> </td>   : null}
				  </tr>
				  
				  <tr>
				{NALCSWorlds || LCSConference ? 	<td ><PlayoffMatchup season={season} series={series[0][1]} /> </td>   : null}
				  </tr>
				  
				  <tr>
				  
					<td width="14.28%" ></td> 
				{NALCSWorlds || LCSConference ? 	<td rowspan="2" width="14.28%"><PlayoffMatchup season={season} series={series[1][1]} /> </td>   : null}

				  
				  </tr>	  

				  <tr>
				  
				{NALCSWorlds || LCSConference ? 	<td  width="14.28%"></td>  : null}
				{NALCSWorlds || LCSConference ? <td  rowspan="2" width="14.28%"></td> : null}
				{NALCSWorlds || LCSConference ? 	<td  rowspan="4" width="0%" ><PlayoffMatchup season={season} series={series[2][1]} /> </td>   : null}
				  
				  </tr>	  				  
				  
                </tbody>
            </table>
        </div>	 : null}			     
		
		
		
		
		{EULCSWorlds ? <h3 className="hidden-xs" >EU LCS Championship Tournament <span className="pull-right"></span></h3>	 : null}
		
	
      {EULCSWorlds  ?    <div className="table-responsive">
            <table className="table-condensed table-style3" width="100%">
                <tbody>
				  <tr> 
					  {EULCSWorlds  ?  <td> Quarterfinals </td> : null}
					  {EULCSWorlds ?  <td> Semifinals </td> : null}
					  {EULCSWorlds ?  <td> Finals / 3rd Place Game  </td> : null}
				  </tr>				
				
				  <tr> 
				 {EULCSWorlds ?		<td width="14.28%" ></td>  : null}
				  {EULCSWorlds ?	<td rowspan="2" width="14.28%">	<PlayoffMatchup season={season} series={series[1][10]} /> </td> : null}
				  {EULCSWorlds ?	<td rowspan="4" width="0%">  <PlayoffMatchup season={season} series={series[2][9]} /> </td>  : null} 
					
				  </tr> 
  
				  <tr>
				  {EULCSWorlds ?	<td><PlayoffMatchup season={season} series={series[0][12]} /> </td>   : null}
				  </tr>
				  
				  <tr>
				  {EULCSWorlds ?	<td ><PlayoffMatchup season={season} series={series[0][13]} /> </td>  : null} 
				  </tr>
				  
				  <tr>
				  
				 {EULCSWorlds ?	<td width="14.28%" ></td> : null}
				  {EULCSWorlds ?	<td rowspan="2" width="14.28%"><PlayoffMatchup season={season} series={series[1][11]} /> </td>   : null}

				  
				  </tr>	  

				  <tr>
				  
				 {EULCSWorlds ?		<td  width="14.28%"></td>  : null}
				 {EULCSWorlds ?		<td  rowspan="2" width="14.28%"></td> : null}
				 {EULCSWorlds ?	<td  rowspan="4" width="0%" ><PlayoffMatchup season={season} series={series[2][10]} /> </td>   : null}
				  
				  </tr>	  
								  
				  
                </tbody>
            </table>
        </div>		 : null}
		

		{LCKConference ? <h3 className="hidden-xs" >LCK Championship Tournament <span className="pull-right"></span></h3>	 : null}		

	{LCKConference ?	<div className="table-responsive">
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
				{LCKConference ? <td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][7]} /> </td>  : null}
				{LCKConference ?<td rowspan="4" width="14.28%"  > <PlayoffMatchup season={season} series={series[2][6]} /> </td>  : null}
				{LCKConference ? <td rowspan="6" width="0%" > <PlayoffMatchup season={season} series={series[3][1]} /> </td>   : null} 
			  
			  </tr>
			  <tr>
				{LCKConference ?	<td  > <PlayoffMatchup season={season} series={series[0][9]} /> </td>  : null} 
			  </tr>

			  
			</tbody>
		  </table>
		</div>	: null} 	
		

		{LPLConference ? <h3 className="hidden-xs" >LPL Championship Tournament <span className="pull-right"></span></h3>	 : null}		

		{LPLConference  && yearType == 0 ?	<div className="table-responsive">
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
			  
				{LPLConference ? <td width="14.28%" ></td>     : null}	
				{LPLConference ? <td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][8]} /> </td>    : null}	
				{LPLConference ? <td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[2][7]} /> </td>    : null}	
				{LPLConference ? <td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[3][2]} /> </td>    : null}	
			  
			  </tr>
			  <tr>
			{LPLConference ? 	<td  > <PlayoffMatchup season={season} series={series[0][10]} /> </td>   : null}	
		  
			  </tr>
			  <tr>
			{LPLConference ?	<td width="14.28%" ></td>    : null}	
			{LPLConference ?	<td rowspan="2" width="14.28%" ></td>   : null}	
			{LPLConference ?	<td rowspan="2" width="14.28%" ></td>    : null}	
			{LPLConference ? 	<td rowspan="2" width="14.28%" > <PlayoffMatchup season={season} series={series[3][3]} /> </td>    : null}	
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
			{LPLConference ? 	<td  width="14.28%"  > <PlayoffMatchup season={season} series={series[4][0]} /> </td>   : null}	
			{LPLConference ? 	<td rowspan="2"   > <PlayoffMatchup season={season} series={series[5][0]} /> </td>   : null}	
			  </tr>
			  <tr>
			{LPLConference ? 	<td  width="14.28%"  > <PlayoffMatchup season={season} series={series[4][1]} /> </td>   : null}	
			{LPLConference ? 	<td rowspan="2"   > <PlayoffMatchup season={season} series={series[5][1]} /> </td>   : null}	
			  </tr>

			  
			</tbody>
		  </table>
		</div>  : null}	

		{LPLConference  && yearType == 2019 ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			
			  <tr> 
  				{LPLConference ? <td > Round 1 </td>		  	   : null}
				{LPLConference ? <td > Quarterfinals </td>	  	   : null}	  
				{LPLConference ? <td > Semifinals </td>	  	   : null}	  			  
				{LPLConference ? <td > Finals </td>	  	   : null}				
			    
			  </tr>
			  <tr>
			{LPLConference ? 	<td  > <PlayoffMatchup season={season} series={series[0][51]} /> </td>   : null}	
		  
			  </tr>

			  <tr>
			  				{LPLConference ? <td width="14.28%" ></td>     : null}	
			{LPLConference ? 	<td  > <PlayoffMatchup season={season} series={series[1][38]} /> </td>   : null}	
		  
			  </tr>
		  
			  <tr>
				{LPLConference ? <td width="14.28%" ></td>     : null}	
				{LPLConference ? <td width="14.28%" ></td>     : null}					
			{LPLConference ? 	<td  > <PlayoffMatchup season={season} series={series[2][31]} /> </td>   : null}	
		  
			  </tr>			  
	
		  
		  <tr>
			  
				{LPLConference ? <td width="14.28%" ></td>     : null}	
				{LPLConference ? <td width="14.28%" ></td>     : null}	
				{LPLConference ? <td width="14.28%" ></td>     : null}					
			{LPLConference ? 	<td  > <PlayoffMatchup season={season} series={series[3][4]} /> </td>   : null}	
			  
			  </tr>	
		  <tr>
				{LPLConference ? <td width="14.28%" ></td>     : null}	
				{LPLConference ? <td width="14.28%" ></td>     : null}					
			{LPLConference ? 	<td  > <PlayoffMatchup season={season} series={series[2][32]} /> </td>   : null}	
		  
			  </tr>				  
		  <tr>
				{LPLConference ? <td width="14.28%" ></td>     : null}				  
			{LPLConference ? 	<td  > <PlayoffMatchup season={season} series={series[1][39]} /> </td>   : null}	
		  
			  </tr>			  
		  <tr>
			{LPLConference ? 	<td  > <PlayoffMatchup season={season} series={series[0][52]} /> </td>   : null}	
	  
			</tr>					  			
			  
			</tbody>
		  </table>
		</div>  : null}			
		
		{LMSConference ? <h3 className="hidden-xs" >LMS Championship Playoffs <span className="pull-right"></span></h3>	 : null}		

	{LMSConference ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
  				{LMSConference ? <td > Quarterfinals </td>	  	   : null}
				{LMSConference ? <td > Semifinals </td>	  	   : null}	  
				{LMSConference ? <td > Finals </td>	  	   : null}	  			  
			  
			  </tr>
			  <tr>
			  
				<td width="14.28%" ></td> 
			{LMSConference ?	<td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][9]} /> </td> : null}	  
			{LMSConference ?	<td rowspan="4" width="14.28%"  > <PlayoffMatchup season={season} series={series[2][8]} /> </td> : null}	  
			  
			  </tr>
			  <tr>
			{LMSConference ?	<td  > <PlayoffMatchup season={season} series={series[0][11]} /> </td>  : null}	  
			  </tr>

			  
			</tbody>
		  </table>
		</div>	 : null}	  	
	
	{vietnam ? <h3 className="hidden-xs" >Vietnam Championship Playoffs <span className="pull-right"></span></h3>	 : null}		

	{vietnam ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
  				{vietnam ? <td > Quarterfinals </td>	  	   : null}
				{vietnam ? <td > Semifinals </td>	  	   : null}	  
				{vietnam ? <td > Finals </td>	  	   : null}	  			  
			  
			  </tr>
			  <tr>
			  
				<td width="14.28%" ></td> 
			{vietnam ?	<td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][40]} /> </td> : null}	  
			{vietnam ?	<td rowspan="4" width="14.28%"  > <PlayoffMatchup season={season} series={series[2][33]} /> </td> : null}	  
			  
			  </tr>
			  <tr>
			{vietnam ?	<td  > <PlayoffMatchup season={season} series={series[0][53]} /> </td>  : null}	  
			  </tr>

			  
			</tbody>
		  </table>
		</div>	 : null}			
		
			

	{sea ? <h3 className="hidden-xs" >SEA Championship Tournament <span className="pull-right"></span></h3>	 : null}
		
	
      {sea  ?    <div className="table-responsive">
            <table className="table-condensed table-style3" width="100%">
                <tbody>
				  <tr> 
					  {sea  ?  <td> Quarterfinals </td> : null}
					  {sea ?  <td> Semifinals </td> : null}
					  {sea ?  <td> Finals  </td> : null}
				  </tr>				
				
				  <tr> 
				 {sea ?		<td width="14.28%" ></td>  : null}
				  {sea ?	<td rowspan="2" width="14.28%">	<PlayoffMatchup season={season} series={series[1][41]} /> </td> : null}
				  {sea ?	<td rowspan="4" width="0%">  <PlayoffMatchup season={season} series={series[2][35]} /> </td>  : null} 
					
				  </tr> 
  
				  <tr>
				  {sea ?	<td><PlayoffMatchup season={season} series={series[0][54]} /> </td>   : null}
				  </tr>
				  
				  <tr>
				  {sea ?	<td ><PlayoffMatchup season={season} series={series[0][55]} /> </td>  : null} 
				  </tr>
				  
				  <tr>
				  
				 {sea ?	<td width="14.28%" ></td> : null}
				  {sea ?	<td rowspan="2" width="14.28%"><PlayoffMatchup season={season} series={series[1][42]} /> </td>   : null}
				  
				  </tr>	  								  
                </tbody>
            </table>
        </div>		 : null}		
		
	{brazil ? <h3 className="hidden-xs" >Brazil Championship Playoffs<span className="pull-right"></span></h3>	 : null}		
		
		{brazil ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>

			  <tr> 
				{brazil ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{brazil ? <td > Finals </td>	  	   : null}	
				</tr>
			{brazil ?  <tr>
					<td ><PlayoffMatchup season={season} series={series[0][56]} /> </td> 
					<td rowspan="2" ><PlayoffMatchup season={season} series={series[1][50]} /> </td> 				
			  </tr>  : null}
			  
			{brazil ? 	  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][57]} /> </td> 
			  </tr>  : null}
		   </tbody>
		  </table>
		</div>		 : null}

		
	{cis ? <h3 className="hidden-xs" >CIS Championship Playoffs <span className="pull-right"></span></h3>	 : null}		
		
		{cis ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>

		
			  <tr> 
				{cis ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{cis ? <td > Finals </td>	  	   : null}	
				</tr>
			{cis ?  <tr>
					<td ><PlayoffMatchup season={season} series={series[0][58]} /> </td> 
					<td rowspan="2" ><PlayoffMatchup season={season} series={series[1][49]} /> </td> 				
			  </tr>  : null}
			  
			{cis ? 	  <tr>
				<td > <PlayoffMatchup season={season} series={series[0][59]} /> </td> 
			  </tr>  : null}
		   </tbody>
		  </table>
		</div>		 : null}		

		
		
{japan ? <h3 className="hidden-xs" >Japan Championship Playoffs <span className="pull-right"></span></h3>	 : null}		

	{japan ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
  				{japan ? <td > Semifinals </td>	  	   : null}
				{japan ? <td > Finals </td>	  	   : null}	  				
			  
			  </tr>
			  <tr>
			  
				<td width="14.28%" ></td> 
			{japan ?	<td rowspan="1" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][43]} /> </td> : null}	  
			  
			  </tr>
			  <tr>
			{japan ?	<td  > <PlayoffMatchup season={season} series={series[0][60]} /> </td>  : null}	  
			  </tr>

			  
			</tbody>
		  </table>
		</div>	 : null}					
					
	
	{latin ? <h3 className="hidden-xs" >Latin America Championship Tournament <span className="pull-right"></span></h3>	 : null}
		
	
      {latin  ?    <div className="table-responsive">
            <table className="table-condensed table-style3" width="100%">
                <tbody>
				  <tr> 
					  {latin  ?  <td> Quarterfinals </td> : null}
					  {latin ?  <td> Semifinals </td> : null}
					  {latin ?  <td> Finals  </td> : null}
				  </tr>				
				
				  <tr> 
				 {latin ?		<td width="14.28%" ></td>  : null}
				  {latin ?	<td rowspan="2" width="14.28%">	<PlayoffMatchup season={season} series={series[1][44]} /> </td> : null}
				  {latin ?	<td rowspan="4" width="0%">  <PlayoffMatchup season={season} series={series[2][36]} /> </td>  : null} 
					
				  </tr> 
  
				  <tr>
				  {latin ?	<td><PlayoffMatchup season={season} series={series[0][61]} /> </td>   : null}
				  </tr>
				  
				  <tr>
				  {latin ?	<td ><PlayoffMatchup season={season} series={series[0][62]} /> </td>  : null} 
				  </tr>
				  
				  <tr>
				  
				 {latin ?	<td width="14.28%" ></td> : null}
				  {latin ?	<td rowspan="2" width="14.28%"><PlayoffMatchup season={season} series={series[1][45]} /> </td>   : null}
				  
				  </tr>	  								  
                </tbody>
            </table>
        </div>		 : null}						
	
	{oce ? <h3 className="hidden-xs" >OCE Championship Tournament <span className="pull-right"></span></h3>	 : null}		

	{oce ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
  				{oce ? <td > Wild Card  </td>		  	   : null}
				{oce ? <td > Quarterfinals </td>	  	   : null}	  
				{oce ? <td > Semifinals </td>	  	   : null}	  			  
				{oce ? <td > Finals </td>	  	   : null}	
			  
			  </tr>
			  <tr>
			  
				<td width="14.28%" ></td> 
				{oce ? <td rowspan="2" width="14.28%"  > <PlayoffMatchup season={season} series={series[1][46]} /> </td>  : null}
				{oce ?<td rowspan="4" width="14.28%"  > <PlayoffMatchup season={season} series={series[2][34]} /> </td>  : null}
				{oce ? <td rowspan="6" width="0%" > <PlayoffMatchup season={season} series={series[3][11]} /> </td>   : null} 
			  
			  </tr>
			  <tr>
				{oce ?	<td  > <PlayoffMatchup season={season} series={series[0][63]} /> </td>  : null} 
			  </tr>

			  
			</tbody>
		  </table>
		</div>	: null} 						
					
						
{turkey ? <h3 className="hidden-xs" >Turkey Championship Tournament <span className="pull-right"></span></h3>	 : null}
		
	
      {turkey  ?    <div className="table-responsive">
            <table className="table-condensed table-style3" width="100%">
                <tbody>
				  <tr> 
					  {turkey  ?  <td> Quarterfinals </td> : null}
					  {turkey ?  <td> Semifinals </td> : null}
					  {turkey ?  <td> Finals  </td> : null}
				  </tr>				
				
				  <tr> 
				 {turkey ?		<td width="14.28%" ></td>  : null}
				  {turkey ?	<td rowspan="2" width="14.28%">	<PlayoffMatchup season={season} series={series[1][47]} /> </td> : null}
				  {turkey ?	<td rowspan="4" width="0%">  <PlayoffMatchup season={season} series={series[2][37]} /> </td>  : null} 
					
				  </tr> 
  
				  <tr>
				  {turkey ?	<td><PlayoffMatchup season={season} series={series[0][64]} /> </td>   : null}
				  </tr>
				  
				  <tr>
				  {turkey ?	<td ><PlayoffMatchup season={season} series={series[0][65]} /> </td>  : null} 
				  </tr>
				  
				  <tr>
				  
				 {turkey ?	<td width="14.28%" ></td> : null}
				  {turkey ?	<td rowspan="2" width="14.28%"><PlayoffMatchup season={season} series={series[1][48]} /> </td>   : null}
				  
				  </tr>	  								  
                </tbody>
            </table>
        </div>		 : null}							
		
		{WorldsRegionals ? <h3 className="hidden-xs" >Worlds - Regional Finals <span className="pull-right"></span></h3>	 : null}		
		
		{WorldsRegionals ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>

				<tr> 				
				{WorldsRegionals ? <h4 className="hidden-xs" >NA - Regional Finals  <span className="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
				{WorldsRegionals ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{WorldsRegionals ? <td > Finals </td>	  	   : null}	
				</tr>
			{WorldsRegionals ?  <tr>
					<td ><PlayoffMatchup season={season} series={series[6][0]} /> </td> 
					<td rowspan="2" ><PlayoffMatchup season={season} series={series[7][0]} /> </td> 				
			  </tr>  : null}
			  
			{WorldsRegionals ? 	  <tr>
				<td > <PlayoffMatchup season={season} series={series[6][1]} /> </td> 
			  </tr>  : null}
		   </tbody>
		  </table>
		</div>		 : null}

		
		{WorldsRegionals ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>

				<tr> 				
				{WorldsRegionals ? <h4 className="hidden-xs" >EU - Regional Finals <span className="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
				{WorldsRegionals ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{WorldsRegionals ? <td > Finals </td>	  	   : null}	  </tr>
				{WorldsRegionals ? <tr>
					<td ><PlayoffMatchup season={season} series={series[6][2]} /> </td> 
					<td rowspan="2" ><PlayoffMatchup season={season} series={series[7][1]} /> </td> 				
			  </tr> : null}	
			  
			 	{WorldsRegionals ? <tr>
				<td > <PlayoffMatchup season={season} series={series[6][3]} /> </td> 
			  </tr> : null}	
		   </tbody>
		  </table>
		</div>		 : null}	
				

	{WorldsRegionals ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
				<tr> 
				{WorldsRegionals ? <h4 className="hidden-xs" >LCK - Regional Finals <span className="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
					{WorldsRegionals ? <td width="14.28%"> Semifinals </td>	  	   : null}
					{WorldsRegionals ? <td > Finals </td>	  	   : null}
			  </tr>
			{WorldsRegionals ? <tr>
					<td ><PlayoffMatchup season={season} series={series[6][4]} /> </td> 
					<td rowspan="2" ><PlayoffMatchup season={season} series={series[7][2]} /> </td> 				
			  </tr> : null}
			  
			{WorldsRegionals ?  <tr>
					<td ><PlayoffMatchupStore season={season} series={series[6][5]} /> </td> 
			  </tr> : null}
		   </tbody>
		  </table>
		</div> : null}
		
		
		
		{WorldsRegionals ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
				{WorldsRegionals ? <h4 className="hidden-xs" >LPL - Regional Finals <span className="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
				{WorldsRegionals ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{WorldsRegionals ? <td > Finals </td>	  	   : null}
			  
			  </tr>
			{WorldsRegionals ? <tr>
				<td ><PlayoffMatchup season={season} series={series[6][6]} /> </td> 
				<td rowspan="2" ><PlayoffMatchup season={season} series={series[7][3]} /> </td> 
				
			  </tr>   : null}
			  
			{WorldsRegionals ?   <tr>
					<td ><PlayoffMatchup season={season} series={series[6][7]} /> </td> 			  
			  </tr> : null}
		   </tbody>
		  </table>
		</div>		 : null}
		
		

		
	{WorldsRegionals && !worlds2019 ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
				<tr> 
		{WorldsRegionals && !worlds2019 ? <h4 className="hidden-xs" >WC - Regional Finals <span className="pull-right"></span></h4>	 : null}
			  </tr>
			  <tr> 
				{WorldsRegionals && !worlds2019 ? <td width="14.28%"> Semifinals </td>	  	   : null}
				{WorldsRegionals && !worlds2019 ? <td > Finals </td>	  	   : null}
			  
			  </tr>
				{WorldsRegionals && !worlds2019 ?  <tr>
				<td ><PlayoffMatchup season={season} series={series[0][14]} /> </td> 
				<td rowspan="2" ><PlayoffMatchup season={season} series={series[1][12]} /> </td> 
			  </tr>: null}
			  
				{WorldsRegionals && !worlds2019 ?   <tr>
				<td ><PlayoffMatchup season={season} series={series[0][15]} /> </td> 
			  </tr>	  : null}
				  
			</tbody>
		  </table>
		</div>		 : null}
		


				
		{WorldsGroups && !groups1 ? <h3 className="hidden-xs" >Worlds - Groups  <span className="pull-right"></span></h3>	 : null}
		{groups1 ? <h3 className="hidden-xs" >Worlds - Groups (Stage 1)  <span className="pull-right"></span></h3>	 : null}


	{WorldsGroups ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
				{WorldsGroups ? <h4 className="hidden-xs" >Group A <span className="pull-right"></span></h4>	 : null}
			</tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][0]} /> </td> 
					<td ><PlayoffMatchupGroups season={season} series={series[8][1]} /> </td> 
			  </tr>	  
			  <tr>
			  </tr>	  

			</tbody>
		  </table>
		</div>	 : null}	
		
		
		{WorldsGroups ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					{WorldsGroups ? <h4 className="hidden-xs" >Group B <span className="pull-right"></span></h4>	 : null}
			 </tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][2]} /> </td>
					<td  ><PlayoffMatchupGroups season={season} series={series[8][3]} /> </td>   					
			  </tr>	  
			  <tr>
			  </tr>	  

			</tbody>
		  </table>
		</div>		: null}
						
		
		{WorldsGroups ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
				{WorldsGroups ? <h4 className="hidden-xs" >Group C <span className="pull-right"></span></h4>	 : null}
			  </tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][4]} /> </td>
					<td ><PlayoffMatchupGroups season={season} series={series[8][5]} /> </td>   
			  </tr>	  
			  <tr>
					
			  </tr>	  

			</tbody>
		  </table>
		</div>: null}
		

		{WorldsGroups ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
				{WorldsGroups ? <h4 className="hidden-xs" >Group D <span className="pull-right"></span></h4>	 : null}
			</tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[8][6]} /> </td>  
					<td  ><PlayoffMatchupGroups season={season} series={series[8][7]} /> </td>   
			  </tr>	  
			  <tr>
					
			  </tr>	  

			</tbody>
		  </table>
		</div>	 : null}

		{WorldsPlayoff && !playoff1 ? <h3 className="hidden-xs" >Worlds - Playoffs  <span className="pull-right"></span></h3>	 : null}
		{playoff1 ? <h3 className="hidden-xs" >Worlds - Play-In (Stage 1)  <span className="pull-right"></span></h3>	 : null}
		{WorldsPlayoff ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  {WorldsPlayoff && !playoff1 ? <td width="14.28%"> Quarterfinals </td>	  	   : null}
			  {WorldsPlayoff && !playoff1 ? <td width="14.28%"> Semifinals </td>	  	   : null}
			  {WorldsPlayoff && !playoff1 ? <td width="14.28%"> Finals </td>	  	   : null}

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
		</div> : null}
	
	{groups2 ? <h3 className="hidden-xs" >Worlds - Groups (Stage 2)  <span className="pull-right"></span></h3>	 : null}


	{groups2 ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
				{groups2 ? <h4 className="hidden-xs" >Group A <span className="pull-right"></span></h4>	 : null}
			</tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[12][0]} /> </td> 
					<td ><PlayoffMatchupGroups season={season} series={series[12][1]} /> </td> 
			  </tr>	  
			  <tr>
			  </tr>	  

			</tbody>
		  </table>
		</div>	 : null}	
		
		
		{groups2 ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					{groups2 ? <h4 className="hidden-xs" >Group B <span className="pull-right"></span></h4>	 : null}
			 </tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[12][2]} /> </td>
					<td  ><PlayoffMatchupGroups season={season} series={series[12][3]} /> </td>   					
			  </tr>	  
			  <tr>
			  </tr>	  

			</tbody>
		  </table>
		</div>		: null}
						
		
		{groups2 ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
				{groups2 ? <h4 className="hidden-xs" >Group C <span className="pull-right"></span></h4>	 : null}
			  </tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[12][4]} /> </td>
					<td ><PlayoffMatchupGroups season={season} series={series[12][5]} /> </td>   
			  </tr>	  
			  <tr>
					
			  </tr>	  

			</tbody>
		  </table>
		</div>: null}
		

		{groups2 ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
				{groups2 ? <h4 className="hidden-xs" >Group D <span className="pull-right"></span></h4>	 : null}
			</tr>	  
			  <tr>
					<td width="14.28%" ><PlayoffMatchupGroups season={season} series={series[12][6]} /> </td>  
					<td  ><PlayoffMatchupGroups season={season} series={series[12][7]} /> </td>   
			  </tr>	  
			  <tr>
					
			  </tr>	  

			</tbody>
		  </table>
		</div>	 : null}
	
		{playoff2 ? <h3 className="hidden-xs" >Worlds - Playoffs (Stage 2)  <span className="pull-right"></span></h3>	 : null}
		{playoff2 ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  {playoff2 ? <td width="14.28%"> Quarterfinals </td>	  	   : null}
			  {playoff2 ? <td width="14.28%"> Semifinals </td>	  	   : null}
			  {playoff2 ? <td width="14.28%"> Finals </td>	  	   : null}

			  <tr>
				<td width="14.28%" ><PlayoffMatchup season={season} series={series[13][0]} /> </td>  
				<td width="14.28%" rowspan="2" ><PlayoffMatchup season={season} series={series[14][0]} /> </td> 
				<td rowspan="4" ><PlayoffMatchup season={season} series={series[15][0]} /> </td> 
			  </tr>	  
			  <tr>
				<td ><PlayoffMatchup season={season} series={series[13][1]} /> </td>   
			  </tr>	  
			  <tr>
				<td width="14.28%"  ><PlayoffMatchup season={season} series={series[13][2]} /> </td>  
				<td rowspan="2" ><PlayoffMatchup season={season} series={series[14][1]} /> </td>   
			  </tr>	  
			  <tr>
				<td ><PlayoffMatchup season={season} series={series[13][3]} /> </td>   
			  </tr>	  
			  
			</tbody>
		  </table>
		</div> : null}		

		
		
		{LCSExtended ?  <a name="NA"></a> : null} 
		{LCSExtended ? <a href="#Return">Return to top.</a>	: null}		
		
		{naLadder ? <h3 className="hidden-xs" >LCS Promotion Games <span className="pull-right"></span></h3>	 : null}		

		{naLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					{naLadder ? <td > Qualifiers</td>	  	   : null}			  

			  </tr>
			  <tr> 
					{naLadder ? <td width="14.28%" >  First Round </td>	  	   : null}			  
					{naLadder ? <td > Finals / 3rd Place Match</td>	  	   : null}			  
			  
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
					{naLadder ? <td > Promotion Games</td>	  	   : null}			  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][2]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][3]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>		  : null}	

		
		{naLadder ? <h3 className="hidden-xs" >CS Promotion Games - Bracket A <span className="pull-right"></span></h3>	 : null}		

	{naLadder ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				{naLadder ? <td > Round 1 </td>	  	   : null}
				{naLadder ? <td > Round 2 </td>	  	   : null}	  
				{naLadder ? <td > Finals </td>	  	   : null}	  
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
		</div>		   : null}	
				
		
		{naLadder ? <h3 className="hidden-xs" >CS Promotion Games - Bracket B  <span className="pull-right"></span></h3>	 : null}		

	{naLadder ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				{naLadder ? <td > Round 1 </td>	  	   : null}
				{naLadder ? <td > Round 2 </td>	  	   : null}	  
				{naLadder ? <td > Finals </td>	  	   : null}	  
			  

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
		</div>		 : null}	 
		
				

		
		
		{naLadder ? <h3 className="hidden-xs" >CS Promotion Games - Third Place Match<span className="pull-right"></span></h3>	 : null}		

	{naLadder ? 	<div className="table-responsive">
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

		{euLadder ? 	<div className="table-responsive">
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
					{LadderExtended ? <td > Promotion Games</td>	  	   : null}			  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][11]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][12]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>	 : null}		

		
		{euLadder ? <h3 className="hidden-xs" >EU CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

		{euLadder ? <div className="table-responsive">
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
		</div>	   : null}	  	
				
		
		{euLadder ? <h3 className="hidden-xs" >EU CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

	{euLadder ?	<div className="table-responsive">
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
		</div>	  : null}			
		
		
		{LadderExtended ?  <a name="LCK"></a> : null}
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}		

		
		{lckLadder ? <h3 className="hidden-xs" >LCK Promotion Games <span class="pull-right"></span></h3>	 : null}		

			{lckLadder ?  <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					{lckLadder ? <td > Qualifiers</td>	  	   : null}			  

			  </tr>
			  <tr> 
					{lckLadder ? <td width="14.28%" >  First Round </td>	  	   : null}			  
					{lckLadder ? <td > Finals / 3rd Place Match</td>	  	   : null}			  
			  
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
					{lckLadder ? <td > Promotion Games</td>	  	   : null}			  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][15]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][16]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>		: null}

		
		{lckLadder ? <h3 className="hidden-xs" >Korea CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

		{lckLadder ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				{lckLadder ? <td > Round 1 </td>	  	   : null}
				{lckLadder ? <td > Round 2 </td>	  	   : null}	  
				{lckLadder ? <td > Finals </td>	  	   : null}	  
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
		</div>	  : null}		
				
		
		{lckLadder ? <h3 className="hidden-xs" >Korea CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

	{lckLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				{lckLadder ? <td > Round 1 </td>	  	   : null}
				{LadderExtendedMax ? <td > Round 2 </td>	  	   : null}	  
				{lckLadder ? <td > Finals </td>	  	   : null}	  
			  

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
		


		
		{LadderExtended ?  <a name="LPL"></a> : null}
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}		
		
		{lplLadder ? <h3 className="hidden-xs" >LPL Promotion Games <span class="pull-right"></span></h3>	 : null}		

		{lplLadder ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					{lplLadder ? <td > Qualifiers</td>	  	   : null}			  

			  </tr>
			  <tr> 
					{lplLadder ? <td width="14.28%" >  First Round </td>	  	   : null}			  
					{lplLadder ? <td > Finals / 3rd Place Match</td>	  	   : null}			  
			  
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
					{lplLadder ? <td > Promotion Games</td>	  	   : null}			  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][19]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][20]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>		   : null}	

		
		{lplLadder ? <h3 className="hidden-xs" >China CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

	{lplLadder ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				{lplLadder ? <td > Round 1 </td>	  	   : null}
				{lplLadder ? <td > Round 2 </td>	  	   : null}	  
				{lplLadder ? <td > Finals </td>	  	   : null}	  
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
			  
				{lplLadder ? <td > Round 1 </td>	  	   : null}
				{LadderExtendedMax ? <td > Round 2 </td>	  	   : null}	  
				{lplLadder ? <td > Finals </td>	  	   : null}	  
			  

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
		</div>	  : null}			
		


		{LadderExtended ?  <a name="LMS"></a> : null}
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}				
		
		{lmsLadder ? <h3 className="hidden-xs" >LMS Promotion Games <span class="pull-right"></span></h3>	 : null}		

	{lmsLadder ?	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					{lmsLadder ? <td > Qualifiers</td>	  	   : null}			  

			  </tr>
			  <tr> 
					{lmsLadder ? <td width="14.28%" >  First Round </td>	  	   : null}			  
					{lmsLadder ? <td > Finals / 3rd Place Match</td>	  	   : null}			  
			  
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
					{lmsLadder ? <td > Promotion Games</td>	  	   : null}			  
			  </tr>

			  <tr   >
			  <td   > <PlayoffMatchup season={season} series={series[2][23]} /> </td>  

			  </tr>
			  <tr  >
				<td   > <PlayoffMatchup season={season} series={series[2][24]} /> </td>
				
			  </tr>
			  
			</tbody>
		  </table>
		</div>	: null}	

		
		{lmsLadder ? <h3 className="hidden-xs" >Taiwan CS Promotion Games - Bracket A <span class="pull-right"></span></h3>	 : null}		

		{lmsLadder ? <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				{lmsLadder ? <td > Round 1 </td>	  	   : null}
				{lmsLadder ? <td > Round 2 </td>	  	   : null}	  
				{lmsLadder ? <td > Finals </td>	  	   : null}	  
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
		</div>	 : null}	
				
		
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
		</div>	 : null}	 		
		
		{LadderExtended ?  <a name="WC"></a> : null}
		{LadderExtended ? <a href="#Return">Return to top.</a> : null}				

		
		{wcLadder ? <h3 className="hidden-xs" >Wild Card Promotion Games <span class="pull-right"></span></h3>	 : null}		

	{wcLadder ? 	<div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
					{wcLadder ? <td > Qualifiers</td>	  	   : null}			  

			  </tr>
			  <tr> 
					{wcLadder ? <td width="14.28%" >  First Round </td>	  	   : null}			  
					{wcLadder ? <td > Finals / 3rd Place Match</td>	  	   : null}			  
			  
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
					{wcLadder ? <td > Promotion Games</td>	  	   : null}			  
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

		{wcLadder ? <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
 
  				{wcLadder ? <td > Round 1 </td>	  	   : null}
				{wcLadder ? <td > Round 2 </td>	  	   : null}	  
				{wcLadder ? <td > Finals </td>	  	   : null}	  
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
		</div>	 : null}	  	
				
		

		
		{wcLadder ? <h3 className="hidden-xs" >Wild Card CS Promotion Games - Bracket B  <span class="pull-right"></span></h3>	 : null}		

			{wcLadder ?  <div className="table-responsive">
		  <table className="table-condensed table-style3" width="100%">
			<tbody>
			  <tr> 
			  
				{wcLadder ? <td > Round 1 </td>	  	   : null}
				{LadderExtendedMax ? <td > Round 2 </td>	  	   : null}	  
				{wcLadder ? <td > Finals </td>	  	   : null}	  
			  

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
		</div>	 : null}			

		
    </div>;
};

Playoffs.propTypes = {
    confNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
		NAConference: React.PropTypes.bool.isRequired,
		EUConference: React.PropTypes.bool.isRequired,
		LCSConference: React.PropTypes.bool.isRequired,
		LCSExtended: React.PropTypes.bool.isRequired,
		LCKConference: React.PropTypes.bool.isRequired,
		LPLConference: React.PropTypes.bool.isRequired,
		LMSConference: React.PropTypes.bool.isRequired,
		WorldsPlayoff: React.PropTypes.bool.isRequired,
		WorldsRegionals: React.PropTypes.bool.isRequired,
		WorldsGroups: React.PropTypes.bool.isRequired,	
		WorldsSpring: React.PropTypes.bool.isRequired,
		WorldsSummer: React.PropTypes.bool.isRequired,
		LadderExtended: React.PropTypes.bool.isRequired,
		LadderExtendedMax: React.PropTypes.bool.isRequired,		
		NALCSWorlds: React.PropTypes.bool.isRequired,
		EULCSWorlds: React.PropTypes.bool.isRequired,		
		naLadder: React.PropTypes.bool.isRequired,	
		euLadder: React.PropTypes.bool.isRequired,	
		lckLadder: React.PropTypes.bool.isRequired,	
		lplLadder: React.PropTypes.bool.isRequired,	
		lmsLadder: React.PropTypes.bool.isRequired,	
		wcLadder: React.PropTypes.bool.isRequired,			
		worlds2019: React.PropTypes.bool.isRequired,	
		vietnam: React.PropTypes.bool.isRequired,	
		sea: React.PropTypes.bool.isRequired,	
		brazil: React.PropTypes.bool.isRequired,	
		cis: React.PropTypes.bool.isRequired,	
		japan: React.PropTypes.bool.isRequired,	
		latin: React.PropTypes.bool.isRequired,	
		oce: React.PropTypes.bool.isRequired,	
		turkey: React.PropTypes.bool.isRequired,	
		groups1: React.PropTypes.bool.isRequired,	
		playoff1: React.PropTypes.bool.isRequired,	
		groups2: React.PropTypes.bool.isRequired,	
		playoff2: React.PropTypes.bool.isRequired,			
    finalMatchups: React.PropTypes.bool.isRequired,
  //  matchups: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
  //  numPlayoffRounds: React.PropTypes.number.isRequired,
    season: React.PropTypes.number.isRequired,
    series: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
    gameType: React.PropTypes.number.isRequired,
    yearType: React.PropTypes.number.isRequired,	
	playoffsTypeSummer: React.PropTypes.string.isRequired
};

export default Playoffs;
