const fs = require('fs');
var key = '6E6F846E16A1FD877B17B42697B5E';

// Create an encryptor:
var encryptor = require('simple-encryptor')(key);

const DIR = './sdfc-cli/';

class UserConfig {

  constructor() {
    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR);
    }
  }

  load() {
    const configFile = DIR + 'modc';
    if(fs.existsSync(configFile)) {
      try {
        this.data = JSON.parse(fs.readFileSync(configFile));
      } catch(e) {
        this.data = null;
      }
      return true;
    } else {
      return false;
    }
  };

  save(data) {
    const configFile = DIR + 'modc';
    fs.writeFileSync(configFile, JSON.stringify(data));
    return true;
  };

  clearSession() {
    this.load();

    delete this.data.accessToken;
    delete this.data.userId;
    delete this.data.instanceUrl;
    delete this.data.username;
    delete this.data.password;

    this.save(this.data);

    return true;
  };
};

module.exports = UserConfig;