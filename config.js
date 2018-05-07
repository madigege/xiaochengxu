'use strict';
//跨域所需的配置,node.js不自带!需要自己写!




var AV = require('leanengine');

const config = {

	// 服务端 host
	host: 'http://localhost:3000',

	// 跨域白名单
	whiteOrigins: [
		'http://localhost:3000',
		'http://myperfect.leanapp.cn',
	],

	// 微信相关（通过 LeanEngine 环境变量获取）
	// weixinAppId: process.env.weixinAppId,
	// weixinSecret: process.env.weixinSecret,
};


// 判断环境
switch (AV.Cloud.__prod) {

	// 当前环境测试环境
	case 0:
		config.host = 'http://localhost:3000';
		break;

	// 当前环境为正式运行的环境
	case 1:
		config.host = 'http://myperfect.leanapp.cn';
		break;

	default:
		break;
}

module.exports = config;
