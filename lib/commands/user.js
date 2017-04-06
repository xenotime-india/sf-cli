/**
 * Created by sandeepkumar on 16/01/17.
 */
var cli = require('../cli'),
  userConfig = require('../common/api').userConfig,
  util = require('util'),
  jsforce = require('jsforce');

var user = {};

user.authenticate = function(username, password, env, cb) {
  var conn = new jsforce.Connection({
    loginUrl : 'https://login.salesforce.com'
  });
  conn.login(username, password, function(err, userInfo) {
    if (err) {
      return cb(err.message);
    }

    userConfig.load();
    var udata = null;

    if (userConfig.data) {
      // Don't overwrite existing data.
      udata = util._extend(userConfig.data, {
        username: username,
        password: password,
        userId : userInfo.id,
        accessToken : conn.accessToken,
        instanceUrl: conn.instanceUrl,
      });
    } else {
      udata = {
        username: username,
        password: password,
        userId : userInfo.id,
        accessToken : conn.accessToken,
        instanceUrl: conn.instanceUrl,
      };
    }

    userConfig.save(udata);
    cli.io.success('Signed in as user ' + username);
    return cb(null, conn);
  });
};

user.isAuthenticated = function(callback) {
  userConfig.load();
  if(userConfig.data && userConfig.data.userId) {

    var conn = new jsforce.Connection({
      instanceUrl : userConfig.data.instanceUrl,
      accessToken : userConfig.data.accessToken,
    });
    conn.identity(function(err, res) {
      if (err) {
        user.authenticate.call(user, userConfig.data.username, userConfig.data.password, null , function (err, conn) {
          if(!err) {
            callback(null, {status:true,conn});
          }
        });
      } else {
        cli.io.print('You are logged in as ' + res.display_name);
        callback(null, {status:true,conn});
      }
    });
  }
};

user.login = function(options, cb) {
  var login = options.username,
    pass = options.password,
    prompt = [];

  if(typeof login !== 'string' || login.length < 1) {
    prompt.push({
      name: 'login',
      description: 'Enter your username or email:',
      required: true
    });

    login = undefined;
  }

  if(typeof pass !== 'string' || pass.length < 1) {
    prompt.push({
      name: 'password',
      description: 'Enter your password:',
      hidden: true,
      required: true
    });

    pass = undefined;
  }

  if(prompt.length > 0) {
    cli.io.prompt.get(prompt, function (err, result) {
      if(err) {
        return error.handlePromptError(err, cb);
      }
      user.authenticate.call(user, login || result.login, pass || result.password, null, cb);
    });
  }
  else {
    user.authenticate.call(user, login, options.password, null , cb);
  }
};

user.logout = function(cb) {
  userConfig.clearSession();
  cli.io.success('You have signed out of ' + ''.data);
  return cb();
};

module.exports = user;