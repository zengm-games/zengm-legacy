import React from 'react';
import _ from 'underscore';
import {g, helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, Dropdown, JumpTo, NewWindowLink} from '../components';

const TeamStats = ({season, stats, teams}) => {
    setTitle(`League Finances - ${season}`);

  	
    //const cols = getCols('Team', 'GP', 'W', 'L', 'W', 'L');
const cols = getCols('Team', 'Avg Stream', 'Revenue (YTD)', 'Profit (YTD)', 'Cash', 'Payroll');
 //   const teamCount = teams.length;
    const rows = teams.map((t) => {

		const payroll = season === g.season ? t.seasonAttrs.payroll : t.seasonAttrs.salaryPaid;
        // Create the cells for this row.
        const data = {
                 /*<a href={helpers.leagueUrl(["team_finances", t.abbrev])}>{t.region} {t.name}</a>,
                 helpers.numberWithCommas(Math.round(t.seasonAttrs.att)),
                helpers.formatCurrency(t.seasonAttrs.revenue, "K"),
                helpers.formatCurrency(t.seasonAttrs.profit, "K"),
                helpers.formatCurrency(t.seasonAttrs.cash, "K"),
                helpers.formatCurrency(payroll, "K"),			*/
			name: <a href={helpers.leagueUrl(["team_finances", t.abbrev])}>{t.region}</a>,
            att: helpers.numberWithCommas(Math.round(t.seasonAttrs.att)),
            revenue: helpers.formatCurrency(t.seasonAttrs.revenue, "K"),
            profit: helpers.formatCurrency(t.seasonAttrs.profit, "K"),
            cash: helpers.formatCurrency(t.seasonAttrs.cash, "K"),
            payroll: helpers.formatCurrency(payroll, "K"),		
      //      gp: helpers.numberWithCommas(Math.round(t.seasonAttrs.att)),
      //      gp: helpers.numberWithCommas(Math.round(t.seasonAttrs.att)),
			
          //  abbrev: <a href={helpers.leagueUrl(["roster", t.abbrev, season])}>{t.abbrev}</a>,
           // gp: t.stats.gp,
            //won: t.seasonAttrs.won,
            //lost: t.seasonAttrs.lost,
        };


        return {
            key: t.tid,
            data: _.values(data),
        };
    });

    function legendSquare(className) {
        const styles = {
            bottom: '-2.5px',
            display: 'inline-block',
            height: '15px',
            margin: '0 2.5px 0 10px',
            position: 'relative',
            width: '15px',
        };

        return <span className={`bg-${className}`} style={styles} />;
    }

    return <div>
        <Dropdown view="league_finances" fields={["seasons"]} values={[season]} />
        <JumpTo season={season} />
        <h1>League Finances <NewWindowLink /></h1>

        <DataTable
            cols={cols}
            defaultSort={[2, 'desc']}
            name="TeamStats"
            rows={rows}
       //     superCols={superCols}
        />
    </div>;
};

TeamStats.propTypes = {
    season: React.PropTypes.number.isRequired,
    stats: React.PropTypes.object.isRequired,
    teams: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

export default TeamStats;
