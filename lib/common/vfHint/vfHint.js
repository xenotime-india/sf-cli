var vfparser = require('./vfparser');

const VFHint = {};

VFHint.version = '@VERSION';
VFHint.release = '@RELEASE';

VFHint.rules = {};

VFHint.defaultRuleset = {
  'tagname-lowercase': true,
  'attr-lowercase': true,
  'attr-value-double-quotes': true,
  'doctype-first': true,
  'tag-pair': true,
  'spec-char-escape': true,
  'id-unique': true,
  'src-not-empty': true,
  'attr-no-duplication': true,
  'title-require': true
};

VFHint.addRule = function (rule) {
  VFHint.rules[rule.id] = rule;
};

VFHint.verify = function (html, ruleset) {

  if (ruleset === undefined || Object.keys(ruleset).length === 0) {
    ruleset = VFHint.defaultRuleset;
  }

  var parser = new vfparser();
  var reporter = new VFHint.Reporter(html, ruleset);

  var rules = VFHint.rules,
    rule;
  for (var id in ruleset) {
    rule = rules[id];
    if (rule !== undefined && ruleset[id] !== false) {
      rule.init(parser, reporter, ruleset[id]);
    }
  }

  parser.parse(html);

  return reporter.messages;
};

// format messages
VFHint.format = function (arrMessages, options) {
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

module.exports = VFHint;
