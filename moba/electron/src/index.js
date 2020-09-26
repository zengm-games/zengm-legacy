// Author: Alberto González Palomo http://sentido-labs.com
// ©2018 Alberto González Palomo http://sentido-labs.com
// The author grants Steven Wegener
// a sublicensable, assignable, royalty free, including the rights
// to create and distribute derivative works, non-exclusive license
// to this software.

import { app, BrowserWindow, Menu, protocol, shell, ipcMain } from 'electron';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const fs   = require('fs');
const path = require('path');
const url  = require('url');

const scheme   = 'zen';
const hostname = 'mobagm.exe';
const webroot = `${__dirname}/../../build/`;
const mirror  = `${__dirname}/mirror/`;
protocol.registerStandardSchemes([scheme], { secure:true });

// From tools/server.js:
const prefixesStaticWithHtml = [
    '/export_3.3', '/test', '/test_case'
];

const blockedUrls = {
    'www.googletagservices.com/tag/js/gpt.js':
    Buffer.from('/* disabled */'),
    'd2wy8f7a9ursnm.cloudfront.net/bugsnag-3.min.js':
    Buffer.from('var Bugsnag = { enableNotifyUnhandledRejections: () => {} };')
};

const mimeType = (() => {
    const mimeType = {
        ".aac":   "audio/aac",
        ".avi":   "video/x-msvideo",
        ".bin":   "application/octet-stream",
        ".bz":    "application/x-bzip",
        ".bz2":   "application/x-bzip2",
        ".csh":   "application/x-csh",
        ".css":   "text/css",
        ".eot":   "application/vnd.ms-fontobject",
        ".gif":   "image/gif",
        ".html":  "text/html",
        ".ico":   "image/x-icon",
        ".jpeg":  "image/jpeg",
        ".jpg":   "image/jpeg",
        ".js":    "application/javascript",
        ".json":  "application/json",
        ".mpeg":  "video/mpeg",
        ".oga":   "audio/ogg",
        ".ogv":   "video/ogg",
        ".ogx":   "application/ogg",
        ".otf":   "font/otf",
        ".png":   "image/png",
        ".pdf":   "application/pdf",
        ".rar":   "application/x-rar-compressed",
        ".svg":   "image/svg+xml",
        ".ttf":   "font/ttf",
        ".vsd":   "application/vnd.visio",
        ".wav":   "audio/x-wav",
        ".weba":  "audio/webm",
        ".webm":  "video/webm",
        ".webp":  "image/webp",
        ".woff":  "font/woff",
        ".woff2": "font/woff2",
        ".xhtml": "application/xhtml+xml",
        ".xml":   "application/xml",
        ".zip":   "application/zip"
    };
    return (pathname) => {
        return mimeType[path.extname(pathname).toLowerCase()];
    }
})();

const startsWith = (url, prefixes) => {
    for (const prefix of prefixes) if (url.indexOf(prefix) === 0) return true;
    return false;
};

const serveLocalMirror = (reqUrl, callback) => {
    let pathname = reqUrl.pathname;
    if (pathname.endsWith('/')) pathname += 'index.html';
    let filePath = path.normalize(path.join(reqUrl.hostname, pathname));
    if (reqUrl.search) filePath += reqUrl.search;
    if (blockedUrls.hasOwnProperty(filePath)) {
        //console.log('Blocked:', filePath);
        callback({
            mimeType: mimeType(reqUrl.pathname), charset: 'UTF-8',
            data: blockedUrls[filePath]
        });
    } else {
        //console.log('Local mirror:', filePath);
        filePath = path.join(mirror, filePath);
        fs.access(filePath, fs.constants.R_OK, (err) => {
            if (err) {
                console.error(err);
                callback(404);
            } else {
                callback({
                    mimeType: mimeType(pathname), charset: 'UTF-8',
                    data:     fs.readFileSync(filePath)
                });
            }
        });
    }
};

