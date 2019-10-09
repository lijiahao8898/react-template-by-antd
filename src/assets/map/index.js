const tradeType = [{
    label: '农、林、牧、渔业',
    value: 1
}, {
    label: '采掘业',
    value: 2
}, {
    label: '制造业',
    value: 3
}, {
    label: '电力、燃气及水的生产和供应业',
    value: 4
}, {
    label: '建筑业',
    value: 5
}, {
    label: '批发和零售业',
    value: 6
}, {
    label: '交通运输、仓储和邮政业',
    value: 7
}, {
    label: '住宿和餐饮业',
    value: 8
}, {
    label: '信息传输、软件和信息技术服务业',
    value: 9
}, {
    label: '金融业',
    value: 10
}, {
    label: '房地产业',
    value: 11
}, {
    label: '租赁和商务服务业',
    value: 12
}, {
    label: '科学研究和技术服务业',
    value: 13
}, {
    label: '水利、环境和公共设施管理业',
    value: 14
}, {
    label: '居民服务、修理和其他服务业',
    value: 15
}, {
    label: '教育',
    value: 16
}, {
    label: '卫生和社会工作',
    value: 17
}, {
    label: '文化、体育和娱乐业',
    value: 18
}, {
    label: '公共管理、社会保障和社会组织',
    value: 19
}, {
    label: '国际组织',
    value: 20
}, {
    label: '其他',
    value: 21
}];

const idDocumentType = [{
    label: '居民身份证',
    value: 1
}, {
    label: '护照',
    value: 2
}, {
    label: '港澳台同胞回乡证',
    value: 3
}, {
    label: '外国人永久居留证',
    value: 4
}, {
    label: '营业执照注册号',
    value: 10
}, {
    label: '社会信用代码证',
    value: 11
}];

const educationBackgroundType = [{
    label: '小学',
    value: 1
}, {
    label: '初中',
    value: 2
}, {
    label: '高中',
    value: 3
}, {
    label: '大专',
    value: 4
}, {
    label: '本科',
    value: 5
}, {
    label: '硕士',
    value: 6
}, {
    label: '博士',
    value: 7
}];

const jobNatureType = [{
    label: '工人',
    value: 1
}, {
    label: '商人',
    value: 2
}, {
    label: '学生',
    value: 3
}, {
    label: '农民',
    value: 4
}];

const maritalType = [{
    label: '未知',
    value: 0
}, {
    label: '未婚',
    value: 1
}, {
    label: '已婚',
    value: 2
}, {
    label: '离异',
    value: 3
}, {
    label: '丧偶',
    value: 4
}, {
    label: '其他',
    value: 5
}];

const repaymentStatus = [{
    label: '未还款',
    value: 0
}, {
    label: '已还款',
    value: 1
}];

const productStatus = [{
    label: '预售期',
    value: 1
}, {
    label: '认购期',
    value: 2
}, {
    label: '未到期',
    value: 3
}, {
    label: '未成立',
    value: 4
}, {
    label: '逾期中',
    value: 5
}, {
    label: '提前到期',
    value: 6
}, {
    label: '正常到期',
    value: 7
}, {
    label: '逾期收回',
    value: 8
}, {
    label: '代偿结束',
    value: 9
}];

const compensate = [{
    label: '按照投资序号顺序赔付',
    value: 1
}, {
    label: '平均分配',
    value: 2
}, {
    label: '按投资金额比例分配',
    value: 3
}, {
    label: '按投资收益本息金额比例分配',
    value: 4
}];

const commonType = [{
    label: '否',
    value: 0
}, {
    label: '是',
    value: 1
}];

const category = [{
    label: '人工电催',
    value: 1
}, {
    label: '司法催收',
    value: 2
}, {
    label: '委外催收',
    value: 3
}];

export const overdueReasonOption = [{
    label: '收入减少',
    value: '收入减少'
}, {
    label: '支出增加',
    value: '支出增加',
}, {
    label: '存在争议',
    value: '存在争议'
}, {
    label: '高负债',
    value: '高负债'
}, {
    label: '忘记还款/还款卡问题',
    value: '忘记还款/还款卡问题'
}, {
    label: '高风险',
    value: '高风险',
}, {
    label: '未提及具体原因',
    value: '未提及具体原因'
}];

export const resultEffective = [{
    label: '拒绝还款',
    value: '拒绝还款'
}, {
    label: '协商跟进',
    value: '协商跟进',
}, {
    label: '客户提示已还款',
    value: '客户提示已还款'
}, {
    label: '承诺还款',
    value: '承诺还款'
}, {
    label: '已立案',
    value: '已立案'
}];

export const resultInvalid = [{
    label: '他人转告',
    value: '他人转告'
}, {
    label: '无人应答',
    value: '无人应答',
}, {
    label: '无法接通',
    value: '无法接通'
}, {
    label: '空坏号',
    value: '空坏号'
}];

export const entrustStatus = [{
    label: '受理中',
    value: 1
}, {
    label: '已核销',
    value: 2,
}, {
    label: '已撤销',
    value: 3
}];

export default {
    tradeType,                  // 行业
    idDocumentType,             // 证件类型
    educationBackgroundType,    // 学历
    jobNatureType,              // 工作性质
    maritalType,                // 婚姻状况
    repaymentStatus,            // 还款状态 - 融资人详情
    productStatus,              // 产品状态
    compensate,                 // 赔付顺序
    commonType,                 // 一般状态
    category,                   // 催收类型
    overdueReasonOption,        // 逾期原因
    resultEffective,            // 结果（有效）
    resultInvalid,              // 结果（无效）
    entrustStatus               // 委案状态
};
