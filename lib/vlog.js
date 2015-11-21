/*
错误处理,基于对Error对象的简单包装
1.便于在多层回调中定位出错位置
2.可增加描述便于查找原因
//使用方法
var vlog = instance(__filename);

var test = function(callback){
  if (!callback) {
    return;
  }
  var newErr = new Error('err1');
  //callback an error
  callback(vlog.ee(newErr,'error msg and vars','testErrA'));

  //or use null, vlog will create a Error obj for you
  callback(vlog.ee(null,'error msg1','testErrA'));
};

var test2 = function(e){
  if (e) {
    vlog.eo(e,'test2 error');
  }
};

test(test2);
 */
'use strict';
var cck = require('cck');
/**
 * 生成一个vlog对象
 * @param  {string} fileName  需要传入__filename
 * @return {Object}
 */
var instance = function(fileName) {
  var me = {};
  me.file = '[' + fileName.substring(fileName.lastIndexOf('/') + 1) + ']';
  /**
   * 返回一个error堆栈,附加当前错误,用于callback到上层
   * @param  {Error} [err]
   * @param  {string} errMsg
   * @param  {string} [errName]
   * @return {}
   */
  me.ee = function(err, errMsg, errName) {
    if (!err) {
      //如果没有上层错误则创建一个
      err = new Error();
    }
    if (errName) {
      err.name = errName;
    }
    //如果errMsg不存在则为空
    errMsg = errMsg || '';
    err.message = '\n  ' + me.file + errMsg + ';' + err.message;
    return err;
  };

  /**
   * 打印错误堆栈
   * @param  {Error} [err]
   * @param  {string} errMsg
   * @param  {string} [errName]
   * @return {}
   */
  me.eo = function(err, errMsg, errName) {
    var e = me.ee(err, errMsg, errName);
    console.error('--------- ERR: %s --------- \n%s',cck.msToTime(),e.stack);
    return e;
  };
  //复制console的几个log方法,便于与各种第三方log模块对接,或后期自行实现
  me.log = function() {
    console.log.apply(this, arguments);
  };
  me.info = function() {
    console.info.apply(this, arguments);
  };

  me.warn = function() {
    console.warn.apply(this, arguments);
  };
  me.error = function() {
    console.error.apply(this, arguments);
  };

  me.dir = function() {
    console.dir.apply(this, arguments);
  };
  return me;
};

exports.instance = instance;
