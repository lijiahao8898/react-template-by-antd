import * as menuAction from './action-type';

const initData = {
    menu: {                     // 菜单
        childrens: []
    },
    projectId: '',              // 选择的项目的id
    defaultOpenKeys: [],        // 初始展开的 SubMenu 菜单项 key 数组
    defaultSelectedKeys: [],    // 初始选中的菜单项 key 数组
    currentMenu: [],            // 当前项目的menu
    powerList: {},              // 菜单按钮级别的权限list
    step: 'pending',
    ifInit: 'true'              // 是否是初始密码
};

export const menuList = (state = initData, action) => {
    switch (action.type) {
        case menuAction.GET_MENU_PENDING:
            return state;
        case menuAction.GET_MENU_SUCCESS:
            return Object.assign({}, state, {
                menu: action.data.dataList,
                currentMenu: action.data.currentMenu,
                defaultSelectedKeys: action.data.defaultSelectedKeys,
                defaultOpenKeys: action.data.defaultOpenKeys,
                powerList: action.data.powerList,
                step: action.data.step
            });
        case menuAction.GET_MENU_ERROR:
            return Object.assign({}, state, {
                step: action.step
            });
        case menuAction.UPDATE_MENU_PROJECTID:
            return Object.assign({}, state, {
                menu: action.dataList,
                currentMenu: action.currentMenu,
                defaultSelectedKeys: action.defaultSelectedKeys,
                defaultOpenKeys: action.defaultOpenKeys,
            });
        case menuAction.UPDATE_CURRENT_MENU:
            const obj = {};
            if(action.defaultSelectedKeys && action.defaultSelectedKeys.length > 0) {
                obj.defaultSelectedKeys = action.defaultSelectedKeys
            }
            //if(action.defaultOpenKeys.length > 0) {
                obj.defaultOpenKeys = action.defaultOpenKeys;
            //}
            return Object.assign({}, state, obj);
        case menuAction.GET_IF_INIT:
            return Object.assign({}, state, action.data);
        default:
            return state
    }
};