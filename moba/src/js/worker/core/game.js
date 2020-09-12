// @flow

import _ from 'underscore';
import {COMPOSITE_WEIGHTS, PHASE, PLAYER, g, helpers} from '../../common';
import {draft, GameSim, champion, finances, freeAgents, phase, player, season, team, trade} from '../core';
import {idb} from '../db';
import {advStats, lock, logEvent, random, toUI, updatePlayMenu, updateStatus} from '../util';
import type {Conditions, GameResults} from '../../common/types';

async function writeTeamStats(results: GameResults) {
    let att = 0;
    let ticketPrice = 0;
	var playoffsOO = 0;

	if (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI) {
		playoffsOO = 1;
	}

    for (const t1 of [0, 1]) {
        const t2 = t1 === 1 ? 0 : 1;


		//console.log(results);
		//console.log(results.team[t1].id);
		//console.log(results.team[0].id);
		//console.log(results.team[1].id);
        const payroll = (await team.getPayroll(results.team[t1].id))[0];
        const [t, teamSeasons, teamStats] = await Promise.all([
            idb.cache.teams.get(results.team[t1].id),
            idb.cache.teamSeasons.indexGetAll('teamSeasonsByTidSeason', [`${results.team[t1].id},${g.season - 2}`, `${results.team[t1].id},${g.season}`]),
            idb.cache.teamStats.indexGet('teamStatsByPlayoffsTid', `${playoffsOO},${results.team[t1].id}`),

//            idb.cache.teamStats.indexGet('teamStatsByPlayoffsTid', `${g.phase === g.PHASE.PLAYOFFS ? 1 : 0},${results.team[t1].id}`),
        ]);

	//	console.log(payroll);
		//console.log(t);
		//console.log(teamSeasons);
		//console.log(teamStats);
// add playoff stats row if missing?
	// this works, but better to find core issue
      /*  if (teamStats == undefined) {
			// usually playoffs, so keep true
		await idb.cache.teamStats.add(team.genStatsRow(results.team[t1].id, true));
		 [t, teamSeasons, teamStats] = await Promise.all([
            idb.cache.teams.get(results.team[t1].id),
            idb.cache.teamSeasons.indexGetAll('teamSeasonsByTidSeason', [`${results.team[t1].id},${g.season - 2}`, `${results.team[t1].id},${g.season}`]),
            idb.cache.teamStats.indexGet('teamStatsByPlayoffsTid', `${playoffsOO},${results.team[t1].id}`),

//            idb.cache.teamStats.indexGet('teamStatsByPlayoffsTid', `${g.phase === g.PHASE.PLAYOFFS ? 1 : 0},${results.team[t1].id}`),
        ]);
		}*/

        const teamSeason = teamSeasons[teamSeasons.length - 1];
        const won = results.team[t1].stat.pts > results.team[t2].stat.pts;

	//	console.log(results);

        // Attendance - base calculation now, which is used for other revenue estimates
        if (t1 === 0) { // Base on home team
//			att = 12000 + (Math.pow(teamSeason.hype, 10)) * 75000 ;
            att = 12000 +  (teamSeason.hype ** 10) * 75000 ;  // Base attendance - between 2% and 0.2% of the region
//            att = 10000 + (0.1 + 0.9 * (teamSeason.hype ** 2)) * teamSeason.pop * 1000000 * 0.01;  // Base attendance - between 2% and 0.2% of the region
			if (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI) {
                att *= 1.5;  // Playoff bonus
            }
		//	console.log(t);
		//	console.log(t.budget);
		//	console.log(t.budget.ticketPrice);
            ticketPrice = t.budget.ticketPrice.amount;
        }

		var numGames;

		numGames = 18+1;
	//	console.log(t.cid)
		//console.log(t.cidStart)

		if ((g.gameType == 0) || (g.gameType == 2)){
		   numGames = 18+1;
		} else if (g.gameType == 1){
			if (t.cid == 0) {
				numGames = 18+1;
			} else if (t.cid == 1) {
				numGames = 20+1;
			} else {
				numGames = 26+1;
			}
		} else if (g.gameType == 3) {
		   numGames = 22+1;
		} else if (g.gameType == 4) {
		   numGames = 14+1;
		} else if (g.gameType == 5 || g.gameType == 6 || g.gameType == 7) {
			let multiplier = 1;
			if (g.gameType == 7) {
				multiplier = 3;
			}
			if (t.cid == 0*multiplier) {
				numGames = 18+1;
			} else if (t.cid == 1*multiplier) {
				numGames = 18+1;
			} else if (t.cid == 2*multiplier) {
				numGames = 18+1;
			} else if (t.cid == 3*multiplier) {
				numGames = 22+1;
			} else if (t.cid == 4*multiplier) {
				numGames = 14+1;
			} else if (t.cid == 5*multiplier) {
				numGames = 12+1;
			} else {
				numGames = 22+1;
			}
		} else {
		   numGames = 10;
		}

		// need to double games to account for splits
		if (g.gameType >= 6) {
			numGames *= 2;
		}

        // Some things are only paid for regular season games.
        let salaryPaid = 0;
        let scoutingPaid = 0;
        let coachingPaid = 0;
        let healthPaid = 0;
        let facilitiesPaid = 0;
        let merchRevenue = 0;
        let sponsorRevenue = 0;
        let nationalTvRevenue = 0;
        let localTvRevenue = 0;

		let revenueBoost = 1.00;
/*		if (teamSeason.hype > .9) {
		  revenueBoost = (teamSeason.hype-.9)*2
		} else if (teamSeason.hype < .5) {
		  revenueBoost = (teamSeason.hype+.5);
		}*/
	//	console.log(teamSeason.hype);
		if (g.gameType == 1) {
			if (teamSeason.hype>.75) {
				revenueBoost = 3.0;
			} else if (teamSeason.hype>.50) {
				revenueBoost = 2.0;
			} else {
				revenueBoost = 1.50;
			}
		} else if (g.gameType == 4) {
			if (teamSeason.hype>.75) {
				revenueBoost = 3.0;
			} else if (teamSeason.hype>.50) {
				revenueBoost = 2.0;
			} else {
				revenueBoost = 1.5;
			}
		} else if (g.gameType >= 5) {
			if (teamSeason.hype>.75) {
				revenueBoost = 3.0;
			} else if (teamSeason.hype>.50) {
				revenueBoost = 2.0;
			} else {
				revenueBoost = 1.50;
			}
		} else  {
			if (teamSeason.hype>.75) {
				revenueBoost = 3.0;
			} else if (teamSeason.hype>.50) {
				revenueBoost = 2.0;
			} else {
				revenueBoost = 1.50;
			}
		/*} else {
			if (teamSeason.hype>.75) {
				revenueBoost = 3.0;
			} else if (teamSeason.hype>.50) {
				revenueBoost = 2.0;
			} else if (teamSeason.hype>.25) {
				revenueBoost = 1.5;
			} else {
				revenueBoost = 1.0;
			}*/
		}
	//	console.log(revenueBoost);
        if (g.phase !== g.PHASE.PLAYOFFS && g.phase !== g.PHASE.MSI) {
            // All in [thousands of dollars]
			salaryPaid = Number(payroll) / numGames;
			scoutingPaid = t.budget.scouting.amount / numGames;
			coachingPaid = t.budget.coaching.amount / numGames;
//                    healthPaid = t.budget.health.amount / 30;
			healthPaid = 0;
			facilitiesPaid = t.budget.facilities.amount / numGames;
//                    merchRevenue = att*.55*revenueBoost  ;
			merchRevenue = att*.30*revenueBoost*18/numGames  ;
			//console.log(merchRevenue);
			if (merchRevenue > 25000000) {
				merchRevenue = 25000000;
			}
//                  sponsorRevenue =  att*1.7*revenueBoost ;
			sponsorRevenue =  att*1.0*revenueBoost*18/numGames ;
			if (sponsorRevenue > 6000000) {
				sponsorRevenue = 6000000;
			}
			nationalTvRevenue = 0;
			localTvRevenue = 0;
			if (localTvRevenue > 1200) {
				localTvRevenue = 1200;
			}
        }

        // Attendance - final estimate
        if (t1 === 0) { // Base on home team
            att = random.gauss(att, 1000);
        //    att *= 45 / ((g.salaryCap / 90000) * ticketPrice);  // Attendance depends on ticket price. Not sure if this formula is reasonable.
         //   att *= 1 + 0.075 * (g.numTeams - finances.getRankLastThree(teamSeasons, "expenses", "facilities")) / (g.numTeams - 1);  // Attendance depends on facilities. Not sure if this formula is reasonable.
            if (att > 75000) {
                att = 75000;
            } else if (att < 0) {
                att = 0;
            }
            att = Math.round(att);
        }




        // This doesn't really make sense
        const ticketRevenue = 0; // [thousands of dollars]
//        const ticketRevenue = ticketPrice * att / 1000;  // [thousands of dollars]

        // Hype - relative to the expectations of prior seasons
        if (teamSeason.gp > 5 && g.phase !== g.PHASE.PLAYOFFS && g.phase !== g.PHASE.MSI) {
			let winpHurdle, winpDivisor;

			winpHurdle = .55;
			winpDivisor = 1.00;
			if (g.gameType == 1 ||  g.gameType == 7) {
			  if (t.cid == 0) {
					winpHurdle = .55
			  } else if (t.cid == 1) {
					winpHurdle = .75
					winpDivisor = 1.5;
			  } else {
					winpHurdle = 1.00
					winpDivisor = 2;
			  }
			}



            let winp = teamSeason.won / (teamSeason.won + teamSeason.lost);
            let winpOld = 0;
            // Avg winning percentage of last 0-2 seasons (as available)
            for (let i = 0; i < teamSeasons.length - 2; i++) {
                winpOld += teamSeasons[i].won / (teamSeasons[i].won + teamSeasons[i].lost);
            }

            if (teamSeasons.length > 1) {
                winpOld /= teamSeasons.length - 1;
            } else {
                winpOld = 0.5; // Default for new games
            }

            // It should never happen, but winp and winpOld sometimes turn up as NaN due to a duplicate season entry or the user skipping seasons
            if (isNaN(winp)) {
                winp = 0;
            }
            if (isNaN(winpOld)) {
                winpOld = 0;
            }

//            teamSeason.hype = teamSeason.hype + 0.01 * (winp - 0.55) + 0.015 * (winp - winpOld);
			//console.log(teamSeason.hype);
			//console.log(1-(1/(numGames-5)));
			teamSeason.hype *= 1-(1/(numGames-5));
			//console.log(teamSeason.hype);
			//console.log(winp/(numGames-5));
			teamSeason.hype += winp/(numGames-5);
			//console.log(teamSeason.hype);
            if (teamSeason.hype > 1) {
                teamSeason.hype = 1;
            } else if (teamSeason.hype < 0) {
                teamSeason.hype = 0;
            }
        }

        const revenue = merchRevenue + sponsorRevenue ;
//        const expenses = salaryPaid + scoutingPaid + coachingPaid + healthPaid + facilitiesPaid;
        const expenses = salaryPaid + scoutingPaid + coachingPaid + facilitiesPaid;
        teamSeason.cash += revenue - expenses;
        if (t1 === 0) {
            // Only home team gets attendance...
            teamSeason.att += att;

            // This is only used for attendance tracking
            if (!teamSeason.hasOwnProperty("gpHome")) { teamSeason.gpHome = Math.round(teamSeason.gp / 2); } // See also team.js and teamFinances.js
            teamSeason.gpHome += 1;
        }
        teamSeason.gp += 1;
        teamSeason.revenues.merch.amount += merchRevenue;
        teamSeason.revenues.sponsor.amount += sponsorRevenue;
        teamSeason.revenues.nationalTv.amount += nationalTvRevenue;
        teamSeason.revenues.localTv.amount += localTvRevenue;
        teamSeason.revenues.ticket.amount += ticketRevenue;
        teamSeason.expenses.salary.amount += salaryPaid;
        teamSeason.expenses.scouting.amount += scoutingPaid;
        teamSeason.expenses.coaching.amount += coachingPaid;
        teamSeason.expenses.health.amount += healthPaid;
        teamSeason.expenses.facilities.amount += facilitiesPaid;

        //const keys = ['min', 'fg', 'fga', 'fgAtRim', 'fgaAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts'];
		const keys = [ 'trb','fg', 'fga','fgp', 'fgAtRim', 'fgaAtRim', 'fgpAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts','oppJM','oppInh','oppTw','scTwr','scKills',
				'grExpTwr',
				'grExpKills',
				'grGldTwr',
				'grGldKills',
				'tmBuffTwr',
				'tmBuffKills',
				'tmBAdjTwr',
				'tmBAdjKills',
				'TPTwr',
				'TPKills',
				'TwTwr',
				'TwKills',
				'CKTwr',
				'CKKills',
				'CSTwr',
				'CSKills',
				'AgTwr',
				'AgKills',
				'ChmpnTwr',
				'ChmpnKills',
				'riftKills',
				'riftAssists',
				'firstBlood',
				];
				//console.log("teamStats");
				//console.log(teamStats);
	//			console.log("results.team[t1].stat[keys[i]]");
	//console.log(results.team[0].id+" "+results.team[1].id);
	//console.log(results.team[t1]);
	//console.log(teamStats);
	//console.log(t1);
	//console.log(keys);
//console.log(results);
//console.log(t1);
//console.log(results.team[t1]);
//console.log(teamStats);
        for (let i = 0; i < keys.length; i++) {
	//console.log(results.team[t1].id+" "+i+" "+keys[i]);
	//console.log(results.team[t1].stat[keys[i]]);
	//console.log(teamStats);
	//console.log(teamStats[keys[i]]);
		//	console.log(i);
			//console.log(keys[i]);
				//console.log(results.team[t1].stat[keys[i]]);
				//console.log(teamStats[keys[i]]);
			if (keys[i] == 'trb') {
			//	console.log(t1);
			//	console.log(keys[i]);
				//console.log(results.team[t1].id); // 121 turks
				//console.log(results.team[t1].stat[keys[i]]);
//console.log(teamStats);
				if (teamStats == undefined) {
					throw new Error('teamStats undefined');
				}
				//console.log(teamStats.tid);
				//console.log(teamStats.trb);
				//console.log(teamStats[keys[i]]);
			}
// if trb is not found, stat row doesn't exist for that team? can happen for teams that don't play games the first week of playoffs

            teamStats[keys[i]] += results.team[t1].stat[keys[i]];
			if (keys[i] == 'trb') {
		//		console.log(t1);
			//	console.log(keys[i]);
				//console.log(results.team[t1].stat[keys[i]]);
				//console.log(teamStats[keys[i]]);
				//console.log("DONE");

			}
			if (keys[i] == 'fgp') {
			//	console.log(results.team[t1].stat[keys[i]]);
			//	console.log(teamStats[keys[i]]);
			}
        }
        //teamStats.gp += 1;
        //teamStats.trb += results.team[t1].stat.orb + results.team[t1].stat.drb;
        //teamStats.oppPts += results.team[t2].stat.pts;
        //teamStats.ba += results.team[t2].stat.blk;

		teamStats.gp += 1;
		teamStats.min += results.team[t1].stat.min/5;
	  //  teamStats.trb += results.team[t1].stat.orb + results.team[t1].stat.drb;
		teamStats.oppPts += results.team[t2].stat.pts;

        if (teamSeason.lastTen.length === 5 && g.phase !== g.PHASE.PLAYOFFS  && g.phase !== g.PHASE.MSI) {
            teamSeason.lastTen.pop();
        }

        if (won && g.phase !== g.PHASE.PLAYOFFS  && g.phase !== g.PHASE.MSI) {
            teamSeason.won += 1;
			if (g.seasonSplit == "Spring") {
				teamSeason.wonSpring += 1;
			} else {
				teamSeason.wonSummer += 1;
			}

            if (results.team[0].did === results.team[1].did) {
                teamSeason.wonDiv += 1;
            }
            if (results.team[0].cid === results.team[1].cid) {
                teamSeason.wonConf += 1;
            }

            if (t1 === 0) {
                teamSeason.wonHome += 1;
            } else {
                teamSeason.wonAway += 1;
            }

            teamSeason.lastTen.unshift(1);

            if (teamSeason.streak >= 0) {
                teamSeason.streak += 1;
            } else {
                teamSeason.streak = 1;
            }
        } else if (g.phase !== g.PHASE.PLAYOFFS  && g.phase !== g.PHASE.MSI) {
            teamSeason.lost += 1;
			if (g.seasonSplit == "Spring") {
				teamSeason.lostSpring += 1;
			} else {
				teamSeason.lostSummer += 1;
			}
            if (results.team[0].did === results.team[1].did) {
                teamSeason.lostDiv += 1;
            }
            if (results.team[0].cid === results.team[1].cid) {
                teamSeason.lostConf += 1;
            }

            if (t1 === 0) {
                teamSeason.lostHome += 1;
            } else {
                teamSeason.lostAway += 1;
            }

            teamSeason.lastTen.unshift(0);

            if (teamSeason.streak <= 0) {
                teamSeason.streak -= 1;
            } else {
                teamSeason.streak = -1;
            }
        }

        await idb.cache.teams.put(t);
        await idb.cache.teamSeasons.put(teamSeason);
        await idb.cache.teamStats.put(teamStats);
    }

    return att;
}

