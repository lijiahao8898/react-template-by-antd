import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Menu, Dropdown, Icon} from 'antd';
import {withRouter} from "react-router-dom";
import './header.scss';
import Api from '@/api/index';
import Cookies from 'js-cookie';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class Header extends Component {
    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick ({key}) {
        this.props.updateMenu(key, this.props)
    }

    async logout () {
        // const data = await Api('post', 'getLogout');
        // if(data.success) {
        // 服务端人员说不用请求接口
        Cookies.remove('token');
        Cookies.remove('un');
        this.props.history.push('/login')
        // }
    }

    render () {
        const list = this.props.menuList;
        if (list && list.menu) {
            // const MenuItem = list.menu.childrens.map(item => {
            //     return (
            //         <Menu.Item key={item.id}>
            //             <a>{item.name}</a>
            //         </Menu.Item>
            //     )
            // });

            // 接口返回的menu
            // const menu = (
            //     <Menu onClick={this.onClick}>
            //         {MenuItem}
            //     </Menu>
            // );

            const menuUser = (
                <Menu>
                    <Menu.Item key="0">
                        <div style={{fontSize: '14px'}} onClick={this.logout.bind(this)}><Icon type="logout"/>&nbsp;&nbsp;退出登录</div>
                    </Menu.Item>
                </Menu>
            );
            return (
                <div className="header fr">
                    {this.props.children}
                    {/*<div className="header-dropdown">*/}
                        {/*<Dropdown overlay={menu}>*/}
                            {/*<a className="ant-dropdown-link">*/}
                                {/*切换系统<Icon type="down" />*/}
                            {/*</a>*/}
                        {/*</Dropdown>*/}
                    {/*</div>*/}
                    <div className="fr">
                        <Dropdown overlay={menuUser}>
                            <div className="user-icon"></div>
                        </Dropdown>
                    </div>
                </div>
            );
        }else {
            return null
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
