

'use strict';
var expect = require('chai').expect;
var vlog = require('../lib/vlog').instance(__filename);

describe('vlog.js', function() {

  describe('#ee()', function() {
    var test = function(callback) {
      callback(vlog.ee(null,'error msg1','testErrA'));
    };

    it('should return the error stack', function(done) {
      var test2 = function(e) {
        if (e) {
          var re = vlog.ee(e,'test2 error').stack;
          expect(re.indexOf(']test2 error;') > 0).to.be.eql(true);
          expect(re.indexOf(']error msg1;') > 0).to.be.eql(true);
        }
        done();
      };
      test(test2);
    });
  });

});

