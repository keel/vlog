

'use strict';
const expect = require('chai').expect;
const vlog = require('../lib/vlog').instance(__filename);

describe('vlog.js', function() {

  describe('#ee()', function() {
    const test = function(callback) {
      callback(vlog.ee(null,'error msg1','testErrA'));
    };

    it('should return the error stack', function(done) {
      const test2 = function(e) {
        if (e) {
          const re = vlog.ee(e,'test2 error').stack;
          expect(re.indexOf(']test2 error') > 0).to.be.eql(true);
          expect(re.indexOf(']error msg1') > 0).to.be.eql(true);
        }
        done();
      };
      test(test2);
    });
  });

});

