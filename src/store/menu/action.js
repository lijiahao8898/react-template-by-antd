import Api from '@/api/index';
import * as menuAction from './action-type';

// 获取按钮权限
function getPowerItem (
    obj,
    menu
) {
    for (let n = 0; n < menu.childrens.length; n++) {
        let child = menu.childrens[n];
        if (child.model.menuCode) {
            obj[child.model.menuCode] = true;
        }
        getPowerItem(obj, child);
    }
    return obj;
}

// 获取高亮菜单
function getDefaultActiveMenu (
    menu
) {
    let defaultSelectedKeys, defaultOpenKeys, currentMenu;

    // /app/channel =>  .app.channel
    let path = window.location.pathname.replace(/\//g, '.');

    menu.childrens.forEach(item => {
        const itemMenuHref = item.model.menuHref;
        const itemId = (item.model.id).toString();

        if (itemMenuHref && path.indexOf(`.${itemMenuHref}`) !== -1) {
            defaultSelectedKeys = [itemId];
            defaultOpenKeys = [itemId];
            currentMenu = menu;
        }
        item.childrens.forEach(i => {
            const iMneuHref = i.model.menuHref;
            const iId = (i.model.id).toString();
            if (iMneuHref && path.indexOf(`.${iMneuHref}`) !== -1) {
                if (i.model.menuType === 2) {
                    // 隐藏菜单
                    defaultSelectedKeys = [itemId];
                    defaultOpenKeys = [itemId];
                } else {
                    defaultSelectedKeys = [iId];
                    defaultOpenKeys = [itemId];
                }
                currentMenu = menu;
            }
        });
    });

    return {
        defaultSelectedKeys,
        defaultOpenKeys,
        currentMenu
    };
}

// 初始化登录导航数据
export const getMenuList = () => {
    return async (dispatch, getState) => {
        dispatch(pending('pending'));
        const data = await Api('get', 'getMenuList');
        let powerList = {};
        if (data.success) {
            const result = data.datas.content;
            const {defaultSelectedKeys, defaultOpenKeys, currentMenu} = getDefaultActiveMenu(result);
            // 获取按钮权限
            powerList = Object.assign({}, getPowerItem({}, result));

            dispatch(success({
                dataList: result,
                powerList: powerList,
                currentMenu: currentMenu,
                defaultSelectedKeys: defaultSelectedKeys,
                defaultOpenKeys: defaultOpenKeys,
                step: 'success'
            }));
        } else {
            dispatch(error('error'));
        }
    };
};

export const getCurrentMenu = (props = null, currentOpenKeys = null, currentSelectKeys = null) => {
    let defaultSelectedKeys = [], defaultOpenKeys = [];
    currentOpenKeys && (defaultOpenKeys = currentOpenKeys);
    currentSelectKeys && (defaultSelectedKeys = currentSelectKeys);
    if (props) {
        const obj = getDefaultActiveMenu(props.menuList.menu);
        defaultOpenKeys = obj.defaultOpenKeys;
        defaultSelectedKeys = obj.defaultSelectedKeys;
    }
    // console.log(defaultOpenKeys);
    // console.log(defaultSelectedKeys);
    return {
        type: menuAction.UPDATE_CURRENT_MENU,
        defaultSelectedKeys: defaultSelectedKeys,
        defaultOpenKeys: defaultOpenKeys,
    };
};

export const updateMenu = (id, props) => {
    let menu = props.menuList.menu;
    let defaultSelectedKeys = [], defaultOpenKeys = [], currentMenu;
    let path = window.location.pathname.replace(/\//g, '.');
    menu.childrens.forEach(item => {
        if (item.id === Number(id)) {
            currentMenu = item;
            item.childrens.forEach(i => {
                i.childrens.forEach(o => {
                    if (`.${o.menuHref}` === path) {
                        defaultSelectedKeys = [(o.id).toString()];
                        defaultOpenKeys = [(i.id).toString()];
                    }
                });
            });
        }
    });
    return {
        type: menuAction.UPDATE_MENU_PROJECTID,
        dataList: menu,
        currentMenu: currentMenu,
        defaultSelectedKeys: defaultSelectedKeys,
        defaultOpenKeys: defaultOpenKeys,
    };
};

export const pending = (step) => {
    return {
        type: menuAction.GET_MENU_PENDING,
        step: step
    };
};

export const success = (data) => {
    return {
        type: menuAction.GET_MENU_SUCCESS,
        data: data
    };
};

export const error = (step) => {
    return {
        type: menuAction.GET_MENU_ERROR,
        step: step
    };
};

export const isInitPassword = (data) => {
    return {
        type: menuAction.GET_IF_INIT,
        data: {
            ...data
        }
    };
};
