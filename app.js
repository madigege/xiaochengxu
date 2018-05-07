'use strict';
//上下留白中间代码是自己写的!

var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

const config = require('./config');
var app = express();

// 设置模板引擎

// 设置默认超时时间
app.use(timeout('15s'));

// 加载云引擎中间件
app.use(AV.express());

app.enable('trust proxy');
// 需要重定向到 HTTPS 可去除下一行的注释。
app.use(AV.Cloud.HttpsRedirect());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


var UserList = AV.Object.extend('UserList');
//查询
app.get('/getopenid', function (req, res, next) {
    var query = new AV.Query(UserList);
    query.descending('createdAt');
    query.find().then(function (results) {

        res.json({
            title: 'Login 列表',
            dataforlean: results
        });
    }, function (err) {
        if (err.code === 101) {
            // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
            // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
            res.json({
                title: 'Login 列表',
                dataforlean: ['错误']
            });
        } else {
            next(err);
        }
    }).catch(next);
});
//增加
app.get('/postcontent/:inputValue/:index/:inputValuebeizhu/:array', function (req, res, next) {
    console.log(req.params.inputValue,req.params.index,req.params.inputValuebeizhu,req.params.array,);
    var userList = new UserList();
    userList.set('name', req.params.array);
    userList.set('beizhu', req.params.inputValuebeizhu);
    // 只要添加这一行代码，服务端就会自动添加这个字段
    userList.set('value',req.params.inputValue);
    userList.set('nameID',req.params.index);
    if(req.params.array=="收入"){
        userList.set('state','0');
    }else {
        userList.set('state','1');
    }
    userList.save().then(function (UserList) {
        // 成功保存之后，执行其他逻辑.
        res.json({title:"ok"})
    },  function (err) {
        if (err.code === 101) {
            // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
            // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
            res.json({
                title: 'Login 列表',
                dataforlean: ['错误']
            });
        } else {
            next(err);
        }
    }).catch(next);
});
//删除
app.get('/detelecontent/:ID', function (req, res, next) {
        console.log(req.params.ID)
    var userList = AV.Object.createWithoutData('UserList',req.params.ID);
    userList.destroy().then(function (success) {
        res.json({title:"ok"})
        // 删除成功
    }, function (err) {
        if (err.code === 101) {
            // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
            // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
            res.json({
                title: 'Login 列表',
                dataforlean: ['错误']
            });
        } else {
            next(err);
        }
    }).catch(next);
});
//更新
app.get('/putcontent/:ID/:inputValue/:index/:inputValuebeizhu/:array', function (req, res, next) {
    console.log(req.params.inputValue,
        req.params.index,
        req.params.inputValuebeizhu,
        req.params.array,
        req.params.ID);
var userListTow = AV.Object.createWithoutData('UserList', req.params.ID);
// 修改属性
    userListTow.set('name', req.params.array);
    userListTow.set('beizhu', req.params.inputValuebeizhu);
    userListTow.set('value',req.params.inputValue);
    userListTow.set('nameID',req.params.index);
    if(req.params.array=="收入"){
        userListTow.set('state','0');
    }else {
        userListTow.set('state','1');
    }
    res.json({title:"ok"});
// 保存到云端
    userListTow.save();
});

//跨域请求数据头
const setCorsSupport = (req, res, next) => {
    const origin = req.headers.origin;
    if (config.whiteOrigins.indexOf(origin) !== -1) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE');
    }
    next();
};
//跨域支持
app.all('/api/*', (req, res, next) => {
    setCorsSupport(req, res, next);
});


app.use(function (req, res, next) {
    // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
    if (!res.headersSent) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    }
});

// error handlers
app.use(function (err, req, res, next) {
    if (req.timedout && req.headers.upgrade === 'websocket') {
        // 忽略 websocket 的超时
        return;
    }

    var statusCode = err.status || 500;
    if (statusCode === 500) {
        console.error(err.stack || err);
    }
    if (req.timedout) {
        console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
    }
    res.status(statusCode);
    // 默认不输出异常详情
    var error = {};
    if (app.get('env') === 'development') {
        // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
        error = err;
    }
    res.render('error', {
        message: err.message,
        error: error
    });
});

module.exports = app;
