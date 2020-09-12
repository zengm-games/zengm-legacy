// @flow

import React from 'react';
import {setTitle} from '../util';
import {NewWindowLink, SafeHtml} from '../components';

const Manual = () => {
    setTitle('Debugging');

    return <div>
        <h1>Debugging <NewWindowLink /></h1>
		
    <h2>Debugging</h2>
<h3>Browser Compatibility</h3>
<p>MOBA GM is available through Steam and through a browser. For browsers, it only works in Chrome (version 49 or higher), Firefox (version 47 or higher), and Safari (version 10 or higher). If you're already using one of those browsers and it's still not working, first make sure you're using the latest version. If you are, then continue reading...</p>
<h3>Debugging Info</h3>
<p>If you ran into a problem, let us know so we can help you or try to fix the bug through e-mail at commissioner@zengm.com, a message on Steam, or at the subreddit ZenGMLOL. Please include as much detail as possible, including:</p>
<ul>
<li>MOBA GM version (at the bottom of the page when in the game)</li>
<li>browser version</li>
<li>operating system</li>
<li>specific steps one can take to reproduce your problem.</li>
</ul>
<p>Additionally, if you want to be extra helpful, try to report the specific error message that occurs. To do this, <a href="http://webmasters.stackexchange.com/q/8525">open the JavaScript console of your web browser</a> and see if any error message gets displayed there when you observe a bug. For example, if the draft won't start when you press the "Start Draft" button, then enable debug mode, open the JavaScript console, and try pressing it again. You will probably see an error message that will be very helpful to a developer trying to fix the bug.</p>
<p>If you're using Chrome, you can do even better. Copy chrome://inspect/#workers into the address bar and hit enter, click "Inspect" under http://moba.zengm.com/gen/worker.js and it will pop up another window where error messages might appear.</p>
   
   <h2>Debugging Quota Errors / Hard Drive Space</h2>
<p>If MOBA GM is refusing to allow you to play more, it could be because of a quota error. This happens when your browser decides to not let you store any more data because it thinks you're running low on hard drive space.</p>
<p>Here are a few things you can try to fix the problem:</p>
<ul>
<li>Delete some old data from your leagues (Tools > Improve Performance within a league)</li>
<li>Delete some old leagues entirely</li>
<li>Delete some other files on your hard drive</li>
</ul>
<p>If none of that works, you can try a Hard Reset which will delete all your MOBA GM data and leave you with a completely blank slate. Sometimes this is the only way to get Chrome working again due to <a href="https://code.google.com/p/chromium/issues/detail?id=488851">this bug</a>.</p>
<p>And if all else fails, you can try using another browser. <a href="https://www.mozilla.org/en-US/firefox/desktop/">Firefox</a> works best.</p>
<p>If you need help, you can ask through e-mail at commissioner@zengm.com, a message on Steam, or at the subreddit ZenGMLOL.</p>

   <h2>Hard Reset For Browser</h2>
<p>Sometimes things just get stuck and you never get past the opening "Loading..." screen. If this happens, you can completely reset the game (and lose all your previous data) by doing this:</p>
<ol>
<li>Close your browser</li>
<li>Open your browser profile folder (Google for how to do this in Firefox and Chrome for your OS)</li>
<li><b>Chrome only:</b> Within your profile folder, there is another folder called "IndexedDB". Open that folder</li>
<li><b>Firefox only:</b> Within your profile folder, there is a folder called "storage" and another folder inside that called "persistent". Open that folder</li>
<li>Within that folder, there will be some other folder with "moba" in the name. Delete that folder</li>
<li>Open your browser again. The game should now work (although any previous game data will be gone)</li>
</ol>


    </div>;
};

export default Manual;
