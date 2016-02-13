/*
错误处理,基于对Error对象的简单包装
1.便于在多层回调中定位出错位置
2.可增加描述便于查找原因
3.可使用plugin处理输出,例如输出到文件或发送到服务器等
4.ee和eo增除errName,从第三个参数开始增加无限个数的参数JSON化记入log

//使用方法
var plugA = {
  'log': function() {
    console.log('plugA----' + cck.msToTime());
    console.log.apply(null, arguments);
  },
  'error': function() {
    console.log('plugA----' + cck.msToTime());
    console.error.apply(this, arguments);
  }
};

var vlog = instance(__filename, plugA);

vlog.log('test log with plugA:%d', 323);

var test = function(callback) {
  if (!callback) {
    return;
  }
  var newErr = new Error('err1');
  //callback an error
  callback(vlog.ee(newErr, 'error msg and vars', 'testErrA', 3223, ['ss', 'dd'],{'aaa':'sss',nu:32}));

  //or use null, vlog will create a Error obj for you
  callback(vlog.ee(null, 'error msg1'));
};

var test2 = function(e) {
  if (e) {
    vlog.eo(e, 'test2 error',{'name':'hello'});
  }
};

test(test2);
 */
'use strict';
var cck = require('cck');
/**
 * 生成一个vlog对象
 * @param  {string} fileName  需要传入__filename
 * @param {Function} plugin 处理插件,当没有时使用console方式处理
 * @return {Object}
 */
var instance = function(fileName, plugin) {
  var me = {};
  me.file = '[' + fileName.substring(fileName.lastIndexOf('/') + 1) + ']';
  //复制output的几个log方法,便于与各种第三方log模块对接,或后期自行实现
  me.log = (plugin && plugin.log) ? plugin.log : function() {
    console.log.apply(null, arguments);
  };
  me.info = (plugin && plugin.info) ? plugin.info : function() {
    console.info.apply(null, arguments);
  };

  me.warn = (plugin && plugin.warn) ? plugin.warn : function() {
    console.warn.apply(null, arguments);
  };
  me.error = (plugin && plugin.error) ? plugin.error : function() {
    console.error.apply(null, arguments);
  };

  me.dir = (plugin && plugin.dir) ? plugin.dir : function() {
    console.dir.apply(null, arguments);
  };

  //从第3个参数起判断
  var logArgs = function(argmts) {
    var objLog = '';
    if (cck.isNotNull(argmts[2])) {
      objLog = ' @P:';
      var args = Array.prototype.slice.call(argmts);
      for (var i = 2; i < args.length; i++) {
        objLog += '--' + JSON.stringify(args[i]);
      }
    }
    return objLog;
  };

  /**
   * 返回一个error堆栈,附加当前错误,用于callback到上层
   * @param  {Error} [err]
   * @param  {string} errMsg
   * @param {object} ... 更多的参数将以JSON形式log在其后,以方便追踪现场情况
   * @return {}
   */
  me.ee = function(err, errMsg) {
    if (!err) {
      //如果没有上层错误则创建一个
      err = new Error();
    }
    //如果errMsg不存在则为空
    errMsg = errMsg || '';
    //objLog将更多的参数json化放入日志
    var objLog = logArgs(arguments);
    // console.log('objLog:%j', objLog);
    err.message = '\n  ' + me.file + errMsg + objLog + ';' + err.message;
    return err;
  };

  /**
   * 打印错误堆栈
   * @param  {Error} [err]
   * @param  {string} errMsg
   * @return {}
   */
  me.eo = function() {
    var e = me.ee.apply(null,arguments);
    me.error('--------- ERR: %s --------- \n%s', cck.msToTimeWithMs(), e.stack);
    return e;
  };

  return me;
};

exports.instance = instance;

