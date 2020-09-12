// Author: Alberto González Palomo http://sentido-labs.com
// ©2018 Alberto González Palomo http://sentido-labs.com
// The author grants Steven Wegener
// a sublicensable, assignable, royalty free, including the rights
// to create and distribute derivative works, non-exclusive license
// to this software.

var steam = null;// Available for the web page.

const redirects = {
    'chrome-extension://account.basketball-gm.com/user_info.php?sport=moba':
    //'https://account.basketball-gm.com/user_info.php?sport=moba'
    null
};

// Do this only when running at the main page
// "chrome-extension:*/index.html",
// because the script gets loaded also for "chromewebdata:".
if (document.location.protocol === 'chrome-extension:' &&
    document.location.pathname === '/index.html') {
    history.replaceState(null, '', '/');// Important for routing.
    setupNWJSEnvironment(redirects);
}

function setupNWJSEnvironment(redirects)
{
    window.global = undefined;
    delete window.global;
    // These might interfere in the future but are fine for now:
    //window.require = undefined;// Still available as nw.require().
    //delete window.require;
    //window.process = undefined;
    //delete window.process;

    // https://developer.chrome.com/extensions/webRequest#event-onBeforeRequest
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
        // https://developer.chrome.com/extensions/webRequest#type-BlockingResponse
        let response = { cancel:false };
        let requestUrl = new URL(details.url);
        if (/^https?:\/\/[^\/]*zengm.com/.test(details.url)) {
            // Open those external URLs in the user's browser instead:
            // http://docs.nwjs.io/en/latest/References/Shell/
            nw.Shell.openExternal(details.url);
            // Cancelling won't work: we still get an error page
            // saying that the request is blocked, and it will continue
            // anyway. Instead, we redirect to the application page.
            let target = new URL(document.location);
            target.pathname = '/index.html';
            response = { redirectUrl:target.href };
        } else if (redirects.hasOwnProperty(details.url)) {
            response = { redirectUrl:redirects[details.url] };
            if (!response.redirectUrl) response = { cancel:true };
        } else if (requestUrl.pathname.startsWith('/l/') ||
                   requestUrl.pathname.startsWith('/delete_league/')) {
            // The route was not handled by React's router.
            alert('This route ' + requestUrl.pathname + '\n' +
                  'should have been handled by the app\'s router.');
            let target = new URL(document.location);
            target.pathname = 'index.html';
            response = { redirectUrl:target.href };
        }
        return response;
    }, { urls: [ "<all_urls>" ]}, ["blocking"]);

    // https://developer.chrome.com/extensions/webRequest#event-onErrorOccurred
    chrome.webRequest.onErrorOccurred.addListener(function (details) {
        console.error(details.error + ": (from " + details.initiator + ") " +
                      details.url);
    }, { urls: [ "<all_urls>" ]});

    process.chdir('app');// steam_appid.txt will be loaded from here.
    steam = require('./app/greenworks');
    if (!steam.initAPI()) {
        console.error('Steam initialization failure. Is Steam running?');
    } else {
        console.log('Steam is ready!');
        console.log('All achievements in game: ' +
                    JSON.stringify(steam.getAchievementNames()));
    }
}
