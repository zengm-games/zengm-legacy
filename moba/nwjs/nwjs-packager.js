#!/usr/bin/env node
// Author: Alberto González Palomo https://sentido-labs.com
// ©2018 Alberto González Palomo https://sentido-labs.com

const configurationFile = './installers.json';
const options = require(configurationFile);

// node_modules/.bin/electron-installer-debian --src mobagm-linux64 --dest installers --arch amd64 --config config-electron-installer-debian.json

// To add a new packager here, install it first with, for instance,
// npm install --save electron-installer-debian
// There is a list of packagers at:
// https://github.com/electron-userland/electron-packager#related
let packagers = {
    "debian":  "electron-installer-debian",
    "redhat":  "electron-installer-redhat",
    "flatpak": "electron-installer-flatpak",
    "snap":    "electron-installer-snap",

    //"dmg": "electron-installer-dmg",
    "dmg": "./dmg-with-genisoimg",

    "squirrel": "electron-winstaller",
    "appx":     "electron-windows-store",
    "msi":      "electron-wix-msi"
};
function buildPackage(packager, options, callback)
{
    if (packager.startsWith('electron-installer-') ||
        packager.startsWith('./')) {
        require(packager)(options, callback);
    } else if (packager === 'electron-winstaller') {
        options = {
            appDirectory: options.src,
            outputDirectory: options.dest,
            setupIcon: options.icon
        };
        console.log(packager, options);
        require(packager).createWindowsInstaller(options);
        // TODO: other properties.
        // https://github.com/electron/windows-installer#usage
        callback();
    } else if (packager === 'electron-wix-msi') {
        console.error('Not implemented yet');
        process.exit(33);
    } else {
        console.error('Not implemented yet');
        process.exit(33);
    }
}

function error(message)
{
    console.error(message);
    console.error('Configuration file:', configurationFile);
}

if (!options.formats) {
    error('Error: the list of formats is either missing or empty.');
    process.exit(1);
}

options.installers.forEach((installer) => {
    console.log('Package:', installer.format, installer.src, installer.arch);
    if (!options.formats[installer.format]) {
        error('Unknown format "' + installer.format + '".');
        process.exit(2);
    }
    if (!packagers[installer.format]) {
        error(`No packager for "${installer.format}" in nwjs-packager.js`);
        process.exit(3);
    }
    let packagerOptions = {
        src: `mobagm-${installer.src}-${installer.arch}`,
        dest: options.dest,
        arch: installer.arch
    };
    let formatOptions = options.formats[installer.format];
    // If we replace the "if" with "while" we'd have transitive closure
    // but that would make it harder to debug for users so don't do that.
    if ('string' === typeof formatOptions) {
        formatOptions = options.formats[formatOptions];
    }
    Object.keys(formatOptions).forEach((key) => {
        if (packagerOptions.hasOwnProperty(key)) {
            error(`Redefined internal option "${key}".`);
            process.exit(10);
        }
        packagerOptions[key] = formatOptions[key];
    });
    console.log(packagers[installer.format], packagerOptions);
    buildPackage(packagers[installer.format], packagerOptions, err => {
        if (err) {
            console.error(err, err.stack);
            process.exit(20);
        }
        console.log(`Successfully created ${installer.format}-${installer.arch} package at ${packagerOptions.dest}`);
    });
});
