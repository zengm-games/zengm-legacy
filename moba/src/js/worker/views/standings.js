// @flow

import {g, helpers} from '../../common';
import {idb} from '../db';
import type {UpdateEvents} from '../../common/types';

async function updateStandings(
    inputs: {season: number, conference: string},
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    if ((inputs.conference !== state.conference || inputs.season === g.season && updateEvents.includes('gameSim')) || inputs.season !== state.season) {
        const teams = helpers.orderBySplitWinp(await idb.getCopies.teamsPlus({
            attrs: ["tid", "cid", "did", "abbrev", "region", "name", "imgURL",  "imgURLCountry","countrySpecific"],
            seasonAttrs: ["won", "lost","pointsSpring","pointsSummer","wonSummer", "lostSpring","lostSummer", "wonSpring", "winp", "winpSpring", "winpSummer", "wonHome", "lostHome", "wonAway", "lostAway", "wonDiv", "lostDiv", "wonConf", "lostConf", "lastTen", "streak","cidStart", "cidMid","imgURLCountry","countrySpecific","playoffRoundsWon","playoffRoundsWonWorlds"],
				    stats: ["kda","fg","fga","fgp","pf","oppTw"],
            season: inputs.season,
        }));
//console.log(teams);
//console.log(g.seasonSplit);
        //const numPlayoffTeams = 2 ** g.numPlayoffRounds;
		const numPlayoffTeams = 0;

        let confs = [];
		//console.log(g.confs);
        for (let i = 0; i < g.confs.length; i++) {
        //  console.log(i);
            const playoffsRank = [];
            const confTeams = [];
            let j = 0;
            for (const t of teams) {

			//	console.log(t);
				//console.log(t.tid+" "+t.region+" "+t.name+" "+t.seasonAttrs.playoffRoundsWon);
			//	console.log(t.tid+" "+t.cid+" "+t.region+" "+t.name+" "+t.seasonAttrs.playoffRoundsWon+" "+t.seasonAttrs.playoffRoundsWonWorlds);
			//	console.log(t.tid+" "+t.cid+" "+t.region+" "+t.name+" "+t.seasonAttrs.playoffRoundsWon+" "+t.seasonAttrs.playoffRoundsWonWorlds);
				if (t.seasonAttrs.imgURLCountry == undefined) {
					t.seasonAttrs.imgURLCountry = t.imgURLCountry
				}
				if (t.imgURLCountry == undefined) {
					t.imgURLCountry = t.seasonAttrs.imgURLCountry
				}
        if (t.imgURLCountry == undefined) {
					t.imgURLCountry = t.seasonAttrs.imgURLCountry
				}
				t.seasonAttrs.imgURLCountry = t.seasonAttrs.imgURLCountry.replace(/ +/g, "");
				t.imgURLCountry = t.imgURLCountry.replace(/ +/g, "");

		//.split(" ").join();
				//console.log(t.tid+" "+t.seasonAttrs.imgURLCountry+" "+t.imgURLCountry);
				//console.log(t.imgURLCountry);

				//console.log(t.seasonAttrs.pointsSummer);
				if (t.seasonAttrs.pointsSummer == 1000) {
					//console.log(t.seasonAttrs.pointsSummer);
					t.seasonAttrs.pointsSummer = "AQ";
					//console.log(t.seasonAttrs.pointsSummer);
				}

				let cidUsed;
				if (g.seasonSplit == "Summer") {
//				if (g.gameType == 7) {
					cidUsed = t.seasonAttrs.cidMid;
				} else {
					cidUsed = t.seasonAttrs.cidStart;
				}

				if (cidUsed < 0) {
					cidUsed = t.cid;
				}

                if (g.confs[i].cid === cidUsed) {
                    playoffsRank[t.tid] = j + 1; // Store ranks by tid, for use in division standings
                    confTeams.push(helpers.deepCopy(t));
                    confTeams[j].rank = j + 1;
                    if (j === 0) {
                        confTeams[j].gb = 0;
                        confTeams[j].gbSpring = 0;
                        confTeams[j].gbSummer = 0;
                    } else {
                        //confTeams[j].gb = helpers.gb(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);
						if (g.seasonSplit == "Summer") {
							confTeams[j].gb = helpers.gbSummer(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);

							confTeams[j].gbSpring = 0;
							confTeams[j].gbSummer = helpers.gbSummer(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);
						} else {
							confTeams[j].gb = helpers.gbSpring(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);

							confTeams[j].gbSummer = 0;
							confTeams[j].gbSpring = helpers.gbSpring(confTeams[0].seasonAttrs, confTeams[j].seasonAttrs);
						}
                    }
                    if (confTeams[j].tid === g.userTid) {
                        confTeams[j].highlight = true;
                    } else {
                        confTeams[j].highlight = false;
                    }
                    j += 1;
                }
            }
//console.log(i);
//console.log(g.confs[i]);

            confs.push({cid: g.confs[i].cid, name: g.confs[i].name, divs: [], teams: confTeams});
	//	console.log(g.gameType);
            for (const div of g.divs) {
                if (div.cid === g.confs[i].cid) {
                    const divTeams = [];
                    let k = 0;
                    for (const t of teams) {
						let cidUsed;

						if (g.gameType == 7) {
							if (t.seasonAttrs.cidStart % 3 == 0 ) {
								t.seasonAttrs.confSpring = "LCS";
							} else if (t.seasonAttrs.cidStart % 3 == 1 ) {
								t.seasonAttrs.confSpring = "CS";
							} else if (t.seasonAttrs.cidStart % 3 == 2 ) {
								t.seasonAttrs.confSpring = "LDR";
							}

							if (t.seasonAttrs.cidMid % 3 == 0 ) {
								t.seasonAttrs.confSummer = "LCS";
							} else if (t.seasonAttrs.cidMid % 3 == 1 ) {
								t.seasonAttrs.confSummer = "CS";
							} else if (t.seasonAttrs.cidMid % 3 == 2 ) {
								t.seasonAttrs.confSummer = "LDR";
							}
						} else if (g.gameType == 1) {
							if (t.cid % 3 == 0 ) {
								t.seasonAttrs.confSpring = "LCS";
							} else if (t.cid % 3 == 1 ) {
								t.seasonAttrs.confSpring = "CS";
							} else if (t.cid % 3 == 2 ) {
								t.seasonAttrs.confSpring = "LDR";
							}

							if (t.cid % 3 == 0 ) {
								t.seasonAttrs.confSummer = "LCS";
							} else if (t.cid % 3 == 1 ) {
								t.seasonAttrs.confSummer = "CS";
							} else if (t.cid % 3 == 2 ) {
								t.seasonAttrs.confSummer = "LDR";
							}
						} else {
								t.seasonAttrs.confSpring = "LCS";
								t.seasonAttrs.confSummer = "LCS";
								t.seasonAttrs.cidMid = t.cid
						}


						if (t.cid > 2 && t.cid <6) {
					//		console.log(t.tid+" "+t.cid+" "+t.seasonAttrs.cidStart+" "+t.seasonAttrs.confSpring+" "+t.seasonAttrs.cidMid+" "+t.seasonAttrs.confSummer);
					//		console.log(t);
					//		console.log(t.seasonAttrs);
						}


					//	let cidUsed;
						if (g.seasonSplit == "Summer") {
							cidUsed = t.seasonAttrs.cidMid;
						} else {
							cidUsed = t.seasonAttrs.cidStart;
						}

						if (cidUsed < 0) {
							cidUsed = t.cid;
						}

                        if (div.did === cidUsed) {
                            divTeams.push(helpers.deepCopy(t));
                            if (k === 0) {
                                divTeams[k].gb = 0;
                                divTeams[k].gbSpring = 0;
                                divTeams[k].gbSummer = 0;
                            } else {
                                //divTeams[k].gb = helpers.gb(divTeams[0].seasonAttrs, divTeams[k].seasonAttrs);
								if (g.seasonSplit == "Summer") {
									divTeams[k].gbSpring = 0;
									divTeams[k].gbSummer = helpers.gbSummer(divTeams[0].seasonAttrs, divTeams[k].seasonAttrs);
									divTeams[k].gb = helpers.gbSummer(divTeams[0].seasonAttrs, divTeams[k].seasonAttrs);

								} else {
									divTeams[k].gbSpring = helpers.gbSpring(divTeams[0].seasonAttrs, divTeams[k].seasonAttrs);
									divTeams[k].gbSummer = 0;
									divTeams[k].gb = helpers.gbSpring(divTeams[0].seasonAttrs, divTeams[k].seasonAttrs);

								}
                            }

                            if (playoffsRank[divTeams[k].tid] <= numPlayoffTeams / 2) {
                                divTeams[k].playoffsRank = playoffsRank[divTeams[k].tid];
                            } else {
                                divTeams[k].playoffsRank = null;
                            }

                            if (divTeams[k].tid === g.userTid) {
                                divTeams[k].highlight = true;
                            } else {
                                divTeams[k].highlight = false;
                            }

                            k += 1;
                        }
                    }

                    confs[i].divs.push({did: div.did, name: div.name, teams: divTeams});
                }
            }
        }
		//console.log(g.gameType);
			var playoffsByConference;

		if ( (g.gameType == 1)  ) {
			playoffsByConference = g.confs.length == 3;// && !localStorage.getItem('top16playoffs');
		} else if ( (g.gameType == 5) ) {
			playoffsByConference = g.confs.length == 6;// && !localStorage.getItem('top16playoffs');
		} else if ( (g.gameType == 6) ) {
			playoffsByConference = g.confs.length == 6;// && !localStorage.getItem('top16playoffs');
		} else if ( (g.gameType == 7) ) {
			playoffsByConference = g.confs.length == 18;// && !localStorage.getItem('top16playoffs');
		} else  {
			playoffsByConference = g.confs.length == 1;// && !localStorage.getItem('top16playoffs');
		}


        // Fix playoffsRank if conferences don't matter
        if (!playoffsByConference) {
			//console.log(teams);
			//console.log(confs);
            for (let i = 0; i < teams.length; i++) {
			//	console.log(i);
                const t = teams[i];
				var div;
				let cidUsed;
				if (g.seasonSplit == "Summer") {
					cidUsed = t.seasonAttrs.cidMid;
				} else {
					cidUsed = t.seasonAttrs.cidStart;
				}

				if (cidUsed < 0) {
					cidUsed = t.cid;
				}

				if (g.gameType == 7) {
					console.log(t);
                  div = confs[cidUsed].divs.find(div2 => cidUsed === div2.did);
				} else {
                  div = confs[cidUsed].divs.find(div2 => cidUsed === div2.did);
				}
                if (div) {
                    const t2 = div.teams.find(t3 => t.tid === t3.tid);
                    if (t2) {
                        t2.playoffsRank = i < numPlayoffTeams ? i + 1 : null;
                    }
                }
            }
        }

        // conference dropdown
        let confs2;
    //    console.log(g.confs);
    //    console.log(confs);
          if (inputs.conference == "all") {
            confs2 = confs;
          } else if (inputs.conference == "lcs") {
            confs2 = confs.filter((c) => c.cid%3 == 0);
          } else if (inputs.conference == "cs") {
            confs2 = confs.filter((c) => c.cid%3 == 1);
          } else if (inputs.conference == "ladder") {
            confs2 = confs.filter((c) => c.cid%3 == 2);
          } else if (inputs.conference == "lcsNA") {
            if (confs.length == 6) {
              confs2 = confs.filter((c) => c.cid%confs.length == 0);
            } else {
              confs2 = confs.filter((c) => c.cid%confs.length < 3);
            }
          } else if (inputs.conference == "lcsEU") {
            if (confs.length == 6) {
              confs2 = confs.filter((c) => c.cid%confs.length == 1);
            } else {
              confs2 = confs.filter((c) => c.cid%confs.length >= 3 && c.cid%confs.length < 6);
            }
          } else if (inputs.conference == "lck") {
            if (confs.length == 6) {
              confs2 = confs.filter((c) => c.cid%confs.length == 2);
            } else {
              confs2 = confs.filter((c) => c.cid%confs.length >= 6 && c.cid%confs.length < 9);
            }
          } else if (inputs.conference == "lpl") {
            if (confs.length == 6) {
              confs2 = confs.filter((c) => c.cid%confs.length == 3);
            } else {
              confs2 = confs.filter((c) => c.cid%confs.length >= 9 && c.cid%confs.length < 12);
            }
          } else if (inputs.conference == "lms") {
            if (confs.length == 6) {
              confs2 = confs.filter((c) => c.cid%confs.length == 4);
            } else {
              confs2 = confs.filter((c) => c.cid%confs.length >= 12 && c.cid%confs.length < 15);
            }
          } else if (inputs.conference == "wildCard") {
            if (confs.length == 6) {
              confs2 = confs.filter((c) => c.cid%confs.length == 5);
            } else {
              confs2 = confs.filter((c) => c.cid%confs.length >= 15 && c.cid%confs.length < 18);
            }
          } else {
            confs2 = [];
          }
//console.log(confs2);
        return {
            confs: confs2,
            playoffsByConference,
            season: inputs.season,
			gameType: g.gameType,
      conference: inputs.conference,
        };
    }
}

export default {
    runBefore: [updateStandings],
};
