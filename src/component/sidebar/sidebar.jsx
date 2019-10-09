import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import action from '@/store/action';
import {Layout, Menu, Icon} from 'antd';
import './sidebar.scss';
import Cookies from 'js-cookie';

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(action, dispatch);
};

const SubMenu = Menu.SubMenu;
const {Sider} = Layout;

class Sidebar extends Component {
    constructor (props) {
        super(props);
        this.state = {
            defaultOpenKeys: [],
            selectedKeys: []
        };
        this.un = Cookies.get('un');
    }

    componentDidMount () {
        const ifInit = Cookies.get('ifInit');
        this.props.isInitPassword({ifInit: ifInit
        });
        this.props.history.listen(location => {
            this.props.getCurrentMenu(this.props);
        })
    }

    changePage ({item, key, keyPath}) {
        // 点击的时候讲当前打开的菜单栏传递下去
        const defaultOpenKeys = this.props.menuList.defaultOpenKeys || [];
        this.props.getCurrentMenu(null, defaultOpenKeys, [key]);
    }

    changeOpenKeys (openKeys) {
        const currentOpenKeys = new Set(openKeys);
        this.props.getCurrentMenu(null, [...currentOpenKeys]);
    }

    onSelectKeys (item, key, selectedKeys) {}

    goToPage (href) {
        return `/${href.replace(/\./g, '/')}`;
    }

    async logout () {
        // 服务端人员说不用请求接口
        Cookies.remove('token');
        Cookies.remove('un');
        Cookies.remove('ifInit');
        this.props.history.push('/login')
    }

    // 获取子页面的页面菜单数量
    getPageChildrenItemLength (list) {
        let n = 0;
        list.forEach(item => {
            if(item.model.menuType === 1) {
                n ++
            }
        });
        return n;

    }

    render () {
        let menu = null;
        let defaultOpenKeys = [];
        let defaultSelectedKeys = [];

        if (this.props.menuList.step === 'success') {
            const menuList = this.props.menuList.menu;
            defaultOpenKeys = this.props.menuList.defaultOpenKeys || [];
            defaultSelectedKeys = this.props.menuList.defaultSelectedKeys;

            menu = menuList.childrens.map((item) => {
                const {model} = item;
                const number = this.getPageChildrenItemLength(item.childrens);

                if (item.childrens && item.childrens.length > 0 && number > 0) {
                    return (
                        <SubMenu key={model.id} title={<span>
                            {model.menuIconclass && <Icon type={model.menuIconclass}/>}
                            <span>{model.menuName}</span></span>}>

                            {item.childrens.map((i) => {
                                const modelI = i.model;
                                if (i.childrens && i.childrens.length > 0 && i.childrens[0].model.menuType === 1) {
                                    return (
                                        <SubMenu key={modelI.id} title={<span>
                                            {modelI.menuIconclass && <Icon type={modelI.menuIconclass}/>}
                                            <span>{modelI.menuName}</span></span>}>

                                            {i.childrens.map((o) => {
                                                const modelO = o.model;

                                                return (
                                                    <Menu.Item key={modelO.id}>
                                                        {modelO.menuIconclass && <Icon type={modelO.menuIconclass}/>}
                                                        <span>{modelO.menuName}</span>
                                                        <Link to={this.goToPage(modelO.menuHref)}>&nbsp;</Link>
                                                    </Menu.Item>
                                                );
                                            })}

                                        </SubMenu>
                                    );
                                } else {
                                    if(modelI.menuType === 1) {
                                        return (
                                            <Menu.Item key={modelI.id}>
                                                {modelI.menuIconclass && <Icon type={modelI.menuIconclass}/>}
                                                <span>{modelI.menuName}</span>
                                                <Link to={this.goToPage(modelI.menuHref)}>&nbsp;</Link>
                                            </Menu.Item>
                                        );
                                    } else {
                                        return null
                                    }
                                }
                            })}
                        </SubMenu>
                    );
                } else {

                    return (
                        <Menu.Item key={model.id}>
                            {model.menuIconclass && <Icon type={model.menuIconclass}/>}
                            <span>{model.menuName}</span>
                            <Link to={this.goToPage(model.menuHref)}>&nbsp;</Link>
                        </Menu.Item>
                    )
                }
            });
        }
        const {ifInit} = this.props.menuList;

        return (
            <Sider className="sidebar" width="220"
                   collapsible
                   collapsed={this.props.collapsed}
                   onCollapse={this.props.onCollapse}>
                <div className="sidebar-wrapper">
                    <div className={`logo ${this.props.collapsed ? 'collapsed' : ''}`}
                         style={{height: this.props.collapsed ? '44px' : '44px'}}>
                    </div>
                    <div className={`system-name ${this.props.collapsed ? 'collapsed' : ''}`}>催收中心</div>
                </div>
                <div className={`sidebar-userinfo ${this.props.collapsed ? 'collapsed' : ''}`}>{`hello， ${this.un}！`}</div>
                <Menu
                    mode="inline"
                    theme="dark"
                    openKeys={defaultOpenKeys}
                    selectedKeys={defaultSelectedKeys}
                    onClick={this.changePage.bind(this)}
                    onOpenChange={this.changeOpenKeys.bind(this)}
                    onSelect={this.onSelectKeys.bind(this)}>
                    {(this.props.menuList.step === 'success' && ifInit === 'false') && menu}
                    <Menu.Item>
                        <Icon type="key" />
                        <span>修改密码</span>
                        <Link to='/app/resetPassword'>&nbsp;</Link>
                    </Menu.Item>
                    <Menu.Item onClick={this.logout.bind(this)}>
                        <Icon type="logout"/>
                        <span>退出登录</span>
                    </Menu.Item>
                </Menu>
            </Sider>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Sidebar));

