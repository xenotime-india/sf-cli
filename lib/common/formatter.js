var events = require('events');

var formatter =new events.EventEmitter();

module.exports = function(HTMLHint){
  formatter.on('start', function(){
    console.log('');
  });
  formatter.on('config', function(event){
    var configPath = event.configPath;
    console.log('   Config loaded: %s', nocolor ? configPath : configPath.cyan);
    console.log('');
  });
  formatter.on('file', function(event){
    console.log('   '+event.file.white);
    var arrLogs = HTMLHint.format(event.messages, {
      colors: true,
      indent: 6
    });
    arrLogs.forEach(function(str){
      console.log(str);
    });
    console.log('');
  });
  formatter.on('end', function(event){
    var allFileCount = event.allFileCount;
    var allHintCount = event.allHintCount;
    var allHintFileCount = event.allHintFileCount;
    var time = event.time;
    var message;
    if(allHintCount > 0){
      message = 'Scanned %d files, found %d errors in %d files (%d ms)';
      console.log(message.red, allFileCount, allHintCount, allHintFileCount, time);
    }
    else{
      message = 'Scanned %d files, no errors found (%d ms).';
      console.log(message.green, allFileCount, time);
    }
  });

  return formatter;
};
