'use strict';

//上下留白中间代码是自己写的!
var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');
var request = require('request');
var fs = require('fs');
var url = require("url");
// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');
// 可以将一类的路由单独保存在一个文件中,定义路由和接口
const apiRouter = require('./routes/router');


const config = require('./config');


var app = express();


const routesArr = [
    "",
    'home',
    'systemUser',
    'systemRole',
    'systemPower',
    'systemDerc',
    'systemSupper',
    'coustomerList',
    'coustomerUser',
    'carMan',
    'carState',
    'driverMan',
    'driverState',
    'driverWorld',
    'productCon',
    'productList',
    'productClass',
    'productprice',
    'oderMan',
    'oderManState',
    'auditBill',
    'unauditBill',
    'daysecuritycheck',
    'onlysecuritycheck',
    'productcharacteristic',
    'maggess',
    'reportForm',
    'PopForm',
    'CarForm',
    'productagreement',
    'newOder',
    'productInsurance',
	'OwnIp'

];

// 设置模板引擎
app.set('views', path.join('views'));
app.set('view engine', 'ejs');

//web路由分发
routesArr.map(function (arr) {
    app.get('/' + arr, function (req, res) {
        res.render('index', {currentTime: new Date()});
    });
});


//获取openID
app.get('/getCodeForOpenId/:code', function(req,res, next){
    // 第二步：通过code换取网页授权access_token
    res.header("Access-Control-Allow-Origin", '*');
    var code = req.params.code;
    console.log("code:",code);
        var getTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?" +
            "appid=wx19900063c5ea347b" +
            "&secret=90d176770180b617553e98826224d05c" +
            "&code=" + code +
            "&grant_type=authorization_code";
    request.get({url:getTokenUrl},
        function(error, response, body){
            if(response.statusCode == 200){
                // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                console.log(JSON.parse(body));
                var data = JSON.parse(body);
                var access_token = data.access_token;
                var openid = data.openid;
                 res.json({openid:openid})
            }else{
                console.log(response.statusCode);
            }
        }
    );
});


app.use(express.static('public'));



//客户端获取openid
app.get('/getOpenid', function (req, res) {
    // console.log(req.originalUrl)
    res.render('phone', {currentTime: new Date(),madi:'1234567890'});
});
//客户端
app.get('/login', function (req, res) {
    res.render('phone', {currentTime: new Date(),madi:'1234567890'});
});
app.get('/homePhone', function (req, res) {
    res.render('phone', {currentTime: new Date(),madi:'1234567890'});
});
app.get('/homePhoneTow', function (req, res) {
    res.render('phone', {currentTime: new Date()});
});
app.get('/InvoiceMan', function (req, res) {
    res.render('phone', {currentTime: new Date()});
});



//司机端获取openID
app.get('/driversPhone', function (req, res) {
    res.render('drivers', {currentTime: new Date()});
});
//司机端
app.get('/loginTow', function (req, res) {
    res.render('phone', {currentTime: new Date()});
});
app.get('/CarStatePhone', function (req, res) {
    res.render('drivers', {currentTime: new Date()});
});
app.get('/Carown', function (req, res) {
    res.render('drivers', {currentTime: new Date()});
});
app.get('/angular', function (req, res) {
    res.render('angular', {currentTime: new Date()});
});


// 设置默认超时时间
app.use(timeout('15s'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//判断用户是否在线功能
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));

// 加载云引擎中间件
app.use(AV.express());

app.enable('trust proxy');
// 需要重定向到 HTTPS 可去除下一行的注释。
//app.use(AV.Cloud.HttpsRedirect());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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

app.use('/api', apiRouter);

module.exports = app;
