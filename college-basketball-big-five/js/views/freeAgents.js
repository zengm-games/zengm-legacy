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
//        if (g.phase >= g.PHASE.AFTER_TRADE_DEADLINE && g.phase <= g.PHASE.BEFORE_DRAFT) {
        if (g.phase >= g.PHASE.REGULAR_SEASON && g.phase <= g.PHASE.BEFORE_DRAFT) {
//        if (g.phase >= g.PHASE.AFTER_TRADE_DEADLINE && g.phase <= g.PHASE.RESIGN_PLAYERS) {
            if (g.phase === g.PHASE.RESIGN_PLAYERS) {
			
                return {
                    redirectUrl: helpers.leagueUrl(["negotiation"])
                };
            }

            return {
                errorMessage: "You're not allowed to sign recruits now."
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
        return Promise.all([
            team.getPayroll(null, g.userTid).get(0),
           team.filter({
                attrs: ["strategy"],
				seasonAttrs: ["cash","hype"],			
                season: g.season
            }),			
            dao.players.getAll({
                index: "tid",
                key: g.userTid
            }),
            dao.players.getAll({
                index: "tid",
                key: g.PLAYER.FREE_AGENT,
                statsSeasons: [g.season, g.season - 1]
      /*      }),
            dao.players.getAll({
                index: "tid",
                key: g.UNDRAFTED,
                statsSeasons: [g.season, g.season - 1]
            }),			
            dao.players.getAll({
                index: "tid",
                key: g.RETIRED,
                statsSeasons: [g.season, g.season - 1]
            }),			
            dao.players.getAll({
                index: "tid",
                key: g.UNDRAFTED_2,
                statsSeasons: [g.season, g.season - 1]
            }),			
            dao.players.getAll({
                index: "tid",
                key: g.UNDRAFTED_3,
                statsSeasons: [g.season, g.season - 1] */
            })					
//        ]).spread(function (payroll, userPlayers, players,undrafted,retired,undrafted2,undrafted3) {
        ]).spread(function (payroll,teams, userPlayers, players) {
            var capSpace, i;
			var cash,hype;

		//	console.log("team userPlayers.length:"+userPlayers.length);
		//	console.log("free agents players.length:"+players.length);
		/*	console.log("undrafted.length:"+undrafted.length);
			console.log("retired.length:"+retired.length);
			console.log("undrafted2.length:"+undrafted2.length);
			console.log("undrafted3.length:"+undrafted3.length);*/
            cash = _.pluck(teams, "cash");
            hype = _.pluck(teams, "hype");
		//	console.log("cash: "+hype[g.userTid]);
		//	console.log("cash: "+cash[g.userTid]);
		//	console.log("payroll: "+payroll);
            capSpace = (cash[g.userTid] - payroll) ;
		//	console.log("1capSpace: "+capSpace);
//            capSpace = (cash[g.userTid] - payroll) / 1000;
//            capSpace = (g.salaryCap - payroll) / 1000;
            if (capSpace < 0) {
                capSpace = 0;
            }
		//	console.log("2capSpace: "+capSpace);

            players = player.filter(players, {
                attrs: ["pid", "name", "pos", "age", "year","contract", "freeAgentMood", "injury", "watch","miles","city","state"],
                ratings: ["ovr", "pot", "skills", "hgt", "stre", "spd", "jmp", "endu"],
                stats: ["min", "pts", "trb", "ast", "per"],
                season: g.season,
                showNoStats: true,
                showRookies: true,
                fuzz: true,
                oldStats: true
            });

            for (i = 0; i < players.length; i++) {
//                players[i].contract.amount = freeAgents.amountWithMood(players[i].contract.amount, players[i].freeAgentMood[g.userTid]);
                players[i].contract.amount = freeAgents.amountWithMoodMilesHype(players[i].contract.amount, players[i].freeAgentMood[g.userTid], players[i].miles[g.userTid],hype[g.userTid]);
				
//                players[i].contract.amount = freeAgents.amountWithMoodMiles(players[i].contract.amount, players[i].freeAgentMood[g.userTid], players[i].miles[g.userTid]);
//                players[i].contract.amount /= ((hype[g.userTid]+1)/3);
				if (g.daysLeft == 0 ) {
//				  players[i].contract.amount = 0;
				  //players[i].contract.amount *= .2;		
					players[i].contract.amount *= .6 ;
					players[i].contract.amount -= 20000 ;								
					if (players[i].contract.amount<0) {
						players[i].contract.amount = 0 ;
					}
												  
				}
                players[i].mood = player.moodColorText(players[i]);
                players[i].composite = players[i].ratings.ovr+players[i].ratings.pot;
          //      players[i].miles = players[i].miles[g.userTid];
				
            }

            return {
                capSpace: capSpace,
                numRosterSpots: 13 - userPlayers.length,
                players: players
            };
        });
    }

    function uiFirst(vm) {
        ui.title("Potential Recruits");

		
		 /*  $("#free_agents").on("click", "button", function () {
					var i, justDrafted, pid, players, releaseMessage;

					pid = parseInt(this.parentNode.parentNode.dataset.pid, 10);
					players = vm.players();
					for (i = 0; i < players.length; i++) {
						if (players[i].pid() === pid) {
							break;
						}
					}

					if (this.dataset.action === "accept") {
						// If a player was just drafted by his current team and the regular season hasn't started, then he can be released without paying anything
						justDrafted = players[i].tid() === players[i].draft.tid() && ((players[i].draft.year() === g.season && g.phase >= g.PHASE.DRAFT) || (players[i].draft.year() === g.season - 1 && g.phase < g.PHASE.REGULAR_SEASON));
						if (justDrafted) {
							releaseMessage = "Are you sure you want to release " + players[i].name() + "?  He will become a free agent and no longer take up a roster spot on your team. Because you just drafted him and the regular season has not started yet, you will not have to pay his contract.";
						} else {
							releaseMessage = "Are you sure you want to release " + players[i].name() + "?  He will become a free agent and no longer take up a roster spot on your team, but you will still have to pay his salary (and have it count against the salary cap) until his contract expires in " + players[i].contract.exp() + ".";
						}
						if (window.confirm(releaseMessage)) {
							doRelease(pid, justDrafted).then(function (error) {
								if (error) {
									window.alert("Error: " + error);
								} else {
									ui.realtimeUpdate(["playerMovement"]);
								}
							});
						}
					}
				});		*/
		
		
		
		
		
		
        $("#help-salary-cap").popover({
            title: "Cap Space",
            html: true,
            content: "<p>\"Cap space\" is the difference between your current payroll and the salary cap. You can sign a free agent to any valid contract as long as you don't go over the cap.</p>You can only exceed the salary cap to sign free agents to minimum contracts ($" + g.minContract + "k/year)."
        });

        ko.computed(function () {
            ui.datatable($("#free-agents"), 4, _.map(vm.players(), function (p) {
                var negotiateButton;
                if (freeAgents.refuseToNegotiateMiles(p.contract.amount, p.freeAgentMood[g.userTid],p.miles[g.userTid])) {
//                if (freeAgents.refuseToNegotiate(p.contract.amount, p.freeAgentMood[g.userTid])) {
                    negotiateButton = "Refuses!";
                } else {				
/*
    <form data-bind="attrLeagueUrl: {action: ['negotiation', player.pid]}" class="form-horizontal" method="POST">
      <input type="hidden" name="accept" value="1">
      <button type="submit" class="btn btn-success" id="accept">Accept Player Proposal</button>
    </form> */


//                    negotiateButton = '<form data-bind='+attrLeagueUrl: {action: ['negotiation', player.pid]}+'" class="form-horizontal" method="POST"> <input type="hidden" name="accept" value="1">       <button type="submit" class="btn btn-success" id="accept">Accept Player Proposal</button> </form>';
//                    negotiateButton = '<form data-bind='+helpers.leagueUrl(["negotiation", p.pid])+'" class="form-horizontal" method="POST"> <input type="hidden" name="accept" value="1">       <button type="submit" class="btn btn-success" id="accept">Join Team</button> </form>';
         /////////////////////           negotiateButton = '<form data-bind='+helpers.leagueUrl(["roster"])+'" class="form-horizontal" method="POST"> <input type="hidden" name="accept" value="1">       <button type="submit" class="btn btn-success" id="accept">Sign</button> </form>';
						
        //            negotiateButton =	'  <button class="btn btn-default btn-xs" data-action="accept" data-bind="enable: canRelease">Sign Recruit</button>'
				
                    negotiateButton = '<form action="' + helpers.leagueUrl(["negotiation", p.pid], {noQueryString: true}) + '" method="POST" style="margin: 0"><input type="hidden" name="new" value="1"><button type="submit" class="btn btn-default btn-xs">Recruit</button></form>';
					
					
  //                  negotiateButton = '<form action="' + helpers.leagueUrl(["roster"]) + '" method="POST" style="margin: 0"><input type="hidden" name="new" value="1"><button type="submit" class="btn btn-default btn-xs">Negotiate</button></form>';  "hgt", "stre", "spd", "jmp", "endu"
                }
		//		console.log("g.userTid: "+g.userTid);
                // The display: none for mood allows sorting, somehow
//                return [helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, String(p.age),p.city,p.state, helpers.round(p.miles[g.userTid], 0)  , String(p.ratings.ovr), String(p.ratings.pot), String(p.composite), String(p.ratings.hgt),String(p.ratings.stre),String(p.ratings.spd),String(p.ratings.jmp),String(p.ratings.endu), helpers.formatCurrency(p.contract.amount, "") ,'<div title="' + p.mood.text + '" style="width: 100%; height: 21px; background-color: ' + p.mood.color + '"><span style="display: none">' + p.freeAgentMood[g.userTid] + '</span></div>', negotiateButton];
                return [helpers.playerNameLabels(p.pid, p.name, p.injury, p.ratings.skills, p.watch), p.pos, p.year,p.city,p.state, helpers.round(p.miles[g.userTid], 0)  , String(p.ratings.ovr), String(p.ratings.pot), String(p.composite), String(p.ratings.hgt),String(p.ratings.stre),String(p.ratings.spd),String(p.ratings.jmp),String(p.ratings.endu), helpers.formatCurrency(p.contract.amount, "") ,'<div title="' + p.mood.text + '" style="width: 100%; height: 21px; background-color: ' + p.mood.color + '"><span style="display: none">' + p.freeAgentMood[g.userTid] + '</span></div>', negotiateButton];
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
	/*
  
    function post(req) {
        var pid, teamAmountNew, teamYearsNew;

        pid = parseInt(req.params.pid, 10);

        if (req.params.hasOwnProperty("cancel")) {
            contractNegotiation.cancel(pid).then(function () {
                redirectNegotiationOrRoster(true);
            });
        } else if (req.params.hasOwnProperty("accept")) {
            contractNegotiation.accept(pid).then(function (error) {
                if (error !== undefined && error) {
                    helpers.errorNotify(error);
                }
                redirectNegotiationOrRoster(false);
            });
        } else if (req.params.hasOwnProperty("new")) {
            // If there is no active negotiation with this pid, create it
            dao.negotiations.get({key: pid}).then(function (negotiation) {
                if (!negotiation) {
                    contractNegotiation.create(null, pid, false).then(function (error) {
                        if (error !== undefined && error) {
                            helpers.errorNotify(error);
                            ui.realtimeUpdate([], helpers.leagueUrl(["free_agents"]));
                        } else {
                            ui.realtimeUpdate([], helpers.leagueUrl(["negotiation", pid]));
                        }
                    });
                } else {
                    ui.realtimeUpdate([], helpers.leagueUrl(["negotiation", pid]));
                }
            });
        } else {
            // Make an offer to the player;
            teamAmountNew = parseInt(req.params.teamAmount * 1000, 10);
            teamYearsNew = parseInt(req.params.teamYears, 10);

            // Any NaN?
            if (teamAmountNew !== teamAmountNew || teamYearsNew !== teamYearsNew) {
                ui.realtimeUpdate([], helpers.leagueUrl(["negotiation", pid]));
            } else {
                contractNegotiation.offer(pid, teamAmountNew, teamYearsNew).then(function () {
                    ui.realtimeUpdate([], helpers.leagueUrl(["negotiation", pid]));
                });
            }
        }
    }*/

    return bbgmView.init({	
        id: "freeAgents",
        get: get,
        mapping: mapping,
        runBefore: [updateFreeAgents],
        uiFirst: uiFirst,
        uiEvery: uiEvery
//		post: post
    });
});