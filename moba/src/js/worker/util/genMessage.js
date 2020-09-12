// @flow

import {g, helpers} from '../../common';
import {league} from '../core';
import {idb} from '../db';
import {local, random} from '../util';
import type {OwnerMoodDeltas} from '../../common/types';

// First message after new game
const first = [
	"<p>Hey, sorry I didn't recognize you at the gaming house this morning. I'm sure I'll get to know you eventually. Maybe after I get back from my trip to Tahiti?</p><p>Well, listen. Times are rough. Profits only increased by 100% last year. I know, I know, horrible. And I had to stop mowing and maid service at the gaming house just to get that 100%!</p><p>So I'll cut right to the chase. I need money. And championships. Money and championships, that's what I'm interested in.</p><p>Get it done.</p>"
];

// Random activities the owner claims to be doing
const activities = [
			"learning how to windsurf while carrying a naked girl on my back.",
			"working on my new \"mountaintop removal\" mining company (it's fascinating stuff).",
			"having sex with half the freshman girls at the local university (it's hard work, believe me).",
			"working on my charity, Sugar Daddies for Disadvantaged Hotties.",
			"working with my new PR agency on that whole \"child slave sweatshop\" scandal.",
			"lobbying the government to invade Peru (those bastards).",
			"organizing orgies at the governor's mansion (he's a very particular gentleman).",
			"lobbying the FDA to allow me to market ground horse meat as \"ground beeef\" (I already trademarked \"beeef\").",
			"arguing with my fourth wife's lawyer.",
			"managing my Ponzi scheme... I mean hedge fund, hedge fund, it's a hedge fund.",
			"trying to overturn that ruling that got all of our players banned for being complete jerks. Some people can be so thin-skinned.",		
			"lobbying to make LOL male only. You don't see women playing football do you? No, I am not a jerk.",
			"coming up with an idea. What if our players switched accounts every game so the other team never knew who was actually playing? Pure genius, isn't it?",
			"thinking about using our gaming house computers to mine for bitcoins while our team isn't practicing.",		
			"busy insuring we get a share of the prize money next time we get to the finals. I want both teams to agree to split it and then watch them ARAM.",
			"figuring out the best matches for us to throw. Most people gamble. I call this investing.",
			"checking out my in game MMR at kassad.in. My last game had an MMR of 87. Doesn't that seem low?",
			"practising LOL. I may be your new ADC. I just got out of Bronze V and I'm thinking the sky is the limit for me.",
			"figuring out how poach players.",
			"coming up with a way to hack LOL without anyone finding out (Use every edge you can. That's what makes a winner. Don't forget it. But if we get caught you're taking the fall.).",
			"running my NBA team (you know, a real sport).",
			"running my NBA team (you know, the one that actually makes real money)."
];

// Intro of annual message
const intro = [
    "Sorry we haven't chatted much this year, but I've been busy {{activity}}",
];

// 0: bad overall, getting worse
// 1: bad overall, improving
// 2: mediocre
// 3: good overall, getting worse
// 4: good overall, improving

// Wins
const wins = [];
wins[0] = [
	"This is an embarrassment. We lose so much, I can't even show my face around our region. Buying this team was supposed to make me a celebrity, but not one of those bad celebrities that everyone hates. Turn it around.",
	"I need some wins. Fans hate losers. Free agents hate losers. What's your strategy? Keep on losing until I fire you? You're making good progress, then.",
];
wins[1] = [
	"I recognize we're getting better and our team has some potential for growth, but don't fuck this up. You've already used up most of my patience.",
	"You keep telling me we have \"potential\", but potential doesn't win games."
];
wins[2] = [
    "So, I mean, it could be worse. But that's not good enough.",
    "In this league, mediocrity can be worse than losing. I hope you have some plan to get us to the next level.",
];
wins[3] = [
    "Don't think you can coast on your past success for too long. I'm not planning on rebuilding for a decade.",
    "What have you done for me lately?",
];
wins[4] = [
	"I'm pleased with our regular season performance.",
	"I like the roster you've put together. We'll be at the top of our league for a long time."
];

