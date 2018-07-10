/**
 * 好好学习，为人民服务！
 * Good Good Study, Do Everything For You!
 * @autor madi , Time: 18/1/17.
 */

var AV = require('leanengine');
var Pangbai = require('./pangbai');
// 所有 API 的路由
'use strict';
const router = require('express').Router();

//数据接口
router.post('/fistval',Pangbai.pangbai);

// 其他接口全部返回 404
router.use((req, res) => {
	res.status(404).send('Not Found.');
});
module.exports = router;