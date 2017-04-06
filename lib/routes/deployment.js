/**
 * Created by sandeepkumar on 16/01/17.
 */
const common = require('../util/common');

module.exports = function(cli) {

  var help = new cli.help('deployment', cli);

  // retrieve command
  help.add('retrieve', function() {
    this.line('retrieve'.verbose);
    this.line('Retrieve resource from org.'.input);
    this.line('  options:'.input);
    this.line('    -D, --directory [directory]          Directory path to extract the retrieved metadata files. Should be a list (comma-separated) if there are multiple entries in packageNames'.input);
    this.line('    -Z, --zipFile [zipFile]              Output file path of ZIP archive of retrieved metadata.'.input);
    this.line('    -P, --packageXML [packageXML]        A package.xml file path to specify the retrieving metadata contents.'.input);
    this.line('    --pid [pid]                          Process ID of previous retrieve request.'.input);
    this.line('    --apiVersion [apiVersion]            API version of retrieving package.'.input);
    this.line('    -P, --packageNames [packageNames]    List of package names to retrieve (comma separated).'.input);
    this.line('    -M, --memberTypes [memberTypes]      Metadata types and its members. The format is like following: "[ApexClass:Class1,Class2],[ApexPage:Page1,Page2],[ApexTrigger:*]"'.input);
    this.line('    --pollTimeout [pollTimeout]          Polling timeout in millisec (default is 60000ms).'.input);
    this.line('    --pollInterval [pollInterval]        Polling interval in millisec (default is 5000ms).'.input);
    this.line('    -V, --verbose                        Output execution detail log.'.input);
  });

  cli.program
    .option('-D, --directory [directory]',
    'Directory path to extract the retrieved metadata files. ' +
    'Should be a list (comma-separated) if there are multiple entries in packageNames', common.parseList)
    .option('-Z, --zipFile [zipFile]', 'Output file path of ZIP archive of retrieved metadata')
    .option('-P, --packageXML [packageXML]', 'A package.xml file path to specify the retrieving metadata contents')
    .option('--pid [pid]', 'Process ID of previous retrieve request')
    .option('--apiVersion [apiVersion]', 'API version of retrieving package')
    .option('-P, --packageNames [packageNames]', 'List of package names to retrieve (comma separated)', common.parseList)
    .option('-M, --memberTypes [memberTypes]', 'Metadata types and its members. The format is like following: "[ApexClass:Class1,Class2],[ApexPage:Page1,Page2],[ApexTrigger:*]"', common.parseSList)
    .option('--pollTimeout [pollTimeout]', 'Polling timeout in millisec (default is 60000ms)', parseInt)
    .option('--pollInterval [pollInterval]', 'Polling interval in millisec (default is 5000ms)', parseInt)
    .option('-V, --verbose', 'Output execution detail log')

  cli.program
    .command('retrieve')
    .description('retrieve resource from org.')
    .on('--help', help.commands.retrieve)
    .action(function() {
      cli.runCommand(cli.commands.deployment.retrieve, {
        directory : cli.program.directory,
        zipFile : cli.program.zipFile,
        packageXML: cli.program.packageXML,
        pid: cli.program.pid,
        apiVersion: cli.program.apiVersion,
        packageNames: cli.program.packageNames,
        memberTypes: cli.program.memberTypes,
        pollTimeout: cli.program.pollTimeout,
        pollInterval:cli.program.pollInterval,
        verbose:typeof cli.program.verbose === 'undefined' ? false : cli.program.verbose,
    }, true);
    });

  // deploy command
  help.add('deploy', function() {
    this.line('deploy'.verbose);
    this.line('Deploy resource to org.'.input);
    this.line('  options:'.input);
    this.line('    -U, --username [username]             Target org user name.'.input);
    this.line('    -P, --password [password]             Target org password.'.input);
    this.line('    -D, --directory [directory]           Local directory path of the package to deploy.'.input);
    this.line('    -Z, --zipFile [zipFile]               Input file path of ZIP archive of metadata files to deploy.'.input);
    this.line('    --pid [pid]                           Process ID of previous deployment to check status.'.input);
    this.line('    --dryRun                             Dry run. Same as --checkOnly.'.input);
    this.line('    --testLevel [testLevel]               Specifies which tests are run as part of a deployment (NoTestRun/RunSpecifiedTests/RunLocalTests/RunAllTestsInOrg).'.input);
    this.line('    --runTests [runTests]                 A list of Apex tests to run during deployment (commma separated).'.input);
    this.line('    --ignoreWarnings                      Indicates whether a warning should allow a deployment to complete successfully (true) or not (false).'.input);
    this.line('    --rollbackOnError                     Indicates whether any failure causes a complete rollback (true) or not (false).'.input);
    this.line('    --pollTimeout [pollTimeout]           Polling timeout in millisec (default is 60000ms).'.input);
    this.line('    --pollInterval [pollInterval]         Polling interval in millisec (default is 5000ms).'.input);
    this.line('    --verbose                        Output execution detail log.'.input);
  });

  cli.program
    .option('-U, --username [username]', 'Target org user name')
    .option('-P, --password [password]', 'Target org password')
    .option('-D, --directory [directory]', 'Local directory path of the package to deploy')
    .option('-Z, --zipFile [zipFile]', 'Input file path of ZIP archive of metadata files to deploy')
    .option('--pid [pid]', 'Process ID of previous deployment to check status')
    .option('--dryRun', 'Dry run. Same as --checkOnly')
    .option('--testLevel [testLevel]', 'Specifies which tests are run as part of a deployment (NoTestRun/RunSpecifiedTests/RunLocalTests/RunAllTestsInOrg)')
    .option('--runTests [runTests]', 'A list of Apex tests to run during deployment (commma separated)', common.parseList)
    .option('--ignoreWarnings', 'Indicates whether a warning should allow a deployment to complete successfully (true) or not (false).')
    .option('--rollbackOnError', 'Indicates whether any failure causes a complete rollback (true) or not (false)')
    .option('--pollTimeout [pollTimeout]', 'Polling timeout in millisec (default is 60000ms)', parseInt)
    .option('--pollInterval [pollInterval]', 'Polling interval in millisec (default is 5000ms)', parseInt)
    .option('--verbose', 'Output execution detail log')

  cli.program
    .command('deploy')
    .description('deploy resource to org.')
    .on('--help', help.commands.deploy)
    .action(function() {
      cli.runCommand(cli.commands.deployment.deploy, {
        username : cli.program.username,
        password : cli.program.password,
        directory : cli.program.directory,
        zipFile : cli.program.zipFile,
        pid: cli.program.pid,
        dryRun: typeof cli.program.dryRun === 'undefined' ? false : cli.program.dryRun,
        testLevel: cli.program.testLevel,
        runTests: cli.program.runTests,
        ignoreWarnings: typeof cli.program.ignoreWarnings === 'undefined' ? false : cli.program.ignoreWarnings,
        rollbackOnError: typeof cli.program.rollbackOnError === 'undefined' ? true : cli.program.rollbackOnError,
        pollTimeout: cli.program.pollTimeout,
        pollInterval:cli.program.pollInterval,
        verbose:typeof cli.program.verbose === 'undefined' ? false : cli.program.verbose,
      });
    });

  return {
    base : 'deployment',
    help : help
  };
};