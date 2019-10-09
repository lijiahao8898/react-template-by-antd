import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Form, Button, Input, message, Icon} from 'antd';
// function
import Api from '@/api/index';
import Cookies from 'js-cookie';
import baseConfig from '@/assets/js/config';
// component

// style
import './resetPwd.scss';

const FormItem = Form.Item;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class ResetPwd extends Component {
    constructor (props, context) {
        super(props, context);
        this.state = {
            isAjax: false
        };
        this.wrapperRef = React.createRef();
    }

    componentDidMount () {
        // Cookies.set('ifInit', 'true');
        this.wrapperRef.current.style.height = `${window.innerHeight - 10}px`;
    }

    resetPassword () {
        this.props.form.resetFields()
    }

    submit (e) {
        e.preventDefault();
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                if (this.state.isAjax) {
                    message.info('请勿重复提交！');
                    return;
                }
                // console.log(value);
                const {oldPwd, newPwd, newPwdDouble} = value;
                if (newPwd !== newPwdDouble) {
                    message.info('两次输入的新密码不一致，请重新输入');
                    return;
                }
                this.setState({isAjax: true});
                const data = await Api('put', 'changePassword', {
                    oldPwd,
                    newPwd
                });
                this.setState({isAjax: false});
                if (data.success) {
                    message.success('修改密码成功！');
                    Cookies.set('ifInit', 'false');
                    this.props.isInitPassword({
                        ifInit: 'false'
                    });
                }
            }
        });
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {isAjax} = this.state;
        const {regular} = baseConfig;
        return (
            <div className="reset-password" ref={this.wrapperRef} id="wrap">
                <div className="reset-password-wrapper">
                    <div className="reset-password-title">修改密码</div>
                    <Form onSubmit={this.submit.bind(this)} className="reset-password-form">
                        <div className="reset-password-form__container">
                            <FormItem>
                                {getFieldDecorator('oldPwd', {
                                    rules: [{required: true, message: '请输入旧密码!'}],
                                })(
                                    <Input
                                        className="no-radius"
                                        placeholder="请输入旧密码"
                                        type="password"
                                        size="large"
                                        addonBefore={<Icon type="lock"/>}
                                    />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('newPwd', {
                                    rules: [{
                                        required: true, message: '请输入新密码!'
                                    }, {
                                        pattern: regular.pwd, message: '密码格式不正确，需由8~20位的数字和字母组成'
                                    }],
                                })(
                                    <Input
                                        className="no-radius"
                                        placeholder="请输入新密码"
                                        type="password"
                                        size="large"
                                        addonBefore={<Icon type="lock"/>}
                                    />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('newPwdDouble', {
                                    rules: [{
                                        required: true, message: '请再次输入新密码!'
                                    }, {
                                        pattern: regular.pwd, message: '密码格式不正确，需由8~20位的数字和字母组成'
                                    }],
                                })(
                                    <Input
                                        className="no-radius"
                                        placeholder="请再次输入新密码"
                                        type="password"
                                        size="large"
                                        addonBefore={<Icon type="lock"/>}
                                    />
                                )}
                            </FormItem>
                            <FormItem>
                                <Button
                                    type="primary"
                                    className="reset-password-form__button submit"
                                    htmlType="submit" loading={isAjax}
                                >{isAjax ? '正在拼命修改密码中...' : '修改密码'}
                                </Button>
                                <Button
                                    className="reset-password-form__button reset"
                                    onClick={this.resetPassword.bind(this)}
                                >重置</Button>
                            </FormItem>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}

ResetPwd = Form.create()(ResetPwd);

export default connect(mapStateToProps, mapDispatchToProps)(ResetPwd);