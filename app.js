'use strict';
//上下留白中间代码是自己写的!
var request = require('request');
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
// var urlencodedParser = bodyParser.urlencoded({ extended: false })




app.get('/getListbeforopenid/:code', function (req, res, next) {
    // console.log(req.params.code)
    var appid = 'wx48099c832c538324'; //填写微信小程序appid  
    var secret = 'ebcc7241f2a37247dd9f279edbbdca27'; //填写微信小程序secret  
    // res.header("Access-Control-Allow-Origin", '*');
    var code = req.params.code;
    // console.log("code:",code);
    // https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code='+ code +'&grant_type=authorization_code
        var getTokenUrl = "https://api.weixin.qq.com/sns/jscode2session?" +
            "appid=" + appid +
            "&secret=" + secret +
            "&js_code=" + code +
            "&grant_type=authorization_code";
            console.log(getTokenUrl)
    request.get({url:getTokenUrl},
        function(error, response, body){
            if(response.statusCode == 200){
                // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                // console.log(JSON.parse(body));


                var data = JSON.parse(body);
                var access_token = data.access_token;
                var openid = data.openid;
                res.json({openid:openid})

                //获取用户信息
                // request.get({url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN'},
                //     function(error, response, body){
                //         if(response.statusCode == 200){
                            
                //             // 第四步：根据获取的用户信息进行对应操作
                //             var userinfo = JSON.parse(body);
                //             //console.log(JSON.parse(body));
                //             console.log('获取微信信息成功！');
                            
                //             // 小测试，实际应用中，可以由此创建一个帐户
                //             res.send("\
                //                 <h1>"+userinfo.nickname+" 的个人信息</h1>\
                //                 <p><img src='"+userinfo.headimgurl+"' /></p>\
                //                 <p>"+userinfo.city+"，"+userinfo.province+"，"+userinfo.country+"</p>\
                //             ");
                            
                //         }else{
                //             console.log(response.statusCode);
                //         }
                //     }
                // );



            }else{
                // console.log(response.statusCode);
            }
        }
    );

    
})
















// //新建一张表
// var TodoFolder = AV.Object.extend('TodoFolder');
// // 新建对象
//   var todoFolder = new TodoFolder();
// // 设置键值
//   todoFolder.set('name','工作');
// // 生成一张表
// todoFolder.save().then(function (todo) {
// //返回id
// console.log('objectId is ' + todo.id);
// }, function (error) {
// //返回错误
// console.error(error);
// });




/*openidhe用户绑定*/

//查询用户
app.get('/getList/:openid', function (req, res, next) {
    var UserName = AV.Object.extend('UserName');
    var query = new AV.Query(UserName);
        query.contains('name',req.params.openid);
        query.find().then(function (results) {
        res.json({
            title:results
        })
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
})
//创建账单
app.get('/newList/:openid/:name', function (req, res, next) {
    // res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
    var newList = "M" + Math.random().toString(36).substr(2);

    var UserName = AV.Object.extend('UserName');
    var userName = new UserName();
    userName.set('name', req.params.openid);
    userName.set('cheaes', req.params.name);
    userName.set('List',newList);
    userName.save().then(function (UserList) {
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


//新建一张表
var TodoFolder = AV.Object.extend(newList);
// 新建对象
  var todoFolder = new TodoFolder();
// 设置键值
    todoFolder.set('state',"0");
    todoFolder.set('name', "收入");
    todoFolder.set('beizhu', "收入");
    todoFolder.set('value',"0");
    todoFolder.set('nameID',"3");
// 生成一张表
    todoFolder.save().then(function (todo) {
    //返回id 
    // console.log('objectId is ' + todo.id);
    }, function (error) {
    //返回错误  
    console.error(error);
    });
})

//绑定账单;
app.get('/bindList/:openid/:name', function (req, res, next) {
    // res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});

// console.log(req.params.openid,req.params.name)
var UserName = AV.Object.extend('UserName');
    //查询表
    var query = new AV.Query('UserName');
    query.contains('List', req.params.name);
    query.find().then(function (results) {
        if (results.length==0) {
            res.json({
                title: '无法添加',
            });
        }else{
            // console.log(results.length)
            //增加
            if(results.length>1){
                for (var i = 0; i < results.length; i++) {
                    console.log(i)
                    if(results[i]._serverData.name == req.params.openid){
                        res.json({title:"重复添加了!"})
                    }else if(i == results.length-1){
                        var userName = new UserName();
                        userName.set('name', req.params.openid);
                        userName.set('cheaes', results[0]._serverData.cheaes);
                        userName.set('List',req.params.name);
                        userName.save().then(function (UserList) {
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
                    }
                };

            }else{
                var userName = new UserName();
                userName.set('name', req.params.openid);
                userName.set('cheaes', results[0]._serverData.cheaes);
                userName.set('List',req.params.name);
                userName.save().then(function (UserList) {
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
            }
            
        }
        
        
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
})















/*操作账单*/
//查询
app.get('/getopenid/:ListName',function (req, res, next) {
    // res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});

    var UserList = AV.Object.extend(req.params.ListName);
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
app.get('/postcontent/:inputValue/:index/:inputValuebeizhu/:array/:ListName', function (req, res, next) {
    // res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});

    var UserList = AV.Object.extend(req.params.ListName);
    // console.log(req.params.inputValue,req.params.index,req.params.inputValuebeizhu,req.params.array,);
    var userList = new UserList();
    userList.set('name', req.params.array);
    userList.set('beizhu', req.params.inputValuebeizhu);
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
app.get('/detelecontent/:ID/:ListName', function (req, res, next) {
    // res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});

    var UserList = AV.Object.extend(req.params.ListName);
        // console.log(req.params.ID)
    var userList = AV.Object.createWithoutData(req.params.ListName,req.params.ID);
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
app.get('/putcontent/:ID/:inputValue/:index/:inputValuebeizhu/:array/:ListName', function (req, res, next) {
    // res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});

    var UserList = AV.Object.extend(req.params.ListName);
    // console.log(req.params.inputValue,
    //     req.params.index,
    //     req.params.inputValuebeizhu,
    //     req.params.array,
    //     req.params.ID);
var userListTow = AV.Object.createWithoutData(req.params.ListName, req.params.ID);
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
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With', 'application/x-www-form-urlencoded', 'Content-Type, Accept');
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
