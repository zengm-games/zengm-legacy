/**
 * @name api
 * @namespace Functions called directly in response to user action (clicking a button, etc).
 */
define(["dao", "globals", "ui", "core/freeAgents", "core/game", "core/league", "core/phase", "core/season", "lib/jquery"], function (dao, g, ui, freeAgents, game, league, phase, season, $) {

    "use strict";

    function play(amount) {
        var numDays;

        if (['day', 'week', 'month', 'throughPlayoffs', 'throughPlayoffs64', "untilPreseason"].indexOf(amount) >= 0) {
            if (amount === "day") {
                numDays = 1;
            } else if (amount === "week") {
                numDays = 7;
            } else if (amount === "month") {
                numDays = 30;
            } else if (amount === "throughPlayoffs") {
                numDays = 100;  // There aren't 100 days in the playoffs, so 100 will cover all the games and the sim stops when the playoffs end
            } else if (amount === "throughPlayoffs64") {
                numDays = 100;  // There aren't 100 days in the playoffs, so 100 will cover all the games and the sim stops when the playoffs end
            } else if (amount === "untilPreseason") {
                numDays = g.daysLeft;
            }

//            if (g.phase <= g.PHASE.PLAYOFFS) {
			// below didn't work, may not know what it means
            if (g.phase <= g.PHASE.PLAYOFFS64) {
		//	console.log("playing numdays: "+numDays);
                ui.updateStatus("Playing..."); // For quick UI updating, before game.play
                // Start playing games
                game.play(numDays);
            } else if (g.phase === g.PHASE.FREE_AGENCY) {
                if (numDays > g.daysLeft) {
                    numDays = g.daysLeft;
                }
                freeAgents.play(numDays);
            }
        } else if (amount === "untilPlayoffs") {
            if (g.phase < g.PHASE.PLAYOFFS) {
//            if (g.phase < g.PHASE.PLAYOFFS64) {
			    
                ui.updateStatus("Playing..."); // For quick UI updating, before game.play
                season.getDaysLeftSchedule().then(game.play);
            }
        } else if (amount === "untilPlayoffs64") {
//            if (g.phase < g.PHASE.PLAYOFFS) {
          /*  if (g.phase < g.PHASE.BEFORE_DRAFT) {
			    
                ui.updateStatus("Playing..."); // For quick UI updating, before game.play
                season.getDaysLeftSchedule().then(game.play);
            }*/
            if (g.phase === g.PHASE.BEFORE_PLAYOFFS64) {
                ui.updateStatus("Idle");			
                phase.newPhase(g.PHASE.PLAYOFFS64);
//                phase.newPhase(g.PHASE.BEFORE_NATIONAL_PLAYOFFS);
            }
					
        } else if (amount === "stop") {
            league.setGameAttributesComplete({stopGames: true}).then(function () {
                if (g.phase !== g.PHASE.FREE_AGENCY) {
                    // This is needed because we can't be sure if core.game.play will be called again
//                    ui.updateStatus("Idle");
                    ui.updateStatus("Idle");
                }
                league.setGameAttributesComplete({gamesInProgress: false}).then(ui.updatePlayMenu);
            });
       // } else if (amount === "untilPlaysoff64") {
       //     if (g.phase === g.PHASE.PLAYOFFS64) {
                //phase.newPhase(g.PHASE.DRAFT);
           /* if (g.phase < g.PHASE.PLAYOFFS64) {
                ui.updateStatus("Playing..."); // For quick UI updating, before game.play
                season.getDaysLeftSchedule().then(game.play);
            }*/				
         //   }
        } else if (amount === "untilDraft") {
            if (g.phase === g.PHASE.BEFORE_DRAFT) {
                phase.newPhase(g.PHASE.DRAFT);
            }
        } else if (amount === "untilResignPlayers") {
            if (g.phase === g.PHASE.AFTER_DRAFT) {
                phase.newPhase(g.PHASE.RESIGN_PLAYERS);
            }
        } else if (amount === "untilFreeAgency") {
		    //     console.log("untilFreeAgency api");
		    //     console.log("start g.daysLeft "+g.daysLeft);
                            ui.updateStatus("Loading recruits...");
			////	numdays = 30;
			///////////////////	g.daysLeft = 30;
			//console.log(g.daysLeft);
          ////  if (g.phase === g.PHASE.RESIGN_PLAYERS) {
          ////     dao.negotiations.count().then(function (numRemaining) {
                    // Show warning dialog only if there are players remaining un-re-signed
         ////           if (numRemaining === 0 || window.confirm("Are you sure you want to proceed to free agency while " + numRemaining + " of your players remain unsigned? If you do not re-sign them before free agency begins, they will be free to sign with any team, and you won't be able to go over the salary cap to sign them.")) {
                        phase.newPhase(g.PHASE.FREE_AGENCY).then(function () {
		       //  console.log("during g.daysLeft "+g.daysLeft);
			//console.log(g.daysLeft);						
                            ui.updateStatus(g.daysLeft + " days left");
                        });
           ////         }
           ////     });
          ////  }
        } else if (amount === "untilRegularSeason") {
            if (g.phase === g.PHASE.PRESEASON) {
                phase.newPhase(g.PHASE.REGULAR_SEASON);
            }
        } else if (amount === "stopAutoPlay") {
            league.setGameAttributesComplete({autoPlaySeasons: 0}).then(function () {
                ui.updatePlayMenu();
                play("stop");

                // Extra toggle to counteract play("stop");
                $("#play-menu .dropdown-toggle").dropdown("toggle");
            });		
			
        }

        // Close the menu
        $("#play-menu .dropdown-toggle").dropdown("toggle");
    }

    return {
        play: play
    };
});