const createWindow = () => {
    // Rewrite URLs to handle host-relative URLs, which begin with a slash.
    protocol.registerBufferProtocol(scheme, (req, callback) => {
        let reqUrl = url.parse(req.url);
        let pathname = reqUrl.pathname;
        if (pathname.endsWith('/')) pathname += 'index.html';
        if (reqUrl.hostname === hostname) {
            let filePath = path.normalize(pathname);
            if (startsWith(filePath, prefixesStaticWithHtml)) {
                filePath += '.html';
            }
            filePath = path.join(webroot, filePath);

            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err) {
                    console.error(err);
                    callback(404);
                } else {
                    callback({
                        mimeType: mimeType(pathname), charset: 'UTF-8',
                        data:     fs.readFileSync(filePath)
                    });
                }
            });
        } else {
            serveLocalMirror(reqUrl, callback);
        }
    }, (err) => {
        if (err) console.error('ERROR: failed to register protocol', scheme);
    });
    protocol.registerServiceWorkerSchemes([scheme]);

    // Create the browser window.
    // https://electron.atom.io/docs/api/browser-window/
    mainWindow = new BrowserWindow({
        width: 1024, height: 768, backgroundColor: '#203C64',
        center:true, fullscreen:false,
        title: app.getName(),
        webPreferences: {
            nodeIntegration:false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`${scheme}://${hostname}/`);

    // Open external URLs in the browser:
    mainWindow.webContents.on('will-navigate', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });

    // Open the DevTools.
    process.argv.some((arg) => {
        if (arg === '--dev') {
            mainWindow.webContents.openDevTools();
            return true;
        }
        return false;
    });

    // Implement window.prompt() and window.confirm() which are used by ZenGM:
    ipcMain.on('prompt', prompt);
    ipcMain.on('prompt-response', promptResponse);
    ipcMain.on('confirm', confirm);
    ipcMain.on('confirm-response', confirmResponse);

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// CC0 licensed code (Public Domain) from
// https://github.com/konsumer/electron-prompt
function prompt(eventRet, arg) {
    promptResponse = null;
    var promptWindow = new BrowserWindow({
        width: 300,
        height: 200,
        show: false,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        frame: false
    });
    arg.value = arg.value || '';
    const promptHtml = '<label for="val">' + arg.message + '</label>\
<input id="val" value="' + arg.value + '" autofocus />\
<button onclick="require(\'electron\').ipcRenderer.send(\'prompt-response\', document.getElementById(\'val\').value);window.close()">Ok</button>\
<button onclick="window.close()">Cancel</button>\
<style>body {background:#203C64; color:#ccf; font-family:sans-serif;} button {float:right; margin-left:10px;} label,input {margin-bottom:10px; width:100%; display:block;}</style>';
    promptWindow.loadURL('data:text/html,' + promptHtml);
    promptWindow.show();
    promptWindow.on('closed', function() {
        eventRet.returnValue = promptResponse;
        promptWindow = null;
    });
}
function promptResponse(event, arg)
{
    if (arg === '') arg = null;
    promptResponse = arg;
}

// Variant for window.confirm():
function confirm(eventRet, arg) {
    confirmResponse = null;
    var confirmWindow = new BrowserWindow({
        width: 300,
        height: 200,
        show: false,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        frame: false
    });
    const confirmHtml = '<label for="val">' + arg.message + '</label>\
<button onclick="require(\'electron\').ipcRenderer.send(\'confirm-response\', true);window.close()">Yes</button>\
<button onclick="require(\'electron\').ipcRenderer.send(\'confirm-response\', false);window.close()">No</button>\
<style>body {background:#203C64; color:#ccf; font-family:sans-serif;} button {float:right; margin-left: 10px;} label,input {margin-bottom: 10px; width: 100%; display:block;}</style>';
    confirmWindow.loadURL('data:text/html,' + confirmHtml);
    confirmWindow.show();
    confirmWindow.on('closed', function() {
        eventRet.returnValue = confirmResponse;
        confirmWindow = null;
    });
}
function confirmResponse(event, arg)
{
    if (arg === '') arg = null;
    confirmResponse = arg;
}
