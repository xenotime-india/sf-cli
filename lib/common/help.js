/**
 * Created by sandeepkumar on 16/01/17.
 */
class help {
  constructor(name, cli) {
    this.name = name;
    this.cli = cli;

    this.commands = {};
    this.ordered = [];
    this.pad = 0;
    this.usagePrinters = {};
  }

  printUsage(command) {
    var printer = this.usagePrinters[command];
    if (printer) {
      printer.cli.io.print('Usage:');
      printer.print();
    }
  };

  add(command, print) {
    if (this.commands.hasOwnProperty(command)) {
      return;
    }

    if (typeof print === 'function') {
      this.commands[command] = print.bind(this);
    } else {
      this.commands[command] = print;
    }

    this.usagePrinters[command] = {
      cli: this.cli,
      print: this.commands[command]
    };

    this.ordered.push(command);
  };

  remove(command) {
    delete this.commands[command];

    for (var c = 0; c < this.ordered.length; c++) {
      if (this.ordered[c] === command) {
        this.ordered.splice(c, 1);
        return;
      }
    }
  };

  line(text) {
    var padding = '';
    for (var p = 0; p < this.pad; p++) {
      padding += ' ';
    }

    this.cli.io.print(padding + text);
  };

  print() {
    this.line((this.name + ' Commands').verbose.underline);
    this.line('');

    this.pad += 2;

    var cmd;
    for (var c = 0; c < this.ordered.length; c++) {
      let output = this.commands[this.ordered[c]];

      if (typeof output === 'string') {
        this.cli.io.print(output);
      }

      if (typeof output === 'function') {
        output();
      }

      this.line('');
    }

    this.pad -= 2;
  };

  getPrinter() {
    return this.print.bind(this);
  };
}

module.exports = help;