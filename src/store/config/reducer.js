import * as configAction from './action-type';

const initData = {
    size: 'small',
    type: 'primary',
    ghost: true,
    style: {
        fontSize: '12px'
    },
    jumpUrl: ''
};

export const initListBtnCfg = (state = initData, action) => {
    switch (action.type) {
        case configAction.GLOBAL_CFG:
            return state;
        case configAction.GLOBAL_JUMP_URL:
            return Object.assign({}, state, {
                jumpUrl: action.jumpUrl
            });
        default:
            return state;
    }
};
