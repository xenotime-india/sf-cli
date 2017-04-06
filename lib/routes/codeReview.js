/**
 * Created by sandeepkumar on 16/01/17.
 */
const common = require('../util/common');

module.exports = function(cli) {

  var help = new cli.help('Code - Review', cli);

  // retrieve command
  help.add('review', function() {
    this.line('review'.verbose);
    this.line('Review source code.'.input);
    this.line('  options:'.input);
    this.line('    -t, --type [type]                VF/APEX.'.input);
    this.line('    -D, --directory [directory]      Local directory path of the package.'.input);
    this.line('    -l, --list                       Show all of the rules available.'.input);
    this.line('    -c, --config [file]              Custom configuration file.'.input);
    this.line('    -i, --ignore [pattern]           Add pattern to exclude matches.'.input);
    this.line('    --verbose                        Add pattern to exclude matches.'.input);
  });

  cli.program
    .option('-t, --type [type]', 'VF/APEX.')
    .option('-D, --directory [directory]', 'Local directory path of the package. ', common.parseList)
    .option('-l, --list', 'Show all of the rules available.')
    .option('-c, --config [config]', 'Custom configuration file.')
    .option('-i, --ignore [ignore]', 'Add pattern to exclude matches.')
    .option('--verbose', 'Output execution detail log')

  cli.program
    .command('review')
    .description('Review source code.')
    .on('--help', help.commands.review)
    .action(function() {
      cli.runCommand(cli.commands.codeReview.review, {
        type : cli.program.type,
        directory : cli.program.directory,
        list : cli.program.list,
        config : cli.program.config,
        ignore: cli.program.ignore,
        verbose:typeof cli.program.verbose === 'undefined' ? false : cli.program.verbose,
      }, false);
    });

  return {
    base : 'codeReview',
    help : help
  };
};