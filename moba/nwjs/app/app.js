// Clear the cache during development:
// http://docs.nwjs.io/en/latest/References/App/#appclearcache
nw.App.clearCache();


/* This causes the NWJS process to hang, will need another solution:
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
*/

nw.Window.open('/index.html', nw.App.manifest.window || {}, function(win) {
    // http://docs.nwjs.io/en/latest/References/Window/#windowopenurl-options-callback
    // This line forces a reload of the Javascript code:
    //win.reloadIgnoringCache();
});

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    // The only function we need from app is app.quit(), which happens to
    // be available in nw.App so we can just alias it.
    const app = nw.App;

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus

        // Install desktop and start menu shortcuts
        spawnUpdate(['--createShortcut', exeName]);

        setTimeout(app.quit, 1000);
        return true;

    case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers

        // Remove desktop and start menu shortcuts
        spawnUpdate(['--removeShortcut', exeName]);

        setTimeout(app.quit, 1000);
        return true;

    case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated

        app.quit();
        return true;
    }
}
