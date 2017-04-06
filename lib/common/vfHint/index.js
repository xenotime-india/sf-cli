const vfHint = require('./vfHint');
require('./../reporter')(vfHint);

var normalizedPath = require("path").join(__dirname, "vf-rules");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./vf-rules/" + file)(vfHint);
});

module.exports = {
  vfHint
}