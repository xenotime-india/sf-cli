/**
 * Created by sandeepkumar on 16/01/17.
 */
const fs = require('fs');
const util = require('util');
const async = require('async');
const findFileSync = require('find-file-sync');

const checkStartScript = (meta, done) => {
  const fatalBlackList = ['forever', 'pm2', 'nodemon'];
  const matches = [];

  if (!meta.scripts || !meta.scripts.start) return done(null, matches);

  fatalBlackList.forEach(function (check) {
    if (meta.scripts.start.match(new RegExp(check, 'g'))) {
      matches.push({
        level: 'FATAL',
        message: util.format([
          'Your application is currently configured to run using %s,',
          'which is not supported on sfdc-cli. Please change your start script to simply start',
          'the application and we\'ll handle the rest.\n'
        ].join('\n'), check.red)
      });
    }
  });

  done(null, matches);
}

const checkDependencies = (meta, done) => {
  const matches = [];
  const dependencies = meta.dependencies;

  if (!meta.dependencies) return done(null, matches);

  Object.keys(dependencies).forEach(function (dep) {
    if (dependencies[dep] === '*') {
      matches.push({
        level: 'WARN',
        message: util.format([
          'The dependency %s is configured with the version %s, which may cause',
          'issues if the module is updated with breaking changes. You should change this to a',
          'more specific version.\n'
        ].join('\n'), dep.red, '"*"'.red)
      });
    }
  });

  done(null, matches);
}

module.exports = (packagePath, done) => {
  let metaPath;
  let meta;

  if (!packagePath) return done(null);

  metaPath = findFileSync(packagePath, 'package.json', ['.git', 'node_modules']);

  try {
    meta = JSON.parse(fs.readFileSync(metaPath), 'utf8');
  } catch (e) {
    return done(null);
  }

  async.series([
      (next) => {
        checkDependencies(meta, next);
      },
      (next) => {
        checkStartScript(meta, next);
      }
    ],
    (err, results) => {
      done(err, results[0].concat(results[1]));
    });
}