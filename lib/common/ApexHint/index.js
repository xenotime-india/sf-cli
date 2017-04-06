/**
 * Created by sandeepkumar on 19/01/17.
 */
const ApexHint = require('./apexHint');
require('./../reporter')(ApexHint);

var normalizedPath = require("path").join(__dirname, "apex-rules");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./apex-rules/" + file)(ApexHint);
});

module.exports = {
  ApexHint
}