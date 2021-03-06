'use strict';

var gaze = require('gaze');
var path = require('path');
var log = require('../logger')('nodecg/lib/bundles/watcher');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

require('string.prototype.endswith');

// Patterns for gaze to watch or ignore
var watchPatterns = [
    'bundles/**',         // Watch bundles folder
    '!**/*___jb_*___',    // Ignore temp files created by JetBrains IDEs
    '!bundles/*/view/**', // Ignore view folders. Might watch them in a later NodeCG version, but not now.
    '!**/node_modules/**' // Ignore node_modules folders
];

gaze(watchPatterns, function(err) {
    if (err) {
        log.error(err.stack, 'Couldn\'t start watcher, NodeCG will exit.');
        process.exit(1);
    }

    // On changed/added/deleted
    this.on('all', function(event, filepath) {
        //extract the bundle name from the filepath
        var bundleName = '';
        var res = filepath.split(path.sep);
        var prevPart = '';

        //walk up the path in reverse, once we find "bundles" we know the previous dir was the bundle
        res.reverse().forEach(function(part) {
            if(part === 'bundles') {
                bundleName = prevPart;
            }
            prevPart = part;
        });

        log.debug('Change detected in', bundleName, ': ', filepath, event);
        emitter.emit('bundleChanged', bundleName);
    });

    this.on('error', function(error) {
        log.error('Gaze error:', error.stack);
    });
});

exports = module.exports = emitter;
