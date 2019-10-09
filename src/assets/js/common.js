import baseConfig from '@/assets/js/config';
import {message} from 'antd';

// 字典转换
const getColumnStatus = (
    status,                 // 页面当前的状态值
    item = [],              // 字典
    keyName = 'label',      // 获取字典显示的名称
    keyValue = 'value'      // 字典的值和页面当前的值相同时返回 `label`
) => {
    if (status || status === 0 || status === false) {
        status = (status).toString();

        for (let i = 0, length = item.length; i < length; i += 1) {
            const value = item[i][keyValue];
            const name = item[i][keyName];

            if (value.toString() === status) {
                return name;
            } else if (status === 'true' || status === 'false') {
                if (value.toString() === status) {
                    return name;
                }
            }
        }
    }
    return '-';
};

const getColumnStatusTotal = (
    status,                 // 页面当前的状态值
    statusMap = [],         // 字典
    keyName = 'label',      // 获取字典显示的名称
    keyValue = 'value'      // 字典的值和页面当前的值相同时返回 `label`
) => {
    if (status || status === 0 || status === false) {
        status = status.toString();
        if (status.indexOf(',') !== -1) {
            const statusArr = status.split(',');
            const arr = [];
            statusArr.forEach(item => {
                const label = getColumnStatus(item, statusMap, keyName, keyValue);
                if (label) {
                    arr.push(label);
                }
            });
            return arr.toString();
        } else {
            return getColumnStatus(status, statusMap, keyName, keyValue);
        }
    } else {
        return '-';
    }
};

// 选择数量验证
const selectedValidate = (
    number = 1,          // 选择的数量 number = 1 单选 number >= 100 多选的意思
    selectedRows = [],
    message = message
) => {
    if (number < 100 && selectedRows.length > number) {
        message.info(baseConfig.tip.onlySelectOne);
        return false;
    } else if (selectedRows.length === 0) {
        message.info(baseConfig.tip.noSelect);
        return false;
    }
    return true;
};

// 精度加法
const accAdd = (num1, num2) => {
    var r1, r2, m;
    try {
        r1 = num1.toString().split('.')[1].length;
    } catch (e) {
        r1 = 0;
    }
    try {
        r2 = num2.toString().split('.')[1].length;
    } catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    // return (num1*m+num2*m)/m;
    return Math.round(num1 * m + num2 * m) / m;
};

// 精度加法
const accAdds = (...args) => {
    const arg = [...args];
    let sum = 0;
    for (let i = 0; i < arg.length; i++) {
        sum = accAdd(sum, arg[i] || 0);
    }
    return sum;
};

// 精度减法
const subtr = (arg1, arg2) => {
    arg1 = arg1 || 0;
    arg2 = arg2 || 0;
    var r1, r2, m, n;
    try {
        r1 = arg1.toString().split('.')[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split('.')[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

// 精度乘法
const accMul = (arg1, arg2) => {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        if (s1.indexOf('.') !== -1) {
            m += s1.split('.')[1].length;
        }
    } catch (e) {
        console.log(e);
    }
    try {
        if (s2.indexOf('.') !== -1) {
            m += s2.split('.')[1].length;
        }
    } catch (e) {
        console.log(e);
    }
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
};

/**
 * 金额显示
 * @param data
 * @param num
 * @returns {*}
 */
const toThousands = (data, num) => {
    var test = /\d{1,3}(?=(\d{3})+(\.\d*)?$)/g;
    if (data || data === 0) {
        if (typeof data === 'string' && data.length > 14) {
            // 字符串位数超长
            if (!num) {
                return data.replace(test, '$&,');
            } else {
                const n = data.replace(test, '$&,');
                var numArr = n.split('.');
                var decimal = (Number(numArr[1]) / 100).toFixed(num).toString(); // 0.56
                return numArr[0] + decimal.substring(decimal.indexOf('.'), decimal.length);
            }
        }
        if (!num) {
            var yuan = Number(data);
            var fixed0 = yuan.toFixed(0);
            var fixed1 = yuan.toFixed(1);
            var fixed2 = yuan.toFixed(2);

            if (Number(fixed0) === Number(fixed1) && Number(fixed1) === Number(fixed2)) {
                // 服务端数据感觉有问题会返回-0.003 => -0
                if(Number(fixed0) === 0) {
                    return Math.abs(fixed0.replace(test, '$&,'));
                } else {
                    return fixed0.replace(test, '$&,');
                }
            } else if (Number(fixed0) !== Number(fixed1) && Number(fixed1) === Number(fixed2)) {
                return fixed1.replace(test, '$&,');
            } else {
                return fixed2.replace(test, '$&,');
            }
        } else {
            return (parseFloat(data).toFixed(num) + '').replace(test, '$&,');
        }
    } else {
        return '-';
    }
};

const format = (time, format) => {
    let date = {
        'M+': time.getMonth() + 1,
        'd+': time.getDate(),
        'h+': time.getHours(),
        'm+': time.getMinutes(),
        's+': time.getSeconds(),
        'q+': Math.floor((time.getMonth() + 3) / 3),
        'S+': time.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in date) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1
                ? date[k] : ('00' + date[k]).substr(('' + date[k]).length));
        }
    }
    return format;
};

// 获取某个数组中，某个key对应的value的合
const getSomethingTotal = (
    key,
    list
) => {
    let value = 0;
    list.forEach(item => {
        if (item[key]) {
            value = accAdd(value, item[key]);
        }
    });
    return value;
};

// 设定某个关键字未key => 用于antd table
// 新增列表属性，todo 也可以增加某些统计
const listDataProcessing = (
    targetList = [],
    setKey = 'index'
) => {
    const list = [];
    targetList.forEach((item, index) => {
        item[setKey] = index;
        list.push(item);
    });

    return {
        list
    };
};

const getAge = (identityCard) => {
    var len = (identityCard + "").length;
    if (len == 0) {
        return 0;
    } else {
        if ((len != 15) && (len != 18))//身份证号码只能为15位或18位其它不合法
        {
            return 0;
        }
    }
    var strBirthday = "";
    if (len == 18)//处理18位的身份证号码从号码中得到生日和性别代码
    {
        strBirthday = identityCard.substr(6, 4) + "/" + identityCard.substr(10, 2) + "/" + identityCard.substr(12, 2);
    }
    if (len == 15) {
        strBirthday = "19" + identityCard.substr(6, 2) + "/" + identityCard.substr(8, 2) + "/" + identityCard.substr(10, 2);
    }
    //时间字符串里，必须是“/”
    var birthDate = new Date(strBirthday);
    var nowDateTime = new Date();
    var age = nowDateTime.getFullYear() - birthDate.getFullYear();
    //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
    if (nowDateTime.getMonth() < birthDate.getMonth() || (nowDateTime.getMonth() == birthDate.getMonth() && nowDateTime.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const trim = (params) => {
    return params.replace(/(^\s*) | (\s*$) | (\\b*$) | (^\\b*)/g,'')
};

export {
    getColumnStatus,        // 字段map
    getColumnStatusTotal,   // 字段map（集合）
    selectedValidate,       // 选择数量验证
    getSomethingTotal,      // 计算指定字段的求和
    accAdd,                 // 两个数加法
    accAdds,                // 多个数加法
    accMul,                 // 乘法
    subtr,
    toThousands,            // 千分位
    format,                 // 格式化日期
    listDataProcessing,     // 自增 antd table id标识
    getAge,                 // 根据身份证算年龄
    trim,                   // 去掉空格
}
