import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Form, Button, Input, message, Icon} from 'antd';
// function
import Api from '@/api/index';
import Cookies from 'js-cookie';
// component
import LoginCarousel from './loginCarousel/loginCarousel';
// style
import './login.scss';

const FormItem = Form.Item;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        action: bindActionCreators(action, dispatch)
    };
};

class Login extends Component {
    constructor (props, context) {
        super(props, context);
        this.state = {
            isAjax: false
        };
        this.wrapperRef = React.createRef();
    }

    componentDidMount () {
        this.wrapperRef.current.style.height = `${window.innerHeight}px`;
    }

    submit (e) {
        e.preventDefault();
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                if (this.state.isAjax) {
                    message.info('请勿重复提交！');
                    return;
                }
                this.setState({isAjax: true});
                const data = await Api('post', 'getToken', value);
                if (data.success) {
                    const {userName, ifInit, userMobile} = data.datas.userInfo;

                    Cookies.set('token', data.datas.token);
                    Cookies.set('un', userName);
                    Cookies.set('ifInit', ifInit);
                    Cookies.set('m', userMobile);

                    message.success('登录成功！正在跳转中...', 0.5);
                    await this.props.action.getMenuList();
                    this.props.action.isInitPassword({
                        ifInit
                    });
                    const {menu} = this.props.menuList;
                    let route;
                    if (Login.USELESS_isHasAccountPower(menu)) {
                        // 兼容性修改 以后要删除
                        route = '/app/account';
                    } else {
                        route = Login.getRoute(menu);
                    }
                    setTimeout(() => {
                        this.setState({isAjax: false});
                        if (ifInit === 'true') {
                            // 是初始密码
                            this.props.history.push('app/resetPassword');
                        } else {
                            this.props.history.push(route);
                        }
                    }, 1000);
                } else {
                    this.setState({isAjax: false});
                }
            }
        });
    }

    // 兼容性修改 - 由于服务端菜单权限没有排序的功能 - 导致页面加载的时候菜单的顺序不是产品经理想要的
    // 如果有账户管理跳转到账户管理
    static USELESS_isHasAccountPower (menu) {
        const childrens = menu.childrens[0];
        for (let i = 0; i < childrens.childrens.length; i++) {
            if (childrens.childrens[i].model.menuHref === 'app.account') {
                return true;
            }
        }
        return false;
    }

    // 根据配置的权限进行页面跳转
    static getRoute (menu) {
        const childrens = menu.childrens[0];
        let route = null;
        if (childrens) {
            if (childrens.model.menuHref && childrens.model.menuType === 1) {
                route = childrens.model.menuHref.replace(/\./g, '/');
            } else {
                for (let i = 0; i < childrens.childrens.length; i++) {
                    if (childrens.childrens[i].model.menuHref && childrens.childrens[i].model.menuType === 1) {
                        route = childrens.childrens[i].model.menuHref.replace(/\./g, '/');
                        return `/${route}`;
                    }
                }
            }
        } else {
            route = 'app/index';
        }
        return `/${route}`;
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {isAjax} = this.state;

        return (
            <div className="login" ref={this.wrapperRef} id="wrap">
                <div className="login-bg img" id="bg">
                    <LoginCarousel/>
                </div>
                <div className="login-wrapper">
                    <div className="login-title">催收中心</div>
                    <Form onSubmit={this.submit.bind(this)} className="login-form">
                        <div className="login-form__container">
                            <FormItem>
                                {getFieldDecorator('username', {
                                    rules: [{required: true, message: '请输入用户名!'}],
                                })(
                                    <Input
                                        className="no-radius"
                                        placeholder="请输入用户名"
                                        type='text'
                                        size="large"
                                        addonBefore={<Icon type="user"/>}
                                    />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('password', {
                                    rules: [{required: true, message: '请输入密码!'}],
                                })(
                                    <Input
                                        className="no-radius"
                                        placeholder="请输入密码"
                                        type="password"
                                        size="large"
                                        addonBefore={<Icon type="lock"/>}
                                    />
                                )}
                            </FormItem>
                            <FormItem>
                                <Button type="primary"
                                        className="login-form__button"
                                        htmlType="submit" loading={isAjax}>{isAjax ? '正在拼命登录中...' : '登录'}</Button>
                            </FormItem>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}

Login = Form.create()(Login);

export default connect(mapStateToProps, mapDispatchToProps)(Login);
