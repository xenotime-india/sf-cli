var apexparser = require('./apexparser');
const ApexHint = {};

ApexHint.rules = {};

ApexHint.defaultRuleset = {
  'end-blank': true,
};

ApexHint.addRule = function (rule) {
  ApexHint.rules[rule.id] = rule;
};

ApexHint.verify = function (code, ruleset) {

  if (ruleset === undefined || Object.keys(ruleset).length === 0) {
    ruleset = ApexHint.defaultRuleset;
  }

  var parser = new apexparser();
  var reporter = new ApexHint.Reporter(code, ruleset);

  var rules = ApexHint.rules,
    rule;
  for (var id in ruleset) {
    rule = rules[id];
    if (rule !== undefined && ruleset[id] !== false) {
      rule.init(parser, reporter, ruleset[id]);
    }
  }

  parser.parse(code);

  return reporter.messages;
};
// format messages
ApexHint.format = function (arrMessages, options) {
  options = options || {};
  var arrLogs = [];
  var colors = {
    white: '',
    grey: '',
    red: '',
    reset: ''
  };
  if (options.colors) {
    colors.white = '\033[37m';
    colors.grey = '\033[90m';
    colors.red = '\033[31m';
    colors.reset = '\033[39m';
  }
  var indent = options.indent || 0;
  arrMessages.forEach(function (hint) {
    var leftWindow = 40;
    var rightWindow = leftWindow + 20;
    var evidence = hint.evidence;
    var line = hint.line;
    var col = hint.col;
    var evidenceCount = evidence.length;
    var leftCol = col > leftWindow + 1 ? col - leftWindow : 1;
    var rightCol = evidence.length > col + rightWindow ? col + rightWindow : evidenceCount;
    if (col < leftWindow + 1) {
      rightCol += leftWindow - col + 1;
    }
    evidence = evidence.replace(/\t/g, ' ').substring(leftCol - 1, rightCol);
    // add ...
    if (leftCol > 1) {
      evidence = '...' + evidence;
      leftCol -= 3;
    }
    if (rightCol < evidenceCount) {
      evidence += '...';
    }
    // show evidence
    arrLogs.push(colors.white + repeatStr(indent) + 'L' + line + ' |' + colors.grey + evidence + colors.reset);
    // show pointer & message
    var pointCol = col - leftCol;
    // add double byte character
    var match = evidence.substring(0, pointCol).match(/[^\u0000-\u00ff]/g);
    if (match !== null) {
      pointCol += match.length;
    }
    arrLogs.push(colors.white + repeatStr(indent) + repeatStr(String(line).length + 3 + pointCol) + '^ ' + colors.red + hint.message + ' (' + hint.rule.id + ')' + colors.reset);
  });
  return arrLogs;
};

// repeat string
function repeatStr(n, str) {
  return new Array(n + 1).join(str || ' ');
};

module.exports = ApexHint;