async function writePlayerStats(results: GameResults, conditions: Conditions) {
    await Promise.all(results.team.map(t => Promise.all(t.player.map(async (p) => {
        // Only need to write stats if player got minutes
        if (p.stat.min === 0) {
            return;
        }

        const promises = [];

	//	console.log(p);
        promises.push(player.checkStatisticalFeat(p.id, t.id, p, results, conditions));

        var  ps = await idb.cache.playerStats.indexGet('playerStatsByPid', p.id);

	//	console.log(p);
	//	console.log(ps);
	//let undrafted = await idb.cache.champions.getAll();
	//console.log(undrafted);
	//throw new Error("Something went badly wrong!");
//		const championPatch = await idb.cache.championPatch.getAll();
	//	console.log(p.stat.cpid);
		const championPatch = await idb.cache.championPatch.get(p.stat.cpid);		//cpid, from player champion played
	//	console.log(championPatch);
				// use this format, need to know champion id, then just add to that along with player
                //const t = await idb.cache.teams.get(tid2);
                //await idb.cache.teams.put(t);

        // Since index is not on playoffs, manually check
		//console.log(ps);
		//console.log(ps.playoffs+" "+g.phase+" "+g.PHASE.PLAYOFFS+" "+g.PHASE.MSI);
			//console.log(g.phase);
			//console.log(p);
		//	console.log(ps);		// split, playoffs, tid, pid, season
		if (ps == undefined) {
		//	console.log(p.id);
		//	console.log(p);
			ps = p.stat;
			if (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI) {

				ps.playoffs = true;
			} else {
				ps.playoffs = false;
			}

			ps.championStats = [];

		}
	//	if (ps.playoffs == undefined) {
	//		console.log(ps);
	//	}
      /*  if (ps.playoffs !== (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI)) {
		//console.log(ps.playoffs+" "+g.phase+" "+g.PHASE.PLAYOFFS+" "+g.PHASE.MSI);
			console.log(t.id);

			console.log(p);
//			console.log(p.tid);
	//		console.log(ps.playoffs);
		//	console.log(g.phase);
			//console.log(g.PHASE.PLAYOFFS);
			//console.log(g.PHASE.MSI);
			p.tid = t.id;
			await player.addStatsRow(p, true);
			ps = await idb.cache.playerStats.indexGet('playerStatsByPid', p.id);


        }*/
       if (ps.playoffs !== (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI)) {
		//console.log(ps.playoffs+" "+g.phase+" "+g.PHASE.PLAYOFFS+" "+g.PHASE.MSI);
	//		console.log(t.id);

	//		console.log(p);

			// if row not created above then throw the error message'
            throw new Error(`Missing playoff stats for player ${p.id}`);
        }
        // Update stats
     //   const keys = ['gs', 'min', 'fg', 'fga', 'fgAtRim', 'fgaAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'pm', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'ba', 'pf', 'pts'];

		const keys = ['gs', 'min','trb', 'fg', 'fga','fgp', 'fgAtRim', 'fgaAtRim', 'fgpAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts','oppJM','oppInh','oppTw','champPicked', 'cpid','scTwr','scKills',
		'grExpTwr',
		'grExpKills',
		'grGldTwr',
		'grGldKills',
		'tmBuffTwr',
		'tmBuffKills',
		'tmBAdjTwr',
		'tmBAdjKills',
		'TPTwr',
		'TPKills',
		'TwTwr',
		'TwKills',
		'CKTwr',
		'CKKills',
		'CSTwr',
		'CSKills',
		'AgTwr',
		'AgKills',
		'ChmpnTwr',
		'ChmpnKills',
		'riftKills',
		'riftAssists',
		'firstBlood',
		];


        for (let i = 0; i < keys.length; i++) {
			if (keys[i] ==  "champPicked" || keys[i] ==  "cpid" ) {
				ps[keys[i]] = p.stat[keys[i]];
			} else {
				ps[keys[i]] += p.stat[keys[i]];
			}
        }
        ps.gp += 1; // Already checked for non-zero minutes played above
   //     ps.trb += p.stat.orb + p.stat.drb;
		let psChamp = {};

		psChamp.gp = 1;
		psChamp.fg = p.stat.fg;
		psChamp.min = p.stat.min;
		psChamp.fga = p.stat.fga;
		psChamp.fgp = p.stat.fgp;
		psChamp.tp = p.stat.tp;
		psChamp.role = p.pos;
		psChamp.cpid = ps.cpid;
		psChamp.champPicked = ps.champPicked;

	//	if (psChamp.champPicked == "Kai'Sa" || psChamp.champPicked == "Pyke") {
	//		console.log(psChamp.champPicked+" "+psChamp.role);
	//		console.log(championPatch);
	//	}
	//	console.log(p);
	//	console.log(ps);
	//	console.log(psChamp);
	//	console.log(championPatch);
		//console.log(ps.championStats);
		const [tw, tl] = results.team[0].stat.pts > results.team[1].stat.pts ? [0, 1] : [1, 0];
		if (t.id == results.team[tw].id) {
			psChamp.won = 1;
		} else {
			psChamp.won = 0;
		}


		//console.log(ps.championStats.length);

		if (ps.championStats.length == 0) {
			ps.championStats.push(psChamp);
		} else {
			let i;
			for (i = 0; i < ps.championStats.length; i++) {
//				if (ps.championStats[i].champPicked ==  psChamp.champPicked && psChamp.role == ps.championStats[i].role) {
				if (ps.championStats[i].champPicked ==  psChamp.champPicked ) {
					ps.championStats[i].gp += 1;
					ps.championStats[i].fg += p.stat.fg;
					ps.championStats[i].min += p.stat.min;
					ps.championStats[i].fga += p.stat.fga;
					ps.championStats[i].fgp += p.stat.fgp;
					ps.championStats[i].tp += p.stat.tp;
					ps.championStats[i].won += psChamp.won;
					i = ps.championStats.length+1;
				}
			}
			if (i < ps.championStats.length+1 ) {
				ps.championStats.push(psChamp);
			}
		}

		// use 0 as cpid for all champion for that game
	//	console.log(championPatch);
		//console.log(championPatch.gp);
		championPatch.gp += 1;
		championPatch.fg += p.stat.fg;
		championPatch.min += p.stat.min;
		championPatch.fga += p.stat.fga;
		championPatch.fgp += p.stat.fgp;
	//	console.log(championPatch.tp+" "+p.stat.tp);
		championPatch.tp += p.stat.tp;
	//	console.log(championPatch.tp);
		championPatch.won += psChamp.won;

		//console.log(psChamp);
	//	console.log(championPatch);

//        await idb.cache.championPatch.put(psChamp);
        await idb.cache.championPatch.put(championPatch);
        await idb.cache.playerStats.put(ps);

        const injuredThisGame = p.injured && p.injury.type === "Healthy";

        // Only update player object (values and injuries) every 10 regular season games or on injury
        if ((ps.gp % 10 === 0 && g.phase !== g.PHASE.PLAYOFFS  && g.phase !== g.PHASE.MSI) || injuredThisGame) {
            const p2 = await idb.cache.players.get(p.id);

            // Injury crap - assign injury type if player does not already have an injury in the database
            let biggestRatingsLoss;
            if (injuredThisGame) {
                p2.injury = player.injury(t.healthRank);
                p.injury = helpers.deepCopy(p2.injury); // So it gets written to box score
                logEvent({
                    type: "injured",
                    text: `<a href="${helpers.leagueUrl(["player", p2.pid])}">${p2.firstName} ${p2.userID} ${p2.lastName}</a> was injured! (${p2.injury.type}, out for ${p2.injury.gamesRemaining} games)`,
                    showNotification: p2.tid === g.userTid,
                    pids: [p2.pid],
                    tids: [p2.tid],
                }, conditions);

                // Some chance of a loss of athleticism from serious injuries
                // 100 game injury: 67% chance of losing between 0 and 10 of spd, jmp, endu
                // 50 game injury: 33% chance of losing between 0 and 5 of spd, jmp, endu
                if (p2.injury.gamesRemaining > 25 && Math.random() < p2.injury.gamesRemaining / 150) {
                    biggestRatingsLoss = Math.round(p2.injury.gamesRemaining / 10);
                    if (biggestRatingsLoss > 10) {
                        biggestRatingsLoss = 10;
                    }

                    // Small chance of horrible things
                    if (biggestRatingsLoss === 10 && Math.random() < 0.01) {
                        biggestRatingsLoss = 30;
                    }

                    const r = p2.ratings.length - 1;
                    //p2.ratings[r].spd = helpers.bound(p2.ratings[r].spd - random.randInt(0, biggestRatingsLoss), 0, 100);
                    //p2.ratings[r].jmp = helpers.bound(p2.ratings[r].jmp - random.randInt(0, biggestRatingsLoss), 0, 100);
                    //p2.ratings[r].endu = helpers.bound(p2.ratings[r].endu - random.randInt(0, biggestRatingsLoss), 0, 100);
                    p2.ratings[r].jmp = helpers.bound(p2.ratings[r].stl - random.randInt(0, biggestRatingsLoss), 0, 100);
                    p2.ratings[r].endu = helpers.bound(p2.ratings[r].tp - random.randInt(0, biggestRatingsLoss), 0, 100);
                }
            }

            // Player value depends on ratings and regular season stats, neither of which can change in the playoffs (except for severe injuries)
            if (g.phase !== g.PHASE.PLAYOFFS && g.phase !== g.PHASE.MSI) {
                await player.updateValues(p2);
            }
            if (biggestRatingsLoss) {
                await player.updateValues(p2);
            }

            await idb.cache.players.put(p2);
        }

        return Promise.all(promises);
    }))));
}

