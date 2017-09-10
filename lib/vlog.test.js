'use strict';
const vlog = require('./vlog').instance(__filename);
const cck = require('cck');
const p1 = { 'aaa': 'xyz', 'b': 323 };

vlog.log('aaa %j', p1);
vlog.eo(null, 'testERR_name', p1, 2323);

const fn1 = function fn1(callback) {
  callback(new Error('testErrName'));
};

const fn2 = function fn2(callback) {
  fn1((err) => {
    if (err) {
      return callback(vlog.ee(err, 'fn2Err', p1, 388889));
    }
    callback(null);
  });
};

fn2((err) => {
  if (err) {
    return vlog.eo(err, 'fn1Err');
  }
});

vlog.info('\n------------[with plugin]---------------\n');

const plugA = {
  log(...args) {
    console.log('plugA----' + cck.msToTime());
    console.log.apply(this, args);
  },
  error(...args) {
    console.log('plugAErr----' + cck.msToTime());
    console.error.apply(this, args);
  },
  ee(err, orgMsg, errName, file, args) {
    console.log('||%j||%j||%j||%j', orgMsg, errName, file, args, err);
  },
  init(vlogInstance) {
    vlogInstance.testFn = (para) => {
      console.log('====> [testFn:' + vlogInstance.file + ']:' + para);
    };
  }
};

const vlog2 = require('./vlog').instance(__filename, plugA);
vlog2.log('aaa %j', p1);
vlog2.eo(null, 'testERR_name', p1, 2323);
vlog2.testFn('hahaa');

vlog.info('\n------------[with global plugin]---------------\n');
const plugB = {
  log(...args) {
    console.log('plugB----' + cck.msToTime());
    console.log.apply(this, args);
  },
  error(...args) {
    console.log('plugBErr----' + cck.msToTime());
    console.error.apply(this, args);
  },
  ee(err, orgMsg, errName, file, args) {
    console.log('||%j||%j||%j||%j', orgMsg, errName, file, args, err);
  },
  init(vlogInstance) {
    vlogInstance.testFn = (para) => {
      console.log('====> [plugB:' + vlogInstance.file + ']:' + para);
    };
  }
};
require('./vlog').setPlugin(plugB);

vlog.log('v1 aaa:%j', p1);
vlog2.log('v2 aaa:%j', p1);

