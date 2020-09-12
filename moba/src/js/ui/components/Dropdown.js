// @flow

import React from 'react';
import {PHASE, g, helpers} from '../../common';
//import {toWorker} from '../util';
import {realtimeUpdate} from '../util';

const Select = ({field, handleChange, value}) => {
    let options: {
        key: number | string,
        val: number | string,
    }[];

	if (field === "champion") {
        options = [];
	    let sortedChamps = helpers.deepCopy(g.cCache);
		//sortedChamps.sort((a, b) => a.name - b.name);
	//	let sortedChamps = toWorker('sortChampions');
       for (let j = 0; j < sortedChamps.length; j++) {
			for (let jj = j; jj < sortedChamps.length; jj++) {
				if (sortedChamps[jj].name < sortedChamps[j].name) {
					let temp = helpers.deepCopy(sortedChamps[j]);
					sortedChamps[j] = helpers.deepCopy(sortedChamps[jj]);
					sortedChamps[jj] = helpers.deepCopy(temp);
				}
			}
		}
        for (let j = 0; j < sortedChamps.length; j++) {
            options[j] = {
                key: sortedChamps[j].name,
//                val: `${sortedChamps[j].name}`,
                val: `${sortedChamps[j].name}`,
           //     val: `tset`,
            };
        }
    } else if (field === "teamsConferences") {
      options = [{
          val: "Teams",
          key: "teams",
      }, {
          val: "Conferences",
          key: "conferences",
      }];
    } else if (field === "teams") {
        options = [];
        for (let j = 0; j < g.numTeams; j++) {
            options[j] = {
                key: g.teamAbbrevsCache[j],
                val: `${g.teamRegionsCache[j]} `,
            };
        }
    } else if (field === "teamsAndAll") {
        options = [{
            key: "all",
            val: "All Teams",
        }];
        for (let j = 0; j < g.numTeams; j++) {
            options[j + 1] = {
                key: g.teamAbbrevsCache[j],
                val: `${g.teamRegionsCache[j]} `,
            };
        }
    } else if (field === "teamsAndAllWatch") {
        options = [{
            key: "all",
            val: "All Teams",
        }, {
            key: "watch",
            val: "Watch List",
        }];
        for (let j = 0; j < g.numTeams; j++) {
            options[j + 2] = {
                key: g.teamAbbrevsCache[j],
                val: `${g.teamRegionsCache[j]}`,
            };
        }
    } else if (field === "seasons" || field === "seasonsAndCareer" || field === "seasonsAndAll") {
        options = [];
        for (let season = g.startingSeason; season <= g.season; season++) {
            options.push({
                key: season,
                val: `${season} Season`,
            });
        }
        if (field === "seasonsAndCareer") {
            options.unshift({
                key: "career",
                val: "Career Totals",
            });
        }
        if (field === "seasonsAndAll") {
            options.unshift({
                key: "all",
                val: "All Seasons",
            });
        }
    } else if (field === "seasonsUpcoming") {
        options = [];
        // For upcomingFreeAgents, bump up 1 if we're past the season
        const offset = g.phase <= g.PHASE.RESIGN_PLAYERS ? 0 : 1;
        for (let j = 0 + offset; j < 5 + offset; j++) {
            options.push({
                key: g.season + j,
                val: `${g.season + j} season`,
            });
        }
    } else if (field === "playoffs") {
        options = [{
            val: "Regular Season",
            key: "regularSeason",
        }, {
            val: "Playoffs",
            key: "playoffs",
        }];
    } else if (field === "conference") {
  		 if (g.gameType < 5) {
         options = [
            {
               val: "All",
               key: "all",
            }]
       } else if (g.gameType < 7) {
         options = [
            {
               val: "All",
               key: "all",
            },          
            {
               val: "LCS-NA",
               key: "lcsNA",
            },
            {
               val: "LCS-EU",
               key: "lcsEU",
            },
            {
               val: "LCK",
               key: "lck",
            },
            {
               val: "LPL",
               key: "lpl",
            },
            {
               val: "LMS",
               key: "lms",
            },
            {
               val: "Wild Card",
               key: "wildCard",
            },
           ]
       } else {
         options = [
            {
               val: "All",
               key: "all",
            },
            {
               val: "LCS",
               key: "lcs",
            },
            {
               val: "CS",
               key: "cs",
            },
            {
               val: "Ladder",
               key: "ladder",
            },
            {
               val: "LCS-NA",
               key: "lcsNA",
            },
            {
               val: "LCS-EU",
               key: "lcsEU",
            },
            {
               val: "LCK",
               key: "lck",
            },
            {
               val: "LPL",
               key: "lpl",
            },
            {
               val: "LMS",
               key: "lms",
            },
            {
               val: "Wild Card",
               key: "wildCard",
            },
           ]
       }

    } else if (field === "playoffsTypeSummer") {
		 if (g.gameType > 6) {
      options = [{
            val: "All",
            key: "all",
        }, {
            val: "Worlds",
            key: "worlds",
        }, {
            val: "Promotion",
            key: "promotion",
        }, {
            val: "NA LCS Championship",
            key: "na",
        }, {
            val: "EU LCS Championship",
            key: "eu",
        }, {
            val: "LCK Championship",
            key: "lck",
        }, {
            val: "LPL Championship",
            key: "lpl",
        }, {
            val: "LMS Championship",
            key: "lms",
        }, {
            val: "Worlds - Regionals",
            key: "regionals",
        }, {
            val: "Worlds - Groups",
            key: "groups",
        }, {
            val: "Worlds - Playoffs",
            key: "playoffs",
       }, {
            val: "NA LCS Promotion",
            key: "naPromotion",
        }, {
            val: "EU LCS Promotion",
            key: "euPromotion",
        }, {
            val: "LCK Promotion",
            key: "lckPromotion",
        }, {
            val: "LPL Promotion",
            key: "lplPromotion",
        }, {
            val: "LMS Promotion",
            key: "lmsPromotion",
        }, {
            val: "Wild Card Promotion",
            key: "wcPromotion",
        }];
		 } else if (g.gameType > 4 && g.yearType != 2019) {
        options = [{
            val: "All",
            key: "all",
        }, {
            val: "Worlds",
            key: "worlds",
        }, {
            val: "NA LCS Championship",
            key: "na",
        }, {
            val: "EU LCS Championship",
            key: "eu",
        }, {
            val: "LCK Championship",
            key: "lck",
        }, {
            val: "LPL Championship",
            key: "lpl",
        }, {
            val: "LMS Championship",
            key: "lms",
        }, {
            val: "Worlds - Regionals",
            key: "regionals",
        }, {
            val: "Worlds - Groups",
            key: "groups",
        }, {
            val: "Worlds - Playoffs",
            key: "playoffs",
        }];
		 } else if (g.gameType == 5 && g.yearType == 2019) {
        options = [{
            val: "All",
            key: "all",
        }, {
            val: "Worlds",
            key: "worlds",
        }, {
            val: "NA LCS Championship",
            key: "na",
        }, {
            val: "EU LCS Championship",
            key: "eu",
        }, {
            val: "LCK Championship",
            key: "lck",
        }, {
            val: "LPL Championship",
            key: "lpl",
        }, {
            val: "LMS Championship",
            key: "lms",
        }, {
            val: "Vietnam Championship",
            key: "vnm",
        }, {
            val: "SEA Championship",
            key: "sea",
        }, {
            val: "Brazil Championship",
            key: "brazil",
		}, {
            val: "CIS Championship",
            key: "cis",
		}, {
            val: "Japan Championship",
            key: "japan",
		}, {
            val: "Latin America Championship",
            key: "latin",
		}, {
            val: "OCE Championship",
            key: "oce",
		}, {
            val: "Turkey Championship",
            key: "turkey",
		}, {
            val: "Worlds - Regionals",
            key: "regionals",
        }, {
            val: "Worlds - Groups 1",
            key: "groups1",
        }, {
            val: "Worlds - Play-In",
            key: "playin",
		}, {
            val: "Worlds - Groups 2",
            key: "groups2",
        }, {
            val: "Worlds - Playoffs",
            key: "playoffs2",
        }];
		 } else {
			options = [{
				val: "All",
				key: "all",
			}]
		 }

    } else if (field === "playoffsTypeSpring") {
	 if (g.gameType > 6) {
	        options = [{
            val: "All",
            key: "all",
        }, {
            val: "MSI",
            key: "msi",
       }, {
            val: "Promotion",
            key: "promotion",
        }, {
            val: "NA LCS Championship",
            key: "na",
        }, {
            val: "EU LCS Championship",
            key: "eu",
        }, {
            val: "LCK Championship",
            key: "lck",
        }, {
            val: "LPL Championship",
            key: "lpl",
        }, {
            val: "LMS Championship",
            key: "lms",
        }, {
            val: "MSI - Play-In",
            key: "playin",
        }, {
            val: "MSI - Group Play",
            key: "play",
        }, {
            val: "MSI - Group Knockout",
            key: "knockout",
		}, {
            val: "MSI - Group Finals",
            key: "finals",
       }, {
            val: "NA LCS Promotion",
            key: "naPromotion",
        }, {
            val: "EU LCS Promotion",
            key: "euPromotion",
        }, {
            val: "LCK Promotion",
            key: "lckPromotion",
        }, {
            val: "LPL Promotion",
            key: "lplPromotion",
        }, {
            val: "LMS Promotion",
            key: "lmsPromotion",
        }, {
            val: "Wild Card Promotion",
            key: "wcPromotion",
        }];
		 } else if (g.gameType > 4) {
        options = [{
            val: "All",
            key: "all",
        }, {
            val: "Worlds",
            key: "worlds",
        }, {
            val: "NA LCS Championship",
            key: "na",
        }, {
            val: "EU LCS Championship",
            key: "eu",
        }, {
            val: "LCK Championship",
            key: "lck",
        }, {
            val: "LPL Championship",
            key: "lpl",
        }, {
            val: "LMS Championship",
            key: "lms",
        }, {
           val: "MSI - Play-In",
            key: "playin",
        }, {
            val: "MSI - Group Play",
            key: "play",
        }, {
            val: "MSI - Group Knockout",
            key: "knockout",
		}, {
            val: "MSI - Group Finals",
            key: "finals",
        }];
		 } else {
			options = [{
				val: "All",
				key: "all",
			}]
		 }

    } else if (field === "msi") {
        options = [{
            val: "Regular Season",
            key: "regularSeason",
        }, {
            val: "Playoffs",
            key: "playoffs",
        }];
    } else if (field === "shows") {
        options = [{
            val: "Past 10 Seasons",
            key: "10",
        }, {
            val: "All Seasons",
            key: "all",
        }];
    } else if (field === "statTypes") {
        options = [{
            val: "Per Game",
            key: "perGame",
        }, {
            val: "Per 36 Mins",
            key: "per36",
        }, {
            val: "Totals",
            key: "totals",
        }];
    } else if (field === "awardType") {
        options = [{
            val: "Won Championship",
            key: "champion",
        }, {
            val: "Most Valuable Player",
            key: "mvp",
        }, {
            val: "Finals MVP",
            key: "finals_mvp",
        }, {
    /*        val: "Defensive Player of the Year",
            key: "dpoy",
        }, {
            val: "Sixth Man of the Year",
            key: "smoy",
        }, {
            val: "Rookie of the Year",
            key: "roy",
        }, {*/
            val: "First Team All-League",
            key: "first_team",
        }, {
            val: "Second Team All-League",
            key: "second_team",
        }, {
            val: "Third Team All-League",
            key: "third_team",
        }, {
            val: "All-League",
            key: "all_league",
        }, {
    /*        val: "First Team All-Defensive",
            key: "first_def",
        }, {
            val: "Second Team All-Defensive",
            key: "second_def",
        }, {
            val: "Third Team All-Defensive",
            key: "third_def",
        }, {
            val: "All-Defensive",
            key: "all_def",
        }, {*/
            val: "League KDA Leader",
            key: "rpg_leader",
        }, {
            val: "League Kills Leader",
            key: "ppg_leader",
        }, {
            val: "League Assists Leader",
            key: "apg_leader",
     //   }, {
       //     val: "League Deaths Leader",
         //   key: "spg_leader",
        }, {
            val: "League CS Leader",
            key: "bpg_leader",
        }, {
            val: "Regional - Most Valuable Player",
            key: "region_mvp",
        }, {
            val: "Regional - All-League",
            key: "region_all",
        }, {
            val: "Regional - Won Championship",
            key: "region_champion",
        }];
    } else if (field === "eventType") {
        options = [{
            val: "All Types",
            key: "all",
        }, {
       //     val: "Draft",
         //   key: "draft",
        //}, {
            val: "FA Signed",
            key: "freeAgent",
        }, {
            val: "Resigned",
            key: "reSigned",
        }, {
            val: "Released",
            key: "release",
        }, {
            val: "Trades",
            key: "trade",
        }];
    } else if (field === "teamRecordType") {
        options = [{
            val: "By Team",
            key: "team",
        }, {
            val: "By Conference",
            key: "conf",
        }];
    } else {
        throw new Error(`Unknown Dropdown field: ${field}`);
    }

    return <select value={value} className="form-control" onChange={handleChange}>
        {options.map(opt => <option key={opt.key} value={opt.key}>{opt.val}</option>)}
    </select>;
};

