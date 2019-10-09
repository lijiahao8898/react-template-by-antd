// modal
export const modalWidth = {
    large: '1000px',
    base: '750px',
    middle: '600px',
    small: '500px',
    extraSmall: '400px',
    extraExtraSmall: '300px',
    tiny: '200px',
};

// input
export const inputWidth = {
    base: '320px',
    small: '240px',
    tiny: '160px'
};

// validate
export const regular = {
    decimal: /^\d+(\.\d{1,2})?$/,           // 整数或小数点两位
    decimalSix: /^\d+(\.\d{1,6})?$/,        // 整数或小数点六位
    percent: /^\d+(\.\d{1,2})?$/,           // 比率 - 一般支持小数点后三位
    number: /^[0-9]+$/,                     // 数字
    character: /^[a-zA-Z]+$/,               // 字母
    decimal2: /^([1-9]\d*(.\d{1,2})?)$|^(0.\d?[1-9])$|^(0.[1-9]\d?)$/,       // 整数或小数点两位(不包含0)
    exceptFont: /^[a-z][a-zA-Z0-9-]*$/,
    pwd: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z~!@#$%^&*?\\(\\)_+=/,.<>-]{8,20}$/,  // 密码
    phone: /^[1][0-9][0-9]{9}$/
};

export const tip = {
    operateSuccess: '操作成功！',
    formatError: '输入的格式不正确',
    exporting: '导出中...',
    exportWithNoSearch: '请先查询内容，再进行导出',
    noSelect: '请至少选择一项！',
    onlySelectOne: '只能选择一项！',
    repeatClick: '正在请求...请勿重复点击。',
    needSearch: '请先点击搜索按钮',
    prompt: '温馨提示！'
};

export const textMap = {
    ok: '确定',
    cancel: '取消',
    popConfirmOk: '是',
    popConfirmCancel: '否',
    add: '添加',
    delete: '删除',
    update: '修改'
};

export let initialPage;
const height = window.innerHeight;
if (height > 750) {
    initialPage = {
        pageSize: 50,
        modalPageSize: 10,
    };
} else {
    initialPage = {
        pageSize: 20,
        modalPageSize: 10,
    };
}


export default {
    modalWidth,
    inputWidth,
    regular,
    tip,
    textMap,
    initialPage
};
