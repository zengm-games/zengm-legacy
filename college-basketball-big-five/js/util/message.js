/**
 * @name util.message
 * @namespace Messages from the owner of the team to the GM.
 */
define(["dao", "globals", "util/helpers", "util/random"], function (dao, g, helpers, random) {
    "use strict";

    var activities, first, intro, money, ovr, playoffs, wins;

    // First message after new game
    first = [
        "<p>Hey, sorry I didn't recognize you in the lobby this morning. I'm sure I'll get to know you eventually. Maybe after I get back from my trip to Tahiti?</p><p>Well, listen. Times are rough. Donations only increased by 10% last year. I know, I know, horrible. Getting that new stadium is going to require a lot more than that!</p><p>So I'll cut right to the chase. We need donations. We need applicants. And we need championships. We like to consider ourselves on the same educational level as Harvard.</p><p>Make it happen.</p>"
    ];

    // Random activities the owner claims to be doing
    activities = [
        "doling out political favors for some undeserving applicants",
        "bringing out all the stops for football recruits, you know sex, booze, and drugs",
        "organizing orgies at the governor's mansion (he's a very particular gentleman)",
        "helping the football team (football brings in dollars, basketball brings in pennies)",
        "planning my daughter's million dollar wedding with school funds",
        "finding more of those teachers who know how to give the right grades for our athletes",
        "covering up that..., well let's just say this conversation never took place",
        "finalizing that $500k+ renovation to my school residence",
        "visiting my daughter-in-law",
        "going to conferences in Tahiti",
        "having sex with half the freshman girls (it's hard work, believe me)",
        "exchanging tips with our boosters about how to avoid detection when giving recruits gifts",
        "buying cars and jewellery for middle school basketball prospects so they'll come here when they graduate",
        "bribing the commissioner to let me ref our games",
        "working on my golf game with Kim Jong Il (no, he's not dead)",		
        "lobbying the state government for more subsidies",		
        "coming up with a way to slightly shrink or expand the hoop, depending on which one we're shooting at",
        "recruiting a potential Nobel prize winner",
        "figuring out how to game the US News ranking algorithm"		
    ];

    // Intro of annual message
    intro = [];
    intro = [
        "Sorry we haven't chatted much this year, but I've been busy {{activity}}. "
    ];

    // 0: bad overall, getting worse
    // 1: bad overall, improving
    // 2: mediocre
    // 3: good overall, getting worse
    // 4: good overall, improving

    // Wins
    wins = [];
    wins[0] = [
        "This is an embarrassment. We lose so much, I can't even show my face around town. Becoming president was supposed to make me a celebrity, but not one of those bad celebrities that everyone hates. Turn it around.",
        "I need some wins. Our boosters hate losers. Applicants hate losers. What's your strategy? Keep on losing until I fire you? You're making good progress, then."
    ];
    wins[1] = [
        "I recognize we're getting better and our team has some potential for growth, but don't fuck this up. You've already used up most of my patience.",
        "You keep telling me we have \"potential\", but potential doesn't win games."
    ];
    wins[2] = [
        "So, I mean, it could be worse. But that's not good enough.",
        "Doing OK doesn't bring in the applicants and the donations.  Mediocrity can be worse than losing. I hope you have some plan to get us to the next level."
    ];
    wins[3] = [
        "Don't think you can coast on your past success for too long. I'm not planning on rebuilding for a decade.",
        "What have you done for me lately?"
    ];
    wins[4] = [
        "I'm pleased with our regular season performance.",
        "I like the roster you've put together. We'll be at the top of our conference for a long time."
    ];

    // Playoffs
    playoffs = [];
    playoffs[0] = [
        "Our alumni are starving, absolutely starving, for some NT success. But with the job you're doing, we're not even close to the NT. Unacceptable.",
        "NT? Don't talk to me about that. You kidding me? NT? I just hope we can win a game!"
    ];
    playoffs[1] = [
        "With our alumni, you can't just be happy with making the NT. You have to get to the next level.",
        "A first round NT exit is boring."
    ];
    playoffs[2] = [
        "Hey. I'm a champion. I don't know about you, but that's what this school does. We win championships. Yeah, making the NT is okay I guess, but I'm not satisfied.",
        "We need to make some real noise in the NT. Soon."
    ];
    playoffs[3] = [
        "Hey. I'm a champion. I don't know about you, but that's what this school does. We win championships. Yeah, making it to the sweet sixteen was sweet, but I'm not satisfied.",
        "Making the sweet sixteen still means you're tied for 8th loser. Make it further next time."
    ];
    playoffs[4] = [
        "Hey. I'm a champion. I don't know about you, but that's what this school does. We win championships. Yeah, making it to the elite eight was no small feat, but I'm not satisfied.",
        "At another school an elite eight appearance would mean your golden. Not here."
    ];	
    playoffs[5] = [
        "Hey. I'm a champion. I don't know about you, but that's what this school does. We win championships. Yeah, making it to the final four was awesome, but I'm not satisfied.",
        "Everybody loved that final four appearance. Don't rip our hearts out next time with a loss."
    ];		
    playoffs[6] = [
        "Hey. I'm a champion. I don't know about you, but that's what this school does. We win championships. Don't choke next time.",
        "I knew you were a choker when we hired you. That is your fatal flaw.",
        "So close we could almost taste the national championship. Too bad we choked."		
    ];		

    playoffs[7] = [
        "Consistent NT success is the standard. Never forget that.",
        "I hope you don't plan on missing the NT again."
    ];
    playoffs[8] = [
        "Winning national titles can cover up a lot of flaws.",
        "I need more applicants and donations. Go get me another national title."
    ];

    // Money // now regular conference playoffs
	// something else?
    money = [];
    money[0] = [
        "Honesty, how are we going to win the NT when we can't even win a CT game?",
        "We don't know how your CT performance could be this bad. We didn't even know it was possible."
	
//        "Money is an issue. The school is going broke. This is ridiculous. Enrollment should be growing, but I can barely afford my monacle polish these days.",
 //       "I can't afford a season in the red. Is it really that hard to turn a big profit in this business?"
    ];
    money[1] = [
        "With our alumni, you can't just be happy with making the second round of the CT. You have to get to the next level.",
        "A second round CT exit is boring."
    ];
    money[2] = [
        "At least you aren't getting beat in the first round of the CT. Before we can dominate the country we have to dominate the conference. Remember the goal. ",
        "It could be worse, but it should be better. Don't think your CT performance is going to keep you here."
    ];
    money[3] = [
        "You losing in the first round in the conference tournament is unacceptable.",
        "I hope that wasn't a sign you aren't good enough for this conference any more. Next year better be better."
    ];
    money[4] = [
        "Well you've proved this conference sucks.",
        "I'm making some calls. Hopefully we can get some better teams in this conference. Anybody could beat these scrubs."
    ];

    // 0: bad
    // 1: mediocre
    // 2: good

    // Overall
    ovr = [];
    ovr[0] = [
        "Bye.",
        "Please, don't bother me until you have some good news.",
        "I'm watching you. Seriously, one of your assistant coaches is a spy. Don't fuck up."
    ];
    ovr[1] = [
        "You bore me. Everything about you, it's just boring. Come talk to me when you've got that stadium paid for and won me some more championships.",
        "You know, coaches aren't hired to be mediocre. Do better next year.",
        "I've been meaning to tell you about this great idea I had. What if we only play 4 guys on defense, so the other guy can just wait for an easy score at the other end? Pure genius, isn't it?"
    ];
    ovr[2] = [
        "Anyway, overall I'm happy with the progress you've made, but I need to get back to {{activity}}."
    ];

    function generate(deltas) {
        var activity1, activity2, indMoney, indOvr, indPlayoffs, indWins, m, ownerMoodSum, tx;
		
        ownerMoodSum = g.ownerMood.wins + g.ownerMood.playoffs + g.ownerMood.money;

        if (g.showFirstOwnerMessage) {
            m = random.choice(first);
            require("core/league").setGameAttributes({showFirstOwnerMessage: false}); // Okay that this is async, since it won't be called again until much later
        } else {
            activity1 = random.choice(activities);
            activity2 = random.choice(activities);
            while (activity1 === activity2) {
                activity2 = random.choice(activities);
            }

            indWins = 2;
            if (g.ownerMood.wins <= 0 && deltas.wins < 0) {
                indWins = 0;
            } else if (g.ownerMood.wins < -0.5 && deltas.wins >= 0) {
                indWins = 1;
            } else if (g.ownerMood.wins > 0 && deltas.wins < 0) {
                indWins = 3;
            } else if (g.ownerMood.wins > 0 && deltas.wins > 0) {
                indWins = 4;
            }

			//NT
                indPlayoffs = 0;
            if (g.ownerMood.playoffs <= 0 && deltas.playoffs < 0) {
                indPlayoffs = 0;
            } else if (g.ownerMood.playoffs <= 0 && deltas.playoffs === 0) {
                indPlayoffs = 1;
            } else if (g.ownerMood.playoffs <= 0 && deltas.playoffs > 0 ) {
				indPlayoffs = 3;
			    if (deltas.playoffs == .05) {
					indPlayoffs = 4;
				} else if (deltas.playoffs == .075) {
					indPlayoffs = 5;
				} else if (deltas.playoffs == .1) {
					indPlayoffs = 6;
				}
                
            } else if (g.ownerMood.playoffs >= 0 && deltas.playoffs >= 0) {
                indPlayoffs = 2;
			    if (deltas.playoffs == .025) {
					indPlayoffs = 3;
				} else if (deltas.playoffs == .05) {
					indPlayoffs = 4;
				} else if (deltas.playoffs == .075) {
					indPlayoffs = 5;
				} else if (deltas.playoffs == .100) {
					indPlayoffs = 6;
				}				
            } else if (g.ownerMood.playoffs >= 0 && deltas.playoffs < 0) {
                indPlayoffs = 7;
            }
            if (deltas.playoffs === 0.2) {
                indPlayoffs = 8;
            }

			//CT
                indMoney = 0;
          if (g.ownerMood.money <= 0 && deltas.money < 0) {
                indMoney = 0;
            } else if (g.ownerMood.money <= 0 && deltas.money === 0) {
                indMoney = 1;
            } else if (g.ownerMood.money <= 0 && deltas.money > 0) {
                indMoney = 2;
            } else if (g.ownerMood.money >= 0 && deltas.money >= 0) {
                indMoney = 2;
            } else if (g.ownerMood.money >= 0 && deltas.money < 0) {
                indMoney = 3;
            }
            if (deltas.money === 0.2) {
                indMoney = 4;
            }			
			
			
			
       /*     indMoney = 2;
            if (g.ownerMood.money < 0 && deltas.money < 0) {
                indMoney = 0;
            } else if (g.ownerMood.money < -0.5 && deltas.money >= 0) {
                indMoney = 1;
            } else if (g.ownerMood.money > 0 && deltas.money < 0) {
                indMoney = 3;
            } else if (g.ownerMood.money > 0 && deltas.money > 0) {
                indMoney = 4;
            } */

            indOvr = 1;
            if (ownerMoodSum > 1.25) {
                indOvr = 2;
            } else if (ownerMoodSum < -1.25) {
                indOvr = 0;
            }

			console.log(g.ownerMood.wins);
			console.log(deltas.wins);
			console.log(indWins);
			console.log(g.ownerMood.playoffs);
			console.log(deltas.playoffs);
			console.log(indPlayoffs);
			console.log(g.ownerMood.money);
			console.log(deltas.money);
			console.log(indMoney);
			console.log(ownerMoodSum);
			console.log(indOvr);
			
            if (ownerMoodSum > -2.5) {
                m = "<p>" + random.choice(intro).replace("{{activity}}", activity1) + "</p>" +
                    "<p>" + random.choice(wins[indWins]) + " " + random.choice(money[indMoney]) + "</p>" +
                    "<p>" + random.choice(playoffs[indPlayoffs]) + "</p>" +
                    "<p>" + random.choice(ovr[indOvr]).replace("{{activity}}", activity2) + "</p>";
            } else if (g.season < g.gracePeriodEnd || g.godMode) {
			
                if (deltas.wins < 0 && deltas.playoffs < 0 && deltas.money < 0) {
                    m = "<p>What the hell did you do to our program?! I'd fire you, but I can't find anyone who wants to clean up your mess.</p>";
                } else if (deltas.money < 1 && deltas.wins >= 0 && deltas.playoffs >= 0) {
                    m = "<p>We can't consistently be the best team if we can't even advance in our own conference tournament. We expect more from you.</p>";
                } else if (deltas.money > 0 && deltas.wins > 0 && deltas.playoffs < 0) {
                    m = "<p>Our booster are out for blood. Make some noise in the NT, or I'll let those animals have you.</p>";
                } else if (deltas.money > 0 && deltas.wins < 0 && deltas.playoffs < 0) {
                    m = "<p>Getting lucky in the conference tournament isn't enough. The program is built on quicksand. Figure it out.</p>";
                } else if (deltas.money > 0 && deltas.wins < 0 && deltas.playoffs > 0) {
                    m = "<p>You are the luckiest SOB I've ever seen. But luck runs out. </p>";
                } else if (deltas.money < 1 && deltas.wins < 0 && deltas.playoffs > 0) {
                    m = "<p>Our conference isn't that hard. This is embarrassing.</p>";
                } else {
                    m = "<p>The longer you keep your job, the more I question why I hired you. Do better or get out.</p>";
                }			
			
			
          /*      if (deltas.wins < 0 && deltas.playoffs < 0) {
                    m = "<p>What the hell did you do to our program?! I'd fire you, but I can't find anyone who wants to clean up your mess.</p>";
            //    } else if ( deltas.wins >= 0 && deltas.playoffs >= 0) {
           //         m = "<p>I don't care what our colors are. I need to see some green! I won't wait forever. MAKE ME MONEY.</p>";
                } else if (deltas.wins > 0 && deltas.playoffs < 0) {
//                    m = "<p>Our fans are out for blood. Put a winning team together, or I'll let those animals have you.</p>";
                    m = "<p>Our booster are out for blood. Make some noise in the tournament, or I'll let those animals have you.</p>";
                } else {
                    m = "<p>The longer you keep your job, the more I question why I hired you. Do better or get out.</p>";
                }*/
            } else {
				if (g.ownerMood.wins < 0 && g.ownerMood.playoffs < 0 && g.ownerMood.money < 0) {
                    m = "<p>You've been an all-around disappointment. You're fired.</p>";
                } else if (g.ownerMood.money < 1 && g.ownerMood.wins < 0 && g.ownerMood.playoffs >= 0) {
                    m = "<p>Our conference is just too tough for you right now.  You're fired.</p>";
                } else if (g.ownerMood.money < 1 && g.ownerMood.wins >= 0 && g.ownerMood.playoffs < 0) {
                    m = "<p>Regular seasons wins are great, but your teams just haven't been built for tournament success. We need someone who can put it all together.  You're fired.</p>";
                } else if (g.ownerMood.money > 0 && g.ownerMood.wins <= 0 && g.ownerMood.playoffs < 0) {
                    m = "<p>You are mired in mediocrity. We don't want to be just an average team in our conference. We want to dominate. You're fired.</p>";
                } else if (g.ownerMood.money > 0 && g.ownerMood.wins < 0 && g.ownerMood.playoffs > 0) {
                    m = "<p>You've been very lucky. Just think if we had a coach that had some skill?  You're fired.</p>";
                } else if (g.ownerMood.money > 0 && g.ownerMood.wins >= 0 && g.ownerMood.playoffs <= 0) {
                    m = "<p>You have been a solid coach in our conference, but we expect national success. You're fired.</p>";
                } else if (g.ownerMood.money > 1 && g.ownerMood.wins < 0 && g.ownerMood.playoffs < 0) {
                    m = "<p>Getting lucky in the conference tournament isn't enough. We need better players and national success. You're fired.</p>";
                } else {
                    m = "<p>You're fired.</p>";
                }			
			
                /*if (g.ownerMood.wins < 0 && g.ownerMood.playoffs < 0) {
                    m = "<p>You've been an all-around disappointment. You're fired.</p>";
                } else if ( g.ownerMood.wins > 0 && g.ownerMood.playoffs < 0) {
                    m = "<p>You've won some games, but you're just not performing when it matters. The tournament it what gets the buzz, applications, and donations. You're fired</p>";
                } else if (g.ownerMood.wins < 0 && g.ownerMood.playoffs > 0) {
                    m = "<p>It isn't just about getting lucky in the tournament. You've got to translate that into better recruits and consistently winning. We need a new direction. You're fired.</p>";
                } else {
                    m = "<p>You're fired.</p>";
                }*/
                m += '<p>I hear a few other teams are looking for a new coach. <a href="' + helpers.leagueUrl(["new_team"]) + '">Take a look.</a> Please, go run one of those teams into the ground.</p>';
            }
        }

        tx = dao.tx("messages", "readwrite");
        dao.messages.add({
            ot: tx,
            value: {
                read: false,
                from: "The President",
                year: g.season,
                text: m
            }
        });
        return tx.complete().then(function () {
            if (ownerMoodSum > -2.5) {
                return;
            }
            if (g.season < g.gracePeriodEnd || g.godMode) {
                // Can't get fired yet... or because of God Mode
                return;
            }
            // Fired!
            return require("core/league").setGameAttributes({
                gameOver: true,
                showFirstOwnerMessage: true
            });
        });
    }

    return {
        generate: generate
    };
});