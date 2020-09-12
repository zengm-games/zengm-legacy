/**
 * @name util.message
 * @namespace Messages from the owner of the team to the GM.
 */
define(["dao", "globals", "lib/bluebird", "util/helpers", "util/random"], function (dao, g, Promise, helpers, random) {
    "use strict";

 
    /**
     * @param {IDBTransaction} tx An IndexedDB transaction on gameAttributes and messages, readwrite.
     */
    function generate(tx, deltas) {
		
	// If auto play seasons or multi team mode, no messages
	if (g.autoPlaySeasons > 0 || g.userTids.length > 1) {
		return Promise.resolve();
	}
		
   var activities, first, intro, money, ovr, playoffs, wins;
	var ownerType,microType,microString;
	
	console.log("Message");
    // First message after new game
	console.log(g.salaryCap);
	ownerType = g.ownerType;
	microType = random.randInt(0,4);	
	microString = ["TOP","Jungler","MID","ADC","Support"];	
	console.log("ownerType: "+ownerType);
	console.log(microString[microType]);
	
	
	if (ownerType == 0) { // standard, worst of all owners
		first = [
			"<p>Hey, sorry I didn't recognize you at the gaming house this morning. I'm sure I'll get to know you eventually. Maybe after I get back from my trip to Tahiti?</p><p>Well, listen. Times are rough. Profits only increased by 100% last year. I know, I know, horrible. And I had to stop mowing and maid service at the gaming house just to get that 100%!</p><p>So I'll cut right to the chase. I need money. And championships. Money and championships, that's what I'm interested in.</p><p>Get it done.</p>"
		];			
	} else if (ownerType == 1) { // best of all owners
		first = [
			"<p>Hey, glad we could meet up before you really get going. I'm really looking forward to seeing what you can do. </p><p>We are here to win championships. So build the team with that long term goal in mind. I have some patience, but we don't have forever. Also, this is a business to me. So I would like you to make as much money as possible. Of course, winning boosts revenue which allows for stronger earnings. So the two go together.</p><p>Let me know if you need anything. Good luck.</p>"
		];			
	} else if (ownerType == 2) { // cynical?
		first = [
			"<p>Well here comes the new GM. Or should I say the next guy I fire. We probably won't talk much since I don't see you making it past this year. But who know, maybe you'll suprise me.  All you have to do is make me filthy rich and win a bunch of championships. Ha! </p><p>Enjoy the job while it lasts.</p>"
		];			
	} else if (ownerType == 3) { // super into it
		first = [
			"<p>Hey, it is awesome to see you! I just sold my first mobile game for $20 million dollars and it only took a day to code! And now I've got my own eSports team! This is amazing!</p><p>I can't wait until those championships start rolling in! And all that money we are going to make! </p><p>Let's get going!</p>"
		];			
	} else if (ownerType == 4) {	// micro manager	
		first = [
			"<p>You look like a slob. Come back to tomorrow with some shorter hair and some better clothes, then win me some championships and make me some money or you're fired. </p><p>Also, you really need to upgrade the "+microString[microType]+" or this team isn't going anywhere.</p><p>Get it done.</p>"
		];			
	} else if (ownerType == 5) {	// win now	
		first = [
			"<p>Young man, glad I caught you. As you might be aware I've built great companies over my lifetime. I've got plenty of money. But I'm an old man now. At times like these you start thinking about your legacy. I believe in eSports. And before I die I want to a build a dynasty. The first truly great eSport dynasty. I want that to be my legacy.</p> <p>Don't let me down.</p>"
		];			
	} else {   // don't lose money
		first = [
			"<p>Hey, sorry I missed you at the gaming house this morning. I've just been told this morning my other businesses are in trouble.  I've been through a brutal divorce and I've got child support payments. I need this team to be as profitable as possible. Eventually we have to win, but you've got to keep spending down.</p> <p>I know it is tough, but you can do it. I'm counting on you.</p>"
		];		
	}


	
	if (ownerType == 0) { // standard, worst of all owners
		// Random activities the owner claims to be doing
		activities = [
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
	} else if (ownerType == 1) { // best of all owners
		// Random activities the owner claims to be doing
		activities = [
			"giving the commencement speech at Harvard where my grandson is graduating.",
			"the opening ceremony of my first store in Tanzania. ",
			"the opening my first office location in Uzbekistan.",
			"celebrating being #1 in our market in Bangladesh.",
			"investing in a very promosing company out of Uganda.",
			"finishing off a partnership with Google on a great new product.",
			"my grandaughter's wedding.",
			"buying a CSGO eSports team.",
			"hiring my two hundred thousandth employee.",
			"talking with some game developers about a partnership creating a game that could be bigger LOL.",
			"having lunch with Bill Gates."
		];
	} else if (ownerType == 2) { // cynical?
		// Random activities the owner claims to be doing
		activities = [
			"bailing my son out of jail.",
			"preventing my daughter from getting married for the fourth time.",
			"catching my wife cheating on me.",
			"paying off someone is who blackmailing me.",
			"avoiding prison for a crime I didn't commit.",
			"finding out more about how my business partner has been stealing from me.",
			"laying off half of my employees.",
			"thinking about having lost a bid on a major contract.",
			"thinking about having lost my biggest customer.",
			"thinking about having lost my grandson to a horrible car accident.",
			"finding out more about how my granddaughter got pregnant at sixteen."
		];
	} else if (ownerType == 3) { // super into it
		// Random activities the owner claims to be doing
		activities = [
			"developing my latest mobile game.",
			"laying on the beach.",
			"buying a Ferrari.",
			"getting married to a model.",
			"buying a house in the Caribbean.",
			"buying a CSGO team.",
			"playing my latest mobile game.",
			"traveling the world.",
			"waking up after being up all last night at the Playboy Mansion.",
			"thinking what to do next with my life.",
			"crossing out the 50th item off my list of 100 things to do before I die."
		];			
	} else if (ownerType == 4) {	// micro manager	
		activities = [
			"explaining to the gaming house lawn crew the finer points of lawn care.",
			"letting the old gaming house maids know every spot they missed when they cleaned.",
			"giving our Support pointers on how to best defend against a 5 on 2 ambush.",
			"explaining to our Top a slighly better Teleport strategy",
			"informing my accountants that they used an inappropriate type of accelerated depreciation for our latest purchases.",
			"chastising my money management team for guesstimating with EVA when a simple ratio analysis would do.",
			"explaining to my recently purchased life insurance company that they are estimating using the wrong cohorts and costing us millions.",
			"explaining to my wife that the reason her jacket looks so bad is it falls on the hips instead of slightly below the hip line.",
			"talking to Warren Buffett about how I still can't believe he didn't sell anything during the late 90s bubble.",
			"having lunch with Janet Yellen where I explained that her interest rate policies are leading this country down a path of ruin.",
			"meeting with my therapist about how to handle a world where I'm surrounded by idiots."
		];			
	} else if (ownerType == 5) {	// win now	
		activities = [
			"having heart surgery.",
			"having my hip replaced.",
			"going to my wife's funeral.",
			"getting checked for Alzheimer's",
			"picking up my latest batch of 27 different types of prescription pills.",
			"getting checked for lung cancer.",
			"improving my arthritis.",
			"making sure my diabetes is in check.",
			"heading to the hospital to check on my hip after I fell.",
			"a liver biopsy.",
			"not thinking about itching my shingles."
		];			
	} else {   // don't lose money
		activities = [
			"selling off my house.",
			"selling off one of my cars.",
			"selling off one of my businesses.",
			"letting off one of my employees go.",
			"closing an office.",
			"paying child support.",
			"spending some time with my kids while they are in town.",
			"talking to my ex-wife's lawyer.",
			"selling off my boat.",
			"stocking up on Ramen noodles.",
			"selling off my furniture."
		];			
	}	

    // Intro of annual message
    intro = [];
    intro = [
        "Sorry we haven't chatted much this year, but I've been busy {{activity}} "
    ];

    // 0: bad overall, getting worse
    // 1: bad overall, improving
    // 2: mediocre
    // 3: good overall, getting worse
    // 4: good overall, improving

    // Wins
    wins = [];
	
	if (ownerType == 0) { // standard, worst of all owners
		wins[0] = [
			"This is an embarrassment. We lose so much, I can't even show my face around our region. Buying this team was supposed to make me a celebrity, but not one of those bad celebrities that everyone hates. Turn it around.",
			"I need some wins. Fans hate losers. Free agents hate losers. What's your strategy? Keep on losing until I fire you? You're making good progress, then."
		];
	} else if (ownerType == 1) { // best of all owners
		wins[0] = [
			"The losing this year was tough. Stick to your plan. We just need to see progress.",
			"I hired you for a reason. Don't worry about the fan complaints about losing. Just keep getting better."
		];
	} else if (ownerType == 2) { // cynical?
		wins[0] = [
			"If winning was easy everybody would do it. Too bad I can't find anyone else who can win, either. ",
			"I've got your resignation letter here. Whenever you finally lose complete hope in winning some games it is there for you. Not that I'll be able to find a better replacement. Just more hassle for me."
		];
	} else if (ownerType == 3) { // super into it
		wins[0] = [
			"This is all part of the plan right? We're building through the draft? Can't wait to see this unfold.",
			"First we lose big, then we lose a little, then we win a little, and then we win big! Right?"
		];
	} else if (ownerType == 4) {	// micro manager	
		wins[0] = [
			"Your team synergy is a complete mess. How do you ever expect to win more games with this roster?",
			"I could have this team winning next year if I was GM. Upgrade your MID, trade your Jungler, and bench your Support. I'm not paying you to have your hand held."
		];
	} else if (ownerType == 5) {	// win now	
		wins[0] = [
			"I'm sorry to have to tell you this, but you are falling short. I need to see this team winning more.",
			"The lack of wins is making me wonder if you can build that dynasty. Please do better."
		];
	} else {   // don't lose money
		wins[0] = [
			"I know I'm not that focused on wins, but this stings.",
			"The lack of winning hurts almost as much as going bankrupt."
		];
	}	

	
	if (ownerType == 0) { // standard, worst of all owners
		wins[1] = [
			"I recognize we're getting better and our team has some potential for growth, but don't fuck this up. You've already used up most of my patience.",
			"You keep telling me we have \"potential\", but potential doesn't win games."
		];
	} else if (ownerType == 1) { // best of all owners
		wins[1] = [
			"The winning is improving. Keep it up.",
			"I can see your vision starting to take root. Looking forward to seeing even more wins."
		];
	} else if (ownerType == 2) { // cynical?
		wins[1] = [
			"Anyone can get lucky, but luck runs out. If you had some skill I might expect the winning to continue. Too bad for us I guess.",
			"People are starting to get a little exited with the winning. It is just going to make it that much harder to take when you blow this. Oh well."
		];
	} else if (ownerType == 3) { // super into it
		wins[1] = [
			"This is all part of the plan right? We're building through the draft? Can't wait to see this unfold.",
			"First we lose big, then we lose a little, then we win a little, and then we win big! Right?"
		];
	} else if (ownerType == 4) {	// micro manager	
		wins[1] = [
			"You are making progress, but if you replace your MID you'll get an extra two wins.",
			"The ADC/Support combo isn't working. Surprised you won so much with that."
		];
	} else if (ownerType == 5) {	// win now	
		wins[1] = [
			"I like what I'm seeing. You are giving me hope.",
			"Your vision is unfolding. Keep it up."
		];
	} else {   // don't lose money
		wins[1] = [
			"I like the improvement. Hope you can keep it up.",
			"Maybe you can make winning work after all."
		];
	}	

	
	if (ownerType == 0) { // standard, worst of all owners
		wins[2] = [
			"So, I mean, it could be worse. But that's not good enough.",
			"In this league, mediocrity can be worse than losing. I hope you have some plan to get us to the next level."
		];
	
	} else if (ownerType == 1) { // best of all owners
		wins[2] = [
			"I'm sensing a loss of direction. Make a plan to get to the top and execute.",
			"It might be a good time to reevalute things. We seem to be drifting."
		];
	} else if (ownerType == 2) { // cynical?
		wins[2] = [
			"Are you just taking a paycheck at this point. I guess some people can be happy with that.",
			"If only we had a plan. If only we had someone who could create a plan. I guess we'll just stay mediocre."
		];
	} else if (ownerType == 3) { // super into it
		wins[2] = [
			"We are going to break out at any moment. I can feel it.",
			"This is kind of how it was the day before I sold my company. The great season could be right around the corner."
		];
	} else if (ownerType == 4) {	// micro manager	
		wins[2] = [
			"Your recruiting is pedestrian. You need to focus more on youth and potential.",
			"We need a big recruit to get us out of this rut. Bring in a star."
		];
	} else if (ownerType == 5) {	// win now	
		wins[2] = [
			"Sometime I wonder if this is ever going to happen. We need to keep moving forward. ",
			"I'm not getting any younger. We need to start winning more."
		];
	} else {   // don't lose money
		wins[2] = [
			"With our budget constraints I guess I can't expect much better.",
			"I know our budget is tight, but is there any plan in place for winning?"
		];
	}	
	
	
	if (ownerType == 0) { // standard, worst of all owners
		wins[3] = [
			"Don't think you can coast on your past success for too long. I'm not planning on rebuilding for a decade.",
			"What have you done for me lately?"
		];
	
	} else if (ownerType == 1) { // best of all owners
		wins[3] = [
			"Setbacks build character. Learn from it and come back stronger.",
			"Keep on plan. I know it can be a bumpy road."
		];
	} else if (ownerType == 2) { // cynical?
		wins[3] = [
			"Here we go again. I knew it was just a matter of time before you started slipping to the bottom.",
			"And there goes our fanbase. Hope you had fun while you could."
		];
	} else if (ownerType == 3) { // super into it
		wins[3] = [
			"We got so unlucky this year. I'm sure next year will be better.",
			"A little down, but I know you'll figure this out."
		];
	} else if (ownerType == 4) {	// micro manager	
		wins[3] = [
			"You were doing OK. But your strategy is slipping. You are drifting from the Meta too much with your bans and picks.",
			"The new Meta is Garen top. People don't see it yet. That will get you back on track."
		];
	} else if (ownerType == 5) {	// win now	
		wins[3] = [
			"I thought we might do better this year. I hope I can make it another year. ",
			"This year really had me feeling old. I am really looking forward to you getting back on track."
		];
	} else {   // don't lose money
		wins[3] = [
			"I hope we don't lose too many fans because of this.",
			"I was starting to get used to doing well."
		];
	}	
	
	
	

	
	if (ownerType == 0) { // standard, worst of all owners
		wins[4] = [
			"I'm pleased with our regular season performance.",
			"I like the roster you've put together. We'll be at the top of our league for a long time."
		];	
	} else if (ownerType == 1) { // best of all owners
		wins[4] = [
			"I'm pleased with our regular season performance.",
			"I like the roster you've put together. We'll be at the top of our league for a long time."
		];
	} else if (ownerType == 2) { // cynical?
		wins[4] = [
			"I'm pleased with our regular season performance.",
			"I like the roster you've put together. We'll be at the top of our league for a long time."
		];
	} else if (ownerType == 3) { // super into it
		wins[4] = [
			"I'm pleased with our regular season performance.",
			"I like the roster you've put together. We'll be at the top of our league for a long time."
		];
	} else if (ownerType == 4) {	// micro manager	
		wins[4] = [
			"I'm pleased with our regular season performance.",
			"I like the roster you've put together. We'll be at the top of our league for a long time."
		];
	} else if (ownerType == 5) {	// win now	
		wins[4] = [
			"I'm pleased with our regular season performance.",
			"I like the roster you've put together. We'll be at the top of our league for a long time."
		];
	} else {   // don't lose money
		wins[4] = [
			"I'm pleased with our regular season performance.",
			"I like the roster you've put together. We'll be at the top of our league for a long time."
		];
	}		

    // Playoffs
    playoffs = [];
	//if ( g.gameType == 1 ) {
/*		playoffs[5] = [
			"Our fans are starving, absolutely starving, for some success moving out of the Ladder. But with the job you're doing, we're not even close. Unacceptable.",
			"CS Promotion? Don't talk to me about the CS. You kidding me? CS? I just hope we can win a game!"
		];*/
		
	if (ownerType == 0) { // standard, worst of all owners
		playoffs[5] = [
			"Our fans are starving, absolutely starving, for some success moving out of the Ladder. But with the job you're doing, we're not even close. Unacceptable.",
			"CS Promotion? Don't talk to me about the CS. You kidding me? CS? I just hope we can win a game!"
		];
	} else if (ownerType == 1) { // best of all owners
		playoffs[5] = [
			"At some point we need to make it out of the Ladder.",
			"Looking forward to moving up to CS."			
		];
	} else if (ownerType == 2) { // cynical?
		playoffs[5] = [
			"You don't know how to make CS teams.",
			"I don't think this team will ever make the CS again."
		];
	} else if (ownerType == 3) { // super into it
		playoffs[5] = [
			"Really looking forward to making the CS.",
			"Can't wait until we make the CS."			
		];
	} else if (ownerType == 4) {	// micro manager	
		playoffs[5] = [
			"Your MID and TOP aren't CS caliber. Upgrade them.",
			"Your ADC/Support combination aren't CS caliber. Upgrade them."
		];
	} else if (ownerType == 5) {	// win now	
		playoffs[5] = [
			"We can't keep missing the CS much longer.",
			"I am too old to keep missing the CS."
		];
	} else {   // don't lose money
		playoffs[5] = [
			"Missing the CS almost makes me want to go bankrupt for just one championship. Almost.",
			"Maybe one day we can make the CS?",
		];
	}	
	
		

	
		if (ownerType == 0) { // standard, worst of all owners
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
		} else if (ownerType == 1) { // best of all owners
		
		playoffs[6] = [
			"Falling to the Ladder hurts. You can turn it around.",
			"This is a big setback. We got out of the Ladder once it we can do it again."
		];
		playoffs[7] = [
			"We showed we can play in the LCS. Now we just need to get back.",
			"You can only fall to the CS if you were once an LCS team. That means something."
		];
		playoffs[8] = [
			"We'll get to the CS. We just need to keep at it."
		];
		playoffs[9] = [
			"Almost made the CS."
		];
		playoffs[10] = [
			"At least we stayed in the LCS."
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

		playoffs[17] = [
			"Almost made it the LCS."
		];		
		playoffs[18] = [
			"Nice job making the CS. Now get us to the LCS."
		];
		playoffs[19] = [
			"Welcome the LCS. Now it really begins. Let's get a championship."
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
				"Congratulations on the title! Now get us another!"
			];
		} else if (ownerType == 2) { // cynical?
		
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
				"Nice job on the title. I guess miracles do happen."
			];
		} else if (ownerType == 3) { // super into it
		
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
				"YES! YES! YES! We are the champions!"
			];
		} else if (ownerType == 4) {	// micro manager	
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
				"You've listened to me well. Congratulations on the title."
			];
		} else if (ownerType == 5) {	// win now	
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
				"Son, you did it! Now just a few more titles and an old man can die in peace."
			];
		} else {   // don't lose money
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
				" Congratulations on the title. I expect us to make a lot of money next year with all these new fans."
			];
		}			
		/*playoffs[36] = [
			"Winning titles can cover up a lot of flaws.",
			"I need some more jewelry. Go get me another ring."
		];*/
		
	