async function writeGameStats(results: GameResults, att: number, conditions: Conditions) {
    const gameStats = {
        gid: results.gid,
        att,
        season: g.season,
        seasonSplit: g.seasonSplit,
        playoffs: (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI) ,
        overtimes: results.overtimes,
        won: {},
        lost: {},
        teams: [
            {},
            {},
        ],
    };
	//console.log(results);
    gameStats.teams[0].tid = results.team[0].id;
    gameStats.teams[0].players = [];
    gameStats.teams[1].tid = results.team[1].id;
    gameStats.teams[1].players = [];

//	console.log(results);
    for (let t = 0; t < 2; t++) {
        //const keys = ['min', 'fg', 'fga', 'fgAtRim', 'fgaAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'ba', 'pf', 'pts', 'ptsQtrs'];

        const  keys = ['min','trb', 'fg', 'fga','fgp', 'fgAtRim', 'fgaAtRim', 'fgpAtRim', 'fgLowPost', 'fgaLowPost', 'fgMidRange', 'fgaMidRange', 'tp', 'tpa', 'ft', 'fta', 'orb', 'drb', 'ast', 'tov', 'stl', 'blk', 'pf', 'pts', 'ptsQtrs','champPicked','oppJM','oppInh','oppTw','scTwr','scKills',
			'grExpTwr',
			'grExpKills',
			'grGldTwr',
			'grGldKills',
			'tmBuffTwr',
			'tmBuffKills',
			'tmBAdjTwr',
			'tmBAdjKills',
			'TPTwr',
			'TPKills',
			'TwTwr',
			'TwKills',
			'CKTwr',
			'CKKills',
			'CSTwr',
			'CSKills',
			'AgTwr',
			'AgKills',
			'ChmpnTwr',
			'ChmpnKills',
			'riftKills',
			'riftAssists',
			'firstBlood',
			];

        for (let i = 0; i < keys.length; i++) {
            gameStats.teams[t][keys[i]] = results.team[t].stat[keys[i]];
        }
   //     gameStats.teams[t].trb = results.team[t].stat.orb + results.team[t].stat.drb;

        keys.unshift("gs"); // Also record starters, in addition to other stats
     //   keys.push("pm");
        for (let p = 0; p < results.team[t].player.length; p++) {
            gameStats.teams[t].players[p] = {};
            for (let i = 0; i < keys.length; i++) {
                gameStats.teams[t].players[p][keys[i]] = results.team[t].player[p].stat[keys[i]];
            }
            gameStats.teams[t].players[p].name = results.team[t].player[p].name;
            gameStats.teams[t].players[p].userID = results.team[t].player[p].userID;
            gameStats.teams[t].players[p].pos = results.team[t].player[p].pos;
            //gameStats.teams[t].players[p].trb = results.team[t].player[p].stat.orb + results.team[t].player[p].stat.drb;
            gameStats.teams[t].players[p].pid = results.team[t].player[p].id;
            gameStats.teams[t].players[p].skills = helpers.deepCopy(results.team[t].player[p].skills);
            gameStats.teams[t].players[p].injury = helpers.deepCopy(results.team[t].player[p].injury);
			//,champUsed: results.team[t].player[p].champUsed, userID: results.team[t].player[p].userID
			//, posPlayed: results.team[t].player[p].posPlayed
        }
		gameStats.teams[t].ban = [{ban:""},{ban:""},{ban:""},{ban:""},{ban:""}];
        for (let p = 0; p < 5; p++) {
			gameStats.teams[t].ban[p].ban = results.team[t].ban[p].ban;
		}
		//console.log(gameStats);
    }

    // Store some extra junk to make box scores easy
    const [tw, tl] = results.team[0].stat.pts > results.team[1].stat.pts ? [0, 1] : [1, 0];

    gameStats.won.tid = results.team[tw].id;
    gameStats.lost.tid = results.team[tl].id;
    gameStats.won.pts = results.team[tw].stat.pts;
    gameStats.lost.pts = results.team[tl].stat.pts;
    gameStats.won.pf = results.team[tw].stat.pf;
    gameStats.lost.pf = results.team[tl].stat.pf;

	gameStats.playoffType = g.playoffType;
//	console.log(results);
	//console.log(gameStats);

	gameStats.draft = results.team[0].draft.champions.drafted;

    // Event log
    if (results.team[0].id === g.userTid || results.team[1].id === g.userTid) {
        let text;
        if (results.team[tw].id === g.userTid) {
            text = `<span style="color: green; font-weight: bold; padding-right: 3px">W</span> <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid])}">${results.team[tw].stat.pf}-${results.team[tl].stat.pf}</a> Your team <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid])}">defeated</a> <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tl].id], g.season])}">${g.teamRegionsCache[results.team[tl].id]}`;
        } else {
            text = `<span style="color: red; font-weight: bold; padding-right: 8px">L</span> <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid])}">${results.team[tw].stat.pf}-${results.team[tl].stat.pf}</a> Your team <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid])}">lost</a> to <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[results.team[tw].id], g.season])}">${g.teamRegionsCache[results.team[tw].id]}`;
        }
//        text += `</a> <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid])}">${results.team[tw].stat.pts}-${results.team[tl].stat.pts}</a>.`;
//        text += `</a> <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[g.userTid], g.season, results.gid])}">${results.team[tw].stat.pf}-${results.team[tl].stat.pf}</a>.`;
        text += `</a>.`;
/*        text += `</a> <a href="${helpers.leagueUrl([
            "game_log",
            g.teamAbbrevsCache[g.userTid],
            g.season,
            results.gid,
        ])}">${results.team[tw].stat.pf}-${results.team[tl].stat.pf}</a>.`;		*/

        logEvent({
            type: results.team[tw].id === g.userTid ? "gameWon" : "gameLost",
            text,
            saveToDb: false,
            tids: [results.team[0].id, results.team[1].id],
        }, conditions);
    }

	// make for MOBA
    if (results.clutchPlays.length > 0) {
        for (let i = 0; i < results.clutchPlays.length; i++) {
            if (results.clutchPlays[i].hasOwnProperty("tempText")) {
                results.clutchPlays[i].text = results.clutchPlays[i].tempText;
                if (results.clutchPlays[i].tids[0] === results.team[tw].id) {
                    results.clutchPlays[i].text += ` in ${results.team[tw].stat.pts.toString().charAt(0) === '8' ? 'an' : 'a'} <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[results.team[tw].id], g.season, results.gid])}">${results.team[tw].stat.pts}-${results.team[tl].stat.pts}</a> win over the ${g.teamNamesCache[results.team[tl].id]}.`;
                } else {
                    results.clutchPlays[i].text += ` in ${results.team[tl].stat.pts.toString().charAt(0) === '8' ? 'an' : 'a'} <a href="${helpers.leagueUrl(["game_log", g.teamAbbrevsCache[results.team[tl].id], g.season, results.gid])}">${results.team[tl].stat.pts}-${results.team[tw].stat.pts}</a> loss to the ${g.teamNamesCache[results.team[tw].id]}.`;
                }
                delete results.clutchPlays[i].tempText;
            }
            logEvent(results.clutchPlays[i], conditions);
        }
    }
//console.log(gameStats);
    await idb.cache.games.add(gameStats);
}

