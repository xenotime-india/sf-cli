const fs = require('fs');
const fstream = require('fstream');
const path = require('path');
const stream = require('readable-stream');
const jsforce = require('jsforce');
const archiver = require('archiver');
const unzip = require('unzip');
const xml2js = require('xml2js');
const cli = require('../cli');


const Promise = jsforce.Promise;

const RETRIEVE_OPTIONS =
  "apiVersion,packageNames,singlePackage,specificFiles,unpackaged".split(',');

/**
 *
 */
function retrieve(options, conn) {
  conn.metadata.pollTimeout = options.pollTimeout || 60*1000; // timeout in 60 sec by default
  conn.metadata.pollInterval = options.pollInterval || 5*1000; // polling interval to 5 sec by default
  var req = {};
  RETRIEVE_OPTIONS.forEach(function(prop) {
    if (typeof options[prop] !== 'undefined') { req[prop] = options[prop]; }
  });
  if (!req.apiVersion) {
    req.apiVersion = conn.version;
  }
  return conn.metadata.retrieve(req).complete({ details: true });
};

/**
 *
 */
function retrieveByTypes(typeList, options, conn) {
  var types = typeList.filter(function(p) { return p; })
    .map(function(p) {
      var pair = p.split(/\s*:\s*/);
      var name = pair[0];
      var members = pair[1] ? pair[1].split(/\s*,\s*/) : ['*'];
      return { name: name, members: members };
    })
  options.unpackaged = { types: types };
  return retrieve(options, conn);
}

/**
 *
 */
function retrieveByPackageNames(packageNames, options, conn) {
  options.packageNames = packageNames;
  return retrieve(options, conn);
}

/**
 *
 */
function retrieveByPackageXML(xmlFilePath, options, conn) {
  return new Promise(function(resolve, reject) {
    fs.readFile(xmlFilePath, 'utf-8', function(err, data) {
      if (err) { reject(err); } else { resolve(data); }
    });
  }).then(function(data) {
    return new Promise(function(resolve, reject) {
      xml2js.parseString(data, { explicitArray: false }, function(err, dom) {
        if (err) { reject(err); } else { resolve(dom); }
      });
    });
  }).then(function(dom) {
    delete dom.Package.$;
    options.unpackaged = dom.Package;
    return retrieve(options, conn);
  });
}


/**
 *
 */
function checkRetrieveStatus(processId, options, conn) {
  return connect(options).then(function(conn) {
    cli.io.print('Retrieving previous request result from server...');
    return conn.metadata.checkRetrieveStatus(processId, { details: true }, conn);
  });
}

/**
 *
 */
function reportRetrieveResult(res, verbose) {
  if(String(res.success) === 'true') {
    cli.io.success('Retrieve Succeeded.');
  } else if(String(res.done) === 'true') {
    cli.io.error('Retrieve Failed.');
  }
  else {
    cli.io.warning('Retrieve Not Completed Yet.');
  }

  if (res.errorMessage) {
    cli.io.error(res.errorMessage);
  }
  if (verbose) {
    reportRetreiveFileProperties(res.fileProperties);
  }
}

function asArray(arr) {
  if (!arr) { return []; }
  if (Object.prototype.toString.apply(arr) !== '[object Array]') { arr = [ arr ]; }
  return arr;
}

function reportRetreiveFileProperties(fileProperties) {
  fileProperties = asArray(fileProperties);
  if (fileProperties.length > 0) {
    console.log('');
    cli.io.print('Files:');
    fileProperties.forEach(function(f) {
      cli.io.log(' - [retreiving]' + f.fileName + (f.type ? ' ['+f.type.magenta+']' : ''));
    });
  }
}

/**
 *
 */
function extractZipContents(zipFileContent, dirMapping, verbose) {
  cli.io.print('');
  return new Promise(function(resolve, reject) {
    var waits = [];
    var zipStream = new stream.PassThrough();
    zipStream.end(new Buffer(zipFileContent, 'base64'));
    zipStream
      .pipe(unzip.Parse())
      .on('entry', function(entry) {
        var filePaths = entry.path.split('/');
        var packageName = filePaths[0];
        var directory = dirMapping[packageName] || dirMapping['*'];
        if (directory) {
          var restPath = filePaths.slice(1).join('/');
          var realPath = path.join(directory, restPath);
          waits.push(new Promise(function(rsv, rej) {
            if(verbose) {
              cli.io.log(' - [extracting] ' + realPath);
            }
            entry.pipe(
                fstream.Writer({
                  type: entry.type,
                  path: realPath
                })
              )
              .on('finish', rsv)
              .on('error', rej);
          }));
        } else {
          entry.autodrain();
        }
      })
      .on('finish', function() {
        setTimeout(function() {
          Promise.all(waits).then(resolve, reject);
        }, 1000);
      })
      .on('error', reject);
  });
}


/**
 *
 */
module.exports = {
  retrieve: retrieve,
  retrieveByTypes: retrieveByTypes,
  retrieveByPackageNames: retrieveByPackageNames,
  retrieveByPackageXML: retrieveByPackageXML,
  checkRetrieveStatus: checkRetrieveStatus,
  reportRetrieveResult: reportRetrieveResult,
  extractZipContents: extractZipContents
};
