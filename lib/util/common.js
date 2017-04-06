/**
 * Created by sandeepkumar on 17/01/17.
 */
var common = {};

common.readOptions = (param, program) => {
  var options = readOptions(program);
  param.split(',').forEach(function(prop) {
    if (typeof program[prop] !== 'undefined') { options[prop] = program[prop]; }
  });
  if (program.dryRun) {
    options.checkOnly = true;
  }
  return options;
};

common.parseList = (a) => {
  return a.split(/\s*,\s*/);
}

common.parseSList = (a) => {
  return common.parseList(a).map((i) => {
    return i.replace(/[\[\]']+/g,'').trim();
  });
}

module.exports = common;