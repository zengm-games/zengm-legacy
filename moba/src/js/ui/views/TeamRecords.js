import React from 'react';
import {helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, Dropdown, NewWindowLink} from '../components';

const teamLink = (t) => {
	//if (typeof t !== object) {
		///return <a href={helpers.leagueUrl(['team_history', t.abbrev])}>{t.region} {t.name}</a>;
	//} else {
		return <a href={helpers.leagueUrl(['team_history', t.abbrev])}>{t.region}</a>;
	//}
};

const TeamRecords = ({byType, displayName, seasonCount, teamRecords, gameType}) => {
    setTitle('Team Records');

	let cols;
	if (gameType>=5) {
		cols = getCols(displayName, 'W', 'L', '%', 'Worlds', 'Last Worlds', 'Finals', 'Championships', 'Last Title', 'MVP',  'BR', 'BRC',  'ALT',  'RChamp',  'RMVP',  'RALT', 'Region', 'League');		
	} else {
		cols = getCols(displayName, 'W', 'L', '%', 'Playoffs', 'Last Playoffs', 'Finals', 'Championships', 'Last Title', 'MVP',  'BR', 'BRC',  'ALT',  'RChamp',  'RMVP',  'RALT', 'Region', 'League');
	}
    // MVP, DPOY, SMOY, ROY
    for (let i = 9; i <= 12; i++) {
        cols[i].sortSequence = ['desc', 'asc'];
        cols[i].sortType = 'number';
    }

    const rows = teamRecords.map(tr => {
        return {
            key: tr.id,
            data: [
                byType === "team" ? teamLink(tr.team) : tr.team,
                tr.won,
                tr.lost,
                tr.winp,
                tr.playoffAppearances,
                tr.lastPlayoffAppearance,
                tr.finals,
                tr.championships,
                tr.lastChampionship,
                tr.mvp,
                tr.bestRecord,
                tr.bestRecordConf,
                tr.allLeague,
                tr.regionChampionships,				
                tr.regionMVP,				
                tr.regionAllLeague,	
				tr.country,				
				tr.teamConf,
            ],
        };
    });

    return <div>
        <Dropdown view="team_records" fields={["teamRecordType"]} values={[byType]} />
        <h1>Team Records <NewWindowLink /></h1>

        <p>More: <a href={helpers.leagueUrl(['history_all'])}>League History</a> | <a href={helpers.leagueUrl(['history_all_MSI'])}>MSI History</a> | <a href={helpers.leagueUrl(['awards_records'])}>Awards Records</a></p>

        <p>Totals over {seasonCount} seasons played.</p>

        <DataTable
            cols={cols}
            defaultSort={[0, 'asc']}
            name="TeamRecords"
            rows={rows}
        />
    </div>;
};

TeamRecords.propTypes = {
    byType: React.PropTypes.oneOf(['conf', 'div', 'team']).isRequired,
    displayName: React.PropTypes.string.isRequired,
    seasonCount: React.PropTypes.number.isRequired,
    teamRecords: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    gameType: React.PropTypes.number.isRequired,	
};

export default TeamRecords;
