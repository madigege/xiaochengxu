/**
 * 好好学习，为人民服务！
 * Good Good Study, Do Everything For You!
 * @autor madi, Time: 18/1/17.
 */

var AV = require('leanengine');


var loginval = {};
// 新建一个 Login 对象用来存储数据
var Login = AV.Object.extend('Login');
var Login = new Login();
//上面两条是新建一一张表但是下面无法直接引用,需要再次声明,且顺序不可变!
var Login = AV.Object.extend('Login');
loginval.pangbai = function(req, res, next) {
	var query = new AV.Query(Login);
	query.descending('createdAt');
	query.find().then(function(results) {

		res.json({
			title: 'Login 列表',
			dataforlean: results
		});
	}, function(err) {
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
};

module.exports = loginval;