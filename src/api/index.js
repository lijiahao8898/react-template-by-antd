import axios from 'axios';
import {message} from 'antd';
import Qs from 'qs';
import Api from './config';
import Cookies from 'js-cookie';

let httpArr = {};
let cancelToken = axios.CancelToken;
let limit = 500;

axios.interceptors.request.use(config => {
    let now = +new Date();
    let key = config.method + config.url;
    let params = config.method === 'get' ? JSON.stringify(config.params) : JSON.stringify(config.data);
    let cancelFun;
    const token = Cookies.get('token');
    // const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDE5MCIsImV4cCI6MTU2NzU4MTUxOSwiaWF0IjoxNTY3NDk1MTE5LCJkYXRhcyI6eyJ1c2VyUGFyZW50SWQiOiJudWxsIiwidXNlck1vYmlsZSI6IjE4ODE0ODg0MDk1IiwidXNlclBvc3RJZCI6Im51bGwiLCJ1c2VyRm9yY2Vtb2RpZnlwc3ciOiJmYWxzZSIsInVzZXJUeXBlIjoiMiIsInVzZXJOYW1lIjoi5p2O5a626LGqIiwidXNlcklkIjoiMTAxOTAiLCJ1c2VyT3JnSWQiOiIxMDAyNSJ9LCJqdGkiOiIyODU4ODc3OTc0OTA1MTQxIn0.s6LLUgGcYsGJqDktzDrSbyFt1AMULsF8IpODCtDq0Nc'
    token && (config.headers['Authorization'] = `${token}`);

    config.cancelToken = new cancelToken((cancel) => {
        // 获取取消请求方法
        cancelFun = cancel;
    });
    if (httpArr[key] && httpArr[key].params === params && httpArr[key].start + limit > now) {
        cancelFun();
    } else {
        if (httpArr[key] && httpArr[key].params === params && httpArr[key].start + limit <= now) {
            httpArr[key].cancel();
        }
        httpArr[key] = {
            start: +new Date(),
            params: params,
            cancel: cancelFun
        };
    }
    return config;
}, error => {
    return Promise.reject(error);
});

axios.interceptors.response.use(response => {
    // let config = response.config;
    // let key = config.method + config.url;
    // if(httpArr[key]) {
    //     delete httpArr[key];
    // }
    if (Object.prototype.toString.call(response.data) === '[object Blob]') {
        var reader = new FileReader();
        reader.onload = (event) => {
            try {
                if (reader.result.indexOf('i18nMessage') > 0) {
                    const content = JSON.parse(reader.result);
                    if (content.success === false && content.i18nMessage) {
                        response.data = content;
                        message.error(response.data.i18nMessage);
                    }
                }
                return response;
            } catch (error) {
                // console.log(error);
                return response;
            }
        };
        reader.readAsText(response.data);
    } else if (!response.data.success && response.config.responseType !== 'blob') {
        message.error(response.data.i18nMessage);
        return Promise.reject(response);
    }
    return response;
}, error => {
    let msg = null;
    if (error.response) {
        console.log(error);
        switch (error.response.status) {
            case 400:
                msg = '400：请求错误！';
                break;
            case 401:
                msg = '401：接口无权限访问！';
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
                break;
            case 403:
                msg = '403：拒绝访问';
                break;
            case 404:
                msg = '404：接口请求不存在！';
                break;
            case 500:
                msg = '500：服务器内部错误';
                break;
            case 501:
                msg = '501：服务未实现';
                break;
            case 502:
                msg = '502：网关错误';
                break;
            case 503:
                msg = '503：服务不可用';
                break;
            case 504:
                msg = '504：网关超时';
                break;
            case 505:
                msg = '505：HTTP版本不受支持';
                break;
            default:
                break;
        }
        message.error(msg);
    }
    return Promise.reject(error);
});

/**
 * 接口请求
 * @param method        请求方式默认 GET
 * @param url           如果类型为字符串直接使用apiList里面的url，否则【对象】直接使用服务端地址 【任意位置】
 * @param params        请求参数
 * @param isLinkParams  请求带在URL上【最后一个】
 * @param ParamsKey     请求带在URL上的关键字【最后一个】
 * @returns {Promise.<T>|*}
 */