Select.propTypes = {
    field: React.PropTypes.string.isRequired,
    handleChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.oneOfType([
        React.PropTypes.number,
        React.PropTypes.string,
    ]).isRequired,
};

type Props = {
    extraParam?: number | string,
    fields: string[],
    values: (number | string)[],
    view: string,
};

class Dropdown extends React.Component {
    props: Props;
    state: {
        values: (number | string)[],
    };

    constructor(props: Props) {
        super(props);

        // Keep in state so it can update instantly on click, rather than waiting for round trip
        this.state = {
            values: props.values,
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.values !== this.state.values) {
            this.setState({
                values: nextProps.values,
            });
        }
    }

    handleChange(i: number, event: SyntheticInputEvent) {
        const values = this.props.values.slice();
        values[i] = event.target.value;
        this.setState({
            values,
        });

        const parts = [this.props.view].concat(values);
        if (this.props.extraParam !== undefined) {
            parts.push(this.props.extraParam);
        }

        realtimeUpdate([], helpers.leagueUrl(parts));
    }

    render() {
        return <form className="form-inline pull-right">
            {this.props.fields.map((field, i) => {
                return <div key={field} className="form-group" style={{marginLeft: '4px', marginBottom: '4px'}}>
                    <Select
                        field={field}
                        value={this.state.values[i]}
                        handleChange={event => this.handleChange(i, event)}
                    />
                </div>;
            })}
        </form>;
    }
}

Dropdown.propTypes = {
    extraParam: React.PropTypes.oneOfType([
        React.PropTypes.number,
        React.PropTypes.string,
    ]),
    fields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    values: React.PropTypes.array.isRequired,
    view: React.PropTypes.string.isRequired,
};

export default Dropdown;
