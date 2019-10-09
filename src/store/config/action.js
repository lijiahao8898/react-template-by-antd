import * as configAction from './action-type';


export const initGlobalConfig = (cfg) => {
    return {
        type: configAction.GLOBAL_CFG,
        listButtonConfig: cfg
    }
};

export const initGlobalJumpUrl = (cfg) => {
    let jumpUrl = null;
    const host = window.location.host;
    if(host.indexOf('plms-webapp-dev') > -1) {
        // dev
        jumpUrl = '192.168.1.39:10081'
    } else if (host.indexOf('plms-webapp-master') > -1) {
        // master
        jumpUrl = '192.168.1.39:10010'
    } else if (host.indexOf('plms.jyc99.com') > -1) {
        // online
        jumpUrl = 'mg.jyc99.com'
    } else {
        // localhost
        jumpUrl = '192.168.1.39:10010'
    }
    return {
        type: configAction.GLOBAL_JUMP_URL,
        jumpUrl: jumpUrl
    }
};
