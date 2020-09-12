// Author: Alberto González Palomo https://sentido-labs.com
// ©2018 Alberto González Palomo https://sentido-labs.com

// Package a MacOS X .app directory as a DMG disk image.

module.exports = exports = function build(options, callback) {
    let app = require(`./${options.src}/${options.appDir}/Contents/Resources/app.nw/resources/app/package.json`);
    console.log(app);
    let cmd = `genisoimage -V "${app.name} ${app.version}" -D -R -apple -no-pad -o "${options.dest}/${app.name}-${app.version}.dmg" "${options.src}"`;
    require('child_process').execSync(cmd);
    console.log('CMD: ' + cmd);
    callback();
};
