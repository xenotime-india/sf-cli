/**
 * Created by sandeepkumar on 16/01/17.
 */
const prompt = require('prompt');

prompt.start();
prompt.message = '[' + '?'.yellow + '] ';
prompt.delimiter = '';

const io = {};

io.print = (text) => {
  console.log(text.white);
};

io.write = (text) => {
  process.stdout.write(text);
};

io.log = (text) => {
  io.print('      [' + 'log'.verbose + ']'.white + ' ' + text.white);
};

io.info = (text) => {
  io.print('[' + 'info'.debug + ']'.white + ' ' + text.white);
};

io.success = (text) => {
  io.print('[' + '✓'.green + ']' + ' ' + text);
};

io.warning = (text) => {
  io.print('[' + 'Warning'.warn + '] ' + text);
};

io.error = (text) => {
  io.print('[' + 'Error'.error + '] ' + text);
};

/**
 * Helper for starting an indeterminate progress bar.
 * @param {Object} bar The progress bar to start.
 */
io.startIndeterminate = (bar) => {
  if (process.stdout.isTTY) {
    return bar.start();
  }
};

/**
 * Helper for stoping an indeterminate progress bar.
 * @param {Object} bar The progress bar to stop.
 */
io.stopIndeterminate = (bar) => {
  if (process.stdout.isTTY) {
    return bar.stop();
  }
};

io.prompt = prompt;

module.exports = io;