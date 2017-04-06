var path       = require('path');

var colors     = require('./common/colors');
var userConfig = require('./common/api').userConfig;

var cli     = module.exports;
var pkg = require('../package.json');
cli.version = pkg.version;

cli.program = require('commander-plus');
cli.program.Settings.autoHelp = false;

cli.io = require('./common/io');

cli.printHeader = function () {
  cli.io.print('');
  cli.io.print('     http://help.xervo.io/customer/portal/articles/1701977'.verbose);
  cli.io.print('');
};

cli.commands         = {};
cli.commands.user    = require('./commands/user');
cli.commands.deployment    = require('./commands/deployment');
cli.commands.codeReview    = require('./commands/codeReview');

var done = function (err) {
  if (err) {
    cli.io.error(err);
    process.exit(1);
  } else {
    process.exit();
  }
};

cli.runCommand = function (command, options, authRequired) {
  //cli.io.print('Welcome to ' + 'sfdc cli'.magenta);

  var diff = require('update-notifier')({
    pkg: pkg
  }).update;

  if (diff) {
    cli.io.warning('Your version ' + diff.current.verbose + ' is behind the latest release ' + diff.latest.verbose + '.');
    cli.io.print('Please update using "npm update -g @sfdc-cli/cli"');
  }

  function go(conn) {
    var args = [options];
    if(conn) {
      args.push(conn);
    }
    args.push(done);
    command.apply(cli, args);
  }

  if (authRequired) {
    cli.commands.user.isAuthenticated(function (err, result) {
      if (!result.status) {
        cli.io.error('Need to be logged in to execute this command.');
        cli.io.print('Please log in with "cli login" command.');
        return done();
      } else {
        go(result.conn);
      }
    });
  } else {
    go();
  }
};

cli.program.version(cli.version);

//Include the help object
cli.help = require('./common/help');

// Include routes
cli.routes = [
  require('./routes/user')(cli),
  require('./routes/deployment')(cli),
  require('./routes/codeReview')(cli),
];

// The full help concats the route helps
cli.printHelp = function () {
  cli.printHeader();
  cli.io.print('     Usage: cli <command> <param1> <param2> ...');
  cli.io.print('     Help format:'.input);
  cli.io.print('     <command> (<alias>)'.input);
  cli.io.print('     <description>'.input);
  cli.io.print('');

  for (var r = 0; r < cli.routes.length; r++) {
    cli.routes[r].help.pad = 5;
    cli.routes[r].help.print();
  }
};

// Help commands
cli.program.on('noCommand', cli.printHelp);
cli.program
  .command('help')
  .description('Print help for all commands.')
  .on('--help', cli.printHelp)
  .action(cli.printHelp);

cli.program
  .command('*')
  .action(function () {
    cli.io.print('Command not found.');
  });

cli.program.parse(process.argv);