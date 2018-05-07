# Node.js Getting started
在 LeanCloud 云引擎上使用 Express 的 Node.js 实例项目。

## 一键部署
[![Deploy to LeanEngine](http://ac-32vx10b9.clouddn.com/109bd02ee9f5875a.png)](https://leancloud.cn/1.1/engine/deploy-button)

## 本地运行

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境和 [LeanCloud 命令行工具](https://leancloud.cn/docs/leanengine_cli.html)，然后执行下列指令：

```
$ git clone https://github.com/leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

安装依赖：

```
npm install
```

登录并关联应用：

```
lean login
lean switch
```

启动项目：

```
lean up
```

之后你就可以在 [localhost:3000](http://localhost:3000) 访问到你的应用了。



##dva跨域配合node.js和leancloud
**dva项目不需要打包,直接在dva项目中打包,放入public/out文件夹中,不需要执行antd+react下面的步骤**
````
1.需要修改app.js内容
        //定义路由和跨域接口
        const apiRouter = require('./routes/router');
        const config = require('./config');
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
        //跨域api支持
        app.all('/api/*', (req, res, next) => {
            setCorsSupport(req, res, next);
        });

        app.use('/api', apiRouter);




2.添加config跨域配置文件
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




3.添加postcss.config文件输出接口文件
        module.exports = {
            plugins: [
                require('autoprefixer')
            ]
        }
````
##antd+react还需要执行以下步骤
````
1.安装package.json文件里面的项目
2.粘贴webpack.config.js文件
3.粘贴webpack.production.config.js 文件 
````


## 部署到 LeanEngine

部署到预备环境（若无预备环境则直接部署到生产环境）：
```
lean deploy
```


##git使用
````
1.ssh-keygen -t rsa -C "your_email@youremail.com"  创建钥匙
2.在github下新建一个项目,并把pub钥匙复制进去
3.$ ssh -T git@github.com  验证是否成功
4.git config --global user.name "your name"  设置名字
5.git config --global user.email "your_email@youremail.com"  设置邮箱
6.git remote add origin git@github.com:yourName/yourRepo.git 连接远程仓库地址
7.git add README把本地文件放入本地仓库
8.git commit -m "first commit"提交到仓库缓存
9.git push origin master  上传到github：
````
## 相关文档

* [云函数开发指南](https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html)
* [网站托管开发指南](https://leancloud.cn/docs/leanengine_webhosting_guide-node.html)
* [JavaScript 开发指南](https://leancloud.cn/docs/leanstorage_guide-js.html)
* [JavaScript SDK API](https://leancloud.github.io/javascript-sdk/docs/)
* [Node.js SDK API](https://github.com/leancloud/leanengine-node-sdk/blob/master/API.md)
* [命令行工具使用指南](https://leancloud.cn/docs/leanengine_cli.html)
* [云引擎常见问题和解答](https://leancloud.cn/docs/leanengine_faq.html)