// Playoffs
const playoffs = [];
playoffs[0] = [
	"Our fans are starving, absolutely starving, for some postseason success. But with the job you're doing, we're not even close to the playoffs. Unacceptable.",
	"Playoffs? Don't talk to me about playoffs. You kidding me? Playoffs? I just hope we can win a game!"
];
playoffs[1] = [
	"In this sport, you can't just be happy with making the playoffs. You have to get to the next level.",
	"A first round playoff exit is boring."
];
playoffs[2] = [
    "Hey. I'm a champion. I don't know about you, but that's what my teams do. They win championships. Yeah, making the playoffs is okay I guess, but I'm not satisfied.",
    "We need to make some real noise in the playoffs. Soon.",
];
playoffs[3] = [
    "Consistent conference success is the standard. Never forget that.",
    "I hope you don't plan on missing the playoffs again.",
];
playoffs[4] = [
    "Winning titles can cover up a lot of flaws.",
    "I need some more jewelry. Go get me another ring.",
];
//////////////// need above, test?
		playoffs[5] = [
			"Our fans are starving, absolutely starving, for some success moving out of the Ladder. But with the job you're doing, we're not even close. Unacceptable.",
			"CS Promotion? Don't talk to me about the CS. You kidding me? CS? I just hope we can win a game!"
		];
		playoffs[6] = [
			"Falling to the Ladder is embarrassing. You better fix this quick!",
			"This is a disaster. Falling to the Ladder may destroy this team. You think you can get a job after that?"
		];
		playoffs[7] = [
			"How could you let this happen? Falling to the CS? You really shouldn't take a salary until you fix this.",
			"I worked so hard to get this team to the LCS and you piss it all away. I would say more, but I'm still in shock right now."
		];
		playoffs[8] = [
			"I feel like I'm in CS promotion hell. Any plans on fixing this?",
			"So you aren't stuck at the bottom of the Ladder, but this is unacceptable."
		];
		playoffs[9] = [
			"We need to make it the CS. Get it done.",
			"Making it to the CS Promotion doesn't matter if we keep falling short."
		];
		playoffs[10] = [
			"Being in the LCS is great, but we need to start making the playoffs.",
			"At least you didn't get demoted, but this isn't good enough."
		];
		playoffs[11] = [
			"Getting knocked out in the first game of the playoffs is boring.",
			"Can you at least win one playoff game?"
		];
		playoffs[13] = [
			"So when are we making the CS?",
			"I can't wait until we make the CS."
		];
		playoffs[14] = [
			"So when are we making the LCS?",
			"I can't wait until we make the LCS."
		];
		playoffs[15] = [
			"So when are we making the LCS?",
			"I can't wait until we make the LCS."
		];
		playoffs[16] = [
			"Hey. I'm a champion. I don't know about you, but that's what my teams do. They win championships. Yeah, competing at a high level is okay I guess, but I'm not satisfied.",
			"We need to make some real noise in the LCS playoffs. Soon."
		];
		playoffs[17] = [
			"Hey. I'm a champion. I don't know about you, but that's what my teams do. They win championships. Yeah, competing at a high level is okay I guess, but I'm not satisfied.",
			"You are almost a winner. Don't fail me next time!"
		];		
		playoffs[18] = [
			"Miracles do happen! Now get us to the LCS.",
			"Nice job making the CS. But don't think I am happy stopping here."
		];
		playoffs[19] = [
			"Welcome the LCS. Now it really begins. Let's get a championship.",
			"You got us to the LCS. I hope you can get us the rest of the way."
		];
		playoffs[20] = [
			"Winning titles can cover up a lot of flaws.",
			"I need some more jewelry. Go get me another ring."
		];
		playoffs[21] = [
			"Our fans are starving, absolutely starving, for some success moving out of the Ladder. But with the job you're doing, we're not even close. Unacceptable.",
			"CS Promotion? Don't talk to me about the CS. You kidding me? CS? I just hope we can win a game!"
		];
		playoffs[22] = [
			"Falling to the Ladder is embarrassing. You better fix this quick!",
			"This is a disaster. Falling to the Ladder may destroy this team. You think you can get a job after that?"
		];
		playoffs[23] = [
			"How could you let this happen? Falling to the CS? You really shouldn't take a salary until you fix this.",
			"I worked so hard to get this team to the LCS and you piss it all away. I would say more, but I'm still in shock right now."
		];
		playoffs[24] = [
			"I feel like I'm in CS promotion hell. Any plans on fixing this?",
			"So you aren't stuck at the bottom of the Ladder, but this is unacceptable."
		];
		playoffs[25] = [
			"We need to make it the CS. Get it done.",
			"Making it to the CS Promotion doesn't matter if we keep falling short."
		];
		playoffs[26] = [
			"Being in the LCS is great, but we need to start making the playoffs.",
			"At least you didn't get demoted, but this isn't good enough."
		];
		playoffs[27] = [
			"Getting knocked out in the first game of the playoffs is boring.",
			"Can you at least win one playoff game?"
		];
		playoffs[29] = [
			"So when are we making the CS?",
			"I can't wait until we make the CS."
		];		
		playoffs[30] = [
			"So when are we making the LCS?",
			"I can't wait until we make the LCS."
		];
		playoffs[31] = [
			"So when are we making the LCS?",
			"I can't wait until we make the LCS."
		];
		playoffs[32] = [
			"Hey. I'm a champion. I don't know about you, but that's what my teams do. They win championships. Yeah, competing at a high level is okay I guess, but I'm not satisfied.",
			"We need to make some real noise in the LCS playoffs. Soon."
		];
		playoffs[33] = [
			"Hey. I'm a champion. I don't know about you, but that's what my teams do. They win championships. Yeah, competing at a high level is okay I guess, but I'm not satisfied.",
			"You are almost a winner. Don't fail me next time!"
		];		
		playoffs[34] = [
			"Miracles do happen! Now get us to the LCS.",
			"Nice job making the CS. But don't think I'm happy stopping here."
		];
		playoffs[35] = [
			"Welcome the LCS. Now it really begins. Let's get a championship.",
			"You got us to the LCS. I hope you can get us the rest of the way."
		];		
		
			playoffs[36] = [
				"Winning titles can cover up a lot of flaws.",
				"I need some more jewelry. Go get me another ring."
			];


