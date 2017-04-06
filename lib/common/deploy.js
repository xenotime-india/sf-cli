'use strict';

var path = require('path');
var jsforce = require('jsforce');
var archiver = require('archiver');
var Promise = jsforce.Promise;
const cli = require('../cli');

var DEPLOY_OPTIONS =
  "allowMissingFiles,autoUpdatePackage,checkOnly,ignoreWarnings,performRetrieve,purgeOnDelete,rollbackOnError,runAllTests,runTests,singlePackage,testLevel".split(',');

/**
 *
 */
function deployFromZipStream(zipStream, options, conn) {
  cli.io.print('Deploying to server...');
  conn.metadata.pollTimeout = options.pollTimeout || 60*1000; // timeout in 60 sec by default
  conn.metadata.pollInterval = options.pollInterval || 5*1000; // polling interval to 5 sec by default
  var deployOpts = {};
  DEPLOY_OPTIONS.forEach(function(prop) {
    if (typeof options[prop] !== 'undefined') { deployOpts[prop] = options[prop]; }
  });
  return conn.metadata.deploy(zipStream, deployOpts).complete({ details: true });
};

/**
 *
 */
function deployFromFileMapping(mapping, options, conn) {
  var archive = archiver('zip');
  archive.bulk(mapping);
  archive.finalize();
  return deployFromZipStream(archive, options, conn);
}

/**
 *
 */
function deployFromDirectory(packageDirectoryPath, options, conn) {
  return deployFromFileMapping({
    expand: true,
    cwd: path.join(packageDirectoryPath, '..'),
    src: [ path.basename(packageDirectoryPath) + '/**' ],
  }, options, conn);
}

/**
 *
 */
function checkDeployStatus(processId, options, conn) {
  return conn.metadata.checkDeployStatus(processId, { details: true });
}

/**
 *
 */
function reportDeployResult(res, verbose) {
  if(String(res.success) === 'true') {
    res.status === 'SucceededPartial' ? cli.io.success('Deploy Succeeded Patially.') : cli.io.success('Deploy Succeeded.');
  } else if(String(res.done) === 'true') {
    cli.io.error('Deploy Failed.');
  }
  else {
    cli.io.warning('Deploy Not Completed Yet.');
  }

  if (res.errorMessage) {
    cli.io.error(res.errorMessage);
  }
  console.log('');
  cli.io.info('Id: - ' + String(res.id).magenta);
  cli.io.info('Status: - ' + String(res.status).magenta);
  cli.io.info('Success: - ' + String(res.success).magenta);
  cli.io.info('Done: - ' + String(res.done).magenta);
  cli.io.info('Number Component Errors: - ' + String(res.numberComponentErrors).magenta);
  cli.io.info('Number Components Deployed: - ' + String(res.numberComponentsDeployed).magenta);
  cli.io.info('Number Components Total: - ' + String(res.numberComponentsTotal).magenta);
  cli.io.info('Number Test Errors: - ' + String(res.numberTestErrors).magenta);
  cli.io.info('Number Tests Completed: - ' + String(res.numberTestsCompleted).magenta);
  cli.io.info('Number Tests Total: - ' + String(res.numberTestsTotal).magenta);
  reportDeployResultDetails(res.details, verbose);
}

function reportDeployResultDetails(details, verbose) {
  if (details) {
    console.log('');
    if (verbose) {
      var successes = asArray(details.componentSuccesses);
      if (successes.length > 0) {
        cli.io.success('Successes:');
      }
      successes.forEach(function(s) {
        var flag =
          String(s.changed) === 'true' ? '(M)' :
          String(s.created) === 'true' ? '(A)' :
          String(s.deleted) === 'true' ? '(D)' :
          '(~)';
        cli.io.log(' - ' + flag + ' ' + s.fileName + (s.componentType ? ' ['+s.componentType.magenta+']' : ''));
      });
    }
    var failures = asArray(details.componentFailures);
    if (failures) {
      if (failures.length > 0) {
        cli.io.log('Failures:');
      }
      failures.forEach(function(f) {
        cli.io.log(
          ' - ' + f.problemType + ' on ' + f.fileName +
            (typeof f.lineNumber !== 'undefined' ?
             ' (' + f.lineNumber + ':' + f.columnNumber + ')' :
             '') +
          ' : ' + f.problem
        );
      });
    }
    var testResult = details.runTestResult;
    if (testResult && Number(testResult.numTestsRun) > 0) {
      console.log('');
      cli.io.log('Test Total Time: ' + Number(testResult.totalTime));
      console.log('');
      if (verbose) {
        var testSuccesses = asArray(testResult.successes) || [];
        if (testSuccesses.length > 0) {
          console.log('');
          cli.io.success('Test Successes:');
          console.log('');
        }
        testSuccesses.forEach(function(s) {
          cli.io.print('    - ' + ((s.namespace ? s.namespace + '__' : '') + s.name + '.' + s.methodName).green);
        });
      }
      var testFailures = asArray(testResult.failures) || [];
      if (testFailures.length > 0) {
        console.log('');
        cli.io.error('Test Failures:');
        console.log('');
      }
      testFailures.forEach(function(f) {
        cli.io.print('    - ' + ((typeof f.namespace === 'string' ? f.namespace + '__' : '') + f.name + '.' + f.methodName).error);
        cli.io.print('          ' + f.message);
        if (f.stackTrace) {
          f.stackTrace.split(/\n/).forEach(function(line) {
            cli.io.print('             at ' + line);
          });
        }
      });
      if (verbose) {
        var codeCoverages = asArray(testResult.codeCoverage) || [];
        if (codeCoverages.length > 0) {
          console.log('');
          console.log('Code Coverage:');
          console.log('');
        }
        codeCoverages.forEach(function(s) {
          var coverage = Math.floor(100 - 100 * (s.numLocationsNotCovered / s.numLocations));
          if (isNaN(coverage)) { coverage = 100; }
          cli.io.print(
            '    - ' +
              '[' +
                (coverage < 10 ? '  ' : coverage < 100 ? ' ' : '') + (coverage > 90 ? String(coverage).yellow : coverage >= 75 && coverage <= 90 ? String(coverage).yellow : String(coverage).error) +
              ' %] '.white +
            (coverage > 75 ? ((typeof s.namespace === 'string' ? s.namespace + '__' : '') + s.name).green : ((typeof s.namespace === 'string' ? s.namespace + '__' : '') + s.name).error)
          );
        });
      }
    }
  }
}

function asArray(arr) {
  if (!arr) { return []; }
  if (Object.prototype.toString.apply(arr) !== '[object Array]') { arr = [ arr ]; }
  return arr;
}

/**
 *
 */
module.exports = {
  deployFromZipStream: deployFromZipStream,
  deployFromFileMapping: deployFromFileMapping,
  deployFromDirectory: deployFromDirectory,
  checkDeployStatus: checkDeployStatus,
  reportDeployResult: reportDeployResult
};
