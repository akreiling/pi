const Flexor = require('../flexor');

class Fanin extends Flexor {
  constructor(config = {}) {
    super(config);

    this.cache = {};
  }

  eval(data, key) {
    this.cache[key] = data;
    super.eval(this.cache);
  }
}

module.exports = Fanin;
