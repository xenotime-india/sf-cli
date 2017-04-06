/**
 * Created by sandeepkumar on 16/01/17.
 */
module.exports = function(cli) {
  var help = new cli.help('User', cli);

  // login command
  help.add('login', function() {
    this.line('login'.verbose);
    this.line('Log in to your cli account.'.input);
    this.line('  options:'.input);
    this.line('    --username      The username to log in with.'.input);
    this.line('    --password      The password to use when logging in.'.input);
    this.line('    -sandbox    Log in to sandbox org.'.input);
  });

  cli.program
    .option('-u, --username [value]', 'The username to log in with.')
    .option('-P, --password [value]', 'The password to use when logging in.')
    .option('-sandbox', 'Log in to sandbox org.');

  cli.program
    .command('login')
    .description('Log into an account.')
    .on('--help', help.commands.login)
    .action(function() {
      cli.runCommand(cli.commands.user.login, {
        username: cli.program.username,
        password: cli.program.password,
      });
    });

  // logout command
  help.add('logout', function() {
    this.line('logout'.verbose);
    this.line('Log out of your current session.'.input);
  });

  cli.program
    .command('logout')
    .description('Log out of current account.')
    .on('--help', help.commands.logout)
    .action(function(){
      cli.runCommand(cli.commands.user.logout, true);
    });

  return {
    base : 'user',
    help : help
  };
};