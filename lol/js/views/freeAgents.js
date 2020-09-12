/**
 * @name views.freeAgents
 * @namespace List of free agents.
 */
define(["dao", "globals", "ui", "core/freeAgents", "core/player", "core/team", "lib/bluebird", "lib/jquery", "lib/knockout", "lib/underscore", "util/bbgmView", "util/helpers"], function (dao, g, ui, freeAgents, player, team, Promise, $, ko, _, bbgmView, helpers) {
    "use strict";

    var mapping;

    function disableButtons() {
        $("#free-agents button").attr("disabled", "disabled");
        $("#game-sim-warning").show();
    }

    function enableButtons() {
        $("#free-agents button").removeAttr("disabled");
        $("#game-sim-warning").hide();
    }

    function get() {
        if (g.phase >= g.PHASE.AFTER_TRADE_DEADLINE && g.phase <= g.PHASE.RESIGN_PLAYERS) {
            if (g.phase === g.PHASE.RESIGN_PLAYERS) {
                return {
                    redirectUrl: helpers.leagueUrl(["negotiation"])
                };
            }

            return {
                errorMessage: "You're not allowed to sign free agents now."
            };
        }
    }

    mapping = {
        players: {
            create: function (options) {
                return options.data;
            }
        }
    };

    function updateFreeAgents() {
		
		
		//console.log("here");
		// fix wrong draft class,UNDRAFTED_2 getting UNDRAFTED_3 players for some reason
        var tx = dao.tx("players", "readwrite");
    /*    dao.players.get({
            ot: tx,
            index: "tid",
            key: g.PLAYER.UNDRAFTED_2
        }).then(function (p) {
            var season;

  //          season = p.draft.year;
//            if (season === (g.season+3) && g.phase === g.PHASE.FREE_AGENCY) {
            if (g.phase === g.PHASE.FREE_AGENCY) {*/
/*console.log("FIXING FUCKED UP DRAFT CLASS");
console.log("g.daysLeft " +g.daysLeft);
console.log("g.phase "+ g.phase);*/
//console.log(g.season);
//console.log(g.PLAYER.UNDRAFTED);
//console.log(g.PLAYER.FREE_AGENT);
			if (g.phase === g.PHASE.FREE_AGENCY && (g.daysLeft >= 30 || g.daysLeft <= 0)) {
                dao.players.iterate({
                    ot: tx,
                    index: "tid",
//                    index: "draft.year",
                    key: g.PLAYER.UNDRAFTED_2,
 //                   key: (g.season+3),					
                    callback: function (p) {
	//					console.log(p.ratings[0].season+" "+p.draft.year+" "+g.season+" "+p.tid);
				
					//	console.log(p.draft.year+" "+p.tid);
						if (p.draft.year === (g.season+3)) {
							p.tid = g.PLAYER.UNDRAFTED_3;							
							//console.log("Changed: "+p.draft.year+" "+p.tid);							
							return p;							
						} else {
							return;
						}
                    //    p.draft.year = g.season;
					//	console.log(p.ratings[0].season+" "+p.draft.year+" "+g.season);						

                    }
                });
            }

       // });
		//	console.log("here");			
        return tx.complete().then(function () {		
		
			// DIRTY QUICK FIX FOR v10 db upgrade bug - eventually remove
			// This isn't just for v10 db upgrade! Needed the same fix for http://www.reddit.com/r/BasketballGM/comments/2tf5ya/draft_bug/cnz58m2?context=3 - draft class not always generated with the correct seasons
			var tx = dao.tx("players", "readwrite");
			dao.players.get({
				ot: tx,
				index: "tid",
				key: g.PLAYER.UNDRAFTED
			}).then(function (p) {
				var season;

			//	console.log(p.ratings[0].season);
			//	console.log(g.phase);
			//	console.log(g.PHASE.FREE_AGENCY);
			//	console.log(p.length);

				season = p.ratings[0].season;
				if (season !== g.season && g.phase === g.PHASE.FREE_AGENCY && (g.daysLeft >= 30 || g.daysLeft <= 0)) {
	///console.log("FIXING FUCKED UP DRAFT CLASS");
//	console.log(season);
	//console.log(g.PLAYER.UNDRAFTED);
	//console.log(g.PLAYER.FREE_AGENT);

					dao.players.iterate({
						ot: tx,
						index: "tid",
	//                    key: g.PLAYER.UNDRAFTED,
						key: g.PLAYER.FREE_AGENT,					
						callback: function (p) {
		//					console.log(p.ratings[0].season+" "+p.draft.year+" "+g.season+" "+p.tid);
							//console.log("here0");		

//							p.ratings[0].season = g.season;
							p.ratings[p.ratings.length-1].season = g.season;
						//    p.draft.year = g.season;
						//	console.log(p.ratings[0].season+" "+p.draft.year+" "+g.season);						
							return p;
						}
					});
				}
			});
		//	console.log("here");
//			return tx.complete().then(function () {
			return tx.complete();
						
		}).then(function () {		
		
		
        return Promise.all([
            team.getPayroll(null, g.userTid).get(0),
            team.getRegions(null, g.userTid).get(0),			
            dao.players.getAll({
                index: "tid",
                key: g.userTid
            }),
            dao.players.getAll({
                index: "tid",
                key: g.PLAYER.FREE_AGENT,
                statsSeasons: [g.season, g.season - 1]
            })
		  ]);			
		}).spread(function (payroll,regions,userPlayers, players) {			
//        ]).spread(function (payroll, userPlayers, players) {
            var capSpace, i;

            capSpace = (g.salaryCap - payroll) / 1000;
            if (capSpace < 0) {
                capSpace = 0;
            }

            players = player.filter(players, {
                attrs: ["pid", "name", "pos", "pos2","age","born", "contract", "freeAgentMood", "injury", "watch","languages"],
                ratings: ["MMR","ovr", "pot", "skills"],
                stats: ["min", "pts", "trb", "ast", "per","tp","fg","fga","fgp","kda"],
                season: g.season,
                showNoStats: true,
                showRookies: true,
                fuzz: true,
                oldStats: true
            });

            for (i = 0; i < players.length; i++) {
					//console.log(players[i].contract.amount);				
					//console.log(players[i].freeAgentMood);
					//console.log(players[i].freeAgentMood[g.userTid]);					
					if (players[i].freeAgentMood[g.userTid] == undefined) {
						players[i].freeAgentMood[g.userTid] = 0;
					}
                players[i].contract.amount = freeAgents.amountWithMood(players[i].contract.amount, players[i].freeAgentMood[g.userTid]);
					//console.log(players[i].contract.amount);				
				if (players[i].born.loc == g.teamCountryCache[g.userTid]) {
				//	contractAmount = players[i].contract.amount;						
					//console.log(contractAmount);						
				} else {
					players[i].contract.amount *= 2;	
					players[i].contract.amount += 25;

				}				
                players[i].mood = player.moodColorText(players[i]);
				if (players[i].ratings.MMR == undefined) {
					players[i].ratings.MMR = "";
				}
            }

            return {
                capSpace: capSpace,
                numRosterSpots: 10 - userPlayers.length,
                players: players
            };
        });
    }

    function uiFirst(vm) {
        ui.title("Free Agents");

        $("#help-salary-cap").popover({
            title: "Cap Space",
            html: true,
            content: "<p>\"Cap space\" is the difference between your current payroll and the salary cap. You can sign a free agent to any valid contract as long as you don't go over the cap.</p>You can only exceed the salary cap to sign free agents to minimum contracts ($" + g.minContract + "k/year)."
        });

        ko.computed(function () {
            ui.datatable($("#free-agents"), 4, _.map(vm.players(), function (p) {
                var negotiateButton;
                if (freeAgents.refuseToNegotiate(p.contract.amount , p.freeAgentMood[g.userTid])) {
                    negotiateButton = "Refuses!";
                } else {
                    negotiateButton = '<form action="' + helpers.leagueUrl(["negotiation", p.pid], {noQueryString: true}) + '" method="POST" style="margin: 0"><input type="hidden" name="new" value="1"><button type="submit" class="btn btn-default btn-xs">Negotiate</button></form>';
                }
                // The display: none for mood allows sorting, somehow
                return [helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, String(p.age), String(p.born.loc), String(p.ratings.MMR), String(p.ratings.ovr), String(p.ratings.pot), helpers.round(p.stats.min, 1), helpers.round(p.stats.fg, 1), helpers.round(p.stats.fga, 1), helpers.round(p.stats.fgp, 1), helpers.round(p.stats.kda, 1), helpers.round(p.stats.tp, 1), helpers.formatCurrency(p.contract.amount, "K") + ' thru ' + p.contract.exp, '<div title="' + p.mood.text + '" style="width: 100%; height: 21px; background-color: ' + p.mood.color + '"><span style="display: none">' + p.freeAgentMood[g.userTid] + '</span></div>', negotiateButton, String(p.born.country), String(p.languages)];
            }));
        }).extend({throttle: 1});

        ui.tableClickableRows($("#free-agents"));

        // Form enabling/disabling
        $("#free-agents").on("gameSimulationStart", function () {
            disableButtons();
        });
        $("#free-agents").on("gameSimulationStop", function () {
            enableButtons();
        });
    }

    function uiEvery() {
        // Wait for datatable
        setTimeout(function () {
            if (g.gamesInProgress) {
                disableButtons();
            } else {
                enableButtons();
            }
        }, 10);
    }

    return bbgmView.init({
        id: "freeAgents",
        get: get,
        mapping: mapping,
        runBefore: [updateFreeAgents],
        uiFirst: uiFirst,
        uiEvery: uiEvery
    });
});