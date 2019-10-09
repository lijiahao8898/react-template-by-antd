import Mock from 'mockjs'

const data = Mock.mock('mock/index', {
    success: true,
    'datas|20':[{
        'key|+1': 1,
        'mockTitle|1':['哑巴1', 'Butter-fly', '肆无忌惮', '摩天大楼', '初学者'],
        'mockContent|1': ['你翻译不了我的声响', '数码宝贝主题曲', '摩天大楼太稀有', '像海浪撞破了山丘'],
        'mockAction|1': ['下载', '试听', '喜欢']
    }]
});

// const list = Mock.mock('mock/list', {
//     success: true,
//     'datas|15':[{
//         'key|+1': 1,
//         'mockTitle|1':['哑巴1', 'Butter-fly', '肆无忌惮', '摩天大楼', '初学者'],
//         'mockContent|1': ['你翻译不了我的声响', '数码宝贝主题曲', '摩天大楼太稀有', '像海浪撞破了山丘'],
//         'mockAction|1': ['下载', '试听', '喜欢']
//     }]
// });

export default [data]