export default function (method = 'GET', url, params, isLinkParams = false, ParamsKey) {
    let URL = null;
    if (Object.prototype.toString.call(url) === '[object String]') {
        if(typeof Api[url] === 'function') {
            URL = `${Api.domain}${Api[url](params)}`
        } else {
            URL = `${Api.domain}${Api[url]}`;
        }
    } else {
        URL = `${Api.domain}${url.serviceUrl}`; // 服务端地址无规律可循的时候
    }
    if (method.toUpperCase() === 'GET') {
        // 暂时认为linkParams只会是一个参数，且使用get.
        return axios({
            method: method,
            url: isLinkParams ? `${URL}/${params[ParamsKey]}` : URL,
            params: params,
            timeout: Api.timeout,
            headers: Api.headers
        }).then(response => {
            return response.data;
        }).catch(error => {
            return error;
        });
    } else if (method.toUpperCase() === 'LINK') {
        // 下载文件
        // axios
        return axios({
            method: 'get',
            url: URL,
            params: params,
            timeout: Api.timeout,
            headers: Api.headers,
            responseType: 'blob'
        }).then(res => {
            let contentType = res.headers['content-type'];
            // 这里res.data是返回的blob对象
            const blob = new Blob([res.data], {type: contentType});
            // 从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
            const contentDisposition = res.headers['content-disposition'];
            const patt = new RegExp('filename=([^;]+\\.[^\\.;]+);*');
            const result = patt.exec(contentDisposition);
            const filename = result[1];
            const downloadElement = document.createElement('a');
            // 创建下载的链接
            const href = window.URL.createObjectURL(blob);
            downloadElement.style.display = 'none';
            downloadElement.href = href;
            // 下载后文件名
            downloadElement.download = decodeURIComponent(filename);
            document.body.appendChild(downloadElement);
            // 点击下载
            downloadElement.click();
            // 下载完成移除元素
            document.body.removeChild(downloadElement);
            // 释放掉bl
            window.URL.revokeObjectURL(href);
        }).catch(error => {
            return error;
        });
        // 原生js
        // const token = Cookies.get('token');
        // const xhr = new XMLHttpRequest();
        // const formData = new FormData();
        // for(let key in params) {
        //     if(params[key]) {
        //         formData.append(key, params[key])
        //     }
        // }
        // xhr.open('get', `${Api.domain}${Api[url]}?${queryString.stringify(params)}`, true);
        // xhr.setRequestHeader("Authorization", token);
        // xhr.responseType = 'blob';
        // xhr.onload = function (e) {
        //     if (this.status === 200) {
        //         const blob = this.response;
        //         const reader = new FileReader();
        //         reader.readAsDataURL(blob);
        //         reader.onload = function (e) {
        //             const a = document.createElement('a');
        //             a.setAttribute('id', 'downloadTag');
        //             a.download = filename || 'data.xls';
        //             a.href = e.target.result;
        //             const body = document.getElementsByTagName('body')[0];
        //             body.append(a);
        //             a.click();
        //             const downloadTag = document.getElementById('downloadTag');
        //             downloadTag.parentNode.removeChild(downloadTag);
        //         }
        //     }
        // };
        // xhr.send(formData);
    } else if (method.toUpperCase() === 'UPLOAD') {
        // 上传
        // console.log(Api.headers)
        return axios({
            method: 'POST',
            url: URL,
            data: params,
            timeout: Api.timeout,
            headers: Api.headers
        }).then(response => {
            return response.data;
        }).catch(error => {
            return error;
        });
    } else if (method.toUpperCase() === 'DOWNLOAD') {
        // 下载文件
        // axios
        return axios({
            method: 'get',
            url: URL,
            params: params,
            timeout: Api.timeout,
            headers: Api.headers,
        }).then(res => {
           console.log(111)
        }).catch(error => {
            return error;
        });
    } else {
        return axios({
            method: method,
            url: URL,
            data: Qs.stringify(params),
            timeout: Api.timeout,
            headers: Api.headers
        }).then(response => {
            return response.data;
        }).catch(error => {
            return error;
        });
    }
}
