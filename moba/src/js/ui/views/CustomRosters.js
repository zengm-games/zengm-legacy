// @flow

import React from 'react';
import {setTitle} from '../util';
import {NewWindowLink, SafeHtml} from '../components';

const Manual = () => {
    setTitle('Customization');

    return <div>
        <h1>Customization <NewWindowLink /></h1>
  <h2>Customization</h2>
<p>MOBA GM is a highly customizable game. Most of this is done through <b>League Files</b>,
 which contain the data of a MOBA GM league - teams, players, stats, etc. League Files have two main purposes:</p>
<ol>
<li>They allow you to use League Files created by others. 
You might find some of these <a href="https://www.reddit.com/r/ZenGMLOL/search?q=roster&restrict_sr=on">on Reddit</a>.
</li>
<li>They allow you to make a copy of a league you are playing. 
This allows you to have a backup of a league or to share a league across two computers.
 Within any league, go to "Tools > Export League" to create a League File.</li>
</ol>


<p>To use a League File, upload it when you <a href="http://mobagm.zengm.com/new_league">create a new league</a>.</p>
<p>It is also possible to import only a prospect class, only team info (cities, names, etc), only champion patch data, and champion/champion patch data from a League File. For prospect classes this is done at the Players > Prospects. For team info, go to Tools > Edit Team Info (only available after enabling God Mode).
For champion patch data, go to Tools > Edit Champion Patch (only available after enabling God Mode).
For champion data, go to Tools > Edit Champion Info (only available after enabling God Mode).
</p>
<h3>Editing League Files</h3>
<p>League Files are text files in <a href="https://en.wikipedia.org/wiki/Json">JSON</a> format. You can add/remove/edit nearly any part of it.</p>
<p>The easiest way to see what a League File looks like is to create one for one of your leagues. Within a league, go to Tools > Export League. That will bring you to a page that allows you to select which components you want to export. Note that you don't have to export everything, and that default values will be filled in for components that are not included in the League File.</p>
<p>What components should you include in your League File? It depends on your goal. If you want an exact copy of a specific league, you should select everything (except possibly Box Scores, since they take up a lot of space). If you want to create some customized rosters for others to use, you probably should just define the teams and the players, and then leave out most of the rest so their default values are used.</p>
<p>What is the best way to edit a League File? I'm not exactly sure. You can open them in any text editor and edit them by hand. Another way is to use <a href="
http://l.faziodev.org/bbgm-custom-rosters"><b>this cool spreadsheet template</b></a> created by <a href="http://www.reddit.com/r/BasketballGM/comments/33vkjq/v12_of_the_basketball_gm_roster_template_available/">MFazio23</a>.</p>
<p>League Files are divided into multiple sections, which are the root elements of the JSON data structure. These sections are described below. Most are relatively simple and self-explanatory if you just look at an exported League File. Some are a bit more complicated and have links to more comprehensive information. The most important ones are <code>players</code>. <code>teams</code>, <code>champions</code> and  <code>championPatch</code> .</p>
<ul>
<li><code>players</code> - Player attributes, ratings, and stats. </li>
<li><code>teams</code> - Team attributes and stats. </li>
<li><code>champions</code> - List of champion including synergy, counter, and early/mid/late data.</li>
<li><code>championPatch</code> - How strong each champion is in that patch for each role.</li>
</ul>
<p>There are also a number of other sections, most of which you would leave completely out of a League File you plan on sharing with others. They mainly define the internal state of your current specific league.</p>
<ul>
<li><code>gameAttributes</code> - Mostly internal variables that should be left alone, but some might be interesting to tweak. <a href="/manual/customization/game-attributes/">More information.</a></li>
<li><code>releasedPlayers</code> - List of players who have been released from their contracts but still count against the salary cap.</li>
<li><code>awards</code> - Offseason awards, such as MVP.</li>
<li><code>schedule</code> - Remaining scheduled games for the current season.</li>
<li><code>playoffSeries</code> - Playoff matchups and results for each prior season.</li>
<li><code>trade</code> - State of the current trade negotiation.</li>
<li><code>negotiations</code> - State of the current contract negotiations. There can only be one entry here at a time, except when re-signing your own players in the offseason.</li>
<li><code>messages</code> - Messages from the owner.</li>
<li><code>events</code> - Past events viewable from Tools > Event Log.</li>
<li><code>games</code> - Box score data from past games. This can get quite large, so it often makes sense to leave it off.</li>
</ul>
<h3>Debugging League Files</h3>
<p>Debugging can be tricky. Ultimately, the only way to be sure is to try it out. Testing after every change can help isolate bugs. </p>
    <h2>Custom Draft Classes</h2>
<p>By default, draft classes are filled with randomly-generated players. If you're using a custom League File, that can include up to 3 draft classes of pre-defined players.</p>
<p>Additionally, it is possible to overwrite a draft class in any current league with pre-defined players. To do this, go to Players > Draft > Draft Scouting, click "Customize", and upload a Draft Class File for whichever year you want. When you do this, it will delete all of the current prospects for that draft class, insert players from the uploaded file, and (if necessary) randomly generate some new players to fill out the draft class if the file contains less than 70 players.</p>
<p>Like with the custom League Files, there are two places to get Draft Class Files: download one or make your own. Again like League Files, you might find some to download <a href="https://www.reddit.com/r/ZenGMLOl/">on Reddit</a>. You can even use a League File as a Draft Class File - it will just take whoever is defined in the first draft and ignore everything else in the League File.</p>
<p>Just make sure to give every player a "tid" of -2. You can define as few or as many players as you want; if you define less than needed number, then randomly generated players will fill out the draft class when people use it.</p>
  <h2>Players Customization</h2>
<p>Some things you might want to know:</p>
<ul>
  <li>tid is the team ID number, ranging from 0 to N (usually 30) for the teams in your league. Additionally,
  <ul>
    <li>-1 is for free agents</li>
    <li>-2 is for undrafted players the ongoing or upcoming draft</li>
    <li>-3 is for retired players</li>
    <li>-4 is for prospects in next year's draft</li>
    <li>-5 is for prospects in the draft after that.</li>
  </ul>
  If you specify less than the number of needed prospects in a draft class, random prospects will be created to reach that limit.

  </li>
  <li>You can optionally include a URL for an image to be used instead of a randomly-generated face by putting "imgURL": "http://www.example.com/img.jpg" in the root of a player object.</li>
  <li>There are several other pieces of information you can include, maybe most notably stats from previous seasons. Look in an exported League File from one of your leagues to see what else can be added.</li>
</ul>
  <h2>Teams Customization</h2>
<p>The contents of each team object is as follows. Note that imgURL is optional.</p>
<ul>
<li>"tid": team ID number (from 0 to N-1 so there are N teams in total)</li>
<li>"cid": conference ID number (from 0 to N-1 so there are N conferences in total)</li>
<li>"did": division ID number (from 0 to N-1 so there are N divisions in total)</li>
<li>"region": team name</li>
<li>"name": team name</li>
<li>"pop": starting hype and team strength</li>
<li>"abbrev": team abbreviation, typically 3 upper case letters like ATL for Atlanta</li>
<li>"imgURL": URL for a 120x120 image to be displayed on the roster page for a team (optional)</li>
</ul>
<p>It is also possible to specify much more information, including results from past seasons and team statistics. To see how those are defined, look at an exported League File from one of your leagues.</p>


   <h2>Game Attributes Customization</h2>
<p>"Game Attributes" refers to some high-level variables that define the state of your game. When making a League File, don't have to specify them. Any you leave out will just get their default values. Some attributes that might be worth playing with are described here:</p>

<p><code>userTid</code> is the ID number of the team you are managing, from 0 to N-1, with N being the number of teams. Setting it here will make it the default for new leagues created with this League File, but users can still change it if they want.</p>
<p><code>phase</code> is the "phase" of the game, set by one of the following numbers (example for a league with both splits):</p>
<ul>
			
<li>0: preseason</li>
<li>1: spring split</li>
<li>2: spring split</li>
<li>3: midseason</li>
<li>4: summer split</li>
<li>5: summer split</li>
<li>6: summer playoffs</li>
<li>7: before free agency</li>
<li>8: re-sign players</li>
<li>9: free agency</li>
</ul>
<p>So by setting the phase, you can pick when your game starts. So if you want to create a League File that starts with the draft, you can do it!</p>
<p><code>daysLeft</code> only has an effect if you set your phase to 8 (free agency). It defines the number of days left before the preseason starts.</p>
<p>The values in <code>ownerMood</code> define how the owner feels about you. Positive numbers are good (max for each is 1), negative numbers are bad. If the sum ever drops below -1, you are fired.</p>

<h3>Conferences and Divisions</h3>

<p>The <code>confs</code> and <code>divs</code> properties let you change the conferences and divisions in the league. The default ones are shown above. You can have any number of conferences and divisions except 0. Things to remember:</p>

<ol>

<li>If you change the number of conferences or divisions, you must specify the teams as well, otherwise the game won't know what teams to put in what division.</li>

<li>The id properties <code>cid</code> and <code>did</code> must start at 0 and increase without gaps, same as <code>tid</code> for teams.</li>

</ol>


<h3>Confusing Season Stuff</h3>

<p><code>season</code> is the current season. <code>startingSeason</code> is the first season played in this league. <code>gracePeriodEnd</code> is the first season you can get fired after. If you set one of these, you should set all of them. You should also specify seasons for any stats, ratings, and attributes for your players and teams.</p>

<p>However, there is a shortcut to make things easier. Move <code>startingSeason</code> up to the root of the League File (at the same level as <code>gameAttributes</code>) and it will be used to automatically set all of the season variables everywhere. Or just leave <code>startingSeason</code> and all the other seasons out completely and the default value will be used.</p>

<h3>Champions </h3>

<p><code>champions</code> contians all the champion basic data, such as counter, synergy, and early/mid/late data. In general, this is difficult to add to because counter and synergy data
needs to be put in for each champion combination. However, if you just want to adjust how strong each champion is then you use the far easier <code>championPatch</code></p>

<h3>Champion Patch Data</h3>

<p><code>championPatch</code> is the current strength of each champion in each role. It is relatively easy to change in game or by uploading a file.
All champion and role combinations are givin a win rate (0 to 1). So if you change that win rate to 1 the champion should in theory never lose and at 0 wouuld never win.
 For the most part win rates are between .45 and .55. 
Outside that range would be considered particularly weak or strong</p>



    </div>;
};

export default Manual;
