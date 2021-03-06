'use strict';
const debug = require('debug')('brunch:common');
const copyFile = require('quickly-copy-file');
const fs = require('fs');
const mkdirp = require('mkdirp');
const sysPath = require('path');

/* Writes data into a file.
 * Creates the file and/or all parent directories if they don't exist.
 *
 * path - String. Path to the file.
 * data - String. Data to be written.
 * callback(error, path, data) - Executed on error or on
 *    successful write.
 *
 * Example
 *
 *   writeFile 'test.txt', 'data', (error) -> console.log error if error?
 *
 * Returns nothing.
 */

exports.writeFile = (path, data, callback) => {
  debug(`Writing file '${path}'`);
  const write = callback => fs.writeFile(path, data, callback);
  write(error => {
    if (error == null) return callback(null, path, data);
    mkdirp(sysPath.dirname(path), 0x1ed, error => {
      if (error != null) return callback(error);
      write(error => callback(error, path, data));
    });
  });
};


/* RegExp that filters out invalid files (dotfiles, emacs caches etc). */

const re1 = /\.(?!htaccess|rewrite)/;
const re2 = /(^[.#]|(?:__|~)$)/;
const re3 = /^\.(git|hg)$/;
const ignored = exports.ignored = path => {
  const base = sysPath.basename(path);
  return re1.test(base) && re2.test(base);
};

exports.ignoredAlways = path => re3.test(sysPath.basename(path));

exports.copy = (source, destination, callback) => {
  if (ignored(source)) return callback();
  copyFile(source, destination, callback);
};