// Money
const money = [];
money[0] = [
    "Money is an issue. I'm going broke. This is ridiculous. I'm supposed to be rich, but I can barely afford my monacle polish these days.",
    "I can't afford a season in the red. Is it really that hard to turn a big profit in this business?",
];
money[1] = [
    "I like the recent financial turnaround you engineered. But I can't afford any setback.",
];
money[2] = [
    "Listen. I need another private jet. Cut back on spending, increase revenue, whatever. I'm not an accountant. I just know I need another jet.",
    "I didn't buy this team just for fun. We should be making a higher profit.",
];
money[3] = [
    "Just because you made some money in the past doesn't mean you're allowed to lose money now.",
    "I liked what you were doing before this year, financially. This year, not so much.",
];
money[4] = [
	"I just got a new paint job on my private jet. That's all thanks to you. Keep pinching those pennies!",
	"I just looked over the team finances. I like what I see. Keep up the good work there."
];

// 0: bad
// 1: mediocre
// 2: good

// Overall
const ovr = [];
ovr[0] = [
    "Bye.",
    "Please, don't bother me until you have some good news.",
    "I'm watching you. Seriously, one of your assistant coaches is a spy. Don't fuck up.",
];
ovr[1] = [
    "You bore me. Everything about you, it's just boring. Come talk to me when you've earned me more millions and won me some more championships.",
    "You know, general managers aren't hired to be mediocre. Do better next year.",
	"I've been meaning to tell you about this great idea I had. What if we went all Mid and tried to take the Nexus in the first 5 minutes? Pure genius, isn't it?"
];
ovr[2] = [
    "Anyway, overall I'm happy with the progress you've made, but I need to get back to {{activity}}.",
];

