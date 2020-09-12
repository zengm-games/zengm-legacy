global.prompt = function prompt(message, value) {
    return require('electron').ipcRenderer.sendSync('prompt', {message, value});
};

global.confirm = function confirm(message) {
    return require('electron').ipcRenderer.sendSync('confirm', {message});
};

console.error('Loading SteamWorks...');

var os = require('os');
var steam = require('greenworks');

if (!steam.initAPI()) {
    console.error('Steam initialization failure.');
} else {
    console.error('Steam is ready!');
    console.error('All achievements in game: ' +
                  JSON.stringify(steam.getAchievementNames()));
}
