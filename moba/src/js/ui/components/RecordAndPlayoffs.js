// @flow

import React from 'react';
import {helpers,g} from '../../common';

const RecordAndPlayoffs = ({abbrev, lostSpring, lost, levelStart,levelMid, option, playoffRoundsWon,playoffRoundsWonWorldsGr, season, style, wonSpring, won}: {
    abbrev: string,
    lost: number,
    lostSpring: number,
    levelStartFull: string,
    levelMidFull: string,
    option?: 'noSeason',
    playoffRoundsWon?: number,
	playoffRoundsWonWorldsGr?: number,
    season: number,
    style: {[key: string]: string},
    wonSpring: number,
    won: number,
}) => {
    const seasonText = option !== 'noSeason' ? <span><a href={helpers.leagueUrl(["roster", abbrev, season])}>{season}</a>: </span> : null;
	var recordText;
	if (g.gameType == 7) {
		recordText = <a href={helpers.leagueUrl(["standings", season])}>{wonSpring}-{lostSpring},&nbsp;{levelStart},&nbsp;{won}-{lost},&nbsp;{levelMid}</a>;
	} else if (g.gameType == 6) {
		recordText = <a href={helpers.leagueUrl(["standings", season])}>{wonSpring}-{lostSpring},&nbsp;&nbsp;{won}-{lost}&nbsp;</a>;
	} else {
		recordText = <a href={helpers.leagueUrl(["standings", season])}>{won}-{lost}</a>;
	}
    const extraText = playoffRoundsWon !== undefined && (playoffRoundsWon >= 0 || playoffRoundsWonWorldsGr>=0)? <span>, <a href={helpers.leagueUrl(["playoffs", season])}>{helpers.roundsWonText(playoffRoundsWon,playoffRoundsWonWorldsGr).toLowerCase()}</a></span> : null;

    return <span style={style}>
        {seasonText}
        {recordText}
        {extraText}
    </span>;
};

RecordAndPlayoffs.propTypes = {
    abbrev: React.PropTypes.string.isRequired,
    lost: React.PropTypes.number.isRequired,
    option: React.PropTypes.oneOf(['noSeason']),
    playoffRoundsWon: React.PropTypes.number,
    season: React.PropTypes.number.isRequired,
    style: React.PropTypes.object,
    won: React.PropTypes.number.isRequired,
};

export default RecordAndPlayoffs;
