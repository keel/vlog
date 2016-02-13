# A better logger for nodeJs
[![Build Status](https://travis-ci.org/keel/vlog.svg)](https://travis-ci.org/keel/vlog)

Sometimes the console can't point the right error stack,so the **vlog** will replace it.
**vlog** will show the error stack in fine format, add your custom msg, and replace console.


## V0.2.3
* **ee** and **eo** can save unlimit arguments as JSON objects in log
* Plugin supported, now you can do anything (save error to other file, sent to logstash...) with plugin, try this:
```javascript
var plugA = {
  'log': function() {
    console.log('plugA----' + (new Date()));
    console.log.apply(null, arguments);
  },
  'error': function() {
    console.log('plugA----' + (new Date()));
    console.error.apply(this, arguments);
  }
};
vlog.log('test log with plugA:%d', 323);
```


## Installation
```
npm install vlog --save
```

## Usage
```javascript
//reqire vlog with __filename
var vlog = require('vlog').instance(__filename);

var test = function(callback){
  if (!callback) {
    return;
  }
  var newErr = new Error('err1');
  /**
   * vlog.ee
   * replace **error** in callback
   * 返回一个error堆栈,附加当前错误,用于callback到上层
   * @param  {Error} [err]
   * @param  {string} errMsg
   * @param  {object,object...} other objects,will be JSON.stringify and save to log
   * @return {}
   */
  //callback an error
  callback(vlog.ee(newErr,'error msg and vars',{'other object':'xyz'},'some other paras','more paras'));

  //or use null, vlog will create a Error obj for you
  //callback(vlog.ee(null,'error msg1','other object to log'));
};


var test2 = function(e){
  if (e) {
  /**
   * vlog.eo
   * print the error stack in console
   * 打印错误堆栈
   * @param  {Error} err
   * @param  {string} errMsg
   * @return {}
   */
    vlog.eo(e,'test2 error');
  }
};

test(test2);
```

will got this:

```javascript
--------- ERR: 2015-11-21 16:39:32 ---------
testErrA:
  [test.vlog.js]test2 error;
  [test.vlog.js]error msg1 @P:--"other object to log";
    at Object.me.ee (/xxx/lib/vlog.js:48:13)
    at test (/xxx/test/test.vlog.js:12:21)
    at Object.<anonymous> (/xxx/test/test.vlog.js:24:7)
    at Module._compile (module.js:425:26)
    at Object.Module._extensions..js (module.js:432:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:311:12)
    at Function.Module.runMain (module.js:457:10)
    at startup (node.js:136:18)
    at node.js:972:3
```

replace the console functions:

```javascript
vlog.log('test:name:%s,age:%d',user.name,user.age); // = console.log
vlog.error('test:name:%s,age:%d',user.name,user.age); // = console.error
vlog.warn('test:name:%s,age:%d',user.name,user.age); // = console.warn
vlog.info('test:name:%s,age:%d',user.name,user.age); // = console.info
vlog.dir({user.name,user.age}); // = console.dir
```


