const redis = require('redis');
const batch = require('./batch');

const plan = () => ({
  the_plan: [],
  n: 1,

  batch(url) {
    const node = {
      client: redis.createClient(),
      source: null,
      sink: 'stream:source',
      n: 1,
      p: 0,

      emit(data) {
        let args;

        if (data === 'TERMINAL') {
          console.log('BYE!');
          args = [
            this.sink, '*',
            'state', 'TERMINAL',
          ];
        } else {
          args = [
            this.sink, '*',
            'data', JSON.stringify(data),
          ];
        }

        this.client.xadd(args);
      },

      done() {
        this.client.quit();
      },

      executor: batch(url),

      start() {
        console.log('starting batch job');
        this.client.xtrim(this.sink, 'MAXLEN', 0);
        this.executor(this.emit.bind(this), this.done.bind(this));
      },
    };

    this.the_plan.push(node);
    node.start();

    return this;
  },

  partition(n) {
    const node = {
      client: redis.createClient(),
      source: 'stream:source',
      sink: 'stream:partition',
      n,
      p: 0,

      emit(data) {
        const args = [
          `${this.sink}:${this.p}`, '*',
          'data', data,
        ];
        this.client.xadd(args);
        this.p = (this.p + 1) % this.n;
      },

      done() {
        this.client.quit();
      },

      executor(id = '0-0') {
        this.client.xread('BLOCK', 10, 'STREAMS', this.source, id,
          (err, res) => {
            let new_id = id;
            let payload;

            if (res !== null) {
              res[0][1].forEach((message) => {
                [new_id, payload] = message;
                this.emit(payload[1]);
              });
            }

            setTimeout(() => this.executor(new_id), 0);
          });
      },

      start() {
        console.log('starting partitioner');
        for (let p = 0; p < this.n; p += 1) {
          this.client.xtrim(`${this.sink}:${p}`, 'MAXLEN', 0);
        }
        this.executor();
      },
    };

    this.the_plan.push(node);
    this.n = n;
    node.start();

    return this;
  },

  map(f) {
    const node = {
      client: redis.createClient(),
      source: 'stream:partition',
      sink: 'stream:map',
      p: 0,

      emit(data) {
        const args = [
          `${this.sink}:${this.p}`, '*',
          'data', JSON.stringify(data),
        ];
        this.client.xadd(args);
      },

      done() {
        this.client.quit();
      },

      executor(id = '0-0') {
        this.client.xread('BLOCK', 10, 'STREAMS', `${this.source}:${this.p}`, id,
          (err, res) => {
            let new_id = id;
            let payload;
            let result;
            let state = null;

            if (res !== null) {
              res[0][1].forEach((message) => {
                [new_id, payload] = message;
                const data = payload[1];
                if (data === 'TERMINAL') {
                  console.log('TERMINAL', this.p);
                } else {
                  if (state === null) {
                    [result, state] = f(JSON.parse(data));
                  } else {
                    [result, state] = f(JSON.parse(data), state);
                  }
                  this.emit(result);
                }
              });
            }

            setTimeout(() => this.executor(new_id), 0);
          });
      },

      start() {
        console.log('starting mapper', this.p);
        this.client.xtrim(`${this.sink}:${this.p}`, 'MAXLEN', 0);
        this.executor();
      },
    };

    const [prev_node] = this.the_plan.slice(-1);
    this.n = prev_node.n;

    for (let p = 0; p < this.n; p += 1) {
      const nodey = { ...node, p, n: this.n };
      this.the_plan.push(nodey);
      nodey.start();
    }

    return this;
  },

  avg() {
    const node = {
      client: redis.createClient(),
      source: 'stream:map',
      sink: 'stream:collect',
      p: 0,
      state: {},

      emit(data) {
        const args = [
          this.sink, '*',
          'data', JSON.stringify(data),
        ];
        this.client.xadd(args);
      },

      done() {
        this.client.quit();
      },

      executor(p, id = '0-0') {
        this.client.xread('BLOCK', 10, 'STREAMS', `${this.source}:${p}`, id,
          (err, res) => {
            let new_id = id;
            let payload;

            if (res !== null) {
              res[0][1].forEach((message) => {
                [new_id, payload] = message;
                this.state[p] = JSON.parse(payload[1]);
                const values = Object.values(this.state);
                const pi = values.reduce((a, v) => a + v, 0.0) / values.length;
                this.emit(pi);
              });
            }

            setTimeout(() => this.executor(p, new_id), 0);
          });
      },

      start(nn) {
        console.log('starting collector');
        this.client.xtrim(this.sink, 'MAXLEN', 0);

        for (let p = 0; p < nn; p += 1) {
          console.log('starting executor', p);
          this.executor(p);
        }
      },
    };

    const [prev_node] = this.the_plan.slice(-1);
    this.nn = prev_node.n;

    this.the_plan.push(node);
    this.n = 1;
    node.start(this.nn);

    return this;
  },
});

module.exports = plan;