async function updatePlayoffSeries(results: GameResults, conditions: Conditions) {

//console.log(g.confs);
	var playoffSeries;
	var playoffRound;
	if (g.gameType >=6 && g.seasonSplit == "Spring") {

		playoffSeries = await idb.cache.msiSeries.get(g.season);
		playoffRound = playoffSeries.seriesMSI[playoffSeries.currentRound];
		//console.log(playoffSeries);
		//console.log(playoffSeries.seriesMSI);
		//console.log(playoffSeries.currentRound);
		//console.log(playoffSeries.seriesMSI[playoffSeries.currentRound]);
		//console.log(playoffRound);
	} else {
		playoffSeries = await idb.cache.playoffSeries.get(g.season);
		playoffRound = playoffSeries.series[playoffSeries.currentRound];

	}


	let seriesStart;
	let seriesEnd;
	var i;
	var series;

		//console.log(results);
		//console.log(playoffRound);
		//console.log(playoffSeries);

    for (const result of results) {
		//console.log(result);
        // Did the home (true) or away (false) team win this game? Here, "home" refers to this game, not the team which has homecourt advnatage in the playoffs, which is what series.home refers to below.
        const won0 = result.team[0].stat.pts > result.team[1].stat.pts;
        const won1 = result.team[0].stat.pts <= result.team[1].stat.pts;

		var startEnd = season.seriesStartEnd(playoffSeries.currentRound);

		seriesStart = startEnd.seriesStart;
		seriesEnd = startEnd.seriesEnd;

				// wasn't being used because was &&, not needed?
		/*if ((g.gameType == 5 || g.gameType == 6 ) && (playoffSeries.currentRound  < 3)) {
			for (i = 0; i < 2; i++) {
				series = playoffRound[i];

				if (series.home.tid === result.team[0].id) {
					if (won0) {
						series.home.won += 1;
					} else {
						series.away.won += 1;
					}
					break;
				} else if (series.away.tid === result.team[0].id) {
					if (won0) {
						series.away.won += 1;
					} else {
						series.home.won += 1;
					}
					break;
				}
			}
		}	*/



		for (i = seriesStart; i < seriesEnd; i++) {

		// make this a function, where I keep all the skipped ones
			i =  season.seriesStartEndSkip(seriesStart,seriesEnd,playoffSeries.currentRound, i);

			series = playoffRound[i];

			if ( ( ((g.gameType == 5) || (g.gameType >= 6 && g.seasonSplit == "Summer")) && (playoffSeries.currentRound  == 8 || playoffSeries.currentRound  == 12)) || ((g.gameType >= 6) && (playoffSeries.currentRound  == 7)) ) {

// 3 team groups needs if else because home/away same team
				if (series.home.tid === result.team[0].id) {
					if (won0) {
						series.home.won += 1;
					}
				}
				if (series.away.tid === result.team[0].id  && (series.away.tid != series.home.tid)) {
					if (won0) {
						series.away.won += 1;
					}
				}
				if (series.home.tid === result.team[1].id) {
					if (won1) {
						series.home.won += 1;
					}
				}
				if (series.away.tid === result.team[1].id && (series.away.tid != series.home.tid)) {
					if (won1) {
						series.away.won += 1;
					}
				}
			} else if ( (g.gameType >= 6 && g.seasonSplit == "Spring") && (playoffSeries.currentRound  == 8) ) {
				if (series.home.tid === result.team[0].id) {
					if (won0) {
						series.home.won += 1;
					}
				}
				if (series.away.tid === result.team[0].id) {
					if (won0) {
						series.away.won += 1;
					}
				}
				if (series.home.tid === result.team[1].id) {
					if (won1) {
						series.home.won += 1;
					}
				}
				if (series.away.tid === result.team[1].id) {
					if (won1) {
						series.away.won += 1;
					}
				}
			} else {
				if (series.home.tid === result.team[0].id) {
					if (won0) {
						series.home.won += 1;
					} else {
						series.away.won += 1;
					}
					break;
				} else if (series.away.tid === result.team[0].id) {
					if (won0) {
						series.away.won += 1;
					} else {
						series.home.won += 1;
					}
					break;
				}
			}
		}

		var titleRound;
		if (g.gameType == 0) {
			titleRound = 11;
		} else if (g.gameType == 1) {
			titleRound = 3;
		} else if (g.gameType == 2) {
			titleRound = 3;
		} else if (g.gameType == 3) {
			titleRound = 3;
		} else if (g.gameType == 4) {
			titleRound = 3;
		} else if (g.gameType == 5) {
			if (g.yearType == 2019) {
				titleRound = 15;
			} else {
				titleRound = 11;
			}
		} else if (g.gameType == 6) {
			titleRound = 11;
		} else if (g.gameType == 7) {
			titleRound = 11;
		} else {
			titleRound = 3;
		}

        // For flow, not really necessary
        if (series === undefined) {
            continue;
        }

        // Log result of playoff series
   /*     if (series.away.won >= 4 || series.home.won >= 4) {
            let winnerTid;
            let loserTid;
            let loserWon;
            if (series.away.won >= 4) {
                winnerTid = series.away.tid;
                loserTid = series.home.tid;
                loserWon = series.home.won;
            } else {
                winnerTid = series.home.tid;
                loserTid = series.away.tid;
                loserWon = series.away.won;
            }

            let currentRoundText = '';
            if (playoffSeries.currentRound === 0) {
                currentRoundText = "first round of the playoffs";
            } else if (playoffSeries.currentRound === 1) {
                currentRoundText = "second round of the playoffs";
            } else if (playoffSeries.currentRound === 2) {
                currentRoundText = "conference finals";
            } else if (playoffSeries.currentRound === 3) {
                currentRoundText = "league championship";
            }

            const showNotification = series.away.tid === g.userTid || series.home.tid === g.userTid || playoffSeries.currentRound === 3;
            logEvent({
                type: "playoffs",
                text: `The <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[winnerTid], g.season])}">${g.teamNamesCache[winnerTid]}</a> defeated the <a href="${helpers.leagueUrl(["roster", g.teamAbbrevsCache[loserTid], g.season])}">${g.teamNamesCache[loserTid]}</a> in the ${currentRoundText}, 4-${loserWon}.`,
                showNotification,
                tids: [winnerTid, loserTid],
            }, conditions);
        }*/
    }

	if (g.gameType >=6 && g.seasonSplit == "Spring") {

	//	playoffSeries.seriesMSI = playoffSeries.series
//	console.log(playoffSeries);
		await idb.cache.msiSeries.put(playoffSeries);
	} else {
		await idb.cache.playoffSeries.put(playoffSeries);
	}
//  console.log(g.confs);
}

