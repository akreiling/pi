class StdoutProducer {
  constructor() {
    this.url = 'stdout:';
    this.counter = 0;
  }

  start() {
    console.log('starting producer', this.url);
  }

  terminal() {
  }

  stop() {
    console.log(this.data);
  }

  async emit(data) {
    this.counter += 1;
    const { counter } = this;

    if (counter % 100000 === 0) {
      console.log(counter, data);
    }

    this.data = data;
  }
}

module.exports = StdoutProducer;
