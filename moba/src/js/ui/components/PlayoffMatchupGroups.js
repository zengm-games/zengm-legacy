// @flow

import React from 'react';
import {g, helpers} from '../../common';

type SeriesTeam = {
    seed: number,
    tid: number,
    won?: number,
};

const PlayoffMatchupGroups = ({season, series}: {
    season: number,
    series?: {
        away: SeriesTeam,
        home: SeriesTeam,
    },
}) => {
    if (series === null || series === undefined || series.home === undefined || series.home.tid === undefined) {
        return null;
    }

//    const homeWon = series.home.hasOwnProperty("won") && series.home.won >= 4;
    //const awayWon = series.away.hasOwnProperty("won") && series.away.won >= 4;
    const homeWon = series.home.hasOwnProperty("won") && series.home.won >= 20;
    const awayWon = series.away.hasOwnProperty("won") && series.away.won >= 20;

	if (series.away.placement === series.home.placement ) {
			return <div>
				<span className={series.home.tid === g.userTid ? 'bg-info' : ''} style={{fontWeight: homeWon ? 'bold' : 'normal'}}>
					{series.home.placement}. <a href={helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid], season])}>{g.teamNamesCache[series.home.tid]}</a>
					{series.home.hasOwnProperty("won") ? <span> {series.home.won}</span> : null }
				</span>
				<br />

			</div>;		


	} else {
		return <div>
			<span className={series.home.tid === g.userTid ? 'bg-info' : ''} style={{fontWeight: homeWon ? 'bold' : 'normal'}}>
				{series.home.placement}. <a href={helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.home.tid], season])}>{g.teamNamesCache[series.home.tid]}</a>
				{series.home.hasOwnProperty("won") ? <span> {series.home.won}</span> : null }
			</span>
			<br />

			<span className={series.away.tid === g.userTid ? 'bg-info' : ''} style={{fontWeight: awayWon ? 'bold' : 'normal'}}>
				{series.away.placement}. <a href={helpers.leagueUrl(["roster", g.teamAbbrevsCache[series.away.tid], season])}>{g.teamNamesCache[series.away.tid]}</a>
				{series.away.hasOwnProperty("won") ? <span> {series.away.won}</span> : null }
			</span>
			
		</div>;
	}
		
};

PlayoffMatchupGroups.propTypes = {
    season: React.PropTypes.number.isRequired,
    series: React.PropTypes.shape({
        away: React.PropTypes.shape({
            seed: React.PropTypes.number.isRequired,
            tid: React.PropTypes.number.isRequired,
            won: React.PropTypes.number,
        }),
        home: React.PropTypes.shape({
            seed: React.PropTypes.number.isRequired,
            tid: React.PropTypes.number.isRequired,
            won: React.PropTypes.number,
        }),
    }),
};




export default PlayoffMatchupGroups;