/**
 * Build a composite rating.
 *
 * Composite ratings are combinations of player ratings meant to represent one facet of the game, like the ability to make a jump shot. All composite ratings are scaled from 0 to 1.
 *
 * @memberOf core.game
 * @param {Object.<string, number>} ratings Player's ratings object.
 * @param {Array.<string>} components List of player ratings to include in the composite ratings. In addition to the normal ones, "constant" is a constant value of 50 for every player, which can be used to add a baseline value for a stat.
 * @param {Array.<number>=} weights Optional array of weights used in the linear combination of components. If undefined, then all weights are assumed to be 1. If defined, this must be the same size as components.
 * @return {number} Composite rating, a number between 0 and 1.
 */
function makeComposite(rating, components, weights,YWTadj,langAdj) {
    if (weights === undefined) {
        // Default: array of ones with same size as components
        weights = [];
        for (let i = 0; i < components.length; i++) {
            weights.push(1);
        }
    }

	//console.log(rating);
	//console.log(rating+" "+components+" "+weights+" "+YWTadj+" "+langAdj);
    let r = 0;
    let divideBy = 0;
    for (let i = 0; i < components.length; i++) {
        const factor: number = typeof components[i] === 'string' ? rating[components[i]] : components[i];

        // Sigmoidal transformation
        //y = (rating[component] - 70) / 10;
        //rcomp = y / Math.sqrt(1 + y ** 2);
        //rcomp = (rcomp + 1) * 50;
        const rcomp = weights[i] * factor;

        r += rcomp;

        divideBy += 100 * weights[i];
    }


    r /= divideBy;  // Scale from 0 to 1

	// add YWTadj
	// add langAdj
	r += YWTadj;
	r += langAdj;

//	console.log(r);

    if (r > 1) {
        r = 1;
    } else if (r < 0) {
        r = 0;
    }

	if (g.customRosterMode) {
		r = Math.pow(r,g.customRosterModeStrength);
	}

	//console.log(r);

    return r;
}

/**
 * Load all teams into an array of team objects.
 *
 * The team objects contain all the information needed to simulate games. It would be more efficient if it only loaded team data for teams that are actually playing, particularly in the playoffs.
 *
 * @memberOf core.game
 * @param {IDBTransaction} ot An IndexedDB transaction on players and teams.
 * @param {Promise} Resolves to an array of team objects, ordered by tid.
 */