async function genMessage(deltas: OwnerMoodDeltas) {
    // If auto play seasons or multi team mode, no messages
    if (local.autoPlaySeasons > 0 || g.userTids.length > 1) {
        return;
    }

    const ownerMoodSum = g.ownerMood.wins + g.ownerMood.playoffs + g.ownerMood.money;

    let m;
    if (g.showFirstOwnerMessage) {
        m = random.choice(first);
        await league.setGameAttributes({showFirstOwnerMessage: false});
    } else {
        const activity1 = random.choice(activities);
        let activity2 = random.choice(activities);
        while (activity1 === activity2) {
            activity2 = random.choice(activities);
        }

        let indWins = 2;
        if (g.ownerMood.wins <= 0 && deltas.wins < 0) {
            indWins = 0;
        } else if (g.ownerMood.wins < -0.5 && deltas.wins >= 0) {
            indWins = 1;
        } else if (g.ownerMood.wins > 0 && deltas.wins < 0) {
            indWins = 3;
        } else if (g.ownerMood.wins > 0 && deltas.wins > 0) {
            indWins = 4;
        }

        let indPlayoffs = 2;
        if (g.ownerMood.playoffs <= 0 && deltas.playoffs < 0) {
            indPlayoffs = 0;
        } else if (g.ownerMood.playoffs <= 0 && deltas.playoffs === 0) {
            indPlayoffs = 1;
        } else if (g.ownerMood.playoffs <= 0 && deltas.playoffs > 0) {
            indPlayoffs = 2;
        } else if (g.ownerMood.playoffs >= 0 && deltas.playoffs >= 0) {
            indPlayoffs = 2;
        } else if (g.ownerMood.playoffs >= 0 && deltas.playoffs < 0) {
            indPlayoffs = 3;
        }
        if (deltas.playoffs === 0.2) {
            indPlayoffs = 4;
        }

        let indMoney = 2;
        if (g.ownerMood.money < 0 && deltas.money < 0) {
            indMoney = 0;
        } else if (g.ownerMood.money < -0.5 && deltas.money >= 0) {
            indMoney = 1;
        } else if (g.ownerMood.money > 0 && deltas.money < 0) {
            indMoney = 3;
        } else if (g.ownerMood.money > 0 && deltas.money > 0) {
            indMoney = 4;
        }

        let indOvr = 1;
        if (ownerMoodSum > 0.5) {
            indOvr = 2;
        } else if (ownerMoodSum < -0.5) {
            indOvr = 0;
        }
		console.log(deltas);
		console.log(g.ownerMood);
		console.log(ownerMoodSum);
		
        if (ownerMoodSum > -1) {
            m = `<p>${random.choice(intro).replace("{{activity}}", activity1)}</p>
                 <p>${random.choice(wins[indWins])} ${random.choice(playoffs[indPlayoffs])}</p>
                 <p>${random.choice(money[indMoney])}</p>
                 <p>${random.choice(ovr[indOvr]).replace("{{activity}}", activity2)}</p>`;
        } else if (g.season < g.gracePeriodEnd || g.godMode) {
            if (deltas.wins < 0 && deltas.playoffs < 0 && deltas.money < 0) {
                m = "<p>What the hell did you do to my franchise?! I'd fire you, but I can't find anyone who wants to clean up your mess.</p>";
            } else if (deltas.money < 0 && deltas.wins >= 0 && deltas.playoffs >= 0) {
                m = "<p>I don't care what our colors are. I need to see some green! I won't wait forever. MAKE ME MONEY.</p>";
            } else if (deltas.money >= 0 && deltas.wins < 0 && deltas.playoffs < 0) {
                m = "<p>Our fans are out for blood. Put a winning team together, or I'll let those animals have you.</p>";
            } else {
                m = "<p>The longer you keep your job, the more I question why I hired you. Do better or get out.</p>";
            }
        } else {
            if (g.ownerMood.wins < 0 && g.ownerMood.playoffs < 0 && g.ownerMood.money < 0) {
                m = "<p>You've been an all-around disappointment. You're fired.</p>";
            } else if (g.ownerMood.money < 0 && g.ownerMood.wins >= 0 && g.ownerMood.playoffs >= 0) {
                m = "<p>You've won some games, but you're just not making me enough profit. It's not all about wins and losses, dollars matter too. You're fired.</p>";
            } else if (g.ownerMood.money >= 0 && g.ownerMood.wins < 0 && g.ownerMood.playoffs < 0) {
                m = "<p>I like that you've made a nice profit for me, but you're not putting a competitive team on the court. We need a new direction. You're fired.</p>";
            } else {
                m = "<p>You're fired.</p>";
            }
            m += `<p>I hear a few other teams are looking for a new GM. <a href="${helpers.leagueUrl(["new_team"])}">Take a look.</a> Please, go run one of those teams into the ground.</p>`;
        }
    }

    await idb.cache.messages.add({
        read: false,
        from: "The Owner",
        year: g.season,
        text: m,
    });

    if (ownerMoodSum > -1) {
        return;
    }
    if (g.season < g.gracePeriodEnd || g.godMode) {
        // Can't get fired yet... or because of God Mode
        return;
    }

    // Fired!
    await league.setGameAttributes({
        gameOver: true,
        showFirstOwnerMessage: true,
    });
}

export default genMessage;
