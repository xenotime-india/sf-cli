/**
 * Created by sandeepkumar on 16/01/17.
 */
var cli = require('../cli'),
  userConfig = require('../common/api').userConfig;
var path = require('path');
var fs = require('fs');
var VFHint = require('../common/vfHint').vfHint;
var ApexHint = require('../common/ApexHint').ApexHint;
var common = require('../util/common');
var vfFormatter = require('../common/formatter')(VFHint);
var apexFormatter = require('../common/formatter')(ApexHint);
var async = require('async');
var parseGlob = require('parse-glob');
var glob = require("glob");

var codeReview = {};

codeReview.review = function(options, cb) {

  if (!options.directory) {
    return cb('Please set --directory option to specify the source of retrieved metadata package.');
  }

  if (!options.type) {
    return cb('Please set --type option to specify the review type (VF/APEX).');
  }

  if(options.type.toLowerCase() === 'vf') {
    hintTargets(vfFormatter, VFHint, options);
  }
  else {
    hintTargets(apexFormatter, ApexHint, options);
  }
};

function hintTargets(formatter, Hint, options) {
  var arrAllMessages = [];
  var allFileCount = 0;
  var allHintFileCount = 0;
  var allHintCount = 0;
  var startTime = new Date().getTime();

  // start hint
  formatter.emit('start');

  var arrTasks = [];
  options.directory.forEach(function(target){
    arrTasks.push(function(next){
      hintAllFiles(formatter, Hint, target, options, function(result){
        allFileCount += result.targetFileCount;
        allHintFileCount += result.targetHintFileCount;
        allHintCount += result.targetHintCount;
        arrAllMessages = arrAllMessages.concat(result.arrTargetMessages);
        next();
      });
    });
  });
  async.series(arrTasks, function(){
    // end hint
    var spendTime = new Date().getTime() - startTime;
    formatter.emit('end', {
      arrAllMessages: arrAllMessages,
      allFileCount: allFileCount,
      allHintFileCount: allHintFileCount,
      allHintCount: allHintCount,
      time: spendTime
    });
    process.exit(allHintCount > 0 ? 1: 0);
  });
};

function hintAllFiles(formatter, Hint, target, options, onFinised){
  var globInfo = getGlobInfo(target, options);
  globInfo.ignore = options.ignore;

  // hint result
  var targetFileCount = 0;
  var targetHintFileCount = 0;
  var targetHintCount = 0;
  var arrTargetMessages = [];

  // init ruleset
  const ruleset = getConfig(options.config, globInfo.base, formatter);

  // hint queue
  var hintQueue = async.queue(function (filepath, next) {
    var startTime = new Date().getTime();
    if(filepath === 'stdin'){
      hintStdin(Hint, ruleset, hintNext);
    }
    else if(/^https?:\/\//.test(filepath)){
      hintUrl(Hint, filepath, ruleset, hintNext);
    }
    else{
      var messages = hintFile(Hint, filepath, ruleset);
      hintNext(messages);
    }
    function hintNext(messages){
      var spendTime = new Date().getTime() - startTime;
      var hintCount = messages.length;
      if(hintCount > 0){
        formatter.emit('file', {
          'file': filepath,
          'messages': messages,
          'time': spendTime
        });
        arrTargetMessages.push({
          'file': filepath,
          'messages': messages,
          'time': spendTime
        });
        targetHintFileCount ++;
        targetHintCount += hintCount;
      }
      targetFileCount ++;
      setImmediate(next);
    }
  }, 10);
  // start hint
  var isWalkDone = false;
  var isHintDone = true;
  hintQueue.drain = function() {
    isHintDone = true;
    checkAllHinted();
  };
  function checkAllHinted(){
    if(isWalkDone && isHintDone){
      onFinised({
        targetFileCount: targetFileCount,
        targetHintFileCount: targetHintFileCount,
        targetHintCount: targetHintCount,
        arrTargetMessages: arrTargetMessages
      });
    }
  }
  if(target === 'stdin'){
    isWalkDone = true;
    hintQueue.push(target);
  }
  else if(/^https?:\/\//.test(target)){
    isWalkDone = true;
    hintQueue.push(target);
  }
  else{
    walkPath(globInfo, function(filepath){
      isHintDone = false;
      hintQueue.push(filepath);
    }, function(){
      isWalkDone = true;
      checkAllHinted();
    });
  }
};

// split target to base & glob
function getGlobInfo(target, options){
  // fix windows sep
  target = target.replace(/\\/g, '/');
  var globInfo = parseGlob(target);
  var base = globInfo.base;
  base += /\/$/.test(base) ? '' : '/';
  var pattern = globInfo.glob;
  var globPath = globInfo.path;
  var defaultGlob = options.type == 'VF' ? '*.page' : '*.cls';
  if(globInfo.is.glob === true){
    // no basename
    if(globPath.basename === ''){
      pattern += defaultGlob;
    }
  }
  else{
    // no basename
    if(globPath.basename === ''){
      pattern += '**/' + defaultGlob;
    }
    // detect directory
    else if(fs.existsSync(target) && fs.statSync(target).isDirectory()){
      base += globPath.basename + '/';
      pattern = '**/' + defaultGlob;
    }
  }
  return {
    base: base,
    pattern: pattern
  };
}
function walkPath(globInfo, callback, onFinish) {
  var base = globInfo.base;
  var pattern = globInfo.pattern;
  var ignore = globInfo.ignore;
  var arrIgnores = ['**/node_modules/**'];
  if(ignore){
    ignore.split(',').forEach(function(pattern){
      arrIgnores.push(pattern);
    });
  }
  var walk = glob(pattern, {
    'cwd': base,
    'dot': false,
    'ignore': arrIgnores,
    'nodir': true,
    'strict': false,
    'silent': true
  },function() {
    onFinish();
  });
  walk.on('match', function(file){
    base = base.replace(/^.\//, '');
    callback(base + file);
  });
}

// hint file
function hintFile(Hint, filepath, ruleset){
  var content = '';
  try{
    content = fs.readFileSync(filepath, 'utf-8');
  }
  catch(e){}
  return Hint.verify(content, ruleset);
}

// hint stdin
function hintStdin(Hint, ruleset, callback){
  process.stdin.setEncoding('utf8');
  var buffers = [];
  process.stdin.on('data', function(text){
    buffers.push(text);
  });

  process.stdin.on('end', function(){
    var content = buffers.join('');
    var messages = Hint.verify(content, ruleset);
    callback(messages);
  });
}

// hint url
function hintUrl(Hint, url, ruleset, callback){
  request.get(url, function(error, response, body){
    if(!error && response.statusCode == 200){
      var messages = Hint.verify(body, ruleset);
      callback(messages);
    }
    else{
      callback([]);
    }
  });
}

// search and load config
function getConfig(configPath, base, formatter){
  if(configPath === undefined && fs.existsSync(base)){
    // find default config file in parent directory
    if(fs.statSync(base).isDirectory() === false){
      base = path.dirname(base);
    }
    while(base){
      var tmpConfigFile = path.resolve(base+path.sep, '.VFHintrc');
      if(fs.existsSync(tmpConfigFile)){
        configPath = tmpConfigFile;
        break;
      }
      base = base.substring(0,base.lastIndexOf(path.sep));
    }
  }

  if(fs.existsSync(configPath)){
    var config = fs.readFileSync(configPath, 'utf-8'),
      ruleset;
    try{
      ruleset = JSON.parse(stripJsonComments(config));
      formatter.emit('config', {
        ruleset: ruleset,
        configPath: configPath
      });
    }
    catch(e){}
    return ruleset;
  }
}

module.exports = codeReview;