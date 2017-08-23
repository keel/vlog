/*
错误处理,基于对Error对象的简单包装
1.便于在多层回调中定位出错位置
2.可增加描述便于查找原因
3.可使用plugin处理输出,例如输出到文件或发送到服务器等
4.ee和eo增除errName,从第三个参数开始增加无限个数的参数JSON化记入log

//使用方法
const plugA = {
  'log': function() {
    console.log('plugA----' + cck.msToTime());
    console.log.apply(null, arguments);
  },
  'error': function() {
    console.log('plugA----' + cck.msToTime());
    console.error.apply(this, arguments);
  }
};

const vlog = instance(__filename, plugA);

vlog.log('test log with plugA:%d', 323);

const test = function(callback) {
  if (!callback) {
    return;
  }
  const newErr = new Error('err1');
  //callback an error
  callback(vlog.ee(newErr, 'error msg and consts', 'testErrA', 3223, ['ss', 'dd'],{'aaa':'sss',nu:32}));

  //or use null, vlog will create a Error obj for you
  callback(vlog.ee(null, 'error msg1'));
};

const test2 = function(e) {
  if (e) {
    vlog.eo(e, 'test2 error',{'name':'hello'});
  }
};

test(test2);
 */
'use strict';
const cck = require('cck');

let globalPlugin = null;


//需要在进程入口处在instance之前先进行设置，可以对全进程的vlog生效
const setPlugin = function setPlugin(plugin) {
  globalPlugin = plugin;
};

/**
 * 生成一个vlog对象
 * @param  {string} fileName  需要传入__filename
 * @param {Function} plugin 处理插件,当没有时使用console方式处理
 * @return {Object}
 */
const instance = function(fileName, plugin = globalPlugin) {
  const me = {};
  me.file = fileName.substring(fileName.lastIndexOf('/') + 1);

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
  const logArgs = function(args) {
    let objLog = '';
    if (args.length > 0) {
      objLog = ' @P:';
      for (let i = 0; i < args.length; i++) {
        const argOne = ('string' === typeof args[i]) ? args[i] : JSON.stringify(args[i]);
        objLog += ' --' + argOne;
      }
    }
    return objLog;
  };

  /**
   * 返回一个error堆栈,附加当前错误,用于callback到上层
   * @param  {Error} [err]
   * @param  {string} errName
   * @param {object} ... 更多的参数将以JSON形式log在其后,以方便追踪现场情况
   * @return {}
   */
  me.ee = function(err, errName, ...args) {
    if (!err) {
      //如果没有上层错误则创建一个
      err = new Error();
    }
    //如果errName不存在则为空
    errName = errName || '';
    const orgMsg = err.message;
    //objLog将更多的参数json化放入日志
    const objLog = logArgs(args);
    // console.log('objLog:%j', objLog);
    err.message = '\n  [' + me.file + ']' + errName + objLog + ';' + orgMsg;
    process.nextTick(function() {
      if (plugin && plugin.ee) {
        plugin.ee(err, orgMsg, errName, me.file, args);
      }
    });
    return err;
  };

  /**
   * 打印错误堆栈
   * @param  {Error} [err]
   * @param  {string} errMsg
   * @return {}
   */
  me.eo = function(...args) {
    const e = me.ee.apply(null, args);
    me.error('--------- ERR: %s --------- \n%s', cck.msToTimeWithMs(), e.stack);
    return e;
  };

  //plugin可以在init方法中进行相关定制化修改,比如添加新的方法等
  if (plugin && plugin.init) {
    plugin.init(me);
  }

  return me;
};

exports.instance = instance;
exports.setPlugin = setPlugin;