//	} else {
	//console.log(g.gameType);	

		
	if (ownerType == 0) { // standard, worst of all owners
		playoffs[0] = [
			"Our fans are starving, absolutely starving, for some postseason success. But with the job you're doing, we're not even close to the playoffs. Unacceptable.",
			"Playoffs? Don't talk to me about playoffs. You kidding me? Playoffs? I just hope we can win a game!"
		];
	} else if (ownerType == 1) { // best of all owners
		playoffs[0] = [
			"At some point we need to make the playoffs.",
			"Looking forward to this playoff drought ending."			
		];
	} else if (ownerType == 2) { // cynical?
		playoffs[0] = [
			"You don't know how to make playoff teams.",
			"I don't think this team will ever make the playoffs again."
		];
	} else if (ownerType == 3) { // super into it
		playoffs[0] = [
			"Really looking forward to making the playoffs.",
			"Can't wait until we make the playoffs."			
		];
	} else if (ownerType == 4) {	// micro manager	
		playoffs[0] = [
			"Your MID and TOP aren't playoff caliber. Upgrade them.",
			"Your ADC/Support combination aren't playoff caliber. Upgrade them."
		];
	} else if (ownerType == 5) {	// win now	
		playoffs[0] = [
			"We can't miss the playoffs much longer.",
			"I am too old to keep missing the playoffs. We need at least a shot at a championship to start building the dynasty."
		];
	} else {   // don't lose money
		playoffs[0] = [
			"Missing the playoffs almost makes me want to go bankrupt for just one championship. Almost.",
			"Maybe one day we can make the playoffs?",
		];
	}			
		
	if (ownerType == 0) { // standard, worst of all owners
		playoffs[1] = [
			"In this sport, you can't just be happy with making the playoffs. You have to get to the next level.",
			"A first round playoff exit is boring."
		];
	} else if (ownerType == 1) { // best of all owners
		playoffs[11] = [
			"Anytime you can make the playoffs you at least give yourselves a shot.",
			"At least we made the playoffs."			
		];
		
		playoffs[1] = [
			"Anytime you can make the playoffs you at least give yourselves a shot.",
			"At least we made the playoffs."			
		];
	} else if (ownerType == 2) { // cynical?
		playoffs[1] = [
			"That first round exit showed we aren't really a playoff team.",
			"I was suprised we made the playoffs anyway."
		];
	} else if (ownerType == 3) { // super into it
		playoffs[1] = [
			"It was awesome making the playoffs. Looking forward to winning it all soon!",
			"Can't believe we lost in the first round of the playoffs. We'll get it next year."			
		];
	} else if (ownerType == 4) {	// micro manager	
		playoffs[1] = [
			"To make it past the first round we need to upgrade our TOP.",
			"To make it past the first round we need to upgrade our MID."
		];
	} else if (ownerType == 5) {	// win now	
		playoffs[1] = [
			"Dissapointing playoff loss. Maybe next year.",
			"That playoff loss hurt."
		];
	} else {   // don't lose money
		playoffs[1] = [
			"Nice job making the playoffs.",
			"We made the playoffs. I'm impressed.",
		];
	}			

	if (ownerType == 0) { // standard, worst of all owners
		playoffs[2] = [
			"Hey. I'm a champion. I don't know about you, but that's what my teams do. They win championships. Yeah, making the playoffs is okay I guess, but I'm not satisfied.",
			"We need to make some real noise in the playoffs. Soon."
		];
	} else if (ownerType == 1) { // best of all owners
		playoffs[16] = [
			"Anytime you can make the playoffs you at least give yourselves a shot.",
			"At least we made the playoffs."			
		];
		
		playoffs[2] = [
			"Anytime you can make the playoffs you at least give yourselves a shot.",
			"At least we made the playoffs."			
		];
	} else if (ownerType == 2) { // cynical?
		playoffs[2] = [
			"That first round exit showed we aren't really a playoff team.",
			"I was suprised we made the playoffs anyway."
		];
	} else if (ownerType == 3) { // super into it
		playoffs[2] = [
			"It was awesome making the playoffs. Looking forward to winning it all soon!",
			"Can't believe we lost in the first round of the playoffs. We'll get it next year."			
		];
	} else if (ownerType == 4) {	// micro manager	
		playoffs[2] = [
			"To make it past the first round we need to upgrade our TOP.",
			"To make it past the first round we need to upgrade our MID."
		];
	} else if (ownerType == 5) {	// win now	
		playoffs[2] = [
			"Dissapointing playoff loss. Maybe next year.",
			"That playoff loss hurt."
		];
	} else {   // don't lose money
		playoffs[2] = [
			"Nice job making the playoffs.",
			"We made the playoffs. I'm impressed.",
		];
	}		
	
	if (ownerType == 0) { // standard, worst of all owners
		playoffs[3] = [
			"Consistent conference success is the standard. Never forget that.",
			"I hope you don't plan on being out of the playoffs for long."
		];
	} else if (ownerType == 1) { // best of all owners
		playoffs[3] = [
			"Setbacks happen. I'm backing you. We'll be back in the playoffs soon enough.",
			"Missing the playoffs hurts, but I know you can rebound."			
		];
	} else if (ownerType == 2) { // cynical?
		playoffs[3] = [
			"Out of the playoffs. I could see this happening a lot.",
			"Looks like your time here is almost up after missing the playoffs. I don't think you can get back."
		];
	} else if (ownerType == 3) { // super into it
		playoffs[3] = [
			"I can't believe we didn't make the playoffs this year. I really liked our team.",
			"This must be best team to ever miss the playoffs."			
		];
	} else if (ownerType == 4) {	// micro manager	
		playoffs[3] = [
			"That trade last year completely destroyed our chemistry and now we are missing the playoffs. Go get him back.",
			"You are having a hard time keeping us a playoff team. The team needs better balance of youth and experience."
		];
	} else if (ownerType == 5) {	// win now	
		playoffs[3] = [
			"As you know, missing the playoffs is extremely disappointing. However, I still believe in you.",
			"Almost thought we were on track for a dynasty there. I know you can right the ship."
		];
	} else {   // don't lose money
		playoffs[3] = [
			"I hope missing the playoffs doesn't hurt us too much with the fans. That extra revenue was nice.",
			"Our revenue is going to take a hit from missing the playoffs. I hope you are watching costs.",
		];
	}
	
	
	if (ownerType == 0) { // standard, worst of all owners
		playoffs[4] = [
			"Winning titles can cover up a lot of flaws.",
			"I need some more jewelry. Go get me another ring."
		];
	} else if (ownerType == 1) { // best of all owners
		playoffs[4] = [
			"Congratulations on the title! Now get us another!"
		];
	} else if (ownerType == 2) { // cynical?
		playoffs[4] = [
			"Nice job on the title. I guess miracles do happen."
		];
	} else if (ownerType == 3) { // super into it
		playoffs[4] = [
			"YES! YES! YES! We are the champions!"
		];
	} else if (ownerType == 4) {	// micro manager	
		playoffs[4] = [
			"You've listened to me well. Congratulations on the title."
		];
	} else if (ownerType == 5) {	// win now	
		playoffs[4] = [
			"Son, you did it! Now just a few more titles and an old man can die in peace."
		];
	} else {   // don't lose money
		playoffs[4] = [
			" Congratulations on the title. I expect us to make a lot of money next year with all these new fans."
		];
	}	
