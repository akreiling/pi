const redis = require('redis');

const generator = require('./_generator');
const partitioner = require('./_partition');
const calc = require('./calculate');

const consumer = (callback, client, stream, id = '0-0') => {
  client.xread('BLOCK', 10, 'STREAMS', stream, id,
    (err, res) => {
      let new_id = id;
      let payload;

      if (res !== null) {
        res[0][1].forEach((message) => {
          [new_id, payload] = message;
          console.log(new_id, payload);
          xxixixixixi();
        });
      }

      setTimeout(() => consumer(callback, client, stream, new_id), 0);
    });
};

const state = {};

const stage6 = () => (s) => {
  const pi = s.reduce((a, b) => a + b, 0) / s.length;
  state.stage6 = pi;
};

const stage5 = (n) => (s) => {
  const f = stage6();

  state.stage5 = state.stage5 || [];
  state.stage5[n] = s;

  f(state.stage5);
};

const stage4 = (n) => (s) => {
  const f = stage5(n);

  state.stage4 = state.stage4 || [];
  state.stage4[n] = 0.0;

  state.stage4[n] = (4 * s.true) / (s.false + s.true);
  f(state.stage4[n]);
};

const stage3 = (n) => {
  const f = stage4(n);

  state.stage3 = state.stage3 || [];
  state.stage3[n] = { true: 0, false: 0 };

  return (record) => {
    if (record) {
      state.stage3[n].true += 1;
    } else {
      state.stage3[n].false += 1;
    }

    f(state.stage3[n]);
  };
};

const stage2 = (n) => {
  const f = stage3(n);

  return (record) => {
    const result = calc(record);
    f(result);
  };
};

const stage1 = (n) => {
  const client = redis.createClient();

  const source = 'stream:source';
  const sink = 'stream:partition';

  consumer(() => true, client, source);

  client.xtrim(sink, 'MAXLEN', 0);
  const emit = (p, data) => {
    const args = [
      `${sink}:${p}`, '*',
      'data', JSON.stringify(data),
    ];
    client.xadd(args);
  };

  partitioner(n, emit, () => client.quit());
};

const stage0 = (url) => () => {
  const client = redis.createClient();
  const sink = 'stream:source';
  client.xtrim(sink, 'MAXLEN', 0);
  const emit = (data) => {
    const args = [
      sink, '*',
      'data', JSON.stringify(data),
    ];
    client.xadd(args);
  };

  generator(url, emit, () => client.quit());
};

const plan = (url) => {
  const f0 = stage0(url);
  const f1 = stage1(4);

  return () => {
    f0();
    f1();
  };
};

const main = async () => {
  const url = process.argv[0 + 2];
  const job = plan(url);
  job();
};

main();