async function loadTeams() {
    return Promise.all(_.range(g.numTeams).map(async (tid) => {
        var [players, {cid, did},teamCoach,teamSeason,champions,championPatch] = await Promise.all([
            idb.cache.players.indexGetAll('playersByTid', tid),
            idb.cache.teams.get(tid),
			idb.getCopy.teamsPlus({attrs: ["coach"], season: g.season, tid: tid }),
            idb.cache.teamSeasons.indexGet('teamSeasonsByTidSeason', `${tid},${g.season}`),
            idb.cache.champions.getAll(),
            idb.cache.championPatch.getAll(),
		//	idb.cache.schedule.getAll(),
        ]);

	/*		console.log(schedule);
		let userGame = false;
		let usersGame = [];

		for (let i = 0; i < schedule.length; i++) {
			if (schedule[i].homeTid == g.userTid || schedule[i].awayTid == g.userTid) {
				usersGame = helpers.deepCopy(schedule[i]);
				userGame = true;
				break;
			}
		}	*/
	//	console.log(tid);

	//	let drafted = await draft.setDraftOrder(drafted,usersGame);
		//console.log("teams loaded");
	//	console.log(tid);
		//console.log(teamSeason);
		//console.log(teamCoach);
	//	console.log(champions);
	//let undrafted = await idb.cache.champions.getAll();
	//console.log(undrafted);
//	throw new Error("Something went badly wrong!");
		//console.log(championPatch);
		//var i, j, numPlayers, p, rating, t, teamSeason, k;
		var i, j, k;
		var adjustment,idealPosition;
		var c = [];
		var c2 = [];

		for (i = 0; i < champions.length; i++) {
//			c[i] = [];
//			c[i] = champions[i];
			c.push(champions[i]);
		//	c2[i] = [];
		//	c2[i] = champions[i];
		//	console.log(c2[i]);
		}
		//	console.log(tid);
//			console.log(champions.length);
	//		console.log(c);




		var championRank = [];
		for (i = 0; i < championPatch.length; i++) {
			championRank[i] = championPatch[i];
		}
	//	console.log(championRank);

        players.sort((a, b) => a.rosterOrder - b.rosterOrder);

        // Initialize team composite rating object
        const compositeRating = {};
        for (const rating of Object.keys(COMPOSITE_WEIGHTS)) {
            compositeRating[rating] = 0;
        }
		//console.log(teamCoach);
		delete teamCoach.coach ;
		//console.log(teamCoach);
		if (teamCoach.coach == undefined) {
			teamCoach.coach = {
				top: 5,
				jgl: 5,
				mid: 5,
				adc: 5,
				sup: 5,
				topJGL: 5,
				jglJGL: 5,
				midJGL: 5,
				adcJGL: 5,
				supJGL: 5,

			}
		}
		//	console.log(teamCoach);
        const t = {
            id: tid,
            defense: 0,
            pace: 0,
            won: teamSeason.won,
            lost: teamSeason.lost,
            cid,
            did,
            stat: {},
            player: [],
            synergy: {off: 0, def: 0, reb: 0},
            healthRank: teamSeason.expenses.health.rank,
            compositeRating,
			coach: teamCoach.coach,
        };
	//	console.log(t);

	///////// See how much penalty comes from languanges
		var topRanked,position,r;
		var langAdj,countryAdj;
		var langList,countryList;
		var maxLength,currentLength;
		var starterNumber;

		langList = [];
		countryList = [];
		//for (i = 0; i < players.length; i++) {


		////////////// Penalty For Not Speaking Same Languange
		// just want starters
		if (players.length>5) {
			starterNumber = 5;
		} else {
			//console.log(t.id);
			starterNumber = players.length;
		}
		for (i = 0; i < starterNumber; i++) {
			if 	(typeof(players[i].languages) != 'undefined') {
				for (j = 0; j < players[i].languages.length; j++) {
						langList.push(players[i].languages[j]);
				}
			}
		}

		langList.sort();

		maxLength = 1;
		currentLength = 1;
		for (i = 1; i < langList.length; i++) {
			if (langList[i] ==  langList[i-1]) {
				currentLength += 1;
			} else {
				currentLength = 1;
			}
			if (currentLength > maxLength) {
				maxLength = currentLength;
			}

		}

		langAdj = (maxLength-5)/5; // scale of -.8 to 0;
		langAdj /= 20;  // scale of -.04 to 0

		////////////// Penalty For Not Coming from Same Country
		// just want starters
		for (i = 0; i < starterNumber; i++) {
			if 	(typeof(players[i].born.country) != 'undefined') {
				countryList.push(players[i].born.country);
			}
		}

		countryList.sort();

		maxLength = 1;
		currentLength = 1;
		for (i = 1; i < countryList.length; i++) {
			if (countryList[i] ==  countryList[i-1]) {
				currentLength += 1;
			} else {
				currentLength = 1;
			}
			if (currentLength > maxLength) {
				maxLength = currentLength;
			}

		}

		countryAdj = (maxLength-5)/5; // scale of -.8 to 0;
		countryAdj /= 20;  // scale of -.04 to 0

		// combine language and country aspects
		langAdj += countryAdj;

		//console.log(players[0].champions);  // player skill 10% impact?
		//console.log(champions);
		//console.log(champions.ratings);
		//console.log(champions[0].ratings.counter);
		//console.log(champions[0].ratings.synergy);
		//console.log(champions[0].ratings.early);
		//console.log(champions[0].ratings.mid);
		//console.log(champions[0].ratings.late);
		//console.log(championPatch);
		//console.log(championPatch[0].rank);


        for (let i = 0; i < players.length; i++) {

			players = await draft.champDraftValues(championPatch,champions,players,i);

			//console.log(players[i].ratings);
            let rating = players[i].ratings.find(r => r.season === g.season);
			//console.log(rating);
            if (rating === undefined) {
                // Sometimes this happens for unknown reasons, so gracefully handle it
                rating = players[i].ratings[players[i].ratings.length - 1];
            }
			/*
			if (players[i].pos == "JGL") {
			   position = "Jungle";
			} else 	if (players[i].pos == "SUP") {
			   position = "Support";
			} else 	if (players[i].pos == "MID") {
			   position = "Middle";
			} else 	if (players[i].pos == "TOP") {
			   position = "Top";
			} else {
			   position = players[i].pos;
			}

			if (i==0) {
				idealPosition = "Top";
			} else if (i==1) {
				idealPosition = "Jungle";
			} else if (i==2) {
				idealPosition = "Middle";
			} else if (i==3) {
				idealPosition = "ADC";
			} else if (i==4) {
				idealPosition = "Support";
			}

		//console.log(j+" "+r+" "+i+" "+idealPosition+" "+position);
			if (idealPosition ==  position) {
				adjustment = 1.00;
			} else {
				adjustment = 0.50;
			}

		//	console.log(champions.length);
			for (j = 0; j < champions.length; j++) {

				if (players[i].champions[j] == undefined) {
					players[i].champions[j] = {};
					players[i].champions[j].draftValue =  50;

				} else if ( (players[i].championAverage == -1) || (players[i].championAverage == undefined)) {
					players[i].champions[j].draftValue =  (players[i].champions[j].skill);
				} else {
					players[i].champions[j].draftValue =  Number(players[i].championAverage);
				}

				topRanked = championPatch.length;
				let cpid = 0;
				for (r = 0; r < championPatch.length; r++) {
					if ((players[i].champions[j].name == championRank[r].champion) && (position == championRank[r].role)) {
						  if  (championRank[r].rank < topRanked) {
								topRanked = championRank[r].rank;
								cpid = r;
						  }
				   }
				}

				players[i].champions[j].draftValue += (200*adjustment-topRanked)*.8; // range from 1 to .5, or same to double
				players[i].champions[j].cpid = cpid; // range from 1 to .5, or same to double

			}
			players[i].champions.length = champions.length;
			*/

         /*   p = {
			id: players[i].pid,
			userID: players[i].userID,
			name: players[i].name,
			pos: players[i].pos,
			posPlayed: players[i].posPlayed,
			ChampUsed: "",
			championRank: championRank,
			champRel: c,
			champions: players[i].champions,
			valueNoPot: players[i].valueNoPot,
			stat: {}, compositeRating: {}, skills: [], injury: players[i].injury, injured: players[i].injury.type !== "Healthy", ptModifier: players[i].ptModifier,
			pick: players[i].pick,
			ban: players[i].ban};*/

		//	console.log(c);
	//	console.log(champions);
	//let undrafted = await idb.cache.champions.getAll();
	//console.log(undrafted);
	//throw new Error("Something went badly wrong!");
            const p = {
                id: players[i].pid,
				userID: players[i].userID,
                name: `${players[i].firstName} '${players[i].userID}' ${players[i].lastName}`,
                pos: rating.pos,
                ovr: rating.ovr,
				posPlayed: players[i].posPlayed,
				ChampUsed: "",
				//championRank: championRank,
				//champRel: c,
				//champ2Rel: c,
				champions: players[i].champions,
                valueNoPot: players[i].valueNoPot,
                stat: {},
                compositeRating: {},
                skills: rating.skills,
                injury: players[i].injury,
                injured: players[i].injury.type !== "Healthy",
                ptModifier: players[i].ptModifier,
                pick: players[i].pick,
                ban: players[i].ban,
            };

		//	console.log(p);
            // Reset ptModifier for AI teams. This should not be necessary since it should always be 1, but let's be safe.
            if (!g.userTids.includes(t.id)) {
                p.ptModifier = 1;
				p.pick = 0;
				p.ban = 0;
            }


			var YWTadj; // give a bonus for being with team longer than 1 year, bump all ratings up 1 point for each year
			if (players[i].stats !== undefined) {
				if (players[i].stats.length !== undefined) {
					if (players[i].stats[players[i].stats.length-1] !== undefined) {
						if (players[i].stats[players[i].stats.length-1].yearsWithTeam !== undefined) {
							YWTadj = players[i].stats[players[i].stats.length-1].yearsWithTeam/50-.02;
						} else {
							YWTadj = 0;
						}
					} else  {
						YWTadj = 0;
					}
				} else {
					YWTadj = 0;
				}
			} else {
				YWTadj = 0;
			}



            // These use the same formulas as the skill definitions in player.skills!
            for (const k of helpers.keys(COMPOSITE_WEIGHTS)) {
                p.compositeRating[k] = makeComposite(rating, COMPOSITE_WEIGHTS[k].ratings, COMPOSITE_WEIGHTS[k].weights,YWTadj,langAdj);
            }
		//	console.log(p);
            // eslint-disable-next-line operator-assignment
            p.compositeRating.usage = p.compositeRating.usage ** 1.9;
			//console.log(JSON.stringify(p.compositeRating));
//            p.stat = {gs: 0, min: 0, fg: 0, fga: 0, fgAtRim: 0, fgaAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, pm: 0, orb: 0, drb: 0, ast: 0, tov: 0, stl: 0, blk: 0, ba: 0, pf: 0, pts: 0, courtTime: 0, benchTime: 0, energy: 1};
			p.stat = {gs: 0, min: 0, fg: 0, fga: 0,fgp:0, fgAtRim: 0, fgaAtRim: 0, fgpAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0,trb: 0, ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, courtTime: 0, benchTime: 0, energy: 1,oppJM:0,oppInh:0,oppTw:0,champPicked:"",cpid:"",scTwr:0,scKills:0,
				grExpTwr:0,
				grExpKills:0,
				grGldTwr:0,
				grGldKills:0,
				tmBuffTwr:0,
				tmBuffKills:0,
				tmBAdjTwr:0,
				tmBAdjKills:0,
				TPTwr:0,
				TPKills:0,
				TwTwr:0,
				TwKills:0,
				CKTwr:0,
				CKKills:0,
			/*	CKTwr:0,
				CKKills:0,	*/
				CSTwr:0,
				CSKills:0,
				AgTwr:0,
				AgKills:0,
				ChmpnTwr:0,
				ChmpnKills:0,
				riftKills:0,
				riftAssists:0,
				firstBlood:0,
			};

		//	console.log(p);
            t.player.push(p);
        }

		//console.log(t);

        // Number of players to factor into pace and defense rating calculation
        let numPlayers = t.player.length;
        if (numPlayers > 7) {
            numPlayers = 7;
        }

	/*	console.log(c.length+" "+champions.length);
		console.log(c);
		if (c.length < champions.length) {
			c = [];
			//c2 = [];

			for (i = 0; i < champions.length; i++) {
				//c[i] = [];
				//c[i] = champions[i];
				c.push(champions[i]);
			//	c2[i] = [];
			//	c2[i] = champions[i];
			}
		console.log(c.length+" "+champions.length);
				console.log(c);

		} else {
		}*/

        // Would be better if these were scaled by average min played and endurancence
        t.pace = 0;
        for (let i = 0; i < numPlayers; i++) {
            t.pace += t.player[i].compositeRating.pace;
        }
		//console.log(c);
        t.pace /= numPlayers;
        t.pace = t.pace * 15 + 100;  // Scale between 100 and 115

		t.champRel = c;
		t.champ2Rel = c;
		t.championRank = championRank;
 //       t.stat = {min: 0, fg: 0, fga: 0, fgAtRim: 0, fgaAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0, ast: 0, tov: 0, stl: 0, blk: 0, ba: 0, pf: 0, pts: 0, ptsQtrs: [0]};
	   t.stat = {min: 0, fg: 0, fga: 0,fgp:0, fgAtRim: 0, fgaAtRim: 0, fgpAtRim: 0, fgLowPost: 0, fgaLowPost: 0, fgMidRange: 0, fgaMidRange: 0, tp: 0, tpa: 0, ft: 0, fta: 0, orb: 0, drb: 0, trb: 0,ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, pts: 0, ptsQtrs: [0],oppJM:0,oppInh:0,oppTw:0,scTwr:0,scKills:0,
			grExpTwr:0,
			grExpKills:0,
			grGldTwr:0,
			grGldKills:0,
			tmBuffTwr:0,
			tmBuffKills:0,
			tmBAdjTwr:0,
			tmBAdjKills:0,
			TPTwr:0,
			TPKills:0,
			TwTwr:0,
			TwKills:0,
			CKTwr:0,
			CKKills:0,
			/*CKTwr:0,
			CKKills:0,	*/
			CSTwr:0,
			CSKills:0,
			AgTwr:0,
			AgKills:0,
			ChmpnTwr:0,
			ChmpnKills:0,
			riftKills:0,
			riftAssists:0,
			firstBlood:0,
		};
		//console.log(t);

        return t;
    }));
}

