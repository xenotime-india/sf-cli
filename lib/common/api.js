/**
 * Created by sandeepkumar on 16/01/17.
 */
var UserConfig = require('./userConfig'),
  url = require('url'),
  userConfig = new UserConfig();

userConfig.load();

if (userConfig.data && userConfig.data.api_uri) {
  var url = url.parse(userConfig.data.api_uri);

}

module.exports = {
  userConfig : new UserConfig()
};