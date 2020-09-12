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
//        if ((g.phase >= g.PHASE.REGULAR_SEASON && g.phase <= g.PHASE.BEFORE_DRAFT) && g.autoPlaySeasons === 0 ) {
        if ((g.phase >= g.PHASE.REGULAR_SEASON && g.phase <= g.PHASE.BEFORE_DRAFT) ) {
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
console.log("FIXING FUCKED UP DRAFT CLASS");
console.log("g.daysLeft " +g.daysLeft);
console.log("g.phase "+ g.phase);
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
				if (season !== g.season && g.phase === g.PHASE.FREE_AGENCY) {
	console.log("FIXING FUCKED UP DRAFT CLASS");
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
							p.ratings[0].season = g.season;
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

						//	console.log("here3");
				return Promise.all([ 
		//	return Promise.all([
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
					})	
			  ]);			
			}).spread(function (payroll,teams, userPlayers, players) {
			  		//	console.log("here4");
		//     ]).spread(function (payroll,teams, userPlayers, players) {
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
				
				capSpace = (cash[g.userTid] - payroll) ;
				if (capSpace < 0) {
					capSpace = 0;
				}


				players = player.filter(players, {
					attrs: ["pid", "name", "pos", "age","year", "contract", "freeAgentMood", "injury", "watch","miles","city","state"],
					ratings: ["ovr", "pot", "skills", "hgt", "stre", "spd", "jmp", "endu"],
					stats: ["min", "pts", "trb", "ast", "per"],
					season: g.season,
					showNoStats: true,
					showRookies: true,
					fuzz: true,
					oldStats: true
				});

				for (i = 0; i < players.length; i++) {
					players[i].contract.amount = freeAgents.amountWithMoodMilesHype(players[i].contract.amount, players[i].freeAgentMood[g.userTid], players[i].miles[g.userTid],hype[g.userTid]);
					
					if (g.daysLeft == 0 ) {
					  players[i].contract.amount *= .05;
					}					
					
					players[i].mood = player.moodColorText(players[i]);
					players[i].composite = players[i].ratings.ovr+players[i].ratings.pot;
					
				}

				return {
					capSpace: capSpace,
					numRosterSpots: 13 - userPlayers.length,
					players: players
				};
			});
		//});			
    }

    function uiFirst(vm) {
        ui.title("Potential Recruits");


		
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