/**
 * Play one or more days of games.
 *
 * This also handles the case where there are no more games to be played by switching the phase to either the playoffs or before the draft, as appropriate.
 *
 * @memberOf core.game
 * @param {number} numDays An integer representing the number of days to be simulated. If numDays is larger than the number of days remaining, then all games will be simulated up until either the end of the regular season or the end of the playoffs, whichever happens first.
 * @param {boolean} start Is this a new request from the user to play games (true) or a recursive callback to simulate another day (false)? If true, then there is a check to make sure simulating games is allowed. Default true.
 * @param {number?} gidPlayByPlay If this number matches a game ID number, then an array of strings representing the play-by-play game simulation are included in the api.realtimeUpdate raw call.
 */
async function play(numDays: number, conditions: Conditions, start?: boolean = true, gidPlayByPlay?: number) {

	//console.log("play");
    // This is called when there are no more games to play, either due to the user's request (e.g. 1 week) elapsing or at the end of the regular season
    const cbNoGames = async () => {
        // Check to see if the season is over
//        if (g.phase < g.PHASE.PLAYOFFS) {
				//	console.log("SCHEDULE");
				//	console.log(g.phase+" "+g.seasonSplit);
			//	console.log(g.phase);
		if ((g.phase < g.PHASE.PLAYOFFS && g.gameType <6) ||
		(g.phase < g.PHASE.MSI && g.gameType >= 6 && g.seasonSplit == "Spring") ||
		(g.phase > g.PHASE.MIDSEASON && g.phase < g.PHASE.PLAYOFFS && g.gameType >= 6 && g.seasonSplit == "Summer")) {
            const schedule = await season.getSchedule();
			//console.log(schedule.length);
			//console.log(schedule);
            if (schedule.length === 0) {
				if (g.gameType < 6) {
			//		console.log("PLAYOFFS");
					await phase.newPhase(g.PHASE.PLAYOFFS, conditions, gidPlayByPlay !== undefined);
				} else if (g.seasonSplit == "Spring") {
				//	console.log("MSI");
					await phase.newPhase(g.PHASE.MSI, conditions, gidPlayByPlay !== undefined);
				} else {
					//console.log("PLAYOFFS");
					await phase.newPhase(g.PHASE.PLAYOFFS, conditions, gidPlayByPlay !== undefined);
				}
            }
        }
					//console.log(g.phase+" "+g.seasonSplit);
					//console.log("SCHEDULE");
        await updateStatus('Saving...');
        await idb.cache.flush();
					//console.log(g.phase+" "+g.seasonSplit);
        await updateStatus('Idle');
        lock.set('gameSim', false);
        await updatePlayMenu();
    };
//console.log("got here");
    // Saves a vector of results objects for a day, as is output from cbSimGames
    const cbSaveResults = async results => {


        const gidsFinished = await Promise.all(results.map(async (result) => {
            const att = await writeTeamStats(result);
            await writePlayerStats(result, conditions); // Before writeGameStats, so injury is set correctly
            await writeGameStats(result, att, conditions);
            return result.gid;
        }));

        const promises = [];

	//	console.log(g.phase+" "+g.PHASE.PLAYOFFS+" "+g.PHASE.MSI);
        // Update playoff series W/L
        if (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI) {
			//		console.log("SCHEDULE");
            promises.push(updatePlayoffSeries(results, conditions));
		//	console.log("got here?");
        }


        // Delete finished games from schedule
        for (let j = 0; j < gidsFinished.length; j++) {
            promises.push(idb.cache.schedule.delete(gidsFinished[j]));
        }

        // Update ranks
        promises.push(finances.updateRanks(["expenses", "revenues"]));

        // Injury countdown - This must be after games are saved, of there is a race condition involving new injury assignment in writeStats
        const players = await idb.cache.players.indexGetAll('playersByTid', [PLAYER.FREE_AGENT, Infinity]);
        for (const p of players) {
            let changed = false;
            if (p.injury.gamesRemaining > 0) {
                p.injury.gamesRemaining -= 1;
                changed = true;
            }
            // Is it already over?
            if (p.injury.type !== "Healthy" && p.injury.gamesRemaining <= 0) {
                p.injury = {type: "Healthy", gamesRemaining: 0};
                changed = true;

                logEvent({
                    type: "healed",
                    text: `<a href="${helpers.leagueUrl(["player", p.pid])}">${p.firstName} ${p.userID} ${p.lastName}</a> has recovered from his injury.`,
                    showNotification: p.tid === g.userTid,
                    pids: [p.pid],
                    tids: [p.tid],
                }, conditions);
            }

            // Also check for gamesUntilTradable
            if (!p.hasOwnProperty("gamesUntilTradable")) {
                p.gamesUntilTradable = 0; // Initialize for old leagues
                changed = true;
            } else if (p.gamesUntilTradable > 0) {
                p.gamesUntilTradable -= 1;
                changed = true;
            }

            if (changed) {
                await idb.cache.players.put(p);
            }
        }

        await Promise.all(promises);

        await advStats();

        // If there was a play by play done for one of these games, get it
        let raw;
        let url;
        if (gidPlayByPlay !== undefined) {
            for (let i = 0; i < results.length; i++) {
                if (results[i].playByPlay !== undefined) {
                    raw = {
                        gidPlayByPlay,
                        playByPlay: results[i].playByPlay,
                    };
                    url = helpers.leagueUrl(["live_game"]);
                }
            }

            await toUI(['realtimeUpdate', ['gameSim'], url, raw], conditions);
        } else {
            url = undefined;

            await toUI(['realtimeUpdate', ['gameSim']]);
        }

        //if (g.phase === g.PHASE.PLAYOFFS) {
        if (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI) {

		//    console.log("got here");
            const playoffsOver = await season.newSchedulePlayoffsDay();
            if (playoffsOver) {
				//console.log("playoffs over");
				//console.log(g.gameType+" "+g.seasonSplit+" "+g.phase);
//				if (g.gameType < 6 || g.seasonSplit == "Summer") {
				if (g.phase == g.PHASE.PLAYOFFS) {
				//console.log("before draft");
					await phase.newPhase(g.PHASE.BEFORE_DRAFT, conditions, gidPlayByPlay !== undefined);
				} else {
				//console.log("midseason");
					await phase.newPhase(g.PHASE.MIDSEASON, conditions, gidPlayByPlay !== undefined);
				}
            }
        } else if (Math.random() < 1 / (100 * 50 * g.numTeams/30 * 10 / 15)) {  // adjust for number of teams and smaller roster sizes
            // Should a rare tragic event occur? ONLY IN REGULAR SEASON, playoffs would be tricky with roster limits and no free agents
            // 100 days in a season (roughly), and we want a death every 50 years on average
            await player.killOne(conditions);
            toUI(['realtimeUpdate', ['playerMovement']]);
        }

        if (numDays - 1 <= 0) {
            await cbNoGames();
        } else {
            play(numDays - 1, conditions, false);
        }
    };

	//console.log("got here");
    // Simulates a day of games (whatever is in schedule) and passes the results to cbSaveResults
    const cbSimGames = async (schedule, teams) => {
//console.log(schedule);
        const results = [];
		//console.log(schedule.length);
		//console.log(schedule);
	//let testtesttest = await idb.cache.champions.getAll();
	//	console.log(undrafted);
//console.log(JSON.parse(JSON.stringify(testtesttest)));
	//console.log(undrafted);
//	throw new Error("Something went badly wrong!");
//console.log(schedule);
        for (let i = 0; i < schedule.length; i++) {
//console.log(schedule);
		//	console.log("got here");
			//console.log(i);
		//	console.log(schedule[i].homeTid);
		//	console.log(schedule[i].awayTid);
		//	console.log(schedule[i]);
            const doPlayByPlay = gidPlayByPlay === schedule[i].gid;
	//console.log(JSON.parse(JSON.stringify(testtesttest)));
		//	console.log(schedule[i]);
		//console.log(schedule[i]);
			if (schedule[i].champions == undefined) {
		//console.log(schedule[i].gid);
		//console.log(schedule[i].homeTid);
		//console.log(schedule[i].awayTid);
		//console.log(teams);
		//console.log(teams);
		//console.log(teams[schedule[i].homeTid]);
		//console.log(teams[schedule[i].awayTid]);

			//	let schedule = await idb.cache.schedule.getAll();
				let undrafted = await idb.cache.champions.getAll();
				let patch = await idb.cache.championPatch.getAll();
	//console.log(schedule);
				var teamHome;
				var teamAway;

				let iii;
				let ii;
				let usersGame;
				let drafted;
	//console.log(schedule);
				for (ii = 0; ii < undrafted.length; ii++) {
			//	console.log(schedule);
					let early =  undrafted[ii].ratings.early;
					let mid =  undrafted[ii].ratings.mid;
					let late  =  undrafted[ii].ratings.late;
					if (early>mid && early>late) {
						undrafted[ii].ratings.earlyMidLate = "Early";
					} else if (mid>early && mid>late) {
						undrafted[ii].ratings.earlyMidLate = "Mid";
					} else {
						undrafted[ii].ratings.earlyMidLate = "Late";
					}
					undrafted[ii].lane = "";
					for (iii = 0; iii < patch.length; iii++) {
				//		console.log(i+" "+patch.length+" "+ii+" "+undrafted.length+" "+patch[i].champion+" "+undrafted[ii].name);
					  if (patch[i].champion == undrafted[ii].name) {
						  if (undrafted[ii].lane.length == 0) {
							undrafted[ii].lane += patch[iii].role;
						  } else {
							undrafted[ii].lane += " ";
							undrafted[ii].lane += patch[iii].role;
						  }

					  }
					}
				}

			//	console.log(undrafted);


			//	for (i = 0; i < schedule.length; i++) {
			//	console.log(schedule[i]);
			//	schedule[i] = champions{};
				schedule[i].champions = {undrafted: undrafted};

				usersGame = helpers.deepCopy(schedule[i]);


				teamHome = await idb.cache.players.indexGetAll(
						"playersByTid",
						usersGame.homeTid,
					);

				teamAway = await idb.cache.players.indexGetAll(
						"playersByTid",
						usersGame.awayTid,
					);

				drafted = [];

				drafted = await draft.setDraftOrder(drafted,usersGame);
			//	console.log(drafted);
				schedule[i].champions.drafted = drafted;
				schedule[i].champions.patch = patch;
				schedule[i].teamHome = teamHome;
				schedule[i].teamAway = teamAway;
				ii = i;
				schedule[ii] = 	helpers.deepCopy(schedule[ii]);
			//	}

			}


            const gs = new GameSim(schedule[i], schedule[i].gid, teams[schedule[i].homeTid], teams[schedule[i].awayTid], doPlayByPlay);
			//	console.log(JSON.parse(JSON.stringify(testtesttest)));

			//let undrafted = await idb.cache.champions.getAll();
//	console.log(undrafted);
//	throw new Error("Something went badly wrong!");
		//	console.log("got here");
		//	console.log(gs);
            results.push(gs.run());
        }
	//		let undrafted = await idb.cache.champions.getAll();
	//console.log(undrafted);
	//console.log(JSON.parse(JSON.stringify(testtesttest)));
	//throw new Error("Something went badly wrong!");

				//	console.log("got here");
		/*await idb.cache.champions.clear();
		for (let i = 0; i < testtesttest.length; i++) {
			let c = testtesttest[i];
			await idb.cache.champions.add(c);
			//dao.champions.add({ot: tx, value: c});
		}*/
	//throw new Error("Something went badly wrong!");

        await cbSaveResults(results);
				//	console.log("got here");
    };
	//console.log("got here");
    // Simulates a day of games. If there are no games left, it calls cbNoGames.
    // Promise is resolved after games are run
    const cbPlayGames = async () => {
        if (numDays === 1) {
		//	console.log("got here");
          //  await updateStatus('Playing (1 day left)');
			if (g.phase == g.PHASE.MSI || g.phase == g.PHASE.PLAYOFFS) {
				await updateStatus('Playing (1 day left)');
			} else {
				await updateStatus('Playing (1 week left)');
			}
        } else {
					//	console.log("got here");
			if (g.phase == g.PHASE.MSI || g.phase == g.PHASE.PLAYOFFS) {

				await updateStatus(`Playing (${numDays} days left)`);
			} else {
				await updateStatus(`Playing (${numDays} weeks left)`);
			}
        }
		//	console.log("got here");
        let schedule = await season.getSchedule(true);
		//	console.log("got here");
        // Stop if no games
        // This should also call cbNoGames after the playoffs end, because g.phase will have been incremented by season.newSchedulePlayoffsDay after the previous day's games


/*        if (schedule.length === 0 && g.phase == g.PHASE.MIDSEASON) {

            return ;
        }*/

        if (schedule.length === 0 && g.phase !== g.PHASE.PLAYOFFS && g.phase !== g.PHASE.MSI) {
			//console.log("got here");
            return cbNoGames();
        }
		//	console.log("got here");
        // Load all teams, for now. Would be more efficient to load only some of them, I suppose.
        const teams = await loadTeams();

      //  console.log(schedule);
        // Play games
        // Will loop through schedule and simulate all games
        if (schedule.length === 0 && (g.phase === g.PHASE.PLAYOFFS || g.phase === g.PHASE.MSI) ) {
            // Sometimes the playoff schedule isn't made the day before, so make it now
            // This works because there should always be games in the playoffs g.PHASE. The next phase will start before reaching this point when the playoffs are over.
		//console.log("got here");
            await season.newSchedulePlayoffsDay();

            schedule = await season.getSchedule(true);

        }
		//	console.log(schedule);
		//	console.log(teams);

		//console.log("got here");
        await cbSimGames(schedule, teams);
    };
	//console.log("got here");
    // This simulates a day, including game simulation and any other bookkeeping that needs to be done
    const cbRunDay = () => {
	let timeOut = 1000;
	if (g.gameType == 1) {
		timeOut = 1500; //2000
	} else if (g.gameType == 5) {
		timeOut = 3000;//4000
	} else if (g.gameType == 6) {
		timeOut = 3000;  //4000
	} else if (g.gameType == 7) {
		timeOut = 3000; //10000 smooth, but slow, // 2000 issues with crashing and history page showing
	}
        // setTimeout is for responsiveness during gameSim with UI that doesn't hit IDB
        setTimeout(async () => {
//console.log("Got here");
//console.log(numDays);
            if (numDays > 0) {
//console.log("Got here");
                // If we didn't just stop games, let's play
                // Or, if we are starting games (and already passed the lock), continue even if stopGameSim was just seen
                const stopGameSim = lock.get('stopGameSim');
//console.log(stopGameSim);
//console.log(start);
                if (start || !stopGameSim) {
                    // If start is set, then reset stopGames
                    if (stopGameSim) {
                        lock.set('stopGameSim', false);
                    }

                    if (g.phase !== g.PHASE.PLAYOFFS && g.phase !== g.PHASE.MSI) {
							//	console.log("got here");
                        await freeAgents.decreaseDemands();
								//console.log("got here");
                        await freeAgents.autoSign();
							//	console.log("got here");
						if (g.aiTrades) {
							if (g.gameType < 5) {
								if (Math.random() < .33) {
									await trade.betweenAiTeams();
									await team.checkRosterSizes();
								}
							} else if (g.gameType == 5) {
							//	console.log("got here");
									await trade.betweenAiTeams();
									await trade.betweenAiTeams();
							//	console.log("got here");
									await team.checkRosterSizes();
							//	console.log("got here");
							} else if (g.gameType == 6) {
									await trade.betweenAiTeams();
									await team.checkRosterSizes();
							} else if (g.gameType == 7) {
									await trade.betweenAiTeams();
									await trade.betweenAiTeams();
									await team.checkRosterSizes();
							}
						}

                    }
//console.log("Got here");
                    await cbPlayGames();
                } else {
//console.log("Got here");
                    // Update UI if stopped
                    await cbNoGames();
                }
            } else if (numDays === 0) {
				console.log("Got here");
                // If this is the last day, update play menu
                await cbNoGames();
            }
        }, timeOut);
    };
	//console.log("got here");
    // If this is a request to start a new simulation... are we allowed to do
    // that? If so, set the lock and update the play menu
	//	console.log(start);
    if (start) {
        const canStartGames = await lock.canStartGames();
//console.log(canStartGames);
        if (canStartGames) {
            const userTeamSizeError = await team.checkRosterSizes(conditions);
			//console.log(userTeamSizeError);

            if (userTeamSizeError === undefined) {
			//	console.log("got here");
                await updatePlayMenu();
                cbRunDay();
            } else {
			//	console.log("got here");
                lock.set('gameSim', false); // Counteract auto-start in lock.canStartGames
                await updateStatus('Idle');
                logEvent({
                    type: 'error',
                    text: userTeamSizeError,
                    saveToDb: false,
                }, conditions);
            }
        }
    } else {
	//console.log("got here");
        cbRunDay();
    }
}

export default {
    // eslint-disable-next-line import/prefer-default-export
    play,
};
