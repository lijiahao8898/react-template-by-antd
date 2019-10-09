const express = require('express');
const Mock = require('mockjs');
const app = express();

// port
let NODE_PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
    // 设置是否运行客户端设置 withCredentials
    // 即在不同域名下发出的请求也可以携带 cookie
    res.header("Access-Control-Allow-Credentials",true)
    // 第二个参数表示允许跨域的域名，* 代表所有域名
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS') // 允许的 http 请求的方法
    // 允许前台获得的除 Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma 这几张基本响应头之外的响应头
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    if (req.method == 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
})

// 监听 /user
app.use('/mock/list', function (req, res) {
    // 让接口 500-1000ms 返回 好让页面有个loading
    setTimeout(() => {
        res.json(Mock.mock({
            success: true,
            'datas|18': [{
                'key|+1': 1,
                'mockTitle|1': ['哑巴1', 'Butter-fly', '肆无忌惮', '摩天大楼', '初学者'],
                'mockContent|1': ['你翻译不了我的声响', '数码宝贝主题曲', '摩天大楼太稀有', '像海浪撞破了山丘'],
                'mockAction|1': ['下载', '试听', '喜欢']
            }]
        }));
    }, Math.random() * 500 + 500);
});

app.listen(NODE_PORT, function () {
    console.log('mock服务在' + NODE_PORT + '端口上已启用！');
});