//	}
    // Money
    money = [];
	
	if (ownerType == 0) { // standard, worst of all owners
		money[0] = [
			"Money is an issue. I'm going broke. This is ridiculous. I'm supposed to be rich, but I can barely afford my monocle polish these days.",
			"I can't afford a season in the red. Is it really that hard to turn a big profit in this business?"
		];
	} else if (ownerType == 1) { // best of all owners
		money[0] = [
			"We need to boost profitability.",
			"We aren't making enough. We need you to focus on this more."
		];
	} else if (ownerType == 2) { // cynical?
		money[0] = [
			"You'll probably never get this team making money. I'll be sure to replace you with someone who doesn't bankrupt me.",
			"I guess you've given up all hope at making this a viable business."
		];
	} else if (ownerType == 3) { // super into it
		money[0] = [
			"Spending to win. I can buy into that.",
			"I've got $20 million. So we can afford some money issues."			
		];
	} else if (ownerType == 4) {	// micro manager	
		money[0] = [
			"You need to trade your two highest cost players right now.",
			"I hope you don't plan on resigning anyone. We can't afford it."
		];
	} else if (ownerType == 5) {	// win now	
		money[0] = [
			"We want to win, but be cost conscious. I'm a business man. I know you can do better.",
			"We are getting a little reckless with the spending. Spend, but spend wisely."
		];
	} else {   // don't lose money
		money[0] = [
			"We have a got a major problem. We need to make more.",
			"Focus on the money. Do whatever you have to do. This isn't working."
		];
	}	
	
	if (ownerType == 0) { // standard, worst of all owners
		money[1] = [
			"I like the recent financial turnaround you engineered. But I can't afford any setback."
		];
	} else if (ownerType == 1) { // best of all owners
		money[1] = [
			"I like the recent financial turnaround you engineered. Keep it up."
		];
	} else if (ownerType == 2) { // cynical?
		money[1] = [
			"I like the recent financial turnaround you engineered. If only you knew how to maintain it."
		];
	} else if (ownerType == 3) { // super into it
		money[1] = [
			"I like the recent financial turnaround you engineered. I see big profits ahead."
		];
	} else if (ownerType == 4) {	// micro manager	
		money[1] = [
			"I like the recent financial turnaround you engineered. You are still spending a little too much on your bench."
		];
	} else if (ownerType == 5) {	// win now	
		money[1] = [
			"I like the recent financial turnaround you engineered."
		];
	} else {   // don't lose money
		money[1] = [
			"Great job on the recent financial turnaround you engineered."
		];
	}		
	
	
	if (ownerType == 0) { // standard, worst of all owners
		money[2] = [
			"Listen. I need another paint job on my private jet. Cut back on spending, increase revenue, whatever. I'm not an accountant. I just know I need another paint job.",
			"I didn't buy this team just for fun. We should be making a higher profit."
		];
	} else if (ownerType == 1) { // best of all owners
		money[2] = [
			"I like the recent financial turnaround you engineered. Keep it up."
		];
	} else if (ownerType == 2) { // cynical?
		money[2] = [
			"I like the recent financial turnaround you engineered. If only you knew how to maintain it."
		];
	} else if (ownerType == 3) { // super into it
		money[2] = [
			"I like the recent financial turnaround you engineered. I see big profits ahead."
		];
	} else if (ownerType == 4) {	// micro manager	
		money[2] = [
			"I like the recent financial turnaround you engineered. You are still spending a little too much on your bench."
		];
	} else if (ownerType == 5) {	// win now	
		money[2] = [
			"I like the recent financial turnaround you engineered."
		];
	} else {   // don't lose money
		money[2] = [
			"Great job on the recent financial turnaround you engineered."
		];
	}			
	
	if (ownerType == 0) { // standard, worst of all owners
		money[3] = [
			"Just because you made some money in the past doesn't mean you're allowed to lose money now.",
			"I liked what you were doing before this year, financially. This year, not so much."
		];
	} else if (ownerType == 1) { // best of all owners
		money[3] = [
			"Income came in low this year. Be a little more careful there.",
			"Dips in income happen. We like your plan. Just stay on track."
		];
	} else if (ownerType == 2) { // cynical?
		money[3] = [
			"Have you been pocketing some of the revenue?",
			"I've got my own personal Madoff blowing up here. Has this team ever really made money?"
		];
	} else if (ownerType == 3) { // super into it
		money[3] = [
			"I'm sure profits will be back up next year. We are going to make so much money.",
			"A little dip in earnings is a small price to pay for the team you are putting together."
		];
	} else if (ownerType == 4) {	// micro manager	
		money[3] = [
			"That last contract blew up our finances. Get rid of it.",
			"The fans aren't growing like you expected. You need to cut costs. Trade the Support for someone cheaper."
		];
	} else if (ownerType == 5) {	// win now	
		money[3] = [
			"A little dip in earnings is fine as long it is part of your plan.",
			"I can take the temporary profits hit if it is needed to stay on track."
		];
	} else {   // don't lose money
		money[3] = [
			"The earnings this year really scare me. We need this to rebound and quick.",
			"It has been really tough this year. You are pushing me to the brink with these poor earnings."
		];
	}			
	

	if (ownerType == 0) { // standard, worst of all owners
		money[4] = [
			"I just got a new paint job on my private jet. That's all thanks to you. Keep pinching those pennies!",
			"I just looked over the team finances. I like what I see. Keep up the good work there."
		];
	} else if (ownerType == 1) { // best of all owners
		money[4] = [
			"Great earnings this year. I am plowing those profits into an interesting start up idea that may be able to feed all of Africa for pennies a day.",
			"You are doing such a great job financially I'm thinking about getting another eSports team. Think you can GM two teams?"
		];
	} else if (ownerType == 2) { // cynical?
		money[4] = [
			"What are you Maddoff or something?",
			"I've got my accountants double checking the income statements of the team. Something seems fishy."
		];
	} else if (ownerType == 3) { // super into it
		money[4] = [
			"Wow! This is going to be worth more than than my first business!",
			"The money is coming in so quickly I can hardly spend it fast enough!"
		];
	} else if (ownerType == 4) {	// micro manager	
		money[4] = [
			"I just got a new paint job on my private jet. That's all thanks to you. Keep pinching those pennies!",
			"I just looked over the team finances. I like what I see. Keep up the good work there."
		];
	} else if (ownerType == 5) {	// win now	
		money[4] = [
			"I just got a new paint job on my private jet. That's all thanks to you. Keep pinching those pennies!",
			"I just looked over the team finances. I like what I see. Keep up the good work there."
		];
	} else {   // don't lose money
		money[4] = [
			"Great job with earnings. At this rate we are in great shape!"
		];
	}				
	


    // 0: bad
    // 1: mediocre
    // 2: good

    // Overall
    ovr = [];

	if (ownerType == 0) { // standard, worst of all owners
		ovr[0] = [
			"Bye.",
			"Please, don't bother me until you have some good news.",
			"I'm watching you. Seriously, one of your assistant coaches is a spy. Don't fuck up."
		];
	} else if (ownerType == 1) { // best of all owners
		ovr[0] = [
			"Something needs to be done.",
			"We are not on the right track. Find your weaknesses and get it turned around. I believe in you.",
			"I hired you for a reason and I think those reasons still stand. However, I need to start seeing some progress."
		];
	} else if (ownerType == 2) { // cynical?
		ovr[0] = [
			"I knew I shouldn't have hired you.",
			"What have you been doing all year? You look awfully tan.",
			"You are lucky I can't find a replacement."
		];
	} else if (ownerType == 3) { // super into it
		ovr[0] = [
			"This eSports thing is a little tougher than I thought.",
			"Even the greats have their bad periods."
		];
	} else if (ownerType == 4) {	// micro manager	
		ovr[0] = [
			"In summary, you've got a lot of changes to make.",
			"If I tell you how to do every single thing I might as well do it myself."
		];
	} else if (ownerType == 5) {	// win now	
		ovr[0] = [
			"Bye.",
			"See you next year, hopefully."
		];
	} else {   // don't lose money
		ovr[0] = [
			"Bye.",
			"I'll be tracking you a little closer next year. We can't afford to slip up."
		];
	}	


	if (ownerType == 0) { // standard, worst of all owners
		ovr[1] = [
			"You bore me. Everything about you, it's just boring. Come talk to me when you've earned me more millions and won me some more championships.",
			"You know, general managers aren't hired to be mediocre. Do better next year.",
			"I've been meaning to tell you about this great idea I had. What if we went all Mid and tried to take the Nexus in the first 5 minutes? Pure genius, isn't it?"
		];
	} else if (ownerType == 1) { // best of all owners
		ovr[1] = [
			"Keep executing that plan. We'll break through eventually.",
			"I belive in you. Don't waver now.",
			"Patience pays profits and championships. Just keep at it."
		];
	} else if (ownerType == 2) { // cynical?
		ovr[1] = [
			"I'm looking for someone with more dedication. I'll let you know when I find them.",
			"I'm looking for someone with more passion. I'll let you know when I find them.",
			"I'm looking for someone with more insight. I'll let you know when I find them."
		];
	} else if (ownerType == 3) { // super into it
		ovr[1] = [
			"Can't wait until next year!",
			"Next year is going to be great!"
		];
	} else if (ownerType == 4) {	// micro manager	
		ovr[1] = [
			"Those changes should get us to the next level.",
			"Follow my instructions exactly and we should be fine."
		];
	} else if (ownerType == 5) {	// win now	
		ovr[1] = [
			"Bye."
		];
	} else {   // don't lose money
		ovr[1] = [
			"Bye."
		];
	}	

	
	if (ownerType == 0) { // standard, worst of all owners
		ovr[1] = [
			"You bore me. Everything about you, it's just boring. Come talk to me when you've earned me more millions and won me some more championships.",
			"You know, general managers aren't hired to be mediocre. Do better next year.",
			"I've been meaning to tell you about this great idea I had. What if we went all Mid and tried to take the Nexus in the first 5 minutes? Pure genius, isn't it?"
		];
	} else if (ownerType == 1) { // best of all owners
		ovr[1] = [
			"Keep executing that plan. We'll break through eventually.",
			"I belive in you. Don't waver now.",
			"Patience pays profits and championships. Just keep at it."
		];
	} else if (ownerType == 2) { // cynical?
		ovr[1] = [
			"I'm looking for someone with more dedication to replace you. I'll let you know when I find them.",
			"I'm looking for someone with more passion to replace you. I'll let you know when I find them.",
			"I'm looking for someone with more insight to replace you. I'll let you know when I find them."
		];
	} else if (ownerType == 3) { // super into it
		ovr[1] = [
			"Can't wait until next year!",
			"Next year is going to be great!"
		];
	} else if (ownerType == 4) {	// micro manager	
		ovr[1] = [
			"Those changes should get us to the next level.",
			"Follow my instructions exactly and we should be fine."
		];
	} else if (ownerType == 5) {	// win now	
		ovr[1] = [
			"Bye."
		];
	} else {   // don't lose money
		ovr[1] = [
			"Bye."
		];
	}		
	
    ovr[2] = [
        "Anyway, overall I'm happy with the progress you've made, but I need to get back to {{activity}}"
    ];		
		
		console.log("MESSAGE?")
        var activity1, activity2, indMoney, indOvr, indPlayoffs, indWins, m, ownerMoodSum;
		
		if (ownerType == 6) { // don't lose money owner
			ownerMoodSum = g.ownerMood.wins*.75 + g.ownerMood.playoffs*.75 + g.ownerMood.money*1.5;
		} else if (ownerType == 5) { // win now owner
			ownerMoodSum = g.ownerMood.wins*1.0 + g.ownerMood.playoffs*1.5 + g.ownerMood.money*0.5;
		} else {			
			ownerMoodSum = g.ownerMood.wins + g.ownerMood.playoffs + g.ownerMood.money;
		}
		

        if (g.showFirstOwnerMessage) {
            m = random.choice(first);
            require("core/league").setGameAttributes(tx, {showFirstOwnerMessage: false}); // Okay that this is async, since it won't be called again until much later
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

			console.log(g.gameType);
			if (g.gameType == 1) {
			console.log(g.gameType);			
				if (g.ownerMood.playoffs <= 0 && deltas.playoffs == -.20) {
					indPlayoffs = 5;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == -.19) {
					indPlayoffs = 6;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == -.18) {
					indPlayoffs = 7;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == -.04) {
					indPlayoffs = 8;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == -.03) {
					indPlayoffs = 9;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == -.02) {
					indPlayoffs = 10;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == -.01) {
					indPlayoffs = 11;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs <= 0.02) {
					indPlayoffs = 13;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs <= 0.03) {
					indPlayoffs = 14;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == 0.04) {
					indPlayoffs = 15;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == 0.05) {
					indPlayoffs = 16;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == 0.07) {
					indPlayoffs = 17;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == 0.20) {
					indPlayoffs = 18;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == 0.21) {
					indPlayoffs = 19;
				} else if (g.ownerMood.playoffs <= 0 && deltas.playoffs == 0.22) {
					indPlayoffs = 20;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == -.20) {
					indPlayoffs = 21;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == -.19) {
					indPlayoffs = 22;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == -.18) {
					indPlayoffs = 23;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == -.04) {
					indPlayoffs = 24;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == -.03) {
					indPlayoffs = 25;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == -.02) {
					indPlayoffs = 26;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == -.01) {
					indPlayoffs = 27;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs <= 0.02) {
					indPlayoffs = 29;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs <= 0.03) {
					indPlayoffs = 30;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == 0.04) {
					indPlayoffs = 31;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == 0.05) {
					indPlayoffs = 32;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == 0.07) {
					indPlayoffs = 33;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == 0.20) {
					indPlayoffs = 34;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == 0.21) {
					indPlayoffs = 35;
				} else if (g.ownerMood.playoffs >= 0 && deltas.playoffs == 0.22) {
					indPlayoffs = 36;
					
				} 

			} else {
						console.log(g.gameType);
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
			
			}

            indMoney = 2;
			console.log(g.ownerMood.money);
			console.log(deltas.money);
			

			
            if (g.ownerMood.money < 0 && deltas.money < 0) {
                indMoney = 0;
            } else if (g.ownerMood.money < -0.5 && deltas.money >= 0) {
                indMoney = 1;
            } else if (g.ownerMood.money > 0 && deltas.money < 0) {
                indMoney = 3;
            } else if (g.ownerMood.money > 0 && deltas.money > 0) {
                indMoney = 4;
            }

            indOvr = 1;
            if (ownerMoodSum > 0.5) {
                indOvr = 2;
            } else if (ownerMoodSum < -0.5) {
                indOvr = 0;
            }

			
            if (ownerMoodSum > -1) {
                m = "<p>" + random.choice(intro).replace("{{activity}}", activity1) + "</p>" +
                    "<p>" + random.choice(wins[indWins]) + " " + random.choice(playoffs[indPlayoffs]) + "</p>" +
                    "<p>" + random.choice(money[indMoney]) + "</p>" +
                    "<p>" + random.choice(ovr[indOvr]).replace("{{activity}}", activity2) + "</p>";
            } else if (g.season < g.gracePeriodEnd || g.godMode ) {
                if (deltas.wins < 0 && deltas.playoffs < 0 && deltas.money < 0) {
					if (ownerType == 0) { // standard, worst of all owners
						m = "<p>What the hell did you do to my team?! I'd fire you, but I can't find anyone who wants to clean up your mess.</p>";
					} else if (ownerType == 1) { // best of all owners
						m = "<p>I hope I can give you the time to see your plan through. I just can't tolerate this much longer.</p>";
					} else if (ownerType == 2) { // cynical?
						m = "<p>Who sent you here to sabotage this team. Surely you can't be trying. I'd fire you, but I can't find anyone who wants to clean up your mess.</p>";
					} else if (ownerType == 3) { // super into it
						m = "<p>I'm starting to lose faith in you.</p>";
					} else if (ownerType == 4) {	// micro manager	
						m = "<p>What the hell did you do to my team?! I'd fire you, but I don't have the time to fix this right now.</p>";
					} else if (ownerType == 5) {	// win now	
						m = "<p>This doesn't seem like it is working. We need to see some major progress.</p>";
					} else {   // don't lose money
						m = "<p>What the hell did you do to my team?! I'd fire you, but I can't find anyone who wants to clean up your mess.</p>";
					}					
                } else if (deltas.money < 0 && deltas.wins >= 0 && deltas.playoffs >= 0) {
					if (ownerType == 0) { // standard, worst of all owners
						m = "<p>I don't care what our colors are. I need to see some green! I won't wait forever. MAKE ME MONEY.</p>";
					} else if (ownerType == 1) { // best of all owners
						m = "<p>We just aren't profitable enough. The wins and titles don't matter if we are losing money. There needs to be major changes.</p>";
					} else if (ownerType == 2) { // cynical?
						m = "<p>What have you done with all my money? I've talked with the authorities and you are being investigated for fraud. I should know the results soon.</p>";
					} else if (ownerType == 3) { // super into it
						m = "<p>You know I love winning. However, we have to make money, too. It is urgent you fix this.</p>";
					} else if (ownerType == 4) {	// micro manager	
						m = "<p>Cut spending now! Winning doesn't matter if we aren't making money.</p>";
					} else if (ownerType == 5) {	// win now	
						m = "<p>Making money with this team isn't that important to me, but this is getting out of hand. Fix it.</p>";
					} else {   // don't lose money
						m = "<p>You've go me looking for tall buildings and bridges to jump from. Bring in a lot more money for both our sakes. And now.</p>";
					}					
                } else if (deltas.money >= 0 && deltas.wins < 0 && deltas.playoffs < 0) {
					if (ownerType == 0) { // standard, worst of all owners
						m = "<p>Our fans are out for blood. Put a winning team together, or I'll let those animals have you.</p>";
					} else if (ownerType == 1) { // best of all owners
						m = "<p>The brutal fact is we need to win. If you can't do that then we will have to move on.</p>";
					} else if (ownerType == 2) { // cynical?
						m = "<p>If you start winning you can keep your job. But since you probably can't I suggest leaving while you have some dignity left.</p>";
					} else if (ownerType == 3) { // super into it
						m = "<p>We have got to win more. Figure it out or I am going to have to move on. Sorry.</p>";
					} else if (ownerType == 4) {	// micro manager	
						m = "<p>We need to win more. This team isn't doing it. Follow my advice or your fired. </p>";
					} else if (ownerType == 5) {	// win now	
						m = "<p>I brought you in the to build a dynasty. I'm worried you are the wrong person for the job. The team needs to start winning.</p>";
					} else {   // don't lose money
						m = "<p>I appreciate the profitability. However, I feel like we could be making more if we could start winning. We need to starting winning or I am going to have to let you go.</p>";
					}						
                } else {
                    m = "<p>The longer you keep your job, the more I question why I hired you. Do better or get out.</p>";
                }
            } else {
                if (g.ownerMood.wins < 0 && g.ownerMood.playoffs < 0 && g.ownerMood.money < 0) {					
                    m = "<p>You've been an all-around disappointment. You're fired.</p>";
                } else if (g.ownerMood.money < 0 && g.ownerMood.wins >= 0 && g.ownerMood.playoffs >= 0) {
                    m = "<p>You've won some games, but you're just not making me enough profit. It's not all about wins and losses, dollars matter too. You're fired.</p>";
                } else if (g.ownerMood.money >= 0 && g.ownerMood.wins < 0 && g.ownerMood.playoffs < 0) {
                    m = "<p>I like that you've made a nice profit for me, but you're not putting a competitive team out there. We need a new direction. You're fired.</p>";
                } else {
                    m = "<p>You're fired.</p>";
                }
				if (ownerType == 0) { // standard, worst of all owners
					m += '<p>I hear a few other teams are looking for a new GM. <a href="' + helpers.leagueUrl(["new_team"]) + '">Take a look.</a> Please, go run one of those teams into the ground.</p>';
				} else if (ownerType == 1) { // best of all owners
					m += '<p>I hear a few other teams are looking for a new GM. <a href="' + helpers.leagueUrl(["new_team"]) + '">Take a look.</a> They may be a better fit for you.</p>';
				} else if (ownerType == 2) { // cynical?
					m += '<p>I hear a few other teams are looking for a new GM. <a href="' + helpers.leagueUrl(["new_team"]) + '">Take a look.</a> Not that it will turn out any better for you.</p>';		
				} else if (ownerType == 3) { // super into it					
					m += '<p>I hear a few other teams are looking for a new GM. <a href="' + helpers.leagueUrl(["new_team"]) + '">Take a look.</a> If you ever figure this GM thing out let me know.</p>';
				} else if (ownerType == 4) {	// micro manager	
					m += '<p>I hear a few other teams are looking for a new GM. <a href="' + helpers.leagueUrl(["new_team"]) + '">Take a look.</a> A word of advice, watch how I GM and learn from me.</p>';
				} else if (ownerType == 5) {	// win now	
					m += '<p>I hear a few other teams are looking for a new GM. <a href="' + helpers.leagueUrl(["new_team"]) + '">Take a look.</a> Good luck to you. My first business failed, too. You can make it work if you want it enough.</p>';
				} else {   // don't lose money
					m += '<p>I hear a few other teams are looking for a new GM. <a href="' + helpers.leagueUrl(["new_team"]) + '">Take a look.</a> Maybe focusing more on winning will be better for you.</p>';
				}					
				g.ownerType = random.randInt(0,5);
				
            }
        }

     //   tx = dao.tx("messages", "readwrite");
        return dao.messages.add({
            ot: tx,
            value: {
                read: false,
                from: "The Owner",
                year: g.season,
                text: m
            }
        }).then(function () {
            if (ownerMoodSum > -1) {
                return;
            }
            if (g.season < g.gracePeriodEnd || g.godMode ) {
                // Can't get fired yet... or because of God Mode
                return;
            }
            // Fired!
            return require("core/league").setGameAttributes(tx, {
                gameOver: true,
                showFirstOwnerMessage: true
            });
        });
    }

    return {
        generate: generate
    };
});