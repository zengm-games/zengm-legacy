// @flow

import React from 'react';
import {setTitle} from '../util';
import {NewWindowLink, SafeHtml} from '../components';

const Manual = () => {
    setTitle('Overview');

    return <div>
        <h1>Overview <NewWindowLink /></h1>

     <h2>MOBA GM Manual</h2>
 <p>MOBA GM is a MOBA (Multiplayer online battle arena) management simulation game. You are the general manager of an MOBA team, tasked with building your roster to compete for a championship while managing your finances. As of now, your goal can be whatever you want: winning the most championships, making the most profit, developing players from rookies to stars, etc. You can make an unlimited number of different leagues from <a href="/">the dashboard</a>, each one with a different set of random players.</p>
<p>In addition to the above features, you also have:</p>
<ul>
<li> Coach Mode with real time champion picking/banning,</li>
<li> additional game types such as Splits w/ MSI, and Worlds w/ Ladder,.</li>
<li> two types of champions/heroes to choose from,</li>
<li> an expanded array of champion/hero ratings such as Synergy, Counter, and Early/Mid/Late data, and</li>
<li> an expanded array of champion/hero stats such as league champion stats and player champion stats,</li>
<li> expanded God Mode options.</li>
</ul>  
<h2>User Interface</h2>
<p>From within a league, the most important user interface element is the Play Menu, which you can access with the big blue Play button at the top of the screen. Any context-dependent action, like playing a game or moving from one phase to another, is done from the Play Menu. Everything else about the user interface should (hopefully) be self-explanatory.</p>
<h2>Gameplay Overview</h2>
<p>Each season of the game is divided into several phases:</p>
<ul>
<li><b>Preaseason.</b> Players develop/age (<i>i.e.</i> their ratings change). Young players tend to get better, old players tend to get worse.</li>
<li><b>Spring Split (only in some game types and only MOBA GM).</b> Regular season games are played, at the pace you choose through the Play menu.</li>
<li><b>MSI (only in some game types and only MOBA GM).</b>  Teams that made the playoffs progress through the bracket playing best-of-5 series until a split champion emerges.</li>
<li><b>Summer Split.</b> Regular season games are played, at the pace you choose through the Play menu.</li>
<li><b>Playoffs.</b> Teams that made the playoffs progress through the bracket playing best-of-5 series until a champion emerges.</li>
<li><b>Re-Sign Players.</b> After the playoffs you have have a chance to resign your own players whose contracts are expiring before free agency.</li>
<li><b>Free agency.</b> 
Contracts expire. Players with expiring contracts become free agents. The same thing happens for the other teams, so the free agents list is most richly populated at this time.</li>
</ul>
<p>There are also Ladder game types. In these you have three tiers:</p>
<li><b>LCS (highest tier).</b> These teams compete for championships and to avoid being demoted to the CS tier.</li>
<li><b>CS (mid tier).</b> These teams compete to be promoted to the LCS tier and to avoid demotion the Ladder tier.</li>
<li><b>Ladder (lowest tier).</b> These teams compete to be promoted to the CS tier.</li>
<h2>League Rules</h2>
<p>League rules are generally modeled on League of Legends, but simplified.</p>
<h3>Contracts</h3>
<p>The maximum contract amount is $1 million per year and the maximum contract length is 3 years.</p>
<p>The minimum contract amount is $25 thousand per year and the minimum contract length is 1 year (or, until the end of the season, if the season is already in progress).</p>
<p>When a contract expires, you have the opportunity to negotiate a new contract with the player. If you don&#8217;t come to an agreement, the player becomes a free agent.</p>
<h3>Roster</h3>
<p>The maximum roster size is 10. You won&#8217;t be allowed to sign players above this limit. However, you can release players to fall below or let contracts expire.</p>
<p>The minimum roster size is 6. You must be above this limit to play games.</p>
<h2>Player Ratings</h2>
<p>Player ratings for a variety of categories (laning, team fighting, last hitting, positioning, etc.) are on a scale from 0-100. The whole scale is used, so a typical value for a rating is 50. Roughly, the overall (&#8220;ovr&#8221;) player ratings mean:</p>
<ul>
<li><b>90s:</b> All-time great</li>
<li><b>80s:</b> MVP candidate</li>
<li><b>70s:</b> All League candidate</li>
<li><b>60s:</b> Good starter</li>
<li><b>50s:</b> Role player</li>
<li><b>40s and lower:</b> Bench</li>
</ul>
<p>However, the overall ratings aren&#8217;t a guarantee of performance. The particular mix of ratings plays into success (<i>e.g.</i> a jungle player with a 100 last hitting rating doesn&#8217;t do much), as do a player&#8217;s teammates (<i>e.g.</i> a good shotcaller doesn&#8217;t help your team as much if you already have a good shotcaller).</p>
<p>The potential (&#8220;pot&#8221;) rating is also important. This is an estimate of the ceiling of the player&#8217;s future overall rating. Just like in real life, most players never reach their ceiling, but some do reach it and some even exceed it. As a player with high potential grows older, it becomes less and less likely that he will ever reach his potential.</p>
<p>The displayed ratings are not the real ratings. They are estimates from your analysts. Increase the analyst budget to see more accurate ratings.</p>
<p>Finally, little symbols you see next to a player&#8217;s name like <span class="skills-alone"><span title="Shot Calling" class="skill">SC, </span><span title="Team Player" class="skill">TP, </span><span class="skill" title="Aggression">Ag, </span><span title="Jungle Control" class="skill">JC</span><span class="skill" title="Tower Attack/Defense">Tw, </span><span class="skill" title="Champion Killing">CK, </span>and <span title="Lane Minion Killing" class="skill">CS</span></span> represent the key skills a player has. This is designed so that you can just glance at a player and easily take in that information. To see what a symbol means, hover your mouse over it or consult this list:</p>
<ul>
<li>SC: Shot Calling</li>
<li>TP: Team Player</li>
<li>Ag: Aggression</li>
<li>Tw: Tower Attack/Defense</li>
<li>JC: Jungle Control</li>
<li>CK: Champion Killing</li>
<li> CS: Lane Minion Killing</li>
</ul>
<h2>How does it work?</h2>
<p>There are no accounts, no passwords, no nothing. All the game data is stored locally on your computer using <a href="https://www.google.com/search?q=indexeddb">IndexedDB</a>. This has advantages and disadvantages. The main advantage is that it is really cheap to run this game, since simulations can occur in your web browser rather than a central server; this is what allows LOL GM to be free and unlimited. The two main disadvantages are (1) doing simulations in your web browser incurs some performance restrictions (but it&#8217;s not that bad), and (2) since the games are stored on your computer and not on a server, you can&#8217;t access the same leagues on different computers (eventually this will be possible though).</p>
<h2>Performance</h2>
<p>Game simulation can be taxing on your computer, particularly as additional seasons are simulated and the database grows. There are a couple of tricks you can use to speed this up:</p>
<ol>
<li>Don&#8217;t open multiple windows/tabs viewing while you are simulating games. If you do, then all of the windows will try to update their content every day, which takes valuable computing resources away from actually simulating the games.</li>
<li>Don&#8217;t have a complicated page (such as the league dashboard) open when you simulate games. As the simulation progresses, the content of whatever you&#8217;re viewing updates each day. If you&#8217;re viewing something complex, this can be a little slow. For the fastest performance, view something old like the standings from a previous season which does not have to update ever.</li>
<li>Within a league, go to Tools &gt; Improve Performance.</li>
</ol>
<h2>Customized Rosters</h2>
<p>By default, all players are completely randomly generated. <a href="https://basketball-gm.com/manual/customization/">Click here for more info about custom rosters.</a></p>
<h2>Customized Champions</h2>
<p>By default, the game comes with 126 champions (more with MOBA GM and two champion types). You can edit the basic information of these champions if you go to tools/edit champions.</p>
<h2>Customized Champion Patch Data</h2>
<p>By default, the game comes with certain champion strength based on the Meta. Some champions are gods one Meta and extremely difficult to play in another. You can edit these for each role if you go to tools/edit champion patch data</p>
<h2>Still not sure about something?</h2>
<p>If you have a question or think you found a bug or you want to request a feature, either <a href="mailto: commissioner@zengm.com">send an email</a> (commissioner@zengm.com) or <a href="https://www.reddit.com/r/ZenGMLOL/">make a post on Reddit</a>.</p>
        
    </div>;
};

export default Manual;
